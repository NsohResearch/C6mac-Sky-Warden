import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authenticate, requirePermissions } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const billingRoutes = new Hono();

// ─── Schemas ───

const subscriptionCreateSchema = z.object({
  planTier: z.enum(['free', 'starter', 'professional', 'enterprise', 'agency']),
  billingCycle: z.enum(['monthly', 'annual']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD'),
  paymentMethodId: z.string().uuid(),
});

const subscriptionUpgradeSchema = z.object({
  newPlanTier: z.enum(['starter', 'professional', 'enterprise', 'agency']),
});

const subscriptionDowngradeSchema = z.object({
  newPlanTier: z.enum(['free', 'starter', 'professional', 'enterprise']),
});

const subscriptionCancelSchema = z.object({
  reason: z.string().max(1000).optional(),
});

const usageCheckSchema = z.object({
  metric: z.enum([
    'drones', 'pilots', 'flights_per_month', 'api_calls_per_day',
    'storage_gb', 'laanc_requests', 'geofences', 'webhooks',
  ]),
  quantity: z.number().positive(),
});

const paymentMethodCreateSchema = z.object({
  type: z.enum(['card', 'ach', 'wire']),
  provider: z.enum(['stripe', 'plaid']),
  providerPaymentMethodId: z.string().min(1),
  label: z.string().max(100).optional(),
  setAsDefault: z.boolean().default(false),
});

const invoiceListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['draft', 'open', 'paid', 'void', 'uncollectible', 'overdue']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'due_date', 'amount', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const invoiceRefundSchema = z.object({
  reason: z.string().min(1).max(1000),
  amount: z.number().positive().optional(), // partial refund; omit for full
});

const revenueQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const governmentRevenueSchema = z.object({
  period: z.enum(['month', 'quarter', 'year']).default('quarter'),
  region: z.string().optional(),
});

const disbursementListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

const disbursementCreateSchema = z.object({
  recipientAgencyId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).default('USD'),
  period: z.string().min(1),
  lineItems: z.array(z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
    category: z.string().min(1),
  })).min(1),
  notes: z.string().max(2000).optional(),
});

// ─── Plans (Public — No Auth) ───

billingRoutes.get(
  '/plans',
  async (c) => {
    const { billingService } = await import('../services/billing/billing.service.js');
    const plans = await billingService.listPlans();

    return c.json({ success: true, data: plans });
  }
);

billingRoutes.get(
  '/plans/:tier',
  async (c) => {
    const tier = c.req.param('tier');

    const { billingService } = await import('../services/billing/billing.service.js');
    const plan = await billingService.getPlan(tier);

    return c.json({ success: true, data: plan });
  }
);

// ─── Subscriptions ───

billingRoutes.get(
  '/subscription',
  authenticate,
  requirePermissions('billing:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { billingService } = await import('../services/billing/billing.service.js');
    const subscription = await billingService.getSubscription(tenantId);

    return c.json({ success: true, data: subscription });
  }
);

billingRoutes.post(
  '/subscription',
  authenticate,
  requirePermissions('billing:manage'),
  zValidator('json', subscriptionCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const subscription = await billingService.createSubscription(tenantId, userId, body);

    logger.info({ tenantId, userId, planTier: body.planTier }, 'Subscription created');

    return c.json({ success: true, data: subscription }, 201);
  }
);

billingRoutes.patch(
  '/subscription/upgrade',
  authenticate,
  requirePermissions('billing:manage'),
  zValidator('json', subscriptionUpgradeSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const { newPlanTier } = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const subscription = await billingService.upgradeSubscription(tenantId, userId, newPlanTier);

    logger.info({ tenantId, userId, newPlanTier }, 'Subscription upgraded');

    return c.json({ success: true, data: subscription });
  }
);

billingRoutes.patch(
  '/subscription/downgrade',
  authenticate,
  requirePermissions('billing:manage'),
  zValidator('json', subscriptionDowngradeSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const { newPlanTier } = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const subscription = await billingService.downgradeSubscription(tenantId, userId, newPlanTier);

    logger.info({ tenantId, userId, newPlanTier }, 'Subscription downgraded');

    return c.json({ success: true, data: subscription });
  }
);

billingRoutes.post(
  '/subscription/cancel',
  authenticate,
  requirePermissions('billing:manage'),
  zValidator('json', subscriptionCancelSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const { reason } = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const result = await billingService.cancelSubscription(tenantId, userId, reason);

    logger.info({ tenantId, userId }, 'Subscription cancelled');

    return c.json({ success: true, data: result });
  }
);

billingRoutes.post(
  '/subscription/renew',
  authenticate,
  requirePermissions('billing:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');

    const { billingService } = await import('../services/billing/billing.service.js');
    const result = await billingService.renewSubscription(tenantId, userId);

    logger.info({ tenantId, userId }, 'Subscription manually renewed');

    return c.json({ success: true, data: result });
  }
);

billingRoutes.get(
  '/subscription/usage',
  authenticate,
  requirePermissions('billing:read'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { billingService } = await import('../services/billing/billing.service.js');
    const usage = await billingService.getUsageMetrics(tenantId);

    return c.json({ success: true, data: usage });
  }
);

