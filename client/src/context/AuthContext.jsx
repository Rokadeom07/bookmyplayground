import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bmp_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('bmp_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('bmp_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async credentials => {
    const res = await authAPI.login(credentials);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bmp_token', res.data.token);
      localStorage.setItem('bmp_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const registerCustomer = async data => {
    const res = await authAPI.registerCustomer(data);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bmp_token', res.data.token);
      localStorage.setItem('bmp_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const registerOwner = async data => {
    const res = await authAPI.registerOwner(data);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bmp_token', res.data.token);
      localStorage.setItem('bmp_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bmp_token');
    localStorage.removeItem('bmp_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isOwner: user?.role === 'owner',
        isAdmin: user?.role === 'admin',
        loading,
        login,
        registerCustomer,
        registerOwner,
        logout,
      }}
    >
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
