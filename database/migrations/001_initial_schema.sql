-- C6macEye Database Schema
-- PostgreSQL 16+ with PostGIS and TimescaleDB extensions
-- All tables enforce Row-Level Security (RLS) for tenant isolation

-- ═══════════════════════════════════════════════════════════════
-- Extensions
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE persona_type AS ENUM (
  'individual_pilot', 'enterprise_manager', 'agency_representative', 'developer'
);

CREATE TYPE system_role AS ENUM (
  'super_admin', 'tenant_admin', 'fleet_manager', 'pilot',
  'safety_officer', 'agency_admin', 'agency_operator', 'developer', 'viewer'
);

CREATE TYPE tenant_type AS ENUM ('individual', 'enterprise', 'agency', 'developer');
CREATE TYPE tenant_plan AS ENUM ('free', 'pro', 'enterprise', 'agency', 'developer');

CREATE TYPE drone_status AS ENUM (
  'active', 'grounded', 'maintenance', 'in_flight', 'returning', 'charging', 'decommissioned'
);

CREATE TYPE drone_category AS ENUM ('category_1', 'category_2', 'category_3', 'category_4');
CREATE TYPE remote_id_type AS ENUM ('standard', 'broadcast_module', 'none');

CREATE TYPE mission_status AS ENUM (
  'draft', 'planned', 'preflight_check', 'awaiting_authorization', 'authorized',
  'in_progress', 'paused', 'completed', 'aborted', 'cancelled'
);

CREATE TYPE mission_type AS ENUM (
  'mapping', 'inspection', 'survey', 'photography', 'videography', 'delivery',
  'search_rescue', 'law_enforcement', 'agriculture', 'construction',
  'utility', 'environmental', 'recreational', 'training', 'other'
);

CREATE TYPE operation_type AS ENUM ('part_107', 'recreational', 'public_safety', 'waiver');

CREATE TYPE laanc_auth_type AS ENUM ('near_real_time', 'further_coordination', 'manual');
CREATE TYPE laanc_auth_status AS ENUM (
  'draft', 'submitted', 'auto_approved', 'pending_review',
  'approved', 'denied', 'expired', 'cancelled', 'rescinded'
);

CREATE TYPE airspace_class AS ENUM ('A', 'B', 'C', 'D', 'E', 'G');

CREATE TYPE advisory_level AS ENUM ('clear', 'caution', 'warning', 'restricted', 'prohibited');

CREATE TYPE incident_severity AS ENUM ('near_miss', 'minor', 'major', 'critical');

CREATE TYPE agency_type AS ENUM (
  'municipal', 'county', 'state', 'federal', 'airport_authority',
  'military', 'national_park', 'tribal'
);

CREATE TYPE rule_status AS ENUM ('draft', 'review', 'published', 'archived', 'expired');

CREATE TYPE audit_action AS ENUM (
  'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
  'AUTHORIZE', 'DENY', 'EXPORT', 'IMPORT', 'ESCALATE'
);

CREATE TYPE webhook_event AS ENUM (
  'mission.created', 'mission.started', 'mission.completed', 'mission.aborted',
  'laanc.submitted', 'laanc.approved', 'laanc.denied', 'laanc.expired',
  'drone.status_changed', 'drone.telemetry', 'drone.maintenance_due',
  'tfr.new', 'tfr.updated', 'tfr.cancelled',
  'compliance.alert', 'incident.reported', 'airspace.rule_changed'
);

-- ═══════════════════════════════════════════════════════════════
-- TENANTS (Multi-tenant isolation root)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type tenant_type NOT NULL DEFAULT 'individual',
  plan tenant_plan NOT NULL DEFAULT 'free',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

-- ═══════════════════════════════════════════════════════════════
-- USERS & IAM
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  persona persona_type NOT NULL DEFAULT 'individual_pilot',
  roles system_role[] NOT NULL DEFAULT ARRAY['pilot']::system_role[],
  permissions TEXT[] NOT NULL DEFAULT '{}',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_method TEXT,
  mfa_secret_encrypted TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash TEXT,
  last_login_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, tenant_id)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_persona ON users(persona);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  hashed_key TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  rate_limit INTEGER NOT NULL DEFAULT 60,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_hash ON api_keys(hashed_key);

