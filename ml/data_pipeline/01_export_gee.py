# %% [markdown]
# # AgriShift Drought Dataset - Part 1: Earth Engine Export
# Builds a pixel x month panel (1 km MODIS grid) for all 10 districts of Khulna Division
# (2003-2025), exporting CSVs to Google Drive.
#
# **Free Colab Optimized & Resumable:**
# - Automatically skips any `(district, year)` CSV that already exists in your Google Drive folder.
# - NOTE: If you already exported the 230 CSVs (`agrishift_grid_*.csv`), you do **NOT** need to re-run this notebook.

# %% Cell 1 - setup
# !pip install -q earthengine-api
import os
import ee

PROJECT_ID = "drout-prediction-nasadata"   # your Earth Engine / Cloud project
START_YEAR, END_YEAR = 2003, 2025          # inclusive
# Verified FAO/GAUL/2015/level2 ADM2 names for all 10 districts in Khulna Division
DISTRICTS = [
    "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah",
    "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
]
DRIVE_FOLDER = "AgriShift_dataset"
DRIVE_MOUNT_DIR = f"/content/drive/MyDrive/{DRIVE_FOLDER}"
LC_YEAR = 2022                             # land-cover year used for the static mask/label
RUN_EXPORTS = False                        # set True only after the smoke test in Cell 4 looks right
SPLIT_BY_DISTRICT = True                   # one export per district per year (smaller, safer tasks)
SKIP_EXISTING_FILES = True                 # skip tasks whose CSV is already in mounted Google Drive

try:
    ee.Initialize(project=PROJECT_ID)
except Exception:
    ee.Authenticate()
    ee.Initialize(project=PROJECT_ID)
print("Earth Engine ready for all 10 Khulna Division districts.")

# %% Cell 2 - study area (district polygons)
gaul = (ee.FeatureCollection("FAO/GAUL/2015/level2")
        .filter(ee.Filter.eq("ADM0_NAME", "Bangladesh")))

districts = gaul.filter(ee.Filter.inList("ADM2_NAME", DISTRICTS))
found = sorted(districts.aggregate_array("ADM2_NAME").getInfo())
print("Districts found:", found)
if sorted(found) != sorted(DISTRICTS):
    # Fallback to ADM1_NAME == 'Khulna' in case GAUL version differs
    districts = gaul.filter(ee.Filter.eq("ADM1_NAME", "Khulna"))
    DISTRICTS = sorted(list(set(districts.aggregate_array("ADM2_NAME").getInfo())))
    print("Resolved Khulna Division districts via ADM1_NAME:", DISTRICTS)

# %% Cell 3 - grid builder (lazy: nothing is computed here, no assets needed)
MODIS_PROJ = (ee.ImageCollection("MODIS/061/MOD13A2").first().select("NDVI").projection())

lc = (ee.ImageCollection("MODIS/061/MCD12Q1")
      .filterDate(f"{LC_YEAR}-01-01", f"{LC_YEAR + 1}-01-01").first().select("LC_Type1"))
elev = ee.Image("USGS/SRTMGL1_003").select("elevation")
# Water (IGBP class 17) is dropped. Cropland = classes 12 and 14 (filtered later in pandas).
static_img = lc.rename("landcover").addBands(elev).updateMask(lc.neq(17))


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


grid = build_grid(DISTRICTS)
print("Grid defined (it is built inside each export task)")

# %% Cell 4 - monthly predictor image + smoke test
def monthly_image(year, month):
    start = ee.Date.fromYMD(year, month, 1)
    end = start.advance(1, "month")

    # Vegetation: keep good/marginal pixels only (SummaryQA 0 or 1), mean of the 16-day composites
    veg = (ee.ImageCollection("MODIS/061/MOD13A2").filterDate(start, end)
           .map(lambda i: i.updateMask(i.select("SummaryQA").lte(1)))
           .select(["NDVI", "EVI"]).mean())

    # Land surface temperature (day/night), mean of 8-day composites
    lst = (ee.ImageCollection("MODIS/061/MOD11A2").filterDate(start, end)
           .select(["LST_Day_1km", "LST_Night_1km"]).mean()
           .rename(["LST_Day", "LST_Night"]))

    # Rainfall: monthly total (mm) from CHIRPS daily
    rain = (ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY").filterDate(start, end)
            .select("precipitation").sum().rename("CHIRPS_rain_mm"))

    # ERA5-Land monthly: air temperature, soil water, potential and actual evaporation
    era = (ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR").filterDate(start, end).first()
           .select(["temperature_2m", "volumetric_soil_water_layer_1",
                    "potential_evaporation_sum", "total_evaporation_sum"],
                   ["t2m_K", "soil_moisture", "pet_m", "et_m"]))

    return veg.addBands([lst, rain, era])


SELECTORS = ["district", "lon", "lat", "landcover", "elevation", "year", "month",
             "NDVI", "EVI", "LST_Day", "LST_Night", "CHIRPS_rain_mm",
             "t2m_K", "soil_moisture", "pet_m", "et_m"]

# Smoke test: one month, 3 hand-made points (one per district area).
test_pts = ee.FeatureCollection([
    ee.Feature(ee.Geometry.Point([89.55, 22.82]), {"id": 1}),   # Khulna area
    ee.Feature(ee.Geometry.Point([89.08, 22.72]), {"id": 2}),   # Satkhira area
    ee.Feature(ee.Geometry.Point([89.79, 22.66]), {"id": 3}),   # Bagerhat area
])
test = monthly_image(2022, 7).reduceRegions(
    collection=test_pts, reducer=ee.Reducer.first(),
    scale=1000, crs=MODIS_PROJ, tileScale=4).getInfo()
for feat in test["features"]:
    print(feat["properties"])

# %% Cell 5 - export tasks (one per year, or one per district per year)
def year_table(year, pixels):
    parts = []
    for m in range(1, 13):
        fc = monthly_image(year, m).reduceRegions(
            collection=pixels, reducer=ee.Reducer.first(),
            scale=1000, crs=MODIS_PROJ, tileScale=4)

        def tag(f, m=m):
            return ee.Feature(f).set({"year": year, "month": m})

        parts.append(fc.map(tag))
    return ee.FeatureCollection(parts).flatten()


if RUN_EXPORTS:
    groups = DISTRICTS if SPLIT_BY_DISTRICT else [None]
    # Pre-build district grids once outside the year loop
    grid_cache = {d: build_grid(DISTRICTS if d is None else [d]) for d in groups}
    n_started, n_skipped = 0, 0
    for y in range(START_YEAR, END_YEAR + 1):
        for d in groups:
            name = f"agrishift_grid_{y}" if d is None else f"agrishift_grid_{d}_{y}"
            out_csv = os.path.join(DRIVE_MOUNT_DIR, f"{name}.csv")
            if SKIP_EXISTING_FILES and os.path.exists(out_csv):
                n_skipped += 1
                continue
            ee.batch.Export.table.toDrive(
                collection=year_table(y, grid_cache[d]), description=name, folder=DRIVE_FOLDER,
                fileNamePrefix=name, fileFormat="CSV", selectors=SELECTORS).start()
            n_started += 1
    print(f"Started {n_started} export tasks (skipped {n_skipped} existing files). Track at https://code.earthengine.google.com/tasks")
else:
    print("RUN_EXPORTS is False - nothing started.")
