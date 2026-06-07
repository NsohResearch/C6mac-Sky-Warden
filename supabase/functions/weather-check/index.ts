import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WeatherRequest {
  latitude: number;
  longitude: number;
  radius_nm?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, radius_nm = 30 }: WeatherRequest = await req.json();

    if (!latitude || !longitude) {
      return new Response(JSON.stringify({ error: "latitude and longitude required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aviation Weather Center API expects a bounding box (minLat,minLon,maxLat,maxLon).
    // Convert the requested radius (NM) into a lat/lon delta.
    const latDelta = radius_nm / 60; // 1 deg lat ≈ 60 NM
    const lonDelta = radius_nm / (60 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));
    const minLat = (latitude - latDelta).toFixed(4);
    const maxLat = (latitude + latDelta).toFixed(4);
    const minLon = (longitude - lonDelta).toFixed(4);
    const maxLon = (longitude + lonDelta).toFixed(4);
    const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;

    const metarUrl = `https://aviationweather.gov/api/data/metar?bbox=${bbox}&format=json&taf=false`;
    const metarRes = await fetch(metarUrl, {
      headers: { "User-Agent": "SkyWarden/1.0 (drone-ops-platform)" },
    });

    let metars: any[] = [];
    if (metarRes.ok) {
      const text = await metarRes.text();
      try {
        metars = JSON.parse(text);
      } catch {
        metars = [];
      }
    }

    // Fetch TAF data separately using the same bbox
    const tafUrl = `https://aviationweather.gov/api/data/taf?bbox=${bbox}&format=json`;
    const tafRes = await fetch(tafUrl, {
      headers: { "User-Agent": "SkyWarden/1.0 (drone-ops-platform)" },
    });

    let tafs: any[] = [];
    if (tafRes.ok) {
      const text = await tafRes.text();
      try {
        tafs = JSON.parse(text);
      } catch {
        tafs = [];
      }
    }

    // Sort by distance from requested location, keep nearest 20
    const haversineNm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const R = 3440.065; // NM
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(a));
    };
    metars = metars
      .map((m: any) => ({ ...m, _dist: haversineNm(latitude, longitude, m.lat, m.lon) }))
      .sort((a: any, b: any) => a._dist - b._dist)
      .slice(0, 20);

    // Parse and enrich METAR data
    const stations = metars.map((m: any) => {
      const windSpeedKt = m.wspd ?? null;
      const windGustKt = m.wgst ?? null;
      const visibilitySM = m.visib ?? null;
      const tempC = m.temp ?? null;
      const dewpointC = m.dewp ?? null;
      const altimeterInHg = m.altim ?? null;
      const flightCategory = m.fltcat ?? "UNKNOWN";
      const clouds = m.clouds ?? [];

      // Determine drone flight suitability
      let advisory: "green" | "yellow" | "red" = "green";
      const warnings: string[] = [];

      if (windSpeedKt != null && windSpeedKt > 20) {
        advisory = "red";
        warnings.push(`Wind ${windSpeedKt} kt exceeds safe limit`);
      } else if (windSpeedKt != null && windSpeedKt > 15) {
        advisory = "yellow";
        warnings.push(`Wind ${windSpeedKt} kt — use caution`);
      }

      if (windGustKt != null && windGustKt > 25) {
        advisory = "red";
        warnings.push(`Gusts ${windGustKt} kt — unsafe for most UAS`);
      }

      if (visibilitySM != null && visibilitySM < 3) {
        advisory = "red";
        warnings.push(`Visibility ${visibilitySM} SM below Part 107 minimum`);
      } else if (visibilitySM != null && visibilitySM < 5) {
        if (advisory !== "red") advisory = "yellow";
        warnings.push(`Visibility ${visibilitySM} SM — reduced`);
      }

      if (flightCategory === "IFR" || flightCategory === "LIFR") {
        advisory = "red";
        warnings.push(`${flightCategory} conditions — not suitable for UAS`);
      } else if (flightCategory === "MVFR") {
        if (advisory !== "red") advisory = "yellow";
        warnings.push("MVFR conditions — marginal for UAS ops");
      }

      // Check cloud ceiling for Part 107 (must stay 500ft below clouds)
      const lowestCeiling = clouds.find((c: any) => c.cover === "BKN" || c.cover === "OVC");
      if (lowestCeiling && lowestCeiling.base != null) {
        const ceilingFt = lowestCeiling.base;
        if (ceilingFt < 1000) {
          advisory = "red";
          warnings.push(`Ceiling ${ceilingFt} ft AGL — too low for UAS (need 500ft clearance)`);
        } else if (ceilingFt < 1500) {
          if (advisory !== "red") advisory = "yellow";
          warnings.push(`Ceiling ${ceilingFt} ft AGL — limits max altitude`);
        }
      }

      // Match TAF for this station
      const stationTaf = tafs.find((t: any) => t.icaoId === m.icaoId);

      return {
        station_id: m.icaoId ?? m.stationId,
        station_name: m.name ?? m.icaoId,
        latitude: m.lat,
        longitude: m.lon,
        observation_time: m.reportTime ?? m.obsTime,
        raw_metar: m.rawOb ?? m.rawMETAR,
        raw_taf: stationTaf?.rawTAF ?? stationTaf?.rawOb ?? null,
        wind_speed_kt: windSpeedKt,
        wind_gust_kt: windGustKt,
        wind_direction_deg: m.wdir ?? null,
        visibility_sm: visibilitySM,
        temperature_c: tempC,
        dewpoint_c: dewpointC,
        altimeter_inhg: altimeterInHg,
        flight_category: flightCategory,
        clouds,
        ceiling_ft: lowestCeiling?.base ?? null,
        weather_string: m.wxString ?? null,
        advisory,
        warnings,
      };
    });

    // Sort by distance (closest first — already sorted by API)
    return new Response(
      JSON.stringify({
        stations,
        checked_at: new Date().toISOString(),
        location: { latitude, longitude },
        radius_nm,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Weather check error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
