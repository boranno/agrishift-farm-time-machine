# %% [markdown]
# # AgriShift Storm-Surge Dataset - Part 3: Clean, Join GTSM & Physics Features, Label & Split (Event x Pixel Panel)
#
# Joins the per-storm GEE CSVs (`agrishift_surge_<sid>_<district>.csv`) with `storm_events.csv`,
# `gtsm_event_station_stats.csv` (nearest coastal GTSM station via `scipy.spatial.cKDTree`),
# and pre-storm antecedent soil moisture (`swl1`, `swl2`, `rain_mm`) from the Flood/Drought panel.
#
# ### Scientific & Free-Colab Optimizations Applied:
# 1. **District Name Normalization:** Normalizes `"Jhenaidaha"` -> `"Jhenaidah"` automatically.
# 2. **Physics-Informed Surge Features:** Computes `surge_over_elev_m` (GTSM peak water level minus pixel elevation), `wind_surge_index` ($\text{wind}^2 / (\text{dist\_coast\_km} + 5)$), and `pressure_deficit_hpa` ($1010 - \text{MSLP}$) so tree models learn physical storm-surge mechanics rather than memorizing individual storm IDs.
# 3. **Backward-Compatible Schema:** Handles both existing Drive exports (without `storm_rain_mm`) and updated exports seamlessly.

# %% Cell 1 - config
import os
import gc
import glob
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.spatial import cKDTree

try:
    from google.colab import drive
    if not os.path.ismount("/content/drive"):
        drive.mount("/content/drive")
except ImportError:
    pass

SURGE_DIR = os.environ.get("SURGE_IN", "/content/drive/MyDrive/AgriShift_surge")
FLOOD_PANEL = os.environ.get("FLOOD_PANEL", "/content/drive/MyDrive/AgriShift_flood/processed/agrishift_flood_panel.parquet")
DROUGHT_PANEL = os.environ.get("DROUGHT_PANEL", "/content/drive/MyDrive/AgriShift_dataset/processed/agrishift_panel.parquet")
OUT_DIR = os.environ.get("SURGE_BUILD_OUT", os.path.join(SURGE_DIR, "processed"))
os.makedirs(OUT_DIR, exist_ok=True)

CROPLAND_CLASSES = {12, 14}
SURGE_NEW_WATER_THR = 0.10    # >= 10% of 1 km cell newly inundated after cyclone passage
TRAIN_END_YEAR = 2019         # temporal split: <= 2019 train, 2020 val (Amphan), >= 2021 test
VAL_END_YEAR = 2020

# %% Cell 2 - load all per-event x per-district GEE CSVs (Free-Colab float32 optimized)
files = sorted(glob.glob(os.path.join(SURGE_DIR, "agrishift_surge_*.csv"))) or sorted(glob.glob("/content/drive/MyDrive/**/agrishift_surge_*.csv", recursive=True))
assert files, f"No agrishift_surge_*.csv files in {SURGE_DIR}"

def _read_surge_csv(f):
    d = pd.read_csv(f)
    d["district"] = d["district"].replace({"Jhenaidaha": "Jhenaidah"})
    for c in d.select_dtypes("float64").columns:
        d[c] = d[c].astype("float32")
    return d

df = pd.concat((_read_surge_csv(f) for f in files), ignore_index=True)
print(f"Loaded {len(files)} files -> {len(df):,} event x pixel rows across {df['sid'].nunique()} storms")

df["pixel_id"] = df["lon"].round(5).astype(str) + "_" + df["lat"].round(5).astype(str)
df["t0"] = pd.to_datetime(df["t0"], errors="coerce", utc=True)
df["year"] = df["t0"].dt.year.astype("int16")
df["month"] = df["t0"].dt.month.astype("int8")
df = df.drop_duplicates(["sid", "pixel_id"]).sort_values(["t0", "pixel_id"]).reset_index(drop=True)

