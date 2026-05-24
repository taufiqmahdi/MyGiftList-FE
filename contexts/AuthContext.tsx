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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      // Ensure the SSR cookie is in sync
      document.cookie = `mgl_token=${storedToken}; path=/; SameSite=Lax`;
      setToken(storedToken);
      authApi
        .me()
        .then((data) => {
          // API might return { user: {...} } or the user object directly
          const u = (data as unknown as { user: User }).user ?? (data as User);
          setUser(u);
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Sync token to a cookie so middleware can read it server-side
  function setTokenCookie(value: string | null) {
    if (value) {
      document.cookie = `mgl_token=${value}; path=/; SameSite=Lax`;
    } else {
      document.cookie = 'mgl_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  const hydrateFromResponse = useCallback((res: LoginResponse) => {
    const accessToken = res.access_token ?? res.token ?? '';
    localStorage.setItem('access_token', accessToken);
    setTokenCookie(accessToken);
    setToken(accessToken);
    setUser(res.user);
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
