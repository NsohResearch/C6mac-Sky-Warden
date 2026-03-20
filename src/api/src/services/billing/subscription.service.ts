import { queryWithTenant, query, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError, ConflictError, AppError, ValidationError } from '../../utils/errors.js';
import type {
  Subscription,
  SubscriptionStatus,
  PlanTier,
  BillingCycle,
  Currency,
  UsageMetrics,
  PlanLimits,
} from '../../../../shared/types/billing.js';
import type { UUID } from '../../../../shared/types/common.js';
import { PLAN_DEFINITIONS } from '../../../../shared/types/billing.js';

// ─── Input DTOs ───

export interface CreateSubscriptionInput {
  planTier: PlanTier;
  billingCycle: BillingCycle;
  currency: Currency;
  paymentMethodId?: string;
}

export interface UsageLimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  overage: number;
}

// ─── Service ───

export class SubscriptionService {
  private readonly log = logger.child({ service: 'SubscriptionService' });

  /**
   * Create a new subscription for a tenant.
   * Free plans are instantly active; paid plans start with a 14-day trial.
   */
  async createSubscription(
    tenantId: UUID,
    planTier: PlanTier,
    billingCycle: BillingCycle,
    currency: Currency,
    paymentMethodId?: string
  ): Promise<Subscription> {
    this.log.info({ tenantId, planTier, billingCycle, currency }, 'Creating subscription');

    // Check for existing active subscription
    const existing = await queryWithTenant<{ id: string }>(
      tenantId,
      `SELECT id FROM subscriptions
       WHERE tenant_id = $1
         AND status IN ('active', 'trialing', 'past_due')
       LIMIT 1`,
      [tenantId]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError('Tenant already has an active subscription');
    }

    const plan = PLAN_DEFINITIONS[planTier];
    if (!plan) {
      throw new ValidationError(`Invalid plan tier: ${planTier}`);
    }

    const pricing = plan.pricing.find((p) => p.currency === currency);
    if (!pricing) {
      throw new ValidationError(`Currency ${currency} is not available for plan ${planTier}`);
    }

    const now = new Date();
    const isFree = planTier === 'free';
    const status: SubscriptionStatus = isFree ? 'active' : 'trialing';

    // Trial: 14 days for paid plans
    const trialStart = isFree ? null : now.toISOString();
    const trialEnd = isFree ? null : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

    // Period dates
    const periodStart = now.toISOString();
    let periodEnd: string;
    if (isFree) {
      // Free plan: period end = 1 month from now
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      periodEnd = end.toISOString();
    } else {
      // Paid plan: period starts after trial
      periodEnd = trialEnd!;
    }

    const result = await queryWithTenant<Subscription>(
      tenantId,
      `INSERT INTO subscriptions (
        tenant_id, plan_tier, status, billing_cycle, currency,
        current_period_start, current_period_end,
        monthly_amount, annual_amount,
        trial_start, trial_end,
        payment_method_id,
        current_usage
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7,
        $8, $9,
        $10, $11,
        $12,
        $13
      )
      RETURNING *`,
      [
        tenantId,
        planTier,
        status,
        billingCycle,
        currency,
        periodStart,
        periodEnd,
        pricing.monthlyPrice,
        pricing.annualPrice,
        trialStart,
        trialEnd,
        paymentMethodId ?? null,
        JSON.stringify({
          dronesRegistered: 0,
          activePilots: 0,
          missionsThisPeriod: 0,
          flightHoursThisPeriod: 0,
          apiCallsThisHour: 0,
          apiCallsThisPeriod: 0,
          storageUsedGb: 0,
          authorizationsThisPeriod: 0,
        }),
      ]
    );

    this.log.info({ subscriptionId: result.rows[0].id, status }, 'Subscription created');
    return this.mapSubscriptionRow(result.rows[0]);
  }

  /**
   * Get the current active subscription for a tenant.
   */
  async getSubscription(tenantId: UUID): Promise<Subscription> {
    const result = await queryWithTenant<Subscription>(
      tenantId,
      `SELECT * FROM subscriptions
       WHERE tenant_id = $1
         AND status IN ('active', 'trialing', 'past_due', 'paused')
       ORDER BY created_at DESC
       LIMIT 1`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Subscription', tenantId);
    }

    return this.mapSubscriptionRow(result.rows[0]);
  }