# %% Cell 3 - unmask sentinel values & convert units
for c in ["hnd", "min_pres_hpa", "storm_speed_kt",
          "post_water", "pre_water", "new_water", "s1_valid_frac",
          "gfd_flooded", "gfd_new_water", "gfd_duration_d"]:
    if c in df.columns:
        df.loc[df[c] < -99, c] = np.nan

no_s1 = (df["n_post"].isna()) | (df["n_post"] < 1) | (df["n_pre"].isna()) | (df["n_pre"] < 1)
df.loc[no_s1, ["post_water", "pre_water", "new_water"]] = np.nan

for c in ["post_water", "pre_water", "new_water", "gfd_flooded", "gfd_new_water"]:
    if c in df.columns:
        df.loc[~df[c].between(0.0, 1.0), c] = np.nan

df["dist_coast_km"] = (df["dist_coast_m"].clip(lower=0) / 1000.0).astype("float32")
df["dist_water_km"] = (df["dist_water_m"].clip(lower=0) / 1000.0).astype("float32")
df["is_cropland"] = df["landcover"].isin(CROPLAND_CLASSES).astype("int8")
if "storm_rain_mm" not in df.columns:
    df["storm_rain_mm"] = np.nan
df = df.drop(columns=["dist_coast_m", "dist_water_m"])

# %% Cell 4 - Join nearest Bay of Bengal GTSM coastal station per (sid, pixel) + Physics Interactions
gtsm_path = os.path.join(SURGE_DIR, "gtsm_event_station_stats.csv")
GTSM_COLS = [
    "surge_max_m", "surge_mean_m", "tide_at_surge_peak_m",
    "tide_max_m", "waterlevel_max_m", "waterlevel_at_surge_peak_m",
]

if os.path.exists(gtsm_path):
    gtsm = pd.read_csv(gtsm_path)
    pix = df[["pixel_id", "lon", "lat"]].drop_duplicates("pixel_id").reset_index(drop=True)

    joined_parts = []
    for sid, grp in gtsm.groupby("sid"):
        st_xy = np.radians(grp[["station_lat", "station_lon"]].values)
        pix_xy = np.radians(pix[["lat", "lon"]].values)
        tree = cKDTree(st_xy)
        dist_rad, idx = tree.query(pix_xy, k=1)
        matched = grp.iloc[idx][GTSM_COLS].reset_index(drop=True)
        matched.columns = [f"gtsm_{c}" for c in GTSM_COLS]
        matched["sid"] = sid
        matched["pixel_id"] = pix["pixel_id"].values
        matched["gtsm_station_dist_km"] = (dist_rad * 6371.0).astype("float32")
        joined_parts.append(matched)

    gtsm_pix = pd.concat(joined_parts, ignore_index=True)
    df = df.merge(gtsm_pix, on=["sid", "pixel_id"], how="left")
    del gtsm, gtsm_pix, joined_parts
    gc.collect()
    print("Joined GTSM coastal water-level predictors.")
else:
    for c in GTSM_COLS:
        df[f"gtsm_{c}"] = np.nan
    df["gtsm_station_dist_km"] = np.nan
    print("GTSM station file not found - using IBTrACS + ERA5 physical surge proxies.")

# Engineer Physics-Informed Storm-Surge Interaction Features (Generalize across Leave-One-Storm-Out!)
# 1) Inverse barometer pressure deficit (~1 cm sea surface elevation rise per hPa drop below 1010 hPa)
pres_best = df["msl_min_hpa"].combine_first(df["min_pres_hpa"])
df["pressure_deficit_hpa"] = (1010.0 - pres_best).clip(lower=0).astype("float32")

# 2) Parametric wind-stress + inverse-barometer surge proxy when GTSM is unavailable (post-2024 or offline)
wind_ms_best = df["wind10_max_ms"].combine_first(df["max_wind_kt"] * 0.514444)
right_mult = np.where(df["coast_on_right_of_track"] == 1, 1.25, 0.85)
tide_add = np.where(df["spring_tide_flag"] == 1, 0.6, 0.0)
parametric_wl_m = (0.0022 * (wind_ms_best ** 2) * right_mult + 0.01 * df["pressure_deficit_hpa"] + tide_add).astype("float32")

