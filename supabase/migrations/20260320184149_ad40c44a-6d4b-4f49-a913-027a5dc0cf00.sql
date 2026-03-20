
CREATE TYPE public.safety_report_type AS ENUM ('mandatory', 'voluntary_nasa_asrs');
CREATE TYPE public.safety_report_status AS ENUM ('draft', 'submitted', 'under_investigation', 'closed', 'overdue');

CREATE TABLE public.safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  reporter_id UUID REFERENCES public.user_profiles(id),
  report_type safety_report_type NOT NULL DEFAULT 'mandatory',
  status safety_report_status NOT NULL DEFAULT 'draft',
  region public.region_code NOT NULL DEFAULT 'US',
  incident_date TIMESTAMPTZ NOT NULL,
  filing_deadline TIMESTAMPTZ,
  location_description TEXT,
  location_coords JSONB,
  involves_injury BOOLEAN DEFAULT false,
  injury_severity TEXT,
  property_damage_usd NUMERIC DEFAULT 0,
  airspace_violation BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  description TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  lessons_learned TEXT,
  nasa_asrs_number TEXT,
  nasa_6_conditions_met BOOLEAN DEFAULT false,
  enforcement_protection BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES public.user_profiles(id),
  investigation_notes JSONB DEFAULT '[]'::jsonb,
  investigation_started_at TIMESTAMPTZ,
  investigation_closed_at TIMESTAMPTZ,
  drone_id UUID REFERENCES public.drones(id),
  mission_id UUID REFERENCES public.missions(id),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.safety_reports
  FOR ALL TO authenticated
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE TYPE public.b4ufly_advisory_level AS ENUM ('green', 'yellow', 'red');

CREATE TABLE public.b4ufly_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  user_id UUID REFERENCES public.user_profiles(id),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  altitude_ft INTEGER DEFAULT 400,
  check_radius_nm NUMERIC DEFAULT 5,
  overall_advisory b4ufly_advisory_level NOT NULL DEFAULT 'green',
  uasfm_ceiling_ft INTEGER,
  laanc_available BOOLEAN DEFAULT false,
  check_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  tfr_count INTEGER DEFAULT 0,
  notam_count INTEGER DEFAULT 0,
  airport_count INTEGER DEFAULT 0,
  sua_count INTEGER DEFAULT 0,
  national_park_nearby BOOLEAN DEFAULT false,
  stadium_nearby BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  region public.region_code NOT NULL DEFAULT 'US'
);

ALTER TABLE public.b4ufly_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.b4ufly_checks
  FOR ALL TO authenticated
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());

CREATE TYPE public.rid_compliance_type AS ENUM ('standard_rid', 'broadcast_module', 'fria');

CREATE TABLE public.remote_id_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  drone_id UUID NOT NULL REFERENCES public.drones(id),
  compliance_type rid_compliance_type NOT NULL DEFAULT 'standard_rid',
  serial_number_valid BOOLEAN DEFAULT false,
  serial_format TEXT,
  broadcast_rate_hz NUMERIC,
  position_accuracy_ft NUMERIC,
  altitude_accuracy_ft NUMERIC,
  latency_seconds NUMERIC,
  broadcast_performance_pass BOOLEAN DEFAULT false,
  is_compliant BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  next_verification_due TIMESTAMPTZ,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.remote_id_compliance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.remote_id_compliance
  FOR ALL TO authenticated
  USING (tenant_id = get_user_tenant_id())
  WITH CHECK (tenant_id = get_user_tenant_id());
