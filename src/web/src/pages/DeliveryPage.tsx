import { useState } from 'react';
import {
  Package, Truck, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, Navigation,
  Battery, Phone, Mail, Bell, Search, Filter, ChevronDown, ChevronUp, Plus,
  Eye, MessageSquare, Camera, Thermometer, Weight, Ruler, DollarSign, TrendingUp,
  Target, Circle, Radio, Send, Ban, Flag, Map, Timer, X, Plane, User,
  ArrowRight, Box, Shield, Zap, Activity, BarChart3,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { DeliveryOperation, DeliveryZone, DeliveryStats } from '../../../shared/types/delivery';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockDeliveries: DeliveryOperation[] = [
  {
    id: 'DEL-001', tenantId: 'tenant-001', orderId: 'ORD-2026-4481', status: 'in_transit', priority: 'express',
    droneId: 'DRN-010', droneName: 'Wing X1 Delivery', pilotId: 'PLT-001', pilotName: 'Alex Martinez',
    pickup: { name: 'Central Pharmacy', address: '200 Main St, Austin, TX 78701', lat: 30.2672, lng: -97.7431, contactPhone: '(512) 555-0100', pickupTime: '2026-03-20T09:15:00Z' },
    dropoff: { name: 'Sarah Johnson', address: '1845 Oak Hill Dr, Austin, TX 78749', lat: 30.2304, lng: -97.8560, contactPhone: '(512) 555-0201', requestedTime: '2026-03-20T09:45:00Z' },
    package: { description: 'Prescription medications (non-controlled)', weight: 0.8, dimensions: { l: 20, w: 15, h: 10 }, category: 'medical', temperature: 'ambient', value: 145 },
    route: { distance: 12.4, estimatedDuration: 18, waypoints: 3, maxAltitude: 120 },
    tracking: { currentPosition: { lat: 30.2510, lng: -97.7980, altitude: 100 }, eta: '2026-03-20T09:38:00Z', distanceRemaining: 5.2, batteryAtDelivery: 62 },
    recipientNotification: { sent: true, method: 'sms', sentAt: '2026-03-20T09:16:00Z' },
    cost: 8.50, revenue: 24.99, createdAt: '2026-03-20T08:45:00Z', notes: 'Ring doorbell on arrival', issues: [],
  },
  {
    id: 'DEL-002', tenantId: 'tenant-001', orderId: 'ORD-2026-4482', status: 'approaching', priority: 'urgent',
    droneId: 'DRN-011', droneName: 'Zipline P2', pilotId: 'PLT-002', pilotName: 'Sarah Chen',
    pickup: { name: 'St. David Medical Center', address: '919 E 32nd St, Austin, TX 78705', lat: 30.2955, lng: -97.7270, contactPhone: '(512) 555-0300', pickupTime: '2026-03-20T09:00:00Z' },
    dropoff: { name: 'Round Rock Medical Office', address: '300 University Blvd, Round Rock, TX 78665', lat: 30.5083, lng: -97.6789, contactPhone: '(512) 555-0401', requestedTime: '2026-03-20T09:30:00Z' },
    package: { description: 'Lab specimens — urgent pathology', weight: 1.2, dimensions: { l: 25, w: 20, h: 15 }, category: 'medical', temperature: 'cold', value: 0 },
    route: { distance: 28.5, estimatedDuration: 25, actualDuration: 22, waypoints: 5, maxAltitude: 150 },
    tracking: { currentPosition: { lat: 30.4920, lng: -97.6850, altitude: 80 }, eta: '2026-03-20T09:27:00Z', distanceRemaining: 1.8, batteryAtDelivery: 34 },
    recipientNotification: { sent: true, method: 'push', sentAt: '2026-03-20T09:01:00Z' },
    cost: 15.00, revenue: 49.99, createdAt: '2026-03-20T08:30:00Z', notes: 'Medical priority — maintain cold chain', issues: [],
  },
  {
    id: 'DEL-003', tenantId: 'tenant-001', orderId: 'ORD-2026-4483', status: 'preparing', priority: 'standard',
    droneId: 'DRN-012', droneName: 'Matternet M2', pilotId: 'PLT-003', pilotName: 'James Wu',
    pickup: { name: 'Amazon Fulfillment Center', address: '6000 Dallas Hwy, Pflugerville, TX 78660', lat: 30.4394, lng: -97.6200, contactPhone: '(512) 555-0500', pickupTime: '2026-03-20T10:00:00Z' },
    dropoff: { name: 'Mike Torres', address: '2200 S IH-35, Austin, TX 78704', lat: 30.2390, lng: -97.7550, contactPhone: '(512) 555-0601', requestedTime: '2026-03-20T10:45:00Z' },
    package: { description: 'Electronics — wireless earbuds', weight: 0.3, dimensions: { l: 15, w: 12, h: 8 }, category: 'fragile', value: 189 },
    route: { distance: 24.1, estimatedDuration: 22, waypoints: 4, maxAltitude: 120 },
    tracking: {},
    recipientNotification: { sent: false, method: 'email' },
    cost: 6.20, revenue: 14.99, createdAt: '2026-03-20T09:30:00Z', notes: '', issues: [],
  },
  {
    id: 'DEL-004', tenantId: 'tenant-001', orderId: 'ORD-2026-4484', status: 'loaded', priority: 'express',
    droneId: 'DRN-013', droneName: 'Wing X1 Delivery #2', pilotId: 'PLT-001', pilotName: 'Alex Martinez',
    pickup: { name: 'Torchy\'s Tacos — S Congress', address: '1822 S Congress Ave, Austin, TX 78704', lat: 30.2460, lng: -97.7519, contactPhone: '(512) 555-0700', pickupTime: '2026-03-20T11:30:00Z' },
    dropoff: { name: 'Lisa Park', address: '3401 Speedway, Austin, TX 78705', lat: 30.2925, lng: -97.7365, contactPhone: '(512) 555-0801', requestedTime: '2026-03-20T12:00:00Z' },
    package: { description: 'Food order — 2x breakfast tacos, queso', weight: 1.5, dimensions: { l: 30, w: 25, h: 12 }, category: 'food', temperature: 'ambient', value: 28 },
    route: { distance: 6.8, estimatedDuration: 12, waypoints: 2, maxAltitude: 100 },
    tracking: {},
    recipientNotification: { sent: true, method: 'sms', sentAt: '2026-03-20T11:25:00Z' },
    cost: 4.80, revenue: 12.99, createdAt: '2026-03-20T11:00:00Z', notes: 'Extra napkins requested', issues: [],
  },
  {
    id: 'DEL-005', tenantId: 'tenant-001', orderId: 'ORD-2026-4485', status: 'delivering', priority: 'medical',
    droneId: 'DRN-014', droneName: 'Zipline P2 #2', pilotId: 'PLT-002', pilotName: 'Sarah Chen',
    pickup: { name: 'Blood Bank of Texas', address: '4300 N Lamar Blvd, Austin, TX 78756', lat: 30.3128, lng: -97.7417, contactPhone: '(512) 555-0900', pickupTime: '2026-03-20T08:00:00Z' },
    dropoff: { name: 'Dell Seton Medical Center', address: '1500 Red River St, Austin, TX 78701', lat: 30.2755, lng: -97.7340, contactPhone: '(512) 555-1001', requestedTime: '2026-03-20T08:20:00Z' },
    package: { description: 'Blood products — Type O Neg, 2 units', weight: 1.0, dimensions: { l: 20, w: 18, h: 15 }, category: 'medical', temperature: 'cold', value: 0 },
    route: { distance: 5.2, estimatedDuration: 10, actualDuration: 9, waypoints: 1, maxAltitude: 80 },
    tracking: { currentPosition: { lat: 30.2760, lng: -97.7342, altitude: 15 }, eta: '2026-03-20T08:19:00Z', distanceRemaining: 0.05, batteryAtDelivery: 78 },
    recipientNotification: { sent: true, method: 'push', sentAt: '2026-03-20T08:01:00Z' },
    cost: 12.00, revenue: 0, createdAt: '2026-03-20T07:30:00Z', notes: 'CRITICAL: Blood products — maintain 1-6C chain', issues: [],
  },
  {
    id: 'DEL-006', tenantId: 'tenant-001', orderId: 'ORD-2026-4486', status: 'completed', priority: 'standard',
    droneId: 'DRN-010', droneName: 'Wing X1 Delivery', pilotId: 'PLT-003', pilotName: 'James Wu',
    pickup: { name: 'CVS Pharmacy — Lamar', address: '3909 N Lamar Blvd, Austin, TX 78756', lat: 30.3081, lng: -97.7427, contactPhone: '(512) 555-1100', pickupTime: '2026-03-20T07:00:00Z' },
    dropoff: { name: 'Robert Chen', address: '5800 Burnet Rd, Austin, TX 78756', lat: 30.3380, lng: -97.7320, contactPhone: '(512) 555-1201', requestedTime: '2026-03-20T07:30:00Z', actualTime: '2026-03-20T07:26:00Z' },
    package: { description: 'OTC medications and vitamins', weight: 0.6, dimensions: { l: 18, w: 14, h: 10 }, category: 'general', value: 42 },
    route: { distance: 4.1, estimatedDuration: 8, actualDuration: 7, waypoints: 1, maxAltitude: 100 },
    tracking: {},
    recipientNotification: { sent: true, method: 'sms', sentAt: '2026-03-20T07:01:00Z' },
    proofOfDelivery: { type: 'photo', capturedAt: '2026-03-20T07:26:00Z', verified: true },
    cost: 3.80, revenue: 9.99, createdAt: '2026-03-20T06:30:00Z', completedAt: '2026-03-20T07:26:00Z', notes: '', issues: [],
  },
  {
    id: 'DEL-007', tenantId: 'tenant-001', orderId: 'ORD-2026-4487', status: 'completed', priority: 'express',
    droneId: 'DRN-011', droneName: 'Zipline P2', pilotId: 'PLT-001', pilotName: 'Alex Martinez',
    pickup: { name: 'Whole Foods — Domain', address: '11920 Domain Dr, Austin, TX 78758', lat: 30.4021, lng: -97.7254, contactPhone: '(512) 555-1300', pickupTime: '2026-03-20T08:30:00Z' },
    dropoff: { name: 'Emily Davis', address: '1600 Wickersham Ln, Austin, TX 78741', lat: 30.2360, lng: -97.7180, contactPhone: '(512) 555-1401', requestedTime: '2026-03-20T09:15:00Z', actualTime: '2026-03-20T09:08:00Z' },
    package: { description: 'Grocery order — fresh produce, dairy', weight: 3.2, dimensions: { l: 35, w: 30, h: 20 }, category: 'food', temperature: 'cold', value: 67 },
    route: { distance: 21.3, estimatedDuration: 20, actualDuration: 18, waypoints: 4, maxAltitude: 120 },
    tracking: {},
    recipientNotification: { sent: true, method: 'email', sentAt: '2026-03-20T08:31:00Z' },
    proofOfDelivery: { type: 'code', capturedAt: '2026-03-20T09:08:00Z', verified: true },
    cost: 9.50, revenue: 19.99, createdAt: '2026-03-20T08:00:00Z', completedAt: '2026-03-20T09:08:00Z', notes: '', issues: [],
  },
  {
    id: 'DEL-008', tenantId: 'tenant-001', orderId: 'ORD-2026-4488', status: 'failed', priority: 'standard',
    droneId: 'DRN-012', droneName: 'Matternet M2', pilotId: 'PLT-002', pilotName: 'Sarah Chen',
    pickup: { name: 'FedEx Office — Congress', address: '827 Congress Ave, Austin, TX 78701', lat: 30.2690, lng: -97.7429, contactPhone: '(512) 555-1500', pickupTime: '2026-03-20T06:45:00Z' },
    dropoff: { name: 'David Kim', address: '9500 N Capital of TX Hwy, Austin, TX 78759', lat: 30.3870, lng: -97.7450, contactPhone: '(512) 555-1601', requestedTime: '2026-03-20T07:30:00Z' },
    package: { description: 'Legal documents — signature required', weight: 0.4, dimensions: { l: 30, w: 22, h: 3 }, category: 'general', value: 0 },
    route: { distance: 15.8, estimatedDuration: 16, waypoints: 3, maxAltitude: 120 },
    tracking: {},
    recipientNotification: { sent: true, method: 'sms', sentAt: '2026-03-20T06:46:00Z' },
    cost: 5.20, revenue: 0, createdAt: '2026-03-20T06:15:00Z', notes: 'Recipient not available — returned to sender',
    issues: [{ type: 'recipient_unavailable', description: 'No one available at delivery location after 3 attempts', timestamp: '2026-03-20T07:35:00Z', resolved: false }],
  },
  {
    id: 'DEL-009', tenantId: 'tenant-001', orderId: 'ORD-2026-4489', status: 'pending', priority: 'standard',
    droneId: 'DRN-013', droneName: 'Wing X1 Delivery #2', pilotId: 'PLT-003', pilotName: 'James Wu',
    pickup: { name: 'Best Buy — Lakeline', address: '11066 Pecan Park Blvd, Cedar Park, TX 78613', lat: 30.4750, lng: -97.8140, contactPhone: '(512) 555-1700', pickupTime: '2026-03-20T13:00:00Z' },
    dropoff: { name: 'Tom Wilson', address: '2525 W Anderson Ln, Austin, TX 78757', lat: 30.3540, lng: -97.7380, contactPhone: '(512) 555-1801', requestedTime: '2026-03-20T13:45:00Z' },
    package: { description: 'Tablet computer — iPad Air', weight: 0.7, dimensions: { l: 28, w: 22, h: 5 }, category: 'fragile', value: 599 },
    route: { distance: 16.2, estimatedDuration: 15, waypoints: 3, maxAltitude: 120 },
    tracking: {},
    recipientNotification: { sent: false, method: 'push' },
    cost: 5.80, revenue: 17.99, createdAt: '2026-03-20T12:00:00Z', notes: 'Signature required', issues: [],
  },
  {
    id: 'DEL-010', tenantId: 'tenant-001', orderId: 'ORD-2026-4490', status: 'completed', priority: 'medical',
    droneId: 'DRN-014', droneName: 'Zipline P2 #2', pilotId: 'PLT-001', pilotName: 'Alex Martinez',
    pickup: { name: 'Austin Regional Clinic', address: '2222 Park Bend Dr, Austin, TX 78758', lat: 30.3920, lng: -97.7100, contactPhone: '(512) 555-1900', pickupTime: '2026-03-20T06:00:00Z' },
    dropoff: { name: 'Seton NW Hospital', address: '11113 Research Blvd, Austin, TX 78759', lat: 30.4000, lng: -97.7530, contactPhone: '(512) 555-2001', requestedTime: '2026-03-20T06:15:00Z', actualTime: '2026-03-20T06:12:00Z' },
    package: { description: 'Organ transport container — kidney biopsy', weight: 2.5, dimensions: { l: 30, w: 25, h: 20 }, category: 'medical', temperature: 'cold', value: 0 },
    route: { distance: 5.8, estimatedDuration: 10, actualDuration: 8, waypoints: 1, maxAltitude: 80 },
    tracking: {},
    recipientNotification: { sent: true, method: 'push', sentAt: '2026-03-20T06:01:00Z' },
    proofOfDelivery: { type: 'signature', capturedAt: '2026-03-20T06:12:00Z', verified: true },
    cost: 18.00, revenue: 0, createdAt: '2026-03-20T05:30:00Z', completedAt: '2026-03-20T06:12:00Z', notes: 'CRITICAL: Organ specimen — time-sensitive', issues: [],
  },
  {
    id: 'DEL-011', tenantId: 'tenant-001', orderId: 'ORD-2026-4491', status: 'returned', priority: 'standard',
    droneId: 'DRN-010', droneName: 'Wing X1 Delivery', pilotId: 'PLT-002', pilotName: 'Sarah Chen',
    pickup: { name: 'Target — Mueller', address: '1201 Barbara Jordan Blvd, Austin, TX 78723', lat: 30.2980, lng: -97.7050, contactPhone: '(512) 555-2100', pickupTime: '2026-03-20T10:30:00Z' },
    dropoff: { name: 'Anna Lee', address: '7300 Hart Ln, Austin, TX 78731', lat: 30.3540, lng: -97.7650, contactPhone: '(512) 555-2201', requestedTime: '2026-03-20T11:15:00Z' },
    package: { description: 'Baby supplies — diapers, formula', weight: 2.8, dimensions: { l: 35, w: 30, h: 25 }, category: 'general', value: 54 },
    route: { distance: 10.5, estimatedDuration: 14, actualDuration: 13, waypoints: 2, maxAltitude: 120 },
    tracking: {},
    recipientNotification: { sent: true, method: 'sms', sentAt: '2026-03-20T10:31:00Z' },
    cost: 5.10, revenue: 0, createdAt: '2026-03-20T10:00:00Z', completedAt: '2026-03-20T11:20:00Z', notes: 'Weather hold during transit — returned to sender',
    issues: [{ type: 'weather', description: 'High winds exceeded safe operating limits — automated return', timestamp: '2026-03-20T10:55:00Z', resolved: true }],
  },
  {
    id: 'DEL-012', tenantId: 'tenant-001', orderId: 'ORD-2026-4492', status: 'completed', priority: 'express',
    droneId: 'DRN-011', droneName: 'Zipline P2', pilotId: 'PLT-003', pilotName: 'James Wu',
    pickup: { name: 'Walgreens — Riverside', address: '2110 E Riverside Dr, Austin, TX 78741', lat: 30.2310, lng: -97.7260, contactPhone: '(512) 555-2300', pickupTime: '2026-03-20T08:00:00Z' },
    dropoff: { name: 'Carlos Reyes', address: '4500 E Oltorf St, Austin, TX 78741', lat: 30.2310, lng: -97.7080, contactPhone: '(512) 555-2401', requestedTime: '2026-03-20T08:20:00Z', actualTime: '2026-03-20T08:15:00Z' },
    package: { description: 'First aid kit and bandages', weight: 0.5, dimensions: { l: 22, w: 18, h: 8 }, category: 'medical', value: 35 },
    route: { distance: 2.4, estimatedDuration: 6, actualDuration: 5, waypoints: 0, maxAltitude: 80 },
    tracking: {},
    recipientNotification: { sent: true, method: 'sms', sentAt: '2026-03-20T08:01:00Z' },
    proofOfDelivery: { type: 'photo', capturedAt: '2026-03-20T08:15:00Z', verified: true },
    cost: 2.80, revenue: 11.99, createdAt: '2026-03-20T07:30:00Z', completedAt: '2026-03-20T08:15:00Z', notes: '', issues: [],
  },
];

const mockZones: DeliveryZone[] = [
  { id: 'ZN-001', name: 'Downtown Austin Core', type: 'service_area', center: { lat: 30.2672, lng: -97.7431 }, radius: 8, maxWeight: 5, operatingHours: { start: '06:00', end: '22:00' }, status: 'active', deliveriesToday: 18, avgDeliveryTime: 14 },
  { id: 'ZN-002', name: 'Medical District Corridor', type: 'medical_corridor', center: { lat: 30.2755, lng: -97.7340 }, radius: 5, maxWeight: 3, operatingHours: { start: '00:00', end: '23:59' }, status: 'active', deliveriesToday: 6, avgDeliveryTime: 9 },
  { id: 'ZN-003', name: 'North Austin — Domain', type: 'service_area', center: { lat: 30.4021, lng: -97.7254 }, radius: 10, maxWeight: 5, operatingHours: { start: '07:00', end: '21:00' }, status: 'active', deliveriesToday: 12, avgDeliveryTime: 18 },
  { id: 'ZN-004', name: 'ABIA Airport Restricted', type: 'restricted', center: { lat: 30.1975, lng: -97.6664 }, radius: 6, maxWeight: 0, operatingHours: { start: '00:00', end: '00:00' }, status: 'inactive', deliveriesToday: 0, avgDeliveryTime: 0 },
  { id: 'ZN-005', name: 'South Austin Priority', type: 'priority', center: { lat: 30.2304, lng: -97.7560 }, radius: 7, maxWeight: 4, operatingHours: { start: '06:00', end: '20:00' }, status: 'weather_hold', deliveriesToday: 5, avgDeliveryTime: 16 },
];

const mockStats: DeliveryStats = {
  totalDeliveries: 156, activeDeliveries: 5, completedToday: 24, failedToday: 2,
  onTimeRate: 94.2, avgDeliveryTime: 14, totalRevenue: 1842.50, totalWeight: 48.6,
  byPriority: { standard: 68, express: 52, urgent: 18, medical: 18 },
  byCategory: { general: 45, food: 38, medical: 42, fragile: 22, hazmat: 9 },
};

const statusPipeline = ['pending', 'preparing', 'loaded', 'in_transit', 'approaching', 'delivering', 'completed'] as const;

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  pending: { color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
  preparing: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: <Box className="w-3.5 h-3.5" /> },
  loaded: { color: 'text-indigo-400', bg: 'bg-indigo-500/20', icon: <Package className="w-3.5 h-3.5" /> },
  in_transit: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: <Navigation className="w-3.5 h-3.5" /> },
  approaching: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: <Target className="w-3.5 h-3.5" /> },
  delivering: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: <Truck className="w-3.5 h-3.5" /> },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  returned: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: <ArrowRight className="w-3.5 h-3.5 rotate-180" /> },
  failed: { color: 'text-red-400', bg: 'bg-red-500/20', icon: <XCircle className="w-3.5 h-3.5" /> },
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  standard: { color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
  express: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  urgent: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  medical: { color: 'text-red-400', bg: 'bg-red-500/20' },
};

