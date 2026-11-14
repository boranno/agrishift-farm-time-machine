# AgriShift — The Farm Time Machine

**Event:** [NASA International Space Apps Challenge 2026](https://www.spaceappschallenge.org/) — [Khulna Local Event](https://www.spaceappschallenge.org/2026/local-events/khulna/)  
**Challenge:** [Field Shift: Adapting Farms with NASA Data](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/)  
**Team:** Daydreammer | **Team Lead:** Boranno Golder  
**Geographic Focus:** Khulna Division, Coastal Bangladesh (AEZ-13 Ganges Tidal Floodplain, AEZ-11, AEZ-14)  
**Live Application Demo:** [https://agrishift-saline-crop-rotation.vercel.app/](https://agrishift-saline-crop-rotation.vercel.app/)  
**30-Second Project Showcase Video:** [Watch on YouTube](https://www.youtube.com/watch?v=8gGJASCex5k)

---

## 1. Executive Summary & Core Farmer Decision

> **One-Sentence Concept:** AgriShift helps a coastal Khulna-Division farmer or extension officer compare their current 3-season crop sequence against feasible, climate-resilient alternatives—showing how 23 years of NASA Earth observations, local soil-salinity (`ECe`) and crop evidence, and the farmer's own priorities affect each option.

Smallholder farmers across coastal Bangladesh (particularly **Satkhira, Khulna, and Bagerhat** in **AEZ-13**) face compounding environmental hazards across the three annual cropping seasons:
- **Rabi (Nov–Mar):** Dry-season capillary rise of saline groundwater (`ECe > 4–16 dS/m`), agricultural drought (`VCI < 35`), and freshwater scarcity that cause traditional Boro rice (`BRRI dhan28`, tolerance threshold `4.0 dS/m`) to fail or leave land fallow.
- **Kharif-1 (Apr–Jun):** Pre-monsoon heat stress (`LST > 35°C`), erratic early rainfall onset (`SPI-3`), and pre-monsoon Bay of Bengal cyclone storm surges (e.g., Cyclones *Aila*, *Amphan*, *Remal*).
- **Kharif-2 (Jul–Oct):** Monsoon surface inundation and prolonged polder root-zone waterlogging inside coastal embankments.

**AgriShift** is a bilingual (**Bangla & English**) agricultural decision-support platform that combines **23 years (2003–2025) of NASA and partner Earth observation data** (`3,321,108` cropland pixel-months across `12,033` 1 km cropland pixels in all 10 Khulna Division districts) with **SRDI, BARC, BRRI, BARI, and BINA agronomic guidance**. It enables farmers and Department of Agricultural Extension (DAE) officers to:
1. Evaluate **season-by-season crop suitability** under observed or simulated soil salinity (`ECe`), pH, drainage, and satellite hazard probabilities.
2. Compare **3-season (`Rabi` → `Kharif-1` → `Kharif-2`) crop rotation sequences** (e.g., shifting from risky `Fallow–Fallow–T. Aman` or high-water `Boro` monoculture to sequences incorporating **salt-tolerant rice** `BRRI dhan67` / `Binadhan-10`, **oilseeds** `BARI Sunflower-2` / `BARI Sarisha-14`, and **nitrogen-fixing pulses** `BARI Mug-6` / `BARI Khesari-3`) weighted by farmer priorities (yield stability, water conservation, soil health, or low input cost).

---

## 2. Team Information — Team Daydreammer

| # | Member Name | Role & Project Contribution | Department | Institution |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Boranno Golder** | **Team Lead** — IoT & Embedded Systems and Machine Learning | Computer Science and Engineering | Daffodil International University |
| **2** | **Takia Binte Mijan** | Agricultural Research | Agricultural Science | Daffodil International University |
| **3** | **Fuad Raj** | Video Editing and Multimedia | Computer Science and Engineering | Eastern University |
| **4** | **Tanjil Shaiket** | Web Developer | Computer Science and Engineering | Eastern University |

---

## 3. NASA & Space Agency Partner Datasets Integrated

Our Google Earth Engine (GEE) and LightGBM pipelines (`ml/data_pipeline/01_export_gee.py`, `04_export_flood_gee.py`, `06_export_surge_inundation_gee.py`) ingest, quality-mask, and harmonize the following open NASA and partner datasets onto a common **1 km MODIS (`MOD13A2`) sinusoidal grid**:

| Dataset / Mission | Provider & Official Source URL | GEE Collection ID | Native Resolution & Cadence | Extracted Variables & Indices | Scientific Contribution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MODIS/Terra Vegetation Indices (`MOD13A2` v061)** | NASA LP DAAC — [doi:10.5067/MODIS/MOD13A2.061](https://lpdaac.usgs.gov/products/mod13a2v061/) | `MODIS/061/MOD13A2` | `1 km`, 16-day (2003–2025) | `NDVI`, `EVI`, `SummaryQA <= 1` | Computes 2003–2019 pixel-month climatology and **Vegetation Condition Index (`VCI`)** for agricultural drought forecasting |
| **MODIS/Terra Land Surface Temp (`MOD11A2` v061)** | NASA LP DAAC — [doi:10.5067/MODIS/MOD11A2.061](https://lpdaac.usgs.gov/products/mod11a2v061/) | `MODIS/061/MOD11A2` | `1 km`, 8-day (2003–2025) | `LST_Day_1km`, `LST_Night_1km` | Computes **Temperature Condition Index (`TCI`)**, canopy thermal stress, and diurnal temperature range |
| **MODIS/Terra Surface Reflectance (`MOD09A1` v061)** | NASA LP DAAC — [doi:10.5067/MODIS/MOD09A1.061](https://lpdaac.usgs.gov/products/mod09a1v061/) | `MODIS/061/MOD09A1` | `500 m` (to `1 km`), 8-day | `sur_refl_b02` (NIR), `b04` (Green), `b06` (SWIR1), `StateQA` | Derives **Land Surface Water Index (`LSWI`)** and **Modified Normalized Difference Water Index (`MNDWI`)** for root-zone waterlogging and inundation |
| **MODIS/Terra+Aqua Land Cover (`MCD12Q1` v061)** | NASA LP DAAC — [doi:10.5067/MODIS/MCD12Q1.061](https://lpdaac.usgs.gov/products/mcd12q1v061/) | `MODIS/061/MCD12Q1` | `500 m` (to `1 km`), Annual | `LC_Type1` (IGBP classes `12` & `14`) | Isolates `12,033` agricultural cropland pixels across 10 Khulna districts and masks permanent water (`LC_Type1 == 17`) |
| **Shuttle Radar Topography Mission (`SRTMGL1` v003)** | NASA JPL / USGS — [doi:10.5067/MEaSUREs/SRTM/SRTMGL1.003](https://lpdaac.usgs.gov/products/srtmgl1v003/) | `USGS/SRTMGL1_003` | `30 m` (to `1 km`), Static | `elevation` (m above geoid) | Quantifies micro-topographic flood susceptibility and cyclone storm-surge overtopping height (`surge_over_elev_m`) |
| **MODIS Global Flood Database (`V1`)** | NASA / Cloud to Street — [Global Flood DB](https://developers.google.com/earth-engine/datasets/catalog/GLOBAL_FLOOD_DB_MODIS_EVENTS_V1) | `GLOBAL_FLOOD_DB/MODIS_EVENTS/V1` | `250 m`, Event-based | `flooded` binary footprint | Provides historical surge inundation ground-truth labels for pre-Sentinel-1 **Cyclone Sidr (2007)** (`n = 11,605` pixels) |
| **CHIRPS Daily Precipitation (`v2.0`)** | UCSB / NASA / USAID / NOAA — [CHIRPS v2.0](https://www.chc.ucsb.edu/data/chirps) | `UCSB-CHG/CHIRPS/DAILY` | `0.05°` (~5.5 km), Daily | `precipitation` (`rain_mm`) | Computes Standardized Precipitation Index (`SPI-1`, `SPI-3`, `SPI-6`), rainfall anomalies, and 5-day cyclone storm rainfall |
| **Sentinel-1 SAR GRD** | ESA Copernicus — [Sentinel-1 SAR](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD) | `COPERNICUS/S1_GRD` | `10 m` (`30 m` focal), 6–12d | C-band `VV` backscatter (dB) | Cloud-penetrating radar detection of monsoon surface flood (`VV < -18 dB`) and cyclone storm surge (`VV < -16 dB`) |
| **ERA5-Land Reanalysis** | ECMWF Copernicus — [ERA5-Land](https://cds.climate.copernicus.eu/) | `ECMWF/ERA5_LAND/MONTHLY_AGGR` & `HOURLY` | `0.1°` (~9 km), Monthly & Hourly | `swl1..3`, `t2m_K`, `pet_m`, `et_m`, `runoff`, `u10/v10`, `msl` | Root-zone soil moisture anomalies (`swl1_z`), evaporative deficit (`PET - ET`), and cyclone wind/pressure forcing |
| **MERIT Hydro & JRC Global Surface Water** | UTokyo / EC JRC — [MERIT Hydro](http://hydro.iis.u-tokyo.ac.jp/~yamadai/MERIT_Hydro/) & [JRC GSW](https://global-surface-water.appspot.com/) | `MERIT/Hydro/v1_0_1` & `JRC/GSW1_4` | `90 m` & `30 m`, Static/Annual | `hnd`, `upa`, `occurrence`, `seasonality` | Drainage impedance (`hnd`) and **permanent shrimp aquaculture (*gher*) exclusion mask** (`seasonality >= 10` months) |
| **NOAA IBTrACS (`v04r01`)** | NOAA NCEI — [IBTrACS v04r01](https://www.ncei.noaa.gov/products/international-best-track-archive) | Track CSV / GEE | 3–6 hourly storm track | Cyclone eye coordinates, `Vmax`, `Pmin` | Computes minimum distance to storm track (`min_track_dist_km`) and Holland-style coastal surge proxy across 8 Bay of Bengal cyclones |

---

## 4. Scientific Methodology, Data Harmonization & Limitations

In strict compliance with NASA Space Apps scientific communication requirements, AgriShift makes the following distinctions explicit across both documentation and the user interface:

1. **Satellite Indicators vs. Ground Soil Salinity Measurements (`ECe`):**
   - Optical, thermal, and radar satellite sensors **do not directly measure soil electrical conductivity (`ECe` in `dS/m`)**.
   - In AgriShift, NASA and partner satellite observations quantify **vegetation stress (`VCI`), canopy/surface water (`LSWI`, `MNDWI`, Sentinel-1 `VV`), thermal stress (`TCI`), and topographic drainage (`SRTM`, `MERIT Hydro`)**.
   - Soil salinity (`ECe` in `dS/m`) and nutrient values (`pH`, `N`, `P`, `K`) come from **Bangladesh Soil Resource Development Institute (SRDI) in-situ laboratory surveys**, **MIT Eltahir Group regional projections (2000–2050)**, or **farmer soil-test cards** entered manually or via browser-side OCR.
2. **Spatial & Temporal Resolution Harmonization (Avoiding False Field-Level Precision):**
   - Different sensors operate at different footprints (`30 m` SRTM/JRC, `10–30 m` Sentinel-1 SAR, `500 m` MOD09A1/MCD12Q1, `1 km` MOD13A2/MOD11A2, `~5.5 km` CHIRPS, `~9 km` ERA5-Land).
   - Fine-scale water/elevation masks (`30 m`) are aggregated as fractional coverage (`s1_flood_frac`, `jrc_perm_water_frac`) within each `1 km` MODIS cropland cell, while coarse climate fields (`CHIRPS`, `ERA5-Land`) provide regional hydro-meteorological context. A `1 km` pixel (~100 hectares) represents a community/sub-upazila agricultural zone, **not** an individual smallholder plot boundary.
3. **Decision-Support Advisory Scope:**
   - AgriShift is a decision-support exploration tool designed to complement—**never replace**—local agronomic expertise from **DAE Sub-Assistant Agriculture Officers (SAAOs)**, **SRDI soil laboratories**, and **BRRI/BARI/BINA field trials**.

---

## 5. Machine Learning Pipeline & Verified Validation Benchmarks

Our four LightGBM hazard models (`ml/artifacts/`) were trained on the 23-year Khulna Division panel (`3,321,108` cropland pixel-months) using strict **temporal splitting** (`train <= 2019`, `validation 2020–2021`, `held-out test 2022–2025`), **5-fold `0.1°` (~11 km) spatial block cross-validation**, and **8-storm Leave-One-Storm-Out (LOSO)** validation:

| Hazard Model | Serialized Artifact (`ml/artifacts/`) | Target Definition & Horizon | Held-Out Test Rows | Verified Held-Out Test Metrics |
| :--- | :--- | :--- | :--- | :--- |
| **1. Root-Zone Waterlogging** | `flood_waterlogging_lgbm_h1.joblib` (`91` features, optical + hydro + ERA5-Land, no SAR) | 1-month-ahead root-zone saturation (`swl1_z > 0.75` OR (`MNDWI > -0.15` & `LSWI > 0.15`)) | `565,551` (2022–2025) | **ROC-AUC = `0.9715`** \| **PR-AUC = `0.8726`** (vs. Persistence `0.5835`) \| **Brier = `0.0503`** \| **F1 = `0.8004`** \| **Precision = `85.40%`** \| **Recall = `75.32%`** |
| **2. Surface Flood Inundation** | `flood_inundation_lgbm_h1.joblib` (`105` features, Sentinel-1 SAR + MODIS + hydro) | 1-month-ahead *gher*-masked SAR open water (`s1_flood_frac > 0.15`, `seasonality < 10`) | `421,155` (2022–2025) | **ROC-AUC = `0.9378`** \| **PR-AUC = `0.4738`** (`+125%` over Persistence `0.2105`) \| **Brier = `0.0295`** \| **F1 = `0.4723`** \| **Recall = `59.97%`** |
| **3. Cyclone Storm Surge** | `surge_inundation_lgbm.joblib` (`34` features, IBTrACS + SRTM + MERIT + ERA5) | Event-level surge inundation across 8 cyclones (Sidr 2007 to Remal 2024, LOSO CV) | `94,623` (8-storm LOSO) | **Mean LOSO ROC-AUC = `0.8377`** \| **Mean PR-AUC = `0.2788`** (`2.83x` Physics Bathtub `0.0985`) \| **Cyclone Remal (2024): ROC-AUC = `0.9545`, Precision = `93.02%`** \| **Cyclone Roanu (2016): ROC-AUC = `0.9524`, Precision = `97.30%`** |
| **4. Agricultural Drought** | `drought_lgbm_reg_h1.joblib` (`ΔVCI` regression reconstructed to `VCI(t+1) < 35`) | 1-month-ahead moderate-to-severe vegetation stress (`drought_vci_roll < 35`) | `577,584` (2022–2025) | **ROC-AUC = `0.6512`** (`0.6480` unpruned) \| **PR-AUC = `0.3540`** \| **Brier = `0.1598`** \| **F1 = `0.3943`** \| **Recall = `60.00%`** \| `ΔVCI` **MAE = `24.67`**, $R^2 = +0.0649$ |

### Key Scientific Innovations
- **Aquaculture (*Gher*) Decontamination:** In Satkhira, Khulna, and Bagerhat, year-round brackish shrimp ponds (*ghers*) exhibit low radar backscatter (`VV < -18 dB`) identical to floodwater. By masking pixels with `JRC Global Surface Water seasonality >= 10` months (`04_export_flood_gee.py`), AgriShift prevents permanent aquaculture from corrupting agricultural flood labels.
- **Physics-Guided Storm Surge Overtopping:** Combines NOAA IBTrACS cyclone wind/pressure tracks, SRTM 30 m elevation (`surge_over_elev_m`), and MERIT Hydro Height Above Nearest Drainage (`hnd`), outperforming a pure elevation bathtub model by **2.83× in PR-AUC**.
- **Two-Stage $\Delta\text{VCI}$ Reconstruction:** Predicts the 1-month change in Vegetation Condition Index ($\Delta\text{VCI}_{t \to t+1}$) and reconstructs $\widehat{\text{VCI}}_{t+1} = \text{clip}(\text{VCI}_t + \widehat{\Delta\text{VCI}}, 0, 100)$ to overcome persistence bias in bounded satellite vegetation indices.

---

## 6. Application Features & Implementation Status

AgriShift transparently distinguishes **implemented browser features**, **offline-executed GEE/Colab ML artifacts**, **external live web services**, and **planned backend/database integrations**:

### A. Implemented in the Bilingual (Bangla & English) Web Application (`frontend/`)
- **3-Season Crop Rotation Planner (`/rotation-planner`, `/intelligent-rotation`):** Compares baseline coastal rotations against resilient 3-season (`Rabi` → `Kharif-1` → `Kharif-2`) alternatives across 6 criteria (soil health, salinity resilience, water demand, economic return, risk diversification, and nutrient balance) with interactive farmer priority weighting.
- **Crop Suitability & Researcher Evidence Review (`/crop-suitability`, `/ml-suitability`):** Deterministic suitability scoring across 10 coastal crops (`BRRI dhan67`, `BRRI dhan47`, `Binadhan-10`, `BRRI dhan28`, `BARI Sarisha-14`, `BARI Sunflower-2`, `BARI Mug-6`, `BARI Khesari-3`, `BARI Alu-72`, `BARI Gom-30`) paired with a source-linked **Crop Evidence Panel** (`CropEvidencePanel.jsx`) surfacing agronomic caveats from the researcher workbook.
- **Interactive Coastal Farm Map (`/farm-map`):** MapLibre GL geospatial viewer supporting OpenStreetMap/Esri/CARTO basemaps, live OpenStreetMap Nominatim place search & reverse geocoding (`geocodingService.js`), field polygon drawing, and Khulna Division Upazila presets.
- **Browser-Side Soil Test Card OCR (`/soil-report`):** Client-side Tesseract.js + PDF.js extraction of `pH`, saturated-paste `ECe (dS/m)`, and `NPK (mg/kg or ppm)` from uploaded soil reports, plus a clearly labeled one-click illustrative demo and manual verification form saved to `localStorage`.
- **What-If Climate Simulator & Scenario Comparison (`/what-if-simulator`, `/scenario-comparison`):** Interactive sensitivity testing of crop suitability under user-adjusted soil salinity (`ECe`), rainfall change (`%`), temperature shift (`+°C`), and water availability.
- **MIT Regional Soil Salinity Explorer (`/salinity-prediction`):** Displays published historical observations (2000–2016) and SSP5-8.5 regional projections (2030, 2050) from the MIT Eltahir Group Bangladesh Soil Salinity dataset, clearly distinguished from farm-level measurements.
- **ML Validation & Provenance Hub (`/model-evaluation`, `/data-sources`):** Interactive inspection of held-out ROC-AUC, PR-AUC, Brier calibration, confusion matrices, district-level hazard rates across all 10 Khulna Division districts, and dataset provenance badges.

### B. Offline-Capable Core vs. External Network Dependencies
- **Works 100% Offline:** All 16 routes, bilingual translations (`bn.json`, `en.json`), deterministic suitability & rotation engines, precomputed 10-district ML evaluation benchmarks (`modelService.js`), What-If simulations, manual soil-report entry, and the one-click illustrative soil demo run entirely in the browser using `localStorage` and local fixtures.
- **Requires Internet Connection:** MapLibre raster basemap tiles (OSM/Esri/CARTO), live place search/reverse geocoding (`nominatim.openstreetmap.org`), MIT external salinity PNG rasters (`mit.edu`), and first-time CDN loading of Tesseract.js/PDF.js for image/PDF OCR (`cdn.jsdelivr.net`).

### C. Planned / Scaffolded Components (`backend/`, `database/`)
- [`backend/app/main.py`](./backend/app/main.py) provides a FastAPI health check (`GET /health`) and API v1 directory structure. Live `/api/v1/*` model inference endpoints (documented in [`frontend/API_INTEGRATION_NOTES.md`](./frontend/API_INTEGRATION_NOTES.md)), PostgreSQL persistence (`database/`), and automated river/canal IoT salinity telemetry are architectural scaffolds planned for post-hackathon deployment.

---

## 7. Repository Structure

```text
AgriShift/
├── frontend/                     # React 18 + Vite 5 bilingual (BN/EN) web application (16 routes)
│   ├── public/                   # Static NASA globe & spacecraft visual assets
│   ├── src/
│   │   ├── components/           # Shared UI, CropEvidencePanel, MapLibre FarmMapViewer, 3D Globe
│   │   ├── context/              # FarmContext & LanguageContext (persisted in localStorage)
│   │   ├── locales/              # Complete Bangla (bn.json) & English (en.json) translations
│   │   ├── pages/                # 16 application pages (Map, Suitability, Rotation, Models, OCR, etc.)
│   │   └── services/             # Deterministic agronomic engines, ML benchmark store & OCR parser
│   └── tests/verify-frontend.js  # Automated frontend route & service verification script
├── ml/                           # Earth Observation & Machine Learning Pipeline
│   ├── artifacts/                # 4 trained LightGBM (.joblib) models (Drought, Inundation, Waterlogging, Surge)
│   ├── data_pipeline/            # Python scripts (01–10) for GEE export, feature engineering & training
│   ├── notebooks/
│   │   ├── executed/             # Final executed Colab training notebooks with full cell outputs
│   │   └── pipeline/             # Clean 01–10 Jupyter notebooks for Google Colab + GEE
│   ├── tests/                    # Synthetic unit test generators & runner for pipeline verification
│   ├── AgriShift_Drought_Dataset_Handoff.md
│   ├── PIPELINE_REVIEW_GUIDE.md
│   └── requirements.txt
├── agronomy/                     # SRDI/BRRI/BARI/BINA Khulna crop database (.xlsx) & validity analysis (.docx)
├── backend/                      # FastAPI backend service scaffold (/health & API v1 router structure)
├── database/                     # PostgreSQL relational schema documentation & migration directories
├── docs/                         # NASA data provenance, ML model card, AI disclosure (AI_USE.md) & technical audit
├── ARCHITECTURE.md               # Verified system architecture & component connection audit
├── DEVELOPMENT_GUIDE.md          # Local development setup instructions
└── LICENSE                       # MIT Open Source License
```

---

## 8. Getting Started (Run Locally)

### Prerequisites
- **Node.js** `>= 18.x` and **npm**
- **Python** `>= 3.10` *(optional, for running the FastAPI scaffold or offline ML scripts)*

### 1. Run the Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

To verify the production build locally:
```bash
npm run build
npm run preview
```

> **Windows PowerShell Execution Policy Tip:** If PowerShell blocks `npm.ps1`, run `npm.cmd run dev` or `npm.cmd run preview` instead.

### 2. Run the FastAPI Backend Scaffold (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Health check endpoint: `http://localhost:8000/health`

---

## 9. AI Use Disclosure & Project Documentation

In compliance with NASA Space Apps Challenge rules on transparent AI use:
- **AI Use Disclosure:** AI coding and documentation assistants (GitHub Copilot / Antigravity) were used for UI scaffolding, bilingual translation drafting, browser OCR integration, and technical documentation formatting. **No AI model or LLM was used to generate NASA satellite observations, field measurements, agronomic thresholds, or ML validation metrics.** All scientific calculations and model evaluations are deterministic and human-reviewed. Full logs are recorded in [`docs/AI_USE.md`](./docs/AI_USE.md).
- **NASA & Partner Data Provenance:** [`docs/nasa_data_sources.md`](./docs/nasa_data_sources.md)
- **Machine Learning Model Card:** [`docs/ml_model_card.md`](./docs/ml_model_card.md)
- **Complete Technical & Scientific Audit:** [`docs/AGRI_SHIFT_NASA_TECHNICAL_AUDIT.md`](./docs/AGRI_SHIFT_NASA_TECHNICAL_AUDIT.md)
- **Agronomic Data & Relational Schema Guide:** [`docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md`](./docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md)
- **System Architecture Audit:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## 10. License

This project is released under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
