import { useState } from 'react';
import {
  Shield, Building2, Plane, Leaf, HardHat, Users, Globe,
  ArrowRight, Siren, Flame, Lock, Zap, Fuel, Mountain,
  Droplets, PlaneLanding, Ship, TrainFront, Car, Sprout,
  TreePine, Ruler, Camera, GraduationCap, Ticket, UserCheck,
  Heart, Binoculars, Wheat, Radio, ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

interface IndustryCard {
  icon: React.ElementType;
  name: string;
  description: string;
  features: string[];
}

interface IndustrySection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  cardBg: string;
  badgeColor: string;
  industries: IndustryCard[];
}

const sections: IndustrySection[] = [
  {
    id: 'public-sector',
    title: 'Public Sector',
    icon: Shield,
    color: 'text-blue-400',
    cardBg: 'bg-blue-950/30 border-blue-900/40',
    badgeColor: 'bg-blue-500/20 text-blue-300',
    industries: [
      {
        icon: Shield,
        name: 'Military & Government',
        description: 'Defense drone fleet management with tactical airspace deconfliction and classified operations support for government agencies.',
        features: ['Tactical airspace deconfliction', 'ITAR-compliant data handling', 'Classified operations support', 'Multi-agency coordination'],
      },
      {
        icon: Siren,
        name: 'Law Enforcement',
        description: 'Aerial surveillance management with evidence chain of custody and incident response coordination for police departments.',
        features: ['Evidence chain of custody', 'Incident response coordination', 'Body-cam-style flight logging', 'Court-ready audit trails'],
      },
      {
        icon: Flame,
        name: 'Emergency Services',
        description: 'Search and rescue fleet coordination with disaster response mapping, wildfire monitoring, and medical supply delivery tracking.',
        features: ['Search & rescue coordination', 'Disaster response mapping', 'Wildfire monitoring', 'Medical supply delivery'],
      },
      {
        icon: Lock,
        name: 'Correctional Facilities',
        description: 'Perimeter security drone patrols with contraband detection coordination and comprehensive incident documentation.',
        features: ['Perimeter security patrols', 'Contraband detection coordination', 'Incident documentation', 'Automated patrol scheduling'],
      },
    ],
  },
  {
    id: 'critical-infrastructure',
    title: 'Critical Infrastructure',
    icon: Building2,
    color: 'text-amber-400',
    cardBg: 'bg-amber-950/30 border-amber-900/40',
    badgeColor: 'bg-amber-500/20 text-amber-300',
    industries: [
      {
        icon: Zap,
        name: 'Utilities',
        description: 'Power line inspection fleet management with wind turbine surveys, solar farm monitoring, and pipeline surveillance.',
        features: ['Power line inspection fleets', 'Wind turbine surveys', 'Solar farm monitoring', 'Pipeline surveillance'],
      },
      {
        icon: Fuel,
        name: 'Oil & Gas',
        description: 'Offshore platform inspections, pipeline monitoring, refinery surveys with methane detection and hazardous area compliance.',
        features: ['Offshore platform inspections', 'Methane detection missions', 'Refinery surveys', 'Hazardous area compliance'],
      },
      {
        icon: Mountain,
        name: 'Mining',
        description: 'Stockpile measurement, pit surveys, and environmental monitoring with comprehensive safety compliance tracking.',
        features: ['Stockpile measurement', 'Pit surveys & mapping', 'Environmental monitoring', 'Safety compliance tracking'],
      },
      {
        icon: Droplets,
        name: 'Critical Infrastructure',
        description: 'Water treatment facility inspection, dam assessments, bridge surveys, and tunnel condition monitoring.',
        features: ['Water treatment inspections', 'Dam condition assessment', 'Bridge surveys', 'Tunnel assessments'],
      },
    ],
  },
  {
    id: 'transportation',
    title: 'Transportation & Aviation',
    icon: Plane,
    color: 'text-cyan-400',
    cardBg: 'bg-cyan-950/30 border-cyan-900/40',
    badgeColor: 'bg-cyan-500/20 text-cyan-300',
    industries: [
      {
        icon: PlaneLanding,
        name: 'Airports',
        description: 'Runway inspection, FOD detection, perimeter security, and wildlife management with native LAANC integration.',
        features: ['Runway & FOD inspection', 'Perimeter security', 'Wildlife management', 'LAANC integration'],
      },
      {
        icon: Ship,
        name: 'Ports & Maritime',
        description: 'Port security operations, vessel inspection, coastal surveillance, and customs enforcement drone coordination.',
        features: ['Port security operations', 'Vessel inspection', 'Coastal surveillance', 'Customs enforcement'],
      },
      {
        icon: TrainFront,
        name: 'Railways',
        description: 'Track inspection, signal assessment, vegetation management, and incident documentation for rail operators.',
        features: ['Track inspection', 'Signal assessment', 'Vegetation management', 'Incident documentation'],
      },
      {
        icon: Car,
        name: 'Highways & DOT',
        description: 'Traffic monitoring, bridge inspection, construction progress tracking, and accident reconstruction support.',
        features: ['Traffic monitoring', 'Bridge inspection', 'Construction progress', 'Accident reconstruction'],
      },
    ],
  },
  {
    id: 'agriculture',
    title: 'Agriculture & Environment',
    icon: Leaf,
    color: 'text-green-400',
    cardBg: 'bg-green-950/30 border-green-900/40',
    badgeColor: 'bg-green-500/20 text-green-300',
    industries: [
      {
        icon: Sprout,
        name: 'Precision Agriculture',
        description: 'Crop health monitoring, spraying fleet management, field mapping, and livestock tracking for modern farms.',
        features: ['Crop health monitoring', 'Spraying fleet management', 'Field mapping & analysis', 'Livestock tracking'],
      },
      {
        icon: Binoculars,
        name: 'Environmental Conservation',
        description: 'Wildlife surveys, deforestation monitoring, habitat mapping, and anti-poaching operations support.',
        features: ['Wildlife surveys', 'Deforestation monitoring', 'Habitat mapping', 'Anti-poaching operations'],
      },
      {
        icon: TreePine,
        name: 'Forestry',
        description: 'Forest inventory management, fire detection, and reforestation monitoring with aerial survey coordination.',
        features: ['Forest inventory', 'Fire detection', 'Reforestation monitoring', 'Aerial survey coordination'],
      },
    ],
  },
  {
    id: 'construction',
    title: 'Construction & Real Estate',
    icon: HardHat,
    color: 'text-orange-400',
    cardBg: 'bg-orange-950/30 border-orange-900/40',
    badgeColor: 'bg-orange-500/20 text-orange-300',
    industries: [
      {
        icon: Ruler,
        name: 'Construction',
        description: 'Site surveys, progress monitoring, volumetric measurements, and safety compliance with BIM integration support.',
        features: ['Site surveys & mapping', 'Progress monitoring', 'Volumetric measurements', 'BIM integration'],
      },
      {
        icon: Camera,
        name: 'Real Estate & Media',
        description: 'Property photography, virtual tours, commercial videography, and event coverage with compliant flight operations.',
        features: ['Property photography', 'Virtual tours', 'Commercial videography', 'Event coverage'],
      },
    ],
  },
  {
    id: 'events',
    title: 'Events & Large Venues',
    icon: Users,
    color: 'text-purple-400',
    cardBg: 'bg-purple-950/30 border-purple-900/40',
    badgeColor: 'bg-purple-500/20 text-purple-300',
    industries: [
      {
        icon: GraduationCap,
        name: 'Universities & Stadiums',
        description: 'Campus security, event airspace management, and research drone programs with institutional fleet oversight.',
        features: ['Campus security', 'Event airspace management', 'Research drone programs', 'Institutional oversight'],
      },
      {
        icon: Ticket,
        name: 'Large Events',
        description: 'Airspace lockdown coordination, security surveillance, and media drone management for major events.',
        features: ['Airspace lockdown coordination', 'Security surveillance', 'Media drone management', 'Crowd monitoring'],
      },
    ],
  },
  {
    id: 'corporate',
    title: 'Corporate & Executive Security',
    icon: Shield,
    color: 'text-slate-300',
    cardBg: 'bg-slate-800/40 border-slate-700/40',
    badgeColor: 'bg-slate-500/20 text-slate-300',
    industries: [
      {
        icon: UserCheck,
        name: 'Corporations & Executives',
        description: 'Corporate campus security, executive protection, asset monitoring, and counter-drone awareness programs.',
        features: ['Corporate campus security', 'Executive protection', 'Asset monitoring', 'Counter-drone awareness'],
      },
    ],
  },
  {
    id: 'africa',
    title: 'Africa-Specific Use Cases',
    icon: Globe,
    color: 'text-emerald-400',
    cardBg: 'bg-emerald-950/30 border-emerald-900/40',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
    industries: [
      {
        icon: Heart,
        name: 'Humanitarian & NGO',
        description: 'Aid delivery tracking, refugee camp mapping, and health supply logistics with WHO/UNICEF compliance support.',
        features: ['Aid delivery tracking', 'Refugee camp mapping', 'Health supply logistics', 'WHO/UNICEF compliance'],
      },
      {
        icon: Binoculars,
        name: 'Wildlife & Conservation',
        description: 'Anti-poaching aerial patrols, animal census operations, and park boundary monitoring across African reserves.',
        features: ['Anti-poaching patrols', 'Animal census operations', 'Park boundary monitoring', 'Ranger coordination'],
      },
      {
        icon: Wheat,
        name: 'Agriculture (Africa)',
        description: 'Smallholder farm mapping, crop insurance verification, and locust swarm monitoring across the continent.',
        features: ['Smallholder farm mapping', 'Crop insurance verification', 'Locust swarm monitoring', 'Mobile money integration'],
      },
      {
        icon: Radio,
        name: 'Infrastructure Development',
        description: 'Road construction monitoring, telecom tower inspection, and rural electrification surveys for developing regions.',
        features: ['Road construction monitoring', 'Telecom tower inspection', 'Rural electrification surveys', 'Progress reporting'],
      },
    ],
  },
];

