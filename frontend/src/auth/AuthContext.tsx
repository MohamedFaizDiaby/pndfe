import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type Role = 'TRAVAILLEUR' | 'AGENCE' | 'ADMIN';

interface AuthState {
  token: string | null;
  role: Role | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('pndfe_token'),
    role: (localStorage.getItem('pndfe_role') as Role) || null,
  });

  const login = (token: string, role: Role) => {
    localStorage.setItem('pndfe_token', token);
    localStorage.setItem('pndfe_role', role);
    setState({ token, role });
  };

  const logout = () => {
    localStorage.removeItem('pndfe_token');
    localStorage.removeItem('pndfe_role');
    setState({ token: null, role: null });
  };

  const value = useMemo(() => ({ ...state, login, logout }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit etre utilise dans un AuthProvider');
  return ctx;
}
