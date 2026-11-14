import React, { useState } from 'react';
import {
  Satellite,
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Info,
  Clock,
  Layers,
  CloudRain,
  ThermometerSun,
  Droplets,
  Activity,
  Wind,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';

export const DataSourcesPage = () => {
  const { t, isBangla } = useTranslation();
  const [activeTab, setActiveTab] = useState('indicators'); // 'indicators' or 'pipeline'

  // The 5 Core NASA Environmental Indicators for Farmers
  const NASA_OBSERVATIONS = [
    {
      id: 'rain',
      nameEn: 'Precipitation & Monsoon Dynamics',
      nameBn: 'বৃষ্টিপাত ও মৌসুমি বৃষ্টিপ্রবাহ',
      satellite: 'GPM IMERG (NASA / JAXA)',
      icon: CloudRain,
      color: '#0284C7',
      sampleValue: '24.5 mm / 7-day total',
      sampleValueBn: '২৪.৫ মিমি / বিগত ৭ দিনের সঞ্চয়',
      unit: 'mm / day (millimeter)',
      unitBn: 'মিমি / দিন (মিলিমিটার)',
      period: '30-minute latency / daily composite',
      periodBn: '৩০ মিনিট ব্যবধান / দৈনিক সমন্বিত হিসাব',
      meaningEn: 'Tracks rainfall accumulation and monsoon onset. Helps farmers determine the exact window for Aman rice transplanting and winter crop moisture reserves.',
      meaningBn: 'বৃষ্টির পরিমাণ ও বর্ষার আগমন ট্র্যাক করে। আমন চারা রোপণের সঠিক সময় এবং রবি ফসলের জন্য মাটির অবশিষ্ট রস হিসাব করতে সাহায্য করে।',
      type: 'Direct Earth Observation'
    },
    {
      id: 'heat',
      nameEn: 'Heat Stress & Surface Temperature',
      nameBn: 'তাপমাত্রা চাপ ও পৃষ্ঠদেশের উত্তাপ',
      satellite: 'NASA POWER (Langley Research Center)',
      icon: ThermometerSun,
      color: '#EA580C',
      sampleValue: '32.4°C max / 24.1°C min',
      sampleValueBn: 'সর্বোচ্চ ৩২.৪°সে / সর্বনিম্ন ২৪.১°সে',
      unit: '°C (Degree Celsius) & MJ/m²/day',
      unitBn: '°সে (ডিগ্রি সেলসিয়াস) ও সৌরশক্তি',
      period: 'Daily agroclimatology time-series',
      periodBn: 'প্রতিদিনের সমন্বিত কৃষি-আবহাওয়া তথ্য',
      meaningEn: 'Monitors extreme thermal stress and solar radiation. High temperatures during flowering cause rice spikelet sterility and accelerate salt capillary rise.',
      meaningBn: 'তীব্র তাপপ্রবাহ ও সৌরশক্তি পর্যবেক্ষণ করে। ধানে শিষ আসার সময় অতিরিক্ত তাপমাত্রা চিটা রোগ তৈরি করে এবং মাটিতে বাষ্পীভবন বাড়িয়ে দ্রুত লবণাক্ততা ডেকে আনে।',
      type: 'Direct Earth Observation'
    },
    {
      id: 'moisture',
      nameEn: 'Soil Moisture & Root-Zone Wetness',
      nameBn: 'মাটির আর্দ্রতা ও মূল-অঞ্চলের রস',
      satellite: 'NASA SMAP L4 (Jet Propulsion Laboratory)',
      icon: Droplets,
      color: '#0D9488',
      sampleValue: '0.28 cm³/cm³ (28% Volumetric)',
      sampleValueBn: '০.২৮ ঘনসেমি/ঘনসেমি (২৮% আর্দ্রতা)',
      unit: 'cm³/cm³ (Volumetric Water Fraction)',
      unitBn: 'ঘনসেমি/ঘনসেমি (আয়তনভিত্তিক শতকরা হার)',
      period: 'Daily 9 km global radar/radiometer product',
      periodBn: 'দৈনিক ৯ কিমি বৈশ্বিক রাডার/রেডিওমিটার তথ্য',
      meaningEn: 'Estimates water availability in 0–5 cm topsoil and 0–100 cm root zone. In coastal delta soils, drying soil triggers rapid upward suction of saline groundwater.',
      meaningBn: 'মাটির উপরিভাগ (০–৫ সেমি) এবং মূল এলাকার (০–১০০ সেমি) পানির অনুপাত নির্ণয় করে। মাটি শুকাতে শুরু করলেই নিচে থেকে নোনা পানি ওপরে উঠে আসার ঝুঁকি বাড়ে।',
      type: 'Direct Earth Observation'
    },
    {
      id: 'ndvi',
      nameEn: 'Vegetation Condition & Canopy Stress',
      nameBn: 'ফসলের স্বাস্থ্য ও ক্যানোপি চাপ সূচক (NDVI)',
      satellite: 'MODIS (Terra/Aqua) & Landsat 8/9 (USGS/NASA)',
      icon: Activity,
      color: '#16A34A',
      sampleValue: '0.68 NDVI (Active Healthy Crop)',
      sampleValueBn: '০.৬৮ এনডিভিআই (সতেজ ও সুস্থ ফসল)',
      unit: 'NDVI Index (-1.0 to +1.0 scale)',
      unitBn: 'এনডিভিআই স্কেল (-১.০ থেকে +১.০)',
      period: '8-day & 16-day cloud-cleared composites',
      periodBn: '৮ থেকে ১৬ দিনের মেঘমুক্ত কম্পোজিট',
      meaningEn: 'Monitors photosynthetic vigor and canopy greenness. Detects early signs of root-zone salinity or drought stress before visible leaves turn yellow or wither.',
      meaningBn: 'ফসলের ক্লোরোফিল ও সবুজাভ ভাব পরিমাপ করে। খালি চোখে পাতা হলুদ হওয়ার আগেই মাটিতে অতিরিক্ত লবণ বা পানির অভাবের চাপ আগাম শনাক্ত করা সম্ভব হয়।',
      type: 'Direct Earth Observation'
    },
    {
      id: 'et',
      nameEn: 'Evapotranspiration & Water Loss',
      nameBn: 'বাষ্পীভবন ও পানির মোট ক্ষয় (ET)',
      satellite: 'MOD16A2 (NASA EOS Terra)',
      icon: Wind,
      color: '#7C3AED',
      sampleValue: '3.8 mm / day (Winter average)',
      sampleValueBn: '৩.৮ মিমি / দিন (শীতকালীন গড়)',
      unit: 'mm / day (Latent heat flux equivalent)',
      unitBn: 'মিমি / দিন (পানির বাষ্পীভূত রূপান্তর)',
      period: '8-day cumulative terrestrial product',
      periodBn: '৮ দিনের সমন্বিত স্থলজ বাষ্পীভবন হিসাব',
      meaningEn: 'Calculates the combined water loss from soil surface evaporation and plant transpiration. Direct measure of how much irrigation water a field actually needs.',
      meaningBn: 'মাটির পৃষ্ঠের বাষ্পীভবন এবং গাছের প্রস্বেদনের সম্মিলিত ক্ষয় পরিমাপ করে। শুকনো মৌসুমে রবি ফসলের জন্য ঠিক কতটুকু সম্পূরক সেচ প্রয়োজন তা বুঝতে সাহায্য করে।',
      type: 'Direct Earth Observation'
    }
  ];

  const DATA_PIPELINE_CATALOG = [
    {
      id: 'smap',
      product: t('dataSources.smap'),
      provider: 'NASA Jet Propulsion Laboratory (JPL)',
      providerBn: 'NASA Jet Propulsion Laboratory (JPL)',
      variable: t('dataSources.smapParam'),
      spatialRes: '9 km / 36 km EASE-Grid 2.0',
      spatialResBn: '৯ কিমি / ৩৬ কিমি EASE-Grid 2.0',
      temporalRes: 'Daily (Morning 6:00 AM descending pass)',
      temporalResBn: 'দৈনিক (সকাল ৬টার নিম্নমুখী কক্ষপথ)',
      accessProtocol: 'NASA Earthdata Cloud / OpenDAP',
      accessProtocolBn: 'NASA Earthdata Cloud / OpenDAP',
      statusEn: 'Pipeline Schema Ready (Awaiting Backend Ingestion)',
      statusBn: 'পাইপলাইন স্কিমা প্রস্তুত (ব্যাকএন্ড সংযোগ অপেক্ষমাণ)',
      isIngested: false,
      limitationsEn: 'Microwave radiometer depth limited to 0–5 cm topsoil. Requires water-balance modeling for deeper root zones.',
      limitationsBn: 'মাইক্রোওয়েভ সংকেত কেবল ওপরের ০–৫ সেমি গভীরতা মাপতে পারে। শিকড় অঞ্চলের জন্য মডেলিং প্রয়োজন।'
    },
    {
      id: 'modis',
      product: t('dataSources.modis'),
      provider: 'NASA GSFC / Terra & Aqua Missions',
      providerBn: 'NASA GSFC / Terra ও Aqua মিশন',
      variable: t('dataSources.modisParam'),
      spatialRes: '250 m (MOD13Q1 / MYD13Q1)',
      spatialResBn: '২৫০ মিটার (MOD13Q1 / MYD13Q1)',
      temporalRes: '16-Day Cloud-Free Composite',
      temporalResBn: '১৬ দিনের মেঘমুক্ত সমন্বিত চিত্র',
      accessProtocol: 'LP DAAC / NASA Earthdata Search',
      accessProtocolBn: 'LP DAAC / NASA Earthdata Search',
      statusEn: 'Pipeline Schema Ready (Awaiting Backend Ingestion)',
      statusBn: 'পাইপলাইন স্কিমা প্রস্তুত (ব্যাকএন্ড সংযোগ অপেক্ষমাণ)',
      isIngested: false,
      limitationsEn: 'Optical vegetation indices affected by persistent cloud cover during June–August monsoon.',
      limitationsBn: 'বর্ষাকালে অতিরিক্ত মেঘের কারণে অপটিক্যাল এনডিভিআই সূচকে শূন্যতা দেখা দিতে পারে।'
    },
    {
      id: 'gpm',
      product: t('dataSources.gpm'),
      provider: 'NASA / JAXA Global Precipitation Measurement',
      providerBn: 'NASA / JAXA বৈশ্বিক বৃষ্টিপাত পরিমাপ মিশন',
      variable: t('dataSources.gpmParam'),
      spatialRes: '0.1° x 0.1° (~10 km resolution)',
      spatialResBn: '০.১° x ০.১° (প্রায় ১০ কিমি রেজোলিউশন)',
      temporalRes: 'Early Run (4-hr latency) & Final Daily Run',
      temporalResBn: 'প্রাথমিক তথ্য (৪ ঘণ্টা বিলম্ব) ও চূড়ান্ত দৈনিক তথ্য',
      accessProtocol: 'GES DISC / HTTPS API',
      accessProtocolBn: 'GES DISC / HTTPS API',
      statusEn: 'Pipeline Schema Ready (Awaiting Backend Ingestion)',
      statusBn: 'পাইপলাইন স্কিমা প্রস্তুত (ব্যাকএন্ড সংযোগ অপেক্ষমাণ)',
      isIngested: false,
      limitationsEn: 'Satellite microwave-radar precipitation estimates require calibration against BMD ground rain gauges.',
      limitationsBn: 'উপগ্রহের বৃষ্টিপাতের আনুমানিক হিসাব স্থানীয় আবহাওয়া অধিদপ্তরের রেইন গেজের সাথে সমন্বয় জরুরি।'
    },
    {
      id: 'landsat',
      product: t('dataSources.landsat'),
      provider: 'USGS / NASA Earth Resources Observation (EROS)',
      providerBn: 'USGS / NASA Earth Resources Observation (EROS)',
      variable: t('dataSources.landsatParam'),
      spatialRes: '30 m Multispectral / 15 m Pan-sharpened',
      spatialResBn: '৩০ মিটার মাল্টিস্পেকট্রাল / ১৫ মিটার প্যান-শার্পেনড',
      temporalRes: '8–16 Day Repeat Orbit',
      temporalResBn: '৮–১৬ দিনে পুনরাবৃত্ত কক্ষপথ',
      accessProtocol: 'USGS Machine-to-Machine (M2M) API',
      accessProtocolBn: 'USGS মেশিন-টু-মেশিন (M2M) API',
      statusEn: 'Pipeline Schema Ready (Awaiting Backend Ingestion)',
      statusBn: 'পাইপলাইন স্কিমা প্রস্তুত (ব্যাকএন্ড সংযোগ অপেক্ষমাণ)',
      isIngested: false,
      limitationsEn: 'Cloud occlusion in coastal delta; tidal river silt shifts surface reflectance.',
      limitationsBn: 'উপকূলীয় নদীতে পলির কারণে পানির লবণাক্ততা সূচক নির্ণয়ে ফিল্টারিং প্রয়োজন।'
    },
    {
      id: 'power',
      product: t('dataSources.power'),
      provider: 'NASA Langley Research Center',
      providerBn: 'NASA Langley Research Center',
      variable: t('dataSources.powerParam'),
      spatialRes: '0.5° x 0.5° Global Meteorological Grid',
      spatialResBn: '০.৫° x ০.৫° বৈশ্বিক আবহাওয়া গ্রিড',
      temporalRes: 'Daily & Hourly Agroclimatology Time-Series',
      temporalResBn: 'দৈনিক ও ঘণ্টাভিত্তিক কৃষি-আবহাওয়ার সময়ক্রম',
      accessProtocol: 'NASA POWER REST API v2',
      accessProtocolBn: 'NASA POWER REST API v2',
      statusEn: 'Specification Verified',
      statusBn: 'স্পেসিফিকেশন অনুমোদিত ও প্রস্তুত',
      isIngested: false,
      limitationsEn: 'Regional grid cells provide macro-climate parameters; micro-climate adjustments required for polder terrain.',
      limitationsBn: 'আঞ্চলিক গ্রিড সামগ্রিক জলবায়ু প্রদর্শন করে; স্থানীয় পোল্ডারের জন্য মাইক্রো-অ্যাডজাস্টমেন্ট প্রয়োজন।'
    }
  ];

  return (
    <div>
      <PageHeader
        title={t('dataSources.title')}
        subtitle={t('dataSources.subtitle')}
        badge={<DemoBadge text="Feature 11 • NASA Earth Observations" />}
        helpText={isBangla
          ? 'এগ্রিশিফট প্ল্যাটফর্মে ব্যবহৃত নাসার ৫টি মূল ভূ-পর্যবেক্ষণ নির্দেশক, কৃষক-বান্ধব ব্যাখ্যা এবং পাইপলাইন ডেটাসেটের বিবরণ এখানে সুস্পষ্টভাবে উপস্থাপন করা হয়েছে।'
          : 'Detailed transparency for the 5 core NASA Earth Observation indicators and technical pipeline specifications ready for backend ingestion.'}
      />

      {/* Observation vs Model Prediction Callout */}
      <div style={{
        backgroundColor: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem'
      }}>
        <Satellite size={22} color="var(--color-primary-800)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--color-primary-900)', margin: '0 0 0.35rem 0' }}>
            {isBangla
              ? 'নাসার উপগ্রহ পর্যবেক্ষণ বনাম ভবিষ্যৎ মডেল পূর্বাভাস: বৈজ্ঞানিক পার্থক্য'
              : 'Satellite Earth Observations vs. Future Model Predictions: Scientific Distinction'}
          </h4>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {isBangla
              ? 'এগ্রিশিফট উপগ্রহের ভৌত পর্যবেক্ষণ (বৃষ্টিপাত, মাটির আর্দ্রতা, ক্যানোপি তাপমাত্রা) এবং পরবর্তী সময়ের কৃষি পূর্বাভাসকে স্পষ্টভাবে আলাদা রাখে। উপগ্রহ থেকে প্রাপ্ত তথ্য হচ্ছে মহাকাশ থেকে সরাসরি পরিমাপকৃত পরিবেশগত বাস্তবতা, আর ভবিষ্যদ্বাণী বা সিমুলেশন হলো গাণিতিক মডেলের সম্ভাব্য অনুমান।'
              : 'AgriShift clearly distinguishes direct physical satellite observations (precipitation, topsoil moisture, surface temperature, NDVI) from derived predictive heuristics. Satellite data measures actual physical conditions on the ground, whereas yield forecasts and salinity predictions are mathematical approximations.'}
          </p>
        </div>
      </div>

      {/* Section 1: The 5 Core NASA Environmental Indicators */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--color-primary-900)', margin: 0 }}>
              {isBangla ? 'খামারের জন্য নাসার ৫টি প্রধান পরিবেশগত নির্দেশক' : '5 Core NASA Environmental Observations for Farm Health'}
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
              {isBangla
                ? 'উপকূলীয় খামারের (AEZ 13) জন্য প্রাসঙ্গিক দৃষ্টান্তমূলক স্যাটেলাইট পর্যবেক্ষণ ও সহজ কৃষক নির্দেশিকা।'
                : 'Farmer-friendly interpretations calibrated for coastal delta AEZ 13 conditions.'}
            </p>
          </div>
          <span className="badge badge-suitable" style={{ fontSize: '11px' }}>
            {isBangla ? 'প্রদর্শনী স্যাটেলাইট ডেটা (দাকোপ, খুলনা)' : 'Demo Satellite Observation (Dacope, Khulna)'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {NASA_OBSERVATIONS.map((obs) => {
            const Icon = obs.icon;
            return (
              <div
                key={obs.id}
                className="card"
                style={{
                  borderLeft: `5px solid ${obs.color}`,
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${obs.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={22} color={obs.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                        {isBangla ? obs.nameBn : obs.nameEn}
                      </h3>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {obs.satellite}
                      </div>
                    </div>
                  </div>

                  {/* Sample Reading Badge */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.4rem 0.75rem',
                    textAlign: 'right'
                  }}>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                      {isBangla ? 'দৃষ্টান্তমূলক বর্তমান মান' : 'Sample Ground Observation'}
                    </span>
                    <strong style={{ fontSize: 'var(--font-size-sm)', color: obs.color }}>
                      {isBangla ? obs.sampleValueBn : obs.sampleValue}
                    </strong>
                  </div>
                </div>

                {/* Farmer Plain-Language Interpretation */}
                <div style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.75rem'
                }}>
                  <strong style={{ color: 'var(--color-primary-800)', marginRight: '0.4rem' }}>
                    {isBangla ? 'ফসলের জন্য কী বোঝায়:' : 'Farmer Impact:'}
                  </strong>
                  <span>{isBangla ? obs.meaningBn : obs.meaningEn}</span>
                </div>

                {/* Indicator Metadata Footer */}
                <div className="grid grid-cols-3" style={{ gap: '0.75rem', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {isBangla ? 'পরিমাপের একক:' : 'Unit:'}
                    </span>{' '}
                    {isBangla ? obs.unitBn : obs.unit}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {isBangla ? 'পর্যবেক্ষণ চক্র:' : 'Cycle:'}
                    </span>{' '}
                    {isBangla ? obs.periodBn : obs.period}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {isBangla ? 'অবস্থা:' : 'Status:'}
                    </span>{' '}
                    <span style={{ color: 'var(--color-primary-700)', fontWeight: '600' }}>
                      {isBangla ? 'পাইপলাইন স্কিমা প্রস্তুত' : 'Schema Verified'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Technical Pipeline Catalog */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--color-primary-900)', margin: 0 }}>
              {isBangla ? 'প্রযুক্তিগত উপগ্রহ ডেটা পাইপলাইন ক্যাটালগ' : 'Technical NASA Satellite Pipeline Catalog'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0' }}>
              {isBangla
                ? 'স্পেস অ্যাপস প্রোটোটাইপের জন্য অনুমোদিত ওপেন-এক্সেস ডেটা প্রটোকল ও রেজোলিউশন।'
                : 'Open-access API protocols, spatial/temporal resolutions, and documented delta constraints.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {DATA_PIPELINE_CATALOG.map((item) => (
            <div key={item.id} className="card" style={{ borderLeft: '4px solid var(--color-info-dot)' }}>
              <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={16} color="var(--color-primary-800)" />
                  <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-primary-900)' }}>
                    {item.product}
                  </h3>
                </div>
                <span className="badge badge-marginal" style={{ fontSize: '11px' }}>
                  <Clock size={12} />
                  <span>{isBangla ? item.statusBn : item.statusEn}</span>
                </span>
              </div>

              <div className="grid grid-cols-4" style={{ gap: '1rem', fontSize: 'var(--font-size-xs)', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                    {t('dataSources.provider')}:
                  </span>
                  <strong>{isBangla ? item.providerBn : item.provider}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                    {t('dataSources.parameter')}:
                  </span>
                  <strong>{item.variable}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                    {t('dataSources.resolution')}:
                  </span>
                  <span>{isBangla ? item.spatialResBn : item.spatialRes} | {isBangla ? item.temporalResBn : item.temporalRes}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                    {t('dataSources.access')}:
                  </span>
                  <span>{isBangla ? item.accessProtocolBn : item.accessProtocol}</span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--color-bg-cream)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5
              }}>
                <strong>{isBangla ? 'জ্ঞাত সীমাবদ্ধতা: ' : 'Documented Limitation: '}</strong>
                {isBangla ? item.limitationsBn : item.limitationsEn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earth Observation Scientific Limitations Section */}
      <div className="card" style={{ backgroundColor: '#FAFAF9', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--color-primary-800)" />
          <span>{t('dataSources.limitationsTitle')}</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-xs)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={15} color="var(--color-marginal-dot)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{t('dataSources.limitation1')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={15} color="var(--color-marginal-dot)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{t('dataSources.limitation2')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={15} color="var(--color-marginal-dot)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{t('dataSources.limitation3')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesPage;
