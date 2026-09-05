import { useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/httpClient';
import type { AuthResponseDto } from '../api/types';
import { clearToken, getToken, setToken as persistToken } from '../api/tokenStorage';
import { AuthContext, type AuthUser } from './authContext.instance';

interface StoredUser extends AuthUser {
  expiraEn: string;
}

const USER_KEY = 'ligafutbol_user';

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

function resolveInitialUser(): AuthUser | null {
  const stored = readStoredUser();
  if (stored && getToken()) {
    return { email: stored.email, rol: stored.rol };
  }
  clearToken();
  localStorage.removeItem(USER_KEY);
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(resolveInitialUser);

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

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
