import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/httpClient';
import type { AuthResponseDto, Rol } from '../api/types';
import { clearToken, getToken, setToken as persistToken } from '../api/tokenStorage';

export interface AuthUser {
  email: string;
  rol: Rol;
}

interface StoredUser extends AuthUser {
  expiraEn: string;
}

const USER_KEY = 'ligafutbol_user';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredUser;
    if (new Date(parsed.expiraEn).getTime() <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredUser();
    if (stored && getToken()) {
      setUser({ email: stored.email, rol: stored.rol });
    } else {
      clearToken();
      localStorage.removeItem(USER_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponseDto>('/api/auth/login', { email, password });
    persistToken(response.token);
    const stored: StoredUser = { email: response.email, rol: response.rol, expiraEn: response.expiraEn };
    localStorage.setItem(USER_KEY, JSON.stringify(stored));
    setUser({ email: stored.email, rol: stored.rol });
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return ctx;
}
