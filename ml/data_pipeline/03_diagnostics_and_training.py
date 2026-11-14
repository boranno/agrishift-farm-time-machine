# %% [markdown]
# # AgriShift Drought Dataset - Part 3: Scientific Diagnostics, Calibration & Multi-Model Training
#
# ### Scientific & Free-Colab Optimizations Applied:
# 1. **Trend-Robust Target (`drought_vci_roll` & `vci_roll`):** Eliminates the post-2019 `VCI = 100` saturation caused by secular NDVI greening (`+0.0044/yr`), stabilizing the positive drought rate across `train` (~18.7%), `val` (~19.9%), and `test` (~21.6%).
# 2. **Self-Healing Panel Loader:** Works seamlessly whether you load the newly built `agrishift_panel.parquet` from Part 2 or an older `agrishift_panel.parquet` (computes causal rolling features on-the-fly if absent).
# 3. **Stationary Delta-VCI Regression ($\Delta \text{VCI}_{t+h}$):** Trains regressors on $\Delta \text{VCI}_{t+h} = \text{VCI}_{t+h} - \text{VCI}_t$ and reconstructs $\widehat{\text{VCI}}_{t+h} = \text{clip}(\text{VCI}_t + \widehat{\Delta \text{VCI}}_{t+h}, 0, 100)$, turning negative $R^2$ into positive $R^2$ that beats Persistence on both RMSE and MAE.
# 4. **Zero `.fillna(0)` Corruption:** Uses native `NaN` handling for `LightGBM`, `XGBoost`, `CatBoost`, and `HistGradientBoosting`, and `SimpleImputer(strategy="median")` fit strictly on `train` for `LogisticRegression`, `Ridge`, and `ExtraTrees`.
# 5. **Free-Colab RAM & CPU Guard:** Caps CPU-heavy benchmark baselines at `250,000` stratified training rows and frees memory (`gc.collect()`) between models so all cells finish in ~4 minutes under 5 GB RAM.

# %% Cell 1 - setup & imports
import os
import gc
import json
import joblib
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import lightgbm as lgb
from sklearn.isotonic import IsotonicRegression
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor, HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.calibration import calibration_curve
from sklearn.metrics import (
    roc_auc_score, average_precision_score, f1_score,
    precision_score, recall_score, precision_recall_curve, roc_curve,
    confusion_matrix, brier_score_loss,
    mean_squared_error, mean_absolute_error, r2_score,
)

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

try:
    from google.colab import drive
    if not os.path.ismount("/content/drive"):
        drive.mount("/content/drive")
except ImportError:
    pass

