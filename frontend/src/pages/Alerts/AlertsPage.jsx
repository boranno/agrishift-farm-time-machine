import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  Filter,
  Check,
  Settings,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getAlerts, saveAlerts } from '../../services/alertService';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import EmptyState from '../../components/common/EmptyState';

export const AlertsPage = () => {
  const { t, isBangla } = useTranslation();
  const [alerts, setAlertsState] = useState(getAlerts());
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all', 'critical', 'warning', 'advisory'
  const [showSettings, setShowSettings] = useState(false);

  // Notification Preferences form state
  const [phoneNumber, setPhoneNumber] = useState('01700123456');
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [topicSalinity, setTopicSalinity] = useState(true);
  const [topicWeather, setTopicWeather] = useState(true);
  const [topicPest, setTopicPest] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const filteredAlerts = alerts.filter(a =>
    severityFilter === 'all' || a.severity === severityFilter
  );

  const handleMarkAsRead = (id) => {
    const updated = alerts.map(a => a.id === id ? { ...a, isRead: true } : a);
    setAlertsState(updated);
    saveAlerts(updated);
  };

  const handleMarkAllRead = () => {
    const updated = alerts.map(a => ({ ...a, isRead: true }));
    setAlertsState(updated);
    saveAlerts(updated);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title={t('alerts.title')}
        subtitle={t('alerts.subtitle')}
        badge={<DemoBadge text="Feature 10" />}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowSettings(prev => !prev)}
              className="btn btn-secondary btn-sm"
            >
              <Settings size={14} />
              <span>{t('alerts.notificationPreferences')}</span>
            </button>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn btn-secondary btn-sm"
            >
              <Check size={14} />
              <span>{t('alerts.markAllRead')}</span>
            </button>
          </div>
        }
        helpText={isBangla
          ? 'লবণাক্ততা বৃদ্ধি, ভারী বর্ষণ বা পোকামাকড়ের আক্রমণের পূর্বাভাস জানিয়ে কৃষকদের সচেতন করা হয় যাতে দ্রুত প্রতিরোধমূলক ব্যবস্থা নেওয়া যায়।'
          : 'Early advisories formulated from satellite moisture trends and regional agricultural field offices.'}
      />

      {/* Demo Notice */}
      <div className="callout callout-demo">
        <Info size={18} />
        <span>{t('alerts.demoNotice')}</span>
      </div>

      {/* Notification Preferences Drawer / Form */}
      {showSettings && (
        <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: 'var(--color-bg-cream)' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Smartphone size={18} color="var(--color-primary-800)" />
              <span>{t('alerts.notificationPreferences')}</span>
            </h3>
            <span className="badge badge-neutral">{isBangla ? 'নমুনা সেটিংস' : 'Demo Settings'}</span>
          </div>

          {settingsSaved && (
            <div className="callout callout-info animate-fade-in" style={{ padding: '0.5rem 0.75rem' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>{isBangla ? 'বার্তা সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Preferences saved successfully!'}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings}>
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="pref-phone">
                  {t('alerts.phoneLabel')}
                </label>
                <input
                  id="pref-phone"
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="form-control"
                  placeholder={isBangla ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <input
                  id="pref-sms"
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={e => setSmsEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-800)' }}
                />
                <label htmlFor="pref-sms" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', cursor: 'pointer' }}>
                  {t('alerts.smsAlerts')}
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', marginBottom: '0.4rem' }}>
                {t('alerts.alertTopics')}
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: 'var(--font-size-xs)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={topicSalinity} onChange={e => setTopicSalinity(e.target.checked)} />
                  <span>{t('alerts.topicSalinity')}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={topicWeather} onChange={e => setTopicWeather(e.target.checked)} />
                  <span>{t('alerts.topicWeather')}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={topicPest} onChange={e => setTopicPest(e.target.checked)} />
                  <span>{t('alerts.topicPest')}</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              {t('common.save')}
            </button>
          </form>
        </div>
      )}

      {/* Severity Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: t('alerts.filterAll') },
          { id: 'critical', label: t('alerts.filterCritical') },
          { id: 'warning', label: t('alerts.filterWarning') },
          { id: 'advisory', label: t('alerts.filterAdvisory') }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSeverityFilter(tab.id)}
            className="btn btn-sm"
            style={{
              backgroundColor: severityFilter === tab.id ? 'var(--color-primary-800)' : 'var(--color-bg-surface)',
              color: severityFilter === tab.id ? '#FFFFFF' : 'var(--color-text-main)',
              border: '1px solid var(--color-border)',
              fontWeight: severityFilter === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t('alerts.emptyAlerts')}
          description={isBangla ? 'বর্তমানে কোনো জরুরি ঝুঁকি বা সতর্কতা সক্রিয় নেই।' : 'No active notifications matching the current severity filter.'}
          action={<button onClick={() => setSeverityFilter('all')} className="btn btn-secondary btn-sm">{t('common.reset')}</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="card"
              style={{
                borderLeft: `5px solid ${alert.severity === 'critical' ? 'var(--color-risky-dot)' : alert.severity === 'warning' ? 'var(--color-marginal-dot)' : 'var(--color-info-dot)'}`,
                backgroundColor: alert.isRead ? 'var(--color-bg-surface)' : '#FBFDF9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span className={`badge ${alert.severity === 'critical' ? 'badge-risky' : alert.severity === 'warning' ? 'badge-marginal' : 'badge-info'}`} style={{ fontSize: '11px' }}>
                      {alert.severity.toUpperCase()}
                    </span>
                    {!alert.isRead && (
                      <span className="badge badge-demo" style={{ fontSize: '10px' }}>
                        {t('alerts.unreadBadge')}
                      </span>
                    )}
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {alert.date}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} />
                      {alert.location}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                    {isBangla ? alert.titleBn : alert.titleEn}
                  </h3>
                </div>

                {!alert.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '0.25rem 0.6rem' }}
                  >
                    {isBangla ? 'পঠিত চিহ্নিত করুন' : 'Mark Read'}
                  </button>
                )}
              </div>

              <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
                {isBangla ? alert.messageBn : alert.messageEn}
              </p>

              <div style={{
                backgroundColor: 'var(--color-bg-cream)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-primary-900)'
              }}>
                <strong>{isBangla ? 'করণীয় পদক্ষেপ: ' : 'Recommended Action: '}</strong>
                {isBangla ? alert.actionBn : alert.actionEn}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
