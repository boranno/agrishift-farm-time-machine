import { BANGLADESH_COASTAL_DISTRICTS } from '../services/farmService';

const FARM_LABELS_BN = {
  'Clay Loam (Ganges Alluvium)': 'গঙ্গা পলির দোআঁশ',
  'Clay Loam': 'এঁটেল দোআঁশ',
  'Saline Heavy Clay': 'ভারী লবণাক্ত এঁটেল মাটি',
  'Silty Clay Loam': 'পলি এঁটেল দোআঁশ',
  'Sandy Loam / Coastal Char': 'বেলে দোআঁশ / উপকূলীয় চর মাটি',
  'Rainfed + Pond Storage (Scarce dry-season water)': 'বৃষ্টির পানি ও পুকুরের মজুত মিষ্টি পানি',
  'Rainfed + Pond Freshwater': 'বৃষ্টির পানি ও পুকুরের মজুত মিষ্টি পানি',
  'Canal Irrigation (Moderate Salinity 2-5 dS/m)': 'খালের পানি (মাঝারি লবণাক্ততা ২–৫ dS/m)',
  'Deep Tube-well (Freshwater)': 'গভীর নলকূপের মিষ্টি পানি',
  'Rainfed Only (Zero Dry-Season Water)': 'শুধু বৃষ্টির পানি (শুকনো মৌসুমে সেচ নেই)',
  'Pond storage': 'পুকুরের পানি',
  'Global / Other': 'আন্তর্জাতিক / অন্যান্য',
  'AEZ 13': 'এইজেড ১৩',
  'AEZ 13: Ganges Tidal Floodplain': 'এইজেড ১৩: গঙ্গা জোয়ার-ভাটা প্লাবনভূমি',
  'AEZ 13: Ganges Tidal Floodplain / Coastal Saline': 'এইজেড ১৩: গঙ্গা জোয়ার-ভাটা প্লাবনভূমি / উপকূলীয় লবণাক্ত অঞ্চল',
  'AEZ 13: Ganges Tidal Floodplain / Young Meghna Estuarine': 'এইজেড ১৩: গঙ্গা জোয়ার-ভাটা প্লাবনভূমি / তরুণ মেঘনা মোহনা',
  'AEZ 23: Chittagong Coastal Plain': 'এইজেড ২৩: চট্টগ্রাম উপকূলীয় সমভূমি'
};

for (const district of BANGLADESH_COASTAL_DISTRICTS) {
  FARM_LABELS_BN[district.name] = district.nameBn;
  FARM_LABELS_BN[district.aez] = district.aezBn;
  for (const upazila of district.upazilas) {
    FARM_LABELS_BN[upazila.name] = upazila.nameBn;
  }
}

export const localizeFarmValue = (value, isBangla) => (
  isBangla ? FARM_LABELS_BN[value] || value : value
);
