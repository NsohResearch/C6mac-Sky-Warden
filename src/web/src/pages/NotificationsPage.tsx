import { useState, useMemo } from 'react';
import {
  Bell, BellRing, BellOff, Mail, MessageSquare, Smartphone,
  Shield, AlertTriangle, AlertCircle, CheckCircle, Clock,
  Calendar, Filter, Search, Settings, Archive, Pin, Eye, EyeOff,
  ChevronDown, ChevronUp, X, Check, Trash2, Volume2, VolumeX,
  Moon, Sun, Info, Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Notification, NotificationPreferences } from '../../../shared/types/notifications';

// ─── Priority config ───────────────────────────────────────────────
const priorityConfig = {
  critical: { label: 'Critical', border: 'border-l-red-600', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  high: { label: 'High', border: 'border-l-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  medium: { label: 'Medium', border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low: { label: 'Low', border: 'border-l-blue-400', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
};

const categoryConfig: Record<string, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  safety: { label: 'Safety', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
  compliance: { label: 'Compliance', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  operations: { label: 'Operations', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
  billing: { label: 'Billing', icon: Mail, color: 'text-green-600', bg: 'bg-green-50' },
  system: { label: 'System', icon: Info, color: 'text-gray-600', bg: 'bg-gray-100' },
  team: { label: 'Team', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const typeIcons: Record<string, typeof Shield> = {
  cert_expiry: Clock,
  registration_renewal: Calendar,
  maintenance_due: AlertTriangle,
  laanc_status: CheckCircle,
  tfr_alert: AlertCircle,
  weather_warning: AlertTriangle,
  geofence_breach: Shield,
  battery_alert: Zap,
  compliance_deadline: Clock,
  safety_report_due: Calendar,
  flight_plan_approved: CheckCircle,
  flight_plan_denied: X,
  system_update: Info,
  billing: Mail,
  team_invite: MessageSquare,
  incident_update: AlertCircle,
};

// ─── Mock data ─────────────────────────────────────────────────────
const now = new Date('2026-03-20T14:00:00');
function daysAgo(d: number, h = 10, m = 0): string {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - d);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
}

const mockNotifications: Notification[] = [
  // Today
  { id: 'n-001', userId: 'u1', tenantId: 't1', type: 'geofence_breach', category: 'safety', priority: 'critical', title: 'Geofence breach detected', message: 'Drone DJI-M300-003 departed authorized flight area in Zone C-14 at 13:42 UTC. Automatic return-to-home initiated. Review flight logs and ensure corrective actions are documented.', timestamp: daysAgo(0, 13, 42), read: false, actionUrl: '/fleet/dji-m300-003', actionLabel: 'View Drone', channels: ['in_app', 'email', 'sms', 'push'] },
  { id: 'n-002', userId: 'u1', tenantId: 't1', type: 'tfr_alert', category: 'safety', priority: 'critical', title: 'TFR issued near your saved location', message: 'Temporary Flight Restriction issued near White House (Washington, DC). Effective 2026-03-20 through 2026-03-22. All UAS operations prohibited within 1 NM radius up to 18,000 ft MSL.', timestamp: daysAgo(0, 11, 15), read: false, actionUrl: '/airspace', actionLabel: 'View Airspace Map', channels: ['in_app', 'email', 'push'] },
  { id: 'n-003', userId: 'u1', tenantId: 't1', type: 'weather_warning', category: 'safety', priority: 'high', title: 'High winds expected tomorrow', message: 'Wind advisory in effect for your scheduled flight location (Riverside County, CA). Sustained winds 25-35 mph with gusts to 50 mph expected. Consider rescheduling operations planned for 2026-03-21.', timestamp: daysAgo(0, 10, 30), read: false, actionUrl: '/missions', actionLabel: 'View Missions', channels: ['in_app', 'email'] },
  { id: 'n-004', userId: 'u1', tenantId: 't1', type: 'flight_plan_approved', category: 'operations', priority: 'medium', title: 'Flight plan FP-2026-0312 approved', message: 'Your flight plan for aerial survey at Site B (coordinates 34.0522N, 118.2437W) has been approved. Valid from 2026-03-21 08:00 to 2026-03-21 16:00 local time.', timestamp: daysAgo(0, 9, 0), read: false, actionUrl: '/flight-plans/fp-2026-0312', actionLabel: 'View Plan', channels: ['in_app', 'email'] },
  { id: 'n-005', userId: 'u1', tenantId: 't1', type: 'battery_alert', category: 'operations', priority: 'high', title: 'Battery TB50-007 degraded', message: 'Battery TB50-007 has dropped below 80% capacity threshold after 342 cycles. Replace before next critical mission. Current capacity: 76%. Recommended maximum flight time: 22 minutes.', timestamp: daysAgo(0, 8, 20), read: true, actionUrl: '/fleet', actionLabel: 'Fleet Management', channels: ['in_app'] },

  // Yesterday
  { id: 'n-006', userId: 'u1', tenantId: 't1', type: 'laanc_status', category: 'compliance', priority: 'medium', title: 'LAANC authorization approved for DCA airspace', message: 'Your LAANC near-real-time authorization has been approved for controlled airspace near DCA (Reagan National). Max altitude: 200 ft AGL. Valid for 24 hours starting 2026-03-19 06:00 EST.', timestamp: daysAgo(1, 14, 30), read: false, actionUrl: '/laanc/auth-2026-0319', actionLabel: 'View Authorization', channels: ['in_app', 'email'] },
  { id: 'n-007', userId: 'u1', tenantId: 't1', type: 'maintenance_due', category: 'operations', priority: 'high', title: 'Drone DJI-M300-001 maintenance due', message: 'Scheduled maintenance due in 5 flight hours for DJI Matrice 300 RTK (serial: M300-001). Inspect propellers, calibrate IMU, and verify Remote ID module firmware. Last maintenance: 2026-02-20.', timestamp: daysAgo(1, 11, 0), read: false, actionUrl: '/fleet/dji-m300-001/maintenance', actionLabel: 'Schedule Maintenance', channels: ['in_app', 'email'] },
  { id: 'n-008', userId: 'u1', tenantId: 't1', type: 'team_invite', category: 'team', priority: 'low', title: 'New team member joined', message: 'John Martinez has accepted your invitation and joined the organization as a Pilot. They have been assigned to the West Coast Operations team. Please review their access permissions.', timestamp: daysAgo(1, 9, 45), read: true, actionUrl: '/settings/team', actionLabel: 'Manage Team', channels: ['in_app', 'email'] },
  { id: 'n-009', userId: 'u1', tenantId: 't1', type: 'billing', category: 'billing', priority: 'low', title: 'Invoice #INV-2026-0042 payment received', message: 'Payment of $2,450.00 received for Invoice #INV-2026-0042 (Enterprise Plan - March 2026). Thank you for your prompt payment. Next invoice date: April 1, 2026.', timestamp: daysAgo(1, 8, 0), read: true, actionUrl: '/billing/invoices', actionLabel: 'View Invoices', channels: ['in_app', 'email'] },
  { id: 'n-010', userId: 'u1', tenantId: 't1', type: 'incident_update', category: 'safety', priority: 'high', title: 'Incident report IR-2026-018 updated', message: 'The FAA has acknowledged receipt of incident report IR-2026-018 (near-miss event at LAX Class B airspace). Investigation status changed to "Under Review". Expected response within 10 business days.', timestamp: daysAgo(1, 16, 20), read: false, channels: ['in_app', 'email', 'push'] },

  // This week
  { id: 'n-011', userId: 'u1', tenantId: 't1', type: 'cert_expiry', category: 'compliance', priority: 'high', title: 'Part 107 certificate expires in 30 days', message: 'Your FAA Part 107 Remote Pilot Certificate (cert #FA-2024-107-88421) expires on 2026-04-17. Schedule your recertification exam or complete the online recurrent training at the FAA Safety Team website.', timestamp: daysAgo(2, 9, 0), read: false, actionUrl: '/compliance/certifications', actionLabel: 'Renew Certificate', channels: ['in_app', 'email', 'sms'] },
  { id: 'n-012', userId: 'u1', tenantId: 't1', type: 'safety_report_due', category: 'compliance', priority: 'medium', title: 'Monthly safety report deadline in 3 days', message: 'Your monthly UAS safety report for March 2026 is due by 2026-03-22. Include all flight incidents, near-misses, and maintenance events. 14 of 18 required fields have been completed.', timestamp: daysAgo(2, 14, 0), read: false, actionUrl: '/safety/reports', actionLabel: 'Complete Report', channels: ['in_app', 'email'] },
  { id: 'n-013', userId: 'u1', tenantId: 't1', type: 'registration_renewal', category: 'compliance', priority: 'high', title: 'Registration renewal due for SKW-US-001234', message: 'FAA drone registration SKW-US-001234 (DJI Matrice 300 RTK) expires on 2026-04-05. Renew online at faadronezone.faa.gov. Registration fee: $5.00 per aircraft.', timestamp: daysAgo(3, 10, 15), read: false, actionUrl: '/compliance/registrations', actionLabel: 'Renew Registration', channels: ['in_app', 'email'] },
  { id: 'n-014', userId: 'u1', tenantId: 't1', type: 'system_update', category: 'system', priority: 'low', title: 'Platform update v3.8.0 deployed', message: 'C6mac Sky Warden v3.8.0 has been deployed. New features include enhanced LAANC integration, improved flight path optimization, and updated UASFM data from the latest FAA chart cycle.', timestamp: daysAgo(3, 6, 0), read: true, channels: ['in_app'] },
  { id: 'n-015', userId: 'u1', tenantId: 't1', type: 'flight_plan_denied', category: 'operations', priority: 'high', title: 'Flight plan FP-2026-0298 denied', message: 'Your flight plan for operations near JFK Class B airspace has been denied. Reason: Altitude request exceeds UASFM ceiling for the requested grid. Maximum allowed: 100 ft AGL. Requested: 300 ft AGL.', timestamp: daysAgo(3, 15, 30), read: true, actionUrl: '/flight-plans/fp-2026-0298', actionLabel: 'Modify Plan', channels: ['in_app', 'email'] },
  { id: 'n-016', userId: 'u1', tenantId: 't1', type: 'weather_warning', category: 'safety', priority: 'medium', title: 'Dense fog advisory for Bay Area operations', message: 'Dense fog advisory issued for San Francisco Bay Area through 2026-03-18 12:00 PST. Visibility below 1/4 mile expected. All VFR operations should be postponed until conditions improve.', timestamp: daysAgo(3, 5, 0), read: true, channels: ['in_app'] },
  { id: 'n-017', userId: 'u1', tenantId: 't1', type: 'compliance_deadline', category: 'compliance', priority: 'medium', title: 'Quarterly compliance audit scheduled', message: 'Your Q1 2026 compliance audit is scheduled for 2026-03-25. Ensure all documentation, flight logs, and maintenance records are up to date. Auditor: ComplianceFirst LLC.', timestamp: daysAgo(4, 9, 30), read: false, actionUrl: '/compliance', actionLabel: 'Review Compliance', channels: ['in_app', 'email'] },
  { id: 'n-018', userId: 'u1', tenantId: 't1', type: 'team_invite', category: 'team', priority: 'low', title: 'Team invite pending: Sarah Kim', message: 'Your invitation to Sarah Kim (sarah.kim@example.com) to join as Flight Operations Manager is still pending. Invitation was sent 5 days ago and expires in 2 days.', timestamp: daysAgo(4, 11, 0), read: true, channels: ['in_app'] },
  { id: 'n-019', userId: 'u1', tenantId: 't1', type: 'maintenance_due', category: 'operations', priority: 'medium', title: 'Propeller replacement due for DJI-M300-002', message: 'Propeller set on DJI Matrice 300 RTK (serial: M300-002) has reached 200 flight hours. Replace propellers per manufacturer maintenance schedule. Current hours: 198.5.', timestamp: daysAgo(5, 14, 0), read: true, actionUrl: '/fleet/dji-m300-002/maintenance', actionLabel: 'Schedule Maintenance', channels: ['in_app'] },

  // Older (1-2 weeks)
  { id: 'n-020', userId: 'u1', tenantId: 't1', type: 'laanc_status', category: 'compliance', priority: 'medium', title: 'LAANC further coordination approved', message: 'Your LAANC further coordination request for operations in Class C airspace near SFO has been approved after FAA 72-hour review. Authorization valid 2026-03-12 through 2026-03-19.', timestamp: daysAgo(7, 10, 0), read: true, actionUrl: '/laanc', actionLabel: 'View Authorization', channels: ['in_app', 'email'] },
  { id: 'n-021', userId: 'u1', tenantId: 't1', type: 'billing', category: 'billing', priority: 'medium', title: 'Invoice #INV-2026-0041 overdue', message: 'Invoice #INV-2026-0041 for API overage charges ($185.00) is 7 days overdue. Please update your payment method or contact billing support to avoid service interruption.', timestamp: daysAgo(7, 8, 0), read: true, actionUrl: '/billing', actionLabel: 'Pay Now', channels: ['in_app', 'email', 'sms'] },
  { id: 'n-022', userId: 'u1', tenantId: 't1', type: 'tfr_alert', category: 'safety', priority: 'high', title: 'TFR expired for Presidential visit', message: 'The Temporary Flight Restriction for the Presidential visit to Los Angeles (NOTAM FDC 6/1234) has expired as of 2026-03-12 23:59 PST. Normal UAS operations may resume in the affected area.', timestamp: daysAgo(8, 7, 0), read: true, channels: ['in_app'] },
  { id: 'n-023', userId: 'u1', tenantId: 't1', type: 'geofence_breach', category: 'safety', priority: 'critical', title: 'Geofence warning: Drone near restricted area', message: 'Drone DJI-M300-001 entered the 500-meter buffer zone around restricted airspace R-2502. Altitude: 150 ft AGL. Automated altitude restriction engaged. No airspace violation recorded.', timestamp: daysAgo(8, 16, 45), read: true, actionUrl: '/fleet/dji-m300-001', actionLabel: 'View Flight Log', channels: ['in_app', 'email', 'push'] },
  { id: 'n-024', userId: 'u1', tenantId: 't1', type: 'system_update', category: 'system', priority: 'low', title: 'Scheduled maintenance completed', message: 'Platform scheduled maintenance window (2026-03-11 02:00-06:00 UTC) has been completed. All services are operational. No data loss or service degradation occurred during the maintenance.', timestamp: daysAgo(9, 6, 0), read: true, channels: ['in_app'] },
  { id: 'n-025', userId: 'u1', tenantId: 't1', type: 'battery_alert', category: 'operations', priority: 'medium', title: 'Battery inventory low', message: 'Your organization has 2 batteries remaining with capacity above 80% threshold. Recommended minimum: 4 batteries for operational readiness. Consider ordering replacements from your approved vendor.', timestamp: daysAgo(9, 11, 30), read: true, channels: ['in_app'] },
  { id: 'n-026', userId: 'u1', tenantId: 't1', type: 'flight_plan_approved', category: 'operations', priority: 'medium', title: 'Flight plan FP-2026-0285 approved', message: 'Your flight plan for powerline inspection along Route 66 corridor has been approved. Valid from 2026-03-10 through 2026-03-14. Special conditions: maintain visual line of sight at all times.', timestamp: daysAgo(10, 9, 0), read: true, actionUrl: '/flight-plans/fp-2026-0285', actionLabel: 'View Plan', channels: ['in_app', 'email'] },
  { id: 'n-027', userId: 'u1', tenantId: 't1', type: 'safety_report_due', category: 'compliance', priority: 'low', title: 'February safety report submitted', message: 'Your monthly UAS safety report for February 2026 has been successfully submitted to the FAA. Report ID: SR-2026-02. No corrective actions required. Next report due: March 22, 2026.', timestamp: daysAgo(11, 12, 0), read: true, channels: ['in_app'] },
  { id: 'n-028', userId: 'u1', tenantId: 't1', type: 'incident_update', category: 'safety', priority: 'medium', title: 'Incident report IR-2026-015 closed', message: 'FAA has closed incident report IR-2026-015 (minor property damage during landing). Finding: Pilot error - inadequate landing zone assessment. Recommendation: Additional pilot training on landing procedures.', timestamp: daysAgo(12, 14, 0), read: true, channels: ['in_app', 'email'] },
  { id: 'n-029', userId: 'u1', tenantId: 't1', type: 'cert_expiry', category: 'compliance', priority: 'medium', title: 'Visual observer certification renewed', message: 'Visual Observer certification for team member Alex Turner has been renewed through 2027-03-08. Updated records have been stored in the compliance management system.', timestamp: daysAgo(12, 8, 15), read: true, channels: ['in_app'] },
  { id: 'n-030', userId: 'u1', tenantId: 't1', type: 'billing', category: 'billing', priority: 'low', title: 'Payment method updated', message: 'Your default payment method has been updated to Visa ending in 4242. All future charges will be applied to this card. Next billing date: April 1, 2026.', timestamp: daysAgo(13, 10, 0), read: true, channels: ['in_app'] },
  { id: 'n-031', userId: 'u1', tenantId: 't1', type: 'compliance_deadline', category: 'compliance', priority: 'high', title: 'Remote ID compliance deadline approaching', message: 'All UAS in your fleet must be Remote ID compliant by 2026-04-01 per 14 CFR Part 89. 2 of 5 drones are currently non-compliant. Update Remote ID modules immediately to avoid operational restrictions.', timestamp: daysAgo(6, 9, 0), read: false, actionUrl: '/compliance/remote-id', actionLabel: 'View Status', channels: ['in_app', 'email', 'sms'] },
  { id: 'n-032', userId: 'u1', tenantId: 't1', type: 'registration_renewal', category: 'compliance', priority: 'medium', title: 'Registration SKW-US-001237 renewed', message: 'FAA drone registration SKW-US-001237 (DJI Mavic 3 Enterprise) has been successfully renewed through 2029-03-06. Registration certificate available for download.', timestamp: daysAgo(14, 11, 0), read: true, actionUrl: '/compliance/registrations', actionLabel: 'Download Certificate', channels: ['in_app'] },
];

const defaultPreferences: NotificationPreferences = {
  userId: 'u1',
  channels: { in_app: true, email: true, sms: false, push: true },
  categories: {
    safety: { enabled: true, channels: ['in_app', 'email', 'sms', 'push'] },
    compliance: { enabled: true, channels: ['in_app', 'email'] },
    operations: { enabled: true, channels: ['in_app', 'email'] },
    billing: { enabled: true, channels: ['in_app', 'email'] },
    system: { enabled: true, channels: ['in_app'] },
    team: { enabled: true, channels: ['in_app', 'email'] },
  },
  quietHours: { enabled: false, start: '22:00', end: '07:00', timezone: 'America/New_York', exceptCritical: true },
  digestFrequency: 'realtime',
  phone: '',
  emailVerified: true,
  phoneVerified: false,
};

// ─── Helpers ───────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = now.getTime() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dateGroup(iso: string): string {
  const diff = Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
  if (diff < 1) return 'Today';
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return 'This Week';
  return 'Older';
}

type DateRange = 'today' | 'week' | 'month' | 'all';

// ─── Component ─────────────────────────────────────────────────────
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  // ── Filtering ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
      if (readFilter === 'unread' && n.read) return false;
      if (readFilter === 'read' && !n.read) return false;
      if (dateRange !== 'all') {
        const diff = Math.floor((now.getTime() - new Date(n.timestamp).getTime()) / 86400000);
        if (dateRange === 'today' && diff >= 1) return false;
        if (dateRange === 'week' && diff >= 7) return false;
        if (dateRange === 'month' && diff >= 30) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, categoryFilter, priorityFilter, readFilter, dateRange, searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    const order = ['Today', 'Yesterday', 'This Week', 'Older'];
    for (const n of filtered) {
      const g = dateGroup(n.timestamp);
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    }
    // Sort each group by pinned-first then timestamp desc
    for (const g of Object.keys(groups)) {
      groups[g].sort((a, b) => {
        const ap = pinnedIds.has(a.id) ? 1 : 0;
        const bp = pinnedIds.has(b.id) ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    }
    return order.filter((g) => groups[g]).map((g) => ({ label: g, items: groups[g] }));
  }, [filtered, pinnedIds]);

  // ── Stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const byCritical = notifications.filter((n) => n.priority === 'critical').length;
    const byCategory: Record<string, number> = {};
    for (const n of notifications) {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    }
    return { total, unread, byCritical, byCategory };
  }, [notifications]);

  // ── Actions ──────────────────────────────────────────────────────
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggleRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n));
  const archiveNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const togglePin = (id: string) => setPinnedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleExpand = (id: string) => setExpandedId((prev) => prev === id ? null : id);

  const updatePref = <K extends keyof NotificationPreferences>(key: K, val: NotificationPreferences[K]) =>
    setPreferences((p) => ({ ...p, [key]: val }));

  const toggleCategoryChannel = (cat: string, channel: string) => {
    setPreferences((p) => {
      const catPrefs = p.categories[cat as keyof typeof p.categories];
      const channels = catPrefs.channels.includes(channel)
        ? catPrefs.channels.filter((c) => c !== channel)
        : [...catPrefs.channels, channel];
      return { ...p, categories: { ...p.categories, [cat]: { ...catPrefs, channels } } };
    });
  };

  // ─── Render ──────────────────────────────────────────────────────
  const categories = ['all', 'safety', 'compliance', 'operations', 'billing', 'system', 'team'];
  const priorities = ['all', 'critical', 'high', 'medium', 'low'];
  const dateRanges: { value: DateRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <Bell size={24} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
              {stats.unread > 0 && (
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {stats.unread}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Stay informed about safety alerts, compliance deadlines, and operations updates</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters((v) => !v)} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter size={16} />
            Filters
          </button>
          <button onClick={() => setShowPrefs((v) => !v)} className={clsx('flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium', showPrefs ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50')}>
            <Settings size={16} />
            Preferences
          </button>
          <button onClick={markAllRead} disabled={stats.unread === 0} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <Check size={16} />
            Mark All Read
          </button>
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Bell size={14} /> Total</div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500"><BellRing size={14} /> Unread</div>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.unread}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500"><AlertCircle size={14} /> Critical</div>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.byCritical}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">Categories</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.byCategory).map(([cat, count]) => {
              const cfg = categoryConfig[cat];
              return (
                <span key={cat} className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cfg?.bg, cfg?.color)}>
                  {cfg?.label} {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      {showFilters && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-1">Category</span>
            {categories.map((c) => (
              <button key={c} onClick={() => setCategoryFilter(c)} className={clsx('rounded-full px-3 py-1.5 text-xs font-medium transition-colors', categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {c === 'all' ? 'All' : categoryConfig[c]?.label}
              </button>
            ))}
          </div>
          {/* Priority pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-1">Priority</span>
            {priorities.map((p) => (
              <button key={p} onClick={() => setPriorityFilter(p)} className={clsx('rounded-full px-3 py-1.5 text-xs font-medium transition-colors', priorityFilter === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {p === 'all' ? 'All' : priorityConfig[p as keyof typeof priorityConfig]?.label}
              </button>
            ))}
          </div>
          {/* Read / Date / Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['all', 'unread', 'read'] as const).map((v) => (
                <button key={v} onClick={() => setReadFilter(v)} className={clsx('px-3 py-1.5 text-xs font-medium', readFilter === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}>
                  {v === 'all' ? 'All' : v === 'unread' ? 'Unread' : 'Read'}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {dateRanges.map((d) => (
                <button key={d.value} onClick={() => setDateRange(d.value)} className={clsx('px-3 py-1.5 text-xs font-medium', dateRange === d.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}>
                  {d.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search notifications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Preferences panel ───────────────────────────────────── */}
      {showPrefs && (
        <div className="rounded-xl border border-blue-200 bg-white p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
            <button onClick={() => setShowPrefs(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          {/* Global channels */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Delivery Channels</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([
                { key: 'in_app', label: 'In-App', icon: Bell, verified: true },
                { key: 'email', label: 'Email', icon: Mail, verified: preferences.emailVerified },
                { key: 'sms', label: 'SMS', icon: Smartphone, verified: preferences.phoneVerified },
                { key: 'push', label: 'Push', icon: BellRing, verified: true },
              ] as const).map(({ key, label, icon: Icon, verified }) => (
                <div key={key} className={clsx('flex items-center gap-3 rounded-lg border p-3', preferences.channels[key] ? 'border-blue-200 bg-blue-50' : 'border-gray-200')}>
                  <Icon size={18} className={preferences.channels[key] ? 'text-blue-600' : 'text-gray-400'} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className={clsx('text-xs', verified ? 'text-green-600' : 'text-amber-600')}>
                      {verified ? 'Verified' : 'Not verified'}
                    </p>
                  </div>
                  <button onClick={() => updatePref('channels', { ...preferences.channels, [key]: !preferences.channels[key] })} className={clsx('relative inline-flex h-5 w-9 rounded-full transition-colors', preferences.channels[key] ? 'bg-blue-600' : 'bg-gray-300')}>
                    <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5', preferences.channels[key] ? 'translate-x-4' : 'translate-x-0.5')} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Per-category channel grid */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Category Settings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-left font-medium text-gray-600">Category</th>
                    <th className="py-2 text-center font-medium text-gray-600">Enabled</th>
                    <th className="py-2 text-center font-medium text-gray-600">In-App</th>
                    <th className="py-2 text-center font-medium text-gray-600">Email</th>
                    <th className="py-2 text-center font-medium text-gray-600">SMS</th>
                    <th className="py-2 text-center font-medium text-gray-600">Push</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(preferences.categories).map(([cat, prefs]) => {
                    const cfg = categoryConfig[cat];
                    const CatIcon = cfg?.icon || Bell;
                    return (
                      <tr key={cat} className="border-b border-gray-100">
                        <td className="py-2.5">
                          <span className="flex items-center gap-2">
                            <CatIcon size={14} className={cfg?.color} />
                            <span className="font-medium text-gray-800">{cfg?.label}</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <button onClick={() => setPreferences((p) => ({ ...p, categories: { ...p.categories, [cat]: { ...prefs, enabled: !prefs.enabled } } }))} className={clsx('relative inline-flex h-5 w-9 rounded-full transition-colors', prefs.enabled ? 'bg-blue-600' : 'bg-gray-300')}>
                            <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5', prefs.enabled ? 'translate-x-4' : 'translate-x-0.5')} />
                          </button>
                        </td>
                        {['in_app', 'email', 'sms', 'push'].map((ch) => (
                          <td key={ch} className="py-2.5 text-center">
                            <button onClick={() => toggleCategoryChannel(cat, ch)} disabled={!prefs.enabled} className={clsx('rounded p-1', prefs.enabled && prefs.channels.includes(ch) ? 'text-blue-600' : 'text-gray-300', !prefs.enabled && 'opacity-50 cursor-not-allowed')}>
                              {prefs.channels.includes(ch) ? <CheckCircle size={16} /> : <X size={16} />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quiet hours */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Moon size={14} /> Quiet Hours</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => updatePref('quietHours', { ...preferences.quietHours, enabled: !preferences.quietHours.enabled })} className={clsx('relative inline-flex h-5 w-9 rounded-full transition-colors', preferences.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-300')}>
                <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5', preferences.quietHours.enabled ? 'translate-x-4' : 'translate-x-0.5')} />
              </button>
              <div className="flex items-center gap-2">
                <input type="time" value={preferences.quietHours.start} onChange={(e) => updatePref('quietHours', { ...preferences.quietHours, start: e.target.value })} disabled={!preferences.quietHours.enabled} className="rounded border border-gray-200 px-2 py-1 text-sm disabled:opacity-50" />
                <span className="text-sm text-gray-500">to</span>
                <input type="time" value={preferences.quietHours.end} onChange={(e) => updatePref('quietHours', { ...preferences.quietHours, end: e.target.value })} disabled={!preferences.quietHours.enabled} className="rounded border border-gray-200 px-2 py-1 text-sm disabled:opacity-50" />
              </div>
              <label className={clsx('flex items-center gap-2 text-sm', !preferences.quietHours.enabled && 'opacity-50')}>
                <input type="checkbox" checked={preferences.quietHours.exceptCritical} onChange={(e) => updatePref('quietHours', { ...preferences.quietHours, exceptCritical: e.target.checked })} disabled={!preferences.quietHours.enabled} className="rounded border-gray-300" />
                Except critical alerts
              </label>
            </div>
          </div>

          {/* Digest frequency */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Digest Frequency</h3>
            <div className="flex gap-2">
              {(['realtime', 'hourly', 'daily', 'weekly'] as const).map((freq) => (
                <button key={freq} onClick={() => updatePref('digestFrequency', freq)} className={clsx('rounded-lg px-4 py-2 text-sm font-medium capitalize', preferences.digestFrequency === freq ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {freq === 'realtime' ? 'Real-time' : freq}
                </button>
              ))}
            </div>
          </div>

          {/* Phone input */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">SMS Phone Number</h3>
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-gray-400" />
              <input type="tel" value={preferences.phone || ''} onChange={(e) => updatePref('phone', e.target.value)} placeholder="+1 (555) 123-4567" className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-64 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              {preferences.phoneVerified ? (
                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Verified</span>
              ) : (
                <button className="text-xs text-blue-600 hover:underline">Verify</button>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── Notification list ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <BellOff size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No notifications match your filters</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filter criteria</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{group.label}</h3>
              <div className="space-y-2">
                {group.items.map((n) => {
                  const pCfg = priorityConfig[n.priority];
                  const cCfg = categoryConfig[n.category];
                  const Icon = typeIcons[n.type] || Bell;
                  const isExpanded = expandedId === n.id;
                  const isPinned = pinnedIds.has(n.id);

                  return (
                    <div
                      key={n.id}
                      className={clsx(
                        'rounded-xl border-l-4 border border-gray-200 bg-white transition-all',
                        pCfg.border,
                        !n.read && 'bg-blue-50/40',
                        isPinned && 'ring-1 ring-amber-300',
                      )}
                    >
                      {/* Main row */}
                      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => toggleExpand(n.id)}>
                        {/* Icon */}
                        <div className={clsx('mt-0.5 rounded-lg p-2', cCfg?.bg)}>
                          <Icon size={16} className={cCfg?.color} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {!n.read && <span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', pCfg.dot)} />}
                              <h4 className={clsx('text-sm font-semibold truncate', n.read ? 'text-gray-700' : 'text-gray-900')}>
                                {n.title}
                              </h4>
                              {isPinned && <Pin size={12} className="text-amber-500 shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', pCfg.badge)}>
                                {pCfg.label}
                              </span>
                              <span className="text-xs text-gray-400">{relativeTime(n.timestamp)}</span>
                              {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                          </div>
                          {!isExpanded && (
                            <p className="mt-1 text-sm text-gray-500 truncate">{n.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                          <p className="text-sm text-gray-700 leading-relaxed">{n.message}</p>

                          {/* Metadata */}
                          {n.metadata && Object.keys(n.metadata).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {Object.entries(n.metadata).map(([k, v]) => (
                                <span key={k} className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                  <span className="font-medium">{k}:</span> {String(v)}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Channels */}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-gray-400">Delivered via:</span>
                            {n.channels.map((ch) => (
                              <span key={ch} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 capitalize">{ch.replace('_', ' ')}</span>
                            ))}
                          </div>

                          {/* Actions row */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); toggleRead(n.id); }} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                {n.read ? <><EyeOff size={12} /> Mark Unread</> : <><Eye size={12} /> Mark Read</>}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); archiveNotification(n.id); }} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                <Archive size={12} /> Archive
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); togglePin(n.id); }} className={clsx('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium', isPinned ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                                <Pin size={12} /> {isPinned ? 'Unpin' : 'Pin'}
                              </button>
                            </div>
                            {n.actionUrl && (
                              <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                                {n.actionLabel || 'View'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer count ────────────────────────────────────────── */}
      <div className="text-center text-sm text-gray-400">
        Showing {filtered.length} of {notifications.length} notifications
      </div>
    </div>
  );
}