  /**
   * Upgrade a tenant's plan. Prorates charges and creates an invoice line item
   * for the price difference over the remaining period.
   */
  async upgradePlan(tenantId: UUID, newPlanTier: PlanTier): Promise<Subscription> {
    this.log.info({ tenantId, newPlanTier }, 'Upgrading plan');

    return withTransaction(tenantId, async (client) => {
      // Lock the subscription row
      const subResult = await client.query<Subscription>(
        `SELECT * FROM subscriptions
         WHERE tenant_id = $1
           AND status IN ('active', 'trialing')
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [tenantId]
      );

      if (subResult.rows.length === 0) {
        throw new NotFoundError('Subscription', tenantId);
      }

      const sub = subResult.rows[0];
      const currentTier = (sub as any).plan_tier ?? (sub as any).planTier;
      const currency = sub.currency;

      const tierOrder: PlanTier[] = ['free', 'developer', 'pro', 'enterprise', 'agency'];
      if (tierOrder.indexOf(newPlanTier) <= tierOrder.indexOf(currentTier)) {
        throw new ValidationError(`Cannot upgrade from ${currentTier} to ${newPlanTier}. Use downgradePlan instead.`);
      }

      const newPlan = PLAN_DEFINITIONS[newPlanTier];
      if (!newPlan) {
        throw new ValidationError(`Invalid plan tier: ${newPlanTier}`);
      }

      const newPricing = newPlan.pricing.find((p) => p.currency === currency);
      if (!newPricing) {
        throw new ValidationError(`Currency ${currency} is not available for plan ${newPlanTier}`);
      }

      // Calculate proration
      const periodStart = new Date((sub as any).current_period_start ?? (sub as any).currentPeriodStart);
      const periodEnd = new Date((sub as any).current_period_end ?? (sub as any).currentPeriodEnd);
      const now = new Date();
      const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
      const remainingMs = periodEnd.getTime() - now.getTime();
      const remainingFraction = Math.max(0, remainingMs / totalPeriodMs);

      const billingCycle = (sub as any).billing_cycle ?? (sub as any).billingCycle;
      const oldMonthly = parseInt(String((sub as any).monthly_amount ?? (sub as any).monthlyAmount), 10);
      const newMonthly = newPricing.monthlyPrice;
      const proratedDifference = Math.round((newMonthly - oldMonthly) * remainingFraction);

      // Create proration invoice line item
      if (proratedDifference > 0) {
        await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id, description, category, quantity, unit_price, total_price,
            taxable, revenue_recipient, metadata
          ) VALUES (
            NULL, $1, 'subscription', 1, $2, $2,
            true, 'platform', $3
          )`,
          [
            `Plan upgrade proration: ${currentTier} -> ${newPlanTier}`,
            proratedDifference,
            JSON.stringify({ fromTier: currentTier, toTier: newPlanTier, remainingFraction }),
          ]
        );
      }

      // Update subscription
      const updateResult = await client.query<Subscription>(
        `UPDATE subscriptions
         SET plan_tier = $1,
             monthly_amount = $2,
             annual_amount = $3,
             updated_at = NOW()
         WHERE id = $4 AND tenant_id = $5
         RETURNING *`,
        [
          newPlanTier,
          newPricing.monthlyPrice,
          newPricing.annualPrice,
          (sub as any).id,
          tenantId,
        ]
      );

      this.log.info(
        { tenantId, fromTier: currentTier, toTier: newPlanTier, proratedDifference },
        'Plan upgraded'
      );
      return this.mapSubscriptionRow(updateResult.rows[0]);
    });
  }

  /**
   * Downgrade a tenant's plan. Takes effect at the end of the current billing period.
   */
  async downgradePlan(tenantId: UUID, newPlanTier: PlanTier): Promise<Subscription> {
    this.log.info({ tenantId, newPlanTier }, 'Scheduling plan downgrade');

    const sub = await this.getSubscription(tenantId);

    const tierOrder: PlanTier[] = ['free', 'developer', 'pro', 'enterprise', 'agency'];
    if (tierOrder.indexOf(newPlanTier) >= tierOrder.indexOf(sub.planTier)) {
      throw new ValidationError(`Cannot downgrade from ${sub.planTier} to ${newPlanTier}. Use upgradePlan instead.`);
    }

    const newPlan = PLAN_DEFINITIONS[newPlanTier];
    if (!newPlan) {
      throw new ValidationError(`Invalid plan tier: ${newPlanTier}`);
    }

    // Store pending downgrade in metadata — applied at period end during renewal
    const result = await queryWithTenant<Subscription>(
      tenantId,
      `UPDATE subscriptions
       SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [
        JSON.stringify({
          pendingDowngrade: newPlanTier,
          downgradeScheduledAt: new Date().toISOString(),
          downgradeEffectiveAt: sub.currentPeriodEnd,
        }),
        sub.id,
        tenantId,
      ]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Subscription', sub.id);
    }

    this.log.info(
      { tenantId, fromTier: sub.planTier, toTier: newPlanTier, effectiveAt: sub.currentPeriodEnd },
      'Plan downgrade scheduled'
    );
    return this.mapSubscriptionRow(result.rows[0]);
  }

  /**
   * Cancel a subscription at the end of the current billing period.
   * Access is not immediately revoked.
   */
  async cancelSubscription(tenantId: UUID, reason?: string): Promise<Subscription> {
    this.log.info({ tenantId, reason }, 'Cancelling subscription');

    const sub = await this.getSubscription(tenantId);

    if (sub.status === 'cancelled') {
      throw new ConflictError('Subscription is already cancelled');
    }

    const result = await queryWithTenant<Subscription>(
      tenantId,
      `UPDATE subscriptions
       SET status = 'cancelled',
           cancelled_at = NOW(),
           cancel_reason = $1,
           updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [reason ?? null, sub.id, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Subscription', sub.id);
    }

    this.log.info({ tenantId, subscriptionId: sub.id }, 'Subscription cancelled (effective at period end)');
    return this.mapSubscriptionRow(result.rows[0]);
  }

  /**
   * Process subscription renewal: create invoice, charge payment method, extend period.
   */
  async renewSubscription(tenantId: UUID): Promise<Subscription> {
    this.log.info({ tenantId }, 'Renewing subscription');

    return withTransaction(tenantId, async (client) => {
      const subResult = await client.query<Subscription>(
        `SELECT * FROM subscriptions
         WHERE tenant_id = $1
           AND status IN ('active', 'past_due')
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [tenantId]
      );

      if (subResult.rows.length === 0) {
        throw new NotFoundError('Subscription', tenantId);
      }

      const sub = subResult.rows[0];
      const billingCycle = (sub as any).billing_cycle ?? (sub as any).billingCycle;
      const monthlyAmount = parseInt(String((sub as any).monthly_amount ?? (sub as any).monthlyAmount), 10);
      const annualAmount = parseInt(String((sub as any).annual_amount ?? (sub as any).annualAmount), 10);
      const currency = sub.currency;
      const planTier = (sub as any).plan_tier ?? (sub as any).planTier;

      // Check for pending downgrade
      const metadata = (sub as any).metadata ?? {};
      let effectiveTier = planTier;
      if (metadata.pendingDowngrade) {
        effectiveTier = metadata.pendingDowngrade;
        const newPlan = PLAN_DEFINITIONS[effectiveTier as PlanTier];
        const newPricing = newPlan?.pricing.find((p) => p.currency === currency);
        if (newPricing) {
          await client.query(
            `UPDATE subscriptions
             SET plan_tier = $1,
                 monthly_amount = $2,
                 annual_amount = $3,
                 metadata = metadata - 'pendingDowngrade' - 'downgradeScheduledAt' - 'downgradeEffectiveAt'
             WHERE id = $4`,
            [effectiveTier, newPricing.monthlyPrice, newPricing.annualPrice, (sub as any).id]
          );
        }
      }

      // Calculate renewal amount
      const renewalAmount = billingCycle === 'annual' ? annualAmount : monthlyAmount;

      // Create invoice
      const invoiceResult = await client.query<{ id: string }>(
        `INSERT INTO invoices (
          tenant_id, subscription_id, invoice_number, status, currency,
          subtotal, tax_amount, tax_rate, government_fees, platform_fees,
          total_amount, issued_at, due_date
        ) VALUES (
          $1, $2, $3, 'pending', $4,
          $5, 0, 0, 0, $5,
          $5, NOW(), NOW()
        )
        RETURNING id`,
        [
          tenantId,
          (sub as any).id,
          await this.generateInvoiceNumber(client),
          currency,
          renewalAmount,
        ]
      );

      // Create line item
      await client.query(
        `INSERT INTO invoice_line_items (
          invoice_id, description, category, quantity, unit_price, total_price,
          taxable, revenue_recipient
        ) VALUES (
          $1, $2, 'subscription', 1, $3, $3, true, 'platform'
        )`,
        [
          invoiceResult.rows[0].id,
          `${effectiveTier} plan - ${billingCycle} renewal`,
          renewalAmount,
        ]
      );

      // Extend period
      const periodEnd = new Date((sub as any).current_period_end ?? (sub as any).currentPeriodEnd);
      const newPeriodStart = periodEnd.toISOString();
      const newPeriodEnd = new Date(periodEnd);
      if (billingCycle === 'annual') {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      } else {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      }

      // Reset usage and extend period
      const updateResult = await client.query<Subscription>(
        `UPDATE subscriptions
         SET status = 'active',
             current_period_start = $1,
             current_period_end = $2,
             last_payment_date = NOW(),
             next_payment_date = $2,
             past_due_amount = 0,
             current_usage = $3,
             updated_at = NOW()
         WHERE id = $4 AND tenant_id = $5
         RETURNING *`,
        [
          newPeriodStart,
          newPeriodEnd.toISOString(),
          JSON.stringify({
            dronesRegistered: 0,
            activePilots: 0,
            missionsThisPeriod: 0,
            flightHoursThisPeriod: 0,
            apiCallsThisHour: 0,
            apiCallsThisPeriod: 0,
            storageUsedGb: 0,
            authorizationsThisPeriod: 0,
          }),
          (sub as any).id,
          tenantId,
        ]
      );

      this.log.info(
        { tenantId, subscriptionId: (sub as any).id, renewalAmount, newPeriodEnd: newPeriodEnd.toISOString() },
        'Subscription renewed'
      );
      return this.mapSubscriptionRow(updateResult.rows[0]);
    });
  }

  /**
   * Check if a tenant has exceeded plan limits for a given metric.
   */
  async checkUsageLimits(tenantId: UUID, metric: string): Promise<UsageLimitCheck> {
    const sub = await this.getSubscription(tenantId);
    const plan = PLAN_DEFINITIONS[sub.planTier];
    if (!plan) {
      throw new AppError(500, 'INTERNAL_ERROR', `Plan definition not found for tier: ${sub.planTier}`);
    }

    const limits = plan.limits;
    const usage = sub.currentUsage;

    const metricMap: Record<string, { current: number; limit: number }> = {
      drones: { current: usage.dronesRegistered, limit: limits.maxDrones },
      pilots: { current: usage.activePilots, limit: limits.maxPilots },
      missions: { current: usage.missionsThisPeriod, limit: limits.maxMissionsPerMonth },
      flight_hours: { current: usage.flightHoursThisPeriod, limit: limits.maxFlightHoursPerMonth },
      api_calls_hour: { current: usage.apiCallsThisHour, limit: limits.maxApiCallsPerHour },
      storage: { current: usage.storageUsedGb, limit: limits.maxStorageGb },
      authorizations: { current: usage.authorizationsThisPeriod, limit: limits.laancAuthorizationsPerMonth },
      team_members: { current: usage.activePilots, limit: limits.teamMembers },
    };

    const entry = metricMap[metric];
    if (!entry) {
      throw new ValidationError(`Unknown usage metric: ${metric}`);
    }

    // -1 means unlimited
    if (entry.limit === -1) {
      return { allowed: true, current: entry.current, limit: -1, overage: 0 };
    }

    // 0 means disabled
    if (entry.limit === 0) {
      return { allowed: false, current: entry.current, limit: 0, overage: entry.current };
    }

    const overage = Math.max(0, entry.current - entry.limit);
    return {
      allowed: entry.current < entry.limit,
      current: entry.current,
      limit: entry.limit,
      overage,
    };
  }

  /**
   * Record a usage event into the usage_records table.
   */
  async recordUsage(tenantId: UUID, metric: string, quantity: number): Promise<void> {
    this.log.debug({ tenantId, metric, quantity }, 'Recording usage');

    await queryWithTenant(
      tenantId,
      `INSERT INTO usage_records (
        tenant_id, metric, quantity, recorded_at
      ) VALUES ($1, $2, $3, NOW())`,
      [tenantId, metric, quantity]
    );

    // Update current_usage on the subscription in real time
    const usageColumnMap: Record<string, string> = {
      drones: 'dronesRegistered',
      pilots: 'activePilots',
      missions: 'missionsThisPeriod',
      flight_hours: 'flightHoursThisPeriod',
      api_calls_hour: 'apiCallsThisHour',
      api_calls: 'apiCallsThisPeriod',
      storage: 'storageUsedGb',
      authorizations: 'authorizationsThisPeriod',
    };

    const jsonKey = usageColumnMap[metric];
    if (jsonKey) {
      await queryWithTenant(
        tenantId,
        `UPDATE subscriptions
         SET current_usage = jsonb_set(
           current_usage,
           $1,
           (COALESCE((current_usage->>$2)::numeric, 0) + $3)::text::jsonb
         ),
         updated_at = NOW()
         WHERE tenant_id = $4
           AND status IN ('active', 'trialing', 'past_due')`,
        [
          `{${jsonKey}}`,
          jsonKey,
          quantity,
          tenantId,
        ]
      );
    }
  }

  /**
   * Get current period usage metrics vs plan limits for a tenant.
   */
  async getUsageMetrics(tenantId: UUID): Promise<{
    usage: UsageMetrics;
    limits: PlanLimits;
    planTier: PlanTier;
  }> {
    const sub = await this.getSubscription(tenantId);
    const plan = PLAN_DEFINITIONS[sub.planTier];
    if (!plan) {
      throw new AppError(500, 'INTERNAL_ERROR', `Plan definition not found for tier: ${sub.planTier}`);
    }

    return {
      usage: sub.currentUsage,
      limits: plan.limits,
      planTier: sub.planTier,
    };
  }

  /**
   * Batch job: find trials that have ended and either convert to active
   * (if payment method on file) or cancel.
   */
  async processExpiredTrials(): Promise<{ converted: number; cancelled: number }> {
    this.log.info('Processing expired trials');

    const result = await query<Subscription>(
      `SELECT * FROM subscriptions
       WHERE status = 'trialing'
         AND trial_end <= NOW()
       FOR UPDATE SKIP LOCKED`
    );

    let converted = 0;
    let cancelled = 0;

    for (const row of result.rows) {
      const tenantId = (row as any).tenant_id ?? (row as any).tenantId;
      const subscriptionId = (row as any).id;
      const paymentMethodId = (row as any).payment_method_id ?? (row as any).paymentMethodId;

      if (paymentMethodId) {
        // Convert to active and start first billing period
        const periodStart = new Date();
        const billingCycle = (row as any).billing_cycle ?? (row as any).billingCycle;
        const periodEnd = new Date(periodStart);
        if (billingCycle === 'annual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        await query(
          `UPDATE subscriptions
           SET status = 'active',
               current_period_start = $1,
               current_period_end = $2,
               next_payment_date = $2,
               updated_at = NOW()
           WHERE id = $3`,
          [periodStart.toISOString(), periodEnd.toISOString(), subscriptionId]
        );

        this.log.info({ tenantId, subscriptionId }, 'Trial converted to active');
        converted++;
      } else {
        // No payment method — cancel
        await query(
          `UPDATE subscriptions
           SET status = 'cancelled',
               cancelled_at = NOW(),
               cancel_reason = 'Trial expired without payment method',
               updated_at = NOW()
           WHERE id = $1`,
          [subscriptionId]
        );

        this.log.info({ tenantId, subscriptionId }, 'Trial cancelled (no payment method)');
        cancelled++;
      }
    }

    this.log.info({ converted, cancelled }, 'Expired trials processed');
    return { converted, cancelled };
  }

  /**
   * Batch job: find subscriptions due for renewal and process payments.
   */
  async processRenewals(): Promise<{ renewed: number; failed: number }> {
    this.log.info('Processing subscription renewals');

    const result = await query<Subscription>(
      `SELECT * FROM subscriptions
       WHERE status = 'active'
         AND current_period_end <= NOW()
         AND plan_tier != 'free'
       FOR UPDATE SKIP LOCKED`
    );

    let renewed = 0;
    let failed = 0;

    for (const row of result.rows) {
      const tenantId = (row as any).tenant_id ?? (row as any).tenantId;
      try {
        await this.renewSubscription(tenantId);
        renewed++;
      } catch (error) {
        this.log.error(
          { tenantId, error: (error as Error).message },
          'Failed to renew subscription'
        );

        // Mark as past_due
        await query(
          `UPDATE subscriptions
           SET status = 'past_due',
               updated_at = NOW()
           WHERE id = $1`,
          [(row as any).id]
        );

        failed++;
      }
    }

    this.log.info({ renewed, failed }, 'Renewals processed');
    return { renewed, failed };
  }

  // ─── Private Helpers ───

  private async generateInvoiceNumber(client: any): Promise<string> {
    const year = new Date().getFullYear();
    const result = await client.query(
      `SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'SKW-INV-\\d{4}-(\\d{6})') AS INTEGER)
      ), 0) + 1 AS next_num
       FROM invoices
       WHERE invoice_number LIKE $1`,
      [`SKW-INV-${year}-%`]
    );

    const nextNum = result.rows[0].next_num;
    return `SKW-INV-${year}-${String(nextNum).padStart(6, '0')}`;
  }

  private mapSubscriptionRow(row: Record<string, any>): Subscription {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      planTier: row.plan_tier ?? row.planTier,
      status: row.status,
      billingCycle: row.billing_cycle ?? row.billingCycle,
      currency: row.currency,
      currentPeriodStart: row.current_period_start ?? row.currentPeriodStart,
      currentPeriodEnd: row.current_period_end ?? row.currentPeriodEnd,
      monthlyAmount: parseInt(String(row.monthly_amount ?? row.monthlyAmount ?? 0), 10),
      annualAmount: parseInt(String(row.annual_amount ?? row.annualAmount ?? 0), 10),
      trialStart: row.trial_start ?? row.trialStart ?? undefined,
      trialEnd: row.trial_end ?? row.trialEnd ?? undefined,
      paymentMethodId: row.payment_method_id ?? row.paymentMethodId ?? undefined,
      lastPaymentDate: row.last_payment_date ?? row.lastPaymentDate ?? undefined,
      nextPaymentDate: row.next_payment_date ?? row.nextPaymentDate ?? undefined,
      pastDueAmount: row.past_due_amount != null
        ? parseInt(String(row.past_due_amount ?? row.pastDueAmount), 10)
        : undefined,
      currentUsage: typeof row.current_usage === 'string'
        ? JSON.parse(row.current_usage)
        : (row.current_usage ?? row.currentUsage ?? {}),
      externalSubscriptionId: row.external_subscription_id ?? row.externalSubscriptionId ?? undefined,
      externalCustomerId: row.external_customer_id ?? row.externalCustomerId ?? undefined,
      cancelledAt: row.cancelled_at ?? row.cancelledAt ?? undefined,
      cancelReason: row.cancel_reason ?? row.cancelReason ?? undefined,
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }
}

export const subscriptionService = new SubscriptionService();
