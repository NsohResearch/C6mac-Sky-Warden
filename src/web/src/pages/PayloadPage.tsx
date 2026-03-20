import { Fragment, useState } from 'react';
import {
  Camera, Aperture, Thermometer, Radar, Package, Droplets, Flashlight, Speaker,
  Wind, Magnet, Box, Weight, Settings, Cpu, HardDrive, Wrench, Calendar, Clock,
  AlertTriangle, CheckCircle, Shield, Plus, Filter, Search, ChevronDown, ChevronUp,
  Edit, Trash2, Download, Upload, RefreshCw, Zap, TrendingDown, Eye, Info, Link,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Payload, PayloadConfiguration, PayloadStats } from '../../../shared/types/payload';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockPayloads: Payload[] = [
  {
    id: 'PLD-001', tenantId: 'T-001', name: 'Zenmuse H20T', type: 'camera_thermal',
    manufacturer: 'DJI', model: 'H20T', serialNumber: 'ZH20T-2025-00142',
    weight: 828, status: 'mounted', currentDroneId: 'DRN-002', currentDroneName: 'Matrice 350 RTK',
    specifications: { resolution: '640x512 thermal / 20MP visual', fov: 40.6, sensorSize: '1/1.7"', wavelengths: ['LWIR 8-14um'] },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'DJI SkyPort V2', maxPayloadWeight: 2700 },
      { droneModel: 'Matrice 300 RTK', mountType: 'DJI SkyPort V2', maxPayloadWeight: 2700 },
    ],
    calibration: { lastCalibrated: '2026-02-10', nextCalibrationDue: '2026-05-10', calibrationType: 'Thermal NUC + Radiometric' },
    firmware: { version: 'v01.03.0510', lastUpdated: '2026-01-20', updateAvailable: true },
    totalFlightHours: 412, totalMissions: 289, purchaseDate: '2025-03-15', warrantyExpiry: '2027-03-15',
    cost: 10999, notes: 'Primary thermal inspection payload.',
    maintenanceHistory: [
      { date: '2026-02-10', type: 'Calibration', description: 'Full thermal + radiometric calibration', technician: 'Sarah Park', cost: 300 },
      { date: '2025-09-12', type: 'Repair', description: 'Zoom lens motor replacement', technician: 'Mike Chen', cost: 850 },
    ],
  },
  {
    id: 'PLD-002', tenantId: 'T-001', name: 'Zenmuse L2', type: 'lidar',
    manufacturer: 'DJI', model: 'Zenmuse L2', serialNumber: 'ZL2-2025-00891',
    weight: 905, status: 'available',
    specifications: { range: 250, accuracy: 0.02, fov: 70, resolution: '1200x900 RGB', sensorSize: '4/3"' },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'DJI SkyPort V2', maxPayloadWeight: 2700 },
      { droneModel: 'Matrice 300 RTK', mountType: 'DJI SkyPort V2', maxPayloadWeight: 2700 },
    ],
    calibration: { lastCalibrated: '2026-01-15', nextCalibrationDue: '2026-04-15', calibrationType: 'Boresight + IMU' },
    firmware: { version: 'v04.01.0200', lastUpdated: '2026-02-05', updateAvailable: false },
    totalFlightHours: 234, totalMissions: 156, purchaseDate: '2025-05-20', warrantyExpiry: '2027-05-20',
    cost: 16800, notes: 'LiDAR mapping for surveying missions.',
    maintenanceHistory: [
      { date: '2026-01-15', type: 'Calibration', description: 'Boresight recalibration after firmware update', technician: 'James Wu', cost: 200 },
    ],
  },
  {
    id: 'PLD-003', tenantId: 'T-001', name: 'RedEdge-P', type: 'camera_multispectral',
    manufacturer: 'MicaSense', model: 'RedEdge-P', serialNumber: 'RE-P-2025-04521',
    weight: 178, status: 'available',
    specifications: { resolution: '1456x1088 per band', fov: 47.2, sensorSize: '3.6mm', wavelengths: ['Blue 475nm', 'Green 560nm', 'Red 668nm', 'Red Edge 717nm', 'NIR 842nm', 'Panchromatic'] },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'Universal Mount', maxPayloadWeight: 2700 },
      { droneModel: 'Mavic 3 Enterprise', mountType: 'Custom Adapter', maxPayloadWeight: 200 },
      { droneModel: 'DJI Inspire 3', mountType: 'Universal Mount', maxPayloadWeight: 1200 },
    ],
    calibration: { lastCalibrated: '2026-03-01', nextCalibrationDue: '2026-06-01', calibrationType: 'Reflectance Panel' },
    firmware: { version: 'v10.1.12', lastUpdated: '2025-12-10', updateAvailable: true },
    totalFlightHours: 89, totalMissions: 45, purchaseDate: '2025-08-01', warrantyExpiry: '2027-08-01',
    cost: 5900, notes: 'Agriculture and vegetation health analysis.',
    maintenanceHistory: [],
  },
  {
    id: 'PLD-004', tenantId: 'T-001', name: 'P1 Full-Frame', type: 'camera_rgb',
    manufacturer: 'DJI', model: 'Zenmuse P1', serialNumber: 'ZP1-2024-11287',
    weight: 800, status: 'mounted', currentDroneId: 'DRN-007', currentDroneName: 'Inspire 3',
    specifications: { resolution: '45MP Full-Frame', fov: 63.5, sensorSize: '35.9x24mm' },
    compatibility: [
      { droneModel: 'DJI Inspire 3', mountType: 'DJI X-Port', maxPayloadWeight: 1200 },
      { droneModel: 'Matrice 350 RTK', mountType: 'DJI SkyPort V2', maxPayloadWeight: 2700 },
    ],
    calibration: { lastCalibrated: '2026-01-20', nextCalibrationDue: '2026-07-20', calibrationType: 'Lens Focus + Geometric' },
    firmware: { version: 'v02.00.03.30', lastUpdated: '2026-02-15', updateAvailable: false },
    totalFlightHours: 567, totalMissions: 412, purchaseDate: '2024-06-10', warrantyExpiry: '2026-06-10',
    cost: 8500, notes: 'Primary photogrammetry payload. Warranty expiring soon.',
    maintenanceHistory: [
      { date: '2026-01-20', type: 'Calibration', description: 'Geometric calibration for survey accuracy', technician: 'Sarah Park', cost: 250 },
      { date: '2025-10-05', type: 'Maintenance', description: 'Shutter mechanism inspection at 400hr', technician: 'Mike Chen', cost: 350 },
      { date: '2025-06-18', type: 'Repair', description: 'Filter thread replacement after drop damage', technician: 'James Wu', cost: 420 },
    ],
  },
  {
    id: 'PLD-005', tenantId: 'T-001', name: 'DJI Delivery Box V2', type: 'delivery_box',
    manufacturer: 'DJI', model: 'FlyCart 30 Cargo Box', serialNumber: 'DLVR-2025-07341',
    weight: 3200, status: 'available',
    specifications: { capacity: 30, range: 16000 },
    compatibility: [
      { droneModel: 'DJI FlyCart 30', mountType: 'Integrated Cargo', maxPayloadWeight: 30000 },
    ],
    calibration: { lastCalibrated: '2026-03-05', nextCalibrationDue: '2027-03-05', calibrationType: 'Load Cell Verification' },
    firmware: { version: 'v01.02.00', lastUpdated: '2026-01-10', updateAvailable: false },
    totalFlightHours: 67, totalMissions: 34, purchaseDate: '2025-11-01', warrantyExpiry: '2027-11-01',
    cost: 2200, notes: 'Cargo delivery operations. Max 30kg payload.',
    maintenanceHistory: [],
  },
  {
    id: 'PLD-006', tenantId: 'T-001', name: 'DJI T50 Sprayer', type: 'sprayer',
    manufacturer: 'DJI', model: 'Agras T50 Spray System', serialNumber: 'SPR-T50-2025-02891',
    weight: 4500, status: 'maintenance',
    specifications: { capacity: 40, flowRate: 16, range: 8000 },
    compatibility: [
      { droneModel: 'DJI Agras T50', mountType: 'Integrated Spray', maxPayloadWeight: 50000 },
    ],
    calibration: { lastCalibrated: '2026-02-20', nextCalibrationDue: '2026-03-20', calibrationType: 'Nozzle Flow Rate' },
    firmware: { version: 'v03.01.05', lastUpdated: '2025-11-20', updateAvailable: true },
    totalFlightHours: 312, totalMissions: 189, purchaseDate: '2025-04-15', warrantyExpiry: '2027-04-15',
    cost: 4500, notes: 'Agricultural spraying system. Calibration overdue.',
    maintenanceHistory: [
      { date: '2026-02-20', type: 'Maintenance', description: 'Nozzle replacement - 4 units', technician: 'Mike Chen', cost: 180 },
      { date: '2025-12-01', type: 'Repair', description: 'Pump motor replacement', technician: 'James Wu', cost: 650 },
    ],
  },
  {
    id: 'PLD-007', tenantId: 'T-001', name: 'Search Spotlight SL60', type: 'spotlight',
    manufacturer: 'Foxfury', model: 'SL-60 Drone Spotlight', serialNumber: 'FF-SL60-2025-00423',
    weight: 454, status: 'available',
    specifications: { range: 200, fov: 30 },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'Universal Mount', maxPayloadWeight: 2700 },
      { droneModel: 'DJI Inspire 3', mountType: 'Universal Mount', maxPayloadWeight: 1200 },
      { droneModel: 'M30T Enterprise', mountType: 'Accessory Port', maxPayloadWeight: 800 },
    ],
    calibration: { lastCalibrated: '2025-12-10', nextCalibrationDue: '2026-06-10', calibrationType: 'Lumen Output Test' },
    firmware: { version: 'v2.1.0', lastUpdated: '2025-10-05', updateAvailable: false },
    totalFlightHours: 145, totalMissions: 78, purchaseDate: '2025-06-20', warrantyExpiry: '2027-06-20',
    cost: 3200, notes: 'Search and rescue spotlight. 6000 lumens.',
    maintenanceHistory: [
      { date: '2025-12-10', type: 'Maintenance', description: 'LED array inspection and cleaning', technician: 'Sarah Park', cost: 75 },
    ],
  },
  {
    id: 'PLD-008', tenantId: 'T-001', name: 'DropTalk PA Speaker', type: 'speaker',
    manufacturer: 'DropTalk', model: 'DT-200 Aerial PA', serialNumber: 'DT200-2025-01892',
    weight: 680, status: 'available',
    specifications: { range: 500, fov: 120 },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'Universal Mount', maxPayloadWeight: 2700 },
      { droneModel: 'DJI Inspire 3', mountType: 'Universal Mount', maxPayloadWeight: 1200 },
    ],
    calibration: { lastCalibrated: '2025-11-15', nextCalibrationDue: '2026-05-15', calibrationType: 'dB Level Verification' },
    firmware: { version: 'v3.0.2', lastUpdated: '2025-09-20', updateAvailable: true },
    totalFlightHours: 56, totalMissions: 28, purchaseDate: '2025-07-10', warrantyExpiry: '2027-07-10',
    cost: 1800, notes: 'Public address system for emergency announcements. 120dB max.',
    maintenanceHistory: [],
  },
  {
    id: 'PLD-009', tenantId: 'T-001', name: 'Sniffer4D V2', type: 'gas_sensor',
    manufacturer: 'Soarability', model: 'Sniffer4D V2 Multi-gas', serialNumber: 'S4D-V2-2025-00312',
    weight: 530, status: 'mounted', currentDroneId: 'DRN-008', currentDroneName: 'M30T Enterprise',
    specifications: { accuracy: 0.01, range: 100, wavelengths: ['CO', 'CO2', 'SO2', 'NO2', 'O3', 'VOC', 'PM2.5', 'PM10'] },
    compatibility: [
      { droneModel: 'M30T Enterprise', mountType: 'Accessory Port', maxPayloadWeight: 800 },
      { droneModel: 'Matrice 350 RTK', mountType: 'Universal Mount', maxPayloadWeight: 2700 },
    ],
    calibration: { lastCalibrated: '2026-03-10', nextCalibrationDue: '2026-04-10', calibrationType: 'Zero-span Gas Cal' },
    firmware: { version: 'v5.2.1', lastUpdated: '2026-02-28', updateAvailable: false },
    totalFlightHours: 98, totalMissions: 52, purchaseDate: '2025-09-15', warrantyExpiry: '2027-09-15',
    cost: 12500, notes: 'Environmental monitoring. 8-gas multi-sensor array.',
    maintenanceHistory: [
      { date: '2026-03-10', type: 'Calibration', description: 'Full zero-span calibration all 8 sensors', technician: 'James Wu', cost: 450 },
    ],
  },
  {
    id: 'PLD-010', tenantId: 'T-001', name: 'GEM Systems UAV Mag', type: 'magnetometer',
    manufacturer: 'GEM Systems', model: 'DRONEmag Potassium', serialNumber: 'GEM-DM-2025-00078',
    weight: 1800, status: 'available',
    specifications: { accuracy: 0.003, range: 150, resolution: '0.001 nT' },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'Tow Cable 3m', maxPayloadWeight: 2700 },
    ],
    calibration: { lastCalibrated: '2026-01-05', nextCalibrationDue: '2026-07-05', calibrationType: 'Absolute Sensitivity' },
    firmware: { version: 'v8.0.4', lastUpdated: '2025-08-10', updateAvailable: true },
    totalFlightHours: 45, totalMissions: 18, purchaseDate: '2025-10-01', warrantyExpiry: '2027-10-01',
    cost: 28000, notes: 'Geophysical survey. Potassium vapor magnetometer. Tow-cable mount.',
    maintenanceHistory: [
      { date: '2026-01-05', type: 'Calibration', description: 'Absolute sensitivity calibration at reference station', technician: 'External - GEM Systems', cost: 1200 },
    ],
  },
  {
    id: 'PLD-011', tenantId: 'T-001', name: 'Mavic 3E Camera', type: 'camera_rgb',
    manufacturer: 'DJI', model: 'Mavic 3E Hasselblad', serialNumber: 'M3E-CAM-2025-00567',
    weight: 0, status: 'mounted', currentDroneId: 'DRN-001', currentDroneName: 'Mavic 3 Enterprise #1',
    specifications: { resolution: '20MP 4/3 CMOS', fov: 84, sensorSize: '4/3"' },
    compatibility: [
      { droneModel: 'Mavic 3 Enterprise', mountType: 'Integrated', maxPayloadWeight: 200 },
    ],
    calibration: { lastCalibrated: '2026-02-15', nextCalibrationDue: '2026-08-15', calibrationType: 'Lens + Color Balance' },
    firmware: { version: 'v01.00.0600', lastUpdated: '2026-01-15', updateAvailable: false },
    totalFlightHours: 342, totalMissions: 287, purchaseDate: '2025-04-10', warrantyExpiry: '2027-04-10',
    cost: 0, notes: 'Integrated camera - included with drone.',
    maintenanceHistory: [],
  },
  {
    id: 'PLD-012', tenantId: 'T-001', name: 'FLIR Vue TZ20-R', type: 'camera_thermal',
    manufacturer: 'Teledyne FLIR', model: 'Vue TZ20-R', serialNumber: 'FLIR-TZ20-2025-02341',
    weight: 350, status: 'damaged',
    specifications: { resolution: '640x512 thermal', fov: 57, sensorSize: 'VOx Microbolometer', wavelengths: ['LWIR 7.5-13.5um'] },
    compatibility: [
      { droneModel: 'Skydio X10', mountType: 'Skydio Payload Adapter', maxPayloadWeight: 400 },
      { droneModel: 'Mavic 3 Enterprise', mountType: 'Custom Adapter', maxPayloadWeight: 200 },
    ],
    calibration: { lastCalibrated: '2025-10-20', nextCalibrationDue: '2026-01-20', calibrationType: 'Thermal NUC + Radiometric' },
    firmware: { version: 'v3.5.1', lastUpdated: '2025-09-15', updateAvailable: true },
    totalFlightHours: 178, totalMissions: 112, purchaseDate: '2025-02-28', warrantyExpiry: '2027-02-28',
    cost: 7200, notes: 'Damaged during hard landing 2026-03-05. Lens cracked. Pending insurance claim.',
    maintenanceHistory: [
      { date: '2026-03-05', type: 'Damage', description: 'Lens assembly cracked during hard landing incident', technician: 'Mike Chen', cost: 0 },
      { date: '2025-10-20', type: 'Calibration', description: 'Scheduled radiometric calibration', technician: 'Sarah Park', cost: 400 },
    ],
  },
  {
    id: 'PLD-013', tenantId: 'T-001', name: 'Zenmuse H30T', type: 'camera_thermal',
    manufacturer: 'DJI', model: 'Zenmuse H30T', serialNumber: 'ZH30T-2026-00045',
    weight: 920, status: 'available',
    specifications: { resolution: '1280x1024 thermal / 48MP visual', fov: 56, sensorSize: '1/1.3"', wavelengths: ['LWIR 8-14um'] },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'DJI SkyPort V2', maxPayloadWeight: 2700 },
    ],
    calibration: { lastCalibrated: '2026-03-15', nextCalibrationDue: '2026-06-15', calibrationType: 'Thermal NUC + Radiometric' },
    firmware: { version: 'v01.00.0100', lastUpdated: '2026-03-10', updateAvailable: false },
    totalFlightHours: 12, totalMissions: 6, purchaseDate: '2026-02-20', warrantyExpiry: '2028-02-20',
    cost: 13500, notes: 'New acquisition. 1280 thermal resolution upgrade.',
    maintenanceHistory: [],
  },
  {
    id: 'PLD-014', tenantId: 'T-001', name: 'Custom LiDAR Rig', type: 'custom',
    manufacturer: 'Velodyne', model: 'Puck LITE + DJI PSDK', serialNumber: 'CUST-VLP16-2025-001',
    weight: 1450, status: 'retired',
    specifications: { range: 100, accuracy: 0.03, fov: 360 },
    compatibility: [
      { droneModel: 'Matrice 350 RTK', mountType: 'DJI PSDK Adapter', maxPayloadWeight: 2700 },
    ],
    calibration: { lastCalibrated: '2025-08-01', nextCalibrationDue: '2025-11-01', calibrationType: 'Boresight + Range' },
    firmware: { version: 'v3.0.37', lastUpdated: '2025-07-10', updateAvailable: false },
    totalFlightHours: 289, totalMissions: 134, purchaseDate: '2024-03-10', warrantyExpiry: '2025-03-10',
    cost: 9500, notes: 'Retired - replaced by Zenmuse L2. Warranty expired.',
    maintenanceHistory: [
      { date: '2025-08-01', type: 'Calibration', description: 'Final calibration before retirement', technician: 'James Wu', cost: 350 },
      { date: '2025-03-15', type: 'Repair', description: 'PSDK adapter connector replacement', technician: 'Mike Chen', cost: 280 },
    ],
  },
  {
    id: 'PLD-015', tenantId: 'T-001', name: 'EVO II Tele Camera', type: 'camera_rgb',
    manufacturer: 'Autel', model: 'EVO II 6K Telephoto', serialNumber: 'AUT-6KT-2025-03421',
    weight: 0, status: 'mounted', currentDroneId: 'DRN-003', currentDroneName: 'EVO II Pro #1',
    specifications: { resolution: '48MP / 6K Video', fov: 75, sensorSize: '1/1.28"' },
    compatibility: [
      { droneModel: 'Autel EVO II Pro V3', mountType: 'Integrated', maxPayloadWeight: 100 },
    ],
    calibration: { lastCalibrated: '2026-01-20', nextCalibrationDue: '2026-07-20', calibrationType: 'Lens Focus + Gimbal' },
    firmware: { version: 'v3.2.16', lastUpdated: '2026-01-05', updateAvailable: false },
    totalFlightHours: 215, totalMissions: 178, purchaseDate: '2025-06-15', warrantyExpiry: '2027-06-15',
    cost: 0, notes: 'Integrated camera - included with drone.',
    maintenanceHistory: [],
  },
];

