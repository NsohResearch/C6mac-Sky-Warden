import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, ArrowUpRight, Clock, CheckCircle, AlertTriangle, XCircle, Plus, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type InvoiceStatus = 'paid' | 'pending' | 'past_due' | 'refunded' | 'draft' | 'cancelled' | 'void';

const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  past_due: { label: 'Past Due', className: 'bg-red-50 text-red-700' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
  void: { label: 'Void', className: 'bg-muted text-muted-foreground' },
};

function formatCents(cents: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export default function BillingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: subscription } = useQuery({
    queryKey: ['billing-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['billing-payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_methods').select('*').order('is_default', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: usageRecords = [] } = useQuery({
    queryKey: ['billing-usage'],
    queryFn: async () => {
      const { data, error } = await supabase.from('usage_records').select('*').order('recorded_at', { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices.filter((inv) => statusFilter === 'all' || inv.status === statusFilter);

  const planName = subscription?.plan_tier ? subscription.plan_tier.charAt(0).toUpperCase() + subscription.plan_tier.slice(1) : 'Free';
  const isTrial = subscription?.status === 'trialing';
  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan, payment methods, and invoices</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-foreground">{planName} Plan</h2>
          {isTrial && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Trial</span>}
          {subscription && <span className="text-xs text-muted-foreground">{subscription.billing_cycle} billing</span>}
        </div>
        {isTrial && trialDaysLeft > 0 && (
          <div className="mb-4 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-primary font-medium">⏰ {trialDaysLeft} days remaining in trial</p>
          </div>
        )}

        {/* Usage from records */}
        {usageRecords.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            {usageRecords.slice(0, 4).map((ur) => (
              <div key={ur.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{ur.metric.replace(/_/g, ' ')}</span>
                  <span className="font-medium tabular-nums text-foreground">{ur.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            {subscription?.next_payment_date && <>Next billing: <span className="font-medium text-foreground">{new Date(subscription.next_payment_date).toLocaleDateString()}</span> · </>}
            Amount: <span className="font-medium text-foreground">{formatCents(subscription?.monthly_amount ?? 0, subscription?.currency)}</span>/mo
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
        {paymentMethods.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No payment methods added yet.</p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {pm.type === 'card' ? <CreditCard className="h-5 w-5 text-muted-foreground" /> : <Smartphone className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  {pm.type === 'card' ? (
                    <>
                      <p className="text-sm font-medium text-foreground capitalize">{pm.card_brand} ending in {pm.card_last4}</p>
                      <p className="text-xs text-muted-foreground">Expires {pm.card_exp_month}/{pm.card_exp_year}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">{pm.mobile_provider ?? pm.type}</p>
                      <p className="text-xs text-muted-foreground">{pm.mobile_number ?? pm.account_last4}</p>
                    </>
                  )}
                </div>
                {pm.is_default && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Default</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice History */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Invoice History</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'paid', 'pending', 'past_due', 'draft'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors', statusFilter === s ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-card border-border text-muted-foreground hover:bg-accent')}>
              {s === 'all' ? 'All' : invoiceStatusConfig[s]?.label ?? s}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="pb-3 text-left font-medium text-muted-foreground">Invoice #</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Amount</th>
              <th className="pb-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No invoices found</td></tr>
              ) : filteredInvoices.map((inv) => {
                const cfg = invoiceStatusConfig[inv.status] ?? { label: inv.status, className: 'bg-muted text-muted-foreground' };
                return (
                  <tr key={inv.id} className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs text-foreground">{inv.invoice_number}</td>
                    <td className="py-3 text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-medium tabular-nums text-foreground">{formatCents(inv.total_amount, inv.currency)}</td>
                    <td className="py-3 text-center"><span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', cfg.className)}>{cfg.label}</span></td>
                    <td className="py-3 text-right"><button className="text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
