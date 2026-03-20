import { queryWithTenant, query, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import type { UUID } from '../../../../shared/types/common.js';
import crypto from 'node:crypto';

// ─── Types ───

export interface ColorPalette {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  background: string;
  surface: string;
  surfaceHover: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseFontSize: string;
  headingWeight: string;
  bodyWeight: string;
  lineHeight: string;
}

export interface LoginPageConfig {
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImageUrl?: string;
  logoPosition: 'center' | 'left' | 'right';
  showTagline: boolean;
  tagline?: string;
  showPoweredBy: boolean;
  customCss?: string;
}

export interface LocalizationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  dateFormat: string;
  timeFormat: '12h' | '24h';
  timezone: string;
  unitSystem: 'imperial' | 'metric';
  distanceUnit: 'feet' | 'meters';
  altitudeUnit: 'feet' | 'meters';
  speedUnit: 'mph' | 'kph' | 'knots';
  temperatureUnit: 'fahrenheit' | 'celsius';
  terminology: Record<string, string>;
}

export interface BrandingConfig {
  orgName: string;
  orgLegalName?: string;
  tagline?: string;
  supportEmail?: string;
  supportUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  colors: ColorPalette;
  typography: TypographyConfig;
  loginPage: LoginPageConfig;
  localization: LocalizationConfig;
  logoUrl?: string;
  logoIconUrl?: string;
  faviconUrl?: string;
}

export type BrandingPreset = 'default' | 'aviation-dark' | 'aviation-light' | 'government' | 'enterprise-blue' | 'enterprise-dark';

