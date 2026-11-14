/**
 * Crop Reference & Suitability Service
 * Demo fixtures only; source alignment and local validation are still required.
 */

export const CROPS_CATALOG = [
  {
    id: 'crop-sunflower',
    nameEn: 'Sunflower (Surjomukhi)',
    nameBn: 'সূর্যমুখী (বারি সূর্যমুখী-২/৩)',
    category: 'oilseeds',
    seasons: ['rabi'],
    maxSalinityEc: 8.5, // dS/m
    criticalSalinityEc: 6.0,
    waterNeed: 'Medium (2-3 irrigations)',
    waterNeedBn: 'মাঝারি (২-৩টি সেচ)',
    durationDays: '95–105',
    soilPhMin: 6.0,
    soilPhMax: 8.2,
    yieldPotential: '1.8 – 2.2 ton/ha',
    descriptionEn: 'Deep taproot system that utilizes residual soil moisture and tolerates moderate-to-high salinity in coastal belts.',
    descriptionBn: 'গভীর মূলীয় ফসল যা মাটির নিচের আর্দ্রতা গ্রহণ করতে পারে এবং উপকূলীয় মাঝারি থেকে উচ্চ লবণাক্ততা সহ্য করে।',
    riskFactorsEn: 'Sensitive during seedling emergence (EC > 4.5 dS/m requires pre-irrigation flushing).',
    riskFactorsBn: 'চারা গজানোর সময় অতিরিক্ত লবণ সংবেদনশীল (ইসি > ৪.৫ হলে মিষ্টি পানি দিয়ে ধোয়া দরকার)।'
  },
  {
    id: 'crop-mustard',
    nameEn: 'Mustard (Sarisha)',
    nameBn: 'সরিষা (বারি সরিষা-১৪/১৭)',
    category: 'oilseeds',
    seasons: ['rabi'],
    maxSalinityEc: 5.5,
    criticalSalinityEc: 3.5,
    waterNeed: 'Low to Medium (1-2 irrigations)',
    waterNeedBn: 'কম থেকে মাঝারি (১-২টি হালকা সেচ)',
    durationDays: '75–85',
    soilPhMin: 6.0,
    soilPhMax: 7.8,
    yieldPotential: '1.4 – 1.7 ton/ha',
    descriptionEn: 'Short-duration oilseed that fits neatly between T. Aman harvest and late Rabi or Kharif sowing.',
    descriptionBn: 'স্বল্পমেয়াদী তৈলবীজ যা রোপা আমন কাটার পর সহজেই চাষ করা যায়।',
    riskFactorsEn: 'Yield drops significantly if topsoil salinity exceeds 5.0 dS/m during flowering stage.',
    riskFactorsBn: 'ফুল ফোটার সময় মাটির লবণ ৫.০ dS/m ছাড়ালে ফলন হ্রাস পায়।'
  },
  {
    id: 'crop-brri67',
    nameEn: 'Salt-Tolerant Boro Rice (BRRI dhan67)',
    nameBn: 'লবণ-সহনশীল বোরো ধান (ব্রি ধান৬৭)',
    category: 'cereals',
    seasons: ['rabi'],
    maxSalinityEc: 8.0,
    criticalSalinityEc: 6.0,
    waterNeed: 'High (Puddle irrigation)',
    waterNeedBn: 'অধিক (নিয়মিত সেচ ও দাঁড়ানো পানি)',
    durationDays: '140–150',
    soilPhMin: 5.5,
    soilPhMax: 7.5,
    yieldPotential: '6.5 – 7.5 ton/ha',
    descriptionEn: 'Specially bred by BRRI for coastal areas; tolerates up to 8 dS/m salinity during seedling and tillering.',
    descriptionBn: 'উপকূলীয় অঞ্চলের জন্য ব্রি উদ্ভাবিত; চারা অবস্থায় ৮ dS/m পর্যন্ত লবণাক্ততা সহ্য করে।',
    riskFactorsEn: 'Requires non-saline irrigation water during panicle initiation; canal salinity > 4 dS/m causes grain sterility.',
    riskFactorsBn: 'থোড় আসার সময় খালের পানি ৪ dS/m এর বেশি লবণাক্ত হলে চিটা হওয়ার ঝুঁকি থাকে।'
  },
  {
    id: 'crop-brri73',
    nameEn: 'Salt-Tolerant T. Aman Rice (BRRI dhan73)',
    nameBn: 'লবণ-সহনশীল রোপা আমন (ব্রি ধান৭৩)',
    category: 'cereals',
    seasons: ['kharif2'],
    maxSalinityEc: 7.0,
    criticalSalinityEc: 5.0,
    waterNeed: 'Rainfed (Monsoon Dependent)',
    waterNeedBn: 'বৃষ্টি-নির্ভর (বর্ষাকালীন)',
    durationDays: '120–125',
    soilPhMin: 5.5,
    soilPhMax: 8.0,
    yieldPotential: '4.5 – 5.2 ton/ha',
    descriptionEn: 'Major monsoon crop in southern delta; thrives on natural rainfall while tolerating coastal salt intrusion.',
    descriptionBn: 'দক্ষিণাঞ্চলের প্রধান বর্ষাকালীন ফসল; বৃষ্টির পানির সাহায্যে মাটির উপরিভাগের লবণ ধুয়ে গেলে ভালো ফলন হয়।',
    riskFactorsEn: 'Early withdrawal of monsoon rain in October can lead to soil drying and capillary salt rise during grain filling.',
    riskFactorsBn: 'আশ্বিন-কার্তিক মাসে বৃষ্টি তাড়াতাড়ি থেমে গেলে খরায় লবণাক্ততা বেড়ে ক্ষতি হতে পারে।'
  },
  {
    id: 'crop-aus-brri48',
    nameEn: 'Aus Rice (BRRI dhan48)',
    nameBn: 'আউশ ধান (ব্রি ধান৪৮)',
    category: 'cereals',
    seasons: ['kharif1'],
    maxSalinityEc: 4.5,
    criticalSalinityEc: 3.0,
    waterNeed: 'Medium (Early supplementary rain)',
    waterNeedBn: 'মাঝারি (বৈশাখী বৃষ্টি নির্ভর)',
    durationDays: '105–110',
    soilPhMin: 5.5,
    soilPhMax: 7.5,
    yieldPotential: '4.5 – 5.5 ton/ha',
    descriptionEn: 'Pre-monsoon crop grown to utilize early summer showers and avoid severe dry-season Boro irrigation constraints.',
    descriptionBn: 'বোরোর পানির সংকট এড়াতে বৈশাখী বৃষ্টির সহায়তায় চাষযোগ্য গ্রীষ্মকালীন ধান।',
    riskFactorsEn: 'Susceptible to early summer salinity spikes if pre-monsoon showers are delayed past mid-April.',
    riskFactorsBn: 'বৈশাখ মাসে সময়মতো বৃষ্টি না হলে মাটির লবণ বৃদ্ধি পেয়ে চারা শুকিয়ে যেতে পারে।'
  },
  {
    id: 'crop-khesari',
    nameEn: 'Grasspea / Relay Khesari (BARI Khesari-2)',
    nameBn: 'খেসারি / রিলে ডাল (বারি খেসারি-২)',
    category: 'pulses',
    seasons: ['rabi'],
    maxSalinityEc: 6.5,
    criticalSalinityEc: 4.5,
    waterNeed: 'Very Low (Zero to 1 irrigation / Relay)',
    waterNeedBn: 'খুব কম (জিরো সেচ / রিলে পদ্ধতি)',
    durationDays: '115–125',
    soilPhMin: 6.0,
    soilPhMax: 8.2,
    yieldPotential: '1.2 – 1.6 ton/ha',
    descriptionEn: 'Excellent relay crop broadcast directly into standing T. Aman rice fields before harvest; enriches soil with biological nitrogen.',
    descriptionBn: 'আমন ধান কাটার ১৫ দিন আগে জমিতে ছিটিয়ে (রিলে) আবাদ করা হয়; মাটিতে প্রাকৃতিকভাবে নাইট্রোজেন সার যোগ করে।',
    riskFactorsEn: 'Waterlogging at seedling stage ruins crop; field must have good surface drainage.',
    riskFactorsBn: 'চারা অবস্থায় জমিতে পানি জমলে পচে যায়; পানি নিষ্কাশনের ভালো ব্যবস্থা থাকা আবশ্যক।'
  },
  {
    id: 'crop-mungbean',
    nameEn: 'Mungbean (BARI Mung-6)',
    nameBn: 'মুগডাল (বারি মুগ-৬)',
    category: 'pulses',
    seasons: ['kharif1'],
    maxSalinityEc: 4.0,
    criticalSalinityEc: 2.5,
    waterNeed: 'Low (1 light irrigation if dry)',
    waterNeedBn: 'কম (অতিরিক্ত খরায় ১টি হালকা সেচ)',
    durationDays: '60–65',
    soilPhMin: 6.2,
    soilPhMax: 7.5,
    yieldPotential: '1.3 – 1.6 ton/ha',
    descriptionEn: 'Ultra-short duration pulse that fits in Late Rabi / Early Kharif-1; fixes atmospheric nitrogen and adds leaf biomass to soil.',
    descriptionBn: 'মাত্র ৬০-৬৫ দিনের ফসল; জমিতে সবুজ সার ও নাইট্রোজেন বৃদ্ধি করে মাটির লবণাক্ততার ক্ষতিকর প্রভাব কমায়।',
    riskFactorsEn: 'Highly sensitive to salinity above 4.0 dS/m and sudden pre-monsoon water stagnation.',
    riskFactorsBn: '৪ dS/m এর বেশি লবণে এবং জমিতে আকস্মিক পানি জমলে দ্রুত গাছ নষ্ট হয়ে যায়।'
  },
  {
    id: 'crop-dhaincha',
    nameEn: 'Green Manure / Dhaincha (Sesbania)',
    nameBn: 'সবুজ সার / ধইঞ্চা (সিসবানিয়া)',
    category: 'cashCrops',
    seasons: ['kharif1'],
    maxSalinityEc: 10.0,
    criticalSalinityEc: 7.5,
    waterNeed: 'Low (Rainfed)',
    waterNeedBn: 'কম (বৃষ্টির পানিতে দ্রুত বাড়ে)',
    durationDays: '45–55',
    soilPhMin: 5.0,
    soilPhMax: 8.5,
    yieldPotential: '15 – 20 ton/ha green biomass',
    descriptionEn: 'Top soil-regenerating cover crop in saline zones; incorporates 15–20 tons/ha organic biomass and suppresses salt crust formation.',
    descriptionBn: 'উপকূলের লবণাক্ত জমি শোধনের সেরা ফসল; ৪৫-৫০ দিনে মাটিতে মিশিয়ে দিলে প্রচুর জৈব পদার্থ যুক্ত হয় এবং লবণ কমে।',
    riskFactorsEn: 'Must be ploughed down at 45–50 days before stems become overly woody.',
    riskFactorsBn: 'গাছ শক্ত হওয়ার আগেই (৪৫-৫০ দিনের মধ্যে) চাষ দিয়ে মাটিতে মিশিয়ে দিতে হয়।'
  },
  {
    id: 'crop-watermelon',
    nameEn: 'Watermelon (Tormuj)',
    nameBn: 'তরমুজ (হাইব্রিড ড্রাগন/ব্ল্যাকবেরি)',
    category: 'vegetables',
    seasons: ['rabi'],
    maxSalinityEc: 5.0,
    criticalSalinityEc: 3.2,
    waterNeed: 'Medium (Canal / Pond irrigation with straw mulch)',
    waterNeedBn: 'মাঝারি (নালা ও খড় দিয়ে মালচিং সেচ)',
    durationDays: '80–90',
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    yieldPotential: '35 – 45 ton/ha',
    descriptionEn: 'High-value cash crop popular in coastal polders; grown with straw mulch to retain moisture and hinder salt capillary rise.',
    descriptionBn: 'উপকূলীয় পোল্ডারে অত্যন্ত লাভজনক অর্থকরী ফসল; খড় দিয়ে মালচিং করলে বাষ্পীভবন ও মাটির লবণ ওঠা রোধ হয়।',
    riskFactorsEn: 'Sudden rain in April or canal salinity exceeding 3.5 dS/m ruins fruit sweetness and causes root rot.',
    riskFactorsBn: 'মার্চ-এপ্রিলের অকাল বৃষ্টিতে বা খালের পানি বেশি লবণাক্ত হলে ফল ফেটে যায় ও স্বাদ নষ্ট হয়।'
  },
  {
    id: 'crop-wheat',
    nameEn: 'Wheat (BARI Gom-25, Salt-Tolerant)',
    nameBn: 'গম (বারি গম-২৫, লবণ-সহনশীল)',
    category: 'cereals',
    seasons: ['rabi'],
    maxSalinityEc: 7.5,
    criticalSalinityEc: 5.0,
    waterNeed: 'Medium (2-3 timely irrigations)',
    waterNeedBn: 'মাঝারি (মুকুট শিকড় ও শিষ আসার সময় সেচ)',
    durationDays: '105–112',
    soilPhMin: 6.0,
    soilPhMax: 8.0,
    yieldPotential: '3.8 – 4.2 ton/ha',
    descriptionEn: 'BARI Gom-25 is bred specifically for saline southern belts as an alternative to water-thirsty Boro rice.',
    descriptionBn: 'বোরো ধানের বিপুল পানি সাশ্রয়ের জন্য দক্ষিণাঞ্চলের লবণাক্ত এলাকার জন্য বিশেষভাবে তৈরি।',
    riskFactorsEn: 'High heat stress during February/March can force premature ripening if sown late.',
    riskFactorsBn: 'দেরিতে বুনলে ফেব্রুয়ারি-মার্চের গরমে দানা অপুষ্ট থাকার ঝুঁকি থাকে।'
  },
  {
    id: 'crop-groundnut',
    nameEn: 'Groundnut (BARI Chinabadam-8)',
    nameBn: 'চীনাবাদাম (বারি চীনাবাদাম-৮)',
    category: 'oilseeds',
    seasons: ['rabi', 'kharif1'],
    maxSalinityEc: 4.8,
    criticalSalinityEc: 3.0,
    waterNeed: 'Low (Drought resilient in sandy char soils)',
    waterNeedBn: 'কম (চরের বেলে-দোআঁশ মাটিতে খরা সহনশীল)',
    durationDays: '130–140',
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    yieldPotential: '2.2 – 2.6 ton/ha',
    descriptionEn: 'Thrives in riverine islands and coastal chars with sandy loam texture; provides valuable fodder and vegetable oil.',
    descriptionBn: 'চরে ও বেলে দোআঁশ মাটিতে চমৎকার ফলন; ডালপালা উৎকৃষ্ট গো-খাদ্য হিসেবে ব্যবহৃত হয়।',
    riskFactorsEn: 'Excessive soil crusting due to sodium prevents pegs from penetrating the soil.',
    riskFactorsBn: 'সোডিয়ামযুক্ত শক্ত মাটি বাদামের সুই বা শিকড় মাটির নিচে ঢুকতে বাধা দেয়।'
  },
  {
    id: 'crop-spinach',
    nameEn: 'Spinach (Palong Shak)',
    nameBn: 'পালং শাক (সবুজ)',
    category: 'vegetables',
    seasons: ['rabi'],
    maxSalinityEc: 7.0,
    criticalSalinityEc: 5.0,
    waterNeed: 'Medium (Light frequent sprinkler)',
    waterNeedBn: 'মাঝারি (ঘন ঘন হালকা পানি প্রয়োগ)',
    durationDays: '35–45',
    soilPhMin: 6.2,
    soilPhMax: 8.2,
    yieldPotential: '12 – 15 ton/ha',
    descriptionEn: 'Naturally halophytic leafy vegetable that tolerates elevated salinity better than most common vegetables.',
    descriptionBn: 'লবণাক্ততা সহনশীল পুষ্টিকর শাক যা স্বল্প সময়ে ঘরে তোলা যায়।',
    riskFactorsEn: 'Leaves can turn bitter if severe moisture deficit accompanies high salinity.',
    riskFactorsBn: 'পানি শূন্যতা এবং চড়া রোদে পাতার স্বাদ তিতা হয়ে যেতে পারে।'
  },
  {
    id: 'crop-potato',
    nameEn: 'Potato (Alu - Diamant)',
    nameBn: 'আলু (ডায়মন্ট)',
    category: 'vegetables',
    seasons: ['rabi'],
    maxSalinityEc: 3.5,
    criticalSalinityEc: 2.0,
    waterNeed: 'High (Frequent furrow irrigation)',
    waterNeedBn: 'বেশি (নিয়মিত নালা সেচ)',
    durationDays: '85–95',
    soilPhMin: 5.2,
    soilPhMax: 6.5,
    yieldPotential: '25 – 30 ton/ha',
    descriptionEn: 'Major winter staple; requires well-drained, light soils with low electrical conductivity.',
    descriptionBn: 'বাংলাদেশের প্রধান শীতকালীন কন্দজাতীয় ফসল; সুনিষ্কাশিত ও কম লবণের মাটি প্রয়োজন।',
    riskFactorsEn: 'Very sensitive to salinity. EC > 3.0 dS/m causes tuber blackening, poor skin set, and 50%+ yield loss.',
    riskFactorsBn: 'লবণাক্ততায় অত্যন্ত সংবেদনশীল। ইসি ৩ dS/m ছাড়ালে আলুর চামড়া কালো ও বিকৃত হয় এবং ফলন অর্ধেকে নেমে আসে।'
  },
  {
    id: 'crop-jute',
    nameEn: 'Jute (Deshi / Tossa)',
    nameBn: 'পাট (তোষা পাট - ও-৯৮৯৭)',
    category: 'cashCrops',
    seasons: ['kharif1'],
    maxSalinityEc: 4.2,
    criticalSalinityEc: 2.8,
    waterNeed: 'Medium to High (Rainfed monsoon)',
    waterNeedBn: 'মাঝারি থেকে বেশি (বর্ষার বৃষ্টিতে ভালো বাড়ে)',
    durationDays: '110–120',
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    yieldPotential: '2.5 – 3.2 ton/ha fibre',
    descriptionEn: 'Golden fibre of Bangladesh; excellent biomass contributor that leaves substantial organic matter in the soil.',
    descriptionBn: 'সোনালী আঁশ; কাটার পর প্রচুর পাতা মাটিতে ঝরে জমিকে উর্বর করে।',
    riskFactorsEn: 'Early germination fails if soil salinity exceeds 3.5 dS/m in March/April.',
    riskFactorsBn: 'চৈত্র মাসে বপনের সময় লবণ বেশি থাকলে বীজ ঠিকমতো গজায় না।'
  }
];

