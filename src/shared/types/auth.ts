import type { UUID, ISOTimestamp } from './common';

// ─── Persona & Role Definitions ───

export type PersonaType =
  | 'individual_pilot'
  | 'enterprise_manager'
  | 'agency_representative'
  | 'developer';

export type SystemRole =
  | 'super_admin'
  | 'tenant_admin'
  | 'fleet_manager'
  | 'pilot'
  | 'safety_officer'
  | 'agency_admin'
  | 'agency_operator'
  | 'developer'
  | 'viewer';

export type Permission =
  // Fleet
  | 'fleet:read'
  | 'fleet:write'
  | 'fleet:delete'
  | 'fleet:manage_pilots'
  // Drones
  | 'drone:read'
  | 'drone:write'
  | 'drone:delete'
  | 'drone:telemetry'
  // Missions
  | 'mission:read'
  | 'mission:write'
  | 'mission:delete'
  | 'mission:approve'
  | 'mission:execute'
  // LAANC
  | 'laanc:read'
  | 'laanc:request'
  | 'laanc:approve'
  // Airspace
  | 'airspace:read'
  | 'airspace:write'
  | 'airspace:manage_rules'
  | 'airspace:manage_geofences'
  // Compliance
  | 'compliance:read'
  | 'compliance:write'
  | 'compliance:audit'
  | 'compliance:export'
  // Analytics
  | 'analytics:read'
  | 'analytics:export'
  // Users / IAM
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:manage_roles'
  // API / Developer
  | 'api:read'
  | 'api:manage_keys'
  | 'api:manage_webhooks'
  // Agency
  | 'agency:manage_rules'
  | 'agency:manage_geofences'
  | 'agency:view_incidents'
  | 'agency:manage_incidents';

// ─── RBAC Role → Permission Mapping ───

export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  super_admin: [
    'fleet:read', 'fleet:write', 'fleet:delete', 'fleet:manage_pilots',
    'drone:read', 'drone:write', 'drone:delete', 'drone:telemetry',
    'mission:read', 'mission:write', 'mission:delete', 'mission:approve', 'mission:execute',
    'laanc:read', 'laanc:request', 'laanc:approve',
    'airspace:read', 'airspace:write', 'airspace:manage_rules', 'airspace:manage_geofences',
    'compliance:read', 'compliance:write', 'compliance:audit', 'compliance:export',
    'analytics:read', 'analytics:export',
    'users:read', 'users:write', 'users:delete', 'users:manage_roles',
    'api:read', 'api:manage_keys', 'api:manage_webhooks',
    'agency:manage_rules', 'agency:manage_geofences', 'agency:view_incidents', 'agency:manage_incidents',
  ],
  tenant_admin: [
    'fleet:read', 'fleet:write', 'fleet:delete', 'fleet:manage_pilots',
    'drone:read', 'drone:write', 'drone:delete', 'drone:telemetry',
    'mission:read', 'mission:write', 'mission:delete', 'mission:approve', 'mission:execute',
    'laanc:read', 'laanc:request', 'laanc:approve',
    'airspace:read',
    'compliance:read', 'compliance:write', 'compliance:audit', 'compliance:export',
    'analytics:read', 'analytics:export',
    'users:read', 'users:write', 'users:delete', 'users:manage_roles',
    'api:read', 'api:manage_keys', 'api:manage_webhooks',
  ],
  fleet_manager: [
    'fleet:read', 'fleet:write', 'fleet:manage_pilots',
    'drone:read', 'drone:write', 'drone:telemetry',
    'mission:read', 'mission:write', 'mission:approve', 'mission:execute',
    'laanc:read', 'laanc:request',
    'airspace:read',
    'compliance:read', 'compliance:write',
    'analytics:read', 'analytics:export',
    'users:read',
  ],
  pilot: [
    'fleet:read',
    'drone:read', 'drone:telemetry',
    'mission:read', 'mission:write', 'mission:execute',
    'laanc:read', 'laanc:request',
    'airspace:read',
    'compliance:read',
    'analytics:read',
  ],
  safety_officer: [
    'fleet:read',
    'drone:read', 'drone:telemetry',
    'mission:read', 'mission:approve',
    'laanc:read',
    'airspace:read',
    'compliance:read', 'compliance:write', 'compliance:audit', 'compliance:export',
    'analytics:read', 'analytics:export',
  ],
  agency_admin: [
    'airspace:read', 'airspace:write', 'airspace:manage_rules', 'airspace:manage_geofences',
    'agency:manage_rules', 'agency:manage_geofences', 'agency:view_incidents', 'agency:manage_incidents',
    'analytics:read', 'analytics:export',
    'users:read', 'users:write', 'users:manage_roles',
  ],
  agency_operator: [
    'airspace:read',
    'agency:view_incidents', 'agency:manage_incidents',
    'analytics:read',
  ],
  developer: [
    'api:read', 'api:manage_keys', 'api:manage_webhooks',
    'airspace:read',
    'analytics:read',
  ],
  viewer: [
    'fleet:read',
    'drone:read',
    'mission:read',
    'laanc:read',
    'airspace:read',
    'compliance:read',
    'analytics:read',
  ],
};

