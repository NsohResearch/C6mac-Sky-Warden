-- C6macEye Monetization Engine Schema
-- Migration 002: Subscriptions, Payments, Drone Registration & Government Revenue
-- PostgreSQL 16+ with PostGIS
-- All tables enforce Row-Level Security (RLS) for tenant isolation
-- All monetary values in smallest currency unit (cents/kobo/senti)

-- ═══════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE plan_tier AS ENUM ('free', 'pro', 'enterprise', 'agency', 'developer');

CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired'
);

CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual');

CREATE TYPE payment_method_type AS ENUM (
  'credit_card', 'bank_transfer', 'mobile_money', 'paypal', 'wire_transfer', 'invoice'
);

CREATE TYPE mobile_money_provider AS ENUM (
  'mpesa', 'mtn_momo', 'airtel_money', 'orange_money'
);

CREATE TYPE invoice_status AS ENUM (
  'draft', 'issued', 'paid', 'partially_paid', 'overdue', 'void', 'refunded'
);

CREATE TYPE line_item_category AS ENUM (
  'subscription', 'registration', 'authorization', 'api_usage',
  'addon', 'government_fee', 'penalty'
);

CREATE TYPE revenue_recipient AS ENUM ('platform', 'government');

CREATE TYPE registration_status AS ENUM (
  'pending_payment', 'pending_review', 'active', 'expired',
  'suspended', 'revoked', 'transferred'
);

CREATE TYPE registration_type AS ENUM (
  'standard', 'commercial', 'government', 'educational', 'temporary'
);

CREATE TYPE temporary_permit_type AS ENUM (
  'tourist', 'researcher', 'temporary_operator', 'event'
);

CREATE TYPE temporary_permit_applicant_type AS ENUM (
  'tourist', 'researcher', 'commercial_visitor', 'event_organizer', 'ngo', 'media'
);

CREATE TYPE temporary_permit_status AS ENUM (
  'draft', 'submitted', 'under_review', 'approved', 'denied',
  'active', 'expired', 'revoked'
);

CREATE TYPE usage_metric AS ENUM (
  'api_calls', 'missions', 'flight_hours', 'authorizations',
  'storage_gb', 'drones_registered', 'active_pilots'
);

CREATE TYPE gov_revenue_category AS ENUM (
  'registration', 'authorization', 'certification', 'penalty', 'exam'
);

CREATE TYPE disbursement_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TYPE disbursement_method AS ENUM ('wire_transfer', 'ach', 'eft', 'mobile_money');

-- Region code for multi-country support (if not already created)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'region_code') THEN
    CREATE TYPE region_code AS ENUM (
      'US', 'CA', 'NG', 'KE', 'ZA', 'GH', 'RW', 'TZ', 'ET', 'SN', 'CI', 'UG'
    );
  END IF;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- PAYMENT METHODS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type payment_method_type NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,

  -- Credit card details
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Bank transfer details
  bank_name TEXT,
  account_last4 TEXT,

  -- Mobile money details
  mobile_provider mobile_money_provider,
  mobile_number TEXT,

  -- External reference
  external_payment_method_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_tenant ON payment_methods(tenant_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(tenant_id, is_default) WHERE is_default = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_tier plan_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'trialing',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',

  -- Pricing (smallest currency unit)
  currency TEXT NOT NULL DEFAULT 'USD',
  monthly_amount INTEGER NOT NULL DEFAULT 0,
  annual_amount INTEGER NOT NULL DEFAULT 0,

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Payment
  payment_method_id UUID REFERENCES payment_methods(id),
  next_payment_date TIMESTAMPTZ,
  past_due_amount INTEGER NOT NULL DEFAULT 0,

  -- Stripe integration
  external_subscription_id TEXT,
  external_customer_id TEXT,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_tier);
CREATE INDEX idx_subscriptions_external ON subscriptions(external_subscription_id);
CREATE INDEX idx_subscriptions_next_payment ON subscriptions(next_payment_date) WHERE status = 'active';

-- ═══════════════════════════════════════════════════════════════
-- INVOICES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_number TEXT NOT NULL UNIQUE,

  status invoice_status NOT NULL DEFAULT 'draft',

  -- Amounts (smallest currency unit)
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0,
  government_fees INTEGER NOT NULL DEFAULT 0,
  platform_fees INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,

  -- Dates
  issued_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Payment info
  payment_method TEXT,
  payment_reference TEXT,
  receipt_url TEXT,
  pdf_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due ON invoices(due_date) WHERE status IN ('issued', 'overdue');

