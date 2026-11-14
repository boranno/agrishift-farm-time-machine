import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  CalendarDays,
  Droplets,
  Layers,
  ChevronRight,
  ShieldCheck,
  Search,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import { CROPS_CATALOG, evaluateCropSuitability } from '../../services/cropService';
import { localizeFarmValue } from '../../utils/farmDisplay';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import StatusBadge from '../../components/common/StatusBadge';
import CropEvidencePanel from '../../components/crops/CropEvidencePanel';

export const CropSuitabilityPage = () => {
  const { t, isBangla } = useTranslation();
  const { farm, soil, season, setSeason } = useFarm();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all'); // 'all', 'suitable', 'marginal', 'risky'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  const soilEc = soil?.ec || 4.8;

  // Process crops through suitability rulebook
  const evaluatedCrops = CROPS_CATALOG.map(crop => {
    const evalResult = evaluateCropSuitability(crop, soilEc, season);
    return {
      ...crop,
      evaluation: evalResult
    };
  });

  // Filter crops
  const filteredCrops = evaluatedCrops.filter(c => {
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesTier = tierFilter === 'all' || c.evaluation.status === tierFilter;
    const matchesSearch = searchQuery === '' ||
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameBn.includes(searchQuery);
    return matchesCat && matchesTier && matchesSearch;
  });

  const countSuitable = evaluatedCrops.filter(c => c.evaluation.status === 'suitable').length;
  const countMarginal = evaluatedCrops.filter(c => c.evaluation.status === 'marginal').length;
  const countRisky = evaluatedCrops.filter(c => c.evaluation.status === 'risky').length;

  return (
    <div>
      <PageHeader
        title={t('cropSuitability.title')}
        subtitle={`${localizeFarmValue(farm?.upazila || 'Dacope', isBangla)}, ${localizeFarmValue(farm?.district || 'Khulna', isBangla)} — ${isBangla ? 'মাটির লবণাক্ততা:' : 'Current Soil Salinity:'} ${soilEc} dS/m (ECe)`}
        badge={<DemoBadge text="Feature 6" />}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/ml-suitability" className="btn btn-secondary btn-sm">
              <Sparkles size={14} color="var(--color-primary-800)" />
              <span>{isBangla ? 'এআই মডেল ভিউ' : 'AI Model View'}</span>
            </Link>
            <Link to="/rotation-planner" className="btn btn-primary btn-sm">
              <CalendarDays size={14} />
              <span>{t('nav.rotationPlanner')}</span>
            </Link>
          </div>
        }
        helpText={isBangla
          ? 'এটি একটি প্রদর্শনী নিয়মভিত্তিক স্ক্রিন, মাঠে যাচাইকৃত সুপারিশ নয়। ফসলভেদে গবেষণার প্রমাণের মান ভিন্ন; বপনের আগে স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।'
          : 'This is a demonstration rule-based screen, not a field-validated recommendation. Evidence quality varies by crop; consult local agricultural extension staff before sowing.'}
      />

      {/* Demo Rulebook Callout */}
      <div className="callout callout-demo">
        <Info size={18} />
        <span>{isBangla
          ? 'প্রদর্শনী স্কোর: প্রোটোটাইপের নিয়ম ব্যবহার করা হয়েছে; এগুলোকে যাচাইকৃত মাঠ-সুপারিশ হিসেবে ব্যবহার করবেন না।'
          : 'Demo scores: prototype rules are used; do not treat these as validated field recommendations.'}</span>
      </div>

      <CropEvidencePanel isBangla={isBangla} />

      {/* Farm Context & Season Switcher Banner */}
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
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-800)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sprout size={20} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {isBangla ? 'সক্রিয় পরিবেশগত পরামিতি' : 'Environmental Context'}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-900)' }}>
              {isBangla ? 'ইসি:' : 'EC:'} {soilEc} dS/m | {localizeFarmValue(farm?.soilType || 'Clay Loam', isBangla)} | {localizeFarmValue(farm?.waterSource || 'Pond storage', isBangla)}
            </div>
          </div>
        </div>

        {/* Season selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600' }}>{t('common.season')}:</span>
          {['all', 'rabi', 'kharif1', 'kharif2'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSeason(s)}
              className="btn btn-sm"
              style={{
                backgroundColor: season === s ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
                color: season === s ? '#FFFFFF' : 'var(--color-text-main)',
                fontSize: '11px',
                padding: '0.25rem 0.55rem'
              }}
            >
              {s === 'all' ? (isBangla ? 'সকল' : 'All') : s === 'rabi' ? (isBangla ? 'রবি' : 'Rabi') : s === 'kharif1' ? (isBangla ? 'খরিপ-১' : 'Kharif-1') : (isBangla ? 'খরিপ-২' : 'Kharif-2')}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Summary Pill Counters */}
      <div className="grid grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setTierFilter(tierFilter === 'suitable' ? 'all' : 'suitable')}
          className="card"
          style={{
            cursor: 'pointer',
            border: tierFilter === 'suitable' ? '2px solid var(--color-suitable-dot)' : '1px solid var(--color-border)',
            backgroundColor: tierFilter === 'suitable' ? 'var(--color-suitable-bg)' : 'var(--color-bg-surface)',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-suitable-text)' }}>
              {t('cropSuitability.suitableCount')}
            </span>
            <CheckCircle2 size={16} color="var(--color-suitable-dot)" />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-suitable-text)' }}>
            {countSuitable}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {isBangla ? 'লবণাক্ততা সহনশীলতার নিরাপদ সীমার মধ্যে' : 'Salinity within safe critical threshold'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setTierFilter(tierFilter === 'marginal' ? 'all' : 'marginal')}
          className="card"
          style={{
            cursor: 'pointer',
            border: tierFilter === 'marginal' ? '2px solid var(--color-marginal-dot)' : '1px solid var(--color-border)',
            backgroundColor: tierFilter === 'marginal' ? 'var(--color-marginal-bg)' : 'var(--color-bg-surface)',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-marginal-text)' }}>
              {t('cropSuitability.marginalCount')}
            </span>
            <AlertTriangle size={16} color="var(--color-marginal-dot)" />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-marginal-text)' }}>
            {countMarginal}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {isBangla ? 'বিশেষ পরিচর্যা ও মালচিং প্রয়োজন' : 'Requires mulching & management'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setTierFilter(tierFilter === 'risky' ? 'all' : 'risky')}
          className="card"
          style={{
            cursor: 'pointer',
            border: tierFilter === 'risky' ? '2px solid var(--color-risky-dot)' : '1px solid var(--color-border)',
            backgroundColor: tierFilter === 'risky' ? 'var(--color-risky-bg)' : 'var(--color-bg-surface)',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-risky-text)' }}>
              {t('cropSuitability.riskyCount')}
            </span>
            <XCircle size={16} color="var(--color-risky-dot)" />
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-risky-text)' }}>
            {countRisky}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {isBangla ? 'লবণাক্ততা বেশি হওয়ায় ক্ষতির ঝুঁকি' : 'Salinity exceeds maximum tolerance'}
          </p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isBangla ? 'ফসল খুঁজুন (সূর্যমুখী, ধান, সরিষা...)' : 'Search crop (sunflower, rice, mustard...)'}
              className="form-control"
              style={{ paddingLeft: '2rem', fontSize: 'var(--font-size-xs)' }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--color-text-secondary)" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: 'var(--font-size-xs)' }}
            >
              <option value="all">{t('cropSuitability.allTypes')}</option>
              <option value="cereals">{t('cropSuitability.cereals')}</option>
              <option value="pulses">{t('cropSuitability.pulses')}</option>
              <option value="oilseeds">{t('cropSuitability.oilseeds')}</option>
              <option value="cashCrops">{t('cropSuitability.cashCrops')}</option>
              <option value="vegetables">{t('cropSuitability.vegetables')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crop Cards Grid (3 cards per row on desktop, tall portrait layout) */}
      <div className="three-card-grid">
        {filteredCrops.map(crop => (
          <div
            key={crop.id}
            className="tall-portrait-card"
            style={{
              borderTop: `5px solid ${crop.evaluation.status === 'suitable' ? 'var(--color-suitable-dot)' : crop.evaluation.status === 'marginal' ? 'var(--color-marginal-dot)' : 'var(--color-risky-dot)'}`
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)' }}>
                  {isBangla ? crop.nameBn : crop.nameEn}
                </h3>
                <StatusBadge status={crop.evaluation.status} size="sm" />
              </div>

              <div style={{
                fontSize: 'var(--font-size-xs)',
                backgroundColor: 'var(--color-bg-main)',
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.75rem',
                lineHeight: 1.5,
                color: 'var(--color-text-secondary)'
              }}>
                {isBangla ? crop.evaluation.reasonBn : crop.evaluation.reasonEn}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('cropSuitability.salinityThreshold')}:</span>
                  <strong>{crop.criticalSalinityEc}–{crop.maxSalinityEc} dS/m</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('cropSuitability.growthDuration')}:</span>
                  <span>{crop.durationDays} {isBangla ? 'দিন' : 'days'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('cropSuitability.waterNeed')}:</span>
                  <span>{isBangla ? crop.waterNeedBn : crop.waterNeed}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCropModal(crop)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <span>{t('cropSuitability.viewPractices')}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Crop Details Modal / Drawer */}
      {selectedCropModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'fadeIn var(--transition-fast) ease-out'
          }}>
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-xl)' }}>
                  {isBangla ? selectedCropModal.nameBn : selectedCropModal.nameEn}
                </h3>
                <span className="badge badge-neutral" style={{ marginTop: '0.25rem' }}>
                  {selectedCropModal.category}
                </span>
              </div>
              <StatusBadge status={selectedCropModal.evaluation.status} />
            </div>

            <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                {isBangla ? selectedCropModal.descriptionBn : selectedCropModal.descriptionEn}
              </p>

              <div style={{
                backgroundColor: 'var(--color-bg-cream)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}>
                <strong style={{ display: 'block', color: 'var(--color-primary-900)', marginBottom: '0.35rem' }}>
                  {isBangla ? 'উপকূলীয় ঝুঁকি ও পরিচর্যার পরামর্শ:' : 'Risk Factors & Management Practice:'}
                </strong>
                <p style={{ fontSize: 'var(--font-size-xs)', margin: 0, color: 'var(--color-text-on-cream)' }}>
                  {isBangla ? selectedCropModal.riskFactorsBn : selectedCropModal.riskFactorsEn}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                <div><strong>{isBangla ? 'ফলনের সম্ভাবনা:' : 'Yield potential:'}</strong> {isBangla
                  ? selectedCropModal.yieldPotential
                    .replace(/ton\/ha/g, 'টন/হেক্টর')
                    .replace('green biomass', 'সবুজ জৈব পদার্থ')
                    .replace('fibre', 'আঁশ')
                  : selectedCropModal.yieldPotential}</div>
                <div><strong>{isBangla ? 'মাটির পিএইচ সীমা:' : 'Soil pH range:'}</strong> {selectedCropModal.soilPhMin} – {selectedCropModal.soilPhMax}</div>
                <div><strong>{isBangla ? 'উপযুক্ত মৌসুম:' : 'Suitable seasons:'}</strong> {selectedCropModal.seasons.map(season => t(`seasons.${season}`)).join(', ')}</div>
                <div><strong>{isBangla ? 'সর্বোচ্চ লবণাক্ততা:' : 'Maximum salinity:'}</strong> {selectedCropModal.maxSalinityEc} dS/m</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedCropModal(null)}
                className="btn btn-primary"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropSuitabilityPage;
