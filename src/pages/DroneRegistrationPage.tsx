import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Shield, Plus, Search, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft, ClipboardCheck, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const regStatusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  pending_payment: { label: 'Pending Payment', className: 'bg-amber-50 text-amber-700' },
  pending_review: { label: 'Under Review', className: 'bg-amber-50 text-amber-700' },
  expired: { label: 'Expired', className: 'bg-red-50 text-red-700' },
  suspended: { label: 'Suspended', className: 'bg-muted text-muted-foreground' },
  revoked: { label: 'Revoked', className: 'bg-red-50 text-red-700' },
  transferred: { label: 'Transferred', className: 'bg-blue-50 text-blue-700' },
};

type TabId = 'registered' | 'temporary' | 'verify';

export default function DroneRegistrationPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('registered');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<'valid' | 'invalid' | null>(null);
  const [selectedDroneId, setSelectedDroneId] = useState('');
  const [regType, setRegType] = useState('standard');
  const [ownerForm, setOwnerForm] = useState({ name: '', email: '', address: '' });

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['drone-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('drone_registrations').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: unregDrones = [] } = useQuery({
    queryKey: ['unregistered-drones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('drones').select('id, manufacturer, model, serial_number').limit(100);
      if (error) throw error;
      const regDroneIds = new Set(registrations.map((r) => r.drone_id));
      return (data ?? []).filter((d) => !regDroneIds.has(d.id));
    },
    enabled: registrations.length >= 0,
  });

  const { data: permits = [] } = useQuery({
    queryKey: ['temp-permits'],
    queryFn: async () => {
      const { data, error } = await supabase.from('temporary_permits').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: feeSchedules = [] } = useQuery({
    queryKey: ['fee-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('registration_fee_schedules').select('*').eq('is_active', true).limit(10);
      if (error) throw error;
      return data;
    },
  });

  const createRegistration = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id || !selectedDroneId) throw new Error("Missing data");
      const drone = unregDrones.find((d) => d.id === selectedDroneId);
      if (!drone) throw new Error("Drone not found");
      const fee = feeSchedules[0];
      const regFee = regType === 'commercial' ? (fee?.commercial_annual_fee ?? 500) : (fee?.standard_annual_fee ?? 500);
      const govSplit = fee?.government_revenue_split ?? 0.725;
      const { error } = await supabase.from('drone_registrations').insert([{
        tenant_id: profile.tenant_id,
        drone_id: selectedDroneId,
        owner_id: profile.id,
        owner_name: ownerForm.name || profile.display_name,
        owner_email: ownerForm.email || profile.email,
        owner_address: { street: ownerForm.address },
        manufacturer: drone.manufacturer,
        model: drone.model,
        serial_number: drone.serial_number,
        category: regType,
        registration_type: (regType === 'commercial' ? 'commercial' : 'standard') as any,
        registration_fee: regFee,
        government_portion_fee: Math.round(regFee * govSplit),
        platform_portion_fee: Math.round(regFee * (1 - govSplit)),
        region: (profile.region || 'US') as any,
        status: 'pending_payment' as any,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drone-registrations'] });
      setWizardStep(5);
      toast.success("Registration submitted!");
    },
    onError: (e) => toast.error(e.message),
  });

  const doVerify = async () => {
    const code = verifyCode.trim().toUpperCase();
    const { data } = await supabase.from('drone_registrations').select('id, status, digital_drone_id')
      .or(`digital_drone_id.eq.${code},verification_code.eq.${code}`)
      .eq('publicly_verifiable', true)
      .maybeSingle();
    setVerifyResult(data ? 'valid' : 'invalid');
  };

  const filteredRegs = registrations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.digital_drone_id?.toLowerCase().includes(q)) || r.manufacturer.toLowerCase().includes(q) || r.model.toLowerCase().includes(q);
    }
    return true;
  });

  const activeCount = registrations.filter((r) => r.status === 'active').length;
  const expiredCount = registrations.filter((r) => r.status === 'expired').length;

  const stats = [
    { label: 'Total Registered', value: registrations.length, icon: ClipboardCheck, color: 'bg-primary/10 text-primary' },
    { label: 'Active', value: activeCount, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending', value: registrations.filter((r) => r.status === 'pending_payment' || r.status === 'pending_review').length, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
    { label: 'Expired', value: expiredCount, icon: XCircle, color: 'bg-red-50 text-red-600' },
  ];

  const wizardSteps = ['Select Drone', 'Registration Type', 'Owner Details', 'Review & Pay', 'Confirmation'];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Drone Registration Portal</h1>
            <p className="text-sm text-slate-300">All drones must be registered before flight</p>
          </div>
        </div>
      </div>

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

          {wizardStep === 1 && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">Select from Fleet</label>
              {unregDrones.length === 0 ? (
                <p className="text-sm text-muted-foreground">All drones are already registered, or no drones in fleet.</p>
              ) : (
                <select value={selectedDroneId} onChange={(e) => setSelectedDroneId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                  <option value="">-- Select unregistered drone --</option>
                  {unregDrones.map((d) => <option key={d.id} value={d.id}>{d.manufacturer} {d.model} (S/N: {d.serial_number})</option>)}
                </select>
              )}
            </div>
          )}
          {wizardStep === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {['standard', 'commercial', 'government', 'educational'].map((t) => (
                <button key={t} onClick={() => setRegType(t)} className={cn("rounded-lg border p-4 text-left transition-colors", regType === t ? "border-primary bg-primary/5" : "border-border hover:border-primary")}>
                  <p className="text-sm font-semibold text-foreground capitalize">{t}</p>
                </button>
              ))}
            </div>
          )}
          {wizardStep === 3 && (
            <div className="space-y-4 max-w-lg">
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Full Name" value={ownerForm.name} onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })} />
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Email" value={ownerForm.email} onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} />
              <input className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Mailing Address" value={ownerForm.address} onChange={(e) => setOwnerForm({ ...ownerForm, address: e.target.value })} />
            </div>
          )}
          {wizardStep === 4 && (
            <div className="rounded-lg border border-border p-4 max-w-md">
              <h3 className="text-sm font-semibold text-foreground mb-3">Fee Breakdown</h3>
              {feeSchedules[0] ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Registration Fee</span><span className="font-medium text-foreground">${((regType === 'commercial' ? feeSchedules[0].commercial_annual_fee : feeSchedules[0].standard_annual_fee) / 100).toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Government ({(feeSchedules[0].government_revenue_split * 100).toFixed(0)}%)</span></div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Platform ({(feeSchedules[0].platform_revenue_split * 100).toFixed(0)}%)</span></div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Fee schedule not configured for your region.</p>
              )}
            </div>
          )}
          {wizardStep === 5 && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Registration Submitted</h3>
              <p className="text-sm text-muted-foreground mt-1">Your drone registration is pending payment.</p>
            </div>
          )}

          {wizardStep < 5 && (
            <div className="flex justify-between mt-6">
              <button onClick={() => wizardStep > 1 && setWizardStep(wizardStep - 1)} disabled={wizardStep === 1} className={cn('flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors', wizardStep === 1 ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground hover:bg-accent border border-border')}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button onClick={() => wizardStep === 4 ? createRegistration.mutate() : setWizardStep(wizardStep + 1)} disabled={wizardStep === 1 && !selectedDroneId} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {wizardStep === 4 ? (createRegistration.isPending ? 'Submitting…' : 'Pay & Register') : 'Continue'} <ArrowRight className="h-4 w-4" />
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

      {activeTab === 'registered' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Drone ID or model..." className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'pending_payment', 'expired'].map((s) => (
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
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">Loading…</td></tr>
                ) : filteredRegs.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No registrations found</td></tr>
                ) : filteredRegs.map((reg) => {
                  const cfg = regStatusConfig[reg.status] ?? { label: reg.status, className: 'bg-muted text-muted-foreground' };
                  return (
                    <tr key={reg.id} className="border-b border-border/50 hover:bg-accent/50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{reg.digital_drone_id ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground">{reg.manufacturer} {reg.model}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{reg.registration_type}</td>
                      <td className="px-4 py-3 text-center"><span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.className)}>{cfg.label}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.issued_at ? new Date(reg.issued_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.expires_at ? new Date(reg.expires_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'temporary' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Temporary permits for tourists, researchers, and non-resident operators</p>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permit Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applicant</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>
                {permits.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">No temporary permits</td></tr>
                ) : permits.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="px-4 py-3 text-foreground capitalize">{p.permit_type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3"><span className="text-foreground">{p.applicant_name}</span>{p.applicant_nationality && <span className="ml-2 text-xs text-muted-foreground">({p.applicant_nationality})</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.start_date} — {p.end_date}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={p.status === 'active' ? 'active' : p.status === 'approved' ? 'approved' : p.status === 'expired' ? 'warning' : p.status === 'denied' ? 'denied' : 'pending'}>
                        {p.status.replace(/_/g, ' ')}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="max-w-md mx-auto text-center py-8">
          <Globe className="mx-auto h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Public Verification Portal</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Enter a Digital Drone ID or Verification Code</p>
          <div className="flex gap-2">
            <input value={verifyCode} onChange={(e) => { setVerifyCode(e.target.value); setVerifyResult(null); }} placeholder="SKW-US-XXXXXX or V-XXXXXX" className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <button onClick={doVerify} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Verify</button>
          </div>
          {verifyResult === 'valid' && <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle className="inline h-4 w-4 mr-1" /> Registration is valid and active</div>}
          {verifyResult === 'invalid' && <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"><XCircle className="inline h-4 w-4 mr-1" /> No registration found for this code</div>}
        </div>
      )}
    </div>
  );
}
