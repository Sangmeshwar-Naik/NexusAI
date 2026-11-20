from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import current_user
from app.models.user import User
from app.models.document import Document
from app.core.config import settings
from app.services.documents import extract_text

router = APIRouter(prefix="/documents", tags=["Documents"])
ALLOWED = {".pdf", ".docx", ".txt"}
MAX_BYTES = 15 * 1024 * 1024

@router.post("")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(current_user)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED:
        raise HTTPException(415, "Only PDF, DOCX and TXT files are supported")
    data = await file.read()
    if not data or len(data) > MAX_BYTES:
        raise HTTPException(413, "File is empty or exceeds the 15 MB limit")
    upload_dir = Path(settings.upload_dir) / str(user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid4().hex}{suffix}"
    path = upload_dir / safe_name
    path.write_bytes(data)
    try:
        text = extract_text(path, suffix)
    except Exception as exc:
        path.unlink(missing_ok=True)
        raise HTTPException(422, f"Could not extract document text: {exc}")
    if not text.strip():
        path.unlink(missing_ok=True)
        raise HTTPException(422, "No readable text found. Scanned PDFs need OCR, which is not included yet.")
    doc = Document(owner_id=user.id, filename=Path(file.filename or safe_name).name,
                   content_type=file.content_type or "application/octet-stream",
                   size_bytes=len(data), stored_path=str(path), extracted_text=text[:2_000_000])
    db.add(doc); db.commit(); db.refresh(doc)
    return {"id": doc.id, "filename": doc.filename, "size_bytes": doc.size_bytes, "characters": len(text)}

@router.get("")
def list_documents(db: Session = Depends(get_db), user: User = Depends(current_user)):
    docs = db.query(Document).filter(Document.owner_id == user.id).order_by(Document.created_at.desc()).all()
    return [{"id": d.id, "filename": d.filename, "size_bytes": d.size_bytes, "created_at": d.created_at} for d in docs]

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    doc = db.query(Document).filter(Document.id == document_id, Document.owner_id == user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    Path(doc.stored_path).unlink(missing_ok=True)
    db.delete(doc); db.commit()
    return {"message": "Document deleted"}
