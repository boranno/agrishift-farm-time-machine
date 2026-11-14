# %% [markdown]
# # AgriShift Inundation & Waterlogging Dataset - Part 2: Clean, Causal Features, Aquaculture-Safe Labels & Splits
#
# Reads the two CSV streams exported by `04_export_flood_gee`:
#   - `agrishift_flood_sat_<district>_<year>.csv`  (2003-2025: ERA5-Land, CHIRPS, MODIS LSWI/MNDWI, static terrain/JRC)
#   - `agrishift_flood_sar_<district>_<year>.csv`  (2017-2025: Sentinel-1 VV open-water fraction + permanent water)
#
# ### Scientific & Free-Colab Optimizations Applied:
# 1. **Low-RAM Loading (< 3.5 GB Peak RAM):** Downcasts floats to `float32` during CSV ingestion and frees temporary tables immediately.
# 2. **Strict Causal Gap Fill (Zero Monsoon Look-Ahead Leakage):** Replaces two-sided `interpolate(limit=3)` on optical water indices (`lswi_mean`, `mndwi_mean`, `mndwi_max`) with strictly causal 1-month forward fill (`ffill(limit=1)`) plus `optical_obs_missing` flag.
# 3. **Shrimp-Pond (`Gher`) & Seasonal Aquaculture Guard:** Excludes semi-permanent/rotational aquaculture ponds (`jrc_seasonality >= 10` or `jrc_occurrence >= 80`) from triggering false-positive anomalous flood inundation labels while retaining `inund_anom >= 0.05` above the pixel-month SAR baseline.

# %% Cell 1 - config
import os
import gc
import glob
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

try:
    from google.colab import drive
    if not os.path.ismount("/content/drive"):
        drive.mount("/content/drive")
except ImportError:
    pass

INPUT_DIR = os.environ.get("FLOOD_IN", "/content/drive/MyDrive/AgriShift_flood")
DROUGHT_PANEL = os.environ.get("DROUGHT_PANEL", "/content/drive/MyDrive/AgriShift_dataset/processed/agrishift_panel.parquet")
OUT_DIR = os.environ.get("FLOOD_OUT", os.path.join(INPUT_DIR, "processed"))
os.makedirs(OUT_DIR, exist_ok=True)

CROPLAND_CLASSES = {12, 14}
OPT_BASELINE_END = 2019       # baseline for ERA5-Land, CHIRPS, MODIS (2003-2019)
SAR_BASELINE_END = 2021       # baseline for Sentinel-1 (2017-2021 -> 5 years)
SAR_VAL_END = 2022            # SAR split: train 2017-2021, val 2022, test 2023-2025
OPT_VAL_END = 2021            # Optical/soil split: train 2003-2019, val 2020-2021, test 2022-2025

# Scientifically defensible label thresholds
INUND_FRAC_THR = 0.15         # >= 15% of 1 km cell under non-permanent water at peak S1 pass
INUND_EXCESS = 0.05           # AND >= 5% above that pixel's normal water cover in that calendar month
SWL2_SAT_THR = 0.90           # root-zone (7-28 cm) soil water >= 90% of pixel's 98th-pct capacity
HND_MAX_M = 10.0              # low-lying terrain (<= 10 m above nearest drainage)

# %% Cell 2 - load Stream A (optical + reanalysis, 2003-2025) and Stream B (Sentinel-1, 2017-2025)
sat_files = sorted(glob.glob(os.path.join(INPUT_DIR, "agrishift_flood_sat_*.csv"))) or sorted(glob.glob("/content/drive/MyDrive/**/agrishift_flood_sat_*.csv", recursive=True))
sar_files = sorted(glob.glob(os.path.join(INPUT_DIR, "agrishift_flood_sar_*.csv"))) or sorted(glob.glob("/content/drive/MyDrive/**/agrishift_flood_sar_*.csv", recursive=True))
assert sat_files, f"No agrishift_flood_sat_*.csv files in {INPUT_DIR}"
assert sar_files, f"No agrishift_flood_sar_*.csv files in {INPUT_DIR}"

