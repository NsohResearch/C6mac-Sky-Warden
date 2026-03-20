import { useState } from 'react';
import {
  AlertTriangle, AlertCircle, Shield, ShieldAlert, FileText, Search, Filter,
  Clock, Calendar, MapPin, User, Users, Camera, Video, File, MessageSquare,
  ChevronDown, ChevronUp, Plus, Edit, Trash2, CheckCircle, XCircle, ArrowRight,
  TrendingUp, TrendingDown, Activity, BarChart2, Target, Crosshair, Wrench,
  Eye, Flag, Tag, ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Incident, IncidentStats } from '../../../shared/types/incident';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'incidents' | 'investigation' | 'analytics';
type IncidentType = Incident['type'];
type Severity = Incident['severity'];
type IncidentStatus = Incident['status'];

// ─── Status / severity configs ────────────────────────────────────────────────
const statusConfig: Record<IncidentStatus, { label: string; bg: string; text: string; pulse?: boolean }> = {
  reported: { label: 'Reported', bg: 'bg-blue-50', text: 'text-blue-700' },
  under_investigation: { label: 'Under Investigation', bg: 'bg-amber-50', text: 'text-amber-700' },
  root_cause_identified: { label: 'Root Cause ID', bg: 'bg-purple-50', text: 'text-purple-700' },
  corrective_action: { label: 'Corrective Action', bg: 'bg-orange-50', text: 'text-orange-700' },
  closed: { label: 'Closed', bg: 'bg-green-50', text: 'text-green-700' },
  reopened: { label: 'Reopened', bg: 'bg-red-50', text: 'text-red-700', pulse: true },
};

