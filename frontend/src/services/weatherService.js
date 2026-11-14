/**
 * Weather & Climate Service
 * Provides seasonal agro-meteorological indicators.
 * Clearly flagged as demonstration data pending live NASA GPM/POWER API in Part 2.
 */

export const DEMO_WEATHER_DATA = {
  location: 'Dacope, Khulna (Lat 22.57°N, Lon 89.51°E)',
  current: {
    temp: 28.4, // °C
    feelsLike: 31.2,
    humidity: 74, // %
    windSpeed: 14, // km/h
    condition: 'Partly Cloudy / মৃদু মেঘলা',
    uvIndex: 6,
    soilMoistureTop5cm: 0.24, // m3/m3 (from simulated SMAP)
    evapotranspiration: 4.2, // mm/day
    updatedAt: '2026-10-27T10:00:00+06:00'
  },
  forecast7Day: [
    { dayBn: 'আজ (সোম)', dayEn: 'Today (Mon)', maxTemp: 31, minTemp: 22, rainProb: 15, rainMm: 0, icon: 'sun' },
    { dayBn: 'মঙ্গল', dayEn: 'Tue', maxTemp: 32, minTemp: 23, rainProb: 20, rainMm: 0.5, icon: 'cloud-sun' },
    { dayBn: 'বুধ', dayEn: 'Wed', maxTemp: 30, minTemp: 22, rainProb: 45, rainMm: 4.0, icon: 'cloud-rain' },
    { dayBn: 'বৃহঃ', dayEn: 'Thu', maxTemp: 29, minTemp: 21, rainProb: 30, rainMm: 1.5, icon: 'cloud' },
    { dayBn: 'শুক্র', dayEn: 'Fri', maxTemp: 31, minTemp: 22, rainProb: 10, rainMm: 0, icon: 'sun' },
    { dayBn: 'শনি', dayEn: 'Sat', maxTemp: 32, minTemp: 23, rainProb: 5, rainMm: 0, icon: 'sun' },
    { dayBn: 'রবি', dayEn: 'Sun', maxTemp: 33, minTemp: 24, rainProb: 10, rainMm: 0, icon: 'sun' }
  ],
  monthlyRainfallComparison: [
    { monthBn: 'জানু', monthEn: 'Jan', currentSeason: 8, historical10Yr: 12 },
    { monthBn: 'ফেব্রু', monthEn: 'Feb', currentSeason: 22, historical10Yr: 28 },
    { monthBn: 'মার্চ', monthEn: 'Mar', currentSeason: 45, historical10Yr: 52 },
    { monthBn: 'এপ্রিল', monthEn: 'Apr', currentSeason: 88, historical10Yr: 95 },
    { monthBn: 'মে', monthEn: 'May', currentSeason: 195, historical10Yr: 180 },
    { monthBn: 'জুন', monthEn: 'Jun', currentSeason: 340, historical10Yr: 355 },
    { monthBn: 'জুলাই', monthEn: 'Jul', currentSeason: 395, historical10Yr: 410 },
    { monthBn: 'আগস্ট', monthEn: 'Aug', currentSeason: 320, historical10Yr: 330 },
    { monthBn: 'সেপ্টে', monthEn: 'Sep', currentSeason: 260, historical10Yr: 250 },
    { monthBn: 'অক্টো', monthEn: 'Oct', currentSeason: 140, historical10Yr: 135 },
    { monthBn: 'নভে', monthEn: 'Nov', currentSeason: 30, historical10Yr: 35 },
    { monthBn: 'ডিসে', monthEn: 'Dec', currentSeason: 5, historical10Yr: 10 }
  ],
  temperatureMonthly: [
    { monthBn: 'জানু', monthEn: 'Jan', min: 14, max: 25 },
    { monthBn: 'মার্চ', monthEn: 'Mar', min: 21, max: 33 },
    { monthBn: 'মে', monthEn: 'May', min: 26, max: 36 },
    { monthBn: 'জুলাই', monthEn: 'Jul', min: 26, max: 32 },
    { monthBn: 'সেপ্টে', monthEn: 'Sep', min: 25, max: 32 },
    { monthBn: 'নভে', monthEn: 'Nov', min: 18, max: 29 }
  ],
  isDemoData: true
};

export const getWeatherData = async () => {
  // Simulates network latency
  await new Promise(r => setTimeout(r, 200));
  return DEMO_WEATHER_DATA;
};

