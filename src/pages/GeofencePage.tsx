import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Shield, ShieldAlert, AlertTriangle, Bell, Plus, Search, Trash2, Lock, Unlock, X, Save, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import DrawableMap, { type DrawableShape } from "@/components/DrawableMap";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type GeofenceType = "no_fly" | "operational_boundary" | "advisory" | "temporary_restriction" | "emergency";
type GeofenceStatus = "active" | "inactive" | "expired" | "pending";
type Enforcement = "hard" | "soft";

const typeConfig: Record<GeofenceType, { label: string; bg: string; text: string; color: string }> = {
  no_fly: { label: "No-Fly Zone", bg: "bg-destructive/10", text: "text-destructive", color: "#EF4444" },
  operational_boundary: { label: "Operational", bg: "bg-info/10", text: "text-info", color: "#3B82F6" },
  advisory: { label: "Advisory", bg: "bg-warning/10", text: "text-warning", color: "#F59E0B" },
  temporary_restriction: { label: "TFR", bg: "bg-warning/20", text: "text-warning", color: "#F97316" },
  emergency: { label: "Emergency", bg: "bg-destructive/20", text: "text-destructive", color: "#DC2626" },
};

interface Geofence {
  id: string; name: string; type: GeofenceType; status: GeofenceStatus;
  enforcement: Enforcement; alt_min_ft: number; alt_max_ft: number;
  source: string; breach_count: number; created_at: string;
  geometry: any; area_sq_meters: number | null;
}

interface Breach {
  id: string; geofence_id: string; drone_id: string | null; severity: string;
  breach_type: string; resolved: boolean; created_at: string;
}

type TabId = "zones" | "alerts" | "map";

