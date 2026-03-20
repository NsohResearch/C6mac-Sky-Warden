/**
 * C6macEye — Sky Warden Monetization & Subscription Engine
 *
 * Type definitions for the dual-revenue billing system:
 *   Stream 1: Platform Revenue (SaaS subscriptions, API metering, add-ons)
 *   Stream 2: Government Revenue (drone registration, authorization fees, penalties)
 *
 * All monetary values are expressed in the **smallest currency unit**:
 *   USD → cents, CAD → cents, NGN → kobo, KES → cents,
 *   ZAR → cents, GHS → pesewas, RWF → centimes,
 *   TZS → cents, ETB → santim, XOF → centimes, UGX → cents
 */

// ============================================================
// ENUMS & UNION TYPES
// ============================================================

/** Subscription plan tiers aligned with the four personas plus a developer tier. */
export type PlanTier = 'free' | 'pro' | 'enterprise' | 'agency' | 'developer';

/** Billing frequency for subscriptions. Annual billing receives a discount. */
export type BillingCycle = 'monthly' | 'annual';

/** Lifecycle states of a subscription. */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'trialing'
  | 'paused'
  | 'expired';

/** Payment processing states. */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'disputed';

/**
 * Accepted payment methods across operating regions.
 * `mobile_money` covers M-Pesa, MTN Mobile Money, Airtel Money, Orange Money, etc.
 */
export type PaymentMethod =
  | 'credit_card'
  | 'bank_transfer'
  | 'mobile_money'
  | 'paypal'
  | 'wire_transfer'
  | 'invoice';

/**
 * Supported currencies.
 * - USD/CAD: North America
 * - NGN/KES/ZAR/GHS/RWF/TZS/ETB/XOF/UGX: Africa
 */
export type Currency =
  | 'USD'
  | 'CAD'
  | 'NGN'
  | 'KES'
  | 'ZAR'
  | 'GHS'
  | 'RWF'
  | 'TZS'
  | 'ETB'
  | 'XOF'
  | 'UGX';

// ============================================================
// SUBSCRIPTION & BILLING TYPES
// ============================================================

/** Full plan definition including features, limits, and regional pricing. */
export interface PlanDefinition {
  /** Unique plan tier identifier. */
  tier: PlanTier;
  /** Human-readable plan name (e.g., "Professional"). */
  name: string;
  /** Short marketing description of the plan. */
  description: string;
  /** List of feature bullet points displayed on the pricing page. */
  features: string[];
  /** Quantitative limits enforced by the platform for this plan. */
  limits: PlanLimits;
  /** Per-currency pricing entries. */
  pricing: PlanPricing[];
  /** Whether the plan should be visually highlighted as recommended. */
  recommended?: boolean;
  /** Marketing badge text (e.g., "Most Popular", "Best Value"). */
  badge?: string;
}

/** Quantitative limits enforced per subscription plan. Use `-1` for unlimited. */
export interface PlanLimits {
  /** Maximum number of drones that can be registered. `-1` = unlimited. */
  maxDrones: number;
  /** Maximum number of pilot seats. `-1` = unlimited. */
  maxPilots: number;
  /** Maximum missions per billing period. `-1` = unlimited. */
  maxMissionsPerMonth: number;
  /** Maximum flight hours per billing period. `-1` = unlimited. */
  maxFlightHoursPerMonth: number;
  /** Maximum API calls per hour. `0` = API access disabled. `-1` = unlimited. */
  maxApiCallsPerHour: number;
  /** Maximum cloud storage in gigabytes. */
  maxStorageGb: number;
  /** Maximum LAANC/SFOC authorizations per billing period. `-1` = unlimited. */
  laancAuthorizationsPerMonth: number;
  /** Access to advanced analytics dashboards. */
  advancedAnalytics: boolean;
  /** Access to compliance reporting tools. */
  complianceReporting: boolean;
  /** Ability to define custom RBAC roles. */
  customRoles: boolean;
  /** SSO/SAML integration support. */
  ssoEnabled: boolean;
  /** Priority support queue access. */
  prioritySupport: boolean;
  /** Dedicated account manager assignment. */
  dedicatedAccountManager: boolean;
  /** White-label / custom branding capability. */
  whiteLabel: boolean;
  /** Webhook configuration access. */
  webhooks: boolean;
  /** Access to a sandbox environment for testing. */
  sandboxEnvironment: boolean;
  /** Number of days audit logs are retained. `-1` = unlimited. */
  auditLogRetentionDays: number;
  /** Maximum team members / seats. `-1` = unlimited. */
  teamMembers: number;
}

/** Per-currency pricing for a plan tier. All amounts in smallest currency unit. */
export interface PlanPricing {
  /** Currency code. */
  currency: Currency;
  /** Monthly subscription price in smallest currency unit (e.g., cents). */
  monthlyPrice: number;
  /** Annual subscription price in smallest currency unit (full year, discounted). */
  annualPrice: number;
  /** Annual drone registration fee charged per drone in smallest currency unit. */
  registrationFeePerDrone: number;
  /** Per-transaction fee for each LAANC/SFOC authorization submission. */
  perAuthorizationFee: number;
  /** One-time setup fee (typically for Enterprise/Agency tiers). */
  setupFee?: number;
}

