"""Synthetic stand-in for the 01_export_gee.py CSVs (drought stream). Usage: python make_synthetic_drought.py OUT_DIR
Writes agrishift_grid_<year>.csv with the same columns as the real export. Values are random with simple seasonality,
so model scores on this data are meaningless; it only proves the code runs and the schema matches."""
import sys, os
import numpy as np, pandas as pd
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(1)
lons = 89.15 + 0.05 * np.arange(12); lats = 22.2 + 0.05 * np.arange(8)
pts = [(a, b) for a in lons for b in lats]
yr_shock = {y: rng.normal(0, 0.05) for y in range(2003, 2026)}
ar = {p: 0.0 for p in pts}; base = {p: rng.normal(0.5, 0.05) for p in pts}
rain_year = {y: rng.uniform(0.7, 1.3) for y in range(2003, 2026)}
for y in range(2003, 2026):
    rows = []
    for p in pts:
        lo, la = p
        for m in range(1, 13):
            s = np.sin(2 * np.pi * m / 12)
            ar[p] = 0.7 * ar[p] + rng.normal(0, 0.04)
            nd = base[p] + 0.15 * s + yr_shock[y] + ar[p] + 0.002 * (y - 2003)
            miss = (m in (6, 7, 8) and rng.random() < 0.5) or rng.random() < 0.03
            rain = max(0, 200 * rain_year[y] * (1 + s) + rng.normal(0, 40)) if m in range(5, 10) else rng.random() * 15
            rows.append(dict(district=['Khulna', 'Satkhira', 'Bagerhat'][int(lo * 10) % 3], lon=lo, lat=la,
                landcover=12 if (int(lo * 100) // 5) % 3 else 14, elevation=3, year=y, month=m,
                NDVI=np.nan if miss else int(nd * 1e4), EVI=3000 + rng.normal(0, 100),
                LST_Day=(300 + 3 * s - 20 * yr_shock[y] + rng.normal(0, 1)) / 0.02, LST_Night=(293 + rng.normal(0, .5)) / 0.02,
                CHIRPS_rain_mm=rain, t2m_K=300 + rng.normal(0, 1), soil_moisture=0.3 + 0.05 * s + 0.1 * ar[p] + rng.normal(0, .01),
                pet_m=-(0.1 + rng.random() * 0.02), et_m=-(0.05 + rng.random() * 0.03)))
    pd.DataFrame(rows).to_csv(os.path.join(out, f"agrishift_grid_{y}.csv"), index=False)
print("wrote", out)
