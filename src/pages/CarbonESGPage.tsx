import { useState } from "react";
import { Leaf, TrendingUp, TrendingDown, BarChart2, Activity, Shield, Award, FileText, Download, Calendar, CheckCircle, AlertTriangle, Target, Globe, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "carbon" | "esg" | "reports";

const mockCarbon = {
  totalSaved: 12840, monthSaved: 1420, flightEmissions: 248, netSaving: 12592,
  vs_vehicle: { flights: 342, distance_km: 4820, vehicle_co2: 14260, drone_co2: 1420, savings_pct: 90 },
  monthly: [
    { month: "Jan", saved: 980 }, { month: "Feb", saved: 1150 }, { month: "Mar", saved: 1420 },
  ],
};

const mockESG = {
  rating: "A", score: 87,
  environmental: { score: 91, items: ["90% CO₂ reduction vs vehicle surveys", "Zero fuel operations", "Noise reduction in wildlife areas"] },
  social: { score: 84, items: ["12 pilot jobs created", "Community safety reporting", "Rural area access improvement"] },
  governance: { score: 86, items: ["100% regulatory compliance", "Full audit trail", "Transparent pricing"] },
};

export default function CarbonESGPage() {
  const [tab, setTab] = useState<TabId>("carbon");
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Carbon & ESG</h1><p className="text-sm text-muted-foreground mt-1">CO₂ savings, ESG scorecard, benchmarking</p></div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"><Download className="w-4 h-4" /> Export Report</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "CO₂ Saved (Total)", value: `${(mockCarbon.totalSaved / 1000).toFixed(1)}t`, icon: Leaf, color: "text-green-600" },
          { label: "This Month", value: `${mockCarbon.monthSaved} kg`, icon: TrendingUp, color: "text-emerald-600" },
          { label: "ESG Rating", value: mockESG.rating, icon: Award, color: "text-blue-600" },
          { label: "ESG Score", value: `${mockESG.score}/100`, icon: Star, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-1 border-b border-border">
        {(["carbon", "esg", "reports"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "carbon" ? "Carbon Footprint" : t === "esg" ? "ESG Scorecard" : "Reports"}
          </button>
        ))}
      </div>
      {tab === "carbon" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-4">Drone vs Vehicle Comparison</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Flights</span><span className="font-medium">{mockCarbon.vs_vehicle.flights}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Distance Covered</span><span className="font-medium">{mockCarbon.vs_vehicle.distance_km.toLocaleString()} km</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vehicle CO₂ (if driven)</span><span className="font-medium text-red-600">{mockCarbon.vs_vehicle.vehicle_co2.toLocaleString()} kg</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Drone CO₂ (actual)</span><span className="font-medium text-green-600">{mockCarbon.vs_vehicle.drone_co2.toLocaleString()} kg</span></div>
              <div className="pt-2 border-t border-border flex justify-between text-sm"><span className="font-semibold">Reduction</span><span className="font-bold text-green-600">{mockCarbon.vs_vehicle.savings_pct}%</span></div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-4">Monthly Savings</h3>
            <div className="space-y-3">
              {mockCarbon.monthly.map(m => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-10 text-sm text-muted-foreground">{m.month}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full"><div className="h-full bg-green-500 rounded-full" style={{ width: `${(m.saved / 1500) * 100}%` }} /></div>
                  <span className="text-sm font-medium w-16 text-right">{m.saved} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === "esg" && (
        <div className="grid grid-cols-3 gap-4">
          {(["environmental", "social", "governance"] as const).map(pillar => {
            const data = mockESG[pillar];
            const colors = { environmental: "text-green-600", social: "text-blue-600", governance: "text-purple-600" };
            return (
              <div key={pillar} className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize">{pillar}</h3>
                  <span className={cn("text-2xl font-bold", colors[pillar])}>{data.score}</span>
                </div>
                <ul className="space-y-2">
                  {data.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
      {tab === "reports" && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="font-semibold">ESG Report Generator</h3>
          <p className="text-sm text-muted-foreground mt-1">Generate comprehensive ESG reports for stakeholders</p>
          <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">Generate Report</button>
        </div>
      )}
    </div>
  );
}
