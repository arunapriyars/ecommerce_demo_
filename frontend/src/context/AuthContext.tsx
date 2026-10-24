import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, favorite_vibe?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loginAsDemoCustomer: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('vibecart_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getProfile();
        setUser(data.user);
      } catch (err) {
        console.warn('Session expired or invalid, logging out.');
        localStorage.removeItem('vibecart_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('vibecart_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success(data.message || 'Welcome to VibeCart! ✨');
  };

  const register = async (name: string, email: string, password: string, favorite_vibe?: string) => {
    const data = await api.register({ name, email, password, favorite_vibe });
    localStorage.setItem('vibecart_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success(data.message || 'Account created successfully! ✨');
  };

  const logout = () => {
    localStorage.removeItem('vibecart_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out. See you next vibe! 👋');
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    toast.success('Profile updated successfully ✨');
  };

  const loginAsDemoCustomer = async () => {
    await login('user@vibecart.com', 'password123');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@vibecart.com', 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        updateProfile,
        loginAsDemoCustomer,
        loginAsDemoAdmin
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
