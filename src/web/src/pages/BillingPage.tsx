import { useState } from 'react';
import {
  CreditCard, ArrowUpRight, Clock, CheckCircle, AlertTriangle,
  XCircle, Plus, Download, Eye, Filter, Search, ChevronDown,
  Smartphone, Landmark, X, Wallet,
} from 'lucide-react';
import { clsx } from 'clsx';

type InvoiceStatus = 'paid' | 'pending' | 'past_due' | 'refunded';
type PaymentMethodType = 'card' | 'bank' | 'mobile_money';
type ModalView = null | 'add_payment' | 'upgrade';

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  paid: { label: 'Paid', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  pending: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  past_due: { label: 'Past Due', bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
  refunded: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle },
};

const currentPlan = {
  name: 'Professional',
  tier: 'pro',
  status: 'trialing' as const,
  billingCycle: 'monthly' as const,
  nextBillingDate: '2026-04-01',
  amountDue: '$49.00',
  trialDaysRemaining: 7,
  usage: {
    drones: { used: 8, limit: 15 },
    pilots: { used: 3, limit: 5 },
    missions: { used: 47, limit: -1 },
    storage: { used: 4.2, limit: 10 },
  },
};

const paymentMethods = [
  { id: 'pm-1', type: 'card' as PaymentMethodType, brand: 'visa', last4: '4242', expiry: '12/27', isDefault: true },
  { id: 'pm-2', type: 'card' as PaymentMethodType, brand: 'mastercard', last4: '8888', expiry: '06/28', isDefault: false },
  { id: 'pm-3', type: 'mobile_money' as PaymentMethodType, provider: 'M-Pesa', number: '+254***789', isDefault: false },
];

const invoices = [
  {
    id: 'SKW-INV-2026-000042',
    date: '2026-03-01',
    description: 'Professional Plan — March 2026',
    amount: '$49.00',
    status: 'paid' as InvoiceStatus,
    lineItems: [
      { desc: 'Pro Subscription', amount: '$49.00', recipient: 'platform' },
      { desc: 'Drone Registration (DRN-008)', amount: '$5.00', recipient: 'government' },
    ],
  },
  {
    id: 'SKW-INV-2026-000038',
    date: '2026-02-01',
    description: 'Professional Plan — February 2026',
    amount: '$49.00',
    status: 'paid' as InvoiceStatus,
    lineItems: [
      { desc: 'Pro Subscription', amount: '$49.00', recipient: 'platform' },
    ],
  },
  {
    id: 'SKW-INV-2026-000035',
    date: '2026-01-15',
    description: 'Drone Registration x2',
    amount: '$10.00',
    status: 'paid' as InvoiceStatus,
    lineItems: [
      { desc: 'Drone Registration (DRN-006)', amount: '$5.00', recipient: 'government' },
      { desc: 'Drone Registration (DRN-007)', amount: '$5.00', recipient: 'government' },
    ],
  },
  {
    id: 'SKW-INV-2026-000030',
    date: '2026-01-01',
    description: 'Professional Plan — January 2026',
    amount: '$49.00',
    status: 'paid' as InvoiceStatus,
    lineItems: [
      { desc: 'Pro Subscription', amount: '$49.00', recipient: 'platform' },
    ],
  },
  {
    id: 'SKW-INV-2025-000128',
    date: '2025-12-01',
    description: 'Professional Plan — December 2025',
    amount: '$49.00',
    status: 'refunded' as InvoiceStatus,
    lineItems: [
      { desc: 'Pro Subscription', amount: '$49.00', recipient: 'platform' },
    ],
  },
];

const govRevenueSummary = {
  feesCollected: '$1,245.00',
  platformFees: '$373.50',
  pendingDisbursement: '$871.50',
};

const statusBadge = (status: 'active' | 'trialing' | 'past_due') => {
  const cfg = {
    active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700' },
    trialing: { label: 'Trial', bg: 'bg-blue-50', text: 'text-blue-700' },
    past_due: { label: 'Past Due', bg: 'bg-red-50', text: 'text-red-700' },
  };
  const c = cfg[status];
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', c.bg, c.text)}>
      {c.label}
    </span>
  );
};

