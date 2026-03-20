// ============================================================
// C6mac Sky Warden — White-Label / Custom Branding Type System
// ============================================================
//
// White-labeling is available for Enterprise ($199/mo) and Agency ($299/mo)
// tier customers. These types define the complete configuration surface
// for running the C6mac Sky Warden platform under a custom brand, domain,
// logos, colors, and regulatory identity.
//
// Usage:
//   - Tenants configure their WhiteLabelConfig via the admin dashboard
//   - The config is stored per-tenant and resolved at request time
//   - Custom domains route through our edge proxy (Cloudflare/Fastly)
//   - Branding is injected into the React app via ThemeProvider context
//   - Email templates pull branding from EmailBrandingConfig
//   - PDF generation (certificates, reports) uses LogoSet + ColorPalette
// ============================================================

// ------------------------------------------------------------
// Status & Lifecycle Enums
// ------------------------------------------------------------

/**
 * Lifecycle status of a white-label configuration.
 *
 * Flow: draft -> pending_verification -> active -> (suspended | expired)
 *
 * - `draft` — Initial state; tenant is configuring branding but hasn't submitted for review.
 * - `pending_verification` — Custom domain DNS is being verified and/or branding is under review.
 * - `active` — Fully operational; custom domain resolves, branding is live.
 * - `suspended` — Temporarily disabled (e.g., billing issue, compliance violation).
 * - `expired` — Subscription lapsed or tenant downgraded below Enterprise tier.
 */
export type WhiteLabelStatus =
  | 'draft'
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'expired';

/**
 * DNS verification and routing status for a custom domain.
 *
 * Flow: pending_dns -> verifying -> active | failed
 *
 * - `pending_dns` — Tenant has been given DNS records to create; waiting for propagation.
 * - `verifying` — DNS records detected; ownership verification in progress.
 * - `active` — Domain verified, CNAME routing confirmed, traffic is live.
 * - `failed` — Verification failed after max retries (records missing or incorrect).
 * - `expired` — Domain verification expired (re-verification required after 90 days).
 */
export type DomainStatus =
  | 'pending_dns'
  | 'verifying'
  | 'active'
  | 'failed'
  | 'expired';

/**
 * SSL/TLS certificate provisioning status for a custom domain.
 *
 * - `pending` — Certificate request queued (Let's Encrypt or custom CA).
 * - `provisioning` — ACME challenge in progress; certificate being issued.
 * - `active` — Certificate installed and serving HTTPS traffic.
 * - `expired` — Certificate expired; auto-renewal failed or was disabled.
 * - `error` — Provisioning error (e.g., rate limit, invalid domain, CAA record block).
 */
export type SSLStatus =
  | 'pending'
  | 'provisioning'
  | 'active'
  | 'expired'
  | 'error';

/**
 * Pre-built branding presets optimized for common UAV/drone industry use cases.
 *
 * - `aviation_dark` — Amber-on-dark theme inspired by aviation instruments and HUDs.
 * - `aviation_light` — Professional blue theme with dark sidebar; clean and modern.
 * - `government_official` — Navy/gold palette for civil aviation authorities and regulators.
 * - `corporate_blue` — Standard corporate SaaS look with blue primary and purple accents.
 * - `military_green` — Tactical olive/tan palette for defense and military drone operations.
 * - `custom` — Fully tenant-defined; all color and typography values must be provided.
 */
export type BrandingPreset =
  | 'aviation_dark'
  | 'aviation_light'
  | 'government_official'
  | 'corporate_blue'
  | 'military_green'
  | 'custom';

// ------------------------------------------------------------
// DNS & Domain Configuration
// ------------------------------------------------------------

/**
 * A single DNS record that the tenant must create for domain verification
 * or routing. Displayed in the admin dashboard with copy-to-clipboard.
 */
export interface DNSRecord {
  /** DNS record type */
  type: 'CNAME' | 'TXT' | 'A' | 'AAAA';

  /**
   * Record name (host/subdomain).
   * @example "_skywarden-verify.drones.acme.com"
   * @example "drones.acme.com"
   */
  name: string;

  /**
   * Record value.
   * @example "skywarden-verify=abc123def456"
   * @example "edge.skywarden.app"
   */
  value: string;

  /** Recommended TTL in seconds. Typically 300 (5 min) for verification, 3600 (1 hr) for routing. */
  ttl: number;

  /** Whether this specific record has been verified by our DNS checker. */
  verified: boolean;
}

/**
 * Custom domain configuration for a white-label tenant.
 *
 * Supports both subdomain (drones.acme.com) and apex domain (acme.com) setups.
 * SSL is provisioned automatically via Let's Encrypt unless the tenant brings
 * their own certificate (Enterprise+ feature).
 */
export interface CustomDomain {
  /**
   * The fully qualified custom domain.
   * @example "drones.acme.com"
   * @example "uas.kcaa.go.ke"
   */
  domain: string;

  /** Current domain verification and routing status. */
  status: DomainStatus;

  /** SSL/TLS certificate status for this domain. */
  sslStatus: SSLStatus;

  // --- DNS Verification ---

  /**
   * TXT record the tenant must create to prove domain ownership.
   * @example { type: 'TXT', name: '_skywarden-verify.drones.acme.com', value: 'skywarden-verify=abc123', ttl: 300, verified: false }
   */
  verificationRecord: DNSRecord;

  /**
   * CNAME record pointing the custom domain to our edge proxy.
   * @example { type: 'CNAME', name: 'drones.acme.com', value: 'edge.skywarden.app', ttl: 3600, verified: false }
   */
  cnameRecord: DNSRecord;

  /** Whether domain ownership has been confirmed via TXT record. */
  verified: boolean;

  /** ISO 8601 timestamp of when domain ownership was verified. */
  verifiedAt?: string;

  // --- SSL Certificate ---

  /** Internal certificate ID from Let's Encrypt or custom CA. */
  sslCertificateId?: string;

  /** ISO 8601 timestamp of when the current SSL certificate expires. */
  sslExpiresAt?: string;

  /** Whether to automatically renew the SSL certificate before expiry. Defaults to true. */
  autoRenewSSL: boolean;

