import { useState } from 'react';
import {
  Wifi, WifiOff, RefreshCw, Clock, Upload, Download, HardDrive, AlertTriangle,
  Check, CheckCircle, XCircle, ArrowUp, ArrowDown, ArrowUpDown, Trash2,
  ClipboardCheck, ClipboardList, AlertCircle, Shield, ChevronDown, ChevronRight,
  Battery, Radio, MapPin, Cloud, CloudOff, Smartphone, FileText, Wrench,
  Plane, Eye, Users, Thermometer, BookOpen, Database, ToggleLeft, ToggleRight,
  Loader2, Info, Zap, MessageSquare,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { SyncStatus, SyncConflict, OfflineCapability, FieldChecklistItem, OfflineStats } from '../../../shared/types/offline';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockSyncStatus: SyncStatus = {
  lastSync: '2026-03-20T14:32:00Z',
  nextSync: '2026-03-20T14:47:00Z',
  status: 'synced',
  pendingChanges: 3,
  pendingUploads: 2,
  pendingDownloads: 1,
  storageUsed: 284 * 1024 * 1024,
  storageLimit: 1024 * 1024 * 1024,
  conflicts: [
    {
      id: 'cnf-001',
      entityType: 'flight_log',
      entityId: 'FL-2026-0312',
      entityName: 'Infrastructure Survey - Highway 101 Bridge',
      localVersion: { modifiedAt: '2026-03-20T13:45:00Z', modifiedBy: 'You (field)', summary: 'Updated flight duration to 42min, added wind gust notes and 3 waypoint adjustments' },
      serverVersion: { modifiedAt: '2026-03-20T13:50:00Z', modifiedBy: 'Sarah Park (office)', summary: 'Updated client billing code and added QA review status' },
      resolution: 'pending',
      detectedAt: '2026-03-20T14:32:00Z',
    },
    {
      id: 'cnf-002',
      entityType: 'checklist',
      entityId: 'CK-PRE-0089',
      entityName: 'Pre-flight Checklist - Mavic 3 Enterprise #1',
      localVersion: { modifiedAt: '2026-03-20T10:15:00Z', modifiedBy: 'You (field)', summary: 'Completed all 15 pre-flight items, added note about propeller wear' },
      serverVersion: { modifiedAt: '2026-03-20T11:00:00Z', modifiedBy: 'Mike Chen (maintenance)', summary: 'Added mandatory firmware check item per new SOP' },
      resolution: 'pending',
      detectedAt: '2026-03-20T14:32:00Z',
    },
  ],
  syncHistory: [
    { timestamp: '2026-03-20T14:32:00Z', direction: 'both', items: 24, duration: 3200, status: 'success' },
    { timestamp: '2026-03-20T14:17:00Z', direction: 'up', items: 8, duration: 1800, status: 'success' },
    { timestamp: '2026-03-20T14:02:00Z', direction: 'down', items: 15, duration: 2100, status: 'success' },
    { timestamp: '2026-03-20T13:47:00Z', direction: 'both', items: 31, duration: 4500, status: 'success' },
    { timestamp: '2026-03-20T13:32:00Z', direction: 'up', items: 5, duration: 950, status: 'partial', error: 'Timeout on 2 large attachments' },
    { timestamp: '2026-03-20T13:17:00Z', direction: 'down', items: 12, duration: 1600, status: 'success' },
    { timestamp: '2026-03-20T13:02:00Z', direction: 'both', items: 18, duration: 2800, status: 'success' },
    { timestamp: '2026-03-20T12:47:00Z', direction: 'up', items: 3, duration: 600, status: 'failed', error: 'Network connection lost' },
    { timestamp: '2026-03-20T12:32:00Z', direction: 'both', items: 22, duration: 3100, status: 'success' },
    { timestamp: '2026-03-20T12:17:00Z', direction: 'down', items: 9, duration: 1200, status: 'success' },
  ],
};

const mockOfflineStats: OfflineStats = {
  isOnline: true,
  pendingSync: 3,
  conflicts: 2,
  storageUsed: 284 * 1024 * 1024,
  storageAvailable: 740 * 1024 * 1024,
  lastSuccessfulSync: '2026-03-20T14:32:00Z',
  cachedFeatures: 7,
  totalFeatures: 10,
};

const mockPreFlightChecklist: FieldChecklistItem[] = [
  { id: 'pf-01', category: 'pre_flight', title: 'Weather Check', description: 'Verify current and forecast weather conditions meet flight requirements (wind < 25mph, visibility > 3mi, no precipitation)', required: true, checked: true, checkedAt: '2026-03-20T09:00:00Z', checkedBy: 'Pilot J. Williams', order: 1 },
  { id: 'pf-02', category: 'pre_flight', title: 'Airspace Check', description: 'Confirm airspace classification, NOTAM review, TFR check, and LAANC authorization if required', required: true, checked: true, checkedAt: '2026-03-20T09:02:00Z', checkedBy: 'Pilot J. Williams', order: 2 },
  { id: 'pf-03', category: 'pre_flight', title: 'Battery Charged', description: 'All flight batteries fully charged (>95%), controller battery >80%, mobile device >50%', required: true, checked: true, checkedAt: '2026-03-20T09:05:00Z', checkedBy: 'Pilot J. Williams', order: 3 },
  { id: 'pf-04', category: 'pre_flight', title: 'Props Inspected', description: 'Visual inspection of all propellers for cracks, chips, warping, or debris. Replace if any damage found', required: true, checked: true, checkedAt: '2026-03-20T09:07:00Z', checkedBy: 'Pilot J. Williams', notes: 'Minor scuff on prop 2 - within tolerance', order: 4 },
  { id: 'pf-05', category: 'pre_flight', title: 'Firmware Current', description: 'Verify aircraft, controller, and battery firmware are up to date. Check for critical updates', required: true, checked: true, checkedAt: '2026-03-20T09:08:00Z', checkedBy: 'Pilot J. Williams', order: 5 },
  { id: 'pf-06', category: 'pre_flight', title: 'GPS Lock', description: 'Confirm strong GPS signal (>12 satellites) and home point set. Verify RTK fix if applicable', required: true, checked: true, checkedAt: '2026-03-20T09:10:00Z', checkedBy: 'Pilot J. Williams', order: 6 },
  { id: 'pf-07', category: 'pre_flight', title: 'Remote ID Broadcasting', description: 'Verify Remote ID module is powered on and broadcasting correctly per 14 CFR Part 89', required: true, checked: true, checkedAt: '2026-03-20T09:11:00Z', checkedBy: 'Pilot J. Williams', order: 7 },
  { id: 'pf-08', category: 'pre_flight', title: 'Insurance Valid', description: 'Confirm current hull and liability insurance coverage is active and applicable to mission type', required: true, checked: true, checkedAt: '2026-03-20T09:12:00Z', checkedBy: 'Pilot J. Williams', order: 8 },
  { id: 'pf-09', category: 'pre_flight', title: 'Registration Current', description: 'Verify FAA registration is current and registration number is displayed on aircraft', required: true, checked: true, checkedAt: '2026-03-20T09:13:00Z', checkedBy: 'Pilot J. Williams', order: 9 },
  { id: 'pf-10', category: 'pre_flight', title: 'Flight Plan Filed', description: 'Flight plan submitted and approved. Confirm route, altitude, and duration parameters', required: true, checked: true, checkedAt: '2026-03-20T09:15:00Z', checkedBy: 'Pilot J. Williams', order: 10 },
  { id: 'pf-11', category: 'pre_flight', title: 'Visual Observers Briefed', description: 'Brief all visual observers on hand signals, communication protocol, and emergency procedures', required: false, checked: true, checkedAt: '2026-03-20T09:18:00Z', checkedBy: 'Pilot J. Williams', order: 11 },
  { id: 'pf-12', category: 'pre_flight', title: 'Emergency Procedures Reviewed', description: 'Review emergency/contingency procedures: RTH, manual landing, flyaway, lost link, battery failsafe', required: true, checked: false, order: 12 },
  { id: 'pf-13', category: 'pre_flight', title: 'Camera/Payload Mounted', description: 'Verify camera or payload is properly mounted, balanced, and lens is clean. Test gimbal movement', required: false, checked: false, order: 13 },
  { id: 'pf-14', category: 'pre_flight', title: 'Control Link Tested', description: 'Verify control link quality, test all stick inputs, verify failsafe settings are configured', required: true, checked: false, order: 14 },
  { id: 'pf-15', category: 'pre_flight', title: 'Logbook Ready', description: 'Digital logbook open and ready for flight time recording. Previous entries up to date', required: false, checked: false, order: 15 },
];

const mockPostFlightChecklist: FieldChecklistItem[] = [
  { id: 'po-01', category: 'post_flight', title: 'Log Flight Time', description: 'Record total flight time, takeoff/landing times, and number of flights in pilot logbook', required: true, checked: false, order: 1 },
  { id: 'po-02', category: 'post_flight', title: 'Report Incidents', description: 'Document any incidents, near-misses, or anomalies that occurred during the flight', required: true, checked: false, order: 2 },
  { id: 'po-03', category: 'post_flight', title: 'Inspect Drone', description: 'Visual post-flight inspection for damage, loose components, or foreign object debris', required: true, checked: false, order: 3 },
  { id: 'po-04', category: 'post_flight', title: 'Charge Batteries', description: 'Place all used batteries on charger. Note any batteries with reduced capacity for monitoring', required: false, checked: false, order: 4 },
  { id: 'po-05', category: 'post_flight', title: 'Download Data', description: 'Transfer flight data, photos, video, and telemetry logs from aircraft to storage system', required: true, checked: false, order: 5 },
  { id: 'po-06', category: 'post_flight', title: 'Update Maintenance Log', description: 'Record flight hours against maintenance schedule. Flag any upcoming service intervals', required: true, checked: false, order: 6 },
  { id: 'po-07', category: 'post_flight', title: 'Secure Equipment', description: 'Store drone, batteries, and accessories in protective cases. Lock vehicle/storage', required: false, checked: false, order: 7 },
  { id: 'po-08', category: 'post_flight', title: 'Debrief Crew', description: 'Quick debrief with crew on mission success, lessons learned, and any follow-up actions needed', required: false, checked: false, order: 8 },
];

const mockEmergencyChecklist: FieldChecklistItem[] = [
  { id: 'em-01', category: 'emergency', title: 'Initiate RTH', description: 'Activate Return-to-Home immediately. If RTH fails, attempt manual landing at nearest safe location', required: true, checked: false, order: 1 },
  { id: 'em-02', category: 'emergency', title: 'Alert Observers', description: 'Notify all visual observers and ground crew of emergency situation via radio/hand signals', required: true, checked: false, order: 2 },
  { id: 'em-03', category: 'emergency', title: 'Notify ATC', description: 'Contact ATC immediately if operating in controlled airspace. Provide location and nature of emergency', required: true, checked: false, order: 3 },
  { id: 'em-04', category: 'emergency', title: 'Secure Area', description: 'Clear all personnel from potential impact zone. Establish safety perimeter of minimum 50 feet', required: true, checked: false, order: 4 },
  { id: 'em-05', category: 'emergency', title: 'Document Incident', description: 'Photograph crash site/landing location, preserve flight logs, note GPS coordinates and time', required: true, checked: false, order: 5 },
  { id: 'em-06', category: 'emergency', title: 'File Safety Report', description: 'Submit FAA DroneZone accident report within 10 days if injury or property damage > $500', required: true, checked: false, order: 6 },
];

const mockOfflineCapabilities: OfflineCapability[] = [
  { feature: 'Flight Logs', availableOffline: true, dataScope: 'recent', description: 'View and create flight logs. Last 90 days cached locally with full telemetry data', lastCached: '2026-03-20T14:32:00Z', cacheSize: 45 * 1024 * 1024, autoSync: true, syncFrequency: 'Every 15 min' },
  { feature: 'Checklists', availableOffline: true, dataScope: 'full', description: 'All pre-flight, post-flight, and emergency checklists available offline with digital sign-off', lastCached: '2026-03-20T14:32:00Z', cacheSize: 8 * 1024 * 1024, autoSync: true, syncFrequency: 'Every 15 min' },
  { feature: 'Safety Reports', availableOffline: true, dataScope: 'recent', description: 'Create and view safety reports. Draft reports saved locally until connectivity is restored', lastCached: '2026-03-20T14:32:00Z', cacheSize: 22 * 1024 * 1024, autoSync: true, syncFrequency: 'Every 15 min' },
  { feature: 'Maintenance Records', availableOffline: true, dataScope: 'selected', description: 'View maintenance history for selected drones. New records queued for upload', lastCached: '2026-03-20T14:17:00Z', cacheSize: 35 * 1024 * 1024, autoSync: true, syncFrequency: 'Every 30 min' },
  { feature: 'Drone Registry', availableOffline: true, dataScope: 'full', description: 'Full drone fleet registry with registration numbers, specs, and certification status', lastCached: '2026-03-20T14:32:00Z', cacheSize: 12 * 1024 * 1024, autoSync: true, syncFrequency: 'Every 1 hour' },
  { feature: 'Pilot Certifications', availableOffline: true, dataScope: 'full', description: 'Pilot Part 107 certificates, waivers, medical declarations, and training records', lastCached: '2026-03-20T12:00:00Z', cacheSize: 18 * 1024 * 1024, autoSync: false, syncFrequency: 'Manual' },
  { feature: 'Weather (Cached)', availableOffline: true, dataScope: 'recent', description: 'Last fetched weather data with 6-hour forecast. Updates when online connectivity available', lastCached: '2026-03-20T14:30:00Z', cacheSize: 6 * 1024 * 1024, autoSync: true, syncFrequency: 'Every 5 min' },
  { feature: 'Airspace Maps', availableOffline: false, dataScope: 'selected', description: 'Sectional charts and airspace boundaries for selected regions. Requires manual download', lastCached: '2026-03-18T10:00:00Z', cacheSize: 95 * 1024 * 1024, autoSync: false, syncFrequency: 'Manual' },
  { feature: 'B4UFLY Data', availableOffline: false, dataScope: 'none', description: 'Real-time airspace advisories and restrictions. Requires active internet connection', lastCached: '2026-03-20T14:32:00Z', cacheSize: 3 * 1024 * 1024, autoSync: true, syncFrequency: 'Real-time' },
  { feature: 'Regulations Reference', availableOffline: false, dataScope: 'none', description: 'FAA Part 107 regulations, advisory circulars, and local ordinances reference library', lastCached: '2026-03-15T08:00:00Z', cacheSize: 42 * 1024 * 1024, autoSync: false, syncFrequency: 'Weekly' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Component ──────────────────────────────────────────────────────────────────

type TabId = 'sync' | 'checklists' | 'features';

export function OfflineFieldPage() {
  const [activeTab, setActiveTab] = useState<TabId>('sync');
  const [isOnline, setIsOnline] = useState(mockOfflineStats.isOnline);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState<SyncConflict[]>(mockSyncStatus.conflicts);
  const [preFlightItems, setPreFlightItems] = useState<FieldChecklistItem[]>(mockPreFlightChecklist);
  const [postFlightItems, setPostFlightItems] = useState<FieldChecklistItem[]>(mockPostFlightChecklist);
  const [emergencyItems, setEmergencyItems] = useState<FieldChecklistItem[]>(mockEmergencyChecklist);
  const [offlineFeatures, setOfflineFeatures] = useState<OfflineCapability[]>(mockOfflineCapabilities);
  const [activeChecklist, setActiveChecklist] = useState<'pre_flight' | 'post_flight' | 'emergency'>('pre_flight');
  const [checklistNotes, setChecklistNotes] = useState<Record<string, string>>({});

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 3000);
  };

  const handleResolveConflict = (conflictId: string, resolution: 'keep_local' | 'keep_server' | 'merge') => {
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, resolution } : c));
  };

  const toggleCheckItem = (id: string, list: 'pre' | 'post' | 'emergency') => {
    const setter = list === 'pre' ? setPreFlightItems : list === 'post' ? setPostFlightItems : setEmergencyItems;
    setter(prev => prev.map(item =>
      item.id === id
        ? { ...item, checked: !item.checked, checkedAt: !item.checked ? new Date().toISOString() : undefined, checkedBy: !item.checked ? 'Pilot J. Williams' : undefined }
        : item
    ));
  };

  const toggleAutoSync = (feature: string) => {
    setOfflineFeatures(prev => prev.map(f => f.feature === feature ? { ...f, autoSync: !f.autoSync } : f));
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'sync', label: 'Sync Status', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'checklists', label: 'Field Checklists', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'features', label: 'Offline Features', icon: <CloudOff className="w-4 h-4" /> },
  ];

  const checkedPreFlight = preFlightItems.filter(i => i.checked).length;
  const requiredPreFlight = preFlightItems.filter(i => i.required);
  const allRequiredChecked = requiredPreFlight.every(i => i.checked);

  const getActiveItems = () => {
    switch (activeChecklist) {
      case 'pre_flight': return { items: preFlightItems, list: 'pre' as const };
      case 'post_flight': return { items: postFlightItems, list: 'post' as const };
      case 'emergency': return { items: emergencyItems, list: 'emergency' as const };
    }
  };

  const storagePercent = (mockSyncStatus.storageUsed / mockSyncStatus.storageLimit) * 100;
  const totalCacheSize = offlineFeatures.reduce((sum, f) => sum + f.cacheSize, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <Smartphone className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Offline Mode & Field Operations</h1>
            <p className="text-sm text-gray-400">Manage offline data sync, field checklists, and cached features for fieldwork</p>
          </div>
        </div>

        {/* Connection Badge */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={clsx(
            'flex items-center gap-2.5 px-5 py-2.5 rounded-xl border font-medium transition-all',
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          )}
        >
          <span className="relative flex h-3 w-3">
            <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isOnline ? 'bg-emerald-400' : 'bg-red-400')} />
            <span className={clsx('relative inline-flex rounded-full h-3 w-3', isOnline ? 'bg-emerald-500' : 'bg-red-500')} />
          </span>
          {isOnline ? (
            <><Wifi className="w-4 h-4" /> Online</>
          ) : (
            <><WifiOff className="w-4 h-4" /> Offline</>
          )}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Last Sync', value: timeAgo(mockOfflineStats.lastSuccessfulSync), icon: <Clock className="w-4 h-4" />, color: 'sky' },
          { label: 'Pending Changes', value: String(mockOfflineStats.pendingSync), icon: <Upload className="w-4 h-4" />, color: mockOfflineStats.pendingSync > 0 ? 'amber' : 'emerald' },
          { label: 'Conflicts', value: String(conflicts.filter(c => c.resolution === 'pending').length), icon: <AlertTriangle className="w-4 h-4" />, color: conflicts.filter(c => c.resolution === 'pending').length > 0 ? 'red' : 'emerald' },
          { label: 'Storage Used', value: formatBytes(mockOfflineStats.storageUsed), icon: <HardDrive className="w-4 h-4" />, color: 'violet' },
        ].map(stat => (
          <div key={stat.label} className={clsx('bg-gray-900/60 border rounded-xl p-4', `border-${stat.color}-500/20`)}>
            <div className={clsx('flex items-center gap-1.5 text-xs font-medium mb-1', `text-${stat.color}-400`)}>
              {stat.icon}
              {stat.label}
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Sync Status ──────────────────────────────────────────── */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Sync Action */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Sync every 15 minutes automatically</p>
              <p className="text-xs text-gray-500">
                Next sync at {mockSyncStatus.nextSync ? formatTime(mockSyncStatus.nextSync) : 'N/A'} | {mockSyncStatus.pendingUploads} uploads, {mockSyncStatus.pendingDownloads} downloads pending
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
                isSyncing
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              )}
            >
              <RefreshCw className={clsx('w-4 h-4', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Conflicts */}
          {conflicts.filter(c => c.resolution === 'pending').length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-amber-400">
                  {conflicts.filter(c => c.resolution === 'pending').length} Sync Conflict{conflicts.filter(c => c.resolution === 'pending').length > 1 ? 's' : ''} Detected
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                These records were modified both locally and on the server. Choose how to resolve each conflict.
              </p>

              <div className="space-y-4">
                {conflicts.map(conflict => (
                  <div key={conflict.id} className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          conflict.entityType === 'flight_log' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                        )}>
                          {conflict.entityType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-medium text-white">{conflict.entityName}</span>
                      </div>
                      {conflict.resolution !== 'pending' && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolved: {conflict.resolution?.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Local Version */}
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400">
                          <Smartphone className="w-3.5 h-3.5" />
                          Local Version
                        </div>
                        <p className="text-xs text-gray-400">{formatDateTime(conflict.localVersion.modifiedAt)}</p>
                        <p className="text-xs text-gray-500">By: {conflict.localVersion.modifiedBy}</p>
                        <p className="text-sm text-gray-300 mt-1">{conflict.localVersion.summary}</p>
                      </div>
                      {/* Server Version */}
                      <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-violet-400">
                          <Cloud className="w-3.5 h-3.5" />
                          Server Version
                        </div>
                        <p className="text-xs text-gray-400">{formatDateTime(conflict.serverVersion.modifiedAt)}</p>
                        <p className="text-xs text-gray-500">By: {conflict.serverVersion.modifiedBy}</p>
                        <p className="text-sm text-gray-300 mt-1">{conflict.serverVersion.summary}</p>
                      </div>
                    </div>

                    {conflict.resolution === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleResolveConflict(conflict.id, 'keep_local')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all">
                          <Smartphone className="w-3.5 h-3.5" /> Keep Local
                        </button>
                        <button onClick={() => handleResolveConflict(conflict.id, 'keep_server')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all">
                          <Cloud className="w-3.5 h-3.5" /> Keep Server
                        </button>
                        <button onClick={() => handleResolveConflict(conflict.id, 'merge')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all">
                          <ArrowUpDown className="w-3.5 h-3.5" /> Merge
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sync History */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Sync History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-400">
                    <th className="pb-3 pr-4 font-medium">Time</th>
                    <th className="pb-3 pr-4 font-medium">Direction</th>
                    <th className="pb-3 pr-4 font-medium text-right">Items</th>
                    <th className="pb-3 pr-4 font-medium text-right">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {mockSyncStatus.syncHistory.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-300 text-xs">{formatTime(entry.timestamp)}</td>
                      <td className="py-2.5 pr-4">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          {entry.direction === 'up' && <><ArrowUp className="w-3.5 h-3.5 text-blue-400" /> Upload</>}
                          {entry.direction === 'down' && <><ArrowDown className="w-3.5 h-3.5 text-violet-400" /> Download</>}
                          {entry.direction === 'both' && <><ArrowUpDown className="w-3.5 h-3.5 text-sky-400" /> Both</>}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-gray-300 text-xs">{entry.items}</td>
                      <td className="py-2.5 pr-4 text-right text-gray-400 text-xs">{formatDuration(entry.duration)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={clsx(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                          entry.status === 'success' && 'bg-emerald-500/10 text-emerald-400',
                          entry.status === 'partial' && 'bg-amber-500/10 text-amber-400',
                          entry.status === 'failed' && 'bg-red-500/10 text-red-400',
                        )}>
                          {entry.status === 'success' && <CheckCircle className="w-3 h-3" />}
                          {entry.status === 'partial' && <AlertCircle className="w-3 h-3" />}
                          {entry.status === 'failed' && <XCircle className="w-3 h-3" />}
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-gray-500">{entry.error ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Storage Management */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              Storage Management
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{formatBytes(mockSyncStatus.storageUsed)} used</span>
                <span className="text-gray-400">{formatBytes(mockSyncStatus.storageLimit)} total</span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all', storagePercent > 80 ? 'bg-red-500' : storagePercent > 60 ? 'bg-amber-500' : 'bg-sky-500')}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{formatBytes(mockSyncStatus.storageLimit - mockSyncStatus.storageUsed)} available ({(100 - storagePercent).toFixed(0)}%)</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all">
              <Trash2 className="w-4 h-4" />
              Clear All Cached Data
            </button>
          </div>
        </div>
      )}

      {/* ─── Tab 2: Field Checklists ─────────────────────────────────────── */}
      {activeTab === 'checklists' && (
        <div className="space-y-6">
          {/* Checklist Type Selector */}
          <div className="flex gap-2">
            {([
              { id: 'pre_flight' as const, label: 'Pre-Flight', icon: <Plane className="w-4 h-4" />, count: preFlightItems.length, checked: preFlightItems.filter(i => i.checked).length },
              { id: 'post_flight' as const, label: 'Post-Flight', icon: <ClipboardList className="w-4 h-4" />, count: postFlightItems.length, checked: postFlightItems.filter(i => i.checked).length },
              { id: 'emergency' as const, label: 'Emergency', icon: <AlertTriangle className="w-4 h-4" />, count: emergencyItems.length, checked: emergencyItems.filter(i => i.checked).length },
            ]).map(cl => (
              <button
                key={cl.id}
                onClick={() => setActiveChecklist(cl.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all',
                  activeChecklist === cl.id
                    ? cl.id === 'emergency' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                )}
              >
                {cl.icon}
                {cl.label}
                <span className="text-xs opacity-60">({cl.checked}/{cl.count})</span>
              </button>
            ))}
          </div>

          {/* Progress */}
          {(() => {
            const { items, list } = getActiveItems();
            const checked = items.filter(i => i.checked).length;
            const required = items.filter(i => i.required);
            const allReqDone = required.every(i => i.checked);
            const percent = items.length > 0 ? (checked / items.length) * 100 : 0;

            return (
              <div className="space-y-6">
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{activeChecklist.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Checklist</h3>
                    {allReqDone && checked === items.length && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        All Checks Passed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all', percent === 100 ? 'bg-emerald-500' : percent > 60 ? 'bg-sky-500' : 'bg-amber-500')}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-300">{checked}/{items.length}</span>
                  </div>
                  {!allReqDone && (
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {required.filter(i => !i.checked).length} required item{required.filter(i => !i.checked).length > 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>

                {/* Checklist Items */}
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={clsx(
                        'bg-gray-900/60 border rounded-xl p-4 transition-all',
                        item.checked ? 'border-emerald-500/20' : item.required ? 'border-gray-700' : 'border-gray-800'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleCheckItem(item.id, list)}
                          className={clsx(
                            'mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all',
                            item.checked
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-600 hover:border-sky-500'
                          )}
                        >
                          {item.checked && <Check className="w-3 h-3" />}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className={clsx('font-medium text-sm', item.checked ? 'text-gray-400 line-through' : 'text-white')}>
                              {item.title}
                            </p>
                            {item.required && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{item.description}</p>

                          {item.checked && item.checkedAt && (
                            <p className="text-[10px] text-emerald-500/70">
                              Checked by {item.checkedBy} at {formatTime(item.checkedAt)}
                            </p>
                          )}

                          {item.notes && (
                            <p className="text-xs text-amber-400/80 flex items-center gap-1 mt-1">
                              <MessageSquare className="w-3 h-3" /> {item.notes}
                            </p>
                          )}

                          {/* Notes input */}
                          <input
                            type="text"
                            placeholder="Add notes..."
                            value={checklistNotes[item.id] ?? item.notes ?? ''}
                            onChange={e => setChecklistNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="mt-1 w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Digital Sign-off */}
                {allReqDone && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 space-y-3">
                    <h4 className="font-semibold text-emerald-400 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Digital Sign-Off
                    </h4>
                    <p className="text-sm text-gray-400">
                      All required checks have been completed. Sign off to confirm this checklist is complete.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Pilot: J. Williams | {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        Sign Off & Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── Tab 3: Offline Features ─────────────────────────────────────── */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          {/* Download All */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Download All for Field Use</h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Cache all available features for offline use. Estimated size: {formatBytes(totalCacheSize)}
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Download All
            </button>
          </div>

          {/* Feature Grid */}
          <div className="space-y-3">
            {offlineFeatures.map(feature => (
              <div key={feature.feature} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-medium text-white">{feature.feature}</span>
                      {feature.availableOffline ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Available Offline
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          <CloudOff className="w-3 h-3" /> Online Only
                        </span>
                      )}
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-[10px] font-medium border',
                        feature.dataScope === 'full' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        feature.dataScope === 'recent' && 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                        feature.dataScope === 'selected' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        feature.dataScope === 'none' && 'bg-gray-500/10 text-gray-500 border-gray-500/20',
                      )}>
                        {feature.dataScope}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{feature.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {formatBytes(feature.cacheSize)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(feature.lastCached)}</span>
                      <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {feature.syncFrequency}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Auto-sync toggle */}
                    <button
                      onClick={() => toggleAutoSync(feature.feature)}
                      className={clsx(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        feature.autoSync
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      )}
                    >
                      {feature.autoSync ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      Auto
                    </button>

                    {/* Download button */}
                    <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-all">
                      <Download className="w-3.5 h-3.5" />
                      Cache
                    </button>

                    {/* Clear button */}
                    <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-800 border border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/20 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Storage Breakdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Storage Breakdown by Feature
            </h3>
            <div className="space-y-3">
              {offlineFeatures
                .sort((a, b) => b.cacheSize - a.cacheSize)
                .map(feature => {
                  const percent = totalCacheSize > 0 ? (feature.cacheSize / totalCacheSize) * 100 : 0;
                  return (
                    <div key={feature.feature} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{feature.feature}</span>
                        <span className="text-gray-500">{formatBytes(feature.cacheSize)}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all',
                            percent > 30 ? 'bg-sky-500' : percent > 15 ? 'bg-violet-500' : 'bg-emerald-500'
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-sm">
              <span className="text-gray-400 font-medium">Total Cached</span>
              <span className="text-white font-bold">{formatBytes(totalCacheSize)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
