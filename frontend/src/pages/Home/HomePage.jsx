import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Satellite,
  Compass,
  FileText,
  CalendarDays,
  SlidersHorizontal,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Layers,
  Sparkles,
  Droplets,
  Activity,
  MapPin,
  Cpu,
  BarChart2,
  Wind,
  Sun,
  CloudRain,
  Check
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import DemoBadge from '../../components/common/DemoBadge';
import HeroNasaGlobe from '../../components/home/HeroNasaGlobe';

export const HomePage = () => {
  const { t, isBangla } = useTranslation();

  return (
    <div style={{ backgroundColor: '#061F12', overflowX: 'hidden' }}>
      {/* =========================================================
          HERO SECTION — CINEMATIC 3D AGRICULTURAL TECHNOLOGY EXPERIENCE
          ========================================================= */}
      <section className="cinematic-hero-section" style={{
        position: 'relative',
        padding: '5rem 1rem 5.5rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        {/* Subtle Ambient Light Beam & Contour Texture */}
        <div className="cinematic-light-beam"></div>
        <div className="contour-lines-overlay"></div>

        <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1.15fr)',
            gap: '3rem',
            alignItems: 'center'
          }} className="hero-split-grid">

            {/* Left Column: Hero Content */}
            <div>
              {/* Restrained Trust & Context Pill Tag */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 1.15rem',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: '#FFFFFF',
                marginBottom: '1.75rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#86EFAC',
                  boxShadow: '0 0 10px #86EFAC'
                }}></span>
                <Satellite size={15} color="#86EFAC" />
                <span>{isBangla ? 'নাসা উপগ্রহ ডেটা ও এসআরডিআই সমন্বয়' : 'NASA Earth Observation & SRDI Soil Integration'}</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>|</span>
                <DemoBadge text="Part 1 Frontend" />
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.4rem)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#FFFFFF',
                lineHeight: isBangla ? 1.3 : 1.16,
                marginBottom: '1.25rem',
                letterSpacing: '-0.025em',
                textShadow: '0 2px 10px rgba(0, 40, 20, 0.3)'
              }}>
                {t('home.heroTitle')}
              </h1>

              <p style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
                color: '#E2F5EA',
                lineHeight: isBangla ? 1.75 : 1.65,
                marginBottom: '2.25rem',
                maxWidth: '620px',
                textShadow: '0 1px 4px rgba(0, 40, 20, 0.2)'
              }}>
                {t('home.heroSubtitle')}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
                marginBottom: '2.5rem'
              }}>
                <Link
                  to="/farm-map"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#14532D',
                    fontWeight: 'var(--font-weight-bold)',
                    boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.35)',
                    border: 'none',
                    padding: '0.9rem 2rem'
                  }}
                >
                  <MapPin size={18} color="#14532D" />
                  <span>{isBangla ? 'আমার খামার বিশ্লেষণ করুন' : 'Analyze My Farm'}</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/rotation-planner"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <Sprout size={18} color="#FFFFFF" />
                  <span>{isBangla ? 'ফসল পর্যায়ক্রম কৌশল দেখুন' : 'Explore Rotation Strategies'}</span>
                </Link>
              </div>

              {/* Quick Metrics Ribbon (Frosted glass pills) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                paddingTop: '1.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(6px)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FFFFFF' }}>
                    {isBangla ? '১০.৫+' : '1.05M+'} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'normal', color: '#A7F3D0' }}>{isBangla ? 'লক্ষ হে.' : 'hectares'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#D1FAE5', marginTop: '2px' }}>
                    {isBangla ? 'উপকূলীয় লবণাক্ত জমি' : 'Saline Coastal Farmland'}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(6px)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FFFFFF' }}>
                    {isBangla ? '২৫+' : '25+'} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'normal', color: '#A7F3D0' }}>{isBangla ? 'ফসল' : 'crops'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#D1FAE5', marginTop: '2px' }}>
                    {isBangla ? 'মূল্যায়িত লবণ সহনশীলতা' : 'Evaluated Crop Profiles'}
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(6px)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FFFFFF' }}>
                    {isBangla ? '৩' : '3'} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'normal', color: '#A7F3D0' }}>{isBangla ? 'মৌসুম' : 'seasons'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#D1FAE5', marginTop: '2px' }}>
                    {isBangla ? 'টেকসই পর্যায়ক্রম পরিকল্পনা' : 'Dynamic Crop Rotations'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D NASA Earth Observation Globe */}
            <div>
              <HeroNasaGlobe />
            </div>

          </div>

          {/* Scientific Transparency & Limitations Notice Box */}
          <div style={{
            maxWidth: '860px',
            margin: '2.75rem auto 0 auto',
            padding: '0.9rem 1.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--font-size-xs)',
            color: '#FFFFFF',
            lineHeight: 1.6,
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
          }}>
            <strong>{isBangla ? 'স্বচ্ছ বৈজ্ঞানিক ঘোষণা: ' : 'Scientific Scope Notice: '}</strong>
            {t('home.bannerNotice')}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 2: PROBLEM VS. SPACE PRECISION (COORDINATED GREEN)
          ========================================================= */}
      <section className="problem-nasa-green-section">
        <div className="container" style={{ maxWidth: '1240px' }}>
          <div className="grid grid-cols-2" style={{ alignItems: 'stretch', gap: '2.5rem' }}>
            {/* Problem Statement Card */}
            <div className="tall-portrait-card" style={{
              borderLeft: '5px solid var(--color-risky-dot)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-risky-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingDown size={22} color="var(--color-risky-dot)" />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-risky-text)', textTransform: 'uppercase' }}>
                      {isBangla ? 'উপকূলীয় বাস্তবতা' : 'Coastal Vulnerability'}
                    </span>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-main)' }}>
                      {t('home.problemTitle')}
                    </h2>
                  </div>
                </div>

                <p style={{ fontSize: 'var(--font-size-base)', lineHeight: 1.7, marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.problemDesc')}
                </p>
              </div>

              {/* Salinity Gauge Visual */}
              <div style={{
                backgroundColor: 'var(--color-bg-cream)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.4rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '0.4rem', fontWeight: 'bold' }}>
                  <span>{isBangla ? 'স্বাভাবিক (০-২ dS/m)' : 'Low (0-2)'}</span>
                  <span>{isBangla ? 'মাঝারি (৪-৮ dS/m)' : 'Moderate (4-8)'}</span>
                  <span style={{ color: 'var(--color-risky-text)' }}>{isBangla ? 'চরম (১২-১৬+ dS/m)' : 'Severe (12-16+)'}</span>
                </div>
                <div style={{
                  height: '10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(90deg, #22C55E 0%, #EAB308 50%, #EF4444 100%)',
                  position: 'relative',
                  marginBottom: '1rem'
                }}>
                  {/* Pin at 4.8 dS/m (~40%) */}
                  <div style={{
                    position: 'absolute',
                    left: '38%',
                    top: '-4px',
                    width: '6px',
                    height: '18px',
                    backgroundColor: '#1E293B',
                    borderRadius: '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }}></div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  fontSize: 'var(--font-size-xs)'
                }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary-900)' }}>{isBangla ? '১০.৫+ লক্ষ হেক্টর' : '1.05M+ hectares'}</strong>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {isBangla ? 'লবণাক্ত জমি (উপকূলীয় ১৯ জেলা)' : 'Salt-affected land in 19 districts'}
                    </div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary-900)' }}>{isBangla ? '৪–১৬+ dS/m' : '4–16+ dS/m'}</strong>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {isBangla ? 'শুষ্ক মৌসুমের মাটির বিদ্যুৎ পরিবাহিতা (EC)' : 'Dry season electrical conductivity'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NASA EO & Remote Sensing Card */}
            <div className="tall-portrait-card" style={{
              borderLeft: '5px solid var(--color-primary-500)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Satellite size={22} color="var(--color-primary-700)" />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-primary-700)', textTransform: 'uppercase' }}>
                      {isBangla ? 'উপগ্রহ ভিত্তিক নির্ভুলতা' : 'Remote Sensing Precision'}
                    </span>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-main)' }}>
                      {t('home.nasaTitle')}
                    </h2>
                  </div>
                </div>

                <p style={{ fontSize: 'var(--font-size-base)', lineHeight: 1.7, marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.nasaDesc')}
                </p>
              </div>

              {/* Satellite Constellation Breakdown */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: '#F8FAF8',
                border: '1px solid var(--color-border)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', flexShrink: 0 }}>
                    <Droplets size={14} />
                  </div>
                  <div>
                    <strong>{isBangla ? 'নাসা SMAP (L3 রেডিওমিটার):' : 'NASA SMAP (L3 Radiometer):'}</strong> {isBangla ? 'মাটির উপরিভাগের আর্দ্রতা পরিমাপ (০–৫ সেমি গভীরতা)' : 'Surface soil moisture (0–5 cm depth)'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0 }}>
                    <Sprout size={14} />
                  </div>
                  <div>
                    <strong>{isBangla ? 'MODIS / Landsat ৮–৯:' : 'MODIS / Landsat 8–9:'}</strong> {isBangla ? 'উদ্ভিদের স্বাস্থ্য সূচক (NDVI), পাতার ক্লোরোফিল ও পৃষ্ঠের তাপমাত্রা' : 'Vegetation health index (NDVI), canopy chlorophyll, and surface temperature'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309', flexShrink: 0 }}>
                    <CalendarDays size={14} />
                  </div>
                  <div>
                    <strong>{isBangla ? 'নাসা GPM IMERG:' : 'NASA GPM IMERG:'}</strong> {isBangla ? 'বৃষ্টিপাতের পরিমাণ ও ঘনত্ব এবং আগাম বন্যার সতর্কতা' : 'Precipitation frequency and early flood warnings'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 3: TALL VERTICAL FEATURE CARDS (STAGGERED 3-PER-ROW ON GREEN)
          ========================================================= */}
      <section className="features-green-section">
        <div className="contour-lines-overlay"></div>
        <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-header-pill">
              <Sparkles size={14} />
              <span>{isBangla ? 'সমন্বিত সিদ্ধান্ত সহায়তা মডিউল' : 'Integrated Core Decision Suite'}</span>
            </div>
            <h2 className="section-title">
              {t('home.featuresTitle')}
            </h2>
            <p className="section-subtitle">
              {isBangla
                ? 'উপকূলীয় কৃষকদের বাস্তবসম্মত চাহিদা এবং মৃত্তিকা বিজ্ঞানের আলোকে ডিজাইনকৃত আধুনিক ত্রিমাত্রিক পোর্ট্রেট-কার্ড সিদ্ধান্ত সহায়তা টুল।'
                : 'Modular tools designed for smallholder ease-of-use and transparent agronomic rigor, presented in tall vertical decision cards with dimensional compositions.'}
            </p>
          </div>

          {/* 3-Card Staggered Grid (Desktop: Left High, Center Lower, Right High) */}
          <div className="three-card-grid">

            {/* Row 1, Card 1: F-01 NASA Farm Environmental Insights */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    {/* Curved Earth Horizon */}
                    <path d="M 0,165 Q 140,110 280,165 L 280,190 L 0,190 Z" fill="#14532D" />
                    <path d="M 0,165 Q 140,110 280,165" fill="none" stroke="#86EFAC" strokeWidth="2.5" opacity="0.8" />
                    {/* Stars in Space */}
                    <circle cx="45" cy="40" r="1.5" fill="#FFFFFF" opacity="0.8" />
                    <circle cx="95" cy="25" r="1" fill="#FFFFFF" opacity="0.6" />
                    <circle cx="215" cy="35" r="1.5" fill="#FFFFFF" opacity="0.9" />
                    <circle cx="250" cy="70" r="1" fill="#FFFFFF" opacity="0.7" />
                    {/* 3D Orbiting Satellite */}
                    <g transform="translate(140, 60)">
                      {/* Left Solar Panel */}
                      <rect x="-65" y="-12" width="38" height="24" rx="2" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1" />
                      <line x1="-46" y1="-12" x2="-46" y2="12" stroke="#60A5FA" strokeWidth="1" />
                      {/* Right Solar Panel */}
                      <rect x="27" y="-12" width="38" height="24" rx="2" fill="#1D4ED8" stroke="#60A5FA" strokeWidth="1" />
                      <line x1="46" y1="-12" x2="46" y2="12" stroke="#60A5FA" strokeWidth="1" />
                      {/* Central Bus Chassis */}
                      <rect x="-24" y="-15" width="48" height="30" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                      <circle cx="0" cy="0" r="8" fill="#F8FAFC" stroke="#64748B" strokeWidth="1" />
                      {/* Scanning Telemetry Cone */}
                      <polygon points="0,15 80,95 -80,95" fill="#38BDF8" opacity="0.25" />
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#38BDF8',
                    backgroundColor: '#0F172A',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(56, 189, 248, 0.4)'
                  }}>
                    F-01
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#7DD3FC',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    NASA Telemetry
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {isBangla ? 'নাসা পরিবেশগত উপাত্ত ও পর্যবেক্ষণ' : 'NASA Farm Environmental Insights'}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {isBangla
                    ? 'GPM বৃষ্টিপাত, NASA POWER তাপমাত্রা চাপ, SMAP মাটির আর্দ্রতা এবং MODIS সূচক থেকে খামারের বাস্তব পরিবেশগত অবস্থা বিশ্লেষণ।'
                    : 'Direct physical Earth observations of precipitation, thermal stress, topsoil moisture, and NDVI canopy vigor calibrated for coastal farms.'}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/data-sources" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 1, Card 2 (CENTER LOWER): F-02 3-Season Rotation Planner */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    {/* Circular Flywheel Track in Perspective */}
                    <ellipse cx="140" cy="100" rx="65" ry="40" fill="none" stroke="#FDE68A" strokeWidth="8" />
                    {/* Season 1 Plot (Top): Dhaincha / Green Manure */}
                    <g transform="translate(140, 55)">
                      <circle cx="0" cy="0" r="20" fill="#15803D" />
                      <circle cx="0" cy="0" r="16" fill="#86EFAC" />
                      <text x="0" y="4" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#065F46">{isBangla ? 'খ-১' : 'K-1'}</text>
                    </g>
                    {/* Season 2 Plot (Right): Aman Rice */}
                    <g transform="translate(195, 115)">
                      <circle cx="0" cy="0" r="20" fill="#166534" />
                      <circle cx="0" cy="0" r="16" fill="#DCFCE7" />
                      <text x="0" y="4" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#14532D">{isBangla ? 'খ-২' : 'K-2'}</text>
                    </g>
                    {/* Season 3 Plot (Left): Rabi Sunflower */}
                    <g transform="translate(85, 115)">
                      <circle cx="0" cy="0" r="20" fill="#D97706" />
                      <circle cx="0" cy="0" r="16" fill="#FEF08A" />
                      <text x="0" y="4" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#92400E">{isBangla ? 'রবি' : 'RABI'}</text>
                    </g>
                    {/* Flow Direction Arrows */}
                    <path d="M 160,65 Q 185,80 190,95" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray="4 3" />
                    <path d="M 180,135 Q 140,150 105,135" fill="none" stroke="#D97706" strokeWidth="3" strokeDasharray="4 3" />
                    <path d="M 90,95 Q 95,80 120,65" fill="none" stroke="#16A34A" strokeWidth="3" strokeDasharray="4 3" />
                    {/* Center Rotation Badge */}
                    <g transform="translate(140, 100)">
                      <rect x="-35" y="-10" width="70" height="20" rx="10" fill="#78350F" />
                      <text x="0" y="4" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#FEF3C7">{isBangla ? '৩-মৌসুম' : '3-CYCLE'}</text>
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#B45309',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-02
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#78350F',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    {isBangla ? 'গতিশীল ফসল চক্র' : 'Dynamic Flywheel'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {t('home.f4Title')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.f4Desc')}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/rotation-planner" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 1, Card 3: F-03 Compare Strategies */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    <defs>
                      <linearGradient id="compBgGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#4F46E5" />
                      </linearGradient>
                    </defs>
                    {/* Isometric Floor Base */}
                    <polygon points="140,165 240,120 140,75 40,120" fill="#312E81" opacity="0.25" />
                    {/* Pillar 1: Baseline (Left) */}
                    <g transform="translate(65, 80)">
                      <polygon points="20,40 35,32 35,10 20,18" fill="#64748B" />
                      <polygon points="35,32 50,40 50,18 35,10" fill="#475569" />
                      <polygon points="20,18 35,10 50,18 35,26" fill="#94A3B8" />
                      <text x="35" y="0" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#64748B">{isBangla ? 'প্রাথমিক' : 'BASELINE'}</text>
                    </g>
                    {/* Pillar 2: Soil Health (Center Elevated) */}
                    <g transform="translate(105, 50)">
                      <polygon points="35,65 55,54 55,10 35,21" fill="#16A34A" />
                      <polygon points="55,54 75,65 75,21 55,10" fill="#15803D" />
                      <polygon points="35,21 55,10 75,21 55,32" fill="#4ADE80" />
                      <circle cx="55" cy="-2" r="12" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
                      <path d="M 50,-2 L 53,1 L 60,-5" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="55" y="-18" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#15803D">{isBangla ? 'মাটির স্বাস্থ্য' : 'SOIL HEALTH'}</text>
                    </g>
                    {/* Pillar 3: Water Resilience (Right) */}
                    <g transform="translate(165, 75)">
                      <polygon points="20,45 35,37 35,10 20,18" fill="#0284C7" />
                      <polygon points="35,37 50,45 50,18 35,10" fill="#0369A1" />
                      <polygon points="20,18 35,10 50,18 35,26" fill="#38BDF8" />
                      <text x="35" y="0" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#0284C7">{isBangla ? 'পানি সাশ্রয়' : 'WATER RES'}</text>
                    </g>
                    {/* Floating Comparative Ribbon */}
                    <g transform="translate(140, 155)">
                      <rect x="-65" y="-10" width="130" height="20" rx="10" fill="#4338CA" />
                      <text x="0" y="4" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">{isBangla ? '৩ কৌশলের তুলনা' : '3 STRATEGY MATRIX'}</text>
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#6366F1',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-03
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#4F46E5',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    3-Way Matrix
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {t('comparison.title')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {isBangla
                    ? 'বর্তমান ভিত্তি, লবণ-হ্রাসকারী সবুজ সার কৌশল এবং স্বল্প-পানির ডাল কৌশলের মধ্যে বৈজ্ঞানিক প্রমাণ, পানির চাহিদা ও ঝুঁকির পাশাপাশি তুলনা।'
                    : 'Side-by-side multi-criteria comparison of Baseline, Soil-Health, and Water-Resilience rotation pathways.'}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/scenario-comparison" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 2, Card 4: F-04 World-Scale Farm Map */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    <defs>
                      <linearGradient id="terrainTopGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#86EFAC" />
                        <stop offset="60%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#15803D" />
                      </linearGradient>
                      <linearGradient id="terrainTierGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4ADE80" />
                        <stop offset="100%" stopColor="#16A34A" />
                      </linearGradient>
                      <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#0F3E21" floodOpacity="0.4" />
                      </filter>
                    </defs>
                    <polygon points="140,165 240,115 240,128 140,178 40,128 40,115" fill="#1E293B" opacity="0.18" />
                    <polygon points="140,155 240,105 240,118 140,168" fill="#64748B" opacity="0.3" />
                    <polygon points="140,155 40,105 40,118 140,168" fill="#94A3B8" opacity="0.4" />
                    <polygon points="140,55 240,105 140,155 40,105" fill="url(#terrainTopGrad)" />
                    <line x1="65" y1="92" x2="165" y2="142" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                    <line x1="90" y1="80" x2="190" y2="130" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                    <line x1="115" y1="67" x2="215" y2="117" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                    <line x1="165" y1="67" x2="65" y2="117" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                    <line x1="190" y1="80" x2="90" y2="130" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                    <line x1="215" y1="92" x2="115" y2="142" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                    <polygon points="140,80 195,108 150,131 95,103" fill="url(#terrainTierGrad)" />
                    <ellipse cx="145" cy="110" rx="14" ry="6" fill="#062413" opacity="0.45" />
                    <ellipse cx="145" cy="110" rx="28" ry="12" fill="none" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.75" />
                    <g transform="translate(145, 68)" filter="url(#pinShadow)">
                      <path d="M 0,-24 C -9,-24 -15,-18 -15,-9 C -15,4 0,18 0,18 C 0,18 15,4 15,-9 C 15,-18 9,-24 0,-24 Z" fill="#0284C7" />
                      <circle cx="0" cy="-9" r="5.5" fill="#FFFFFF" />
                      <circle cx="0" cy="-9" r="2.5" fill="#0284C7" />
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#0284C7',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-04
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#0369A1',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    3D Terrain GPS
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {t('home.f1Title')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.f1Desc')}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/farm-map" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 2, Card 5 (CENTER LOWER): F-05 Soil Report OCR */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    <defs>
                      <linearGradient id="soilSliceTop" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4E342E" />
                        <stop offset="100%" stopColor="#2E1C14" />
                      </linearGradient>
                      <linearGradient id="soilSliceFront" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3E2723" />
                        <stop offset="40%" stopColor="#5D4037" />
                        <stop offset="100%" stopColor="#263238" />
                      </linearGradient>
                    </defs>
                    <polygon points="140,170 230,125 140,85 50,125" fill="#062413" opacity="0.3" />
                    <polygon points="140,40 220,80 140,120 60,80" fill="url(#soilSliceTop)" />
                    <polygon points="140,120 220,80 220,135 140,175" fill="url(#soilSliceFront)" />
                    <polygon points="140,120 60,80 60,135 140,175" fill="#2D1E18" />
                    <line x1="60" y1="98" x2="140" y2="138" stroke="#8D6E63" strokeWidth="1.5" strokeDasharray="3 2" />
                    <line x1="140" y1="138" x2="220" y2="98" stroke="#8D6E63" strokeWidth="1.5" strokeDasharray="3 2" />
                    <line x1="60" y1="120" x2="140" y2="160" stroke="#78909C" strokeWidth="1.5" strokeDasharray="3 2" />
                    <line x1="140" y1="160" x2="220" y2="120" stroke="#78909C" strokeWidth="1.5" strokeDasharray="3 2" />
                    <path d="M 125,75 Q 120,95 110,110 Q 105,125 100,140" fill="none" stroke="#D7CCC8" strokeWidth="1.5" opacity="0.8" />
                    <path d="M 155,75 Q 160,95 170,110 Q 175,120 180,135" fill="none" stroke="#D7CCC8" strokeWidth="1.5" opacity="0.8" />
                    <polygon points="40,95 240,95 220,115 20,115" fill="#A855F7" opacity="0.25" />
                    <line x1="20" y1="105" x2="240" y2="105" stroke="#9333EA" strokeWidth="2.5" />
                    <g transform="translate(195, 45)">
                      <circle cx="0" cy="0" r="16" fill="#7E22CE" />
                      <circle cx="0" cy="0" r="13" fill="#FFFFFF" />
                      <text x="0" y="4" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#7E22CE">SRDI</text>
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#7E22CE',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-05
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#6B21A8',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    {isBangla ? 'মাটি কার্ডের ওসিআর' : 'Soil Card OCR'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {t('home.f2Title')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.f2Desc')}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/soil-report" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 2, Card 6: F-06 Crop Suitability */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    <polygon points="140,165 220,130 140,95 60,130" fill="#14532D" opacity="0.35" />
                    <path d="M 140,140 Q 140,75 165,40 Q 175,70 140,105" fill="#22C55E" opacity="0.85" />
                    <path d="M 140,140 Q 132,65 115,35 Q 110,68 135,110" fill="#16A34A" opacity="0.9" />
                    <path d="M 140,140 Q 148,55 140,25 Q 132,55 140,95" fill="#15803D" opacity="0.95" />
                    <polygon points="140,48 190,75 190,130 140,158 90,130 90,75" fill="#3B82F6" opacity="0.2" stroke="#2563EB" strokeWidth="2" />
                    <line x1="140" y1="48" x2="140" y2="158" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <polygon points="140,48 190,75 140,102 90,75" fill="#60A5FA" opacity="0.15" />
                    <g transform="translate(210, 48)">
                      <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke="#16A34A" strokeWidth="3" />
                      <text x="0" y="4" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#15803D">92%</text>
                      <text x="0" y="13" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#16A34A">{isBangla ? 'মিল' : 'MATCH'}</text>
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#15803D',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-06
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#14532D',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    {isBangla ? 'ফসল সুরক্ষা' : 'Crop Protection'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {t('home.f3Title')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.f3Desc')}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/crop-suitability" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 3, Card 7: F-07 What-If Simulator */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #F0FDFA 0%, #CCFBF1 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    <polygon points="140,165 240,120 140,75 40,120" fill="#0D9488" opacity="0.3" />
                    <polygon points="140,55 235,95 140,140 45,95" fill="#134E4A" />
                    <line x1="80" y1="88" x2="140" y2="114" stroke="#5EEAD4" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="115" cy="103" r="8" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="2" />
                    <line x1="140" y1="68" x2="200" y2="94" stroke="#5EEAD4" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="175" cy="83" r="8" fill="#14B8A6" stroke="#FFFFFF" strokeWidth="2" />
                    <path d="M 60,110 Q 100,75 140,105 T 220,80" fill="none" stroke="#F43F5E" strokeWidth="3" />
                    <g transform="translate(140, 150)">
                      <rect x="-65" y="-12" width="130" height="24" rx="12" fill="#E11D48" />
                      <text x="0" y="4" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">{isBangla ? '+2.5 dS/m চাপ' : '+2.5 dS/m STRESS'}</text>
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#0F766E',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-07
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#115E59',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    Tactile Console
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {t('home.f5Title')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.f5Desc')}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/what-if-simulator" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 3, Card 8 (CENTER LOWER): F-08 Salinity Prediction */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    <polygon points="140,165 230,120 140,75 50,120" fill="#B45309" opacity="0.25" />
                    <g transform="translate(90, 80)">
                      <polygon points="20,50 35,42 35,18 20,26" fill="#15803D" />
                      <polygon points="35,42 50,50 50,26 35,18" fill="#16A34A" />
                      <polygon points="20,26 35,18 50,26 35,34" fill="#4ADE80" />
                      <text x="35" y="10" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#15803D">2.1 dS/m</text>
                    </g>
                    <g transform="translate(155, 55)">
                      <polygon points="20,75 35,67 35,18 20,26" fill="#B91C1C" />
                      <polygon points="35,67 50,75 50,26 35,18" fill="#DC2626" />
                      <polygon points="20,26 35,18 50,26 35,34" fill="#F87171" />
                      <text x="35" y="10" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#B91C1C">6.8 dS/m</text>
                    </g>
                    <path d="M 125,75 Q 145,55 165,65" fill="none" stroke="#D97706" strokeWidth="2.5" strokeDasharray="3 2" />
                    <g transform="translate(140, 150)">
                      <rect x="-55" y="-11" width="110" height="22" rx="11" fill="#78350F" />
                      <text x="0" y="4" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#FEF3C7">{isBangla ? 'Δ +4.7 dS/m পরিবর্তন' : 'Δ +4.7 dS/m SHIFT'}</text>
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#B45309',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-08
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#92400E',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    AEZ Risk Engine
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {isBangla ? 'লবণাক্ততা ও ঝুঁকি পূর্বাভাস' : 'Salinity Prediction & Risk Mapping'}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {isBangla
                    ? 'গাঙ্গেয় বদ্বীপের বিভিন্ন কৃষি-পরিবেশ অঞ্চলের শুষ্ক মৌসুমের মাটির বিদ্যুৎ পরিবাহিতা ও ক্ষতিকর লবণ অনুপ্রবেশ পূর্বাভাস।'
                    : 'Soil salinity dynamics modeling across coastal agro-ecological zones with early warning for root-zone stress.'}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/salinity-prediction" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Row 3, Card 9: F-09 Alerts */}
            <div className="tall-portrait-card">
              <div>
                <div className="tall-card-visual" style={{ background: 'linear-gradient(180deg, #FFF1F2 0%, #FFE4E6 100%)' }}>
                  <svg width="100%" height="190" viewBox="0 0 280 190">
                    <polygon points="140,165 220,130 140,95 60,130" fill="#BE123C" opacity="0.25" />
                    <line x1="120" y1="135" x2="135" y2="85" stroke="#475569" strokeWidth="2.5" />
                    <line x1="160" y1="135" x2="145" y2="85" stroke="#475569" strokeWidth="2.5" />
                    <line x1="123" y1="120" x2="157" y2="120" stroke="#64748B" strokeWidth="1.5" />
                    <line x1="128" y1="102" x2="152" y2="102" stroke="#64748B" strokeWidth="1.5" />
                    <circle cx="140" cy="72" r="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
                    <path d="M 160,55 Q 185,72 160,90" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 175,45 Q 205,72 175,100" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <path d="M 60,60 Q 65,45 80,45 Q 90,35 105,45 Q 115,45 118,60 Z" fill="#94A3B8" opacity="0.9" />
                    <line x1="75" y1="68" x2="70" y2="80" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                    <line x1="90" y1="68" x2="85" y2="80" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                    <line x1="105" y1="68" x2="100" y2="80" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                    <g transform="translate(215, 52)">
                      <circle cx="0" cy="0" r="14" fill="#BE123C" />
                      <circle cx="0" cy="0" r="8" fill="#FDE047" />
                    </g>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#BE123C',
                    backgroundColor: '#FFFFFF',
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    F-09
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#9F1239',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}>
                    Doppler Radar
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-900)', fontWeight: 'bold' }}>
                  {t('home.f6Title')}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
                  {t('home.f6Desc')}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/alerts" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <span>{t('common.viewDetails')}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 4: GROUND-TO-SPACE 4-STEP WORKFLOW BANNER
          ========================================================= */}
      <section className="green-reference-banner" style={{
        padding: '5rem 1rem 5.5rem 1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div className="contour-lines-overlay"></div>

        <div className="container" style={{ maxWidth: '1240px', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', color: '#FFFFFF', marginBottom: '0.65rem' }}>
              {t('home.howItWorksTitle')}
            </h2>
            <p style={{ fontSize: 'var(--font-size-base)', color: '#E2F5EA' }}>
              {isBangla ? 'সহজ চার ধাপে আপনার উপকূলীয় খামারের বিজ্ঞানসম্মত সিদ্ধান্ত গ্রহণ করুন' : 'Four simple steps from geolocation to informed harvest strategy'}
            </p>
          </div>

          <div className="grid grid-cols-4" style={{ gap: '1.5rem', position: 'relative' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-reference-card)',
              color: 'var(--color-text-main)',
              borderTop: '4px solid #16A34A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  fontSize: '1.85rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary-700)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{isBangla ? '০১' : '01'}</span>
                  <MapPin size={24} color="#16A34A" />
                </div>
                <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem', color: 'var(--color-primary-900)' }}>
                  {t('home.step1Title')}
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {t('home.step1Desc')}
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-reference-card)',
              color: 'var(--color-text-main)',
              borderTop: '4px solid #16A34A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  fontSize: '1.85rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary-700)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{isBangla ? '০২' : '02'}</span>
                  <FileText size={24} color="#16A34A" />
                </div>
                <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem', color: 'var(--color-primary-900)' }}>
                  {t('home.step2Title')}
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {t('home.step2Desc')}
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-reference-card)',
              color: 'var(--color-text-main)',
              borderTop: '4px solid #16A34A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  fontSize: '1.85rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary-700)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{isBangla ? '০৩' : '03'}</span>
                  <CalendarDays size={24} color="#16A34A" />
                </div>
                <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem', color: 'var(--color-primary-900)' }}>
                  {t('home.step3Title')}
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {t('home.step3Desc')}
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-reference-card)',
              color: 'var(--color-text-main)',
              borderTop: '4px solid #16A34A',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  fontSize: '1.85rem',
                  fontWeight: 'bold',
                  color: 'var(--color-primary-700)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{isBangla ? '০৪' : '04'}</span>
                  <Bell size={24} color="#16A34A" />
                </div>
                <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem', color: 'var(--color-primary-900)' }}>
                  {t('home.step4Title')}
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {t('home.step4Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 5: SCIENTIFIC DISCLOSURES & TRANSPARENCY (COORDINATED GREEN)
          ========================================================= */}
      <section className="disclosures-green-section">
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <ShieldCheck size={26} color="var(--color-primary-800)" />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', color: '#FFFFFF', fontWeight: 'bold' }}>
                {t('home.impactTitle')}
              </h2>
              <div style={{ fontSize: '12px', color: '#A7F3D0' }}>
                {isBangla ? 'নীতিমালা ও বৈজ্ঞানিক সততা সংক্রান্ত অঙ্গীকার' : 'Responsible Agronomic & Machine-Learning Disclaimers'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: 'var(--font-size-sm)', lineHeight: 1.65 }}>
            <div className="disclosure-card" style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              backgroundColor: '#FFFFFF',
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <AlertTriangle size={18} color="var(--color-marginal-dot)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span>{t('home.disclosure1')}</span>
            </div>

            <div className="disclosure-card" style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              backgroundColor: '#FFFFFF',
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <AlertTriangle size={18} color="var(--color-marginal-dot)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span>{t('home.disclosure2')}</span>
            </div>

            <div className="disclosure-card" style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              backgroundColor: '#FFFFFF',
              padding: '1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <AlertTriangle size={18} color="var(--color-marginal-dot)" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span>{t('home.disclosure3')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
