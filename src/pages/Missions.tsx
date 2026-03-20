import { Navigation, Clock, MapPin, ChevronRight, Plus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

const missions = [
  { id: "MSN-2847", name: "Infrastructure Survey — Downtown", status: "active" as const, pilot: "R. Vasquez", drone: "C6M-001", startTime: "10:24 UTC", duration: "47 min", altitude: "280 ft AGL", riskScore: 2.1 },
  { id: "MSN-2846", name: "Harbor Security Patrol", status: "active" as const, pilot: "T. Chen", drone: "C6M-007", startTime: "09:15 UTC", duration: "1 hr 56 min", altitude: "400 ft AGL", riskScore: 1.8 },
  { id: "MSN-2845", name: "Industrial Site Mapping", status: "pending" as const, pilot: "M. Okafor", drone: "C6M-012", startTime: "—", duration: "Est. 45 min", altitude: "150 ft AGL", riskScore: 3.4 },
  { id: "MSN-2844", name: "Emergency Response — Riverfront", status: "active" as const, pilot: "S. Patel", drone: "C6M-019", startTime: "08:02 UTC", duration: "3 hr 9 min", altitude: "350 ft AGL", riskScore: 4.2 },
  { id: "MSN-2843", name: "Campus Photography", status: "denied" as const, pilot: "L. Martinez", drone: "C6M-023", startTime: "—", duration: "—", altitude: "200 ft AGL", riskScore: 5.7 },
  { id: "MSN-2841", name: "Perimeter Check — Facility A", status: "approved" as const, pilot: "K. Nguyen", drone: "C6M-003", startTime: "—", duration: "Est. 30 min", altitude: "120 ft AGL", riskScore: 1.2 },
];

function RiskIndicator({ score }: { score: number }) {
  const color = score <= 2 ? "text-success" : score <= 4 ? "text-warning" : "text-destructive";
  return <span className={`text-xs font-semibold tabular ${color}`}>{score.toFixed(1)}</span>;
}

export default function Missions() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between animate-reveal-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mission Planning</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {missions.filter(m => m.status === "active").length} active, {missions.filter(m => m.status === "pending").length} pending approval
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.97] shadow-card">
          <Plus className="w-4 h-4" />
          New Mission
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Mission</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Pilot / Drone</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Start</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Duration</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Alt</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Risk</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-foreground">{m.name}</div>
                    <div className="text-xs text-muted-foreground mono mt-0.5">{m.id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-foreground">{m.pilot}</div>
                    <div className="text-xs text-muted-foreground mono">{m.drone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground tabular">{m.startTime}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground tabular">{m.duration}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground tabular">{m.altitude}</td>
                  <td className="px-5 py-3.5"><RiskIndicator score={m.riskScore} /></td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={m.status}>{m.status.charAt(0).toUpperCase() + m.status.slice(1)}</StatusBadge>
                  </td>
                  <td className="px-3 py-3.5">
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
