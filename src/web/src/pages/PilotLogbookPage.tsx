import { useState } from 'react';
import {
  BookOpen, Clock, Plane, MapPin, Calendar, PenLine, Upload, FileText,
  Award, Shield, AlertCircle, ChevronDown, ChevronUp, Plus, Filter,
  Search, Download, CheckCircle, User, Users, CloudSun, Gauge, Navigation,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { FlightLogEntry, PilotCertification } from '../../../shared/types/logbook';

// ─── Tab Types ───
type MainTab = 'logbook' | 'certifications' | 'statistics';
type SortField = 'date' | 'droneName' | 'flightDuration' | 'departureLocation' | 'operationType' | 'conditions' | 'maxAltitudeAGL';
type SortDir = 'asc' | 'desc';

// ─── Mock Data ───
const mockFlightLogs: FlightLogEntry[] = [
  { id: 'FL-001', pilotId: 'P-001', date: '2026-03-19', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', droneModel: 'DJI Mavic 3 Enterprise', serialNumber: '1ZNBJ9E00C00X7', departureLocation: 'Austin Executive Airport, TX', departureCoords: { lat: 30.3965, lng: -97.5658 }, arrivalLocation: 'Austin Executive Airport, TX', flightDuration: 42, hobbs: { start: 341.2, end: 341.9 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'inspection', maxAltitudeAGL: 350, distanceTraveled: 4.8, laancAuthorization: 'LAANC-2026-0319A', weather: { wind: 8, visibility: 10, ceiling: null, temperature: 72 }, incidents: [], notes: 'Bridge inspection along Colorado River. All pylons documented.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Alex Rivera', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-002', pilotId: 'P-001', date: '2026-03-17', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', droneModel: 'DJI Matrice 350 RTK', serialNumber: '1ZNDH3500D002A', departureLocation: 'Mueller District, Austin, TX', departureCoords: { lat: 30.2990, lng: -97.7053 }, arrivalLocation: 'Mueller District, Austin, TX', flightDuration: 68, hobbs: { start: 576.5, end: 577.6 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'survey', maxAltitudeAGL: 400, distanceTraveled: 12.3, laancAuthorization: 'LAANC-2026-0317B', weather: { wind: 5, visibility: 10, ceiling: null, temperature: 68 }, incidents: [], notes: 'Topographic survey for construction site. GCP targets placed.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Sam Chen', role: 'payload_operator' }], signatures: { pilotSignature: true, supervisorSignature: true }, autoLogged: true },
  { id: 'FL-003', pilotId: 'P-001', date: '2026-03-14', droneId: 'DRN-004', droneName: 'Skydio X10', droneModel: 'Skydio X10', serialNumber: 'SKX10-2024-0891', departureLocation: 'Barton Creek Greenbelt, Austin, TX', departureCoords: { lat: 30.2588, lng: -97.8000 }, arrivalLocation: 'Barton Creek Greenbelt, Austin, TX', flightDuration: 35, hobbs: { start: 122.8, end: 123.4 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'search_rescue', maxAltitudeAGL: 200, distanceTraveled: 3.2, weather: { wind: 12, visibility: 8, ceiling: 3500, temperature: 65 }, incidents: ['Gusty conditions required altitude reduction'], notes: 'SAR exercise with APD. Thermal imaging sweep of creek area.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Lt. Davis', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: false },
  { id: 'FL-004', pilotId: 'P-001', date: '2026-03-10', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', droneModel: 'DJI Mavic 3 Enterprise', serialNumber: '1ZNBJ9E00C00X7', departureLocation: 'Round Rock, TX', departureCoords: { lat: 30.5083, lng: -97.6789 }, arrivalLocation: 'Round Rock, TX', flightDuration: 28, hobbs: { start: 340.5, end: 341.0 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'photography', maxAltitudeAGL: 300, distanceTraveled: 2.1, weather: { wind: 4, visibility: 10, ceiling: null, temperature: 75 }, incidents: [], notes: 'Commercial real estate aerial photography for Keller Williams.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-005', pilotId: 'P-001', date: '2026-03-05', droneId: 'DRN-003', droneName: 'EVO II Pro #1', droneModel: 'Autel EVO II Pro V3', serialNumber: '7YBRX2100FN042', departureLocation: 'San Marcos Regional Airport, TX', departureCoords: { lat: 29.8936, lng: -97.8630 }, arrivalLocation: 'San Marcos Regional Airport, TX', flightDuration: 55, hobbs: { start: 213.0, end: 213.9 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'agriculture', maxAltitudeAGL: 250, distanceTraveled: 8.7, laancAuthorization: 'LAANC-2026-0305C', weather: { wind: 6, visibility: 10, ceiling: null, temperature: 70 }, incidents: [], notes: 'NDVI crop health assessment for Hays County ranch.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Maria Gonzales', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-006', pilotId: 'P-001', date: '2026-02-28', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', droneModel: 'DJI Matrice 350 RTK', serialNumber: '1ZNDH3500D002A', departureLocation: 'Georgetown Municipal, TX', departureCoords: { lat: 30.6788, lng: -97.6795 }, arrivalLocation: 'Georgetown Municipal, TX', flightDuration: 82, hobbs: { start: 574.8, end: 576.2 }, conditions: 'day_bvlos', operationType: 'part_107_waiver', missionType: 'inspection', maxAltitudeAGL: 400, distanceTraveled: 18.5, laancAuthorization: 'LAANC-2026-0228D', weather: { wind: 10, visibility: 10, ceiling: null, temperature: 62 }, incidents: [], notes: 'Power line corridor BVLOS inspection. Waiver W2025-0412 active.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Alex Rivera', role: 'visual_observer' }, { name: 'Sam Chen', role: 'payload_operator' }], signatures: { pilotSignature: true, supervisorSignature: true }, autoLogged: true },
  { id: 'FL-007', pilotId: 'P-001', date: '2026-02-22', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', droneModel: 'DJI Mavic 3 Thermal', serialNumber: '1ZNBJ9T00C0071', departureLocation: 'Pflugerville, TX', departureCoords: { lat: 30.4393, lng: -97.6200 }, arrivalLocation: 'Pflugerville, TX', flightDuration: 38, hobbs: { start: 454.1, end: 454.7 }, conditions: 'night_vfr', operationType: 'part_107_waiver', missionType: 'inspection', maxAltitudeAGL: 150, distanceTraveled: 2.9, weather: { wind: 3, visibility: 10, ceiling: null, temperature: 48 }, incidents: [], notes: 'Solar farm thermal inspection. Night ops under waiver W2025-0318.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Alex Rivera', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: false },
  { id: 'FL-008', pilotId: 'P-001', date: '2026-02-18', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', droneModel: 'DJI Mavic 3 Enterprise', serialNumber: '1ZNBJ9E00C00X7', departureLocation: 'Lakeway, TX', departureCoords: { lat: 30.3627, lng: -97.9825 }, arrivalLocation: 'Lakeway, TX', flightDuration: 25, hobbs: { start: 339.8, end: 340.2 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'photography', maxAltitudeAGL: 300, distanceTraveled: 1.8, weather: { wind: 7, visibility: 10, ceiling: null, temperature: 58 }, incidents: [], notes: 'Residential roof inspection after hail damage.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-009', pilotId: 'P-001', date: '2026-02-12', droneId: 'DRN-004', droneName: 'Skydio X10', droneModel: 'Skydio X10', serialNumber: 'SKX10-2024-0891', departureLocation: 'Camp Mabry, Austin, TX', departureCoords: { lat: 30.3168, lng: -97.7645 }, arrivalLocation: 'Camp Mabry, Austin, TX', flightDuration: 45, hobbs: { start: 121.9, end: 122.7 }, conditions: 'day_vfr', operationType: 'training', missionType: 'training', maxAltitudeAGL: 200, distanceTraveled: 3.0, weather: { wind: 5, visibility: 10, ceiling: null, temperature: 55 }, incidents: [], notes: 'Recurrent training exercise. Emergency procedures practice.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Capt. Novak', role: 'visual_observer' }], signatures: { pilotSignature: true, supervisorSignature: true }, autoLogged: false },
  { id: 'FL-010', pilotId: 'P-001', date: '2026-02-05', droneId: 'DRN-003', droneName: 'EVO II Pro #1', droneModel: 'Autel EVO II Pro V3', serialNumber: '7YBRX2100FN042', departureLocation: 'Bastrop State Park, TX', departureCoords: { lat: 30.1104, lng: -97.2903 }, arrivalLocation: 'Bastrop State Park, TX', flightDuration: 60, hobbs: { start: 212.0, end: 213.0 }, conditions: 'day_vfr', operationType: 'public_coa', missionType: 'survey', maxAltitudeAGL: 350, distanceTraveled: 9.5, weather: { wind: 9, visibility: 9, ceiling: 4500, temperature: 52 }, incidents: [], notes: 'Post-fire damage assessment for Texas Parks & Wildlife.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Ranger Lopez', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-011', pilotId: 'P-001', date: '2026-01-29', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', droneModel: 'DJI Matrice 350 RTK', serialNumber: '1ZNDH3500D002A', departureLocation: 'New Braunfels, TX', departureCoords: { lat: 29.7030, lng: -98.1245 }, arrivalLocation: 'New Braunfels, TX', flightDuration: 72, hobbs: { start: 573.5, end: 574.7 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'survey', maxAltitudeAGL: 400, distanceTraveled: 14.2, laancAuthorization: 'LAANC-2026-0129E', weather: { wind: 8, visibility: 10, ceiling: null, temperature: 45 }, incidents: [], notes: 'Volumetric quarry survey with LiDAR payload.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Sam Chen', role: 'payload_operator' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-012', pilotId: 'P-001', date: '2026-01-22', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', droneModel: 'DJI Mavic 3 Enterprise', serialNumber: '1ZNBJ9E00C00X7', departureLocation: 'Dripping Springs, TX', departureCoords: { lat: 30.1902, lng: -98.0867 }, arrivalLocation: 'Dripping Springs, TX', flightDuration: 30, hobbs: { start: 339.3, end: 339.8 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'photography', maxAltitudeAGL: 250, distanceTraveled: 2.3, weather: { wind: 6, visibility: 10, ceiling: null, temperature: 50 }, incidents: [], notes: 'Wedding venue aerial photos and video.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-013', pilotId: 'P-001', date: '2026-01-15', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', droneModel: 'DJI Mavic 3 Thermal', serialNumber: '1ZNBJ9T00C0071', departureLocation: 'Leander, TX', departureCoords: { lat: 30.5788, lng: -97.8531 }, arrivalLocation: 'Leander, TX', flightDuration: 40, hobbs: { start: 453.4, end: 454.1 }, conditions: 'night_vfr', operationType: 'part_107_waiver', missionType: 'inspection', maxAltitudeAGL: 120, distanceTraveled: 2.5, weather: { wind: 4, visibility: 10, ceiling: null, temperature: 38 }, incidents: ['Temporary GPS interference resolved by altitude change'], notes: 'Commercial rooftop thermal scan for energy audit.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Alex Rivera', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: false },
  { id: 'FL-014', pilotId: 'P-001', date: '2026-01-08', droneId: 'DRN-004', droneName: 'Skydio X10', droneModel: 'Skydio X10', serialNumber: 'SKX10-2024-0891', departureLocation: 'Cedar Park, TX', departureCoords: { lat: 30.5052, lng: -97.8203 }, arrivalLocation: 'Cedar Park, TX', flightDuration: 22, hobbs: { start: 121.3, end: 121.7 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'maintenance_check', maxAltitudeAGL: 100, distanceTraveled: 0.8, weather: { wind: 3, visibility: 10, ceiling: null, temperature: 42 }, incidents: [], notes: 'Drone systems check and calibration flight post-firmware update.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-015', pilotId: 'P-001', date: '2025-12-28', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', droneModel: 'DJI Matrice 350 RTK', serialNumber: '1ZNDH3500D002A', departureLocation: 'Kyle, TX', departureCoords: { lat: 29.9888, lng: -97.8772 }, arrivalLocation: 'Kyle, TX', flightDuration: 50, hobbs: { start: 572.6, end: 573.4 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'survey', maxAltitudeAGL: 380, distanceTraveled: 7.9, weather: { wind: 11, visibility: 10, ceiling: null, temperature: 55 }, incidents: [], notes: 'Highway construction progress monitoring for TxDOT.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Sam Chen', role: 'payload_operator' }], signatures: { pilotSignature: true, supervisorSignature: true }, autoLogged: true },
  { id: 'FL-016', pilotId: 'P-001', date: '2025-12-18', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', droneModel: 'DJI Mavic 3 Enterprise', serialNumber: '1ZNBJ9E00C00X7', departureLocation: 'Bee Cave, TX', departureCoords: { lat: 30.3085, lng: -97.9439 }, arrivalLocation: 'Bee Cave, TX', flightDuration: 32, hobbs: { start: 338.7, end: 339.2 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'photography', maxAltitudeAGL: 280, distanceTraveled: 2.6, weather: { wind: 5, visibility: 10, ceiling: null, temperature: 60 }, incidents: [], notes: 'Holiday event coverage for Hill Country Galleria.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-017', pilotId: 'P-001', date: '2025-12-10', droneId: 'DRN-003', droneName: 'EVO II Pro #1', droneModel: 'Autel EVO II Pro V3', serialNumber: '7YBRX2100FN042', departureLocation: 'Marble Falls, TX', departureCoords: { lat: 30.5782, lng: -98.2750 }, arrivalLocation: 'Marble Falls, TX', flightDuration: 48, hobbs: { start: 211.2, end: 212.0 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'agriculture', maxAltitudeAGL: 200, distanceTraveled: 6.8, weather: { wind: 7, visibility: 10, ceiling: null, temperature: 48 }, incidents: [], notes: 'Vineyard health assessment and frost damage survey.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Maria Gonzales', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-018', pilotId: 'P-001', date: '2025-11-30', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', droneModel: 'DJI Matrice 350 RTK', serialNumber: '1ZNDH3500D002A', departureLocation: 'Buda, TX', departureCoords: { lat: 30.0852, lng: -97.8420 }, arrivalLocation: 'Buda, TX', flightDuration: 90, hobbs: { start: 571.0, end: 572.5 }, conditions: 'day_bvlos', operationType: 'part_107_waiver', missionType: 'inspection', maxAltitudeAGL: 400, distanceTraveled: 22.0, laancAuthorization: 'LAANC-2025-1130F', weather: { wind: 14, visibility: 9, ceiling: 5000, temperature: 52 }, incidents: ['High wind advisory — reduced speed to maintain stability'], notes: 'Pipeline corridor BVLOS inspection. 14-mile segment completed.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Alex Rivera', role: 'visual_observer' }, { name: 'Sam Chen', role: 'payload_operator' }], signatures: { pilotSignature: true, supervisorSignature: true }, autoLogged: true },
  { id: 'FL-019', pilotId: 'P-001', date: '2025-11-20', droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', droneModel: 'DJI Mavic 3 Thermal', serialNumber: '1ZNBJ9T00C0071', departureLocation: 'Manor, TX', departureCoords: { lat: 30.3407, lng: -97.5567 }, arrivalLocation: 'Manor, TX', flightDuration: 35, hobbs: { start: 452.8, end: 453.4 }, conditions: 'night_vfr', operationType: 'part_107_waiver', missionType: 'search_rescue', maxAltitudeAGL: 180, distanceTraveled: 4.1, weather: { wind: 6, visibility: 10, ceiling: null, temperature: 42 }, incidents: [], notes: 'Missing person thermal search with Travis County SAR team.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Deputy Reyes', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: false },
  { id: 'FL-020', pilotId: 'P-001', date: '2025-11-10', droneId: 'DRN-004', droneName: 'Skydio X10', droneModel: 'Skydio X10', serialNumber: 'SKX10-2024-0891', departureLocation: 'Taylor, TX', departureCoords: { lat: 30.5705, lng: -97.4094 }, arrivalLocation: 'Taylor, TX', flightDuration: 30, hobbs: { start: 120.5, end: 121.0 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'inspection', maxAltitudeAGL: 200, distanceTraveled: 2.4, weather: { wind: 8, visibility: 10, ceiling: null, temperature: 58 }, incidents: [], notes: 'Cell tower inspection with autonomous orbit mode.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-021', pilotId: 'P-001', date: '2025-10-28', droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', droneModel: 'DJI Mavic 3 Enterprise', serialNumber: '1ZNBJ9E00C00X7', departureLocation: 'Wimberley, TX', departureCoords: { lat: 29.9974, lng: -98.0986 }, arrivalLocation: 'Wimberley, TX', flightDuration: 44, hobbs: { start: 338.0, end: 338.7 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'photography', maxAltitudeAGL: 350, distanceTraveled: 3.5, weather: { wind: 4, visibility: 10, ceiling: null, temperature: 68 }, incidents: [], notes: 'Fall foliage aerial photography for Texas Hill Country tourism board.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-022', pilotId: 'P-001', date: '2025-10-15', droneId: 'DRN-006', droneName: 'Phantom 4 RTK', droneModel: 'DJI Phantom 4 RTK', serialNumber: '0AXDJ4R00300P2', departureLocation: 'Elgin, TX', departureCoords: { lat: 30.3502, lng: -97.3708 }, arrivalLocation: 'Elgin, TX', flightDuration: 55, hobbs: { start: 890.0, end: 890.9 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'survey', maxAltitudeAGL: 300, distanceTraveled: 8.2, weather: { wind: 9, visibility: 10, ceiling: null, temperature: 72 }, incidents: [], notes: 'Cadastral boundary survey for land subdivision project.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Sam Chen', role: 'payload_operator' }], signatures: { pilotSignature: true }, autoLogged: true },
  { id: 'FL-023', pilotId: 'P-001', date: '2025-10-02', droneId: 'DRN-002', droneName: 'Matrice 350 RTK', droneModel: 'DJI Matrice 350 RTK', serialNumber: '1ZNDH3500D002A', departureLocation: 'Lockhart, TX', departureCoords: { lat: 29.8849, lng: -97.6703 }, arrivalLocation: 'Lockhart, TX', flightDuration: 65, hobbs: { start: 570.2, end: 571.3 }, conditions: 'day_vfr', operationType: 'part_107', missionType: 'other', maxAltitudeAGL: 350, distanceTraveled: 10.0, weather: { wind: 6, visibility: 10, ceiling: null, temperature: 78 }, incidents: [], notes: 'Municipal infrastructure mapping for City of Lockhart.', crew: [{ name: 'Jordan Mitchell', role: 'PIC' }, { name: 'Alex Rivera', role: 'visual_observer' }], signatures: { pilotSignature: true }, autoLogged: true },
];

const mockCertifications: PilotCertification[] = [
  { id: 'CERT-001', type: 'part_107', name: 'Remote Pilot Certificate (Part 107)', number: '4372819', issueDate: '2024-06-15', expiryDate: '2026-06-15', issuingAuthority: 'FAA', status: 'current', ratings: ['sUAS'], waivers: [{ waiverId: 'W2025-0412', type: 'BVLOS Operations', expiryDate: '2026-04-12', conditions: 'Designated corridors with ground observers at 2-mile intervals' }, { waiverId: 'W2025-0318', type: 'Night Operations', expiryDate: '2026-03-18', conditions: 'Anti-collision lighting visible 3SM, visual observer required' }] },
  { id: 'CERT-002', type: 'medical', name: 'FAA Medical Certificate (Class III)', number: 'MED-2025-7841', issueDate: '2025-04-01', expiryDate: '2026-04-01', issuingAuthority: 'FAA', status: 'expiring_soon' },
  { id: 'CERT-003', type: 'training_cert', name: 'Advanced Thermography Certification', number: 'THERM-2024-0193', issueDate: '2024-11-10', expiryDate: '2027-11-10', issuingAuthority: 'Infrared Training Center', status: 'current', ratings: ['Level II Thermographer'] },
];

// ─── Computed Summary ───
const totalFlightTime = mockFlightLogs.reduce((s, f) => s + f.flightDuration, 0);
const dayVFR = mockFlightLogs.filter((f) => f.conditions === 'day_vfr').reduce((s, f) => s + f.flightDuration, 0);
const nightVFR = mockFlightLogs.filter((f) => f.conditions === 'night_vfr').reduce((s, f) => s + f.flightDuration, 0);
const dayBVLOS = mockFlightLogs.filter((f) => f.conditions === 'day_bvlos').reduce((s, f) => s + f.flightDuration, 0);
const nightBVLOS = mockFlightLogs.filter((f) => f.conditions === 'night_bvlos').reduce((s, f) => s + f.flightDuration, 0);
const totalDistance = mockFlightLogs.reduce((s, f) => s + f.distanceTraveled, 0);
const uniqueAircraft = new Set(mockFlightLogs.map((f) => f.droneId)).size;
const longestFlight = Math.max(...mockFlightLogs.map((f) => f.flightDuration));

const now = new Date('2026-03-20');
const d90 = new Date('2025-12-20');
const d12m = new Date('2025-03-20');
const last90 = mockFlightLogs.filter((f) => new Date(f.date) >= d90).reduce((s, f) => s + f.flightDuration, 0);
const last12 = mockFlightLogs.filter((f) => new Date(f.date) >= d12m).reduce((s, f) => s + f.flightDuration, 0);
const flightsLast90 = mockFlightLogs.filter((f) => new Date(f.date) >= d90).length;

const conditionsLabel: Record<string, string> = {
  day_vfr: 'Day VFR',
  night_vfr: 'Night VFR',
  day_bvlos: 'Day BVLOS',
  night_bvlos: 'Night BVLOS',
};

const operationLabel: Record<string, string> = {
  recreational: 'Recreational',
  part_107: 'Part 107',
  part_107_waiver: 'Part 107 Waiver',
  public_coa: 'Public COA',
  training: 'Training',
};

const missionLabel: Record<string, string> = {
  survey: 'Survey',
  inspection: 'Inspection',
  photography: 'Photography',
  delivery: 'Delivery',
  agriculture: 'Agriculture',
  search_rescue: 'Search & Rescue',
  training: 'Training',
  maintenance_check: 'Maintenance Check',
  other: 'Other',
};

const statusBadge: Record<string, { bg: string; text: string; dot: string }> = {
  current: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  expiring_soon: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  expired: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Monthly aggregation for statistics
function getMonthlyData() {
  const months: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months[key] = 0;
  }
  mockFlightLogs.forEach((f) => {
    const fd = new Date(f.date + 'T00:00:00');
    if (fd >= new Date('2025-03-20')) {
      const key = fd.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (key in months) months[key] += f.flightDuration;
    }
  });
  return Object.entries(months);
}

function getMissionBreakdown() {
  const counts: Record<string, number> = {};
  mockFlightLogs.forEach((f) => {
    counts[f.missionType] = (counts[f.missionType] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count, pct: Math.round((count / mockFlightLogs.length) * 100) }));
}

function getAircraftBreakdown() {
  const hours: Record<string, number> = {};
  mockFlightLogs.forEach((f) => {
    hours[f.droneName] = (hours[f.droneName] || 0) + f.flightDuration;
  });
  return Object.entries(hours)
    .sort((a, b) => b[1] - a[1])
    .map(([name, mins]) => ({ name, mins, pct: Math.round((mins / totalFlightTime) * 100) }));
}

// ─── Component ───
export function PilotLogbookPage() {
  const [tab, setTab] = useState<MainTab>('logbook');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [filterConditions, setFilterConditions] = useState('');
  const [filterOpType, setFilterOpType] = useState('');
  const [filterAircraft, setFilterAircraft] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    date: '', droneId: '', departureLocation: '', arrivalLocation: '',
    flightDuration: '', hobbsStart: '', hobbsEnd: '',
    conditions: 'day_vfr', operationType: 'part_107', missionType: 'inspection',
    maxAltitude: '', distance: '',
    windSpeed: '', visibility: '', ceiling: '', temperature: '',
    notes: '', pilotSignature: false,
    crew: [{ name: '', role: 'PIC' as const }],
  });

  // Filter & sort logs
  const filtered = mockFlightLogs
    .filter((f) => {
      if (filterConditions && f.conditions !== filterConditions) return false;
      if (filterOpType && f.operationType !== filterOpType) return false;
      if (filterAircraft && f.droneId !== filterAircraft) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.departureLocation.toLowerCase().includes(q) || f.notes.toLowerCase().includes(q) || f.droneName.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'date') return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
      if (sortField === 'flightDuration') return dir * (a.flightDuration - b.flightDuration);
      if (sortField === 'maxAltitudeAGL') return dir * (a.maxAltitudeAGL - b.maxAltitudeAGL);
      const av = a[sortField] || '';
      const bv = b[sortField] || '';
      return dir * String(av).localeCompare(String(bv));
    });

  const totalPages = Math.ceil(filtered.length / 10);
  const paginated = filtered.slice(page * 10, (page + 1) * 10);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
      : <ChevronDown size={14} className="opacity-30" />
  );

  const addCrewMember = () => setNewEntry((p) => ({ ...p, crew: [...p.crew, { name: '', role: 'visual_observer' as const }] }));
  const removeCrewMember = (i: number) => setNewEntry((p) => ({ ...p, crew: p.crew.filter((_, idx) => idx !== i) }));

  const uniqueDrones = [...new Set(mockFlightLogs.map((f) => f.droneId))].map((id) => {
    const log = mockFlightLogs.find((f) => f.droneId === id)!;
    return { id, name: log.droneName };
  });

  // Stats data
  const monthlyData = getMonthlyData();
  const maxMonthly = Math.max(...monthlyData.map(([, v]) => v), 1);
  const missionBreakdown = getMissionBreakdown();
  const aircraftBreakdown = getAircraftBreakdown();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" /> Pilot Logbook
          </h1>
          <p className="text-sm text-gray-500 mt-1">Digital flight log, certifications, and currency tracking</p>
        </div>
        <button
          onClick={() => { /* placeholder */ }}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download size={16} /> Export Logbook
        </button>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Flight Time', value: fmtDuration(totalFlightTime), icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Flights', value: mockFlightLogs.length, icon: Plane, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Unique Aircraft', value: uniqueAircraft, icon: Navigation, color: 'bg-purple-50 text-purple-600' },
          { label: 'Avg Duration', value: fmtDuration(Math.round(totalFlightTime / mockFlightLogs.length)), icon: Gauge, color: 'bg-teal-50 text-teal-600' },
          { label: 'Last 90 Days', value: fmtDuration(last90), icon: Calendar, color: 'bg-green-50 text-green-600' },
          { label: 'Total Distance', value: `${totalDistance.toFixed(1)} mi`, icon: MapPin, color: 'bg-orange-50 text-orange-600' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className={clsx('inline-flex items-center justify-center rounded-lg p-2', s.color)}>
                <Icon size={18} />
              </div>
              <p className="mt-2 text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Conditions Breakdown Bar */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Flight Conditions Breakdown</h3>
        <div className="flex rounded-full overflow-hidden h-4">
          {[
            { val: dayVFR, color: 'bg-blue-500', label: 'Day VFR' },
            { val: nightVFR, color: 'bg-indigo-500', label: 'Night VFR' },
            { val: dayBVLOS, color: 'bg-amber-500', label: 'Day BVLOS' },
            { val: nightBVLOS, color: 'bg-red-500', label: 'Night BVLOS' },
          ].map((b) => (
            <div key={b.label} className={clsx(b.color, 'transition-all')} style={{ width: `${(b.val / totalFlightTime) * 100}%` }} title={`${b.label}: ${fmtDuration(b.val)}`} />
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-600 flex-wrap">
          {[
            { val: dayVFR, color: 'bg-blue-500', label: 'Day VFR' },
            { val: nightVFR, color: 'bg-indigo-500', label: 'Night VFR' },
            { val: dayBVLOS, color: 'bg-amber-500', label: 'Day BVLOS' },
            { val: nightBVLOS, color: 'bg-red-500', label: 'Night BVLOS' },
          ].map((b) => (
            <span key={b.label} className="flex items-center gap-1">
              <span className={clsx('w-2.5 h-2.5 rounded-full', b.color)} />
              {b.label}: {fmtDuration(b.val)}
            </span>
          ))}
        </div>
      </div>

      {/* Recurrency Status */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-green-600" />
            <h3 className="text-sm font-semibold text-gray-700">Recurrency Status</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Current
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-500">Flights (Last 90d)</p>
            <p className="text-lg font-bold text-gray-900">{flightsLast90} <span className="text-xs font-normal text-gray-400">/ 3 required</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Hours (Last 12mo)</p>
            <p className="text-lg font-bold text-gray-900">{fmtDuration(last12)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Last BFR</p>
            <p className="text-lg font-bold text-gray-900">Feb 12, 2026</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Next BFR Due</p>
            <p className="text-lg font-bold text-gray-900">Feb 12, 2028</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {([
            { id: 'logbook' as MainTab, label: 'Flight Log', icon: FileText },
            { id: 'certifications' as MainTab, label: 'Certifications & Currency', icon: Award },
            { id: 'statistics' as MainTab, label: 'Statistics', icon: Gauge },
          ]).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors',
                  tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Logbook Tab ─── */}
      {tab === 'logbook' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search location, notes, aircraft..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                showFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50',
              )}
            >
              <Filter size={16} /> Filters
            </button>
            <button
              onClick={() => setShowNewEntry(!showNewEntry)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} /> Add Manual Entry
            </button>
          </div>

          {/* Filter Row */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 rounded-lg border bg-gray-50 p-4">
              <select value={filterConditions} onChange={(e) => { setFilterConditions(e.target.value); setPage(0); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                <option value="">All Conditions</option>
                {Object.entries(conditionsLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={filterOpType} onChange={(e) => { setFilterOpType(e.target.value); setPage(0); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                <option value="">All Operations</option>
                {Object.entries(operationLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={filterAircraft} onChange={(e) => { setFilterAircraft(e.target.value); setPage(0); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
                <option value="">All Aircraft</option>
                {uniqueDrones.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <button onClick={() => { setFilterConditions(''); setFilterOpType(''); setFilterAircraft(''); setPage(0); }} className="text-sm text-blue-600 hover:underline">Clear All</button>
            </div>
          )}

          {/* New Entry Form */}
          {showNewEntry && (
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><PenLine size={18} /> New Flight Log Entry</h3>
                <button onClick={() => setShowNewEntry(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Aircraft</label>
                  <select value={newEntry.droneId} onChange={(e) => setNewEntry({ ...newEntry, droneId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500">
                    <option value="">Select aircraft...</option>
                    {uniqueDrones.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Departure Location</label>
                  <input type="text" placeholder="e.g. Austin Executive Airport, TX" value={newEntry.departureLocation} onChange={(e) => setNewEntry({ ...newEntry, departureLocation: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Arrival Location</label>
                  <input type="text" placeholder="e.g. Same as departure" value={newEntry.arrivalLocation} onChange={(e) => setNewEntry({ ...newEntry, arrivalLocation: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Flight Duration (minutes)</label>
                  <input type="number" value={newEntry.flightDuration} onChange={(e) => setNewEntry({ ...newEntry, flightDuration: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hobbs Start</label>
                    <input type="number" step="0.1" value={newEntry.hobbsStart} onChange={(e) => setNewEntry({ ...newEntry, hobbsStart: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hobbs End</label>
                    <input type="number" step="0.1" value={newEntry.hobbsEnd} onChange={(e) => setNewEntry({ ...newEntry, hobbsEnd: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Conditions</label>
                  <select value={newEntry.conditions} onChange={(e) => setNewEntry({ ...newEntry, conditions: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500">
                    {Object.entries(conditionsLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Operation Type</label>
                  <select value={newEntry.operationType} onChange={(e) => setNewEntry({ ...newEntry, operationType: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500">
                    {Object.entries(operationLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mission Type</label>
                  <select value={newEntry.missionType} onChange={(e) => setNewEntry({ ...newEntry, missionType: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500">
                    {Object.entries(missionLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Altitude AGL (ft)</label>
                  <input type="number" value={newEntry.maxAltitude} onChange={(e) => setNewEntry({ ...newEntry, maxAltitude: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Distance Traveled (mi)</label>
                  <input type="number" step="0.1" value={newEntry.distance} onChange={(e) => setNewEntry({ ...newEntry, distance: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Weather */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><CloudSun size={14} /> Weather Conditions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Wind (kts)</label>
                    <input type="number" value={newEntry.windSpeed} onChange={(e) => setNewEntry({ ...newEntry, windSpeed: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Visibility (SM)</label>
                    <input type="number" value={newEntry.visibility} onChange={(e) => setNewEntry({ ...newEntry, visibility: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ceiling (ft)</label>
                    <input type="number" value={newEntry.ceiling} onChange={(e) => setNewEntry({ ...newEntry, ceiling: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Temp (F)</label>
                    <input type="number" value={newEntry.temperature} onChange={(e) => setNewEntry({ ...newEntry, temperature: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Crew */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Users size={14} /> Crew Members</h4>
                {newEntry.crew.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Name" value={c.name} onChange={(e) => { const crew = [...newEntry.crew]; crew[i] = { ...crew[i], name: e.target.value }; setNewEntry({ ...newEntry, crew }); }} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                    <select value={c.role} onChange={(e) => { const crew = [...newEntry.crew]; crew[i] = { ...crew[i], role: e.target.value as 'PIC' | 'visual_observer' | 'payload_operator' }; setNewEntry({ ...newEntry, crew }); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500">
                      <option value="PIC">PIC</option>
                      <option value="visual_observer">Visual Observer</option>
                      <option value="payload_operator">Payload Operator</option>
                    </select>
                    {newEntry.crew.length > 1 && (
                      <button onClick={() => removeCrewMember(i)} className="text-red-500 hover:text-red-700 text-sm px-2">Remove</button>
                    )}
                  </div>
                ))}
                <button onClick={addCrewMember} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Plus size={14} /> Add Crew Member</button>
              </div>

              {/* Notes & Signature */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={newEntry.notes} onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={newEntry.pilotSignature} onChange={(e) => setNewEntry({ ...newEntry, pilotSignature: e.target.checked })} className="rounded border-gray-300" />
                I certify this flight log entry is accurate (Digital Signature)
              </label>
              <div className="flex gap-3 pt-2">
                <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">Save Entry</button>
                <button onClick={() => setShowNewEntry(false)} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {/* Flight Log Table */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {([
                      { field: 'date' as SortField, label: 'Date' },
                      { field: 'droneName' as SortField, label: 'Aircraft' },
                      { field: 'flightDuration' as SortField, label: 'Duration' },
                      { field: 'departureLocation' as SortField, label: 'Location' },
                      { field: 'operationType' as SortField, label: 'Type' },
                      { field: 'conditions' as SortField, label: 'Conditions' },
                      { field: 'maxAltitudeAGL' as SortField, label: 'Alt (AGL)' },
                    ]).map((col) => (
                      <th key={col.field} className="px-4 py-3 cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort(col.field)}>
                        <span className="flex items-center gap-1">{col.label} <SortIcon field={col.field} /></span>
                      </th>
                    ))}
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginated.map((f) => (
                    <>
                      <tr key={f.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === f.id ? null : f.id)}>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{fmtDate(f.date)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-gray-900">{f.droneName}</div>
                          <div className="text-xs text-gray-400">{f.serialNumber}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono">{fmtDuration(f.flightDuration)}</td>
                        <td className="px-4 py-3 max-w-[180px] truncate text-gray-700">{f.departureLocation}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{operationLabel[f.operationType]}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={clsx('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', {
                            'bg-blue-50 text-blue-700': f.conditions === 'day_vfr',
                            'bg-indigo-50 text-indigo-700': f.conditions === 'night_vfr',
                            'bg-amber-50 text-amber-700': f.conditions === 'day_bvlos',
                            'bg-red-50 text-red-700': f.conditions === 'night_bvlos',
                          })}>{conditionsLabel[f.conditions]}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-700">{f.maxAltitudeAGL} ft</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {f.autoLogged
                            ? <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"><CheckCircle size={12} /> Auto</span>
                            : <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"><PenLine size={12} /> Manual</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          {expandedRow === f.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </td>
                      </tr>
                      {expandedRow === f.id && (
                        <tr key={`${f.id}-detail`}>
                          <td colSpan={9} className="bg-gray-50 px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Weather</p>
                                <div className="flex items-center gap-1 text-gray-700"><CloudSun size={14} /></div>
                                <p className="text-gray-700">Wind: {f.weather.wind} kts | Vis: {f.weather.visibility} SM</p>
                                <p className="text-gray-700">Ceiling: {f.weather.ceiling ? `${f.weather.ceiling} ft` : 'Clear'} | Temp: {f.weather.temperature}F</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Crew</p>
                                {f.crew.map((c, i) => (
                                  <div key={i} className="flex items-center gap-1 text-gray-700">
                                    <User size={12} className="text-gray-400" />
                                    {c.name} <span className="text-xs text-gray-400">({c.role === 'PIC' ? 'PIC' : c.role === 'visual_observer' ? 'VO' : 'PO'})</span>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Flight Details</p>
                                <p className="text-gray-700">Hobbs: {f.hobbs.start} - {f.hobbs.end}</p>
                                <p className="text-gray-700">Distance: {f.distanceTraveled} mi</p>
                                <p className="text-gray-700">Mission: {missionLabel[f.missionType]}</p>
                                {f.laancAuthorization && <p className="text-gray-700">LAANC: {f.laancAuthorization}</p>}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                                <p className="text-gray-700">{f.notes}</p>
                                {f.incidents.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-amber-600 flex items-center gap-1"><AlertCircle size={12} /> Incidents</p>
                                    {f.incidents.map((inc, i) => <p key={i} className="text-amber-700 text-xs">{inc}</p>)}
                                  </div>
                                )}
                                {f.signatures && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircle size={12} className="text-green-500" />
                                    Pilot signed{f.signatures.supervisorSignature && ' | Supervisor signed'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-600">
                <span>Showing {page * 10 + 1}-{Math.min((page + 1) * 10, filtered.length)} of {filtered.length} entries</span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={clsx(
                        'rounded px-3 py-1 text-sm transition-colors',
                        page === i ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-600',
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Certifications Tab ─── */}
      {tab === 'certifications' && (
        <div className="space-y-4">
          {mockCertifications.map((cert) => {
            const badge = statusBadge[cert.status];
            const expiry = new Date(cert.expiryDate);
            const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={cert.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx('rounded-lg p-2', cert.type === 'part_107' ? 'bg-blue-50 text-blue-600' : cert.type === 'medical' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600')}>
                      {cert.type === 'medical' ? <Shield size={20} /> : <Award size={20} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      <p className="text-xs text-gray-500">#{cert.number} | {cert.issuingAuthority}</p>
                    </div>
                  </div>
                  <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', badge.bg, badge.text)}>
                    <span className={clsx('w-2 h-2 rounded-full', badge.dot)} />
                    {cert.status === 'current' ? 'Current' : cert.status === 'expiring_soon' ? 'Expiring Soon' : 'Expired'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Issue Date</p>
                    <p className="font-medium text-gray-900">{fmtDate(cert.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expiry Date</p>
                    <p className="font-medium text-gray-900">{fmtDate(cert.expiryDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Days Remaining</p>
                    <p className={clsx('font-medium', daysLeft > 90 ? 'text-green-700' : daysLeft > 30 ? 'text-amber-700' : 'text-red-700')}>{daysLeft > 0 ? `${daysLeft} days` : 'Expired'}</p>
                  </div>
                  <div>
                    <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Upload size={14} /> Upload Document
                    </button>
                  </div>
                </div>
                {cert.ratings && cert.ratings.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Ratings</p>
                    <div className="flex gap-2">
                      {cert.ratings.map((r) => (
                        <span key={r} className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {cert.waivers && cert.waivers.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">Waivers</p>
                    {cert.waivers.map((w) => {
                      const wExpiry = new Date(w.expiryDate);
                      const wDays = Math.ceil((wExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={w.waiverId} className="rounded-lg bg-gray-50 p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{w.type}</span>
                            <span className={clsx('text-xs font-medium', wDays > 30 ? 'text-green-700' : wDays > 0 ? 'text-amber-700' : 'text-red-700')}>{wDays > 0 ? `${wDays}d remaining` : 'Expired'}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">ID: {w.waiverId} | Expires: {fmtDate(w.expiryDate)}</p>
                          <p className="text-xs text-gray-600 mt-1">{w.conditions}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Statistics Tab ─── */}
      {tab === 'statistics' && (
        <div className="space-y-6">
          {/* Monthly Flight Hours */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Flight Hours (Last 12 Months)</h3>
            <div className="flex items-end gap-2 h-48">
              {monthlyData.map(([month, mins]) => (
                <div key={month} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-xs font-medium text-gray-700 mb-1">{mins > 0 ? fmtDuration(mins) : ''}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all min-h-[2px]"
                    style={{ height: `${Math.max((mins / maxMonthly) * 100, mins > 0 ? 4 : 1)}%` }}
                  />
                  <span className="text-[10px] text-gray-500 mt-1.5 whitespace-nowrap">{month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Type Breakdown */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Mission Type Breakdown</h3>
            <div className="space-y-3">
              {missionBreakdown.map((m) => (
                <div key={m.type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{missionLabel[m.type] || m.type}</span>
                    <span className="text-gray-500">{m.count} flights ({m.pct}%)</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aircraft Usage */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Aircraft Usage (by Flight Time)</h3>
            <div className="space-y-3">
              {aircraftBreakdown.map((a) => (
                <div key={a.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{a.name}</span>
                    <span className="text-gray-500">{fmtDuration(a.mins)} ({a.pct}%)</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${a.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Longest Flight', value: fmtDuration(longestFlight), icon: Clock },
              { label: 'Total Distance', value: `${totalDistance.toFixed(1)} mi`, icon: MapPin },
              { label: 'Flights This Month', value: mockFlightLogs.filter((f) => f.date.startsWith('2026-03')).length, icon: Calendar },
              { label: 'Incidents Reported', value: mockFlightLogs.filter((f) => f.incidents.length > 0).length, icon: AlertCircle },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border bg-white p-4 shadow-sm">
                  <Icon size={16} className="text-gray-400" />
                  <p className="mt-2 text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