const severityConfig: Record<Severity, { label: string; bg: string; text: string; dot: string }> = {
  minor: { label: 'Minor', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  moderate: { label: 'Moderate', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  serious: { label: 'Serious', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  fatal: { label: 'Fatal', bg: 'bg-red-100', text: 'text-red-900', dot: 'bg-red-800' },
};

const typeConfig: Record<IncidentType, { label: string; bg: string; text: string }> = {
  accident: { label: 'Accident', bg: 'bg-red-50', text: 'text-red-700' },
  incident: { label: 'Incident', bg: 'bg-orange-50', text: 'text-orange-700' },
  near_miss: { label: 'Near Miss', bg: 'bg-amber-50', text: 'text-amber-700' },
  hazard: { label: 'Hazard', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  airspace_violation: { label: 'Airspace Violation', bg: 'bg-purple-50', text: 'text-purple-700' },
  flyaway: { label: 'Flyaway', bg: 'bg-pink-50', text: 'text-pink-700' },
  lost_link: { label: 'Lost Link', bg: 'bg-gray-100', text: 'text-gray-700' },
  property_damage: { label: 'Property Damage', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  injury: { label: 'Injury', bg: 'bg-red-100', text: 'text-red-800' },
};

const evidenceIcons: Record<string, typeof File> = {
  photo: Camera, video: Video, flight_log: FileText, witness_statement: MessageSquare,
  telemetry_data: Activity, document: File,
};

const kanbanColumns: { key: IncidentStatus; label: string; color: string }[] = [
  { key: 'reported', label: 'Reported', color: 'border-blue-400' },
  { key: 'under_investigation', label: 'Under Investigation', color: 'border-amber-400' },
  { key: 'root_cause_identified', label: 'Root Cause ID', color: 'border-purple-400' },
  { key: 'corrective_action', label: 'Corrective Action', color: 'border-orange-400' },
  { key: 'closed', label: 'Closed', color: 'border-green-400' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockIncidents: Incident[] = [
  {
    id: 'INC-001', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0001',
    type: 'accident', severity: 'critical', status: 'under_investigation',
    title: 'Matrice 350 crash during infrastructure inspection',
    description: 'During bridge inspection at 280ft AGL, aircraft experienced sudden motor #3 failure causing uncontrolled descent into riverbank. Complete loss of aircraft. No injuries.',
    dateTime: '2026-03-12T14:32:00Z',
    location: { lat: 34.0522, lng: -118.2437, address: '1st Street Bridge, Los Angeles, CA', airspace: 'Class G' },
    reportedBy: 'Mike Chen', reportedAt: '2026-03-12T15:10:00Z',
    droneId: 'DRN-002', droneName: 'Matrice 350 RTK', pilotId: 'PLT-002', pilotName: 'Sarah Park', missionId: 'MSN-048',
    weatherConditions: { wind: 12, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [{ owner: 'City of LA', description: 'Minor scraping on bridge railing', estimatedCost: 800 }],
    droneDamage: { description: 'Total loss — frame destroyed, gimbal shattered, motors 2 & 3 damaged beyond repair', estimatedRepairCost: 0, repairable: false },
    rootCause: { category: 'mechanical', description: 'Motor #3 bearing seized due to accumulated dust ingestion from construction site operations. ESC thermal shutdown triggered cascade failure.', contributingFactors: ['Dusty operating environment', 'Maintenance interval exceeded by 22 hours', 'No motor vibration pre-flight check'] },
    correctiveActions: [
      { id: 'CA-001', description: 'Implement mandatory motor vibration analysis before each flight', assignedTo: 'Mike Chen', dueDate: '2026-03-25', status: 'completed', completedDate: '2026-03-20' },
      { id: 'CA-002', description: 'Reduce maintenance interval for dusty environments to 100hrs', assignedTo: 'James Wu', dueDate: '2026-03-20', status: 'overdue' },
      { id: 'CA-003', description: 'Install motor dust covers on all Matrice fleet', assignedTo: 'Mike Chen', dueDate: '2026-04-01', status: 'in_progress' },
    ],
    investigation: {
      investigatorId: 'INV-001', investigatorName: 'James Wu', startDate: '2026-03-13',
      findings: 'Motor #3 bearing seized at 602 flight hours (rated for 800hrs in clean conditions). Operating in construction dust reduced effective life. ESC thermal protection triggered motor shutdown at 280ft AGL. Remaining 3 motors could not sustain flight, resulting in uncontrolled descent.',
      recommendations: ['Reduce motor service interval in dusty environments', 'Add pre-flight vibration analysis to checklist', 'Consider motor dust protection for construction sites'],
      evidence: [
        { type: 'photo', name: 'crash_site_photos.zip', uploadDate: '2026-03-12' },
        { type: 'flight_log', name: 'M350_flight_log_20260312.dat', uploadDate: '2026-03-12' },
        { type: 'telemetry_data', name: 'motor_telemetry_export.csv', uploadDate: '2026-03-13' },
        { type: 'video', name: 'bridge_cam_footage.mp4', uploadDate: '2026-03-13' },
      ],
    },
    witnesses: [
      { name: 'Tom Rodriguez', contact: 'tom.r@construction.co', statement: 'I saw the drone suddenly tilt and spin before falling into the riverbank area below the bridge.' },
    ],
    regulatoryNotifications: [
      { authority: 'FAA', required: true, notifiedDate: '2026-03-13', referenceNumber: 'FAA-UA-2026-11247', status: 'acknowledged' },
      { authority: 'NTSB', required: true, status: 'required' },
    ],
    insuranceClaim: { filed: true, claimNumber: 'INS-2026-44821', status: 'Under review' },
    safetyReportId: 'SKW-SR-2026-0039',
    timeline: [
      { date: '2026-03-12T14:32', action: 'Incident occurred', by: 'System', notes: 'Motor #3 failure detected via telemetry' },
      { date: '2026-03-12T15:10', action: 'Incident reported', by: 'Mike Chen', notes: 'Initial report filed with crash site photos' },
      { date: '2026-03-13T09:00', action: 'Investigation opened', by: 'James Wu', notes: 'Assigned as lead investigator' },
      { date: '2026-03-13T10:30', action: 'FAA notified', by: 'James Wu', notes: 'Ref: FAA-UA-2026-11247' },
      { date: '2026-03-14T14:00', action: 'Root cause identified', by: 'James Wu', notes: 'Motor bearing seizure confirmed' },
      { date: '2026-03-15T09:00', action: 'Corrective actions assigned', by: 'James Wu', notes: '3 corrective actions created' },
    ],
    lessonsLearned: 'Operating environment must be factored into maintenance schedules. Standard manufacturer intervals assume clean-air conditions and are insufficient for construction/industrial sites.',
    tags: ['motor-failure', 'construction', 'total-loss', 'infrastructure'],
  },
  {
    id: 'INC-002', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0002',
    type: 'near_miss', severity: 'serious', status: 'closed',
    title: 'Near miss with news helicopter at 350ft AGL',
    description: 'During agricultural survey, Skydio X10 came within approximately 200ft horizontal separation of a news helicopter. ATC contact was established. Both aircraft took evasive action.',
    dateTime: '2026-03-08T11:15:00Z',
    location: { lat: 33.9425, lng: -118.4081, address: 'Playa Vista Farm, Los Angeles, CA', airspace: 'Class E' },
    reportedBy: 'Sarah Park', reportedAt: '2026-03-08T12:00:00Z',
    droneId: 'DRN-004', droneName: 'Skydio X10', pilotId: 'PLT-003', pilotName: 'Carlos Mendez', missionId: 'MSN-041',
    weatherConditions: { wind: 8, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [],
    droneDamage: { description: 'No damage', estimatedRepairCost: 0, repairable: true },
    rootCause: { category: 'procedural', description: 'Pilot did not check NOTAMs for news gathering TFRs. Helicopter was covering traffic accident and had verbal ATC clearance.', contributingFactors: ['No NOTAM check pre-flight', 'Altitude above LAANC ceiling', 'Inadequate situational awareness'] },
    correctiveActions: [
      { id: 'CA-004', description: 'Mandatory NOTAM briefing checklist before all flights', assignedTo: 'Sarah Park', dueDate: '2026-03-15', status: 'completed', completedDate: '2026-03-14' },
      { id: 'CA-005', description: 'Pilot retraining on airspace awareness', assignedTo: 'Carlos Mendez', dueDate: '2026-03-22', status: 'completed', completedDate: '2026-03-20' },
    ],
    investigation: {
      investigatorId: 'INV-002', investigatorName: 'Sarah Park', startDate: '2026-03-08',
      findings: 'Pilot Carlos Mendez failed to perform NOTAM check before flight. News helicopter KABC-7 was operating under verbal ATC clearance at 400ft. Skydio X10 was at 350ft, exceeding LAANC authorization of 200ft. Both aircraft took evasive action. Minimum separation estimated at 200ft horizontal, 50ft vertical.',
      recommendations: ['Enforce mandatory NOTAM check before every flight', 'Add altitude alerting to all aircraft', 'Require ATC monitoring on applicable frequencies'],
      evidence: [
        { type: 'flight_log', name: 'skydio_x10_log_20260308.json', uploadDate: '2026-03-08' },
        { type: 'witness_statement', name: 'helicopter_pilot_statement.pdf', uploadDate: '2026-03-09' },
        { type: 'telemetry_data', name: 'adsb_track_data.csv', uploadDate: '2026-03-09' },
      ],
    },
    witnesses: [
      { name: 'David Kim', contact: 'david.k@kabc.com', statement: 'I was piloting the KABC helicopter at 400ft when I saw the drone below and to my right. I banked left to increase separation.' },
      { name: 'Emily Torres', contact: 'etorres@farm.org', statement: 'I heard the helicopter get very close and saw the drone quickly descend.' },
    ],
    regulatoryNotifications: [
      { authority: 'FAA', required: true, notifiedDate: '2026-03-08', referenceNumber: 'FAA-UA-2026-10892', status: 'acknowledged' },
      { authority: 'NTSB', required: false, status: 'not_required' },
    ],
    insuranceClaim: { filed: false },
    safetyReportId: 'SKW-SR-2026-0040',
    timeline: [
      { date: '2026-03-08T11:15', action: 'Near miss occurred', by: 'System', notes: 'Proximity alert triggered' },
      { date: '2026-03-08T12:00', action: 'Incident reported', by: 'Sarah Park', notes: 'Report filed with all parties' },
      { date: '2026-03-08T14:00', action: 'FAA notified', by: 'Sarah Park', notes: 'Mandatory near-miss report' },
      { date: '2026-03-09T09:00', action: 'Investigation opened', by: 'Sarah Park', notes: '' },
      { date: '2026-03-14T16:00', action: 'Corrective actions completed', by: 'Sarah Park', notes: 'All actions verified' },
      { date: '2026-03-20T10:00', action: 'Investigation closed', by: 'Sarah Park', notes: 'All corrective actions completed' },
    ],
    lessonsLearned: 'NOTAM checks are critical and must be enforced procedurally. Altitude compliance is non-negotiable even in open airspace.',
    tags: ['near-miss', 'helicopter', 'airspace', 'altitude-violation'],
  },
  {
    id: 'INC-003', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0003',
    type: 'flyaway', severity: 'moderate', status: 'corrective_action',
    title: 'EVO II Pro flyaway during mapping mission',
    description: 'Autel EVO II Pro experienced GPS spoofing/interference causing unexpected flight path deviation. RTH triggered but aircraft flew 800m off course before operator regained manual control.',
    dateTime: '2026-03-05T09:45:00Z',
    location: { lat: 34.1478, lng: -118.1445, address: 'Pasadena Industrial Park, CA', airspace: 'Class G' },
    reportedBy: 'James Wu', reportedAt: '2026-03-05T10:30:00Z',
    droneId: 'DRN-003', droneName: 'EVO II Pro #1', pilotId: 'PLT-001', pilotName: 'Mike Chen',
    weatherConditions: { wind: 5, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [],
    droneDamage: { description: 'Minor prop damage from emergency landing on gravel', estimatedRepairCost: 120, repairable: true },
    correctiveActions: [
      { id: 'CA-006', description: 'Install GPS interference detection module on all aircraft', assignedTo: 'James Wu', dueDate: '2026-03-18', status: 'overdue' },
      { id: 'CA-007', description: 'Map known RF interference zones in operating area', assignedTo: 'Mike Chen', dueDate: '2026-03-30', status: 'in_progress' },
    ],
    investigation: {
      investigatorId: 'INV-001', investigatorName: 'James Wu', startDate: '2026-03-06',
      findings: 'GPS interference detected from nearby industrial equipment. Aircraft compass also showed anomalous readings consistent with electromagnetic interference from power substation.',
      recommendations: ['Survey operating areas for RF interference before missions', 'Install backup navigation (visual positioning) on all aircraft'],
      evidence: [
        { type: 'flight_log', name: 'evo2_log_20260305.bin', uploadDate: '2026-03-05' },
        { type: 'telemetry_data', name: 'gps_anomaly_data.csv', uploadDate: '2026-03-06' },
      ],
    },
    witnesses: [],
    regulatoryNotifications: [
      { authority: 'FAA', required: false, status: 'not_required' },
    ],
    insuranceClaim: { filed: false },
    timeline: [
      { date: '2026-03-05T09:45', action: 'Flyaway detected', by: 'System', notes: 'GPS anomaly triggered alert' },
      { date: '2026-03-05T09:48', action: 'Manual control regained', by: 'Mike Chen', notes: 'Switched to ATTI mode' },
      { date: '2026-03-05T10:30', action: 'Incident reported', by: 'James Wu', notes: '' },
      { date: '2026-03-06T09:00', action: 'Investigation opened', by: 'James Wu', notes: '' },
    ],
    tags: ['flyaway', 'gps-interference', 'industrial'],
  },
  {
    id: 'INC-004', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0004',
    type: 'property_damage', severity: 'moderate', status: 'corrective_action',
    title: 'Mavic 3 Enterprise forced landing on vehicle',
    description: 'ESC failure on motor #2 caused emergency autoland on parked vehicle in commercial lot. Vehicle sustained roof dent and paint scratches.',
    dateTime: '2026-02-28T16:20:00Z',
    location: { lat: 34.0195, lng: -118.4912, address: 'Santa Monica Business Park, CA', airspace: 'Class G' },
    reportedBy: 'Mike Chen', reportedAt: '2026-02-28T17:00:00Z',
    droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', pilotId: 'PLT-002', pilotName: 'Sarah Park',
    weatherConditions: { wind: 15, visibility: 8, ceiling: 3500, precipitation: 'none' },
    injuries: [],
    propertyDamage: [{ owner: 'John Matthews', description: '2024 Toyota Camry — roof dent and paint scratches', estimatedCost: 2200 }],
    droneDamage: { description: 'Cracked landing gear, gimbal misalignment', estimatedRepairCost: 650, repairable: true },
    correctiveActions: [
      { id: 'CA-008', description: 'Add ESC health monitoring to pre-flight checklist', assignedTo: 'Sarah Park', dueDate: '2026-03-10', status: 'completed', completedDate: '2026-03-08' },
      { id: 'CA-009', description: 'Define emergency landing zones for all regular operating areas', assignedTo: 'James Wu', dueDate: '2026-03-15', status: 'overdue' },
    ],
    investigation: {
      findings: 'ESC #2 failed due to capacitor degradation. Component was within manufacturer warranty period.',
      recommendations: ['Contact DJI for warranty ESC replacement program', 'Add ESC voltage monitoring'],
      evidence: [
        { type: 'photo', name: 'vehicle_damage_photos.zip', uploadDate: '2026-02-28' },
        { type: 'document', name: 'insurance_claim_form.pdf', uploadDate: '2026-03-01' },
      ],
    },
    witnesses: [
      { name: 'John Matthews', contact: 'jmatthews@email.com', statement: 'I was inside the office when I heard a thud on my car. Came out to find the drone on my roof.' },
    ],
    regulatoryNotifications: [
      { authority: 'FAA', required: true, notifiedDate: '2026-03-01', referenceNumber: 'FAA-UA-2026-10340', status: 'acknowledged' },
    ],
    insuranceClaim: { filed: true, claimNumber: 'INS-2026-43110', status: 'Approved — payout pending' },
    safetyReportId: 'SKW-SR-2026-0039',
    timeline: [
      { date: '2026-02-28T16:20', action: 'ESC failure detected', by: 'System', notes: 'Motor #2 shutdown' },
      { date: '2026-02-28T16:21', action: 'Emergency autoland activated', by: 'System', notes: 'Landed on vehicle' },
      { date: '2026-02-28T17:00', action: 'Incident reported', by: 'Mike Chen', notes: '' },
      { date: '2026-03-01T09:00', action: 'FAA notified', by: 'Mike Chen', notes: 'Property damage >$500' },
      { date: '2026-03-01T10:00', action: 'Insurance claim filed', by: 'Sarah Park', notes: '' },
    ],
    tags: ['esc-failure', 'property-damage', 'autoland', 'insurance'],
  },
  {
    id: 'INC-005', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0005',
    type: 'injury', severity: 'serious', status: 'reported',
    title: 'Bystander laceration from prop strike during landing',
    description: 'Matrice 350 RTK prop struck a bystander arm during manual landing in windy conditions. Person sustained laceration requiring 6 stitches.',
    dateTime: '2026-03-18T10:45:00Z',
    location: { lat: 33.9850, lng: -118.4695, address: 'Venice Beach Parking Lot, CA', airspace: 'Class G' },
    reportedBy: 'Carlos Mendez', reportedAt: '2026-03-18T11:30:00Z',
    droneId: 'DRN-002', droneName: 'Matrice 350 RTK', pilotId: 'PLT-003', pilotName: 'Carlos Mendez',
    weatherConditions: { wind: 22, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [
      { personType: 'bystander', severity: 'Serious — AIS 2', description: 'Laceration to left forearm, 6 stitches required at ER' },
    ],
    propertyDamage: [],
    droneDamage: { description: 'Propeller chipped', estimatedRepairCost: 80, repairable: true },
    correctiveActions: [],
    investigation: {
      findings: '', recommendations: [],
      evidence: [
        { type: 'photo', name: 'injury_documentation.zip', uploadDate: '2026-03-18' },
        { type: 'witness_statement', name: 'bystander_statement.pdf', uploadDate: '2026-03-18' },
      ],
    },
    witnesses: [
      { name: 'Angela Reyes', contact: 'areyes@email.com', statement: 'The wind caught the drone as it was coming down and it drifted toward a man standing nearby.' },
      { name: 'Robert Liu', contact: 'rliu@email.com', statement: 'I was about 20 feet away. The drone swung sideways in a gust and the propeller hit the man on the arm.' },
    ],
    regulatoryNotifications: [
      { authority: 'FAA', required: true, status: 'required' },
      { authority: 'NTSB', required: true, status: 'required' },
    ],
    insuranceClaim: { filed: false },
    timeline: [
      { date: '2026-03-18T10:45', action: 'Injury incident occurred', by: 'System', notes: 'Prop strike during landing' },
      { date: '2026-03-18T10:50', action: 'First aid rendered', by: 'Carlos Mendez', notes: 'Applied pressure bandage' },
      { date: '2026-03-18T11:15', action: 'Victim transported to ER', by: 'Carlos Mendez', notes: 'UCLA Medical Center' },
      { date: '2026-03-18T11:30', action: 'Incident reported', by: 'Carlos Mendez', notes: '' },
    ],
    tags: ['injury', 'prop-strike', 'wind', 'bystander', 'ntsb-required'],
  },
  {
    id: 'INC-006', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0006',
    type: 'airspace_violation', severity: 'minor', status: 'closed',
    title: 'Momentary altitude exceedance above LAANC ceiling',
    description: 'Wind gust caused altitude exceedance of 18ft above LAANC-authorized ceiling of 200ft. Immediately corrected. No other traffic in area.',
    dateTime: '2026-02-22T13:10:00Z',
    location: { lat: 37.6213, lng: -122.3790, address: 'San Mateo County, CA', airspace: 'Class C (SFO)' },
    reportedBy: 'Sarah Park', reportedAt: '2026-02-22T14:00:00Z',
    droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', pilotId: 'PLT-002', pilotName: 'Sarah Park',
    weatherConditions: { wind: 18, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [],
    droneDamage: { description: 'No damage', estimatedRepairCost: 0, repairable: true },
    correctiveActions: [
      { id: 'CA-010', description: 'Set altitude alert buffer to 30ft below LAANC ceiling', assignedTo: 'Mike Chen', dueDate: '2026-03-01', status: 'completed', completedDate: '2026-02-28' },
    ],
    investigation: {
      findings: 'Wind gust of 18kts caused momentary altitude exceedance. Pilot corrected within 3 seconds.',
      recommendations: ['Use altitude buffer in windy conditions'],
      evidence: [{ type: 'flight_log', name: 'mavic3_log_20260222.dat', uploadDate: '2026-02-22' }],
    },
    witnesses: [],
    regulatoryNotifications: [
      { authority: 'FAA', required: false, status: 'not_required' },
    ],
    timeline: [
      { date: '2026-02-22T13:10', action: 'Altitude exceedance detected', by: 'System', notes: '+18ft above ceiling' },
      { date: '2026-02-22T13:10', action: 'Corrected', by: 'Sarah Park', notes: 'Descended within 3 seconds' },
      { date: '2026-02-22T14:00', action: 'Incident reported', by: 'Sarah Park', notes: 'Voluntary report' },
      { date: '2026-02-28T10:00', action: 'Investigation closed', by: 'James Wu', notes: 'Corrective action completed' },
    ],
    tags: ['airspace', 'laanc', 'altitude', 'wind'],
  },
  {
    id: 'INC-007', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0007',
    type: 'lost_link', severity: 'minor', status: 'closed',
    title: 'Lost RC link during warehouse inspection',
    description: 'Mavic 3T lost RC signal for 45 seconds inside warehouse due to RF shielding from metal structure. RTH activated, aircraft exited structure and reconnected.',
    dateTime: '2026-02-15T09:30:00Z',
    location: { lat: 33.9200, lng: -118.3890, address: 'LAX Cargo Warehouse B7, CA', airspace: 'Class B (LAANC)' },
    reportedBy: 'Mike Chen', reportedAt: '2026-02-15T10:15:00Z',
    droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', pilotId: 'PLT-001', pilotName: 'Mike Chen',
    weatherConditions: { wind: 3, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [],
    droneDamage: { description: 'No damage', estimatedRepairCost: 0, repairable: true },
    correctiveActions: [
      { id: 'CA-011', description: 'Deploy RF relay stations for indoor operations', assignedTo: 'James Wu', dueDate: '2026-03-01', status: 'completed', completedDate: '2026-02-28' },
    ],
    investigation: {
      findings: 'Metal warehouse structure attenuated 2.4GHz RC signal. Expected behavior in shielded environments.',
      recommendations: ['Use relay stations in metal structures', 'Pre-survey RF environment'],
      evidence: [{ type: 'telemetry_data', name: 'rf_signal_log.csv', uploadDate: '2026-02-15' }],
    },
    witnesses: [],
    regulatoryNotifications: [{ authority: 'FAA', required: false, status: 'not_required' }],
    timeline: [
      { date: '2026-02-15T09:30', action: 'RC link lost', by: 'System', notes: 'Signal attenuation in warehouse' },
      { date: '2026-02-15T09:31', action: 'RTH activated', by: 'System', notes: '' },
      { date: '2026-02-15T09:32', action: 'Link restored', by: 'System', notes: 'Aircraft exited structure' },
      { date: '2026-02-15T10:15', action: 'Incident reported', by: 'Mike Chen', notes: '' },
    ],
    tags: ['lost-link', 'indoor', 'rf-shielding'],
  },
  {
    id: 'INC-008', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0008',
    type: 'hazard', severity: 'moderate', status: 'root_cause_identified',
    title: 'Battery thermal runaway detected on ground',
    description: 'Skydio X10 battery began smoking during post-flight cool-down. Battery removed and placed in fire-safe container. No fire occurred.',
    dateTime: '2026-03-01T15:20:00Z',
    location: { lat: 34.0522, lng: -118.2437, address: 'Sky Warden HQ, Los Angeles, CA', airspace: 'N/A' },
    reportedBy: 'James Wu', reportedAt: '2026-03-01T15:45:00Z',
    droneId: 'DRN-004', droneName: 'Skydio X10', pilotId: 'PLT-001', pilotName: 'Mike Chen',
    weatherConditions: { wind: 0, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [],
    droneDamage: { description: 'Battery destroyed (swelled), battery bay discolored from heat', estimatedRepairCost: 380, repairable: true },
    rootCause: { category: 'mechanical', description: 'Manufacturing defect in battery cell #3 causing internal short circuit. Batch recall issued by Skydio.', contributingFactors: ['Battery from recalled batch SX10-BAT-2025Q4', 'High ambient temperature day (95F)'] },
    correctiveActions: [
      { id: 'CA-012', description: 'Remove all SX10-BAT-2025Q4 batch batteries from service', assignedTo: 'Mike Chen', dueDate: '2026-03-05', status: 'completed', completedDate: '2026-03-03' },
      { id: 'CA-013', description: 'Install battery fire-safe storage at all operating bases', assignedTo: 'James Wu', dueDate: '2026-03-15', status: 'completed', completedDate: '2026-03-12' },
    ],
    investigation: {
      investigatorId: 'INV-001', investigatorName: 'James Wu', startDate: '2026-03-02',
      findings: 'Battery cell #3 internal short due to manufacturing defect. Skydio confirmed batch recall. All affected batteries identified and removed.',
      recommendations: ['Track battery batch numbers', 'Monitor manufacturer recall notices', 'Maintain fire-safe battery storage'],
      evidence: [
        { type: 'photo', name: 'swollen_battery_photos.zip', uploadDate: '2026-03-01' },
        { type: 'document', name: 'skydio_recall_notice.pdf', uploadDate: '2026-03-02' },
      ],
    },
    witnesses: [],
    regulatoryNotifications: [{ authority: 'FAA', required: false, status: 'not_required' }],
    timeline: [
      { date: '2026-03-01T15:20', action: 'Battery smoking detected', by: 'Mike Chen', notes: 'Post-flight cool-down' },
      { date: '2026-03-01T15:22', action: 'Battery isolated', by: 'Mike Chen', notes: 'Placed in fire-safe container' },
      { date: '2026-03-01T15:45', action: 'Incident reported', by: 'James Wu', notes: '' },
      { date: '2026-03-02T09:00', action: 'Skydio contacted', by: 'James Wu', notes: 'Confirmed batch recall' },
      { date: '2026-03-03T12:00', action: 'All recalled batteries removed', by: 'Mike Chen', notes: '4 batteries removed' },
    ],
    tags: ['battery', 'thermal-runaway', 'recall', 'safety'],
  },
  {
    id: 'INC-009', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0009',
    type: 'incident', severity: 'minor', status: 'closed',
    title: 'Remote ID broadcast failure mid-flight',
    description: 'Phantom 4 RTK Remote ID module stopped broadcasting mid-flight. Pilot landed immediately per SOP. Firmware bug identified.',
    dateTime: '2026-02-10T14:00:00Z',
    location: { lat: 34.0195, lng: -118.4912, address: 'Santa Monica, CA', airspace: 'Class G' },
    reportedBy: 'Sarah Park', reportedAt: '2026-02-10T14:45:00Z',
    droneId: 'DRN-006', droneName: 'Phantom 4 RTK', pilotId: 'PLT-002', pilotName: 'Sarah Park',
    weatherConditions: { wind: 6, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [],
    droneDamage: { description: 'No physical damage — firmware issue', estimatedRepairCost: 0, repairable: true },
    correctiveActions: [
      { id: 'CA-014', description: 'Update RID module firmware across fleet', assignedTo: 'James Wu', dueDate: '2026-02-17', status: 'completed', completedDate: '2026-02-15' },
    ],
    investigation: {
      findings: 'Dronetag DT-B1 firmware v2.2.8 had known bug causing broadcast dropout after 45min flight time. Fixed in v2.3.1.',
      recommendations: ['Monitor RID module firmware updates', 'Add pre-flight RID broadcast verification'],
      evidence: [{ type: 'flight_log', name: 'p4rtk_log_20260210.dat', uploadDate: '2026-02-10' }],
    },
    witnesses: [],
    regulatoryNotifications: [{ authority: 'FAA', required: false, status: 'not_required' }],
    timeline: [
      { date: '2026-02-10T14:00', action: 'RID broadcast stopped', by: 'System', notes: 'After 47 minutes of flight' },
      { date: '2026-02-10T14:02', action: 'Pilot landed', by: 'Sarah Park', notes: 'Per SOP for RID failure' },
      { date: '2026-02-10T14:45', action: 'Incident reported', by: 'Sarah Park', notes: '' },
      { date: '2026-02-15T16:00', action: 'Firmware updated fleet-wide', by: 'James Wu', notes: 'v2.3.1' },
    ],
    lessonsLearned: 'Monitor manufacturer firmware changelogs. Add pre-flight RID broadcast verification to standard checklist.',
    tags: ['remote-id', 'firmware', 'compliance'],
  },
  {
    id: 'INC-010', tenantId: 'T1', incidentNumber: 'SKW-INC-2026-0010',
    type: 'property_damage', severity: 'serious', status: 'reopened',
    title: 'M30T hard landing damages solar panel array',
    description: 'DJI M30T experienced GPS glitch during solar farm inspection causing hard landing on panel array. 3 solar panels cracked, mounting hardware bent.',
    dateTime: '2026-03-15T08:30:00Z',
    location: { lat: 34.7500, lng: -118.8500, address: 'SunValley Solar Farm, Lancaster, CA', airspace: 'Class G' },
    reportedBy: 'Mike Chen', reportedAt: '2026-03-15T09:15:00Z',
    droneId: 'DRN-008', droneName: 'M30T Enterprise', pilotId: 'PLT-001', pilotName: 'Mike Chen', missionId: 'MSN-052',
    weatherConditions: { wind: 10, visibility: 10, ceiling: null, precipitation: 'none' },
    injuries: [],
    propertyDamage: [
      { owner: 'SunValley Energy LLC', description: '3x solar panels cracked (LONGi Hi-MO 5)', estimatedCost: 4500 },
      { owner: 'SunValley Energy LLC', description: 'Panel mounting hardware bent/damaged', estimatedCost: 1200 },
    ],
    droneDamage: { description: 'Landing gear collapsed, camera lens cracked, prop guards bent', estimatedRepairCost: 1800, repairable: true },
    correctiveActions: [
      { id: 'CA-015', description: 'Implement GPS health pre-check with minimum satellite count requirement', assignedTo: 'James Wu', dueDate: '2026-03-22', status: 'in_progress' },
      { id: 'CA-016', description: 'Negotiate replacement cost with SunValley Energy', assignedTo: 'Sarah Park', dueDate: '2026-03-25', status: 'pending' },
    ],
    investigation: {
      investigatorId: 'INV-002', investigatorName: 'Sarah Park', startDate: '2026-03-16',
      findings: 'Initial investigation found GPS multipath error from reflective solar panel surface. Case reopened after discovering similar GPS anomalies on 2 previous flights at same location that were not reported.',
      recommendations: ['Survey GPS multipath risk at solar farms', 'Use RTK positioning over solar installations'],
      evidence: [
        { type: 'photo', name: 'solar_panel_damage.zip', uploadDate: '2026-03-15' },
        { type: 'flight_log', name: 'm30t_log_20260315.dat', uploadDate: '2026-03-15' },
        { type: 'telemetry_data', name: 'gps_multipath_analysis.csv', uploadDate: '2026-03-16' },
      ],
    },
    witnesses: [
      { name: 'Ray Anderson', contact: 'ray@sunvalleyenergy.com', statement: 'The drone suddenly dropped about 15 feet and hit the panel array. It looked like it just lost power.' },
    ],
    regulatoryNotifications: [
      { authority: 'FAA', required: true, notifiedDate: '2026-03-16', referenceNumber: 'FAA-UA-2026-11089', status: 'notified' },
    ],
    insuranceClaim: { filed: true, claimNumber: 'INS-2026-44590', status: 'Under review' },
    timeline: [
      { date: '2026-03-15T08:30', action: 'Hard landing on solar array', by: 'System', notes: 'GPS anomaly detected' },
      { date: '2026-03-15T09:15', action: 'Incident reported', by: 'Mike Chen', notes: '' },
      { date: '2026-03-16T09:00', action: 'Investigation opened', by: 'Sarah Park', notes: '' },
      { date: '2026-03-16T14:00', action: 'FAA notified', by: 'Sarah Park', notes: 'Property damage >$500' },
      { date: '2026-03-18T10:00', action: 'Investigation closed', by: 'Sarah Park', notes: 'Initial findings documented' },
      { date: '2026-03-19T09:00', action: 'Investigation reopened', by: 'James Wu', notes: 'Prior unreported GPS anomalies discovered at same site' },
    ],
    tags: ['solar-farm', 'gps-multipath', 'property-damage', 'reopened'],
  },
];

const mockStats: IncidentStats = {
  totalIncidents: 10,
  openInvestigations: 4,
  overdueActions: 3,
  avgResolutionDays: 8.5,
  incidentsByType: { accident: 1, near_miss: 1, flyaway: 1, property_damage: 2, injury: 1, airspace_violation: 1, lost_link: 1, hazard: 1, incident: 1 },
  incidentsBySeverity: { minor: 3, moderate: 3, serious: 2, critical: 1, fatal: 0 },
  monthlyTrend: [
    { month: 'Apr', count: 1 }, { month: 'May', count: 0 }, { month: 'Jun', count: 2 },
    { month: 'Jul', count: 1 }, { month: 'Aug', count: 3 }, { month: 'Sep', count: 1 },
    { month: 'Oct', count: 2 }, { month: 'Nov', count: 0 }, { month: 'Dec', count: 1 },
    { month: 'Jan', count: 2 }, { month: 'Feb', count: 3 }, { month: 'Mar', count: 4 },
  ],
  topRootCauses: [
    { cause: 'Mechanical Failure', count: 4 },
    { cause: 'Pilot Error / Procedural', count: 3 },
    { cause: 'Environmental (GPS/RF)', count: 2 },
    { cause: 'Software / Firmware', count: 1 },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function daysOpen(dateStr: string) {
  return Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000));
}

// ─── Component ────────────────────────────────────────────────────────────────
export function IncidentPage() {
  const [activeTab, setActiveTab] = useState<TabId>('incidents');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [investigationPanel, setInvestigationPanel] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<IncidentType>('incident');
  const [formSeverity, setFormSeverity] = useState<Severity>('minor');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formDrone, setFormDrone] = useState('');
  const [formPilot, setFormPilot] = useState('');
  const [formWind, setFormWind] = useState('');
  const [formVisibility, setFormVisibility] = useState('');
  const [formCeiling, setFormCeiling] = useState('');
  const [formPrecip, setFormPrecip] = useState('none');
  const [formInjuries, setFormInjuries] = useState<Array<{ personType: string; severity: string; description: string }>>([]);
  const [formPropDamage, setFormPropDamage] = useState<Array<{ owner: string; description: string; estimatedCost: string }>>([]);
  const [formDroneDmgDesc, setFormDroneDmgDesc] = useState('');
  const [formDroneDmgCost, setFormDroneDmgCost] = useState('');
  const [formDroneDmgRepairable, setFormDroneDmgRepairable] = useState(true);
  const [formWitnesses, setFormWitnesses] = useState<Array<{ name: string; contact: string; statement: string }>>([]);
  const [formTags, setFormTags] = useState('');

  const overdueActions = mockIncidents.flatMap(i => i.correctiveActions.filter(ca => ca.status === 'overdue'));
  const requiredNotifications = mockIncidents.flatMap(i => i.regulatoryNotifications.filter(n => n.status === 'required'));

  const filtered = mockIncidents.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return i.title.toLowerCase().includes(q) || i.incidentNumber.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs: { id: TabId; label: string; icon: typeof Shield }[] = [
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert },
    { id: 'investigation', label: 'Investigation Board', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  // ── Incidents Tab ──
  function renderIncidentsTab() {
    return (
      <div className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><ShieldAlert className="w-4 h-4" /> Total Incidents</div>
            <div className="text-2xl font-bold text-gray-900">{mockStats.totalIncidents}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Eye className="w-4 h-4" /> Open Investigations</div>
            <div className="text-2xl font-bold text-amber-600">{mockStats.openInvestigations}</div>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <div className="flex items-center gap-2 text-sm text-red-500 mb-1"><AlertTriangle className="w-4 h-4" /> Overdue Actions</div>
            <div className="text-2xl font-bold text-red-600">{mockStats.overdueActions}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Clock className="w-4 h-4" /> Avg Resolution</div>
            <div className="text-2xl font-bold text-gray-900">{mockStats.avgResolutionDays} <span className="text-sm font-normal text-gray-500">days</span></div>
          </div>
        </div>

        {/* Alert banners */}
        {overdueActions.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{overdueActions.length} overdue corrective action{overdueActions.length > 1 ? 's' : ''} require attention</p>
              <p className="text-xs text-red-600 mt-0.5">{overdueActions.map(a => a.description).join('; ')}</p>
            </div>
          </div>
        )}
        {requiredNotifications.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Flag className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">{requiredNotifications.length} required regulatory notification{requiredNotifications.length > 1 ? 's' : ''} not yet sent</p>
              <p className="text-xs text-amber-600 mt-0.5">{requiredNotifications.map(n => `${n.authority}`).join(', ')} notifications pending</p>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-lg border p-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search incidents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 border rounded text-sm" />
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500"><Filter className="w-4 h-4" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as IncidentStatus | 'all')} className="border rounded px-2 py-1.5 text-sm">
            <option value="all">All Status</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as IncidentType | 'all')} className="border rounded px-2 py-1.5 text-sm">
            <option value="all">All Types</option>
            {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as Severity | 'all')} className="border rounded px-2 py-1.5 text-sm">
            <option value="all">All Severity</option>
            {Object.entries(severityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => setShowForm(true)} className="ml-auto flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" /> Report Incident
          </button>
        </div>

        {/* Incident table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-8"></th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Incident #</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Severity</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Drone</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <IncidentRow key={inc.id} incident={inc} expanded={expandedId === inc.id} onToggle={() => setExpandedId(expandedId === inc.id ? null : inc.id)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No incidents match filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Investigation Board Tab ──
  function renderInvestigationTab() {
    const panelInc = investigationPanel ? mockIncidents.find(i => i.id === investigationPanel) : null;

    return (
      <div className="space-y-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {kanbanColumns.map(col => {
            const items = mockIncidents.filter(i => i.status === col.key);
            return (
              <div key={col.key} className={clsx('flex-1 min-w-[220px] bg-gray-50 rounded-lg border-t-4', col.color)}>
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{col.label}</span>
                  <span className="bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-500">{items.length}</span>
                </div>
                <div className="px-2 pb-2 space-y-2">
                  {items.map(inc => (
                    <button key={inc.id} onClick={() => setInvestigationPanel(inc.id)} className="w-full text-left bg-white rounded border p-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx('w-2 h-2 rounded-full', severityConfig[inc.severity].dot)} />
                        <span className="text-xs text-gray-500">{inc.incidentNumber}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{inc.title}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{inc.investigation.investigatorName || 'Unassigned'}</span>
                        <span>{daysOpen(inc.reportedAt)}d</span>
                      </div>
                      {inc.correctiveActions.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                          <Wrench className="w-3 h-3" />
                          {inc.correctiveActions.filter(a => a.status === 'completed').length}/{inc.correctiveActions.length} actions
                        </div>
                      )}
                    </button>
                  ))}
                  {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No items</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Investigation panel */}
        {panelInc && (
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{panelInc.incidentNumber} — {panelInc.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', severityConfig[panelInc.severity].bg, severityConfig[panelInc.severity].text)}>{severityConfig[panelInc.severity].label}</span>
                  <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', statusConfig[panelInc.status].bg, statusConfig[panelInc.status].text)}>{statusConfig[panelInc.status].label}</span>
                </div>
              </div>
              <button onClick={() => setInvestigationPanel(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>

            {/* Investigator */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Investigator</label>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                  {panelInc.investigation.investigatorName ? panelInc.investigation.investigatorName.split(' ').map(n => n[0]).join('') : '?'}
                </div>
                <span className="text-sm text-gray-700">{panelInc.investigation.investigatorName || 'Unassigned'}</span>
              </div>
            </div>

            {/* Findings */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Findings</label>
              <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{panelInc.investigation.findings || 'No findings documented yet.'}</p>
            </div>

            {/* Root cause */}
            {panelInc.rootCause && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Root Cause Analysis</label>
                <div className="bg-gray-50 rounded p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Category:</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium capitalize">{panelInc.rootCause.category.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-700">{panelInc.rootCause.description}</p>
                  {panelInc.rootCause.contributingFactors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {panelInc.rootCause.contributingFactors.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {panelInc.investigation.recommendations.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Recommendations</label>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                  {panelInc.investigation.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* Corrective actions */}
            {panelInc.correctiveActions.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Corrective Actions</label>
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-gray-500">Description</th>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-gray-500">Assigned To</th>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-gray-500">Due</th>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-gray-500">Status</th>
                        <th className="text-left px-3 py-1.5 text-xs font-medium text-gray-500 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {panelInc.correctiveActions.map(ca => {
                        const caColors: Record<string, string> = { pending: 'text-gray-600 bg-gray-100', in_progress: 'text-blue-700 bg-blue-50', completed: 'text-green-700 bg-green-50', overdue: 'text-red-700 bg-red-50' };
                        return (
                          <tr key={ca.id} className="border-b last:border-b-0">
                            <td className="px-3 py-2 text-gray-700">{ca.description}</td>
                            <td className="px-3 py-2 text-gray-600">{ca.assignedTo}</td>
                            <td className="px-3 py-2 text-gray-600">{ca.dueDate}</td>
                            <td className="px-3 py-2"><span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', caColors[ca.status])}>{ca.status.replace('_', ' ')}</span></td>
                            <td className="px-3 py-2">
                              {ca.status !== 'completed' && (
                                <button className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Done</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Evidence */}
            {panelInc.investigation.evidence.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Evidence</label>
                <div className="flex flex-wrap gap-2">
                  {panelInc.investigation.evidence.map((ev, i) => {
                    const EIcon = evidenceIcons[ev.type] || File;
                    return (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border rounded text-xs text-gray-600">
                        <EIcon className="w-3.5 h-3.5" /> {ev.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status progression buttons */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-xs text-gray-500">Move to:</span>
              {kanbanColumns.filter(c => c.key !== panelInc.status).map(c => (
                <button key={c.key} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 transition-colors flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Analytics Tab ──
  function renderAnalyticsTab() {
    const maxMonthly = Math.max(...mockStats.monthlyTrend.map(m => m.count), 1);
    const maxType = Math.max(...Object.values(mockStats.incidentsByType), 1);
    const maxSev = Math.max(...Object.values(mockStats.incidentsBySeverity), 1);
    const maxCause = Math.max(...mockStats.topRootCauses.map(c => c.count), 1);
    const totalOpen = mockIncidents.filter(i => i.status !== 'closed').length;
    const totalClosed = mockIncidents.filter(i => i.status === 'closed').length;
    const caTotal = mockIncidents.flatMap(i => i.correctiveActions).length;
    const caCompleted = mockIncidents.flatMap(i => i.correctiveActions).filter(a => a.status === 'completed').length;
    const caRate = caTotal > 0 ? Math.round((caCompleted / caTotal) * 100) : 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly trend */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Monthly Incident Trend (12 Months)</h3>
            <div className="flex items-end gap-1.5 h-40">
              {mockStats.monthlyTrend.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{m.count}</span>
                  <div className="w-full bg-blue-500 rounded-t transition-all" style={{ height: `${(m.count / maxMonthly) * 100}%`, minHeight: m.count > 0 ? '4px' : '0' }} />
                  <span className="text-xs text-gray-400">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By type */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> Incidents by Type</h3>
            <div className="space-y-2">
              {Object.entries(mockStats.incidentsByType).sort(([,a], [,b]) => b - a).map(([type, count]) => {
                const cfg = typeConfig[type as IncidentType];
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-32 truncate">{cfg?.label || type}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={clsx('h-full rounded-full', cfg?.bg === 'bg-red-50' ? 'bg-red-400' : cfg?.bg === 'bg-orange-50' ? 'bg-orange-400' : cfg?.bg === 'bg-amber-50' ? 'bg-amber-400' : cfg?.bg === 'bg-purple-50' ? 'bg-purple-400' : cfg?.bg === 'bg-pink-50' ? 'bg-pink-400' : cfg?.bg === 'bg-indigo-50' ? 'bg-indigo-400' : cfg?.bg === 'bg-red-100' ? 'bg-red-500' : 'bg-gray-400')} style={{ width: `${(count / maxType) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By severity */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Incidents by Severity</h3>
            <div className="space-y-2">
              {Object.entries(mockStats.incidentsBySeverity).map(([sev, count]) => {
                const cfg = severityConfig[sev as Severity];
                return (
                  <div key={sev} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-20">{cfg.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={clsx('h-full rounded-full', cfg.dot)} style={{ width: `${(count / maxSev) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top root causes */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Crosshair className="w-4 h-4" /> Top Root Causes</h3>
            <div className="space-y-2">
              {mockStats.topRootCauses.map((rc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-4">{i + 1}.</span>
                  <span className="text-xs text-gray-600 w-40 truncate">{rc.cause}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(rc.count / maxCause) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-6 text-right">{rc.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open vs Closed */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Open vs Closed</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#22c55e" strokeWidth="3"
                    strokeDasharray={`${(totalClosed / (totalOpen + totalClosed)) * 100} ${100 - (totalClosed / (totalOpen + totalClosed)) * 100}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                  {Math.round((totalClosed / (totalOpen + totalClosed)) * 100)}%
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500" /><span className="text-sm text-gray-600">Closed: {totalClosed}</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-300" /><span className="text-sm text-gray-600">Open: {totalOpen}</span></div>
              </div>
            </div>
          </div>

          {/* Corrective action completion */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Corrective Action Completion</h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-gray-900">{caRate}%</div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${caRate}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{caCompleted} of {caTotal} actions completed</p>
              </div>
            </div>
          </div>

          {/* Avg resolution trend */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Average Resolution Time</h3>
            <div className="text-3xl font-bold text-gray-900">{mockStats.avgResolutionDays} <span className="text-sm font-normal text-gray-500">days</span></div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> 12% improvement from last quarter</p>
          </div>

          {/* Risk heatmap placeholder */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Risk Heat Zones</h3>
            <div className="bg-gray-50 rounded border-2 border-dashed border-gray-200 h-40 flex items-center justify-center text-sm text-gray-400">
              Map integration — incident location heatmap
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Report Incident Form ──
  function renderForm() {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl m-4">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-500" /> Report Incident</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Type & severity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Incident Type</label>
                <select value={formType} onChange={e => setFormType(e.target.value as IncidentType)} className="w-full border rounded px-3 py-2 text-sm">
                  {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
                <select value={formSeverity} onChange={e => setFormSeverity(e.target.value as Severity)} className="w-full border rounded px-3 py-2 text-sm">
                  {Object.entries(severityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            {/* Title & date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Brief incident title" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date / Time</label>
                <input type="datetime-local" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location (Address)</label>
                <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="Street address or landmark" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                <input type="text" value={formLat} onChange={e => setFormLat(e.target.value)} placeholder="34.0522" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                <input type="text" value={formLng} onChange={e => setFormLng(e.target.value)} placeholder="-118.2437" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={4} placeholder="Detailed description of what happened..." className="w-full border rounded px-3 py-2 text-sm" />
            </div>

            {/* Drone & pilot */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Drone</label>
                <select value={formDrone} onChange={e => setFormDrone(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Select drone...</option>
                  <option value="DRN-001">Mavic 3 Enterprise #1</option>
                  <option value="DRN-002">Matrice 350 RTK</option>
                  <option value="DRN-003">EVO II Pro #1</option>
                  <option value="DRN-004">Skydio X10</option>
                  <option value="DRN-005">Mavic 3T Thermal</option>
                  <option value="DRN-006">Phantom 4 RTK</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pilot</label>
                <select value={formPilot} onChange={e => setFormPilot(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Select pilot...</option>
                  <option value="PLT-001">Mike Chen</option>
                  <option value="PLT-002">Sarah Park</option>
                  <option value="PLT-003">Carlos Mendez</option>
                </select>
              </div>
            </div>

            {/* Weather */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Weather Conditions</label>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Wind (kts)</label>
                  <input type="number" value={formWind} onChange={e => setFormWind(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Visibility (SM)</label>
                  <input type="number" value={formVisibility} onChange={e => setFormVisibility(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Ceiling (ft)</label>
                  <input type="text" value={formCeiling} onChange={e => setFormCeiling(e.target.value)} placeholder="CLR" className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Precipitation</label>
                  <select value={formPrecip} onChange={e => setFormPrecip(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm">
                    <option value="none">None</option>
                    <option value="rain">Rain</option>
                    <option value="snow">Snow</option>
                    <option value="fog">Fog</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Injuries */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Injuries</label>
                <button onClick={() => setFormInjuries([...formInjuries, { personType: 'bystander', severity: '', description: '' }])} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
              {formInjuries.map((inj, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <select value={inj.personType} onChange={e => { const arr = [...formInjuries]; arr[i].personType = e.target.value; setFormInjuries(arr); }} className="border rounded px-2 py-1.5 text-sm w-28">
                    <option value="pilot">Pilot</option>
                    <option value="crew">Crew</option>
                    <option value="bystander">Bystander</option>
                  </select>
                  <input type="text" value={inj.severity} onChange={e => { const arr = [...formInjuries]; arr[i].severity = e.target.value; setFormInjuries(arr); }} placeholder="Severity" className="border rounded px-2 py-1.5 text-sm w-28" />
                  <input type="text" value={inj.description} onChange={e => { const arr = [...formInjuries]; arr[i].description = e.target.value; setFormInjuries(arr); }} placeholder="Description" className="flex-1 border rounded px-2 py-1.5 text-sm" />
                  <button onClick={() => setFormInjuries(formInjuries.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* Property damage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Property Damage</label>
                <button onClick={() => setFormPropDamage([...formPropDamage, { owner: '', description: '', estimatedCost: '' }])} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
              {formPropDamage.map((pd, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <input type="text" value={pd.owner} onChange={e => { const arr = [...formPropDamage]; arr[i].owner = e.target.value; setFormPropDamage(arr); }} placeholder="Owner" className="border rounded px-2 py-1.5 text-sm w-32" />
                  <input type="text" value={pd.description} onChange={e => { const arr = [...formPropDamage]; arr[i].description = e.target.value; setFormPropDamage(arr); }} placeholder="Description" className="flex-1 border rounded px-2 py-1.5 text-sm" />
                  <input type="text" value={pd.estimatedCost} onChange={e => { const arr = [...formPropDamage]; arr[i].estimatedCost = e.target.value; setFormPropDamage(arr); }} placeholder="$" className="border rounded px-2 py-1.5 text-sm w-24" />
                  <button onClick={() => setFormPropDamage(formPropDamage.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* Drone damage */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Drone Damage</label>
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={formDroneDmgDesc} onChange={e => setFormDroneDmgDesc(e.target.value)} placeholder="Damage description" className="col-span-2 border rounded px-2 py-1.5 text-sm" />
                <input type="text" value={formDroneDmgCost} onChange={e => setFormDroneDmgCost(e.target.value)} placeholder="Repair cost $" className="border rounded px-2 py-1.5 text-sm" />
              </div>
              <label className="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                <input type="checkbox" checked={formDroneDmgRepairable} onChange={e => setFormDroneDmgRepairable(e.target.checked)} className="rounded" />
                Repairable
              </label>
            </div>

            {/* Witnesses */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Witnesses</label>
                <button onClick={() => setFormWitnesses([...formWitnesses, { name: '', contact: '', statement: '' }])} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
              </div>
              {formWitnesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <input type="text" value={w.name} onChange={e => { const arr = [...formWitnesses]; arr[i].name = e.target.value; setFormWitnesses(arr); }} placeholder="Name" className="border rounded px-2 py-1.5 text-sm w-32" />
                  <input type="text" value={w.contact} onChange={e => { const arr = [...formWitnesses]; arr[i].contact = e.target.value; setFormWitnesses(arr); }} placeholder="Contact" className="border rounded px-2 py-1.5 text-sm w-40" />
                  <input type="text" value={w.statement} onChange={e => { const arr = [...formWitnesses]; arr[i].statement = e.target.value; setFormWitnesses(arr); }} placeholder="Statement" className="flex-1 border rounded px-2 py-1.5 text-sm" />
                  <button onClick={() => setFormWitnesses(formWitnesses.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            {/* Evidence placeholder */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Evidence</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400">
                <Camera className="w-6 h-6 mx-auto mb-1" />
                Drag & drop files or click to upload (photos, videos, flight logs, documents)
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated)</label>
              <input type="text" value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="motor-failure, construction, total-loss" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Submit Report</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-red-500" /> Incident & Accident Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track, investigate, and resolve safety incidents across your fleet</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={clsx(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === t.id ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'incidents' && renderIncidentsTab()}
      {activeTab === 'investigation' && renderInvestigationTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Form modal */}
      {showForm && renderForm()}
    </div>
  );
}

// ─── Incident Row sub-component ───────────────────────────────────────────────
function IncidentRow({ incident: inc, expanded, onToggle }: { incident: Incident; expanded: boolean; onToggle: () => void }) {
  const sev = severityConfig[inc.severity];
  const st = statusConfig[inc.status];
  const tp = typeConfig[inc.type];

  return (
    <>
      <tr className={clsx('border-b hover:bg-gray-50 cursor-pointer', expanded && 'bg-gray-50')} onClick={onToggle}>
        <td className="px-4 py-2.5">{expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</td>
        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{inc.incidentNumber}</td>
        <td className="px-4 py-2.5 text-gray-600">{new Date(inc.dateTime).toLocaleDateString()}</td>
        <td className="px-4 py-2.5"><span className={clsx('px-2 py-0.5 rounded text-xs font-medium', tp.bg, tp.text)}>{tp.label}</span></td>
        <td className="px-4 py-2.5"><span className={clsx('px-2 py-0.5 rounded text-xs font-medium', sev.bg, sev.text)}>{sev.label}</span></td>
        <td className="px-4 py-2.5 font-medium text-gray-800 max-w-xs truncate">{inc.title}</td>
        <td className="px-4 py-2.5 text-gray-600">{inc.droneName || '—'}</td>
        <td className="px-4 py-2.5"><span className={clsx('px-2 py-0.5 rounded text-xs font-medium', st.bg, st.text, st.pulse && 'animate-pulse')}>{st.label}</span></td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1">
            <button className="p-1 text-gray-400 hover:text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
            <button className="p-1 text-gray-400 hover:text-amber-600" title="Edit"><Edit className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50 border-b">
          <td colSpan={9} className="px-6 py-4">
            <div className="space-y-4">
              {/* Description & location */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</h4>
                  <p className="text-sm text-gray-700">{inc.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</h4>
                  <p className="text-sm text-gray-700 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {inc.location.address}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{inc.location.lat.toFixed(4)}, {inc.location.lng.toFixed(4)} — {inc.location.airspace}</p>
                </div>
              </div>

              {/* Weather & pilot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Weather Conditions</h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Wind: {inc.weatherConditions.wind} kts</span>
                    <span>Vis: {inc.weatherConditions.visibility} SM</span>
                    <span>Ceiling: {inc.weatherConditions.ceiling ?? 'CLR'}</span>
                    <span>Precip: {inc.weatherConditions.precipitation}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Pilot / Mission</h4>
                  <p className="text-sm text-gray-700 flex items-center gap-1"><User className="w-3.5 h-3.5 text-gray-400" /> {inc.pilotName || '—'}</p>
                  {inc.missionId && <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5"><ExternalLink className="w-3 h-3" /> Mission {inc.missionId}</p>}
                </div>
              </div>

              {/* Injuries */}
              {inc.injuries.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Injuries ({inc.injuries.length})</h4>
                  <div className="space-y-1">
                    {inc.injuries.map((inj, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-xs capitalize">{inj.personType}</span>
                        <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">{inj.severity}</span>
                        <span className="text-gray-600">{inj.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property damage */}
              {inc.propertyDamage.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Property Damage</h4>
                  {inc.propertyDamage.map((pd, i) => (
                    <div key={i} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="font-medium">{pd.owner}:</span> {pd.description}
                      <span className="text-red-600 font-medium">${pd.estimatedCost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Drone damage */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Drone Damage</h4>
                <p className="text-sm text-gray-700">{inc.droneDamage.description}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs">
                  <span className={clsx('px-1.5 py-0.5 rounded font-medium', inc.droneDamage.repairable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                    {inc.droneDamage.repairable ? 'Repairable' : 'Total Loss'}
                  </span>
                  {inc.droneDamage.estimatedRepairCost > 0 && <span className="text-gray-500">Est. repair: ${inc.droneDamage.estimatedRepairCost.toLocaleString()}</span>}
                </div>
              </div>

              {/* Witnesses */}
              {inc.witnesses.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Witnesses ({inc.witnesses.length})</h4>
                  {inc.witnesses.map((w, i) => (
                    <div key={i} className="text-sm mb-1">
                      <span className="font-medium text-gray-700">{w.name}</span>
                      <span className="text-gray-400 mx-1">—</span>
                      <span className="text-gray-600 italic">"{w.statement.length > 120 ? w.statement.slice(0, 120) + '...' : w.statement}"</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Evidence */}
              {inc.investigation.evidence.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Evidence</h4>
                  <div className="flex flex-wrap gap-2">
                    {inc.investigation.evidence.map((ev, i) => {
                      const EIcon = evidenceIcons[ev.type] || File;
                      return (
                        <span key={i} className="flex items-center gap-1.5 px-2 py-1 bg-white border rounded text-xs text-gray-600"><EIcon className="w-3.5 h-3.5" /> {ev.name}</span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Regulatory notifications */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Regulatory Notifications</h4>
                <div className="flex flex-wrap gap-2">
                  {inc.regulatoryNotifications.map((rn, i) => {
                    const colors: Record<string, string> = {
                      required: 'bg-red-50 text-red-700 border-red-200',
                      notified: 'bg-blue-50 text-blue-700 border-blue-200',
                      acknowledged: 'bg-green-50 text-green-700 border-green-200',
                      not_required: 'bg-gray-50 text-gray-500 border-gray-200',
                    };
                    return (
                      <span key={i} className={clsx('px-2 py-1 rounded border text-xs font-medium flex items-center gap-1', colors[rn.status])}>
                        {rn.authority}
                        {rn.status === 'required' && <AlertCircle className="w-3 h-3" />}
                        {rn.status === 'acknowledged' && <CheckCircle className="w-3 h-3" />}
                        {rn.referenceNumber && <span className="text-xs font-normal">({rn.referenceNumber})</span>}
                        <span className="capitalize">{rn.status.replace('_', ' ')}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Insurance */}
              {inc.insuranceClaim && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Insurance Claim</h4>
                  <p className="text-sm text-gray-700">
                    {inc.insuranceClaim.filed ? (
                      <span>Filed — #{inc.insuranceClaim.claimNumber} — {inc.insuranceClaim.status}</span>
                    ) : (
                      <span className="text-gray-400">Not filed</span>
                    )}
                  </p>
                </div>
              )}

              {/* Safety report link */}
              {inc.safetyReportId && (
                <p className="text-xs text-blue-600 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Related Safety Report: {inc.safetyReportId}</p>
              )}

              {/* Timeline */}
              {inc.timeline.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Timeline</h4>
                  <div className="border-l-2 border-gray-200 ml-2 space-y-2">
                    {inc.timeline.map((ev, i) => (
                      <div key={i} className="relative pl-4">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300" />
                        <p className="text-xs text-gray-400">{ev.date}</p>
                        <p className="text-sm text-gray-700"><span className="font-medium">{ev.action}</span> <span className="text-gray-400">by {ev.by}</span></p>
                        {ev.notes && <p className="text-xs text-gray-500">{ev.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons learned */}
              {inc.lessonsLearned && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase mb-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Lessons Learned</h4>
                  <p className="text-sm text-amber-800">{inc.lessonsLearned}</p>
                </div>
              )}

              {/* Tags */}
              {inc.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  {inc.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
