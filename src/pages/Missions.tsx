import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ChevronRight, Plus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Mission {
  id: string;
  title: string;
  status: string;
  mission_type: string;
  max_altitude_ft: number | null;
  risk_score: number | null;
  scheduled_start: string | null;
  actual_start: string | null;
  created_at: string;
  description: string | null;
  drone_id: string | null;
  pilot_id: string | null;
}

function RiskIndicator({ score }: { score: number | null }) {
  if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
  const color = score <= 2 ? "text-success" : score <= 4 ? "text-warning" : "text-destructive";
  return <span className={`text-xs font-semibold tabular ${color}`}>{score.toFixed(1)}</span>;
}

export default function Missions() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", mission_type: "survey", max_altitude_ft: 400, description: "" });

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["missions-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as unknown as Mission[];
    },
  });

  const createMission = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { error } = await supabase.from("missions").insert({
        tenant_id: profile.tenant_id,
        title: form.title,
        mission_type: form.mission_type,
        max_altitude_ft: form.max_altitude_ft,
        description: form.description || null,
        region: profile.region || "US",
        pilot_id: profile.id,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions-list"] });
      setShowNew(false);
      setForm({ title: "", mission_type: "survey", max_altitude_ft: 400, description: "" });
      toast.success("Mission created");
    },
    onError: (e) => toast.error(e.message),
  });

  const activeCount = missions.filter((m) => m.status === "active" || m.status === "in_progress").length;
  const pendingCount = missions.filter((m) => m.status === "draft" || m.status === "pending").length;

  const statusMap: Record<string, "active" | "approved" | "pending" | "denied" | "neutral" | "warning" | "error"> = {
    active: "active", in_progress: "active", draft: "neutral", completed: "approved",
    cancelled: "denied", pending: "pending", aborted: "error",
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between animate-reveal-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mission Planning</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeCount} active, {pendingCount} pending
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.97] shadow-card">
          <Plus className="w-4 h-4" /> New Mission
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Mission</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Alt</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Risk</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Created</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</td></tr>
              ) : missions.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">No missions yet. Create your first mission to get started.</td></tr>
              ) : missions.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-foreground">{m.title}</div>
                    <div className="text-xs text-muted-foreground mono mt-0.5">{m.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground capitalize">{m.mission_type}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground tabular">{m.max_altitude_ft ?? "—"} ft</td>
                  <td className="px-5 py-3.5"><RiskIndicator score={m.risk_score} /></td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={statusMap[m.status] ?? "neutral"}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1).replace(/_/g, " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-3.5">
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Mission</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Infrastructure Survey — Downtown" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mission Type</label>
              <select value={form.mission_type} onChange={(e) => setForm({ ...form, mission_type: e.target.value })} className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30">
                <option value="survey">Survey</option>
                <option value="inspection">Inspection</option>
                <option value="mapping">Mapping</option>
                <option value="security">Security</option>
                <option value="delivery">Delivery</option>
                <option value="emergency">Emergency</option>
                <option value="visual">Visual / Photography</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Altitude (ft AGL)</label>
              <input type="number" value={form.max_altitude_ft} onChange={(e) => setForm({ ...form, max_altitude_ft: parseInt(e.target.value) || 400 })} className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground tabular outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional mission details…" className="w-full rounded-md bg-muted px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 resize-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button
                onClick={() => createMission.mutate()}
                disabled={!form.title || createMission.isPending}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
              >
                {createMission.isPending ? "Creating…" : "Create Mission"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
