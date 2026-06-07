// Auto-approval / rejection / escalation engine for flight authorizations.
// Applies policy based on airspace zones, altitude, and time window.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface SubmitPayload {
  mission_id: string;
  authorization_type?: "near_real_time" | "further_coordination" | "manual";
  start_time?: string;
  end_time?: string;
}

function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3440.065; // nm
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function refCode() {
  return "LAANC-" + Math.random().toString(36).slice(2, 8).toUpperCase() + "-" + Date.now().toString(36).slice(-4).toUpperCase();
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
      { global: { headers: { Authorization: authHeader } } }
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as SubmitPayload;
    if (!body?.mission_id || typeof body.mission_id !== "string") {
      return new Response(JSON.stringify({ error: "mission_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const t0 = Date.now();

    // 1. Load mission
    const { data: mission, error: mErr } = await supabase
      .from("missions")
      .select("*")
      .eq("id", body.mission_id)
      .maybeSingle();
    if (mErr || !mission) {
      return new Response(JSON.stringify({ error: mErr?.message || "Mission not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Resolve launch point from waypoints[0] or operation_area
    const wps = (mission.waypoints as any[]) ?? [];
    let lat: number | null = null;
    let lon: number | null = null;
    if (wps.length && typeof wps[0]?.latitude === "number" && typeof wps[0]?.longitude === "number") {
      lat = wps[0].latitude;
      lon = wps[0].longitude;
    } else if (mission.launch_point && typeof (mission.launch_point as any).latitude === "number") {
      lat = (mission.launch_point as any).latitude;
      lon = (mission.launch_point as any).longitude;
    }

    const altitude = mission.max_altitude_ft ?? 400;
    const start = body.start_time ?? mission.scheduled_start ?? new Date().toISOString();
    const end = body.end_time ?? mission.scheduled_end ?? new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // 3. Policy evaluation against airspace_zones (nearest active zones in region)
    let policyDecision: "approved" | "denied" | "escalated" = "approved";
    let approvedAlt: number | null = altitude;
    const conditions: string[] = [];
    const reasons: string[] = [];
    let nearestZone: any = null;
    let airspaceClass: string | null = null;
    let facilityId: string | null = null;
    let authType = body.authorization_type ?? "near_real_time";

    if (lat !== null && lon !== null) {
      const { data: zones } = await supabase
        .from("airspace_zones")
        .select("*")
        .eq("region", mission.region)
        .eq("is_active", true)
        .limit(500);

      const ranked = (zones ?? [])
        .map((z) => {
          const cp = z.center_point as any;
          if (!cp || typeof cp.latitude !== "number") return null;
          return { z, d: distanceNm(lat!, lon!, cp.latitude, cp.longitude) };
        })
        .filter((x): x is { z: any; d: number } => !!x && x.d <= 10)
        .sort((a, b) => a.d - b.d);

      nearestZone = ranked[0]?.z ?? null;

      if (nearestZone) {
        airspaceClass = nearestZone.airspace_class ?? null;
        facilityId = nearestZone.facility_id ?? null;

        const ceiling = nearestZone.auto_approval_ceiling_ft ?? null;
        const maxAllow = nearestZone.max_allowable_ft ?? null;
        const laancEnabled = !!nearestZone.laanc_enabled;
        const requiresAuth = !!nearestZone.requires_authorization;

        if (maxAllow !== null && altitude > maxAllow) {
          policyDecision = "denied";
          reasons.push(`Requested ${altitude} ft exceeds maximum allowable ${maxAllow} ft for ${nearestZone.name}.`);
        } else if (requiresAuth && !laancEnabled) {
          policyDecision = "escalated";
          authType = "further_coordination";
          reasons.push(`${nearestZone.name} requires manual coordination with ${nearestZone.authority ?? "the controlling authority"}.`);
        } else if (laancEnabled && ceiling !== null && altitude <= ceiling) {
          policyDecision = "approved";
          conditions.push(`Operate at or below ${ceiling} ft AGL within the UASFM grid for ${nearestZone.name}.`);
        } else if (laancEnabled && ceiling !== null && altitude > ceiling) {
          policyDecision = "escalated";
          approvedAlt = ceiling;
          authType = "further_coordination";
          reasons.push(`Requested ${altitude} ft exceeds UASFM auto-approval ceiling of ${ceiling} ft. Routing to ATC for further coordination.`);
        } else if (requiresAuth) {
          policyDecision = "escalated";
          reasons.push(`${nearestZone.name} is controlled airspace — manual review required.`);
        }
      }
      // If no controlled zone within 10 NM, treat as Class G uncontrolled → auto-approve up to 400 ft.
      if (!nearestZone) {
        if (altitude > 400) {
          policyDecision = "escalated";
          reasons.push(`Requested ${altitude} ft exceeds 400 ft Part 107 default ceiling in uncontrolled airspace.`);
        } else {
          conditions.push("Class G uncontrolled airspace — operate within Part 107 limits.");
        }
      }
    } else {
      // No coordinates → cannot evaluate, escalate.
      policyDecision = "escalated";
      authType = "manual";
      reasons.push("No launch coordinates on the mission — cannot evaluate airspace automatically.");
    }

    // 4. Mission-level checks: waypoint altitude vs max_altitude
    const wpOver = wps.find((w) => typeof w?.altitude_ft === "number" && w.altitude_ft > altitude);
    if (wpOver) {
      conditions.push(`Waypoint "${wpOver.name}" altitude (${wpOver.altitude_ft} ft) exceeds plan max — verify before flight.`);
    }

    // 5. Insert flight_authorization
    const status =
      policyDecision === "approved" ? "approved" :
      policyDecision === "denied" ? "denied" : "pending";

    const reference = refCode();
    const { data: authz, error: aErr } = await supabase
      .from("flight_authorizations")
      .insert({
        tenant_id: mission.tenant_id,
        region: mission.region,
        reference_code: reference,
        authorization_type: authType,
        pilot_id: mission.pilot_id,
        drone_id: mission.drone_id,
        facility_id: facilityId,
        airspace_class: airspaceClass,
        operation_area: mission.operation_area ?? { waypoints: wps, launch: { latitude: lat, longitude: lon } },
        requested_altitude_ft: altitude,
        approved_altitude_ft: policyDecision === "approved" ? altitude : (policyDecision === "escalated" ? approvedAlt : null),
        start_time: start,
        end_time: end,
        status,
        conditions: conditions.length ? conditions : null,
        denial_reason: policyDecision !== "approved" ? reasons.join(" ") : null,
        submitted_at: new Date().toISOString(),
        decided_at: policyDecision === "escalated" ? null : new Date().toISOString(),
        reviewed_by: policyDecision === "escalated" ? null : "auto-policy-engine",
        response_time_ms: Date.now() - t0,
      })
      .select()
      .single();
    if (aErr) {
      return new Response(JSON.stringify({ error: aErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Update mission
    await supabase
      .from("missions")
      .update({
        laanc_authorization_id: authz.id,
        authorization_status: status,
        status: policyDecision === "approved" ? "planned" : mission.status,
      })
      .eq("id", mission.id);

    // 7. Notification (esp. escalations)
    const notifTitle =
      policyDecision === "approved" ? "Flight authorization approved" :
      policyDecision === "denied" ? "Flight authorization denied" :
      "Flight authorization needs human review";
    const notifType = policyDecision === "escalated" ? "escalation" : `authorization_${policyDecision}`;

    if (mission.pilot_id) {
      await supabase.from("notifications").insert({
        user_id: mission.pilot_id,
        tenant_id: mission.tenant_id,
        type: notifType,
        title: notifTitle,
        message: policyDecision === "approved"
          ? `${reference} approved for ${approvedAlt} ft.`
          : reasons.join(" "),
        data: {
          authorization_id: authz.id,
          mission_id: mission.id,
          reference,
          decision: policyDecision,
          nearest_zone: nearestZone?.name ?? null,
        },
      });
    }

    // 8. Audit log
    await supabase.from("audit_logs").insert({
      tenant_id: mission.tenant_id,
      user_id: user.id,
      action: `authorization.${policyDecision}`,
      resource_type: "flight_authorization",
      resource_id: authz.id,
      region: mission.region,
      risk_level: policyDecision === "denied" ? "high" : policyDecision === "escalated" ? "medium" : "low",
      changes: { reasons, conditions, nearest_zone: nearestZone?.name ?? null, altitude, approved_altitude: approvedAlt },
    });

    return new Response(
      JSON.stringify({
        decision: policyDecision,
        status,
        reference,
        authorization: authz,
        nearest_zone: nearestZone?.name ?? null,
        reasons,
        conditions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
