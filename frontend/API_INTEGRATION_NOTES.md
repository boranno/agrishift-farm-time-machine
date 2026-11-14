# AgriShift — Frontend-Backend API Integration Notes (Part 1 -> Part 2)

This document details the interface contracts, endpoints, expected data schemas, and environment configuration for the Part 2 Backend development phase.

## 1. Environment Configuration

The frontend reads the backend base URL through Vite environment variables:
- Variable: `VITE_API_BASE_URL`
- Default fallback in `services/apiClient.js`: `http://localhost:8000/api/v1`
- Configure in `frontend/.env`:
  ```bash
  VITE_API_BASE_URL=http://localhost:8000/api/v1
  ```

---

## 2. API Endpoints Specification

> **Implementation status:** The endpoints below are planned integration contracts, not live backend endpoints yet. The current soil-report page performs OCR in the browser and saves the reviewed profile in browser `localStorage`; it does not call either soil endpoint below.

### 2.1 Farm Geolocation & Profiles
- **`GET /api/v1/farms/current`**
  - Response: Active farm metadata (district, upazila, union, aez, coordinates, area, soil texture, water source).
- **`PUT /api/v1/farms/current`**
  - Payload:
    ```json
    {
      "district": "Khulna",
      "upazila": "Dacope",
      "union": "Bajua",
      "latitude": 22.5721,
      "longitude": 89.5105,
      "area": 3.5,
      "area_unit": "bigha",
      "soil_type": "Clay Loam",
      "water_source": "Rainfed + Pond Storage"
    }
    ```
- **`GET /api/v1/regions/bangladesh-coastal`**
  - Returns coastal districts, upazilas, default coordinates, and Agro-Ecological Zones (AEZs).

---

### 2.2 Soil Health & OCR Digitization
- **`POST /api/v1/soil/ocr/extract`**
  - Request: `multipart/form-data` with `file` (JPG/PNG/PDF, max 5MB).
  - Response:
    ```json
    {
      "document_id": "ocr-doc-2026-001",
      "parameters": {
        "ph": 6.8,
        "ece_ds_m": 4.8,
        "nitrogen_mg_kg": 120,
        "phosphorus_mg_kg": 18,
        "potassium_mg_kg": 150
      },
      "missing_fields": []
    }
    ```
- **`POST /api/v1/soil/profile`**
  - Confirms and persists verified parameters to the active farm record.

The current browser OCR extracts only soil pH, saturated-paste ECe (dS/m), and NPK (mg/kg; ppm is accepted by the parser). It does not collect other soil-card values. Generic EC, EC1:5, and ECw are not auto-interpreted as ECe. OCR loads PDF.js/Tesseract.js and language data from jsDelivr on demand, so file OCR requires an internet connection. The report itself is processed in the browser and is not sent to AgriShift or the CDN. Manual entry remains available without the OCR libraries. Reviewed values are saved only in the current browser's farm profile (`localStorage`) until a backend persistence endpoint is implemented. The video-demo button fills clearly marked illustrative values; those are not soil measurements.

---

### 2.3 Agro-Meteorology & Weather Pipeline
- **`GET /api/v1/weather/current?lat={lat}&lon={lon}`**
  - Returns current temperature, humidity, surface moisture (from NASA SMAP), and 7-day outlook.
- **`GET /api/v1/weather/historical-comparison?district={district}`**
  - Returns monthly rainfall vs 10-year historical average (from NASA GPM IMERG and POWER).

---

### 2.4 Crop Suitability & Rotation Optimization
- **`POST /api/v1/crops/suitability`**
  - Payload: `{ "soil_ec": 4.8, "season": "rabi", "district": "Khulna" }`
  - Response: Ranked list of crops with `status`: `"suitable" | "marginal" | "risky"`, threshold delta, and agronomic management advisories.
- **`POST /api/v1/rotation/plan`**
  - Payload:
    ```json
    {
      "priority": "soil_health",
      "water_availability": "scarce",
      "soil_ec": 4.8,
      "polder_flood_risk": "low"
    }
    ```
  - Response: 3-season crop cycle recommendations with nutrient cycling rationales and soil restoration impact scores.

---

### 2.5 Machine Learning & Salinity Prediction (Part 3)
- **`POST /api/v1/models/salinity-ec/predict`**
  - Status in Part 1: `MODEL_NOT_YET_AVAILABLE`.
  - Expected Request:
    ```json
    {
      "lat": 22.5721,
      "lon": 89.5105,
      "date": "2026-10-27",
      "smap_soil_moisture": 0.24,
      "modis_ndvi": 0.48,
      "gpm_rain_30d": 32.5,
      "ground_srdi_baseline_ec": 4.8
    }
    ```
  - Expected Response:
    ```json
    {
      "predicted_ec_ds_m": 5.1,
      "confidence_interval_95": [4.3, 5.9],
      "risk_tier": "marginal",
      "model_version": "0.1.0-xgb"
    }
    ```
- **`GET /api/v1/models/metadata/salinity`**
  - Returns Model Card metadata, training data summary, Leave-One-District-Out cross-validation results, and MAE/RMSE benchmarks.

---

### 2.6 Farmer Alerts & Guidance
- **`GET /api/v1/alerts?upazila={upazila}&district={district}`**
  - Returns active agricultural alerts with severity (`critical`, `warning`, `advisory`), location, and actionable guidance.
- **`PUT /api/v1/alerts/{id}/read`**
  - Marks alert as read.
- **`POST /api/v1/notifications/preferences`**
  - Updates mobile SMS alert preferences.

---

## 3. Graceful Failure & Offline Fallbacks

The frontend implementation in `services/apiClient.js` safely intercepts offline states:
1. When the backend is unreachable or returns a network error, requests catch `isOffline: true`.
2. UI components fall back immediately to local demonstration data without unhandled promise rejections or white-screen crashes.
3. Demonstration badges (`DEMO / SAMPLE DATA`) remain clearly visible to ensure scientific transparency.

