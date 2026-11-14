-- AgriShift Seed Data (001_seed_khulna_agronomy.sql)
-- Seeds canonical sources, Khulna/Dacope demo site & plot, initial soil sample, and coastal crops.

INSERT INTO sources (
    source_id, citation_or_title, organization_or_authors, publication_year,
    url_or_archive_reference, page_table_or_section, data_owner,
    license_or_permission, attribution_required, allowed_project_use, reviewer
) VALUES
    ('src-srdi-2023', 'Saline Soils of Bangladesh and Management Monograph', 'Soil Resource Development Institute (SRDI)', 2023, 'http://www.srdi.gov.bd', 'AEZ-13 Khulna/Satkhira Tables', 'SRDI Ministry of Agriculture', 'public_government_guidance', TRUE, 'Agronomic decision support and soil salinity baseline reference', 'Team Daydreammer'),
    ('src-brri-2024', 'Adhunik Dhaner Chash (Modern Rice Cultivation, 24th Ed.)', 'Bangladesh Rice Research Institute (BRRI)', 2024, 'https://www.brri.gov.bd', 'Salt-Tolerant Rice Varieties Section', 'BRRI', 'public_government_guidance', TRUE, 'Cultivar salinity thresholds and growth duration reference', 'Team Daydreammer'),
    ('src-bari-2023', 'Krishi Projukti Hatboi (Handbook on Agro-Technology, 9th Ed.)', 'Bangladesh Agricultural Research Institute (BARI)', 2023, 'https://www.bari.gov.bd', 'Oilseeds, Pulses, and Tuber Crops', 'BARI', 'public_government_guidance', TRUE, 'Rabi and Kharif-1 crop suitability and rotation guidance', 'Team Daydreammer')
ON CONFLICT (source_id) DO NOTHING;

INSERT INTO sites (
    site_id, district, upazila, union_name, village_or_polder,
    latitude, longitude, coordinate_accuracy_m, aez_code, site_context, location_source
) VALUES (
    'site-dacope-polder31', 'Khulna', 'Dacope', 'Bajua Union', 'Bajua (Polder 31)',
    22.572100, 89.512400, 100.0, 'AEZ-13',
    'Ganges Tidal Floodplain coastal polder affected by dry-season canal and topsoil salinity intrusion.',
    'administrative_centroid'
) ON CONFLICT (site_id) DO NOTHING;

INSERT INTO plots (
    plot_id, site_id, farm_name, farmer_name, area_m2, land_size_value, land_size_unit,
    soil_texture, drainage_class, irrigation_access, current_crops_json, previous_crop,
    elevation_m, embankment_distance_km
) VALUES (
    'plot-farm-demo-001', 'site-dacope-polder31', 'Sundarban Coastal Model Farm', 'Md. Rafiqul Islam',
    6020.0, 4.5, 'bigha', 'silty-clay', 'poor', 'canal',
    '["T. Aman Rice (BRRI dhan73)", "Sunflower"]', 'T. Aman Rice',
    1.8, 1.2
) ON CONFLICT (plot_id) DO NOTHING;
