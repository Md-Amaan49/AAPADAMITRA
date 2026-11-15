import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roles: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ user: UserProfile }>;
  registerCitizen: (data: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check session on load
    const savedToken = sessionStorage.getItem('aapadamitra_access_token') || localStorage.getItem('aapadamitra_access_token');
    const savedUser = sessionStorage.getItem('aapadamitra_user') || localStorage.getItem('aapadamitra_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.removeItem('aapadamitra_access_token');
        localStorage.removeItem('aapadamitra_access_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join('. ')
          : (data.message || 'Authentication failed. Please verify your credentials.');
        throw new Error(errorMsg);
      }

      setToken(data.accessToken);
      setUser(data.user);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('aapadamitra_access_token', data.accessToken);
      storage.setItem('aapadamitra_user', JSON.stringify(data.user));

      return { user: data.user };
    } finally {
      setLoading(false);
    }
  };

  const registerCitizen = async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      const errorMessage = Array.isArray(resData.message)
        ? resData.message.join('. ')
        : (resData.message || 'Registration failed.');
      throw new Error(errorMessage);
    }
    return resData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('aapadamitra_access_token');
    sessionStorage.removeItem('aapadamitra_user');
    localStorage.removeItem('aapadamitra_access_token');
    localStorage.removeItem('aapadamitra_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        registerCitizen,
        logout,
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

