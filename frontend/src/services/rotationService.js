/**
 * Crop Rotation Service
 * Generates 3-season crop sequences based on BARI/BRRI agronomic recommendations.
 */

export const ROTATION_PATTERNS = [
  {
    id: 'rot-climate-resilient',
    nameEn: 'Climate-Resilient Salt-Leaching Sequence',
    nameBn: 'জলবায়ু-সহনশীল ও লবণ-হ্রাসকারী ফসল চক্র',
    suitabilityScore: 92,
    priorities: ['soil', 'saline'],
    soilSalinitySuitability: 'High (tolerates 4.0–8.0 dS/m)',
    soilSalinitySuitabilityBn: 'উচ্চ (৪.০–৮.০ dS/m সহনশীল)',
    waterRequirementLevel: 'Low to Moderate',
    waterRequirementLevelBn: 'কম থেকে মাঝারি',
    seasons: [
      {
        seasonKey: 'kharif1',
        seasonNameEn: 'Kharif-1 (Pre-Monsoon)',
        seasonNameBn: 'খরিপ-১ (গ্রীষ্মকাল)',
        cropNameEn: 'Green Manure / Dhaincha',
        cropNameBn: 'সবুজ সার / ধইঞ্চা',
        actionEn: 'Sow in late March; plough into soil at 45 days.',
        actionBn: 'চৈত্র মাসের শেষে বীজ বপন; ৪৫ দিনে চাষ দিয়ে মাটিতে মিশিয়ে দিন।',
        benefitEn: 'Adds 15 ton/ha organic matter, fixes nitrogen, and suppresses surface salt evaporation.',
        benefitBn: '১৫ টন/হেক্টর সবুজ সার যোগ করে ও মাটির লবণাক্ততা ওঠায় বাধা দেয়।'
      },
      {
        seasonKey: 'kharif2',
        seasonNameEn: 'Kharif-2 (Monsoon)',
        seasonNameBn: 'খরিপ-২ (বর্ষাকাল)',
        cropNameEn: 'T. Aman Rice (BRRI dhan73 / BRRI dhan87)',
        cropNameBn: 'রোপা আমন (ব্রি ধান৭৩ / ব্রি ধান৮৭)',
        actionEn: 'Transplant 25-day seedlings in early July with monsoon rain.',
        actionBn: 'আষাঢ়ের শুরুতে ২৫ দিনের সুস্থ চারা রোপণ করুন।',
        benefitEn: 'Utilizes natural rainwater for salt dilution; reduced chemical nitrogen requirement due to preceding Dhaincha.',
        benefitBn: 'বর্ষার পানিতে লবণ ধুয়ে যায়; আগের ধইঞ্চার কারণে ইউরিয়া সার ৩০% কম লাগে।'
      },
      {
        seasonKey: 'rabi',
        seasonNameEn: 'Rabi (Winter)',
        seasonNameBn: 'রবি (শীতকাল)',
        cropNameEn: 'Sunflower (BARI Surjomukhi-2 / 3)',
        cropNameBn: 'সূর্যমুখী (বারি সূর্যমুখী-২ / ৩)',
        actionEn: 'Dibble sow in Dec–Jan following Aman harvest with straw mulching.',
        actionBn: 'আমন কাটার পর পৌষ মাসে খড় দিয়ে মালচিং করে ডিবলিং পদ্ধতিতে বীজ বপন।',
        benefitEn: 'Deep taproots access subsoil moisture; tolerates coastal salinity up to 8.5 dS/m; high oil value.',
        benefitBn: 'গভীর শিকড়ের সাহায্যে নিচ থেকে আর্দ্রতা গ্রহণ করে এবং ৮.৫ dS/m পর্যন্ত লবণাক্ততা সহ্য করে।'
      }
    ],
    rationaleEn: 'This sequence prevents summer salt crusting via Dhaincha green biomass, relies on monsoon rain for Aman rice, and avoids high-water Boro rice by substituting drought-and-salt-hardy sunflower.',
    rationaleBn: 'এই ফসল চক্রটি ধইঞ্চার মাধ্যমে মাটির লবণাক্ততা ওঠার হার কমায়, বর্ষায় আমন নিশ্চিত করে এবং বোরোর পানির অভাব মেটাতে লবণ-সহনশীল সূর্যমুখী চাষ নিশ্চিত করে।'
  },
  {
    id: 'rot-legume-pulse',
    nameEn: 'Low-Water Legume & Pulse Intensive Sequence',
    nameBn: 'স্বল্প-পানির ডাল ও পুষ্টি সমৃদ্ধ ফসল চক্র',
    suitabilityScore: 86,
    priorities: ['water', 'soil'],
    soilSalinitySuitability: 'Moderate (tolerates up to 5.5 dS/m)',
    soilSalinitySuitabilityBn: 'মাঝারি (৫.৫ dS/m পর্যন্ত সহনশীল)',
    waterRequirementLevel: 'Very Low (Zero to 1 supplementary irrigation)',
    waterRequirementLevelBn: 'খুব কম (০–১ বার সম্পূরক সেচ)',
    seasons: [
      {
        seasonKey: 'kharif1',
        seasonNameEn: 'Kharif-1 (Pre-Monsoon)',
        seasonNameBn: 'খরিপ-১ (গ্রীষ্মকাল)',
        cropNameEn: 'Mungbean (BARI Mung-6)',
        cropNameBn: 'মুগডাল (বারি মুগ-৬)',
        actionEn: 'Sow in mid-March; pick 2-3 flushes of pods then incorporate stover.',
        actionBn: 'চৈত্রের মাঝামাঝি বপন; ২-৩ বার পড তুলে গাছ মাটিতে মিশিয়ে দিন।',
        benefitEn: 'Fast cash return; enriches soil fertility with biological nitrogen.',
        benefitBn: 'মাত্র ৬০ দিনে ফসল; জমিতে প্রাকৃতিকভাবে নাইট্রোজেন সার যোগ করে।'
      },
      {
        seasonKey: 'kharif2',
        seasonNameEn: 'Kharif-2 (Monsoon)',
        seasonNameBn: 'খরিপ-২ (বর্ষাকাল)',
        cropNameEn: 'T. Aman Rice (BRRI dhan49 / BRRI dhan75)',
        cropNameBn: 'রোপা আমন (ব্রি ধান৪৯ / ব্রি ধান৭৫)',
        actionEn: 'Standard transplanting under rainfed conditions.',
        actionBn: 'স্বাভাবিক বর্ষার বৃষ্টিতে চারা রোপণ।',
        benefitEn: 'Food security staple; benefits from residual pulse nitrogen.',
        benefitBn: 'পারিবারিক খাদ্যের প্রধান উৎস; আগের ডালের অবশিষ্ট সারে চমৎকার বৃদ্ধি।'
      },
      {
        seasonKey: 'rabi',
        seasonNameEn: 'Rabi (Winter)',
        seasonNameBn: 'রবি (শীতকাল)',
        cropNameEn: 'Relay Khesari / Mustard (BARI Khesari-2)',
        cropNameBn: 'রিলে খেসারি / সরিষা (বারি খেসারি-২)',
        actionEn: 'Broadcast 15 days before Aman harvest directly into standing crop.',
        actionBn: 'আমন ধান কাটার ১৫ দিন পূর্বে রিলে হিসেবে জমিতে ছিটিয়ে দিন।',
        benefitEn: 'Zero irrigation needed; captures residual soil moisture before salt rises.',
        benefitBn: 'কোনো বাড়তি সেচের প্রয়োজন নেই; মাটিতে লবণ ওঠার আগেই ফসল পরিপক্ক হয়।'
      }
    ],
    rationaleEn: 'Ideal for water-scarce coastal polders without freshwater irrigation reservoirs. Reduces fertilizer costs through dual-pulse biological fixation.',
    rationaleBn: 'মিষ্টি পানির সেচ সংকট থাকা উপকূলীয় এলাকার জন্য আদর্শ। দুটি ডাল জাতীয় ফসলের মাধ্যমে মাটির জৈব সার দ্বিগুণ হয়।'
  },
  {
    id: 'rot-salt-adapted-cereal',
    nameEn: 'Salt-Tolerant Double-Rice Cereal Pattern',
    nameBn: 'লবণ-সহনশীল দ্বি-ফসলী ধান পর্যায়ক্রম',
    suitabilityScore: 78,
    priorities: ['yield', 'saline'],
    soilSalinitySuitability: 'Moderate to High (Requires canal flushing)',
    soilSalinitySuitabilityBn: 'মাঝারি থেকে উচ্চ (খালের পানি দিয়ে লবণ ধুয়ে ফেলা প্রয়োজন)',
    waterRequirementLevel: 'High (Needs freshwater storage pond)',
    waterRequirementLevelBn: 'উচ্চ (মিষ্টি পানির পুকুর প্রয়োজন)',
    seasons: [
      {
        seasonKey: 'kharif1',
        seasonNameEn: 'Kharif-1 (Pre-Monsoon)',
        seasonNameBn: 'খরিপ-১ (গ্রীষ্মকাল)',
        cropNameEn: 'Green Manure or Summer Fallow',
        cropNameBn: 'সবুজ সার অথবা জমি প্রস্তুতি',
        actionEn: 'Soil resting and deep ploughing to crack salt layers.',
        actionBn: 'মাটি গভীর চাষ দিয়ে রোদ লাগানো ও লবণ ভাঙা।',
        benefitEn: 'Allows soil solarization and aeration.',
        benefitBn: 'মাটিতে রোদ ও বাতাস প্রবেশে সহায়তা করে।'
      },
      {
        seasonKey: 'kharif2',
        seasonNameEn: 'Kharif-2 (Monsoon)',
        seasonNameBn: 'খরিপ-২ (বর্ষাকাল)',
        cropNameEn: 'T. Aman Rice (BRRI dhan73)',
        cropNameBn: 'রোপা আমন (ব্রি ধান৭৩)',
        actionEn: 'Early transplanting to finish harvest before mid-November.',
        actionBn: 'কার্তিকের শুরুতে ধান তোলার লক্ষ্য নিয়ে আগাম রোপণ।',
        benefitEn: 'Clears land early for timely Boro seedbed preparation.',
        benefitBn: 'সময়মতো বোরো ধানের জন্য জমি দ্রুত প্রস্তুত করা যায়।'
      },
      {
        seasonKey: 'rabi',
        seasonNameEn: 'Rabi (Winter)',
        seasonNameBn: 'রবি (শীতকাল)',
        cropNameEn: 'Salt-Tolerant Boro Rice (BRRI dhan67)',
        cropNameBn: 'লবণ-সহনশীল বোরো ধান (ব্রি ধান৬৭)',
        actionEn: 'Transplant 35-day seedlings in early January with pond water.',
        actionBn: 'পৌষের শুরুতে পুকুর বা মিষ্টি খালের পানি দিয়ে চারা রোপণ।',
        benefitEn: 'High yield (6.5+ ton/ha); tolerates up to 8 dS/m seedling salinity.',
        benefitBn: 'উচ্চ ফলনশীল (হেক্টরে ৬.৫+ টন); ৮ dS/m পর্যন্ত লবণাক্ততা সহ্য করে।'
      }
    ],
    rationaleEn: 'Targeted for farmers with access to conserved pond freshwater. Sowing BRRI dhan67 early enables harvesting before peak April river salinity spikes.',
    rationaleBn: 'যাদের নিজস্ব পুকুরে মিষ্টি পানি জমানো আছে তাদের জন্য লাভজনক। আগাম চাষ করলে বৈশাখের তীব্র নোনা পানি আসার আগেই ধান কেটে নেওয়া যায়।'
  }
];

