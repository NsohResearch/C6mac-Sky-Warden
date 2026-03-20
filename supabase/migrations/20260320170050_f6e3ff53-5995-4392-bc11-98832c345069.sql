
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.region_code AS ENUM ('US', 'CA', 'NG', 'KE', 'ZA', 'GH', 'RW', 'TZ', 'ET', 'SN', 'CI', 'UG');
CREATE TYPE public.persona_type AS ENUM ('individual_pilot', 'enterprise_manager', 'agency_representative', 'developer');

-- ============================================================
-- UTILITY FUNCTION: update_updated_at_column
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region public.region_code NOT NULL DEFAULT 'US',
  country_name TEXT NOT NULL DEFAULT 'United States',
  regulatory_authority TEXT NOT NULL DEFAULT 'FAA',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise', 'agency')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- USER PROFILES
-- ============================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  persona public.persona_type NOT NULL DEFAULT 'individual_pilot',
  avatar_url TEXT,
  region public.region_code NOT NULL DEFAULT 'US',
  timezone TEXT DEFAULT 'America/New_York',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_user_profiles_tenant ON public.user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_persona ON public.user_profiles(persona);
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USER ROLES (junction)
-- ============================================================
CREATE TABLE public.user_roles (
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PILOT PROFILES
-- ============================================================
CREATE TABLE public.pilot_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  region public.region_code NOT NULL,
  part107_certificate_number TEXT,
  part107_expires_at TIMESTAMPTZ,
  trust_completion_date DATE,
  faa_tracking_number TEXT,
  rpas_basic_certificate TEXT,
  rpas_advanced_certificate TEXT,
  tc_pilot_certificate_expiry TIMESTAMPTZ,
  sfoc_numbers TEXT[],
  national_license_number TEXT,
  national_license_authority TEXT,
  national_license_expiry TIMESTAMPTZ,
  total_flight_hours DECIMAL(10,2) DEFAULT 0,
  endorsements TEXT[] DEFAULT '{}',
  medical_certificate_expiry DATE,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_expiry DATE,
  assigned_drone_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pilot_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_pilot_profiles_updated_at BEFORE UPDATE ON public.pilot_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- DRONES
-- ============================================================
CREATE TABLE public.drones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nickname TEXT,
  serial_number TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('micro', 'small', 'medium', 'large')),
  weight_grams INTEGER,
  max_altitude_ft INTEGER DEFAULT 400,
  max_flight_time_minutes INTEGER,
  max_speed_mps DECIMAL(6,2),
  region public.region_code NOT NULL,
  faa_registration_number TEXT,
  tc_registration_number TEXT,
  national_registration_number TEXT,
  registration_expiry TIMESTAMPTZ,
  remote_id_type TEXT CHECK (remote_id_type IN ('standard', 'broadcast_module', 'none')),
  remote_id_serial TEXT,
  remote_id_compliant BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'grounded', 'maintenance', 'in_flight', 'returning', 'charging', 'decommissioned')),
  current_location JSONB,
  total_flight_hours DECIMAL(10,2) DEFAULT 0,
  total_flights INTEGER DEFAULT 0,
  battery_cycle_count INTEGER DEFAULT 0,
  next_maintenance_due TIMESTAMPTZ,
  firmware_version TEXT,
  image_url TEXT,
  documents JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_drones_tenant ON public.drones(tenant_id);
CREATE INDEX idx_drones_status ON public.drones(tenant_id, status);
CREATE TRIGGER update_drones_updated_at BEFORE UPDATE ON public.drones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- MISSIONS
-- ============================================================
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL CHECK (mission_type IN (
    'mapping', 'inspection', 'survey', 'photography', 'videography',
    'delivery', 'search_rescue', 'surveillance', 'agriculture',
    'construction', 'emergency', 'training', 'research', 'custom'
  )),
  region public.region_code NOT NULL,
  pilot_id UUID REFERENCES public.user_profiles(id),
  drone_id UUID REFERENCES public.drones(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'planned', 'preflight_check', 'awaiting_authorization',
    'authorized', 'in_progress', 'paused', 'completed', 'aborted', 'cancelled'
  )),
  operation_area JSONB,
  launch_point JSONB,
  waypoints JSONB,
  max_altitude_ft INTEGER DEFAULT 400,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  laanc_authorization_id UUID,
  authorization_status TEXT,
  preflight_checklist JSONB DEFAULT '[]',
  weather_check JSONB,
  risk_score INTEGER,
  flight_log JSONB,
  incidents JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_missions_tenant ON public.missions(tenant_id);
