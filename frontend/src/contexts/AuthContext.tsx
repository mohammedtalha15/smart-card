import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiFetch } from '../lib/api';

interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
  picture?: string;
  verified?: boolean;
  college?: string;
  vendor_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('artha_token'));

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem('artha_token');
      const userData = await apiFetch('/api/auth/me', { token: stored || undefined });
      setUser(userData);
      setToken(stored);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('artha_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('artha_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST', token: token || undefined });
    } catch {}
    localStorage.removeItem('artha_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
