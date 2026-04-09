import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { UsuarioPublico } from '../services/usuariosApi';

type AuthContextValue = {
  user: UsuarioPublico | null;
  signIn: (u: UsuarioPublico) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioPublico | null>(null);
  const signIn = useCallback((u: UsuarioPublico) => setUser(u), []);
  const signOut = useCallback(() => setUser(null), []);
  const value = useMemo(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
