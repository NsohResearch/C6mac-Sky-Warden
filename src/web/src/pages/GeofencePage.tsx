import { useState } from 'react';
import {
  Map, MapPin, Shield, ShieldAlert, ShieldCheck, AlertTriangle, Circle, Square,
  Hexagon, Target, Navigation, Plane, Crosshair, Lock, Unlock, Clock, Calendar,
  Plus, Edit, Trash2, Eye, EyeOff, Filter, Search, ChevronDown, ChevronUp,
  Check, X, ArrowLeft, Layers, Globe, AlertCircle, Bell,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Geofence, GeofenceAlert, GeofenceStats, GeofenceTemplate } from '../../../shared/types/geofence';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockGeofences: Geofence[] = [
  {
    id: 'GEO-001', tenantId: 'TNT-001', name: 'JFK Airport Buffer Zone', type: 'no_fly',
    geometry: { type: 'circle', center: { lat: 40.6413, lng: -73.7781 }, radius: 8000 },
    altitudeRestriction: { min: 0, max: 0, unit: 'feet' },
    status: 'active', enforcement: 'hard', action: 'prevent_takeoff', color: '#EF4444',
    createdBy: 'FAA UASFM', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
    appliesTo: 'all_drones', source: 'faa_uasfm',
    description: 'FAA-designated no-fly zone surrounding JFK International Airport. All UAS operations prohibited without LAANC authorization.',
    alerts: [],
  },
  {
    id: 'GEO-002', tenantId: 'TNT-001', name: 'Downtown Construction Site Alpha', type: 'operational_boundary',
    geometry: { type: 'polygon', coordinates: [{ lat: 40.7128, lng: -74.0060 }, { lat: 40.7138, lng: -74.0050 }, { lat: 40.7133, lng: -74.0040 }, { lat: 40.7123, lng: -74.0050 }] },
    altitudeRestriction: { min: 0, max: 200, unit: 'feet' },
    status: 'active', enforcement: 'soft', action: 'warn', color: '#F59E0B',
    createdBy: 'Mike Chen', createdAt: '2026-02-10T08:30:00Z', updatedAt: '2026-03-15T14:20:00Z',
    appliesTo: 'specific_drones', droneIds: ['DRN-001', 'DRN-004'],
    source: 'manual',
    description: 'Operational boundary for the downtown high-rise construction survey project. Drones DRN-001 and DRN-004 are authorized within this zone.',
    alerts: [],
  },
  {
    id: 'GEO-003', tenantId: 'TNT-001', name: 'MetLife Stadium TFR', type: 'temporary_restriction',
    geometry: { type: 'circle', center: { lat: 40.8128, lng: -74.0742 }, radius: 5556 },
    altitudeRestriction: { min: 0, max: 3000, unit: 'feet' },
    status: 'scheduled', enforcement: 'hard', action: 'return_to_home', color: '#DC2626',
    validFrom: '2026-03-22T17:00:00Z', validTo: '2026-03-22T23:59:00Z',
    createdBy: 'FAA TFR System', createdAt: '2026-03-18T12:00:00Z', updatedAt: '2026-03-18T12:00:00Z',
    appliesTo: 'all_drones', source: 'faa_tfr',
    description: 'Temporary Flight Restriction for NFL game at MetLife Stadium. 3 NM radius, surface to 3000 ft AGL.',
    alerts: [],
  },
  {
    id: 'GEO-004', tenantId: 'TNT-001', name: 'Central Park Landing Zone', type: 'landing_zone',
    geometry: { type: 'circle', center: { lat: 40.7829, lng: -73.9654 }, radius: 50 },
    status: 'active', enforcement: 'soft', action: 'warn', color: '#10B981',
    createdBy: 'Sarah Park', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-03-10T11:30:00Z',
    appliesTo: 'all_drones', source: 'manual',
    description: 'Designated emergency landing zone in Central Park. Pre-approved for emergency operations only.',
    alerts: [],
  },
  {
    id: 'GEO-005', tenantId: 'TNT-001', name: 'Pipeline Inspection Corridor B7', type: 'operational_boundary',
    geometry: { type: 'polygon', coordinates: [{ lat: 40.7500, lng: -74.0200 }, { lat: 40.7600, lng: -74.0100 }, { lat: 40.7610, lng: -74.0110 }, { lat: 40.7510, lng: -74.0210 }] },
    altitudeRestriction: { min: 50, max: 400, unit: 'feet' },
    status: 'active', enforcement: 'hard', action: 'hover', color: '#3B82F6',
    createdBy: 'James Wu', createdAt: '2026-02-28T07:00:00Z', updatedAt: '2026-03-19T16:45:00Z',
    appliesTo: 'specific_drones', droneIds: ['DRN-002', 'DRN-007'],
    source: 'manual',
    description: 'Pipeline inspection corridor for Borough 7 natural gas pipeline survey. Altitude restricted to 50-400ft AGL.',
    alerts: [],
  },
  {
    id: 'GEO-006', tenantId: 'TNT-001', name: 'Emergency Response Zone - Fire', type: 'emergency_zone',
    geometry: { type: 'circle', center: { lat: 40.7305, lng: -73.9925 }, radius: 1500 },
    altitudeRestriction: { min: 0, max: 400, unit: 'feet' },
    status: 'active', enforcement: 'hard', action: 'return_to_home', color: '#F97316',
    validFrom: '2026-03-20T06:00:00Z', validTo: '2026-03-21T18:00:00Z',
    createdBy: 'FDNY Dispatch', createdAt: '2026-03-20T06:00:00Z', updatedAt: '2026-03-20T06:00:00Z',
    appliesTo: 'all_drones', source: 'agency',
    description: 'Active emergency response zone due to building fire. All non-emergency UAS grounded. Emergency drones only.',
    alerts: [],
  },
  {
    id: 'GEO-007', tenantId: 'TNT-001', name: 'LaGuardia Altitude Cap', type: 'altitude_restricted',
    geometry: { type: 'circle', center: { lat: 40.7769, lng: -73.8740 }, radius: 6000 },
    altitudeRestriction: { min: 0, max: 100, unit: 'feet' },
    status: 'active', enforcement: 'hard', action: 'land', color: '#8B5CF6',
    createdBy: 'FAA UASFM', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
    appliesTo: 'all_drones', source: 'faa_uasfm',
    description: 'Altitude restriction near LaGuardia Airport. Max 100ft AGL with approved LAANC authorization.',
    alerts: [],
  },
  {
    id: 'GEO-008', tenantId: 'TNT-001', name: 'Agricultural Survey Zone East', type: 'custom',
    geometry: { type: 'polygon', coordinates: [{ lat: 40.8000, lng: -73.9500 }, { lat: 40.8100, lng: -73.9400 }, { lat: 40.8050, lng: -73.9350 }, { lat: 40.7950, lng: -73.9450 }] },
    altitudeRestriction: { min: 30, max: 250, unit: 'feet' },
    status: 'inactive', enforcement: 'soft', action: 'warn', color: '#84CC16',
    createdBy: 'Mike Chen', createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-02-20T08:15:00Z',
    appliesTo: 'specific_drones', droneIds: ['DRN-003'],
    source: 'manual',
    description: 'Agricultural survey zone for seasonal crop monitoring. Currently inactive until planting season.',
    alerts: [],
  },
  {
    id: 'GEO-009', tenantId: 'TNT-001', name: 'NOTAM: Drone Show Airspace', type: 'temporary_restriction',
    geometry: { type: 'circle', center: { lat: 40.6892, lng: -74.0445 }, radius: 2000 },
    altitudeRestriction: { min: 0, max: 500, unit: 'feet' },
    status: 'expired', enforcement: 'hard', action: 'prevent_takeoff', color: '#6B7280',
    validFrom: '2026-03-14T20:00:00Z', validTo: '2026-03-14T23:00:00Z',
    createdBy: 'FAA NOTAM', createdAt: '2026-03-10T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z',
    appliesTo: 'all_drones', source: 'notam',
    description: 'NOTAM for authorized drone light show near Statue of Liberty. All other UAS prohibited.',
    alerts: [],
  },
  {
    id: 'GEO-010', tenantId: 'TNT-001', name: 'Warehouse Perimeter Fence', type: 'operational_boundary',
    geometry: { type: 'polygon', coordinates: [{ lat: 40.7200, lng: -74.0000 }, { lat: 40.7210, lng: -73.9990 }, { lat: 40.7205, lng: -73.9980 }, { lat: 40.7195, lng: -73.9990 }] },
    altitudeRestriction: { min: 0, max: 150, unit: 'feet' },
    status: 'active', enforcement: 'hard', action: 'hover', color: '#06B6D4',
    createdBy: 'Sarah Park', createdAt: '2026-03-05T14:00:00Z', updatedAt: '2026-03-18T09:30:00Z',
    appliesTo: 'specific_drones', droneIds: ['DRN-004', 'DRN-008'],
    source: 'manual',
    description: 'Operational boundary for automated warehouse security patrol. Drones must remain within perimeter.',
    alerts: [],
  },
];