-- ABAC Policies
CREATE TABLE abac_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  effect TEXT NOT NULL CHECK (effect IN ('allow', 'deny')),
  conditions JSONB NOT NULL DEFAULT '[]',
  actions TEXT[] NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- FLEET & DRONES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE fleets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  drone_ids UUID[] NOT NULL DEFAULT '{}',
  pilot_ids UUID[] NOT NULL DEFAULT '{}',
  manager_ids UUID[] NOT NULL DEFAULT '{}',
  home_base GEOMETRY(Point, 4326),
  operational_area GEOMETRY(Polygon, 4326),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fleets_tenant ON fleets(tenant_id);

CREATE TABLE drones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  serial_number TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  nickname TEXT,
  category drone_category NOT NULL,
  weight_grams INTEGER NOT NULL,
  max_altitude_ft INTEGER NOT NULL DEFAULT 400,
  max_range_meters INTEGER,
  max_flight_time_minutes INTEGER,
  max_speed_mps NUMERIC,
  has_camera BOOLEAN NOT NULL DEFAULT FALSE,
  camera_specs JSONB,
  sensors TEXT[] NOT NULL DEFAULT '{}',

  -- FAA Registration
  faa_registration_number TEXT NOT NULL,
  faa_registration_expiry TIMESTAMPTZ NOT NULL,
  registered_owner UUID NOT NULL REFERENCES users(id),

  -- Remote ID
  remote_id_type remote_id_type NOT NULL DEFAULT 'none',
  remote_id_serial_number TEXT,
  remote_id_declaration_id TEXT,
  remote_id_compliant BOOLEAN NOT NULL DEFAULT FALSE,

  -- Operational
  status drone_status NOT NULL DEFAULT 'active',
  current_location GEOMETRY(PointZ, 4326),
  home_location GEOMETRY(Point, 4326),
  total_flight_hours NUMERIC NOT NULL DEFAULT 0,
  total_flights INTEGER NOT NULL DEFAULT 0,
  last_flight_at TIMESTAMPTZ,
  firmware_version TEXT,

  -- Maintenance
  next_maintenance_due TIMESTAMPTZ,
  maintenance_interval_hours NUMERIC NOT NULL DEFAULT 100,
  last_maintenance_at TIMESTAMPTZ,

  -- Insurance
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_expiry TIMESTAMPTZ,

  assigned_pilot_ids UUID[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(serial_number, tenant_id)
);

CREATE INDEX idx_drones_tenant ON drones(tenant_id);
CREATE INDEX idx_drones_status ON drones(status);
CREATE INDEX idx_drones_location ON drones USING GIST(current_location);
CREATE INDEX idx_drones_faa_reg ON drones(faa_registration_number);
CREATE INDEX idx_drones_remote_id ON drones(remote_id_serial_number);

-- Pilot Profiles
CREATE TABLE pilot_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  faa_registration_number TEXT,
  part107_certificate_number TEXT,
  part107_expires_at TIMESTAMPTZ,
  part107_waivers JSONB NOT NULL DEFAULT '[]',
  trust_completion_id TEXT,
  trust_completed_at TIMESTAMPTZ,
  medical_certificate JSONB,
  total_flight_hours NUMERIC NOT NULL DEFAULT 0,
  total_flights INTEGER NOT NULL DEFAULT 0,
  endorsements TEXT[] NOT NULL DEFAULT '{}',
  emergency_contact JSONB,
  assigned_drone_ids UUID[] NOT NULL DEFAULT '{}',
  active_missions UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pilot_profiles_tenant ON pilot_profiles(tenant_id);

-- Maintenance Records
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES users(id),
  performed_at TIMESTAMPTZ NOT NULL,
  flight_hours_at_maintenance NUMERIC NOT NULL,
  parts_replaced TEXT[],
  cost NUMERIC,
  notes TEXT,
  attachments TEXT[] NOT NULL DEFAULT '{}',
  next_maintenance_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_drone ON maintenance_records(drone_id);

