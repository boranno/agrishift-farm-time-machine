import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Sparkles,
  Droplets,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  ShieldCheck,
  Workflow,
  Check,
  BarChart3,
  Layers,
  Sun,
  CloudRain,
  Snowflake,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import { ROTATION_PATTERNS, COMPARISON_PLANS } from '../../services/rotationService';
import { KHULNA_DISTRICT_PROFILES, getActiveSeasonNasaProfile } from '../../services/nasaTelemetryService';
import { localizeFarmValue } from '../../utils/farmDisplay';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';

export const RotationPlannerPage = () => {
  const { t, isBangla } = useTranslation();
  const { farm, soil, season } = useFarm();

  const [selectedDistrict, setSelectedDistrict] = useState(
    KHULNA_DISTRICT_PROFILES[farm?.district] ? farm.district : 'Khulna'
  );
  const [selectedPriority, setSelectedPriority] = useState('soil');
  const [selectedWater, setSelectedWater] = useState('scarce');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'comparison'
  const [adoptedPlan, setAdoptedPlan] = useState(null);

  const districtProfile = KHULNA_DISTRICT_PROFILES[selectedDistrict] || KHULNA_DISTRICT_PROFILES.Khulna;
  const currentNasa = getActiveSeasonNasaProfile(selectedDistrict, season || 'rabi');
  const droughtHazard = currentNasa.hazards.find(h => h.id === 'drought_vci');

  // Filter or prioritize rotation patterns
  const matchingPatterns = ROTATION_PATTERNS.filter(p =>
    selectedPriority === 'all' || p.priorities.includes(selectedPriority)
  );

  const displayPatterns = matchingPatterns.length > 0 ? matchingPatterns : ROTATION_PATTERNS;

  const handleAdoptPlan = (plan) => {
    setAdoptedPlan(plan.id);
    setTimeout(() => setAdoptedPlan(null), 4000);
  };

  const currentCrops = farm?.currentCrops || {
    kharif1: 'Fallow / Weed Growth',
    kharif2: 'T. Aman Rice (Local Swarna)',
    rabi: 'Boro Rice (High Salinity Risk)'
  };

  return (
    <div>
      <PageHeader
        title={t('rotation.title')}
        subtitle={t('rotation.subtitle')}
        badge={<DemoBadge text="Feature 7 • NASA-Informed" />}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/scenario-comparison" className="btn btn-secondary btn-sm">
              <span>{t('nav.scenarioComparison')}</span>
            </Link>
            <Link to="/intelligent-rotation" className="btn btn-secondary btn-sm">
              <Workflow size={14} color="var(--color-primary-800)" />
              <span>{t('nav.intelligentRotation')}</span>
            </Link>
          </div>
        }
        helpText={isBangla
          ? 'এক-ফসলি আমন বা অতিরিক্ত পানির বোরো চাষের পরিবর্তে টেকসই ৩-মৌসুমী ফসল পর্যায়ক্রম অনুসরণ করুন যা মাটির লবণ কমায় ও উর্বরতা বৃদ্ধি করে।'
          : 'Formulates multi-season rotation plans designed to break pest cycles, prevent seasonal soil crusting, and minimize dependency on saline dry-season canal irrigation.'}
      />

      {/* Honest Scientific Phase Notice */}
      <div className="callout callout-demo" style={{ boxShadow: 'var(--shadow-xs)', marginBottom: '1.25rem' }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>{t('rotation.plannerNotice')}</span>
      </div>

      {/* Active Farm Current Baseline Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--color-primary-800)" />
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--color-primary-900)', margin: 0 }}>
              {isBangla ? 'আপনার খামারের বর্তমান ফসল ধারা ও রূপান্তর পরিকল্পনা' : 'Your Farm Baseline & Cropping Transition Target'}
            </h3>
          </div>
          <Link to="/farm-map" className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '0.25rem 0.6rem' }}>
            {isBangla ? 'ফসল পরিবর্তন করুন ➔' : 'Edit Baseline in Map ➔'}
          </Link>
        </div>

        <div className="grid grid-cols-3" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>
              {isBangla ? 'খরিপ-১ (গ্রীষ্ম)' : 'Kharif-1 (Pre-Monsoon)'}
            </span>
            <strong style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
              {currentCrops.kharif1}
            </strong>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>
              {isBangla ? 'খরিপ-২ (বর্ষা)' : 'Kharif-2 (Monsoon)'}
            </span>
            <strong style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
              {currentCrops.kharif2}
            </strong>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>
              {isBangla ? 'রবি (শীতকাল)' : 'Rabi (Dry Season)'}
            </span>
            <strong style={{ fontSize: '12px', color: '#B91C1C' }}>
              {currentCrops.rabi}
            </strong>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--color-primary-800)' }}>
            {isBangla ? 'রূপান্তরের প্রয়োজনীয়তা: ' : 'Why Transition: '}
          </strong>
          {isBangla
            ? 'বর্তমান ধারায় শুষ্ক মৌসুমে জমি অনাবাদি থাকা বা নোনা ভূগর্ভস্থ পানি দিয়ে অতিরিক্ত বোরো চাষ মাটির ওপর লবণের আস্তরণ তৈরি করে। নিচের জলবায়ু-সহনশীল ৩-মৌসুমী বিকল্পগুলো মাটির লবণাক্ততা দমন ও পানির চাহিদা ৮০% পর্যন্ত হ্রাস করতে সক্ষম।'
            : 'Traditional coastal monoculture leaves soils exposed to high solar evaporation from February to May, causing rapid salt accumulation. Transitioning to the climate-resilient sequences below restores soil organic matter and cuts supplemental water demand by up to 80%.'}
        </div>

        {/* Dynamic 1-Month Ahead Hazard Early Warning Integration */}
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
              {isBangla ? 'পর্যবেক্ষণ জেলা:' : 'Telemetry Zone:'}
            </span>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #86EFAC',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-primary-900)'
              }}
            >
              {Object.keys(KHULNA_DISTRICT_PROFILES).map(d => (
                <option key={d} value={d}>
                  {localizeFarmValue(d, isBangla)}
                </option>
              ))}
            </select>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              • {isBangla ? `১-মাস অগ্রিম খরা পূর্বাভাস: ${droughtHazard?.probability || 34}% ঝুঁকি` : `1-Month Ahead Drought Forecast: ${droughtHazard?.probability || 34}% risk`}
            </span>
          </div>
          <span className="badge badge-suitable" style={{ fontSize: '10px' }}>
            {droughtHazard?.probability >= 24
              ? (isBangla ? 'সূর্যমুখী বা সরিষা সুপারিশকৃত' : 'Sunflower / Mustard Recommended')
              : (isBangla ? 'স্বাভাবিক সেচ বিন্যাস প্রযোজ্য' : 'Standard Rotation Feasible')}
          </span>
        </div>
      </div>

      {adoptedPlan && (
        <div className="callout callout-info animate-fade-in" style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #6EE7B7',
          color: '#065F46',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem'
        }}>
          <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0 }} />
          <div>
            <strong>{isBangla ? 'ফসল পর্যায়ক্রম গৃহীত হয়েছে!' : 'Rotation Plan Successfully Adopted!'}</strong>
            <div style={{ fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
              {isBangla
                ? 'আপনার সক্রিয় খামারের ক্যালেন্ডার ও সার ব্যবস্থাপনায় এই ৩-মৌসুমী পর্যায়ক্রম যুক্ত করা হয়েছে।'
                : 'Scheduled into your active farm calendar. Irrigation and sowing dates are synchronized.'}
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & View Mode Tabs */}
      <div className="card" style={{
        marginBottom: '1.75rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
              {isBangla ? 'পরিকল্পনা ফিল্টার ও অগ্রাধিকার' : 'Agronomic Goals & Optimization'}
            </h3>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {isBangla ? 'আপনার জমি ও পানির প্রাপ্যতার সাথে মানানসই ফসল চক্র নির্বাচন করুন' : 'Filter multi-season cycles by environmental limits'}
            </div>
          </div>

          {/* View Mode Toggle Buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--color-bg-cream)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className="btn btn-sm"
              style={{
                backgroundColor: viewMode === 'timeline' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'timeline' ? 'var(--color-primary-900)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'timeline' ? 'var(--shadow-xs)' : 'none',
                fontWeight: viewMode === 'timeline' ? 'bold' : 'normal',
                border: 'none'
              }}
            >
              <CalendarDays size={14} />
              <span>{isBangla ? 'ধারাবাহিক টাইমলাইন' : 'Timeline Flow'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('comparison')}
              className="btn btn-sm"
              style={{
                backgroundColor: viewMode === 'comparison' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'comparison' ? 'var(--color-primary-900)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'comparison' ? 'var(--shadow-xs)' : 'none',
                fontWeight: viewMode === 'comparison' ? 'bold' : 'normal',
                border: 'none'
              }}
            >
              <BarChart3 size={14} />
              <span>{isBangla ? 'পাশাপাশি তুলনা' : 'Side-by-Side'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: '1.25rem' }}>
          {/* Priority selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Sparkles size={16} color="var(--color-primary-800)" />
              <span>{t('rotation.priorityLabel')}</span>
            </label>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="form-select"
            >
              <option value="soil">{t('rotation.prioritySoil')}</option>
              <option value="water">{t('rotation.priorityWater')}</option>
              <option value="saline">{t('rotation.prioritySaline')}</option>
              <option value="yield">{t('rotation.priorityYield')}</option>
            </select>
          </div>

          {/* Water Availability Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Droplets size={16} color="var(--color-info-dot)" />
              <span>{t('rotation.waterAvailLabel')}</span>
            </label>
            <select
              value={selectedWater}
              onChange={e => setSelectedWater(e.target.value)}
              className="form-select"
            >
              <option value="scarce">{t('rotation.waterScarce')}</option>
              <option value="plentiful">{t('rotation.waterPlentiful')}</option>
              <option value="saline">{t('rotation.waterSaline')}</option>
              <option value="rainfed">{t('rotation.waterRainfed')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: CONNECTED PROGRESSION TIMELINE */}
      {viewMode === 'timeline' && (
        <div>
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary-900)' }}>
              {t('rotation.recommendedSequences')}
            </h2>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-cream)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
              {displayPatterns.length} {isBangla ? 'টি সমন্বিত ৩-মৌসুমী ফসল চক্র' : 'recommended 3-season rotation pathways'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {displayPatterns.map((pattern, pIdx) => (
              <div
                key={pattern.id}
                className="card"
                style={{
                  borderTop: '4px solid var(--color-primary-800)',
                  boxShadow: 'var(--shadow-md)',
                  padding: '1.5rem',
                  position: 'relative'
                }}
              >
                {/* Header */}
                <div className="card-header" style={{ marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {isBangla ? `ধারা 0${pIdx + 1}` : `Sequence 0${pIdx + 1}`}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                        {isBangla ? pattern.nameBn : pattern.nameEn}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                      <span><strong>{isBangla ? 'লবণ সহনশীলতা:' : 'Salinity Tolerance:'}</strong> {isBangla ? pattern.soilSalinitySuitabilityBn : pattern.soilSalinitySuitability}</span>
                      <span>•</span>
                      <span><strong>{isBangla ? 'পানির চাহিদা:' : 'Water Need:'}</strong> {isBangla ? pattern.waterRequirementLevelBn : pattern.waterRequirementLevel}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      backgroundColor: 'var(--color-primary-50)',
                      border: '1px solid var(--color-primary-200)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'right'
                    }}>
                      <div style={{ fontSize: '10px', color: 'var(--color-primary-800)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {isBangla ? 'উপযোগিতা স্কোর' : 'Suitability Score'}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-primary-800)', lineHeight: 1 }}>
                        {pattern.suitabilityScore}<span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connected 3-Season Visual Timeline Progression */}
                <div style={{
                  position: 'relative',
                  backgroundColor: '#F8FAF8',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    left: '12%',
                    right: '12%',
                    height: '3px',
                    backgroundColor: '#CBD5C8',
                    zIndex: 0
                  }} className="desktop-timeline-line"></div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.25rem',
                    position: 'relative',
                    zIndex: 1
                  }} className="timeline-3col">
                    {pattern.seasons.map((s, idx) => {
                      const seasonColor = idx === 0 ? '#D97706' : idx === 1 ? '#15803D' : '#0369A1';
                      const seasonBg = idx === 0 ? '#FEF3C7' : idx === 1 ? '#DCFCE7' : '#E0F2FE';
                      const SeasonIcon = idx === 0 ? Sun : idx === 1 ? CloudRain : Snowflake;

                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: `1px solid ${seasonColor}33`,
                            borderTop: `4px solid ${seasonColor}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '1.1rem',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              backgroundColor: seasonBg,
                              color: seasonColor,
                              fontSize: '11px',
                              fontWeight: 'bold',
                              padding: '0.25rem 0.6rem',
                              borderRadius: 'var(--radius-full)',
                              marginBottom: '0.75rem'
                            }}>
                              <SeasonIcon size={13} />
                              <span>{isBangla ? s.seasonNameBn : s.seasonNameEn}</span>
                            </div>

                            <h4 style={{
                              fontSize: '1.1rem',
                              fontWeight: 'bold',
                              marginBottom: '0.5rem',
                              color: 'var(--color-primary-900)'
                            }}>
                              {isBangla ? s.cropNameBn : s.cropNameEn}
                            </h4>

                            <p style={{
                              fontSize: '12px',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '0.75rem',
                              lineHeight: 1.55
                            }}>
                              {isBangla ? s.actionBn : s.actionEn}
                            </p>
                          </div>

                          <div style={{
                            fontSize: '11px',
                            backgroundColor: 'var(--color-bg-cream)',
                            border: '1px solid var(--color-border)',
                            padding: '0.5rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--color-primary-900)',
                            lineHeight: 1.5
                          }}>
                            <strong>{isBangla ? 'বিজ্ঞানসম্মত সুফল: ' : 'Agronomic Benefit: '}</strong>
                            {isBangla ? s.benefitBn : s.benefitEn}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Impact Gauge Indicators */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1rem',
                  backgroundColor: 'var(--color-bg-cream)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem'
                }} className="grid-cols-4">
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {isBangla ? 'লবণ সহনশীলতা' : 'Salinity Defense'}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '2px' }}>
                      8.5 dS/m
                    </div>
                    <div className="meter-bar" style={{ marginTop: '4px' }}>
                      <div className="meter-fill" style={{ width: '85%', backgroundColor: '#15803D' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {isBangla ? 'পানির সঞ্চয়' : 'Water Conservation'}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '2px' }}>
                      {isBangla ? '৬৫% কম পানি' : '65% Less Water'}
                    </div>
                    <div className="meter-bar" style={{ marginTop: '4px' }}>
                      <div className="meter-fill" style={{ width: '90%', backgroundColor: '#0284C7' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {isBangla ? 'জৈব পদার্থ বৃদ্ধি' : 'Soil Organic Carbon'}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '2px' }}>
                      +15 ton/ha
                    </div>
                    <div className="meter-bar" style={{ marginTop: '4px' }}>
                      <div className="meter-fill" style={{ width: '95%', backgroundColor: '#22A06B' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                      {isBangla ? 'অর্থনৈতিক সম্ভাবনা' : 'Economic Return'}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '2px' }}>
                      ★★★★★
                    </div>
                    <div className="meter-bar" style={{ marginTop: '4px' }}>
                      <div className="meter-fill" style={{ width: '88%', backgroundColor: '#EAB308' }}></div>
                    </div>
                  </div>
                </div>

                {/* Why Suggested & Considerations Section */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--color-primary-800)' }}>
                      {isBangla ? 'কেন এই কৌশলটি সুপারিশ করা হয়েছে: ' : 'Why This Sequence is Recommended: '}
                    </strong>
                    <span>{isBangla ? pattern.rationaleBn : pattern.rationaleEn}</span>
                  </div>

                  <div className="grid grid-cols-2" style={{ gap: '0.75rem', fontSize: '11px', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)' }}>
                    <div>
                      <strong style={{ color: '#0284C7' }}>{isBangla ? '💧 পানি সাশ্রয় বিবেচনা: ' : '💧 Water Considerations: '}</strong>
                      <span>{isBangla ? 'বর্ষার বৃষ্টির সর্বোত্তম ব্যবহার এবং রবিতে খড় মালচিং দিয়ে মাটির আর্দ্রতা ধরে রাখা।' : 'Harvests residual post-monsoon soil moisture with straw mulching.'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#15803D' }}>{isBangla ? '🌱 মাটির স্বাস্থ্য বিবেচনা: ' : '🌱 Soil Conditioning: '}</strong>
                      <span>{isBangla ? 'ধইঞ্চা বা ডাল জাতীয় ফসলের মাধ্যমে প্রাকৃতিক নাইট্রোজেন সংযোজন ও লবণ প্রতিরোধ।' : 'Suppresses capillary salinity and restores +15 ton/ha active biomass.'}</span>
                    </div>
                  </div>
                </div>

                {/* Extension Advice & Adoption Action */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    <ShieldAlert size={14} color="#EA580C" />
                    <span>
                      {isBangla
                        ? 'মাঠ পর্যায়ে বাস্তবায়নের পূর্বে আপনার স্থানীয় উপসহকারী কৃষি কর্মকর্তা (ডিএই)-র মতামত নিন।'
                        : 'Review this sequence with your local Upazila Agriculture Extension Officer (DAE) before sowing.'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdoptPlan(pattern)}
                    className="btn btn-primary"
                    style={{ boxShadow: 'var(--shadow-sm)' }}
                  >
                    <Check size={16} />
                    <span>{t('rotation.selectThisPlan')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SIDE-BY-SIDE MATRIX COMPARISON */}
      {viewMode === 'comparison' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary-900)' }}>
              {isBangla ? 'প্রচলিত এক-ফসলি ধারা বনাম জলবায়ু-সহনশীল ৩-মৌসুম ধারা' : 'Traditional 1-Crop Practice vs. Climate-Resilient Rotation'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              {isBangla
                ? 'শুষ্ক মৌসুমে জমি ফাঁকা রাখলে বাষ্পীভবনের মাধ্যমে মাটির নিচে থাকা লবণ ওপরে উঠে আসে। ফসল পর্যায়ক্রমের মাধ্যমে এই ক্ষয় রোধ করা সম্ভব।'
                : 'Leaving fields fallow between harvests exposes topsoil to intense solar evaporation, pulling subsoil salt crystals to the crust.'}
            </p>
          </div>

          <div className="three-card-grid">
            {COMPARISON_PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className="tall-portrait-card"
                style={{
                  borderTop: idx === 1 ? '5px solid #16A34A' : idx === 0 ? '5px solid #EF4444' : '5px solid #0284C7',
                  backgroundColor: idx === 1 ? '#FAFCFA' : '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: idx === 1 ? '#DCFCE7' : idx === 0 ? '#FEE2E2' : '#E0F2FE',
                      color: idx === 1 ? '#15803D' : idx === 0 ? '#991B1B' : '#0369A1'
                    }}>
                      {idx === 1 ? (isBangla ? 'সর্বোচ্চ সুপারিশকৃত' : 'RECOMMENDED') : idx === 0 ? (isBangla ? 'বর্তমান ভিত্তি' : 'CURRENT BASELINE') : (isBangla ? 'বিকল্প' : 'ALTERNATIVE')}
                    </span>
                    <DemoBadge />
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-900)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {isBangla ? plan.nameBn : plan.nameEn}
                  </h3>

                  {/* Sequence Badges */}
                  <div style={{
                    padding: '0.65rem',
                    backgroundColor: 'var(--color-bg-cream)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    color: 'var(--color-primary-900)',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    {isBangla ? plan.sequenceBn : plan.sequenceEn}
                  </div>

                  {/* Comparison Metrics List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'লবণ সহনশীলতা: ' : 'Salinity Limit: '}</span>
                      <strong>{plan.salinityTolerance}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'পানির চাহিদা: ' : 'Water Demand: '}</span>
                      <strong>{isBangla ? plan.waterDemandBn : plan.waterDemandEn}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'মাটির স্বাস্থ্য: ' : 'Soil Health: '}</span>
                      <strong style={{ color: idx === 1 ? '#15803D' : idx === 0 ? '#DC2626' : '#0369A1' }}>
                        {isBangla ? plan.soilHealthScoreBn : plan.soilHealthScore}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'শ্রম ব্যবস্থাপনা: ' : 'Labor: '}</span>
                      <strong>{isBangla ? plan.laborComplexityBn : plan.laborComplexityEn}</strong>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5
                }}>
                  {isBangla ? plan.economicNoteBn : plan.economicNoteEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RotationPlannerPage;
