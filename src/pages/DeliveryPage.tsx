import { useState } from "react";
import { Package, Truck, MapPin, Clock, CheckCircle, XCircle, AlertTriangle, Navigation, Battery, Phone, Search, Filter, Plus, Eye, Camera, DollarSign, TrendingUp, Target, Circle, Radio, Send, Map, Timer, Plane, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type DeliveryStatus = "pending" | "assigned" | "pickup" | "in_transit" | "delivered" | "failed" | "returned";

const statusConfig: Record<DeliveryStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-gray-100", text: "text-gray-700" },
  assigned: { label: "Assigned", bg: "bg-blue-50", text: "text-blue-700" },
  pickup: { label: "Pickup", bg: "bg-indigo-50", text: "text-indigo-700" },
  in_transit: { label: "In Transit", bg: "bg-amber-50", text: "text-amber-700" },
  delivered: { label: "Delivered", bg: "bg-green-50", text: "text-green-700" },
  failed: { label: "Failed", bg: "bg-red-50", text: "text-red-700" },
  returned: { label: "Returned", bg: "bg-orange-50", text: "text-orange-700" },
};

interface DeliveryOperation {
  id: string; orderId: string; status: DeliveryStatus; priority: "standard" | "express" | "emergency";
  droneName: string; pilotName: string;
  pickup: { name: string; address: string }; dropoff: { name: string; address: string };
  package: { description: string; weight: number; category: string; value: number };
  route: { distance: number; estimatedDuration: number; maxAltitude: number };
  scheduledTime: string;
}

const mockDeliveries: DeliveryOperation[] = [
  { id: "DEL-001", orderId: "ORD-2026-4481", status: "in_transit", priority: "express", droneName: "Wing X1 Delivery", pilotName: "Alex Martinez", pickup: { name: "Central Pharmacy", address: "200 Main St, Austin, TX" }, dropoff: { name: "Sarah Johnson", address: "1845 Oak Hill Dr, Austin, TX" }, package: { description: "Prescription medications", weight: 0.8, category: "Medical", value: 145 }, route: { distance: 12.4, estimatedDuration: 18, maxAltitude: 120 }, scheduledTime: "2026-03-20T09:45:00Z" },
  { id: "DEL-002", orderId: "ORD-2026-4482", status: "delivered", priority: "standard", droneName: "Matternet M2", pilotName: "Sarah Kim", pickup: { name: "Lab Corp Central", address: "500 Medical Dr, Austin, TX" }, dropoff: { name: "St. David's Hospital", address: "919 E 32nd St, Austin, TX" }, package: { description: "Lab specimens", weight: 1.2, category: "Medical", value: 0 }, route: { distance: 8.6, estimatedDuration: 12, maxAltitude: 100 }, scheduledTime: "2026-03-20T08:30:00Z" },
  { id: "DEL-003", orderId: "ORD-2026-4483", status: "assigned", priority: "emergency", droneName: "Zipline P2", pilotName: "Robert Chen", pickup: { name: "Blood Bank ATX", address: "300 Red Cross Blvd, Austin, TX" }, dropoff: { name: "Dell Seton Medical", address: "1500 Red River St, Austin, TX" }, package: { description: "Blood products (O-neg)", weight: 0.5, category: "Critical Medical", value: 800 }, route: { distance: 6.2, estimatedDuration: 8, maxAltitude: 150 }, scheduledTime: "2026-03-20T10:00:00Z" },
  { id: "DEL-004", orderId: "ORD-2026-4484", status: "pending", priority: "standard", droneName: "Unassigned", pilotName: "TBD", pickup: { name: "Amazon Hub ATX", address: "1200 Commerce Dr, Austin, TX" }, dropoff: { name: "Michael Torres", address: "4521 Riverside Dr, Austin, TX" }, package: { description: "Consumer electronics", weight: 2.1, category: "Retail", value: 249 }, route: { distance: 15.8, estimatedDuration: 22, maxAltitude: 120 }, scheduledTime: "2026-03-20T11:00:00Z" },
];

const priorityConfig = { standard: "text-gray-600", express: "text-amber-600", emergency: "text-red-600" };

export default function DeliveryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Drone Delivery</h1>
          <p className="text-sm text-muted-foreground mt-1">Operations, delivery zones, tracking, proof of delivery</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> New Delivery
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "In Transit", value: mockDeliveries.filter(d => d.status === "in_transit").length, icon: Truck, color: "text-blue-600" },
          { label: "Delivered Today", value: mockDeliveries.filter(d => d.status === "delivered").length, icon: CheckCircle, color: "text-green-600" },
          { label: "Pending", value: mockDeliveries.filter(d => d.status === "pending").length, icon: Clock, color: "text-amber-600" },
          { label: "Success Rate", value: "97.2%", icon: TrendingUp, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockDeliveries.map(d => (
          <div key={d.id} className={cn("bg-card border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer", d.priority === "emergency" ? "border-l-4 border-l-red-500 border-red-200" : "border-border")}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{d.orderId}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[d.status].bg, statusConfig[d.status].text)}>{statusConfig[d.status].label}</span>
                  <span className={cn("text-xs font-medium capitalize", priorityConfig[d.priority])}>{d.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{d.id} · {d.droneName} · {d.pilotName}</p>
              </div>
              <span className="text-sm font-medium">${d.package.value}</span>
            </div>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <div className="flex-1 bg-muted/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="font-medium">{d.pickup.name}</p>
                <p className="text-xs text-muted-foreground">{d.pickup.address}</p>
              </div>
              <Navigation className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 bg-muted/50 rounded p-2">
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="font-medium">{d.dropoff.name}</p>
                <p className="text-xs text-muted-foreground">{d.dropoff.address}</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div><span className="text-muted-foreground">Package</span><p className="font-medium">{d.package.description}</p></div>
              <div><span className="text-muted-foreground">Weight</span><p className="font-medium">{d.package.weight} kg</p></div>
              <div><span className="text-muted-foreground">Distance</span><p className="font-medium">{d.route.distance} km</p></div>
              <div><span className="text-muted-foreground">ETA</span><p className="font-medium">{d.route.estimatedDuration} min</p></div>
              <div><span className="text-muted-foreground">Category</span><p className="font-medium">{d.package.category}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
