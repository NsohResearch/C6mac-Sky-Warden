import { useState } from 'react';
import {
  Cloud, Wind, Thermometer, Eye, Droplets, Sun, CloudRain, CloudSnow,
  CloudLightning, Compass, Gauge, AlertTriangle, CheckCircle, XCircle,
  Info, Navigation, MapPin, Clock, RefreshCw, Layers, Radio, Shield,
} from 'lucide-react';
import { clsx } from 'clsx';

// ── Mock Data ──────────────────────────────────────────────────────────────

type OverallStatus = 'green' | 'yellow' | 'red';
type FlightCat = 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
type FactorStatus = 'ok' | 'caution' | 'no_go';
type Coverage = 'FEW' | 'SCT' | 'BKN' | 'OVC';
type AlertSeverity = 'advisory' | 'warning' | 'urgent';
type StationType = 'ASOS' | 'AWOS' | 'manual';
type KpLevel = 'quiet' | 'unsettled' | 'active' | 'minor_storm' | 'major_storm';

interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  icaoCode: string;
  metar: string;
  current: {
    temperature: number;
    dewPoint: number;
    humidity: number;
    pressure: number;
    visibility: number;
    cloudCeiling: number | null;
    cloudLayers: Array<{ coverage: Coverage; altitude: number }>;
    wind: { speed: number; gust: number | null; direction: number };
    precipitation: string;
    conditions: string[];
  };
  assessment: {
    overall: OverallStatus;
    flightCategory: FlightCat;
    recommendation: string;
    validUntil: string;
    factors: Array<{
      category: string;
      status: FactorStatus;
      value: string;
      limit: string;
      description: string;
    }>;
  };
  forecast: Array<{
    time: string;
    temperature: number;
    wind: { speed: number; gust: number | null; direction: number };
    precipitation: string;
    visibility: number;
    cloudCeiling: number | null;
    flightCategory: FlightCat;
  }>;
  kpIndex: { value: number; level: KpLevel; forecast: Array<{ time: string; value: number }> };
  densityAltitude: number;
  alerts: Array<{
    id: string;
    type: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    validFrom: string;
    validTo: string;
  }>;
  stations: Array<{
    icaoCode: string;
    name: string;
    distanceNm: number;
    type: StationType;
    lastReport: string;
    elevation: number;
  }>;
}

