# AgriShift — Geospatial & Agronomic Data Dictionary

This dictionary defines the primary satellite, hydro-meteorological, topographic, and agronomic variables used across the AgriShift GEE/ML pipeline (`ml/data_pipeline/`) and web application (`frontend/src/services/`).

---

## 1. Spatiotemporal Identifiers & Static Land/Topography Features

| Field Name | Units | Source Dataset | Description |
| :--- | :--- | :--- | :--- |
| `pixel_id` | String | `MODIS/061/MOD13A2` | Unique `1 km` grid cell identifier formatted as `"{lon:.5f}_{lat:.5f}"` |
| `district` | String | FAO GAUL 2015 Level-2 | Administrative district name within Khulna Division (10 districts) |
| `year`, `month` | Integer | Calendar | Observation year (`2003–2025`) and month (`1–12`) |
| `lc_type1` | Categorical (`1–17`) | `MODIS/061/MCD12Q1` | IGBP Annual Land Cover class (`12` = Croplands, `14` = Cropland/Natural Mosaic, `17` = Water) |
| `is_cropland` | Binary (`0/1`) | `MODIS/061/MCD12Q1` | `1` if `lc_type1 in {12, 14}` (`12,033` pixels across Khulna Division) |
| `elevation` | Meters (`m`) | `USGS/SRTMGL1_003` | NASA SRTM `30 m` digital elevation aggregated to `1 km` cell mean |
| `hnd` | Meters (`m`) | `MERIT/Hydro/v1_0_1` | Height Above Nearest Drainage (`90 m` hydrologically adjusted DEM) |
| `upa` | $\text{km}^2$ | `MERIT/Hydro/v1_0_1` | Upstream drainage accumulation area (`log1p(upa)` used in ML models) |
| `jrc_perm_water_frac` | Fraction (`0–1`) | `JRC/GSW1_4` | Fraction of `1 km` cell covered by permanent/year-round aquaculture water (`seasonality >= 10` months) |

---

## 2. Dynamic NASA Optical, Thermal & Radar Satellite Variables

| Field Name | Units | Source Dataset | Description |
| :--- | :--- | :--- | :--- |
| `ndvi`, `evi` | Dimensionless (`-1` to `1`) | `MODIS/061/MOD13A2` | Monthly cloud-screened (`SummaryQA <= 1`) Normalized Difference & Enhanced Vegetation Indices |
| `vci` | Index (`0–100`) | Derived (`MOD13A2`) | Vegetation Condition Index relative to 2003–2019 pixel-month min/max (`< 35` indicates drought stress) |
| `lst_day_K`, `lst_night_K` | Kelvin (`K`) | `MODIS/061/MOD11A2` | Monthly mean daytime and nighttime Land Surface Temperature |
| `tci` | Index (`0–100`) | Derived (`MOD11A2`) | Temperature Condition Index (`100 * (LST_max - LST) / (LST_max - LST_min)`) |
| `vhi` | Index (`0–100`) | Derived (`MOD13A2` + `MOD11A2`) | Vegetation Health Index (`0.5 * VCI + 0.5 * TCI`) |
| `lswi` | Dimensionless (`-1` to `1`) | `MODIS/061/MOD09A1` | Land Surface Water Index: `(B2_NIR - B6_SWIR1) / (B2_NIR + B6_SWIR1)` |
| `mndwi` | Dimensionless (`-1` to `1`) | `MODIS/061/MOD09A1` | Modified Normalized Difference Water Index: `(B4_Green - B6_SWIR1) / (B4_Green + B6_SWIR1)` |
| `s1_vv_mean` | Decibels (`dB`) | `COPERNICUS/S1_GRD` | Monthly mean C-band Sentinel-1 SAR `VV` backscatter (`30 m` speckle-filtered) |
| `s1_flood_frac` | Fraction (`0–1`) | `COPERNICUS/S1_GRD` + `JRC` | Fraction of `1 km` cell with `VV < -18 dB` outside permanent water (`seasonality < 10` months) |

---

## 3. Hydro-Meteorological & Cyclone Forcing Variables

| Field Name | Units | Source Dataset | Description |
| :--- | :--- | :--- | :--- |
| `rain_mm` | Millimeters (`mm/month`) | `UCSB-CHG/CHIRPS/DAILY` | Monthly total precipitation |
| `spi1`, `spi3`, `spi6` | Z-score (`σ`) | Derived (`CHIRPS`) | 1-, 3-, and 6-month Standardized Precipitation Index fit on 2003–2019 baseline |
| `swl1`, `swl2`, `swl3` | $\text{m}^3/\text{m}^3$ | `ECMWF/ERA5_LAND` | Volumetric soil water in layers 1 (`0–7 cm`), 2 (`7–28 cm`), and 3 (`28–100 cm`) |
| `swl1_z` | Z-score (`σ`) | Derived (`ERA5-Land`) | Pixel-month standardized root-zone soil moisture anomaly |
| `pet_mm`, `et_mm` | Millimeters (`mm/month`) | `ECMWF/ERA5_LAND` | Monthly Potential Evapotranspiration and actual Evapotranspiration |
| `min_track_dist_km` | Kilometers (`km`) | `NOAA IBTrACS v04r01` | Minimum distance from `1 km` pixel centroid to cyclone eye track |
| `wind10_max_ms` | $\text{m/s}$ | `ERA5-Land Hourly` | Peak 10-meter wind speed during the 5-day cyclone passage window |
| `surge_over_elev_m` | Meters (`m`) | Derived (`IBTrACS` + `SRTM`) | Estimated coastal storm-surge height exceeding local SRTM elevation (`max(0, proxy_surge_m - elevation)`) |

---

## 4. Local Agronomic & Soil Profile Variables (`frontend/src/services/`)

| Field Name | Units | Source / Method | Description |
| :--- | :--- | :--- | :--- |
| `ec` (`ECe`) | `dS/m` | SRDI Survey / Soil Card OCR | Electrical conductivity of saturated soil paste extract (primary root-zone salinity metric) |
| `ph` | pH (`0–14`) | SRDI Survey / Soil Card OCR | Soil reaction / acidity-alkalinity |
| `nitrogen`, `phosphorus`, `potassium` | `mg/kg` (`ppm`) | Soil Card OCR / Manual Entry | Plant-available macronutrients extracted from lab reports (accepted only with explicit `mg/kg` or `ppm` units) |
| `drainage` | Categorical | Farmer Input / Upazila Preset | Field drainage class (`good`, `moderate`, `poor`, `waterlogged`) |
| `season` | Categorical | Khulna Crop Calendar | Bangladeshi cropping season: `rabi` (Nov–Mar), `kharif1` (Apr–Jun), or `kharif2` (Jul–Oct) |
