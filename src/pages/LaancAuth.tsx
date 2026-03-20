import { Shield, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, FileText } from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

const authorizations = [
  { id: "LAANC-C6M-2847-A", type: "Near-Real-Time", area: "Class B — Metro Airport", altitude: "280 ft AGL", maxGrid: "300 ft", status: "approved" as const, time: "12 min ago", pilot: "R. Vasquez" },
  { id: "LAANC-C6M-2846-A", type: "Near-Real-Time", area: "Class D — Regional Field", altitude: "400 ft AGL", maxGrid: "400 ft", status: "approved" as const, time: "1 hr ago", pilot: "T. Chen" },
  { id: "LAANC-C6M-2845-A", type: "Further Coordination", area: "Class B — Metro Airport", altitude: "350 ft AGL", maxGrid: "200 ft", status: "pending" as const, time: "2 hr ago", pilot: "M. Okafor" },
  { id: "LAANC-C6M-2843-A", type: "Near-Real-Time", area: "Class D — Regional Field", altitude: "200 ft AGL", maxGrid: "400 ft", status: "denied" as const, time: "5 hr ago", pilot: "L. Martinez" },
  { id: "LAANC-C6M-2840-A", type: "Near-Real-Time", area: "Class E — Transition Area", altitude: "120 ft AGL", maxGrid: "400 ft", status: "approved" as const, time: "Yesterday", pilot: "K. Nguyen" },
];

export default function LaancAuth() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">LAANC Authorization</h1>
        <p className="text-sm text-muted-foreground mt-1">Low Altitude Authorization and Notification Capability</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value="142" change="This month" icon={FileText} delay={80} />
        <StatCard label="Approved" value="128" change="90.1% rate" changeType="positive" icon={CheckCircle2} delay={160} />
        <StatCard label="Pending Review" value="6" change="Avg 4.2 hr" changeType="neutral" icon={Clock} delay={240} />
        <StatCard label="Denied" value="8" change="5.6% rate" changeType="negative" icon={XCircle} delay={320} />
      </div>

      {/* Auth process */}
      <div className="bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Authorization Flow</h2>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {[
            { label: "Request", desc: "Submit area & altitude" },
            { label: "UASFM Check", desc: "Grid ceiling validation" },
            { label: "Auto-Approve", desc: "At/below max altitude" },
            { label: "Active", desc: "Authorization valid" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <div className="bg-muted rounded-lg px-4 py-3 min-w-[140px]">
                <div className="text-sm font-medium text-foreground">{step.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
              </div>
              {i < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-5">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Authorizations</h2>
          <button className="text-xs font-medium text-accent hover:underline">Request New</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Reference</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Airspace</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Requested / Grid Max</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Pilot</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {authorizations.map((auth) => (
                <tr key={auth.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground mono text-xs">{auth.id}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      auth.type === "Near-Real-Time" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                    }`}>{auth.type}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{auth.area}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular">{auth.altitude} / {auth.maxGrid}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{auth.pilot}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={auth.status}>{auth.status.charAt(0).toUpperCase() + auth.status.slice(1)}</StatusBadge>
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
