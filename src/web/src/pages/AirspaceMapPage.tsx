import { useEffect, useRef, useState, useCallback } from 'react';
import { useAirspaceCheck } from '../hooks/useAirspaceCheck';
import {
  MapPin, Search, Shield, AlertTriangle, CheckCircle,
  XCircle, Info, Layers, Crosshair, Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

const ADVISORY_COLORS = {
  clear: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: CheckCircle },
  caution: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: Info },
  warning: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: AlertTriangle },
  restricted: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: XCircle },
  prohibited: { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-400', icon: XCircle },
};

const ADVISORY_MESSAGES = {
  clear: 'Safe to fly — no restrictions detected',
  caution: 'Controlled airspace — LAANC authorization available',
  warning: 'Above UASFM limits — further coordination required',
  restricted: 'Active flight restriction — do not fly without authorization',
  prohibited: 'Prohibited airspace — flight not permitted',
};

export function AirspaceMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [altitude, setAltitude] = useState(200);
  const [activeLayers, setActiveLayers] = useState<string[]>(['uasfm', 'tfr', 'airspace_class']);
  const airspaceCheck = useAirspaceCheck();

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    airspaceCheck.mutate({
      latitude: lat,
      longitude: lng,
      altitudeFt: altitude,
    });
  }, [altitude, airspaceCheck]);

  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        airspaceCheck.mutate({ latitude, longitude, altitudeFt: altitude });
      },
      () => { /* Location denied */ }
    );
  };

  const result = airspaceCheck.data?.data;
  const advisoryStyle = result ? ADVISORY_COLORS[result.advisoryLevel] : null;
  const AdvisoryIcon = advisoryStyle?.icon ?? Info;

  const layers = [
    { id: 'uasfm', label: 'UAS Facility Maps', color: 'bg-blue-400' },
    { id: 'airspace_class', label: 'Airspace Classes', color: 'bg-purple-400' },
    { id: 'tfr', label: 'TFRs', color: 'bg-red-400' },
    { id: 'notam', label: 'NOTAMs', color: 'bg-orange-400' },
    { id: 'airports', label: 'Airports', color: 'bg-gray-400' },
    { id: 'national_parks', label: 'National Parks', color: 'bg-green-400' },
    { id: 'stadiums', label: 'Stadiums', color: 'bg-yellow-400' },
    { id: 'local_rules', label: 'Local Rules', color: 'bg-teal-400' },
    { id: 'geofences', label: 'Geofences', color: 'bg-indigo-400' },
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Map */}
      <div className="flex-1 relative rounded-xl overflow-hidden border bg-gray-200">
        {/* Map placeholder — in production, this renders a Mapbox GL map */}
        <div ref={mapContainer} className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="font-medium">Interactive Airspace Map</p>
            <p className="text-sm mt-1">Mapbox GL with UASFM, TFR, and airspace overlays</p>
            <p className="text-xs mt-2 text-gray-400">Set MAPBOX_ACCESS_TOKEN to enable</p>
            <button
              onClick={() => handleMapClick(38.8977, -77.0365)} // Demo: Washington DC
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Demo: Check DC Airspace
            </button>
          </div>
        </div>

        {/* Search bar overlay */}
        <div className="absolute top-4 left-4 right-4 max-w-lg z-10">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, airport code, or coordinates..."
              className="w-full rounded-xl bg-white shadow-lg border border-gray-200 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute right-4 top-20 flex flex-col gap-2 z-10">
          <button
            onClick={handleMyLocation}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md border hover:bg-gray-50"
            title="My location"
          >
            <Crosshair size={18} />
          </button>
        </div>

        {/* Altitude slider */}
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-xl shadow-lg p-4 min-w-[200px]">
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Altitude</span>
            <span className="font-mono text-blue-600">{altitude} ft AGL</span>
          </label>
          <input
            type="range"
            min={0}
            max={400}
            step={25}
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 ft</span>
            <span>400 ft</span>
          </div>
        </div>
      </div>

      {/* Right sidebar — Airspace Info */}
      <div className="w-80 flex flex-col gap-4 overflow-y-auto">
        {/* Advisory Card */}
        {airspaceCheck.isPending && (
          <div className="flex items-center justify-center rounded-xl border bg-white p-8">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        )}

        {result && advisoryStyle && (
          <div className={clsx('rounded-xl border-2 p-5', advisoryStyle.bg, advisoryStyle.border)}>
            <div className="flex items-center gap-3 mb-3">
              <AdvisoryIcon size={24} className={advisoryStyle.text} />
              <div>
                <p className={clsx('font-bold text-lg uppercase', advisoryStyle.text)}>
                  {result.advisoryLevel}
                </p>
                <p className={clsx('text-sm', advisoryStyle.text)}>
                  {result.canFly ? 'Can fly' : 'Cannot fly'}
                </p>
              </div>
            </div>
            <p className={clsx('text-sm', advisoryStyle.text)}>
              {ADVISORY_MESSAGES[result.advisoryLevel]}
            </p>

            {result.maxAltitudeFt !== null && (
              <div className="mt-3 rounded-lg bg-white/60 p-3">
                <p className="text-xs font-medium text-gray-600">Max Approved Altitude</p>
                <p className="text-2xl font-bold text-gray-900">{result.maxAltitudeFt} ft AGL</p>
              </div>
            )}

            {result.airspaceClass && (
              <div className="mt-2 rounded-lg bg-white/60 p-3">
                <p className="text-xs font-medium text-gray-600">Airspace Class</p>
                <p className="text-lg font-bold text-gray-900">Class {result.airspaceClass}</p>
              </div>
            )}

            {result.requiresAuthorization && result.laancAvailable && (
              <button className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Shield size={16} />
                Request LAANC Authorization
              </button>
            )}

            {result.nearestAirport && (
              <div className="mt-2 text-xs text-gray-600">
                Nearest airport: <strong>{result.nearestAirport.code}</strong> — {result.nearestAirport.name} ({result.nearestAirport.distanceNm.toFixed(1)} NM)
              </div>
            )}
          </div>
        )}

        {/* TFR Alerts */}
        {result?.tfrs && result.tfrs.length > 0 && (
          <div className="rounded-xl border bg-white p-4">
            <h3 className="flex items-center gap-2 font-semibold text-sm text-red-600 mb-3">
              <AlertTriangle size={16} />
              Active TFRs ({result.tfrs.length})
            </h3>
            <div className="space-y-2">
              {result.tfrs.map((tfr: any, i: number) => (
                <div key={i} className="rounded-lg bg-red-50 p-3 border border-red-100">
                  <p className="text-xs font-medium text-red-800">{tfr.notamNumber}</p>
                  <p className="text-xs text-red-700 mt-1">{tfr.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer Controls */}
        <div className="rounded-xl border bg-white p-4">
          <h3 className="flex items-center gap-2 font-semibold text-sm text-gray-900 mb-3">
            <Layers size={16} />
            Map Layers
          </h3>
          <div className="space-y-2">
            {layers.map((layer) => (
              <label key={layer.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLayers.includes(layer.id)}
                  onChange={() => {
                    setActiveLayers((prev) =>
                      prev.includes(layer.id) ? prev.filter((l) => l !== layer.id) : [...prev, layer.id]
                    );
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className={clsx('h-3 w-3 rounded', layer.color)} />
                <span className="text-sm text-gray-700">{layer.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="rounded-xl border bg-white p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">Airspace Classes</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-red-400" /> <span>Class B — Major airports (authorization required)</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-orange-400" /> <span>Class C — Medium airports (authorization required)</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-blue-400" /> <span>Class D — Small towered airports (authorization required)</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-purple-400" /> <span>Class E — Surface area (authorization may be required)</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-green-400" /> <span>Class G — Uncontrolled (generally safe below 400ft)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
