"""Soil & irrigation water diagnostic and OCR extraction endpoints."""
from __future__ import annotations

from datetime import date
import re
from typing import Any, Optional

from fastapi import APIRouter

from app.core.database import SessionLocal
from app.models.entities import SoilSample
from app.schemas.domain import SoilOcrExtractRequest, SoilProfileRequest

router = APIRouter(prefix="/soil", tags=["Soil & Water Diagnostics"])


def classify_salinity_srdi(ec: Optional[float]) -> dict[str, str]:
    """Classify soil electrical conductivity (dS/m) into SRDI classes S0-S4."""
    val = float(ec) if ec is not None else 0.0
    if val < 2.0:
        return {
            "classCode": "SRDI S0 (Non-Saline)",
            "level": "low",
            "color": "emerald",
            "impactEn": "Safe for almost all traditional and high-value vegetable crops.",
            "impactBn": "প্রায় সব ধরনের প্রচলিত ফসল ও শাকসবজি চাষের জন্য নিরাপদ।",
        }
    if val < 4.0:
        return {
            "classCode": "SRDI S1 (Slightly Saline)",
            "level": "moderate",
            "color": "amber",
            "impactEn": "Yield of very sensitive crops (pulses, non-tolerant vegetables) may decline by 15–25%.",
            "impactBn": "অতি সংবেদনশীল ফসল (কিছু ডাল ও সবজি) চাষ করলে ফলন ১৫–২৫% কমতে পারে।",
        }
    if val < 8.0:
        return {
            "classCode": "SRDI S2 (Moderately Saline)",
            "level": "high",
            "color": "orange",
            "impactEn": "Restricts traditional rice and sensitive Rabi crops. Switch to salt-tolerant varieties (BRRI dhan67, Sunflower, Mustard).",
            "impactBn": "সাধারণ ধান ও সংবেদনশীল রবি ফসল বাধাগ্রস্ত হয়। লবণ-সহনশীল জাত (ব্রি ধান৬৭, সূর্যমুখী, সরিষা) নির্বাচন করুন।",
        }
    if val < 12.0:
        return {
            "classCode": "SRDI S3 (Strongly Saline)",
            "level": "severe",
            "color": "rose",
            "impactEn": "Severe osmotic stress. Only highly salt-tolerant crops, raised bed mulching, or green manure (Dhaincha) advised.",
            "impactBn": "তীব্র লবণাক্ততার ঝুঁকি। শুধুমাত্র উচ্চ লবণ-সহনশীল ফসল, মালচিং পদ্ধতি বা ধইঞ্চা চাষের পরামর্শ দেওয়া হয়।",
        }
    return {
        "classCode": "SRDI S4 (Very Strongly Saline)",
        "level": "extreme",
        "color": "red",
        "impactEn": "Critical soil toxicity. Crop cultivation unviable without heavy rainwater flushing and gypsum reclamation.",
        "impactBn": "চরম লবণাক্ততা। বৃষ্টির পানি দিয়ে লবণ ধুয়ে ফেলা ও জিপসাম প্রয়োগ ছাড়া ফসল আবাদ ঝুঁকিপূর্ণ।",
    }


def evaluate_soil_health(profile: SoilProfileRequest) -> dict[str, Any]:
    """Generate the bilingual SRDI soil and water diagnostic report."""
    ec_class = classify_salinity_srdi(profile.salinityEc)
    canal_ec = profile.canalSalinityEc if profile.canalSalinityEc is not None else 0.0
    water_risk = (
        "critical"
        if (profile.waterQuality == "saline" or canal_ec > 4.0)
        else ("warning" if (profile.waterQuality == "brackish" or canal_ec > 2.0) else "safe")
    )
    om = profile.organicMatter if profile.organicMatter is not None else 1.4
    organic_status = "low" if om < 1.5 else ("optimal" if om < 2.5 else "high")
    ph = profile.ph if profile.ph is not None else 7.0
    ph_status = "acidic" if ph < 6.0 else ("alkaline" if ph > 7.8 else "neutral")

    return {
        "profile": profile.model_dump(),
        "diagnostics": {
            "ecClass": ec_class,
            "waterRisk": water_risk,
            "organicStatus": organic_status,
            "phStatus": ph_status,
            "salinityMethodNote": (
                "Saturated paste extract (ECe) aligned with SRDI S0-S4 thresholds."
                if profile.salinityMethod == "ECe"
                else "1:5 soil-water suspension (EC1:5); laboratory conversion required before direct SRDI ECe comparison."
            ),
        },
    }


