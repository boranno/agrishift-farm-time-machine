"""API v1 endpoints for ML model metadata and hazard inference."""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.models import (
    HazardPredictRequest,
    HazardPredictResponse,
    HazardType,
    ModelMetadataResponse,
    SalinityUnavailableResponse,
)
from app.services.ml_service import ml_registry

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/metadata", response_model=ModelMetadataResponse)
def get_models_metadata() -> ModelMetadataResponse:
    """Return loaded .joblib model metadata and expected feature lists."""
    return ml_registry.get_metadata()


@router.post("/hazard/{hazard_type}/predict", response_model=HazardPredictResponse)
def predict_hazard(
    hazard_type: HazardType,
    payload: HazardPredictRequest,
) -> HazardPredictResponse:
    """Run deterministic inference against a loaded LightGBM hazard model."""
    if not ml_registry.is_loaded(hazard_type):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model artifact for '{hazard_type}' is not loaded.",
        )
    return ml_registry.predict(
        hazard_type=hazard_type,
        feature_values=payload.features,
        base_vci=payload.base_vci,
    )


@router.get("/metadata/salinity", response_model=SalinityUnavailableResponse)
def get_salinity_metadata() -> SalinityUnavailableResponse:
    """Report honest status for direct plot-level ECe (dS/m) ML prediction."""
    return SalinityUnavailableResponse(
        detail=(
            "Direct soil ECe (dS/m) ML regression model is not implemented yet. "
            "Use SRDI soil test cards or the 4 trained climate hazard models instead."
        ),
        available_hazards=[
            "flood_waterlogging",
            "flood_inundation",
            "surge_inundation",
            "drought",
        ],
    )


@router.post("/salinity-ec/predict")
def predict_salinity_ec() -> JSONResponse:
    """Explicit 501 response until an ECe regression model is trained and validated."""
    body = SalinityUnavailableResponse(
        detail=(
            "Direct soil ECe (dS/m) ML prediction is not yet available. "
            "Do not fabricate satellite ECe predictions."
        ),
        available_hazards=[
            "flood_waterlogging",
            "flood_inundation",
            "surge_inundation",
            "drought",
        ],
    )
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content=body.model_dump(),
    )