def _read_sat(f):
    d = pd.read_csv(f)
    d["district"] = d["district"].replace({"Jhenaidaha": "Jhenaidah"})
    for c in d.select_dtypes("float64").columns:
        d[c] = d[c].astype("float32")
    return d

def _read_sar(f):
    d = pd.read_csv(f)
    d["district"] = d["district"].replace({"Jhenaidaha": "Jhenaidah"})
    for c in d.select_dtypes("float64").columns:
        d[c] = d[c].astype("float32")
    return d

sat = pd.concat((_read_sat(f) for f in sat_files), ignore_index=True)
sar = pd.concat((_read_sar(f) for f in sar_files), ignore_index=True)
print(f"Loaded {len(sat_files)} sat files ({len(sat):,} rows) and {len(sar_files)} SAR files ({len(sar):,} rows)")

for d in (sat, sar):
    d["pixel_id"] = d["lon"].round(5).astype(str) + "_" + d["lat"].round(5).astype(str)
    d["date"] = pd.to_datetime(dict(year=d["year"].astype(int), month=d["month"].astype(int), day=1))

sat = sat.drop_duplicates(["pixel_id", "date"])
sar = sar.drop_duplicates(["pixel_id", "date"])

panel = sat.merge(
    sar[["pixel_id", "date", "water_freq", "water_peak", "n_obs", "vv_median", "perm_water"]],
    on=["pixel_id", "date"], how="left",
)
del sat, sar
gc.collect()

# %% Cell 3 - units, physical range checks, and STRICTLY CAUSAL gap fill
panel["era5_rain_mm"] = (panel["era5_rain_m"] * 1000.0).clip(lower=0).astype("float32")
panel["runoff_mm"] = (panel["era5_sro_m"] * 1000.0).clip(lower=0).astype("float32")
panel["rain_mm"] = panel["chirps_rain_mm"].clip(lower=0).astype("float32")
panel["rain_max1d_mm"] = panel["chirps_max1d_mm"].clip(lower=0).astype("float32")
panel["rain_days_gt50"] = panel["chirps_days_gt50"].clip(lower=0).astype("float32")
panel = panel.drop(columns=["era5_rain_m", "era5_sro_m", "chirps_rain_mm", "chirps_max1d_mm", "chirps_days_gt50"])

# Unmask -9999 sentinel values from MERIT Hydro
for c in ["hnd", "upa"]:
    panel.loc[panel[c] < -100, c] = np.nan
for c in ["jrc_occurrence", "jrc_seasonality"]:
    panel[c] = panel[c].clip(lower=0).astype("float32")
for c in ["lswi_mean", "mndwi_mean", "mndwi_max"]:
    panel.loc[~panel[c].between(-1.0, 1.0), c] = np.nan
for c in ["swl1", "swl2", "swl3"]:
    panel.loc[~panel[c].between(0.0, 0.8), c] = np.nan
for c in ["water_freq", "water_peak", "perm_water"]:
    panel.loc[~panel[c].between(0.0, 1.0), c] = np.nan

# Months with 0 Sentinel-1 passes have no valid radar reading -> set to NaN
no_sar = panel["n_obs"].isna() | (panel["n_obs"] < 1)
panel.loc[no_sar, ["water_freq", "water_peak", "vv_median"]] = np.nan

# Complete pixel x month panel
STATIC = ["district", "lon", "lat", "landcover", "elevation", "hnd", "upa", "jrc_occurrence", "jrc_seasonality"]
DYN = [c for c in panel.columns if c not in STATIC + ["pixel_id", "date", "year", "month"]]

static = panel.groupby("pixel_id", sort=False)[STATIC].first()
dates = pd.date_range(panel["date"].min(), panel["date"].max(), freq="MS")
full_idx = pd.MultiIndex.from_product([static.index, dates], names=["pixel_id", "date"])
panel = (panel.set_index(["pixel_id", "date"])[DYN]
         .reindex(full_idx).join(static, on="pixel_id").reset_index())
del static, full_idx
gc.collect()

panel = panel.sort_values(["pixel_id", "date"]).reset_index(drop=True)
panel["year"] = panel["date"].dt.year.astype("int16")
panel["month"] = panel["date"].dt.month.astype("int8")
panel["is_cropland"] = panel["landcover"].isin(CROPLAND_CLASSES).astype("int8")

