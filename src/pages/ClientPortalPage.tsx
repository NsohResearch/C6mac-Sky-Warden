import { useState } from "react";
import { Users, Building, Briefcase, Package, FileText, DollarSign, Star, Calendar, Clock, MessageSquare, Download, CheckCircle, Plus, Filter, Search, Mail, Send, Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectStatus = "requested" | "quoted" | "approved" | "scheduled" | "in_progress" | "completed" | "invoiced" | "paid";

const statusConfig: Record<ProjectStatus, { label: string; bg: string; text: string }> = {
  requested: { label: "Requested", bg: "bg-gray-100", text: "text-gray-700" },
  quoted: { label: "Quoted", bg: "bg-blue-50", text: "text-blue-700" },
  approved: { label: "Approved", bg: "bg-indigo-50", text: "text-indigo-700" },
  scheduled: { label: "Scheduled", bg: "bg-purple-50", text: "text-purple-700" },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700" },
  invoiced: { label: "Invoiced", bg: "bg-orange-50", text: "text-orange-700" },
  paid: { label: "Paid", bg: "bg-emerald-50", text: "text-emerald-700" },
};

interface ClientProject {
  id: string; clientName: string; projectName: string; type: string; status: ProjectStatus;
  value: number; startDate: string; deliverables: number; completedDeliverables: number; lastUpdate: string;
}

const mockProjects: ClientProject[] = [
  { id: "CP-001", clientName: "Apex Construction Co.", projectName: "Downtown Tower Progress Survey", type: "Aerial Survey", status: "in_progress", value: 8500, startDate: "2026-03-15", deliverables: 6, completedDeliverables: 3, lastUpdate: "2 hours ago" },
  { id: "CP-002", clientName: "SolarGrid Energy", projectName: "Solar Farm Thermal Inspection Q1", type: "Inspection", status: "completed", value: 12000, startDate: "2026-02-20", deliverables: 4, completedDeliverables: 4, lastUpdate: "3 days ago" },
  { id: "CP-003", clientName: "GreenTech Agriculture", projectName: "Vineyard NDVI Analysis", type: "Agriculture", status: "scheduled", value: 6200, startDate: "2026-04-01", deliverables: 3, completedDeliverables: 0, lastUpdate: "1 day ago" },
  { id: "CP-004", clientName: "Metro Power Utility", projectName: "Transmission Line Corridor Survey", type: "Inspection", status: "quoted", value: 28000, startDate: "TBD", deliverables: 8, completedDeliverables: 0, lastUpdate: "5 hours ago" },
  { id: "CP-005", clientName: "Riverside Insurance", projectName: "Commercial Roof Assessment", type: "Insurance", status: "invoiced", value: 3800, startDate: "2026-03-10", deliverables: 2, completedDeliverables: 2, lastUpdate: "1 week ago" },
];

type TabId = "projects" | "pipeline" | "invoicing";

export default function ClientPortalPage() {
  const [tab, setTab] = useState<TabId>("projects");

  const stats = {
    activeClients: new Set(mockProjects.filter(p => ["in_progress", "scheduled"].includes(p.status)).map(p => p.clientName)).size,
    pipeline: mockProjects.filter(p => ["requested", "quoted"].includes(p.status)).reduce((s, p) => s + p.value, 0),
    revenue: mockProjects.filter(p => ["completed", "invoiced", "paid"].includes(p.status)).reduce((s, p) => s + p.value, 0),
    projects: mockProjects.length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Project pipeline, deliverables, quotes, invoices</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Clients", value: stats.activeClients, icon: Users, color: "text-blue-600" },
          { label: "Pipeline Value", value: `$${stats.pipeline.toLocaleString()}`, icon: Briefcase, color: "text-purple-600" },
          { label: "Revenue YTD", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
          { label: "Total Projects", value: stats.projects, icon: Package, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["projects", "pipeline", "invoicing"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      {tab === "projects" && (
        <div className="space-y-3">
          {mockProjects.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{p.projectName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="w-3.5 h-3.5" />{p.clientName} · {p.type}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[p.status].bg, statusConfig[p.status].text)}>{statusConfig[p.status].label}</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Value</span><p className="font-semibold">${p.value.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Start</span><p className="font-medium">{p.startDate}</p></div>
                <div>
                  <span className="text-muted-foreground">Deliverables</span>
                  <p className="font-medium">{p.completedDeliverables}/{p.deliverables}</p>
                </div>
                <div><span className="text-muted-foreground">Last Update</span><p className="font-medium">{p.lastUpdate}</p></div>
              </div>
              {p.deliverables > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(p.completedDeliverables / p.deliverables) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "pipeline" && (
        <div className="grid grid-cols-4 gap-4">
          {(["requested", "quoted", "approved", "scheduled"] as ProjectStatus[]).map(status => (
            <div key={status} className="bg-muted/30 rounded-lg p-3 min-h-[200px]">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{statusConfig[status].label}</h3>
              {mockProjects.filter(p => p.status === status).map(p => (
                <div key={p.id} className="bg-card border border-border rounded-lg p-3 mb-2">
                  <p className="text-sm font-medium">{p.projectName}</p>
                  <p className="text-xs text-muted-foreground">{p.clientName}</p>
                  <p className="text-sm font-semibold text-primary mt-1">${p.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "invoicing" && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="font-semibold text-foreground">Invoicing Center</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate and manage invoices from completed projects</p>
          <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">Create Invoice</button>
        </div>
      )}
    </div>
  );
}
