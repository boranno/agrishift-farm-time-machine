"""Pydantic v2 request and response schemas for AgriShift domain endpoints."""
from __future__ import annotations

from typing import Any, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class CoordinatesPayload(BaseModel):
    lat: float = Field(default=22.5721, ge=20.0, le=27.0)
    lon: float = Field(default=89.5124, ge=88.0, le=93.0)


class FarmProfilePayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(default="farm-demo-001")
    farmName: str = Field(default="Sundarban Coastal Model Farm")
    farmerName: str = Field(default="Md. Rafiqul Islam")
    division: str = Field(default="Khulna")
    district: str = Field(default="Khulna")
    upazila: str = Field(default="Dacope")
    union: str = Field(default="Bajua Union")
    mouza: str = Field(default="Bajua")
    landSizeValue: float = Field(default=4.5, gt=0)
    landSizeUnit: str = Field(default="bigha")
    soilType: str = Field(default="silty-clay")
    irrigationSource: str = Field(default="canal")
    waterCondition: str = Field(default="moderately-saline")
    salinityLevel: str = Field(default="high")
    currentCrops: list[str] = Field(
        default_factory=lambda: ["T. Aman Rice (BRRI dhan73)", "Sunflower"]
    )
    previousCrop: str = Field(default="T. Aman Rice")
    elevationMeters: float = Field(default=1.8)
    embankmentDistanceKm: float = Field(default=1.2)
    coordinates: CoordinatesPayload = Field(default_factory=CoordinatesPayload)


class SoilProfileRequest(BaseModel):
    """Soil & water profile request.

    Domain integrity: missing measurements remain None (NULL), never 0.
    Preserves salinityMethod ('ECe', 'EC1:5') explicitly.
    """

    plotId: str = Field(default="plot-farm-demo-001")
    salinityEc: Optional[float] = Field(default=4.8, ge=0.0, le=40.0, description="Soil salinity in dS/m")
    salinityMethod: Literal["ECe", "EC1:5"] = Field(
        default="ECe",
        description="Soil salinity measurement method: 'ECe' (saturated paste extract) or 'EC1:5'",
    )
    salinityUnit: str = Field(default="dS/m")
    ph: Optional[float] = Field(default=7.4, ge=3.0, le=10.5)
    organicMatter: Optional[float] = Field(default=1.4, ge=0.0, le=20.0)
    moistureStatus: str = Field(default="moderate")
    drainageCondition: str = Field(default="poor")
    waterSource: str = Field(default="canal")
    waterQuality: str = Field(default="brackish")
    canalSalinityEc: Optional[float] = Field(
        default=5.2, ge=0.0, le=50.0, description="Irrigation/canal water ECw in dS/m"
    )
    nitrogenPct: Optional[float] = Field(default=None, ge=0.0, le=5.0)
    phosphorusPpm: Optional[float] = Field(default=None, ge=0.0, le=500.0)
    potassiumMeq: Optional[float] = Field(default=None, ge=0.0, le=20.0)
    zincPpm: Optional[float] = Field(default=None, ge=0.0, le=50.0)
    lastTestedDate: str = Field(default="2026-02-15")
    labName: str = Field(default="SRDI Regional Lab Khulna")


class SoilOcrExtractRequest(BaseModel):
    """Optional JSON body for OCR/text extraction of SRDI lab report cards."""

    rawText: Optional[str] = Field(
        default=None,
        description="Raw OCR text or farmer-entered SRDI lab report text to parse.",
    )
    fileName: Optional[str] = Field(default="srdi_soil_health_card.jpg")


class CropSuitabilityRequest(BaseModel):
    soilEc: float = Field(default=4.8, ge=0.0, le=40.0, description="Soil salinity ECe in dS/m")
    salinityMethod: Literal["ECe", "EC1:5"] = Field(default="ECe")
    activeSeason: Literal["all", "rabi", "kharif1", "kharif2"] = Field(default="all")
    category: Optional[str] = Field(default="all")
    waterCondition: Optional[str] = Field(default="moderately-saline")


class RotationPlanRequest(BaseModel):
    priority: Literal["all", "soil", "water", "saline", "yield"] = Field(default="all")
    soilEc: Optional[float] = Field(default=4.8, ge=0.0, le=40.0)
    irrigationSource: Optional[str] = Field(default="canal")
    district: Optional[str] = Field(default="Khulna")
    upazila: Optional[str] = Field(default="Dacope")