const locations: LocationData[] = [
  {
    id: 'klax',
    name: 'Los Angeles Intl (KLAX)',
    lat: 33.9425,
    lng: -118.4081,
    icaoCode: 'KLAX',
    metar: 'KLAX 201953Z 25012G18KT 10SM FEW025 SCT040 22/14 A2992 RMK AO2 SLP132',
    current: {
      temperature: 22, dewPoint: 14, humidity: 62, pressure: 1013.2,
      visibility: 10, cloudCeiling: 2500,
      cloudLayers: [
        { coverage: 'FEW', altitude: 2500 },
        { coverage: 'SCT', altitude: 4000 },
      ],
      wind: { speed: 12, gust: 18, direction: 250 },
      precipitation: 'none',
      conditions: ['Clear below 2500 ft'],
    },
    assessment: {
      overall: 'green',
      flightCategory: 'VFR',
      recommendation: 'Conditions favorable for drone operations. Monitor wind gusts near 18 mph. Maintain visual line of sight.',
      validUntil: '2026-03-20T22:00:00Z',
      factors: [
        { category: 'Wind Speed', status: 'ok', value: '12 mph', limit: '25 mph', description: 'Sustained winds within safe operating limits' },
        { category: 'Wind Gusts', status: 'ok', value: '18 mph', limit: '35 mph', description: 'Gusts present but within limits' },
        { category: 'Visibility', status: 'ok', value: '10 SM', limit: '3 SM', description: 'Excellent visibility for VLOS operations' },
        { category: 'Cloud Ceiling', status: 'ok', value: '2,500 ft', limit: '400 ft', description: 'Well above minimum ceiling requirement' },
        { category: 'Precipitation', status: 'ok', value: 'None', limit: 'Light Rain', description: 'No precipitation reported or forecast' },
        { category: 'Temperature', status: 'ok', value: '22\u00b0C / 72\u00b0F', limit: '-10\u00b0C to 45\u00b0C', description: 'Temperature within battery operating range' },
        { category: 'KP Index', status: 'ok', value: '2 (Quiet)', limit: '5', description: 'Low geomagnetic activity, GPS reliable' },
        { category: 'Density Altitude', status: 'ok', value: '1,120 ft', limit: '8,000 ft', description: 'Minimal impact on drone performance' },
      ],
    },
    forecast: [
      { time: '20:00', temperature: 21, wind: { speed: 14, gust: 20, direction: 250 }, precipitation: 'None', visibility: 10, cloudCeiling: 2500, flightCategory: 'VFR' },
      { time: '21:00', temperature: 20, wind: { speed: 12, gust: 16, direction: 240 }, precipitation: 'None', visibility: 10, cloudCeiling: 3000, flightCategory: 'VFR' },
      { time: '22:00', temperature: 19, wind: { speed: 10, gust: null, direction: 240 }, precipitation: 'None', visibility: 10, cloudCeiling: 3500, flightCategory: 'VFR' },
      { time: '23:00', temperature: 18, wind: { speed: 8, gust: null, direction: 230 }, precipitation: 'None', visibility: 10, cloudCeiling: 4000, flightCategory: 'VFR' },
      { time: '00:00', temperature: 17, wind: { speed: 6, gust: null, direction: 220 }, precipitation: 'None', visibility: 10, cloudCeiling: null, flightCategory: 'VFR' },
      { time: '01:00', temperature: 16, wind: { speed: 5, gust: null, direction: 210 }, precipitation: 'None', visibility: 10, cloudCeiling: null, flightCategory: 'VFR' },
      { time: '02:00', temperature: 16, wind: { speed: 4, gust: null, direction: 200 }, precipitation: 'None', visibility: 10, cloudCeiling: null, flightCategory: 'VFR' },
      { time: '03:00', temperature: 15, wind: { speed: 4, gust: null, direction: 190 }, precipitation: 'None', visibility: 9, cloudCeiling: null, flightCategory: 'VFR' },
      { time: '04:00', temperature: 15, wind: { speed: 5, gust: null, direction: 180 }, precipitation: 'None', visibility: 8, cloudCeiling: null, flightCategory: 'VFR' },
      { time: '05:00', temperature: 14, wind: { speed: 4, gust: null, direction: 180 }, precipitation: 'None', visibility: 7, cloudCeiling: 5000, flightCategory: 'VFR' },
      { time: '06:00', temperature: 14, wind: { speed: 5, gust: null, direction: 170 }, precipitation: 'None', visibility: 6, cloudCeiling: 4000, flightCategory: 'VFR' },
      { time: '07:00', temperature: 15, wind: { speed: 6, gust: null, direction: 180 }, precipitation: 'None', visibility: 8, cloudCeiling: 3500, flightCategory: 'VFR' },
    ],
    kpIndex: {
      value: 2,
      level: 'quiet',
      forecast: [
        { time: '21:00', value: 2 },
        { time: '00:00', value: 2 },
        { time: '03:00', value: 1 },
      ],
    },
    densityAltitude: 1120,
    alerts: [
      {
        id: 'SIGMET-WS-001',
        type: 'AIRMET',
        severity: 'advisory',
        title: 'AIRMET Sierra - Mountain Obscuration',
        description: 'IFR conditions over mountains due to clouds/precip. Not affecting LA basin operations.',
        validFrom: '2026-03-20T18:00:00Z',
        validTo: '2026-03-21T00:00:00Z',
      },
    ],
    stations: [
      { icaoCode: 'KLAX', name: 'Los Angeles Intl', distanceNm: 0, type: 'ASOS', lastReport: '19:53Z', elevation: 125 },
      { icaoCode: 'KSMO', name: 'Santa Monica Muni', distanceNm: 5.2, type: 'ASOS', lastReport: '19:56Z', elevation: 175 },
      { icaoCode: 'KHHR', name: 'Jack Northrop Field', distanceNm: 6.1, type: 'AWOS', lastReport: '19:50Z', elevation: 66 },
      { icaoCode: 'KTOA', name: 'Zamperini Field', distanceNm: 10.8, type: 'ASOS', lastReport: '19:53Z', elevation: 101 },
    ],
  },
  {
    id: 'kjfk',
    name: 'New York JFK (KJFK)',
    lat: 40.6413,
    lng: -73.7781,
    icaoCode: 'KJFK',
    metar: 'KJFK 201956Z 04018G28KT 3SM -RA BR BKN008 OVC015 08/06 A2968 RMK AO2 RAB45 SLP052',
    current: {
      temperature: 8, dewPoint: 6, humidity: 87, pressure: 1005.2,
      visibility: 3, cloudCeiling: 800,
      cloudLayers: [
        { coverage: 'BKN', altitude: 800 },
        { coverage: 'OVC', altitude: 1500 },
      ],
      wind: { speed: 18, gust: 28, direction: 40 },
      precipitation: 'light_rain',
      conditions: ['Light Rain', 'Mist', 'Low ceiling'],
    },
    assessment: {
      overall: 'yellow',
      flightCategory: 'IFR',
      recommendation: 'Marginal conditions. Visibility at 3 SM meets minimum but ceiling is low. Gusty winds approaching caution threshold. Recommend delaying non-essential flights.',
      validUntil: '2026-03-20T23:00:00Z',
      factors: [
        { category: 'Wind Speed', status: 'ok', value: '18 mph', limit: '25 mph', description: 'Sustained winds within limits but elevated' },
        { category: 'Wind Gusts', status: 'caution', value: '28 mph', limit: '35 mph', description: 'Gusts approaching upper limit, reduce operations' },
        { category: 'Visibility', status: 'caution', value: '3 SM', limit: '3 SM', description: 'At minimum visibility for Part 107 operations' },
        { category: 'Cloud Ceiling', status: 'caution', value: '800 ft', limit: '400 ft', description: 'Low ceiling limits maximum altitude. Stay 500 ft below clouds.' },
        { category: 'Precipitation', status: 'caution', value: 'Light Rain', limit: 'Light Rain', description: 'Light rain may affect sensors and camera quality' },
        { category: 'Temperature', status: 'ok', value: '8\u00b0C / 46\u00b0F', limit: '-10\u00b0C to 45\u00b0C', description: 'Cool but within operating range; reduced battery performance' },
        { category: 'KP Index', status: 'ok', value: '3 (Unsettled)', limit: '5', description: 'Slightly elevated geomagnetic activity, GPS generally reliable' },
        { category: 'Density Altitude', status: 'ok', value: '-200 ft', limit: '8,000 ft', description: 'Below field elevation, good performance expected' },
      ],
    },
    forecast: [
      { time: '20:00', temperature: 8, wind: { speed: 20, gust: 30, direction: 40 }, precipitation: 'Rain', visibility: 2, cloudCeiling: 600, flightCategory: 'IFR' },
      { time: '21:00', temperature: 7, wind: { speed: 22, gust: 32, direction: 50 }, precipitation: 'Rain', visibility: 2, cloudCeiling: 500, flightCategory: 'IFR' },
      { time: '22:00', temperature: 7, wind: { speed: 20, gust: 28, direction: 50 }, precipitation: 'Rain', visibility: 3, cloudCeiling: 800, flightCategory: 'IFR' },
      { time: '23:00', temperature: 6, wind: { speed: 16, gust: 24, direction: 40 }, precipitation: 'Lt Rain', visibility: 4, cloudCeiling: 1200, flightCategory: 'MVFR' },
      { time: '00:00', temperature: 6, wind: { speed: 14, gust: 20, direction: 30 }, precipitation: 'Drizzle', visibility: 5, cloudCeiling: 1500, flightCategory: 'MVFR' },
      { time: '01:00', temperature: 5, wind: { speed: 12, gust: 18, direction: 30 }, precipitation: 'None', visibility: 6, cloudCeiling: 2000, flightCategory: 'MVFR' },
      { time: '02:00', temperature: 5, wind: { speed: 10, gust: null, direction: 20 }, precipitation: 'None', visibility: 8, cloudCeiling: 2500, flightCategory: 'VFR' },
      { time: '03:00', temperature: 4, wind: { speed: 8, gust: null, direction: 20 }, precipitation: 'None', visibility: 10, cloudCeiling: 3000, flightCategory: 'VFR' },
      { time: '04:00', temperature: 4, wind: { speed: 8, gust: null, direction: 10 }, precipitation: 'None', visibility: 10, cloudCeiling: 3500, flightCategory: 'VFR' },
      { time: '05:00', temperature: 3, wind: { speed: 6, gust: null, direction: 10 }, precipitation: 'None', visibility: 10, cloudCeiling: 4000, flightCategory: 'VFR' },
      { time: '06:00', temperature: 3, wind: { speed: 6, gust: null, direction: 360 }, precipitation: 'None', visibility: 10, cloudCeiling: 4500, flightCategory: 'VFR' },
      { time: '07:00', temperature: 4, wind: { speed: 8, gust: null, direction: 360 }, precipitation: 'None', visibility: 10, cloudCeiling: 5000, flightCategory: 'VFR' },
    ],
    kpIndex: {
      value: 3,
      level: 'unsettled',
      forecast: [
        { time: '21:00', value: 3 },
        { time: '00:00', value: 4 },
        { time: '03:00', value: 3 },
      ],
    },
    densityAltitude: -200,
    alerts: [
      {
        id: 'SIGMET-WS-002',
        type: 'SIGMET',
        severity: 'warning',
        title: 'SIGMET November - Embedded Thunderstorms',
        description: 'Embedded thunderstorms moving NE at 25kt. Tops FL350. Expect moderate to severe turbulence.',
        validFrom: '2026-03-20T18:00:00Z',
        validTo: '2026-03-21T02:00:00Z',
      },
      {
        id: 'AIRMET-TG-003',
        type: 'AIRMET',
        severity: 'advisory',
        title: 'AIRMET Tango - Low Level Wind Shear',
        description: 'Low level wind shear below 2000 ft AGL expected in the approach corridors. Non-convective LLWS.',
        validFrom: '2026-03-20T19:00:00Z',
        validTo: '2026-03-21T01:00:00Z',
      },
      {
        id: 'TFR-04-001',
        type: 'TFR',
        severity: 'urgent',
        title: 'TFR 4/0185 - VIP Movement',
        description: 'Temporary flight restriction for VIP movement. No UAS operations within 30 NM.',
        validFrom: '2026-03-20T20:00:00Z',
        validTo: '2026-03-20T23:00:00Z',
      },
    ],
    stations: [
      { icaoCode: 'KJFK', name: 'John F Kennedy Intl', distanceNm: 0, type: 'ASOS', lastReport: '19:56Z', elevation: 13 },
      { icaoCode: 'KLGA', name: 'LaGuardia', distanceNm: 9.1, type: 'ASOS', lastReport: '19:56Z', elevation: 21 },
      { icaoCode: 'KEWR', name: 'Newark Liberty Intl', distanceNm: 18.3, type: 'ASOS', lastReport: '19:56Z', elevation: 18 },
      { icaoCode: 'KFRG', name: 'Republic Airport', distanceNm: 22.5, type: 'AWOS', lastReport: '19:50Z', elevation: 82 },
    ],
  },
  {
    id: 'kden',
    name: 'Denver Intl (KDEN)',
    lat: 39.8561,
    lng: -104.6737,
    icaoCode: 'KDEN',
    metar: 'KDEN 201953Z 31035G48KT 1/2SM +SN BLSN VV010 M04/M06 A2934 RMK AO2 PK WND 31048/1950 SNINCR',
    current: {
      temperature: -4, dewPoint: -6, humidity: 86, pressure: 993.4,
      visibility: 0.5, cloudCeiling: null,
      cloudLayers: [
        { coverage: 'OVC', altitude: 1000 },
      ],
      wind: { speed: 35, gust: 48, direction: 310 },
      precipitation: 'snow',
      conditions: ['Heavy Snow', 'Blowing Snow', 'Vertical Visibility 1000 ft'],
    },
    assessment: {
      overall: 'red',
      flightCategory: 'LIFR',
      recommendation: 'DO NOT FLY. Conditions are well below safe drone operating minimums. Heavy snow, near-zero visibility, and extreme wind gusts. Wait for system passage and conditions to improve significantly.',
      validUntil: '2026-03-21T06:00:00Z',
      factors: [
        { category: 'Wind Speed', status: 'no_go', value: '35 mph', limit: '25 mph', description: 'Sustained winds far exceed safe operating limits' },
        { category: 'Wind Gusts', status: 'no_go', value: '48 mph', limit: '35 mph', description: 'Extreme gusts, risk of loss of control' },
        { category: 'Visibility', status: 'no_go', value: '0.5 SM', limit: '3 SM', description: 'Well below Part 107 minimum, VLOS impossible' },
        { category: 'Cloud Ceiling', status: 'no_go', value: 'Indefinite (VV010)', limit: '400 ft', description: 'Sky obscured, vertical visibility only 1000 ft' },
        { category: 'Precipitation', status: 'no_go', value: 'Heavy Snow', limit: 'Light Rain', description: 'Heavy snow and blowing snow, severe icing risk' },
        { category: 'Temperature', status: 'caution', value: '-4\u00b0C / 25\u00b0F', limit: '-10\u00b0C to 45\u00b0C', description: 'Near lower battery temp limit, significant capacity loss' },
        { category: 'KP Index', status: 'caution', value: '4 (Active)', limit: '5', description: 'Elevated geomagnetic activity, GPS may be degraded' },
        { category: 'Density Altitude', status: 'ok', value: '4,200 ft', limit: '8,000 ft', description: 'Reduced performance at altitude, plan accordingly' },
      ],
    },
    forecast: [
      { time: '20:00', temperature: -4, wind: { speed: 35, gust: 50, direction: 310 }, precipitation: 'Hvy Snow', visibility: 0.25, cloudCeiling: null, flightCategory: 'LIFR' },
      { time: '21:00', temperature: -5, wind: { speed: 32, gust: 45, direction: 320 }, precipitation: 'Hvy Snow', visibility: 0.5, cloudCeiling: null, flightCategory: 'LIFR' },
      { time: '22:00', temperature: -5, wind: { speed: 30, gust: 42, direction: 320 }, precipitation: 'Snow', visibility: 1, cloudCeiling: 500, flightCategory: 'LIFR' },
      { time: '23:00', temperature: -6, wind: { speed: 28, gust: 38, direction: 330 }, precipitation: 'Snow', visibility: 1.5, cloudCeiling: 800, flightCategory: 'IFR' },
      { time: '00:00', temperature: -7, wind: { speed: 24, gust: 34, direction: 330 }, precipitation: 'Lt Snow', visibility: 2, cloudCeiling: 1000, flightCategory: 'IFR' },
      { time: '01:00', temperature: -8, wind: { speed: 20, gust: 28, direction: 340 }, precipitation: 'Lt Snow', visibility: 3, cloudCeiling: 1500, flightCategory: 'MVFR' },
      { time: '02:00', temperature: -8, wind: { speed: 16, gust: 24, direction: 340 }, precipitation: 'Flurries', visibility: 4, cloudCeiling: 2000, flightCategory: 'MVFR' },
      { time: '03:00', temperature: -9, wind: { speed: 14, gust: 20, direction: 350 }, precipitation: 'None', visibility: 6, cloudCeiling: 2500, flightCategory: 'VFR' },
      { time: '04:00', temperature: -10, wind: { speed: 12, gust: 18, direction: 350 }, precipitation: 'None', visibility: 8, cloudCeiling: 3000, flightCategory: 'VFR' },
      { time: '05:00', temperature: -10, wind: { speed: 10, gust: null, direction: 360 }, precipitation: 'None', visibility: 10, cloudCeiling: 5000, flightCategory: 'VFR' },
      { time: '06:00', temperature: -11, wind: { speed: 8, gust: null, direction: 360 }, precipitation: 'None', visibility: 10, cloudCeiling: 8000, flightCategory: 'VFR' },
      { time: '07:00', temperature: -10, wind: { speed: 8, gust: null, direction: 10 }, precipitation: 'None', visibility: 10, cloudCeiling: 10000, flightCategory: 'VFR' },
    ],
    kpIndex: {
      value: 4,
      level: 'active',
      forecast: [
        { time: '21:00', value: 4 },
        { time: '00:00', value: 5 },
        { time: '03:00', value: 4 },
      ],
    },
    densityAltitude: 4200,
    alerts: [
      {
        id: 'SIGMET-WS-003',
        type: 'SIGMET',
        severity: 'urgent',
        title: 'SIGMET Oscar - Severe Turbulence & Icing',
        description: 'Severe turbulence and severe icing from surface to FL250. Active winter storm producing widespread hazardous conditions.',
        validFrom: '2026-03-20T16:00:00Z',
        validTo: '2026-03-21T06:00:00Z',
      },
      {
        id: 'AIRMET-ZB-004',
        type: 'AIRMET',
        severity: 'warning',
        title: 'AIRMET Zulu - Moderate Icing Below 12,000',
        description: 'Moderate icing below 12000 ft MSL. Freezing level at surface.',
        validFrom: '2026-03-20T15:00:00Z',
        validTo: '2026-03-21T08:00:00Z',
      },
    ],
    stations: [
      { icaoCode: 'KDEN', name: 'Denver Intl', distanceNm: 0, type: 'ASOS', lastReport: '19:53Z', elevation: 5431 },
      { icaoCode: 'KAPA', name: 'Centennial Airport', distanceNm: 14.2, type: 'ASOS', lastReport: '19:56Z', elevation: 5883 },
      { icaoCode: 'KBJC', name: 'Rocky Mountain Metro', distanceNm: 18.7, type: 'AWOS', lastReport: '19:50Z', elevation: 5673 },
      { icaoCode: 'KFTG', name: 'Front Range Airport', distanceNm: 12.1, type: 'AWOS', lastReport: '19:47Z', elevation: 5512 },
    ],
  },
];