export interface WhiteLabelConfig {
  id: string;
  tenantId: string;
  subdomain: string;
  status: 'draft' | 'active' | 'suspended';
  branding: BrandingConfig;
  preset: BrandingPreset;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomDomain {
  id: string;
  tenantId: string;
  domain: string;
  status: 'pending_dns' | 'verifying' | 'active' | 'failed';
  dnsRecords: DnsRecord[];
  sslStatus: 'pending' | 'provisioning' | 'active' | 'failed';
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DnsRecord {
  type: 'TXT' | 'CNAME' | 'A';
  name: string;
  value: string;
}

export interface BrandAsset {
  id: string;
  tenantId: string;
  assetType: 'logo' | 'logo_icon' | 'favicon' | 'login_background' | 'email_header' | 'email_footer';
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  isActive: boolean;
  createdAt: string;
}

export interface WhiteLabelAuditEntry {
  id: string;
  tenantId: string;
  action: string;
  changedBy?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  createdAt: string;
}

interface AssetUploadMetadata {
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
}

// ─── Preset Definitions ───

const BRANDING_PRESETS: Record<BrandingPreset, { colors: ColorPalette; typography: TypographyConfig }> = {
  default: {
    colors: {
      primary: '#1E40AF',
      primaryHover: '#1E3A8A',
      secondary: '#7C3AED',
      secondaryHover: '#6D28D9',
      accent: '#F59E0B',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceHover: '#F1F5F9',
      text: '#0F172A',
      textSecondary: '#64748B',
      textInverse: '#FFFFFF',
      border: '#E2E8F0',
      error: '#DC2626',
      warning: '#F59E0B',
      success: '#16A34A',
      info: '#2563EB',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      baseFontSize: '16px',
      headingWeight: '700',
      bodyWeight: '400',
      lineHeight: '1.5',
    },
  },
  'aviation-dark': {
    colors: {
      primary: '#00D4FF',
      primaryHover: '#00B8E6',
      secondary: '#8B5CF6',
      secondaryHover: '#7C3AED',
      accent: '#F59E0B',
      background: '#0B1120',
      surface: '#1E293B',
      surfaceHover: '#334155',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      textInverse: '#0F172A',
      border: '#334155',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#22C55E',
      info: '#3B82F6',
    },
    typography: {
      headingFont: 'Orbitron',
      bodyFont: 'Exo 2',
      monoFont: 'JetBrains Mono',
      baseFontSize: '15px',
      headingWeight: '700',
      bodyWeight: '400',
      lineHeight: '1.6',
    },
  },
  'aviation-light': {
    colors: {
      primary: '#0369A1',
      primaryHover: '#075985',
      secondary: '#0891B2',
      secondaryHover: '#0E7490',
      accent: '#EA580C',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      surfaceHover: '#E0F2FE',
      text: '#0C4A6E',
      textSecondary: '#64748B',
      textInverse: '#FFFFFF',
      border: '#BAE6FD',
      error: '#DC2626',
      warning: '#D97706',
      success: '#15803D',
      info: '#0284C7',
    },
    typography: {
      headingFont: 'Exo 2',
      bodyFont: 'Inter',
      monoFont: 'Fira Code',
      baseFontSize: '16px',
      headingWeight: '600',
      bodyWeight: '400',
      lineHeight: '1.5',
    },
  },
  government: {
    colors: {
      primary: '#1B3A5C',
      primaryHover: '#15304D',
      secondary: '#2E5E8E',
      secondaryHover: '#254E78',
      accent: '#B91C1C',
      background: '#F5F5F4',
      surface: '#FFFFFF',
      surfaceHover: '#FAFAF9',
      text: '#1C1917',
      textSecondary: '#57534E',
      textInverse: '#FFFFFF',
      border: '#D6D3D1',
      error: '#B91C1C',
      warning: '#B45309',
      success: '#15803D',
      info: '#1D4ED8',
    },
    typography: {
      headingFont: 'Source Sans Pro',
      bodyFont: 'Source Sans Pro',
      monoFont: 'Source Code Pro',
      baseFontSize: '16px',
      headingWeight: '700',
      bodyWeight: '400',
      lineHeight: '1.6',
    },
  },
  'enterprise-blue': {
    colors: {
      primary: '#1D4ED8',
      primaryHover: '#1E40AF',
      secondary: '#4F46E5',
      secondaryHover: '#4338CA',
      accent: '#0891B2',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceHover: '#F1F5F9',
      text: '#1E293B',
      textSecondary: '#64748B',
      textInverse: '#FFFFFF',
      border: '#CBD5E1',
      error: '#DC2626',
      warning: '#D97706',
      success: '#059669',
      info: '#2563EB',
    },
    typography: {
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      baseFontSize: '16px',
      headingWeight: '700',
      bodyWeight: '400',
      lineHeight: '1.5',
    },
  },
  'enterprise-dark': {
    colors: {
      primary: '#6366F1',
      primaryHover: '#4F46E5',
      secondary: '#8B5CF6',
      secondaryHover: '#7C3AED',
      accent: '#06B6D4',
      background: '#09090B',
      surface: '#18181B',
      surfaceHover: '#27272A',
      text: '#FAFAFA',
      textSecondary: '#A1A1AA',
      textInverse: '#09090B',
      border: '#3F3F46',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#22C55E',
      info: '#3B82F6',
    },
    typography: {
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      monoFont: 'JetBrains Mono',
      baseFontSize: '15px',
      headingWeight: '700',
      bodyWeight: '400',
      lineHeight: '1.6',
    },
  },
};

const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'app', 'admin', 'mail', 'smtp', 'ftp', 'ssh', 'git',
  'cdn', 'static', 'assets', 'media', 'docs', 'help', 'support', 'status',
  'blog', 'dev', 'staging', 'test', 'demo', 'sandbox', 'beta', 'alpha',
  'edge', 'node', 'proxy', 'gateway', 'auth', 'login', 'register', 'signup',
  'skywarden', 'c6mac', 'c6maceye', 'dashboard', 'console', 'portal',
]);

const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

// ─── Service ───

export class WhiteLabelService {
  private readonly log = logger.child({ service: 'WhiteLabelService' });

