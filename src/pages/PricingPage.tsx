import { useState } from 'react';
import { Check, X, ChevronDown, Star, Zap, Shield, Code2, Building2, ArrowRight, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BILLING_REGIONS, formatCurrencyAmount } from '@/lib/region-config';

type BillingCycle = 'monthly' | 'annual';
type PlanId = 'free' | 'pro' | 'enterprise' | 'agency' | 'developer';

interface PlanDef {
  id: PlanId;
  name: string;
  description: string;
  badge?: string;
  cta: string;
  icon: typeof Star;
  features: string[];
  prices: Record<string, { monthly: number; annual: number }>;
}

const plans: PlanDef[] = [
  {
    id: 'free', name: 'Starter', description: 'For hobbyist pilots getting started',
    cta: 'Get Started Free', icon: Zap,
    features: ['Up to 3 drones', '1 pilot seat', 'Basic airspace checks', '5 LAANC authorizations/month', '10 missions/month', 'Basic flight logging', '1 GB storage', 'Email support'],
    prices: { USD: { monthly: 0, annual: 0 }, CAD: { monthly: 0, annual: 0 }, NGN: { monthly: 0, annual: 0 }, KES: { monthly: 0, annual: 0 }, ZAR: { monthly: 0, annual: 0 }, GHS: { monthly: 0, annual: 0 }, RWF: { monthly: 0, annual: 0 } },
  },
  {
    id: 'pro', name: 'Professional', description: 'For professional pilots and small teams',
    badge: 'Most Popular', cta: 'Start 14-Day Trial', icon: Star,
    features: ['Up to 15 drones', 'Up to 5 pilots', 'Interactive airspace map', 'Unlimited LAANC authorizations', 'Unlimited missions', 'Pre-flight checklists', 'Basic analytics', '10 GB storage', 'Priority email support'],
    prices: { USD: { monthly: 4900, annual: 47000 }, CAD: { monthly: 6600, annual: 63500 }, NGN: { monthly: 735000, annual: 7050000 }, KES: { monthly: 635000, annual: 6100000 }, ZAR: { monthly: 88000, annual: 846000 }, GHS: { monthly: 49000, annual: 470000 }, RWF: { monthly: 4900000, annual: 47000000 } },
  },
  {
    id: 'enterprise', name: 'Enterprise', description: 'For enterprise UAS programs and large fleets',
    badge: 'Best for Teams', cta: 'Start 14-Day Trial', icon: Building2,
    features: ['Unlimited drones', 'Unlimited pilots', 'Full fleet management', 'Advanced analytics & reporting', 'SOC 2 / ISO 27001 compliance', 'Custom roles & permissions', 'SSO / SAML integration', '100 GB storage', 'Dedicated account manager'],
    prices: { USD: { monthly: 19900, annual: 191000 }, CAD: { monthly: 26900, annual: 258000 }, NGN: { monthly: 2985000, annual: 28650000 }, KES: { monthly: 2585000, annual: 24800000 }, ZAR: { monthly: 358000, annual: 3440000 }, GHS: { monthly: 199000, annual: 1910000 }, RWF: { monthly: 19900000, annual: 191000000 } },
  },
  {
    id: 'agency', name: 'Agency & Government', description: 'For airspace authorities and local agencies',
    cta: 'Contact Sales', icon: Shield,
    features: ['Jurisdiction management', 'Local drone rule publishing', 'Real-time Remote ID monitoring', 'Incident tracking & reporting', 'Government revenue dashboard', 'Multi-agency coordination', '500 GB storage', 'Dedicated support line'],
    prices: { USD: { monthly: 29900, annual: 287000 }, CAD: { monthly: 40400, annual: 387500 }, NGN: { monthly: 4485000, annual: 43050000 }, KES: { monthly: 3885000, annual: 37300000 }, ZAR: { monthly: 538000, annual: 5165000 }, GHS: { monthly: 299000, annual: 2870000 }, RWF: { monthly: 29900000, annual: 287000000 } },
  },
  {
    id: 'developer', name: 'Developer', description: 'For app developers building on Sky Warden APIs',
    cta: 'Start Building', icon: Code2,
    features: ['Full API access', 'Sandbox environment', 'Webhook configuration', '1,000 API calls/hour', 'SDK access (Node.js, Python)', 'API key management', '5 GB storage', 'Community support'],
    prices: { USD: { monthly: 2900, annual: 27800 }, CAD: { monthly: 3900, annual: 37500 }, NGN: { monthly: 435000, annual: 4170000 }, KES: { monthly: 375000, annual: 3600000 }, ZAR: { monthly: 52000, annual: 500000 }, GHS: { monthly: 29000, annual: 278000 }, RWF: { monthly: 2900000, annual: 27800000 } },
  },
];

