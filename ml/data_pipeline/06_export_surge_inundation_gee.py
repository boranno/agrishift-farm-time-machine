# %% [markdown]
# # AgriShift Storm-Surge Dataset - Part 2: Per-Event Satellite Flood Extent Export (Google Earth Engine)
#
# For every cyclone in `storm_events.csv`, exports pre/post Sentinel-1 SAR water change,
# MODIS Global Flood Database footprints, ERA5 wind/pressure, and CHIRPS cyclone rainfall
# across all 10 districts of Khulna Division.
#
# ### Fixes & Free-Colab Optimizations Applied:
# 1. **Fixed `FAO/GAUL/2015/level2` District Name:** Uses `"Jhenaidah"` (instead of `"Jhenaidaha"`) with automatic `ADM1_NAME == "Khulna"` fallback so Cell 2 never crashes.
# 2. **Resumable Exports (`SKIP_EXISTING_FILES = True`):** Automatically checks `/content/drive/MyDrive/AgriShift_surge/` and skips any `(sid, district)` CSV that already exists in your Drive.
# 3. **Precomputed District Grids:** Builds each district's 1 km pixel grid and permanent water layer once (`10` times) outside the storm loop instead of `290` times.

# %% Cell 1 - setup & load storm catalog
# !pip install -q earthengine-api
import os
import ee
import pandas as pd

try:
    from google.colab import drive
    if not os.path.ismount("/content/drive"):
        drive.mount("/content/drive")
except ImportError:
    pass

PROJECT_ID = "drout-prediction-nasadata"
DRIVE_FOLDER = "AgriShift_surge"
DRIVE_MOUNT_DIR = f"/content/drive/MyDrive/{DRIVE_FOLDER}"
EVENTS_CSV = os.environ.get("EVENTS_CSV", f"{DRIVE_MOUNT_DIR}/storm_events.csv")

# Verified FAO/GAUL/2015/level2 ADM2_NAME spelling for all 10 districts in Khulna Division
DISTRICTS = [
    "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna",
    "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
]
LC_YEAR = 2022
VV_WATER_DB = -18.0
RUN_EXPORTS = False
SKIP_EXISTING_FILES = True

try:
    ee.Initialize(project=PROJECT_ID)
except Exception:
    ee.Authenticate()
    ee.Initialize(project=PROJECT_ID)
print("Earth Engine ready.")

# %% Cell 2 - study area polygons + static terrain & distance to coast/water
gaul = (ee.FeatureCollection("FAO/GAUL/2015/level2")
        .filter(ee.Filter.eq("ADM0_NAME", "Bangladesh")))
districts = gaul.filter(ee.Filter.inList("ADM2_NAME", DISTRICTS))
found = sorted(districts.aggregate_array("ADM2_NAME").getInfo())
print(f"Found {len(found)}/{len(DISTRICTS)} districts:", found)
if sorted(found) != sorted(DISTRICTS):
    districts = gaul.filter(ee.Filter.eq("ADM1_NAME", "Khulna"))
    DISTRICTS = sorted(list(set(districts.aggregate_array("ADM2_NAME").getInfo())))
    print("Auto-resolved Khulna Division districts from ADM1_NAME:", DISTRICTS)

MODIS_PROJ = (ee.ImageCollection("MODIS/061/MOD13A2").first().select("NDVI").projection())

lc = (ee.ImageCollection("MODIS/061/MCD12Q1")
      .filterDate(f"{LC_YEAR}-01-01", f"{LC_YEAR + 1}-01-01").first()
      .select("LC_Type1").rename("landcover"))
elev = ee.Image("USGS/SRTMGL1_003").select("elevation")
merit = ee.Image("MERIT/Hydro/v1_0_1")
hnd = merit.select("hnd").unmask(-9999).rename("hnd")

jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
jrc_occ = jrc.select("occurrence").unmask(0).rename("jrc_occurrence")

# Distance (m) to permanent rivers/estuaries (`occurrence >= 80%`) and to coastline (`lat < 22.15`)
perm_mask = jrc_occ.gte(80)
dist_water_m = (perm_mask.fastDistanceTransform(256).sqrt()
                .multiply(ee.Image.pixelArea().sqrt()).rename("dist_water_m"))

lat_img = ee.Image.pixelLonLat().select("latitude")
ocean_mask = perm_mask.And(lat_img.lt(22.15))
dist_coast_m = (ocean_mask.fastDistanceTransform(1024).sqrt()
                .multiply(ee.Image.pixelArea().sqrt()).rename("dist_coast_m"))

static_img = (lc.addBands([elev, hnd, jrc_occ, dist_water_m, dist_coast_m])
              .updateMask(lc.neq(17)))


