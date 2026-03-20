import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Map, Radio, Plane, BarChart3, Code2, Building2,
  Users, ChevronDown, ArrowRight, Check, Globe, Zap,
  Lock, FileCheck, Leaf, HardHat, Ticket, UserCheck,
  Menu, X, Star, BookOpen, Megaphone, Scale,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

/* ------------------------------------------------------------------ */
/*  Mega-menu data                                                     */
/* ------------------------------------------------------------------ */

interface MegaMenuItem {
  icon: React.ElementType;
  label: string;
  desc?: string;
  href?: string;
}

interface MegaMenuGroup {
  title?: string;
  items: MegaMenuItem[];
}

interface NavDropdown {
  label: string;
  groups: MegaMenuGroup[];
  featured?: { label: string; desc: string; cta: string; href: string };
}

const navDropdowns: NavDropdown[] = [
  {
    label: 'Platform',
    groups: [
      {
        items: [
          { icon: Map, label: 'Airspace Management', desc: 'Real-time airspace intelligence and deconfliction' },
          { icon: Shield, label: 'LAANC Authorization', desc: 'Near-real-time FAA authorization' },
          { icon: Radio, label: 'Fleet Management', desc: 'Track and manage your entire drone fleet' },
          { icon: Plane, label: 'Mission Planning', desc: 'Plan, approve, and log every mission' },
          { icon: FileCheck, label: 'Remote ID', desc: '14 CFR Part 89 broadcast & network compliance' },
          { icon: Lock, label: 'Compliance & Security', desc: 'SOC 2, ISO 27001, zero-trust architecture' },
          { icon: Code2, label: 'Developer API', desc: 'REST APIs, webhooks, and SDKs' },
        ],
      },
    ],
  },
  {
    label: 'Industries',
    groups: [
      { title: 'Public Sector', items: [
        { icon: Shield, label: 'Military & Government' },
        { icon: Shield, label: 'Law Enforcement' },
        { icon: Shield, label: 'Emergency Services' },
      ]},
      { title: 'Critical Infrastructure', items: [
        { icon: Building2, label: 'Utilities' },
        { icon: Building2, label: 'Oil & Gas' },
        { icon: Building2, label: 'Mining' },
      ]},
      { title: 'Transportation', items: [
        { icon: Plane, label: 'Airports' },
        { icon: Plane, label: 'Ports & Maritime' },
        { icon: Plane, label: 'Railways & Highways' },
      ]},
      { title: 'More Sectors', items: [
        { icon: Leaf, label: 'Agriculture & Environment' },
        { icon: HardHat, label: 'Construction' },
        { icon: Ticket, label: 'Events & Large Venues' },
        { icon: Globe, label: 'Africa Use Cases' },
      ]},
    ],
  },
  {
    label: 'Resources',
    groups: [
      {
        items: [
          { icon: BookOpen, label: 'Events & Webinars', desc: 'Live and on-demand sessions', href: '/resources' },
          { icon: BookOpen, label: 'Blog', desc: 'Industry insights and how-tos', href: '/resources' },
          { icon: BookOpen, label: 'Case Studies', desc: 'Customer success stories', href: '/resources' },
          { icon: BookOpen, label: 'Guides & Reports', desc: 'In-depth resources and research', href: '/resources' },
          { icon: Megaphone, label: 'Press Releases', desc: 'Company news and announcements', href: '/resources' },
          { icon: Code2, label: 'Developer Docs', desc: 'API reference and SDKs' },
        ],
      },
    ],
    featured: {
      label: 'FAA LAANC 2.0: What Operators Need to Know',
      desc: 'Our most popular webinar covering the latest LAANC updates.',
      cta: 'Watch Now',
      href: '/resources',
    },
  },
  {
    label: 'Company',
    groups: [
      {
        items: [
          { icon: Users, label: 'About' },
          { icon: Users, label: 'Careers' },
          { icon: Users, label: 'Partners' },
          { icon: Users, label: 'Contact' },
          { icon: Lock, label: 'Security & Compliance' },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Feature data                                                       */
/* ------------------------------------------------------------------ */

const features = [
  {
    title: 'Real-Time Airspace Intelligence',
    desc: 'Interactive maps with live airspace data, TFRs, NOTAMs, and UAS Facility Maps. Know exactly where you can fly before you launch.',
    bullets: ['Live TFR and NOTAM overlays', 'UAS Facility Map data synced on 56-day FAA cycle', 'PostGIS-powered spatial queries', 'Controlled/uncontrolled airspace visualization'],
  },
  {
    title: 'LAANC Authorization in Seconds',
    desc: 'Submit, track, and manage FAA LAANC authorizations directly from your mission planning workflow. Near-real-time approvals for controlled airspace.',
    bullets: ['Near-real-time auto-approval', 'Further coordination for complex operations', 'Authorization history and audit trail', 'Multi-pilot authorization management'],
  },
  {
    title: 'Fleet Management at Scale',
    desc: 'Register, track, and manage your entire drone fleet from a single dashboard. Built for organizations running 1 to 10,000+ aircraft.',
    bullets: ['Drone registration with aviation authority integration', 'Maintenance scheduling and tracking', 'Battery and component lifecycle management', 'Remote ID compliance monitoring'],
  },
  {
    title: 'Compliance Without Complexity',
    desc: 'Automated compliance checks, audit-ready logging, and built-in regulatory frameworks. Stay compliant without slowing down operations.',
    bullets: ['SOC 2 Type II certified platform', 'Immutable audit logs', 'Part 107 certification tracking', 'Automated pre-flight compliance checks'],
  },
];

const personas = [
  { icon: Plane, label: 'Individual Pilot', desc: 'B4UFLY checks, LAANC authorization, and flight logging for recreational and Part 107 pilots.', cta: 'Start Flying' },
  { icon: Building2, label: 'Enterprise UAS Manager', desc: 'Fleet management, compliance reporting, and team coordination for commercial programs.', cta: 'Manage Fleet' },
  { icon: Shield, label: 'Airspace Agency', desc: 'Jurisdiction management, local rules publishing, and real-time airspace monitoring.', cta: 'Control Airspace' },
  { icon: Code2, label: 'Developer', desc: 'REST APIs, webhooks, SDKs, and sandbox environments to build on Sky Warden.', cta: 'Build Apps' },
];

const trustBadges = [
  { label: 'FAA Approved', icon: Shield },
  { label: 'SOC 2 Type II', icon: Lock },
  { label: 'ISO 27001', icon: FileCheck },
  { label: 'LAANC USS', icon: Check },
];

const stats = [
  { value: '10,000+', label: 'Pilots' },
  { value: '500+', label: 'Enterprise Fleets' },
  { value: '7', label: 'Countries' },
  { value: '1M+', label: 'Authorizations' },
];

const pricingPreview = [
  { name: 'Free', price: '$0', period: '/mo', desc: 'For hobbyist pilots', features: ['Up to 3 drones', 'Basic airspace checks', '5 LAANC auths/mo'], cta: 'Get Started Free', style: 'outline' as const },
  { name: 'Professional', price: '$49', period: '/mo', desc: 'For professional pilots', features: ['Up to 15 drones', 'Unlimited LAANC', 'Advanced analytics'], cta: 'Start 14-Day Trial', style: 'primary' as const, popular: true },
  { name: 'Enterprise', price: '$199', period: '/mo', desc: 'For large fleets', features: ['Unlimited drones', 'SSO / SAML', 'Dedicated support'], cta: 'Start 14-Day Trial', style: 'dark' as const },
];

const footerLinks = {
  Platform: ['Airspace Management', 'LAANC Authorization', 'Fleet Management', 'Mission Planning', 'Remote ID', 'Developer API'],
  Industries: ['Public Sector', 'Critical Infrastructure', 'Transportation', 'Agriculture', 'Construction', 'Events & Venues'],
  Resources: ['Blog', 'Case Studies', 'Webinars', 'Guides & Reports', 'Press Releases', 'Developer Docs'],
  Company: ['About', 'Careers', 'Partners', 'Contact', 'Security', 'Status'],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleMenuEnter = (label: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setOpenMenu(label);
  };
  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setOpenMenu(null), 150);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Navigation ── */}
      <nav
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'bg-gray-950/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
              C6
            </div>
            <span className="font-bold text-sm">Sky Warden</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navDropdowns.map((dd) => (
              <div
                key={dd.label}
                className="relative"
                onMouseEnter={() => handleMenuEnter(dd.label)}
                onMouseLeave={handleMenuLeave}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  {dd.label}
                  <ChevronDown size={14} className={clsx('transition-transform', openMenu === dd.label && 'rotate-180')} />
                </button>

                {/* Mega menu dropdown */}
                {openMenu === dd.label && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-2"
                    onMouseEnter={() => handleMenuEnter(dd.label)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-2xl p-5 min-w-[320px]">
                      <div className={clsx('grid gap-6', dd.groups.length > 1 ? 'grid-cols-2 min-w-[500px]' : 'grid-cols-1')}>
                        {dd.groups.map((group, gi) => (
                          <div key={gi}>
                            {group.title && (
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.title}</p>
                            )}
                            <ul className="space-y-1">
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <li key={item.label}>
                                    <Link
                                      to={item.href ?? '#'}
                                      className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-800 transition-colors"
                                      onClick={() => setOpenMenu(null)}
                                    >
                                      <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-200">{item.label}</p>
                                        {item.desc && <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>}
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                      {dd.featured && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <Link
                            to={dd.featured.href}
                            className="block rounded-lg bg-blue-950/50 p-3 hover:bg-blue-950/70 transition-colors"
                            onClick={() => setOpenMenu(null)}
                          >
                            <p className="text-xs font-semibold text-blue-300">{dd.featured.label}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{dd.featured.desc}</p>
                            <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 font-medium">
                              {dd.featured.cta} <ArrowRight size={11} />
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/pricing" className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-amber-400 transition-colors">
              Schedule a Demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden text-gray-300" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-800 px-4 pb-6 max-h-[80vh] overflow-y-auto">
            {navDropdowns.map((dd) => (
              <div key={dd.label} className="py-3 border-b border-gray-800">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{dd.label}</p>
                {dd.groups.map((g, gi) => (
                  <div key={gi} className="mb-2">
                    {g.title && <p className="text-[10px] text-gray-600 uppercase mb-1 ml-2">{g.title}</p>}
                    {g.items.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href ?? '#'}
                        className="block px-2 py-1.5 text-sm text-gray-300 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Link to="/login" className="text-center rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-200">Log In</Link>
              <Link to="/register" className="text-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-900">Schedule a Demo</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-gray-950 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
            The Operating System<br className="hidden md:block" /> for Drone Airspace
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            FAA-approved airspace management connecting local drone rules to national air traffic management. One platform for individual pilots, public safety, and the enterprise.
          </p>

          <div className="flex items-center justify-center gap-4 mb-10">
            <Link to="/register" className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-amber-400 transition-colors">
              Get Started Free
            </Link>
            <button className="rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium text-gray-200 hover:bg-gray-800 transition-colors">
              Schedule a Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {trustBadges.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="flex items-center gap-1.5 rounded-full bg-gray-800/60 border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300">
                  <Icon size={12} className="text-green-400" />
                  {b.label}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built For (Personas) ── */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Built For Your Role</h2>
          <p className="text-gray-400 text-center text-sm mb-12 max-w-2xl mx-auto">
            Sky Warden adapts to your needs, whether you are a solo pilot or managing a national drone program.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-600 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{p.label}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{p.desc}</p>
                  <button className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    {p.cta} <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Platform Capabilities</h2>
          <p className="text-gray-400 text-center text-sm mb-16 max-w-2xl mx-auto">
            Everything you need to plan, fly, and manage compliant drone operations at any scale.
          </p>

          <div className="space-y-20">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className={clsx(
                  'flex flex-col lg:flex-row items-center gap-10',
                  i % 2 === 1 && 'lg:flex-row-reverse'
                )}
              >
                {/* Placeholder visual */}
                <div className="flex-1 w-full">
                  <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <Map size={40} className="mx-auto text-gray-600 mb-2" />
                      <p className="text-xs text-gray-600">{feat.title} Preview</p>
                    </div>
                  </div>
                </div>
                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-sm text-gray-400 mb-5 leading-relaxed">{feat.desc}</p>
                  <ul className="space-y-2">
                    {feat.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs text-gray-300">
                        <Check size={14} className="text-green-500 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Logos ── */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Trusted by leading organizations worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['Acme Energy', 'Metro PD', 'Kenya Wildlife Service', 'Lagos SEMA', 'SkyOps Corp', 'AeroDef Inc', 'GreenDrone AG', 'AirBridge Solutions'].map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-800 px-6 py-3 text-xs font-medium text-gray-500"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center text-sm mb-12">
            Start free, scale as you grow. No hidden fees.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingPreview.map((plan) => (
              <div
                key={plan.name}
                className={clsx(
                  'rounded-xl border p-6 flex flex-col',
                  plan.popular
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-gray-900'
                    : 'border-gray-800 bg-gray-900/50'
                )}
              >
                {plan.popular && (
                  <span className="self-start rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold text-white mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{plan.desc}</p>
                <div className="mb-5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                      <Check size={14} className="text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={clsx(
                    'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    plan.style === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                    plan.style === 'dark' && 'bg-white text-gray-900 hover:bg-gray-100',
                    plan.style === 'outline' && 'border border-gray-600 text-gray-200 hover:bg-gray-800'
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-blue-400 font-medium hover:text-blue-300">
              View All Plans <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Drone Operations?
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Join thousands of pilots, enterprises, and agencies already using Sky Warden for compliant drone fleet management.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-amber-400 transition-colors">
              Start Free
            </Link>
            <button className="rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium text-gray-200 hover:bg-gray-800 transition-colors">
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social and legal */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">
                C6
              </div>
              <span className="text-xs text-gray-500">&copy; 2026 Sky Warden by C6mac. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-300">Privacy</a>
              <a href="#" className="hover:text-gray-300">Terms</a>
              <a href="#" className="hover:text-gray-300">Security</a>
              <a href="#" className="hover:text-gray-300">Status</a>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Globe size={12} />
              <span>US</span>
              <span>|</span>
              <span>NG</span>
              <span>|</span>
              <span>KE</span>
              <span>|</span>
              <span>ZA</span>
              <span>|</span>
              <span>GH</span>
              <span>|</span>
              <span>RW</span>
              <span>|</span>
              <span>CA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
