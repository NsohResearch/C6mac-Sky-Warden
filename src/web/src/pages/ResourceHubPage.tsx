import { useState, useMemo } from 'react';
import {
  Search, Calendar, Clock, FileText, BookOpen, Megaphone,
  Scale, Code2, Video, ArrowRight, Mail, ChevronRight,
  Play, Download, ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

type ResourceCategory =
  | 'all'
  | 'events'
  | 'blog'
  | 'case-studies'
  | 'guides'
  | 'press'
  | 'regulatory'
  | 'developer';

interface Resource {
  id: number;
  category: ResourceCategory;
  title: string;
  description: string;
  date: string;
  meta?: string;
  cta: string;
  ctaIcon: React.ElementType;
}

const categories: { id: ResourceCategory; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'bg-gray-600' },
  { id: 'events', label: 'Events & Webinars', color: 'bg-blue-600' },
  { id: 'blog', label: 'Blog', color: 'bg-green-600' },
  { id: 'case-studies', label: 'Case Studies', color: 'bg-purple-600' },
  { id: 'guides', label: 'Guides & Reports', color: 'bg-amber-600' },
  { id: 'press', label: 'Press Releases', color: 'bg-red-600' },
  { id: 'regulatory', label: 'Regulatory Updates', color: 'bg-gray-500' },
  { id: 'developer', label: 'Developer Docs', color: 'bg-cyan-600' },
];

const categoryBadge: Record<string, { bg: string; text: string }> = {
  events: { bg: 'bg-blue-100 text-blue-700', text: 'Webinar' },
  blog: { bg: 'bg-green-100 text-green-700', text: 'Blog' },
  'case-studies': { bg: 'bg-purple-100 text-purple-700', text: 'Case Study' },
  guides: { bg: 'bg-amber-100 text-amber-700', text: 'Guide' },
  press: { bg: 'bg-red-100 text-red-700', text: 'Press Release' },
  regulatory: { bg: 'bg-gray-100 text-gray-700', text: 'Regulatory' },
  developer: { bg: 'bg-cyan-100 text-cyan-700', text: 'Developer' },
};

