/**
 * Farm Geolocation & Regional AEZ Service
 * Provides Bangladesh administrative and Agro-Ecological Zone metadata,
 * as well as world-scale coordinate validation and zone mapping.
 */

export const BANGLADESH_COASTAL_DISTRICTS = [
  {
    name: 'Khulna',
    nameBn: 'খুলনা',
    aez: 'AEZ 13: Ganges Tidal Floodplain',
    aezBn: 'এইজেড ১৩: গঙ্গা জোয়ার-ভাটা প্লাবনভূমি',
    upazilas: [
      { name: 'Dacope', nameBn: 'দাকোপ', defaultLat: 22.5721, defaultLon: 89.5105, salinityRisk: 'Very High (6-16 dS/m in dry season)' },
      { name: 'Koyra', nameBn: 'কয়রা', defaultLat: 22.3417, defaultLon: 89.3000, salinityRisk: 'Very High (8-18 dS/m in dry season)' },
      { name: 'Paikgachha', nameBn: 'পাইকগাছা', defaultLat: 22.5833, defaultLon: 89.3333, salinityRisk: 'High (4-12 dS/m in dry season)' },
      { name: 'Batiaghata', nameBn: 'বটিয়াঘাটা', defaultLat: 22.7417, defaultLon: 89.5333, salinityRisk: 'Moderate (2-8 dS/m in dry season)' },
      { name: 'Dumuria', nameBn: 'ডুমুরিয়া', defaultLat: 22.8083, defaultLon: 89.4250, salinityRisk: 'Slight to Moderate (2-6 dS/m)' }
    ]
  },
  {
    name: 'Satkhira',
    nameBn: 'সাতক্ষীরা',
    aez: 'AEZ 13: Ganges Tidal Floodplain / Coastal Saline',
    aezBn: 'এইজেড ১৩: গঙ্গা জোয়ার-ভাটা প্লাবনভূমি / উপকূলীয় লবণাক্ত',
    upazilas: [
      { name: 'Shyamnagar', nameBn: 'শ্যামনগর', defaultLat: 22.3306, defaultLon: 89.1028, salinityRisk: 'Extreme (>12 dS/m in dry season)' },
      { name: 'Assasuni', nameBn: 'আশাশুনি', defaultLat: 22.5500, defaultLon: 89.1833, salinityRisk: 'High (6-14 dS/m in dry season)' },
      { name: 'Kaliganj', nameBn: 'কালীগঞ্জ', defaultLat: 22.4500, defaultLon: 89.0417, salinityRisk: 'High (4-10 dS/m in dry season)' },
      { name: 'Debhata', nameBn: 'দেবহাটা', defaultLat: 22.5667, defaultLon: 88.9667, salinityRisk: 'Moderate to High' }
    ]
  },
  {
    name: 'Bagerhat',
    nameBn: 'বাগেরহাট',
    aez: 'AEZ 13: Ganges Tidal Floodplain',
    aezBn: 'এইজেড ১৩: গঙ্গা জোয়ার-ভাটা প্লাবনভূমি',
    upazilas: [
      { name: 'Mongla', nameBn: 'মোংলা', defaultLat: 22.4833, defaultLon: 89.6000, salinityRisk: 'Very High (6-15 dS/m)' },
      { name: 'Sarankhola', nameBn: 'শরণখোলা', defaultLat: 22.3000, defaultLon: 89.7833, salinityRisk: 'High (4-12 dS/m)' },
      { name: 'Morrelganj', nameBn: 'মোরেলগঞ্জ', defaultLat: 22.4500, defaultLon: 89.8500, salinityRisk: 'Moderate to High' },
      { name: 'Rampal', nameBn: 'রামপাল', defaultLat: 22.5667, defaultLon: 89.6667, salinityRisk: 'High (5-12 dS/m)' }
    ]
  },
  {
    name: 'Patuakhali',
    nameBn: 'পটুয়াখালী',
    aez: 'AEZ 13: Ganges Tidal Floodplain / Young Meghna Estuarine',
    aezBn: 'এইজেড ১৩: গঙ্গা জোয়ার-ভাটা প্লাবনভূমি / তরুণ মেঘনা মোহনা',
    upazilas: [
      { name: 'Kalapara', nameBn: 'কলাপাড়া', defaultLat: 21.9833, defaultLon: 90.2333, salinityRisk: 'High (4-10 dS/m)' },
      { name: 'Galachipa', nameBn: 'গলাচিপা', defaultLat: 22.1667, defaultLon: 90.4167, salinityRisk: 'Moderate to High' },
      { name: 'Rangabali', nameBn: 'রাঙ্গাবালী', defaultLat: 21.9167, defaultLon: 90.4667, salinityRisk: 'High (6-12 dS/m)' }
    ]
  },
  {
    name: 'Cox\'s Bazar',
    nameBn: 'কক্সবাজার',
    aez: 'AEZ 23: Chittagong Coastal Plain',
    aezBn: 'এইজেড ২৩: চট্টগ্রাম উপকূলীয় সমভূমি',
    upazilas: [
      { name: 'Chakaria', nameBn: 'চকোরিয়া', defaultLat: 21.7833, defaultLon: 92.0833, salinityRisk: 'Moderate in estuaries' },
      { name: 'Maheshkhali', nameBn: 'মহেশখালী', defaultLat: 21.5500, defaultLon: 91.9500, salinityRisk: 'High (Salt-bed prone)' },
      { name: 'Teknaf', nameBn: 'টেকনাফ', defaultLat: 20.8667, defaultLon: 92.3000, salinityRisk: 'Moderate coastal' }
    ]
  }
];

/**
 * Validates world-scale latitude and longitude coordinates.
 */
export const validateCoordinates = (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      valid: false,
      messageEn: 'Coordinates must be valid numbers',
      messageBn: 'স্থানাঙ্ক অবশ্যই সঠিক সংখ্যা হতে হবে'
    };
  }

  // World-scale latitude validation (-90° to +90°)
  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      messageEn: 'Latitude must be between -90.0° and +90.0°',
      messageBn: 'অক্ষাংশ অবশ্যই -৯০.০° থেকে +৯০.০° এর মধ্যে হতে হবে'
    };
  }

  // World-scale longitude validation (-180° to +180°)
  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      messageEn: 'Longitude must be between -180.0° and +180.0°',
      messageBn: 'দ্রাঘিমাংশ অবশ্যই -১৮০.০° থেকে +১৮০.০° এর মধ্যে হতে হবে'
    };
  }

  return { valid: true };
};

/**
 * Checks whether coordinates fall within Bangladesh boundaries
 * Lat: 20.5°N – 26.7°N, Lon: 88.0°E – 92.7°E
 */
export const isWithinBangladesh = (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  return (
    latitude >= 20.5 &&
    latitude <= 26.7 &&
    longitude >= 88.0 &&
    longitude <= 92.7
  );
};

export default {
  BANGLADESH_COASTAL_DISTRICTS,
  validateCoordinates,
  isWithinBangladesh
};
