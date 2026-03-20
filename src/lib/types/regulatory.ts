// Types for global drone/UAS regulatory authority data

export type GeoRegionCode =
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
  name: string;
  acronym: string;
  website: string;
  registrationPortal: string | null;
}

export interface DroneRegulations {
  primaryRegulation: string;
  pilotCertName: string;
  registrationRequired: boolean;
  remoteIdRequired: RemoteIdStatus;
  remoteIdRegulation: string | null;
  maxAltitudeFt: number;
  maxWeightKg: number;
  laancEquivalent: string | null;
  authorizationSystem: string | null;
}

export interface LocaleSettings {
  currency: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  distanceUnit: DistanceUnit;
  altitudeUnit: AltitudeUnit;
  speedUnit: SpeedUnit;
  weightUnit: WeightUnit;
  temperatureUnit: TemperatureUnit;
}

export interface CountryAuthority {
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  region: GeoRegionCode;
  authority: RegulatoryAuthority;
  regulations: DroneRegulations;
  locale: LocaleSettings;
  emergencyNumber: string;
  aviationEmergency: string | null;
}
