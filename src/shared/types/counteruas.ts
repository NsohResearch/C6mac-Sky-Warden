export interface DroneDetection {
  id: string;
  timestamp: string;
  detectionMethod: 'rf_scan' | 'radar' | 'acoustic' | 'visual' | 'adsb' | 'remote_id' | 'multi_sensor';
  position: { lat: number; lng: number; altitude: number; accuracy: number };
  track: Array<{ lat: number; lng: number; altitude: number; timestamp: string }>;
  classification: 'authorized' | 'unauthorized' | 'unknown' | 'friendly' | 'suspicious' | 'threat';
  threat: 'none' | 'low' | 'medium' | 'high' | 'critical';
  droneInfo?: { manufacturer?: string; model?: string; serialNumber?: string; remoteIdMatch?: boolean; registrationMatch?: boolean };
  operatorInfo?: { identified: boolean; name?: string; location?: { lat: number; lng: number } };
  status: 'active' | 'tracking' | 'departed' | 'neutralized' | 'lost' | 'false_alarm';
  speed: number;
  heading: number;
  signalStrength?: number;
  frequency?: number;
  zone: string;
  response: { action: 'monitor' | 'alert' | 'investigate' | 'intercept' | 'jam' | 'none'; takenBy?: string; timestamp?: string; notes?: string };
  alerts: Array<{ type: string; message: string; timestamp: string }>;
}

export interface DetectionSensor {
  id: string;
  name: string;
  type: 'rf_scanner' | 'radar' | 'acoustic' | 'camera' | 'adsb_receiver' | 'remote_id_receiver';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  position: { lat: number; lng: number };
  coverage: { range: number; azimuth: { min: number; max: number }; elevation: { min: number; max: number } };
  lastHeartbeat: string;
  detectionsToday: number;
  firmware: string;
}

export interface CounterUASStats {
  activeDetections: number;
  totalDetectionsToday: number;
  unauthorizedToday: number;
  threatsToday: number;
  sensorsOnline: number;
  sensorsTotal: number;
  avgResponseTime: number;
  falseAlarmRate: number;
  detectionsByMethod: Record<string, number>;
  detectionsByClassification: Record<string, number>;
  hourlyTrend: Array<{ hour: string; count: number }>;
}
