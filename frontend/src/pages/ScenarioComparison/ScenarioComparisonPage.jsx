import React, { useState } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Droplets,
  ShieldAlert,
  Sprout,
  Info,
  Calendar,
  FileText,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { COMPARISON_PLANS } from '../../services/rotationService';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';

export const ScenarioComparisonPage = () => {
  const { t, isBangla } = useTranslation();
  const plans = COMPARISON_PLANS;
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpand = (id) => {
    setExpandedCard(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <PageHeader
        title={t('comparison.title')}
        subtitle={t('comparison.subtitle')}
        badge={<DemoBadge text="Feature 9 • NASA-Aligned" />}
        helpText={isBangla
          ? '৩টি বিকল্প ফসল পর্যায়ক্রম পদ্ধতির পাশাপাশি তুলনা করে আপনার খামারের জন্য সবচেয়ে টেকসই ও পানি-সাশ্রয়ী পদ্ধতি নির্বাচন করুন।'
          : 'Compare multi-year sustainability, salinity resilience, and water requirements across traditional vs climate-resilient cropping sequences.'}
      />

      {/* Comparative Notice */}
      <div className="callout callout-demo" style={{ marginBottom: '1.5rem' }}>
        <Info size={18} />
        <div>
          <strong style={{ display: 'block', marginBottom: '0.2rem' }}>
            {isBangla ? '৩টি সুনির্দিষ্ট কৌশলের তুলনামূলক পর্যালোচনা:' : 'Direct Comparison of 3 Rotation Strategies:'}
          </strong>
          <span>
            {isBangla
              ? 'এখানে বর্তমান প্রচলিত এক-ফসলী পদ্ধতি, লবণ-হ্রাসকারী মাটির স্বাস্থ্য কৌশল এবং অতি-স্বল্প পানির ডাল কৌশলের মধ্যে বৈজ্ঞানিক প্রমাণ, পানির চাহিদা ও ঝুঁকির তুলনা প্রদর্শিত হয়েছে।'
              : 'Evaluates the Current Baseline rotation against Soil-Health-Focused and Water-Resilience-Focused alternatives using BARI/BRRI agronomic trial evidence.'}
          </span>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-3" style={{ alignItems: 'stretch', gap: '1.25rem' }}>
        {plans.map((p, idx) => {
          const isSoilHealth = p.categoryKey === 'soil-health';
          const isWaterResilience = p.categoryKey === 'water-resilience';
          const isCurrent = p.categoryKey === 'current';

          const badgeBg = isSoilHealth
            ? 'var(--color-primary-800)'
            : isWaterResilience
            ? '#0D6873'
            : '#6B7280';

          const borderStyle = isSoilHealth
            ? '2px solid var(--color-primary-600)'
            : isWaterResilience
            ? '2px solid #0D6873'
            : '1px solid var(--color-border)';

          const cardBg = isSoilHealth
            ? '#F4FAF6'
            : isWaterResilience
            ? '#F0F9FA'
            : 'var(--color-bg-surface)';

          return (
            <div
              key={p.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: cardBg,
                border: borderStyle,
                position: 'relative',
                boxShadow: isSoilHealth ? '0 10px 25px rgba(22, 101, 52, 0.12)' : 'var(--shadow-sm)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              {/* Top Category Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '16px',
                backgroundColor: badgeBg,
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '700',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                letterSpacing: '0.02em'
              }}>
                {isBangla ? p.categoryBadgeBn : p.categoryBadgeEn}
              </div>

              <div style={{ paddingTop: '0.75rem' }}>
                {/* Title */}
                <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-base)',
                    color: isSoilHealth ? 'var(--color-primary-900)' : isWaterResilience ? '#0B4A52' : 'var(--color-text-primary)',
                    fontWeight: '700',
                    lineHeight: 1.4
                  }}>
                    {isBangla ? p.nameBn : p.nameEn}
                  </h3>
                </div>

                {/* 3-Season Sequence Bar */}
                <div style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem'
                  }}>
                    <Calendar size={13} />
                    <span>{isBangla ? '৩-মৌসুমী ফসল বিন্যাস:' : '3-Season Sequence:'}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {p.seasonalSteps?.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.3rem 0.5rem',
                          backgroundColor: sIdx === 1 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                          {isBangla ? step.seasonBn : step.seasonEn}
                        </span>
                        <span style={{ fontWeight: '700', color: 'var(--color-primary-900)' }}>
                          {isBangla ? step.cropBn : step.cropEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px', fontSize: '11px' }}>
                      {t('comparison.metricWater')}
                    </span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {isBangla ? p.waterDemandBn : p.waterDemandEn}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px', fontSize: '11px' }}>
                      {t('comparison.metricSalinity')}
                    </span>
                    <span className="badge badge-neutral" style={{ fontWeight: '600' }}>
                      {p.salinityTolerance}
                    </span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px', fontSize: '11px' }}>
                      {t('comparison.metricSoilHealth')}
                    </span>
                    <strong style={{ color: isSoilHealth ? 'var(--color-primary-800)' : 'var(--color-text-primary)' }}>
                      {isBangla ? p.soilHealthScoreBn : p.soilHealthScore}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px', fontSize: '11px' }}>
                      {t('comparison.metricLabor')}
                    </span>
                    <span>{isBangla ? p.laborComplexityBn : p.laborComplexityEn}</span>
                  </div>
                </div>

                {/* Agronomic Evidence & Considerations Section */}
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  {/* Agronomic Evidence */}
                  <div style={{ fontSize: '11px', lineHeight: 1.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: 'var(--color-primary-800)', marginBottom: '2px' }}>
                      <FileText size={13} />
                      <span>{isBangla ? 'গবেষণা প্রমাণ (বারি/ব্রি):' : 'Agronomic Trial Evidence:'}</span>
                    </div>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {isBangla ? p.evidenceBn : p.evidenceEn}
                    </span>
                  </div>

                  {/* Potential Benefits */}
                  <div style={{ fontSize: '11px', lineHeight: 1.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: 'var(--color-primary-700)', marginBottom: '2px' }}>
                      <CheckCircle2 size={13} color="var(--color-primary-700)" />
                      <span>{isBangla ? 'সম্ভাব্য সুবিধা:' : 'Potential Resilient Benefits:'}</span>
                    </div>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {isBangla ? p.benefitsBn : p.benefitsEn}
                    </span>
                  </div>

                  {/* Water Considerations */}
                  <div style={{ fontSize: '11px', lineHeight: 1.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: '#0284C7', marginBottom: '2px' }}>
                      <Droplets size={13} color="#0284C7" />
                      <span>{isBangla ? 'পানি ব্যবহারের বিবেচনা:' : 'Water Considerations:'}</span>
                    </div>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {isBangla ? p.waterConsiderationsBn : p.waterConsiderationsEn}
                    </span>
                  </div>

                  {/* Soil Considerations */}
                  <div style={{ fontSize: '11px', lineHeight: 1.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: '#15803D', marginBottom: '2px' }}>
                      <Sprout size={13} color="#15803D" />
                      <span>{isBangla ? 'মাটির স্বাস্থ্যের বিবেচনা:' : 'Soil-Health Considerations:'}</span>
                    </div>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {isBangla ? p.soilConsiderationsBn : p.soilConsiderationsEn}
                    </span>
                  </div>

                  {/* Operational Trade-offs & Risks */}
                  <div style={{ fontSize: '11px', lineHeight: 1.45, backgroundColor: 'rgba(234, 88, 12, 0.06)', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: '#EA580C', marginBottom: '2px' }}>
                      <AlertTriangle size={13} color="#EA580C" />
                      <span>{isBangla ? 'ঝুঁকি ও সীমাবদ্ধতা:' : 'Operational Trade-offs:'}</span>
                    </div>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {isBangla ? p.tradeOffsAndRisksBn : p.tradeOffsAndRisksEn}
                    </span>
                  </div>

                  {/* Missing Information */}
                  <div style={{ fontSize: '11px', lineHeight: 1.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                      <HelpCircle size={13} />
                      <span>{isBangla ? 'অনুপস্থিত তথ্য:' : 'Missing Information:'}</span>
                    </div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {isBangla ? p.missingInfoBn : p.missingInfoEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uncertainty & DAE Advisory Footer */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.45
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isCurrent ? 'var(--color-text-secondary)' : 'var(--color-primary-800)', marginBottom: '0.25rem', fontWeight: '600' }}>
                  <ShieldAlert size={13} />
                  <span>{isBangla ? 'পর্যালোচনা ও পরামর্শ:' : 'Extension Review:'}</span>
                </div>
                <p style={{ margin: 0 }}>
                  {isBangla ? p.uncertaintyNoticeBn : p.uncertaintyNoticeEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest Economic & Data Disclosure */}
      <div className="card" style={{ marginTop: '2rem', backgroundColor: '#FAFAF9', border: '1px dashed var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <ShieldAlert size={20} color="var(--color-marginal-dot)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
              {isBangla ? 'অর্থনৈতিক মূল্যায়ন ও তথ্যের স্বচ্ছতা প্রকাশ' : 'Economic Valuation & Scientific Transparency Disclosure'}
            </h4>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {isBangla
                ? 'AgriShift কোনো অনুমানভিত্তিক লাভ বা বাজারের কাল্পনিক মুনাফা সংখ্যা দেখায় না। স্থানীয় বাজার দর, পরিবহণ খরচ এবং প্রকৃত ফলন যাচাই ব্যতিরেকে নির্দিষ্ট আর্থিক লাভের নিশ্চয়তা দেওয়া অবৈজ্ঞানিক। যেকোনো ফসল পর্যায়ক্রম পরিবর্তনের পূর্বে আপনার ইউনিয়ন বা উপজেলার উপসহকারী কৃষি কর্মকর্তার (ডিএই) সাথে আলোচনা করুন।'
                : 'AgriShift intentionally does not display fabricated net-profit monetary figures. Without verified local market prices, transport costs, and farm-gate commodity rates, promising specific earnings would be irresponsible. Always review these options with your local Upazila Agriculture Extension Officer (DAE) before switching cropping patterns.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparisonPage;
