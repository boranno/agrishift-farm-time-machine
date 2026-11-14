# Machine Learning Model Card — AgriShift Multi-Hazard Ensemble

**Version:** `1.0.0` (NASA Space Apps 2026 Release)  
**Serialized Artifacts:** [`ml/artifacts/`](../ml/artifacts/)  
**Training & Diagnostics Notebooks:** [`ml/notebooks/executed/`](../ml/notebooks/executed/)  
**Pipeline Source Code:** [`ml/data_pipeline/`](../ml/data_pipeline/)

---

## 1. Intended Use & Scope

The AgriShift multi-hazard machine learning suite forecasts four distinct environmental hazards across the `12,033` agricultural cropland pixels (`1 km` MODIS grid, `LC_Type1 in {12, 14}`) of **Khulna Division, Bangladesh** (`Bagerhat`, `Chuadanga`, `Jessore`, `Jhenaidah`, `Khulna`, `Kushtia`, `Magura`, `Meherpur`, `Narail`, and `Satkhira`):
1. **Root-Zone Waterlogging (`+1` Month Horizon)**
2. **Surface Flood Inundation (`+1` Month Horizon)**
3. **Cyclone Storm Surge Inundation (Event-Level across 8 Historical Cyclones)**
4. **Agricultural Drought (`+1` Month Horizon via Two-Stage $\Delta\text{VCI}$ Reconstruction)**

> **Out-of-Scope Use:** These models operate at `1 km` grid resolution and are designed for regional and sub-upazila crop rotation planning. They must not be used for emergency life-safety evacuation decisions or treated as direct in-situ soil electrical conductivity (`ECe`) sensors.

---

## 2. Training Dataset & Validation Strategy

- **Spatiotemporal Panel:** `5,331,492` total land pixel-months (`3,321,108` cropland pixel-months) spanning **January 2003 – December 2025** (`276` months).
- **Temporal Split (No Future Leakage):**
  - **Train:** `2003–2019` (`2017–2021` for Sentinel-1 SAR inundation)
  - **Validation:** `2020–2021` (`2022` for SAR inundation; used for early stopping, probability calibration, and F1 threshold tuning)
  - **Held-Out Test:** `2022–2025` (`2023–2025` for SAR inundation)
- **Spatial Cross-Validation:** 5-fold `0.1° x 0.1°` (~11 km) spatial block `GroupKFold` to verify generalization across unseen geographic blocks.
- **Storm Surge Cross-Validation:** **Leave-One-Storm-Out (LOSO)** across 8 Bay of Bengal cyclones (*Sidr 2007, Aila 2009, Roanu 2016, Fani 2019, Bulbul 2019, Amphan 2020, Yaas 2021, Remal 2024*).

---

## 3. Model-by-Model Architecture & Held-Out Test Performance

### 3.1 Root-Zone Waterlogging (`ml/artifacts/flood_waterlogging_lgbm_h1.joblib`)
- **Algorithm:** LightGBM Classifier (`91` optical + hydro-meteorological + topographic features; excludes Sentinel-1 SAR features to prevent target circularity) + isotonic probability calibration (`threshold = 0.5048`).
- **Target Label (`waterlogged_next1`):** `swl1_z > 0.75` OR (`MNDWI > -0.15` AND `LSWI > 0.15`) at month $t+1$.
- **Held-Out Test Set (`2022–2025`, `n = 565,551` cropland pixel-months, positive rate `18.30%`):**
  - **ROC-AUC:** `0.9715` (vs. Persistence `0.7859`)
  - **PR-AUC:** `0.8726` (vs. Persistence `0.5835`)
  - **Brier Score:** `0.0503`
  - **F1 Score:** `0.8004` | **Precision:** `85.40%` | **Recall:** `75.32%`

