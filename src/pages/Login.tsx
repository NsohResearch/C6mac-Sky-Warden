import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Globe, Plane, Building2, Shield, Code2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { t, getBrowserLang, languages, type Lang } from "@/lib/i18n";
import CookieConsent from "@/components/CookieConsent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logoMark from "@/assets/logo-mark.png";

type Persona = "individual_pilot" | "enterprise_manager" | "agency_representative" | "developer";
type Tab = "signin" | "signup";

const personaIcons: Record<Persona, typeof Plane> = {
  individual_pilot: Plane,
  enterprise_manager: Building2,
  agency_representative: Shield,
  developer: Code2,
};

const personaKeys: Persona[] = ["individual_pilot", "enterprise_manager", "agency_representative", "developer"];
const LEGAL_ACCEPTANCE_KEY = "skw_legal_acceptance_v1";

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

export default function Login() {
  const [lang, setLang] = useState<Lang>(getBrowserLang);
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  // Sign-up extra fields
  const [displayName, setDisplayName] = useState("");
  const [persona, setPersona] = useState<Persona>("individual_pilot");
  const [region, setRegion] = useState("US");

  const { signIn, signUp, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const accepted = localStorage.getItem(LEGAL_ACCEPTANCE_KEY) === "accepted";
    setLegalAccepted(accepted);
    setLegalOpen(!accepted);
  }, []);

  useEffect(() => {
    if (loading || !user) return;

    navigate(profile?.onboarding_completed === false ? "/onboarding" : "/dashboard", { replace: true });
  }, [loading, navigate, profile?.onboarding_completed, user]);

  const handleLegalAcceptance = () => {
    localStorage.setItem(LEGAL_ACCEPTANCE_KEY, "accepted");
    setLegalAccepted(true);
    setLegalOpen(false);
  };

  const handleLegalDecline = () => {
    localStorage.removeItem(LEGAL_ACCEPTANCE_KEY);
    setLegalAccepted(false);
    setLegalOpen(false);
    navigate("/", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalAccepted) {
      setLegalOpen(true);
      toast.error(tab === "signin" ? "Please accept the Terms of Service" : "Please accept the Terms of Service to create an account");
      return;
    }

    setSubmitting(true);

    if (tab === "signin") {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) toast.error(error.message);
    } else {
      const { error } = await signUp(email, password, {
        display_name: displayName,
        persona,
        region,
      });
      setSubmitting(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t(lang, "checkEmail"));
        setTab("signin");
      }
    }
  };

  const handleGoogle = async () => {
    if (!legalAccepted) {
      setLegalOpen(true);
      toast.error("Please accept the Terms of Service");
      return;
    }

    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/login`,
    });
    if (error) toast.error(error.message);
  };

  const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-secondary/30 p-4 sm:p-6">
      <Dialog open={legalOpen}>
        <DialogContent className="max-w-xl border-border bg-card p-0 sm:rounded-2xl [&>button]:hidden">
          <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl leading-tight text-foreground">{t(lang, "legalTitle")}</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {t(lang, "legalIntro")}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <section className="rounded-xl border border-border bg-background p-4">
                <h2 className="text-sm font-semibold text-foreground">{t(lang, "legalTermsHeading")}</h2>
                <p className="mt-2">{t(lang, "legalTermsBody")}</p>
              </section>

              <section className="rounded-xl border border-border bg-background p-4">
                <h2 className="text-sm font-semibold text-foreground">{t(lang, "legalPrivacyHeading")}</h2>
                <p className="mt-2">{t(lang, "legalPrivacyBody")}</p>
              </section>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleLegalDecline}
                className="h-11 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
              >
                {t(lang, "legalDecline")}
              </button>
              <button
                type="button"
                onClick={handleLegalAcceptance}
                className="h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                {t(lang, "legalContinue")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      <div className={`w-full max-w-[420px] animate-reveal-up transition-all duration-300 ${legalAccepted ? "opacity-100" : "pointer-events-none opacity-0 scale-[0.98]"}`}>
        <div className="bg-card border border-border rounded-2xl shadow-xl shadow-primary/5 p-6 sm:p-8">
          {/* Language selector */}
          <div className="relative mb-4">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-muted/60 border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {languages.find((l) => l.code === lang)?.flag}
              <span className="hidden sm:inline">{languages.find((l) => l.code === lang)?.label}</span>
            </button>
            {langOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] z-50 max-h-60 overflow-y-auto">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors ${lang === l.code ? "text-accent font-semibold" : "text-foreground"}`}
                  >
                    <span>{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img src={logoMark} alt="SkyWarden" className="w-16 h-16 rounded-2xl shadow-md" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-center leading-tight mb-6">
            {t(lang, "welcome")}
          </h1>

          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-0.5 mb-6">
            {(["signin", "signup"] as Tab[]).map((v) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all duration-200 ${
                  tab === v
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(lang, v === "signin" ? "signIn" : "signUp")}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full h-11 rounded-lg border border-border bg-background text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-muted/50 hover:border-accent/30 transition-all active:scale-[0.98]"
          >
            <GoogleIcon />
            {t(lang, "continueGoogle")}
          </button>

          {/* Phone — coming soon */}
          <div className="relative mt-3">
            <button
              disabled
              className="w-full h-11 rounded-lg border border-border bg-background text-sm font-medium flex items-center justify-center gap-2.5 opacity-50 cursor-not-allowed"
            >
              <span className="text-base">📱</span>
              {t(lang, "continuePhone")}
            </button>
            <span className="absolute -top-2 right-3 text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full">
              {t(lang, "comingSoon")}
            </span>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                {t(lang, "orUseEmail")}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t(lang, "fullName")}</label>
                  <input
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t(lang, "fullNamePlaceholder")}
                    className="w-full h-10 rounded-lg bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t(lang, "role")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {personaKeys.map((p) => {
                      const Icon = personaIcons[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPersona(p)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all active:scale-[0.97] ${
                            persona === p
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border bg-background text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{t(lang, p)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">{t(lang, "country")}</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full h-10 rounded-lg bg-background border border-input px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                  >
                    {regions.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">{t(lang, "email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t(lang, "emailPlaceholder")}
                className="w-full h-10 rounded-lg bg-background border border-input px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">{t(lang, "password")}</label>
                {tab === "signin" && (
                  <button type="button" className="text-[10px] text-accent hover:underline">
                    {t(lang, "forgotPassword")}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={tab === "signup" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === "signup" ? t(lang, "passwordMin") : "••••••••"}
                  className="w-full h-10 rounded-lg bg-background border border-input px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 focus:border-accent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
              {t(lang, "legalAcceptedNote")}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm disabled:opacity-50"
            >
              {submitting
                ? t(lang, tab === "signin" ? "signingIn" : "signingUp")
                : t(lang, tab === "signin" ? "signInBtn" : "signUpBtn")}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-xs text-muted-foreground text-center mt-5">
          © {new Date().getFullYear()} SkyWarden. All rights reserved.
        </p>
      </div>

      <CookieConsent lang={lang} />
    </div>
  );
}
