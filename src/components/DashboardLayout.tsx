import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import NotificationCenter from "@/components/NotificationCenter";
import {
  LayoutDashboard, Map, Plane, Navigation, Shield, BarChart3, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, User, Radio, CreditCard,
  FileText, Landmark, Paintbrush, Route, ShieldAlert, Radar, Satellite,
  Cloud, BookOpen,
  // New feature icons
  BellRing, Wrench, MapPin, Umbrella, AlertTriangle, FolderOpen, Eye,
  Briefcase, Signal, Package, Cpu, ClipboardList, GraduationCap, Store,
  Truck, ShieldOff, Leaf, Globe, WifiOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import logoMark from "@/assets/logo-mark.png";

interface NavSection {
  title: string;
  items: { label: string; icon: any; path: string }[];
}

const navSections: NavSection[] = [
  {
    title: "Operations",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Airspace", icon: Map, path: "/airspace" },
      { label: "Live Telemetry", icon: Satellite, path: "/live-telemetry" },
      { label: "Fleet", icon: Plane, path: "/fleet" },
      { label: "Missions", icon: Navigation, path: "/missions" },
      { label: "Flight Plans", icon: Route, path: "/flight-plans" },
      { label: "Weather", icon: Cloud, path: "/weather" },
      { label: "Pilot Logbook", icon: BookOpen, path: "/pilot-logbook" },
    ],
  },
  {
    title: "Compliance & Safety",
    items: [
      { label: "Registration", icon: FileText, path: "/registration" },
      { label: "LAANC", icon: Shield, path: "/laanc" },
      { label: "Remote ID", icon: Radio, path: "/remote-id" },
      { label: "Safety (ASRP)", icon: ShieldAlert, path: "/safety-reports" },
      { label: "B4UFLY", icon: Radar, path: "/b4ufly" },
      { label: "Geofences", icon: MapPin, path: "/geofences" },
      { label: "Incidents", icon: AlertTriangle, path: "/incidents" },
      { label: "BVLOS Ops", icon: Eye, path: "/bvlos" },
      { label: "Counter-UAS", icon: ShieldOff, path: "/counter-uas" },
    ],
  },
  {
    title: "Fleet & Maintenance",
    items: [
      { label: "Maintenance", icon: Wrench, path: "/maintenance" },
      { label: "Insurance", icon: Umbrella, path: "/insurance" },
      { label: "Payloads", icon: Package, path: "/payloads" },
      { label: "Documents", icon: FolderOpen, path: "/documents" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { label: "UTM Network", icon: Signal, path: "/utm" },
      { label: "Data Processing", icon: Cpu, path: "/data-processing" },
      { label: "Drone Delivery", icon: Truck, path: "/delivery" },
      { label: "Client Portal", icon: Briefcase, path: "/client-portal" },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Billing", icon: CreditCard, path: "/billing" },
      { label: "Gov Revenue", icon: Landmark, path: "/government-revenue" },
      { label: "Analytics", icon: BarChart3, path: "/analytics" },
      { label: "Audit & Export", icon: ClipboardList, path: "/audit-export" },
      { label: "Carbon & ESG", icon: Leaf, path: "/carbon-esg" },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Notifications", icon: BellRing, path: "/notifications" },
      { label: "Training LMS", icon: GraduationCap, path: "/training" },
      { label: "Marketplace", icon: Store, path: "/marketplace" },
      { label: "Localization", icon: Globe, path: "/localization" },
      { label: "Offline Mode", icon: WifiOff, path: "/offline-field" },
      { label: "White-Label", icon: Paintbrush, path: "/white-label" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
          <img src={logoMark} alt="SkyWarden" className="w-8 h-8 shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-sidebar-accent-foreground tracking-tight text-[15px] animate-fade-in">
              SkyWarden
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150
                      ${isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.75} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors active:scale-[0.97]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search flights, drones, airspace…"
                className="h-9 w-72 rounded-md bg-muted pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="w-px h-6 bg-border mx-1" />
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md hover:bg-muted transition-colors active:scale-[0.96]"
              title="Sign out"
            >
              <LogOut className="w-[18px] h-[18px] text-muted-foreground" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{profile?.display_name ?? "Pilot"}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
