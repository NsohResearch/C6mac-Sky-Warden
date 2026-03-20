import { useState } from 'react';
import {
  Leaf, TreePine, Fuel, DollarSign, Award, TrendingUp, TrendingDown, BarChart2,
  Activity, Shield, ShieldCheck, Users, Heart, Scale, FileText, Download, Link2,
  Calendar, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight, CheckCircle,
  AlertTriangle, Eye, Car, Home, Zap, Droplets, Volume2, Bug, Briefcase,
  GraduationCap, Lock, ClipboardCheck, Globe, Star, Target, Lightbulb,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { CarbonFootprint, ESGReport, ESGStats } from '../../../shared/types/esg';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'carbon' | 'esg' | 'reports';
type PeriodFilter = 'month' | 'quarter' | 'year' | 'all';

// ─── Rating config ────────────────────────────────────────────────────────────
const ratingConfig: Record<string, { bg: string; text: string; border: string }> = {
  'A+': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'A': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  'B+': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
  'B': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  'C+': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  'C': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  'D': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  'F': { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-400' },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockMonthlyTrend: Array<{ month: string; co2Saved: number; flights: number; fuelSaved: number; costSaved: number }> = [
  { month: 'Apr 2025', co2Saved: 820, flights: 42, fuelSaved: 310, costSaved: 4200 },
  { month: 'May 2025', co2Saved: 950, flights: 48, fuelSaved: 360, costSaved: 4800 },
  { month: 'Jun 2025', co2Saved: 1100, flights: 55, fuelSaved: 415, costSaved: 5500 },
  { month: 'Jul 2025', co2Saved: 1280, flights: 62, fuelSaved: 485, costSaved: 6300 },
  { month: 'Aug 2025', co2Saved: 1150, flights: 58, fuelSaved: 435, costSaved: 5800 },
  { month: 'Sep 2025', co2Saved: 1320, flights: 65, fuelSaved: 500, costSaved: 6600 },
  { month: 'Oct 2025', co2Saved: 1450, flights: 70, fuelSaved: 548, costSaved: 7200 },
  { month: 'Nov 2025', co2Saved: 1380, flights: 68, fuelSaved: 522, costSaved: 6900 },
  { month: 'Dec 2025', co2Saved: 1200, flights: 60, fuelSaved: 454, costSaved: 6000 },
  { month: 'Jan 2026', co2Saved: 1550, flights: 75, fuelSaved: 586, costSaved: 7800 },
  { month: 'Feb 2026', co2Saved: 1680, flights: 82, fuelSaved: 635, costSaved: 8400 },
  { month: 'Mar 2026', co2Saved: 1820, flights: 88, fuelSaved: 688, costSaved: 9100 },
];

const mockCarbonFootprint: CarbonFootprint = {
  id: 'CF-001', tenantId: 'T1',
  period: { start: '2025-04-01', end: '2026-03-31', type: 'annual' },
  droneOperations: {
    totalFlights: 773, totalFlightHours: 1932, totalDistanceKm: 28980,
    energyConsumedKwh: 4830, co2EmissionsKg: 2415, emissionsPerFlightHour: 1.25,
  },
  traditionalAlternative: {
    method: 'helicopter', estimatedCo2Kg: 18115, estimatedFuelLiters: 6938,
    estimatedCost: 386500, estimatedTime: 3864,
  },
  savings: {
    co2SavedKg: 15700, co2SavedPercent: 86.7, fuelSavedLiters: 5938,
    costSaved: 289200, timeSavedHours: 1932,
  },
  carbonCredits: { earned: 15.7, value: 785, certified: true, standard: 'Gold Standard VER' },
  categories: [
    { missionType: 'Infrastructure Inspection', flights: 210, co2Kg: 655, savingsKg: 4260 },
    { missionType: 'Agricultural Survey', flights: 185, co2Kg: 578, savingsKg: 3760 },
    { missionType: 'Construction Mapping', flights: 142, co2Kg: 443, savingsKg: 2880 },
    { missionType: 'Environmental Monitoring', flights: 98, co2Kg: 306, savingsKg: 1990 },
    { missionType: 'Delivery Operations', flights: 78, co2Kg: 244, savingsKg: 1580 },
    { missionType: 'Security Patrol', flights: 60, co2Kg: 189, savingsKg: 1230 },
  ],
};

const mockESGReport: ESGReport = {
  id: 'ESG-2026-Q1', tenantId: 'T1', reportPeriod: 'Q1 2026',
  environmental: {
    totalCO2Saved: 5050, totalFuelSaved: 1909, noisePollutionReduction: 78,
    habitatDisturbance: 'minimal', wasteReduction: 42,
  },
  social: {
    safetyIncidentRate: 0.8, communityComplaints: 3, jobsCreated: 12,
    trainingHoursProvided: 480, diversityScore: 72,
  },
  governance: {
    complianceRate: 98.5, auditsPassed: 4, policiesUpdated: 6,
    dataBreaches: 0, transparencyScore: 91,
  },
  overallScore: 87,
  rating: 'A',
  benchmarkComparison: { industry: 62, peers: 74, own: 87 },
};

const mockReports: Array<{ id: string; period: string; score: number; rating: ESGReport['rating']; generatedAt: string; format: string }> = [
  { id: 'RPT-001', period: 'Q1 2026', score: 87, rating: 'A', generatedAt: '2026-03-15', format: 'PDF' },
  { id: 'RPT-002', period: 'Q4 2025', score: 84, rating: 'B+', generatedAt: '2025-12-31', format: 'PDF' },
  { id: 'RPT-003', period: 'Q3 2025', score: 79, rating: 'B+', generatedAt: '2025-09-30', format: 'PDF' },
  { id: 'RPT-004', period: 'Q2 2025', score: 72, rating: 'B', generatedAt: '2025-06-30', format: 'Excel' },
  { id: 'RPT-005', period: 'Annual 2025', score: 78, rating: 'B+', generatedAt: '2026-01-15', format: 'PDF' },
];

const mockESGStats: ESGStats = {
  totalCO2Saved: 15700,
  totalFuelSaved: 5938,
  totalCostSaved: 289200,
  carbonCreditsEarned: 15.7,
  overallESGScore: 87,
  esgRating: 'A',
  monthlyTrend: mockMonthlyTrend.map(m => ({ month: m.month, co2Saved: m.co2Saved, flights: m.flights })),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(0);
}

function co2ToTrees(kg: number): number { return Math.round(kg / 21.77); }
function co2ToCarMiles(kg: number): number { return Math.round(kg * 2.48); }
function co2ToHomes(kg: number): number { return Math.round(kg / 7300 * 12); }

// ─── Page Component ───────────────────────────────────────────────────────────
export function CarbonESGPage() {
  const [activeTab, setActiveTab] = useState<TabId>('carbon');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('year');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [reportPeriod, setReportPeriod] = useState('Q1 2026');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const tabs: { id: TabId; label: string; icon: typeof Leaf }[] = [
    { id: 'carbon', label: 'Carbon Savings', icon: Leaf },
    { id: 'esg', label: 'ESG Scorecard', icon: Award },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  // filter data by period
  const filteredTrend = (() => {
    switch (periodFilter) {
      case 'month': return mockMonthlyTrend.slice(-1);
      case 'quarter': return mockMonthlyTrend.slice(-3);
      case 'year': return mockMonthlyTrend;
      default: return mockMonthlyTrend;
    }
  })();

  const totalCO2 = filteredTrend.reduce((s, m) => s + m.co2Saved, 0);
  const totalFuel = filteredTrend.reduce((s, m) => s + m.fuelSaved, 0);
  const totalCost = filteredTrend.reduce((s, m) => s + m.costSaved, 0);
  const totalFlights = filteredTrend.reduce((s, m) => s + m.flights, 0);

  // ── Carbon Savings Tab ──
  function renderCarbonTab() {
    const maxCO2 = Math.max(...filteredTrend.map(m => m.co2Saved));
    const maxFlights = Math.max(...filteredTrend.map(m => m.flights));
    const cat = mockCarbonFootprint.categories;
    const maxCatSavings = Math.max(...cat.map(c => c.savingsKg));

    return (
      <div className="space-y-4">
        {/* Period selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Period:</span>
          {(['month', 'quarter', 'year', 'all'] as PeriodFilter[]).map(p => (
            <button key={p} onClick={() => setPeriodFilter(p)} className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', periodFilter === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
              {p === 'month' ? 'This Month' : p === 'quarter' ? 'Quarter' : p === 'year' ? 'Year' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
            <div className="flex items-center gap-2 text-sm text-green-600 mb-1"><Leaf className="w-4 h-4" /> CO2 Saved</div>
            <div className="text-3xl font-bold text-green-700">{formatNumber(totalCO2)} <span className="text-sm font-normal">kg</span></div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600"><ArrowUpRight className="w-3 h-3" /> {mockCarbonFootprint.savings.co2SavedPercent}% vs traditional</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-1"><Fuel className="w-4 h-4" /> Fuel Saved</div>
            <div className="text-3xl font-bold text-blue-700">{formatNumber(totalFuel)} <span className="text-sm font-normal">L</span></div>
            <div className="flex items-center gap-1 mt-1 text-xs text-blue-600"><Droplets className="w-3 h-3" /> Aviation/diesel fuel avoided</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200 p-4">
            <div className="flex items-center gap-2 text-sm text-amber-600 mb-1"><DollarSign className="w-4 h-4" /> Cost Saved</div>
            <div className="text-3xl font-bold text-amber-700">${formatNumber(totalCost)}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600"><TrendingUp className="w-3 h-3" /> Operational savings</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200 p-4">
            <div className="flex items-center gap-2 text-sm text-purple-600 mb-1"><Award className="w-4 h-4" /> Carbon Credits</div>
            <div className="text-3xl font-bold text-purple-700">{mockCarbonFootprint.carbonCredits?.earned ?? 0}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-purple-600"><CheckCircle className="w-3 h-3" /> {mockCarbonFootprint.carbonCredits?.standard}</div>
          </div>
        </div>

        {/* Equivalent to */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-green-500" /> Environmental Equivalents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
              <TreePine className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{co2ToTrees(totalCO2)}</div>
                <div className="text-xs text-green-600">Trees planted equivalent</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">{formatNumber(co2ToCarMiles(totalCO2))}</div>
                <div className="text-xs text-blue-600">Car miles avoided</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-3">
              <Home className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-amber-700">{co2ToHomes(totalCO2)}</div>
                <div className="text-xs text-amber-600">Homes powered (months)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly trend chart */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-green-500" /> Monthly CO2 Savings &amp; Flight Activity</h3>
          <div className="flex items-end gap-1 h-48">
            {filteredTrend.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                <span className="text-[10px] text-gray-400">{m.co2Saved > 0 ? m.co2Saved : ''}</span>
                <div className="w-full flex gap-0.5">
                  {/* CO2 bar */}
                  <div className="flex-1 bg-green-400 rounded-t opacity-80" style={{ height: `${maxCO2 > 0 ? (m.co2Saved / maxCO2) * 140 : 0}px`, minHeight: m.co2Saved > 0 ? '4px' : '0' }} />
                  {/* Flights bar */}
                  <div className="flex-1 bg-blue-400 rounded-t opacity-60" style={{ height: `${maxFlights > 0 ? (m.flights / maxFlights) * 140 : 0}px`, minHeight: m.flights > 0 ? '4px' : '0' }} />
                </div>
                <span className="text-[9px] text-gray-400 -rotate-45 origin-top-left translate-y-3">{m.month.slice(0, 3)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" /> CO2 Saved (kg)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded" /> Flights</span>
          </div>
        </div>

        {/* Comparison panel */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Scale className="w-4 h-4 text-indigo-500" /> Drone Operations vs Traditional Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1"><Leaf className="w-4 h-4" /> Drone Operations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">CO2 Emissions</span><span className="font-semibold text-green-700">{formatNumber(mockCarbonFootprint.droneOperations.co2EmissionsKg)} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Energy Used</span><span className="font-semibold text-green-700">{formatNumber(mockCarbonFootprint.droneOperations.energyConsumedKwh)} kWh</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Flight Hours</span><span className="font-semibold text-green-700">{formatNumber(mockCarbonFootprint.droneOperations.totalFlightHours)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Total Flights</span><span className="font-semibold text-green-700">{mockCarbonFootprint.droneOperations.totalFlights}</span></div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Traditional ({mockCarbonFootprint.traditionalAlternative.method.replace('_', ' ')})</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">CO2 Emissions</span><span className="font-semibold text-red-700">{formatNumber(mockCarbonFootprint.traditionalAlternative.estimatedCo2Kg)} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Fuel Consumed</span><span className="font-semibold text-red-700">{formatNumber(mockCarbonFootprint.traditionalAlternative.estimatedFuelLiters)} L</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Estimated Cost</span><span className="font-semibold text-red-700">${formatNumber(mockCarbonFootprint.traditionalAlternative.estimatedCost)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Estimated Time</span><span className="font-semibold text-red-700">{formatNumber(mockCarbonFootprint.traditionalAlternative.estimatedTime)} hrs</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown by mission type */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-green-500" /> Savings by Mission Type</h3>
          <div className="space-y-3">
            {cat.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-44 truncate">{c.missionType}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(c.savingsKg / maxCatSavings) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">{c.flights} flights</span>
                <span className="text-xs font-semibold text-green-700 w-20 text-right">{formatNumber(c.savingsKg)} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ESG Scorecard Tab ──
  function renderESGTab() {
    const report = mockESGReport;
    const ratCfg = ratingConfig[report.rating] ?? ratingConfig['C'];

    const envItems = [
      { label: 'CO2 Saved', value: `${formatNumber(report.environmental.totalCO2Saved)} kg`, score: 92, icon: Leaf },
      { label: 'Fuel Saved', value: `${formatNumber(report.environmental.totalFuelSaved)} L`, score: 88, icon: Fuel },
      { label: 'Noise Reduction', value: `${report.environmental.noisePollutionReduction}%`, score: 78, icon: Volume2 },
      { label: 'Habitat Impact', value: report.environmental.habitatDisturbance, score: 95, icon: Bug },
      { label: 'Waste Reduction', value: `${report.environmental.wasteReduction}%`, score: 72, icon: Droplets },
    ];

    const socItems = [
      { label: 'Safety Incident Rate', value: `${report.social.safetyIncidentRate}/100 flights`, score: 85, icon: Shield },
      { label: 'Community Complaints', value: `${report.social.communityComplaints}`, score: 90, icon: Users },
      { label: 'Jobs Created', value: `${report.social.jobsCreated}`, score: 80, icon: Briefcase },
      { label: 'Training Hours', value: `${report.social.trainingHoursProvided}`, score: 88, icon: GraduationCap },
      { label: 'Diversity Score', value: `${report.social.diversityScore}%`, score: 72, icon: Heart },
    ];

    const govItems = [
      { label: 'Compliance Rate', value: `${report.governance.complianceRate}%`, score: 98, icon: ShieldCheck },
      { label: 'Audits Passed', value: `${report.governance.auditsPassed}`, score: 100, icon: ClipboardCheck },
      { label: 'Policies Updated', value: `${report.governance.policiesUpdated}`, score: 85, icon: FileText },
      { label: 'Data Breaches', value: `${report.governance.dataBreaches}`, score: 100, icon: Lock },
      { label: 'Transparency', value: `${report.governance.transparencyScore}%`, score: 91, icon: Eye },
    ];

    const envAvg = Math.round(envItems.reduce((s, i) => s + i.score, 0) / envItems.length);
    const socAvg = Math.round(socItems.reduce((s, i) => s + i.score, 0) / socItems.length);
    const govAvg = Math.round(govItems.reduce((s, i) => s + i.score, 0) / govItems.length);

    const recommendations = [
      { priority: 'high', text: 'Increase diversity hiring pipeline to improve social pillar score' },
      { priority: 'medium', text: 'Implement waste tracking program for battery disposal and recycling' },
      { priority: 'medium', text: 'Expand noise monitoring program to cover all operational zones' },
      { priority: 'low', text: 'Publish quarterly transparency reports to boost governance score' },
    ];

    function renderPillarSection(title: string, items: typeof envItems, avg: number, color: string, Icon: typeof Leaf) {
      return (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Icon className={clsx('w-4 h-4', color)} /> {title}</h3>
            <div className={clsx('text-lg font-bold', avg >= 85 ? 'text-green-600' : avg >= 70 ? 'text-amber-600' : 'text-red-600')}>{avg}/100</div>
          </div>
          <div className="space-y-2.5">
            {items.map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <ItemIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 w-36 truncate">{item.label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', item.score >= 85 ? 'bg-green-500' : item.score >= 70 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${item.score}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">{item.value}</span>
                  <span className={clsx('text-xs font-semibold w-8 text-right', item.score >= 85 ? 'text-green-600' : item.score >= 70 ? 'text-amber-600' : 'text-red-600')}>{item.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Overall score */}
        <div className="bg-white rounded-lg border p-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <div>
              <div className="text-6xl font-bold text-gray-900">{report.overallScore}</div>
              <div className="text-sm text-gray-500 mt-1">Overall ESG Score</div>
            </div>
            <div className={clsx('px-4 py-2 rounded-lg text-2xl font-bold border', ratCfg.bg, ratCfg.text, ratCfg.border)}>
              {report.rating}
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <span className="text-gray-500">Period: <span className="font-medium text-gray-700">{report.reportPeriod}</span></span>
            <span className="flex items-center gap-1 text-green-600"><TrendingUp className="w-4 h-4" /> +3 pts from last quarter</span>
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderPillarSection('Environmental', envItems, envAvg, 'text-green-500', Leaf)}
          {renderPillarSection('Social', socItems, socAvg, 'text-blue-500', Users)}
          {renderPillarSection('Governance', govItems, govAvg, 'text-purple-500', Shield)}
        </div>

        {/* Benchmark comparison */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-500" /> Benchmark Comparison</h3>
          <div className="space-y-3">
            {[
              { label: 'Your Score', value: report.benchmarkComparison.own, color: 'bg-blue-500' },
              { label: 'Peer Average', value: report.benchmarkComparison.peers, color: 'bg-gray-400' },
              { label: 'Industry Average', value: report.benchmarkComparison.industry, color: 'bg-gray-300' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-32">{b.label}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div className={clsx('h-full rounded-full flex items-center justify-end pr-2', b.color)} style={{ width: `${b.value}%` }}>
                    <span className="text-[10px] font-bold text-white">{b.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement recommendations */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Improvement Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                <span className={clsx('px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 mt-0.5', r.priority === 'high' ? 'bg-red-100 text-red-700' : r.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                  {r.priority}
                </span>
                <span className="text-sm text-gray-700">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Reports Tab ──
  function renderReportsTab() {
    const report = mockESGReport;

    return (
      <div className="space-y-4">
        {/* Generate report form */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Generate New Report</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Report Period</label>
              <select value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Q1 2026</option>
                <option>Q4 2025</option>
                <option>Q3 2025</option>
                <option>Q2 2025</option>
                <option>Annual 2025</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Format</label>
              <select value={reportFormat} onChange={e => setReportFormat(e.target.value as 'pdf' | 'excel')} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" /> Generate Report
            </button>
          </div>
        </div>

        {/* Report preview */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-green-500" /> Report Preview — {report.reportPeriod}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg border border-green-200 p-3">
              <h4 className="text-xs font-semibold text-green-700 uppercase mb-2 flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> Environmental</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-600">CO2 Saved</span><span className="font-semibold text-green-700">{formatNumber(report.environmental.totalCO2Saved)} kg</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Fuel Saved</span><span className="font-semibold text-green-700">{formatNumber(report.environmental.totalFuelSaved)} L</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Noise Reduction</span><span className="font-semibold text-green-700">{report.environmental.noisePollutionReduction}%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Habitat Impact</span><span className="font-semibold text-green-700 capitalize">{report.environmental.habitatDisturbance}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Waste Reduction</span><span className="font-semibold text-green-700">{report.environmental.wasteReduction}%</span></div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
              <h4 className="text-xs font-semibold text-blue-700 uppercase mb-2 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Social</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-600">Safety Rate</span><span className="font-semibold text-blue-700">{report.social.safetyIncidentRate}/100</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Complaints</span><span className="font-semibold text-blue-700">{report.social.communityComplaints}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Jobs Created</span><span className="font-semibold text-blue-700">{report.social.jobsCreated}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Training Hours</span><span className="font-semibold text-blue-700">{report.social.trainingHoursProvided}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Diversity</span><span className="font-semibold text-blue-700">{report.social.diversityScore}%</span></div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-3">
              <h4 className="text-xs font-semibold text-purple-700 uppercase mb-2 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Governance</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-600">Compliance</span><span className="font-semibold text-purple-700">{report.governance.complianceRate}%</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Audits Passed</span><span className="font-semibold text-purple-700">{report.governance.auditsPassed}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Policies Updated</span><span className="font-semibold text-purple-700">{report.governance.policiesUpdated}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Data Breaches</span><span className="font-semibold text-purple-700">{report.governance.dataBreaches}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Transparency</span><span className="font-semibold text-purple-700">{report.governance.transparencyScore}%</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Shareable link */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Link2 className="w-4 h-4 text-indigo-500" /> Shareable Report Link</h3>
          <div className="flex items-center gap-2">
            <input type="text" readOnly value="https://app.c6maceye.com/reports/esg/ESG-2026-Q1?token=sk_rpt_..." className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600 font-mono" />
            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1">
              <Link2 className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </div>

        {/* Reports table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-500" /> Generated Reports</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Report</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Period</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Score</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Format</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Generated</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockReports.map(rpt => {
                const rCfg = ratingConfig[rpt.rating] ?? ratingConfig['C'];
                return (
                  <tr key={rpt.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{rpt.id}</td>
                    <td className="px-4 py-3 text-gray-700">{rpt.period}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{rpt.score}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-bold', rCfg.bg, rCfg.text)}>{rpt.rating}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{rpt.format}</td>
                    <td className="px-4 py-3 text-gray-500">{rpt.generatedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Share"><Link2 className="w-4 h-4" /></button>
                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Preview"><Eye className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Leaf className="w-7 h-7 text-green-600" /> Carbon &amp; ESG</h1>
          <p className="text-sm text-gray-500 mt-1">Carbon footprint tracking, environmental savings, and ESG compliance reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={clsx('px-3 py-1.5 rounded-full text-xs font-bold border', ratingConfig[mockESGStats.esgRating]?.bg, ratingConfig[mockESGStats.esgRating]?.text, ratingConfig[mockESGStats.esgRating]?.border)}>
            ESG: {mockESGStats.esgRating}
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'carbon' && renderCarbonTab()}
      {activeTab === 'esg' && renderESGTab()}
      {activeTab === 'reports' && renderReportsTab()}
    </div>
  );
}
