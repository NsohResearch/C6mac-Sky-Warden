import { useState } from 'react';
import {
  Building2, MapPin, FileText, AlertTriangle, Shield,
  Plus, Search, Eye, Edit, CheckCircle, Clock,
  XCircle, Activity, Users, Radio, BarChart3,
  Filter, ChevronDown, Bell, Map,
} from 'lucide-react';
import { clsx } from 'clsx';

const jurisdictionStats = [
  { label: 'Active Rules', value: 14, icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { label: 'Registered Drones', value: 342, icon: Radio, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Incident Reports', value: 7, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
  { label: 'Active Operations', value: 23, icon: Activity, color: 'bg-purple-50 text-purple-600' },
];

const activeRules = [
  { id: 'RULE-001', name: 'Downtown No-Fly Zone', type: 'Prohibited', area: 'City Center, 2 mi radius', effective: '2025-01-01', status: 'active', drones_affected: 156 },
  { id: 'RULE-002', name: 'Parks & Recreation Altitude Limit', type: 'Altitude Restriction', area: 'All city parks', effective: '2025-03-15', status: 'active', drones_affected: 89 },
  { id: 'RULE-003', name: 'Hospital Heliport Buffer', type: 'Restricted', area: 'Memorial Hospital, 0.5 mi', effective: '2025-06-01', status: 'active', drones_affected: 42 },
  { id: 'RULE-004', name: 'Stadium Event Restrictions', type: 'Temporary', area: 'Metro Arena, 1 mi radius', effective: '2026-03-25', status: 'pending', drones_affected: 0 },
  { id: 'RULE-005', name: 'Night Operations Curfew', type: 'Time Restriction', area: 'Residential zones', effective: '2025-09-01', status: 'active', drones_affected: 215 },
];

const incidentReports = [
  { id: 'INC-2026-012', date: '2026-03-19', type: 'Near Miss', location: 'Downtown District', severity: 'high', status: 'investigating', description: 'Drone detected within 200ft of manned aircraft near heliport' },
  { id: 'INC-2026-011', date: '2026-03-17', type: 'Noise Complaint', location: 'Residential Zone B', severity: 'low', status: 'resolved', description: 'Multiple residents reported early morning drone noise' },
  { id: 'INC-2026-010', date: '2026-03-15', type: 'Unauthorized Flight', location: 'City Park', severity: 'medium', status: 'investigating', description: 'Unregistered drone operating above 400ft AGL' },
  { id: 'INC-2026-009', date: '2026-03-12', type: 'Privacy Violation', location: 'School Zone C', severity: 'high', status: 'resolved', description: 'Drone hovering near school during school hours' },
  { id: 'INC-2026-008', date: '2026-03-08', type: 'Equipment Failure', location: 'Industrial Park', severity: 'medium', status: 'closed', description: 'Drone lost communication and performed emergency landing' },
];

const droneActivityLog = [
  { time: '14:23', operator: 'SkyOps Aviation', drone: 'DJI Matrice 350', altitude: '180 ft', area: 'Commercial District', remoteId: true },
  { time: '14:15', operator: 'Aerial Surveys Inc', drone: 'Skydio X10', altitude: '200 ft', area: 'Highway 101 Corridor', remoteId: true },
  { time: '13:58', operator: 'FarmTech Drones', drone: 'DJI Agras T40', altitude: '50 ft', area: 'Agricultural Zone', remoteId: true },
  { time: '13:42', operator: 'Unknown', drone: 'Unidentified', altitude: '350 ft', area: 'Residential Zone A', remoteId: false },
  { time: '13:30', operator: 'BuildWatch Co', drone: 'Autel EVO II', altitude: '150 ft', area: 'Construction Site 5', remoteId: true },
];

export function AgencyDashboard() {
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'investigating' | 'resolved' | 'closed'>('all');

  const filteredIncidents = incidentReports.filter((inc) => {
    if (incidentFilter === 'all') return true;
    return inc.status === incidentFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Metro County Aviation Authority — Jurisdiction oversight</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Map size={16} />
            Jurisdiction Map
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={16} />
            Author Rule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {jurisdictionStats.map((stat) => {
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jurisdiction map placeholder */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Jurisdiction Map</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Prohibited</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Restricted</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Controlled</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Open</span>
          </div>
        </div>
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin size={32} className="mx-auto mb-2" />
            <p className="text-sm font-medium">Interactive Jurisdiction Map</p>
            <p className="text-xs mt-1">Shows active rules, drone activity, and incident locations</p>
          </div>
        </div>
      </div>

      {/* Active rules */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Active Rules</h2>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            <Plus size={14} />
            New Rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Rule ID</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Area</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Affected</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{rule.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{rule.name}</td>
                  <td className="px-5 py-3">
                    <span className={clsx(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      rule.type === 'Prohibited' ? 'bg-red-50 text-red-700' :
                      rule.type === 'Restricted' ? 'bg-amber-50 text-amber-700' :
                      rule.type === 'Temporary' ? 'bg-purple-50 text-purple-700' :
                      'bg-blue-50 text-blue-700'
                    )}>
                      {rule.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{rule.area}</td>
                  <td className="px-5 py-3">
                    <span className={clsx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      rule.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    )}>
                      {rule.status === 'active' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {rule.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-700">{rule.drones_affected}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Eye size={14} /></button>
                      <button className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50"><Edit size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident reports */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <AlertTriangle size={18} className="text-amber-500" />
              Incident Reports
            </h2>
            <div className="flex gap-1">
              {(['all', 'investigating', 'resolved', 'closed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setIncidentFilter(f)}
                  className={clsx(
                    'rounded px-2 py-1 text-xs font-medium transition-colors',
                    incidentFilter === f ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {filteredIncidents.map((inc) => (
              <div key={inc.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">{inc.id}</span>
                    <span className={clsx(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      inc.severity === 'high' ? 'bg-red-50 text-red-700' :
                      inc.severity === 'medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    )}>
                      {inc.severity}
                    </span>
                  </div>
                  <span className={clsx(
                    'text-xs font-medium',
                    inc.status === 'investigating' ? 'text-amber-600' :
                    inc.status === 'resolved' ? 'text-green-600' :
                    'text-gray-500'
                  )}>
                    {inc.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{inc.type}</p>
                <p className="text-xs text-gray-500 mt-0.5">{inc.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>{inc.date}</span>
                  <span>{inc.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drone activity in jurisdiction */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Radio size={18} className="text-blue-500" />
              Live Drone Activity
            </h2>
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="divide-y">
            {droneActivityLog.map((entry, i) => (
              <div key={i} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.operator}</p>
                    <p className="text-xs text-gray-500">{entry.drone} / {entry.altitude}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{entry.time}</p>
                    {entry.remoteId ? (
                      <span className="text-xs text-green-600 font-medium">Remote ID</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <XCircle size={10} />
                        No Remote ID
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{entry.area}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