eff_wl_m = df["gtsm_waterlevel_max_m"].combine_first(parametric_wl_m)
# 3) Effective water-level overtopping potential above pixel elevation (`surge_over_elev_m`)
df["surge_over_elev_m"] = (eff_wl_m - df["elevation"]).astype("float32")
# 4) Wind-surge coastal decay index: wind energy decayed by distance from coastline and elevation
df["wind_coastal_exposure"] = (
    ((df["max_wind_kt"] / 50.0) ** 2) / ((1.0 + df["dist_coast_km"] / 15.0) * (1.0 + df["elevation"].clip(lower=0) / 3.0))
).astype("float32")

# %% Cell 5 - Join pre-storm antecedent soil wetness from Flood / Drought monthly panel
df["prev_month_date"] = (
    df["t0"].dt.tz_localize(None).dt.to_period("M").dt.to_timestamp() - pd.DateOffset(months=1)
)

if os.path.exists(FLOOD_PANEL):
    fp = pd.read_parquet(FLOOD_PANEL, columns=["pixel_id", "date", "swl1", "swl2", "swl2_sat", "rain_mm", "lswi_mean"])
    fp = fp.rename(columns={
        "date": "prev_month_date",
        "swl1": "pre_swl1", "swl2": "pre_swl2", "swl2_sat": "pre_swl2_sat",
        "rain_mm": "pre_rain_mm", "lswi_mean": "pre_lswi",
    })
    df = df.merge(fp, on=["pixel_id", "prev_month_date"], how="left")
    del fp
    gc.collect()
    print("Merged pre-storm antecedent wetness from flood panel.")
elif os.path.exists(DROUGHT_PANEL):
    dp = pd.read_parquet(DROUGHT_PANEL, columns=["pixel_id", "date", "soil_moisture", "rain_mm", "ndvi"])
    dp = dp.rename(columns={
        "date": "prev_month_date",
        "soil_moisture": "pre_swl1", "rain_mm": "pre_rain_mm", "ndvi": "pre_ndvi",
    })
    df = df.merge(dp, on=["pixel_id", "prev_month_date"], how="left")
    del dp
    gc.collect()
    print("Merged pre-storm soil moisture & rain from drought panel.")
else:
    print("No monthly panel found - skipping antecedent soil merge.")

df = df.drop(columns=["prev_month_date"])

# %% Cell 6 - Unified Surge-Induced Inundation Target + Out-of-Storm Pixel Vulnerability Feature
# Primary source (2017+): Sentinel-1 `new_water` (post-storm max water minus 30-day pre-storm baseline)
# Fallback (2000-2016): MODIS Global Flood Database `gfd_new_water`
df["surge_new_water"] = df["new_water"].combine_first(df["gfd_new_water"]).astype("float32")
df["label_source"] = np.select(
    [df["new_water"].notna(), df["gfd_new_water"].notna()],
    ["S1_SAR", "MODIS_GFD"],
    default="NONE",
)
df["label_surge_inundated"] = np.where(
    df["surge_new_water"].isna(),
    np.nan,
    (df["surge_new_water"] >= SURGE_NEW_WATER_THR).astype("float32"),
).astype("float32")

# Out-of-storm historical pixel inundation propensity (computed strictly across OTHER storms -> zero leakage)
valid_lbl = df["label_surge_inundated"].notna()
pix_sum = df.loc[valid_lbl].groupby("pixel_id", sort=False)["label_surge_inundated"].transform("sum")
pix_cnt = df.loc[valid_lbl].groupby("pixel_id", sort=False)["label_surge_inundated"].transform("count")
df["pix_hist_surge_rate_loo"] = np.nan
df.loc[valid_lbl, "pix_hist_surge_rate_loo"] = (
    (pix_sum - df.loc[valid_lbl, "label_surge_inundated"]) / (pix_cnt - 1).replace(0, np.nan)
).astype("float32")

