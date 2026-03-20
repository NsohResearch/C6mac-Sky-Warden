import { useState } from "react";
import { Cpu, Image, Layers, Map, Thermometer, Leaf, Ruler, Eye, Search, Download, Upload, Play, Pause, Filter, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Loader, BarChart2, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type JobStatus = "queued" | "processing" | "completed" | "failed" | "paused";

const statusConfig: Record<JobStatus, { label: string; bg: string; text: string }> = {
  queued: { label: "Queued", bg: "bg-gray-100", text: "text-gray-700" },
  processing: { label: "Processing", bg: "bg-blue-50", text: "text-blue-700" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700" },
  failed: { label: "Failed", bg: "bg-red-50", text: "text-red-700" },
  paused: { label: "Paused", bg: "bg-amber-50", text: "text-amber-700" },
};

interface ProcessingJob {
  id: string; name: string; type: string; status: JobStatus; progress: number;
  missionName: string; imageCount: number; inputSize: string; gsd: number;
  engine: string; startedAt?: string; completedAt?: string; duration?: string; outputSize?: string;
}

const mockJobs: ProcessingJob[] = [
  { id: "PJ-001", name: "Highway Bridge Inspection Ortho", type: "Orthomosaic", status: "completed", progress: 100, missionName: "Highway 101 Bridge Survey", imageCount: 486, inputSize: "12.4 GB", gsd: 1.2, engine: "Pix4D", startedAt: "2026-03-18T09:00:00Z", completedAt: "2026-03-18T11:42:00Z", duration: "2h 42m", outputSize: "4.2 GB" },
  { id: "PJ-002", name: "Solar Farm 3D Model", type: "3D Model", status: "processing", progress: 67, missionName: "Solar Farm Thermal Q1", imageCount: 1240, inputSize: "28.6 GB", gsd: 0.8, engine: "DroneDeploy", startedAt: "2026-03-20T08:15:00Z" },
  { id: "PJ-003", name: "Vineyard NDVI Analysis", type: "NDVI", status: "queued", progress: 0, missionName: "Vineyard Health Check", imageCount: 320, inputSize: "6.8 GB", gsd: 2.0, engine: "Pix4Dfields" },
  { id: "PJ-004", name: "Construction Site Elevation Map", type: "DSM/DTM", status: "completed", progress: 100, missionName: "Downtown Tower Progress", imageCount: 890, inputSize: "18.2 GB", gsd: 1.5, engine: "Agisoft", startedAt: "2026-03-17T14:00:00Z", completedAt: "2026-03-17T19:20:00Z", duration: "5h 20m", outputSize: "8.1 GB" },
  { id: "PJ-005", name: "Thermal Anomaly Detection", type: "Thermal Analysis", status: "failed", progress: 34, missionName: "Rooftop Inspection Batch", imageCount: 156, inputSize: "3.2 GB", gsd: 3.0, engine: "Custom Pipeline" },
];

type TabId = "jobs" | "templates";

export default function DataProcessingPage() {
  const [tab, setTab] = useState<TabId>("jobs");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Processing</h1>
          <p className="text-sm text-muted-foreground mt-1">Orthomosaic, 3D models, NDVI, job queue</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Processing", value: mockJobs.filter(j => j.status === "processing").length, icon: Cpu, color: "text-blue-600" },
          { label: "Queued", value: mockJobs.filter(j => j.status === "queued").length, icon: Clock, color: "text-gray-600" },
          { label: "Completed", value: mockJobs.filter(j => j.status === "completed").length, icon: CheckCircle, color: "text-green-600" },
          { label: "Failed", value: mockJobs.filter(j => j.status === "failed").length, icon: XCircle, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {mockJobs.map(j => (
          <div key={j.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{j.name}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[j.status].bg, statusConfig[j.status].text)}>{statusConfig[j.status].label}</span>
                  <span className="px-2 py-0.5 bg-muted rounded text-xs">{j.type}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{j.id} · Mission: {j.missionName} · Engine: {j.engine}</p>
              </div>
              <div className="flex items-center gap-2">
                {j.status === "processing" && <button className="p-1.5 rounded hover:bg-muted"><Pause className="w-4 h-4" /></button>}
                {j.status === "failed" && <button className="p-1.5 rounded hover:bg-muted"><RefreshCw className="w-4 h-4" /></button>}
                {j.status === "completed" && <button className="p-1.5 rounded hover:bg-muted"><Download className="w-4 h-4" /></button>}
              </div>
            </div>
            {j.status === "processing" && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Progress</span><span className="font-medium">{j.progress}%</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${j.progress}%` }} /></div>
              </div>
            )}
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div><span className="text-muted-foreground">Images</span><p className="font-medium">{j.imageCount}</p></div>
              <div><span className="text-muted-foreground">Input</span><p className="font-medium">{j.inputSize}</p></div>
              <div><span className="text-muted-foreground">GSD</span><p className="font-medium">{j.gsd} cm/px</p></div>
              <div><span className="text-muted-foreground">Duration</span><p className="font-medium">{j.duration ?? "—"}</p></div>
              <div><span className="text-muted-foreground">Output</span><p className="font-medium">{j.outputSize ?? "—"}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
