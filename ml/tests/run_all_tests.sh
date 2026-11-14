#!/usr/bin/env bash
# Runs every local-testable notebook script on synthetic data. Earth Engine notebooks (01, 04, 06) and the Copernicus
# download in 05 need real accounts and are NOT covered here. Needs: pandas numpy scipy scikit-learn lightgbm pyarrow matplotlib xarray
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; SRC="$HERE/.."; T="$(mktemp -d)"; export MPLBACKEND=Agg
echo "== drought: 02 build, 03 diagnostics/training =="
python "$HERE/make_synthetic_drought.py" "$T/drought_in"
AGRI_INPUT="$T/drought_in" AGRI_OUT="$T/drought_out" python "$SRC/02_build_dataset.py" > "$T/02.log"
AGRI_OUT="$T/drought_out" python "$SRC/03_diagnostics_and_training.py" > "$T/03.log"
echo "== flood / waterlogging: 07 build, 08 diagnostics/training =="
python "$HERE/make_synthetic_flood.py" "$T/flood_in"
FLOOD_IN="$T/flood_in" FLOOD_OUT="$T/flood_out" python "$SRC/07_build_flood_dataset.py" > "$T/07.log"
FLOOD_OUT="$T/flood_out" python "$SRC/08_flood_diagnostics_and_training.py" > "$T/08.log"
echo "== storm events: 05 (IBTrACS selection only) =="
python "$HERE/make_synthetic_ibtracs.py" "$T/ibtracs.csv"
IBTRACS_SRC="$T/ibtracs.csv" SURGE_OUT="$T/surge_events" python "$SRC/05_storm_events_and_surge.py" > "$T/05.log"
echo "== storm surge: 09 build, 10 diagnostics/training =="
python "$HERE/make_synthetic_surge.py" "$T/surge_in"
SURGE_IN="$T/surge_in" SURGE_BUILD_OUT="$T/surge_out" python "$SRC/09_build_surge_dataset.py" > "$T/09.log"
SURGE_BUILD_OUT="$T/surge_out" python "$SRC/10_surge_diagnostics_and_training.py" > "$T/10.log"
echo "All scripts ran. Logs are in $T"
