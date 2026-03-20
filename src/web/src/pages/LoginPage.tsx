import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { api, ApiError } from '../utils/api';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.post<any>('/auth/login', {
        email,
        password,
        ...(mfaRequired ? { mfaCode } : {}),
      });

      if (result.data?.mfaRequired) {
        setMfaRequired(true);
        toast.info('MFA code required');
        setLoading(false);
        return;
      }

      setAuth(result.data.user, result.data.tokens);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'MFA_REQUIRED') {
          setMfaRequired(true);
          toast.info('Enter your MFA code');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 font-bold text-xl backdrop-blur">
              C6
            </div>
            <div>
              <h1 className="text-2xl font-bold">C6macEye</h1>
              <p className="text-sm text-blue-200">Airspace Management Platform</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              FAA-Approved Drone<br />Airspace Platform
            </h2>
            <p className="mt-4 text-lg text-blue-200 max-w-md">
              One platform for B4UFLY checks, LAANC authorization, fleet management, and compliance.
              Built for individual pilots, enterprise UAS programs, and airspace agencies.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'B4UFLY Integration', desc: 'Real-time airspace checks' },
              { label: 'LAANC Authorization', desc: 'Near-real-time approval' },
              { label: 'Remote ID Tracking', desc: '14 CFR Part 89 compliant' },
              { label: 'SOC 2 / ISO 27001', desc: 'Enterprise-grade security' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-white/5 p-4 backdrop-blur">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="mt-1 text-xs text-blue-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-blue-400">
          &copy; {new Date().getFullYear()} C6macEye. FAA-Approved UAS Service Supplier.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <Shield className="text-blue-600" size={24} />
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                FAA Approved
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in to C6macEye</h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your airspace management dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="pilot@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mfaRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">MFA Code</label>
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-center tracking-[0.5em] font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="000000"
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
                Get started
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
