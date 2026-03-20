import { useState } from 'react';
import {
  BarChart3, TrendingUp, Clock, Plane, Shield,
  Users, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Calendar, Download, Filter,
} from 'lucide-react';
import { clsx } from 'clsx';

// Note: In production, these would use Recharts components.
// Here we show a tabular/visual representation with placeholder chart areas.

const kpiCards = [
  { label: 'Total Flight Hours', value: '1,247', change: '+12%', trend: 'up' as const, period: 'vs last month', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { label: 'Missions Completed', value: '186', change: '+8%', trend: 'up' as const, period: 'vs last month', icon: Plane, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'LAANC Approval Rate', value: '92%', change: '+3%', trend: 'up' as const, period: 'vs last month', icon: Shield, color: 'bg-purple-50 text-purple-600' },
  { label: 'Safety Incidents', value: '2', change: '-1', trend: 'down' as const, period: 'vs last month', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
];

const flightHoursTrend = [
  { month: 'Oct', hours: 89 },
  { month: 'Nov', hours: 102 },
  { month: 'Dec', hours: 78 },
  { month: 'Jan', hours: 115 },
  { month: 'Feb', hours: 134 },
  { month: 'Mar', hours: 148 },
];

const missionsByType = [
  { type: 'Infrastructure Inspection', count: 52, pct: 28 },
  { type: 'Aerial Mapping', count: 38, pct: 20 },
  { type: 'Agriculture', count: 31, pct: 17 },
  { type: 'Construction Progress', count: 27, pct: 15 },
  { type: 'Solar/Energy', count: 22, pct: 12 },
  { type: 'Other', count: 16, pct: 8 },
];

const laancStats = [
  { status: 'Auto-Approved', count: 156, color: 'bg-green-500' },
  { status: 'Manual Review', count: 18, color: 'bg-yellow-500' },
  { status: 'Denied', count: 12, color: 'bg-red-500' },
];

const topPilots = [
  { rank: 1, name: 'James Park', missions: 42, hours: 312, rating: 4.9, certExpiry: '2027-06-15' },
  { rank: 2, name: 'Maria Santos', missions: 38, hours: 284, rating: 4.8, certExpiry: '2027-04-20' },
  { rank: 3, name: 'Alex Turner', missions: 35, hours: 245, rating: 4.7, certExpiry: '2028-01-10' },
  { rank: 4, name: 'Sarah Chen', missions: 31, hours: 198, rating: 4.9, certExpiry: '2027-09-30' },
  { rank: 5, name: 'David Kim', missions: 24, hours: 167, rating: 4.6, certExpiry: '2027-11-15' },
];

const safetyMetrics = [
  { metric: 'Near-Miss Incidents', current: 2, previous: 5, target: 0 },
  { metric: 'Flyaway Events', current: 0, previous: 1, target: 0 },
  { metric: 'Battery Failures', current: 1, previous: 2, target: 0 },
  { metric: 'Airspace Violations', current: 0, previous: 0, target: 0 },
  { metric: 'Emergency Landings', current: 1, previous: 3, target: 0 },
];

export function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const maxHours = Math.max(...flightHoursTrend.map((d) => d.hours));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Operational insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(['7d', '30d', '90d', '12m'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  period === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', card.color)}>
                  <Icon size={20} />
                </div>
                <div className={clsx(
                  'flex items-center gap-1 text-xs font-medium',
                  card.trend === 'up' && card.label !== 'Safety Incidents' ? 'text-green-600' :
                  card.trend === 'down' && card.label === 'Safety Incidents' ? 'text-green-600' :
                  'text-red-500'
                )}>
                  {card.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label} <span className="text-gray-400">({card.period})</span></p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight hours trend - bar chart placeholder */}
        <div className="lg:col-span-2 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Flight Hours Trend</h2>
          <div className="flex items-end gap-3 h-48">
            {flightHoursTrend.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-700">{d.hours}</span>
                <div
                  className="w-full rounded-t-lg bg-blue-500 transition-all"
                  style={{ height: `${(d.hours / maxHours) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{d.month}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">Monthly flight hours (Oct 2025 - Mar 2026)</p>
        </div>

        {/* LAANC stats - donut chart placeholder */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">LAANC Authorization Stats</h2>
          <div className="flex items-center justify-center h-32">
            <div className="relative">
              <div className="h-28 w-28 rounded-full border-[12px] border-green-500" style={{
                background: `conic-gradient(#22c55e 0% 84%, #eab308 84% 93%, #ef4444 93% 100%)`
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">186</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {laancStats.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={clsx('h-3 w-3 rounded-full', stat.color)} />
                  <span className="text-gray-600">{stat.status}</span>
                </div>
                <span className="font-medium text-gray-900">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions by type */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Missions by Type</h2>
          <div className="space-y-3">
            {missionsByType.map((m) => (
              <div key={m.type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{m.type}</span>
                  <span className="text-gray-500">{m.count} ({m.pct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety metrics */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            Safety Metrics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-gray-500">Metric</th>
                  <th className="pb-2 text-center font-medium text-gray-500">Current</th>
                  <th className="pb-2 text-center font-medium text-gray-500">Previous</th>
                  <th className="pb-2 text-center font-medium text-gray-500">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {safetyMetrics.map((s) => (
                  <tr key={s.metric}>
                    <td className="py-2.5 text-gray-700">{s.metric}</td>
                    <td className={clsx('py-2.5 text-center font-semibold', s.current <= s.target ? 'text-green-600' : 'text-amber-600')}>
                      {s.current}
                    </td>
                    <td className="py-2.5 text-center text-gray-500">{s.previous}</td>
                    <td className="py-2.5 text-center text-gray-400">{s.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top pilots */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <Users size={18} />
            Top Pilots
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Rank</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Pilot</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Missions</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Flight Hours</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Rating</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Cert Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topPilots.map((pilot) => (
                <tr key={pilot.rank} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className={clsx(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                      pilot.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      pilot.rank === 2 ? 'bg-gray-100 text-gray-600' :
                      pilot.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    )}>
                      {pilot.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{pilot.name}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{pilot.missions}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{pilot.hours}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                      {pilot.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{pilot.certExpiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
