import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { FarmProvider } from './context/FarmContext';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/Home/HomePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import FarmMapPage from './pages/FarmMap/FarmMapPage';
import WeatherCalendarPage from './pages/WeatherCalendar/WeatherCalendarPage';
import SoilReportPage from './pages/SoilReport/SoilReportPage';
import CropSuitabilityPage from './pages/CropSuitability/CropSuitabilityPage';
import RotationPlannerPage from './pages/RotationPlanner/RotationPlannerPage';
import WhatIfSimulatorPage from './pages/WhatIfSimulator/WhatIfSimulatorPage';
import ScenarioComparisonPage from './pages/ScenarioComparison/ScenarioComparisonPage';
import AlertsPage from './pages/Alerts/AlertsPage';
import DataSourcesPage from './pages/DataSources/DataSourcesPage';
import SalinityPredictionPage from './pages/SalinityPrediction/SalinityPredictionPage';
import MlSuitabilityPage from './pages/CropSuitability/MlSuitabilityPage';
import IntelligentRotationPage from './pages/RotationPlanner/IntelligentRotationPage';
import ModelEvaluationPage from './pages/ModelEvaluation/ModelEvaluationPage';
import SoilHealthHistoryPage from './pages/SoilHealthHistory/SoilHealthHistoryPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

export function App() {
  return (
    <LanguageProvider>
      <FarmProvider>
        <BrowserRouter>
          <Routes>
            {/* Feature 1: Home / Landing Page */}
            <Route
              path="/"
              element={
                <Layout isPublicLanding={true}>
                  <HomePage />
                </Layout>
              }
            />

            {/* Feature 2: Farm Location & Map */}
            <Route
              path="/farm-map"
              element={
                <Layout>
                  <FarmMapPage />
                </Layout>
              }
            />

            {/* Feature 3: My Farm Dashboard */}
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />

            {/* Feature 4: Weather & Crop Calendar */}
            <Route
              path="/weather-calendar"
              element={
                <Layout>
                  <WeatherCalendarPage />
                </Layout>
              }
            />

            {/* Feature 5: Soil Report OCR */}
            <Route
              path="/soil-report"
              element={
                <Layout>
                  <SoilReportPage />
                </Layout>
              }
            />

            {/* Feature 6: Crop Suitability Recommendation */}
            <Route
              path="/crop-suitability"
              element={
                <Layout>
                  <CropSuitabilityPage />
                </Layout>
              }
            />

            {/* Feature 7: Crop Rotation Planner */}
            <Route
              path="/rotation-planner"
              element={
                <Layout>
                  <RotationPlannerPage />
                </Layout>
              }
            />

            {/* Feature 8: What-if Simulator */}
            <Route
              path="/what-if-simulator"
              element={
                <Layout>
                  <WhatIfSimulatorPage />
                </Layout>
              }
            />

            {/* Feature 9: Scenario Comparison */}
            <Route
              path="/scenario-comparison"
              element={
                <Layout>
                  <ScenarioComparisonPage />
                </Layout>
              }
            />

            {/* Feature 10: Farmer Alerts & Guidance */}
            <Route
              path="/alerts"
              element={
                <Layout>
                  <AlertsPage />
                </Layout>
              }
            />

            {/* Feature 11: Satellite & Environmental Data Pipeline */}
            <Route
              path="/data-sources"
              element={
                <Layout>
                  <DataSourcesPage />
                </Layout>
              }
            />

            {/* Feature 12: Soil Salinity / EC Prediction UI */}
            <Route
              path="/salinity-prediction"
              element={
                <Layout>
                  <SalinityPredictionPage />
                </Layout>
              }
            />

            {/* Feature 13: ML-Assisted Crop Suitability UI */}
            <Route
              path="/ml-suitability"
              element={
                <Layout>
                  <MlSuitabilityPage />
                </Layout>
              }
            />

            {/* Feature 14: Intelligent Crop Rotation UI */}
            <Route
              path="/intelligent-rotation"
              element={
                <Layout>
                  <IntelligentRotationPage />
                </Layout>
              }
            />

            {/* Feature 15: Model Confidence & Evaluation */}
            <Route
              path="/model-evaluation"
              element={
                <Layout>
                  <ModelEvaluationPage />
                </Layout>
              }
            />

            {/* Soil Health History */}
            <Route
              path="/soil-history"
              element={
                <Layout>
                  <SoilHealthHistoryPage />
                </Layout>
              }
            />

            {/* 404 Not Found Route */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </FarmProvider>
    </LanguageProvider>
  );
}

export default App;

