import { Fragment, useState } from 'react';
import {
  FileText, File, FilePlus, FileCheck, FileX, FolderOpen, Folder, Upload, Download,
  Search, Filter, Eye, Shield, ShieldCheck, Calendar, Clock, AlertTriangle, AlertCircle,
  CheckCircle, XCircle, User, Plane, Tag, Share2, Lock, Unlock, Trash2, Archive,
  Edit, ChevronDown, ChevronUp, Grid, List, HardDrive, Plus, RefreshCw, ExternalLink,
  Award, Heart,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Document, DocumentFolder, DocumentStats, ExpiryAlert } from '../../../shared/types/documents';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockDocuments: Document[] = [
  { id: 'DOC-001', tenantId: 'T-001', name: 'Part 107 Certificate - J. Martinez', fileName: 'part107_martinez.pdf', fileSize: 245000, mimeType: 'application/pdf', category: 'pilot_cert', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2025-08-15', expiryDate: '2027-08-15', reminderDays: 90, associatedEntity: { type: 'pilot', id: 'PLT-001', name: 'Juan Martinez' }, tags: ['part107', 'remote-pilot'], version: 2, previousVersions: [{ version: 1, uploadedAt: '2023-08-10', uploadedBy: 'Juan Martinez' }], shared: true, sharedWith: ['ops-team'], notes: 'Renewed 2025. Knowledge test score: 92%.', verified: true, verifiedBy: 'Sarah Kim', verifiedAt: '2025-08-16' },
  { id: 'DOC-002', tenantId: 'T-001', name: 'Part 107 Certificate - S. Kim', fileName: 'part107_kim.pdf', fileSize: 230000, mimeType: 'application/pdf', category: 'pilot_cert', status: 'expiring_soon', uploadedBy: 'Sarah Kim', uploadedAt: '2024-05-20', expiryDate: '2026-05-20', reminderDays: 90, associatedEntity: { type: 'pilot', id: 'PLT-002', name: 'Sarah Kim' }, tags: ['part107', 'remote-pilot'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: 'First certification.', verified: true, verifiedBy: 'Admin', verifiedAt: '2024-05-21' },
  { id: 'DOC-003', tenantId: 'T-001', name: 'Part 107 Certificate - R. Chen', fileName: 'part107_chen.pdf', fileSize: 198000, mimeType: 'application/pdf', category: 'pilot_cert', status: 'expired', uploadedBy: 'Robert Chen', uploadedAt: '2022-03-10', expiryDate: '2024-03-10', reminderDays: 90, associatedEntity: { type: 'pilot', id: 'PLT-003', name: 'Robert Chen' }, tags: ['part107'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: 'Needs renewal ASAP.', verified: true, verifiedBy: 'Admin', verifiedAt: '2022-03-11' },
  { id: 'DOC-004', tenantId: 'T-001', name: 'Part 107 Certificate - A. Patel', fileName: 'part107_patel.pdf', fileSize: 255000, mimeType: 'application/pdf', category: 'pilot_cert', status: 'valid', uploadedBy: 'Aisha Patel', uploadedAt: '2025-11-02', expiryDate: '2027-11-02', reminderDays: 90, associatedEntity: { type: 'pilot', id: 'PLT-004', name: 'Aisha Patel' }, tags: ['part107', 'remote-pilot', 'night-waiver'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: 'Includes night operations endorsement.', verified: true, verifiedBy: 'Juan Martinez', verifiedAt: '2025-11-03' },
  { id: 'DOC-005', tenantId: 'T-001', name: 'Mavic 3 Enterprise Registration', fileName: 'faa_reg_mavic3e.pdf', fileSize: 180000, mimeType: 'application/pdf', category: 'drone_registration', status: 'valid', uploadedBy: 'Sarah Kim', uploadedAt: '2025-04-10', expiryDate: '2028-04-10', reminderDays: 60, associatedEntity: { type: 'drone', id: 'DRN-001', name: 'Mavic 3 Enterprise #1' }, tags: ['faa-registration', 'part107'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team', 'maintenance'], notes: 'FAA Registration #FA3WXY456.', verified: true, verifiedBy: 'Admin', verifiedAt: '2025-04-11' },
  { id: 'DOC-006', tenantId: 'T-001', name: 'Matrice 350 RTK Registration', fileName: 'faa_reg_m350.pdf', fileSize: 175000, mimeType: 'application/pdf', category: 'drone_registration', status: 'valid', uploadedBy: 'Sarah Kim', uploadedAt: '2024-11-20', expiryDate: '2027-11-20', reminderDays: 60, associatedEntity: { type: 'drone', id: 'DRN-002', name: 'Matrice 350 RTK' }, tags: ['faa-registration'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: 'Registered for commercial operations.', verified: true, verifiedBy: 'Admin', verifiedAt: '2024-11-21' },
  { id: 'DOC-007', tenantId: 'T-001', name: 'Skydio X10 Registration', fileName: 'faa_reg_skydio.pdf', fileSize: 172000, mimeType: 'application/pdf', category: 'drone_registration', status: 'expiring_soon', uploadedBy: 'Robert Chen', uploadedAt: '2023-09-01', expiryDate: '2026-09-01', reminderDays: 60, associatedEntity: { type: 'drone', id: 'DRN-004', name: 'Skydio X10' }, tags: ['faa-registration'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: '', verified: true, verifiedBy: 'Admin', verifiedAt: '2023-09-02' },
  { id: 'DOC-008', tenantId: 'T-001', name: 'Phantom 4 RTK Registration', fileName: 'faa_reg_p4rtk.pdf', fileSize: 168000, mimeType: 'application/pdf', category: 'drone_registration', status: 'expired', uploadedBy: 'Juan Martinez', uploadedAt: '2023-02-15', expiryDate: '2026-02-15', reminderDays: 60, associatedEntity: { type: 'drone', id: 'DRN-006', name: 'Phantom 4 RTK' }, tags: ['faa-registration'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: 'Expired. Drone grounded.', verified: true, verifiedBy: 'Admin', verifiedAt: '2023-02-16' },
  { id: 'DOC-009', tenantId: 'T-001', name: 'Fleet Liability Insurance COI 2026', fileName: 'insurance_coi_2026.pdf', fileSize: 520000, mimeType: 'application/pdf', category: 'insurance_coi', status: 'valid', uploadedBy: 'Admin', uploadedAt: '2026-01-05', expiryDate: '2027-01-05', reminderDays: 60, associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['liability', 'hull-coverage', 'annual'], version: 3, previousVersions: [{ version: 1, uploadedAt: '2024-01-05', uploadedBy: 'Admin' }, { version: 2, uploadedAt: '2025-01-05', uploadedBy: 'Admin' }], shared: true, sharedWith: ['ops-team', 'finance'], notes: '$5M aggregate coverage. Includes hull & payload.', verified: true, verifiedBy: 'CFO', verifiedAt: '2026-01-06' },
  { id: 'DOC-010', tenantId: 'T-001', name: 'Matrice 350 Hull Insurance', fileName: 'insurance_hull_m350.pdf', fileSize: 345000, mimeType: 'application/pdf', category: 'insurance_coi', status: 'expiring_soon', uploadedBy: 'Admin', uploadedAt: '2025-06-15', expiryDate: '2026-06-15', reminderDays: 45, associatedEntity: { type: 'drone', id: 'DRN-002', name: 'Matrice 350 RTK' }, tags: ['hull-insurance', 'per-drone'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: 'Hull value: $14,500.', verified: true, verifiedBy: 'Admin', verifiedAt: '2025-06-16' },
  { id: 'DOC-011', tenantId: 'T-001', name: 'Night Operations Waiver', fileName: 'waiver_night_ops.pdf', fileSize: 412000, mimeType: 'application/pdf', category: 'airspace_waiver', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2025-09-10', expiryDate: '2027-09-10', reminderDays: 90, associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['part107-waiver', 'night-ops', '107.29'], version: 1, previousVersions: [], shared: true, sharedWith: ['all-pilots'], notes: 'Waiver for 14 CFR 107.29 (night operations).', verified: true, verifiedBy: 'FAA', verifiedAt: '2025-09-10' },
  { id: 'DOC-012', tenantId: 'T-001', name: 'BVLOS Waiver Application', fileName: 'waiver_bvlos_app.pdf', fileSize: 890000, mimeType: 'application/pdf', category: 'airspace_waiver', status: 'pending_review', uploadedBy: 'Aisha Patel', uploadedAt: '2026-02-28', reminderDays: 30, associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['bvlos', 'part107-waiver', '107.31'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team', 'safety'], notes: 'BVLOS waiver application submitted to FAA. Awaiting determination.', verified: false },
  { id: 'DOC-013', tenantId: 'T-001', name: 'Class D COA - Metro Airport', fileName: 'coa_classd_metro.pdf', fileSize: 678000, mimeType: 'application/pdf', category: 'coa', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2025-07-01', expiryDate: '2026-07-01', reminderDays: 60, associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['coa', 'class-d', 'metro-airport'], version: 2, previousVersions: [{ version: 1, uploadedAt: '2024-07-01', uploadedBy: 'Juan Martinez' }], shared: true, sharedWith: ['all-pilots'], notes: 'Authorizes ops within 5nm of Metro Airport Class D. Max 200ft AGL.', verified: true, verifiedBy: 'FAA', verifiedAt: '2025-07-02' },
  { id: 'DOC-014', tenantId: 'T-001', name: 'Mavic 3E - 200hr Service Report', fileName: 'maint_mavic3e_200hr.pdf', fileSize: 1200000, mimeType: 'application/pdf', category: 'maintenance_record', status: 'valid', uploadedBy: 'Mike Chen', uploadedAt: '2026-02-15', associatedEntity: { type: 'drone', id: 'DRN-001', name: 'Mavic 3 Enterprise #1' }, tags: ['service-report', '200hr', 'routine'], version: 1, previousVersions: [], shared: true, sharedWith: ['maintenance', 'ops-team'], notes: 'All systems nominal. Minor propeller wear noted.', verified: true, verifiedBy: 'Sarah Kim', verifiedAt: '2026-02-16' },
  { id: 'DOC-015', tenantId: 'T-001', name: 'Matrice 350 Pre-Flight Inspection', fileName: 'maint_m350_preflight.pdf', fileSize: 450000, mimeType: 'application/pdf', category: 'maintenance_record', status: 'valid', uploadedBy: 'Sarah Park', uploadedAt: '2026-03-01', associatedEntity: { type: 'drone', id: 'DRN-002', name: 'Matrice 350 RTK' }, tags: ['inspection', 'pre-flight', 'safety'], version: 1, previousVersions: [], shared: true, sharedWith: ['maintenance'], notes: 'Cleared for infrastructure survey mission.', verified: true, verifiedBy: 'Mike Chen', verifiedAt: '2026-03-01' },
  { id: 'DOC-016', tenantId: 'T-001', name: 'M30T Gimbal Repair Log', fileName: 'maint_m30t_gimbal.pdf', fileSize: 780000, mimeType: 'application/pdf', category: 'maintenance_record', status: 'pending_review', uploadedBy: 'James Wu', uploadedAt: '2026-03-18', associatedEntity: { type: 'drone', id: 'DRN-005', name: 'Mavic 3T Thermal' }, tags: ['repair', 'gimbal', 'in-progress'], version: 1, previousVersions: [], shared: true, sharedWith: ['maintenance'], notes: 'Gimbal assembly replacement in progress. Parts on order.', verified: false },
  { id: 'DOC-017', tenantId: 'T-001', name: 'March 2026 Flight Log - Martinez', fileName: 'flight_log_martinez_mar26.csv', fileSize: 156000, mimeType: 'text/csv', category: 'flight_log', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2026-03-15', associatedEntity: { type: 'pilot', id: 'PLT-001', name: 'Juan Martinez' }, tags: ['monthly-log', 'march-2026'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: '42 flights, 38.5 hours logged.', verified: true, verifiedBy: 'Admin', verifiedAt: '2026-03-16' },
  { id: 'DOC-018', tenantId: 'T-001', name: 'February 2026 Flight Log - Kim', fileName: 'flight_log_kim_feb26.csv', fileSize: 134000, mimeType: 'text/csv', category: 'flight_log', status: 'valid', uploadedBy: 'Sarah Kim', uploadedAt: '2026-03-01', associatedEntity: { type: 'pilot', id: 'PLT-002', name: 'Sarah Kim' }, tags: ['monthly-log', 'february-2026'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: '31 flights, 28.2 hours logged.', verified: true, verifiedBy: 'Admin', verifiedAt: '2026-03-02' },
  { id: 'DOC-019', tenantId: 'T-001', name: 'Near-Miss Incident Report #2026-03', fileName: 'safety_nearmiss_202603.pdf', fileSize: 920000, mimeType: 'application/pdf', category: 'safety_report', status: 'valid', uploadedBy: 'Aisha Patel', uploadedAt: '2026-03-12', associatedEntity: { type: 'mission', id: 'MSN-045', name: 'Bridge Inspection - I-95' }, tags: ['near-miss', 'incident', 'manned-aircraft'], version: 1, previousVersions: [], shared: true, sharedWith: ['safety', 'ops-team'], notes: 'Near-miss with manned helicopter at 350ft. Detailed in report.', verified: true, verifiedBy: 'Safety Officer', verifiedAt: '2026-03-13' },
  { id: 'DOC-020', tenantId: 'T-001', name: 'Emergency Procedures SOP v4.1', fileName: 'sop_emergency_v4.1.pdf', fileSize: 2100000, mimeType: 'application/pdf', category: 'sop', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2026-01-15', associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['sop', 'emergency', 'safety', 'procedures'], version: 4, previousVersions: [{ version: 1, uploadedAt: '2024-01-15', uploadedBy: 'Admin' }, { version: 2, uploadedAt: '2024-08-01', uploadedBy: 'Juan Martinez' }, { version: 3, uploadedAt: '2025-06-20', uploadedBy: 'Juan Martinez' }], shared: true, sharedWith: ['all-pilots', 'ops-team', 'safety'], notes: 'Updated with BVLOS emergency procedures and new comm protocols.', verified: true, verifiedBy: 'Safety Officer', verifiedAt: '2026-01-16' },
  { id: 'DOC-021', tenantId: 'T-001', name: 'Pre-Flight Checklist SOP v2.3', fileName: 'sop_preflight_v2.3.pdf', fileSize: 1450000, mimeType: 'application/pdf', category: 'sop', status: 'valid', uploadedBy: 'Sarah Kim', uploadedAt: '2025-11-10', associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['sop', 'preflight', 'checklist'], version: 2, previousVersions: [{ version: 1, uploadedAt: '2024-06-01', uploadedBy: 'Admin' }], shared: true, sharedWith: ['all-pilots'], notes: 'Includes Remote ID verification steps.', verified: true, verifiedBy: 'Juan Martinez', verifiedAt: '2025-11-11' },
  { id: 'DOC-022', tenantId: 'T-001', name: 'UAS Safety Training - Martinez', fileName: 'training_safety_martinez.pdf', fileSize: 310000, mimeType: 'application/pdf', category: 'training_cert', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2025-10-01', expiryDate: '2027-10-01', reminderDays: 90, associatedEntity: { type: 'pilot', id: 'PLT-001', name: 'Juan Martinez' }, tags: ['training', 'safety', 'annual'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: 'Annual safety recurrent training completed.', verified: true, verifiedBy: 'Training Dept', verifiedAt: '2025-10-02' },
  { id: 'DOC-023', tenantId: 'T-001', name: 'Thermal Imaging Training - Patel', fileName: 'training_thermal_patel.pdf', fileSize: 280000, mimeType: 'application/pdf', category: 'training_cert', status: 'valid', uploadedBy: 'Aisha Patel', uploadedAt: '2025-12-15', expiryDate: '2027-12-15', reminderDays: 90, associatedEntity: { type: 'pilot', id: 'PLT-004', name: 'Aisha Patel' }, tags: ['training', 'thermal', 'specialist'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: 'ITC Level I Thermography certification.', verified: true, verifiedBy: 'Training Dept', verifiedAt: '2025-12-16' },
  { id: 'DOC-024', tenantId: 'T-001', name: 'Medical Certificate - Martinez', fileName: 'medical_martinez.pdf', fileSize: 195000, mimeType: 'application/pdf', category: 'medical_cert', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2025-06-01', expiryDate: '2027-06-01', reminderDays: 60, associatedEntity: { type: 'pilot', id: 'PLT-001', name: 'Juan Martinez' }, tags: ['medical', 'class-3'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: 'Class 3 medical. No restrictions.', verified: true, verifiedBy: 'Admin', verifiedAt: '2025-06-02' },
  { id: 'DOC-025', tenantId: 'T-001', name: 'Medical Certificate - Kim', fileName: 'medical_kim.pdf', fileSize: 190000, mimeType: 'application/pdf', category: 'medical_cert', status: 'expiring_soon', uploadedBy: 'Sarah Kim', uploadedAt: '2024-04-10', expiryDate: '2026-04-10', reminderDays: 60, associatedEntity: { type: 'pilot', id: 'PLT-002', name: 'Sarah Kim' }, tags: ['medical'], version: 1, previousVersions: [], shared: false, sharedWith: [], notes: 'Renewal scheduled for March 2026.', verified: true, verifiedBy: 'Admin', verifiedAt: '2024-04-11' },
  { id: 'DOC-026', tenantId: 'T-001', name: 'Customs Overflight Permit - Border Ops', fileName: 'customs_border_permit.pdf', fileSize: 560000, mimeType: 'application/pdf', category: 'customs_permit', status: 'valid', uploadedBy: 'Admin', uploadedAt: '2026-01-20', expiryDate: '2026-12-31', reminderDays: 30, associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['customs', 'border', 'cbp'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: 'CBP-approved for border zone UAS operations.', verified: true, verifiedBy: 'CBP Liaison', verifiedAt: '2026-01-21' },
  { id: 'DOC-027', tenantId: 'T-001', name: 'Export License - Thermal Equipment', fileName: 'export_thermal_license.pdf', fileSize: 430000, mimeType: 'application/pdf', category: 'export_license', status: 'valid', uploadedBy: 'Admin', uploadedAt: '2025-08-01', expiryDate: '2027-08-01', reminderDays: 90, associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['export', 'itar', 'thermal'], version: 1, previousVersions: [], shared: true, sharedWith: ['compliance'], notes: 'ITAR export license for thermal imaging equipment.', verified: true, verifiedBy: 'Compliance Officer', verifiedAt: '2025-08-02' },
  { id: 'DOC-028', tenantId: 'T-001', name: 'Drone Pilot Handbook v3', fileName: 'handbook_pilot_v3.pdf', fileSize: 4500000, mimeType: 'application/pdf', category: 'other', status: 'valid', uploadedBy: 'Juan Martinez', uploadedAt: '2026-02-01', associatedEntity: { type: 'organization', id: 'ORG-001', name: 'SkyWarden Operations' }, tags: ['handbook', 'reference', 'pilots'], version: 3, previousVersions: [{ version: 1, uploadedAt: '2024-02-01', uploadedBy: 'Admin' }, { version: 2, uploadedAt: '2025-02-01', uploadedBy: 'Juan Martinez' }], shared: true, sharedWith: ['all-pilots'], notes: 'Comprehensive pilot operations handbook.', verified: true, verifiedBy: 'Juan Martinez', verifiedAt: '2026-02-02' },
  { id: 'DOC-029', tenantId: 'T-001', name: 'EVO II Pro Registration', fileName: 'faa_reg_evo2.pdf', fileSize: 171000, mimeType: 'application/pdf', category: 'drone_registration', status: 'valid', uploadedBy: 'Robert Chen', uploadedAt: '2025-06-15', expiryDate: '2028-06-15', reminderDays: 60, associatedEntity: { type: 'drone', id: 'DRN-003', name: 'EVO II Pro #1' }, tags: ['faa-registration'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: '', verified: true, verifiedBy: 'Admin', verifiedAt: '2025-06-16' },
  { id: 'DOC-030', tenantId: 'T-001', name: 'M30T Enterprise Registration', fileName: 'faa_reg_m30t.pdf', fileSize: 173000, mimeType: 'application/pdf', category: 'drone_registration', status: 'valid', uploadedBy: 'Sarah Kim', uploadedAt: '2025-03-22', expiryDate: '2028-03-22', reminderDays: 60, associatedEntity: { type: 'drone', id: 'DRN-008', name: 'M30T Enterprise' }, tags: ['faa-registration'], version: 1, previousVersions: [], shared: true, sharedWith: ['ops-team'], notes: '', verified: true, verifiedBy: 'Admin', verifiedAt: '2025-03-23' },
];

const mockFolders: DocumentFolder[] = [
  { id: 'FLD-01', name: 'Pilot Certificates', icon: 'Award', category: 'pilot_cert', count: 4, expiringSoon: 1, expired: 1, description: 'Part 107 and other pilot certifications' },
  { id: 'FLD-02', name: 'Drone Registrations', icon: 'Plane', category: 'drone_registration', count: 6, expiringSoon: 1, expired: 1, description: 'FAA UAS registration documents' },
  { id: 'FLD-03', name: 'Insurance / COIs', icon: 'Shield', category: 'insurance_coi', count: 2, expiringSoon: 1, expired: 0, description: 'Certificates of insurance and liability policies' },
  { id: 'FLD-04', name: 'Airspace Waivers', icon: 'FileText', category: 'airspace_waiver', count: 2, expiringSoon: 0, expired: 0, description: 'Part 107 waivers and authorizations' },
  { id: 'FLD-05', name: 'COAs', icon: 'FileCheck', category: 'coa', count: 1, expiringSoon: 0, expired: 0, description: 'Certificates of Authorization' },
  { id: 'FLD-06', name: 'Maintenance Records', icon: 'Wrench', category: 'maintenance_record', count: 3, expiringSoon: 0, expired: 0, description: 'Service reports, inspections, repair logs' },
  { id: 'FLD-07', name: 'Flight Logs', icon: 'FileText', category: 'flight_log', count: 2, expiringSoon: 0, expired: 0, description: 'Pilot flight logs and hour records' },
  { id: 'FLD-08', name: 'Safety Reports', icon: 'AlertTriangle', category: 'safety_report', count: 1, expiringSoon: 0, expired: 0, description: 'Incident and safety reports' },
  { id: 'FLD-09', name: 'SOPs', icon: 'FileText', category: 'sop', count: 2, expiringSoon: 0, expired: 0, description: 'Standard operating procedures' },
  { id: 'FLD-10', name: 'Training Certs', icon: 'Award', category: 'training_cert', count: 2, expiringSoon: 0, expired: 0, description: 'Training and specialist certifications' },
  { id: 'FLD-11', name: 'Medical Certs', icon: 'Heart', category: 'medical_cert', count: 2, expiringSoon: 1, expired: 0, description: 'Pilot medical certificates' },
  { id: 'FLD-12', name: 'Customs / Export', icon: 'ExternalLink', category: 'customs_permit', count: 2, expiringSoon: 0, expired: 0, description: 'Customs permits and export licenses' },
];

const mockStats: DocumentStats = {
  totalDocuments: 30,
  validDocuments: 22,
  expiringSoon: 4,
  expired: 2,
  pendingReview: 2,
  totalStorage: 16280000,
  categoryCounts: { pilot_cert: 4, drone_registration: 6, insurance_coi: 2, airspace_waiver: 2, coa: 1, maintenance_record: 3, flight_log: 2, safety_report: 1, sop: 2, training_cert: 2, medical_cert: 2, customs_permit: 1, export_license: 1, other: 1 },
  recentUploads: 5,
};

const mockExpiryAlerts: ExpiryAlert[] = [
  { documentId: 'DOC-003', documentName: 'Part 107 Certificate - R. Chen', category: 'pilot_cert', entityName: 'Robert Chen', expiryDate: '2024-03-10', daysRemaining: -742, status: 'expired' },
  { documentId: 'DOC-008', documentName: 'Phantom 4 RTK Registration', category: 'drone_registration', entityName: 'Phantom 4 RTK', expiryDate: '2026-02-15', daysRemaining: -33, status: 'expired' },
  { documentId: 'DOC-025', documentName: 'Medical Certificate - Kim', category: 'medical_cert', entityName: 'Sarah Kim', expiryDate: '2026-04-10', daysRemaining: 21, status: 'expiring_soon' },
  { documentId: 'DOC-002', documentName: 'Part 107 Certificate - S. Kim', category: 'pilot_cert', entityName: 'Sarah Kim', expiryDate: '2026-05-20', daysRemaining: 61, status: 'expiring_soon' },
  { documentId: 'DOC-010', documentName: 'Matrice 350 Hull Insurance', category: 'insurance_coi', entityName: 'Matrice 350 RTK', expiryDate: '2026-06-15', daysRemaining: 87, status: 'expiring_soon' },
];

interface PilotCompliance {
  id: string;
  name: string;
  part107: { status: 'valid' | 'expired' | 'expiring_soon'; expiryDate: string };
  medical: { status: 'valid' | 'expired' | 'expiring_soon' | 'none'; expiryDate?: string };
  training: { status: 'valid' | 'expired' | 'none'; expiryDate?: string };
}

interface DroneCompliance {
  id: string;
  name: string;
  registration: { status: 'valid' | 'expired' | 'expiring_soon'; expiryDate: string };
  insurance: { status: 'valid' | 'expired' | 'expiring_soon' | 'none'; expiryDate?: string };
  lastMaintenance: string;
}

const mockPilotCompliance: PilotCompliance[] = [
  { id: 'PLT-001', name: 'Juan Martinez', part107: { status: 'valid', expiryDate: '2027-08-15' }, medical: { status: 'valid', expiryDate: '2027-06-01' }, training: { status: 'valid', expiryDate: '2027-10-01' } },
  { id: 'PLT-002', name: 'Sarah Kim', part107: { status: 'expiring_soon', expiryDate: '2026-05-20' }, medical: { status: 'expiring_soon', expiryDate: '2026-04-10' }, training: { status: 'none' } },
  { id: 'PLT-003', name: 'Robert Chen', part107: { status: 'expired', expiryDate: '2024-03-10' }, medical: { status: 'none' }, training: { status: 'none' } },
  { id: 'PLT-004', name: 'Aisha Patel', part107: { status: 'valid', expiryDate: '2027-11-02' }, medical: { status: 'none' }, training: { status: 'valid', expiryDate: '2027-12-15' } },
];

const mockDroneCompliance: DroneCompliance[] = [
  { id: 'DRN-001', name: 'Mavic 3 Enterprise #1', registration: { status: 'valid', expiryDate: '2028-04-10' }, insurance: { status: 'valid', expiryDate: '2027-01-05' }, lastMaintenance: '2026-02-15' },
  { id: 'DRN-002', name: 'Matrice 350 RTK', registration: { status: 'valid', expiryDate: '2027-11-20' }, insurance: { status: 'expiring_soon', expiryDate: '2026-06-15' }, lastMaintenance: '2026-03-01' },
  { id: 'DRN-003', name: 'EVO II Pro #1', registration: { status: 'valid', expiryDate: '2028-06-15' }, insurance: { status: 'valid', expiryDate: '2027-01-05' }, lastMaintenance: '2026-01-20' },
  { id: 'DRN-004', name: 'Skydio X10', registration: { status: 'expiring_soon', expiryDate: '2026-09-01' }, insurance: { status: 'valid', expiryDate: '2027-01-05' }, lastMaintenance: '2026-02-28' },
  { id: 'DRN-005', name: 'Mavic 3T Thermal', registration: { status: 'valid', expiryDate: '2028-03-22' }, insurance: { status: 'valid', expiryDate: '2027-01-05' }, lastMaintenance: '2026-03-18' },
  { id: 'DRN-006', name: 'Phantom 4 RTK', registration: { status: 'expired', expiryDate: '2026-02-15' }, insurance: { status: 'none' }, lastMaintenance: '2025-11-10' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};

const categoryLabels: Record<string, string> = {
  pilot_cert: 'Pilot Cert',
  drone_registration: 'Drone Reg',
  insurance_coi: 'Insurance/COI',
  airspace_waiver: 'Airspace Waiver',
  coa: 'COA',
  maintenance_record: 'Maintenance',
  flight_log: 'Flight Log',
  safety_report: 'Safety Report',
  sop: 'SOP',
  training_cert: 'Training Cert',
  medical_cert: 'Medical Cert',
  customs_permit: 'Customs Permit',
  export_license: 'Export License',
  other: 'Other',
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  valid: { label: 'Valid', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  expiring_soon: { label: 'Expiring Soon', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  expired: { label: 'Expired', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  pending_review: { label: 'Pending Review', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  archived: { label: 'Archived', color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30' },
};

const folderIcons: Record<string, React.ReactNode> = {
  Award: <Award className="h-6 w-6" />,
  Plane: <Plane className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
  FileCheck: <FileCheck className="h-6 w-6" />,
  Wrench: <RefreshCw className="h-6 w-6" />,
  AlertTriangle: <AlertTriangle className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  ExternalLink: <ExternalLink className="h-6 w-6" />,
};

// ─── Component ───────────────────────────────────────────────────────────────────

export function DocumentVaultPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'uploadedAt' | 'expiryDate' | 'category'>('uploadedAt');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompliance, setShowCompliance] = useState(true);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'other' as Document['category'],
    subcategory: '',
    entityType: 'pilot' as 'pilot' | 'drone' | 'mission' | 'organization',
    entityId: '',
    expiryDate: '',
    reminderDays: '30',
    tags: '',
    notes: '',
    shared: false,
  });

  // Filtered & sorted documents
  const filteredDocs = mockDocuments
    .filter(doc => {
      if (selectedCategory && doc.category !== selectedCategory) return false;
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (entityTypeFilter !== 'all' && doc.associatedEntity?.type !== entityTypeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          doc.name.toLowerCase().includes(q) ||
          doc.fileName.toLowerCase().includes(q) ||
          doc.tags.some(t => t.toLowerCase().includes(q)) ||
          doc.notes.toLowerCase().includes(q) ||
          (doc.associatedEntity?.name.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'uploadedAt': return b.uploadedAt.localeCompare(a.uploadedAt);
        case 'expiryDate': return (a.expiryDate ?? '9999').localeCompare(b.expiryDate ?? '9999');
        case 'category': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });

  const expiredCount = mockExpiryAlerts.filter(a => a.status === 'expired').length;
  const expiringCount = mockExpiryAlerts.filter(a => a.status === 'expiring_soon').length;

  // Compliance calculation
  const totalComplianceItems = mockPilotCompliance.length * 3 + mockDroneCompliance.length * 3;
  let compliantItems = 0;
  mockPilotCompliance.forEach(p => {
    if (p.part107.status === 'valid') compliantItems++;
    if (p.medical.status === 'valid') compliantItems++;
    if (p.training.status === 'valid') compliantItems++;
  });
  mockDroneCompliance.forEach(d => {
    if (d.registration.status === 'valid') compliantItems++;
    if (d.insurance.status === 'valid' || d.insurance.status === 'expiring_soon') compliantItems++;
    const daysSinceMaint = Math.floor((Date.now() - new Date(d.lastMaintenance).getTime()) / 86400000);
    if (daysSinceMaint < 180) compliantItems++;
  });
  const compliancePercent = Math.round((compliantItems / totalComplianceItems) * 100);

  const complianceStatusBadge = (status: string) => {
    const cfg = statusConfig[status] ?? statusConfig.valid;
    return (
      <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', cfg.bg, cfg.color)}>
        {status === 'valid' && <CheckCircle className="h-3 w-3" />}
        {status === 'expiring_soon' && <Clock className="h-3 w-3" />}
        {status === 'expired' && <XCircle className="h-3 w-3" />}
        {status === 'none' && <AlertCircle className="h-3 w-3 text-gray-500" />}
        {status === 'none' ? 'Missing' : cfg.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FolderOpen className="h-7 w-7 text-cyan-400" />
            Document Vault
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {mockStats.totalDocuments} documents &middot; {formatFileSize(mockStats.totalStorage)} used
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total Documents', value: mockStats.totalDocuments, icon: <FileText className="h-5 w-5 text-gray-400" />, color: 'text-white' },
          { label: 'Valid', value: mockStats.validDocuments, icon: <CheckCircle className="h-5 w-5 text-green-400" />, color: 'text-green-400' },
          { label: 'Expiring Soon', value: mockStats.expiringSoon, icon: <Clock className="h-5 w-5 text-yellow-400" />, color: 'text-yellow-400' },
          { label: 'Expired', value: mockStats.expired, icon: <XCircle className="h-5 w-5 text-red-400" />, color: 'text-red-400' },
          { label: 'Pending Review', value: mockStats.pendingReview, icon: <Eye className="h-5 w-5 text-blue-400" />, color: 'text-blue-400' },
          { label: 'Storage Used', value: formatFileSize(mockStats.totalStorage), icon: <HardDrive className="h-5 w-5 text-purple-400" />, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              {stat.icon}
              {stat.label}
            </div>
            <div className={clsx('text-xl font-bold', stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Expiry Alerts ──────────────────────────────────────────── */}
      {mockExpiryAlerts.length > 0 && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">
                {expiredCount} expired, {expiringCount} expiring soon
              </span>
            </div>
            {showAlerts ? <ChevronUp className="h-4 w-4 text-yellow-400" /> : <ChevronDown className="h-4 w-4 text-yellow-400" />}
          </button>
          {showAlerts && (
            <div className="border-t border-yellow-500/20 p-4 space-y-2">
              {mockExpiryAlerts.map(alert => (
                <div
                  key={alert.documentId}
                  className="flex flex-col gap-2 rounded-lg border border-gray-800 bg-gray-900/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileX className={clsx('h-4 w-4 shrink-0', alert.status === 'expired' ? 'text-red-400' : 'text-yellow-400')} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{alert.documentName}</p>
                      <p className="text-xs text-gray-500">
                        {categoryLabels[alert.category]} &middot; {alert.entityName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <p className="text-gray-400">{alert.expiryDate}</p>
                      <p className={clsx(alert.status === 'expired' ? 'text-red-400' : 'text-yellow-400')}>
                        {alert.daysRemaining < 0 ? `${Math.abs(alert.daysRemaining)}d overdue` : `${alert.daysRemaining}d remaining`}
                      </p>
                    </div>
                    <span className={clsx('rounded-full border px-2 py-0.5 text-xs font-medium', statusConfig[alert.status].bg, statusConfig[alert.status].color)}>
                      {statusConfig[alert.status].label}
                    </span>
                    <button className="rounded border border-cyan-600 px-3 py-1 text-xs font-medium text-cyan-400 hover:bg-cyan-600/20 transition-colors">
                      Renew
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Folder Grid ────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Categories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {mockFolders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setSelectedCategory(selectedCategory === folder.category ? null : folder.category)}
              className={clsx(
                'group relative flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all',
                selectedCategory === folder.category
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-gray-800 bg-gray-900/60 hover:border-gray-700 hover:bg-gray-900'
              )}
            >
              <div className={clsx('text-gray-400 transition-colors', selectedCategory === folder.category && 'text-cyan-400')}>
                {folderIcons[folder.icon] ?? <Folder className="h-6 w-6" />}
              </div>
              <span className="text-xs font-medium text-gray-300 leading-tight">{folder.name}</span>
              <span className="text-lg font-bold text-white">{folder.count}</span>
              <div className="flex items-center gap-1.5">
                {folder.expiringSoon > 0 && (
                  <span className="rounded-full bg-yellow-400/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">{folder.expiringSoon} exp</span>
                )}
                {folder.expired > 0 && (
                  <span className="rounded-full bg-red-400/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">{folder.expired} ovd</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter & View Bar ──────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-900 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="pending_review">Pending Review</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={entityTypeFilter}
            onChange={e => setEntityTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Entities</option>
            <option value="pilot">Pilots</option>
            <option value="drone">Drones</option>
            <option value="mission">Missions</option>
            <option value="organization">Organization</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="uploadedAt">Date Uploaded</option>
            <option value="name">Name</option>
            <option value="expiryDate">Expiry Date</option>
            <option value="category">Category</option>
          </select>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 rounded-lg border border-cyan-600 bg-cyan-600/10 px-3 py-2 text-xs font-medium text-cyan-400 hover:bg-cyan-600/20"
            >
              <XCircle className="h-3 w-3" />
              {categoryLabels[selectedCategory]}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{filteredDocs.length} documents</span>
          <div className="flex rounded-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={clsx('p-2 transition-colors', viewMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white')}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx('p-2 transition-colors', viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white')}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Document List View ─────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80 text-xs uppercase text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Ver</th>
                <th className="px-4 py-3 text-center">Verified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredDocs.map(doc => {
                const st = statusConfig[doc.status];
                const isExpanded = expandedDocId === doc.id;
                return (
                  <Fragment key={doc.id}>
                    <tr
                      className="cursor-pointer bg-gray-900/40 hover:bg-gray-900/80 transition-colors"
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {doc.mimeType.includes('pdf') ? <FileText className="h-4 w-4 shrink-0 text-red-400" /> : doc.mimeType.includes('csv') ? <File className="h-4 w-4 shrink-0 text-green-400" /> : <File className="h-4 w-4 shrink-0 text-gray-400" />}
                          <span className="truncate font-medium text-white max-w-[200px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">{categoryLabels[doc.category]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', st.bg, st.color)}>
                          {doc.status === 'valid' && <CheckCircle className="h-3 w-3" />}
                          {doc.status === 'expiring_soon' && <Clock className="h-3 w-3" />}
                          {doc.status === 'expired' && <XCircle className="h-3 w-3" />}
                          {doc.status === 'pending_review' && <Eye className="h-3 w-3" />}
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {doc.associatedEntity ? (
                          <span className="flex items-center gap-1">
                            {doc.associatedEntity.type === 'pilot' && <User className="h-3 w-3" />}
                            {doc.associatedEntity.type === 'drone' && <Plane className="h-3 w-3" />}
                            {doc.associatedEntity.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {doc.expiryDate ? (
                          <span className={clsx(doc.status === 'expired' ? 'text-red-400' : doc.status === 'expiring_soon' ? 'text-yellow-400' : 'text-gray-400')}>
                            {doc.expiryDate}
                          </span>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{doc.uploadedBy}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{doc.uploadedAt}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs text-center">v{doc.version}</td>
                      <td className="px-4 py-3 text-center">
                        {doc.verified ? <ShieldCheck className="inline h-4 w-4 text-green-400" /> : <Shield className="inline h-4 w-4 text-gray-600" />}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-cyan-400" title="Download"><Download className="h-4 w-4" /></button>
                          <button className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-cyan-400" title="Share"><Share2 className="h-4 w-4" /></button>
                          <button className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-yellow-400" title="Archive"><Archive className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-900/70">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Meta */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase text-gray-500">Details</h4>
                              <div className="space-y-1 text-xs">
                                <p className="text-gray-400"><span className="text-gray-600">File:</span> {doc.fileName}</p>
                                <p className="text-gray-400"><span className="text-gray-600">Type:</span> {doc.mimeType}</p>
                                <p className="text-gray-400"><span className="text-gray-600">Size:</span> {formatFileSize(doc.fileSize)}</p>
                                {doc.subcategory && <p className="text-gray-400"><span className="text-gray-600">Subcategory:</span> {doc.subcategory}</p>}
                                {doc.reminderDays && <p className="text-gray-400"><span className="text-gray-600">Reminder:</span> {doc.reminderDays} days before expiry</p>}
                              </div>
                              {doc.notes && (
                                <div>
                                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Notes</h4>
                                  <p className="text-xs text-gray-400">{doc.notes}</p>
                                </div>
                              )}
                              {doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {doc.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400">
                                      <Tag className="h-2.5 w-2.5" />{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Version History & Sharing */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase text-gray-500">Version History</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="rounded bg-cyan-600/20 px-1.5 py-0.5 text-cyan-400 font-medium">v{doc.version}</span>
                                  <span className="text-gray-400">{doc.uploadedAt}</span>
                                  <span className="text-gray-500">by {doc.uploadedBy}</span>
                                  <span className="text-cyan-400 text-[10px]">current</span>
                                </div>
                                {doc.previousVersions.map(pv => (
                                  <div key={pv.version} className="flex items-center gap-2 text-xs">
                                    <span className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-500 font-medium">v{pv.version}</span>
                                    <span className="text-gray-500">{pv.uploadedAt}</span>
                                    <span className="text-gray-600">by {pv.uploadedBy}</span>
                                  </div>
                                ))}
                              </div>
                              <h4 className="text-xs font-semibold uppercase text-gray-500 pt-2">Sharing</h4>
                              <div className="flex items-center gap-2 text-xs">
                                {doc.shared ? <Unlock className="h-3 w-3 text-green-400" /> : <Lock className="h-3 w-3 text-gray-500" />}
                                <span className="text-gray-400">{doc.shared ? 'Shared' : 'Private'}</span>
                              </div>
                              {doc.sharedWith.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {doc.sharedWith.map(sw => (
                                    <span key={sw} className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400">{sw}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Verification & Actions */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold uppercase text-gray-500">Verification</h4>
                              {doc.verified ? (
                                <div className="flex items-center gap-2 text-xs text-green-400">
                                  <ShieldCheck className="h-4 w-4" />
                                  Verified by {doc.verifiedBy} on {doc.verifiedAt}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-yellow-400">
                                  <Shield className="h-4 w-4" />
                                  Not verified
                                </div>
                              )}
                              {doc.associatedEntity && (
                                <div>
                                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Associated Entity</h4>
                                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                                    {doc.associatedEntity.type === 'pilot' && <User className="h-3 w-3" />}
                                    {doc.associatedEntity.type === 'drone' && <Plane className="h-3 w-3" />}
                                    {doc.associatedEntity.type === 'mission' && <ExternalLink className="h-3 w-3" />}
                                    {doc.associatedEntity.type === 'organization' && <Shield className="h-3 w-3" />}
                                    {doc.associatedEntity.name}
                                    <span className="text-gray-600">({doc.associatedEntity.type})</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 pt-2">
                                <button className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500">
                                  <Download className="h-3 w-3" /> Download
                                </button>
                                <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800">
                                  <Share2 className="h-3 w-3" /> Share
                                </button>
                                <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800">
                                  <Archive className="h-3 w-3" /> Archive
                                </button>
                                <button className="inline-flex items-center gap-1.5 rounded-lg border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/30">
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Document Grid View ─────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredDocs.map(doc => {
            const st = statusConfig[doc.status];
            return (
              <div
                key={doc.id}
                onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                className={clsx(
                  'cursor-pointer rounded-lg border p-4 transition-all hover:border-gray-700',
                  expandedDocId === doc.id ? 'border-cyan-500 bg-gray-900' : 'border-gray-800 bg-gray-900/60'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="rounded-lg bg-gray-800 p-3">
                    {doc.mimeType.includes('pdf') ? <FileText className="h-8 w-8 text-red-400" /> : doc.mimeType.includes('csv') ? <File className="h-8 w-8 text-green-400" /> : <File className="h-8 w-8 text-gray-400" />}
                  </div>
                  {doc.verified && <ShieldCheck className="h-4 w-4 text-green-400" />}
                </div>
                <h3 className="text-sm font-medium text-white truncate mb-1">{doc.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400">{categoryLabels[doc.category]}</span>
                  <span className={clsx('rounded-full border px-2 py-0.5 text-[10px] font-medium', st.bg, st.color)}>{st.label}</span>
                </div>
                {doc.expiryDate && (
                  <p className={clsx('text-[10px]', doc.status === 'expired' ? 'text-red-400' : doc.status === 'expiring_soon' ? 'text-yellow-400' : 'text-gray-500')}>
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Expires {doc.expiryDate}
                  </p>
                )}
                <p className="text-[10px] text-gray-600 mt-1">{formatFileSize(doc.fileSize)} &middot; v{doc.version}</p>

                {expandedDocId === doc.id && (
                  <div className="mt-3 border-t border-gray-800 pt-3 space-y-2">
                    <p className="text-xs text-gray-400">{doc.notes}</p>
                    {doc.associatedEntity && (
                      <p className="text-xs text-cyan-400 flex items-center gap-1">
                        {doc.associatedEntity.type === 'pilot' ? <User className="h-3 w-3" /> : <Plane className="h-3 w-3" />}
                        {doc.associatedEntity.name}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-gray-800 px-1.5 py-0.5 text-[9px] text-gray-500">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      <button className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-cyan-400"><Download className="h-3.5 w-3.5" /></button>
                      <button className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-cyan-400"><Share2 className="h-3.5 w-3.5" /></button>
                      <button className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-yellow-400"><Archive className="h-3.5 w-3.5" /></button>
                      <button className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Upload Document Modal ──────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <FilePlus className="h-5 w-5 text-cyan-400" />
                Upload Document
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
              {/* Drag & Drop Zone */}
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/50 p-8 text-center hover:border-cyan-600 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 text-gray-600 mb-2" />
                <p className="text-sm text-gray-400">Drag & drop file here or click to browse</p>
                <p className="text-xs text-gray-600 mt-1">PDF, Images, CSV up to 25MB</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">File Name</label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="Document name"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={e => setUploadForm({ ...uploadForm, category: e.target.value as Document['category'] })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {Object.entries(categoryLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Subcategory (optional)</label>
                  <input
                    type="text"
                    value={uploadForm.subcategory}
                    onChange={e => setUploadForm({ ...uploadForm, subcategory: e.target.value })}
                    placeholder="e.g. Annual renewal"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Entity Type</label>
                    <select
                      value={uploadForm.entityType}
                      onChange={e => setUploadForm({ ...uploadForm, entityType: e.target.value as typeof uploadForm.entityType })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="pilot">Pilot</option>
                      <option value="drone">Drone</option>
                      <option value="mission">Mission</option>
                      <option value="organization">Organization</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Entity</label>
                    <input
                      type="text"
                      value={uploadForm.entityId}
                      onChange={e => setUploadForm({ ...uploadForm, entityId: e.target.value })}
                      placeholder="Select entity..."
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Expiry Date (optional)</label>
                    <input
                      type="date"
                      value={uploadForm.expiryDate}
                      onChange={e => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Reminder (days before)</label>
                    <input
                      type="number"
                      value={uploadForm.reminderDays}
                      onChange={e => setUploadForm({ ...uploadForm, reminderDays: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={e => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    placeholder="e.g. faa, annual, part107"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
                  <textarea
                    value={uploadForm.notes}
                    onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 px-3 py-2">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Share2 className="h-4 w-4" /> Share with team
                  </span>
                  <button
                    onClick={() => setUploadForm({ ...uploadForm, shared: !uploadForm.shared })}
                    className={clsx(
                      'relative h-6 w-11 rounded-full transition-colors',
                      uploadForm.shared ? 'bg-cyan-600' : 'bg-gray-700'
                    )}
                  >
                    <span className={clsx(
                      'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                      uploadForm.shared && 'translate-x-5'
                    )} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-800 p-5">
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500">
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Compliance Summary ─────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setShowCompliance(!showCompliance)}
          className="flex items-center gap-2 mb-3"
        >
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Compliance Summary</h2>
          {showCompliance ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </button>

        {showCompliance && (
          <div className="space-y-4">
            {/* Overall Compliance */}
            <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Overall Compliance</span>
                <span className={clsx('text-lg font-bold', compliancePercent >= 80 ? 'text-green-400' : compliancePercent >= 60 ? 'text-yellow-400' : 'text-red-400')}>
                  {compliancePercent}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all', compliancePercent >= 80 ? 'bg-green-500' : compliancePercent >= 60 ? 'bg-yellow-500' : 'bg-red-500')}
                  style={{ width: `${compliancePercent}%` }}
                />
              </div>
            </div>

            {/* Pilot Compliance */}
            <div>
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Pilot Compliance
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {mockPilotCompliance.map(pilot => (
                  <div key={pilot.id} className="rounded-lg border border-gray-800 bg-gray-900/60 p-3 space-y-2">
                    <p className="text-sm font-medium text-white">{pilot.name}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Part 107</span>
                        {complianceStatusBadge(pilot.part107.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Medical</span>
                        {complianceStatusBadge(pilot.medical.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Training</span>
                        {complianceStatusBadge(pilot.training.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drone Compliance */}
            <div>
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center gap-2">
                <Plane className="h-3.5 w-3.5" /> Drone Compliance
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {mockDroneCompliance.map(drone => {
                  const daysSinceMaint = Math.floor((Date.now() - new Date(drone.lastMaintenance).getTime()) / 86400000);
                  const maintStatus = daysSinceMaint < 90 ? 'valid' : daysSinceMaint < 180 ? 'expiring_soon' : 'expired';
                  return (
                    <div key={drone.id} className="rounded-lg border border-gray-800 bg-gray-900/60 p-3 space-y-2">
                      <p className="text-sm font-medium text-white">{drone.name}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Registration</span>
                          {complianceStatusBadge(drone.registration.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Insurance</span>
                          {complianceStatusBadge(drone.insurance.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Last Maintenance</span>
                          <span className={clsx('text-xs', maintStatus === 'valid' ? 'text-green-400' : maintStatus === 'expiring_soon' ? 'text-yellow-400' : 'text-red-400')}>
                            {drone.lastMaintenance} ({daysSinceMaint}d ago)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
