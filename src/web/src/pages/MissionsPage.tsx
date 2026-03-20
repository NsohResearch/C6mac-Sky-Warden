import { useState } from 'react';
import {
  Plane, Plus, Search, Filter, Clock, CheckCircle,
  XCircle, AlertTriangle, MapPin, Calendar, User,
  PlayCircle, PauseCircle, Edit, Trash2, Eye, Radio,
} from 'lucide-react';
import { clsx } from 'clsx';

type MissionStatus = 'draft' | 'planned' | 'in_progress' | 'completed' | 'aborted';

const statusConfig: Record<MissionStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  planned: { label: 'Planned', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  aborted: { label: 'Aborted', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const missions = [
  { id: 'MSN-0047', name: 'Bridge Inspection — SR-520', status: 'in_progress' as MissionStatus, drone: 'DJI Mavic 3 Enterprise', pilot: 'James Park', scheduledAt: '2026-03-20 14:00', location: 'Seattle, WA', duration: '45 min', laanc: 'LAANC-2026-0142' },
  { id: 'MSN-0046', name: 'Solar Farm Survey', status: 'planned' as MissionStatus, drone: 'DJI Matrice 350 RTK', pilot: 'Maria Santos', scheduledAt: '2026-03-20 16:30', location: 'Riverside, CA', duration: '2 hrs', laanc: null },
  { id: 'MSN-0045', name: 'Agricultural Mapping — Field 7', status: 'planned' as MissionStatus, drone: 'Autel EVO II Pro', pilot: 'Alex Turner', scheduledAt: '2026-03-21 09:00', location: 'Fresno, CA', duration: '1.5 hrs', laanc: null },
  { id: 'MSN-0044', name: 'Rooftop Thermography', status: 'draft' as MissionStatus, drone: 'DJI Mavic 3T', pilot: 'Sarah Chen', scheduledAt: '—', location: 'San Jose, CA', duration: 'TBD', laanc: null },
  { id: 'MSN-0043', name: 'Tower Inspection — Cell Site 14B', status: 'completed' as MissionStatus, drone: 'Skydio X10', pilot: 'James Park', scheduledAt: '2026-03-19 10:00', location: 'Portland, OR', duration: '35 min', laanc: 'LAANC-2026-0138' },
  { id: 'MSN-0042', name: 'Construction Progress — Phase 2', status: 'completed' as MissionStatus, drone: 'DJI Matrice 350 RTK', pilot: 'Maria Santos', scheduledAt: '2026-03-18 14:00', location: 'Sacramento, CA', duration: '1 hr', laanc: null },
  { id: 'MSN-0041', name: 'Pipeline Survey — Sector 3', status: 'aborted' as MissionStatus, drone: 'Autel EVO II Pro', pilot: 'Alex Turner', scheduledAt: '2026-03-18 08:00', location: 'Bakersfield, CA', duration: '—', laanc: null },
];

export function MissionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');

  const filtered = missions.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.pilot.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: missions.length,
    draft: missions.filter((m) => m.status === 'draft').length,
    planned: missions.filter((m) => m.status === 'planned').length,
    in_progress: missions.filter((m) => m.status === 'in_progress').length,
    completed: missions.filter((m) => m.status === 'completed').length,
    aborted: missions.filter((m) => m.status === 'aborted').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Missions</h1>
          <p className="text-sm text-gray-500 mt-1">Plan, track, and review drone missions</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          Create Mission
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'draft', 'planned', 'in_progress', 'completed', 'aborted'] as const).map((s) => (
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
            <span className="ml-1.5 text-gray-400">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Search and date range */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search missions, pilots, IDs..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              className="rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="self-center text-gray-400 text-sm">to</span>
          <input
            type="date"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Mission cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((mission) => {
          const cfg = statusConfig[mission.status];
          return (
            <div key={mission.id} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{mission.id}</span>
                    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                      <span className={clsx('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{mission.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="View">
                    <Eye size={16} />
                  </button>
                  <button className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50" title="Edit">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Radio size={12} className="text-gray-400" />
                  <span>{mission.drone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-gray-400" />
                  <span>{mission.pilot}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-400" />
                  <span>{mission.scheduledAt}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-gray-400" />
                  <span>{mission.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-400" />
                  <span>Duration: {mission.duration}</span>
                </div>
                {mission.laanc && (
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} className="text-green-500" />
                    <span className="text-green-600 font-medium">{mission.laanc}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Plane size={40} className="mb-3" />
          <p className="text-sm font-medium">No missions found</p>
          <p className="text-xs mt-1">Try adjusting your filters or create a new mission</p>
        </div>
      )}
    </div>
  );
}