### 3.2 Surface Flood Inundation (`ml/artifacts/flood_inundation_lgbm_h1.joblib`)
- **Algorithm:** LightGBM Classifier (`105` features including Sentinel-1 SAR `VV` lags, MODIS `LSWI`/`MNDWI`, `CHIRPS`, `ERA5-Land`, `SRTM`, and `MERIT Hydro`) + probability calibration (`threshold = 0.1784`).
- **Target Label (`inundated_next1`):** Sentinel-1 SAR open-water fraction `s1_flood_frac > 0.15` at month $t+1$ after masking permanent shrimp aquaculture ponds (`JRC seasonality >= 10` months).
- **Held-Out Test Set (`2023–2025`, `n = 421,155` cropland pixel-months, positive rate `4.29%`):**
  - **ROC-AUC:** `0.9378` (vs. Persistence `0.7069`)
  - **PR-AUC:** `0.4738` (`+125%` relative improvement over Persistence `0.2105`)
  - **Brier Score:** `0.0295`
  - **F1 Score:** `0.4723` | **Precision:** `38.96%` | **Recall:** `59.97%`

### 3.3 Cyclone Storm Surge Inundation (`ml/artifacts/surge_inundation_lgbm.joblib`)
- **Algorithm:** LightGBM Classifier (`34` storm-track, wind/pressure, coastal distance, and hydro-topographic overtopping features).
- **Target Label (`surge_inundated`):** Post-storm new water fraction `> 0.10` (`Sentinel-1 VV < -16 dB` post-minus-pre storm for 2016–2024; `NASA MODIS Global Flood DB` for Cyclone Sidr 2007).
- **8-Storm Leave-One-Storm-Out (LOSO) Test Results (`n = 94,623` pixel-events):**
  - **Mean LOSO ROC-AUC:** `0.8377` (vs. Physics Bathtub DEM baseline `0.6258`)
  - **Mean LOSO PR-AUC:** `0.2788` (`2.83x` Physics Bathtub DEM baseline `0.0985`)
  - **Cyclone Remal (May 2024):** `ROC-AUC = 0.9545`, `PR-AUC = 0.5997`, `F1 = 0.5882`, `Precision = 93.02%`
  - **Cyclone Roanu (May 2016):** `ROC-AUC = 0.9524`, `PR-AUC = 0.6460`, `F1 = 0.5333`, `Precision = 97.30%`

### 3.4 Agricultural Drought (`ml/artifacts/drought_lgbm_reg_h1.joblib`)
- **Algorithm:** Two-Stage LightGBM Regressor predicting 1-month change $\Delta\text{VCI}_{t \to t+1}$ and reconstructing $\widehat{\text{VCI}}_{t+1} = \text{clip}(\text{VCI}_t + \widehat{\Delta\text{VCI}}, 0, 100)$.
- **Target Label (`drought_next1`):** 2-month rolling Vegetation Condition Index `drought_vci_roll < 35` at month $t+1$.
- **Held-Out Test Set (`2022–2025`, `n = 577,584` cropland pixel-months, positive rate `21.65%`):**
  - **ROC-AUC:** `0.6512` (`0.6480` unpruned 64-feature artifact)
  - **PR-AUC:** `0.3540` (`0.3436` unpruned)
  - **Brier Score:** `0.1598` | **F1 Score:** `0.3943` | **Recall:** `60.00%`
  - **Regression Metrics ($\Delta\text{VCI}$):** `MAE = 24.67`, `RMSE = 29.87`, $R^2 = +0.0649$

---

## 4. Key Limitations & Uncertainty

1. **Sub-Grid Polder & Sluice-Gate Operations:** BWDB polder embankment breaches and manual sluice-gate management occur at `5–20 m` scales that are unresolved by `30 m–1 km` satellite grids.
2. **Dry-Season Groundwater Irrigation Confounding:** In northern Khulna districts (`Kushtia`, `Jessore`, `Jhenaidah`), diesel/electric shallow tubewell irrigation keeps crop canopies green (`VCI > 50`) even during meteorological rainfall deficits (`SPI-3 < -1`), bounding optical drought prediction accuracy (`ROC-AUC ~ 0.65`).
3. **Soil Salinity (`ECe`) Requires Ground Verification:** Satellite optical and radar features do not directly measure soil electrical conductivity (`dS/m`); farmers should verify plot-level salinity using SRDI soil testing or calibrated EC meters.
