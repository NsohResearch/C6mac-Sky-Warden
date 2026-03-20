import { queryWithTenant, withTransaction } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
  AppError,
} from '../../utils/errors.js';
import type {
  DroneRegistration,
  RegistrationType,
  RegistrationStatus,
  TemporaryPermit,
  TemporaryPermitType,
  TemporaryPermitApplicantType,
  TemporaryPermitDuration,
  PermitDocument,
  Currency,
} from '../../../../shared/types/billing.js';
import { REGISTRATION_FEE_SCHEDULES } from '../../../../shared/types/billing.js';
import type { UUID, PaginatedResponse } from '../../../../shared/types/common.js';

// ─── Input DTOs ───

export interface TemporaryPermitInput {
  droneId: string;
  ownerId: string;
  region: string;
  permitType: TemporaryPermitType;
  applicantType: TemporaryPermitApplicantType;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantNationality: string;
  passportNumber?: string;
  visaNumber?: string;
  localContactName?: string;
  localContactPhone?: string;
  purpose: string;
  operationDescription: string;
  operationLocations: string[];
  operationArea?: unknown;
  startDate: string;
  customDurationDays?: number;
  droneRegistrationIds?: string[];
  securityDeposit?: number;
  requiredDocuments?: PermitDocument[];
}

export interface ListRegistrationsFilters {
  status?: RegistrationStatus | RegistrationStatus[];
  registrationType?: RegistrationType;
  region?: string;
  expiringBefore?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'expires_at' | 'registration_number' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface RegistrationStats {
  totalRegistrations: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byRegion: Record<string, number>;
  totalRevenueGenerated: number;
  governmentRevenue: number;
  platformRevenue: number;
}

// ─── Service ───

export class RegistrationService {
  private readonly log = logger.child({ service: 'RegistrationService' });

