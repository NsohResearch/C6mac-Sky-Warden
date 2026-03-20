import type { UUID, ISOTimestamp, GeoJSONPolygon, Coordinates, Altitude } from './common';

// ─── Mission Planning ───

export type MissionStatus =
  | 'draft'
  | 'planned'
  | 'preflight_check'
  | 'awaiting_authorization'
  | 'authorized'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'aborted'
  | 'cancelled';

export type MissionType =
  | 'mapping'
  | 'inspection'
  | 'survey'
  | 'photography'
  | 'videography'
  | 'delivery'
  | 'search_rescue'
  | 'law_enforcement'
  | 'agriculture'
  | 'construction'
  | 'utility'
  | 'environmental'
  | 'recreational'
  | 'training'
  | 'other';

export type OperationType = 'part_107' | 'recreational' | 'public_safety' | 'waiver';

export interface Mission {
  id: UUID;
  tenantId: UUID;
  fleetId?: UUID;
  name: string;
  description?: string;
  type: MissionType;
  operationType: OperationType;
  status: MissionStatus;

  // Crew
  pilotInCommandId: UUID;
  visualObserverIds: UUID[];
  crewMembers: MissionCrewMember[];

  // Aircraft
  droneId: UUID;
  backupDroneId?: UUID;

  // Location & Route
  operationArea: GeoJSONPolygon;
  takeoffLocation: Coordinates;
  landingLocation: Coordinates;
  waypoints: MissionWaypoint[];
  maxAltitude: Altitude;
  plannedAltitude: Altitude;

  // Timing
  scheduledStart: ISOTimestamp;
  scheduledEnd: ISOTimestamp;
  actualStart?: ISOTimestamp;
  actualEnd?: ISOTimestamp;
  timezone: string;

  // Authorization
  laancAuthorizationId?: UUID;
  laancStatus?: 'not_required' | 'pending' | 'approved' | 'denied' | 'expired';
  manualAuthorizationId?: string;
  waiverIds?: UUID[];

  // Pre-flight
  preflightChecklist: PreflightCheckItem[];
  preflightCompleted: boolean;
  preflightCompletedAt?: ISOTimestamp;
  preflightCompletedBy?: UUID;

  // Weather
  weatherCheck?: WeatherCheck;
  weatherApproved: boolean;

  // Risk Assessment
  riskScore?: number;
  riskFactors: RiskFactor[];
  riskMitigations: string[];

  // Post-flight
  flightLog?: FlightLog;
  incidents: MissionIncident[];
  notes?: string;
  attachments: string[];