  // --- Apex Domain Support ---

  /**
   * True if this is an apex/root domain (e.g., "acme.com") rather than a subdomain.
   * Apex domains require A/AAAA records instead of CNAME (due to DNS spec constraints).
   */
  isApexDomain: boolean;

  /**
   * A/AAAA records required for apex domain setups.
   * Points to our edge proxy Anycast IPs. Only populated when `isApexDomain` is true.
   */
  aRecords?: DNSRecord[];

  /** ISO 8601 timestamp of when this custom domain was first configured. */
  createdAt: string;
}

// ------------------------------------------------------------
// Branding: Logos
// ------------------------------------------------------------

/**
 * A single logo asset with metadata for responsive rendering and accessibility.
 * All logos are stored on our CDN (S3 + CloudFront) with immutable URLs.
 */
export interface LogoAsset {
  /**
   * CDN URL for the logo asset.
   * @example "https://cdn.skywarden.app/tenants/acme/logos/primary.svg"
   */
  url: string;

  /**
   * Alt text for accessibility (screen readers, image-blocked emails).
   * @example "Acme Drone Services Logo"
   */
  altText: string;

  /** Original width in pixels. Used for proper aspect ratio rendering. */
  width?: number;

  /** Original height in pixels. Used for proper aspect ratio rendering. */
  height?: number;

  /** Image format. SVG is preferred for logos; PNG/WebP for photographic marks. */
  format: 'svg' | 'png' | 'webp' | 'jpg';
}

/**
 * Complete set of logo variants for different rendering contexts.
 *
 * At minimum, the `primary` logo is required. All other variants are optional
 * and the platform will fall back to `primary` when a specific variant is missing.
 */
export interface LogoSet {
  /** Primary logo -- full color, used in sidebar header and login page. */
  primary: LogoAsset;

  /** Light variant -- for dark backgrounds (sidebar, dark theme, map overlays). */
  light?: LogoAsset;

  /** Dark variant -- for light backgrounds (emails, PDFs, printed compliance documents). */
  dark?: LogoAsset;

  /** Icon only -- square aspect ratio, used as avatar/app icon. No wordmark. */
  icon?: LogoAsset;

  /** Wide/horizontal variant -- for email headers, PDF report headers, certificates. */
  wide?: LogoAsset;

  /**
   * Government/regulatory seal -- circular, for official compliance documents.
   * Typically used by civil aviation authorities (FAA, KCAA, NCAA, etc.).
   */
  seal?: LogoAsset;

  /**
   * Whether the "Powered by Sky Warden" badge is visible.
   * Enterprise tier can hide it; Agency tier must show it (contractual).
   */
  poweredByVisible: boolean;

  /**
   * Where the "Powered by Sky Warden" badge appears in the UI.
   * Only relevant when `poweredByVisible` is true; set to `'hidden'` to suppress.
   */
  poweredByPosition: 'footer' | 'sidebar_bottom' | 'login_footer' | 'hidden';
}

// ------------------------------------------------------------
// Branding: Colors
// ------------------------------------------------------------

/**
 * Complete color palette for theming the entire platform UI.
 *
 * All color values are CSS-compatible hex strings (e.g., "#1E40AF").
 * These are injected as CSS custom properties at runtime and consumed
 * by Tailwind CSS v4 via the theme configuration.
 *
 * Includes aviation-specific colors for airspace class rendering on maps
 * and chart colors for the analytics/reporting dashboards.
 */
export interface ColorPalette {
  // --- Primary Brand ---

  /** Main brand color. Used for primary buttons, active states, links. */
  primary: string;

  /** Text color rendered on top of the primary color. Usually white or near-black. */
  primaryForeground: string;

  /** Hover/pressed state of the primary color. Typically 1-2 shades darker. */
  primaryHover: string;

  // --- Secondary & Accent ---

  /** Secondary brand color. Used for secondary buttons, tags, badges. */
  secondary: string;

  /** Text color rendered on top of the secondary color. */
  secondaryForeground: string;

  /** Accent color for highlights, notification badges, CTAs, active indicators. */
  accent: string;

  /** Text color rendered on top of the accent color. */
  accentForeground: string;

  // --- Backgrounds ---

  /** Main page background color. */
  background: string;

  /** Card, panel, and modal surface color. Slightly elevated from background. */
  surfaceColor: string;

  /** Sidebar/navigation background color. Often darker than main background. */
  sidebarBackground: string;

  /** Sidebar text and icon color. */
  sidebarForeground: string;

  /** Active/selected sidebar item highlight color. */
  sidebarAccent: string;

  // --- Text ---

  /** Primary text color for headings and body copy. */
  textPrimary: string;

  /** Secondary/muted text for labels, captions, metadata. */
  textSecondary: string;

  /** Most muted text for placeholders, disabled states, timestamps. */
  textMuted: string;

  // --- Borders ---

  /** Default border color for cards, inputs, dividers. */
  border: string;

  /** Border color on hover/focus states. */
  borderHover: string;

  // --- Status Colors ---

  /**
   * Success/positive status color.
   * @default "#10B981"
   */
  success: string;

  /**
   * Warning/caution status color.
   * @default "#F59E0B"
   */
  warning: string;

  /**
   * Danger/error/destructive status color.
   * @default "#EF4444"
   */
  danger: string;

  /**
   * Informational status color.
   * @default "#3B82F6"
   */
  info: string;

  // --- Aviation-Specific Airspace Colors ---

  /**
   * Custom color for FAA Class B airspace on maps.
   * If omitted, the platform default is used.
   * Agencies may override to match their national charting conventions.
   */
  airspaceClassB?: string;

  /** Custom color for Class C airspace. */
  airspaceClassC?: string;

  /** Custom color for Class D airspace. */
  airspaceClassD?: string;

  /** Custom color for Class E airspace. */
  airspaceClassE?: string;

  /** Custom color for Class G (uncontrolled) airspace. */
  airspaceClassG?: string;

  // --- Chart / Analytics Colors ---

  /**
   * Ordered array of 6-8 colors for Recharts bar/line/pie charts
   * in the analytics and reporting dashboards.
   */
  chartColors: string[];
}

