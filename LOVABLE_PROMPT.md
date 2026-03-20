# C6mac Sky Warden — Lovable Implementation Prompt

> **Project**: C6mac Sky Warden — Multi-Region UAV/Drone Fleet & Airspace Management SaaS
> **Regions**: United States (FAA), Canada (Transport Canada / NAV CANADA), Africa (ICAO + national CAAs)
> **Tagline**: "Connecting Local Drone Rules to National & International Air Traffic Management"

---

## EXISTING STATE (What's Already Built)

You are extending an existing React app. Do NOT recreate from scratch. The following exists:

### Pages (all contain static/mock data — need Supabase wiring):
- `LoginPage.tsx` — Split-screen login with MFA fields (static form)
- `RegisterPage.tsx` — Multi-step wizard: persona selection → registration form
- `DashboardPage.tsx` — 4 summary cards, recent activity, upcoming missions
- `AirspaceMapPage.tsx` — Map layout with airspace check results, TFR alerts, layer toggles
- `LaancPage.tsx` — Authorization table, form, stats cards, status filters
- `MissionsPage.tsx` — Mission grid with status tabs, search, date range filters
- `FleetPage.tsx` — Drone fleet cards with status, battery, maintenance, Remote ID compliance
- `CompliancePage.tsx` — Framework cards (Part 107, Remote ID, SOC 2, ISO 27001), audit log
- `AnalyticsPage.tsx` — KPI cards, charts, period selector
- `SettingsPage.tsx` — Tabbed settings (Account, Notifications, Team, Security, API Keys)
- Persona dashboards: `PilotDashboard.tsx`, `EnterpriseDashboard.tsx`, `AgencyDashboard.tsx`, `DeveloperDashboard.tsx`

### Infrastructure Already Configured:
- **React Router v7** with `ProtectedRoute`, `PersonaRedirect`, nested routes under `DashboardLayout`
- **Zustand auth store** (`useAuthStore`) with localStorage persistence, `hasPermission()`, `hasRole()`, `isPersona()`
- **API client** (`utils/api.ts`) with JWT auto-injection, 401 refresh retry, base URL `/api/v1`
- **React Query** configured (staleTime: 30s, retry: 2)
- **Airspace hooks** (`useAirspaceCheck`, `useTfrs`, `useGeofences`) — pointing at non-existent API
- **Design system**: Tailwind v4, CSS custom properties for aviation colors, dark sidebar (bg-gray-900)
- **DashboardLayout**: Collapsible sidebar (280px), 64px header, notification bell, FAA Approved badge
- **Dependencies installed**: mapbox-gl, @turf/turf, recharts, react-hook-form, zod, sonner, date-fns, lucide-react

### Design Tokens (preserve these exactly):
```css
--color-primary-500: #3b82f6 (blue)
--color-success-500: #22c55e (green)
--color-warning-500: #f59e0b (amber)
--color-danger-500: #ef4444 (red)
--color-airspace-b: #ff6b6b
--color-airspace-c: #ffa94d
--color-airspace-d: #74c0fc
--color-airspace-e: #b197fc
--color-airspace-g: #69db7c
--color-airspace-tfr: #ff0000
--sidebar-width: 280px
--header-height: 64px
Font: 'Inter', system-ui
```

---

## PHASE 1: Authentication + Database Foundation

### 1A. Supabase Auth Setup

Wire the existing `LoginPage.tsx` and `RegisterPage.tsx` to real Supabase Auth:

```
Authentication Methods:
- Email/password (primary)
- Magic link (passwordless option)
- Google OAuth (optional, enterprise SSO later)
- MFA via TOTP (the MFA fields already exist on the login page)

Registration Flow (multi-step, already in RegisterPage):
Step 1: Select persona
  - "I am an individual drone pilot"
  - "I manage an enterprise UAS program"
  - "I represent a local or airspace agency"
  - "I am an airspace or app developer"
Step 2: Collect info based on persona
  - All: name, email, password, phone
  - Pilot: FAA certificate number (USA) / RPAS certificate (Canada) / national license (Africa), country, region
  - Enterprise: organization name, fleet size estimate, country
  - Agency: agency name, jurisdiction type, country
  - Developer: company name (optional), use case description
Step 3: Email verification → onboarding wizard
```

**Update the existing Zustand store** (`stores/auth.store.ts`) to call Supabase instead of mocking:

```typescript
// Replace mock setAuth() with real Supabase calls:
signIn(email, password) → supabase.auth.signInWithPassword()
signUp(email, password, metadata) → supabase.auth.signUp()
signOut() → supabase.auth.signOut()
refreshSession() → supabase.auth.refreshSession()
onAuthStateChange() → supabase.auth.onAuthStateChange() // in App.tsx or provider
```

### 1B. Database Schema (Supabase / PostgreSQL)

Create these tables with Row-Level Security (RLS) policies:

