import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const PageHeader = ({
  title,
  subtitle,
  badge,
  actions,
  helpText
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useTranslation();

  return (
    <div style={{ marginBottom: '1.75rem' }} className="page-header-wrapper">
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '0.4rem'
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h1 className="page-header-title">
              {title}
            </h1>
            {badge}
            {helpText && (
              <button
                type="button"
                onClick={() => setShowHelp(prev => !prev)}
                className="btn btn-secondary btn-sm page-header-help-btn"
                style={{ padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}
                title={t('common.contextualHelp')}
              >
                <HelpCircle size={14} />
                <span style={{ fontSize: '11px' }}>{t('common.help')}</span>
              </button>
            )}
          </div>
          {subtitle && (
            <p className="page-header-subtitle">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Expandable Help Box */}
      {showHelp && helpText && (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-primary-200)',
          borderLeft: '4px solid var(--color-primary-600)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          marginTop: '0.85rem',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-main)',
          lineHeight: 1.65,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem',
          animation: 'fadeIn var(--transition-fast) ease-out'
        }}>
          <HelpCircle size={16} color="var(--color-primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{helpText}</div>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
