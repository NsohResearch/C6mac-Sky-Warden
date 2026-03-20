import { useState } from "react";
import { Shield, ShieldAlert, Radar, Radio, Eye, Camera, Wifi, AlertTriangle, Activity, BarChart2, Target, Search, Clock, MapPin, Signal, Zap, Settings, RefreshCw, Play, Square, TrendingUp, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const mockDetections = [
  { id: "DET-001", classification: "unauthorized", threat: "high", droneType: "DJI Mavic Unknown", altitude: 180, speed: 12, heading: 245, lat: 30.2672, lng: -97.7431, firstSeen: "2026-03-20T09:12:00Z", sensor: "RF Scanner Alpha", distance: 450, status: "tracking" },
  { id: "DET-002", classification: "authorized", threat: "none", droneType: "Skydio X10 (Fleet)", altitude: 120, speed: 8, heading: 90, lat: 30.2704, lng: -97.7395, firstSeen: "2026-03-20T09:05:00Z", sensor: "ADS-B Receiver", distance: 200, status: "identified" },
  { id: "DET-003", classification: "unknown", threat: "medium", droneType: "Unknown Multirotor", altitude: 300, speed: 0, heading: 0, lat: 30.2650, lng: -97.7480, firstSeen: "2026-03-20T09:18:00Z", sensor: "Radar Unit Bravo", distance: 820, status: "investigating" },
];

const mockSensors = [
  { id: "SEN-001", name: "RF Scanner Alpha", type: "RF Detection", status: "active", range: 2000, detections: 12, lastDetection: "2 min ago", uptime: 99.2 },
  { id: "SEN-002", name: "ADS-B Receiver", type: "ADS-B", status: "active", range: 5000, detections: 48, lastDetection: "5 min ago", uptime: 99.8 },
  { id: "SEN-003", name: "Radar Unit Bravo", type: "Radar", status: "active", range: 3000, detections: 8, lastDetection: "1 min ago", uptime: 97.5 },
  { id: "SEN-004", name: "Acoustic Array Charlie", type: "Acoustic", status: "maintenance", range: 500, detections: 3, lastDetection: "2 hours ago", uptime: 85.1 },
];

const threatColors: Record<string, string> = { none: "bg-green-500", low: "bg-blue-400", medium: "bg-yellow-500", high: "bg-orange-500", critical: "bg-red-500" };
const classColors: Record<string, { bg: string; text: string }> = {
  authorized: { bg: "bg-green-50", text: "text-green-700" }, unknown: { bg: "bg-yellow-50", text: "text-yellow-700" }, unauthorized: { bg: "bg-red-50", text: "text-red-700" },
};

type TabId = "detections" | "sensors";

export default function CounterUASPage() {
  const [tab, setTab] = useState<TabId>("detections");
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Counter-UAS</h1><p className="text-sm text-muted-foreground mt-1">Drone detection, sensor network, threat classification</p></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Detections", value: mockDetections.length, icon: Radar, color: "text-blue-600" },
          { label: "Threats", value: mockDetections.filter(d => d.threat !== "none").length, icon: ShieldAlert, color: "text-red-600" },
          { label: "Sensors Online", value: mockSensors.filter(s => s.status === "active").length, icon: Radio, color: "text-green-600" },
          { label: "Total Detections", value: mockSensors.reduce((s, sen) => s + sen.detections, 0), icon: Activity, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-1 border-b border-border">
        {(["detections", "sensors"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>
      {tab === "detections" && mockDetections.map(d => (
        <div key={d.id} className={cn("bg-card border rounded-lg p-4", d.threat === "high" ? "border-l-4 border-l-red-500 border-red-200" : "border-border")}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={cn("w-2.5 h-2.5 rounded-full", threatColors[d.threat])} />
              <h3 className="font-semibold">{d.droneType}</h3>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", classColors[d.classification]?.bg, classColors[d.classification]?.text)}>{d.classification}</span>
            </div>
            <span className="text-xs text-muted-foreground">{d.status}</span>
          </div>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div><span className="text-muted-foreground">Alt</span><p className="font-medium">{d.altitude} ft</p></div>
            <div><span className="text-muted-foreground">Speed</span><p className="font-medium">{d.speed} m/s</p></div>
            <div><span className="text-muted-foreground">Distance</span><p className="font-medium">{d.distance}m</p></div>
            <div><span className="text-muted-foreground">Sensor</span><p className="font-medium">{d.sensor}</p></div>
            <div><span className="text-muted-foreground">First Seen</span><p className="font-medium">{new Date(d.firstSeen).toLocaleTimeString()}</p></div>
          </div>
        </div>
      ))}
      {tab === "sensors" && (
        <div className="grid grid-cols-2 gap-4">
          {mockSensors.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{s.name}</h3>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", s.status === "active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700")}>{s.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Type</span><p className="font-medium">{s.type}</p></div>
                <div><span className="text-muted-foreground">Range</span><p className="font-medium">{s.range}m</p></div>
                <div><span className="text-muted-foreground">Detections</span><p className="font-medium">{s.detections}</p></div>
                <div><span className="text-muted-foreground">Uptime</span><p className="font-medium">{s.uptime}%</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
