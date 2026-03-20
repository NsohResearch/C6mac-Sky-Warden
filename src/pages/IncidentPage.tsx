import { useState } from "react";
import { AlertTriangle, AlertCircle, Shield, FileText, Search, Filter, Clock, Calendar, MapPin, User, Plus, CheckCircle, XCircle, TrendingUp, Activity, BarChart2, Target, Eye, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

type IncidentStatus = "reported" | "under_investigation" | "root_cause_identified" | "corrective_action" | "closed" | "reopened";
type Severity = "minor" | "moderate" | "serious" | "critical";

const statusConfig: Record<IncidentStatus, { label: string; bg: string; text: string }> = {
  reported: { label: "Reported", bg: "bg-blue-50", text: "text-blue-700" },
  under_investigation: { label: "Investigating", bg: "bg-amber-50", text: "text-amber-700" },
  root_cause_identified: { label: "Root Cause ID", bg: "bg-purple-50", text: "text-purple-700" },
  corrective_action: { label: "Corrective Action", bg: "bg-orange-50", text: "text-orange-700" },
  closed: { label: "Closed", bg: "bg-green-50", text: "text-green-700" },
  reopened: { label: "Reopened", bg: "bg-red-50", text: "text-red-700" },
};

const severityConfig: Record<Severity, { label: string; dot: string }> = {
  minor: { label: "Minor", dot: "bg-blue-500" },
  moderate: { label: "Moderate", dot: "bg-yellow-500" },
  serious: { label: "Serious", dot: "bg-orange-500" },
  critical: { label: "Critical", dot: "bg-red-500" },
};

interface Incident {
  id: string; title: string; type: string; severity: Severity; status: IncidentStatus;
  date: string; location: string; droneName: string; reportedBy: string; description: string;
  injuryInvolved: boolean; propertyDamage: number;
}

const mockIncidents: Incident[] = [
  { id: "INC-001", title: "Mid-air proximity event", type: "airspace_incident", severity: "serious", status: "under_investigation", date: "2026-03-18", location: "Austin, TX", droneName: "Mavic 3 Enterprise #1", reportedBy: "Alex Martinez", description: "Manned aircraft passed within 200ft during survey operation", injuryInvolved: false, propertyDamage: 0 },
  { id: "INC-002", title: "Hard landing during RTH", type: "equipment_failure", severity: "moderate", status: "corrective_action", date: "2026-03-12", location: "Denver, CO", droneName: "Matrice 350 RTK", reportedBy: "Sarah Kim", description: "GPS lock lost during return-to-home, causing hard landing", injuryInvolved: false, propertyDamage: 8200 },
  { id: "INC-003", title: "Battery thermal event", type: "equipment_failure", severity: "critical", status: "closed", date: "2026-02-28", location: "Phoenix, AZ", droneName: "EVO II Pro #1", reportedBy: "Robert Chen", description: "Battery swelling detected post-flight in 42°C conditions", injuryInvolved: false, propertyDamage: 3400 },
  { id: "INC-004", title: "Geofence breach during inspection", type: "operational_incident", severity: "minor", status: "closed", date: "2026-02-15", location: "Houston, TX", droneName: "Skydio X10", reportedBy: "Aisha Patel", description: "Drone briefly entered adjacent property airspace during automated inspection", injuryInvolved: false, propertyDamage: 0 },
  { id: "INC-005", title: "Propeller strike on structure", type: "collision", severity: "moderate", status: "reported", date: "2026-03-20", location: "Seattle, WA", droneName: "DJI Inspire 3", reportedBy: "Alex Martinez", description: "Clipped antenna during roof inspection", injuryInvolved: false, propertyDamage: 1200 },
];

type TabId = "incidents" | "investigation" | "analytics";

export default function IncidentPage() {
  const [tab, setTab] = useState<TabId>("incidents");
  const [search, setSearch] = useState("");

  const stats = {
    total: mockIncidents.length,
    open: mockIncidents.filter(i => !["closed"].includes(i.status)).length,
    critical: mockIncidents.filter(i => i.severity === "critical").length,
    totalDamage: mockIncidents.reduce((s, i) => s + i.propertyDamage, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incident Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Accident reporting, investigation board, corrective actions</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: stats.total, icon: AlertTriangle, color: "text-blue-600" },
          { label: "Open Cases", value: stats.open, icon: AlertCircle, color: "text-amber-600" },
          { label: "Critical", value: stats.critical, icon: Flag, color: "text-red-600" },
          { label: "Total Damage", value: `$${stats.totalDamage.toLocaleString()}`, icon: Activity, color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["incidents", "investigation", "analytics"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{t === "investigation" ? "Investigation Board" : t}</button>
        ))}
      </div>

      {tab === "incidents" && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          </div>
          {mockIncidents.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase())).map(i => (
            <div key={i.id} className={cn("bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer", i.severity === "critical" ? "border-l-4 border-l-red-500 border-red-200" : "border-border")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={cn("w-2.5 h-2.5 rounded-full", severityConfig[i.severity].dot)} />
                  <div>
                    <h3 className="font-semibold text-foreground">{i.title}</h3>
                    <p className="text-xs text-muted-foreground">{i.id} · {i.droneName} · {i.location}</p>
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[i.status].bg, statusConfig[i.status].text)}>{statusConfig[i.status].label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{i.description}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{i.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{i.reportedBy}</span>
                {i.propertyDamage > 0 && <span className="text-orange-600 font-medium">${i.propertyDamage.toLocaleString()} damage</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "investigation" && (
        <div className="grid grid-cols-3 gap-4">
          {(["reported", "under_investigation", "corrective_action"] as IncidentStatus[]).map(status => (
            <div key={status} className="bg-muted/30 rounded-lg p-3 min-h-[300px]">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{statusConfig[status].label}</h3>
              {mockIncidents.filter(i => i.status === status).map(i => (
                <div key={i.id} className="bg-card border border-border rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("w-2 h-2 rounded-full", severityConfig[i.severity].dot)} />
                    <span className="text-sm font-medium">{i.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{i.droneName} · {i.date}</p>
                </div>
              ))}
              {mockIncidents.filter(i => i.status === status).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No incidents</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-3">Incidents by Type</h3>
            {["equipment_failure", "airspace_incident", "operational_incident", "collision"].map(type => {
              const count = mockIncidents.filter(i => i.type === type).length;
              return (
                <div key={type} className="flex items-center gap-3 mb-2">
                  <span className="text-sm w-40 capitalize">{type.replace("_", " ")}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${(count / mockIncidents.length) * 100}%` }} /></div>
                  <span className="text-sm font-medium w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-3">Severity Distribution</h3>
            {(["critical", "serious", "moderate", "minor"] as Severity[]).map(sev => {
              const count = mockIncidents.filter(i => i.severity === sev).length;
              return (
                <div key={sev} className="flex items-center gap-3 mb-2">
                  <span className="flex items-center gap-2 w-28"><span className={cn("w-2.5 h-2.5 rounded-full", severityConfig[sev].dot)} /><span className="text-sm capitalize">{sev}</span></span>
                  <div className="flex-1 h-2 bg-muted rounded-full"><div className={cn("h-full rounded-full", severityConfig[sev].dot)} style={{ width: `${(count / mockIncidents.length) * 100}%` }} /></div>
                  <span className="text-sm font-medium w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
