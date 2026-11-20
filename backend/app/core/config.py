from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    database_url: str = f"sqlite:///{(BACKEND_DIR / 'nexusai.db').as_posix()}"
    jwt_secret: str = "dev-only-change-me"
    access_token_expire_minutes: int = 60
    upload_dir: str = str(BACKEND_DIR / "uploads")
    frontend_origin: str = "http://localhost:3000"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    model_config = SettingsConfigDict(env_file=str(ENV_FILE), extra="ignore")

    @model_validator(mode="after")
    def resolve_paths(self):
        if self.database_url.startswith("sqlite:///."):
            rel = self.database_url.replace("sqlite:///.", "").lstrip("/\\")
            abs_db = (BACKEND_DIR / rel).resolve().as_posix()
            self.database_url = f"sqlite:///{abs_db}"
        upload_p = Path(self.upload_dir)
        if not upload_p.is_absolute():
            self.upload_dir = str((BACKEND_DIR / upload_p).resolve())
        return self

settings = Settings()
