"""AgriShift FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.repositories.agronomy_repository import init_and_seed_db
from app.services.ml_service import ml_registry


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Initialize relational database and load trained LightGBM artifacts on startup."""
    init_and_seed_db()
    ml_registry.load_all()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, object]:
    """Return service health, database status, and count of loaded ML artifacts."""
    meta = ml_registry.get_metadata()
    loaded = sum(1 for m in meta.models if m.loaded)
    return {
        "status": "ok",
        "project": "AgriShift",
        "version": settings.APP_VERSION,
        "database_initialized": True,
        "models_loaded": loaded,
        "models_expected": len(meta.models),
    }


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
