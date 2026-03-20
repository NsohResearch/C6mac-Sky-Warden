import { useState } from "react";
import { Eye, Radar, Radio, Shield, ShieldCheck, MapPin, Map, Users, Plane, Clock, Calendar, AlertTriangle, CheckCircle, XCircle, Plus, FileText, Navigation, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type OperationStatus = "planning" | "waiver_pending" | "waiver_approved" | "waiver_denied" | "active" | "completed" | "cancelled";

const statusConfig: Record<OperationStatus, { label: string; bg: string; text: string }> = {
  planning: { label: "Planning", bg: "bg-gray-100", text: "text-gray-700" },
  waiver_pending: { label: "Waiver Pending", bg: "bg-amber-50", text: "text-amber-700" },
  waiver_approved: { label: "Waiver Approved", bg: "bg-green-50", text: "text-green-700" },
  waiver_denied: { label: "Waiver Denied", bg: "bg-red-50", text: "text-red-700" },
  active: { label: "Active", bg: "bg-blue-50", text: "text-blue-700" },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-800" },
  cancelled: { label: "Cancelled", bg: "bg-gray-200", text: "text-gray-600" },
};

interface BVLOSOperation {
  id: string; title: string; status: OperationStatus; waiverType: string;
  corridor: string; distance: number; maxAlt: number; droneName: string;
  pilotName: string; startDate: string; endDate: string; riskLevel: "low" | "medium" | "high";
  daaSystem: string; observers: number;
}

const mockOperations: BVLOSOperation[] = [
  { id: "BVLOS-001", title: "Pipeline Corridor Inspection - Segment A", status: "active", waiverType: "Part 107 Waiver", corridor: "Texas Pipeline Corridor", distance: 12.4, maxAlt: 400, droneName: "Matrice 350 RTK", pilotName: "Alex Martinez", startDate: "2026-03-18", endDate: "2026-03-22", riskLevel: "medium", daaSystem: "ADS-B + Radar", observers: 3 },
  { id: "BVLOS-002", title: "Highway Bridge Survey — Linear", status: "waiver_approved", waiverType: "Type Certificate", corridor: "I-35 Highway", distance: 8.2, maxAlt: 300, droneName: "Skydio X10", pilotName: "Sarah Kim", startDate: "2026-03-25", endDate: "2026-03-27", riskLevel: "low", daaSystem: "Visual Observers + ADS-B", observers: 5 },
  { id: "BVLOS-003", title: "Agricultural Survey — County Farm", status: "waiver_pending", waiverType: "Part 107 Waiver", corridor: "Rural Iowa", distance: 24.8, maxAlt: 200, droneName: "DJI Agras T40", pilotName: "Robert Chen", startDate: "2026-04-01", endDate: "2026-04-05", riskLevel: "low", daaSystem: "ADS-B In", observers: 2 },
  { id: "BVLOS-004", title: "Powerline Inspection — Mountain Section", status: "planning", waiverType: "Part 108 (Proposed)", corridor: "Colorado Mountains", distance: 45.0, maxAlt: 500, droneName: "Wingtra One", pilotName: "Aisha Patel", startDate: "2026-05-01", endDate: "2026-05-10", riskLevel: "high", daaSystem: "Full DAA Suite", observers: 8 },
  { id: "BVLOS-005", title: "Rail Corridor Monitoring", status: "completed", waiverType: "Part 107 Waiver", corridor: "Northeast Corridor", distance: 18.6, maxAlt: 350, droneName: "Autel EVO Max", pilotName: "Alex Martinez", startDate: "2026-02-10", endDate: "2026-02-14", riskLevel: "medium", daaSystem: "ADS-B + Ground Radar", observers: 4 },
];

export default function BVLOSPage() {
  const [search, setSearch] = useState("");

  const riskColors = { low: "text-green-600", medium: "text-amber-600", high: "text-red-600" };
  const riskDots = { low: "bg-green-500", medium: "bg-amber-500", high: "bg-red-500" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">BVLOS Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">Waiver management, safety cases, DAA systems</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> New BVLOS Operation
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Operations", value: mockOperations.filter(o => o.status === "active").length, icon: Eye, color: "text-blue-600" },
          { label: "Waivers Pending", value: mockOperations.filter(o => o.status === "waiver_pending").length, icon: Clock, color: "text-amber-600" },
          { label: "Total Distance", value: `${mockOperations.reduce((s, o) => s + o.distance, 0).toFixed(1)} mi`, icon: Navigation, color: "text-green-600" },
          { label: "Avg Risk", value: "Medium", icon: Shield, color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockOperations.map(op => (
          <div key={op.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{op.title}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[op.status].bg, statusConfig[op.status].text)}>{statusConfig[op.status].label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{op.id} · {op.waiverType}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", riskDots[op.riskLevel])} />
                <span className={cn("text-sm font-medium capitalize", riskColors[op.riskLevel])}>{op.riskLevel} Risk</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div><span className="text-muted-foreground">Corridor</span><p className="font-medium">{op.corridor}</p></div>
              <div><span className="text-muted-foreground">Distance</span><p className="font-medium">{op.distance} mi</p></div>
              <div><span className="text-muted-foreground">Max Alt</span><p className="font-medium">{op.maxAlt} ft</p></div>
              <div><span className="text-muted-foreground">Drone</span><p className="font-medium">{op.droneName}</p></div>
              <div><span className="text-muted-foreground">DAA System</span><p className="font-medium">{op.daaSystem}</p></div>
              <div><span className="text-muted-foreground">Observers</span><p className="font-medium">{op.observers}</p></div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{op.startDate} → {op.endDate}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{op.pilotName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
