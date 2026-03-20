import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  AlertTriangle, ShieldAlert, FileWarning, Clock, CheckCircle2,
  Plus, Search, ClipboardList, AlertCircle
} from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type ReportStatus = "draft" | "submitted" | "under_investigation" | "closed" | "overdue";
type ReportType = "mandatory" | "voluntary_nasa_asrs";

interface SafetyReport {
  id: string;
  title: string;
  report_type: ReportType;
  status: ReportStatus;
  incident_date: string;
  filing_deadline: string | null;
  involves_injury: boolean;
  injury_severity: string | null;
  property_damage_usd: number;
  airspace_violation: boolean;
  description: string | null;
  root_cause: string | null;
  corrective_actions: string | null;
  lessons_learned: string | null;
  nasa_asrs_number: string | null;
  nasa_6_conditions_met: boolean;
  enforcement_protection: boolean;
  assigned_to: string | null;
  investigation_notes: unknown[];
  created_at: string;
  location_description: string | null;
}

const NASA_6_CONDITIONS = [
  "Violation was inadvertent and not deliberate",
  "Violation did not involve a criminal offense or accident",
  "Reporter has not been found in violation of FAR in past 5 years",
  "Person demonstrated competency and qualification for certificate held",
  "Corrective action has been taken to prevent recurrence",
  "NASA ASRS report filed within 10 days of the incident",
];

const statusColors: Record<ReportStatus, "warning" | "info" | "active" | "error" | "neutral" | "pending"> = {
  draft: "neutral",
  submitted: "info",
  under_investigation: "warning",
  closed: "active",
  overdue: "error",
};

