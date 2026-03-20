import { useState } from 'react';
import {
  Palette, CheckCircle, Circle, Upload, Trash2, Copy, X,
  Globe, Mail, Plus, RefreshCw, Shield, Eye, ChevronDown,
  ExternalLink, AlertTriangle, Clock, XCircle, Flag,
  Type, Image, Monitor, Lock, Sparkles, Languages, Ruler,
  Save,
} from 'lucide-react';
import { clsx } from 'clsx';

// ── Types ──────────────────────────────────────────────────────────────
type TabId = 'overview' | 'branding' | 'colors' | 'login' | 'domains' | 'localization';
type WlStatus = 'draft' | 'active' | 'suspended';
type PresetId = 'aviation_dark' | 'aviation_light' | 'government' | 'corporate' | 'military' | 'custom';
type LoginLayout = 'centered' | 'split_left' | 'split_right';
type BgType = 'solid' | 'gradient' | 'image' | 'video';
type DomainStatus = 'pending_dns' | 'verifying' | 'active' | 'failed';
type SslStatus = 'provisioning' | 'active' | 'expired';

// ── Mock Data ──────────────────────────────────────────────────────────
const tabs: { id: TabId; label: string; icon: typeof Palette }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'branding', label: 'Branding', icon: Image },
  { id: 'colors', label: 'Colors & Typography', icon: Palette },
  { id: 'login', label: 'Login Page', icon: Lock },
  { id: 'domains', label: 'Domains & Email', icon: Globe },
  { id: 'localization', label: 'Localization', icon: Languages },
];

