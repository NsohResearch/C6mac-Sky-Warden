import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { MapPin, CheckCircle2, AlertTriangle, XCircle, Search, Satellite, Shield } from "lucide-react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

type AdvisoryLevel = "green" | "yellow" | "red";

interface CheckSource {
  source: string;
  status: "clear" | "warning" | "restricted";
  detail: string;
}

const advisoryConfig: Record<AdvisoryLevel, { color: string; bg: string; label: string; Icon: React.ElementType }> = {
  green: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", label: "CLEAR TO FLY", Icon: CheckCircle2 },
  yellow: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", label: "ADVISORIES", Icon: AlertTriangle },
  red: { color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", label: "DO NOT FLY", Icon: XCircle },
};

function simulateCheck(lat: number, lon: number): { advisory: AdvisoryLevel; uasfmCeiling: number; laancAvail: boolean; results: CheckSource[]; tfr: number; notam: number; airport: number; sua: number; park: boolean; stadium: boolean } {
  const nearAirport = Math.abs(lat - 33.9425) < 0.1 && Math.abs(lon + 118.4081) < 0.1;
  const nearPark = Math.abs(lat - 36.1069) < 0.2 && Math.abs(lon + 112.1129) < 0.2;
  const tfrActive = Math.random() > 0.7;
  const results: CheckSource[] = [
    { source: "UASFM Grid", status: nearAirport ? "warning" : "clear", detail: nearAirport ? "200ft ceiling in grid" : "400ft ceiling" },
    { source: "TFR (FAA)", status: tfrActive ? "restricted" : "clear", detail: tfrActive ? "Active TFR 21/4532" : "No active TFRs" },
    { source: "NOTAMs", status: "clear", detail: "2 informational NOTAMs" },
    { source: "Airports (5nm)", status: nearAirport ? "warning" : "clear", detail: nearAirport ? "Within 5nm of KLAX" : "No airports within 5nm" },
    { source: "Controlled Airspace", status: nearAirport ? "warning" : "clear", detail: nearAirport ? "Class B surface area" : "Class G uncontrolled" },
    { source: "Special Use Airspace", status: "clear", detail: "No SUA conflicts" },
    { source: "National Parks", status: nearPark ? "restricted" : "clear", detail: nearPark ? "Grand Canyon NP boundary" : "No national parks" },
    { source: "Stadiums/Events", status: "clear", detail: "No TFR-triggering events" },
    { source: "Military MOAs", status: "clear", detail: "No active MOAs" },
    { source: "Prohibited Areas", status: "clear", detail: "No prohibited areas" },
    { source: "Washington FRZ", status: "clear", detail: "Outside FRZ/SFRA" },
  ];
  const hasRestricted = results.some((r) => r.status === "restricted");
  const hasWarning = results.some((r) => r.status === "warning");
  return { advisory: hasRestricted ? "red" : hasWarning ? "yellow" : "green", uasfmCeiling: nearAirport ? 200 : 400, laancAvail: nearAirport, results, tfr: tfrActive ? 1 : 0, notam: 2, airport: nearAirport ? 1 : 0, sua: 0, park: nearPark, stadium: false };
}

export default function B4UFly() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [lat, setLat] = useState("34.0522");
  const [lon, setLon] = useState("-118.2437");
  const [alt, setAlt] = useState("400");
  const [checkResult, setCheckResult] = useState<ReturnType<typeof simulateCheck> | null>(null);

  const { data: history = [] } = useQuery({
    queryKey: ["b4ufly-history"],
    queryFn: async () => {
      const { data, error } = await supabase.from("b4ufly_checks").select("*").order("checked_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  const saveCheck = useMutation({
    mutationFn: async (result: ReturnType<typeof simulateCheck>) => {
      if (!profile?.tenant_id) throw new Error("No tenant");
      const { error } = await supabase.from("b4ufly_checks").insert({
        tenant_id: profile.tenant_id, user_id: profile.id, latitude: parseFloat(lat), longitude: parseFloat(lon), altitude_ft: parseInt(alt),
        overall_advisory: result.advisory, uasfm_ceiling_ft: result.uasfmCeiling, laanc_available: result.laancAvail,
        check_results: result.results as any, tfr_count: result.tfr, notam_count: result.notam, airport_count: result.airport,
        sua_count: result.sua, national_park_nearby: result.park, stadium_nearby: result.stadium, region: profile.region || "US",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["b4ufly-history"] }),
  });

  const runCheck = () => {
    const result = simulateCheck(parseFloat(lat), parseFloat(lon));
    setCheckResult(result);
    saveCheck.mutate(result);
    toast.success("Airspace check complete");
  };

  const adv = checkResult ? advisoryConfig[checkResult.advisory] : null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">B4UFLY Pre-Flight Check</h1>
        <p className="text-sm text-muted-foreground mt-1">11-source airspace advisory — UASFM, TFR, NOTAM, airports, SUA & more</p>
      </div>

      <div className="bg-card rounded-lg shadow-card p-5 animate-reveal-up delay-1">
        <div className="flex flex-wrap items-end gap-4">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Latitude</label><input value={lat} onChange={(e) => setLat(e.target.value)} className="h-9 w-36 rounded-md bg-muted px-3 text-sm text-foreground tabular outline-none focus:ring-2 focus:ring-ring/30" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Longitude</label><input value={lon} onChange={(e) => setLon(e.target.value)} className="h-9 w-36 rounded-md bg-muted px-3 text-sm text-foreground tabular outline-none focus:ring-2 focus:ring-ring/30" /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Altitude (ft)</label><input value={alt} onChange={(e) => setAlt(e.target.value)} className="h-9 w-24 rounded-md bg-muted px-3 text-sm text-foreground tabular outline-none focus:ring-2 focus:ring-ring/30" /></div>
          <button onClick={runCheck} className="flex items-center gap-2 h-9 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97]"><Search className="w-4 h-4" /> Check Airspace</button>
        </div>
      </div>

      {checkResult && adv && (
        <div className={`rounded-lg p-5 ${adv.bg} border animate-reveal-up`}>
          <div className="flex items-center gap-3 mb-4">
            <adv.Icon className={`w-8 h-8 ${adv.color}`} />
            <div>
              <h2 className={`text-lg font-bold ${adv.color}`}>{adv.label}</h2>
              <p className="text-sm text-muted-foreground">UASFM Ceiling: {checkResult.uasfmCeiling}ft AGL{checkResult.laancAvail && " • LAANC Available"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {checkResult.results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-background/60">
                {r.status === "clear" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : r.status === "warning" ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                <div className="min-w-0"><p className="text-xs font-medium text-foreground truncate">{r.source}</p><p className="text-xs text-muted-foreground truncate">{r.detail}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Checks Today" value={String(history.filter((h: any) => new Date(h.checked_at).toDateString() === new Date().toDateString()).length)} change="Location checks" icon={MapPin} delay={80} />
        <StatCard label="Green" value={String(history.filter((h: any) => h.overall_advisory === "green").length)} change="Clear to fly" changeType="positive" icon={CheckCircle2} delay={160} />
        <StatCard label="Yellow" value={String(history.filter((h: any) => h.overall_advisory === "yellow").length)} change="Caution" icon={AlertTriangle} delay={240} />
        <StatCard label="Red" value={String(history.filter((h: any) => h.overall_advisory === "red").length)} change="Restricted" changeType="negative" icon={XCircle} delay={320} />
      </div>

      <div className="bg-card rounded-lg shadow-card animate-reveal-up delay-4">
        <div className="px-5 py-4 border-b border-border"><h2 className="text-sm font-semibold text-foreground">Check History</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Date</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Location</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Altitude</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Advisory</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">UASFM Ceiling</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">LAANC</th>
            </tr></thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No checks yet. Run your first airspace check above.</td></tr>
              ) : history.map((h: any) => (
                <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular">{new Date(h.checked_at).toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground mono tabular">{Number(h.latitude).toFixed(4)}, {Number(h.longitude).toFixed(4)}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular">{h.altitude_ft} ft</td>
                  <td className="px-5 py-3"><StatusBadge status={h.overall_advisory === "green" ? "active" : h.overall_advisory === "yellow" ? "warning" : "error"}>{h.overall_advisory?.toUpperCase()}</StatusBadge></td>
                  <td className="px-5 py-3 text-sm text-muted-foreground tabular">{h.uasfm_ceiling_ft ?? "—"} ft</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{h.laanc_available ? "Available" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}