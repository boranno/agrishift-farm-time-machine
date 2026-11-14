# AgriShift Drought Dataset: Project Handoff / Knowledge Base

Purpose: give a new Claude conversation everything needed to continue this project without the original chat.
Attach these files with this document: `01_export_gee.ipynb`, `02_build_dataset.ipynb`, `03_diagnostics_and_training.ipynb` (and the `.py` versions if wanted).
The processed data lives in the user's Google Drive, not in this document.

Status as of 2026-11-04: **dataset built and saved. Notebook 03 (drift diagnostic + LightGBM training) is written and tested on synthetic data only; it has not been run on the real panel.**

---

## 1. Who and what

- User: Boranno, CSE student at Daffodil International University (DIU), Bangladesh. Works in **Google Colab**.
- Goal: a drought / vegetation-stress prediction dataset and model for **Khulna, Satkhira and Bagerhat** (coastal Bangladesh), from NASA/Earth Engine satellite data.
- Likely feeds the user's NASA Space Apps 2026 project "AgriShift: The Farm Time Machine" (team Daydreammer), a crop-rotation decision-support dashboard for smallholder farmers and extension officers. Confirm this link with the user before assuming it.
- Working style that suited the user: short instructions, complete code they can paste, sometimes "give only cell N code". They share Colab output as pasted text or PDF printouts. Always ask for the output or error text when something fails, because code cannot be run against their Earth Engine account from the assistant side.

## 2. Starting point (what the user had)

- `Khulna_Offline_Drought_Dataset.csv`: 7,632 rows, one per 1 km pixel over a Khulna bounding box (lon 89.15–89.79, lat 22.20–23.15). Columns: `NDVI`, `Rainfall` (IMERG), `Temperature_C` (MODIS land surface temperature), `.geo`.
- `Untitled11.ipynb` (named `drout-prediction-nasadata`): pulls Earth Engine composites, exports the CSV, builds "lag" features, runs a 5-model leaderboard (Linear, SVR, Random Forest, XGBoost, LightGBM).

Problems found in that original work (reasons for the rebuild):

1. The CSV has **no date column**. Each pixel is one 2022–mid-2026 average, so it cannot support drought prediction.
2. The "lags" used `shift(1)` on the pixel table, so they were the **neighbouring pixel**, not a previous month. The reported R² of 0.70 was spatial autocorrelation (NDVI vs neighbour NDVI r = 0.86), not forecasting skill.
3. The model leaderboard ran on **synthetic random data** (the notebook printed "Initializing synthetic Khulna data grid"), so its R² of about 0 meant nothing.
4. No drought target was defined. A random train/test split leaked neighbouring pixels across the split.
5. IMERG rainfall is about 10 km, so only 70 unique values. It correlated -0.88 with latitude (a north-south gradient).

## 3. Design decisions and why

- **Pixel × month panel** instead of one averaged snapshot. Drought is a deviation from normal, so it needs time.
- **2003–2025 history** so "normal" can be computed from about 17 years per pixel and calendar month.
- **Baseline climatology uses 2003–2019 only** (`BASELINE_END = 2019`) so test years do not leak into features.
- **CHIRPS rainfall** (5 km, long record) instead of IMERG.
- **ERA5-Land** for air temperature, soil moisture, PET and ET (long record, no extra download).
- **Time split + spatial block folds** for validation (details in section 7).
- Unit of analysis is **1 km pixels**. Open alternative: upazila averages (simpler, matches farmer/extension-officer decisions). The user was asked and has not chosen; the current build is pixels.

## 4. Data sources (Earth Engine)

