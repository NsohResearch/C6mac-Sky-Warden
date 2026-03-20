-- C6macEye Flight Plan & Waypath Authorization Schema
-- Migration 004: Flight Plans, Waypoints, Deviation Alerts & Onboarding
-- PostgreSQL 16+ with PostGIS
-- All tables enforce Row-Level Security (RLS) for tenant isolation
-- No drone can fly without a filed and authorized flight plan.

-- ═══════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE flight_plan_status AS ENUM (
  'draft',           -- Being composed
  'filed',           -- Submitted for review/authorization
  'pending_auth',    -- Awaiting LAANC/authority approval
  'authorized',      -- Cleared to fly (like "cleared as filed")
  'active',          -- Currently being flown
  'completed',       -- Flight completed, plan closed
  'cancelled',       -- Cancelled before flight
  'expired',         -- Authorization window passed without flight
  'deviated',        -- Drone deviated from filed plan
  'emergency'        -- Emergency declared
);

CREATE TYPE flight_plan_type AS ENUM (
  'standard', 'recurring', 'emergency', 'training', 'survey', 'delivery', 'inspection'
);

CREATE TYPE flight_rule_type AS ENUM (
  'visual',          -- VLOS (Visual Line of Sight) — most Part 107
  'instrument',      -- BVLOS (Beyond Visual Line of Sight) — waiver required
  'special_vfr'      -- Night operations or reduced visibility — waiver required
);

CREATE TYPE waypoint_type AS ENUM (
  'takeoff',             -- Launch point
  'waypoint',            -- Route point (fly through)
  'loiter',              -- Hover/orbit at this point for duration
  'poi',                 -- Point of interest (camera target, not flown to)
  'landing',             -- Planned landing point
  'alternate_landing',   -- Emergency/alternate landing
  'rally_point'          -- Safe return point if comms lost
);

CREATE TYPE altitude_ref AS ENUM (
  'agl',    -- Above Ground Level (standard for drones)
  'msl'     -- Mean Sea Level (used near airports)
);

CREATE TYPE deviation_type AS ENUM (
  'lateral', 'vertical', 'speed', 'geofence', 'time', 'comms_lost'
);

CREATE TYPE severity_level AS ENUM ('info', 'warning', 'critical');

CREATE TYPE contingency_action AS ENUM (
  'return_to_home', 'land_immediately', 'hover_in_place', 'continue_to_rally', 'manual_override'
);

CREATE TYPE onboarding_step AS ENUM (
  'profile_setup', 'pilot_certification', 'drone_registration', 'first_flight_plan', 'completed'
);

CREATE TYPE onboarding_status AS ENUM ('incomplete', 'in_progress', 'completed', 'blocked');

