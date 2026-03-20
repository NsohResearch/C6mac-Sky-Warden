import { useState, useEffect } from 'react';
import {
  Radio, Battery, Signal, Navigation, AlertTriangle, MapPin,
  Gauge, Wifi, Satellite, Shield, Clock, Eye, ChevronDown,
  ChevronUp, Check, X, RefreshCw, Activity, Crosshair, BellRing,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { DroneTelemetry, TelemetryAlert, TelemetryDashboardStats } from '@c6maceye/shared/types/telemetry';

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
type DroneStatus = DroneTelemetry['status'];
type AlertSeverity = TelemetryAlert['severity'];

const statusConfig: Record<DroneStatus, { label: string; color: string; dot: string; bg: string }> = {
  on_ground:       { label: 'On Ground',       color: 'text-gray-600',   dot: 'bg-gray-400',   bg: 'bg-gray-100' },
  taking_off:      { label: 'Taking Off',      color: 'text-blue-600',   dot: 'bg-blue-500',   bg: 'bg-blue-100' },
  in_flight:       { label: 'In Flight',       color: 'text-green-600',  dot: 'bg-green-500',  bg: 'bg-green-100' },
  hovering:        { label: 'Hovering',         color: 'text-cyan-600',   dot: 'bg-cyan-500',   bg: 'bg-cyan-100' },
  landing:         { label: 'Landing',          color: 'text-indigo-600', dot: 'bg-indigo-500', bg: 'bg-indigo-100' },
  returning_home:  { label: 'Returning Home',   color: 'text-purple-600', dot: 'bg-purple-500', bg: 'bg-purple-100' },
  emergency:       { label: 'EMERGENCY',        color: 'text-red-600',    dot: 'bg-red-500',    bg: 'bg-red-100' },
  offline:         { label: 'Offline',          color: 'text-gray-400',   dot: 'bg-gray-300',   bg: 'bg-gray-50' },
};

const severityConfig: Record<AlertSeverity, { color: string; bg: string; border: string }> = {
  info:     { color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-200' },
  warning:  { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  critical: { color: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200' },
};

const signalBars = (quality: DroneTelemetry['signal']['linkQuality']) => {
  const map = { excellent: 4, good: 3, fair: 2, poor: 1, lost: 0 };
  return map[quality];
};

// ---------------------------------------------------------------------------
// Mock data — 10 drones
// ---------------------------------------------------------------------------
const mockDrones: DroneTelemetry[] = [
  {
    droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', serialNumber: '1ZNBJ9E00C00X7',
    timestamp: '2026-03-20T14:32:10Z',
    position: { lat: 37.7749, lng: -122.4194, altitude: 120, altitudeAGL: 115 },
    velocity: { groundSpeed: 12.4, verticalSpeed: 0.2, heading: 275 },
    battery: { percentage: 72, voltage: 14.8, current: 8.2, temperature: 38, estimatedFlightTime: 18 },
    signal: { rssi: -45, snr: 28, linkQuality: 'excellent', latency: 12 },
    status: 'in_flight',
    sensors: { gpsFixType: 'RTK_FIX', satelliteCount: 18, hdop: 0.6, imuStatus: 'ok', compassStatus: 'ok' },
    mission: { missionId: 'MSN-101', missionName: 'Downtown Survey Grid A', waypointIndex: 12, totalWaypoints: 24, progress: 50 },
    remoteId: { broadcasting: true, messageType: 'location', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 450, warnings: [] },
  },
  {
    droneId: 'DRN-002', droneName: 'Matrice 350 RTK', serialNumber: '1ZNDH3500D002A',
    timestamp: '2026-03-20T14:32:08Z',
    position: { lat: 37.7850, lng: -122.4094, altitude: 95, altitudeAGL: 90 },
    velocity: { groundSpeed: 8.1, verticalSpeed: -0.5, heading: 180 },
    battery: { percentage: 54, voltage: 44.2, current: 12.6, temperature: 42, estimatedFlightTime: 14 },
    signal: { rssi: -58, snr: 22, linkQuality: 'good', latency: 24 },
    status: 'in_flight',
    sensors: { gpsFixType: 'RTK_FIX', satelliteCount: 16, hdop: 0.8, imuStatus: 'ok', compassStatus: 'ok' },
    mission: { missionId: 'MSN-102', missionName: 'Bridge Inspection Phase 2', waypointIndex: 8, totalWaypoints: 15, progress: 53 },
    remoteId: { broadcasting: true, messageType: 'location', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 220, warnings: [] },
  },
  {
    droneId: 'DRN-003', droneName: 'EVO II Pro #1', serialNumber: '7YBRX2100FN042',
    timestamp: '2026-03-20T14:32:05Z',
    position: { lat: 37.7650, lng: -122.4300, altitude: 0, altitudeAGL: 0 },
    velocity: { groundSpeed: 0, verticalSpeed: 0, heading: 0 },
    battery: { percentage: 100, voltage: 17.4, current: 0, temperature: 24, estimatedFlightTime: 42 },
    signal: { rssi: -30, snr: 35, linkQuality: 'excellent', latency: 5 },
    status: 'on_ground',
    sensors: { gpsFixType: '3D', satelliteCount: 14, hdop: 1.2, imuStatus: 'ok', compassStatus: 'ok' },
    remoteId: { broadcasting: false, messageType: 'basic_id', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 1200, warnings: [] },
  },
  {
    droneId: 'DRN-004', droneName: 'Skydio X10', serialNumber: 'SKX10-2024-0891',
    timestamp: '2026-03-20T14:32:09Z',
    position: { lat: 37.7900, lng: -122.4050, altitude: 65, altitudeAGL: 60 },
    velocity: { groundSpeed: 0.3, verticalSpeed: 0, heading: 90 },
    battery: { percentage: 88, voltage: 14.2, current: 3.1, temperature: 31, estimatedFlightTime: 28 },
    signal: { rssi: -52, snr: 25, linkQuality: 'good', latency: 18 },
    status: 'hovering',
    sensors: { gpsFixType: 'RTK_FLOAT', satelliteCount: 15, hdop: 0.9, imuStatus: 'ok', compassStatus: 'ok' },
    mission: { missionId: 'MSN-103', missionName: 'Rooftop Thermal Scan', waypointIndex: 3, totalWaypoints: 8, progress: 37 },
    remoteId: { broadcasting: true, messageType: 'location', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 380, warnings: [] },
  },
  {
    droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', serialNumber: '1ZNBJ9T00C0071',
    timestamp: '2026-03-20T14:32:07Z',
    position: { lat: 37.7720, lng: -122.4250, altitude: 45, altitudeAGL: 40 },
    velocity: { groundSpeed: 5.6, verticalSpeed: -2.1, heading: 355 },
    battery: { percentage: 31, voltage: 13.8, current: 9.8, temperature: 44, estimatedFlightTime: 6 },
    signal: { rssi: -68, snr: 16, linkQuality: 'fair', latency: 45 },
    status: 'returning_home',
    sensors: { gpsFixType: '3D', satelliteCount: 11, hdop: 1.5, imuStatus: 'ok', compassStatus: 'warning' },
    remoteId: { broadcasting: true, messageType: 'location', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 90, warnings: ['Approaching geofence boundary'] },
  },
  {
    droneId: 'DRN-006', droneName: 'Phantom 4 RTK', serialNumber: '0AXDJ4R00300P2',
    timestamp: '2026-03-20T14:25:00Z',
    position: { lat: 37.7600, lng: -122.4400, altitude: 0, altitudeAGL: 0 },
    velocity: { groundSpeed: 0, verticalSpeed: 0, heading: 0 },
    battery: { percentage: 0, voltage: 0, current: 0, temperature: 22, estimatedFlightTime: 0 },
    signal: { rssi: 0, snr: 0, linkQuality: 'lost', latency: 0 },
    status: 'offline',
    sensors: { gpsFixType: '2D', satelliteCount: 0, hdop: 99, imuStatus: 'error', compassStatus: 'error' },
    remoteId: { broadcasting: false, messageType: 'basic_id', complianceStatus: 'unknown' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 0, warnings: [] },
  },
  {
    droneId: 'DRN-007', droneName: 'Inspire 3', serialNumber: 'DJI-INS3-00419',
    timestamp: '2026-03-20T14:32:11Z',
    position: { lat: 37.7800, lng: -122.3950, altitude: 200, altitudeAGL: 195 },
    velocity: { groundSpeed: 18.7, verticalSpeed: 1.2, heading: 45 },
    battery: { percentage: 15, voltage: 42.1, current: 18.4, temperature: 48, estimatedFlightTime: 4 },
    signal: { rssi: -75, snr: 12, linkQuality: 'poor', latency: 85 },
    status: 'emergency',
    sensors: { gpsFixType: '3D', satelliteCount: 9, hdop: 2.1, imuStatus: 'warning', compassStatus: 'error' },
    remoteId: { broadcasting: true, messageType: 'system', complianceStatus: 'compliant' },
    geofence: { withinBounds: false, distanceToNearestBoundary: -35, warnings: ['GEOFENCE BREACH', 'Altitude exceeding authorized ceiling'] },
  },
  {
    droneId: 'DRN-008', droneName: 'Autel Dragonfish', serialNumber: 'ATL-DF-2025-112',
    timestamp: '2026-03-20T14:32:06Z',
    position: { lat: 37.7550, lng: -122.4150, altitude: 80, altitudeAGL: 75 },
    velocity: { groundSpeed: 22.3, verticalSpeed: 0.8, heading: 120 },
    battery: { percentage: 67, voltage: 50.1, current: 14.2, temperature: 36, estimatedFlightTime: 45 },
    signal: { rssi: -42, snr: 30, linkQuality: 'excellent', latency: 10 },
    status: 'in_flight',
    sensors: { gpsFixType: 'RTK_FIX', satelliteCount: 20, hdop: 0.5, imuStatus: 'ok', compassStatus: 'ok' },
    mission: { missionId: 'MSN-104', missionName: 'Pipeline Corridor Survey', waypointIndex: 18, totalWaypoints: 30, progress: 60 },
    remoteId: { broadcasting: true, messageType: 'location', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 650, warnings: [] },
  },
  {
    droneId: 'DRN-009', droneName: 'Mavic 3 Enterprise #2', serialNumber: '1ZNBJ9E00C00Y3',
    timestamp: '2026-03-20T14:32:04Z',
    position: { lat: 37.7680, lng: -122.4350, altitude: 30, altitudeAGL: 25 },
    velocity: { groundSpeed: 3.2, verticalSpeed: -1.8, heading: 200 },
    battery: { percentage: 45, voltage: 14.1, current: 7.5, temperature: 35, estimatedFlightTime: 10 },
    signal: { rssi: -55, snr: 21, linkQuality: 'good', latency: 22 },
    status: 'landing',
    sensors: { gpsFixType: '3D', satelliteCount: 13, hdop: 1.1, imuStatus: 'ok', compassStatus: 'ok' },
    remoteId: { broadcasting: true, messageType: 'location', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 300, warnings: [] },
  },
  {
    droneId: 'DRN-010', droneName: 'Wing Delivery Unit', serialNumber: 'WNG-DLV-2026-007',
    timestamp: '2026-03-20T14:32:10Z',
    position: { lat: 37.7950, lng: -122.3900, altitude: 55, altitudeAGL: 50 },
    velocity: { groundSpeed: 15.0, verticalSpeed: 2.5, heading: 310 },
    battery: { percentage: 82, voltage: 22.4, current: 6.8, temperature: 29, estimatedFlightTime: 32 },
    signal: { rssi: -48, snr: 26, linkQuality: 'excellent', latency: 14 },
    status: 'taking_off',
    sensors: { gpsFixType: 'RTK_FIX', satelliteCount: 17, hdop: 0.7, imuStatus: 'ok', compassStatus: 'ok' },
    remoteId: { broadcasting: true, messageType: 'location', complianceStatus: 'compliant' },
    geofence: { withinBounds: true, distanceToNearestBoundary: 520, warnings: [] },
  },
];

// ---------------------------------------------------------------------------
// Mock alerts — 16 alerts
// ---------------------------------------------------------------------------
const mockAlerts: TelemetryAlert[] = [
  { id: 'ALT-001', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'emergency', severity: 'critical', message: 'Emergency landing initiated — compass failure detected', timestamp: '2026-03-20T14:31:45Z', acknowledged: false, autoAction: 'Return-to-Home activated' },
  { id: 'ALT-002', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'geofence_breach', severity: 'critical', message: 'Geofence boundary breached — drone is 35m outside authorized zone', timestamp: '2026-03-20T14:31:30Z', acknowledged: false },
  { id: 'ALT-003', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'altitude_violation', severity: 'critical', message: 'Altitude exceeding authorized ceiling of 150m AGL (current: 195m)', timestamp: '2026-03-20T14:31:20Z', acknowledged: false },
  { id: 'ALT-004', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', type: 'battery_low', severity: 'critical', message: 'Battery critically low at 31% — auto-RTH triggered', timestamp: '2026-03-20T14:30:50Z', acknowledged: false, autoAction: 'Return-to-Home activated' },
  { id: 'ALT-005', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'battery_low', severity: 'critical', message: 'Battery at 15% — emergency landing imminent', timestamp: '2026-03-20T14:30:30Z', acknowledged: false },
  { id: 'ALT-006', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', type: 'geofence_warning', severity: 'warning', message: 'Approaching geofence boundary — 90m to nearest edge', timestamp: '2026-03-20T14:29:15Z', acknowledged: true },
  { id: 'ALT-007', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', type: 'weather_warning', severity: 'warning', message: 'Wind speed increasing to 18 mph — monitor flight stability', timestamp: '2026-03-20T14:28:00Z', acknowledged: true },
  { id: 'ALT-008', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'signal_lost', severity: 'warning', message: 'Signal quality degraded to poor — latency 85ms', timestamp: '2026-03-20T14:27:30Z', acknowledged: false },
  { id: 'ALT-009', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', type: 'airspace_conflict', severity: 'warning', message: 'Manned aircraft reported 1.2nm east at 1500ft — maintain altitude', timestamp: '2026-03-20T14:26:45Z', acknowledged: true },
  { id: 'ALT-010', droneId: 'DRN-008', droneName: 'Autel Dragonfish', type: 'speed_violation', severity: 'warning', message: 'Ground speed 22.3 m/s approaching operational limit of 25 m/s', timestamp: '2026-03-20T14:25:20Z', acknowledged: false },
  { id: 'ALT-011', droneId: 'DRN-006', droneName: 'Phantom 4 RTK', type: 'signal_lost', severity: 'critical', message: 'Connection lost — last contact 7 minutes ago', timestamp: '2026-03-20T14:25:00Z', acknowledged: false },
  { id: 'ALT-012', droneId: 'DRN-004', droneName: 'Skydio X10', type: 'weather_warning', severity: 'info', message: 'Temperature dropping — battery performance may be affected below 5\u00b0C', timestamp: '2026-03-20T14:22:10Z', acknowledged: true },
  { id: 'ALT-013', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', type: 'geofence_warning', severity: 'info', message: 'Mission waypoint 14 is within 100m of geofence boundary', timestamp: '2026-03-20T14:20:00Z', acknowledged: true },
  { id: 'ALT-014', droneId: 'DRN-009', droneName: 'Mavic 3 Enterprise #2', type: 'battery_low', severity: 'warning', message: 'Battery at 45% — consider initiating return sequence', timestamp: '2026-03-20T14:18:30Z', acknowledged: true },
  { id: 'ALT-015', droneId: 'DRN-010', droneName: 'Wing Delivery Unit', type: 'airspace_conflict', severity: 'info', message: 'TFR active 3nm north — no impact on current flight path', timestamp: '2026-03-20T14:15:00Z', acknowledged: true },
  { id: 'ALT-016', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', type: 'geofence_warning', severity: 'warning', message: 'Compass calibration warning — heading accuracy degraded', timestamp: '2026-03-20T14:12:45Z', acknowledged: true },
];

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------
const dashboardStats: TelemetryDashboardStats = {
  activeDrones: mockDrones.filter((d) => !['offline', 'on_ground'].includes(d.status)).length,
  totalFlightTimeToday: 14.5,
  alertsToday: mockAlerts.length,
  criticalAlerts: mockAlerts.filter((a) => a.severity === 'critical').length,
  averageBattery: Math.round(mockDrones.filter((d) => d.status !== 'offline').reduce((s, d) => s + d.battery.percentage, 0) / mockDrones.filter((d) => d.status !== 'offline').length),
  totalDistanceToday: 87.3,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function LiveTelemetryPage() {
  const [selectedDroneId, setSelectedDroneId] = useState<string>('DRN-001');
  const [statusFilter, setStatusFilter] = useState<DroneStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSecondsAgo((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const selectedDrone = mockDrones.find((d) => d.droneId === selectedDroneId) ?? mockDrones[0];

  const filteredDrones = mockDrones.filter((d) => statusFilter === 'all' || d.status === statusFilter);
  const filteredAlerts = alerts.filter((a) => severityFilter === 'all' || a.severity === severityFilter);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  // Map marker colors
  const markerColor = (s: DroneStatus) => {
    const map: Record<DroneStatus, string> = {
      in_flight: '#22c55e', hovering: '#06b6d4', taking_off: '#3b82f6', landing: '#6366f1',
      returning_home: '#a855f7', on_ground: '#9ca3af', emergency: '#ef4444', offline: '#d1d5db',
    };
    return map[s];
  };

  // -------------------------------------------------------------------------
  // Stats bar
  // -------------------------------------------------------------------------
  const statsCards: { label: string; value: string | number; icon: typeof Radio; color: string }[] = [
    { label: 'Active Drones', value: dashboardStats.activeDrones, icon: Radio, color: 'bg-green-50 text-green-600' },
    { label: 'Flight Time Today', value: `${dashboardStats.totalFlightTimeToday}h`, icon: Clock, color: 'bg-blue-50 text-blue-600' },
    { label: 'Alerts Today', value: dashboardStats.alertsToday, icon: BellRing, color: 'bg-amber-50 text-amber-600' },
    { label: 'Critical Alerts', value: dashboardStats.criticalAlerts, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: 'Avg Battery', value: `${dashboardStats.averageBattery}%`, icon: Battery, color: 'bg-purple-50 text-purple-600' },
    { label: 'Distance Today', value: `${dashboardStats.totalDistanceToday} km`, icon: Navigation, color: 'bg-cyan-50 text-cyan-600' },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 p-4">
      {/* ---- Top Stats ---- */}
      <div className="flex items-center justify-between gap-4">
        <div className="grid grid-cols-6 gap-3 flex-1">
          {statsCards.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className={clsx('flex items-center justify-center rounded-lg w-9 h-9', s.color)}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-semibold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          Last updated: {secondsAgo}s ago
        </div>
      </div>

      {/* ---- Main content ---- */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* ---- Left panel — Drone list ---- */}
        <div className="w-72 flex flex-col bg-white rounded-lg border border-gray-200 min-h-0">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Fleet Overview</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DroneStatus | 'all')}
              className="mt-2 w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 bg-white"
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredDrones.map((d) => {
              const cfg = statusConfig[d.status];
              const active = d.droneId === selectedDroneId;
              return (
                <button
                  key={d.droneId}
                  onClick={() => setSelectedDroneId(d.droneId)}
                  className={clsx(
                    'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                    active && 'bg-blue-50 border-l-2 border-blue-600',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">{d.droneName}</span>
                    <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3" /> {d.battery.percentage}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Signal className="w-3 h-3" /> {d.signal.linkQuality}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {d.position.altitudeAGL}m
                    </span>
                  </div>
                  <span className={clsx('inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded', cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
            {filteredDrones.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No drones match filter</p>
            )}
          </div>
        </div>

        {/* ---- Center — Map placeholder ---- */}
        <div className="flex-1 rounded-lg border border-gray-200 bg-gray-900 relative overflow-hidden min-h-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">Live Map &mdash; Mapbox GL integration point</p>
              <p className="text-gray-600 text-xs mt-1">Real-time drone positions rendered here</p>
            </div>
          </div>
          {/* Mock markers */}
          {mockDrones.filter((d) => d.status !== 'offline').map((d, i) => {
            const left = 10 + ((i * 97) % 80);
            const top = 10 + ((i * 73) % 70);
            return (
              <button
                key={d.droneId}
                onClick={() => setSelectedDroneId(d.droneId)}
                className={clsx(
                  'absolute flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-white transition-all hover:scale-110',
                  d.droneId === selectedDroneId && 'ring-2 ring-white ring-offset-1 ring-offset-gray-900',
                )}
                style={{ left: `${left}%`, top: `${top}%`, backgroundColor: markerColor(d.status) }}
              >
                <Crosshair className="w-3 h-3" />
                {d.droneName.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* ---- Right panel — Selected drone detail ---- */}
        <div className="w-80 bg-white rounded-lg border border-gray-200 overflow-y-auto min-h-0">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">{selectedDrone.droneName}</h2>
              <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded', statusConfig[selectedDrone.status].bg, statusConfig[selectedDrone.status].color)}>
                {statusConfig[selectedDrone.status].label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">SN: {selectedDrone.serialNumber}</p>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {/* Position */}
            <Section icon={MapPin} title="Position">
              <Row label="Latitude" value={selectedDrone.position.lat.toFixed(4)} />
              <Row label="Longitude" value={selectedDrone.position.lng.toFixed(4)} />
              <Row label="Altitude MSL" value={`${selectedDrone.position.altitude}m`} />
              <Row label="Altitude AGL" value={`${selectedDrone.position.altitudeAGL}m`} />
            </Section>

            {/* Velocity */}
            <Section icon={Gauge} title="Velocity">
              <Row label="Ground Speed" value={`${selectedDrone.velocity.groundSpeed} m/s`} />
              <Row label="Vertical Speed" value={`${selectedDrone.velocity.verticalSpeed} m/s`} />
              <Row label="Heading" value={`${selectedDrone.velocity.heading}\u00b0`} />
            </Section>

            {/* Battery */}
            <Section icon={Battery} title="Battery">
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Charge</span>
                  <span className={clsx('font-medium', selectedDrone.battery.percentage < 20 ? 'text-red-600' : selectedDrone.battery.percentage < 40 ? 'text-amber-600' : 'text-green-600')}>
                    {selectedDrone.battery.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all', selectedDrone.battery.percentage < 20 ? 'bg-red-500' : selectedDrone.battery.percentage < 40 ? 'bg-amber-500' : 'bg-green-500')}
                    style={{ width: `${selectedDrone.battery.percentage}%` }}
                  />
                </div>
              </div>
              <Row label="Voltage" value={`${selectedDrone.battery.voltage}V`} />
              <Row label="Current" value={`${selectedDrone.battery.current}A`} />
              <Row label="Temperature" value={`${selectedDrone.battery.temperature}\u00b0C`} />
              <Row label="Est. Flight Time" value={`${selectedDrone.battery.estimatedFlightTime} min`} />
            </Section>

            {/* Signal */}
            <Section icon={Wifi} title="Signal Quality">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-end gap-0.5 h-4">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={clsx('w-1.5 rounded-sm', bar <= signalBars(selectedDrone.signal.linkQuality) ? 'bg-green-500' : 'bg-gray-200')}
                      style={{ height: `${bar * 25}%` }}
                    />
                  ))}
                </div>
                <span className={clsx('font-medium capitalize',
                  selectedDrone.signal.linkQuality === 'excellent' ? 'text-green-600' :
                  selectedDrone.signal.linkQuality === 'good' ? 'text-green-500' :
                  selectedDrone.signal.linkQuality === 'fair' ? 'text-amber-500' :
                  selectedDrone.signal.linkQuality === 'poor' ? 'text-red-500' : 'text-gray-400',
                )}>
                  {selectedDrone.signal.linkQuality}
                </span>
              </div>
              <Row label="RSSI" value={`${selectedDrone.signal.rssi} dBm`} />
              <Row label="SNR" value={`${selectedDrone.signal.snr} dB`} />
              <Row label="Latency" value={`${selectedDrone.signal.latency} ms`} />
            </Section>

            {/* Sensors */}
            <Section icon={Satellite} title="Sensors">
              <Row label="GPS Fix" value={selectedDrone.sensors.gpsFixType.replace('_', ' ')} />
              <Row label="Satellites" value={selectedDrone.sensors.satelliteCount} />
              <Row label="HDOP" value={selectedDrone.sensors.hdop} />
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-500">IMU</span>
                <StatusBadge status={selectedDrone.sensors.imuStatus} />
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-500">Compass</span>
                <StatusBadge status={selectedDrone.sensors.compassStatus} />
              </div>
            </Section>

            {/* Mission */}
            {selectedDrone.mission && (
              <Section icon={Navigation} title="Mission">
                <p className="font-medium text-gray-900 mb-1">{selectedDrone.mission.missionName}</p>
                <Row label="Mission ID" value={selectedDrone.mission.missionId} />
                <Row label="Waypoint" value={`${selectedDrone.mission.waypointIndex} / ${selectedDrone.mission.totalWaypoints}`} />
                <div className="mt-1.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">{selectedDrone.mission.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedDrone.mission.progress}%` }} />
                  </div>
                </div>
              </Section>
            )}

            {/* Remote ID */}
            <Section icon={Shield} title="Remote ID">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-500">Broadcasting</span>
                {selectedDrone.remoteId.broadcasting ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium"><Activity className="w-3 h-3" /> Active</span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 font-medium"><X className="w-3 h-3" /> Inactive</span>
                )}
              </div>
              <Row label="Message Type" value={selectedDrone.remoteId.messageType.replace('_', ' ')} />
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-500">Compliance</span>
                <span className={clsx('font-medium capitalize',
                  selectedDrone.remoteId.complianceStatus === 'compliant' ? 'text-green-600' :
                  selectedDrone.remoteId.complianceStatus === 'non_compliant' ? 'text-red-600' : 'text-gray-400',
                )}>
                  {selectedDrone.remoteId.complianceStatus.replace('_', ' ')}
                </span>
              </div>
            </Section>

            {/* Geofence */}
            <Section icon={Eye} title="Geofence">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-500">Within Bounds</span>
                {selectedDrone.geofence.withinBounds ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium"><Check className="w-3 h-3" /> Yes</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-medium"><X className="w-3 h-3" /> BREACH</span>
                )}
              </div>
              <Row label="Distance to Boundary" value={`${Math.abs(selectedDrone.geofence.distanceToNearestBoundary)}m`} />
              {selectedDrone.geofence.warnings.length > 0 && (
                <div className="mt-1 space-y-1">
                  {selectedDrone.geofence.warnings.map((w, i) => (
                    <p key={i} className="text-amber-600 text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {w}
                    </p>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>

      {/* ---- Bottom panel — Alerts ---- */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => setAlertsExpanded(!alertsExpanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Telemetry Alerts</span>
            <span className="text-xs bg-red-100 text-red-700 font-medium px-1.5 py-0.5 rounded-full">
              {alerts.filter((a) => !a.acknowledged).length} unread
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={severityFilter}
              onChange={(e) => { e.stopPropagation(); setSeverityFilter(e.target.value as AlertSeverity | 'all'); }}
              onClick={(e) => e.stopPropagation()}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 bg-white"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            {alertsExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
          </div>
        </button>
        {alertsExpanded && (
          <div className="border-t border-gray-200 max-h-56 overflow-y-auto divide-y divide-gray-100">
            {filteredAlerts.map((a) => {
              const sc = severityConfig[a.severity];
              return (
                <div key={a.id} className={clsx('flex items-start gap-3 px-4 py-2.5 text-xs', a.acknowledged && 'opacity-60')}>
                  <div className={clsx('mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full',
                    a.severity === 'critical' ? 'bg-red-500' : a.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={clsx('font-medium px-1.5 py-0.5 rounded text-[10px]', sc.bg, sc.color)}>
                        {a.severity.toUpperCase()}
                      </span>
                      <span className="text-gray-500">{a.droneName}</span>
                      <span className="text-gray-400 ml-auto flex-shrink-0">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-0.5">{a.message}</p>
                    {a.autoAction && (
                      <p className="text-blue-600 mt-0.5 flex items-center gap-1"><Activity className="w-3 h-3" /> {a.autoAction}</p>
                    )}
                  </div>
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-green-600 transition-colors"
                      title="Acknowledge"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
            {filteredAlerts.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No alerts match filter</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Section({ icon: Icon, title, children }: { icon: typeof Radio; title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{String(value)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: 'ok' | 'warning' | 'error' }) {
  return (
    <span className={clsx('font-medium capitalize',
      status === 'ok' ? 'text-green-600' : status === 'warning' ? 'text-amber-600' : 'text-red-600',
    )}>
      {status}
    </span>
  );
}
