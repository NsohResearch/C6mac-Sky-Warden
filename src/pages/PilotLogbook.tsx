import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  BookOpen,
  Clock,
  Plane,
  Calendar,
  TrendingUp,
  Award,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

/* ── Types ─────────────────────────────────────────────────────── */

interface FlightEntry {
  id: string;
  title: string;
  mission_type: string;
  status: string;
  actual_start: string | null;
  actual_end: string | null;
  scheduled_start: string | null;
  max_altitude_ft: number | null;
  drone_nickname: string | null;
  drone_manufacturer: string;
  drone_model: string;
  flight_duration_min: number;
  notes: string | null;
}

interface PilotCerts {
  part107_certificate_number: string | null;
  part107_expires_at: string | null;
  trust_completion_date: string | null;
  national_license_number: string | null;
  national_license_expiry: string | null;
  total_flight_hours: number | null;
  insurance_expiry: string | null;
  medical_certificate_expiry: string | null;
  endorsements: string[] | null;
}

/* ── Main component ────────────────────────────────────────────── */

export default function PilotLogbook() {
  const { user, profile } = useAuth();
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Fetch pilot profile/certs
  const { data: pilotProfile } = useQuery<PilotCerts | null>({
    queryKey: ["pilot-certs", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("pilot_profiles")
        .select("part107_certificate_number, part107_expires_at, trust_completion_date, national_license_number, national_license_expiry, total_flight_hours, insurance_expiry, medical_certificate_expiry, endorsements")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as PilotCerts | null;
    },
    enabled: !!user?.id,
  });

  // Fetch completed missions as flight log entries
  const { data: flights = [] } = useQuery<FlightEntry[]>({
    queryKey: ["pilot-logbook", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select(`
          id, title, mission_type, status, actual_start, actual_end,
          scheduled_start, max_altitude_ft, notes,
          drones!missions_drone_id_fkey (nickname, manufacturer, model)
        `)
        .in("status", ["completed", "in_progress", "aborted"])
        .order("actual_start", { ascending: false, nullsFirst: false });
      if (error) throw error;

      return (data ?? []).map((m: any) => {
        const start = m.actual_start ? new Date(m.actual_start) : null;
        const end = m.actual_end ? new Date(m.actual_end) : null;
        const durationMin = start && end ? differenceInMinutes(end, start) : 0;

        return {
          id: m.id,
          title: m.title,
          mission_type: m.mission_type,
          status: m.status,
          actual_start: m.actual_start,
          actual_end: m.actual_end,
          scheduled_start: m.scheduled_start,
          max_altitude_ft: m.max_altitude_ft,
          drone_nickname: m.drones?.nickname ?? null,
          drone_manufacturer: m.drones?.manufacturer ?? "Unknown",
          drone_model: m.drones?.model ?? "Unknown",
          flight_duration_min: durationMin,
          notes: m.notes,
        };
      });
    },
    enabled: !!user?.id,
  });

  // Compute stats
  const totalFlightMinutes = flights.reduce((sum, f) => sum + f.flight_duration_min, 0);
  const totalHours = (totalFlightMinutes / 60).toFixed(1);
  const completedFlights = flights.filter((f) => f.status === "completed").length;
  const missionTypes = [...new Set(flights.map((f) => f.mission_type))];

  // Filter
  const filtered = filterType === "all" ? flights : flights.filter((f) => f.mission_type === filterType);

  // Cert expiry warnings
  const certWarnings: { label: string; date: string; daysLeft: number }[] = [];
  if (pilotProfile?.part107_expires_at) {
    const d = differenceInDays(new Date(pilotProfile.part107_expires_at), new Date());
    if (d < 90) certWarnings.push({ label: "Part 107 Certificate", date: pilotProfile.part107_expires_at, daysLeft: d });
  }
  if (pilotProfile?.national_license_expiry) {
    const d = differenceInDays(new Date(pilotProfile.national_license_expiry), new Date());
    if (d < 90) certWarnings.push({ label: "National License", date: pilotProfile.national_license_expiry, daysLeft: d });
  }
  if (pilotProfile?.insurance_expiry) {
    const d = differenceInDays(new Date(pilotProfile.insurance_expiry), new Date());
    if (d < 30) certWarnings.push({ label: "Insurance Policy", date: pilotProfile.insurance_expiry, daysLeft: d });
  }
  if (pilotProfile?.medical_certificate_expiry) {
    const d = differenceInDays(new Date(pilotProfile.medical_certificate_expiry), new Date());
    if (d < 60) certWarnings.push({ label: "Medical Certificate", date: pilotProfile.medical_certificate_expiry, daysLeft: d });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Pilot Logbook</h1>
          <p className="text-xs text-muted-foreground">
            Digital flight log · {profile?.display_name ?? "Pilot"} · Auto-populated from missions
          </p>
        </div>
      </div>

      {/* Cert expiry warnings */}
      {certWarnings.length > 0 && (
        <div className="space-y-2">
          {certWarnings.map((w) => (
            <div
              key={w.label}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                w.daysLeft < 0
                  ? "bg-red-500/10 border-red-500/30"
                  : w.daysLeft < 30
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-amber-500/5 border-amber-500/20"
              }`}
            >
              <AlertTriangle className={`w-4 h-4 shrink-0 ${w.daysLeft < 0 ? "text-red-500" : "text-amber-500"}`} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {w.label} {w.daysLeft < 0 ? "EXPIRED" : `expires in ${w.daysLeft} days`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(w.date), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox icon={Clock} label="Total Hours" value={totalHours} unit="h" />
        <StatBox icon={Plane} label="Total Flights" value={String(completedFlights)} unit="" />
        <StatBox icon={TrendingUp} label="This Month" value={String(flights.filter((f) => f.actual_start && new Date(f.actual_start).getMonth() === new Date().getMonth()).length)} unit="flights" />
        <StatBox icon={Award} label="Cert Status" value={pilotProfile?.part107_certificate_number ? "Active" : "—"} unit="" accent />
      </div>

      {/* Certifications panel */}
      {pilotProfile && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Certifications & Currency</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pilotProfile.part107_certificate_number && (
              <CertItem label="Part 107" value={pilotProfile.part107_certificate_number} expiry={pilotProfile.part107_expires_at} />
            )}
            {pilotProfile.national_license_number && (
              <CertItem label="National License" value={pilotProfile.national_license_number} expiry={pilotProfile.national_license_expiry} />
            )}
            {pilotProfile.trust_completion_date && (
              <CertItem label="TRUST Completion" value={format(new Date(pilotProfile.trust_completion_date), "MMM d, yyyy")} />
            )}
            {pilotProfile.insurance_expiry && (
              <CertItem label="Insurance" value="Active" expiry={pilotProfile.insurance_expiry} />
            )}
            {(pilotProfile.endorsements?.length ?? 0) > 0 && (
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Endorsements</p>
                <div className="flex flex-wrap gap-1">
                  {pilotProfile.endorsements!.map((e) => (
                    <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flight log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Flight Log ({filtered.length} entries)</h2>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 rounded-md bg-background border border-input px-2 text-xs text-foreground outline-none"
          >
            <option value="all">All Types</option>
            {missionTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">No Flight Entries Yet</h3>
            <p className="text-xs text-muted-foreground">
              Complete missions to automatically populate your pilot logbook.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((flight) => {
              const isExpanded = expandedEntry === flight.id;
              return (
                <div
                  key={flight.id}
                  className="bg-card border border-border rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedEntry(isExpanded ? null : flight.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors active:scale-[0.995]"
                  >
                    {/* Date column */}
                    <div className="w-16 text-center shrink-0">
                      <p className="text-lg font-bold text-foreground leading-none">
                        {flight.actual_start
                          ? format(new Date(flight.actual_start), "dd")
                          : "—"
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {flight.actual_start
                          ? format(new Date(flight.actual_start), "MMM yyyy")
                          : ""
                        }
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{flight.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {flight.drone_nickname || `${flight.drone_manufacturer} ${flight.drone_model}`} · {flight.mission_type}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground tabular-nums">
                        {flight.flight_duration_min > 0
                          ? `${Math.floor(flight.flight_duration_min / 60)}h ${flight.flight_duration_min % 60}m`
                          : "—"
                        }
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {flight.max_altitude_ft ? `${flight.max_altitude_ft} ft max` : ""}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      flight.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : flight.status === "aborted"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {flight.status}
                    </span>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-4 py-3 bg-muted/20 space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground font-medium">Start</p>
                          <p className="text-foreground">{flight.actual_start ? format(new Date(flight.actual_start), "HH:mm MMM d") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">End</p>
                          <p className="text-foreground">{flight.actual_end ? format(new Date(flight.actual_end), "HH:mm MMM d") : "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Aircraft</p>
                          <p className="text-foreground">{flight.drone_manufacturer} {flight.drone_model}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Max Altitude</p>
                          <p className="text-foreground">{flight.max_altitude_ft ?? "—"} ft</p>
                        </div>
                      </div>
                      {flight.notes && (
                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">Notes</p>
                          <p className="text-xs text-foreground">{flight.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function StatBox({ icon: Icon, label, value, unit, accent = false }: {
  icon: typeof Clock;
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-4 h-4 ${accent ? "text-accent" : "text-muted-foreground"}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground tabular-nums">
        {value}
        {unit && <span className="text-sm text-muted-foreground font-normal ml-1">{unit}</span>}
      </p>
    </div>
  );
}

function CertItem({ label, value, expiry }: { label: string; value: string; expiry?: string | null }) {
  const daysLeft = expiry ? differenceInDays(new Date(expiry), new Date()) : null;
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
      {expiry && (
        <p className={`text-[10px] mt-1 ${
          daysLeft != null && daysLeft < 0 ? "text-red-500 font-semibold" :
          daysLeft != null && daysLeft < 30 ? "text-amber-500" : "text-muted-foreground"
        }`}>
          {daysLeft != null && daysLeft < 0
            ? "EXPIRED"
            : `Expires ${format(new Date(expiry), "MMM d, yyyy")}`
          }
        </p>
      )}
    </div>
  );
}