-- ═══════════════════════════════════════════════════════════════
-- FLIGHT PLANS (Core flight plan table)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE flight_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id),

  -- Identity
  flight_plan_number VARCHAR(30) NOT NULL UNIQUE, -- SKW-FP-YYYY-NNNNNN (auto-generated)
  status flight_plan_status NOT NULL DEFAULT 'draft',
  type flight_plan_type NOT NULL DEFAULT 'standard',
  flight_rules flight_rule_type NOT NULL DEFAULT 'visual',

  -- Who
  pilot_id UUID NOT NULL REFERENCES users(id),
  pilot_name VARCHAR(255) NOT NULL,
  pilot_certification VARCHAR(100) NOT NULL, -- Part 107 cert number
  observer_ids UUID[],                       -- Visual observers for BVLOS

  -- What
  drone_id UUID NOT NULL REFERENCES drones(id),
  drone_registration_ddid VARCHAR(20) NOT NULL, -- SKW-US-XXXXXX — must reference active registration
  drone_model VARCHAR(100) NOT NULL,
  remote_id_serial VARCHAR(100),

  -- When
  proposed_departure_time TIMESTAMPTZ NOT NULL,
  proposed_arrival_time TIMESTAMPTZ NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  authorization_window_start TIMESTAMPTZ,     -- Earliest allowed start
  authorization_window_end TIMESTAMPTZ,       -- Latest allowed end (typically +2 hours)
  actual_departure_time TIMESTAMPTZ,
  actual_arrival_time TIMESTAMPTZ,

  -- Where — THE WAYPATH
  waypoints JSONB NOT NULL DEFAULT '[]',              -- Array of Waypoint objects
  route_geometry GEOMETRY(LineString, 4326),           -- PostGIS route line
  corridor_geometry GEOMETRY(Polygon, 4326),           -- PostGIS buffered corridor
  corridor_width_ft INTEGER NOT NULL DEFAULT 100,      -- Buffer distance in feet
  min_altitude_ft INTEGER NOT NULL DEFAULT 0,
  max_altitude_ft INTEGER NOT NULL,
  cruise_altitude_ft INTEGER NOT NULL,
  altitude_reference altitude_ref NOT NULL DEFAULT 'agl',
  altitude_profile JSONB,                              -- [[distNm, altFt], ...]
  total_distance_nm NUMERIC(8,2),
  estimated_flight_time_minutes NUMERIC(8,2),
  departure_point VARCHAR(255) NOT NULL,               -- Name/description of takeoff location
  arrival_point VARCHAR(255) NOT NULL,                 -- Name/description of landing location
  alternate_locations TEXT[],                           -- Alternate landing sites

  -- Airspace
  airspaces_transited JSONB DEFAULT '[]',              -- Array of AirspaceTransit
  laanc_authorization_ids UUID[],                      -- Linked LAANC authorization IDs
  tfr_conflicts TEXT[],                                -- Active TFR IDs that conflict
  notam_conflicts TEXT[],                              -- Active NOTAM IDs in the area

  -- Weather
  weather_briefing JSONB,                              -- WeatherBriefing snapshot at filing time

  -- Contingency
  contingency_plan JSONB NOT NULL,                     -- ContingencyPlan (required)

  -- Authorization
  authorized_by VARCHAR(255),                          -- System, authority name, or user
  authorized_at TIMESTAMPTZ,
  authorization_notes TEXT,
  denial_reason TEXT,

  -- Tracking (during active flight)
  current_position JSONB,                              -- { lat, lng, altFt, headingDeg }

  -- Filing
  filed_at TIMESTAMPTZ,
  filed_by VARCHAR(255),
  closed_at TIMESTAMPTZ,
  closed_by VARCHAR(255),
  close_reason VARCHAR(20) CHECK (close_reason IN ('completed', 'cancelled', 'emergency', 'diverted', 'expired')),

  -- Metadata
  notes TEXT,
  attachments TEXT[],                                  -- URLs to supporting documents (waivers, permits)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT chk_arrival_after_departure
    CHECK (proposed_arrival_time > proposed_departure_time),

  -- Max 400ft AGL for visual/special_vfr (Part 107); instrument (BVLOS waiver) may exceed
  CONSTRAINT chk_max_altitude_limit
    CHECK (max_altitude_ft <= 400 OR flight_rules = 'instrument')
);

-- Indexes
CREATE INDEX idx_flight_plans_tenant ON flight_plans(tenant_id);
CREATE INDEX idx_flight_plans_number ON flight_plans(flight_plan_number);
CREATE INDEX idx_flight_plans_status ON flight_plans(status);
CREATE INDEX idx_flight_plans_pilot ON flight_plans(pilot_id);
CREATE INDEX idx_flight_plans_drone ON flight_plans(drone_id);
CREATE INDEX idx_flight_plans_ddid ON flight_plans(drone_registration_ddid);
CREATE INDEX idx_flight_plans_departure ON flight_plans(proposed_departure_time);
CREATE INDEX idx_flight_plans_mission ON flight_plans(mission_id) WHERE mission_id IS NOT NULL;
CREATE INDEX idx_flight_plans_route ON flight_plans USING GIST(route_geometry);
CREATE INDEX idx_flight_plans_corridor ON flight_plans USING GIST(corridor_geometry);
CREATE INDEX idx_flight_plans_active ON flight_plans(status)
  WHERE status IN ('filed', 'pending_auth', 'authorized', 'active');

-- ═══════════════════════════════════════════════════════════════
-- FLIGHT PLAN WAYPOINTS (Denormalized for spatial queries)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE flight_plan_waypoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_plan_id UUID NOT NULL REFERENCES flight_plans(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  type waypoint_type NOT NULL,
  name VARCHAR(100),

  -- Position
  position GEOMETRY(Point, 4326) NOT NULL,
  altitude_ft INTEGER NOT NULL,
  altitude_reference altitude_ref NOT NULL DEFAULT 'agl',

  -- Speed
  speed_knots NUMERIC,
  climb_rate_ft_per_min NUMERIC,

  -- Loiter
  loiter_duration_seconds INTEGER,
  loiter_radius_ft INTEGER,
  loiter_direction VARCHAR(20) CHECK (loiter_direction IN ('clockwise', 'counterclockwise')),

  -- Camera/sensor action
  action JSONB,

  -- Airspace (computed by system)
  airspace_class VARCHAR(2),
  requires_authorization BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each waypoint has a unique sequence within its flight plan
  UNIQUE(flight_plan_id, sequence_number)
);

