import { useState } from 'react';
import {
  Store, Search, Filter, Star, Download, CheckCircle, RefreshCw, ChevronDown,
  ChevronUp, ExternalLink, Shield, ShieldCheck, Grid, List, Package, Puzzle,
  BarChart3, Map, FileCheck, MessageSquare, Cloud, Umbrella, GraduationCap,
  FileText, Zap, Settings, Trash2, Eye, Award, TrendingUp, X,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { MarketplaceApp, MarketplaceStats } from '../../../shared/types/marketplace';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockApps: MarketplaceApp[] = [
  {
    id: 'APP-001', name: 'DJI FlightHub Connector', publisher: 'DJI Enterprise', publisherVerified: true,
    category: 'hardware_integration', description: 'Seamlessly connect your DJI FlightHub 2 dashboard with C6mac Sky Warden. Sync fleet data, flight logs, live telemetry, and maintenance records automatically. Supports all DJI Enterprise drones including Matrice 350 RTK, Mavic 3 Enterprise, and M30 series. Real-time battery health monitoring and firmware update tracking included.',
    shortDescription: 'Sync DJI FlightHub 2 fleet data, telemetry, and maintenance records.',
    icon: 'D', screenshots: ['flighthub-dashboard.png', 'flighthub-sync.png', 'flighthub-telemetry.png'],
    version: '3.2.1', lastUpdated: '2026-03-10', rating: 4.8, reviewCount: 342, installs: 12450,
    pricing: { type: 'freemium', price: 29, trialDays: 14 },
    compatibility: ['DJI Matrice 350 RTK', 'DJI Mavic 3 Enterprise', 'DJI M30 Series', 'DJI Inspire 3'],
    features: ['Auto fleet sync', 'Live telemetry bridge', 'Battery health tracking', 'Firmware alerts', 'Flight log import', 'Maintenance sync'],
    permissions: ['Fleet read/write', 'Telemetry access', 'Maintenance records'],
    supportUrl: 'https://enterprise.dji.com/support', documentationUrl: 'https://developer.dji.com/docs',
    status: 'installed', installedVersion: '3.1.0',
  },
  {
    id: 'APP-002', name: 'Pix4D Integration', publisher: 'Pix4D SA', publisherVerified: true,
    category: 'mapping', description: 'Professional photogrammetry and drone mapping integration. Process aerial imagery directly from Sky Warden missions into high-resolution orthomosaics, 3D models, point clouds, and DSMs. Supports Pix4Dmapper, Pix4Dmatic, and Pix4Dcloud workflows with automatic data upload after mission completion.',
    shortDescription: 'Professional photogrammetry — orthomosaics, 3D models, and point clouds.',
    icon: 'P', screenshots: ['pix4d-ortho.png', 'pix4d-3d.png'], version: '2.5.0', lastUpdated: '2026-03-05',
    rating: 4.7, reviewCount: 289, installs: 9820,
    pricing: { type: 'subscription', price: 49, trialDays: 30 },
    compatibility: ['All camera-equipped drones', 'RTK/PPK workflows'],
    features: ['Auto upload on mission complete', 'Orthomosaic generation', '3D model creation', 'Point cloud processing', 'Volume measurement', 'Progress tracking'],
    permissions: ['Mission data', 'Image access', 'Map layer write'],
    supportUrl: 'https://support.pix4d.com', documentationUrl: 'https://developer.pix4d.com',
    status: 'installed', installedVersion: '2.5.0',
  },
  {
    id: 'APP-003', name: 'DroneDeploy Sync', publisher: 'DroneDeploy Inc.', publisherVerified: true,
    category: 'data_analytics', description: 'Connect DroneDeploy site scanning and progress tracking with Sky Warden. Automated site reconstruction, AI-powered analytics, construction progress reports, and stockpile volumetrics. Perfect for construction, mining, and infrastructure inspection workflows.',
    shortDescription: 'Site scanning, AI analytics, and construction progress tracking.',
    icon: 'D', screenshots: ['dd-site.png', 'dd-analytics.png', 'dd-progress.png'],
    version: '4.1.2', lastUpdated: '2026-02-28', rating: 4.6, reviewCount: 215, installs: 8340,
    pricing: { type: 'subscription', price: 39 },
    compatibility: ['DJI Enterprise Series', 'Skydio X10', 'Autel EVO II'],
    features: ['Automated site capture', 'AI defect detection', 'Progress timeline', 'Stockpile measurement', 'Thermal overlay', 'Report generation'],
    permissions: ['Mission data', 'Image access', 'Analytics write'],
    supportUrl: 'https://dronedeploy.com/support', documentationUrl: 'https://developer.dronedeploy.com',
    status: 'update_available', installedVersion: '4.0.8',
  },
  {
    id: 'APP-004', name: 'Skydio Autonomy', publisher: 'Skydio Inc.', publisherVerified: true,
    category: 'hardware_integration', description: 'Full integration with Skydio autonomous drones. Leverage Skydio 3D Scan, Skydio Dock, and autonomous inspection capabilities directly within Sky Warden. AI-powered obstacle avoidance and autonomous mission execution for infrastructure inspection and security patrols.',
    shortDescription: 'Autonomous inspection and 3D scanning with Skydio drones.',
    icon: 'S', screenshots: ['skydio-scan.png', 'skydio-dock.png'],
    version: '2.0.4', lastUpdated: '2026-03-12', rating: 4.5, reviewCount: 178, installs: 5620,
    pricing: { type: 'paid', price: 79 },
    compatibility: ['Skydio X10', 'Skydio X2', 'Skydio Dock'],
    features: ['3D Scan integration', 'Dock scheduling', 'Autonomous patrol', 'AI obstacle avoidance', 'Thermal inspection', 'Edge processing'],
    permissions: ['Fleet read/write', 'Mission control', 'Telemetry access'],
    supportUrl: 'https://skydio.com/support', documentationUrl: 'https://apidocs.skydio.com',
    status: 'available',
  },
  {
    id: 'APP-005', name: 'Weather Pro', publisher: 'AeroWeather Labs', publisherVerified: true,
    category: 'weather', description: 'Advanced aviation weather service with hyperlocal forecasts for drone operations. Micro-weather station integration, wind shear detection, precipitation radar overlay, and automated NOTAM correlation. Includes go/no-go decision support and automatic weather holds.',
    shortDescription: 'Hyperlocal aviation weather, wind shear alerts, and go/no-go decisions.',
    icon: 'W', screenshots: ['weather-forecast.png', 'weather-radar.png'],
    version: '5.3.0', lastUpdated: '2026-03-15', rating: 4.9, reviewCount: 456, installs: 18900,
    pricing: { type: 'freemium', price: 19, trialDays: 7 },
    compatibility: ['All platforms'],
    features: ['Hyperlocal forecast', 'Wind shear detection', 'Precipitation radar', 'NOTAM correlation', 'Auto weather hold', 'Historical analysis'],
    permissions: ['Location access', 'Mission scheduling', 'Notification push'],
    supportUrl: 'https://aeroweather.com/support', documentationUrl: 'https://api.aeroweather.com/docs',
    status: 'installed', installedVersion: '5.3.0',
  },
  {
    id: 'APP-006', name: 'InsureMyDrone', publisher: 'SkyWatch Insurance', publisherVerified: true,
    category: 'insurance', description: 'Instant drone insurance quotes and on-demand coverage directly within Sky Warden. Per-flight and annual policies with automatic COI generation. Integrates with mission planning for pre-flight insurance verification. Supports hull, liability, and payload coverage.',
    shortDescription: 'Instant drone insurance, on-demand coverage, and auto COI generation.',
    icon: 'I', screenshots: ['insure-quote.png', 'insure-coi.png'],
    version: '1.8.2', lastUpdated: '2026-02-20', rating: 4.3, reviewCount: 134, installs: 6780,
    pricing: { type: 'free' },
    compatibility: ['All platforms'],
    features: ['Instant quotes', 'On-demand coverage', 'Auto COI', 'Pre-flight verification', 'Claims filing', 'Coverage tracking'],
    permissions: ['Fleet data', 'Mission data', 'Billing access'],
    supportUrl: 'https://skywatch.ai/support', documentationUrl: 'https://skywatch.ai/api',
    status: 'available',
  },
  {
    id: 'APP-007', name: 'ComplianceBot', publisher: 'RegTech Aviation', publisherVerified: true,
    category: 'compliance', description: 'Automated FAA compliance monitoring and reporting. Tracks Part 107 certification expiry, Remote ID compliance, LAANC authorization status, and airspace violations. Generates audit-ready compliance reports and sends proactive alerts before certifications expire.',
    shortDescription: 'Automated FAA compliance monitoring, alerts, and audit-ready reports.',
    icon: 'C', screenshots: ['compliance-dash.png', 'compliance-report.png'],
    version: '3.0.1', lastUpdated: '2026-03-08', rating: 4.7, reviewCount: 267, installs: 11200,
    pricing: { type: 'subscription', price: 34 },
    compatibility: ['All platforms'],
    features: ['Part 107 tracking', 'Remote ID monitoring', 'LAANC status sync', 'Expiry alerts', 'Violation detection', 'Audit reports'],
    permissions: ['Compliance data', 'Pilot records', 'Notification push'],
    supportUrl: 'https://regtechaviation.com/support', documentationUrl: 'https://api.regtechaviation.com',
    status: 'update_available', installedVersion: '2.9.5',
  },
  {
    id: 'APP-008', name: 'TelemetryPro', publisher: 'FlightMetrics', publisherVerified: false,
    category: 'data_analytics', description: 'Advanced telemetry analysis and visualization. Real-time flight data dashboards with anomaly detection, motor performance analysis, battery degradation curves, and predictive maintenance scoring. Export data to CSV, JSON, or direct BI tool integration.',
    shortDescription: 'Advanced telemetry dashboards, anomaly detection, and predictive analytics.',
    icon: 'T', screenshots: ['telemetry-dash.png', 'telemetry-motor.png'],
    version: '2.2.0', lastUpdated: '2026-02-15', rating: 4.4, reviewCount: 156, installs: 7230,
    pricing: { type: 'paid', price: 59 },
    compatibility: ['DJI Enterprise', 'Skydio', 'Autel', 'Custom MAVLink'],
    features: ['Real-time dashboards', 'Anomaly detection', 'Motor analysis', 'Battery curves', 'Predictive maintenance', 'Data export'],
    permissions: ['Telemetry access', 'Fleet data', 'Analytics write'],
    supportUrl: 'https://flightmetrics.io/support', documentationUrl: 'https://docs.flightmetrics.io',
    status: 'available',
  },
  {
    id: 'APP-009', name: 'Mapbox Advanced', publisher: 'Mapbox Inc.', publisherVerified: true,
    category: 'mapping', description: 'Enhanced Mapbox integration with custom map styles, satellite imagery overlays, terrain elevation data, and offline map caching. Includes 3D building rendering, custom tileset support, and high-resolution satellite basemaps for mission planning.',
    shortDescription: 'Custom map styles, satellite imagery, terrain data, and offline caching.',
    icon: 'M', screenshots: ['mapbox-3d.png', 'mapbox-satellite.png'],
    version: '1.4.0', lastUpdated: '2026-03-01', rating: 4.6, reviewCount: 198, installs: 14500,
    pricing: { type: 'freemium', price: 24, trialDays: 14 },
    compatibility: ['All platforms'],
    features: ['Custom map styles', 'Satellite imagery', '3D terrain', 'Offline caching', 'Custom tilesets', 'Elevation data'],
    permissions: ['Map layer write', 'Location access'],
    supportUrl: 'https://mapbox.com/support', documentationUrl: 'https://docs.mapbox.com',
    status: 'installed', installedVersion: '1.4.0',
  },
  {
    id: 'APP-010', name: 'SensorFusion', publisher: 'MultiSpec Labs', publisherVerified: false,
    category: 'data_analytics', description: 'Multi-sensor data fusion platform for combining RGB, thermal, multispectral, and LiDAR data. NDVI analysis for agriculture, thermal anomaly detection for infrastructure, and combined point cloud generation. Supports real-time processing during flight.',
    shortDescription: 'Multi-sensor fusion — RGB, thermal, multispectral, and LiDAR combined.',
    icon: 'S', screenshots: ['sensor-ndvi.png', 'sensor-thermal.png'],
    version: '1.1.3', lastUpdated: '2026-01-25', rating: 4.2, reviewCount: 89, installs: 3450,
    pricing: { type: 'paid', price: 99 },
    compatibility: ['DJI M350 RTK + L2', 'DJI Mavic 3M', 'Custom payloads'],
    features: ['RGB + Thermal fusion', 'NDVI analysis', 'LiDAR integration', 'Anomaly detection', 'Point cloud merge', 'Real-time processing'],
    permissions: ['Sensor data', 'Image access', 'Analytics write'],
    supportUrl: 'https://multispeclabs.com/support', documentationUrl: 'https://docs.multispeclabs.com',
    status: 'available',
  },
  {
    id: 'APP-011', name: 'FleetOptimizer', publisher: 'DroneOps AI', publisherVerified: true,
    category: 'automation', description: 'AI-powered fleet optimization engine. Automatically assigns drones to missions based on battery levels, proximity, payload capability, and pilot availability. Reduces fleet downtime by 40% with predictive scheduling and smart charging rotation.',
    shortDescription: 'AI fleet optimization — smart assignment, scheduling, and charging rotation.',
    icon: 'F', screenshots: ['fleet-optimize.png', 'fleet-schedule.png'],
    version: '2.7.0', lastUpdated: '2026-03-14', rating: 4.8, reviewCount: 312, installs: 9100,
    pricing: { type: 'subscription', price: 69, trialDays: 21 },
    compatibility: ['All platforms', 'Dock-enabled drones'],
    features: ['Smart assignment', 'Predictive scheduling', 'Charging rotation', 'Pilot matching', 'Route optimization', 'Downtime reduction'],
    permissions: ['Fleet read/write', 'Mission control', 'Pilot schedules'],
    supportUrl: 'https://droneopsai.com/support', documentationUrl: 'https://api.droneopsai.com',
    status: 'available',
  },
  {
    id: 'APP-012', name: 'ReportGenerator', publisher: 'AeroReports', publisherVerified: true,
    category: 'reporting', description: 'Automated report generation for drone operations. Create professional client-facing reports with flight data, imagery, analytics, and compliance information. Templates for inspection, survey, mapping, and security patrol reports. PDF and interactive web report outputs.',
    shortDescription: 'Automated professional reports — inspection, survey, mapping templates.',
    icon: 'R', screenshots: ['report-template.png', 'report-output.png'],
    version: '3.1.0', lastUpdated: '2026-02-25', rating: 4.5, reviewCount: 201, installs: 8650,
    pricing: { type: 'freemium', price: 29, trialDays: 14 },
    compatibility: ['All platforms'],
    features: ['Template library', 'Auto data pull', 'Imagery insertion', 'Compliance sections', 'PDF export', 'Web reports'],
    permissions: ['Mission data', 'Image access', 'Analytics read', 'Client data'],
    supportUrl: 'https://aeroreports.com/support', documentationUrl: 'https://docs.aeroreports.com',
    status: 'available',
  },
  {
    id: 'APP-013', name: 'Training Academy', publisher: 'PilotIQ', publisherVerified: true,
    category: 'training', description: 'Comprehensive drone pilot training and certification management. Part 107 test prep, recurrent training modules, skill assessments, and certification tracking. Includes VR flight simulator integration and custom training program builder for enterprise teams.',
    shortDescription: 'Pilot training, Part 107 prep, skill assessments, and cert tracking.',
    icon: 'T', screenshots: ['training-modules.png', 'training-cert.png'],
    version: '2.3.1', lastUpdated: '2026-03-02', rating: 4.6, reviewCount: 178, installs: 7800,
    pricing: { type: 'subscription', price: 19 },
    compatibility: ['All platforms'],
    features: ['Part 107 prep', 'Recurrent training', 'Skill assessment', 'Cert tracking', 'VR simulator', 'Custom programs'],
    permissions: ['Pilot records', 'Training data', 'Certification access'],
    supportUrl: 'https://pilotiq.com/support', documentationUrl: 'https://docs.pilotiq.com',
    status: 'available',
  },
  {
    id: 'APP-014', name: 'MaintenanceAI', publisher: 'DroneHealth Systems', publisherVerified: true,
    category: 'automation', description: 'AI-driven predictive maintenance for drone fleets. Analyzes flight telemetry patterns to predict component failures before they occur. Automated maintenance scheduling, parts inventory management, and service provider matching. Reduces unscheduled downtime by 60%.',
    shortDescription: 'AI predictive maintenance — failure prediction and auto scheduling.',
    icon: 'M', screenshots: ['maint-predict.png', 'maint-schedule.png'],
    version: '1.6.0', lastUpdated: '2026-03-11', rating: 4.7, reviewCount: 234, installs: 6200,
    pricing: { type: 'subscription', price: 44 },
    compatibility: ['DJI Enterprise', 'Skydio', 'Autel', 'Custom platforms'],
    features: ['Failure prediction', 'Auto scheduling', 'Parts inventory', 'Service matching', 'Health scoring', 'Trend analysis'],
    permissions: ['Fleet read/write', 'Telemetry access', 'Maintenance records'],
    supportUrl: 'https://dronehealthsys.com/support', documentationUrl: 'https://api.dronehealthsys.com',
    status: 'available',
  },
  {
    id: 'APP-015', name: 'DeliveryTracker', publisher: 'AeroLogistics', publisherVerified: true,
    category: 'automation', description: 'End-to-end drone delivery management with real-time package tracking, recipient notifications, proof of delivery capture, and delivery zone management. Route optimization for multi-stop deliveries with weight and battery constraints. API for e-commerce integration.',
    shortDescription: 'Drone delivery management — tracking, notifications, and route optimization.',
    icon: 'D', screenshots: ['delivery-track.png', 'delivery-route.png'],
    version: '2.1.0', lastUpdated: '2026-03-13', rating: 4.4, reviewCount: 145, installs: 4300,
    pricing: { type: 'subscription', price: 54 },
    compatibility: ['Delivery-capable drones', 'Wingcopter', 'Zipline', 'Custom platforms'],
    features: ['Real-time tracking', 'Recipient notification', 'Proof of delivery', 'Zone management', 'Route optimization', 'E-commerce API'],
    permissions: ['Fleet read/write', 'Mission control', 'Notification push', 'Location access'],
    supportUrl: 'https://aerologistics.io/support', documentationUrl: 'https://api.aerologistics.io',
    status: 'installed', installedVersion: '2.0.5',
  },
  {
    id: 'APP-016', name: 'AirspaceIntel', publisher: 'SkyVector Analytics', publisherVerified: true,
    category: 'compliance', description: 'Real-time airspace intelligence with TFR monitoring, drone traffic density heat maps, conflict prediction, and automated airspace advisory notifications. Integrates with FAA LAANC and UAS Facility Map data. Advanced corridor planning for BVLOS operations.',
    shortDescription: 'Airspace intelligence — TFR monitoring, traffic density, and conflict alerts.',
    icon: 'A', screenshots: ['airspace-heatmap.png', 'airspace-tfr.png'],
    version: '3.4.2', lastUpdated: '2026-03-16', rating: 4.8, reviewCount: 387, installs: 15600,
    pricing: { type: 'freemium', price: 39, trialDays: 14 },
    compatibility: ['All platforms'],
    features: ['TFR monitoring', 'Traffic density maps', 'Conflict prediction', 'Advisory alerts', 'LAANC integration', 'BVLOS corridors'],
    permissions: ['Airspace data', 'Location access', 'Notification push', 'Mission data'],
    supportUrl: 'https://skyvector.com/support', documentationUrl: 'https://api.skyvector.com',
    status: 'available',
  },
];

const mockStats: MarketplaceStats = {
  totalApps: 16,
  installedApps: 5,
  updatesAvailable: 2,
  categoryCounts: {
    hardware_integration: 2, data_analytics: 3, mapping: 2, compliance: 2,
    weather: 1, insurance: 1, training: 1, reporting: 1, automation: 3, communication: 0,
  },
};

const categoryLabels: Record<string, string> = {
  hardware_integration: 'Hardware', data_analytics: 'Analytics', mapping: 'Mapping',
  compliance: 'Compliance', communication: 'Communication', weather: 'Weather',
  insurance: 'Insurance', training: 'Training', reporting: 'Reporting', automation: 'Automation',
};

const categoryIcons: Record<string, React.ReactNode> = {
  hardware_integration: <Puzzle className="w-4 h-4" />, data_analytics: <BarChart3 className="w-4 h-4" />,
  mapping: <Map className="w-4 h-4" />, compliance: <FileCheck className="w-4 h-4" />,
  communication: <MessageSquare className="w-4 h-4" />, weather: <Cloud className="w-4 h-4" />,
  insurance: <Umbrella className="w-4 h-4" />, training: <GraduationCap className="w-4 h-4" />,
  reporting: <FileText className="w-4 h-4" />, automation: <Zap className="w-4 h-4" />,
};

const iconColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500',
];

