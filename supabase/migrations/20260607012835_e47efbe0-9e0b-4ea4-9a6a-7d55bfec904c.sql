
-- Geofence type / status / enforcement enums
DO $$ BEGIN
  CREATE TYPE public.geofence_type AS ENUM ('no_fly','operational_boundary','advisory','temporary_restriction','emergency');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.geofence_status AS ENUM ('active','inactive','expired','pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.geofence_enforcement AS ENUM ('hard','soft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_by UUID,
  name TEXT NOT NULL,
  description TEXT,
  type public.geofence_type NOT NULL DEFAULT 'operational_boundary',
  status public.geofence_status NOT NULL DEFAULT 'active',
  enforcement public.geofence_enforcement NOT NULL DEFAULT 'soft',
  region public.region_code NOT NULL DEFAULT 'US',
  alt_min_ft INTEGER NOT NULL DEFAULT 0,
  alt_max_ft INTEGER NOT NULL DEFAULT 400,
  geometry JSONB NOT NULL,
  area_sq_meters NUMERIC,
  source TEXT NOT NULL DEFAULT 'User Created',
  source_reference TEXT,
  effective_from TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  breach_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.geofences TO authenticated;
GRANT ALL ON public.geofences TO service_role;
ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select geofences" ON public.geofences
  FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert geofences" ON public.geofences
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant update geofences" ON public.geofences
  FOR UPDATE TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant delete geofences" ON public.geofences
  FOR DELETE TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE TRIGGER trg_geofences_updated_at
  BEFORE UPDATE ON public.geofences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_geofences_tenant ON public.geofences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_geofences_status ON public.geofences(status);

-- Breach log
CREATE TABLE IF NOT EXISTS public.geofence_breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  geofence_id UUID NOT NULL REFERENCES public.geofences(id) ON DELETE CASCADE,
  drone_id UUID,
  mission_id UUID,
  severity TEXT NOT NULL DEFAULT 'warning',
  breach_type TEXT NOT NULL DEFAULT 'breach',
  latitude NUMERIC,
  longitude NUMERIC,
  altitude_ft NUMERIC,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.geofence_breaches TO authenticated;
GRANT ALL ON public.geofence_breaches TO service_role;
ALTER TABLE public.geofence_breaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select breaches" ON public.geofence_breaches
  FOR SELECT TO authenticated USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert breaches" ON public.geofence_breaches
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant update breaches" ON public.geofence_breaches
  FOR UPDATE TO authenticated USING (tenant_id = public.get_user_tenant_id());

CREATE INDEX IF NOT EXISTS idx_breaches_tenant ON public.geofence_breaches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_breaches_geofence ON public.geofence_breaches(geofence_id);
