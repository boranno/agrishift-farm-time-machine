import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

const EVIDENCE_CASES = [
  {
    cropEn: 'Rice',
    cropBn: 'ধান',
    statusEn: 'VERIFIED*',
    statusBn: 'যাচাইকৃত*',
    color: '#166534',
    background: '#F0FDF4',
    noteEn: 'FAO rice tolerance values refer to soil-water EC while submerged; they are not a dry-season topsoil ECe threshold.',
    noteBn: 'FAO-তে ধানের সহনশীলতার মান ডোবা জমির পানির EC বোঝায়; এটি শুকনো মৌসুমের উপরিভাগের মাটির ECe সীমা নয়।',
    sources: [
      { label: 'FAO Irrigation Paper 29', href: 'https://www.fao.org/3/Y4263E/y4263e0e.htm' },
      { label: 'Bangladesh Rice Journal (2025)', href: 'https://www.banglajol.info/index.php/BRJ/article/view/90747' }
    ]
  },
  {
    cropEn: 'Mustard',
    cropBn: 'সরিষা',
    statusEn: 'PROXY',
    statusBn: 'প্রতিনিধি মান',
    color: '#854D0E',
    background: '#FEFCE8',
    noteEn: 'The 9.7 dS/m reference is a canola proxy, not a mustard-specific field threshold. The cited mustard trial was in a net house.',
    noteBn: '৯.৭ dS/m মানটি ক্যানোলা থেকে নেওয়া প্রতিনিধি মান, সরিষার মাঠ-পরীক্ষার নির্দিষ্ট সীমা নয়। উদ্ধৃত সরিষা পরীক্ষা নেট হাউসে করা হয়েছিল।',
    sources: [
      { label: 'FAO Irrigation Paper 29', href: 'https://www.fao.org/3/Y4263E/y4263e0e.htm' },
      { label: 'Mustard salinity study (2025)', href: 'https://www.banglajol.info/index.php/JESNR/article/view/81114' }
    ]
  },
  {
    cropEn: 'Sunflower',
    cropBn: 'সূর্যমুখী',
    statusEn: 'CONFLICT',
    statusBn: 'তথ্যে অমিল',
    color: '#9A3412',
    background: '#FFF7ED',
    noteEn: 'FAO lists a numeric value, while USDA-ARS describes sunflower tolerance as an estimate without a numeric threshold. Verify before use.',
    noteBn: 'FAO একটি সংখ্যাগত মান দিয়েছে, কিন্তু USDA-ARS সূর্যমুখীর সহনশীলতাকে নির্দিষ্ট সীমাবিহীন অনুমান বলেছে। ব্যবহারের আগে যাচাই করুন।',
    sources: [
      { label: 'FAO Irrigation Paper 29', href: 'https://www.fao.org/3/Y4263E/y4263e0e.htm' },
      { label: 'USDA-ARS salinity database', href: 'https://www.ars.usda.gov/pacific-west-area/riverside-ca/agricultural-water-efficiency-and-salinity-research-unit/docs/databases/fgs-crops/' }
    ]
  },
  {
    cropEn: 'Grasspea / khesari',
    cropBn: 'খেসারি',
    statusEn: 'NOT FOUND',
    statusBn: 'পাওয়া যায়নি',
    color: '#475569',
    background: '#F8FAFC',
    noteEn: 'The working source catalog has no verified coastal-Bangladesh ECe threshold for grasspea. Keep it unrated rather than calculating a score.',
    noteBn: 'খেসারির জন্য উপকূলীয় বাংলাদেশের যাচাইকৃত ECe সীমা কার্যকর উৎসতালিকায় নেই। স্কোর গণনা না করে এটিকে অমূল্যায়িত রাখুন।',
    sources: [
      { label: 'South-west cropping patterns (2021)', href: 'https://www.journalbinet.com/jbar-270221-277.html' },
      { label: 'Grasspea salinity study (Iran)', href: 'https://ejcp.gau.ac.ir/article_6888.html?lang=en' }
    ]
  }
];

export const CropEvidencePanel = ({ isBangla = false }) => (
  <section
    className="card"
    aria-labelledby="crop-evidence-title"
    style={{ marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
      <Info size={19} color="var(--color-primary-800)" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <h2 id="crop-evidence-title" style={{ fontSize: 'var(--font-size-base)', margin: '0 0 0.25rem' }}>
          {isBangla ? 'ফসলের গবেষণা-প্রমাণ পর্যালোচনা' : 'Crop Evidence Review'}
        </h2>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {isBangla
            ? 'খসড়া গবেষণা-তালিকা থেকে নির্বাচিত উদাহরণ। এই প্রমাণগুলো উপরের ডেমো স্কোরে সংযুক্ত নয় এবং স্থানীয় কৃষিবিদ দ্বারা যাচাই করা হয়নি।'
            : 'Selected examples from a draft research catalog. This evidence is not connected to the demo scores above and has not been validated by a local agronomist.'}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2" style={{ gap: '0.65rem' }}>
      {EVIDENCE_CASES.map(item => (
        <article
          key={item.cropEn}
          style={{
            border: '1px solid var(--color-border)',
            borderLeft: `4px solid ${item.color}`,
            borderRadius: 'var(--radius-sm)',
            background: item.background,
            padding: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', margin: 0, color: 'var(--color-text-main)' }}>
              {isBangla ? item.cropBn : item.cropEn}
            </h3>
            <span style={{ color: item.color, fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {isBangla ? item.statusBn : item.statusEn}
            </span>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: '0 0 0.55rem' }}>
            {isBangla ? item.noteBn : item.noteEn}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {item.sources.map(source => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '10px' }}
              >
                {source.label}
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            ))}
          </div>
        </article>
      ))}
    </div>

    <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', margin: '0.75rem 0 0' }}>
      {isBangla
        ? '* “যাচাইকৃত” মানে উদ্ধৃত উৎসে মানটি পাওয়া গেছে; এটি স্থানীয় মাঠ-যাচাই বা সুপারিশের নিশ্চয়তা নয়।'
        : '* “Verified” means the value was found in the cited source; it does not mean local field validation or a recommendation.'}
    </p>
  </section>
);

export default CropEvidencePanel;
