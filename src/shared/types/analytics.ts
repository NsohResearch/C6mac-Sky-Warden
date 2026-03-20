import type { UUID, ISOTimestamp } from './common';

// ─── Dashboard Analytics ───

export interface DashboardMetrics {
  tenantId: UUID;
  period: AnalyticsPeriod;
  fleetMetrics: FleetMetrics;
  missionMetrics: MissionMetrics;
  complianceMetrics: ComplianceMetrics;
  laancMetrics: LaancMetrics;
  safetyMetrics: SafetyMetrics;
}

export type AnalyticsPeriod = {
  type: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  start: ISOTimestamp;
  end: ISOTimestamp;
};

export interface FleetMetrics {
  totalDrones: number;
  activeDrones: number;
  groundedDrones: number;
  maintenanceDue: number;
  totalFlightHours: number;
  avgFlightHoursPerDrone: number;
  droneUtilizationRate: number;
  remoteIdCompliance: number; // percentage
  registrationCompliance: number;
  insuranceCompliance: number;
  statusBreakdown: Record<string, number>;
}

export interface MissionMetrics {
  totalMissions: number;
  completedMissions: number;
  abortedMissions: number;
  cancelledMissions: number;
  inProgressMissions: number;
  avgMissionDuration: number;
  totalFlightHours: number;
  missionSuccessRate: number;
  missionsByType: Record<string, number>;
  missionsByPilot: { pilotId: UUID; pilotName: string; count: number }[];
  peakOperatingHours: number[];
}

export interface ComplianceMetrics {
  overallScore: number;
  frameworkScores: { framework: string; score: number; total: number; compliant: number }[];
  openFindings: number;
  criticalFindings: number;
  overdueReviews: number;
  certificationExpirations: { type: string; count: number; nextExpiry: ISOTimestamp }[];
}

export interface LaancMetrics {
  totalAuthorizations: number;
  autoApproved: number;
  furtherCoordination: number;
  denied: number;
  avgApprovalTime: number; // milliseconds
  topAirports: { code: string; count: number }[];
  byAirspaceClass: Record<string, number>;
}

export interface SafetyMetrics {
  totalIncidents: number;
  incidentsBySeverity: Record<string, number>;
  incidentsByType: Record<string, number>;
  nearMisses: number;
  safetyScore: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  daysWithoutIncident: number;
}

// ─── AI-Powered Insights ───

export type InsightType =
  | 'anomaly'
  | 'trend'
  | 'prediction'
  | 'recommendation'
  | 'compliance_risk'
  | 'maintenance_prediction'
  | 'utilization_optimization';

export type InsightSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface AiInsight {
  id: UUID;
  tenantId: UUID;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendation?: string;
  affectedResources: { type: string; id: UUID; name: string }[];
  confidence: number; // 0-1
  dataPoints: Record<string, unknown>;
  generatedAt: ISOTimestamp;
  expiresAt?: ISOTimestamp;
  acknowledged: boolean;
  acknowledgedBy?: UUID;
  acknowledgedAt?: ISOTimestamp;
  actionTaken?: string;
}

// ─── Report Generation ───

export type ReportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

export interface ReportTemplate {
  id: UUID;
  tenantId: UUID;
  name: string;
  description: string;
  type: 'fleet_summary' | 'flight_log' | 'compliance' | 'safety' | 'laanc' | 'billing' | 'custom';
  sections: ReportSection[];
  schedule?: ReportSchedule;
  recipients: string[];
  format: ReportFormat;
  createdBy: UUID;
  createdAt: ISOTimestamp;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'table' | 'chart' | 'text' | 'metric_cards' | 'map';
  dataSource: string;
  filters?: Record<string, unknown>;
  columns?: string[];
  chartConfig?: Record<string, unknown>;
  order: number;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  nextRunAt: ISOTimestamp;
  lastRunAt?: ISOTimestamp;
  enabled: boolean;
}

export interface GeneratedReport {
  id: UUID;
  templateId: UUID;
  tenantId: UUID;
  title: string;
  period: AnalyticsPeriod;
  format: ReportFormat;
  fileUrl: string;
  fileSize: number;
  generatedAt: ISOTimestamp;
  generatedBy: UUID;
  expiresAt: ISOTimestamp;
}
