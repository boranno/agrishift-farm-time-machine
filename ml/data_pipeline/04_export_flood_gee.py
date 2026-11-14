# %% [markdown]
# # AgriShift Inundation & Waterlogging Dataset - Part 1: Earth Engine Export
#
# Exports the extra variables needed to label and predict **surface inundation**
# and **root-zone waterlogging** across all 10 districts of Khulna Division
# on the **exact same 1 km MODIS pixel grid** used by the drought pipeline.
#
# ### Fixes & Free-Colab Optimizations Applied:
# 1. **Fixed `FAO/GAUL/2015/level2` District Name:** Uses `"Jhenaidah"` (instead of `"Jhenaidaha"`) with automatic `ADM1_NAME == "Khulna"` fallback so Cell 2 never crashes.
# 2. **Resumable Exports (`SKIP_EXISTING_FILES = True`):** Automatically checks `/content/drive/MyDrive/AgriShift_flood/` and skips any `(district, year)` CSV that already exists in your Drive, so if you already exported 9 districts, re-running this notebook only exports the missing `Jhenaidah` CSVs!
# 3. **Cached Grid Geometries:** Builds each district's pixel grid once outside the year loop instead of 320 times.

# %% Cell 1 - setup
# !pip install -q earthengine-api
import os
import ee

try:
    from google.colab import drive
    if not os.path.ismount("/content/drive"):
        drive.mount("/content/drive")
except ImportError:
    pass

PROJECT_ID = "drout-prediction-nasadata"
DRIVE_FOLDER = "AgriShift_flood"
DRIVE_MOUNT_DIR = f"/content/drive/MyDrive/{DRIVE_FOLDER}"

# All 10 districts of Khulna Division (verified FAO/GAUL/2015/level2 ADM2_NAME spelling)
DISTRICTS = [
    "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna",
    "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
]

OPTICAL_START, OPTICAL_END = 2003, 2025   # ERA5-Land + CHIRPS + MODIS surface reflectance
SAR_START, SAR_END = 2017, 2025           # Sentinel-1 IW VV coverage over Bangladesh
LC_YEAR = 2022
VV_WATER_DB = -18.0                       # open-water backscatter threshold (dB)
RUN_EXPORTS = False                       # flip to True after the Cell 5 smoke test
SKIP_EXISTING_FILES = True                # skip tasks whose CSV already exists in Drive

try:
    ee.Initialize(project=PROJECT_ID)
except Exception:
    ee.Authenticate()
    ee.Initialize(project=PROJECT_ID)
print("Earth Engine ready.")

# %% Cell 2 - district polygons (auto-resolves Khulna Division ADM2 names)
gaul = (ee.FeatureCollection("FAO/GAUL/2015/level2")
        .filter(ee.Filter.eq("ADM0_NAME", "Bangladesh")))
districts = gaul.filter(ee.Filter.inList("ADM2_NAME", DISTRICTS))
found = sorted(districts.aggregate_array("ADM2_NAME").getInfo())
print(f"Found {len(found)}/{len(DISTRICTS)} districts:", found)
if sorted(found) != sorted(DISTRICTS):
    districts = gaul.filter(ee.Filter.eq("ADM1_NAME", "Khulna"))
    DISTRICTS = sorted(list(set(districts.aggregate_array("ADM2_NAME").getInfo())))
    print("Auto-resolved Khulna Division districts from ADM1_NAME:", DISTRICTS)

# %% Cell 3 - static 1 km grid + flood-relevant terrain & JRC water layers
MODIS_PROJ = (ee.ImageCollection("MODIS/061/MOD13A2").first().select("NDVI").projection())

lc = (ee.ImageCollection("MODIS/061/MCD12Q1")
      .filterDate(f"{LC_YEAR}-01-01", f"{LC_YEAR + 1}-01-01").first()
      .select("LC_Type1").rename("landcover"))
elev = ee.Image("USGS/SRTMGL1_003").select("elevation")

# MERIT Hydro: height above nearest drainage (m) and upstream drainage area (km2)
merit = ee.Image("MERIT/Hydro/v1_0_1")
hnd = merit.select("hnd").unmask(-9999).rename("hnd")
upa = merit.select("upa").unmask(-9999).rename("upa")

# JRC Global Surface Water long-term climatology (1984-2021)
jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
jrc_occ = jrc.select("occurrence").unmask(0).rename("jrc_occurrence")
jrc_seas = jrc.select("seasonality").unmask(0).rename("jrc_seasonality")