/** A tenant's active subscription record. */
export interface Subscription {
  /** Unique subscription identifier (UUID). */
  id: string;
  /** Tenant that owns this subscription. */
  tenantId: string;
  /** Current plan tier. */
  planTier: PlanTier;
  /** Current lifecycle status. */
  status: SubscriptionStatus;
  /** Whether the tenant pays monthly or annually. */
  billingCycle: BillingCycle;
  /** Currency locked at subscription creation. */
  currency: Currency;

  // --- Pricing locked at subscription time ---

  /** Start of the current billing period (ISO 8601). */
  currentPeriodStart: string;
  /** End of the current billing period (ISO 8601). */
  currentPeriodEnd: string;
  /** Monthly amount in smallest currency unit, locked at subscription time. */
  monthlyAmount: number;
  /** Annual amount in smallest currency unit, locked at subscription time. */
  annualAmount: number;

  // --- Trial ---

  /** Trial period start (ISO 8601). */
  trialStart?: string;
  /** Trial period end (ISO 8601). */
  trialEnd?: string;

  // --- Payment ---

  /** ID of the default payment method on file. */
  paymentMethodId?: string;
  /** Date of the last successful payment (ISO 8601). */
  lastPaymentDate?: string;
  /** Date of the next scheduled payment (ISO 8601). */
  nextPaymentDate?: string;
  /** Outstanding past-due amount in smallest currency unit. */
  pastDueAmount?: number;

  // --- Usage ---

  /** Aggregated usage metrics for the current billing period. */
  currentUsage: UsageMetrics;

  // --- External payment processor ---

  /** External subscription ID (e.g., Stripe `sub_xxx`). */
  externalSubscriptionId?: string;
  /** External customer ID (e.g., Stripe `cus_xxx`). */
  externalCustomerId?: string;

  // --- Cancellation ---

  /** Timestamp when the subscription was cancelled (ISO 8601). */
  cancelledAt?: string;
  /** Reason provided for cancellation. */
  cancelReason?: string;

  /** Record creation timestamp (ISO 8601). */
  createdAt: string;
  /** Last update timestamp (ISO 8601). */
  updatedAt: string;
}

/** Aggregated usage metrics for a billing period. */
export interface UsageMetrics {
  /** Number of drones currently registered under this subscription. */
  dronesRegistered: number;
  /** Number of pilots with activity this period. */
  activePilots: number;
  /** Total missions flown this billing period. */
  missionsThisPeriod: number;
  /** Total flight hours this billing period. */
  flightHoursThisPeriod: number;
  /** API calls made in the current clock hour (for rate limiting). */
  apiCallsThisHour: number;
  /** Total API calls this billing period (for metered billing). */
  apiCallsThisPeriod: number;
  /** Cloud storage consumed in gigabytes. */
  storageUsedGb: number;
  /** LAANC/SFOC authorizations submitted this billing period. */
  authorizationsThisPeriod: number;
}

// ============================================================
// INVOICING
// ============================================================

/** An invoice issued to a tenant. */
export interface Invoice {
  /** Unique invoice identifier (UUID). */
  id: string;
  /** Tenant that owes/paid this invoice. */
  tenantId: string;
  /** Associated subscription ID. */
  subscriptionId: string;
  /** Sequential invoice number (e.g., SKW-INV-2026-000001). */
  invoiceNumber: string;
  /** Payment status of the invoice. */
  status: PaymentStatus;
  /** Invoice currency. */
  currency: Currency;

  // --- Line items ---

  /** Itemized charges on this invoice. */
  lineItems: InvoiceLineItem[];
  /** Sum of all line items before tax, in smallest currency unit. */
  subtotal: number;
  /** Tax amount in smallest currency unit. */
  taxAmount: number;
  /** Applicable tax rate as a percentage (e.g., 7.5 for 7.5%). */
  taxRate: number;
  /** Portion of the invoice that is government fees (registration, auth, penalties). */
  governmentFees: number;
  /** Portion of the invoice that is platform revenue (subscription, add-ons). */
  platformFees: number;
  /** Total amount due in smallest currency unit. */
  totalAmount: number;

  // --- Dates ---

  /** Date the invoice was issued (ISO 8601). */
  issuedAt: string;
  /** Payment due date (ISO 8601). */
  dueDate: string;
  /** Date the invoice was paid (ISO 8601). */
  paidAt?: string;

  // --- Payment ---

  /** Payment method used to settle this invoice. */
  paymentMethod?: PaymentMethod;
  /** Payment processor reference / transaction ID. */
  paymentReference?: string;
  /** URL to the payment receipt. */
  receiptUrl?: string;

  // --- Documents ---

  /** URL to the generated PDF invoice. */
  pdfUrl?: string;

  /** Record creation timestamp (ISO 8601). */
  createdAt: string;
}

