
-- C6mac Sky Warden Monetization Engine Schema
-- Adapted for Supabase (Lovable Cloud)

-- ═══════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE public.plan_tier AS ENUM ('free', 'pro', 'enterprise', 'agency', 'developer');
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired');
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'annual');
CREATE TYPE public.payment_method_type AS ENUM ('credit_card', 'bank_transfer', 'mobile_money', 'paypal', 'wire_transfer', 'invoice');
CREATE TYPE public.mobile_money_provider AS ENUM ('mpesa', 'mtn_momo', 'airtel_money', 'orange_money');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'issued', 'paid', 'partially_paid', 'overdue', 'void', 'refunded');
CREATE TYPE public.line_item_category AS ENUM ('subscription', 'registration', 'authorization', 'api_usage', 'addon', 'government_fee', 'penalty');
CREATE TYPE public.revenue_recipient AS ENUM ('platform', 'government');
CREATE TYPE public.registration_status AS ENUM ('pending_payment', 'pending_review', 'active', 'expired', 'suspended', 'revoked', 'transferred');
CREATE TYPE public.registration_type AS ENUM ('standard', 'commercial', 'government', 'educational', 'temporary');
CREATE TYPE public.temporary_permit_type AS ENUM ('tourist', 'researcher', 'temporary_operator', 'event');
CREATE TYPE public.temporary_permit_applicant_type AS ENUM ('tourist', 'researcher', 'commercial_visitor', 'event_organizer', 'ngo', 'media');
CREATE TYPE public.temporary_permit_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'denied', 'active', 'expired', 'revoked');
CREATE TYPE public.usage_metric AS ENUM ('api_calls', 'missions', 'flight_hours', 'authorizations', 'storage_gb', 'drones_registered', 'active_pilots');
CREATE TYPE public.gov_revenue_category AS ENUM ('registration', 'authorization', 'certification', 'penalty', 'exam');
CREATE TYPE public.disbursement_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.disbursement_method AS ENUM ('wire_transfer', 'ach', 'eft', 'mobile_money');

-- ═══════════════════════════════════════════════════════════════
-- PAYMENT METHODS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type public.payment_method_type NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  bank_name TEXT,
  account_last4 TEXT,
  mobile_provider public.mobile_money_provider,
  mobile_number TEXT,
  external_payment_method_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_tenant ON public.payment_methods(tenant_id);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.payment_methods FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_tier public.plan_tier NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  billing_cycle public.billing_cycle NOT NULL DEFAULT 'monthly',
  currency TEXT NOT NULL DEFAULT 'USD',
  monthly_amount INTEGER NOT NULL DEFAULT 0,
  annual_amount INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  next_payment_date TIMESTAMPTZ,
  past_due_amount INTEGER NOT NULL DEFAULT 0,
  external_subscription_id TEXT,
  external_customer_id TEXT,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.subscriptions FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- INVOICES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  invoice_number TEXT NOT NULL UNIQUE,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0,
  government_fees INTEGER NOT NULL DEFAULT 0,
  platform_fees INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  receipt_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.invoices FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- INVOICE LINE ITEMS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category public.line_item_category NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  total_price INTEGER NOT NULL DEFAULT 0,
  taxable BOOLEAN NOT NULL DEFAULT TRUE,
  revenue_recipient public.revenue_recipient NOT NULL DEFAULT 'platform',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_line_items_invoice ON public.invoice_line_items(invoice_id);

ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Through invoice tenant" ON public.invoice_line_items FOR ALL TO authenticated
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE tenant_id = public.get_user_tenant_id()));

-- ═══════════════════════════════════════════════════════════════
-- REGISTRATION FEE SCHEDULES (public read)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.registration_fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region public.region_code NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',
  standard_annual_fee INTEGER NOT NULL DEFAULT 0,
  commercial_annual_fee INTEGER NOT NULL DEFAULT 0,
  government_fee INTEGER NOT NULL DEFAULT 0,
  educational_fee INTEGER NOT NULL DEFAULT 0,
  tourist_7day_fee INTEGER NOT NULL DEFAULT 0,
  researcher_30day_fee INTEGER NOT NULL DEFAULT 0,
  temp_operator_90day_fee INTEGER NOT NULL DEFAULT 0,
  event_per_day_fee INTEGER NOT NULL DEFAULT 0,
  late_fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  transfer_fee INTEGER NOT NULL DEFAULT 0,
  replacement_fee INTEGER NOT NULL DEFAULT 0,
  government_revenue_split NUMERIC(4, 3) NOT NULL DEFAULT 0.725,
  platform_revenue_split NUMERIC(4, 3) NOT NULL DEFAULT 0.275,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.registration_fee_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.registration_fee_schedules FOR SELECT TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════════════
