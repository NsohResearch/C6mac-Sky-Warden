import { useState } from "react";
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
import { REGION_CONFIGS, type RegionCode } from "@/lib/region-config";
import { ArrowRight, Check, ChevronRight, Plane, Shield, MapPin, Radio } from "lucide-react";

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Plane },
  { id: 'drone', title: 'Register Drone', icon: Shield },
  { id: 'pilot', title: 'Pilot Profile', icon: MapPin },
  { id: 'complete', title: 'Ready to Fly', icon: Radio },
] as const;

type StepId = typeof STEPS[number]['id'];

export default function Onboarding() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<StepId>('welcome');
  const [loading, setLoading] = useState(false);

  // Drone form state
  const [drone, setDrone] = useState({
    nickname: '', manufacturer: '', model: '', serial_number: '',
    category: 'small', weight_grams: 0,
  });

  // Pilot form state
  const [pilot, setPilot] = useState({
    license_number: '', insurance_provider: '', insurance_policy: '',
  });

  const region = (profile?.region ?? 'US') as RegionCode;
  const regionConfig = REGION_CONFIGS[region];
  const currentIdx = STEPS.findIndex(s => s.id === step);

  const handleDroneSubmit = async () => {
    if (!drone.manufacturer || !drone.model || !drone.serial_number) {
      toast({ title: 'Missing fields', description: 'Please fill in all required drone details.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('drones').insert({
        tenant_id: profile!.tenant_id,
        region: region,
        nickname: drone.nickname || null,
        manufacturer: drone.manufacturer,
        model: drone.model,
        serial_number: drone.serial_number,
        category: drone.category,
        weight_grams: drone.weight_grams || null,
      });
      if (error) throw error;

      // Auto-create registration
      const { data: droneData } = await supabase.from('drones')
        .select('id').eq('serial_number', drone.serial_number).single();
      if (droneData) {
        await supabase.from('drone_registrations').insert({
          tenant_id: profile!.tenant_id,
          drone_id: droneData.id,
          owner_id: user!.id,
          owner_name: profile!.display_name,
          owner_email: profile!.email,
          manufacturer: drone.manufacturer,
          model: drone.model,
          serial_number: drone.serial_number,
          category: drone.category,
          region: region,
          regulatory_authority: regionConfig.authorityAcronym,
          currency: regionConfig.currency,
          registration_type: 'standard',
          status: 'pending_review',
        });
      }
      toast({ title: 'Drone registered', description: `${drone.manufacturer} ${drone.model} has been registered.` });
      setStep('pilot');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePilotSubmit = async () => {
    setLoading(true);
    try {
      await supabase.from('pilot_profiles').insert({
        user_id: user!.id,
        tenant_id: profile!.tenant_id,
        region: region,
        national_license_number: pilot.license_number || null,
        insurance_provider: pilot.insurance_provider || null,
        insurance_policy_number: pilot.insurance_policy || null,
      });
      // Mark onboarding complete
      await supabase.from('user_profiles').update({ onboarding_completed: true }).eq('id', user!.id);
      setStep('complete');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < currentIdx ? 'bg-success text-success-foreground' :
                i === currentIdx ? 'bg-accent text-accent-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < currentIdx ? 'bg-success' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Plane className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Welcome to SkyWarden</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Before you can plan flights, you need to register at least one drone. This ensures compliance with {regionConfig.authorityAcronym} regulations.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What we'll do</p>
                <div className="space-y-1.5 text-sm">
                  <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" /> Register your drone with {regionConfig.authorityAcronym}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Set up your pilot profile</p>
                  <p className="flex items-center gap-2"><Radio className="h-4 w-4 text-accent" /> Enable compliant flight operations</p>
                </div>
              </div>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setStep('drone')}>
                Let's Get Started <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Register Drone */}
        {step === 'drone' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" /> Register Your Drone
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Required by {regionConfig.regulatoryAuthority}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Manufacturer *</Label>
                  <Input placeholder="e.g., DJI" value={drone.manufacturer} onChange={e => setDrone(d => ({ ...d, manufacturer: e.target.value }))} />
                </div>
                <div>
                  <Label>Model *</Label>
                  <Input placeholder="e.g., Mavic 3" value={drone.model} onChange={e => setDrone(d => ({ ...d, model: e.target.value }))} />
                </div>
                <div>
                  <Label>Serial Number *</Label>
                  <Input placeholder="e.g., 1ZNBH1234" value={drone.serial_number} onChange={e => setDrone(d => ({ ...d, serial_number: e.target.value }))} />
                </div>
                <div>
                  <Label>Nickname</Label>
                  <Input placeholder="e.g., Eagle One" value={drone.nickname} onChange={e => setDrone(d => ({ ...d, nickname: e.target.value }))} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={drone.category} onValueChange={v => setDrone(d => ({ ...d, category: v }))}>
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
                  <Label>Weight (grams)</Label>
                  <Input type="number" placeholder="e.g., 895" value={drone.weight_grams || ''} onChange={e => setDrone(d => ({ ...d, weight_grams: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="mr-1 text-[10px]">{regionConfig.code}</Badge>
                  Registration prefix: <strong>{regionConfig.registrationPrefix}</strong> · Authority: {regionConfig.authorityAcronym}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('welcome')}>Back</Button>
                <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleDroneSubmit} disabled={loading}>
                  {loading ? 'Registering…' : 'Register Drone'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Pilot Profile */}
        {step === 'pilot' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" /> Pilot Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground">Optional but recommended for compliance</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pilot License / Certificate Number</Label>
                <Input placeholder={region === 'US' ? 'Part 107 certificate #' : 'License number'} value={pilot.license_number} onChange={e => setPilot(p => ({ ...p, license_number: e.target.value }))} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Insurance Provider</Label>
                  <Input placeholder="e.g., SkyWatch" value={pilot.insurance_provider} onChange={e => setPilot(p => ({ ...p, insurance_provider: e.target.value }))} />
                </div>
                <div>
                  <Label>Policy Number</Label>
                  <Input placeholder="Policy #" value={pilot.insurance_policy} onChange={e => setPilot(p => ({ ...p, insurance_policy: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('drone')}>Back</Button>
                <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handlePilotSubmit} disabled={loading}>
                  {loading ? 'Saving…' : 'Continue'}
                </Button>
                <Button variant="ghost" onClick={() => { setStep('complete'); supabase.from('user_profiles').update({ onboarding_completed: true }).eq('id', user!.id); }}>
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <Card className="text-center">
            <CardContent className="py-12 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold">You're Ready to Fly</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your drone is registered and your profile is set up. You can now plan missions, request LAANC authorizations, and manage your fleet.
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
