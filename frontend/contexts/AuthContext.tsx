import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
  profile_pic?: string;
  preferences?: any;
  favorites?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Fetch user profile
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;
    await SecureStore.setItemAsync('authToken', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    const { token: newToken, user: newUser } = response.data;
    await SecureStore.setItemAsync('authToken', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      const response = await api.get('/auth/me');
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}