  // Audit
  approvedBy?: UUID;
  approvedAt?: ISOTimestamp;
  createdBy: UUID;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface MissionCrewMember {
  userId: UUID;
  role: 'pic' | 'visual_observer' | 'payload_operator' | 'ground_crew';
  acknowledged: boolean;
  acknowledgedAt?: ISOTimestamp;
}

export interface MissionWaypoint {
  id: UUID;
  sequenceNumber: number;
  coordinates: Coordinates;
  altitude: Altitude;
  speed?: number;
  holdTimeSeconds?: number;
  action?: 'hover' | 'take_photo' | 'start_video' | 'stop_video' | 'custom';
  actionParams?: Record<string, unknown>;
}

// ─── Pre-flight Checklist ───

export interface PreflightCheckItem {
  id: string;
  category: 'aircraft' | 'battery' | 'control' | 'environment' | 'regulatory' | 'site';
  item: string;
  required: boolean;
  checked: boolean;
  checkedBy?: UUID;
  checkedAt?: ISOTimestamp;
  notes?: string;
}

export const DEFAULT_PREFLIGHT_CHECKLIST: Omit<PreflightCheckItem, 'checked' | 'checkedBy' | 'checkedAt'>[] = [
  // Aircraft
  { id: 'pf_01', category: 'aircraft', item: 'Visual inspection of airframe — no damage or loose parts', required: true },
  { id: 'pf_02', category: 'aircraft', item: 'Propellers secure and undamaged', required: true },
  { id: 'pf_03', category: 'aircraft', item: 'Landing gear secure', required: true },
  { id: 'pf_04', category: 'aircraft', item: 'Camera/payload secured', required: false },
  { id: 'pf_05', category: 'aircraft', item: 'Firmware up to date', required: false },
  // Battery
  { id: 'pf_06', category: 'battery', item: 'Battery fully charged', required: true },
  { id: 'pf_07', category: 'battery', item: 'Battery within cycle limits', required: true },
  { id: 'pf_08', category: 'battery', item: 'No battery swelling or damage', required: true },
  { id: 'pf_09', category: 'battery', item: 'Spare batteries available', required: false },
  // Control
  { id: 'pf_10', category: 'control', item: 'Controller powered and connected', required: true },
  { id: 'pf_11', category: 'control', item: 'Control inputs responsive', required: true },
  { id: 'pf_12', category: 'control', item: 'GPS lock acquired (min 6 satellites)', required: true },
  { id: 'pf_13', category: 'control', item: 'Return-to-home point set', required: true },
  { id: 'pf_14', category: 'control', item: 'Geofencing enabled', required: true },
  // Environment
  { id: 'pf_15', category: 'environment', item: 'Wind conditions within limits', required: true },
  { id: 'pf_16', category: 'environment', item: 'Visibility meets minimums', required: true },
  { id: 'pf_17', category: 'environment', item: 'No precipitation', required: true },
  { id: 'pf_18', category: 'environment', item: 'Temperature within operating range', required: true },
  // Regulatory
  { id: 'pf_19', category: 'regulatory', item: 'Airspace authorization obtained (if required)', required: true },
  { id: 'pf_20', category: 'regulatory', item: 'Remote ID active and broadcasting', required: true },
  { id: 'pf_21', category: 'regulatory', item: 'Registration current and visible on aircraft', required: true },
  { id: 'pf_22', category: 'regulatory', item: 'Pilot certification current', required: true },
  // Site
  { id: 'pf_23', category: 'site', item: 'Launch/landing area clear', required: true },
  { id: 'pf_24', category: 'site', item: 'Non-participants at safe distance', required: true },
  { id: 'pf_25', category: 'site', item: 'Visual observer briefed (if applicable)', required: false },
  { id: 'pf_26', category: 'site', item: 'Emergency procedures reviewed', required: true },
];

// ─── Weather ───

export interface WeatherCheck {
  timestamp: ISOTimestamp;
  location: Coordinates;
  temperature: number;
  humidity: number;
  windSpeedMph: number;
  windGustMph: number;
  windDirection: number;
  visibility: number;
  cloudCeilingFt: number;
  precipitation: 'none' | 'light_rain' | 'rain' | 'heavy_rain' | 'snow' | 'ice';
  kpIndex: number;
  metar?: string;
  taf?: string;
  flyable: boolean;
  warnings: string[];
  source: string;
}

// ─── Risk Assessment ───

export interface RiskFactor {
  category: 'airspace' | 'weather' | 'terrain' | 'population' | 'infrastructure' | 'equipment' | 'crew' | 'regulatory';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'unlikely' | 'possible' | 'likely' | 'certain';
  score: number;
  mitigation?: string;
}

// ─── Flight Log ───

export interface FlightLog {
  id: UUID;
  missionId: UUID;
  droneId: UUID;
  pilotId: UUID;
  tenantId: UUID;
  startTime: ISOTimestamp;
  endTime: ISOTimestamp;
  durationMinutes: number;
  maxAltitudeFt: number;
  maxSpeedMps: number;
  maxDistanceM: number;
  totalDistanceM: number;
  takeoffLocation: Coordinates;
  landingLocation: Coordinates;
  telemetryRecordCount: number;
  telemetryStorageUrl: string;
  batteryStartPercent: number;
  batteryEndPercent: number;
  remoteIdActive: boolean;
  incidents: MissionIncident[];
  postFlightNotes?: string;
  createdAt: ISOTimestamp;
}

// ─── Incidents ───

export type IncidentSeverity = 'near_miss' | 'minor' | 'major' | 'critical';

export interface MissionIncident {
  id: UUID;
  missionId: UUID;
  timestamp: ISOTimestamp;
  severity: IncidentSeverity;
  type: string;
  description: string;
  location?: Coordinates;
  altitude?: Altitude;
  actionTaken: string;
  reportedBy: UUID;
  nasrReportFiled: boolean;
  nasrReportId?: string;
  attachments: string[];
}
