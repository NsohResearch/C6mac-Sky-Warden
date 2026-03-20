import { useState } from 'react';
import {
  Shield, Plus, Search, Filter, Clock, CheckCircle,
  XCircle, AlertTriangle, MapPin, Calendar, ArrowUpRight,
  Eye, Download, RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

type LaancStatus = 'auto_approved' | 'pending_review' | 'denied' | 'expired' | 'rescinded';

const statusConfig: Record<LaancStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  auto_approved: { label: 'Auto-Approved', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  pending_review: { label: 'Pending Review', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  denied: { label: 'Denied', bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  expired: { label: 'Expired', bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
  rescinded: { label: 'Rescinded', bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertTriangle },
};

const statsCards = [
  { label: 'Total Authorizations', value: 48, icon: Shield, color: 'bg-blue-50 text-blue-600' },
  { label: 'Auto-Approved', value: 39, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { label: 'Pending Review', value: 4, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Denied', value: 5, icon: XCircle, color: 'bg-red-50 text-red-600' },
];

const authorizations = [
  { id: 'LAANC-2026-0142', operationType: 'Part 107', area: 'Class C — SFO', altitude: '200 ft AGL', status: 'auto_approved' as LaancStatus, requestedAt: '2026-03-20 08:15', expiresAt: '2026-03-20 18:00', pilot: 'James Park' },
  { id: 'LAANC-2026-0141', operationType: 'Part 107', area: 'Class B — LAX', altitude: '100 ft AGL', status: 'pending_review' as LaancStatus, requestedAt: '2026-03-20 07:30', expiresAt: '—', pilot: 'Maria Santos' },
  { id: 'LAANC-2026-0140', operationType: 'Part 107 Waiver', area: 'Class D — SJC', altitude: '300 ft AGL', status: 'auto_approved' as LaancStatus, requestedAt: '2026-03-19 14:00', expiresAt: '2026-03-19 22:00', pilot: 'Alex Turner' },
  { id: 'LAANC-2026-0139', operationType: 'Part 107', area: 'Class E — OAK Surface', altitude: '350 ft AGL', status: 'denied' as LaancStatus, requestedAt: '2026-03-19 10:00', expiresAt: '—', pilot: 'Sarah Chen' },
  { id: 'LAANC-2026-0138', operationType: 'Part 107', area: 'Class C — SEA', altitude: '150 ft AGL', status: 'auto_approved' as LaancStatus, requestedAt: '2026-03-18 16:00', expiresAt: '2026-03-19 04:00', pilot: 'James Park' },
  { id: 'LAANC-2026-0137', operationType: 'Part 107', area: 'Class D — PAO', altitude: '200 ft AGL', status: 'expired' as LaancStatus, requestedAt: '2026-03-17 09:00', expiresAt: '2026-03-17 17:00', pilot: 'Maria Santos' },
];

export function LaancPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LaancStatus | 'all'>('all');

  const filtered = authorizations.filter((auth) => {
    if (statusFilter !== 'all' && auth.status !== statusFilter) return false;
    if (search && !auth.id.toLowerCase().includes(search.toLowerCase()) && !auth.area.toLowerCase().includes(search.toLowerCase()) && !auth.pilot.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LAANC Authorizations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Low Altitude Authorization and Notification Capability requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New LAANC Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', card.color)}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New LAANC form */}
      {showForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New LAANC Authorization Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Part 107</option>
                <option>Part 107 Waiver</option>
                <option>Public COA</option>
                <option>Recreational (TRUST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airspace Area</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search airport or location..."
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Altitude (ft AGL)</label>
              <input
                type="number"
                placeholder="200"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation Date &amp; Time</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
              <input
                type="number"
                placeholder="4"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilot</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>James Park</option>
                <option>Maria Santos</option>
                <option>Alex Turner</option>
                <option>Sarah Chen</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              <Shield size={16} />
              Submit LAANC Request
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, area, or pilot..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'auto_approved', 'pending_review', 'denied', 'expired'] as const).map((s) => (
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
              {s === 'all' ? 'All' : statusConfig[s].label}
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
                <th className="px-5 py-3 text-left font-medium text-gray-500">Authorization ID</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Airspace</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Altitude</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Pilot</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Requested</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Expires</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((auth) => {
                const cfg = statusConfig[auth.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={auth.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-gray-900">{auth.id}</td>
                    <td className="px-5 py-3 text-gray-700">{auth.operationType}</td>
                    <td className="px-5 py-3 text-gray-700">{auth.area}</td>
                    <td className="px-5 py-3 text-gray-700">{auth.altitude}</td>
                    <td className="px-5 py-3 text-gray-700">{auth.pilot}</td>
                    <td className="px-5 py-3">
                      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{auth.requestedAt}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{auth.expiresAt}</td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-gray-400 hover:text-blue-600" title="View details">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Shield size={32} className="mb-2" />
            <p className="text-sm">No authorizations match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
