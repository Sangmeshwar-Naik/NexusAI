import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import current_user
from app.models.user import User
from app.models.integration import Integration

router = APIRouter(prefix="/integrations", tags=["Integrations"])

DEFAULT_INTEGRATIONS = [
    {
        "key": "openai",
        "name": "OpenAI / GPT-4o Gateway",
        "category": "LLM Provider",
        "is_connected": True,
        "config_json": json.dumps({"model": "gpt-4o-mini", "status": "active"}),
        "last_synced_at": "Connected & operational",
    },
    {
        "key": "gdrive",
        "name": "Google Drive Sync",
        "category": "Storage",
        "is_connected": False,
        "config_json": json.dumps({"folder": "Nexus Documents", "auto_sync": True}),
        "last_synced_at": "Not connected",
    },
    {
        "key": "slack",
        "name": "Slack Knowledge Bot",
        "category": "Collaboration",
        "is_connected": False,
        "config_json": json.dumps({"channel": "#intelligence-briefs"}),
        "last_synced_at": "Not connected",
    },
    {
        "key": "postgres",
        "name": "PostgreSQL / pgvector",
        "category": "Vector Database",
        "is_connected": True,
        "config_json": json.dumps({"database": "nexusai_vector", "tables": "documents, embeddings"}),
        "last_synced_at": "Connected (SQLite fallback active)",
    },
    {
        "key": "notion",
        "name": "Notion Workspace Connector",
        "category": "Knowledge Base",
        "is_connected": False,
        "config_json": json.dumps({"pages_indexed": 0}),
        "last_synced_at": "Not connected",
    },
    {
        "key": "s3",
        "name": "AWS S3 / MinIO Object Vault",
        "category": "Storage",
        "is_connected": False,
        "config_json": json.dumps({"bucket": "nexusai-vault", "region": "us-east-1"}),
        "last_synced_at": "Not connected",
    },
]

def ensure_seed_integrations(db: Session, user_id: int):
    count = db.query(Integration).filter(Integration.owner_id == user_id).count()
    if count == 0:
        for seed in DEFAULT_INTEGRATIONS:
            integ = Integration(owner_id=user_id, **seed)
            db.add(integ)
        db.commit()

class ToggleIn(BaseModel):
    is_connected: bool

class ConfigIn(BaseModel):
    config: dict

@router.get("")
def list_integrations(db: Session = Depends(get_db), user: User = Depends(current_user)):
    ensure_seed_integrations(db, user.id)
    items = db.query(Integration).filter(Integration.owner_id == user.id).order_by(Integration.id.asc()).all()
    res = []
    for it in items:
        try:
            cfg = json.loads(it.config_json)
        except Exception:
            cfg = {}
        res.append({
            "id": it.id,
            "key": it.key,
            "name": it.name,
            "category": it.category,
            "is_connected": it.is_connected,
            "config": cfg,
            "last_synced_at": it.last_synced_at,
        })
    return res

@router.post("/{key}/toggle")
def toggle_integration(key: str, payload: ToggleIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    item = db.query(Integration).filter(Integration.key == key, Integration.owner_id == user.id).first()
    if not item:
        raise HTTPException(404, "Integration not found")
    
    item.is_connected = payload.is_connected
    if payload.is_connected:
        item.last_synced_at = f"Synced {datetime.now(timezone.utc).strftime('%b %d, %H:%M UTC')}"
    else:
        item.last_synced_at = "Disconnected"
    db.commit()
    return {"key": item.key, "is_connected": item.is_connected, "last_synced_at": item.last_synced_at}

@router.post("/{key}/configure")
def configure_integration(key: str, payload: ConfigIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    item = db.query(Integration).filter(Integration.key == key, Integration.owner_id == user.id).first()
    if not item:
        raise HTTPException(404, "Integration not found")
    
    item.config_json = json.dumps(payload.config)
    db.commit()
    return {"key": item.key, "config": payload.config}