// ─── Component ──────────────────────────────────────────────────────────────────

export function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price'>('popular');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'my_apps'>('browse');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const featuredApps = mockApps.filter(a => ['APP-005', 'APP-011', 'APP-016'].includes(a.id));

  const filteredApps = mockApps.filter(app => {
    if (search && !app.name.toLowerCase().includes(search.toLowerCase()) && !app.shortDescription.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory !== 'all' && app.category !== selectedCategory) return false;
    if (pricingFilter === 'free' && app.pricing.type !== 'free') return false;
    if (pricingFilter === 'paid' && app.pricing.type === 'free') return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.installs - a.installs;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    if (sortBy === 'price') return (a.pricing.price ?? 0) - (b.pricing.price ?? 0);
    return 0;
  });

  const installedApps = mockApps.filter(a => a.status === 'installed' || a.status === 'update_available');

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} className={clsx('w-3.5 h-3.5', i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600')} />
      );
    }
    return stars;
  };

  const getPricingBadge = (pricing: MarketplaceApp['pricing']) => {
    if (pricing.type === 'free') return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded">Free</span>;
    if (pricing.type === 'freemium') return <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">Freemium</span>;
    if (pricing.type === 'paid') return <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">${pricing.price}/mo</span>;
    if (pricing.type === 'subscription') return <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded">${pricing.price}/mo</span>;
    return null;
  };

  const getStatusButton = (app: MarketplaceApp) => {
    if (app.status === 'installed') return (
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg cursor-default">
        <CheckCircle className="w-3.5 h-3.5" /> Installed
      </button>
    );
    if (app.status === 'update_available') return (
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
        <RefreshCw className="w-3.5 h-3.5" /> Update
      </button>
    );
    return (
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
        <Download className="w-3.5 h-3.5" /> Install
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">App Marketplace</h1>
              <p className="text-sm text-zinc-400">Extend Sky Warden with integrations, tools, and services</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('browse')} className={clsx('px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === 'browse' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}>Browse</button>
            <button onClick={() => setActiveTab('my_apps')} className={clsx('px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === 'my_apps' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}>
              My Apps
              {mockStats.updatesAvailable > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-amber-500 text-black rounded-full">{mockStats.updatesAvailable}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1"><Package className="w-3.5 h-3.5" /> Total Apps</div>
            <div className="text-2xl font-bold">{mockStats.totalApps}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1"><CheckCircle className="w-3.5 h-3.5" /> Installed</div>
            <div className="text-2xl font-bold text-emerald-400">{mockStats.installedApps}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1"><RefreshCw className="w-3.5 h-3.5" /> Updates Available</div>
            <div className="text-2xl font-bold text-amber-400">{mockStats.updatesAvailable}</div>
          </div>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Featured Apps */}
          <div className="px-6 py-6 border-b border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /> Featured Apps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredApps.map((app, idx) => (
                <div key={app.id} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-5 hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg', iconColors[idx % iconColors.length])}>
                      {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold truncate">{app.name}</h3>
                        {app.publisherVerified && <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-zinc-400">{app.publisher}</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 mb-3">{app.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {renderStars(app.rating)}
                      <span className="text-xs text-zinc-400 ml-1">({app.reviewCount})</span>
                    </div>
                    {getPricingBadge(app.pricing)}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
                    <span className="text-xs text-zinc-400"><Download className="w-3 h-3 inline mr-1" />{app.installs.toLocaleString()} installs</span>
                    {getStatusButton(app)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters + Search */}
          <div className="px-6 py-4 border-b border-zinc-800">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="text" placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-zinc-400" /></button>}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={() => setSelectedCategory('all')} className={clsx('px-3 py-1.5 text-xs font-medium rounded-full transition-colors', selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white')}>All</button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <button key={key} onClick={() => setSelectedCategory(key)} className={clsx('px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1', selectedCategory === key ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white')}>
                    {categoryIcons[key]} {label}
                  </button>
                ))}
              </div>

              {/* Sort + Pricing + View */}
              <div className="flex items-center gap-2 ml-auto">
                <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none">
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price">Lowest Price</option>
                </select>
                <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                  {(['all', 'free', 'paid'] as const).map(f => (
                    <button key={f} onClick={() => setPricingFilter(f)} className={clsx('px-3 py-2 text-xs font-medium transition-colors', pricingFilter === f ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white')}>
                      {f === 'all' ? 'All' : f === 'free' ? 'Free' : 'Paid'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-zinc-400')}><Grid className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setViewMode('list')} className={clsx('p-2 transition-colors', viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-zinc-400')}><List className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* App Grid */}
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Apps</h2>
              <span className="text-sm text-zinc-400">{filteredApps.length} apps</span>
            </div>
            <div className={clsx(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-3')}>
              {filteredApps.map((app, idx) => (
                <div key={app.id}>
                  <div className={clsx('bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-all cursor-pointer', viewMode === 'list' ? 'p-4' : 'p-4')} onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-start gap-3 mb-3">
                          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm', iconColors[idx % iconColors.length])}>
                            {app.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="text-sm font-semibold truncate">{app.name}</h3>
                              {app.publisherVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                            </div>
                            <p className="text-[11px] text-zinc-500">{app.publisher}</p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{app.shortDescription}</p>
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(app.rating)}
                          <span className="text-[11px] text-zinc-500 ml-1">({app.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPricingBadge(app.pricing)}
                            <span className="text-[11px] text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">{categoryLabels[app.category]}</span>
                          </div>
                          <span className="text-[11px] text-zinc-500"><Download className="w-3 h-3 inline" /> {app.installs >= 1000 ? `${(app.installs / 1000).toFixed(1)}k` : app.installs}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-end">
                          {getStatusButton(app)}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0', iconColors[idx % iconColors.length])}>
                          {app.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold">{app.name}</h3>
                            {app.publisherVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
                            <span className="text-[11px] text-zinc-500">by {app.publisher}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{app.shortDescription}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1">{renderStars(app.rating)}<span className="text-[11px] text-zinc-500 ml-1">({app.reviewCount})</span></div>
                          {getPricingBadge(app.pricing)}
                          <span className="text-[11px] text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">{categoryLabels[app.category]}</span>
                          {getStatusButton(app)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {expandedApp === app.id && (
                    <div className="bg-zinc-900 border border-zinc-700 border-t-0 rounded-b-xl p-5 -mt-1">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Description</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed mb-4">{app.description}</p>

                          <h4 className="text-sm font-semibold mb-2">Screenshots</h4>
                          <div className="flex gap-2 mb-4">
                            {app.screenshots.map((s, i) => (
                              <div key={i} className="w-32 h-20 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-[10px] text-zinc-500">{s}</div>
                            ))}
                          </div>

                          <h4 className="text-sm font-semibold mb-2">Features</h4>
                          <ul className="grid grid-cols-2 gap-1 mb-4">
                            {app.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-400"><CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />{f}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Permissions Required</h4>
                          <ul className="mb-4">
                            {app.permissions.map((p, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-400 py-0.5"><Shield className="w-3 h-3 text-amber-400 flex-shrink-0" />{p}</li>
                            ))}
                          </ul>

                          <h4 className="text-sm font-semibold mb-2">Compatibility</h4>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {app.compatibility.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 text-[11px] bg-zinc-800 text-zinc-400 rounded">{c}</span>
                            ))}
                          </div>

                          <h4 className="text-sm font-semibold mb-2">Details</h4>
                          <div className="space-y-1 text-xs text-zinc-400 mb-4">
                            <div>Version: <span className="text-zinc-300">{app.version}</span></div>
                            <div>Last Updated: <span className="text-zinc-300">{app.lastUpdated}</span></div>
                            <div>Installs: <span className="text-zinc-300">{app.installs.toLocaleString()}</span></div>
                            {app.pricing.trialDays && <div>Free Trial: <span className="text-zinc-300">{app.pricing.trialDays} days</span></div>}
                          </div>

                          <div className="flex items-center gap-2">
                            <a href={app.supportUrl} className="flex items-center gap-1 text-xs text-blue-400 hover:underline"><ExternalLink className="w-3 h-3" /> Support</a>
                            <a href={app.documentationUrl} className="flex items-center gap-1 text-xs text-blue-400 hover:underline"><ExternalLink className="w-3 h-3" /> Documentation</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {filteredApps.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No apps match your filters</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* My Apps Tab */
        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold mb-4">Installed Apps ({installedApps.length})</h2>
          <div className="flex flex-col gap-3">
            {installedApps.map((app, idx) => (
              <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg', iconColors[idx % iconColors.length])}>
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold">{app.name}</h3>
                      {app.publisherVerified && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{app.publisher}</p>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-zinc-400">
                    <div>
                      <div className="text-zinc-500">Installed Version</div>
                      <div className="text-zinc-200 font-medium">{app.installedVersion}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Latest Version</div>
                      <div className={clsx('font-medium', app.status === 'update_available' ? 'text-amber-400' : 'text-zinc-200')}>{app.version}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Last Updated</div>
                      <div className="text-zinc-200 font-medium">{app.lastUpdated}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {app.status === 'update_available' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> Update to {app.version}
                      </button>
                    )}
                    <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>
                    <button className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
