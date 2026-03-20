import {
  Plane,
  Navigation,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const flightData = [
  { date: "Mar 1", flights: 12 },
  { date: "Mar 5", flights: 18 },
  { date: "Mar 8", flights: 7 },
  { date: "Mar 12", flights: 24 },
  { date: "Mar 15", flights: 31 },
  { date: "Mar 17", flights: 19 },
  { date: "Mar 20", flights: 27 },
];

const recentMissions = [
  { id: "MSN-2847", location: "Downtown Corridor", status: "active" as const, pilot: "R. Vasquez", altitude: "280 ft AGL", time: "12 min ago" },
  { id: "MSN-2846", location: "Harbor District", status: "approved" as const, pilot: "T. Chen", altitude: "400 ft AGL", time: "1 hr ago" },
  { id: "MSN-2845", location: "Industrial Park E", status: "pending" as const, pilot: "M. Okafor", altitude: "150 ft AGL", time: "2 hr ago" },
  { id: "MSN-2844", location: "Riverfront Zone", status: "active" as const, pilot: "S. Patel", altitude: "350 ft AGL", time: "3 hr ago" },
  { id: "MSN-2843", location: "University Campus", status: "denied" as const, pilot: "L. Martinez", altitude: "200 ft AGL", time: "5 hr ago" },
];

const alerts = [
  { type: "warning" as const, message: "TFR active near Downtown Corridor — FDC 4/2847", time: "8 min ago" },
  { type: "info" as const, message: "UASFM updated — new grid ceilings effective Apr 3", time: "1 hr ago" },
  { type: "error" as const, message: "Drone C6M-042 battery below 15% — RTL initiated", time: "2 hr ago" },
];

export default function Dashboard() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
          Flight Operations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          March 20, 2026 — All systems operational
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Flights" value="7" change="+3 from yesterday" changeType="positive" icon={Navigation} delay={80} />
        <StatCard label="Fleet Status" value="23/28" change="5 in maintenance" changeType="neutral" icon={Plane} delay={160} />
        <StatCard label="LAANC Approvals" value="142" change="+12% this month" changeType="positive" icon={Shield} delay={240} />
        <StatCard label="Active TFRs" value="3" change="1 new today" changeType="negative" icon={AlertTriangle} delay={320} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight activity chart */}
        <div className="lg:col-span-2 bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Flight Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Flights per day — March 2026</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-success font-medium tabular">
              <TrendingUp className="w-3.5 h-3.5" />
              +18.4%
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flightData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="flightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(36 95% 52%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(36 95% 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 89%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 8% 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220 8% 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 18% 14%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "hsl(40 20% 95%)",
                    fontSize: 12,
                    boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.3)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="flights"
                  stroke="hsl(36 95% 52%)"
                  strokeWidth={2}
                  fill="url(#flightGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Active Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  alert.type === "warning" ? "bg-warning/10" :
                  alert.type === "error" ? "bg-destructive/10" : "bg-info/10"
                }`}>
                  <AlertTriangle className={`w-3 h-3 ${
                    alert.type === "warning" ? "text-warning" :
                    alert.type === "error" ? "text-destructive" : "text-info"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-foreground leading-snug">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent missions table */}
      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Missions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Mission</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Location</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Pilot</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Altitude</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentMissions.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground mono">{m.id}</td>
                  <td className="px-5 py-3 text-sm text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {m.location}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{m.pilot}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular">{m.altitude}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={m.status}>{m.status.charAt(0).toUpperCase() + m.status.slice(1)}</StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{m.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
