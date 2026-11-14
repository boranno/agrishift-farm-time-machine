"""Application configuration using pydantic-settings."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    """Runtime settings for the AgriShift FastAPI backend."""

    APP_NAME: str = "AgriShift API"
    APP_VERSION: str = "0.2.0"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ]
    ML_ARTIFACTS_DIR: Path = REPO_ROOT / "ml" / "artifacts"
    DATABASE_URL: str = f"sqlite:///{(BACKEND_DIR / 'agrishift_local.db').as_posix()}"

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
