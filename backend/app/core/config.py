import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AppCheck"
    TAGLINE: str = "Know what an app can access."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "appcheck-production-security-super-secret-key-32charsmin")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    PASSWORD_RESET_EXPIRE_MINUTES: int = 60  # 1 hour
    
    # Database: Supports SQLite (default local) and PostgreSQL (production / docker)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./appcheck.db")
    
    # Upload limits & storage
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    REPORTS_DIR: Path = BASE_DIR / "generated_reports"
    MAX_UPLOAD_SIZE_MB: int = 150  # 150 MB max APK size
    ALLOWED_EXTENSIONS: List[str] = [".apk"]
    
    # ML Model directory
    ML_MODEL_DIR: Path = BASE_DIR / "ml" / "models"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = {"case_sensitive": True, "env_file": ".env", "extra": "ignore"}

settings = Settings()

# Ensure runtime directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.ML_MODEL_DIR.mkdir(parents=True, exist_ok=True)