const resources: Resource[] = [
  // Events & Webinars
  {
    id: 1, category: 'events',
    title: 'Protecting Critical Infrastructure: Airspace Intelligence for Utilities',
    description: 'Learn how utility companies use Sky Warden to coordinate inspection drone fleets across thousands of miles of power lines.',
    date: 'Feb 12, 2026', meta: 'Webinar | 45 min', cta: 'Watch On-Demand', ctaIcon: Play,
  },
  {
    id: 2, category: 'events',
    title: 'Remote ID Compliance Workshop: What You Need Before the Deadline',
    description: 'Hands-on workshop covering 14 CFR Part 89 requirements, broadcast vs. network compliance, and implementation timelines.',
    date: 'Mar 5, 2026', meta: 'Workshop | 90 min', cta: 'Register Now', ctaIcon: ExternalLink,
  },
  {
    id: 3, category: 'events',
    title: 'Africa Drone Forum 2026: Sky Warden Live Demo',
    description: 'Join us in Kigali, Rwanda for a live demonstration of fleet management and mobile money drone registration.',
    date: 'Apr 15, 2026', meta: 'Conference | Kigali, Rwanda', cta: 'Learn More', ctaIcon: ExternalLink,
  },
  {
    id: 4, category: 'events',
    title: 'Enterprise Fleet Management Best Practices',
    description: 'Strategies for scaling drone programs from 10 to 1,000+ aircraft with compliance and cost efficiency.',
    date: 'May 8, 2026', meta: 'Webinar | 60 min', cta: 'Register Now', ctaIcon: ExternalLink,
  },
  // Blog
  {
    id: 5, category: 'blog',
    title: '5 Steps to Get Your LAANC Authorization Approved Faster',
    description: 'Practical tips to reduce authorization turnaround time and avoid common rejection reasons.',
    date: 'Jan 15, 2026', meta: '6 min read', cta: 'Read Article', ctaIcon: ArrowRight,
  },
  {
    id: 6, category: 'blog',
    title: 'How Multi-Tenant Architecture Keeps Enterprise Drone Data Secure',
    description: 'A technical deep-dive into row-level security, tenant isolation, and SOC 2 compliance in SaaS drone platforms.',
    date: 'Feb 1, 2026', meta: '8 min read', cta: 'Read Article', ctaIcon: ArrowRight,
  },
  {
    id: 7, category: 'blog',
    title: 'Mobile Money for Drone Registration: Bridging the Digital Divide in Africa',
    description: 'How M-Pesa and MTN Mobile Money integrations enable drone registration for operators without bank accounts.',
    date: 'Feb 20, 2026', meta: '5 min read', cta: 'Read Article', ctaIcon: ArrowRight,
  },
  {
    id: 8, category: 'blog',
    title: 'Understanding FAA Part 107 Waivers: A Complete Guide',
    description: 'Everything commercial operators need to know about Part 107 waiver applications, from night operations to BVLOS.',
    date: 'Mar 1, 2026', meta: '10 min read', cta: 'Read Article', ctaIcon: ArrowRight,
  },
  // Case Studies
  {
    id: 9, category: 'case-studies',
    title: 'How Acme Energy Reduced Pipeline Inspection Costs by 60% with Sky Warden',
    description: 'A Fortune 500 energy company transformed its 12,000-mile pipeline inspection program with automated fleet management.',
    date: 'Jan 2026', meta: 'Energy Sector', cta: 'Read Case Study', ctaIcon: ArrowRight,
  },
  {
    id: 10, category: 'case-studies',
    title: 'Kenya Wildlife Service: Scaling Anti-Poaching Drone Operations',
    description: 'How KWS deployed 30+ drones across 8 national parks with centralized airspace coordination.',
    date: 'Feb 2026', meta: 'Conservation', cta: 'Read Case Study', ctaIcon: ArrowRight,
  },
  {
    id: 11, category: 'case-studies',
    title: 'Metro PD: Managing 50+ Public Safety Drones Across 12 Precincts',
    description: 'A major metropolitan police department standardized drone operations with evidence-grade flight logging.',
    date: 'Mar 2026', meta: 'Law Enforcement', cta: 'Read Case Study', ctaIcon: ArrowRight,
  },
  {
    id: 12, category: 'case-studies',
    title: 'Lagos State Emergency Management: Disaster Response Fleet Coordination',
    description: 'How LASEMA built a rapid-response drone program for flood monitoring and disaster assessment.',
    date: 'Mar 2026', meta: 'Emergency Services', cta: 'Read Case Study', ctaIcon: ArrowRight,
  },
  // Guides & Reports
  {
    id: 13, category: 'guides',
    title: '2026 State of Enterprise Drone Programs Report',
    description: 'Annual survey of 500+ enterprise drone programs covering fleet size, ROI, compliance challenges, and technology adoption.',
    date: 'Jan 2026', meta: '45 pages | Report', cta: 'Download Report', ctaIcon: Download,
  },
  {
    id: 14, category: 'guides',
    title: 'Drone Registration Guide: USA, Canada & Africa Compared',
    description: 'A side-by-side comparison of drone registration requirements across FAA, Transport Canada, and African aviation authorities.',
    date: 'Feb 2026', meta: '28 pages | Guide', cta: 'Download Guide', ctaIcon: Download,
  },
  {
    id: 15, category: 'guides',
    title: 'SOC 2 Compliance for UAS Operations: A Framework',
    description: 'A practical framework for achieving SOC 2 Type II compliance in commercial drone operations and fleet management.',
    date: 'Feb 2026', meta: '32 pages | Whitepaper', cta: 'Download Whitepaper', ctaIcon: Download,
  },
  {
    id: 16, category: 'guides',
    title: 'Remote ID Implementation Playbook',
    description: 'Step-by-step guide to implementing broadcast and network Remote ID across your drone fleet.',
    date: 'Mar 2026', meta: '20 pages | Playbook', cta: 'Download Playbook', ctaIcon: Download,
  },
  // Press Releases
  {
    id: 17, category: 'press',
    title: 'Sky Warden Receives FAA Approval as LAANC USS Provider',
    description: 'Sky Warden joins the select group of FAA-approved UAS Service Suppliers for Low Altitude Authorization and Notification.',
    date: 'Jan 2026', cta: 'Read Release', ctaIcon: ArrowRight,
  },
  {
    id: 18, category: 'press',
    title: 'Sky Warden Expands to 7 African Nations with NCAA Partnership',
    description: 'New partnerships with Nigerian Civil Aviation Authority and 6 additional African regulators enable continent-wide coverage.',
    date: 'Feb 2026', cta: 'Read Release', ctaIcon: ArrowRight,
  },
  {
    id: 19, category: 'press',
    title: 'Series A: Sky Warden Raises $12M to Scale Drone Airspace Platform',
    description: 'Funding will accelerate product development, expand African operations, and grow enterprise sales team.',
    date: 'Mar 2026', cta: 'Read Release', ctaIcon: ArrowRight,
  },
  // Regulatory Updates
  {
    id: 20, category: 'regulatory',
    title: 'FAA Updates Remote ID Requirements — What Changes for Operators',
    description: 'Summary of the latest FAA rule changes to 14 CFR Part 89, including new broadcast module standards and compliance timelines.',
    date: 'Mar 2026', meta: '4 min read', cta: 'Read Update', ctaIcon: ArrowRight,
  },
  {
    id: 21, category: 'regulatory',
    title: 'Transport Canada RPAS Framework Changes for 2026',
    description: 'Key updates to Canadian drone regulations including micro-drone exemptions and advanced operations categories.',
    date: 'Feb 2026', meta: '5 min read', cta: 'Read Update', ctaIcon: ArrowRight,
  },
  {
    id: 22, category: 'regulatory',
    title: 'NCAA Nigeria Drone Regulations: 2026 Update',
    description: 'Latest regulatory changes from the Nigerian Civil Aviation Authority affecting commercial drone operators.',
    date: 'Jan 2026', meta: '3 min read', cta: 'Read Update', ctaIcon: ArrowRight,
  },
];

