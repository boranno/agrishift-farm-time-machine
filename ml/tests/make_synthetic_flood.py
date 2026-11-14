"""Synthetic stand-in for the 04_export_flood_gee.py CSVs. Usage: python make_synthetic_flood.py OUT_DIR
Writes agrishift_flood_sat_<district>_<year>.csv (2003-2025) and agrishift_flood_sar_<district>_<year>.csv (2017-2025)
with the real column names, including -9999 'no data' static values."""
import sys, os
import numpy as np, pandas as pd
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(3)
dist = ['Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira']
lons = 89.0 + 0.05 * np.arange(12); lats = 22.2 + 0.1 * np.arange(10)
pts = [(a, b) for a in lons for b in lats]
meta = {}
for i, (lo, la) in enumerate(pts):
    meta[(lo, la)] = dict(district=dist[i % 10], landcover=12 if i % 4 else 14, elevation=rng.uniform(1, 12),
        hnd=rng.uniform(0, 15) if i % 13 else -9999, upa=rng.uniform(0, 50), jrc_occurrence=rng.integers(0, 20),
        jrc_seasonality=rng.integers(0, 6), perm=rng.uniform(0, 0.1))
ar = {p: 0.0 for p in pts}
for y in range(2003, 2026):
    wet = rng.uniform(0.7, 1.3)
    for d in dist:
        rows, srows = [], []
        for p in pts:
            m0 = meta[p]
            if m0['district'] != d: continue
            for m in range(1, 13):
                s = np.sin(2 * np.pi * (m - 3) / 12)
                ar[p] = 0.6 * ar[p] + rng.normal(0, 0.03)
                sw = 0.3 + 0.08 * s * wet + ar[p]
                rows.append(dict(district=d, lon=p[0], lat=p[1], landcover=m0['landcover'], elevation=m0['elevation'], hnd=m0['hnd'],
                    upa=m0['upa'], jrc_occurrence=m0['jrc_occurrence'], jrc_seasonality=m0['jrc_seasonality'], year=y, month=m,
                    swl1=sw + rng.normal(0, .01), swl2=sw + 0.02, swl3=sw + 0.03, era5_rain_m=max(0, 0.2 * wet * (1 + s)) * 0.4, era5_sro_m=0.01,
                    chirps_rain_mm=max(0, 200 * wet * (1 + s) + rng.normal(0, 40)), chirps_max1d_mm=rng.uniform(5, 90),
                    chirps_days_gt50=rng.integers(0, 3), lswi_mean=np.nan if rng.random() < 0.15 else 0.2 + 0.1 * s + rng.normal(0, .03),
                    mndwi_mean=-0.2 + 0.1 * s + rng.normal(0, .03), mndwi_max=0.0 + 0.1 * s))
                if y >= 2017:
                    peak = max(0, 0.05 + 0.15 * max(s, 0) * wet + rng.normal(0, 0.03))
                    srows.append(dict(district=d, lon=p[0], lat=p[1], year=y, month=m, water_freq=peak * 0.5 + m0['perm'],
                        water_peak=peak + m0['perm'], n_obs=0 if rng.random() < 0.1 else rng.integers(1, 4), vv_median=-10, perm_water=m0['perm']))
        pd.DataFrame(rows).to_csv(os.path.join(out, f"agrishift_flood_sat_{d}_{y}.csv"), index=False)
        if y >= 2017: pd.DataFrame(srows).to_csv(os.path.join(out, f"agrishift_flood_sar_{d}_{y}.csv"), index=False)
print("wrote", out)
