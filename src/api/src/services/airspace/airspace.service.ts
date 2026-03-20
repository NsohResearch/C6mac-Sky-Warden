import { pool, query } from '../../utils/db.js';
import { logger } from '../../utils/logger.js';
import {
  AppError,
  NotFoundError,
  ValidationError,
  ExternalServiceError,
} from '../../utils/errors.js';
import type {
  AirspaceCheckResponse,
  AirspaceClass,
  FlightAdvisoryLevel,
  UasFacilityMapGrid,
  TemporaryFlightRestriction,
  Notam,
  AirspaceAdvisory,
  AirspaceRestriction,
} from '../../../../shared/types/airspace.js';
import type { BoundingBox, ISOTimestamp } from '../../../../shared/types/common.js';

// ─── Constants ───

const MAX_UAS_ALTITUDE_FT = 400;
const AIRPORT_SEARCH_RADIUS_NM = 5;
const NM_TO_METERS = 1852;
const FAA_UDDS_SYNC_INTERVAL_DAYS = 56;

// ─── AirspaceService ───

export class AirspaceService {
  private readonly log = logger.child({ service: 'AirspaceService' });

  /**
   * Performs a comprehensive airspace check for a given location, altitude, and time.
   * Returns advisory level, authorization requirements, LAANC availability,
   * nearby airports, active TFRs, and relevant NOTAMs.
   */
  async checkAirspace(
    lat: number,
    lng: number,
    altitudeFt: number,
    time: Date = new Date()
  ): Promise<AirspaceCheckResponse> {
    this.validateCoordinates(lat, lng);
    if (altitudeFt < 0 || altitudeFt > MAX_UAS_ALTITUDE_FT) {
      throw new ValidationError(
        `Altitude must be between 0 and ${MAX_UAS_ALTITUDE_FT} ft AGL`,
        { altitudeFt }
      );
    }

    const timeIso = time.toISOString();
    this.log.info({ lat, lng, altitudeFt, time: timeIso }, 'Performing airspace check');

    const [
      uasfmGrids,
      nearbyAirports,
      tfrs,
      notams,
      restrictions,
    ] = await Promise.all([
      this.queryUasfmGrids(lat, lng),
      this.queryNearbyAirports(lat, lng),
      this.queryActiveTfrs(lat, lng, timeIso),
      this.queryActiveNotams(lat, lng, timeIso),
      this.queryAirspaceRestrictions(lat, lng),
    ]);

    const primaryGrid = uasfmGrids[0] ?? null;
    const airspaceClass = primaryGrid?.airspaceClass ?? this.inferAirspaceClass(uasfmGrids, nearbyAirports);
    const maxAltitudeFt = primaryGrid?.maxAltitudeFt ?? null;
    const laancAvailable = primaryGrid?.laancEnabled ?? false;

    const requiresAuthorization = this.determineAuthorizationRequired(
      airspaceClass,
      altitudeFt,
      maxAltitudeFt
    );
    const advisories = this.buildAdvisories(tfrs, notams, restrictions, altitudeFt);
    const advisoryLevel = this.computeAdvisoryLevel(
      airspaceClass,
      altitudeFt,
      maxAltitudeFt,
      tfrs,
      restrictions
    );
    const canFly = advisoryLevel !== 'prohibited';

    const nearestAirport = nearbyAirports.length > 0
      ? {
          code: nearbyAirports[0].code as string,
          name: nearbyAirports[0].name as string,
          distanceNm: Number(nearbyAirports[0].distance_nm),
        }
      : undefined;

    return {
      advisoryLevel,
      canFly,
      requiresAuthorization,
      laancAvailable,
      maxAltitudeFt,
      airspaceClass,
      nearestAirport,
      advisories,
      restrictions: restrictions.map((r) => this.mapRestrictionRow(r)),
      facilities: uasfmGrids.map((g) => this.mapUasfmRow(g)),
      tfrs: tfrs.map((t) => this.mapTfrRow(t)),
      notams: notams.map((n) => this.mapNotamRow(n)),
      timestamp: new Date().toISOString() as ISOTimestamp,
    };
  }