-- Indexes
CREATE INDEX idx_fp_waypoints_flight_plan ON flight_plan_waypoints(flight_plan_id);
CREATE INDEX idx_fp_waypoints_tenant ON flight_plan_waypoints(tenant_id);
CREATE INDEX idx_fp_waypoints_position ON flight_plan_waypoints USING GIST(position);
CREATE INDEX idx_fp_waypoints_type ON flight_plan_waypoints(type);
CREATE INDEX idx_fp_waypoints_auth ON flight_plan_waypoints(requires_authorization)
  WHERE requires_authorization = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- DEVIATION ALERTS (Real-time deviation tracking)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE deviation_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_plan_id UUID NOT NULL REFERENCES flight_plans(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type deviation_type NOT NULL,
  severity severity_level NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,

  -- Where the drone actually is
  actual_position GEOMETRY(Point, 4326),

  -- Where it should be
  expected_position GEOMETRY(Point, 4326),

  -- How far off
  deviation_distance_ft NUMERIC,
  deviation_altitude_ft NUMERIC,

  -- Resolution
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deviation_alerts_flight_plan ON deviation_alerts(flight_plan_id);
CREATE INDEX idx_deviation_alerts_tenant ON deviation_alerts(tenant_id);
CREATE INDEX idx_deviation_alerts_timestamp ON deviation_alerts(timestamp DESC);
CREATE INDEX idx_deviation_alerts_severity ON deviation_alerts(severity)
  WHERE severity IN ('warning', 'critical');
CREATE INDEX idx_deviation_alerts_actual ON deviation_alerts USING GIST(actual_position);
CREATE INDEX idx_deviation_alerts_unresolved ON deviation_alerts(flight_plan_id, resolved)
  WHERE resolved = FALSE;

-- ═══════════════════════════════════════════════════════════════
-- ONBOARDING PROGRESS (User onboarding tracking)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  current_step onboarding_step NOT NULL DEFAULT 'profile_setup',
  status onboarding_status NOT NULL DEFAULT 'incomplete',

  -- Step statuses: { profileSetup, pilotCertification, droneRegistration, firstFlightPlan }
  steps JSONB NOT NULL DEFAULT '{
    "profileSetup": {"completed": false, "required": true, "skippable": false},
    "pilotCertification": {"completed": false, "required": true, "skippable": false},
    "droneRegistration": {"completed": false, "required": true, "skippable": false},
    "firstFlightPlan": {"completed": false, "required": true, "skippable": true}
  }',

  blocking_reasons TEXT[],
  completed_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_onboarding_tenant ON onboarding_progress(tenant_id);
CREATE INDEX idx_onboarding_status ON onboarding_progress(status)
  WHERE status != 'completed';

