import { useState } from "react";
import {
  Wrench, Calendar, AlertTriangle, CheckCircle, Clock, Battery,
  BatteryWarning, Thermometer, Zap, Shield, Activity, Plus,
  Filter, Search, ChevronDown, TrendingDown, TrendingUp, Package,
  RefreshCw, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "overdue" | "cancelled";
type MaintenancePriority = "low" | "medium" | "high" | "critical";

const statusConfig: Record<MaintenanceStatus, { label: string; bg: string; text: string }> = {
  scheduled: { label: "Scheduled", bg: "bg-blue-50", text: "text-blue-700" },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700" },
  overdue: { label: "Overdue", bg: "bg-red-50", text: "text-red-700" },
  cancelled: { label: "Cancelled", bg: "bg-gray-100", text: "text-gray-600" },
};

const priorityConfig: Record<MaintenancePriority, { label: string; dot: string }> = {
  low: { label: "Low", dot: "bg-blue-400" },
  medium: { label: "Medium", dot: "bg-yellow-500" },
  high: { label: "High", dot: "bg-orange-500" },
  critical: { label: "Critical", dot: "bg-red-500" },
};

interface MaintenanceRecord {
  id: string; droneName: string; type: string; status: MaintenanceStatus; priority: MaintenancePriority;
  title: string; scheduledDate: string; completedDate?: string; technician: string; cost: number;
  flightHoursAtService: number; nextServiceDue: { hours: number; date: string };
}

interface BatteryRecord {
  id: string; droneName: string; serialNumber: string; cycleCount: number; maxCycles: number;
  healthPercent: number; lastCharged: string; temperature: number; voltage: number; status: "good" | "warning" | "replace";
}

const mockRecords: MaintenanceRecord[] = [
  { id: "MNT-001", droneName: "Mavic 3 Enterprise #1", type: "scheduled", status: "completed", priority: "medium", title: "Routine 200hr Service", scheduledDate: "2026-02-15", completedDate: "2026-02-15", technician: "Mike Chen", cost: 450, flightHoursAtService: 200, nextServiceDue: { hours: 400, date: "2026-06-15" } },
  { id: "MNT-002", droneName: "Matrice 350 RTK", type: "unscheduled", status: "in_progress", priority: "high", title: "Gimbal Calibration Issue", scheduledDate: "2026-03-18", technician: "Sarah Kim", cost: 280, flightHoursAtService: 156, nextServiceDue: { hours: 200, date: "2026-04-20" } },
  { id: "MNT-003", droneName: "Skydio X10", type: "scheduled", status: "overdue", priority: "critical", title: "Annual FAA Inspection", scheduledDate: "2026-03-01", technician: "Unassigned", cost: 0, flightHoursAtService: 380, nextServiceDue: { hours: 400, date: "2026-03-01" } },
  { id: "MNT-004", droneName: "EVO II Pro #1", type: "scheduled", status: "scheduled", priority: "low", title: "Propeller Replacement", scheduledDate: "2026-04-01", technician: "Mike Chen", cost: 120, flightHoursAtService: 90, nextServiceDue: { hours: 200, date: "2026-08-01" } },
  { id: "MNT-005", droneName: "DJI Inspire 3", type: "corrective", status: "completed", priority: "high", title: "Motor Bearing Replacement", scheduledDate: "2026-03-10", completedDate: "2026-03-12", technician: "David Park", cost: 890, flightHoursAtService: 312, nextServiceDue: { hours: 500, date: "2026-07-15" } },
];

const mockBatteries: BatteryRecord[] = [
  { id: "BAT-001", droneName: "Mavic 3 Enterprise #1", serialNumber: "DJI-TB65-A0142", cycleCount: 187, maxCycles: 500, healthPercent: 94, lastCharged: "2026-03-19", temperature: 32, voltage: 17.6, status: "good" },
  { id: "BAT-002", droneName: "Matrice 350 RTK", serialNumber: "DJI-TB65-B0089", cycleCount: 412, maxCycles: 500, healthPercent: 72, lastCharged: "2026-03-18", temperature: 28, voltage: 17.2, status: "warning" },
  { id: "BAT-003", droneName: "EVO II Pro #1", serialNumber: "AUT-EB6-C0221", cycleCount: 478, maxCycles: 500, healthPercent: 48, lastCharged: "2026-03-15", temperature: 35, voltage: 16.8, status: "replace" },
  { id: "BAT-004", droneName: "Skydio X10", serialNumber: "SKY-X10-D0055", cycleCount: 98, maxCycles: 500, healthPercent: 98, lastCharged: "2026-03-20", temperature: 26, voltage: 22.1, status: "good" },
];

type TabId = "maintenance" | "batteries" | "lifecycle";

export default function MaintenancePage() {
  const [tab, setTab] = useState<TabId>("maintenance");
  const [search, setSearch] = useState("");

  const stats = {
    total: mockRecords.length, overdue: mockRecords.filter(r => r.status === "overdue").length,
    upcoming: mockRecords.filter(r => r.status === "scheduled").length,
    avgHealth: Math.round(mockBatteries.reduce((s, b) => s + b.healthPercent, 0) / mockBatteries.length),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance & Battery</h1>
          <p className="text-sm text-muted-foreground mt-1">Lifecycle tracking, component wear, battery health</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Schedule Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Records", value: stats.total, icon: Wrench, color: "text-blue-600" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-600" },
          { label: "Upcoming", value: stats.upcoming, icon: Calendar, color: "text-amber-600" },
          { label: "Avg Battery Health", value: `${stats.avgHealth}%`, icon: Battery, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["maintenance", "batteries", "lifecycle"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "batteries" ? "Battery Health" : t === "lifecycle" ? "Drone Lifecycle" : "Maintenance"}
          </button>
        ))}
      </div>

      {tab === "maintenance" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search maintenance records…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"><Filter className="w-4 h-4" /> Filter</button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"><Download className="w-4 h-4" /> Export</button>
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Drone</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Scheduled</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Technician</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Cost</th>
              </tr></thead>
              <tbody>
                {mockRecords.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.droneName.toLowerCase().includes(search.toLowerCase())).map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-4 py-3 font-medium">{r.droneName}</td>
                    <td className="px-4 py-3">{r.title}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5"><span className={cn("w-2 h-2 rounded-full", priorityConfig[r.priority].dot)} />{priorityConfig[r.priority].label}</span></td>
                    <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[r.status].bg, statusConfig[r.status].text)}>{statusConfig[r.status].label}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{r.scheduledDate}</td>
                    <td className="px-4 py-3">{r.technician}</td>
                    <td className="px-4 py-3 text-right font-mono">${r.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "batteries" && (
        <div className="grid grid-cols-2 gap-4">
          {mockBatteries.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">{b.droneName}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{b.serialNumber}</p>
                </div>
                {b.status === "good" ? <CheckCircle className="w-5 h-5 text-green-500" /> : b.status === "warning" ? <BatteryWarning className="w-5 h-5 text-amber-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Health</span><span className="font-medium">{b.healthPercent}%</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", b.healthPercent > 80 ? "bg-green-500" : b.healthPercent > 60 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${b.healthPercent}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Cycles</span><p className="font-medium">{b.cycleCount} / {b.maxCycles}</p></div>
                  <div><span className="text-muted-foreground">Voltage</span><p className="font-medium">{b.voltage}V</p></div>
                  <div><span className="text-muted-foreground">Temp</span><p className="font-medium">{b.temperature}°C</p></div>
                  <div><span className="text-muted-foreground">Last Charged</span><p className="font-medium">{b.lastCharged}</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "lifecycle" && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Drone Lifecycle Overview</h3>
          <div className="space-y-4">
            {["Mavic 3 Enterprise #1", "Matrice 350 RTK", "Skydio X10", "EVO II Pro #1"].map((drone, i) => {
              const hours = [200, 156, 380, 90][i];
              const maxHours = 500;
              return (
                <div key={drone} className="flex items-center gap-4">
                  <span className="w-48 text-sm font-medium truncate">{drone}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", hours / maxHours > 0.7 ? "bg-amber-500" : "bg-primary")} style={{ width: `${(hours / maxHours) * 100}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-24 text-right">{hours}h / {maxHours}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
