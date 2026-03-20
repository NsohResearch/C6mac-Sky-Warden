import { useState } from 'react';
import {
  Radio, Plane, Shield, CheckCircle, Map, Plus,
  ArrowUpRight, ArrowDownRight, Clock, Activity,
  TrendingUp, AlertTriangle, FileCheck, Eye,
} from 'lucide-react';
import { clsx } from 'clsx';

const summaryCards = [
  {
    label: 'Total Drones',
    value: 24,
    change: '+3',
    trend: 'up' as const,
    icon: Radio,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Active Missions',
    value: 7,
    change: '+2',
    trend: 'up' as const,
    icon: Plane,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'LAANC Authorizations',
    value: 18,
    change: '-1',
    trend: 'down' as const,
    icon: Shield,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    label: 'Compliance Score',
    value: '94%',
    change: '+2%',
    trend: 'up' as const,
    icon: CheckCircle,
    color: 'bg-green-50 text-green-600',
  },
];

const recentActivity = [
  { id: 1, action: 'LAANC authorization auto-approved', detail: 'DJI Mavic 3 — Class C, SFO', time: '5 min ago', icon: Shield, iconColor: 'text-green-500' },
  { id: 2, action: 'Mission completed', detail: 'Infrastructure Inspection — Tower 14B', time: '23 min ago', icon: CheckCircle, iconColor: 'text-blue-500' },
  { id: 3, action: 'Drone maintenance overdue', detail: 'Autel EVO II — 120 hrs since last service', time: '1 hr ago', icon: AlertTriangle, iconColor: 'text-amber-500' },
  { id: 4, action: 'New TFR posted', detail: 'TFR 4/2187 — Presidential movement, DCA', time: '2 hrs ago', icon: AlertTriangle, iconColor: 'text-red-500' },
  { id: 5, action: 'Pilot certification renewed', detail: 'Sarah Chen — Part 107 valid through Mar 2028', time: '3 hrs ago', icon: FileCheck, iconColor: 'text-purple-500' },
  { id: 6, action: 'Mission created', detail: 'Solar Farm Survey — Riverside County', time: '4 hrs ago', icon: Plane, iconColor: 'text-blue-500' },
];

const quickActions = [
  { label: 'Check Airspace', icon: Map, href: '/airspace', color: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'New Mission', icon: Plus, href: '/missions', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'Request LAANC', icon: Shield, href: '/laanc', color: 'bg-purple-600 hover:bg-purple-700' },
];

const upcomingMissions = [
  { id: 'm1', name: 'Bridge Inspection — SR-520', pilot: 'James Park', time: 'Today, 2:00 PM', status: 'planned' },
  { id: 'm2', name: 'Agricultural Survey — Lot 7', pilot: 'Maria Santos', time: 'Today, 4:30 PM', status: 'planned' },
  { id: 'm3', name: 'Rooftop Mapping — Block C', pilot: 'Alex Turner', time: 'Tomorrow, 9:00 AM', status: 'draft' },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your UAS operations</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity size={16} />
          <span>Last updated: just now</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
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

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              className={clsx(
                'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors',
                action.color
              )}
            >
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="divide-y">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="mt-0.5">
                    <Icon size={18} className={item.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming missions */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Upcoming Missions</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">See All</button>
          </div>
          <div className="divide-y">
            {upcomingMissions.map((mission) => (
              <div key={mission.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{mission.name}</p>
                  <span className={clsx(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    mission.status === 'planned' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {mission.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{mission.pilot}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock size={12} />
                  {mission.time}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t px-5 py-3">
            <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 w-full justify-center">
              <Plus size={16} />
              Create Mission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