-- ═══════════════════════════════════════════════════════════════
-- TELEMETRY (TimescaleDB hypertable)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE drone_telemetry (
  time TIMESTAMPTZ NOT NULL,
  drone_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  position GEOMETRY(PointZ, 4326) NOT NULL,
  altitude_ft NUMERIC NOT NULL,
  altitude_reference TEXT NOT NULL DEFAULT 'AGL',
  ground_speed_mps NUMERIC,
  heading_deg NUMERIC,
  vertical_speed_mps NUMERIC,
  battery_percent NUMERIC,
  battery_voltage NUMERIC,
  signal_strength NUMERIC,
  satellite_count INTEGER,
  home_distance_m NUMERIC,
  wind_speed_mps NUMERIC,
  wind_direction NUMERIC,
  temperature NUMERIC,
  motors JSONB,
  warnings JSONB NOT NULL DEFAULT '[]'
);

SELECT create_hypertable('drone_telemetry', 'time');

CREATE INDEX idx_telemetry_drone ON drone_telemetry(drone_id, time DESC);
CREATE INDEX idx_telemetry_tenant ON drone_telemetry(tenant_id, time DESC);
CREATE INDEX idx_telemetry_position ON drone_telemetry USING GIST(position);

-- Remote ID Broadcasts
CREATE TABLE remote_id_broadcasts (
  time TIMESTAMPTZ NOT NULL,
  drone_id UUID NOT NULL,
  session_id UUID NOT NULL,
  uas_id TEXT NOT NULL,
  uas_id_type TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  operator_location GEOMETRY(Point, 4326),
  uas_location GEOMETRY(PointZ, 4326) NOT NULL,
  altitude_pressure NUMERIC,
  altitude_geodetic NUMERIC,
  height NUMERIC,
  height_reference TEXT,
  speed_horizontal NUMERIC,
  speed_vertical NUMERIC,
  direction NUMERIC,
  emergency_status TEXT NOT NULL DEFAULT 'none',
  broadcast_method TEXT NOT NULL
);

SELECT create_hypertable('remote_id_broadcasts', 'time');

CREATE INDEX idx_rid_drone ON remote_id_broadcasts(drone_id, time DESC);
CREATE INDEX idx_rid_uas_id ON remote_id_broadcasts(uas_id, time DESC);
CREATE INDEX idx_rid_location ON remote_id_broadcasts USING GIST(uas_location);