| Variable | Collection / band | Scale applied in pandas |
|---|---|---|
| NDVI, EVI | `MODIS/061/MOD13A2` (16-day, 1 km); masked where `SummaryQA` > 1; monthly mean | × 0.0001 |
| Land surface temp | `MODIS/061/MOD11A2` `LST_Day_1km`, `LST_Night_1km`; monthly mean | × 0.02 − 273.15 (°C) |
| Rainfall | `UCSB-CHG/CHIRPS/DAILY` `precipitation`; monthly sum | mm |
| Air temp, soil moisture, PET, ET | `ECMWF/ERA5_LAND/MONTHLY_AGGR`: `temperature_2m`, `volumetric_soil_water_layer_1`, `potential_evaporation_sum`, `total_evaporation_sum` | K − 273.15; m³/m³; abs(m) × 1000 → mm |
| Land cover | `MODIS/061/MCD12Q1` `LC_Type1`, year 2022; water (class 17) dropped | cropland = classes 12 and 14 |
| Elevation | `USGS/SRTMGL1_003` | nearest sample |
| Districts | `FAO/GAUL/2015/level2` (deprecated; superseded by `FAO/GAUL/2025/level2`) | names matched: Bagerhat, Khulna, Satkhira |

## 5. Pipeline, Part 1 (`01_export_gee.ipynb`)

Config: `PROJECT_ID = "drout-prediction-nasadata"`, years 2003–2025, `DRIVE_FOLDER = "AgriShift_dataset"`, `SPLIT_BY_DISTRICT = True`, `RUN_EXPORTS` flag (False by default).

Cells: 1 setup and Earth Engine login; 2 district polygons (checks names); 3 `build_grid()` (lazy, no computation); 4 `monthly_image(year, month)` plus a smoke test on 3 hand-made points; 5 export tasks (district × year, 69 files).

**Result:** all 69 tasks completed. Files `agrishift_grid_<District>_<year>.csv` (about 6.6 MB each) are in `My Drive/AgriShift_dataset`.

Problems hit and fixes (do not repeat these):

- **"Computation timed out"** on interactive `getInfo()` (grid size and smoke test on `grid.limit(5)`) because the full grid was rebuilt each time. Fix: smoke test on hand-made points; the grid is built lazily inside each batch export task.
- **Asset export failed** ("projects/drout-prediction-nasadata/assets does not exist or doesn't allow this operation"). The project has no writable asset root. Fix: abandoned the asset route; the grid is rebuilt in each task.
- **NDVI `None` in July** in the smoke test. Diagnosed: `SummaryQA` = 3 (cloudy) at all test points in July 2022, so the cloud mask removes it. This is normal monsoon cloud and not a bug. January, April and October were fine.
- **Exports did not start** when `RUN_EXPORTS = True` was set after Cell 5 had already run. The flag cell must run before Cell 5, and Cell 5 must run only once (rerunning it queues 69 duplicate tasks).

## 6. Pipeline, Part 2 (`02_build_dataset.ipynb`)

Steps: load and unit conversion → complete panel (every pixel × every month) → interpolate gaps of up to **3 months** per pixel for NDVI, EVI and LST (monsoon clouds) → baseline climatology from 2003–2019 → anomalies and indices → SPI → lags → labels → splits → save.

Problem hit: **Drive mount error** ("Mountpoint must not already contain files") because the output folder was created before mounting. Fixed: Cell 1 now mounts first, then creates folders.

Output (in `My Drive/AgriShift_dataset/processed/`):

- `agrishift_panel.parquet`: full training panel, **2,601,852 rows × 85 columns** = 9,427 pixels × 276 months.
- `agrishift_demo_district_month.csv`: cropland pixels averaged by district × month (small table for the offline app).

### Panel columns