def build_grid(district_names):
    fc = districts.filter(ee.Filter.inList("ADM2_NAME", district_names))

    def sample_district(f):
        f = ee.Feature(f)
        pts = static_img.sample(region=f.geometry(), scale=1000, projection=MODIS_PROJ,
                                geometries=True)
        return pts.map(lambda p: ee.Feature(p).set("district", f.get("ADM2_NAME")))

    def add_xy(p):
        c = ee.Feature(p).geometry().coordinates()
        return ee.Feature(p).set({"lon": c.get(0), "lat": c.get(1)})

    return (ee.FeatureCollection(fc.toList(fc.size()).map(sample_district))
            .flatten().map(add_xy))


def cell_boxes(points):
    return points.map(lambda f: ee.Feature(f).setGeometry(f.geometry().buffer(500).bounds()))

# %% Cell 3 - per-storm Sentinel-1 pre/post water change (2017+)
def s1_vv_collection(region, start_date, end_date):
    def despike(img):
        vv = img.select("VV").focal_median(30, "circle", "meters")
        return vv.updateMask(vv.gt(-30).And(vv.lt(0))).rename("VV")

    return (ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(region)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
            .map(despike))


def s1_event_image(region, pre_start, pre_end, post_start, post_end):
    pre_col = s1_vv_collection(region, pre_start, pre_end)
    post_col = s1_vv_collection(region, post_start, post_end)

    pre_water = pre_col.map(lambda i: i.lt(VV_WATER_DB)).mean().rename("pre_water")
    post_water = post_col.map(lambda i: i.lt(VV_WATER_DB)).max().rename("post_water")
    new_water = post_water.subtract(pre_water).max(0).rename("new_water")

    n_pre = pre_col.count().rename("n_pre")
    n_post = post_col.count().rename("n_post")
    valid = n_post.gt(0).And(n_pre.gt(0)).rename("s1_valid_frac")

    empty = (ee.Image.constant([-1, -1, -1, 0, 0, 0])
             .rename(["post_water", "pre_water", "new_water", "n_post", "n_pre", "s1_valid_frac"])
             .toFloat())
    has_both = post_col.size().gt(0).And(pre_col.size().gt(0))
    return ee.Image(ee.Algorithms.If(
        has_both,
        post_water.addBands([pre_water, new_water, n_post, n_pre, valid]).toFloat(),
        empty,
    ))

# %% Cell 4 - MODIS Global Flood Database (2000-2018) + ERA5 Wind/Pressure + CHIRPS Storm Rain
GFD = ee.ImageCollection("GLOBAL_FLOOD_DB/MODIS_EVENTS/V1")


def gfd_event_image(region, t0_str):
    t0 = ee.Date(t0_str)
    matches = GFD.filterBounds(region).filterDate(t0.advance(-10, "day"), t0.advance(15, "day"))
    flooded = matches.select("flooded").max().unmask(0).rename("gfd_flooded")
    jrc_perm = matches.select("jrc_perm_water").max().unmask(0)
    gfd_new = flooded.subtract(jrc_perm).max(0).rename("gfd_new_water")
    dur = matches.select("duration").max().unmask(0).rename("gfd_duration_d")

    empty = (ee.Image.constant([-1, -1, -1])
             .rename(["gfd_flooded", "gfd_new_water", "gfd_duration_d"]).toFloat())
    return ee.Image(ee.Algorithms.If(
        matches.size().gt(0),
        flooded.addBands([gfd_new, dur]).toFloat(),
        empty,
    ))


def era5_event_image(post_start, post_end):
    col = (ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
           .filterDate(post_start, post_end)
           .select(["u_component_of_wind_10m", "v_component_of_wind_10m", "surface_pressure"]))

    def wind_speed(img):
        u = img.select("u_component_of_wind_10m")
        v = img.select("v_component_of_wind_10m")
        w = u.hypot(v).rename("wind10_ms")
        p = img.select("surface_pressure").divide(100.0).rename("msl_hpa")
        return w.addBands(p)

    wp = col.map(wind_speed)
    w_max = wp.select("wind10_ms").max().rename("wind10_max_ms")
    p_min = wp.select("msl_hpa").min().rename("msl_min_hpa")

    # Total storm-window rainfall (mm) from CHIRPS Daily to separate rainfall ponding from coastal surge
    storm_rain = (ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                  .filterDate(post_start, post_end)
                  .select("precipitation").sum().rename("storm_rain_mm"))
    return w_max.addBands([p_min, storm_rain]).toFloat()

