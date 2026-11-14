"""Synthetic stand-in for notebook 05 + 06 outputs. Usage: python make_synthetic_surge.py OUT_DIR
Writes storm_events.csv, gtsm_event_station_stats.csv and agrishift_surge_<sid>_<district>.csv. Inundation probability is
built to rise with wind and fall with distance to coast and elevation, so the diagnostics should show those patterns."""
import sys, os
import numpy as np, pandas as pd
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(5)
dist = ['Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira']
lons = 89.0 + 0.05 * np.arange(12); lats = 21.9 + 0.1 * np.arange(14)
pts = [(a, b) for a in lons for b in lats]
years = [2000, 2002, 2005, 2007, 2008, 2009, 2013, 2015, 2017, 2019, 2020, 2021, 2022, 2024]
ev = []
for i, y in enumerate(years):
    t0 = pd.Timestamp(f'{y}-05-{10 + i % 15} 12:00') if i % 2 == 0 else pd.Timestamp(f'{y}-11-{5 + i % 20} 06:00')
    wind = rng.uniform(35, 140)
    ev.append(dict(sid=f'S{y}{i}', name=f'STORM{i}', season=y, t0=t0, closest_ref='x', min_dist_km=rng.uniform(10, 240), max_wind_kt=wind,
        min_pres_hpa=1010 - wind * 0.6, storm_speed_kt=rng.uniform(5, 15), coast_on_right_of_track=int(rng.random() < 0.5),
        days_to_syzygy=rng.uniform(0, 7), spring_tide_flag=0, window_start=t0 - pd.Timedelta(days=1), window_end=t0 + pd.Timedelta(days=7),
        pre_start=t0 - pd.Timedelta(days=33), pre_end=t0 - pd.Timedelta(days=3), sar_era=int(y >= 2017), gfd_era=int(t0 <= pd.Timestamp('2018-12-10'))))
ev = pd.DataFrame(ev); ev['spring_tide_flag'] = (ev.days_to_syzygy <= 2).astype(int)
ev.to_csv(os.path.join(out, 'storm_events.csv'), index=False)
rows = []
for _, e in ev.iterrows():
    if e.t0.year <= 2024:
        for k in range(6):
            rows.append(dict(sid=e.sid, station_index=k, station_lon=89.0 + 0.1 * k, station_lat=21.7 + 0.05 * k,
                surge_max_m=max(0.2, e.max_wind_kt / 60 + rng.normal(0, 0.2)), surge_peak_time=str(e.t0), surge_mean_m=0.3,
                tide_at_surge_peak_m=rng.normal(1, .5), tide_max_m=2.5, waterlevel_max_m=3, waterlevel_at_surge_peak_m=2.5))
pd.DataFrame(rows).to_csv(os.path.join(out, 'gtsm_event_station_stats.csv'), index=False)
meta = {}
for i, (lo, la) in enumerate(pts):
    meta[(lo, la)] = dict(district=dist[i % 10], landcover=12 if i % 3 else 14, elevation=max(0.5, rng.normal(4 + (la - 21.9) * 3, 2)),
        hnd=rng.uniform(0, 12) if i % 11 else -9999, jrc=rng.integers(0, 30), dist_coast=max(1, (la - 21.8) * 111000 + rng.normal(0, 3000)),
        dist_water=rng.uniform(100, 15000))
for _, e in ev.iterrows():
    for d in dist:
        rows = []
        for p in pts:
            m0 = meta[p]
            if m0['district'] != d: continue
            dc = m0['dist_coast'] / 1000
            pr = 1 / (1 + np.exp(-(0.03 * e.max_wind_kt - 0.06 * dc - 0.4 * m0['elevation'] + 0.5)))
            nw = rng.uniform(0.1, 0.6) if rng.random() < pr else rng.uniform(0, 0.04)
            sar_ok = e.sar_era == 1 and rng.random() > 0.15
            gfd_ok = e.gfd_era == 1 and rng.random() > 0.3
            rows.append(dict(sid=e.sid, name=e['name'], season=e.season, max_wind_kt=e.max_wind_kt, min_pres_hpa=e.min_pres_hpa,
                min_dist_km=e.min_dist_km, storm_speed_kt=e.storm_speed_kt, coast_on_right_of_track=e.coast_on_right_of_track,
                days_to_syzygy=e.days_to_syzygy, spring_tide_flag=e.spring_tide_flag, sar_era=e.sar_era, gfd_era=e.gfd_era, t0=str(e.t0),
                district=d, lon=p[0], lat=p[1], landcover=m0['landcover'], elevation=m0['elevation'], hnd=m0['hnd'], jrc_occurrence=m0['jrc'],
                dist_coast_m=m0['dist_coast'], dist_water_m=m0['dist_water'],
                post_water=nw + 0.05 if sar_ok else np.nan, pre_water=0.05 if sar_ok else np.nan, new_water=nw if sar_ok else np.nan,
                n_post=2 if sar_ok else 0, n_pre=3 if sar_ok else 0, s1_valid_frac=1.0 if sar_ok else np.nan,
                gfd_flooded=nw if gfd_ok else np.nan, gfd_new_water=nw * 0.9 if gfd_ok else np.nan, gfd_duration_d=3 if gfd_ok else np.nan,
                wind10_max_ms=e.max_wind_kt * 0.4 + rng.normal(0, 1), msl_min_hpa=e.min_pres_hpa))
        pd.DataFrame(rows).to_csv(os.path.join(out, f'agrishift_surge_{e.sid}_{d}.csv'), index=False)
print("wrote", out)