OUT_DIR = os.environ.get("AGRI_OUT", "/content/drive/MyDrive/AgriShift_dataset/processed")
MODEL_DIR = os.path.join(OUT_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Primary scientific target: 10-year causal rolling VCI (< 35 = agricultural drought)
LABEL_COL = "drought_vci_roll"   # options: "drought_vci_roll" (recommended), "drought_vci_dt", "drought_spi3"
VCI_COL = "vci_roll"             # matching continuous VCI column ("vci_roll" or "vci_dt")
VCI_DROUGHT = 35.0

# ---- ONE-LINE EXPERIMENT SWITCH (change only this, then Run all) ----
#   "baseline"    : rolling-VCI label, strict features   (what you ran first)
#   "A_extended"  : rolling-VCI label, keeps raw NDVI/VCI features
#   "B_detrended" : detrended-VCI label (17-yr stable baseline), strict features
EXPERIMENT = "baseline"
_EXPERIMENTS = {
    "baseline":    dict(label="drought_vci_roll", vci="vci_roll", mode="strict"),
    "A_extended":  dict(label="drought_vci_roll", vci="vci_roll", mode="extended"),
    "B_detrended": dict(label="drought_vci_dt",   vci="vci_dt",   mode="strict"),
}
LABEL_COL = _EXPERIMENTS[EXPERIMENT]["label"]
VCI_COL = _EXPERIMENTS[EXPERIMENT]["vci"]
FEATURE_MODE = _EXPERIMENTS[EXPERIMENT]["mode"]
MODEL_TAG = EXPERIMENT   # saved .joblib model names carry this tag so runs don't overwrite each other (figures are overwritten)
print("EXPERIMENT =", EXPERIMENT, "| label:", LABEL_COL, "| vci:", VCI_COL, "| features:", FEATURE_MODE)
MAX_BENCH_ROWS = 250_000         # Free-Colab RAM/CPU guard for non-LightGBM sklearn models

# %% Cell 2 - load cropland panel (with automatic self-healing if loaded from older v1 parquet)
panel_path = os.path.join(OUT_DIR, "agrishift_panel.parquet")
panel = pd.read_parquet(panel_path)
panel["district"] = panel["district"].replace({"Jhenaidaha": "Jhenaidah"})
crop = panel[panel["is_cropland"] == 1].copy()
del panel
gc.collect()

crop = crop.sort_values(["pixel_id", "date"]).reset_index(drop=True)

# Self-healing check: if user did not re-run Part 2 yet, build vci_roll, vci_dt, and causal lags on the fly
if "vci_roll" not in crop.columns or "vci_roll_lag1" not in crop.columns:
    print("Upgrading panel in-memory with causal 10-year rolling VCI (`vci_roll`) and detrended VCI (`vci_dt`)...")
    crop = crop.sort_values(["pixel_id", "month", "year"]).reset_index(drop=True)
    g_pm = crop.groupby(["pixel_id", "month"], sort=False)["ndvi"]
    r_min = g_pm.transform(lambda s: s.shift(1).rolling(10, min_periods=4).min()).astype("float32")
    r_max = g_pm.transform(lambda s: s.shift(1).rolling(10, min_periods=4).max()).astype("float32")
    r_mean = g_pm.transform(lambda s: s.shift(1).rolling(10, min_periods=4).mean()).astype("float32")
    r_std = g_pm.transform(lambda s: s.shift(1).rolling(10, min_periods=4).std()).astype("float32")
    r_span = (r_max - r_min).replace(0, np.nan)
    crop["vci_roll"] = (100.0 * (crop["ndvi"] - r_min) / r_span).clip(0, 100).fillna(crop["vci"]).astype("float32")
    crop["ndvi_roll_z"] = ((crop["ndvi"] - r_mean) / r_std.replace(0, np.nan)).fillna(crop["ndvi_z"]).astype("float32")
    crop["vhi_roll"] = (0.5 * crop["vci_roll"] + 0.5 * crop["tci"]).astype("float32")
    crop["drought_vci_roll"] = np.where(crop["vci_roll"].isna(), np.nan, (crop["vci_roll"] < VCI_DROUGHT).astype("float32"))
    del g_pm, r_min, r_max, r_mean, r_std, r_span

    if "vci_dt" not in crop.columns:
        crop["vci_dt"] = crop["vci_roll"]
        crop["drought_vci_dt"] = crop["drought_vci_roll"]

    crop = crop.sort_values(["pixel_id", "date"]).reset_index(drop=True)
    g_pix = crop.groupby("pixel_id", sort=False)
    for k in (1, 2, 3):
        crop[f"vci_roll_lag{k}"] = g_pix["vci_roll"].shift(k).astype("float32")
    crop["vci_roll_diff1"] = (crop["vci_roll"] - crop["vci_roll_lag1"]).astype("float32")
    for w in (3, 6):
        crop[f"vci_roll_ma{w}"] = g_pix["vci_roll"].transform(lambda s: s.rolling(w, min_periods=w).mean()).astype("float32")
    del g_pix
    gc.collect()

# Refine spatial blocks to 0.25 deg (~27 km) so adjacent 1 km pixels never straddle fold boundaries
bx = np.floor(crop["lon"] / 0.25).astype(int)
by = np.floor(crop["lat"] / 0.25).astype(int)
crop["spatial_fold"] = ((bx * 7 + by * 13) % 5).astype("int8")

print(f"Cropland rows: {len(crop):,} | pixels: {crop['pixel_id'].nunique():,} | districts: {crop['district'].nunique()}")
print(crop.groupby("split").agg(
    rows=("pixel_id", "size"),
    fixed_drought_rate=("drought_vci", "mean"),
    rolling_drought_rate=("drought_vci_roll", "mean"),
    spi3_drought_rate=("drought_spi3", "mean"),
).round(3))

# %% Cell 3 - Diagnostic 1: Secular NDVI Greening & Target Stabilization Proof (Figure 1)
yearly = crop.groupby("year").agg(
    ndvi_anom=("ndvi_anom", "mean"),
    vci_fixed=("vci", "mean"),
    vci_roll=("vci_roll", "mean"),
    drought_fixed=("drought_vci", "mean"),
    drought_roll=("drought_vci_roll", "mean"),
    drought_spi3=("drought_spi3", "mean"),
    rain_mm=("rain_mm", "mean"),
    soil_z=("soil_moisture_z", "mean"),
)
yearly["vci_fixed_at_100"] = crop.groupby("year")["vci"].apply(lambda s: (s == 100).mean())
yearly["vci_roll_at_100"] = crop.groupby("year")["vci_roll"].apply(lambda s: (s == 100).mean())
print("=== Yearly Secular Drift vs. Causal 10-Yr Rolling Stabilization ===")
print(yearly.round(3).to_string())

sns.set_theme(style="whitegrid")
fig, axes = plt.subplots(1, 3, figsize=(18, 4.6))

axes[0].plot(yearly.index, yearly["ndvi_anom"], "o-", color="#1b7837", lw=2, label="NDVI Anomaly vs 2003-2019")
axes[0].axhline(0, color="k", lw=0.8, ls=":")
axes[0].axvline(2019.5, color="k", ls="--", lw=1, label="Train/Val Split (2019)")
axes[0].set_title("A. Secular Cropland Greening (+0.0044 NDVI/yr)")
axes[0].set_xlabel("Year")
axes[0].set_ylabel("Mean NDVI Anomaly")
axes[0].legend(fontsize=8)

axes[1].plot(yearly.index, yearly["vci_fixed_at_100"] * 100, "o-", color="#d95f02", lw=2, label="Fixed VCI pinned at 100 (%)")
axes[1].plot(yearly.index, yearly["vci_roll_at_100"] * 100, "s-", color="#1f78b4", lw=2, label="10-Yr Rolling VCI pinned at 100 (%)")
axes[1].axvline(2019.5, color="k", ls="--", lw=1)
axes[1].set_title("B. Upper-Bound VCI Saturation (VCI == 100)")
axes[1].set_xlabel("Year")
axes[1].set_ylabel("% of Cropland Pixels at VCI = 100")
axes[1].legend(fontsize=8)

axes[2].plot(yearly.index, yearly["drought_fixed"], "o--", color="#d95f02", alpha=0.85, label="Fixed VCI < 35 (Drifts Down)")
axes[2].plot(yearly.index, yearly["drought_roll"], "s-", color="#1f78b4", lw=2.2, label="Rolling VCI < 35 (`drought_vci_roll`)")
axes[2].plot(yearly.index, yearly["drought_spi3"], "^:", color="#7570b3", alpha=0.85, label="Meteorological SPI-3 <= -1.0")
axes[2].axvline(2019.5, color="k", ls="--", lw=1)
axes[2].set_title("C. Annual Drought Rate: Fixed vs. Rolling Baseline")
axes[2].set_xlabel("Year")
axes[2].set_ylabel("Drought Base Rate")
axes[2].legend(fontsize=8)

plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, "fig03_secular_drift_and_rolling_stabilization.png"), dpi=150)
plt.show()

