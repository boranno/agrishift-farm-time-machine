import React from 'react';
import { Inbox, AlertCircle, Sprout } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  isError = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="card" style={{
      textAlign: 'center',
      padding: '3rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg-surface)'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isError ? 'var(--color-risky-bg)' : 'var(--color-bg-cream)',
        color: isError ? 'var(--color-risky-text)' : 'var(--color-primary-800)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <Icon size={28} />
      </div>

      <h3 style={{
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-bold)',
        color: isError ? 'var(--color-risky-text)' : 'var(--color-text-main)',
        marginBottom: '0.4rem'
      }}>
        {title || t('common.emptyState')}
      </h3>

      {description && (
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          maxWidth: '460px',
          marginBottom: action ? '1.25rem' : 0
        }}>
          {description}
        </p>
      )}

      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;