  /**
   * Returns UASFM grid data for a given geographic location.
   */
  async getUasfmGrid(lat: number, lng: number): Promise<UasFacilityMapGrid[]> {
    this.validateCoordinates(lat, lng);

    const result = await query(
      `SELECT id, facility_id, airport_code, airspace_class,
              ST_AsGeoJSON(geometry)::jsonb AS geometry,
              max_altitude_ft, ceiling_ft, floor_ft, laanc_enabled,
              effective_date, expiration_date, chart_cycle, last_updated
       FROM uasfm_grids
       WHERE ST_Contains(geometry, ST_SetSRID(ST_Point($1, $2), 4326))
         AND effective_date <= NOW()
         AND expiration_date > NOW()
       ORDER BY max_altitude_ft ASC`,
      [lng, lat]
    );

    return result.rows.map((row) => this.mapUasfmRow(row));
  }

  /**
   * Returns all active TFRs within a bounding box.
   */
  async getActiveTfrs(boundingBox: BoundingBox): Promise<TemporaryFlightRestriction[]> {
    this.validateBoundingBox(boundingBox);

    const envelope = this.buildEnvelopeSql(boundingBox);
    const result = await query(
      `SELECT id, notam_number, type, description,
              ST_AsGeoJSON(geometry)::jsonb AS geometry,
              ST_X(ST_Centroid(geometry)) AS center_lng,
              ST_Y(ST_Centroid(geometry)) AS center_lat,
              radius_nm, floor_altitude_ft, floor_altitude_unit, floor_altitude_ref,
              ceiling_altitude_ft, ceiling_altitude_unit, ceiling_altitude_ref,
              effective_start, effective_end, issued_at,
              facility_id, restrictions, source, active
       FROM temporary_flight_restrictions
       WHERE active = true
         AND effective_start <= NOW()
         AND effective_end > NOW()
         AND ST_Intersects(geometry, ${envelope})
       ORDER BY effective_start ASC`,
      [
        boundingBox.southWest.longitude,
        boundingBox.southWest.latitude,
        boundingBox.northEast.longitude,
        boundingBox.northEast.latitude,
      ]
    );

    return result.rows.map((row) => this.mapTfrRow(row));
  }

  /**
   * Returns active NOTAMs that affect UAS operations within a bounding box.
   */
  async getActiveNotams(boundingBox: BoundingBox): Promise<Notam[]> {
    this.validateBoundingBox(boundingBox);

    const envelope = this.buildEnvelopeSql(boundingBox);
    const result = await query(
      `SELECT id, notam_id, type, facility_id, location,
              effective_start, effective_end, text, classification,
              ST_AsGeoJSON(geometry)::jsonb AS geometry, affects_uas
       FROM notams
       WHERE affects_uas = true
         AND effective_start <= NOW()
         AND effective_end > NOW()
         AND (geometry IS NULL OR ST_Intersects(geometry, ${envelope}))
       ORDER BY effective_start ASC`,
      [
        boundingBox.southWest.longitude,
        boundingBox.southWest.latitude,
        boundingBox.northEast.longitude,
        boundingBox.northEast.latitude,
      ]
    );

    return result.rows.map((row) => this.mapNotamRow(row));
  }