// ─── User & Auth Models ───

export interface User {
  id: UUID;
  email: string;
  displayName: string;
  avatarUrl?: string;
  persona: PersonaType;
  tenantId: UUID;
  roles: SystemRole[];
  permissions: Permission[];
  mfaEnabled: boolean;
  mfaMethod?: 'totp' | 'webauthn' | 'sms';
  emailVerified: boolean;
  lastLoginAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  metadata: UserMetadata;
}

export interface UserMetadata {
  faaRegistrationNumber?: string;
  part107CertificateNumber?: string;
  part107ExpiresAt?: ISOTimestamp;
  trustCompletionId?: string;
  organizationName?: string;
  phoneNumber?: string;
  timezone?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  units: 'imperial' | 'metric';
  mapStyle: 'satellite' | 'street' | 'terrain' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    tfrAlerts: boolean;
    laancUpdates: boolean;
    maintenanceReminders: boolean;
  };
}

export interface Tenant {
  id: UUID;
  name: string;
  slug: string;
  type: 'individual' | 'enterprise' | 'agency' | 'developer';
  plan: 'free' | 'pro' | 'enterprise' | 'agency' | 'developer';
  settings: TenantSettings;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface TenantSettings {
  maxPilots: number;
  maxDrones: number;
  maxMissionsPerMonth: number;
  sso?: {
    enabled: boolean;
    provider: 'saml' | 'oidc';
    entityId?: string;
    metadataUrl?: string;
  };
  compliance?: {
    soc2Enabled: boolean;
    iso27001Enabled: boolean;
    dataRetentionDays: number;
    requiredMfa: boolean;
    ipAllowlist?: string[];
  };
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    customDomain?: string;
  };
}

export interface ApiKey {
  id: UUID;
  tenantId: UUID;
  userId: UUID;
  name: string;
  keyPrefix: string;
  hashedKey: string;
  scopes: Permission[];
  environment: 'sandbox' | 'production';
  rateLimit: number;
  expiresAt?: ISOTimestamp;
  lastUsedAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
}

export interface Session {
  id: UUID;
  userId: UUID;
  tenantId: UUID;
  ipAddress: string;
  userAgent: string;
  expiresAt: ISOTimestamp;
  createdAt: ISOTimestamp;
}

// ─── ABAC Policy Types ───

export interface AbacPolicy {
  id: UUID;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  conditions: AbacCondition[];
  actions: Permission[];
  priority: number;
  enabled: boolean;
}

export interface AbacCondition {
  attribute: string;
  operator: 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'within_geofence';
  value: unknown;
}

// ─── JWT Claims ───

export interface JwtPayload {
  sub: UUID;
  email: string;
  tenantId: UUID;
  persona: PersonaType;
  roles: SystemRole[];
  permissions: Permission[];
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti: UUID;
}