// ------------------------------------------------------------
// Branding: Typography
// ------------------------------------------------------------

/**
 * Typography configuration for the white-label instance.
 *
 * Fonts are loaded from Google Fonts (or self-hosted if the tenant provides
 * WOFF2 files). The `googleFontsUrl` is auto-generated from font selections.
 */
export interface TypographyConfig {
  /**
   * Primary font family for headings, navigation, and UI elements.
   * Must be a Google Fonts name or a system font stack.
   * @example "Inter"
   * @example "DM Sans"
   * @example "Outfit"
   */
  headingFont: string;

  /**
   * Body font family for paragraph text, table cells, form labels.
   * @example "Inter"
   * @example "Source Sans Pro"
   */
  bodyFont: string;

  /**
   * Monospace font for drone serial numbers, registration IDs, coordinates, code blocks.
   * @example "JetBrains Mono"
   * @example "Fira Code"
   */
  monoFont: string;

  /**
   * Auto-generated Google Fonts URL for loading the selected fonts.
   * @example "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
   */
  googleFontsUrl?: string;

  /**
   * Base font size in pixels. Applied to the root element.
   * @default 14
   */
  baseFontSize: number;

  /**
   * Font weight for headings (h1-h6, nav items, card titles).
   * @default 600
   */
  headingWeight: 500 | 600 | 700 | 800;

  /**
   * CSS letter-spacing adjustment for headings. Tighter spacing looks more modern.
   * @example "-0.025em"
   */
  headingLetterSpacing?: string;
}

// ------------------------------------------------------------
// Branding: Login Page
// ------------------------------------------------------------

/**
 * Customization options for the white-label login/authentication page.
 *
 * Supports multiple layout styles:
 * - `centered` — Login form centered over a full-bleed background.
 * - `split_left` — Background on left, login form on right.
 * - `split_right` — Login form on left, background on right.
 *
 * Government agencies often display national flags, regulatory seals,
 * and official disclaimers on the login page.
 */
export interface LoginPageConfig {
  // --- Background ---

  /** Background rendering style for the login page. */
  backgroundType: 'solid' | 'gradient' | 'image' | 'video';

  /** Solid background color. Used when `backgroundType` is `'solid'`. */
  backgroundColor?: string;

  /**
   * CSS gradient string. Used when `backgroundType` is `'gradient'`.
   * @example "linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)"
   */
  backgroundGradient?: string;

  /**
   * CDN URL for a hero/background image. Used when `backgroundType` is `'image'`.
   * Recommended: 1920x1080+ aerial/drone photography.
   */
  backgroundImageUrl?: string;

  /**
   * CDN URL for a looping background video. Used when `backgroundType` is `'video'`.
   * Must be MP4, max 15 seconds, under 5MB for fast loading.
   */
  backgroundVideoUrl?: string;

  /**
   * Semi-transparent overlay color applied on top of background image/video.
   * Ensures login form text remains readable.
   * @example "rgba(0, 0, 0, 0.5)"
   */
  backgroundOverlay?: string;

  // --- Layout ---

  /** Login form position relative to the background. */
  layout: 'centered' | 'split_left' | 'split_right';

  // --- Welcome Text ---

  /**
   * Main welcome heading displayed above or beside the login form.
   * @example "Welcome to Acme Drone Operations"
   */
  welcomeTitle?: string;

  /**
   * Subtitle/tagline displayed below the welcome heading.
   * @example "Manage your fleet safely and efficiently"
   */
  welcomeSubtitle?: string;

  // --- Social Proof ---

  /** Whether to show a customer testimonial quote on the login page. */
  showTestimonial?: boolean;

  /**
   * Testimonial quote text.
   * @example "Sky Warden transformed how we manage our drone fleet across 12 sites."
   */
  testimonialText?: string;

  /**
   * Attribution for the testimonial.
   * @example "Jane Doe, VP Operations, Acme Corp"
   */
  testimonialAuthor?: string;

  // --- Help & Signup Links ---

  /** Whether to show a "Need help?" link below the login form. */
  showHelpLink: boolean;

  /** URL for the help/support page. */
  helpUrl?: string;

  /** Whether to show a "Sign up" / "Request access" link. */
  showSignupLink: boolean;

  /** URL for the signup/registration page. */
  signupUrl?: string;

  // --- Government / Regulatory Display ---

  /**
   * Whether to display the national flag on the login page.
   * Common for civil aviation authority portals.
   */
  showNationalFlag: boolean;

  /**
   * ISO 3166-1 alpha-2 country code for the national flag.
   * @example "US"
   * @example "KE"
   */
  nationalFlagCode?: string;

  /**
   * Whether to display a regulatory body badge/seal on the login page.
   * @example FAA seal, KCAA logo, NCAA emblem
   */
  showRegulatoryBadge: boolean;

  /** CDN URL for the regulatory badge/seal image. */
  regulatoryBadgeUrl?: string;

  /** Alt text for the regulatory badge image. */
  regulatoryBadgeAlt?: string;
}

// ------------------------------------------------------------
// Branding: Dashboard
// ------------------------------------------------------------

/**
 * Customization for the main dashboard UI chrome (sidebar, header, nav, maps).
 */
export interface DashboardBrandingConfig {
  // --- Sidebar ---

  /**
   * Sidebar rendering style.
   * - `full` — Sidebar with icons and text labels (default).
   * - `compact` — Narrower sidebar with smaller text.
   * - `icon_only` — Icons only; text shown on hover tooltip.
   */
  sidebarStyle: 'full' | 'compact' | 'icon_only';

  /** Size of the organization logo in the sidebar header. */
  sidebarLogoSize: 'sm' | 'md' | 'lg';

  // --- Header ---

  /** Whether to display the organization name in the top header bar. */
  showOrganizationName: boolean;

  /**
   * Whether to show an environment badge ("Production" / "Sandbox") in the header.
   * Useful for tenants with separate staging environments.
   */
  showEnvironmentBadge: boolean;

  // --- Navigation ---

