"""Tests for AgriShift FastAPI endpoints, SQLAlchemy database persistence, and LightGBM ML inference."""
import pytest

from app.api.v1.alerts import get_alerts
from app.api.v1.crops import evaluate_crops_suitability, get_crops_catalog
from app.api.v1.farms import get_coastal_regions, get_current_farm, update_current_farm
from app.api.v1.models import (
    get_models_metadata,
    get_salinity_metadata,
    predict_hazard,
    predict_salinity_ec,
)
from app.api.v1.rotation import generate_rotation_plan
from app.api.v1.soil import (
    extract_soil_card_ocr,
    get_soil_profile,
    save_and_evaluate_soil_profile,
)
from app.api.v1.weather import get_current_weather, get_historical_weather_comparison
from app.main import health_check
from app.repositories.agronomy_repository import init_and_seed_db
from app.schemas.domain import (
    CropSuitabilityRequest,
    FarmProfilePayload,
    RotationPlanRequest,
    SoilOcrExtractRequest,
    SoilProfileRequest,
)
from app.schemas.models import HazardPredictRequest
from app.services.ml_service import ml_registry


@pytest.fixture(scope="module", autouse=True)
def initialize_test_environment() -> None:
    init_and_seed_db()
    ml_registry.load_all()


def test_health_check_and_models_loaded() -> None:
    body = health_check()
    assert body["status"] == "ok"
    assert body["project"] == "AgriShift"
    assert body["database_initialized"] is True
    assert body["models_loaded"] == 4
    assert body["models_expected"] == 4
    assert ml_registry.load_errors == {}


def test_models_metadata_reports_all_four_artifacts() -> None:
    meta = get_models_metadata()
    assert meta.status == "ok"
    by_type = {m.hazard_type: m for m in meta.models}
    assert by_type["flood_waterlogging"].feature_count == 91
    assert by_type["flood_inundation"].feature_count == 105
    assert by_type["surge_inundation"].feature_count == 34
    assert by_type["drought"].feature_count == 64


def test_hazard_predict_flood_waterlogging_with_partial_features() -> None:
    res = predict_hazard(
        "flood_waterlogging",
        HazardPredictRequest(
            features={"rain_mm_lag3": 320.0, "swl2_sat_lag2": 0.92, "hnd": 2.5}
        ),
    )
    assert res.hazard_type == "flood_waterlogging"
    assert 0.0 <= res.probability <= 1.0
    assert res.provided_features_count == 3
    assert res.missing_features_count == 88
    assert res.total_expected_features == 91
    assert isinstance(res.alert_triggered, bool)


def test_hazard_predict_flood_inundation_and_surge() -> None:
    flood_res = predict_hazard(
        "flood_inundation",
        HazardPredictRequest(features={"rain_mm_lag3": 250.0, "hnd": 1.8}),
    )
    assert 0.0 <= flood_res.probability <= 1.0
    assert flood_res.total_expected_features == 105

    surge_res = predict_hazard(
        "surge_inundation",
        HazardPredictRequest(features={"max_wind_kt": 90.0, "elevation": 2.0}),
    )
    assert 0.0 <= surge_res.probability <= 1.0
    assert surge_res.total_expected_features == 34


def test_hazard_predict_drought_delta_vci_reconstruction() -> None:
    res = predict_hazard(
        "drought",
        HazardPredictRequest(
            base_vci=42.0,
            features={"rain_mm": 15.0, "air_temp": 31.5, "spi3_lag1": -1.4},
        ),
    )
    assert res.hazard_type == "drought"
    assert res.delta_vci is not None
    assert 0.0 <= res.predicted_vci_next1 <= 100.0
    assert isinstance(res.alert_triggered, bool)


def test_salinity_ec_returns_honest_501() -> None:
    meta = get_salinity_metadata()
    assert meta.status == "MODEL_NOT_YET_AVAILABLE"
    res = predict_salinity_ec()
    assert res.status_code == 501


def test_farms_and_coastal_regions_endpoints() -> None:
    regions = get_coastal_regions()
    assert "Khulna" in regions["districts"]
    assert "Dacope" in regions["districts"]["Khulna"]

    farm = get_current_farm()
    assert farm["district"] == "Khulna"
    assert farm["upazila"] == "Dacope"

    updated = update_current_farm(
        FarmProfilePayload(
            farmName="Sundarban Coastal Model Farm",
            farmerName="Md. Rafiqul Islam",
            district="Khulna",
            upazila="Dacope",
            landSizeValue=5.0,
            landSizeUnit="bigha",
        )
    )
    assert updated["landSizeValue"] == 5.0


def test_soil_profile_preserves_salinity_method_and_nulls() -> None:
    res = save_and_evaluate_soil_profile(
        SoilProfileRequest(
            salinityEc=6.2,
            salinityMethod="ECe",
            ph=7.5,
            organicMatter=1.2,
            nitrogenPct=None,
            phosphorusPpm=None,
        )
    )
    assert res["profile"]["salinityEc"] == 6.2
    assert res["profile"]["salinityMethod"] == "ECe"
    assert res["profile"]["nitrogenPct"] is None
    assert res["diagnostics"]["ecClass"]["classCode"] == "SRDI S2 (Moderately Saline)"

    fetched = get_soil_profile()
    assert fetched["profile"]["salinityEc"] == 6.2
    assert fetched["profile"]["nitrogenPct"] is None


def test_soil_ocr_extraction_parses_text_and_preserves_nulls() -> None:
    ocr = extract_soil_card_ocr(
        SoilOcrExtractRequest(
            rawText="SRDI Lab Report: ECe: 5.4 dS/m, pH = 7.2, OM: 1.6%",
            fileName="dacope_card.jpg",
        )
    )
    assert ocr["extractionMode"] == "regex_text_parser"
    assert ocr["extractedFields"]["salinityEc"] == 5.4
    assert ocr["extractedFields"]["salinityMethod"] == "ECe"
    assert ocr["extractedFields"]["ph"] == 7.2
    assert ocr["extractedFields"]["organicMatter"] == 1.6
    assert ocr["extractedFields"]["zincPpm"] is None


def test_crops_catalog_and_suitability_evaluation() -> None:
    catalog = get_crops_catalog()
    assert catalog["count"] == 14

    suitability = evaluate_crops_suitability(
        CropSuitabilityRequest(soilEc=5.2, activeSeason="rabi")
    )
    assert suitability["soilEc"] == 5.2
    assert len(suitability["results"]) == 14
    by_id = {c["id"]: c for c in suitability["results"]}
    assert by_id["crop-sunflower"]["suitability"]["status"] == "suitable"
    assert by_id["crop-mustard"]["suitability"]["status"] == "marginal"


def test_rotation_planner_returns_patterns_and_strategies() -> None:
    plan = generate_rotation_plan(RotationPlanRequest(priority="saline", soilEc=5.5))
    assert len(plan["rotationPatterns"]) >= 2
    assert len(plan["comparisonPlans"]) == 3


def test_weather_and_alerts_endpoints() -> None:
    weather = get_current_weather(district="Khulna", upazila="Dacope")
    assert weather["district"] == "Khulna"
    assert len(weather["forecast7Day"]) == 7

    hist = get_historical_weather_comparison(district="Khulna", upazila="Dacope")
    assert len(hist["monthlyRainfallComparison"]) == 12

    alerts = get_alerts(severity="critical")
    assert alerts["count"] == 2