billingRoutes.post(
  '/subscription/usage/check',
  authenticate,
  requirePermissions('billing:read'),
  zValidator('json', usageCheckSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const { metric, quantity } = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const result = await billingService.checkUsageLimit(tenantId, metric, quantity);

    return c.json({ success: true, data: result });
  }
);

// ─── Payment Methods ───

billingRoutes.get(
  '/payment-methods',
  authenticate,
  requirePermissions('billing:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');

    const { billingService } = await import('../services/billing/billing.service.js');
    const methods = await billingService.listPaymentMethods(tenantId);

    return c.json({ success: true, data: methods });
  }
);

billingRoutes.post(
  '/payment-methods',
  authenticate,
  requirePermissions('billing:manage'),
  zValidator('json', paymentMethodCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const method = await billingService.addPaymentMethod(tenantId, userId, body);

    logger.info({ tenantId, userId, type: body.type }, 'Payment method added');

    return c.json({ success: true, data: method }, 201);
  }
);

billingRoutes.delete(
  '/payment-methods/:id',
  authenticate,
  requirePermissions('billing:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { billingService } = await import('../services/billing/billing.service.js');
    await billingService.removePaymentMethod(id, tenantId, userId);

    logger.info({ tenantId, userId, paymentMethodId: id }, 'Payment method removed');

    return c.json({ success: true, data: { deleted: true } });
  }
);

billingRoutes.patch(
  '/payment-methods/:id/default',
  authenticate,
  requirePermissions('billing:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { billingService } = await import('../services/billing/billing.service.js');
    const method = await billingService.setDefaultPaymentMethod(id, tenantId, userId);

    logger.info({ tenantId, userId, paymentMethodId: id }, 'Default payment method updated');

    return c.json({ success: true, data: method });
  }
);

// ─── Invoices ───

billingRoutes.get(
  '/invoices',
  authenticate,
  requirePermissions('billing:read'),
  zValidator('query', invoiceListSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { billingService } = await import('../services/billing/billing.service.js');
    const result = await billingService.listInvoices(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

billingRoutes.get(
  '/invoices/:id',
  authenticate,
  requirePermissions('billing:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { billingService } = await import('../services/billing/billing.service.js');
    const invoice = await billingService.getInvoice(id, tenantId);

    return c.json({ success: true, data: invoice });
  }
);

billingRoutes.post(
  '/invoices/:id/pay',
  authenticate,
  requirePermissions('billing:manage'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');

    const { billingService } = await import('../services/billing/billing.service.js');
    const result = await billingService.processInvoicePayment(id, tenantId, userId);

    logger.info({ tenantId, userId, invoiceId: id }, 'Invoice payment processed');

    return c.json({ success: true, data: result });
  }
);

billingRoutes.post(
  '/invoices/:id/refund',
  authenticate,
  requirePermissions('billing:manage'),
  zValidator('json', invoiceRefundSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const result = await billingService.refundInvoice(id, tenantId, userId, body);

    logger.info({ tenantId, userId, invoiceId: id, reason: body.reason }, 'Invoice refunded');

    return c.json({ success: true, data: result });
  }
);

billingRoutes.get(
  '/invoices/:id/pdf',
  authenticate,
  requirePermissions('billing:read'),
  async (c) => {
    const tenantId = c.get('tenantId');
    const id = c.req.param('id');

    const { billingService } = await import('../services/billing/billing.service.js');
    const pdf = await billingService.generateInvoicePdf(id, tenantId);

    return new Response(pdf.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
        'Content-Length': String(pdf.buffer.byteLength),
      },
    });
  }
);

// ─── Revenue Reports (Admin/Agency Only) ───

billingRoutes.get(
  '/revenue',
  authenticate,
  requirePermissions('billing:admin'),
  zValidator('query', revenueQuerySchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { billingService } = await import('../services/billing/billing.service.js');
    const report = await billingService.getRevenueReport(tenantId, filters);

    return c.json({ success: true, data: report });
  }
);

billingRoutes.get(
  '/revenue/government',
  authenticate,
  requirePermissions('billing:admin'),
  zValidator('query', governmentRevenueSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { billingService } = await import('../services/billing/billing.service.js');
    const summary = await billingService.getGovernmentRevenueSummary(tenantId, filters);

    return c.json({ success: true, data: summary });
  }
);

billingRoutes.get(
  '/revenue/disbursements',
  authenticate,
  requirePermissions('billing:admin'),
  zValidator('query', disbursementListSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const filters = c.req.valid('query');

    const { billingService } = await import('../services/billing/billing.service.js');
    const result = await billingService.listDisbursements(tenantId, filters);

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

billingRoutes.post(
  '/revenue/disbursements',
  authenticate,
  requirePermissions('billing:admin'),
  zValidator('json', disbursementCreateSchema),
  async (c) => {
    const tenantId = c.get('tenantId');
    const userId = c.get('userId');
    const body = c.req.valid('json');

    const { billingService } = await import('../services/billing/billing.service.js');
    const disbursement = await billingService.createDisbursementBatch(tenantId, userId, body);

    logger.info({
      tenantId,
      userId,
      recipientAgencyId: body.recipientAgencyId,
      amount: body.amount,
    }, 'Disbursement batch created');

    return c.json({ success: true, data: disbursement }, 201);
  }
);

export { billingRoutes };
