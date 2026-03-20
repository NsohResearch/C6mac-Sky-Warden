import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Radio,
  Battery,
  Gauge,
  Mountain,
  Compass,
  Signal,
  Clock,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Layers,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

// Leaflet CSS is imported via index.css
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";

/* ── Types ─────────────────────────────────────────────────────── */

interface TelemetryPoint {
  id: string;
  drone_id: string | null;
  uas_id: string;
  uas_latitude: number | null;
  uas_longitude: number | null;
  uas_altitude_ft: number | null;
  uas_speed_mps: number | null;
  uas_heading_deg: number | null;
  operator_latitude: number | null;
  operator_longitude: number | null;
  operator_altitude_ft: number | null;
  broadcast_method: string | null;
  timestamp: string;
}

interface DroneInfo {
  id: string;
  nickname: string | null;
  manufacturer: string;
  model: string;
  serial_number: string;
  status: string;
  battery_cycle_count: number | null;
  total_flight_hours: number | null;
  max_altitude_ft: number | null;
}

/* ── Custom Leaflet icons ──────────────────────────────────────── */

function createDroneIcon(status: "active" | "idle" | "warning") {
  const colors = {
    active: "#22c55e",
    idle: "#94a3b8",
    warning: "#f59e0b",
  };
  const color = colors[status];

  return L.divIcon({
    className: "drone-marker",
    html: `<div style="
      width: 32px; height: 32px; 
      background: ${color}20; 
      border: 2px solid ${color}; 
      border-radius: 50%; 
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 12px ${color}40;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const operatorIcon = L.divIcon({
  className: "operator-marker",
  html: `<div style="
    width: 24px; height: 24px;
    background: hsl(221 83% 53%);
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ── Map auto-fit component ────────────────────────────────────── */

function MapFitter({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points.length]); // Only re-fit when count changes
  return null;
}

/* ── Main component ────────────────────────────────────────────── */

export default function LiveTelemetry() {
  const { profile } = useAuth();
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [telemetryData, setTelemetryData] = useState<Map<string, TelemetryPoint[]>>(new Map());
  const [liveCount, setLiveCount] = useState(0);

  // Fetch fleet drones
  const { data: drones = [] } = useQuery<DroneInfo[]>({
    queryKey: ["telemetry-fleet"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drones")
        .select("id, nickname, manufacturer, model, serial_number, status, battery_cycle_count, total_flight_hours, max_altitude_ft")
        .order("nickname");
      if (error) throw error;
      return (data ?? []) as DroneInfo[];
    },
  });

  // Fetch recent broadcasts (last 30 min)
  const { data: recentBroadcasts = [] } = useQuery<TelemetryPoint[]>({
    queryKey: ["recent-broadcasts"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("remote_id_broadcasts")
        .select("*")
        .gte("timestamp", since)
        .order("timestamp", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TelemetryPoint[];
    },
    refetchInterval: 10000,
  });

  // Group broadcasts by drone
  useEffect(() => {
    const grouped = new Map<string, TelemetryPoint[]>();
    for (const b of recentBroadcasts) {
      const key = b.drone_id ?? b.uas_id;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(b);
    }
    setTelemetryData(grouped);
    setLiveCount(grouped.size);
  }, [recentBroadcasts]);

  // Subscribe to realtime broadcasts
  useEffect(() => {
    const channel = supabase
      .channel("live-telemetry")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "remote_id_broadcasts" },
        (payload) => {
          const newPoint = payload.new as TelemetryPoint;
          setTelemetryData((prev) => {
            const next = new Map(prev);
            const key = newPoint.drone_id ?? newPoint.uas_id;
            const existing = next.get(key) ?? [];
            next.set(key, [...existing.slice(-99), newPoint]);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute map points
  const allPoints: [number, number][] = [];
  telemetryData.forEach((points) => {
    const last = points[points.length - 1];
    if (last?.uas_latitude != null && last?.uas_longitude != null) {
      allPoints.push([last.uas_latitude, last.uas_longitude]);
    }
  });

  // Selected drone's data
  const selectedPoints = selectedDroneId ? telemetryData.get(selectedDroneId) ?? [] : [];
  const selectedLatest = selectedPoints[selectedPoints.length - 1] ?? null;
  const selectedDrone = drones.find((d) => d.id === selectedDroneId);

  // Trail path for selected drone
  const trailPath: [number, number][] = selectedPoints
    .filter((p) => p.uas_latitude != null && p.uas_longitude != null)
    .map((p) => [p.uas_latitude!, p.uas_longitude!]);

  const defaultCenter: [number, number] = profile?.region === "US" ? [39.8283, -98.5795] : [0, 20];
  const defaultZoom = profile?.region === "US" ? 4 : 3;

  return (
    <div className={`flex flex-col ${fullscreen ? "fixed inset-0 z-50 bg-background" : "h-full"}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Live Telemetry</h1>
            <p className="text-xs text-muted-foreground">
              Real-time fleet tracking · {liveCount} active broadcast{liveCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </div>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 rounded-md hover:bg-muted transition-colors active:scale-[0.96]"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4 text-muted-foreground" /> : <Maximize2 className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — Fleet list */}
        <div className="w-72 border-r border-border bg-card overflow-y-auto shrink-0">
          <div className="p-3 border-b border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fleet Status</h2>
          </div>
          <div className="p-2 space-y-1">
            {drones.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-6 text-center">
                No drones in your fleet yet.
              </p>
            )}
            {drones.map((drone) => {
              const broadcasts = telemetryData.get(drone.id);
              const lastPoint = broadcasts?.[broadcasts.length - 1];
              const isLive = lastPoint && Date.now() - new Date(lastPoint.timestamp).getTime() < 60000;
              const isSelected = selectedDroneId === drone.id;

              return (
                <button
                  key={drone.id}
                  onClick={() => setSelectedDroneId(isSelected ? null : drone.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? "bg-accent/10 border border-accent/30"
                      : "hover:bg-muted/60 border border-transparent"
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isLive ? "bg-emerald-500 animate-pulse" : drone.status === "active" ? "bg-amber-400" : "bg-muted-foreground/30"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {drone.nickname || `${drone.manufacturer} ${drone.model}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isLive
                        ? `Alt ${lastPoint!.uas_altitude_ft?.toFixed(0) ?? "—"}ft · ${lastPoint!.uas_speed_mps?.toFixed(1) ?? "—"} m/s`
                        : drone.status === "active" ? "No telemetry" : drone.status
                      }
                    </p>
                  </div>
                  {isLive && (
                    <Signal className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {allPoints.length > 0 && <MapFitter points={allPoints} />}

            {/* Drone markers */}
            {Array.from(telemetryData.entries()).map(([droneId, points]) => {
              const last = points[points.length - 1];
              if (!last?.uas_latitude || !last?.uas_longitude) return null;
              const isLive = Date.now() - new Date(last.timestamp).getTime() < 60000;
              const drone = drones.find((d) => d.id === droneId);

              return (
                <Marker
                  key={droneId}
                  position={[last.uas_latitude, last.uas_longitude]}
                  icon={createDroneIcon(isLive ? "active" : "idle")}
                  eventHandlers={{
                    click: () => setSelectedDroneId(droneId),
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1 min-w-[160px]">
                      <p className="font-semibold">{drone?.nickname ?? last.uas_id}</p>
                      <p>Alt: {last.uas_altitude_ft?.toFixed(0) ?? "—"} ft</p>
                      <p>Speed: {last.uas_speed_mps?.toFixed(1) ?? "—"} m/s</p>
                      <p>Heading: {last.uas_heading_deg?.toFixed(0) ?? "—"}°</p>
                      <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(last.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Operator marker for selected drone */}
            {selectedLatest?.operator_latitude && selectedLatest?.operator_longitude && (
              <Marker
                position={[selectedLatest.operator_latitude, selectedLatest.operator_longitude]}
                icon={operatorIcon}
              >
                <Popup>
                  <p className="text-xs font-medium">Operator Position</p>
                </Popup>
              </Marker>
            )}

            {/* Flight trail for selected drone */}
            {trailPath.length > 1 && (
              <Polyline
                positions={trailPath}
                pathOptions={{
                  color: "#22c55e",
                  weight: 2,
                  opacity: 0.7,
                  dashArray: "6 4",
                }}
              />
            )}
          </MapContainer>

          {/* Telemetry HUD overlay for selected drone */}
          {selectedLatest && selectedDrone && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {selectedDrone.nickname || `${selectedDrone.manufacturer} ${selectedDrone.model}`}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      SN: {selectedDrone.serial_number} · {selectedLatest.broadcast_method ?? "Unknown"} broadcast
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDroneId(null)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  <TelemetryGauge
                    icon={Mountain}
                    label="Altitude"
                    value={selectedLatest.uas_altitude_ft?.toFixed(0) ?? "—"}
                    unit="ft"
                    warn={selectedLatest.uas_altitude_ft != null && selectedLatest.uas_altitude_ft > (selectedDrone.max_altitude_ft ?? 400)}
                  />
                  <TelemetryGauge
                    icon={Gauge}
                    label="Speed"
                    value={selectedLatest.uas_speed_mps?.toFixed(1) ?? "—"}
                    unit="m/s"
                  />
                  <TelemetryGauge
                    icon={Compass}
                    label="Heading"
                    value={selectedLatest.uas_heading_deg?.toFixed(0) ?? "—"}
                    unit="°"
                  />
                  <TelemetryGauge
                    icon={Battery}
                    label="Battery Cycles"
                    value={String(selectedDrone.battery_cycle_count ?? "—")}
                    unit=""
                  />
                  <TelemetryGauge
                    icon={Clock}
                    label="Flight Hours"
                    value={selectedDrone.total_flight_hours?.toFixed(1) ?? "—"}
                    unit="h"
                  />
                  <TelemetryGauge
                    icon={Signal}
                    label="Last Update"
                    value={formatDistanceToNow(new Date(selectedLatest.timestamp), { addSuffix: true })}
                    unit=""
                    small
                  />
                </div>
              </div>
            </div>
          )}

          {/* Empty state overlay */}
          {telemetryData.size === 0 && drones.length > 0 && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
              <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl p-8 text-center max-w-sm pointer-events-auto">
                <Radio className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">No Active Broadcasts</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When your drones start broadcasting Remote ID telemetry, their positions will appear here in real time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Telemetry gauge sub-component ─────────────────────────────── */

function TelemetryGauge({
  icon: Icon,
  label,
  value,
  unit,
  warn = false,
  small = false,
}: {
  icon: typeof Mountain;
  label: string;
  value: string;
  unit: string;
  warn?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${warn ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-background/50"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3 h-3 ${warn ? "text-amber-500" : "text-muted-foreground"}`} />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {warn && <AlertTriangle className="w-3 h-3 text-amber-500" />}
      </div>
      <p className={`font-bold text-foreground ${small ? "text-xs" : "text-sm"}`}>
        {value}
        {unit && <span className="text-muted-foreground font-normal ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
