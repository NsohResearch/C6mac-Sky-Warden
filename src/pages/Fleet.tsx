import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Plane, Battery, Signal, MapPin, Radio, Plus, X } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Drone {
  id: string;
  nickname: string | null;
  manufacturer: string;
  model: string;
  serial_number: string;
  category: string;
  status: string;
  remote_id_compliant: boolean;
  total_flight_hours: number | null;
  total_flights: number | null;
  battery_cycle_count: number | null;
  firmware_version: string | null;
  current_location: any;
  weight_grams: number | null;
  region: string;
}

export default function Fleet() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ manufacturer: "", model: "", serial_number: "", category: "small", nickname: "" });

  const { data: drones = [], isLoading } = useQuery({
    queryKey: ["fleet-drones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drones")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as unknown as Drone[];
    },
  });

  const addDrone = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { error } = await supabase.from("drones").insert([{
        tenant_id: profile.tenant_id,
        manufacturer: form.manufacturer,
        model: form.model,
        serial_number: form.serial_number,
        category: form.category,
        nickname: form.nickname || null,
        region: profile.region || "US",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fleet-drones"] });
      setShowAdd(false);
      setForm({ manufacturer: "", model: "", serial_number: "", category: "small", nickname: "" });
      toast.success("Drone added to fleet");
    },
    onError: (e) => toast.error(e.message),
  });

  const activeCount = drones.filter((d) => d.status === "active").length;
  const maintenanceCount = drones.filter((d) => d.status === "maintenance" || d.status === "grounded").length;

  const statusMap: Record<string, "active" | "warning" | "error" | "neutral"> = {
    active: "active",
    maintenance: "error",
    grounded: "error",
    standby: "neutral",
    retired: "neutral",
  };

  const statusLabel: Record<string, string> = {
    active: "Active",
    maintenance: "Maintenance",
    grounded: "Grounded",
    standby: "Standby",
    retired: "Retired",
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between animate-reveal-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Fleet Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {drones.length} drone{drones.length !== 1 ? "s" : ""} — {activeCount} active{maintenanceCount > 0 ? `, ${maintenanceCount} in maintenance` : ""}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.97] shadow-card">
          <Plus className="w-4 h-4" /> Add Drone
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : drones.length === 0 ? (
        <div className="bg-card rounded-lg shadow-card p-12 text-center animate-reveal-up">
          <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">No drones in your fleet</h3>
          <p className="text-xs text-muted-foreground">Add your first drone to get started with fleet management.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {drones.map((drone, i) => (
            <div
              key={drone.id}
              className="bg-card rounded-lg shadow-card hover:shadow-card-hover p-5 transition-shadow duration-200 animate-reveal-up"
              style={{ animationDelay: `${(i + 1) * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{drone.nickname || `${drone.manufacturer} ${drone.model}`}</span>
                    {drone.remote_id_compliant && <Radio className="w-3.5 h-3.5 text-success" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 mono">{drone.serial_number}</p>
                </div>
                <StatusBadge status={statusMap[drone.status] ?? "neutral"}>
                  {statusLabel[drone.status] ?? drone.status}
                </StatusBadge>
              </div>

              <div className="space-y-2.5 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Plane className="w-3.5 h-3.5" />
                    Model
                  </div>
                  <span className="text-xs text-foreground">{drone.manufacturer} {drone.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Battery className="w-3.5 h-3.5" />
                    Battery Cycles
                  </div>
                  <span className="text-xs text-foreground tabular">{drone.battery_cycle_count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Signal className="w-3.5 h-3.5" />
                    Flight Hours
                  </div>
                  <span className="text-xs text-foreground tabular">{Number(drone.total_flight_hours ?? 0).toFixed(1)} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    Category
                  </div>
                  <span className="text-xs text-foreground capitalize">{drone.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Drone to Fleet</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Manufacturer *</label>
              <input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="e.g. DJI" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Model *</label>
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Mavic 3 Enterprise" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Serial Number *</label>
              <input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} placeholder="e.g. 1ZNBJ4P00C0092" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground mono outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nickname (optional)</label>
              <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="e.g. Survey Bird Alpha" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30">
                <option value="small">Small (&lt;25kg)</option>
                <option value="micro">Micro (&lt;250g)</option>
                <option value="medium">Medium (25–150kg)</option>
                <option value="large">Large (&gt;150kg)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button
                onClick={() => addDrone.mutate()}
                disabled={!form.manufacturer || !form.model || !form.serial_number || addDrone.isPending}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50"
              >
                {addDrone.isPending ? "Adding…" : "Add Drone"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
