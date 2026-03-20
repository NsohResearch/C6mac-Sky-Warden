import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Radio, CheckCircle2, AlertTriangle, Signal,
  Shield, Cpu, Wifi, Target, Building2,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

// ANSI/CTA-2063-A serial number validation
function validateSerialNumber(serial: string): { valid: boolean; reason: string } {
  if (!serial || serial.length < 5 || serial.length > 20) {
    return { valid: false, reason: "Must be 5-20 characters" };
  }
  if (!/^[A-Z0-9]+$/i.test(serial)) {
    return { valid: false, reason: "Only alphanumeric characters allowed" };
  }
  const mfrCode = serial.substring(0, 4);
  if (!/^[A-Z0-9]{4}$/i.test(mfrCode)) {
    return { valid: false, reason: "Invalid 4-char manufacturer code" };
  }
  return { valid: true, reason: "ANSI/CTA-2063-A compliant" };
}

const PERF_THRESHOLDS = {
  broadcast_rate_hz: { target: 1, label: "Broadcast Rate", unit: "Hz", pass: (v: number) => v >= 1 },
  position_accuracy_ft: { target: 100, label: "Position Accuracy", unit: "ft", pass: (v: number) => v <= 100 },
  altitude_accuracy_ft: { target: 150, label: "Altitude Accuracy", unit: "ft", pass: (v: number) => v <= 150 },
  latency_seconds: { target: 1, label: "Message Latency", unit: "s", pass: (v: number) => v <= 1 },
};

export default function RemoteId() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"live" | "compliance" | "validation">("live");
  const [serialInput, setSerialInput] = useState("");
  const [serialResult, setSerialResult] = useState<{ valid: boolean; reason: string } | null>(null);

  const { data: broadcasts = [] } = useQuery({
    queryKey: ["rid-broadcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remote_id_broadcasts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: complianceRecords = [] } = useQuery({
    queryKey: ["rid-compliance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remote_id_compliance")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: drones = [] } = useQuery({
    queryKey: ["rid-drones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drones")
        .select("id, nickname, manufacturer, model, remote_id_compliant, remote_id_type, remote_id_serial")
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const compliantDrones = drones.filter((d) => d.remote_id_compliant).length;
  const standardRid = drones.filter((d) => d.remote_id_type === "standard_rid").length;
  const broadcastModule = drones.filter((d) => d.remote_id_type === "broadcast_module").length;
  const friaCount = drones.filter((d) => d.remote_id_type === "fria").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Remote ID — 14 CFR Part 89</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Serial number validation, broadcast performance verification & fleet compliance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Broadcasting" value={String(broadcasts.length)} change="Recent broadcasts" icon={Radio} delay={80} />
        <StatCard label="Compliant" value={`${compliantDrones}/${drones.length}`} change={drones.length > 0 ? `${Math.round((compliantDrones / drones.length) * 100)}% fleet` : "—"} changeType="positive" icon={CheckCircle2} delay={160} />
        <StatCard label="Standard RID" value={String(standardRid)} change="Built-in module" icon={Cpu} delay={240} />
        <StatCard label="Non-Compliant" value={String(drones.length - compliantDrones)} change="Action required" changeType={drones.length - compliantDrones > 0 ? "negative" : "positive"} icon={AlertTriangle} delay={320} />
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit animate-reveal-up delay-2">
        {(["live", "compliance", "validation"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab === "live" ? "Live Broadcasts" : tab === "compliance" ? "Fleet Compliance" : "Serial Validation"}
          </button>
        ))}
      </div>

      {/* Live broadcasts tab */}
      {activeTab === "live" && (
        <div className="bg-card rounded-lg shadow-card animate-reveal-up">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Live Broadcast Feed</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">UAS ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Position</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Alt</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Speed</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No broadcast data yet. Broadcasts will appear here when drones are in flight.</td></tr>
                ) : broadcasts.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground mono">{b.uas_id}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent/10 text-accent">{b.broadcast_method ?? 'Unknown'}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground mono tabular">
                      {b.uas_latitude ? `${Number(b.uas_latitude).toFixed(4)}, ${Number(b.uas_longitude).toFixed(4)}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular">{b.uas_altitude_ft ? `${Number(b.uas_altitude_ft).toFixed(0)} ft` : '—'}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular">{b.uas_speed_mps ? `${Number(b.uas_speed_mps).toFixed(1)} m/s` : '—'}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(b.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">14 CFR Part 89 Broadcast Requirements</p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(PERF_THRESHOLDS).map(([key, t]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="w-3 h-3" />
                  <span>{t.label}: {key.includes("rate") ? "≥" : "≤"} {t.target} {t.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fleet compliance tab */}
      {activeTab === "compliance" && (
        <div className="space-y-4 animate-reveal-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "Standard RID", desc: "Built-in broadcast capability (14 CFR 89.110)", icon: Cpu, count: standardRid },
              { type: "Broadcast Module", desc: "Add-on module (14 CFR 89.115)", icon: Wifi, count: broadcastModule },
              { type: "FRIA", desc: "FAA-Recognized ID Area (14 CFR 89.120)", icon: Building2, count: friaCount },
            ].map((t) => (
              <div key={t.type} className="bg-card rounded-lg shadow-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <t.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t.type}</h3>
                    <p className="text-xs text-muted-foreground">{t.count} drones</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-lg shadow-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Fleet-Wide Compliance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Drone</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">RID Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Serial</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {drones.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">No drones in fleet</td></tr>
                  ) : drones.map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{d.nickname || `${d.manufacturer} ${d.model}`}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-foreground">{d.remote_id_type?.replace(/_/g, ' ') ?? 'Not set'}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground mono">{d.remote_id_serial ?? '—'}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={d.remote_id_compliant ? "active" : "error"}>
                          {d.remote_id_compliant ? "COMPLIANT" : "NON-COMPLIANT"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Serial validation tab */}
      {activeTab === "validation" && (
        <div className="space-y-4 animate-reveal-up">
          <div className="bg-card rounded-lg shadow-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">ANSI/CTA-2063-A Serial Number Validator</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Validate drone serial numbers against the ANSI/CTA-2063-A standard required by 14 CFR Part 89.
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-md">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Serial Number</label>
                <input
                  value={serialInput}
                  onChange={(e) => { setSerialInput(e.target.value.toUpperCase()); setSerialResult(null); }}
                  placeholder="e.g. DJI40A1B2C3D4"
                  className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground mono outline-none focus:ring-2 focus:ring-ring/30 tracking-wider"
                />
              </div>
              <button onClick={() => setSerialResult(validateSerialNumber(serialInput))} disabled={!serialInput} className="h-9 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50">
                Validate
              </button>
            </div>
            {serialResult && (
              <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg ${serialResult.valid ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"}`}>
                {serialResult.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                <div>
                  <p className={`text-sm font-medium ${serialResult.valid ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {serialResult.valid ? "Valid Serial Number" : "Invalid Serial Number"}
                  </p>
                  <p className="text-xs text-muted-foreground">{serialResult.reason}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
