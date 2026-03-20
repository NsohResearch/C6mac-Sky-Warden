import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INDUSTRIES, INDUSTRY_CATEGORIES } from "@/lib/industries";
import { REGION_CONFIGS } from "@/lib/region-config";
import {
  Shield, MapPin, Radio, BarChart3, Globe2, Plane, ChevronRight,
  Check, ArrowRight, Menu, X, Wheat, HardHat, Zap, Mountain,
  Fuel, Building2, ShieldAlert, Siren, TreePine, Package, Video,
  Map, Train, Ship, Heart, GraduationCap, CloudLightning, Landmark,
  Droplets, Building, Trees,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Wheat, HardHat, Zap, Mountain, Fuel, Building2, Shield: ShieldAlert,
  Radio, Siren, TreePine, Package, Video, Map, Train, Ship, Heart,
  GraduationCap, Plane, CloudLightning, Landmark, Droplets, Trees, Building,
  ShieldAlert,
};

const PLAN_TIERS = [
  { name: 'Starter', price: 'Free', period: '', features: ['3 drones', '10 missions/month', 'Basic airspace map', 'Community support'], cta: 'Get Started' },
  { name: 'Professional', price: '$49', period: '/mo', features: ['25 drones', 'Unlimited missions', 'LAANC auto-auth', 'Remote ID tracking', 'Priority support'], cta: 'Start Free Trial', highlight: true },
  { name: 'Enterprise', price: '$199', period: '/mo', features: ['Unlimited drones', 'Multi-tenant fleet', 'Custom integrations', 'White-label branding', 'Dedicated CSM'], cta: 'Contact Sales' },
  { name: 'Agency', price: 'Custom', period: '', features: ['Government portal', 'Revenue collection', 'Registration authority', 'Disbursement engine', 'Audit compliance'], cta: 'Request Demo' },
  { name: 'Developer', price: '$29', period: '/mo', features: ['Full API access', 'Sandbox environment', 'Webhook events', 'SDK & CLI tools', '10K API calls/mo'], cta: 'Get API Key' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState(INDUSTRY_CATEGORIES[0].label);
  const activeIndustries = INDUSTRY_CATEGORIES.find(c => c.label === activeCategory)?.ids ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">SkyWarden</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#industries" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Industries</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#regions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Regions</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate('/login')}>
              Start Free <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden space-y-3">
            <a href="#features" className="block text-sm" onClick={() => setMobileMenu(false)}>Features</a>
            <a href="#industries" className="block text-sm" onClick={() => setMobileMenu(false)}>Industries</a>
            <a href="#pricing" className="block text-sm" onClick={() => setMobileMenu(false)}>Pricing</a>
            <Button className="w-full bg-accent text-accent-foreground" onClick={() => navigate('/login')}>Get Started</Button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-4 py-24 lg:py-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,hsl(36_95%_52%/0.08),transparent)]" />
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
            Trusted across {Object.keys(REGION_CONFIGS).length} countries
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ lineHeight: '1.08' }}>
            Airspace management for the drone economy
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Register drones, plan compliant flights, and manage fleet operations — from solo pilots to government agencies. Built for FAA, Transport Canada, and African aviation authorities.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-all" onClick={() => navigate('/login')}>
              Register Your First Drone <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> LAANC Compliant</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Remote ID Ready</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Multi-Region</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> SOC 2 Architecture</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-border/40 bg-card px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-accent uppercase tracking-widest">Platform</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Everything from registration to revenue</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, title: 'Registration-First', desc: 'No flying without a registered drone. Automated digital IDs, QR codes, and regulatory certificates.' },
              { icon: MapPin, title: 'Flight Plans & Waypoints', desc: 'IFR/VFR-style route planning with corridor buffers, altitude profiles, and real-time deviation alerts.' },
              { icon: Radio, title: 'Remote ID & LAANC', desc: 'Automatic FAA LAANC authorization, Remote ID broadcast compliance, and TFR/NOTAM awareness.' },
              { icon: BarChart3, title: 'Monetization Engine', desc: '5 subscription tiers, registration fee collection, government revenue split, and automated disbursements.' },
              { icon: Globe2, title: 'Multi-Region Ops', desc: 'Pre-configured for USA, Canada, and 10 African nations with local currencies and regulatory authorities.' },
              { icon: Building2, title: 'White-Label Branding', desc: '5 theme presets, custom logos, colors, and domain mapping for government agencies and enterprises.' },
            ].map((f, i) => (
              <Card key={i} className="group border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industries" className="px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-accent uppercase tracking-widest">Industries</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Built for 24 verticals</h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {INDUSTRY_CATEGORIES.map(cat => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.label
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.filter(ind => activeIndustries.includes(ind.id)).map(ind => {
              const IconComp = ICON_MAP[ind.icon] || Globe2;
              return (
                <Card key={ind.id} className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
                        <IconComp className="h-4.5 w-4.5 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{ind.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{ind.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ind.useCases.map(uc => (
                            <span key={uc} className="inline-block rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{uc}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-border/40 bg-card px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-accent uppercase tracking-widest">Pricing</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Plans for every operation size</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PLAN_TIERS.map(plan => (
              <Card key={plan.name} className={`relative overflow-hidden ${plan.highlight ? 'border-accent shadow-lg ring-1 ring-accent/20' : 'border-border/50'}`}>
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
                )}
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-0.5">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    className={`mt-5 w-full text-xs ${plan.highlight ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => navigate('/login')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* REGIONS */}
      <section id="regions" className="px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-accent uppercase tracking-widest">Coverage</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Operating in {Object.keys(REGION_CONFIGS).length} countries</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(REGION_CONFIGS).map(r => (
              <div key={r.code} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent">
                  {r.code}
                </div>
                <div>
                  <p className="text-sm font-medium">{r.country}</p>
                  <p className="text-xs text-muted-foreground">{r.authorityAcronym} · {r.currencySymbol}{r.currency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="border-t border-border/40 px-4 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Globe2 className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Join the SkyWarden Community</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            Connect with drone operators, agencies, and developers across {Object.keys(REGION_CONFIGS).length} countries. Share flight data, collaborate on airspace safety, and help shape the future of UAV operations in your region.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <p className="text-2xl font-bold text-accent">12</p>
              <p className="mt-1 text-sm text-muted-foreground">Countries Supported</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <p className="text-2xl font-bold text-accent">24</p>
              <p className="mt-1 text-sm text-muted-foreground">Industry Verticals</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <p className="text-2xl font-bold text-accent">5</p>
              <p className="mt-1 text-sm text-muted-foreground">Subscription Tiers</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-all" onClick={() => navigate('/login')}>
              Join SkyWarden <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-primary px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-primary-foreground">Ready to fly compliant?</h2>
          <p className="mt-3 text-sm text-primary-foreground/70">Register your first drone in under 5 minutes. No credit card required.</p>
          <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-all" onClick={() => navigate('/login')}>
            Create Free Account <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 bg-card px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold">SkyWarden</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">UAV airspace management platform for the drone economy. Trusted across North America and Africa.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Platform</p>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#industries" className="block text-muted-foreground hover:text-foreground transition-colors">Industries</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Compliance</p>
              <div className="space-y-2 text-sm">
                <span className="block text-muted-foreground">FAA LAANC</span>
                <span className="block text-muted-foreground">Remote ID (Part 89)</span>
                <span className="block text-muted-foreground">Transport Canada</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SkyWarden. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Built for pilots, by pilots.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
