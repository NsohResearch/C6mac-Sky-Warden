import { useState } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, Radar, Radio, Eye, Ear, Camera, Wifi, WifiOff,
  AlertTriangle, AlertCircle, Activity, BarChart2, Target, Crosshair, Search,
  ChevronDown, ChevronUp, Clock, MapPin, Navigation, Signal, Zap, Settings,
  RefreshCw, Wrench, Play, Square, TrendingUp, TrendingDown, Filter, Gauge,
  CircleDot, ArrowUpRight, RotateCcw, Flag, MonitorSpeaker,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { DroneDetection, DetectionSensor, CounterUASStats } from '../../../shared/types/counteruas';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'detections' | 'sensors' | 'analytics';
type Classification = DroneDetection['classification'];
type ThreatLevel = DroneDetection['threat'];
type SensorStatus = DetectionSensor['status'];

// ─── Classification / Threat configs ──────────────────────────────────────────
const classificationConfig: Record<Classification, { label: string; bg: string; text: string; dot: string }> = {
  authorized: { label: 'Authorized', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  friendly: { label: 'Friendly', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  unknown: { label: 'Unknown', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  unauthorized: { label: 'Unauthorized', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  suspicious: { label: 'Suspicious', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  threat: { label: 'Threat', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const threatConfig: Record<ThreatLevel, { label: string; bg: string; text: string; pulse?: boolean }> = {
  none: { label: 'None', bg: 'bg-gray-50', text: 'text-gray-600' },
  low: { label: 'Low', bg: 'bg-blue-50', text: 'text-blue-700' },
  medium: { label: 'Medium', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700' },
  critical: { label: 'Critical', bg: 'bg-red-100', text: 'text-red-800', pulse: true },
};

const methodConfig: Record<string, { label: string; icon: typeof Radar }> = {
  rf_scan: { label: 'RF Scan', icon: Radio },
  radar: { label: 'Radar', icon: Radar },
  acoustic: { label: 'Acoustic', icon: Ear },
  visual: { label: 'Visual', icon: Eye },
  adsb: { label: 'ADS-B', icon: Wifi },
  remote_id: { label: 'Remote ID', icon: Signal },
  multi_sensor: { label: 'Multi-Sensor', icon: Target },
};

const statusConfig: Record<DroneDetection['status'], { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-red-50', text: 'text-red-700' },
  tracking: { label: 'Tracking', bg: 'bg-blue-50', text: 'text-blue-700' },
  departed: { label: 'Departed', bg: 'bg-gray-100', text: 'text-gray-600' },
  neutralized: { label: 'Neutralized', bg: 'bg-green-50', text: 'text-green-700' },
  lost: { label: 'Lost', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  false_alarm: { label: 'False Alarm', bg: 'bg-gray-50', text: 'text-gray-500' },
};

const sensorStatusConfig: Record<SensorStatus, { label: string; dot: string }> = {
  online: { label: 'Online', dot: 'bg-green-500' },
  offline: { label: 'Offline', dot: 'bg-red-500' },
  degraded: { label: 'Degraded', dot: 'bg-yellow-500' },
  maintenance: { label: 'Maintenance', dot: 'bg-blue-500' },
};

const sensorTypeConfig: Record<DetectionSensor['type'], { label: string; icon: typeof Radar }> = {
  rf_scanner: { label: 'RF Scanner', icon: Radio },
  radar: { label: 'Radar', icon: Radar },
  acoustic: { label: 'Acoustic', icon: Ear },
  camera: { label: 'Camera', icon: Camera },
  adsb_receiver: { label: 'ADS-B Receiver', icon: Wifi },
  remote_id_receiver: { label: 'Remote ID Receiver', icon: Signal },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockDetections: DroneDetection[] = [
  {
    id: 'DET-001', timestamp: '2026-03-20T14:32:00Z', detectionMethod: 'rf_scan',
    position: { lat: 34.0522, lng: -118.2437, altitude: 120, accuracy: 5 },
    track: [
      { lat: 34.0520, lng: -118.2440, altitude: 115, timestamp: '2026-03-20T14:30:00Z' },
      { lat: 34.0521, lng: -118.2438, altitude: 118, timestamp: '2026-03-20T14:31:00Z' },
      { lat: 34.0522, lng: -118.2437, altitude: 120, timestamp: '2026-03-20T14:32:00Z' },
    ],
    classification: 'unauthorized', threat: 'high',
    droneInfo: { manufacturer: 'DJI', model: 'Mavic 3', remoteIdMatch: false, registrationMatch: false },
    operatorInfo: { identified: false },
    status: 'active', speed: 12.5, heading: 270, signalStrength: -42, frequency: 2437,
    zone: 'Perimeter Zone Alpha',
    response: { action: 'investigate', takenBy: 'Operator J. Williams', timestamp: '2026-03-20T14:33:00Z', notes: 'Dispatching security team to sector 4' },
    alerts: [
      { type: 'unauthorized_entry', message: 'Unauthorized drone entered restricted zone', timestamp: '2026-03-20T14:32:00Z' },
      { type: 'no_remote_id', message: 'No Remote ID broadcast detected', timestamp: '2026-03-20T14:32:05Z' },
    ],
  },
  {
    id: 'DET-002', timestamp: '2026-03-20T14:28:00Z', detectionMethod: 'radar',
    position: { lat: 34.0535, lng: -118.2410, altitude: 85, accuracy: 10 },
    track: [
      { lat: 34.0538, lng: -118.2415, altitude: 80, timestamp: '2026-03-20T14:25:00Z' },
      { lat: 34.0537, lng: -118.2412, altitude: 82, timestamp: '2026-03-20T14:27:00Z' },
    ],
    classification: 'authorized', threat: 'none',
    droneInfo: { manufacturer: 'Skydio', model: 'X10', serialNumber: 'SKD-X10-44821', remoteIdMatch: true, registrationMatch: true },
    operatorInfo: { identified: true, name: 'Mike Chen', location: { lat: 34.0540, lng: -118.2420 } },
    status: 'tracking', speed: 8.2, heading: 180, signalStrength: -38, frequency: 5785,
    zone: 'Operations Zone Bravo',
    response: { action: 'monitor' },
    alerts: [],
  },
  {
    id: 'DET-003', timestamp: '2026-03-20T14:25:00Z', detectionMethod: 'acoustic',
    position: { lat: 34.0510, lng: -118.2455, altitude: 200, accuracy: 25 },
    track: [
      { lat: 34.0508, lng: -118.2460, altitude: 195, timestamp: '2026-03-20T14:22:00Z' },
      { lat: 34.0510, lng: -118.2455, altitude: 200, timestamp: '2026-03-20T14:25:00Z' },
    ],
    classification: 'suspicious', threat: 'medium',
    droneInfo: { manufacturer: 'Unknown' },
    operatorInfo: { identified: false },
    status: 'tracking', speed: 15.8, heading: 45, signalStrength: -65, frequency: 2412,
    zone: 'Buffer Zone Charlie',
    response: { action: 'alert', takenBy: 'System', timestamp: '2026-03-20T14:25:30Z', notes: 'Automatic alert escalation triggered' },
    alerts: [
      { type: 'suspicious_pattern', message: 'Flight pattern matches surveillance behavior', timestamp: '2026-03-20T14:25:00Z' },
    ],
  },
  {
    id: 'DET-004', timestamp: '2026-03-20T14:20:00Z', detectionMethod: 'remote_id',
    position: { lat: 34.0545, lng: -118.2395, altitude: 60, accuracy: 3 },
    track: [
      { lat: 34.0542, lng: -118.2400, altitude: 55, timestamp: '2026-03-20T14:18:00Z' },
    ],
    classification: 'friendly', threat: 'none',
    droneInfo: { manufacturer: 'Autel', model: 'EVO II Pro', serialNumber: 'AUT-EV2-99132', remoteIdMatch: true, registrationMatch: true },
    operatorInfo: { identified: true, name: 'Sarah Park', location: { lat: 34.0548, lng: -118.2398 } },
    status: 'departed', speed: 0, heading: 0,
    zone: 'Operations Zone Bravo',
    response: { action: 'none' },
    alerts: [],
  },
  {
    id: 'DET-005', timestamp: '2026-03-20T14:15:00Z', detectionMethod: 'multi_sensor',
    position: { lat: 34.0500, lng: -118.2470, altitude: 350, accuracy: 8 },
    track: [
      { lat: 34.0495, lng: -118.2480, altitude: 340, timestamp: '2026-03-20T14:10:00Z' },
      { lat: 34.0498, lng: -118.2475, altitude: 345, timestamp: '2026-03-20T14:12:00Z' },
      { lat: 34.0500, lng: -118.2470, altitude: 350, timestamp: '2026-03-20T14:15:00Z' },
    ],
    classification: 'threat', threat: 'critical',
    droneInfo: { manufacturer: 'Unknown', model: 'Custom Build', remoteIdMatch: false, registrationMatch: false },
    operatorInfo: { identified: false },
    status: 'active', speed: 22.3, heading: 315, signalStrength: -55, frequency: 915,
    zone: 'Critical Infrastructure Zone',
    response: { action: 'intercept', takenBy: 'Commander R. Torres', timestamp: '2026-03-20T14:16:00Z', notes: 'Counter-drone team deployed. Jamming authorized.' },
    alerts: [
      { type: 'critical_threat', message: 'High-speed unidentified drone approaching critical infrastructure', timestamp: '2026-03-20T14:15:00Z' },
      { type: 'altitude_violation', message: 'Altitude exceeds 400ft AGL limit', timestamp: '2026-03-20T14:15:05Z' },
      { type: 'no_remote_id', message: 'No Remote ID broadcast', timestamp: '2026-03-20T14:15:10Z' },
    ],
  },
  {
    id: 'DET-006', timestamp: '2026-03-20T14:10:00Z', detectionMethod: 'adsb',
    position: { lat: 34.0560, lng: -118.2380, altitude: 150, accuracy: 15 },
    track: [],
    classification: 'unknown', threat: 'low',
    operatorInfo: { identified: false },
    status: 'lost', speed: 5.1, heading: 90, signalStrength: -78,
    zone: 'Perimeter Zone Alpha',
    response: { action: 'monitor', takenBy: 'Operator K. Patel', timestamp: '2026-03-20T14:10:30Z' },
    alerts: [
      { type: 'signal_lost', message: 'ADS-B signal lost after 3 minutes', timestamp: '2026-03-20T14:13:00Z' },
    ],
  },
  {
    id: 'DET-007', timestamp: '2026-03-20T13:55:00Z', detectionMethod: 'visual',
    position: { lat: 34.0515, lng: -118.2445, altitude: 95, accuracy: 50 },
    track: [],
    classification: 'authorized', threat: 'none',
    droneInfo: { manufacturer: 'DJI', model: 'Matrice 350 RTK', serialNumber: 'DJI-M350-77210', remoteIdMatch: true, registrationMatch: true },
    operatorInfo: { identified: true, name: 'Carlos Mendez', location: { lat: 34.0518, lng: -118.2448 } },
    status: 'departed', speed: 0, heading: 0,
    zone: 'Operations Zone Bravo',
    response: { action: 'none' },
    alerts: [],
  },
  {
    id: 'DET-008', timestamp: '2026-03-20T13:45:00Z', detectionMethod: 'rf_scan',
    position: { lat: 34.0528, lng: -118.2425, altitude: 180, accuracy: 12 },
    track: [
      { lat: 34.0525, lng: -118.2430, altitude: 175, timestamp: '2026-03-20T13:42:00Z' },
      { lat: 34.0528, lng: -118.2425, altitude: 180, timestamp: '2026-03-20T13:45:00Z' },
    ],
    classification: 'unauthorized', threat: 'medium',
    droneInfo: { manufacturer: 'DJI', model: 'Mini 4 Pro', remoteIdMatch: false, registrationMatch: false },
    operatorInfo: { identified: false },
    status: 'departed', speed: 10.2, heading: 135, signalStrength: -52, frequency: 2462,
    zone: 'Buffer Zone Charlie',
    response: { action: 'alert', takenBy: 'System', timestamp: '2026-03-20T13:45:30Z', notes: 'Automated alert sent to security operations center' },
    alerts: [
      { type: 'unauthorized_entry', message: 'Unregistered drone in buffer zone', timestamp: '2026-03-20T13:45:00Z' },
    ],
  },
  {
    id: 'DET-009', timestamp: '2026-03-20T13:30:00Z', detectionMethod: 'radar',
    position: { lat: 34.0505, lng: -118.2460, altitude: 45, accuracy: 8 },
    track: [],
    classification: 'unknown', threat: 'low',
    operatorInfo: { identified: false },
    status: 'false_alarm', speed: 0, heading: 0, signalStrength: -80,
    zone: 'Perimeter Zone Alpha',
    response: { action: 'none', notes: 'Confirmed as large bird by visual check' },
    alerts: [],
  },
  {
    id: 'DET-010', timestamp: '2026-03-20T13:15:00Z', detectionMethod: 'acoustic',
    position: { lat: 34.0540, lng: -118.2405, altitude: 110, accuracy: 30 },
    track: [
      { lat: 34.0538, lng: -118.2408, altitude: 105, timestamp: '2026-03-20T13:12:00Z' },
    ],
    classification: 'suspicious', threat: 'medium',
    droneInfo: { manufacturer: 'Unknown' },
    operatorInfo: { identified: false },
    status: 'departed', speed: 18.4, heading: 225, signalStrength: -60, frequency: 5220,
    zone: 'Critical Infrastructure Zone',
    response: { action: 'investigate', takenBy: 'Operator J. Williams', timestamp: '2026-03-20T13:16:00Z', notes: 'Security patrol dispatched. Drone departed before arrival.' },
    alerts: [
      { type: 'proximity_alert', message: 'Drone within 200m of critical infrastructure', timestamp: '2026-03-20T13:15:00Z' },
    ],
  },
  {
    id: 'DET-011', timestamp: '2026-03-20T12:50:00Z', detectionMethod: 'remote_id',
    position: { lat: 34.0530, lng: -118.2420, altitude: 75, accuracy: 3 },
    track: [],
    classification: 'authorized', threat: 'none',
    droneInfo: { manufacturer: 'DJI', model: 'Inspire 3', serialNumber: 'DJI-INS3-55432', remoteIdMatch: true, registrationMatch: true },
    operatorInfo: { identified: true, name: 'Emily Torres', location: { lat: 34.0532, lng: -118.2422 } },
    status: 'departed', speed: 0, heading: 0,
    zone: 'Operations Zone Bravo',
    response: { action: 'none' },
    alerts: [],
  },
  {
    id: 'DET-012', timestamp: '2026-03-20T12:30:00Z', detectionMethod: 'multi_sensor',
    position: { lat: 34.0518, lng: -118.2442, altitude: 280, accuracy: 6 },
    track: [
      { lat: 34.0512, lng: -118.2450, altitude: 260, timestamp: '2026-03-20T12:25:00Z' },
      { lat: 34.0515, lng: -118.2446, altitude: 270, timestamp: '2026-03-20T12:28:00Z' },
      { lat: 34.0518, lng: -118.2442, altitude: 280, timestamp: '2026-03-20T12:30:00Z' },
    ],
    classification: 'unauthorized', threat: 'high',
    droneInfo: { manufacturer: 'Unknown', model: 'Fixed Wing', remoteIdMatch: false, registrationMatch: false },
    operatorInfo: { identified: false },
    status: 'neutralized', speed: 0, heading: 0, signalStrength: -48, frequency: 900,
    zone: 'Critical Infrastructure Zone',
    response: { action: 'jam', takenBy: 'Commander R. Torres', timestamp: '2026-03-20T12:31:00Z', notes: 'RF jamming applied at 12:31. Drone forced landing at 12:33. Recovery team dispatched.' },
    alerts: [
      { type: 'unauthorized_entry', message: 'Unauthorized fixed-wing drone in critical zone', timestamp: '2026-03-20T12:30:00Z' },
      { type: 'high_altitude', message: 'Altitude 280ft in restricted area', timestamp: '2026-03-20T12:30:05Z' },
    ],
  },
];

const mockSensors: DetectionSensor[] = [
  {
    id: 'SEN-001', name: 'RF Scanner Alpha-1', type: 'rf_scanner', status: 'online',
    position: { lat: 34.0525, lng: -118.2440 },
    coverage: { range: 2000, azimuth: { min: 0, max: 360 }, elevation: { min: -5, max: 45 } },
    lastHeartbeat: '2026-03-20T14:32:45Z', detectionsToday: 8, firmware: 'v3.2.1',
  },
  {
    id: 'SEN-002', name: 'Radar Station Bravo-1', type: 'radar', status: 'online',
    position: { lat: 34.0540, lng: -118.2400 },
    coverage: { range: 5000, azimuth: { min: 0, max: 360 }, elevation: { min: 0, max: 60 } },
    lastHeartbeat: '2026-03-20T14:32:50Z', detectionsToday: 14, firmware: 'v2.8.4',
  },
  {
    id: 'SEN-003', name: 'Acoustic Array Charlie-1', type: 'acoustic', status: 'degraded',
    position: { lat: 34.0510, lng: -118.2455 },
    coverage: { range: 500, azimuth: { min: 0, max: 360 }, elevation: { min: -10, max: 90 } },
    lastHeartbeat: '2026-03-20T14:30:12Z', detectionsToday: 3, firmware: 'v1.5.0',
  },
  {
    id: 'SEN-004', name: 'PTZ Camera Delta-1', type: 'camera', status: 'online',
    position: { lat: 34.0530, lng: -118.2430 },
    coverage: { range: 3000, azimuth: { min: 0, max: 360 }, elevation: { min: -15, max: 75 } },
    lastHeartbeat: '2026-03-20T14:32:48Z', detectionsToday: 5, firmware: 'v4.1.2',
  },
  {
    id: 'SEN-005', name: 'ADS-B Receiver Echo-1', type: 'adsb_receiver', status: 'offline',
    position: { lat: 34.0555, lng: -118.2385 },
    coverage: { range: 15000, azimuth: { min: 0, max: 360 }, elevation: { min: 0, max: 90 } },
    lastHeartbeat: '2026-03-20T12:15:00Z', detectionsToday: 1, firmware: 'v2.0.3',
  },
  {
    id: 'SEN-006', name: 'Remote ID Receiver Foxtrot-1', type: 'remote_id_receiver', status: 'maintenance',
    position: { lat: 34.0515, lng: -118.2445 },
    coverage: { range: 1000, azimuth: { min: 0, max: 360 }, elevation: { min: 0, max: 60 } },
    lastHeartbeat: '2026-03-20T10:00:00Z', detectionsToday: 0, firmware: 'v1.2.0',
  },
];

const mockStats: CounterUASStats = {
  activeDetections: 2,
  totalDetectionsToday: 12,
  unauthorizedToday: 4,
  threatsToday: 2,
  sensorsOnline: 3,
  sensorsTotal: 6,
  avgResponseTime: 42,
  falseAlarmRate: 8.3,
  detectionsByMethod: { rf_scan: 3, radar: 2, acoustic: 2, visual: 1, adsb: 1, remote_id: 2, multi_sensor: 2 },
  detectionsByClassification: { authorized: 3, unauthorized: 3, unknown: 2, friendly: 1, suspicious: 2, threat: 1 },
  hourlyTrend: [
    { hour: '00:00', count: 0 }, { hour: '01:00', count: 0 }, { hour: '02:00', count: 1 },
    { hour: '03:00', count: 0 }, { hour: '04:00', count: 0 }, { hour: '05:00', count: 1 },
    { hour: '06:00', count: 2 }, { hour: '07:00', count: 3 }, { hour: '08:00', count: 5 },
    { hour: '09:00', count: 4 }, { hour: '10:00', count: 6 }, { hour: '11:00', count: 8 },
    { hour: '12:00', count: 7 }, { hour: '13:00', count: 9 }, { hour: '14:00', count: 5 },
    { hour: '15:00', count: 3 }, { hour: '16:00', count: 4 }, { hour: '17:00', count: 6 },
    { hour: '18:00', count: 5 }, { hour: '19:00', count: 3 }, { hour: '20:00', count: 2 },
    { hour: '21:00', count: 1 }, { hour: '22:00', count: 1 }, { hour: '23:00', count: 0 },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Page Component ───────────────────────────────────────────────────────────
export function CounterUASPage() {
  const [activeTab, setActiveTab] = useState<TabId>('detections');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<Classification | 'all'>('all');
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | 'all'>('all');
  const [statusFilterVal, setStatusFilterVal] = useState<DroneDetection['status'] | 'all'>('all');

  const filteredDetections = mockDetections.filter(d => {
    if (classFilter !== 'all' && d.classification !== classFilter) return false;
    if (threatFilter !== 'all' && d.threat !== threatFilter) return false;
    if (statusFilterVal !== 'all' && d.status !== statusFilterVal) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.id.toLowerCase().includes(q) || d.zone.toLowerCase().includes(q) || (d.droneInfo?.manufacturer ?? '').toLowerCase().includes(q) || (d.droneInfo?.model ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const tabs: { id: TabId; label: string; icon: typeof Shield }[] = [
    { id: 'detections', label: 'Live Detections', icon: Radar },
    { id: 'sensors', label: 'Sensors', icon: Radio },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  // ── Live Detections Tab ──
  function renderDetectionsTab() {
    return (
      <div className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Radar className="w-3.5 h-3.5" /> Active</div>
            <div className="text-xl font-bold text-blue-600">{mockStats.activeDetections}</div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Activity className="w-3.5 h-3.5" /> Total Today</div>
            <div className="text-xl font-bold text-gray-900">{mockStats.totalDetectionsToday}</div>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-3">
            <div className="flex items-center gap-1.5 text-xs text-red-500 mb-1"><ShieldAlert className="w-3.5 h-3.5" /> Unauthorized</div>
            <div className="text-xl font-bold text-red-600">{mockStats.unauthorizedToday}</div>
          </div>
          <div className="bg-white rounded-lg border border-red-300 p-3">
            <div className="flex items-center gap-1.5 text-xs text-red-600 mb-1"><AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Threats</div>
            <div className="text-xl font-bold text-red-700">{mockStats.threatsToday}</div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Wifi className="w-3.5 h-3.5" /> Sensors</div>
            <div className="text-xl font-bold text-green-600">{mockStats.sensorsOnline}<span className="text-sm font-normal text-gray-400">/{mockStats.sensorsTotal}</span></div>
          </div>
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Clock className="w-3.5 h-3.5" /> Avg Response</div>
            <div className="text-xl font-bold text-gray-900">{mockStats.avgResponseTime}<span className="text-sm font-normal text-gray-400">s</span></div>
          </div>
          <div className="bg-white rounded-lg border p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><Target className="w-3.5 h-3.5" /> False Alarm</div>
            <div className="text-xl font-bold text-gray-900">{mockStats.falseAlarmRate}<span className="text-sm font-normal text-gray-400">%</span></div>
          </div>
        </div>

        {/* Threat classification quick buttons */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase">Quick Classification</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(classificationConfig) as Classification[]).map(c => {
              const cfg = classificationConfig[c];
              return (
                <button key={c} className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all', cfg.bg, cfg.text, 'hover:ring-2 ring-offset-1')}>
                  <span className={clsx('inline-block w-2 h-2 rounded-full mr-1.5', cfg.dot)} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search detections..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value as Classification | 'all')} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Classifications</option>
            {(Object.keys(classificationConfig) as Classification[]).map(c => <option key={c} value={c}>{classificationConfig[c].label}</option>)}
          </select>
          <select value={threatFilter} onChange={e => setThreatFilter(e.target.value as ThreatLevel | 'all')} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Threats</option>
            {(Object.keys(threatConfig) as ThreatLevel[]).map(t => <option key={t} value={t}>{threatConfig[t].label}</option>)}
          </select>
          <select value={statusFilterVal} onChange={e => setStatusFilterVal(e.target.value as DroneDetection['status'] | 'all')} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            {(Object.keys(statusConfig) as DroneDetection['status'][]).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
          </select>
        </div>

        {/* Map placeholder */}
        <div className="bg-gray-900 rounded-lg border p-8 text-center">
          <MapPin className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm font-medium">Detection Map — Mapbox GL Integration</p>
          <p className="text-gray-500 text-xs mt-1">Live detection positions, sensor coverage overlays, and threat corridors</p>
        </div>

        {/* Detection feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Detection Feed ({filteredDetections.length})</h3>
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
            </div>
          </div>
          {filteredDetections.map(det => {
            const clsCfg = classificationConfig[det.classification];
            const thrCfg = threatConfig[det.threat];
            const stsCfg = statusConfig[det.status];
            const mtdCfg = methodConfig[det.detectionMethod];
            const MtdIcon = mtdCfg?.icon ?? Radar;
            const expanded = expandedId === det.id;
            return (
              <div key={det.id} className={clsx('bg-white rounded-lg border overflow-hidden transition-all', det.threat === 'critical' && 'border-red-400 ring-1 ring-red-200', det.threat === 'high' && 'border-orange-300')}>
                <div className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(expanded ? null : det.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Classification dot */}
                      <div className={clsx('w-3 h-3 rounded-full mt-1 flex-shrink-0', clsCfg.dot, det.status === 'active' && 'animate-pulse')} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-gray-900">{det.id}</span>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', clsCfg.bg, clsCfg.text)}>{clsCfg.label}</span>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', thrCfg.bg, thrCfg.text, thrCfg.pulse && 'animate-pulse')}>
                            {thrCfg.label} Threat
                          </span>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', stsCfg.bg, stsCfg.text)}>{stsCfg.label}</span>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                            <MtdIcon className="w-3 h-3" /> {mtdCfg?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {det.position.lat.toFixed(4)}, {det.position.lng.toFixed(4)} @ {det.position.altitude}ft</span>
                          <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {det.speed} m/s</span>
                          <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {det.heading}&deg;</span>
                          {det.signalStrength && <span className="flex items-center gap-1"><Signal className="w-3 h-3" /> {det.signalStrength} dBm</span>}
                          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {det.zone}</span>
                        </div>
                        {det.droneInfo && (
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {det.droneInfo.manufacturer && <span>{det.droneInfo.manufacturer} {det.droneInfo.model}</span>}
                            {det.droneInfo.remoteIdMatch !== undefined && (
                              <span className={clsx('flex items-center gap-0.5', det.droneInfo.remoteIdMatch ? 'text-green-600' : 'text-red-600')}>
                                {det.droneInfo.remoteIdMatch ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />} Remote ID
                              </span>
                            )}
                            {det.droneInfo.registrationMatch !== undefined && (
                              <span className={clsx('flex items-center gap-0.5', det.droneInfo.registrationMatch ? 'text-green-600' : 'text-red-600')}>
                                {det.droneInfo.registrationMatch ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />} Registration
                              </span>
                            )}
                          </div>
                        )}
                        {det.operatorInfo?.identified && (
                          <div className="text-xs text-gray-500 mt-1">Operator: <span className="font-medium text-gray-700">{det.operatorInfo.name}</span></div>
                        )}
                        {det.response.action !== 'none' && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                            <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', det.response.action === 'intercept' || det.response.action === 'jam' ? 'bg-red-100 text-red-700' : det.response.action === 'investigate' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                              {det.response.action.charAt(0).toUpperCase() + det.response.action.slice(1)}
                            </span>
                            {det.response.takenBy && <span className="text-gray-500">by {det.response.takenBy}</span>}
                          </div>
                        )}
                        {/* Signal strength bar */}
                        {det.signalStrength && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-16">Signal</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                              <div
                                className={clsx('h-full rounded-full', det.signalStrength > -50 ? 'bg-green-500' : det.signalStrength > -65 ? 'bg-yellow-500' : 'bg-red-500')}
                                style={{ width: `${Math.max(0, Math.min(100, (100 + det.signalStrength) * 1.5))}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{timeAgo(det.timestamp)}</span>
                      {det.alerts.length > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">{det.alerts.length}</span>
                      )}
                      {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>
                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t px-4 py-3 bg-gray-50 space-y-3">
                    {/* Track data */}
                    {det.track.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Track History ({det.track.length} points)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {det.track.map((pt, i) => (
                            <div key={i} className="text-xs bg-white rounded p-2 border">
                              <div className="text-gray-500">{new Date(pt.timestamp).toLocaleTimeString()}</div>
                              <div className="text-gray-700">{pt.lat.toFixed(4)}, {pt.lng.toFixed(4)} @ {pt.altitude}ft</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Alerts */}
                    {det.alerts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Alerts</h4>
                        <div className="space-y-1">
                          {det.alerts.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs bg-red-50 border border-red-200 rounded p-2">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-red-700">{a.message}</span>
                                <span className="text-red-400 ml-2">{new Date(a.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Drone info expanded */}
                    {det.droneInfo && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Drone Information</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {det.droneInfo.manufacturer && <div className="bg-white rounded p-2 border"><span className="text-gray-400">Manufacturer</span><div className="font-medium text-gray-700">{det.droneInfo.manufacturer}</div></div>}
                          {det.droneInfo.model && <div className="bg-white rounded p-2 border"><span className="text-gray-400">Model</span><div className="font-medium text-gray-700">{det.droneInfo.model}</div></div>}
                          {det.droneInfo.serialNumber && <div className="bg-white rounded p-2 border"><span className="text-gray-400">Serial</span><div className="font-mono font-medium text-gray-700">{det.droneInfo.serialNumber}</div></div>}
                          {det.frequency && <div className="bg-white rounded p-2 border"><span className="text-gray-400">Frequency</span><div className="font-medium text-gray-700">{det.frequency} MHz</div></div>}
                        </div>
                      </div>
                    )}
                    {/* Operator location */}
                    {det.operatorInfo?.identified && det.operatorInfo.location && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Operator Location</h4>
                        <div className="text-xs text-gray-600 bg-white rounded p-2 border">
                          {det.operatorInfo.name} — {det.operatorInfo.location.lat.toFixed(4)}, {det.operatorInfo.location.lng.toFixed(4)}
                        </div>
                      </div>
                    )}
                    {/* Response notes */}
                    {det.response.notes && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Response Notes</h4>
                        <div className="text-xs text-gray-700 bg-white rounded p-2 border">{det.response.notes}</div>
                      </div>
                    )}
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"><Flag className="w-3 h-3" /> Classify</button>
                      <button className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"><Zap className="w-3 h-3" /> Respond</button>
                      <button className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"><RotateCcw className="w-3 h-3" /> False Alarm</button>
                      <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"><Crosshair className="w-3 h-3" /> Track</button>
                      <button className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors flex items-center gap-1"><Eye className="w-3 h-3" /> Investigate</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Sensors Tab ──
  function renderSensorsTab() {
    return (
      <div className="space-y-4">
        {/* Sensor coverage map placeholder */}
        <div className="bg-gray-900 rounded-lg border p-8 text-center">
          <Radio className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm font-medium">Sensor Coverage Map — Mapbox GL Integration</p>
          <p className="text-gray-500 text-xs mt-1">Sensor positions, coverage radii, and detection heatmaps</p>
        </div>

        {/* Sensor grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockSensors.map(sensor => {
            const stCfg = sensorStatusConfig[sensor.status];
            const tyCfg = sensorTypeConfig[sensor.type];
            const TyIcon = tyCfg.icon;
            return (
              <div key={sensor.id} className={clsx('bg-white rounded-lg border p-4 space-y-3', sensor.status === 'offline' && 'opacity-70')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', sensor.status === 'online' ? 'bg-green-50' : sensor.status === 'offline' ? 'bg-red-50' : sensor.status === 'degraded' ? 'bg-yellow-50' : 'bg-blue-50')}>
                      <TyIcon className={clsx('w-5 h-5', sensor.status === 'online' ? 'text-green-600' : sensor.status === 'offline' ? 'text-red-600' : sensor.status === 'degraded' ? 'text-yellow-600' : 'text-blue-600')} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{sensor.name}</h3>
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', sensor.status === 'online' ? 'bg-green-50 text-green-700' : sensor.status === 'offline' ? 'bg-red-50 text-red-700' : sensor.status === 'degraded' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700')}>
                        {tyCfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={clsx('w-2.5 h-2.5 rounded-full', stCfg.dot, sensor.status === 'online' && 'animate-pulse')} />
                    <span className="text-xs font-medium text-gray-600">{stCfg.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Position</span>
                    <div className="text-gray-700 font-medium">{sensor.position.lat.toFixed(4)}, {sensor.position.lng.toFixed(4)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Range</span>
                    <div className="text-gray-700 font-medium">{(sensor.coverage.range / 1000).toFixed(1)} km</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Azimuth</span>
                    <div className="text-gray-700 font-medium">{sensor.coverage.azimuth.min}&deg; - {sensor.coverage.azimuth.max}&deg;</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Elevation</span>
                    <div className="text-gray-700 font-medium">{sensor.coverage.elevation.min}&deg; - {sensor.coverage.elevation.max}&deg;</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">Detections: <span className="font-semibold text-gray-700">{sensor.detectionsToday}</span></span>
                    <span className="text-gray-500">FW: <span className="font-mono text-gray-700">{sensor.firmware}</span></span>
                  </div>
                  <span className="text-gray-400">{timeAgo(sensor.lastHeartbeat)}</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button className="flex-1 px-2 py-1.5 bg-gray-50 text-gray-700 border rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"><Settings className="w-3 h-3" /> Configure</button>
                  <button className="flex-1 px-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"><RefreshCw className="w-3 h-3" /> Restart</button>
                  <button className="flex-1 px-2 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"><Wrench className="w-3 h-3" /> Maintenance</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Analytics Tab ──
  function renderAnalyticsTab() {
    const maxHourly = Math.max(...mockStats.hourlyTrend.map(h => h.count));
    const methodEntries = Object.entries(mockStats.detectionsByMethod).sort((a, b) => b[1] - a[1]);
    const maxMethod = Math.max(...methodEntries.map(([, v]) => v));
    const classEntries = Object.entries(mockStats.detectionsByClassification).sort((a, b) => b[1] - a[1]);
    const maxClass = Math.max(...classEntries.map(([, v]) => v));

    const responseTimeData = [
      { range: '0-15s', count: 3 }, { range: '15-30s', count: 5 }, { range: '30-60s', count: 8 },
      { range: '60-120s', count: 4 }, { range: '120s+', count: 2 },
    ];
    const maxResp = Math.max(...responseTimeData.map(r => r.count));

    const falseAlarmTrend = [
      { week: 'W1', rate: 12 }, { week: 'W2', rate: 10 }, { week: 'W3', rate: 9 },
      { week: 'W4', rate: 8.3 },
    ];

    const topZones = [
      { zone: 'Critical Infrastructure Zone', count: 4 },
      { zone: 'Buffer Zone Charlie', count: 3 },
      { zone: 'Perimeter Zone Alpha', count: 3 },
      { zone: 'Operations Zone Bravo', count: 2 },
    ];

    return (
      <div className="space-y-4">
        {/* Hourly trend */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Hourly Detection Trend (24h)</h3>
          <div className="flex items-end gap-1 h-40">
            {mockStats.hourlyTrend.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">{h.count > 0 ? h.count : ''}</span>
                <div className="w-full bg-blue-100 rounded-t relative" style={{ height: `${maxHourly > 0 ? (h.count / maxHourly) * 100 : 0}%`, minHeight: h.count > 0 ? '4px' : '0' }}>
                  <div className="absolute inset-0 bg-blue-500 rounded-t opacity-80" />
                </div>
                <span className="text-[9px] text-gray-400 -rotate-45 origin-top-left translate-y-2">{h.hour.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Detections by method */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Radar className="w-4 h-4 text-indigo-500" /> Detections by Method</h3>
            <div className="space-y-2">
              {methodEntries.map(([method, count]) => {
                const cfg = methodConfig[method];
                return (
                  <div key={method} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-24 truncate">{cfg?.label ?? method}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(count / maxMethod) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detections by classification */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-purple-500" /> Detections by Classification</h3>
            <div className="space-y-2">
              {classEntries.map(([cls, count]) => {
                const cfg = classificationConfig[cls as Classification];
                return (
                  <div key={cls} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-24 truncate">{cfg?.label ?? cls}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full transition-all', cfg?.dot.replace('bg-', 'bg-'))} style={{ width: `${(count / maxClass) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response time distribution */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Response Time Distribution</h3>
            <div className="flex items-end gap-3 h-32">
              {responseTimeData.map((r, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600">{r.count}</span>
                  <div className="w-full rounded-t bg-amber-400" style={{ height: `${(r.count / maxResp) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[10px] text-gray-500 text-center">{r.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* False alarm rate trend */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-green-500" /> False Alarm Rate Trend</h3>
            <div className="space-y-3">
              {falseAlarmTrend.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-8">{f.week}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full', f.rate > 10 ? 'bg-red-400' : f.rate > 8 ? 'bg-amber-400' : 'bg-green-400')} style={{ width: `${f.rate * 5}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-12 text-right">{f.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top detection zones */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" /> Top Detection Zones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topZones.map((z, i) => (
              <div key={i} className="bg-gray-50 rounded-lg border p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">#{i + 1}</div>
                  <div className="text-sm font-medium text-gray-700">{z.zone}</div>
                </div>
                <div className="text-lg font-bold text-gray-900">{z.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly / Monthly comparison */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-500" /> Weekly / Monthly Comparison</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 mb-1">This Week</div>
              <div className="text-2xl font-bold text-blue-700">34</div>
              <div className="flex items-center justify-center gap-1 text-xs text-green-600 mt-1"><TrendingDown className="w-3 h-3" /> -12%</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Last Week</div>
              <div className="text-2xl font-bold text-gray-700">39</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 mb-1">This Month</div>
              <div className="text-2xl font-bold text-blue-700">142</div>
              <div className="flex items-center justify-center gap-1 text-xs text-red-600 mt-1"><TrendingUp className="w-3 h-3" /> +8%</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Last Month</div>
              <div className="text-2xl font-bold text-gray-700">131</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Shield className="w-7 h-7 text-red-600" /> Counter-UAS</h1>
          <p className="text-sm text-gray-500 mt-1">Drone detection, tracking, and threat response management</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> System Active
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Alert All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'detections' && renderDetectionsTab()}
      {activeTab === 'sensors' && renderSensorsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
}
