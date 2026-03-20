import { useState } from "react";
import { FileText, File, FolderOpen, Upload, Download, Search, Filter, Shield, ShieldCheck, Calendar, Clock, AlertTriangle, CheckCircle, User, Plane, Tag, Lock, Eye, Grid, List, Plus, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string; name: string; fileName: string; fileSize: number; category: string;
  status: "valid" | "expiring" | "expired" | "pending_review";
  uploadedBy: string; uploadedAt: string; expiryDate?: string; verified: boolean;
  associatedEntity: string; tags: string[];
}

const statusConfig = {
  valid: { label: "Valid", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
  expiring: { label: "Expiring", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  expired: { label: "Expired", bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle },
  pending_review: { label: "Pending Review", bg: "bg-blue-50", text: "text-blue-700", icon: Eye },
};

const mockDocuments: Document[] = [
  { id: "DOC-001", name: "Part 107 Certificate - A. Martinez", fileName: "part107_martinez.pdf", fileSize: 245000, category: "Pilot Certificate", status: "valid", uploadedBy: "Alex Martinez", uploadedAt: "2025-08-15", expiryDate: "2027-08-15", verified: true, associatedEntity: "Alex Martinez", tags: ["part107", "remote-pilot"] },
  { id: "DOC-002", name: "FAA Registration - Mavic 3", fileName: "faa_reg_mavic3.pdf", fileSize: 180000, category: "Drone Registration", status: "valid", uploadedBy: "System", uploadedAt: "2026-01-10", expiryDate: "2029-01-10", verified: true, associatedEntity: "Mavic 3 Enterprise #1", tags: ["faa", "registration"] },
  { id: "DOC-003", name: "Insurance COI - SkyWatch", fileName: "coi_skywatch_2026.pdf", fileSize: 320000, category: "Insurance", status: "expiring", uploadedBy: "Sarah Kim", uploadedAt: "2026-01-15", expiryDate: "2026-04-15", verified: true, associatedEntity: "Fleet", tags: ["insurance", "coi"] },
  { id: "DOC-004", name: "Maintenance Log - Matrice 350", fileName: "maint_matrice350.xlsx", fileSize: 1240000, category: "Maintenance", status: "valid", uploadedBy: "Mike Chen", uploadedAt: "2026-03-12", verified: false, associatedEntity: "Matrice 350 RTK", tags: ["maintenance"] },
  { id: "DOC-005", name: "TRUST Completion - R. Chen", fileName: "trust_chen.pdf", fileSize: 95000, category: "Pilot Certificate", status: "valid", uploadedBy: "Robert Chen", uploadedAt: "2025-06-20", verified: true, associatedEntity: "Robert Chen", tags: ["trust", "recreational"] },
  { id: "DOC-006", name: "Airspace Authorization - JFK", fileName: "laanc_jfk_auth.pdf", fileSize: 210000, category: "Authorization", status: "expired", uploadedBy: "System", uploadedAt: "2026-02-01", expiryDate: "2026-03-01", verified: true, associatedEntity: "Mission MSN-042", tags: ["laanc", "authorization"] },
];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentVaultPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = mockDocuments.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.includes(search.toLowerCase())));

  const stats = {
    total: mockDocuments.length,
    valid: mockDocuments.filter(d => d.status === "valid").length,
    expiring: mockDocuments.filter(d => d.status === "expiring").length,
    expired: mockDocuments.filter(d => d.status === "expired").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">Centralized storage, expiry alerts, compliance tracking</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: stats.total, icon: FolderOpen, color: "text-blue-600" },
          { label: "Valid", value: stats.valid, icon: CheckCircle, color: "text-green-600" },
          { label: "Expiring Soon", value: stats.expiring, icon: Clock, color: "text-amber-600" },
          { label: "Expired", value: stats.expired, icon: AlertTriangle, color: "text-red-600" },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents, tags…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
        <div className="flex border border-border rounded-md overflow-hidden">
          <button onClick={() => setViewMode("list")} className={cn("p-2 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("grid")} className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><Grid className="w-4 h-4" /></button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Document</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expiry</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Verified</th>
            </tr></thead>
            <tbody>
              {filtered.map(d => {
                const sc = statusConfig[d.status];
                return (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.fileName}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.category}</td>
                    <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", sc.bg, sc.text)}>{sc.label}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{d.expiryDate ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{formatSize(d.fileSize)}</td>
                    <td className="px-4 py-3">{d.verified ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <span className="text-xs text-muted-foreground">Pending</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(d => {
            const sc = statusConfig[d.status];
            return (
              <div key={d.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", sc.bg, sc.text)}>{sc.label}</span>
                  {d.verified && <ShieldCheck className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">{d.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{d.category} · {formatSize(d.fileSize)}</p>
                <div className="flex gap-1 mt-2">{d.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{t}</span>)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