const presets: { id: PresetId; name: string; colors: string[] }[] = [
  { id: 'aviation_dark', name: 'Aviation Dark', colors: ['#0f172a', '#1e40af', '#3b82f6', '#60a5fa', '#f8fafc'] },
  { id: 'aviation_light', name: 'Aviation Light', colors: ['#f8fafc', '#2563eb', '#3b82f6', '#93c5fd', '#0f172a'] },
  { id: 'government', name: 'Government Official', colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#ffffff'] },
  { id: 'corporate', name: 'Corporate Blue', colors: ['#ffffff', '#1e3a5f', '#4a90d9', '#7fb3e0', '#2c3e50'] },
  { id: 'military', name: 'Military Green', colors: ['#1a1a1a', '#2d4a22', '#4a7c3f', '#6b8f5e', '#c8d6c0'] },
];

const logoSlots = ['Primary', 'Light', 'Dark', 'Icon', 'Wide', 'Seal'] as const;
const poweredByPositions = ['Footer', 'Sidebar', 'Login', 'Hidden'] as const;

const colorGroups = {
  'Primary Colors': [
    { key: 'primary', label: 'Primary', value: '#2563eb' },
    { key: 'primaryFg', label: 'Primary Foreground', value: '#ffffff' },
    { key: 'primaryHover', label: 'Primary Hover', value: '#1d4ed8' },
  ],
  Secondary: [
    { key: 'secondary', label: 'Secondary', value: '#64748b' },
    { key: 'secondaryFg', label: 'Secondary Foreground', value: '#ffffff' },
    { key: 'accent', label: 'Accent', value: '#8b5cf6' },
    { key: 'accentFg', label: 'Accent Foreground', value: '#ffffff' },
  ],
  Backgrounds: [
    { key: 'pageBg', label: 'Page Background', value: '#f8fafc' },
    { key: 'surface', label: 'Surface', value: '#ffffff' },
    { key: 'sidebarBg', label: 'Sidebar Background', value: '#0f172a' },
    { key: 'sidebarFg', label: 'Sidebar Foreground', value: '#e2e8f0' },
    { key: 'sidebarAccent', label: 'Sidebar Accent', value: '#3b82f6' },
  ],
  Text: [
    { key: 'textPrimary', label: 'Primary Text', value: '#0f172a' },
    { key: 'textSecondary', label: 'Secondary Text', value: '#475569' },
    { key: 'textMuted', label: 'Muted Text', value: '#94a3b8' },
  ],
  Borders: [
    { key: 'border', label: 'Border', value: '#e2e8f0' },
    { key: 'borderHover', label: 'Border Hover', value: '#cbd5e1' },
  ],
  Status: [
    { key: 'success', label: 'Success', value: '#16a34a' },
    { key: 'warning', label: 'Warning', value: '#d97706' },
    { key: 'danger', label: 'Danger', value: '#dc2626' },
    { key: 'info', label: 'Info', value: '#2563eb' },
  ],
};

const chartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#6366f1'];

const fontOptions = ['Inter', 'DM Sans', 'Outfit', 'Source Sans Pro', 'Poppins', 'Roboto', 'System UI'];
const monoFontOptions = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Cascadia Code'];

const countries = [
  { code: 'US', flag: '\u{1F1FA}\u{1F1F8}', name: 'United States', authority: 'FAA' },
  { code: 'CA', flag: '\u{1F1E8}\u{1F1E6}', name: 'Canada', authority: 'Transport Canada' },
  { code: 'NG', flag: '\u{1F1F3}\u{1F1EC}', name: 'Nigeria', authority: 'NCAA' },
  { code: 'KE', flag: '\u{1F1F0}\u{1F1EA}', name: 'Kenya', authority: 'KCAA' },
  { code: 'ZA', flag: '\u{1F1FF}\u{1F1E6}', name: 'South Africa', authority: 'SACAA' },
  { code: 'GH', flag: '\u{1F1EC}\u{1F1ED}', name: 'Ghana', authority: 'GCAA' },
  { code: 'RW', flag: '\u{1F1F7}\u{1F1FC}', name: 'Rwanda', authority: 'RCAA' },
  { code: 'TZ', flag: '\u{1F1F9}\u{1F1FF}', name: 'Tanzania', authority: 'TCAA' },
  { code: 'UG', flag: '\u{1F1FA}\u{1F1EC}', name: 'Uganda', authority: 'UCAA' },
  { code: 'ET', flag: '\u{1F1EA}\u{1F1F9}', name: 'Ethiopia', authority: 'ECAA' },
  { code: 'SN', flag: '\u{1F1F8}\u{1F1F3}', name: 'Senegal', authority: 'ANACIM' },
  { code: 'CI', flag: '\u{1F1E8}\u{1F1EE}', name: "C\u{f4}te d'Ivoire", authority: 'ANAC' },
  { code: 'GB', flag: '\u{1F1EC}\u{1F1E7}', name: 'United Kingdom', authority: 'CAA UK' },
  { code: 'FR', flag: '\u{1F1EB}\u{1F1F7}', name: 'France', authority: 'DGAC' },
  { code: 'DE', flag: '\u{1F1E9}\u{1F1EA}', name: 'Germany', authority: 'LBA' },
  { code: 'AU', flag: '\u{1F1E6}\u{1F1FA}', name: 'Australia', authority: 'CASA' },
  { code: 'AE', flag: '\u{1F1E6}\u{1F1EA}', name: 'UAE', authority: 'GCAA UAE' },
  { code: 'IN', flag: '\u{1F1EE}\u{1F1F3}', name: 'India', authority: 'DGCA' },
  { code: 'BR', flag: '\u{1F1E7}\u{1F1F7}', name: 'Brazil', authority: 'ANAC Brazil' },
  { code: 'JP', flag: '\u{1F1EF}\u{1F1F5}', name: 'Japan', authority: 'MLIT/JCAB' },
];

const languageOptions = [
  'English', 'French', 'Spanish', 'Portuguese', 'German', 'Swahili',
  'Arabic', 'Hausa', 'Yoruba', 'Amharic', 'Japanese', 'Hindi',
];

const terminologyDefaults = [
  { platform: 'LAANC', custom: 'LAANC' },
  { platform: 'FAA', custom: 'FAA' },
  { platform: 'Part 107', custom: 'Part 107' },
  { platform: 'Drone', custom: 'Drone' },
  { platform: 'Airspace Authorization', custom: 'Airspace Authorization' },
  { platform: 'Remote ID', custom: 'Remote ID' },
];

const domainStatusConfig: Record<DomainStatus, { label: string; bg: string; text: string }> = {
  pending_dns: { label: 'Pending DNS', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  verifying: { label: 'Verifying', bg: 'bg-blue-50', text: 'text-blue-700' },
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700' },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700' },
};

const sslStatusConfig: Record<SslStatus, { label: string; bg: string; text: string }> = {
  provisioning: { label: 'Provisioning', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700' },
  expired: { label: 'Expired', bg: 'bg-red-50', text: 'text-red-700' },
};

// ── Component ──────────────────────────────────────────────────────────
export function WhiteLabelPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Overview state
  const [wlStatus, setWlStatus] = useState<WlStatus>('active');

  // Branding state
  const [selectedPreset, setSelectedPreset] = useState<PresetId>('aviation_dark');
  const [poweredByPosition, setPoweredByPosition] = useState<string>('Footer');
  const [showPoweredBy, setShowPoweredBy] = useState(true);

  // Colors state
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.values(colorGroups).flat().forEach((c) => { initial[c.key] = c.value; });
    return initial;
  });
  const [chartColorState, setChartColorState] = useState([...chartColors]);
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('DM Sans');
  const [monoFont, setMonoFont] = useState('JetBrains Mono');
  const [baseFontSize, setBaseFontSize] = useState(14);
  const [headingWeight, setHeadingWeight] = useState(700);

  // Login state
  const [loginLayout, setLoginLayout] = useState<LoginLayout>('split_left');
  const [bgType, setBgType] = useState<BgType>('gradient');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [bgGradient, setBgGradient] = useState('from-blue-900 to-slate-900');
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [overlayOpacity, setOverlayOpacity] = useState(40);
  const [welcomeTitle, setWelcomeTitle] = useState('Welcome to ACME Aviation');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('Secure drone operations management platform');
  const [showHelp, setShowHelp] = useState(true);
  const [showSignup, setShowSignup] = useState(true);
  const [showTestimonial, setShowTestimonial] = useState(true);
  const [testimonialText, setTestimonialText] = useState('Sky Warden transformed our drone compliance workflow. We went from days of paperwork to automated LAANC approvals in minutes.');
  const [testimonialAuthor, setTestimonialAuthor] = useState('Sarah Chen, Operations Director');
  const [showNationalFlag, setShowNationalFlag] = useState(false);
  const [flagCountry, setFlagCountry] = useState('US');
  const [showRegBadge, setShowRegBadge] = useState(false);

  // Domain state
  const [subdomain, setSubdomain] = useState('acme');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [fromName, setFromName] = useState('ACME Aviation');
  const [fromEmail, setFromEmail] = useState('noreply@acme-aviation.com');
  const [replyTo, setReplyTo] = useState('support@acme-aviation.com');
  const [footerText, setFooterText] = useState('\u{a9} 2026 ACME Aviation. All rights reserved.');
  const [socialLinks, setSocialLinks] = useState([
    { type: 'Website', url: 'https://acme-aviation.com' },
    { type: 'LinkedIn', url: 'https://linkedin.com/company/acme-aviation' },
  ]);

  // Localization state
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [defaultLang, setDefaultLang] = useState('English');
  const [supportedLangs, setSupportedLangs] = useState(['English', 'French', 'Spanish']);
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [timezone, setTimezone] = useState('America/New_York');
  const [distanceUnit, setDistanceUnit] = useState('feet');
  const [altitudeUnit, setAltitudeUnit] = useState('feet');
  const [speedUnit, setSpeedUnit] = useState('mph');
  const [tempUnit, setTempUnit] = useState('\u{b0}F');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [terminology, setTerminology] = useState([...terminologyDefaults]);

  const selectedCountryObj = countries.find((c) => c.code === selectedCountry);

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleChartColorChange = (index: number, value: string) => {
    setChartColorState((prev) => { const n = [...prev]; n[index] = value; return n; });
  };

  const handleSubdomainCheck = () => {
    if (newSubdomain.length >= 3 && /^[a-z0-9-]+$/.test(newSubdomain)) {
      setSubdomainAvailable(!['admin', 'api', 'app', 'www'].includes(newSubdomain));
    } else {
      setSubdomainAvailable(false);
    }
  };

  const wlStatusConfig: Record<WlStatus, { label: string; bg: string; text: string }> = {
    draft: { label: 'Draft', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    active: { label: 'Active', bg: 'bg-green-50', text: 'text-green-700' },
    suspended: { label: 'Suspended', bg: 'bg-red-50', text: 'text-red-700' },
  };

  const stCfg = wlStatusConfig[wlStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-800 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Palette size={28} />
          <div>
            <h1 className="text-2xl font-bold">White-Label Branding</h1>
            <p className="text-sm text-purple-100">Customize the look, feel, and identity of your Sky Warden platform</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
            <Shield size={12} />
            Enterprise / Agency Only
          </span>
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', stCfg.bg, stCfg.text)}>
            {stCfg.label}
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-col lg:flex-row gap-6">
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

        <div className="flex-1 min-w-0">
          {/* ═══════════════ TAB 1: OVERVIEW ═══════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status card */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">White-Label Status</h2>
                      <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', stCfg.bg, stCfg.text)}>
                        {stCfg.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Activation Date</p>
                        <p className="font-medium text-gray-900">2026-02-15</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Subdomain</p>
                        <p className="font-mono text-sm font-medium text-blue-600">acme.skywarden.app</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Subscription Tier</p>
                        <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">Enterprise</span>
                      </div>
                      <div>
                        <p className="text-gray-500">Organization</p>
                        <p className="font-medium text-gray-900">ACME Aviation LLC</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 lg:items-end">
                    {wlStatus === 'active' ? (
                      <button
                        onClick={() => setWlStatus('suspended')}
                        className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={16} />
                        Deactivate White Label
                      </button>
                    ) : (
                      <button
                        onClick={() => setWlStatus('active')}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <Sparkles size={16} />
                        Activate White Label
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick preview */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Preview</h2>
                <div className="rounded-lg border overflow-hidden">
                  <div className="flex h-64">
                    {/* Mini sidebar */}
                    <div className="w-48 flex-shrink-0 flex flex-col" style={{ backgroundColor: colors.sidebarBg }}>
                      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: colors.primary }}>
                          A
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: colors.sidebarFg }}>ACME Aviation</p>
                          <p className="text-[9px]" style={{ color: colors.textMuted }}>Airspace Mgmt</p>
                        </div>
                      </div>
                      <div className="px-2 py-2 space-y-0.5">
                        {['Dashboard', 'Airspace', 'Missions', 'Fleet'].map((item, i) => (
                          <div
                            key={item}
                            className={clsx('rounded px-2 py-1.5 text-[10px] font-medium', i === 0 ? 'text-white' : '')}
                            style={i === 0 ? { backgroundColor: `${colors.sidebarAccent}33`, color: colors.sidebarAccent } : { color: colors.sidebarFg }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Mini main area */}
                    <div className="flex-1 p-4" style={{ backgroundColor: colors.pageBg }}>
                      <div className="flex gap-3 mb-3">
                        {[
                          { label: 'Active Drones', val: '12' },
                          { label: 'Missions Today', val: '5' },
                          { label: 'Compliance', val: '98%' },
                        ].map((stat) => (
                          <div key={stat.label} className="flex-1 rounded-lg p-3 shadow-sm" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                            <p className="text-[9px]" style={{ color: colors.textMuted }}>{stat.label}</p>
                            <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>{stat.val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded px-3 py-1.5 text-[10px] font-medium text-white" style={{ backgroundColor: colors.primary }}>
                          Primary
                        </button>
                        <button className="rounded px-3 py-1.5 text-[10px] font-medium text-white" style={{ backgroundColor: colors.secondary }}>
                          Secondary
                        </button>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>
                          Active
                        </span>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${colors.warning}20`, color: colors.warning }}>
                          Warning
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Setup checklist */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Progress</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Organization name set', done: true },
                    { label: 'Primary logo uploaded', done: true },
                    { label: 'Color palette configured', done: true },
                    { label: 'Custom domain configured (optional)', done: false },
                    { label: 'Email domain verified (optional)', done: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      {item.done ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <Circle size={18} className="text-gray-300" />
                      )}
                      <span className={clsx('text-sm', item.done ? 'text-gray-900' : 'text-gray-500')}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">3 of 5 steps completed</p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ TAB 2: BRANDING ═══════════════ */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Preset Selector */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Theme Preset</h2>
                <p className="text-sm text-gray-500 mb-4">Choose a preset or create a fully custom theme</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={clsx(
                        'rounded-lg border-2 p-3 text-center transition-all',
                        selectedPreset === preset.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {preset.colors.map((color, i) => (
                          <div key={i} className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <p className="text-xs font-medium text-gray-700">{preset.name}</p>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedPreset('custom')}
                    className={clsx(
                      'rounded-lg border-2 border-dashed p-3 text-center transition-all',
                      selectedPreset === 'custom'
                        ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Palette size={20} className="text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">Custom</p>
                  </button>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Logos</h2>
                <p className="text-sm text-gray-500 mb-4">Upload logos for different contexts (SVG, PNG, or WebP, max 2MB)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {logoSlots.map((slot) => (
                    <div key={slot} className="text-center">
                      <div className="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                        {slot === 'Primary' ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                            A
                          </div>
                        ) : (
                          <Upload size={20} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-700 mt-1.5">{slot}</p>
                      <p className="text-[10px] text-gray-400">
                        {slot === 'Icon' ? '64x64' : slot === 'Wide' ? '400x80' : slot === 'Seal' ? '200x200' : '200x60'}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <button className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">Upload</button>
                        {slot === 'Primary' && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button className="text-[10px] text-red-500 hover:text-red-600 font-medium">Remove</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Powered By */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Powered by Sky Warden</h2>
                    <p className="text-sm text-gray-500">Control whether the Sky Warden badge appears</p>
                  </div>
                  <button
                    onClick={() => setShowPoweredBy(!showPoweredBy)}
                    className={clsx(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      showPoweredBy ? 'bg-blue-600' : 'bg-gray-300'
                    )}
                  >
                    <span className={clsx('inline-block h-4 w-4 rounded-full bg-white transition-transform', showPoweredBy ? 'translate-x-6' : 'translate-x-1')} />
                  </button>
                </div>
                {showPoweredBy && (
                  <div className="flex gap-2">
                    {poweredByPositions.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPoweredByPosition(pos)}
                        className={clsx(
                          'rounded-lg px-3 py-2 text-xs font-medium border transition-colors',
                          poweredByPosition === pos
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Favicon</h2>
                <p className="text-sm text-gray-500 mb-4">Browser tab icon and Apple Touch Icon</p>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-400">
                      <Upload size={16} className="text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 mt-1.5">Favicon</p>
                    <p className="text-[10px] text-gray-400">32x32 PNG</p>
                  </div>
                  <div className="text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-400">
                      <Upload size={16} className="text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 mt-1.5">Apple Touch</p>
                    <p className="text-[10px] text-gray-400">180x180 PNG</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ TAB 3: COLORS & TYPOGRAPHY ═══════════════ */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Color Palette */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Color Palette</h2>
                    <p className="text-sm text-gray-500">Customize every color in the platform</p>
                  </div>
                  <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    <RefreshCw size={14} />
                    Reset to Preset
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(colorGroups).map(([group, items]) => (
                    <div key={group}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {items.map((c) => (
                          <div key={c.key} className="flex items-center gap-2">
                            <div className="relative flex-shrink-0">
                              <div
                                className="h-8 w-8 rounded-lg border border-gray-200 shadow-sm cursor-pointer"
                                style={{ backgroundColor: colors[c.key] }}
                              />
                              <input
                                type="color"
                                value={colors[c.key]}
                                onChange={(e) => handleColorChange(c.key, e.target.value)}
                                className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{c.label}</p>
                              <input
                                type="text"
                                value={colors[c.key]}
                                onChange={(e) => handleColorChange(c.key, e.target.value)}
                                className="w-full rounded border border-gray-200 px-1.5 py-0.5 text-[11px] font-mono text-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Chart Colors */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chart Colors</p>
                    <div className="flex gap-2">
                      {chartColorState.map((color, i) => (
                        <div key={i} className="relative">
                          <div
                            className="h-8 w-8 rounded-lg border border-gray-200 shadow-sm cursor-pointer"
                            style={{ backgroundColor: color }}
                          />
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => handleChartColorChange(i, e.target.value)}
                            className="absolute inset-0 h-8 w-8 cursor-pointer opacity-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Typography</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
                    <select
                      value={headingFont}
                      onChange={(e) => setHeadingFont(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {fontOptions.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
                    <select
                      value={bodyFont}
                      onChange={(e) => setBodyFont(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {fontOptions.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mono Font</label>
                    <select
                      value={monoFont}
                      onChange={(e) => setMonoFont(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {monoFontOptions.map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Font Size: {baseFontSize}px</label>
                    <input
                      type="range"
                      min={12}
                      max={18}
                      value={baseFontSize}
                      onChange={(e) => setBaseFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>12px</span>
                      <span>18px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading Weight</label>
                    <div className="flex gap-2">
                      {[500, 600, 700, 800].map((w) => (
                        <button
                          key={w}
                          onClick={() => setHeadingWeight(w)}
                          className={clsx(
                            'rounded-lg px-4 py-2 text-xs font-medium border transition-colors',
                            headingWeight === w
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Type preview */}
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Preview</p>
                  <div className="space-y-2" style={{ fontFamily: headingFont }}>
                    <p style={{ fontSize: '24px', fontWeight: headingWeight }} className="text-gray-900">Heading 1 — {headingFont}</p>
                    <p style={{ fontSize: '20px', fontWeight: headingWeight }} className="text-gray-900">Heading 2 — {headingFont}</p>
                    <p style={{ fontSize: '16px', fontWeight: headingWeight }} className="text-gray-900">Heading 3 — {headingFont}</p>
                  </div>
                  <p className="mt-3 text-gray-700" style={{ fontFamily: bodyFont, fontSize: `${baseFontSize}px` }}>
                    Body text in {bodyFont} at {baseFontSize}px. The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="mt-2 text-gray-500" style={{ fontFamily: monoFont, fontSize: '13px' }}>
                    const droneId = &quot;SKW-US-A7B3X9&quot;; // {monoFont}
                  </p>
                </div>
              </div>

              {/* Live Preview Panel */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
                <div className="rounded-lg border overflow-hidden">
                  <div className="flex h-56">
                    {/* Sidebar preview */}
                    <div className="w-44 flex-shrink-0 flex flex-col" style={{ backgroundColor: colors.sidebarBg }}>
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                        <div className="h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: colors.primary }}>A</div>
                        <span className="text-[11px] font-semibold" style={{ color: colors.sidebarFg }}>ACME</span>
                      </div>
                      {['Dashboard', 'Map', 'Fleet'].map((item, i) => (
                        <div key={item} className="px-3 py-1.5 text-[10px]" style={i === 0 ? { color: colors.sidebarAccent, backgroundColor: `${colors.sidebarAccent}15` } : { color: colors.sidebarFg }}>
                          {item}
                        </div>
                      ))}
                    </div>
                    {/* Content preview */}
                    <div className="flex-1 p-3" style={{ backgroundColor: colors.pageBg }}>
                      <div className="h-7 rounded-lg border mb-2 flex items-center px-2" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                        <span className="text-[10px]" style={{ color: colors.textMuted, fontFamily: bodyFont }}>Top Bar</span>
                      </div>
                      <div className="rounded-lg border p-3 mb-2" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                        <p className="text-[10px] mb-1" style={{ color: colors.textMuted, fontFamily: bodyFont }}>Stat Card</p>
                        <p className="text-sm font-bold" style={{ color: colors.textPrimary, fontFamily: headingFont, fontWeight: headingWeight }}>12 Active Drones</p>
                      </div>
                      <div className="rounded border p-2" style={{ borderColor: colors.border }}>
                        <div className="flex items-center gap-2 text-[9px]" style={{ fontFamily: bodyFont }}>
                          <div className="h-5 flex-1 rounded" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                            <div className="px-1.5 py-0.5" style={{ color: colors.textSecondary }}>Table row</div>
                          </div>
                          <span className="inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-medium" style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>Active</span>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <button className="rounded px-2 py-1 text-[9px] font-medium text-white" style={{ backgroundColor: colors.primary }}>Button</button>
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-medium" style={{ backgroundColor: `${colors.danger}20`, color: colors.danger }}>Danger</span>
                        <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-medium" style={{ backgroundColor: `${colors.info}20`, color: colors.info }}>Info</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ TAB 4: LOGIN PAGE ═══════════════ */}
          {activeTab === 'login' && (
            <div className="space-y-6">
              {/* Layout */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Layout</h2>
                <p className="text-sm text-gray-500 mb-4">Choose the login page layout</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { id: 'centered' as LoginLayout, label: 'Centered' },
                    { id: 'split_left' as LoginLayout, label: 'Split Left' },
                    { id: 'split_right' as LoginLayout, label: 'Split Right' },
                  ]).map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setLoginLayout(layout.id)}
                      className={clsx(
                        'rounded-lg border-2 p-3 transition-all',
                        loginLayout === layout.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {/* Mini layout preview */}
                      <div className="flex h-16 rounded border border-gray-200 overflow-hidden mb-2">
                        {layout.id === 'centered' && (
                          <div className="flex-1 bg-gray-100 flex items-center justify-center">
                            <div className="h-8 w-12 rounded bg-white border shadow-sm" />
                          </div>
                        )}
                        {layout.id === 'split_left' && (
                          <>
                            <div className="w-1/2 bg-gray-800" />
                            <div className="w-1/2 bg-white flex items-center justify-center">
                              <div className="h-6 w-10 rounded border" />
                            </div>
                          </>
                        )}
                        {layout.id === 'split_right' && (
                          <>
                            <div className="w-1/2 bg-white flex items-center justify-center">
                              <div className="h-6 w-10 rounded border" />
                            </div>
                            <div className="w-1/2 bg-gray-800" />
                          </>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-700">{layout.label}</p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Type</label>
                    <select
                      value={bgType}
                      onChange={(e) => setBgType(e.target.value as BgType)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="solid">Solid Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  {bgType === 'solid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="h-9 w-9 rounded-lg border" style={{ backgroundColor: bgColor }} />
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                  {bgType === 'gradient' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gradient</label>
                      <select
                        value={bgGradient}
                        onChange={(e) => setBgGradient(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="from-blue-900 to-slate-900">Blue to Slate</option>
                        <option value="from-indigo-900 to-purple-900">Indigo to Purple</option>
                        <option value="from-gray-900 to-gray-800">Dark Gray</option>
                        <option value="from-green-900 to-slate-900">Green to Slate</option>
                      </select>
                    </div>
                  )}
                  {bgType === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
                      <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 cursor-pointer hover:bg-gray-50">
                        <Upload size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-500">Upload image...</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Color</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <div className="h-9 w-9 rounded-lg border" style={{ backgroundColor: overlayColor }} />
                        <input type="color" value={overlayColor} onChange={(e) => setOverlayColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <input type="text" value={overlayColor} onChange={(e) => setOverlayColor(e.target.value)} className="w-24 rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Opacity: {overlayOpacity}%</label>
                    <input type="range" min={0} max={100} value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Title</label>
                    <input type="text" value={welcomeTitle} onChange={(e) => setWelcomeTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Subtitle</label>
                    <input type="text" value={welcomeSubtitle} onChange={(e) => setWelcomeSubtitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 mt-4">
                  {[
                    { label: 'Show Help Link', value: showHelp, set: setShowHelp },
                    { label: 'Show Signup Link', value: showSignup, set: setShowSignup },
                    { label: 'Show Testimonial', value: showTestimonial, set: setShowTestimonial },
                  ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center gap-2">
                      <button
                        onClick={() => toggle.set(!toggle.value)}
                        className={clsx(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          toggle.value ? 'bg-blue-600' : 'bg-gray-300'
                        )}
                      >
                        <span className={clsx('inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform', toggle.value ? 'translate-x-4.5' : 'translate-x-0.5')} />
                      </button>
                      <span className="text-sm text-gray-700">{toggle.label}</span>
                    </div>
                  ))}
                </div>

                {showTestimonial && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Text</label>
                      <textarea rows={2} value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input type="text" value={testimonialAuthor} onChange={(e) => setTestimonialAuthor(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Government / Official Branding */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Government / Official Branding</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Show National Flag</p>
                      <p className="text-xs text-gray-500">Display a national flag on the login page</p>
                    </div>
                    <button
                      onClick={() => setShowNationalFlag(!showNationalFlag)}
                      className={clsx('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', showNationalFlag ? 'bg-blue-600' : 'bg-gray-300')}
                    >
                      <span className={clsx('inline-block h-4 w-4 rounded-full bg-white transition-transform', showNationalFlag ? 'translate-x-6' : 'translate-x-1')} />
                    </button>
                  </div>
                  {showNationalFlag && (
                    <select
                      value={flagCountry}
                      onChange={(e) => setFlagCountry(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Show Regulatory Badge</p>
                      <p className="text-xs text-gray-500">Display a regulatory badge / seal</p>
                    </div>
                    <button
                      onClick={() => setShowRegBadge(!showRegBadge)}
                      className={clsx('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', showRegBadge ? 'bg-blue-600' : 'bg-gray-300')}
                    >
                      <span className={clsx('inline-block h-4 w-4 rounded-full bg-white transition-transform', showRegBadge ? 'translate-x-6' : 'translate-x-1')} />
                    </button>
                  </div>
                  {showRegBadge && (
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-400">
                        <Upload size={16} className="text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500">Upload a regulatory badge or seal (PNG, SVG, max 500KB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Login Page Preview */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Login Page Preview</h2>
                <div className="rounded-lg border overflow-hidden">
                  <div className={clsx('flex h-80', loginLayout === 'split_right' && 'flex-row-reverse')}>
                    {/* Brand panel (for split layouts) */}
                    {loginLayout !== 'centered' && (
                      <div className={clsx('w-1/2 relative flex flex-col items-center justify-center p-6', bgType === 'gradient' ? `bg-gradient-to-br ${bgGradient}` : '')} style={bgType === 'solid' ? { backgroundColor: bgColor } : undefined}>
                        <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }} />
                        <div className="relative z-10 text-center">
                          <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-white font-bold text-sm">A</span>
                          </div>
                          <p className="text-white font-semibold text-sm">{welcomeTitle}</p>
                          <p className="text-white/70 text-xs mt-1">{welcomeSubtitle}</p>
                          {showNationalFlag && (
                            <p className="mt-3 text-2xl">{countries.find((c) => c.code === flagCountry)?.flag}</p>
                          )}
                          {showTestimonial && (
                            <div className="mt-4 bg-white/10 rounded-lg p-3 max-w-xs mx-auto">
                              <p className="text-white/80 text-[10px] italic leading-relaxed">&quot;{testimonialText.slice(0, 80)}...&quot;</p>
                              <p className="text-white/60 text-[9px] mt-1">- {testimonialAuthor}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Form panel */}
                    <div className={clsx(
                      'flex flex-col items-center justify-center p-6',
                      loginLayout === 'centered'
                        ? `w-full bg-gradient-to-br ${bgGradient}`
                        : 'w-1/2 bg-white'
                    )}>
                      <div className={clsx('w-full max-w-[200px] space-y-3', loginLayout === 'centered' && 'bg-white rounded-xl p-4 shadow-xl')}>
                        <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center mx-auto">
                          <span className="text-white text-[10px] font-bold">A</span>
                        </div>
                        <div>
                          <div className="h-6 rounded border border-gray-200 bg-gray-50 mb-1.5" />
                          <div className="h-6 rounded border border-gray-200 bg-gray-50 mb-2" />
                          <div className="h-6 rounded text-white text-[10px] font-medium flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                            Sign In
                          </div>
                        </div>
                        {showHelp && <p className="text-[8px] text-center text-blue-600">Forgot password?</p>}
                        {showSignup && <p className="text-[8px] text-center text-gray-500">No account? <span className="text-blue-600">Sign up</span></p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ TAB 5: DOMAINS & EMAIL ═══════════════ */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              {/* Subdomain */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subdomain</h2>
                <div className="flex items-center gap-3 mb-4">
                  <code className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-mono text-gray-800">{subdomain}.skywarden.app</code>
                  <button className="text-gray-400 hover:text-gray-600" title="Copy">
                    <Copy size={16} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubdomain}
                    onChange={(e) => { setNewSubdomain(e.target.value.toLowerCase()); setSubdomainAvailable(null); }}
                    placeholder="new-subdomain"
                    className="flex-1 max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="flex items-center text-sm text-gray-500">.skywarden.app</span>
                  <button onClick={handleSubdomainCheck} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Check
                  </button>
                </div>
                {subdomainAvailable !== null && (
                  <div className={clsx('flex items-center gap-2 mt-2 text-sm', subdomainAvailable ? 'text-green-600' : 'text-red-600')}>
                    {subdomainAvailable ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {subdomainAvailable ? 'Available!' : 'Not available or invalid'}
                  </div>
                )}
              </div>

              {/* Custom Domain */}
              <div className="rounded-xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Custom Domain</h2>
                    <p className="text-sm text-gray-500">Enterprise and Agency tiers only</p>
                  </div>
                  <button
                    onClick={() => setShowDomainModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add Custom Domain
                  </button>
                </div>

                {/* Existing domain card */}
                <div className="p-6">
                  <div className="rounded-lg border p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium text-gray-900">drones.acme-aviation.com</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', domainStatusConfig.active.bg, domainStatusConfig.active.text)}>
                            Active
                          </span>
                          <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', sslStatusConfig.active.bg, sslStatusConfig.active.text)}>
                            SSL Active
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                          <RefreshCw size={12} />
                          Verify DNS
                        </button>
                        <button className="text-xs text-red-600 hover:text-red-700 font-medium">Remove</button>
                      </div>
                    </div>

                    {/* DNS records table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Type</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Name</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Value</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 text-xs">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs text-gray-700">TXT</td>
                            <td className="px-3 py-2 font-mono text-xs text-gray-600">_skywarden-verify.drones.acme-aviation.com</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <code className="text-xs text-gray-600 bg-gray-100 rounded px-1.5 py-0.5 font-mono truncate max-w-[200px]">skywarden-verify=abc123def456</code>
                                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0"><Copy size={12} /></button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <CheckCircle size={14} className="text-green-500" />
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs text-gray-700">CNAME</td>
                            <td className="px-3 py-2 font-mono text-xs text-gray-600">drones.acme-aviation.com</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <code className="text-xs text-gray-600 bg-gray-100 rounded px-1.5 py-0.5 font-mono">edge.skywarden.app</code>
                                <button className="text-gray-400 hover:text-gray-600 flex-shrink-0"><Copy size={12} /></button>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <CheckCircle size={14} className="text-green-500" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Branding */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Branding</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                    <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                    <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To</label>
                    <input type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                {/* Email domain verification */}
                <div className="rounded-lg border bg-gray-50 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Email Domain Verification</p>
                    <button className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                      <RefreshCw size={12} />
                      Verify Email Domain
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-500" />
                      <span className="text-gray-600">DKIM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-500" />
                      <span className="text-gray-600">SPF</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-yellow-500" />
                      <span className="text-gray-600">DMARC (pending)</span>
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Social Links</label>
                    <button
                      onClick={() => setSocialLinks([...socialLinks, { type: '', url: '' }])}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus size={12} />
                      Add Link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {socialLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.type}
                          onChange={(e) => { const n = [...socialLinks]; n[i] = { ...n[i], type: e.target.value }; setSocialLinks(n); }}
                          placeholder="Type (e.g. LinkedIn)"
                          className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => { const n = [...socialLinks]; n[i] = { ...n[i], url: e.target.value }; setSocialLinks(n); }}
                          placeholder="https://..."
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email header logo */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Header Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-400">
                      <Upload size={14} className="text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Use uploaded logo or separate email logo</p>
                  </div>
                </div>

                {/* Footer text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                  <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              {/* Add Domain Modal */}
              {showDomainModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                      <h3 className="font-semibold text-gray-900">Add Custom Domain</h3>
                      <button onClick={() => setShowDomainModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
                        <input
                          type="text"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          placeholder="drones.yourdomain.com"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                        <p className="text-xs text-amber-700">
                          After adding, you will need to configure DNS records with your domain registrar. We will provide the required CNAME and TXT records.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-t px-5 py-4">
                      <button
                        onClick={() => setShowDomainModal(false)}
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Add Domain
                      </button>
                      <button onClick={() => setShowDomainModal(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ TAB 6: LOCALIZATION ═══════════════ */}
          {activeTab === 'localization' && (
            <div className="space-y-6">
              {/* Region & Language */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Region & Language</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Authority</label>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      <Shield size={14} className="text-gray-400" />
                      {selectedCountryObj?.authority ?? 'Unknown'}
                      <span className="text-[10px] text-gray-400 ml-auto">Auto-filled</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                    <select
                      value={defaultLang}
                      onChange={(e) => setDefaultLang(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {languageOptions.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supported Languages</label>
                    <div className="flex flex-wrap gap-1.5">
                      {languageOptions.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setSupportedLangs((prev) =>
                              prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
                            );
                          }}
                          className={clsx(
                            'rounded-full px-2.5 py-1 text-xs font-medium border transition-colors',
                            supportedLangs.includes(lang)
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Units & Formats */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Units & Formats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                    <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                    <div className="flex gap-2">
                      {['12h', '24h'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeFormat(tf)}
                          className={clsx(
                            'flex-1 rounded-lg py-2 text-sm font-medium border transition-colors',
                            timeFormat === tf ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>America/New_York</option>
                      <option>America/Chicago</option>
                      <option>America/Denver</option>
                      <option>America/Los_Angeles</option>
                      <option>Europe/London</option>
                      <option>Europe/Paris</option>
                      <option>Africa/Nairobi</option>
                      <option>Africa/Lagos</option>
                      <option>Asia/Dubai</option>
                      <option>Asia/Kolkata</option>
                      <option>Asia/Tokyo</option>
                      <option>Australia/Sydney</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Measurement Units</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { label: 'Distance', value: distanceUnit, set: setDistanceUnit, opts: ['feet', 'meters'] },
                    { label: 'Altitude', value: altitudeUnit, set: setAltitudeUnit, opts: ['feet', 'meters'] },
                    { label: 'Speed', value: speedUnit, set: setSpeedUnit, opts: ['mph', 'kph', 'knots'] },
                    { label: 'Temperature', value: tempUnit, set: setTempUnit, opts: ['\u{b0}F', '\u{b0}C'] },
                    { label: 'Weight', value: weightUnit, set: setWeightUnit, opts: ['lbs', 'kg', 'g'] },
                  ].map((unit) => (
                    <div key={unit.label}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{unit.label}</label>
                      <select
                        value={unit.value}
                        onChange={(e) => unit.set(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {unit.opts.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminology Overrides */}
              <div className="rounded-xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Terminology Overrides</h2>
                    <p className="text-sm text-gray-500">Customize platform terms for your region</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTerminology([...terminology, { platform: '', custom: '' }])}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <Plus size={12} />
                      Add Override
                    </button>
                    <button
                      onClick={() => setTerminology([...terminologyDefaults])}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <RefreshCw size={12} />
                      Reset All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Platform Term</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Your Term</th>
                        <th className="px-6 py-3 text-right font-medium text-gray-500 w-16">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {terminology.map((term, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <input
                              type="text"
                              value={term.platform}
                              onChange={(e) => { const n = [...terminology]; n[i] = { ...n[i], platform: e.target.value }; setTerminology(n); }}
                              className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Platform term"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="text"
                              value={term.custom}
                              onChange={(e) => { const n = [...terminology]; n[i] = { ...n[i], custom: e.target.value }; setTerminology(n); }}
                              className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Your custom term"
                            />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => setTerminology(terminology.filter((_, j) => j !== i))}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Save button (all tabs) */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
            <button className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Discard Changes
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
