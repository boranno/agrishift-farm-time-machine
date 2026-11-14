import React from 'react';
import { FlaskConical } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const DemoBadge = ({ text, style = {} }) => {
  const { t, isBangla } = useTranslation();
  const badgeTranslations = {
    'Feature 2 — World Map & Farm Profile': 'বৈশিষ্ট্য ২ — মানচিত্র ও খামার প্রোফাইল',
    'Feature 4': 'বৈশিষ্ট্য ৪',
    'Feature 5': 'বৈশিষ্ট্য ৫',
    'Feature 6': 'বৈশিষ্ট্য ৬',
    'Feature 7 • NASA-Informed': 'বৈশিষ্ট্য ৭ • নাসা তথ্যভিত্তিক',
    'Feature 8': 'বৈশিষ্ট্য ৮',
    'Feature 9 • NASA-Aligned': 'বৈশিষ্ট্য ৯ • নাসার সাথে সামঞ্জস্যপূর্ণ',
    'Feature 10': 'বৈশিষ্ট্য ১০',
    'Feature 11 • NASA Earth Observations': 'বৈশিষ্ট্য ১১ • নাসা ভূ-পর্যবেক্ষণ',
    'Feature 12': 'বৈশিষ্ট্য ১২',
    'Feature 13': 'বৈশিষ্ট্য ১৩',
    'Feature 14': 'বৈশিষ্ট্য ১৪',
    'Feature 15': 'বৈশিষ্ট্য ১৫',
    'Part 1 Frontend': 'পর্ব ১ ফ্রন্টএন্ড',
    'NASA Decision Support': 'নাসা সিদ্ধান্ত সহায়তা',
    'Activity Log': 'কার্যক্রমের তালিকা',
    'Editable OCR Output': 'সম্পাদনাযোগ্য ওসিআর ফলাফল',
    'Simulated Impact': 'সিমুলেশনের প্রভাব',
    'Planned SHAP Architecture': 'পরিকল্পিত SHAP কাঠামো',
    'Historical Log': 'ঐতিহাসিক নথি',
    'Sample Historical Tests': 'নমুনা পুরোনো পরীক্ষা',
    'Interactive Sequence Flow': 'ইন্টারেক্টিভ ফসল চক্র',
    'Part 1 Frontend Scaffold': 'পর্ব ১ ফ্রন্টএন্ড কাঠামো'
  };
  const localizedText = isBangla ? badgeTranslations[text] || text : text;

  return (
    <span
      className="badge badge-demo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '11px',
        fontWeight: 'var(--font-weight-semibold)',
        padding: '0.2rem 0.55rem',
        ...style
      }}
      title={isBangla ? 'শুধুমাত্র ইন্টারফেস তৈরির জন্য নমুনা তথ্য' : 'Sample data for interface development only'}
    >
      <FlaskConical size={12} />
      <span>{localizedText || t('common.demoBadge')}</span>
    </span>
  );
};

export default DemoBadge;