  /**
   * Per-item overrides for the main navigation menu.
   * Allows hiding, renaming, reordering, or re-iconing nav items.
   */
  navOverrides: NavOverride[];

  // --- Dashboard Content ---

  /**
   * Custom welcome message shown on the dashboard home page.
   * Supports `{name}` placeholder for the logged-in user's first name.
   * @example "Good morning, {name}. Your fleet is operational."
   */
  dashboardWelcome?: string;

  /**
   * Whether to show the Sky Warden platform news/changelog feed.
   * White-label tenants typically hide this.
   */
  showPlatformNews: boolean;

  // --- Map Configuration ---

  /**
   * Custom Mapbox style URL for the map views.
   * Allows tenants to use their own Mapbox style (dark, satellite, custom).
   * @example "mapbox://styles/acmedrones/clx12345"
   */
  mapStyle?: string;

  /**
   * Default center coordinates [longitude, latitude] when the map loads.
   * @example [-98.5795, 39.8283] — center of continental US
   * @example [36.8219, -1.2921] — Nairobi, Kenya
   */
  defaultMapCenter?: [number, number];

  /**
   * Default zoom level when the map loads (0-22).
   * @example 5 — country level
   * @example 10 — metro area
   */
  defaultMapZoom?: number;
}

/**
 * Override configuration for a single navigation menu item.
 * Allows white-label tenants to customize the navigation to match
 * their terminology and hide features they don't use.
 */
export interface NavOverride {
  /**
   * Internal key of the navigation item to override.
   * @example "fleet" | "missions" | "laanc" | "airspace" | "pilots" | "compliance" | "analytics" | "settings"
   */
  originalKey: string;

  /** Whether this nav item is visible. Set to false to hide it entirely. */
  visible: boolean;

  /**
   * Custom display label to replace the default.
   * @example Rename "Fleet" to "Aircraft" or "Assets"
   * @example Rename "LAANC" to "Airspace Authorization"
   */
  customLabel?: string;

  /**
   * Custom icon name from the lucide-react icon set.
   * @see https://lucide.dev/icons
   * @example "plane" | "radar" | "shield-check"
   */
  customIcon?: string;

  /**
   * Custom sort order (lower numbers appear first).
   * Items without a customOrder retain their default position.
   */
  customOrder?: number;
}

// ------------------------------------------------------------
// Localization
// ------------------------------------------------------------

/**
 * Localization and regional settings for a white-label tenant.
 *
 * Critical for international aviation: different countries use different
 * measurement systems, date formats, regulatory terminology, and languages.
 *
 * @example A Kenyan civil aviation authority would configure:
 *   - defaultLanguage: "en"
 *   - distanceUnit: "meters"
 *   - altitudeUnit: "feet" (aviation standard worldwide)
 *   - dateFormat: "DD/MM/YYYY"
 *   - terminologyOverrides: { "LAANC": "UAS Authorization", "FAA": "KCAA" }
 */
export interface LocalizationConfig {
  /**
   * Primary/default language for the UI.
   * ISO 639-1 two-letter code.
   * @example "en" | "fr" | "sw" | "pt" | "ar"
   */
  defaultLanguage: string;

  /**
   * All languages supported by this tenant instance.
   * Users can switch between these in their profile settings.
   */
  supportedLanguages: string[];

  // --- Date & Time ---

  /** Date display format across the platform. */
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

  /** Time display format. 12-hour (AM/PM) or 24-hour (military/aviation). */
  timeFormat: '12h' | '24h';

  /**
   * IANA timezone identifier for default display.
   * Individual users can override in their profile.
   * @example "America/New_York" | "Africa/Nairobi" | "Europe/London"
   */
  timezone: string;

  // --- Measurement Units ---

  /**
   * Horizontal distance unit.
   * US aviation uses feet; most of the world uses meters.
   */
  distanceUnit: 'feet' | 'meters';

  /**
   * Altitude unit. Feet is the ICAO standard for aviation worldwide,
   * but some national regulations reference meters.
   */
  altitudeUnit: 'feet' | 'meters';

  /**
   * Speed display unit.
   * - `mph` — miles per hour (US general public)
   * - `kph` — kilometers per hour (metric countries)
   * - `knots` — nautical miles per hour (aviation standard)
   */
  speedUnit: 'mph' | 'kph' | 'knots';

  /** Temperature display unit for weather overlays. */
  temperatureUnit: 'fahrenheit' | 'celsius';

  /** Weight unit for drone payload and MTOW specifications. */
  weightUnit: 'pounds' | 'kilograms' | 'grams';

  // --- Currency ---

  /**
   * How currency values are displayed in billing and reports.
   * - `symbol` — "$99.00"
   * - `code` — "USD 99.00"
   * - `name` — "99.00 US Dollar"
   */
  currencyDisplay: 'symbol' | 'code' | 'name';

  // --- Country Identity ---

  /**
   * ISO 3166-1 alpha-2 country code.
   * @example "US" | "KE" | "NG" | "GB"
   */
  countryCode: string;

  /**
   * Full country name for display.
   * @example "United States" | "Kenya" | "Nigeria"
   */
  countryName: string;

  /**
   * National flag emoji for compact UI display (mobile headers, dropdowns).
   * @example "\u{1F1FA}\u{1F1F8}" | "\u{1F1F0}\u{1F1EA}"
   */
  nationalFlagEmoji?: string;

  // --- Regulatory Terminology ---

  /**
   * Key-value map for replacing platform-default US/FAA terminology
   * with the tenant's national regulatory equivalent.
   *
   * The platform UI pipes all regulatory terms through this map
   * before rendering, so agencies can use their own vocabulary.
   *
   * @example
   * ```ts
   * {
   *   "LAANC": "SFOC",
   *   "FAA": "Transport Canada",
   *   "Part 107": "Advanced RPAS",
   *   "Remote ID": "Electronic Identification",
   *   "B4UFLY": "NAV CANADA Drone Site Selection"
   * }
   * ```
   */
  terminologyOverrides: Record<string, string>;
}

// ------------------------------------------------------------
// Email Branding
// ------------------------------------------------------------