export function IndustriesPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-blue-900/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Drone Solutions for Every Industry
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            From public safety to critical infrastructure, Sky Warden powers compliant drone operations across sectors worldwide
          </p>

          {/* Section jump links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                    activeSection === s.id
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  )}
                >
                  <Icon size={14} />
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Industry Sections */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          return (
            <section key={section.id} id={section.id} className="mt-16 scroll-mt-8">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-8">
                <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800', section.color)}>
                  <SectionIcon size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <span className={clsx('inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', section.badgeColor)}>
                    {section.industries.length} {section.industries.length === 1 ? 'industry' : 'industries'}
                  </span>
                </div>
              </div>

              {/* Industry cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.industries.map((industry) => {
                  const CardIcon = industry.icon;
                  return (
                    <div
                      key={industry.name}
                      className={clsx(
                        'rounded-xl border p-5 flex flex-col transition-all hover:scale-[1.02] hover:shadow-lg',
                        section.cardBg
                      )}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={clsx('flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800/80', section.color)}>
                          <CardIcon size={18} />
                        </div>
                        <h3 className="font-semibold text-sm">{industry.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-4 flex-1 leading-relaxed">
                        {industry.description}
                      </p>
                      <ul className="space-y-1.5 mb-4">
                        {industry.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                            <ChevronRight size={12} className={section.color} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button className={clsx('flex items-center gap-1 text-xs font-medium transition-colors', section.color, 'hover:underline')}>
                        Learn More <ArrowRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Don't see your industry?</h2>
          <p className="text-gray-400 mb-8 text-sm">
            Sky Warden adapts to any sector that needs compliant drone fleet management and airspace intelligence.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-amber-400 transition-colors">
              Contact Sales
            </button>
            <button className="rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium text-gray-200 hover:bg-gray-800 transition-colors">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
