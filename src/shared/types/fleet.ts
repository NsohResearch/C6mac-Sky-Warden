import type { UUID, ISOTimestamp, Coordinates, GeoJSONPoint } from './common';

// ─── Drone / UAS Models ───

export type DroneStatus =
  | 'active'
  | 'grounded'
  | 'maintenance'
  | 'in_flight'
  | 'returning'
  | 'charging'
  | 'decommissioned';

export type DroneCategory = 'category_1' | 'category_2' | 'category_3' | 'category_4';

export interface Drone {
  id: UUID;
  tenantId: UUID;
  serialNumber: string;
  manufacturer: string;
  model: string;
  nickname?: string;
  category: DroneCategory;
  weightGrams: number;
  maxAltitudeFt: number;
  maxRangeMeters: number;
  maxFlightTimeMinutes: number;
  maxSpeedMps: number;
  hasCamera: boolean;
  cameraSpecs?: CameraSpecs;
  sensors: string[];

  // FAA Registration
  faaRegistrationNumber: string;
  faaRegistrationExpiry: ISOTimestamp;
  registeredOwner: UUID;

  // Remote ID
  remoteIdType: 'standard' | 'broadcast_module' | 'none';
  remoteIdSerialNumber?: string;
  remoteIdDeclarationId?: string;
  remoteIdCompliant: boolean;

  // Operational
  status: DroneStatus;
  currentLocation?: GeoJSONPoint;
  homeLocation?: Coordinates;
  totalFlightHours: number;
  totalFlights: number;
  lastFlightAt?: ISOTimestamp;
  firmwareVersion?: string;

  // Maintenance
  nextMaintenanceDue?: ISOTimestamp;
  maintenanceIntervalHours: number;
  lastMaintenanceAt?: ISOTimestamp;

  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: ISOTimestamp;

  assignedPilotIds: UUID[];
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface CameraSpecs {
  resolution: string;
  sensorSize: string;
  fov: number;
  hasZoom: boolean;
  hasThermal: boolean;
  hasNightVision: boolean;
}

// ─── Drone Telemetry ───

export interface DroneTelemetry {
  droneId: UUID;
  timestamp: ISOTimestamp;
  position: GeoJSONPoint;
  altitudeFt: number;
  altitudeReference: 'AGL' | 'MSL';
  groundSpeedMps: number;
  headingDeg: number;
  verticalSpeedMps: number;
  batteryPercent: number;
  batteryVoltage: number;
  signalStrength: number;
  satelliteCount: number;
  homeDistanceM: number;
  windSpeedMps?: number;
  windDirection?: number;
  temperature?: number;
  motors: MotorTelemetry[];
  warnings: TelemetryWarning[];
}

export interface MotorTelemetry {
  motorId: number;
  rpm: number;
  temperature: number;
  currentAmps: number;
}

export type TelemetryWarningLevel = 'info' | 'warning' | 'critical';

export interface TelemetryWarning {
  code: string;
  level: TelemetryWarningLevel;
  message: string;
  timestamp: ISOTimestamp;
}

// ─── Remote ID ───

export interface RemoteIdBroadcast {
  id: UUID;
  droneId: UUID;
  sessionId: UUID;
  timestamp: ISOTimestamp;
  uasId: string;
  uasIdType: 'serial_number' | 'registration_id' | 'utm_assigned' | 'specific_session';
  operatorId: string;
  operatorLocation: Coordinates;
  uasLocation: Coordinates;
  altitudePressure: number;
  altitudeGeodetic: number;
  height: number;
  heightReference: 'takeoff' | 'ground';
  speedHorizontal: number;
  speedVertical: number;
  direction: number;
  emergencyStatus: 'none' | 'general' | 'medical' | 'low_fuel';
  broadcastMethod: 'wifi_nan' | 'bluetooth_legacy' | 'bluetooth_le' | 'network';
}

// ─── Fleet ───

export interface Fleet {
  id: UUID;
  tenantId: UUID;
  name: string;
  description?: string;
  droneIds: UUID[];
  pilotIds: UUID[];
  managerIds: UUID[];
  homeBase?: Coordinates;
  operationalArea?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  status: 'active' | 'inactive';
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── Pilot ───

export interface PilotProfile {
  userId: UUID;
  tenantId: UUID;
  faaRegistrationNumber?: string;
  part107CertificateNumber?: string;
  part107ExpiresAt?: ISOTimestamp;
  part107Waivers: Part107Waiver[];
  trustCompletionId?: string;
  trustCompletedAt?: ISOTimestamp;
  medicalCertificate?: {
    class: '1' | '2' | '3';
    expiresAt: ISOTimestamp;
  };
  totalFlightHours: number;
  totalFlights: number;
  endorsements: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  assignedDroneIds: UUID[];
  activeMissions: UUID[];
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface Part107Waiver {
  id: UUID;
  waiverNumber: string;
  type: string;
  description: string;
  conditions: string[];
  effectiveDate: ISOTimestamp;
  expirationDate: ISOTimestamp;
  status: 'active' | 'expired' | 'revoked';
}

// ─── Maintenance ───

export type MaintenanceType =
  | 'scheduled'
  | 'unscheduled'
  | 'inspection'
  | 'repair'
  | 'firmware_update'
  | 'calibration'
  | 'battery_replacement';

export interface MaintenanceRecord {
  id: UUID;
  droneId: UUID;
  tenantId: UUID;
  type: MaintenanceType;
  description: string;
  performedBy: UUID;
  performedAt: ISOTimestamp;
  flightHoursAtMaintenance: number;
  partsReplaced?: string[];
  cost?: number;
  notes?: string;
  attachments: string[]; // S3 URLs
  nextMaintenanceDue?: ISOTimestamp;
  createdAt: ISOTimestamp;
}
