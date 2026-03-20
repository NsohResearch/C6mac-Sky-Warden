import { useState } from 'react';
import {
  Check, X, ChevronDown, Globe, Star, Zap,
  Shield, Code2, Building2, ArrowRight, HelpCircle,
  Landmark,
} from 'lucide-react';
import { clsx } from 'clsx';

type BillingCycle = 'monthly' | 'annual';

const regions = [
  { code: 'US', label: 'USA', currency: 'USD', symbol: '$', divisor: 100 },
  { code: 'CA', label: 'Canada', currency: 'CAD', symbol: 'CA$', divisor: 100 },
  { code: 'NG', label: 'Nigeria', currency: 'NGN', symbol: '\u20A6', divisor: 100 },
  { code: 'KE', label: 'Kenya', currency: 'KES', symbol: 'KSh', divisor: 100 },
  { code: 'ZA', label: 'South Africa', currency: 'ZAR', symbol: 'R', divisor: 100 },
  { code: 'GH', label: 'Ghana', currency: 'GHS', symbol: 'GH\u20B5', divisor: 100 },
  { code: 'RW', label: 'Rwanda', currency: 'RWF', symbol: 'RF', divisor: 100 },
];

type PlanId = 'free' | 'pro' | 'enterprise' | 'agency' | 'developer';

interface PlanDef {
  id: PlanId;
  name: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  cta: string;
  ctaStyle: 'primary' | 'outline' | 'dark';
  icon: typeof Star;
  features: string[];
  prices: Record<string, { monthly: number; annual: number }>;
}

