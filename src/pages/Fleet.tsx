import { Plane, Battery, Signal, Wrench, MapPin, Radio } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

const drones = [
  { id: "C6M-001", model: "DJI M350 RTK", status: "active" as const, battery: 87, signal: "Strong", location: "Downtown Corridor", pilot: "R. Vasquez", remoteId: true },
  { id: "C6M-007", model: "Autel EVO II", status: "active" as const, battery: 62, signal: "Strong", location: "Harbor District", pilot: "T. Chen", remoteId: true },
  { id: "C6M-012", model: "Skydio X10", status: "active" as const, battery: 43, signal: "Moderate", location: "Industrial Park E", pilot: "M. Okafor", remoteId: true },
  { id: "C6M-019", model: "DJI M30T", status: "warning" as const, battery: 14, signal: "Weak", location: "Riverfront Zone", pilot: "S. Patel", remoteId: true },
  { id: "C6M-023", model: "DJI Matrice 300", status: "neutral" as const, battery: 100, signal: "—", location: "Hangar B", pilot: "Unassigned", remoteId: true },
  { id: "C6M-042", model: "Autel Dragonfish", status: "error" as const, battery: 0, signal: "—", location: "Maintenance Bay", pilot: "—", remoteId: false },
];

function BatteryIndicator({ level }: { level: number }) {
  const color = level > 50 ? "bg-success" : level > 20 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular w-8">{level}%</span>
    </div>
  );
}

export default function Fleet() {
  const activeCount = drones.filter(d => d.status === "active").length;
  const maintenanceCount = drones.filter(d => d.status === "error").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Fleet Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {drones.length} drones — {activeCount} active, {maintenanceCount} in maintenance
        </p>
      </div>

      {/* Fleet grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {drones.map((drone, i) => (
          <div
            key={drone.id}
            className="bg-card rounded-lg shadow-card hover:shadow-card-hover p-5 transition-shadow duration-200 animate-reveal-up"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground mono">{drone.id}</span>
                  {drone.remoteId && (
                    <Radio className="w-3.5 h-3.5 text-success" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{drone.model}</p>
              </div>
              <StatusBadge status={drone.status}>
                {drone.status === "active" ? "In Flight" :
                 drone.status === "warning" ? "Low Battery" :
                 drone.status === "error" ? "Maintenance" : "Standby"}
              </StatusBadge>
            </div>

            <div className="space-y-2.5 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Battery className="w-3.5 h-3.5" />
                  Battery
                </div>
                <BatteryIndicator level={drone.battery} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Signal className="w-3.5 h-3.5" />
                  Signal
                </div>
                <span className="text-xs text-foreground">{drone.signal}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  Location
                </div>
                <span className="text-xs text-foreground">{drone.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Plane className="w-3.5 h-3.5" />
                  Pilot
                </div>
                <span className="text-xs text-foreground">{drone.pilot}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
