-- C6macEye White-Label Engine Schema
-- Migration 003: Custom Branding, Custom Domains & Brand Assets
-- PostgreSQL 16+
-- All tables enforce Row-Level Security (RLS) for tenant isolation
-- Available to Enterprise and Agency tier subscribers

-- ═══════════════════════════════════════════════════════════════
-- ENUM TYPES
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE whitelabel_status AS ENUM (
  'draft', 'pending_verification', 'active', 'suspended', 'expired'
);

CREATE TYPE domain_status AS ENUM (
  'pending_dns', 'verifying', 'active', 'failed', 'expired'
);

CREATE TYPE ssl_status AS ENUM (
  'pending', 'provisioning', 'active', 'expired', 'error'
);

CREATE TYPE brand_asset_type AS ENUM (
  'logo_primary', 'logo_light', 'logo_dark', 'logo_icon', 'logo_wide',
  'logo_seal', 'favicon', 'apple_touch_icon', 'login_background',
  'login_video', 'regulatory_badge', 'national_flag_custom'
);

-- ═══════════════════════════════════════════════════════════════
-- WHITELABEL CONFIGS (Core white-label configuration per tenant)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE whitelabel_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  status whitelabel_status NOT NULL DEFAULT 'draft',

  -- Organization identity
  organization_name VARCHAR(255) NOT NULL,
  organization_short_name VARCHAR(50) NOT NULL,
  tagline VARCHAR(255),
  legal_entity_name VARCHAR(255),

  -- Subdomain: e.g. "acme" → acme.skywarden.app
  subdomain VARCHAR(63) NOT NULL UNIQUE,

  -- JSONB configuration blocks
  branding JSONB NOT NULL DEFAULT '{}',           -- BrandingConfig (logos, colors, typography, login page, dashboard)
  localization JSONB NOT NULL DEFAULT '{}',        -- LocalizationConfig (language, units, dates, country, terminology)
  email_config JSONB NOT NULL DEFAULT '{}',        -- EmailBrandingConfig
  feature_flags JSONB NOT NULL DEFAULT '{}',       -- WhiteLabelFeatureFlags
  legal JSONB NOT NULL DEFAULT '{}',               -- LegalConfig (ToS URL, privacy, copyright)
  analytics_config JSONB,                          -- AnalyticsConfig (GA4, GTM)

  -- Lifecycle timestamps
  activated_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Subdomain format validation
  CONSTRAINT chk_subdomain_format CHECK (
    subdomain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
  ),

  -- Reserved subdomains
  CONSTRAINT chk_subdomain_not_reserved CHECK (
    subdomain NOT IN (
      'www', 'api', 'app', 'admin', 'mail', 'ftp',
      'staging', 'dev', 'test', 'demo', 'billing',
      'support', 'help', 'docs', 'status', 'blog',
      'cdn', 'static', 'assets', 'images', 'media'
    )
  )
);

CREATE INDEX idx_whitelabel_configs_tenant ON whitelabel_configs(tenant_id);
CREATE INDEX idx_whitelabel_configs_subdomain ON whitelabel_configs(subdomain);
CREATE INDEX idx_whitelabel_configs_status ON whitelabel_configs(status);

