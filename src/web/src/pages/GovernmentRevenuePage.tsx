import { useState } from 'react';
import {
  Landmark, DollarSign, Clock, CheckCircle, AlertTriangle,
  Search, Filter, Download, Eye, ArrowUpRight, X,
  BarChart3, TrendingUp, Calendar, FileText, Banknote,
} from 'lucide-react';
import { clsx } from 'clsx';

type RevenueCategory = 'registration' | 'authorization' | 'certification' | 'penalty';
type DisbursementStatus = 'completed' | 'pending' | 'processing';

const categoryConfig: Record<RevenueCategory, { label: string; bg: string; text: string }> = {
  registration: { label: 'Registration', bg: 'bg-blue-50', text: 'text-blue-700' },
  authorization: { label: 'Authorization', bg: 'bg-green-50', text: 'text-green-700' },
  certification: { label: 'Certification', bg: 'bg-purple-50', text: 'text-purple-700' },
  penalty: { label: 'Penalty', bg: 'bg-red-50', text: 'text-red-700' },
};

const disbursementStatusConfig: Record<DisbursementStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  completed: { label: 'Disbursed', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  pending: { label: 'Pending', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  processing: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
};

const stats = [
  { label: 'Total Revenue Collected', value: '$12,450.00', icon: DollarSign, color: 'bg-green-50 text-green-600' },
  { label: 'Pending Disbursement', value: '$3,215.00', icon: Clock, color: 'bg-amber-50 text-amber-600' },
  { label: 'Last Disbursement', value: '$8,320.00', subtext: 'Mar 1, 2026', icon: Banknote, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Registrations', value: '1,247', icon: FileText, color: 'bg-purple-50 text-purple-600' },
];

const revenueRecords = [
  { id: 'REV-001', date: '2026-03-20', category: 'registration' as RevenueCategory, description: 'Drone Registration — SKW-US-A7B3X9', gross: '$5.00', commission: '$1.50', govAmount: '$3.50', disbursed: false },
  { id: 'REV-002', date: '2026-03-19', category: 'authorization' as RevenueCategory, description: 'LAANC Authorization — LAANC-2026-0142', gross: '$2.00', commission: '$0.60', govAmount: '$1.40', disbursed: false },
  { id: 'REV-003', date: '2026-03-18', category: 'registration' as RevenueCategory, description: 'Drone Registration — SKW-US-K9M2P4', gross: '$5.00', commission: '$1.50', govAmount: '$3.50', disbursed: false },
  { id: 'REV-004', date: '2026-03-17', category: 'certification' as RevenueCategory, description: 'Part 107 Certification Verification', gross: '$10.00', commission: '$3.00', govAmount: '$7.00', disbursed: false },
  { id: 'REV-005', date: '2026-03-15', category: 'penalty' as RevenueCategory, description: 'Late Registration Renewal Penalty — SKW-US-B8L4H7', gross: '$1.25', commission: '$0.38', govAmount: '$0.87', disbursed: false },
  { id: 'REV-006', date: '2026-03-10', category: 'registration' as RevenueCategory, description: 'Drone Registration x3 (batch)', gross: '$15.00', commission: '$4.50', govAmount: '$10.50', disbursed: true },
  { id: 'REV-007', date: '2026-03-05', category: 'authorization' as RevenueCategory, description: 'LAANC Authorization x12 (batch)', gross: '$24.00', commission: '$7.20', govAmount: '$16.80', disbursed: true },
  { id: 'REV-008', date: '2026-02-28', category: 'registration' as RevenueCategory, description: 'Drone Registration x8 (batch)', gross: '$40.00', commission: '$12.00', govAmount: '$28.00', disbursed: true },
];

const monthlyBreakdown = [
  { month: 'Oct', registration: 820, authorization: 340, certification: 120, penalty: 45 },
  { month: 'Nov', registration: 950, authorization: 410, certification: 150, penalty: 30 },
  { month: 'Dec', registration: 780, authorization: 290, certification: 90, penalty: 60 },
  { month: 'Jan', registration: 1100, authorization: 520, certification: 200, penalty: 25 },
  { month: 'Feb', registration: 1250, authorization: 580, certification: 180, penalty: 35 },
  { month: 'Mar', registration: 1400, authorization: 650, certification: 220, penalty: 50 },
];

const disbursements = [
  { id: 'DSB-006', period: 'Feb 16 - Mar 1, 2026', amount: '$8,320.00', records: 142, status: 'completed' as DisbursementStatus, method: 'ACH', reference: 'ACH-2026-03-001' },
  { id: 'DSB-005', period: 'Feb 1 - Feb 15, 2026', amount: '$6,840.00', records: 118, status: 'completed' as DisbursementStatus, method: 'ACH', reference: 'ACH-2026-02-015' },
  { id: 'DSB-004', period: 'Jan 16 - Jan 31, 2026', amount: '$7,150.00', records: 124, status: 'completed' as DisbursementStatus, method: 'Wire', reference: 'WIRE-2026-02-001' },
  { id: 'DSB-003', period: 'Jan 1 - Jan 15, 2026', amount: '$5,920.00', records: 98, status: 'completed' as DisbursementStatus, method: 'ACH', reference: 'ACH-2026-01-015' },
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
  { type: 'Transfer Fee', fee: '$5.00', govSplit: '70%', platformSplit: '30%' },
  { type: 'Replacement Certificate', fee: '$2.00', govSplit: '70%', platformSplit: '30%' },
];

export function GovernmentRevenuePage() {
  const [categoryFilter, setCategoryFilter] = useState<RevenueCategory | 'all'>('all');
  const [disbursedFilter, setDisbursedFilter] = useState<'all' | 'pending' | 'disbursed'>('all');
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);

  const filteredRecords = revenueRecords.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (disbursedFilter === 'pending' && r.disbursed) return false;
    if (disbursedFilter === 'disbursed' && !r.disbursed) return false;
    return true;
  });

  const totals = filteredRecords.reduce(
    (acc, r) => {
      const gross = parseFloat(r.gross.replace('$', ''));
      const comm = parseFloat(r.commission.replace('$', ''));
      const gov = parseFloat(r.govAmount.replace('$', ''));
      acc.gross += gross;
      acc.commission += comm;
      acc.gov += gov;
      return acc;
    },
    { gross: 0, commission: 0, gov: 0 }
  );

  const maxBarValue = Math.max(...monthlyBreakdown.map((m) => m.registration + m.authorization + m.certification + m.penalty));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Government Revenue Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Revenue collected on behalf of Federal Aviation Administration (FAA)</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            Export Report
          </button>
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
                  {stat.subtext && <p className="text-xs text-gray-400">{stat.subtext}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <BarChart3 size={18} />
              Revenue by Category
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {([
              { cat: 'Registration Fees', amount: '$8,450.00', pct: 68, color: 'bg-blue-500' },
              { cat: 'Authorization Fees', amount: '$2,680.00', pct: 22, color: 'bg-green-500' },
              { cat: 'Certification Fees', amount: '$960.00', pct: 8, color: 'bg-purple-500' },
              { cat: 'Penalties', amount: '$360.00', pct: 2, color: 'bg-red-500' },
            ]).map((item) => (
              <div key={item.cat}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.cat}</span>
                  <span className="font-medium text-gray-900">{item.amount}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className={clsx('h-2 rounded-full', item.color)} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly bar chart mockup */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <TrendingUp size={18} />
              Monthly Revenue Trend
            </h2>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-3 h-48">
              {monthlyBreakdown.map((m) => {
                const total = m.registration + m.authorization + m.certification + m.penalty;
                const height = (total / maxBarValue) * 100;
                const regH = (m.registration / total) * height;
                const authH = (m.authorization / total) * height;
                const certH = (m.certification / total) * height;
                const penH = (m.penalty / total) * height;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden" style={{ height: `${height}%` }}>
                      <div className="bg-blue-500" style={{ height: `${regH}%` }} />
                      <div className="bg-green-500" style={{ height: `${authH}%` }} />
                      <div className="bg-purple-500" style={{ height: `${certH}%` }} />
                      <div className="bg-red-500" style={{ height: `${penH}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">{m.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />Registration</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Authorization</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" />Certification</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Penalties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Records Table */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Revenue Records</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 py-3 border-b">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'registration', 'authorization', 'certification', 'penalty'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors',
                  categoryFilter === c
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {c === 'all' ? 'All Categories' : categoryConfig[c].label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'disbursed'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDisbursedFilter(d)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors',
                  disbursedFilter === d
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {d === 'all' ? 'All Status' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Description</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Gross</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Platform Fee</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Gov Amount</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRecords.map((r) => {
                const cat = categoryConfig[r.category];
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500 text-xs">{r.date}</td>
                    <td className="px-5 py-3">
                      <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cat.bg, cat.text)}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 text-xs">{r.description}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{r.gross}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{r.commission}</td>
                    <td className="px-5 py-3 text-right font-medium text-green-700">{r.govAmount}</td>
                    <td className="px-5 py-3">
                      {r.disbursed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle size={12} />
                          Disbursed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 bg-gray-50 font-semibold">
                <td className="px-5 py-3 text-gray-900" colSpan={3}>Totals</td>
                <td className="px-5 py-3 text-right text-gray-900">${totals.gross.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-gray-500">${totals.commission.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-green-700">${totals.gov.toFixed(2)}</td>
                <td className="px-5 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Disbursement History */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Disbursement History</h2>
          <button
            onClick={() => setShowDisbursementModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <Banknote size={14} />
            Request Disbursement
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {disbursements.map((d) => {
            const cfg = disbursementStatusConfig[d.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={d.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400">{d.id}</span>
                  <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">{d.amount}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <p className="text-gray-400">Period</p>
                    <p className="font-medium text-gray-700">{d.period}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Records</p>
                    <p className="font-medium text-gray-700">{d.records} transactions</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Method</p>
                    <p className="font-medium text-gray-700">{d.method}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Reference</p>
                    <p className="font-mono font-medium text-gray-700 text-[10px]">{d.reference}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fee Schedule */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Fee Schedule — United States (FAA)</h2>
          <span className="text-xs text-gray-400">Read-only</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Fee Type</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Government Split</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Platform Split</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {feeSchedule.map((fee) => (
                <tr key={fee.type} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{fee.type}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{fee.fee}</td>
                  <td className="px-5 py-3 text-right text-green-700 font-medium">{fee.govSplit}</td>
                  <td className="px-5 py-3 text-right text-blue-700 font-medium">{fee.platformSplit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disbursement Request Modal */}
      {showDisbursementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-semibold text-gray-900">Request Disbursement</h3>
              <button onClick={() => setShowDisbursementModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Mar 2 - Mar 20, 2026</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount Pending</span>
                  <span className="font-bold text-gray-900">$3,215.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of Records</span>
                  <span className="font-medium text-gray-700">5 transactions</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disbursement Method</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>ACH Transfer</option>
                  <option>Wire Transfer</option>
                  <option>EFT</option>
                  <option>Mobile Money</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t px-5 py-4">
              <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Confirm Disbursement Request
              </button>
              <button onClick={() => setShowDisbursementModal(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
