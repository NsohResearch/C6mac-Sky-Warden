// C6macEye — Maintenance & Lifecycle Tracking + Battery Management Types

export interface MaintenanceRecord {
  id: string;
  droneId: string;
  droneName: string;
  type: 'scheduled' | 'unscheduled' | 'inspection' | 'repair' | 'firmware_update' | 'calibration';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  cost?: number;
  parts: Array<{ name: string; partNumber: string; quantity: number; cost: number }>;
  flightHoursAtService: number;
  nextServiceDue: { hours?: number; date?: string };
  attachments: string[];
  notes: string;
}

export interface DroneLifecycle {
  droneId: string;
  droneName: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  totalFlightHours: number;
  totalFlights: number;
  totalCycles: number;
  status: 'active' | 'maintenance' | 'grounded' | 'retired';
  components: Array<{
    name: string;
    type: 'motor' | 'propeller' | 'esc' | 'gimbal' | 'camera' | 'gps' | 'frame' | 'landing_gear';
    serialNumber: string;
    installDate: string;
    flightHoursSinceInstall: number;
    lifeLimit: number;
    remainingLife: number;
    condition: 'good' | 'fair' | 'replace_soon' | 'replace_now';
  }>;
  firmwareVersion: string;
  lastCalibration: string;
  insuranceExpiry: string;
}

export interface BatteryRecord {
  id: string;
  serialNumber: string;
  droneId?: string;
  droneName?: string;
  model: string;
  chemistry: 'LiPo' | 'LiIon' | 'LiHV' | 'solid_state';
  capacity: number; // mAh
  cellCount: number;
  purchaseDate: string;
  cycleCount: number;
  maxCycles: number;
  healthPercentage: number;
  status: 'available' | 'in_use' | 'charging' | 'storage' | 'retired' | 'damaged';
  lastChargeDate: string;
  lastDischargeVoltage: number;
  internalResistance: number[];
  swellDetected: boolean;
  storageVoltage: number;
  temperatureHistory: Array<{ date: string; max: number; avg: number }>;
  estimatedRemainingLife: number; // percentage
  notes: string;
}

export interface MaintenanceStats {
  totalRecords: number;
  completedThisMonth: number;
  overdueCount: number;
  upcomingThisWeek: number;
  avgCostPerService: number;
  totalCostYTD: number;
  fleetHealthScore: number;
  batteryFleetHealth: number;
}
