import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Shared pages
import { DashboardPage } from './pages/DashboardPage';
import { AirspaceMapPage } from './pages/AirspaceMapPage';
import { LaancPage } from './pages/LaancPage';
import { MissionsPage } from './pages/MissionsPage';
import { FleetPage } from './pages/FleetPage';
import { CompliancePage } from './pages/CompliancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

// Sky Warden monetization pages
import { PricingPage } from './pages/PricingPage';
import { BillingPage } from './pages/BillingPage';
import { DroneRegistrationPage } from './pages/DroneRegistrationPage';
import { GovernmentRevenuePage } from './pages/GovernmentRevenuePage';

// Persona-specific pages
import { PilotDashboard } from './pages/pilot/PilotDashboard';
import { EnterpriseDashboard } from './pages/enterprise/EnterpriseDashboard';
import { AgencyDashboard } from './pages/agency/AgencyDashboard';
import { DeveloperDashboard } from './pages/developer/DeveloperDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PersonaRedirect() {
  const persona = useAuthStore((s) => s.user?.persona);
  switch (persona) {
    case 'individual_pilot':
      return <PilotDashboard />;
    case 'enterprise_manager':
      return <EnterpriseDashboard />;
    case 'agency_representative':
      return <AgencyDashboard />;
    case 'developer':
      return <DeveloperDashboard />;
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PersonaRedirect />} />
        <Route path="dashboard" element={<PersonaRedirect />} />
        <Route path="airspace" element={<AirspaceMapPage />} />
        <Route path="laanc" element={<LaancPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="registration" element={<DroneRegistrationPage />} />
        <Route path="government-revenue" element={<GovernmentRevenuePage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Persona-specific sub-routes */}
        <Route path="pilot/*" element={<PilotDashboard />} />
        <Route path="enterprise/*" element={<EnterpriseDashboard />} />
        <Route path="agency/*" element={<AgencyDashboard />} />
        <Route path="developer/*" element={<DeveloperDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
