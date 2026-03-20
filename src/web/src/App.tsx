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
import { WhiteLabelPage } from './pages/WhiteLabelPage';

// Onboarding & Flight Plans
import { OnboardingPage } from './pages/OnboardingPage';
import { FlightPlanPage } from './pages/FlightPlanPage';
import { OnboardingGuard } from './components/OnboardingGuard';

// Safety
import { SafetyReportingPage } from './pages/SafetyReportingPage';

// New feature pages
import { LiveTelemetryPage } from './pages/LiveTelemetryPage';
import { WeatherPage } from './pages/WeatherPage';
import { PilotLogbookPage } from './pages/PilotLogbookPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { GeofencePage } from './pages/GeofencePage';
import { InsurancePage } from './pages/InsurancePage';
import { IncidentPage } from './pages/IncidentPage';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { BVLOSPage } from './pages/BVLOSPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { UTMPage } from './pages/UTMPage';
import { PayloadPage } from './pages/PayloadPage';
import { DataProcessingPage } from './pages/DataProcessingPage';
import { AuditExportPage } from './pages/AuditExportPage';
import { TrainingPage } from './pages/TrainingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { DeliveryPage } from './pages/DeliveryPage';
import { CounterUASPage } from './pages/CounterUASPage';
import { CarbonESGPage } from './pages/CarbonESGPage';
import { LocalizationPage } from './pages/LocalizationPage';
import { OfflineFieldPage } from './pages/OfflineFieldPage';

// Public marketing pages
import { LandingPage } from './pages/LandingPage';
import { IndustriesPage } from './pages/IndustriesPage';
import { ResourceHubPage } from './pages/ResourceHubPage';

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
      {/* Public marketing routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/resources" element={<ResourceHubPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Onboarding (requires auth, outside dashboard) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <DashboardLayout />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<PersonaRedirect />} />
        <Route path="airspace" element={<AirspaceMapPage />} />
        <Route path="laanc" element={<LaancPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="safety" element={<SafetyReportingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="flight-plans" element={<FlightPlanPage />} />
        <Route path="registration" element={<DroneRegistrationPage />} />
        <Route path="government-revenue" element={<GovernmentRevenuePage />} />
        <Route path="whitelabel" element={<WhiteLabelPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* New feature routes */}
        <Route path="telemetry" element={<LiveTelemetryPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="logbook" element={<PilotLogbookPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="geofences" element={<GeofencePage />} />
        <Route path="insurance" element={<InsurancePage />} />
        <Route path="incidents" element={<IncidentPage />} />
        <Route path="documents" element={<DocumentVaultPage />} />
        <Route path="bvlos" element={<BVLOSPage />} />
        <Route path="clients" element={<ClientPortalPage />} />
        <Route path="utm" element={<UTMPage />} />
        <Route path="payloads" element={<PayloadPage />} />
        <Route path="data-processing" element={<DataProcessingPage />} />
        <Route path="audit-export" element={<AuditExportPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="delivery" element={<DeliveryPage />} />
        <Route path="counter-uas" element={<CounterUASPage />} />
        <Route path="carbon-esg" element={<CarbonESGPage />} />
        <Route path="localization" element={<LocalizationPage />} />
        <Route path="offline" element={<OfflineFieldPage />} />

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
