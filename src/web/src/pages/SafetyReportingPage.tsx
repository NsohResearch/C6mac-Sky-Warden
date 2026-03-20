import { useState } from 'react';
import {
  ShieldAlert, Plus, Search, CheckCircle, XCircle, AlertTriangle,
  Clock, Eye, ArrowRight, ArrowLeft, MapPin, Calendar,
  ChevronDown, ChevronUp, Filter, FileText, Upload, Download,
  Radio, Activity, BarChart3, Plane, AlertCircle, Info,
  ExternalLink, RefreshCw, Shield, Wifi, WifiOff, Target,
  Zap, Bug, Wind, CloudRain, Navigation, Lock, BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'reports' | 'b4ufly' | 'remote_id' | 'analytics';
type WizardStep = 1 | 2 | 3 | 4 | 5;
type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'filed_faa' | 'filed_asrs' | 'closed' | 'overdue';
type ReportType = 'mandatory' | 'voluntary';
type Severity = 'none' | 'minor' | 'moderate' | 'serious' | 'critical' | 'fatal';
type B4UFlyLevel = 'green' | 'yellow' | 'red';
type RIDStatus = 'compliant' | 'non_compliant' | 'issues' | 'unchecked';

// ─── Status configs ───────────────────────────────────────────────────────────
const reportStatusConfig: Record<ReportStatus, { label: string; bg: string; text: string; pulse?: boolean }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700' },
  submitted: { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-700' },
  under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700' },
  filed_faa: { label: 'Filed FAA', bg: 'bg-red-50', text: 'text-red-700' },
  filed_asrs: { label: 'Filed ASRS', bg: 'bg-blue-50', text: 'text-blue-700' },
  closed: { label: 'Closed', bg: 'bg-green-50', text: 'text-green-700' },
  overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-800', pulse: true },
};

const severityConfig: Record<Severity, { label: string; bg: string; text: string }> = {
  none: { label: 'None', bg: 'bg-gray-100', text: 'text-gray-600' },
  minor: { label: 'Minor', bg: 'bg-blue-50', text: 'text-blue-700' },
  moderate: { label: 'Moderate', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  serious: { label: 'Serious', bg: 'bg-orange-50', text: 'text-orange-700' },
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700' },
  fatal: { label: 'Fatal', bg: 'bg-red-100', text: 'text-red-900' },
};

const ridStatusConfig: Record<RIDStatus, { label: string; bg: string; text: string; icon: string }> = {
  compliant: { label: 'Compliant', bg: 'bg-green-50', text: 'text-green-700', icon: 'check' },
  non_compliant: { label: 'Non-Compliant', bg: 'bg-red-50', text: 'text-red-700', icon: 'x' },
  issues: { label: 'Issues', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'warn' },
  unchecked: { label: 'Unchecked', bg: 'bg-gray-100', text: 'text-gray-600', icon: 'gray' },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockReports = [
  { id: 'SKW-SR-2026-0042', date: '2026-03-18', type: 'mandatory' as ReportType, categories: ['Crash', 'Property Damage'], severity: 'serious' as Severity, status: 'overdue' as ReportStatus, drone: 'SKW-US-A7B3X9', narrative: 'During routine inspection flight, aircraft experienced sudden loss of GPS signal causing flyaway into residential fence. Property damage estimated $750.', injuries: 0, damage: '$750', filedFaa: false, filedAsrs: false, deadline: '2026-03-28' },
  { id: 'SKW-SR-2026-0041', date: '2026-03-17', type: 'mandatory' as ReportType, categories: ['Injury to Person', 'Loss of Control'], severity: 'critical' as Severity, status: 'overdue' as ReportStatus, drone: 'SKW-US-K9M2P4', narrative: 'Matrice 350 RTK prop strike during landing. Bystander sustained laceration to forearm requiring stitches. AIS 3.', injuries: 1, damage: '$200', filedFaa: false, filedAsrs: false, deadline: '2026-03-27' },
  { id: 'SKW-SR-2026-0040', date: '2026-03-15', type: 'voluntary' as ReportType, categories: ['Near Midair Collision'], severity: 'moderate' as Severity, status: 'filed_asrs' as ReportStatus, drone: 'SKW-US-W3J6F2', narrative: 'Near miss with manned helicopter at approx 350ft AGL. Horizontal separation estimated 200ft. ATC contact established.', injuries: 0, damage: '$0', filedFaa: false, filedAsrs: true, deadline: null },
  { id: 'SKW-SR-2026-0039', date: '2026-03-12', type: 'mandatory' as ReportType, categories: ['Property Damage', 'Equipment Failure'], severity: 'moderate' as Severity, status: 'filed_faa' as ReportStatus, drone: 'SKW-US-T5N8R1', narrative: 'ESC failure on motor 3 causing forced landing on vehicle roof. Vehicle sustained roof dent and paint damage.', injuries: 0, damage: '$1,200', filedFaa: true, filedAsrs: false, deadline: '2026-03-22', faaConfirmation: 'FAA-DZ-2026-88234' },
  { id: 'SKW-SR-2026-0038', date: '2026-03-10', type: 'voluntary' as ReportType, categories: ['Airspace Violation'], severity: 'minor' as Severity, status: 'closed' as ReportStatus, drone: 'SKW-US-A7B3X9', narrative: 'Momentary altitude exceedance of 15ft above LAANC ceiling due to wind gust. Immediately corrected. No other traffic.', injuries: 0, damage: '$0', filedFaa: false, filedAsrs: true, deadline: null },
  { id: 'SKW-SR-2026-0037', date: '2026-03-08', type: 'voluntary' as ReportType, categories: ['Battery Emergency'], severity: 'minor' as Severity, status: 'closed' as ReportStatus, drone: 'SKW-US-K9M2P4', narrative: 'Battery cell imbalance warning triggered RTH at 42% remaining. Battery swelled after landing. Removed from service.', injuries: 0, damage: '$0', filedFaa: false, filedAsrs: false, deadline: null, lessonsLearned: 'Implemented pre-flight battery cell voltage check. Added battery cycle tracking with 200-cycle retirement policy.' },
  { id: 'SKW-SR-2026-0036', date: '2026-03-05', type: 'voluntary' as ReportType, categories: ['Remote ID Failure'], severity: 'minor' as Severity, status: 'closed' as ReportStatus, drone: 'SKW-US-W3J6F2', narrative: 'Remote ID module stopped broadcasting mid-flight. Firmware bug identified. Landed immediately per SOP.', injuries: 0, damage: '$0', filedFaa: false, filedAsrs: false, deadline: null, lessonsLearned: 'Updated RID module firmware across entire fleet. Added pre-flight RID broadcast verification to checklist.' },
  { id: 'SKW-SR-2026-0035', date: '2026-02-28', type: 'voluntary' as ReportType, categories: ['Interference', 'Geofence Breach'], severity: 'moderate' as Severity, status: 'under_review' as ReportStatus, drone: 'SKW-US-T5N8R1', narrative: 'RF interference caused GPS drift resulting in geofence breach by 50m. Failsafe activated. Investigating interference source.', injuries: 0, damage: '$0', filedFaa: false, filedAsrs: true, deadline: null },
];

const mockB4UFlyHistory = [
  { date: '2026-03-20 09:15', lat: '34.0522', lng: '-118.2437', alt: '300', level: 'green' as B4UFlyLevel, result: 'Clear to fly — Class G, no restrictions' },
  { date: '2026-03-19 14:30', lat: '40.6413', lng: '-73.7781', alt: '200', level: 'red' as B4UFlyLevel, result: 'DENIED — Class B (JFK), active TFR' },
  { date: '2026-03-18 11:00', lat: '37.6213', lng: '-122.3790', alt: '100', level: 'yellow' as B4UFlyLevel, result: 'Caution — Class C (SFO), LAANC required' },
  { date: '2026-03-17 08:45', lat: '34.0195', lng: '-118.4912', alt: '400', level: 'green' as B4UFlyLevel, result: 'Clear to fly — Class G, no restrictions' },
];

const mockRIDFleet = [
  { ddid: 'SKW-US-A7B3X9', model: 'DJI Mavic 3 Enterprise', method: 'Standard RID', serialValid: true, broadcastFreq: 1.0, posAccuracy: 15, altAccuracy: 45, latency: 0.8, status: 'compliant' as RIDStatus, lastChecked: '2026-03-20', moduleManufacturer: 'DJI', moduleModel: 'Built-in', firmware: 'v04.02.0600', issues: [] },
  { ddid: 'SKW-US-K9M2P4', model: 'DJI Matrice 350 RTK', method: 'Standard RID', serialValid: true, broadcastFreq: 1.0, posAccuracy: 10, altAccuracy: 30, latency: 0.6, status: 'compliant' as RIDStatus, lastChecked: '2026-03-20', moduleManufacturer: 'DJI', moduleModel: 'Built-in', firmware: 'v09.01.0200', issues: [] },
  { ddid: 'SKW-US-T5N8R1', model: 'Autel EVO II Pro V3', method: 'Broadcast Module', serialValid: true, broadcastFreq: 0.8, posAccuracy: 25, altAccuracy: 60, latency: 1.2, status: 'issues' as RIDStatus, lastChecked: '2026-03-19', moduleManufacturer: 'Dronetag', moduleModel: 'DT-B1', firmware: 'v2.3.1', issues: ['Position accuracy exceeds 50ft limit (25ft actual — check GPS antenna)', 'Broadcast frequency below 1 Hz minimum'] },
  { ddid: 'SKW-US-W3J6F2', model: 'Skydio X10', method: 'Standard RID', serialValid: true, broadcastFreq: 1.0, posAccuracy: 12, altAccuracy: 35, latency: 0.7, status: 'compliant' as RIDStatus, lastChecked: '2026-03-20', moduleManufacturer: 'Skydio', moduleModel: 'Built-in', firmware: 'v35.2.44', issues: [] },
  { ddid: 'SKW-US-B8L4H7', model: 'DJI Mavic 3T Thermal', method: 'None', serialValid: false, broadcastFreq: 0, posAccuracy: 0, altAccuracy: 0, latency: 0, status: 'non_compliant' as RIDStatus, lastChecked: '2026-03-18', moduleManufacturer: '—', moduleModel: '—', firmware: '—', issues: ['No Remote ID equipment installed', 'Serial number not registered with FAA', 'Cannot operate outside FRIA without RID'] },
  { ddid: 'SKW-US-C2D9V5', model: 'DJI Phantom 4 RTK', method: 'Unknown', serialValid: false, broadcastFreq: 0, posAccuracy: 0, altAccuracy: 0, latency: 0, status: 'unchecked' as RIDStatus, lastChecked: '—', moduleManufacturer: '—', moduleModel: '—', firmware: '—', issues: [] },
];

const incidentCategories = [
  'Near Midair Collision', 'Airspace Violation', 'Loss of Control', 'Equipment Failure',
  'Battery Emergency', 'Flyaway', 'Crash', 'Injury to Person', 'Property Damage',
  'Wildlife Strike', 'Interference', 'Remote ID Failure', 'Geofence Breach', 'Altitude Violation', 'Other',
];

const contributingFactors = [
  'Pilot Error', 'Equipment Malfunction', 'Software Error', 'Weather', 'GPS Interference',
  'RF Interference', 'Battery Failure', 'Communication Loss', 'Regulatory Confusion',
  'Inadequate Pre-flight', 'Third Party Action', 'Bird/Wildlife', 'Other',
];

const operationalContexts = [
  'Commercial', 'Aerial Photography', 'Survey/Mapping', 'Agriculture', 'Construction',
  'Delivery', 'Emergency Response', 'Inspection', 'Law Enforcement', 'Training',
  'Research', 'Real Estate', 'Utilities', 'Telecommunications', 'Other',
];

const wizardSteps = ['Classification', 'Event Details', 'Aircraft & Operator', 'What Happened', 'Filing & Review'];

const part89Sections = [
  { id: '89.305', title: '89.305 — Standard Remote ID Message Elements', description: 'UAS must broadcast: UAS ID (serial number or session ID), latitude/longitude/geometric altitude of UA, latitude/longitude/geometric altitude of control station, time mark, emergency status indicator, and UA velocity.' },
  { id: '89.310', title: '89.310 — Performance Requirements', description: 'Broadcast frequency: minimum 1 message per second. Position accuracy: within 100 feet (30 meters). Altitude accuracy: within 150 feet (45 meters). Latency: no more than 1 second from measurement to broadcast.' },
  { id: '89.315', title: '89.315 — Broadcast Module Requirements', description: 'Broadcast modules must meet the same message element and performance requirements as standard RID. Must be designed to not be easily modified. Must be listed on an FAA-accepted declaration of compliance.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function SafetyReportingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('reports');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [reportSearch, setReportSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');

  // Wizard state
  const [reportType, setReportType] = useState<ReportType>('voluntary');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [severity, setSeverity] = useState<Severity>('none');
  const [confidential, setConfidential] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [otherAircraft, setOtherAircraft] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [injuries, setInjuries] = useState<{ type: string; severity: string; ais: string; desc: string; medical: boolean; loc: boolean; hospital: boolean }[]>([]);
  const [damages, setDamages] = useState<{ type: string; desc: string; amount: string; notified: boolean; insurance: boolean }[]>([]);

  // B4UFLY state
  const [b4uLat, setB4uLat] = useState('34.0522');
  const [b4uLng, setB4uLng] = useState('-118.2437');
  const [b4uAlt, setB4uAlt] = useState('300');
  const [b4uRadius, setB4uRadius] = useState('1');
  const [b4uChecked, setB4uChecked] = useState(false);

  // RID state
  const [expandedRID, setExpandedRID] = useState<string | null>(null);
  const [expandedPart89, setExpandedPart89] = useState<string | null>(null);

  // Analytics state
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'30d' | '90d' | '1y' | 'all'>('90d');

  // Computed
  const overdueCount = mockReports.filter((r) => r.status === 'overdue').length;
  const mandatoryOnTime = mockReports.filter((r) => r.type === 'mandatory' && r.status !== 'overdue').length;
  const mandatoryTotal = mockReports.filter((r) => r.type === 'mandatory').length;
  const openInvestigations = mockReports.filter((r) => r.status === 'under_review').length;
  const hasMandatoryTrigger = injuries.some((inj) => parseInt(inj.ais) >= 3) || damages.some((d) => parseFloat(d.amount.replace(/[^0-9.]/g, '')) > 500);

  const filteredReports = mockReports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (reportSearch) {
      const q = reportSearch.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.drone.toLowerCase().includes(q) || r.categories.some((c) => c.toLowerCase().includes(q));
    }
    return true;
  });

  const toggleCategory = (cat: string) => setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const toggleFactor = (f: string) => setSelectedFactors((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const ridCompliant = mockRIDFleet.filter((d) => d.status === 'compliant').length;
  const ridTotal = mockRIDFleet.length;
  const ridRate = Math.round((ridCompliant / ridTotal) * 100);

  // ─── Tab: Reports ─────────────────────────────────────────────────────────
  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Alert banners */}
      {overdueCount > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">You have {overdueCount} overdue mandatory safety report{overdueCount > 1 ? 's' : ''}. FAA filing deadline passed. File immediately.</p>
            <p className="text-xs text-red-600 mt-1">Failure to file mandatory reports may result in enforcement action under 14 CFR 107.9.</p>
          </div>
        </div>
      )}
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
        <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-amber-800">1 mandatory report due in 3 days (by March 23, 2026)</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports (2026)', value: mockReports.length, icon: FileText, color: 'bg-blue-50 text-blue-600' },
          { label: 'Mandatory On Time', value: mandatoryTotal > 0 ? `${Math.round((mandatoryOnTime / mandatoryTotal) * 100)}%` : '—', icon: CheckCircle, color: mandatoryOnTime === mandatoryTotal ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600' },
          { label: 'Open Investigations', value: openInvestigations, icon: Search, color: 'bg-amber-50 text-amber-600' },
          { label: 'Avg Days to Close', value: '4.2', icon: Clock, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* File report button */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => { setShowWizard(true); setWizardStep(1); setReportType('voluntary'); setSelectedCategories([]); setSeverity('none'); setNarrative(''); setInjuries([]); setDamages([]); setSelectedFactors([]); setOtherAircraft(false); setConfidential(false); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          File Safety Report
        </button>
      </div>

      {/* ─── Wizard ──────────────────────────────────────────────────────── */}
      {showWizard && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">File Safety Report</h2>
            <button onClick={() => setShowWizard(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {wizardSteps.map((label, i) => {
              const step = (i + 1) as WizardStep;
              const isActive = wizardStep === step;
              const isDone = wizardStep > step;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={clsx('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0', isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400')}>
                    {isDone ? <CheckCircle size={14} /> : step}
                  </div>
                  <span className={clsx('text-xs font-medium hidden lg:block', isActive ? 'text-gray-900' : 'text-gray-400')}>{label}</span>
                  {i < wizardSteps.length - 1 && <div className="flex-1 h-px bg-gray-200 hidden lg:block" />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Classification */}
          {wizardStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['mandatory', 'voluntary'] as const).map((t) => (
                    <label key={t} className={clsx('flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-colors', reportType === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50')}>
                      <input type="radio" name="reportType" checked={reportType === t} onChange={() => setReportType(t)} className="mt-1 h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t === 'mandatory' ? 'Mandatory' : 'Voluntary'}</p>
                        <p className="text-xs text-gray-500 mt-1">{t === 'mandatory' ? 'Required within 10 days for: serious injury (AIS 3+), loss of consciousness, property damage >$500' : 'NASA ASRS-style reporting for near-misses, anomalies, and safety concerns'}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-2 rounded-lg bg-gray-50 border p-3 flex items-start gap-2">
                  <Info size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">Not sure? Enter incident details and we'll determine if mandatory filing is required.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incident Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {incidentCategories.map((cat) => (
                    <label key={cat} className={clsx('flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-xs transition-colors', selectedCategories.includes(cat) ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                      <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} className="h-3.5 w-3.5 rounded text-blue-600" />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(severityConfig) as Severity[]).map((s) => {
                    const cfg = severityConfig[s];
                    return (
                      <button key={s} onClick={() => setSeverity(s)} className={clsx('rounded-full px-3 py-1.5 text-xs font-medium border transition-colors', severity === s ? `${cfg.bg} ${cfg.text} border-current` : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={confidential} onChange={(e) => setConfidential(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                <span className="text-sm text-gray-700">Request confidential handling (ASRS protection)</span>
              </label>
            </div>
          )}

          {/* Step 2: Event Details */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" defaultValue="2026-03-20" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time (Local)</label>
                  <input type="time" defaultValue="14:30" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>PST (UTC-8)</option><option>MST (UTC-7)</option><option>CST (UTC-6)</option><option>EST (UTC-5)</option><option>UTC</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input type="text" defaultValue="34.0522" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input type="text" defaultValue="-118.2437" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Airport</label>
                  <input type="text" placeholder="e.g. KLAX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Near (Description)</label>
                <input type="text" placeholder="e.g. 2 miles NE of downtown Los Angeles" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Airspace Class</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-xs">
                  <option>Class G (Uncontrolled)</option><option>Class E (Controlled)</option><option>Class D (Tower)</option><option>Class C (Approach)</option><option>Class B (Terminal)</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wind Speed / Direction</label>
                  <input type="text" placeholder="e.g. 12 kts from 270" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <input type="text" placeholder="e.g. 10 SM" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Light Conditions</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Day</option><option>Twilight</option><option>Night</option>
                  </select>
                </div>
              </div>
              {/* Map placeholder */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-48 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin size={32} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Event Location Map</p>
                  <p className="text-xs">Pin will be placed at entered coordinates</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Aircraft & Operator */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Drone from Fleet</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>-- Select drone --</option>
                  <option>SKW-US-A7B3X9 — DJI Mavic 3 Enterprise</option>
                  <option>SKW-US-K9M2P4 — DJI Matrice 350 RTK</option>
                  <option>SKW-US-T5N8R1 — Autel EVO II Pro V3</option>
                  <option>SKW-US-W3J6F2 — Skydio X10</option>
                </select>
              </div>
              <p className="text-xs text-gray-400 text-center">or enter details manually</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Make</label><input type="text" placeholder="e.g. DJI" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Model</label><input type="text" placeholder="e.g. Mavic 3 Enterprise" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label><input type="text" placeholder="Manufacturer serial" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (g)</label>
                  <input type="number" placeholder="e.g. 895" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Category 1 (&lt;0.55 lbs)</option><option>Category 2 (0.55-55 lbs)</option><option>Category 3 (55-99 lbs)</option><option>Category 4 (99+ lbs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UAS Type</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Multirotor</option><option>Fixed Wing</option><option>VTOL</option><option>Helicopter</option><option>Airship</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remote ID Status at Time</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Active — Standard RID</option><option>Active — Broadcast Module</option><option>Inactive — FRIA</option><option>Inactive — None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Part 107</option><option>Part 107 Waiver</option><option>Recreational (44809)</option><option>Public Safety (COA)</option><option>Government</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link to Flight Plan (optional)</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>-- None --</option>
                    <option>SKW-FP-2026-000012 — Inspection</option>
                    <option>SKW-FP-2026-000011 — Survey</option>
                    <option>SKW-FP-2026-000010 — Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link to LAANC Auth (optional)</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>-- None --</option>
                    <option>LAANC-2026-00045 — SFO Class C</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operational Context</label>
                <div className="flex flex-wrap gap-2">
                  {operationalContexts.map((ctx) => (
                    <button key={ctx} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors">{ctx}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: What Happened */}
          {wizardStep === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Narrative</label>
                <textarea rows={5} value={narrative} onChange={(e) => setNarrative(e.target.value)} placeholder="Describe the event in detail. Include what happened before, during, and after the incident..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <div className="flex justify-between mt-1">
                  <p className={clsx('text-xs', narrative.length < 100 && reportType === 'mandatory' ? 'text-red-500' : 'text-gray-400')}>
                    {reportType === 'mandatory' && narrative.length < 100 ? `Minimum 100 characters for mandatory reports (${narrative.length}/100)` : `${narrative.length} characters`}
                  </p>
                </div>
              </div>

              {/* Other aircraft */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={otherAircraft} onChange={(e) => setOtherAircraft(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
                <span className="text-sm text-gray-700">Other aircraft involved?</span>
              </label>
              {otherAircraft && (
                <div className="rounded-lg border bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Aircraft Type</label><input type="text" placeholder="e.g. Helicopter, Fixed-wing" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Altitude (ft AGL)</label><input type="text" placeholder="e.g. 500" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Closest Approach (ft horiz)</label><input type="text" placeholder="e.g. 200" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Closest Approach (ft vert)</label><input type="text" placeholder="e.g. 100" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Registration</label><input type="text" placeholder="e.g. N12345" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /></div>
                  <label className="flex items-center gap-2 cursor-pointer self-end pb-1.5"><input type="checkbox" className="h-3.5 w-3.5 rounded text-blue-600" /><span className="text-xs text-gray-600">ATC contact made?</span></label>
                </div>
              )}

              {/* Injuries */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Injuries</label>
                  <button onClick={() => setInjuries([...injuries, { type: 'Bystander', severity: 'Minor', ais: '1', desc: '', medical: false, loc: false, hospital: false }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Injury</button>
                </div>
                {injuries.map((inj, idx) => (
                  <div key={idx} className="rounded-lg border bg-gray-50 p-3 mb-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Person Type</label><select value={inj.type} onChange={(e) => { const n = [...injuries]; n[idx].type = e.target.value; setInjuries(n); }} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"><option>Pilot</option><option>Bystander</option><option>Crew</option><option>Other</option></select></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Severity</label><select value={inj.severity} onChange={(e) => { const n = [...injuries]; n[idx].severity = e.target.value; setInjuries(n); }} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"><option>Minor</option><option>Moderate</option><option>Serious</option><option>Critical</option><option>Fatal</option></select></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">AIS Level</label><select value={inj.ais} onChange={(e) => { const n = [...injuries]; n[idx].ais = e.target.value; setInjuries(n); }} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"><option value="1">1 — Minor</option><option value="2">2 — Moderate</option><option value="3">3 — Serious</option><option value="4">4 — Severe</option><option value="5">5 — Critical</option><option value="6">6 — Unsurvivable</option></select></div>
                    <div className="flex items-end"><button onClick={() => setInjuries(injuries.filter((_, i) => i !== idx))} className="text-xs text-red-500 hover:text-red-700">Remove</button></div>
                    <div className="col-span-2 md:col-span-4"><label className="block text-xs font-medium text-gray-600 mb-1">Description</label><input type="text" value={inj.desc} onChange={(e) => { const n = [...injuries]; n[idx].desc = e.target.value; setInjuries(n); }} placeholder="Describe injury" className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs" /></div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={inj.medical} onChange={(e) => { const n = [...injuries]; n[idx].medical = e.target.checked; setInjuries(n); }} className="h-3.5 w-3.5 rounded" />Medical attention?</label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={inj.loc} onChange={(e) => { const n = [...injuries]; n[idx].loc = e.target.checked; setInjuries(n); }} className="h-3.5 w-3.5 rounded" />Loss of consciousness?</label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={inj.hospital} onChange={(e) => { const n = [...injuries]; n[idx].hospital = e.target.checked; setInjuries(n); }} className="h-3.5 w-3.5 rounded" />Hospitalized?</label>
                  </div>
                ))}
              </div>

              {/* Property Damage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Property Damage</label>
                  <button onClick={() => setDamages([...damages, { type: 'Structure', desc: '', amount: '', notified: false, insurance: false }])} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Damage</button>
                </div>
                {damages.map((dmg, idx) => (
                  <div key={idx} className="rounded-lg border bg-gray-50 p-3 mb-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label><select value={dmg.type} onChange={(e) => { const n = [...damages]; n[idx].type = e.target.value; setDamages(n); }} className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"><option>Structure</option><option>Vehicle</option><option>Aircraft (drone)</option><option>Utility</option><option>Other</option></select></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Estimated Damage ($)</label><input type="text" value={dmg.amount} onChange={(e) => { const n = [...damages]; n[idx].amount = e.target.value; setDamages(n); }} placeholder="e.g. 750" className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs" /></div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 self-end pb-1.5"><input type="checkbox" checked={dmg.notified} onChange={(e) => { const n = [...damages]; n[idx].notified = e.target.checked; setDamages(n); }} className="h-3.5 w-3.5 rounded" />Owner notified?</label>
                    <div className="flex items-end gap-3 pb-1.5"><label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={dmg.insurance} onChange={(e) => { const n = [...damages]; n[idx].insurance = e.target.checked; setDamages(n); }} className="h-3.5 w-3.5 rounded" />Insurance claim?</label><button onClick={() => setDamages(damages.filter((_, i) => i !== idx))} className="text-xs text-red-500 hover:text-red-700 ml-auto">Remove</button></div>
                    <div className="col-span-2 md:col-span-4"><label className="block text-xs font-medium text-gray-600 mb-1">Description</label><input type="text" value={dmg.desc} onChange={(e) => { const n = [...damages]; n[idx].desc = e.target.value; setDamages(n); }} placeholder="Describe damage" className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs" /></div>
                  </div>
                ))}
              </div>

              {/* Mandatory trigger banner */}
              {hasMandatoryTrigger && (
                <div className="rounded-lg border-2 border-red-400 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">MANDATORY REPORT TRIGGERED</p>
                    <p className="text-xs text-red-700 mt-1">
                      {injuries.some((inj) => parseInt(inj.ais) >= 3) && 'Serious injury detected (AIS 3+). '}
                      {damages.some((d) => parseFloat(d.amount.replace(/[^0-9.]/g, '')) > 500) && 'Property damage exceeds $500. '}
                      FAA filing required within 10 calendar days.
                    </p>
                    <p className="text-xs font-semibold text-red-800 mt-1">Filing deadline: March 30, 2026</p>
                  </div>
                </div>
              )}

              {/* Contributing Factors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contributing Factors</label>
                <div className="flex flex-wrap gap-2">
                  {contributingFactors.map((f) => (
                    <button key={f} onClick={() => toggleFactor(f)} className={clsx('rounded-full border px-3 py-1 text-xs transition-colors', selectedFactors.includes(f) ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corrective Actions Taken</label>
                <textarea rows={2} placeholder="Describe immediate actions taken after the event..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preventive Recommendations</label>
                <textarea rows={2} placeholder="Recommendations to prevent recurrence..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          )}

          {/* Step 5: Filing & Review */}
          {wizardStep === 5 && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Report Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-gray-500">Type:</span> <span className={clsx('font-medium', reportType === 'mandatory' ? 'text-red-700' : 'text-blue-700')}>{reportType === 'mandatory' ? 'Mandatory' : 'Voluntary'}</span></div>
                  <div><span className="text-gray-500">Severity:</span> <span className="font-medium text-gray-900">{severityConfig[severity].label}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Categories:</span> <span className="font-medium text-gray-900">{selectedCategories.join(', ') || '—'}</span></div>
                  <div><span className="text-gray-500">Injuries:</span> <span className="font-medium text-gray-900">{injuries.length}</span></div>
                  <div><span className="text-gray-500">Property Damage Items:</span> <span className="font-medium text-gray-900">{damages.length}</span></div>
                  <div><span className="text-gray-500">Confidential:</span> <span className="font-medium text-gray-900">{confidential ? 'Yes' : 'No'}</span></div>
                  <div><span className="text-gray-500">Contributing Factors:</span> <span className="font-medium text-gray-900">{selectedFactors.join(', ') || '—'}</span></div>
                </div>
              </div>

              {/* FAA Filing */}
              <div className="rounded-lg border-2 border-red-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={18} className="text-red-600" />
                  <h3 className="text-sm font-semibold text-gray-900">FAA Filing (14 CFR 107.9)</h3>
                </div>
                {reportType === 'mandatory' ? (
                  <div>
                    <p className="text-xs text-red-700 font-medium mb-2">This report MUST be filed with the FAA within 10 calendar days.</p>
                    <p className="text-sm font-bold text-red-800 mb-3">Deadline: March 30, 2026</p>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                        <ExternalLink size={14} />
                        File with FAA DroneZone
                      </button>
                      <div className="flex-1 max-w-xs">
                        <input type="text" placeholder="FAA Confirmation # (after filing)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">FAA filing not required for voluntary reports. You may still file at your discretion.</p>
                )}
              </div>

              {/* NASA ASRS Filing */}
              <div className="rounded-lg border-2 border-blue-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">NASA ASRS Filing</h3>
                </div>
                <p className="text-xs text-gray-600 mb-3">Voluntary ASRS filing is recommended for all safety events.</p>
                <div className="rounded-lg bg-gray-50 border p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">ASRS Protection Eligibility:</p>
                  <div className="space-y-1.5">
                    {[
                      { check: true, label: 'Violation was inadvertent' },
                      { check: true, label: 'No criminal offense' },
                      { check: true, label: 'Not an accident (14 CFR definition)' },
                      { check: true, label: 'Pilot competency not in question' },
                      { check: true, label: 'No prior violations within 5 years' },
                      { check: true, label: 'Filed within 10 days' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="text-xs text-gray-700">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 rounded bg-green-50 border border-green-200 px-3 py-1.5">
                    <p className="text-xs font-semibold text-green-700">You are eligible for ASRS enforcement protection</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <ExternalLink size={14} />
                  File with NASA ASRS
                </button>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">Drop files here or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">Photos, Videos, Flight Logs, Telemetry Data, Witness Statements</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {wizardStep < 5 ? (
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => wizardStep > 1 && setWizardStep((wizardStep - 1) as WizardStep)} disabled={wizardStep === 1} className={clsx('flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors', wizardStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border border-gray-300')}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setWizardStep((wizardStep + 1) as WizardStep)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setWizardStep(4)} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setShowWizard(false)} className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                <CheckCircle size={16} /> Submit Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} placeholder="Search reports..." className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'mandatory', 'voluntary'] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={clsx('rounded-lg px-3 py-2 text-xs font-medium border transition-colors', typeFilter === t ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')}>
              {t === 'all' ? 'All Types' : t === 'mandatory' ? 'Mandatory' : 'Voluntary'}
            </button>
          ))}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 focus:ring-2 focus:ring-blue-500">
            <option value="all">All Statuses</option>
            {Object.entries(reportStatusConfig).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Report #</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Categories</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Severity</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Drone</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReports.map((report) => {
                const sCfg = severityConfig[report.severity];
                const stCfg = reportStatusConfig[report.status];
                const isExpanded = expandedReport === report.id;
                return (
                  <Fragment key={report.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedReport(isExpanded ? null : report.id)}>
                      <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900">{report.id}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{report.date}</td>
                      <td className="px-5 py-3">
                        <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', report.type === 'mandatory' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700')}>
                          {report.type === 'mandatory' ? 'Mandatory' : 'Voluntary'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600 max-w-[200px] truncate">{report.categories.join(', ')}</td>
                      <td className="px-5 py-3">
                        <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', sCfg.bg, sCfg.text)}>{sCfg.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={clsx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', stCfg.bg, stCfg.text, stCfg.pulse && 'animate-pulse')}>{stCfg.label}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{report.drone}</td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-gray-400 hover:text-blue-600"><Eye size={16} /></button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="bg-gray-50 px-5 py-4">
                          <div className="space-y-2 text-xs">
                            <p className="text-gray-700"><span className="font-medium text-gray-900">Narrative:</span> {report.narrative}</p>
                            <div className="flex gap-6">
                              <p><span className="font-medium text-gray-900">Injuries:</span> {report.injuries}</p>
                              <p><span className="font-medium text-gray-900">Damage:</span> {report.damage}</p>
                              <p><span className="font-medium text-gray-900">FAA Filed:</span> {report.filedFaa ? 'Yes' : 'No'}</p>
                              <p><span className="font-medium text-gray-900">ASRS Filed:</span> {report.filedAsrs ? 'Yes' : 'No'}</p>
                              {report.deadline && <p><span className="font-medium text-gray-900">Deadline:</span> {report.deadline}</p>}
                              {(report as any).faaConfirmation && <p><span className="font-medium text-gray-900">FAA #:</span> {(report as any).faaConfirmation}</p>}
                            </div>
                            {(report as any).lessonsLearned && (
                              <p className="text-gray-700"><span className="font-medium text-green-700">Lessons Learned:</span> {(report as any).lessonsLearned}</p>
                            )}
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
        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileText size={32} className="mb-2" />
            <p className="text-sm">No reports match your filters</p>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Tab: B4UFLY ──────────────────────────────────────────────────────────
  const renderB4UFlyTab = () => (
    <div className="space-y-6">
      {/* Input form */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Navigation size={20} className="text-blue-600" /> Pre-Flight Airspace Check</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label><input type="text" value={b4uLat} onChange={(e) => setB4uLat(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label><input type="text" value={b4uLng} onChange={(e) => setB4uLng(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Altitude (ft AGL)</label><input type="text" value={b4uAlt} onChange={(e) => setB4uAlt(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Check Radius (NM)</label><input type="text" value={b4uRadius} onChange={(e) => setB4uRadius(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" /></div>
        </div>
        <button onClick={() => setB4uChecked(true)} className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Search size={16} /> Check Airspace
        </button>
      </div>

      {/* Check Results */}
      {b4uChecked && (
        <div className="space-y-4">
          {/* Overall advisory */}
          <div className="rounded-xl border-2 border-green-400 bg-green-50 p-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100"><CheckCircle size={28} className="text-green-600" /></div>
            <div>
              <p className="text-lg font-bold text-green-800">GREEN — Clear to Fly</p>
              <p className="text-sm text-green-700">You are clear to fly. Class G airspace, no active restrictions at this location.</p>
            </div>
          </div>

          {/* Advisory cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Advisories</h3>
            {[
              { source: 'Airspace', level: 'green' as B4UFlyLevel, title: 'Class G Airspace', desc: 'Uncontrolled airspace. No ATC authorization required below 400 ft AGL.', action: 'No action required' },
              { source: 'NOTAM', level: 'yellow' as B4UFlyLevel, title: 'NOTAM 06/234 — Construction Crane', desc: 'Construction crane at 34.0540 / -118.2400, max height 450 ft AGL. Active until April 15, 2026.', action: 'Maintain clearance from crane location' },
              { source: 'UASFM', level: 'green' as B4UFlyLevel, title: 'UAS Facility Map — No ceiling restriction', desc: 'This grid cell has no UASFM altitude ceiling. Standard 400 ft AGL limit applies.', action: 'No action required' },
            ].map((adv, i) => (
              <div key={i} className="rounded-lg border bg-white p-4 shadow-sm flex items-start gap-3">
                <div className={clsx('mt-0.5 h-3 w-3 rounded-full flex-shrink-0', adv.level === 'green' ? 'bg-green-500' : adv.level === 'yellow' ? 'bg-yellow-500' : 'bg-red-500')} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{adv.source}</span>
                    <span className="text-sm font-medium text-gray-900">{adv.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{adv.desc}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">{adv.action}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Nearest Airport */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Plane size={16} className="text-gray-600" /> Nearest Airport</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
              <div><p className="text-gray-500">Airport</p><p className="font-semibold text-gray-900">Los Angeles Intl</p></div>
              <div><p className="text-gray-500">ICAO</p><p className="font-mono font-bold text-gray-900">KLAX</p></div>
              <div><p className="text-gray-500">Distance</p><p className="font-medium text-gray-700">8.2 NM</p></div>
              <div><p className="text-gray-500">Tower Freq</p><p className="font-medium text-gray-700">133.900</p></div>
              <div><p className="text-gray-500">LAANC Enabled</p><p className="font-medium text-green-600">Yes</p></div>
              <div><p className="text-gray-500">Airspace Class</p><p className="font-medium text-gray-700">Class B</p></div>
            </div>
          </div>

          {/* UASFM Grid */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Target size={16} className="text-gray-600" /> UASFM Grid Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
              <div><p className="text-gray-500">Grid ID</p><p className="font-mono font-bold text-gray-900">UASFM-LAX-G47</p></div>
              <div><p className="text-gray-500">Max Altitude</p><p className="font-medium text-gray-700">400 ft AGL</p></div>
              <div><p className="text-gray-500">LAANC Ready</p><p className="font-medium text-green-600">Yes</p></div>
              <div><p className="text-gray-500">Chart Cycle</p><p className="font-medium text-gray-700">2026-02-27 to 2026-04-23</p></div>
              <div><p className="text-gray-500">Facility</p><p className="font-medium text-gray-700">LAX TRACON (F11)</p></div>
            </div>
          </div>

          {/* Active TFRs */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4"><h3 className="text-sm font-semibold text-gray-900">Active TFRs in Area</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">
                  <th className="px-5 py-3 text-left font-medium text-gray-500">NOTAM #</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Effective</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Expires</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Ceiling / Floor</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Description</th>
                </tr></thead>
                <tbody className="divide-y text-xs">
                  <tr className="text-gray-500 italic"><td colSpan={6} className="px-5 py-4 text-center">No active TFRs in checked area</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Check History */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4"><h3 className="text-sm font-semibold text-gray-900">Check History</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Location</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Altitude</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Level</th>
              <th className="px-5 py-3 text-left font-medium text-gray-500">Result</th>
            </tr></thead>
            <tbody className="divide-y">
              {mockB4UFlyHistory.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-xs text-gray-600">{h.date}</td>
                  <td className="px-5 py-3 text-xs font-mono text-gray-600">{h.lat}, {h.lng}</td>
                  <td className="px-5 py-3 text-xs text-gray-600">{h.alt} ft</td>
                  <td className="px-5 py-3">
                    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', h.level === 'green' ? 'bg-green-50 text-green-700' : h.level === 'yellow' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700')}>
                      <span className={clsx('h-2 w-2 rounded-full', h.level === 'green' ? 'bg-green-500' : h.level === 'yellow' ? 'bg-yellow-500' : 'bg-red-500')} />
                      {h.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600">{h.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ─── Tab: Remote ID ───────────────────────────────────────────────────────
  const renderRemoteIDTab = () => (
    <div className="space-y-6">
      {/* Overall compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-2">Fleet RID Compliance</p>
          <p className={clsx('text-4xl font-bold', ridRate >= 80 ? 'text-green-600' : ridRate >= 50 ? 'text-amber-600' : 'text-red-600')}>{ridRate}%</p>
          <div className="h-2.5 w-full rounded-full bg-gray-200 mt-3">
            <div className={clsx('h-2.5 rounded-full', ridRate >= 80 ? 'bg-green-500' : ridRate >= 50 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${ridRate}%` }} />
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">Compliance Breakdown</p>
          <div className="space-y-2">
            {[
              { label: 'Compliant', count: mockRIDFleet.filter((d) => d.status === 'compliant').length, color: 'bg-green-500' },
              { label: 'Issues', count: mockRIDFleet.filter((d) => d.status === 'issues').length, color: 'bg-amber-500' },
              { label: 'Non-Compliant', count: mockRIDFleet.filter((d) => d.status === 'non_compliant').length, color: 'bg-red-500' },
              { label: 'Unchecked', count: mockRIDFleet.filter((d) => d.status === 'unchecked').length, color: 'bg-gray-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={clsx('h-3 w-3 rounded-full', item.color)} />
                <span className="text-xs text-gray-600 flex-1">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm flex flex-col items-center justify-center">
          {/* Simple donut visual */}
          <div className="relative h-28 w-28">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${ridRate} ${100 - ridRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-900">{ridCompliant}/{ridTotal}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Drones Compliant</p>
        </div>
      </div>

      {/* Per-Drone Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Per-Drone RID Compliance</h2>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><RefreshCw size={14} /> Run All Checks</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">DDID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Model</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Method</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Serial Valid</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Freq (Hz)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Pos Acc (ft)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Alt Acc (ft)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Latency (s)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Last Checked</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {mockRIDFleet.map((drone) => {
                const cfg = ridStatusConfig[drone.status];
                const isExpanded = expandedRID === drone.ddid;
                return (
                  <Fragment key={drone.ddid}>
                    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedRID(isExpanded ? null : drone.ddid)}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900">{drone.ddid}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{drone.model}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{drone.method}</td>
                      <td className="px-4 py-3">{drone.serialValid ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{drone.broadcastFreq || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{drone.posAccuracy || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{drone.altAccuracy || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{drone.latency || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                          {cfg.icon === 'check' && <CheckCircle size={12} />}
                          {cfg.icon === 'x' && <XCircle size={12} />}
                          {cfg.icon === 'warn' && <AlertTriangle size={12} />}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{drone.lastChecked}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">Run Check</button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={11} className="bg-gray-50 px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2">Module Details</h4>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div><p className="text-gray-500">Manufacturer</p><p className="font-medium">{drone.moduleManufacturer}</p></div>
                                <div><p className="text-gray-500">Model</p><p className="font-medium">{drone.moduleModel}</p></div>
                                <div><p className="text-gray-500">Firmware</p><p className="font-mono font-medium">{drone.firmware}</p></div>
                              </div>
                            </div>
                            {drone.issues.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-red-700 mb-2">Compliance Issues</h4>
                                <ul className="space-y-1">
                                  {drone.issues.map((issue, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                                      <XCircle size={12} className="flex-shrink-0 mt-0.5" />
                                      {issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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
      </div>

      {/* Part 89 Reference */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen size={18} /> 14 CFR Part 89 Requirements Reference</h2></div>
        <div className="divide-y">
          {part89Sections.map((sec) => (
            <div key={sec.id}>
              <button onClick={() => setExpandedPart89(expandedPart89 === sec.id ? null : sec.id)} className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-900">{sec.title}</span>
                {expandedPart89 === sec.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {expandedPart89 === sec.id && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Tab: Analytics ───────────────────────────────────────────────────────
  const renderAnalyticsTab = () => {
    const monthlyData = [
      { month: 'Oct', none: 1, minor: 2, moderate: 0, serious: 0, critical: 0 },
      { month: 'Nov', none: 0, minor: 1, moderate: 1, serious: 0, critical: 0 },
      { month: 'Dec', none: 1, minor: 3, moderate: 0, serious: 1, critical: 0 },
      { month: 'Jan', none: 0, minor: 2, moderate: 1, serious: 0, critical: 0 },
      { month: 'Feb', none: 1, minor: 1, moderate: 1, serious: 0, critical: 0 },
      { month: 'Mar', none: 0, minor: 3, moderate: 2, serious: 1, critical: 1 },
    ];
    const categoryBreakdown = [
      { cat: 'Battery Emergency', count: 5 }, { cat: 'Equipment Failure', count: 4 }, { cat: 'Near Midair Collision', count: 3 },
      { cat: 'Airspace Violation', count: 3 }, { cat: 'Loss of Control', count: 2 }, { cat: 'Property Damage', count: 2 },
      { cat: 'Remote ID Failure', count: 2 }, { cat: 'Crash', count: 1 }, { cat: 'Injury to Person', count: 1 },
      { cat: 'Geofence Breach', count: 1 }, { cat: 'Interference', count: 1 },
    ];
    const maxCatCount = Math.max(...categoryBreakdown.map((c) => c.count));
    const factorBreakdown = [
      { factor: 'Equipment Malfunction', pct: 28 }, { factor: 'Pilot Error', pct: 22 }, { factor: 'Weather', pct: 16 },
      { factor: 'Battery Failure', pct: 12 }, { factor: 'Software Error', pct: 10 }, { factor: 'GPS Interference', pct: 7 },
      { factor: 'Other', pct: 5 },
    ];

    return (
      <div className="space-y-6">
        {/* Period selector */}
        <div className="flex items-center gap-2">
          {([['30d', '30 Days'], ['90d', '90 Days'], ['1y', '1 Year'], ['all', 'All Time']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setAnalyticsPeriod(val)} className={clsx('rounded-lg px-3 py-2 text-xs font-medium border transition-colors', analyticsPeriod === val ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')}>{label}</button>
          ))}
        </div>

        {/* Safety Trend */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Safety Trend — Reports by Month</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <Activity size={12} /> Safety events decreased 15% vs prior period
            </span>
          </div>
          {/* Bar chart */}
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map((m) => {
              const total = m.none + m.minor + m.moderate + m.serious + m.critical;
              const maxTotal = 8;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse" style={{ height: `${(total / maxTotal) * 100}%`, minHeight: total > 0 ? '8px' : '0' }}>
                    {m.critical > 0 && <div className="bg-red-500 rounded-t" style={{ flex: m.critical }} />}
                    {m.serious > 0 && <div className="bg-orange-500" style={{ flex: m.serious }} />}
                    {m.moderate > 0 && <div className="bg-yellow-500" style={{ flex: m.moderate }} />}
                    {m.minor > 0 && <div className="bg-blue-400" style={{ flex: m.minor }} />}
                    {m.none > 0 && <div className="bg-gray-300 rounded-b" style={{ flex: m.none }} />}
                  </div>
                  <span className="text-[10px] text-gray-500">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center">
            {[{ label: 'None', color: 'bg-gray-300' }, { label: 'Minor', color: 'bg-blue-400' }, { label: 'Moderate', color: 'bg-yellow-500' }, { label: 'Serious', color: 'bg-orange-500' }, { label: 'Critical', color: 'bg-red-500' }].map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className={clsx('h-2.5 w-2.5 rounded', l.color)} />{l.label}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="space-y-2.5">
              {categoryBreakdown.map((c) => (
                <div key={c.cat} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 truncate flex-shrink-0">{c.cat}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-4 bg-blue-500 rounded-full" style={{ width: `${(c.count / maxCatCount) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-6 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contributing Factors */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Contributing Factors</h3>
            <div className="space-y-2.5">
              {factorBreakdown.map((f) => (
                <div key={f.factor} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-40 truncate flex-shrink-0">{f.factor}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-4 bg-purple-500 rounded-full" style={{ width: `${f.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-8 text-right">{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Severity Distribution + Compliance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Severity Distribution</h3>
            <div className="flex items-center justify-center gap-8">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#9ca3af" strokeWidth="3" strokeDasharray="12 88" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#60a5fa" strokeWidth="3" strokeDasharray="38 62" strokeDashoffset="-12" />
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-50" />
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="13 87" strokeDashoffset="-75" />
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="12 88" strokeDashoffset="-88" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{mockReports.length}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {[{ label: 'None', pct: '12%', color: 'bg-gray-400' }, { label: 'Minor', pct: '38%', color: 'bg-blue-400' }, { label: 'Moderate', pct: '25%', color: 'bg-yellow-400' }, { label: 'Serious', pct: '13%', color: 'bg-orange-500' }, { label: 'Critical', pct: '12%', color: 'bg-red-500' }].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className={clsx('h-2.5 w-2.5 rounded-full', s.color)} />
                    <span className="text-xs text-gray-600">{s.label}</span>
                    <span className="text-xs font-bold text-gray-900">{s.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Compliance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-gray-600">Mandatory filed on time</span><span className="font-bold">{mandatoryOnTime}/{mandatoryTotal} ({mandatoryTotal > 0 ? Math.round((mandatoryOnTime / mandatoryTotal) * 100) : 0}%)</span></div>
                <div className="h-2 bg-gray-200 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{ width: `${mandatoryTotal > 0 ? (mandatoryOnTime / mandatoryTotal) * 100 : 0}%` }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-xs text-gray-500">Avg Time to File (mandatory)</p><p className="text-xl font-bold text-gray-900">6.3 <span className="text-xs font-normal text-gray-500">days</span></p><p className="text-[10px] text-gray-400">vs 10-day requirement</p></div>
                <div className="rounded-lg bg-gray-50 p-3 text-center"><p className="text-xs text-gray-500">Avg Investigation Close</p><p className="text-xl font-bold text-gray-900">4.2 <span className="text-xs font-normal text-gray-500">days</span></p></div>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
                <p className="text-xs text-blue-600">ASRS Reports Filed (voluntary)</p>
                <p className="text-xl font-bold text-blue-700">4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Learned */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4"><h2 className="font-semibold text-gray-900 flex items-center gap-2"><BookOpen size={18} /> Lessons Learned</h2></div>
          <div className="divide-y">
            {mockReports.filter((r) => (r as any).lessonsLearned).map((r) => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-gray-900">{r.id}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                  <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-medium', severityConfig[r.severity].bg, severityConfig[r.severity].text)}>{severityConfig[r.severity].label}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{r.categories.join(', ')}</p>
                <p className="text-sm text-gray-800 bg-green-50 border border-green-200 rounded-lg p-3">{(r as any).lessonsLearned}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert size={28} />
          <div>
            <h1 className="text-2xl font-bold">Safety Reporting</h1>
            <p className="text-sm text-red-100">Aviation Safety Reporting Program (ASRP) — FAA DroneZone + NASA ASRS</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">14 CFR 107.9 Mandatory Reporting</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">14 CFR Part 89 Remote ID</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {([
            { id: 'reports' as TabId, label: 'Reports' },
            { id: 'b4ufly' as TabId, label: 'B4UFLY Check' },
            { id: 'remote_id' as TabId, label: 'Remote ID Compliance' },
            { id: 'analytics' as TabId, label: 'Safety Analytics' },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'reports' && renderReportsTab()}
      {activeTab === 'b4ufly' && renderB4UFlyTab()}
      {activeTab === 'remote_id' && renderRemoteIDTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
}

// Fragment helper for expandable rows
const Fragment = ({ children }: { children: React.ReactNode }) => <>{children}</>;