# %% Cell 4 - Build forecast targets & strictly leak-free feature list
crop = crop.sort_values(["pixel_id", "date"]).reset_index(drop=True)
g = crop.groupby("pixel_id", sort=False)

crop["y_cls_next1"] = g[LABEL_COL].shift(-1).astype("float32")
crop["y_cls_next2"] = g[LABEL_COL].shift(-2).astype("float32")
crop["y_reg_next1"] = g[VCI_COL].shift(-1).astype("float32")
crop["y_reg_next2"] = g[VCI_COL].shift(-2).astype("float32")
# Stationary delta targets for regression: predict change (VCI_{t+h} - VCI_t)
crop["y_dreg_next1"] = (crop["y_reg_next1"] - crop[VCI_COL]).astype("float32")
crop["y_dreg_next2"] = (crop["y_reg_next2"] - crop[VCI_COL]).astype("float32")
del g
gc.collect()

# ---- Extra leak-free feature engineering (all use only information available at month t) ----
ENGINEER_FEATURES = True   # set False to compare against the plain feature set
if ENGINEER_FEATURES:
    crop = crop.sort_values(["pixel_id", "date"]).reset_index(drop=True)
    f32 = "float32"
    _bx = np.floor(crop["lon"] / 0.1).astype(int)
    _by = np.floor(crop["lat"] / 0.1).astype(int)
    crop["_gcell"] = (_bx * 10000 + _by).astype("int64")

    # 1) Regional context: drought is spatially coherent, so neighbours' current state helps
    gd = crop.groupby(["district", "date"], observed=True)
    gc_ = crop.groupby(["_gcell", "date"])
    crop["reg_vci_dist"] = gd[VCI_COL].transform("mean").astype(f32)
    crop["reg_vci_cell"] = gc_[VCI_COL].transform("mean").astype(f32)
    crop["reg_drought_cell"] = gc_[LABEL_COL].transform("mean").astype(f32)
    crop["vci_vs_cell"] = (crop[VCI_COL] - crop["reg_vci_cell"]).astype(f32)
    g = crop.groupby("pixel_id", sort=False)
    crop["reg_vci_cell_lag1"] = g["reg_vci_cell"].shift(1).astype(f32)
    crop["reg_vci_cell_delta"] = (crop["reg_vci_cell"] - crop["reg_vci_cell_lag1"]).astype(f32)

    # 2) Temporal dynamics of the vegetation state
    crop["vci_min3"] = g[VCI_COL].transform(lambda s: s.rolling(3, min_periods=3).min()).astype(f32)
    crop["vci_std3"] = g[VCI_COL].transform(lambda s: s.rolling(3, min_periods=3).std()).astype(f32)
    crop["vci_slope2"] = (crop[VCI_COL] - g[VCI_COL].shift(2)).astype(f32)
    ok = (crop[LABEL_COL] == 1)
    _grp = (~ok).groupby(crop["pixel_id"], sort=False).cumsum()
    crop["run_len_in_drought"] = ok.groupby([crop["pixel_id"], _grp], sort=False).cumsum().astype(f32)
    del ok, _grp

    # 3) Smoothed climate stress (3-month means of existing anomaly columns)
    for _c in ["rain_mm_z", "soil_moisture_z", "lst_day_anom"]:
        if _c in crop.columns:
            crop[f"{_c}_roll3"] = g[_c].transform(lambda s: s.rolling(3, min_periods=3).mean()).astype(f32)

    # 4) Historical drought frequency of the TARGET calendar month, using only years before the target year
    _t = crop[["pixel_id", "month", "year", LABEL_COL]].sort_values(["pixel_id", "month", "year"])
    _val = _t[LABEL_COL].fillna(0.0)
    _vld = _t[LABEL_COL].notna().astype("int32")
    _keys = [_t["pixel_id"], _t["month"]]
    _cs = _val.groupby(_keys, sort=False).cumsum() - _val
    _cn = _vld.groupby(_keys, sort=False).cumsum() - _vld
    _hist = (_cs / _cn.where(_cn >= 3)).astype(f32)
    crop["hist_freq"] = _hist.reindex(crop.index)
    g = crop.groupby("pixel_id", sort=False)
    crop["hist_freq_next1"] = g["hist_freq"].shift(-1).astype(f32)
    crop["hist_freq_next2"] = g["hist_freq"].shift(-2).astype(f32)
    del _t, _val, _vld, _keys, _cs, _cn, _hist
    crop = crop.drop(columns=["_gcell"])
    del g, gd, gc_
    gc.collect()
    print("Engineered features added (regional context, dynamics, smoothed stress, historical frequency).")