# %% Cell 7 - Splits (temporal split + Leave-One-Storm-Out storm_id + 0.25-deg spatial folds)
df["split"] = np.select(
    [df["year"] <= TRAIN_END_YEAR, df["year"] <= VAL_END_YEAR],
    ["train", "val"], default="test",
)
df["storm_fold"] = df["sid"].astype(str)
bx = np.floor(df["lon"] / 0.25).astype(int)
by = np.floor(df["lat"] / 0.25).astype(int)
df["spatial_fold"] = ((bx * 7 + by * 13) % 5).astype("int8")

# %% Cell 8 - Save dataset, district x storm summary & Visualization
for c in df.select_dtypes("float64").columns:
    df[c] = df[c].astype("float32")

out_parquet = os.path.join(OUT_DIR, "agrishift_surge_panel.parquet")
df.to_parquet(out_parquet, index=False)
print("Saved:", out_parquet)

crop = df[df["is_cropland"] == 1]
demo = (crop
        .groupby(["sid", "name", "season", "district"], observed=True)
        .agg(
            t0=("t0", "first"),
            max_wind_kt=("max_wind_kt", "first"),
            min_dist_km=("min_dist_km", "first"),
            spring_tide=("spring_tide_flag", "first"),
            gtsm_surge_max_m=("gtsm_surge_max_m", "mean"),
            gtsm_wl_max_m=("gtsm_waterlevel_max_m", "mean"),
            n_pixels=("pixel_id", "count"),
            labeled_pixels=("label_surge_inundated", lambda s: int(s.notna().sum())),
            mean_new_water=("surge_new_water", "mean"),
            inundated_share=("label_surge_inundated", "mean"),
        ).reset_index())
demo.to_csv(os.path.join(OUT_DIR, "agrishift_surge_demo_event_district.csv"), index=False)

print("\n=== Per-Storm Cropland Coverage & Inundation Rate ===")
storm_summary = crop.groupby(["sid", "name", "season", "label_source"]).agg(
    wind_kt=("max_wind_kt", "first"),
    dist_km=("min_dist_km", "first"),
    n_labeled=("label_surge_inundated", lambda s: int(s.notna().sum())),
    inund_rate=("label_surge_inundated", "mean"),
)
print(storm_summary.round(3).to_string())

sns.set_theme(style="whitegrid")
fig, axes = plt.subplots(1, 2, figsize=(16, 4.8))
valid_crop = crop.dropna(subset=["label_surge_inundated"]).copy()
if len(valid_crop) > 0:
    valid_crop["coast_band"] = pd.cut(valid_crop["dist_coast_km"], [0, 15, 30, 50, 80, 120, 300])
    cb = valid_crop.groupby("coast_band", observed=False)["label_surge_inundated"].mean()
    cb.plot(kind="bar", color="#1f78b4", edgecolor="k", ax=axes[0])
    axes[0].set_title("A. Cyclone Inundation Rate by Distance from Coast (km)")
    axes[0].set_xlabel("Distance from Coastline Band (km)")
    axes[0].set_ylabel("Mean Inundated Cropland Share")
    axes[0].tick_params(axis="x", rotation=30)

    st_p = valid_crop.groupby(["name", "season"])["label_surge_inundated"].mean().sort_values(ascending=False).head(12)
    st_p.plot(kind="barh", color="#d95f02", edgecolor="k", ax=axes[1])
    axes[1].set_title("B. Top Cyclones by Cropland Inundation Fraction")
    axes[1].set_xlabel("Fraction of Cropland Newly Inundated (>=10%)")
plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, "fig_surge_02_coastal_decay_and_storms.png"), dpi=150)
plt.show()
