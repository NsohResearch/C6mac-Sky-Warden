import { useState } from 'react';
import {
  FileCheck, Shield, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, Clock, Eye, Download, ChevronDown,
  Lock, Users, Key, Activity, RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

type ControlStatus = 'compliant' | 'non_compliant' | 'partial';

const controlStatusConfig: Record<ControlStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle }> = {
  compliant: { label: 'Compliant', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  non_compliant: { label: 'Non-Compliant', bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
  partial: { label: 'Partial', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: AlertTriangle },
};

const frameworks = [
  { id: 'part107', name: 'FAA Part 107', status: 'compliant' as ControlStatus, score: 98, controls: 24, passing: 24, icon: Shield, color: 'bg-blue-50 text-blue-600 border-blue-200', description: 'Small UAS operations rules' },
  { id: 'remote_id', name: 'Remote ID', status: 'partial' as ControlStatus, score: 83, controls: 6, passing: 5, icon: Activity, color: 'bg-purple-50 text-purple-600 border-purple-200', description: 'Remote identification of UAS' },
  { id: 'soc2', name: 'SOC 2 Type II', status: 'compliant' as ControlStatus, score: 95, controls: 61, passing: 58, icon: Lock, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', description: 'Trust service criteria' },
  { id: 'iso27001', name: 'ISO 27001', status: 'partial' as ControlStatus, score: 88, controls: 114, passing: 100, icon: FileCheck, color: 'bg-amber-50 text-amber-600 border-amber-200', description: 'Information security management' },
];

const controlItems = [
  { id: 'CTL-001', name: 'Pilot Certification Verification', framework: 'FAA Part 107', status: 'compliant' as ControlStatus, lastChecked: '2026-03-20', owner: 'Operations' },
  { id: 'CTL-002', name: 'Remote ID Broadcasting', framework: 'Remote ID', status: 'non_compliant' as ControlStatus, lastChecked: '2026-03-19', owner: 'Fleet Mgmt' },
  { id: 'CTL-003', name: 'Data Encryption at Rest', framework: 'SOC 2 Type II', status: 'compliant' as ControlStatus, lastChecked: '2026-03-18', owner: 'Engineering' },
  { id: 'CTL-004', name: 'Access Control Reviews', framework: 'SOC 2 Type II', status: 'partial' as ControlStatus, lastChecked: '2026-03-15', owner: 'Security' },
  { id: 'CTL-005', name: 'Incident Response Plan', framework: 'ISO 27001', status: 'compliant' as ControlStatus, lastChecked: '2026-03-10', owner: 'Security' },
  { id: 'CTL-006', name: 'BVLOS Waiver Documentation', framework: 'FAA Part 107', status: 'compliant' as ControlStatus, lastChecked: '2026-03-12', owner: 'Operations' },
  { id: 'CTL-007', name: 'Drone Registration Records', framework: 'FAA Part 107', status: 'compliant' as ControlStatus, lastChecked: '2026-03-20', owner: 'Fleet Mgmt' },
  { id: 'CTL-008', name: 'Vendor Risk Assessment', framework: 'ISO 27001', status: 'partial' as ControlStatus, lastChecked: '2026-02-28', owner: 'Security' },
];

const accessReviews = [
  { user: 'James Park', role: 'Pilot', lastReview: '2026-02-15', status: 'Current', accessLevel: 'Standard' },
  { user: 'Maria Santos', role: 'Lead Pilot', lastReview: '2026-01-20', status: 'Review Due', accessLevel: 'Elevated' },
  { user: 'Alex Turner', role: 'Pilot', lastReview: '2026-03-01', status: 'Current', accessLevel: 'Standard' },
  { user: 'Sarah Chen', role: 'Fleet Manager', lastReview: '2025-12-10', status: 'Overdue', accessLevel: 'Admin' },
];

const auditLog = [
  { timestamp: '2026-03-20 09:15:23', actor: 'System', action: 'Compliance check completed', resource: 'FAA Part 107', result: 'Pass' },
  { timestamp: '2026-03-20 08:30:00', actor: 'james.park', action: 'Updated drone registration', resource: 'DRN-001', result: 'Success' },
  { timestamp: '2026-03-19 16:45:12', actor: 'System', action: 'Remote ID check failed', resource: 'DRN-006', result: 'Fail' },
  { timestamp: '2026-03-19 14:20:00', actor: 'sarah.chen', action: 'Access role modified', resource: 'maria.santos', result: 'Success' },
  { timestamp: '2026-03-18 11:00:00', actor: 'System', action: 'SOC 2 evidence collected', resource: 'Data Encryption', result: 'Pass' },
  { timestamp: '2026-03-18 09:30:45', actor: 'alex.turner', action: 'Pilot certificate uploaded', resource: 'Part 107 Cert', result: 'Success' },
];

export function CompliancePage() {
  const [auditSearch, setAuditSearch] = useState('');

  const filteredAudit = auditLog.filter((entry) => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return entry.action.toLowerCase().includes(q) || entry.actor.toLowerCase().includes(q) || entry.resource.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor regulatory and security compliance across all frameworks</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            Export Report
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <RefreshCw size={16} />
            Run Check
          </button>
        </div>
      </div>

      {/* Framework cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map((fw) => {
          const Icon = fw.icon;
          const cfg = controlStatusConfig[fw.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={fw.id} className={clsx('rounded-xl border-2 p-5 shadow-sm', fw.color)}>
              <div className="flex items-center justify-between mb-3">
                <Icon size={24} />
                <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                  <StatusIcon size={12} />
                  {cfg.label}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{fw.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{fw.description}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{fw.score}%</span>
                  <span className="text-xs text-gray-500">{fw.passing}/{fw.controls} controls</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={clsx('h-2 rounded-full', fw.score >= 95 ? 'bg-green-500' : fw.score >= 80 ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: `${fw.score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls grid */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">Control Status</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All Controls</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Control ID</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Framework</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Owner</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {controlItems.map((ctrl) => {
                const cfg = controlStatusConfig[ctrl.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={ctrl.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{ctrl.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{ctrl.name}</td>
                    <td className="px-5 py-3 text-gray-600">{ctrl.framework}</td>
                    <td className="px-5 py-3">
                      <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{ctrl.owner}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{ctrl.lastChecked}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access reviews */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Users size={18} />
              Access Reviews
            </h2>
          </div>
          <div className="divide-y">
            {accessReviews.map((review) => (
              <div key={review.user} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{review.user}</p>
                  <p className="text-xs text-gray-500">{review.role} / {review.accessLevel}</p>
                </div>
                <div className="text-right">
                  <span className={clsx(
                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                    review.status === 'Current' ? 'bg-green-50 text-green-700' :
                    review.status === 'Review Due' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  )}>
                    {review.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">Last: {review.lastReview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit log */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Activity size={18} />
              Audit Log
            </h2>
          </div>
          <div className="px-5 py-3 border-b">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filter audit log..."
                className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="divide-y max-h-[320px] overflow-y-auto">
            {filteredAudit.map((entry, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900">{entry.action}</p>
                  <span className={clsx(
                    'text-xs font-medium',
                    entry.result === 'Pass' || entry.result === 'Success' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {entry.result}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>{entry.actor}</span>
                  <span>{entry.resource}</span>
                  <span className="ml-auto">{entry.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
