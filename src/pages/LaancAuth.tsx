import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Clock, CheckCircle2, XCircle, ArrowRight, FileText, AlertTriangle } from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

export default function LaancAuth() {
  const queryClient = useQueryClient();
  const { data: authorizations = [], isLoading } = useQuery({
    queryKey: ["laanc-authorizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flight_authorizations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "approved" | "denied" }) => {
      const { error } = await supabase
        .from("flight_authorizations")
        .update({
          status: decision,
          decided_at: new Date().toISOString(),
          reviewed_by: "human-reviewer",
        })
        .eq("id", id);
      if (error) throw error;
      // Mirror to mission
      const { data: auth } = await supabase.from("flight_authorizations").select("operation_area, tenant_id").eq("id", id).maybeSingle();
      if (auth) {
        await supabase.from("missions").update({ authorization_status: decision }).eq("laanc_authorization_id", id);
      }
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ["laanc-authorizations"] });
      toast.success(vars.decision === "approved" ? "Authorization approved" : "Authorization denied");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const approvedCount = authorizations.filter((a) => a.status === "approved").length;
  const pendingCount = authorizations.filter((a) => a.status === "pending").length;
  const deniedCount = authorizations.filter((a) => a.status === "denied" || a.status === "rejected").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">LAANC Authorization</h1>
        <p className="text-sm text-muted-foreground mt-1">Low Altitude Authorization and Notification Capability</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={String(authorizations.length)} change="All time" icon={FileText} delay={80} />
        <StatCard label="Approved" value={String(approvedCount)} change={authorizations.length > 0 ? `${((approvedCount / authorizations.length) * 100).toFixed(1)}% rate` : "—"} changeType="positive" icon={CheckCircle2} delay={160} />
        <StatCard label="Pending Review" value={String(pendingCount)} change="Awaiting response" changeType="neutral" icon={Clock} delay={240} />
        <StatCard label="Denied" value={String(deniedCount)} change={authorizations.length > 0 ? `${((deniedCount / authorizations.length) * 100).toFixed(1)}% rate` : "—"} changeType={deniedCount > 0 ? "negative" : "positive"} icon={XCircle} delay={320} />
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

      {/* Escalation queue */}
      {authorizations.some((a) => a.status === "pending") && (
        <div className="bg-card rounded-lg shadow-card border border-warning/30">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-semibold text-foreground">Escalations — Awaiting Human Review</h2>
          </div>
          <div className="divide-y divide-border">
            {authorizations.filter((a) => a.status === "pending").map((auth) => (
              <div key={auth.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium">{auth.reference_code}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning uppercase tracking-wide">
                      {auth.authorization_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1">
                    {auth.requested_altitude_ft} ft requested{auth.airspace_class ? ` · Class ${auth.airspace_class}` : ''}
                    {auth.facility_id ? ` · ${auth.facility_id}` : ''}
                  </p>
                  {auth.denial_reason && (
                    <p className="text-xs text-muted-foreground mt-1">{auth.denial_reason}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => decide.mutate({ id: auth.id, decision: "denied" })}
                    disabled={decide.isPending}
                    className="px-3 py-1.5 rounded text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => decide.mutate({ id: auth.id, decision: "approved" })}
                    disabled={decide.isPending}
                    className="px-3 py-1.5 rounded text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-5">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Authorization History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Reference</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Airspace</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Requested / Approved</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Reviewed By</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</td></tr>
              ) : authorizations.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">No LAANC authorizations yet</td></tr>
              ) : authorizations.map((auth) => {
                const statusMap: Record<string, "approved" | "pending" | "denied" | "active" | "neutral"> = {
                  approved: "approved", pending: "pending", denied: "denied", rejected: "denied", active: "active", expired: "neutral",
                };
                return (
                  <tr key={auth.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-medium text-foreground mono">{auth.reference_code}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        auth.authorization_type === "near_real_time" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                      }`}>{auth.authorization_type?.replace(/_/g, ' ') ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{auth.airspace_class ? `Class ${auth.airspace_class}` : '—'}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground tabular">{auth.requested_altitude_ft} ft{auth.approved_altitude_ft ? ` / ${auth.approved_altitude_ft} ft` : ''}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={statusMap[auth.status] ?? "neutral"}>
                        {auth.status.charAt(0).toUpperCase() + auth.status.slice(1)}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{auth.reviewed_by ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(auth.created_at).toLocaleDateString()}</td>
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
