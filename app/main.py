from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import Base, engine
from app.models import User, Document
from app.api import auth, documents, chat

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexusAI API", version="0.1.0", description="Enterprise document intelligence API")
allowed_origins = list({settings.frontend_origin, "http://localhost:3000", "http://127.0.0.1:3000"})
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok", "service": "nexusai-api"}