-- DRONE REGISTRATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.drone_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  drone_id UUID NOT NULL REFERENCES public.drones(id),
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id),
  digital_drone_id TEXT UNIQUE,
  registration_number TEXT UNIQUE,
  verification_code TEXT UNIQUE,
  region public.region_code NOT NULL DEFAULT 'US',
  regulatory_authority TEXT NOT NULL DEFAULT 'FAA',
  registration_type public.registration_type NOT NULL DEFAULT 'standard',
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  category TEXT NOT NULL,
  weight_grams INTEGER NOT NULL DEFAULT 0,
  remote_id_serial TEXT,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_address JSONB NOT NULL DEFAULT '{}',
  registration_fee INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  fee_paid_at TIMESTAMPTZ,
  fee_invoice_id UUID REFERENCES public.invoices(id),
  government_portion_fee INTEGER NOT NULL DEFAULT 0,
  platform_portion_fee INTEGER NOT NULL DEFAULT 0,
  status public.registration_status NOT NULL DEFAULT 'pending_payment',
  suspension_reason TEXT,
  previous_registration_id UUID REFERENCES public.drone_registrations(id),
  transferred_from UUID,
  transferred_at TIMESTAMPTZ,
  qr_code_url TEXT,
  certificate_url TEXT,
  publicly_verifiable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_registrations_tenant ON public.drone_registrations(tenant_id);
CREATE INDEX idx_registrations_drone ON public.drone_registrations(drone_id);
CREATE INDEX idx_registrations_status ON public.drone_registrations(status);
CREATE INDEX idx_registrations_digital_id ON public.drone_registrations(digital_drone_id);

ALTER TABLE public.drone_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.drone_registrations FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id())
  WITH CHECK (tenant_id = public.get_user_tenant_id());

