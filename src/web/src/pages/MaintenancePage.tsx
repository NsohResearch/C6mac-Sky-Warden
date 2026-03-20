import { Fragment, useState } from 'react';
import {
  Wrench, Calendar, AlertTriangle, CheckCircle, Clock, Battery,
  BatteryWarning, BatteryCharging, Thermometer, Zap, Shield, Activity,
  Settings, Plus, Filter, Search, ChevronDown, ChevronUp, TrendingDown,
  TrendingUp, Package, Tool, Cpu, HardDrive, RefreshCw, AlertCircle,
  XCircle, Download,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { MaintenanceRecord, DroneLifecycle, BatteryRecord, MaintenanceStats } from '../../../shared/types/maintenance';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockMaintenanceRecords: MaintenanceRecord[] = [
  { id: 'MNT-001', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', type: 'scheduled', status: 'completed', priority: 'medium', title: 'Routine 200hr Service', description: 'Full inspection at 200 flight hours including motor checks, gimbal calibration, and firmware verification.', scheduledDate: '2026-02-15', completedDate: '2026-02-15', technician: 'Mike Chen', cost: 450, parts: [{ name: 'Propeller Set', partNumber: 'DJI-M3E-PROP-01', quantity: 2, cost: 68 }, { name: 'ND Filter Kit', partNumber: 'DJI-M3E-ND-16', quantity: 1, cost: 45 }], flightHoursAtService: 200, nextServiceDue: { hours: 400, date: '2026-06-15' }, attachments: ['service_report_001.pdf'], notes: 'All systems nominal. Minor propeller wear noted.' },
  { id: 'MNT-002', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', type: 'inspection', status: 'completed', priority: 'high', title: 'Pre-flight Safety Inspection', description: 'Mandatory safety inspection before critical infrastructure survey mission.', scheduledDate: '2026-03-01', completedDate: '2026-03-01', technician: 'Sarah Park', cost: 200, parts: [], flightHoursAtService: 578, nextServiceDue: { hours: 600 }, attachments: [], notes: 'Cleared for mission. RTK module functioning within spec.' },
  { id: 'MNT-003', droneId: 'DRN-003', droneName: 'EVO II Pro #1', type: 'scheduled', status: 'overdue', priority: 'high', title: '200hr Scheduled Maintenance', description: 'Standard 200-hour maintenance check. Includes motor replacement if needed.', scheduledDate: '2026-03-10', technician: 'Mike Chen', parts: [{ name: 'Motor Assembly', partNumber: 'AUT-EVO2-MOT-A', quantity: 1, cost: 185 }], flightHoursAtService: 215, nextServiceDue: { hours: 400 }, attachments: [], notes: 'Overdue by 10 days - schedule ASAP.' },
  { id: 'MNT-004', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', type: 'repair', status: 'in_progress', priority: 'critical', title: 'Gimbal Stabilization Failure', description: 'Thermal camera gimbal showing intermittent stabilization errors during flight. Requires full gimbal assembly inspection and potential replacement.', scheduledDate: '2026-03-18', technician: 'James Wu', cost: 1200, parts: [{ name: 'Gimbal Assembly', partNumber: 'DJI-M3T-GMB-01', quantity: 1, cost: 850 }, { name: 'Ribbon Cable', partNumber: 'DJI-M3T-RBN-03', quantity: 1, cost: 35 }], flightHoursAtService: 456, nextServiceDue: { hours: 500 }, attachments: ['gimbal_error_log.csv'], notes: 'Drone grounded until repair complete. Parts on order.' },
  { id: 'MNT-005', droneId: 'DRN-004', droneName: 'Skydio X10', type: 'firmware_update', status: 'completed', priority: 'medium', title: 'Firmware Update v24.3.2', description: 'Critical firmware update addressing autonomous navigation improvements and obstacle avoidance calibration.', scheduledDate: '2026-03-05', completedDate: '2026-03-05', technician: 'Sarah Park', cost: 0, parts: [], flightHoursAtService: 120, nextServiceDue: { date: '2026-06-05' }, attachments: [], notes: 'Update successful. New features: improved night nav.' },
  { id: 'MNT-006', droneId: 'DRN-006', droneName: 'Phantom 4 RTK', type: 'repair', status: 'overdue', priority: 'critical', title: 'Motor #3 Bearing Failure', description: 'Motor #3 producing unusual vibration and noise. Bearing replacement required before any further flights.', scheduledDate: '2026-02-20', technician: 'Mike Chen', cost: 380, parts: [{ name: 'Motor Assembly #3', partNumber: 'DJI-P4R-MOT-03', quantity: 1, cost: 220 }, { name: 'Bearing Kit', partNumber: 'DJI-P4R-BRG-01', quantity: 1, cost: 42 }], flightHoursAtService: 892, nextServiceDue: { hours: 950 }, attachments: [], notes: 'Drone offline. Remote ID also non-compliant.' },
  { id: 'MNT-007', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', type: 'calibration', status: 'scheduled', priority: 'low', title: 'IMU & Compass Calibration', description: 'Periodic IMU and compass recalibration for optimal flight performance.', scheduledDate: '2026-03-25', parts: [], flightHoursAtService: 342, nextServiceDue: { date: '2026-06-25' }, attachments: [], notes: '' },
  { id: 'MNT-008', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', type: 'scheduled', status: 'scheduled', priority: 'medium', title: '500hr Major Service', description: 'Major service interval at 500 flight hours. Complete teardown and inspection.', scheduledDate: '2026-03-28', parts: [{ name: 'Propeller Set', partNumber: 'DJI-M350-PROP-01', quantity: 4, cost: 120 }, { name: 'ESC Board', partNumber: 'DJI-M350-ESC-02', quantity: 1, cost: 310 }], flightHoursAtService: 578, nextServiceDue: { hours: 1000, date: '2026-09-28' }, attachments: [], notes: 'Pre-ordered all parts.' },
  { id: 'MNT-009', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'inspection', status: 'scheduled', priority: 'medium', title: 'Annual FAA Compliance Inspection', description: 'Mandatory annual inspection for Part 107 compliance and airworthiness certification.', scheduledDate: '2026-04-01', parts: [], flightHoursAtService: 310, nextServiceDue: { date: '2027-04-01' }, attachments: [], notes: 'FAA inspector booked.' },
  { id: 'MNT-010', droneId: 'DRN-008', droneName: 'M30T Enterprise', type: 'unscheduled', status: 'completed', priority: 'high', title: 'Emergency Landing Gear Repair', description: 'Landing gear damaged during hard landing on rocky terrain. Required immediate field repair.', scheduledDate: '2026-03-12', completedDate: '2026-03-13', technician: 'James Wu', cost: 680, parts: [{ name: 'Landing Gear Assembly', partNumber: 'DJI-M30T-LG-01', quantity: 1, cost: 425 }, { name: 'Shock Absorber', partNumber: 'DJI-M30T-SA-02', quantity: 2, cost: 65 }], flightHoursAtService: 189, nextServiceDue: { hours: 250 }, attachments: ['incident_report.pdf', 'repair_photos.zip'], notes: 'Incident logged. Pilot retraining recommended.' },
  { id: 'MNT-011', droneId: 'DRN-004', droneName: 'Skydio X10', type: 'calibration', status: 'completed', priority: 'low', title: 'Obstacle Avoidance Sensor Calibration', description: 'Recalibration of all 6 stereo camera pairs for obstacle detection accuracy.', scheduledDate: '2026-02-28', completedDate: '2026-02-28', technician: 'Sarah Park', cost: 150, parts: [], flightHoursAtService: 118, nextServiceDue: { date: '2026-08-28' }, attachments: [], notes: 'All sensors within spec.' },
  { id: 'MNT-012', droneId: 'DRN-003', droneName: 'EVO II Pro #1', type: 'firmware_update', status: 'cancelled', priority: 'low', title: 'Firmware v3.3.0 Beta', description: 'Beta firmware update cancelled due to reported stability issues from other users.', scheduledDate: '2026-03-08', parts: [], flightHoursAtService: 210, nextServiceDue: { date: '2026-04-15' }, attachments: [], notes: 'Waiting for stable release.' },
  { id: 'MNT-013', droneId: 'DRN-007', droneName: 'Inspire 3', type: 'scheduled', status: 'scheduled', priority: 'medium', title: 'Propulsion System Service', description: 'Scheduled propulsion check and propeller replacement at 300 hours.', scheduledDate: '2026-04-05', parts: [{ name: 'Folding Propeller Set', partNumber: 'DJI-INS3-PROP-01', quantity: 4, cost: 95 }], flightHoursAtService: 310, nextServiceDue: { hours: 600 }, attachments: [], notes: '' },
  { id: 'MNT-014', droneId: 'DRN-008', droneName: 'M30T Enterprise', type: 'inspection', status: 'scheduled', priority: 'high', title: 'Post-Repair Flight Test', description: 'Mandatory post-repair flight test following landing gear replacement. Must verify all systems.', scheduledDate: '2026-03-22', parts: [], flightHoursAtService: 189, nextServiceDue: { hours: 250 }, attachments: [], notes: 'Requires open airspace approval.' },
  { id: 'MNT-015', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', type: 'calibration', status: 'scheduled', priority: 'medium', title: 'Thermal Sensor Calibration', description: 'Thermal camera sensor calibration after gimbal repair completion.', scheduledDate: '2026-03-30', parts: [], flightHoursAtService: 456, nextServiceDue: { date: '2026-09-30' }, attachments: [], notes: 'Depends on MNT-004 completion.' },
];

const mockDroneLifecycles: DroneLifecycle[] = [
  { droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', model: 'DJI Mavic 3 Enterprise', serialNumber: '1ZNBJ9E00C00X7', purchaseDate: '2025-04-10', warrantyExpiry: '2027-04-10', totalFlightHours: 342, totalFlights: 287, totalCycles: 312, status: 'active', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-001-A', installDate: '2025-04-10', flightHoursSinceInstall: 342, lifeLimit: 500, remainingLife: 68, condition: 'good' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-001-B', installDate: '2025-04-10', flightHoursSinceInstall: 342, lifeLimit: 500, remainingLife: 68, condition: 'good' },
    { name: 'Motor #3', type: 'motor', serialNumber: 'MOT-001-C', installDate: '2025-04-10', flightHoursSinceInstall: 342, lifeLimit: 500, remainingLife: 68, condition: 'good' },
    { name: 'Motor #4', type: 'motor', serialNumber: 'MOT-001-D', installDate: '2025-04-10', flightHoursSinceInstall: 342, lifeLimit: 500, remainingLife: 68, condition: 'good' },
    { name: 'Propellers', type: 'propeller', serialNumber: 'PRP-001-SET2', installDate: '2026-02-15', flightHoursSinceInstall: 52, lifeLimit: 200, remainingLife: 74, condition: 'good' },
    { name: 'Gimbal Assembly', type: 'gimbal', serialNumber: 'GMB-001', installDate: '2025-04-10', flightHoursSinceInstall: 342, lifeLimit: 1000, remainingLife: 66, condition: 'good' },
    { name: 'Camera Module', type: 'camera', serialNumber: 'CAM-001', installDate: '2025-04-10', flightHoursSinceInstall: 342, lifeLimit: 2000, remainingLife: 83, condition: 'good' },
    { name: 'GPS Module', type: 'gps', serialNumber: 'GPS-001', installDate: '2025-04-10', flightHoursSinceInstall: 342, lifeLimit: 3000, remainingLife: 89, condition: 'good' },
  ], firmwareVersion: 'v01.00.0600', lastCalibration: '2026-02-15', insuranceExpiry: '2026-10-15' },
  { droneId: 'DRN-002', droneName: 'Matrice 350 RTK', model: 'DJI Matrice 350 RTK', serialNumber: '1ZNDH3500D002A', purchaseDate: '2024-11-20', warrantyExpiry: '2026-11-20', totalFlightHours: 578, totalFlights: 412, totalCycles: 445, status: 'active', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-002-A', installDate: '2024-11-20', flightHoursSinceInstall: 578, lifeLimit: 800, remainingLife: 28, condition: 'replace_soon' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-002-B', installDate: '2024-11-20', flightHoursSinceInstall: 578, lifeLimit: 800, remainingLife: 28, condition: 'replace_soon' },
    { name: 'Motor #3', type: 'motor', serialNumber: 'MOT-002-C', installDate: '2024-11-20', flightHoursSinceInstall: 578, lifeLimit: 800, remainingLife: 28, condition: 'replace_soon' },
    { name: 'Motor #4', type: 'motor', serialNumber: 'MOT-002-D', installDate: '2024-11-20', flightHoursSinceInstall: 578, lifeLimit: 800, remainingLife: 28, condition: 'replace_soon' },
    { name: 'Propellers', type: 'propeller', serialNumber: 'PRP-002-SET3', installDate: '2026-01-10', flightHoursSinceInstall: 120, lifeLimit: 300, remainingLife: 60, condition: 'good' },
    { name: 'ESC Board', type: 'esc', serialNumber: 'ESC-002', installDate: '2024-11-20', flightHoursSinceInstall: 578, lifeLimit: 1500, remainingLife: 61, condition: 'good' },
    { name: 'RTK Module', type: 'gps', serialNumber: 'RTK-002', installDate: '2024-11-20', flightHoursSinceInstall: 578, lifeLimit: 3000, remainingLife: 81, condition: 'good' },
    { name: 'Landing Gear', type: 'landing_gear', serialNumber: 'LG-002', installDate: '2024-11-20', flightHoursSinceInstall: 578, lifeLimit: 2000, remainingLife: 71, condition: 'good' },
  ], firmwareVersion: 'v09.01.0103', lastCalibration: '2026-03-01', insuranceExpiry: '2026-08-20' },
  { droneId: 'DRN-003', droneName: 'EVO II Pro #1', model: 'Autel EVO II Pro V3', serialNumber: '7YBRX2100FN042', purchaseDate: '2025-06-15', warrantyExpiry: '2027-06-15', totalFlightHours: 215, totalFlights: 178, totalCycles: 195, status: 'active', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-003-A', installDate: '2025-06-15', flightHoursSinceInstall: 215, lifeLimit: 500, remainingLife: 57, condition: 'fair' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-003-B', installDate: '2025-06-15', flightHoursSinceInstall: 215, lifeLimit: 500, remainingLife: 57, condition: 'fair' },
    { name: 'Propellers', type: 'propeller', serialNumber: 'PRP-003-SET1', installDate: '2025-06-15', flightHoursSinceInstall: 215, lifeLimit: 200, remainingLife: 0, condition: 'replace_now' },
    { name: 'Gimbal Assembly', type: 'gimbal', serialNumber: 'GMB-003', installDate: '2025-06-15', flightHoursSinceInstall: 215, lifeLimit: 1000, remainingLife: 79, condition: 'good' },
    { name: 'Camera (6K)', type: 'camera', serialNumber: 'CAM-003', installDate: '2025-06-15', flightHoursSinceInstall: 215, lifeLimit: 2000, remainingLife: 89, condition: 'good' },
    { name: 'GPS/GLONASS', type: 'gps', serialNumber: 'GPS-003', installDate: '2025-06-15', flightHoursSinceInstall: 215, lifeLimit: 3000, remainingLife: 93, condition: 'good' },
  ], firmwareVersion: 'v3.2.16', lastCalibration: '2026-01-20', insuranceExpiry: '2026-12-15' },
  { droneId: 'DRN-004', droneName: 'Skydio X10', model: 'Skydio X10', serialNumber: 'SKX10-2024-0891', purchaseDate: '2025-09-01', warrantyExpiry: '2027-09-01', totalFlightHours: 124, totalFlights: 96, totalCycles: 102, status: 'active', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-004-A', installDate: '2025-09-01', flightHoursSinceInstall: 124, lifeLimit: 600, remainingLife: 79, condition: 'good' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-004-B', installDate: '2025-09-01', flightHoursSinceInstall: 124, lifeLimit: 600, remainingLife: 79, condition: 'good' },
    { name: 'Propellers', type: 'propeller', serialNumber: 'PRP-004-SET1', installDate: '2025-09-01', flightHoursSinceInstall: 124, lifeLimit: 250, remainingLife: 50, condition: 'fair' },
    { name: 'AI Navigation Unit', type: 'gps', serialNumber: 'NAV-004', installDate: '2025-09-01', flightHoursSinceInstall: 124, lifeLimit: 5000, remainingLife: 98, condition: 'good' },
    { name: 'Frame Assembly', type: 'frame', serialNumber: 'FRM-004', installDate: '2025-09-01', flightHoursSinceInstall: 124, lifeLimit: 3000, remainingLife: 96, condition: 'good' },
  ], firmwareVersion: 'v24.3.2', lastCalibration: '2026-02-28', insuranceExpiry: '2026-09-01' },
  { droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', model: 'DJI Mavic 3 Thermal', serialNumber: '1ZNBJ9T00C0071', purchaseDate: '2025-03-22', warrantyExpiry: '2027-03-22', totalFlightHours: 456, totalFlights: 389, totalCycles: 410, status: 'maintenance', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-005-A', installDate: '2025-03-22', flightHoursSinceInstall: 456, lifeLimit: 500, remainingLife: 9, condition: 'replace_now' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-005-B', installDate: '2025-03-22', flightHoursSinceInstall: 456, lifeLimit: 500, remainingLife: 9, condition: 'replace_now' },
    { name: 'Gimbal (Thermal)', type: 'gimbal', serialNumber: 'GMB-005T', installDate: '2025-03-22', flightHoursSinceInstall: 456, lifeLimit: 800, remainingLife: 43, condition: 'fair' },
    { name: 'Thermal Sensor', type: 'camera', serialNumber: 'THM-005', installDate: '2025-03-22', flightHoursSinceInstall: 456, lifeLimit: 2000, remainingLife: 77, condition: 'good' },
    { name: 'GPS Module', type: 'gps', serialNumber: 'GPS-005', installDate: '2025-03-22', flightHoursSinceInstall: 456, lifeLimit: 3000, remainingLife: 85, condition: 'good' },
  ], firmwareVersion: 'v01.00.0600', lastCalibration: '2026-01-10', insuranceExpiry: '2026-09-22' },
  { droneId: 'DRN-006', droneName: 'Phantom 4 RTK', model: 'DJI Phantom 4 RTK', serialNumber: '0AXDJ4R00300P2', purchaseDate: '2023-08-15', warrantyExpiry: '2025-08-15', totalFlightHours: 892, totalFlights: 654, totalCycles: 720, status: 'grounded', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-006-A', installDate: '2025-05-01', flightHoursSinceInstall: 340, lifeLimit: 400, remainingLife: 15, condition: 'replace_soon' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-006-B', installDate: '2025-05-01', flightHoursSinceInstall: 340, lifeLimit: 400, remainingLife: 15, condition: 'replace_soon' },
    { name: 'Motor #3', type: 'motor', serialNumber: 'MOT-006-C', installDate: '2023-08-15', flightHoursSinceInstall: 892, lifeLimit: 400, remainingLife: 0, condition: 'replace_now' },
    { name: 'Propellers', type: 'propeller', serialNumber: 'PRP-006-SET5', installDate: '2025-11-10', flightHoursSinceInstall: 80, lifeLimit: 150, remainingLife: 47, condition: 'fair' },
    { name: 'RTK Module', type: 'gps', serialNumber: 'RTK-006', installDate: '2023-08-15', flightHoursSinceInstall: 892, lifeLimit: 3000, remainingLife: 70, condition: 'good' },
    { name: 'Landing Gear', type: 'landing_gear', serialNumber: 'LG-006', installDate: '2023-08-15', flightHoursSinceInstall: 892, lifeLimit: 1500, remainingLife: 41, condition: 'fair' },
  ], firmwareVersion: 'v02.00.0106', lastCalibration: '2025-11-10', insuranceExpiry: '2025-12-15' },
  { droneId: 'DRN-007', droneName: 'Inspire 3', model: 'DJI Inspire 3', serialNumber: 'INS3-2025-04421', purchaseDate: '2025-07-01', warrantyExpiry: '2027-07-01', totalFlightHours: 310, totalFlights: 245, totalCycles: 268, status: 'active', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-007-A', installDate: '2025-07-01', flightHoursSinceInstall: 310, lifeLimit: 600, remainingLife: 48, condition: 'fair' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-007-B', installDate: '2025-07-01', flightHoursSinceInstall: 310, lifeLimit: 600, remainingLife: 48, condition: 'fair' },
    { name: 'Propellers', type: 'propeller', serialNumber: 'PRP-007-SET2', installDate: '2026-01-15', flightHoursSinceInstall: 80, lifeLimit: 200, remainingLife: 60, condition: 'good' },
    { name: 'Gimbal (X9 Air)', type: 'gimbal', serialNumber: 'GMB-007', installDate: '2025-07-01', flightHoursSinceInstall: 310, lifeLimit: 1200, remainingLife: 74, condition: 'good' },
    { name: 'Cinema Camera', type: 'camera', serialNumber: 'CAM-007', installDate: '2025-07-01', flightHoursSinceInstall: 310, lifeLimit: 3000, remainingLife: 90, condition: 'good' },
    { name: 'Frame', type: 'frame', serialNumber: 'FRM-007', installDate: '2025-07-01', flightHoursSinceInstall: 310, lifeLimit: 5000, remainingLife: 94, condition: 'good' },
  ], firmwareVersion: 'v02.01.0200', lastCalibration: '2026-02-20', insuranceExpiry: '2026-07-01' },
  { droneId: 'DRN-008', droneName: 'M30T Enterprise', model: 'DJI Matrice 30T', serialNumber: 'M30T-2025-07892', purchaseDate: '2025-08-10', warrantyExpiry: '2027-08-10', totalFlightHours: 189, totalFlights: 156, totalCycles: 170, status: 'active', components: [
    { name: 'Motor #1', type: 'motor', serialNumber: 'MOT-008-A', installDate: '2025-08-10', flightHoursSinceInstall: 189, lifeLimit: 600, remainingLife: 69, condition: 'good' },
    { name: 'Motor #2', type: 'motor', serialNumber: 'MOT-008-B', installDate: '2025-08-10', flightHoursSinceInstall: 189, lifeLimit: 600, remainingLife: 69, condition: 'good' },
    { name: 'Propellers', type: 'propeller', serialNumber: 'PRP-008-SET1', installDate: '2025-08-10', flightHoursSinceInstall: 189, lifeLimit: 250, remainingLife: 24, condition: 'replace_soon' },
    { name: 'Thermal Camera', type: 'camera', serialNumber: 'THM-008', installDate: '2025-08-10', flightHoursSinceInstall: 189, lifeLimit: 2000, remainingLife: 91, condition: 'good' },
    { name: 'Landing Gear', type: 'landing_gear', serialNumber: 'LG-008-R', installDate: '2026-03-13', flightHoursSinceInstall: 0, lifeLimit: 2000, remainingLife: 100, condition: 'good' },
    { name: 'GPS/RTK', type: 'gps', serialNumber: 'GPS-008', installDate: '2025-08-10', flightHoursSinceInstall: 189, lifeLimit: 3000, remainingLife: 94, condition: 'good' },
  ], firmwareVersion: 'v07.01.0203', lastCalibration: '2026-03-13', insuranceExpiry: '2026-11-10' },
];

