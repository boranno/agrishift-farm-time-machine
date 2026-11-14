import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Globe, Menu, X, MapPin, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import { localizeFarmValue } from '../../utils/farmDisplay';
import { HOME_TOOL_GROUPS } from '../../pages/Home/homeToolRoutes';

export const Navbar = () => {
  const { t, language, setLanguage, isBangla } = useTranslation();
  const { farm } = useFarm();
  const location = useLocation();
  const [allPagesOpen, setAllPagesOpen] = useState(false);
  const headerRef = useRef(null);
  const allPagesToggleRef = useRef(null);

  useEffect(() => {
    if (!allPagesOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAllPagesOpen(false);
        allPagesToggleRef.current?.focus();
      }
    };
    const handlePointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setAllPagesOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [allPagesOpen]);

  const isCurrent = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header ref={headerRef} className="glass-header" style={{
      borderBottom: '1px solid var(--color-border)',
      position: 'relative'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--header-height)',
        paddingTop: 0,
        paddingBottom: 0
      }}>
        {/* Brand */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #166534 0%, #14532D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(20, 83, 45, 0.25)'
          }}>
            <Sprout size={22} />
          </div>
          <div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary-900)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15
            }}>
              AgriShift
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--color-primary-700)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              {isBangla ? 'কৃষি সিদ্ধান্ত সহায়তা প্ল্যাটফর্ম' : 'NASA EO Decision Support'}
            </div>
          </div>
        </Link>

        {/* Header Right Utility Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Active Farm Location Selector Pill */}
          {farm && (
            <Link
              to="/farm-map"
              className="badge badge-neutral active-farm-nav-badge"
              style={{
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                padding: '0.4rem 0.85rem',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                backgroundColor: 'var(--color-bg-cream)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-primary-900)'
              }}
              title={isBangla ? 'খামার অবস্থান পরিবর্তন করুন' : 'Change farm location'}
              id="active-farm-badge"
            >
              <MapPin size={13} color="var(--color-primary-700)" />
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {localizeFarmValue(farm.upazila, isBangla)}, {localizeFarmValue(farm.district, isBangla)}
              </span>
            </Link>
          )}

          <div
            className="language-switch"
            role="group"
            aria-label={isBangla ? 'ভাষা নির্বাচন করুন' : 'Choose language'}
          >
            <Globe size={15} className="language-switch-icon" aria-hidden="true" />
            <button
              ref={allPagesToggleRef}
              type="button"
              onClick={() => setLanguage('en')}
              className={`language-switch-option${language === 'en' ? ' is-active' : ''}`}
              aria-pressed={language === 'en'}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`language-switch-option${language === 'bn' ? ' is-active' : ''}`}
              aria-pressed={language === 'bn'}
            >
              বাংলা
            </button>
          </div>

          {/* All pages remain one click away from the sticky top bar. */}
          <button
            type="button"
            onClick={() => setAllPagesOpen(prev => !prev)}
            className="btn btn-secondary btn-sm all-pages-toggle"
            aria-expanded={allPagesOpen}
            aria-controls="all-pages-panel"
            aria-label={allPagesOpen ? t('nav.close') : t('nav.allPages')}
          >
            {allPagesOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            <span>{allPagesOpen ? t('nav.close') : t('nav.allPages')}</span>
            {!allPagesOpen && <ChevronDown className="all-pages-toggle-caret" size={15} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {allPagesOpen && (
        <div className="all-pages-panel" id="all-pages-panel">
          {farm && (
            <div className="all-pages-farm">
              <MapPin size={15} color="var(--color-primary-800)" />
              <span>
                <strong>{isBangla ? 'সক্রিয় খামার: ' : 'Active Farm: '}</strong>
                {localizeFarmValue(farm.upazila, isBangla)}, {localizeFarmValue(farm.district, isBangla)} ({localizeFarmValue(farm.aez, isBangla)})
              </span>
            </div>
          )}

          <nav className="all-pages-groups" aria-label={t('nav.allPages')}>
            {HOME_TOOL_GROUPS.map(group => (
              <section className="all-pages-group" key={group.titleKey} aria-labelledby={`nav-${group.titleKey}`}>
                <h2 id={`nav-${group.titleKey}`}>{t(group.titleKey)}</h2>
                <div className="all-pages-links">
                  {group.items.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setAllPagesOpen(false)}
                      className={`all-pages-link${isCurrent(item.to) ? ' is-active' : ''}`}
                      aria-current={location.pathname === item.to ? 'page' : undefined}
                    >
                      {t(item.labelKey)}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
