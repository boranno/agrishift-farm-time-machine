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
  - **Validation:** `2020–2021` (`2022` for Sentinel-1 SAR inundation; used for early stopping, isotonic probability calibration, and F1 threshold tuning)
  - **Held-Out Test:** `2022–2025` (`2023–2025` for Sentinel-1 SAR inundation)
- **Spatial Cross-Validation Design:** `0.1° × 0.1°` spatial blocks in `02_build_dataset.py` and `0.25° × 0.25°` spatial blocks in `07_build_flood_dataset.py`. *Note:* In the committed executed notebooks (`03`, `08`), `RUN_SPATIAL_CV = False` was set during Colab execution to save runtime, so 5-fold spatial CV outputs are **not yet verified** in the executed notebooks.
- **Storm Surge Cross-Validation:** **Leave-One-Storm-Out (LOSO)** across 8 Bay of Bengal cyclones (*Sidr 2007, Roanu 2016, Mora 2017, Fani 2019, Amphan 2020, 2022 Unnamed, 2023 Unnamed, Remal 2024*) having `>= 100` labeled pixels and positive rate between `0.5%` and `99.5%`.

---

## 3. Model-by-Model Architecture & Held-Out Test Performance

All metrics below match the committed executed notebooks in [`ml/notebooks/executed/`](../ml/notebooks/executed/).