  /**
   * Synchronizes UASFM data from the FAA UDDS (56-day cycle).
   * Pulls the latest UAS Facility Map grids and updates the local database.
   */
  async syncUasfmData(): Promise<{ inserted: number; updated: number; deleted: number }> {
    this.log.info('Starting UASFM data sync from FAA UDDS');

    let inserted = 0;
    let updated = 0;
    let deleted = 0;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Fetch current chart cycle to determine what data to pull
      const cycleResult = await client.query(
        `SELECT DISTINCT chart_cycle, effective_date, expiration_date
         FROM uasfm_grids
         ORDER BY effective_date DESC
         LIMIT 1`
      );
      const currentCycle = cycleResult.rows[0]?.chart_cycle ?? null;

      // Fetch latest UASFM data from FAA UDDS ArcGIS endpoint
      const response = await fetch(
        `${process.env.FAA_UDDS_URL ?? 'https://udds-faa.opendata.arcgis.com'}/api/v3/datasets/uasfm/downloads/geojson`,
        {
          headers: { Accept: 'application/geo+json' },
          signal: AbortSignal.timeout(120_000),
        }
      );

      if (!response.ok) {
        throw new ExternalServiceError(
          'FAA UDDS',
          `Failed to fetch UASFM data: ${response.status} ${response.statusText}`
        );
      }

      const geojson = (await response.json()) as {
        features: Array<{
          properties: Record<string, unknown>;
          geometry: Record<string, unknown>;
        }>;
      };

      if (!geojson.features || geojson.features.length === 0) {
        this.log.warn('No UASFM features returned from FAA UDDS');
        await client.query('ROLLBACK');
        return { inserted: 0, updated: 0, deleted: 0 };
      }

      const newCycle = String(
        geojson.features[0]?.properties?.CHART_CYCLE ?? currentCycle ?? 'unknown'
      );

      // Mark expired grids from old cycles
      if (currentCycle && newCycle !== currentCycle) {
        const deleteResult = await client.query(
          `UPDATE uasfm_grids SET expiration_date = NOW()
           WHERE chart_cycle = $1 AND expiration_date > NOW()`,
          [currentCycle]
        );
        deleted = deleteResult.rowCount ?? 0;
      }

      // Upsert new grid data
      for (const feature of geojson.features) {
        const props = feature.properties;
        const upsertResult = await client.query(
          `INSERT INTO uasfm_grids (
            facility_id, airport_code, airspace_class, geometry,
            max_altitude_ft, ceiling_ft, floor_ft, laanc_enabled,
            effective_date, expiration_date, chart_cycle, last_updated
          ) VALUES (
            $1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326),
            $5, $6, $7, $8, $9, $10, $11, NOW()
          )
          ON CONFLICT (facility_id, chart_cycle)
          DO UPDATE SET
            max_altitude_ft = EXCLUDED.max_altitude_ft,
            ceiling_ft = EXCLUDED.ceiling_ft,
            floor_ft = EXCLUDED.floor_ft,
            laanc_enabled = EXCLUDED.laanc_enabled,
            geometry = EXCLUDED.geometry,
            last_updated = NOW()
          RETURNING (xmax = 0) AS is_insert`,
          [
            props.FACILITY_ID,
            props.AIRPORT_CODE,
            props.AIRSPACE_CLASS,
            JSON.stringify(feature.geometry),
            Number(props.MAX_ALTITUDE ?? 0),
            Number(props.CEILING ?? 0),
            Number(props.FLOOR ?? 0),
            Boolean(props.LAANC_ENABLED),
            props.EFFECTIVE_DATE,
            props.EXPIRATION_DATE,
            newCycle,
          ]
        );
        if (upsertResult.rows[0]?.is_insert) {
          inserted++;
        } else {
          updated++;
        }
      }

      await client.query('COMMIT');
      this.log.info({ inserted, updated, deleted, cycle: newCycle }, 'UASFM data sync complete');
    } catch (error) {
      await client.query('ROLLBACK');
      this.log.error({ error }, 'UASFM data sync failed');
      throw error;
    } finally {
      client.release();
    }