export function BillingPage() {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalView>(null);
  const [paymentTab, setPaymentTab] = useState<PaymentMethodType>('card');

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your plan, payment methods, and invoices</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">{currentPlan.name} Plan</h2>
              {statusBadge(currentPlan.status)}
              <span className="text-xs text-gray-400 capitalize">{currentPlan.billingCycle} billing</span>
            </div>

            {currentPlan.status === 'trialing' && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mt-2">
                <Clock size={12} />
                {currentPlan.trialDaysRemaining} days remaining in trial
              </div>
            )}

            {/* Usage meters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              {[
                { label: 'Drones', ...currentPlan.usage.drones, unit: '' },
                { label: 'Pilots', ...currentPlan.usage.pilots, unit: '' },
                { label: 'Missions', ...currentPlan.usage.missions, unit: '' },
                { label: 'Storage', ...currentPlan.usage.storage, unit: ' GB' },
              ].map((meter) => {
                const limitLabel = meter.limit === -1 ? '\u221E' : `${meter.limit}${meter.unit}`;
                const pct = meter.limit === -1 ? 15 : (meter.used / meter.limit) * 100;
                return (
                  <div key={meter.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">{meter.label}</span>
                      <span className="font-medium text-gray-700">{meter.used}{meter.unit} / {limitLabel}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className={clsx(
                          'h-2 rounded-full transition-all',
                          pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <span>Next billing: {currentPlan.nextBillingDate}</span>
              <span className="text-gray-300">|</span>
              <span>Amount due: {currentPlan.amountDue}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <button
              onClick={() => setModal('upgrade')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <ArrowUpRight size={16} />
              Upgrade Plan
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <CreditCard size={16} />
              Manage Payment
            </button>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-1">
              Cancel Plan
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Payment Methods</h2>
          <button
            onClick={() => setModal('add_payment')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Plus size={14} />
            Add Payment Method
          </button>
        </div>
        <div className="divide-y">
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                {pm.type === 'card' ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                    <CreditCard size={20} className="text-gray-600" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <Smartphone size={20} className="text-green-600" />
                  </div>
                )}
                <div>
                  {pm.type === 'card' ? (
                    <>
                      <p className="text-sm font-medium text-gray-900 capitalize">{pm.brand} ending in {pm.last4}</p>
                      <p className="text-xs text-gray-500">Expires {pm.expiry}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">{pm.provider}</p>
                      <p className="text-xs text-gray-500">{pm.number}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pm.isDefault && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    Default
                  </span>
                )}
                <button className="text-xs text-gray-500 hover:text-gray-700">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Invoice History</h2>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap px-5 py-3 border-b">
          {(['all', 'paid', 'pending', 'past_due', 'refunded'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors',
                statusFilter === s
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {s === 'all' ? 'All' : invoiceStatusConfig[s].label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Invoice #</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Description</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((inv) => {
                const cfg = invoiceStatusConfig[inv.status];
                const StatusIcon = cfg.icon;
                const isExpanded = expandedInvoice === inv.id;
                return (
                  <>
                    <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}>
                      <td className="px-5 py-3 font-mono text-xs font-medium text-gray-900">{inv.id}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{inv.date}</td>
                      <td className="px-5 py-3 text-gray-700">{inv.description}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{inv.amount}</td>
                      <td className="px-5 py-3">
                        <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-gray-400 hover:text-blue-600" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-blue-600" title="Download PDF">
                            <Download size={16} />
                          </button>
                          <ChevronDown size={14} className={clsx('text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${inv.id}-details`}>
                        <td colSpan={6} className="px-5 py-3 bg-gray-50">
                          <div className="space-y-1">
                            {inv.lineItems.map((li, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700">{li.desc}</span>
                                  <span className={clsx(
                                    'inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                    li.recipient === 'government' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                                  )}>
                                    {li.recipient === 'government' ? 'Gov Revenue' : 'Platform'}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">{li.amount}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <CreditCard size={32} className="mb-2" />
            <p className="text-sm">No invoices match your filters</p>
          </div>
        )}
      </div>

      {/* Government Revenue Summary — agency persona only */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <Landmark size={18} />
            Revenue Summary
          </h2>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Agency View
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs text-green-600">Government Fees Collected</p>
            <p className="text-xl font-bold text-green-700 mt-1">{govRevenueSummary.feesCollected}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs text-blue-600">Platform Fees</p>
            <p className="text-xl font-bold text-blue-700 mt-1">{govRevenueSummary.platformFees}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-xs text-amber-600">Pending Disbursement</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{govRevenueSummary.pendingDisbursement}</p>
          </div>
        </div>
        <div className="border-t px-5 py-3">
          <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
            View Government Revenue Report
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {modal === 'add_payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-semibold text-gray-900">Add Payment Method</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b px-5">
              {([
                { id: 'card' as PaymentMethodType, label: 'Card', icon: CreditCard },
                { id: 'bank' as PaymentMethodType, label: 'Bank Transfer', icon: Landmark },
                { id: 'mobile_money' as PaymentMethodType, label: 'Mobile Money', icon: Smartphone },
              ]).map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPaymentTab(tab.id)}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors',
                      paymentTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <TabIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-5 space-y-4">
              {paymentTab === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                      <input type="text" placeholder="123" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </>
              )}
              {paymentTab === 'bank' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" placeholder="Bank of America" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" placeholder="Account number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                    <input type="text" placeholder="Routing number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </>
              )}
              {paymentTab === 'mobile_money' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>M-Pesa</option>
                      <option>MTN Mobile Money</option>
                      <option>Airtel Money</option>
                      <option>Orange Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" placeholder="+254 7XX XXX XXX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 border-t px-5 py-4">
              <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Add Payment Method
              </button>
              <button onClick={() => setModal(null)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
