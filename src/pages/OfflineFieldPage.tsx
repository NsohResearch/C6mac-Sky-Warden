import { useState } from "react";
import { Wifi, WifiOff, RefreshCw, Clock, Upload, Download, AlertTriangle, Check, CheckCircle, XCircle, ClipboardCheck, ClipboardList, Shield, Battery, Radio, MapPin, Cloud, CloudOff, FileText, Wrench, Plane, Database, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const mockSync = {
  lastSync: "2026-03-20T14:32:00Z", status: "synced" as const, pendingChanges: 3, pendingUploads: 2,
  storageUsed: 284, storageLimit: 1024,
  conflicts: [
    { id: "cnf-001", entity: "Flight Log FL-2026-0312", local: "Updated duration to 42min (field)", server: "Updated billing code (office)", status: "pending" },
  ],
};

const mockChecklist = {
  preflight: [
    { id: "pf-1", label: "Visual inspection — airframe, props, motors", checked: true, critical: true },
    { id: "pf-2", label: "Battery charge ≥ 80% and health check", checked: true, critical: true },
    { id: "pf-3", label: "Firmware current — drone and controller", checked: true, critical: false },
    { id: "pf-4", label: "GPS lock acquired (min 8 satellites)", checked: false, critical: true },
    { id: "pf-5", label: "Weather check — wind < 25mph, no precipitation", checked: false, critical: true },
    { id: "pf-6", label: "Airspace authorization confirmed", checked: true, critical: true },
    { id: "pf-7", label: "Emergency procedures reviewed with crew", checked: false, critical: false },
    { id: "pf-8", label: "SD card formatted and inserted", checked: true, critical: false },
  ],
  postflight: [
    { id: "po-1", label: "Landing area secured", checked: false, critical: false },
    { id: "po-2", label: "Battery removed and inspected", checked: false, critical: true },
    { id: "po-3", label: "Flight log recorded", checked: false, critical: true },
    { id: "po-4", label: "Data offloaded from SD card", checked: false, critical: false },
    { id: "po-5", label: "Equipment stored properly", checked: false, critical: false },
  ],
};

type TabId = "sync" | "preflight" | "postflight";

export default function OfflineFieldPage() {
  const [tab, setTab] = useState<TabId>("sync");
  const [checklist, setChecklist] = useState(mockChecklist);

  const toggleCheck = (type: "preflight" | "postflight", id: string) => {
    setChecklist(prev => ({
      ...prev,
      [type]: prev[type].map(item => item.id === id ? { ...item, checked: !item.checked } : item),
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Offline & Field Mode</h1><p className="text-sm text-muted-foreground mt-1">Sync status, pre/post-flight checklists, field ops</p></div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium"><Wifi className="w-3.5 h-3.5" /> Online</span>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"><RefreshCw className="w-4 h-4" /> Sync Now</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Sync Status", value: "Synced", icon: CheckCircle, color: "text-green-600" },
          { label: "Pending Changes", value: mockSync.pendingChanges, icon: Upload, color: "text-amber-600" },
          { label: "Storage Used", value: `${mockSync.storageUsed} MB`, icon: Database, color: "text-blue-600" },
          { label: "Conflicts", value: mockSync.conflicts.length, icon: AlertTriangle, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["sync", "preflight", "postflight"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "sync" ? "Sync & Storage" : t === "preflight" ? "Pre-Flight Checklist" : "Post-Flight Checklist"}
          </button>
        ))}
      </div>

      {tab === "sync" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-3">Storage Usage</h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-3 bg-muted rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${(mockSync.storageUsed / mockSync.storageLimit) * 100}%` }} /></div>
              <span className="text-sm font-medium">{mockSync.storageUsed} / {mockSync.storageLimit} MB</span>
            </div>
            <p className="text-xs text-muted-foreground">Last sync: {new Date(mockSync.lastSync).toLocaleString()}</p>
          </div>
          {mockSync.conflicts.length > 0 && (
            <div className="bg-card border border-red-200 border-l-4 border-l-red-500 rounded-lg p-5">
              <h3 className="font-semibold mb-3 text-red-700">Sync Conflicts</h3>
              {mockSync.conflicts.map(c => (
                <div key={c.id} className="text-sm space-y-2">
                  <p className="font-medium">{c.entity}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded p-2"><p className="text-xs font-medium text-blue-700">Local Version</p><p className="text-xs mt-1">{c.local}</p></div>
                    <div className="bg-purple-50 rounded p-2"><p className="text-xs font-medium text-purple-700">Server Version</p><p className="text-xs mt-1">{c.server}</p></div>
                  </div>
                  <div className="flex gap-2"><button className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs">Keep Local</button><button className="px-3 py-1 border border-border rounded text-xs">Keep Server</button><button className="px-3 py-1 border border-border rounded text-xs">Merge</button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(tab === "preflight" || tab === "postflight") && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              {tab === "preflight" ? "Pre-Flight" : "Post-Flight"} Checklist
            </h3>
            <span className="text-sm text-muted-foreground">
              {checklist[tab].filter(i => i.checked).length}/{checklist[tab].length} completed
            </span>
          </div>
          <div className="space-y-2">
            {checklist[tab].map(item => (
              <button key={item.id} onClick={() => toggleCheck(tab, item.id)} className={cn("w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left", item.checked ? "bg-green-50/50 border-green-200" : "border-border hover:bg-muted")}>
                <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors", item.checked ? "bg-green-500 border-green-500" : "border-muted-foreground/30")}>
                  {item.checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn("text-sm flex-1", item.checked && "line-through text-muted-foreground")}>{item.label}</span>
                {item.critical && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">CRITICAL</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
