import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { MainLayout } from './components/layout/MainLayout';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Fleet } from './pages/Fleet';
import { BusDetail } from './pages/BusDetail';
import { LiveMap } from './pages/LiveMap';
import { VideoAnalysis } from './pages/VideoAnalysis';
import { RoadIntelligenceHub } from './pages/RoadIntelligenceHub';
import { AnalyticsReportsHub } from './pages/AnalyticsReportsHub';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SimulationProvider>
          <Routes>
            {/* Direct default route to Dashboard as primary command center */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* RoadMetrics Flagship Public Portal / Marketing Showcase */}
            <Route path="/portal" element={<Landing />} />
            <Route path="/showcase" element={<Landing />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />

            {/* Web-Based GIS Platform Console */}
            <Route element={<MainLayout />}>
              {/* Primary Consolidated Hubs */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="fleet" element={<Fleet />} />
              <Route path="fleet/:busId" element={<BusDetail />} />
              <Route path="live-map" element={<LiveMap />} />
              <Route path="video-analysis" element={<VideoAnalysis />} />
              
              {/* Unified Module: Road, Traffic & Incidents Intelligence */}
              <Route path="road-intelligence" element={<RoadIntelligenceHub />} />
              
              {/* Unified Module: Analytics, Route OD Flow & Reports */}
              <Route path="analytics-reports" element={<AnalyticsReportsHub />} />

              {/* Legacy route redirects to unified hubs */}
              <Route path="road-health" element={<Navigate to="/road-intelligence?tab=defects" replace />} />
              <Route path="traffic" element={<Navigate to="/road-intelligence?tab=traffic" replace />} />
              <Route path="incidents" element={<Navigate to="/road-intelligence?tab=incidents" replace />} />
              <Route path="analytics" element={<Navigate to="/analytics-reports?tab=analytics" replace />} />
              <Route path="routes" element={<Navigate to="/analytics-reports?tab=routes" replace />} />
              <Route path="reports" element={<Navigate to="/analytics-reports?tab=reports" replace />} />

              {/* Secondary System Pages */}
              <Route path="alerts" element={<Alerts />} />
              <Route path="settings" element={<Settings />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </SimulationProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
