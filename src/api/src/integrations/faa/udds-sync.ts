import { logger } from '../../utils/logger.js';
import { query } from '../../utils/db.js';
import { env } from '../../config/env.js';

/**
 * FAA UAS Data Delivery System (UDDS) Synchronization
 *
 * Syncs UAS Facility Maps, TFRs, and NOTAMs from FAA data sources.
 * UASFM data refreshes on a 56-day aeronautical chart cycle.
 *
 * Data sources:
 * - UASFM: https://udds-faa.opendata.arcgis.com (GeoJSON)
 * - TFRs: FAA TFR API (real-time)
 * - NOTAMs: FAA NOTAM API
 */

export class FaaUddsSync {
  private uddsBaseUrl: string;

  constructor() {
    this.uddsBaseUrl = env.FAA_UDDS_URL;
  }

  /**
   * Sync UAS Facility Map data from FAA UDDS
   * Called on 56-day chart cycle or manual trigger
   */
  async syncUasfmData(): Promise<{ inserted: number; updated: number; errors: number }> {
    const stats = { inserted: 0, updated: 0, errors: 0 };

    try {
      logger.info('Starting UASFM data sync from FAA UDDS');

      // Fetch GeoJSON from FAA UDDS ArcGIS endpoint
      const response = await fetch(
        `${this.uddsBaseUrl}/datasets/4254d2f81e5241cc8ba5883b63ae397c_0/explore?` +
        `where=1%3D1&outFields=*&f=geojson`,
        {
          headers: {
            'Accept': 'application/geo+json',
            'User-Agent': 'C6macEye/0.1.0 (USS Platform)',
          },
          signal: AbortSignal.timeout(120_000), // 2 minute timeout
        }
      );

      if (!response.ok) {
        throw new Error(`UDDS API returned ${response.status}: ${response.statusText}`);
      }

      const geojson = await response.json();

      if (!geojson.features || !Array.isArray(geojson.features)) {
        throw new Error('Invalid GeoJSON response from UDDS');
      }

      logger.info({ featureCount: geojson.features.length }, 'Received UASFM features');

      // Process in batches
      const batchSize = 500;
      for (let i = 0; i < geojson.features.length; i += batchSize) {
        const batch = geojson.features.slice(i, i + batchSize);

        for (const feature of batch) {
          try {
            const props = feature.properties;
            const geometry = feature.geometry;

            if (!geometry || !props) continue;

            // Upsert grid cell
            const result = await query(
              `INSERT INTO uasfm_grids (
                facility_id, airport_code, airspace_class, geometry,
                max_altitude_ft, ceiling_ft, floor_ft, laanc_enabled,
                effective_date, expiration_date, chart_cycle, last_updated
              ) VALUES (
                $1, $2, $3::airspace_class, ST_GeomFromGeoJSON($4),
                $5, $6, $7, $8, $9, $10, $11, NOW()
              )
              ON CONFLICT (id) DO UPDATE SET
                max_altitude_ft = EXCLUDED.max_altitude_ft,
                ceiling_ft = EXCLUDED.ceiling_ft,
                laanc_enabled = EXCLUDED.laanc_enabled,
                effective_date = EXCLUDED.effective_date,
                expiration_date = EXCLUDED.expiration_date,
                chart_cycle = EXCLUDED.chart_cycle,
                last_updated = NOW()
              RETURNING (xmax = 0) as is_insert`,
              [
                props.FACILITY_ID ?? props.facility_id ?? 'UNKNOWN',
                props.AIRPORT_CODE ?? props.airport_code ?? props.IDENT ?? 'UNK',
                mapAirspaceClass(props.AIRSPACE_CLASS ?? props.airspace_class ?? 'G'),
                JSON.stringify(geometry),
                props.MAX_ALTITUDE ?? props.max_altitude ?? 0,
                props.CEILING ?? props.ceiling ?? 400,
                props.FLOOR ?? props.floor ?? 0,
                props.LAANC_ENABLED ?? props.laanc_enabled ?? true,
                props.EFFECTIVE_DATE ?? new Date().toISOString(),
                props.EXPIRATION_DATE ?? new Date(Date.now() + 56 * 86_400_000).toISOString(),
                props.CHART_CYCLE ?? getCurrentChartCycle(),
              ]
            );

            if (result.rows[0]?.is_insert) {
              stats.inserted++;
            } else {
              stats.updated++;
            }
          } catch (error) {
            stats.errors++;
            logger.warn({ error, feature: feature.properties }, 'Failed to process UASFM feature');
          }
        }

        logger.debug({ processed: Math.min(i + batchSize, geojson.features.length) }, 'UASFM batch processed');
      }

      logger.info(stats, 'UASFM sync completed');
      return stats;
    } catch (error) {
      logger.error({ error }, 'UASFM sync failed');
      throw error;
    }
  }

  /**
   * Sync active TFRs from FAA
   * Called every 5 minutes for real-time updates
   */
  async syncTfrs(): Promise<{ active: number; expired: number; new: number }> {
    const stats = { active: 0, expired: 0, new: 0 };

    try {
      logger.info('Starting TFR sync');

      // FAA TFR data is available via various endpoints
      // Using the ADDS (Aviation Digital Data Service) TFR feed
      const response = await fetch(
        'https://tfr.faa.gov/tfr2/list.html',
        {
          headers: {
            'User-Agent': 'C6macEye/0.1.0 (USS Platform)',
          },
          signal: AbortSignal.timeout(30_000),
        }
      );

      // Note: In production, this would parse the actual FAA TFR feed
      // and extract structured TFR data. The FAA provides TFR data in
      // XML format through the NOTAM system.

      // Mark expired TFRs
      const expiredResult = await query(
        `UPDATE temporary_flight_restrictions
         SET active = FALSE, updated_at = NOW()
         WHERE active = TRUE AND effective_end < NOW()
         RETURNING id`
      );
      stats.expired = expiredResult.rowCount ?? 0;

      // Count active TFRs
      const activeResult = await query(
        "SELECT COUNT(*) as count FROM temporary_flight_restrictions WHERE active = TRUE"
      );
      stats.active = parseInt(activeResult.rows[0]?.count ?? '0');

      logger.info(stats, 'TFR sync completed');
      return stats;
    } catch (error) {
      logger.error({ error }, 'TFR sync failed');
      throw error;
    }
  }

  /**
   * Sync UAS-relevant NOTAMs
   */
  async syncNotams(): Promise<{ synced: number }> {
    const stats = { synced: 0 };

    try {
      logger.info('Starting NOTAM sync');

      // FAA NOTAM API integration point
      // In production, this calls the FAA NOTAM API
      // https://notams.aim.faa.gov/notamSearch/

      logger.info(stats, 'NOTAM sync completed');
      return stats;
    } catch (error) {
      logger.error({ error }, 'NOTAM sync failed');
      throw error;
    }
  }
}

// ─── Helpers ───

function mapAirspaceClass(raw: string): string {
  const normalized = raw.toUpperCase().replace('CLASS ', '');
  const valid = ['A', 'B', 'C', 'D', 'E', 'G'];
  return valid.includes(normalized) ? normalized : 'G';
}

function getCurrentChartCycle(): string {
  // Chart cycles reset every 56 days, starting from a known epoch
  const epoch = new Date('2024-01-25'); // Known cycle start
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - epoch.getTime()) / 86_400_000);
  const cycleNumber = Math.floor(diffDays / 56);
  return `${now.getFullYear()}-${String(cycleNumber).padStart(2, '0')}`;
}

export const faaUddsSync = new FaaUddsSync();