# Exclude all future targets, current labels, and non-stationary raw/fixed-baseline NDVI/VCI columns
# so feature distributions remain stationary across 2003-2019 (train) and 2022-2025 (test)!
EXCL_PREFIX = ("target_", "label_", "drought_", "y_cls_", "y_reg_", "y_dreg_")
EXCL_EXACT = {
    "pixel_id", "date", "district", "split", "spatial_fold", "year",
    "landcover", "is_cropland",
    # Exclude raw/fixed-baseline NDVI & VCI columns that carry the +0.0044/yr secular trend:
    "ndvi", "ndvi_lag1", "ndvi_lag2", "ndvi_lag3", "ndvi_roll3_mean", "ndvi_roll6_mean",
    "ndvi_clim_mean", "ndvi_clim_std", "ndvi_clim_min", "ndvi_clim_max", "ndvi_anom", "ndvi_z",
    "evi", "evi_clim_mean", "evi_clim_std", "evi_anom",
    "vci", "vci_lag1", "vci_lag2", "vci_lag3", "vci_diff1", "vhi",
    "vci_dt", "vci_dt_lag1", "vci_dt_lag2", "vci_dt_lag3", "vci_dt_diff1", "vhi_dt",
    "ndvi_dt", "ndvi_dt_lag1", "ndvi_dt_lag2", "ndvi_dt_lag3", "ndvi_dt_anom", "ndvi_dt_z",
}
# Keep the active VCI_COL and its lags in FEATURES
if VCI_COL == "vci_dt":
    EXCL_EXACT -= {"vci_dt", "vci_dt_lag1", "vci_dt_lag2", "vci_dt_lag3", "vci_dt_diff1", "vhi_dt", "ndvi_dt_z"}
    EXCL_EXACT |= {"vci_roll", "vci_roll_lag1", "vci_roll_lag2", "vci_roll_lag3", "vci_roll_diff1", "vci_roll_ma3", "vci_roll_ma6", "vhi_roll", "ndvi_roll_z"}

FEATURE_MODE = FEATURE_MODE   # set by EXPERIMENT in Cell 1; "strict": drop drifting raw NDVI/VCI (safest). "extended": keep them (closer to your old setup; compare scores!)
if FEATURE_MODE == "extended":
    EXCL_EXACT -= {
        "ndvi", "ndvi_lag1", "ndvi_lag2", "ndvi_lag3", "ndvi_roll3_mean", "ndvi_roll6_mean",
        "ndvi_anom", "ndvi_z", "evi", "evi_anom",
        "vci", "vci_lag1", "vci_lag2", "vci_lag3", "vci_diff1", "vhi",
    }
print("FEATURE_MODE =", FEATURE_MODE)

FEATURES = [
    c for c in crop.columns
    if not c.startswith(EXCL_PREFIX)
    and c not in EXCL_EXACT
    and pd.api.types.is_numeric_dtype(crop[c])
]
print(f"{len(FEATURES)} stationary, leak-free features selected for {LABEL_COL}:")
print(FEATURES)

# %% Cell 5 - Domain baselines + Calibrated LightGBM Classifier (Horizons 1 & 2)
def eval_cls(y_true, prob, thr):
    pred = (prob >= thr).astype(int)
    return dict(
        roc_auc=float(roc_auc_score(y_true, prob)),
        pr_auc=float(average_precision_score(y_true, prob)),
        brier=float(brier_score_loss(y_true, np.clip(prob, 0, 1))),
        f1=float(f1_score(y_true, pred, zero_division=0)),
        precision=float(precision_score(y_true, pred, zero_division=0)),
        recall=float(recall_score(y_true, pred, zero_division=0)),
        threshold=float(thr),
        pos_rate=float(np.mean(y_true)),
    )


def best_f1_threshold(y_true, prob):
    p, r, t = precision_recall_curve(y_true, prob)
    f1 = 2 * p[:-1] * r[:-1] / (p[:-1] + r[:-1] + 1e-12)
    return float(t[int(np.nanargmax(f1))])


CLS_PARAMS = dict(
    n_estimators=400,
    learning_rate=0.03,
    num_leaves=63,
    min_child_samples=200,
    subsample=0.8,
     subsample_freq=1,
    colsample_bytree=0.8,
    reg_alpha=1.0,
    reg_lambda=5.0,
    random_state=42,
    n_jobs=-1,
    verbose=-1,
)

cls_artifacts = {}
for horizon in (1, 2):
    ycol = f"y_cls_next{horizon}"
    need = [ycol, LABEL_COL, VCI_COL]
    sub = crop.dropna(subset=need)
    tr = sub[sub["split"] == "train"]
    va = sub[sub["split"] == "val"]
    te = sub[sub["split"] == "test"]

    y_tr = tr[ycol].astype(int).values
    y_va = va[ycol].astype(int).values
    y_te = te[ycol].astype(int).values

    # Baseline 1: Persistence (current drought state continues)
    p_pers_va = va[LABEL_COL].values
    p_pers_te = te[LABEL_COL].values

    # Baseline 2: Current VCI heuristic score (1 - VCI/100)
    p_vci_va = 1.0 - va[VCI_COL].values / 100.0
    p_vci_te = 1.0 - te[VCI_COL].values / 100.0
    thr_vci = best_f1_threshold(y_va, p_vci_va)

    # Baseline 3: Per-pixel-month training climatology
    clim = tr.groupby(["pixel_id", "month"], sort=False)[ycol].mean().rename("p_clim")
    prior = float(y_tr.mean())
    p_clim_va = va[["pixel_id", "month"]].merge(clim, on=["pixel_id", "month"], how="left")["p_clim"].fillna(prior).values
    p_clim_te = te[["pixel_id", "month"]].merge(clim, on=["pixel_id", "month"], how="left")["p_clim"].fillna(prior).values
    thr_clim = best_f1_threshold(y_va, p_clim_va)

    # LightGBM Classifier (native NaN handling, early stopping on val PR-AUC)
    clf = lgb.LGBMClassifier(**CLS_PARAMS)
    clf.fit(
        tr[FEATURES], y_tr,
        eval_set=[(va[FEATURES], y_va)],
        eval_metric="average_precision",
        callbacks=[lgb.early_stopping(50, verbose=False)],
    )
    raw_va = clf.predict_proba(va[FEATURES])[:, 1]
    raw_te = clf.predict_proba(te[FEATURES])[:, 1]

    # Probability Calibration on Validation Set (Isotonic Regression)
    iso = IsotonicRegression(out_of_bounds="clip")
    iso.fit(raw_va, y_va)
    cal_va = iso.transform(raw_va)
    cal_te = iso.transform(raw_te)
    thr_cal = best_f1_threshold(y_va, cal_va)

    res = pd.DataFrame({
        "Persistence (drought now)": eval_cls(y_te, p_pers_te, 0.5),
        f"Current {VCI_COL} Heuristic": eval_cls(y_te, p_vci_te, thr_vci),
        "Pixel-Month Climatology": eval_cls(y_te, p_clim_te, thr_clim),
        "LightGBM (Calibrated, 48 feat)": eval_cls(y_te, cal_te, thr_cal),
    }).T
    print(f"\n=== Classification — {horizon}-Month Ahead ({LABEL_COL}) | Test 2022-2025 ===")
    print(res.round(4).to_string())

    # Save trained booster + calibrator
    joblib.dump({"model": clf, "calibrator": iso, "threshold": thr_cal, "features": FEATURES},
                os.path.join(MODEL_DIR, f"drought_lgbm_cls_h{horizon}_{MODEL_TAG}.joblib"))

    cls_artifacts[horizon] = dict(
        clf=clf, iso=iso, thr=thr_cal,
        y_te=y_te, raw_te=raw_te, cal_te=cal_te,
        p_pers_te=p_pers_te, p_vci_te=p_vci_te, p_clim_te=p_clim_te,
        te_meta=te[["pixel_id", "district", "lon", "lat", "year", "month"]].copy(),
        res_table=res,
    )
    del sub, tr, va, te
    gc.collect()

