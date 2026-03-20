import { useState } from 'react';
import {
  Shield, Plus, Search, CheckCircle, XCircle, AlertTriangle,
  Clock, Eye, Download, ArrowRight, ArrowLeft, ClipboardCheck,
  QrCode, FileText, Upload, ChevronDown, RefreshCw, ExternalLink,
  Globe, User, Plane,
} from 'lucide-react';
import { clsx } from 'clsx';

type RegStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'transferred';
type WizardStep = 1 | 2 | 3 | 4 | 5;
type TabId = 'registered' | 'temporary' | 'verify';
type PermitStatus = 'active' | 'approved' | 'under_review' | 'expired' | 'denied';

const regStatusConfig: Record<RegStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  expiring_soon: { label: 'Expiring Soon', bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertTriangle },
  expired: { label: 'Expired', bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  suspended: { label: 'Suspended', bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle },
  transferred: { label: 'Transferred', bg: 'bg-blue-50', text: 'text-blue-700', icon: ArrowRight },
};

const permitStatusConfig: Record<PermitStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700' },
  approved: { label: 'Approved', bg: 'bg-blue-50', text: 'text-blue-700' },
  under_review: { label: 'Under Review', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  expired: { label: 'Expired', bg: 'bg-gray-100', text: 'text-gray-600' },
  denied: { label: 'Denied', bg: 'bg-red-50', text: 'text-red-700' },
};

const registrations = [
  { ddid: 'SKW-US-A7B3X9', drone: 'DJI Mavic 3 Enterprise', type: 'Commercial', status: 'active' as RegStatus, issued: '2026-01-15', expires: '2027-01-15', regNumber: 'SKW-US-2026-A7B3X9' },
  { ddid: 'SKW-US-K9M2P4', drone: 'DJI Matrice 350 RTK', type: 'Commercial', status: 'active' as RegStatus, issued: '2026-02-01', expires: '2027-02-01', regNumber: 'SKW-US-2026-K9M2P4' },
  { ddid: 'SKW-US-T5N8R1', drone: 'Autel EVO II Pro V3', type: 'Standard', status: 'expiring_soon' as RegStatus, issued: '2025-04-10', expires: '2026-04-10', regNumber: 'SKW-US-2025-T5N8R1' },
  { ddid: 'SKW-US-W3J6F2', drone: 'Skydio X10', type: 'Commercial', status: 'active' as RegStatus, issued: '2026-03-01', expires: '2027-03-01', regNumber: 'SKW-US-2026-W3J6F2' },
  { ddid: 'SKW-US-B8L4H7', drone: 'DJI Mavic 3T Thermal', type: 'Standard', status: 'expired' as RegStatus, issued: '2025-01-20', expires: '2026-01-20', regNumber: 'SKW-US-2025-B8L4H7' },
  { ddid: 'SKW-US-C2D9V5', drone: 'DJI Phantom 4 RTK', type: 'Standard', status: 'transferred' as RegStatus, issued: '2024-06-01', expires: '2025-06-01', regNumber: 'SKW-US-2024-C2D9V5' },
];

const tempPermits = [
  { id: 'TMP-001', type: 'Tourist 7-Day', applicant: 'Hans Mueller', nationality: 'DE', duration: '7 days', startDate: '2026-03-15', endDate: '2026-03-22', status: 'active' as PermitStatus },
  { id: 'TMP-002', type: 'Researcher 30-Day', applicant: 'Dr. Akiko Tanaka', nationality: 'JP', duration: '30 days', startDate: '2026-03-01', endDate: '2026-03-31', status: 'active' as PermitStatus },
  { id: 'TMP-003', type: 'Event 3-Day', applicant: 'Carlos Rivera', nationality: 'MX', duration: '3 days', startDate: '2026-04-01', endDate: '2026-04-03', status: 'under_review' as PermitStatus },
  { id: 'TMP-004', type: 'Temp Operator 90-Day', applicant: 'Sarah Williams', nationality: 'GB', duration: '90 days', startDate: '2025-12-01', endDate: '2026-02-28', status: 'expired' as PermitStatus },
];