/** A single line item on an invoice. */
export interface InvoiceLineItem {
  /** Unique line item identifier (UUID). */
  id: string;
  /** Human-readable description of the charge. */
  description: string;
  /** Charge category for reporting and revenue splitting. */
  category:
    | 'subscription'
    | 'registration'
    | 'authorization'
    | 'api_usage'
    | 'addon'
    | 'government_fee'
    | 'penalty';
  /** Number of units billed (e.g., number of API calls, number of drones). */
  quantity: number;
  /** Price per unit in smallest currency unit. */
  unitPrice: number;
  /** Total price for this line item in smallest currency unit. */
  totalPrice: number;
  /** Whether this line item is subject to tax. */
  taxable: boolean;
  /** Which party receives the revenue from this line item. */
  revenueRecipient: 'platform' | 'government';
  /** Arbitrary metadata (e.g., drone ID, authorization reference). */
  metadata?: Record<string, unknown>;
}

// ============================================================
// PAYMENT METHODS
// ============================================================

/** A payment method stored on file for a tenant. */
export interface PaymentMethodRecord {
  /** Unique payment method identifier (UUID). */
  id: string;
  /** Tenant that owns this payment method. */
  tenantId: string;
  /** Type of payment method. */
  type: PaymentMethod;
  /** Whether this is the tenant's default payment method. */
  isDefault: boolean;

  // --- Card details (masked) ---

  /** Card network brand (e.g., "visa", "mastercard", "amex"). */
  cardBrand?: string;
  /** Last 4 digits of the card number. */
  cardLast4?: string;
  /** Card expiration month (1-12). */
  cardExpMonth?: number;
  /** Card expiration year (4-digit). */
  cardExpYear?: number;

  // --- Bank transfer ---

  /** Name of the bank. */
  bankName?: string;
  /** Last 4 digits of the bank account number. */
  accountLast4?: string;

  // --- Mobile money (Africa) ---

  /** Mobile money provider identifier (e.g., "mpesa", "mtn_momo", "airtel_money", "orange_money"). */
  mobileProvider?: string;
  /** Mobile phone number (masked, e.g., "+254***XXX"). */
  mobileNumber?: string;

  // --- External processor ---

  /** External payment method ID (e.g., Stripe `pm_xxx`). */
  externalPaymentMethodId?: string;

  /** Record creation timestamp (ISO 8601). */
  createdAt: string;
}

// ============================================================
// DRONE REGISTRATION TYPES (automobile-style registration)
// ============================================================

/** Type of drone registration. */
export type RegistrationType =
  | 'standard'
  | 'commercial'
  | 'government'
  | 'educational'
  | 'temporary';

/** Lifecycle states of a drone registration. */
export type RegistrationStatus =
  | 'pending_payment'
  | 'pending_review'
  | 'active'
  | 'expired'
  | 'suspended'
  | 'revoked'
  | 'transferred';

/** Types of temporary permits for non-resident or short-term operators. */
export type TemporaryPermitType =
  | 'tourist'
  | 'researcher'
  | 'temporary_operator'
  | 'event';

/**
 * A drone registration record.
 *
 * Every drone on the platform receives a Digital Drone ID (DDID),
 * functioning like a vehicle license plate (e.g., SKW-US-A7B3X9).
 */
export interface DroneRegistration {
  /** Unique registration record identifier (UUID). */
  id: string;
  /** Tenant that owns the registration. */
  tenantId: string;
  /** Reference to the drone in the fleet management system. */
  droneId: string;
  /** User ID of the registration owner. */
  ownerId: string;

  // --- Digital Drone ID ---

  /**
   * Digital Drone ID — the primary short identifier (like a license plate).
   * Format: SKW-{country}-{6 alphanumeric} (e.g., SKW-US-A7B3X9).
   */
  digitalDroneId: string;
  /**
   * Full registration number including year.
   * Format: SKW-{country}-{year}-{6 alphanumeric} (e.g., SKW-US-2026-A7B3X9).
   */
  registrationNumber: string;
  /** ISO 3166-1 alpha-2 region code (e.g., "US", "CA", "NG"). */
  region: string;
  /** Full country name. */
  country: string;
  /** Name of the regulatory authority (e.g., "FAA", "Transport Canada", "NCAA"). */
  regulatoryAuthority: string;

  // --- Registration type ---

  /** Classification of the registration. */
  registrationType: RegistrationType;
  /** Temporary permit subtype. Only set when `registrationType === 'temporary'`. */
  temporaryPermitType?: TemporaryPermitType;

  // --- Validity ---

  /** Date the registration was issued (ISO 8601). */
  issuedAt: string;
  /** Date the registration expires (ISO 8601). Standard = 1 year; temporary = varies. */
  expiresAt: string;
  /** Whether a renewal reminder email has been sent. */
  renewalReminderSent: boolean;
  /** Whether the registration is set to auto-renew before expiry. */
  autoRenew: boolean;

  // --- Drone details snapshot (frozen at time of registration) ---

  /** Drone manufacturer (e.g., "DJI", "Skydio"). */
  droneManufacturer: string;
  /** Drone model (e.g., "Mavic 3 Enterprise"). */
  droneModel: string;
  /** Manufacturer serial number. */
  droneSerialNumber: string;
  /** Size category: "micro", "small", "medium", "large". */
  droneCategory: string;
  /** Drone weight in grams (including battery, no payload). */
  droneWeightGrams: number;
  /** Remote ID serial number (14 CFR Part 89 compliance). */
  remoteIdSerial?: string;

