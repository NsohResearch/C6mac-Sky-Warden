import type { UUID, ISOTimestamp, GeoJSONPolygon, Coordinates, Altitude } from './common';

// ─── LAANC Authorization ───

export type LaancAuthorizationType =
  | 'near_real_time'     // At or below UASFM max altitude → instant
  | 'further_coordination' // Above UASFM max but ≤400ft → 72hr review
  | 'manual';             // Non-LAANC airport → FAA DroneZone

export type LaancAuthorizationStatus =
  | 'draft'
  | 'submitted'
  | 'auto_approved'       // Near-real-time approval
  | 'pending_review'      // Further coordination
  | 'approved'
  | 'denied'
  | 'expired'
  | 'cancelled'
  | 'rescinded';

export interface LaancAuthorization {
  id: UUID;
  tenantId: UUID;
  pilotId: UUID;
  missionId?: UUID;

  // FAA Reference
  referenceCode: string;        // 12-character LAANC reference (3 USS + 8 base + 1 auth)
  ussProvider: string;          // USS provider identifier (first 3 chars)
  authorizationType: LaancAuthorizationType;
  status: LaancAuthorizationStatus;

  // Operation Details
  operationType: 'part_107' | 'recreational';
  operationArea: GeoJSONPolygon;
  centerPoint: Coordinates;
  radiusMeters: number;
  requestedAltitude: Altitude;
  approvedAltitude?: Altitude;
  uasfmMaxAltitudeFt: number;

  // Airspace
  airportCode: string;
  airportName: string;
  facilityId: string;
  airspaceClass: 'B' | 'C' | 'D' | 'E';

  // Timing
  requestedStart: ISOTimestamp;
  requestedEnd: ISOTimestamp;
  approvedStart?: ISOTimestamp;
  approvedEnd?: ISOTimestamp;
  maxDurationHours: number;

  // Aircraft
  droneSerialNumber: string;
  faaRegistrationNumber: string;
  remoteIdSerialNumber?: string;

  // Night Operations (LAANC 5 Protocol)
  nightOperations: boolean;
  antiCollisionLight: boolean;

  // Review (for further coordination)
  reviewedBy?: string;
  reviewNotes?: string;
  denialReason?: string;
  conditions?: string[];

  // Audit
  submittedAt: ISOTimestamp;
  respondedAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── LAANC Request/Response (USS ↔ FAA Protocol) ───

export interface LaancSubmitRequest {
  operationType: 'part_107' | 'recreational';
  pilotCertificateNumber?: string;
  trustCompletionId?: string;
  faaRegistrationNumber: string;
  droneSerialNumber: string;
  remoteIdSerialNumber?: string;
  operationArea: GeoJSONPolygon;
  requestedAltitudeFt: number;
  startTime: ISOTimestamp;
  endTime: ISOTimestamp;
  nightOperations: boolean;
  antiCollisionLight: boolean;
  emergencyContactPhone: string;
}

export interface LaancSubmitResponse {
  referenceCode: string;
  status: LaancAuthorizationStatus;
  authorizationType: LaancAuthorizationType;
  approvedAltitudeFt?: number;
  approvedStart?: ISOTimestamp;
  approvedEnd?: ISOTimestamp;
  conditions?: string[];
  denialReason?: string;
  expiresAt?: ISOTimestamp;
  respondedAt: ISOTimestamp;
}

// ─── LAANC Notification (USS → Pilot) ───

export interface LaancNotification {
  id: UUID;
  authorizationId: UUID;
  type: 'approved' | 'denied' | 'rescinded' | 'expiring' | 'conditions_updated';
  title: string;
  message: string;
  referenceCode: string;
  timestamp: ISOTimestamp;
  read: boolean;
  readAt?: ISOTimestamp;
}

// ─── LAANC Statistics ───

export interface LaancStats {
  tenantId: UUID;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: ISOTimestamp;
  endDate: ISOTimestamp;
  totalRequests: number;
  autoApproved: number;
  furtherCoordination: number;
  denied: number;
  cancelled: number;
  expired: number;
  avgResponseTimeMs: number;
  topAirports: { code: string; name: string; count: number }[];
  byAirspaceClass: Record<string, number>;
  nightOpsCount: number;
}
