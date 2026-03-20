import { queryWithTenant, query, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  AppError,
} from '../../utils/errors.js';
import type {
  Invoice,
  InvoiceLineItem,
  PaymentStatus,
  Currency,
  GovernmentDisbursement,
  DisbursementStatus,
} from '../../../../shared/types/billing.js';
import type { UUID, PaginatedResponse } from '../../../../shared/types/common.js';

// ─── Input DTOs ───

export interface CreateLineItemInput {
  description: string;
  category: InvoiceLineItem['category'];
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  revenueRecipient: 'platform' | 'government';
  metadata?: Record<string, unknown>;
}

export interface ListInvoicesFilters {
  status?: PaymentStatus | PaymentStatus[];
  dateFrom?: string;
  dateTo?: string;
  category?: InvoiceLineItem['category'];
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'issued_at' | 'total_amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  platformRevenue: number;
  governmentRevenue: number;
  byCategory: Record<string, number>;
  byRegion: Record<string, number>;
  invoiceCount: number;
  currency: Currency;
}

export interface GovernmentRevenueSummary {
  region: string;
  regulatoryAuthority: string;
  period: string;
  totalCollected: number;
  totalDisbursed: number;
  pendingDisbursement: number;
  currency: Currency;
  recordCount: number;
  byCategory: Record<string, number>;
}

// ─── Service ───

export class InvoiceService {
  private readonly log = logger.child({ service: 'InvoiceService' });

