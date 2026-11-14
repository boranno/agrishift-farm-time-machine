import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  TrendingUp,
  Droplets,
  Sprout,
  ShieldCheck,
  Info,
  CalendarDays,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import ModelUnavailableBanner from '../../components/common/ModelUnavailableBanner';

export const IntelligentRotationPage = () => {
  const { t, isBangla } = useTranslation();

  // Trajectory simulation selection
  const [selectedSequenceStrategy, setSelectedSequenceStrategy] = useState('legume_salt');

  const trajectories = {
    legume_salt: {
      nameEn: 'Strategy: Green Manure -> Salt-Tolerant Rice -> Sunflower',
      nameBn: 'কৌশল: সবুজ সার (ধইঞ্চা) -> লবণ-সহনশীল ধান -> সূর্যমুখী',
      year1Om: 1.65,
      year2Om: 1.95,
      year3Om: 2.30,
      salinitySuppression: 'High (-35% topsoil salt accumulation)',
      salinitySuppressionBn: 'উচ্চ (মাটির ওপর লবণ জমা ৩৫% হ্রাস)',
      waterSavings: '40% less irrigation vs Boro monoculture',
      waterSavingsBn: 'সনাতন বোরোর তুলনায় ৪০% কম সেচের পানি প্রয়োজন'
    },
    pulse_relay: {
      nameEn: 'Strategy: Mungbean -> Rainfed Aman -> Relay Khesari',
      nameBn: 'কৌশল: মুগডাল -> বৃষ্টি-নির্ভর আমন -> রিলে খেসারি',
      year1Om: 1.65,
      year2Om: 1.85,
      year3Om: 2.10,
      salinitySuppression: 'Moderate (-20% salt accumulation)',
      salinitySuppressionBn: 'মাঝারি (২০% লবণ হ্রাস)',
      waterSavings: 'Near zero winter irrigation required',
      waterSavingsBn: 'শীতকালে কোনো সেচের প্রয়োজন হয় না'
    }
  };

  const currentTrajectory = trajectories[selectedSequenceStrategy];

  return (
    <div>
      <PageHeader
        title={t('intelligentRotation.title')}
        subtitle={t('intelligentRotation.subtitle')}
        badge={<DemoBadge text="Feature 14" />}
        actions={
          <span className="badge badge-neutral">{isBangla ? 'পর্ব ২: অপ্টিমাইজেশন ইঞ্জিন' : 'Part 2 Optimization Engine'}</span>
        }
        helpText={isBangla
          ? 'বহু-বছরের ফসল পর্যায়ক্রমের মাধ্যমে কীভাবে মাটির স্বাস্থ্য পুনরুদ্ধার হয় এবং লবণাক্ততা কমে আসে তা এই ইন্টারফেসে উপস্থাপন করা হয়েছে।'
          : 'Interactive projection of 3-year soil organic carbon trajectories, salinity mitigation, and water conservation benefits under intelligent crop sequences.'}
      />

      {/* Model Notice Banner */}
      <ModelUnavailableBanner
        title={t('intelligentRotation.statusBanner')}
        message={t('intelligentRotation.statusDesc')}
        plannedPhase="Part 2 (Algorithmic Constraint Optimization Engine)"
      />

      {/* Sequence Strategy Switcher */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--color-bg-cream)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'block' }}>
              {isBangla ? 'পরীক্ষামূলক ফসল চক্র নির্বাচন করুন' : 'Select Sequence Strategy to Preview Trajectory'}
            </span>
            <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-900)' }}>
              {isBangla ? currentTrajectory.nameBn : currentTrajectory.nameEn}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setSelectedSequenceStrategy('legume_salt')}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedSequenceStrategy === 'legume_salt' ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
                color: selectedSequenceStrategy === 'legume_salt' ? '#FFFFFF' : 'var(--color-text-main)'
              }}
            >
              {isBangla ? 'সবুজ সার ও সূর্যমুখী' : 'Green Manure & Sunflower'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedSequenceStrategy('pulse_relay')}
              className="btn btn-sm"
              style={{
                backgroundColor: selectedSequenceStrategy === 'pulse_relay' ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
                color: selectedSequenceStrategy === 'pulse_relay' ? '#FFFFFF' : 'var(--color-text-main)'
              }}
            >
              {isBangla ? 'ডাল ও রিলে পদ্ধতি' : 'Pulse & Relay'}
            </button>
          </div>
        </div>
      </div>

      {/* 3-Year Trajectory Visualization Cards */}
      <div className="grid grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        {/* Organic Matter Trajectory */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {t('intelligentRotation.soilHealthTrajectory')}
            </span>
            <Sprout size={16} color="var(--color-primary-700)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
              +{((currentTrajectory.year3Om - currentTrajectory.year1Om) / currentTrajectory.year1Om * 100).toFixed(0)}%
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{isBangla ? '৩ বছরে জৈব পদার্থের বৃদ্ধি' : 'Organic matter gain over 3 years'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{isBangla ? '১ম বছর (প্রাথমিক):' : 'Year 1 (Baseline):'}</span>
              <strong>{currentTrajectory.year1Om}% OM</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{isBangla ? '২য় বছর:' : 'Year 2:'}</span>
              <strong>{currentTrajectory.year2Om}% OM</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{isBangla ? '৩য় বছর:' : 'Year 3:'}</span>
              <strong style={{ color: 'var(--color-suitable-dot)' }}>{currentTrajectory.year3Om}% OM</strong>
            </div>
          </div>
        </div>

        {/* Salinity Suppression Trajectory */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {t('intelligentRotation.saltSuppression')}
            </span>
            <TrendingUp size={16} color="var(--color-primary-700)" />
          </div>

          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>
            {isBangla ? currentTrajectory.salinitySuppressionBn : currentTrajectory.salinitySuppression}
          </div>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {isBangla
              ? 'ধইঞ্চার আচ্ছাদন ও সূর্যমুখীর গভীর মূল মাটির কৈশিক নালির মাধ্যমে শুষ্ক মৌসুমে লবণ ওপরে ওঠার প্রক্রিয়াকে প্রতিহত করে।'
              : 'Surface cover and root aeration diminish capillary salt crusting during the critical March–May dry window.'}
          </p>
        </div>

        {/* Water Productivity */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {t('intelligentRotation.waterProductivity')}
            </span>
            <Droplets size={16} color="var(--color-info-dot)" />
          </div>

          <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>
            {isBangla ? currentTrajectory.waterSavingsBn : currentTrajectory.waterSavings}
          </div>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {isBangla
              ? 'উপকূলীয় খালের নোনা সেচ পানির ওপর নির্ভরশীলতা কমিয়ে বৃষ্টির পানির সর্বোত্তম ব্যবহার নিশ্চিত হয়।'
              : 'Significantly reduces dependency on saline canal water, preserving scarce pond freshwater.'}
          </p>
        </div>
      </div>

      {/* Interactive Sequence Builder Preview */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Workflow size={18} color="var(--color-primary-800)" />
            <span>{t('intelligentRotation.exploreSequences')}</span>
          </h2>
          <DemoBadge text="Interactive Sequence Flow" />
        </div>

        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          {isBangla
            ? 'প্রতিটি ধাপের বৈজ্ঞানিক কার্যকারণ ও মাটি শোধনের ভূমিকা নিচে বিস্তারিত প্রদর্শিত হয়েছে:'
            : 'Season-by-season sequence logic configured for future backend solver validation:'}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          backgroundColor: 'var(--color-bg-main)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <span className="badge badge-neutral" style={{ fontSize: '10px', marginBottom: '0.4rem' }}>
              ধাপ ১: খরিপ-১ (গ্রীষ্ম)
            </span>
            <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '0.35rem' }}>{isBangla ? 'সবুজ সার (ধইঞ্চা)' : 'Green manure (Sesbania)'}</h4>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              মাটিতে মিশিয়ে দিলে জৈব কার্বন যোগ হয় এবং গ্রীষ্মের তীব্র রোদে মাটির ওপর লবণের আস্তরণ জমা বন্ধ হয়।
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <span className="badge badge-neutral" style={{ fontSize: '10px', marginBottom: '0.4rem' }}>
              ধাপ ২: খরিপ-২ (বর্ষা)
            </span>
            <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '0.35rem' }}>{isBangla ? 'রোপা আমন (ব্রি ধান৭৩)' : 'Transplanted Aman (BRRI dhan73)'}</h4>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              বর্ষার পানিতে লবণ ধুয়ে যায়; আগের ধাপের ধইঞ্চার ফলে মাটিতে প্রয়োজনীয় নাইট্রোজেন প্রস্তুত থাকে।
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--color-bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <span className="badge badge-neutral" style={{ fontSize: '10px', marginBottom: '0.4rem' }}>
              ধাপ ৩: রবি (শীতকাল)
            </span>
            <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '0.35rem' }}>{isBangla ? 'সূর্যমুখী / রিলে ডাল' : 'Sunflower / relay pulse'}</h4>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              গভীর শিকড়ের সাহায্যে মাটির নিচের আর্দ্রতা নেয় এবং বোরো ধানের বিপুল মিষ্টি পানির সেচ সংকট এড়ায়।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentRotationPage;