/**
 * Email branding configuration for transactional and notification emails.
 *
 * Emails sent from the platform (flight approvals, compliance alerts,
 * registration confirmations) will use these branding settings.
 *
 * Custom "from" domains require DKIM and SPF record verification.
 */
export interface EmailBrandingConfig {
  /**
   * Display name in the "From" field of outgoing emails.
   * @example "Acme Drone Operations"
   * @example "Kenya Civil Aviation Authority"
   */
  fromName: string;

  /**
   * Email address in the "From" field. Must be on a verified domain.
   * @example "noreply@acme.com"
   * @example "notifications@kcaa.go.ke"
   */
  fromEmail: string;

  /**
   * Reply-to email address. If omitted, replies go to `fromEmail`.
   * @example "support@acme.com"
   */
  replyToEmail?: string;

  // --- Email Template Branding ---

  /** CDN URL for the logo in the email header. Recommended: 200px wide, PNG or SVG. */
  headerLogoUrl?: string;

  /**
   * Background color for the email header band.
   * @example "#1E40AF"
   */
  headerBackgroundColor: string;

  /**
   * Legal footer text appended to all outgoing emails.
   * Should include company name, address, and unsubscribe notice.
   * @example "Acme Drone Services, Inc. | 123 Main St, Austin, TX | Unsubscribe"
   */
  footerText: string;

  /** Social media links displayed in the email footer. */
  socialLinks?: SocialLink[];

  // --- Domain Verification ---

  /** Whether the custom email domain has been verified via DKIM + SPF. */
  emailDomainVerified: boolean;

  /** DKIM DNS record for email authentication. */
  dkimRecord?: DNSRecord;

  /** SPF DNS record for email authentication. */
  spfRecord?: DNSRecord;
}

/**
 * Social media link for email footers and the "About" page.
 */
export interface SocialLink {
  /** Social platform identifier. */
  platform: 'website' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'youtube';

  /**
   * Full URL to the social profile or website.
   * @example "https://twitter.com/acmedrones"
   */
  url: string;

  /**
   * Optional display label. If omitted, the platform name is used.
   * @example "Follow us on X"
   */
  label?: string;
}

// ------------------------------------------------------------
// Feature Flags
// ------------------------------------------------------------

/**
 * Feature flags controlling which white-label capabilities are enabled
 * for a given tenant. Gated by subscription tier (Enterprise vs Agency).
 *
 * These flags are enforced server-side in the API middleware and checked
 * client-side for UI rendering.
 */
export interface WhiteLabelFeatureFlags {
  /**
   * Whether the tenant can create sub-tenants (organizations) under their
   * white-label instance. Enables hierarchical multi-tenancy.
   * @tier Agency only
   */
  multiTenancy: boolean;

  /**
   * Whether the "Powered by Sky Warden" badge can be hidden.
   * @tier Enterprise: can hide. Agency: must show (contractual requirement).
   */
  hidePoweredBy: boolean;

  /**
   * Whether the tenant can upload custom PDF templates for compliance
   * certificates, flight reports, and registration documents.
   */
  customPdfTemplates: boolean;

  /** Whether the tenant can customize transactional email templates beyond branding. */
  customEmailTemplates: boolean;

  /** Whether the tenant gets API documentation hosted under their brand. */
  brandedApiDocs: boolean;

  /** Whether the tenant gets a full developer portal under their brand. */
  brandedDevPortal: boolean;

  /**
   * Whether the tenant can issue drone registrations under their authority name.
   * Critical for civil aviation agencies acting as the registration authority.
   * @tier Agency only
   */
  issueRegistrations: boolean;

  /**
   * Whether white-label mobile app branding is enabled.
   * @status Future — not yet implemented.
   */
  mobileAppBranding: boolean;

  /** Whether custom domain support is enabled for this tenant. */
  customDomainEnabled: boolean;

  /**
   * Maximum number of custom domains the tenant can configure.
   * @default 1 for Enterprise, 3 for Agency
   */
  maxCustomDomains: number;

  /**
   * Whether the tenant can upload their own SSL certificate
   * instead of using auto-provisioned Let's Encrypt certificates.
   * Required for some government/military deployments with PKI requirements.
   */
  bringOwnSSL: boolean;
}

// ------------------------------------------------------------
// Legal / Compliance
// ------------------------------------------------------------

/**
 * Legal and compliance footer configuration for a white-label tenant.
 * Controls what legal links and disclaimers appear in the platform UI
 * and in generated documents (PDFs, certificates, emails).
 */
export interface LegalConfig {
  /**
   * URL to the tenant's Terms of Service page.
   * @example "https://acme.com/legal/terms"
   */
  termsOfServiceUrl?: string;

  /**
   * URL to the tenant's Privacy Policy page.
   * @example "https://acme.com/legal/privacy"
   */
  privacyPolicyUrl?: string;

  /**
   * URL to the tenant's Acceptable Use Policy page.
   * @example "https://acme.com/legal/aup"
   */
  acceptableUseUrl?: string;

  /**
   * URL to the tenant's Data Processing Agreement.
   * Required for GDPR compliance in EU/UK markets.
   * @example "https://acme.com/legal/dpa"
   */
  dpaUrl?: string;

  /**
   * Copyright notice displayed in the UI footer.
   * @example "\u00A9 2026 Acme Drone Services. All rights reserved."
   * @example "\u00A9 2026 Kenya Civil Aviation Authority"
   */
  copyrightText: string;

  /**
   * Regulatory disclaimer displayed in the footer and on official documents.
   * @example "Authorized by the FAA as a LAANC USS provider"
   * @example "Licensed under the Kenya Civil Aviation Act, 2013"
   */
  regulatoryDisclaimer?: string;

  /**
   * Whether to show the Sky Warden platform copyright alongside the tenant's.
   * When true, footer shows both: "Powered by Sky Warden | (C) 2026 Acme Drone Services"
   */
  showPlatformCopyright: boolean;
}

// ------------------------------------------------------------
// Analytics
// ------------------------------------------------------------

/**
 * Third-party analytics and tracking configuration.
 * Allows tenants to add their own analytics to the white-label instance.
 *
 * Analytics scripts are injected into the HTML head and are subject
 * to Content Security Policy (CSP) rules.
 */