-- ═══════════════════════════════════════════════════════════════
-- MISSIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fleet_id UUID REFERENCES fleets(id),
  name TEXT NOT NULL,
  description TEXT,
  type mission_type NOT NULL,
  operation_type operation_type NOT NULL,
  status mission_status NOT NULL DEFAULT 'draft',

  -- Crew
  pilot_in_command_id UUID NOT NULL REFERENCES users(id),
  visual_observer_ids UUID[] NOT NULL DEFAULT '{}',
  crew_members JSONB NOT NULL DEFAULT '[]',

  -- Aircraft
  drone_id UUID NOT NULL REFERENCES drones(id),
  backup_drone_id UUID REFERENCES drones(id),

  -- Location
  operation_area GEOMETRY(Polygon, 4326) NOT NULL,
  takeoff_location GEOMETRY(Point, 4326) NOT NULL,
  landing_location GEOMETRY(Point, 4326) NOT NULL,
  waypoints JSONB NOT NULL DEFAULT '[]',
  max_altitude_ft INTEGER NOT NULL,
  planned_altitude_ft INTEGER NOT NULL,
  altitude_reference TEXT NOT NULL DEFAULT 'AGL',

  -- Timing
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',

  -- Authorization
  laanc_authorization_id UUID,
  laanc_status TEXT DEFAULT 'not_required',
  manual_authorization_id TEXT,
  waiver_ids UUID[] NOT NULL DEFAULT '{}',

  -- Pre-flight
  preflight_checklist JSONB NOT NULL DEFAULT '[]',
  preflight_completed BOOLEAN NOT NULL DEFAULT FALSE,
  preflight_completed_at TIMESTAMPTZ,
  preflight_completed_by UUID,

  -- Weather
  weather_check JSONB,
  weather_approved BOOLEAN NOT NULL DEFAULT FALSE,

  -- Risk
  risk_score NUMERIC,
  risk_factors JSONB NOT NULL DEFAULT '[]',
  risk_mitigations TEXT[] NOT NULL DEFAULT '{}',

  -- Post-flight
  incidents JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  attachments TEXT[] NOT NULL DEFAULT '{}',

  -- Audit
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_missions_tenant ON missions(tenant_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_pilot ON missions(pilot_in_command_id);
CREATE INDEX idx_missions_drone ON missions(drone_id);
CREATE INDEX idx_missions_schedule ON missions(scheduled_start, scheduled_end);
CREATE INDEX idx_missions_area ON missions USING GIST(operation_area);

-- Flight Logs
CREATE TABLE flight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  drone_id UUID NOT NULL REFERENCES drones(id),
  pilot_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes NUMERIC NOT NULL,
  max_altitude_ft NUMERIC NOT NULL,
  max_speed_mps NUMERIC,
  max_distance_m NUMERIC,
  total_distance_m NUMERIC,
  takeoff_location GEOMETRY(Point, 4326) NOT NULL,
  landing_location GEOMETRY(Point, 4326) NOT NULL,
  telemetry_record_count INTEGER NOT NULL DEFAULT 0,
  telemetry_storage_url TEXT,
  battery_start_percent NUMERIC,
  battery_end_percent NUMERIC,
  remote_id_active BOOLEAN NOT NULL DEFAULT TRUE,
  incidents JSONB NOT NULL DEFAULT '[]',
  post_flight_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flight_logs_tenant ON flight_logs(tenant_id);
CREATE INDEX idx_flight_logs_mission ON flight_logs(mission_id);
CREATE INDEX idx_flight_logs_pilot ON flight_logs(pilot_id);
CREATE INDEX idx_flight_logs_time ON flight_logs(start_time DESC);

-- ═══════════════════════════════════════════════════════════════
-- LAANC AUTHORIZATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE laanc_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pilot_id UUID NOT NULL REFERENCES users(id),
  mission_id UUID REFERENCES missions(id),

  reference_code TEXT NOT NULL UNIQUE,
  uss_provider TEXT NOT NULL,
  authorization_type laanc_auth_type NOT NULL,
  status laanc_auth_status NOT NULL DEFAULT 'draft',

  operation_type operation_type NOT NULL,
  operation_area GEOMETRY(Polygon, 4326) NOT NULL,
  center_point GEOMETRY(Point, 4326) NOT NULL,
  radius_meters NUMERIC,
  requested_altitude_ft INTEGER NOT NULL,
  approved_altitude_ft INTEGER,
  uasfm_max_altitude_ft INTEGER NOT NULL,

  airport_code TEXT NOT NULL,
  airport_name TEXT NOT NULL,
  facility_id TEXT NOT NULL,
  airspace_class airspace_class NOT NULL,

  requested_start TIMESTAMPTZ NOT NULL,
  requested_end TIMESTAMPTZ NOT NULL,
  approved_start TIMESTAMPTZ,
  approved_end TIMESTAMPTZ,
  max_duration_hours NUMERIC NOT NULL DEFAULT 4,

  drone_serial_number TEXT NOT NULL,
  faa_registration_number TEXT NOT NULL,
  remote_id_serial_number TEXT,

  night_operations BOOLEAN NOT NULL DEFAULT FALSE,
  anti_collision_light BOOLEAN NOT NULL DEFAULT FALSE,

  reviewed_by TEXT,
  review_notes TEXT,
  denial_reason TEXT,
  conditions TEXT[] NOT NULL DEFAULT '{}',

  submitted_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_laanc_tenant ON laanc_authorizations(tenant_id);
CREATE INDEX idx_laanc_pilot ON laanc_authorizations(pilot_id);
CREATE INDEX idx_laanc_status ON laanc_authorizations(status);
CREATE INDEX idx_laanc_airport ON laanc_authorizations(airport_code);
CREATE INDEX idx_laanc_reference ON laanc_authorizations(reference_code);
CREATE INDEX idx_laanc_area ON laanc_authorizations USING GIST(operation_area);

-- ═══════════════════════════════════════════════════════════════
-- AIRSPACE DATA
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE uasfm_grids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id TEXT NOT NULL,
  airport_code TEXT NOT NULL,
  airspace_class airspace_class NOT NULL,
  geometry GEOMETRY(Polygon, 4326) NOT NULL,
  max_altitude_ft INTEGER NOT NULL,
  ceiling_ft INTEGER NOT NULL,
  floor_ft INTEGER NOT NULL DEFAULT 0,
  laanc_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  effective_date TIMESTAMPTZ NOT NULL,
  expiration_date TIMESTAMPTZ NOT NULL,
  chart_cycle TEXT NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uasfm_geometry ON uasfm_grids USING GIST(geometry);
CREATE INDEX idx_uasfm_airport ON uasfm_grids(airport_code);
CREATE INDEX idx_uasfm_facility ON uasfm_grids(facility_id);

CREATE TABLE temporary_flight_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notam_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  geometry GEOMETRY(Polygon, 4326) NOT NULL,
  center GEOMETRY(Point, 4326),
  radius_nm NUMERIC,
  floor_altitude_ft INTEGER NOT NULL DEFAULT 0,
  ceiling_altitude_ft INTEGER NOT NULL,
  effective_start TIMESTAMPTZ NOT NULL,
  effective_end TIMESTAMPTZ NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  facility_id TEXT,
  restrictions TEXT,
  source TEXT NOT NULL DEFAULT 'faa',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tfr_geometry ON temporary_flight_restrictions USING GIST(geometry);
CREATE INDEX idx_tfr_active ON temporary_flight_restrictions(active, effective_start, effective_end);

CREATE TABLE notams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notam_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  facility_id TEXT NOT NULL,
  location TEXT,
  effective_start TIMESTAMPTZ NOT NULL,
  effective_end TIMESTAMPTZ,
  text TEXT NOT NULL,
  classification TEXT,
  geometry GEOMETRY(Polygon, 4326),
  affects_uas BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notams_geometry ON notams USING GIST(geometry);
CREATE INDEX idx_notams_effective ON notams(effective_start, effective_end);
CREATE INDEX idx_notams_uas ON notams(affects_uas) WHERE affects_uas = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- AGENCY & LOCAL RULES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type agency_type NOT NULL,
  jurisdiction GEOMETRY(Polygon, 4326) NOT NULL,
  address JSONB NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  website TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  api_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agencies_jurisdiction ON agencies USING GIST(jurisdiction);
CREATE INDEX idx_agencies_tenant ON agencies(tenant_id);

CREATE TABLE agency_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  geometry GEOMETRY(Polygon, 4326) NOT NULL,
  altitude JSONB,
  effective_start TIMESTAMPTZ NOT NULL,
  effective_end TIMESTAMPTZ,
  schedule JSONB,
  conditions JSONB NOT NULL DEFAULT '[]',
  exemptions JSONB NOT NULL DEFAULT '[]',
  permit_required BOOLEAN NOT NULL DEFAULT FALSE,
  permit_application_url TEXT,
  enforcement_level TEXT NOT NULL DEFAULT 'advisory',
  status rule_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  previous_version_id UUID REFERENCES agency_rules(id),
  published_at TIMESTAMPTZ,
  published_by UUID,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agency_rules_geometry ON agency_rules USING GIST(geometry);
CREATE INDEX idx_agency_rules_agency ON agency_rules(agency_id);
CREATE INDEX idx_agency_rules_status ON agency_rules(status);

-- Geofences
CREATE TABLE geofences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inclusion', 'exclusion', 'advisory')),
  geometry GEOMETRY(Polygon, 4326) NOT NULL,
  altitude JSONB,
  action TEXT NOT NULL DEFAULT 'warn' CHECK (action IN ('block', 'warn', 'log')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_geofences_geometry ON geofences USING GIST(geometry);
CREATE INDEX idx_geofences_tenant ON geofences(tenant_id);

-- Agency Incidents
CREATE TABLE agency_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  reported_by UUID,
  reporter_type TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity incident_severity NOT NULL,
  description TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  drone_description TEXT,
  drone_registration TEXT,
  remote_id_data JSONB,
  status TEXT NOT NULL DEFAULT 'reported',
  assigned_to UUID,
  resolution TEXT,
  faa_reported BOOLEAN NOT NULL DEFAULT FALSE,
  faa_report_id TEXT,
  law_enforcement_notified BOOLEAN NOT NULL DEFAULT FALSE,
  attachments TEXT[] NOT NULL DEFAULT '{}',
  timeline JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_agency ON agency_incidents(agency_id);
CREATE INDEX idx_incidents_location ON agency_incidents USING GIST(location);
CREATE INDEX idx_incidents_severity ON agency_incidents(severity);

-- ═══════════════════════════════════════════════════════════════
-- DEVELOPER PLATFORM
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE developer_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  callback_urls TEXT[] NOT NULL DEFAULT '{}',
  client_id TEXT NOT NULL UNIQUE,
  client_secret_hash TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  status TEXT NOT NULL DEFAULT 'active',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  rate_limit_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES developer_apps(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events webhook_event[] NOT NULL,
  secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_delivered_at TIMESTAMPTZ,
  last_response_code INTEGER,
  last_failure_at TIMESTAMPTZ,
  last_failure_reason TEXT,
  retry_policy JSONB NOT NULL DEFAULT '{"maxRetries": 3, "backoffMs": 1000, "backoffMultiplier": 2}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event webhook_event NOT NULL,
  payload JSONB NOT NULL,
  request_headers JSONB,
  response_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id, created_at DESC);

-- API Usage (TimescaleDB)
CREATE TABLE api_usage (
  time TIMESTAMPTZ NOT NULL,
  api_key_id UUID NOT NULL,
  app_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET NOT NULL,
  user_agent TEXT
);

SELECT create_hypertable('api_usage', 'time');

CREATE INDEX idx_api_usage_key ON api_usage(api_key_id, time DESC);
CREATE INDEX idx_api_usage_app ON api_usage(app_id, time DESC);

-- ═══════════════════════════════════════════════════════════════
-- COMPLIANCE & AUDIT (Immutable)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  action audit_action NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  resource_name TEXT,
  previous_state JSONB,
  new_state JSONB,
  ip_address INET NOT NULL,
  user_agent TEXT,
  session_id UUID,
  request_id UUID NOT NULL,
  geolocation JSONB,
  risk_score NUMERIC,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason TEXT,
  retention_expiry TIMESTAMPTZ NOT NULL
);

SELECT create_hypertable('audit_logs', 'timestamp');

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id, timestamp DESC);
CREATE INDEX idx_audit_flagged ON audit_logs(flagged) WHERE flagged = TRUE;