const mockConfigurations: PayloadConfiguration[] = [
  {
    id: 'CFG-001', name: 'Thermal Inspection', droneId: 'DRN-002', droneName: 'Matrice 350 RTK',
    droneMaxPayload: 2700,
    payloads: [
      { payloadId: 'PLD-001', payloadName: 'Zenmuse H20T', weight: 828, position: 'Gimbal - Bottom' },
    ],
    totalWeight: 828, weightRemaining: 1872, centerOfGravity: 'optimal',
    flightTimeImpact: -12, notes: 'Standard thermal inspection config.', validated: true,
  },
  {
    id: 'CFG-002', name: 'Survey + LiDAR Mapping', droneId: 'DRN-002', droneName: 'Matrice 350 RTK',
    droneMaxPayload: 2700,
    payloads: [
      { payloadId: 'PLD-002', payloadName: 'Zenmuse L2', weight: 905, position: 'Gimbal - Bottom' },
      { payloadId: 'PLD-003', payloadName: 'RedEdge-P', weight: 178, position: 'Top Mount' },
    ],
    totalWeight: 1083, weightRemaining: 1617, centerOfGravity: 'acceptable',
    flightTimeImpact: -18, notes: 'Dual-payload survey configuration.', validated: true,
  },
  {
    id: 'CFG-003', name: 'SAR Night Operations', droneId: 'DRN-002', droneName: 'Matrice 350 RTK',
    droneMaxPayload: 2700,
    payloads: [
      { payloadId: 'PLD-013', payloadName: 'Zenmuse H30T', weight: 920, position: 'Gimbal - Bottom' },
      { payloadId: 'PLD-007', payloadName: 'Search Spotlight SL60', weight: 454, position: 'Side Mount - Left' },
      { payloadId: 'PLD-008', payloadName: 'DropTalk PA Speaker', weight: 680, position: 'Side Mount - Right' },
    ],
    totalWeight: 2054, weightRemaining: 646, centerOfGravity: 'warning',
    flightTimeImpact: -35, notes: 'Heavy config. Monitor battery closely. CG marginal.', validated: true,
  },
  {
    id: 'CFG-004', name: 'Gas Monitoring', droneId: 'DRN-008', droneName: 'M30T Enterprise',
    droneMaxPayload: 800,
    payloads: [
      { payloadId: 'PLD-009', payloadName: 'Sniffer4D V2', weight: 530, position: 'Accessory Port' },
    ],
    totalWeight: 530, weightRemaining: 270, centerOfGravity: 'optimal',
    flightTimeImpact: -15, notes: 'Environmental monitoring flight config.', validated: true,
  },
  {
    id: 'CFG-005', name: 'Aerial Photography', droneId: 'DRN-007', droneName: 'Inspire 3',
    droneMaxPayload: 1200,
    payloads: [
      { payloadId: 'PLD-004', payloadName: 'P1 Full-Frame', weight: 800, position: 'X-Port Gimbal' },
    ],
    totalWeight: 800, weightRemaining: 400, centerOfGravity: 'optimal',
    flightTimeImpact: -20, notes: 'Photogrammetry / aerial survey config.', validated: true,
  },
];

