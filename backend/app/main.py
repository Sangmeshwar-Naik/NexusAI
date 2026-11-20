from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import Base, engine
from app.models import User, Document, Agent, Workflow, Integration
from app.api import auth, documents, chat, agents, workflows, integrations, analytics, knowledge, settings as settings_api

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexusAI API", version="0.1.0", description="Enterprise document intelligence API")

# Universal CORS support for development across localhost, 127.0.0.1 and LAN IPs
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(agents.router, prefix="/api")
app.include_router(workflows.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok", "service": "nexusai-api"}