-- ═══════════════════════════════════════════════════════════════
-- CUSTOM DOMAINS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whitelabel_config_id UUID NOT NULL REFERENCES whitelabel_configs(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  status domain_status NOT NULL DEFAULT 'pending_dns',
  ssl_status ssl_status NOT NULL DEFAULT 'pending',

  -- Domain type
  is_apex_domain BOOLEAN NOT NULL DEFAULT FALSE,

  -- DNS verification records
  verification_record JSONB NOT NULL DEFAULT '{}',  -- { type, name, value, ttl, verified }
  cname_record JSONB NOT NULL DEFAULT '{}',          -- { type, name, value, ttl, verified }
  a_records JSONB,                                   -- For apex domains

  -- Verification state
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- SSL certificate
  ssl_certificate_id VARCHAR(255),
  ssl_expires_at TIMESTAMPTZ,
  auto_renew_ssl BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_custom_domains_whitelabel ON custom_domains(whitelabel_config_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_status ON custom_domains(status);
CREATE INDEX idx_custom_domains_ssl_expires ON custom_domains(ssl_expires_at) WHERE ssl_status = 'active';

-- ═══════════════════════════════════════════════════════════════
-- BRAND ASSETS (Uploaded logos, images, etc.)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whitelabel_config_id UUID NOT NULL REFERENCES whitelabel_configs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  asset_type brand_asset_type NOT NULL,

  -- File metadata
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(1024) NOT NULL,       -- CDN URL
  file_size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,

  -- Image dimensions
  width INTEGER,
  height INTEGER,
  format VARCHAR(10),                    -- svg, png, webp, jpg

  -- Display
  alt_text VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Audit
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brand_assets_whitelabel ON brand_assets(whitelabel_config_id);
CREATE INDEX idx_brand_assets_tenant ON brand_assets(tenant_id);
CREATE INDEX idx_brand_assets_type ON brand_assets(asset_type);
CREATE INDEX idx_brand_assets_active ON brand_assets(whitelabel_config_id, is_active) WHERE is_active = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- WHITELABEL AUDIT LOG (Track all branding changes for compliance)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE whitelabel_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whitelabel_config_id UUID NOT NULL REFERENCES whitelabel_configs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,          -- 'branding.colors.updated', 'domain.verified', 'logo.uploaded', etc.
  changed_by UUID REFERENCES users(id),
  changes JSONB,                         -- { field, old_value, new_value }
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wl_audit_whitelabel ON whitelabel_audit_log(whitelabel_config_id);
CREATE INDEX idx_wl_audit_tenant ON whitelabel_audit_log(tenant_id);
CREATE INDEX idx_wl_audit_action ON whitelabel_audit_log(action);
CREATE INDEX idx_wl_audit_created ON whitelabel_audit_log(created_at DESC);

-- Immutable audit log: block UPDATE and DELETE
CREATE RULE whitelabel_audit_no_update AS ON UPDATE TO whitelabel_audit_log DO INSTEAD NOTHING;
CREATE RULE whitelabel_audit_no_delete AS ON DELETE TO whitelabel_audit_log DO INSTEAD NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- EMAIL DOMAIN VERIFICATIONS (SPF/DKIM for custom email domains)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE email_domain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whitelabel_config_id UUID NOT NULL REFERENCES whitelabel_configs(id) ON DELETE CASCADE,
  email_domain VARCHAR(255) NOT NULL,

  -- DNS records
  dkim_record JSONB,
  spf_record JSONB,

  -- Verification state
  dkim_verified BOOLEAN NOT NULL DEFAULT FALSE,
  spf_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  last_check_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_domain_whitelabel ON email_domain_verifications(whitelabel_config_id);
CREATE INDEX idx_email_domain_domain ON email_domain_verifications(email_domain);

-- ═══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE whitelabel_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelabel_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_domain_verifications ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_isolation_whitelabel_configs ON whitelabel_configs
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Custom domains inherit access through their whitelabel config
CREATE POLICY tenant_isolation_custom_domains ON custom_domains
  USING (whitelabel_config_id IN (
    SELECT id FROM whitelabel_configs WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
  ));

CREATE POLICY tenant_isolation_brand_assets ON brand_assets
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_whitelabel_audit ON whitelabel_audit_log
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Email domain verifications inherit access through their whitelabel config
CREATE POLICY tenant_isolation_email_domains ON email_domain_verifications
  USING (whitelabel_config_id IN (
    SELECT id FROM whitelabel_configs WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
  ));

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Check subdomain availability
CREATE OR REPLACE FUNCTION check_subdomain_available(p_subdomain TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_reserved TEXT[] := ARRAY[
    'www', 'api', 'app', 'admin', 'mail', 'ftp',
    'staging', 'dev', 'test', 'demo', 'billing',
    'support', 'help', 'docs', 'status', 'blog',
    'cdn', 'static', 'assets', 'images', 'media'
  ];
BEGIN
  -- Validate format
  IF p_subdomain !~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$' THEN
    RETURN FALSE;
  END IF;

  -- Check reserved list
  IF p_subdomain = ANY(v_reserved) THEN
    RETURN FALSE;
  END IF;

  -- Check uniqueness
  RETURN NOT EXISTS (
    SELECT 1 FROM whitelabel_configs WHERE subdomain = p_subdomain
  );
END;
$$ LANGUAGE plpgsql;

-- Placeholder: verify domain DNS records
-- In production this would be called by a background worker that performs actual DNS lookups
CREATE OR REPLACE FUNCTION verify_domain_dns(p_domain_id UUID)
RETURNS VOID AS $$
DECLARE
  v_domain RECORD;
BEGIN
  SELECT * INTO v_domain FROM custom_domains WHERE id = p_domain_id;

  IF v_domain IS NULL THEN
    RAISE EXCEPTION 'Domain not found: %', p_domain_id;
  END IF;

  -- Placeholder: actual DNS verification would happen in application layer
  -- This function updates the status based on external verification results
  UPDATE custom_domains
  SET
    status = 'verifying',
    updated_at = NOW()
  WHERE id = p_domain_id;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to new tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'whitelabel_configs', 'custom_domains'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;