  // --- Owner details snapshot (frozen at time of registration) ---

  /** Registered owner's full name. */
  ownerName: string;
  /** Registered owner's email address. */
  ownerEmail: string;
  /** Registered owner's mailing address. */
  ownerAddress?: string;
  /** Type of identification document (e.g., "passport", "driver_license", "national_id"). */
  ownerIdType?: string;
  /** Identification document number (masked for security). */
  ownerIdNumber?: string;

  // --- Fees ---

  /** Registration fee in smallest currency unit. */
  registrationFee: number;
  /** Currency of the registration fee. */
  currency: Currency;
  /** Date the fee was paid (ISO 8601). */
  feePaidAt?: string;
  /** Invoice ID for the registration fee payment. */
  feeInvoiceId?: string;
  /** Portion of the fee remitted to the government (smallest currency unit). */
  governmentPortionFee: number;
  /** Portion of the fee retained by the platform (smallest currency unit). */
  platformPortionFee: number;

  // --- Status ---

  /** Current registration status. */
  status: RegistrationStatus;
  /** Reason for suspension, if applicable. */
  suspensionReason?: string;
  /** Reason for revocation, if applicable. */
  revocationReason?: string;

  // --- Transfer (drone sold / ownership change) ---

  /** ID of the previous registration record if this is a transfer. */
  previousRegistrationId?: string;
  /** User ID of the previous owner. */
  transferredFrom?: string;
  /** Date ownership was transferred (ISO 8601). */
  transferredAt?: string;

  // --- Verification artifacts ---

  /** URL to a QR code image that links to the public verification page. */
  qrCodeUrl?: string;
  /** URL to the PDF certificate of registration. */
  certificateUrl?: string;
  /** 6-character verification code for quick lookups (e.g., V-A7B3X9). */
  verificationCode: string;
  /** Whether this registration can be verified by the public via DDID lookup. */
  publiclyVerifiable: boolean;

  /** Record creation timestamp (ISO 8601). */
  createdAt: string;
  /** Last update timestamp (ISO 8601). */
  updatedAt: string;
}

// ============================================================
// TEMPORARY PERMITS
// ============================================================

/** Type of applicant requesting a temporary permit. */
export type TemporaryPermitApplicantType =
  | 'tourist'
  | 'researcher'
  | 'commercial_visitor'
  | 'event_organizer'
  | 'ngo'
  | 'media';

/** Lifecycle states for temporary permit applications. */
export type TemporaryPermitStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'denied'
  | 'active'
  | 'expired'
  | 'revoked';

/**
 * A temporary operating permit for non-residents and short-term operators.
 *
 * Permit durations:
 * - Tourist Pass: 7 days
 * - Researcher Permit: 30 days
 * - Temporary Operator: 90 days
 * - Event Permit: 1-3 days (single event)
 */
export interface TemporaryPermit {
  /** Unique permit identifier (UUID). */
  id: string;
  /** Associated drone registration ID. */
  registrationId: string;
  /** Type of temporary permit. */
  permitType: TemporaryPermitType;
  /** Category of the applicant. */
  applicantType: TemporaryPermitApplicantType;

  // --- Applicant information (may not have a local platform account) ---

  /** Applicant's full legal name. */
  applicantName: string;
  /** Applicant's email address. */
  applicantEmail: string;
  /** Applicant's phone number (with country code). */
  applicantPhone: string;
  /** Applicant's nationality (ISO 3166-1 alpha-2). */
  applicantNationality: string;
  /** Passport number for non-residents (masked). */
  passportNumber?: string;
  /** Visa number if applicable (masked). */
  visaNumber?: string;
  /** Local contact person's name (required in some jurisdictions). */
  localContactName?: string;
  /** Local contact person's phone number. */
  localContactPhone?: string;

  // --- Permit details ---

  /** Stated purpose of the drone operations. */
  purpose: string;
  /** Detailed description of planned operations. */
  operationDescription: string;
  /** List of planned operation locations (human-readable). */
  operationLocations: string[];
  /** GeoJSON geometry defining the operation area, if applicable. */
  operationArea?: unknown;

  // --- Duration ---

  /** Structured duration information. */
  duration: TemporaryPermitDuration;
  /** Permit validity start date (ISO 8601). */
  startDate: string;
  /** Permit validity end date (ISO 8601). */
  endDate: string;

  // --- Covered drones ---

  /** IDs of drone registrations covered by this permit. */
  droneRegistrationIds: string[];

  // --- Fees ---

  /** Permit fee in smallest currency unit. */
  permitFee: number;
  /** Fee currency. */
  currency: Currency;
  /** Refundable security deposit in smallest currency unit. */
  securityDeposit?: number;
  /** Whether the security deposit has been refunded. */
  depositRefunded?: boolean;

  // --- Approval workflow ---

  /** Current permit application status. */
  status: TemporaryPermitStatus;
  /** User ID of the reviewer who processed the application. */
  reviewedBy?: string;
  /** Conditions attached to the approval (e.g., altitude limits, time restrictions). */
  approvalConditions?: string[];
  /** Reason for denial, if applicable. */
  denialReason?: string;

