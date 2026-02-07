import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { PolicyTablePage } from './pages/PolicyTablePage';
import { TrafficSimPage } from './pages/TrafficSimPage';
import { TopologyPage } from './pages/TopologyPage';
import { NATPage } from './pages/NATPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/policies" element={<PolicyTablePage />} />
          <Route path="/traffic-sim" element={<TrafficSimPage />} />
          <Route path="/topology" element={<TopologyPage />} />
          <Route path="/nat" element={<NATPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