-- ═══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE flight_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_plan_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviation_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_flight_plans ON flight_plans
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_fp_waypoints ON flight_plan_waypoints
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_deviation_alerts ON deviation_alerts
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_onboarding ON onboarding_progress
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-generate flight plan number: SKW-FP-YYYY-NNNNNN
CREATE OR REPLACE FUNCTION generate_flight_plan_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
  v_number TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(flight_plan_number FROM 'SKW-FP-' || v_year || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO v_seq
  FROM flight_plans
  WHERE flight_plan_number LIKE 'SKW-FP-' || v_year || '-%';

  v_number := 'SKW-FP-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  NEW.flight_plan_number := v_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_flight_plan_number
BEFORE INSERT ON flight_plans
FOR EACH ROW
WHEN (NEW.flight_plan_number IS NULL OR NEW.flight_plan_number = '')
EXECUTE FUNCTION generate_flight_plan_number();

-- Check if a flight plan route intersects any restricted airspace
-- Returns a JSONB array of conflicts: TFRs, restricted agency rules, and UASFM grids
CREATE OR REPLACE FUNCTION check_flight_plan_airspace_conflicts(
  p_flight_plan_id UUID,
  p_check_time TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_route GEOMETRY;
  v_corridor GEOMETRY;
  v_max_alt INTEGER;
  v_conflicts JSONB := '[]'::JSONB;
  v_tfr RECORD;
  v_uasfm RECORD;
  v_rule RECORD;
BEGIN
  -- Get flight plan geometry
  SELECT route_geometry, corridor_geometry, max_altitude_ft
  INTO v_route, v_corridor, v_max_alt
  FROM flight_plans
  WHERE id = p_flight_plan_id;

  IF v_route IS NULL THEN
    RETURN jsonb_build_object('error', 'Flight plan has no route geometry');
  END IF;

  -- Check TFR conflicts
  FOR v_tfr IN
    SELECT t.id, t.notam_number, t.type, t.description,
           t.floor_altitude_ft, t.ceiling_altitude_ft,
           t.effective_start, t.effective_end
    FROM temporary_flight_restrictions t
    WHERE t.active = TRUE
      AND p_check_time BETWEEN t.effective_start AND t.effective_end
      AND ST_Intersects(v_corridor, t.geometry)
  LOOP
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'tfr',
      'id', v_tfr.id,
      'notamNumber', v_tfr.notam_number,
      'tfrType', v_tfr.type,
      'description', v_tfr.description,
      'floorFt', v_tfr.floor_altitude_ft,
      'ceilingFt', v_tfr.ceiling_altitude_ft,
      'severity', 'critical'
    ));
  END LOOP;

  -- Check UASFM grid conflicts (where max altitude exceeds UASFM ceiling)
  FOR v_uasfm IN
    SELECT u.facility_id, u.airport_code, u.airspace_class::TEXT,
           u.max_altitude_ft AS uasfm_max, u.laanc_enabled
    FROM uasfm_grids u
    WHERE ST_Intersects(v_corridor, u.geometry)
      AND p_check_time BETWEEN u.effective_date AND u.expiration_date
  LOOP
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'controlled_airspace',
      'facilityId', v_uasfm.facility_id,
      'airportCode', v_uasfm.airport_code,
      'airspaceClass', v_uasfm.airspace_class,
      'uasfmMaxFt', v_uasfm.uasfm_max,
      'requestedMaxFt', v_max_alt,
      'laancEnabled', v_uasfm.laanc_enabled,
      'authorizationRequired', TRUE,
      'severity', CASE
        WHEN v_max_alt > v_uasfm.uasfm_max THEN 'critical'
        ELSE 'warning'
      END
    ));
  END LOOP;

  -- Check agency rule conflicts (published exclusion/restricted rules)
  FOR v_rule IN
    SELECT ar.id, ar.title, ar.rule_type, ar.enforcement_level,
           a.name AS agency_name
    FROM agency_rules ar
    JOIN agencies a ON a.id = ar.agency_id
    WHERE ar.status = 'published'
      AND ar.rule_type IN ('exclusion', 'restriction', 'prohibited')
      AND ST_Intersects(v_corridor, ar.geometry)
      AND (ar.effective_end IS NULL OR ar.effective_end > p_check_time)
      AND ar.effective_start <= p_check_time
  LOOP
    v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
      'type', 'agency_rule',
      'id', v_rule.id,
      'title', v_rule.title,
      'ruleType', v_rule.rule_type,
      'agencyName', v_rule.agency_name,
      'enforcementLevel', v_rule.enforcement_level,
      'severity', CASE v_rule.enforcement_level
        WHEN 'prohibited' THEN 'critical'
        WHEN 'restricted' THEN 'critical'
        ELSE 'warning'
      END
    ));
  END LOOP;

  RETURN jsonb_build_object(
    'flightPlanId', p_flight_plan_id,
    'checkedAt', NOW(),
    'conflictCount', jsonb_array_length(v_conflicts),
    'hasBlockingConflicts', EXISTS (
      SELECT 1 FROM jsonb_array_elements(v_conflicts) elem
      WHERE elem->>'severity' = 'critical'
    ),
    'conflicts', v_conflicts
  );
END;
$$ LANGUAGE plpgsql;

-- Expire authorized flight plans past their authorization_window_end
-- Intended to be called by a scheduled job (e.g., pg_cron every 5 minutes)
CREATE OR REPLACE FUNCTION expire_stale_flight_plans()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE flight_plans
  SET
    status = 'expired',
    closed_at = NOW(),
    closed_by = 'system:auto_expire',
    close_reason = 'expired'
  WHERE status IN ('authorized', 'pending_auth')
    AND authorization_window_end IS NOT NULL
    AND authorization_window_end < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also expire filed plans that have been waiting more than 24 hours
  UPDATE flight_plans
  SET
    status = 'expired',
    closed_at = NOW(),
    closed_by = 'system:auto_expire',
    close_reason = 'expired'
  WHERE status = 'filed'
    AND filed_at IS NOT NULL
    AND filed_at < NOW() - INTERVAL '24 hours'
    AND authorization_window_end IS NOT NULL
    AND authorization_window_end < NOW();

  GET DIAGNOSTICS v_count = v_count + ROW_COUNT;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY['flight_plans', 'onboarding_progress'])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;