export const COMPARISON_PLANS = [
  {
    id: 'plan-1',
    categoryKey: 'current',
    categoryBadgeEn: 'Strategy 1: Current / Existing Rotation',
    categoryBadgeBn: 'কৌশল ১: বর্তমান / প্রচলিত ফসল চক্র',
    nameEn: 'Strategy 1: Traditional Coastal Rice-Fallow',
    nameBn: 'কৌশল ১: প্রচলিত এক-ফসলী আমন ও পতিত জমি',
    sequenceEn: 'Fallow / Weed -> T. Aman Rice -> Dry Fallow / Grazing',
    sequenceBn: 'পতিত জমি -> রোপা আমন -> শুকনো পতিত জমি (অনাবাদি)',
    seasonalSteps: [
      { seasonEn: 'Kharif-1', seasonBn: 'খরিপ-১', cropEn: 'Fallow / Weeds', cropBn: 'পতিত জমি / আগাছা' },
      { seasonEn: 'Kharif-2', seasonBn: 'খরিপ-২', cropEn: 'T. Aman Rice (Local Swarna)', cropBn: 'রোপা আমন (স্থানীয় স্বর্ণা)' },
      { seasonEn: 'Rabi', seasonBn: 'রবি', cropEn: 'Dry Fallow / Late Boro', cropBn: 'অনাবাদি জমি / নোনা বোরো' }
    ],
    waterDemandEn: 'Rainfed only in monsoon; extreme water scarcity in dry Rabi',
    waterDemandBn: 'কেবল বর্ষায় বৃষ্টি নির্ভর; শুকনো রবি মৌসুমে চরম পানি সংকট',
    salinityTolerance: '3.5 – 5.0 dS/m',
    soilHealthScore: 'Poor (Declining organic matter)',
    soilHealthScoreBn: 'দুর্বল (জৈব পদার্থ ক্রমাগত হ্রাস)',
    laborComplexityEn: 'Low (Active 4 months only)',
    laborComplexityBn: 'কম (বছরে মাত্র ৪ মাস চাষাবাদ)',
    economicNoteEn: 'Low annual farmer income; land remains barren 7 months with severe capillary salt accumulation.',
    economicNoteBn: 'বার্ষিক আয় কম; বছরের ৭ মাস জমি ফাঁকা থাকায় বাষ্পীভবনে মাটির উপরিভাগে লবণের শক্ত আস্তরণ তৈরি হয়।',
    evidenceEn: 'Observed baseline practice across 60%+ of Dacope and Shyamnagar polders (SRDI Saline Soils Monograph 2023).',
    evidenceBn: 'দাকোপ ও শ্যামনগর উপজেলার ৬০%+ জমিতে প্রচলিত ঐতিহাসিক চাষ পদ্ধতি (এসআরডিআই লবণাক্ত মৃত্তিকা সমীক্ষা ২০২৩)।',
    benefitsEn: 'Minimal capital outlay and low off-season labor commitment.',
    benefitsBn: 'পুঁজি বিনিয়োগ নগণ্য এবং শুকনো মৌসুমে শ্রমের চাপ থাকে না।',
    waterConsiderationsEn: 'Zero irrigation infrastructure required, but leaves soil moisture unutilized during post-monsoon drying.',
    waterConsiderationsBn: 'কোনো সেচ অবকাঠামোর প্রয়োজন হয় না, তবে বর্ষা-পরবর্তী মাটির অবশিষ্ট আর্দ্রতা অপচয় হয়।',
    soilConsiderationsEn: 'High evaporation exposes topsoil to intense salt crusting from February to May.',
    soilConsiderationsBn: 'তীব্র বাষ্পীভবনের কারণে ফেব্রুয়ারি থেকে মে মাসে মাটির উপরিভাগে অতিরিক্ত লবণ জমে জমি অনুর্বর হয়।',
    tradeOffsAndRisksEn: 'Low risk of capital loss, but locks farm into seasonal under-employment and declining soil fertility.',
    tradeOffsAndRisksBn: 'আর্থিক ক্ষতির ঝুঁকি কম হলেও মাটির উর্বরতা ক্রমহ্রাস পায় এবং কৃষক বছরের অধিকাংশ সময় বেকার থাকেন।',
    missingInfoEn: 'Field-specific salinity buildup rate and shallow groundwater salinity depth.',
    missingInfoBn: 'খামারভিত্তিক ভূগর্ভস্থ পানির গভীরতা ও লবণাক্ততা ওঠার সঠিক হার তাৎক্ষণিকভাবে অনিশ্চিত।',
    uncertaintyNoticeEn: 'Serves as baseline comparison category; not an agronomic target.',
    uncertaintyNoticeBn: 'তুলনামূলক পর্যালোচনার জন্য ভিত্তি স্তর হিসেবে প্রদর্শিত; এটি কোনো সুপারিশকৃত লক্ষ্য নয়।'
  },
  {
    id: 'plan-2',
    categoryKey: 'soil-health',
    categoryBadgeEn: 'Strategy 2: Soil-Health-Focused Rotation',
    categoryBadgeBn: 'কৌশল ২: মাটির স্বাস্থ্য ও লবণ-হ্রাসকারী কৌশল',
    nameEn: 'Strategy 2: Salt-Leaching Green Manure & Sunflower',
    nameBn: 'কৌশল ২: লবণ-হ্রাসকারী সবুজ সার ও সূর্যমুখী ধারা',
    sequenceEn: 'Green Manure (Dhaincha) -> T. Aman Rice -> Sunflower',
    sequenceBn: 'সবুজ সার (ধইঞ্চা) -> রোপা আমন -> সূর্যমুখী',
    seasonalSteps: [
      { seasonEn: 'Kharif-1', seasonBn: 'খরিপ-১', cropEn: 'Dhaincha (Green Manure)', cropBn: 'সবুজ সার (ধইঞ্চা)' },
      { seasonEn: 'Kharif-2', seasonBn: 'খরিপ-২', cropEn: 'T. Aman Rice (BRRI dhan73/87)', cropBn: 'রোপা আমন (ব্রি ধান৭৩/৮৭)' },
      { seasonEn: 'Rabi', seasonBn: 'রবি', cropEn: 'Sunflower (BARI Surjomukhi-2)', cropBn: 'সূর্যমুখী (বারি সূর্যমুখী-২)' }
    ],
    waterDemandEn: 'Low to Medium (Pond/canal rainwater storage with straw mulch)',
    waterDemandBn: 'স্বল্প থেকে মাঝারি (পুকুর/খালের মিষ্টি পানি ও খড় মালচিং)',
    salinityTolerance: '7.5 – 8.5 dS/m',
    soilHealthScore: 'Excellent (+15 ton/ha organic matter, salt reduction)',
    soilHealthScoreBn: 'চমৎকার (+১৫ টন/হেক্টর জৈব সার, লবণ হ্রাস)',
    laborComplexityEn: 'Medium (Year-round active field management)',
    laborComplexityBn: 'মাঝারি (বছরব্যাপী সুষম শ্রম ও পরিচর্যা)',
    economicNoteEn: 'High return; sunflower provides profitable premium edible oil with low supplemental water.',
    economicNoteBn: 'অধিক লাভজনক; কম পানিতে সূর্যমুখীর উচ্চমূল্যের ভোজ্য তেল ভালো মুনাফা তৈরি করে।',
    evidenceEn: 'BARI & BRRI On-Farm Research Division trials in AEZ 13 demonstrated 22% salt reduction and 1.8 ton/ha sunflower yield.',
    evidenceBn: 'বারি ও ব্রি সরেজমিন গবেষণা বিভাগ (AEZ 13) কর্তৃক প্রমাণিত: ২২% লবণ হ্রাস ও হেক্টরে ১.৮ টন সূর্যমুখী ফলন।',
    benefitsEn: 'Dhaincha biomass fixes atmospheric nitrogen; deep sunflower taproots access subsoil moisture without pumping saline aquifers.',
    benefitsBn: 'ধইঞ্চা মাটিতে প্রাকৃতিকভাবে নাইট্রোজেন যুক্ত করে; সূর্যমুখীর গভীর শিকড় লবণাক্ত ভূগর্ভস্থ পানি না তুলেই মাটির রস শোষণ করে।',
    waterConsiderationsEn: 'Requires 2 light supplemental irrigations during flowering; straw mulching conserves 35% soil moisture.',
    waterConsiderationsBn: 'কুঁড়ি আসার সময় ২ বার হালকা সম্পূরক সেচ দরকার; খড় মালচিং মাটির ৩৫% আর্দ্রতা ধরে রাখে।',
    soilConsiderationsEn: 'Active biological salt suppression; incorporates 15 ton/ha green biomass directly into the root zone.',
    soilConsiderationsBn: 'সক্রিয়ভাবে মাটির লবণ দমন করে এবং হেক্টরে ১৫ টন সবুজ জৈব পদার্থ মাটিতে যোগ করে।',
    tradeOffsAndRisksEn: 'Sunflower requires timely planting before mid-January; risk of bird damage during grain filling.',
    tradeOffsAndRisksBn: 'পৌষ মাসের মাঝামাঝি অবশ্যই বপন শেষ করতে হয়; ফুল ও দানা গঠনকালে পাখি তাড়ানোর পাহারা প্রয়োজন।',
    missingInfoEn: 'Local pond freshwater volume available through late March; village seed vendor stock levels.',
    missingInfoBn: 'চৈত্র মাস পর্যন্ত পুকুরে সঞ্চিত মিষ্টি পানির মোট পরিমাণ ও স্থানীয় বাজারে প্রত্যায়িত বীজের প্রাপ্যতা।',
    uncertaintyNoticeEn: 'Field trial average; local soil testing and extension officer (DAE) consultation recommended.',
    uncertaintyNoticeBn: 'গবেষণাগার ও ট্রায়ালের গড় ফলাফল; স্থানীয় কৃষি সম্প্রসারণ কর্মকর্তার (ডিএই) পরামর্শ গ্রহণ করা বাঞ্ছনীয়।'
  },
  {
    id: 'plan-3',
    categoryKey: 'water-resilience',
    categoryBadgeEn: 'Strategy 3: Water-Resilience-Focused Rotation',
    categoryBadgeBn: 'কৌশল ৩: পানি-সাশ্রয়ী ও খরা-সহনশীল কৌশল',
    nameEn: 'Strategy 3: Low-Water Legume Intensive Sequence',
    nameBn: 'কৌশল ৩: স্বল্প-পানির ডাল ও পুষ্টি সমৃদ্ধ ধারা',
    sequenceEn: 'Mungbean -> T. Aman Rice -> Relay Khesari',
    sequenceBn: 'মুগডাল -> রোপা আমন -> রিলে খেসারি',
    seasonalSteps: [
      { seasonEn: 'Kharif-1', seasonBn: 'খরিপ-১', cropEn: 'Mungbean (BARI Mung-6)', cropBn: 'মুগডাল (বারি মুগ-৬)' },
      { seasonEn: 'Kharif-2', seasonBn: 'খরিপ-২', cropEn: 'T. Aman Rice (BRRI dhan75)', cropBn: 'রোপা আমন (ব্রি ধান৭৫)' },
      { seasonEn: 'Rabi', seasonBn: 'রবি', cropEn: 'Relay Khesari (BARI Khesari-2)', cropBn: 'রিলে খেসারি (বারি খেসারি-২)' }
    ],
    waterDemandEn: 'Minimal (Near-zero supplemental irrigation required)',
    waterDemandBn: 'নগণ্য (কোনো বাড়তি সেচ বা পাম্পের প্রয়োজন নেই)',
    salinityTolerance: '5.0 – 6.0 dS/m',
    soilHealthScore: 'Very Good (Dual biological nitrogen fixation)',
    soilHealthScoreBn: 'খুব ভালো (দ্বিমুখী প্রাকৃতিক নাইট্রোজেন সংযোজন)',
    laborComplexityEn: 'Low to Medium (Simple relay broadcasting before Aman harvest)',
    laborComplexityBn: 'সহজ (আমন ধান কাটার আগেই জমিতে বীজ ছিটানো যায়)',
    economicNoteEn: 'Zero diesel pumping costs; dual pulse harvest ensures household protein and market cash flow.',
    economicNoteBn: 'সেচের কোনো ডিজেল বা বিদ্যুৎ খরচ নেই; দুই মৌসুমে ডাল উৎপাদনে পরিবারের পুষ্টি ও নগদ আয় নিশ্চিত হয়।',
    evidenceEn: 'Validated by BARI Pulses Research Centre for coastal fallow land intensification under rainfed hydrology.',
    evidenceBn: 'বারি ডাল গবেষণা কেন্দ্র কর্তৃক উপকূলীয় অনাবাদি জমিতে স্বল্প-পানির নিবিড় চাষাবাদের জন্য পরীক্ষিত।',
    benefitsEn: 'Dual legume nodes fix 60+ kg/ha nitrogen; Khesari matures before peak dry-season salinity arrives.',
    benefitsBn: 'দুই মৌসুমে ডাল জাতীয় ফসলের মূলের নডিউল ৬০+ কেজি নাইট্রোজেন যোগ করে; তীব্র লবণ আসার আগেই খেসারি পাকে।',
    waterConsiderationsEn: 'Utilizes residual soil moisture after Aman harvest; zero dependence on canal or groundwater pumping.',
    waterConsiderationsBn: 'আমন কাটার পর মাটির স্বাভাবিক রসের ওপর নির্ভর করে; খাল বা নলকূপের ওপর কোনো নির্ভরতা নেই।',
    soilConsiderationsEn: 'Improves soil structure and prevents evaporation via continuous pulse canopy ground cover.',
    soilConsiderationsBn: 'জমির মাটিতে ক্রমাগত শামিয়ানা তৈরি করে বাষ্পীভবন রোধ করে ও মাটির গুণগত মান বাড়ায়।',
    tradeOffsAndRisksEn: 'Susceptible to unexpected heavy pre-monsoon rains in April (waterlogging damage to Mungbean pods).',
    tradeOffsAndRisksBn: 'বৈশাখ মাসের আগাম অতিবৃষ্টি বা জলাবদ্ধতায় মুগডালের ক্ষতি হতে পারে; সময়মতো পানি নিষ্কাশন নালা জরুরি।',
    missingInfoEn: 'Subsoil moisture retention duration after Aman draining; local drainage canal clearance.',
    missingInfoBn: 'আমন কাটার পর মাটিতে রসের স্থায়িত্ব এবং স্থানীয় পানি নিষ্কাশন খালের স্লুইস গেটের সময়সূচি।',
    uncertaintyNoticeEn: 'Agro-climatic classification; verify seasonal weather advisories before sowing.',
    uncertaintyNoticeBn: 'কৃষি-আবহাওয়াভিত্তিক শ্রেণিবিভাগ; বপনের আগে স্থানীয় আবহাওয়া পূর্বাভাস যাচাই করে নিন।'
  }
];

export const getRotationPatterns = (priority = 'all') => {
  if (priority === 'all') return ROTATION_PATTERNS;
  return ROTATION_PATTERNS.filter(p => p.priorities.includes(priority));
};

export const getComparisonPlans = () => COMPARISON_PLANS;
