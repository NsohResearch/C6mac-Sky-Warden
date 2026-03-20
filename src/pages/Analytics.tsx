import { BarChart3, TrendingUp, Clock, Plane } from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const monthlyFlights = [
  { month: "Oct", flights: 87 },
  { month: "Nov", flights: 134 },
  { month: "Dec", flights: 98 },
  { month: "Jan", flights: 156 },
  { month: "Feb", flights: 189 },
  { month: "Mar", flights: 142 },
];

const missionTypes = [
  { name: "Survey", value: 38 },
  { name: "Security", value: 24 },
  { name: "Mapping", value: 18 },
  { name: "Inspection", value: 12 },
  { name: "Emergency", value: 8 },
];

const COLORS = [
  "hsl(36 95% 52%)",
  "hsl(152 60% 40%)",
  "hsl(210 70% 50%)",
  "hsl(280 50% 55%)",
  "hsl(0 72% 51%)",
];

export default function Analytics() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Fleet performance and operational insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Flights" value="806" change="+18.4% vs last quarter" changeType="positive" icon={Plane} delay={80} />
        <StatCard label="Avg. Duration" value="42 min" change="-3 min from avg" changeType="positive" icon={Clock} delay={160} />
        <StatCard label="Fleet Utilization" value="73.2%" change="+5.1% this month" changeType="positive" icon={BarChart3} delay={240} />
        <StatCard label="LAANC Success" value="90.1%" change="128 of 142" icon={TrendingUp} delay={320} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Flights</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFlights} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 89%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220 8% 46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220 8% 46%)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 18% 14%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "hsl(40 20% 95%)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="flights" fill="hsl(36 95% 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Mission Types</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={missionTypes} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {missionTypes.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(220 18% 14%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "hsl(40 20% 95%)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