  // --- Required documents ---

  /** Documents required for this permit application. */
  requiredDocuments: PermitDocument[];

  /** Record creation timestamp (ISO 8601). */
  createdAt: string;
  /** Last update timestamp (ISO 8601). */
  updatedAt: string;
}

/** Duration configuration for a temporary permit. */
export interface TemporaryPermitDuration {
  /** Permit type that determines the base duration. */
  type: TemporaryPermitType;
  /** Duration in days (tourist=7, researcher=30, temporary_operator=90, event=1-3). */
  days: number;
  /** Maximum number of times this permit can be renewed. */
  maxRenewals: number;
  /** Number of times this permit has already been renewed. */
  renewalCount: number;
}

/** Types of documents that may be required for permit applications. */
export type PermitDocumentType =
  | 'passport'
  | 'visa'
  | 'insurance'
  | 'pilot_license'
  | 'organization_letter'
  | 'research_proposal'
  | 'event_permit'
  | 'local_authority_approval';

/** A document required as part of a temporary permit application. */
export interface PermitDocument {
  /** Type of document. */
  type: PermitDocumentType;
  /** Human-readable label (e.g., "Valid Passport Copy"). */
  label: string;
  /** Whether this document is mandatory for the application. */
  required: boolean;
  /** Whether the document has been uploaded. */
  uploaded: boolean;
  /** URL to the uploaded document file. */
  fileUrl?: string;
  /** Timestamp when the document was uploaded (ISO 8601). */
  uploadedAt?: string;
  /** Timestamp when the document was verified by a reviewer (ISO 8601). */
  verifiedAt?: string;
  /** User ID of the reviewer who verified the document. */
  verifiedBy?: string;
}

// ============================================================
// REGISTRATION FEE SCHEDULES
// ============================================================

/**
 * Fee schedule for drone registration in a specific region.
 * Defines fees, late penalties, and the revenue split between government and platform.
 */
export interface RegistrationFeeSchedule {
  /** ISO 3166-1 alpha-2 region code (e.g., "US", "NG"). */
  region: string;
  /** Local currency for fees in this region. */
  currency: Currency;
  /** Annual registration fee for recreational / standard use (smallest currency unit). */
  standardAnnualFee: number;
  /** Annual registration fee for commercial operations (smallest currency unit). */
  commercialAnnualFee: number;
  /** Annual registration fee for government drones (typically waived = 0). */
  governmentFee: number;
  /** Annual registration fee for educational institutions (reduced rate). */
  educationalFee: number;
  /** Fee schedule for temporary permits. All in smallest currency unit. */
  temporaryFees: {
    /** 7-day tourist pass fee. */
    tourist7Day: number;
    /** 30-day researcher permit fee. */
    researcher30Day: number;
    /** 90-day temporary operator fee. */
    temporaryOperator90Day: number;
    /** Per-day event permit fee. */
    eventPerDay: number;
  };
  /** Late renewal penalty as a whole-number percentage (e.g., 25 = 25%). */
  lateFeePercentage: number;
  /** Fee for transferring registration to a new owner (smallest currency unit). */
  transferFee: number;
  /** Fee for a replacement certificate (smallest currency unit). */
  replacementFee: number;
  /** Fraction of fees remitted to the government (e.g., 0.70 = 70%). */
  governmentRevenueSplit: number;
  /** Fraction of fees retained by the platform (e.g., 0.30 = 30%). */
  platformRevenueSplit: number;
}

// ============================================================
// GOVERNMENT REVENUE TRACKING
// ============================================================

/** Category of government revenue. */
export type GovernmentRevenueCategory =
  | 'registration'
  | 'authorization'
  | 'certification'
  | 'penalty'
  | 'exam';

/**
 * An individual government revenue record.
 * Tracks money collected on behalf of regulatory authorities and its disbursement status.
 */
export interface GovernmentRevenueRecord {
  /** Unique record identifier (UUID). */
  id: string;
  /** Region code where the revenue was generated. */
  region: string;
  /** Name of the regulatory authority that receives the funds. */
  regulatoryAuthority: string;
  /** Revenue category. */
  category: GovernmentRevenueCategory;
  /** Human-readable description of the charge. */
  description: string;
  /** Gross amount collected in smallest currency unit. */
  grossAmount: number;
  /** Platform commission / processing fee retained (smallest currency unit). */
  platformCommission: number;
  /** Net amount payable to the government (smallest currency unit). */
  governmentAmount: number;
  /** Currency of all amounts in this record. */
  currency: Currency;
  /** Reference ID linking to the source record (registration, authorization, etc.). */
  referenceId: string;
  /** Type of the referenced entity (e.g., "drone_registration", "laanc_authorization"). */
  referenceType: string;
  /** Tenant that generated this revenue. */
  tenantId: string;
  /** User associated with this charge. */
  userId: string;
  /** Whether the government portion has been disbursed. */
  disbursed: boolean;
  /** Date the funds were disbursed to the government (ISO 8601). */
  disbursedAt?: string;
  /** Wire transfer or payment reference for the disbursement. */
  disbursementReference?: string;
  /** Start of the reporting period this record falls in (ISO 8601). */
  periodStart: string;
  /** End of the reporting period this record falls in (ISO 8601). */
  periodEnd: string;
  /** Record creation timestamp (ISO 8601). */
  createdAt: string;
}