const mockStats: PayloadStats = {
  totalPayloads: 15,
  availablePayloads: 6,
  mountedPayloads: 5,
  maintenanceDue: 3,
  totalValue: 124600,
  avgFlightHours: 203,
  byType: {
    camera_rgb: 3, camera_thermal: 3, camera_multispectral: 1, lidar: 1,
    delivery_box: 1, sprayer: 1, spotlight: 1, speaker: 1,
    gas_sensor: 1, magnetometer: 1, custom: 1,
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

const payloadTypeConfig: Record<string, { label: string; color: string; icon: typeof Camera }> = {
  camera_rgb: { label: 'RGB Camera', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Camera },
  camera_thermal: { label: 'Thermal Camera', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: Thermometer },
  camera_multispectral: { label: 'Multispectral', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Aperture },
  lidar: { label: 'LiDAR', color: 'bg-green-500/10 text-green-400 border-green-500/30', icon: Radar },
  delivery_box: { label: 'Delivery Box', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Package },
  sprayer: { label: 'Sprayer', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: Droplets },
  spotlight: { label: 'Spotlight', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: Flashlight },
  speaker: { label: 'Speaker', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30', icon: Speaker },
  gas_sensor: { label: 'Gas Sensor', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Wind },
  magnetometer: { label: 'Magnetometer', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: Magnet },
  custom: { label: 'Custom', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', icon: Settings },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  mounted: { label: 'Mounted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  maintenance: { label: 'Maintenance', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  retired: { label: 'Retired', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
  damaged: { label: 'Damaged', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

const cgConfig: Record<string, { label: string; color: string }> = {
  optimal: { label: 'Optimal', color: 'text-emerald-400' },
  acceptable: { label: 'Acceptable', color: 'text-amber-400' },
  warning: { label: 'Warning', color: 'text-red-400' },
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${grams} g`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function PayloadPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'configurations'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDrone, setFilterDrone] = useState<string>('all');
  const [expandedPayload, setExpandedPayload] = useState<string | null>(null);
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [showAddPayload, setShowAddPayload] = useState(false);
  const [showCreateConfig, setShowCreateConfig] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Add Payload form state
  const [newPayload, setNewPayload] = useState({
    name: '', type: 'camera_rgb' as Payload['type'], manufacturer: '', model: '',
    serialNumber: '', weight: '', cost: '', notes: '',
    specResolution: '', specFov: '', specRange: '', specAccuracy: '',
    specCapacity: '', specFlowRate: '', specSensorSize: '',
    compatDroneModel: '', compatMountType: '', compatMaxWeight: '',
  });
  const [newPayloadCompat, setNewPayloadCompat] = useState<Array<{ droneModel: string; mountType: string; maxPayloadWeight: number }>>([]);

  // Create Config form state
  const [newConfig, setNewConfig] = useState({
    name: '', droneId: '', notes: '',
  });
  const [selectedConfigPayloads, setSelectedConfigPayloads] = useState<Array<{ payloadId: string; position: string }>>([]);

  const filteredPayloads = mockPayloads.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterDrone !== 'all') {
      if (filterDrone === 'unassigned' && p.currentDroneId) return false;
      if (filterDrone !== 'unassigned' && p.currentDroneId !== filterDrone) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const assignedDrones = Array.from(new Set(mockPayloads.filter((p) => p.currentDroneId).map((p) => ({ id: p.currentDroneId!, name: p.currentDroneName! }))));
  const uniqueDrones = assignedDrones.filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Header ── */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Payload Management</h1>
              <p className="mt-1 text-sm text-gray-400">Manage sensors, cameras, and mission payloads across your fleet</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddPayload(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Add Payload
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-6 flex gap-1 rounded-lg bg-gray-800/50 p-1">
            {(['inventory', 'configurations'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'flex-1 rounded-md px-4 py-2 text-sm font-medium transition',
                  activeTab === tab
                    ? 'bg-gray-700 text-white shadow'
                    : 'text-gray-400 hover:text-white',
                )}
              >
                {tab === 'inventory' ? 'Inventory' : 'Configurations'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'inventory' ? (
          <InventoryTab
            payloads={filteredPayloads}
            stats={mockStats}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterDrone={filterDrone}
            setFilterDrone={setFilterDrone}
            uniqueDrones={uniqueDrones}
            expandedPayload={expandedPayload}
            setExpandedPayload={setExpandedPayload}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        ) : (
          <ConfigurationsTab
            configurations={mockConfigurations}
            expandedConfig={expandedConfig}
            setExpandedConfig={setExpandedConfig}
            showCreateConfig={showCreateConfig}
            setShowCreateConfig={setShowCreateConfig}
            newConfig={newConfig}
            setNewConfig={setNewConfig}
            selectedConfigPayloads={selectedConfigPayloads}
            setSelectedConfigPayloads={setSelectedConfigPayloads}
          />
        )}
      </div>

      {/* ── Add Payload Modal ── */}
      {showAddPayload && (
        <AddPayloadModal
          newPayload={newPayload}
          setNewPayload={setNewPayload}
          newPayloadCompat={newPayloadCompat}
          setNewPayloadCompat={setNewPayloadCompat}
          onClose={() => setShowAddPayload(false)}
        />
      )}
    </div>
  );
}

// ─── Inventory Tab ──────────────────────────────────────────────────────────────

function InventoryTab({
  payloads, stats, searchQuery, setSearchQuery, filterType, setFilterType,
  filterStatus, setFilterStatus, filterDrone, setFilterDrone, uniqueDrones,
  expandedPayload, setExpandedPayload, showFilters, setShowFilters,
}: {
  payloads: Payload[];
  stats: PayloadStats;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filterDrone: string;
  setFilterDrone: (v: string) => void;
  uniqueDrones: Array<{ id: string; name: string }>;
  expandedPayload: string | null;
  setExpandedPayload: (v: string | null) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total Payloads', value: stats.totalPayloads, icon: Box, color: 'text-blue-400' },
          { label: 'Available', value: stats.availablePayloads, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Mounted', value: stats.mountedPayloads, icon: Link, color: 'text-cyan-400' },
          { label: 'Maintenance Due', value: stats.maintenanceDue, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Total Value', value: formatCurrency(stats.totalValue), icon: Shield, color: 'text-purple-400' },
          { label: 'Avg Flight Hours', value: `${stats.avgFlightHours}h`, icon: Clock, color: 'text-gray-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center gap-2">
              <s.icon className={clsx('h-4 w-4', s.color)} />
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
            <p className={clsx('mt-2 text-xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search payloads by name, manufacturer, model, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition',
              showFilters
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white',
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                {Object.entries(payloadTypeConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Drone Assignment</label>
              <select
                value={filterDrone}
                onChange={(e) => setFilterDrone(e.target.value)}
                className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                {uniqueDrones.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Payload Cards ── */}
      <div className="space-y-4">
        {payloads.length === 0 && (
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-12 text-center text-gray-500">
            No payloads match your filters.
          </div>
        )}
        {payloads.map((payload) => {
          const typeInfo = payloadTypeConfig[payload.type] ?? payloadTypeConfig.custom;
          const statusInfo = statusConfig[payload.status];
          const TypeIcon = typeInfo.icon;
          const isExpanded = expandedPayload === payload.id;
          const calDays = daysUntil(payload.calibration.nextCalibrationDue);
          const warDays = daysUntil(payload.warrantyExpiry);

          return (
            <div
              key={payload.id}
              className="rounded-lg border border-gray-800 bg-gray-900/50 transition hover:border-gray-700"
            >
              {/* ── Card Header ── */}
              <div className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left section */}
                  <div className="flex items-start gap-4">
                    <div className={clsx('rounded-lg border p-2.5', typeInfo.color)}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">{payload.name}</h3>
                        <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', typeInfo.color)}>
                          {typeInfo.label}
                        </span>
                        <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', statusInfo.color)}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">
                        {payload.manufacturer} {payload.model}
                        <span className="mx-2 text-gray-600">|</span>
                        <span className="font-mono text-xs text-gray-500">{payload.serialNumber}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        {payload.weight > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Weight className="h-3.5 w-3.5" />
                            {formatWeight(payload.weight)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {payload.totalFlightHours}h / {payload.totalMissions} missions
                        </span>
                        {payload.currentDroneName ? (
                          <span className="inline-flex items-center gap-1 text-blue-400">
                            <Link className="h-3.5 w-3.5" />
                            {payload.currentDroneName}
                          </span>
                        ) : (
                          payload.status === 'available' && (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Available
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right section */}
                  <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                    {/* Specs preview */}
                    <div className="hidden space-y-1 rounded-md border border-gray-800 bg-gray-800/50 px-3 py-2 text-xs text-gray-400 xl:block">
                      {payload.specifications.resolution && (
                        <div className="flex items-center gap-1"><Eye className="h-3 w-3" /> {payload.specifications.resolution}</div>
                      )}
                      {payload.specifications.fov && (
                        <div className="flex items-center gap-1"><Aperture className="h-3 w-3" /> FOV: {payload.specifications.fov}deg</div>
                      )}
                      {payload.specifications.range && (
                        <div className="flex items-center gap-1"><Radar className="h-3 w-3" /> Range: {payload.specifications.range}m</div>
                      )}
                    </div>

                    {/* Calibration */}
                    <div className={clsx(
                      'rounded-md border px-3 py-2 text-xs',
                      calDays < 0 ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                      calDays <= 30 ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                      'border-gray-800 bg-gray-800/50 text-gray-400',
                    )}>
                      <div className="flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        Cal: {calDays < 0 ? 'Overdue' : `${calDays}d`}
                      </div>
                    </div>

                    {/* Firmware */}
                    <div className={clsx(
                      'rounded-md border px-3 py-2 text-xs',
                      payload.firmware.updateAvailable
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-gray-800 bg-gray-800/50 text-gray-400',
                    )}>
                      <div className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        {payload.firmware.version}
                        {payload.firmware.updateAvailable && <Upload className="h-3 w-3 ml-1" />}
                      </div>
                    </div>

                    {/* Warranty */}
                    <div className={clsx(
                      'rounded-md border px-3 py-2 text-xs',
                      warDays < 0 ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                      warDays <= 90 ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                      'border-gray-800 bg-gray-800/50 text-gray-400',
                    )}>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {warDays < 0 ? 'Expired' : `${warDays}d`}
                      </div>
                    </div>

                    {/* Expand */}
                    <button
                      onClick={() => setExpandedPayload(isExpanded ? null : payload.id)}
                      className="rounded-md border border-gray-700 bg-gray-800 p-2 text-gray-400 transition hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* ── Actions Row ── */}
                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-800 pt-3">
                  {payload.status === 'available' ? (
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20">
                      <Link className="h-3.5 w-3.5" /> Mount
                    </button>
                  ) : payload.status === 'mounted' ? (
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                      <Download className="h-3.5 w-3.5" /> Unmount
                    </button>
                  ) : null}
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:text-white">
                    <Calendar className="h-3.5 w-3.5" /> Schedule Calibration
                  </button>
                  {payload.firmware.updateAvailable && (
                    <button className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20">
                      <RefreshCw className="h-3.5 w-3.5" /> Update Firmware
                    </button>
                  )}
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:text-white">
                    <Eye className="h-3.5 w-3.5" /> View History
                  </button>
                </div>
              </div>

              {/* ── Expanded Details ── */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4">
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Full Specs */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                        <Settings className="h-4 w-4 text-gray-400" /> Specifications
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(payload.specifications).map(([key, value]) => {
                          if (value === undefined || value === null) return null;
                          const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                          return (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-gray-300">{displayValue}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Compatibility */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                        <HardDrive className="h-4 w-4 text-gray-400" /> Compatibility
                      </h4>
                      <div className="space-y-2">
                        {payload.compatibility.map((c, i) => (
                          <div key={i} className="rounded-md border border-gray-800 bg-gray-800/50 p-2 text-xs">
                            <p className="font-medium text-white">{c.droneModel}</p>
                            <p className="mt-0.5 text-gray-500">{c.mountType} | Max {formatWeight(c.maxPayloadWeight)}</p>
                          </div>
                        ))}
                      </div>
                      {/* Purchase Info */}
                      <h4 className="mb-3 mt-5 flex items-center gap-2 text-sm font-semibold text-white">
                        <Info className="h-4 w-4 text-gray-400" /> Purchase Info
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Purchase Date</span>
                          <span className="text-gray-300">{payload.purchaseDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Warranty Expiry</span>
                          <span className={clsx('font-medium', warDays < 0 ? 'text-red-400' : warDays <= 90 ? 'text-amber-400' : 'text-gray-300')}>
                            {payload.warrantyExpiry}
                          </span>
                        </div>
                        {payload.cost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Cost</span>
                            <span className="text-gray-300">{formatCurrency(payload.cost)}</span>
                          </div>
                        )}
                      </div>
                      {payload.notes && (
                        <p className="mt-3 rounded-md border border-gray-800 bg-gray-800/30 p-2 text-xs text-gray-400">
                          {payload.notes}
                        </p>
                      )}
                    </div>

                    {/* Maintenance History */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                        <Wrench className="h-4 w-4 text-gray-400" /> Maintenance History
                      </h4>
                      {payload.maintenanceHistory.length === 0 ? (
                        <p className="text-xs text-gray-500">No maintenance records.</p>
                      ) : (
                        <div className="space-y-2">
                          {payload.maintenanceHistory.map((m, i) => (
                            <div key={i} className="rounded-md border border-gray-800 bg-gray-800/50 p-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-white">{m.type}</span>
                                <span className="text-gray-500">{m.date}</span>
                              </div>
                              <p className="mt-1 text-gray-400">{m.description}</p>
                              <div className="mt-1 flex justify-between text-gray-500">
                                <span>{m.technician}</span>
                                {m.cost > 0 && <span>{formatCurrency(m.cost)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Configurations Tab ─────────────────────────────────────────────────────────

function ConfigurationsTab({
  configurations, expandedConfig, setExpandedConfig, showCreateConfig, setShowCreateConfig,
  newConfig, setNewConfig, selectedConfigPayloads, setSelectedConfigPayloads,
}: {
  configurations: PayloadConfiguration[];
  expandedConfig: string | null;
  setExpandedConfig: (v: string | null) => void;
  showCreateConfig: boolean;
  setShowCreateConfig: (v: boolean) => void;
  newConfig: { name: string; droneId: string; notes: string };
  setNewConfig: (v: { name: string; droneId: string; notes: string }) => void;
  selectedConfigPayloads: Array<{ payloadId: string; position: string }>;
  setSelectedConfigPayloads: (v: Array<{ payloadId: string; position: string }>) => void;
}) {
  const availableDrones = [
    { id: 'DRN-002', name: 'Matrice 350 RTK', maxPayload: 2700 },
    { id: 'DRN-007', name: 'Inspire 3', maxPayload: 1200 },
    { id: 'DRN-008', name: 'M30T Enterprise', maxPayload: 800 },
    { id: 'DRN-001', name: 'Mavic 3 Enterprise #1', maxPayload: 200 },
  ];

  const selectedDrone = availableDrones.find((d) => d.id === newConfig.droneId);
  const configWeight = selectedConfigPayloads.reduce((sum, sp) => {
    const p = mockPayloads.find((pl) => pl.id === sp.payloadId);
    return sum + (p?.weight ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active Configurations</h2>
        <button
          onClick={() => setShowCreateConfig(!showCreateConfig)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Create Configuration
        </button>
      </div>

      {/* Configuration Cards */}
      <div className="space-y-4">
        {configurations.map((cfg) => {
          const isExpanded = expandedConfig === cfg.id;
          const weightPercent = (cfg.totalWeight / cfg.droneMaxPayload) * 100;
          const cgInfo = cgConfig[cfg.centerOfGravity];

          return (
            <div key={cfg.id} className="rounded-lg border border-gray-800 bg-gray-900/50 transition hover:border-gray-700">
              <div className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{cfg.name}</h3>
                      {cfg.validated ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          <CheckCircle className="h-3 w-3" /> Validated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                          <AlertTriangle className="h-3 w-3" /> Needs Review
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-400">{cfg.droneName}</p>

                    {/* Mounted Payloads */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {cfg.payloads.map((cp) => {
                        const pData = mockPayloads.find((p) => p.id === cp.payloadId);
                        const typeInfo = pData ? payloadTypeConfig[pData.type] ?? payloadTypeConfig.custom : payloadTypeConfig.custom;
                        const PIcon = typeInfo.icon;
                        return (
                          <div key={cp.payloadId} className={clsx('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs', typeInfo.color)}>
                            <PIcon className="h-3.5 w-3.5" />
                            <span>{cp.payloadName}</span>
                            <span className="text-gray-500">({formatWeight(cp.weight)})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right metrics */}
                  <div className="flex items-center gap-4">
                    {/* Weight bar */}
                    <div className="w-40">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{formatWeight(cfg.totalWeight)}</span>
                        <span className="text-gray-500">{formatWeight(cfg.droneMaxPayload)}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all',
                            weightPercent > 90 ? 'bg-red-500' : weightPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500',
                          )}
                          style={{ width: `${Math.min(weightPercent, 100)}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-center text-xs text-gray-500">{weightPercent.toFixed(0)}% capacity</p>
                    </div>

                    {/* CG */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">CG</p>
                      <p className={clsx('text-sm font-semibold', cgInfo.color)}>{cgInfo.label}</p>
                    </div>

                    {/* Flight Time Impact */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Flight Time</p>
                      <p className="flex items-center gap-1 text-sm font-semibold text-red-400">
                        <TrendingDown className="h-3.5 w-3.5" />
                        {cfg.flightTimeImpact}%
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedConfig(isExpanded ? null : cfg.id)}
                      className="rounded-md border border-gray-700 bg-gray-800 p-2 text-gray-400 transition hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-white">Payload Positions</h4>
                      <div className="space-y-2">
                        {cfg.payloads.map((cp) => (
                          <div key={cp.payloadId} className="flex items-center justify-between rounded-md border border-gray-800 bg-gray-800/50 p-2 text-xs">
                            <div>
                              <p className="font-medium text-white">{cp.payloadName}</p>
                              <p className="text-gray-500">{cp.position}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400">{formatWeight(cp.weight)}</span>
                              <button className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-400 transition hover:bg-red-500/20">
                                Unmount
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-white">Configuration Details</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight Remaining</span>
                          <span className="text-gray-300">{formatWeight(cfg.weightRemaining)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Center of Gravity</span>
                          <span className={cgInfo.color}>{cgInfo.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Flight Time Impact</span>
                          <span className="text-red-400">{cfg.flightTimeImpact}%</span>
                        </div>
                        {cfg.notes && (
                          <p className="mt-2 rounded-md border border-gray-800 bg-gray-800/30 p-2 text-gray-400">
                            {cfg.notes}
                          </p>
                        )}
                      </div>
                      {/* Quick Mount Button */}
                      <button className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20">
                        <Plus className="h-3.5 w-3.5" /> Add Payload to Config
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Create Configuration Form ── */}
      {showCreateConfig && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Settings className="h-5 w-5 text-blue-400" /> Create Configuration
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Configuration Name</label>
              <input
                type="text"
                value={newConfig.name}
                onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                placeholder="e.g., Thermal Inspection"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Select Drone</label>
              <select
                value={newConfig.droneId}
                onChange={(e) => {
                  setNewConfig({ ...newConfig, droneId: e.target.value });
                  setSelectedConfigPayloads([]);
                }}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Choose a drone...</option>
                {availableDrones.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} (max {formatWeight(d.maxPayload)})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedDrone && (
            <div className="mt-4">
              <label className="mb-2 block text-xs text-gray-500">Available Payloads</label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {mockPayloads.filter((p) => p.status === 'available').map((p) => {
                  const selected = selectedConfigPayloads.some((s) => s.payloadId === p.id);
                  const typeInfo = payloadTypeConfig[p.type] ?? payloadTypeConfig.custom;
                  const PIcon = typeInfo.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (selected) {
                          setSelectedConfigPayloads(selectedConfigPayloads.filter((s) => s.payloadId !== p.id));
                        } else {
                          setSelectedConfigPayloads([...selectedConfigPayloads, { payloadId: p.id, position: 'TBD' }]);
                        }
                      }}
                      className={clsx(
                        'flex items-center gap-2 rounded-md border p-2 text-left text-xs transition',
                        selected
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600',
                      )}
                    >
                      <PIcon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-gray-500">{formatWeight(p.weight)}</p>
                      </div>
                      {selected && <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Running totals */}
              <div className="mt-4 rounded-md border border-gray-800 bg-gray-800/50 p-3">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Total Weight: </span>
                    <span className={clsx(
                      'font-semibold',
                      configWeight > selectedDrone.maxPayload ? 'text-red-400' :
                      configWeight > selectedDrone.maxPayload * 0.9 ? 'text-amber-400' : 'text-emerald-400',
                    )}>
                      {formatWeight(configWeight)}
                    </span>
                    <span className="text-gray-500"> / {formatWeight(selectedDrone.maxPayload)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Remaining: </span>
                    <span className="font-semibold text-gray-300">{formatWeight(Math.max(0, selectedDrone.maxPayload - configWeight))}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Est. Flight Impact: </span>
                    <span className="font-semibold text-red-400">
                      -{Math.round((configWeight / selectedDrone.maxPayload) * 40)}%
                    </span>
                  </div>
                  {configWeight > selectedDrone.maxPayload && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-semibold">Exceeds max payload!</span>
                    </div>
                  )}
                </div>
                {/* Weight bar */}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      configWeight > selectedDrone.maxPayload ? 'bg-red-500' :
                      configWeight > selectedDrone.maxPayload * 0.7 ? 'bg-amber-500' : 'bg-emerald-500',
                    )}
                    style={{ width: `${Math.min((configWeight / selectedDrone.maxPayload) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-xs text-gray-500">Notes</label>
            <textarea
              value={newConfig.notes}
              onChange={(e) => setNewConfig({ ...newConfig, notes: e.target.value })}
              placeholder="Configuration notes..."
              rows={2}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowCreateConfig(false)}
              className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-400 transition hover:text-white"
            >
              Cancel
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
              <CheckCircle className="h-4 w-4" /> Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Payload Modal ──────────────────────────────────────────────────────────

function AddPayloadModal({
  newPayload, setNewPayload, newPayloadCompat, setNewPayloadCompat, onClose,
}: {
  newPayload: any;
  setNewPayload: (v: any) => void;
  newPayloadCompat: Array<{ droneModel: string; mountType: string; maxPayloadWeight: number }>;
  setNewPayloadCompat: (v: Array<{ droneModel: string; mountType: string; maxPayloadWeight: number }>) => void;
  onClose: () => void;
}) {
  const specFieldsByType: Record<string, string[]> = {
    camera_rgb: ['specResolution', 'specFov', 'specSensorSize'],
    camera_thermal: ['specResolution', 'specFov', 'specSensorSize'],
    camera_multispectral: ['specResolution', 'specFov', 'specSensorSize'],
    lidar: ['specRange', 'specAccuracy', 'specFov'],
    delivery_box: ['specCapacity', 'specRange'],
    sprayer: ['specCapacity', 'specFlowRate', 'specRange'],
    spotlight: ['specRange', 'specFov'],
    speaker: ['specRange', 'specFov'],
    gas_sensor: ['specAccuracy', 'specRange'],
    magnetometer: ['specAccuracy', 'specRange'],
    custom: ['specResolution', 'specFov', 'specRange', 'specAccuracy', 'specCapacity'],
  };

  const specLabels: Record<string, string> = {
    specResolution: 'Resolution',
    specFov: 'Field of View (deg)',
    specSensorSize: 'Sensor Size',
    specRange: 'Range (m)',
    specAccuracy: 'Accuracy',
    specCapacity: 'Capacity (liters/kg)',
    specFlowRate: 'Flow Rate (L/min)',
  };

  const currentSpecFields = specFieldsByType[newPayload.type] ?? specFieldsByType.custom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Plus className="h-5 w-5 text-blue-400" /> Add Payload
        </h3>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Payload Name</label>
              <input
                type="text"
                value={newPayload.name}
                onChange={(e) => setNewPayload({ ...newPayload, name: e.target.value })}
                placeholder="e.g., Zenmuse H30T"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Type</label>
              <select
                value={newPayload.type}
                onChange={(e) => setNewPayload({ ...newPayload, type: e.target.value })}
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(payloadTypeConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Manufacturer</label>
              <input
                type="text"
                value={newPayload.manufacturer}
                onChange={(e) => setNewPayload({ ...newPayload, manufacturer: e.target.value })}
                placeholder="e.g., DJI"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Model</label>
              <input
                type="text"
                value={newPayload.model}
                onChange={(e) => setNewPayload({ ...newPayload, model: e.target.value })}
                placeholder="e.g., Zenmuse H30T"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Serial Number</label>
              <input
                type="text"
                value={newPayload.serialNumber}
                onChange={(e) => setNewPayload({ ...newPayload, serialNumber: e.target.value })}
                placeholder="e.g., ZH30T-2026-00001"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Weight (grams)</label>
              <input
                type="number"
                value={newPayload.weight}
                onChange={(e) => setNewPayload({ ...newPayload, weight: e.target.value })}
                placeholder="e.g., 920"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Specs */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-white">Specifications</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {currentSpecFields.map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-xs text-gray-500">{specLabels[field]}</label>
                  <input
                    type="text"
                    value={(newPayload as any)[field]}
                    onChange={(e) => setNewPayload({ ...newPayload, [field]: e.target.value })}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-white">Compatibility</h4>
            {newPayloadCompat.length > 0 && (
              <div className="mb-2 space-y-1">
                {newPayloadCompat.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-gray-800 bg-gray-800/50 p-2 text-xs">
                    <span className="text-gray-300">{c.droneModel} - {c.mountType} (max {formatWeight(c.maxPayloadWeight)})</span>
                    <button
                      onClick={() => setNewPayloadCompat(newPayloadCompat.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPayload.compatDroneModel}
                onChange={(e) => setNewPayload({ ...newPayload, compatDroneModel: e.target.value })}
                placeholder="Drone model"
                className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                value={newPayload.compatMountType}
                onChange={(e) => setNewPayload({ ...newPayload, compatMountType: e.target.value })}
                placeholder="Mount type"
                className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="number"
                value={newPayload.compatMaxWeight}
                onChange={(e) => setNewPayload({ ...newPayload, compatMaxWeight: e.target.value })}
                placeholder="Max (g)"
                className="w-24 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (newPayload.compatDroneModel && newPayload.compatMountType) {
                    setNewPayloadCompat([...newPayloadCompat, {
                      droneModel: newPayload.compatDroneModel,
                      mountType: newPayload.compatMountType,
                      maxPayloadWeight: Number(newPayload.compatMaxWeight) || 0,
                    }]);
                    setNewPayload({ ...newPayload, compatDroneModel: '', compatMountType: '', compatMaxWeight: '' });
                  }
                }}
                className="rounded-md bg-gray-700 px-3 py-1.5 text-xs text-white transition hover:bg-gray-600"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Cost & Notes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Cost (USD)</label>
              <input
                type="number"
                value={newPayload.cost}
                onChange={(e) => setNewPayload({ ...newPayload, cost: e.target.value })}
                placeholder="e.g., 13500"
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Notes</label>
              <input
                type="text"
                value={newPayload.notes}
                onChange={(e) => setNewPayload({ ...newPayload, notes: e.target.value })}
                placeholder="Additional notes..."
                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-400 transition hover:text-white"
          >
            Cancel
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
            <Plus className="h-4 w-4" /> Add Payload
          </button>
        </div>
      </div>
    </div>
  );
}
