# AgriShift — System Architecture & Component Connections

> **Audit Status:** Verified against actual source code on `2026-11-10`.  
> **Rule Applied:** Strictly distinguishes **Implemented in Code** vs. **Planned / Specified in Docs** vs. **Not Present / UNKNOWN**.

---

## 1. High-Level System Architecture

AgriShift is an agricultural decision-support platform designed for the **NASA Space Apps 2026** challenge (*"Field Shift: Adapting Farms with NASA Data"*), targeting smallholder farmers and DAE extension officers in saline-prone coastal Bangladesh (specifically Khulna Division / AEZ 13).

### Current Reality vs. Target Architecture

```mermaid
flowchart TD
    subgraph Client["Browser Client (Implemented)"]
        UI["React 18 + Vite 5 SPA<br/>(16 Routes, Bilingual BN/EN)"]
        CTX["React Context State<br/>(FarmContext, LanguageContext)"]
        LS[("Browser localStorage<br/>agrishift_* keys")]
        SVC["Frontend Services<br/>(Rule Engines & Demo Fixtures)"]
        API_CLI["apiClient.js<br/>(Fetch Wrapper - UNUSED)"]
    end

    subgraph External_Live["External Live Web Services (Connected)"]
        OSM_TILES["OSM / Esri / CARTO<br/>Map Raster Tiles"]
        NOM["OSM Nominatim API<br/>(Search & Reverse Geocode)"]
        MIT["MIT Eltahir Group Server<br/>(Salinity PNG Rasters 2000-2050)"]
    end

    subgraph Backend_Layer["FastAPI Backend (Scaffold Only)"]
        MAIN["backend/app/main.py<br/>(GET /health only)"]
        ROUTER["backend/app/api/router.py<br/>(Empty APIRouter, unwired)"]
    end

    subgraph Data_Storage["Database Layer (Not Connected)"]
        PG[("PostgreSQL 17-alpine<br/>(docker-compose.yml)")]
        DB_DIR["database/migrations & schema<br/>(Empty .gitkeep)"]
    end

    subgraph ML_Layer["Machine Learning Layer (Disconnected)"]
        COLAB["Ml Pipelines/ (Google Colab + GEE)<br/>10 Notebooks: Drought, Flood, Waterlogging, Surge"]
        GDRIVE[("Google Drive / GEE Exports<br/>(5.33M-row Drought Parquet, LightGBM models)")]
        ML_DIR["ml/ (Repo ML Directory)<br/>(Empty .gitkeep)"]
    end

    subgraph IoT_Layer["IoT / ESP32 Layer (Rules Only - No Code)"]
        ESP["ESP32 Sensor Nodes<br/>(No firmware or endpoints in repo)"]
    end

    UI <--> CTX
    CTX <--> LS
    UI --> SVC
    SVC <--> LS
    UI -->|"MapLibre GL"| OSM_TILES
    SVC -->|"fetch() in geocodingService.js"| NOM
    UI -->|"<img> src"| MIT

    SVC -.->|"NOT WIRED (Planned Part 2)"| API_CLI
    API_CLI -.->|"HTTP /api/v1 (Unimplemented)"| MAIN
    MAIN -.->|"No DB driver installed"| PG
    MAIN -.->|"No model loading code"| ML_DIR
    COLAB -->|"Runs in Colab/GEE"| GDRIVE
    GDRIVE -.->|"Not exported to repo"| ML_DIR
    ESP -.->|"No REST route exists"| MAIN
```

---

## 2. Verification of the 6 Core System Connections

Below is the exact code-verified status of every architectural link requested in Phase 2:

