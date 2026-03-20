import { useState } from "react";
import { Map, MapPin, Shield, ShieldAlert, AlertTriangle, Circle, Target, Lock, Unlock, Clock, Plus, Filter, Search, Eye, EyeOff, Bell, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type GeofenceType = "no_fly" | "operational_boundary" | "advisory" | "temporary_restriction" | "emergency";
type GeofenceStatus = "active" | "inactive" | "expired" | "pending";

const typeConfig: Record<GeofenceType, { label: string; bg: string; text: string; color: string }> = {
  no_fly: { label: "No-Fly Zone", bg: "bg-red-50", text: "text-red-700", color: "#EF4444" },
  operational_boundary: { label: "Operational", bg: "bg-blue-50", text: "text-blue-700", color: "#3B82F6" },
  advisory: { label: "Advisory", bg: "bg-amber-50", text: "text-amber-700", color: "#F59E0B" },
  temporary_restriction: { label: "TFR", bg: "bg-orange-50", text: "text-orange-700", color: "#F97316" },
  emergency: { label: "Emergency", bg: "bg-red-100", text: "text-red-800", color: "#DC2626" },
};

interface Geofence {
  id: string; name: string; type: GeofenceType; status: GeofenceStatus;
  enforcement: "hard" | "soft"; altMin: number; altMax: number;
  source: string; breachCount: number; createdAt: string;
}

interface GeofenceAlert {
  id: string; geofenceName: string; droneName: string; type: "breach" | "proximity" | "entry_request";
  severity: "critical" | "warning" | "info"; timestamp: string; resolved: boolean;
}

const mockGeofences: Geofence[] = [
  { id: "GEO-001", name: "JFK Airport Buffer Zone", type: "no_fly", status: "active", enforcement: "hard", altMin: 0, altMax: 0, source: "FAA UASFM", breachCount: 0, createdAt: "2025-01-15" },
  { id: "GEO-002", name: "Downtown Construction Site Alpha", type: "operational_boundary", status: "active", enforcement: "soft", altMin: 0, altMax: 200, source: "User Created", breachCount: 2, createdAt: "2026-02-20" },
  { id: "GEO-003", name: "National Park Preserve", type: "no_fly", status: "active", enforcement: "hard", altMin: 0, altMax: 0, source: "NPS", breachCount: 0, createdAt: "2024-06-01" },
  { id: "GEO-004", name: "Stadium Event TFR", type: "temporary_restriction", status: "active", enforcement: "hard", altMin: 0, altMax: 400, source: "FAA NOTAM", breachCount: 0, createdAt: "2026-03-18" },
  { id: "GEO-005", name: "Solar Farm Survey Area", type: "operational_boundary", status: "active", enforcement: "soft", altMin: 50, altMax: 300, source: "User Created", breachCount: 1, createdAt: "2026-03-15" },
  { id: "GEO-006", name: "Wildfire Emergency Zone", type: "emergency", status: "active", enforcement: "hard", altMin: 0, altMax: 0, source: "FEMA", breachCount: 0, createdAt: "2026-03-19" },
];

const mockAlerts: GeofenceAlert[] = [
  { id: "GA-001", geofenceName: "Downtown Construction Site Alpha", droneName: "Mavic 3 Enterprise #1", type: "breach", severity: "critical", timestamp: "2026-03-20T09:15:00Z", resolved: false },
  { id: "GA-002", geofenceName: "Solar Farm Survey Area", droneName: "EVO II Pro #1", type: "proximity", severity: "warning", timestamp: "2026-03-20T08:42:00Z", resolved: true },
  { id: "GA-003", geofenceName: "Stadium Event TFR", droneName: "Skydio X10", type: "entry_request", severity: "info", timestamp: "2026-03-19T16:30:00Z", resolved: true },
];

type TabId = "zones" | "alerts" | "map";

export default function GeofencePage() {
  const [tab, setTab] = useState<TabId>("zones");
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Geofence Management</h1>
          <p className="text-sm text-muted-foreground mt-1">No-fly zones, operational boundaries, breach alerts</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Create Geofence
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Zones", value: mockGeofences.filter(g => g.status === "active").length, icon: Shield, color: "text-blue-600" },
          { label: "No-Fly Zones", value: mockGeofences.filter(g => g.type === "no_fly").length, icon: ShieldAlert, color: "text-red-600" },
          { label: "Active Alerts", value: mockAlerts.filter(a => !a.resolved).length, icon: Bell, color: "text-amber-600" },
          { label: "Total Breaches", value: mockGeofences.reduce((s, g) => s + g.breachCount, 0), icon: AlertTriangle, color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["zones", "alerts", "map"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "zones" ? "Geofence Zones" : t === "alerts" ? `Alerts (${mockAlerts.filter(a => !a.resolved).length})` : "Map View"}
          </button>
        ))}
      </div>

      {tab === "zones" && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search geofences…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {mockGeofences.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase())).map(g => (
              <div key={g.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeConfig[g.type].color }} />
                    <div>
                      <h3 className="font-semibold text-foreground">{g.name}</h3>
                      <p className="text-xs text-muted-foreground">Source: {g.source} · Created {g.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", typeConfig[g.type].bg, typeConfig[g.type].text)}>{typeConfig[g.type].label}</span>
                    {g.enforcement === "hard" ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-amber-500" />}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
                  <span>Alt: {g.altMin}–{g.altMax} ft</span>
                  <span>Enforcement: {g.enforcement}</span>
                  {g.breachCount > 0 && <span className="text-red-600 font-medium">{g.breachCount} breaches</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-3">
          {mockAlerts.map(a => (
            <div key={a.id} className={cn("bg-card border rounded-lg p-4", a.severity === "critical" ? "border-red-300 border-l-4 border-l-red-500" : a.severity === "warning" ? "border-amber-300 border-l-4 border-l-amber-500" : "border-border border-l-4 border-l-blue-400")}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{a.geofenceName}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", a.severity === "critical" ? "bg-red-100 text-red-700" : a.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>{a.type.replace("_", " ")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Drone: {a.droneName} · {new Date(a.timestamp).toLocaleString()}</p>
                </div>
                <span className={cn("text-xs font-medium", a.resolved ? "text-green-600" : "text-red-600")}>{a.resolved ? "Resolved" : "Active"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "map" && (
        <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-muted-foreground">
            <Map className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Geofence Map View</p>
            <p className="text-sm mt-1">Interactive map with geofence overlays available on the Airspace page</p>
          </div>
        </div>
      )}
    </div>
  );
}