export default function GeofencePage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>("map");
  const [search, setSearch] = useState("");
  const [drawOpen, setDrawOpen] = useState(false);
  const [drawnShapes, setDrawnShapes] = useState<DrawableShape[]>([]);
  const [form, setForm] = useState({
    name: "", type: "operational_boundary" as GeofenceType,
    enforcement: "soft" as Enforcement, alt_min_ft: 0, alt_max_ft: 400,
  });

  const { data: geofences = [], isLoading } = useQuery({
    queryKey: ["geofences"],
    queryFn: async () => {
      const { data, error } = await supabase.from("geofences").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Geofence[];
    },
  });

  const { data: breaches = [] } = useQuery({
    queryKey: ["geofence-breaches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("geofence_breaches").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as unknown as Breach[];
    },
  });

  const overlays = useMemo(() => geofences.map((g) => ({
    type: "polygon" as const,
    geojson: g.geometry,
    color: typeConfig[g.type]?.color ?? "#3B82F6",
    fillOpacity: g.enforcement === "hard" ? 0.35 : 0.15,
    label: `${g.name} · ${typeConfig[g.type]?.label}`,
  })), [geofences]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const polys = drawnShapes.filter((s) => s.kind === "polygon" || s.kind === "circle");
      if (polys.length === 0) throw new Error("Draw at least one polygon or circle");
      const first = polys[0];
      const geometry = first.kind === "polygon" ? first.geojson : first.geojson;
      const area_sq_meters = (first as any).area_sq_m;
      const { error } = await supabase.from("geofences").insert({
        tenant_id: profile.tenant_id,
        created_by: profile.id,
        region: profile.region as any,
        name: form.name,
        type: form.type,
        enforcement: form.enforcement,
        alt_min_ft: form.alt_min_ft,
        alt_max_ft: form.alt_max_ft,
        geometry,
        area_sq_meters,
        source: "User Created",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["geofences"] });
      setDrawOpen(false);
      setDrawnShapes([]);
      setForm({ name: "", type: "operational_boundary", enforcement: "soft", alt_min_ft: 0, alt_max_ft: 400 });
      toast.success("Geofence created");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("geofences").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["geofences"] });
      toast.success("Geofence removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = geofences.filter((g) => !search || g.name.toLowerCase().includes(search.toLowerCase()));
  const stats = [
    { label: "Active Zones", value: geofences.filter((g) => g.status === "active").length, icon: Shield, color: "text-info" },
    { label: "No-Fly Zones", value: geofences.filter((g) => g.type === "no_fly").length, icon: ShieldAlert, color: "text-destructive" },
    { label: "Active Alerts", value: breaches.filter((b) => !b.resolved).length, icon: Bell, color: "text-warning" },
    { label: "Total Breaches", value: geofences.reduce((s, g) => s + (g.breach_count ?? 0), 0), icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Geofence Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Draw zones on the map · enforcement at flight time</p>
        </div>
        <button onClick={() => setDrawOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Pencil className="w-4 h-4" /> Draw Geofence
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["map", "zones", "alerts"] as TabId[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "zones" ? "Zones" : t === "alerts" ? `Alerts (${breaches.filter((b) => !b.resolved).length})` : "Map"}
          </button>
        ))}
      </div>

      {tab === "map" && (
        <div className="bg-card border border-border rounded-lg p-3">
          <DrawableMap overlays={overlays} height="600px" tools={[]} />
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {geofences.length} zones. Tap <strong>Draw Geofence</strong> above to add a new one with finger or mouse.
          </p>
        </div>
      )}

      {tab === "zones" && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search geofences…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground px-2">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2">No geofences yet. Draw your first one.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((g) => (
                <div key={g.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: typeConfig[g.type]?.color }} />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{g.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {g.source} · {new Date(g.created_at).toLocaleDateString()}
                          {g.area_sq_meters ? ` · ${(g.area_sq_meters / 10000).toFixed(2)} ha` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", typeConfig[g.type]?.bg, typeConfig[g.type]?.text)}>{typeConfig[g.type]?.label}</span>
                      {g.enforcement === "hard" ? <Lock className="w-4 h-4 text-destructive" /> : <Unlock className="w-4 h-4 text-warning" />}
                      <button onClick={() => deleteMutation.mutate(g.id)} className="p-1 hover:bg-destructive/10 rounded">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Alt: {g.alt_min_ft}–{g.alt_max_ft} ft</span>
                    <span>Enforcement: {g.enforcement}</span>
                    {g.breach_count > 0 && <span className="text-destructive font-medium">{g.breach_count} breaches</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-3">
          {breaches.length === 0 ? (
            <p className="text-sm text-muted-foreground px-2">No breach alerts.</p>
          ) : breaches.map((b) => (
            <div key={b.id} className={cn("bg-card border rounded-lg p-4 border-l-4", b.severity === "critical" ? "border-l-destructive" : b.severity === "warning" ? "border-l-warning" : "border-l-info")}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{geofences.find((g) => g.id === b.geofence_id)?.name ?? b.geofence_id.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">{b.breach_type} · {new Date(b.created_at).toLocaleString()}</p>
                </div>
                <span className={cn("text-xs font-medium", b.resolved ? "text-success" : "text-destructive")}>{b.resolved ? "Resolved" : "Active"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Draw dialog */}
      <Dialog open={drawOpen} onOpenChange={setDrawOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="w-4 h-4" /> Draw a Geofence</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <DrawableMap
                height="500px"
                tools={["polygon", "rectangle", "circle"]}
                overlays={overlays}
                onChange={setDrawnShapes}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Use the toolbar (top-right) to draw with finger or mouse. Existing zones are shown as overlays.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Quarry Operations Zone" className="w-full h-9 rounded-md bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as GeofenceType })} className="w-full h-9 rounded-md bg-muted px-3 text-sm outline-none">
                  {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Enforcement</label>
                <select value={form.enforcement} onChange={(e) => setForm({ ...form, enforcement: e.target.value as Enforcement })} className="w-full h-9 rounded-md bg-muted px-3 text-sm outline-none">
                  <option value="soft">Soft (warn)</option>
                  <option value="hard">Hard (block flight)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Alt Min (ft)</label>
                  <input type="number" value={form.alt_min_ft} onChange={(e) => setForm({ ...form, alt_min_ft: parseInt(e.target.value) || 0 })} className="w-full h-9 rounded-md bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Alt Max (ft)</label>
                  <input type="number" value={form.alt_max_ft} onChange={(e) => setForm({ ...form, alt_max_ft: parseInt(e.target.value) || 400 })} className="w-full h-9 rounded-md bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
                <p className="font-medium text-foreground">Drawn shapes: {drawnShapes.length}</p>
                {drawnShapes.map((s, i) => (
                  <p key={i} className="text-muted-foreground">
                    {i + 1}. {s.kind}
                    {(s as any).area_sq_m ? ` · ${((s as any).area_sq_m / 10000).toFixed(2)} ha` : ""}
                    {(s as any).radius_m ? ` · r=${Math.round((s as any).radius_m)} m` : ""}
                  </p>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setDrawOpen(false)} className="flex-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4 inline mr-1" /> Cancel
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!form.name || drawnShapes.length === 0 || createMutation.isPending}
                  className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 hover:opacity-90"
                >
                  <Save className="w-4 h-4 inline mr-1" /> {createMutation.isPending ? "Saving…" : "Save Geofence"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
