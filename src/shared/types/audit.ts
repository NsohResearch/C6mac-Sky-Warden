export interface AuditPackage {
  id: string;
  tenantId: string;
  name: string;
  type: 'faa_audit' | 'insurance_renewal' | 'enterprise_compliance' | 'government_report' | 'custom';
  status: 'generating' | 'ready' | 'downloaded' | 'shared' | 'expired';
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  scope: {
    dateRange: { start: string; end: string };
    pilots: string[];
    drones: string[];
    categories: string[];
  };
  documents: Array<{
    name: string;
    type: 'flight_log' | 'pilot_cert' | 'drone_registration' | 'maintenance_record' | 'insurance_coi' | 'safety_report' | 'incident_report' | 'compliance_checklist';
    count: number;
    included: boolean;
  }>;
  summary: {
    totalFlightHours: number;
    totalFlights: number;
    pilotCount: number;
    droneCount: number;
    incidentCount: number;
    complianceScore: number;
  };
  format: 'pdf' | 'zip' | 'xlsx';
  fileSize?: number;
  downloadUrl?: string;
  sharedWith: Array<{ email: string; sharedAt: string; accessed: boolean }>;
}

export interface AuditStats {
  totalPackages: number;
  readyPackages: number;
  sharedPackages: number;
  lastGenerated: string;
  complianceScore: number;
}
