// Types for global drone/UAS regulatory authority data

export type RegionCode =
  | 'north_america'
  | 'europe'
  | 'africa'
  | 'middle_east'
  | 'asia_pacific'
  | 'south_america';

export type DistanceUnit = 'feet' | 'meters';
export type AltitudeUnit = 'feet' | 'meters';
export type SpeedUnit = 'mph' | 'km/h' | 'knots';
export type WeightUnit = 'pounds' | 'kilograms' | 'grams';
export type TemperatureUnit = 'fahrenheit' | 'celsius';
export type TimeFormat = '12h' | '24h';
export type RemoteIdStatus = 'required' | 'planned' | 'not_required';

export interface RegulatoryAuthority {
  /** Full name of the regulatory authority */
  name: string;
  /** Common acronym (e.g., FAA, CAA, EASA) */
  acronym: string;
  /** Official website for UAS/drone information */
  website: string;
  /** Online portal for drone registration, if available */
  registrationPortal: string | null;
}

export interface DroneRegulations {
  /** Primary regulation name/number (e.g., "14 CFR Part 107") */
  primaryRegulation: string;
  /** Name of the pilot certification/license required */
  pilotCertName: string;
  /** Whether drone registration is mandatory */
  registrationRequired: boolean;
  /** Remote ID status */
  remoteIdRequired: RemoteIdStatus;
  /** Regulation governing Remote ID, if applicable */
  remoteIdRegulation: string | null;
  /** Max altitude in feet AGL (400ft is ICAO standard) */
  maxAltitudeFt: number;
  /** Max drone weight in kg for standard operations */
  maxWeightKg: number;
  /** Name of LAANC-equivalent airspace authorization system, if any */
  laancEquivalent: string | null;
  /** Name of the authorization/approval system */
  authorizationSystem: string | null;
}

export interface LocaleSettings {
  /** ISO 4217 currency code */
  currency: string;
  /** Preferred date format */
  dateFormat: string;
  /** 12-hour or 24-hour time */
  timeFormat: TimeFormat;
  /** Preferred unit for horizontal distances */
  distanceUnit: DistanceUnit;
  /** Preferred unit for altitude reporting */
  altitudeUnit: AltitudeUnit;
  /** Preferred unit for speed */
  speedUnit: SpeedUnit;
  /** Preferred unit for drone weight */
  weightUnit: WeightUnit;
  /** Preferred temperature unit */
  temperatureUnit: TemperatureUnit;
}

export interface CountryAuthority {
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string;
  /** Country name in English */
  countryName: string;
  /** Country flag emoji */
  flagEmoji: string;
  /** Region grouping */
  region: RegionCode;
  /** Regulatory authority details */
  authority: RegulatoryAuthority;
  /** Drone-specific regulations */
  regulations: DroneRegulations;
  /** Locale and measurement preferences */
  locale: LocaleSettings;
  /** General emergency number (e.g., 911, 112, 999) */
  emergencyNumber: string;
  /** Aviation-specific emergency/incident hotline */
  aviationEmergency: string | null;
}