// ── Config / Helpers ───────────────────────────────────────────────────────

const flightCatColors: Record<FlightCat, { bg: string; text: string; border: string }> = {
  VFR: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  MVFR: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  IFR: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  LIFR: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
};

const overallColors: Record<OverallStatus, { bg: string; ring: string; text: string; label: string }> = {
  green: { bg: 'bg-green-500', ring: 'ring-green-200', text: 'text-green-700', label: 'GO' },
  yellow: { bg: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-700', label: 'CAUTION' },
  red: { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', label: 'NO-GO' },
};

const severityColors: Record<AlertSeverity, { bg: string; text: string; border: string }> = {
  advisory: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  urgent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const kpColors = (v: number) => {
  if (v <= 2) return 'bg-green-500';
  if (v <= 3) return 'bg-yellow-500';
  if (v <= 5) return 'bg-orange-500';
  if (v <= 7) return 'bg-red-500';
  return 'bg-fuchsia-600';
};

const kpLevelLabels: Record<KpLevel, string> = {
  quiet: 'Quiet', unsettled: 'Unsettled', active: 'Active',
  minor_storm: 'Minor Storm', major_storm: 'Major Storm',
};

const windDirLabel = (deg: number) => {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

const factorIcon = (s: FactorStatus) => {
  if (s === 'ok') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (s === 'caution') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
};

const coverageLabel: Record<Coverage, string> = {
  FEW: 'Few (1-2 oktas)', SCT: 'Scattered (3-4 oktas)',
  BKN: 'Broken (5-7 oktas)', OVC: 'Overcast (8 oktas)',
};

const coverageWidth: Record<Coverage, string> = {
  FEW: 'w-1/4', SCT: 'w-1/2', BKN: 'w-3/4', OVC: 'w-full',
};

// ── Component ──────────────────────────────────────────────────────────────

export function WeatherPage() {
  const [selectedLocationId, setSelectedLocationId] = useState('klax');
  const [lastRefresh] = useState('2026-03-20 19:56 UTC');

  const loc = locations.find((l) => l.id === selectedLocationId) ?? locations[0];
  const overall = overallColors[loc.assessment.overall];
  const catColor = flightCatColors[loc.assessment.flightCategory];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Assessment</h1>
          <p className="mt-1 text-sm text-gray-500">Pre-flight & in-flight weather intelligence for drone operations</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" /> {lastRefresh}
          </span>
        </div>
      </div>

      {/* ── Pre-flight Assessment ────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield className="h-5 w-5 text-sky-600" /> Pre-flight Weather Assessment
          </h2>
        </div>
        <div className="p-6">
          {/* GO / CAUTION / NO-GO + Flight category */}
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className={clsx('flex h-24 w-24 items-center justify-center rounded-full ring-4', overall.bg, overall.ring)}>
                <span className="text-2xl font-extrabold text-white">{overall.label}</span>
              </div>
              <span className={clsx('text-sm font-semibold', overall.text)}>{overall.label === 'GO' ? 'Safe to Fly' : overall.label === 'CAUTION' ? 'Fly with Caution' : 'Do Not Fly'}</span>
            </div>
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <span className={clsx('inline-flex items-center rounded-md border px-3 py-1 text-sm font-bold', catColor.bg, catColor.text, catColor.border)}>
                {loc.assessment.flightCategory}
              </span>
              <span className="text-xs text-gray-500">Flight Category</span>
            </div>
            <div className="flex-1 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
              <div className="mb-1 flex items-center gap-1 font-medium text-gray-900"><Info className="h-4 w-4 text-sky-500" /> Recommendation</div>
              {loc.assessment.recommendation}
              <div className="mt-2 text-xs text-gray-400">Valid until {loc.assessment.validUntil.replace('T', ' ').replace('Z', ' UTC')}</div>
            </div>
          </div>

          {/* Factor Checklist */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Factor</th>
                  <th className="pb-2 pr-4 font-medium">Current</th>
                  <th className="pb-2 pr-4 font-medium">Limit</th>
                  <th className="pb-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {loc.assessment.factors.map((f) => (
                  <tr key={f.category} className="border-b border-gray-50">
                    <td className="py-2.5 pr-4">{factorIcon(f.status)}</td>
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{f.category}</td>
                    <td className="py-2.5 pr-4 font-mono text-gray-700">{f.value}</td>
                    <td className="py-2.5 pr-4 font-mono text-gray-500">{f.limit}</td>
                    <td className="py-2.5 text-gray-600">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Current Conditions + Wind + Clouds ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Conditions Cards */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-1">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Sun className="h-5 w-5 text-amber-500" /> Current Conditions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><Thermometer className="h-3.5 w-3.5" /> Temperature</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{loc.current.temperature}&deg;C</div>
              <div className="text-xs text-gray-400">Dew: {loc.current.dewPoint}&deg;C</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><Droplets className="h-3.5 w-3.5" /> Humidity</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{loc.current.humidity}%</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><Gauge className="h-3.5 w-3.5" /> Pressure</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{loc.current.pressure} hPa</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><Eye className="h-3.5 w-3.5" /> Visibility</div>
              <div className="mt-1 text-xl font-bold text-gray-900">{loc.current.visibility} SM</div>
            </div>
            {loc.current.conditions.length > 0 && (
              <div className="col-span-2 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500"><Cloud className="h-3.5 w-3.5" /> Conditions</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {loc.current.conditions.map((c) => (
                    <span key={c} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* METAR */}
          <div className="border-t border-gray-100 px-6 py-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500"><Radio className="h-3.5 w-3.5" /> Raw METAR</div>
            <div className="mt-1 rounded bg-gray-900 px-3 py-2 font-mono text-xs text-green-400 overflow-x-auto whitespace-nowrap">{loc.metar}</div>
          </div>
        </div>

        {/* Wind Compass */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Wind className="h-5 w-5 text-sky-600" /> Wind
            </h2>
          </div>
          <div className="flex flex-col items-center p-6">
            {/* Compass rose */}
            <div className="relative flex h-48 w-48 items-center justify-center">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
              <div className="absolute inset-3 rounded-full border border-gray-100" />
              {/* Cardinal labels */}
              {(['N', 'E', 'S', 'W'] as const).map((dir, i) => {
                const angle = i * 90;
                const radian = (angle - 90) * Math.PI / 180;
                const r = 86;
                const x = 96 + r * Math.cos(radian);
                const y = 96 + r * Math.sin(radian);
                return (
                  <span key={dir} className="absolute text-xs font-bold text-gray-400" style={{ left: x - 6, top: y - 8 }}>{dir}</span>
                );
              })}
              {/* Wind arrow */}
              <div
                className="absolute h-full w-full"
                style={{ transform: `rotate(${loc.current.wind.direction}deg)` }}
              >
                <div className="absolute left-1/2 top-4 -translate-x-1/2">
                  <Navigation className="h-6 w-6 text-sky-600 fill-sky-600" style={{ transform: 'rotate(180deg)' }} />
                </div>
              </div>
              {/* Center info */}
              <div className="z-10 flex flex-col items-center rounded-full bg-white px-3 py-2 shadow">
                <span className="text-2xl font-bold text-gray-900">{loc.current.wind.speed}</span>
                <span className="text-[10px] text-gray-500">mph</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-xs text-gray-500">Direction</div>
                <div className="font-semibold text-gray-900">{loc.current.wind.direction}&deg; ({windDirLabel(loc.current.wind.direction)})</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Gusts</div>
                <div className={clsx('font-semibold', loc.current.wind.gust && loc.current.wind.gust >= 35 ? 'text-red-600' : loc.current.wind.gust && loc.current.wind.gust >= 25 ? 'text-amber-600' : 'text-gray-900')}>
                  {loc.current.wind.gust ? `${loc.current.wind.gust} mph` : 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Layers */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Layers className="h-5 w-5 text-indigo-500" /> Cloud Layers
            </h2>
          </div>
          <div className="p-6">
            {loc.current.cloudLayers.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <Sun className="h-10 w-10 mb-2 text-amber-300" />
                <span className="text-sm font-medium">Clear Skies</span>
              </div>
            ) : (
              <div className="space-y-4">
                {[...loc.current.cloudLayers].reverse().map((layer, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{layer.altitude.toLocaleString()} ft AGL</span>
                      <span className="text-gray-500">{layer.coverage} &mdash; {coverageLabel[layer.coverage]}</span>
                    </div>
                    <div className="h-4 w-full rounded bg-gray-100">
                      <div className={clsx('h-4 rounded', coverageWidth[layer.coverage], layer.coverage === 'OVC' ? 'bg-gray-400' : layer.coverage === 'BKN' ? 'bg-gray-300' : layer.coverage === 'SCT' ? 'bg-gray-200' : 'bg-gray-150')}
                        style={{ backgroundColor: layer.coverage === 'FEW' ? '#e5e7eb' : undefined }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 rounded-lg bg-sky-50 p-3 text-xs text-sky-700">
                  <span className="font-medium">Ceiling:</span> {loc.current.cloudCeiling ? `${loc.current.cloudCeiling.toLocaleString()} ft AGL` : 'Indefinite / Sky Obscured'}
                  {loc.current.cloudCeiling && loc.current.cloudCeiling > 400 && (
                    <span className="ml-2 text-green-600">(Above 400 ft minimum)</span>
                  )}
                  {loc.current.cloudCeiling && loc.current.cloudCeiling <= 400 && (
                    <span className="ml-2 text-red-600">(Below 400 ft minimum!)</span>
                  )}
                  {!loc.current.cloudCeiling && (
                    <span className="ml-2 text-red-600">(Below minimum!)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hourly Forecast ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="h-5 w-5 text-gray-500" /> 12-Hour Forecast
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Time (Z)</th>
                <th className="px-4 py-3 font-medium">Cat</th>
                <th className="px-4 py-3 font-medium">Temp</th>
                <th className="px-4 py-3 font-medium">Wind</th>
                <th className="px-4 py-3 font-medium">Gust</th>
                <th className="px-4 py-3 font-medium">Dir</th>
                <th className="px-4 py-3 font-medium">Precip</th>
                <th className="px-4 py-3 font-medium">Vis</th>
                <th className="px-4 py-3 font-medium">Ceiling</th>
              </tr>
            </thead>
            <tbody>
              {loc.forecast.map((f, i) => {
                const fc = flightCatColors[f.flightCategory];
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-mono font-medium text-gray-900">{f.time}</td>
                    <td className="px-4 py-2.5">
                      <span className={clsx('inline-flex rounded px-2 py-0.5 text-xs font-bold', fc.bg, fc.text)}>{f.flightCategory}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{f.temperature}&deg;C</td>
                    <td className={clsx('px-4 py-2.5 font-mono', f.wind.speed >= 25 ? 'font-bold text-red-600' : 'text-gray-700')}>{f.wind.speed} mph</td>
                    <td className={clsx('px-4 py-2.5 font-mono', f.wind.gust && f.wind.gust >= 35 ? 'font-bold text-red-600' : f.wind.gust && f.wind.gust >= 25 ? 'text-amber-600' : 'text-gray-500')}>
                      {f.wind.gust ? `${f.wind.gust} mph` : '\u2014'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-gray-400" style={{ transform: `rotate(${f.wind.direction + 180}deg)` }} />
                        {f.wind.direction}&deg;
                      </span>
                    </td>
                    <td className={clsx('px-4 py-2.5', f.precipitation !== 'None' ? 'text-sky-700 font-medium' : 'text-gray-500')}>{f.precipitation}</td>
                    <td className={clsx('px-4 py-2.5 font-mono', f.visibility < 3 ? 'font-bold text-red-600' : f.visibility < 5 ? 'text-amber-600' : 'text-gray-700')}>{f.visibility} SM</td>
                    <td className={clsx('px-4 py-2.5 font-mono', !f.cloudCeiling ? 'text-red-600 font-bold' : f.cloudCeiling < 500 ? 'font-bold text-red-600' : f.cloudCeiling < 1000 ? 'text-amber-600' : 'text-gray-700')}>
                      {f.cloudCeiling ? `${f.cloudCeiling.toLocaleString()} ft` : 'Indef'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── KP Index + Weather Alerts ───────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* KP Index / Magnetic */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Compass className="h-5 w-5 text-purple-600" /> KP Index / Geomagnetic Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Gauge */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={loc.kpIndex.value <= 2 ? '#22c55e' : loc.kpIndex.value <= 3 ? '#eab308' : loc.kpIndex.value <= 5 ? '#f97316' : '#ef4444'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(loc.kpIndex.value / 9) * 264} 264`}
                    />
                  </svg>
                  <div className="z-10 flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">{loc.kpIndex.value}</span>
                    <span className="text-[10px] text-gray-500">of 9</span>
                  </div>
                </div>
                <span className={clsx('mt-2 rounded-full px-3 py-0.5 text-xs font-semibold', kpColors(loc.kpIndex.value), 'text-white')}>
                  {kpLevelLabels[loc.kpIndex.level]}
                </span>
              </div>
              {/* Description */}
              <div className="flex-1 space-y-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="font-medium text-gray-900">GPS Impact</div>
                  <div className="mt-0.5 text-gray-600">
                    {loc.kpIndex.value <= 2 && 'Minimal impact on GPS accuracy. Reliable drone navigation expected.'}
                    {loc.kpIndex.value === 3 && 'Slight GPS degradation possible. Monitor positioning accuracy.'}
                    {loc.kpIndex.value === 4 && 'GPS accuracy may be reduced. Consider additional waypoint verification.'}
                    {loc.kpIndex.value >= 5 && 'Significant GPS errors likely. Postpone autonomous flight missions.'}
                  </div>
                </div>
                {/* 3hr forecast */}
                <div>
                  <div className="mb-2 text-xs font-medium text-gray-500">3-Hour Forecast</div>
                  <div className="flex gap-2">
                    {loc.kpIndex.forecast.map((f, i) => (
                      <div key={i} className="flex flex-col items-center rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-xs text-gray-500">{f.time}Z</span>
                        <span className={clsx('mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white', kpColors(f.value))}>
                          {f.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Weather Alerts
              {loc.alerts.length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{loc.alerts.length}</span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {loc.alerts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <CheckCircle className="h-10 w-10 mb-2 text-green-300" />
                <span className="text-sm font-medium">No active weather alerts</span>
              </div>
            ) : (
              <div className="space-y-3">
                {loc.alerts.map((a) => {
                  const sev = severityColors[a.severity];
                  return (
                    <div key={a.id} className={clsx('rounded-lg border p-4', sev.bg, sev.border)}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={clsx('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', sev.text, a.severity === 'urgent' ? 'bg-red-100' : a.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100')}>
                              {a.type}
                            </span>
                            <span className={clsx('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', sev.text, a.severity === 'urgent' ? 'bg-red-200' : a.severity === 'warning' ? 'bg-amber-200' : 'bg-blue-200')}>
                              {a.severity}
                            </span>
                          </div>
                          <div className={clsx('mt-1 text-sm font-semibold', sev.text)}>{a.title}</div>
                          <div className="mt-1 text-xs text-gray-600">{a.description}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="h-3 w-3" />
                        {a.validFrom.replace('T', ' ').replace('Z', '')} &mdash; {a.validTo.replace('T', ' ').replace('Z', ' UTC')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Nearby Stations ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MapPin className="h-5 w-5 text-green-600" /> Nearby Weather Stations
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                <th className="px-6 py-3 font-medium">ICAO</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Distance</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Elevation</th>
                <th className="px-4 py-3 font-medium">Last Report</th>
              </tr>
            </thead>
            <tbody>
              {loc.stations.map((s) => (
                <tr key={s.icaoCode} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-2.5 font-mono font-bold text-sky-700">{s.icaoCode}</td>
                  <td className="px-4 py-2.5 text-gray-900">{s.name}</td>
                  <td className="px-4 py-2.5 text-gray-700">{s.distanceNm} NM</td>
                  <td className="px-4 py-2.5">
                    <span className={clsx('rounded px-2 py-0.5 text-xs font-medium', s.type === 'ASOS' ? 'bg-green-50 text-green-700' : s.type === 'AWOS' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600')}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{s.elevation.toLocaleString()} ft</td>
                  <td className="px-4 py-2.5 font-mono text-gray-500">{s.lastReport}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Part 107 Weather Minimums Reference ─────────────────────────── */}
      <div className="rounded-xl border border-sky-200 bg-sky-50 shadow-sm">
        <div className="border-b border-sky-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-sky-900">
            <Info className="h-5 w-5 text-sky-600" /> 14 CFR Part 107 &mdash; Weather Minimums Reference
          </h2>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700"><Eye className="h-4 w-4" /> Visibility</div>
            <div className="mt-1 text-lg font-bold text-gray-900">3 statute miles</div>
            <div className="mt-0.5 text-xs text-gray-500">Minimum flight visibility from control station</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700"><Cloud className="h-4 w-4" /> Cloud Clearance</div>
            <div className="mt-1 text-lg font-bold text-gray-900">500 ft below clouds</div>
            <div className="mt-0.5 text-xs text-gray-500">Must remain 500 ft below, 2000 ft horizontal from clouds</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700"><Wind className="h-4 w-4" /> Max Wind (Advisory)</div>
            <div className="mt-1 text-lg font-bold text-gray-900">25 mph sustained</div>
            <div className="mt-0.5 text-xs text-gray-500">Manufacturer limits may be lower. Gusts add risk.</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700"><Navigation className="h-4 w-4" /> Altitude</div>
            <div className="mt-1 text-lg font-bold text-gray-900">400 ft AGL max</div>
            <div className="mt-0.5 text-xs text-gray-500">Unless within 400 ft of a structure</div>
          </div>
        </div>
      </div>
    </div>
  );
}
