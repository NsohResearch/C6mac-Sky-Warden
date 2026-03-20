export interface DroneTelemetry {
  droneId: string;
  droneName: string;
  serialNumber: string;
  timestamp: string;
  position: { lat: number; lng: number; altitude: number; altitudeAGL: number; };
  velocity: { groundSpeed: number; verticalSpeed: number; heading: number; };
  battery: { percentage: number; voltage: number; current: number; temperature: number; estimatedFlightTime: number; };
  signal: { rssi: number; snr: number; linkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'lost'; latency: number; };
  status: 'on_ground' | 'taking_off' | 'in_flight' | 'hovering' | 'landing' | 'returning_home' | 'emergency' | 'offline';
  sensors: { gpsFixType: '2D' | '3D' | 'RTK_FLOAT' | 'RTK_FIX'; satelliteCount: number; hdop: number; imuStatus: 'ok' | 'warning' | 'error'; compassStatus: 'ok' | 'warning' | 'error'; };
  mission?: { missionId: string; missionName: string; waypointIndex: number; totalWaypoints: number; progress: number; };
  remoteId: { broadcasting: boolean; messageType: 'location' | 'basic_id' | 'system' | 'operator_id'; complianceStatus: 'compliant' | 'non_compliant' | 'unknown'; };
  geofence: { withinBounds: boolean; distanceToNearestBoundary: number; warnings: string[]; };
}

export interface TelemetryAlert {
  id: string;
  droneId: string;
  droneName: string;
  type: 'battery_low' | 'signal_lost' | 'geofence_warning' | 'geofence_breach' | 'altitude_violation' | 'speed_violation' | 'emergency' | 'weather_warning' | 'airspace_conflict';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  autoAction?: string;
}

export interface TelemetrySession {
  sessionId: string;
  droneId: string;
  startTime: string;
  endTime?: string;
  maxAltitude: number;
  maxSpeed: number;
  distanceTraveled: number;
  flightPath: Array<{ lat: number; lng: number; altitude: number; timestamp: string }>;
}

export interface TelemetryDashboardStats {
  activeDrones: number;
  totalFlightTimeToday: number;
  alertsToday: number;
  criticalAlerts: number;
  averageBattery: number;
  totalDistanceToday: number;
}
