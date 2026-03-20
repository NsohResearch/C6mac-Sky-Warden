import { useState, useMemo } from "react";
import { Bell, BellRing, BellOff, Mail, Shield, AlertTriangle, AlertCircle, CheckCircle, Clock, Calendar, Filter, Search, Settings, Archive, Eye, Check, Trash2, Volume2, VolumeX, Moon, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string; title: string; message: string; category: string; priority: "critical" | "high" | "medium" | "low";
  read: boolean; pinned: boolean; timestamp: string; source: string;
}

const priorityConfig = {
  critical: { label: "Critical", border: "border-l-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  high: { label: "High", border: "border-l-orange-500", bg: "bg-orange-50", dot: "bg-orange-500" },
  medium: { label: "Medium", border: "border-l-yellow-500", bg: "bg-yellow-50", dot: "bg-yellow-500" },
  low: { label: "Low", border: "border-l-blue-400", bg: "bg-blue-50", dot: "bg-blue-400" },
};

const mockNotifications: Notification[] = [
  { id: "N-001", title: "Geofence Breach Detected", message: "Mavic 3 Enterprise #1 breached Downtown Construction Site Alpha boundary at 09:15 UTC. Drone auto-returned to home point.", category: "safety", priority: "critical", read: false, pinned: true, timestamp: "2026-03-20T09:15:00Z", source: "Geofence System" },
  { id: "N-002", title: "Battery Health Warning", message: "Battery BAT-003 (EVO II Pro #1) health dropped below 50%. Recommend replacement before next mission.", category: "maintenance", priority: "high", read: false, pinned: false, timestamp: "2026-03-20T08:30:00Z", source: "Battery Monitor" },
  { id: "N-003", title: "LAANC Authorization Approved", message: "Authorization LAANC-2026-0342 approved for Class D airspace near KAEX. Valid 2026-03-21 08:00–12:00 UTC.", category: "compliance", priority: "medium", read: true, pinned: false, timestamp: "2026-03-19T16:45:00Z", source: "LAANC System" },
  { id: "N-004", title: "Insurance Policy Expiring", message: "DroneInsurance.com policy DI-2025-33210 expires on 2026-04-01. Renew to maintain coverage.", category: "billing", priority: "high", read: false, pinned: false, timestamp: "2026-03-19T12:00:00Z", source: "Insurance Module" },
  { id: "N-005", title: "Firmware Update Available", message: "DJI Matrice 350 RTK firmware v04.02.0100 is available. Includes stability improvements and new waypoint features.", category: "system", priority: "low", read: true, pinned: false, timestamp: "2026-03-18T10:00:00Z", source: "Fleet Manager" },
  { id: "N-006", title: "New Safety Report Filed", message: "Incident INC-005 'Propeller strike on structure' reported by Alex Martinez. Review required.", category: "safety", priority: "high", read: false, pinned: false, timestamp: "2026-03-20T10:30:00Z", source: "Safety System" },
  { id: "N-007", title: "Mission Completed Successfully", message: "Mission MSN-089 'Solar Farm Thermal Q1' completed. All deliverables processing.", category: "operations", priority: "low", read: true, pinned: false, timestamp: "2026-03-19T14:20:00Z", source: "Mission Manager" },
];

type FilterType = "all" | "unread" | "critical" | "pinned";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (filter === "unread" && n.read) return false;
      if (filter === "critical" && n.priority !== "critical") return false;
      if (filter === "pinned" && !n.pinned) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [notifications, filter, search]);

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Notifications</h1><p className="text-sm text-muted-foreground mt-1">Multi-channel alerts, preferences, quiet hours</p></div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <button onClick={markAllRead} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors">Mark all read</button>}
          <button className="p-2 rounded-md hover:bg-muted transition-colors"><Settings className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Unread", value: unreadCount, icon: BellRing, color: "text-blue-600" },
          { label: "Critical", value: notifications.filter(n => n.priority === "critical").length, icon: AlertTriangle, color: "text-red-600" },
          { label: "Today", value: notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length, icon: Calendar, color: "text-amber-600" },
          { label: "Total", value: notifications.length, icon: Bell, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
        <div className="flex gap-1">
          {(["all", "unread", "critical", "pinned"] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize", filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)} className={cn("bg-card border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md border-l-4", priorityConfig[n.priority].border, !n.read && priorityConfig[n.priority].bg)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!n.read && <span className={cn("w-2 h-2 rounded-full shrink-0", priorityConfig[n.priority].dot)} />}
                  <h3 className={cn("font-semibold text-sm", n.read && "text-muted-foreground")}>{n.title}</h3>
                  {n.pinned && <span className="text-xs text-amber-600">📌</span>}
                </div>
                <p className={cn("text-sm", n.read ? "text-muted-foreground" : "text-foreground")}>{n.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{n.source}</span>
                  <span>{new Date(n.timestamp).toLocaleString()}</span>
                  <span className="capitalize">{n.category}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12"><BellOff className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" /><p className="text-muted-foreground">No notifications matching filter</p></div>
        )}
      </div>
    </div>
  );
}