- **IDs and static:** `pixel_id` (`lon_lat` string), `date`, `year`, `month`, `district`, `lon`, `lat`, `landcover`, `elevation`, `is_cropland` (1 for classes 12 and 14).
- **Raw monthly:** `ndvi`, `evi`, `lst_day`, `lst_night`, `air_temp`, `rain_mm`, `soil_moisture`, `pet_mm`, `et_mm`, `et_pet`.
- **Baseline stats (2003–2019, per pixel and calendar month):** `<col>_clim_mean/std/min/max` for `ndvi`, `lst_day`, `soil_moisture`, `et_pet`.
- **Drought indices:** `ndvi_anom`, `ndvi_z`, `vci` (0–100, clipped), `tci`, `vhi`, `soil_moisture_z`, `et_pet_z`, `lst_day_anom`, `spi1`, `spi3`, `spi6` (gamma fit per CHIRPS cell and month, baseline years only).
- **Lags and rolling:** lags 1–3 of `ndvi`, `vci`, `rain_mm`, `soil_moisture_z`, `spi3`, `lst_day_anom`; `ndvi_roll3`, `rain_roll3`.
- **Season:** `season_rabi` (Nov–Feb), `season_kharif1` (Mar–Jun), `season_kharif2` (Jul–Oct), `month_sin`, `month_cos`.
- **Labels (current month):** `drought_vci` (VCI < 35), `drought_spi3` (SPI-3 ≤ −1), `drought_any` (either).
- **Forecast targets (features at month t → target at t+h, h = 1, 2):** `target_vci_next{h}`, `target_ndvi_next{h}`, `label_drought_vci_next{h}`, `label_drought_any_next{h}`.
- **Splits:** `split` (train ≤ 2019, val 2020–2021, test ≥ 2022), `spatial_fold` (0–4, random assignment of ~11 km blocks, seed 42).

Rule for modelling: use only time-t columns as features. Never use `target_*` or `label_*` columns as features. Current-month `vci` / `drought_vci` is a legitimate feature for forecasting next month.

## 7. Results so far (sanity report)

- Pixels 9,427; **cropland pixels 2,611** (about 28%). The rest are mostly mangrove, shrimp farms and built-up land, where VCI means little. **Train on `is_cropland == 1`.**
- Rows per split: train 1,923,108; val 226,248; test 452,496.
- NDVI missing share was 16.8% before gap fill (now under 5%). Air temp, soil moisture, PET, ET and ET/PET are 4.9% missing, identical across columns (likely coastal pixels with no ERA5-Land value). Tree models can handle NaN.
- Drought rate (VCI < 35): **train 27.5%, val 15.5%, test 13.4%**. By month the rate is flat at 22–27%, so the monsoon gap-fill is not distorting any month.
- CHIRPS cells: 464.

## 8. Open issue to resolve first

The drought rate falls from 27.5% (train) to 13.4% (test). Possible causes: genuinely less stressed recent years, NDVI trend or sensor drift, or a VCI-scaling effect (VCI uses the 2003–2019 min/max, and later values are clipped at 0–100). The check not yet run (cropland pixels, yearly means):

```python
crop = panel[panel["is_cropland"] == 1]
print(crop.groupby("year").agg(
    ndvi=("ndvi", "mean"), vci=("vci", "mean"),
    drought_rate=("drought_vci", "mean")).round(3).to_string())
```

Steadily rising NDVI by year means trend or drift (consider detrending or a rolling baseline). A few low years means real variation.

## 9. Next steps (code written: `03_diagnostics_and_training.ipynb`, not yet run on the real panel)

1. Run the yearly diagnostic above and decide whether to adjust the label or baseline.
2. Training notebook (LightGBM or XGBoost), cropland only:
   - Time split (`split`) plus a held-out `spatial_fold`, with the time split kept on top.
   - Targets: classification `label_drought_vci_next1` (and `_next2`) and regression `target_vci_next1`.
   - Metrics: PR-AUC and F1 on the drought class, plus MAE for regression. **Not accuracy.**
   - Baselines to beat: persistence (next month's label = this month's) and climatology. A model that does not beat these has learned nothing.
   - Report results per month and per district.
3. Optional: aggregate to upazila × month for the farmer-facing app.
4. Integrate outputs into AgriShift (risk map or advisory card), using the small demo CSV for offline use.

## 10. Caveats to state honestly

- Rows are highly autocorrelated in space and time, so the effective sample is much smaller than 2.6 million. Judge by held-out years and spatial blocks, never by in-sample scores.
- Labels are rule-based (VCI and SPI thresholds), not ground-truth drought records. Validating against known drought years (for example reports from BMD or Bangladesh agriculture agencies) would strengthen any claim.
- The deprecated GAUL 2015 dataset still works; switching to `FAO/GAUL/2025/level2` is optional and may change district polygon names.
- Earth Engine collection IDs and band names were written from knowledge and confirmed only by the smoke test (all bands returned values except the cloud-masked July vegetation bands).
