import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { initiateSocketConnection, disconnectSocket } from '../services/socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pricova_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pricova_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('pricova_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('pricova_user', JSON.stringify(res.data.user));
            initiateSocketConnection(storedToken);
          }
        } catch (error) {
          console.warn('Session verification failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      disconnectSocket();
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('pricova_token', newToken);
      localStorage.setItem('pricova_user', JSON.stringify(newUser));
      initiateSocketConnection(newToken);
      return newUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('pricova_token', newToken);
      localStorage.setItem('pricova_user', JSON.stringify(newUser));
      initiateSocketConnection(newToken);
      return newUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pricova_token');
    localStorage.removeItem('pricova_user');
    disconnectSocket();
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
