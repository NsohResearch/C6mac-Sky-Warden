export interface Incident {
  id: string;
  tenantId: string;
  incidentNumber: string;
  type: 'accident' | 'incident' | 'near_miss' | 'hazard' | 'airspace_violation' | 'flyaway' | 'lost_link' | 'property_damage' | 'injury';
  severity: 'minor' | 'moderate' | 'serious' | 'critical' | 'fatal';
  status: 'reported' | 'under_investigation' | 'root_cause_identified' | 'corrective_action' | 'closed' | 'reopened';
  title: string;
  description: string;
  dateTime: string;
  location: { lat: number; lng: number; address: string; airspace: string };
  reportedBy: string;
  reportedAt: string;
  droneId?: string;
  droneName?: string;
  pilotId?: string;
  pilotName?: string;
  missionId?: string;
  weatherConditions: { wind: number; visibility: number; ceiling: number | null; precipitation: string };
  injuries: Array<{ personType: 'pilot' | 'crew' | 'bystander'; severity: string; description: string }>;
  propertyDamage: Array<{ owner: string; description: string; estimatedCost: number }>;
  droneDamage: { description: string; estimatedRepairCost: number; repairable: boolean };
  rootCause?: { category: 'mechanical' | 'pilot_error' | 'environmental' | 'software' | 'design' | 'maintenance' | 'procedural' | 'unknown'; description: string; contributingFactors: string[] };
  correctiveActions: Array<{ id: string; description: string; assignedTo: string; dueDate: string; status: 'pending' | 'in_progress' | 'completed' | 'overdue'; completedDate?: string }>;
  investigation: { investigatorId?: string; investigatorName?: string; startDate?: string; findings: string; recommendations: string[]; evidence: Array<{ type: 'photo' | 'video' | 'flight_log' | 'witness_statement' | 'telemetry_data' | 'document'; name: string; uploadDate: string }> };
  witnesses: Array<{ name: string; contact: string; statement: string }>;
  regulatoryNotifications: Array<{ authority: 'FAA' | 'NTSB' | 'local_authority'; required: boolean; notifiedDate?: string; referenceNumber?: string; status: 'required' | 'notified' | 'acknowledged' | 'not_required' }>;
  insuranceClaim?: { filed: boolean; claimNumber?: string; status?: string };
  safetyReportId?: string;
  timeline: Array<{ date: string; action: string; by: string; notes: string }>;
  lessonsLearned?: string;
  tags: string[];
}

export interface IncidentStats {
  totalIncidents: number;
  openInvestigations: number;
  overdueActions: number;
  avgResolutionDays: number;
  incidentsByType: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
  topRootCauses: Array<{ cause: string; count: number }>;
}
