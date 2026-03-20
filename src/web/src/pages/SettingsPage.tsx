import { useState } from 'react';
import {
  Settings, User, Bell, Users, Shield, Key,
  Smartphone, Mail, Globe, Save, Plus, Trash2,
  Eye, EyeOff, Copy, RefreshCw, ChevronRight,
  Lock, Monitor,
} from 'lucide-react';
import { clsx } from 'clsx';

type TabId = 'account' | 'notifications' | 'team' | 'security' | 'api';

const tabs: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'team', label: 'Team Management', icon: Users },
  { id: 'security', label: 'Security & MFA', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
];

const teamMembers = [
  { id: 1, name: 'James Park', email: 'james.park@example.com', role: 'Pilot', status: 'Active', lastLogin: '2026-03-20' },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@example.com', role: 'Lead Pilot', status: 'Active', lastLogin: '2026-03-20' },
  { id: 3, name: 'Alex Turner', email: 'alex.turner@example.com', role: 'Pilot', status: 'Active', lastLogin: '2026-03-19' },
  { id: 4, name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'Fleet Manager', status: 'Active', lastLogin: '2026-03-18' },
  { id: 5, name: 'David Kim', email: 'david.kim@example.com', role: 'Pilot', status: 'Invited', lastLogin: '—' },
];

const apiKeys = [
  { id: 'key_1', name: 'Production API', key: 'c6m_live_sk_...7f3a', created: '2026-01-15', lastUsed: '2026-03-20', status: 'Active' },
  { id: 'key_2', name: 'Staging API', key: 'c6m_test_sk_...9b2c', created: '2026-02-01', lastUsed: '2026-03-19', status: 'Active' },
  { id: 'key_3', name: 'CI/CD Pipeline', key: 'c6m_live_sk_...1d4e', created: '2025-11-20', lastUsed: '2026-03-15', status: 'Active' },
];

const notificationPrefs = [
  { id: 'mission_updates', label: 'Mission Updates', description: 'Notifications for mission status changes', email: true, push: true, sms: false },
  { id: 'laanc_status', label: 'LAANC Status', description: 'Authorization approvals, denials, and expirations', email: true, push: true, sms: true },
  { id: 'tfr_alerts', label: 'TFR Alerts', description: 'New temporary flight restrictions in your areas', email: true, push: true, sms: true },
  { id: 'maintenance', label: 'Maintenance Reminders', description: 'Drone maintenance due dates and overdue alerts', email: true, push: false, sms: false },
  { id: 'compliance', label: 'Compliance Updates', description: 'Framework compliance changes and audit notifications', email: true, push: false, sms: false },
  { id: 'team', label: 'Team Activity', description: 'New members, role changes, and access reviews', email: false, push: false, sms: false },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('account');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account, team, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Account settings */}
          {activeTab === 'account' && (
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" defaultValue="Jordan Mitchell" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" defaultValue="jordan@c6maceye.io" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input type="text" defaultValue="SkyOps Aviation LLC" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Persona</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Enterprise Manager</option>
                    <option>Individual Pilot</option>
                    <option>Agency Representative</option>
                    <option>Developer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FAA Part 107 Certificate #</label>
                  <input type="text" defaultValue="4087213" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>America/Los_Angeles (PT)</option>
                    <option>America/Denver (MT)</option>
                    <option>America/Chicago (CT)</option>
                    <option>America/New_York (ET)</option>
                  </select>
                </div>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-medium text-gray-500">Notification</th>
                      <th className="pb-3 text-center font-medium text-gray-500 w-20">
                        <div className="flex items-center justify-center gap-1"><Mail size={14} /> Email</div>
                      </th>
                      <th className="pb-3 text-center font-medium text-gray-500 w-20">
                        <div className="flex items-center justify-center gap-1"><Monitor size={14} /> Push</div>
                      </th>
                      <th className="pb-3 text-center font-medium text-gray-500 w-20">
                        <div className="flex items-center justify-center gap-1"><Smartphone size={14} /> SMS</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {notificationPrefs.map((pref) => (
                      <tr key={pref.id}>
                        <td className="py-3">
                          <p className="font-medium text-gray-900">{pref.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{pref.description}</p>
                        </td>
                        <td className="py-3 text-center">
                          <input type="checkbox" defaultChecked={pref.email} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="py-3 text-center">
                          <input type="checkbox" defaultChecked={pref.push} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="py-3 text-center">
                          <input type="checkbox" defaultChecked={pref.sms} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                <Save size={16} />
                Save Preferences
              </button>
            </div>
          )}

          {/* Team management */}
          {activeTab === 'team' && (
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Plus size={16} />
                  Invite Member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Email</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Last Login</th>
                      <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">{member.name}</td>
                        <td className="px-6 py-3 text-gray-600">{member.email}</td>
                        <td className="px-6 py-3 text-gray-600">{member.role}</td>
                        <td className="px-6 py-3">
                          <span className={clsx(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            member.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                          )}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs">{member.lastLogin}</td>
                        <td className="px-6 py-3 text-right">
                          <button className="text-gray-400 hover:text-red-500" title="Remove">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security & MFA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Multi-Factor Authentication</h2>
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <Shield size={24} className="text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">MFA is enabled</p>
                      <p className="text-sm text-green-600">Authenticator app configured on Mar 1, 2026</p>
                    </div>
                  </div>
                  <button className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
                    Reconfigure
                  </button>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="rounded-lg border p-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Authenticator App</span>
                    </div>
                    <p className="text-xs text-gray-500">TOTP via Google Authenticator or similar</p>
                    <span className="inline-flex mt-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                  </div>
                  <div className="rounded-lg border p-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Key size={16} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">Security Keys</span>
                    </div>
                    <p className="text-xs text-gray-500">WebAuthn/FIDO2 hardware keys</p>
                    <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">Add Security Key</button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Password</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  <Lock size={16} />
                  Update Password
                </button>
              </div>

              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Monitor size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Chrome on Windows 11</p>
                        <p className="text-xs text-gray-500">Seattle, WA — Current session</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Smartphone size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Safari on iPhone 15</p>
                        <p className="text-xs text-gray-500">Seattle, WA — 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-xs text-red-600 font-medium hover:text-red-700">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="rounded-xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    <Plus size={16} />
                    Create Key
                  </button>
                </div>
                <div className="divide-y">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{apiKey.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <code className="text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-600 font-mono">{apiKey.key}</code>
                          <button className="text-gray-400 hover:text-gray-600" title="Copy">
                            <Copy size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Created {apiKey.created} / Last used {apiKey.lastUsed}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-blue-600" title="Regenerate">
                          <RefreshCw size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-red-500" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border bg-amber-50 border-amber-200 p-5">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">API Key Security</p>
                    <p className="text-xs text-amber-700 mt-1">
                      API keys grant full access to your account. Keep them secure and never commit them to version control.
                      Rotate keys regularly and revoke any that may have been compromised.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