-- ═══════════════════════════════════════════════════════════════
-- INVOICE LINE ITEMS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category line_item_category NOT NULL,

  -- Pricing (smallest currency unit)
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,
  taxable BOOLEAN NOT NULL DEFAULT TRUE,

  -- Revenue routing
  revenue_recipient revenue_recipient NOT NULL DEFAULT 'platform',
  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_line_items_category ON invoice_line_items(category);

-- ═══════════════════════════════════════════════════════════════
-- REGISTRATION FEE SCHEDULES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE registration_fee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region region_code NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Annual fees (smallest currency unit)
  standard_annual_fee INTEGER NOT NULL DEFAULT 0,
  commercial_annual_fee INTEGER NOT NULL DEFAULT 0,
  government_fee INTEGER NOT NULL DEFAULT 0,
  educational_fee INTEGER NOT NULL DEFAULT 0,

  -- Temporary permit fees
  tourist_7day_fee INTEGER NOT NULL DEFAULT 0,
  researcher_30day_fee INTEGER NOT NULL DEFAULT 0,
  temp_operator_90day_fee INTEGER NOT NULL DEFAULT 0,
  event_per_day_fee INTEGER NOT NULL DEFAULT 0,

  -- Additional fees
  late_fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  transfer_fee INTEGER NOT NULL DEFAULT 0,
  replacement_fee INTEGER NOT NULL DEFAULT 0,

  -- Revenue split (must sum to 1.0)
  government_revenue_split NUMERIC(4, 3) NOT NULL DEFAULT 0.725,
  platform_revenue_split NUMERIC(4, 3) NOT NULL DEFAULT 0.275,

  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_revenue_split CHECK (government_revenue_split + platform_revenue_split = 1.0)
);

-- ═══════════════════════════════════════════════════════════════
-- DRONE REGISTRATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE drone_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  drone_id UUID NOT NULL REFERENCES drones(id),
  owner_id UUID NOT NULL REFERENCES users(id),

  -- Unique identifiers
  digital_drone_id TEXT UNIQUE,
  registration_number TEXT UNIQUE,
  verification_code TEXT UNIQUE,

  -- Region & authority
  region region_code NOT NULL DEFAULT 'US',
  country TEXT NOT NULL DEFAULT 'US',
  regulatory_authority TEXT NOT NULL DEFAULT 'FAA',

  -- Registration type
  registration_type registration_type NOT NULL DEFAULT 'standard',
  temporary_permit_type temporary_permit_type,

  -- Validity
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  renewal_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,

  -- Drone details snapshot (frozen at registration time)
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  category drone_category NOT NULL,
  weight_grams INTEGER NOT NULL,
  remote_id_serial TEXT,

  -- Owner details snapshot
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_address JSONB NOT NULL DEFAULT '{}',
  owner_id_type TEXT,
  owner_id_number TEXT,

  -- Fees (smallest currency unit)
  registration_fee INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  fee_paid_at TIMESTAMPTZ,
  fee_invoice_id UUID REFERENCES invoices(id),
  government_portion_fee INTEGER NOT NULL DEFAULT 0,
  platform_portion_fee INTEGER NOT NULL DEFAULT 0,

  -- Status
  status registration_status NOT NULL DEFAULT 'pending_payment',
  suspension_reason TEXT,
  revocation_reason TEXT,

  -- Transfer tracking
  previous_registration_id UUID REFERENCES drone_registrations(id),
  transferred_from UUID,
  transferred_at TIMESTAMPTZ,

  -- Documents & verification
  qr_code_url TEXT,
  certificate_url TEXT,
  publicly_verifiable BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_tenant ON drone_registrations(tenant_id);
CREATE INDEX idx_registrations_drone ON drone_registrations(drone_id);
CREATE INDEX idx_registrations_owner ON drone_registrations(owner_id);
CREATE INDEX idx_registrations_digital_id ON drone_registrations(digital_drone_id);
CREATE INDEX idx_registrations_number ON drone_registrations(registration_number);
CREATE INDEX idx_registrations_status ON drone_registrations(status);
CREATE INDEX idx_registrations_region ON drone_registrations(region);
CREATE INDEX idx_registrations_expires ON drone_registrations(expires_at) WHERE status = 'active';
CREATE INDEX idx_registrations_verification ON drone_registrations(verification_code);

