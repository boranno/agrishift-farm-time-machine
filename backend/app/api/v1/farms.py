"""Farm profile and coastal administrative region endpoints."""
from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter

from app.core.database import SessionLocal
from app.models.entities import Plot, Site
from app.repositories.agronomy_repository import COASTAL_REGIONS
from app.schemas.domain import FarmProfilePayload

router = APIRouter(tags=["Farms & Regions"])


def _plot_to_farm_profile(plot: Plot, site: Site) -> dict[str, Any]:
    try:
        crops = json.loads(plot.current_crops_json) if plot.current_crops_json else []
    except Exception:
        crops = ["T. Aman Rice (BRRI dhan73)", "Sunflower"]

    return {
        "id": plot.plot_id.replace("plot-", ""),
        "plotId": plot.plot_id,
        "siteId": site.site_id,
        "farmName": plot.farm_name or "Sundarban Coastal Model Farm",
        "farmerName": plot.farmer_name or "Md. Rafiqul Islam",
        "division": "Khulna",
        "district": site.district,
        "upazila": site.upazila,
        "union": site.union_name or "Bajua Union",
        "mouza": site.village_or_polder or "Bajua",
        "landSizeValue": plot.land_size_value or 4.5,
        "landSizeUnit": plot.land_size_unit or "bigha",
        "soilType": plot.soil_texture or "silty-clay",
        "irrigationSource": plot.irrigation_access or "canal",
        "waterCondition": "moderately-saline",
        "salinityLevel": "high",
        "currentCrops": crops,
        "previousCrop": plot.previous_crop or "T. Aman Rice",
        "elevationMeters": plot.elevation_m if plot.elevation_m is not None else 1.8,
        "embankmentDistanceKm": (
            plot.embankment_distance_km if plot.embankment_distance_km is not None else 1.2
        ),
        "coordinates": {
            "lat": site.latitude if site.latitude is not None else 22.5721,
            "lon": site.longitude if site.longitude is not None else 89.5124,
        },
    }


@router.get("/farms/current")
def get_current_farm() -> dict[str, Any]:
    """Return the active coastal farm profile stored in the relational database."""
    with SessionLocal() as db:
        plot = db.get(Plot, "plot-farm-demo-001")
        site = db.get(Site, "site-dacope-polder31")
        if plot is None or site is None:
            return FarmProfilePayload().model_dump()
        return _plot_to_farm_profile(plot, site)


@router.put("/farms/current")
def update_current_farm(payload: FarmProfilePayload) -> dict[str, Any]:
    """Update and persist the active coastal farm profile."""
    with SessionLocal() as db:
        site = db.get(Site, "site-dacope-polder31")
        if site is None:
            site = Site(
                site_id="site-dacope-polder31",
                district=payload.district,
                upazila=payload.upazila,
                union_name=payload.union,
                village_or_polder=payload.mouza,
                latitude=payload.coordinates.lat,
                longitude=payload.coordinates.lon,
                coordinate_accuracy_m=100.0,
                aez_code="AEZ-13",
                site_context="Updated coastal farm location",
                location_source="user_profile_update",
            )
            db.add(site)
        else:
            site.district = payload.district
            site.upazila = payload.upazila
            site.union_name = payload.union
            site.village_or_polder = payload.mouza
            site.latitude = payload.coordinates.lat
            site.longitude = payload.coordinates.lon

        plot = db.get(Plot, "plot-farm-demo-001")
        if plot is None:
            plot = Plot(
                plot_id="plot-farm-demo-001",
                site_id=site.site_id,
            )
            db.add(plot)

        plot.farm_name = payload.farmName
        plot.farmer_name = payload.farmerName
        plot.land_size_value = payload.landSizeValue
        plot.land_size_unit = payload.landSizeUnit
        plot.soil_texture = payload.soilType
        plot.irrigation_access = payload.irrigationSource
        plot.current_crops_json = json.dumps(payload.currentCrops)
        plot.previous_crop = payload.previousCrop
        plot.elevation_m = payload.elevationMeters
        plot.embankment_distance_km = payload.embankmentDistanceKm

        db.commit()
        db.refresh(plot)
        db.refresh(site)
        return _plot_to_farm_profile(plot, site)


@router.get("/regions/bangladesh-coastal")
def get_coastal_regions() -> dict[str, Any]:
    """Return the 8 coastal districts and their upazilas for Bangladesh coastal belt."""
    return {
        "country": "Bangladesh",
        "aezFocus": ["AEZ-13 (Ganges Tidal Floodplain)", "AEZ-18 (Young Meghna Estuarine Floodplain)"],
        "districts": COASTAL_REGIONS,
    }