const categoryColors: Record<string, string> = {
  general: 'bg-zinc-500/20 text-zinc-400', food: 'bg-orange-500/20 text-orange-400',
  medical: 'bg-red-500/20 text-red-400', fragile: 'bg-amber-500/20 text-amber-400', hazmat: 'bg-purple-500/20 text-purple-400',
};

const tempColors: Record<string, string> = {
  ambient: 'text-zinc-400', cold: 'text-blue-400', frozen: 'text-cyan-400',
};

const zoneTypeConfig: Record<string, { color: string; bg: string }> = {
  service_area: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  restricted: { color: 'text-red-400', bg: 'bg-red-500/20' },
  priority: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  medical_corridor: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
};

const zoneStatusConfig: Record<string, { color: string; bg: string }> = {
  active: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  inactive: { color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
  weather_hold: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

// ─── Component ──────────────────────────────────────────────────────────────────

export function DeliveryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const activeDeliveries = mockDeliveries.filter(d => ['pending', 'preparing', 'loaded', 'in_transit', 'approaching', 'delivering'].includes(d.status));

  const filteredDeliveries = mockDeliveries.filter(d => {
    if (search && !d.orderId.toLowerCase().includes(search.toLowerCase()) && !d.package.description.toLowerCase().includes(search.toLowerCase()) && !d.dropoff.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && d.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && d.package.category !== categoryFilter) return false;
    return true;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Drone Delivery Operations</h1>
              <p className="text-sm text-zinc-400">Manage package deliveries, zones, and real-time tracking</p>
            </div>
          </div>
          <button onClick={() => setShowNewForm(!showNewForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
            <Plus className="w-4 h-4" /> New Delivery
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Total Deliveries', value: mockStats.totalDeliveries, icon: <Package className="w-3.5 h-3.5" /> },
            { label: 'Active', value: mockStats.activeDeliveries, icon: <Radio className="w-3.5 h-3.5" />, color: 'text-cyan-400' },
            { label: 'Completed Today', value: mockStats.completedToday, icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
            { label: 'Failed Today', value: mockStats.failedToday, icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-400' },
            { label: 'On-Time Rate', value: `${mockStats.onTimeRate}%`, icon: <Timer className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
            { label: 'Avg Time', value: `${mockStats.avgDeliveryTime}min`, icon: <Clock className="w-3.5 h-3.5" /> },
            { label: 'Revenue Today', value: `$${mockStats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
            { label: 'Total Weight', value: `${mockStats.totalWeight}kg`, icon: <Weight className="w-3.5 h-3.5" /> },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-1">{s.icon} {s.label}</div>
              <div className={clsx('text-lg font-bold', s.color || 'text-zinc-100')}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* New Delivery Form */}
      {showNewForm && (
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-blue-400" /> New Delivery Order</h3>
              <button onClick={() => setShowNewForm(false)} className="p-1 text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Order Details</h4>
                <div className="space-y-2">
                  <input placeholder="Order ID" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none text-zinc-300">
                    <option>Standard Priority</option><option>Express</option><option>Urgent</option><option>Medical</option>
                  </select>
                  <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none text-zinc-300">
                    <option>Select Drone</option><option>Wing X1 Delivery</option><option>Zipline P2</option><option>Matternet M2</option>
                  </select>
                  <input type="datetime-local" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 text-zinc-300" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Pickup / Dropoff</h4>
                <div className="space-y-2">
                  <input placeholder="Pickup location name" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <input placeholder="Pickup address" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <input placeholder="Dropoff recipient name" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <input placeholder="Dropoff address" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Package Details</h4>
                <div className="space-y-2">
                  <input placeholder="Description" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Weight (kg)" type="number" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    <input placeholder="Value ($)" type="number" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input placeholder="L (cm)" type="number" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    <input placeholder="W (cm)" type="number" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    <input placeholder="H (cm)" type="number" className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none text-zinc-300">
                      <option>General</option><option>Food</option><option>Medical</option><option>Fragile</option><option>Hazmat</option>
                    </select>
                    <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none text-zinc-300">
                      <option>Ambient</option><option>Cold</option><option>Frozen</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-800">
              <button onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">Create Delivery</button>
            </div>
          </div>
        </div>
      )}

      {/* Active Deliveries */}
      <div className="px-6 py-6 border-b border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Radio className="w-5 h-5 text-cyan-400 animate-pulse" /> Active Deliveries ({activeDeliveries.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeDeliveries.map(delivery => {
            const currentStepIdx = statusPipeline.indexOf(delivery.status as typeof statusPipeline[number]);
            return (
              <div key={delivery.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all">
                {/* Status Pipeline */}
                <div className="flex items-center gap-0.5 mb-3">
                  {statusPipeline.map((step, idx) => (
                    <div key={step} className={clsx('flex-1 h-1.5 rounded-full', idx <= currentStepIdx ? (idx === currentStepIdx ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500') : 'bg-zinc-800')} title={step.replace('_', ' ')} />
                  ))}
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={clsx('flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded', statusConfig[delivery.status].bg, statusConfig[delivery.status].color)}>
                      {statusConfig[delivery.status].icon} {delivery.status.replace('_', ' ')}
                    </span>
                    <span className={clsx('px-2 py-0.5 text-xs font-medium rounded', priorityConfig[delivery.priority].bg, priorityConfig[delivery.priority].color)}>
                      {delivery.priority}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">{delivery.orderId}</span>
                </div>

                {/* Package */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx('px-1.5 py-0.5 text-[10px] font-medium rounded', categoryColors[delivery.package.category])}>{delivery.package.category}</span>
                    {delivery.package.temperature && delivery.package.temperature !== 'ambient' && (
                      <span className={clsx('flex items-center gap-0.5 text-[10px]', tempColors[delivery.package.temperature])}>
                        <Thermometer className="w-3 h-3" />{delivery.package.temperature}
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-500">{delivery.package.weight}kg</span>
                  </div>
                  <p className="text-sm text-zinc-200">{delivery.package.description}</p>
                </div>

                {/* Route */}
                <div className="flex items-start gap-2 mb-3 text-xs">
                  <div className="flex flex-col items-center mt-0.5">
                    <Circle className="w-3 h-3 text-emerald-400" />
                    <div className="w-px h-6 bg-zinc-700" />
                    <MapPin className="w-3 h-3 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-300 truncate">{delivery.pickup.name}</div>
                    <div className="text-zinc-600 text-[10px] truncate">{delivery.pickup.address}</div>
                    <div className="my-1" />
                    <div className="text-zinc-300 truncate">{delivery.dropoff.name}</div>
                    <div className="text-zinc-600 text-[10px] truncate">{delivery.dropoff.address}</div>
                  </div>
                </div>

                {/* Tracking */}
                {delivery.tracking.eta && (
                  <div className="bg-zinc-800/50 rounded-lg p-2.5 mb-3 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-zinc-500">ETA:</span> <span className="text-zinc-200 font-medium">{formatTime(delivery.tracking.eta)}</span></div>
                    {delivery.tracking.distanceRemaining !== undefined && <div><span className="text-zinc-500">Remaining:</span> <span className="text-zinc-200 font-medium">{delivery.tracking.distanceRemaining}km</span></div>}
                    {delivery.tracking.batteryAtDelivery !== undefined && <div className="flex items-center gap-1"><Battery className={clsx('w-3 h-3', delivery.tracking.batteryAtDelivery > 50 ? 'text-emerald-400' : delivery.tracking.batteryAtDelivery > 20 ? 'text-amber-400' : 'text-red-400')} /><span className="text-zinc-200">{delivery.tracking.batteryAtDelivery}%</span></div>}
                    {delivery.tracking.currentPosition && <div><span className="text-zinc-500">Alt:</span> <span className="text-zinc-200">{delivery.tracking.currentPosition.altitude}ft</span></div>}
                  </div>
                )}

                {/* Drone/Pilot */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-3">
                  <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{delivery.droneName}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{delivery.pilotName}</span>
                </div>

                {/* Map Placeholder */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg h-24 flex items-center justify-center mb-3">
                  <Map className="w-5 h-5 text-zinc-600" />
                  <span className="text-[10px] text-zinc-600 ml-1.5">Live Map</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"><Eye className="w-3 h-3" /> Track</button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"><Bell className="w-3 h-3" /> Notify</button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"><Ban className="w-3 h-3" /> Cancel</button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"><Flag className="w-3 h-3" /> Issue</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Zones */}
      <div className="px-6 py-6 border-b border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-amber-400" /> Delivery Zones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {mockZones.map(zone => (
            <div key={zone.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold truncate">{zone.name}</h3>
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className={clsx('px-2 py-0.5 text-[10px] font-medium rounded', zoneTypeConfig[zone.type].bg, zoneTypeConfig[zone.type].color)}>{zone.type.replace('_', ' ')}</span>
                <span className={clsx('px-2 py-0.5 text-[10px] font-medium rounded', zoneStatusConfig[zone.status].bg, zoneStatusConfig[zone.status].color)}>{zone.status.replace('_', ' ')}</span>
              </div>
              <div className="space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between"><span>Radius</span><span className="text-zinc-200">{zone.radius}km</span></div>
                <div className="flex justify-between"><span>Max Weight</span><span className="text-zinc-200">{zone.maxWeight}kg</span></div>
                <div className="flex justify-between"><span>Hours</span><span className="text-zinc-200">{zone.operatingHours.start} - {zone.operatingHours.end}</span></div>
                <div className="flex justify-between"><span>Today</span><span className="text-zinc-200">{zone.deliveriesToday} deliveries</span></div>
                {zone.avgDeliveryTime > 0 && <div className="flex justify-between"><span>Avg Time</span><span className="text-zinc-200">{zone.avgDeliveryTime}min</span></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Deliveries Table */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Deliveries</h2>
          <span className="text-sm text-zinc-400">{filteredDeliveries.length} deliveries</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input type="text" placeholder="Search by order, package, or recipient..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-zinc-400" /></button>}
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none">
            <option value="all">All Statuses</option>
            {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none">
            <option value="all">All Priorities</option>
            <option value="standard">Standard</option><option value="express">Express</option>
            <option value="urgent">Urgent</option><option value="medical">Medical</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none">
            <option value="all">All Categories</option>
            <option value="general">General</option><option value="food">Food</option>
            <option value="medical">Medical</option><option value="fragile">Fragile</option><option value="hazmat">Hazmat</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Package</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Drone</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map(delivery => (
                <>
                  <tr key={delivery.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer transition-colors" onClick={() => setExpandedDelivery(expandedDelivery === delivery.id ? null : delivery.id)}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-zinc-300">{delivery.orderId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded w-fit', statusConfig[delivery.status].bg, statusConfig[delivery.status].color)}>
                        {statusConfig[delivery.status].icon} {delivery.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-0.5 text-[11px] font-medium rounded', priorityConfig[delivery.priority].bg, priorityConfig[delivery.priority].color)}>
                        {delivery.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-zinc-300 truncate max-w-[180px]">{delivery.package.description}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={clsx('px-1.5 py-0.5 text-[9px] font-medium rounded', categoryColors[delivery.package.category])}>{delivery.package.category}</span>
                        <span className="text-[10px] text-zinc-500">{delivery.package.weight}kg</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      <div className="truncate max-w-[120px]">{delivery.pickup.name}</div>
                      <div className="flex items-center gap-0.5 text-zinc-600"><ArrowRight className="w-3 h-3" /></div>
                      <div className="truncate max-w-[120px]">{delivery.dropoff.name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{delivery.droneName}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {delivery.tracking.eta ? (
                        <span>ETA {formatTime(delivery.tracking.eta)}</span>
                      ) : delivery.completedAt ? (
                        <span className="text-emerald-400">{delivery.route.actualDuration || delivery.route.estimatedDuration}min</span>
                      ) : (
                        <span>~{delivery.route.estimatedDuration}min</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {delivery.revenue > 0 ? (
                        <div>
                          <div className="text-xs text-emerald-400 font-medium">${delivery.revenue.toFixed(2)}</div>
                          <div className="text-[10px] text-zinc-500">cost: ${delivery.cost.toFixed(2)}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                        {expandedDelivery === delivery.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedDelivery === delivery.id && (
                    <tr key={`${delivery.id}-expanded`}>
                      <td colSpan={9} className="px-4 py-4 bg-zinc-800/20 border-b border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Route Details */}
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Route Details</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between"><span className="text-zinc-500">Distance</span><span className="text-zinc-300">{delivery.route.distance}km</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500">Est. Duration</span><span className="text-zinc-300">{delivery.route.estimatedDuration}min</span></div>
                              {delivery.route.actualDuration && <div className="flex justify-between"><span className="text-zinc-500">Actual Duration</span><span className="text-emerald-400">{delivery.route.actualDuration}min</span></div>}
                              <div className="flex justify-between"><span className="text-zinc-500">Waypoints</span><span className="text-zinc-300">{delivery.route.waypoints}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500">Max Altitude</span><span className="text-zinc-300">{delivery.route.maxAltitude}ft</span></div>
                            </div>
                          </div>

                          {/* Recipient Notification */}
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Notification</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between"><span className="text-zinc-500">Method</span><span className="text-zinc-300">{delivery.recipientNotification.method}</span></div>
                              <div className="flex justify-between"><span className="text-zinc-500">Sent</span><span className={delivery.recipientNotification.sent ? 'text-emerald-400' : 'text-zinc-500'}>{delivery.recipientNotification.sent ? 'Yes' : 'No'}</span></div>
                              {delivery.recipientNotification.sentAt && <div className="flex justify-between"><span className="text-zinc-500">Sent At</span><span className="text-zinc-300">{formatTime(delivery.recipientNotification.sentAt)}</span></div>}
                            </div>
                          </div>

                          {/* Proof of Delivery */}
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Proof of Delivery</h4>
                            {delivery.proofOfDelivery ? (
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-zinc-500">Type</span><span className="text-zinc-300">{delivery.proofOfDelivery.type}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-500">Captured</span><span className="text-zinc-300">{formatTime(delivery.proofOfDelivery.capturedAt)}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-500">Verified</span><span className={delivery.proofOfDelivery.verified ? 'text-emerald-400' : 'text-amber-400'}>{delivery.proofOfDelivery.verified ? 'Yes' : 'Pending'}</span></div>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-500">Not captured yet</p>
                            )}
                          </div>

                          {/* Issues */}
                          <div>
                            <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Issues ({delivery.issues.length})</h4>
                            {delivery.issues.length > 0 ? (
                              <div className="space-y-2">
                                {delivery.issues.map((issue, i) => (
                                  <div key={i} className="bg-zinc-800 rounded-lg p-2">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <AlertTriangle className={clsx('w-3 h-3', issue.resolved ? 'text-emerald-400' : 'text-red-400')} />
                                      <span className="text-xs font-medium text-zinc-300">{issue.type.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400">{issue.description}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-500">No issues reported</p>
                            )}
                            {delivery.notes && (
                              <div className="mt-2 pt-2 border-t border-zinc-700">
                                <span className="text-[10px] text-zinc-500 uppercase">Notes:</span>
                                <p className="text-xs text-zinc-400">{delivery.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filteredDeliveries.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No deliveries match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
