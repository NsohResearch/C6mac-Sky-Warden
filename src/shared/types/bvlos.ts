export interface BVLOSOperation {
  id: string;
  tenantId: string;
  name: string;
  status: 'planning' | 'waiver_pending' | 'waiver_approved' | 'waiver_denied' | 'active' | 'completed' | 'cancelled';
  waiverType: 'part_107_waiver' | 'type_certification' | 'special_authority' | 'public_coa';
  waiverNumber?: string;
  waiverExpiryDate?: string;
  operationArea: { center: { lat: number; lng: number }; radius: number; maxAltitude: number; description: string };
  safetyCase: {
    riskAssessment: 'low' | 'medium' | 'high';
    mitigations: Array<{ risk: string; mitigation: string; status: 'implemented' | 'planned' | 'pending' }>;
    daaSystem: { type: 'radar' | 'adsb' | 'visual_observer_network' | 'onboard_sensors' | 'combined'; description: string; certified: boolean };
    communicationPlan: { primary: string; backup: string; lostLinkProcedure: string };
    contingencyPlan: { lostLink: string; systemFailure: string; weatherDegradation: string; airspaceConflict: string };
    emergencyPlan: { crashResponse: string; emergencyContacts: Array<{ name: string; role: string; phone: string }> };
  };
  groundObservers: Array<{ name: string; position: { lat: number; lng: number }; coverage: number; communicationMethod: string }>;
  schedule: { startDate: string; endDate: string; dailyWindows: Array<{ start: string; end: string }> };
  drones: Array<{ droneId: string; droneName: string; role: 'primary' | 'backup' }>;
  pilots: Array<{ pilotId: string; pilotName: string; role: 'pic' | 'backup_pic' | 'payload_operator' }>;
  documents: string[];
  approvals: Array<{ authority: string; status: 'pending' | 'approved' | 'denied'; date?: string; notes?: string }>;
}

export interface BVLOSStats {
  totalOperations: number;
  activeOperations: number;
  pendingWaivers: number;
  approvedWaivers: number;
  totalFlightHoursBVLOS: number;
  safetyIncidents: number;
}