export function ResourceHubPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let list = resources;
    if (activeCategory !== 'all') {
      list = list.filter((r) => r.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Resource Hub</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Guides, webinars, case studies, and insights to help you master drone operations
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 pl-11 pr-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 py-6 -mt-4 sticky top-0 z-10 bg-gray-50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                'rounded-full px-4 py-2 text-xs font-medium transition-colors border',
                activeCategory === cat.id
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured resource */}
        {activeCategory === 'all' && !searchQuery && (
          <div className="mb-8">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white p-8 md:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
              <div className="relative max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 text-blue-300 px-3 py-1 text-xs font-medium mb-4">
                  <Video size={12} />
                  Featured Webinar
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  FAA LAANC 2.0: What Operators Need to Know in 2026
                </h2>
                <p className="text-gray-300 text-sm mb-2">
                  Deep dive into the latest LAANC system updates, new USS requirements, and how Sky Warden simplifies authorization workflows.
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Mar 15, 2026</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> 60 min</span>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Play size={14} />
                  Watch On-Demand
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resource grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">No resources found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {filtered.map((resource) => {
              const badge = categoryBadge[resource.category];
              const CtaIcon = resource.ctaIcon;
              return (
                <div
                  key={resource.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                >
                  {badge && (
                    <span className={clsx('self-start rounded-full px-2.5 py-0.5 text-[10px] font-semibold mb-3', badge.bg)}>
                      {badge.text}
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 flex-1 leading-relaxed">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {resource.date}
                      </span>
                      {resource.meta && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {resource.meta}
                        </span>
                      )}
                    </div>
                    <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
                      {resource.cta} <CtaIcon size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Mail size={32} className="mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Stay Informed</h2>
          <p className="text-gray-400 text-sm mb-6">
            Get the latest drone industry insights, regulatory updates, and Sky Warden news delivered to your inbox.
          </p>
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-amber-400 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Join 5,000+ drone professionals. Unsubscribe anytime.</p>
        </div>
      </div>
    </div>
  );
}
