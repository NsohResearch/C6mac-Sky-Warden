import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { t, getBrowserLang, languages, type Lang } from "@/lib/i18n";
import {
  GLOBAL_REGULATORY_AUTHORITIES,
  findCountryAuthority,
  getRegions,
  getCountriesByRegion,
  REGION_LABELS,
} from "@/lib/regulatory-authorities";
import type { CountryAuthority } from "@/lib/types/regulatory";
import {
  ArrowRight, Check, ChevronRight, Plane, Shield, MapPin, Radio,
  Globe, Loader2, ExternalLink, Building2, Phone,
} from "lucide-react";

const STEPS = [
  { id: "welcome", title: "Welcome", icon: Plane },
  { id: "drone", title: "Register Drone", icon: Shield },
  { id: "pilot", title: "Pilot Profile", icon: MapPin },
  { id: "complete", title: "Ready to Fly", icon: Radio },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function Onboarding() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>("welcome");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>(getBrowserLang());

  // Geolocation state
  const [geoDetecting, setGeoDetecting] = useState(false);
  const [geoDetected, setGeoDetected] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("US");

  // Drone form state
  const [drone, setDrone] = useState({
    nickname: "", manufacturer: "", model: "", serial_number: "",
    category: "small", weight_grams: 0,
  });

  // Pilot form state
  const [pilot, setPilot] = useState({
    license_number: "", insurance_provider: "", insurance_policy: "",
  });

  const countryObj: CountryAuthority = findCountryAuthority(selectedCountryCode) ?? GLOBAL_REGULATORY_AUTHORITIES[0];
  const currentIdx = STEPS.findIndex((s) => s.id === step);

  // IP-based geolocation on mount
  useEffect(() => {
    const detectCountry = async () => {
      setGeoDetecting(true);
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const match = findCountryAuthority(data.country_code);
          if (match) {
            setSelectedCountryCode(match.countryCode);
            setGeoDetected(true);
          }
        }
      } catch {
        // Silently fail — user can select manually
      } finally {
        setGeoDetecting(false);
      }
    };
    detectCountry();
  }, []);

  // Map the new country system to region_code enum for DB inserts
  const dbRegionCode = (() => {
    const code = selectedCountryCode;
    // Map to existing region_code enum values
    const mapping: Record<string, string> = {
      US: "US", CA: "CA", NG: "NG", KE: "KE", ZA: "ZA",
      GH: "GH", RW: "RW", TZ: "TZ", ET: "ET", SN: "SN",
      CI: "CI", UG: "UG",
    };
    return mapping[code] ?? "US";
  })();

  const handleDroneSubmit = async () => {
    if (!drone.manufacturer || !drone.model || !drone.serial_number) {
      toast({ title: "Missing fields", description: "Please fill in all required drone details.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("drones").insert({
        tenant_id: profile!.tenant_id,
        region: dbRegionCode as any,
        nickname: drone.nickname || null,
        manufacturer: drone.manufacturer,
        model: drone.model,
        serial_number: drone.serial_number,
        category: drone.category,
        weight_grams: drone.weight_grams || null,
      });
      if (error) throw error;

      const { data: droneData } = await supabase.from("drones")
        .select("id").eq("serial_number", drone.serial_number).single();
      if (droneData) {
        await supabase.from("drone_registrations").insert({
          tenant_id: profile!.tenant_id,
          drone_id: droneData.id,
          owner_id: user!.id,
          owner_name: profile!.display_name,
          owner_email: profile!.email,
          manufacturer: drone.manufacturer,
          model: drone.model,
          serial_number: drone.serial_number,
          category: drone.category,
          region: dbRegionCode as any,
          regulatory_authority: countryObj.authority.acronym,
          currency: countryObj.locale.currency,
          registration_type: "standard",
          status: "pending_review",
        });
      }
      toast({ title: "Drone registered", description: `${drone.manufacturer} ${drone.model} has been registered.` });
      setStep("pilot");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePilotSubmit = async () => {
    setLoading(true);
    try {
      await supabase.from("pilot_profiles").insert({
        user_id: user!.id,
        tenant_id: profile!.tenant_id,
        region: dbRegionCode as any,
        national_license_number: pilot.license_number || null,
        insurance_provider: pilot.insurance_provider || null,
        insurance_policy_number: pilot.insurance_policy || null,
      });
      await supabase.from("user_profiles").update({ onboarding_completed: true }).eq("id", user!.id);
      setStep("complete");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => navigate("/dashboard");

  const regions = getRegions();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Language selector */}
        <div className="flex justify-end mb-4">
          <Select value={lang} onValueChange={(v) => setLang(v)}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <Globe className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l.code} value={l.code} className="text-xs">
                  {l.flag} {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < currentIdx ? "bg-success text-success-foreground" :
                i === currentIdx ? "bg-accent text-accent-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < currentIdx ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step: Welcome */}
        {step === "welcome" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Plane className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">{t(lang, "welcome")}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Register your drone and set up your pilot profile to comply with {countryObj.authority.acronym} regulations.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Country selector with geolocation */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  {t(lang, "country")}
                </Label>
                {geoDetecting && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Detecting your location…
                  </div>
                )}
                {geoDetected && !geoDetecting && (
                  <p className="text-xs text-accent flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Auto-detected: {countryObj.flagEmoji} {countryObj.countryName}
                  </p>
                )}
                <Select value={selectedCountryCode} onValueChange={(v) => { setSelectedCountryCode(v); setGeoDetected(false); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {regions.map((region) => (
                      <div key={region}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                          {REGION_LABELS[region] ?? region}
                        </div>
                        {getCountriesByRegion(region).map((c) => (
                          <SelectItem key={c.countryCode} value={c.countryCode}>
                            {c.flagEmoji} {c.countryName} ({c.authority.acronym})
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Regulatory Authority Card */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Regulatory Authority
                  </p>
                  <Badge variant="secondary" className="text-[10px]">{countryObj.countryCode}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Authority</p>
                    <p className="font-medium text-foreground">{countryObj.authority.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Acronym</p>
                    <p className="font-medium text-foreground">{countryObj.authority.acronym}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Regulation</p>
                    <p className="font-medium text-foreground">{countryObj.regulations.primaryRegulation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pilot Certificate</p>
                    <p className="font-medium text-foreground">{countryObj.regulations.pilotCertName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max Altitude</p>
                    <p className="font-medium text-foreground">{countryObj.regulations.maxAltitudeFt} ft AGL</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remote ID</p>
                    <p className="font-medium text-foreground capitalize">{countryObj.regulations.remoteIdRequired.replace("_", " ")}</p>
                  </div>
                </div>
                {countryObj.authority.website && (
                  <a href={countryObj.authority.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    <ExternalLink className="w-3 h-3" /> Visit {countryObj.authority.acronym} website
                  </a>
                )}
              </div>

              {/* Emergency info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Emergency: {countryObj.emergencyNumber}</span>
                {countryObj.aviationEmergency && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Aviation: {countryObj.aviationEmergency}</span>
                )}
              </div>

              {/* What we'll do */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What we'll do</p>
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> Register your drone with {countryObj.authority.acronym}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Set up your pilot profile</p>
                  <p className="flex items-center gap-2"><Radio className="h-4 w-4 text-accent" /> Enable compliant flight operations</p>
                </div>
              </div>

              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setStep("drone")}>
                Let's Get Started <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Register Drone */}
        {step === "drone" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" /> Register Your Drone
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Required by {countryObj.authority.name} ({countryObj.authority.acronym})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Manufacturer *</Label>
                  <Input placeholder="e.g., DJI" value={drone.manufacturer} onChange={(e) => setDrone((d) => ({ ...d, manufacturer: e.target.value }))} />
                </div>
                <div>
                  <Label>Model *</Label>
                  <Input placeholder="e.g., Mavic 3" value={drone.model} onChange={(e) => setDrone((d) => ({ ...d, model: e.target.value }))} />
                </div>
                <div>
                  <Label>Serial Number *</Label>
                  <Input placeholder="e.g., 1ZNBH1234" value={drone.serial_number} onChange={(e) => setDrone((d) => ({ ...d, serial_number: e.target.value }))} />
                </div>
                <div>
                  <Label>Nickname</Label>
                  <Input placeholder="e.g., Eagle One" value={drone.nickname} onChange={(e) => setDrone((d) => ({ ...d, nickname: e.target.value }))} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={drone.category} onValueChange={(v) => setDrone((d) => ({ ...d, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro">Micro (&lt;250g)</SelectItem>
                      <SelectItem value="small">Small (250g–25kg)</SelectItem>
                      <SelectItem value="medium">Medium (25–150kg)</SelectItem>
                      <SelectItem value="large">Large (&gt;150kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Weight ({countryObj.locale.weightUnit})</Label>
                  <Input type="number" placeholder="e.g., 895" value={drone.weight_grams || ""} onChange={(e) => setDrone((d) => ({ ...d, weight_grams: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>

              {/* Remote ID notice */}
              {countryObj.regulations.remoteIdRequired === "required" && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex items-start gap-2">
                  <Radio className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-warning">Remote ID Required in {countryObj.countryName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your drone must have an active Remote ID module to operate in this jurisdiction.</p>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="mr-1 text-[10px]">{countryObj.countryCode}</Badge>
                  {countryObj.flagEmoji} {countryObj.countryName} · Authority: {countryObj.authority.acronym} · Max: {countryObj.regulations.maxAltitudeFt} ft AGL
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("welcome")}>Back</Button>
                <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleDroneSubmit} disabled={loading}>
                  {loading ? "Registering…" : "Register Drone"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Pilot Profile */}
        {step === "pilot" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" /> Pilot Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground">Optional but recommended for compliance with {countryObj.authority.acronym}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{countryObj.regulations.pilotCertName} Number</Label>
                <Input
                  placeholder={`${countryObj.regulations.pilotCertName} #`}
                  value={pilot.license_number}
                  onChange={(e) => setPilot((p) => ({ ...p, license_number: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Insurance Provider</Label>
                  <Input placeholder="e.g., SkyWatch" value={pilot.insurance_provider} onChange={(e) => setPilot((p) => ({ ...p, insurance_provider: e.target.value }))} />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input placeholder="Policy #" value={pilot.insurance_policy} onChange={(e) => setPilot((p) => ({ ...p, insurance_policy: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("drone")}>Back</Button>
                <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handlePilotSubmit} disabled={loading}>
                  {loading ? "Saving…" : "Continue"}
                </Button>
                <Button variant="ghost" onClick={() => { setStep("complete"); supabase.from("user_profiles").update({ onboarding_completed: true }).eq("id", user!.id); }}>
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <Card className="text-center">
            <CardContent className="py-12 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold">You're Ready to Fly</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your drone is registered with {countryObj.authority.acronym} ({countryObj.countryName}) and your profile is set up. You can now plan missions, request authorizations, and manage your fleet.
              </p>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleFinish}>
                Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
