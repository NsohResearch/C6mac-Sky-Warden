// FAA Constants — Regulatory Values

/** Maximum altitude for UAS operations (14 CFR 107.51) */
export const MAX_UAS_ALTITUDE_FT = 400;

/** UASFM grid resolution: 30 seconds latitude × 30 seconds longitude */
export const UASFM_GRID_RESOLUTION_ARCSEC = 30;

/** UASFM altitude increments (0-400 in 50ft steps) */
export const UASFM_ALTITUDE_INCREMENT_FT = 50;

/** UASFM chart cycle (56 days) */
export const UASFM_CHART_CYCLE_DAYS = 56;

/** LAANC reference code length */
export const LAANC_REFERENCE_CODE_LENGTH = 12;

/** LAANC USS identifier length (first 3 chars of reference) */
export const LAANC_USS_ID_LENGTH = 3;

/** Further coordination minimum advance time (72 hours) */
export const LAANC_FURTHER_COORD_ADVANCE_HOURS = 72;

/** Default LAANC authorization max duration (hours) */
export const LAANC_DEFAULT_MAX_DURATION_HOURS = 4;

/** Remote ID enforcement date */
export const REMOTE_ID_ENFORCEMENT_DATE = '2024-03-16';

/** Minimum drone weight requiring registration (0.55 lbs = 250g) */
export const REGISTRATION_MIN_WEIGHT_GRAMS = 250;

/** FAA registration validity period (3 years) */
export const REGISTRATION_VALIDITY_YEARS = 3;

/** Part 107 certificate validity period (2 years before renewal test) */
export const PART107_RECURRENCY_YEARS = 2;

/** Airspace class descriptions */
export const AIRSPACE_CLASS_INFO: Record<string, { name: string; description: string; authRequired: boolean }> = {
  A: { name: 'Class A', description: 'Above 18,000 ft MSL — UAS generally prohibited', authRequired: true },
  B: { name: 'Class B', description: 'Major airports (e.g., LAX, JFK) — LAANC or authorization required', authRequired: true },
  C: { name: 'Class C', description: 'Medium airports with approach control — LAANC or authorization required', authRequired: true },
  D: { name: 'Class D', description: 'Small towered airports — LAANC or authorization required', authRequired: true },
  E: { name: 'Class E', description: 'Surface area extensions — authorization may be required below 400ft', authRequired: true },
  G: { name: 'Class G', description: 'Uncontrolled airspace — generally safe for UAS below 400ft AGL', authRequired: false },
};

/** FAA UDDS Data endpoints */
export const FAA_UDDS_DATASETS = {
  uasfm: '/datasets/uasfm',
  fria: '/datasets/fria',
  sua: '/datasets/sua',
  nationalSecurity: '/datasets/national-security',
  recreationalSites: '/datasets/recreational-sites',
} as const;

/** B4UFLY approved service providers */
export const B4UFLY_PROVIDERS = [
  'Airspace Link',
  'Aloft',
  'AutoPylot',
  'Avision',
  'UASidekick',
] as const;

/** LAANC coverage (as of 2025) */
export const LAANC_COVERAGE = {
  totalAirports: 726,
  coveragePercent: 81,
  description: '81% of controlled airspace where commercial drone operations commonly occur',
} as const;
