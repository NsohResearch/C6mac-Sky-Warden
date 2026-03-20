import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BRAND_PRESETS, applyBrandPreset, resetBrand, type BrandPreset } from "@/lib/white-label";
import { Paintbrush, Check, RotateCcw, Globe, Upload } from "lucide-react";

export default function WhiteLabelSettings() {
  const [activePreset, setActivePreset] = useState<string>('sky-warden');
  const [customDomain, setCustomDomain] = useState('');
  const [orgName, setOrgName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const handleApplyPreset = (preset: BrandPreset) => {
    applyBrandPreset(preset);
    setActivePreset(preset.id);
    toast({ title: 'Theme applied', description: `${preset.name} theme is now active.` });
  };

  const handleReset = () => {
    resetBrand();
    setActivePreset('sky-warden');
    toast({ title: 'Theme reset', description: 'Default Sky Warden theme restored.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">White-Label Branding</h1>
        <p className="text-sm text-muted-foreground">Customize appearance for your organization</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Paintbrush className="h-4 w-4 text-accent" /> Theme Presets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {BRAND_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm ${
                  activePreset === preset.id ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : 'border-border/50'
                }`}
              >
                <div className="flex gap-1">
                  <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: `hsl(${preset.primaryHsl})` }} />
                  <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: `hsl(${preset.accentHsl})` }} />
                  <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: `hsl(${preset.backgroundHsl})` }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">Radius: {preset.borderRadius}</p>
                </div>
                {activePreset === preset.id && (
                  <Badge className="bg-accent text-accent-foreground text-[10px]"><Check className="mr-1 h-3 w-3" />Active</Badge>
                )}
              </button>
            ))}
            <Button variant="outline" className="w-full" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset to Default
            </Button>
          </CardContent>
        </Card>

        {/* Custom Branding */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-accent" /> Organization Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Organization Name</Label>
                <Input placeholder="e.g., Nigeria CAA Portal" value={orgName} onChange={e => setOrgName(e.target.value)} />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input placeholder="https://…/logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
              </div>
              {logoUrl && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-center">
                  <img src={logoUrl} alt="Logo preview" className="mx-auto h-12 object-contain" />
                </div>
              )}
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast({ title: 'Branding saved' })}>
                Save Branding
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-accent" /> Custom Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Domain</Label>
                <Input placeholder="e.g., drones.youragency.gov" value={customDomain} onChange={e => setCustomDomain(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">
                Point a CNAME record to <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">skyward-harmony.lovable.app</code>
              </p>
              <Button variant="outline" className="w-full" onClick={() => toast({ title: 'Domain verification started' })}>
                Verify Domain
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