    return { inserted, updated, deleted };
  }

  /**
   * Synchronizes TFR data from the FAA data source.
   */
  async syncTfrData(): Promise<{ inserted: number; updated: number; deactivated: number }> {
    this.log.info('Starting TFR data sync');

    let inserted = 0;
    let updated = 0;
    let deactivated = 0;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Fetch active TFRs from FAA TFR feed
      const response = await fetch(
        'https://tfr.faa.gov/tfr2/list.json',
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(30_000),
        }
      );

      if (!response.ok) {
        throw new ExternalServiceError(
          'FAA TFR',
          `Failed to fetch TFR data: ${response.status} ${response.statusText}`
        );
      }

      const tfrData = (await response.json()) as {
        tfrs: Array<Record<string, unknown>>;
      };

      if (!tfrData.tfrs || tfrData.tfrs.length === 0) {
        this.log.warn('No TFR data returned from FAA');
        await client.query('ROLLBACK');
        return { inserted: 0, updated: 0, deactivated: 0 };
      }

      // Collect NOTAM numbers from the feed for deactivation check
      const activeNotamNumbers: string[] = [];

      for (const tfr of tfrData.tfrs) {
        const notamNumber = String(tfr.notamNumber ?? tfr.NOTAM_NUMBER ?? '');
        if (!notamNumber) continue;
        activeNotamNumbers.push(notamNumber);

        const geometry = tfr.geometry ?? tfr.GEOMETRY;
        if (!geometry) continue;

        const upsertResult = await client.query(
          `INSERT INTO temporary_flight_restrictions (
            notam_number, type, description, geometry,
            radius_nm, floor_altitude_ft, floor_altitude_unit, floor_altitude_ref,
            ceiling_altitude_ft, ceiling_altitude_unit, ceiling_altitude_ref,
            effective_start, effective_end, issued_at,
            facility_id, restrictions, source, active
          ) VALUES (
            $1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326),
            $5, $6, 'feet', 'AGL',
            $7, 'feet', 'AGL',
            $8, $9, $10,
            $11, $12, 'faa', true
          )
          ON CONFLICT (notam_number)
          DO UPDATE SET
            description = EXCLUDED.description,
            geometry = EXCLUDED.geometry,
            effective_end = EXCLUDED.effective_end,
            restrictions = EXCLUDED.restrictions,
            active = true
          RETURNING (xmax = 0) AS is_insert`,
          [
            notamNumber,
            tfr.type ?? tfr.TYPE ?? 'other',
            tfr.description ?? tfr.DESCRIPTION ?? '',
            JSON.stringify(geometry),
            tfr.radiusNm ?? tfr.RADIUS_NM ?? null,
            Number(tfr.floorAltitude ?? tfr.FLOOR_ALTITUDE ?? 0),
            Number(tfr.ceilingAltitude ?? tfr.CEILING_ALTITUDE ?? 18000),
            tfr.effectiveStart ?? tfr.EFFECTIVE_START,
            tfr.effectiveEnd ?? tfr.EFFECTIVE_END,
            tfr.issuedAt ?? tfr.ISSUED_AT ?? new Date().toISOString(),
            tfr.facilityId ?? tfr.FACILITY_ID ?? null,
            tfr.restrictions ?? tfr.RESTRICTIONS ?? '',
          ]
        );

        if (upsertResult.rows[0]?.is_insert) {
          inserted++;
        } else {
          updated++;
        }
      }

      // Deactivate TFRs that are no longer in the feed
      if (activeNotamNumbers.length > 0) {
        const deactivateResult = await client.query(
          `UPDATE temporary_flight_restrictions
           SET active = false
           WHERE source = 'faa'
             AND active = true
             AND notam_number != ALL($1::text[])`,
          [activeNotamNumbers]
        );
        deactivated = deactivateResult.rowCount ?? 0;
      }

      await client.query('COMMIT');
      this.log.info({ inserted, updated, deactivated }, 'TFR data sync complete');
    } catch (error) {
      await client.query('ROLLBACK');
      this.log.error({ error }, 'TFR data sync failed');
      throw error;
    } finally {
      client.release();
    }

    return { inserted, updated, deactivated };
  }

  // ─── Private Helpers ───

  private validateCoordinates(lat: number, lng: number): void {
    if (lat < -90 || lat > 90) {
      throw new ValidationError('Latitude must be between -90 and 90', { lat });
    }
    if (lng < -180 || lng > 180) {
      throw new ValidationError('Longitude must be between -180 and 180', { lng });
    }
  }

  private validateBoundingBox(box: BoundingBox): void {
    this.validateCoordinates(box.southWest.latitude, box.southWest.longitude);
    this.validateCoordinates(box.northEast.latitude, box.northEast.longitude);
  }

  private buildEnvelopeSql(box: BoundingBox): string {
    return `ST_MakeEnvelope($1, $2, $3, $4, 4326)`;
  }

  private async queryUasfmGrids(lat: number, lng: number) {
    const result = await query(
      `SELECT id, facility_id, airport_code, airspace_class,
              ST_AsGeoJSON(geometry)::jsonb AS geometry,
              max_altitude_ft, ceiling_ft, floor_ft, laanc_enabled,
              effective_date, expiration_date, chart_cycle, last_updated
       FROM uasfm_grids
       WHERE ST_Contains(geometry, ST_SetSRID(ST_Point($1, $2), 4326))
         AND effective_date <= NOW()
         AND expiration_date > NOW()
       ORDER BY max_altitude_ft ASC`,
      [lng, lat]
    );
    return result.rows;
  }

  private async queryNearbyAirports(lat: number, lng: number) {
    const searchRadiusMeters = AIRPORT_SEARCH_RADIUS_NM * NM_TO_METERS;
    const result = await query(
      `SELECT code, name,
              ST_Distance(
                location::geography,
                ST_SetSRID(ST_Point($1, $2), 4326)::geography
              ) / $3 AS distance_nm
       FROM airports
       WHERE ST_DWithin(
         location::geography,
         ST_SetSRID(ST_Point($1, $2), 4326)::geography,
         $4
       )
       ORDER BY distance_nm ASC
       LIMIT 5`,
      [lng, lat, NM_TO_METERS, searchRadiusMeters]
    );
    return result.rows;
  }

  private async queryActiveTfrs(lat: number, lng: number, timeIso: string) {
    const searchRadiusMeters = AIRPORT_SEARCH_RADIUS_NM * NM_TO_METERS;
    const result = await query(
      `SELECT id, notam_number, type, description,
              ST_AsGeoJSON(geometry)::jsonb AS geometry,
              ST_X(ST_Centroid(geometry)) AS center_lng,
              ST_Y(ST_Centroid(geometry)) AS center_lat,
              radius_nm, floor_altitude_ft, floor_altitude_unit, floor_altitude_ref,
              ceiling_altitude_ft, ceiling_altitude_unit, ceiling_altitude_ref,
              effective_start, effective_end, issued_at,
              facility_id, restrictions, source, active
       FROM temporary_flight_restrictions
       WHERE active = true
         AND effective_start <= $3
         AND effective_end > $3
         AND ST_DWithin(
           geometry::geography,
           ST_SetSRID(ST_Point($1, $2), 4326)::geography,
           $4
         )
       ORDER BY effective_start ASC`,
      [lng, lat, timeIso, searchRadiusMeters]
    );
    return result.rows;
  }

  private async queryActiveNotams(lat: number, lng: number, timeIso: string) {
    const searchRadiusMeters = AIRPORT_SEARCH_RADIUS_NM * NM_TO_METERS;
    const result = await query(
      `SELECT id, notam_id, type, facility_id, location,
              effective_start, effective_end, text, classification,
              ST_AsGeoJSON(geometry)::jsonb AS geometry, affects_uas
       FROM notams
       WHERE affects_uas = true
         AND effective_start <= $3
         AND effective_end > $3
         AND (
           geometry IS NULL
           OR ST_DWithin(
             geometry::geography,
             ST_SetSRID(ST_Point($1, $2), 4326)::geography,
             $4
           )
         )
       ORDER BY effective_start ASC`,
      [lng, lat, timeIso, searchRadiusMeters]
    );
    return result.rows;
  }

  private async queryAirspaceRestrictions(lat: number, lng: number) {
    const result = await query(
      `SELECT id, type, name, description,
              ST_AsGeoJSON(geometry)::jsonb AS geometry,
              floor_altitude_ft, floor_altitude_unit, floor_altitude_ref,
              ceiling_altitude_ft, ceiling_altitude_unit, ceiling_altitude_ref,
              permanent, effective_start, effective_end,
              contact_info, waiver_available
       FROM airspace_restrictions
       WHERE ST_Contains(geometry, ST_SetSRID(ST_Point($1, $2), 4326))
         AND (permanent = true OR (effective_start <= NOW() AND effective_end > NOW()))`,
      [lng, lat]
    );
    return result.rows;
  }

  private determineAuthorizationRequired(
    airspaceClass: AirspaceClass | null,
    altitudeFt: number,
    maxAltitudeFt: number | null
  ): boolean {
    // Class G airspace below 400ft does not require authorization
    if (airspaceClass === 'G' || airspaceClass === null) {
      return false;
    }
    // Class A is always prohibited for UAS
    if (airspaceClass === 'A') {
      return true;
    }
    // Controlled airspace (B, C, D, E) requires authorization
    return true;
  }

  private computeAdvisoryLevel(
    airspaceClass: AirspaceClass | null,
    altitudeFt: number,
    maxAltitudeFt: number | null,
    tfrs: Array<Record<string, unknown>>,
    restrictions: Array<Record<string, unknown>>
  ): FlightAdvisoryLevel {
    // Check for prohibited conditions first
    if (airspaceClass === 'A') {
      return 'prohibited';
    }

    // Active TFRs with security or VIP type are prohibited
    const hasProhibitedTfr = tfrs.some(
      (t) => t.type === 'security' || t.type === 'vip'
    );
    if (hasProhibitedTfr) {
      return 'prohibited';
    }

    // Check for prohibited restrictions
    const hasProhibitedRestriction = restrictions.some(
      (r) => r.type === 'prohibited'
    );
    if (hasProhibitedRestriction) {
      return 'prohibited';
    }

    // Restricted areas
    const hasRestrictedArea = restrictions.some(
      (r) => r.type === 'restricted' || r.type === 'dc_sfra'
    );
    if (hasRestrictedArea) {
      return 'restricted';
    }

    // Controlled airspace above UASFM max
    if (
      maxAltitudeFt !== null &&
      altitudeFt > maxAltitudeFt &&
      airspaceClass &&
      ['B', 'C', 'D', 'E'].includes(airspaceClass)
    ) {
      return 'warning';
    }

    // Controlled airspace within limits
    if (airspaceClass && ['B', 'C', 'D', 'E'].includes(airspaceClass)) {
      return 'caution';
    }

    // Any active TFRs or restrictions present
    if (tfrs.length > 0 || restrictions.length > 0) {
      return 'caution';
    }

    return 'clear';
  }

  private inferAirspaceClass(
    grids: Array<Record<string, unknown>>,
    airports: Array<Record<string, unknown>>
  ): AirspaceClass | null {
    if (grids.length > 0) {
      return grids[0].airspace_class as AirspaceClass;
    }
    // If no UASFM grid and no nearby airports, assume Class G
    if (airports.length === 0) {
      return 'G';
    }
    return null;
  }

  private buildAdvisories(
    tfrs: Array<Record<string, unknown>>,
    notams: Array<Record<string, unknown>>,
    restrictions: Array<Record<string, unknown>>,
    altitudeFt: number
  ): AirspaceAdvisory[] {
    const advisories: AirspaceAdvisory[] = [];

    for (const tfr of tfrs) {
      advisories.push({
        id: tfr.id as string,
        type: 'tfr',
        severity: tfr.type === 'security' || tfr.type === 'vip' ? 'prohibited' : 'warning',
        title: `TFR ${tfr.notam_number}`,
        description: tfr.description as string,
        geometry: tfr.geometry as AirspaceAdvisory['geometry'],
        altitude: {
          floor: {
            value: Number(tfr.floor_altitude_ft ?? 0),
            unit: (tfr.floor_altitude_unit as 'feet' | 'meters') ?? 'feet',
            reference: (tfr.floor_altitude_ref as 'AGL' | 'MSL') ?? 'AGL',
          },
          ceiling: {
            value: Number(tfr.ceiling_altitude_ft ?? 18000),
            unit: (tfr.ceiling_altitude_unit as 'feet' | 'meters') ?? 'feet',
            reference: (tfr.ceiling_altitude_ref as 'AGL' | 'MSL') ?? 'MSL',
          },
        },
        effectiveStart: tfr.effective_start as string,
        effectiveEnd: tfr.effective_end as string,
        source: 'faa',
      });
    }

    for (const restriction of restrictions) {
      const type = restriction.type as string;
      let severity: FlightAdvisoryLevel = 'caution';
      if (type === 'prohibited') severity = 'prohibited';
      else if (type === 'restricted' || type === 'dc_sfra') severity = 'restricted';
      else if (type === 'warning' || type === 'moa') severity = 'warning';

      advisories.push({
        id: restriction.id as string,
        type: type as AirspaceAdvisory['type'],
        severity,
        title: restriction.name as string,
        description: restriction.description as string,
        geometry: restriction.geometry as AirspaceAdvisory['geometry'],
        altitude: {
          floor: {
            value: Number(restriction.floor_altitude_ft ?? 0),
            unit: (restriction.floor_altitude_unit as 'feet' | 'meters') ?? 'feet',
            reference: (restriction.floor_altitude_ref as 'AGL' | 'MSL') ?? 'AGL',
          },
          ceiling: {
            value: Number(restriction.ceiling_altitude_ft ?? 18000),
            unit: (restriction.ceiling_altitude_unit as 'feet' | 'meters') ?? 'feet',
            reference: (restriction.ceiling_altitude_ref as 'AGL' | 'MSL') ?? 'MSL',
          },
        },
        effectiveStart: restriction.effective_start as string | undefined,
        effectiveEnd: restriction.effective_end as string | undefined,
        source: 'faa',
      });
    }

    for (const notam of notams) {
      advisories.push({
        id: notam.id as string,
        type: 'sua',
        severity: 'caution',
        title: `NOTAM ${notam.notam_id}`,
        description: notam.text as string,
        geometry: notam.geometry as AirspaceAdvisory['geometry'],
        effectiveStart: notam.effective_start as string,
        effectiveEnd: notam.effective_end as string,
        source: 'faa',
      });
    }

    return advisories;
  }

  // ─── Row Mappers ───

  private mapUasfmRow(row: Record<string, unknown>): UasFacilityMapGrid {
    return {
      id: row.id as string,
      facilityId: row.facility_id as string,
      airportCode: row.airport_code as string,
      airspaceClass: row.airspace_class as AirspaceClass,
      geometry: row.geometry as UasFacilityMapGrid['geometry'],
      maxAltitudeFt: Number(row.max_altitude_ft),
      ceilingFt: Number(row.ceiling_ft),
      floorFt: Number(row.floor_ft),
      laancEnabled: Boolean(row.laanc_enabled),
      effectiveDate: String(row.effective_date) as ISOTimestamp,
      expirationDate: String(row.expiration_date) as ISOTimestamp,
      chartCycle: row.chart_cycle as string,
      lastUpdated: String(row.last_updated) as ISOTimestamp,
    };
  }

  private mapTfrRow(row: Record<string, unknown>): TemporaryFlightRestriction {
    return {
      id: row.id as string,
      notamNumber: row.notam_number as string,
      type: row.type as TemporaryFlightRestriction['type'],
      description: row.description as string,
      geometry: row.geometry as TemporaryFlightRestriction['geometry'],
      center: row.center_lat != null
        ? {
            latitude: Number(row.center_lat),
            longitude: Number(row.center_lng),
          }
        : undefined,
      radiusNm: row.radius_nm != null ? Number(row.radius_nm) : undefined,
      floorAltitude: {
        value: Number(row.floor_altitude_ft ?? 0),
        unit: (row.floor_altitude_unit as 'feet' | 'meters') ?? 'feet',
        reference: (row.floor_altitude_ref as 'AGL' | 'MSL') ?? 'AGL',
      },
      ceilingAltitude: {
        value: Number(row.ceiling_altitude_ft ?? 18000),
        unit: (row.ceiling_altitude_unit as 'feet' | 'meters') ?? 'feet',
        reference: (row.ceiling_altitude_ref as 'AGL' | 'MSL') ?? 'MSL',
      },
      effectiveStart: row.effective_start as string as ISOTimestamp,
      effectiveEnd: row.effective_end as string as ISOTimestamp,
      issuedAt: row.issued_at as string as ISOTimestamp,
      facilityId: row.facility_id as string | undefined,
      restrictions: row.restrictions as string,
      source: row.source as 'faa' | 'notam' | 'agency',
      active: Boolean(row.active),
    };
  }

  private mapNotamRow(row: Record<string, unknown>): Notam {
    return {
      id: row.id as string,
      notamId: row.notam_id as string,
      type: row.type as Notam['type'],
      facilityId: row.facility_id as string,
      location: row.location as string,
      effectiveStart: row.effective_start as string as ISOTimestamp,
      effectiveEnd: row.effective_end as string as ISOTimestamp,
      text: row.text as string,
      classification: row.classification as Notam['classification'],
      geometry: row.geometry as Notam['geometry'],
      affectsUas: Boolean(row.affects_uas),
    };
  }

  private mapRestrictionRow(row: Record<string, unknown>): AirspaceRestriction {
    return {
      id: row.id as string,
      type: row.type as AirspaceRestriction['type'],
      name: row.name as string,
      description: row.description as string,
      geometry: row.geometry as AirspaceRestriction['geometry'],
      altitude: {
        floor: {
          value: Number(row.floor_altitude_ft ?? 0),
          unit: (row.floor_altitude_unit as 'feet' | 'meters') ?? 'feet',
          reference: (row.floor_altitude_ref as 'AGL' | 'MSL') ?? 'AGL',
        },
        ceiling: {
          value: Number(row.ceiling_altitude_ft ?? 18000),
          unit: (row.ceiling_altitude_unit as 'feet' | 'meters') ?? 'feet',
          reference: (row.ceiling_altitude_ref as 'AGL' | 'MSL') ?? 'MSL',
        },
      },
      permanent: Boolean(row.permanent),
      effectiveStart: row.effective_start as string | undefined,
      effectiveEnd: row.effective_end as string | undefined,
      contactInfo: row.contact_info as string | undefined,
      waiverAvailable: Boolean(row.waiver_available),
    };
  }
}

export const airspaceService = new AirspaceService();
