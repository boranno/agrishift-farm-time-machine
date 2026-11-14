"""API v1 router aggregating feature modules."""
from fastapi import APIRouter

from app.api.v1 import alerts, crops, farms, models, rotation, soil, weather

api_router = APIRouter()
api_router.include_router(models.router)
api_router.include_router(farms.router)
api_router.include_router(soil.router)
api_router.include_router(crops.router)
api_router.include_router(rotation.router)
api_router.include_router(weather.router)
api_router.include_router(alerts.router)