### 2.1 React Frontend → FastAPI Backend
- **Status:** **DISCONNECTED (Planned Contract Only).**
- **Verified Facts:**
  - [`frontend/src/services/apiClient.js`](./frontend/src/services/apiClient.js) implements a `request(endpoint, options)` wrapper around `fetch()` targeting `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'` with an 8-second `AbortController` timeout and an `ApiError` class that tags network failures with `{ isOffline: true }`.
  - **However, `apiClient.js` is not imported by any page, component, or service in `frontend/src/`.**
  - All frontend services ([`cropService.js`](./frontend/src/services/cropService.js), [`rotationService.js`](./frontend/src/services/rotationService.js), [`soilService.js`](./frontend/src/services/soilService.js), [`weatherService.js`](./frontend/src/services/weatherService.js), [`alertService.js`](./frontend/src/services/alertService.js), [`modelService.js`](./frontend/src/services/modelService.js), [`farmService.js`](./frontend/src/services/farmService.js)) return in-memory constants, deterministic client-side calculations, or `localStorage` state directly.
  - The only live `fetch()` calls in the frontend are inside [`frontend/src/services/geocodingService.js`](./frontend/src/services/geocodingService.js) (`searchPlaces` and `reverseGeocode`), which call `https://nominatim.openstreetmap.org` directly from the browser.
  - In addition, [`SalinityPredictionPage.jsx`](./frontend/src/pages/SalinityPrediction/SalinityPredictionPage.jsx) loads external PNG rasters directly from `https://www.mit.edu/~eltahirgroup/DST_SoilSalinity/data/...` and [`FarmMapViewer.jsx`](./frontend/src/components/maps/FarmMapViewer.jsx) loads map tiles from OpenStreetMap, Esri World Imagery, and CARTO Voyager.
  - [`frontend/API_INTEGRATION_NOTES.md`](./frontend/API_INTEGRATION_NOTES.md) documents 11 planned `/api/v1/*` endpoints, none of which exist in the backend yet.

