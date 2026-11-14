import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldAlert, Satellite, FileText } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const Footer = () => {
  const { t, isBangla } = useTranslation();

  return (
    <footer style={{
      backgroundColor: 'var(--color-bg-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: '2.5rem 0 1.5rem 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sprout size={18} />
              </div>
              <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-base)', color: 'var(--color-primary-900)' }}>
                AgriShift
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {isBangla
                ? 'বাংলাদেশের উপকূলীয় লবণাক্ত অঞ্চলের কৃষকদের জন্য উপগ্রহ তথ্যভিত্তিক টেকসই ফসল পরিকল্পনা প্ল্যাটফর্ম।'
                : 'NASA Earth-observation informed crop suitability and rotation planning for coastal farmers in Bangladesh.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: '0.75rem' }}>
              {isBangla ? 'মূল সেবাসমূহ' : 'Core Features'}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: 'var(--font-size-xs)' }}>
              <li><Link to="/dashboard">{t('nav.dashboard')}</Link></li>
              <li><Link to="/crop-suitability">{t('nav.cropSuitability')}</Link></li>
              <li><Link to="/rotation-planner">{t('nav.rotationPlanner')}</Link></li>
              <li><Link to="/soil-report">{t('nav.soilReport')}</Link></li>
              <li><Link to="/weather-calendar">{t('nav.weatherCalendar')}</Link></li>
            </ul>
          </div>

          {/* Advanced AI & Scientific Pipeline */}
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: '0.75rem' }}>
              {isBangla ? 'স্যাটেলাইট ও স্বচ্ছতা' : 'Satellite & AI Model'}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: 'var(--font-size-xs)' }}>
              <li><Link to="/data-sources">{t('nav.dataSources')}</Link></li>
              <li><Link to="/salinity-prediction">{t('nav.salinityPrediction')}</Link></li>
              <li><Link to="/model-evaluation">{t('nav.modelEvaluation')}</Link></li>
              <li><Link to="/what-if-simulator">{t('nav.whatIfSimulator')}</Link></li>
              <li><Link to="/alerts">{t('nav.alerts')}</Link></li>
            </ul>
          </div>

          {/* Disclosures & Regulatory Notes */}
          <div>
            <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldAlert size={14} color="var(--color-marginal-dot)" />
              <span>{isBangla ? 'বৈজ্ঞানিক সততা ও দায়বদ্ধতা' : 'Scientific Transparency'}</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              {t('footer.dataDisclaimer')}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {t('footer.extensionDisclaimer')}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} AgriShift — {t('footer.copyright')}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span className="badge badge-demo">{isBangla ? 'পর্ব ১ ফ্রন্টএন্ড কাঠামো' : 'Part 1 Frontend Scaffold'}</span>
            <span>{isBangla ? 'ভাষা: বাংলা (বাংলাদেশ)' : 'Language: English (US)'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