  /**
   * Create a new white-label config for a tenant.
   * Requires Enterprise or Agency subscription.
   */
  async createConfig(
    tenantId: UUID,
    input: { orgName: string; subdomain: string; preset?: BrandingPreset }
  ): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId, subdomain: input.subdomain }, 'Creating white-label config');

    // Verify tenant has Enterprise or Agency subscription
    const subResult = await queryWithTenant<{ plan_tier: string }>(
      tenantId,
      `SELECT plan_tier FROM subscriptions
       WHERE tenant_id = $1
         AND status IN ('active', 'trialing')
       ORDER BY created_at DESC
       LIMIT 1`,
      [tenantId]
    );

    if (subResult.rows.length === 0) {
      throw new ForbiddenError('No active subscription found. White-label requires an Enterprise or Agency plan.');
    }

    const planTier = subResult.rows[0].plan_tier;
    if (!['enterprise', 'agency'].includes(planTier)) {
      throw new ForbiddenError(`White-label is only available on Enterprise or Agency plans. Current plan: ${planTier}`);
    }

    // Check for existing config
    const existingResult = await queryWithTenant<{ id: string }>(
      tenantId,
      `SELECT id FROM whitelabel_configs WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );

    if (existingResult.rows.length > 0) {
      throw new ConflictError('Tenant already has a white-label configuration');
    }

    // Validate subdomain
    await this.validateSubdomain(input.subdomain);

    // Build default branding from preset
    const preset = input.preset ?? 'default';
    const presetData = BRANDING_PRESETS[preset];
    if (!presetData) {
      throw new ValidationError(`Invalid branding preset: ${preset}`);
    }

    const branding: BrandingConfig = {
      orgName: input.orgName,
      colors: { ...presetData.colors },
      typography: { ...presetData.typography },
      loginPage: {
        backgroundType: 'color',
        backgroundColor: presetData.colors.background,
        logoPosition: 'center',
        showTagline: true,
        showPoweredBy: true,
      },
      localization: {
        defaultLocale: 'en-US',
        supportedLocales: ['en-US'],
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'America/New_York',
        unitSystem: 'imperial',
        distanceUnit: 'feet',
        altitudeUnit: 'feet',
        speedUnit: 'mph',
        temperatureUnit: 'fahrenheit',
        terminology: {},
      },
    };

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `INSERT INTO whitelabel_configs (
        tenant_id, subdomain, status, branding, preset
      ) VALUES (
        $1, $2, 'draft', $3, $4
      )
      RETURNING *`,
      [tenantId, input.subdomain, JSON.stringify(branding), preset]
    );

    // Log to audit
    await this.logAudit(tenantId, 'config_created', undefined, undefined, {
      subdomain: input.subdomain,
      preset,
      orgName: input.orgName,
    });

    this.log.info({ tenantId, configId: result.rows[0].id }, 'White-label config created');
    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Get tenant's white-label config with custom domains and brand assets.
   */
  async getConfig(tenantId: UUID): Promise<WhiteLabelConfig & { customDomains: CustomDomain[]; brandAssets: BrandAsset[] }> {
    const configResult = await queryWithTenant<Record<string, any>>(
      tenantId,
      `SELECT * FROM whitelabel_configs WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );

    if (configResult.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    const config = this.mapConfigRow(configResult.rows[0]);

    const domainsResult = await queryWithTenant<Record<string, any>>(
      tenantId,
      `SELECT * FROM custom_domains WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    );

    const assetsResult = await queryWithTenant<Record<string, any>>(
      tenantId,
      `SELECT * FROM brand_assets WHERE tenant_id = $1 AND is_active = true ORDER BY created_at DESC`,
      [tenantId]
    );

    return {
      ...config,
      customDomains: domainsResult.rows.map(this.mapDomainRow),
      brandAssets: assetsResult.rows.map(this.mapAssetRow),
    };
  }

  /**
   * Update branding JSONB with deep merge.
   */
  async updateBranding(tenantId: UUID, brandingUpdate: Partial<BrandingConfig>): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId }, 'Updating branding config');

    const existing = await this.getConfigInternal(tenantId);
    const oldBranding = existing.branding;

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET branding = branding || $1::jsonb,
           updated_at = NOW()
       WHERE tenant_id = $2
       RETURNING *`,
      [JSON.stringify(brandingUpdate), tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'branding_updated', undefined, oldBranding, brandingUpdate);

    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Update just the color palette.
   */
  async updateColors(tenantId: UUID, colors: Partial<ColorPalette>): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId }, 'Updating color palette');

    const existing = await this.getConfigInternal(tenantId);
    const oldColors = existing.branding.colors;

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET branding = jsonb_set(branding, '{colors}', (branding->'colors') || $1::jsonb),
           updated_at = NOW()
       WHERE tenant_id = $2
       RETURNING *`,
      [JSON.stringify(colors), tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'colors_updated', undefined, { colors: oldColors }, { colors });

    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Update typography config.
   */
  async updateTypography(tenantId: UUID, typography: Partial<TypographyConfig>): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId }, 'Updating typography');

    const existing = await this.getConfigInternal(tenantId);
    const oldTypography = existing.branding.typography;

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET branding = jsonb_set(branding, '{typography}', (branding->'typography') || $1::jsonb),
           updated_at = NOW()
       WHERE tenant_id = $2
       RETURNING *`,
      [JSON.stringify(typography), tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'typography_updated', undefined, { typography: oldTypography }, { typography });

    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Update login page branding.
   */
  async updateLoginPage(tenantId: UUID, loginConfig: Partial<LoginPageConfig>): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId }, 'Updating login page config');

    const existing = await this.getConfigInternal(tenantId);
    const oldLogin = existing.branding.loginPage;

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET branding = jsonb_set(branding, '{loginPage}', (branding->'loginPage') || $1::jsonb),
           updated_at = NOW()
       WHERE tenant_id = $2
       RETURNING *`,
      [JSON.stringify(loginConfig), tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'login_page_updated', undefined, { loginPage: oldLogin }, { loginPage: loginConfig });

    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Update localization settings.
   */
  async updateLocalization(tenantId: UUID, localization: Partial<LocalizationConfig>): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId }, 'Updating localization config');

    const existing = await this.getConfigInternal(tenantId);
    const oldLocalization = existing.branding.localization;

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET branding = jsonb_set(branding, '{localization}', (branding->'localization') || $1::jsonb),
           updated_at = NOW()
       WHERE tenant_id = $2
       RETURNING *`,
      [JSON.stringify(localization), tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'localization_updated', undefined, { localization: oldLocalization }, { localization });

    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Apply a branding preset, overwriting colors and typography.
   */
  async applyPreset(tenantId: UUID, preset: BrandingPreset): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId, preset }, 'Applying branding preset');

    const presetData = BRANDING_PRESETS[preset];
    if (!presetData) {
      throw new ValidationError(`Invalid branding preset: ${preset}`);
    }

    const existing = await this.getConfigInternal(tenantId);
    const oldPreset = existing.preset;

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET branding = jsonb_set(
             jsonb_set(branding, '{colors}', $1::jsonb),
             '{typography}', $2::jsonb
           ),
           preset = $3,
           updated_at = NOW()
       WHERE tenant_id = $4
       RETURNING *`,
      [JSON.stringify(presetData.colors), JSON.stringify(presetData.typography), preset, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'preset_applied', undefined, { preset: oldPreset }, { preset });

    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Add a custom domain with DNS verification records.
   */
  async addCustomDomain(tenantId: UUID, domain: string): Promise<CustomDomain> {
    this.log.info({ tenantId, domain }, 'Adding custom domain');

    // Validate config exists
    await this.getConfigInternal(tenantId);

    // Normalize domain
    const normalizedDomain = domain.toLowerCase().trim();

    // Check domain not already taken
    const existingDomain = await query<{ id: string }>(
      `SELECT id FROM custom_domains WHERE domain = $1 AND status != 'failed'`,
      [normalizedDomain]
    );

    if (existingDomain.rows.length > 0) {
      throw new ConflictError(`Domain '${normalizedDomain}' is already registered`);
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(16).toString('hex');

    // Build DNS records
    const dnsRecords: DnsRecord[] = [
      {
        type: 'TXT',
        name: `_skywarden-verify.${normalizedDomain}`,
        value: `skywarden-verify=${verificationToken}`,
      },
      {
        type: 'CNAME',
        name: normalizedDomain,
        value: 'edge.skywarden.app',
      },
    ];

    // If apex domain (no dots in the part before TLD), add A records
    const domainParts = normalizedDomain.split('.');
    if (domainParts.length === 2) {
      dnsRecords.push(
        { type: 'A', name: normalizedDomain, value: '76.76.21.21' },
      );
    }

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `INSERT INTO custom_domains (
        tenant_id, domain, status, dns_records, ssl_status, verification_token
      ) VALUES (
        $1, $2, 'pending_dns', $3, 'pending', $4
      )
      RETURNING *`,
      [tenantId, normalizedDomain, JSON.stringify(dnsRecords), verificationToken]
    );

    await this.logAudit(tenantId, 'domain_added', undefined, undefined, { domain: normalizedDomain });

    this.log.info({ tenantId, domain: normalizedDomain, domainId: result.rows[0].id }, 'Custom domain added');
    return this.mapDomainRow(result.rows[0]);
  }

  /**
   * Verify DNS records for a custom domain (simulated verification).
   */
  async verifyDomain(tenantId: UUID, domainId: string): Promise<CustomDomain> {
    this.log.info({ tenantId, domainId }, 'Verifying domain DNS');

    const domainResult = await queryWithTenant<Record<string, any>>(
      tenantId,
      `SELECT * FROM custom_domains WHERE id = $1 AND tenant_id = $2`,
      [domainId, tenantId]
    );

    if (domainResult.rows.length === 0) {
      throw new NotFoundError('CustomDomain', domainId);
    }

    const domainRow = domainResult.rows[0];
    const currentStatus = domainRow.status;

    if (currentStatus === 'active') {
      throw new ConflictError('Domain is already verified and active');
    }

    // Placeholder: simulate DNS verification success
    // In production, this would perform actual DNS lookups
    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE custom_domains
       SET status = 'active',
           ssl_status = 'active',
           verified_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING *`,
      [domainId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('CustomDomain', domainId);
    }

    await this.logAudit(tenantId, 'domain_verified', undefined, { status: currentStatus }, { status: 'active', domain: domainRow.domain });

    this.log.info({ tenantId, domainId, domain: domainRow.domain }, 'Domain verified and SSL provisioned');
    return this.mapDomainRow(result.rows[0]);
  }

  /**
   * Remove a custom domain.
   */
  async removeDomain(tenantId: UUID, domainId: string): Promise<void> {
    this.log.info({ tenantId, domainId }, 'Removing custom domain');

    const result = await queryWithTenant<{ domain: string }>(
      tenantId,
      `DELETE FROM custom_domains WHERE id = $1 AND tenant_id = $2 RETURNING domain`,
      [domainId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('CustomDomain', domainId);
    }

    await this.logAudit(tenantId, 'domain_removed', undefined, undefined, { domain: result.rows[0].domain });

    this.log.info({ tenantId, domainId, domain: result.rows[0].domain }, 'Custom domain removed');
  }

  /**
   * Record a brand asset upload. Deactivates previous asset of the same type.
   */
  async uploadAsset(
    tenantId: UUID,
    assetType: BrandAsset['assetType'],
    fileMetadata: AssetUploadMetadata
  ): Promise<BrandAsset> {
    this.log.info({ tenantId, assetType }, 'Uploading brand asset');

    return withTransaction(tenantId, async (client) => {
      // Deactivate previous asset of same type
      await client.query(
        `UPDATE brand_assets
         SET is_active = false, updated_at = NOW()
         WHERE tenant_id = $1 AND asset_type = $2 AND is_active = true`,
        [tenantId, assetType]
      );

      // Create new asset record
      const assetResult = await client.query<Record<string, any>>(
        `INSERT INTO brand_assets (
          tenant_id, asset_type, file_name, file_url, file_size_bytes, mime_type, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, true
        )
        RETURNING *`,
        [tenantId, assetType, fileMetadata.fileName, fileMetadata.fileUrl, fileMetadata.fileSizeBytes, fileMetadata.mimeType]
      );

      // Update branding JSONB to reference new asset URL
      const brandingField = this.assetTypeToBrandingField(assetType);
      if (brandingField) {
        await client.query(
          `UPDATE whitelabel_configs
           SET branding = jsonb_set(branding, $1, $2::jsonb),
               updated_at = NOW()
           WHERE tenant_id = $3`,
          [`{${brandingField}}`, JSON.stringify(fileMetadata.fileUrl), tenantId]
        );
      }

      // Log audit
      await client.query(
        `INSERT INTO whitelabel_audit_log (tenant_id, action, new_values)
         VALUES ($1, $2, $3)`,
        [tenantId, 'asset_uploaded', JSON.stringify({ assetType, fileName: fileMetadata.fileName, fileUrl: fileMetadata.fileUrl })]
      );

      return this.mapAssetRow(assetResult.rows[0]);
    });
  }

  /**
   * Soft delete a brand asset (set is_active = false).
   */
  async deleteAsset(tenantId: UUID, assetId: string): Promise<void> {
    this.log.info({ tenantId, assetId }, 'Deleting brand asset');

    const result = await queryWithTenant<{ asset_type: string }>(
      tenantId,
      `UPDATE brand_assets
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING asset_type`,
      [assetId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('BrandAsset', assetId);
    }

    await this.logAudit(tenantId, 'asset_deleted', undefined, undefined, { assetId, assetType: result.rows[0].asset_type });
  }

  /**
   * Activate the white-label config.
   * Validates that required fields are present.
   */
  async activateWhiteLabel(tenantId: UUID): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId }, 'Activating white-label');

    const config = await this.getConfigInternal(tenantId);

    if (config.status === 'active') {
      throw new ConflictError('White-label is already active');
    }

    // Validate required fields
    const branding = config.branding;
    const errors: string[] = [];

    if (!branding.orgName) {
      errors.push('Organization name is required');
    }

    if (!branding.colors?.primary) {
      errors.push('Primary color is required');
    }

    // Check for at least a primary logo asset
    const logoResult = await queryWithTenant<{ id: string }>(
      tenantId,
      `SELECT id FROM brand_assets
       WHERE tenant_id = $1 AND asset_type = 'logo' AND is_active = true
       LIMIT 1`,
      [tenantId]
    );

    if (logoResult.rows.length === 0 && !branding.logoUrl) {
      errors.push('At least a primary logo is required (upload via assets or set logoUrl in branding)');
    }

    if (errors.length > 0) {
      throw new ValidationError('Cannot activate white-label: missing required fields', { missingFields: errors });
    }

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET status = 'active',
           activated_at = NOW(),
           updated_at = NOW()
       WHERE tenant_id = $1
       RETURNING *`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'whitelabel_activated', undefined, { status: config.status }, { status: 'active' });

    this.log.info({ tenantId }, 'White-label activated');
    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Deactivate (suspend) the white-label config.
   */
  async deactivateWhiteLabel(tenantId: UUID): Promise<WhiteLabelConfig> {
    this.log.info({ tenantId }, 'Deactivating white-label');

    const config = await this.getConfigInternal(tenantId);

    if (config.status === 'suspended') {
      throw new ConflictError('White-label is already suspended');
    }

    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `UPDATE whitelabel_configs
       SET status = 'suspended',
           updated_at = NOW()
       WHERE tenant_id = $1
       RETURNING *`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    await this.logAudit(tenantId, 'whitelabel_deactivated', undefined, { status: config.status }, { status: 'suspended' });

    this.log.info({ tenantId }, 'White-label deactivated');
    return this.mapConfigRow(result.rows[0]);
  }

  /**
   * Get paginated audit log for branding changes.
   */
  async getAuditLog(
    tenantId: UUID,
    filters?: { page?: number; pageSize?: number; action?: string }
  ): Promise<{ data: WhiteLabelAuditEntry[]; pagination: { page: number; pageSize: number; total: number } }> {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE tenant_id = $1';
    const params: unknown[] = [tenantId];

    if (filters?.action) {
      params.push(filters.action);
      whereClause += ` AND action = $${params.length}`;
    }

    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*) as count FROM whitelabel_audit_log ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await queryWithTenant<Record<string, any>>(
      tenantId,
      `SELECT * FROM whitelabel_audit_log ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    return {
      data: dataResult.rows.map(this.mapAuditRow),
      pagination: { page, pageSize, total },
    };
  }

  /**
   * Public: resolve tenant config by custom domain.
   */
  async resolveByDomain(domain: string): Promise<WhiteLabelConfig | null> {
    const normalizedDomain = domain.toLowerCase().trim();

    // Look up active custom domain
    const domainResult = await query<{ tenant_id: string }>(
      `SELECT tenant_id FROM custom_domains
       WHERE domain = $1 AND status = 'active'
       LIMIT 1`,
      [normalizedDomain]
    );

    if (domainResult.rows.length === 0) {
      return null;
    }

    const tenantId = domainResult.rows[0].tenant_id;

    const configResult = await query<Record<string, any>>(
      `SELECT * FROM whitelabel_configs
       WHERE tenant_id = $1 AND status = 'active'
       LIMIT 1`,
      [tenantId]
    );

    if (configResult.rows.length === 0) {
      return null;
    }

    return this.mapConfigRow(configResult.rows[0]);
  }

  /**
   * Public: resolve tenant config by subdomain.
   */
  async resolveBySubdomain(subdomain: string): Promise<WhiteLabelConfig | null> {
    const normalizedSubdomain = subdomain.toLowerCase().trim();

    const configResult = await query<Record<string, any>>(
      `SELECT * FROM whitelabel_configs
       WHERE subdomain = $1 AND status = 'active'
       LIMIT 1`,
      [normalizedSubdomain]
    );

    if (configResult.rows.length === 0) {
      return null;
    }

    return this.mapConfigRow(configResult.rows[0]);
  }

  /**
   * Generate CSS custom properties from a tenant's branding.
   */
  async generateCSSVariables(tenantId: UUID): Promise<string> {
    const configResult = await query<Record<string, any>>(
      `SELECT branding FROM whitelabel_configs
       WHERE tenant_id = $1 AND status = 'active'
       LIMIT 1`,
      [tenantId]
    );

    if (configResult.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    const branding = typeof configResult.rows[0].branding === 'string'
      ? JSON.parse(configResult.rows[0].branding)
      : configResult.rows[0].branding;

    const colors = branding.colors as ColorPalette;
    const typography = branding.typography as TypographyConfig;

    const variables: string[] = [];

    // Color variables
    if (colors) {
      variables.push(`  --color-primary: ${colors.primary};`);
      variables.push(`  --color-primary-hover: ${colors.primaryHover};`);
      variables.push(`  --color-secondary: ${colors.secondary};`);
      variables.push(`  --color-secondary-hover: ${colors.secondaryHover};`);
      variables.push(`  --color-accent: ${colors.accent};`);
      variables.push(`  --color-background: ${colors.background};`);
      variables.push(`  --color-surface: ${colors.surface};`);
      variables.push(`  --color-surface-hover: ${colors.surfaceHover};`);
      variables.push(`  --color-text: ${colors.text};`);
      variables.push(`  --color-text-secondary: ${colors.textSecondary};`);
      variables.push(`  --color-text-inverse: ${colors.textInverse};`);
      variables.push(`  --color-border: ${colors.border};`);
      variables.push(`  --color-error: ${colors.error};`);
      variables.push(`  --color-warning: ${colors.warning};`);
      variables.push(`  --color-success: ${colors.success};`);
      variables.push(`  --color-info: ${colors.info};`);
    }

    // Typography variables
    if (typography) {
      variables.push(`  --font-heading: '${typography.headingFont}', system-ui, sans-serif;`);
      variables.push(`  --font-body: '${typography.bodyFont}', system-ui, sans-serif;`);
      variables.push(`  --font-mono: '${typography.monoFont}', monospace;`);
      variables.push(`  --font-size-base: ${typography.baseFontSize};`);
      variables.push(`  --font-weight-heading: ${typography.headingWeight};`);
      variables.push(`  --font-weight-body: ${typography.bodyWeight};`);
      variables.push(`  --line-height-base: ${typography.lineHeight};`);
    }

    return `:root {\n${variables.join('\n')}\n}`;
  }

  /**
   * Public: check if a subdomain is available.
   */
  async checkSubdomainAvailability(subdomain: string): Promise<{ available: boolean; reason?: string }> {
    const normalizedSubdomain = subdomain.toLowerCase().trim();

    // Check format
    if (!SUBDOMAIN_REGEX.test(normalizedSubdomain)) {
      return { available: false, reason: 'Subdomain must be 1-63 characters, lowercase alphanumeric and hyphens, cannot start/end with a hyphen' };
    }

    // Check reserved
    if (RESERVED_SUBDOMAINS.has(normalizedSubdomain)) {
      return { available: false, reason: 'This subdomain is reserved' };
    }

    // Check taken
    const existingResult = await query<{ id: string }>(
      `SELECT id FROM whitelabel_configs WHERE subdomain = $1 LIMIT 1`,
      [normalizedSubdomain]
    );

    if (existingResult.rows.length > 0) {
      return { available: false, reason: 'This subdomain is already taken' };
    }

    return { available: true };
  }

  // ─── Private Helpers ───

  private async getConfigInternal(tenantId: UUID): Promise<WhiteLabelConfig> {
    const result = await queryWithTenant<Record<string, any>>(
      tenantId,
      `SELECT * FROM whitelabel_configs WHERE tenant_id = $1 LIMIT 1`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('WhiteLabelConfig', tenantId);
    }

    return this.mapConfigRow(result.rows[0]);
  }

  private async validateSubdomain(subdomain: string): Promise<void> {
    const normalized = subdomain.toLowerCase().trim();

    if (!SUBDOMAIN_REGEX.test(normalized)) {
      throw new ValidationError(
        'Invalid subdomain format. Must be 1-63 characters, lowercase alphanumeric and hyphens, cannot start or end with a hyphen.'
      );
    }

    if (RESERVED_SUBDOMAINS.has(normalized)) {
      throw new ValidationError(`Subdomain '${normalized}' is reserved and cannot be used`);
    }

    const existingResult = await query<{ id: string }>(
      `SELECT id FROM whitelabel_configs WHERE subdomain = $1 LIMIT 1`,
      [normalized]
    );

    if (existingResult.rows.length > 0) {
      throw new ConflictError(`Subdomain '${normalized}' is already taken`);
    }
  }

  private async logAudit(
    tenantId: UUID,
    action: string,
    changedBy?: string,
    oldValues?: unknown,
    newValues?: unknown
  ): Promise<void> {
    try {
      await queryWithTenant(
        tenantId,
        `INSERT INTO whitelabel_audit_log (tenant_id, action, changed_by, old_values, new_values)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          tenantId,
          action,
          changedBy ?? null,
          oldValues ? JSON.stringify(oldValues) : null,
          newValues ? JSON.stringify(newValues) : null,
        ]
      );
    } catch (error) {
      this.log.warn({ tenantId, action, error: (error as Error).message }, 'Failed to write audit log');
    }
  }

  private assetTypeToBrandingField(assetType: BrandAsset['assetType']): string | null {
    const map: Record<string, string> = {
      logo: 'logoUrl',
      logo_icon: 'logoIconUrl',
      favicon: 'faviconUrl',
      login_background: 'loginPage",backgroundImageUrl',
    };
    return map[assetType] ?? null;
  }

  private mapConfigRow(row: Record<string, any>): WhiteLabelConfig {
    const branding = typeof row.branding === 'string' ? JSON.parse(row.branding) : (row.branding ?? {});
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      subdomain: row.subdomain,
      status: row.status,
      branding,
      preset: row.preset ?? 'default',
      activatedAt: row.activated_at ?? row.activatedAt ?? undefined,
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }

  private mapDomainRow(row: Record<string, any>): CustomDomain {
    const dnsRecords = typeof row.dns_records === 'string' ? JSON.parse(row.dns_records) : (row.dns_records ?? []);
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      domain: row.domain,
      status: row.status,
      dnsRecords,
      sslStatus: row.ssl_status ?? row.sslStatus ?? 'pending',
      verifiedAt: row.verified_at ?? row.verifiedAt ?? undefined,
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }

  private mapAssetRow(row: Record<string, any>): BrandAsset {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      assetType: row.asset_type ?? row.assetType,
      fileName: row.file_name ?? row.fileName,
      fileUrl: row.file_url ?? row.fileUrl,
      fileSizeBytes: parseInt(String(row.file_size_bytes ?? row.fileSizeBytes ?? 0), 10),
      mimeType: row.mime_type ?? row.mimeType,
      isActive: row.is_active ?? row.isActive ?? true,
      createdAt: row.created_at ?? row.createdAt,
    };
  }

  private mapAuditRow(row: Record<string, any>): WhiteLabelAuditEntry {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      action: row.action,
      changedBy: row.changed_by ?? row.changedBy ?? undefined,
      oldValues: typeof row.old_values === 'string' ? JSON.parse(row.old_values) : (row.old_values ?? undefined),
      newValues: typeof row.new_values === 'string' ? JSON.parse(row.new_values) : (row.new_values ?? undefined),
      createdAt: row.created_at ?? row.createdAt,
    };
  }
}

export const whiteLabelService = new WhiteLabelService();
