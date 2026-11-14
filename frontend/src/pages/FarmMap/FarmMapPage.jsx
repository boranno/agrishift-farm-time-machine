import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Compass,
  Layers,
  LocateFixed,
  Globe,
  PenTool,
  Info,
  Database,
  Sprout,
  Droplets,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import {
  BANGLADESH_COASTAL_DISTRICTS,
  validateCoordinates,
  isWithinBangladesh
} from '../../services/farmService';
import FarmMapViewer from '../../components/maps/FarmMapViewer';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';

export const FarmMapPage = () => {
  const { t, isBangla } = useTranslation();
  const { farm, updateFarm, resetToDemoFarm } = useFarm();

  const [district, setDistrict] = useState(farm?.district || 'Khulna');
  const [upazila, setUpazila] = useState(farm?.upazila || 'Dacope');
  const [union, setUnion] = useState(farm?.union || 'Bajua');
  const [latitude, setLatitude] = useState(farm?.latitude || 22.5721);
  const [longitude, setLongitude] = useState(farm?.longitude || 89.5105);
  const [area, setArea] = useState(farm?.area || 3.5);
  const [areaUnit, setAreaUnit] = useState(farm?.areaUnit || 'bigha');
  const [soilType, setSoilType] = useState(farm?.soilType || 'Clay Loam (Ganges Alluvium)');
  const [waterSource, setWaterSource] = useState(farm?.waterSource || 'Rainfed + Pond Storage (Scarce dry-season water)');
  const [farmBoundary, setFarmBoundary] = useState(farm?.boundary || []);
  const [detectedAccuracy, setDetectedAccuracy] = useState(null);

  // Current crop rotation inputs
  const [kharif1Crop, setKharif1Crop] = useState(farm?.currentCrops?.kharif1 || 'Fallow / Weed Growth');
  const [kharif2Crop, setKharif2Crop] = useState(farm?.currentCrops?.kharif2 || 'T. Aman Rice (Local Swarna)');
  const [rabiCrop, setRabiCrop] = useState(farm?.currentCrops?.rabi || 'Boro Rice (High Salinity Risk)');

  // Farmer optimization priorities
  const [priorities, setPriorities] = useState(farm?.farmerPriorities || ['soil', 'water']);

  const [formError, setFormError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if farm context changes
  useEffect(() => {
    if (farm) {
      if (farm.currentCrops) {
        setKharif1Crop(farm.currentCrops.kharif1 || 'Fallow / Weed Growth');
        setKharif2Crop(farm.currentCrops.kharif2 || 'T. Aman Rice (Local Swarna)');
        setRabiCrop(farm.currentCrops.rabi || 'Boro Rice (High Salinity Risk)');
      }
      if (farm.farmerPriorities) {
        setPriorities(farm.farmerPriorities);
      }
    }
  }, [farm]);

  // Check if current coordinates fall within Bangladesh
  const isLocalBd = isWithinBangladesh(latitude, longitude);

  // Selected district info
  const selectedDistrictData = BANGLADESH_COASTAL_DISTRICTS.find(d => d.name === district) || BANGLADESH_COASTAL_DISTRICTS[0];

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    const dData = BANGLADESH_COASTAL_DISTRICTS.find(d => d.name === newDist);
    if (dData && dData.upazilas.length > 0) {
      setUpazila(dData.upazilas[0].name);
      setLatitude(dData.upazilas[0].defaultLat);
      setLongitude(dData.upazilas[0].defaultLon);
    }
    setSaveSuccess(false);
  };

  const handleUpazilaChange = (e) => {
    const newUpazila = e.target.value;
    setUpazila(newUpazila);
    const uData = selectedDistrictData.upazilas.find(u => u.name === newUpazila);
    if (uData) {
      setLatitude(uData.defaultLat);
      setLongitude(uData.defaultLon);
    }
    setSaveSuccess(false);
  };

  const handleMapCoordSelect = (lat, lon, accuracy = null) => {
    setLatitude(lat);
    setLongitude(lon);
    if (accuracy) {
      setDetectedAccuracy(accuracy);
    }
    setSaveSuccess(false);
  };

  const handleBoundaryChange = (coords, areaStats) => {
    setFarmBoundary(coords);
    if (areaStats) {
      if (areaUnit === 'bigha') setArea(areaStats.bigha);
      else if (areaUnit === 'acre') setArea(areaStats.acre);
      else if (areaUnit === 'hectare') setArea(areaStats.hectare);
      else if (areaUnit === 'decimal') setArea(areaStats.decimal);
    }
  };

  const togglePriority = (key) => {
    setPriorities(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setSaveSuccess(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      setFormError(isBangla ? validation.messageBn : validation.messageEn);
      return;
    }

    updateFarm({
      district: isLocalBd ? district : (isBangla ? 'আন্তর্জাতিক / অন্যান্য' : 'Global / Other'),
      upazila: isLocalBd ? upazila : `${Number(latitude).toFixed(3)}°N, ${Number(longitude).toFixed(3)}°E`,
      union,
      aez: isLocalBd ? selectedDistrictData.aez : 'Global Non-Delta Zone',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      area: parseFloat(area),
      areaUnit,
      soilType,
      waterSource,
      boundary: farmBoundary,
      currentCrops: {
        kharif1: kharif1Crop,
        kharif2: kharif2Crop,
        rabi: rabiCrop
      },
      farmerPriorities: priorities
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleResetDemo = () => {
    resetToDemoFarm();
    setDistrict('Khulna');
    setUpazila('Dacope');
    setUnion('Bajua');
    setLatitude(22.5721);
    setLongitude(89.5105);
    setArea(3.5);
    setAreaUnit('bigha');
    setSoilType('Clay Loam (Ganges Alluvium)');
    setWaterSource('Rainfed + Pond Storage (Scarce dry-season water)');
    setFarmBoundary([]);
    setDetectedAccuracy(null);
    setKharif1Crop('Fallow / Weed Growth');
    setKharif2Crop('T. Aman Rice (Local Swarna)');
    setRabiCrop('Boro Rice (High Salinity Risk)');
    setPriorities(['soil', 'water']);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const priorityOptions = [
    { key: 'soil', labelEn: 'Soil Health & Salt Suppression', labelBn: 'মাটির স্বাস্থ্য ও লবণ হ্রাস', icon: Sprout, color: '#15803D' },
    { key: 'water', labelEn: 'Water Conservation & Drought Safety', labelBn: 'পানি সংরক্ষণ ও খরা সহনশীলতা', icon: Droplets, color: '#0284C7' },
    { key: 'income', labelEn: 'Market Return & Cash Crop Value', labelBn: 'উচ্চ বাজারমূল্য ও আর্থিক মুনাফা', icon: TrendingUp, color: '#B45309' },
    { key: 'food', labelEn: 'Household Food & Protein Security', labelBn: 'পারিবারিক খাদ্য ও পুষ্টি নিরাপত্তা', icon: ShieldCheck, color: '#7E22CE' }
  ];

  return (
    <div>
      <PageHeader
        title={t('farmMap.title')}
        subtitle={t('farmMap.subtitle')}
        badge={<DemoBadge text="Feature 2 — World Map & Farm Profile" />}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleResetDemo} className="btn btn-secondary btn-sm">
              <RotateCcw size={14} />
              <span>{t('farmMap.useDemoLocation')}</span>
            </button>
          </div>
        }
        helpText={isBangla
          ? 'বিশ্বব্যাপী যে-কোনো স্থানের মানচিত্র জুম ও প্যান করুন, ডিভাইস জিপিএস দিয়ে নিজের অবস্থান শনাক্ত করুন, খামারের সীমানা ও বর্তমান ৩ মৌসুমের ফসল নির্ধারণ করুন।'
          : 'Interactive world-scale agricultural mapping powered by MapLibre GL JS. Configure farm coordinates, boundary parcel, current seasonal crops, and agronomic priorities.'}
      />

      {/* Honest Local Browser Storage Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
          <Database size={16} color="#64748B" />
          <span>
            {isBangla
              ? 'স্থানীয় ব্রাউজার সংরক্ষণ: আপনার খামারের ভৌগোলিক স্থানাঙ্ক ও ফসলের তথ্য শুধুমাত্র এই ব্রাউজারে (LocalStorage) সংরক্ষিত হয়। কোনো রিমোট ক্লাউড সার্ভারে পাঠানো হয় না।'
              : 'Local Browser Storage: Your farm coordinates, parcel boundary, and crop selections are saved exclusively in your browser’s localStorage. No remote cloud synchronization is active in this phase.'}
          </span>
        </div>
        <span className="badge badge-neutral" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
          {isBangla ? 'ব্রাউজারে সংরক্ষিত' : 'Client-Side Only'}
        </span>
      </div>

      {saveSuccess && (
        <div className="callout callout-info animate-fade-in" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} color="var(--color-primary-600)" />
          <span>{t('farmMap.savedSuccess')}</span>
        </div>
      )}

      {formError && (
        <div className="callout" style={{ backgroundColor: 'var(--color-risky-bg)', borderColor: 'var(--color-risky-border)', color: 'var(--color-risky-text)', marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Layout: Left Form & Right Interactive Map */}
      <div className="grid grid-cols-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Form Controls */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <MapPin size={20} color="var(--color-primary-800)" />
              <span>{isBangla ? '১. খামারের ভৌগোলিক তথ্য' : '1. Farm Profile Details'}</span>
            </h2>

            {isLocalBd ? (
              <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
                {isBangla ? 'বাংলাদেশ উপকূলীয় জোন' : 'Bangladesh Delta Zone'}
              </span>
            ) : (
              <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                <Globe size={12} />
                <span>{isBangla ? 'বৈশ্বিক স্থানাঙ্ক' : 'Global Coordinates'}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave}>
            {/* Bangladesh Regional Selectors */}
            {isLocalBd ? (
              <>
                <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="farm-district">
                      {t('farmMap.district')}
                    </label>
                    <select
                      id="farm-district"
                      value={district}
                      onChange={handleDistrictChange}
                      className="form-select"
                    >
                      {BANGLADESH_COASTAL_DISTRICTS.map(d => (
                        <option key={d.name} value={d.name}>
                          {isBangla ? d.nameBn : d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="farm-upazila">
                      {t('farmMap.upazila')}
                    </label>
                    <select
                      id="farm-upazila"
                      value={upazila}
                      onChange={handleUpazilaChange}
                      className="form-select"
                    >
                      {selectedDistrictData.upazilas.map(u => (
                        <option key={u.name} value={u.name}>
                          {isBangla ? u.nameBn : u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="farm-union">
                    {t('farmMap.union')}
                  </label>
                  <input
                    id="farm-union"
                    type="text"
                    value={union}
                    onChange={e => {
                      setUnion(e.target.value);
                      setSaveSuccess(false);
                    }}
                    placeholder={isBangla ? 'যেমন: বাজুয়া / কৈলাশগঞ্জ' : 'e.g. Bajua / Kailashganj'}
                    className="form-control"
                  />
                </div>
              </>
            ) : (
              <div className="callout callout-demo" style={{ marginBottom: '1rem' }}>
                <Globe size={16} />
                <span>
                  {isBangla
                    ? 'আপনি বাংলাদেশের উপকূলীয় ক্লাস্টারের বাইরের স্থানাঙ্ক নির্বাচন করেছেন। গ্লোবাল প্রোটোটাইপ মোড সক্রিয়।'
                    : 'Coordinates outside the Bangladesh coastal cluster. Operating in Global Exploration Mode.'}
                </span>
              </div>
            )}

            {/* Latitude & Longitude Inputs */}
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '0.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="farm-lat">
                  {t('farmMap.latitude')}
                </label>
                <input
                  id="farm-lat"
                  type="number"
                  step="0.00001"
                  min="-90"
                  max="90"
                  value={latitude}
                  onChange={e => {
                    setLatitude(e.target.value);
                    setSaveSuccess(false);
                  }}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="farm-lon">
                  {t('farmMap.longitude')}
                </label>
                <input
                  id="farm-lon"
                  type="number"
                  step="0.00001"
                  min="-180"
                  max="180"
                  value={longitude}
                  onChange={e => {
                    setLongitude(e.target.value);
                    setSaveSuccess(false);
                  }}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-hint" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={13} color="var(--color-primary-700)" />
              <span>
                {isBangla
                  ? 'ম্যাপে ক্লিক করে বা পিন ড্র্যাগ করে যে-কোনো স্থান নির্বাচন করতে পারেন।'
                  : 'Click on the map or drag the pin to dynamically synchronize coordinates.'}
              </span>
            </div>

            {/* Farm Area & Unit */}
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="farm-area">
                  {t('farmMap.area')}
                </label>
                <input
                  id="farm-area"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="farm-unit">
                  {t('farmMap.areaUnit')}
                </label>
                <select
                  id="farm-unit"
                  value={areaUnit}
                  onChange={e => setAreaUnit(e.target.value)}
                  className="form-select"
                >
                  <option value="bigha">{t('farmMap.areaUnits.bigha')}</option>
                  <option value="acre">{t('farmMap.areaUnits.acre')}</option>
                  <option value="hectare">{t('farmMap.areaUnits.hectare')}</option>
                  <option value="decimal">{t('farmMap.areaUnits.decimal')}</option>
                </select>
              </div>
            </div>

            {/* Soil & Water Context */}
            <div className="form-group">
              <label className="form-label" htmlFor="farm-soil">
                {t('farmMap.soilType')}
              </label>
              <select
                id="farm-soil"
                value={soilType}
                onChange={e => setSoilType(e.target.value)}
                className="form-select"
              >
                <option value="Clay Loam (Ganges Alluvium)">{isBangla ? 'গঙ্গা পলির দোআঁশ' : 'Clay Loam (Ganges Alluvium)'}</option>
                <option value="Saline Heavy Clay">{isBangla ? 'ভারী লবণাক্ত এঁটেল মাটি' : 'Saline Heavy Clay'}</option>
                <option value="Silty Clay Loam">{isBangla ? 'পলি এঁটেল দোআঁশ' : 'Silty Clay Loam'}</option>
                <option value="Sandy Loam / Coastal Char">{isBangla ? 'বেলে দোআঁশ / উপকূলীয় চর মাটি' : 'Sandy Loam / Coastal Char'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="farm-water">
                {t('farmMap.waterSource')}
              </label>
              <select
                id="farm-water"
                value={waterSource}
                onChange={e => setWaterSource(e.target.value)}
                className="form-select"
              >
                <option value="Rainfed + Pond Storage (Scarce dry-season water)">{isBangla ? 'বৃষ্টির পানি ও পুকুরের মজুত মিষ্টি পানি' : 'Rainfed + Pond Freshwater'}</option>
                <option value="Canal Irrigation (Moderate Salinity 2-5 dS/m)">{isBangla ? 'খালের পানি (মাঝারি লবণাক্ততা ২–৫ dS/m)' : 'Canal Water (Moderate Salinity 2–5 dS/m)'}</option>
                <option value="Deep Tube-well (Freshwater)">{isBangla ? 'গভীর নলকূপের মিষ্টি পানি' : 'Deep Tube-well (Freshwater)'}</option>
                <option value="Rainfed Only (Zero Dry-Season Water)">{isBangla ? 'শুধু বৃষ্টির পানি (শুকনো মৌসুমে সেচ নেই)' : 'Rainfed Only (No Dry-Season Water)'}</option>
              </select>
            </div>

            {/* Section 2: Current Crop Rotation Information */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Sprout size={18} color="var(--color-primary-800)" />
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-primary-900)', margin: 0 }}>
                  {isBangla ? '২. বর্তমান ৩ মৌসুমের ফসল' : '2. Current 3-Season Cropping Pattern'}
                </h3>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                {isBangla
                  ? 'আপনার জমিতে বর্তমানে যে ফসলগুলো চাষ করছেন তা নির্বাচন করুন। এর ওপর ভিত্তি করে বিকল্প কৌশল তৈরি হবে।'
                  : 'Specify the crops currently grown in each season to evaluate transitions toward climate-resilient rotations.'}
              </p>

              {/* Kharif-1 Crop */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" htmlFor="crop-kharif1" style={{ fontSize: '11px' }}>
                  {isBangla ? 'খরিপ-১ (গ্রীষ্ম / চৈত্র-জ্যৈষ্ঠ):' : 'Kharif-1 (Pre-Monsoon / Summer):'}
                </label>
                <select
                  id="crop-kharif1"
                  value={kharif1Crop}
                  onChange={e => {
                    setKharif1Crop(e.target.value);
                    setSaveSuccess(false);
                  }}
                  className="form-select"
                >
                  <option value="Fallow / Weed Growth">{isBangla ? 'পতিত জমি / আগাছা (Fallow / Weeds)' : 'Fallow / Weed Growth'}</option>
                  <option value="Aus Rice (BRRI dhan48)">{isBangla ? 'আউশ ধান (ব্রি ধান৪৮)' : 'Aus Rice (BRRI dhan48)'}</option>
                  <option value="Green Manure / Dhaincha">{isBangla ? 'সবুজ সার / ধইঞ্চা (Dhaincha)' : 'Green Manure / Dhaincha'}</option>
                  <option value="Mungbean (BARI Mung-6)">{isBangla ? 'গ্রীষ্মকালীন মুগডাল (বারি মুগ-৬)' : 'Summer Mungbean (BARI Mung-6)'}</option>
                  <option value="Jute">{isBangla ? 'পাট (Jute)' : 'Jute'}</option>
                  <option value="Summer Vegetables">{isBangla ? 'গ্রীষ্মকালীন শাকসবজি' : 'Summer Vegetables'}</option>
                </select>
              </div>

              {/* Kharif-2 Crop */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" htmlFor="crop-kharif2" style={{ fontSize: '11px' }}>
                  {isBangla ? 'খরিপ-২ (বর্ষাকাল / আষাঢ়-কার্তিক):' : 'Kharif-2 (Monsoon / Aman Season):'}
                </label>
                <select
                  id="crop-kharif2"
                  value={kharif2Crop}
                  onChange={e => {
                    setKharif2Crop(e.target.value);
                    setSaveSuccess(false);
                  }}
                  className="form-select"
                >
                  <option value="T. Aman Rice (Local Swarna)">{isBangla ? 'রোপা আমন (স্থানীয় স্বর্ণা/মোটা ধান)' : 'T. Aman Rice (Local Swarna)'}</option>
                  <option value="T. Aman Rice (BRRI dhan73/87)">{isBangla ? 'উফশী আমন (ব্রি ধান৭৩ / ব্রি ধান৮৭)' : 'HYV Aman Rice (BRRI dhan73/87)'}</option>
                  <option value="Fallow / Waterlogged">{isBangla ? 'জলাবদ্ধ / অনাবাদি' : 'Waterlogged / Fallow'}</option>
                </select>
              </div>

              {/* Rabi Crop */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="crop-rabi" style={{ fontSize: '11px' }}>
                  {isBangla ? 'রবি (শীতকাল / অগ্রহায়ণ-ফাল্গুন):' : 'Rabi (Winter / Dry Season):'}
                </label>
                <select
                  id="crop-rabi"
                  value={rabiCrop}
                  onChange={e => {
                    setRabiCrop(e.target.value);
                    setSaveSuccess(false);
                  }}
                  className="form-select"
                >
                  <option value="Boro Rice (High Salinity Risk)">{isBangla ? 'বোরো ধান (উচ্চ সেচ ও নোনা পানির ঝুঁকি)' : 'Boro Rice (High Salinity Risk)'}</option>
                  <option value="Salt-Tolerant Boro (BRRI dhan67)">{isBangla ? 'লবণ-সহনশীল বোরো ধান (ব্রি ধান৬৭)' : 'Salt-Tolerant Boro (BRRI dhan67)'}</option>
                  <option value="Sunflower (BARI Surjomukhi-2)">{isBangla ? 'সূর্যমুখী (বারি সূর্যমুখী-২)' : 'Sunflower (BARI Surjomukhi-2)'}</option>
                  <option value="Relay Khesari">{isBangla ? 'রিলে খেসারি (স্বল্প পানি)' : 'Relay Khesari (Zero Irrigation)'}</option>
                  <option value="Mustard (BARI Sarisha-14)">{isBangla ? 'সরিষা (বারি সরিষা-১৪)' : 'Mustard (BARI Sarisha-14)'}</option>
                  <option value="Maize">{isBangla ? 'ভুট্টা (Maize)' : 'Maize'}</option>
                  <option value="Dry Fallow / Grazing">{isBangla ? 'অনাবাদি শুকনো পতিত জমি' : 'Dry Fallow / Grazing'}</option>
                </select>
              </div>
            </div>

            {/* Section 3: Farmer Priorities */}
            <div style={{ marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={18} color="var(--color-primary-800)" />
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-primary-900)', margin: 0 }}>
                  {isBangla ? '৩. আপনার চাষাবাদের অগ্রাধিকার' : '3. Farmer Decision Priorities'}
                </h3>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                {isBangla
                  ? 'আপনার কাছে কোনটি সবচেয়ে গুরুত্বপূর্ণ? এক বা একাধিক নির্বাচন করুন:'
                  : 'Select your key operational objectives to optimize rotation recommendations:'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {priorityOptions.map(p => {
                  const isSelected = priorities.includes(p.key);
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => togglePriority(p.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.08)' : '#F9FAFB',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={16} color={p.color} />
                        <span style={{ fontSize: '12px', fontWeight: isSelected ? '600' : '500', color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                          {isBangla ? p.labelBn : p.labelEn}
                        </span>
                      </div>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid #CBD5E1',
                        backgroundColor: isSelected ? p.color : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <Save size={16} />
              <span>{isBangla ? 'খামার ও ফসলের তথ্য সংরক্ষণ করুন' : 'Save Farm Profile & Crop Priorities'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: World-Scale Interactive Map Viewer */}
        <div>
          <FarmMapViewer
            latitude={latitude}
            longitude={longitude}
            boundary={farmBoundary}
            district={district}
            upazila={upazila}
            onCoordinateSelect={handleMapCoordSelect}
            onBoundaryChange={handleBoundaryChange}
            isInteractive={true}
          />

          {/* Location & Boundary Summary Card */}
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={18} color="var(--color-primary-700)" />
              <span>{isBangla ? 'খামার ও ফসল সারসংক্ষেপ' : 'Farm & Crop Summary'}</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>{t('farmMap.district')}:</span>
                <div style={{ fontWeight: '600' }}>{isLocalBd ? district : (isBangla ? 'আন্তর্জাতিক' : 'Global')}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>{t('farmMap.upazila')}:</span>
                <div style={{ fontWeight: '600' }}>{isLocalBd ? upazila : '—'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>{isBangla ? 'স্থানাঙ্ক' : 'Coordinates'}:</span>
                <div style={{ fontWeight: '600' }}>{Number(latitude).toFixed(5)}°N, {Number(longitude).toFixed(5)}°E</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)' }}>{t('farmMap.area')}:</span>
                <div style={{ fontWeight: '600' }}>{area} {areaUnit}</div>
              </div>
              <div style={{ gridColumn: 'span 2', backgroundColor: 'var(--color-bg-cream)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-primary-800)', fontWeight: '600' }}>
                  {isBangla ? 'বর্তমান ফসল ধারা: ' : 'Current Crop Sequence: '}
                </span>
                <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {kharif1Crop} ➔ {kharif2Crop} ➔ {rabiCrop}
                </div>
              </div>
              {farmBoundary.length >= 3 && (
                <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(34, 197, 94, 0.08)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--color-primary-800)', fontWeight: '600' }}>
                    {isBangla ? 'সীমানা বহুভুজ সংরক্ষিত: ' : 'Parcel Boundary Saved: '}
                  </span>
                  <span>{farmBoundary.length} {isBangla ? 'টি শীর্ষবিন্দু' : 'vertices'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmMapPage;
