import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Clock, Plane } from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(210 70% 50%)",
  "hsl(280 50% 55%)",
  "hsl(var(--destructive))",
];

export default function Analytics() {
  const { data: missions = [] } = useQuery({
    queryKey: ["analytics-missions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("id, mission_type, status, created_at, actual_start, actual_end").limit(500);
      if (error) throw error;
      return data;
    },
  });

  const { data: drones = [] } = useQuery({
    queryKey: ["analytics-drones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drones").select("id, status, total_flight_hours").limit(200);
      if (error) throw error;
      return data;
    },
  });

  const { data: laancAuths = [] } = useQuery({
    queryKey: ["analytics-laanc"],
    queryFn: async () => {
      const { data, error } = await supabase.from("flight_authorizations").select("id, status").limit(500);
      if (error) throw error;
      return data;
    },
  });

  // Monthly flights (last 6 months)
  const monthlyFlights = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const count = missions.filter((m) => {
      const d = new Date(m.created_at);
      return d >= start && d <= end;
    }).length;
    return { month: format(month, "MMM"), flights: count };
  });

  // Mission types breakdown
  const typeMap: Record<string, number> = {};
  missions.forEach((m) => {
    const t = m.mission_type || "other";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const missionTypes = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const totalFlights = missions.length;
  const totalFlightHours = drones.reduce((s, d) => s + Number(d.total_flight_hours ?? 0), 0);
  const avgDuration = totalFlightHours > 0 && totalFlights > 0 ? Math.round((totalFlightHours / totalFlights) * 60) : 0;
  const activeDrones = drones.filter((d) => d.status === "active").length;
  const utilization = drones.length > 0 ? ((activeDrones / drones.length) * 100).toFixed(1) : "0";
  const laancApproved = laancAuths.filter((a) => a.status === "approved").length;
  const laancRate = laancAuths.length > 0 ? ((laancApproved / laancAuths.length) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Fleet performance and operational insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Missions" value={String(totalFlights)} change={`${monthlyFlights[5]?.flights ?? 0} this month`} changeType="positive" icon={Plane} delay={80} />
        <StatCard label="Avg. Duration" value={avgDuration > 0 ? `${avgDuration} min` : "—"} change="Per mission" icon={Clock} delay={160} />
        <StatCard label="Fleet Utilization" value={`${utilization}%`} change={`${activeDrones}/${drones.length} active`} changeType="positive" icon={BarChart3} delay={240} />
        <StatCard label="LAANC Success" value={`${laancRate}%`} change={`${laancApproved} of ${laancAuths.length}`} icon={TrendingUp} delay={320} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Missions</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFlights} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: 12 }} />
                <Bar dataKey="flights" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Mission Types</h2>
          <div className="h-64">
            {missionTypes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No mission data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={missionTypes} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {missionTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" iconSize={8} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
