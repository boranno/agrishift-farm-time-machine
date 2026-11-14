import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { AlertCircle, ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const Layout = ({ children, isPublicLanding = false }) => {
  const { t, isBangla } = useTranslation();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Generate breadcrumb path
  const getBreadcrumbs = () => {
    if (isHome) return null;
    const path = location.pathname.replace(/^\//, '');
    const segments = path.split('/');

    const routeTitleMap = {
      'dashboard': t('nav.dashboard'),
      'farm-map': t('nav.farmMap'),
      'weather-calendar': t('nav.weatherCalendar'),
      'soil-report': t('nav.soilReport'),
      'crop-suitability': t('nav.cropSuitability'),
      'rotation-planner': t('nav.rotationPlanner'),
      'what-if-simulator': t('nav.whatIfSimulator'),
      'scenario-comparison': t('nav.scenarioComparison'),
      'alerts': t('nav.alerts'),
      'data-sources': t('nav.dataSources'),
      'salinity-prediction': t('nav.salinityPrediction'),
      'ml-suitability': t('nav.mlSuitability'),
      'intelligent-rotation': t('nav.intelligentRotation'),
      'model-evaluation': t('nav.modelEvaluation'),
      'soil-history': t('nav.soilHistory')
    };

    return (
      <nav aria-label={isBangla ? 'পথনির্দেশ' : 'Breadcrumb'} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-workspace-subtext)',
        marginBottom: '1rem'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-workspace-subtext)', textDecoration: 'none' }}>
          <Home size={13} />
          <span>{t('nav.home')}</span>
        </Link>
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight size={12} color="rgba(255, 255, 255, 0.45)" />
            <span style={{
              color: idx === segments.length - 1 ? '#FFFFFF' : 'var(--color-workspace-subtext)',
              fontWeight: idx === segments.length - 1 ? 'var(--font-weight-bold)' : 'normal'
            }}>
              {routeTitleMap[seg] || seg}
            </span>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <div
      className={isPublicLanding ? 'public-layout-root' : 'dashboard-layout-root'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: isPublicLanding ? 'var(--color-bg-main)' : 'var(--color-workspace-bg)'
      }}
    >
      {/* Pinned Top Navigation Unit */}
      <div className="layout-sticky-header">
        {/* Top Demonstration Notice Ribbon */}
        <div className="demo-notice-ribbon">
          <AlertCircle size={13} color="#FBBF24" />
          <span>
            {isBangla
              ? 'এগ্রিশিফট পর্ব ১ (ফ্রন্টএন্ড ইন্টারফেস): সমস্ত তথ্য ও মডেল প্রিভিউ পরীক্ষামূলক উদ্দেশ্যে প্রদর্শিত।'
              : 'AgriShift Part 1 (Frontend): All data feeds and model previews are currently for demonstration/interface evaluation.'}
          </span>
        </div>

        <Navbar />
      </div>

      {/* Spacer to preserve document flow under fixed header */}
      <div className="layout-header-spacer" aria-hidden="true" />

      {/* Main Content Area */}
      {isPublicLanding ? (
        <main style={{ flex: 1 }}>
          {children}
        </main>
      ) : (
        <div style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto'
        }}>
          {/* Desktop Left Sidebar */}
          <div className="sidebar-container">
            <Sidebar />
          </div>

          {/* Main Route Content */}
          <main
            className="dashboard-workspace"
            style={{
              flex: 1,
              padding: '1.5rem var(--space-4) 3rem var(--space-4)',
              maxWidth: '100%',
              overflowX: 'clip'
            }}
          >
            <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
              {getBreadcrumbs()}
              {children}
            </div>
          </main>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Layout;