-- ═══════════════════════════════════════════════════════════════
-- TEMPORARY PERMITS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE temporary_permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES drone_registrations(id) ON DELETE CASCADE,

  -- Permit type
  permit_type temporary_permit_type NOT NULL,
  applicant_type temporary_permit_applicant_type NOT NULL,

  -- Applicant info
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  applicant_nationality TEXT,
  passport_number TEXT,
  visa_number TEXT,
  local_contact_name TEXT,
  local_contact_phone TEXT,

  -- Operation details
  purpose TEXT NOT NULL,
  operation_description TEXT,
  operation_locations TEXT[] NOT NULL DEFAULT '{}',
  operation_area JSONB,

  -- Duration
  duration_days INTEGER NOT NULL,
  max_renewals INTEGER NOT NULL DEFAULT 0,
  renewal_count INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Associated registrations
  drone_registration_ids UUID[] NOT NULL DEFAULT '{}',

  -- Fees (smallest currency unit)
  permit_fee INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  security_deposit INTEGER NOT NULL DEFAULT 0,
  deposit_refunded BOOLEAN NOT NULL DEFAULT FALSE,

  -- Status & review
  status temporary_permit_status NOT NULL DEFAULT 'draft',
  reviewed_by UUID REFERENCES users(id),
  approval_conditions TEXT[] NOT NULL DEFAULT '{}',
  denial_reason TEXT,
  required_documents JSONB NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permits_registration ON temporary_permits(registration_id);
CREATE INDEX idx_permits_status ON temporary_permits(status);
CREATE INDEX idx_permits_dates ON temporary_permits(start_date, end_date);
CREATE INDEX idx_permits_type ON temporary_permits(permit_type);

-- ═══════════════════════════════════════════════════════════════
-- USAGE RECORDS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),

  metric usage_metric NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,

  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_tenant ON usage_records(tenant_id);
CREATE INDEX idx_usage_subscription ON usage_records(subscription_id);
CREATE INDEX idx_usage_metric ON usage_records(metric, period_start, period_end);
CREATE INDEX idx_usage_period ON usage_records(period_start, period_end);

-- ═══════════════════════════════════════════════════════════════
-- GOVERNMENT REVENUE RECORDS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE government_revenue_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  region region_code NOT NULL,
  regulatory_authority TEXT NOT NULL,
  category gov_revenue_category NOT NULL,
  description TEXT,

  -- Amounts (smallest currency unit)
  gross_amount INTEGER NOT NULL DEFAULT 0,
  platform_commission INTEGER NOT NULL DEFAULT 0,
  government_amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Reference
  reference_id UUID,
  reference_type TEXT,
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),

  -- Disbursement tracking
  disbursed BOOLEAN NOT NULL DEFAULT FALSE,
  disbursed_at TIMESTAMPTZ,
  disbursement_reference TEXT,

  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gov_revenue_region ON government_revenue_records(region);
CREATE INDEX idx_gov_revenue_authority ON government_revenue_records(regulatory_authority);
CREATE INDEX idx_gov_revenue_category ON government_revenue_records(category);
CREATE INDEX idx_gov_revenue_tenant ON government_revenue_records(tenant_id);
CREATE INDEX idx_gov_revenue_disbursed ON government_revenue_records(disbursed) WHERE disbursed = FALSE;
CREATE INDEX idx_gov_revenue_period ON government_revenue_records(period_start, period_end);

-- ═══════════════════════════════════════════════════════════════
-- GOVERNMENT DISBURSEMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE government_disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  region region_code NOT NULL,
  regulatory_authority TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Amounts (smallest currency unit)
  total_amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  record_count INTEGER NOT NULL DEFAULT 0,

  -- Status
  status disbursement_status NOT NULL DEFAULT 'pending',
  disbursement_method disbursement_method NOT NULL DEFAULT 'wire_transfer',
  reference TEXT,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disbursements_region ON government_disbursements(region);
CREATE INDEX idx_disbursements_status ON government_disbursements(status);
CREATE INDEX idx_disbursements_period ON government_disbursements(period_start, period_end);

-- ═══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_revenue_records ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_payment_methods ON payment_methods
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_subscriptions ON subscriptions
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_invoices ON invoices
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Line items inherit access through their invoice
CREATE POLICY tenant_isolation_line_items ON invoice_line_items
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
  ));

CREATE POLICY tenant_isolation_registrations ON drone_registrations
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Temporary permits inherit access through their registration
CREATE POLICY tenant_isolation_permits ON temporary_permits
  USING (registration_id IN (
    SELECT id FROM drone_registrations WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
  ));

CREATE POLICY tenant_isolation_usage ON usage_records
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Government revenue records: viewable by the originating tenant
CREATE POLICY tenant_isolation_gov_revenue ON government_revenue_records
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Registration fee schedules are public (read by all, managed by admins)
-- No RLS needed — these are global configuration

-- Government disbursements are admin-only, no tenant RLS
-- Managed by platform super_admin

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-generate digital_drone_id on registration insert
-- Format: SKW-{region}-XXXXXX (6-char alphanumeric)
CREATE OR REPLACE FUNCTION generate_digital_drone_id()
RETURNS TRIGGER AS $$
DECLARE
  v_id TEXT;
  v_exists BOOLEAN;
