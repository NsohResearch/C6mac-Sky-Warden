// Conformance monitoring: compares a live telemetry point against the mission
// plan (waypoint corridor + max altitude) and against active tenant geofences.
// Writes geofence_breaches and notifications when deviations are detected.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface TelemetryPoint {
  mission_id: string;
  drone_id?: string;
  latitude: number;
  longitude: number;
  altitude_ft: number;
  speed_mps?: number;
  heading_deg?: number;
  timestamp?: string;
}

// Great-circle distance in meters
function distanceM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Perpendicular distance (m) from point p to segment a→b. Treats lat/lon as planar
// over short distances (accurate to within ~1m at this scale).
function distanceToSegmentM(
  p: { lat: number; lng: number },
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  // Convert deg → meters using equirectangular approx around midpoint
  const midLat = (a.lat + b.lat) / 2;
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos((midLat * Math.PI) / 180);

  const ax = a.lng * mPerDegLng, ay = a.lat * mPerDegLat;
  const bx = b.lng * mPerDegLng, by = b.lat * mPerDegLat;
  const px = p.lng * mPerDegLng, py = p.lat * mPerDegLat;

  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const sx = ax + t * dx, sy = ay + t * dy;
  return Math.hypot(px - sx, py - sy);
}

// Ray-casting point-in-polygon. ring is [[lng,lat], ...]
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeofence(lat: number, lng: number, geom: any): boolean {
  if (!geom || !geom.type) return false;
  if (geom.type === "Polygon" && Array.isArray(geom.coordinates?.[0])) {
    return pointInRing(lng, lat, geom.coordinates[0]);
  }
  if (geom.type === "MultiPolygon") {
    return (geom.coordinates ?? []).some((poly: number[][][]) =>
      pointInRing(lng, lat, poly[0]),
    );
  }
  if (geom.type === "Circle" && Array.isArray(geom.center) && typeof geom.radius_m === "number") {
    return distanceM(lat, lng, geom.center[1], geom.center[0]) <= geom.radius_m;
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as TelemetryPoint;
    if (!body?.mission_id || typeof body.latitude !== "number" || typeof body.longitude !== "number") {
      return new Response(JSON.stringify({ error: "mission_id, latitude, longitude required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Load mission
    const { data: mission, error: mErr } = await supabase
      .from("missions")
      .select("id, tenant_id, pilot_id, max_altitude_ft, waypoints, region, drone_id, title")
      .eq("id", body.mission_id)
      .maybeSingle();
    if (mErr || !mission) {
      return new Response(JSON.stringify({ error: mErr?.message || "Mission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const wps = (mission.waypoints as any[]) ?? [];
    const planMaxAlt = mission.max_altitude_ft ?? 400;
    const CORRIDOR_M = 100; // ±100m corridor around the planned line
    const findings: any[] = [];

    // 2. Altitude conformance
    if (body.altitude_ft > planMaxAlt) {
      findings.push({
        type: "altitude_breach",
        severity: body.altitude_ft > planMaxAlt + 100 ? "critical" : "warning",
        message: `Altitude ${Math.round(body.altitude_ft)} ft exceeds plan max ${planMaxAlt} ft.`,
        delta_ft: Math.round(body.altitude_ft - planMaxAlt),
      });
    }

    // 3. Lateral corridor conformance
    let minCorridorM = Infinity;
    if (wps.length >= 2) {
      for (let i = 0; i < wps.length - 1; i++) {
        const a = wps[i], b = wps[i + 1];
        const aLat = a?.latitude ?? a?.lat, aLng = a?.longitude ?? a?.lng;
        const bLat = b?.latitude ?? b?.lat, bLng = b?.longitude ?? b?.lng;
        if ([aLat, aLng, bLat, bLng].some((v) => typeof v !== "number")) continue;
        const d = distanceToSegmentM(
          { lat: body.latitude, lng: body.longitude },
          { lat: aLat, lng: aLng },
          { lat: bLat, lng: bLng },
        );
        if (d < minCorridorM) minCorridorM = d;
      }
      if (minCorridorM > CORRIDOR_M && minCorridorM !== Infinity) {
        findings.push({
          type: "lateral_deviation",
          severity: minCorridorM > 250 ? "critical" : "warning",
          message: `Off-course: ${Math.round(minCorridorM)} m from planned route (corridor ${CORRIDOR_M} m).`,
          deviation_m: Math.round(minCorridorM),
        });
      }
    }

    // 4. Geofence breach check via PostGIS
    const { data: gfHits } = await supabase.rpc("airspace_conflicts_for_geom" as never, {
      _geom: `SRID=4326;POINT(${body.longitude} ${body.latitude})` as never,
      _region: mission.region,
      _buffer_m: 0,
    } as never).select("*" as never).then((r: any) => r).catch(() => ({ data: null }));

    // Tenant geofences — load + JS containment (works even if geom not synced)
    const { data: tenantFences } = await supabase
      .from("geofences")
      .select("id, name, type, enforcement, alt_max_ft, alt_min_ft, geometry")
      .eq("tenant_id", mission.tenant_id)
      .eq("status", "active");

    const breachedFences: any[] = [];
    for (const gf of tenantFences ?? []) {
      const inside = pointInGeofence(body.latitude, body.longitude, gf.geometry);
      if (!inside) continue;
      const altBreach = body.altitude_ft > (gf.alt_max_ft ?? 9999) || body.altitude_ft < (gf.alt_min_ft ?? -9999);
      const isNoFly = gf.type === "no_fly_zone" || gf.type === "restricted";
      if (isNoFly || altBreach) {
        breachedFences.push({ gf, altBreach });
        findings.push({
          type: "geofence_breach",
          severity: gf.enforcement === "hard" || isNoFly ? "critical" : "warning",
          geofence_id: gf.id,
          message: `Inside geofence "${gf.name}" (${gf.type})${altBreach ? ` — altitude ${Math.round(body.altitude_ft)} ft outside ${gf.alt_min_ft}-${gf.alt_max_ft} ft window` : ""}.`,
        });
      }
    }

    // 5. Persist breaches
    if (breachedFences.length > 0) {
      const rows = breachedFences.map(({ gf, altBreach }) => ({
        tenant_id: mission.tenant_id,
        geofence_id: gf.id,
        drone_id: body.drone_id ?? mission.drone_id ?? null,
        mission_id: mission.id,
        severity: gf.enforcement === "hard" || gf.type === "no_fly_zone" ? "critical" : "warning",
        breach_type: altBreach ? "altitude_breach" : "boundary_breach",
        latitude: body.latitude,
        longitude: body.longitude,
        altitude_ft: body.altitude_ft,
      }));
      await supabase.from("geofence_breaches").insert(rows);
    }

    // 6. Notification on any critical finding
    const critical = findings.find((f) => f.severity === "critical");
    if (critical && mission.pilot_id) {
      await supabase.from("notifications").insert({
        user_id: mission.pilot_id,
        tenant_id: mission.tenant_id,
        type: "conformance_alert",
        title: `Conformance alert: ${mission.title}`,
        message: critical.message,
        data: { mission_id: mission.id, findings, position: { lat: body.latitude, lng: body.longitude, alt_ft: body.altitude_ft } },
      });
    }

    return new Response(
      JSON.stringify({
        conformant: findings.length === 0,
        findings,
        nearest_airspace: gfHits ?? null,
        plan_max_alt_ft: planMaxAlt,
        corridor_m: CORRIDOR_M,
        lateral_deviation_m: minCorridorM === Infinity ? null : Math.round(minCorridorM),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