-- Prevent updates/deletes on audit logs (immutable)
CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Compliance Controls
CREATE TABLE compliance_controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  framework TEXT NOT NULL,
  control_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_applicable',
  evidence JSONB NOT NULL DEFAULT '[]',
  last_assessed_at TIMESTAMPTZ,
  next_assessment_due TIMESTAMPTZ,
  assigned_to UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, framework, control_id)
);

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  channel TEXT NOT NULL DEFAULT 'in_app',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleets ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE laanc_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_controls ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy (applied to all tenant-scoped tables)
-- Users can only see data belonging to their tenant
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_drones ON drones
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_fleets ON fleets
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_missions ON missions
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_flight_logs ON flight_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_laanc ON laanc_authorizations
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_pilot_profiles ON pilot_profiles
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_maintenance ON maintenance_records
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_agencies ON agencies
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_geofences ON geofences
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_developer_apps ON developer_apps
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_webhooks ON webhooks
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_api_keys ON api_keys
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_notifications ON notifications
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_compliance ON compliance_controls
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Agency rules are public (readable by all, writable by owning agency)
CREATE POLICY agency_rules_read ON agency_rules FOR SELECT USING (status = 'published');
CREATE POLICY agency_rules_write ON agency_rules FOR ALL
  USING (agency_id IN (SELECT id FROM agencies WHERE tenant_id = current_setting('app.current_tenant_id')::UUID));

