from pathlib import Path
from pypdf import PdfReader
from docx import Document as DocxDocument

def extract_text(path: Path, suffix: str) -> str:
    suffix = suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".docx":
        doc = DocxDocument(str(path))
        return "\n".join(p.text for p in doc.paragraphs)
    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore")
    raise ValueError("Supported formats: PDF, DOCX, TXT")
