import { useState } from 'react';
import {
  Plane, Radio, Shield, FileCheck, Map, Plus,
  Clock, CheckCircle, AlertTriangle, Calendar,
  Award, ArrowUpRight, TrendingUp, Eye, Activity,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';

const myDrones = [
  { id: 'DRN-001', name: 'DJI Mavic 3 Enterprise', status: 'active', battery: 87, remoteId: true, flightHours: 342 },
  { id: 'DRN-003', name: 'Autel EVO II Pro V3', status: 'idle', battery: 100, remoteId: true, flightHours: 215 },
];

const myMissions = [
  { id: 'MSN-0047', name: 'Bridge Inspection — SR-520', status: 'in_progress', scheduledAt: 'Today, 2:00 PM', location: 'Seattle, WA' },
  { id: 'MSN-0046', name: 'Solar Farm Survey', status: 'planned', scheduledAt: 'Today, 4:30 PM', location: 'Riverside, CA' },
  { id: 'MSN-0043', name: 'Tower Inspection — Cell Site 14B', status: 'completed', scheduledAt: 'Mar 19, 10:00 AM', location: 'Portland, OR' },
];

const myLaanc = [
  { id: 'LAANC-2026-0142', area: 'Class C — SFO', altitude: '200 ft', status: 'auto_approved', expires: 'Today, 6:00 PM' },
  { id: 'LAANC-2026-0138', area: 'Class C — SEA', altitude: '150 ft', status: 'expired', expires: 'Mar 19, 4:00 AM' },
];

const flightLog = [
  { date: '2026-03-20', mission: 'Bridge Inspection', duration: '32 min', drone: 'Mavic 3 Enterprise', distance: '2.4 km' },
  { date: '2026-03-19', mission: 'Tower Inspection', duration: '35 min', drone: 'Mavic 3 Enterprise', distance: '1.8 km' },
  { date: '2026-03-18', mission: 'Rooftop Survey', duration: '22 min', drone: 'EVO II Pro', distance: '0.9 km' },
  { date: '2026-03-15', mission: 'Pipeline Patrol', duration: '1 hr 12 min', drone: 'Mavic 3 Enterprise', distance: '8.6 km' },
  { date: '2026-03-14', mission: 'Ag Survey — Field 3', duration: '48 min', drone: 'EVO II Pro', distance: '3.1 km' },
];

const certInfo = {
  type: 'FAA Part 107',
  number: '4087213',
  issued: '2024-06-15',
  expires: '2026-06-15',
  daysRemaining: 87,
  recurrentTraining: '2026-04-10',
};

export function PilotDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pilot Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your personal flight operations overview</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Map size={16} />
            Check Airspace
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
            <Plus size={16} />
            Quick Mission
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Radio size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{myDrones.length}</p>
              <p className="text-sm text-gray-500">My Drones</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Plane size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">42</p>
              <p className="text-sm text-gray-500">Total Missions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><Clock size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">312 hrs</p>
              <p className="text-sm text-gray-500">Flight Hours</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600"><Shield size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">18</p>
              <p className="text-sm text-gray-500">LAANC Auths</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certification status */}
      <div className={clsx(
        'rounded-xl border-2 p-5 shadow-sm',
        certInfo.daysRemaining > 90 ? 'bg-green-50 border-green-200' :
        certInfo.daysRemaining > 30 ? 'bg-yellow-50 border-yellow-200' :
        'bg-red-50 border-red-200'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award size={28} className={
              certInfo.daysRemaining > 90 ? 'text-green-600' :
              certInfo.daysRemaining > 30 ? 'text-yellow-600' :
              'text-red-600'
            } />
            <div>
              <h3 className="font-semibold text-gray-900">{certInfo.type} — #{certInfo.number}</h3>
              <p className="text-sm text-gray-600">
                Expires: {certInfo.expires} ({certInfo.daysRemaining} days remaining)
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Next Recurrent Training</p>
            <p className="text-sm font-medium text-gray-900">{certInfo.recurrentTraining}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My drones */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">My Drones</h2>
          </div>
          <div className="divide-y">
            {myDrones.map((drone) => (
              <div key={drone.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{drone.name}</p>
                    <p className="text-xs text-gray-500">{drone.id} / {drone.flightHours} hrs</p>
                  </div>
                  <div className="text-right">
                    <span className={clsx(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      drone.status === 'active' ? 'text-green-600' : 'text-blue-600'
                    )}>
                      <span className={clsx('h-1.5 w-1.5 rounded-full', drone.status === 'active' ? 'bg-green-500' : 'bg-blue-500')} />
                      {drone.status === 'active' ? 'Active' : 'Idle'}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">Battery: {drone.battery}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My missions */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">My Missions</h2>
          </div>
          <div className="divide-y">
            {myMissions.map((mission) => (
              <div key={mission.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{mission.name}</p>
                  <span className={clsx(
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                    mission.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                    mission.status === 'planned' ? 'bg-blue-50 text-blue-700' :
                    'bg-green-50 text-green-700'
                  )}>
                    {mission.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={11} /> {mission.scheduledAt}</span>
                  <span className="flex items-center gap-1"><Map size={11} /> {mission.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My LAANC */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">LAANC Authorizations</h2>
          </div>
          <div className="divide-y">
            {myLaanc.map((auth) => (
              <div key={auth.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-mono text-gray-500">{auth.id}</p>
                  <span className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    auth.status === 'auto_approved' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {auth.status === 'auto_approved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {auth.status === 'auto_approved' ? 'Approved' : 'Expired'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{auth.area} / {auth.altitude}</p>
                <p className="text-xs text-gray-400 mt-0.5">Expires: {auth.expires}</p>
              </div>
            ))}
          </div>
          <div className="border-t px-5 py-3">
            <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 w-full justify-center">
              <Shield size={14} />
              Request New Authorization
            </button>
          </div>
        </div>
      </div>

      {/* Flight log */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <BookOpen size={18} />
            Flight Log
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Export Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Mission</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Drone</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Duration</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {flightLog.map((entry, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 text-xs">{entry.date}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{entry.mission}</td>
                  <td className="px-5 py-3 text-gray-600">{entry.drone}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{entry.duration}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{entry.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
