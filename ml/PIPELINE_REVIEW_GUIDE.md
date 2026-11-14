# AgriShift Khulna hazard datasets: pipeline and review guide

Audience: an AI or human reviewer who has NOT seen the original conversation.
Goal of the review: find errors, leakage, unsafe assumptions and weak validation in the notebooks and the pipeline, before the
datasets and models are used in the AgriShift project (NASA Space Apps 2026, coastal Bangladesh). Please do not just
confirm that it looks fine. Attack it.

Author note: the notebooks were written by an AI assistant (Claude) with a student (Boranno, DIU) running them in Google Colab.
The assistant could not run anything that needs a Google Earth Engine or Copernicus account. Section 3 says exactly which
parts were run on real data and which were only run on synthetic data.

---

## 0. Ready-to-paste review prompt

> You are reviewing a geospatial machine-learning pipeline built in Google Colab with Google Earth Engine.
> Read PIPELINE_REVIEW_GUIDE.md first, then the notebooks (.py files have the same code as the .ipynb files).
> Review in this order and report findings as a table (severity: critical / major / minor, file + cell, problem,
> suggested fix as a code diff):
> 1. Earth Engine API correctness: collection IDs, band names, scale factors, reduceRegions/sample semantics, projection and
>    scale arguments, masking behaviour, empty-collection handling, getInfo timeouts, export limits. Check against the official
>    Earth Engine catalog and docs. Flag anything you cannot verify.
> 2. Data leakage and validation design: baseline/normal periods, time splits, spatial folds, label construction, features that
>    contain the label, threshold selection on test data, leave-one-storm-out design.
> 3. Label validity: does each label measure what its name claims (drought, inundation, waterlogging, storm-surge inundation)?
>    Look hard at confounders (rice paddies, shrimp ponds, cloud masking, rain-driven floods vs surge).
> 4. Statistical and ML soundness: autocorrelation, tiny numbers of events, class imbalance, metrics, baselines.
> 5. Engineering: units, off-by-one in lags/shifts/run-lengths, merges that reorder rows, memory use, reproducibility.
> 6. The five biggest risks to the project's scientific claims, and what evidence would settle each one.
> Do not rewrite everything. Be specific. Say "I could not verify" when you could not.
> You can run the offline tests: `bash synthetic_tests/run_all_tests.sh`.

---

## 1. What is being built

Four hazard datasets for the Khulna region of Bangladesh, all on the same **1 km MODIS pixel grid**, built in Colab with
Google Earth Engine (project id `drout-prediction-nasadata`), with separate evidence for each hazard.

