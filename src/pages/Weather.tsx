import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Cloud,
  Wind,
  Eye,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  RefreshCw,
  Gauge,
  ArrowUp,
  Clock,
  Navigation2,
  Layers,
  Info,
} from "lucide-react";
import { format } from "date-fns";

/* ── Types ─────────────────────────────────────────────────────── */

interface WeatherStation {
  station_id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  observation_time: string;
  raw_metar: string | null;
  raw_taf: string | null;
  wind_speed_kt: number | null;
  wind_gust_kt: number | null;
  wind_direction_deg: number | null;
  visibility_sm: number | null;
  temperature_c: number | null;
  dewpoint_c: number | null;
  altimeter_inhg: number | null;
  flight_category: string;
  clouds: { cover: string; base: number | null }[];
  ceiling_ft: number | null;
  weather_string: string | null;
  advisory: "green" | "yellow" | "red";
  warnings: string[];
}

interface WeatherResult {
  stations: WeatherStation[];
  checked_at: string;
  location: { latitude: number; longitude: number };
  radius_nm: number;
}

/* ── Advisory colors ───────────────────────────────────────────── */

const advisoryConfig = {
  green: { label: "Clear to Fly", icon: CheckCircle2, bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30" },
  yellow: { label: "Fly with Caution", icon: AlertTriangle, bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30" },
  red: { label: "Do Not Fly", icon: XCircle, bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" },
};

const flightCatColors: Record<string, string> = {
  VFR: "text-emerald-600 bg-emerald-500/10",
  MVFR: "text-amber-600 bg-amber-500/10",
  IFR: "text-red-600 bg-red-500/10",
  LIFR: "text-red-700 bg-red-500/15",
  UNKNOWN: "text-muted-foreground bg-muted",
};

/* ── Main component ────────────────────────────────────────────── */

export default function Weather() {
  const { profile } = useAuth();
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("30");
  const [result, setResult] = useState<WeatherResult | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [useGPS, setUseGPS] = useState(false);

  const checkWeather = useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number; radius_nm: number }) => {
      const { data, error } = await supabase.functions.invoke("weather-check", {
        body: coords,
      });
      if (error) throw error;
      return data as WeatherResult;
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.stations.length > 0) {
        setSelectedStation(data.stations[0].station_id);
      }
    },
  });

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setUseGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setUseGPS(false);
      },
      () => setUseGPS(false)
    );
  };

  const handleCheck = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) return;
    checkWeather.mutate({ latitude, longitude, radius_nm: parseInt(radius) || 30 });
  };

  const selected = result?.stations.find((s) => s.station_id === selectedStation);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Weather Briefing</h1>
            <p className="text-xs text-muted-foreground">
              Pre-flight weather assessment · METAR/TAF · Part 107 compliance
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-foreground mb-1">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="38.8977"
              className="w-full h-10 rounded-lg bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-foreground mb-1">Longitude</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-77.0365"
              className="w-full h-10 rounded-lg bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-semibold text-foreground mb-1">Radius (NM)</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full h-10 rounded-lg bg-background border border-input px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
            />
          </div>
          <button
            onClick={handleGPS}
            disabled={useGPS}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors active:scale-[0.97]"
            title="Use current location"
          >
            <MapPin className={`w-4 h-4 ${useGPS ? "animate-pulse" : ""}`} />
          </button>
          <button
            onClick={handleCheck}
            disabled={checkWeather.isPending || !lat || !lng}
            className="h-10 px-5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50 flex items-center gap-2"
          >
            {checkWeather.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            Check Weather
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Station list */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              Nearby Stations ({result.stations.length})
            </h2>
            {result.stations.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Cloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No weather stations found nearby. Try a larger radius.</p>
              </div>
            )}
            {result.stations.map((station) => {
              const config = advisoryConfig[station.advisory];
              const isSelected = selectedStation === station.station_id;
              return (
                <button
                  key={station.station_id}
                  onClick={() => setSelectedStation(station.station_id)}
                  className={`w-full text-left rounded-xl border p-3 transition-all active:scale-[0.98] ${
                    isSelected
                      ? `${config.bg} ${config.border}`
                      : "bg-card border-border hover:border-accent/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-foreground">{station.station_id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flightCatColors[station.flight_category] ?? flightCatColors.UNKNOWN}`}>
                      {station.flight_category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{station.station_name}</p>
                  <div className="flex items-center gap-3 text-xs text-foreground">
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-muted-foreground" />
                      {station.wind_speed_kt ?? "—"}{station.wind_gust_kt ? `G${station.wind_gust_kt}` : ""} kt
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      {station.visibility_sm ?? "—"} SM
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-muted-foreground" />
                      {station.temperature_c ?? "—"}°C
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected station detail */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">
              {/* Advisory banner */}
              {(() => {
                const config = advisoryConfig[selected.advisory];
                const Icon = config.icon;
                return (
                  <div className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-6 h-6 ${config.text}`} />
                      <div>
                        <h3 className={`text-lg font-bold ${config.text}`}>{config.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selected.station_id} · {selected.station_name}
                        </p>
                      </div>
                    </div>
                    {selected.warnings.length > 0 && (
                      <ul className="space-y-1 mt-3">
                        {selected.warnings.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                            <AlertTriangle className={`w-3 h-3 ${config.text} shrink-0 mt-0.5`} />
                            {w}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}

              {/* Weather gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <WeatherGauge icon={Wind} label="Wind" value={`${selected.wind_speed_kt ?? "—"}`} unit="kt" sub={selected.wind_direction_deg ? `from ${selected.wind_direction_deg}°` : undefined} />
                <WeatherGauge icon={Wind} label="Gusts" value={`${selected.wind_gust_kt ?? "Calm"}`} unit={selected.wind_gust_kt ? "kt" : ""} warn={selected.wind_gust_kt != null && selected.wind_gust_kt > 20} />
                <WeatherGauge icon={Eye} label="Visibility" value={`${selected.visibility_sm ?? "—"}`} unit="SM" warn={selected.visibility_sm != null && selected.visibility_sm < 3} />
                <WeatherGauge icon={Thermometer} label="Temperature" value={`${selected.temperature_c ?? "—"}`} unit="°C" />
                <WeatherGauge icon={Droplets} label="Dewpoint" value={`${selected.dewpoint_c ?? "—"}`} unit="°C" />
                <WeatherGauge icon={Gauge} label="Altimeter" value={`${selected.altimeter_inhg?.toFixed(2) ?? "—"}`} unit="inHg" />
                <WeatherGauge icon={Layers} label="Ceiling" value={`${selected.ceiling_ft ?? "None"}`} unit={selected.ceiling_ft ? "ft AGL" : ""} warn={selected.ceiling_ft != null && selected.ceiling_ft < 1000} />
                <WeatherGauge icon={Cloud} label="Conditions" value={selected.weather_string ?? "Clear"} unit="" />
              </div>

              {/* Cloud layers */}
              {selected.clouds.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cloud Layers</h3>
                  <div className="space-y-2">
                    {selected.clouds.map((cloud, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">
                          {cloud.cover === "FEW" ? "Few" : cloud.cover === "SCT" ? "Scattered" : cloud.cover === "BKN" ? "Broken" : cloud.cover === "OVC" ? "Overcast" : cloud.cover}
                        </span>
                        <span className="text-muted-foreground">
                          {cloud.base != null ? `${cloud.base.toLocaleString()} ft AGL` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw METAR/TAF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selected.raw_metar && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Raw METAR</h3>
                    <p className="text-xs font-mono text-foreground leading-relaxed break-all">{selected.raw_metar}</p>
                  </div>
                )}
                {selected.raw_taf && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Terminal Forecast (TAF)</h3>
                    <p className="text-xs font-mono text-foreground leading-relaxed break-all">{selected.raw_taf}</p>
                  </div>
                )}
              </div>

              {/* Part 107 requirements reminder */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                    <p className="font-semibold text-foreground">14 CFR Part 107 Weather Minimums</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Minimum visibility: 3 statute miles from control station</li>
                      <li>Minimum cloud clearance: 500 ft below, 2,000 ft horizontal</li>
                      <li>Do not fly in sustained winds exceeding aircraft limitations</li>
                      <li>Visual line of sight must be maintained at all times</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-right">
                Data from Aviation Weather Center (aviationweather.gov) · Checked {format(new Date(result.checked_at), "MMM d, HH:mm z")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !checkWeather.isPending && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">Pre-Flight Weather Check</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Enter coordinates or use your current location to check METAR, TAF, and drone flight conditions from nearby weather stations. FAA Part 107 requires a weather assessment before every flight.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Weather gauge sub-component ──────────────────────────────── */

function WeatherGauge({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  warn = false,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
  unit: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${warn ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${warn ? "text-amber-500" : "text-muted-foreground"}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-foreground">
        {value}
        {unit && <span className="text-muted-foreground font-normal ml-0.5 text-xs">{unit}</span>}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
