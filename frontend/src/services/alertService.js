/**
 * Alert & Farmer Guidance Service
 * Provides situational advisories for coastal agricultural zones.
 */

export const INITIAL_ALERTS = [
  {
    id: 'alert-surge-remal',
    severity: 'critical',
    category: 'surge',
    titleEn: 'Cyclone Storm Surge Warning: High Breach Risk (LOSO LightGBM)',
    titleBn: 'ঘূর্ণিঝড় জলোচ্ছ্বাস সতর্কতা: উপকূলীয় পোল্ডার উপচে পড়ার উচ্চ ঝুঁকি',
    location: 'Shyamnagar & Dacope (Satkhira & Khulna Coastal Belt)',
    date: '2026-10-28',
    isRead: false,
    messageEn: 'GTSM coastal water level anomaly + astronomical high tide projected to exceed coastal polder embankment elevation (1.8m) with >75% surge probability. Model verified against Cyclone Remal (ROC-AUC 0.955, Precision 93%).',
    messageBn: 'জোয়ারের উচ্চতা ও ঝড়ো বাতাসের কারণে উপকূলীয় বাঁধ (১.৮মি) উপচে লবণাক্ত পানি প্রবেশের ঝুঁকি ৭৫% ছাড়িয়েছে। সাইক্লোন রিমাল যাচাইকৃত মডেলে এই সতর্কতা তৈরি হয়েছে।',
    actionEn: 'Close polder sluice gates immediately; harvest mature T. Aman or shift harvested bundles to higher ground.',
    actionBn: 'পোল্ডারের স্লুইস গেট অবিলম্বে বন্ধ করুন এবং পাকা আমন ধান কেটে দ্রুত উঁচু স্থানে সরিয়ে নিন।'
  },
  {
    id: 'alert-root-waterlogging',
    severity: 'warning',
    category: 'waterlogging',
    titleEn: 'Root-Zone Soil Saturation Alert: Hypoxia Stress Risk',
    titleBn: 'শিকড় অঞ্চলের মাটির জলাবদ্ধতা সতর্কতা: অক্সিজেনের ঘাটতি ঝুঁকি',
    location: 'Bhabadah Beel Basin (Jessore & Narail)',
    date: '2026-10-26',
    isRead: false,
    messageEn: 'ERA5-Land soil moisture and Sentinel-1 SAR models indicate root-zone pore saturation exceeding 85% for the next 20 days. Verified LightGBM (ROC-AUC 0.972, Precision 85.4%).',
    messageBn: 'মাটির নিচের স্তরে পানি জমে শিকড়ে অক্সিজেনের ঘাটতি হওয়ার ঝুঁকি দেখা দিয়েছে। ডাল ও সবজির শিকড় পচা রোধে সতর্কতা জরুরি।',
    actionEn: 'Dig 30 cm deep drainage trenches between crop rows; avoid heavy fertilizer application until soil drains.',
    actionBn: 'জমির আইল ও নালা কেটে দ্রুত পানি বের করার ব্যবস্থা করুন; মাটি না শুকানো পর্যন্ত সার প্রয়োগ স্থগিত রাখুন।'
  },
  {
    id: 'alert-1',
    severity: 'critical', // 'critical' | 'warning' | 'advisory'
    category: 'salinity',
    titleEn: 'Critical Canal Salinity Surge (> 5.2 dS/m)',
    titleBn: 'খালের পানিতে আকস্মিক তীব্র লবণাক্ততা বৃদ্ধি (> ৫.২ dS/m)',
    location: 'Dacope Upazila, Khulna',
    date: '2026-10-26',
    isRead: false,
    messageEn: 'Surface canal water salinity in Bajua mouza has crossed 5.2 dS/m due to low upstream river flow. Stop irrigating young Boro seedlings or watermelon pits directly from tidal canals without prior dilution.',
    messageBn: 'উজান থেকে মিষ্টি পানির প্রবাহ কম থাকায় বাজুয়া এলাকার খালের পানিতে লবণ ৫.২ dS/m ছাড়িয়েছে। খাল থেকে সরাসরি বোরো ধানের চারা বা তরমুজের নালায় পানি দেওয়া বন্ধ রাখুন।',
    actionEn: 'Use stored pond rainwater or irrigate only during low tide if testing confirms safe salinity.',
    actionBn: 'পুকুরে সংরক্ষিত মিষ্টি পানি ব্যবহার করুন এবং ভাটার সময় লবণাক্ততা পরীক্ষা করে সেচ দিন।'
  },
  {
    id: 'alert-2',
    severity: 'warning',
    category: 'weather',
    titleEn: 'Pre-Monsoon Depressive Squall Anticipated',
    titleBn: 'আগাম মৌসুমী বৃষ্টির পূর্বাভাস ও সতর্কতা',
    location: 'Khulna & Barishal Coastal Belt',
    date: '2026-10-24',
    isRead: false,
    messageEn: 'NASA GPM and regional radar indicate moderate-to-heavy convective showers expected over the next 48 hours. Field drainage outlets must be cleared immediately.',
    messageBn: 'নাসা জিপিএম ও আঞ্চলিক রাডার অনুযায়ী আগামী ৪৮ ঘণ্টার মধ্যে উপকূলীয় এলাকায় মাঝারি থেকে ভারী বৃষ্টির সম্ভাবনা রয়েছে। জমির পানি নিষ্কাশন নালা এখনই পরিষ্কার করুন।',
    actionEn: 'Open polder drainage sluices and drain stagnant water from low-lying pulse and vegetable beds.',
    actionBn: 'ডাল ও শাকসবজির জমি থেকে দ্রুত জমে থাকা পানি বের করার ব্যবস্থা নিশ্চিত করুন।'
  },
  {
    id: 'alert-3',
    severity: 'advisory',
    category: 'agronomy',
    titleEn: 'Optimal Sowing Window for Rabi Sunflower & Mustard',
    titleBn: 'রবি মৌসুমে সূর্যমুখী ও সরিষা বপনের উপযুক্ত সময়',
    location: 'All Coastal Agro-Ecological Zones',
    date: '2026-10-20',
    isRead: true,
    messageEn: 'With T. Aman harvest concluding, sow sunflower or mustard within the next 10–14 days to exploit residual moisture before high soil evaporation begins in February.',
    messageBn: 'আমন ধান কাটার পর পরই আগামী ১০-১৪ দিনের মধ্যে জমিতে রস থাকতে থাকতে সূর্যমুখী বা সরিষা বপন সম্পন্ন করুন।',
    actionEn: 'Apply straw mulch immediately after sowing to conserve soil water and inhibit salt crusting.',
    actionBn: 'বীজ বপনের পরপরই খড় দিয়ে ঢেকে (মালচিং) দিন যাতে মাটির আর্দ্রতা বজায় থাকে।'
  }
];

export const getAlerts = () => {
  try {
    const saved = localStorage.getItem('agrishift_farmer_alerts');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return INITIAL_ALERTS;
};

export const saveAlerts = (alerts) => {
  try {
    localStorage.setItem('agrishift_farmer_alerts', JSON.stringify(alerts));
  } catch (e) {}
};

