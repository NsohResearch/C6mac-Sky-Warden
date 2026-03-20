import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, FileText, Plane, ClipboardList, CheckCircle, ArrowRight,
  ArrowLeft, Upload, AlertTriangle, Shield, MapPin, Clock,
  ChevronDown, Globe, Phone, Mail, Building2, ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

type Country = 'US' | 'CA' | 'NG' | 'KE' | 'OTHER';

const countries: { code: Country; label: string; flag: string; authority: string }[] = [
  { code: 'US', label: 'United States', flag: '\u{1F1FA}\u{1F1F8}', authority: 'FAA' },
  { code: 'CA', label: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', authority: 'Transport Canada' },
  { code: 'NG', label: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', authority: 'NCAA' },
  { code: 'KE', label: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', authority: 'KCAA' },
  { code: 'OTHER', label: 'Other', flag: '\u{1F310}', authority: 'Local Authority' },
];

const manufacturers = ['DJI', 'Autel', 'Skydio', 'Parrot', 'Custom'];

const modelsByManufacturer: Record<string, string[]> = {
  DJI: ['Mavic 3 Enterprise', 'Mavic 3T Thermal', 'Matrice 350 RTK', 'Mini 4 Pro', 'Phantom 4 RTK'],
  Autel: ['EVO II Pro V3', 'EVO Max 4T', 'EVO Lite+', 'Dragonfish'],
  Skydio: ['X10', 'X2E', 'S2+'],
  Parrot: ['ANAFI Ai', 'ANAFI USA', 'ANAFI Thermal'],
  Custom: ['Custom Build'],
};

const weightCategories = [
  { value: 'micro', label: 'Micro (<250g)', description: 'No Remote ID required in some jurisdictions' },
  { value: 'small', label: 'Small (250g–25kg)', description: 'Standard registration required' },
  { value: 'medium', label: 'Medium (25–150kg)', description: 'Enhanced registration + inspection' },
  { value: 'large', label: 'Large (>150kg)', description: 'Special certification required' },
];

const registrationFees: Record<Country, { amount: string; currency: string; govShare: string; platformShare: string; authority: string }> = {
  US: { amount: '$5.00', currency: 'USD', govShare: '$3.50', platformShare: '$1.50', authority: 'FAA' },
  CA: { amount: 'CA$10.00', currency: 'CAD', govShare: 'CA$7.00', platformShare: 'CA$3.00', authority: 'Transport Canada' },
  NG: { amount: '\u{20A6}75,000', currency: 'NGN', govShare: '\u{20A6}52,500', platformShare: '\u{20A6}22,500', authority: 'NCAA' },
  KE: { amount: 'KSh 65,000', currency: 'KES', govShare: 'KSh 45,500', platformShare: 'KSh 19,500', authority: 'KCAA' },
  OTHER: { amount: '$10.00', currency: 'USD', govShare: '$7.00', platformShare: '$3.00', authority: 'Local Authority' },
};

const exampleWaypoints = [
  { type: 'Takeoff', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: '0', icon: '\u{1F6EB}' },
  { type: 'Waypoint', name: 'WP1', lat: '34.0530', lng: '-118.2420', alt: '200', icon: '\u{1F4CD}' },
  { type: 'Waypoint', name: 'WP2', lat: '34.0545', lng: '-118.2400', alt: '300', icon: '\u{1F4CD}' },
  { type: 'Landing', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: '0', icon: '\u{1F6EC}' },
];

const stepsMeta = [
  { label: 'Profile Setup', icon: User },
  { label: 'Pilot Certification', icon: FileText },
  { label: 'Drone Registration', icon: Plane },
  { label: 'File First Flight Plan', icon: ClipboardList },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(1);

  // Step 1 state
  const [selectedCountry, setSelectedCountry] = useState<Country>('US');
  const [selectedRole, setSelectedRole] = useState('individual_pilot');

  // Step 2 state
  const [certVerified, setCertVerified] = useState(false);
  const [certSkipped, setCertSkipped] = useState(false);

  // Step 3 state
  const [selectedManufacturer, setSelectedManufacturer] = useState('DJI');
  const [selectedModel, setSelectedModel] = useState('Mavic 3 Enterprise');
  const [selectedWeight, setSelectedWeight] = useState('small');
  const [droneRegistered, setDroneRegistered] = useState(false);
  const [generatedDDID, setGeneratedDDID] = useState('');

  // Step 4 state
  const [flightPlanFiled, setFlightPlanFiled] = useState(false);
  const [flightPlanSkipped, setFlightPlanSkipped] = useState(false);
  const [commLostAction, setCommLostAction] = useState('return_home');

  const countryObj = countries.find((c) => c.code === selectedCountry) ?? countries[0];
  const fee = registrationFees[selectedCountry];

  const handleVerifyCert = () => {
    setCertVerified(true);
    setCertSkipped(false);
  };

  const handleSkipCert = () => {
    setCertSkipped(true);
    setCertVerified(false);
  };

  const handleRegisterDrone = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    const prefix = selectedCountry === 'OTHER' ? 'XX' : selectedCountry;
    setGeneratedDDID(`SKW-${prefix}-${id}`);
    setDroneRegistered(true);
  };

  const handleFileFlightPlan = () => {
    setFlightPlanFiled(true);
  };

  const handleSkipFlightPlan = () => {
    setFlightPlanSkipped(true);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const goNext = () => {
    if (step === 4) {
      setStep(5);
    } else if (step < 4) {
      setStep((step + 1) as OnboardingStep);
    }
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as OnboardingStep);
  };

  // Completion screen
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border bg-white p-8 shadow-lg text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Ready to Fly!</h1>
            <p className="text-sm text-gray-500 mb-6">Your account is set up and you're cleared for operations.</p>

            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Profile verified</p>
                  <p className="text-xs text-gray-500">{countryObj.flag} {countryObj.label} &middot; {countryObj.authority}</p>
                </div>
              </div>

              <div className={clsx(
                'flex items-center gap-3 rounded-lg border p-3',
                certVerified ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
              )}>
                {certVerified ? (
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {certVerified ? 'Pilot certification verified' : 'Pilot certification skipped'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {certVerified ? 'Part 107 #P107-XXXXXXX' : 'Flights will be blocked until verified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Drone registered</p>
                  <p className="text-xs text-gray-500 font-mono">{generatedDDID || 'SKW-US-A7B3X9'}</p>
                </div>
              </div>

              <div className={clsx(
                'flex items-center gap-3 rounded-lg border p-3',
                flightPlanFiled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              )}>
                {flightPlanFiled ? (
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                ) : (
                  <ClipboardList size={18} className="text-gray-400 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {flightPlanFiled ? 'First flight plan filed' : 'Flight plan filing skipped'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {flightPlanFiled ? 'SKW-FP-2026-000001' : 'You can file plans from the dashboard'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors mb-4"
            >
              Enter Dashboard
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-blue-600">
              <button className="hover:underline">Register another drone</button>
              <span className="text-gray-300">|</span>
              <button className="hover:underline">File a flight plan</button>
              <span className="text-gray-300">|</span>
              <button className="hover:underline">Explore airspace map</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Top bar */}
      <div className="flex h-14 items-center gap-3 border-b bg-white px-6 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
          C6
        </div>
        <span className="font-semibold text-sm text-gray-900">C6macEye</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider ml-1">Onboarding</span>
      </div>

      {/* Progress bar */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center">
            {stepsMeta.map((s, i) => {
              const stepNum = (i + 1) as OnboardingStep;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex items-center gap-2">
                    <div
                      className={clsx(
                        'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 transition-colors',
                        isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isDone ? <CheckCircle size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={clsx('text-xs font-medium hidden md:block whitespace-nowrap', isActive ? 'text-gray-900' : isDone ? 'text-green-600' : 'text-gray-400')}>
                      {s.label}
                    </span>
                  </div>
                  {i < stepsMeta.length - 1 && (
                    <div className={clsx('flex-1 h-px mx-3', isDone ? 'bg-green-300' : 'bg-gray-200')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm">

            {/* Step 1: Profile Setup */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Setup</h2>
                  <p className="text-sm text-gray-500">Tell us about yourself so we can tailor your experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue="James Park" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" defaultValue="james.park@company.com" disabled className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" placeholder="+1 555 000 0000" className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Company or organization name" className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value as Country)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.label} ({c.authority})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" defaultValue="123 Aviation Blvd, San Francisco, CA 94105" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { value: 'individual_pilot', label: 'Individual Pilot', desc: 'Personal and recreational use' },
                      { value: 'enterprise_manager', label: 'Enterprise Manager', desc: 'Fleet and team management' },
                      { value: 'agency_representative', label: 'Agency Representative', desc: 'Government or regulatory body' },
                      { value: 'developer', label: 'Developer', desc: 'API access and integration' },
                    ]).map((role) => (
                      <label
                        key={role.value}
                        className={clsx(
                          'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                          selectedRole === role.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        )}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={selectedRole === role.value}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="h-4 w-4 text-blue-600 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{role.label}</p>
                          <p className="text-xs text-gray-500">{role.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pilot Certification */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Pilot Certification</h2>
                  <p className="text-sm text-gray-500">
                    Verify your pilot credentials for {countryObj.flag} {countryObj.label} ({countryObj.authority}).
                  </p>
                </div>

                {/* Country-specific certification fields */}
                {selectedCountry === 'US' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">FAA Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">Part 107 Remote Pilot Certificate + TRUST Completion Certificate</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Part 107 Certificate Number</label>
                        <input type="text" placeholder="e.g. 4376829" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" defaultValue="2028-06-15" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600" />
                      <span className="text-sm text-gray-700">I have completed the FAA TRUST (The Recreational UAS Safety Test)</span>
                    </label>
                  </div>
                )}

                {selectedCountry === 'CA' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">Transport Canada Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">Advanced or Basic RPAS Certificate + Pilot Certificate</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RPAS Certificate Type</label>
                        <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option>Advanced RPAS Certificate</option>
                          <option>Basic RPAS Certificate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                        <input type="text" placeholder="e.g. PC-RPAS-XXXXXXX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RPAS Pilot Certificate Number</label>
                        <input type="text" placeholder="Pilot certificate number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCountry === 'NG' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">NCAA Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">Remote Operator Certificate (ROC) + Pilot License</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NCAA ROC Number</label>
                        <input type="text" placeholder="e.g. NCAA-ROC-XXXXXXX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilot License Number</label>
                        <input type="text" placeholder="Pilot license number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCountry === 'KE' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">KCAA Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">KCAA Remote Pilot License</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">KCAA Remote Pilot License Number</label>
                        <input type="text" placeholder="e.g. KCAA-RPL-XXXXXXX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCountry === 'OTHER' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">International Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">Provide your pilot license details and issuing authority</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilot License Number</label>
                        <input type="text" placeholder="License number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                        <input type="text" placeholder="e.g. EASA, CASA, DGCA" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload zone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certification Documents</label>
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* Medical certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Certificate <span className="text-gray-400 font-normal">(if required)</span>
                  </label>
                  <input type="text" placeholder="Medical certificate number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                {/* Verify / Skip */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleVerifyCert}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                      certVerified
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {certVerified ? <CheckCircle size={16} /> : <Shield size={16} />}
                    {certVerified ? 'Verified' : 'Verify'}
                  </button>

                  {!certVerified && (
                    <button
                      onClick={handleSkipCert}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Skip for now
                    </button>
                  )}
                </div>

                {certSkipped && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-500" />
                      <p className="text-xs text-amber-700 font-medium">Warning: Flights will be blocked until certification is verified.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Register Your First Drone */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Register Your First Drone</h2>
                  <p className="text-sm text-gray-500">Register your drone to receive a Digital Drone ID (DDID).</p>
                </div>

                {!droneRegistered ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                        <select
                          value={selectedManufacturer}
                          onChange={(e) => {
                            setSelectedManufacturer(e.target.value);
                            setSelectedModel(modelsByManufacturer[e.target.value]?.[0] ?? '');
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {manufacturers.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {(modelsByManufacturer[selectedManufacturer] ?? []).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                        <input type="text" placeholder="e.g. 1ZNBJ4P00C0092" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remote ID Module Serial</label>
                        <input type="text" placeholder="If applicable" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight Category</label>
                      <div className="space-y-2">
                        {weightCategories.map((wc) => (
                          <label
                            key={wc.value}
                            className={clsx(
                              'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                              selectedWeight === wc.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                            )}
                          >
                            <input
                              type="radio"
                              name="weight"
                              value={wc.value}
                              checked={selectedWeight === wc.value}
                              onChange={(e) => setSelectedWeight(e.target.value)}
                              className="h-4 w-4 text-blue-600 mt-0.5"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{wc.label}</p>
                              <p className="text-xs text-gray-500">{wc.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Fee display */}
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Registration Fee</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Fee</span>
                          <span className="font-medium text-gray-900">{fee.amount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 pl-4">Government Portion (70%) &mdash; {fee.authority}</span>
                          <span className="text-gray-500">{fee.govShare}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 pl-4">Platform Processing (30%)</span>
                          <span className="text-gray-500">{fee.platformShare}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">
                        70% of your registration fee ({fee.govShare}) is remitted to {fee.authority} to support airspace safety and regulatory oversight.
                      </p>
                    </div>

                    <button
                      onClick={handleRegisterDrone}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <Shield size={16} />
                      Register & Pay
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Drone Registered!</h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedManufacturer} {selectedModel}</p>
                    </div>
                    <div className="rounded-lg border bg-gray-50 p-4 max-w-xs mx-auto">
                      <p className="text-xs text-gray-500 mb-1">Digital Drone ID</p>
                      <p className="text-2xl font-bold font-mono text-blue-600">{generatedDDID}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: File Your First Flight Plan */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">File Your First Flight Plan</h2>
                  <p className="text-sm text-gray-500">Get familiar with the flight planning process. This step is optional.</p>
                </div>

                {!flightPlanFiled && !flightPlanSkipped ? (
                  <>
                    {/* Map placeholder */}
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin size={28} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Map Preview</p>
                        <p className="text-xs text-gray-400">Click to place waypoints on the map</p>
                      </div>
                    </div>

                    {/* Waypoints */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Example Route Waypoints</label>
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lat</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lng</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Alt (ft AGL)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {exampleWaypoints.map((wp, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-400">{i}</td>
                                <td className="px-3 py-2 text-xs">{wp.icon} {wp.type}</td>
                                <td className="px-3 py-2 text-xs font-medium text-gray-900">{wp.name}</td>
                                <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.lat}</td>
                                <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.lng}</td>
                                <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.alt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Date/time pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Departure</label>
                        <input type="datetime-local" defaultValue="2026-03-25T09:00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Arrival</label>
                        <input type="datetime-local" defaultValue="2026-03-25T09:45" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>

                    <div className="rounded-lg border bg-gray-50 p-3 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Estimated duration: <span className="font-medium">45 minutes</span></span>
                    </div>

                    {/* Contingency */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Contingency Plan</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Communication Lost Action</label>
                          <select
                            value={commLostAction}
                            onChange={(e) => setCommLostAction(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="return_home">Return to Home</option>
                            <option value="land_immediately">Land Immediately</option>
                            <option value="hover">Hover in Place</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Emergency Contact Name</label>
                          <input type="text" placeholder="Name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Emergency Contact Phone</label>
                          <input type="tel" placeholder="+1 555 000 0000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Airspace check */}
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-800">Route clear</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1 ml-6">Class G airspace, no TFR conflicts</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleFileFlightPlan}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <Plane size={16} />
                        File Flight Plan
                      </button>
                      <button
                        onClick={handleSkipFlightPlan}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Skip for now
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">You can file plans from the dashboard later.</p>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto">
                      {flightPlanFiled ? (
                        <CheckCircle size={32} className="text-green-500" />
                      ) : (
                        <ClipboardList size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {flightPlanFiled ? 'Flight Plan Filed!' : 'Flight Plan Skipped'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {flightPlanFiled ? 'Flight Plan #SKW-FP-2026-000001' : 'You can file plans from the dashboard later.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                onClick={goBack}
                disabled={step === 1}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                )}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={goNext}
                disabled={step === 3 && !droneRegistered}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                  step === 3 && !droneRegistered
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {step === 4 ? 'Complete Setup' : 'Next'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