static_img = (lc.addBands([elev, hnd, upa, jrc_occ, jrc_seas])
              .updateMask(lc.neq(17)))   # drop permanent water bodies (IGBP 17)


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


print("Static grid recipe ready.")

# %% Cell 4 - Stream A: monthly soil water, runoff, heavy rain, LSWI, MNDWI (2003-2025)
def monthly_sat_image(year, month):
    start = ee.Date.fromYMD(year, month, 1)
    end = start.advance(1, "month")

    # ERA5-Land monthly: 3 soil water layers (0-100 cm), total rain, surface runoff
    era = (ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR").filterDate(start, end).first()
           .select(["volumetric_soil_water_layer_1",
                    "volumetric_soil_water_layer_2",
                    "volumetric_soil_water_layer_3",
                    "total_precipitation_sum",
                    "surface_runoff_sum"],
                   ["swl1", "swl2", "swl3", "era5_rain_m", "era5_sro_m"]))

    # CHIRPS daily -> monthly total, max 1-day rain, count of heavy-rain days (> 50 mm)
    chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY").filterDate(start, end).select("precipitation")
    rain_sum = chirps.sum().rename("chirps_rain_mm")
    rain_max1d = chirps.max().rename("chirps_max1d_mm")
    rain_gt50 = (chirps.map(lambda i: i.gt(50)).sum()
                 .rename("chirps_days_gt50"))

    # MODIS 8-day surface reflectance (MOD09A1, 500 m) -> LSWI and MNDWI
    def prep_sr(img):
        qa = img.select("StateQA")
        cloud = qa.bitwiseAnd(3).neq(0)
        shadow = qa.bitwiseAnd(1 << 2).neq(0)
        cirrus = qa.bitwiseAnd(3 << 8).neq(0)
        mask = cloud.Or(shadow).Or(cirrus).Not()
        img = img.updateMask(mask)
        lswi = img.normalizedDifference(["sur_refl_b02", "sur_refl_b06"]).rename("lswi")
        mndwi = img.normalizedDifference(["sur_refl_b04", "sur_refl_b06"]).rename("mndwi")
        return lswi.addBands(mndwi)

    sr = ee.ImageCollection("MODIS/061/MOD09A1").filterDate(start, end).map(prep_sr)
    lswi_mean = sr.select("lswi").mean().rename("lswi_mean")
    mndwi_mean = sr.select("mndwi").mean().rename("mndwi_mean")
    mndwi_max = sr.select("mndwi").max().rename("mndwi_max")

    return era.addBands([rain_sum, rain_max1d, rain_gt50, lswi_mean, mndwi_mean, mndwi_max])


SAT_SELECTORS = [
    "district", "lon", "lat", "landcover", "elevation",
    "hnd", "upa", "jrc_occurrence", "jrc_seasonality",
    "year", "month",
    "swl1", "swl2", "swl3", "era5_rain_m", "era5_sro_m",
    "chirps_rain_mm", "chirps_max1d_mm", "chirps_days_gt50",
    "lswi_mean", "mndwi_mean", "mndwi_max",
]

# %% Cell 5 - Stream B: monthly Sentinel-1 SAR open-water fraction (2017-2025) + smoke test
def s1_base_collection(region):
    return (ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(region)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
            .select("VV"))


def clamp_vv(img):
    vv = img. focal_median(30, "circle", "meters")
    return vv.updateMask(vv.gt(-30).And(vv.lt(0))).rename("VV")


def permanent_water_20m(region):
    s1_ref = (s1_base_collection(region)
              .filterDate("2019-01-01", "2022-01-01")
              .map(clamp_vv))
    vv_p10 = s1_ref.reduce(ee.Reducer.percentile([10]))
    return vv_p10.lt(VV_WATER_DB).rename("perm_water")


def monthly_sar_image(year, month, region, perm_water_img):
    start = ee.Date.fromYMD(year, month, 1)
    end = start.advance(1, "month")
    col = s1_base_collection(region).filterDate(start, end).map(clamp_vv)
    water_col = col.map(lambda i: i.lt(VV_WATER_DB).rename("w"))

    water_freq = water_col.mean().rename("water_freq")
    water_peak = water_col.max().rename("water_peak")
    n_obs = water_col.count().rename("n_obs")
    vv_med = col.median().rename("vv_median")

    empty = (ee.Image.constant([0, 0, 0, 0])
             .rename(["water_freq", "water_peak", "n_obs", "vv_median"])
             .updateMask(ee.Image.constant(0)))
    img = ee.Image(ee.Algorithms.If(
        col.size().gt(0),
        water_freq.addBands([water_peak, n_obs, vv_med]),
        empty,
    ))
    return img.addBands(perm_water_img)