# %% Cell 5 - smoke test on Cyclone Amphan (May 2020)
test_pts = ee.FeatureCollection([
    ee.Feature(ee.Geometry.Point([89.20, 22.30]), {"district": "Satkhira", "lon": 89.20, "lat": 22.30}),
    ee.Feature(ee.Geometry.Point([89.55, 22.50]), {"district": "Khulna",   "lon": 89.55, "lat": 22.50}),
    ee.Feature(ee.Geometry.Point([89.80, 22.40]), {"district": "Bagerhat", "lon": 89.80, "lat": 22.40}),
])
test_reg = test_pts.geometry().bounds().buffer(5000)
s1_amp = s1_event_image(test_reg, "2020-04-17", "2020-05-17", "2020-05-19", "2020-05-27")
era_amp = era5_event_image("2020-05-19", "2020-05-23")
sample = s1_amp.addBands(era_amp).reduceRegions(
    cell_boxes(test_pts), ee.Reducer.mean(), scale=60, tileScale=4).getInfo()
print("Cyclone Amphan smoke test:", [f["properties"] for f in sample["features"]])

# %% Cell 6 - start resumable exports across all storms & districts
SELECTORS = [
    "sid", "name", "season", "t0",
    "max_wind_kt", "min_pres_hpa", "min_dist_km", "storm_speed_kt",
    "coast_on_right_of_track", "days_to_syzygy", "spring_tide_flag",
    "sar_era", "gfd_era",
    "district", "lon", "lat", "landcover", "elevation", "hnd",
    "jrc_occurrence", "dist_water_m", "dist_coast_m",
    "post_water", "pre_water", "new_water", "n_post", "n_pre", "s1_valid_frac",
    "gfd_flooded", "gfd_new_water", "gfd_duration_d",
    "wind10_max_ms", "msl_min_hpa", "storm_rain_mm",
]

if os.path.exists(EVENTS_CSV):
    events = pd.read_csv(EVENTS_CSV)
    print(f"Loaded {len(events)} storms from {EVENTS_CSV}")
else:
    events = pd.DataFrame()
    print(f"WARNING: {EVENTS_CSV} not found yet. Run Notebook 05 first.")

if RUN_EXPORTS and len(events) > 0:
    # Pre-build district grids & bounding boxes ONCE outside the storm loop
    dist_cache = {}
    for d in DISTRICTS:
        pts = build_grid([d])
        geom = districts.filter(ee.Filter.eq("ADM2_NAME", d)).geometry()
        dist_cache[d] = (pts, cell_boxes(pts), geom)

    n_tasks, n_skip = 0, 0
    for _, ev in events.iterrows():
        sid = str(ev["sid"])
        w0 = str(ev["window_start"])
        w1 = str(ev["window_end"])
        p0 = str(ev["pre_start"])
        p1 = str(ev["pre_end"])
        t0_date = str(ev["t0"])[:10]

        era_end = (pd.Timestamp(w0) + pd.Timedelta(days=4)).strftime("%Y-%m-%d")
        era_img = era5_event_image(w0, era_end)

        meta_dict = {
            "sid": sid,
            "name": str(ev["name"]),
            "season": int(ev["season"]),
            "t0": str(ev["t0"]),
            "max_wind_kt": float(ev["max_wind_kt"]),
            "min_pres_hpa": float(ev["min_pres_hpa"]) if pd.notna(ev["min_pres_hpa"]) else -9999.0,
            "min_dist_km": float(ev["min_dist_km"]),
            "storm_speed_kt": float(ev["storm_speed_kt"]) if pd.notna(ev["storm_speed_kt"]) else -9999.0,
            "coast_on_right_of_track": int(ev["coast_on_right_of_track"]),
            "days_to_syzygy": float(ev["days_to_syzygy"]),
            "spring_tide_flag": int(ev["spring_tide_flag"]),
            "sar_era": int(ev["sar_era"]),
            "gfd_era": int(ev["gfd_era"]),
        }

        for d in DISTRICTS:
            desc = f"agrishift_surge_{sid}_{d}"
            if SKIP_EXISTING_FILES and os.path.exists(os.path.join(DRIVE_MOUNT_DIR, f"{desc}.csv")):
                n_skip += 1
                continue
            pts, boxes, geom = dist_cache[d]
            s1_img = s1_event_image(geom, p0, p1, w0, w1)
            gfd_img = gfd_event_image(geom, t0_date)
            combo = s1_img.addBands([gfd_img, era_img])

            fc = combo.reduceRegions(
                collection=boxes, reducer=ee.Reducer.mean(),
                scale=60, tileScale=4)
            fc = fc.map(lambda f, m=meta_dict: ee.Feature(f).set(m))

            ee.batch.Export.table.toDrive(
                collection=fc, description=desc,
                folder=DRIVE_FOLDER, fileNamePrefix=desc,
                fileFormat="CSV", selectors=SELECTORS).start()
            n_tasks += 1
    print(f"Started {n_tasks} surge export tasks (skipped {n_skip} existing CSVs in Drive).")
else:
    print("RUN_EXPORTS is False - nothing started.")
