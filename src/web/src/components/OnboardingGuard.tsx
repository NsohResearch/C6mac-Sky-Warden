import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, X, Shield, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

// Mock data for expiration warnings
const mockAlerts = {
  droneExpiringSoon: true,
  droneExpiringDDID: 'SKW-US-T5N8R1',
  droneExpiringDate: '2026-04-10',
  certExpiringSoon: false,
  certExpiringDate: '',
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    setOnboardingCompleted(completed);
  }, []);

  // Still loading
  if (onboardingCompleted === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  // Not completed — redirect to onboarding
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // Completed — render children with optional warning banners
  return (
    <>
      {/* Expiration warning banner */}
      {!bannerDismissed && mockAlerts.droneExpiringSoon && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Drone registration expiring soon
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {mockAlerts.droneExpiringDDID} expires on {mockAlerts.droneExpiringDate}.{' '}
                  <a href="/dashboard/registration" className="underline font-medium hover:text-amber-800">
                    Renew now
                  </a>
                </p>
              </div>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-400 hover:text-amber-600 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {!bannerDismissed && mockAlerts.certExpiringSoon && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Pilot certification expiring soon
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  Your certification expires on {mockAlerts.certExpiringDate}.{' '}
                  <a href="/dashboard/compliance" className="underline font-medium hover:text-red-800">
                    Update certification
                  </a>
                </p>
              </div>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