export interface AnalyticsConfig {
  /**
   * Google Analytics 4 measurement ID.
   * @example "G-XXXXXXXXXX"
   */
  ga4MeasurementId?: string;

  /**
   * Google Tag Manager container ID.
   * @example "GTM-XXXXXXX"
   */
  gtmContainerId?: string;

  /**
   * URL to a custom analytics/tracking script.
   * Must be served over HTTPS and pass CSP validation.
   * @example "https://analytics.acme.com/tracker.js"
   */
  customAnalyticsScript?: string;

  /**
   * Whether to require a cookie consent banner before loading analytics.
   * Should be `true` for tenants operating in GDPR/ePrivacy jurisdictions.
   */
  trackingConsent: boolean;
}

// ------------------------------------------------------------
// Core White-Label Config (Root Interface)
// ------------------------------------------------------------

/**
 * Root configuration object for a white-label tenant instance.
 *
 * This is the top-level object stored per-tenant in the database
 * and resolved by the edge proxy + React ThemeProvider at runtime.
 *
 * A complete WhiteLabelConfig defines everything needed to render
 * the platform under a custom brand: domain, logos, colors, fonts,
 * login page, dashboard chrome, email templates, legal footer,
 * localization settings, and feature flags.
 *
 * @example
 * ```ts
 * const config: WhiteLabelConfig = {
 *   id: 'wl_01HXYZ...',
 *   tenantId: 'tenant_acme_123',
 *   status: 'active',
 *   organizationName: 'Acme Drone Services',
 *   organizationShortName: 'AcmeDrone',
 *   tagline: 'Powering Safe Skies',
 *   subdomain: 'acme',
 *   branding: { ... },
 *   localization: { ... },
 *   emailConfig: { ... },
 *   featureFlags: { ... },
 *   legal: { ... },
 *   createdAt: '2026-01-15T08:00:00Z',
 *   updatedAt: '2026-03-20T12:30:00Z',
 * };
 * ```
 */
export interface WhiteLabelConfig {
  /** Unique identifier for this white-label configuration (ULID). */
  id: string;

  /** Tenant ID that owns this white-label configuration. Foreign key to tenants table. */
  tenantId: string;

  /** Current lifecycle status of this white-label instance. */
  status: WhiteLabelStatus;

  // === IDENTITY ===

  /**
   * Full organization name as displayed in the UI, documents, and emails.
   * @example "Acme Drone Services"
   * @example "Kenya Civil Aviation Authority"
   */
  organizationName: string;

  /**
   * Short/abbreviated organization name for compact UI contexts (mobile header, breadcrumbs).
   * @example "AcmeDrone"
   * @example "KCAA"
   */
  organizationShortName: string;

  /**
   * Optional tagline displayed on the login page and in marketing contexts.
   * @example "Powering Safe Skies"
   * @example "Securing Uganda's Airspace"
   */
  tagline?: string;

  /**
   * Legal entity name for invoices, compliance documents, and contracts.
   * May differ from the display name.
   * @example "Acme Drone Services, Inc."
   * @example "Republic of Kenya - Ministry of Transport"
   */
  legalEntityName?: string;

  // === DOMAIN ===

  /**
   * Custom domain configuration. Optional — only populated when the tenant
   * has configured and verified a custom domain.
   * @example { domain: 'drones.acme.com', status: 'active', ... }
   */
  customDomain?: CustomDomain;

  /**
   * Platform subdomain that is always available as a fallback.
   * Auto-generated from the organization short name during onboarding.
   * @example "acme" (resolves to acme.skywarden.app)
   */
  subdomain: string;

  // === BRANDING ===

  /** Complete visual branding configuration (logos, colors, typography, login page, dashboard). */
  branding: BrandingConfig;

  // === LOCALIZATION ===

  /** Regional and language settings. */
  localization: LocalizationConfig;

  // === EMAIL ===

  /** Email branding and domain verification settings. */
  emailConfig: EmailBrandingConfig;

  // === FEATURE FLAGS ===

  /** Feature flags controlling which white-label capabilities are enabled. */
  featureFlags: WhiteLabelFeatureFlags;

  // === FOOTER / LEGAL ===

  /** Legal links, copyright, and regulatory disclaimer configuration. */
  legal: LegalConfig;

  // === ANALYTICS ===

  /** Third-party analytics configuration. Optional. */
  analyticsConfig?: AnalyticsConfig;

  // === METADATA ===

  /** ISO 8601 timestamp of when this config was first created. */
  createdAt: string;

  /** ISO 8601 timestamp of the most recent update to any field. */
  updatedAt: string;

  /** ISO 8601 timestamp of when this config transitioned to 'active'. */
  activatedAt?: string;

  /**
   * ISO 8601 timestamp of the last successful domain + SSL verification check.
   * Verification runs automatically every 24 hours.
   */
  lastVerifiedAt?: string;
}

/**
 * Complete branding configuration encompassing logos, colors, typography,
 * favicon, PWA manifest, login page, dashboard chrome, and loading screen.
 */
export interface BrandingConfig {
  /** Selected branding preset, or 'custom' for fully tenant-defined branding. */
  preset: BrandingPreset;

  // === LOGOS ===

  /** Complete set of logo variants for different rendering contexts. */
  logos: LogoSet;

  // === COLORS ===

  /** Full color palette for theming the platform UI. */
  colors: ColorPalette;

  // === TYPOGRAPHY ===

  /** Font family and sizing configuration. */
  typography: TypographyConfig;

  // === FAVICON ===

  /**
   * URL for the browser tab favicon. Should be 32x32 .ico or .png.
   * @example "https://cdn.skywarden.app/tenants/acme/favicon.ico"
   */
  faviconUrl?: string;

  /**
   * URL for the Apple touch icon. Should be 180x180 .png.
   * Used when the site is saved to the iOS home screen.
   */
  appleTouchIconUrl?: string;

  // === APP MANIFEST (PWA) ===

  /**
   * Application name for the PWA manifest and browser "Add to Home Screen".
   * @example "Acme Drone Operations"
   */
  appName: string;

