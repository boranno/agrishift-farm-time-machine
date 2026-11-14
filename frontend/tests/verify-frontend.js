import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSoilEcBasis, parseSoilReportText } from '../src/services/soilService.js';
import { HOME_TOOL_GROUPS } from '../src/pages/Home/homeToolRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../src/locales');
const enPath = path.join(localesDir, 'en.json');
const bnPath = path.join(localesDir, 'bn.json');

console.log('--- AgriShift Frontend Verification ---');

// 1. Verify Locales
if (!fs.existsSync(enPath) || !fs.existsSync(bnPath)) {
  console.error('❌ Locale files missing!');
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const bn = JSON.parse(fs.readFileSync(bnPath, 'utf-8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], key));
    } else {
      keys.push(key);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const bnKeys = getKeys(bn);

console.log(`✓ English keys count: ${enKeys.length}`);
console.log(`✓ Bangla keys count: ${bnKeys.length}`);

const missingInBn = enKeys.filter(k => !bnKeys.includes(k));
const missingInEn = bnKeys.filter(k => !enKeys.includes(k));

if (missingInBn.length > 0) {
  console.warn(`⚠️ Keys in EN but missing in BN (${missingInBn.length}):`, missingInBn.slice(0, 5));
} else {
  console.log('✓ All English keys are present in Bangla translations!');
}

if (missingInEn.length > 0) {
  console.warn(`⚠️ Keys in BN but missing in EN (${missingInEn.length}):`, missingInEn.slice(0, 5));
} else {
  console.log('✓ All Bangla keys are present in English translations!');
}

// 2. Verify 15 Feature Components
const pagesToCheck = [
  '../src/pages/Home/HomePage.jsx',
  '../src/pages/FarmMap/FarmMapPage.jsx',
  '../src/pages/Dashboard/DashboardPage.jsx',
  '../src/pages/WeatherCalendar/WeatherCalendarPage.jsx',
  '../src/pages/SoilReport/SoilReportPage.jsx',
  '../src/pages/CropSuitability/CropSuitabilityPage.jsx',
  '../src/pages/RotationPlanner/RotationPlannerPage.jsx',
  '../src/pages/WhatIfSimulator/WhatIfSimulatorPage.jsx',
  '../src/pages/ScenarioComparison/ScenarioComparisonPage.jsx',
  '../src/pages/Alerts/AlertsPage.jsx',
  '../src/pages/DataSources/DataSourcesPage.jsx',
  '../src/pages/SalinityPrediction/SalinityPredictionPage.jsx',
  '../src/pages/CropSuitability/MlSuitabilityPage.jsx',
  '../src/pages/RotationPlanner/IntelligentRotationPage.jsx',
  '../src/pages/ModelEvaluation/ModelEvaluationPage.jsx'
];

let allPagesExist = true;
pagesToCheck.forEach((pageRelPath, idx) => {
  const fullPath = path.resolve(__dirname, pageRelPath);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ Feature ${idx + 1} page exists: ${path.basename(fullPath)}`);
  } else {
    console.error(`❌ Feature ${idx + 1} page missing: ${pageRelPath}`);
    allPagesExist = false;
  }
});

if (!allPagesExist) {
  console.error('❌ Some feature pages are missing!');
  process.exit(1);
}

console.log('✅ All 15 Feature components and localization checks passed!');

const appSource = fs.readFileSync(path.resolve(__dirname, '../src/App.jsx'), 'utf-8');
const appRoutePaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map(([, route]) => route)
  .filter(route => route !== '/' && route !== '*')
  .sort();
const homeToolPaths = HOME_TOOL_GROUPS.flatMap(group => group.items.map(item => item.to)).sort();

assert.equal(new Set(homeToolPaths).size, homeToolPaths.length, 'All-pages navigation must not contain duplicate routes.');
assert.deepEqual(homeToolPaths, appRoutePaths, 'All-pages navigation must link to every app page route exactly once.');
console.log(`✓ All-pages navigation links to all ${homeToolPaths.length} feature routes.`);

const parsedSoilReport = parseSoilReportText([
  'pH (1:2.5): 7.2',
  'ECe (dS/m): 4.5',
  'Nitrogen (N): 120 mg/kg',
  'Phosphorus (P): 18 mg/kg',
  'Potassium (K): 150 mg/kg',
  'Organic Matter (%): 1.65',
  'Sulfur: 18.2 ppm',
  'Zinc: 1.1 ppm',
  'Boron: 0.42 ppm'
].join('\n'));

assert.deepEqual(parsedSoilReport, {
  pH: 7.2,
  ec: 4.5,
  nitrogenMgKg: 120,
  phosphorusMgKg: 18,
  potassiumMgKg: 150
});
assert.deepEqual(parseSoilReportText('EC (dS/m): 4.5\nEC1:5: 1.2 dS/m\nNitrogen: 0.12%'), {});
assert.deepEqual(parseSoilReportText([
  'পিএইচ: ৬.৮',
  'মাটির ECe (dS/m): ৪.৮',
  'নাইট্রোজেন: ১২০ mg/kg',
  'ফসফরাস: ১৮ mg/kg',
  'পটাশিয়াম: ১৫০ mg/kg'
].join('\n')), {
  pH: 6.8,
  ec: 4.8,
  nitrogenMgKg: 120,
  phosphorusMgKg: 18,
  potassiumMgKg: 150
});
const providedCardText = [
  'Parameter (Unit) Value Critical Limit / Range Interpretation / Status',
  'Soil EC (dS/m) 3.8 < 4.0 Optimal / Low Salinity',
  'Soil pH 6.8 6.5 - 7.5 Optimal Neutral',
  'Nitrogen (N) (mg/kg) 145 150 - 250 Low',
  'Phosphorus (P)',
  '(mg/kg)',
  '24 20 - 30 Optimum',
  'Potassium (K) (mg/kg) 195 180 - 250 Optimum'
].join('\n');

assert.deepEqual(parseSoilReportText(providedCardText), {
  pH: 6.8,
  ec: 3.8,
  nitrogenMgKg: 145,
  phosphorusMgKg: 24,
  potassiumMgKg: 195
});
assert.equal(getSoilEcBasis(providedCardText), 'unspecified');
assert.equal(getSoilEcBasis('Soil ECe (dS/m): 4.5'), 'saturated-paste');
assert.deepEqual(parseSoilReportText('EC (dS/m): 4.5\nEC1:5: 1.2 dS/m'), {});
console.log('✓ Soil OCR parser reads the provided table layout and preserves an unspecified EC method.');

