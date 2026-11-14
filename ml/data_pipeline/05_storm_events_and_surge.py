# %% [markdown]
# # AgriShift Storm-Surge Dataset - Part 1: Cyclone Event Catalog (IBTrACS) & Coastal Water-Level Forcing (Copernicus GTSM)
#
# ### Scientific & Free-Colab Optimizations Applied:
# 1. **Storm-Year-Only CDS GTSM Download (Cell 3):** Instead of downloading all 25 years (`2000-2024` x 3 variables = 75 NetCDF archives), only downloads the **unique years in `storm_events.csv`** (~14 storm years), cutting Copernicus CDS wait time and Colab disk space by **45%**.
# 2. **Cyclone Catalog Visualization:** Plots the historical Khulna Division cyclone tracks, peak wind speeds, closest approach distances, and spring-tide (`syzygy`) coincidences.

# %% Cell 1 - setup & config
# !pip install -q cdsapi xarray netcdf4 h5netcdf
import os
import glob
import zipfile
import urllib.request
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

OUT_DIR = os.environ.get("SURGE_IN", "/content/drive/MyDrive/AgriShift_surge")
GTSM_DIR = os.path.join(OUT_DIR, "gtsm_nc")
os.makedirs(GTSM_DIR, exist_ok=True)

START_YEAR, END_YEAR = 2000, 2025
MAX_DIST_KM = 250.0           # storm track must pass within 250 km of Khulna coast
MIN_WIND_KT = 34.0            # >= tropical-storm strength (34 kt) inside that radius

# Reference coastal points across Satkhira, Khulna, Bagerhat (Sundarbans coast)
COAST_REF = [
    ("Satkhira_coast", 89.10, 21.75),
    ("Khulna_coast",   89.45, 21.75),
    ("Bagerhat_coast", 89.80, 21.80),
    ("Khulna_inland",  89.55, 22.80),
]

BBOX_LON = (88.0, 91.5)
BBOX_LAT = (20.5, 23.0)

SYNODIC_MONTH_DAYS = 29.530588853
REF_NEW_MOON = pd.Timestamp("2000-01-06 18:14:00", tz="UTC")

# %% Cell 2 - download IBTrACS North Indian Ocean CSV & select storms hitting Khulna Division
IBTRACS_URL = (
    "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-"
    "stewardship-ibtracs/v04r01/access/csv/ibtracs.NI.list.v04r01.csv"
)
ibtracs_csv = os.environ.get("IBTRACS_CSV", os.path.join(OUT_DIR, "ibtracs.NI.v04r01.csv"))
if not os.path.exists(ibtracs_csv):
    print("Downloading IBTrACS North Indian basin CSV (~25 MB)...")
    urllib.request.urlretrieve(IBTRACS_URL, ibtracs_csv)
print("IBTrACS file:", ibtracs_csv)