const stats = [
  { label: 'Total Registered', value: registrations.length, icon: ClipboardCheck, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active', value: registrations.filter((r) => r.status === 'active').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { label: 'Expiring Soon', value: registrations.filter((r) => r.status === 'expiring_soon').length, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  { label: 'Expired', value: registrations.filter((r) => r.status === 'expired').length, icon: XCircle, color: 'bg-red-50 text-red-600' },
];

const wizardSteps = ['Select Drone', 'Registration Type', 'Owner Details', 'Review & Pay', 'Confirmation'];

const documentChecklist = [
  { label: 'Valid Passport Copy', required: true },
  { label: 'Drone Insurance Certificate', required: true },
  { label: 'Pilot License / Certificate', required: true },
  { label: 'Organization Letter (if applicable)', required: false },
  { label: 'Research Proposal (researchers only)', required: false },
];

export function DroneRegistrationPage() {
  const [activeTab, setActiveTab] = useState<TabId>('registered');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegStatus | 'all'>('all');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null);
  const [showPermitForm, setShowPermitForm] = useState(false);

  const filteredRegs = registrations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.ddid.toLowerCase().includes(q) || r.drone.toLowerCase().includes(q);
    }
    return true;
  });

  const handleVerify = () => {
    if (verifyCode.toUpperCase().startsWith('V-') || verifyCode.toUpperCase().startsWith('SKW-')) {
      setVerifyResult('valid');
    } else {
      setVerifyResult('invalid');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} />
          <div>
            <h1 className="text-2xl font-bold">Drone Registration Portal</h1>
            <p className="text-sm text-blue-100">All drones must be registered before flight — similar to vehicle registration</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
          <Globe size={12} />
          Regulatory Authority: FAA (United States)
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
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

      {/* Register button */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => { setShowWizard(true); setWizardStep(1); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Register a Drone
        </button>
      </div>

      {/* Registration Wizard */}
      {showWizard && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Register a Drone</h2>
            <button onClick={() => setShowWizard(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle size={20} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {wizardSteps.map((label, i) => {
              const step = (i + 1) as WizardStep;
              const isActive = wizardStep === step;
              const isDone = wizardStep > step;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0',
                    isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  )}>
                    {isDone ? <CheckCircle size={14} /> : step}
                  </div>
                  <span className={clsx('text-xs font-medium hidden lg:block', isActive ? 'text-gray-900' : 'text-gray-400')}>{label}</span>
                  {i < wizardSteps.length - 1 && <div className="flex-1 h-px bg-gray-200 hidden lg:block" />}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select from Fleet</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>-- Select unregistered drone --</option>
                  <option>DJI Mini 4 Pro (S/N: 1ZNBJ4P00C0092)</option>
                  <option>Autel EVO Max 4T (S/N: 7YBRX4T00FN018)</option>
                </select>
              </div>
              <p className="text-xs text-gray-400 text-center">or</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input type="text" placeholder="e.g. DJI" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input type="text" placeholder="e.g. Mavic 3 Enterprise" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input type="text" placeholder="Manufacturer serial" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
                  <input type="number" placeholder="e.g. 895" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Type</label>
              {(['Standard', 'Commercial', 'Government', 'Educational'] as const).map((type) => (
                <label key={type} className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="regType" defaultChecked={type === 'Standard'} className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{type}</p>
                    <p className="text-xs text-gray-500">
                      {type === 'Standard' && 'Recreational and personal use'}
                      {type === 'Commercial' && 'Part 107 commercial operations'}
                      {type === 'Government' && 'Government and public safety (fee waived)'}
                      {type === 'Educational' && 'Educational institutions (reduced fee)'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {wizardStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" defaultValue="James Park" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" defaultValue="james.park@company.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Address</label>
                <input type="text" defaultValue="123 Aviation Blvd, San Francisco, CA 94105" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Driver's License</option>
                  <option>Passport</option>
                  <option>National ID</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input type="text" placeholder="ID number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Fee Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Fee</span>
                    <span className="font-medium text-gray-900">$5.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 pl-4">Government Portion (70%)</span>
                    <span className="text-gray-500">$3.50</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 pl-4">Platform Processing (30%)</span>
                    <span className="text-gray-500">$1.50</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">$5.00</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-amber-50 border-amber-200 p-3">
                <p className="text-xs text-amber-700">
                  70% of your registration fee ($3.50) is remitted to the FAA to support airspace safety and regulatory oversight.
                </p>
              </div>
            </div>
          )}

          {wizardStep === 5 && (
            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Registration Complete</h3>
                <p className="text-sm text-gray-500 mt-1">Your drone has been successfully registered</p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-4 max-w-sm mx-auto">
                <p className="text-xs text-gray-500 mb-1">Digital Drone ID</p>
                <p className="text-2xl font-bold font-mono text-blue-600">SKW-US-A7B3X9</p>
                <p className="text-xs text-gray-500 mt-2 mb-1">Registration Number</p>
                <p className="text-sm font-mono text-gray-700">SKW-US-2026-A7B3X9</p>
                <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 mx-auto">
                  <QrCode size={40} className="text-gray-300" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">QR Code</p>
              </div>
              <button className="flex items-center gap-2 mx-auto rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download size={16} />
                Download Certificate
              </button>
            </div>
          )}

          {/* Navigation */}
          {wizardStep < 5 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => wizardStep > 1 && setWizardStep((wizardStep - 1) as WizardStep)}
                disabled={wizardStep === 1}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  wizardStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                )}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={() => setWizardStep((wizardStep + 1) as WizardStep)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {wizardStep === 4 ? 'Pay & Register' : 'Continue'}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          {wizardStep === 5 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowWizard(false)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {([
            { id: 'registered' as TabId, label: 'Registered Drones' },
            { id: 'temporary' as TabId, label: 'Temporary Permits' },
            { id: 'verify' as TabId, label: 'Verify Registration' },
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

      {/* Registered Drones Tab */}
      {activeTab === 'registered' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Drone ID or model..."
                className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'expiring_soon', 'expired', 'suspended', 'transferred'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={clsx(
                    'rounded-lg px-3 py-2 text-xs font-medium border transition-colors',
                    statusFilter === s
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {s === 'all' ? 'All' : regStatusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Digital Drone ID</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Drone</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Issued</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Expires</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRegs.map((reg) => {
                    const cfg = regStatusConfig[reg.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={reg.ddid} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900">{reg.ddid}</td>
                        <td className="px-5 py-3 text-gray-700">{reg.drone}</td>
                        <td className="px-5 py-3 text-gray-600">{reg.type}</td>
                        <td className="px-5 py-3">
                          <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                            <StatusIcon size={12} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{reg.issued}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{reg.expires}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="text-gray-400 hover:text-blue-600" title="View Certificate">
                              <FileText size={16} />
                            </button>
                            <button className="text-gray-400 hover:text-green-600" title="Renew">
                              <RefreshCw size={16} />
                            </button>
                            <button className="text-gray-400 hover:text-purple-600" title="Transfer">
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredRegs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ClipboardCheck size={32} className="mb-2" />
                <p className="text-sm">No registrations match your filters</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Temporary Permits Tab */}
      {activeTab === 'temporary' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Temporary permits for tourists, researchers, and non-resident operators</p>
            <button
              onClick={() => setShowPermitForm(!showPermitForm)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Apply for Temporary Permit
            </button>
          </div>

          {/* Permit form */}
          {showPermitForm && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Temporary Permit Application</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permit Type</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Tourist Pass (7 days) — $15.00</option>
                    <option>Researcher Permit (30 days) — $25.00</option>
                    <option>Temporary Operator (90 days) — $50.00</option>
                    <option>Event Permit (1-3 days) — $10.00/day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" placeholder="Legal name as on passport" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" placeholder="applicant@email.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" placeholder="+1 555 000 0000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input type="text" placeholder="e.g. Germany" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                  <input type="text" placeholder="Passport number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Operation</label>
                  <input type="text" placeholder="e.g. Aerial photography for tourism" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description of Planned Operations</label>
                  <textarea rows={3} placeholder="Describe your planned drone operations..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Locations</label>
                  <input type="text" placeholder="e.g. San Francisco Bay Area, Golden Gate Park" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                {/* Document checklist */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
                  <div className="space-y-2">
                    {documentChecklist.map((doc) => (
                      <div key={doc.label} className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 p-3">
                        <div className="flex items-center gap-2">
                          <Upload size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{doc.label}</span>
                          {doc.required && <span className="text-[10px] text-red-500 font-medium">Required</span>}
                        </div>
                        <button className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50">
                          Upload
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  <Plane size={16} />
                  Submit Application
                </button>
                <button onClick={() => setShowPermitForm(false)} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Permit cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tempPermits.map((permit) => {
              const cfg = permitStatusConfig[permit.status];
              return (
                <div key={permit.id} className="rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                        {cfg.label}
                      </span>
                      <span className="ml-2 inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                        {permit.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{permit.id}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{permit.applicant}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">{permit.nationality}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="font-medium text-gray-700">{permit.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Start</p>
                      <p className="font-medium text-gray-700">{permit.startDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">End</p>
                      <p className="font-medium text-gray-700">{permit.endDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Verify Registration Tab */}
      {activeTab === 'verify' && (
        <div className="max-w-lg mx-auto">
          <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
            <Shield size={40} className="mx-auto text-blue-600 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Verify a Drone Registration</h2>
            <p className="text-sm text-gray-500 mb-6">Enter a verification code (V-XXXXXX) or Digital Drone ID (SKW-XX-XXXXXX)</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => { setVerifyCode(e.target.value); setVerifyResult(null); }}
                placeholder="V-A7B3X9 or SKW-US-A7B3X9"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleVerify}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Verify
              </button>
            </div>

            {verifyResult === 'valid' && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Valid Registration</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Digital Drone ID</p>
                    <p className="font-mono font-bold text-gray-900">SKW-US-A7B3X9</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Active</span>
                  </div>
                  <div>
                    <p className="text-gray-500">Drone</p>
                    <p className="font-medium text-gray-700">DJI Mavic 3 Enterprise</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Expires</p>
                    <p className="font-medium text-gray-700">2027-01-15</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium text-gray-700">Commercial</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Authority</p>
                    <p className="font-medium text-gray-700">FAA</p>
                  </div>
                </div>
              </div>
            )}

            {verifyResult === 'invalid' && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <XCircle size={20} className="text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Invalid or Expired Registration</span>
                </div>
                <p className="text-xs text-red-600 mt-1">No valid registration found for this code. Please check the code and try again.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