```sql
-- ============================================================
-- MULTI-REGION: Every tenant is scoped to a region
-- ============================================================

CREATE TYPE region_code AS ENUM ('US', 'CA', 'NG', 'KE', 'ZA', 'GH', 'RW', 'TZ', 'ET', 'SN', 'CI', 'UG');
CREATE TYPE persona_type AS ENUM ('individual_pilot', 'enterprise_manager', 'agency_representative', 'developer');

-- TENANTS (organizations / individual accounts)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region region_code NOT NULL DEFAULT 'US',
  country_name TEXT NOT NULL DEFAULT 'United States',
  regulatory_authority TEXT NOT NULL DEFAULT 'FAA', -- 'FAA', 'Transport Canada', 'NCAA', 'KCAA', 'SACAA', etc.
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise', 'agency')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- USER PROFILES (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  persona persona_type NOT NULL,
  avatar_url TEXT,
  region region_code NOT NULL DEFAULT 'US',
  timezone TEXT DEFAULT 'America/New_York',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ROLES & PERMISSIONS (RBAC)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name TEXT NOT NULL, -- 'tenant_admin', 'fleet_manager', 'pilot', 'safety_officer', 'viewer', etc.
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false, -- system roles can't be deleted
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- PILOT PROFILES (certification tracking per region)
CREATE TABLE pilot_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  region region_code NOT NULL,

  -- USA (FAA)
  part107_certificate_number TEXT,
  part107_expires_at TIMESTAMPTZ,
  trust_completion_date DATE,
  faa_tracking_number TEXT,

  -- Canada (Transport Canada)
  rpas_basic_certificate TEXT,
  rpas_advanced_certificate TEXT,
  tc_pilot_certificate_expiry TIMESTAMPTZ,
  sfoc_numbers TEXT[], -- Special Flight Operations Certificates

  -- Africa (varies by country)
  national_license_number TEXT,
  national_license_authority TEXT, -- e.g., 'NCAA' (Nigeria), 'KCAA' (Kenya), 'SACAA' (South Africa)
  national_license_expiry TIMESTAMPTZ,

  -- Universal
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

-- DRONES (fleet assets)
CREATE TABLE drones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  nickname TEXT,
  serial_number TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('micro', 'small', 'medium', 'large')),
  weight_grams INTEGER,
  max_altitude_ft INTEGER DEFAULT 400,
  max_flight_time_minutes INTEGER,
  max_speed_mps DECIMAL(6,2),

  -- Registration (region-specific)
  region region_code NOT NULL,
  faa_registration_number TEXT, -- USA: starts with FA
  tc_registration_number TEXT,  -- Canada: C-xxxx
  national_registration_number TEXT, -- Africa
  registration_expiry TIMESTAMPTZ,

  -- Remote ID
  remote_id_type TEXT CHECK (remote_id_type IN ('standard', 'broadcast_module', 'none')),
  remote_id_serial TEXT,
  remote_id_compliant BOOLEAN DEFAULT false,

  -- Status & Tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'grounded', 'maintenance', 'in_flight', 'returning', 'charging', 'decommissioned')),
  current_location JSONB, -- {lat, lng, alt, updated_at}
  total_flight_hours DECIMAL(10,2) DEFAULT 0,
  total_flights INTEGER DEFAULT 0,
  battery_cycle_count INTEGER DEFAULT 0,
  next_maintenance_due TIMESTAMPTZ,
  firmware_version TEXT,

  -- Media
  image_url TEXT,
  documents JSONB DEFAULT '[]', -- [{name, url, type, uploaded_at}]
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MISSIONS (flight operations)
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL CHECK (mission_type IN (
    'mapping', 'inspection', 'survey', 'photography', 'videography',
    'delivery', 'search_rescue', 'surveillance', 'agriculture',
    'construction', 'emergency', 'training', 'research', 'custom'
  )),
  region region_code NOT NULL,

  -- Assignment
  pilot_id UUID REFERENCES user_profiles(id),
  drone_id UUID REFERENCES drones(id),

  -- Status (enforced state machine)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'planned', 'preflight_check', 'awaiting_authorization',
    'authorized', 'in_progress', 'paused', 'completed', 'aborted', 'cancelled'
  )),

  -- Location (GeoJSON stored as JSONB for Lovable/Supabase compatibility)
  operation_area JSONB, -- GeoJSON Polygon
  launch_point JSONB,   -- GeoJSON Point {type: "Point", coordinates: [lng, lat]}
  waypoints JSONB,      -- GeoJSON LineString or array of points
  max_altitude_ft INTEGER DEFAULT 400,

  -- Timing
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  -- Authorization
  laanc_authorization_id UUID, -- links to laanc_authorizations if applicable
  authorization_status TEXT,

  -- Pre-flight
  preflight_checklist JSONB DEFAULT '[]',
  weather_check JSONB,
  risk_score INTEGER, -- 0-100

  -- Post-flight
  flight_log JSONB,
  incidents JSONB DEFAULT '[]',
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AIRSPACE DATA (region-aware)
CREATE TABLE airspace_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region region_code NOT NULL,
  zone_type TEXT NOT NULL, -- 'controlled', 'restricted', 'prohibited', 'danger', 'advisory', 'tfr', 'notam'
  airspace_class TEXT, -- 'A', 'B', 'C', 'D', 'E', 'F', 'G'
  name TEXT NOT NULL,
  description TEXT,
  authority TEXT, -- 'FAA', 'NAV CANADA', 'NCAA', etc.
  facility_id TEXT, -- airport/facility identifier

  -- Geometry as GeoJSON (JSONB for Supabase compatibility)
  geometry JSONB NOT NULL, -- GeoJSON Polygon/MultiPolygon
  center_point JSONB,     -- GeoJSON Point for quick lookups

  -- Altitude limits
  floor_ft INTEGER DEFAULT 0,
  ceiling_ft INTEGER DEFAULT 400,
  max_allowable_ft INTEGER, -- UASFM/equivalent grid ceiling

  -- LAANC / authorization
  laanc_enabled BOOLEAN DEFAULT false,
  auto_approval_ceiling_ft INTEGER, -- auto-approve below this altitude
  requires_authorization BOOLEAN DEFAULT false,

  -- Validity
  effective_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  source TEXT, -- 'FAA_UASFM', 'FAA_TFR', 'NAV_CANADA', 'ICAO', 'LOCAL_AGENCY', etc.
  source_id TEXT, -- external reference ID
  chart_cycle TEXT, -- e.g., '2026-03-20' (56-day cycle for USA)

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LAANC AUTHORIZATIONS (USA) / SFOC (Canada) / National Approvals (Africa)
CREATE TABLE flight_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  reference_code TEXT UNIQUE NOT NULL, -- 'SKW-XXXXXXXX-N' (Sky Warden prefix)
  region region_code NOT NULL,

  -- Type varies by region
  authorization_type TEXT NOT NULL, -- 'laanc_nrt' (USA), 'laanc_fc' (USA), 'sfoc' (Canada), 'national_approval' (Africa)

  -- Request details
  pilot_id UUID REFERENCES user_profiles(id),
  drone_id UUID REFERENCES drones(id),
  facility_id TEXT,
  airspace_class TEXT,
  operation_area JSONB NOT NULL, -- GeoJSON
  requested_altitude_ft INTEGER NOT NULL,
  approved_altitude_ft INTEGER,

  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'submitted', 'auto_approved', 'under_review',
    'approved', 'conditionally_approved', 'denied', 'expired',
    'cancelled', 'rescinded'
  )),

  -- Response
  response_time_ms INTEGER,
  conditions TEXT[], -- any conditions attached to approval
  denial_reason TEXT,
  reviewed_by TEXT, -- authority reviewer

  -- Metadata
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- REMOTE ID BROADCASTS (telemetry — high-volume)
CREATE TABLE remote_id_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES drones(id),
  tenant_id UUID REFERENCES tenants(id),
  region region_code NOT NULL,

  uas_id TEXT NOT NULL, -- Remote ID serial or session ID
  broadcast_method TEXT CHECK (broadcast_method IN ('wifi_nan', 'bluetooth_le', 'bluetooth_legacy', 'network')),

  -- Positions
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

-- AUDIT LOG (immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL, -- 'mission.created', 'drone.updated', 'laanc.submitted', etc.
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB, -- {before: {}, after: {}}
  ip_address TEXT,
  user_agent TEXT,
  region region_code,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  type TEXT NOT NULL, -- 'laanc_approved', 'mission_reminder', 'cert_expiring', 'maintenance_due', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- additional context (link, resource_id, etc.)
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AGENCY RULES (local drone rules published by agencies)
CREATE TABLE agency_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  region region_code NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'altitude_restriction', 'no_fly_zone', 'time_restriction',
    'noise_restriction', 'privacy_zone', 'temporary_restriction', 'operational_requirement'
  )),
  geometry JSONB, -- GeoJSON for spatial rules
  parameters JSONB, -- {max_altitude_ft, allowed_hours, noise_db_limit, etc.}
  effective_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  enforcement_level TEXT DEFAULT 'mandatory' CHECK (enforcement_level IN ('advisory', 'mandatory', 'prohibited')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- API KEYS (developer persona)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- first 8 chars for display: 'skw_live_xxxxxxxx'
  key_hash TEXT NOT NULL,   -- bcrypt hash of full key
  scopes TEXT[] NOT NULL DEFAULT '{}', -- ['airspace:read', 'fleet:read', etc.]
  environment TEXT DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_user_profiles_tenant ON user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_persona ON user_profiles(persona);
CREATE INDEX idx_drones_tenant ON drones(tenant_id);
CREATE INDEX idx_drones_status ON drones(tenant_id, status);
CREATE INDEX idx_missions_tenant ON missions(tenant_id);
CREATE INDEX idx_missions_status ON missions(tenant_id, status);
CREATE INDEX idx_missions_pilot ON missions(pilot_id);
CREATE INDEX idx_flight_auths_tenant ON flight_authorizations(tenant_id);
CREATE INDEX idx_flight_auths_status ON flight_authorizations(tenant_id, status);
CREATE INDEX idx_airspace_zones_region ON airspace_zones(region);
CREATE INDEX idx_airspace_zones_active ON airspace_zones(is_active, region);
CREATE INDEX idx_remote_id_timestamp ON remote_id_broadcasts(timestamp DESC);
CREATE INDEX idx_remote_id_drone ON remote_id_broadcasts(drone_id, timestamp DESC);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tenant's data
CREATE POLICY tenant_isolation ON user_profiles FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY tenant_isolation ON drones FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY tenant_isolation ON missions FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY tenant_isolation ON flight_authorizations FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY tenant_isolation ON pilot_profiles FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY tenant_isolation ON audit_logs FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY tenant_isolation ON notifications FOR ALL USING (
  user_id = auth.uid()
);
-- Airspace zones are public read
CREATE POLICY public_read ON airspace_zones FOR SELECT USING (true);
-- Agency rules: agencies manage their own, others can read active rules
CREATE POLICY agency_manage ON agency_rules FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY public_read_active ON agency_rules FOR SELECT USING (is_active = true);
```

