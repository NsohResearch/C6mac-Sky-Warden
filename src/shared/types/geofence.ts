export interface Geofence {
  id: string;
  tenantId: string;
  name: string;
  type: 'no_fly' | 'altitude_restricted' | 'operational_boundary' | 'landing_zone' | 'emergency_zone' | 'temporary_restriction' | 'custom';
  geometry: {
    type: 'polygon' | 'circle';
    coordinates?: Array<{ lat: number; lng: number }>;
    center?: { lat: number; lng: number };
    radius?: number; // meters
  };
  altitudeRestriction?: { min: number; max: number; unit: 'feet' | 'meters' };
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  enforcement: 'hard' | 'soft'; // hard = auto-RTH, soft = warning only
  action: 'warn' | 'hover' | 'return_to_home' | 'land' | 'prevent_takeoff';
  color: string;
  validFrom?: string;
  validTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  appliesTo: 'all_drones' | 'specific_drones';
  droneIds?: string[];
  source: 'manual' | 'faa_tfr' | 'faa_uasfm' | 'notam' | 'agency' | 'imported';
  description: string;
  alerts: GeofenceAlert[];
}

export interface GeofenceAlert {
  id: string;
  geofenceId: string;
  geofenceName: string;
  droneId: string;
  droneName: string;
  type: 'approaching' | 'entered' | 'exited' | 'breach' | 'altitude_violation';
  severity: 'info' | 'warning' | 'critical';
  distance: number;
  timestamp: string;
  actionTaken: string;
  acknowledged: boolean;
  position: { lat: number; lng: number; altitude: number };
}

export interface GeofenceStats {
  totalGeofences: number;
  activeGeofences: number;
  alertsToday: number;
  breachesToday: number;
  dronesInRestrictedAreas: number;
}

export interface GeofenceTemplate {
  id: string;
  name: string;
  description: string;
  type: Geofence['type'];
  defaultAltitude?: { min: number; max: number };
  defaultEnforcement: 'hard' | 'soft';
  defaultAction: Geofence['action'];
  icon: string;
}
