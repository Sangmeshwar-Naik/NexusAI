from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

class ProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)

class AIConfigUpdate(BaseModel):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

@router.get("")
def get_settings(user: User = Depends(current_user)):
    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at,
        },
        "system": {
            "fastapi_version": "0.1.0",
            "database_url": "sqlite:///./nexusai.db (Active)",
            "upload_dir": settings.upload_dir,
            "access_token_expire_minutes": settings.access_token_expire_minutes,
            "active_ai_model": settings.openai_model,
            "has_openai_key": bool(settings.openai_api_key),
            "retrieval_mode": "Hybrid (TF-IDF local + OpenAI Grounding)",
        },
    }

@router.put("/profile")
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    user.name = payload.name.strip()
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "name": user.name, "email": user.email}

@router.put("/ai")
def update_ai_config(payload: AIConfigUpdate, user: User = Depends(current_user)):
    if payload.openai_api_key:
        settings.openai_api_key = payload.openai_api_key
    if payload.openai_model:
        settings.openai_model = payload.openai_model
    return {
        "message": "AI settings updated successfully",
        "openai_model": settings.openai_model,
        "has_openai_key": bool(settings.openai_api_key),
    }
