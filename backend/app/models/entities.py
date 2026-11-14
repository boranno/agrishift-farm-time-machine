"""SQLAlchemy ORM models aligned with database/schema/001_initial_schema.sql."""
from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Source(Base):
    __tablename__ = "sources"

    source_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    citation_or_title: Mapped[str] = mapped_column(Text, nullable=False)
    organization_or_authors: Mapped[str] = mapped_column(Text, nullable=False)
    publication_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    url_or_archive_reference: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    page_table_or_section: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    data_owner: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    access_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    license_or_permission: Mapped[str] = mapped_column(
        String(128), nullable=False, default="public_government_guidance"
    )
    attribution_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    allowed_project_use: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    limitations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewer: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)


class Crop(Base):
    __tablename__ = "crops"

    crop_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    crop_name_en: Mapped[str] = mapped_column(String(160), nullable=False)
    crop_name_bn: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    crop_name_local: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    scientific_name: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    crop_group: Mapped[str] = mapped_column(String(64), nullable=False)
    crop_use: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    seasons_json: Mapped[str] = mapped_column(Text, nullable=False, default='["rabi"]')
    max_salinity_ec: Mapped[float] = mapped_column(Float, nullable=False)
    critical_salinity_ec: Mapped[float] = mapped_column(Float, nullable=False)
    salinity_method: Mapped[str] = mapped_column(String(32), nullable=False, default="ECe")
    salinity_unit: Mapped[str] = mapped_column(String(32), nullable=False, default="dS/m")
    water_need_en: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    water_need_bn: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    duration_days: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    soil_ph_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    soil_ph_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    yield_potential: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_bn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_factors_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_factors_bn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    identity_review_status: Mapped[str] = mapped_column(String(32), nullable=False, default="reviewed")


class CropVariety(Base):
    __tablename__ = "crop_varieties"

    variety_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    crop_id: Mapped[str] = mapped_column(String(64), ForeignKey("crops.crop_id"), nullable=False)
    variety_name: Mapped[str] = mapped_column(String(160), nullable=False)
    variety_name_local: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    release_or_registration_source_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("sources.source_id"), nullable=True
    )
    duration_days_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    duration_days_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    seed_or_propagule_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_status: Mapped[str] = mapped_column(String(32), nullable=False, default="reviewed")
    reviewer: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    review_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)


class Site(Base):
    __tablename__ = "sites"

    site_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    district: Mapped[str] = mapped_column(String(64), nullable=False)
    upazila: Mapped[str] = mapped_column(String(64), nullable=False)
    union_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    village_or_polder: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    coordinate_accuracy_m: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    aez_code: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    site_context: Mapped[str] = mapped_column(Text, nullable=False)
    location_source: Mapped[str] = mapped_column(String(64), nullable=False)

    plots: Mapped[list["Plot"]] = relationship("Plot", back_populates="site", cascade="all, delete-orphan")


class Plot(Base):
    __tablename__ = "plots"

    plot_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    site_id: Mapped[str] = mapped_column(String(64), ForeignKey("sites.site_id"), nullable=False)
    farm_name: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    farmer_name: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    area_m2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    land_size_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    land_size_unit: Mapped[str] = mapped_column(String(32), nullable=False, default="bigha")
    soil_texture: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    drainage_class: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    irrigation_access: Mapped[str] = mapped_column(String(32), nullable=False, default="canal")
    current_crops_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    previous_crop: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    elevation_m: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    embankment_distance_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    site: Mapped["Site"] = relationship("Site", back_populates="plots")
    soil_samples: Mapped[list["SoilSample"]] = relationship(
        "SoilSample", back_populates="plot", cascade="all, delete-orphan"
    )


class SoilSample(Base):
    __tablename__ = "soil_samples"

    sample_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    plot_id: Mapped[str] = mapped_column(String(64), ForeignKey("plots.plot_id"), nullable=False)
    sample_date: Mapped[date] = mapped_column(Date, nullable=False)
    crop_stage: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    depth_top_cm: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    depth_bottom_cm: Mapped[float] = mapped_column(Float, nullable=False, default=15.0)
    sampling_method: Mapped[str] = mapped_column(String(64), nullable=False, default="composite_topsoil")
    lab_name: Mapped[str] = mapped_column(String(128), nullable=False, default="SRDI Regional Lab Khulna")
    lab_report_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    # Domain integrity: preserve ECe vs EC1:5 explicitly; missing values remain None (NULL)
    salinity_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salinity_unit: Mapped[str] = mapped_column(String(32), nullable=False, default="dS/m")
    salinity_method: Mapped[str] = mapped_column(String(32), nullable=False, default="ECe")
    salinity_reference_temp_c: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=25.0)
    ph_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    organic_matter_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nitrogen_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    phosphorus_ppm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    potassium_meq: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    zinc_ppm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    moisture_status: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    drainage_condition: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    texture_class: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    texture_method: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    replicate_id: Mapped[str] = mapped_column(String(32), nullable=False, default="rep-1")
    quality_flag: Mapped[str] = mapped_column(String(32), nullable=False, default="verified")

    plot: Mapped["Plot"] = relationship("Plot", back_populates="soil_samples")


class RotationTreatment(Base):
    __tablename__ = "rotation_treatments"

    treatment_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    treatment_name_en: Mapped[str] = mapped_column(String(160), nullable=False)
    treatment_name_bn: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    comparison_role: Mapped[str] = mapped_column(String(32), nullable=False, default="alternative")
    sequence_description_en: Mapped[str] = mapped_column(Text, nullable=False)
    sequence_description_bn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    suitability_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    priorities_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    soil_salinity_suitability_en: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    soil_salinity_suitability_bn: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    water_requirement_level_en: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    water_requirement_level_bn: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    rationale_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rationale_bn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence_type: Mapped[str] = mapped_column(String(64), nullable=False, default="published_recommendation")
    review_status: Mapped[str] = mapped_column(String(32), nullable=False, default="reviewed")

    steps: Mapped[list["RotationTreatmentStep"]] = relationship(
        "RotationTreatmentStep",
        back_populates="treatment",
        cascade="all, delete-orphan",
        order_by="RotationTreatmentStep.step_order",
    )


class RotationTreatmentStep(Base):
    __tablename__ = "rotation_treatment_steps"

    step_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    treatment_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("rotation_treatments.treatment_id"), nullable=False
    )
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    season_key: Mapped[str] = mapped_column(String(32), nullable=False)
    season_name_en: Mapped[str] = mapped_column(String(64), nullable=False)
    season_name_bn: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    crop_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("crops.crop_id"), nullable=True)
    crop_name_en: Mapped[str] = mapped_column(String(160), nullable=False)
    crop_name_bn: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    action_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action_bn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    benefit_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    benefit_bn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    treatment: Mapped["RotationTreatment"] = relationship("RotationTreatment", back_populates="steps")