const mockBatteries: BatteryRecord[] = [
  { id: 'BAT-001', serialNumber: 'TB65-001-A', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', model: 'TB65', chemistry: 'LiPo', capacity: 5880, cellCount: 6, purchaseDate: '2024-11-20', cycleCount: 312, maxCycles: 400, healthPercentage: 78, status: 'in_use', lastChargeDate: '2026-03-19', lastDischargeVoltage: 22.1, internalResistance: [12, 13, 12, 14, 13, 15], swellDetected: false, storageVoltage: 22.8, temperatureHistory: [{ date: '2026-03-19', max: 42, avg: 36 }, { date: '2026-03-15', max: 44, avg: 38 }], estimatedRemainingLife: 62, notes: '' },
  { id: 'BAT-002', serialNumber: 'TB65-001-B', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', model: 'TB65', chemistry: 'LiPo', capacity: 5880, cellCount: 6, purchaseDate: '2024-11-20', cycleCount: 298, maxCycles: 400, healthPercentage: 82, status: 'charging', lastChargeDate: '2026-03-20', lastDischargeVoltage: 21.8, internalResistance: [11, 12, 11, 12, 13, 12], swellDetected: false, storageVoltage: 22.8, temperatureHistory: [{ date: '2026-03-20', max: 38, avg: 34 }], estimatedRemainingLife: 68, notes: 'Spare set for M350' },
  { id: 'BAT-003', serialNumber: 'M3E-BAT-001', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', model: 'BWX260-5000', chemistry: 'LiPo', capacity: 5000, cellCount: 4, purchaseDate: '2025-04-10', cycleCount: 287, maxCycles: 500, healthPercentage: 85, status: 'in_use', lastChargeDate: '2026-03-19', lastDischargeVoltage: 14.2, internalResistance: [8, 9, 8, 9], swellDetected: false, storageVoltage: 15.4, temperatureHistory: [{ date: '2026-03-19', max: 40, avg: 35 }], estimatedRemainingLife: 72, notes: '' },
  { id: 'BAT-004', serialNumber: 'M3E-BAT-002', model: 'BWX260-5000', chemistry: 'LiPo', capacity: 5000, cellCount: 4, purchaseDate: '2025-04-10', cycleCount: 145, maxCycles: 500, healthPercentage: 94, status: 'available', lastChargeDate: '2026-03-18', lastDischargeVoltage: 14.8, internalResistance: [7, 7, 8, 7], swellDetected: false, storageVoltage: 15.4, temperatureHistory: [{ date: '2026-03-18', max: 36, avg: 32 }], estimatedRemainingLife: 88, notes: 'Spare for Mavic 3E fleet' },
  { id: 'BAT-005', serialNumber: 'EVO2-BAT-001', droneId: 'DRN-003', droneName: 'EVO II Pro #1', model: 'Autel 7100mAh', chemistry: 'LiHV', capacity: 7100, cellCount: 4, purchaseDate: '2025-06-15', cycleCount: 178, maxCycles: 400, healthPercentage: 71, status: 'in_use', lastChargeDate: '2026-03-17', lastDischargeVoltage: 14.0, internalResistance: [14, 16, 15, 18], swellDetected: false, storageVoltage: 15.6, temperatureHistory: [{ date: '2026-03-17', max: 48, avg: 41 }], estimatedRemainingLife: 55, notes: 'High temps noted - monitor closely' },
  { id: 'BAT-006', serialNumber: 'SKX10-BAT-001', droneId: 'DRN-004', droneName: 'Skydio X10', model: 'Skydio X10 Battery', chemistry: 'LiIon', capacity: 4800, cellCount: 4, purchaseDate: '2025-09-01', cycleCount: 96, maxCycles: 600, healthPercentage: 96, status: 'in_use', lastChargeDate: '2026-03-20', lastDischargeVoltage: 14.6, internalResistance: [6, 6, 7, 6], swellDetected: false, storageVoltage: 15.2, temperatureHistory: [{ date: '2026-03-20', max: 35, avg: 30 }], estimatedRemainingLife: 92, notes: '' },
  { id: 'BAT-007', serialNumber: 'TB65-002-A', model: 'TB65', chemistry: 'LiPo', capacity: 5880, cellCount: 6, purchaseDate: '2025-02-15', cycleCount: 380, maxCycles: 400, healthPercentage: 45, status: 'storage', lastChargeDate: '2026-03-01', lastDischargeVoltage: 20.5, internalResistance: [22, 25, 28, 24, 26, 30], swellDetected: true, storageVoltage: 22.8, temperatureHistory: [{ date: '2026-03-01', max: 52, avg: 44 }], estimatedRemainingLife: 18, notes: 'SWELL DETECTED - Retire immediately. Do not use.' },
  { id: 'BAT-008', serialNumber: 'M3T-BAT-001', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', model: 'BWX260-5000', chemistry: 'LiPo', capacity: 5000, cellCount: 4, purchaseDate: '2025-03-22', cycleCount: 389, maxCycles: 500, healthPercentage: 58, status: 'storage', lastChargeDate: '2026-03-15', lastDischargeVoltage: 13.8, internalResistance: [16, 18, 17, 20], swellDetected: false, storageVoltage: 15.4, temperatureHistory: [{ date: '2026-03-15', max: 46, avg: 40 }], estimatedRemainingLife: 35, notes: 'Health declining - replacement recommended' },
  { id: 'BAT-009', serialNumber: 'P4R-BAT-001', model: 'PH4-5870', chemistry: 'LiPo', capacity: 5870, cellCount: 4, purchaseDate: '2023-08-15', cycleCount: 520, maxCycles: 500, healthPercentage: 32, status: 'retired', lastChargeDate: '2025-12-01', lastDischargeVoltage: 13.2, internalResistance: [32, 35, 38, 40], swellDetected: true, storageVoltage: 15.2, temperatureHistory: [{ date: '2025-12-01', max: 55, avg: 48 }], estimatedRemainingLife: 0, notes: 'Retired. Exceeded max cycles. Swell detected.' },
  { id: 'BAT-010', serialNumber: 'INS3-BAT-001', droneId: 'DRN-007', droneName: 'Inspire 3', model: 'TB51', chemistry: 'LiPo', capacity: 4280, cellCount: 6, purchaseDate: '2025-07-01', cycleCount: 245, maxCycles: 400, healthPercentage: 76, status: 'in_use', lastChargeDate: '2026-03-20', lastDischargeVoltage: 22.5, internalResistance: [13, 14, 13, 15, 14, 16], swellDetected: false, storageVoltage: 22.8, temperatureHistory: [{ date: '2026-03-20', max: 41, avg: 37 }], estimatedRemainingLife: 58, notes: '' },
  { id: 'BAT-011', serialNumber: 'M30T-BAT-001', droneId: 'DRN-008', droneName: 'M30T Enterprise', model: 'BS65', chemistry: 'LiPo', capacity: 5880, cellCount: 6, purchaseDate: '2025-08-10', cycleCount: 156, maxCycles: 400, healthPercentage: 89, status: 'in_use', lastChargeDate: '2026-03-19', lastDischargeVoltage: 22.8, internalResistance: [10, 11, 10, 11, 12, 11], swellDetected: false, storageVoltage: 22.8, temperatureHistory: [{ date: '2026-03-19', max: 39, avg: 34 }], estimatedRemainingLife: 78, notes: '' },
  { id: 'BAT-012', serialNumber: 'M30T-BAT-002', model: 'BS65', chemistry: 'LiPo', capacity: 5880, cellCount: 6, purchaseDate: '2025-08-10', cycleCount: 42, maxCycles: 400, healthPercentage: 98, status: 'available', lastChargeDate: '2026-03-16', lastDischargeVoltage: 23.4, internalResistance: [8, 8, 9, 8, 9, 8], swellDetected: false, storageVoltage: 22.8, temperatureHistory: [{ date: '2026-03-16', max: 34, avg: 29 }], estimatedRemainingLife: 96, notes: 'Backup battery, low usage' },
];

const mockStats: MaintenanceStats = {
  totalRecords: mockMaintenanceRecords.length,
  completedThisMonth: mockMaintenanceRecords.filter((r) => r.status === 'completed' && r.completedDate?.startsWith('2026-03')).length,
  overdueCount: mockMaintenanceRecords.filter((r) => r.status === 'overdue').length,
  upcomingThisWeek: mockMaintenanceRecords.filter((r) => {
    if (r.status !== 'scheduled') return false;
    const d = new Date(r.scheduledDate);
    const now = new Date('2026-03-20');
    const weekLater = new Date('2026-03-27');
    return d >= now && d <= weekLater;
  }).length,
  avgCostPerService: Math.round(mockMaintenanceRecords.filter((r) => r.cost).reduce((s, r) => s + (r.cost ?? 0), 0) / mockMaintenanceRecords.filter((r) => r.cost && r.cost > 0).length),
  totalCostYTD: mockMaintenanceRecords.filter((r) => r.cost).reduce((s, r) => s + (r.cost ?? 0), 0),
  fleetHealthScore: 74,
  batteryFleetHealth: 76,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

type TabId = 'maintenance' | 'batteries' | 'fleet_health';
type MaintenanceStatusFilter = 'all' | MaintenanceRecord['status'];
type MaintenanceTypeFilter = 'all' | MaintenanceRecord['type'];
type MaintenancePriorityFilter = 'all' | MaintenanceRecord['priority'];
type BatteryStatusFilter = 'all' | BatteryRecord['status'];
type BatteryHealthFilter = 'all' | 'healthy' | 'warning' | 'critical';
type SortField = 'scheduledDate' | 'droneName' | 'type' | 'status' | 'priority';
type SortDir = 'asc' | 'desc';

const statusColors: Record<MaintenanceRecord['status'], { bg: string; text: string; dot: string }> = {
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const priorityConfig: Record<MaintenanceRecord['priority'], { label: string; color: string; icon: typeof AlertTriangle }> = {
  low: { label: 'Low', color: 'text-gray-500', icon: ChevronDown },
  medium: { label: 'Medium', color: 'text-blue-600', icon: Activity },
  high: { label: 'High', color: 'text-amber-600', icon: AlertTriangle },
  critical: { label: 'Critical', color: 'text-red-600', icon: AlertCircle },
};

const typeLabels: Record<MaintenanceRecord['type'], string> = {
  scheduled: 'Scheduled',
  unscheduled: 'Unscheduled',
  inspection: 'Inspection',
  repair: 'Repair',
  firmware_update: 'Firmware Update',
  calibration: 'Calibration',
};

const batteryStatusColors: Record<BatteryRecord['status'], { bg: string; text: string }> = {
  available: { bg: 'bg-green-50', text: 'text-green-700' },
  in_use: { bg: 'bg-blue-50', text: 'text-blue-700' },
  charging: { bg: 'bg-amber-50', text: 'text-amber-700' },
  storage: { bg: 'bg-gray-50', text: 'text-gray-600' },
  retired: { bg: 'bg-red-50', text: 'text-red-700' },
  damaged: { bg: 'bg-red-100', text: 'text-red-800' },
};

const conditionColors: Record<string, string> = {
  good: 'bg-green-500',
  fair: 'bg-amber-500',
  replace_soon: 'bg-orange-500',
  replace_now: 'bg-red-500',
};

const lifecycleStatusColors: Record<DroneLifecycle['status'], { bg: string; text: string }> = {
  active: { bg: 'bg-green-50', text: 'text-green-700' },
  maintenance: { bg: 'bg-amber-50', text: 'text-amber-700' },
  grounded: { bg: 'bg-red-50', text: 'text-red-700' },
  retired: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

function daysUntil(dateStr: string): number {
  const now = new Date('2026-03-20');
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<TabId>('maintenance');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<MaintenanceTypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<MaintenancePriorityFilter>('all');
  const [droneFilter, setDroneFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('scheduledDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [batteryStatusFilter, setBatteryStatusFilter] = useState<BatteryStatusFilter>('all');
  const [batteryHealthFilter, setBatteryHealthFilter] = useState<BatteryHealthFilter>('all');
  const [batteryAssignedFilter, setBatteryAssignedFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Schedule form state
  const [formDrone, setFormDrone] = useState('');
  const [formType, setFormType] = useState<MaintenanceRecord['type']>('scheduled');
  const [formPriority, setFormPriority] = useState<MaintenanceRecord['priority']>('medium');
  const [formDate, setFormDate] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTechnician, setFormTechnician] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formParts, setFormParts] = useState<Array<{ name: string; partNumber: string; quantity: number; cost: number }>>([]);

  const tabs: { id: TabId; label: string; icon: typeof Wrench }[] = [
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'batteries', label: 'Battery Management', icon: Battery },
    { id: 'fleet_health', label: 'Fleet Health', icon: Activity },
  ];

  // Unique drone names for filter
  const droneNames = [...new Set(mockMaintenanceRecords.map((r) => r.droneName))];

  // ─── Maintenance Tab Logic ──────────────────────────────────────────────────

  const filteredRecords = mockMaintenanceRecords
    .filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
      if (droneFilter !== 'all' && r.droneName !== droneFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.droneName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'scheduledDate') cmp = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      else if (sortField === 'droneName') cmp = a.droneName.localeCompare(b.droneName);
      else if (sortField === 'type') cmp = a.type.localeCompare(b.type);
      else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'priority') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        cmp = order[a.priority] - order[b.priority];
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // Upcoming grouped by week
  const upcomingRecords = mockMaintenanceRecords
    .filter((r) => r.status === 'scheduled' || r.status === 'overdue')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const thisWeek = upcomingRecords.filter((r) => {
    const d = new Date(r.scheduledDate);
    const now = new Date('2026-03-20');
    const weekEnd = new Date('2026-03-27');
    return d >= now && d <= weekEnd;
  });
  const nextWeek = upcomingRecords.filter((r) => {
    const d = new Date(r.scheduledDate);
    return d > new Date('2026-03-27') && d <= new Date('2026-04-03');
  });
  const later = upcomingRecords.filter((r) => new Date(r.scheduledDate) > new Date('2026-04-03'));
  const overdueItems = upcomingRecords.filter((r) => r.status === 'overdue');

  // ─── Battery Tab Logic ──────────────────────────────────────────────────────

  const filteredBatteries = mockBatteries.filter((b) => {
    if (batteryStatusFilter !== 'all' && b.status !== batteryStatusFilter) return false;
    if (batteryHealthFilter === 'healthy' && b.healthPercentage < 80) return false;
    if (batteryHealthFilter === 'warning' && (b.healthPercentage < 60 || b.healthPercentage >= 80)) return false;
    if (batteryHealthFilter === 'critical' && b.healthPercentage >= 60) return false;
    if (batteryAssignedFilter === 'assigned' && !b.droneId) return false;
    if (batteryAssignedFilter === 'unassigned' && b.droneId) return false;
    return true;
  });

  const batteriesNeedingReplacement = mockBatteries.filter((b) => b.healthPercentage < 60 && b.status !== 'retired');

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={14} className="text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance & Lifecycle</h1>
          <p className="text-sm text-gray-500 mt-1">Track maintenance, battery health, and fleet component lifecycle</p>
        </div>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Schedule Maintenance
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'maintenance' && mockStats.overdueCount > 0 && (
                  <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{mockStats.overdueCount}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: MAINTENANCE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Records', value: mockStats.totalRecords, icon: Wrench, color: 'bg-blue-50 text-blue-600' },
              { label: 'Completed (Mar)', value: mockStats.completedThisMonth, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
              { label: 'Overdue', value: mockStats.overdueCount, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
              { label: 'This Week', value: mockStats.upcomingThisWeek, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
              { label: 'Avg Cost', value: `$${mockStats.avgCostPerService}`, icon: TrendingDown, color: 'bg-amber-50 text-amber-600' },
              { label: 'YTD Cost', value: `$${mockStats.totalCostYTD.toLocaleString()}`, icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className={clsx('text-lg font-bold', stat.label === 'Overdue' && mockStats.overdueCount > 0 ? 'text-red-600' : 'text-gray-900')}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overdue Alert Banner */}
          {mockStats.overdueCount > 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertTriangle size={20} className="text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">{mockStats.overdueCount} Overdue Maintenance Item{mockStats.overdueCount > 1 ? 's' : ''}</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {overdueItems.map((r) => `${r.droneName}: ${r.title}`).join(' | ')}
                </p>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3">
            <Filter size={16} className="text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatusFilter)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as MaintenanceTypeFilter)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="all">All Types</option>
              <option value="scheduled">Scheduled</option>
              <option value="unscheduled">Unscheduled</option>
              <option value="inspection">Inspection</option>
              <option value="repair">Repair</option>
              <option value="firmware_update">Firmware Update</option>
              <option value="calibration">Calibration</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as MaintenancePriorityFilter)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={droneFilter} onChange={(e) => setDroneFilter(e.target.value)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="all">All Drones</option>
              {droneNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <div className="relative ml-auto">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search records..."
                className="rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm w-56"
              />
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('scheduledDate')}>
                    <span className="inline-flex items-center gap-1">Date <SortIcon field="scheduledDate" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('droneName')}>
                    <span className="inline-flex items-center gap-1">Drone <SortIcon field="droneName" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('type')}>
                    <span className="inline-flex items-center gap-1">Type <SortIcon field="type" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    <span className="inline-flex items-center gap-1">Status <SortIcon field="status" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('priority')}>
                    <span className="inline-flex items-center gap-1">Priority <SortIcon field="priority" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Cost</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((record) => {
                  const sc = statusColors[record.status];
                  const pc = priorityConfig[record.priority];
                  const PIcon = pc.icon;
                  const isExpanded = expandedRow === record.id;
                  return (
                    <Fragment key={record.id}>
                      <tr className={clsx('hover:bg-gray-50 transition-colors', record.status === 'overdue' && 'bg-red-50/40')}>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{record.id}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(record.scheduledDate)}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{record.droneName}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{typeLabels[record.type]}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate" title={record.title}>{record.title}</td>
                        <td className="px-4 py-3">
                          <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', sc.bg, sc.text)}>
                            <span className={clsx('h-1.5 w-1.5 rounded-full', sc.dot)} />
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx('inline-flex items-center gap-1 text-xs font-medium', pc.color)}>
                            <PIcon size={13} />
                            {pc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{record.cost != null ? `$${record.cost}` : '--'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setExpandedRow(isExpanded ? null : record.id)} className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="bg-gray-50 px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                                  <p className="text-sm text-gray-700 mt-1">{record.description}</p>
                                </div>
                                {record.technician && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Technician</p>
                                    <p className="text-sm text-gray-700 mt-1">{record.technician}</p>
                                  </div>
                                )}
                                {record.notes && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Notes</p>
                                    <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Flight Hours at Service</p>
                                  <p className="text-sm text-gray-700 mt-1">{record.flightHoursAtService} hrs</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Next Service Due</p>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {record.nextServiceDue.hours && `${record.nextServiceDue.hours} hrs`}
                                    {record.nextServiceDue.hours && record.nextServiceDue.date && ' / '}
                                    {record.nextServiceDue.date && formatDate(record.nextServiceDue.date)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                {record.parts.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Parts</p>
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-gray-500">
                                          <th className="text-left pb-1">Part</th>
                                          <th className="text-left pb-1">Part #</th>
                                          <th className="text-right pb-1">Qty</th>
                                          <th className="text-right pb-1">Cost</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {record.parts.map((p, i) => (
                                          <tr key={i}>
                                            <td className="py-1 text-gray-700">{p.name}</td>
                                            <td className="py-1 font-mono text-gray-500">{p.partNumber}</td>
                                            <td className="py-1 text-right text-gray-700">{p.quantity}</td>
                                            <td className="py-1 text-right text-gray-700">${p.cost}</td>
                                          </tr>
                                        ))}
                                        <tr className="font-semibold">
                                          <td colSpan={3} className="py-1 text-gray-700">Total Parts Cost</td>
                                          <td className="py-1 text-right text-gray-900">${record.parts.reduce((s, p) => s + p.cost * p.quantity, 0)}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Upcoming Maintenance Calendar View */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
              <Calendar size={18} className="text-blue-600" />
              Upcoming Maintenance Schedule
            </h3>
            <div className="space-y-5">
              {overdueItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase mb-2">Overdue</p>
                  <div className="space-y-2">
                    {overdueItems.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <span className="text-sm font-medium text-red-800">{r.droneName}</span>
                        <span className="text-sm text-red-600">{r.title}</span>
                        <span className="ml-auto text-xs text-red-500">{formatDate(r.scheduledDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {thisWeek.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">This Week (Mar 20 - 27)</p>
                  <div className="space-y-2">
                    {thisWeek.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-blue-50 px-4 py-2.5">
                        <Clock size={16} className="text-blue-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{r.droneName}</span>
                        <span className="text-sm text-gray-600">{r.title}</span>
                        <span className="ml-auto text-xs text-gray-500">{formatDate(r.scheduledDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {nextWeek.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Next Week (Mar 28 - Apr 3)</p>
                  <div className="space-y-2">
                    {nextWeek.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-2.5">
                        <Calendar size={16} className="text-gray-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{r.droneName}</span>
                        <span className="text-sm text-gray-600">{r.title}</span>
                        <span className="ml-auto text-xs text-gray-500">{formatDate(r.scheduledDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {later.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Later</p>
                  <div className="space-y-2">
                    {later.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-2.5">
                        <Calendar size={16} className="text-gray-300 shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{r.droneName}</span>
                        <span className="text-sm text-gray-600">{r.title}</span>
                        <span className="ml-auto text-xs text-gray-500">{formatDate(r.scheduledDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Maintenance Form Modal */}
          {showScheduleForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Maintenance</h3>
                  <button onClick={() => setShowScheduleForm(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Drone</label>
                    <select value={formDrone} onChange={(e) => setFormDrone(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      <option value="">Select drone...</option>
                      {droneNames.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value as MaintenanceRecord['type'])} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                    <select value={formPriority} onChange={(e) => setFormPriority(e.target.value as MaintenanceRecord['priority'])} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Scheduled Date</label>
                    <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                    <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Maintenance title..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Describe the maintenance..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Technician</label>
                    <input value={formTechnician} onChange={(e) => setFormTechnician(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Assigned technician..." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                    <input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Additional notes..." />
                  </div>
                  {/* Parts List */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">Parts</label>
                      <button
                        onClick={() => setFormParts([...formParts, { name: '', partNumber: '', quantity: 1, cost: 0 }])}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Plus size={12} /> Add Part
                      </button>
                    </div>
                    {formParts.map((part, i) => (
                      <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                        <input value={part.name} onChange={(e) => { const p = [...formParts]; p[i].name = e.target.value; setFormParts(p); }} className="col-span-2 rounded-md border border-gray-300 px-2 py-1.5 text-xs" placeholder="Part name" />
                        <input value={part.partNumber} onChange={(e) => { const p = [...formParts]; p[i].partNumber = e.target.value; setFormParts(p); }} className="rounded-md border border-gray-300 px-2 py-1.5 text-xs" placeholder="Part #" />
                        <input type="number" value={part.quantity} onChange={(e) => { const p = [...formParts]; p[i].quantity = +e.target.value; setFormParts(p); }} className="rounded-md border border-gray-300 px-2 py-1.5 text-xs" placeholder="Qty" />
                        <div className="flex gap-1">
                          <input type="number" value={part.cost} onChange={(e) => { const p = [...formParts]; p[i].cost = +e.target.value; setFormParts(p); }} className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs" placeholder="Cost" />
                          <button onClick={() => setFormParts(formParts.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><XCircle size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button onClick={() => setShowScheduleForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => setShowScheduleForm(false)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Schedule</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: BATTERY MANAGEMENT */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'batteries' && (
        <div className="space-y-6">
          {/* Fleet Battery Health Score */}
          <div className="flex items-center gap-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-50">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{mockStats.batteryFleetHealth}%</p>
                <p className="text-[10px] text-amber-500 uppercase font-medium">Health</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Fleet Battery Health</h3>
              <p className="text-sm text-gray-500 mt-1">{mockBatteries.length} batteries tracked | {mockBatteries.filter((b) => b.status === 'in_use').length} in use | {mockBatteries.filter((b) => b.swellDetected).length} swell warnings</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <Plus size={14} /> Add Battery
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          {/* Battery Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3">
            <Filter size={16} className="text-gray-400" />
            <select value={batteryStatusFilter} onChange={(e) => setBatteryStatusFilter(e.target.value as BatteryStatusFilter)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="charging">Charging</option>
              <option value="storage">Storage</option>
              <option value="retired">Retired</option>
              <option value="damaged">Damaged</option>
            </select>
            <select value={batteryHealthFilter} onChange={(e) => setBatteryHealthFilter(e.target.value as BatteryHealthFilter)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="all">All Health</option>
              <option value="healthy">Healthy (80%+)</option>
              <option value="warning">Warning (60-79%)</option>
              <option value="critical">Critical (&lt;60%)</option>
            </select>
            <select value={batteryAssignedFilter} onChange={(e) => setBatteryAssignedFilter(e.target.value as 'all' | 'assigned' | 'unassigned')} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
              <option value="all">All Assignment</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          {/* Battery Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBatteries.map((bat) => {
              const bsc = batteryStatusColors[bat.status];
              const healthColor = bat.healthPercentage >= 80 ? 'text-green-600' : bat.healthPercentage >= 60 ? 'text-amber-600' : 'text-red-600';
              const healthBg = bat.healthPercentage >= 80 ? 'bg-green-500' : bat.healthPercentage >= 60 ? 'bg-amber-500' : 'bg-red-500';
              const cyclePercent = Math.round((bat.cycleCount / bat.maxCycles) * 100);
              const cycleBg = cyclePercent < 70 ? 'bg-blue-500' : cyclePercent < 90 ? 'bg-amber-500' : 'bg-red-500';
              const maxRes = Math.max(...bat.internalResistance);

              return (
                <div key={bat.id} className={clsx('rounded-xl border bg-white p-5 shadow-sm', bat.swellDetected && 'border-red-300 ring-1 ring-red-200')}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {bat.status === 'charging' ? <BatteryCharging size={20} className="text-amber-500" /> : bat.swellDetected ? <BatteryWarning size={20} className="text-red-500" /> : <Battery size={20} className="text-blue-500" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{bat.serialNumber}</p>
                        <p className="text-xs text-gray-500">{bat.model} | {bat.cellCount}S {bat.chemistry}</p>
                      </div>
                    </div>
                    <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', bsc.bg, bsc.text)}>
                      {bat.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Swell Warning */}
                  {bat.swellDetected && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 mb-3">
                      <AlertTriangle size={14} className="text-red-600 shrink-0" />
                      <p className="text-xs font-semibold text-red-700">SWELL DETECTED - Do not use</p>
                    </div>
                  )}

                  {/* Assignment */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-gray-500">Assigned to:</span>
                    <span className={clsx('font-medium', bat.droneName ? 'text-gray-900' : 'text-green-600')}>{bat.droneName || 'Available'}</span>
                  </div>

                  {/* Health */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Health</span>
                      <span className={clsx('font-bold text-sm', healthColor)}>{bat.healthPercentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className={clsx('h-2 rounded-full', healthBg)} style={{ width: `${bat.healthPercentage}%` }} />
                    </div>
                  </div>

                  {/* Cycles */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Cycles</span>
                      <span className="font-medium text-gray-700">{bat.cycleCount}/{bat.maxCycles}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className={clsx('h-2 rounded-full', cycleBg)} style={{ width: `${Math.min(cyclePercent, 100)}%` }} />
                    </div>
                  </div>

                  {/* Cell Internal Resistance Bars */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">Cell Resistance (m&#937;)</p>
                    <div className="flex items-end gap-1 h-8">
                      {bat.internalResistance.map((r, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div
                            className={clsx('w-full rounded-t', r < 15 ? 'bg-green-400' : r < 25 ? 'bg-amber-400' : 'bg-red-400')}
                            style={{ height: `${Math.max((r / maxRes) * 24, 4)}px` }}
                            title={`Cell ${i + 1}: ${r}m\u03A9`}
                          />
                          <span className="text-[9px] text-gray-400">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-500">Last Charge</span>
                      <p className="text-gray-700 font-medium">{formatDate(bat.lastChargeDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Life Left</span>
                      <p className={clsx('font-medium', bat.estimatedRemainingLife >= 50 ? 'text-gray-700' : 'text-red-600')}>{bat.estimatedRemainingLife}%</p>
                    </div>
                  </div>

                  {/* Action */}
                  {bat.healthPercentage < 50 && bat.status !== 'retired' && (
                    <button className="mt-3 w-full rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                      Retire Battery
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Battery Replacement Recommendations */}
          {batteriesNeedingReplacement.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-3">
                <BatteryWarning size={16} />
                Battery Replacement Recommendations
              </h3>
              <div className="space-y-2">
                {batteriesNeedingReplacement.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-lg bg-white border border-amber-100 px-4 py-2.5">
                    <Battery size={16} className={clsx(b.healthPercentage < 40 ? 'text-red-500' : 'text-amber-500')} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{b.serialNumber}</span>
                      <span className="text-xs text-gray-500 ml-2">({b.model})</span>
                    </div>
                    <span className={clsx('text-sm font-bold', b.healthPercentage < 40 ? 'text-red-600' : 'text-amber-600')}>{b.healthPercentage}% health</span>
                    <span className="text-xs text-gray-500">{b.cycleCount}/{b.maxCycles} cycles</span>
                    {b.swellDetected && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">SWELL</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: FLEET HEALTH */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'fleet_health' && (
        <div className="space-y-6">
          {/* Overall Fleet Health Score */}
          <div className="flex items-center gap-6 rounded-xl border bg-white p-6 shadow-sm">
            <div className={clsx(
              'flex h-28 w-28 items-center justify-center rounded-full border-4',
              mockStats.fleetHealthScore >= 80 ? 'border-green-400 bg-green-50' : mockStats.fleetHealthScore >= 60 ? 'border-amber-400 bg-amber-50' : 'border-red-400 bg-red-50'
            )}>
              <div className="text-center">
                <p className={clsx('text-3xl font-bold', mockStats.fleetHealthScore >= 80 ? 'text-green-600' : mockStats.fleetHealthScore >= 60 ? 'text-amber-600' : 'text-red-600')}>
                  {mockStats.fleetHealthScore}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-medium">Fleet Score</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Fleet Health Overview</h3>
              <p className="text-sm text-gray-500 mt-1">
                {mockDroneLifecycles.filter((d) => d.status === 'active').length} active | {mockDroneLifecycles.filter((d) => d.status === 'maintenance').length} in maintenance | {mockDroneLifecycles.filter((d) => d.status === 'grounded').length} grounded
              </p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Good
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Fair
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Replace Soon
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Replace Now
                </div>
              </div>
            </div>
          </div>

          {/* Per-Drone Health Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {mockDroneLifecycles.map((drone) => {
              const lsc = lifecycleStatusColors[drone.status];
              const warrantyDays = daysUntil(drone.warrantyExpiry);
              const insuranceDays = daysUntil(drone.insuranceExpiry);
              const avgComponentLife = Math.round(drone.components.reduce((s, c) => s + c.remainingLife, 0) / drone.components.length);
              const droneHealthColor = avgComponentLife >= 60 ? 'text-green-600' : avgComponentLife >= 40 ? 'text-amber-600' : 'text-red-600';

              return (
                <div key={drone.droneId} className={clsx('rounded-xl border bg-white p-5 shadow-sm', drone.status === 'grounded' && 'border-red-200')}>
                  {/* Drone Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900">{drone.droneName}</h4>
                        <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', lsc.bg, lsc.text)}>{drone.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{drone.model} | SN: {drone.serialNumber}</p>
                    </div>
                    <div className={clsx('text-right')}>
                      <p className={clsx('text-xl font-bold', droneHealthColor)}>{avgComponentLife}%</p>
                      <p className="text-[10px] text-gray-400 uppercase">Avg Health</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                      <p className="text-sm font-bold text-gray-900">{drone.totalFlightHours}</p>
                      <p className="text-[10px] text-gray-500">Flight Hours</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                      <p className="text-sm font-bold text-gray-900">{drone.totalFlights}</p>
                      <p className="text-[10px] text-gray-500">Total Flights</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                      <p className="text-sm font-bold text-gray-900">{drone.totalCycles}</p>
                      <p className="text-[10px] text-gray-500">Cycles</p>
                    </div>
                  </div>

                  {/* Component Wear Bars */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Component Health</p>
                    <div className="space-y-1.5">
                      {drone.components.map((comp, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-24 truncate" title={comp.name}>{comp.name}</span>
                          <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={clsx('h-3 rounded-full transition-all', conditionColors[comp.condition])}
                              style={{ width: `${comp.remainingLife}%` }}
                            />
                          </div>
                          <span className={clsx('text-[10px] font-medium w-8 text-right',
                            comp.condition === 'good' ? 'text-green-600' : comp.condition === 'fair' ? 'text-amber-600' : comp.condition === 'replace_soon' ? 'text-orange-600' : 'text-red-600'
                          )}>
                            {comp.remainingLife}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={12} className="text-gray-400" />
                      <span className="text-gray-500">Firmware:</span>
                      <span className="font-medium text-gray-700">{drone.firmwareVersion}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RefreshCw size={12} className="text-gray-400" />
                      <span className="text-gray-500">Calibrated:</span>
                      <span className="font-medium text-gray-700">{formatDate(drone.lastCalibration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className={warrantyDays < 0 ? 'text-red-400' : warrantyDays < 90 ? 'text-amber-400' : 'text-gray-400'} />
                      <span className="text-gray-500">Warranty:</span>
                      <span className={clsx('font-medium', warrantyDays < 0 ? 'text-red-600' : warrantyDays < 90 ? 'text-amber-600' : 'text-gray-700')}>
                        {warrantyDays < 0 ? 'Expired' : `${warrantyDays}d left`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className={insuranceDays < 0 ? 'text-red-400' : insuranceDays < 60 ? 'text-amber-400' : 'text-gray-400'} />
                      <span className="text-gray-500">Insurance:</span>
                      <span className={clsx('font-medium', insuranceDays < 0 ? 'text-red-600' : insuranceDays < 60 ? 'text-amber-600' : 'text-gray-700')}>
                        {insuranceDays < 0 ? 'Expired' : `${insuranceDays}d left`}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                      <Wrench size={12} /> Schedule Service
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                      <Clock size={12} /> View History
                    </button>
                    {drone.status !== 'grounded' && drone.status !== 'retired' && (
                      <button className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 ml-auto">
                        <XCircle size={12} /> Ground Drone
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Component Lifecycle Chart */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-5">
              <HardDrive size={18} className="text-blue-600" />
              Component Lifecycle Across Fleet
            </h3>
            <div className="space-y-4">
              {(['motor', 'propeller', 'gimbal', 'camera', 'gps', 'esc', 'frame', 'landing_gear'] as const).map((compType) => {
                const comps = mockDroneLifecycles.flatMap((d) =>
                  d.components.filter((c) => c.type === compType).map((c) => ({ ...c, droneName: d.droneName }))
                );
                if (comps.length === 0) return null;
                const typeLabel = compType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                return (
                  <div key={compType}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 uppercase">{typeLabel}</span>
                      <span className="text-xs text-gray-400">({comps.length} units)</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      {comps.map((c, i) => (
                        <div key={i} className="flex-1" title={`${c.droneName} - ${c.name}: ${c.remainingLife}% remaining`}>
                          <div className="h-5 w-full rounded bg-gray-100 overflow-hidden">
                            <div
                              className={clsx('h-5 rounded', conditionColors[c.condition])}
                              style={{ width: `${c.remainingLife}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-gray-400 mt-0.5 truncate">{c.droneName.split(' ')[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
