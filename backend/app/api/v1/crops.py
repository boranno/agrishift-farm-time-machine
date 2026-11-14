"""Crop catalog and deterministic salinity/season suitability endpoints."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from app.core.database import SessionLocal
from app.repositories.agronomy_repository import list_all_crops
from app.schemas.domain import CropSuitabilityRequest

router = APIRouter(prefix="/crops", tags=["Crop Suitability & Catalog"])


SEASON_LABELS_BN = {
    "rabi": "রবি",
    "kharif1": "খরিপ-১",
    "kharif2": "খরিপ-২",
}


def evaluate_crop_suitability_item(
    crop: dict[str, Any], soil_ec: float, active_season: str = "all"
) -> dict[str, str]:
    """Evaluate a crop against soil ECe (dS/m) and active season."""
    ec = float(soil_ec)
    seasons: list[str] = crop.get("seasons", [])
    crop_seasons_bn = ", ".join(SEASON_LABELS_BN.get(s, s) for s in seasons)
    season_match = active_season == "all" or not seasons or active_season in seasons
    crit_ec = float(crop["criticalSalinityEc"])
    max_ec = float(crop["maxSalinityEc"])

    if ec <= crit_ec:
        return {
            "status": "suitable" if season_match else "marginal",
            "reasonEn": (
                f"Soil salinity ({ec:.1f} dS/m) is safely below the critical threshold ({crit_ec} dS/m)."
                if season_match
                else f"Salinity is safe, but optimal sowing season is {', '.join(seasons)}."
            ),
            "reasonBn": (
                f"মাটির লবণাক্ততা ({ec:.1f} dS/m) সহনশীল সীমার ({crit_ec} dS/m) নিচে রয়েছে।"
                if season_match
                else f"লবণাক্ততা ঠিক আছে, তবে এই ফসলের মূল মৌসুম হলো {crop_seasons_bn}।"
            ),
        }
    if ec <= max_ec:
        return {
            "status": "marginal",
            "reasonEn": (
                f"Soil salinity ({ec:.1f} dS/m) is in the warning zone "
                f"({crit_ec}–{max_ec} dS/m). Requires mulching or salt flushing."
            ),
            "reasonBn": (
                f"মাটির লবণাক্ততা ({ec:.1f} dS/m) সতর্কতামূলক সীমার মধ্যে। "
                "ভালো ফলন পেতে খড় দিয়ে মালচিং ও মিষ্টি পানির সেচ প্রয়োজন।"
            ),
        }
    return {
        "status": "risky",
        "reasonEn": (
            f"Soil salinity ({ec:.1f} dS/m) exceeds maximum tolerance ({max_ec} dS/m). "
            "High risk of crop failure or stunting."
        ),
        "reasonBn": (
            f"মাটির লবণাক্ততা ({ec:.1f} dS/m) সর্বোচ্চ সহনশীল সীমার ({max_ec} dS/m) চেয়ে বেশি। "
            "ফসল মরে যাওয়ার বা তীব্র ফলন বিপর্যয়ের ঝুঁকি রয়েছে।"
        ),
    }


@router.get("")
def get_crops_catalog() -> dict[str, Any]:
    """Return the full coastal crop reference catalog from the relational database."""
    with SessionLocal() as db:
        crops = list_all_crops(db)
    return {
        "count": len(crops),
        "crops": crops,
    }


@router.post("/suitability")
def evaluate_crops_suitability(payload: CropSuitabilityRequest) -> dict[str, Any]:
    """Evaluate all coastal crops (or a filtered category) against soil ECe and season."""
    with SessionLocal() as db:
        crops = list_all_crops(db)

    if payload.category and payload.category != "all":
        crops = [c for c in crops if c["category"] == payload.category]

    results = []
    counts = {"suitable": 0, "marginal": 0, "risky": 0}
    for crop in crops:
        evaluation = evaluate_crop_suitability_item(
            crop=crop,
            soil_ec=payload.soilEc,
            active_season=payload.activeSeason,
        )
        counts[evaluation["status"]] += 1
        results.append({**crop, "suitability": evaluation})

    return {
        "soilEc": payload.soilEc,
        "salinityMethod": payload.salinityMethod,
        "activeSeason": payload.activeSeason,
        "summaryCounts": counts,
        "results": results,
    }
