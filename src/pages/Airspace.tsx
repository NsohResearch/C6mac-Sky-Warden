import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Layers, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export default function Airspace() {
  const { data: zones = [] } = useQuery({
    queryKey: ["airspace-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("airspace_zones")
        .select("*")
        .eq("is_active", true)
        .order("name")
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["agency-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agency_rules")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const controlledZones = zones.filter((z) => z.requires_authorization);
  const laancZones = zones.filter((z) => z.laanc_enabled);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Airspace Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {zones.length} zones loaded · {laancZones.length} LAANC-enabled · {controlledZones.length} require authorization
        </p>
      </div>

      {/* Map placeholder */}
      <div className="relative rounded-lg overflow-hidden shadow-card animate-reveal-up delay-1 bg-muted" style={{ height: 280 }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Interactive airspace map</p>
            <p className="text-xs text-muted-foreground mt-1">Mapbox GL integration coming soon</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent">
          <div className="flex gap-2">
            {["UASFM Grids", "TFRs", "NOTAMs", "Controlled Airspace"].map((layer) => (
              <button key={layer} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/80 backdrop-blur-sm text-xs font-medium text-foreground hover:bg-muted transition-colors active:scale-[0.97]">
                <Layers className="w-3 h-3" />
                {layer}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Airspace zones */}
        <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-2">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Airspace Zones ({zones.length})</h2>
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {zones.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">No airspace zones configured</p>
            ) : zones.map((zone) => (
              <div key={zone.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{zone.name}</span>
                    {zone.laanc_enabled && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wider">LAANC</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {zone.airspace_class ? `Class ${zone.airspace_class}` : zone.zone_type} · {zone.floor_ft ?? 0}–{zone.ceiling_ft ?? 400} ft
                  </p>
                </div>
                <StatusBadge status={zone.requires_authorization ? "warning" : "active"}>
                  {zone.requires_authorization ? "Auth Required" : "Open"}
                </StatusBadge>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Rules */}
        <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-3">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Active Rules & Restrictions</h2>
            {rules.length > 0 && <StatusBadge status="warning">{rules.length} Active</StatusBadge>}
          </div>
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {rules.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">No active agency rules</p>
            ) : rules.map((rule) => (
              <div key={rule.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-foreground">{rule.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{rule.enforcement_level}</span>
                </div>
                {rule.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 pl-6">{rule.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
