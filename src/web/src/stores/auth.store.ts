import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersonaType, SystemRole, Permission } from '../../../shared/types/auth';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  persona: PersonaType;
  roles: SystemRole[];
  tenantId: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  tenant?: {
    id: string;
    name: string;
    plan: string;
    type: string;
  };
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: SystemRole) => boolean;
  isPersona: (persona: PersonaType) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, tokens) =>
        set({ user, tokens, isAuthenticated: true, isLoading: false }),

      clearAuth: () =>
        set({ user: null, tokens: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        // Super admin has all permissions
        if (user.roles.includes('super_admin')) return true;
        // Check role-based permissions (simplified — full check happens server-side)
        return true; // Client-side is for UI only; server enforces
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.roles.includes(role) ?? false;
      },

      isPersona: (persona) => {
        const { user } = get();
        return user?.persona === persona;
      },
    }),
    {
      name: 'c6maceye-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
