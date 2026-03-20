import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, ShieldAlert, FileText, Plane, Clock, AlertTriangle, Radio, Cloud, CreditCard, Info } from "lucide-react";
import { useNotifications, type AppNotification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

const typeIconMap: Record<string, typeof Bell> = {
  cert_expiry: AlertTriangle,
  maintenance_due: Clock,
  safety_report: ShieldAlert,
  registration: FileText,
  mission: Plane,
  weather: Cloud,
  remote_id: Radio,
  billing: CreditCard,
  system: Info,
};

const typeBgMap: Record<string, string> = {
  cert_expiry: "bg-amber-500/10 text-amber-600",
  maintenance_due: "bg-orange-500/10 text-orange-600",
  safety_report: "bg-destructive/10 text-destructive",
  registration: "bg-blue-500/10 text-blue-600",
  mission: "bg-emerald-500/10 text-emerald-600",
  weather: "bg-sky-500/10 text-sky-600",
  remote_id: "bg-violet-500/10 text-violet-600",
  billing: "bg-rose-500/10 text-rose-600",
  system: "bg-muted text-muted-foreground",
};

function NotificationItem({
  notif,
  onRead,
}: {
  notif: AppNotification;
  onRead: (id: string) => void;
}) {
  const Icon = typeIconMap[notif.type] || Bell;
  const bgClass = typeBgMap[notif.type] || typeBgMap.system;

  return (
    <button
      onClick={() => !notif.read && onRead(notif.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:scale-[0.99] ${
        notif.read ? "opacity-60" : ""
      }`}
    >
      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notif.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
          {notif.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notif.read && (
        <div className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md hover:bg-muted transition-colors active:scale-[0.96]"
      >
        <Bell className="w-[18px] h-[18px] text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-popover border border-border rounded-xl shadow-xl z-50 flex flex-col animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors active:scale-[0.97]"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notif={n} onRead={markAsRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
