# AgriShift — Development & Operations Guide

> **Verified against:** `AgriShift-Final-Repo` (`frontend/package.json`, `backend/requirements.txt`, `ml/requirements.txt`, `docker-compose.yml`).

---

## 1. Prerequisites

- **Node.js:** v18+ or v20+ (with `npm`)
- **Python:** Python 3.11+ (with `pip` and `venv`)
- **Docker Desktop:** Required only if starting the local PostgreSQL scaffold container
- **Git:** For version control

---

## 2. Frontend Setup & Commands (`frontend/`)

The React 18 + Vite 5 frontend works standalone out-of-the-box using deterministic agronomic calculations, precomputed ML validation benchmarks, and browser `localStorage`.

### 2.1 Environment Variables
```powershell
cd frontend
Copy-Item .env.example .env
```
*Note:* Standard OpenStreetMap, Esri World Imagery, OpenStreetMap Nominatim geocoding, and MIT salinity map rasters work without API keys. Optional MapTiler, Mapbox, or CARTO keys are documented in [`frontend/.env.example`](./frontend/.env.example).

### 2.2 Install Dependencies & Run Development Server
```powershell
cd frontend
npm ci
npm run dev
```
- **Local URL:** `http://localhost:3000` (configured in [`frontend/vite.config.js`](./frontend/vite.config.js)).

### 2.3 Verify & Build Production Bundle
Available scripts in [`frontend/package.json`](./frontend/package.json) (`dev`, `build`, `preview`, `test`):
```powershell
cd frontend
npm test          # Runs node tests/verify-frontend.js (validates 423 EN/BN keys & 15 feature pages)
npm run build     # Builds production bundle into frontend/dist/
npm run preview   # Previews production build locally
```
*(Note: `npm run lint` is not configured in `frontend/package.json`.)*

> **Windows PowerShell Tip:** If PowerShell blocks `npm.ps1` with an Execution Policy error, run `npm.cmd ci`, `npm.cmd run dev`, `npm.cmd test`, or `npm.cmd run build` instead.

---

## 3. Backend Setup & Commands (`backend/`)

[`backend/app/main.py`](./backend/app/main.py) serves `GET /health` and the complete `/api/v1/*` REST API (`models`, `farms`, `regions`, `soil`, `crops`, `rotation`, `weather`, `alerts`), loading all 4 LightGBM `.joblib` artifacts from [`ml/artifacts/`](./ml/artifacts/) and initializing the relational database automatically on startup.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- **Health Endpoint:** `http://localhost:8000/health`
- **Swagger UI Docs:** `http://localhost:8000/docs`
- **Run Backend Automated Tests (12 tests):**
  ```powershell
  cd backend
  .\.venv\Scripts\python.exe -m pytest -p no:anyio -v
  ```
- **Windows LightGBM Note:** On Windows, `lightgbm` requires the Microsoft Visual C++ 2015–2022 Redistributable (`vcomp140.dll`). Install via `winget install Microsoft.VCRedist.2015+.x64` if not already present.

---

## 4. Database Setup (`database/`, `docker-compose.yml`)

Canonical SQL DDL is located in [`database/schema/001_initial_schema.sql`](./database/schema/001_initial_schema.sql) and seed data in [`database/seeds/001_seed_khulna_agronomy.sql`](./database/seeds/001_seed_khulna_agronomy.sql). By default, [`backend/app/core/database.py`](./backend/app/core/database.py) automatically creates and seeds a local SQLite database (`agrishift_local.db`) when PostgreSQL is not running, so no Docker container is required for local development.

To run with the PostgreSQL 17 container in [`docker-compose.yml`](./docker-compose.yml):
```powershell
Copy-Item .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD before starting Docker
docker compose up -d db
docker compose ps
```

---

## 5. Machine Learning Environment & Pipeline (`ml/`)

### 5.1 Repository ML Structure
- [`ml/artifacts/`](./ml/artifacts/) — 4 trained LightGBM `.joblib` model artifacts (`drought_lgbm_reg_h1.joblib`, `flood_inundation_lgbm_h1.joblib`, `flood_waterlogging_lgbm_h1.joblib`, `surge_inundation_lgbm.joblib`)
- [`ml/data_pipeline/`](./ml/data_pipeline/) — Python scripts `01_export_gee.py` through `10_surge_diagnostics_and_training.py`
- [`ml/notebooks/pipeline/`](./ml/notebooks/pipeline/) — Clean Jupyter notebooks (`01`–`10`) for Google Colab / GEE
- [`ml/notebooks/executed/`](./ml/notebooks/executed/) — Executed Colab training notebooks (`03`, `08`, `10`) with preserved outputs
- [`ml/tests/`](./ml/tests/) — Synthetic unit test generators (`make_synthetic_*.py`) and runner (`run_all_tests.sh`)

### 5.2 Installing ML Dependencies
```powershell
cd ml
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
*Note:* `scikit-learn==1.6.1` and `lightgbm>=4.0` are specified in [`ml/requirements.txt`](./ml/requirements.txt) to match the serialized `.joblib` artifacts cleanly.

### 5.3 Running the Synthetic Pipeline Tests (Offline, No GEE Required)
On Linux, macOS, or Git Bash / WSL (inside `ml/tests/`):
```bash
bash ml/tests/run_all_tests.sh
```
This runs scripts `02`, `03`, `05`, `07`, `08`, `09`, and `10` on synthetic data in a temporary directory without modifying [`ml/artifacts/`](./ml/artifacts/).

### 5.4 Google Earth Engine (GEE) Requirements
Scripts `01_export_gee.py`, `04_export_flood_gee.py`, and `06_export_surge_inundation_gee.py` require:
1. An active Google Earth Engine account and authenticated CLI/Colab session (`ee.Authenticate()`, `ee.Initialize(project=...)`).
2. Setting `RUN_EXPORTS = True` inside the export script (defaults to `False` so dry-runs do not queue accidental GEE tasks).
3. For `05_storm_events_and_surge.py` CDS downloads (`RUN_CDS_DOWNLOAD = True`), a configured `~/.cdsapirc` Copernicus Climate Data Store key.

---

## 6. Troubleshooting

- **`npm.ps1 cannot be loaded because running scripts is disabled` (Windows PowerShell):** Use `npm.cmd` (e.g., `npm.cmd run dev`) instead of `npm`, or run from Command Prompt (`cmd.exe`) / Git Bash.
- **Python `ModuleNotFoundError: No module named 'lightgbm'` when loading `.joblib`:** Ensure you activated the `ml/.venv` environment and installed [`ml/requirements.txt`](./ml/requirements.txt).
- **Offline Browser Behavior:** All 16 routes, bilingual translations, agronomic rules, and precomputed ML evaluation tables work offline. Map raster tiles, Nominatim geocoding, MIT salinity PNGs, and first-time OCR library loading (`cdn.jsdelivr.net`) require internet access.
