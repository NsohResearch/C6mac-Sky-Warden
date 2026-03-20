export interface UTMOperation {
  id: string;
  gufi: string; // Globally Unique Flight Identifier
  state: 'proposed' | 'accepted' | 'activated' | 'closed' | 'nonconforming' | 'rogue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  operationType: 'vlos' | 'bvlos' | 'autonomous';
  volumes: Array<{
    altitude: { min: number; max: number; datum: 'WGS84' | 'AGL' };
    geography: { type: 'polygon' | 'circle'; coordinates?: Array<{ lat: number; lng: number }>; center?: { lat: number; lng: number }; radius?: number };
    timeStart: string;
    timeEnd: string;
  }>;
  pilotId: string;
  pilotName: string;
  droneId: string;
  droneName: string;
  droneRegistration: string;
  remoteIdTracking: string;
  submitTime: string;
  updateTime: string;
  deconflictions: Array<{
    operationId: string;
    type: 'strategic' | 'tactical';
    resolution: 'clear' | 'time_separation' | 'altitude_separation' | 'lateral_separation' | 'conflict';
    details: string;
  }>;
  conformanceMonitoring: {
    positionAccuracy: number;
    altitudeAccuracy: number;
    lastPosition: { lat: number; lng: number; altitude: number; timestamp: string };
    withinVolume: boolean;
    alerts: string[];
  };
  contingency: { landingPoint: { lat: number; lng: number }; safeAltitude: number; procedure: string };
  ussProvider: string;
}

export interface UTMConstraint {
  id: string;
  type: 'tfr' | 'notam' | 'sua' | 'dynamic_restriction' | 'weather' | 'event';
  description: string;
  geography: { type: 'polygon' | 'circle'; coordinates?: Array<{ lat: number; lng: number }>; center?: { lat: number; lng: number }; radius?: number };
  altitude: { min: number; max: number };
  timeStart: string;
  timeEnd: string;
  source: string;
  severity: 'advisory' | 'restriction' | 'prohibition';
}

export interface UTMStats {
  activeOperations: number;
  proposedOperations: number;
  deconflictionsToday: number;
  conflictsDetected: number;
  nonconformingOps: number;
  constraintsActive: number;
  averageApprovalTime: number;
  operationsByState: Record<string, number>;
}
