# AgriShift — Development & Operations Guide

> **Audit Status:** Verified against actual repository configuration and scripts on `2026-11-10`.

---

## 1. Prerequisites

- **Node.js:** v18+ or v20+ (with `npm`)
- **Python:** Python 3.11+ (with `pip` and `venv`)
- **Docker Desktop:** Required only when running the local PostgreSQL container
- **Git:** For version control

---

## 2. How to Start the Frontend (React + Vite)

The frontend is fully functional out-of-the-box using local demonstration fixtures and browser `localStorage`.

### 2.1 Environment Setup
```powershell
cd frontend
Copy-Item .env.example .env
```
*Note:* Standard OpenStreetMap, Esri World Imagery, OpenStreetMap Nominatim geocoding, and MIT salinity map rasters work without any API keys.

### 2.2 Install Dependencies & Run Dev Server
```powershell
cd frontend
npm install
npm run dev
```
- **Local URL:** `http://localhost:3000` (configured in [`frontend/vite.config.js`](./frontend/vite.config.js)).

### 2.3 Run Frontend Verification & Production Build
```powershell
cd frontend
npm test          # Runs node tests/verify-frontend.js (validates 348+ EN/BN locale keys & 15 feature pages)
npm run build     # Builds production bundle into frontend/dist/
npm run preview   # Previews production build locally
```

---

## 3. How to Start the Backend (Python + FastAPI)

Currently, [`backend/app/main.py`](./backend/app/main.py) is a minimal scaffold exposing `GET /health`.

### 3.1 Create Virtual Environment & Install Dependencies
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

### 3.2 Start FastAPI with Uvicorn
```powershell
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Health Endpoint:** `http://localhost:8000/health`
- **Interactive Swagger UI:** `http://localhost:8000/docs`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

---

## 4. How to Start PostgreSQL

The PostgreSQL 17 Docker configuration currently resides inside [`docker-compose.yml`](./docker-compose.yml).

### 4.1 Configure Local Database Password
1. In `antigravity-vscode-starter/` (or after copying `docker-compose.yml` and `.env.example` to the repository root per [`antigravity-vscode-starter/README-SETUP.md`](./antigravity-vscode-starter/README-SETUP.md)):
   ```powershell
   cd antigravity-vscode-starter
   Copy-Item .env.example .env
   ```
2. Edit `.env` and replace `POSTGRES_PASSWORD` with a strong local password (never commit `.env`).

### 4.2 Start / Stop the Container
```powershell
cd antigravity-vscode-starter
docker compose up -d db       # Starts postgres:17-alpine on 127.0.0.1:5432
docker compose ps             # Checks container health status
docker compose logs -f db     # Follows database logs
docker compose down           # Stops container while preserving named volume postgres_data
```
> **Warning:** Never run `docker compose down -v` unless you intentionally want to wipe all local database data.

---

## 5. How to Run the Machine Learning Scripts

There are two ML execution contexts in the repository:

### 5.1 Running the Offline Synthetic Test Suite Locally
The review bundle in [`Ml Pipelines/AgriShift_review_bundle/AgriShift_review_bundle/`](./Ml%20Pipelines/AgriShift_review_bundle/AgriShift_review_bundle) includes synthetic data generators to test the dataset builders and LightGBM training pipelines (`02`, `03`, `05`, `07`, `08`, `09`, `10`) offline without Google Earth Engine credentials.

1. **Install ML packages in your Python virtual environment:**
   ```powershell
   pip install pandas numpy scipy scikit-learn lightgbm pyarrow matplotlib xarray
   ```
2. **Run via Git Bash / WSL (`run_all_tests.sh`):**
   ```bash
   cd "Ml Pipelines/AgriShift_review_bundle/AgriShift_review_bundle"
   bash synthetic_tests/run_all_tests.sh
   ```
3. **Or run individual pipeline stages in PowerShell using environment variable overrides:**
   ```powershell
   $bundle = "Ml Pipelines\AgriShift_review_bundle\AgriShift_review_bundle"
   python "$bundle\synthetic_tests\make_synthetic_drought.py" ".\tmp_drought_in"
   $env:AGRI_INPUT = ".\tmp_drought_in"
   $env:AGRI_OUT = ".\tmp_drought_out"
   python "$bundle\02_build_dataset.py"
   python "$bundle\03_diagnostics_and_training.py"
   ```

