import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('admin_token');
      const savedUser = localStorage.getItem('admin_user');
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setUser(parsedUser);
        setToken(savedToken);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      // Clear corrupted localStorage data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    try {
      // Normalize inputs: trim and convert to lowercase for email comparison
      const normalizedUsername = username.trim().toLowerCase();
      const normalizedPassword = password.trim();
      
      console.log('Login attempt:', { 
        normalizedUsername, 
        normalizedPassword, 
        expectedPassword: 'GlobalAdmin@2025',
        passwordMatch: normalizedPassword === 'GlobalAdmin@2025',
        usernameMatch: normalizedUsername === 'globaledutechlearn@gmail.com'
      });
      
      // Check credentials (case-sensitive for password)
      if (normalizedUsername === 'globaledutechlearn@gmail.com' && normalizedPassword === 'GlobalAdmin@2025') {
        console.log('Login successful');
        setIsAuthenticated(true);
        setUser({ username: 'globaledutechlearn@gmail.com', role: 'Administrator' });
        setToken('admin-token');
        // Store in localStorage for persistence
        localStorage.setItem('admin_token', 'admin-token');
        localStorage.setItem('admin_user', JSON.stringify({ username: 'globaledutechlearn@gmail.com', role: 'Administrator' }));
        return true;
      }
      console.warn('Login failed: Invalid credentials');
      return false;
    } catch (error) {
      console.error('Login function error:', error);
      return false;
    }
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    // Clear localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
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