/**
 * Evaluates crop suitability based on soil salinity EC (dS/m), season, and water conditions.
 * Returns: 'suitable' | 'marginal' | 'risky'
 */
export const evaluateCropSuitability = (crop, soilEc, activeSeason = 'all') => {
  const ec = Number(soilEc) || 4.0;
  const seasonLabelsBn = {
    rabi: 'রবি',
    kharif1: 'খরিপ-১',
    kharif2: 'খরিপ-২'
  };
  const cropSeasonsBn = crop.seasons?.map(season => seasonLabelsBn[season] || season).join(', ') || '';

  // Season check
  const seasonMatch = activeSeason === 'all' || !crop.seasons || crop.seasons.includes(activeSeason);

  if (ec <= crop.criticalSalinityEc) {
    return {
      status: seasonMatch ? 'suitable' : 'marginal',
      reasonEn: seasonMatch
        ? `Soil salinity (${ec.toFixed(1)} dS/m) is safely below the critical threshold (${crop.criticalSalinityEc} dS/m).`
        : `Salinity is safe, but optimal sowing season is ${crop.seasons.join(', ')}.`,
      reasonBn: seasonMatch
        ? `মাটির লবণাক্ততা (${ec.toFixed(1)} dS/m) সহনশীল সীমার (${crop.criticalSalinityEc} dS/m) নিচে রয়েছে।`
        : `লবণাক্ততা ঠিক আছে, তবে এই ফসলের মূল মৌসুম হলো ${cropSeasonsBn}।`
    };
  } else if (ec <= crop.maxSalinityEc) {
    return {
      status: 'marginal',
      reasonEn: `Soil salinity (${ec.toFixed(1)} dS/m) is in the warning zone (${crop.criticalSalinityEc}–${crop.maxSalinityEc} dS/m). Requires mulching or salt flushing.`,
      reasonBn: `মাটির লবণাক্ততা (${ec.toFixed(1)} dS/m) সতর্কতামূলক সীমার মধ্যে। ভালো ফলন পেতে খড় দিয়ে মালচিং ও মিষ্টি পানির সেচ প্রয়োজন।`
    };
  } else {
    return {
      status: 'risky',
      reasonEn: `Soil salinity (${ec.toFixed(1)} dS/m) exceeds maximum tolerance (${crop.maxSalinityEc} dS/m). High risk of crop failure or stunting.`,
      reasonBn: `মাটির লবণাক্ততা (${ec.toFixed(1)} dS/m) সর্বোচ্চ সহনশীল সীমার (${crop.maxSalinityEc} dS/m) চেয়ে বেশি। ফসল মরে যাওয়ার বা তীব্র ফলন বিপর্যয়ের ঝুঁকি রয়েছে।`
    };
  }
};

export const getCropsCatalog = () => CROPS_CATALOG;
