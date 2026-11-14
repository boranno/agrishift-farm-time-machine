import React, { useState } from 'react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  CalendarDays,
  Filter,
  AlertTriangle,
  Info,
  Clock,
  Sun,
  CloudRain,
  Cloud
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { DEMO_WEATHER_DATA } from '../../services/weatherService';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const WeatherCalendarPage = () => {
  const { t, isBangla } = useTranslation();
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'weather'
  const [simulatedState, setSimulatedState] = useState('success'); // 'success' | 'loading' | 'nodata'

  const weather = DEMO_WEATHER_DATA;

  // Crop calendar events with seasonal stages
  const CALENDAR_CROPS = [
    {
      nameEn: 'T. Aman Rice (BRRI dhan73)',
      nameBn: 'রোপা আমন (ব্রি ধান৭৩)',
      season: 'kharif2',
      salinityClass: 'Moderate (7 dS/m)',
      sowingMonth: 'Jun – Jul',
      vegetativeMonth: 'Jul – Sep',
      harvestMonth: 'Oct – Nov',
      sowingOffset: 45, // percent of year
      sowingWidth: 10,
      vegetativeOffset: 55,
      vegetativeWidth: 20,
      harvestOffset: 75,
      harvestWidth: 12
    },
    {
      nameEn: 'Salt-Tolerant Boro Rice (BRRI dhan67)',
      nameBn: 'লবণ-সহনশীল বোরো (ব্রি ধান৬৭)',
      season: 'rabi',
      salinityClass: 'High (8 dS/m)',
      sowingMonth: 'Dec – Jan',
      vegetativeMonth: 'Jan – Mar',
      harvestMonth: 'Apr – May',
      sowingOffset: 92,
      sowingWidth: 12,
      vegetativeOffset: 4,
      vegetativeWidth: 22,
      harvestOffset: 26,
      harvestWidth: 12
    },
    {
      nameEn: 'Sunflower (BARI Surjomukhi-2)',
      nameBn: 'সূর্যমুখী (বারি সূর্যমুখী-২)',
      season: 'rabi',
      salinityClass: 'Very High (8.5 dS/m)',
      sowingMonth: 'Dec – Jan',
      vegetativeMonth: 'Jan – Feb',
      harvestMonth: 'Mar – Apr',
      sowingOffset: 94,
      sowingWidth: 10,
      vegetativeOffset: 4,
      vegetativeWidth: 15,
      harvestOffset: 19,
      harvestWidth: 10
    },
    {
      nameEn: 'Mustard (BARI Sarisha-14)',
      nameBn: 'সরিষা (বারি সরিষা-১৪)',
      season: 'rabi',
      salinityClass: 'Medium (5.5 dS/m)',
      sowingMonth: 'Nov – Dec',
      vegetativeMonth: 'Dec – Jan',
      harvestMonth: 'Feb',
      sowingOffset: 86,
      sowingWidth: 8,
      vegetativeOffset: 94,
      vegetativeWidth: 12,
      harvestOffset: 6,
      harvestWidth: 7
    },
    {
      nameEn: 'Green Manure / Dhaincha',
      nameBn: 'সবুজ সার / ধইঞ্চা',
      season: 'kharif1',
      salinityClass: 'Extreme (10 dS/m)',
      sowingMonth: 'Mar – Apr',
      vegetativeMonth: 'Apr – May',
      harvestMonth: 'Plough in May',
      sowingOffset: 20,
      sowingWidth: 8,
      vegetativeOffset: 28,
      vegetativeWidth: 12,
      harvestOffset: 40,
      harvestWidth: 4
    },
    {
      nameEn: 'Mungbean (BARI Mung-6)',
      nameBn: 'মুগডাল (বারি মুগ-৬)',
      season: 'kharif1',
      salinityClass: 'Low (4 dS/m)',
      sowingMonth: 'Mar',
      vegetativeMonth: 'Apr',
      harvestMonth: 'May',
      sowingOffset: 18,
      sowingWidth: 8,
      vegetativeOffset: 26,
      vegetativeWidth: 8,
      harvestOffset: 34,
      harvestWidth: 8
    }
  ];

  const filteredCrops = selectedSeason === 'all'
    ? CALENDAR_CROPS
    : CALENDAR_CROPS.filter(c => c.season === selectedSeason);

  const monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      <PageHeader
        title={t('weather.title')}
        subtitle={t('weather.subtitle')}
        badge={<DemoBadge text="Feature 4" />}
        actions={
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setSimulatedState(prev => prev === 'success' ? 'loading' : prev === 'loading' ? 'nodata' : 'success')}
              className="btn btn-secondary btn-sm"
              title={isBangla ? 'অবস্থা পরিবর্তন করুন (সফল / লোড হচ্ছে / খালি)' : 'Toggle State (Success / Loading / Empty)'}
            >
              <span>{isBangla ? 'অবস্থা:' : 'State:'} {isBangla
                ? { success: 'সফল', loading: 'লোড হচ্ছে', nodata: 'তথ্য নেই' }[simulatedState]
                : simulatedState}</span>
            </button>
          </div>
        }
        helpText={isBangla
          ? 'ফসলি ক্যালেন্ডারের সাহায্যে উপকূলীয় বাংলাদেশের তিনটি প্রধান মৌসুমে (রবি, খরিপ-১, খরিপ-২) বিভিন্ন ফসলের বপন, বৃদ্ধি ও কর্তনের সময়সূচি যাচাই করুন।'
          : 'The seasonal crop calendar outlines critical sowing, vegetative, and harvesting windows alongside micro-meteorological variables.'}
      />

      {/* Demo Notice Callout */}
      <div className="callout callout-demo">
        <Info size={18} />
        <span>{t('weather.sampleNotice')}</span>
      </div>

      {/* State Switcher Test Display */}
      {simulatedState === 'loading' && (
        <div className="card" style={{ padding: '2rem' }}>
          <LoadingSkeleton rows={5} height="28px" />
        </div>
      )}

      {simulatedState === 'nodata' && (
        <EmptyState
          title={isBangla ? 'কোনো আবহাওয়া তথ্য পাওয়া যায়নি' : 'No Meteorological Records Found'}
          description={isBangla ? 'এই খামারের স্থানাঙ্কের জন্য আবহাওয়া স্টেশন সক্রিয় নয়।' : 'No telemetry available for selected coordinates.'}
          action={<button onClick={() => setSimulatedState('success')} className="btn btn-primary">{t('common.reset')}</button>}
        />
      )}

      {simulatedState === 'success' && (
        <>
          {/* Top 7-Day Meteorological Outlook */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div className="card-header">
              <h2 className="card-title">
                <CloudSun size={20} color="var(--color-primary-800)" />
                <span>{t('weather.sevenDayForecast')}</span>
              </h2>
              <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                {weather.location}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              {weather.forecast7Day.map((d, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: idx === 0 ? 'var(--color-primary-50)' : 'var(--color-bg-main)',
                    border: idx === 0 ? '1px solid var(--color-primary-200)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.5rem',
                    textAlign: 'center',
                    minWidth: '85px'
                  }}
                >
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '0.4rem' }}>
                    {isBangla ? d.dayBn : d.dayEn}
                  </div>
                  <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' }}>
                    {d.icon === 'sun' && <Sun size={22} color="#D97706" />}
                    {d.icon === 'cloud-sun' && <CloudSun size={22} color="#D97706" />}
                    {d.icon === 'cloud-rain' && <CloudRain size={22} color="#2563EB" />}
                    {d.icon === 'cloud' && <Cloud size={22} color="#647067" />}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)' }}>
                    {d.maxTemp}° <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{d.minTemp}°</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    {d.rainProb}% rain
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seasonal Crop Calendar with Visual Gantt-style Timeline */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div className="card-header">
              <h2 className="card-title">
                <CalendarDays size={20} color="var(--color-primary-800)" />
                <span>{t('weather.cropCalendar')}</span>
              </h2>

              {/* Season Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={15} color="var(--color-text-secondary)" />
                <select
                  value={selectedSeason}
                  onChange={e => setSelectedSeason(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: 'var(--font-size-xs)' }}
                >
                  <option value="all">{t('seasons.all')}</option>
                  <option value="rabi">{t('seasons.rabi')}</option>
                  <option value="kharif1">{t('seasons.kharif1')}</option>
                  <option value="kharif2">{t('seasons.kharif2')}</option>
                </select>
              </div>
            </div>

            {/* Calendar Legend */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              marginBottom: '1rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--color-bg-cream)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#3B82F6', borderRadius: '2px' }}></span>
                <span>{t('weather.plantingWindow')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#22A06B', borderRadius: '2px' }}></span>
                <span>{t('weather.vegetativeWindow')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B', borderRadius: '2px' }}></span>
                <span>{t('weather.harvestWindow')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#EF4444', borderRadius: '2px' }}></span>
                <span>{t('weather.salinityStressWindow')}</span>
              </div>
            </div>

            {/* Month Header Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '190px repeat(12, 1fr)',
              gap: '2px',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.4rem',
              fontSize: '11px',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-secondary)',
              textAlign: 'center'
            }}>
              <div style={{ textAlign: 'left', paddingLeft: '0.5rem' }}>{isBangla ? 'ফসল' : 'Crop'}</div>
              {(isBangla ? monthsBn : monthsEn).map((m, idx) => (
                <div key={idx} style={{
                  backgroundColor: idx >= 1 && idx <= 4 ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  padding: '2px 0',
                  borderRadius: '2px'
                }}>
                  {m}
                </div>
              ))}
            </div>

            {/* Crop Timeline Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
              {filteredCrops.map((crop, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '190px 1fr',
                    gap: '0.5rem',
                    alignItems: 'center',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid #F1F4EB'
                  }}
                >
                  <div style={{ paddingLeft: '0.5rem' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-main)' }}>
                      {isBangla ? crop.nameBn : crop.nameEn}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      {crop.salinityClass}
                    </div>
                  </div>

                  {/* Relative 12-Month Bar Container */}
                  <div style={{
                    position: 'relative',
                    height: '24px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}>
                    {/* Peak Salinity Stress Zone Highlight (Feb–May: Months 2 to 5) */}
                    <div style={{
                      position: 'absolute',
                      left: '8.33%',
                      width: '33.33%',
                      top: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      borderLeft: '1px dashed #EF4444',
                      borderRight: '1px dashed #EF4444'
                    }} title={isBangla ? 'লবণাক্ততার সর্বোচ্চ ঝুঁকির সময়' : 'Peak Salinity Risk Window'} />

                    {/* Sowing Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${crop.sowingOffset}%`,
                        width: `${crop.sowingWidth}%`,
                        top: '3px',
                        bottom: '3px',
                        backgroundColor: '#3B82F6',
                        borderRadius: '3px'
                      }}
                      title={`Sowing: ${crop.sowingMonth}`}
                    />

                    {/* Vegetative Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${crop.vegetativeOffset}%`,
                        width: `${crop.vegetativeWidth}%`,
                        top: '3px',
                        bottom: '3px',
                        backgroundColor: '#22A06B',
                        borderRadius: '3px'
                      }}
                      title={`Growth: ${crop.vegetativeMonth}`}
                    />

                    {/* Harvest Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${crop.harvestOffset}%`,
                        width: `${crop.harvestWidth}%`,
                        top: '3px',
                        bottom: '3px',
                        backgroundColor: '#F59E0B',
                        borderRadius: '3px'
                      }}
                      title={`Harvest: ${crop.harvestMonth}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rainfall & Temperature Trend Visualizer Containers */}
          <div className="grid grid-cols-2">
            {/* Monthly Rainfall SVG Chart */}
            <div className="card">
              <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplets size={16} color="var(--color-info-dot)" />
                <span>{t('weather.rainfallChart')}</span>
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {isBangla ? 'নীল বার: বর্তমান মৌসুম | ড্যাশ লাইন: ১০ বছরের গড় বৃষ্টিপাত (মিমি)' : 'Blue bars: Current season | Dashed line: 10-Yr Historical Average (mm)'}
              </p>

              <div style={{ height: '180px', width: '100%' }}>
                <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
                  {/* Grid lines */}
                  <line x1="30" y1="20" x2="390" y2="20" stroke="#E5E7EB" strokeWidth="0.8" />
                  <line x1="30" y1="60" x2="390" y2="60" stroke="#E5E7EB" strokeWidth="0.8" />
                  <line x1="30" y1="100" x2="390" y2="100" stroke="#E5E7EB" strokeWidth="0.8" />
                  <line x1="30" y1="140" x2="390" y2="140" stroke="#CBD5E1" strokeWidth="1" />

                  {/* Y-axis labels */}
                  <text x="25" y="24" fill="#9CA3AF" fontSize="8" textAnchor="end">400</text>
                  <text x="25" y="64" fill="#9CA3AF" fontSize="8" textAnchor="end">250</text>
                  <text x="25" y="104" fill="#9CA3AF" fontSize="8" textAnchor="end">100</text>
                  <text x="25" y="142" fill="#9CA3AF" fontSize="8" textAnchor="end">0</text>

                  {/* Bars & Labels */}
                  {weather.monthlyRainfallComparison.map((r, i) => {
                    const x = 38 + i * 29;
                    const barHeight = (r.currentSeason / 420) * 120;
                    const y = 140 - barHeight;
                    return (
                      <g key={i}>
                        <rect x={x} y={y} width="16" height={barHeight} fill="#3B82F6" rx="2" fillOpacity="0.85" />
                        <text x={x + 8} y="152" fill="#6B7280" fontSize="8" textAnchor="middle">
                          {isBangla ? r.monthBn : r.monthEn}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Monthly Min/Max Temp SVG Chart */}
            <div className="card">
              <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Thermometer size={16} color="#DC2626" />
                <span>{t('weather.tempChart')}</span>
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {isBangla ? 'সর্বনিম্ন ও সর্বোচ্চ তাপমাত্রা পরিসর (°সে)' : 'Temperature variation range (°C)'}
              </p>

              <div style={{ height: '180px', width: '100%' }}>
                <svg viewBox="0 0 400 160" style={{ width: '100%', height: '100%' }}>
                  <line x1="30" y1="20" x2="390" y2="20" stroke="#E5E7EB" strokeWidth="0.8" />
                  <line x1="30" y1="70" x2="390" y2="70" stroke="#E5E7EB" strokeWidth="0.8" />
                  <line x1="30" y1="120" x2="390" y2="120" stroke="#E5E7EB" strokeWidth="0.8" />
                  <line x1="30" y1="140" x2="390" y2="140" stroke="#CBD5E1" strokeWidth="1" />

                  <text x="25" y="24" fill="#9CA3AF" fontSize="8" textAnchor="end">40°C</text>
                  <text x="25" y="74" fill="#9CA3AF" fontSize="8" textAnchor="end">25°C</text>
                  <text x="25" y="124" fill="#9CA3AF" fontSize="8" textAnchor="end">10°C</text>

                  {/* Range Bars */}
                  {weather.temperatureMonthly.map((tItem, i) => {
                    const x = 50 + i * 58;
                    const yTop = 140 - (tItem.max / 40) * 120;
                    const yBottom = 140 - (tItem.min / 40) * 120;
                    const height = yBottom - yTop;
                    return (
                      <g key={i}>
                        <rect x={x} y={yTop} width="22" height={height} fill="#F87171" rx="4" fillOpacity="0.75" />
                        <text x={x + 11} y={yTop - 4} fill="#B91C1C" fontSize="8" fontWeight="600" textAnchor="middle">{tItem.max}°</text>
                        <text x={x + 11} y={yBottom + 10} fill="#4B5563" fontSize="8" textAnchor="middle">{tItem.min}°</text>
                        <text x={x + 11} y="154" fill="#6B7280" fontSize="9" textAnchor="middle">
                          {isBangla ? tItem.monthBn : tItem.monthEn}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherCalendarPage;
