// SkyWarden — Multi-Region Configuration
// Supports 12 countries across USA, Canada, and Africa

export type RegionCode = 'US' | 'CA' | 'NG' | 'KE' | 'ZA' | 'GH' | 'RW' | 'TZ' | 'ET' | 'SN' | 'CI' | 'UG';

export interface RegionConfig {
  code: RegionCode;
  label: string;
  country: string;
  currency: string;
  currencySymbol: string;
  divisor: number;
  regulatoryAuthority: string;
  authorityAcronym: string;
  timezone: string;
  mapCenter: [number, number]; // [lng, lat]
  mapZoom: number;
  registrationPrefix: string;
  mobileMoneyProviders: string[];
  laancSupported: boolean;
  remoteIdRequired: boolean;
}

export const REGION_CONFIGS: Record<RegionCode, RegionConfig> = {
  US: {
    code: 'US',
    label: 'United States',
    country: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    divisor: 100,
    regulatoryAuthority: 'Federal Aviation Administration',
    authorityAcronym: 'FAA',
    timezone: 'America/New_York',
    mapCenter: [-98.5795, 39.8283],
    mapZoom: 4,
    registrationPrefix: 'SKW-US',
    mobileMoneyProviders: [],
    laancSupported: true,
    remoteIdRequired: true,
  },
  CA: {
    code: 'CA',
    label: 'Canada',
    country: 'Canada',
    currency: 'CAD',
    currencySymbol: 'CA$',
    divisor: 100,
    regulatoryAuthority: 'Transport Canada Civil Aviation',
    authorityAcronym: 'Transport Canada',
    timezone: 'America/Toronto',
    mapCenter: [-106.3468, 56.1304],
    mapZoom: 3.5,
    registrationPrefix: 'SKW-CA',
    mobileMoneyProviders: [],
    laancSupported: false,
    remoteIdRequired: true,
  },
  NG: {
    code: 'NG',
    label: 'Nigeria',
    country: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    divisor: 100,
    regulatoryAuthority: 'Nigerian Civil Aviation Authority',
    authorityAcronym: 'NCAA',
    timezone: 'Africa/Lagos',
    mapCenter: [8.6753, 9.082],
    mapZoom: 5.5,
    registrationPrefix: 'SKW-NG',
    mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money'],
    laancSupported: false,
    remoteIdRequired: true,
  },
  KE: {
    code: 'KE',
    label: 'Kenya',
    country: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    divisor: 100,
    regulatoryAuthority: 'Kenya Civil Aviation Authority',
    authorityAcronym: 'KCAA',
    timezone: 'Africa/Nairobi',
    mapCenter: [37.9062, -0.0236],
    mapZoom: 6,
    registrationPrefix: 'SKW-KE',
    mobileMoneyProviders: ['M-Pesa', 'Airtel Money'],
    laancSupported: false,
    remoteIdRequired: true,
  },
  ZA: {
    code: 'ZA',
    label: 'South Africa',
    country: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    divisor: 100,
    regulatoryAuthority: 'South African Civil Aviation Authority',
    authorityAcronym: 'SACAA',
    timezone: 'Africa/Johannesburg',
    mapCenter: [25.0, -29.0],
    mapZoom: 5,
    registrationPrefix: 'SKW-ZA',
    mobileMoneyProviders: [],
    laancSupported: false,
    remoteIdRequired: true,
  },
  GH: {
    code: 'GH',
    label: 'Ghana',
    country: 'Ghana',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    divisor: 100,
    regulatoryAuthority: 'Ghana Civil Aviation Authority',
    authorityAcronym: 'GCAA',
    timezone: 'Africa/Accra',
    mapCenter: [-1.0232, 7.9465],
    mapZoom: 6.5,
    registrationPrefix: 'SKW-GH',
    mobileMoneyProviders: ['MTN Mobile Money', 'AirtelTigo Money'],
    laancSupported: false,
    remoteIdRequired: false,
  },
  RW: {
    code: 'RW',
    label: 'Rwanda',
    country: 'Rwanda',
    currency: 'RWF',
    currencySymbol: 'RF',
    divisor: 100,
    regulatoryAuthority: 'Rwanda Civil Aviation Authority',
    authorityAcronym: 'RCAA',
    timezone: 'Africa/Kigali',
    mapCenter: [29.8739, -1.9403],
    mapZoom: 8,
    registrationPrefix: 'SKW-RW',
    mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money'],
    laancSupported: false,
    remoteIdRequired: false,
  },
  TZ: {
    code: 'TZ',
    label: 'Tanzania',
    country: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    divisor: 100,
    regulatoryAuthority: 'Tanzania Civil Aviation Authority',
    authorityAcronym: 'TCAA',
    timezone: 'Africa/Dar_es_Salaam',
    mapCenter: [34.8888, -6.369],
    mapZoom: 5.5,
    registrationPrefix: 'SKW-TZ',
    mobileMoneyProviders: ['M-Pesa', 'Airtel Money', 'Tigo Pesa'],
    laancSupported: false,
    remoteIdRequired: false,
  },
  ET: {
    code: 'ET',
    label: 'Ethiopia',
    country: 'Ethiopia',
    currency: 'ETB',
    currencySymbol: 'Br',
    divisor: 100,
    regulatoryAuthority: 'Ethiopian Civil Aviation Authority',
    authorityAcronym: 'ECAA',
    timezone: 'Africa/Addis_Ababa',
    mapCenter: [40.4897, 9.145],
    mapZoom: 5,
    registrationPrefix: 'SKW-ET',
    mobileMoneyProviders: ['telebirr'],
    laancSupported: false,
    remoteIdRequired: false,
  },
  SN: {
    code: 'SN',
    label: 'Senegal',
    country: 'Senegal',
    currency: 'XOF',
    currencySymbol: 'CFA',
    divisor: 1,
    regulatoryAuthority: 'Agence Nationale de l\'Aviation Civile et de la Météorologie',
    authorityAcronym: 'ANACS',
    timezone: 'Africa/Dakar',
    mapCenter: [-14.4524, 14.4974],
    mapZoom: 6.5,
    registrationPrefix: 'SKW-SN',
    mobileMoneyProviders: ['Orange Money', 'Wave'],
    laancSupported: false,
    remoteIdRequired: false,
  },
  CI: {
    code: 'CI',
    label: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    currency: 'XOF',
    currencySymbol: 'CFA',
    divisor: 1,
    regulatoryAuthority: "Autorité Nationale de l'Aviation Civile",
    authorityAcronym: 'ANAC',
    timezone: 'Africa/Abidjan',
    mapCenter: [-5.5471, 7.54],
    mapZoom: 6.5,
    registrationPrefix: 'SKW-CI',
    mobileMoneyProviders: ['Orange Money', 'MTN Mobile Money'],
    laancSupported: false,
    remoteIdRequired: false,
  },
  UG: {
    code: 'UG',
    label: 'Uganda',
    country: 'Uganda',
    currency: 'UGX',
    currencySymbol: 'USh',
    divisor: 100,
    regulatoryAuthority: 'Uganda Civil Aviation Authority',
    authorityAcronym: 'UCAA',
    timezone: 'Africa/Kampala',
    mapCenter: [32.2903, 1.3733],
    mapZoom: 6.5,
    registrationPrefix: 'SKW-UG',
    mobileMoneyProviders: ['MTN Mobile Money', 'Airtel Money'],
    laancSupported: false,
    remoteIdRequired: false,
  },
};

