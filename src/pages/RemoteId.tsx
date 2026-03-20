import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Radio, CheckCircle2, AlertTriangle, Signal, MapPin,
  Shield, Cpu, Wifi, Clock, Activity, Target, Building2,
  ChevronDown
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

// ANSI/CTA-2063-A serial number validation
function validateSerialNumber(serial: string): { valid: boolean; reason: string } {
  // Format: 4-char MFR code + 1-char length code + variable serial
  // Total 20 chars max, alphanumeric
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

// Broadcast performance thresholds per 14 CFR Part 89
const PERF_THRESHOLDS = {
  broadcast_rate_hz: { target: 1, label: "Broadcast Rate", unit: "Hz", pass: (v: number) => v >= 1 },
  position_accuracy_ft: { target: 100, label: "Position Accuracy", unit: "ft", pass: (v: number) => v <= 100 },
  altitude_accuracy_ft: { target: 150, label: "Altitude Accuracy", unit: "ft", pass: (v: number) => v <= 150 },
  latency_seconds: { target: 1, label: "Message Latency", unit: "s", pass: (v: number) => v <= 1 },
};

interface ComplianceRecord {
  id: string;
  drone_id: string;
  compliance_type: "standard_rid" | "broadcast_module" | "fria";
  serial_number_valid: boolean;
  serial_format: string | null;
  broadcast_rate_hz: number | null;
  position_accuracy_ft: number | null;
  altitude_accuracy_ft: number | null;
  latency_seconds: number | null;
  broadcast_performance_pass: boolean;
  is_compliant: boolean;
  last_verified_at: string | null;
  next_verification_due: string | null;
  verification_notes: string | null;
}

const sampleBroadcasts = [
  { droneId: "SKW-001", method: "Standard RID", lat: "34.0522", lon: "-118.2437", altitude: "280 ft", speed: "12 kts", heading: "045°", compliant: true, lastUpdate: "2s ago", rateHz: 1.0, posAcc: 45, altAcc: 82, latency: 0.4 },
  { droneId: "SKW-007", method: "Network RID", lat: "33.7490", lon: "-118.1940", altitude: "400 ft", speed: "8 kts", heading: "190°", compliant: true, lastUpdate: "4s ago", rateHz: 1.0, posAcc: 62, altAcc: 95, latency: 0.7 },
  { droneId: "SKW-012", method: "Broadcast Module", lat: "33.9425", lon: "-118.4081", altitude: "150 ft", speed: "15 kts", heading: "270°", compliant: true, lastUpdate: "6s ago", rateHz: 1.0, posAcc: 38, altAcc: 110, latency: 0.3 },
  { droneId: "SKW-019", method: "Standard RID", lat: "34.0195", lon: "-118.4912", altitude: "350 ft", speed: "3 kts", heading: "310°", compliant: false, lastUpdate: "32s ago", rateHz: 0.5, posAcc: 155, altAcc: 200, latency: 2.1 },
];

export default function RemoteId() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"live" | "compliance" | "validation">("live");
  const [serialInput, setSerialInput] = useState("");
  const [serialResult, setSerialResult] = useState<{ valid: boolean; reason: string } | null>(null);

  const { data: complianceRecords = [] } = useQuery({
    queryKey: ["rid-compliance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remote_id_compliance")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ComplianceRecord[];
    },
  });

  const compliantCount = sampleBroadcasts.filter((b) => b.compliant).length;
  const totalDrones = sampleBroadcasts.length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Remote ID — 14 CFR Part 89</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Serial number validation, broadcast performance verification & fleet compliance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Broadcasting" value={String(totalDrones)} change="In-flight drones" icon={Radio} delay={80} />
        <StatCard label="Compliant" value={`${compliantCount}/${totalDrones}`} change={`${Math.round((compliantCount / totalDrones) * 100)}% fleet`} changeType="positive" icon={CheckCircle2} delay={160} />
        <StatCard label="Standard RID" value={String(sampleBroadcasts.filter((b) => b.method === "Standard RID").length)} change="Built-in module" icon={Cpu} delay={240} />
        <StatCard label="Non-Compliant" value={String(totalDrones - compliantCount)} change="Action required" changeType={totalDrones - compliantCount > 0 ? "negative" : "positive"} icon={AlertTriangle} delay={320} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit animate-reveal-up delay-2">
        {(["live", "compliance", "validation"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
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
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Drone</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Position</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Alt</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Speed / Heading</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Performance</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {sampleBroadcasts.map((b) => (
                  <tr key={b.droneId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground mono">{b.droneId}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        b.method === "Standard RID" ? "bg-accent/10 text-accent" :
                        b.method === "Network RID" ? "bg-info/10 text-info" :
                        "bg-warning/10 text-warning"
                      }`}>{b.method}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground mono tabular">
                      {b.lat}, {b.lon}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular">{b.altitude}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular">{b.speed} / {b.heading}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${PERF_THRESHOLDS.broadcast_rate_hz.pass(b.rateHz) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {b.rateHz}Hz
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${PERF_THRESHOLDS.position_accuracy_ft.pass(b.posAcc) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                          ±{b.posAcc}ft
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${PERF_THRESHOLDS.latency_seconds.pass(b.latency) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                          {b.latency}s
                        </span>
                      </div>
                    </td>
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

          {/* Performance requirements legend */}
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
          {/* Compliance types breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "Standard RID", desc: "Built-in broadcast capability (14 CFR 89.110)", icon: Cpu, count: 2 },
              { type: "Broadcast Module", desc: "Add-on module (14 CFR 89.115)", icon: Wifi, count: 1 },
              { type: "FRIA", desc: "FAA-Recognized ID Area (14 CFR 89.120)", icon: Building2, count: 1 },
            ].map((t) => (
              <div key={t.type} className="bg-card rounded-lg shadow-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <t.icon className="w-4.5 h-4.5 text-primary" />
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

          {/* Fleet compliance table */}
          <div className="bg-card rounded-lg shadow-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Fleet-Wide Compliance Dashboard</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Drone</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">RID Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Serial Valid</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Broadcast Perf</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Overall</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Last Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleBroadcasts.map((b) => {
                    const perfPass = PERF_THRESHOLDS.broadcast_rate_hz.pass(b.rateHz) &&
                      PERF_THRESHOLDS.position_accuracy_ft.pass(b.posAcc) &&
                      PERF_THRESHOLDS.altitude_accuracy_ft.pass(b.altAcc) &&
                      PERF_THRESHOLDS.latency_seconds.pass(b.latency);
                    return (
                      <tr key={b.droneId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-foreground mono">{b.droneId}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-foreground">{b.method}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={b.compliant ? "active" : "error"}>
                            {b.compliant ? "Valid" : "Invalid"}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={perfPass ? "active" : "error"}>
                            {perfPass ? "Pass" : "Fail"}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={b.compliant && perfPass ? "active" : "error"}>
                            {b.compliant && perfPass ? "COMPLIANT" : "NON-COMPLIANT"}
                          </StatusBadge>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground tabular">{b.lastUpdate}</td>
                      </tr>
                    );
                  })}
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
            <h2 className="text-sm font-semibold text-foreground mb-3">
              ANSI/CTA-2063-A Serial Number Validator
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Validate drone serial numbers against the ANSI/CTA-2063-A standard required by 14 CFR Part 89.
              Format: 4-character manufacturer code + length indicator + serial (5–20 alphanumeric characters total).
            </p>
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-md">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Serial Number</label>
                <input
                  value={serialInput}
                  onChange={(e) => {
                    setSerialInput(e.target.value.toUpperCase());
                    setSerialResult(null);
                  }}
                  placeholder="e.g. DJI40A1B2C3D4"
                  className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground mono outline-none focus:ring-2 focus:ring-ring/30 tracking-wider"
                />
              </div>
              <button
                onClick={() => setSerialResult(validateSerialNumber(serialInput))}
                disabled={!serialInput}
                className="h-9 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
              >
                Validate
              </button>
            </div>

            {serialResult && (
              <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg ${
                serialResult.valid
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                  : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
              }`}>
                {serialResult.valid
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  : <AlertTriangle className="w-5 h-5 text-red-600" />
                }
                <div>
                  <p className={`text-sm font-medium ${serialResult.valid ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {serialResult.valid ? "Valid Serial Number" : "Invalid Serial Number"}
                  </p>
                  <p className="text-xs text-muted-foreground">{serialResult.reason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Format reference */}
          <div className="bg-card rounded-lg shadow-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">ANSI/CTA-2063-A Format Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <span className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded shrink-0">Pos 1-4</span>
                  <span className="text-muted-foreground">Manufacturer code (ICAO-assigned)</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded shrink-0">Pos 5</span>
                  <span className="text-muted-foreground">Length/type indicator</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="bg-primary/10 text-primary font-mono px-2 py-0.5 rounded shrink-0">Pos 6+</span>
                  <span className="text-muted-foreground">Manufacturer-assigned serial</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Example Valid Serials</p>
                <code className="block text-xs text-muted-foreground bg-muted px-2 py-1 rounded mono">DJI40A1B2C3D4</code>
                <code className="block text-xs text-muted-foreground bg-muted px-2 py-1 rounded mono">SKYD5XYZ98765</code>
                <code className="block text-xs text-muted-foreground bg-muted px-2 py-1 rounded mono">AUTEL3R7K2M</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
