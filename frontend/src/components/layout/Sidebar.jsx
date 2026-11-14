import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  MapPin,
  CloudSun,
  FileText,
  Sprout,
  CalendarDays,
  SlidersHorizontal,
  GitCompare,
  Bell,
  Satellite,
  Gauge,
  Cpu,
  Workflow,
  ShieldCheck,
  History
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const Sidebar = () => {
  const { t, isBangla } = useTranslation();

  const sections = [
    {
      titleEn: 'Decision Support',
      titleBn: 'কৃষি সিদ্ধান্ত সহায়তা',
      items: [
        { to: '/', label: t('nav.home'), icon: Home },
        { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
        { to: '/farm-map', label: t('nav.farmMap'), icon: MapPin },
        { to: '/crop-suitability', label: t('nav.cropSuitability'), icon: Sprout },
        { to: '/rotation-planner', label: t('nav.rotationPlanner'), icon: CalendarDays },
        { to: '/weather-calendar', label: t('nav.weatherCalendar'), icon: CloudSun },
        { to: '/soil-report', label: t('nav.soilReport'), icon: FileText }
      ]
    },
    {
      titleEn: 'Simulations & Alerts',
      titleBn: 'সিমুলেশন ও সতর্কতা',
      items: [
        { to: '/what-if-simulator', label: t('nav.whatIfSimulator'), icon: SlidersHorizontal },
        { to: '/scenario-comparison', label: t('nav.scenarioComparison'), icon: GitCompare },
        { to: '/alerts', label: t('nav.alerts'), icon: Bell },
        { to: '/soil-history', label: t('nav.soilHistory'), icon: History }
      ]
    },
    {
      titleEn: 'NASA Pipeline & ML',
      titleBn: 'নাসা উপগ্রহ ও এআই মডেল',
      items: [
        { to: '/data-sources', label: t('nav.dataSources'), icon: Satellite },
        { to: '/salinity-prediction', label: t('nav.salinityPrediction'), icon: Gauge },
        { to: '/ml-suitability', label: t('nav.mlSuitability'), icon: Cpu },
        { to: '/intelligent-rotation', label: t('nav.intelligentRotation'), icon: Workflow },
        { to: '/model-evaluation', label: t('nav.modelEvaluation'), icon: ShieldCheck }
      ]
    }
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      backgroundColor: 'var(--color-sidebar-bg)',
      borderRight: '1px solid var(--color-sidebar-border)',
      minHeight: '100%',
      padding: '1.25rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)'
    }} className="app-sidebar">
      {sections.map((section, idx) => (
        <div key={idx}>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-sidebar-text-muted)',
            padding: '0 0.75rem 0.5rem 0.75rem'
          }}>
            {isBangla ? section.titleBn : section.titleEn}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {section.items.map(item => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.62rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                    color: isActive ? '#FFFFFF' : 'var(--color-sidebar-text)',
                    backgroundColor: isActive ? 'rgba(34, 160, 107, 0.28)' : 'transparent',
                    border: isActive ? '1px solid rgba(134, 239, 172, 0.4)' : '1px solid transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(34, 160, 107, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none'
                  })}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: 'inherit',
                    flexShrink: 0
                  }}>
                    <IconComponent size={16} />
                  </div>
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;

