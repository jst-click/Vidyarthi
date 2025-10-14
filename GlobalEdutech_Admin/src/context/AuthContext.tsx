import React, { createContext, useContext, useMemo, useState } from 'react';

export type AuthUser = {
  username: string;
  role: string;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean> | boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (username: string, password: string): boolean => {
    if (username === 'globaledutechlearn@gmail.com' && (password === 'Global@2025' || password === 'Amit1234')) {
      setIsAuthenticated(true);
      setUser({ username: 'globaledutechlearn@gmail.com', role: 'Administrator' });
      setToken('admin-token');
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated,
    user,
    token,
    login,
    logout,
  }), [isAuthenticated, user, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


