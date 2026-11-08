import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/websocket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('autodeal_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('autodeal_token');
      if (storedToken) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
          wsService.updateToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid token', err);
          localStorage.removeItem('autodeal_token');
          setToken(null);
          setUser(null);
          wsService.updateToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('autodeal_token', newToken);
    setToken(newToken);
    setUser(userData);
    wsService.updateToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('autodeal_token');
    setToken(null);
    setUser(null);
    wsService.updateToken(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
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
