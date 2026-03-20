import { useState } from 'react';
import {
  Radio, Plus, Search, CheckCircle, AlertTriangle,
  XCircle, Wrench, Battery, Clock, Signal,
  Wifi, WifiOff, Eye, Edit, BarChart3,
} from 'lucide-react';
import { clsx } from 'clsx';

type DroneStatus = 'active' | 'idle' | 'maintenance' | 'offline';
type TabId = 'all' | 'active' | 'maintenance_due' | 'non_compliant';

const statusConfig: Record<DroneStatus, { label: string; color: string; dot: string }> = {
  active: { label: 'Active', color: 'text-green-700', dot: 'bg-green-500' },
  idle: { label: 'Idle', color: 'text-blue-700', dot: 'bg-blue-500' },
  maintenance: { label: 'Maintenance', color: 'text-amber-700', dot: 'bg-amber-500' },
  offline: { label: 'Offline', color: 'text-gray-500', dot: 'bg-gray-400' },
};

const drones = [
  { id: 'DRN-001', name: 'Mavic 3 Enterprise #1', model: 'DJI Mavic 3 Enterprise', serial: '1ZNBJ9E00C00X7', status: 'active' as DroneStatus, flightHours: 342, remoteId: true, lastMaintenance: '2026-02-15', nextMaintenance: '2026-04-15', battery: 87, firmware: 'v01.00.0600', registrationFaa: 'FA3N2K7P1M' },
  { id: 'DRN-002', name: 'Matrice 350 RTK', model: 'DJI Matrice 350 RTK', serial: '1ZNDH3500D002A', status: 'active' as DroneStatus, flightHours: 578, remoteId: true, lastMaintenance: '2026-03-01', nextMaintenance: '2026-05-01', battery: 92, firmware: 'v09.01.0103', registrationFaa: 'FA5K8R2B4T' },
  { id: 'DRN-003', name: 'EVO II Pro #1', model: 'Autel EVO II Pro V3', serial: '7YBRX2100FN042', status: 'idle' as DroneStatus, flightHours: 215, remoteId: true, lastMaintenance: '2026-01-20', nextMaintenance: '2026-03-20', battery: 100, firmware: 'v3.2.16', registrationFaa: 'FA2J6M9D3W' },
  { id: 'DRN-004', name: 'Skydio X10', model: 'Skydio X10', serial: 'SKX10-2024-0891', status: 'active' as DroneStatus, flightHours: 124, remoteId: true, lastMaintenance: '2026-02-28', nextMaintenance: '2026-04-28', battery: 64, firmware: 'v24.3.1', registrationFaa: 'FA9T4L1C8P' },
  { id: 'DRN-005', name: 'Mavic 3T Thermal', model: 'DJI Mavic 3 Thermal', serial: '1ZNBJ9T00C0071', status: 'maintenance' as DroneStatus, flightHours: 456, remoteId: true, lastMaintenance: '2026-03-18', nextMaintenance: '2026-05-18', battery: 0, firmware: 'v01.00.0600', registrationFaa: 'FA7H3P6K2N' },
  { id: 'DRN-006', name: 'Phantom 4 RTK', model: 'DJI Phantom 4 RTK', serial: '0AXDJ4R00300P2', status: 'offline' as DroneStatus, flightHours: 892, remoteId: false, lastMaintenance: '2025-11-10', nextMaintenance: '2026-01-10', battery: 0, firmware: 'v02.00.0106', registrationFaa: 'FA1B5N8G4X' },
];

const fleetStats = [
  { label: 'Total Fleet', value: drones.length, icon: Radio, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Now', value: drones.filter((d) => d.status === 'active').length, icon: Signal, color: 'bg-green-50 text-green-600' },
  { label: 'Maintenance Due', value: 2, icon: Wrench, color: 'bg-amber-50 text-amber-600' },
  { label: 'Remote ID Compliant', value: `${drones.filter((d) => d.remoteId).length}/${drones.length}`, icon: CheckCircle, color: 'bg-purple-50 text-purple-600' },
];

const tabs: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All Drones' },
  { id: 'active', label: 'Active' },
  { id: 'maintenance_due', label: 'Maintenance Due' },
  { id: 'non_compliant', label: 'Non-Compliant' },
];

export function FleetPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const filtered = drones.filter((d) => {
    if (activeTab === 'active' && d.status !== 'active') return false;
    if (activeTab === 'maintenance_due') {
      const next = new Date(d.nextMaintenance);
      const now = new Date('2026-03-20');
      if (next > now) return false;
    }
    if (activeTab === 'non_compliant' && d.remoteId) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.model.toLowerCase().includes(q) || d.serial.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage your drone fleet</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          Register Drone
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fleetStats.map((stat) => {
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drones..."
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Drone cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((drone) => {
          const cfg = statusConfig[drone.status];
          const maintenanceOverdue = new Date(drone.nextMaintenance) <= new Date('2026-03-20');
          return (
            <div key={drone.id} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={clsx('flex items-center gap-1.5 text-xs font-medium', cfg.color)}>
                      <span className={clsx('h-2 w-2 rounded-full', cfg.dot)} />
                      {cfg.label}
                    </span>
                    {!drone.remoteId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        <XCircle size={10} />
                        No Remote ID
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mt-1">{drone.name}</h3>
                  <p className="text-xs text-gray-500">{drone.model}</p>
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

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <p className="text-xs text-gray-500">Flight Hours</p>
                  <p className="text-sm font-semibold text-gray-900">{drone.flightHours} hrs</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Battery</p>
                    <Battery size={12} className={drone.battery > 50 ? 'text-green-500' : drone.battery > 20 ? 'text-amber-500' : 'text-red-500'} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{drone.battery}%</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <p className="text-xs text-gray-500">Remote ID</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {drone.remoteId ? (
                      <>
                        <Wifi size={12} className="text-green-500" />
                        <span className="text-xs font-medium text-green-600">Compliant</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={12} className="text-red-500" />
                        <span className="text-xs font-medium text-red-600">Non-Compliant</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={clsx('rounded-lg p-2.5', maintenanceOverdue ? 'bg-amber-50' : 'bg-gray-50')}>
                  <p className="text-xs text-gray-500">Next Maintenance</p>
                  <p className={clsx('text-xs font-semibold', maintenanceOverdue ? 'text-amber-700' : 'text-gray-900')}>
                    {maintenanceOverdue && <AlertTriangle size={10} className="inline mr-1" />}
                    {drone.nextMaintenance}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-400">
                <span>S/N: {drone.serial}</span>
                <span>FAA: {drone.registrationFaa}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Radio size={40} className="mb-3" />
          <p className="text-sm font-medium">No drones found</p>
          <p className="text-xs mt-1">Try adjusting your filters or register a new drone</p>
        </div>
      )}
    </div>
  );
}
