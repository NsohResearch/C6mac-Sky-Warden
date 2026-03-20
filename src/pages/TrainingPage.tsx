import { useState } from "react";
import { BookOpen, GraduationCap, Award, Play, CheckCircle, XCircle, Clock, Star, Users, TrendingUp, BarChart3, Search, Filter, Plus, FileText, Video, Target, Trophy, Shield, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingCourse {
  id: string; title: string; category: string; level: "beginner" | "intermediate" | "advanced";
  duration: number; modules: number; completedModules: number; enrolled: number;
  rating: number; status: "not_started" | "in_progress" | "completed" | "expired";
  instructor: string; certificateAvailable: boolean;
}

const levelConfig = {
  beginner: { label: "Beginner", bg: "bg-green-50", text: "text-green-700" },
  intermediate: { label: "Intermediate", bg: "bg-blue-50", text: "text-blue-700" },
  advanced: { label: "Advanced", bg: "bg-purple-50", text: "text-purple-700" },
};

const statusConfig = {
  not_started: { label: "Not Started", bg: "bg-gray-100", text: "text-gray-700" },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700" },
  completed: { label: "Completed", bg: "bg-green-50", text: "text-green-700" },
  expired: { label: "Expired", bg: "bg-red-50", text: "text-red-700" },
};

const mockCourses: TrainingCourse[] = [
  { id: "CRS-001", title: "FAA Part 107 Exam Prep", category: "Certification", level: "beginner", duration: 480, modules: 12, completedModules: 12, enrolled: 342, rating: 4.8, status: "completed", instructor: "Capt. James Walker", certificateAvailable: true },
  { id: "CRS-002", title: "BVLOS Operations Safety", category: "Advanced Operations", level: "advanced", duration: 360, modules: 8, completedModules: 5, enrolled: 89, rating: 4.9, status: "in_progress", instructor: "Dr. Emily Torres", certificateAvailable: true },
  { id: "CRS-003", title: "Thermal Inspection Fundamentals", category: "Sensor Training", level: "intermediate", duration: 240, modules: 6, completedModules: 0, enrolled: 156, rating: 4.6, status: "not_started", instructor: "Michael Chen", certificateAvailable: false },
  { id: "CRS-004", title: "Emergency Procedures & CRM", category: "Safety", level: "intermediate", duration: 180, modules: 5, completedModules: 5, enrolled: 412, rating: 4.7, status: "completed", instructor: "Capt. James Walker", certificateAvailable: true },
  { id: "CRS-005", title: "Photogrammetry & 3D Mapping", category: "Data Processing", level: "intermediate", duration: 300, modules: 8, completedModules: 2, enrolled: 178, rating: 4.5, status: "in_progress", instructor: "Dr. Sarah Liu", certificateAvailable: true },
  { id: "CRS-006", title: "Drone Delivery Operations", category: "Advanced Operations", level: "advanced", duration: 420, modules: 10, completedModules: 0, enrolled: 45, rating: 4.4, status: "not_started", instructor: "Alex Thompson", certificateAvailable: true },
];

type TabId = "catalog" | "my_courses" | "certificates";

export default function TrainingPage() {
  const [tab, setTab] = useState<TabId>("catalog");
  const [search, setSearch] = useState("");

  const myCourses = mockCourses.filter(c => c.status !== "not_started");
  const certs = mockCourses.filter(c => c.status === "completed" && c.certificateAvailable);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training LMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Course catalog, enrollments, quizzes, certificates</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Available Courses", value: mockCourses.length, icon: BookOpen, color: "text-blue-600" },
          { label: "In Progress", value: mockCourses.filter(c => c.status === "in_progress").length, icon: Play, color: "text-amber-600" },
          { label: "Completed", value: mockCourses.filter(c => c.status === "completed").length, icon: Trophy, color: "text-green-600" },
          { label: "Certificates", value: certs.length, icon: Award, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{s.label}</span><s.icon className={cn("w-5 h-5", s.color)} /></div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {(["catalog", "my_courses", "certificates"] as TabId[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {t === "catalog" ? "Course Catalog" : t === "my_courses" ? "My Courses" : "Certificates"}
          </button>
        ))}
      </div>

      {(tab === "catalog" || tab === "my_courses") && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" className="w-full h-9 rounded-md bg-muted pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(tab === "catalog" ? mockCourses : myCourses).filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase())).map(c => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", levelConfig[c.level].bg, levelConfig[c.level].text)}>{levelConfig[c.level].label}</span>
                  <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-sm font-medium">{c.rating}</span></div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground">{c.category} · {c.instructor}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{Math.floor(c.duration / 60)}h {c.duration % 60}m · {c.modules} modules</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[c.status].bg, statusConfig[c.status].text)}>{statusConfig[c.status].label}</span>
                </div>
                {c.status === "in_progress" && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1"><span>{c.completedModules}/{c.modules}</span><span>{Math.round((c.completedModules / c.modules) * 100)}%</span></div>
                    <div className="h-1.5 bg-muted rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${(c.completedModules / c.modules) * 100}%` }} /></div>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  {c.status === "not_started" && <button className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">Enroll</button>}
                  {c.status === "in_progress" && <button className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">Continue</button>}
                  {c.status === "completed" && <button className="flex-1 px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors">Review</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "certificates" && (
        <div className="grid grid-cols-3 gap-4">
          {certs.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-5 text-center">
              <Award className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-foreground">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">Completed · {c.instructor}</p>
              <button className="mt-3 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 active:scale-[0.97] transition-all">Download Certificate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
