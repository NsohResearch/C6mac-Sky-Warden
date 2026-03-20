export interface ClientProject {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  projectName: string;
  status: 'requested' | 'quoted' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'invoiced' | 'paid';
  type: 'aerial_survey' | 'inspection' | 'mapping' | 'photography' | 'videography' | 'agriculture' | 'construction' | 'real_estate' | 'event' | 'custom';
  description: string;
  location: { address: string; lat: number; lng: number };
  scheduledDate?: string;
  completedDate?: string;
  deliverables: Array<{ id: string; name: string; type: 'orthomosaic' | 'photos' | 'video' | '3d_model' | 'report' | 'raw_data' | 'thermal_map'; status: 'pending' | 'processing' | 'ready' | 'delivered'; fileSize?: number; downloadUrl?: string; }>;
  quote?: { amount: number; validUntil: string; accepted: boolean; acceptedDate?: string };
  invoice?: { id: string; amount: number; status: 'draft' | 'sent' | 'paid' | 'overdue'; dueDate: string; paidDate?: string };
  missions: Array<{ missionId: string; date: string; status: string; pilotName: string }>;
  communications: Array<{ id: string; from: string; message: string; timestamp: string; read: boolean }>;
  feedback?: { rating: number; comment: string; date: string };
  createdAt: string;
  updatedAt: string;
}

export interface ClientPortalStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  pendingQuotes: number;
  outstandingInvoices: number;
  totalRevenue: number;
  avgRating: number;
}