CREATE INDEX idx_missions_status ON public.missions(tenant_id, status);
CREATE INDEX idx_missions_pilot ON public.missions(pilot_id);
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- AIRSPACE ZONES
-- ============================================================
CREATE TABLE public.airspace_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region public.region_code NOT NULL,
  zone_type TEXT NOT NULL,
  airspace_class TEXT,
  name TEXT NOT NULL,
  description TEXT,
  authority TEXT,
  facility_id TEXT,
  geometry JSONB NOT NULL,
  center_point JSONB,
  floor_ft INTEGER DEFAULT 0,
  ceiling_ft INTEGER DEFAULT 400,
  max_allowable_ft INTEGER,
  laanc_enabled BOOLEAN DEFAULT false,
  auto_approval_ceiling_ft INTEGER,
  requires_authorization BOOLEAN DEFAULT false,
  effective_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  source TEXT,
  source_id TEXT,
  chart_cycle TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.airspace_zones ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_airspace_zones_region ON public.airspace_zones(region);
CREATE INDEX idx_airspace_zones_active ON public.airspace_zones(is_active, region);
CREATE TRIGGER update_airspace_zones_updated_at BEFORE UPDATE ON public.airspace_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FLIGHT AUTHORIZATIONS
-- ============================================================
CREATE TABLE public.flight_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  reference_code TEXT UNIQUE NOT NULL,
  region public.region_code NOT NULL,
  authorization_type TEXT NOT NULL,
  pilot_id UUID REFERENCES public.user_profiles(id),
  drone_id UUID REFERENCES public.drones(id),
  facility_id TEXT,
  airspace_class TEXT,
  operation_area JSONB NOT NULL,
  requested_altitude_ft INTEGER NOT NULL,
  approved_altitude_ft INTEGER,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'submitted', 'auto_approved', 'under_review',
    'approved', 'conditionally_approved', 'denied', 'expired',
    'cancelled', 'rescinded'
  )),
  response_time_ms INTEGER,
  conditions TEXT[],
  denial_reason TEXT,
  reviewed_by TEXT,
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.flight_authorizations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_flight_auths_tenant ON public.flight_authorizations(tenant_id);
CREATE INDEX idx_flight_auths_status ON public.flight_authorizations(tenant_id, status);
CREATE TRIGGER update_flight_auths_updated_at BEFORE UPDATE ON public.flight_authorizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- REMOTE ID BROADCASTS
-- ============================================================
CREATE TABLE public.remote_id_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES public.drones(id),
  tenant_id UUID REFERENCES public.tenants(id),
  region public.region_code NOT NULL,
  uas_id TEXT NOT NULL,
  broadcast_method TEXT CHECK (broadcast_method IN ('wifi_nan', 'bluetooth_le', 'bluetooth_legacy', 'network')),
  uas_latitude DECIMAL(10,7),
  uas_longitude DECIMAL(10,7),
  uas_altitude_ft DECIMAL(8,2),
  uas_speed_mps DECIMAL(6,2),
  uas_heading_deg DECIMAL(5,2),
  operator_latitude DECIMAL(10,7),
  operator_longitude DECIMAL(10,7),
  operator_altitude_ft DECIMAL(8,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.remote_id_broadcasts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_remote_id_timestamp ON public.remote_id_broadcasts(timestamp DESC);
CREATE INDEX idx_remote_id_drone ON public.remote_id_broadcasts(drone_id, timestamp DESC);

-- ============================================================
-- AUDIT LOGS (immutable)
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  user_id UUID REFERENCES public.user_profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  region public.region_code,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_logs_tenant ON public.audit_logs(tenant_id, created_at DESC);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

-- ============================================================
-- AGENCY RULES
-- ============================================================
CREATE TABLE public.agency_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  region public.region_code NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'altitude_restriction', 'no_fly_zone', 'time_restriction',
    'noise_restriction', 'privacy_zone', 'temporary_restriction', 'operational_requirement'
  )),
  geometry JSONB,
  parameters JSONB,
  effective_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  enforcement_level TEXT DEFAULT 'mandatory' CHECK (enforcement_level IN ('advisory', 'mandatory', 'prohibited')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.agency_rules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_agency_rules_updated_at BEFORE UPDATE ON public.agency_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- API KEYS
-- ============================================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  environment TEXT DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper function: get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
$$;

-- TENANTS: users can see their own tenant
CREATE POLICY "Users can view own tenant" ON public.tenants FOR SELECT USING (
  id = public.get_user_tenant_id()
);
CREATE POLICY "Users can update own tenant" ON public.tenants FOR UPDATE USING (
  id = public.get_user_tenant_id()
);

-- USER PROFILES: tenant isolation + own profile
CREATE POLICY "Users can view own tenant profiles" ON public.user_profiles FOR SELECT USING (
  tenant_id = public.get_user_tenant_id() OR id = auth.uid()
);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (
  id = auth.uid()
);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (
  id = auth.uid()
);

-- ROLES: tenant isolation
CREATE POLICY "Users can view own tenant roles" ON public.roles FOR SELECT USING (
  tenant_id = public.get_user_tenant_id()
);

-- USER ROLES: tenant isolation via user_profiles
CREATE POLICY "Users can view own tenant user_roles" ON public.user_roles FOR SELECT USING (
  user_id IN (SELECT id FROM public.user_profiles WHERE tenant_id = public.get_user_tenant_id())
);

-- PILOT PROFILES: tenant isolation
CREATE POLICY "Tenant isolation" ON public.pilot_profiles FOR ALL USING (
  tenant_id = public.get_user_tenant_id()
);

-- DRONES: tenant isolation
CREATE POLICY "Tenant isolation" ON public.drones FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert" ON public.drones FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant update" ON public.drones FOR UPDATE USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant delete" ON public.drones FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- MISSIONS: tenant isolation
CREATE POLICY "Tenant isolation" ON public.missions FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert" ON public.missions FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant update" ON public.missions FOR UPDATE USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant delete" ON public.missions FOR DELETE USING (tenant_id = public.get_user_tenant_id());

-- AIRSPACE ZONES: public read
CREATE POLICY "Public read" ON public.airspace_zones FOR SELECT USING (true);

-- FLIGHT AUTHORIZATIONS: tenant isolation
CREATE POLICY "Tenant isolation" ON public.flight_authorizations FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert" ON public.flight_authorizations FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant update" ON public.flight_authorizations FOR UPDATE USING (tenant_id = public.get_user_tenant_id());

-- REMOTE ID BROADCASTS: tenant isolation
CREATE POLICY "Tenant isolation" ON public.remote_id_broadcasts FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert" ON public.remote_id_broadcasts FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

-- AUDIT LOGS: tenant read-only
CREATE POLICY "Tenant read" ON public.audit_logs FOR SELECT USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Tenant insert" ON public.audit_logs FOR INSERT WITH CHECK (tenant_id = public.get_user_tenant_id());

-- NOTIFICATIONS: user-scoped
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- AGENCY RULES: agencies manage own, public read active
CREATE POLICY "Agency manage own" ON public.agency_rules FOR ALL USING (tenant_id = public.get_user_tenant_id());
CREATE POLICY "Public read active" ON public.agency_rules FOR SELECT USING (is_active = true);

-- API KEYS: tenant isolation
CREATE POLICY "Tenant isolation" ON public.api_keys FOR ALL USING (tenant_id = public.get_user_tenant_id());

-- ============================================================
-- AUTO-CREATE TENANT + PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_id_var UUID;
  user_region public.region_code;
  user_authority TEXT;
BEGIN
  user_region := COALESCE((NEW.raw_user_meta_data->>'region')::public.region_code, 'US');
  
  user_authority := CASE user_region
    WHEN 'US' THEN 'FAA'
    WHEN 'CA' THEN 'Transport Canada'
    WHEN 'NG' THEN 'NCAA'
    WHEN 'KE' THEN 'KCAA'
    WHEN 'ZA' THEN 'SACAA'
    WHEN 'GH' THEN 'GCAA'
    WHEN 'RW' THEN 'RCAA'
    WHEN 'TZ' THEN 'TCAA'
    WHEN 'ET' THEN 'ECAA'
    WHEN 'SN' THEN 'ANACS'
    WHEN 'CI' THEN 'ANAC'
    WHEN 'UG' THEN 'UCAA'
    ELSE 'ICAO'
  END;

  INSERT INTO public.tenants (name, slug, region, regulatory_authority)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), ' ', '-')) || '-' || LEFT(NEW.id::text, 8),
    user_region,
    user_authority
  )
  RETURNING id INTO tenant_id_var;

  INSERT INTO public.user_profiles (id, tenant_id, display_name, email, phone, persona, region)
  VALUES (
    NEW.id,
    tenant_id_var,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.phone,
    COALESCE((NEW.raw_user_meta_data->>'persona')::public.persona_type, 'individual_pilot'),
    user_region
  );

  -- Create default role for the user
  INSERT INTO public.roles (tenant_id, name, permissions, is_system)
  VALUES (tenant_id_var, 'tenant_admin', ARRAY[
    'fleet:read', 'fleet:write', 'fleet:delete',
    'missions:read', 'missions:write', 'missions:delete',
    'airspace:read', 'laanc:read', 'laanc:write',
    'analytics:read', 'settings:read', 'settings:write',
    'team:read', 'team:write', 'compliance:read'
  ], true)
  RETURNING id INTO tenant_id_var; -- reuse variable for role_id

  INSERT INTO public.user_roles (user_id, role_id, granted_by)
  VALUES (NEW.id, tenant_id_var, NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
