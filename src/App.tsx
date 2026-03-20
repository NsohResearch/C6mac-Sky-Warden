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
import InstallApp from "@/pages/InstallApp";
import NotFound from "@/pages/NotFound";

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
              <Route path="/laanc" element={<LaancAuth />} />
              <Route path="/remote-id" element={<RemoteId />} />
              <Route path="/safety-reports" element={<SafetyReports />} />
              <Route path="/b4ufly" element={<B4UFly />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/registration" element={<DroneRegistrationPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/government-revenue" element={<GovernmentRevenuePage />} />
              <Route path="/white-label" element={<WhiteLabelSettings />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
