import { useState } from "react";
import { Shield, ShieldCheck, FileText, DollarSign, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Download, Plus, Filter, Search, Plane, User, Umbrella } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsurancePolicy {
  id: string; provider: string; policyNumber: string; type: string; status: "active" | "expiring" | "expired" | "pending";
  coverageLimit: number; premium: number; deductible: number; effectiveDate: string; expiryDate: string; coveredDrones: number;
}

interface InsuranceClaim {
  id: string; policyId: string; type: string; status: "filed" | "under_review" | "approved" | "denied" | "paid";
  amount: number; filedDate: string; description: string;
}

const statusConfig = {
  active: { label: "Active", bg: "bg-green-50", text: "text-green-700" },
  expiring: { label: "Expiring Soon", bg: "bg-amber-50", text: "text-amber-700" },
  expired: { label: "Expired", bg: "bg-red-50", text: "text-red-700" },
  pending: { label: "Pending", bg: "bg-blue-50", text: "text-blue-700" },
};

const claimStatusConfig = {
  filed: { label: "Filed", bg: "bg-blue-50", text: "text-blue-700" },
  under_review: { label: "Under Review", bg: "bg-amber-50", text: "text-amber-700" },
  approved: { label: "Approved", bg: "bg-green-50", text: "text-green-700" },
  denied: { label: "Denied", bg: "bg-red-50", text: "text-red-700" },
  paid: { label: "Paid", bg: "bg-emerald-50", text: "text-emerald-700" },
};

const mockPolicies: InsurancePolicy[] = [
  { id: "POL-001", provider: "SkyWatch Insurance", policyNumber: "SW-2026-44821", type: "Comprehensive", status: "active", coverageLimit: 1000000, premium: 4800, deductible: 2500, effectiveDate: "2026-01-15", expiryDate: "2027-01-15", coveredDrones: 4 },
  { id: "POL-002", provider: "Verifly", policyNumber: "VF-2026-88102", type: "On-Demand", status: "active", coverageLimit: 500000, premium: 1200, deductible: 1000, effectiveDate: "2026-03-01", expiryDate: "2026-06-01", coveredDrones: 2 },
  { id: "POL-003", provider: "DroneInsurance.com", policyNumber: "DI-2025-33210", type: "Hull Only", status: "expiring", coverageLimit: 250000, premium: 2100, deductible: 5000, effectiveDate: "2025-04-01", expiryDate: "2026-04-01", coveredDrones: 3 },
];

const mockClaims: InsuranceClaim[] = [
  { id: "CLM-001", policyId: "POL-001", type: "Property Damage", status: "under_review", amount: 12500, filedDate: "2026-03-05", description: "Mavic 3 collision with tree during high-wind survey" },
  { id: "CLM-002", policyId: "POL-001", type: "Hull Damage", status: "paid", amount: 8200, filedDate: "2026-01-20", description: "Matrice 350 hard landing — gimbal and landing gear damage" },
  { id: "CLM-003", policyId: "POL-003", type: "Third Party", status: "denied", amount: 45000, filedDate: "2025-11-10", description: "Window damage claim from adjacent property" },
];

type TabId = "policies" | "claims" | "certificates";

export default function InsurancePage() {
  const [tab, setTab] = useState<TabId>("policies");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insurance</h1>
          <p className="text-sm text-muted-foreground mt-1">Policies, claims, COI generator, quote comparison</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Add Policy
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Policies", value: mockPolicies.filter(p => p.status === "active").length, icon: ShieldCheck, color: "text-green-600" },
          { label: "Total Coverage", value: "$1.75M", icon: Shield, color: "text-blue-600" },
          { label: "Open Claims", value: mockClaims.filter(c => ["filed", "under_review"].includes(c.status)).length, icon: FileText, color: "text-amber-600" },
          { label: "Annual Premium", value: `$${mockPolicies.reduce((s, p) => s + p.premium, 0).toLocaleString()}`, icon: DollarSign, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["policies", "claims", "certificates"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      {tab === "policies" && (
        <div className="space-y-3">
          {mockPolicies.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{p.provider}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{p.policyNumber}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[p.status].bg, statusConfig[p.status].text)}>{statusConfig[p.status].label}</span>
              </div>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div><span className="text-muted-foreground">Type</span><p className="font-medium">{p.type}</p></div>
                <div><span className="text-muted-foreground">Coverage</span><p className="font-medium">${p.coverageLimit.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Premium</span><p className="font-medium">${p.premium.toLocaleString()}/yr</p></div>
                <div><span className="text-muted-foreground">Deductible</span><p className="font-medium">${p.deductible.toLocaleString()}</p></div>
                <div><span className="text-muted-foreground">Drones</span><p className="font-medium">{p.coveredDrones} covered</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Effective: {p.effectiveDate} → {p.expiryDate}</span>
                <div className="flex gap-2">
                  <button className="px-2.5 py-1 bg-muted rounded text-xs hover:bg-muted/80 transition-colors">Generate COI</button>
                  <button className="px-2.5 py-1 bg-muted rounded text-xs hover:bg-muted/80 transition-colors">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "claims" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Filed</th>
            </tr></thead>
            <tbody>
              {mockClaims.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{c.description}</td>
                  <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", claimStatusConfig[c.status].bg, claimStatusConfig[c.status].text)}>{claimStatusConfig[c.status].label}</span></td>
                  <td className="px-4 py-3 text-right font-mono">${c.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.filedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "certificates" && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="font-semibold text-foreground">Certificate of Insurance Generator</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">Generate COIs for clients, property owners, or regulatory authorities from your active policies.</p>
          <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">Generate COI</button>
        </div>
      )}
    </div>
  );
}