| Hazard | Brief wording (separate methods) | Evidence used | Unit of analysis | Period |
|---|---|---|---|---|
| Drought | vegetation / rainfall deficit | NDVI → VCI, SPI from CHIRPS, soil moisture, LST, ET/PET | pixel x month | 2003-2025 |
| Flooding (inundation) | suitable inundation evidence | Sentinel-1 radar open water (new, non-permanent water vs the pixel's own normal) | pixel x month | 2017-2025 |
| Waterlogging | soil-saturation evidence | ERA5-Land soil water (3 layers), rainfall accumulation, MODIS wetness, drainage layers | pixel x month | 2003-2025 |
| Storm surge | storm-surge or coastal-inundation data, NOT inferred from a drought or rainfall model | Observed coastal inundation after cyclones (radar, MODIS Global Flood Database) as the label; modelled surge (GTSM) and storm wind/pressure as features | cyclone event x pixel | 2000-2025 |

Regions: drought = 3 districts (Khulna, Satkhira, Bagerhat). Flood/waterlogging = all of Khulna Division (about 10 districts).
Storm surge = all of Khulna Division, with an exposure zone defined later from distance to coast and elevation.

Design rule: each hazard has its own label and its own feature group. Rainfall and drought variables are not used for the
surge dataset. The waterlogging model gets no radar columns; the inundation model gets no optical wetness columns.

---

## 2. Pipeline map

```
DROUGHT
 01_export_gee ──► Drive: agrishift_grid_<District>_<year>.csv (69 files)
                         └─► 02_build_dataset ──► processed/agrishift_panel.parquet, agrishift_demo_district_month.csv
                                                        └─► 03_diagnostics_and_training ──► processed/model_results/

FLOOD / WATERLOGGING
 04_export_flood_gee ──► Drive (AgriShift_flood_dataset):
                           agrishift_flood_sat_<District>_<year>.csv  (2003-2025, soil/rain/optical stream)
                           agrishift_flood_sar_<District>_<year>.csv  (2017-2025, radar stream)
                         └─► 07_build_flood_dataset ──► processed/agrishift_flood_panel.parquet, flood_features.json,
                                                         agrishift_flood_demo_district_month.csv
                                  └─► 08_flood_diagnostics_and_training ──► processed/model_results/

STORM SURGE
 05_storm_events_and_surge ──► storm_events.csv                  (IBTrACS cyclone catalogue, NOAA CSV downloaded in Colab)
        (optional, needs CDS)└► gtsm_event_station_stats.csv    (Copernicus GTSM-ERA5 surge/tide per event near coast)
 06_export_surge_inundation_gee (reads storm_events.csv) ──► agrishift_surge_<sid>_<District>.csv
                         └─► 09_build_surge_dataset (also reads the 05 outputs) ──► processed/surge_event_cell_table.parquet,
                                                         surge_event_summary.csv, surge_features.json
                                  └─► 10_surge_diagnostics_and_training ──► processed/model_results/
```

Shared conventions:

- Grid: MODIS MOD13A2 1 km projection; pixel centres from `Image.sample(scale=1000, projection=MODIS_PROJ, geometries=True)` per district.
  `pixel_id = f"{lon:.5f}_{lat:.5f}"` (rounded to 5 decimals), identical across hazards, so the datasets can be joined.
- Water pixels (MODIS land cover class 17, year 2022) are dropped from the grid. Cropland = IGBP classes 12 and 14, filtered in pandas.
- "-9999" in exports means no data for static layers (set to NaN in pandas). For `dist_coast_m` / `dist_water_m` it means
  "beyond the search radius" (200 km / 20 km) and is replaced by the cap in notebook 09.
- Every builder keeps normals (baselines) in a training-only period to avoid leakage, and saves Parquet (CSV.gz fallback).
- Each notebook mounts Google Drive **first**, then creates folders (mounting after creating folders fails).
- Environment variables (`AGRI_INPUT`, `FLOOD_IN`, `SURGE_IN`, ...) override Drive paths so the scripts run locally.

---

## 3. Status: what was actually run

| Nb | Name | Needs | Run on REAL data? | Run on synthetic data? |
|---|---|---|---|---|
| 01 | export_gee | Earth Engine | **Yes** (smoke tests passed; 69 export tasks completed) | n/a |
| 02 | build_dataset | 01 output | **Yes** (sanity report in section 6) | Yes |
| 03 | diagnostics_and_training | 02 output | **No run reported** | Yes (runs end to end) |
| 04 | export_flood_gee | Earth Engine | No run reported. Collection IDs and band names are from documentation and memory; the smoke test in Cells 4-5 is meant to confirm them | n/a |
| 05 | storm_events_and_surge | internet; CDS account for GTSM | **Yes for Cells 1-2** (29 cyclone events found). The GTSM download (Cell 3) was NOT run | Yes (event selection and surge summariser) |
| 06 | export_surge_inundation_gee | Earth Engine, 05 output | No run reported | n/a |
| 07 | build_flood_dataset | 04 output | No | Yes |
| 08 | flood_diagnostics_and_training | 07 output | No | Yes |
| 09 | build_surge_dataset | 05 and 06 output | No | Yes |
| 10 | surge_diagnostics_and_training | 09 output | No | Yes |

"Synthetic" means random data with the same column names and simple built-in patterns (`synthetic_tests/`). It proves the code
runs and the schemas match. It says nothing about scientific validity. Scores on synthetic data are meaningless.

---

## 4. Notebook-by-notebook description

Each notebook exists as `.ipynb` (for Colab) and `.py` (cells separated by `# %%`).

### 01_export_gee (drought export)
Cells: 1 setup (project, years 2003-2025, 3 districts, `RUN_EXPORTS` flag) · 2 district polygons (GAUL level 2) · 3 grid builder (lazy) ·
4 `monthly_image(year, month)` + smoke test · 5 export tasks, one per district x year.
Monthly image bands:
- NDVI, EVI: `MODIS/061/MOD13A2`, mask `SummaryQA <= 1`, monthly mean of the 16-day composites.
- LST_Day, LST_Night: `MODIS/061/MOD11A2`, monthly mean.
- CHIRPS_rain_mm: `UCSB-CHG/CHIRPS/DAILY`, monthly sum.
- t2m_K, soil_moisture, pet_m, et_m: `ECMWF/ERA5_LAND/MONTHLY_AGGR`.
- static: landcover (`MODIS/061/MCD12Q1`, 2022), elevation (`USGS/SRTMGL1_003`).
Extraction: `reduceRegions(points, Reducer.first(), scale=1000, crs=MODIS_PROJ, tileScale=4)` per month, tagged with year and month.
Problems met and fixed: interactive `getInfo()` on the full grid timed out (grid is now lazy and built inside each batch task);
Earth Engine asset export failed (no asset root in the Cloud project, so the asset approach was dropped).
Known: July NDVI is `None` at some points because the cloud mask removes monsoon scenes (verified with a QA diagnostic).

### 02_build_dataset (drought panel)
Steps: load 69 CSVs → unit conversion (NDVI x0.0001, LST x0.02 − 273.15, ERA5 evaporation abs x1000 mm) → complete
pixel x month panel (reindex) → interpolate gaps up to **3 months** for NDVI, EVI, LST (`limit_area="inside"`) → per-pixel,
per-calendar-month baseline (mean/std/min/max) from **2003-2019** → `ndvi_anom`, `ndvi_z`, `vci` (clipped 0-100), `tci`, `vhi`,
soil-moisture and ET/PET z-scores → **SPI-1/3/6** (gamma fit with a zero-rainfall mass, per CHIRPS 0.05° cell and calendar month,
baseline years only; cells fitted once and merged back) → true time lags 1-3 months, rolling features, season flags → labels →
splits → save.
Labels: `drought_vci` = VCI < 35; `drought_spi3` = SPI-3 <= -1; `drought_any` = either. Forecast targets `target_*_next{1,2}`,
`label_*_next{1,2}` via `groupby(pixel).shift(-h)`.
Splits: `split` = train <= 2019, val 2020-2021, test >= 2022. `spatial_fold` (0-4) from 0.1° blocks, random assignment, seed 42.
Output: 2,601,852 rows x 85 columns.

### 03_diagnostics_and_training (drought)
Cell 2: year-by-year diagnostic for cropland pixels (NDVI, anomaly, VCI, drought rate, share of VCI at 0 or 100, trend tests).
Cell 3: compares label definitions (fixed-baseline VCI, NDVI z-score <= -1, rolling 10-year-baseline VCI, SPI-3, any) across splits.
Cell 4: builds `y_cls_next{h}`, `y_reg_next{h}` and the feature list (excludes `target_*`, `label_*`, `drought_*`, year, spatial_fold,
lon/lat unless `USE_COORDS`). Cells 6-8: LightGBM classifier (forecast drought 1 and 2 months ahead), strict test on
unseen years AND unseen spatial blocks, regression of next-month VCI.
Baselines: persistence, VCI score, climatology. Metrics: PR-AUC, ROC-AUC, F1 at a threshold chosen on the validation split.
**Open issue:** drought rate (VCI < 35) is 27.5% in train, 15.5% in val, 13.4% in test. Cause not yet established (real
recovery, NDVI trend/drift, or VCI saturation because VCI is scaled to the 2003-2019 min/max). Cell 2-3 are meant to settle it.

### 04_export_flood_gee (flood and waterlogging export)
Two separate streams on the same grid, Khulna Division (`ADM1_NAME == "Khulna"` in GAUL 2015 level 2).
- **Radar stream (Method 1, 2017-2025):** `COPERNICUS/S1_GRD`, IW mode, VV, dB. Per image `VV < -18` = water.
  Monthly bands: `water_freq` (mean over scenes), `water_peak` (max over scenes), `n_obs` (scene count), `vv_median`,
  `perm_water` (`JRC/GSW1_4/GlobalSurfaceWater` occurrence >= 75). Averaged over a 1 km square around each pixel centre
  (`buffer(500).bounds()`), `reduceRegions(Reducer.mean(), scale=60)`. Empty month → all-masked fallback image.
- **Soil-saturation stream (Method 2, 2003-2025):** ERA5-Land `volumetric_soil_water_layer_1..3`, `total_precipitation_sum`,
  `surface_runoff_sum`; CHIRPS monthly sum, max daily, days > 50 mm; MODIS `MOD09A1` LSWI = (b2-b6)/(b2+b6) and MNDWI = (b4-b6)/(b4+b6)
  with StateQA cloud / shadow / internal-cloud bits masked (monthly mean, max MNDWI). Static: landcover, elevation, `hnd` and `upa`
  (`MERIT/Hydro/v1_0_1`), JRC occurrence and seasonality.
Export: radar = district x year (optionally split by months via `MONTHS_PER_TASK`), soil stream = district x year.
`CONFIRM_SAR` / `CONFIRM_SAT` flags must be set before launching (nothing starts otherwise).
Never run in the author's environment: the smoke tests in Cells 4-5 are the first check.

### 05_storm_events_and_surge (cyclone catalogue + modelled surge)
Cell 2: downloads NOAA IBTrACS v04r01 North Indian basin CSV (EE's copy ends May 2024, so the NCEI CSV is used). Keeps storms
(season >= 2000, not "spur" tracks) whose centre came within **250 km** of any of 3 coast reference points and reached
**34 kt** (max of WMO and USA winds) within +-24 h of closest approach. For each: `t0` (closest approach), intensity, track side
(`coast_on_right_of_track` from a cross product), `days_to_syzygy` (distance to new/full moon from a synodic-month formula),
`spring_tide_flag` (<= 2 days), windows (post: t0-1 d to t0+7 d; pre: t0-33 d to t0-3 d), `sar_era` (t0 >= 2017), `gfd_era` (t0 <= 2018-12-10).
Result on real data: **29 events**.
Cell 3 (optional, not run): Copernicus CDS dataset `sis-water-level-change-timeseries-cmip6` (GTSM-ERA5 reanalysis, 1950-2024).
The user pastes their API request ("Show API request"); the code swaps year/month per event, downloads NetCDF, auto-detects
variable names, and per station inside a bounding box computes peak surge, tide at the surge peak and peak total water level.

### 06_export_surge_inundation_gee (per event x cell)
Reads `storm_events.csv`. Grid: all Khulna Division districts. Static exposure layers: landcover, elevation, `hnd`, JRC occurrence,
`dist_coast_m` (Euclidean distance, 200 km radius, to `NOAA/NGDC/ETOPO1` bedrock < 0), `dist_water_m` (distance to JRC occurrence >= 90, 20 km radius).
Per event image: radar `post_water` / `pre_water` (max over scenes of `VV < -18` after / before the storm), `new_water` =
`post & ~pre & ~permanent`, scene counts, valid fraction; MODIS Global Flood Database (`GLOBAL_FLOOD_DB/MODIS_EVENTS/V1`, 2000-2018) `flooded`,
`duration`, `jrc_perm_water` filtered to events whose `dfo_main_cause` contains cyclone/tropical/surge/storm/tidal words;
ERA5 hourly (`ECMWF/ERA5/HOURLY`) peak 10 m wind speed and minimum mean sea level pressure over t0-1 d to t0+2 d.
Averaged over 1 km squares (`reduceRegions(Reducer.mean(), scale=60)`). One export per event x district. A coverage table
(radar scenes before/after each storm) is printed before the export so unusable events are visible.
No rainfall or drought variable is exported.

### 07_build_flood_dataset
Loads both 04 streams, filters to cropland (`CROPLAND_ONLY`), builds the complete pixel x month panel, merges radar, builds features and labels:
- Normals: soil layers, rainfall, optical indices from 2003-2019; radar from 2017-2021 (`SAR_BASELINE_END`).
- `swl2_sat`, `swl3_sat` = (value - min) / (max - min) from the pixel-month baseline, clipped 0-1. `swl2_wet_run` = consecutive months with `swl2_sat >= 0.90`.
- **Inundation label**: `flood_new_peak >= 0.10` AND `flood_new_peak - baseline_mean >= 0.05`, only where at least one radar scene exists.
  `flood_new_peak = clip(water_peak - perm_water, 0, 1)`. A "persistent" variant uses `flood_new_freq >= 0.25`.
- **Waterlogging label**: `swl2_sat >= 0.90` AND `swl2_wet_run >= 2` AND poorly drained (`hnd <= 10` or, if `hnd` missing, `elevation <= 10`).
  Confirmed variant adds `mndwi_z >= 1` or `lswi_z >= 1`.
- Targets next1/next2 by group shift; separate splits `split_inund` (2017-2021 / 2022 / 2023+) and `split_wlog` (<=2019 / 2020-21 / 2022+); `spatial_fold`.
- Feature groups saved in `flood_features.json`: inundation = static + season + rain + soil + radar; waterlogging = static + season + rain + soil + optical (no radar).

### 08_flood_diagnostics_and_training
Cells 2-3: label rates by split/year/month/district, plots, and a threshold-sensitivity grid for both labels. Cells 5-6: LightGBM
for each task and horizon, evaluated on held-out years, then on held-out years x unseen spatial folds. Baselines: persistence,
the raw signal (`flood_new_peak` or `swl2_sat`), climatology.

### 09_build_surge_dataset
Loads 05 and 06 outputs; fixes -9999; cropland filter; labels from **observed** inundation:
- `label_radar` = `new_water >= 0.10` where >= 1 scene before and after and >= 50% valid pixels.
- `label_gfd` = `gfd_new_water >= 0.10` where a cyclone-cause flood footprint exists.
- `label_surge_inundation` = radar, else GFD, and the OR of the two when both exist; `label_source` records which.
- `in_exposure_zone` = within 100 km of the sea AND (elevation or `hnd` <= 10 m). Cells outside are kept as "not exposed" examples.
- GTSM surge/tide values attached to each cell from the nearest station within 80 km (cKDTree); if no GTSM file, those columns stay NaN.
- Event summary table (per storm: labelled cells, inundated share, regional surge, wind, pressure, distance).
- Splits: `split_time` by landfall year (<=2015 / 2016-2019 / 2020+), `event_fold` (round-robin by date), `spatial_fold`.
- Feature groups in `surge_features.json`: `static_only`, `storm` (+ event wind/pressure/track/tide timing and ERA5 wind and pressure), `storm_gtsm` (+ modelled surge and tide).

### 10_surge_diagnostics_and_training
Cell 2: which storms have usable labels. Cell 3: plausibility checks that the label behaves like surge: inundated share by distance
to coast and by elevation, Spearman correlation across storms with modelled surge, wind, pressure, track distance. Cell 4: threshold sensitivity.
Cell 6: **leave-one-storm-out** LightGBM (class-weighted, 300 trees) for `static_only`, `storm`, `storm_gtsm`, compared with simple rules
(rank by distance to coast, by elevation). Cell 7: feature importance.

---

## 5. Label definitions and thresholds (single table)

| Label | Rule | Why | Main weakness |
|---|---|---|---|
| `drought_vci` | VCI < 35 vs per-pixel-month 2003-2019 min/max | Standard vegetation-condition drought threshold | Min/max from 17 years; later years can exceed the range (clipped); rate drops 27.5% → 13.4% in test |
| `drought_spi3` | SPI-3 <= -1 | WMO-style moderate drought | CHIRPS is 0.05° |
| `label_inundation` | new non-permanent radar water >= 10% of cell AND >= 5 points above the pixel-month normal | Remove routine paddy and permanent water | Radar threshold -18 dB VV not calibrated; 5-year radar baseline |
| `label_waterlogging` | `swl2_sat >= 0.9` for >= 2 months AND poorly drained | Soil near its wettest for that month, persistent, on low land | Pure model-reanalysis evidence (0.1° ERA5-Land); no ground truth; thresholds arbitrary |
| `label_surge_inundation` | observed new coastal water (radar after-minus-before, or MODIS cyclone-cause flood footprint) >= 10% of cell | Observed inundation, not inferred from rain | Radar cannot tell surge from rain; 1-2 scenes after a storm; few events |

---

## 6. Real results seen so far

Drought panel (notebook 02 sanity report): 2,601,852 rows; 9,427 pixels; 2,611 cropland pixels; NDVI missing 16.8% before gap
fill and under 5% after; air temp / soil moisture / PET / ET missing 4.9% (identical across columns, probably coastal pixels
without ERA5-Land); drought rate by month flat at 22-27%; drought rate by split 27.5 / 15.5 / 13.4%; 464 CHIRPS cells.
Storm catalogue (notebook 05): 29 cyclones within 250 km and >= 34 kt, 2000-2025. Sidr (2007) shows closest approach 25 km, 140 kt.

---

## 7. Known weaknesses and unverified assumptions (the reviewer should test these)

1. **Earth Engine IDs, band names and bit masks in 04 and 06 were not executed.** Verify: `MERIT/Hydro/v1_0_1` bands `hnd`, `upa`;
   `MODIS/061/MOD09A1` bands `sur_refl_b02/b04/b06`, `StateQA` bit meanings used (0-1 cloud state, 2 shadow, 10 internal cloud);
   `ECMWF/ERA5_LAND/MONTHLY_AGGR` band names (`volumetric_soil_water_layer_1..3`, `surface_runoff_sum`, `total_precipitation_sum`);
   `ECMWF/ERA5/HOURLY` bands (`u_component_of_wind_10m`, `v_component_of_wind_10m`, `mean_sea_level_pressure`);
   `GLOBAL_FLOOD_DB/MODIS_EVENTS/V1` bands and the `dfo_main_cause` property and its values;
   `NOAA/NGDC/ETOPO1` `bedrock`; `Kernel.euclidean` distance behaviour beyond the radius (masked or capped?).
2. **Scale and projection in `reduceRegions`:** radar boxes use `scale=60` with no `crs`, composites have the default projection;
   GFD (250 m), ERA5 (0.25°) and JRC (30 m) are all resampled by nearest neighbour at that nominal scale. Is the fraction estimate
   unbiased? Are the 1 km square boxes (geodesic `buffer(500).bounds()`) consistent with the sinusoidal MODIS pixel footprint?
3. **Radar water threshold** (-18 dB VV) is a literature-style default, with no speckle filtering, no incidence-angle or orbit
   handling, and no check of mangrove / flooded-vegetation / smooth-surface false positives or missed flooded vegetation.
4. **Surge vs rain** (notebooks 06, 09, 10): the label is observed inundation after cyclones; radar cannot separate the cause. Separation
   rests on event selection, the exposure zone and the plausibility checks in notebook 10 Cell 3. Recorded gauge levels
   (BWDB Hiron Point, Mongla, Khepupara) have NOT been obtained.
5. **GTSM step never run.** CDS request keys, NetCDF variable and coordinate names, and station subsetting are guesses with
   auto-detection and printouts; they may fail on the real files. Also: GTSM covers 1950-2024 only.
6. **Few storms.** About 29 catalogue events; only those with radar before/after (2017+) or a MODIS cyclone footprint (<= 2018) get labels.
   Storm-level features take only a handful of distinct values, so trees can memorise events. Leave-one-storm-out is used for that reason.
7. **Radar record is short (2017+).** Baseline for "normal" water is 2017-2021 (5 years); inundation trains on 2017-2021 only.
8. **Waterlogging is reanalysis only** (ERA5-Land soil water at about 11 km). The 1 km label inherits that coarse resolution; the
   optical confirmation is cloud-limited in the monsoon.
9. **Shrimp ponds (gher) and rice paddies** look like water in radar. Permanent-water masking uses JRC occurrence only up to 2021. No
   crop-calendar or aquaculture mask is applied.
10. **Drought label drift** (section 4, notebook 03) is unresolved.
11. **GAUL 2015** is deprecated (a 2025 version exists). District names are assumed stable; Cell 2 asserts the match.
12. **Grid mismatch risk:** drought grid = 3 districts; other grids = whole division. They share pixel centres only if the MODIS sampling is reproducible. Verify by joining `pixel_id`s.
13. **Metric choices:** thresholds for F1 are tuned on the validation split in 03/08; in 10 they are fixed (0.5 for models, top 20% for the rules). Check for any path where test data influences a choice.
14. **Persistence baseline** uses the same label definition as the target; forecasting skill could be inflated by autocorrelated labels (waterlogging runs, drought VCI).

---

## 8. Suggested review checklist

Leakage and validation
- [ ] Are all baselines/normals computed only from training years (02: <= 2019; 07: <= 2019 and radar 2017-2021)?
- [ ] Do any features contain the label's own future (shifts with the wrong sign, rolling windows that look forward, merges that mix months)?
- [ ] 03/08: threshold selection uses validation only. 10: leave-one-storm-out has no event overlap between train and test rows.
- [ ] Spatial folds: random assignment of 0.1° blocks, and the time split on top. Is the "unseen fold" test truly unseen in the preprocessing (e.g. normals computed on all pixels)?

Correctness
- [ ] 02: unit conversions; SPI gamma fit with zero mass; CHIRPS cell key (`floor(lon/0.05)`); VCI/TCI formulas and signs.
- [ ] 07: `run_length`, `rain_roll2/3` with `groupby.rolling`, the baseline merges (`how="left"` keeps row order?), cropland filter order.
- [ ] 09: label logic when radar and GFD disagree; `label_source`; exposure zone; nearest-station join (lat/lon scaling).
- [ ] 05: closest-approach logic, `coast_on_right_of_track` sign convention, spring-tide formula (known new moon 2000-01-06 18:14 UTC).

Earth Engine
- [ ] Every collection and band exists with the stated units and scale factors.
- [ ] Empty-collection guards actually avoid errors; masked values become nulls (not zeros) in exports.
- [ ] Task sizes are reasonable (district x year; 12 months of 1 km boxes at 60 m).

Science
- [ ] Do the label rates in the printed diagnostics make physical sense (inundation vs month; waterlogging by district; surge label vs distance to coast and vs modelled surge height)?
- [ ] Which claims would be defensible in the project write-up, and which would not (rule-based labels, few events, no ground truth)?

---

## 9. Environment and how to run

- Colab, Python 3.12/3.13 era packages: `earthengine-api`, `pandas`, `numpy`, `scipy`, `scikit-learn`, `lightgbm`, `pyarrow`, `matplotlib`; `cdsapi`, `xarray`, `netCDF4` for 05 Cell 3.
- Earth Engine project `drout-prediction-nasadata`. Asset exports are NOT available (no asset root); all exports go to Google Drive.
- Drive folders: `AgriShift_dataset` (drought), `AgriShift_flood_dataset`, `AgriShift_surge_dataset`, each with a `processed/` subfolder.
- Order: 01 → 02 → 03; 04 → 07 → 08; 05 → 06 → 09 → 10. Earth Engine exports are background tasks (tracked at code.earthengine.google.com/tasks).
- Offline tests: `bash synthetic_tests/run_all_tests.sh` (needs the Python packages above; no accounts). Covers 02, 03, 05 (selection), 07, 08, 09, 10.
  It does not cover 01, 04, 06 or the CDS download.

---

## 10. File inventory

```
01_export_gee.ipynb/.py                    02_build_dataset.ipynb/.py            03_diagnostics_and_training.ipynb/.py
04_export_flood_gee.ipynb/.py              07_build_flood_dataset.ipynb/.py      08_flood_diagnostics_and_training.ipynb/.py
05_storm_events_and_surge.ipynb/.py        06_export_surge_inundation_gee.ipynb/.py
09_build_surge_dataset.ipynb/.py           10_surge_diagnostics_and_training.ipynb/.py
AgriShift_Drought_Dataset_Handoff.md       (earlier, drought-only handoff; superseded by this guide)
PIPELINE_REVIEW_GUIDE.md                   (this file)
synthetic_tests/                           make_synthetic_*.py and run_all_tests.sh
```