### 3.1 Root-Zone Waterlogging (`ml/artifacts/flood_waterlogging_lgbm_h1.joblib`)
- **Algorithm:** LightGBM Classifier (`91` optical + hydro-meteorological + topographic features; excludes Sentinel-1 SAR features to prevent target circularity) + isotonic probability calibration (`threshold = 0.5048`).
- **Target Label (`label_waterlogging` at $t+1$, [`07_build_flood_dataset.py`](../ml/data_pipeline/07_build_flood_dataset.py#L221-L229)):** `swl2_wet_run >= 2` (`swl2_sat >= 0.90` for $\ge 2$ consecutive months) AND low-lying terrain (`hnd <= 10.0 m` or NaN) AND optical moisture confirmation (`lswi_mean_anom > 0` OR `mndwi_mean > -0.2` or NaN).
- **Held-Out Test Set (`2022–2025`, `n = 565,551` cropland pixel-months, positive rate `16.66%`):**
  - **ROC-AUC:** `0.9715` (vs. Persistence `0.7034`)
  - **PR-AUC:** `0.8726` (vs. Persistence `0.3380`, Pixel-Month Climatology `0.6155`)
  - **Brier Score:** `0.0503`
  - **F1 Score:** `0.8004` | **Precision:** `85.40%` | **Recall:** `75.32%`

### 3.2 Surface Flood Inundation (`ml/artifacts/flood_inundation_lgbm_h1.joblib`)
- **Algorithm:** LightGBM Classifier (`105` features including Sentinel-1 SAR `VV` lags, MODIS `LSWI`/`MNDWI`, `CHIRPS`, `ERA5-Land`, `SRTM`, and `MERIT Hydro`) + isotonic probability calibration (`threshold = 0.1784`).
- **Target Label (`label_inundation` at $t+1$, [`07_build_flood_dataset.py`](../ml/data_pipeline/07_build_flood_dataset.py#L208-L216)):** Sentinel-1 SAR open-water fraction `inund_frac >= 0.15` AND excess `inund_frac_anom >= 0.05` (`>= 0.10` inside permanent/seasonal aquaculture ponds where `jrc_seasonality >= 10` or `jrc_occurrence >= 80`).
- **Held-Out Test Set (`2023–2025`, `n = 421,155` cropland pixel-months, positive rate `4.21%`):**
  - **ROC-AUC:** `0.9378` (vs. Persistence `0.7041`)
  - **PR-AUC:** `0.4738` (`+125%` relative improvement over Persistence `0.2105`)
  - **Brier Score:** `0.0295`
  - **F1 Score:** `0.4723` | **Precision:** `38.96%` | **Recall:** `59.97%`
  - **Class Imbalance Note:** Because surface flood events are rare (`4.21%` positive rate), binary classification at the F1-tuned threshold (`0.1784`) trades precision (`38.96%`) for recall (`59.97%`).

### 3.3 Cyclone Storm Surge Inundation (`ml/artifacts/surge_inundation_lgbm.joblib`)
- **Algorithm:** LightGBM Classifier (`34` storm-track, wind/pressure, coastal distance, and hydro-topographic overtopping features).
- **Target Label (`label_surge_inundated`):** Post-storm new water fraction `> 0.10` (`Sentinel-1 VV < -16 dB` post-minus-pre storm for 2016–2024; `NASA MODIS Global Flood DB` for Cyclone Sidr 2007).
- **8-Storm Leave-One-Storm-Out (LOSO) Test Results (`n = 94,623` pixel-events; total 15-storm panel has `171,568` rows at `2.01%` base rate):**
  - **Mean LOSO ROC-AUC:** `0.8377 ± 0.0951` (vs. Physics Bathtub DEM baseline)
  - **Mean LOSO PR-AUC:** `0.2788 ± 0.2353` (`2.83x` Physics Bathtub DEM baseline `0.0985`)
  - **Cyclone Remal (May 2024, `pos_rate = 3.89%`):** `ROC-AUC = 0.9545`, `PR-AUC = 0.5997`, `F1 = 0.1600`, `Precision = 93.02%`, `Recall = 8.75%`
  - **Cyclone Roanu (May 2016, `pos_rate = 3.04%`):** `ROC-AUC = 0.9524`, `PR-AUC = 0.6460`, `F1 = 0.1875`, `Precision = 97.30%`, `Recall = 10.37%`
  - **Class Imbalance & Binary Threshold Note:** With extreme event rarity (`0.69%–10.44%` positive rate per storm) and uncalibrated training-set F1 thresholds, binary recall is low (`Mean LOSO F1 = 0.1071`, `F1 = 0.0000` on 4 of 8 held-out storms), so probabilistic surge risk scores (`ROC-AUC`/`PR-AUC`) should be used rather than hard binary cutoffs.

### 3.4 Agricultural Drought (`ml/artifacts/drought_lgbm_reg_h1.joblib`)
- **Algorithm:** Committed artifact `drought_lgbm_reg_h1.joblib` (`64` features, `target_mode = 'delta_vci'`) is a LightGBM Regressor predicting 1-month change $\Delta\text{VCI}_{t \to t+1}$ and reconstructing $\widehat{\text{VCI}}_{t+1} = \text{clip}(\text{VCI}_t + \widehat{\Delta\text{VCI}}, 0, 100)$. *(Note: `03_drought_diagnostics_and_training.ipynb` also trains a calibrated classifier `drought_lgbm_cls_h1.joblib`, which is not committed in `ml/artifacts/`.)*
- **Target Label (`drought_vci_roll` at $t+1$):** 10-year strictly causal rolling Vegetation Condition Index `< 35`.
- **Held-Out Test Set (`2022–2025`, `n = 577,584` cropland pixel-months, positive rate `21.33%`):**
  - **Classification (`03_drought_diagnostics_and_training.ipynb` Cell 10, 64 selected features):** **ROC-AUC:** `0.6480`, **PR-AUC:** `0.3436`, **Brier:** `0.1621`, **F1:** `0.3846`, **Precision:** `31.19%`, **Recall:** `50.15%`, **Threshold:** `0.2428`
  - **Regression ($\Delta\text{VCI}$, Cell 14):** **RMSE:** `29.8679`, **MAE:** `24.7766`, **$R^2$:** `+0.0630` (vs. Persistence `RMSE = 38.0322`, `R² = -0.5193`)
  - **Reproducibility Note on Variant Metrics:** An unarchived Colab run previously reported `ROC-AUC = 0.6512`, `PR-AUC = 0.3540`, `Brier = 0.1598`, `F1 = 0.3943`, `Recall = 60.00%`, and $\Delta\text{VCI}$ `MAE = 24.6745`, $R^2 = +0.0649$ using a 48-feature pruned variant. Because that executed notebook and `.joblib` artifact are not present in this repository, those variant figures cannot be independently reproduced here; this Model Card and the frontend benchmark service use the reproducible `03_drought_diagnostics_and_training.ipynb` (`0.6480 / 0.3436`) outputs as the source of truth.

---

## 4. Key Limitations & Uncertainty

1. **Sub-Grid Polder & Sluice-Gate Operations:** BWDB polder embankment breaches and manual sluice-gate management occur at `5–20 m` scales that are unresolved by `30 m–1 km` satellite grids.
2. **Dry-Season Groundwater Irrigation Confounding:** In northern Khulna districts (`Kushtia`, `Jessore`, `Jhenaidah`), diesel/electric shallow tubewell irrigation keeps crop canopies green (`VCI > 50`) even during meteorological rainfall deficits (`SPI-3 < -1`), bounding optical drought prediction accuracy (`ROC-AUC ~ 0.65`).
3. **Soil Salinity (`ECe`) Requires Ground Verification:** Satellite optical and radar features do not directly measure soil electrical conductivity (`dS/m`); farmers should verify plot-level salinity using SRDI soil testing or calibrated EC meters.
