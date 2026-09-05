import { createContext } from 'react';
import type { Rol } from '../api/types';

export interface AuthUser {
  email: string;
  rol: Rol;
}

export interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
