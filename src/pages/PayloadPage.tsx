import { useState } from "react";
import { Camera, Thermometer, Radar, Package, Settings, Cpu, Wrench, Calendar, Clock, AlertTriangle, CheckCircle, Shield, Plus, Search, Filter, Eye, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payload {
  id: string; name: string; type: string; manufacturer: string; model: string; serialNumber: string;
  weight: number; status: "available" | "mounted" | "maintenance" | "retired";
  currentDrone?: string; totalFlightHours: number; totalMissions: number; cost: number;
  calibration: { lastCalibrated: string; nextDue: string };
  firmware: { version: string; updateAvailable: boolean };
}

const statusConfig = {
  available: { label: "Available", bg: "bg-green-50", text: "text-green-700" },
  mounted: { label: "Mounted", bg: "bg-blue-50", text: "text-blue-700" },
  maintenance: { label: "Maintenance", bg: "bg-amber-50", text: "text-amber-700" },
  retired: { label: "Retired", bg: "bg-gray-100", text: "text-gray-600" },
};

const mockPayloads: Payload[] = [
  { id: "PLD-001", name: "Zenmuse H20T", type: "Camera + Thermal", manufacturer: "DJI", model: "H20T", serialNumber: "ZH20T-2025-00142", weight: 828, status: "mounted", currentDrone: "Matrice 350 RTK", totalFlightHours: 412, totalMissions: 289, cost: 10999, calibration: { lastCalibrated: "2026-02-10", nextDue: "2026-05-10" }, firmware: { version: "v01.03.0510", updateAvailable: true } },
  { id: "PLD-002", name: "Zenmuse L2", type: "LiDAR", manufacturer: "DJI", model: "L2", serialNumber: "ZL2-2025-00088", weight: 905, status: "available", totalFlightHours: 186, totalMissions: 94, cost: 14500, calibration: { lastCalibrated: "2026-01-15", nextDue: "2026-04-15" }, firmware: { version: "v02.01.0312", updateAvailable: false } },
  { id: "PLD-003", name: "MicaSense RedEdge-P", type: "Multispectral", manufacturer: "MicaSense", model: "RedEdge-P", serialNumber: "RE-P-2025-01245", weight: 230, status: "available", totalFlightHours: 340, totalMissions: 178, cost: 5600, calibration: { lastCalibrated: "2026-03-01", nextDue: "2026-06-01" }, firmware: { version: "v5.4.2", updateAvailable: false } },
  { id: "PLD-004", name: "FLIR Vue TZ20-R", type: "Thermal", manufacturer: "Teledyne FLIR", model: "Vue TZ20-R", serialNumber: "FV-TZ-2024-00890", weight: 445, status: "maintenance", totalFlightHours: 560, totalMissions: 312, cost: 8200, calibration: { lastCalibrated: "2025-12-20", nextDue: "2026-03-20" }, firmware: { version: "v3.2.0", updateAvailable: true } },
  { id: "PLD-005", name: "DJI Zenmuse P1", type: "Photogrammetry", manufacturer: "DJI", model: "P1", serialNumber: "ZP1-2025-00456", weight: 793, status: "mounted", currentDrone: "Matrice 350 RTK", totalFlightHours: 224, totalMissions: 67, cost: 9200, calibration: { lastCalibrated: "2026-02-28", nextDue: "2026-05-28" }, firmware: { version: "v04.01.00.80", updateAvailable: false } },
];

export default function PayloadPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payload Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Sensor inventory, weight configurations, CG analysis</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Add Payload
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Payloads", value: mockPayloads.length, icon: Package, color: "text-blue-600" },
          { label: "Mounted", value: mockPayloads.filter(p => p.status === "mounted").length, icon: Cpu, color: "text-green-600" },
          { label: "Calibration Due", value: mockPayloads.filter(p => new Date(p.calibration.nextDue) <= new Date("2026-04-01")).length, icon: Wrench, color: "text-amber-600" },
          { label: "FW Updates", value: mockPayloads.filter(p => p.firmware.updateAvailable).length, icon: AlertTriangle, color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payloads…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockPayloads.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
          <div key={p.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[p.status].bg, statusConfig[p.status].text)}>{statusConfig[p.status].label}</span>
                  {p.firmware.updateAvailable && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Update Available</span>}
                </div>
                <p className="text-xs text-muted-foreground">{p.manufacturer} · {p.type} · {p.serialNumber}</p>
              </div>
              <span className="text-sm font-medium text-muted-foreground">${p.cost.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div><span className="text-muted-foreground">Weight</span><p className="font-medium">{p.weight}g</p></div>
              <div><span className="text-muted-foreground">Flight Hours</span><p className="font-medium">{p.totalFlightHours}h</p></div>
              <div><span className="text-muted-foreground">Missions</span><p className="font-medium">{p.totalMissions}</p></div>
              <div><span className="text-muted-foreground">Firmware</span><p className="font-medium font-mono text-xs">{p.firmware.version}</p></div>
              <div><span className="text-muted-foreground">Cal Due</span><p className="font-medium">{p.calibration.nextDue}</p></div>
              <div><span className="text-muted-foreground">Mounted On</span><p className="font-medium">{p.currentDrone ?? "—"}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
