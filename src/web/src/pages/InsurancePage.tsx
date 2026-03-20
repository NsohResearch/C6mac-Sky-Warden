import { useState } from 'react';
import {
  Shield, ShieldCheck, FileText, DollarSign, Calendar, Clock, AlertTriangle,
  CheckCircle, XCircle, Download, Mail, Plus, Filter, Search, ChevronDown,
  ChevronUp, Edit, Trash2, RefreshCw, Plane, User, Users, Building,
  FileCheck, FilePlus, Printer, Eye, ExternalLink, TrendingUp, Award, Umbrella,
} from 'lucide-react';
import { clsx } from 'clsx';
import type {
  InsurancePolicy, InsuranceClaim, CertificateOfInsurance, InsuranceQuote, InsuranceStats,
} from '../../../shared/types/insurance';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockPolicies: InsurancePolicy[] = [
  {
    id: 'POL-001', tenantId: 'tenant-001', provider: 'SkyWatch Insurance', policyNumber: 'SW-2026-44821',
    type: 'comprehensive', status: 'active',
    coverage: { hullValue: 250000, liabilityLimit: 1000000, medicalPayments: 50000, personalInjury: 500000, propertyDamage: 500000, groundEquipment: 75000, nonOwnedDrones: 100000 },
    premium: { amount: 4800, frequency: 'annual', paid: true, nextPaymentDate: '2027-01-15' },
    deductible: 2500, effectiveDate: '2026-01-15', expiryDate: '2027-01-15',
    coveredDrones: [
      { droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', hullValue: 45000 },
      { droneId: 'DRN-002', droneName: 'Matrice 350 RTK', hullValue: 85000 },
      { droneId: 'DRN-004', droneName: 'Skydio X10', hullValue: 62000 },
      { droneId: 'DRN-007', droneName: 'Inspire 3', hullValue: 58000 },
    ],
    coveredPilots: [
      { pilotId: 'PLT-001', pilotName: 'Alex Martinez', certNumber: 'FA-4421887' },
      { pilotId: 'PLT-002', pilotName: 'Sarah Chen', certNumber: 'FA-5539210' },
      { pilotId: 'PLT-003', pilotName: 'James Wu', certNumber: 'FA-6618453' },
    ],
    exclusions: ['War & terrorism', 'Nuclear hazards', 'Intentional damage', 'Racing or speed contests', 'Operations above 400ft without waiver'],
    endorsements: ['Extended territory — all US states + territories', 'Night operations coverage', 'BVLOS operations endorsement', 'Payload drop coverage'],
    documents: [
      { name: 'Policy Declaration', type: 'policy', uploadDate: '2026-01-15' },
      { name: 'Certificate of Insurance', type: 'coi', uploadDate: '2026-01-15' },
      { name: 'BVLOS Endorsement', type: 'endorsement', uploadDate: '2026-02-01' },
      { name: 'Annual Premium Receipt', type: 'receipt', uploadDate: '2026-01-15' },
    ],
    claims: [],
    autoRenew: true,
  },
  {
    id: 'POL-002', tenantId: 'tenant-001', provider: 'Verifly', policyNumber: 'VF-2026-09832',
    type: 'per_flight', status: 'active',
    coverage: { hullValue: 0, liabilityLimit: 500000, medicalPayments: 25000, personalInjury: 250000, propertyDamage: 250000, groundEquipment: 0 },
    premium: { amount: 35, frequency: 'per_flight', paid: true, nextPaymentDate: 'N/A' },
    deductible: 500, effectiveDate: '2026-02-01', expiryDate: '2027-02-01',
    coveredDrones: [
      { droneId: 'DRN-003', droneName: 'EVO II Pro #1', hullValue: 0 },
    ],
    coveredPilots: [
      { pilotId: 'PLT-001', pilotName: 'Alex Martinez', certNumber: 'FA-4421887' },
    ],
    exclusions: ['Hull coverage excluded', 'Ground equipment', 'Non-owned drones', 'Operations in restricted airspace without authorization'],
    endorsements: ['On-demand activation via app'],
    documents: [
      { name: 'Per-Flight Policy Terms', type: 'policy', uploadDate: '2026-02-01' },
    ],
    claims: [],
    autoRenew: false,
  },
  {
    id: 'POL-003', tenantId: 'tenant-001', provider: 'Global Aerospace', policyNumber: 'GA-2026-FL-7741',
    type: 'fleet', status: 'active',
    coverage: { hullValue: 500000, liabilityLimit: 2000000, medicalPayments: 100000, personalInjury: 1000000, propertyDamage: 1000000, groundEquipment: 150000, nonOwnedDrones: 250000 },
    premium: { amount: 2800, frequency: 'quarterly', paid: false, nextPaymentDate: '2026-04-01' },
    deductible: 5000, effectiveDate: '2025-07-01', expiryDate: '2026-04-15',
    coveredDrones: [
      { droneId: 'DRN-005', droneName: 'Mavic 3T Thermal', hullValue: 52000 },
      { droneId: 'DRN-006', droneName: 'Phantom 4 RTK', hullValue: 38000 },
      { droneId: 'DRN-008', droneName: 'M30T Enterprise', hullValue: 72000 },
    ],
    coveredPilots: [
      { pilotId: 'PLT-002', pilotName: 'Sarah Chen', certNumber: 'FA-5539210' },
      { pilotId: 'PLT-004', pilotName: 'Mike Torres', certNumber: 'FA-7724561' },
    ],
    exclusions: ['War & terrorism', 'Cyber attacks on flight systems', 'Operations in foreign airspace', 'Payload over 55 lbs'],
    endorsements: ['Fleet discount — 15% off standard rates', 'Government contract operations', 'Hazardous material survey'],
    documents: [
      { name: 'Fleet Policy Declaration', type: 'policy', uploadDate: '2025-07-01' },
      { name: 'Fleet COI', type: 'coi', uploadDate: '2025-07-01' },
      { name: 'Q1 2026 Receipt', type: 'receipt', uploadDate: '2026-01-02' },
    ],
    claims: [],
    autoRenew: true,
  },
  {
    id: 'POL-004', tenantId: 'tenant-001', provider: 'DroneInsure', policyNumber: 'DI-2025-22190',
    type: 'annual_hull', status: 'expired',
    coverage: { hullValue: 120000, liabilityLimit: 0, medicalPayments: 0, personalInjury: 0, propertyDamage: 0, groundEquipment: 25000 },
    premium: { amount: 1800, frequency: 'annual', paid: true, nextPaymentDate: 'N/A' },
    deductible: 1000, effectiveDate: '2025-01-01', expiryDate: '2025-12-31',
    coveredDrones: [
      { droneId: 'DRN-001', droneName: 'Mavic 3 Enterprise #1', hullValue: 45000 },
      { droneId: 'DRN-003', droneName: 'EVO II Pro #1', hullValue: 38000 },
    ],
    coveredPilots: [
      { pilotId: 'PLT-001', pilotName: 'Alex Martinez', certNumber: 'FA-4421887' },
    ],
    exclusions: ['Liability coverage excluded', 'Water damage', 'Manufacturer defects'],
    endorsements: [],
    documents: [
      { name: 'Hull Policy 2025', type: 'policy', uploadDate: '2025-01-01' },
    ],
    claims: [],
    autoRenew: false,
  },
];

const mockClaims: InsuranceClaim[] = [
  { id: 'CLM-001', policyId: 'POL-001', claimNumber: 'SW-CLM-2026-0041', status: 'settled', type: 'hull_damage', incidentDate: '2026-02-10', filedDate: '2026-02-11', description: 'Mavic 3 Enterprise sustained propeller damage during emergency landing in high wind conditions. Two propellers cracked and minor gimbal scuffing.', amount: 1200, settledAmount: 950, adjuster: 'Karen Li — SkyWatch Claims', relatedSafetyReport: 'SR-2026-014', documents: ['incident_report.pdf', 'repair_estimate.pdf', 'photos.zip'] },
  { id: 'CLM-002', policyId: 'POL-003', claimNumber: 'GA-CLM-2026-0187', status: 'under_review', type: 'property_damage', incidentDate: '2026-03-05', filedDate: '2026-03-06', description: 'M30T Enterprise clipped a tree branch during infrastructure inspection, causing branch to fall on client vehicle. Minor vehicle damage reported.', amount: 3500, adjuster: 'Robert Finch — Global Aerospace', relatedSafetyReport: 'SR-2026-028', documents: ['incident_report.pdf', 'vehicle_damage_photos.zip', 'witness_statement.pdf'] },
  { id: 'CLM-003', policyId: 'POL-001', claimNumber: 'SW-CLM-2026-0055', status: 'approved', type: 'hull_damage', incidentDate: '2026-03-12', filedDate: '2026-03-13', description: 'Skydio X10 obstacle avoidance system failed to detect thin wire during construction site survey. Drone impacted wire and crashed. Total hull loss.', amount: 62000, adjuster: 'Karen Li — SkyWatch Claims', relatedSafetyReport: 'SR-2026-032', documents: ['incident_report.pdf', 'faa_report.pdf', 'salvage_assessment.pdf'] },
  { id: 'CLM-004', policyId: 'POL-003', claimNumber: 'GA-CLM-2026-0201', status: 'filed', type: 'theft', incidentDate: '2026-03-15', filedDate: '2026-03-16', description: 'Phantom 4 RTK stolen from locked equipment van at job site overnight. Police report filed. Serial number flagged.', amount: 38000, documents: ['police_report.pdf', 'equipment_inventory.pdf'] },
  { id: 'CLM-005', policyId: 'POL-001', claimNumber: 'SW-CLM-2025-0198', status: 'closed', type: 'liability', incidentDate: '2025-11-20', filedDate: '2025-11-21', description: 'Third-party complaint about drone flying too close to residential property during mapping mission. No actual damage; complaint dismissed after review.', amount: 0, settledAmount: 0, adjuster: 'Karen Li — SkyWatch Claims', documents: ['complaint_letter.pdf', 'flight_log.pdf', 'resolution_letter.pdf'] },
  { id: 'CLM-006', policyId: 'POL-003', claimNumber: 'GA-CLM-2026-0115', status: 'denied', type: 'lost_drone', incidentDate: '2026-01-28', filedDate: '2026-01-30', description: 'Mavic 3T Thermal lost signal over water during coastal survey. Drone unrecoverable. Claim denied — operations over open water excluded without endorsement.', amount: 52000, adjuster: 'Robert Finch — Global Aerospace', documents: ['flight_log.pdf', 'telemetry_data.csv', 'denial_letter.pdf'] },
];

// Attach claims to policies
mockPolicies[0].claims = mockClaims.filter(c => c.policyId === 'POL-001');
mockPolicies[2].claims = mockClaims.filter(c => c.policyId === 'POL-003');

const mockCOIs: CertificateOfInsurance[] = [
  { id: 'COI-001', policyId: 'POL-001', holderName: 'SkyWarden Drone Services LLC', holderAddress: '1200 Aviation Blvd, Suite 400, Dallas, TX 75201', additionalInsured: 'Dallas County Infrastructure Dept', certificateNumber: 'COI-SW-2026-0041', issuedDate: '2026-01-20', purpose: 'Infrastructure inspection contract', operationDescription: 'Aerial bridge and road inspection using multi-rotor UAS', location: 'Dallas County, TX', generatedUrl: '/coi/COI-SW-2026-0041.pdf' },
  { id: 'COI-002', policyId: 'POL-001', holderName: 'SkyWarden Drone Services LLC', holderAddress: '1200 Aviation Blvd, Suite 400, Dallas, TX 75201', certificateNumber: 'COI-SW-2026-0055', issuedDate: '2026-02-15', purpose: 'Construction site mapping', operationDescription: 'Photogrammetric mapping and 3D modeling of active construction sites', location: 'Fort Worth, TX', generatedUrl: '/coi/COI-SW-2026-0055.pdf' },
  { id: 'COI-003', policyId: 'POL-003', holderName: 'SkyWarden Drone Services LLC', holderAddress: '1200 Aviation Blvd, Suite 400, Dallas, TX 75201', additionalInsured: 'Texas DOT', certificateNumber: 'COI-GA-2026-0187', issuedDate: '2026-02-28', purpose: 'Highway corridor survey', operationDescription: 'BVLOS corridor survey and thermal inspection of highway infrastructure', location: 'I-35 Corridor, TX', generatedUrl: '/coi/COI-GA-2026-0187.pdf' },
  { id: 'COI-004', policyId: 'POL-001', holderName: 'SkyWarden Drone Services LLC', holderAddress: '1200 Aviation Blvd, Suite 400, Dallas, TX 75201', additionalInsured: 'Apex Solar Energy Inc', certificateNumber: 'COI-SW-2026-0072', issuedDate: '2026-03-10', purpose: 'Solar farm inspection', operationDescription: 'Thermal and visual inspection of solar panel arrays', location: 'Midland, TX', generatedUrl: '/coi/COI-SW-2026-0072.pdf' },
  { id: 'COI-005', policyId: 'POL-003', holderName: 'SkyWarden Drone Services LLC', holderAddress: '1200 Aviation Blvd, Suite 400, Dallas, TX 75201', certificateNumber: 'COI-GA-2026-0201', issuedDate: '2026-03-18', purpose: 'Event aerial photography', operationDescription: 'Aerial photography and videography for outdoor sporting event', location: 'Arlington, TX', generatedUrl: '/coi/COI-GA-2026-0201.pdf' },
];

const mockQuotes: InsuranceQuote[] = [
  {
    id: 'QT-001', provider: 'Verifly', type: 'comprehensive', premium: 4200, deductible: 2000, validUntil: '2026-04-15',
    coverage: { hullValue: 300000, liabilityLimit: 1000000, medicalPayments: 50000, personalInjury: 500000, propertyDamage: 500000, groundEquipment: 50000, nonOwnedDrones: 75000 },
    highlights: ['Instant digital COI generation', 'Pay-as-you-fly option available', 'Mobile app for claims filing', 'No fleet minimum'],
  },
  {
    id: 'QT-002', provider: 'SkyWatch Insurance', type: 'comprehensive', premium: 5100, deductible: 1500, validUntil: '2026-04-15',
    coverage: { hullValue: 350000, liabilityLimit: 2000000, medicalPayments: 75000, personalInjury: 750000, propertyDamage: 750000, groundEquipment: 100000, nonOwnedDrones: 150000 },
    highlights: ['Highest liability limits', 'BVLOS coverage included', 'Dedicated claims adjuster', '24/7 emergency support line'],
  },
  {
    id: 'QT-003', provider: 'Global Aerospace', type: 'fleet', premium: 3900, deductible: 3000, validUntil: '2026-04-15',
    coverage: { hullValue: 400000, liabilityLimit: 1500000, medicalPayments: 60000, personalInjury: 600000, propertyDamage: 600000, groundEquipment: 80000, nonOwnedDrones: 100000 },
    highlights: ['Fleet discount 20%', 'Government contract approved', 'Multi-year lock-in rates', 'Free risk assessment'],
  },
];

const mockStats: InsuranceStats = {
  totalPolicies: 4, activePolicies: 3, totalCoverage: 3750000, totalPremiums: 18600,
  openClaims: 3, expiringWithin30Days: 1, coveredDrones: 8, uncoveredDrones: 2,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const statusColors: Record<InsurancePolicy['status'], string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  expired: 'bg-zinc-500/20 text-zinc-400',
  pending: 'bg-amber-500/20 text-amber-400',
  cancelled: 'bg-red-500/20 text-red-400',
  suspended: 'bg-orange-500/20 text-orange-400',
};

const typeLabels: Record<InsurancePolicy['type'], string> = {
  annual_hull: 'Annual Hull', annual_liability: 'Annual Liability', per_flight: 'Per-Flight',
  on_demand: 'On-Demand', fleet: 'Fleet', comprehensive: 'Comprehensive',
};

const claimStatusColors: Record<InsuranceClaim['status'], string> = {
  filed: 'bg-blue-500/20 text-blue-400',
  under_review: 'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  denied: 'bg-red-500/20 text-red-400',
  settled: 'bg-cyan-500/20 text-cyan-400',
  closed: 'bg-zinc-500/20 text-zinc-400',
};

const claimTypeLabels: Record<InsuranceClaim['type'], string> = {
  hull_damage: 'Hull Damage', liability: 'Liability', property_damage: 'Property Damage',
  injury: 'Injury', theft: 'Theft', lost_drone: 'Lost Drone',
};

function daysUntil(date: string) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function InsurancePage() {
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'coi'>('policies');
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [showQuotes, setShowQuotes] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [coiForm, setCoiForm] = useState({ policyId: '', holderName: '', holderAddress: '', additionalInsured: '', purpose: '', operationDescription: '', location: '' });
  const [generatedCoi, setGeneratedCoi] = useState<CertificateOfInsurance | null>(null);
  const [claimForm, setClaimForm] = useState({ policyId: '', type: '' as InsuranceClaim['type'], incidentDate: '', description: '', amount: '' });

  const tabs = [
    { id: 'policies' as const, label: 'Policies', icon: Shield },
    { id: 'claims' as const, label: 'Claims', icon: FileText },
    { id: 'coi' as const, label: 'COI Generator', icon: FileCheck },
  ];

  const expiringPolicies = mockPolicies.filter(p => p.status === 'active' && daysUntil(p.expiryDate) <= 30 && daysUntil(p.expiryDate) > 0);

  const filteredPolicies = mockPolicies.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterProvider !== 'all' && p.provider !== filterProvider) return false;
    if (searchQuery && !p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) && !p.provider.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const claimsByStatus = {
    filed: mockClaims.filter(c => c.status === 'filed'),
    under_review: mockClaims.filter(c => c.status === 'under_review'),
    approved: mockClaims.filter(c => c.status === 'approved'),
    denied: mockClaims.filter(c => c.status === 'denied'),
    settled: mockClaims.filter(c => c.status === 'settled'),
    closed: mockClaims.filter(c => c.status === 'closed'),
  };

  const claimsStats = {
    totalFiled: mockClaims.length,
    approvedRate: Math.round((mockClaims.filter(c => ['approved', 'settled', 'closed'].includes(c.status)).length / mockClaims.length) * 100),
    totalSettled: mockClaims.reduce((acc, c) => acc + (c.settledAmount ?? 0), 0),
  };

  const providers = [...new Set(mockPolicies.map(p => p.provider))];

  function handleGenerateCoi() {
    if (!coiForm.policyId || !coiForm.holderName) return;
    const coi: CertificateOfInsurance = {
      id: `COI-${Date.now()}`, policyId: coiForm.policyId, holderName: coiForm.holderName,
      holderAddress: coiForm.holderAddress, additionalInsured: coiForm.additionalInsured || undefined,
      certificateNumber: `COI-GEN-${Date.now().toString(36).toUpperCase()}`,
      issuedDate: new Date().toISOString().slice(0, 10), purpose: coiForm.purpose,
      operationDescription: coiForm.operationDescription, location: coiForm.location,
      generatedUrl: `/coi/COI-GEN-${Date.now().toString(36).toUpperCase()}.pdf`,
    };
    setGeneratedCoi(coi);
  }

  function handleFileClaim() {
    if (!claimForm.policyId || !claimForm.type || !claimForm.description) return;
    setShowNewClaim(false);
    setClaimForm({ policyId: '', type: '' as InsuranceClaim['type'], incidentDate: '', description: '', amount: '' });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Umbrella className="h-7 w-7 text-sky-400" />
              Insurance Management
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Manage policies, claims, and certificates of insurance for your drone fleet</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuotes(true)}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium hover:bg-sky-500 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Get Quote
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 px-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ─── TAB: Policies ─────────────────────────────────────────────── */}
        {activeTab === 'policies' && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'Total Policies', value: mockStats.totalPolicies, icon: Shield, color: 'text-zinc-300' },
                { label: 'Active', value: mockStats.activePolicies, icon: ShieldCheck, color: 'text-emerald-400' },
                { label: 'Total Coverage', value: fmt(mockStats.totalCoverage), icon: Umbrella, color: 'text-sky-400' },
                { label: 'Annual Premiums', value: fmt(mockStats.totalPremiums), icon: DollarSign, color: 'text-amber-400' },
                { label: 'Open Claims', value: mockStats.openClaims, icon: FileText, color: 'text-orange-400' },
                { label: 'Expiring Soon', value: mockStats.expiringWithin30Days, icon: AlertTriangle, color: 'text-yellow-400', badge: true },
                { label: 'Covered Drones', value: mockStats.coveredDrones, icon: Plane, color: 'text-emerald-400' },
                { label: 'Uncovered', value: mockStats.uncoveredDrones, icon: AlertTriangle, color: 'text-red-400' },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={clsx('h-4 w-4', stat.color)} />
                    <span className="text-xs text-zinc-500">{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{stat.value}</span>
                    {stat.badge && mockStats.expiringWithin30Days > 0 && (
                      <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-400">!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Expiring Alert Banner */}
            {expiringPolicies.length > 0 && (
              <div className="rounded-lg border border-yellow-600/40 bg-yellow-500/10 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">Policy Expiring Soon</p>
                  {expiringPolicies.map(p => (
                    <p key={p.id} className="text-sm text-yellow-400/80 mt-1">
                      {p.provider} ({p.policyNumber}) expires in {daysUntil(p.expiryDate)} days — {p.expiryDate}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text" placeholder="Search policies..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 pl-9 pr-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-500" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
                  <option value="all">All Types</option>
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
                  <option value="all">All Providers</option>
                  {providers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Policy Cards */}
            <div className="space-y-4">
              {filteredPolicies.map(policy => {
                const expanded = expandedPolicy === policy.id;
                const daysLeft = daysUntil(policy.expiryDate);
                return (
                  <div key={policy.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <Building className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-zinc-100">{policy.provider}</h3>
                              <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-medium', statusColors[policy.status])}>
                                {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                              </span>
                              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-400">
                                {typeLabels[policy.type]}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">{policy.policyNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {policy.autoRenew && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
                              <RefreshCw className="h-3 w-3" /> Auto-Renew
                            </span>
                          )}
                          <button onClick={() => setExpandedPolicy(expanded ? null : policy.id)} className="p-1 hover:bg-zinc-800 rounded transition-colors">
                            {expanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                          </button>
                        </div>
                      </div>

                      {/* Coverage Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                        {[
                          { label: 'Hull', value: policy.coverage.hullValue },
                          { label: 'Liability', value: policy.coverage.liabilityLimit },
                          { label: 'Property Damage', value: policy.coverage.propertyDamage },
                          { label: 'Medical', value: policy.coverage.medicalPayments },
                          { label: 'Personal Injury', value: policy.coverage.personalInjury },
                          { label: 'Ground Equipment', value: policy.coverage.groundEquipment },
                        ].map(item => (
                          <div key={item.label} className="text-center">
                            <p className="text-[11px] text-zinc-500">{item.label}</p>
                            <p className={clsx('text-sm font-medium', item.value > 0 ? 'text-zinc-200' : 'text-zinc-600')}>{item.value > 0 ? fmt(item.value) : '—'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Premium & Dates */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-amber-400" />
                          <span className="font-medium">{fmt(policy.premium.amount)}</span>
                          <span className="text-zinc-500">/ {policy.premium.frequency}</span>
                          {policy.premium.paid ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">Unpaid</span>
                          )}
                        </div>
                        {policy.premium.nextPaymentDate !== 'N/A' && (
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">Next: {policy.premium.nextPaymentDate}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">{policy.effectiveDate} — {policy.expiryDate}</span>
                        </div>
                        {policy.status === 'active' && (
                          <span className={clsx('text-xs font-medium', daysLeft <= 30 ? 'text-yellow-400' : daysLeft <= 90 ? 'text-amber-400' : 'text-zinc-400')}>
                            {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                          </span>
                        )}
                      </div>

                      {/* Covered Drones preview */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Plane className="h-3.5 w-3.5 text-zinc-500" />
                        {policy.coveredDrones.slice(0, 3).map(d => (
                          <span key={d.droneId} className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">{d.droneName}</span>
                        ))}
                        {policy.coveredDrones.length > 3 && (
                          <span className="text-xs text-zinc-500">+{policy.coveredDrones.length - 3} more</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <Eye className="h-3.5 w-3.5" /> View COI
                        </button>
                        <button onClick={() => { setActiveTab('claims'); setShowNewClaim(true); }} className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <FilePlus className="h-3.5 w-3.5" /> File Claim
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <RefreshCw className="h-3.5 w-3.5" /> Renew
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      </div>
                    </div>

                    {/* Expanded Section */}
                    {expanded && (
                      <div className="border-t border-zinc-800 bg-zinc-900/30 p-5 space-y-5">
                        {/* Covered Drones */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2"><Plane className="h-4 w-4 text-sky-400" /> Covered Drones</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {policy.coveredDrones.map(d => (
                              <div key={d.droneId} className="flex items-center justify-between rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                <span className="text-sm text-zinc-300">{d.droneName}</span>
                                <span className="text-xs text-zinc-500">Hull: {fmt(d.hullValue)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Covered Pilots */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-sky-400" /> Covered Pilots</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {policy.coveredPilots.map(p => (
                              <div key={p.pilotId} className="flex items-center justify-between rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <User className="h-3.5 w-3.5 text-zinc-500" />
                                  <span className="text-sm text-zinc-300">{p.pilotName}</span>
                                </div>
                                <span className="text-xs text-zinc-500">{p.certNumber}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Exclusions */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /> Exclusions</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {policy.exclusions.map((e, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="h-1 w-1 rounded-full bg-red-400 shrink-0" />
                                {e}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Endorsements */}
                        {policy.endorsements.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2"><Award className="h-4 w-4 text-emerald-400" /> Endorsements</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {policy.endorsements.map((e, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                  <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Documents */}
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-sky-400" /> Documents</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {policy.documents.map((doc, i) => (
                              <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3.5 w-3.5 text-zinc-500" />
                                  <span className="text-sm text-zinc-300">{doc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">{doc.type.toUpperCase()}</span>
                                  <button className="text-zinc-500 hover:text-zinc-300"><Download className="h-3.5 w-3.5" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Claims History */}
                        {policy.claims.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-amber-400" /> Claims History ({policy.claims.length})</h4>
                            <div className="space-y-2">
                              {policy.claims.map(claim => (
                                <div key={claim.id} className="flex items-center justify-between rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2">
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-mono text-zinc-300">{claim.claimNumber}</span>
                                    <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-medium', claimStatusColors[claim.status])}>
                                      {claim.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                    <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">{claimTypeLabels[claim.type]}</span>
                                  </div>
                                  <span className="text-sm font-medium text-zinc-300">{fmt(claim.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quotes Panel */}
            {showQuotes && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowQuotes(false)}>
                <div className="w-full max-w-4xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6 mx-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-sky-400" /> Insurance Quotes</h2>
                    <button onClick={() => setShowQuotes(false)} className="text-zinc-500 hover:text-zinc-300"><XCircle className="h-5 w-5" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockQuotes.map(quote => (
                      <div key={quote.id} className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <Building className="h-5 w-5 text-zinc-400" />
                          <h3 className="font-semibold text-zinc-100">{quote.provider}</h3>
                        </div>
                        <div className="text-center my-3">
                          <span className="text-3xl font-bold text-sky-400">{fmt(quote.premium)}</span>
                          <span className="text-sm text-zinc-400">/yr</span>
                        </div>
                        <div className="space-y-2 mb-4 flex-1">
                          <div className="flex justify-between text-sm"><span className="text-zinc-400">Liability</span><span className="text-zinc-200">{fmt(quote.coverage.liabilityLimit)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-zinc-400">Hull</span><span className="text-zinc-200">{fmt(quote.coverage.hullValue)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-zinc-400">Property</span><span className="text-zinc-200">{fmt(quote.coverage.propertyDamage)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-zinc-400">Deductible</span><span className="text-zinc-200">{fmt(quote.deductible)}</span></div>
                        </div>
                        <ul className="mb-4 space-y-1">
                          {quote.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                              <CheckCircle className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                              {h}
                            </li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-zinc-500 mb-3">Valid until {quote.validUntil}</p>
                        <button className="w-full rounded-lg bg-sky-600 py-2 text-sm font-medium hover:bg-sky-500 transition-colors">Select</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TAB: Claims ──────────────────────────────────────────────── */}
        {activeTab === 'claims' && (
          <>
            {/* Claims Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Filed', value: claimsStats.totalFiled, icon: FileText, color: 'text-zinc-300' },
                { label: 'Approved Rate', value: `${claimsStats.approvedRate}%`, icon: CheckCircle, color: 'text-emerald-400' },
                { label: 'Avg Settlement', value: '14 days', icon: Clock, color: 'text-amber-400' },
                { label: 'Total Settled', value: fmt(claimsStats.totalSettled), icon: DollarSign, color: 'text-sky-400' },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={clsx('h-4 w-4', stat.color)} />
                    <span className="text-xs text-zinc-500">{stat.label}</span>
                  </div>
                  <span className="text-xl font-bold">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* File New Claim button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewClaim(!showNewClaim)}
                className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium hover:bg-sky-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                File New Claim
              </button>
            </div>

            {/* New Claim Form */}
            {showNewClaim && (
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FilePlus className="h-5 w-5 text-sky-400" /> File New Claim</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Policy</label>
                    <select value={claimForm.policyId} onChange={e => setClaimForm({ ...claimForm, policyId: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
                      <option value="">Select policy...</option>
                      {mockPolicies.filter(p => p.status === 'active').map(p => (
                        <option key={p.id} value={p.id}>{p.provider} — {p.policyNumber}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Claim Type</label>
                    <select value={claimForm.type} onChange={e => setClaimForm({ ...claimForm, type: e.target.value as InsuranceClaim['type'] })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
                      <option value="">Select type...</option>
                      {Object.entries(claimTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Incident Date</label>
                    <input type="date" value={claimForm.incidentDate} onChange={e => setClaimForm({ ...claimForm, incidentDate: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Estimated Amount</label>
                    <input type="number" placeholder="0.00" value={claimForm.amount} onChange={e => setClaimForm({ ...claimForm, amount: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-zinc-400 mb-1">Description</label>
                    <textarea rows={3} placeholder="Describe the incident..." value={claimForm.description} onChange={e => setClaimForm({ ...claimForm, description: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-zinc-400 mb-1">Documents</label>
                    <div className="rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-4 text-center text-sm text-zinc-500">
                      <Download className="h-5 w-5 mx-auto mb-1 rotate-180" />
                      Drag & drop files or click to upload
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setShowNewClaim(false)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">Cancel</button>
                  <button onClick={handleFileClaim} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors">Submit Claim</button>
                </div>
              </div>
            )}

            {/* Claims Pipeline / Kanban */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {(
                [
                  { key: 'filed', label: 'Filed', color: 'border-blue-500/40', dotColor: 'bg-blue-400' },
                  { key: 'under_review', label: 'Under Review', color: 'border-amber-500/40', dotColor: 'bg-amber-400' },
                  { key: 'approved', label: 'Approved', color: 'border-emerald-500/40', dotColor: 'bg-emerald-400' },
                  { key: 'denied', label: 'Denied', color: 'border-red-500/40', dotColor: 'bg-red-400' },
                  { key: 'settled', label: 'Settled', color: 'border-cyan-500/40', dotColor: 'bg-cyan-400' },
                  { key: 'closed', label: 'Closed', color: 'border-zinc-500/40', dotColor: 'bg-zinc-400' },
                ] as const
              ).map(col => (
                <div key={col.key} className={clsx('rounded-xl border-t-2 border-zinc-800 bg-zinc-900/40 p-3', col.color)}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={clsx('h-2 w-2 rounded-full', col.dotColor)} />
                    <span className="text-sm font-medium text-zinc-300">{col.label}</span>
                    <span className="ml-auto text-xs text-zinc-500">{claimsByStatus[col.key].length}</span>
                  </div>
                  <div className="space-y-2">
                    {claimsByStatus[col.key].map(claim => {
                      const isExpanded = expandedClaim === claim.id;
                      return (
                        <div key={claim.id} className="rounded-lg border border-zinc-700/50 bg-zinc-800/60 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-zinc-400">{claim.claimNumber}</span>
                            <button onClick={() => setExpandedClaim(isExpanded ? null : claim.id)} className="text-zinc-500 hover:text-zinc-300">
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400">{claimTypeLabels[claim.type]}</span>
                          <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{claim.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">{claim.incidentDate}</span>
                            <span className="text-sm font-medium text-zinc-200">{fmt(claim.amount)}</span>
                          </div>
                          {claim.settledAmount !== undefined && claim.settledAmount > 0 && (
                            <div className="mt-1 text-xs text-cyan-400">Settled: {fmt(claim.settledAmount)}</div>
                          )}

                          {isExpanded && (
                            <div className="mt-3 border-t border-zinc-700/50 pt-3 space-y-2">
                              <p className="text-xs text-zinc-400">{claim.description}</p>
                              {claim.adjuster && (
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  <User className="h-3 w-3" /> {claim.adjuster}
                                </div>
                              )}
                              {claim.relatedSafetyReport && (
                                <div className="flex items-center gap-1.5 text-xs text-sky-400 cursor-pointer hover:underline">
                                  <ExternalLink className="h-3 w-3" /> Safety Report: {claim.relatedSafetyReport}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {claim.documents.map((doc, i) => (
                                  <span key={i} className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-400 flex items-center gap-1">
                                    <FileText className="h-2.5 w-2.5" />{doc}
                                  </span>
                                ))}
                              </div>
                              <div className="text-[11px] text-zinc-500">Filed: {claim.filedDate}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {claimsByStatus[col.key].length === 0 && (
                      <p className="text-center text-xs text-zinc-600 py-4">No claims</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── TAB: COI Generator ───────────────────────────────────────── */}
        {activeTab === 'coi' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COI Form */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileCheck className="h-5 w-5 text-sky-400" /> Generate Certificate of Insurance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Policy</label>
                    <select value={coiForm.policyId} onChange={e => setCoiForm({ ...coiForm, policyId: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
                      <option value="">Select policy...</option>
                      {mockPolicies.filter(p => p.status === 'active').map(p => (
                        <option key={p.id} value={p.id}>{p.provider} — {p.policyNumber}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Certificate Holder Name</label>
                    <input type="text" placeholder="Company or individual name" value={coiForm.holderName} onChange={e => setCoiForm({ ...coiForm, holderName: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Holder Address</label>
                    <input type="text" placeholder="Full address" value={coiForm.holderAddress} onChange={e => setCoiForm({ ...coiForm, holderAddress: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Additional Insured <span className="text-zinc-600">(optional)</span></label>
                    <input type="text" placeholder="Additional insured name" value={coiForm.additionalInsured} onChange={e => setCoiForm({ ...coiForm, additionalInsured: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Purpose / Operation Description</label>
                    <textarea rows={2} placeholder="Describe the purpose of operations" value={coiForm.purpose} onChange={e => setCoiForm({ ...coiForm, purpose: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Operation Description</label>
                    <textarea rows={2} placeholder="Detailed operation description" value={coiForm.operationDescription} onChange={e => setCoiForm({ ...coiForm, operationDescription: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Location of Operations</label>
                    <input type="text" placeholder="City, State or specific location" value={coiForm.location} onChange={e => setCoiForm({ ...coiForm, location: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none" />
                  </div>
                  <button onClick={handleGenerateCoi} className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-medium hover:bg-sky-500 transition-colors flex items-center justify-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Generate COI
                  </button>
                </div>
              </div>

              {/* COI Preview */}
              <div>
                {generatedCoi ? (
                  <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2"><FileCheck className="h-5 w-5 text-emerald-400" /> Certificate Preview</h3>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"><Download className="h-3.5 w-3.5" /> Download</button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"><Mail className="h-3.5 w-3.5" /> Email</button>
                        <button className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"><Printer className="h-3.5 w-3.5" /> Print</button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-5 space-y-3">
                      <div className="text-center border-b border-zinc-700 pb-3">
                        <h4 className="text-lg font-bold text-sky-400">CERTIFICATE OF INSURANCE</h4>
                        <p className="text-xs text-zinc-500 mt-1">Certificate No: {generatedCoi.certificateNumber}</p>
                        <p className="text-xs text-zinc-500">Issued: {generatedCoi.issuedDate}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-zinc-500">Holder:</span> <span className="text-zinc-200">{generatedCoi.holderName}</span></div>
                        <div><span className="text-zinc-500">Address:</span> <span className="text-zinc-200">{generatedCoi.holderAddress}</span></div>
                        {generatedCoi.additionalInsured && (
                          <div className="col-span-2"><span className="text-zinc-500">Additional Insured:</span> <span className="text-zinc-200">{generatedCoi.additionalInsured}</span></div>
                        )}
                        <div className="col-span-2"><span className="text-zinc-500">Purpose:</span> <span className="text-zinc-200">{generatedCoi.purpose}</span></div>
                        <div className="col-span-2"><span className="text-zinc-500">Operation:</span> <span className="text-zinc-200">{generatedCoi.operationDescription}</span></div>
                        <div><span className="text-zinc-500">Location:</span> <span className="text-zinc-200">{generatedCoi.location}</span></div>
                        <div><span className="text-zinc-500">Policy:</span> <span className="text-zinc-200">{mockPolicies.find(p => p.id === generatedCoi.policyId)?.policyNumber}</span></div>
                      </div>
                      {(() => {
                        const pol = mockPolicies.find(p => p.id === generatedCoi.policyId);
                        return pol ? (
                          <div className="border-t border-zinc-700 pt-3 grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-zinc-500">Liability:</span> <span className="text-zinc-300">{fmt(pol.coverage.liabilityLimit)}</span></div>
                            <div><span className="text-zinc-500">Hull:</span> <span className="text-zinc-300">{fmt(pol.coverage.hullValue)}</span></div>
                            <div><span className="text-zinc-500">Property:</span> <span className="text-zinc-300">{fmt(pol.coverage.propertyDamage)}</span></div>
                            <div><span className="text-zinc-500">Effective:</span> <span className="text-zinc-300">{pol.effectiveDate}</span></div>
                            <div><span className="text-zinc-500">Expiry:</span> <span className="text-zinc-300">{pol.expiryDate}</span></div>
                            <div><span className="text-zinc-500">Provider:</span> <span className="text-zinc-300">{pol.provider}</span></div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-12 text-center">
                    <FileCheck className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">Fill out the form and click Generate to preview your Certificate of Insurance</p>
                  </div>
                )}
              </div>
            </div>

            {/* COI History Table */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><FileText className="h-4 w-4 text-sky-400" /> Generated Certificates History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                      <th className="text-left px-5 py-3 font-medium">Certificate #</th>
                      <th className="text-left px-5 py-3 font-medium">Policy</th>
                      <th className="text-left px-5 py-3 font-medium">Holder</th>
                      <th className="text-left px-5 py-3 font-medium">Purpose</th>
                      <th className="text-left px-5 py-3 font-medium">Location</th>
                      <th className="text-left px-5 py-3 font-medium">Issued</th>
                      <th className="text-right px-5 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCOIs.map(coi => (
                      <tr key={coi.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-zinc-300">{coi.certificateNumber}</td>
                        <td className="px-5 py-3 text-zinc-400">{mockPolicies.find(p => p.id === coi.policyId)?.policyNumber ?? coi.policyId}</td>
                        <td className="px-5 py-3">
                          <div className="text-zinc-300">{coi.holderName}</div>
                          {coi.additionalInsured && <div className="text-xs text-zinc-500">+ {coi.additionalInsured}</div>}
                        </td>
                        <td className="px-5 py-3 text-zinc-400 max-w-[200px] truncate">{coi.purpose}</td>
                        <td className="px-5 py-3 text-zinc-400">{coi.location}</td>
                        <td className="px-5 py-3 text-zinc-500">{coi.issuedDate}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-500 hover:text-zinc-300"><Download className="h-3.5 w-3.5" /></button>
                            <button className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-500 hover:text-zinc-300"><Mail className="h-3.5 w-3.5" /></button>
                            <button className="p-1.5 hover:bg-zinc-700 rounded transition-colors text-zinc-500 hover:text-zinc-300"><Eye className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
