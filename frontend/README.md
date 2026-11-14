# AgriShift — Frontend Web Application (Part 1)

Farmer-focused agricultural decision-support platform powered by NASA Earth observation data and SRDI soil health insights.

---

## 1. Quick Start

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Verification & Integrity Test
```bash
npm test
```
Runs `tests/verify-frontend.js` to validate all 348 translation keys in English and Bangla and confirm all 15 feature routes and components.

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 2. Technology Stack

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Routing:** React Router 6 (Single Page Application)
- **Icons:** Lucide React
- **Styling:** Centralized Forest Green CSS Custom Properties (`styles/tokens.css` & `styles/globals.css`)
- **Typography:** Hind Siliguri (Bangla) & Inter (English)
- **Map:** MapLibre GL JS (World-scale interactive mapping, OpenStreetMap raster tiles, Esri World Imagery satellite, CARTO Topo, 3D perspective camera tilt, GPS live device location, Nominatim geocoding, and parcel boundary polygon drawing)

---

## 3. Bilingual System (বাংলা & English)

- Application-wide localization supporting **100%** of UI components, navigation, badges, error messages, and forms.
- Defaults to **বাংলা (Bangla)** for an accessible farmer-first experience.
- Language preference persists across sessions via `localStorage` (`agrishift_language`).
- Toggle available in the top navigation bar and mobile drawer.
- Centralized locale dictionaries:
  - `src/locales/bn.json`
  - `src/locales/en.json`

---

## 4. 15 Implemented Features Directory

| Feature # | Feature Name | Route | Component File |
| :--- | :--- | :--- | :--- |
| **Feature 1** | Home / Landing Page | `/` | `src/pages/Home/HomePage.jsx` |
| **Feature 2** | Farm Location & Map | `/farm-map` | `src/pages/FarmMap/FarmMapPage.jsx` |
| **Feature 3** | My Farm Dashboard | `/dashboard` | `src/pages/Dashboard/DashboardPage.jsx` |
| **Feature 4** | Weather & Crop Calendar | `/weather-calendar` | `src/pages/WeatherCalendar/WeatherCalendarPage.jsx` |
| **Feature 5** | Soil Report OCR | `/soil-report` | `src/pages/SoilReport/SoilReportPage.jsx` |
| **Feature 6** | Crop Suitability Recommendation | `/crop-suitability` | `src/pages/CropSuitability/CropSuitabilityPage.jsx` |
| **Feature 7** | Crop Rotation Planner | `/rotation-planner` | `src/pages/RotationPlanner/RotationPlannerPage.jsx` |
| **Feature 8** | What-if Simulator | `/what-if-simulator` | `src/pages/WhatIfSimulator/WhatIfSimulatorPage.jsx` |
| **Feature 9** | Scenario Comparison | `/scenario-comparison` | `src/pages/ScenarioComparison/ScenarioComparisonPage.jsx` |
| **Feature 10** | Farmer Alerts & Guidance | `/alerts` | `src/pages/Alerts/AlertsPage.jsx` |
| **Feature 11** | Satellite & Environmental Data Pipeline | `/data-sources` | `src/pages/DataSources/DataSourcesPage.jsx` |
| **Feature 12** | Soil Salinity / EC Prediction UI | `/salinity-prediction` | `src/pages/SalinityPrediction/SalinityPredictionPage.jsx` |
| **Feature 13** | ML-Assisted Crop Suitability UI | `/ml-suitability` | `src/pages/CropSuitability/MlSuitabilityPage.jsx` |
| **Feature 14** | Intelligent Crop Rotation UI | `/intelligent-rotation` | `src/pages/RotationPlanner/IntelligentRotationPage.jsx` |
| **Feature 15** | Model Confidence & Evaluation | `/model-evaluation` | `src/pages/ModelEvaluation/ModelEvaluationPage.jsx` |

---

## 5. Design System Tokens (Forest Green Palette)

- **Primary Forest Green:** `#14532D`
- **Secondary Green:** `#166534`
- **Fresh Accent Green:** `#22A06B`
- **Main Background:** `#F7F8F2`
- **Surface / Card Background:** `#FFFFFF`
- **Light Cream Tone:** `#F3F4E8`
- **Main Text:** `#17251C`
- **Secondary Text:** `#647067`
- **Borders:** `#E2E8DF`
- **Accessible Status:**
  - Suitable: `#DCFCE7` / `#14532D`
  - Marginal: `#FEF3C7` / `#92400E`
  - Risky: `#FEE2E2` / `#991B1B`

---

## 7. Map Configuration & Geodata Providers

- **Interactive Mapping Engine:** MapLibre GL JS v6
- **Base Map Providers:**
  - Standard Street/Agro Map: OpenStreetMap (OSM Standard Tiles)
  - Satellite Imagery: Esri World Imagery (ArcGIS Online, public raster tiles with full attribution)
  - Topographic Base: CARTO Positron
- **3D & Perspective:**
  - Camera pitch (50°) and rotation controls for 3D oblique perspective.
  - Optional Digital Elevation Model (DEM) terrain mesh configurable via `VITE_TERRAIN_DEM_URL`.
- **Geocoding & Location Search:**
  - Powered by OpenStreetMap Nominatim with debounced search, country-aware address parsing, and offline fallbacks.
- **Device GPS Geolocation:**
  - Browser Geolocation API (`navigator.geolocation`) with accuracy radius reporting (±X meters) and HTTPS policy safeguards.
- **Parcel Boundary Drawing & Area Calculation:**
  - Real-time geodesic polygon area calculation using WGS84 spherical excess formula, auto-converting to Bigha, Acre, Hectare, and Decimal.
- **Optional Environment Variables (.env):**
  - `VITE_MAPTILER_KEY`: Optional MapTiler API key for custom vector styles or satellite tiles.
  - `VITE_MAPBOX_TOKEN`: Optional Mapbox token for Mapbox styles.
  - `VITE_CARTO_API_KEY`: CARTO API key for the Voyager raster basemap. Restrict its allowed websites in CARTO; frontend keys are visible to users.
  - `VITE_TERRAIN_DEM_URL`: Optional RGB DEM terrain raster tile URL.

In strict adherence to project scope rules:
1. **No Fake ML Predictions:** Model-dependent screens display honest `MODEL NOT YET AVAILABLE` status banners.
2. **Clear Demonstration Badges:** All mock/sample data is labeled with a purple `DEMO / SAMPLE DATA` badge.
3. **No Decorative Inactive Controls:** Every implemented button, filter, tab, and form functions interactively or states its current status.
4. **Backend Boundary:** Real API endpoints will be wired in Part 2.
