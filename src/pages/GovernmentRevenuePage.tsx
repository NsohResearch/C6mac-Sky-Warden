import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { DollarSign, Clock, Banknote, FileText, Download, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryConfig: Record<string, { label: string; className: string }> = {
  registration: { label: 'Registration', className: 'bg-blue-50 text-blue-700' },
  authorization: { label: 'Authorization', className: 'bg-emerald-50 text-emerald-700' },
  certification: { label: 'Certification', className: 'bg-purple-50 text-purple-700' },
  penalty: { label: 'Penalty', className: 'bg-red-50 text-red-700' },
};

function formatCents(cents: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export default function GovernmentRevenuePage() {
  const { profile } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [disbursedFilter, setDisbursedFilter] = useState<'all' | 'pending' | 'disbursed'>('all');

  const { data: records = [] } = useQuery({
    queryKey: ['gov-revenue-records'],
    queryFn: async () => {
      const { data, error } = await supabase.from('government_revenue_records').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: disbursements = [] } = useQuery({
    queryKey: ['gov-disbursements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('government_disbursements').select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: feeSchedules = [] } = useQuery({
    queryKey: ['fee-schedules-gov'],
    queryFn: async () => {
      const { data, error } = await supabase.from('registration_fee_schedules').select('*').eq('is_active', true).limit(10);
      if (error) throw error;
      return data;
    },
  });

  const filteredRecords = records.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (disbursedFilter === 'pending' && r.disbursed) return false;
    if (disbursedFilter === 'disbursed' && !r.disbursed) return false;
    return true;
  });

  const totals = filteredRecords.reduce((acc, r) => {
    acc.gross += r.gross_amount;
    acc.commission += r.platform_commission;
    acc.gov += r.government_amount;
    return acc;
  }, { gross: 0, commission: 0, gov: 0 });

  const totalRevenue = records.reduce((s, r) => s + r.gross_amount, 0);
  const pendingAmount = records.filter((r) => !r.disbursed).reduce((s, r) => s + r.government_amount, 0);
  const lastDisbursement = disbursements[0];

  const categoryBreakdown = ['registration', 'authorization', 'certification', 'penalty'].map((cat) => {
    const catRecords = records.filter((r) => r.category === cat);
    const amount = catRecords.reduce((s, r) => s + r.gross_amount, 0);
    return { cat: categoryConfig[cat]?.label ?? cat, amount, pct: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0 };
  }).filter((c) => c.amount > 0);

  const stats = [
    { label: 'Total Revenue Collected', value: formatCents(totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Disbursement', value: formatCents(pendingAmount), icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Last Disbursement', value: lastDisbursement ? formatCents(lastDisbursement.total_amount, lastDisbursement.currency) : '—', icon: Banknote, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Records', value: String(records.length), icon: FileText, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Government Revenue Dashboard</h1>
          <p className="text-sm text-muted-foreground">Revenue collected on behalf of regulatory authority</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xl font-bold tabular-nums text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category breakdown */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue by Category</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue records yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.cat}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.cat}</span>
                    <span className="font-medium text-foreground">{formatCents(item.amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fee Schedule */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Fee Schedule</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Read-only</span>
          </div>
          {feeSchedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fee schedule configured for your region.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-muted-foreground">Fee Type</th>
                <th className="pb-2 text-right font-medium text-muted-foreground">Amount</th>
                <th className="pb-2 text-right font-medium text-muted-foreground">Gov %</th>
              </tr></thead>
              <tbody>
                {feeSchedules.map((fee) => (
                  <tr key={fee.id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">Standard Annual</td>
                    <td className="py-2 text-right tabular-nums text-foreground">{formatCents(fee.standard_annual_fee, fee.currency)}</td>
                    <td className="py-2 text-right text-muted-foreground">{(Number(fee.government_revenue_split) * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Revenue Records */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue Records</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'registration', 'authorization', 'certification', 'penalty'].map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors', categoryFilter === c ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground hover:bg-accent')}>
              {c === 'all' ? 'All Categories' : categoryConfig[c]?.label ?? c}
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
              {filteredRecords.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No revenue records found</td></tr>
              ) : filteredRecords.map((r) => {
                const cat = categoryConfig[r.category] ?? { label: r.category, className: 'bg-muted text-muted-foreground' };
                return (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3"><span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', cat.className)}>{cat.label}</span></td>
                    <td className="py-3 text-foreground">{r.description ?? '—'}</td>
                    <td className="py-3 text-right tabular-nums font-medium text-foreground">{formatCents(r.gross_amount, r.currency)}</td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{formatCents(r.platform_commission, r.currency)}</td>
                    <td className="py-3 text-right tabular-nums font-medium text-foreground">{formatCents(r.government_amount, r.currency)}</td>
                    <td className="py-3 text-center">{r.disbursed ? <span className="text-xs text-emerald-600 font-medium">Disbursed</span> : <span className="text-xs text-amber-600 font-medium">Pending</span>}</td>
                  </tr>
                );
              })}
              {filteredRecords.length > 0 && (
                <tr className="font-semibold">
                  <td colSpan={3} className="py-3 text-foreground">Totals</td>
                  <td className="py-3 text-right tabular-nums text-foreground">{formatCents(totals.gross)}</td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground">{formatCents(totals.commission)}</td>
                  <td className="py-3 text-right tabular-nums text-foreground">{formatCents(totals.gov)}</td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disbursement History */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Disbursement History</h2>
        {disbursements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No disbursements yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {disbursements.map((d) => (
              <div key={d.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-foreground">{d.id.slice(0, 8)}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle className="h-3.5 w-3.5" /> {d.status}</span>
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground">{formatCents(d.total_amount, d.currency)}</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>{d.record_count} transactions · {d.disbursement_method.replace(/_/g, ' ')}</p>
                  {d.reference && <p>Ref: {d.reference}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