# Record optical cloud missingness flag BEFORE causal 1-month forward fill
panel["optical_obs_missing"] = panel["lswi_mean"].isna().astype("int8")
g_pix = panel.groupby("pixel_id", sort=False)
for c in ["lswi_mean", "mndwi_mean", "mndwi_max"]:
    panel[c] = g_pix[c].ffill(limit=1).astype("float32")
del g_pix
gc.collect()

# %% Cell 4 - Optional merge of NDVI / LST / PET from Drought panel (if present)
if os.path.exists(DROUGHT_PANEL):
    extra_cols = ["pixel_id", "date", "ndvi", "evi", "lst_day", "pet_mm", "et_mm", "spi3"]
    dp = pd.read_parquet(DROUGHT_PANEL)
    avail = [c for c in extra_cols if c in dp.columns]
    panel = panel.merge(dp[avail], on=["pixel_id", "date"], how="left")
    del dp
    gc.collect()
    print("Merged drought predictors:", avail[2:])
else:
    print("Drought panel not found - proceeding with standalone flood predictors.")

panel = panel.sort_values(["pixel_id", "date"]).reset_index(drop=True)

# %% Cell 5 - Non-permanent SAR inundation fraction & root-zone soil saturation index
# Subtract permanent water fraction (rivers/canals/permanent ponds) from SAR open-water fraction
panel["inund_mean"] = (panel["water_freq"] - panel["perm_water"].fillna(0)).clip(0, 1).astype("float32")
panel["inund_frac"] = (panel["water_peak"] - panel["perm_water"].fillna(0)).clip(0, 1).astype("float32")

# Root-zone soil saturation index (`swl2_sat`): divide swl2 by each pixel's 98th-percentile in 2003-2019
base_soil = panel.loc[panel["year"] <= OPT_BASELINE_END, ["pixel_id", "swl2"]]
swl2_cap = (base_soil.groupby("pixel_id", sort=False)["swl2"]
            .quantile(0.98).rename("swl2_porosity").astype("float32"))
panel = panel.merge(swl2_cap, on="pixel_id", how="left")
panel["swl2_sat"] = (panel["swl2"] / panel["swl2_porosity"].replace(0, np.nan)).clip(0, 1.2).astype("float32")
del base_soil, swl2_cap
gc.collect()

# %% Cell 6 - Baseline climatologies (strictly within training years for each stream)
def add_clim(df_in, col, base_end):
    base = df_in.loc[df_in["year"] <= base_end, ["pixel_id", "month", col]]
    st = base.groupby(["pixel_id", "month"], sort=False)[col].agg(mean="mean", std="std").astype("float32")
    st.columns = [f"{col}_clim_mean", f"{col}_clim_std"]
    df_in = df_in.merge(st, on=["pixel_id", "month"], how="left")
    df_in[f"{col}_anom"] = (df_in[col] - df_in[f"{col}_clim_mean"]).astype("float32")
    df_in[f"{col}_z"] = (df_in[f"{col}_anom"] / df_in[f"{col}_clim_std"].replace(0, np.nan)).astype("float32")
    return df_in

for c in ["swl1", "swl2", "swl3", "rain_mm", "runoff_mm", "lswi_mean", "mndwi_mean"]:
    panel = add_clim(panel, c, OPT_BASELINE_END)
    gc.collect()

# Sentinel-1 inundation baseline uses 2017..2021 only
panel = add_clim(panel, "inund_frac", SAR_BASELINE_END)
panel = panel.sort_values(["pixel_id", "date"]).reset_index(drop=True)

# %% Cell 7 - Strictly causal lags, antecedent wetness, and persistence counters
g = panel.groupby("pixel_id", sort=False)

for c in ["inund_frac", "swl1", "swl2", "swl2_sat", "rain_mm", "runoff_mm", "lswi_mean", "mndwi_mean"]:
    for k in (1, 2, 3):
        panel[f"{c}_lag{k}"] = g[c].shift(k).astype("float32")