  /**
   * Short application name (max 12 chars) for the PWA home screen icon label.
   * @example "AcmeDrone"
   */
  appShortName: string;

  /** Description for the PWA manifest. */
  appDescription?: string;

  // === LOGIN PAGE ===

  /** Login/authentication page customization. */
  loginPage: LoginPageConfig;

  // === DASHBOARD ===

  /** Dashboard UI chrome customization (sidebar, header, nav, maps). */
  dashboardConfig: DashboardBrandingConfig;

  // === LOADING / SPLASH ===

  /**
   * CDN URL for the logo shown during the app loading spinner.
   * Recommended: square SVG or PNG, max 200x200.
   */
  loadingScreenLogo?: string;

  /**
   * Background color for the splash/loading screen.
   * @example "#0C0A09"
   */
  splashBackgroundColor?: string;
}

// ============================================================
// BRANDING PRESETS (Runtime Constants)
// ============================================================
//
// Pre-configured color palettes for common use cases. Tenants
// select a preset during onboarding and can customize from there.
// The `custom` preset requires all values to be provided manually.
// ============================================================

/** Pre-built branding presets with complete color palettes. */
export const BRANDING_PRESETS: Record<BrandingPreset, Partial<BrandingConfig>> = {
  /**
   * Aviation Dark — Amber-on-dark theme inspired by cockpit instruments and HUDs.
   * Best for: Commercial drone operators, night operations teams, aviation enthusiasts.
   */
  aviation_dark: {
    preset: 'aviation_dark',
    colors: {
      primary: '#F59E0B',
      primaryForeground: '#1C1917',
      primaryHover: '#D97706',
      secondary: '#1E40AF',
      secondaryForeground: '#FFFFFF',
      accent: '#F59E0B',
      accentForeground: '#1C1917',
      background: '#0C0A09',
      surfaceColor: '#1C1917',
      sidebarBackground: '#171412',
      sidebarForeground: '#D6D3D1',
      sidebarAccent: '#F59E0B',
      textPrimary: '#FAFAF9',
      textSecondary: '#A8A29E',
      textMuted: '#78716C',
      border: '#292524',
      borderHover: '#44403C',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      chartColors: ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1'],
    },
  },

  /**
   * Aviation Light — Professional blue theme with dark sidebar.
   * Best for: Enterprise fleet managers, insurance/compliance teams, corporate environments.
   */
  aviation_light: {
    preset: 'aviation_light',
    colors: {
      primary: '#1E40AF',
      primaryForeground: '#FFFFFF',
      primaryHover: '#1E3A8A',
      secondary: '#F59E0B',
      secondaryForeground: '#1C1917',
      accent: '#0EA5E9',
      accentForeground: '#FFFFFF',
      background: '#F8FAFC',
      surfaceColor: '#FFFFFF',
      sidebarBackground: '#0F172A',
      sidebarForeground: '#CBD5E1',
      sidebarAccent: '#3B82F6',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
      borderHover: '#CBD5E1',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      chartColors: ['#1E40AF', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1'],
    },
  },

  /**
   * Government Official — Navy/gold palette for civil aviation authorities.
   * Best for: FAA, KCAA, NCAA, SACAA, and other regulatory bodies.
   * Uses muted, authoritative colors with parchment-like backgrounds.
   */
  government_official: {
    preset: 'government_official',
    colors: {
      primary: '#1E3A5F',
      primaryForeground: '#FFFFFF',
      primaryHover: '#15304F',
      secondary: '#8B7355',
      secondaryForeground: '#FFFFFF',
      accent: '#C8A96E',
      accentForeground: '#1C1917',
      background: '#F5F5F0',
      surfaceColor: '#FFFFFF',
      sidebarBackground: '#1E3A5F',
      sidebarForeground: '#C8D6E5',
      sidebarAccent: '#C8A96E',
      textPrimary: '#1A1A1A',
      textSecondary: '#4A4A4A',
      textMuted: '#6B6B6B',
      border: '#D4D4D4',
      borderHover: '#A0A0A0',
      success: '#2D6A4F',
      warning: '#B8860B',
      danger: '#CC3333',
      info: '#2E6DA4',
      chartColors: ['#1E3A5F', '#C8A96E', '#2D6A4F', '#8B4513', '#4682B4', '#6B8E23', '#8B0000', '#483D8B'],
    },
  },

  /**
   * Corporate Blue — Standard corporate SaaS look.
   * Best for: Enterprise drone-as-a-service companies, surveying firms, logistics providers.
   */
  corporate_blue: {
    preset: 'corporate_blue',
    colors: {
      primary: '#2563EB',
      primaryForeground: '#FFFFFF',
      primaryHover: '#1D4ED8',
      secondary: '#7C3AED',
      secondaryForeground: '#FFFFFF',
      accent: '#06B6D4',
      accentForeground: '#FFFFFF',
      background: '#F9FAFB',
      surfaceColor: '#FFFFFF',
      sidebarBackground: '#111827',
      sidebarForeground: '#D1D5DB',
      sidebarAccent: '#3B82F6',
      textPrimary: '#111827',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF',
      border: '#E5E7EB',
      borderHover: '#D1D5DB',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
      chartColors: ['#2563EB', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#F97316', '#6366F1'],
    },
  },

  /**
   * Military Green — Tactical olive/tan palette for defense operations.
   * Best for: Military drone units, defense contractors, border security agencies.
   * Dark theme with subdued, field-appropriate colors.
   */
  military_green: {
    preset: 'military_green',
    colors: {
      primary: '#4D5D35',
      primaryForeground: '#FFFFFF',
      primaryHover: '#3D4A2A',
      secondary: '#8B7355',
      secondaryForeground: '#FFFFFF',
      accent: '#B8860B',
      accentForeground: '#1C1917',
      background: '#1A1A18',
      surfaceColor: '#252520',
      sidebarBackground: '#1A1A18',
      sidebarForeground: '#A0A090',
      sidebarAccent: '#6B8E23',
      textPrimary: '#E8E8D8',
      textSecondary: '#A0A090',
      textMuted: '#707060',
      border: '#333330',
      borderHover: '#4A4A40',
      success: '#6B8E23',
      warning: '#DAA520',
      danger: '#CD5C5C',
      info: '#4682B4',
      chartColors: ['#6B8E23', '#4682B4', '#DAA520', '#8B7355', '#CD853F', '#4D5D35', '#8B0000', '#2F4F4F'],
    },
  },

  /**
   * Custom — Fully tenant-defined. All color and typography values must be provided.
   * No defaults are applied; validation ensures completeness before activation.
   */
  custom: {
    preset: 'custom',
  },
} as const;

// ============================================================
// COUNTRY / REGULATORY AUTHORITY DATA
// ============================================================

/**
 * Country and aviation regulatory authority reference data.
 * Used for localization configuration, login page flag display,
 * and regulatory terminology mapping.
 */
export interface CountryFlag {
  /** ISO 3166-1 alpha-2 country code. */
  code: string;

  /** Full country name in English. */
  name: string;

  /** Flag emoji for compact display. */
  emoji: string;

  /** Full name of the national civil aviation regulatory authority. */
  regulatoryAuthority: string;

  /** Acronym/abbreviation of the regulatory authority. */
  regulatoryAcronym: string;
}

/**
 * Countries with active UAV/drone regulatory frameworks that are
 * supported by the C6mac Sky Warden platform for white-label deployment.
 *
 * This list covers the initial target markets across North America,
 * Africa, Europe, Asia-Pacific, Middle East, and South America.
 */
export const SUPPORTED_COUNTRIES: CountryFlag[] = [
  { code: 'US', name: 'United States', emoji: '\u{1F1FA}\u{1F1F8}', regulatoryAuthority: 'Federal Aviation Administration', regulatoryAcronym: 'FAA' },
  { code: 'CA', name: 'Canada', emoji: '\u{1F1E8}\u{1F1E6}', regulatoryAuthority: 'Transport Canada Civil Aviation', regulatoryAcronym: 'TCCA' },
  { code: 'NG', name: 'Nigeria', emoji: '\u{1F1F3}\u{1F1EC}', regulatoryAuthority: 'Nigerian Civil Aviation Authority', regulatoryAcronym: 'NCAA' },
  { code: 'KE', name: 'Kenya', emoji: '\u{1F1F0}\u{1F1EA}', regulatoryAuthority: 'Kenya Civil Aviation Authority', regulatoryAcronym: 'KCAA' },
  { code: 'ZA', name: 'South Africa', emoji: '\u{1F1FF}\u{1F1E6}', regulatoryAuthority: 'South African Civil Aviation Authority', regulatoryAcronym: 'SACAA' },
  { code: 'GH', name: 'Ghana', emoji: '\u{1F1EC}\u{1F1ED}', regulatoryAuthority: 'Ghana Civil Aviation Authority', regulatoryAcronym: 'GCAA' },
  { code: 'RW', name: 'Rwanda', emoji: '\u{1F1F7}\u{1F1FC}', regulatoryAuthority: 'Rwanda Civil Aviation Authority', regulatoryAcronym: 'RCAA' },
  { code: 'TZ', name: 'Tanzania', emoji: '\u{1F1F9}\u{1F1FF}', regulatoryAuthority: 'Tanzania Civil Aviation Authority', regulatoryAcronym: 'TCAA' },
  { code: 'UG', name: 'Uganda', emoji: '\u{1F1FA}\u{1F1EC}', regulatoryAuthority: 'Uganda Civil Aviation Authority', regulatoryAcronym: 'UCAA' },
  { code: 'ET', name: 'Ethiopia', emoji: '\u{1F1EA}\u{1F1F9}', regulatoryAuthority: 'Ethiopian Civil Aviation Authority', regulatoryAcronym: 'ECAA' },
  { code: 'SN', name: 'Senegal', emoji: '\u{1F1F8}\u{1F1F3}', regulatoryAuthority: 'Agence Nationale de l\'Aviation Civile', regulatoryAcronym: 'ANACIM' },
  { code: 'CI', name: 'C\u00F4te d\'Ivoire', emoji: '\u{1F1E8}\u{1F1EE}', regulatoryAuthority: 'Autorit\u00E9 Nationale de l\'Aviation Civile', regulatoryAcronym: 'ANAC' },
  { code: 'GB', name: 'United Kingdom', emoji: '\u{1F1EC}\u{1F1E7}', regulatoryAuthority: 'Civil Aviation Authority', regulatoryAcronym: 'CAA' },
  { code: 'FR', name: 'France', emoji: '\u{1F1EB}\u{1F1F7}', regulatoryAuthority: 'Direction G\u00E9n\u00E9rale de l\'Aviation Civile', regulatoryAcronym: 'DGAC' },
  { code: 'DE', name: 'Germany', emoji: '\u{1F1E9}\u{1F1EA}', regulatoryAuthority: 'Luftfahrt-Bundesamt', regulatoryAcronym: 'LBA' },
  { code: 'AU', name: 'Australia', emoji: '\u{1F1E6}\u{1F1FA}', regulatoryAuthority: 'Civil Aviation Safety Authority', regulatoryAcronym: 'CASA' },
  { code: 'AE', name: 'United Arab Emirates', emoji: '\u{1F1E6}\u{1F1EA}', regulatoryAuthority: 'General Civil Aviation Authority', regulatoryAcronym: 'GCAA' },
  { code: 'IN', name: 'India', emoji: '\u{1F1EE}\u{1F1F3}', regulatoryAuthority: 'Directorate General of Civil Aviation', regulatoryAcronym: 'DGCA' },
  { code: 'BR', name: 'Brazil', emoji: '\u{1F1E7}\u{1F1F7}', regulatoryAuthority: 'Ag\u00EAncia Nacional de Avia\u00E7\u00E3o Civil', regulatoryAcronym: 'ANAC' },
  { code: 'JP', name: 'Japan', emoji: '\u{1F1EF}\u{1F1F5}', regulatoryAuthority: 'Japan Civil Aviation Bureau', regulatoryAcronym: 'JCAB' },
] as const;
