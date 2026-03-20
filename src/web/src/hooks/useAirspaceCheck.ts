import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../utils/api';

interface AirspaceCheckParams {
  latitude: number;
  longitude: number;
  altitudeFt?: number;
  startTime?: string;
  endTime?: string;
}

interface AirspaceCheckResult {
  success: boolean;
  data: {
    advisoryLevel: 'clear' | 'caution' | 'warning' | 'restricted' | 'prohibited';
    canFly: boolean;
    requiresAuthorization: boolean;
    laancAvailable: boolean;
    maxAltitudeFt: number | null;
    airspaceClass: string | null;
    nearestAirport?: { code: string; name: string; distanceNm: number };
    advisories: any[];
    restrictions: any[];
    facilities: any[];
    tfrs: any[];
    notams: any[];
    timestamp: string;
  };
}

export function useAirspaceCheck() {
  return useMutation({
    mutationFn: (params: AirspaceCheckParams) =>
      api.post<AirspaceCheckResult>('/airspace/check', params),
  });
}

export function useTfrs(bounds?: { ne: [number, number]; sw: [number, number] }) {
  return useQuery({
    queryKey: ['tfrs', bounds],
    queryFn: () =>
      bounds
        ? api.get<{ success: boolean; data: any[] }>('/airspace/tfrs', {
            northEastLat: bounds.ne[0],
            northEastLng: bounds.ne[1],
            southWestLat: bounds.sw[0],
            southWestLng: bounds.sw[1],
          })
        : Promise.resolve({ success: true, data: [] }),
    enabled: !!bounds,
    refetchInterval: 300_000, // 5 minutes
  });
}

export function useGeofences() {
  return useQuery({
    queryKey: ['geofences'],
    queryFn: () => api.get<{ success: boolean; data: any[] }>('/airspace/geofences'),
  });
}