export default function SafetyReports() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showNewReport, setShowNewReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form, setForm] = useState({
    title: "",
    report_type: "mandatory" as ReportType,
    incident_date: "",
    location_description: "",
    involves_injury: false,
    injury_severity: "",
    property_damage_usd: 0,
    airspace_violation: false,
    description: "",
    nasa_conditions: Array(6).fill(false),
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["safety-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as SafetyReport[];
    },
  });

  const createReport = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const incidentDate = new Date(form.incident_date);
      const filingDeadline = new Date(incidentDate);
      filingDeadline.setDate(filingDeadline.getDate() + 10);
      const autoDetectMandatory =
        (form.involves_injury && ["serious", "fatal"].includes(form.injury_severity)) ||
        form.property_damage_usd >= 500 ||
        form.airspace_violation;
      const allNasaMet = form.nasa_conditions.every(Boolean);
      const { error } = await supabase.from("safety_reports").insert({
        tenant_id: profile.tenant_id,
        reporter_id: profile.id,
        title: form.title,
        report_type: autoDetectMandatory ? "mandatory" : form.report_type,
        incident_date: form.incident_date,
        filing_deadline: filingDeadline.toISOString(),
        location_description: form.location_description,
        involves_injury: form.involves_injury,
        injury_severity: form.injury_severity || null,
        property_damage_usd: form.property_damage_usd,
        airspace_violation: form.airspace_violation,
        description: form.description,
        region: profile.region || "US",
        nasa_6_conditions_met: form.report_type === "voluntary_nasa_asrs" ? allNasaMet : false,
        enforcement_protection: form.report_type === "voluntary_nasa_asrs" && allNasaMet,
        status: "submitted",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-reports"] });
      setShowNewReport(false);
      setForm({ title: "", report_type: "mandatory", incident_date: "", location_description: "", involves_injury: false, injury_severity: "", property_damage_usd: 0, airspace_violation: false, description: "", nasa_conditions: Array(6).fill(false) });
      toast.success("Safety report filed successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = filterStatus === "all" ? reports : reports.filter((r) => r.status === filterStatus);
  const overdueCount = reports.filter((r) => r.filing_deadline && new Date(r.filing_deadline) < new Date() && r.status !== "closed").length;
  const mandatoryTriggerDetected = (form.involves_injury && ["serious", "fatal"].includes(form.injury_severity)) || form.property_damage_usd >= 500 || form.airspace_violation;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between animate-reveal-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Aviation Safety Reporting (ASRP)</h1>
          <p className="text-sm text-muted-foreground mt-1">14 CFR 107.9 mandatory reporting & NASA ASRS voluntary program</p>
        </div>
        <button onClick={() => setShowNewReport(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97]">
          <Plus className="w-4 h-4" /> File Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={String(reports.length)} change="All time" icon={ClipboardList} delay={80} />
        <StatCard label="Under Investigation" value={String(reports.filter((r) => r.status === "under_investigation").length)} change="Active cases" icon={Search} delay={160} />
        <StatCard label="Overdue Filing" value={String(overdueCount)} change="Past 10-day deadline" changeType={overdueCount > 0 ? "negative" : "positive"} icon={Clock} delay={240} />
        <StatCard label="NASA ASRS Filed" value={String(reports.filter((r) => r.report_type === "voluntary_nasa_asrs").length)} change="Voluntary reports" icon={ShieldAlert} delay={320} />
      </div>

      <div className="flex items-center gap-2 animate-reveal-up delay-3">
        {["all", "draft", "submitted", "under_investigation", "closed", "overdue"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {s === "all" ? "All" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Incident Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Deadline</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Triggers</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No safety reports found. File one to get started.</td></tr>
              ) : filtered.map((r) => {
                const isOverdue = r.filing_deadline && new Date(r.filing_deadline) < new Date() && r.status !== "closed";
                return (
                  <tr key={r.id} onClick={() => setSelectedReport(r)} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{r.title}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded ${r.report_type === "mandatory" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{r.report_type === "mandatory" ? "Mandatory" : "NASA ASRS"}</span></td>
                    <td className="px-5 py-3"><StatusBadge status={isOverdue ? "error" : statusColors[r.status]}>{isOverdue ? "OVERDUE" : r.status.replace(/_/g, " ").toUpperCase()}</StatusBadge></td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular">{new Date(r.incident_date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-sm tabular"><span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>{r.filing_deadline ? new Date(r.filing_deadline).toLocaleDateString() : "—"}</span></td>
                    <td className="px-5 py-3"><div className="flex gap-1">{r.involves_injury && <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">Injury</span>}{r.property_damage_usd >= 500 && <span className="text-xs bg-warning/10 text-warning px-1.5 py-0.5 rounded">$500+</span>}{r.airspace_violation && <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">Airspace</span>}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Report Dialog */}
      <Dialog open={showNewReport} onOpenChange={setShowNewReport}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileWarning className="w-5 h-5 text-destructive" /> File Safety Report</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {mandatoryTriggerDetected && form.report_type !== "mandatory" && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div><p className="text-sm font-medium text-destructive">Mandatory Reporting Triggered</p><p className="text-xs text-destructive/80 mt-0.5">Auto-detected per 14 CFR 107.9. This will be filed as mandatory.</p></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Report Type</label><select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value as ReportType })} className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"><option value="mandatory">Mandatory (14 CFR 107.9)</option><option value="voluntary_nasa_asrs">Voluntary (NASA ASRS)</option></select></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Incident Date</label><input type="date" value={form.incident_date} onChange={(e) => setForm({ ...form, incident_date: e.target.value })} className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" /></div>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief incident summary" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label><input value={form.location_description} onChange={(e) => setForm({ ...form, location_description: e.target.value })} placeholder="e.g. 2 miles NW of KLAX" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" /></div>
            <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Mandatory Reporting Triggers (14 CFR 107.9)</p>
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.involves_injury} onChange={(e) => setForm({ ...form, involves_injury: e.target.checked })} className="rounded border-border" /> Involves personal injury</label>
              {form.involves_injury && <select value={form.injury_severity} onChange={(e) => setForm({ ...form, injury_severity: e.target.value })} className="w-full h-8 rounded-md bg-background px-3 text-xs text-foreground outline-none ml-6 max-w-xs"><option value="">Select severity</option><option value="minor">Minor (AIS 1-2)</option><option value="serious">Serious (AIS 3+)</option><option value="fatal">Fatal</option></select>}
              <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.airspace_violation} onChange={(e) => setForm({ ...form, airspace_violation: e.target.checked })} className="rounded border-border" /> Airspace violation</label>
              <div className="flex items-center gap-2"><label className="text-sm text-foreground">Property damage ($):</label><input type="number" value={form.property_damage_usd} onChange={(e) => setForm({ ...form, property_damage_usd: Number(e.target.value) })} className="h-8 w-32 rounded-md bg-background px-3 text-sm text-foreground outline-none tabular" />{form.property_damage_usd >= 500 && <span className="text-xs text-destructive font-medium">≥ $500 threshold</span>}</div>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detailed incident narrative…" className="w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 resize-none" /></div>
            {form.report_type === "voluntary_nasa_asrs" && (
              <div className="space-y-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-xs font-semibold text-accent flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> NASA ASRS 6-Condition Enforcement Protection Check</p>
                {NASA_6_CONDITIONS.map((cond, i) => (
                  <label key={i} className="flex items-start gap-2 text-xs text-foreground"><input type="checkbox" checked={form.nasa_conditions[i]} onChange={() => { const next = [...form.nasa_conditions]; next[i] = !next[i]; setForm({ ...form, nasa_conditions: next }); }} className="rounded border-border mt-0.5" />{cond}</label>
                ))}
                {form.nasa_conditions.every(Boolean) && <div className="flex items-center gap-1.5 mt-1 text-xs text-accent font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> All 6 conditions met — enforcement protection eligible</div>}
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">10-day filing deadline will be calculated from incident date</p>
              <button onClick={() => createReport.mutate()} disabled={!form.title || !form.incident_date || createReport.isPending} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50">{createReport.isPending ? "Filing…" : "Submit Report"}</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader><DialogTitle>{selectedReport.title}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium text-foreground">{selectedReport.report_type === "mandatory" ? "Mandatory (14 CFR 107.9)" : "NASA ASRS Voluntary"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={statusColors[selectedReport.status]}>{selectedReport.status.replace(/_/g, " ").toUpperCase()}</StatusBadge></div>
                  <div><p className="text-xs text-muted-foreground">Incident Date</p><p className="text-sm text-foreground">{new Date(selectedReport.incident_date).toLocaleDateString()}</p></div>
                  <div><p className="text-xs text-muted-foreground">Filing Deadline</p><p className="text-sm text-foreground">{selectedReport.filing_deadline ? new Date(selectedReport.filing_deadline).toLocaleDateString() : "—"}</p></div>
                </div>
                {selectedReport.description && <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm text-foreground bg-muted rounded-lg p-3">{selectedReport.description}</p></div>}
                {selectedReport.enforcement_protection && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20"><ShieldAlert className="w-4 h-4 text-accent" /><p className="text-xs font-medium text-accent">NASA ASRS enforcement protection — all 6 conditions verified</p></div>}
                {selectedReport.root_cause && <div><p className="text-xs text-muted-foreground mb-1">Root Cause</p><p className="text-sm text-foreground">{selectedReport.root_cause}</p></div>}
                {selectedReport.lessons_learned && <div><p className="text-xs text-muted-foreground mb-1">Lessons Learned</p><p className="text-sm text-foreground">{selectedReport.lessons_learned}</p></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}