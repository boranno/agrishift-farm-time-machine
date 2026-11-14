import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  Award
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getModelCardData } from '../../services/modelService';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';

export const ModelEvaluationPage = () => {
  const { t, isBangla } = useTranslation();
  const card = getModelCardData();
  const bench = card.verifiedDroughtBenchmark;

  return (
    <div>
      <PageHeader
        title={t('modelEvaluation.title')}
        subtitle={t('modelEvaluation.subtitle')}
        badge={<DemoBadge text="Verified ML Benchmark" />}
        actions={
          <span className="badge badge-suitable">{isBangla ? 'যাচাইকৃত মডেল v1.0' : 'Verified Benchmark v1.0'}</span>
        }
        helpText={isBangla
          ? 'এগ্রিশিফট প্ল্যাটফর্মের কৃত্রিম বুদ্ধিমত্তা মডেলের আর্কিটেকচার, প্রশিক্ষণ ডেটাসেটের বিবরণ এবং ২০২২–২০২৫ সালের অদেখা তথ্যে যাচাইকৃত ফলাফল এখানে স্বচ্ছভাবে উপস্থাপন করা হয়েছে।'
          : 'Official Model Card detailing leak-free temporal validation, 2022–2025 held-out test benchmarks across 10 Khulna districts, and scientific limitations.'}
      />

      {/* Verified Execution Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '5px solid #16A34A', backgroundColor: '#F0FDF4' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <CheckCircle2 size={22} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: '#14532D', marginBottom: '0.25rem' }}>
              {isBangla
                ? 'খুলনা বিভাগের ১০টি জেলার (২০১৫–২০২৫) নাসা স্যাটেলাইট তথ্যে প্রশিক্ষিত ও যাচাইকৃত'
                : 'Trained & Verified on Real 2015–2025 NASA/GEE Telemetry Across All 10 Khulna Districts'}
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#166534', margin: 0, lineHeight: 1.5 }}>
              {isBangla ? bench.splitSummaryBn : bench.splitSummaryEn}
            </p>
          </div>
        </div>
      </div>

      {/* Model Overview Summary Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Cpu size={18} color="var(--color-primary-800)" />
            <span>{isBangla ? 'মডেল পরিচিতি ও লক্ষ্য' : 'Model Identity & Scope'}</span>
          </h2>
          <span className="badge badge-info">{card.version}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: 'var(--font-size-xs)' }}>
          <div>
            <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
              {t('modelEvaluation.cardModelName')}:
            </span>
            <strong>{isBangla ? card.modelNameBn : card.modelName}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
              {t('modelEvaluation.cardTarget')}:
            </span>
            <strong>{isBangla ? card.targetTaskBn : card.targetTask}</strong>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
              {isBangla ? 'উদ্দিষ্ট ব্যবহারকারী:' : 'Intended Users:'}
            </span>
            <span>{isBangla ? card.intendedUsersBn : card.intendedUsers}</span>
          </div>
        </div>
      </div>

      {/* Target Metric Benchmarks Grid */}
      <div className="grid grid-cols-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #16A34A' }}>
          <div className="card-header">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {isBangla ? '১-মাস খরা শনাক্ত (PR-AUC)' : '1-Month Ahead Drought PR-AUC'}
            </span>
            <span className="badge badge-suitable">{isBangla ? 'যাচাইকৃত' : 'Test 2022-25'}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.25rem' }}>
            PR-AUC = 0.3540
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {isBangla
              ? 'বেস রেটের (০.২১৩৩) তুলনায় +৬৬% নির্ভুল (ROC-AUC = ০.৬৫১২)।'
              : '+66% lift over base rate (0.2133); beats Persistence (0.2620).'}
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #0284C7' }}>
          <div className="card-header">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {isBangla ? 'খরা শনাক্ত হার (Recall)' : 'Drought Early Recall'}
            </span>
            <span className="badge badge-suitable">{isBangla ? 'যাচাইকৃত' : 'Test 2022-25'}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.25rem' }}>
            Recall 60.0% | Brier 0.16
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {isBangla
              ? 'আগামী ১ মাসের ৬০% খরা শনাক্ত করে (F1 = ০.৩৯৪৩)।'
              : 'Catches 60.0% of real agricultural droughts 30 days ahead.'}
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7C3AED' }}>
          <div className="card-header">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {isBangla ? 'ধারাবাহিক ΔVCI রিগ্রেশন' : 'ΔVCI Forecast (MAE)'}
            </span>
            <span className="badge badge-suitable">{isBangla ? 'যাচাইকৃত' : 'Test 2022-25'}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.25rem' }}>
            MAE 24.67 | R² = +0.065
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {isBangla
              ? 'Persistence (MAE ২৯.৪৭) অপেক্ষা ৪.৮ পয়েন্ট কম ত্রুটি।'
              : 'Beats Persistence (MAE 29.47, R² = −0.52) on test years.'}
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #0D9488' }}>
          <div className="card-header">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {isBangla ? 'ঘূর্ণিঝড় জলোচ্ছ্বাস (LOSO)' : 'Surge Inundation (LOSO)'}
            </span>
            <span className="badge badge-suitable">{isBangla ? 'যাচাইকৃত' : '8 Cyclones'}</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.25rem' }}>
            ROC 0.838 | PR 0.279
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {isBangla
              ? 'বাথটাব ফিজিক্স (০.০৯৯) ও উপকূল বেসলাইন (০.০৯৫) অপেক্ষা প্রায় ৩ গুণ বেশি নির্ভুল।'
              : 'Nearly 3x lift over Physics Bathtub (0.098) & Elev/Coast (0.095).'}
          </p>
        </div>
      </div>

      {/* Held-Out Test Leaderboard Tables (2022-2025) */}
      {bench && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <BarChart2 size={18} color="var(--color-primary-800)" />
              <span>
                {isBangla
                  ? 'চূড়ান্ত পরীক্ষার ফলাফল তালিকাপত্র (Test 2022–2025 | 1-Month Ahead)'
                  : 'Held-Out Test Benchmark Leaderboard (Test 2022–2025 | 1-Month Ahead)'}
              </span>
            </h3>
            <span className="badge badge-neutral">pos_rate = 0.2133</span>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-cream)', textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.6rem' }}>Classification Model (drought_vci_roll)</th>
                  <th style={{ padding: '0.6rem' }}>ROC-AUC</th>
                  <th style={{ padding: '0.6rem' }}>PR-AUC</th>
                  <th style={{ padding: '0.6rem' }}>Brier (↓)</th>
                  <th style={{ padding: '0.6rem' }}>F1</th>
                  <th style={{ padding: '0.6rem' }}>Precision</th>
                  <th style={{ padding: '0.6rem' }}>Recall</th>
                  <th style={{ padding: '0.6rem' }}>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {bench.classificationRows.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: r.isChampion ? '#F0FDF4' : 'transparent',
                      fontWeight: r.isChampion ? 'bold' : 'normal'
                    }}
                  >
                    <td style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {r.isChampion && <Award size={14} color="#16A34A" />}
                      <span>{r.model}</span>
                    </td>
                    <td style={{ padding: '0.6rem' }}>{r.roc_auc.toFixed(4)}</td>
                    <td style={{ padding: '0.6rem', color: r.isChampion ? '#15803D' : 'inherit' }}>{r.pr_auc.toFixed(4)}</td>
                    <td style={{ padding: '0.6rem', color: r.isChampion ? '#15803D' : 'inherit' }}>{r.brier.toFixed(4)}</td>
                    <td style={{ padding: '0.6rem' }}>{r.f1.toFixed(4)}</td>
                    <td style={{ padding: '0.6rem' }}>{r.precision.toFixed(4)}</td>
                    <td style={{ padding: '0.6rem' }}>{(r.recall * 100).toFixed(1)}%</td>
                    <td style={{ padding: '0.6rem' }}>{r.threshold.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-cream)', textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.6rem' }}>Continuous VCI Regression (1-Month Ahead vci_roll)</th>
                  <th style={{ padding: '0.6rem' }}>RMSE (↓)</th>
                  <th style={{ padding: '0.6rem' }}>MAE (↓)</th>
                  <th style={{ padding: '0.6rem' }}>R² Score (↑)</th>
                </tr>
              </thead>
              <tbody>
                {bench.regressionRows.map((r, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: r.isChampion ? '#F0FDF4' : 'transparent',
                      fontWeight: r.isChampion ? 'bold' : 'normal'
                    }}
                  >
                    <td style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {r.isChampion && <Award size={14} color="#16A34A" />}
                      <span>{r.model}</span>
                    </td>
                    <td style={{ padding: '0.6rem' }}>{r.rmse.toFixed(4)}</td>
                    <td style={{ padding: '0.6rem', color: r.isChampion ? '#15803D' : 'inherit' }}>{r.mae.toFixed(4)}</td>
                    <td style={{ padding: '0.6rem', color: r.isChampion ? '#15803D' : '#DC2626' }}>
                      {r.r2 > 0 ? `+${r.r2.toFixed(4)}` : r.r2.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verified Cyclone Storm Surge Leave-One-Storm-Out (LOSO) Leaderboard Table */}
      {card.verifiedSurgeBenchmark && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #0D9488' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#0D9488" />
                <span>
                  {isBangla
                    ? 'ঘূর্ণিঝড় জলোচ্ছ্বাস প্লাবন যাচাইকরণ: লিভ-ওয়ান-স্টর্ম-আউট (LOSO ৮টি সাইক্লোন)'
                    : 'Cyclone Storm Surge Inundation: Leave-One-Storm-Out (LOSO 8-Cyclone Benchmark)'}
                </span>
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0' }}>
                {isBangla ? card.verifiedSurgeBenchmark.losoSummaryBn : card.verifiedSurgeBenchmark.losoSummaryEn}
              </p>
            </div>
            <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
              Mean ROC-AUC: {card.verifiedSurgeBenchmark.meanRocAuc.toFixed(4)} | PR-AUC: {card.verifiedSurgeBenchmark.meanPrAuc.toFixed(4)}
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '0.85rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-cream)', textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.55rem' }}>Cyclone Name</th>
                  <th style={{ padding: '0.55rem' }}>Year</th>
                  <th style={{ padding: '0.55rem' }}>Cropland Pixels</th>
                  <th style={{ padding: '0.55rem' }}>Base Rate</th>
                  <th style={{ padding: '0.55rem' }}>LightGBM ROC-AUC</th>
                  <th style={{ padding: '0.55rem' }}>LightGBM PR-AUC (★)</th>
                  <th style={{ padding: '0.55rem' }}>Physics Bathtub PR-AUC</th>
                  <th style={{ padding: '0.55rem' }}>Pixel Hist LOO PR-AUC</th>
                  <th style={{ padding: '0.55rem' }}>Elev x Coast PR-AUC</th>
                  <th style={{ padding: '0.55rem' }}>Precision</th>
                  <th style={{ padding: '0.55rem' }}>Recall</th>
                </tr>
              </thead>
              <tbody>
                {card.verifiedSurgeBenchmark.stormRows.map((s, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: s.pr_auc > 0.35 ? '#F0FDF4' : 'transparent',
                      fontWeight: s.pr_auc > 0.35 ? '600' : 'normal'
                    }}
                  >
                    <td style={{ padding: '0.55rem', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '0.55rem' }}>{s.season}</td>
                    <td style={{ padding: '0.55rem' }}>{s.n_pixels.toLocaleString()}</td>
                    <td style={{ padding: '0.55rem' }}>{(s.pos_rate * 100).toFixed(2)}%</td>
                    <td style={{ padding: '0.55rem' }}>{s.roc_auc.toFixed(4)}</td>
                    <td style={{ padding: '0.55rem', color: '#0D9488', fontWeight: 'bold' }}>
                      {s.pr_auc.toFixed(4)}
                    </td>
                    <td style={{ padding: '0.55rem', color: 'var(--color-text-muted)' }}>
                      {s.bathtub_pr_auc.toFixed(4)}
                    </td>
                    <td style={{ padding: '0.55rem', color: 'var(--color-text-muted)' }}>
                      {s.hist_pix_pr_auc.toFixed(4)}
                    </td>
                    <td style={{ padding: '0.55rem', color: 'var(--color-text-muted)' }}>
                      {s.elev_coast_pr_auc.toFixed(4)}
                    </td>
                    <td style={{ padding: '0.55rem' }}>
                      {s.precision > 0 ? `${(s.precision * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ padding: '0.55rem' }}>
                      {s.recall > 0 ? `${(s.recall * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-cream)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--color-primary-900)' }}>
              {isBangla ? 'বৈজ্ঞানিক পর্যালোচনা ও বেঞ্চমার্ক বিজয়: ' : 'Key Benchmark Finding: '}
            </strong>
            {isBangla
              ? '৮টি ঐতিহাসিক ঘূর্ণিঝড়ে গড় PR-AUC = ০.২৭৮৮ (বনাম ফিজিক্স বাথটাবের ০.০৯৮৫ এবং এলিভেশন বেসলাইনের ০.০৯৫২)। বিশেষ করে অতি-গুরুতর সাইক্লোন রিমাল ২০২৪ (ROC-AUC ০.৯৫৪৫, PR-AUC ০.৫৯৯৭, Precision ৯৩.০%) এবং রোয়ানু ২০১৬ (ROC-AUC ০.৯৫২৪, PR-AUC ০.৬৪৬০, Precision ৯৭.৩%)-এ মডেলটি ৯৩%+ নির্ভুলতায় প্লাবিত ক্রপল্যান্ড শনাক্ত করেছে।'
              : 'Our regularized LightGBM (Mean PR-AUC = 0.2788) nearly triples domain physics baselines: Bathtub Overtopping (0.0985) and Static Elevation x Coastline (0.0952). For major severe cyclones like Remal (2024: ROC-AUC 0.9545, PR-AUC 0.5997, Precision 93.0%) and Roanu (2016: ROC-AUC 0.9524, PR-AUC 0.6460, Precision 97.3%), the model detects inundated coastal cropland with 93%+ precision on held-out storms.'}
          </div>
        </div>
      )}

      {/* Verified Flood & Root-Zone Waterlogging Benchmark Leaderboard */}
      {card.verifiedFloodBenchmark && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #2563EB' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#2563EB" />
                <span>
                  {isBangla
                    ? 'প্লাবন ও জলাবদ্ধতা পূর্বাভাস: সেন্টিনেল-১ SAR ও ERA5-Land (৪.২১ লাখ+ অদেখা টেস্ট সারি)'
                    : 'Flood & Root-Zone Waterlogging: Sentinel-1 SAR & ERA5-Land (421k+ Held-Out Test Rows)'}
                </span>
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0' }}>
                {isBangla ? card.verifiedFloodBenchmark.summaryBn : card.verifiedFloodBenchmark.summaryEn}
              </p>
            </div>
            <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
              Task A ROC 0.938 | Task B ROC 0.972
            </span>
          </div>

          {/* Task A: SAR Surface Inundation Table */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#1E40AF', marginBottom: '0.4rem' }}>
              {isBangla
                ? 'টাস্ক এ: সেন্টিনেল-১ সারফেস প্লাবন ১-মাস অগ্রিম পূর্বাভাস (Task A: SAR Inundation +1 Mo)'
                : 'Task A: Sentinel-1 SAR Surface Inundation (+1 Month Ahead | pos_rate = 0.0421)'}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-cream)', textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '0.55rem' }}>Model / Benchmark</th>
                    <th style={{ padding: '0.55rem' }}>ROC-AUC</th>
                    <th style={{ padding: '0.55rem' }}>PR-AUC</th>
                    <th style={{ padding: '0.55rem' }}>Brier (↓)</th>
                    <th style={{ padding: '0.55rem' }}>F1 Score</th>
                    <th style={{ padding: '0.55rem' }}>Precision</th>
                    <th style={{ padding: '0.55rem' }}>Recall</th>
                    <th style={{ padding: '0.55rem' }}>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {card.verifiedFloodBenchmark.taskA_Inundation1Mo.map((r, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: r.isChampion ? '#EFF6FF' : 'transparent',
                        fontWeight: r.isChampion ? 'bold' : 'normal'
                      }}
                    >
                      <td style={{ padding: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {r.isChampion && <Award size={14} color="#2563EB" />}
                        <span>{r.model}</span>
                      </td>
                      <td style={{ padding: '0.55rem' }}>{r.roc_auc.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem', color: r.isChampion ? '#1E40AF' : 'inherit' }}>{r.pr_auc.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem', color: r.isChampion ? '#1E40AF' : 'inherit' }}>{r.brier.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem' }}>{r.f1.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem' }}>{(r.precision * 100).toFixed(1)}%</td>
                      <td style={{ padding: '0.55rem' }}>{(r.recall * 100).toFixed(1)}%</td>
                      <td style={{ padding: '0.55rem' }}>{r.thr.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Task B: Root-Zone Soil Waterlogging Table */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginBottom: '0.4rem' }}>
              {isBangla
                ? 'টাস্ক বি: শিকড় অঞ্চলের মাটির জলাবদ্ধতা ১-মাস অগ্রিম পূর্বাভাস (Task B: Root-Zone Waterlogging +1 Mo)'
                : 'Task B: Root-Zone Soil Saturation Waterlogging (+1 Month Ahead | pos_rate = 0.1666)'}
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-cream)', textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: '0.55rem' }}>Model / Benchmark</th>
                    <th style={{ padding: '0.55rem' }}>ROC-AUC</th>
                    <th style={{ padding: '0.55rem' }}>PR-AUC</th>
                    <th style={{ padding: '0.55rem' }}>Brier (↓)</th>
                    <th style={{ padding: '0.55rem' }}>F1 Score</th>
                    <th style={{ padding: '0.55rem' }}>Precision</th>
                    <th style={{ padding: '0.55rem' }}>Recall</th>
                    <th style={{ padding: '0.55rem' }}>Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {card.verifiedFloodBenchmark.taskB_Waterlogging1Mo.map((r, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: r.isChampion ? '#F0FDF4' : 'transparent',
                        fontWeight: r.isChampion ? 'bold' : 'normal'
                      }}
                    >
                      <td style={{ padding: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {r.isChampion && <Award size={14} color="#16A34A" />}
                        <span>{r.model}</span>
                      </td>
                      <td style={{ padding: '0.55rem' }}>{r.roc_auc.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem', color: r.isChampion ? '#15803D' : 'inherit' }}>{r.pr_auc.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem', color: r.isChampion ? '#15803D' : 'inherit' }}>{r.brier.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem' }}>{r.f1.toFixed(4)}</td>
                      <td style={{ padding: '0.55rem' }}>{(r.precision * 100).toFixed(1)}%</td>
                      <td style={{ padding: '0.55rem' }}>{(r.recall * 100).toFixed(1)}%</td>
                      <td style={{ padding: '0.55rem' }}>{r.thr.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-cream)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--color-primary-900)' }}>
              {isBangla ? 'বৈজ্ঞানিক পর্যালোচনা ও বেঞ্চমার্ক বিজয়: ' : 'Key Benchmark Finding: '}
            </strong>
            {isBangla
              ? 'সেন্টিনেল-১ সারফেস প্লাবনে আমাদের মডেল ROC-AUC = ০.৯৩৭৮ এবং PR-AUC = ০.৪৭৩৮ অর্জন করে (পারসিসটেন্সের ০.২১০৫ অপেক্ষা দ্বিগুণের বেশি)। শিকড় অঞ্চলের জলাবদ্ধতায় মডেলটি ROC-AUC = ০.৯৭১৫, PR-AUC = ০.৮৭২৬, F1 = ০.৮০০৪ এবং Precision = ৮৫.৪% নিয়ে ক্লাইমাটোলজির চেয়ে ব্যাপক ব্যবধানে এগিয়ে রয়েছে।'
              : 'For SAR Surface Inundation, LightGBM achieves ROC-AUC = 0.9378 and PR-AUC = 0.4738 (+125% over Persistence 0.2105). For Root-Zone Waterlogging, LightGBM dominates with ROC-AUC = 0.9715, PR-AUC = 0.8726, F1 = 0.8004, and Precision = 85.4% (vs Climatology PR-AUC 0.6155 and Brier 0.0503 vs 0.0894).'}
          </div>
        </div>
      )}

      {/* Validation Strategy & Training Sources */}
      <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Database size={18} color="var(--color-primary-800)" />
              <span>{isBangla ? 'নাসা এবং উপগ্রহ ডেটাসেট পাইপলাইন' : 'NASA & Satellite Training Data Pipeline'}</span>
            </h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
            {(isBangla ? card.plannedTrainingSourcesBn : card.plannedTrainingSources).map((src, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                <CheckCircle2 size={14} color="var(--color-primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{src}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck size={18} color="var(--color-primary-800)" />
              <span>{t('modelEvaluation.validationStrategy')}</span>
            </h3>
          </div>
          <div style={{
            backgroundColor: 'var(--color-bg-cream)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            fontSize: 'var(--font-size-xs)',
            lineHeight: 1.6
          }}>
            <strong>{isBangla ? card.validationStrategy.methodBn : card.validationStrategy.method}</strong>
            <p style={{ margin: '0.35rem 0 0 0', color: 'var(--color-text-on-cream)' }}>
              {isBangla ? card.validationStrategy.descriptionBn : card.validationStrategy.descriptionEn}
            </p>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {isBangla
              ? 'উপকূলীয় ও অভ্যন্তরীণ ১০টি জেলার স্থানিক নির্ভরতা (Spatial Autocorrelation) এবং সময়ের লিকেজ দূর করতে মডেলটি কঠোর কালিক ও জেলাভিত্তিক পদ্ধতিতে যাচাই করা হয়েছে।'
              : 'Standard random K-fold CV leaks temporal and spatial proximity. Our strict 2015–2020 Train / 2021 Val / 2022–2025 Test split guarantees zero look-ahead leakage.'}
          </p>
        </div>
      </div>

      {/* Known Limitations Accordion / Cards */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="var(--color-marginal-dot)" />
          <span>{t('modelEvaluation.knownLimitations')}</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {card.knownScientificLimitations.map(lim => (
            <div
              key={lim.id}
              style={{
                backgroundColor: 'var(--color-bg-main)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)'
              }}
            >
              <strong style={{ color: 'var(--color-primary-900)', display: 'block', marginBottom: '0.2rem' }}>
                {isBangla ? lim.titleBn : lim.titleEn}
              </strong>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {isBangla ? lim.descBn : lim.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelEvaluationPage;