def cell_boxes(points):
    return points.map(lambda f: ee.Feature(f).setGeometry(f.geometry().buffer(500).bounds()))


SAR_SELECTORS = [
    "district", "lon", "lat", "year", "month",
    "water_freq", "water_peak", "n_obs", "vv_median", "perm_water",
]

# Smoke test on 3 points in August 2022
test_pts = ee.FeatureCollection([
    ee.Feature(ee.Geometry.Point([89.55, 22.82]), {"district": "Khulna", "lon": 89.55, "lat": 22.82}),
    ee.Feature(ee.Geometry.Point([89.08, 22.72]), {"district": "Satkhira", "lon": 89.08, "lat": 22.72}),
    ee.Feature(ee.Geometry.Point([89.21, 23.17]), {"district": "Jessore", "lon": 89.21, "lat": 23.17}),
])
sat_sample = monthly_sat_image(2022, 8).reduceRegions(
    test_pts, ee.Reducer.first(), scale=1000, crs=MODIS_PROJ).getInfo()
print("Stream A sample (2022-08):", [f["properties"] for f in sat_sample["features"]])

perm_test = permanent_water_20m(test_pts.geometry().bounds().buffer(2000))
sar_sample = monthly_sar_image(2022, 8, test_pts.geometry().bounds().buffer(2000), perm_test).reduceRegions(
    cell_boxes(test_pts), ee.Reducer.mean(), scale=60, tileScale=4).getInfo()
print("Stream B sample (2022-08):", [f["properties"] for f in sar_sample["features"]])

# %% Cell 6 - start resumable exports (skips CSVs already present in Google Drive)
def sat_year_table(year, pixels):
    parts = []
    for m in range(1, 13):
        fc = monthly_sat_image(year, m).reduceRegions(
            collection=pixels, reducer=ee.Reducer.first(),
            scale=1000, crs=MODIS_PROJ, tileScale=4)
        parts.append(fc.map(lambda f, m=m: ee.Feature(f).set({"year": year, "month": m})))
    return ee.FeatureCollection(parts).flatten()


def sar_year_table(year, boxes, region, perm_img):
    parts = []
    for m in range(1, 13):
        img = monthly_sar_image(year, m, region, perm_img)
        fc = img.reduceRegions(
            collection=boxes, reducer=ee.Reducer.mean(),
            scale=60, tileScale=4)
        parts.append(fc.map(lambda f, m=m: ee.Feature(f).set({"year": year, "month": m})))
    return ee.FeatureCollection(parts).flatten()


if RUN_EXPORTS:
    n_sat, n_sar, n_skip = 0, 0, 0
    for d in DISTRICTS:
        pixels = build_grid([d])
        for y in range(OPTICAL_START, OPTICAL_END + 1):
            name = f"agrishift_flood_sat_{d}_{y}"
            if SKIP_EXISTING_FILES and os.path.exists(os.path.join(DRIVE_MOUNT_DIR, f"{name}.csv")):
                n_skip += 1
                continue
            ee.batch.Export.table.toDrive(
                collection=sat_year_table(y, pixels), description=name,
                folder=DRIVE_FOLDER, fileNamePrefix=name,
                fileFormat="CSV", selectors=SAT_SELECTORS).start()
            n_sat += 1

        geom = districts.filter(ee.Filter.eq("ADM2_NAME", d)).geometry()
        boxes = cell_boxes(pixels)
        perm_img = permanent_water_20m(geom)
        for y in range(SAR_START, SAR_END + 1):
            name = f"agrishift_flood_sar_{d}_{y}"
            if SKIP_EXISTING_FILES and os.path.exists(os.path.join(DRIVE_MOUNT_DIR, f"{name}.csv")):
                n_skip += 1
                continue
            ee.batch.Export.table.toDrive(
                collection=sar_year_table(y, boxes, geom, perm_img), description=name,
                folder=DRIVE_FOLDER, fileNamePrefix=name,
                fileFormat="CSV", selectors=SAR_SELECTORS).start()
            n_sar += 1
    print(f"Started {n_sat} sat tasks + {n_sar} SAR tasks (skipped {n_skip} existing CSVs in Drive).")
else:
    print("RUN_EXPORTS is False - nothing started.")
