import React, { Fragment, useState } from 'react';
import {
  FileText, Download, Share2, Trash2, Search, Filter, Plus, ChevronDown, ChevronUp,
  CheckCircle, Clock, AlertCircle, Package, Shield, ShieldCheck, Building2, Landmark,
  FileSpreadsheet, FileArchive, FilePlus, Mail, Calendar, Users, Plane, Eye, EyeOff,
  BarChart3, ArrowRight, ArrowLeft, Loader2, X, Check, ClipboardList, AlertTriangle,
  Wrench, Award, Activity, TrendingUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { AuditPackage, AuditStats } from '../../../shared/types/audit';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockPackages: AuditPackage[] = [
  {
    id: 'AUD-001', tenantId: 'T-001', name: 'Q1 2026 FAA Audit Package', type: 'faa_audit', status: 'ready',
    createdBy: 'Juan Martinez', createdAt: '2026-03-15', expiresAt: '2026-06-15',
    scope: { dateRange: { start: '2026-01-01', end: '2026-03-31' }, pilots: ['Juan Martinez', 'Sarah Kim', 'Aisha Patel', 'Robert Chen'], drones: ['Mavic 3 Enterprise #1', 'Matrice 350 RTK', 'EVO II Pro #1', 'Skydio X10'], categories: ['flight_log', 'pilot_cert', 'drone_registration', 'maintenance_record', 'safety_report'] },
    documents: [
      { name: 'Flight Logs', type: 'flight_log', count: 127, included: true },
      { name: 'Pilot Certificates', type: 'pilot_cert', count: 4, included: true },
      { name: 'Drone Registrations', type: 'drone_registration', count: 6, included: true },
      { name: 'Maintenance Records', type: 'maintenance_record', count: 18, included: true },
      { name: 'Insurance COIs', type: 'insurance_coi', count: 3, included: true },
      { name: 'Safety Reports', type: 'safety_report', count: 2, included: true },
      { name: 'Incident Reports', type: 'incident_report', count: 1, included: true },
      { name: 'Compliance Checklists', type: 'compliance_checklist', count: 4, included: true },
    ],
    summary: { totalFlightHours: 312.5, totalFlights: 127, pilotCount: 4, droneCount: 6, incidentCount: 1, complianceScore: 94 },
    format: 'pdf', fileSize: 48500000, downloadUrl: '#',
    sharedWith: [{ email: 'faa-inspector@faa.gov', sharedAt: '2026-03-16', accessed: true }, { email: 'legal@skywarden.io', sharedAt: '2026-03-16', accessed: false }],
  },
  {
    id: 'AUD-002', tenantId: 'T-001', name: '2026 Insurance Renewal Bundle', type: 'insurance_renewal', status: 'shared',
    createdBy: 'Sarah Kim', createdAt: '2026-02-28', expiresAt: '2026-05-28',
    scope: { dateRange: { start: '2025-03-01', end: '2026-02-28' }, pilots: ['Juan Martinez', 'Sarah Kim', 'Aisha Patel'], drones: ['Mavic 3 Enterprise #1', 'Matrice 350 RTK', 'EVO II Pro #1', 'Skydio X10', 'Mavic 3T Thermal'], categories: ['flight_log', 'insurance_coi', 'safety_report', 'incident_report'] },
    documents: [
      { name: 'Flight Logs', type: 'flight_log', count: 489, included: true },
      { name: 'Insurance COIs', type: 'insurance_coi', count: 3, included: true },
      { name: 'Safety Reports', type: 'safety_report', count: 5, included: true },
      { name: 'Incident Reports', type: 'incident_report', count: 2, included: true },
      { name: 'Maintenance Records', type: 'maintenance_record', count: 42, included: true },
      { name: 'Compliance Checklists', type: 'compliance_checklist', count: 12, included: false },
    ],
    summary: { totalFlightHours: 1245.8, totalFlights: 489, pilotCount: 3, droneCount: 5, incidentCount: 2, complianceScore: 91 },
    format: 'zip', fileSize: 125000000, downloadUrl: '#',
    sharedWith: [{ email: 'underwriting@insureco.com', sharedAt: '2026-03-01', accessed: true }, { email: 'broker@aerorisk.com', sharedAt: '2026-03-01', accessed: true }],
  },
  {
    id: 'AUD-003', tenantId: 'T-001', name: 'Enterprise Compliance Report — March 2026', type: 'enterprise_compliance', status: 'downloaded',
    createdBy: 'Juan Martinez', createdAt: '2026-03-10', expiresAt: '2026-09-10',
    scope: { dateRange: { start: '2026-03-01', end: '2026-03-10' }, pilots: ['Juan Martinez', 'Sarah Kim', 'Aisha Patel', 'Robert Chen'], drones: ['Mavic 3 Enterprise #1', 'Matrice 350 RTK', 'EVO II Pro #1', 'Skydio X10', 'Mavic 3T Thermal', 'Phantom 4 RTK'], categories: ['pilot_cert', 'drone_registration', 'maintenance_record', 'compliance_checklist'] },
    documents: [
      { name: 'Pilot Certificates', type: 'pilot_cert', count: 4, included: true },
      { name: 'Drone Registrations', type: 'drone_registration', count: 6, included: true },
      { name: 'Maintenance Records', type: 'maintenance_record', count: 8, included: true },
      { name: 'Compliance Checklists', type: 'compliance_checklist', count: 4, included: true },
    ],
    summary: { totalFlightHours: 38.2, totalFlights: 15, pilotCount: 4, droneCount: 6, incidentCount: 0, complianceScore: 87 },
    format: 'xlsx', fileSize: 3200000, downloadUrl: '#',
    sharedWith: [{ email: 'cto@skywarden.io', sharedAt: '2026-03-11', accessed: true }],
  },
  {
    id: 'AUD-004', tenantId: 'T-001', name: 'DOT Infrastructure Inspection Report', type: 'government_report', status: 'ready',
    createdBy: 'Aisha Patel', createdAt: '2026-03-18', expiresAt: '2026-06-18',
    scope: { dateRange: { start: '2025-10-01', end: '2026-03-15' }, pilots: ['Aisha Patel', 'Juan Martinez'], drones: ['Matrice 350 RTK', 'Mavic 3T Thermal'], categories: ['flight_log', 'pilot_cert', 'drone_registration', 'safety_report'] },
    documents: [
      { name: 'Flight Logs', type: 'flight_log', count: 64, included: true },
      { name: 'Pilot Certificates', type: 'pilot_cert', count: 2, included: true },
      { name: 'Drone Registrations', type: 'drone_registration', count: 2, included: true },
      { name: 'Safety Reports', type: 'safety_report', count: 1, included: true },
      { name: 'Incident Reports', type: 'incident_report', count: 0, included: false },
    ],
    summary: { totalFlightHours: 156.4, totalFlights: 64, pilotCount: 2, droneCount: 2, incidentCount: 0, complianceScore: 98 },
    format: 'pdf', fileSize: 28700000, downloadUrl: '#',
    sharedWith: [],
  },
  {
    id: 'AUD-005', tenantId: 'T-001', name: 'Pilot Robert Chen — Remediation Package', type: 'custom', status: 'generating',
    createdBy: 'Juan Martinez', createdAt: '2026-03-20', expiresAt: '2026-06-20',
    scope: { dateRange: { start: '2024-01-01', end: '2026-03-20' }, pilots: ['Robert Chen'], drones: ['Phantom 4 RTK', 'Skydio X10'], categories: ['pilot_cert', 'flight_log', 'maintenance_record'] },
    documents: [
      { name: 'Pilot Certificates', type: 'pilot_cert', count: 1, included: true },
      { name: 'Flight Logs', type: 'flight_log', count: 82, included: true },
      { name: 'Maintenance Records', type: 'maintenance_record', count: 6, included: true },
    ],
    summary: { totalFlightHours: 98.3, totalFlights: 82, pilotCount: 1, droneCount: 2, incidentCount: 0, complianceScore: 62 },
    format: 'pdf',
    sharedWith: [],
  },
  {
    id: 'AUD-006', tenantId: 'T-001', name: '2025 Annual Compliance Archive', type: 'enterprise_compliance', status: 'expired',
    createdBy: 'Sarah Kim', createdAt: '2025-12-31', expiresAt: '2026-03-01',
    scope: { dateRange: { start: '2025-01-01', end: '2025-12-31' }, pilots: ['Juan Martinez', 'Sarah Kim', 'Aisha Patel', 'Robert Chen'], drones: ['Mavic 3 Enterprise #1', 'Matrice 350 RTK', 'EVO II Pro #1', 'Skydio X10', 'Mavic 3T Thermal', 'Phantom 4 RTK'], categories: ['flight_log', 'pilot_cert', 'drone_registration', 'maintenance_record', 'insurance_coi', 'safety_report', 'incident_report', 'compliance_checklist'] },
    documents: [
      { name: 'Flight Logs', type: 'flight_log', count: 1842, included: true },
      { name: 'Pilot Certificates', type: 'pilot_cert', count: 4, included: true },
      { name: 'Drone Registrations', type: 'drone_registration', count: 6, included: true },
      { name: 'Maintenance Records', type: 'maintenance_record', count: 156, included: true },
      { name: 'Insurance COIs', type: 'insurance_coi', count: 6, included: true },
      { name: 'Safety Reports', type: 'safety_report', count: 12, included: true },
      { name: 'Incident Reports', type: 'incident_report', count: 4, included: true },
      { name: 'Compliance Checklists', type: 'compliance_checklist', count: 48, included: true },
    ],
    summary: { totalFlightHours: 4567.2, totalFlights: 1842, pilotCount: 4, droneCount: 6, incidentCount: 4, complianceScore: 89 },
    format: 'zip', fileSize: 512000000, downloadUrl: '#',
    sharedWith: [{ email: 'cfo@skywarden.io', sharedAt: '2026-01-02', accessed: true }, { email: 'legal@skywarden.io', sharedAt: '2026-01-02', accessed: true }, { email: 'faa-liaison@faa.gov', sharedAt: '2026-01-05', accessed: false }],
  },
];

const mockStats: AuditStats = {
  totalPackages: 6,
  readyPackages: 2,
  sharedPackages: 1,
  lastGenerated: '2026-03-20',
  complianceScore: 94,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};

const typeConfig: Record<AuditPackage['type'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  faa_audit: { label: 'FAA Audit', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: <Shield className="h-4 w-4" /> },
  insurance_renewal: { label: 'Insurance Renewal', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: <ShieldCheck className="h-4 w-4" /> },
  enterprise_compliance: { label: 'Enterprise Compliance', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: <Building2 className="h-4 w-4" /> },
  government_report: { label: 'Government Report', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', icon: <Landmark className="h-4 w-4" /> },
  custom: { label: 'Custom', color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30', icon: <FileText className="h-4 w-4" /> },
};

const statusConfig: Record<AuditPackage['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  generating: { label: 'Generating', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  ready: { label: 'Ready', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  downloaded: { label: 'Downloaded', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: <Download className="h-3.5 w-3.5" /> },
  shared: { label: 'Shared', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: <Share2 className="h-3.5 w-3.5" /> },
  expired: { label: 'Expired', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

const complianceCategories = [
  { key: 'pilotCerts', label: 'Pilot Certifications', score: 92, icon: <Award className="h-4 w-4" /> },
  { key: 'droneReg', label: 'Drone Registrations', score: 88, icon: <Plane className="h-4 w-4" /> },
  { key: 'maintenance', label: 'Maintenance Records', score: 96, icon: <Wrench className="h-4 w-4" /> },
  { key: 'insurance', label: 'Insurance Coverage', score: 95, icon: <ShieldCheck className="h-4 w-4" /> },
  { key: 'safety', label: 'Safety Reports', score: 100, icon: <AlertTriangle className="h-4 w-4" /> },
];

const availablePilots = ['Juan Martinez', 'Sarah Kim', 'Aisha Patel', 'Robert Chen'];
const availableDrones = ['Mavic 3 Enterprise #1', 'Matrice 350 RTK', 'EVO II Pro #1', 'Skydio X10', 'Mavic 3T Thermal', 'Phantom 4 RTK'];

const documentTypes: Array<{ name: string; type: AuditPackage['documents'][0]['type']; defaultCount: number }> = [
  { name: 'Flight Logs', type: 'flight_log', defaultCount: 127 },
  { name: 'Pilot Certificates', type: 'pilot_cert', defaultCount: 4 },
  { name: 'Drone Registrations', type: 'drone_registration', defaultCount: 6 },
  { name: 'Maintenance Records', type: 'maintenance_record', defaultCount: 18 },
  { name: 'Insurance COIs', type: 'insurance_coi', defaultCount: 3 },
  { name: 'Safety Reports', type: 'safety_report', defaultCount: 2 },
  { name: 'Incident Reports', type: 'incident_report', defaultCount: 1 },
  { name: 'Compliance Checklists', type: 'compliance_checklist', defaultCount: 4 },
];

// ─── Component ───────────────────────────────────────────────────────────────────

export function AuditExportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showCompliance, setShowCompliance] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Wizard state
  const [wizardType, setWizardType] = useState<AuditPackage['type']>('faa_audit');
  const [wizardDateStart, setWizardDateStart] = useState('2026-01-01');
  const [wizardDateEnd, setWizardDateEnd] = useState('2026-03-20');
  const [wizardPilots, setWizardPilots] = useState<string[]>([...availablePilots]);
  const [wizardDrones, setWizardDrones] = useState<string[]>([...availableDrones]);
  const [wizardDocs, setWizardDocs] = useState<Record<string, boolean>>(
    Object.fromEntries(documentTypes.map(d => [d.type, true]))
  );
  const [wizardFormat, setWizardFormat] = useState<AuditPackage['format']>('pdf');

  // Share modal state
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareExpiry, setShareExpiry] = useState('');

  // Filter packages
  const filtered = mockPackages.filter(p => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.createdBy.toLowerCase().includes(q);
    }
    return true;
  });

  const togglePilot = (name: string) => {
    setWizardPilots(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  const toggleDrone = (name: string) => {
    setWizardDrones(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);
  };

  const toggleDoc = (type: string) => {
    setWizardDocs(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowWizard(false);
      setWizardStep(1);
    }, 2500);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setWizardType('faa_audit');
    setWizardDateStart('2026-01-01');
    setWizardDateEnd('2026-03-20');
    setWizardPilots([...availablePilots]);
    setWizardDrones([...availableDrones]);
    setWizardDocs(Object.fromEntries(documentTypes.map(d => [d.type, true])));
    setWizardFormat('pdf');
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit & Export Center</h1>
          <p className="text-sm text-gray-400 mt-1">Generate compliance packages, share with auditors, and track export history</p>
        </div>
        <button
          onClick={() => { resetWizard(); setShowWizard(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Generate Audit Package
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1"><Package className="h-3.5 w-3.5" />Total Packages</div>
          <div className="text-2xl font-bold text-white">{mockStats.totalPackages}</div>
        </div>
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1"><CheckCircle className="h-3.5 w-3.5" />Ready</div>
          <div className="text-2xl font-bold text-green-400">{mockStats.readyPackages}</div>
        </div>
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1"><Share2 className="h-3.5 w-3.5" />Shared</div>
          <div className="text-2xl font-bold text-purple-400">{mockStats.sharedPackages}</div>
        </div>
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1"><Calendar className="h-3.5 w-3.5" />Last Generated</div>
          <div className="text-lg font-bold text-white">{mockStats.lastGenerated}</div>
        </div>
        {/* Compliance Gauge */}
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4 flex flex-col items-center justify-center">
          <div className="text-xs font-medium text-gray-400 mb-2">Compliance Score</div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-700" />
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="none"
                className={clsx(mockStats.complianceScore >= 90 ? 'text-green-400' : mockStats.complianceScore >= 70 ? 'text-yellow-400' : 'text-red-400')}
                strokeDasharray={`${(mockStats.complianceScore / 100) * 213.6} 213.6`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={clsx('text-lg font-bold', mockStats.complianceScore >= 90 ? 'text-green-400' : mockStats.complianceScore >= 70 ? 'text-yellow-400' : 'text-red-400')}>
                {mockStats.complianceScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compliance Breakdown ── */}
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50">
        <button onClick={() => setShowCompliance(!showCompliance)} className="flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-semibold text-white">Compliance Score Breakdown</span>
          </div>
          {showCompliance ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {showCompliance && (
          <div className="px-4 pb-4 space-y-3">
            {complianceCategories.map(cat => (
              <div key={cat.key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-48 text-sm text-gray-300">
                  {cat.icon}
                  {cat.label}
                </div>
                <div className="flex-1 h-3 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all', cat.score >= 90 ? 'bg-green-500' : cat.score >= 70 ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <span className={clsx('text-sm font-medium w-12 text-right', cat.score >= 90 ? 'text-green-400' : cat.score >= 70 ? 'text-yellow-400' : 'text-red-400')}>
                  {cat.score}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search packages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="all">All Types</option>
          {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* ── Package History Table ── */}
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Docs</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {filtered.map(pkg => {
                const tc = typeConfig[pkg.type];
                const sc = statusConfig[pkg.status];
                const expanded = expandedId === pkg.id;
                const totalDocs = pkg.documents.reduce((sum, d) => sum + (d.included ? d.count : 0), 0);
                return (
                  <Fragment key={pkg.id}>
                    <tr className="hover:bg-gray-700/20 transition-colors cursor-pointer" onClick={() => setExpandedId(expanded ? null : pkg.id)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {expanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                          <span className="font-medium text-white">{pkg.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', tc.bg, tc.color)}>
                          {tc.icon}{tc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', sc.bg, sc.color)}>
                          {sc.icon}{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{pkg.createdAt}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{pkg.scope.dateRange.start} — {pkg.scope.dateRange.end}</td>
                      <td className="px-4 py-3 text-gray-300">{totalDocs}</td>
                      <td className="px-4 py-3 text-gray-300">{pkg.fileSize ? formatFileSize(pkg.fileSize) : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          {(pkg.status === 'ready' || pkg.status === 'downloaded' || pkg.status === 'shared') && (
                            <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" title="Download">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          {pkg.status !== 'generating' && pkg.status !== 'expired' && (
                            <button onClick={() => setShowShareModal(pkg.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" title="Share">
                              <Share2 className="h-4 w-4" />
                            </button>
                          )}
                          <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={8} className="bg-gray-900/40 px-6 py-4">
                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Scope Details */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Scope</h4>
                              <div className="space-y-2 text-sm">
                                <div><span className="text-gray-500">Date Range:</span> <span className="text-gray-300">{pkg.scope.dateRange.start} — {pkg.scope.dateRange.end}</span></div>
                                <div><span className="text-gray-500">Pilots ({pkg.scope.pilots.length}):</span> <span className="text-gray-300">{pkg.scope.pilots.join(', ')}</span></div>
                                <div><span className="text-gray-500">Drones ({pkg.scope.drones.length}):</span> <span className="text-gray-300">{pkg.scope.drones.join(', ')}</span></div>
                              </div>
                            </div>
                            {/* Document Breakdown */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Documents</h4>
                              <div className="space-y-1.5">
                                {pkg.documents.map(doc => (
                                  <div key={doc.type} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      {doc.included ? <Check className="h-3.5 w-3.5 text-green-400" /> : <X className="h-3.5 w-3.5 text-gray-600" />}
                                      <span className={doc.included ? 'text-gray-300' : 'text-gray-600'}>{doc.name}</span>
                                    </div>
                                    <span className={doc.included ? 'text-gray-400' : 'text-gray-600'}>{doc.count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Summary Stats + Shared With */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Summary</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-gray-500">Flight Hours:</span> <span className="text-white font-medium">{pkg.summary.totalFlightHours.toLocaleString()}</span></div>
                                  <div><span className="text-gray-500">Flights:</span> <span className="text-white font-medium">{pkg.summary.totalFlights.toLocaleString()}</span></div>
                                  <div><span className="text-gray-500">Pilots:</span> <span className="text-white font-medium">{pkg.summary.pilotCount}</span></div>
                                  <div><span className="text-gray-500">Drones:</span> <span className="text-white font-medium">{pkg.summary.droneCount}</span></div>
                                  <div><span className="text-gray-500">Incidents:</span> <span className={clsx('font-medium', pkg.summary.incidentCount > 0 ? 'text-yellow-400' : 'text-green-400')}>{pkg.summary.incidentCount}</span></div>
                                  <div><span className="text-gray-500">Compliance:</span> <span className={clsx('font-medium', pkg.summary.complianceScore >= 90 ? 'text-green-400' : pkg.summary.complianceScore >= 70 ? 'text-yellow-400' : 'text-red-400')}>{pkg.summary.complianceScore}%</span></div>
                                </div>
                              </div>
                              {pkg.sharedWith.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Shared With</h4>
                                  <div className="space-y-1.5">
                                    {pkg.sharedWith.map(sw => (
                                      <div key={sw.email} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-3.5 w-3.5 text-gray-500" />
                                          <span className="text-gray-300">{sw.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500 text-xs">{sw.sharedAt}</span>
                                          {sw.accessed ? <Eye className="h-3.5 w-3.5 text-green-400" title="Accessed" /> : <EyeOff className="h-3.5 w-3.5 text-gray-600" title="Not accessed" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
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
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Package className="h-10 w-10 mb-2" />
            <p className="text-sm">No packages match your filters</p>
          </div>
        )}
      </div>

      {/* ── Generate Wizard Modal ── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Wizard Header */}
            <div className="flex items-center justify-between border-b border-gray-700 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Generate Audit Package</h2>
                <p className="text-sm text-gray-400 mt-0.5">Step {wizardStep} of 4</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            {/* Step indicator */}
            <div className="flex items-center gap-2 px-5 pt-4">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={clsx('h-1.5 flex-1 rounded-full transition-colors', s <= wizardStep ? 'bg-blue-500' : 'bg-gray-700')} />
              ))}
            </div>

            <div className="p-5 space-y-4">
              {/* Step 1: Package Type */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Select Package Type</h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(typeConfig).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setWizardType(key as AuditPackage['type'])}
                        className={clsx(
                          'flex items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                          wizardType === key ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        )}
                      >
                        <div className={clsx('rounded-lg p-2', cfg.bg)}>{cfg.icon}</div>
                        <span className="text-sm font-medium text-white">{cfg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Scope */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Define Scope</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Start Date</label>
                      <input type="date" value={wizardDateStart} onChange={e => setWizardDateStart(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">End Date</label>
                      <input type="date" value={wizardDateEnd} onChange={e => setWizardDateEnd(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Pilots</label>
                    <div className="flex flex-wrap gap-2">
                      {availablePilots.map(p => (
                        <button key={p} onClick={() => togglePilot(p)} className={clsx('rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors', wizardPilots.includes(p) ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600')}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Drones</label>
                    <div className="flex flex-wrap gap-2">
                      {availableDrones.map(d => (
                        <button key={d} onClick={() => toggleDrone(d)} className={clsx('rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors', wizardDrones.includes(d) ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600')}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents Checklist */}
              {wizardStep === 3 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Select Documents</h3>
                  <div className="space-y-2">
                    {documentTypes.map(doc => (
                      <label key={doc.type} className={clsx('flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-colors', wizardDocs[doc.type] ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600')}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={wizardDocs[doc.type]} onChange={() => toggleDoc(doc.type)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-white">{doc.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-700/50 rounded-full px-2 py-0.5">{doc.defaultCount} items</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Format & Review */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Format & Review</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {([['pdf', 'PDF Bundle', <FileText key="pdf" className="h-5 w-5" />], ['zip', 'ZIP Archive', <FileArchive key="zip" className="h-5 w-5" />], ['xlsx', 'Excel Workbook', <FileSpreadsheet key="xlsx" className="h-5 w-5" />]] as const).map(([fmt, label, icon]) => (
                      <button
                        key={fmt}
                        onClick={() => setWizardFormat(fmt)}
                        className={clsx('flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors', wizardFormat === fmt ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600')}
                      >
                        {icon}
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Review Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Type:</span> <span className="text-white">{typeConfig[wizardType].label}</span></div>
                      <div><span className="text-gray-500">Format:</span> <span className="text-white uppercase">{wizardFormat}</span></div>
                      <div><span className="text-gray-500">Date Range:</span> <span className="text-white">{wizardDateStart} — {wizardDateEnd}</span></div>
                      <div><span className="text-gray-500">Pilots:</span> <span className="text-white">{wizardPilots.length}</span></div>
                      <div><span className="text-gray-500">Drones:</span> <span className="text-white">{wizardDrones.length}</span></div>
                      <div><span className="text-gray-500">Documents:</span> <span className="text-white">{Object.values(wizardDocs).filter(Boolean).length} types</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Footer */}
            <div className="flex items-center justify-between border-t border-gray-700 p-5">
              <button
                onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setShowWizard(false)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />{wizardStep > 1 ? 'Back' : 'Cancel'}
              </button>
              {wizardStep < 4 ? (
                <button onClick={() => setWizardStep(wizardStep + 1)} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                  Next<ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50">
                  {generating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><FilePlus className="h-4 w-4" />Generate Package</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 p-5">
              <h2 className="text-lg font-bold text-white">Share Package</h2>
              <button onClick={() => setShowShareModal(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Recipient Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="auditor@example.com" className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Message (optional)</label>
                <textarea value={shareMessage} onChange={e => setShareMessage(e.target.value)} rows={3} placeholder="Please review the attached audit package..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Link Expiry Date</label>
                <input type="date" value={shareExpiry} onChange={e => setShareExpiry(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-700 p-5">
              <button onClick={() => setShowShareModal(null)} className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={() => { setShowShareModal(null); setShareEmail(''); setShareMessage(''); setShareExpiry(''); }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                <Share2 className="h-4 w-4" />Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
