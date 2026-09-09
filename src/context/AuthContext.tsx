import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
}

const DEMO_USERS: Record<string, User> = {
  Administrator: {
    id: 'usr-admin-01',
    username: 'admin',
    email: 'admin@bussense.ai',
    full_name: 'Chief Administrator',
    role: 'Administrator',
    is_active: true
  },
  'Transport Authority': {
    id: 'usr-trans-02',
    username: 'transport',
    email: 'transport@bussense.ai',
    full_name: 'Fleet Operations Director',
    role: 'Transport Authority',
    is_active: true
  },
  'Traffic Officer': {
    id: 'usr-traf-03',
    username: 'traffic',
    email: 'traffic@bussense.ai',
    full_name: 'Senior Traffic Controller',
    role: 'Traffic Officer',
    is_active: true
  },
  'Maintenance Officer': {
    id: 'usr-maint-04',
    username: 'maintenance',
    email: 'roads@bussense.ai',
    full_name: 'Civil Infrastructure Engineer',
    role: 'Maintenance Officer',
    is_active: true
  },
  Analyst: {
    id: 'usr-analyst-05',
    username: 'analyst',
    email: 'analyst@bussense.ai',
    full_name: 'Urban Intelligence Analyst',
    role: 'Analyst',
    is_active: true
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USERS['Administrator']);

  useEffect(() => {
    // Check if token or saved role exists
    const savedRole = localStorage.getItem('bussense_role') as User['role'] | null;
    if (savedRole && DEMO_USERS[savedRole]) {
      setUser(DEMO_USERS[savedRole]);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const data = await api.login(credentials);
      localStorage.setItem('bussense_token', data.access_token);
      setUser(data.user);
      localStorage.setItem('bussense_role', data.user.role);
    } catch (e) {
      // Fallback in demo mode
      const matched = Object.values(DEMO_USERS).find(u => u.username === credentials.username) || DEMO_USERS['Administrator'];
      setUser(matched);
      localStorage.setItem('bussense_role', matched.role);
    }
  };

  const logout = () => {
    localStorage.removeItem('bussense_token');
    localStorage.removeItem('bussense_role');
    setUser(null);
  };

  const switchRole = (role: User['role']) => {
    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role]);
      localStorage.setItem('bussense_role', role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
