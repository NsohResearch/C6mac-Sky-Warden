import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { api, ApiError } from '../utils/api';
import { Plane, Building2, Building, Code2, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

type PersonaOption = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const personas: PersonaOption[] = [
  { id: 'individual_pilot', label: 'Individual Pilot', description: 'Recreational or Part 107 operator', icon: <Plane size={24} /> },
  { id: 'enterprise_manager', label: 'Enterprise UAS', description: 'Manage a fleet of drones and pilots', icon: <Building2 size={24} /> },
  { id: 'agency_representative', label: 'Airspace Agency', description: 'Local or airspace authority', icon: <Building size={24} /> },
  { id: 'developer', label: 'Developer', description: 'Build airspace or drone apps', icon: <Code2 size={24} /> },
];

export function RegisterPage() {
  const [step, setStep] = useState<'persona' | 'details'>('persona');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [form, setForm] = useState({ email: '', password: '', displayName: '', organizationName: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.post<any>('/auth/register', {
        ...form,
        persona: selectedPersona,
      });

      setAuth(result.data.user, result.data.tokens);
      toast.success('Account created! Welcome to C6macEye.');
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-xl text-white mb-3">
            C6
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your C6macEye account</h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'persona' ? 'How will you use C6macEye?' : 'Fill in your details'}
          </p>
        </div>

        {step === 'persona' ? (
          <div className="space-y-3">
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPersona(p.id);
                  setStep('details');
                }}
                className={clsx(
                  'w-full flex items-center gap-4 rounded-xl border-2 p-5 text-left transition',
                  selectedPersona === p.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  {p.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{p.label}</p>
                  <p className="text-sm text-gray-500">{p.description}</p>
                </div>
                {selectedPersona === p.id && <CheckCircle className="text-blue-600" size={20} />}
              </button>
            ))}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link>
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 rounded-xl bg-white border p-6">
            <button type="button" onClick={() => setStep('persona')} className="text-sm text-blue-600 hover:text-blue-700">
              &larr; Change persona
            </button>

            <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              {personas.find((p) => p.id === selectedPersona)?.icon}
              <span className="font-medium text-sm">{personas.find((p) => p.id === selectedPersona)?.label}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={12} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              <p className="mt-1 text-xs text-gray-500">Min 12 chars with uppercase, lowercase, number, and special character</p>
            </div>

            {(selectedPersona === 'enterprise_manager' || selectedPersona === 'agency_representative') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input type="text" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
