// Common types used across the platform

export type UUID = string;
export type ISOTimestamp = string;
export type GeoJSONPoint = {
  type: 'Point';
  coordinates: [longitude: number, latitude: number, altitude?: number];
};
export type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: [longitude: number, latitude: number][][];
};
export type GeoJSONFeature<G = GeoJSONPoint | GeoJSONPolygon, P = Record<string, unknown>> = {
  type: 'Feature';
  geometry: G;
  properties: P;
};
export type GeoJSONFeatureCollection<G = GeoJSONPoint | GeoJSONPolygon, P = Record<string, unknown>> = {
  type: 'FeatureCollection';
  features: GeoJSONFeature<G, P>[];
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
  };
};

export type SortOrder = 'asc' | 'desc';

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'AUTHORIZE'
  | 'DENY'
  | 'EXPORT'
  | 'IMPORT'
  | 'ESCALATE';

export interface AuditLogEntry {
  id: UUID;
  timestamp: ISOTimestamp;
  tenantId: UUID;
  userId: UUID;
  action: AuditAction;
  resourceType: string;
  resourceId: UUID;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

export type Altitude = {
  value: number;
  unit: 'feet' | 'meters';
  reference: 'AGL' | 'MSL';
};

export type Coordinates = {
  latitude: number;
  longitude: number;
  altitude?: Altitude;
};

export type BoundingBox = {
  northEast: Coordinates;
  southWest: Coordinates;
};
