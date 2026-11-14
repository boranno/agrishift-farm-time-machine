"""Synthetic IBTrACS-style CSV (with the units row IBTrACS has as line 2). Usage: python make_synthetic_ibtracs.py OUT.csv
Three storms: one that should be selected (Amphan-like), one too far away, one too weak."""
import sys
import numpy as np, pandas as pd
rows = []
def storm(sid, name, season, start, lat0, lon0, dlat, dlon, wind0, n=24):
    t = pd.Timestamp(start)
    for k in range(n):
        rows.append(dict(SID=sid, SEASON=season, NAME=name, ISO_TIME=(t + pd.Timedelta(hours=3 * k)).strftime('%Y-%m-%d %H:%M:%S'),
            LAT=lat0 + dlat * k, LON=lon0 + dlon * k, TRACK_TYPE='main', DIST2LAND=100, LANDFALL=100,
            WMO_WIND=wind0 - abs(k - 12), WMO_PRES=990 - (wind0 - abs(k - 12)), USA_WIND=' ', USA_PRES=' ', STORM_SPEED=10, STORM_DIR=0))
storm('A2020', 'AMPHAN', 2020, '2020-05-19 12:00', 19.0, 88.5, 0.25, 0.05, 100)
storm('F2019', 'FARAWAY', 2019, '2019-11-01 00:00', 12.0, 92.0, 0.1, 0.0, 60)
storm('W2018', 'WEAK', 2018, '2018-06-10 00:00', 19.0, 89.5, 0.25, 0.0, 25)
df = pd.DataFrame(rows); units = pd.DataFrame([{c: 'x' for c in df.columns}])
with open(sys.argv[1], 'w') as f:
    df.head(0).to_csv(f, index=False); units.to_csv(f, index=False, header=False); df.to_csv(f, index=False, header=False)
print("wrote", sys.argv[1])