export const BILLING_REGIONS = [
  { code: 'US' as RegionCode, label: 'USA', currency: 'USD', symbol: '$', divisor: 100 },
  { code: 'CA' as RegionCode, label: 'Canada', currency: 'CAD', symbol: 'CA$', divisor: 100 },
  { code: 'NG' as RegionCode, label: 'Nigeria', currency: 'NGN', symbol: '₦', divisor: 100 },
  { code: 'KE' as RegionCode, label: 'Kenya', currency: 'KES', symbol: 'KSh', divisor: 100 },
  { code: 'ZA' as RegionCode, label: 'South Africa', currency: 'ZAR', symbol: 'R', divisor: 100 },
  { code: 'GH' as RegionCode, label: 'Ghana', currency: 'GHS', symbol: 'GH₵', divisor: 100 },
  { code: 'RW' as RegionCode, label: 'Rwanda', currency: 'RWF', symbol: 'RF', divisor: 100 },
];

export function getRegionConfig(code: RegionCode): RegionConfig {
  return REGION_CONFIGS[code];
}

export function formatCurrencyAmount(amountInSmallest: number, currencySymbol: string, divisor = 100): string {
  if (amountInSmallest === 0) return 'Free';
  const value = amountInSmallest / divisor;
  if (value >= 1_000_000) return `${currencySymbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${currencySymbol}${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return `${currencySymbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}