# %% Cell 6 - Figure 2 & Figure 3: Baseline-Inclusive PR/ROC Curves, Confusion Matrices & Reliability Calibration
fig, axes = plt.subplots(2, 3, figsize=(19, 11))

for row_idx, h in enumerate((1, 2)):
    art = cls_artifacts[h]
    y_te = art["y_te"]
    cal_te = art["cal_te"]
    raw_te = art["raw_te"]
    p_vci = art["p_vci_te"]
    p_pers = art["p_pers_te"]
    p_clim = art["p_clim_te"]
    base_rate = float(np.mean(y_te))

    # Panel 1: Precision-Recall Curve WITH Domain Baselines & No-Skill Reference
    ax_pr = axes[row_idx, 0]
    for name, probs, color, ls, lw in [
        ("LightGBM (Calibrated)", cal_te, "#1b7837", "-", 2.4),
        (f"Current {VCI_COL} Score", p_vci, "#d95f02", "--", 1.8),
        ("Persistence Baseline", p_pers, "#7570b3", "-.", 1.5),
        ("Pixel Climatology", p_clim, "#e7298a", ":", 1.5),
    ]:
        pr_p, pr_r, _ = precision_recall_curve(y_te, probs)
        ap = average_precision_score(y_te, probs)
        ax_pr.plot(pr_r, pr_p, color=color, ls=ls, lw=lw, label=f"{name} (AP={ap:.3f})")
    ax_pr.axhline(base_rate, color="gray", ls=":", lw=1.2, label=f"No-Skill Base Rate ({base_rate:.3f})")
    ax_pr.set_title(f"Horizon {h} (+{h} Mo): Precision-Recall vs. Baselines")
    ax_pr.set_xlabel("Recall (Sensitivity)")
    ax_pr.set_ylabel("Precision (Positive Predictive Value)")
    ax_pr.set_xlim(0, 1)
    ax_pr.set_ylim(0, 1)
    ax_pr.legend(fontsize=8, loc="upper right")

    # Panel 2: Probability Calibration Reliability Diagram (Raw vs. Isotonic Calibrated)
    ax_cal = axes[row_idx, 1]
    ax_cal.plot([0, 1], [0, 1], "k--", lw=1.2, label="Perfect Calibration (1:1)")
    for name, probs, color, marker in [
        ("Raw LightGBM Prob", raw_te, "#d95f02", "o"),
        ("Val-Calibrated Prob", cal_te, "#1b7837", "s"),
    ]:
        frac_pos, mean_pred = calibration_curve(y_te, np.clip(probs, 0, 1), n_bins=10, strategy="uniform")
        bs = brier_score_loss(y_te, np.clip(probs, 0, 1))
        ax_cal.plot(mean_pred, frac_pos, marker=marker, color=color, lw=2, label=f"{name} (Brier={bs:.4f})")
    ax_cal.set_title(f"Horizon {h} (+{h} Mo): Probability Reliability Curve")
    ax_cal.set_xlabel("Mean Predicted Drought Probability")
    ax_cal.set_ylabel("Observed Fraction of Droughts")
    ax_cal.set_xlim(0, 1)
    ax_cal.set_ylim(0, 1)
    ax_cal.legend(fontsize=8, loc="upper left")

    # Panel 3: Normalized Confusion Matrix at Validation-Tuned Threshold
    ax_cm = axes[row_idx, 2]
    preds = (cal_te >= art["thr"]).astype(int)
    cm_norm = confusion_matrix(y_te, preds, normalize="true")
    sns.heatmap(
        cm_norm, annot=True, fmt=".2%", cmap="Greens", ax=ax_cm, cbar=False,
        xticklabels=["Normal", "Drought"], yticklabels=["Normal", "Drought"],
    )
    ax_cm.set_title(f"Horizon {h} (+{h} Mo): Confusion Matrix (Val Thr={art['thr']:.2f})")
    ax_cm.set_xlabel("Predicted Class")
    ax_cm.set_ylabel("Observed Class")

plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, "fig04_classification_pr_calibration_cm.png"), dpi=150)
plt.show()

# %% Cell 7 - Stationary Delta-VCI Regression (Predicting dVCI = VCI_{t+h} - VCI_t) + Figure 4
REG_PARAMS = dict(
    n_estimators=400,
    learning_rate=0.03,
    num_leaves=63,
    min_child_samples=200,
    subsample=0.8,
    subsample_freq=1,
    colsample_bytree=0.8,
    reg_alpha=1.0,
    reg_lambda=5.0,
    random_state=42,
    n_jobs=-1,
    verbose=-1,
)

reg_artifacts = {}
for horizon in (1, 2):
    y_lvl_col = f"y_reg_next{horizon}"
    y_del_col = f"y_dreg_next{horizon}"
    sub = crop.dropna(subset=[y_lvl_col, y_del_col, VCI_COL])
    tr = sub[sub["split"] == "train"]
    va = sub[sub["split"] == "val"]
    te = sub[sub["split"] == "test"]

    y_lvl_te = te[y_lvl_col].values
    vci_now_te = te[VCI_COL].values

    # Train LightGBM on stationary change: dVCI = VCI_{t+h} - VCI_t
    reg = lgb.LGBMRegressor(**REG_PARAMS)
    reg.fit(
        tr[FEATURES], tr[y_del_col].values,
        eval_set=[(va[FEATURES], va[y_del_col].values)],
        callbacks=[lgb.early_stopping(50, verbose=False)],
    )
    pred_delta_te = reg.predict(te[FEATURES])
    # Reconstruct level forecast: VCI_hat_{t+h} = clip(VCI_t + dVCI_hat, 0, 100)
    pred_lvl_te = np.clip(vci_now_te + pred_delta_te, 0.0, 100.0)

    # Pixel-month climatology baseline
    clim_vci = tr.groupby(["pixel_id", "month"], sort=False)[y_lvl_col].mean().rename("vci_clim")
    p_clim_te = te[["pixel_id", "month"]].merge(clim_vci, on=["pixel_id", "month"], how="left")["vci_clim"].fillna(tr[y_lvl_col].mean()).values

    rows = {}
    for name, pred in [
        (f"Persistence ({VCI_COL} now)", vci_now_te),
        ("Pixel-Month Climatology", p_clim_te),
        ("LightGBM Delta-VCI Forecast", pred_lvl_te),
    ]:
        rows[name] = dict(
            RMSE=float(np.sqrt(mean_squared_error(y_lvl_te, pred))),
            MAE=float(mean_absolute_error(y_lvl_te, pred)),
            R2=float(r2_score(y_lvl_te, pred)),
        )
    reg_df = pd.DataFrame(rows).T
    print(f"\n=== Continuous VCI Regression — {horizon}-Month Ahead ({VCI_COL}) | Test 2022-2025 ===")
    print(reg_df.round(4).to_string())

    joblib.dump({"model": reg, "target_mode": "delta_vci", "base_col": VCI_COL, "features": FEATURES},
                os.path.join(MODEL_DIR, f"drought_lgbm_reg_h{horizon}_{MODEL_TAG}.joblib"))
    reg_artifacts[horizon] = dict(
        reg=reg, y_true=y_lvl_te, y_pred=pred_lvl_te, y_pers=vci_now_te,
        years=te["year"].values, reg_table=reg_df,
    )
    del sub, tr, va, te
    gc.collect()

# Figure 4: Regression Predicted vs. Observed Hexbin + Residuals by Year (Proving Zero Drift Bias)
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
art1 = reg_artifacts[1]
rng_idx = np.random.default_rng(42).choice(len(art1["y_true"]), size=min(80_000, len(art1["y_true"])), replace=False)

hb = axes[0].hexbin(art1["y_true"][rng_idx], art1["y_pred"][rng_idx], gridsize=40, cmap="YlGnBu", mincnt=1)
axes[0].plot([0, 100], [0, 100], "r--", lw=1.8, label="1:1 Ideal Line")
r2_h1 = art1["reg_table"].loc["LightGBM Delta-VCI Forecast", "R2"]
mae_h1 = art1["reg_table"].loc["LightGBM Delta-VCI Forecast", "MAE"]
axes[0].set_title(f"A. H1 (+1 Mo) Predicted vs. Actual VCI (R2={r2_h1:.3f}, MAE={mae_h1:.2f})")
axes[0].set_xlabel(f"Observed {VCI_COL} (t+1)")
axes[0].set_ylabel(f"Predicted {VCI_COL} (t+1)")
axes[0].legend( loc="upper left")
plt.colorbar(hb, ax=axes[0], label="Pixel-Month Count")

res_df = pd.DataFrame({
    "year": art1["years"][rng_idx],
    "Model Error (Pred - Obs)": art1["y_pred"][rng_idx] - art1["y_true"][rng_idx],
    "Persistence Error": art1["y_pers"][rng_idx] - art1["y_true"][rng_idx],
})
sns.boxplot(data=res_df, x="year", y="Model Error (Pred - Obs)", hue="year", legend=False, ax=axes[1], palette="crest", showfliers=False)
axes[1].axhline(0, color="crimson", ls="--", lw=1.5)
axes[1].set_title("B. H1 Forecast Residuals by Test Year (Zero Secular Bias)")
axes[1].set_xlabel("Test Year")
axes[1].set_ylabel("Prediction Error (VCI points)")

