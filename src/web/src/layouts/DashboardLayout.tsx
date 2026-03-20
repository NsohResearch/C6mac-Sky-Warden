import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutDashboard, Map, Shield, Plane, Radio, BarChart3,
  Settings, LogOut, Menu, X, ChevronDown, Bell,
  Building2, Code2, Users, FileCheck, AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  permissions?: string[];
  personas?: string[];
};

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Airspace Map', path: '/airspace', icon: <Map size={20} /> },
  { label: 'LAANC Authorization', path: '/laanc', icon: <Shield size={20} /> },
  { label: 'Missions', path: '/missions', icon: <Plane size={20} /> },
  { label: 'Fleet', path: '/fleet', icon: <Radio size={20} />, personas: ['individual_pilot', 'enterprise_manager'] },
  { label: 'Compliance', path: '/compliance', icon: <FileCheck size={20} />, personas: ['enterprise_manager', 'agency_representative'] },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
  { label: 'Agency Rules', path: '/agency', icon: <Building2 size={20} />, personas: ['agency_representative'] },
  { label: 'Developer Portal', path: '/developer', icon: <Code2 size={20} />, personas: ['developer'] },
  { label: 'Team', path: '/settings', icon: <Users size={20} />, personas: ['enterprise_manager'] },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const filteredNav = navItems.filter(
    (item) => !item.personas || item.personas.includes(user?.persona ?? '')
  );

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const personaLabel = {
    individual_pilot: 'Individual Pilot',
    enterprise_manager: 'Enterprise UAS',
    agency_representative: 'Agency',
    developer: 'Developer',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-white transition-all duration-300 lg:relative',
          sidebarOpen ? 'w-[280px]' : 'w-[72px]',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-sm">
            C6
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">C6macEye</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Airspace Mgmt</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {filteredNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    )
                  }
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-800 p-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-medium">
                {user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{user?.displayName}</p>
                <p className="truncate text-xs text-gray-400">
                  {personaLabel[user?.persona as keyof typeof personaLabel] ?? 'User'}
                </p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="mx-auto flex text-gray-400 hover:text-white">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              className="hidden lg:block text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative text-gray-500 hover:text-gray-700">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                3
              </span>
            </button>

            {/* FAA Compliance Badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
              <Shield size={12} />
              FAA Approved
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