### 2.2 FastAPI → PostgreSQL
- **Status:** **NOT IMPLEMENTED.**
- **Verified Facts:**
  - [`backend/requirements.txt`](./backend/requirements.txt) lists only 4 packages: `fastapi`, `uvicorn[standard]`, `pydantic-settings`, and `python-multipart`. Neither `sqlalchemy`, `sqlmodel`, `psycopg`, `asyncpg`, nor `alembic` is listed in `requirements.txt`.
  - [`backend/app/models/`](./backend/app/models), [`backend/app/repositories/`](./backend/app/repositories), and [`database/`](./database) contain only `.gitkeep` files.
  - A Docker Compose service for `postgres:17-alpine` exists in [`docker-compose.yml`](./docker-compose.yml) (along with a sample `DATABASE_URL=postgresql+psycopg://app:replace-me@localhost:5432/app` in [`.env.example`](./.env.example)), and a normalized relational schema for 13+ tables is specified in [`docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md`](./docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md#L382-L455), but no SQL DDL or Python database code has been written yet.

### 2.3 FastAPI → Machine Learning Components
- **Status:** **NOT IMPLEMENTED.**
- **Verified Facts:**
  - [`backend/app/`](./backend/app) has no ML inference service, no model loader, and no dependency on `scikit-learn`, `lightgbm`, `joblib`, `pandas`, or `numpy`.
  - [`ml/`](./ml) has [`ml/requirements.txt`](./ml/requirements.txt) (`pandas`, `numpy`, `scikit-learn`, `joblib`), but all its folders (`ml/artifacts/`, `ml/src/`, `ml/data_pipeline/`, `ml/datasets/`) are empty.

### 2.4 ESP32 → FastAPI APIs
- **Status:** **NO SOURCE CODE PRESENT (AI Coding Rule & Domain Caveat Only).**
- **Verified Facts:**
  - There is **no ESP32 firmware** (`.ino`, `.cpp`, `.c`, `platformio.ini`, or MicroPython script) and **no IoT ingestion endpoint** anywhere in the repository.
  - The only references to ESP32 or sensors in the repository are:
    1. [`antigravity-vscode-starter/.agents/rules/esp32-rest.md`](./antigravity-vscode-starter/.agents/rules/esp32-rest.md) — a generic AI coding rule file from the starter template explaining best practices if ESP32 HTTP/REST code is edited.
    2. [`frontend/src/services/modelService.js`](./frontend/src/services/modelService.js#L75) — a scientific limitation note (`lim-3: Tidal Fluvial Salinity Dynamics`) stating that polder river salinity fluctuates within hours and *"cannot be captured without automated river salinity sensors"*.
  - Hardware pinouts, sensor models (e.g., EC/TDS probes, soil moisture probes, DHT/DS18B20), and telemetry payload schemas are **UNKNOWN** (not yet created in the repo).

### 2.5 Sensor Data → Database → Dashboard
- **Status:** **NOT IMPLEMENTED (Dashboard Uses Browser `localStorage` & Static Demo Fixtures).**
- **Verified Facts:**
  - [`DashboardPage.jsx`](./frontend/src/pages/Dashboard/DashboardPage.jsx) reads active farm and soil state from [`FarmContext.jsx`](./frontend/src/context/FarmContext.jsx) (persisted in `localStorage` under `agrishift_farm_profile` and `agrishift_soil_profile`), weather from [`weatherService.js`](./frontend/src/services/weatherService.js) (`DEMO_WEATHER_DATA`), suitability from [`cropService.js`](./frontend/src/services/cropService.js), rotations from [`rotationService.js`](./frontend/src/services/rotationService.js), and alerts from [`alertService.js`](./frontend/src/services/alertService.js) (`localStorage` key `agrishift_farmer_alerts`).

### 2.6 ML Training → Model Storage → Prediction API → Frontend
- **Status:** **DISCONNECTED ACROSS ENVIRONMENTS (Colab/GEE vs. Local Repo).**
- **Verified Facts:**
  - **ML Training (`Ml Pipelines/`):** Standalone Jupyter notebooks and Python scripts built for **Google Colab + Google Earth Engine** (GEE project `drout-prediction-nasadata`). They train **LightGBM** (and in the executed Drought notebook `03_diagnostics_and_training_(2) (2).ipynb`, an expanded leaderboard of LightGBM, XGBoost, CatBoost, Extra Trees, HistGradientBoosting, Logistic Regression, and Ridge Regression) for **4 climate hazards**:
    1. **Drought (`01`–`03`):** VCI and SPI-3 forecasting 1 and 2 months ahead.
    2. **Flood Inundation (`04`, `07`, `08`):** Sentinel-1 SAR open-water anomaly forecasting 1 and 2 months ahead.
    3. **Waterlogging (`04`, `07`, `08`):** ERA5-Land root-zone soil saturation persistence forecasting 1 and 2 months ahead.
    4. **Cyclone Storm Surge (`05`, `06`, `09`, `10`):** Leave-One-Storm-Out (LOSO) spatial inundation classification per cyclone event.
  - **Model Storage:** The scripts save `.txt` LightGBM booster files (`lgbm_clf_next1.txt`, `lgbm_inundation_next1.txt`, `lgbm_waterlogging_next1.txt`, `lgbm_surge_storm.txt`) and `.parquet` / `.csv` summaries to **Google Drive** (`/content/drive/MyDrive/AgriShift_*_dataset/processed/model_results/`). None of those trained `.txt` model files or `.csv` demo tables have been copied into the repository's `ml/artifacts/` or `ml/datasets/processed/` directories.
  - **Architectural Mismatch Note:** The frontend (`SalinityPredictionPage.jsx`, `modelService.js`, `API_INTEGRATION_NOTES.md`) specifies an ML model for **Soil Salinity / ECe (dS/m) regression** (`POST /api/v1/models/salinity-ec/predict`), whereas the actual ML work in `Ml Pipelines/` models **Drought, Flood Inundation, Waterlogging, and Cyclone Storm Surge**. There is no soil salinity (ECe) ML training script in `Ml Pipelines/`.

---

## 3. Component-by-Component Breakdown

### 3.1 Frontend Architecture (`frontend/`)
- **Entry Point:** [`index.html`](./frontend/index.html) → [`src/main.jsx`](./frontend/src/main.jsx) → [`src/App.jsx`](./frontend/src/App.jsx).
- **State Management:**
  - [`LanguageContext.jsx`](./frontend/src/context/LanguageContext.jsx): Defaults to Bangla (`'bn'`), persists to `localStorage` (`agrishift_language`), exposes `t(keyPath)` with English fallback, and updates `document.documentElement.lang` and `document.title`.
  - [`FarmContext.jsx`](./frontend/src/context/FarmContext.jsx): Manages `farm` (defaults to `DEMO_FARM` in Dacope, Khulna), `soil` (defaults to `DEMO_SOIL` with `ec: 4.8 dS/m`, `pH: 6.8`), and `season` (`'rabi' | 'kharif1' | 'kharif2'`). Persists to `localStorage` (`agrishift_farm_profile`, `agrishift_soil_profile`).
- **Routing (`App.jsx`):** 16 routes wrapped in [`Layout.jsx`](./frontend/src/components/layout/Layout.jsx) (`Navbar`, `Sidebar`, `Footer`):
  1. `/` → [`HomePage.jsx`](./frontend/src/pages/Home/HomePage.jsx) (with [`HeroNasaGlobe.jsx`](./frontend/src/components/home/HeroNasaGlobe.jsx) & [`HeroCinematicDiorama.jsx`](./frontend/src/components/home/HeroCinematicDiorama.jsx))
  2. `/farm-map` → [`FarmMapPage.jsx`](./frontend/src/pages/FarmMap/FarmMapPage.jsx) (with [`FarmMapViewer.jsx`](./frontend/src/components/maps/FarmMapViewer.jsx))
  3. `/dashboard` → [`DashboardPage.jsx`](./frontend/src/pages/Dashboard/DashboardPage.jsx)
  4. `/weather-calendar` → [`WeatherCalendarPage.jsx`](./frontend/src/pages/WeatherCalendar/WeatherCalendarPage.jsx)
  5. `/soil-report` → [`SoilReportPage.jsx`](./frontend/src/pages/SoilReport/SoilReportPage.jsx)
  6. `/crop-suitability` → [`CropSuitabilityPage.jsx`](./frontend/src/pages/CropSuitability/CropSuitabilityPage.jsx)
  7. `/rotation-planner` → [`RotationPlannerPage.jsx`](./frontend/src/pages/RotationPlanner/RotationPlannerPage.jsx)
  8. `/what-if-simulator` → [`WhatIfSimulatorPage.jsx`](./frontend/src/pages/WhatIfSimulator/WhatIfSimulatorPage.jsx)
  9. `/scenario-comparison` → [`ScenarioComparisonPage.jsx`](./frontend/src/pages/ScenarioComparison/ScenarioComparisonPage.jsx)
  10. `/alerts` → [`AlertsPage.jsx`](./frontend/src/pages/Alerts/AlertsPage.jsx)
  11. `/data-sources` → [`DataSourcesPage.jsx`](./frontend/src/pages/DataSources/DataSourcesPage.jsx)
  12. `/salinity-prediction` → [`SalinityPredictionPage.jsx`](./frontend/src/pages/SalinityPrediction/SalinityPredictionPage.jsx)
  13. `/ml-suitability` → [`MlSuitabilityPage.jsx`](./frontend/src/pages/CropSuitability/MlSuitabilityPage.jsx)
  14. `/intelligent-rotation` → [`IntelligentRotationPage.jsx`](./frontend/src/pages/RotationPlanner/IntelligentRotationPage.jsx)
  15. `/model-evaluation` → [`ModelEvaluationPage.jsx`](./frontend/src/pages/ModelEvaluation/ModelEvaluationPage.jsx)
  16. `/soil-history` → [`SoilHealthHistoryPage.jsx`](./frontend/src/pages/SoilHealthHistory/SoilHealthHistoryPage.jsx)

### 3.2 Backend Architecture (`backend/`)
- **Entry Point:** [`backend/app/main.py`](./backend/app/main.py) instantiates `FastAPI(title="AgriShift API", version="0.1.0")` and defines `GET /health` returning `{"status": "ok", "project": "AgriShift"}`.
- **Missing Wiring:**
  - `CORSMiddleware` is not configured yet (required for browser requests from `http://localhost:3000`).
  - [`backend/app/api/router.py`](./backend/app/api/router.py) is not included via `app.include_router(api_router, prefix="/api/v1")`.
  - [`backend/app/core/config.py`](./backend/app/core/config.py) is an empty docstring.
  - Authentication, authorization, request validation schemas, error handlers, and logging are not yet implemented in the backend.

### 3.3 Database Architecture (`database/` & `docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md`)
- **Implemented:** None (empty directories in `database/`).
- **Container Definition:** [`docker-compose.yml`](./docker-compose.yml) defines a `postgres:17-alpine` service bound to `127.0.0.1:5432`.
- **Designed Relational Schema ([`docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md`](./docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md)):**
  ```mermaid
  erDiagram
      SOURCES ||--o{ CROP_SOURCE_LINKS : cites
      CROPS ||--o{ CROP_SOURCE_LINKS : has
      CROPS ||--o{ CROP_VARIETIES : includes
      CROPS ||--o{ CROP_STAGE_EVIDENCE : documents
      CROP_VARIETIES ||--o{ CROP_STAGE_EVIDENCE : specifies
      SOURCES ||--o{ EVIDENCE_SOURCE_LINKS : backs
      CROP_STAGE_EVIDENCE ||--o{ EVIDENCE_SOURCE_LINKS : references
      SITES ||--o{ PLOTS : contains
      PLOTS ||--o{ CROP_EVENTS : records
      CROP_VARIETIES ||--o{ CROP_EVENTS : planted_as
      ROTATION_TREATMENTS ||--o{ ROTATION_TREATMENT_STEPS : ordered_by
      ROTATION_TREATMENTS ||--o{ CROP_EVENTS : evaluated_in
      PLOTS ||--o{ SOIL_SAMPLES : tested_in
      PLOTS ||--o{ WATER_SAMPLES : tested_in
      CROP_EVENTS ||--o{ MANAGEMENT_EVENTS : managed_by
      CROP_EVENTS ||--o{ HARVEST_OUTCOMES : yields
      SITES ||--o{ ENVIRONMENTAL_OBSERVATIONS : observed_at
  ```

### 3.4 Machine Learning Pipeline (`Ml Pipelines/`)
The geospatial hazard pipeline operates on a shared **1 km MODIS (`MOD13A2`) sinusoidal grid** (`pixel_id = "{lon:.5f}_{lat:.5f}"`, filtering out water pixels `LC_Type1 == 17` and identifying cropland `LC_Type1 in [12, 14]`).

| Hazard | Scripts & Notebooks (`ml/`) | Satellite / Reanalysis Sources | Target / Label Definition | Validation Design | Execution Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Drought** | `01_export_gee`<br/>`02_build_dataset`<br/>`03_diagnostics_and_training` | MODIS `MOD13A2` (NDVI/EVI), `MOD11A2` (LST), CHIRPS Daily Rain (SPI-1/3/6), ERA5-Land (`t2m`, `swl1`, `pet`, `et`), SRTM, MCD12Q1 | `drought_vci_roll` ($\text{VCI} < 35$ via two-stage $\Delta\text{VCI}$ regression), 1-month-ahead shift | Temporal split (`train <= 2019`, `val 2020-21`, `test 2022-25`) + 5-fold `0.1°` (~11 km) spatial blocks | **Executed on real GEE data** (`3,321,108` cropland rows; `ml/artifacts/drought_lgbm_reg_h1.joblib`, Test `ROC-AUC = 0.6512`) |
| **Flood (Inundation)** | `04_export_flood_gee`<br/>`07_build_flood_dataset`<br/>`08_flood_diagnostics_and_training` | Sentinel-1 GRD VV (`< -18 dB`), JRC Global Surface Water (`seasonality >= 10` *gher* mask), MODIS `MOD09A1`, CHIRPS, ERA5-Land, MERIT Hydro | `inundated_next1`: *gher*-masked radar open-water fraction `s1_flood_frac > 0.15` at month $t+1$ | Temporal split (`train 2017-20`, `val 2021`, `test 2022-25`) + 5-fold spatial blocks | **Executed on real GEE data** (`421,155` test rows; `ml/artifacts/flood_inundation_lgbm_h1.joblib`, Test `ROC-AUC = 0.9378`, `PR-AUC = 0.4738`) |
| **Waterlogging** | `04_export_flood_gee`<br/>`07_build_flood_dataset`<br/>`08_flood_diagnostics_and_training` | ERA5-Land `swl1_z`, surface runoff, CHIRPS, MODIS `MOD09A1` (`LSWI`, `MNDWI`), MERIT Hydro (`hnd`, `upa`) | `waterlogged_next1`: `swl1_z > 0.75` OR (`MNDWI > -0.15` & `LSWI > 0.15`) at month $t+1$ (no radar features) | Temporal split (`train <= 2019`, `val 2020-21`, `test 2022-25`) + 5-fold spatial blocks | **Executed on real GEE data** (`565,551` test rows; `ml/artifacts/flood_waterlogging_lgbm_h1.joblib`, Test `ROC-AUC = 0.9715`, `PR-AUC = 0.8726`) |
| **Storm Surge** | `05_storm_events_and_surge`<br/>`06_export_surge_inundation_gee`<br/>`09_build_surge_dataset`<br/>`10_surge_diagnostics_and_training` | NOAA IBTrACS v04r01, Sentinel-1 pre/post storm (`VV < -16 dB`), NASA MODIS Global Flood DB, ERA5 Hourly wind/MSLP, SRTM, MERIT Hydro | `surge_inundated`: post-minus-pre cyclone radar new water `> 10%` or MODIS flood footprint `> 10%` | **Leave-One-Storm-Out (LOSO)** cross-validation across 8 Bay of Bengal cyclones (Sidr 2007 to Remal 2024) | **Executed on real GEE data** (`94,623` pixel-events; `ml/artifacts/surge_inundation_lgbm.joblib`, Mean LOSO `ROC-AUC = 0.8377`, Cyclone Remal `0.9545`) |
