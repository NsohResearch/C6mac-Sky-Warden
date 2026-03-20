import type { UUID, ISOTimestamp, AuditAction } from './common';

// ─── Compliance Framework ───

export type ComplianceFramework = 'faa_part_107' | 'faa_remote_id' | 'soc2' | 'iso27001' | 'gdpr' | 'ccpa';

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'not_applicable' | 'under_review';

export interface ComplianceControl {
  id: UUID;
  framework: ComplianceFramework;
  controlId: string;
  title: string;
  description: string;
  category: string;
  status: ComplianceStatus;
  evidence: ComplianceEvidence[];
  lastAssessedAt: ISOTimestamp;
  nextAssessmentDue: ISOTimestamp;
  assignedTo?: UUID;
  notes?: string;
}

export interface ComplianceEvidence {
  id: UUID;
  controlId: UUID;
  type: 'document' | 'screenshot' | 'log' | 'automated_check' | 'attestation';
  title: string;
  description: string;
  url?: string;
  collectedAt: ISOTimestamp;
  collectedBy: UUID;
  expiresAt?: ISOTimestamp;
}

// ─── SOC 2 Trust Service Criteria ───

export type Soc2Category = 'security' | 'availability' | 'processing_integrity' | 'confidentiality' | 'privacy';

export interface Soc2Control {
  id: UUID;
  category: Soc2Category;
  criteriaId: string;
  description: string;
  implementation: string;
  status: ComplianceStatus;
  automatedChecks: AutomatedComplianceCheck[];
  lastAuditDate?: ISOTimestamp;
}

export interface AutomatedComplianceCheck {
  id: UUID;
  name: string;
  description: string;
  checkType: 'api_test' | 'config_scan' | 'log_analysis' | 'access_review' | 'encryption_check';
  schedule: string;
  lastRunAt?: ISOTimestamp;
  lastResult?: 'pass' | 'fail' | 'warning';
  lastResultDetails?: string;
  enabled: boolean;
}

// ─── Audit Trail (Immutable) ───

export interface ComplianceAuditLog {
  id: UUID;
  timestamp: ISOTimestamp;
  tenantId: UUID;
  userId: UUID;
  userEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId: UUID;
  resourceName?: string;
  previousState?: string;  // JSON stringified, encrypted at rest
  newState?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: UUID;
  requestId: UUID;
  geolocation?: { country: string; region: string; city: string };
  riskScore?: number;
  flagged: boolean;
  flagReason?: string;
  retentionExpiry: ISOTimestamp;
}

// ─── Data Retention ───

export interface DataRetentionPolicy {
  id: UUID;
  tenantId: UUID;
  dataType: string;
  retentionDays: number;
  archiveEnabled: boolean;
  archiveAfterDays?: number;
  deleteAfterArchive: boolean;
  legalHold: boolean;
  lastPurgeAt?: ISOTimestamp;
  nextPurgeAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// ─── Access Review ───

export interface AccessReview {
  id: UUID;
  tenantId: UUID;
  reviewerId: UUID;
  reviewPeriod: 'quarterly' | 'semi_annual' | 'annual';
  startDate: ISOTimestamp;
  dueDate: ISOTimestamp;
  completedAt?: ISOTimestamp;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  entries: AccessReviewEntry[];
  summary?: string;
  createdAt: ISOTimestamp;
}

export interface AccessReviewEntry {
  id: UUID;
  userId: UUID;
  userName: string;
  currentRoles: string[];
  currentPermissions: string[];
  lastLoginAt?: ISOTimestamp;
  decision: 'approve' | 'revoke' | 'modify' | 'pending';
  newRoles?: string[];
  notes?: string;
  decidedAt?: ISOTimestamp;
}

// ─── Compliance Report ───

export interface ComplianceReport {
  id: UUID;
  tenantId: UUID;
  framework: ComplianceFramework;
  reportType: 'assessment' | 'audit' | 'gap_analysis' | 'risk_register';
  title: string;
  generatedAt: ISOTimestamp;
  generatedBy: UUID;
  period: { start: ISOTimestamp; end: ISOTimestamp };
  summary: {
    totalControls: number;
    compliant: number;
    nonCompliant: number;
    partial: number;
    notApplicable: number;
    overallScore: number;
  };
  findings: ComplianceFinding[];
  exportUrl?: string;
  format: 'pdf' | 'csv' | 'json';
}

export interface ComplianceFinding {
  id: UUID;
  controlId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  dueDate?: ISOTimestamp;
  assignedTo?: UUID;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

// ─── Encryption & Key Management ───

export interface EncryptionKeyMetadata {
  id: UUID;
  purpose: 'data_at_rest' | 'data_in_transit' | 'backup' | 'api_signing';
  algorithm: 'AES-256-GCM' | 'RSA-4096' | 'Ed25519';
  status: 'active' | 'rotating' | 'retired' | 'compromised';
  createdAt: ISOTimestamp;
  rotateAt: ISOTimestamp;
  lastRotatedAt?: ISOTimestamp;
  rotationIntervalDays: number;
}