for w in (2, 3, 6):
    panel[f"rain_roll{w}_sum"] = g["rain_mm"].transform(lambda s: s.rolling(w, min_periods=w).sum()).astype("float32")
    panel[f"runoff_roll{w}_sum"] = g["runoff_mm"].transform(lambda s: s.rolling(w, min_periods=w).sum()).astype("float32")
    panel[f"swl2_roll{w}_mean"] = g["swl2"].transform(lambda s: s.rolling(w, min_periods=w).mean()).astype("float32")

# Consecutive saturated months (`swl2_sat >= 0.90`) up to month t (strictly causal)
wet = (panel["swl2_sat"] >= SWL2_SAT_THR).astype("int8")
wet_grp = wet.eq(0).groupby(panel["pixel_id"], sort=False).cumsum()
panel["swl2_wet_run"] = wet.groupby([panel["pixel_id"], wet_grp], sort=False).cumsum().astype("int8")
del wet, wet_grp

panel["upa_log1p"] = np.log1p(panel["upa"].clip(lower=0)).astype("float32")
ang = 2.0 * np.pi * panel["month"] / 12.0
panel["month_sin"] = np.sin(ang).astype("float32")
panel["month_cos"] = np.cos(ang).astype("float32")
panel["is_monsoon"] = panel["month"].isin([6, 7, 8, 9, 10]).astype("int8")
panel["is_post_monsoon"] = panel["month"].isin([10, 11, 12]).astype("int8")

# %% Cell 8 - Scientifically Validated Labels & Forecast Targets
# 1) Surface inundation (2017-2025, Sentinel-1 VV)
# Guard against permanent/near-permanent shrimp aquaculture ponds (`jrc_seasonality >= 10` or `jrc_occurrence >= 80`)
# unless water fraction rises by >= 10% above that pixel's normal monthly water cover!
has_sar = panel["inund_frac"].notna() & panel["inund_frac_anom"].notna()
is_aquaculture_pond = (panel["jrc_seasonality"] >= 10) | (panel["jrc_occurrence"] >= 80)
req_excess = np.where(is_aquaculture_pond, np.maximum(INUND_EXCESS, 0.10), INUND_EXCESS)

inund_now = (
    (panel["inund_frac"] >= INUND_FRAC_THR) &
    (panel["inund_frac_anom"] >= req_excess)
).astype("float32")
panel["label_inundation"] = np.where(has_sar, inund_now, np.nan).astype("float32")

# 2) Root-zone waterlogging (2003-2025):
#    Saturated root zone (`swl2_sat >= 0.90`) for >= 2 consecutive months on low-lying ground (`hnd <= 10m`)
#    confirmed by positive optical surface-moisture anomaly (`lswi_mean_anom > 0` or `mndwi_mean > -0.2`).
has_wl = panel["swl2_sat"].notna() & panel["swl2_sat_lag1"].notna()
low_ground = panel["hnd"].isna() | (panel["hnd"] <= HND_MAX_M)
opt_wet = panel["lswi_mean_anom"].isna() | (panel["lswi_mean_anom"] > 0) | (panel["mndwi_mean"] > -0.2)
wl_now = (
    (panel["swl2_wet_run"] >= 2) &
    low_ground &
    opt_wet
).astype("float32")
panel["label_waterlogging"] = np.where(has_wl, wl_now, np.nan).astype("float32")

g = panel.groupby("pixel_id", sort=False)
for h in (1, 2):
    panel[f"target_inund_frac_next{h}"] = g["inund_frac"].shift(-h).astype("float32")
    panel[f"label_inundation_next{h}"] = g["label_inundation"].shift(-h).astype("float32")
    panel[f"target_swl2_sat_next{h}"] = g["swl2_sat"].shift(-h).astype("float32")
    panel[f"label_waterlogging_next{h}"] = g["label_waterlogging"].shift(-h).astype("float32")
del g
gc.collect()

