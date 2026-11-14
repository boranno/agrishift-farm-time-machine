-- AgriShift Relational Database Schema (001_initial_schema.sql)
-- Canonical relational design aligned with docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md
-- Enforces explicit salinity_method ('ECe', 'EC1:5', 'ECw'), salinity_unit, and nullable missing values.

CREATE TABLE IF NOT EXISTS sources (
    source_id VARCHAR(64) PRIMARY KEY,
    citation_or_title TEXT NOT NULL,
    organization_or_authors TEXT NOT NULL,
    publication_year INTEGER,
    url_or_archive_reference TEXT,
    page_table_or_section TEXT,
    data_owner TEXT,
    access_date DATE,
    license_or_permission VARCHAR(128) NOT NULL DEFAULT 'permission_not_yet_confirmed',
    attribution_required BOOLEAN NOT NULL DEFAULT TRUE,
    allowed_project_use TEXT,
    limitations TEXT,
    reviewer VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS crops (
    crop_id VARCHAR(64) PRIMARY KEY,
    crop_name_en VARCHAR(160) NOT NULL,
    crop_name_bn VARCHAR(160),
    crop_name_local VARCHAR(160),
    scientific_name VARCHAR(160),
    crop_group VARCHAR(64) NOT NULL,
    crop_use VARCHAR(128),
    seasons_json TEXT NOT NULL,
    max_salinity_ec NUMERIC(5, 2) NOT NULL,
    critical_salinity_ec NUMERIC(5, 2) NOT NULL,
    salinity_method VARCHAR(32) NOT NULL DEFAULT 'ECe',
    salinity_unit VARCHAR(32) NOT NULL DEFAULT 'dS/m',
    water_need_en VARCHAR(160),
    water_need_bn VARCHAR(160),
    duration_days VARCHAR(64),
    soil_ph_min NUMERIC(4, 2),
    soil_ph_max NUMERIC(4, 2),
    yield_potential VARCHAR(64),
    description_en TEXT,
    description_bn TEXT,
    risk_factors_en TEXT,
    risk_factors_bn TEXT,
    identity_review_status VARCHAR(32) NOT NULL DEFAULT 'reviewed'
);

CREATE TABLE IF NOT EXISTS crop_varieties (
    variety_id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(64) NOT NULL REFERENCES crops(crop_id) ON DELETE CASCADE,
    variety_name VARCHAR(160) NOT NULL,
    variety_name_local VARCHAR(160),
    release_or_registration_source_id VARCHAR(64) REFERENCES sources(source_id),
    duration_days_min INTEGER,
    duration_days_max INTEGER,
    seed_or_propagule_notes TEXT,
    review_status VARCHAR(32) NOT NULL DEFAULT 'reviewed',
    reviewer VARCHAR(128),
    review_date DATE
);

CREATE TABLE IF NOT EXISTS crop_stage_evidence (
    evidence_id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(64) NOT NULL REFERENCES crops(crop_id) ON DELETE CASCADE,
    variety_id VARCHAR(64) REFERENCES crop_varieties(variety_id) ON DELETE SET NULL,
    stage_code VARCHAR(64) NOT NULL,
    stage_name_local VARCHAR(128),
    stage_name_en VARCHAR(128) NOT NULL,
    stage_start_day_min INTEGER,
    stage_start_day_max INTEGER,
    factor VARCHAR(64),
    response_type TEXT,
    threshold_min NUMERIC(6, 2),
    threshold_max NUMERIC(6, 2),
    threshold_unit VARCHAR(32),
    conditions_and_scope TEXT NOT NULL,
    evidence_type VARCHAR(64) NOT NULL,
    review_status VARCHAR(32) NOT NULL DEFAULT 'reviewed'
);

CREATE TABLE IF NOT EXISTS sites (
    site_id VARCHAR(64) PRIMARY KEY,
    district VARCHAR(64) NOT NULL,
    upazila VARCHAR(64) NOT NULL,
    union_name VARCHAR(128),
    village_or_polder VARCHAR(128),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    coordinate_accuracy_m NUMERIC(8, 2),
    aez_code VARCHAR(32),
    site_context TEXT NOT NULL,
    location_source VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS plots (
    plot_id VARCHAR(64) PRIMARY KEY,
    site_id VARCHAR(64) NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
    farm_name VARCHAR(160),
    farmer_name VARCHAR(160),
    area_m2 NUMERIC(10, 2) CHECK (area_m2 IS NULL OR area_m2 > 0),
    land_size_value NUMERIC(8, 2),
    land_size_unit VARCHAR(32) DEFAULT 'bigha',
    soil_texture VARCHAR(64),
    drainage_class VARCHAR(64),
    irrigation_access VARCHAR(32) NOT NULL DEFAULT 'canal',
    current_crops_json TEXT,
    previous_crop VARCHAR(128),
    elevation_m NUMERIC(6, 2),
    embankment_distance_km NUMERIC(6, 2),
    record_start_date DATE,
    record_end_date DATE
);

CREATE TABLE IF NOT EXISTS soil_samples (
    sample_id VARCHAR(64) PRIMARY KEY,
    plot_id VARCHAR(64) NOT NULL REFERENCES plots(plot_id) ON DELETE CASCADE,
    sample_date DATE NOT NULL,
    crop_stage VARCHAR(64),
    depth_top_cm NUMERIC(5, 1) NOT NULL DEFAULT 0.0,
    depth_bottom_cm NUMERIC(5, 1) NOT NULL DEFAULT 15.0,
    sampling_method VARCHAR(64) NOT NULL DEFAULT 'composite_topsoil',
    lab_name VARCHAR(128) NOT NULL DEFAULT 'SRDI Regional Lab Khulna',
    lab_report_id VARCHAR(64),
    -- Domain integrity: preserve ECe vs EC1:5 explicitly; missing values remain NULL
    salinity_value NUMERIC(6, 2),
    salinity_unit VARCHAR(32) NOT NULL DEFAULT 'dS/m',
    salinity_method VARCHAR(32) NOT NULL DEFAULT 'ECe',
    salinity_reference_temp_c NUMERIC(4, 1) DEFAULT 25.0,
    ph_value NUMERIC(4, 2),
    organic_matter_pct NUMERIC(5, 2),
    nitrogen_pct NUMERIC(5, 3),
    phosphorus_ppm NUMERIC(6, 2),
    potassium_meq NUMERIC(5, 2),
    zinc_ppm NUMERIC(5, 2),
    moisture_status VARCHAR(32),
    drainage_condition VARCHAR(32),
    texture_class VARCHAR(64),
    texture_method VARCHAR(64),
    replicate_id VARCHAR(32) NOT NULL DEFAULT 'rep-1',
    quality_flag VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE IF NOT EXISTS water_samples (
    water_sample_id VARCHAR(64) PRIMARY KEY,
    plot_id VARCHAR(64) REFERENCES plots(plot_id) ON DELETE CASCADE,
    site_id VARCHAR(64) REFERENCES sites(site_id) ON DELETE CASCADE,
    sample_date DATE NOT NULL,
    water_source VARCHAR(64) NOT NULL,
    ecw_value NUMERIC(6, 2),
    ecw_unit VARCHAR(32) NOT NULL DEFAULT 'dS/m',
    method VARCHAR(64) NOT NULL DEFAULT 'ECw_portable_meter',
    lab_name VARCHAR(128),
    quality_flag VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE IF NOT EXISTS rotation_treatments (
    treatment_id VARCHAR(64) PRIMARY KEY,
    treatment_name_en VARCHAR(160) NOT NULL,
    treatment_name_bn VARCHAR(160),
    comparison_role VARCHAR(32) NOT NULL,
    sequence_description_en TEXT NOT NULL,
    sequence_description_bn TEXT,
    suitability_score INTEGER,
    priorities_json TEXT,
    soil_salinity_suitability_en VARCHAR(160),
    soil_salinity_suitability_bn VARCHAR(160),
    water_requirement_level_en VARCHAR(160),
    water_requirement_level_bn VARCHAR(160),
    rationale_en TEXT,
    rationale_bn TEXT,
    evidence_type VARCHAR(64) NOT NULL DEFAULT 'published_recommendation',
    review_status VARCHAR(32) NOT NULL DEFAULT 'reviewed'
);

CREATE TABLE IF NOT EXISTS rotation_treatment_steps (
    step_id VARCHAR(64) PRIMARY KEY,
    treatment_id VARCHAR(64) NOT NULL REFERENCES rotation_treatments(treatment_id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    season_key VARCHAR(32) NOT NULL,
    season_name_en VARCHAR(64) NOT NULL,
    season_name_bn VARCHAR(64),
    crop_id VARCHAR(64) REFERENCES crops(crop_id) ON DELETE SET NULL,
    crop_name_en VARCHAR(160) NOT NULL,
    crop_name_bn VARCHAR(160),
    action_en TEXT,
    action_bn TEXT,
    benefit_en TEXT,
    benefit_bn TEXT
);

CREATE TABLE IF NOT EXISTS environmental_observations (
    observation_id VARCHAR(64) PRIMARY KEY,
    site_id VARCHAR(64) REFERENCES sites(site_id) ON DELETE CASCADE,
    plot_id VARCHAR(64) REFERENCES plots(plot_id) ON DELETE CASCADE,
    observation_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    variable VARCHAR(64) NOT NULL,
    value NUMERIC(10, 4),
    unit VARCHAR(32) NOT NULL,
    measurement_method VARCHAR(64) NOT NULL,
    source_id VARCHAR(64) REFERENCES sources(source_id),
    spatial_temporal_scale VARCHAR(64),
    quality_flag VARCHAR(32) NOT NULL DEFAULT 'verified'
);
