import { useState } from 'react';
import {
  Code2, Key, Webhook, BarChart3, Plus, Copy,
  Eye, EyeOff, RefreshCw, Trash2, CheckCircle,
  Clock, AlertTriangle, Terminal, BookOpen, Play,
  Server, Globe, Zap, ArrowUpRight, Shield,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

const usageStats = [
  { label: 'API Calls (Today)', value: '12,847', change: '+18%', icon: Zap, color: 'bg-blue-50 text-blue-600' },
  { label: 'Active API Keys', value: '3', change: '0', icon: Key, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Webhooks', value: '5', change: '+1', icon: Webhook, color: 'bg-purple-50 text-purple-600' },
  { label: 'Avg Response Time', value: '142ms', change: '-8ms', icon: Clock, color: 'bg-amber-50 text-amber-600' },
];

const apiKeys = [
  { id: 'key_1', name: 'Production', prefix: 'c6m_live_sk_', lastFour: '7f3a', created: '2026-01-15', lastUsed: '2 min ago', calls: '8,241', status: 'active' },
  { id: 'key_2', name: 'Staging', prefix: 'c6m_test_sk_', lastFour: '9b2c', created: '2026-02-01', lastUsed: '1 hr ago', calls: '3,892', status: 'active' },
  { id: 'key_3', name: 'CI/CD Pipeline', prefix: 'c6m_live_sk_', lastFour: '1d4e', created: '2025-11-20', lastUsed: '5 hrs ago', calls: '714', status: 'active' },
];

const webhooks = [
  { id: 'wh_1', url: 'https://api.myapp.com/webhooks/c6mac', events: ['mission.completed', 'laanc.approved'], status: 'active', lastDelivery: '3 min ago', successRate: '99.8%' },
  { id: 'wh_2', url: 'https://slack.com/api/hooks/T0G9P...', events: ['laanc.denied', 'incident.created'], status: 'active', lastDelivery: '2 hrs ago', successRate: '100%' },
  { id: 'wh_3', url: 'https://hooks.zapier.com/hooks/catch/...', events: ['drone.maintenance_due'], status: 'active', lastDelivery: '1 day ago', successRate: '97.2%' },
  { id: 'wh_4', url: 'https://myerp.example.com/api/drone-data', events: ['mission.completed'], status: 'failing', lastDelivery: '3 days ago', successRate: '45.0%' },
  { id: 'wh_5', url: 'https://analytics.internal/ingest', events: ['telemetry.batch'], status: 'active', lastDelivery: '30 sec ago', successRate: '99.9%' },
];

const apiEndpoints = [
  { method: 'GET', path: '/api/v1/airspace/check', description: 'Check airspace at coordinates', rateLimit: '100/min' },
  { method: 'POST', path: '/api/v1/laanc/request', description: 'Submit LAANC authorization request', rateLimit: '30/min' },
  { method: 'GET', path: '/api/v1/missions', description: 'List all missions', rateLimit: '60/min' },
  { method: 'POST', path: '/api/v1/missions', description: 'Create a new mission', rateLimit: '30/min' },
  { method: 'GET', path: '/api/v1/fleet', description: 'List registered drones', rateLimit: '60/min' },
  { method: 'GET', path: '/api/v1/compliance/status', description: 'Get compliance framework status', rateLimit: '30/min' },
  { method: 'POST', path: '/api/v1/telemetry', description: 'Ingest drone telemetry data', rateLimit: '1000/min' },
  { method: 'GET', path: '/api/v1/remote-id/track', description: 'Query Remote ID broadcasts', rateLimit: '120/min' },
];

const sandboxEnvironments = [
  { name: 'Development', url: 'https://sandbox-dev.c6maceye.io', status: 'running', created: '2026-02-15', expires: '2026-05-15' },
  { name: 'Integration Testing', url: 'https://sandbox-int.c6maceye.io', status: 'running', created: '2026-03-01', expires: '2026-06-01' },
  { name: 'Load Testing', url: 'https://sandbox-load.c6maceye.io', status: 'stopped', created: '2026-03-10', expires: '2026-04-10' },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
};

export function DeveloperDashboard() {
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Portal</h1>
          <p className="text-sm text-gray-500 mt-1">API keys, webhooks, and integration tools</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <BookOpen size={16} />
            API Docs
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            <Terminal size={16} />
            API Console
          </button>
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {usageStats.map((stat) => {
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

      {/* Quick start */}
      <div className="rounded-xl border bg-gradient-to-r from-gray-900 to-gray-800 p-6 shadow-sm text-white">
        <h2 className="text-lg font-semibold mb-2">Quick Start</h2>
        <p className="text-sm text-gray-300 mb-4">Get started with the C6macEye API in seconds</p>
        <div className="rounded-lg bg-black/40 p-4 font-mono text-sm overflow-x-auto">
          <div className="text-gray-400"># Check airspace at coordinates</div>
          <div className="text-green-400 mt-1">
            curl -X GET "https://api.c6maceye.io/v1/airspace/check?lat=37.7749&lng=-122.4194&alt=200" \
          </div>
          <div className="text-green-400 pl-4">
            -H "Authorization: Bearer c6m_live_sk_YOUR_KEY"
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
            <Copy size={14} />
            Copy
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
            <Play size={14} />
            Try in Console
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API keys */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">API Keys</h2>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              <Plus size={14} />
              Create Key
            </button>
          </div>
          <div className="divide-y">
            {apiKeys.map((key) => (
              <div key={key.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{key.name}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showKeyId === key.id ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button className="text-gray-400 hover:text-gray-600"><Copy size={14} /></button>
                    <button className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <code className="text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-600 font-mono">
                  {showKeyId === key.id ? `${key.prefix}full_key_would_be_here_${key.lastFour}` : `${key.prefix}...${key.lastFour}`}
                </code>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                  <span>{key.calls} calls</span>
                  <span>Last used {key.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">Webhooks</h2>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              <Plus size={14} />
              Add Webhook
            </button>
          </div>
          <div className="divide-y max-h-[320px] overflow-y-auto">
            {webhooks.map((wh) => (
              <div key={wh.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs text-gray-600 font-mono truncate max-w-[260px]">{wh.url}</code>
                  <span className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    wh.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  )}>
                    {wh.status === 'active' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                    {wh.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {wh.events.map((ev) => (
                    <span key={ev} className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 font-mono">{ev}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                  <span>Last: {wh.lastDelivery}</span>
                  <span>Success: {wh.successRate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API endpoints reference */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">API Endpoints</h2>
          <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Full Documentation
            <ExternalLink size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left font-medium text-gray-500 w-20">Method</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Endpoint</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Description</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Rate Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {apiEndpoints.map((ep) => (
                <tr key={ep.path} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <span className={clsx('inline-flex rounded px-2 py-0.5 text-xs font-bold font-mono', methodColors[ep.method])}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-900">{ep.path}</td>
                  <td className="px-5 py-3 text-gray-600">{ep.description}</td>
                  <td className="px-5 py-3 text-right text-gray-500 text-xs">{ep.rateLimit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sandbox environments */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <Server size={18} />
            Sandbox Environments
          </h2>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            <Plus size={14} />
            New Sandbox
          </button>
        </div>
        <div className="divide-y">
          {sandboxEnvironments.map((env) => (
            <div key={env.name} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-gray-900">{env.name}</p>
                <code className="text-xs text-gray-500 font-mono">{env.url}</code>
                <p className="text-xs text-gray-400 mt-0.5">Created {env.created} / Expires {env.expires}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  env.status === 'running' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                )}>
                  <span className={clsx('h-1.5 w-1.5 rounded-full', env.status === 'running' ? 'bg-green-500' : 'bg-gray-400')} />
                  {env.status}
                </span>
                {env.status === 'stopped' ? (
                  <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    <Play size={12} />
                    Start
                  </button>
                ) : (
                  <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    <Globe size={12} />
                    Open
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
