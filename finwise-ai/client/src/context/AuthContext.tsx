import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; currency?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateApiKey: (key: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('finwise_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem('finwise_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('finwise_token', res.token);
    localStorage.setItem('finwise_user', JSON.stringify(res.user));
  };

  const register = async (data: { email: string; password: string; name: string; currency?: string }) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('finwise_token', res.token);
    localStorage.setItem('finwise_user', JSON.stringify(res.user));
  };

  const demoLogin = async () => {
    const res = await authApi.demoLogin();
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('finwise_token', res.token);
    localStorage.setItem('finwise_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('finwise_token');
    localStorage.removeItem('finwise_user');
  };

  const updateApiKey = async (key: string) => {
    const res = await authApi.updateApiKey(key);
    if (user) {
      const updated = { ...user, hasCustomApiKey: res.hasCustomApiKey };
      setUser(updated);
      localStorage.setItem('finwise_user', JSON.stringify(updated));
    }
  };

  const refreshUser = async () => {
    if (token) {
      const userData = await authApi.getMe();
      setUser(userData);
      localStorage.setItem('finwise_user', JSON.stringify(userData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateApiKey,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
