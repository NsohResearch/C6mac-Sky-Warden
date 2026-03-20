import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const whiteLabelRoutes = new Hono();

// ─── Schemas ───

const configCreateSchema = z.object({
  orgName: z.string().min(1).max(200),
  subdomain: z.string().min(1).max(63),
  preset: z.enum(['default', 'aviation-dark', 'aviation-light', 'government', 'enterprise-blue', 'enterprise-dark']).optional(),
});

const brandingUpdateSchema = z.object({
  orgName: z.string().min(1).max(200).optional(),
  orgLegalName: z.string().max(300).optional(),
  tagline: z.string().max(500).optional(),
  supportEmail: z.string().email().optional(),
  supportUrl: z.string().url().optional(),
  privacyPolicyUrl: z.string().url().optional(),
  termsOfServiceUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  logoIconUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  colors: z.record(z.string()).optional(),
  typography: z.record(z.string()).optional(),
  loginPage: z.record(z.unknown()).optional(),
  localization: z.record(z.unknown()).optional(),
});

const colorsUpdateSchema = z.object({
  primary: z.string().optional(),
  primaryHover: z.string().optional(),
  secondary: z.string().optional(),
  secondaryHover: z.string().optional(),
  accent: z.string().optional(),
  background: z.string().optional(),
  surface: z.string().optional(),
  surfaceHover: z.string().optional(),
  text: z.string().optional(),
  textSecondary: z.string().optional(),
  textInverse: z.string().optional(),
  border: z.string().optional(),
  error: z.string().optional(),
  warning: z.string().optional(),
  success: z.string().optional(),
  info: z.string().optional(),
});

const typographyUpdateSchema = z.object({
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  monoFont: z.string().optional(),
  baseFontSize: z.string().optional(),
  headingWeight: z.string().optional(),
  bodyWeight: z.string().optional(),
  lineHeight: z.string().optional(),
});

const loginPageUpdateSchema = z.object({
  backgroundType: z.enum(['color', 'gradient', 'image']).optional(),
  backgroundColor: z.string().optional(),
  backgroundGradient: z.string().optional(),
  backgroundImageUrl: z.string().url().optional(),
  logoPosition: z.enum(['center', 'left', 'right']).optional(),
  showTagline: z.boolean().optional(),
  tagline: z.string().max(500).optional(),
  showPoweredBy: z.boolean().optional(),
  customCss: z.string().max(10000).optional(),
});

const localizationUpdateSchema = z.object({
  defaultLocale: z.string().optional(),
  supportedLocales: z.array(z.string()).optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  timezone: z.string().optional(),
  unitSystem: z.enum(['imperial', 'metric']).optional(),
  distanceUnit: z.enum(['feet', 'meters']).optional(),
  altitudeUnit: z.enum(['feet', 'meters']).optional(),
  speedUnit: z.enum(['mph', 'kph', 'knots']).optional(),
  temperatureUnit: z.enum(['fahrenheit', 'celsius']).optional(),
  terminology: z.record(z.string()).optional(),
});

const presetApplySchema = z.object({
  preset: z.enum(['default', 'aviation-dark', 'aviation-light', 'government', 'enterprise-blue', 'enterprise-dark']),
});

const domainAddSchema = z.object({
  domain: z.string().min(1).max(253),
});

const assetUploadSchema = z.object({
  assetType: z.enum(['logo', 'logo_icon', 'favicon', 'login_background', 'email_header', 'email_footer']),
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileSizeBytes: z.number().positive(),
  mimeType: z.string().min(1).max(100),
});

const auditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  action: z.string().optional(),
});

const emailVerifySchema = z.object({
  domain: z.string().min(1).max(253),
});

// ─── Public Endpoints (No Auth — Tenant Resolution) ───

