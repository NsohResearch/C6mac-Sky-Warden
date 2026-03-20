import { useState } from "react";
import { Radio, Radar, Navigation, MapPin, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Plane, Target, Layers, Globe, Activity, Server, Plus, Search, RefreshCw, Signal, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

type OperationState = "proposed" | "accepted" | "activated" | "closed" | "nonconforming" | "rogue";

const stateConfig: Record<OperationState, { label: string; bg: string; text: string }> = {
  proposed: { label: "Proposed", bg: "bg-blue-50", text: "text-blue-700" },
  accepted: { label: "Accepted", bg: "bg-indigo-50", text: "text-indigo-700" },
  activated: { label: "Activated", bg: "bg-green-50", text: "text-green-700" },
  closed: { label: "Closed", bg: "bg-gray-100", text: "text-gray-600" },
  nonconforming: { label: "Non-Conforming", bg: "bg-orange-50", text: "text-orange-700" },
  rogue: { label: "Rogue", bg: "bg-red-50", text: "text-red-700" },
};

interface UTMOperation {
  id: string; gufi: string; title: string; state: OperationState; operationType: string;
  priority: "low" | "medium" | "high" | "emergency"; droneName: string; pilotName: string;
  startTime: string; endTime: string; maxAlt: number; area: string;
}

const mockOperations: UTMOperation[] = [
  { id: "UTM-001", gufi: "urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6", title: "Infrastructure Survey — Downtown Grid", state: "activated", operationType: "VLOS", priority: "medium", droneName: "Mavic 3 Enterprise #1", pilotName: "Alex Martinez", startTime: "2026-03-20T09:00:00Z", endTime: "2026-03-20T11:30:00Z", maxAlt: 200, area: "Austin Downtown" },
  { id: "UTM-002", gufi: "urn:uuid:a47c1db0-8e2a-4b7f-9d1c-5e3f6a8b9c0d", title: "Pipeline Corridor Monitoring", state: "accepted", operationType: "BVLOS", priority: "high", droneName: "Matrice 350 RTK", pilotName: "Sarah Kim", startTime: "2026-03-20T13:00:00Z", endTime: "2026-03-20T17:00:00Z", maxAlt: 400, area: "Texas Pipeline Corridor" },
  { id: "UTM-003", gufi: "urn:uuid:b58d2ec1-9f3b-5c8g-0e2d-6f4g7b9c1d2e", title: "Solar Farm Inspection", state: "proposed", operationType: "VLOS", priority: "low", droneName: "Skydio X10", pilotName: "Robert Chen", startTime: "2026-03-21T08:00:00Z", endTime: "2026-03-21T12:00:00Z", maxAlt: 150, area: "West Mesa Solar" },
  { id: "UTM-004", gufi: "urn:uuid:c69e3fd2-0g4c-6d9h-1f3e-7g5h8c0d2e3f", title: "Medical Delivery Route Delta", state: "activated", operationType: "BVLOS", priority: "emergency", droneName: "Wing X1 Delivery", pilotName: "Aisha Patel", startTime: "2026-03-20T10:15:00Z", endTime: "2026-03-20T10:45:00Z", maxAlt: 120, area: "Austin Medical District" },
];

const priorityDots: Record<string, string> = { low: "bg-gray-400", medium: "bg-yellow-500", high: "bg-orange-500", emergency: "bg-red-500" };

export default function UTMPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">UTM Network</h1>
          <p className="text-sm text-muted-foreground mt-1">GUFI operations, deconfliction, conformance monitoring</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Submit Operation
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Operations", value: mockOperations.filter(o => o.state === "activated").length, icon: Radar, color: "text-green-600" },
          { label: "Pending Acceptance", value: mockOperations.filter(o => o.state === "proposed").length, icon: Clock, color: "text-blue-600" },
          { label: "Non-Conforming", value: 0, icon: AlertTriangle, color: "text-orange-600" },
          { label: "USS Connected", value: 3, icon: Server, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockOperations.map(op => (
          <div key={op.id} className={cn("bg-card border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer", op.priority === "emergency" ? "border-l-4 border-l-red-500 border-red-200" : "border-border")}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{op.title}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", stateConfig[op.state].bg, stateConfig[op.state].text)}>{stateConfig[op.state].label}</span>
                  <span className="flex items-center gap-1 text-xs"><span className={cn("w-1.5 h-1.5 rounded-full", priorityDots[op.priority])} />{op.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{op.gufi}</p>
              </div>
              <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">{op.operationType}</span>
            </div>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div><span className="text-muted-foreground">Drone</span><p className="font-medium">{op.droneName}</p></div>
              <div><span className="text-muted-foreground">Pilot</span><p className="font-medium">{op.pilotName}</p></div>
              <div><span className="text-muted-foreground">Area</span><p className="font-medium">{op.area}</p></div>
              <div><span className="text-muted-foreground">Max Alt</span><p className="font-medium">{op.maxAlt} ft AGL</p></div>
              <div><span className="text-muted-foreground">Window</span><p className="font-medium text-xs">{new Date(op.startTime).toLocaleTimeString()} – {new Date(op.endTime).toLocaleTimeString()}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