const plans: PlanDef[] = [
  {
    id: 'free',
    name: 'Starter',
    description: 'For hobbyist pilots getting started',
    cta: 'Get Started Free',
    ctaStyle: 'outline',
    icon: Zap,
    features: [
      'Up to 3 drones',
      '1 pilot seat',
      'Basic airspace checks',
      '5 LAANC authorizations/month',
      '10 missions/month',
      'Basic flight logging',
      '1 GB storage',
      'Email support',
    ],
    prices: {
      USD: { monthly: 0, annual: 0 },
      CAD: { monthly: 0, annual: 0 },
      NGN: { monthly: 0, annual: 0 },
      KES: { monthly: 0, annual: 0 },
      ZAR: { monthly: 0, annual: 0 },
      GHS: { monthly: 0, annual: 0 },
      RWF: { monthly: 0, annual: 0 },
    },
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For professional pilots and small teams',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-600 text-white',
    cta: 'Start 14-Day Trial',
    ctaStyle: 'primary',
    icon: Star,
    features: [
      'Up to 15 drones',
      'Up to 5 pilots',
      'Interactive airspace map',
      'Unlimited LAANC authorizations',
      'Unlimited missions',
      'Pre-flight checklists',
      'Basic analytics',
      'Flight hour tracking',
      '10 GB storage',
      'Priority email support',
      '90-day audit log retention',
    ],
    prices: {
      USD: { monthly: 4900, annual: 47000 },
      CAD: { monthly: 6600, annual: 63500 },
      NGN: { monthly: 735000, annual: 7050000 },
      KES: { monthly: 635000, annual: 6100000 },
      ZAR: { monthly: 88000, annual: 846000 },
      GHS: { monthly: 49000, annual: 470000 },
      RWF: { monthly: 4900000, annual: 47000000 },
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For enterprise UAS programs and large fleets',
    badge: 'Best for Teams',
    badgeColor: 'bg-purple-600 text-white',
    cta: 'Start 14-Day Trial',
    ctaStyle: 'dark',
    icon: Building2,
    features: [
      'Unlimited drones',
      'Unlimited pilots',
      'Full fleet management',
      'Advanced analytics & reporting',
      'SOC 2 / ISO 27001 compliance',
      'Custom roles & permissions',
      'SSO / SAML integration',
      'Webhooks & integrations',
      '100 GB storage',
      'Dedicated account manager',
      'Phone + priority support',
      '1-year audit log retention',
      'Custom branding',
    ],
    prices: {
      USD: { monthly: 19900, annual: 191000 },
      CAD: { monthly: 26900, annual: 258000 },
      NGN: { monthly: 2985000, annual: 28650000 },
      KES: { monthly: 2585000, annual: 24800000 },
      ZAR: { monthly: 358000, annual: 3440000 },
      GHS: { monthly: 199000, annual: 1910000 },
      RWF: { monthly: 19900000, annual: 191000000 },
    },
  },
  {
    id: 'agency',
    name: 'Agency & Government',
    description: 'For airspace authorities and local agencies',
    cta: 'Contact Sales',
    ctaStyle: 'outline',
    icon: Shield,
    features: [
      'Jurisdiction management',
      'Local drone rule publishing',
      'Real-time Remote ID monitoring',
      'Incident tracking & reporting',
      'Live airspace activity feed',
      'Multi-agency coordination',
      'Government revenue dashboard',
      'Enforcement tools',
      '500 GB storage',
      'Unlimited audit log retention',
      'Dedicated support line',
    ],
    prices: {
      USD: { monthly: 29900, annual: 287000 },
      CAD: { monthly: 40400, annual: 387500 },
      NGN: { monthly: 4485000, annual: 43050000 },
      KES: { monthly: 3885000, annual: 37300000 },
      ZAR: { monthly: 538000, annual: 5165000 },
      GHS: { monthly: 299000, annual: 2870000 },
      RWF: { monthly: 29900000, annual: 287000000 },
    },
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'For app developers building on Sky Warden APIs',
    cta: 'Start Building',
    ctaStyle: 'outline',
    icon: Code2,
    features: [
      'Full API access',
      'Sandbox environment',
      'Webhook configuration',
      '1,000 API calls/hour',
      'SDK access (Node.js, Python)',
      'API key management',
      'Developer documentation',
      '5 GB storage',
      'Community support',
      'Rate limit dashboard',
    ],
    prices: {
      USD: { monthly: 2900, annual: 27800 },
      CAD: { monthly: 3900, annual: 37500 },
      NGN: { monthly: 435000, annual: 4170000 },
      KES: { monthly: 375000, annual: 3600000 },
      ZAR: { monthly: 52000, annual: 500000 },
      GHS: { monthly: 29000, annual: 278000 },
      RWF: { monthly: 2900000, annual: 27800000 },
    },
  },
];

const comparisonFeatures = [
  { name: 'Drones', free: '3', pro: '15', enterprise: 'Unlimited', agency: 'Unlimited', developer: '5' },
  { name: 'Pilots', free: '1', pro: '5', enterprise: 'Unlimited', agency: 'Unlimited', developer: '2' },
  { name: 'Missions/month', free: '10', pro: 'Unlimited', enterprise: 'Unlimited', agency: 'Unlimited', developer: '50' },
  { name: 'LAANC Authorizations', free: '5/mo', pro: 'Unlimited', enterprise: 'Unlimited', agency: 'Unlimited', developer: '20/mo' },
  { name: 'Storage', free: '1 GB', pro: '10 GB', enterprise: '100 GB', agency: '500 GB', developer: '5 GB' },
  { name: 'API Access', free: false, pro: false, enterprise: '5,000/hr', agency: '10,000/hr', developer: '1,000/hr' },
  { name: 'Advanced Analytics', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'Compliance Reporting', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'Custom Roles', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'SSO / SAML', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'Webhooks', free: false, pro: false, enterprise: true, agency: true, developer: true },
  { name: 'Sandbox Environment', free: false, pro: false, enterprise: true, agency: true, developer: true },
  { name: 'Dedicated Account Manager', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'Audit Log Retention', free: '30 days', pro: '90 days', enterprise: '1 year', agency: 'Unlimited', developer: '30 days' },
  { name: 'White Label', free: false, pro: false, enterprise: true, agency: true, developer: false },
  { name: 'Government Revenue Dashboard', free: false, pro: false, enterprise: false, agency: true, developer: false },
];

const faqs = [
  {
    q: 'What happens when I exceed my plan limits?',
    a: 'You will receive a notification when approaching your limits. Exceeding limits will pause new operations until you upgrade or the next billing cycle begins. No data is lost.',
  },
  {
    q: 'Can I change plans at any time?',
    a: 'Yes. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'How does drone registration work?',
    a: 'Each drone must be registered before flight, similar to vehicle registration. A one-time annual registration fee applies per drone, with a portion supporting your national aviation authority.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Paid plans include a 14-day free trial. No credit card required for the Starter plan. You can cancel anytime during the trial period.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We accept credit/debit cards, bank transfers, and mobile money (M-Pesa, MTN, Airtel) in supported African regions.',
  },
  {
    q: 'How does annual billing work?',
    a: 'Annual billing gives you a 20% discount compared to monthly billing. You are billed once per year for the full subscription.',
  },
];

function formatPrice(amount: number, symbol: string): string {
  if (amount === 0) return 'Free';
  const value = amount / 100;
  if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `${symbol}${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

export function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [regionIdx, setRegionIdx] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const region = regions[regionIdx];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Sky Warden Plans</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Multi-region drone fleet management with built-in FAA compliance, LAANC authorization, and Remote ID tracking
          </p>

          {/* Region selector */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Globe size={16} className="text-gray-400" />
            {regions.map((r, i) => (
              <button
                key={r.code}
                onClick={() => setRegionIdx(i)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  regionIdx === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                )}
              >
                {r.label} ({r.currency})
              </button>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-gray-800 p-1">
            <button
              onClick={() => setCycle('monthly')}
              className={clsx(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                cycle === 'monthly' ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={clsx(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                cycle === 'annual' ? 'bg-white text-gray-900' : 'text-gray-300 hover:text-white'
              )}
            >
              Annual
              <span className="ml-2 inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan) => {
            const price = plan.prices[region.currency] ?? plan.prices['USD'];
            const amount = cycle === 'monthly' ? price.monthly : price.annual;
            const monthlyEquiv = cycle === 'annual' && amount > 0 ? Math.round(amount / 12) : amount;
            const Icon = plan.icon;
            const isHighlighted = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={clsx(
                  'relative rounded-xl border bg-white p-5 shadow-sm flex flex-col',
                  isHighlighted ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
                )}
              >
                {plan.badge && (
                  <div className={clsx('absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold', plan.badgeColor)}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2 mt-1">
                  <div className={clsx('flex h-8 w-8 items-center justify-center rounded-lg', isHighlighted ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600')}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                </div>

                <p className="text-xs text-gray-500 mb-4">{plan.description}</p>

                <div className="mb-4">
                  {amount === 0 ? (
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(monthlyEquiv, region.symbol)}
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                      {cycle === 'annual' && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          {formatPrice(amount, region.symbol)}/year
                        </p>
                      )}
                    </>
                  )}
                </div>

                <button
                  className={clsx(
                    'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors mb-5',
                    plan.ctaStyle === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                    plan.ctaStyle === 'dark' && 'bg-gray-900 text-white hover:bg-gray-800',
                    plan.ctaStyle === 'outline' && 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare Plans</h2>
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-5 py-3 text-left font-medium text-gray-500">Feature</th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">Starter</th>
                  <th className="px-5 py-3 text-center font-medium text-blue-600">Pro</th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">Enterprise</th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">Agency</th>
                  <th className="px-5 py-3 text-center font-medium text-gray-500">Developer</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisonFeatures.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{row.name}</td>
                    {(['free', 'pro', 'enterprise', 'agency', 'developer'] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="px-5 py-3 text-center">
                          {val === true ? (
                            <Check size={16} className="mx-auto text-green-500" />
                          ) : val === false ? (
                            <X size={16} className="mx-auto text-gray-300" />
                          ) : (
                            <span className="text-gray-700 text-xs font-medium">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 mt-16 pb-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border bg-white shadow-sm">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={clsx('text-gray-400 transition-transform', expandedFaq === i && 'rotate-180')}
                />
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Government revenue note */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
          <Landmark size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Government Revenue Contribution</p>
            <p className="text-xs text-amber-700 mt-1">
              A portion of registration and authorization fees supports your national aviation authority. This helps fund airspace safety programs and regulatory oversight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