  /**
   * Full drone registration flow (like automobile registration).
   */
  async registerDrone(
    tenantId: UUID,
    droneId: UUID,
    ownerId: UUID,
    registrationType: RegistrationType,
    region: string
  ): Promise<DroneRegistration> {
    this.log.info({ tenantId, droneId, registrationType, region }, 'Registering drone');

    return withTransaction(tenantId, async (client) => {
      // 1. Validate drone exists and belongs to tenant
      const droneResult = await client.query(
        `SELECT * FROM drones WHERE id = $1 AND tenant_id = $2`,
        [droneId, tenantId]
      );

      if (droneResult.rows.length === 0) {
        throw new NotFoundError('Drone', droneId);
      }

      const drone = droneResult.rows[0];

      // 2. Check no active registration already exists
      const existingReg = await client.query(
        `SELECT id FROM drone_registrations
         WHERE drone_id = $1 AND tenant_id = $2
           AND status IN ('active', 'pending_payment', 'pending_review')
         LIMIT 1`,
        [droneId, tenantId]
      );

      if (existingReg.rows.length > 0) {
        throw new ConflictError(`Drone ${droneId} already has an active registration`);
      }

      // 3. Generate unique identifiers
      const alphanumericChars = await this.generateUniqueAlphanumeric(client, 6);
      const digitalDroneId = `SKW-${region}-${alphanumericChars}`;
      const year = new Date().getFullYear();
      const registrationNumber = `SKW-${region}-${year}-${alphanumericChars}`;
      const verificationCode = `V-${await this.generateUniqueAlphanumeric(client, 6)}`;

      // 4. Get owner details
      const ownerResult = await client.query(
        `SELECT full_name, email, address FROM users WHERE id = $1`,
        [ownerId]
      );

      if (ownerResult.rows.length === 0) {
        throw new NotFoundError('User', ownerId);
      }

      const owner = ownerResult.rows[0];

      // 5. Look up fee schedule
      const feeSchedule = REGISTRATION_FEE_SCHEDULES[region];
      if (!feeSchedule) {
        throw new ValidationError(`No fee schedule found for region: ${region}`);
      }

      // 6. Determine fee based on registration type
      let registrationFee: number;
      switch (registrationType) {
        case 'standard':
          registrationFee = feeSchedule.standardAnnualFee;
          break;
        case 'commercial':
          registrationFee = feeSchedule.commercialAnnualFee;
          break;
        case 'government':
          registrationFee = feeSchedule.governmentFee;
          break;
        case 'educational':
          registrationFee = feeSchedule.educationalFee;
          break;
        default:
          registrationFee = feeSchedule.standardAnnualFee;
      }

      // 7. Calculate revenue split
      const governmentPortion = Math.round(registrationFee * feeSchedule.governmentRevenueSplit);
      const platformPortion = registrationFee - governmentPortion;

      // 8. Determine regulatory authority from region
      const authorityMap: Record<string, { authority: string; country: string }> = {
        US: { authority: 'FAA', country: 'United States' },
        CA: { authority: 'Transport Canada', country: 'Canada' },
        NG: { authority: 'NCAA', country: 'Nigeria' },
        KE: { authority: 'KCAA', country: 'Kenya' },
        ZA: { authority: 'SACAA', country: 'South Africa' },
        GH: { authority: 'GCAA', country: 'Ghana' },
        RW: { authority: 'RCAA', country: 'Rwanda' },
      };

      const regionInfo = authorityMap[region] ?? { authority: 'Unknown', country: region };

      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // 9. Create registration record
      const regResult = await client.query<DroneRegistration>(
        `INSERT INTO drone_registrations (
          tenant_id, drone_id, owner_id,
          digital_drone_id, registration_number, region, country, regulatory_authority,
          registration_type, status,
          issued_at, expires_at,
          drone_manufacturer, drone_model, drone_serial_number, drone_category,
          drone_weight_grams, remote_id_serial,
          owner_name, owner_email, owner_address,
          registration_fee, currency,
          government_portion_fee, platform_portion_fee,
          verification_code, publicly_verifiable,
          renewal_reminder_sent, auto_renew
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6, $7, $8,
          $9, 'pending_payment',
          NOW(), $10,
          $11, $12, $13, $14,
          $15, $16,
          $17, $18, $19,
          $20, $21,
          $22, $23,
          $24, true,
          false, false
        )
        RETURNING *`,
        [
          tenantId, droneId, ownerId,
          digitalDroneId, registrationNumber, region, regionInfo.country, regionInfo.authority,
          registrationType,
          expiresAt.toISOString(),
          drone.manufacturer, drone.model, drone.serial_number, drone.category,
          drone.weight_grams, drone.remote_id_serial_number ?? null,
          owner.full_name, owner.email, owner.address ?? null,
          registrationFee, feeSchedule.currency,
          governmentPortion, platformPortion,
          verificationCode,
        ]
      );

      const registration = regResult.rows[0];
      const registrationId = (registration as any).id;

      // 10. Create invoice with registration fee
      if (registrationFee > 0) {
        const invoiceNumber = await this.generateInvoiceNumber(client);

        const invoiceResult = await client.query<{ id: string }>(
          `INSERT INTO invoices (
            tenant_id, subscription_id, invoice_number, status, currency,
            subtotal, tax_amount, tax_rate, government_fees, platform_fees,
            total_amount, issued_at, due_date
          ) VALUES (
            $1, NULL, $2, 'pending', $3,
            $4, 0, 0, $5, $6,
            $4, NOW(), NOW() + INTERVAL '30 days'
          )
          RETURNING id`,
          [
            tenantId,
            invoiceNumber,
            feeSchedule.currency,
            registrationFee,
            governmentPortion,
            platformPortion,
          ]
        );

        await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id, description, category, quantity, unit_price, total_price,
            taxable, revenue_recipient, metadata
          ) VALUES (
            $1, $2, 'government_fee', 1, $3, $3,
            false, 'government', $4
          )`,
          [
            invoiceResult.rows[0].id,
            `Drone registration fee - ${registrationType} (${region})`,
            registrationFee,
            JSON.stringify({
              registrationId,
              droneId,
              region,
              registrationType,
            }),
          ]
        );

        // Update registration with invoice reference
        await client.query(
          `UPDATE drone_registrations SET fee_invoice_id = $1 WHERE id = $2`,
          [invoiceResult.rows[0].id, registrationId]
        );
      }

      // 11. Create government revenue record
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await client.query(
        `INSERT INTO government_revenue_records (
          region, regulatory_authority, category, description,
          gross_amount, platform_commission, government_amount, currency,
          reference_id, reference_type, tenant_id, user_id,
          disbursed, period_start, period_end
        ) VALUES (
          $1, $2, 'registration', $3,
          $4, $5, $6, $7,
          $8, 'drone_registration', $9, $10,
          false, $11, $12
        )`,
        [
          region,
          regionInfo.authority,
          `Drone registration: ${digitalDroneId}`,
          registrationFee,
          platformPortion,
          governmentPortion,
          feeSchedule.currency,
          registrationId,
          tenantId,
          ownerId,
          periodStart.toISOString(),
          periodEnd.toISOString(),
        ]
      );

      this.log.info(
        { registrationId, digitalDroneId, registrationNumber },
        'Drone registration created'
      );
      return this.mapRegistrationRow(registration);
    });
  }

  /**
   * Register a temporary drone permit (short-term / non-resident operators).
   */
  async registerTemporaryDrone(
    tenantId: UUID,
    permitData: TemporaryPermitInput
  ): Promise<{ registration: DroneRegistration; permit: TemporaryPermit }> {
    this.log.info(
      { tenantId, droneId: permitData.droneId, permitType: permitData.permitType },
      'Registering temporary drone permit'
    );

    return withTransaction(tenantId, async (client) => {
      // 1. Calculate duration based on permit type
      const durationMap: Record<TemporaryPermitType, number> = {
        tourist: 7,
        researcher: 30,
        temporary_operator: 90,
        event: permitData.customDurationDays ?? 1,
      };

      const durationDays = durationMap[permitData.permitType];
      const startDate = new Date(permitData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + durationDays);

      // 2. Generate identifiers
      const alphanumericChars = await this.generateUniqueAlphanumeric(client, 6);
      const digitalDroneId = `SKW-${permitData.region}-${alphanumericChars}`;
      const year = new Date().getFullYear();
      const registrationNumber = `SKW-${permitData.region}-${year}-${alphanumericChars}`;
      const verificationCode = `V-${await this.generateUniqueAlphanumeric(client, 6)}`;

      // 3. Look up fee schedule
      const feeSchedule = REGISTRATION_FEE_SCHEDULES[permitData.region];
      if (!feeSchedule) {
        throw new ValidationError(`No fee schedule found for region: ${permitData.region}`);
      }

      // 4. Calculate temporary fee
      let permitFee: number;
      switch (permitData.permitType) {
        case 'tourist':
          permitFee = feeSchedule.temporaryFees.tourist7Day;
          break;
        case 'researcher':
          permitFee = feeSchedule.temporaryFees.researcher30Day;
          break;
        case 'temporary_operator':
          permitFee = feeSchedule.temporaryFees.temporaryOperator90Day;
          break;
        case 'event':
          permitFee = feeSchedule.temporaryFees.eventPerDay * durationDays;
          break;
        default:
          permitFee = feeSchedule.temporaryFees.tourist7Day;
      }

      const governmentPortion = Math.round(permitFee * feeSchedule.governmentRevenueSplit);
      const platformPortion = permitFee - governmentPortion;

      // 5. Get drone details for snapshot
      const droneResult = await client.query(
        `SELECT * FROM drones WHERE id = $1 AND tenant_id = $2`,
        [permitData.droneId, tenantId]
      );

      if (droneResult.rows.length === 0) {
        throw new NotFoundError('Drone', permitData.droneId);
      }

      const drone = droneResult.rows[0];

      const authorityMap: Record<string, { authority: string; country: string }> = {
        US: { authority: 'FAA', country: 'United States' },
        CA: { authority: 'Transport Canada', country: 'Canada' },
        NG: { authority: 'NCAA', country: 'Nigeria' },
        KE: { authority: 'KCAA', country: 'Kenya' },
        ZA: { authority: 'SACAA', country: 'South Africa' },
        GH: { authority: 'GCAA', country: 'Ghana' },
        RW: { authority: 'RCAA', country: 'Rwanda' },
      };

      const regionInfo = authorityMap[permitData.region] ?? {
        authority: 'Unknown',
        country: permitData.region,
      };

      // 6. Create drone_registration with type='temporary'
      const regResult = await client.query<DroneRegistration>(
        `INSERT INTO drone_registrations (
          tenant_id, drone_id, owner_id,
          digital_drone_id, registration_number, region, country, regulatory_authority,
          registration_type, temporary_permit_type, status,
          issued_at, expires_at,
          drone_manufacturer, drone_model, drone_serial_number, drone_category,
          drone_weight_grams, remote_id_serial,
          owner_name, owner_email,
          registration_fee, currency,
          government_portion_fee, platform_portion_fee,
          verification_code, publicly_verifiable,
          renewal_reminder_sent, auto_renew
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6, $7, $8,
          'temporary', $9, 'pending_payment',
          NOW(), $10,
          $11, $12, $13, $14,
          $15, $16,
          $17, $18,
          $19, $20,
          $21, $22,
          $23, true,
          false, false
        )
        RETURNING *`,
        [
          tenantId, permitData.droneId, permitData.ownerId,
          digitalDroneId, registrationNumber, permitData.region,
          regionInfo.country, regionInfo.authority,
          permitData.permitType,
          endDate.toISOString(),
          drone.manufacturer, drone.model, drone.serial_number, drone.category,
          drone.weight_grams, drone.remote_id_serial_number ?? null,
          permitData.applicantName, permitData.applicantEmail,
          permitFee, feeSchedule.currency,
          governmentPortion, platformPortion,
          verificationCode,
        ]
      );

      const registration = regResult.rows[0];
      const registrationId = (registration as any).id;

      // 7. Create temporary_permit record
      const duration: TemporaryPermitDuration = {
        type: permitData.permitType,
        days: durationDays,
        maxRenewals: permitData.permitType === 'event' ? 0 : 1,
        renewalCount: 0,
      };

      const permitResult = await client.query<TemporaryPermit>(
        `INSERT INTO temporary_permits (
          registration_id, permit_type, applicant_type,
          applicant_name, applicant_email, applicant_phone,
          applicant_nationality, passport_number, visa_number,
          local_contact_name, local_contact_phone,
          purpose, operation_description, operation_locations, operation_area,
          duration, start_date, end_date,
          drone_registration_ids,
          permit_fee, currency, security_deposit,
          status, required_documents
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6,
          $7, $8, $9,
          $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18,
          $19,
          $20, $21, $22,
          'submitted', $23
        )
        RETURNING *`,
        [
          registrationId,
          permitData.permitType,
          permitData.applicantType,
          permitData.applicantName,
          permitData.applicantEmail,
          permitData.applicantPhone,
          permitData.applicantNationality,
          permitData.passportNumber ?? null,
          permitData.visaNumber ?? null,
          permitData.localContactName ?? null,
          permitData.localContactPhone ?? null,
          permitData.purpose,
          permitData.operationDescription,
          permitData.operationLocations,
          permitData.operationArea ? JSON.stringify(permitData.operationArea) : null,
          JSON.stringify(duration),
          startDate.toISOString(),
          endDate.toISOString(),
          permitData.droneRegistrationIds ?? [registrationId],
          permitFee,
          feeSchedule.currency,
          permitData.securityDeposit ?? null,
          JSON.stringify(permitData.requiredDocuments ?? []),
        ]
      );

      // 8. Create invoice with permit fee + optional security deposit
      const totalInvoiceAmount = permitFee + (permitData.securityDeposit ?? 0);
      const invoiceNumber = await this.generateInvoiceNumber(client);

      const invoiceResult = await client.query<{ id: string }>(
        `INSERT INTO invoices (
          tenant_id, subscription_id, invoice_number, status, currency,
          subtotal, tax_amount, tax_rate, government_fees, platform_fees,
          total_amount, issued_at, due_date
        ) VALUES (
          $1, NULL, $2, 'pending', $3,
          $4, 0, 0, $5, $6,
          $4, NOW(), NOW() + INTERVAL '7 days'
        )
        RETURNING id`,
        [
          tenantId,
          invoiceNumber,
          feeSchedule.currency,
          totalInvoiceAmount,
          governmentPortion,
          platformPortion,
        ]
      );

      // Permit fee line item
      await client.query(
        `INSERT INTO invoice_line_items (
          invoice_id, description, category, quantity, unit_price, total_price,
          taxable, revenue_recipient, metadata
        ) VALUES (
          $1, $2, 'government_fee', 1, $3, $3,
          false, 'government', $4
        )`,
        [
          invoiceResult.rows[0].id,
          `Temporary permit fee - ${permitData.permitType} (${permitData.region}, ${durationDays} days)`,
          permitFee,
          JSON.stringify({
            registrationId,
            permitType: permitData.permitType,
            region: permitData.region,
            durationDays,
          }),
        ]
      );

      // Security deposit line item (if applicable)
      if (permitData.securityDeposit && permitData.securityDeposit > 0) {
        await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id, description, category, quantity, unit_price, total_price,
            taxable, revenue_recipient, metadata
          ) VALUES (
            $1, $2, 'government_fee', 1, $3, $3,
            false, 'platform', $4
          )`,
          [
            invoiceResult.rows[0].id,
            `Refundable security deposit - temporary permit`,
            permitData.securityDeposit,
            JSON.stringify({ registrationId, type: 'security_deposit' }),
          ]
        );
      }

      this.log.info(
        { registrationId, digitalDroneId, permitType: permitData.permitType },
        'Temporary drone permit created'
      );

      return {
        registration: this.mapRegistrationRow(registration),
        permit: this.mapPermitRow(permitResult.rows[0]),
      };
    });
  }

  /**
   * Get a registration by ID.
   */
  async getRegistration(registrationId: UUID, tenantId: UUID): Promise<DroneRegistration> {
    const result = await queryWithTenant<DroneRegistration>(
      tenantId,
      `SELECT * FROM drone_registrations
       WHERE id = $1 AND tenant_id = $2`,
      [registrationId, tenantId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('DroneRegistration', registrationId);
    }

    return this.mapRegistrationRow(result.rows[0]);
  }

  /**
   * Public lookup by Digital Drone ID (e.g., SKW-US-A7B3X9).
   */
  async getRegistrationByDDID(digitalDroneId: string): Promise<DroneRegistration> {
    // No tenant context — public lookup
    const result = await queryWithTenant<DroneRegistration>(
      '00000000-0000-0000-0000-000000000000', // Public context
      `SELECT * FROM drone_registrations
       WHERE digital_drone_id = $1
         AND publicly_verifiable = true`,
      [digitalDroneId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('DroneRegistration', digitalDroneId);
    }

    return this.mapRegistrationRow(result.rows[0]);
  }

  /**
   * Paginated list of registrations with filters.
   */
  async listRegistrations(
    tenantId: UUID,
    filters: ListRegistrationsFilters = {}
  ): Promise<PaginatedResponse<DroneRegistration>> {
    const {
      status,
      registrationType,
      region,
      expiringBefore,
      page = 1,
      pageSize = 25,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const conditions: string[] = ['tenant_id = $1'];
    const params: unknown[] = [tenantId];
    let paramIndex = 2;

    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      conditions.push(`status = ANY($${paramIndex})`);
      params.push(statuses);
      paramIndex++;
    }

    if (registrationType) {
      conditions.push(`registration_type = $${paramIndex}`);
      params.push(registrationType);
      paramIndex++;
    }

    if (region) {
      conditions.push(`region = $${paramIndex}`);
      params.push(region);
      paramIndex++;
    }

    if (expiringBefore) {
      conditions.push(`expires_at <= $${paramIndex}`);
      params.push(expiringBefore);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const allowedSortColumns: Record<string, string> = {
      created_at: 'created_at',
      expires_at: 'expires_at',
      registration_number: 'registration_number',
      status: 'status',
    };
    const sortColumn = allowedSortColumns[sortBy] ?? 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await queryWithTenant<{ count: string }>(
      tenantId,
      `SELECT COUNT(*) as count FROM drone_registrations WHERE ${whereClause}`,
      params
    );
    const totalItems = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const dataResult = await queryWithTenant<DroneRegistration>(
      tenantId,
      `SELECT * FROM drone_registrations
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: dataResult.rows.map((row) => this.mapRegistrationRow(row)),
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
   * Renew a registration for another year, create a new invoice, and extend expires_at.
   */
  async renewRegistration(registrationId: UUID, tenantId: UUID): Promise<DroneRegistration> {
    this.log.info({ registrationId, tenantId }, 'Renewing registration');

    return withTransaction(tenantId, async (client) => {
      const regResult = await client.query<DroneRegistration>(
        `SELECT * FROM drone_registrations
         WHERE id = $1 AND tenant_id = $2
         FOR UPDATE`,
        [registrationId, tenantId]
      );

      if (regResult.rows.length === 0) {
        throw new NotFoundError('DroneRegistration', registrationId);
      }

      const reg = regResult.rows[0];
      const status = (reg as any).status;
      const region = (reg as any).region;
      const registrationType = (reg as any).registration_type ?? (reg as any).registrationType;

      if (!['active', 'expired'].includes(status)) {
        throw new ValidationError(`Cannot renew registration with status: ${status}`);
      }

      const feeSchedule = REGISTRATION_FEE_SCHEDULES[region];
      if (!feeSchedule) {
        throw new ValidationError(`No fee schedule found for region: ${region}`);
      }

      // Determine renewal fee (apply late fee if expired)
      let baseFee: number;
      switch (registrationType) {
        case 'commercial':
          baseFee = feeSchedule.commercialAnnualFee;
          break;
        case 'government':
          baseFee = feeSchedule.governmentFee;
          break;
        case 'educational':
          baseFee = feeSchedule.educationalFee;
          break;
        default:
          baseFee = feeSchedule.standardAnnualFee;
      }

      let lateFee = 0;
      if (status === 'expired') {
        lateFee = Math.round(baseFee * (feeSchedule.lateFeePercentage / 100));
      }

      const totalFee = baseFee + lateFee;
      const governmentPortion = Math.round(totalFee * feeSchedule.governmentRevenueSplit);
      const platformPortion = totalFee - governmentPortion;

      // Create renewal invoice
      const invoiceNumber = await this.generateInvoiceNumber(client);

      const invoiceResult = await client.query<{ id: string }>(
        `INSERT INTO invoices (
          tenant_id, subscription_id, invoice_number, status, currency,
          subtotal, tax_amount, tax_rate, government_fees, platform_fees,
          total_amount, issued_at, due_date
        ) VALUES (
          $1, NULL, $2, 'pending', $3,
          $4, 0, 0, $5, $6,
          $4, NOW(), NOW() + INTERVAL '30 days'
        )
        RETURNING id`,
        [tenantId, invoiceNumber, feeSchedule.currency, totalFee, governmentPortion, platformPortion]
      );

      await client.query(
        `INSERT INTO invoice_line_items (
          invoice_id, description, category, quantity, unit_price, total_price,
          taxable, revenue_recipient, metadata
        ) VALUES (
          $1, $2, 'government_fee', 1, $3, $3,
          false, 'government', $4
        )`,
        [
          invoiceResult.rows[0].id,
          `Drone registration renewal (${region})`,
          baseFee,
          JSON.stringify({ registrationId, region, type: 'renewal' }),
        ]
      );

      if (lateFee > 0) {
        await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id, description, category, quantity, unit_price, total_price,
            taxable, revenue_recipient, metadata
          ) VALUES (
            $1, $2, 'penalty', 1, $3, $3,
            false, 'government', $4
          )`,
          [
            invoiceResult.rows[0].id,
            `Late renewal penalty (${feeSchedule.lateFeePercentage}%)`,
            lateFee,
            JSON.stringify({ registrationId, region, type: 'late_fee' }),
          ]
        );
      }

      // Extend expiration
      const currentExpiry = new Date((reg as any).expires_at ?? (reg as any).expiresAt);
      const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      const updateResult = await client.query<DroneRegistration>(
        `UPDATE drone_registrations
         SET status = 'pending_payment',
             expires_at = $1,
             registration_fee = $2,
             government_portion_fee = $3,
             platform_portion_fee = $4,
             fee_invoice_id = $5,
             renewal_reminder_sent = false,
             updated_at = NOW()
         WHERE id = $6 AND tenant_id = $7
         RETURNING *`,
        [
          newExpiry.toISOString(),
          totalFee,
          governmentPortion,
          platformPortion,
          invoiceResult.rows[0].id,
          registrationId,
          tenantId,
        ]
      );

      this.log.info({ registrationId, newExpiry: newExpiry.toISOString() }, 'Registration renewed');
      return this.mapRegistrationRow(updateResult.rows[0]);
    });
  }

  /**
   * Transfer registration to a new owner (like vehicle title transfer).
   */
  async transferRegistration(
    registrationId: UUID,
    tenantId: UUID,
    newOwnerId: UUID
  ): Promise<DroneRegistration> {
    this.log.info({ registrationId, tenantId, newOwnerId }, 'Transferring registration');

    return withTransaction(tenantId, async (client) => {
      // Get current registration
      const regResult = await client.query<DroneRegistration>(
        `SELECT * FROM drone_registrations
         WHERE id = $1 AND tenant_id = $2 AND status = 'active'
         FOR UPDATE`,
        [registrationId, tenantId]
      );

      if (regResult.rows.length === 0) {
        throw new NotFoundError('DroneRegistration', registrationId);
      }

      const oldReg = regResult.rows[0];
      const region = (oldReg as any).region;
      const ddid = (oldReg as any).digital_drone_id ?? (oldReg as any).digitalDroneId;

      // Get new owner details
      const ownerResult = await client.query(
        `SELECT full_name, email, address FROM users WHERE id = $1`,
        [newOwnerId]
      );

      if (ownerResult.rows.length === 0) {
        throw new NotFoundError('User', newOwnerId);
      }

      const newOwner = ownerResult.rows[0];

      // Look up transfer fee
      const feeSchedule = REGISTRATION_FEE_SCHEDULES[region];
      if (!feeSchedule) {
        throw new ValidationError(`No fee schedule found for region: ${region}`);
      }

      const transferFee = feeSchedule.transferFee;
      const governmentPortion = Math.round(transferFee * feeSchedule.governmentRevenueSplit);
      const platformPortion = transferFee - governmentPortion;

      // Mark old registration as transferred
      await client.query(
        `UPDATE drone_registrations
         SET status = 'transferred',
             transferred_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [registrationId]
      );

      // Generate new registration number but keep same DDID
      const year = new Date().getFullYear();
      const alphanumericChars = await this.generateUniqueAlphanumeric(client, 6);
      const newRegistrationNumber = `SKW-${region}-${year}-${alphanumericChars}`;
      const verificationCode = `V-${await this.generateUniqueAlphanumeric(client, 6)}`;

      // Create new registration linked to old
      const newRegResult = await client.query<DroneRegistration>(
        `INSERT INTO drone_registrations (
          tenant_id, drone_id, owner_id,
          digital_drone_id, registration_number, region, country, regulatory_authority,
          registration_type, status,
          issued_at, expires_at,
          drone_manufacturer, drone_model, drone_serial_number, drone_category,
          drone_weight_grams, remote_id_serial,
          owner_name, owner_email, owner_address,
          registration_fee, currency,
          government_portion_fee, platform_portion_fee,
          verification_code, publicly_verifiable,
          previous_registration_id, transferred_from,
          renewal_reminder_sent, auto_renew
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6, $7, $8,
          $9, 'pending_payment',
          NOW(), $10,
          $11, $12, $13, $14,
          $15, $16,
          $17, $18, $19,
          $20, $21,
          $22, $23,
          $24, true,
          $25, $26,
          false, false
        )
        RETURNING *`,
        [
          tenantId,
          (oldReg as any).drone_id ?? (oldReg as any).droneId,
          newOwnerId,
          ddid, // Keep same DDID
          newRegistrationNumber,
          region,
          (oldReg as any).country,
          (oldReg as any).regulatory_authority ?? (oldReg as any).regulatoryAuthority,
          (oldReg as any).registration_type ?? (oldReg as any).registrationType,
          (oldReg as any).expires_at ?? (oldReg as any).expiresAt,
          (oldReg as any).drone_manufacturer ?? (oldReg as any).droneManufacturer,
          (oldReg as any).drone_model ?? (oldReg as any).droneModel,
          (oldReg as any).drone_serial_number ?? (oldReg as any).droneSerialNumber,
          (oldReg as any).drone_category ?? (oldReg as any).droneCategory,
          (oldReg as any).drone_weight_grams ?? (oldReg as any).droneWeightGrams,
          (oldReg as any).remote_id_serial ?? (oldReg as any).remoteIdSerial ?? null,
          newOwner.full_name,
          newOwner.email,
          newOwner.address ?? null,
          transferFee,
          feeSchedule.currency,
          governmentPortion,
          platformPortion,
          verificationCode,
          registrationId, // previous_registration_id
          (oldReg as any).owner_id ?? (oldReg as any).ownerId, // transferred_from
        ]
      );

      // Create transfer fee invoice
      if (transferFee > 0) {
        const invoiceNumber = await this.generateInvoiceNumber(client);

        const invoiceResult = await client.query<{ id: string }>(
          `INSERT INTO invoices (
            tenant_id, subscription_id, invoice_number, status, currency,
            subtotal, tax_amount, tax_rate, government_fees, platform_fees,
            total_amount, issued_at, due_date
          ) VALUES (
            $1, NULL, $2, 'pending', $3,
            $4, 0, 0, $5, $6,
            $4, NOW(), NOW() + INTERVAL '30 days'
          )
          RETURNING id`,
          [tenantId, invoiceNumber, feeSchedule.currency, transferFee, governmentPortion, platformPortion]
        );

        await client.query(
          `INSERT INTO invoice_line_items (
            invoice_id, description, category, quantity, unit_price, total_price,
            taxable, revenue_recipient, metadata
          ) VALUES (
            $1, $2, 'government_fee', 1, $3, $3,
            false, 'government', $4
          )`,
          [
            invoiceResult.rows[0].id,
            `Registration transfer fee (${region})`,
            transferFee,
            JSON.stringify({
              registrationId: (newRegResult.rows[0] as any).id,
              previousRegistrationId: registrationId,
              type: 'transfer',
            }),
          ]
        );
      }

      this.log.info(
        { oldRegistrationId: registrationId, newRegistrationId: (newRegResult.rows[0] as any).id, ddid },
        'Registration transferred'
      );
      return this.mapRegistrationRow(newRegResult.rows[0]);
    });
  }

  /**
   * Suspend a registration (e.g., safety violation).
   */
  async suspendRegistration(registrationId: UUID, reason: string): Promise<DroneRegistration> {
    this.log.info({ registrationId, reason }, 'Suspending registration');

    const result = await queryWithTenant<DroneRegistration>(
      '00000000-0000-0000-0000-000000000000', // Admin context
      `UPDATE drone_registrations
       SET status = 'suspended',
           suspension_reason = $1,
           updated_at = NOW()
       WHERE id = $2
         AND status = 'active'
       RETURNING *`,
      [reason, registrationId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('DroneRegistration', registrationId);
    }

    this.log.warn({ registrationId, reason }, 'Registration suspended');
    return this.mapRegistrationRow(result.rows[0]);
  }

  /**
   * Permanently revoke a registration.
   */
  async revokeRegistration(registrationId: UUID, reason: string): Promise<DroneRegistration> {
    this.log.info({ registrationId, reason }, 'Revoking registration');

    const result = await queryWithTenant<DroneRegistration>(
      '00000000-0000-0000-0000-000000000000', // Admin context
      `UPDATE drone_registrations
       SET status = 'revoked',
           revocation_reason = $1,
           updated_at = NOW()
       WHERE id = $2
         AND status IN ('active', 'suspended')
       RETURNING *`,
      [reason, registrationId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('DroneRegistration', registrationId);
    }

    this.log.warn({ registrationId, reason }, 'Registration revoked');
    return this.mapRegistrationRow(result.rows[0]);
  }

  /**
   * Public endpoint: verify a drone's registration status by verification code.
   */
  async verifyRegistration(
    verificationCode: string
  ): Promise<{ valid: boolean; registration?: Partial<DroneRegistration> }> {
    const result = await queryWithTenant<DroneRegistration>(
      '00000000-0000-0000-0000-000000000000', // Public context
      `SELECT * FROM drone_registrations
       WHERE verification_code = $1
         AND publicly_verifiable = true`,
      [verificationCode]
    );

    if (result.rows.length === 0) {
      return { valid: false };
    }

    const reg = this.mapRegistrationRow(result.rows[0]);
    const isValid = reg.status === 'active' && new Date(reg.expiresAt) > new Date();

    // Return limited public info
    return {
      valid: isValid,
      registration: {
        digitalDroneId: reg.digitalDroneId,
        registrationNumber: reg.registrationNumber,
        region: reg.region,
        country: reg.country,
        regulatoryAuthority: reg.regulatoryAuthority,
        registrationType: reg.registrationType,
        status: reg.status,
        issuedAt: reg.issuedAt,
        expiresAt: reg.expiresAt,
        droneManufacturer: reg.droneManufacturer,
        droneModel: reg.droneModel,
        droneCategory: reg.droneCategory,
      },
    };
  }

  /**
   * Batch: find registrations expiring in 30/7/1 days and trigger notifications.
   */
  async checkExpiringRegistrations(): Promise<{
    expiring30: number;
    expiring7: number;
    expiring1: number;
  }> {
    this.log.info('Checking expiring registrations');

    const intervals = [
      { label: '30 days', interval: '30 days', key: 'expiring30' },
      { label: '7 days', interval: '7 days', key: 'expiring7' },
      { label: '1 day', interval: '1 day', key: 'expiring1' },
    ];

    const counts: Record<string, number> = {};

    for (const { label, interval, key } of intervals) {
      const result = await queryWithTenant<{ id: string; tenant_id: string }>(
        '00000000-0000-0000-0000-000000000000',
        `UPDATE drone_registrations
         SET renewal_reminder_sent = true,
             updated_at = NOW()
         WHERE status = 'active'
           AND renewal_reminder_sent = false
           AND expires_at <= NOW() + $1::interval
           AND expires_at > NOW()
         RETURNING id, tenant_id`,
        [interval]
      );

      counts[key] = result.rows.length;

      if (result.rows.length > 0) {
        this.log.info(
          { count: result.rows.length, expiringIn: label },
          'Registration expiry notifications triggered'
        );
      }
    }

    return {
      expiring30: counts.expiring30 ?? 0,
      expiring7: counts.expiring7 ?? 0,
      expiring1: counts.expiring1 ?? 0,
    };
  }

  /**
   * Batch: mark expired registrations and apply late fees if applicable.
   */
  async processExpiredRegistrations(): Promise<{ expired: number }> {
    this.log.info('Processing expired registrations');

    const result = await queryWithTenant<{ id: string }>(
      '00000000-0000-0000-0000-000000000000',
      `UPDATE drone_registrations
       SET status = 'expired',
           updated_at = NOW()
       WHERE status = 'active'
         AND expires_at < NOW()
       RETURNING id`,
      []
    );

    if (result.rows.length > 0) {
      this.log.warn(
        { count: result.rows.length },
        'Registrations marked as expired'
      );
    }

    return { expired: result.rows.length };
  }

  /**
   * Get registration statistics for a tenant.
   */
  async getRegistrationStats(tenantId: UUID): Promise<RegistrationStats> {
    const result = await queryWithTenant<{
      total: string;
      status_counts: string;
      type_counts: string;
      region_counts: string;
      total_revenue: string;
      gov_revenue: string;
      platform_revenue: string;
    }>(
      tenantId,
      `SELECT
        COUNT(*) AS total,
        jsonb_object_agg(
          COALESCE(status, 'unknown'),
          status_count
        ) FILTER (WHERE status IS NOT NULL) AS status_counts,
        jsonb_object_agg(
          COALESCE(registration_type, 'unknown'),
          type_count
        ) FILTER (WHERE registration_type IS NOT NULL) AS type_counts,
        jsonb_object_agg(
          COALESCE(region, 'unknown'),
          region_count
        ) FILTER (WHERE region IS NOT NULL) AS region_counts,
        COALESCE(SUM(registration_fee), 0) AS total_revenue,
        COALESCE(SUM(government_portion_fee), 0) AS gov_revenue,
        COALESCE(SUM(platform_portion_fee), 0) AS platform_revenue
       FROM (
         SELECT
           status, registration_type, region,
           registration_fee, government_portion_fee, platform_portion_fee,
           COUNT(*) OVER (PARTITION BY status) AS status_count,
           COUNT(*) OVER (PARTITION BY registration_type) AS type_count,
           COUNT(*) OVER (PARTITION BY region) AS region_count
         FROM drone_registrations
         WHERE tenant_id = $1
       ) sub`,
      [tenantId]
    );

    const row = result.rows[0];

    return {
      totalRegistrations: parseInt(row.total, 10),
      byStatus: row.status_counts ? JSON.parse(String(row.status_counts)) : {},
      byType: row.type_counts ? JSON.parse(String(row.type_counts)) : {},
      byRegion: row.region_counts ? JSON.parse(String(row.region_counts)) : {},
      totalRevenueGenerated: parseInt(row.total_revenue, 10),
      governmentRevenue: parseInt(row.gov_revenue, 10),
      platformRevenue: parseInt(row.platform_revenue, 10),
    };
  }

  // ─── Private Helpers ───

  private async generateUniqueAlphanumeric(client: any, length: number): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check uniqueness
      const existing = await client.query(
        `SELECT 1 FROM drone_registrations
         WHERE digital_drone_id LIKE $1
         LIMIT 1`,
        [`%${result}`]
      );

      if (existing.rows.length === 0) {
        return result;
      }
      attempt++;
    }

    throw new AppError(500, 'GENERATION_ERROR', 'Failed to generate unique alphanumeric identifier');
  }

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

  private mapRegistrationRow(row: Record<string, any>): DroneRegistration {
    return {
      id: row.id,
      tenantId: row.tenant_id ?? row.tenantId,
      droneId: row.drone_id ?? row.droneId,
      ownerId: row.owner_id ?? row.ownerId,
      digitalDroneId: row.digital_drone_id ?? row.digitalDroneId,
      registrationNumber: row.registration_number ?? row.registrationNumber,
      region: row.region,
      country: row.country,
      regulatoryAuthority: row.regulatory_authority ?? row.regulatoryAuthority,
      registrationType: row.registration_type ?? row.registrationType,
      temporaryPermitType: row.temporary_permit_type ?? row.temporaryPermitType ?? undefined,
      issuedAt: row.issued_at ?? row.issuedAt,
      expiresAt: row.expires_at ?? row.expiresAt,
      renewalReminderSent: row.renewal_reminder_sent ?? row.renewalReminderSent ?? false,
      autoRenew: row.auto_renew ?? row.autoRenew ?? false,
      droneManufacturer: row.drone_manufacturer ?? row.droneManufacturer,
      droneModel: row.drone_model ?? row.droneModel,
      droneSerialNumber: row.drone_serial_number ?? row.droneSerialNumber,
      droneCategory: row.drone_category ?? row.droneCategory,
      droneWeightGrams: row.drone_weight_grams ?? row.droneWeightGrams,
      remoteIdSerial: row.remote_id_serial ?? row.remoteIdSerial ?? undefined,
      ownerName: row.owner_name ?? row.ownerName,
      ownerEmail: row.owner_email ?? row.ownerEmail,
      ownerAddress: row.owner_address ?? row.ownerAddress ?? undefined,
      ownerIdType: row.owner_id_type ?? row.ownerIdType ?? undefined,
      ownerIdNumber: row.owner_id_number ?? row.ownerIdNumber ?? undefined,
      registrationFee: parseInt(String(row.registration_fee ?? row.registrationFee ?? 0), 10),
      currency: row.currency,
      feePaidAt: row.fee_paid_at ?? row.feePaidAt ?? undefined,
      feeInvoiceId: row.fee_invoice_id ?? row.feeInvoiceId ?? undefined,
      governmentPortionFee: parseInt(String(row.government_portion_fee ?? row.governmentPortionFee ?? 0), 10),
      platformPortionFee: parseInt(String(row.platform_portion_fee ?? row.platformPortionFee ?? 0), 10),
      status: row.status,
      suspensionReason: row.suspension_reason ?? row.suspensionReason ?? undefined,
      revocationReason: row.revocation_reason ?? row.revocationReason ?? undefined,
      previousRegistrationId: row.previous_registration_id ?? row.previousRegistrationId ?? undefined,
      transferredFrom: row.transferred_from ?? row.transferredFrom ?? undefined,
      transferredAt: row.transferred_at ?? row.transferredAt ?? undefined,
      qrCodeUrl: row.qr_code_url ?? row.qrCodeUrl ?? undefined,
      certificateUrl: row.certificate_url ?? row.certificateUrl ?? undefined,
      verificationCode: row.verification_code ?? row.verificationCode,
      publiclyVerifiable: row.publicly_verifiable ?? row.publiclyVerifiable ?? true,
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }

  private mapPermitRow(row: Record<string, any>): TemporaryPermit {
    return {
      id: row.id,
      registrationId: row.registration_id ?? row.registrationId,
      permitType: row.permit_type ?? row.permitType,
      applicantType: row.applicant_type ?? row.applicantType,
      applicantName: row.applicant_name ?? row.applicantName,
      applicantEmail: row.applicant_email ?? row.applicantEmail,
      applicantPhone: row.applicant_phone ?? row.applicantPhone,
      applicantNationality: row.applicant_nationality ?? row.applicantNationality,
      passportNumber: row.passport_number ?? row.passportNumber ?? undefined,
      visaNumber: row.visa_number ?? row.visaNumber ?? undefined,
      localContactName: row.local_contact_name ?? row.localContactName ?? undefined,
      localContactPhone: row.local_contact_phone ?? row.localContactPhone ?? undefined,
      purpose: row.purpose,
      operationDescription: row.operation_description ?? row.operationDescription,
      operationLocations: row.operation_locations ?? row.operationLocations ?? [],
      operationArea: row.operation_area ?? row.operationArea ?? undefined,
      duration: typeof row.duration === 'string' ? JSON.parse(row.duration) : row.duration,
      startDate: row.start_date ?? row.startDate,
      endDate: row.end_date ?? row.endDate,
      droneRegistrationIds: row.drone_registration_ids ?? row.droneRegistrationIds ?? [],
      permitFee: parseInt(String(row.permit_fee ?? row.permitFee ?? 0), 10),
      currency: row.currency,
      securityDeposit: row.security_deposit != null
        ? parseInt(String(row.security_deposit ?? row.securityDeposit), 10)
        : undefined,
      depositRefunded: row.deposit_refunded ?? row.depositRefunded ?? undefined,
      status: row.status,
      reviewedBy: row.reviewed_by ?? row.reviewedBy ?? undefined,
      approvalConditions: row.approval_conditions ?? row.approvalConditions ?? undefined,
      denialReason: row.denial_reason ?? row.denialReason ?? undefined,
      requiredDocuments: typeof row.required_documents === 'string'
        ? JSON.parse(row.required_documents)
        : (row.required_documents ?? row.requiredDocuments ?? []),
      createdAt: row.created_at ?? row.createdAt,
      updatedAt: row.updated_at ?? row.updatedAt,
    };
  }
}

export const registrationService = new RegistrationService();