-- Public verification policy (anyone can verify by code)
CREATE POLICY "Public verify" ON public.drone_registrations FOR SELECT TO anon
  USING (publicly_verifiable = true AND verification_code IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════
-- TEMPORARY PERMITS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.temporary_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.drone_registrations(id) ON DELETE CASCADE,
  permit_type public.temporary_permit_type NOT NULL,
  applicant_type public.temporary_permit_applicant_type NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  applicant_nationality TEXT,
  passport_number TEXT,
  purpose TEXT NOT NULL,
  operation_description TEXT,
  operation_locations TEXT[] NOT NULL DEFAULT '{}',
  operation_area JSONB,
  duration_days INTEGER NOT NULL,
  max_renewals INTEGER NOT NULL DEFAULT 0,
  renewal_count INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  permit_fee INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  security_deposit INTEGER NOT NULL DEFAULT 0,
  status public.temporary_permit_status NOT NULL DEFAULT 'draft',
  approval_conditions TEXT[] NOT NULL DEFAULT '{}',
  denial_reason TEXT,
  required_documents JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permits_registration ON public.temporary_permits(registration_id);
CREATE INDEX idx_permits_status ON public.temporary_permits(status);

ALTER TABLE public.temporary_permits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Through registration tenant" ON public.temporary_permits FOR ALL TO authenticated
  USING (registration_id IN (SELECT id FROM public.drone_registrations WHERE tenant_id = public.get_user_tenant_id()));

-- ═══════════════════════════════════════════════════════════════
-- USAGE RECORDS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  metric public.usage_metric NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_tenant ON public.usage_records(tenant_id);
CREATE INDEX idx_usage_metric ON public.usage_records(metric, period_start, period_end);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.usage_records FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- GOVERNMENT REVENUE RECORDS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.government_revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region public.region_code NOT NULL,
  regulatory_authority TEXT NOT NULL,
  category public.gov_revenue_category NOT NULL,
  description TEXT,
  gross_amount INTEGER NOT NULL DEFAULT 0,
  platform_commission INTEGER NOT NULL DEFAULT 0,
  government_amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  reference_id UUID,
  reference_type TEXT,
  tenant_id UUID REFERENCES public.tenants(id),
  disbursed BOOLEAN NOT NULL DEFAULT FALSE,
  disbursed_at TIMESTAMPTZ,
  disbursement_reference TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gov_revenue_region ON public.government_revenue_records(region);
CREATE INDEX idx_gov_revenue_tenant ON public.government_revenue_records(tenant_id);

ALTER TABLE public.government_revenue_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant read own" ON public.government_revenue_records FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

-- ═══════════════════════════════════════════════════════════════
-- GOVERNMENT DISBURSEMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.government_disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region public.region_code NOT NULL,
  regulatory_authority TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  record_count INTEGER NOT NULL DEFAULT 0,
  status public.disbursement_status NOT NULL DEFAULT 'pending',
  disbursement_method public.disbursement_method NOT NULL DEFAULT 'wire_transfer',
  reference TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.government_disbursements ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-generate digital_drone_id on registration insert (SKW-{region}-XXXXXX)
CREATE OR REPLACE FUNCTION public.generate_digital_drone_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  IF NEW.registration_number IS NULL THEN
    LOOP
      v_id := 'SKW-' || NEW.region::TEXT || '-' || to_char(NOW(), 'YYYY') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
      SELECT EXISTS(SELECT 1 FROM drone_registrations WHERE registration_number = v_id) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    NEW.registration_number := v_id;
  END IF;

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
$$;

CREATE TRIGGER before_registration_insert
BEFORE INSERT ON public.drone_registrations
FOR EACH ROW EXECUTE FUNCTION public.generate_digital_drone_id();

-- Auto-generate invoice number (SKW-INV-YYYY-NNNNNN)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  IF NEW.invoice_number IS NULL THEN
    v_year := to_char(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(substr(invoice_number, 13) AS INTEGER)), 0) + 1
    INTO v_seq
    FROM invoices
    WHERE invoice_number LIKE 'SKW-INV-' || v_year || '-%';
    NEW.invoice_number := 'SKW-INV-' || v_year || '-' || lpad(v_seq::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_invoice_insert
BEFORE INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA: Registration Fee Schedules
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.registration_fee_schedules (
  region, currency,
  standard_annual_fee, commercial_annual_fee, government_fee, educational_fee,
  tourist_7day_fee, researcher_30day_fee, temp_operator_90day_fee, event_per_day_fee,
  late_fee_percentage, transfer_fee, replacement_fee,
  government_revenue_split, platform_revenue_split,
  effective_date, is_active
) VALUES
  ('US', 'USD', 500, 1500, 0, 250, 2500, 5000, 10000, 1500, 10.00, 500, 1000, 0.725, 0.275, '2026-01-01', TRUE),
  ('CA', 'CAD', 700, 2000, 0, 350, 3000, 6000, 12000, 2000, 10.00, 700, 1200, 0.725, 0.275, '2026-01-01', TRUE),
  ('NG', 'NGN', 1500000, 5000000, 0, 750000, 500000, 1500000, 3000000, 250000, 15.00, 500000, 1000000, 0.700, 0.300, '2026-01-01', TRUE),
  ('KE', 'KES', 500000, 1500000, 0, 250000, 200000, 600000, 1200000, 100000, 12.00, 300000, 500000, 0.700, 0.300, '2026-01-01', TRUE),
  ('ZA', 'ZAR', 100000, 350000, 0, 50000, 50000, 150000, 300000, 25000, 10.00, 75000, 120000, 0.725, 0.275, '2026-01-01', TRUE),
  ('GH', 'GHS', 50000, 150000, 0, 25000, 20000, 60000, 120000, 10000, 12.00, 30000, 50000, 0.700, 0.300, '2026-01-01', TRUE),
  ('RW', 'RWF', 5000000, 15000000, 0, 2500000, 2000000, 6000000, 12000000, 1000000, 10.00, 3000000, 5000000, 0.700, 0.300, '2026-01-01', TRUE);
