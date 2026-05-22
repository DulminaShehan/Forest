import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import AlertsPage from '@/pages/AlertsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import CameraPage from '@/pages/CameraPage';
import DeviceStatusPage from '@/pages/DeviceStatusPage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/camera" element={<CameraPage />} />
        <Route path="/devices" element={<DeviceStatusPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}