BEGIN
  IF NEW.digital_drone_id IS NULL THEN
    LOOP
      v_id := 'SKW-' || NEW.region::TEXT || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
      SELECT EXISTS(SELECT 1 FROM drone_registrations WHERE digital_drone_id = v_id) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.digital_drone_id := v_id;
  END IF;

  -- Also generate registration_number if null
  -- Format: SKW-{region}-YYYY-XXXXXX
  IF NEW.registration_number IS NULL THEN
    LOOP
      v_id := 'SKW-' || NEW.region::TEXT || '-' || to_char(NOW(), 'YYYY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
      SELECT EXISTS(SELECT 1 FROM drone_registrations WHERE registration_number = v_id) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.registration_number := v_id;
  END IF;

  -- Also generate verification_code if null
  -- Format: V-XXXXXX
  IF NEW.verification_code IS NULL THEN
    LOOP
      v_id := 'V-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
      SELECT EXISTS(SELECT 1 FROM drone_registrations WHERE verification_code = v_id) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.verification_code := v_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_registration_insert
BEFORE INSERT ON drone_registrations
FOR EACH ROW EXECUTE FUNCTION generate_digital_drone_id();

-- Generate sequential invoice numbers
-- Format: SKW-INV-YYYY-NNNNNN
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  IF NEW.invoice_number IS NULL THEN
    v_year := to_char(NOW(), 'YYYY');
    SELECT COALESCE(MAX(
      CAST(substr(invoice_number, 13) AS INTEGER)
    ), 0) + 1
    INTO v_seq
    FROM invoices
    WHERE invoice_number LIKE 'SKW-INV-' || v_year || '-%';

    NEW.invoice_number := 'SKW-INV-' || v_year || '-' || lpad(v_seq::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_invoice_insert
BEFORE INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Expire registrations that have passed their expiry date
CREATE OR REPLACE FUNCTION expire_stale_registrations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE drone_registrations
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Expire temporary permits that have passed their end date
CREATE OR REPLACE FUNCTION expire_stale_permits()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE temporary_permits
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND end_date < CURRENT_DATE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'payment_methods', 'subscriptions', 'invoices',
      'drone_registrations', 'temporary_permits',
      'government_disbursements', 'registration_fee_schedules'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA: Registration Fee Schedules
-- ═══════════════════════════════════════════════════════════════

INSERT INTO registration_fee_schedules (
  region, currency,
  standard_annual_fee, commercial_annual_fee, government_fee, educational_fee,
  tourist_7day_fee, researcher_30day_fee, temp_operator_90day_fee, event_per_day_fee,
  late_fee_percentage, transfer_fee, replacement_fee,
  government_revenue_split, platform_revenue_split,
  effective_date, is_active
) VALUES
  -- United States (USD, cents)
  ('US', 'USD',
   500, 1500, 0, 250,
   2500, 5000, 10000, 1500,
   10.00, 500, 1000,
   0.725, 0.275,
   '2026-01-01', TRUE),

  -- Canada (CAD, cents)
  ('CA', 'CAD',
   700, 2000, 0, 350,
   3000, 6000, 12000, 2000,
   10.00, 700, 1200,
   0.725, 0.275,
   '2026-01-01', TRUE),

  -- Nigeria (NGN, kobo)
  ('NG', 'NGN',
   1500000, 5000000, 0, 750000,
   500000, 1500000, 3000000, 250000,
   15.00, 500000, 1000000,
   0.700, 0.300,
   '2026-01-01', TRUE),

  -- Kenya (KES, cents/senti)
  ('KE', 'KES',
   500000, 1500000, 0, 250000,
   200000, 600000, 1200000, 100000,
   12.00, 300000, 500000,
   0.700, 0.300,
   '2026-01-01', TRUE),

  -- South Africa (ZAR, cents)
  ('ZA', 'ZAR',
   100000, 350000, 0, 50000,
   50000, 150000, 300000, 25000,
   10.00, 75000, 120000,
   0.725, 0.275,
   '2026-01-01', TRUE),

  -- Ghana (GHS, pesewas)
  ('GH', 'GHS',
   50000, 150000, 0, 25000,
   20000, 60000, 120000, 10000,
   12.00, 30000, 50000,
   0.700, 0.300,
   '2026-01-01', TRUE),

  -- Rwanda (RWF, centimes)
  ('RW', 'RWF',
   5000000, 15000000, 0, 2500000,
   2000000, 6000000, 12000000, 1000000,
   10.00, 3000000, 5000000,
   0.700, 0.300,
   '2026-01-01', TRUE);
