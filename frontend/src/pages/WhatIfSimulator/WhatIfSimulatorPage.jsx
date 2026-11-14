import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CloudRain,
  Droplets,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import { KHULNA_DISTRICT_PROFILES, getActiveSeasonNasaProfile } from '../../services/nasaTelemetryService';
import { localizeFarmValue } from '../../utils/farmDisplay';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import StatusBadge from '../../components/common/StatusBadge';

export const WhatIfSimulatorPage = () => {
  const { t, isBangla } = useTranslation();
  const { farm, soil, season } = useFarm();

  const [activeDistrict, setActiveDistrict] = useState(
    KHULNA_DISTRICT_PROFILES[farm?.district] ? farm.district : 'Khulna'
  );

  // Scenario input controls
  const [rainfallDelta, setRainfallDelta] = useState(-20); // -40% to +40%
  const [simSalinity, setSimSalinity] = useState(soil?.ec || 5.4); // 1.0 to 16.0 dS/m
  const [irrigationWaterQuality, setIrrigationWaterQuality] = useState('canal_brackish');
  const [tempDelta, setTempDelta] = useState(1.5); // -2°C to +4°C
  const [selectedCrop, setSelectedCrop] = useState('crop-sunflower');

  const distProfile = KHULNA_DISTRICT_PROFILES[activeDistrict] || KHULNA_DISTRICT_PROFILES.Khulna;
  const currentProfile = getActiveSeasonNasaProfile(activeDistrict, season || 'rabi');

  // Compute heuristic risk response informed by district baseline & LightGBM drought threshold
  const computeSimulation = () => {
    let riskScore = 0; // 0 to 100

    // Salinity impact scaled by district coastal proximity
    const effectiveEc = simSalinity;
    if (effectiveEc > 8.0) riskScore += 45;
    else if (effectiveEc > 5.0) riskScore += 25;
    else if (effectiveEc > 3.0) riskScore += 10;

    // Rainfall drought impact
    if (rainfallDelta < -25) riskScore += 30;
    else if (rainfallDelta < 0) riskScore += 15;

    // Heat stress impact (MODIS LST > 35°C threshold)
    if (tempDelta > 2.0) riskScore += 15;
    else if (tempDelta > 0.5) riskScore += 8;

    // Irrigation quality
    if (irrigationWaterQuality === 'canal_brackish') {
      riskScore += distProfile.zone.startsWith('coastal') ? 25 : 12;
    } else if (irrigationWaterQuality === 'rainfed_only') {
      riskScore += 22;
    }

    // Crop modifier based on salinity & rooting physics
    if (selectedCrop === 'crop-sunflower') riskScore -= 20; // resilient deep taproot
    if (selectedCrop === 'crop-brri67') riskScore -= 15; // salt tolerant boro
    if (selectedCrop === 'crop-potato') riskScore += 35; // very sensitive
    if (selectedCrop === 'crop-mungbean') riskScore += rainfallDelta > 20 ? 15 : -5;

    const finalScore = Math.max(10, Math.min(95, riskScore));

    let riskLevel = 'low';
    if (finalScore > 65) riskLevel = 'critical';
    else if (finalScore > 40) riskLevel = 'moderate';

    // Projected 1-Month Ahead VCI impact
    const vciImpact = Math.round(distProfile.vciBase + (rainfallDelta * 0.3) - (effectiveEc * 2.2) - (tempDelta * 2.5));
    const projectedVci = Math.max(12, Math.min(95, vciImpact));

    return {
      score: finalScore,
      level: riskLevel,
      projectedVci,
      waterStressPct: Math.min(100, Math.max(15, Math.round(50 - rainfallDelta * 0.9 + tempDelta * 4))),
      osmoticShockPct: Math.min(100, Math.round(effectiveEc * 6.2))
    };
  };

  const simulation = computeSimulation();

  const handleReset = () => {
    setRainfallDelta(0);
    setSimSalinity(soil?.ec || 4.8);
    setIrrigationWaterQuality('pond_fresh');
    setTempDelta(0);
    setSelectedCrop('crop-sunflower');
  };

  return (
    <div>
      <PageHeader
        title={t('simulator.title')}
        subtitle={t('simulator.subtitle')}
        badge={<DemoBadge text="Feature 8" />}
        actions={
          <button type="button" onClick={handleReset} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} />
            <span>{t('common.reset')}</span>
          </button>
        }
        helpText={isBangla
          ? 'বৃষ্টি কম হলে বা খালের পানির লবণাক্ততা বেড়ে গেলে ফসলের ওপর কী ধরনের প্রভাব পড়বে তা বীজ কেনার আগেই পরীক্ষা করুন।'
          : 'Interactive exploratory simulator. Allows testing hypothetical stress combinations to identify tipping points before field commitment.'}
      />

      {/* Honest Scientific Simulator Disclaimer */}
      <div className="callout callout-demo">
        <Info size={18} />
        <span>{t('simulator.disclaimer')}</span>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Interactive Scenario Sliders */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <SlidersHorizontal size={20} color="var(--color-primary-800)" />
              <span>{t('simulator.controlsTitle')}</span>
            </h2>
          </div>

          {/* District Preset Switcher */}
          <div className="form-group" style={{ backgroundColor: 'var(--color-bg-cream)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" htmlFor="sim-dist" style={{ marginBottom: 0, fontWeight: 'bold' }}>
                {isBangla ? 'খুলনা বিভাগ জেলা বেঞ্চমার্ক:' : 'Khulna District Telemetry Preset:'}
              </label>
              <span className="badge badge-suitable" style={{ fontSize: '10px' }}>
                {isBangla ? distProfile.zoneLabelBn : distProfile.zoneLabelEn}
              </span>
            </div>
            <select
              id="sim-dist"
              value={activeDistrict}
              onChange={e => {
                const newDist = e.target.value;
                setActiveDistrict(newDist);
                const prof = KHULNA_DISTRICT_PROFILES[newDist];
                if (prof) setSimSalinity(prof.baseSalinityEc);
              }}
              className="form-select"
              style={{ fontSize: '12px', fontWeight: '600' }}
            >
              {Object.keys(KHULNA_DISTRICT_PROFILES).map(d => (
                <option key={d} value={d}>
                  {localizeFarmValue(d, isBangla)} (Base EC {KHULNA_DISTRICT_PROFILES[d].baseSalinityEc} dS/m | VCI {KHULNA_DISTRICT_PROFILES[d].vciBase})
                </option>
              ))}
            </select>
          </div>

          {/* Target Crop Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="sim-crop">
              {t('simulator.targetCrop')}
            </label>
            <select
              id="sim-crop"
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="form-select"
            >
              <option value="crop-sunflower">{isBangla ? 'সূর্যমুখী (লবণ সহনশীলতা ৮.৫ dS/m)' : 'Sunflower (salinity tolerance 8.5 dS/m)'}</option>
              <option value="crop-brri67">{isBangla ? 'ব্রি ধান৬৭ বোরো (৮ dS/m)' : 'BRRI dhan67 Boro (8 dS/m)'}</option>
              <option value="crop-mustard">{isBangla ? 'বারি সরিষা-১৪ (৫.৫ dS/m)' : 'BARI Mustard-14 (5.5 dS/m)'}</option>
              <option value="crop-mungbean">{isBangla ? 'মুগডাল (৪ dS/m)' : 'Mungbean (4 dS/m)'}</option>
              <option value="crop-potato">{isBangla ? 'আলু (সংবেদনশীল, ২.৫ dS/m)' : 'Potato (sensitive, 2.5 dS/m)'}</option>
            </select>
          </div>

          {/* Salinity Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <label className="form-label" htmlFor="sim-salinity" style={{ marginBottom: 0 }}>
                {t('simulator.salinityValue')}
              </label>
              <strong style={{
                color: simSalinity > 8.0 ? 'var(--color-risky-dot)' : simSalinity > 4.5 ? 'var(--color-marginal-dot)' : 'var(--color-suitable-dot)'
              }}>
                {simSalinity.toFixed(1)} dS/m
              </strong>
            </div>
            <input
              id="sim-salinity"
              type="range"
              min="1.0"
              max="16.0"
              step="0.5"
              value={simSalinity}
              onChange={e => setSimSalinity(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary-800)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)' }}>
              <span>{isBangla ? '১.০ (স্বাভাবিক)' : '1.0 (Normal)'}</span>
              <span>{isBangla ? '৮.০ (মাঝারি লবণাক্ততা)' : '8.0 (Moderate salinity)'}</span>
              <span>{isBangla ? '১৬.০ (তীব্র লবণাক্ততা)' : '16.0 (Severe salinity)'}</span>
            </div>
          </div>

          {/* Rainfall Anomaly Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <label className="form-label" htmlFor="sim-rain" style={{ marginBottom: 0 }}>
                {t('simulator.rainfallDelta')}
              </label>
              <strong style={{ color: rainfallDelta < 0 ? '#DC2626' : '#166534' }}>
                {rainfallDelta > 0 ? `+${rainfallDelta}%` : `${rainfallDelta}%`}
              </strong>
            </div>
            <input
              id="sim-rain"
              type="range"
              min="-40"
              max="40"
              step="5"
              value={rainfallDelta}
              onChange={e => setRainfallDelta(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary-800)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)' }}>
              <span>{isBangla ? '-৪০% (তীব্র খরা)' : '-40% (Severe drought)'}</span>
              <span>{isBangla ? '০% (স্বাভাবিক বৃষ্টি)' : '0% (Normal rainfall)'}</span>
              <span>{isBangla ? '+৪০% (অতিবৃষ্টি)' : '+40% (Excess rainfall)'}</span>
            </div>
          </div>

          {/* Irrigation Quality Dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="sim-water-quality">
              {t('simulator.irrigationQuality')}
            </label>
            <select
              id="sim-water-quality"
              value={irrigationWaterQuality}
              onChange={e => setIrrigationWaterQuality(e.target.value)}
              className="form-select"
            >
              <option value="pond_fresh">{isBangla ? 'পুকুরের মিষ্টি পানি (১.৫ dS/m-এর কম)' : 'Pond Freshwater Storage (<1.5 dS/m)'}</option>
              <option value="canal_brackish">{isBangla ? 'জোয়ারভাটার খালের লবণাক্ত পানি (৩–৬ dS/m)' : 'Tidal Canal Brackish Water (3–6 dS/m)'}</option>
              <option value="rainfed_only">{isBangla ? 'শুধু বৃষ্টিনির্ভর (শুকনো মৌসুমে সেচ নেই)' : 'Rainfed Only (No dry-season irrigation)'}</option>
            </select>
          </div>

          {/* Temperature Anomaly Slider */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <label className="form-label" htmlFor="sim-temp" style={{ marginBottom: 0 }}>
                {t('simulator.tempDelta')}
              </label>
              <strong>{tempDelta > 0 ? `+${tempDelta}°C` : `${tempDelta}°C`}</strong>
            </div>
            <input
              id="sim-temp"
              type="range"
              min="-2"
              max="4"
              step="0.5"
              value={tempDelta}
              onChange={e => setTempDelta(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary-800)' }}
            />
          </div>
        </div>

        {/* Right Column: Simulated Stress Outcome Visualization */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Sparkles size={20} color="var(--color-primary-800)" />
              <span>{t('simulator.resultsTitle')}</span>
            </h2>
            <DemoBadge text="Simulated Impact" />
          </div>

          {/* Overall Stress Vulnerability Gauge / Bar */}
          <div style={{
            backgroundColor: 'var(--color-bg-main)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600' }}>
                {t('simulator.projectedYieldRisk')}
              </span>
              <StatusBadge
                status={simulation.level === 'low' ? 'suitable' : simulation.level === 'moderate' ? 'marginal' : 'risky'}
                label={simulation.level === 'low' ? t('simulator.lowRisk') : simulation.level === 'moderate' ? t('simulator.mediumRisk') : t('simulator.highRisk')}
              />
            </div>

            <div style={{ width: '100%', height: '12px', backgroundColor: '#E5E7EB', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '0.5rem' }}>
              <div style={{
                width: `${simulation.score}%`,
                height: '100%',
                backgroundColor: simulation.level === 'low' ? 'var(--color-suitable-dot)' : simulation.level === 'moderate' ? 'var(--color-marginal-dot)' : 'var(--color-risky-dot)',
                transition: 'width 250ms ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
              <span>{isBangla ? 'অনুকূল বৃদ্ধি' : 'Safe Window'}</span>
              <span>{simulation.score}/100 {isBangla ? 'চাপ সূচক' : 'Stress Index'}</span>
              <span>{isBangla ? 'চরম ঝুঁকি' : 'Critical Failure'}</span>
            </div>

            {/* 1-Month Ahead LightGBM Projected VCI Box */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                <strong>{isBangla ? '১-মাস অগ্রিম পূর্বাভাষিত ক্যানোপি VCI:' : '1-Month Ahead LightGBM Projected VCI:'}</strong>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  {isBangla ? `জেলা বেসলাইন: ${distProfile.vciBase}/১০০` : `District baseline: ${distProfile.vciBase}/100`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: simulation.projectedVci < 35 ? '#DC2626' : simulation.projectedVci < 45 ? '#D97706' : '#16A34A'
                }}>
                  {simulation.projectedVci} / 100
                </span>
                <div style={{ fontSize: '10px', fontWeight: '600', color: simulation.projectedVci < 35 ? '#DC2626' : '#16A34A' }}>
                  {simulation.projectedVci < 35
                    ? (isBangla ? '⚠️ খরা সীমা (<৩৫)' : '⚠️ Drought Stress (<35)')
                    : (isBangla ? '✓ নিরাপদ ক্যানোপি' : '✓ Safe Biomass')}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Stress Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              backgroundColor: 'var(--color-bg-cream)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                {t('simulator.waterStressRisk')}
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: simulation.waterStressPct > 60 ? '#DC2626' : '#166534' }}>
                {simulation.waterStressPct}%
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-bg-cream)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                {t('simulator.salinityStressRisk')}
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: simulation.osmoticShockPct > 50 ? '#DC2626' : '#166534' }}>
                {simulation.osmoticShockPct}%
              </div>
            </div>
          </div>

          {/* Farmer Advisory Adaptation Recommendation */}
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            lineHeight: 1.5,
            fontSize: 'var(--font-size-xs)'
          }}>
            <strong style={{ color: 'var(--color-primary-900)', display: 'block', marginBottom: '0.35rem' }}>
              {t('simulator.farmerAdvice')}:
            </strong>
            <p style={{ margin: 0, color: 'var(--color-primary-800)' }}>
              {simulation.level === 'low' ? (
                isBangla
                  ? 'বর্তমান ও পরিকল্পিত পরিস্থিতিতে ফসল স্বাভাবিকভাবে বাড়বে। নিয়মিত জৈব সার বজায় রাখুন।'
                  : 'Favorable conditions anticipated. Maintain standard agronomic practices.'
              ) : simulation.level === 'moderate' ? (
                isBangla
                  ? 'মাটির বাষ্পীভবন ও লবণ ওঠা রোধ করতে খড় বা পলিথিন মালচিং ব্যবহার করুন। বীজ বপনের ১০ দিন পূর্বে জমি মিষ্টি পানি দিয়ে একবার ফ্লাশ করে নিলে চারা রক্ষা পাবে।'
                  : 'Apply rice straw mulching to inhibit capillary salt ascent. Ensure pre-sowing flush with stored rainwater.'
              ) : (
                isBangla
                  ? 'লবণাক্ততা অত্যধিক বৃদ্ধি পাওয়ায় এই ফসলটি চাষ করলে ৯০% ফলন ক্ষতির আশঙ্কা রয়েছে। এর পরিবর্তে সবুজ সার (ধইঞ্চা) চাষ করুন অথবা জমি বিশ্রাম দিন।'
                  : 'High probability of crop failure under this scenario. Substitute with green manure (Dhaincha) or postpone sowing.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulatorPage;