/** Disbursement method for sending funds to government entities. */
export type DisbursementMethod =
  | 'wire_transfer'
  | 'ach'
  | 'eft'
  | 'mobile_money';

/** Status of a government disbursement batch. */
export type DisbursementStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

/**
 * A batch disbursement of collected government revenue.
 * Groups multiple `GovernmentRevenueRecord` entries into a single payment.
 */
export interface GovernmentDisbursement {
  /** Unique disbursement identifier (UUID). */
  id: string;
  /** Region code for this disbursement. */
  region: string;
  /** Regulatory authority receiving the funds. */
  regulatoryAuthority: string;
  /** Start of the period covered by this disbursement (ISO 8601). */
  periodStart: string;
  /** End of the period covered by this disbursement (ISO 8601). */
  periodEnd: string;
  /** Total amount being disbursed in smallest currency unit. */
  totalAmount: number;
  /** Currency of the disbursement. */
  currency: Currency;
  /** Number of individual revenue records included in this batch. */
  recordCount: number;
  /** Processing status of the disbursement. */
  status: DisbursementStatus;
  /** Method used to send the funds. */
  disbursementMethod: DisbursementMethod;
  /** External payment reference (e.g., wire transfer confirmation number). */
  reference?: string;
  /** Date the disbursement was completed (ISO 8601). */
  completedAt?: string;
  /** Record creation timestamp (ISO 8601). */
  createdAt: string;
}

// ============================================================
// PLAN DEFINITIONS (constants)
// ============================================================

