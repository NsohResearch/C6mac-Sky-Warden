import { useState } from "react";
import { Store, Search, Star, Download, CheckCircle, RefreshCw, Filter, ExternalLink, Shield, ShieldCheck, Grid, List, Package, BarChart3, Plus, Eye, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketplaceApp {
  id: string; name: string; publisher: string; publisherVerified: boolean;
  category: string; shortDescription: string; icon: string;
  version: string; rating: number; reviewCount: number; installs: number;
  pricing: { type: "free" | "paid" | "freemium"; price?: number };
  installed: boolean; featured: boolean;
}

const mockApps: MarketplaceApp[] = [
  { id: "APP-001", name: "DJI FlightHub Connector", publisher: "DJI Enterprise", publisherVerified: true, category: "Hardware", shortDescription: "Sync DJI FlightHub 2 fleet data, telemetry, and maintenance records.", icon: "D", version: "3.2.1", rating: 4.8, reviewCount: 342, installs: 12450, pricing: { type: "freemium", price: 29 }, installed: true, featured: true },
  { id: "APP-002", name: "Pix4D Processing Engine", publisher: "Pix4D SA", publisherVerified: true, category: "Processing", shortDescription: "Professional photogrammetry processing with orthomosaics, 3D models, and point clouds.", icon: "P", version: "2.8.0", rating: 4.7, reviewCount: 218, installs: 8920, pricing: { type: "paid", price: 49 }, installed: true, featured: true },
  { id: "APP-003", name: "DroneDeploy Integration", publisher: "DroneDeploy", publisherVerified: true, category: "Processing", shortDescription: "Automated flight planning, real-time mapping, and AI-powered analytics.", icon: "DD", version: "4.1.2", rating: 4.6, reviewCount: 186, installs: 7650, pricing: { type: "freemium", price: 39 }, installed: false, featured: true },
  { id: "APP-004", name: "AirMap UTM Gateway", publisher: "AirMap Inc.", publisherVerified: true, category: "Compliance", shortDescription: "Connect to AirMap UTM network for airspace authorization and deconfliction.", icon: "AM", version: "5.0.1", rating: 4.5, reviewCount: 124, installs: 5200, pricing: { type: "free" }, installed: true, featured: false },
  { id: "APP-005", name: "SkyWatch Insurance API", publisher: "SkyWatch.AI", publisherVerified: true, category: "Insurance", shortDescription: "On-demand drone insurance quotes and automated COI generation.", icon: "SW", version: "2.3.0", rating: 4.4, reviewCount: 89, installs: 3400, pricing: { type: "freemium", price: 19 }, installed: false, featured: false },
  { id: "APP-006", name: "Autel SDK Bridge", publisher: "Autel Robotics", publisherVerified: true, category: "Hardware", shortDescription: "Fleet sync for Autel EVO series drones with firmware management.", icon: "A", version: "1.5.4", rating: 4.3, reviewCount: 67, installs: 2100, pricing: { type: "free" }, installed: false, featured: false },
];

const categoryColors: Record<string, string> = {
  Hardware: "bg-blue-50 text-blue-700", Processing: "bg-purple-50 text-purple-700",
  Compliance: "bg-green-50 text-green-700", Insurance: "bg-amber-50 text-amber-700",
};

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "installed">("all");

  const filtered = mockApps.filter(a => {
    if (filter === "installed" && !a.installed) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">App integrations — DJI, Pix4D, DroneDeploy, and more</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
        <div className="flex gap-1">
          {(["all", "installed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize", filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(app => (
          <div key={app.id} className={cn("bg-card border rounded-lg p-5 hover:shadow-md transition-shadow", app.featured ? "border-primary/30" : "border-border")}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{app.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground truncate">{app.name}</h3>
                  {app.publisherVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{app.publisher}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{app.shortDescription}</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", categoryColors[app.category] ?? "bg-gray-100 text-gray-700")}>{app.category}</span>
                <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-sm font-medium">{app.rating}</span><span className="text-xs text-muted-foreground">({app.reviewCount})</span></div>
              </div>
              <span className="text-xs text-muted-foreground">{app.installs.toLocaleString()} installs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{app.pricing.type === "free" ? "Free" : app.pricing.type === "paid" ? `$${app.pricing.price}/mo` : `Free / $${app.pricing.price}/mo`}</span>
              {app.installed ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" /> Installed</span>
              ) : (
                <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">Install</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
