import { useState } from 'react';
import {
  Eye, EyeOff, Radar, Radio, Shield, ShieldCheck, MapPin, Map, Users, Plane,
  Clock, Calendar, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Plus, FileText, Navigation, Target, Crosshair, Phone, Wifi, WifiOff,
  ArrowRight, ArrowLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { BVLOSOperation, BVLOSStats } from '../../../shared/types/bvlos';

// ─── Status Configs ─────────────────────────────────────────────────────────────

type OperationStatus = BVLOSOperation['status'];
type WaiverType = BVLOSOperation['waiverType'];
type RiskLevel = 'low' | 'medium' | 'high';
type MitigationStatus = 'implemented' | 'planned' | 'pending';
type ApprovalStatus = 'pending' | 'approved' | 'denied';
type WizardStep = 1 | 2 | 3 | 4 | 5;

const statusConfig: Record<OperationStatus, { label: string; bg: string; text: string; pulse?: boolean }> = {
  planning: { label: 'Planning', bg: 'bg-gray-100', text: 'text-gray-700' },
  waiver_pending: { label: 'Waiver Pending', bg: 'bg-amber-50', text: 'text-amber-700', pulse: true },
  waiver_approved: { label: 'Waiver Approved', bg: 'bg-green-50', text: 'text-green-700' },
  waiver_denied: { label: 'Waiver Denied', bg: 'bg-red-50', text: 'text-red-700' },
  active: { label: 'Active', bg: 'bg-blue-50', text: 'text-blue-700', pulse: true },
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-200', text: 'text-gray-600' },
};

const waiverTypeConfig: Record<WaiverType, { label: string; bg: string; text: string }> = {
  part_107_waiver: { label: 'Part 107 Waiver', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  type_certification: { label: 'Type Certification', bg: 'bg-purple-50', text: 'text-purple-700' },
  special_authority: { label: 'Special Authority', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  public_coa: { label: 'Public COA', bg: 'bg-teal-50', text: 'text-teal-700' },
};

const riskConfig: Record<RiskLevel, { label: string; bg: string; text: string; border: string }> = {
  low: { label: 'Low', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  medium: { label: 'Medium', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  high: { label: 'High', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

const mitigationStatusConfig: Record<MitigationStatus, { label: string; bg: string; text: string }> = {
  implemented: { label: 'Implemented', bg: 'bg-green-50', text: 'text-green-700' },
  planned: { label: 'Planned', bg: 'bg-blue-50', text: 'text-blue-700' },
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700' },
};

const approvalStatusConfig: Record<ApprovalStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700' },
  approved: { label: 'Approved', bg: 'bg-green-50', text: 'text-green-700' },
  denied: { label: 'Denied', bg: 'bg-red-50', text: 'text-red-700' },
};

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockStats: BVLOSStats = {
  totalOperations: 5,
  activeOperations: 1,
  pendingWaivers: 2,
  approvedWaivers: 2,
  totalFlightHoursBVLOS: 187.5,
  safetyIncidents: 0,
};

const mockOperations: BVLOSOperation[] = [
  {
    id: 'BVLOS-001', tenantId: 'T-001', name: 'Pipeline Corridor Inspection — West Texas',
    status: 'active', waiverType: 'part_107_waiver', waiverNumber: 'W-2026-0451', waiverExpiryDate: '2027-03-01',
    operationArea: { center: { lat: 31.9686, lng: -102.0779 }, radius: 15, maxAltitude: 400, description: 'West Texas pipeline corridor — Midland to Odessa segment (42 miles)' },
    safetyCase: {
      riskAssessment: 'medium',
      mitigations: [
        { risk: 'Loss of C2 link over remote terrain', mitigation: 'Redundant C2 via satellite backup (Iridium) with automatic RTH at 5s link loss', status: 'implemented' },
        { risk: 'Manned aircraft conflict in pipeline corridor', mitigation: 'ADS-B In receiver + ground-based radar coverage with 60s advance warning', status: 'implemented' },
        { risk: 'GPS denial or spoofing', mitigation: 'Dual-band GPS/GLONASS with INS fallback, automatic hover on GPS degradation', status: 'implemented' },
        { risk: 'Weather deterioration during long-range flight', mitigation: 'Real-time METAR/TAF integration with auto-RTH on ceiling < 500ft or visibility < 3SM', status: 'planned' },
      ],
      daaSystem: { type: 'combined', description: 'Ground-based radar (Echodyne EchoGuard) + ADS-B In + onboard camera-based DAA', certified: true },
      communicationPlan: { primary: '4G LTE via T-Mobile FirstNet', backup: 'Iridium satellite modem', lostLinkProcedure: 'Hover 30s → RTH at 200ft AGL → Auto-land at nearest designated site' },
      contingencyPlan: { lostLink: 'Automatic RTH after 30 second timeout, altitude 200ft AGL', systemFailure: 'Parachute deployment system (ASTM F3322 compliant), auto-notify ATC', weatherDegradation: 'RTH triggered when ceiling < 500ft or visibility < 3 SM', airspaceConflict: 'Immediate descend to 50ft AGL and hold, notify ATC via ground station' },
      emergencyPlan: { crashResponse: 'Activate ELT, notify local emergency services, deploy ground team within 30 min', emergencyContacts: [{ name: 'John Martinez', role: 'Operations Director', phone: '(432) 555-0101' }, { name: 'West Texas Fire Dept', role: 'Emergency Services', phone: '(432) 555-0911' }, { name: 'Midland ATC', role: 'Air Traffic Control', phone: '(432) 555-0200' }] },
    },
    groundObservers: [
      { name: 'Mark Davis', position: { lat: 31.9975, lng: -102.0779 }, coverage: 3, communicationMethod: 'Radio Ch 7' },
      { name: 'Lisa Chen', position: { lat: 31.9400, lng: -102.1100 }, coverage: 3, communicationMethod: 'Radio Ch 7' },
      { name: 'Tom Baker', position: { lat: 31.9100, lng: -102.1500 }, coverage: 3, communicationMethod: 'Radio Ch 7' },
    ],
    schedule: { startDate: '2026-03-15', endDate: '2026-04-30', dailyWindows: [{ start: '07:00', end: '11:00' }, { start: '14:00', end: '17:00' }] },
    drones: [{ droneId: 'DRN-002', droneName: 'Matrice 350 RTK', role: 'primary' }, { droneId: 'DRN-008', droneName: 'M30T Enterprise', role: 'backup' }],
    pilots: [{ pilotId: 'PLT-001', pilotName: 'Capt. Sarah Park', role: 'pic' }, { pilotId: 'PLT-003', pilotName: 'James Wu', role: 'backup_pic' }],
    documents: ['waiver_w2026_0451.pdf', 'safety_case_pipeline.pdf', 'daa_certification.pdf', 'emergency_response_plan.pdf'],
    approvals: [{ authority: 'FAA BVLOS Branch', status: 'approved', date: '2026-02-28', notes: 'Approved with altitude restriction 400ft AGL' }, { authority: 'Midland ATC', status: 'approved', date: '2026-03-01' }, { authority: 'Pipeline Operator (Permian Basin Energy)', status: 'approved', date: '2026-02-15' }],
  },
  {
    id: 'BVLOS-002', tenantId: 'T-001', name: 'Agricultural Survey — Iowa Farmlands',
    status: 'waiver_approved', waiverType: 'part_107_waiver', waiverNumber: 'W-2026-0523', waiverExpiryDate: '2027-06-15',
    operationArea: { center: { lat: 41.878, lng: -93.0977 }, radius: 8, maxAltitude: 300, description: 'Central Iowa agricultural region — 2,400 acre multi-crop survey' },
    safetyCase: {
      riskAssessment: 'low',
      mitigations: [
        { risk: 'Low-altitude manned aircraft (crop dusters)', mitigation: 'NOTAM filed + coordination with local ag aviation operators', status: 'implemented' },
        { risk: 'Terrain obstacles (silos, power lines)', mitigation: '3D terrain model pre-loaded with 50ft obstacle clearance buffer', status: 'implemented' },
        { risk: 'Wildlife strikes (migratory birds)', mitigation: 'Operations restricted to non-peak migration periods, onboard avoidance', status: 'planned' },
      ],
      daaSystem: { type: 'adsb', description: 'ADS-B In receiver with 10NM detection range + visual observer network', certified: false },
      communicationPlan: { primary: 'VHF radio (122.75)', backup: 'Cell phone (AT&T coverage verified)', lostLinkProcedure: 'Auto-land in nearest designated field after 15s timeout' },
      contingencyPlan: { lostLink: 'Auto-land in pre-mapped safe landing zone within 15s', systemFailure: 'Motor-out glide to nearest field, activate strobe and buzzer', weatherDegradation: 'RTH if wind > 25 kts or precipitation detected', airspaceConflict: 'Immediate land in nearest field, radio all traffic on 122.75' },
      emergencyPlan: { crashResponse: 'Ground team dispatched from farm HQ, notify landowner', emergencyContacts: [{ name: 'Emily Zhang', role: 'PIC / Operations Lead', phone: '(515) 555-0301' }, { name: 'Story County Sheriff', role: 'Local Authority', phone: '(515) 555-0100' }] },
    },
    groundObservers: [
      { name: 'Ryan Miller', position: { lat: 41.890, lng: -93.100 }, coverage: 4, communicationMethod: 'VHF 122.75' },
      { name: 'Karen Johnson', position: { lat: 41.865, lng: -93.090 }, coverage: 4, communicationMethod: 'VHF 122.75' },
    ],
    schedule: { startDate: '2026-04-10', endDate: '2026-04-25', dailyWindows: [{ start: '06:00', end: '10:00' }] },
    drones: [{ droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', role: 'primary' }],
    pilots: [{ pilotId: 'PLT-002', pilotName: 'Mike Chen', role: 'pic' }],
    documents: ['waiver_w2026_0523.pdf', 'safety_case_ag_survey.pdf', 'landowner_agreements.pdf'],
    approvals: [{ authority: 'FAA BVLOS Branch', status: 'approved', date: '2026-03-20', notes: 'Approved for daylight VFR operations only' }, { authority: 'Story County (Iowa)', status: 'approved', date: '2026-03-18' }],
  },
  {
    id: 'BVLOS-003', tenantId: 'T-001', name: 'Powerline Inspection — Appalachian Corridor',
    status: 'waiver_pending', waiverType: 'type_certification',
    operationArea: { center: { lat: 37.7749, lng: -79.4428 }, radius: 25, maxAltitude: 500, description: 'Appalachian powerline corridor — Blue Ridge segment (68 miles)' },
    safetyCase: {
      riskAssessment: 'high',
      mitigations: [
        { risk: 'Mountainous terrain with limited emergency landing options', mitigation: 'Pre-surveyed emergency landing zones every 2 miles along corridor', status: 'planned' },
        { risk: 'Variable weather in mountain passes', mitigation: 'Mountain weather stations network + real-time visibility monitoring', status: 'pending' },
        { risk: 'EMI from high-voltage powerlines affecting avionics', mitigation: 'EMI-shielded avionics + 100ft lateral offset from conductors', status: 'implemented' },
        { risk: 'Cell coverage gaps in remote mountain areas', mitigation: 'Mesh radio network with repeaters on ridge tops every 5 miles', status: 'pending' },
      ],
      daaSystem: { type: 'radar', description: 'Ground-based phased array radar network (3 units covering full corridor)', certified: false },
      communicationPlan: { primary: 'Mesh radio network (900 MHz)', backup: 'Iridium satellite', lostLinkProcedure: 'Orbit current position at 300ft AGL for 60s, then RTH via pre-planned safe corridor' },
      contingencyPlan: { lostLink: 'Orbit 60s then RTH via safe corridor avoiding powerlines', systemFailure: 'Parachute deployment + ELT activation, avoid powerline contact', weatherDegradation: 'RTH via valley route if ceiling drops below 1000ft MSL', airspaceConflict: 'Descend below treeline and hold, ground team visual confirmation' },
      emergencyPlan: { crashResponse: 'Coordinate with utility company for powerline de-energization if needed, deploy SAR team', emergencyContacts: [{ name: 'David Park', role: 'Chief Pilot', phone: '(540) 555-0401' }, { name: 'Appalachian Power Co.', role: 'Utility Operator', phone: '(540) 555-0500' }, { name: 'VA State Police Aviation', role: 'SAR Coordination', phone: '(540) 555-0911' }] },
    },
    groundObservers: [
      { name: 'Alex Rivera', position: { lat: 37.800, lng: -79.430 }, coverage: 2, communicationMethod: 'Mesh Radio' },
      { name: 'Priya Patel', position: { lat: 37.770, lng: -79.460 }, coverage: 2, communicationMethod: 'Mesh Radio' },
      { name: 'Chris Lee', position: { lat: 37.740, lng: -79.490 }, coverage: 2, communicationMethod: 'Mesh Radio' },
      { name: 'Dana Kim', position: { lat: 37.710, lng: -79.520 }, coverage: 2, communicationMethod: 'Mesh Radio' },
    ],
    schedule: { startDate: '2026-05-01', endDate: '2026-06-30', dailyWindows: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }] },
    drones: [{ droneId: 'DRN-007', droneName: 'Inspire 3', role: 'primary' }, { droneId: 'DRN-002', droneName: 'Matrice 350 RTK', role: 'backup' }],
    pilots: [{ pilotId: 'PLT-001', pilotName: 'Capt. Sarah Park', role: 'pic' }, { pilotId: 'PLT-004', pilotName: 'Rachel Torres', role: 'backup_pic' }, { pilotId: 'PLT-005', pilotName: 'Kevin Nguyen', role: 'payload_operator' }],
    documents: ['type_cert_application.pdf', 'safety_case_powerline.pdf', 'terrain_analysis.pdf', 'radar_coverage_map.pdf'],
    approvals: [{ authority: 'FAA BVLOS Branch', status: 'pending', notes: 'Under 90-day review' }, { authority: 'FAA Type Certification', status: 'pending' }, { authority: 'Appalachian Power Co.', status: 'approved', date: '2026-02-10' }, { authority: 'VA Dept of Aviation', status: 'pending' }],
  },
  {
    id: 'BVLOS-004', tenantId: 'T-001', name: 'Emergency Medical Supply Delivery — Rural Nevada',
    status: 'waiver_pending', waiverType: 'public_coa',
    operationArea: { center: { lat: 39.1638, lng: -119.7674 }, radius: 20, maxAltitude: 400, description: 'Rural Nevada — Carson City to remote clinics network (5 delivery points)' },
    safetyCase: {
      riskAssessment: 'medium',
      mitigations: [
        { risk: 'Extreme temperature effects on battery performance', mitigation: 'Battery pre-conditioning system + thermal insulated payload bay', status: 'implemented' },
        { risk: 'High-altitude density altitude affecting performance', mitigation: 'Performance calculations adjusted for 5,000ft MSL operations', status: 'implemented' },
        { risk: 'Limited visual observers in remote desert terrain', mitigation: 'Satellite-based tracking + automated ADS-B surveillance', status: 'planned' },
      ],
      daaSystem: { type: 'adsb', description: 'ADS-B In/Out with satellite relay for remote area coverage', certified: true },
      communicationPlan: { primary: 'Satellite (Starlink)', backup: 'VHF radio relay stations', lostLinkProcedure: 'Auto-RTH to nearest clinic with safe landing pad' },
      contingencyPlan: { lostLink: 'RTH to nearest clinic landing pad within 30s', systemFailure: 'Parachute + GPS beacon activation, cargo drop if needed', weatherDegradation: 'Hold at nearest clinic until conditions improve', airspaceConflict: 'Immediate descent and hold at 50ft AGL' },
      emergencyPlan: { crashResponse: 'Activate GPS beacon, notify SAR, protect medical cargo if possible', emergencyContacts: [{ name: 'Dr. Lisa Yamamoto', role: 'Medical Director', phone: '(775) 555-0601' }, { name: 'Carson City SAR', role: 'Search & Rescue', phone: '(775) 555-0911' }] },
    },
    groundObservers: [
      { name: 'Sam Wilson', position: { lat: 39.180, lng: -119.770 }, coverage: 5, communicationMethod: 'Satellite phone' },
    ],
    schedule: { startDate: '2026-06-01', endDate: '2026-12-31', dailyWindows: [{ start: '06:00', end: '18:00' }] },
    drones: [{ droneId: 'DRN-008', droneName: 'M30T Enterprise', role: 'primary' }, { droneId: 'DRN-004', droneName: 'Skydio X10', role: 'backup' }],
    pilots: [{ pilotId: 'PLT-003', pilotName: 'James Wu', role: 'pic' }, { pilotId: 'PLT-002', pilotName: 'Mike Chen', role: 'backup_pic' }],
    documents: ['public_coa_application.pdf', 'medical_delivery_sop.pdf', 'safety_case_medical.pdf'],
    approvals: [{ authority: 'FAA Public COA Office', status: 'pending', notes: 'Initial review complete, awaiting safety board' }, { authority: 'Nevada Dept of Transportation', status: 'approved', date: '2026-03-05' }, { authority: 'Carson City Health Dept', status: 'approved', date: '2026-02-20' }],
  },
  {
    id: 'BVLOS-005', tenantId: 'T-001', name: 'Solar Farm Survey — Mojave Desert',
    status: 'completed', waiverType: 'special_authority', waiverNumber: 'SA-2025-1189', waiverExpiryDate: '2026-06-30',
    operationArea: { center: { lat: 35.0110, lng: -117.6509 }, radius: 5, maxAltitude: 250, description: 'Mojave Desert solar farm complex — 3,200 acre facility thermal & visual inspection' },
    safetyCase: {
      riskAssessment: 'low',
      mitigations: [
        { risk: 'Glare from solar panels affecting sensors', mitigation: 'Anti-glare sensor filters + flight path optimized for sun angle', status: 'implemented' },
        { risk: 'Edwards AFB restricted airspace proximity', mitigation: 'Geofence hard limit + ATC coordination with Edwards approach', status: 'implemented' },
      ],
      daaSystem: { type: 'visual_observer_network', description: 'Network of 4 visual observers with binoculars and radios', certified: false },
      communicationPlan: { primary: 'VHF radio (123.45)', backup: 'Cell phone (Verizon)', lostLinkProcedure: 'Auto-land at solar farm control building helipad' },
      contingencyPlan: { lostLink: 'Auto-land at designated pad within 20s', systemFailure: 'Glide to clear area between panel rows', weatherDegradation: 'RTH if wind > 20 kts or dust visibility < 2 SM', airspaceConflict: 'Immediate land between panel rows, contact Edwards ATC' },
      emergencyPlan: { crashResponse: 'Solar farm emergency team responds, protect panels from battery fire', emergencyContacts: [{ name: 'Angela Brooks', role: 'Solar Farm Manager', phone: '(760) 555-0701' }, { name: 'Kern County Fire', role: 'Fire Department', phone: '(760) 555-0911' }] },
    },
    groundObservers: [
      { name: 'Jake Thompson', position: { lat: 35.015, lng: -117.645 }, coverage: 2, communicationMethod: 'VHF 123.45' },
      { name: 'Maria Gonzalez', position: { lat: 35.005, lng: -117.655 }, coverage: 2, communicationMethod: 'VHF 123.45' },
    ],
    schedule: { startDate: '2026-02-01', endDate: '2026-02-15', dailyWindows: [{ start: '09:00', end: '15:00' }] },
    drones: [{ droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', role: 'primary' }],
    pilots: [{ pilotId: 'PLT-001', pilotName: 'Capt. Sarah Park', role: 'pic' }],
    documents: ['special_authority_sa2025_1189.pdf', 'solar_farm_survey_plan.pdf', 'edwards_afb_coordination.pdf'],
    approvals: [{ authority: 'FAA Special Authority', status: 'approved', date: '2025-12-15' }, { authority: 'Edwards AFB Airspace', status: 'approved', date: '2026-01-20' }, { authority: 'Solar Farm Operator (SunPower Corp)', status: 'approved', date: '2025-11-30' }],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export function BVLOSPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [filterStatus, setFilterStatus] = useState<OperationStatus | 'all'>('all');

  // Wizard form state
  const [wizardData, setWizardData] = useState({
    name: '', waiverType: 'part_107_waiver' as WaiverType,
    areaDesc: '', lat: '', lng: '', radius: '', maxAlt: '',
    startDate: '', endDate: '', windowStart: '', windowEnd: '',
    riskAssessment: 'medium' as RiskLevel,
    daaType: 'combined' as BVLOSOperation['safetyCase']['daaSystem']['type'],
    daaDesc: '', daaCertified: false,
    commPrimary: '', commBackup: '', lostLinkProc: '',
    contLostLink: '', contSysFailure: '', contWeather: '', contAirspace: '',
    crashResponse: '', emergName: '', emergRole: '', emergPhone: '',
    droneName: '', droneRole: 'primary' as 'primary' | 'backup',
    pilotName: '', pilotRole: 'pic' as 'pic' | 'backup_pic' | 'payload_operator',
    obsName: '', obsLat: '', obsLng: '', obsCoverage: '', obsComm: '',
    mitigations: [] as Array<{ risk: string; mitigation: string; status: MitigationStatus }>,
    newRisk: '', newMitigation: '', newMitStatus: 'planned' as MitigationStatus,
  });

  const stats = mockStats;

  const filtered = filterStatus === 'all'
    ? mockOperations
    : mockOperations.filter(op => op.status === filterStatus);

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const handleWizardNext = () => { if (wizardStep < 5) setWizardStep((wizardStep + 1) as WizardStep); };
  const handleWizardBack = () => { if (wizardStep > 1) setWizardStep((wizardStep - 1) as WizardStep); };

  const addMitigation = () => {
    if (wizardData.newRisk && wizardData.newMitigation) {
      setWizardData(prev => ({
        ...prev,
        mitigations: [...prev.mitigations, { risk: prev.newRisk, mitigation: prev.newMitigation, status: prev.newMitStatus }],
        newRisk: '', newMitigation: '', newMitStatus: 'planned',
      }));
    }
  };

  const removeMitigation = (idx: number) => {
    setWizardData(prev => ({ ...prev, mitigations: prev.mitigations.filter((_, i) => i !== idx) }));
  };

  // ─── Stats Bar ────────────────────────────────────────────────────────────────

  const statItems = [
    { label: 'Total BVLOS Ops', value: stats.totalOperations, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active', value: stats.activeOperations, icon: Radar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Waivers', value: stats.pendingWaivers, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved Waivers', value: stats.approvedWaivers, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'BVLOS Flight Hours', value: stats.totalFlightHoursBVLOS.toFixed(1), icon: Navigation, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Safety Incidents', value: stats.safetyIncidents, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BVLOS Operations</h1>
          <p className="text-sm text-gray-500 mt-1">Beyond Visual Line of Sight — Waiver management, safety cases & DAA systems</p>
        </div>
        <button onClick={() => { setShowWizard(true); setWizardStep(1); }} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> New BVLOS Operation
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statItems.map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={clsx('rounded-lg p-1.5', s.bg)}><s.icon className={clsx('h-4 w-4', s.color)} /></div>
              <span className="text-xs font-medium text-gray-500 truncate">{s.label}</span>
            </div>
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        {(['all', 'planning', 'waiver_pending', 'waiver_approved', 'active', 'completed', 'cancelled'] as const).map(st => (
          <button key={st} onClick={() => setFilterStatus(st)} className={clsx('rounded-full px-3 py-1 text-xs font-medium transition-colors', filterStatus === st ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {st === 'all' ? 'All' : statusConfig[st].label}
          </button>
        ))}
      </div>

      {/* Operations List */}
      <div className="space-y-4">
        {filtered.map(op => {
          const sc = statusConfig[op.status];
          const wc = waiverTypeConfig[op.waiverType];
          const rc = riskConfig[op.safetyCase.riskAssessment];
          const isExpanded = expandedId === op.id;

          return (
            <div key={op.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{op.name}</h3>
                      <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', sc.bg, sc.text, sc.pulse && 'animate-pulse')}>{sc.label}</span>
                      <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', wc.bg, wc.text)}>{wc.label}</span>
                    </div>
                    <p className="text-sm text-gray-500">{op.id}{op.waiverNumber ? ` — ${op.waiverNumber}` : ''}</p>
                  </div>
                  <div className={clsx('flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold', rc.bg, rc.text, rc.border)}>
                    <Shield className="h-3.5 w-3.5" /> Risk: {rc.label}
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="font-medium text-gray-700">Operation Area</p><p className="text-gray-500">{op.operationArea.description}</p><p className="text-gray-400 text-xs">Radius: {op.operationArea.radius} mi | Max Alt: {op.operationArea.maxAltitude} ft AGL</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="font-medium text-gray-700">Schedule</p><p className="text-gray-500">{op.schedule.startDate} to {op.schedule.endDate}</p><p className="text-gray-400 text-xs">{op.schedule.dailyWindows.map(w => `${w.start}–${w.end}`).join(', ')}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Plane className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="font-medium text-gray-700">Aircraft ({op.drones.length})</p>{op.drones.map(d => (<p key={d.droneId} className="text-gray-500">{d.droneName} <span className="text-gray-400 text-xs">({d.role})</span></p>))}</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div><p className="font-medium text-gray-700">Crew ({op.pilots.length})</p>{op.pilots.map(p => (<p key={p.pilotId} className="text-gray-500">{p.pilotName} <span className="text-gray-400 text-xs">({p.role.toUpperCase()})</span></p>))}</div>
                  </div>
                </div>

                {/* DAA & Comms Summary */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                    <Radar className="h-3.5 w-3.5" /> DAA: {op.safetyCase.daaSystem.type.replace(/_/g, ' ')} {op.safetyCase.daaSystem.certified && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                    <Wifi className="h-3.5 w-3.5" /> {op.safetyCase.communicationPlan.primary}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                    <Target className="h-3.5 w-3.5" /> Observers: {op.groundObservers.length}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                    <FileText className="h-3.5 w-3.5" /> Docs: {op.documents.length}
                  </div>
                </div>

                {/* Approvals Row */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {op.approvals.map((a, i) => {
                    const ac = approvalStatusConfig[a.status];
                    return (
                      <div key={i} className={clsx('flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium', ac.bg, ac.text)}>
                        {a.status === 'approved' ? <CheckCircle className="h-3 w-3" /> : a.status === 'denied' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {a.authority}
                      </div>
                    );
                  })}
                </div>

                {/* Expand Toggle */}
                <button onClick={() => toggleExpand(op.id)} className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {isExpanded ? 'Hide Details' : 'Show Full Safety Case'}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-5">
                  {/* Mitigations Table */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-indigo-500" /> Risk Mitigations</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-200"><th className="pb-2 pr-4">Risk</th><th className="pb-2 pr-4">Mitigation</th><th className="pb-2">Status</th></tr></thead>
                        <tbody>
                          {op.safetyCase.mitigations.map((m, i) => {
                            const ms = mitigationStatusConfig[m.status];
                            return (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-2 pr-4 text-gray-700">{m.risk}</td>
                                <td className="py-2 pr-4 text-gray-600">{m.mitigation}</td>
                                <td className="py-2"><span className={clsx('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', ms.bg, ms.text)}>{ms.label}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* DAA System Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Radar className="h-4 w-4 text-blue-500" /> Detect & Avoid System</h4>
                    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-700">{op.safetyCase.daaSystem.type.replace(/_/g, ' ')}</span></div>
                        <div><span className="text-gray-500">Certified:</span> <span className={clsx('font-medium', op.safetyCase.daaSystem.certified ? 'text-green-600' : 'text-amber-600')}>{op.safetyCase.daaSystem.certified ? 'Yes' : 'No'}</span></div>
                        <div className="sm:col-span-3"><span className="text-gray-500">Description:</span> <span className="text-gray-700">{op.safetyCase.daaSystem.description}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Communication Plan */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Radio className="h-4 w-4 text-green-500" /> Communication Plan</h4>
                    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5 text-green-500" /><span className="text-gray-500">Primary:</span> <span className="font-medium text-gray-700">{op.safetyCase.communicationPlan.primary}</span></div>
                      <div className="flex items-center gap-1"><WifiOff className="h-3.5 w-3.5 text-amber-500" /><span className="text-gray-500">Backup:</span> <span className="font-medium text-gray-700">{op.safetyCase.communicationPlan.backup}</span></div>
                      <div className="sm:col-span-3"><span className="text-gray-500">Lost Link:</span> <span className="text-gray-700">{op.safetyCase.communicationPlan.lostLinkProcedure}</span></div>
                    </div>
                  </div>

                  {/* Contingency Plans */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-500" /> Contingency Plans</h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Object.entries(op.safetyCase.contingencyPlan).map(([key, val]) => (
                        <div key={key} className="rounded-lg border border-gray-200 bg-white p-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm text-gray-700">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Phone className="h-4 w-4 text-red-500" /> Emergency Plan & Contacts</h4>
                    <div className="rounded-lg border border-gray-200 bg-white p-3 mb-2 text-sm">
                      <p className="text-gray-500 text-xs font-semibold mb-1">Crash Response</p>
                      <p className="text-gray-700">{op.safetyCase.emergencyPlan.crashResponse}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {op.safetyCase.emergencyPlan.emergencyContacts.map((c, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                          <p className="font-medium text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.role}</p>
                          <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ground Observers */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Crosshair className="h-4 w-4 text-purple-500" /> Ground Observer Network</h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {op.groundObservers.map((obs, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                          <p className="font-medium text-gray-800">{obs.name}</p>
                          <p className="text-xs text-gray-500">Coverage: {obs.coverage} mi radius</p>
                          <p className="text-xs text-gray-400">{obs.position.lat.toFixed(3)}, {obs.position.lng.toFixed(3)}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Radio className="h-3 w-3" />{obs.communicationMethod}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><FileText className="h-4 w-4 text-gray-500" /> Documents</h4>
                    <div className="flex flex-wrap gap-2">
                      {op.documents.map((doc, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"><FileText className="h-3 w-3" />{doc}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <EyeOff className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No BVLOS operations match the current filter.</p>
        </div>
      )}

      {/* ─── New BVLOS Wizard Modal ──────────────────────────────────────────────── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New BVLOS Operation</h2>
                <p className="text-xs text-gray-500">Step {wizardStep} of 5</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-1">
                {([1,2,3,4,5] as const).map(s => (
                  <div key={s} className="flex-1 flex items-center gap-1">
                    <div className={clsx('h-2 flex-1 rounded-full transition-colors', s <= wizardStep ? 'bg-indigo-500' : 'bg-gray-200')} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>Basic Info</span><span>Safety Case</span><span>Resources</span><span>Mitigations</span><span>Review</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Step 1: Basic Info */}
              {wizardStep === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operation Name</label>
                    <input type="text" value={wizardData.name} onChange={e => setWizardData(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g., Pipeline Corridor Inspection" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waiver Type</label>
                    <select value={wizardData.waiverType} onChange={e => setWizardData(p => ({ ...p, waiverType: e.target.value as WaiverType }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                      <option value="part_107_waiver">Part 107 Waiver</option>
                      <option value="type_certification">Type Certification</option>
                      <option value="special_authority">Special Authority</option>
                      <option value="public_coa">Public COA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operation Area Description</label>
                    <textarea value={wizardData.areaDesc} onChange={e => setWizardData(p => ({ ...p, areaDesc: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Describe the operation area..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Center Lat</label><input type="number" step="any" value={wizardData.lat} onChange={e => setWizardData(p => ({ ...p, lat: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="31.9686" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Center Lng</label><input type="number" step="any" value={wizardData.lng} onChange={e => setWizardData(p => ({ ...p, lng: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="-102.0779" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Radius (mi)</label><input type="number" value={wizardData.radius} onChange={e => setWizardData(p => ({ ...p, radius: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="15" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Max Alt (ft AGL)</label><input type="number" value={wizardData.maxAlt} onChange={e => setWizardData(p => ({ ...p, maxAlt: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="400" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label><input type="date" value={wizardData.startDate} onChange={e => setWizardData(p => ({ ...p, startDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">End Date</label><input type="date" value={wizardData.endDate} onChange={e => setWizardData(p => ({ ...p, endDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Window Start</label><input type="time" value={wizardData.windowStart} onChange={e => setWizardData(p => ({ ...p, windowStart: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Window End</label><input type="time" value={wizardData.windowEnd} onChange={e => setWizardData(p => ({ ...p, windowEnd: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                  </div>
                </>
              )}

              {/* Step 2: Safety Case */}
              {wizardStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Assessment</label>
                    <div className="flex gap-3">
                      {(['low', 'medium', 'high'] as const).map(r => (
                        <button key={r} onClick={() => setWizardData(p => ({ ...p, riskAssessment: r }))} className={clsx('flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors', wizardData.riskAssessment === r ? `${riskConfig[r].bg} ${riskConfig[r].text} ${riskConfig[r].border}` : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>{riskConfig[r].label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DAA System Type</label>
                      <select value={wizardData.daaType} onChange={e => setWizardData(p => ({ ...p, daaType: e.target.value as typeof wizardData.daaType }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                        <option value="radar">Radar</option><option value="adsb">ADS-B</option><option value="visual_observer_network">Visual Observer Network</option><option value="onboard_sensors">Onboard Sensors</option><option value="combined">Combined</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={wizardData.daaCertified} onChange={e => setWizardData(p => ({ ...p, daaCertified: e.target.checked }))} className="rounded border-gray-300 text-indigo-600" /> DAA System Certified</label>
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">DAA System Description</label><textarea value={wizardData.daaDesc} onChange={e => setWizardData(p => ({ ...p, daaDesc: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe the DAA system configuration..." /></div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Primary Comms</label><input type="text" value={wizardData.commPrimary} onChange={e => setWizardData(p => ({ ...p, commPrimary: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g., 4G LTE" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Backup Comms</label><input type="text" value={wizardData.commBackup} onChange={e => setWizardData(p => ({ ...p, commBackup: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g., Iridium satellite" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Lost Link Procedure</label><textarea value={wizardData.lostLinkProc} onChange={e => setWizardData(p => ({ ...p, lostLinkProc: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe lost link procedure..." /></div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Contingency: Lost Link</label><textarea value={wizardData.contLostLink} onChange={e => setWizardData(p => ({ ...p, contLostLink: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Contingency: System Failure</label><textarea value={wizardData.contSysFailure} onChange={e => setWizardData(p => ({ ...p, contSysFailure: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Contingency: Weather</label><textarea value={wizardData.contWeather} onChange={e => setWizardData(p => ({ ...p, contWeather: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Contingency: Airspace Conflict</label><textarea value={wizardData.contAirspace} onChange={e => setWizardData(p => ({ ...p, contAirspace: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Crash Response Plan</label><textarea value={wizardData.crashResponse} onChange={e => setWizardData(p => ({ ...p, crashResponse: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe crash response procedure..." /></div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact Name</label><input type="text" value={wizardData.emergName} onChange={e => setWizardData(p => ({ ...p, emergName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Role</label><input type="text" value={wizardData.emergRole} onChange={e => setWizardData(p => ({ ...p, emergRole: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label><input type="text" value={wizardData.emergPhone} onChange={e => setWizardData(p => ({ ...p, emergPhone: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                  </div>
                </>
              )}

              {/* Step 3: Resources */}
              {wizardStep === 3 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><Plane className="h-4 w-4 text-blue-500" /> Assign Drones</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Drone Name</label><input type="text" value={wizardData.droneName} onChange={e => setWizardData(p => ({ ...p, droneName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g., Matrice 350 RTK" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                      <select value={wizardData.droneRole} onChange={e => setWizardData(p => ({ ...p, droneRole: e.target.value as 'primary' | 'backup' }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="primary">Primary</option><option value="backup">Backup</option></select>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-4"><Users className="h-4 w-4 text-green-500" /> Assign Pilots</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Pilot Name</label><input type="text" value={wizardData.pilotName} onChange={e => setWizardData(p => ({ ...p, pilotName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g., Capt. Sarah Park" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                      <select value={wizardData.pilotRole} onChange={e => setWizardData(p => ({ ...p, pilotRole: e.target.value as 'pic' | 'backup_pic' | 'payload_operator' }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="pic">PIC</option><option value="backup_pic">Backup PIC</option><option value="payload_operator">Payload Operator</option></select>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-4"><Crosshair className="h-4 w-4 text-purple-500" /> Ground Observers</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Name</label><input type="text" value={wizardData.obsName} onChange={e => setWizardData(p => ({ ...p, obsName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label><input type="number" step="any" value={wizardData.obsLat} onChange={e => setWizardData(p => ({ ...p, obsLat: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label><input type="number" step="any" value={wizardData.obsLng} onChange={e => setWizardData(p => ({ ...p, obsLng: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Coverage (mi)</label><input type="number" value={wizardData.obsCoverage} onChange={e => setWizardData(p => ({ ...p, obsCoverage: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Comms Method</label><input type="text" value={wizardData.obsComm} onChange={e => setWizardData(p => ({ ...p, obsComm: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                  </div>
                </>
              )}

              {/* Step 4: Mitigations */}
              {wizardStep === 4 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-indigo-500" /> Risk Mitigations</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Risk</label><input type="text" value={wizardData.newRisk} onChange={e => setWizardData(p => ({ ...p, newRisk: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe the risk..." /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Mitigation</label><input type="text" value={wizardData.newMitigation} onChange={e => setWizardData(p => ({ ...p, newMitigation: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="How to mitigate..." /></div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                      <div className="flex gap-2">
                        <select value={wizardData.newMitStatus} onChange={e => setWizardData(p => ({ ...p, newMitStatus: e.target.value as MitigationStatus }))} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="implemented">Implemented</option><option value="planned">Planned</option><option value="pending">Pending</option></select>
                        <button onClick={addMitigation} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"><Plus className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                  {wizardData.mitigations.length > 0 && (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-200"><th className="pb-2 pr-4">Risk</th><th className="pb-2 pr-4">Mitigation</th><th className="pb-2 pr-4">Status</th><th className="pb-2 w-8"></th></tr></thead>
                        <tbody>
                          {wizardData.mitigations.map((m, i) => {
                            const ms = mitigationStatusConfig[m.status];
                            return (
                              <tr key={i} className="border-b border-gray-100">
                                <td className="py-2 pr-4 text-gray-700">{m.risk}</td>
                                <td className="py-2 pr-4 text-gray-600">{m.mitigation}</td>
                                <td className="py-2 pr-4"><span className={clsx('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', ms.bg, ms.text)}>{ms.label}</span></td>
                                <td className="py-2"><button onClick={() => removeMitigation(i)} className="text-red-400 hover:text-red-600"><XCircle className="h-4 w-4" /></button></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {wizardData.mitigations.length === 0 && <p className="text-sm text-gray-400 italic">No mitigations added yet. Add at least one risk/mitigation pair.</p>}
                </>
              )}

              {/* Step 5: Review */}
              {wizardStep === 5 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800">Review & Submit</h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{wizardData.name || '(not set)'}</span></div>
                      <div><span className="text-gray-500">Waiver Type:</span> <span className="font-medium text-gray-800">{waiverTypeConfig[wizardData.waiverType].label}</span></div>
                      <div><span className="text-gray-500">Risk Assessment:</span> <span className={clsx('font-medium', riskConfig[wizardData.riskAssessment].text)}>{riskConfig[wizardData.riskAssessment].label}</span></div>
                      <div><span className="text-gray-500">DAA Type:</span> <span className="font-medium text-gray-800">{wizardData.daaType.replace(/_/g, ' ')}</span></div>
                      <div><span className="text-gray-500">Area:</span> <span className="font-medium text-gray-800">{wizardData.areaDesc || '(not set)'}</span></div>
                      <div><span className="text-gray-500">Schedule:</span> <span className="font-medium text-gray-800">{wizardData.startDate || '?'} to {wizardData.endDate || '?'}</span></div>
                      <div><span className="text-gray-500">Primary Comms:</span> <span className="font-medium text-gray-800">{wizardData.commPrimary || '(not set)'}</span></div>
                      <div><span className="text-gray-500">Backup Comms:</span> <span className="font-medium text-gray-800">{wizardData.commBackup || '(not set)'}</span></div>
                      <div><span className="text-gray-500">Drone:</span> <span className="font-medium text-gray-800">{wizardData.droneName || '(not set)'} ({wizardData.droneRole})</span></div>
                      <div><span className="text-gray-500">Pilot:</span> <span className="font-medium text-gray-800">{wizardData.pilotName || '(not set)'} ({wizardData.pilotRole.toUpperCase()})</span></div>
                    </div>
                    <div><span className="text-gray-500">Mitigations:</span> <span className="font-medium text-gray-800">{wizardData.mitigations.length} defined</span></div>
                  </div>
                  <p className="text-xs text-gray-400">Submitting will create a new BVLOS operation in Planning status. You can add additional details after creation.</p>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-b-2xl">
              <button onClick={handleWizardBack} disabled={wizardStep === 1} className={clsx('flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors', wizardStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100')}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowWizard(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                {wizardStep < 5 ? (
                  <button onClick={handleWizardNext} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={() => setShowWizard(false)} className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                    <CheckCircle className="h-4 w-4" /> Submit Operation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
