import { useState } from 'react';
import {
  Radio, Radar, Navigation, MapPin, Map, Shield, AlertTriangle, CheckCircle,
  XCircle, Clock, Calendar, Plane, Target, Layers, Globe, Activity,
  Wifi, Server, Database, ChevronDown, ChevronUp, Plus, Filter, Search,
  ArrowRight, RefreshCw, Signal, Crosshair, Eye,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { UTMOperation, UTMConstraint } from '../../../shared/types/utm';

// ─── State / Priority / Operation Type Configs ─────────────────────────

type OperationState = UTMOperation['state'];
type Priority = UTMOperation['priority'];
type OpType = UTMOperation['operationType'];
type ConstraintType = UTMConstraint['type'];
type Severity = UTMConstraint['severity'];

const stateConfig: Record<OperationState, { label: string; bg: string; text: string }> = {
  proposed: { label: 'Proposed', bg: 'bg-blue-50', text: 'text-blue-700' },
  accepted: { label: 'Accepted', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  activated: { label: 'Activated', bg: 'bg-green-50', text: 'text-green-700' },
  closed: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-600' },
  nonconforming: { label: 'Non-Conforming', bg: 'bg-orange-50', text: 'text-orange-700' },
  rogue: { label: 'Rogue', bg: 'bg-red-50', text: 'text-red-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-500' },
};

const priorityConfig: Record<Priority, { label: string; bg: string; text: string }> = {
  low: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600' },
  medium: { label: 'Medium', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  high: { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700' },
  emergency: { label: 'Emergency', bg: 'bg-red-50', text: 'text-red-700' },
};

const opTypeLabels: Record<OpType, string> = {
  vlos: 'VLOS',
  bvlos: 'BVLOS',
  autonomous: 'Autonomous',
};

const constraintTypeConfig: Record<ConstraintType, { label: string; bg: string; text: string }> = {
  tfr: { label: 'TFR', bg: 'bg-red-50', text: 'text-red-700' },
  notam: { label: 'NOTAM', bg: 'bg-orange-50', text: 'text-orange-700' },
  sua: { label: 'SUA', bg: 'bg-purple-50', text: 'text-purple-700' },
  dynamic_restriction: { label: 'Dynamic', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  weather: { label: 'Weather', bg: 'bg-sky-50', text: 'text-sky-700' },
  event: { label: 'Event', bg: 'bg-pink-50', text: 'text-pink-700' },
};

const severityConfig: Record<Severity, { label: string; bg: string; text: string }> = {
  advisory: { label: 'Advisory', bg: 'bg-blue-50', text: 'text-blue-700' },
  restriction: { label: 'Restriction', bg: 'bg-orange-50', text: 'text-orange-700' },
  prohibition: { label: 'Prohibition', bg: 'bg-red-50', text: 'text-red-700' },
};

const resolutionConfig: Record<string, { label: string; bg: string; text: string }> = {
  clear: { label: 'Clear', bg: 'bg-green-50', text: 'text-green-700' },
  time_separation: { label: 'Time Sep.', bg: 'bg-blue-50', text: 'text-blue-700' },
  altitude_separation: { label: 'Alt. Sep.', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  lateral_separation: { label: 'Lat. Sep.', bg: 'bg-purple-50', text: 'text-purple-700' },
  conflict: { label: 'Conflict', bg: 'bg-red-50', text: 'text-red-700' },
};

// ─── Mock Operations ───────────────────────────────────────────────────

const mockOperations: UTMOperation[] = [
  {
    id: 'utm-op-001', gufi: 'GUFI-2026-03-20-A7F3', state: 'activated', priority: 'medium', operationType: 'vlos',
    volumes: [{ altitude: { min: 0, max: 200, datum: 'AGL' }, geography: { type: 'polygon', coordinates: [{ lat: 37.7749, lng: -122.4194 }, { lat: 37.7760, lng: -122.4180 }, { lat: 37.7745, lng: -122.4165 }, { lat: 37.7735, lng: -122.4180 }] }, timeStart: '2026-03-20T09:00:00Z', timeEnd: '2026-03-20T11:00:00Z' }],
    pilotId: 'pilot-001', pilotName: 'James Park', droneId: 'drone-001', droneName: 'DJI Matrice 350', droneRegistration: 'FA-2026-00142', remoteIdTracking: 'RID-A7F3-001',
    submitTime: '2026-03-20T07:30:00Z', updateTime: '2026-03-20T08:45:00Z',
    deconflictions: [{ operationId: 'utm-op-003', type: 'strategic', resolution: 'clear', details: 'No overlap in time or space' }],
    conformanceMonitoring: { positionAccuracy: 2.1, altitudeAccuracy: 1.5, lastPosition: { lat: 37.7751, lng: -122.4190, altitude: 150, timestamp: '2026-03-20T10:15:00Z' }, withinVolume: true, alerts: [] },
    contingency: { landingPoint: { lat: 37.7740, lng: -122.4185 }, safeAltitude: 50, procedure: 'Return to launch point, descend to safe altitude, land at designated point' },
    ussProvider: 'SkyLink USS',
  },
  {
    id: 'utm-op-002', gufi: 'GUFI-2026-03-20-B9E1', state: 'proposed', priority: 'low', operationType: 'vlos',
    volumes: [{ altitude: { min: 0, max: 150, datum: 'AGL' }, geography: { type: 'circle', center: { lat: 37.3382, lng: -121.8863 }, radius: 500 }, timeStart: '2026-03-20T13:00:00Z', timeEnd: '2026-03-20T15:00:00Z' }],
    pilotId: 'pilot-002', pilotName: 'Maria Santos', droneId: 'drone-003', droneName: 'Autel EVO II Pro', droneRegistration: 'FA-2026-00198', remoteIdTracking: 'RID-B9E1-002',
    submitTime: '2026-03-20T06:00:00Z', updateTime: '2026-03-20T06:00:00Z',
    deconflictions: [],
    conformanceMonitoring: { positionAccuracy: 0, altitudeAccuracy: 0, lastPosition: { lat: 0, lng: 0, altitude: 0, timestamp: '' }, withinVolume: false, alerts: [] },
    contingency: { landingPoint: { lat: 37.3380, lng: -121.8860 }, safeAltitude: 30, procedure: 'Hover and descend in place if signal lost' },
    ussProvider: 'AirBridge UTM',
  },
  {
    id: 'utm-op-003', gufi: 'GUFI-2026-03-20-C2D8', state: 'accepted', priority: 'high', operationType: 'bvlos',
    volumes: [
      { altitude: { min: 100, max: 400, datum: 'AGL' }, geography: { type: 'polygon', coordinates: [{ lat: 37.7850, lng: -122.4100 }, { lat: 37.7900, lng: -122.4050 }, { lat: 37.7870, lng: -122.3980 }, { lat: 37.7820, lng: -122.4020 }] }, timeStart: '2026-03-20T14:00:00Z', timeEnd: '2026-03-20T18:00:00Z' },
      { altitude: { min: 200, max: 400, datum: 'AGL' }, geography: { type: 'circle', center: { lat: 37.7880, lng: -122.4000 }, radius: 300 }, timeStart: '2026-03-20T15:00:00Z', timeEnd: '2026-03-20T17:00:00Z' },
    ],
    pilotId: 'pilot-003', pilotName: 'Alex Turner', droneId: 'drone-005', droneName: 'Skydio X10', droneRegistration: 'FA-2026-00267', remoteIdTracking: 'RID-C2D8-003',
    submitTime: '2026-03-19T22:00:00Z', updateTime: '2026-03-20T08:00:00Z',
    deconflictions: [{ operationId: 'utm-op-001', type: 'strategic', resolution: 'altitude_separation', details: 'Vertical separation of 200ft maintained' }, { operationId: 'utm-op-005', type: 'tactical', resolution: 'time_separation', details: 'Temporal buffer of 30 minutes applied' }],
    conformanceMonitoring: { positionAccuracy: 0, altitudeAccuracy: 0, lastPosition: { lat: 0, lng: 0, altitude: 0, timestamp: '' }, withinVolume: false, alerts: [] },
    contingency: { landingPoint: { lat: 37.7860, lng: -122.4010 }, safeAltitude: 100, procedure: 'Activate DAA system, divert to contingency corridor, land at designated point' },
    ussProvider: 'SkyLink USS',
  },
  {
    id: 'utm-op-004', gufi: 'GUFI-2026-03-19-D5A4', state: 'closed', priority: 'low', operationType: 'vlos',
    volumes: [{ altitude: { min: 0, max: 100, datum: 'AGL' }, geography: { type: 'circle', center: { lat: 37.5585, lng: -122.2711 }, radius: 200 }, timeStart: '2026-03-19T10:00:00Z', timeEnd: '2026-03-19T12:00:00Z' }],
    pilotId: 'pilot-001', pilotName: 'James Park', droneId: 'drone-002', droneName: 'DJI Mavic 3 Enterprise', droneRegistration: 'FA-2026-00155', remoteIdTracking: 'RID-D5A4-004',
    submitTime: '2026-03-19T08:00:00Z', updateTime: '2026-03-19T12:05:00Z',
    deconflictions: [{ operationId: 'utm-op-006', type: 'strategic', resolution: 'clear', details: 'No spatial or temporal overlap' }],
    conformanceMonitoring: { positionAccuracy: 1.8, altitudeAccuracy: 1.2, lastPosition: { lat: 37.5586, lng: -122.2710, altitude: 80, timestamp: '2026-03-19T11:58:00Z' }, withinVolume: true, alerts: [] },
    contingency: { landingPoint: { lat: 37.5584, lng: -122.2712 }, safeAltitude: 30, procedure: 'Return to home, auto-land' },
    ussProvider: 'AirBridge UTM',
  },
  {
    id: 'utm-op-005', gufi: 'GUFI-2026-03-20-E8B2', state: 'nonconforming', priority: 'high', operationType: 'bvlos',
    volumes: [{ altitude: { min: 50, max: 300, datum: 'AGL' }, geography: { type: 'polygon', coordinates: [{ lat: 37.7600, lng: -122.4300 }, { lat: 37.7650, lng: -122.4250 }, { lat: 37.7630, lng: -122.4200 }, { lat: 37.7580, lng: -122.4250 }] }, timeStart: '2026-03-20T08:00:00Z', timeEnd: '2026-03-20T12:00:00Z' }],
    pilotId: 'pilot-004', pilotName: 'Sarah Chen', droneId: 'drone-006', droneName: 'Wingtra WingtraOne', droneRegistration: 'FA-2026-00312', remoteIdTracking: 'RID-E8B2-005',
    submitTime: '2026-03-20T05:00:00Z', updateTime: '2026-03-20T09:30:00Z',
    deconflictions: [{ operationId: 'utm-op-001', type: 'tactical', resolution: 'lateral_separation', details: 'Lateral buffer zone of 500m applied' }],
    conformanceMonitoring: { positionAccuracy: 8.5, altitudeAccuracy: 6.2, lastPosition: { lat: 37.7668, lng: -122.4180, altitude: 320, timestamp: '2026-03-20T09:28:00Z' }, withinVolume: false, alerts: ['Position outside authorized volume', 'Altitude exceeds max ceiling by 20ft'] },
    contingency: { landingPoint: { lat: 37.7610, lng: -122.4260 }, safeAltitude: 50, procedure: 'Execute contingency landing at pre-designated point' },
    ussProvider: 'DronePort Network',
  },
  {
    id: 'utm-op-006', gufi: 'GUFI-2026-03-20-F1C9', state: 'activated', priority: 'emergency', operationType: 'autonomous',
    volumes: [{ altitude: { min: 0, max: 400, datum: 'AGL' }, geography: { type: 'circle', center: { lat: 37.8044, lng: -122.2712 }, radius: 1000 }, timeStart: '2026-03-20T06:00:00Z', timeEnd: '2026-03-20T18:00:00Z' }],
    pilotId: 'pilot-005', pilotName: 'Dispatch Auto', droneId: 'drone-008', droneName: 'Zipline P2', droneRegistration: 'FA-2026-00401', remoteIdTracking: 'RID-F1C9-006',
    submitTime: '2026-03-20T05:30:00Z', updateTime: '2026-03-20T06:00:00Z',
    deconflictions: [{ operationId: 'utm-op-004', type: 'strategic', resolution: 'clear', details: 'Temporally separated — different operational windows' }, { operationId: 'utm-op-007', type: 'strategic', resolution: 'conflict', details: 'Overlapping volume with unresolved lateral conflict' }],
    conformanceMonitoring: { positionAccuracy: 0.8, altitudeAccuracy: 0.5, lastPosition: { lat: 37.8040, lng: -122.2715, altitude: 250, timestamp: '2026-03-20T10:20:00Z' }, withinVolume: true, alerts: [] },
    contingency: { landingPoint: { lat: 37.8050, lng: -122.2700 }, safeAltitude: 100, procedure: 'Autonomous return-to-base with obstacle avoidance engaged' },
    ussProvider: 'SkyLink USS',
  },
  {
    id: 'utm-op-007', gufi: 'GUFI-2026-03-20-G4D7', state: 'rogue', priority: 'emergency', operationType: 'vlos',
    volumes: [{ altitude: { min: 0, max: 120, datum: 'AGL' }, geography: { type: 'circle', center: { lat: 37.7950, lng: -122.3930 }, radius: 150 }, timeStart: '2026-03-20T09:00:00Z', timeEnd: '2026-03-20T10:00:00Z' }],
    pilotId: 'pilot-006', pilotName: 'Unknown Operator', droneId: 'drone-unknown', droneName: 'Unidentified UAS', droneRegistration: 'N/A', remoteIdTracking: 'RID-NONE',
    submitTime: '2026-03-20T09:15:00Z', updateTime: '2026-03-20T09:45:00Z',
    deconflictions: [{ operationId: 'utm-op-006', type: 'tactical', resolution: 'conflict', details: 'Rogue operation — no coordination possible' }],
    conformanceMonitoring: { positionAccuracy: 25.0, altitudeAccuracy: 15.0, lastPosition: { lat: 37.7960, lng: -122.3920, altitude: 180, timestamp: '2026-03-20T09:42:00Z' }, withinVolume: false, alerts: ['Rogue operation detected', 'No Remote ID broadcast', 'Entered restricted airspace'] },
    contingency: { landingPoint: { lat: 0, lng: 0 }, safeAltitude: 0, procedure: 'N/A — uncooperative operation' },
    ussProvider: 'Unknown',
  },
  {
    id: 'utm-op-008', gufi: 'GUFI-2026-03-20-H6E5', state: 'cancelled', priority: 'medium', operationType: 'bvlos',
    volumes: [{ altitude: { min: 100, max: 350, datum: 'AGL' }, geography: { type: 'polygon', coordinates: [{ lat: 37.4419, lng: -122.1430 }, { lat: 37.4450, lng: -122.1380 }, { lat: 37.4430, lng: -122.1340 }, { lat: 37.4400, lng: -122.1380 }] }, timeStart: '2026-03-20T16:00:00Z', timeEnd: '2026-03-20T19:00:00Z' }],
    pilotId: 'pilot-002', pilotName: 'Maria Santos', droneId: 'drone-007', droneName: 'senseFly eBee X', droneRegistration: 'FA-2026-00289', remoteIdTracking: 'RID-H6E5-008',
    submitTime: '2026-03-20T04:00:00Z', updateTime: '2026-03-20T07:30:00Z',
    deconflictions: [],
    conformanceMonitoring: { positionAccuracy: 0, altitudeAccuracy: 0, lastPosition: { lat: 0, lng: 0, altitude: 0, timestamp: '' }, withinVolume: false, alerts: [] },
    contingency: { landingPoint: { lat: 37.4425, lng: -122.1400 }, safeAltitude: 80, procedure: 'Programmatic RTL with geofence corridor' },
    ussProvider: 'DronePort Network',
  },
];

// ─── Mock Constraints ──────────────────────────────────────────────────

const mockConstraints: UTMConstraint[] = [
  { id: 'cst-001', type: 'tfr', description: 'Presidential TFR — San Francisco Financial District', geography: { type: 'circle', center: { lat: 37.7749, lng: -122.4194 }, radius: 5556 }, altitude: { min: 0, max: 18000 }, timeStart: '2026-03-20T08:00:00Z', timeEnd: '2026-03-20T20:00:00Z', source: 'FAA NOTAM System', severity: 'prohibition' },
  { id: 'cst-002', type: 'notam', description: 'NOTAM 03/142 — Crane operations at SFO Runway 28L', geography: { type: 'circle', center: { lat: 37.6213, lng: -122.3790 }, radius: 1852 }, altitude: { min: 0, max: 500 }, timeStart: '2026-03-18T06:00:00Z', timeEnd: '2026-03-22T18:00:00Z', source: 'FAA NOTAM 03/142', severity: 'restriction' },
  { id: 'cst-003', type: 'sua', description: 'Restricted Area R-2508 — Edwards AFB Complex', geography: { type: 'polygon', coordinates: [{ lat: 34.9054, lng: -117.8839 }, { lat: 35.2000, lng: -117.5000 }, { lat: 35.1000, lng: -117.2000 }, { lat: 34.8000, lng: -117.6000 }] }, altitude: { min: 0, max: 60000 }, timeStart: '2026-01-01T00:00:00Z', timeEnd: '2026-12-31T23:59:59Z', source: 'FAA SUA Database', severity: 'prohibition' },
  { id: 'cst-004', type: 'weather', description: 'Severe thunderstorm warning — Bay Area coastal regions', geography: { type: 'circle', center: { lat: 37.7000, lng: -122.5000 }, radius: 20000 }, altitude: { min: 0, max: 10000 }, timeStart: '2026-03-20T14:00:00Z', timeEnd: '2026-03-20T22:00:00Z', source: 'NWS Weather Advisory', severity: 'advisory' },
  { id: 'cst-005', type: 'event', description: 'Golden Gate Bridge Marathon — aerial restriction zone', geography: { type: 'polygon', coordinates: [{ lat: 37.8199, lng: -122.4783 }, { lat: 37.8280, lng: -122.4700 }, { lat: 37.8150, lng: -122.4650 }, { lat: 37.8100, lng: -122.4750 }] }, altitude: { min: 0, max: 400 }, timeStart: '2026-03-20T06:00:00Z', timeEnd: '2026-03-20T14:00:00Z', source: 'Local Event Authority', severity: 'restriction' },
  { id: 'cst-006', type: 'dynamic_restriction', description: 'Emergency helicopter corridor — Stanford Medical Center', geography: { type: 'circle', center: { lat: 37.4345, lng: -122.1751 }, radius: 926 }, altitude: { min: 0, max: 1000 }, timeStart: '2026-03-20T10:00:00Z', timeEnd: '2026-03-20T16:00:00Z', source: 'HEMS Dynamic Restriction', severity: 'prohibition' },
  { id: 'cst-007', type: 'tfr', description: 'Wildfire TFR — East Bay Hills fire suppression zone', geography: { type: 'circle', center: { lat: 37.8500, lng: -122.2200 }, radius: 9260 }, altitude: { min: 0, max: 5000 }, timeStart: '2026-03-19T00:00:00Z', timeEnd: '2026-03-21T23:59:59Z', source: 'FAA TFR 6/2058', severity: 'prohibition' },
  { id: 'cst-008', type: 'notam', description: 'NOTAM 03/155 — GPS interference testing, Moffett Field', geography: { type: 'circle', center: { lat: 37.4153, lng: -122.0486 }, radius: 3704 }, altitude: { min: 0, max: 2000 }, timeStart: '2026-03-20T22:00:00Z', timeEnd: '2026-03-21T04:00:00Z', source: 'FAA NOTAM 03/155', severity: 'advisory' },
];

// ─── Mock USS Providers ────────────────────────────────────────────────

const mockUSSProviders = [
  { name: 'SkyLink USS', connected: true, latency: 42, lastHeartbeat: '2026-03-20T10:19:55Z', operationsCount: 3, messagesIn: 12450, messagesOut: 11890, errorRate: 0.02 },
  { name: 'AirBridge UTM', connected: true, latency: 68, lastHeartbeat: '2026-03-20T10:19:48Z', operationsCount: 2, messagesIn: 8920, messagesOut: 8755, errorRate: 0.05 },
  { name: 'DronePort Network', connected: true, latency: 115, lastHeartbeat: '2026-03-20T10:19:30Z', operationsCount: 2, messagesIn: 6340, messagesOut: 6100, errorRate: 0.12 },
  { name: 'ClearSky UTM', connected: false, latency: 0, lastHeartbeat: '2026-03-20T08:45:00Z', operationsCount: 0, messagesIn: 3200, messagesOut: 3180, errorRate: 1.5 },
];

// ─── Stats ─────────────────────────────────────────────────────────────

const stats = {
  activeOperations: mockOperations.filter((o) => o.state === 'activated').length,
  proposedOperations: mockOperations.filter((o) => o.state === 'proposed').length,
  deconflictionsToday: mockOperations.reduce((sum, o) => sum + o.deconflictions.length, 0),
  conflictsDetected: mockOperations.reduce((sum, o) => sum + o.deconflictions.filter((d) => d.resolution === 'conflict').length, 0),
  nonconformingOps: mockOperations.filter((o) => o.state === 'nonconforming' || o.state === 'rogue').length,
  constraintsActive: mockConstraints.length,
  averageApprovalTime: 12,
};

const statsCards = [
  { label: 'Active Ops', value: stats.activeOperations, icon: Activity, color: 'bg-green-50 text-green-600' },
  { label: 'Proposed', value: stats.proposedOperations, icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { label: 'Deconflictions', value: stats.deconflictionsToday, icon: Radar, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Conflicts', value: stats.conflictsDetected, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
  { label: 'Non-Conforming', value: stats.nonconformingOps, icon: XCircle, color: 'bg-red-50 text-red-600' },
  { label: 'Constraints', value: stats.constraintsActive, icon: Shield, color: 'bg-purple-50 text-purple-600' },
  { label: 'Avg Approval', value: `${stats.averageApprovalTime}m`, icon: RefreshCw, color: 'bg-sky-50 text-sky-600' },
];

// ─── Helpers ───────────────────────────────────────────────────────────

function formatTime(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTimeShort(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ─────────────────────────────────────────────────────────

type Tab = 'operations' | 'constraints' | 'network';

export function UTMPage() {
  const [activeTab, setActiveTab] = useState<Tab>('operations');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<OperationState | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [opTypeFilter, setOpTypeFilter] = useState<OpType | 'all'>('all');
  const [expandedOp, setExpandedOp] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [constraintTypeFilter, setConstraintTypeFilter] = useState<ConstraintType | 'all'>('all');
  const [constraintSeverityFilter, setConstraintSeverityFilter] = useState<Severity | 'all'>('all');

  const filteredOps = mockOperations.filter((op) => {
    if (stateFilter !== 'all' && op.state !== stateFilter) return false;
    if (priorityFilter !== 'all' && op.priority !== priorityFilter) return false;
    if (opTypeFilter !== 'all' && op.operationType !== opTypeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return op.gufi.toLowerCase().includes(q) || op.pilotName.toLowerCase().includes(q) || op.droneName.toLowerCase().includes(q) || op.droneRegistration.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredConstraints = mockConstraints.filter((c) => {
    if (constraintTypeFilter !== 'all' && c.type !== constraintTypeFilter) return false;
    if (constraintSeverityFilter !== 'all' && c.severity !== constraintSeverityFilter) return false;
    return true;
  });

  const tabs: { key: Tab; label: string; icon: typeof Radio }[] = [
    { key: 'operations', label: 'Operations', icon: Radio },
    { key: 'constraints', label: 'Airspace Constraints', icon: Layers },
    { key: 'network', label: 'Network Status', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">UTM Operations</h1>
          <p className="text-sm text-gray-500 mt-1">UAS Traffic Management — operation planning, deconfliction, and conformance monitoring</p>
        </div>
        {activeTab === 'operations' && (
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Submit Operation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════ OPERATIONS TAB ═══════════════ */}
      {activeTab === 'operations' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', card.color)}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{card.value}</p>
                      <p className="text-xs text-gray-500">{card.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Operation Form */}
          {showSubmitForm && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit New UTM Operation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="vlos">VLOS</option>
                    <option value="bvlos">BVLOS</option>
                    <option value="autonomous">Autonomous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilot</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>James Park</option>
                    <option>Maria Santos</option>
                    <option>Alex Turner</option>
                    <option>Sarah Chen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drone</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>DJI Matrice 350</option>
                    <option>Autel EVO II Pro</option>
                    <option>Skydio X10</option>
                    <option>Wingtra WingtraOne</option>
                    <option>senseFly eBee X</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Altitude (ft AGL)</label>
                  <input type="number" placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Altitude (ft AGL)</label>
                  <input type="number" placeholder="400" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="datetime-local" className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="datetime-local" className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">USS Provider</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>SkyLink USS</option>
                    <option>AirBridge UTM</option>
                    <option>DronePort Network</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contingency Procedure</label>
                <textarea rows={2} placeholder="Describe contingency landing and recovery procedure..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  <Radio size={16} />
                  Submit to UTM
                </button>
                <button onClick={() => setShowSubmitForm(false)} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search GUFI, pilot, drone..."
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Filter size={14} className="text-gray-400" />
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value as OperationState | 'all')} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All States</option>
                {Object.entries(stateConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Priorities</option>
                {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={opTypeFilter} onChange={(e) => setOpTypeFilter(e.target.value as OpType | 'all')} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Types</option>
                {Object.entries(opTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Operations List */}
          <div className="space-y-3">
            {filteredOps.map((op) => {
              const isExpanded = expandedOp === op.id;
              const sc = stateConfig[op.state];
              const pc = priorityConfig[op.priority];
              const vol = op.volumes[0];

              return (
                <div key={op.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                  {/* Main Row */}
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Identity */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          <Navigation size={20} className="text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold text-gray-900">{op.gufi}</span>
                            <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', sc.bg, sc.text)}>{sc.label}</span>
                            <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', pc.bg, pc.text)}>{pc.label}</span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{opTypeLabels[op.operationType]}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1"><Plane size={13} /> {op.pilotName}</span>
                            <span className="flex items-center gap-1"><Target size={13} /> {op.droneName}</span>
                            <span className="flex items-center gap-1"><Crosshair size={13} /> {op.droneRegistration}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1"><Layers size={12} /> {vol.altitude.min}–{vol.altitude.max} ft {vol.altitude.datum}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {formatTimeShort(vol.timeStart)} — {formatTimeShort(vol.timeEnd)}</span>
                            <span className="flex items-center gap-1"><Globe size={12} /> {op.ussProvider}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Deconfliction & Conformance */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Deconfliction badges */}
                        {op.deconflictions.length > 0 && (
                          <div className="flex gap-1">
                            {op.deconflictions.map((d, i) => {
                              const rc = resolutionConfig[d.resolution];
                              return (
                                <span key={i} className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', rc.bg, rc.text)}>
                                  {rc.label}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Conformance */}
                        {(op.state === 'activated' || op.state === 'nonconforming' || op.state === 'rogue') && (
                          <div className={clsx('flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                            op.conformanceMonitoring.withinVolume ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          )}>
                            {op.conformanceMonitoring.withinVolume ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                            {op.conformanceMonitoring.withinVolume ? 'In Volume' : 'Out of Volume'}
                          </div>
                        )}

                        {/* Actions */}
                        {op.state === 'accepted' && (
                          <button className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">Activate</button>
                        )}
                        {(op.state === 'activated' || op.state === 'nonconforming') && (
                          <button className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">Close</button>
                        )}
                        {(op.state === 'proposed' || op.state === 'accepted') && (
                          <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Cancel</button>
                        )}

                        <button onClick={() => setExpandedOp(isExpanded ? null : op.id)} className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Volumes */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Operational Volumes ({op.volumes.length})</h4>
                          <div className="space-y-2">
                            {op.volumes.map((v, i) => (
                              <div key={i} className="rounded-lg border bg-white p-3 text-xs">
                                <div className="flex items-center gap-2 mb-1">
                                  <Map size={12} className="text-blue-500" />
                                  <span className="font-medium text-gray-700">Volume {i + 1} — {v.geography.type}</span>
                                </div>
                                <p className="text-gray-500">Alt: {v.altitude.min}–{v.altitude.max} ft {v.altitude.datum}</p>
                                <p className="text-gray-500">Time: {formatTime(v.timeStart)} — {formatTime(v.timeEnd)}</p>
                                {v.geography.type === 'circle' && v.geography.radius && (
                                  <p className="text-gray-500">Radius: {v.geography.radius}m</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Conformance */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conformance Monitoring</h4>
                          <div className="rounded-lg border bg-white p-3 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Within Volume</span>
                              <span className={clsx('font-medium', op.conformanceMonitoring.withinVolume ? 'text-green-600' : 'text-red-600')}>
                                {op.conformanceMonitoring.withinVolume ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Position Accuracy</span>
                              <span className="font-medium text-gray-700">{op.conformanceMonitoring.positionAccuracy}m</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Altitude Accuracy</span>
                              <span className="font-medium text-gray-700">{op.conformanceMonitoring.altitudeAccuracy}m</span>
                            </div>
                            {op.conformanceMonitoring.lastPosition.timestamp && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">Last Update</span>
                                <span className="font-medium text-gray-700">{formatTime(op.conformanceMonitoring.lastPosition.timestamp)}</span>
                              </div>
                            )}
                            {op.conformanceMonitoring.alerts.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="font-semibold text-red-600">Alerts:</p>
                                {op.conformanceMonitoring.alerts.map((alert, i) => (
                                  <div key={i} className="flex items-center gap-1 text-red-600">
                                    <AlertTriangle size={10} />
                                    <span>{alert}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Deconfliction & Contingency */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deconfliction Details</h4>
                            {op.deconflictions.length === 0 ? (
                              <p className="text-xs text-gray-400">No deconfliction checks performed</p>
                            ) : (
                              <div className="space-y-2">
                                {op.deconflictions.map((d, i) => {
                                  const rc = resolutionConfig[d.resolution];
                                  return (
                                    <div key={i} className="rounded-lg border bg-white p-3 text-xs">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-700">{d.operationId}</span>
                                        <span className={clsx('rounded-full px-2 py-0.5 font-medium', rc.bg, rc.text)}>{rc.label}</span>
                                      </div>
                                      <p className="text-gray-500">{d.type === 'strategic' ? 'Strategic' : 'Tactical'} — {d.details}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contingency Plan</h4>
                            <div className="rounded-lg border bg-white p-3 text-xs space-y-1">
                              <div className="flex items-center gap-1 text-gray-500">
                                <MapPin size={12} className="text-red-400" />
                                <span>Landing: {op.contingency.landingPoint.lat.toFixed(4)}, {op.contingency.landingPoint.lng.toFixed(4)}</span>
                              </div>
                              <p className="text-gray-500">Safe Alt: {op.contingency.safeAltitude} ft</p>
                              <p className="text-gray-600">{op.contingency.procedure}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timeline</h4>
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={12} /> Submitted: {formatTime(op.submitTime)}</span>
                          <ArrowRight size={12} className="text-gray-300" />
                          <span className="flex items-center gap-1"><RefreshCw size={12} /> Updated: {formatTime(op.updateTime)}</span>
                          <ArrowRight size={12} className="text-gray-300" />
                          <span className="flex items-center gap-1"><Signal size={12} /> Remote ID: {op.remoteIdTracking}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOps.length === 0 && (
              <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
                <Navigation size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No operations match your filters</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════ CONSTRAINTS TAB ═══════════════ */}
      {activeTab === 'constraints' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap items-center">
              <Filter size={14} className="text-gray-400" />
              <select value={constraintTypeFilter} onChange={(e) => setConstraintTypeFilter(e.target.value as ConstraintType | 'all')} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Types</option>
                {Object.entries(constraintTypeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={constraintSeverityFilter} onChange={(e) => setConstraintSeverityFilter(e.target.value as Severity | 'all')} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Severity</option>
                {Object.entries(severityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          {/* Constraints List */}
          <div className="space-y-3">
            {filteredConstraints.map((c) => {
              const tc = constraintTypeConfig[c.type];
              const svc = severityConfig[c.severity];
              return (
                <div key={c.id} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Shield size={18} className={clsx(
                        c.severity === 'prohibition' ? 'text-red-500' : c.severity === 'restriction' ? 'text-orange-500' : 'text-blue-500'
                      )} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tc.bg, tc.text)}>{tc.label}</span>
                          <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', svc.bg, svc.text)}>{svc.label}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">{c.description}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1"><Layers size={12} /> {c.altitude.min}–{c.altitude.max} ft</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(c.timeStart)} — {formatTime(c.timeEnd)}</span>
                          <span className="flex items-center gap-1"><Eye size={12} /> {c.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                        c.geography.type === 'circle' ? 'bg-sky-50 text-sky-700' : 'bg-purple-50 text-purple-700'
                      )}>
                        <Map size={12} />
                        {c.geography.type === 'circle' ? `Circle ${c.geography.radius ? `${(c.geography.radius / 1000).toFixed(1)}km` : ''}` : 'Polygon'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Placeholder */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Map size={16} className="text-blue-500" /> Constraint Zones Map</h3>
            </div>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center">
              <div className="text-center">
                <Globe size={40} className="mx-auto text-blue-200 mb-2" />
                <p className="text-sm text-gray-400">Map visualization — connect Mapbox GL JS to render constraint zones</p>
                <p className="text-xs text-gray-300 mt-1">{filteredConstraints.length} active constraints</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════ NETWORK STATUS TAB ═══════════════ */}
      {activeTab === 'network' && (
        <>
          {/* USS Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockUSSProviders.map((uss) => (
              <div key={uss.name} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', uss.connected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')}>
                      <Wifi size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{uss.name}</p>
                      <p className={clsx('text-xs font-medium', uss.connected ? 'text-green-600' : 'text-red-600')}>
                        {uss.connected ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                  <div className={clsx('h-3 w-3 rounded-full', uss.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400')} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-gray-500">Latency</p>
                    <p className={clsx('font-semibold', uss.latency < 100 ? 'text-green-600' : uss.latency < 200 ? 'text-yellow-600' : 'text-red-600')}>
                      {uss.connected ? `${uss.latency}ms` : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-gray-500">Last Heartbeat</p>
                    <p className="font-semibold text-gray-700">{formatTimeShort(uss.lastHeartbeat)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-gray-500">Operations</p>
                    <p className="font-semibold text-gray-700">{uss.operationsCount}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <p className="text-gray-500">Error Rate</p>
                    <p className={clsx('font-semibold', uss.errorRate < 0.1 ? 'text-green-600' : uss.errorRate < 1 ? 'text-yellow-600' : 'text-red-600')}>
                      {uss.errorRate}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Exchange Metrics */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={16} className="text-blue-500" /> Data Exchange Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Provider</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Messages Sent</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Messages Received</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Avg Latency</th>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">Error Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUSSProviders.map((uss) => (
                    <tr key={uss.name} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{uss.name}</td>
                      <td className="px-4 py-3 text-gray-600">{uss.messagesOut.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{uss.messagesIn.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('font-medium', uss.latency < 100 ? 'text-green-600' : uss.latency < 200 ? 'text-yellow-600' : 'text-red-600')}>
                          {uss.connected ? `${uss.latency}ms` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('font-medium', uss.errorRate < 0.1 ? 'text-green-600' : uss.errorRate < 1 ? 'text-yellow-600' : 'text-red-600')}>
                          {uss.errorRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Health */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Server size={16} className="text-blue-500" /> System Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Server size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">API Gateway</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Database Cluster</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Radar size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Conformance Monitor</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Active — tracking {stats.activeOperations} ops</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
