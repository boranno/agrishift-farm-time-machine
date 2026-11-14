"""SQLAlchemy relational database engine and session management.

Supports PostgreSQL via DATABASE_URL when running with Docker Compose, and
automatically falls back to a local SQLite database (agrishift_local.db) when
PostgreSQL is not reachable so local development and automated tests work out of the box.
"""
from __future__ import annotations

from collections.abc import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import BACKEND_DIR, settings


class Base(DeclarativeBase):
    """Canonical declarative base for AgriShift ORM models."""


def _build_engine():
    sqlite_url = f"sqlite:///{(BACKEND_DIR / 'agrishift_local.db').as_posix()}"
    configured_url = settings.DATABASE_URL or sqlite_url

    if configured_url.startswith("sqlite"):
        return create_engine(
            configured_url,
            connect_args={"check_same_thread": False},
            future=True,
        )

    try:
        pg_engine = create_engine(configured_url, pool_pre_ping=True, future=True)
        with pg_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return pg_engine
    except Exception:
        return create_engine(
            sqlite_url,
            connect_args={"check_same_thread": False},
            future=True,
        )


engine = _build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
