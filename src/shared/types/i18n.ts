export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  region: string;
  flag: string; // emoji flag
  completionPercent: number;
  dateFormat: string;
  numberFormat: { decimal: string; thousands: string; currency: string };
  measurementSystem: 'metric' | 'imperial';
  altitudeUnit: 'feet' | 'meters';
  speedUnit: 'knots' | 'mph' | 'kmh' | 'ms';
  distanceUnit: 'nm' | 'miles' | 'km';
  temperatureUnit: 'celsius' | 'fahrenheit';
  weightUnit: 'kg' | 'lbs';
  timezone: string;
}

export interface LocalizationPreferences {
  userId: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  measurementSystem: 'metric' | 'imperial';
  altitudeUnit: 'feet' | 'meters';
  speedUnit: 'knots' | 'mph' | 'kmh' | 'ms';
  distanceUnit: 'nm' | 'miles' | 'km';
  temperatureUnit: 'celsius' | 'fahrenheit';
  weightUnit: 'kg' | 'lbs';
  timezone: string;
  currency: string;
  firstDayOfWeek: 0 | 1 | 6;
  coordinateFormat: 'dd' | 'dms' | 'ddm';
}

export interface TranslationProgress {
  language: string;
  totalStrings: number;
  translatedStrings: number;
  reviewedStrings: number;
  completionPercent: number;
  lastUpdated: string;
  contributors: string[];
}
