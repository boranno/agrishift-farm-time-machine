import React, { useState } from 'react';
import {
  Gauge,
  CalendarDays,
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import { localizeFarmValue } from '../../utils/farmDisplay';
import { getSalinityPredictionSpec } from '../../services/modelService';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import ModelUnavailableBanner from '../../components/common/ModelUnavailableBanner';

export const SalinityPredictionPage = () => {
  const { t, isBangla } = useTranslation();
  const { farm, soil, season, setSeason } = useFarm();
  const [selectedDate, setSelectedDate] = useState('2026-10-27');
  const [salinityDataset, setSalinityDataset] = useState('model');
  const [salinityYear, setSalinityYear] = useState(2025);
  const [failedSalinityMapUrl, setFailedSalinityMapUrl] = useState(null);

  const spec = getSalinityPredictionSpec();
  const salinityYears = salinityDataset === 'model'
    ? [2025, 2030, 2035, 2040, 2045, 2050]
    : [2000, 2009, 2023];
  const salinityMapUrl = salinityDataset === 'model'
    ? `https://www.mit.edu/~eltahirgroup/DST_SoilSalinity/data/soil_salinity_${salinityYear}.png`
    : `https://www.mit.edu/~eltahirgroup/DST_SoilSalinity/data/observed_soil_salinity_${salinityYear}.png`;

  return (
    <div>
      <PageHeader
        title={t('salinityPrediction.title')}
        subtitle={`${localizeFarmValue(farm?.upazila || 'Dacope', isBangla)}, ${localizeFarmValue(farm?.district || 'Khulna', isBangla)} — ${localizeFarmValue(farm?.aez || 'AEZ 13', isBangla)}`}
        badge={<DemoBadge text="Feature 12" />}
        helpText={isBangla
          ? 'নাসার উপগ্রহ উপাত্ত ও এসআরডিআই মাটির তথ্যকে কাজে লাগিয়ে মাটির লবণাক্ততা (ইসি) পূর্বাভাসের এই ইন্টারফেসটি তৈরি করা হয়েছে। মডেলের প্রশিক্ষণ সম্পন্ন হলে এখানে স্বয়ংক্রিয় পূর্বাভাস প্রদর্শিত হবে।'
          : 'High-resolution topsoil electrical conductivity (ECe) prediction interface. Connects satellite surface moisture with regional hydrological variables.'}
      />

      <section
        className="card"
        aria-labelledby="mit-salinity-projection-title"
        style={{ marginBottom: '1.5rem' }}
      >
        <div className="card-header">
          <h2 className="card-title" id="mit-salinity-projection-title">
            <Layers size={18} color="var(--color-primary-800)" />
            <span>{t('salinityPrediction.mitProjectionTitle')}</span>
          </h2>
          <span className="badge badge-neutral">
            {t(salinityDataset === 'model'
              ? 'salinityPrediction.modeledResearchBadge'
              : 'salinityPrediction.observedResearchBadge')}
          </span>
        </div>

        <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: '1rem' }}>
          {t('salinityPrediction.mitProjectionDescription')}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.35rem', fontSize: 'var(--font-size-xs)' }}>
            <span>{t('salinityPrediction.mapDatasetLabel')}</span>
            <select
              className="form-select"
              value={salinityDataset}
              onChange={event => {
                const nextDataset = event.target.value;
                setSalinityDataset(nextDataset);
                setSalinityYear(nextDataset === 'model' ? 2025 : 2023);
              }}
            >
              <option value="model">{t('salinityPrediction.modeledDataset')}</option>
              <option value="observed">{t('salinityPrediction.observedDataset')}</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '0.35rem', fontSize: 'var(--font-size-xs)' }}>
            <span>{t('salinityPrediction.mapYearLabel')}</span>
            <select
              className="form-select"
              value={salinityYear}
              onChange={event => setSalinityYear(Number(event.target.value))}
            >
              {salinityYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '1rem'
        }}>
          <span className="badge badge-neutral">
            {t(salinityDataset === 'model'
              ? 'salinityPrediction.mitProjectionYears'
              : 'salinityPrediction.mitObservedYears')}
          </span>
          {salinityDataset === 'model' && (
            <span className="badge badge-neutral">
              {t('salinityPrediction.mitProjectionScenario')}
            </span>
          )}
          <span className="badge badge-neutral">
            {t('salinityPrediction.mitProjectionUnit')}
          </span>
        </div>

        <div style={{
          backgroundColor: '#F3F4F6',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '0.75rem'
        }}>
          {failedSalinityMapUrl === salinityMapUrl ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>{t('salinityPrediction.mapUnavailable')}</p>
              <a href={salinityMapUrl} target="_blank" rel="noopener noreferrer">
                {t('salinityPrediction.openSelectedMap')}
              </a>
            </div>
          ) : (
            <img
              key={salinityMapUrl}
              src={salinityMapUrl}
              alt={`${t(salinityDataset === 'model'
                ? 'salinityPrediction.modeledMapAlt'
                : 'salinityPrediction.observedMapAlt')} ${salinityYear}`}
              onError={() => setFailedSalinityMapUrl(salinityMapUrl)}
              style={{ display: 'block', width: '100%', maxHeight: '480px', objectFit: 'contain' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span style={{
            width: 'min(240px, 55vw)',
            height: '12px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(90deg, #08306b, #2171b5, #41ab5d, #fdd835, #fb8c00, #c62828)'
          }} aria-hidden="true" />
          <span style={{ fontSize: 'var(--font-size-xs)' }}>
            {t('salinityPrediction.mapLegend')}
          </span>
        </div>

        <p style={{ fontSize: 'var(--font-size-xs)', marginBottom: '1rem' }}>
          {t('salinityPrediction.mapLocationContext')}{' '}
          <strong>{localizeFarmValue(farm?.upazila || 'Dacope', isBangla)}, {localizeFarmValue(farm?.district || 'Khulna', isBangla)}</strong>
        </p>

        <div className="callout callout-info" style={{ marginBottom: '1rem' }}>
          <Info size={18} />
          <span>{t(salinityDataset === 'model'
            ? 'salinityPrediction.mitProjectionDisclaimer'
            : 'salinityPrediction.mitObservedDisclaimer')}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <a
            className="btn btn-primary"
            href="https://www.mit.edu/~eltahirgroup/DST_SoilSalinity/index.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            <span>{t('salinityPrediction.openMitExplorer')}</span>
          </a>
          <a
            className="btn btn-secondary"
            href={salinityMapUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            <span>{t('salinityPrediction.openSelectedMap')}</span>
          </a>
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '0.75rem' }}>
          {t('salinityPrediction.mitProjectionAttribution')}
        </p>
      </section>

      {/* Prominent Honest Model Unavailable Banner */}
      <ModelUnavailableBanner
        title={t('salinityPrediction.modelStatusBanner')}
        message={isBangla ? spec.messageBn : spec.messageEn}
        plannedPhase="Part 2 & 3 Backend Integration"
      />

      {/* Selection Filters */}
      <div className="card" style={{
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        backgroundColor: 'var(--color-bg-cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MapPin size={18} color="var(--color-primary-800)" />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
            {localizeFarmValue(farm?.upazila, isBangla)}, {localizeFarmValue(farm?.district, isBangla)} ({Number(farm?.latitude).toFixed(4)}°N, {Number(farm?.longitude).toFixed(4)}°E)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CalendarDays size={16} color="var(--color-text-secondary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: 'var(--font-size-xs)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {['rabi', 'kharif1', 'kharif2'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSeason(s)}
                className="btn btn-sm"
                style={{
                  backgroundColor: season === s ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
                  color: season === s ? '#fff' : 'var(--color-text-main)',
                  fontSize: '11px',
                  padding: '0.25rem 0.55rem'
                }}
              >
                {s === 'rabi' ? 'Rabi' : s === 'kharif1' ? 'Kharif-1' : 'Kharif-2'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Required Pipeline Inputs Status Checklist */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Database size={18} color="var(--color-primary-800)" />
            <span>{t('salinityPrediction.pipelineInputs')}</span>
          </h2>
          <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
            Telemetry Readiness Checklist
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {spec.requiredPipelineInputs.map((input, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-main)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <div>
                <strong>{isBangla ? input.sourceBn : input.source}: </strong>
                <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? input.parameterBn : input.parameter}</span>
              </div>

              <div>
                {input.ready ? (
                  <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
                    <CheckCircle2 size={12} />
                    <span>{isBangla ? input.statusBn : input.status}</span>
                  </span>
                ) : (
                  <span className="badge badge-marginal" style={{ fontSize: '11px' }}>
                    <Clock size={12} />
                    <span>{isBangla ? input.statusBn : input.status}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output Specification Visual Container (Placeholder without fake numbers) */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <Gauge size={18} color="var(--color-primary-800)" />
            <span>{t('salinityPrediction.expectedOutput')}</span>
          </h2>
          <span className="badge badge-demo">{isBangla ? 'ইউআই কাঠামোর নমুনা' : 'UI Schema Representation'}</span>
        </div>

        <div style={{
          backgroundColor: '#F8FAF7',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#E5E7EB',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Gauge size={24} />
          </div>

          <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-main)', marginBottom: '0.4rem' }}>
            {isBangla ? 'পূর্বাভাস পাত্র — মডেল আউটপুটের অপেক্ষায়' : 'Prediction Container — Awaiting Live Inference Model'}
          </h3>

          <p style={{ fontSize: 'var(--font-size-xs)', maxWidth: '520px', margin: '0 auto 1.25rem auto' }}>
            {t('salinityPrediction.unitContext')}
          </p>

          {/* Planned Output Schema Preview */}
          <div style={{
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            textAlign: 'left',
            backgroundColor: 'var(--color-bg-surface)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-xs)'
          }}>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>{isBangla ? 'লক্ষ্য চলক:' : 'Target Variable:'}</span>
              <strong>{isBangla ? 'ECe (dS/m, ২৫°সে)' : 'ECe (dS/m at 25°C)'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>{isBangla ? 'নির্ভরযোগ্যতার সীমা:' : 'Confidence Interval:'}</span>
              <strong>{isBangla ? '৯৫% (±০.৮ dS/m)' : '95% CI (±0.8 dS/m)'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>{isBangla ? 'লবণাক্ততার ঝুঁকির স্তর:' : 'Salinity Risk Tier:'}</span>
              <strong>{isBangla ? 'ক্রমভিত্তিক শ্রেণি' : 'Ordinal Category'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Model Architecture & Benchmarking Target Details */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--color-primary-800)" />
          <span>{isBangla ? 'মডেল আর্কিটেকচার ও মূল্যায়ন প্রোটোকল' : 'Model Architecture & Evaluation Protocols'}</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: 'var(--font-size-xs)', lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>
            {t('salinityPrediction.targetArchitecture')}
          </p>
          <div style={{
            backgroundColor: 'var(--color-bg-cream)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)'
          }}>
            <strong>{isBangla ? 'লক্ষ্যমাত্রা নির্ভুলতা বেঞ্চমার্ক: ' : 'Target Accuracy Benchmark: '}</strong>
            {t('salinityPrediction.benchmarkTarget')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalinityPredictionPage;