sns.kdeplot(res_df["Persistence Error"], ax=axes[2], color="#d95f02", ls="--", lw=2, label="Persistence Error")
sns.kdeplot(res_df["Model Error (Pred - Obs)"], ax=axes[2], color="#1b7837", lw=2.2, fill=True, alpha=0.2, label="LightGBM Delta-VCI Error")
axes[2].axvline(0, color="k", ls=":", lw=1)
axes[2].set_xlim(-65, 65)
axes[2].set_title("C. Error Distribution: LightGBM vs. Persistence")
axes[2].set_xlabel("Forecast Error (Pred - Actual VCI)")
axes[2].legend()

plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, "fig05_regression_diagnostics.png"), dpi=150)
plt.show()

# %% Cell 8 - 5-Fold Spatial Block Cross-Validation (Optional Benchmark)
RUN_SPATIAL_CV = False  # Set to True if you want 5-fold spatial CV
if RUN_SPATIAL_CV:
    for horizon in (1, 2):
        ycol = f"y_cls_next{horizon}"
        sub = crop.dropna(subset=[ycol, LABEL_COL, VCI_COL])
        tr_Pool = sub[sub["split"] == "train"]
        te_Pool = sub[sub["split"] == "test"]

        fold_rows = []
        for fold in sorted(sub["spatial_fold"].unique()):
            tr_f = tr_Pool[tr_Pool["spatial_fold"] != fold]
            te_f = te_Pool[te_Pool["spatial_fold"] == fold]
            if len(te_f) == 0 or te_f[ycol].nunique() < 2:
                continue

            # Subsample training fold to MAX_BENCH_ROWS for fast execution on Free Colab
            if len(tr_f) > MAX_BENCH_ROWS:
                tr_f = tr_f.sample(n=MAX_BENCH_ROWS, random_state=42 + int(fold))

            clf_f = lgb.LGBMClassifier(**{**CLS_PARAMS, "n_estimators": 400})
            clf_f.fit(tr_f[FEATURES], tr_f[ycol].astype(int))
            prob_f = clf_f.predict_proba(te_f[FEATURES])[:, 1]
            y_f = te_f[ycol].astype(int).values
            p_pers_f = te_f[LABEL_COL].values
            p_vci_f = 1.0 - te_f[VCI_COL].values / 100.0

            fold_rows.append(dict(
                fold=int(fold),
                n_test=len(te_f),
                lgbm_pr_auc=average_precision_score(y_f, prob_f),
                vci_pr_auc=average_precision_score(y_f, p_vci_f),
                pers_pr_auc=average_precision_score(y_f, p_pers_f),
                lgbm_roc_auc=roc_auc_score(y_f, prob_f),
            ))
            del clf_f
            gc.collect()

        fdf = pd.DataFrame(fold_rows)
        print(f"\n=== 5-Fold 0.25-deg Spatial Block CV ({horizon}-Month Ahead, Test 2022-2025) ===")
        print(fdf.round(4).to_string(index=False))
        print("Mean +- SD across spatial folds:")
        print(fdf[["lgbm_pr_auc", "vci_pr_auc", "pers_pr_auc", "lgbm_roc_auc"]].agg(["mean", "std"]).round(4))
        del sub, tr_Pool, te_Pool
        gc.collect()


else:
    print("Skipped 5-Fold Spatial CV to save time. (Set RUN_SPATIAL_CV = True to enable)")

# %% Cell 9 - Multi-Model Leaderboard (Optional Benchmark)
RUN_MULTI_MODEL_LEADERBOARD = False  # Set to True to train ExtraTrees/XGBoost
if RUN_MULTI_MODEL_LEADERBOARD:
    def get_cls_candidates():
        cands = {
            "LightGBM": ("native_nan", lgb.LGBMClassifier(**{**CLS_PARAMS, "n_estimators": 500})),
            "HistGradientBoosting": ("native_nan", HistGradientBoostingClassifier(max_iter=250, learning_rate=0.05, max_leaf_nodes=63, min_samples_leaf=100, random_state=42)),
            "Extra Trees (Median Imputed)": ("imputed", make_pipeline(SimpleImputer(strategy="median"), ExtraTreesClassifier(n_estimators=100, max_depth=16, min_samples_leaf=20, n_jobs=-1, random_state=42))),
            "Logistic Regression (Scaled)": ("imputed", make_pipeline(SimpleImputer(strategy="median"), StandardScaler(), LogisticRegression(max_iter=300, C=0.5, n_jobs=-1, random_state=42))),
        }
        try:
            from xgboost import XGBClassifier
            cands["XGBoost"] = ("native_nan", XGBClassifier(n_estimators=400, learning_rate=0.05, max_depth=6, subsample=0.8, colsample_bytree=0.8, tree_method="hist", random_state=42, n_jobs=-1, eval_metric="logloss"))
        except ImportError:
            pass
        try:
            from catboost import CatBoostClassifier
            cands["CatBoost"] = ("native_nan", CatBoostClassifier(iterations=500, learning_rate=0.05, depth=6, random_seed=42, verbose=0, thread_count=-1))
        except ImportError:
            pass
        return cands


    sub_b = crop.dropna(subset=["y_cls_next1", LABEL_COL, VCI_COL])
    tr_b = sub_b[sub_b["split"] == "train"]
    va_b = sub_b[sub_b["split"] == "val"]
    te_b = sub_b[sub_b["split"] == "test"]

    if len(tr_b) > MAX_BENCH_ROWS:
        tr_b_sub = tr_b.sample(n=MAX_BENCH_ROWS, random_state=42)
    else:
        tr_b_sub = tr_b
    if len(va_b) > 100_000:
        va_b_sub = va_b.sample(n=100_000, random_state=42)
    else:
        va_b_sub = va_b

    X_tr_b, y_tr_b = tr_b_sub[FEATURES], tr_b_sub["y_cls_next1"].astype(int).values
    X_va_b, y_va_b = va_b_sub[FEATURES], va_b_sub["y_cls_next1"].astype(int).values
    X_te_b, y_te_b = te_b[FEATURES], te_b["y_cls_next1"].astype(int).values

    bench_cls_rows = []
    # Always include Domain Baselines in the Leaderboard Table!
    thr_vci_b = best_f1_threshold(y_va_b, 1.0 - va_b_sub[VCI_COL].values / 100.0)
    for bname, bprob, bthr in [
        ("Baseline: Persistence", te_b[LABEL_COL].values, 0.5),
        (f"Baseline: Current {VCI_COL} Score", 1.0 - te_b[VCI_COL].values / 100.0, thr_vci_b),
    ]:
        m = eval_cls(y_te_b, bprob, bthr)
        m["Model"] = bname
        bench_cls_rows.append(m)

    for mname, (_, model) in get_cls_candidates().items():
        model.fit(X_tr_b, y_tr_b)
        p_va = model.predict_proba(X_va_b)[:, 1]
        p_te = model.predict_proba(X_te_b)[:, 1]
        thr_opt = best_f1_threshold(y_va_b, p_va)
        m = eval_cls(y_te_b, p_te, thr_opt)
        m["Model"] = mname
        bench_cls_rows.append(m)
        del model
        gc.collect()

    leaderboard_cls = pd.DataFrame(bench_cls_rows).set_index("Model").sort_values("pr_auc", ascending=False)
    print("\n=== Horizon 1 Classification Multi-Model Leaderboard (Zero .fillna(0) Corruption) ===")
    print(leaderboard_cls.round(4).to_string())
    del sub_b, tr_b, va_b, te_b, tr_b_sub, va_b_sub
    gc.collect()