/** Pre-configured plan definitions for all subscription tiers. */
export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'Starter',
    description: 'For hobbyist pilots getting started',
    features: [
      'Up to 3 drones',
      'Basic airspace checks',
      '5 LAANC authorizations/month',
      '10 missions/month',
      'Basic flight logging',
      'Email support',
    ],
    limits: {
      maxDrones: 3,
      maxPilots: 1,
      maxMissionsPerMonth: 10,
      maxFlightHoursPerMonth: 20,
      maxApiCallsPerHour: 0,
      maxStorageGb: 1,
      laancAuthorizationsPerMonth: 5,
      advancedAnalytics: false,
      complianceReporting: false,
      customRoles: false,
      ssoEnabled: false,
      prioritySupport: false,
      dedicatedAccountManager: false,
      whiteLabel: false,
      webhooks: false,
      sandboxEnvironment: false,
      auditLogRetentionDays: 30,
      teamMembers: 1,
    },
    pricing: [
      { currency: 'USD', monthlyPrice: 0, annualPrice: 0, registrationFeePerDrone: 500, perAuthorizationFee: 0 },
      { currency: 'CAD', monthlyPrice: 0, annualPrice: 0, registrationFeePerDrone: 675, perAuthorizationFee: 0 },
      { currency: 'NGN', monthlyPrice: 0, annualPrice: 0, registrationFeePerDrone: 75000, perAuthorizationFee: 0 },
      { currency: 'KES', monthlyPrice: 0, annualPrice: 0, registrationFeePerDrone: 65000, perAuthorizationFee: 0 },
      { currency: 'ZAR', monthlyPrice: 0, annualPrice: 0, registrationFeePerDrone: 9000, perAuthorizationFee: 0 },
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Professional',
    description: 'For professional pilots and small teams',
    recommended: true,
    badge: 'Most Popular',
    features: [
      'Up to 15 drones',
      'Up to 5 pilots',
      'Interactive airspace map',
      'Unlimited LAANC authorizations',
      'Unlimited missions',
      'Pre-flight checklists',
      'Basic analytics',
      'Flight hour tracking',
      'Priority email support',
      '90-day audit log retention',
    ],
    limits: {
      maxDrones: 15,
      maxPilots: 5,
      maxMissionsPerMonth: -1,
      maxFlightHoursPerMonth: -1,
      maxApiCallsPerHour: 0,
      maxStorageGb: 10,
      laancAuthorizationsPerMonth: -1,
      advancedAnalytics: false,
      complianceReporting: false,
      customRoles: false,
      ssoEnabled: false,
      prioritySupport: true,
      dedicatedAccountManager: false,
      whiteLabel: false,
      webhooks: false,
      sandboxEnvironment: false,
      auditLogRetentionDays: 90,
      teamMembers: 5,
    },
    pricing: [
      { currency: 'USD', monthlyPrice: 4900, annualPrice: 47000, registrationFeePerDrone: 500, perAuthorizationFee: 0 },
      { currency: 'CAD', monthlyPrice: 6600, annualPrice: 63500, registrationFeePerDrone: 675, perAuthorizationFee: 0 },
      { currency: 'NGN', monthlyPrice: 735000, annualPrice: 7050000, registrationFeePerDrone: 75000, perAuthorizationFee: 0 },
      { currency: 'KES', monthlyPrice: 635000, annualPrice: 6100000, registrationFeePerDrone: 65000, perAuthorizationFee: 0 },
      { currency: 'ZAR', monthlyPrice: 88000, annualPrice: 846000, registrationFeePerDrone: 9000, perAuthorizationFee: 0 },
    ],
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'For enterprise UAS programs and large fleets',
    badge: 'Best for Teams',
    features: [
      'Unlimited drones',
      'Unlimited pilots',
      'Full fleet management',
      'Advanced analytics & reporting',
      'SOC 2 / ISO 27001 compliance',
      'Custom roles & permissions',
      'SSO / SAML integration',
      'Webhooks & integrations',
      'Dedicated account manager',
      'Phone + priority support',
      '1-year audit log retention',
      'Custom branding',
    ],
    limits: {
      maxDrones: -1,
      maxPilots: -1,
      maxMissionsPerMonth: -1,
      maxFlightHoursPerMonth: -1,
      maxApiCallsPerHour: 5000,
      maxStorageGb: 100,
      laancAuthorizationsPerMonth: -1,
      advancedAnalytics: true,
      complianceReporting: true,
      customRoles: true,
      ssoEnabled: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      whiteLabel: true,
      webhooks: true,
      sandboxEnvironment: true,
      auditLogRetentionDays: 365,
      teamMembers: -1,
    },
    pricing: [
      { currency: 'USD', monthlyPrice: 19900, annualPrice: 191000, registrationFeePerDrone: 500, perAuthorizationFee: 0, setupFee: 50000 },
      { currency: 'CAD', monthlyPrice: 26900, annualPrice: 258000, registrationFeePerDrone: 675, perAuthorizationFee: 0, setupFee: 67500 },
      { currency: 'NGN', monthlyPrice: 2985000, annualPrice: 28650000, registrationFeePerDrone: 75000, perAuthorizationFee: 0 },
      { currency: 'KES', monthlyPrice: 2585000, annualPrice: 24800000, registrationFeePerDrone: 65000, perAuthorizationFee: 0 },
      { currency: 'ZAR', monthlyPrice: 358000, annualPrice: 3440000, registrationFeePerDrone: 9000, perAuthorizationFee: 0 },
    ],
  },
  agency: {
    tier: 'agency',
    name: 'Agency & Government',
    description: 'For airspace authorities, public safety, and local agencies',
    features: [
      'Jurisdiction management',
      'Local drone rule publishing',
      'Real-time Remote ID monitoring',
      'Incident tracking & reporting',
      'Live airspace activity feed',
      'Multi-agency coordination',
      'Government revenue dashboard',
      'Enforcement tools',
      'Public safety integrations',
      'Regulatory compliance suite',
      'Unlimited audit log retention',
      'Dedicated support line',
    ],
    limits: {
      maxDrones: -1,
      maxPilots: -1,
      maxMissionsPerMonth: -1,
      maxFlightHoursPerMonth: -1,
      maxApiCallsPerHour: 10000,
      maxStorageGb: 500,
      laancAuthorizationsPerMonth: -1,
      advancedAnalytics: true,
      complianceReporting: true,
      customRoles: true,
      ssoEnabled: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      whiteLabel: true,
      webhooks: true,
      sandboxEnvironment: true,
      auditLogRetentionDays: -1,
      teamMembers: -1,
    },
    pricing: [
      { currency: 'USD', monthlyPrice: 29900, annualPrice: 287000, registrationFeePerDrone: 0, perAuthorizationFee: 0, setupFee: 100000 },
      { currency: 'CAD', monthlyPrice: 40400, annualPrice: 387500, registrationFeePerDrone: 0, perAuthorizationFee: 0, setupFee: 135000 },
      { currency: 'NGN', monthlyPrice: 4485000, annualPrice: 43050000, registrationFeePerDrone: 0, perAuthorizationFee: 0 },
      { currency: 'KES', monthlyPrice: 3885000, annualPrice: 37300000, registrationFeePerDrone: 0, perAuthorizationFee: 0 },
      { currency: 'ZAR', monthlyPrice: 538000, annualPrice: 5165000, registrationFeePerDrone: 0, perAuthorizationFee: 0 },
    ],
  },
  developer: {
    tier: 'developer',
    name: 'Developer',
    description: 'For app developers and integrators building on Sky Warden APIs',
    features: [
      'Full API access',
      'Sandbox environment',
      'Webhook configuration',
      '1,000 API calls/hour',
      'SDK access (Node.js, Python)',
      'API key management',
      'Developer documentation',
      'Community support',
      'Rate limit dashboard',
    ],
    limits: {
      maxDrones: 5,
      maxPilots: 2,
      maxMissionsPerMonth: 50,
      maxFlightHoursPerMonth: 50,
      maxApiCallsPerHour: 1000,
      maxStorageGb: 5,
      laancAuthorizationsPerMonth: 20,
      advancedAnalytics: false,
      complianceReporting: false,
      customRoles: false,
      ssoEnabled: false,
      prioritySupport: false,
      dedicatedAccountManager: false,
      whiteLabel: false,
      webhooks: true,
      sandboxEnvironment: true,
      auditLogRetentionDays: 30,
      teamMembers: 2,
    },
    pricing: [
      { currency: 'USD', monthlyPrice: 2900, annualPrice: 27800, registrationFeePerDrone: 500, perAuthorizationFee: 100 },
      { currency: 'CAD', monthlyPrice: 3900, annualPrice: 37500, registrationFeePerDrone: 675, perAuthorizationFee: 135 },
      { currency: 'NGN', monthlyPrice: 435000, annualPrice: 4170000, registrationFeePerDrone: 75000, perAuthorizationFee: 15000 },
      { currency: 'KES', monthlyPrice: 375000, annualPrice: 3600000, registrationFeePerDrone: 65000, perAuthorizationFee: 13000 },
      { currency: 'ZAR', monthlyPrice: 52000, annualPrice: 500000, registrationFeePerDrone: 9000, perAuthorizationFee: 1800 },
    ],
  },
};

