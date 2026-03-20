import type { UUID, ISOTimestamp, GeoJSONPolygon, GeoJSONFeatureCollection, Altitude, Coordinates, BoundingBox } from './common';

// ─── Airspace Classification (FAA) ───

export type AirspaceClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'G';

export type AirspaceRestrictionType =
  | 'prohibited'
  | 'restricted'
  | 'warning'
  | 'alert'
  | 'moa'           // Military Operations Area
  | 'tfr'           // Temporary Flight Restriction
  | 'sua'           // Special Use Airspace
  | 'national_park'
  | 'stadium'
  | 'critical_infrastructure'
  | 'dc_sfra'       // Washington DC Special Flight Rules Area
  | 'fria'          // FAA-Recognized Identification Area
  | 'custom';       // Agency-defined

// ─── UAS Facility Map (UASFM) ───

export interface UasFacilityMapGrid {
  id: UUID;
  facilityId: string;
  airportCode: string;
  airspaceClass: AirspaceClass;
  geometry: GeoJSONPolygon;
  maxAltitudeFt: number;       // 0-400 in 50ft increments
  ceilingFt: number;
  floorFt: number;
  laancEnabled: boolean;
  effectiveDate: ISOTimestamp;
  expirationDate: ISOTimestamp;
  chartCycle: string;          // 56-day cycle identifier
  lastUpdated: ISOTimestamp;
}

// ─── Temporary Flight Restrictions ───

export type TfrType =
  | 'security'
  | 'vip'
  | 'hazard'
  | 'special_event'
  | 'space_operations'
  | 'emergency'
  | 'other';

export interface TemporaryFlightRestriction {
  id: UUID;
  notamNumber: string;
  type: TfrType;
  description: string;
  geometry: GeoJSONPolygon;
  center?: Coordinates;
  radiusNm?: number;
  floorAltitude: Altitude;
  ceilingAltitude: Altitude;
  effectiveStart: ISOTimestamp;
  effectiveEnd: ISOTimestamp;
  issuedAt: ISOTimestamp;
  facilityId?: string;
  restrictions: string;
  source: 'faa' | 'notam' | 'agency';
  active: boolean;
}

// ─── NOTAM ───

export interface Notam {
  id: UUID;
  notamId: string;
  type: 'D' | 'FDC' | 'GPS' | 'POINTER' | 'SAA' | 'UAS';
  facilityId: string;
  location: string;
  effectiveStart: ISOTimestamp;
  effectiveEnd: ISOTimestamp;
  text: string;
  classification: 'obstacle' | 'airspace' | 'procedure' | 'communication' | 'other';
  geometry?: GeoJSONPolygon;
  affectsUas: boolean;
}

// ─── Airspace Query & Response ───

export interface AirspaceCheckRequest {
  location: Coordinates;
  radius?: number;
  altitude?: Altitude;
  startTime?: ISOTimestamp;
  endTime?: ISOTimestamp;
  boundingBox?: BoundingBox;
}

export type FlightAdvisoryLevel = 'clear' | 'caution' | 'warning' | 'restricted' | 'prohibited';

export interface AirspaceCheckResponse {
  advisoryLevel: FlightAdvisoryLevel;
  canFly: boolean;
  requiresAuthorization: boolean;
  laancAvailable: boolean;
  maxAltitudeFt: number | null;
  airspaceClass: AirspaceClass | null;
  nearestAirport?: {
    code: string;
    name: string;
    distanceNm: number;
  };
  advisories: AirspaceAdvisory[];
  restrictions: AirspaceRestriction[];
  facilities: UasFacilityMapGrid[];
  tfrs: TemporaryFlightRestriction[];
  notams: Notam[];
  timestamp: ISOTimestamp;
}

export interface AirspaceAdvisory {
  id: UUID;
  type: AirspaceRestrictionType;
  severity: FlightAdvisoryLevel;
  title: string;
  description: string;
  geometry?: GeoJSONPolygon;
  altitude?: { floor: Altitude; ceiling: Altitude };
  effectiveStart?: ISOTimestamp;
  effectiveEnd?: ISOTimestamp;
  source: string;
}

export interface AirspaceRestriction {
  id: UUID;
  type: AirspaceRestrictionType;
  name: string;
  description: string;
  geometry: GeoJSONPolygon;
  altitude: { floor: Altitude; ceiling: Altitude };
  permanent: boolean;
  effectiveStart?: ISOTimestamp;
  effectiveEnd?: ISOTimestamp;
  contactInfo?: string;
  waiverAvailable: boolean;
}

// ─── Agency-Defined Rules ───

export interface LocalAirspaceRule {
  id: UUID;
  agencyId: UUID;
  tenantId: UUID;
  name: string;
  description: string;
  ruleType: 'restriction' | 'requirement' | 'advisory' | 'geofence';
  geometry: GeoJSONPolygon;
  altitude?: { floor: Altitude; ceiling: Altitude };
  conditions: LocalRuleCondition[];
  effectiveStart: ISOTimestamp;
  effectiveEnd?: ISOTimestamp;
  daysOfWeek?: number[];
  timeOfDay?: { start: string; end: string };
  requiresPermit: boolean;
  permitUrl?: string;
  contactInfo?: string;
  published: boolean;
  approvedBy?: UUID;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface LocalRuleCondition {
  type: 'drone_weight' | 'drone_type' | 'operation_type' | 'time_of_day' | 'weather' | 'event' | 'custom';
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'between';
  value: unknown;
  description: string;
}

// ─── Geofence ───

export interface Geofence {
  id: UUID;
  tenantId: UUID;
  name: string;
  type: 'inclusion' | 'exclusion' | 'advisory';
  geometry: GeoJSONPolygon;
  altitude?: { floor: Altitude; ceiling: Altitude };
  action: 'block' | 'warn' | 'log';
  active: boolean;
  createdBy: UUID;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── Map Layer Types ───

export type MapLayerType =
  | 'uasfm'
  | 'airspace_class'
  | 'tfr'
  | 'notam'
  | 'sua'
  | 'airport'
  | 'heliport'
  | 'national_park'
  | 'stadium'
  | 'critical_infrastructure'
  | 'local_rule'
  | 'geofence'
  | 'fleet_position'
  | 'mission_area';

export interface MapLayer {
  id: string;
  type: MapLayerType;
  name: string;
  visible: boolean;
  opacity: number;
  data: GeoJSONFeatureCollection;
  style: Record<string, unknown>;
  refreshInterval?: number; // seconds
}