@router.get("/profile")
def get_soil_profile() -> dict[str, Any]:
    """Fetch the latest persisted soil sample and its SRDI diagnostic report."""
    with SessionLocal() as db:
        sample = db.get(SoilSample, "sample-dacope-001")
        if sample is None:
            default_req = SoilProfileRequest()
            return evaluate_soil_health(default_req)

        req = SoilProfileRequest(
            plotId=sample.plot_id,
            salinityEc=sample.salinity_value,
            salinityMethod="EC1:5" if sample.salinity_method == "EC1:5" else "ECe",
            salinityUnit=sample.salinity_unit,
            ph=sample.ph_value,
            organicMatter=sample.organic_matter_pct,
            moistureStatus=sample.moisture_status or "moderate",
            drainageCondition=sample.drainage_condition or "poor",
            nitrogenPct=sample.nitrogen_pct,
            phosphorusPpm=sample.phosphorus_ppm,
            potassiumMeq=sample.potassium_meq,
            zincPpm=sample.zinc_ppm,
            lastTestedDate=sample.sample_date.isoformat(),
            labName=sample.lab_name,
        )
        return evaluate_soil_health(req)


@router.post("/profile")
def save_and_evaluate_soil_profile(payload: SoilProfileRequest) -> dict[str, Any]:
    """Persist soil sample measurements (preserving NULLs and salinityMethod) and return diagnostics."""
    with SessionLocal() as db:
        sample = db.get(SoilSample, "sample-dacope-001")
        try:
            parsed_date = date.fromisoformat(payload.lastTestedDate)
        except ValueError:
            parsed_date = date(2026, 2, 15)

        if sample is None:
            sample = SoilSample(
                sample_id="sample-dacope-001",
                plot_id=payload.plotId,
                sample_date=parsed_date,
            )
            db.add(sample)

        sample.sample_date = parsed_date
        sample.salinity_value = payload.salinityEc
        sample.salinity_method = payload.salinityMethod
        sample.salinity_unit = payload.salinityUnit
        sample.ph_value = payload.ph
        sample.organic_matter_pct = payload.organicMatter
        sample.nitrogen_pct = payload.nitrogenPct
        sample.phosphorus_ppm = payload.phosphorusPpm
        sample.potassium_meq = payload.potassiumMeq
        sample.zinc_ppm = payload.zincPpm
        sample.moisture_status = payload.moistureStatus
        sample.drainage_condition = payload.drainageCondition
        sample.lab_name = payload.labName

        db.commit()

    return evaluate_soil_health(payload)


def _extract_float(pattern: str, text: str) -> Optional[float]:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


@router.post("/ocr/extract")
def extract_soil_card_ocr(payload: Optional[SoilOcrExtractRequest] = None) -> dict[str, Any]:
    """Extract structured soil parameters from an SRDI Soil Health Card text or image metadata.

    Preserves NULL (None) for any unmeasured fields rather than substituting 0.
    """
    req = payload or SoilOcrExtractRequest()
    text = (req.rawText or "").strip()

    if text:
        ec = _extract_float(r"(?:ECe?|salinity)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)", text)
        ph = _extract_float(r"pH\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)", text)
        om = _extract_float(r"(?:OM|organic\s+matter)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)", text)
        n_pct = _extract_float(r"(?:N|nitrogen)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)", text)
        p_ppm = _extract_float(r"(?:P|phosphorus)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)", text)
        k_meq = _extract_float(r"(?:K|potassium)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)", text)
        zn_ppm = _extract_float(r"(?:Zn|zinc)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)", text)
        method = "EC1:5" if "1:5" in text else "ECe"
        extracted = {
            "salinityEc": ec,
            "salinityMethod": method,
            "salinityUnit": "dS/m",
            "ph": ph,
            "organicMatter": om,
            "nitrogenPct": n_pct,
            "phosphorusPpm": p_ppm,
            "potassiumMeq": k_meq,
            "zincPpm": zn_ppm,
        }
        mode = "regex_text_parser"
    else:
        extracted = {
            "salinityEc": 4.8,
            "salinityMethod": "ECe",
            "salinityUnit": "dS/m",
            "ph": 7.4,
            "organicMatter": 1.4,
            "nitrogenPct": 0.09,
            "phosphorusPpm": 14.0,
            "potassiumMeq": 0.28,
            "zincPpm": 0.8,
        }
        mode = "srdi_template_reference"

    return {
        "fileName": req.fileName,
        "extractionMode": mode,
        "labStandard": "SRDI Khulna Regional Soil Testing Laboratory",
        "extractedFields": extracted,
        "reviewRequired": True,
        "noteEn": "Verify extracted values against your physical SRDI Soil Health Card before saving.",
        "noteBn": "সংরক্ষণের আগে আপনার মূল এসআরডিআই মাটি স্বাস্থ্য কার্ডের সাথে মানগুলো মিলিয়ে নিন।",
    }
