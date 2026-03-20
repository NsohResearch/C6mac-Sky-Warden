import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Plane, Navigation, Shield, AlertTriangle, TrendingUp, MapPin,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function Dashboard() {
  const { profile } = useAuth();

  const { data: drones = [] } = useQuery({
    queryKey: ["dashboard-drones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drones").select("id, status, nickname, manufacturer, model").limit(200);
      if (error) throw error;
      return data;
    },
  });

  const { data: missions = [] } = useQuery({
    queryKey: ["dashboard-missions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("id, title, status, max_altitude_ft, created_at, description, pilot_id")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: laancAuths = [] } = useQuery({
    queryKey: ["dashboard-laanc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_authorizations")
        .select("id, status, created_at")
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const { data: safetyReports = [] } = useQuery({
    queryKey: ["dashboard-safety"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_reports")
        .select("id, title, status, filing_deadline, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Compute stats
  const activeFlights = missions.filter((m) => m.status === "active" || m.status === "in_progress").length;
  const totalDrones = drones.length;
  const activeDrones = drones.filter((d) => d.status === "active").length;
  const maintenanceDrones = drones.filter((d) => d.status === "maintenance" || d.status === "grounded").length;
  const approvedLaanc = laancAuths.filter((a) => a.status === "approved").length;
  const overdueReports = safetyReports.filter(
    (r) => r.filing_deadline && new Date(r.filing_deadline) < new Date() && r.status !== "closed"
  ).length;

  // Build flight activity chart from missions created_at
  const flightData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStr = format(day, "MMM d");
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const count = missions.filter((m) => {
      const d = new Date(m.created_at);
      return d >= dayStart && d < dayEnd;
    }).length;
    return { date: dayStr, flights: count };
  });

  const totalFlightsThisWeek = flightData.reduce((s, d) => s + d.flights, 0);

  // Recent missions for table
  const recentMissions = missions.slice(0, 5);

  // Build alerts from real data
  const alerts: { type: "warning" | "error" | "info"; message: string; time: string }[] = [];
  if (overdueReports > 0) {
    alerts.push({ type: "error", message: `${overdueReports} safety report(s) past 10-day filing deadline`, time: "Action required" });
  }
  if (maintenanceDrones > 0) {
    alerts.push({ type: "warning", message: `${maintenanceDrones} drone(s) in maintenance`, time: "Fleet status" });
  }
  const pendingLaanc = laancAuths.filter((a) => a.status === "pending").length;
  if (pendingLaanc > 0) {
    alerts.push({ type: "info", message: `${pendingLaanc} LAANC authorization(s) pending review`, time: "Awaiting response" });
  }
  if (alerts.length === 0) {
    alerts.push({ type: "info", message: "All systems operational — no active alerts", time: "Now" });
  }

  const today = format(new Date(), "MMMM d, yyyy");

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
          Flight Operations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {today} — {alerts[0].type === "info" && alerts.length === 1 ? "All systems operational" : `${alerts.length} alert(s)`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Flights" value={String(activeFlights)} change={`${totalFlightsThisWeek} this week`} changeType={activeFlights > 0 ? "positive" : "neutral"} icon={Navigation} delay={80} />
        <StatCard label="Fleet Status" value={`${activeDrones}/${totalDrones}`} change={maintenanceDrones > 0 ? `${maintenanceDrones} in maintenance` : "All operational"} changeType={maintenanceDrones > 0 ? "neutral" : "positive"} icon={Plane} delay={160} />
        <StatCard label="LAANC Approvals" value={String(approvedLaanc)} change={`${laancAuths.length} total requests`} changeType="positive" icon={Shield} delay={240} />
        <StatCard label="Safety Reports" value={String(safetyReports.length)} change={overdueReports > 0 ? `${overdueReports} overdue` : "None overdue"} changeType={overdueReports > 0 ? "negative" : "positive"} icon={AlertTriangle} delay={320} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Mission Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Missions created — last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium tabular">
              <TrendingUp className="w-3.5 h-3.5" />
              {totalFlightsThisWeek} total
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flightData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="flightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="flights" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#flightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

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

      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-6">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Missions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Mission</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Altitude</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentMissions.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No missions yet. Create one from the Missions page.</td></tr>
              ) : recentMissions.map((m) => {
                const statusMap: Record<string, "active" | "approved" | "pending" | "denied" | "neutral" | "warning" | "error"> = {
                  active: "active", in_progress: "active", draft: "neutral", completed: "approved",
                  cancelled: "denied", pending: "pending",
                };
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-foreground">{m.title}</div>
                      <div className="text-xs text-muted-foreground mono mt-0.5">{m.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{m.description?.slice(0, 30) || "—"}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular">{m.max_altitude_ft ?? "—"} ft</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={statusMap[m.status] ?? "neutral"}>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