### 5.2 Running the Real Geospatial Pipelines in Google Colab + Earth Engine
As documented in [`Ml Pipelines/PIPELINE_REVIEW_GUIDE.md`](./Ml%20Pipelines/PIPELINE_REVIEW_GUIDE.md):
1. Upload the notebooks to Google Colab connected to Google Earth Engine project `drout-prediction-nasadata` and Google Drive.
2. Mount Google Drive **first** (Cell 1 of each notebook mounts `/content/drive` before creating output directories).
3. Execute in dependency order:
   - **Drought:** `01_export_gee.ipynb` → `02_build_dataset.ipynb` → `03_diagnostics_and_training.ipynb` (Outputs in Drive: `AgriShift_dataset/processed/agrishift_panel.parquet`, `agrishift_demo_district_month.csv`, and `model_results/`).
   - **Flood & Waterlogging:** `04_export_flood_gee.ipynb` (set `CONFIRM_SAR = True` / `CONFIRM_SAT = True` after running smoke tests) → `07_build_flood_dataset.ipynb` → `08_flood_diagnostics_and_training.ipynb`.
   - **Storm Surge:** `05_storm_events_and_surge.ipynb` → `06_export_surge_inundation_gee.ipynb` → `09_build_surge_dataset.ipynb` → `10_surge_diagnostics_and_training.ipynb`.

---

## 6. How to Test APIs

### 6.1 Testing the Implemented Health Endpoint
While Uvicorn is running on port `8000`:
```powershell
curl http://localhost:8000/health
# Expected output: {"status":"ok","project":"AgriShift"}
```

### 6.2 Planned `/api/v1/*` Endpoints (Specified in `frontend/API_INTEGRATION_NOTES.md`)
Once implemented in [`backend/app/api/v1/`](./backend/app/api/v1), test against these contracts:
- `GET http://localhost:8000/api/v1/farms/current`
- `PUT http://localhost:8000/api/v1/farms/current`
- `GET http://localhost:8000/api/v1/regions/bangladesh-coastal`
- `POST http://localhost:8000/api/v1/soil/ocr/extract` (`multipart/form-data`)
- `POST http://localhost:8000/api/v1/soil/profile`
- `GET http://localhost:8000/api/v1/weather/current?lat=22.5721&lon=89.5105`
- `GET http://localhost:8000/api/v1/weather/historical-comparison?district=Khulna`
- `POST http://localhost:8000/api/v1/crops/suitability`
- `POST http://localhost:8000/api/v1/rotation/plan`
- `POST http://localhost:8000/api/v1/models/salinity-ec/predict`
- `GET http://localhost:8000/api/v1/models/metadata/salinity`
- `GET http://localhost:8000/api/v1/alerts?upazila=Dacope&district=Khulna`

---

## 7. How to Integrate ESP32 (IoT Sensor Telemetry)

> **Current Status:** No ESP32 firmware or backend ingestion endpoint exists in the repository yet.

When implementing ESP32 integration, follow the rules in [`antigravity-vscode-starter/.agents/rules/esp32-rest.md`](./antigravity-vscode-starter/.agents/rules/esp32-rest.md) and [`docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md`](./docs/RESEARCHER_CROP_ROTATION_DATA_GUIDE.md):

1. **Backend Telemetry Endpoint (`FastAPI`):**
   - Create a dedicated router (e.g., `POST /api/v1/iot/telemetry` or `POST /api/v1/observations/sensor`) in `backend/app/api/v1/`.
   - Validate payloads with Pydantic requiring: `device_id`, `site_id` or `plot_id`, `observed_at` (ISO 8601 timestamp), `schema_version`, and explicit sensor readings with units and methods (e.g., `water_ecw_ds_m`, `soil_moisture_vwc`, `soil_temp_c`).
   - **Critical Agronomic Rule:** Never mix water electrical conductivity (`ECw`) or bulk dielectric sensor readings with laboratory saturated-paste soil extract (`ECe`). Tag sensor rows with `measurement_method = "esp32_sensor"` in the `environmental_observations` or `water_samples` table.
2. **ESP32 Firmware Architecture:**
   - Separate sensor acquisition, Wi-Fi management, JSON serialization (`ArduinoJson`), and HTTP client (`HTTPClient`) modules.
   - Use explicit connection/request timeouts (e.g., `5000 ms`) and bounded exponential backoff on Wi-Fi or HTTP failures (avoid tight retry loops).
   - Store Wi-Fi SSID, password, API base URL, and per-device API key in a non-committed header (`secrets.h`) or NVS flash.
   - Check HTTP status codes (`200`/`201` vs `4xx`/`5xx`) before clearing local reading buffers.
