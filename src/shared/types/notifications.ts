export interface Notification {
  id: string;
  userId: string;
  tenantId: string;
  type: 'cert_expiry' | 'registration_renewal' | 'maintenance_due' | 'laanc_status' | 'tfr_alert' | 'weather_warning' | 'geofence_breach' | 'battery_alert' | 'compliance_deadline' | 'safety_report_due' | 'flight_plan_approved' | 'flight_plan_denied' | 'system_update' | 'billing' | 'team_invite' | 'incident_update';
  category: 'safety' | 'compliance' | 'operations' | 'billing' | 'system' | 'team';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  channels: Array<'in_app' | 'email' | 'sms' | 'push'>;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  categories: {
    safety: { enabled: boolean; channels: string[]; };
    compliance: { enabled: boolean; channels: string[]; };
    operations: { enabled: boolean; channels: string[]; };
    billing: { enabled: boolean; channels: string[]; };
    system: { enabled: boolean; channels: string[]; };
    team: { enabled: boolean; channels: string[]; };
  };
  quietHours: { enabled: boolean; start: string; end: string; timezone: string; exceptCritical: boolean; };
  digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCritical: number;
  byCategory: Record<string, number>;
  lastWeekTrend: number[];
}
