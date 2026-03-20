import { useState } from 'react';
import { Landmark, DollarSign, Clock, CheckCircle, AlertTriangle, Download, Banknote, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type RevenueCategory = 'registration' | 'authorization' | 'certification' | 'penalty';
type DisbursementStatus = 'completed' | 'pending' | 'processing';

const categoryConfig: Record<RevenueCategory, { label: string; className: string }> = {
  registration: { label: 'Registration', className: 'bg-blue-50 text-blue-700' },
  authorization: { label: 'Authorization', className: 'bg-emerald-50 text-emerald-700' },
  certification: { label: 'Certification', className: 'bg-purple-50 text-purple-700' },
  penalty: { label: 'Penalty', className: 'bg-red-50 text-red-700' },
};

const stats = [
  { label: 'Total Revenue Collected', value: '$12,450.00', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Pending Disbursement', value: '$3,215.00', icon: Clock, color: 'bg-amber-50 text-amber-600' },
  { label: 'Last Disbursement', value: '$8,320.00', subtext: 'Mar 1, 2026', icon: Banknote, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Registrations', value: '1,247', icon: FileText, color: 'bg-purple-50 text-purple-600' },
];

const revenueRecords = [
  { id: 'REV-001', date: '2026-03-20', category: 'registration' as RevenueCategory, description: 'Drone Registration — SKW-US-A7B3X9', gross: '$5.00', commission: '$1.50', govAmount: '$3.50', disbursed: false },
  { id: 'REV-002', date: '2026-03-19', category: 'authorization' as RevenueCategory, description: 'LAANC Authorization — LAANC-2026-0142', gross: '$2.00', commission: '$0.60', govAmount: '$1.40', disbursed: false },
  { id: 'REV-003', date: '2026-03-18', category: 'registration' as RevenueCategory, description: 'Drone Registration — SKW-US-K9M2P4', gross: '$5.00', commission: '$1.50', govAmount: '$3.50', disbursed: false },
  { id: 'REV-004', date: '2026-03-17', category: 'certification' as RevenueCategory, description: 'Part 107 Certification Verification', gross: '$10.00', commission: '$3.00', govAmount: '$7.00', disbursed: false },
  { id: 'REV-005', date: '2026-03-15', category: 'penalty' as RevenueCategory, description: 'Late Registration Renewal Penalty', gross: '$1.25', commission: '$0.38', govAmount: '$0.87', disbursed: false },
  { id: 'REV-006', date: '2026-03-10', category: 'registration' as RevenueCategory, description: 'Drone Registration x3 (batch)', gross: '$15.00', commission: '$4.50', govAmount: '$10.50', disbursed: true },
  { id: 'REV-007', date: '2026-03-05', category: 'authorization' as RevenueCategory, description: 'LAANC Authorization x12 (batch)', gross: '$24.00', commission: '$7.20', govAmount: '$16.80', disbursed: true },
];

const disbursements = [
  { id: 'DSB-006', period: 'Feb 16 - Mar 1, 2026', amount: '$8,320.00', records: 142, status: 'completed' as DisbursementStatus, method: 'ACH', reference: 'ACH-2026-03-001' },
  { id: 'DSB-005', period: 'Feb 1 - Feb 15, 2026', amount: '$6,840.00', records: 118, status: 'completed' as DisbursementStatus, method: 'ACH', reference: 'ACH-2026-02-015' },
  { id: 'DSB-004', period: 'Jan 16 - Jan 31, 2026', amount: '$7,150.00', records: 124, status: 'completed' as DisbursementStatus, method: 'Wire', reference: 'WIRE-2026-02-001' },
];

const feeSchedule = [
  { type: 'Standard Annual', fee: '$5.00', govSplit: '70%', platformSplit: '30%' },
  { type: 'Commercial Annual', fee: '$5.00', govSplit: '70%', platformSplit: '30%' },
  { type: 'Government', fee: 'Waived', govSplit: '—', platformSplit: '—' },
  { type: 'Educational', fee: 'Waived', govSplit: '—', platformSplit: '—' },
  { type: 'Tourist 7-Day Permit', fee: '$15.00', govSplit: '70%', platformSplit: '30%' },
  { type: 'Researcher 30-Day Permit', fee: '$25.00', govSplit: '70%', platformSplit: '30%' },
  { type: 'Temp Operator 90-Day', fee: '$50.00', govSplit: '70%', platformSplit: '30%' },
  { type: 'Event Permit (per day)', fee: '$10.00', govSplit: '70%', platformSplit: '30%' },
];

const categoryBreakdown = [
  { cat: 'Registration Fees', amount: '$8,450.00', pct: 68, color: 'bg-blue-500' },
  { cat: 'Authorization Fees', amount: '$2,680.00', pct: 22, color: 'bg-emerald-500' },
  { cat: 'Certification Fees', amount: '$960.00', pct: 8, color: 'bg-purple-500' },
  { cat: 'Penalties', amount: '$360.00', pct: 2, color: 'bg-red-500' },
];

export default function GovernmentRevenuePage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [disbursedFilter, setDisbursedFilter] = useState<'all' | 'pending' | 'disbursed'>('all');

  const filteredRecords = revenueRecords.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (disbursedFilter === 'pending' && r.disbursed) return false;
    if (disbursedFilter === 'disbursed' && !r.disbursed) return false;
    return true;
  });

  const totals = filteredRecords.reduce((acc, r) => {
    acc.gross += parseFloat(r.gross.replace('$', ''));
    acc.commission += parseFloat(r.commission.replace('$', ''));
    acc.gov += parseFloat(r.govAmount.replace('$', ''));
    return acc;
  }, { gross: 0, commission: 0, gov: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Government Revenue Dashboard</h1>
          <p className="text-sm text-muted-foreground">Revenue collected on behalf of Federal Aviation Administration (FAA)</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xl font-bold tabular-nums text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.subtext && <p className="text-xs text-muted-foreground">{stat.subtext}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue by Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue by Category</h2>
          <div className="space-y-3">
            {categoryBreakdown.map((item) => (
              <div key={item.cat}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.cat}</span>
                  <span className="font-medium text-foreground">{item.amount}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full', item.color)} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Schedule */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Fee Schedule — United States (FAA)</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Read-only</span>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="pb-2 text-left font-medium text-muted-foreground">Fee Type</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Amount</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Gov</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">Platform</th>
            </tr></thead>
            <tbody>
              {feeSchedule.map((fee) => (
                <tr key={fee.type} className="border-b border-border/50">
                  <td className="py-2 text-foreground">{fee.type}</td>
                  <td className="py-2 text-right tabular-nums text-foreground">{fee.fee}</td>
                  <td className="py-2 text-right text-muted-foreground">{fee.govSplit}</td>
                  <td className="py-2 text-right text-muted-foreground">{fee.platformSplit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Records */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue Records</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'registration', 'authorization', 'certification', 'penalty'] as const).map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors', categoryFilter === c ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground hover:bg-accent')}>
              {c === 'all' ? 'All Categories' : categoryConfig[c].label}
            </button>
          ))}
          <div className="w-px bg-border mx-1" />
          {(['all', 'pending', 'disbursed'] as const).map((d) => (
            <button key={d} onClick={() => setDisbursedFilter(d)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors', disbursedFilter === d ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground hover:bg-accent')}>
              {d === 'all' ? 'All Status' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Description</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Gross</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Platform Fee</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Gov Amount</th>
              <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>
              {filteredRecords.map((r) => {
                const cat = categoryConfig[r.category];
                return (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 text-muted-foreground">{r.date}</td>
                    <td className="py-3"><span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', cat.className)}>{cat.label}</span></td>
                    <td className="py-3 text-foreground">{r.description}</td>
                    <td className="py-3 text-right tabular-nums font-medium text-foreground">{r.gross}</td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{r.commission}</td>
                    <td className="py-3 text-right tabular-nums font-medium text-foreground">{r.govAmount}</td>
                    <td className="py-3 text-center">{r.disbursed ? <span className="text-xs text-emerald-600 font-medium">Disbursed</span> : <span className="text-xs text-amber-600 font-medium">Pending</span>}</td>
                  </tr>
                );
              })}
              <tr className="font-semibold">
                <td colSpan={3} className="py-3 text-foreground">Totals</td>
                <td className="py-3 text-right tabular-nums text-foreground">${totals.gross.toFixed(2)}</td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">${totals.commission.toFixed(2)}</td>
                <td className="py-3 text-right tabular-nums text-foreground">${totals.gov.toFixed(2)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Disbursement History */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Disbursement History</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {disbursements.map((d) => (
            <div key={d.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-foreground">{d.id}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle className="h-3.5 w-3.5" /> {d.status === 'completed' ? 'Disbursed' : d.status}</span>
              </div>
              <p className="text-xl font-bold tabular-nums text-foreground">{d.amount}</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>Period: {d.period}</p>
                <p>{d.records} transactions · {d.method}</p>
                <p>Ref: {d.reference}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
