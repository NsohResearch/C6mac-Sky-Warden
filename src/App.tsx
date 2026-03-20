import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import LandingPage from "@/pages/LandingPage";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Airspace from "@/pages/Airspace";
import Fleet from "@/pages/Fleet";
import Missions from "@/pages/Missions";
import FlightPlans from "@/pages/FlightPlans";
import LaancAuth from "@/pages/LaancAuth";
import RemoteId from "@/pages/RemoteId";
import Analytics from "@/pages/Analytics";
import SettingsPage from "@/pages/SettingsPage";
import WhiteLabelSettings from "@/pages/WhiteLabelSettings";
import PricingPage from "@/pages/PricingPage";
import BillingPage from "@/pages/BillingPage";
import DroneRegistrationPage from "@/pages/DroneRegistrationPage";
import GovernmentRevenuePage from "@/pages/GovernmentRevenuePage";
import SafetyReports from "@/pages/SafetyReports";
import B4UFly from "@/pages/B4UFly";
import LiveTelemetry from "@/pages/LiveTelemetry";
import Weather from "@/pages/Weather";
import PilotLogbook from "@/pages/PilotLogbook";
import InstallApp from "@/pages/InstallApp";
import NotFound from "@/pages/NotFound";

// New feature pages
import NotificationsPage from "@/pages/NotificationsPage";
import MaintenancePage from "@/pages/MaintenancePage";
import GeofencePage from "@/pages/GeofencePage";
import InsurancePage from "@/pages/InsurancePage";
import IncidentPage from "@/pages/IncidentPage";
import DocumentVaultPage from "@/pages/DocumentVaultPage";
import BVLOSPage from "@/pages/BVLOSPage";
import ClientPortalPage from "@/pages/ClientPortalPage";
import UTMPage from "@/pages/UTMPage";
import PayloadPage from "@/pages/PayloadPage";
import DataProcessingPage from "@/pages/DataProcessingPage";
import AuditExportPage from "@/pages/AuditExportPage";
import TrainingPage from "@/pages/TrainingPage";
import MarketplacePage from "@/pages/MarketplacePage";
import DeliveryPage from "@/pages/DeliveryPage";
import CounterUASPage from "@/pages/CounterUASPage";
import CarbonESGPage from "@/pages/CarbonESGPage";
import LocalizationPage from "@/pages/LocalizationPage";
import OfflineFieldPage from "@/pages/OfflineFieldPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/install" element={<InstallApp />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/airspace" element={<Airspace />} />
              <Route path="/live-telemetry" element={<LiveTelemetry />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/flight-plans" element={<FlightPlans />} />
              <Route path="/registration" element={<DroneRegistrationPage />} />
              <Route path="/laanc" element={<LaancAuth />} />
              <Route path="/remote-id" element={<RemoteId />} />
              <Route path="/safety-reports" element={<SafetyReports />} />
              <Route path="/b4ufly" element={<B4UFly />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/pilot-logbook" element={<PilotLogbook />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/government-revenue" element={<GovernmentRevenuePage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/white-label" element={<WhiteLabelSettings />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* New feature routes */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/geofences" element={<GeofencePage />} />
              <Route path="/insurance" element={<InsurancePage />} />
              <Route path="/incidents" element={<IncidentPage />} />
              <Route path="/documents" element={<DocumentVaultPage />} />
              <Route path="/bvlos" element={<BVLOSPage />} />
              <Route path="/client-portal" element={<ClientPortalPage />} />
              <Route path="/utm" element={<UTMPage />} />
              <Route path="/payloads" element={<PayloadPage />} />
              <Route path="/data-processing" element={<DataProcessingPage />} />
              <Route path="/audit-export" element={<AuditExportPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/counter-uas" element={<CounterUASPage />} />
              <Route path="/carbon-esg" element={<CarbonESGPage />} />
              <Route path="/localization" element={<LocalizationPage />} />
              <Route path="/offline-field" element={<OfflineFieldPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