const mockAlerts: GeofenceAlert[] = [
  { id: 'ALT-001', geofenceId: 'GEO-001', geofenceName: 'JFK Airport Buffer Zone', droneId: 'DRN-003', droneName: 'EVO II Pro #1', type: 'approaching', severity: 'warning', distance: 450, timestamp: '2026-03-20T14:23:00Z', actionTaken: 'Warning issued to pilot', acknowledged: false, position: { lat: 40.6500, lng: -73.7900, altitude: 180 } },
  { id: 'ALT-002', geofenceId: 'GEO-006', geofenceName: 'Emergency Response Zone - Fire', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', type: 'entered', severity: 'critical', distance: 0, timestamp: '2026-03-20T13:45:00Z', actionTaken: 'Auto RTH initiated', acknowledged: false, position: { lat: 40.7310, lng: -73.9930, altitude: 120 } },
  { id: 'ALT-003', geofenceId: 'GEO-007', geofenceName: 'LaGuardia Altitude Cap', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', type: 'altitude_violation', severity: 'critical', distance: 0, timestamp: '2026-03-20T12:10:00Z', actionTaken: 'Auto-land triggered at 105ft', acknowledged: true, position: { lat: 40.7780, lng: -73.8750, altitude: 105 } },
  { id: 'ALT-004', geofenceId: 'GEO-005', geofenceName: 'Pipeline Inspection Corridor B7', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'exited', severity: 'warning', distance: 25, timestamp: '2026-03-20T11:30:00Z', actionTaken: 'Hover engaged, pilot notified', acknowledged: true, position: { lat: 40.7615, lng: -74.0095, altitude: 200 } },
  { id: 'ALT-005', geofenceId: 'GEO-002', geofenceName: 'Downtown Construction Site Alpha', droneId: 'DRN-004', droneName: 'Skydio X10', type: 'approaching', severity: 'info', distance: 200, timestamp: '2026-03-20T10:55:00Z', actionTaken: 'Info notification sent', acknowledged: true, position: { lat: 40.7125, lng: -74.0065, altitude: 80 } },
  { id: 'ALT-006', geofenceId: 'GEO-010', geofenceName: 'Warehouse Perimeter Fence', droneId: 'DRN-008', droneName: 'M30T Enterprise', type: 'breach', severity: 'critical', distance: 0, timestamp: '2026-03-20T09:20:00Z', actionTaken: 'Hover engaged, supervisor alerted', acknowledged: false, position: { lat: 40.7215, lng: -73.9975, altitude: 45 } },
  { id: 'ALT-007', geofenceId: 'GEO-001', geofenceName: 'JFK Airport Buffer Zone', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', type: 'approaching', severity: 'warning', distance: 800, timestamp: '2026-03-20T08:40:00Z', actionTaken: 'Warning issued to pilot', acknowledged: true, position: { lat: 40.6350, lng: -73.7850, altitude: 150 } },
  { id: 'ALT-008', geofenceId: 'GEO-006', geofenceName: 'Emergency Response Zone - Fire', droneId: 'DRN-004', droneName: 'Skydio X10', type: 'entered', severity: 'critical', distance: 0, timestamp: '2026-03-20T07:15:00Z', actionTaken: 'Auto RTH initiated', acknowledged: true, position: { lat: 40.7300, lng: -73.9920, altitude: 90 } },
  { id: 'ALT-009', geofenceId: 'GEO-005', geofenceName: 'Pipeline Inspection Corridor B7', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', type: 'approaching', severity: 'info', distance: 350, timestamp: '2026-03-19T16:30:00Z', actionTaken: 'Info notification sent', acknowledged: true, position: { lat: 40.7490, lng: -74.0210, altitude: 180 } },
  { id: 'ALT-010', geofenceId: 'GEO-007', geofenceName: 'LaGuardia Altitude Cap', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', type: 'altitude_violation', severity: 'critical', distance: 0, timestamp: '2026-03-19T14:50:00Z', actionTaken: 'Auto-land triggered at 115ft', acknowledged: true, position: { lat: 40.7775, lng: -73.8755, altitude: 115 } },
  { id: 'ALT-011', geofenceId: 'GEO-003', geofenceName: 'MetLife Stadium TFR', droneId: 'DRN-003', droneName: 'EVO II Pro #1', type: 'approaching', severity: 'warning', distance: 600, timestamp: '2026-03-19T12:00:00Z', actionTaken: 'TFR warning displayed', acknowledged: true, position: { lat: 40.8180, lng: -74.0700, altitude: 200 } },
  { id: 'ALT-012', geofenceId: 'GEO-010', geofenceName: 'Warehouse Perimeter Fence', droneId: 'DRN-004', droneName: 'Skydio X10', type: 'exited', severity: 'warning', distance: 15, timestamp: '2026-03-19T09:10:00Z', actionTaken: 'Hover engaged, pilot notified', acknowledged: true, position: { lat: 40.7212, lng: -73.9978, altitude: 30 } },
];

const mockTemplates: GeofenceTemplate[] = [
  { id: 'TPL-001', name: 'Airport Buffer Zone', description: 'FAA-compliant buffer zone for airports. Enforces no-fly with prevent takeoff action.', type: 'no_fly', defaultAltitude: { min: 0, max: 0 }, defaultEnforcement: 'hard', defaultAction: 'prevent_takeoff', icon: 'Plane' },
  { id: 'TPL-002', name: 'Stadium TFR', description: 'Temporary flight restriction for stadium events. 3 NM radius, auto-RTH on breach.', type: 'temporary_restriction', defaultAltitude: { min: 0, max: 3000 }, defaultEnforcement: 'hard', defaultAction: 'return_to_home', icon: 'Hexagon' },
  { id: 'TPL-003', name: 'Construction Site', description: 'Operational boundary for construction site surveys with altitude caps.', type: 'operational_boundary', defaultAltitude: { min: 0, max: 400 }, defaultEnforcement: 'soft', defaultAction: 'warn', icon: 'Square' },
  { id: 'TPL-004', name: 'Agricultural Boundary', description: 'Precision agriculture survey zone with low-altitude restrictions.', type: 'custom', defaultAltitude: { min: 20, max: 250 }, defaultEnforcement: 'soft', defaultAction: 'warn', icon: 'Globe' },
  { id: 'TPL-005', name: 'Emergency Response Zone', description: 'Emergency exclusion zone for fire, hazmat, or disaster response.', type: 'emergency_zone', defaultAltitude: { min: 0, max: 400 }, defaultEnforcement: 'hard', defaultAction: 'return_to_home', icon: 'ShieldAlert' },
  { id: 'TPL-006', name: 'Pipeline Inspection Corridor', description: 'Narrow corridor for linear infrastructure inspection with strict boundary enforcement.', type: 'operational_boundary', defaultAltitude: { min: 50, max: 400 }, defaultEnforcement: 'hard', defaultAction: 'hover', icon: 'Navigation' },
];

const mockStats: GeofenceStats = {
  totalGeofences: mockGeofences.length,
  activeGeofences: mockGeofences.filter((g) => g.status === 'active').length,
  alertsToday: mockAlerts.filter((a) => a.timestamp.startsWith('2026-03-20')).length,
  breachesToday: mockAlerts.filter((a) => a.timestamp.startsWith('2026-03-20') && (a.type === 'breach' || a.type === 'entered')).length,
  dronesInRestrictedAreas: 2,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

type TabId = 'geofences' | 'alerts' | 'templates';
type TypeFilter = 'all' | Geofence['type'];
type StatusFilter = 'all' | Geofence['status'];
type EnforcementFilter = 'all' | Geofence['enforcement'];
type SourceFilter = 'all' | Geofence['source'];
type AlertSeverityFilter = 'all' | GeofenceAlert['severity'];
type AlertTypeFilter = 'all' | GeofenceAlert['type'];

const typeLabels: Record<Geofence['type'], string> = {
  no_fly: 'No-Fly Zone',
  altitude_restricted: 'Altitude Restricted',
  operational_boundary: 'Operational Boundary',
  landing_zone: 'Landing Zone',
  emergency_zone: 'Emergency Zone',
  temporary_restriction: 'Temporary Restriction',
  custom: 'Custom',
};

const typeColors: Record<Geofence['type'], { bg: string; text: string }> = {
  no_fly: { bg: 'bg-red-100', text: 'text-red-700' },
  altitude_restricted: { bg: 'bg-purple-100', text: 'text-purple-700' },
  operational_boundary: { bg: 'bg-blue-100', text: 'text-blue-700' },
  landing_zone: { bg: 'bg-green-100', text: 'text-green-700' },
  emergency_zone: { bg: 'bg-orange-100', text: 'text-orange-700' },
  temporary_restriction: { bg: 'bg-amber-100', text: 'text-amber-700' },
  custom: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const statusColors: Record<Geofence['status'], { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  inactive: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  expired: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
};

const severityColors: Record<GeofenceAlert['severity'], { bg: string; text: string; dot: string }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const alertTypeLabels: Record<GeofenceAlert['type'], string> = {
  approaching: 'Approaching',
  entered: 'Entered',
  exited: 'Exited',
  breach: 'Breach',
  altitude_violation: 'Altitude Violation',
};

const sourceLabels: Record<Geofence['source'], string> = {
  manual: 'Manual',
  faa_tfr: 'FAA TFR',
  faa_uasfm: 'FAA UASFM',
  notam: 'NOTAM',
  agency: 'Agency',
  imported: 'Imported',
};

const sourceColors: Record<Geofence['source'], { bg: string; text: string }> = {
  manual: { bg: 'bg-gray-100', text: 'text-gray-700' },
  faa_tfr: { bg: 'bg-red-50', text: 'text-red-700' },
  faa_uasfm: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  notam: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  agency: { bg: 'bg-teal-50', text: 'text-teal-700' },
  imported: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

const actionLabels: Record<Geofence['action'], string> = {
  warn: 'Warn Pilot',
  hover: 'Auto-Hover',
  return_to_home: 'Return to Home',
  land: 'Auto-Land',
  prevent_takeoff: 'Prevent Takeoff',
};

const presetColors = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

const templateIcons: Record<string, typeof Map> = {
  Plane, Hexagon, Square, Globe, ShieldAlert, Navigation,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

// ─── Legend colors for map ──────────────────────────────────────────────────────

const legendItems: Array<{ type: Geofence['type']; color: string }> = [
  { type: 'no_fly', color: '#EF4444' },
  { type: 'altitude_restricted', color: '#8B5CF6' },
  { type: 'operational_boundary', color: '#3B82F6' },
  { type: 'landing_zone', color: '#10B981' },
  { type: 'emergency_zone', color: '#F97316' },
  { type: 'temporary_restriction', color: '#F59E0B' },
  { type: 'custom', color: '#6B7280' },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export function GeofencePage() {
  const [activeTab, setActiveTab] = useState<TabId>('geofences');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [enforcementFilter, setEnforcementFilter] = useState<EnforcementFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [expandedGeofence, setExpandedGeofence] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Alert filters
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverityFilter>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<AlertTypeFilter>('all');
  const [alertGeofenceFilter, setAlertGeofenceFilter] = useState<string>('all');

  // Create/edit form state
  const [formData, setFormData] = useState({
    name: '', description: '', type: 'operational_boundary' as Geofence['type'],
    geometryType: 'circle' as 'polygon' | 'circle',
    centerLat: '', centerLng: '', radius: '',
    coordinates: '' ,
    altMin: '', altMax: '', altUnit: 'feet' as 'feet' | 'meters',
    enforcement: 'soft' as 'hard' | 'soft',
    action: 'warn' as Geofence['action'],
    color: '#3B82F6',
    validFrom: '', validTo: '',
    appliesTo: 'all_drones' as 'all_drones' | 'specific_drones',
    droneIds: '' ,
    source: 'manual' as Geofence['source'],
  });

  // ─── Filtering ──────────────────────────────────────────────────────────────

  const filteredGeofences = mockGeofences.filter((g) => {
    if (typeFilter !== 'all' && g.type !== typeFilter) return false;
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    if (enforcementFilter !== 'all' && g.enforcement !== enforcementFilter) return false;
    if (sourceFilter !== 'all' && g.source !== sourceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.id.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredAlerts = mockAlerts.filter((a) => {
    if (alertSeverityFilter !== 'all' && a.severity !== alertSeverityFilter) return false;
    if (alertTypeFilter !== 'all' && a.type !== alertTypeFilter) return false;
    if (alertGeofenceFilter !== 'all' && a.geofenceId !== alertGeofenceFilter) return false;
    return true;
  });

  // ─── Form handlers ─────────────────────────────────────────────────────────

  function openCreateForm(template?: GeofenceTemplate) {
    if (template) {
      setFormData({
        ...formData,
        name: '', description: template.description, type: template.type,
        altMin: template.defaultAltitude ? String(template.defaultAltitude.min) : '',
        altMax: template.defaultAltitude ? String(template.defaultAltitude.max) : '',
        enforcement: template.defaultEnforcement, action: template.defaultAction,
        source: 'manual',
      });
    } else {
      setFormData({
        name: '', description: '', type: 'operational_boundary', geometryType: 'circle',
        centerLat: '', centerLng: '', radius: '', coordinates: '',
        altMin: '', altMax: '', altUnit: 'feet', enforcement: 'soft', action: 'warn',
        color: '#3B82F6', validFrom: '', validTo: '', appliesTo: 'all_drones', droneIds: '', source: 'manual',
      });
    }
    setEditingGeofence(null);
    setShowCreateForm(true);
  }

  function openEditForm(geo: Geofence) {
    setFormData({
      name: geo.name, description: geo.description, type: geo.type,
      geometryType: geo.geometry.type,
      centerLat: geo.geometry.center ? String(geo.geometry.center.lat) : '',
      centerLng: geo.geometry.center ? String(geo.geometry.center.lng) : '',
      radius: geo.geometry.radius ? String(geo.geometry.radius) : '',
      coordinates: geo.geometry.coordinates ? geo.geometry.coordinates.map((c) => `${c.lat},${c.lng}`).join('\n') : '',
      altMin: geo.altitudeRestriction ? String(geo.altitudeRestriction.min) : '',
      altMax: geo.altitudeRestriction ? String(geo.altitudeRestriction.max) : '',
      altUnit: geo.altitudeRestriction?.unit ?? 'feet',
      enforcement: geo.enforcement, action: geo.action, color: geo.color,
      validFrom: geo.validFrom ?? '', validTo: geo.validTo ?? '',
      appliesTo: geo.appliesTo, droneIds: geo.droneIds?.join(', ') ?? '', source: geo.source,
    });
    setEditingGeofence(geo);
    setShowCreateForm(true);
  }

  // ─── Stats bar ──────────────────────────────────────────────────────────────

  const statsCards = [
    { label: 'Total Geofences', value: mockStats.totalGeofences, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: mockStats.activeGeofences, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Alerts Today', value: mockStats.alertsToday, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Breaches Today', value: mockStats.breachesToday, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Drones in Restricted', value: mockStats.dronesInRestrictedAreas, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  // ─── Tabs ───────────────────────────────────────────────────────────────────

  const tabs: Array<{ id: TabId; label: string; icon: typeof Map }> = [
    { id: 'geofences', label: 'Geofences', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'templates', label: 'Templates', icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geofence Management</h1>
          <p className="mt-1 text-sm text-gray-500">Define, manage, and monitor geofence boundaries for your drone fleet</p>
        </div>
        <button
          onClick={() => openCreateForm()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Geofence
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={clsx('rounded-lg p-2', stat.bg)}>
                  <Icon className={clsx('h-5 w-5', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'alerts' && (
                  <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    {mockAlerts.filter((a) => !a.acknowledged).length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Geofences Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'geofences' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Left panel: list + controls */}
          <div className="xl:col-span-3 space-y-4">
            {/* Search + Filter Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search geofences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  showFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            {/* Filter bar */}
            {showFilters && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                    <option value="all">All Types</option>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Enforcement</label>
                  <select value={enforcementFilter} onChange={(e) => setEnforcementFilter(e.target.value as EnforcementFilter)} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                    <option value="all">All</option>
                    <option value="hard">Hard</option>
                    <option value="soft">Soft</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Source</label>
                  <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as SourceFilter)} className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                    <option value="all">All Sources</option>
                    {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Results count */}
            <p className="text-xs text-gray-500">{filteredGeofences.length} geofence{filteredGeofences.length !== 1 ? 's' : ''} found</p>

            {/* Geofence list */}
            <div className="space-y-3">
              {filteredGeofences.map((geo) => {
                const isExpanded = expandedGeofence === geo.id;
                const geoAlerts = mockAlerts.filter((a) => a.geofenceId === geo.id);
                const tc = typeColors[geo.type];
                const sc = statusColors[geo.status];

                return (
                  <div key={geo.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex">
                      {/* Color strip */}
                      <div className="w-1.5 shrink-0" style={{ backgroundColor: geo.color }} />

                      <div className="flex-1 p-4">
                        {/* Top row: name + badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{geo.name}</h3>
                              <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tc.bg, tc.text)}>
                                {typeLabels[geo.type]}
                              </span>
                              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', sc.bg, sc.text)}>
                                <span className={clsx('h-1.5 w-1.5 rounded-full', sc.dot)} />
                                {geo.status.charAt(0).toUpperCase() + geo.status.slice(1)}
                              </span>
                            </div>

                            {/* Meta row */}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                {geo.enforcement === 'hard' ? <Lock className="h-3 w-3 text-red-500" /> : <Unlock className="h-3 w-3 text-amber-500" />}
                                {geo.enforcement === 'hard' ? 'Hard Enforcement' : 'Soft Enforcement'}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {actionLabels[geo.action]}
                              </span>
                              {geo.altitudeRestriction && (
                                <span className="inline-flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {geo.altitudeRestriction.min}-{geo.altitudeRestriction.max} {geo.altitudeRestriction.unit}
                                </span>
                              )}
                              <span className={clsx('inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium', sourceColors[geo.source].bg, sourceColors[geo.source].text)}>
                                {sourceLabels[geo.source]}
                              </span>
                            </div>

                            {/* Schedule row */}
                            {(geo.validFrom || geo.validTo) && (
                              <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {geo.validFrom && <span>From: {formatDateTime(geo.validFrom)}</span>}
                                {geo.validTo && <span>To: {formatDateTime(geo.validTo)}</span>}
                              </div>
                            )}

                            {/* Drone assignment */}
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                              <Crosshair className="h-3 w-3" />
                              {geo.appliesTo === 'all_drones' ? 'Applies to all drones' : `Assigned: ${geo.droneIds?.join(', ')}`}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => openEditForm(geo)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                              title={geo.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {geo.status === 'active' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setExpandedGeofence(isExpanded ? null : geo.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                            <div>
                              <h4 className="text-xs font-medium text-gray-600 mb-1">Description</h4>
                              <p className="text-sm text-gray-700">{geo.description}</p>
                            </div>

                            <div>
                              <h4 className="text-xs font-medium text-gray-600 mb-1">Geometry</h4>
                              <div className="text-sm text-gray-700">
                                {geo.geometry.type === 'circle' ? (
                                  <span>Circle - Center: {geo.geometry.center?.lat.toFixed(4)}, {geo.geometry.center?.lng.toFixed(4)} | Radius: {geo.geometry.radius}m</span>
                                ) : (
                                  <span>Polygon - {geo.geometry.coordinates?.length} vertices</span>
                                )}
                              </div>
                            </div>

                            {geoAlerts.length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-gray-600 mb-2">Recent Alerts ({geoAlerts.length})</h4>
                                <div className="space-y-1.5">
                                  {geoAlerts.slice(0, 3).map((alert) => {
                                    const sev = severityColors[alert.severity];
                                    return (
                                      <div key={alert.id} className={clsx('flex items-center justify-between rounded-lg px-3 py-2 text-xs', sev.bg)}>
                                        <div className="flex items-center gap-2">
                                          <span className={clsx('h-1.5 w-1.5 rounded-full', sev.dot)} />
                                          <span className={sev.text}>{alertTypeLabels[alert.type]}</span>
                                          <span className="text-gray-500">{alert.droneName}</span>
                                        </div>
                                        <span className="text-gray-400">{formatTime(alert.timestamp)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>Created: {formatDate(geo.createdAt)}</span>
                              <span>Updated: {formatDate(geo.updatedAt)}</span>
                              <span>By: {geo.createdBy}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredGeofences.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <Map className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-600">No geofences found</p>
                  <p className="mt-1 text-xs text-gray-400">Try adjusting your filters or create a new geofence</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Map placeholder + legend */}
          <div className="xl:col-span-2 space-y-4">
            {/* Map placeholder */}
            <div className="rounded-xl border border-gray-200 bg-gray-900 shadow-sm overflow-hidden">
              <div className="relative flex h-[500px] items-center justify-center">
                <div className="text-center">
                  <Globe className="mx-auto h-12 w-12 text-gray-600" />
                  <p className="mt-3 text-sm font-medium text-gray-400">Geofence Map</p>
                  <p className="mt-1 text-xs text-gray-500">Mapbox GL integration point</p>
                </div>

                {/* Mock geofence shapes */}
                {mockGeofences.filter((g) => g.status === 'active').slice(0, 5).map((geo, i) => {
                  const positions = [
                    { top: '15%', left: '20%' },
                    { top: '35%', left: '60%' },
                    { top: '55%', left: '30%' },
                    { top: '25%', left: '75%' },
                    { top: '70%', left: '55%' },
                  ];
                  const pos = positions[i];
                  return (
                    <div
                      key={geo.id}
                      className="absolute flex flex-col items-center"
                      style={{ top: pos.top, left: pos.left }}
                    >
                      <div
                        className="rounded-full border-2 opacity-40"
                        style={{
                          borderColor: geo.color,
                          backgroundColor: `${geo.color}20`,
                          width: geo.geometry.type === 'circle' ? '60px' : '50px',
                          height: geo.geometry.type === 'circle' ? '60px' : '50px',
                          borderRadius: geo.geometry.type === 'polygon' ? '4px' : '50%',
                        }}
                      />
                      <span className="mt-1 rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-300 whitespace-nowrap">
                        {geo.name.length > 20 ? geo.name.slice(0, 20) + '...' : geo.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Geofence Type Legend</h3>
              <div className="grid grid-cols-2 gap-2">
                {legendItems.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600 truncate">{typeLabels[item.type]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Alerts Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Alert filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Severity</label>
              <select value={alertSeverityFilter} onChange={(e) => setAlertSeverityFilter(e.target.value as AlertSeverityFilter)} className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Alert Type</label>
              <select value={alertTypeFilter} onChange={(e) => setAlertTypeFilter(e.target.value as AlertTypeFilter)} className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                <option value="all">All Types</option>
                {Object.entries(alertTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Geofence</label>
              <select value={alertGeofenceFilter} onChange={(e) => setAlertGeofenceFilter(e.target.value)} className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none">
                <option value="all">All Geofences</option>
                {mockGeofences.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>

          {/* Alerts table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Timestamp</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Drone</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Geofence</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Severity</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Distance</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Action Taken</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAlerts.map((alert) => {
                    const sev = severityColors[alert.severity];
                    return (
                      <tr key={alert.id} className={clsx('transition-colors', !alert.acknowledged && 'bg-red-50/30')}>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{formatDateTime(alert.timestamp)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{alert.droneName}</span>
                          <span className="ml-1 text-xs text-gray-400">{alert.droneId}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{alert.geofenceName}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {alertTypeLabels[alert.type]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', sev.bg, sev.text)}>
                            <span className={clsx('h-1.5 w-1.5 rounded-full', sev.dot)} />
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {alert.distance > 0 ? `${alert.distance}m` : '--'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">{alert.actionTaken}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {alert.acknowledged ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <Check className="h-3.5 w-3.5" />
                              Acknowledged
                            </span>
                          ) : (
                            <button className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors">
                              <Bell className="h-3 w-3" />
                              Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredAlerts.length === 0 && (
              <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-600">No alerts found</p>
                <p className="mt-1 text-xs text-gray-400">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Templates Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quick-Create from Templates</h2>
            <p className="text-sm text-gray-500">Select a template to pre-fill geofence settings and get started quickly</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockTemplates.map((tpl) => {
              const Icon = templateIcons[tpl.icon] ?? Map;
              const tc = typeColors[tpl.type];
              return (
                <div key={tpl.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className={clsx('rounded-lg p-2.5', tc.bg)}>
                      <Icon className={clsx('h-5 w-5', tc.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{tpl.name}</h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{tpl.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tc.bg, tc.text)}>
                          {typeLabels[tpl.type]}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {tpl.defaultEnforcement === 'hard' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          {tpl.defaultEnforcement === 'hard' ? 'Hard' : 'Soft'}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {actionLabels[tpl.defaultAction]}
                        </span>
                      </div>
                      {tpl.defaultAltitude && (
                        <p className="mt-2 text-xs text-gray-400">Alt: {tpl.defaultAltitude.min}-{tpl.defaultAltitude.max} ft</p>
                      )}
                      <button
                        onClick={() => openCreateForm(tpl)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────────────────────────────────────────── */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-20">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowCreateForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">{editingGeofence ? 'Edit Geofence' : 'Create Geofence'}</h2>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
              {/* Name & Description */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Airport Buffer Zone"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the purpose of this geofence..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type selector */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Geofence Type</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(Object.entries(typeLabels) as Array<[Geofence['type'], string]>).map(([key, label]) => {
                    const tc = typeColors[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, type: key })}
                        className={clsx(
                          'rounded-lg border px-3 py-2 text-xs font-medium transition-colors text-left',
                          formData.type === key
                            ? `border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-300`
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Geometry */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Geometry</label>
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => setFormData({ ...formData, geometryType: 'circle' })}
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      formData.geometryType === 'circle' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <Circle className="h-4 w-4" />
                    Circle
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, geometryType: 'polygon' })}
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      formData.geometryType === 'polygon' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <Hexagon className="h-4 w-4" />
                    Polygon
                  </button>
                </div>
                {formData.geometryType === 'circle' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Center Lat</label>
                      <input type="text" value={formData.centerLat} onChange={(e) => setFormData({ ...formData, centerLat: e.target.value })} placeholder="40.7128" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Center Lng</label>
                      <input type="text" value={formData.centerLng} onChange={(e) => setFormData({ ...formData, centerLng: e.target.value })} placeholder="-74.0060" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Radius (m)</label>
                      <input type="text" value={formData.radius} onChange={(e) => setFormData({ ...formData, radius: e.target.value })} placeholder="5000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Coordinates (lat,lng per line)</label>
                    <textarea
                      value={formData.coordinates} onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                      placeholder={"40.7128,-74.0060\n40.7138,-74.0050\n40.7133,-74.0040"}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Altitude restrictions */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Altitude Restrictions</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Min</label>
                    <input type="text" value={formData.altMin} onChange={(e) => setFormData({ ...formData, altMin: e.target.value })} placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Max</label>
                    <input type="text" value={formData.altMax} onChange={(e) => setFormData({ ...formData, altMax: e.target.value })} placeholder="400" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Unit</label>
                    <select value={formData.altUnit} onChange={(e) => setFormData({ ...formData, altUnit: e.target.value as 'feet' | 'meters' })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                      <option value="feet">Feet</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Enforcement + Action */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Enforcement Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, enforcement: 'hard' })}
                      className={clsx(
                        'flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                        formData.enforcement === 'hard' ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <Lock className="h-4 w-4" />
                      Hard
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, enforcement: 'soft' })}
                      className={clsx(
                        'flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                        formData.enforcement === 'soft' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <Unlock className="h-4 w-4" />
                      Soft
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.enforcement === 'hard' ? 'Auto-enforced: drone will execute action automatically' : 'Warning only: pilot receives notification but retains control'}
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Action on Breach</label>
                  <select value={formData.action} onChange={(e) => setFormData({ ...formData, action: e.target.value as Geofence['action'] })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Color</label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={clsx(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-200',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Valid From (optional)</label>
                  <input type="datetime-local" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Valid To (optional)</label>
                  <input type="datetime-local" value={formData.validTo} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* Drone assignment */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Drone Assignment</label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setFormData({ ...formData, appliesTo: 'all_drones' })}
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      formData.appliesTo === 'all_drones' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <Globe className="h-4 w-4" />
                    All Drones
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, appliesTo: 'specific_drones' })}
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      formData.appliesTo === 'specific_drones' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <Crosshair className="h-4 w-4" />
                    Specific Drones
                  </button>
                </div>
                {formData.appliesTo === 'specific_drones' && (
                  <input
                    type="text" value={formData.droneIds} onChange={(e) => setFormData({ ...formData, droneIds: e.target.value })}
                    placeholder="DRN-001, DRN-002, DRN-004"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Source */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Source</label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', sourceColors[formData.source].bg, sourceColors[formData.source].text)}>
                    {sourceLabels[formData.source]}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                {editingGeofence ? 'Save Changes' : 'Create Geofence'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
