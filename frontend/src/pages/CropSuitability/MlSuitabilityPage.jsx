import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getMlSuitabilityExplainability } from '../../services/modelService';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import ModelUnavailableBanner from '../../components/common/ModelUnavailableBanner';

export const MlSuitabilityPage = () => {
  const { t, isBangla } = useTranslation();
  const mlSpec = getMlSuitabilityExplainability();

  return (
    <div>
      <PageHeader
        title={t('mlSuitability.title')}
        subtitle={t('mlSuitability.subtitle')}
        badge={<DemoBadge text="Feature 13" />}
        actions={
          <Link to="/crop-suitability" className="btn btn-secondary btn-sm">
            <span>{isBangla ? 'বৈজ্ঞানিক নিয়মভিত্তিক ভিউ দেখুন' : 'View Rule-Based Recommendations'}</span>
            <ArrowRight size={14} />
          </Link>
        }
        helpText={isBangla
          ? 'এই স্ক্রিনটি মাল্টি-ভেরিয়েট কৃত্রিম বুদ্ধিমত্তা মডেলের জন্য প্রস্তুত করা হয়েছে যা উপগ্রহ চিত্র ও মাটির ল্যাব ডেটা একত্রিত করে ফসলের উপযোগিতা মূল্যায়ন করবে।'
          : 'Multi-variate algorithmic assessment combining remote sensing, soil chemistry, and micro-climate indicators.'}
      />

      {/* Model Under Development Banner */}
      <ModelUnavailableBanner
        title={t('mlSuitability.statusBanner')}
        message={t('mlSuitability.statusDesc')}
        plannedPhase="Part 3 (Model Training & Inference API)"
      />

      {/* Distinction notice between Rule-based and ML */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--font-size-xs)', color: '#0369A1', lineHeight: 1.6 }}>
            <strong>{isBangla ? 'নিয়মভিত্তিক বনাম কৃত্রিম বুদ্ধিমত্তা মডেলের পার্থক্য: ' : 'Rule-Based vs ML Synthesis Architecture: '}</strong>
            {isBangla
              ? 'বর্তমানে ফসল উপযোগিতা পাতায় বারি/ব্রি-র নির্ধারিত সুস্পষ্ট বৈজ্ঞানিক নিয়ম (Heuristic Thresholds) ব্যবহৃত হচ্ছে। এই পাতায় ভবিষ্যৎ মেশিন লার্নিং মডেলের প্রভাবক বিশ্লেষণ (Explainable SHAP factor weights) প্রদর্শিত হয়েছে।'
              : 'The Crop Suitability page currently uses transparent BARI/BRRI agronomic rules. This interface is structured for the upcoming multi-variate ML model, which introduces continuous non-linear stress interactions.'}
          </div>
        </div>
      </div>

      {/* Explainable AI (SHAP-style) Factor Weights Breakdown Container */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <BarChart3 size={18} color="var(--color-primary-800)" />
            <span>{t('mlSuitability.factorBreakdownTitle')}</span>
          </h2>
          <span className="badge badge-demo">{isBangla ? 'পরিকল্পিত SHAP কাঠামো' : 'Planned SHAP Architecture'}</span>
        </div>

        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          {t('mlSuitability.previewNotice')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mlSpec.factorWeightsPreview.map((f, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: '600' }}>
                  {isBangla ? f.factorBn : f.factorEn}
                </span>
                <span style={{ color: 'var(--color-primary-800)', fontWeight: 'bold' }}>
                  {f.weight}% {isBangla ? 'প্রভাব' : 'weight'}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#E5E7EB', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  width: `${f.weight}%`,
                  height: '100%',
                  backgroundColor: idx === 0 ? '#14532D' : idx === 1 ? '#22A06B' : idx === 2 ? '#3B82F6' : '#F59E0B'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Factor Layer Stack Visualization Container */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--color-primary-800)" />
          <span>{isBangla ? 'সমন্বিত ৪-স্তরীয় ডেটা পাইপলাইন' : '4-Tier Ingestion Matrix'}</span>
        </h3>

        <div className="grid grid-cols-4" style={{ fontSize: 'var(--font-size-xs)' }}>
          <div style={{ backgroundColor: 'var(--color-bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong>{isBangla ? '১. মাটির লবণাক্ততার স্তর' : '1. Soil salinity level'}</strong>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>{isBangla ? 'এসআরডিআই-এর মাঠপর্যায়ের পরীক্ষা ও উপগ্রহের অনুমান' : 'SRDI ground tests and satellite estimates'}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong>{isBangla ? '২. মাটির গঠন ও অম্লমান' : '2. Soil texture and acidity'}</strong>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>{isBangla ? 'পিএইচ, জৈব পদার্থ ও পুষ্টি উপাদান' : 'pH, organic matter, and nutrients'}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong>{isBangla ? '৩. উপগ্রহ থেকে মাটির আর্দ্রতা' : '3. Satellite soil moisture'}</strong>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>{isBangla ? 'নাসা SMAP-এর ৩৬ কিমি আর্দ্রতার সময়ভিত্তিক তথ্য' : 'NASA SMAP 36 km soil-moisture time series'}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <strong>{isBangla ? '৪. আবহাওয়া ও তাপমাত্রা' : '4. Weather and temperature'}</strong>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>{isBangla ? 'নাসা GPM বৃষ্টিপাত ও POWER তাপমাত্রার তথ্য' : 'NASA GPM rainfall and POWER temperature data'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MlSuitabilityPage;