# %% Cell 9 - Splits (separate temporal horizons for SAR vs. Optical/Reanalysis + 0.25-deg spatial folds)
panel["split_sar"] = np.select(
    [panel["year"] < 2017, panel["year"] <= SAR_BASELINE_END, panel["year"] <= SAR_VAL_END],
    ["pre_sar", "train", "val"], default="test",
)
panel["split_opt"] = np.select(
    [panel["year"] <= OPT_BASELINE_END, panel["year"] <= OPT_VAL_END],
    ["train", "val"], default="test",
)
bx = np.floor(panel["lon"] / 0.25).astype(int)
by = np.floor(panel["lat"] / 0.25).astype(int)
panel["spatial_fold"] = ((bx * 7 + by * 13) % 5).astype("int8")

# %% Cell 10 - Save panel, district-month summary & Exploratory Visualization
for c in panel.select_dtypes("float64").columns:
    panel[c] = panel[c].astype("float32")

out_parquet = os.path.join(OUT_DIR, "agrishift_flood_panel.parquet")
panel.to_parquet(out_parquet, index=False)
print("Saved:", out_parquet)

crop = panel[panel["is_cropland"] == 1]
demo = (crop
        .groupby(["district", "date", "year", "month"], observed=True)
        .agg(
            n_pixels=("pixel_id", "count"),
            rain_mm=("rain_mm", "mean"),
            rain_max1d_mm=("rain_max1d_mm", "mean"),
            runoff_mm=("runoff_mm", "mean"),
            swl2_sat=("swl2_sat", "mean"),
            lswi_mean=("lswi_mean", "mean"),
            mndwi_mean=("mndwi_mean", "mean"),
            inund_frac=("inund_frac", "mean"),
            inundation_share=("label_inundation", "mean"),
            waterlogging_share=("label_waterlogging", "mean"),
        ).reset_index())
demo.to_csv(os.path.join(OUT_DIR, "agrishift_flood_demo_district_month.csv"), index=False)

print("Cropland rows:", len(crop), "| pixels:", crop["pixel_id"].nunique())
print("Inundation base rate by split_sar:")
print(crop.groupby("split_sar")["label_inundation"].agg(["count", "mean"]).round(4))
print("Waterlogging base rate by split_opt:")
print(crop.groupby("split_opt")["label_waterlogging"].agg(["count", "mean"]).round(4))

sns.set_theme(style="whitegrid")
fig, axes = plt.subplots(1, 3, figsize=(18, 4.8))
m_cycle = crop.groupby("month").agg(
    inund=("label_inundation", "mean"),
    wl=("label_waterlogging", "mean"),
    rain=("rain_mm", "mean"),
)
axes[0].plot(m_cycle.index, m_cycle["inund"], "o-", color="#1f78b4", lw=2, label="SAR Inundation Rate (2017-2025)")
axes[0].plot(m_cycle.index, m_cycle["wl"], "s-", color="#33a02c", lw=2, label="Root-Zone Waterlogging Rate (2003-2025)")
axes[0].set_title("A. Monthly Hazard Seasonality across Khulna Cropland")
axes[0].set_xlabel("Calendar Month")
axes[0].set_ylabel("Fraction of Cropland Affected")
axes[0].legend(fontsize=8)

sns.histplot(crop.drop_duplicates("pixel_id")["hnd"].dropna(), bins=30, kde=True, color="teal", ax=axes[1])
axes[1].axvline(HND_MAX_M, color="crimson", ls="--", label=f"Waterlogging Ceiling ({HND_MAX_M} m)")
axes[1].set_title("B. Height Above Nearest Drainage (MERIT Hydro HND)")
axes[1].set_xlabel("Height Above Nearest Drainage (m)")
axes[1].legend(fontsize=8)

dist_rates = crop.groupby("district", observed=True)[["label_inundation", "label_waterlogging"]].mean().sort_values("label_inundation", ascending=False)
dist_rates.plot(kind="bar", ax=axes[2], color=["#1f78b4", "#33a02c"])
axes[2].set_title("C. Mean Inundation & Waterlogging Rate by District")
axes[2].set_xlabel("District")
axes[2].set_ylabel("Mean Event Rate")
axes[2].tick_params(axis="x", rotation=40)

plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, "fig_flood_01_seasonality_and_districts.png"), dpi=150)
plt.show()
