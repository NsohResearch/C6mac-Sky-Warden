// C6macEye — Payload Management Types

export interface Payload {
  id: string;
  tenantId: string;
  name: string;
  type: 'camera_rgb' | 'camera_thermal' | 'camera_multispectral' | 'lidar' | 'delivery_box' | 'sprayer' | 'spotlight' | 'speaker' | 'gas_sensor' | 'magnetometer' | 'custom';
  manufacturer: string;
  model: string;
  serialNumber: string;
  weight: number; // grams
  status: 'available' | 'mounted' | 'maintenance' | 'retired' | 'damaged';
  currentDroneId?: string;
  currentDroneName?: string;
  specifications: {
    resolution?: string;
    fov?: number;
    sensorSize?: string;
    wavelengths?: string[];
    range?: number;
    accuracy?: number;
    capacity?: number;
    flowRate?: number;
    [key: string]: any;
  };
  compatibility: Array<{ droneModel: string; mountType: string; maxPayloadWeight: number }>;
  calibration: { lastCalibrated: string; nextCalibrationDue: string; calibrationType: string };
  firmware: { version: string; lastUpdated: string; updateAvailable: boolean };
  totalFlightHours: number;
  totalMissions: number;
  purchaseDate: string;
  warrantyExpiry: string;
  cost: number;
  notes: string;
  maintenanceHistory: Array<{ date: string; type: string; description: string; technician: string; cost: number }>;
}

export interface PayloadConfiguration {
  id: string;
  name: string;
  droneId: string;
  droneName: string;
  droneMaxPayload: number;
  payloads: Array<{ payloadId: string; payloadName: string; weight: number; position: string }>;
  totalWeight: number;
  weightRemaining: number;
  centerOfGravity: 'optimal' | 'acceptable' | 'warning';
  flightTimeImpact: number; // percentage reduction
  notes: string;
  validated: boolean;
}

export interface PayloadStats {
  totalPayloads: number;
  availablePayloads: number;
  mountedPayloads: number;
  maintenanceDue: number;
  totalValue: number;
  avgFlightHours: number;
  byType: Record<string, number>;
}
