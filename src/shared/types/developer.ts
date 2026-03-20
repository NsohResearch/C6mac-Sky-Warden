import type { UUID, ISOTimestamp, Permission } from './common';

// ─── Developer Portal ───

export interface DeveloperApp {
  id: UUID;
  tenantId: UUID;
  userId: UUID;
  name: string;
  description: string;
  website?: string;
  callbackUrls: string[];
  clientId: string;
  clientSecretHash: string;
  environment: 'sandbox' | 'production';
  status: 'active' | 'suspended' | 'revoked';
  scopes: Permission[];
  rateLimitTier: RateLimitTier;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export type RateLimitTier = 'free' | 'basic' | 'professional' | 'enterprise';

export const RATE_LIMIT_CONFIG: Record<RateLimitTier, { requestsPerMinute: number; requestsPerDay: number; burstSize: number }> = {
  free: { requestsPerMinute: 10, requestsPerDay: 1000, burstSize: 20 },
  basic: { requestsPerMinute: 60, requestsPerDay: 10000, burstSize: 100 },
  professional: { requestsPerMinute: 300, requestsPerDay: 100000, burstSize: 500 },
  enterprise: { requestsPerMinute: 1000, requestsPerDay: 1000000, burstSize: 2000 },
};

// ─── API Key ───

export interface DeveloperApiKey {
  id: UUID;
  appId: UUID;
  tenantId: UUID;
  name: string;
  keyPrefix: string;          // First 8 chars shown to user
  hashedKey: string;          // SHA-256 hash of full key
  scopes: Permission[];
  environment: 'sandbox' | 'production';
  expiresAt?: ISOTimestamp;
  lastUsedAt?: ISOTimestamp;
  usageCount: number;
  ipAllowlist?: string[];
  status: 'active' | 'revoked';
  createdAt: ISOTimestamp;
}

// ─── Webhooks ───

export type WebhookEvent =
  | 'mission.created'
  | 'mission.started'
  | 'mission.completed'
  | 'mission.aborted'
  | 'laanc.submitted'
  | 'laanc.approved'
  | 'laanc.denied'
  | 'laanc.expired'
  | 'drone.status_changed'
  | 'drone.telemetry'
  | 'drone.maintenance_due'
  | 'tfr.new'
  | 'tfr.updated'
  | 'tfr.cancelled'
  | 'compliance.alert'
  | 'incident.reported'
  | 'airspace.rule_changed';

export interface Webhook {
  id: UUID;
  appId: UUID;
  tenantId: UUID;
  url: string;
  events: WebhookEvent[];
  secret: string;           // HMAC-SHA256 signing secret
  status: 'active' | 'paused' | 'failing';
  failureCount: number;
  lastDeliveredAt?: ISOTimestamp;
  lastResponseCode?: number;
  lastFailureAt?: ISOTimestamp;
  lastFailureReason?: string;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    backoffMultiplier: number;
  };
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface WebhookDelivery {
  id: UUID;
  webhookId: UUID;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  requestHeaders: Record<string, string>;
  responseCode?: number;
  responseBody?: string;
  responseTimeMs?: number;
  attempt: number;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  deliveredAt?: ISOTimestamp;
  nextRetryAt?: ISOTimestamp;
  error?: string;
  createdAt: ISOTimestamp;
}

// ─── API Usage ───

export interface ApiUsageRecord {
  id: UUID;
  apiKeyId: UUID;
  appId: UUID;
  tenantId: UUID;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  requestSizeBytes: number;
  responseSizeBytes: number;
  ipAddress: string;
  userAgent: string;
  timestamp: ISOTimestamp;
}

export interface ApiUsageSummary {
  appId: UUID;
  period: { start: ISOTimestamp; end: ISOTimestamp };
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  topEndpoints: { endpoint: string; method: string; count: number; avgMs: number }[];
  errorsByCode: Record<number, number>;
  requestsByHour: number[];
  bandwidthBytes: number;
}

// ─── Sandbox ───

export interface SandboxEnvironment {
  id: UUID;
  appId: UUID;
  tenantId: UUID;
  status: 'provisioning' | 'active' | 'suspended' | 'deleted';
  seedData: {
    drones: number;
    pilots: number;
    missions: number;
    authorizations: number;
  };
  resetAt?: ISOTimestamp;
  expiresAt: ISOTimestamp;
  createdAt: ISOTimestamp;
}