const comparisonFeatures = [
  { name: 'Drones', free: '3', pro: '15', enterprise: 'Unlimited', agency: 'Unlimited', developer: '5' },
  { name: 'Pilots', free: '1', pro: '5', enterprise: 'Unlimited', agency: 'Unlimited', developer: '2' },
  { name: 'Missions/month', free: '10', pro: 'Unlimited', enterprise: 'Unlimited', agency: 'Unlimited', developer: '50' },
  { name: 'Storage', free: '1 GB', pro: '10 GB', enterprise: '100 GB', agency: '500 GB', developer: '5 GB' },
  { name: 'API Access', free: false, pro: false, enterprise: '5,000/hr', agency: '10,000/hr', developer: '1,000/hr' },
  { name: 'Advanced Analytics', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'SSO / SAML', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'Gov Revenue Dashboard', free: false, pro: false, enterprise: false, agency: true, developer: false },
];

const faqs = [
  { q: 'What happens when I exceed my plan limits?', a: 'You will receive a notification when approaching your limits. Exceeding limits will pause new operations until you upgrade or the next billing cycle begins.' },
  { q: 'Can I change plans at any time?', a: 'Yes. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period.' },
  { q: 'How does drone registration work?', a: 'Each drone must be registered before flight. A one-time annual registration fee applies per drone, with a portion supporting your national aviation authority.' },
  { q: 'Is there a free trial?', a: 'Paid plans include a 14-day free trial. No credit card required for the Starter plan.' },
  { q: 'What payment methods are supported?', a: 'We accept credit/debit cards, bank transfers, and mobile money (M-Pesa, MTN, Airtel) in supported African regions.' },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [regionIdx, setRegionIdx] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const region = BILLING_REGIONS[regionIdx];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
        <h1 className="text-3xl font-bold tracking-tight text-balance">Sky Warden Plans</h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl">
          Multi-region drone fleet management with built-in compliance, authorization, and Remote ID tracking
        </p>

        {/* Region selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          {BILLING_REGIONS.map((r, i) => (
            <button
              key={r.code}
              onClick={() => setRegionIdx(i)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                regionIdx === i ? 'bg-primary text-primary-foreground' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              {r.label} ({r.currency})
            </button>
          ))}
        </div>

        {/* Billing toggle */}
        <div className="mt-4 flex items-center gap-3">
          <div className="inline-flex rounded-full bg-slate-800 p-1">
            <button onClick={() => setCycle('monthly')} className={cn('rounded-full px-5 py-2 text-sm font-medium transition-colors', cycle === 'monthly' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white')}>Monthly</button>
            <button onClick={() => setCycle('annual')} className={cn('rounded-full px-5 py-2 text-sm font-medium transition-colors', cycle === 'annual' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white')}>Annual</button>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">Save 20%</span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan) => {
          const price = plan.prices[region.currency] ?? plan.prices['USD'];
          const amount = cycle === 'monthly' ? price.monthly : price.annual;
          const monthlyEquiv = cycle === 'annual' && amount > 0 ? Math.round(amount / 12) : amount;
          const Icon = plan.icon;
          const isHighlighted = plan.id === 'pro';

          return (
            <div key={plan.id} className={cn('relative flex flex-col rounded-xl border p-5 transition-shadow hover:shadow-lg', isHighlighted ? 'border-primary ring-2 ring-primary/20 bg-card' : 'border-border bg-card')}>
              {plan.badge && (
                <div className="absolute -top-3 left-4">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', isHighlighted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{plan.badge}</span>
                </div>
              )}
              <div className="mb-4 mt-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-4">
                {amount === 0 ? (
                  <span className="text-2xl font-bold text-foreground">Free</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-foreground">{formatCurrencyAmount(monthlyEquiv, region.symbol)}</span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                    {cycle === 'annual' && (
                      <p className="text-xs text-muted-foreground mt-0.5">{formatCurrencyAmount(amount, region.symbol)}/year</p>
                    )}
                  </>
                )}
              </div>

              <button className={cn('w-full rounded-lg py-2.5 text-sm font-medium transition-colors', isHighlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border text-foreground hover:bg-accent')}>
                {plan.cta}
              </button>

              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">Feature</th>
                {['Starter', 'Pro', 'Enterprise', 'Agency', 'Developer'].map((h) => (
                  <th key={h} className="pb-3 text-center font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row) => (
                <tr key={row.name} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground">{row.name}</td>
                  {(['free', 'pro', 'enterprise', 'agency', 'developer'] as const).map((tier) => {
                    const val = row[tier];
                    return (
                      <td key={tier} className="py-3 text-center">
                        {val === true ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : val === false ? <X className="mx-auto h-4 w-4 text-muted-foreground/40" /> : <span className="text-xs text-foreground">{val}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border">
              <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground">
                {faq.q}
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', expandedFaq === i && 'rotate-180')} />
              </button>
              {expandedFaq === i && <p className="px-4 pb-3 text-xs text-muted-foreground">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Gov revenue note */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
        <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Government Revenue Contribution</h3>
          <p className="mt-1 text-xs text-muted-foreground">A portion of registration and authorization fees supports your national aviation authority, funding airspace safety programs and regulatory oversight.</p>
        </div>
      </div>
    </div>
  );
}
