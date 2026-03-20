export interface SyncStatus {
  lastSync: string;
  nextSync?: string;
  status: 'synced' | 'syncing' | 'pending' | 'offline' | 'error' | 'conflict';
  pendingChanges: number;
  pendingUploads: number;
  pendingDownloads: number;
  storageUsed: number;
  storageLimit: number;
  conflicts: SyncConflict[];
  syncHistory: Array<{ timestamp: string; direction: 'up' | 'down' | 'both'; items: number; duration: number; status: 'success' | 'partial' | 'failed'; error?: string }>;
}

export interface SyncConflict {
  id: string;
  entityType: 'flight_log' | 'checklist' | 'inspection' | 'safety_report' | 'maintenance_record';
  entityId: string;
  entityName: string;
  localVersion: { modifiedAt: string; modifiedBy: string; summary: string };
  serverVersion: { modifiedAt: string; modifiedBy: string; summary: string };
  resolution?: 'keep_local' | 'keep_server' | 'merge' | 'pending';
  detectedAt: string;
}

export interface OfflineCapability {
  feature: string;
  availableOffline: boolean;
  dataScope: 'full' | 'recent' | 'selected' | 'none';
  description: string;
  lastCached: string;
  cacheSize: number;
  autoSync: boolean;
  syncFrequency: string;
}

export interface FieldChecklistItem {
  id: string;
  category: 'pre_flight' | 'in_flight' | 'post_flight' | 'emergency';
  title: string;
  description: string;
  required: boolean;
  checked: boolean;
  checkedAt?: string;
  checkedBy?: string;
  notes?: string;
  order: number;
}

export interface OfflineStats {
  isOnline: boolean;
  pendingSync: number;
  conflicts: number;
  storageUsed: number;
  storageAvailable: number;
  lastSuccessfulSync: string;
  cachedFeatures: number;
  totalFeatures: number;
}
