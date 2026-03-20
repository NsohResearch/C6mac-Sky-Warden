import { useState } from 'react';
import {
  Building2, Users, Radio, Plane, Shield, FileCheck,
  CheckCircle, AlertTriangle, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Lock, Activity,
  BarChart3, Eye, Award,
} from 'lucide-react';
import { clsx } from 'clsx';

const overviewCards = [
  { label: 'Fleet Size', value: 24, change: '+3', trend: 'up' as const, icon: Radio, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Pilots', value: 12, change: '+1', trend: 'up' as const, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Missions This Month', value: 47, change: '+8', trend: 'up' as const, icon: Plane, color: 'bg-purple-50 text-purple-600' },
  { label: 'Compliance Score', value: '94%', change: '+2%', trend: 'up' as const, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
];

const fleetStatus = [
  { status: 'Active', count: 15, color: 'bg-green-500' },
  { status: 'Idle', count: 5, color: 'bg-blue-500' },
  { status: 'Maintenance', count: 3, color: 'bg-amber-500' },
  { status: 'Offline', count: 1, color: 'bg-gray-400' },
];

const pilotActivity = [
  { name: 'James Park', missions: 8, hours: 24, lastFlight: 'Today', status: 'Active' },
  { name: 'Maria Santos', missions: 7, hours: 21, lastFlight: 'Today', status: 'Active' },
  { name: 'Alex Turner', missions: 6, hours: 18, lastFlight: 'Yesterday', status: 'Active' },
  { name: 'Sarah Chen', missions: 5, hours: 15, lastFlight: 'Mar 18', status: 'Active' },
  { name: 'David Kim', missions: 4, hours: 12, lastFlight: 'Mar 17', status: 'On Leave' },
  { name: 'Emily Davis', missions: 3, hours: 9, lastFlight: 'Mar 15', status: 'Active' },
];

const complianceFrameworks = [
  { name: 'FAA Part 107', status: 'compliant', score: 98, icon: Shield },
  { name: 'Remote ID', status: 'partial', score: 83, icon: Activity },
  { name: 'SOC 2 Type II', status: 'compliant', score: 95, icon: Lock },
  { name: 'ISO 27001', status: 'partial', score: 88, icon: FileCheck },
];

const droneUtilization = [
  { name: 'Mavic 3 Enterprise #1', utilization: 78, hours: 48 },
  { name: 'Matrice 350 RTK', utilization: 85, hours: 52 },
  { name: 'EVO II Pro #1', utilization: 62, hours: 38 },
  { name: 'Skydio X10', utilization: 45, hours: 28 },
  { name: 'Mavic 3T Thermal', utilization: 0, hours: 0 },
  { name: 'Phantom 4 RTK', utilization: 0, hours: 0 },
];

const recentAlerts = [
  { type: 'warning', message: 'Drone DRN-006 missing Remote ID compliance', time: '2 hrs ago' },
  { type: 'info', message: 'Pilot David Kim access review overdue', time: '5 hrs ago' },
  { type: 'warning', message: 'Drone DRN-003 maintenance due today', time: '8 hrs ago' },
  { type: 'success', message: 'SOC 2 evidence collection completed', time: '1 day ago' },
];

export function EnterpriseDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">SkyOps Aviation LLC — Fleet and compliance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
            <CheckCircle size={12} />
            SOC 2 Certified
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
            <Award size={12} />
            ISO 27001
          </span>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', card.color)}>
                  <Icon size={20} />
                </div>
                <div className={clsx(
                  'flex items-center gap-1 text-xs font-medium',
                  card.trend === 'up' ? 'text-green-600' : 'text-red-500'
                )}>
                  {card.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet status */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Fleet Status</h2>
          <div className="space-y-3">
            {fleetStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx('h-3 w-3 rounded-full', item.color)} />
                  <span className="text-sm text-gray-700">{item.status}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-4 rounded-full overflow-hidden bg-gray-100">
            {fleetStatus.map((item) => (
              <div
                key={item.status}
                className={clsx(item.color)}
                style={{ width: `${(item.count / 24) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Compliance badges */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Compliance Frameworks</h2>
          <div className="space-y-3">
            {complianceFrameworks.map((fw) => {
              const Icon = fw.icon;
              return (
                <div key={fw.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{fw.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">{fw.score}%</span>
                    <span className={clsx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      fw.status === 'compliant' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    )}>
                      {fw.status === 'compliant' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                      {fw.status === 'compliant' ? 'Compliant' : 'Partial'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-2">
                {alert.type === 'warning' ? (
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                ) : alert.type === 'success' ? (
                  <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Activity size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  <p className="text-xs text-gray-400">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pilot activity */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Pilot Activity (This Month)</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Manage Team</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Pilot</th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">Missions</th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">Hours</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Last Flight</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pilotActivity.map((pilot) => (
                  <tr key={pilot.name} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{pilot.name}</td>
                    <td className="px-5 py-3 text-center text-gray-700">{pilot.missions}</td>
                    <td className="px-5 py-3 text-center text-gray-700">{pilot.hours}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{pilot.lastFlight}</td>
                    <td className="px-5 py-3">
                      <span className={clsx(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        pilot.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      )}>
                        {pilot.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drone utilization */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Drone Utilization (This Month)</h2>
          <div className="space-y-3">
            {droneUtilization.map((drone) => (
              <div key={drone.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{drone.name}</span>
                  <span className="text-gray-500">{drone.utilization}% ({drone.hours} hrs)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={clsx(
                      'h-2 rounded-full',
                      drone.utilization >= 70 ? 'bg-green-500' :
                      drone.utilization >= 40 ? 'bg-blue-500' :
                      drone.utilization > 0 ? 'bg-amber-500' :
                      'bg-gray-300'
                    )}
                    style={{ width: `${Math.max(drone.utilization, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
