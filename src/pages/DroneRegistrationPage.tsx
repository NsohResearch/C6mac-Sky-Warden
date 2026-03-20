import { useState } from 'react';
import { Shield, Plus, Search, CheckCircle, XCircle, AlertTriangle, Clock, ArrowRight, ArrowLeft, ClipboardCheck, QrCode, FileText, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';

type RegStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'transferred';
type TabId = 'registered' | 'temporary' | 'verify';
type PermitStatus = 'active' | 'approved' | 'under_review' | 'expired' | 'denied';

const regStatusConfig: Record<RegStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  expiring_soon: { label: 'Expiring Soon', className: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
  expired: { label: 'Expired', className: 'bg-red-50 text-red-700', icon: XCircle },
  suspended: { label: 'Suspended', className: 'bg-muted text-muted-foreground', icon: XCircle },
  transferred: { label: 'Transferred', className: 'bg-blue-50 text-blue-700', icon: ArrowRight },
};

const registrations = [
  { ddid: 'SKW-US-A7B3X9', drone: 'DJI Mavic 3 Enterprise', type: 'Commercial', status: 'active' as RegStatus, issued: '2026-01-15', expires: '2027-01-15' },
  { ddid: 'SKW-US-K9M2P4', drone: 'DJI Matrice 350 RTK', type: 'Commercial', status: 'active' as RegStatus, issued: '2026-02-01', expires: '2027-02-01' },
  { ddid: 'SKW-US-T5N8R1', drone: 'Autel EVO II Pro V3', type: 'Standard', status: 'expiring_soon' as RegStatus, issued: '2025-04-10', expires: '2026-04-10' },
  { ddid: 'SKW-US-W3J6F2', drone: 'Skydio X10', type: 'Commercial', status: 'active' as RegStatus, issued: '2026-03-01', expires: '2027-03-01' },
  { ddid: 'SKW-US-B8L4H7', drone: 'DJI Mavic 3T Thermal', type: 'Standard', status: 'expired' as RegStatus, issued: '2025-01-20', expires: '2026-01-20' },
];

const tempPermits = [
  { id: 'TMP-001', type: 'Tourist 7-Day', applicant: 'Hans Mueller', nationality: 'DE', duration: '7 days', startDate: '2026-03-15', endDate: '2026-03-22', status: 'active' as PermitStatus },
  { id: 'TMP-002', type: 'Researcher 30-Day', applicant: 'Dr. Akiko Tanaka', nationality: 'JP', duration: '30 days', startDate: '2026-03-01', endDate: '2026-03-31', status: 'active' as PermitStatus },
  { id: 'TMP-003', type: 'Event 3-Day', applicant: 'Carlos Rivera', nationality: 'MX', duration: '3 days', startDate: '2026-04-01', endDate: '2026-04-03', status: 'under_review' as PermitStatus },
];

const stats = [
  { label: 'Total Registered', value: registrations.length, icon: ClipboardCheck, color: 'bg-primary/10 text-primary' },
  { label: 'Active', value: registrations.filter((r) => r.status === 'active').length, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Expiring Soon', value: registrations.filter((r) => r.status === 'expiring_soon').length, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  { label: 'Expired', value: registrations.filter((r) => r.status === 'expired').length, icon: XCircle, color: 'bg-red-50 text-red-600' },
];

const wizardSteps = ['Select Drone', 'Registration Type', 'Owner Details', 'Review & Pay', 'Confirmation'];

export default function DroneRegistrationPage() {
  const [activeTab, setActiveTab] = useState<TabId>('registered');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null);

  const filteredRegs = registrations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.ddid.toLowerCase().includes(q) || r.drone.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Drone Registration Portal</h1>
            <p className="text-sm text-slate-300">All drones must be registered before flight — similar to vehicle registration</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">Regulatory Authority: FAA (United States)</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register button */}
      <div className="flex justify-end">
        <button onClick={() => { setShowWizard(true); setWizardStep(1); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Register a Drone
        </button>
      </div>

      {/* Registration Wizard */}
      {showWizard && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Register a Drone</h2>
            <button onClick={() => setShowWizard(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            {wizardSteps.map((label, i) => {
              const step = i + 1;
              const isActive = wizardStep === step;
              const isDone = wizardStep > step;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold', isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    {isDone ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  <span className={cn('text-xs whitespace-nowrap', isActive ? 'text-foreground font-medium' : 'text-muted-foreground')}>{label}</span>
                  {i < wizardSteps.length - 1 && <div className="h-px w-6 bg-border" />}
                </div>
              );
            })}
          </div>

          {/* Step content placeholders */}
          {wizardStep === 1 && <div className="space-y-4"><label className="text-sm font-medium text-foreground">Select from Fleet</label><select className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"><option>-- Select unregistered drone --</option><option>DJI Mini 4 Pro (S/N: 1ZNBJ4P00C0092)</option><option>Autel EVO Max 4T (S/N: 7YBRX4T00FN018)</option></select></div>}
          {wizardStep === 2 && <div className="grid gap-3 sm:grid-cols-2">{['Standard', 'Commercial', 'Government', 'Educational'].map((t) => (<button key={t} className="rounded-lg border border-border p-4 text-left hover:border-primary transition-colors"><p className="text-sm font-semibold text-foreground">{t}</p><p className="text-xs text-muted-foreground mt-1">{t === 'Standard' ? 'Recreational and personal use' : t === 'Commercial' ? 'Part 107 commercial operations' : t === 'Government' ? 'Government (fee waived)' : 'Educational institutions (reduced fee)'}</p></button>))}</div>}
          {wizardStep === 3 && <div className="space-y-4 max-w-lg"><input className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Full Name" /><input className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Email" /><input className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Mailing Address" /></div>}
          {wizardStep === 4 && <div className="rounded-lg border border-border p-4 max-w-md"><h3 className="text-sm font-semibold text-foreground mb-3">Fee Breakdown</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Registration Fee</span><span className="font-medium text-foreground">$5.00</span></div><div className="flex justify-between text-xs text-muted-foreground"><span>Government Portion (70%)</span><span>$3.50</span></div><div className="flex justify-between text-xs text-muted-foreground"><span>Platform Processing (30%)</span><span>$1.50</span></div><div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground"><span>Total</span><span>$5.00</span></div></div></div>}
          {wizardStep === 5 && <div className="text-center py-8"><CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" /><h3 className="text-lg font-semibold text-foreground">Registration Complete</h3><p className="text-sm text-muted-foreground mt-1">Your drone has been successfully registered</p><div className="mt-4 inline-block rounded-lg bg-muted p-4"><p className="text-xs text-muted-foreground">Digital Drone ID</p><p className="text-xl font-bold font-mono text-foreground">SKW-US-A7B3X9</p></div></div>}

          {/* Navigation */}
          {wizardStep < 5 && (
            <div className="flex justify-between mt-6">
              <button onClick={() => wizardStep > 1 && setWizardStep(wizardStep - 1)} disabled={wizardStep === 1} className={cn('flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors', wizardStep === 1 ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground hover:bg-accent border border-border')}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => setWizardStep(wizardStep + 1)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {wizardStep === 4 ? 'Pay & Register' : 'Continue'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
          {wizardStep === 5 && (
            <div className="flex justify-center mt-6">
              <button onClick={() => setShowWizard(false)} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Done</button>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {([{ id: 'registered' as TabId, label: 'Registered Drones' }, { id: 'temporary' as TabId, label: 'Temporary Permits' }, { id: 'verify' as TabId, label: 'Verify Registration' }]).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('pb-3 text-sm font-medium border-b-2 transition-colors', activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>{tab.label}</button>
        ))}
      </div>

      {/* Registered Drones Tab */}
      {activeTab === 'registered' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Drone ID or model..." className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'expiring_soon', 'expired'] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={cn('rounded-lg px-3 py-2 text-xs font-medium border transition-colors', statusFilter === s ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground hover:bg-accent')}>{s === 'all' ? 'All' : regStatusConfig[s]?.label ?? s}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Digital Drone ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Drone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issued</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expires</th>
              </tr></thead>
              <tbody>
                {filteredRegs.map((reg) => {
                  const cfg = regStatusConfig[reg.status];
                  return (
                    <tr key={reg.ddid} className="border-b border-border/50 hover:bg-accent/50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{reg.ddid}</td>
                      <td className="px-4 py-3 text-foreground">{reg.drone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.type}</td>
                      <td className="px-4 py-3 text-center"><span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.className)}>{cfg.label}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.issued}</td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.expires}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredRegs.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No registrations match your filters</p>}
          </div>
        </div>
      )}

      {/* Temporary Permits */}
      {activeTab === 'temporary' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Temporary permits for tourists, researchers, and non-resident operators</p>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permit ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applicant</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>
                {tempPermits.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{p.id}</td>
                    <td className="px-4 py-3 text-foreground">{p.type}</td>
                    <td className="px-4 py-3"><span className="text-foreground">{p.applicant}</span><span className="ml-2 text-xs text-muted-foreground">({p.nationality})</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.startDate} — {p.endDate}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={p.status === 'active' ? 'active' : p.status === 'under_review' ? 'pending' : p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verify Registration */}
      {activeTab === 'verify' && (
        <div className="max-w-md mx-auto text-center py-8">
          <Globe className="mx-auto h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Public Verification Portal</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Enter a Digital Drone ID or Verification Code to verify registration status</p>
          <div className="flex gap-2">
            <input value={verifyCode} onChange={(e) => { setVerifyCode(e.target.value); setVerifyResult(null); }} placeholder="SKW-US-XXXXXX or V-XXXXXX" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <button onClick={() => setVerifyResult(verifyCode.toUpperCase().startsWith('V-') || verifyCode.toUpperCase().startsWith('SKW-') ? 'valid' : 'invalid')} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Verify</button>
          </div>
          {verifyResult === 'valid' && <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle className="inline h-4 w-4 mr-1" /> Registration is valid and active</div>}
          {verifyResult === 'invalid' && <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"><XCircle className="inline h-4 w-4 mr-1" /> No registration found for this code</div>}
        </div>
      )}
    </div>
  );
}
