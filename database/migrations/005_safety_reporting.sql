-- C6macEye Aviation Safety Reporting Program (ASRP) Schema
-- Migration 005: Safety Reports, Remote ID Compliance, B4UFLY Check Logs
-- PostgreSQL 16+ with PostGIS
-- All tables enforce Row-Level Security (RLS) for tenant isolation
-- Based on NASA ASRS + FAA DroneZone mandatory reporting (14 CFR 107.9)

-- ═══════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE safety_report_type AS ENUM ('mandatory', 'voluntary');

CREATE TYPE mandatory_trigger_type AS ENUM (
  'serious_injury',            -- AIS Level 3+ injury
  'loss_of_consciousness',     -- Any person loses consciousness
  'property_damage_over_500',  -- Damage exceeding $500
  'none'                       -- Not a mandatory trigger
);

CREATE TYPE incident_category AS ENUM (
  'near_midair_collision',
  'airspace_violation',
  'loss_of_control',
  'equipment_failure',
  'battery_emergency',
  'loss_of_link',
  'flyaway',
  'crash',
  'injury_to_person',
  'property_damage',
  'wildlife_strike',
  'interference',
  'regulatory_violation',
  'remote_id_failure',
  'geofence_breach',
  'altitude_violation',
  'night_operations_incident',
  'bvlos_incident',
  'payload_drop',
  'other'
);

CREATE TYPE incident_severity AS ENUM (
  'none', 'minor', 'moderate', 'serious', 'critical', 'fatal'
);

CREATE TYPE report_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'filed_faa',
  'filed_asrs',
  'acknowledged',
  'closed',
  'archived'
);

CREATE TYPE advisory_level AS ENUM ('green', 'yellow', 'red');

