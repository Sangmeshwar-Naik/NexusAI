import re
from collections import Counter
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import current_user
from app.models.user import User
from app.models.document import Document

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

STOPWORDS = {
    "the", "and", "to", "of", "a", "in", "for", "is", "on", "that", "by", "this", "with",
    "i", "you", "it", "not", "or", "be", "are", "from", "at", "as", "your", "all", "have",
    "new", "more", "an", "was", "we", "will", "my", "our", "their", "so", "can", "if", "but"
}

@router.get("")
def get_knowledge_overview(db: Session = Depends(get_db), user: User = Depends(current_user)):
    docs = db.query(Document).filter(Document.owner_id == user.id).all()
    
    # Extract top keywords and topics
    all_words = []
    for d in docs:
        words = re.findall(r"\b[a-zA-Z]{4,}\b", d.extracted_text.lower())
        all_words.extend([w for w in words if w not in STOPWORDS])
    
    counts = Counter(all_words)
    top_topics = [{"term": word, "frequency": freq} for word, freq in counts.most_common(12)]
    
    collections = [
        {"name": "Core Documentation", "count": sum(1 for d in docs if "doc" in d.filename.lower() or "txt" in d.filename.lower()), "color": "violet"},
        {"name": "Strategic Briefs", "count": sum(1 for d in docs if "strat" in d.filename.lower() or "plan" in d.filename.lower()), "color": "blue"},
        {"name": "Legal & Contracts", "count": sum(1 for d in docs if "contract" in d.filename.lower() or "nda" in d.filename.lower() or "agree" in d.filename.lower()), "color": "amber"},
        {"name": "Research & Reports", "count": sum(1 for d in docs if "pdf" in d.filename.lower()), "color": "green"},
    ]

    return {
        "total_documents": len(docs),
        "topics": top_topics,
        "collections": collections,
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "preview": d.extracted_text[:240].strip() if d.extracted_text else "No preview available",
                "characters": len(d.extracted_text),
                "created_at": d.created_at,
            }
            for d in docs
        ],
    }

@router.get("/search")
def search_knowledge(q: str = Query(min_length=2), db: Session = Depends(get_db), user: User = Depends(current_user)):
    docs = db.query(Document).filter(Document.owner_id == user.id).all()
    matches = []
    query_lower = q.lower()

    for d in docs:
        text = d.extracted_text or ""
        lines = text.split("\n")
        matching_lines = []
        for idx, line in enumerate(lines):
            if query_lower in line.lower():
                matching_lines.append({
                    "line_number": idx + 1,
                    "snippet": line.strip()[:200],
                })
        if matching_lines:
            matches.append({
                "document_id": d.id,
                "filename": d.filename,
                "match_count": len(matching_lines),
                "excerpts": matching_lines[:3],
            })

    return {
        "query": q,
        "total_matches": sum(m["match_count"] for m in matches),
        "matching_documents": matches,
    }
