import { useState } from 'react';
import { CreditCard, ArrowUpRight, Clock, CheckCircle, AlertTriangle, XCircle, Plus, Download, Smartphone, Landmark, X, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatCard from '@/components/StatCard';

type InvoiceStatus = 'paid' | 'pending' | 'past_due' | 'refunded';

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700', icon: Clock },
  past_due: { label: 'Past Due', className: 'bg-red-50 text-red-700', icon: AlertTriangle },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground', icon: XCircle },
};

const currentPlan = {
  name: 'Professional', tier: 'pro', status: 'trialing' as const, billingCycle: 'monthly' as const,
  nextBillingDate: '2026-04-01', amountDue: '$49.00', trialDaysRemaining: 7,
  usage: { drones: { used: 8, limit: 15 }, pilots: { used: 3, limit: 5 }, missions: { used: 47, limit: -1 }, storage: { used: 4.2, limit: 10 } },
};

const paymentMethods = [
  { id: 'pm-1', type: 'card' as const, brand: 'visa', last4: '4242', expiry: '12/27', isDefault: true },
  { id: 'pm-2', type: 'card' as const, brand: 'mastercard', last4: '8888', expiry: '06/28', isDefault: false },
  { id: 'pm-3', type: 'mobile_money' as const, provider: 'M-Pesa', number: '+254***789', isDefault: false },
];

const invoices = [
  { id: 'SKW-INV-2026-000042', date: '2026-03-01', description: 'Professional Plan — March 2026', amount: '$49.00', status: 'paid' as InvoiceStatus },
  { id: 'SKW-INV-2026-000038', date: '2026-02-01', description: 'Professional Plan — February 2026', amount: '$49.00', status: 'paid' as InvoiceStatus },
  { id: 'SKW-INV-2026-000035', date: '2026-01-15', description: 'Drone Registration x2', amount: '$10.00', status: 'paid' as InvoiceStatus },
  { id: 'SKW-INV-2026-000030', date: '2026-01-01', description: 'Professional Plan — January 2026', amount: '$49.00', status: 'paid' as InvoiceStatus },
  { id: 'SKW-INV-2025-000128', date: '2025-12-01', description: 'Professional Plan — December 2025', amount: '$49.00', status: 'refunded' as InvoiceStatus },
];

export default function BillingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter((inv) => statusFilter === 'all' || inv.status === statusFilter);

  const meters = [
    { label: 'Drones', ...currentPlan.usage.drones, unit: '' },
    { label: 'Pilots', ...currentPlan.usage.pilots, unit: '' },
    { label: 'Missions', ...currentPlan.usage.missions, unit: '' },
    { label: 'Storage', ...currentPlan.usage.storage, unit: ' GB' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan, payment methods, and invoices</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">{currentPlan.name} Plan</h2>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Trial</span>
          <span className="text-xs text-muted-foreground">{currentPlan.billingCycle} billing</span>
        </div>
        {currentPlan.status === 'trialing' && (
          <div className="mb-4 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-primary font-medium">⏰ {currentPlan.trialDaysRemaining} days remaining in trial</p>
          </div>
        )}

        {/* Usage meters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          {meters.map((meter) => {
            const limitLabel = meter.limit === -1 ? '∞' : `${meter.limit}${meter.unit}`;
            const pct = meter.limit === -1 ? 15 : (meter.used / meter.limit) * 100;
            return (
              <div key={meter.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{meter.label}</span>
                  <span className="font-medium tabular-nums text-foreground">{meter.used}{meter.unit} / {limitLabel}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', pct > 90 ? 'bg-destructive' : pct > 70 ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            Next billing: <span className="font-medium text-foreground">{currentPlan.nextBillingDate}</span> · Amount due: <span className="font-medium text-foreground">{currentPlan.amountDue}</span>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <ArrowUpRight className="h-4 w-4" /> Upgrade Plan
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Payment Methods</h2>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> Add Payment Method
          </button>
        </div>
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {pm.type === 'card' ? <CreditCard className="h-5 w-5 text-muted-foreground" /> : <Smartphone className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                {pm.type === 'card' ? (
                  <>
                    <p className="text-sm font-medium text-foreground capitalize">{pm.brand} ending in {pm.last4}</p>
                    <p className="text-xs text-muted-foreground">Expires {pm.expiry}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">{pm.provider}</p>
                    <p className="text-xs text-muted-foreground">{pm.number}</p>
                  </>
                )}
              </div>
              {pm.isDefault && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Default</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Invoice History</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'paid', 'pending', 'past_due', 'refunded'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors', statusFilter === s ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground hover:bg-accent')}>
              {s === 'all' ? 'All' : invoiceStatusConfig[s as InvoiceStatus]?.label ?? s}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="pb-3 text-left font-medium text-muted-foreground">Invoice #</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Description</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
              <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const cfg = invoiceStatusConfig[inv.status];
                return (
                  <tr key={inv.id} className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs text-foreground">{inv.id}</td>
                    <td className="py-3 text-muted-foreground">{inv.date}</td>
                    <td className="py-3 text-foreground">{inv.description}</td>
                    <td className="py-3 text-right font-medium tabular-nums text-foreground">{inv.amount}</td>
                    <td className="py-3 text-center"><span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.className)}>{cfg.label}</span></td>
                    <td className="py-3 text-right"><button className="text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No invoices match your filters</p>}
        </div>
      </div>
    </div>
  );
}