whiteLabelRoutes.get(
  '/resolve/domain/:domain',
  async (c) => {
    const domain = c.req.param('domain');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.resolveByDomain(domain);

    if (!config) {
      return c.json({ success: true, data: null }, 200);
    }

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.get(
  '/resolve/subdomain/:subdomain',
  async (c) => {
    const subdomain = c.req.param('subdomain');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.resolveBySubdomain(subdomain);

    if (!config) {
      return c.json({ success: true, data: null }, 200);
    }

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.get(
  '/subdomain/check/:subdomain',
  async (c) => {
    const subdomain = c.req.param('subdomain');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const result = await whiteLabelService.checkSubdomainAvailability(subdomain);

    return c.json({ success: true, data: result });
  }
);

whiteLabelRoutes.get(
  '/css/:tenantId',
  async (c) => {
    const tenantId = c.req.param('tenantId');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const css = await whiteLabelService.generateCSSVariables(tenantId);

    return new Response(css, {
      status: 200,
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }
);

// ─── Config CRUD ───

whiteLabelRoutes.get(
  '/config',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.getConfig(tenantId);

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.post(
  '/config',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', configCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.createConfig(tenantId, body);

    logger.info({ tenantId, userId, subdomain: body.subdomain }, 'White-label config created');

    return c.json({ success: true, data: config }, 201);
  }
);

whiteLabelRoutes.patch(
  '/config/activate',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.activateWhiteLabel(tenantId);

    logger.info({ tenantId, userId }, 'White-label activated');

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.patch(
  '/config/deactivate',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.deactivateWhiteLabel(tenantId);

    logger.info({ tenantId, userId }, 'White-label deactivated');

    return c.json({ success: true, data: config });
  }
);

// ─── Branding ───

whiteLabelRoutes.patch(
  '/branding',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', brandingUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.updateBranding(tenantId, body);

    logger.info({ tenantId, userId }, 'Branding updated');

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.patch(
  '/branding/colors',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', colorsUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.updateColors(tenantId, body);

    logger.info({ tenantId, userId }, 'Color palette updated');

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.patch(
  '/branding/typography',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', typographyUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.updateTypography(tenantId, body);

    logger.info({ tenantId, userId }, 'Typography updated');

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.patch(
  '/branding/login',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', loginPageUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.updateLoginPage(tenantId, body);

    logger.info({ tenantId, userId }, 'Login page config updated');

    return c.json({ success: true, data: config });
  }
);

whiteLabelRoutes.post(
  '/branding/preset',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', presetApplySchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const { preset } = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.applyPreset(tenantId, preset);

    logger.info({ tenantId, userId, preset }, 'Branding preset applied');

    return c.json({ success: true, data: config });
  }
);

// ─── Localization ───

whiteLabelRoutes.patch(
  '/localization',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', localizationUpdateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.updateLocalization(tenantId, body);

    logger.info({ tenantId, userId }, 'Localization config updated');

    return c.json({ success: true, data: config });
  }
);

// ─── Custom Domains ───

whiteLabelRoutes.get(
  '/domains',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.getConfig(tenantId);

    return c.json({ success: true, data: config.customDomains });
  }
);

whiteLabelRoutes.post(
  '/domains',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', domainAddSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const { domain } = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const result = await whiteLabelService.addCustomDomain(tenantId, domain);

    logger.info({ tenantId, userId, domain }, 'Custom domain added');

    return c.json({ success: true, data: result }, 201);
  }
);

whiteLabelRoutes.post(
  '/domains/:id/verify',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const result = await whiteLabelService.verifyDomain(tenantId, id);

    logger.info({ tenantId, userId, domainId: id }, 'Domain verification triggered');

    return c.json({ success: true, data: result });
  }
);

whiteLabelRoutes.delete(
  '/domains/:id',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    await whiteLabelService.removeDomain(tenantId, id);

    logger.info({ tenantId, userId, domainId: id }, 'Custom domain removed');

    return c.json({ success: true, data: { deleted: true } });
  }
);

// ─── Brand Assets ───

whiteLabelRoutes.get(
  '/assets',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const config = await whiteLabelService.getConfig(tenantId);

    return c.json({ success: true, data: config.brandAssets });
  }
);

whiteLabelRoutes.post(
  '/assets',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', assetUploadSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const asset = await whiteLabelService.uploadAsset(tenantId, body.assetType, {
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileSizeBytes: body.fileSizeBytes,
      mimeType: body.mimeType,
    });

    logger.info({ tenantId, userId, assetType: body.assetType }, 'Brand asset uploaded');

    return c.json({ success: true, data: asset }, 201);
  }
);

whiteLabelRoutes.delete(
  '/assets/:id',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    await whiteLabelService.deleteAsset(tenantId, id);

    logger.info({ tenantId, userId, assetId: id }, 'Brand asset deleted');

    return c.json({ success: true, data: { deleted: true } });
  }
);

// ─── Audit Log ───

whiteLabelRoutes.get(
  '/audit-log',
  authenticate,
  requirePermissions('whitelabel:read'),
  zValidator('query', auditLogQuerySchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { whiteLabelService } = await import('../services/whitelabel/whitelabel.service.js');
    const result = await whiteLabelService.getAuditLog(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

// ─── Email Domain Verification ───

whiteLabelRoutes.post(
  '/email/verify',
  authenticate,
  requirePermissions('whitelabel:manage'),
  zValidator('json', emailVerifySchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const { domain } = c.req.valid('json');

    // Placeholder: In production, this would initiate email domain verification
    // (SPF, DKIM, DMARC record checks)
    logger.info({ tenantId, userId, domain }, 'Email domain verification initiated');

    return c.json({
      success: true,
      data: {
        domain,
        status: 'pending',
        dnsRecords: [
          { type: 'TXT', name: domain, value: `v=spf1 include:skywarden.app ~all` },
          { type: 'CNAME', name: `skywarden._domainkey.${domain}`, value: `skywarden.domainkey.skywarden.app` },
          { type: 'TXT', name: `_dmarc.${domain}`, value: `v=DMARC1; p=none; rua=mailto:dmarc@skywarden.app` },
        ],
        message: 'Configure the DNS records below and check status to verify.',
      },
    }, 201);
  }
);

whiteLabelRoutes.get(
  '/email/status',
  authenticate,
  requirePermissions('whitelabel:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');

    // Placeholder: In production, this would check actual DNS records
    logger.info({ tenantId }, 'Email domain verification status checked');

    return c.json({
      success: true,
      data: {
        spf: { status: 'pending', record: null },
        dkim: { status: 'pending', record: null },
        dmarc: { status: 'pending', record: null },
        overallStatus: 'pending',
      },
    });
  }
);

export { whiteLabelRoutes };