  /**
   * Create an invoice with line items, calculating totals and separating
   * government vs platform fees.
   */
  async createInvoice(
    tenantId: UUID,
    subscriptionId: UUID | null,
    lineItems: CreateLineItemInput[]
  ): Promise<Invoice> {
    this.log.info({ tenantId, subscriptionId, lineItemCount: lineItems.length }, 'Creating invoice');

    if (lineItems.length === 0) {
      throw new ValidationError('Invoice must have at least one line item');
    }

    return withTransaction(tenantId, async (client) => {
      // Calculate totals
      let subtotal = 0;
      let governmentFees = 0;
      let platformFees = 0;

      for (const item of lineItems) {
        const totalPrice = item.quantity * item.unitPrice;
        subtotal += totalPrice;
        if (item.revenueRecipient === 'government') {
          governmentFees += totalPrice;
        } else {
          platformFees += totalPrice;
        }
      }

      const invoiceNumber = await this.generateInvoiceNumber(client);

      // Create invoice
      const invoiceResult = await client.query<Invoice>(
        `INSERT INTO invoices (
          tenant_id, subscription_id, invoice_number, status, currency,
          subtotal, tax_amount, tax_rate, government_fees, platform_fees,
          total_amount, issued_at, due_date
        ) VALUES (
          $1, $2, $3, 'pending', $4,
          $5, 0, 0, $6, $7,
          $5, NOW(), NOW() + INTERVAL '30 days'
        )
        RETURNING *`,
        [
          tenantId,
          subscriptionId,
          invoiceNumber,
          'USD', // Default currency; will be overridden if subscription has a currency
          subtotal,
          governmentFees,
          platformFees,
        ]
      );

      const invoiceId = (invoiceResult.rows[0] as any).id;

      // If subscription exists, use its currency
      if (subscriptionId) {
        const subResult = await client.query(
          `SELECT currency FROM subscriptions WHERE id = $1`,
          [subscriptionId]
        );
        if (subResult.rows.length > 0) {
          await client.query(
            `UPDATE invoices SET currency = $1 WHERE id = $2`,
            [subResult.rows[0].currency, invoiceId]
          );
        }
      }

      // Create line items
      for (const item of lineItems) {
        const totalPrice = item.quantity * item.unitPrice;
        await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id, description, category, quantity, unit_price, total_price,
            taxable, revenue_recipient, metadata
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9
          )`,
          [
            invoiceId,
            item.description,
            item.category,
            item.quantity,
            item.unitPrice,
            totalPrice,
            item.taxable,
            item.revenueRecipient,
            item.metadata ? JSON.stringify(item.metadata) : null,
          ]
        );
      }

      // Fetch complete invoice with line items
      const fullInvoice = await client.query<Invoice>(
        `SELECT * FROM invoices WHERE id = $1`,
        [invoiceId]
      );

      const lineItemsResult = await client.query<InvoiceLineItem>(
        `SELECT * FROM invoice_line_items WHERE invoice_id = $1 ORDER BY created_at ASC`,
        [invoiceId]
      );

      this.log.info({ invoiceId, invoiceNumber, totalAmount: subtotal }, 'Invoice created');

      const mapped = this.mapInvoiceRow(fullInvoice.rows[0]);
      mapped.lineItems = lineItemsResult.rows.map((row) => this.mapLineItemRow(row));
      return mapped;
    });
  }

  /**
   * Get an invoice by ID with all line items.
   */
  async getInvoice(invoiceId: UUID, tenantId: UUID): Promise<Invoice> {
    const invoiceResult = await queryWithTenant<Invoice>(
      tenantId,
      `SELECT * FROM invoices WHERE id = $1 AND tenant_id = $2`,
      [invoiceId, tenantId]
    );

    if (invoiceResult.rows.length === 0) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    const lineItemsResult = await queryWithTenant<InvoiceLineItem>(
      tenantId,
      `SELECT * FROM invoice_line_items WHERE invoice_id = $1 ORDER BY created_at ASC`,
      [invoiceId]
    );

    const invoice = this.mapInvoiceRow(invoiceResult.rows[0]);
    invoice.lineItems = lineItemsResult.rows.map((row) => this.mapLineItemRow(row));
    return invoice;
  }

  /**
   * Paginated list of invoices with filters.
   */
  async listInvoices(
    tenantId: UUID,
    filters: ListInvoicesFilters = {}
  ): Promise<PaginatedResponse<Invoice>> {
    const {
      status,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 25,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const conditions: string[] = ['i.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramIndex = 2;

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      conditions.push(`i.status = ANY($${paramIndex})`);
      params.push(statuses);
      paramIndex++;
    }

    if (dateFrom) {
      conditions.push(`i.issued_at >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      conditions.push(`i.issued_at <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const allowedSortColumns: Record<string, string> = {
      created_at: 'i.created_at',
      issued_at: 'i.issued_at',
      total_amount: 'i.total_amount',
      status: 'i.status',
    };
    const sortColumn = allowedSortColumns[sortBy] ?? 'i.created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*) as count FROM invoices i WHERE ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const dataResult = await queryWithTenant<Invoice>(
      tenantId,
      `SELECT i.* FROM invoices i
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    // Fetch line items for all returned invoices
    const invoices = dataResult.rows.map((row) => this.mapInvoiceRow(row));
    if (invoices.length > 0) {
      const invoiceIds = invoices.map((inv) => inv.id);
      const lineItemsResult = await queryWithTenant<InvoiceLineItem & { invoice_id: string }>(
        tenantId,
        `SELECT * FROM invoice_line_items
         WHERE invoice_id = ANY($1)
         ORDER BY created_at ASC`,
        [invoiceIds]
      );

      const lineItemsByInvoice = new Map<string, InvoiceLineItem[]>();
      for (const row of lineItemsResult.rows) {
        const invoiceId = (row as any).invoice_id ?? (row as any).invoiceId;
        if (!lineItemsByInvoice.has(invoiceId)) {
          lineItemsByInvoice.set(invoiceId, []);
        }
        lineItemsByInvoice.get(invoiceId)!.push(this.mapLineItemRow(row));
      }

      for (const invoice of invoices) {
        invoice.lineItems = lineItemsByInvoice.get(invoice.id) ?? [];
      }
    }

    return {
      data: invoices,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Generate a sequential invoice number: SKW-INV-YYYY-NNNNNN.
   */
  async generateInvoiceNumber(client?: any): Promise<string> {
    const year = new Date().getFullYear();
    const queryFn = client
      ? (text: string, params: unknown[]) => client.query(text, params)
      : (text: string, params: unknown[]) => query(text, params);

    const result = await queryFn(
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

  /**
   * Process payment for an invoice: charge payment method, update status,
   * record government revenue.
   */
  async processPayment(invoiceId: UUID, paymentMethodId: UUID): Promise<Invoice> {
    this.log.info({ invoiceId, paymentMethodId }, 'Processing payment');

    return withTransaction(invoiceId, async (client) => {
      // Lock invoice
      const invoiceResult = await client.query<Invoice>(
        `SELECT * FROM invoices WHERE id = $1 FOR UPDATE`,
        [invoiceId]
      );

      if (invoiceResult.rows.length === 0) {
        throw new NotFoundError('Invoice', invoiceId);
      }

      const invoice = invoiceResult.rows[0];
      const currentStatus = (invoice as any).status;

      if (currentStatus === 'succeeded') {
        throw new ConflictError('Invoice has already been paid');
      }

      if (currentStatus === 'refunded') {
        throw new ConflictError('Invoice has been refunded');
      }

      // Verify payment method exists
      const pmResult = await client.query(
        `SELECT * FROM payment_methods WHERE id = $1`,
        [paymentMethodId]
      );

      if (pmResult.rows.length === 0) {
        throw new NotFoundError('PaymentMethod', paymentMethodId);
      }

      // TODO: Integrate with actual payment processor (Stripe, Paystack, Flutterwave)
      // For now, mark as succeeded
      const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const updateResult = await client.query<Invoice>(
        `UPDATE invoices
         SET status = 'succeeded',
             paid_at = NOW(),
             payment_method = $1,
             payment_reference = $2,
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [pmResult.rows[0].type, paymentReference, invoiceId]
      );

      // Update any related registration or subscription records
      await client.query(
        `UPDATE drone_registrations
         SET status = 'active',
             fee_paid_at = NOW(),
             updated_at = NOW()
         WHERE fee_invoice_id = $1
           AND status = 'pending_payment'`,
        [invoiceId]
      );

      this.log.info(
        { invoiceId, paymentReference, amount: (invoice as any).total_amount },
        'Payment processed'
      );

      const mapped = this.mapInvoiceRow(updateResult.rows[0]);

      // Fetch line items
      const lineItemsResult = await client.query<InvoiceLineItem>(
        `SELECT * FROM invoice_line_items WHERE invoice_id = $1`,
        [invoiceId]
      );
      mapped.lineItems = lineItemsResult.rows.map((row) => this.mapLineItemRow(row));

      return mapped;
    });
  }

  /**
   * Full refund of an invoice. Updates government revenue records accordingly.
   */
  async refundInvoice(invoiceId: UUID, reason?: string): Promise<Invoice> {
    this.log.info({ invoiceId, reason }, 'Refunding invoice');

    return withTransaction(invoiceId, async (client) => {
      const invoiceResult = await client.query<Invoice>(
        `SELECT * FROM invoices WHERE id = $1 FOR UPDATE`,
        [invoiceId]
      );

      if (invoiceResult.rows.length === 0) {
        throw new NotFoundError('Invoice', invoiceId);
      }

      const invoice = invoiceResult.rows[0];
      const currentStatus = (invoice as any).status;

      if (currentStatus !== 'succeeded') {
        throw new ValidationError(`Cannot refund invoice with status: ${currentStatus}`);
      }

      // Update invoice status
      const updateResult = await client.query<Invoice>(
        `UPDATE invoices
         SET status = 'refunded',
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [invoiceId]
      );

      // Mark related government revenue records as needing adjustment
      await client.query(
        `UPDATE government_revenue_records
         SET gross_amount = 0,
             platform_commission = 0,
             government_amount = 0,
             description = description || ' [REFUNDED]'
         WHERE reference_id IN (
           SELECT CAST(metadata->>'registrationId' AS TEXT)
           FROM invoice_line_items
           WHERE invoice_id = $1
             AND metadata->>'registrationId' IS NOT NULL
         )`,
        [invoiceId]
      );

      this.log.info({ invoiceId, reason }, 'Invoice refunded');

      const mapped = this.mapInvoiceRow(updateResult.rows[0]);
      const lineItemsResult = await client.query<InvoiceLineItem>(
        `SELECT * FROM invoice_line_items WHERE invoice_id = $1`,
        [invoiceId]
      );
      mapped.lineItems = lineItemsResult.rows.map((row) => this.mapLineItemRow(row));
      return mapped;
    });
  }

  /**
   * Manual payment confirmation (wire transfer / mobile money).
   */
  async markAsPaid(invoiceId: UUID, paymentReference?: string): Promise<Invoice> {
    this.log.info({ invoiceId, paymentReference }, 'Marking invoice as paid (manual)');

    const result = await query<Invoice>(
      `UPDATE invoices
       SET status = 'succeeded',
           paid_at = NOW(),
           payment_reference = $1,
           updated_at = NOW()
       WHERE id = $2
         AND status IN ('pending', 'processing')
       RETURNING *`,
      [paymentReference ?? null, invoiceId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    // Activate any pending registrations linked to this invoice
    await query(
      `UPDATE drone_registrations
       SET status = 'active',
           fee_paid_at = NOW(),
           updated_at = NOW()
       WHERE fee_invoice_id = $1
         AND status = 'pending_payment'`,
      [invoiceId]
    );

    this.log.info({ invoiceId }, 'Invoice marked as paid');

    const mapped = this.mapInvoiceRow(result.rows[0]);
    const lineItemsResult = await query<InvoiceLineItem>(
      `SELECT * FROM invoice_line_items WHERE invoice_id = $1`,
      [invoiceId]
    );
    mapped.lineItems = lineItemsResult.rows.map((row) => this.mapLineItemRow(row));
    return mapped;
  }

  /**
   * Revenue breakdown report: platform vs government, by category, by region.
   */
  async getRevenueReport(
    tenantId: UUID | undefined,
    period: { start: string; end: string }
  ): Promise<RevenueReport> {
    const conditions: string[] = [
      `i.status = 'succeeded'`,
      `i.paid_at >= $1`,
      `i.paid_at <= $2`,
    ];
    const params: unknown[] = [period.start, period.end];
    let paramIndex = 3;

    if (tenantId) {
      conditions.push(`i.tenant_id = $${paramIndex}`);
      params.push(tenantId);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query<{
      total_revenue: string;
      platform_revenue: string;
      government_revenue: string;
      invoice_count: string;
      currency: Currency;
    }>(
      `SELECT
        COALESCE(SUM(i.total_amount), 0) AS total_revenue,
        COALESCE(SUM(i.platform_fees), 0) AS platform_revenue,
        COALESCE(SUM(i.government_fees), 0) AS government_revenue,
        COUNT(*) AS invoice_count,
        COALESCE(MIN(i.currency), 'USD') AS currency
       FROM invoices i
       WHERE ${whereClause}`,
      params
    );

    // Revenue by category
    const categoryResult = await query<{ category: string; total: string }>(
      `SELECT li.category, COALESCE(SUM(li.total_price), 0) AS total
       FROM invoice_line_items li
       JOIN invoices i ON li.invoice_id = i.id
       WHERE ${whereClause}
       GROUP BY li.category`,
      params
    );

    const byCategory: Record<string, number> = {};
    for (const row of categoryResult.rows) {
      byCategory[row.category] = parseInt(row.total, 10);
    }

    // Revenue by region (from government revenue records)
    const regionResult = await query<{ region: string; total: string }>(
      `SELECT region, COALESCE(SUM(gross_amount), 0) AS total
       FROM government_revenue_records
       WHERE period_start >= $1 AND period_end <= $2
       ${tenantId ? `AND tenant_id = $${paramIndex}` : ''}
       GROUP BY region`,
      tenantId ? [period.start, period.end, tenantId] : [period.start, period.end]
    );

    const byRegion: Record<string, number> = {};
    for (const row of regionResult.rows) {
      byRegion[row.region] = parseInt(row.total, 10);
    }

    const row = result.rows[0];
    return {
      period: `${period.start} to ${period.end}`,
      totalRevenue: parseInt(row.total_revenue, 10),
      platformRevenue: parseInt(row.platform_revenue, 10),
      governmentRevenue: parseInt(row.government_revenue, 10),
      byCategory,
      byRegion,
      invoiceCount: parseInt(row.invoice_count, 10),
      currency: row.currency,
    };
  }

  /**
   * Get a summary of what's owed to a specific government authority.
   */
  async getGovernmentRevenueSummary(
    region: string,
    period: { start: string; end: string }
  ): Promise<GovernmentRevenueSummary> {
    const result = await query<{
      regulatory_authority: string;
      total_collected: string;
      total_disbursed: string;
      pending_disbursement: string;
      currency: Currency;
      record_count: string;
    }>(
      `SELECT
        COALESCE(MIN(regulatory_authority), '') AS regulatory_authority,
        COALESCE(SUM(government_amount), 0) AS total_collected,
        COALESCE(SUM(CASE WHEN disbursed = true THEN government_amount ELSE 0 END), 0) AS total_disbursed,
        COALESCE(SUM(CASE WHEN disbursed = false THEN government_amount ELSE 0 END), 0) AS pending_disbursement,
        COALESCE(MIN(currency), 'USD') AS currency,
        COUNT(*) AS record_count
       FROM government_revenue_records
       WHERE region = $1
         AND period_start >= $2
         AND period_end <= $3`,
      [region, period.start, period.end]
    );

    const categoryResult = await query<{ category: string; total: string }>(
      `SELECT category, COALESCE(SUM(government_amount), 0) AS total
       FROM government_revenue_records
       WHERE region = $1
         AND period_start >= $2
         AND period_end <= $3
       GROUP BY category`,
      [region, period.start, period.end]
    );

    const byCategory: Record<string, number> = {};
    for (const row of categoryResult.rows) {
      byCategory[row.category] = parseInt(row.total, 10);
    }

    const row = result.rows[0];
    return {
      region,
      regulatoryAuthority: row.regulatory_authority,
      period: `${period.start} to ${period.end}`,
      totalCollected: parseInt(row.total_collected, 10),
      totalDisbursed: parseInt(row.total_disbursed, 10),
      pendingDisbursement: parseInt(row.pending_disbursement, 10),
      currency: row.currency,
      recordCount: parseInt(row.record_count, 10),
      byCategory,
    };
  }

  /**
   * Create a government disbursement batch for a region and period.
   */
  async createDisbursement(
    region: string,
    periodStart: string,
    periodEnd: string
  ): Promise<GovernmentDisbursement> {
    this.log.info({ region, periodStart, periodEnd }, 'Creating government disbursement');

    return withTransaction(region, async (client) => {
      // Find undisbursed records for this region and period
      const recordsResult = await client.query<{
        total: string;
        count: string;
        currency: Currency;
        regulatory_authority: string;
      }>(
        `SELECT
          COALESCE(SUM(government_amount), 0) AS total,
          COUNT(*) AS count,
          COALESCE(MIN(currency), 'USD') AS currency,
          COALESCE(MIN(regulatory_authority), '') AS regulatory_authority
         FROM government_revenue_records
         WHERE region = $1
           AND period_start >= $2
           AND period_end <= $3
           AND disbursed = false`,
        [region, periodStart, periodEnd]
      );

      const record = recordsResult.rows[0];
      const totalAmount = parseInt(record.total, 10);
      const recordCount = parseInt(record.count, 10);

      if (recordCount === 0) {
        throw new ValidationError(`No undisbursed records found for region ${region} in the specified period`);
      }

      // Create disbursement record
      const disbursementResult = await client.query<GovernmentDisbursement>(
        `INSERT INTO government_disbursements (
          region, regulatory_authority, period_start, period_end,
          total_amount, currency, record_count,
          status, disbursement_method
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          'pending', 'wire_transfer'
        )
        RETURNING *`,
        [
          region,
          record.regulatory_authority,
          periodStart,
          periodEnd,
          totalAmount,
          record.currency,
          recordCount,
        ]
      );

      this.log.info(
        {
          disbursementId: (disbursementResult.rows[0] as any).id,
          totalAmount,
          recordCount,
        },
        'Government disbursement created'
      );

      return this.mapDisbursementRow(disbursementResult.rows[0]);
    });
  }

  /**
   * Mark a disbursement as completed with a payment reference.
   */
  async completeDisbursement(
    disbursementId: UUID,
    reference: string
  ): Promise<GovernmentDisbursement> {
    this.log.info({ disbursementId, reference }, 'Completing disbursement');

    return withTransaction(disbursementId, async (client) => {
      // Update disbursement
      const disbursementResult = await client.query<GovernmentDisbursement>(
        `UPDATE government_disbursements
         SET status = 'completed',
             reference = $1,
             completed_at = NOW()
         WHERE id = $2
           AND status IN ('pending', 'processing')
         RETURNING *`,
        [reference, disbursementId]
      );

      if (disbursementResult.rows.length === 0) {
        throw new NotFoundError('GovernmentDisbursement', disbursementId);
      }

      const disbursement = disbursementResult.rows[0];
      const region = (disbursement as any).region;
      const periodStart = (disbursement as any).period_start ?? (disbursement as any).periodStart;
      const periodEnd = (disbursement as any).period_end ?? (disbursement as any).periodEnd;

      // Mark all related government revenue records as disbursed
      await client.query(
        `UPDATE government_revenue_records
         SET disbursed = true,
             disbursed_at = NOW(),
             disbursement_reference = $1
         WHERE region = $2
           AND period_start >= $3
           AND period_end <= $4
           AND disbursed = false`,
        [reference, region, periodStart, periodEnd]
      );

      this.log.info({ disbursementId, reference }, 'Disbursement completed');
      return this.mapDisbursementRow(disbursement);
    });
  }

  /**
   * Generate invoice PDF (placeholder — returns a URL).
   */
  async generatePdf(invoiceId: UUID): Promise<string> {
    this.log.info({ invoiceId }, 'Generating invoice PDF');

    // TODO: Integrate with PDF generation service (Puppeteer, WeasyPrint, etc.)
    const pdfUrl = `/api/v1/invoices/${invoiceId}/pdf`;

    await query(
      `UPDATE invoices SET pdf_url = $1, updated_at = NOW() WHERE id = $2`,
      [pdfUrl, invoiceId]
    );

    this.log.info({ invoiceId, pdfUrl }, 'Invoice PDF generated');
    return pdfUrl;
  }

  /**
   * Send invoice notification email (placeholder).
   */
  async sendInvoiceEmail(invoiceId: UUID): Promise<void> {
    this.log.info({ invoiceId }, 'Sending invoice email');

    // TODO: Integrate with email service (SendGrid, SES, Resend)
    // For now, just log the intent
    const invoiceResult = await query<Invoice>(
      `SELECT * FROM invoices WHERE id = $1`,
      [invoiceId]
    );

    if (invoiceResult.rows.length === 0) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    const invoice = invoiceResult.rows[0];
    const tenantId = (invoice as any).tenant_id ?? (invoice as any).tenantId;

    this.log.info(
      {
        invoiceId,
        tenantId,
        invoiceNumber: (invoice as any).invoice_number ?? (invoice as any).invoiceNumber,
        totalAmount: (invoice as any).total_amount ?? (invoice as any).totalAmount,
      },
      'Invoice email notification queued'
    );
  }

  // ─── Private Helpers ───

  private mapInvoiceRow(row: Record<string, any>): Invoice {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      subscriptionId: row.subscription_id ?? row.subscriptionId,
      invoiceNumber: row.invoice_number ?? row.invoiceNumber,
      status: row.status,
      currency: row.currency,
      lineItems: [], // Populated separately
      subtotal: parseInt(String(row.subtotal ?? 0), 10),
      taxAmount: parseInt(String(row.tax_amount ?? row.taxAmount ?? 0), 10),
      taxRate: parseFloat(String(row.tax_rate ?? row.taxRate ?? 0)),
      governmentFees: parseInt(String(row.government_fees ?? row.governmentFees ?? 0), 10),
      platformFees: parseInt(String(row.platform_fees ?? row.platformFees ?? 0), 10),
      totalAmount: parseInt(String(row.total_amount ?? row.totalAmount ?? 0), 10),
      issuedAt: row.issued_at ?? row.issuedAt,
      dueDate: row.due_date ?? row.dueDate,
      paidAt: row.paid_at ?? row.paidAt ?? undefined,
      paymentMethod: row.payment_method ?? row.paymentMethod ?? undefined,
      paymentReference: row.payment_reference ?? row.paymentReference ?? undefined,
      receiptUrl: row.receipt_url ?? row.receiptUrl ?? undefined,
      pdfUrl: row.pdf_url ?? row.pdfUrl ?? undefined,
      createdAt: row.created_at ?? row.createdAt,
    };
  }

  private mapLineItemRow(row: Record<string, any>): InvoiceLineItem {
    return {
      id: row.id,
      description: row.description,
      category: row.category,
      quantity: parseInt(String(row.quantity ?? 0), 10),
      unitPrice: parseInt(String(row.unit_price ?? row.unitPrice ?? 0), 10),
      totalPrice: parseInt(String(row.total_price ?? row.totalPrice ?? 0), 10),
      taxable: row.taxable ?? false,
      revenueRecipient: row.revenue_recipient ?? row.revenueRecipient,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata ?? undefined),
    };
  }

  private mapDisbursementRow(row: Record<string, any>): GovernmentDisbursement {
    return {
      id: row.id,
      region: row.region,
      regulatoryAuthority: row.regulatory_authority ?? row.regulatoryAuthority,
      periodStart: row.period_start ?? row.periodStart,
      periodEnd: row.period_end ?? row.periodEnd,
      totalAmount: parseInt(String(row.total_amount ?? row.totalAmount ?? 0), 10),
      currency: row.currency,
      recordCount: parseInt(String(row.record_count ?? row.recordCount ?? 0), 10),
      status: row.status,
      disbursementMethod: row.disbursement_method ?? row.disbursementMethod,
      reference: row.reference ?? undefined,
      completedAt: row.completed_at ?? row.completedAt ?? undefined,
      createdAt: row.created_at ?? row.createdAt,
    };
  }
}

export const invoiceService = new InvoiceService();
