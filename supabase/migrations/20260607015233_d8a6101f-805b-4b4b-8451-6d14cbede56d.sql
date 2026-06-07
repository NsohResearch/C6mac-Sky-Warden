
-- 1. Enable PostGIS (idempotent)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Geometry columns (geography for lat/lon, meters everywhere)
ALTER TABLE public.airspace_zones
  ADD COLUMN IF NOT EXISTS geom geography(Geometry, 4326);

ALTER TABLE public.geofences
  ADD COLUMN IF NOT EXISTS geom geography(Geometry, 4326);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS airspace_zones_geom_gix ON public.airspace_zones USING GIST (geom);
CREATE INDEX IF NOT EXISTS geofences_geom_gix ON public.geofences USING GIST (geom);

-- 4. Sync function: derive geom from the existing jsonb geometry (GeoJSON)
CREATE OR REPLACE FUNCTION public.sync_geom_from_geojson()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
DECLARE
  src jsonb;
BEGIN
  src := NEW.geometry;
  IF src IS NULL OR src->>'type' IS NULL THEN
    NEW.geom := NULL;
    RETURN NEW;
  END IF;

  -- Circle: synthesize a buffered point
  IF src->>'type' = 'Circle' AND src ? 'center' AND src ? 'radius_m' THEN
    NEW.geom := ST_Buffer(
      ST_SetSRID(ST_MakePoint(
        (src->'center'->>0)::float8,
        (src->'center'->>1)::float8
      ), 4326)::geography,
      (src->>'radius_m')::float8
    );
  ELSE
    -- Standard GeoJSON (Point / Polygon / LineString / MultiPolygon …)
    BEGIN
      NEW.geom := ST_SetSRID(ST_GeomFromGeoJSON(src::text), 4326)::geography;
    EXCEPTION WHEN OTHERS THEN
      NEW.geom := NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS airspace_zones_sync_geom ON public.airspace_zones;
CREATE TRIGGER airspace_zones_sync_geom
  BEFORE INSERT OR UPDATE OF geometry ON public.airspace_zones
  FOR EACH ROW EXECUTE FUNCTION public.sync_geom_from_geojson();

DROP TRIGGER IF EXISTS geofences_sync_geom ON public.geofences;
CREATE TRIGGER geofences_sync_geom
  BEFORE INSERT OR UPDATE OF geometry ON public.geofences
  FOR EACH ROW EXECUTE FUNCTION public.sync_geom_from_geojson();

-- 5. Backfill existing rows
UPDATE public.airspace_zones SET geometry = geometry WHERE geom IS NULL;
UPDATE public.geofences SET geometry = geometry WHERE geom IS NULL;

-- 6. Conflict lookup helper — finds airspace zones within `buffer_m` of a geometry
CREATE OR REPLACE FUNCTION public.airspace_conflicts_for_geom(
  _geom geography,
  _region public.region_code DEFAULT NULL,
  _buffer_m float8 DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  airspace_class text,
  authority text,
  zone_type text,
  facility_id text,
  distance_m float8,
  intersects boolean
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT
    z.id, z.name, z.airspace_class, z.authority, z.zone_type, z.facility_id,
    ST_Distance(z.geom, _geom) AS distance_m,
    ST_Intersects(z.geom, _geom) AS intersects
  FROM public.airspace_zones z
  WHERE z.is_active = true
    AND z.geom IS NOT NULL
    AND (_region IS NULL OR z.region = _region)
    AND ST_DWithin(z.geom, _geom, GREATEST(_buffer_m, 0))
  ORDER BY distance_m ASC
  LIMIT 25;
$$;

-- 7. Trigger on geofences: if it overlaps a controlled CTR, annotate metadata so the UI warns
CREATE OR REPLACE FUNCTION public.geofences_flag_airspace_conflicts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
DECLARE
  hits jsonb;
BEGIN
  IF NEW.geom IS NULL THEN RETURN NEW; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'zone_id', c.id,
    'name', c.name,
    'authority', c.authority,
    'airspace_class', c.airspace_class,
    'distance_m', round(c.distance_m::numeric, 1),
    'intersects', c.intersects
  )), '[]'::jsonb)
  INTO hits
  FROM public.airspace_conflicts_for_geom(NEW.geom, NEW.region, 500) c
  WHERE c.intersects = true OR c.distance_m < 500;

  NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb)
    || jsonb_build_object('airspace_conflicts', hits, 'airspace_conflicts_checked_at', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS geofences_airspace_conflict_check ON public.geofences;
CREATE TRIGGER geofences_airspace_conflict_check
  BEFORE INSERT OR UPDATE OF geometry ON public.geofences
  FOR EACH ROW EXECUTE FUNCTION public.geofences_flag_airspace_conflicts();

-- 8. Lock down helpers to authenticated only (these are utility functions, not anon-callable)
REVOKE EXECUTE ON FUNCTION public.airspace_conflicts_for_geom(geography, public.region_code, float8) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.airspace_conflicts_for_geom(geography, public.region_code, float8) TO authenticated, service_role;
