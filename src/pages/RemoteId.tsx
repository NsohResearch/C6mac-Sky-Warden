import { Radio, CheckCircle2, AlertTriangle, Signal, MapPin } from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

const broadcasts = [
  { droneId: "C6M-001", method: "Broadcast", lat: "34.0522", lon: "-118.2437", altitude: "280 ft", speed: "12 kts", heading: "045°", compliant: true, lastUpdate: "2s ago" },
  { droneId: "C6M-007", method: "Network", lat: "33.7490", lon: "-118.1940", altitude: "400 ft", speed: "8 kts", heading: "190°", compliant: true, lastUpdate: "4s ago" },
  { droneId: "C6M-012", method: "Broadcast", lat: "33.9425", lon: "-118.4081", altitude: "150 ft", speed: "15 kts", heading: "270°", compliant: true, lastUpdate: "6s ago" },
  { droneId: "C6M-019", method: "Broadcast", lat: "34.0195", lon: "-118.4912", altitude: "350 ft", speed: "3 kts", heading: "310°", compliant: false, lastUpdate: "32s ago" },
];

export default function RemoteId() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Remote ID Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">14 CFR Part 89 compliance — broadcast & network methods</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Broadcasting" value="4" change="All in-flight drones" icon={Radio} delay={80} />
        <StatCard label="Compliant" value="3/4" change="75% fleet compliance" changeType="positive" icon={CheckCircle2} delay={160} />
        <StatCard label="Network RID" value="1" change="Server-side relay" icon={Signal} delay={240} />
        <StatCard label="Non-Compliant" value="1" change="Stale broadcast" changeType="negative" icon={AlertTriangle} delay={320} />
      </div>

      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-4">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Live Broadcasts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Drone</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Method</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Position</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Alt</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Speed / Heading</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((b) => (
                <tr key={b.droneId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground mono">{b.droneId}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      b.method === "Broadcast" ? "bg-accent/10 text-accent" : "bg-info/10 text-info"
                    }`}>{b.method}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground mono tabular">
                    {b.lat}, {b.lon}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular">{b.altitude}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular">{b.speed} / {b.heading}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={b.compliant ? "active" : "error"}>
                      {b.compliant ? "Compliant" : "Non-Compliant"}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground tabular">{b.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
