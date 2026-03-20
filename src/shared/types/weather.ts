export interface WeatherReport {
  location: { lat: number; lng: number; name: string; icaoCode?: string; };
  timestamp: string;
  source: 'metar' | 'taf' | 'openweather' | 'aviation_weather_center';
  current: {
    temperature: number; dewPoint: number; humidity: number; pressure: number;
    visibility: number; cloudCeiling: number | null;
    cloudLayers: Array<{ coverage: 'FEW' | 'SCT' | 'BKN' | 'OVC'; altitude: number }>;
    wind: { speed: number; gust: number | null; direction: number; variableFrom?: number; variableTo?: number; };
    precipitation: 'none' | 'light_rain' | 'rain' | 'heavy_rain' | 'snow' | 'freezing_rain' | 'hail';
    conditions: string[];
  };
  forecast: Array<{
    time: string; temperature: number; wind: { speed: number; gust: number | null; direction: number };
    precipitation: string; visibility: number; cloudCeiling: number | null; flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  }>;
  kpIndex: { value: number; level: 'quiet' | 'unsettled' | 'active' | 'minor_storm' | 'major_storm'; };
  densityAltitude: number;
}

export interface FlightWeatherAssessment {
  overall: 'green' | 'yellow' | 'red';
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  factors: Array<{
    category: string; status: 'ok' | 'caution' | 'no_go';
    value: string; limit: string; description: string;
  }>;
  recommendation: string;
  validUntil: string;
}

export interface WeatherStation {
  icaoCode: string; name: string; lat: number; lng: number; elevation: number;
  distanceNm: number; type: 'ASOS' | 'AWOS' | 'manual';
}

export interface WeatherAlert {
  id: string; type: 'SIGMET' | 'AIRMET' | 'NOTAM' | 'TFR' | 'convective' | 'turbulence' | 'icing';
  severity: 'advisory' | 'warning' | 'urgent';
  title: string; description: string;
  validFrom: string; validTo: string;
  affectedArea?: { lat: number; lng: number; radius: number };
}
