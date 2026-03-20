export interface Document {
  id: string;
  tenantId: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: 'pilot_cert' | 'drone_registration' | 'insurance_coi' | 'airspace_waiver' | 'coa' | 'maintenance_record' | 'flight_log' | 'safety_report' | 'sop' | 'training_cert' | 'medical_cert' | 'customs_permit' | 'export_license' | 'other';
  subcategory?: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'pending_review' | 'archived';
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  reminderDays?: number;
  associatedEntity?: { type: 'pilot' | 'drone' | 'mission' | 'organization'; id: string; name: string };
  tags: string[];
  version: number;
  previousVersions: Array<{ version: number; uploadedAt: string; uploadedBy: string }>;
  shared: boolean;
  sharedWith: string[];
  notes: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  downloadUrl?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  icon: string;
  category: Document['category'];
  count: number;
  expiringSoon: number;
  expired: number;
  description: string;
}

export interface DocumentStats {
  totalDocuments: number;
  validDocuments: number;
  expiringSoon: number;
  expired: number;
  pendingReview: number;
  totalStorage: number;
  categoryCounts: Record<string, number>;
  recentUploads: number;
}

export interface ExpiryAlert {
  documentId: string;
  documentName: string;
  category: string;
  entityName: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'expiring_soon' | 'expired';
}
