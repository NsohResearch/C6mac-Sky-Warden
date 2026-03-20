import type { UUID, ISOTimestamp, GeoJSONPolygon, Coordinates } from './common';

// ─── Agency / Airspace Authority ───

export type AgencyType =
  | 'municipal'
  | 'county'
  | 'state'
  | 'federal'
  | 'airport_authority'
  | 'military'
  | 'national_park'
  | 'tribal';

export interface Agency {
  id: UUID;
  tenantId: UUID;
  name: string;
  type: AgencyType;
  jurisdiction: GeoJSONPolygon;
  address: Address;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  verified: boolean;
  verifiedAt?: ISOTimestamp;
  verifiedBy?: UUID;
  apiEnabled: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ─── Agency Rule Authoring ───

export type RuleStatus = 'draft' | 'review' | 'published' | 'archived' | 'expired';

export interface AgencyRule {
  id: UUID;
  agencyId: UUID;
  title: string;
  description: string;
  ruleType: 'restriction' | 'requirement' | 'permit' | 'advisory' | 'prohibition';
  geometry: GeoJSONPolygon;
  altitude?: { floorFt: number; ceilingFt: number };
  effectiveStart: ISOTimestamp;
  effectiveEnd?: ISOTimestamp;
  schedule?: RuleSchedule;
  conditions: RuleCondition[];
  exemptions: RuleExemption[];
  permitRequired: boolean;
  permitApplicationUrl?: string;
  enforcementLevel: 'advisory' | 'warning' | 'enforced';
  status: RuleStatus;
  version: number;
  previousVersionId?: UUID;
  publishedAt?: ISOTimestamp;
  publishedBy?: UUID;
  createdBy: UUID;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface RuleSchedule {
  daysOfWeek: number[];     // 0=Sunday
  startTime: string;        // HH:MM (local)
  endTime: string;
  timezone: string;
  holidays: boolean;        // Apply on holidays?
  specialDates?: string[];  // Additional dates
}

export interface RuleCondition {
  field: 'drone_weight' | 'drone_category' | 'operation_type' | 'altitude' | 'time' | 'weather' | 'event' | 'pilot_cert';
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
  value: unknown;
  label: string;
}

export interface RuleExemption {
  id: UUID;
  type: 'public_safety' | 'emergency' | 'permit_holder' | 'waiver' | 'agency_authorized';
  description: string;
  requiresDocumentation: boolean;
}

// ─── Incident Reporting (Agency Side) ───

export type AgencyIncidentStatus = 'reported' | 'investigating' | 'resolved' | 'escalated' | 'closed';

export interface AgencyIncident {
  id: UUID;
  agencyId: UUID;
  reportedBy?: UUID;
  reporterType: 'pilot' | 'public' | 'agency' | 'law_enforcement' | 'atc';
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: Coordinates;
  occurredAt: ISOTimestamp;
  droneDescription?: string;
  droneRegistration?: string;
  remoteIdData?: Record<string, unknown>;
  status: AgencyIncidentStatus;
  assignedTo?: UUID;
  resolution?: string;
  faaReported: boolean;
  faaReportId?: string;
  lawEnforcementNotified: boolean;
  attachments: string[];
  timeline: IncidentTimelineEntry[];
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface IncidentTimelineEntry {
  id: UUID;
  timestamp: ISOTimestamp;
  action: string;
  description: string;
  userId: UUID;
  attachments?: string[];
}

// ─── Agency Analytics ───

export interface AgencyAnalytics {
  agencyId: UUID;
  period: { start: ISOTimestamp; end: ISOTimestamp };
  totalFlightsInJurisdiction: number;
  laancAuthorizationsIssued: number;
  activeRules: number;
  incidentsReported: number;
  incidentsByType: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
  complianceRate: number;
  topOperators: { name: string; flights: number }[];
  peakHours: number[];
  droneActivityHeatmap: { lat: number; lng: number; intensity: number }[];
}
