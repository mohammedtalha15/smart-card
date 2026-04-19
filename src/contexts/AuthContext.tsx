'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, isConfigured } from '@/lib/auth';
import { getUser, createUser } from '@/lib/firestore';
import type { User } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  configured: false,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          let dbUser = await getUser(fbUser.uid);
          if (!dbUser) {
            const newUser: Omit<User, 'createdAt'> = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              email: fbUser.email || '',
              college: fbUser.email?.split('@')[1]?.split('.')[0]?.toUpperCase() || '',
              verified: true,
              role: 'student',
              blocked: false,
            };
            await createUser(newUser);
            dbUser = { ...newUser, createdAt: new Date().toISOString() };
          }
          setUser(dbUser);
        } catch (e) {
          console.error('Failed to load user profile', e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, configured: isConfigured, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
