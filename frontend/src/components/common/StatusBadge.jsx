import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const StatusBadge = ({ status = 'suitable', label, size = 'md' }) => {
  const { t, isBangla } = useTranslation();

  const config = {
    suitable: {
      className: 'badge-suitable',
      icon: CheckCircle2,
      defaultLabel: t('common.suitable'),
      iconColor: 'var(--color-suitable-dot)'
    },
    marginal: {
      className: 'badge-marginal',
      icon: AlertTriangle,
      defaultLabel: t('common.marginal'),
      iconColor: 'var(--color-marginal-dot)'
    },
    risky: {
      className: 'badge-risky',
      icon: XCircle,
      defaultLabel: t('common.risky'),
      iconColor: 'var(--color-risky-dot)'
    },
    info: {
      className: 'badge-info',
      icon: Info,
      defaultLabel: isBangla ? 'তথ্য' : 'Info',
      iconColor: 'var(--color-info-dot)'
    }
  };

  const current = config[status] || config.suitable;
  const IconComponent = current.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`badge ${current.className}`}
      style={{
        padding: size === 'sm' ? '0.2rem 0.5rem' : '0.3rem 0.75rem',
        fontSize: size === 'sm' ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}
    >
      <IconComponent size={iconSize} color={current.iconColor} />
      <span>{label || current.defaultLabel}</span>
    </span>
  );
};

export default StatusBadge;
