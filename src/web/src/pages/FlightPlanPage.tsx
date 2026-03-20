import { useState } from 'react';
import {
  Plane, Plus, Search, CheckCircle, XCircle, AlertTriangle,
  Clock, Eye, Edit, ArrowRight, ArrowLeft, MapPin, Calendar,
  User, Radio, ChevronDown, Wind, Thermometer, Cloud,
  Navigation, Shield, Activity, ChevronUp, Filter,
} from 'lucide-react';
import { clsx } from 'clsx';

type FPStatus = 'draft' | 'filed' | 'pending_auth' | 'authorized' | 'active' | 'completed' | 'denied' | 'expired';
type FormStep = 1 | 2 | 3 | 4 | 5;

const fpStatusConfig: Record<FPStatus, { label: string; bg: string; text: string; dot?: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  filed: { label: 'Filed', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  pending_auth: { label: 'Pending Auth', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  authorized: { label: 'Authorized', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  denied: { label: 'Denied', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  expired: { label: 'Expired', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const flightPlans = [
  {
    id: 'SKW-FP-2026-000012', status: 'active' as FPStatus, type: 'Inspection', drone: 'SKW-US-A7B3X9', droneModel: 'DJI Mavic 3 Enterprise',
    pilot: 'James Park', departure: '2026-03-20 14:00', arrival: '2026-03-20 15:30', distance: '2.4 NM', maxAlt: '300 ft',
    waypoints: [
      { num: 0, type: 'Takeoff', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: 0 },
      { num: 1, type: 'Waypoint', name: 'WP1', lat: '34.0530', lng: '-118.2420', alt: 200 },
      { num: 2, type: 'Loiter', name: 'Inspect Point', lat: '34.0545', lng: '-118.2400', alt: 300 },
      { num: 3, type: 'Landing', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: 0 },
    ],
    airspaces: [{ name: 'Class G', status: 'clear' }],
    deviations: [],
    currentPos: { lat: '34.0538', lng: '-118.2415', alt: 250 },
    progress: 65,
    elapsed: '0:58',
  },
  {
    id: 'SKW-FP-2026-000011', status: 'authorized' as FPStatus, type: 'Survey', drone: 'SKW-US-K9M2P4', droneModel: 'DJI Matrice 350 RTK',
    pilot: 'Maria Santos', departure: '2026-03-20 16:30', arrival: '2026-03-20 18:30', distance: '5.1 NM', maxAlt: '400 ft',
    waypoints: [], airspaces: [{ name: 'Class G', status: 'clear' }], deviations: [], currentPos: null, progress: 0, elapsed: null,
  },
  {
    id: 'SKW-FP-2026-000010', status: 'pending_auth' as FPStatus, type: 'Standard', drone: 'SKW-US-W3J6F2', droneModel: 'Skydio X10',
    pilot: 'Alex Turner', departure: '2026-03-21 09:00', arrival: '2026-03-21 10:00', distance: '1.8 NM', maxAlt: '200 ft',
    waypoints: [], airspaces: [{ name: 'Class D (SFO)', status: 'pending' }], deviations: [], currentPos: null, progress: 0, elapsed: null,
  },
  {
    id: 'SKW-FP-2026-000009', status: 'filed' as FPStatus, type: 'Delivery', drone: 'SKW-US-A7B3X9', droneModel: 'DJI Mavic 3 Enterprise',
    pilot: 'James Park', departure: '2026-03-22 08:00', arrival: '2026-03-22 08:30', distance: '0.9 NM', maxAlt: '150 ft',
    waypoints: [], airspaces: [{ name: 'Class G', status: 'clear' }], deviations: [], currentPos: null, progress: 0, elapsed: null,
  },
  {
    id: 'SKW-FP-2026-000008', status: 'completed' as FPStatus, type: 'Inspection', drone: 'SKW-US-K9M2P4', droneModel: 'DJI Matrice 350 RTK',
    pilot: 'Maria Santos', departure: '2026-03-19 10:00', arrival: '2026-03-19 11:15', distance: '3.2 NM', maxAlt: '350 ft',
    waypoints: [], airspaces: [{ name: 'Class G', status: 'clear' }], deviations: [], currentPos: null, progress: 100, elapsed: null,
  },
  {
    id: 'SKW-FP-2026-000007', status: 'completed' as FPStatus, type: 'Training', drone: 'SKW-US-T5N8R1', droneModel: 'Autel EVO II Pro V3',
    pilot: 'Sarah Chen', departure: '2026-03-18 14:00', arrival: '2026-03-18 15:00', distance: '1.2 NM', maxAlt: '200 ft',
    waypoints: [], airspaces: [{ name: 'Class G', status: 'clear' }], deviations: [], currentPos: null, progress: 100, elapsed: null,
  },
  {
    id: 'SKW-FP-2026-000006', status: 'denied' as FPStatus, type: 'Standard', drone: 'SKW-US-A7B3X9', droneModel: 'DJI Mavic 3 Enterprise',
    pilot: 'James Park', departure: '2026-03-17 12:00', arrival: '2026-03-17 13:00', distance: '2.0 NM', maxAlt: '400 ft',
    waypoints: [], airspaces: [{ name: 'TFR (Stadium)', status: 'denied' }],
    deviations: [{ severity: 'high', message: 'TFR active — Stadium event' }],
    currentPos: null, progress: 0, elapsed: null,
  },
  {
    id: 'SKW-FP-2026-000005', status: 'draft' as FPStatus, type: 'Survey', drone: 'SKW-US-W3J6F2', droneModel: 'Skydio X10',
    pilot: 'Alex Turner', departure: '—', arrival: '—', distance: '—', maxAlt: '—',
    waypoints: [], airspaces: [], deviations: [], currentPos: null, progress: 0, elapsed: null,
  },
  {
    id: 'SKW-FP-2026-000004', status: 'expired' as FPStatus, type: 'Standard', drone: 'SKW-US-T5N8R1', droneModel: 'Autel EVO II Pro V3',
    pilot: 'Sarah Chen', departure: '2026-03-10 09:00', arrival: '2026-03-10 10:00', distance: '1.5 NM', maxAlt: '250 ft',
    waypoints: [], airspaces: [{ name: 'Class G', status: 'clear' }], deviations: [], currentPos: null, progress: 0, elapsed: null,
  },
];

const formWaypoints = [
  { num: 0, type: 'Takeoff', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: 0, speed: '—', action: '—' },
  { num: 1, type: 'Waypoint', name: 'WP1', lat: '34.0530', lng: '-118.2420', alt: 200, speed: '15', action: 'Take Photo' },
  { num: 2, type: 'Loiter', name: 'Inspect Point', lat: '34.0545', lng: '-118.2400', alt: 300, speed: '0', action: 'Start Video' },
  { num: 3, type: 'Waypoint', name: 'WP3', lat: '34.0535', lng: '-118.2430', alt: 200, speed: '15', action: '—' },
  { num: 4, type: 'Landing', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: 0, speed: '—', action: '—' },
];

const emergencyLandingLocations = [
  { name: 'Parking Lot A', lat: '34.0525', lng: '-118.2440', surface: 'Paved' },
  { name: 'Open Field B', lat: '34.0540', lng: '-118.2410', surface: 'Grass' },
];

const registeredDrones = [
  { ddid: 'SKW-US-A7B3X9', model: 'DJI Mavic 3 Enterprise', status: 'active' },
  { ddid: 'SKW-US-K9M2P4', model: 'DJI Matrice 350 RTK', status: 'active' },
  { ddid: 'SKW-US-W3J6F2', model: 'Skydio X10', status: 'active' },
  { ddid: 'SKW-US-T5N8R1', model: 'Autel EVO II Pro V3', status: 'expiring_soon' },
];

const stats = [
  { label: 'Total Filed', value: flightPlans.length, icon: Plane, color: 'bg-blue-50 text-blue-600' },
  { label: 'Authorized', value: flightPlans.filter((fp) => fp.status === 'authorized').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
  { label: 'Active Now', value: flightPlans.filter((fp) => fp.status === 'active').length, icon: Activity, color: 'bg-emerald-50 text-emerald-600', pulse: true },
  { label: 'Completed This Month', value: flightPlans.filter((fp) => fp.status === 'completed').length, icon: Clock, color: 'bg-purple-50 text-purple-600' },
];

const formStepLabels = ['Aircraft & Pilot', 'Route & Waypoints', 'Timing & Weather', 'Contingency Plan', 'Review & File'];

export function FlightPlanPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FPStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState<FormStep>(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [corridorWidth, setCorridorWidth] = useState(100);
  const [filedPlanId, setFiledPlanId] = useState<string | null>(null);

  const activeFlights = flightPlans.filter((fp) => fp.status === 'active');

  const filtered = flightPlans.filter((fp) => {
    if (statusFilter !== 'all' && fp.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return fp.id.toLowerCase().includes(q) || fp.pilot.toLowerCase().includes(q) || fp.droneModel.toLowerCase().includes(q);
    }
    return true;
  });

  const handleFilePlan = () => {
    const num = String(flightPlans.length + 1).padStart(6, '0');
    setFiledPlanId(`SKW-FP-2026-${num}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flight Plans</h1>
          <p className="text-sm text-gray-500 mt-1">File, manage, and track flight plans</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormStep(1); setFiledPlanId(null); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          File New Flight Plan
        </button>
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
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.pulse && stat.value > 0 && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Flights Panel */}
      {activeFlights.length > 0 && (
        <div className="rounded-xl border-2 border-green-300 bg-green-50 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 border-2 border-green-400 rounded-xl animate-pulse pointer-events-none" />
          <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-green-600" />
            Active Flights
          </h2>
          <div className="space-y-4">
            {activeFlights.map((flight) => (
              <div key={flight.id} className="rounded-lg border border-green-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-gray-900">{flight.id}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-600" />
                      </span>
                      Active
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      Update Position
                    </button>
                    <button className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                      Close Flight
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Drone</p>
                    <p className="font-medium text-gray-900">{flight.drone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Pilot</p>
                    <p className="font-medium text-gray-900">{flight.pilot}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Departed</p>
                    <p className="font-medium text-gray-900">{flight.departure}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Elapsed</p>
                    <p className="font-medium text-gray-900">{flight.elapsed}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Position</p>
                    {flight.currentPos && (
                      <p className="font-mono font-medium text-gray-900">{flight.currentPos.lat}, {flight.currentPos.lng} @ {flight.currentPos.alt}ft</p>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-700">{flight.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${flight.progress}%` }} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 border border-green-200">
                    <CheckCircle size={10} />
                    On Course
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Flight Plan Form */}
      {showForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">File New Flight Plan</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle size={20} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            {formStepLabels.map((label, i) => {
              const s = (i + 1) as FormStep;
              const isActive = formStep === s;
              const isDone = formStep > s;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold flex-shrink-0',
                    isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  )}>
                    {isDone ? <CheckCircle size={14} /> : s}
                  </div>
                  <span className={clsx('text-xs font-medium hidden lg:block', isActive ? 'text-gray-900' : 'text-gray-400')}>{label}</span>
                  {i < formStepLabels.length - 1 && <div className="flex-1 h-px bg-gray-200 hidden lg:block" />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Aircraft & Pilot */}
          {formStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Registered Drone</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {registeredDrones.filter((d) => d.status === 'active').map((d) => (
                      <option key={d.ddid} value={d.ddid}>{d.ddid} — {d.model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pilot</label>
                  <input type="text" defaultValue="James Park" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Rules</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Visual (VLOS)</option>
                    <option>Instrument (BVLOS)</option>
                    <option>Special VFR (Night)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Type</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Standard</option>
                    <option>Survey</option>
                    <option>Inspection</option>
                    <option>Delivery</option>
                    <option>Training</option>
                    <option>Emergency</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Route & Waypoints */}
          {formStep === 2 && (
            <div className="space-y-4">
              {/* Map placeholder */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Interactive Map</p>
                  <p className="text-xs text-gray-400">Click to place waypoints, drag to adjust route</p>
                </div>
              </div>

              {/* Waypoint table */}
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lat</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lng</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Alt (ft)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Speed (kts)</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {formWaypoints.map((wp) => (
                      <tr key={wp.num} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-400">{wp.num}</td>
                        <td className="px-3 py-2 text-xs">
                          <span className={clsx(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium',
                            wp.type === 'Takeoff' ? 'bg-blue-50 text-blue-700' :
                            wp.type === 'Landing' ? 'bg-purple-50 text-purple-700' :
                            wp.type === 'Loiter' ? 'bg-amber-50 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          )}>
                            {wp.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-gray-900">{wp.name}</td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.lat}</td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.lng}</td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.alt}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{wp.speed}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{wp.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                <Plus size={14} />
                Add Waypoint
              </button>

              {/* Corridor width */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Corridor Width</label>
                  <span className="text-sm font-medium text-blue-600">{corridorWidth} ft</span>
                </div>
                <input
                  type="range" min={50} max={500} step={25} value={corridorWidth}
                  onChange={(e) => setCorridorWidth(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>50 ft</span>
                  <span>500 ft</span>
                </div>
              </div>

              {/* Route Summary */}
              <div className="rounded-lg border bg-blue-50 border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Route Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-blue-500">Total Distance</p>
                    <p className="font-medium text-blue-900">2.42 NM</p>
                  </div>
                  <div>
                    <p className="text-blue-500">Est. Flight Time</p>
                    <p className="font-medium text-blue-900">38 min</p>
                  </div>
                  <div>
                    <p className="text-blue-500">Max Altitude</p>
                    <p className="font-medium text-blue-900">300 ft AGL</p>
                  </div>
                  <div>
                    <p className="text-blue-500">Airspaces</p>
                    <div className="flex gap-1 mt-0.5">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Class G</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Class D</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Timing & Weather */}
          {formStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Departure</label>
                  <input type="datetime-local" defaultValue="2026-03-25T09:00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Arrival</label>
                  <input type="datetime-local" defaultValue="2026-03-25T09:38" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="rounded-lg border bg-gray-50 p-3 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">Authorization window: <span className="font-medium">09:00 &mdash; 11:00</span> (+2 hours from departure)</span>
              </div>

              {/* Weather briefing */}
              <div className="rounded-lg border bg-white p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Cloud size={16} className="text-gray-400" />
                  Weather Briefing
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Wind size={14} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Wind</p>
                      <p className="font-medium text-gray-900">8 kts from 270&deg;</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind size={14} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Gusts</p>
                      <p className="font-medium text-gray-900">12 kts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Visibility</p>
                      <p className="font-medium text-gray-900">10+ miles</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud size={14} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Ceiling</p>
                      <p className="font-medium text-gray-900">Clear</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer size={14} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Temperature</p>
                      <p className="font-medium text-gray-900">72&deg;F</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">VFR</span>
                  <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">Weather Risk: Low</span>
                </div>
                <div className="mt-3 rounded-lg bg-gray-50 border p-2">
                  <p className="text-xs text-gray-500 font-medium mb-1">Advisories</p>
                  <p className="text-xs text-gray-600">No significant weather advisories for the flight area.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contingency Plan */}
          {formStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comm Lost Action</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Return to Home</option>
                    <option>Land Immediately</option>
                    <option>Hover in Place</option>
                    <option>Continue Mission</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comm Lost Timeout (sec)</label>
                  <input type="number" defaultValue={30} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPS Lost Action</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Land Immediately</option>
                    <option>Hover in Place</option>
                    <option>Return to Home (ATTI mode)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Geofence Breach Action</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Return to Home</option>
                    <option>Hover at Boundary</option>
                    <option>Land Immediately</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Battery Low Threshold (%)</label>
                  <input type="number" defaultValue={30} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Battery Action</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Return to Home</option>
                    <option>Land at Nearest Safe Point</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Critical Battery (%)</label>
                  <input type="number" defaultValue={15} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return to Home Altitude (ft AGL)</label>
                <input type="number" defaultValue={150} className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {/* Emergency landing locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Landing Locations</label>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lat</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lng</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Surface</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {emergencyLandingLocations.map((loc) => (
                        <tr key={loc.name} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs font-medium text-gray-900">{loc.name}</td>
                          <td className="px-3 py-2 text-xs font-mono text-gray-600">{loc.lat}</td>
                          <td className="px-3 py-2 text-xs font-mono text-gray-600">{loc.lng}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{loc.surface}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Emergency contacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input type="text" placeholder="Contact name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input type="tel" placeholder="+1 555 000 0000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ATC Contact (if Class B/C/D)</label>
                  <input type="tel" placeholder="ATC phone number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & File */}
          {formStep === 5 && !filedPlanId && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Aircraft & Pilot</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Drone</span><span className="font-medium">SKW-US-A7B3X9 (DJI Mavic 3 Enterprise)</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Pilot</span><span className="font-medium">James Park</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Flight Rules</span><span className="font-medium">Visual (VLOS)</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">Inspection</span></div>
                  </div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Route</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Waypoints</span><span className="font-medium">5</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-medium">2.42 NM</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Max Alt</span><span className="font-medium">300 ft AGL</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Corridor</span><span className="font-medium">{corridorWidth} ft</span></div>
                  </div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Timing</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Departure</span><span className="font-medium">2026-03-25 09:00</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Arrival</span><span className="font-medium">2026-03-25 09:38</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Auth Window</span><span className="font-medium">09:00 &mdash; 11:00</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Weather</span><span className="font-medium text-green-600">VFR / Low Risk</span></div>
                  </div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Contingency</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Comm Lost</span><span className="font-medium">Return to Home (30s)</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">GPS Lost</span><span className="font-medium">Land Immediately</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Low Battery</span><span className="font-medium">RTH @ 30%</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">RTH Alt</span><span className="font-medium">150 ft AGL</span></div>
                  </div>
                </div>
              </div>

              {/* Airspace check */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Airspace Check Results</h4>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-green-800 font-medium">Class G</span>
                  <span className="text-xs text-green-600">&mdash; No authorization required</span>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm text-amber-800 font-medium">Class D (JFK)</span>
                  <span className="text-xs text-amber-600">&mdash; LAANC authorization will be auto-submitted</span>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2">
                  <XCircle size={16} className="text-red-500" />
                  <span className="text-sm text-red-800 font-medium">TFR active</span>
                  <span className="text-xs text-red-600">&mdash; Stadium TFR, flight plan cannot be authorized</span>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-40 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={24} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Complete route with waypoints, corridor, and airspace overlays</p>
                </div>
              </div>

              <button
                onClick={handleFilePlan}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Plane size={16} />
                File Flight Plan
              </button>
            </div>
          )}

          {/* Filed confirmation */}
          {formStep === 5 && filedPlanId && (
            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Flight Plan Filed</h3>
                <p className="text-sm text-gray-500 mt-1">Your flight plan has been submitted for authorization.</p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-4 max-w-xs mx-auto">
                <p className="text-xs text-gray-500 mb-1">Flight Plan Number</p>
                <p className="text-xl font-bold font-mono text-blue-600">{filedPlanId}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                    Filed
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          )}

          {/* Navigation */}
          {!(formStep === 5 && filedPlanId) && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => formStep > 1 && setFormStep((formStep - 1) as FormStep)}
                disabled={formStep === 1}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  formStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                )}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              {formStep < 5 && (
                <button
                  onClick={() => setFormStep((formStep + 1) as FormStep)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
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
            placeholder="Search flight plans, pilots, drones..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'draft', 'filed', 'pending_auth', 'authorized', 'active', 'completed', 'denied', 'expired'] as const).map((s) => (
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
              {s === 'all' ? 'All' : fpStatusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Plans Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500">FP #</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Drone (DDID)</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Pilot</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Departure</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Arrival</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Route</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((fp) => {
                const cfg = fpStatusConfig[fp.status];
                const isExpanded = expandedRow === fp.id;
                return (
                  <>
                    <tr
                      key={fp.id}
                      className={clsx('hover:bg-gray-50 cursor-pointer', fp.status === 'active' && 'bg-green-50/50')}
                      onClick={() => setExpandedRow(isExpanded ? null : fp.id)}
                    >
                      <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900">{fp.id}</td>
                      <td className="px-5 py-3">
                        <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.bg, cfg.text)}>
                          {cfg.dot && (
                            <span className={clsx(
                              'h-1.5 w-1.5 rounded-full',
                              cfg.dot,
                              fp.status === 'active' && 'animate-pulse'
                            )} />
                          )}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{fp.type}</td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-700">{fp.drone}</td>
                      <td className="px-5 py-3 text-gray-600">{fp.pilot}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{fp.departure}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{fp.arrival}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{fp.distance}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-gray-400 hover:text-blue-600" title="View">
                            <Eye size={16} />
                          </button>
                          {fp.status === 'draft' && (
                            <button className="text-gray-400 hover:text-gray-600" title="Edit">
                              <Edit size={16} />
                            </button>
                          )}
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : fp.id); }}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${fp.id}-detail`}>
                        <td colSpan={9} className="px-5 py-4 bg-gray-50 border-b">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Waypoints */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Waypoints</p>
                              {fp.waypoints.length > 0 ? (
                                <div className="space-y-1">
                                  {fp.waypoints.map((wp) => (
                                    <div key={wp.num} className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-400">{wp.num}.</span>
                                      <span className={clsx(
                                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                        wp.type === 'Takeoff' ? 'bg-blue-50 text-blue-700' :
                                        wp.type === 'Landing' ? 'bg-purple-50 text-purple-700' :
                                        'bg-gray-100 text-gray-700'
                                      )}>
                                        {wp.type}
                                      </span>
                                      <span className="text-gray-700">{wp.name}</span>
                                      <span className="text-gray-400 font-mono">{wp.alt}ft</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No waypoint data available</p>
                              )}
                            </div>

                            {/* Airspace transits */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Airspace Transits</p>
                              {fp.airspaces.length > 0 ? (
                                <div className="space-y-1">
                                  {fp.airspaces.map((as_, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                      {as_.status === 'clear' && <CheckCircle size={12} className="text-green-500" />}
                                      {as_.status === 'pending' && <Clock size={12} className="text-amber-500" />}
                                      {as_.status === 'denied' && <XCircle size={12} className="text-red-500" />}
                                      <span className="text-gray-700">{as_.name}</span>
                                      <span className={clsx(
                                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                        as_.status === 'clear' ? 'bg-green-50 text-green-700' :
                                        as_.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                        'bg-red-50 text-red-700'
                                      )}>
                                        {as_.status === 'clear' ? 'Authorized' : as_.status === 'pending' ? 'Pending' : 'Denied'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No airspace data</p>
                              )}
                            </div>

                            {/* Deviation alerts */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Deviation Alerts</p>
                              {fp.deviations.length > 0 ? (
                                <div className="space-y-1">
                                  {fp.deviations.map((dev, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                      <AlertTriangle size={12} className={dev.severity === 'high' ? 'text-red-500' : 'text-amber-500'} />
                                      <span className="text-gray-700">{dev.message}</span>
                                      <span className={clsx(
                                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                        dev.severity === 'high' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                      )}>
                                        {dev.severity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle size={12} />
                                  No deviations
                                </p>
                              )}
                            </div>
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
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Plane size={32} className="mb-2" />
            <p className="text-sm">No flight plans match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
