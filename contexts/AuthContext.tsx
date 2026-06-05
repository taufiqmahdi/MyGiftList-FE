'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, User, LoginResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateFromResponse: (res: LoginResponse) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Sync token to a cookie so Next.js middleware can read it server-side
function setTokenCookie(value: string | null) {
  if (value) {
    document.cookie = `mgl_token=${value}; path=/; SameSite=Lax`;
  } else {
    document.cookie = 'mgl_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

/**
 * Safely extract the access token from whatever shape the API returns.
 * Common Laravel patterns:
 *   { access_token, user }           — Sanctum default
 *   { token, user }                  — custom
 *   { data: { access_token, user }}  — wrapped
 */
function extractToken(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const r = raw as Record<string, unknown>;

  // Unwrap { data: { ... } } if present
  const payload =
    r.data && typeof r.data === 'object'
      ? (r.data as Record<string, unknown>)
      : r;

  return (
    (payload.access_token as string) ??
    (payload.token as string) ??
    ''
  );
}

function extractUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const payload =
    r.data && typeof r.data === 'object'
      ? (r.data as Record<string, unknown>)
      : r;

  return (payload.user as User) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Re-hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      document.cookie = `mgl_token=${storedToken}; path=/; SameSite=Lax`;
      setToken(storedToken);
      authApi
        .me()
        .then((data) => {
          const u = extractUser(data) ?? (data as unknown as User);
          setUser(u);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          setTokenCookie(null);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const hydrateFromResponse = useCallback((res: LoginResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] login response:', res);
    }

    const accessToken = extractToken(res);

    if (!accessToken) {
      console.error(
        '[Auth] Token not found in response. Keys received:',
        Object.keys(res as object)
      );
      return;
    }

    const resolvedUser = extractUser(res);

    localStorage.setItem('access_token', accessToken);
    setTokenCookie(accessToken);
    setToken(accessToken);
    setUser(resolvedUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      hydrateFromResponse(res);
    },
    [hydrateFromResponse]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore server errors on logout
    }
    localStorage.removeItem('access_token');
    setTokenCookie(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        hydrateFromResponse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}