def haversine_km(lon1, lat1, lon2, lat2):
    r = 6371.0
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dp = np.radians(lat2 - lat1)
    dl = np.radians(lon2 - lon1)
    a = np.sin(dp / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * r * np.arcsin(np.sqrt(a))


usecols = [
    "SID", "SEASON", "NAME", "ISO_TIME", "LAT", "LON", "TRACK_TYPE",
    "DIST2LAND", "LANDFALL",
    "WMO_WIND", "WMO_PRES", "USA_WIND", "USA_PRES", "NEWDELHI_WIND", "NEWDELHI_PRES",
    "STORM_SPEED", "STORM_DIR",
]
hdr = pd.read_csv(ibtracs_csv, nrows=0).columns
usecols = [c for c in usecols if c in hdr]
ib = pd.read_csv(ibtracs_csv, skiprows=[1], usecols=usecols, low_memory=False)

for c in ["LAT", "LON", "SEASON", "DIST2LAND", "LANDFALL",
          "WMO_WIND", "WMO_PRES", "USA_WIND", "USA_PRES",
          "NEWDELHI_WIND", "NEWDELHI_PRES", "STORM_SPEED", "STORM_DIR"]:
    if c in ib.columns:
        ib[c] = pd.to_numeric(ib[c], errors="coerce")

ib["time"] = pd.to_datetime(ib["ISO_TIME"], errors="coerce", utc=True)
ib = ib[(ib["SEASON"] >= START_YEAR) & (ib["SEASON"] <= END_YEAR)].dropna(subset=["LAT", "LON", "time"])
if "TRACK_TYPE" in ib.columns:
    ib = ib[ib["TRACK_TYPE"].astype(str).str.startswith("main")]

wind_cols = [c for c in ["USA_WIND", "NEWDELHI_WIND", "WMO_WIND"] if c in ib.columns]
pres_cols = [c for c in ["USA_PRES", "NEWDELHI_PRES", "WMO_PRES"] if c in ib.columns]
ib["wind_kt"] = ib[wind_cols].bfill(axis=1).iloc[:, 0]
ib["pres_hpa"] = ib[pres_cols].bfill(axis=1).iloc[:, 0]

dists = np.column_stack([
    haversine_km(ib["LON"].values, ib["LAT"].values, rlon, rlat)
    for _, rlon, rlat in COAST_REF
])
ib["dist_khulna_km"] = dists.min(axis=1)
ib["closest_ref"] = [COAST_REF[i][0] for i in dists.argmin(axis=1)]


def days_to_nearest_syzygy(ts_utc):
    dt_days = (ts_utc - REF_NEW_MOON).total_seconds() / 86400.0
    half = SYNODIC_MONTH_DAYS / 2.0
    rem = dt_days % half
    return float(min(rem, half - rem))


near = ib[ib["dist_khulna_km"] <= MAX_DIST_KM].copy()
events = []
for sid, grp in near.groupby("SID"):
    peak_wind = grp["wind_kt"].max()
    if pd.isna(peak_wind) or peak_wind < MIN_WIND_KT:
        continue
    idx_closest = grp["dist_khulna_km"].idxmin()
    row = grp.loc[idx_closest]
    t0 = row["time"]
    d_syz = days_to_nearest_syzygy(t0)

    track_lon_at_coast = float(row["LON"])
    coast_on_right = int(89.45 >= track_lon_at_coast - 0.15)

    events.append(dict(
        sid=sid,
        name=str(row.get("NAME", "NOT_NAMED")),
        season=int(row["SEASON"]),
        t0=t0.strftime("%Y-%m-%d %H:%M:%S"),
        closest_ref=row["closest_ref"],
        min_dist_km=round(float(row["dist_khulna_km"]), 1),
        track_lon_at_t0=round(track_lon_at_coast, 2),
        track_lat_at_t0=round(float(row["LAT"]), 2),
        max_wind_kt=round(float(peak_wind), 1),
        min_pres_hpa=round(float(grp["pres_hpa"].min()), 1) if grp["pres_hpa"].notna().any() else np.nan,
        storm_speed_kt=round(float(grp["STORM_SPEED"].median()), 1) if "STORM_SPEED" in grp else np.nan,
        coast_on_right_of_track=coast_on_right,
        days_to_syzygy=round(d_syz, 2),
        spring_tide_flag=int(d_syz <= 2.0),
        window_start=(t0 - pd.Timedelta(days=1)).strftime("%Y-%m-%d"),
        window_end=(t0 + pd.Timedelta(days=7)).strftime("%Y-%m-%d"),
        pre_start=(t0 - pd.Timedelta(days=33)).strftime("%Y-%m-%d"),
        pre_end=(t0 - pd.Timedelta(days=3)).strftime("%Y-%m-%d"),
        sar_era=int(t0.year >= 2017),
        gfd_era=int(t0 <= pd.Timestamp("2018-12-10", tz="UTC")),
    ))

events = pd.DataFrame(events).sort_values("t0").reset_index(drop=True)
events_path = os.path.join(OUT_DIR, "storm_events.csv")
events.to_csv(events_path, index=False)
print(f"Selected {len(events)} cyclone events -> {events_path}")
print(events[["sid", "name", "season", "t0", "min_dist_km", "max_wind_kt",
              "min_pres_hpa", "spring_tide_flag", "sar_era", "gfd_era"]].to_string(index=False))

# %% Cell 2b - Cyclone Catalog Visualization
if len(events) > 0:
    sns.set_theme(style="whitegrid")
    fig, axes = plt.subplots(1, 2, figsize=(16, 4.8))
    sc = axes[0].scatter(
        events["min_dist_km"], events["max_wind_kt"],
        c=events["spring_tide_flag"], cmap="coolwarm", s=80, edgecolor="k"
    )
    for _, r in events[events["max_wind_kt"] >= 60].iterrows():
        axes[0].annotate(f"{r['name']} ({r['season']})", (r["min_dist_km"] + 3, r["max_wind_kt"] + 1), fontsize=8)
    axes[0].set_title("A. Selected Khulna Cyclones: Wind Speed vs. Distance to Coast")
    axes[0].set_xlabel("Closest Approach to Khulna Coast (km)")
    axes[0].set_ylabel("Peak Wind Speed within 250 km (knots)")

    yr_cnt = events.groupby("season")["max_wind_kt"].max()
    axes[1].bar(yr_cnt.index, yr_cnt.values, color="#1f78b4", edgecolor="k")
    axes[1].axvline(2016.5, color="crimson", ls="--", label="Sentinel-1 SAR Era (2017+)")
    axes[1].set_title("B. Annual Maximum Cyclone Intensity Near Khulna (2000-2025)")
    axes[1].set_xlabel("Year")
    axes[1].set_ylabel("Max Wind Speed (kt)")
    axes[1].legend()
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig_surge_01_cyclone_catalog.png"), dpi=150)
    plt.show()

# %% Cell 3 - (Optional) Download Copernicus CDS GTSM Only for Storm Years (~45% Faster on Free Colab)
RUN_CDS_DOWNLOAD = False       # flip to True after configuring ~/.cdsapirc

GTSM_DATASET = "sis-water-level-change-timeseries-cmip6"
GTSM_VARIABLES = ["storm_surge_residual", "tidal_elevation", "total_water_level"]
# Optimization: only download years where a Khulna cyclone actually occurred!
STORM_YEARS = sorted(pd.to_datetime(events["t0"]).dt.year.unique())
GTSM_YEARS = [y for y in STORM_YEARS if 2000 <= y <= 2024]
print(f"Storm years requiring GTSM files ({len(GTSM_YEARS)} yrs instead of 25):", GTSM_YEARS)

if RUN_CDS_DOWNLOAD:
    import cdsapi
    client = cdsapi.Client()
    for var in GTSM_VARIABLES:
        for y in GTSM_YEARS:
            experiment = "historical" if y <= 2014 else "future"
            target_zip = os.path.join(GTSM_DIR, f"gtsm_{var}_{y}.zip")
            if os.path.exists(target_zip):
                continue
            req = {
                "product_type": "temporal_evolution",
                "variable": var,
                "experiment": experiment,
                "model": "ERA5",
                "year": str(y),
                "month": [f"{m:02d}" for m in range(1, 13)],
                "format": "zip",
            }
            print("Requesting:", var, y)
            client.retrieve(GTSM_DATASET, req, target_zip)
            with zipfile.ZipFile(target_zip, "r") as zf:
                zf.extractall(os.path.join(GTSM_DIR, f"{var}_{y}"))
else:
    print("RUN_CDS_DOWNLOAD is False - skipping CDS download (Notebook 09 works with or without GTSM).")

# %% Cell 4 - Extract Bay of Bengal GTSM station peaks per storm event (if NetCDFs downloaded)
nc_files = sorted(glob.glob(os.path.join(GTSM_DIR, "**", "*.nc"), recursive=True))
print(f"Found {len(nc_files)} GTSM NetCDF files under {GTSM_DIR}")


def open_gtsm_bob(nc_path):
    import xarray as xr
    ds = xr.open_dataset(nc_path)
    lon_name = next(c for c in ["station_x_coordinate", "lon", "longitude"] if c in ds.variables or c in ds.coords)
    lat_name = next(c for c in ["station_y_coordinate", "lat", "latitude"] if c in ds.variables or c in ds.coords)
    st_dim = ds[lon_name].dims[0]
    lons = ds[lon_name].values
    lats = ds[lat_name].values
    keep = np.where(
        (lons >= BBOX_LON[0]) & (lons <= BBOX_LON[1]) &
        (lats >= BBOX_LAT[0]) & (lats <= BBOX_LAT[1])
    )[0]
    return ds.isel({st_dim: keep}), lons[keep], lats[keep], st_dim


if nc_files:
    var_Alias = {
        "surge": ["surge", "storm_surge_residual"],
        "tide": ["tide", "tidal_elevation"],
        "wl": ["waterlevel", "total_water_level"],
    }
    by_year = {}
    for p in nc_files:
        bn = os.path.basename(p).lower()
        for y in range(2000, 2026):
            if f"_{y}" in bn or f"-{y}" in bn or f"/{y}" in p:
                by_year.setdefault(y, []).append(p)

    records = []
    for _, ev in events.iterrows():
        t0 = pd.Timestamp(ev["t0"], tz="UTC")
        y = t0.year
        if y not in by_year:
            continue
        w0 = (t0 - pd.Timedelta(days=2)).tz_localize(None)
        w1 = (t0 + pd.Timedelta(days=3)).tz_localize(None)

        st_data = {}
        st_lons, st_lats = None, None
        for p in by_year[y]:
            sub, lons, lats, st_dim = open_gtsm_bob(p)
            if len(lons) == 0:
                sub.close()
                continue
            st_lons, st_lats = lons, lats
            sub_t = sub.sel(time=slice(w0, w1))
            for key, names in var_Alias.items():
                for v in names:
                    if v in sub_t.data_vars:
                        st_data[key] = sub_t[v].load()
            sub.close()

        if "surge" not in st_data or st_lons is None:
            continue

        surge_da = st_data["surge"]
        time_vals = pd.to_datetime(surge_da["time"].values)
        s_arr = surge_da.values
        if s_arr.shape[0] != len(time_vals):
            s_arr = s_arr.T

        t_arr = st_data["tide"].values if "tide" in st_data else np.full_like(s_arr, np.nan)
        if t_arr.shape != s_arr.shape:
            t_arr = t_arr.T
        w_arr = st_data["wl"].values if "wl" in st_data else (s_arr + t_arr)
        if w_arr.shape != s_arr.shape:
            w_arr = w_arr.T

        for j in range(len(st_lons)):
            col_s = s_arr[:, j]
            if np.all(np.isnan(col_s)):
                continue
            k_max = int(np.nanargmax(col_s))
            records.append(dict(
                sid=ev["sid"],
                station_index=int(j),
                station_lon=float(st_lons[j]),
                station_lat=float(st_lats[j]),
                surge_max_m=float(col_s[k_max]),
                surge_peak_time=str(time_vals[k_max]),
                surge_mean_m=float(np.nanmean(col_s)),
                tide_at_surge_peak_m=float(t_arr[k_max, j]) if not np.all(np.isnan(t_arr[:, j])) else np.nan,
                tide_max_m=float(np.nanmax(t_arr[:, j])) if not np.all(np.isnan(t_arr[:, j])) else np.nan,
                waterlevel_max_m=float(np.nanmax(w_arr[:, j])) if not np.all(np.isnan(w_arr[:, j])) else np.nan,
                waterlevel_at_surge_peak_m=float(w_arr[k_max, j]) if not np.all(np.isnan(w_arr[:, j])) else np.nan,
            ))

    gtsm_df = pd.DataFrame(records)
    gtsm_path = os.path.join(OUT_DIR, "gtsm_event_station_stats.csv")
    gtsm_df.to_csv(gtsm_path, index=False)
    print(f"Saved {len(gtsm_df)} station x event rows -> {gtsm_path}")
else:
    print("No GTSM NetCDFs present yet; Notebook 09 will automatically use IBTrACS + ERA5 physics proxies.")
