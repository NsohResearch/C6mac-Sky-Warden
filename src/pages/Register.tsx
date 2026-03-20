import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Plane, Building2, Shield, Code2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import logoMark from "@/assets/logo-mark.png";

type Persona = "individual_pilot" | "enterprise_manager" | "agency_representative" | "developer";

const personas: { value: Persona; label: string; description: string; icon: typeof Plane }[] = [
  { value: "individual_pilot", label: "Individual Pilot", description: "I fly drones for personal or commercial use", icon: Plane },
  { value: "enterprise_manager", label: "Enterprise Manager", description: "I manage a fleet and pilot team", icon: Building2 },
  { value: "agency_representative", label: "Agency / Authority", description: "I represent a local or airspace agency", icon: Shield },
  { value: "developer", label: "Developer", description: "I build airspace or drone applications", icon: Code2 },
];

const regions = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "NG", label: "Nigeria" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
  { value: "GH", label: "Ghana" },
  { value: "RW", label: "Rwanda" },
  { value: "TZ", label: "Tanzania" },
  { value: "ET", label: "Ethiopia" },
  { value: "SN", label: "Senegal" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "UG", label: "Uganda" },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [form, setForm] = useState({ displayName: "", email: "", password: "", phone: "", region: "US", orgName: "" });
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persona) return;
    setSubmitting(true);

    const metadata: Record<string, string> = {
      display_name: form.displayName,
      persona,
      region: form.region,
    };
    if (form.orgName) metadata.organization_name = form.orgName;

    const { error } = await signUp(form.email, form.password, metadata);
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to verify your account");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-reveal-up">
        <div className="flex items-center gap-3 mb-8">
          <img src={logoMark} alt="C6mac Sky Warden" className="w-10 h-10" />
          <span className="text-xl font-semibold tracking-tight text-foreground">Sky Warden</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-6">
          {step === 1 ? "How will you use the platform?" : "Complete your registration"}
        </p>

        {step === 1 ? (
          <div className="space-y-3">
            {personas.map((p) => (
              <button
                key={p.value}
                onClick={() => { setPersona(p.value); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all duration-150 active:scale-[0.98] ${
                  persona === p.value
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/40 hover:bg-accent/5"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <p.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">{p.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                </div>
              </button>
            ))}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline">Sign in</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input
                required
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                required type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                required type="password" minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Country / Region</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
              >
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {(persona === "enterprise_manager" || persona === "agency_representative") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {persona === "enterprise_manager" ? "Organization Name" : "Agency Name"}
                </label>
                <input
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  className="w-full h-10 rounded-md bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-10 px-4 rounded-md border border-border text-sm font-medium text-foreground flex items-center gap-2 hover:bg-muted transition-colors active:scale-[0.97]"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-10 rounded-md bg-accent text-accent-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create Account"}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
