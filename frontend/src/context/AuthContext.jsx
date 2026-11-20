import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('appcheck_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (api.token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('appcheck_user', JSON.stringify(profile));
        } catch (e) {
          console.warn('Initial session validation expired:', e.message);
          api.clearTokens();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    verifyAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await api.login(email, password, rememberMe);
    api.setTokens(res.access_token, res.refresh_token);
    setUser(res.user);
    localStorage.setItem('appcheck_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (fullName, email, password, termsAccepted) => {
    const res = await api.register(fullName, email, password, termsAccepted);
    api.setTokens(res.access_token, res.refresh_token);
    setUser(res.user);
    localStorage.setItem('appcheck_user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
      localStorage.setItem('appcheck_user', JSON.stringify(profile));
      return profile;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
