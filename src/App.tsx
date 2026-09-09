import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { MainLayout } from './components/layout/MainLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Fleet } from './pages/Fleet';
import { BusDetail } from './pages/BusDetail';
import { LiveMap } from './pages/LiveMap';
import { VideoAnalysis } from './pages/VideoAnalysis';
import { RoadHealth } from './pages/RoadHealth';
import { Traffic } from './pages/Traffic';
import { Incidents } from './pages/Incidents';
import { Alerts } from './pages/Alerts';
import { Routes as RoutesPage } from './pages/Routes';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SimulationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="fleet" element={<Fleet />} />
              <Route path="fleet/:busId" element={<BusDetail />} />
              <Route path="live-map" element={<LiveMap />} />
              <Route path="video-analysis" element={<VideoAnalysis />} />
              <Route path="road-health" element={<RoadHealth />} />
              <Route path="traffic" element={<Traffic />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </SimulationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