-- ═══════════════════════════════════════════════════════════════
-- SAFETY REPORTS (Aviation Safety Reports — ASRP)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  report_number VARCHAR(30) NOT NULL UNIQUE, -- SKW-SR-YYYY-NNNNNN (auto-generated)

  -- Report classification
  report_type safety_report_type NOT NULL,
  mandatory_trigger mandatory_trigger_type NOT NULL DEFAULT 'none',
  categories incident_category[] NOT NULL DEFAULT '{}',
  severity incident_severity NOT NULL DEFAULT 'none',

  -- Status & workflow
  status report_status NOT NULL DEFAULT 'draft',
  confidential BOOLEAN NOT NULL DEFAULT FALSE,
  deidentified BOOLEAN NOT NULL DEFAULT FALSE,

  -- === SECTION 1: EVENT INFO ===
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  event_duration INTERVAL,

  -- Location (PostGIS point)
  event_location GEOMETRY(Point, 4326),
  event_altitude_ft INTEGER,
  event_altitude_reference altitude_ref NOT NULL DEFAULT 'agl', -- reuse from 004
  event_location_description TEXT,
  nearest_airport VARCHAR(10),
  airspace_class VARCHAR(2),
  within_controlled_airspace BOOLEAN NOT NULL DEFAULT FALSE,

  -- Weather at time of event
  weather_conditions VARCHAR(3) CHECK (weather_conditions IN ('vmc', 'imc')),
  wind_speed_knots NUMERIC,
  wind_direction NUMERIC CHECK (wind_direction >= 0 AND wind_direction < 360),
  visibility VARCHAR(20),
  light_conditions VARCHAR(10) NOT NULL DEFAULT 'day'
    CHECK (light_conditions IN ('day', 'twilight', 'night')),

  -- === SECTION 2: AIRCRAFT/OPERATOR INFO ===
  -- Reporter
  reporter_id UUID NOT NULL REFERENCES user_profiles(id),
  reporter_role VARCHAR(30) NOT NULL
    CHECK (reporter_role IN ('remote_pilot', 'visual_observer', 'crew_member', 'bystander', 'atc', 'other')),
  reporter_certification VARCHAR(50),
  reporter_experience_hours NUMERIC,

  -- Drone
  drone_id UUID REFERENCES drones(id),
  drone_registration_ddid VARCHAR(20),
  drone_make VARCHAR(100) NOT NULL,
  drone_model VARCHAR(100) NOT NULL,
  drone_serial_number VARCHAR(100),
  drone_weight_grams INTEGER,
  drone_category VARCHAR(10)
    CHECK (drone_category IN ('micro', 'small', 'medium', 'large')),
  uas_type VARCHAR(20) NOT NULL
    CHECK (uas_type IN ('multirotor', 'fixed_wing', 'vtol', 'helicopter', 'airship', 'other')),

  -- Remote ID status at time of event
  remote_id_active BOOLEAN NOT NULL DEFAULT FALSE,
  remote_id_method VARCHAR(20)
    CHECK (remote_id_method IN ('standard', 'broadcast_module', 'fria', 'none')),
  remote_id_serial VARCHAR(30),

  -- Flight context
  flight_plan_id UUID REFERENCES flight_plans(id),
  laanc_authorization_id UUID,
  mission_id UUID,
  operation_type VARCHAR(30) NOT NULL
    CHECK (operation_type IN ('part_107', 'part_107_waiver', 'recreational', 'public_safety', 'government', 'other')),
  operational_context TEXT[] NOT NULL DEFAULT '{}',

  -- === SECTION 3: EVENT DETAILS ===
  -- Narrative
  narrative TEXT NOT NULL,

  -- Other aircraft involved (for near-miss reports)
  other_aircraft_involved BOOLEAN NOT NULL DEFAULT FALSE,
  other_aircraft_type VARCHAR(100),
  other_aircraft_altitude INTEGER,
  closest_approach_ft INTEGER,
  closest_approach_vertical_ft INTEGER,
  other_aircraft_registration VARCHAR(20),
  atc_contact_made BOOLEAN,

  -- Damage/injury (JSONB arrays)
  injuries JSONB NOT NULL DEFAULT '[]',
  property_damage JSONB NOT NULL DEFAULT '[]',
  total_property_damage_estimate NUMERIC,
  drone_damaged BOOLEAN NOT NULL DEFAULT FALSE,
  drone_recovered BOOLEAN NOT NULL DEFAULT TRUE,

  -- Contributing factors
  contributing_factors TEXT[] NOT NULL DEFAULT '{}',
  corrective_actions TEXT[] NOT NULL DEFAULT '{}',
  preventive_recommendations TEXT[] NOT NULL DEFAULT '{}',

  -- === SECTION 4: REGULATORY FILING ===
  -- FAA mandatory (14 CFR 107.9) — within 10 calendar days
  faa_filing_required BOOLEAN NOT NULL DEFAULT FALSE,
  faa_filing_deadline DATE, -- event_date + 10 days (auto-set)
  faa_filed_at TIMESTAMPTZ,
  faa_confirmation_number VARCHAR(50),
  faa_dronezone_submission_id VARCHAR(50),

  -- NASA ASRS voluntary filing
  asrs_filing_recommended BOOLEAN NOT NULL DEFAULT FALSE,
  asrs_filed_at TIMESTAMPTZ,
  asrs_confirmation_number VARCHAR(50),

  -- ASRS enforcement protection
  asrs_protection_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  asrs_protection_conditions JSONB NOT NULL DEFAULT '{
    "unintentional": false,
    "noCriminalOffense": false,
    "noAccident": false,
    "noSafetyDisqualification": false,
    "noPriorViolations": false,
    "filedWithin10Days": false,
    "allConditionsMet": false
  }',

  -- === SECTION 5: INVESTIGATION ===
  assigned_investigator UUID REFERENCES user_profiles(id),
  investigation_notes TEXT,
  root_cause TEXT,
  final_classification VARCHAR(100),
  lessons_learned TEXT,
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES user_profiles(id),

  -- Attachments (JSONB array of ReportAttachment)
  attachments JSONB NOT NULL DEFAULT '[]',

  -- Timestamps
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  -- Mandatory reports must have a narrative of at least 100 characters
  CONSTRAINT chk_mandatory_narrative_length
    CHECK (report_type != 'mandatory' OR LENGTH(narrative) >= 100),

  -- FAA filing deadline must be set when filing is required
  CONSTRAINT chk_faa_deadline_when_required
    CHECK (faa_filing_required = FALSE OR faa_filing_deadline IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_safety_reports_tenant ON safety_reports(tenant_id);
CREATE INDEX idx_safety_reports_number ON safety_reports(report_number);
CREATE INDEX idx_safety_reports_status ON safety_reports(status);
CREATE INDEX idx_safety_reports_type ON safety_reports(report_type);
CREATE INDEX idx_safety_reports_severity ON safety_reports(severity);
CREATE INDEX idx_safety_reports_reporter ON safety_reports(reporter_id);
CREATE INDEX idx_safety_reports_drone ON safety_reports(drone_id) WHERE drone_id IS NOT NULL;
CREATE INDEX idx_safety_reports_flight_plan ON safety_reports(flight_plan_id) WHERE flight_plan_id IS NOT NULL;
CREATE INDEX idx_safety_reports_event_date ON safety_reports(event_date DESC);
CREATE INDEX idx_safety_reports_location ON safety_reports USING GIST(event_location);
CREATE INDEX idx_safety_reports_categories ON safety_reports USING GIN(categories);
CREATE INDEX idx_safety_reports_faa_required ON safety_reports(faa_filing_required, faa_filing_deadline)
  WHERE faa_filing_required = TRUE AND faa_filed_at IS NULL;
CREATE INDEX idx_safety_reports_open ON safety_reports(status)
  WHERE status IN ('draft', 'submitted', 'under_review');
CREATE INDEX idx_safety_reports_investigator ON safety_reports(assigned_investigator)
  WHERE assigned_investigator IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- REMOTE ID COMPLIANCE CHECKS (Per-drone RID compliance tracking)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE remote_id_compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  drone_id UUID NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  drone_serial_number VARCHAR(100) NOT NULL,

  -- Compliance method
  compliance_method VARCHAR(20) NOT NULL
    CHECK (compliance_method IN ('standard', 'broadcast_module', 'fria', 'none')),

  -- Hardware checks
  has_remote_id_module BOOLEAN NOT NULL DEFAULT FALSE,
  module_manufacturer VARCHAR(100),
  module_model VARCHAR(100),
  module_serial_number VARCHAR(100),
  module_firmware_version VARCHAR(50),

  -- Serial number format check (ANSI/CTA-2063-A)
  serial_number_valid BOOLEAN NOT NULL DEFAULT FALSE,
  serial_number_format VARCHAR(50) NOT NULL DEFAULT '',

  -- Broadcast capability checks
  broadcast_frequency NUMERIC NOT NULL DEFAULT 0,          -- Hz — must be >= 1 Hz
  broadcast_frequency_compliant BOOLEAN NOT NULL DEFAULT FALSE,
  position_accuracy NUMERIC NOT NULL DEFAULT 0,            -- feet — must be <= 100 ft (95%)
  position_accuracy_compliant BOOLEAN NOT NULL DEFAULT FALSE,
  altitude_accuracy NUMERIC NOT NULL DEFAULT 0,            -- feet — must be <= 150 ft (95%)
  altitude_accuracy_compliant BOOLEAN NOT NULL DEFAULT FALSE,
  transmission_latency NUMERIC NOT NULL DEFAULT 0,         -- seconds — must be <= 1 sec
  transmission_latency_compliant BOOLEAN NOT NULL DEFAULT FALSE,

  -- FRIA check
  operating_in_fria BOOLEAN NOT NULL DEFAULT FALSE,
  fria_id VARCHAR(50),
  fria_name VARCHAR(200),

  -- Overall compliance
  compliant BOOLEAN NOT NULL DEFAULT FALSE,
  compliance_issues TEXT[] NOT NULL DEFAULT '{}',

  -- Timestamps
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_check_due TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rid_checks_tenant ON remote_id_compliance_checks(tenant_id);
CREATE INDEX idx_rid_checks_drone ON remote_id_compliance_checks(drone_id);
CREATE INDEX idx_rid_checks_compliant ON remote_id_compliance_checks(compliant);
CREATE INDEX idx_rid_checks_due ON remote_id_compliance_checks(next_check_due)
  WHERE next_check_due <= NOW() + INTERVAL '7 days';
CREATE INDEX idx_rid_checks_latest ON remote_id_compliance_checks(drone_id, checked_at DESC);
CREATE INDEX idx_rid_checks_noncompliant ON remote_id_compliance_checks(drone_id, compliant)
  WHERE compliant = FALSE;

-- ═══════════════════════════════════════════════════════════════
-- B4UFLY CHECK LOGS (Log of B4UFLY checks performed)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE b4ufly_check_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Check parameters
  check_location GEOMETRY(Point, 4326) NOT NULL,
  altitude_ft INTEGER NOT NULL,
  radius_nm NUMERIC NOT NULL DEFAULT 2.0,

  -- Results
  overall_level advisory_level NOT NULL,
  can_fly BOOLEAN NOT NULL,
  requires_authorization BOOLEAN NOT NULL DEFAULT FALSE,

  -- Detailed results (JSONB)
  advisories JSONB NOT NULL DEFAULT '[]',     -- Array of B4UFlyAdvisory
  nearest_airport JSONB,                       -- Nearest airport info
  uasfm_grid JSONB,                           -- UASFM grid info
  active_tfrs JSONB NOT NULL DEFAULT '[]',    -- Active TFR array

  -- Timestamp
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_b4ufly_logs_tenant ON b4ufly_check_logs(tenant_id);
CREATE INDEX idx_b4ufly_logs_user ON b4ufly_check_logs(user_id);
CREATE INDEX idx_b4ufly_logs_location ON b4ufly_check_logs USING GIST(check_location);
CREATE INDEX idx_b4ufly_logs_level ON b4ufly_check_logs(overall_level);
CREATE INDEX idx_b4ufly_logs_checked_at ON b4ufly_check_logs(checked_at DESC);
CREATE INDEX idx_b4ufly_logs_recent ON b4ufly_check_logs(user_id, checked_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_id_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE b4ufly_check_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_safety_reports ON safety_reports
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_rid_checks ON remote_id_compliance_checks
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_b4ufly_logs ON b4ufly_check_logs
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-generate safety report number: SKW-SR-YYYY-NNNNNN
CREATE OR REPLACE FUNCTION generate_safety_report_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
  v_number TEXT;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(report_number FROM 'SKW-SR-' || v_year || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO v_seq
  FROM safety_reports
  WHERE report_number LIKE 'SKW-SR-' || v_year || '-%';

  v_number := 'SKW-SR-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  NEW.report_number := v_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_safety_report_number
BEFORE INSERT ON safety_reports
FOR EACH ROW
WHEN (NEW.report_number IS NULL OR NEW.report_number = '')
EXECUTE FUNCTION generate_safety_report_number();

-- Auto-set FAA filing deadline (event_date + 10 days) when mandatory
CREATE OR REPLACE FUNCTION set_faa_filing_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-detect mandatory filing based on injury/damage thresholds
  IF NEW.faa_filing_required = TRUE AND NEW.faa_filing_deadline IS NULL THEN
    NEW.faa_filing_deadline := NEW.event_date + INTERVAL '10 days';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_faa_filing_deadline
BEFORE INSERT OR UPDATE ON safety_reports
FOR EACH ROW
EXECUTE FUNCTION set_faa_filing_deadline();

-- Function to check if a safety report triggers mandatory FAA filing
-- Checks: serious injury (AIS 3+), loss of consciousness, property damage > $500
CREATE OR REPLACE FUNCTION check_mandatory_filing_trigger(p_report_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_report RECORD;
  v_is_mandatory BOOLEAN := FALSE;
  v_trigger mandatory_trigger_type := 'none';
  v_reasons TEXT[] := '{}';
  v_injury JSONB;
  v_damage JSONB;
BEGIN
  SELECT * INTO v_report FROM safety_reports WHERE id = p_report_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Report not found');
  END IF;

  -- Check injuries for serious injury (AIS Level 3+) or loss of consciousness
  IF v_report.injuries IS NOT NULL AND jsonb_array_length(v_report.injuries) > 0 THEN
    FOR v_injury IN SELECT * FROM jsonb_array_elements(v_report.injuries) LOOP
      -- Check AIS level >= 3
      IF (v_injury->>'aisLevel')::INTEGER >= 3 THEN
        v_is_mandatory := TRUE;
        v_trigger := 'serious_injury';
        v_reasons := array_append(v_reasons, 'Serious injury (AIS Level ' || (v_injury->>'aisLevel') || ')');
      END IF;

      -- Check severity = serious or fatal
      IF v_injury->>'severity' IN ('serious', 'fatal') THEN
        v_is_mandatory := TRUE;
        v_trigger := 'serious_injury';
        v_reasons := array_append(v_reasons, 'Injury severity: ' || (v_injury->>'severity'));
      END IF;

      -- Check loss of consciousness
      IF (v_injury->>'lossOfConsciousness')::BOOLEAN = TRUE THEN
        v_is_mandatory := TRUE;
        v_trigger := 'loss_of_consciousness';
        v_reasons := array_append(v_reasons, 'Loss of consciousness reported');
      END IF;
    END LOOP;
  END IF;

  -- Check property damage > $500
  IF v_report.total_property_damage_estimate IS NOT NULL
     AND v_report.total_property_damage_estimate > 500 THEN
    v_is_mandatory := TRUE;
    IF v_trigger = 'none' THEN
      v_trigger := 'property_damage_over_500';
    END IF;
    v_reasons := array_append(v_reasons,
      'Property damage exceeds $500 (estimated: $' || v_report.total_property_damage_estimate::TEXT || ')');
  END IF;

  -- Update the report with mandatory filing info
  IF v_is_mandatory THEN
    UPDATE safety_reports
    SET
      report_type = 'mandatory',
      mandatory_trigger = v_trigger,
      faa_filing_required = TRUE,
      faa_filing_deadline = v_report.event_date + INTERVAL '10 days',
      updated_at = NOW()
    WHERE id = p_report_id;
  END IF;

  RETURN jsonb_build_object(
    'reportId', p_report_id,
    'isMandatory', v_is_mandatory,
    'trigger', v_trigger,
    'reasons', to_jsonb(v_reasons),
    'faaDeadline', CASE
      WHEN v_is_mandatory THEN (v_report.event_date + INTERVAL '10 days')::TEXT
      ELSE NULL
    END,
    'checkedAt', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY['safety_reports', 'remote_id_compliance_checks'])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;
