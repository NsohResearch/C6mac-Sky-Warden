import { useState } from 'react';
import {
  Users, User, Building, Briefcase, Package, FileText, DollarSign, Star,
  MapPin, Calendar, Clock, MessageSquare, Download, Upload, CheckCircle,
  XCircle, ChevronDown, ChevronUp, Plus, Filter, Search, Mail, Phone,
  Camera, Video, Map, BarChart2, Send, Eye, ExternalLink, ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { ClientProject, ClientPortalStats } from '../../../shared/types/clientportal';

// ─── Status & Type Configs ──────────────────────────────────────────────────────

type ProjectStatus = ClientProject['status'];
type ProjectType = ClientProject['type'];
type DeliverableStatus = 'pending' | 'processing' | 'ready' | 'delivered';
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

const statusConfig: Record<ProjectStatus, { label: string; bg: string; text: string; pulse?: boolean }> = {
  requested: { label: 'Requested', bg: 'bg-gray-100', text: 'text-gray-700' },
  quoted: { label: 'Quoted', bg: 'bg-blue-50', text: 'text-blue-700' },
  approved: { label: 'Approved', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  scheduled: { label: 'Scheduled', bg: 'bg-purple-50', text: 'text-purple-700' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', pulse: true },
  completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700' },
  invoiced: { label: 'Invoiced', bg: 'bg-orange-50', text: 'text-orange-700' },
  paid: { label: 'Paid', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

const typeConfig: Record<ProjectType, { label: string; bg: string; text: string }> = {
  aerial_survey: { label: 'Aerial Survey', bg: 'bg-sky-50', text: 'text-sky-700' },
  inspection: { label: 'Inspection', bg: 'bg-amber-50', text: 'text-amber-700' },
  mapping: { label: 'Mapping', bg: 'bg-green-50', text: 'text-green-700' },
  photography: { label: 'Photography', bg: 'bg-pink-50', text: 'text-pink-700' },
  videography: { label: 'Videography', bg: 'bg-purple-50', text: 'text-purple-700' },
  agriculture: { label: 'Agriculture', bg: 'bg-lime-50', text: 'text-lime-700' },
  construction: { label: 'Construction', bg: 'bg-orange-50', text: 'text-orange-700' },
  real_estate: { label: 'Real Estate', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  event: { label: 'Event', bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  custom: { label: 'Custom', bg: 'bg-gray-100', text: 'text-gray-700' },
};

const deliverableStatusConfig: Record<DeliverableStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
  processing: { label: 'Processing', bg: 'bg-amber-50', text: 'text-amber-700' },
  ready: { label: 'Ready', bg: 'bg-green-50', text: 'text-green-700' },
  delivered: { label: 'Delivered', bg: 'bg-blue-50', text: 'text-blue-700' },
};

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600' },
  sent: { label: 'Sent', bg: 'bg-blue-50', text: 'text-blue-700' },
  paid: { label: 'Paid', bg: 'bg-green-50', text: 'text-green-700' },
  overdue: { label: 'Overdue', bg: 'bg-red-50', text: 'text-red-700' },
};

const pipelineColumns: ProjectStatus[] = ['requested', 'quoted', 'approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid'];

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockStats: ClientPortalStats = {
  totalClients: 5,
  activeProjects: 3,
  completedProjects: 12,
  pendingQuotes: 2,
  outstandingInvoices: 1,
  totalRevenue: 87450,
  avgRating: 4.7,
};

const mockProjects: ClientProject[] = [
  {
    id: 'PRJ-001', tenantId: 'T-001', clientId: 'CLT-001', clientName: 'Robert Dawson', clientEmail: 'rdawson@solariseng.com', clientCompany: 'Solaris Engineering',
    projectName: 'Solar Farm Thermal Inspection', status: 'in_progress', type: 'inspection',
    description: 'Comprehensive thermal and visual inspection of 480-acre solar farm to identify hotspots, damaged panels, and vegetation encroachment. Deliverables include thermal map overlay, defect report, and priority maintenance recommendations.',
    location: { address: '14500 Solar Valley Rd, Mojave, CA 93501', lat: 35.0110, lng: -117.6509 },
    scheduledDate: '2026-03-22', deliverables: [
      { id: 'DLV-001', name: 'Thermal Map Overlay', type: 'thermal_map', status: 'processing', fileSize: 2400000000 },
      { id: 'DLV-002', name: 'High-Res Panel Photos', type: 'photos', status: 'ready', fileSize: 8500000000, downloadUrl: '/downloads/prj001-photos.zip' },
      { id: 'DLV-003', name: 'Defect Analysis Report', type: 'report', status: 'pending' },
      { id: 'DLV-004', name: 'Orthomosaic Composite', type: 'orthomosaic', status: 'processing', fileSize: 5200000000 },
    ],
    quote: { amount: 12500, validUntil: '2026-03-30', accepted: true, acceptedDate: '2026-03-10' },
    missions: [
      { missionId: 'MSN-101', date: '2026-03-22', status: 'completed', pilotName: 'Capt. Sarah Park' },
      { missionId: 'MSN-102', date: '2026-03-23', status: 'scheduled', pilotName: 'Capt. Sarah Park' },
    ],
    communications: [
      { id: 'COM-001', from: 'Robert Dawson', message: 'Looking forward to the inspection. Please coordinate with our site manager Jim (ext 204) on arrival.', timestamp: '2026-03-18T09:30:00', read: true },
      { id: 'COM-002', from: 'Sky Warden Ops', message: 'Day 1 complete! Captured 2,400 thermal images across sectors A-D. Processing overnight. Some hotspots identified already.', timestamp: '2026-03-22T17:45:00', read: true },
      { id: 'COM-003', from: 'Robert Dawson', message: 'Great progress! Can you prioritize the hotspot analysis for sector C? We had issues there last quarter.', timestamp: '2026-03-22T19:10:00', read: false },
    ],
    createdAt: '2026-03-05', updatedAt: '2026-03-22',
  },
  {
    id: 'PRJ-002', tenantId: 'T-001', clientId: 'CLT-002', clientName: 'Amanda Chen', clientEmail: 'achen@greenvalley.org', clientCompany: 'Green Valley Agriculture',
    projectName: 'Spring Crop Health Survey', status: 'scheduled', type: 'agriculture',
    description: 'Multispectral NDVI survey of 1,200 acres across 3 field sections. Identify areas of crop stress, irrigation issues, and pest damage for precision agriculture recommendations.',
    location: { address: '8900 Farm Rd 42, Ames, IA 50010', lat: 41.878, lng: -93.0977 },
    scheduledDate: '2026-04-05', deliverables: [
      { id: 'DLV-005', name: 'NDVI Map Composite', type: 'orthomosaic', status: 'pending' },
      { id: 'DLV-006', name: 'Crop Health Report', type: 'report', status: 'pending' },
      { id: 'DLV-007', name: 'Raw Multispectral Data', type: 'raw_data', status: 'pending' },
    ],
    quote: { amount: 8200, validUntil: '2026-04-15', accepted: true, acceptedDate: '2026-03-15' },
    missions: [
      { missionId: 'MSN-201', date: '2026-04-05', status: 'planned', pilotName: 'Mike Chen' },
      { missionId: 'MSN-202', date: '2026-04-06', status: 'planned', pilotName: 'Mike Chen' },
    ],
    communications: [
      { id: 'COM-004', from: 'Amanda Chen', message: 'Fields 2 and 3 were just irrigated. Can we do field 1 first to capture pre-irrigation baseline?', timestamp: '2026-03-20T11:00:00', read: true },
      { id: 'COM-005', from: 'Sky Warden Ops', message: 'Absolutely, we will start with Field 1 on day 1. Equipment is prepped with RedEdge-P multispectral.', timestamp: '2026-03-20T14:30:00', read: true },
    ],
    createdAt: '2026-03-08', updatedAt: '2026-03-20',
  },
  {
    id: 'PRJ-003', tenantId: 'T-001', clientId: 'CLT-003', clientName: 'Marcus Williams', clientEmail: 'mwilliams@apexdev.com', clientCompany: 'Apex Development Group',
    projectName: 'Downtown Tower Construction Progress', status: 'completed', type: 'construction',
    description: 'Monthly aerial progress documentation for 22-story mixed-use tower. Orthomosaic, 3D model, and comparison report vs. BIM schedule.',
    location: { address: '350 Main St, Austin, TX 78701', lat: 30.2672, lng: -97.7431 },
    scheduledDate: '2026-03-01', completedDate: '2026-03-02',
    deliverables: [
      { id: 'DLV-008', name: 'Orthomosaic March 2026', type: 'orthomosaic', status: 'delivered', fileSize: 3800000000, downloadUrl: '/downloads/prj003-ortho.tif' },
      { id: 'DLV-009', name: '3D Point Cloud Model', type: '3d_model', status: 'delivered', fileSize: 12000000000, downloadUrl: '/downloads/prj003-3d.las' },
      { id: 'DLV-010', name: 'Progress Report vs BIM', type: 'report', status: 'delivered', fileSize: 45000000, downloadUrl: '/downloads/prj003-report.pdf' },
      { id: 'DLV-011', name: 'Aerial Video Flyover', type: 'video', status: 'delivered', fileSize: 6200000000, downloadUrl: '/downloads/prj003-video.mp4' },
    ],
    quote: { amount: 4800, validUntil: '2026-03-15', accepted: true, acceptedDate: '2026-02-20' },
    invoice: { id: 'INV-003', amount: 4800, status: 'paid', dueDate: '2026-03-15', paidDate: '2026-03-12' },
    missions: [
      { missionId: 'MSN-301', date: '2026-03-01', status: 'completed', pilotName: 'James Wu' },
      { missionId: 'MSN-302', date: '2026-03-02', status: 'completed', pilotName: 'James Wu' },
    ],
    communications: [
      { id: 'COM-006', from: 'Marcus Williams', message: 'The 3D model is incredible. Our investors loved the comparison overlay. Same time next month?', timestamp: '2026-03-14T10:00:00', read: true },
      { id: 'COM-007', from: 'Sky Warden Ops', message: 'Thank you Marcus! April survey is already on the calendar. We will add the crane progression tracking you mentioned.', timestamp: '2026-03-14T11:30:00', read: true },
    ],
    feedback: { rating: 5, comment: 'Outstanding work. The BIM comparison feature is exactly what we needed for stakeholder reporting. Highly recommend.', date: '2026-03-14' },
    createdAt: '2026-02-15', updatedAt: '2026-03-14',
  },
  {
    id: 'PRJ-004', tenantId: 'T-001', clientId: 'CLT-004', clientName: 'Jessica Torres', clientEmail: 'jtorres@luxhomes.com', clientCompany: 'LuxHomes Realty',
    projectName: 'Lakefront Estate Listing Package', status: 'quoted', type: 'real_estate',
    description: 'Premium aerial photography and cinematic video for luxury lakefront estate listing. Includes twilight shots, property boundary mapping, and neighborhood context aerials.',
    location: { address: '2200 Lakeshore Dr, Lake Tahoe, NV 89449', lat: 39.0968, lng: -120.0324 },
    deliverables: [
      { id: 'DLV-012', name: 'Aerial Photo Package (50+ images)', type: 'photos', status: 'pending' },
      { id: 'DLV-013', name: 'Cinematic Property Video', type: 'video', status: 'pending' },
      { id: 'DLV-014', name: 'Property Boundary Map', type: 'orthomosaic', status: 'pending' },
    ],
    quote: { amount: 3200, validUntil: '2026-04-01', accepted: false },
    missions: [],
    communications: [
      { id: 'COM-008', from: 'Jessica Torres', message: 'Need this for a $4.2M listing. Twilight shots are essential for the marketing package. When is the soonest you can shoot?', timestamp: '2026-03-19T16:00:00', read: true },
      { id: 'COM-009', from: 'Sky Warden Ops', message: 'We can schedule as early as next week. Quote sent for your review. Includes twilight session and full editing.', timestamp: '2026-03-19T17:30:00', read: true },
    ],
    createdAt: '2026-03-19', updatedAt: '2026-03-19',
  },
  {
    id: 'PRJ-005', tenantId: 'T-001', clientId: 'CLT-001', clientName: 'Robert Dawson', clientEmail: 'rdawson@solariseng.com', clientCompany: 'Solaris Engineering',
    projectName: 'Wind Turbine Blade Inspection', status: 'requested', type: 'inspection',
    description: 'Close-range visual inspection of 12 wind turbine blades using high-zoom camera. Identify cracks, erosion, lightning damage, and leading-edge deterioration.',
    location: { address: 'Wind Ridge Energy Park, Sweetwater, TX 79556', lat: 32.4735, lng: -100.4059 },
    deliverables: [
      { id: 'DLV-015', name: 'Blade Defect Photos', type: 'photos', status: 'pending' },
      { id: 'DLV-016', name: 'Inspection Report', type: 'report', status: 'pending' },
    ],
    missions: [],
    communications: [
      { id: 'COM-010', from: 'Robert Dawson', message: 'Following up on our call. 12 turbines, all GE 2.5 MW. Need inspection before next maintenance window in May.', timestamp: '2026-03-20T08:00:00', read: false },
    ],
    createdAt: '2026-03-20', updatedAt: '2026-03-20',
  },
  {
    id: 'PRJ-006', tenantId: 'T-001', clientId: 'CLT-005', clientName: 'David Kim', clientEmail: 'dkim@cityofaustin.gov', clientCompany: 'City of Austin',
    projectName: 'Flood Damage Assessment — East Austin', status: 'completed', type: 'mapping',
    description: 'Emergency post-flood aerial mapping and damage assessment of affected neighborhoods. High-resolution orthomosaic and volumetric analysis of debris fields.',
    location: { address: 'East Riverside Dr corridor, Austin, TX 78741', lat: 30.2380, lng: -97.7122 },
    scheduledDate: '2026-02-18', completedDate: '2026-02-19',
    deliverables: [
      { id: 'DLV-017', name: 'Orthomosaic — Flood Extent', type: 'orthomosaic', status: 'delivered', fileSize: 7800000000, downloadUrl: '/downloads/prj006-ortho.tif' },
      { id: 'DLV-018', name: 'Damage Assessment Report', type: 'report', status: 'delivered', fileSize: 28000000, downloadUrl: '/downloads/prj006-report.pdf' },
      { id: 'DLV-019', name: '3D Terrain Model', type: '3d_model', status: 'delivered', fileSize: 15000000000, downloadUrl: '/downloads/prj006-terrain.las' },
    ],
    quote: { amount: 15000, validUntil: '2026-02-20', accepted: true, acceptedDate: '2026-02-17' },
    invoice: { id: 'INV-006', amount: 15000, status: 'overdue', dueDate: '2026-03-05' },
    missions: [
      { missionId: 'MSN-601', date: '2026-02-18', status: 'completed', pilotName: 'Capt. Sarah Park' },
      { missionId: 'MSN-602', date: '2026-02-19', status: 'completed', pilotName: 'James Wu' },
    ],
    communications: [
      { id: 'COM-011', from: 'David Kim', message: 'FEMA is requesting the orthomosaic for their damage estimate. Can you share the download link directly?', timestamp: '2026-02-25T09:00:00', read: true },
      { id: 'COM-012', from: 'Sky Warden Ops', message: 'Download links are live in the deliverables section. Let us know if FEMA needs any specific format conversions.', timestamp: '2026-02-25T10:15:00', read: true },
    ],
    feedback: { rating: 5, comment: 'Rapid response was critical for our emergency assessment. Data quality exceeded expectations.', date: '2026-02-26' },
    createdAt: '2026-02-17', updatedAt: '2026-02-26',
  },
  {
    id: 'PRJ-007', tenantId: 'T-001', clientId: 'CLT-003', clientName: 'Marcus Williams', clientEmail: 'mwilliams@apexdev.com', clientCompany: 'Apex Development Group',
    projectName: 'Suburban Subdivision Site Survey', status: 'invoiced', type: 'aerial_survey',
    description: 'Pre-development aerial survey for 85-acre subdivision. Topographic mapping, tree canopy analysis, and wetland delineation support.',
    location: { address: '19200 FM 1826, Dripping Springs, TX 78620', lat: 30.1901, lng: -98.0867 },
    scheduledDate: '2026-03-08', completedDate: '2026-03-09',
    deliverables: [
      { id: 'DLV-020', name: 'Topographic Survey Map', type: 'orthomosaic', status: 'delivered', fileSize: 4500000000, downloadUrl: '/downloads/prj007-topo.tif' },
      { id: 'DLV-021', name: 'Tree Canopy Analysis', type: 'report', status: 'delivered', fileSize: 15000000, downloadUrl: '/downloads/prj007-canopy.pdf' },
      { id: 'DLV-022', name: '3D Terrain Model', type: '3d_model', status: 'delivered', fileSize: 9800000000, downloadUrl: '/downloads/prj007-terrain.las' },
      { id: 'DLV-023', name: 'Raw Survey Data', type: 'raw_data', status: 'delivered', fileSize: 18000000000, downloadUrl: '/downloads/prj007-raw.zip' },
    ],
    quote: { amount: 9500, validUntil: '2026-03-20', accepted: true, acceptedDate: '2026-03-01' },
    invoice: { id: 'INV-007', amount: 9500, status: 'sent', dueDate: '2026-04-08' },
    missions: [
      { missionId: 'MSN-701', date: '2026-03-08', status: 'completed', pilotName: 'Mike Chen' },
      { missionId: 'MSN-702', date: '2026-03-09', status: 'completed', pilotName: 'Mike Chen' },
    ],
    communications: [
      { id: 'COM-013', from: 'Marcus Williams', message: 'Survey data looks solid. Our civil engineers are reviewing the topo map now. Invoice received.', timestamp: '2026-03-15T14:00:00', read: true },
    ],
    feedback: { rating: 4, comment: 'Good data quality. Turnaround could have been slightly faster but overall satisfied.', date: '2026-03-16' },
    createdAt: '2026-02-25', updatedAt: '2026-03-16',
  },
  {
    id: 'PRJ-008', tenantId: 'T-001', clientId: 'CLT-002', clientName: 'Amanda Chen', clientEmail: 'achen@greenvalley.org', clientCompany: 'Green Valley Agriculture',
    projectName: 'Harvest Yield Estimation — Fall 2025', status: 'paid', type: 'agriculture',
    description: 'Post-harvest aerial survey with multispectral analysis to estimate actual yield vs. predicted. Data used for insurance claim verification.',
    location: { address: '8900 Farm Rd 42, Ames, IA 50010', lat: 41.878, lng: -93.0977 },
    scheduledDate: '2025-10-15', completedDate: '2025-10-16',
    deliverables: [
      { id: 'DLV-024', name: 'Yield Estimation Map', type: 'orthomosaic', status: 'delivered', fileSize: 3200000000, downloadUrl: '/downloads/prj008-yield.tif' },
      { id: 'DLV-025', name: 'Insurance Verification Report', type: 'report', status: 'delivered', fileSize: 8500000, downloadUrl: '/downloads/prj008-report.pdf' },
    ],
    quote: { amount: 6800, validUntil: '2025-10-20', accepted: true, acceptedDate: '2025-10-05' },
    invoice: { id: 'INV-008', amount: 6800, status: 'paid', dueDate: '2025-11-15', paidDate: '2025-11-10' },
    missions: [
      { missionId: 'MSN-801', date: '2025-10-15', status: 'completed', pilotName: 'Mike Chen' },
    ],
    communications: [
      { id: 'COM-014', from: 'Amanda Chen', message: 'Insurance company accepted the report as primary evidence. Saved us weeks of manual estimation. Thank you!', timestamp: '2025-11-20T10:00:00', read: true },
    ],
    feedback: { rating: 5, comment: 'The yield estimation data was accepted by our insurance provider as primary evidence. Incredibly valuable service.', date: '2025-11-20' },
    createdAt: '2025-09-28', updatedAt: '2025-11-20',
  },
];

// Derive unique clients
const clientMap = new Map<string, { id: string; name: string; company: string; email: string; projectCount: number }>();
mockProjects.forEach(p => {
  const existing = clientMap.get(p.clientId);
  if (existing) { existing.projectCount++; }
  else { clientMap.set(p.clientId, { id: p.clientId, name: p.clientName, company: p.clientCompany, email: p.clientEmail, projectCount: 1 }); }
});
const mockClients = Array.from(clientMap.values()).sort((a, b) => a.name.localeCompare(b.name));

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={clsx('h-3.5 w-3.5', s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ClientPortalPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientSidebar, setShowClientSidebar] = useState(true);

  // New project form state
  const [newProject, setNewProject] = useState({
    clientName: '', clientEmail: '', clientCompany: '',
    projectName: '', type: 'aerial_survey' as ProjectType, description: '',
    address: '', lat: '', lng: '', scheduledDate: '',
    deliverableTypes: [] as string[],
  });

  const stats = mockStats;

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const toggleDeliverable = (dtype: string) => {
    setNewProject(p => ({
      ...p,
      deliverableTypes: p.deliverableTypes.includes(dtype) ? p.deliverableTypes.filter(d => d !== dtype) : [...p.deliverableTypes, dtype],
    }));
  };

  // Filter projects
  const filtered = mockProjects.filter(p => {
    if (selectedClient && p.clientId !== selectedClient) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.projectName.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q) || p.clientCompany.toLowerCase().includes(q);
    }
    return true;
  });

  // Pipeline groups
  const pipeline = pipelineColumns.map(status => ({
    status,
    config: statusConfig[status],
    projects: filtered.filter(p => p.status === status),
  }));

  // ─── Stats Bar ────────────────────────────────────────────────────────────────

  const statItems = [
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Projects', value: stats.activeProjects, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed', value: stats.completedProjects, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Quotes', value: stats.pendingQuotes, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Outstanding Invoices', value: stats.outstandingInvoices, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client projects, deliverables, quotes & invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white">
            <button onClick={() => setViewMode('list')} className={clsx('px-3 py-1.5 text-xs font-medium rounded-l-lg transition-colors', viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>List</button>
            <button onClick={() => setViewMode('pipeline')} className={clsx('px-3 py-1.5 text-xs font-medium rounded-r-lg transition-colors', viewMode === 'pipeline' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>Pipeline</button>
          </div>
          <button onClick={() => setShowNewForm(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {statItems.map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={clsx('rounded-lg p-1.5', s.bg)}><s.icon className={clsx('h-4 w-4', s.color)} /></div>
              <span className="text-xs font-medium text-gray-500 truncate">{s.label}</span>
            </div>
            <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Search projects, clients..." />
        </div>
        <button onClick={() => setShowClientSidebar(!showClientSidebar)} className={clsx('flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors', showClientSidebar ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50')}>
          <Filter className="h-4 w-4" /> Clients
        </button>
      </div>

      <div className="flex gap-6">
        {/* Client Sidebar */}
        {showClientSidebar && (
          <div className="w-64 shrink-0">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1"><Users className="h-4 w-4" /> Clients</h3>
              </div>
              <div className="divide-y divide-gray-100">
                <button onClick={() => setSelectedClient(null)} className={clsx('w-full px-4 py-2.5 text-left text-sm transition-colors', selectedClient === null ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                  All Clients <span className="text-gray-400 text-xs">({mockProjects.length})</span>
                </button>
                {mockClients.map(c => (
                  <button key={c.id} onClick={() => setSelectedClient(c.id)} className={clsx('w-full px-4 py-2.5 text-left transition-colors', selectedClient === c.id ? 'bg-indigo-50' : 'hover:bg-gray-50')}>
                    <p className={clsx('text-sm', selectedClient === c.id ? 'text-indigo-700 font-medium' : 'text-gray-800')}>{c.name}</p>
                    <p className="text-xs text-gray-400">{c.company} — {c.projectCount} project{c.projectCount !== 1 ? 's' : ''}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Pipeline View */}
          {viewMode === 'pipeline' && (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3" style={{ minWidth: pipelineColumns.length * 200 }}>
                {pipeline.map(col => (
                  <div key={col.status} className="w-48 shrink-0">
                    <div className={clsx('rounded-t-lg px-3 py-2 text-xs font-semibold', col.config.bg, col.config.text)}>
                      {col.config.label} <span className="text-gray-400 font-normal">({col.projects.length})</span>
                    </div>
                    <div className="space-y-2 mt-2">
                      {col.projects.map(p => (
                        <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-3 text-xs hover:shadow-sm transition-shadow cursor-pointer" onClick={() => { setViewMode('list'); setExpandedId(p.id); }}>
                          <p className="font-semibold text-gray-800 truncate">{p.projectName}</p>
                          <p className="text-gray-500 truncate mt-0.5">{p.clientCompany}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={clsx('rounded-full px-1.5 py-0.5 text-[10px] font-medium', typeConfig[p.type].bg, typeConfig[p.type].text)}>{typeConfig[p.type].label}</span>
                            {p.quote && <span className="text-gray-500 font-medium">{formatCurrency(p.quote.amount)}</span>}
                          </div>
                        </div>
                      ))}
                      {col.projects.length === 0 && <p className="text-[10px] text-gray-300 text-center py-4">No projects</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filtered.map(p => {
                const sc = statusConfig[p.status];
                const tc = typeConfig[p.type];
                const isExpanded = expandedId === p.id;
                const readyCount = p.deliverables.filter(d => d.status === 'ready' || d.status === 'delivered').length;
                const unreadComms = p.communications.filter(c => !c.read).length;

                return (
                  <div key={p.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{p.projectName}</h3>
                            <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', sc.bg, sc.text, sc.pulse && 'animate-pulse')}>{sc.label}</span>
                            <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tc.bg, tc.text)}>{tc.label}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{p.clientName}</span>
                            <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" />{p.clientCompany}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs text-gray-400">{p.id}</span>
                          </div>
                        </div>
                        {p.feedback && renderStars(p.feedback.rating)}
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-gray-600 truncate">{p.location.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-gray-600">{p.scheduledDate || 'Not scheduled'}{p.completedDate ? ` (done ${p.completedDate})` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-gray-600">Deliverables: {readyCount}/{p.deliverables.length} ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.quote ? (
                            <>
                              <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="font-semibold text-gray-800">{formatCurrency(p.quote.amount)}</span>
                              {p.quote.accepted ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Clock className="h-3.5 w-3.5 text-amber-500" />}
                            </>
                          ) : <span className="text-gray-400 text-xs">No quote</span>}
                        </div>
                      </div>

                      {/* Invoice & Comms badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {p.invoice && (
                          <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', invoiceStatusConfig[p.invoice.status].bg, invoiceStatusConfig[p.invoice.status].text)}>
                            <DollarSign className="h-3 w-3" /> Invoice: {invoiceStatusConfig[p.invoice.status].label} ({formatCurrency(p.invoice.amount)})
                          </span>
                        )}
                        {unreadComms > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            <MessageSquare className="h-3 w-3" /> {unreadComms} unread
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          <Plane className="h-3 w-3" /> Missions: {p.missions.length}
                        </span>
                      </div>

                      {/* Expand Toggle */}
                      <button onClick={() => toggleExpand(p.id)} className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-5">
                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 mb-1">Description</h4>
                          <p className="text-sm text-gray-600">{p.description}</p>
                        </div>

                        {/* Missions */}
                        {p.missions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Plane className="h-4 w-4 text-blue-500" /> Missions</h4>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {p.missions.map(m => (
                                <div key={m.missionId} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                                  <p className="font-medium text-gray-800">{m.missionId}</p>
                                  <p className="text-xs text-gray-500">{m.date} — {m.pilotName}</p>
                                  <span className={clsx('mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium', m.status === 'completed' ? 'bg-green-50 text-green-700' : m.status === 'scheduled' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600')}>{m.status}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Deliverables */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Package className="h-4 w-4 text-green-500" /> Deliverables</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-200"><th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Type</th><th className="pb-2 pr-4">Status</th><th className="pb-2 pr-4">Size</th><th className="pb-2">Download</th></tr></thead>
                              <tbody>
                                {p.deliverables.map(d => {
                                  const ds = deliverableStatusConfig[d.status];
                                  return (
                                    <tr key={d.id} className="border-b border-gray-100 last:border-0">
                                      <td className="py-2 pr-4 text-gray-700 font-medium">{d.name}</td>
                                      <td className="py-2 pr-4 text-gray-500 text-xs">{d.type.replace(/_/g, ' ')}</td>
                                      <td className="py-2 pr-4"><span className={clsx('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', ds.bg, ds.text)}>{ds.label}</span></td>
                                      <td className="py-2 pr-4 text-gray-500 text-xs">{d.fileSize ? formatBytes(d.fileSize) : '—'}</td>
                                      <td className="py-2">{d.downloadUrl ? <a href={d.downloadUrl} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"><Download className="h-3 w-3" />Download</a> : <span className="text-gray-300 text-xs">—</span>}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Communications Thread */}
                        {p.communications.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><MessageSquare className="h-4 w-4 text-purple-500" /> Communications</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {p.communications.map(c => (
                                <div key={c.id} className={clsx('rounded-lg border p-3 text-sm', c.from.includes('Sky Warden') ? 'border-indigo-100 bg-indigo-50/50 ml-8' : 'border-gray-200 bg-white mr-8')}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-800 text-xs">{c.from}</span>
                                    <div className="flex items-center gap-1">
                                      {!c.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                                      <span className="text-[10px] text-gray-400">{new Date(c.timestamp).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <p className="text-gray-600 text-xs">{c.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Feedback */}
                        {p.feedback && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> Client Feedback</h4>
                            <div className="rounded-lg border border-gray-200 bg-white p-3">
                              <div className="flex items-center gap-2 mb-1">
                                {renderStars(p.feedback.rating)}
                                <span className="text-xs text-gray-400">{p.feedback.date}</span>
                              </div>
                              <p className="text-sm text-gray-600 italic">{p.feedback.comment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                  <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No projects match the current filter.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── New Project Modal ────────────────────────────────────────────────── */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">New Client Project</h2>
              <button onClick={() => setShowNewForm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><XCircle className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Client Info */}
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1"><User className="h-4 w-4 text-indigo-500" /> Client Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Client Name</label><input type="text" value={newProject.clientName} onChange={e => setNewProject(p => ({ ...p, clientName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="John Smith" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Email</label><input type="email" value={newProject.clientEmail} onChange={e => setNewProject(p => ({ ...p, clientEmail: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="john@company.com" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Company</label><input type="text" value={newProject.clientCompany} onChange={e => setNewProject(p => ({ ...p, clientCompany: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Acme Corp" /></div>
              </div>

              {/* Project Info */}
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-2"><Briefcase className="h-4 w-4 text-blue-500" /> Project Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label><input type="text" value={newProject.projectName} onChange={e => setNewProject(p => ({ ...p, projectName: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Solar Farm Inspection" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Project Type</label>
                  <select value={newProject.type} onChange={e => setNewProject(p => ({ ...p, type: e.target.value as ProjectType }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Description</label><textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe the project scope and requirements..." /></div>

              {/* Location */}
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-2"><MapPin className="h-4 w-4 text-red-500" /> Location</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3"><label className="block text-xs font-medium text-gray-600 mb-1">Address</label><input type="text" value={newProject.address} onChange={e => setNewProject(p => ({ ...p, address: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="123 Main St, City, State ZIP" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label><input type="number" step="any" value={newProject.lat} onChange={e => setNewProject(p => ({ ...p, lat: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label><input type="number" step="any" value={newProject.lng} onChange={e => setNewProject(p => ({ ...p, lng: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Scheduled Date</label><input type="date" value={newProject.scheduledDate} onChange={e => setNewProject(p => ({ ...p, scheduledDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
              </div>

              {/* Deliverable Types */}
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-2"><Package className="h-4 w-4 text-green-500" /> Deliverable Types</h3>
              <div className="flex flex-wrap gap-2">
                {['orthomosaic', 'photos', 'video', '3d_model', 'report', 'raw_data', 'thermal_map'].map(dt => (
                  <button key={dt} onClick={() => toggleDeliverable(dt)} className={clsx('rounded-full px-3 py-1.5 text-xs font-medium transition-colors border', newProject.deliverableTypes.includes(dt) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}>
                    {newProject.deliverableTypes.includes(dt) && <CheckCircle className="inline h-3 w-3 mr-1" />}
                    {dt.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-6 py-4 rounded-b-2xl">
              <button onClick={() => setShowNewForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowNewForm(false)} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                <Plus className="h-4 w-4" /> Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
