export interface DeliveryOperation {
  id: string;
  tenantId: string;
  orderId: string;
  status: 'pending' | 'preparing' | 'loaded' | 'in_transit' | 'approaching' | 'delivering' | 'completed' | 'returned' | 'failed';
  priority: 'standard' | 'express' | 'urgent' | 'medical';
  droneId: string;
  droneName: string;
  pilotId: string;
  pilotName: string;
  pickup: { name: string; address: string; lat: number; lng: number; contactPhone: string; pickupTime: string };
  dropoff: { name: string; address: string; lat: number; lng: number; contactPhone: string; requestedTime: string; actualTime?: string };
  package: { description: string; weight: number; dimensions: { l: number; w: number; h: number }; category: 'general' | 'food' | 'medical' | 'fragile' | 'hazmat'; temperature?: 'ambient' | 'cold' | 'frozen'; value: number };
  route: { distance: number; estimatedDuration: number; actualDuration?: number; waypoints: number; maxAltitude: number };
  tracking: { currentPosition?: { lat: number; lng: number; altitude: number }; eta?: string; distanceRemaining?: number; batteryAtDelivery?: number };
  recipientNotification: { sent: boolean; method: 'sms' | 'email' | 'push'; sentAt?: string };
  proofOfDelivery?: { type: 'photo' | 'signature' | 'code'; capturedAt: string; verified: boolean };
  cost: number;
  revenue: number;
  createdAt: string;
  completedAt?: string;
  notes: string;
  issues: Array<{ type: string; description: string; timestamp: string; resolved: boolean }>;
}

export interface DeliveryZone {
  id: string;
  name: string;
  type: 'service_area' | 'restricted' | 'priority' | 'medical_corridor';
  center: { lat: number; lng: number };
  radius: number;
  maxWeight: number;
  operatingHours: { start: string; end: string };
  status: 'active' | 'inactive' | 'weather_hold';
  deliveriesToday: number;
  avgDeliveryTime: number;
}

export interface DeliveryStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedToday: number;
  failedToday: number;
  onTimeRate: number;
  avgDeliveryTime: number;
  totalRevenue: number;
  totalWeight: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}