// ============================================================
// REGISTRATION FEE SCHEDULES BY REGION (constants)
// ============================================================

/** Pre-configured registration fee schedules for each supported region. */
export const REGISTRATION_FEE_SCHEDULES: Record<string, RegistrationFeeSchedule> = {
  US: {
    region: 'US',
    currency: 'USD',
    standardAnnualFee: 500,
    commercialAnnualFee: 500,
    governmentFee: 0,
    educationalFee: 0,
    temporaryFees: {
      tourist7Day: 1500,
      researcher30Day: 2500,
      temporaryOperator90Day: 5000,
      eventPerDay: 1000,
    },
    lateFeePercentage: 25,
    transferFee: 500,
    replacementFee: 200,
    governmentRevenueSplit: 0.70,
    platformRevenueSplit: 0.30,
  },
  CA: {
    region: 'CA',
    currency: 'CAD',
    standardAnnualFee: 675,
    commercialAnnualFee: 1000,
    governmentFee: 0,
    educationalFee: 0,
    temporaryFees: {
      tourist7Day: 2000,
      researcher30Day: 3500,
      temporaryOperator90Day: 6750,
      eventPerDay: 1350,
    },
    lateFeePercentage: 25,
    transferFee: 675,
    replacementFee: 270,
    governmentRevenueSplit: 0.70,
    platformRevenueSplit: 0.30,
  },
  NG: {
    region: 'NG',
    currency: 'NGN',
    standardAnnualFee: 75000,
    commercialAnnualFee: 150000,
    governmentFee: 0,
    educationalFee: 25000,
    temporaryFees: {
      tourist7Day: 50000,
      researcher30Day: 100000,
      temporaryOperator90Day: 200000,
      eventPerDay: 25000,
    },
    lateFeePercentage: 30,
    transferFee: 30000,
    replacementFee: 15000,
    governmentRevenueSplit: 0.75,
    platformRevenueSplit: 0.25,
  },
  KE: {
    region: 'KE',
    currency: 'KES',
    standardAnnualFee: 65000,
    commercialAnnualFee: 130000,
    governmentFee: 0,
    educationalFee: 20000,
    temporaryFees: {
      tourist7Day: 40000,
      researcher30Day: 80000,
      temporaryOperator90Day: 160000,
      eventPerDay: 20000,
    },
    lateFeePercentage: 30,
    transferFee: 25000,
    replacementFee: 10000,
    governmentRevenueSplit: 0.75,
    platformRevenueSplit: 0.25,
  },
  ZA: {
    region: 'ZA',
    currency: 'ZAR',
    standardAnnualFee: 9000,
    commercialAnnualFee: 18000,
    governmentFee: 0,
    educationalFee: 3000,
    temporaryFees: {
      tourist7Day: 6000,
      researcher30Day: 12000,
      temporaryOperator90Day: 24000,
      eventPerDay: 3000,
    },
    lateFeePercentage: 25,
    transferFee: 4500,
    replacementFee: 2000,
    governmentRevenueSplit: 0.70,
    platformRevenueSplit: 0.30,
  },
  GH: {
    region: 'GH',
    currency: 'GHS',
    standardAnnualFee: 35000,
    commercialAnnualFee: 70000,
    governmentFee: 0,
    educationalFee: 12000,
    temporaryFees: {
      tourist7Day: 20000,
      researcher30Day: 40000,
      temporaryOperator90Day: 80000,
      eventPerDay: 10000,
    },
    lateFeePercentage: 25,
    transferFee: 15000,
    replacementFee: 7000,
    governmentRevenueSplit: 0.75,
    platformRevenueSplit: 0.25,
  },
  RW: {
    region: 'RW',
    currency: 'RWF',
    standardAnnualFee: 500000,
    commercialAnnualFee: 1000000,
    governmentFee: 0,
    educationalFee: 150000,
    temporaryFees: {
      tourist7Day: 300000,
      researcher30Day: 600000,
      temporaryOperator90Day: 1200000,
      eventPerDay: 150000,
    },
    lateFeePercentage: 25,
    transferFee: 200000,
    replacementFee: 100000,
    governmentRevenueSplit: 0.75,
    platformRevenueSplit: 0.25,
  },
};