-- Agency incidents viewable by owning agency
CREATE POLICY tenant_isolation_incidents ON agency_incidents
  USING (agency_id IN (SELECT id FROM agencies WHERE tenant_id = current_setting('app.current_tenant_id')::UUID));

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- Update drone flight stats after flight log insert
CREATE OR REPLACE FUNCTION update_drone_flight_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE drones SET
    total_flight_hours = total_flight_hours + (NEW.duration_minutes / 60.0),
    total_flights = total_flights + 1,
    last_flight_at = NEW.end_time
  WHERE id = NEW.drone_id;

  UPDATE pilot_profiles SET
    total_flight_hours = total_flight_hours + (NEW.duration_minutes / 60.0),
    total_flights = total_flights + 1
  WHERE user_id = NEW.pilot_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_flight_log_insert
AFTER INSERT ON flight_logs
FOR EACH ROW EXECUTE FUNCTION update_drone_flight_stats();

-- Spatial check: is a point within any active TFR?
CREATE OR REPLACE FUNCTION check_point_in_tfr(
  p_point GEOMETRY,
  p_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(tfr_id UUID, notam_number TEXT, description TEXT, type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.notam_number, t.description, t.type
  FROM temporary_flight_restrictions t
  WHERE t.active = TRUE
    AND p_time BETWEEN t.effective_start AND t.effective_end
    AND ST_Within(p_point, t.geometry);
END;
$$ LANGUAGE plpgsql;

-- Get UASFM max altitude for a given point
CREATE OR REPLACE FUNCTION get_uasfm_max_altitude(
  p_point GEOMETRY,
  p_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(facility_id TEXT, airport_code TEXT, max_altitude_ft INTEGER, airspace_class airspace_class, laanc_enabled BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT u.facility_id, u.airport_code, u.max_altitude_ft, u.airspace_class, u.laanc_enabled
  FROM uasfm_grids u
  WHERE ST_Within(p_point, u.geometry)
    AND p_time BETWEEN u.effective_date AND u.expiration_date
  ORDER BY u.max_altitude_ft ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Check airspace advisories for a given location
CREATE OR REPLACE FUNCTION check_airspace(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_altitude_ft INTEGER DEFAULT 400,
  p_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_point GEOMETRY;
  v_result JSONB;
  v_uasfm RECORD;
  v_advisory_level TEXT;
  v_can_fly BOOLEAN;
  v_requires_auth BOOLEAN;
  v_laanc_available BOOLEAN;
BEGIN
  v_point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);
  v_can_fly := TRUE;
  v_requires_auth := FALSE;
  v_laanc_available := FALSE;
  v_advisory_level := 'clear';

  -- Check UASFM
  SELECT * INTO v_uasfm FROM get_uasfm_max_altitude(v_point, p_time) LIMIT 1;

  IF v_uasfm IS NOT NULL THEN
    v_requires_auth := TRUE;
    v_laanc_available := v_uasfm.laanc_enabled;
    IF p_altitude_ft <= v_uasfm.max_altitude_ft THEN
      v_advisory_level := 'caution';
    ELSE
      v_advisory_level := 'warning';
    END IF;
  END IF;

  -- Check TFRs
  IF EXISTS (SELECT 1 FROM check_point_in_tfr(v_point, p_time)) THEN
    v_advisory_level := 'restricted';
    v_can_fly := FALSE;
  END IF;

  v_result := jsonb_build_object(
    'advisoryLevel', v_advisory_level,
    'canFly', v_can_fly,
    'requiresAuthorization', v_requires_auth,
    'laancAvailable', v_laanc_available,
    'maxAltitudeFt', COALESCE(v_uasfm.max_altitude_ft, 400),
    'airspaceClass', v_uasfm.airspace_class,
    'airportCode', v_uasfm.airport_code,
    'timestamp', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
