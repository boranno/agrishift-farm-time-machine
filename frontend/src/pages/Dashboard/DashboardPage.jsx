import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Sprout,
  FileText,
  SlidersHorizontal,
  Bell,
  CloudSun,
  Droplets,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  History,
  AlertTriangle,
  TrendingUp,
  Activity,
  Compass,
  CheckCircle2,
  Satellite,
  GitCompare,
  CloudRain,
  ThermometerSun,
  Wind,
  Check,
  HelpCircle,
  Cpu,
  Workflow,
  ShieldCheck,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import { COMPARISON_PLANS } from '../../services/rotationService';
import { getActiveSeasonNasaProfile, KHULNA_DISTRICT_PROFILES } from '../../services/nasaTelemetryService';
import { localizeFarmValue } from '../../utils/farmDisplay';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

export const DashboardPage = () => {
  const { t, isBangla } = useTranslation();
  const { farm, soil, season, setSeason, updateFarm, resetToDemoFarm } = useFarm();
  const [selectedMonitorDistrict, setSelectedMonitorDistrict] = useState(
    KHULNA_DISTRICT_PROFILES[farm?.district] ? farm.district : 'Khulna'
  );

  if (!farm) {
    return (
      <EmptyState
        title={t('dashboard.emptyTitle')}
        description={t('dashboard.emptyDesc')}
        action={
          <button type="button" onClick={resetToDemoFarm} className="btn btn-primary">
            <RotateCcw size={16} />
            <span>{t('dashboard.loadDemo')}</span>
          </button>
        }
      />
    );
  }

  const currentCrops = farm.currentCrops || {
    kharif1: 'Fallow / Weed Growth',
    kharif2: 'T. Aman Rice (Local Swarna)',
    rabi: 'Boro Rice (High Salinity Risk)'
  };

  const activeCropForSeason =
    season === 'rabi'
      ? currentCrops.rabi
      : season === 'kharif1'
        ? currentCrops.kharif1
        : currentCrops.kharif2;

  const activeDistrict = KHULNA_DISTRICT_PROFILES[selectedMonitorDistrict]
    ? selectedMonitorDistrict
    : (KHULNA_DISTRICT_PROFILES[farm.district] ? farm.district : 'Khulna');

  const nasaProfile = getActiveSeasonNasaProfile(activeDistrict, season, activeCropForSeason);

  const ecValue = soil?.ec || nasaProfile.districtProfile.baseSalinityEc || 4.8;
  const phValue = soil?.pH || 6.8;
  const omValue = soil?.organicMatter || 1.65;

  const ICON_MAP = {
    rain: CloudRain,
    heat: ThermometerSun,
    moisture: Droplets,
    ndvi: Activity,
    et: Wind
  };

  // 5 Core Dynamic NASA Environmental Indicators (updates live by Season & Khulna District)
  const NASA_INDICATORS = nasaProfile.indicators.map(ind => ({
    ...ind,
    icon: ICON_MAP[ind.id] || Satellite
  }));

  // Secondary Tools Catalog (Subordinated to primary sections)
  const SECONDARY_TOOLS = [
    {
      to: '/weather-calendar',
      titleEn: 'Weather Calendar',
      titleBn: 'আবহাওয়া ক্যালেন্ডার',
      descEn: '7-day outlook & planting windows',
      descBn: '৭ দিনের পূর্বাভাস ও বপন সময়সূচি',
      icon: CloudSun,
      color: '#D97706'
    },
    {
      to: '/soil-report',
      titleEn: 'Soil Report OCR',
      titleBn: 'মাটি পরীক্ষার ওসিআর',
      descEn: 'Digitize paper SRDI soil cards',
      descBn: 'এসআরডিআই কাগজের কার্ড স্ক্যান ও ডেটা',
      icon: FileText,
      color: '#7E22CE'
    },
    {
      to: '/crop-suitability',
      titleEn: 'Crop Suitability',
      titleBn: 'ফসল উপযোগিতা',
      descEn: 'Salinity limits for 25+ crops',
      descBn: '২৫+ ফসলের লবণ সহনশীলতা যাচাই',
      icon: Sprout,
      color: '#15803D'
    },
    {
      to: '/salinity-prediction',
      titleEn: 'Salinity Prediction (EC)',
      titleBn: 'লবণাক্ততা পূর্বাভাস (EC)',
      descEn: 'Dry-season EC dynamics across AEZ',
      descBn: 'মৌসুমি লবণ বৃদ্ধি ও ঝুঁকি ম্যাপিং',
      icon: Gauge,
      color: '#B45309'
    },
    {
      to: '/what-if-simulator',
      titleEn: 'What-If Simulator',
      titleBn: 'পরিস্থিতি সিমুলেটর',
      descEn: 'Test drought & salt variations',
      descBn: 'খরা ও লবণ বৃদ্ধির ঝুঁকি সিমুলেশন',
      icon: SlidersHorizontal,
      color: '#0D9488'
    },
    {
      to: '/alerts',
      titleEn: 'Farmer Alerts',
      titleBn: 'কৃষক সতর্কতা',
      descEn: 'Tidal surge & flood advisories',
      descBn: 'নোনা পানির জোয়ার ও আগাম বার্তা',
      icon: Bell,
      color: '#DC2626'
    },
    {
      to: '/data-sources',
      titleEn: 'Satellite Data Sources',
      titleBn: 'স্যাটেলাইট ডেটা পাইপলাইন',
      descEn: 'Open NASA telemetry specs & limits',
      descBn: 'নাসার উপগ্রহ রেজোলিউশন ও প্রোটোকল',
      icon: Satellite,
      color: '#0284C7'
    },
    {
      to: '/ml-suitability',
      titleEn: 'ML Suitability Model',
      titleBn: 'এআই ফসল উপযোগিতা',
      descEn: 'Machine-learning heuristics view',
      descBn: 'মেশিন লার্নিং অ্যালগরিদম ফলাফল',
      icon: Cpu,
      color: '#4F46E5'
    },
    {
      to: '/intelligent-rotation',
      titleEn: 'Intelligent Rotation',
      titleBn: 'বুদ্ধিমান ফসল চক্র',
      descEn: 'Multi-objective algorithmic engine',
      descBn: 'কৃত্রিম বুদ্ধিমত্তা চালিত ফসল বিন্যাস',
      icon: Workflow,
      color: '#16A34A'
    },
    {
      to: '/model-evaluation',
      titleEn: 'Model Evaluation',
      titleBn: 'মডেল মূল্যায়ন',
      descEn: 'PR-AUC 0.354 | Recall 60% | ΔVCI MAE 24.67',
      descBn: 'বৈজ্ঞানিক মানদণ্ড ও যাচাইকরণ রিপোর্ট',
      icon: ShieldCheck,
      color: '#2563EB'
    }
  ];

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={`${localizeFarmValue(farm.upazila, isBangla)}, ${localizeFarmValue(farm.district, isBangla)} — ${localizeFarmValue(farm.aez, isBangla)}`}
        badge={<DemoBadge text="NASA Decision Support" />}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/farm-map" className="btn btn-secondary btn-sm">
              <MapPin size={14} />
              <span>{t('common.changeLocation')}</span>
            </Link>
          </div>
        }
        helpText={isBangla
          ? 'আমার খামার ড্যাশবোর্ডে নাসার উপগ্রহ পর্যবেক্ষণ, মাটির বর্তমান স্বাস্থ্য এবং ৩-মৌসুমী ফসল পর্যায়ক্রম পরিকল্পনা স্পষ্টভাবে উপস্থাপন করা হয়েছে।'
          : 'My Farm Dashboard prioritizes NASA Earth observations and crop rotation decision support for resilient coastal agriculture.'}
      />

      {/* Farm Overview Status Banner with Green Reference Treatment */}
      <div className="green-reference-banner" style={{
        borderRadius: 'var(--radius-2xl)',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-reference-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative'
      }}>
        <div className="contour-lines-overlay"></div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: '0.65rem'
              }}>
                <Compass size={12} />
                <span>{Number(farm.latitude || 22.5721).toFixed(4)}°N, {Number(farm.longitude || 89.5105).toFixed(4)}°E</span>
                <span>•</span>
                <span>{localizeFarmValue(farm.soilType || 'Clay Loam (Ganges Alluvium)', isBangla)}</span>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                {localizeFarmValue(farm.upazila, isBangla)}, {localizeFarmValue(farm.district, isBangla)}
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: '#D1FAE5' }}>
                {localizeFarmValue(farm.aez, isBangla)} {isBangla ? '— লবণাক্ত পানির অনুপ্রবেশ প্রবণ উপকূলীয় এলাকা' : '— Saline Tidal Surge Inundation Delta Zone'}
              </p>
            </div>

            {/* Quick Status Tags */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(4px)',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
                textAlign: 'right'
              }}>
                <div style={{ color: '#A7F3D0', fontWeight: 'bold' }}>{isBangla ? 'জমি আয়তন' : 'Farm Area'}</div>
                <div>{farm.area || 3.5} {isBangla ? (farm.areaUnit === 'bigha' ? 'বিঘা' : 'হেক্টর') : (farm.areaUnit || 'bigha')}</div>
              </div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(4px)',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '11px',
                textAlign: 'right'
              }}>
                <div style={{ color: '#A7F3D0', fontWeight: 'bold' }}>{isBangla ? 'বর্তমান ফসল ধারা' : 'Current Crops'}</div>
                <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentCrops.kharif2} ➔ {currentCrops.rabi}
                </div>
              </div>
            </div>
          </div>

          {/* Season Selection Pill Bar inside Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={18} color="#A7F3D0" />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: '#FFFFFF' }}>
                {t('dashboard.currentSeason')}:
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'rabi', label: isBangla ? 'রবি (শীতকালীন শুষ্ক)' : 'Rabi (Winter Dry)' },
                { id: 'kharif1', label: isBangla ? 'খরিপ-১ (গ্রীষ্মকালীন প্রাক-বৃষ্টি)' : 'Kharif-1 (Pre-Monsoon)' },
                { id: 'kharif2', label: isBangla ? 'খরিপ-২ (বর্ষাকালীন প্লাবন)' : 'Kharif-2 (Monsoon Wet)' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeason(s.id)}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: season === s.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)',
                    color: season === s.id ? 'var(--color-primary-900)' : '#FFFFFF',
                    borderColor: season === s.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.25)',
                    fontWeight: season === s.id ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                    boxShadow: season === s.id ? '0 2px 4px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          PRIMARY SECTION 1: NASA FARM ENVIRONMENTAL INSIGHTS
          ========================================================= */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Satellite size={18} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--color-workspace-text)', margin: 0 }}>
                {t('dashboard.nasaSectionTitle')}
              </h2>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-workspace-subtext)', margin: '0.3rem 0 0 0' }}>
              {t('dashboard.nasaSectionSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FFFFFF', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <MapPin size={13} color="#15803D" />
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                {isBangla ? 'খুলনা বিভাগ জেলা:' : 'Khulna District:'}
              </span>
              <select
                value={activeDistrict}
                onChange={e => setSelectedMonitorDistrict(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--color-primary-900)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Object.keys(KHULNA_DISTRICT_PROFILES).map(d => (
                  <option key={d} value={d}>
                    {localizeFarmValue(d, isBangla)}
                  </option>
                ))}
              </select>
            </div>
            <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
              {isBangla ? nasaProfile.districtProfile.zoneLabelBn : nasaProfile.districtProfile.zoneLabelEn}
            </span>
            <Link to="/data-sources" className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '0.3rem 0.65rem' }}>
              <span>{isBangla ? 'সম্পূর্ণ পাইপলাইন ক্যাটালগ ➔' : 'Full Pipeline Specs ➔'}</span>
            </Link>
          </div>
        </div>

        {/* Active Cropping Season Context Strip */}
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span className="badge badge-suitable" style={{ fontSize: '10px', fontWeight: 'bold' }}>
              {isBangla ? nasaProfile.season.nameBn : nasaProfile.season.nameEn}
            </span>
            <span style={{ color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
              {isBangla ? 'সক্রিয় ফসল:' : 'Active Crop:'} {activeCropForSeason}
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              • {isBangla ? 'বৃদ্ধির পর্যায়:' : 'Growth Stage:'} {isBangla ? nasaProfile.season.cropStageBn : nasaProfile.season.cropStageEn}
            </span>
          </div>
          <Link to="/model-evaluation" style={{ fontSize: '11px', fontWeight: 'bold', color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <ShieldCheck size={14} />
            <span>{isBangla ? 'যাচাইকৃত LightGBM মডেল (PR-AUC ০.৩৫৪ | Recall ৬০%)' : 'Verified LightGBM Model (PR-AUC 0.354 | Recall 60%)'}</span>
          </Link>
        </div>

        {/* 5 Core NASA Indicator Cards Grid */}
        <div className="grid grid-cols-5" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {NASA_INDICATORS.map(ind => {
            const IconComponent = ind.icon;
            return (
              <div
                key={ind.id}
                className="card"
                style={{
                  borderTop: `4px solid ${ind.color}`,
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${ind.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent size={16} color={ind.color} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                      {ind.satellite}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                    {isBangla ? ind.nameBn : ind.nameEn}
                  </h3>

                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: ind.color, margin: '0.35rem 0' }}>
                    {isBangla ? ind.valueBn : ind.valueEn}
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    {isBangla ? ind.meaningBn : ind.meaningEn}
                  </p>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span className={`badge ${ind.badgeClass || 'badge-neutral'}`} style={{ fontSize: '9px', padding: '0.15rem 0.4rem' }}>
                    {isBangla ? ind.statusBn : ind.statusEn}
                  </span>
                  <Link to="/data-sources" style={{ color: ind.color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span>{isBangla ? 'বিবরণ' : 'Details'}</span>
                    <ChevronRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* 1-Month Ahead Multi-Hazard Early Warning Monitor (Drought VCI, Flood/Waterlogging, Storm Surge/Salinity) */}
        <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid #0284C7', backgroundColor: '#F8FAFC' }}>
          <div className="card-header" style={{ marginBottom: '0.85rem' }}>
            <div>
              <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} color="#0284C7" />
                <span>
                  {isBangla
                    ? `১-মাস অগ্রিম বহুমুখী দুর্যোগ পূর্বাভাস ও ফসলের ঝুঁকি (${localizeFarmValue(activeDistrict, true)} • ${nasaProfile.season.nameBn.split('(')[0].trim()})`
                    : `1-Month Ahead Multi-Hazard Early Warning Monitor (${activeDistrict} • ${nasaProfile.season.nameEn.split('(')[0].trim()})`}
                </span>
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0' }}>
                {isBangla
                  ? 'নাসা উপগ্রহ (MODIS, CHIRPS, ERA5-Land, Sentinel-1 SAR) ও LightGBM মডেলের সমন্বয়ে সক্রিয় ফসলের আগাম সতর্কতা'
                  : 'Powered by NASA Earth Observations (MODIS, CHIRPS, ERA5-Land, Sentinel-1 SAR) & Calibrated LightGBM Early-Warning Pipelines'}
              </p>
            </div>
            <Link to="/model-evaluation" className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
              <span>{isBangla ? 'মডেল বেঞ্চমার্ক দেখুন' : 'View ML Benchmark'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
            {nasaProfile.hazards.map(haz => {
              const barColor = haz.status === 'risky' ? '#DC2626' : haz.status === 'marginal' ? '#D97706' : '#16A34A';
              return (
                <div
                  key={haz.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#0284C7', textTransform: 'uppercase' }}>
                        {isBangla ? haz.modelBadgeBn : haz.modelBadgeEn}
                      </span>
                      <StatusBadge
                        status={haz.status}
                        label={isBangla ? haz.statusLabelBn : haz.statusLabelEn}
                      />
                    </div>

                    <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '0.4rem' }}>
                      {isBangla ? haz.titleBn : haz.titleEn}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: barColor }}>
                          {haz.probability}%
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginLeft: '4px' }}>
                          {isBangla ? `(সতর্কতা সীমা: ${haz.thresholdPct}%)` : `(Alert Thresh: ${haz.thresholdPct}%)`}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--color-primary-900)' }}>
                        {isBangla ? haz.forecastMetricBn : haz.forecastMetricEn}
                      </span>
                    </div>

                    <div className="meter-bar" style={{ height: '6px', marginBottom: '0.6rem' }}>
                      <div
                        className="meter-fill"
                        style={{
                          width: `${Math.min(100, haz.probability)}%`,
                          backgroundColor: barColor
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-bg-cream)',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1.45
                  }}>
                    <strong style={{ color: 'var(--color-primary-900)' }}>
                      {isBangla ? 'কৃষক পরামর্শ: ' : 'Advisory: '}
                    </strong>
                    {isBangla ? haz.advisoryBn : haz.advisoryEn}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supporting Metric Gauges & Trend Chart Row */}
        <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
          {/* Soil Salinity Status Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                  {t('dashboard.salinityLevel')}
                </span>
                <DemoBadge />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-900)', lineHeight: 1 }}>
                  {ecValue}
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>dS/m (ECe)</span>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <StatusBadge
                  status={ecValue <= 4.0 ? 'suitable' : ecValue <= 8.0 ? 'marginal' : 'risky'}
                  label={ecValue <= 4.0 ? (isBangla ? 'স্বাভাবিক লবণাক্ততা' : 'Low Salinity') : ecValue <= 8.0 ? (isBangla ? 'মাঝারি লবণাক্ততা' : 'Moderate Salinity') : (isBangla ? 'তীব্র লবণাক্ততা' : 'Severe Salinity')}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>
                  <span>0 dS/m</span>
                  <span>4.0</span>
                  <span>8.0</span>
                  <span>16 dS/m</span>
                </div>
                <div className="meter-bar">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${Math.min(100, (ecValue / 16) * 100)}%`,
                      backgroundColor: ecValue <= 4.0 ? '#16A34A' : ecValue <= 8.0 ? '#D97706' : '#DC2626'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              {isBangla ? 'উৎস: এসআরডিআই টেস্ট কার্ড ও স্যাটেলাইট সমন্বয়' : 'Source: SRDI Test Card & Satellite Ground Sync'}
            </p>
          </div>

          {/* Soil pH & Organic Matter Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                  {t('dashboard.soilHealthSummary')}
                </span>
                <DemoBadge />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--color-bg-cream)', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{t('dashboard.soilPh')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-800)', marginTop: '2px' }}>
                    {phValue}
                  </div>
                  <span className="badge badge-suitable" style={{ fontSize: '10px', marginTop: '4px' }}>
                    {isBangla ? 'নিরপেক্ষ (সুষম)' : 'Neutral (Good)'}
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-cream)', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{t('dashboard.organicMatter')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-800)', marginTop: '2px' }}>
                    {omValue}%
                  </div>
                  <span className="badge badge-marginal" style={{ fontSize: '10px', marginTop: '4px' }}>
                    {isBangla ? 'স্বল্প জৈব সার' : 'Low OM (<2%)'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '3px' }}>
                  <span>{isBangla ? 'বর্তমান কার্বন: ১.৬৫%' : 'Current OM: 1.65%'}</span>
                  <span>{isBangla ? 'লক্ষ্যমাত্রা: ২.৫০%' : 'Target: 2.50%'}</span>
                </div>
                <div className="meter-bar">
                  <div className="meter-fill" style={{ width: '66%', backgroundColor: '#22A06B' }}></div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              {isBangla ? 'সবুজ সার (ধইঞ্চা) চাষে জৈব পদার্থ বৃদ্ধির সুপারিশ' : 'Green manure cultivation strongly recommended'}
            </p>
          </div>

          {/* Salinity & Moisture Seasonal Trend Graph */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                  {isBangla ? 'আর্দ্রতা বনাম লবণাক্ততা ট্রেন্ড' : 'Moisture vs Salinity Trend'}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', fontSize: '10px' }}>
                  <span style={{ color: '#2563EB' }}>● {isBangla ? 'আর্দ্রতা' : 'Moisture'}</span>
                  <span style={{ color: '#D97706' }}>● {isBangla ? 'লবণ' : 'EC'}</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '110px' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 110" preserveAspectRatio="none">
                  <line x1="20" y1="20" x2="280" y2="20" stroke="#E2E8DF" strokeDasharray="3 3" />
                  <line x1="20" y1="60" x2="280" y2="60" stroke="#E2E8DF" strokeDasharray="3 3" />
                  <line x1="20" y1="95" x2="280" y2="95" stroke="#CBD5C8" />
                  {/* Salinity Trend (Rising) */}
                  <path d="M 30,80 L 90,75 L 150,60 L 210,45 L 270,30" fill="none" stroke="#D97706" strokeWidth="2.5" />
                  {/* Moisture Trend (Dropping) */}
                  <path d="M 30,30 L 90,40 L 150,55 L 210,75 L 270,85" fill="none" stroke="#2563EB" strokeWidth="2.5" />
                </svg>
              </div>

              <div style={{
                padding: '0.4rem 0.6rem',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                color: '#92400E',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <AlertTriangle size={13} color="#D97706" style={{ flexShrink: 0 }} />
                <span>
                  {isBangla ? 'নভেম্বরে মাটি শুকালে লবণ ৪.৮ থেকে ৬.৫+ dS/m হওয়ার পূর্বাভাস।' : 'Projected soil EC spike from 4.8 to 6.5+ dS/m as dry season advances.'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              {isBangla ? 'NASA SMAP উপগ্রহ ও এসআরডিআই হিসাব' : 'NASA SMAP Satellite & SRDI Calibration'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRIMARY SECTION 2: CROP ROTATION DECISION SUPPORT
          ========================================================= */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sprout size={18} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--color-workspace-text)', margin: 0 }}>
                {t('dashboard.rotationSectionTitle')}
              </h2>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-workspace-subtext)', margin: '0.3rem 0 0 0' }}>
              {t('dashboard.rotationSectionSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
              {isBangla ? 'বারি ও ব্রি গবেষণা ভিত্তিক' : 'BARI & BRRI Research-Aligned'}
            </span>
            <Link to="/rotation-planner" className="btn btn-primary btn-sm" style={{ fontSize: '11px', padding: '0.3rem 0.65rem' }}>
              <span>{isBangla ? 'পরিকল্পনা শুরু করুন ➔' : 'Open Rotation Planner ➔'}</span>
            </Link>
          </div>
        </div>

        {/* 3 Major Connected Decision Panels */}
        <div className="grid grid-cols-3" style={{ gap: '1.25rem', alignItems: 'stretch' }}>
          {/* Panel 1: My Farm Baseline & Goals */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #15803D' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#15803D', textTransform: 'uppercase' }}>
                  {isBangla ? 'ধাপ ১ • খামারের তথ্য' : 'Step 1 • My Farm Baseline'}
                </span>
                <MapPin size={16} color="#15803D" />
              </div>

              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>
                {isBangla ? 'বর্তমান ৩-মৌসুমী ফসল বিন্যাস' : 'Current 3-Season Cropping Pattern'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: 'var(--color-bg-cream)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.85rem', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'খরিপ-১ (গ্রীষ্ম):' : 'Kharif-1:'}</span>
                  <strong>{currentCrops.kharif1}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'খরিপ-২ (বর্ষা):' : 'Kharif-2:'}</span>
                  <strong>{currentCrops.kharif2}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'রবি (শীতকাল):' : 'Rabi:'}</span>
                  <strong style={{ color: '#B91C1C' }}>{currentCrops.rabi}</strong>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-primary-900)' }}>{isBangla ? 'চাষাবাদের অগ্রাধিকার: ' : 'Farmer Priorities: '}</strong>
                {isBangla ? 'মাটির স্বাস্থ্য রক্ষা এবং পানি সাশ্রয়' : 'Soil health restoration & water conservation'}
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/farm-map" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <span>{isBangla ? 'খামার ও ফসল আপডেট করুন' : 'Update Farm Profile & Crops'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Panel 2: Recommended 3-Season Rotation */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #0D9488', backgroundColor: '#F0FDF9' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0D9488', textTransform: 'uppercase' }}>
                  {isBangla ? 'ধাপ ২ • প্রস্তাবিত পর্যায়ক্রম' : 'Step 2 • Recommended Rotation'}
                </span>
                <CalendarDays size={16} color="#0D9488" />
              </div>

              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>
                {isBangla ? 'সবুজ সার ➔ রোপা আমন ➔ সূর্যমুখী' : 'Green Manure ➔ T. Aman ➔ Sunflower'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '11px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #CCFBF1' }}>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>{isBangla ? 'উপযোগিতা স্কোর' : 'Suitability Score'}</div>
                  <strong style={{ color: '#0D9488', fontSize: '13px' }}>92 / 100</strong>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #CCFBF1' }}>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>{isBangla ? 'পানির সাশ্রয়' : 'Water Conserved'}</div>
                  <strong style={{ color: '#0284C7', fontSize: '13px' }}>{isBangla ? '৬৫% কম পানি' : '65% less water'}</strong>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {isBangla
                  ? 'ধইঞ্চা মাটিতে ১৫ টন সবুজ সার যোগ করে এবং মে মাস পর্যন্ত বাষ্পীভবনে লবণ ওঠা রোধ করে। রবি মৌসুমে সূর্যমুখীর গভীর শিকড় মাটির রস টেনে নেয়।'
                  : 'Dhaincha incorporates 15 t/ha organic green manure to suppress summer salt crusting; deep taproot sunflower accesses subsoil moisture.'}
              </p>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/rotation-planner" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <span>{isBangla ? 'ফসল চক্র পরিকল্পনা দেখুন' : 'Explore Rotation Planner'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Panel 3: Compare 3 Strategies Side-by-Side */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #7C3AED' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#7C3AED', textTransform: 'uppercase' }}>
                  {isBangla ? 'ধাপ ৩ • কৌশল তুলনা' : 'Step 3 • Compare 3 Strategies'}
                </span>
                <GitCompare size={16} color="#7C3AED" />
              </div>

              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>
                {isBangla ? 'ভিত্তি বনাম মাটির স্বাস্থ্য বনাম পানি-সাশ্রয়' : 'Baseline vs Soil-Health vs Water-Resilience'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem', fontSize: '11px' }}>
                <div style={{ padding: '0.35rem 0.5rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #64748B' }}>
                  <strong>{isBangla ? 'কৌশল ১ (প্রচলিত):' : 'Strategy 1 (Baseline):'}</strong> {isBangla ? 'পতিত ➔ আমন ➔ অনাবাদি (লবণ বৃদ্ধি)' : 'Fallow ➔ Aman ➔ Dry Fallow'}
                </div>
                <div style={{ padding: '0.35rem 0.5rem', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #16A34A' }}>
                  <strong>{isBangla ? 'কৌশল ২ (মাটির স্বাস্থ্য):' : 'Strategy 2 (Soil Health):'}</strong> {isBangla ? 'ধইঞ্চা ➔ আমন ➔ সূর্যমুখী (লবণ হ্রাস)' : 'Dhaincha ➔ Aman ➔ Sunflower'}
                </div>
                <div style={{ padding: '0.35rem 0.5rem', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #0284C7' }}>
                  <strong>{isBangla ? 'কৌশল ৩ (পানি-সাশ্রয়ী):' : 'Strategy 3 (Water Res):'}</strong> {isBangla ? 'মুগডাল ➔ আমন ➔ রিলে খেসারি (সেচমুক্ত)' : 'Mungbean ➔ Aman ➔ Relay Khesari'}
                </div>
              </div>

              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                <ShieldAlert size={11} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
                <span>{isBangla ? 'উন্মুক্ত পর্যালোচনা: ট্রায়াল ফলাফল নির্দেশিকা মাত্র; চূড়ান্ত সিদ্ধান্তের আগে স্থানীয় উপসহকারী কৃষি কর্মকর্তার (ডিএই) পরামর্শ নিন।' : 'Agro-climatic classification; verify seasonal weather advisories and review with local DAE extension officers.'}</span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/scenario-comparison" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <span>{isBangla ? '৩টি কৌশলের পূর্ণাঙ্গ তুলনা' : 'Full 3-Strategy Comparison'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECONDARY SECTION: ADDITIONAL FARM TOOLS & DIAGNOSTICS
          ========================================================= */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--color-workspace-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layers size={16} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-workspace-text)', margin: 0 }}>
              {t('dashboard.secondaryToolsTitle')}
            </h2>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-workspace-subtext)', margin: '0.25rem 0 0 0' }}>
            {t('dashboard.secondaryToolsSubtitle')}
          </p>
        </div>

        {/* Compact 5-Column Grid of 10 Subordinated Tools */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.85rem'
        }}>
          {SECONDARY_TOOLS.map(tool => {
            const ToolIcon = tool.icon;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
                className="card-interactive"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${tool.color}15`,
                      color: tool.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ToolIcon size={16} />
                    </div>
                    <ArrowRight size={13} color="var(--color-text-muted)" />
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-text-main)', margin: '0 0 0.2rem 0' }}>
                    {isBangla ? tool.titleBn : tool.titleEn}
                  </h3>

                  <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    {isBangla ? tool.descBn : tool.descEn}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          RECENT FARM ACTIVITY LOG
          ========================================================= */}
      <div className="card" style={{ borderRadius: 'var(--radius-xl)' }}>
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <h3 className="card-title" style={{ fontSize: 'var(--font-size-base)' }}>
            <History size={18} color="var(--color-primary-800)" />
            <span>{t('dashboard.recentActions')}</span>
          </h3>
          <DemoBadge text="Activity Log" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {[
            {
              dateEn: 'Oct 26, 2026',
              dateBn: '২৬ অক্টোবর, ২০২৬',
              titleEn: 'Soil Report Digitized (Card #SRDI-KH-4029)',
              titleBn: 'মাটি পরীক্ষার রিপোর্ট ডিজিটাইজড সম্পন্ন (কার্ড #SRDI-KH-4029)',
              statusEn: 'EC: 4.8 dS/m, pH: 6.8',
              statusBn: 'লবণাক্ততা: ৪.৮ dS/m, পিএইচ: ৬.৮',
              type: 'soil'
            },
            {
              dateEn: 'Oct 24, 2026',
              dateBn: '২৪ অক্টোবর, ২০২৬',
              titleEn: 'Weather Alert Viewed: Heavy Rainfall Advisory',
              titleBn: 'আবহাওয়া সতর্কতা পর্যবেক্ষণ: আগাম বৃষ্টির পূর্বাভাস',
              statusEn: 'Drainage recommended',
              statusBn: 'পানি নিষ্কাশন আবশ্যক',
              type: 'weather'
            },
            {
              dateEn: 'Oct 21, 2026',
              dateBn: '২১ অক্টোবর, ২০২৬',
              titleEn: 'Crop Rotation Simulated: Dhaincha -> Aman -> Sunflower',
              titleBn: 'ফসল চক্র সিমুলেশন: ধইঞ্চা -> আমন -> সূর্যমুখী',
              statusEn: 'Suitability Score: 92/100',
              statusBn: 'উপযোগিতা স্কোর: ৯২/১০০',
              type: 'rotation'
            }
          ].map((act, idx) => (
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
                border: '1px solid var(--color-border)',
                transition: 'background-color 150ms ease'
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-text-main)', fontSize: 'var(--font-size-sm)' }}>
                  {isBangla ? act.titleBn : act.titleEn}
                </strong>
                <div style={{ color: 'var(--color-text-muted)', marginTop: '2px', fontSize: '11px' }}>
                  {isBangla ? act.dateBn : act.dateEn}
                </div>
              </div>
              <span className="badge badge-neutral" style={{ padding: '0.25rem 0.55rem', fontSize: '10px' }}>
                {isBangla ? act.statusBn : act.statusEn}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
