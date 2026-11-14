"""Pydantic request and response schemas for ML model metadata and inference."""
from typing import Any, Literal
from pydantic import BaseModel, Field


HazardType = Literal[
    "flood_waterlogging",
    "flood_inundation",
    "surge_inundation",
    "drought",
]


class ModelArtifactInfo(BaseModel):
    hazard_type: HazardType
    artifact_file: str
    loaded: bool
    model_kind: Literal["calibrated_classifier", "classifier", "delta_regressor"]
    feature_count: int
    threshold: float | None = None
    target_mode: str | None = None
    features: list[str] = Field(default_factory=list)


class ModelMetadataResponse(BaseModel):
    status: str
    artifacts_dir: str
    models: list[ModelArtifactInfo]


class HazardPredictRequest(BaseModel):
    features: dict[str, float | int | None] = Field(
        default_factory=dict,
        description="Mapping of feature names to numeric values. Missing features default to NaN for LightGBM.",
    )
    base_vci: float | None = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Current month rolling VCI (0-100); used only for drought delta-VCI reconstruction.",
    )


class HazardPredictResponse(BaseModel):
    hazard_type: HazardType
    probability: float | None = None
    raw_probability: float | None = None
    threshold: float | None = None
    alert_triggered: bool | None = None
    delta_vci: float | None = None
    predicted_vci_next1: float | None = None
    provided_features_count: int
    missing_features_count: int
    total_expected_features: int
    note: str | None = None


class SalinityUnavailableResponse(BaseModel):
    status: str = "MODEL_NOT_YET_AVAILABLE"
    detail: str
    available_hazards: list[HazardType]
    details: dict[str, Any] = Field(default_factory=dict)
