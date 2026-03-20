import { MapPin, Layers, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import heroAirspace from "@/assets/hero-airspace.jpg";

const airspaceZones = [
  { id: "AZ-001", name: "Class B — Metro Airport", ceiling: "Surface – FL180", status: "active" as const, laanc: true },
  { id: "AZ-002", name: "Class D — Regional Field", ceiling: "Surface – 2,500 MSL", status: "active" as const, laanc: true },
  { id: "AZ-003", name: "Class E — Transition Area", ceiling: "700 AGL – FL180", status: "active" as const, laanc: false },
  { id: "AZ-004", name: "Class G — Uncontrolled", ceiling: "Surface – 700/1200 AGL", status: "active" as const, laanc: false },
];

const activeTfrs = [
  { id: "FDC 4/2847", area: "Downtown Corridor", altitude: "Surface – 400 AGL", expires: "Mar 21, 18:00Z", type: "warning" as const },
  { id: "FDC 4/2851", area: "Stadium Complex", altitude: "Surface – 3,000 AGL", expires: "Mar 20, 23:00Z", type: "error" as const },
];

export default function Airspace() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Airspace Management</h1>
        <p className="text-sm text-muted-foreground mt-1">B4UFLY checks, UASFM grids, TFRs & NOTAMs</p>
      </div>

      {/* Map placeholder */}
      <div className="relative rounded-lg overflow-hidden shadow-card animate-reveal-up delay-1" style={{ height: 360 }}>
        <img src={heroAirspace} alt="Airspace overview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">Interactive airspace map</span>
          </div>
          <p className="text-xs text-primary-foreground/70 max-w-md">
            Real-time UASFM grid overlays, TFR boundaries, and controlled airspace visualization. 
            Mapbox GL integration coming soon.
          </p>
          <div className="flex gap-2 mt-3">
            {["UASFM Grids", "TFRs", "NOTAMs", "Controlled Airspace"].map((layer) => (
              <button key={layer} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary-foreground/10 backdrop-blur-sm text-xs font-medium text-primary-foreground hover:bg-primary-foreground/20 transition-colors active:scale-[0.97]">
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
            <h2 className="text-sm font-semibold text-foreground">Airspace Classification</h2>
          </div>
          <div className="divide-y divide-border">
            {airspaceZones.map((zone) => (
              <div key={zone.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{zone.name}</span>
                    {zone.laanc && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wider">LAANC</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular">{zone.ceiling}</p>
                </div>
                <StatusBadge status={zone.status}>Active</StatusBadge>
              </div>
            ))}
          </div>
        </div>

        {/* Active TFRs */}
        <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-3">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Active TFRs</h2>
            <StatusBadge status="warning">{activeTfrs.length} Active</StatusBadge>
          </div>
          <div className="divide-y divide-border">
            {activeTfrs.map((tfr) => (
              <div key={tfr.id} className="px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${tfr.type === "error" ? "text-destructive" : "text-warning"}`} />
                    <span className="text-sm font-medium text-foreground mono">{tfr.id}</span>
                  </div>
                  <StatusBadge status={tfr.type}>{tfr.type === "error" ? "Critical" : "Caution"}</StatusBadge>
                </div>
                <div className="mt-1.5 pl-6 space-y-0.5">
                  <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Area:</span> {tfr.area}</p>
                  <p className="text-xs text-muted-foreground tabular"><span className="text-foreground font-medium">Alt:</span> {tfr.altitude}</p>
                  <p className="text-xs text-muted-foreground tabular"><span className="text-foreground font-medium">Expires:</span> {tfr.expires}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