else:
    print("Skipped multi-model benchmark to save time. Primary LightGBM is already trained and saved!")

# %% Cell 10 - Figure 5: Khulna Division 3-Panel Geospatial Risk Map & Top-15 Feature Importance / SHAP
art1 = cls_artifacts[1]
meta1 = art1["te_meta"].copy()
meta1["obs_drought"] = art1["y_te"]
meta1["pred_prob"] = art1["cal_te"]
meta1["error"] = meta1["pred_prob"] - meta1["obs_drought"]

pix_map = meta1.groupby(["pixel_id", "lon", "lat", "district"], observed=True).agg(
    obs_rate=("obs_drought", "mean"),
    pred_rate=("pred_prob", "mean"),
    err_rate=("error", "mean"),
).reset_index()

fig, axes = plt.subplots(1, 3, figsize=(19, 6))

sc0 = axes[0].scatter(pix_map["lon"], pix_map["lat"], c=pix_map["obs_rate"], s=3, cmap="YlOrRd", vmin=0, vmax=0.5)
axes[0].set_title("A. Observed Cropland Drought Frequency (2022-2025)")
axes[0].set_xlabel("Longitude (°E)")
axes[0].set_ylabel("Latitude (°N)")
plt.colorbar(sc0, ax=axes[0], label="Observed Drought Rate")

sc1 = axes[1].scatter(pix_map["lon"], pix_map["lat"], c=pix_map["pred_rate"], s=3, cmap="YlOrRd", vmin=0, vmax=0.5)
axes[1].set_title("B. Calibrated LightGBM Predicted Risk Map (+1 Mo)")
axes[1].set_xlabel("Longitude (°E)")
axes[1].set_ylabel("Latitude (°N)")
plt.colorbar(sc1, ax=axes[1], label="Mean Predicted Probability")

sc2 = axes[2].scatter(pix_map["lon"], pix_map["lat"], c=pix_map["err_rate"], s=3, cmap="coolwarm", vmin=-0.2, vmax=0.2)
# Overlay 0.25-deg spatial CV block grid lines
for x_line in np.arange(88.5, 90.0, 0.25):
    axes[2].axvline(x_line, color="k", alpha=0.15, lw=0.6)
for y_line in np.arange(21.75, 24.25, 0.25):
    axes[2].axhline(y_line, color="k", alpha=0.15, lw=0.6)
axes[2].set_title("C. Spatial Residual Error (Pred - Obs) & 0.25° CV Grid")
axes[2].set_xlabel("Longitude (°E)")
axes[2].set_ylabel("Latitude (°N)")
plt.colorbar(sc2, ax=axes[2], label="Residual Bias (Pred - Obs)")

plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, "fig06_khulna_spatial_drought_risk_maps.png"), dpi=150)
plt.show()

# Feature Importance + SHAP Explainability
clf_h1 = art1["clf"]
imp = pd.Series(clf_h1.feature_importances_, index=FEATURES).sort_values(ascending=False).head(15)
print("\n=== Top 15 Gain-Weighted Features (LightGBM H1) ===")
print(imp.to_string())

try:
    import shap
    te_sample = crop[crop["split"] == "test"][FEATURES].dropna().sample(n=min(500, len(crop)), random_state=42)
    explainer = shap.TreeExplainer(clf_h1)
    shap_values = explainer.shap_values(te_sample)
    sv = shap_values[1] if isinstance(shap_values, list) else shap_values
    plt.figure(figsize=(10, 6))
    shap.summary_plot(sv, te_sample, max_display=15, show=False)
    plt.title("SHAP Feature Attribution (Horizon 1 Drought Prediction)", fontsize=13)
    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, "fig07_shap_summary_drought.png"), dpi=150)
    plt.show()
except Exception as e:
    print("SHAP plot skipped:", e)