### 1C. Supabase Edge Functions (or Database Functions)

Create these RPC functions:

```sql
-- Auto-create tenant + user_profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a personal tenant for the user
  INSERT INTO tenants (name, slug, region, regulatory_authority)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', NEW.raw_user_meta_data->>'display_name'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), ' ', '-')) || '-' || LEFT(NEW.id::text, 8),
    COALESCE((NEW.raw_user_meta_data->>'region')::region_code, 'US'),
    CASE COALESCE(NEW.raw_user_meta_data->>'region', 'US')
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
    END
  )
  RETURNING id INTO tenant_id_var;

  -- Create user profile
  INSERT INTO user_profiles (id, tenant_id, display_name, email, phone, persona, region)
  VALUES (
    NEW.id,
    tenant_id_var,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.phone,
    COALESCE((NEW.raw_user_meta_data->>'persona')::persona_type, 'individual_pilot'),
    COALESCE((NEW.raw_user_meta_data->>'region')::region_code, 'US')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## PHASE 2: Fleet Management CRUD (Wire FleetPage.tsx)

### 2A. Replace Mock Data with Supabase Queries

In `FleetPage.tsx`, replace the hardcoded `mockDrones` array with real Supabase queries:

```typescript
// hooks/useFleet.ts — Create these React Query hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDrones(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['drones', filters],
    queryFn: async () => {
      let query = supabase.from('drones').select('*').order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) query = query.or(`nickname.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateDrone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drone: CreateDroneInput) => {
      const { data, error } = await supabase.from('drones').insert(drone).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drones'] })
  });
}

export function useUpdateDrone() { /* similar pattern */ }
export function useDeleteDrone() { /* similar pattern */ }
```

### 2B. Add Drone Form Modal

Create a `CreateDroneDialog` component (use Radix Dialog or shadcn Sheet):

```
Fields:
- Nickname (text)
- Serial Number (text, required)
- Manufacturer (select: DJI, Autel, Skydio, senseFly, Parrot, Freefly, Custom)
- Model (text)
- Category (select: Micro <250g, Small 250g-25kg, Medium 25-150kg, Large >150kg)
- Weight (number, grams)
- Max Altitude (number, ft, default 400)
- Max Flight Time (number, minutes)
- Region (select from region_code enum)
- Registration Number (text — label changes based on region: "FAA Registration" / "TC Registration" / "National Registration")
- Registration Expiry (date)
- Remote ID Type (select: Standard, Broadcast Module, None)
- Remote ID Serial (text, conditional on type != None)
- Tags (multi-select/chips)
- Photo upload (Supabase Storage → drones bucket)
```

### 2C. Drone Detail Page

Create `/fleet/:droneId` route showing:
- Drone info card with photo, registration, status
- Telemetry history chart (if data exists)
- Flight log (missions linked to this drone)
- Maintenance log
- Documents section (upload certificates, insurance docs to Supabase Storage)
- Status change actions (Ground, Activate, Send to Maintenance, Decommission)

---

## PHASE 3: Interactive Airspace Map (Wire AirspaceMapPage.tsx)

### 3A. Mapbox GL JS Integration

The dependency `mapbox-gl` is already installed. Create:

```typescript
// components/airspace/AirspaceMap.tsx

Key features:
1. Full-screen Mapbox GL map with satellite/streets toggle
2. Draw airspace zones as colored polygons based on class (use --color-airspace-* tokens)
3. TFR overlay (red hatched polygons)
4. NOTAM markers
5. User's drones shown as real-time markers (if in_flight)
6. Click-to-check: click anywhere → run airspace check → show result panel
7. Draw tool: draw a polygon to define mission operation area
8. Layer toggles (already exist in the page as checkboxes — wire them):
   - Controlled Airspace (B/C/D/E)
   - Uncontrolled (G)
   - TFRs
   - NOTAMs
   - Agency Rules
   - Airports
   - Your Fleet (live positions)

Map initialization:
- USA default center: [-98.5795, 39.8283] (geographic center of US)
- Canada: [-96.4835, 62.2400]
- Africa: [17.5707, 3.3792] (center of continent)
- Zoom: 4 (country level) → auto-zoom to user's region
```

### 3B. Airspace Check (B4UFLY equivalent)

When user clicks map or enters coordinates:

```
Airspace Check Result Panel:
┌────────────────────────────────────────┐
│ 📍 Airspace Check                      │
│ Location: 38.8977°N, 77.0365°W         │
│ Altitude: 200 ft AGL                   │
│                                        │
│ ⚠️ AUTHORIZATION REQUIRED              │
│                                        │
│ Airspace: Class B (DCA)                │
│ LAANC Available: ✅ Yes                │
│ Max Auto-Approve: 100 ft              │
│ Your Requested: 200 ft → Further Coord │
│                                        │
│ Active TFRs: 1 (Presidential TFR)      │
│ NOTAMs: 2 affecting UAS               │
│ Local Rules: 1 (DC no-fly perimeter)   │
│                                        │
│ [Apply for LAANC Auth] [Plan Mission]  │
└────────────────────────────────────────┘
```

### 3C. Multi-Region Airspace Data

Load airspace zones from the `airspace_zones` table, filtered by region:

```
USA:
- Source: FAA UASFM (UAS Facility Maps) — load from https://udds-faa.opendata.arcgis.com
- Classes B, C, D, E near airports
- TFRs from FAA TFR feed
- LAANC grid ceilings

Canada:
- Source: NAV CANADA airspace data
- CYR (Restricted), CYD (Danger), CYA (Advisory) zones
- NOTAM source: NAV CANADA NOTAM system
- No LAANC equivalent — uses SFOC (Special Flight Operations Certificate) process
- NAV CANADA drone flight request zones

Africa (by country):
- Nigeria (NCAA): Lagos, Abuja airport zones, restricted military areas
- Kenya (KCAA): Nairobi (JKIA/Wilson), Mombasa, restricted zones
- South Africa (SACAA): OR Tambo, Cape Town, restricted areas (Robben Island, military)
- Ghana (GCAA): Kotoka International zones
- Rwanda (RCAA): Kigali International, drone corridor zones (Rwanda is a leader in drone delivery)
- Others: Major airport zones + military restricted areas per ICAO standards

Pre-seed airspace_zones table with:
- Top 50 US airports with UASFM grid data
- Top 20 Canadian airports
- Major airports in each supported African country
- National parks / restricted areas
```

---

## PHASE 4: Missions Lifecycle (Wire MissionsPage.tsx)

### 4A. Mission Creation Wizard

Multi-step form:

```
Step 1: Basic Info
- Title, Description, Mission Type (select from 14 types)
- Region (auto-set from user profile)

Step 2: Location (Map-based)
- Interactive map to draw operation area (polygon)
- Set launch point (marker)
- Optional: draw waypoints (line)
- Set max altitude (slider: 0-400ft, or higher if auth'd)

Step 3: Schedule
- Start date/time, End date/time
- Duration auto-calculated

Step 4: Assignment
- Select Pilot (from team, or self for individual)
- Select Drone (from fleet, filtered by status=active)

Step 5: Airspace Check (automatic)
- Run airspace check on the operation area
- Show results: clear/caution/warning/restricted
- If authorization required: prompt to apply (links to LAANC/SFOC flow)
- Show risk score (auto-calculated: altitude + weather + airspace + time of day)

Step 6: Review & Create
- Summary of all selections
- Create as Draft or Planned
```

### 4B. Mission Status State Machine

Enforce these transitions in the UI (disable invalid action buttons):

```
draft → planned → preflight_check → awaiting_authorization → authorized → in_progress → completed
                                                                        → paused → in_progress
                                                              → aborted
draft → cancelled
planned → cancelled
```

Each status change should:
1. Update the mission record
2. Create an audit_log entry
3. Send a notification to relevant users
4. If `in_progress`: update drone status to `in_flight`
5. If `completed`: update drone to `active`, increment flight hours

### 4C. Pre-Flight Checklist

When mission enters `preflight_check` status, show interactive checklist:

```
Default 26-item checklist across 6 categories:
✅ Aircraft Condition (6 items): propellers, frame, motors, camera, landing gear, firmware
✅ Battery (4 items): charge level, physical condition, cycle count, temperature
✅ Control System (4 items): controller charged, signal test, failsafe configured, GPS lock
✅ Environment (4 items): weather acceptable, wind < limits, visibility, lighting
✅ Regulatory (4 items): authorization confirmed, Remote ID active, registration current, insurance valid
✅ Site Assessment (4 items): launch area clear, spectators managed, obstacles identified, emergency landing zones

All items must be checked to proceed to awaiting_authorization or in_progress.
```

---

## PHASE 5: Flight Authorization Engine (Wire LaancPage.tsx)

### 5A. Multi-Region Authorization Flow

**USA — LAANC (Low Altitude Authorization & Notification Capability):**
```
Two paths:
1. Near Real-Time (NRT): Auto-approved if altitude ≤ UASFM grid ceiling
   - Submit → Auto-Approved (< 1 second) → Reference code generated

2. Further Coordination (FC): Altitude > grid ceiling but ≤ 400ft
   - Submit → Under Review → Approved/Denied (up to 72 hours)
   - User sees real-time status updates

Reference codes: SKW-{8 hex chars}-{N|F|M}
  N = near real-time, F = further coordination, M = manual
```

**Canada — SFOC (Special Flight Operations Certificate):**
```
For operations in controlled airspace or beyond VLOS:
- Submit request with flight plan details
- Status: Submitted → Under Review → Approved/Conditionally Approved/Denied
- Typical review: 20-30 business days (show estimated timeline)
- NAV CANADA drone zone requests for controlled airspace (faster path)
```

**Africa — National Authority Approval:**
```
Varies by country — generalized workflow:
- Submit application with flight details, pilot credentials, drone registration
- Status: Submitted → Under Review → Approved/Denied
- Show country-specific requirements:
  - Nigeria (NCAA): ROC (Remote Operator Certificate) required
  - Kenya (KCAA): Authorization letter needed, restricted near national parks
  - South Africa (SACAA): RPA Operators Certificate (ROC) + Letter of Approval
  - Rwanda (RCAA): Online portal submission (most digitized in Africa)
  - Ghana (GCAA): Permit application + site survey may be required
```

### 5B. Authorization Form

The existing `LaancPage.tsx` has a basic form layout. Enhance it:

```
Fields:
- Region (auto-set, determines auth type)
- Authorization Type (auto-determined: LAANC NRT/FC, SFOC, National)
- Operation Area (select from map or link to existing mission)
- Requested Altitude (slider with UASFM ceiling indicator for USA)
- Start/End Time
- Pilot (select)
- Drone (select)
- Purpose of Flight (text)
- For Canada/Africa: additional docs upload (flight plan PDF, insurance, certifications)

Auto-calculate:
- Nearby airports/facilities
- Airspace class
- Whether auto-approval is possible (USA only)
- Estimated review time
```

### 5C. Authorization Dashboard

Replace mock data in `LaancPage.tsx`:

```
Stats Cards (top row):
- Total Authorizations (this month)
- Pending Review
- Approved (active)
- Average Response Time

Table Columns:
- Reference Code (SKW-XXXXX-N)
- Type (LAANC NRT | LAANC FC | SFOC | National)
- Airspace/Facility
- Altitude (requested → approved)
- Status Badge (color-coded)
- Valid Period
- Actions (View, Cancel if pending/approved)
```

---

## PHASE 6: Real-Time Features

### 6A. Notifications (Wire the Bell Icon)

The notification bell in `DashboardLayout.tsx` currently shows a static "3" badge. Wire it:

```
Supabase Realtime subscription on notifications table:

useEffect(() => {
  const channel = supabase.channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, (payload) => {
      // Add to notification list
      // Increment badge count
      // Show toast via sonner
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [user.id]);

Notification Types:
- laanc_approved: "Your LAANC authorization SKW-XXXX-N has been approved"
- laanc_denied: "Your authorization was denied: {reason}"
- cert_expiring: "Your Part 107 certificate expires in 30 days"
- maintenance_due: "Drone {nickname} is due for maintenance"
- mission_reminder: "Mission '{title}' starts in 1 hour"
- team_invite: "You've been invited to join {org_name}"
- rule_update: "New airspace rule affecting your area"

Notification Dropdown (click bell):
- List of recent notifications, newest first
- Unread highlighted
- Click → navigate to relevant page
- "Mark all as read" button
- "View all" → full notifications page
```

### 6B. Real-Time Fleet Tracking

If a drone has status `in_flight`, show live position on map:

```
Supabase Realtime on remote_id_broadcasts:
- Subscribe to new broadcasts for tenant's drones
- Update drone markers on the Mapbox map
- Show telemetry overlay: altitude, speed, heading, battery
- Trail line showing flight path
```

### 6C. Live Mission Status

```
When a mission is in_progress:
- Real-time status updates via Supabase Realtime
- Live drone position on mission detail page
- Elapsed time counter
- Battery drain estimation
- "Abort Mission" emergency button (prominent, red)
```

---

## PHASE 7: Persona-Specific Dashboards

### 7A. Individual Pilot Dashboard (`PilotDashboard.tsx`)

Replace mock data:
```
My Certifications:
- Show real pilot_profile data
- Expiry warnings (amber if < 60 days, red if < 30 days)
- Region-specific: Part 107 (USA), RPAS Cert (Canada), National License (Africa)

My Drones:
- Query drones where id IN pilot_profile.assigned_drone_ids
- Quick status, registration expiry, Remote ID compliance

My Recent Flights:
- Query missions where pilot_id = current user, ordered by date DESC

My Authorizations:
- Query flight_authorizations where pilot_id = current user

Quick Actions:
- "Check Airspace" → AirspaceMapPage
- "New Mission" → Mission wizard
- "Request Authorization" → LAANC/SFOC page
```

### 7B. Enterprise Dashboard (`EnterpriseDashboard.tsx`)

```
Fleet Overview:
- Drones by status (pie chart, real data)
- Total flight hours this period (area chart)
- Compliance rate (% of fleet with valid registration + Remote ID)

Team:
- Pilots table with certification status, assigned drones, flight hours
- Invite team member button
- Role management

Utilization:
- Drone utilization bars (hours flown / available hours)
- Most active pilots
- Mission completion rate

Compliance:
- Part 107 / RPAS / National license status for all pilots
- Registration expiry tracker for all drones
- Remote ID compliance across fleet
```

### 7C. Agency Dashboard (`AgencyDashboard.tsx`)

```
Jurisdiction Management:
- Map showing agency's jurisdiction boundary
- Manage local drone rules (CRUD on agency_rules table)
- View drone activity in jurisdiction (Remote ID broadcasts)

Active Rules:
- Table of agency's published rules
- Create/Edit rule form with map-based geometry drawing
- Rule types: altitude restriction, no-fly zone, time restriction, noise, privacy

Incident Reports:
- Log and track drone-related incidents
- Severity levels: low, medium, high, critical
- Status: reported, investigating, resolved, closed

Live Activity Feed:
- Remote ID broadcasts within jurisdiction
- Shows drone ID, operator, altitude, compliance status
```

### 7D. Developer Dashboard (`DeveloperDashboard.tsx`)

```
API Keys:
- Create API key with name, scopes, environment (sandbox/production)
- Key format: skw_live_XXXXXXXXXXXX or skw_test_XXXXXXXXXXXX
- Show key once on creation, then only prefix
- Delete/rotate keys

Webhooks:
- Configure webhook endpoints
- Select events: mission.completed, authorization.approved, drone.status_changed, etc.
- Delivery log with retry status

API Reference (static):
- Endpoint list with methods, paths, descriptions
- Quick-start code examples (curl, Python, Node.js)

Sandbox:
- Test environment with mock data
- Rate limit display: X/1000 requests used this hour
```

---

## PHASE 8: Analytics & Compliance (Wire AnalyticsPage.tsx, CompliancePage.tsx)

### 8A. Analytics Dashboard

Replace mock chart data with real Supabase aggregations:

```typescript
// Use Supabase RPC for aggregated queries

// Flight hours over time (area chart)
const { data: flightHours } = await supabase.rpc('get_flight_hours_by_period', {
  tenant_id: user.tenantId,
  period: '30d' // or '7d', '90d', '12m'
});

// Mission types breakdown (pie chart)
const { data: missionTypes } = await supabase
  .from('missions')
  .select('mission_type')
  .eq('tenant_id', user.tenantId)
  .eq('status', 'completed');

// Authorization stats (bar chart)
const { data: authStats } = await supabase
  .from('flight_authorizations')
  .select('status, authorization_type')
  .eq('tenant_id', user.tenantId);
```

KPI Cards:
- Total Flight Hours (this period vs previous, show % change)
- Active Drones (count where status != decommissioned)
- Missions Completed (this period)
- Authorization Success Rate (approved / total submitted × 100)
- Average Response Time (for authorizations)
- Compliance Score (% of fleet compliant)

### 8B. Compliance Dashboard

```
Compliance Frameworks (cards with progress bars):

1. FAA Part 107 (USA) / RPAS (Canada) / National (Africa)
   - Pilot certifications valid: X/Y pilots
   - Drone registrations current: X/Y drones
   - Progress: calculated percentage

2. Remote ID (14 CFR Part 89 or equivalent)
   - Compliant drones: X/Y
   - Broadcasting actively: X
   - Non-compliant list with "Fix" action

3. SOC 2 Type II (Enterprise only)
   - Control categories: Access Control, Data Protection, Monitoring, Incident Response
   - Status per control: Implemented / In Progress / Not Started

4. ISO 27001 (Enterprise only)
   - ISMS controls status
   - Last audit date
   - Next audit due

Audit Log (bottom section):
- Query audit_logs table
- Filterable by action, user, resource, date range
- Export to CSV
- Immutable — no edit/delete buttons
```

---

## PHASE 9: Settings & Team Management (Wire SettingsPage.tsx)

### 9A. Account Settings Tab
```
- Display name (editable)
- Email (read-only, change via Supabase Auth)
- Phone (editable)
- Avatar upload (Supabase Storage → avatars bucket)
- Region/Country (select, updates regulatory context)
- Timezone (select)
- Theme preference (light/dark — future)
```

### 9B. Security Tab
```
- Change password (Supabase Auth)
- MFA Setup:
  - Enable TOTP (show QR code via supabase.auth.mfa.enroll())
  - Verify with 6-digit code
  - Show recovery codes
  - Unenroll option
- Active sessions list (Supabase Auth sessions)
- Session timeout setting
```

### 9C. Team Management Tab (Enterprise + Agency personas)
```
- Team members table: name, email, role, status, last active
- Invite member: email + role select → sends invitation email
- Change member role
- Remove member
- Pending invitations list
```

### 9D. Notification Preferences Tab
```
Matrix of notification types × channels:
                    | In-App | Email |
Mission Reminders   |  ✅    |  ✅   |
Auth Status Changes |  ✅    |  ✅   |
Cert Expiry Alerts  |  ✅    |  ✅   |
Maintenance Alerts  |  ✅    |  ☐   |
Team Activity       |  ✅    |  ☐   |
System Updates      |  ☐    |  ☐   |
```

### 9E. API Keys Tab (Developer persona)
```
- Same as Developer Dashboard API Keys section
- Visible only to developer persona or tenant_admin role
```

---

## PHASE 10: Mobile Responsiveness

### 10A. Layout Fixes
```
- Sidebar: already has mobile drawer (DashboardLayout) — verify it works properly
- All pages: ensure grid layouts collapse to single column on mobile
- Tables: horizontal scroll wrapper on small screens
- Map: full-bleed on mobile, controls repositioned
- Forms: stack fields vertically on mobile
- Cards: single column on mobile, 2-col on tablet, 3-4 col on desktop
```

### 10B. Touch Interactions
```
- Map: pinch-to-zoom, tap-to-check
- Swipe gestures on notification drawer
- Bottom sheet for map results on mobile (instead of side panel)
- Pull-to-refresh on list pages
```

---

## PHASE 11: Storage & File Management

### 11A. Supabase Storage Buckets

```
Buckets to create:
1. avatars — user profile photos (public read)
2. drone-images — drone photos (tenant-isolated)
3. documents — certificates, insurance, flight plans (tenant-isolated, private)
4. mission-media — photos/videos captured during missions (tenant-isolated)

Storage policies: RLS based on tenant_id in file path
File path convention: {tenant_id}/{resource_type}/{resource_id}/{filename}
```

### 11B. Upload Components

```
Create reusable upload components:
- AvatarUpload: circular crop, preview, max 2MB
- ImageUpload: drag-and-drop, preview, max 10MB
- DocumentUpload: drag-and-drop, accept PDF/DOC/DOCX/JPG/PNG, max 25MB
- Show upload progress bar
- Display uploaded files with download/delete actions
```

---

## MULTI-REGION CONFIGURATION

### Region-Aware UI Behavior

The app should adapt based on the user's `region` field:

```typescript
// lib/region-config.ts

export const REGION_CONFIG = {
  US: {
    name: 'United States',
    authority: 'FAA',
    authorityUrl: 'https://www.faa.gov/uas',
    authorizationType: 'LAANC',
    certificationName: 'Part 107 Remote Pilot Certificate',
    registrationPrefix: 'FA',
    registrationLabel: 'FAA Registration Number',
    maxAltitudeFt: 400,
    remoteIdRequired: true,
    remoteIdRegulation: '14 CFR Part 89',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    measurementSystem: 'imperial',
    mapCenter: [-98.5795, 39.8283],
    mapZoom: 4,
    laancEnabled: true,
    b4uflyUrl: 'https://www.faa.gov/uas/getting_started/b4ufly',
    helpResources: [
      { label: 'FAA DroneZone', url: 'https://faadronezone.faa.gov' },
      { label: 'B4UFLY App', url: 'https://www.faa.gov/uas/getting_started/b4ufly' },
      { label: 'Part 107 Study Guide', url: 'https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/remote_pilot_study_guide.pdf' }
    ]
  },
  CA: {
    name: 'Canada',
    authority: 'Transport Canada',
    authorityUrl: 'https://tc.canada.ca/en/aviation/drone-safety',
    authorizationType: 'SFOC',
    certificationName: 'RPAS Pilot Certificate',
    registrationPrefix: 'C-',
    registrationLabel: 'Transport Canada Registration',
    maxAltitudeFt: 400, // 122m
    remoteIdRequired: true,
    remoteIdRegulation: 'CAR 901.83',
    currency: 'CAD',
    dateFormat: 'yyyy-MM-dd',
    measurementSystem: 'metric', // show meters alongside feet
    mapCenter: [-96.4835, 62.2400],
    mapZoom: 3,
    laancEnabled: false,
    sfocRequired: true,
    navCanadaUrl: 'https://www.navcanada.ca/en/flight-planning/drone-flight-planning.aspx',
    helpResources: [
      { label: 'Transport Canada Drone Safety', url: 'https://tc.canada.ca/en/aviation/drone-safety' },
      { label: 'NAV CANADA Drone Flight Planning', url: 'https://www.navcanada.ca/en/flight-planning/drone-flight-planning.aspx' },
      { label: 'RPAS Study Guide', url: 'https://tc.canada.ca/en/aviation/drone-safety/learn-rules-you-fly-your-drone/find-your-category-drone-operation' }
    ]
  },
  // African countries
  NG: {
    name: 'Nigeria',
    authority: 'NCAA (Nigerian Civil Aviation Authority)',
    authorityUrl: 'https://ncaa.gov.ng',
    authorizationType: 'National Approval',
    certificationName: 'ROC (Remote Operator Certificate)',
    registrationLabel: 'NCAA Registration Number',
    maxAltitudeFt: 400,
    remoteIdRequired: false, // not yet mandated
    currency: 'NGN',
    dateFormat: 'dd/MM/yyyy',
    measurementSystem: 'metric',
    mapCenter: [8.6753, 9.0820],
    mapZoom: 6,
    laancEnabled: false,
    helpResources: [
      { label: 'NCAA UAS Regulations', url: 'https://ncaa.gov.ng' }
    ]
  },
  KE: {
    name: 'Kenya',
    authority: 'KCAA (Kenya Civil Aviation Authority)',
    authorityUrl: 'https://www.kcaa.or.ke',
    authorizationType: 'National Approval',
    certificationName: 'RPAS Operator Certificate',
    registrationLabel: 'KCAA Registration Number',
    maxAltitudeFt: 400,
    remoteIdRequired: false,
    currency: 'KES',
    dateFormat: 'dd/MM/yyyy',
    measurementSystem: 'metric',
    mapCenter: [37.9062, 0.0236],
    mapZoom: 6,
    laancEnabled: false,
    helpResources: [
      { label: 'KCAA UAS Guidelines', url: 'https://www.kcaa.or.ke' }
    ]
  },
  ZA: {
    name: 'South Africa',
    authority: 'SACAA (South African Civil Aviation Authority)',
    authorityUrl: 'https://www.caa.co.za',
    authorizationType: 'National Approval',
    certificationName: 'RPA Operators Certificate (ROC)',
    registrationLabel: 'SACAA Registration Number',
    maxAltitudeFt: 400, // Part 101
    remoteIdRequired: false,
    currency: 'ZAR',
    dateFormat: 'dd/MM/yyyy',
    measurementSystem: 'metric',
    mapCenter: [25.0, -29.0],
    mapZoom: 5,
    laancEnabled: false,
    helpResources: [
      { label: 'SACAA RPAS Regulations', url: 'https://www.caa.co.za/Pages/RPAS/Remotely%20Piloted%20Aircraft%20Systems.aspx' }
    ]
  },
  GH: {
    name: 'Ghana',
    authority: 'GCAA (Ghana Civil Aviation Authority)',
    authorizationType: 'National Approval',
    certificationName: 'UAS Operator Permit',
    registrationLabel: 'GCAA Registration Number',
    maxAltitudeFt: 400,
    remoteIdRequired: false,
    mapCenter: [-1.0232, 7.9465],
    mapZoom: 7,
    laancEnabled: false
  },
  RW: {
    name: 'Rwanda',
    authority: 'RCAA (Rwanda Civil Aviation Authority)',
    authorizationType: 'National Approval',
    certificationName: 'RPAS Operator Certificate',
    registrationLabel: 'RCAA Registration Number',
    maxAltitudeFt: 400,
    remoteIdRequired: false,
    mapCenter: [29.8739, -1.9403],
    mapZoom: 8,
    laancEnabled: false,
    notes: 'Rwanda is a global leader in drone delivery (Zipline). Drone corridors are pre-established.'
  },
  TZ: { name: 'Tanzania', authority: 'TCAA', mapCenter: [34.8888, -6.3690], mapZoom: 6 },
  ET: { name: 'Ethiopia', authority: 'ECAA', mapCenter: [40.4897, 9.1450], mapZoom: 5 },
  SN: { name: 'Senegal', authority: 'ANACS', mapCenter: [-14.4524, 14.4974], mapZoom: 7 },
  CI: { name: 'Côte d\'Ivoire', authority: 'ANAC', mapCenter: [-5.5471, 7.5400], mapZoom: 7 },
  UG: { name: 'Uganda', authority: 'UCAA', mapCenter: [32.2903, 1.3733], mapZoom: 7 }
};
```

### Region-Aware UI Adaptations

```
1. Registration form: Show country-specific fields
   - USA: FAA certificate number, TRUST completion
   - Canada: RPAS Basic/Advanced certificate
   - Africa: National license from relevant CAA

2. Airspace map: Auto-center on user's region, load region-specific airspace data

3. Authorization page:
   - USA: "LAANC Authorization" with near-real-time + further coordination
   - Canada: "SFOC Application" with longer review timeline
   - Africa: "Flight Authorization Request" with country-specific process

4. Compliance page:
   - USA: Part 107, Remote ID (Part 89), FAA registration
   - Canada: RPAS regulations (CAR 901), Transport Canada registration
   - Africa: Country-specific regulations, ICAO standards

5. Labels and terminology:
   - USA: "FAA Registration", "Part 107", "LAANC"
   - Canada: "TC Registration", "RPAS Certificate", "SFOC"
   - Africa: "[Authority] Registration", "Operator License", "Flight Permit"

6. Units:
   - USA: feet, mph, miles
   - Canada/Africa: show both metric and imperial (meters/feet toggle)

7. Sidebar badge:
   - USA: "FAA Approved"
   - Canada: "Transport Canada"
   - Africa: "[Country CAA]"
```

---

## BRANDING UPDATES

### Rename from C6macEye → C6mac Sky Warden

```
Changes needed:
1. Logo text: "C6" badge → "SKW" or keep "C6" with "Sky Warden" text
2. Page title: "C6mac Sky Warden"
3. Sidebar header: "Sky Warden" with aviation radar icon
4. Login page branding: "C6mac Sky Warden" + tagline
5. Auth reference codes: SKW-XXXXXXXX-X (already specified above)
6. API key prefix: skw_live_ / skw_test_
7. LocalStorage key: 'skywarden-auth' (update from 'c6maceye-auth')
8. Favicon: Aviation radar or shield icon
9. Meta tags: Update <title> and <meta description>
```

---

## SUPABASE STORAGE SETUP

```
Create buckets:
1. avatars (public)
2. drone-images (private, tenant-isolated)
3. documents (private, tenant-isolated)
4. mission-media (private, tenant-isolated)
```

---

## SEED DATA

Pre-populate the database with realistic demo data for each region:

```
USA Demo:
- 5 sample drones (DJI Mavic 3, Autel EVO II, Skydio 2+, etc.)
- 3 sample missions (mapping, inspection, photography)
- 2 LAANC authorizations (1 approved, 1 pending)
- Airspace zones for: JFK, LAX, ORD, ATL, DFW (Class B)
- 5 TFRs (stadium events, presidential, wildfire, space launch, military)

Canada Demo:
- 3 sample drones
- 2 sample missions
- 1 SFOC application
- Airspace for: YYZ, YVR, YUL (Class C)

Africa Demo (Nigeria):
- 2 sample drones
- 1 mission
- 1 flight permit application
- Airspace for: LOS (Lagos), ABV (Abuja)

Africa Demo (Kenya):
- 2 sample drones
- 1 mission
- Airspace for: NBO (Nairobi JKIA), WIL (Wilson)

Africa Demo (Rwanda):
- 2 sample drones (including Zipline delivery drone)
- 1 mission in drone delivery corridor
- Airspace for: KGL (Kigali)
```

---

## IMPLEMENTATION PRIORITY ORDER

Build in this exact sequence (each phase builds on the previous):

```
Phase 1: Auth + Database (FOUNDATION — nothing works without this)
Phase 2: Fleet CRUD (simplest data flow, validates the Supabase wiring)
Phase 3: Airspace Map (visual wow factor, core value prop)
Phase 4: Missions (depends on fleet + airspace)
Phase 5: Authorization Engine (depends on airspace + missions)
Phase 6: Real-Time (notifications, live tracking)
Phase 7: Persona Dashboards (depends on all above data)
Phase 8: Analytics + Compliance (aggregations over real data)
Phase 9: Settings + Team (supporting features)
Phase 10: Mobile Responsiveness (polish)
Phase 11: Storage + Files (supporting feature)
```

---

## TECHNICAL CONSTRAINTS FOR LOVABLE

```
- Use Supabase client library (supabase-js) — NOT raw fetch to Supabase REST
- Use React Query for ALL server state (already configured)
- Use Zustand ONLY for auth state (already configured)
- Use react-hook-form + zod for ALL forms (already installed)
- Use sonner for ALL toast notifications (already installed)
- Use lucide-react for ALL icons (already installed, do NOT add heroicons or other icon libs)
- Use date-fns for ALL date formatting (already installed)
- Use clsx + tailwind-merge for conditional classes (already installed)
- Use the EXISTING Tailwind v4 design tokens (do not override)
- Use the EXISTING DashboardLayout (do not create a new layout)
- Use the EXISTING React Router setup (add routes to the existing router in App.tsx)
- ALL database operations through Supabase client with RLS (no service_role key on frontend)
- NO server-side rendering — this is a Vite SPA
- Mapbox GL JS for ALL map features (already installed, do NOT use Leaflet or Google Maps)
```

---

## SUCCESS CRITERIA

When complete, a user should be able to:

1. ✅ Register as any of the 4 personas, selecting their country/region
2. ✅ Log in with email/password, optionally with MFA
3. ✅ See a personalized dashboard based on their persona and region
4. ✅ Add drones to their fleet with region-appropriate registration
5. ✅ Open an interactive map showing airspace for their region
6. ✅ Click anywhere on the map to check airspace rules (B4UFLY equivalent)
7. ✅ Create a mission with map-based operation area drawing
8. ✅ Complete a pre-flight checklist
9. ✅ Apply for flight authorization (LAANC/SFOC/National) appropriate to their region
10. ✅ Receive real-time notifications on authorization decisions
11. ✅ Track active missions with live drone position on map
12. ✅ View analytics with real data from their operations
13. ✅ Manage compliance status for their fleet and pilots
14. ✅ (Enterprise) Manage team members with role-based access
15. ✅ (Agency) Publish local drone rules visible to pilots in their jurisdiction
16. ✅ (Developer) Generate API keys and configure webhooks
17. ✅ All data is tenant-isolated — users never see other tenants' data
18. ✅ All write operations create audit log entries
19. ✅ UI adapts labels, terminology, and workflows to the user's region
