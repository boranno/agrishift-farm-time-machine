import React from 'react';
import {
  History,
  FileText,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFarm } from '../../context/FarmContext';
import PageHeader from '../../components/common/PageHeader';
import DemoBadge from '../../components/common/DemoBadge';
import { localizeFarmValue } from '../../utils/farmDisplay';

export const SoilHealthHistoryPage = () => {
  const { t, isBangla } = useTranslation();
  const { farm, soil } = useFarm();

  const historyRecords = [
    {
      date: '2026-09-15',
      season: 'Rabi Preparation',
      seasonBn: 'রবি প্রস্তুতি',
      ec: 4.8,
      ph: 6.8,
      om: 1.65,
      source: 'SRDI Khulna Regional Lab #4029',
      sourceBn: 'এসআরডিআই খুলনা আঞ্চলিক পরীক্ষাগার #৪০২৯',
      notesBn: 'আমন ধান কর্তন-পূর্ব টেস্ট। লবণাক্ততা স্বাভাবিক সীমার মধ্যে।'
    },
    {
      date: '2026-04-12',
      season: 'Pre-Monsoon / Dry Peak',
      seasonBn: 'চৈত্র-বৈশাখ শুষ্ক মৌসুমের শেষ',
      ec: 7.8,
      ph: 7.2,
      om: 1.50,
      source: 'Farmer Field Kit Test (Dacope)',
      sourceBn: 'কৃষকের মাঠপর্যায়ের কিট পরীক্ষা (দাকোপ)',
      notesBn: 'শুষ্ক মৌসুমের বাষ্পীভবনে লবণাক্ততা বৃদ্ধি। মিষ্টি পানির ফ্লাশিং করা হয়েছিল।'
    },
    {
      date: '2025-10-04',
      season: 'Post-Monsoon',
      seasonBn: 'বর্ষা-পরবর্তী পর্যায়',
      ec: 3.6,
      ph: 6.7,
      om: 1.42,
      source: 'DAE Soil Demonstration Survey',
      sourceBn: 'কৃষি সম্প্রসারণ অধিদপ্তরের মাটি প্রদর্শনী জরিপ',
      notesBn: 'বর্ষার পানিতে অতিরিক্ত লবণ ধুয়ে নেমে যায়।'
    }
  ];

  return (
    <div>
      <PageHeader
        title={isBangla ? 'মাটির স্বাস্থ্যের ইতিহাস' : 'Soil Health & Salinity History'}
        subtitle={`${localizeFarmValue(farm?.upazila || 'Dacope', isBangla)}, ${localizeFarmValue(farm?.district || 'Khulna', isBangla)}`}
        badge={<DemoBadge text="Historical Log" />}
        helpText={isBangla
          ? 'গত কয়েক মৌসুমের মাটি পরীক্ষার তথ্য সংরক্ষণ ও পর্যবেক্ষণের মাধ্যমে মাটির ক্ষয়ক্ষতি বা লবণাক্ততার গতিবিধি ট্র্যাক করুন।'
          : 'Historical tracking of soil test results across monsoon and dry-season cycles.'}
      />

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <History size={18} color="var(--color-primary-800)" />
            <span>{isBangla ? 'মাটি পরীক্ষার পূর্ব ইতিহাস' : 'Recorded Soil Tests'}</span>
          </h2>
          <DemoBadge text="Sample Historical Tests" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-cream)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.65rem 0.75rem' }}>{t('common.date')}</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>{t('common.season')}</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>ECe (dS/m)</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>pH</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>{isBangla ? 'জৈব পদার্থ (%)' : 'Organic Matter (%)'}</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>{t('common.source')}</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.map((rec, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: '600' }}>{rec.date}</td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>{isBangla ? rec.seasonBn : rec.season}</td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>
                    <span className={`badge ${rec.ec <= 4.0 ? 'badge-suitable' : rec.ec <= 6.0 ? 'badge-marginal' : 'badge-risky'}`}>
                      {rec.ec} dS/m
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>{rec.ph}</td>
                  <td style={{ padding: '0.65rem 0.75rem' }}>{rec.om}%</td>
                  <td style={{ padding: '0.65rem 0.75rem', color: 'var(--color-text-secondary)' }}>{isBangla ? rec.sourceBn : rec.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoilHealthHistoryPage;
