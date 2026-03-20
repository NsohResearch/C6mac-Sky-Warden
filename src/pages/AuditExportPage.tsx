import { useState } from "react";
import { FileText, Download, Share2, Search, Filter, Plus, CheckCircle, Clock, AlertCircle, Package, Shield, ShieldCheck, Building2, Landmark, Calendar, Users, Plane, Eye, BarChart3, ClipboardList, Award, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type PackageStatus = "building" | "ready" | "shared" | "expired" | "archived";

const statusConfig: Record<PackageStatus, { label: string; bg: string; text: string }> = {
  building: { label: "Building", bg: "bg-blue-50", text: "text-blue-700" },
  ready: { label: "Ready", bg: "bg-green-50", text: "text-green-700" },
  shared: { label: "Shared", bg: "bg-purple-50", text: "text-purple-700" },
  expired: { label: "Expired", bg: "bg-red-50", text: "text-red-700" },
  archived: { label: "Archived", bg: "bg-gray-100", text: "text-gray-600" },
};

interface AuditPackage {
  id: string; name: string; type: string; status: PackageStatus;
  createdBy: string; createdAt: string; expiresAt: string;
  documentCount: number; totalSize: string; categories: string[];
}

const mockPackages: AuditPackage[] = [
  { id: "AUD-001", name: "Q1 2026 FAA Audit Package", type: "FAA Audit", status: "ready", createdBy: "Alex Martinez", createdAt: "2026-03-15", expiresAt: "2026-06-15", documentCount: 184, totalSize: "2.4 GB", categories: ["Flight Logs", "Pilot Certs", "Registrations", "Maintenance", "Safety Reports"] },
  { id: "AUD-002", name: "Insurance Annual Review 2026", type: "Insurance Audit", status: "shared", createdBy: "Sarah Kim", createdAt: "2026-02-01", expiresAt: "2026-08-01", documentCount: 56, totalSize: "840 MB", categories: ["Insurance COIs", "Claims", "Fleet Summary", "Safety Reports"] },
  { id: "AUD-003", name: "Client Compliance Package - SolarGrid", type: "Client Report", status: "building", createdBy: "Robert Chen", createdAt: "2026-03-19", expiresAt: "2026-09-19", documentCount: 12, totalSize: "320 MB", categories: ["Flight Logs", "Orthomosaics", "Quality Reports"] },
  { id: "AUD-004", name: "Annual Safety Review 2025", type: "Safety Audit", status: "archived", createdBy: "Aisha Patel", createdAt: "2025-12-31", expiresAt: "2026-06-30", documentCount: 92, totalSize: "1.8 GB", categories: ["Safety Reports", "Incidents", "Training Records", "Corrective Actions"] },
];

export default function AuditExportPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit & Export</h1>
          <p className="text-sm text-muted-foreground mt-1">Compliance packages, FAA audit bundles, export center</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Create Package
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Packages", value: mockPackages.length, icon: Package, color: "text-blue-600" },
          { label: "Ready", value: mockPackages.filter(p => p.status === "ready").length, icon: CheckCircle, color: "text-green-600" },
          { label: "Building", value: mockPackages.filter(p => p.status === "building").length, icon: Clock, color: "text-amber-600" },
          { label: "Shared", value: mockPackages.filter(p => p.status === "shared").length, icon: Share2, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockPackages.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[p.status].bg, statusConfig[p.status].text)}>{statusConfig[p.status].label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.id} · {p.type} · Created by {p.createdBy}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.status === "ready" && <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 active:scale-[0.97] transition-all"><Download className="w-3.5 h-3.5" /> Download</button>}
                {p.status === "ready" && <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors"><Share2 className="w-3.5 h-3.5" /> Share</button>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Documents</span><p className="font-medium">{p.documentCount}</p></div>
              <div><span className="text-muted-foreground">Size</span><p className="font-medium">{p.totalSize}</p></div>
              <div><span className="text-muted-foreground">Created</span><p className="font-medium">{p.createdAt}</p></div>
              <div><span className="text-muted-foreground">Expires</span><p className="font-medium">{p.expiresAt}</p></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.categories.map(c => <span key={c} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">{c}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
