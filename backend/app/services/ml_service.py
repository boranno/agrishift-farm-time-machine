"""Singleton registry for loading and running AgriShift LightGBM .joblib artifacts."""
from pathlib import Path
from typing import Any
import joblib
import numpy as np
import pandas as pd

from app.core.config import settings
from app.schemas.models import (
    HazardPredictResponse,
    HazardType,
    ModelArtifactInfo,
    ModelMetadataResponse,
)


ARTIFACT_SPECS: dict[HazardType, tuple[str, str]] = {
    "flood_waterlogging": ("flood_waterlogging_lgbm_h1.joblib", "calibrated_classifier"),
    "flood_inundation": ("flood_inundation_lgbm_h1.joblib", "calibrated_classifier"),
    "surge_inundation": ("surge_inundation_lgbm.joblib", "classifier"),
    "drought": ("drought_lgbm_reg_h1.joblib", "delta_regressor"),
}


class MLModelRegistry:
    """Loads serialized LightGBM models once and executes deterministic inference."""

    def __init__(self, artifacts_dir: Path | None = None) -> None:
        self.artifacts_dir = artifacts_dir or settings.ML_ARTIFACTS_DIR
        self._artifacts: dict[HazardType, dict[str, Any]] = {}
        self.load_errors: dict[HazardType, str] = {}

    def load_all(self) -> None:
        """Load all available .joblib model bundles from ml/artifacts/."""
        self._artifacts.clear()
        self.load_errors.clear()
        for hazard_type, (filename, _) in ARTIFACT_SPECS.items():
            path = self.artifacts_dir / filename
            if path.exists():
                try:
                    self._artifacts[hazard_type] = joblib.load(path)
                except Exception as exc:
                    self.load_errors[hazard_type] = f"{type(exc).__name__}: {exc}"

    def is_loaded(self, hazard_type: HazardType) -> bool:
        return hazard_type in self._artifacts

    def get_metadata(self) -> ModelMetadataResponse:
        models: list[ModelArtifactInfo] = []
        for hazard_type, (filename, model_kind) in ARTIFACT_SPECS.items():
            bundle = self._artifacts.get(hazard_type)
            if bundle is None:
                models.append(
                    ModelArtifactInfo(
                        hazard_type=hazard_type,
                        artifact_file=filename,
                        loaded=False,
                        model_kind=model_kind,  # type: ignore[arg-type]
                        feature_count=0,
                    )
                )
                continue
            features = list(bundle.get("features", []))
            thr = bundle.get("threshold")
            models.append(
                ModelArtifactInfo(
                    hazard_type=hazard_type,
                    artifact_file=filename,
                    loaded=True,
                    model_kind=model_kind,  # type: ignore[arg-type]
                    feature_count=len(features),
                    threshold=float(thr) if thr is not None else None,
                    target_mode=bundle.get("target_mode"),
                    features=features,
                )
            )
        loaded_count = sum(1 for m in models if m.loaded)
        return ModelMetadataResponse(
            status="ok" if loaded_count == len(ARTIFACT_SPECS) else "partial",
            artifacts_dir=str(self.artifacts_dir),
            models=models,
        )

    def predict(
        self,
        hazard_type: HazardType,
        feature_values: dict[str, float | int | None],
        base_vci: float | None = None,
    ) -> HazardPredictResponse:
        bundle = self._artifacts.get(hazard_type)
        if bundle is None:
            raise KeyError(f"Model artifact for '{hazard_type}' is not loaded.")

        expected_features: list[str] = list(bundle["features"])
        row: dict[str, float] = {}
        provided_count = 0
        for feat in expected_features:
            val = feature_values.get(feat)
            if val is not None:
                row[feat] = float(val)
                provided_count += 1
            else:
                row[feat] = np.nan

        X = pd.DataFrame([row], columns=expected_features)
        missing_count = len(expected_features) - provided_count
        model = bundle["model"]
        _, model_kind = ARTIFACT_SPECS[hazard_type]

        if model_kind == "delta_regressor":
            delta_vci = float(model.predict(X)[0])
            resolved_base = base_vci if base_vci is not None else feature_values.get(
                bundle.get("base_col", "vci_roll")
            )
            predicted_vci = None
            alert = None
            if resolved_base is not None:
                predicted_vci = float(np.clip(float(resolved_base) + delta_vci, 0.0, 100.0))
                alert = predicted_vci < 35.0
            return HazardPredictResponse(
                hazard_type=hazard_type,
                delta_vci=round(delta_vci, 4),
                predicted_vci_next1=round(predicted_vci, 4) if predicted_vci is not None else None,
                alert_triggered=alert,
                provided_features_count=provided_count,
                missing_features_count=missing_count,
                total_expected_features=len(expected_features),
                note="Reconstructed VCI(t+1) < 35 indicates moderate-to-severe drought stress."
                if predicted_vci is not None
                else "Provide base_vci (or vci_roll) to reconstruct next-month VCI.",
            )

        raw_prob = float(model.predict_proba(X)[0, 1])
        cal_prob = raw_prob
        calibrator = bundle.get("calibrator")
        if calibrator is not None:
            cal_prob = float(np.clip(calibrator.transform([raw_prob])[0], 0.0, 1.0))

        threshold = bundle.get("threshold")
        thr_val = float(threshold) if threshold is not None else None
        alert = bool(cal_prob >= thr_val) if thr_val is not None else None

        note = None
        if hazard_type == "surge_inundation":
            note = (
                "Storm surge model uses uncalibrated probabilities; prefer continuous "
                "probability ranking over hard binary cutoffs."
            )

        return HazardPredictResponse(
            hazard_type=hazard_type,
            probability=round(cal_prob, 6),
            raw_probability=round(raw_prob, 6),
            threshold=round(thr_val, 6) if thr_val is not None else None,
            alert_triggered=alert,
            provided_features_count=provided_count,
            missing_features_count=missing_count,
            total_expected_features=len(expected_features),
            note=note,
        )


ml_registry = MLModelRegistry()
