import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API client setup
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Log response/error for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists and fetch user data
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Attempting to load user data...');
        const res = await api.get('/auth/me');
        console.log('User data received:', res.data);
        setUser({
          id: res.data._id,
          email: res.data.email,
          role: res.data.role,
          created_at: res.data.created_at
        });
      } catch (err) {
        // Clear invalid token
        localStorage.removeItem('token');
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to login with API:', `${api.defaults.baseURL}/auth/login`);
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Fetch user details
      console.log('Fetching user details...');
      const userRes = await api.get('/auth/me');
      console.log('User details:', userRes.data);
      
      setUser({
        id: userRes.data._id,
        email: userRes.data.email,
        role: userRes.data.role,
        created_at: userRes.data.created_at
      });
    } catch (err) {
      console.error('Login error details:', err);
      throw new Error('Invalid credentials');
    }
  };

  const signOut = async () => {
    // Clear token and user state
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export API client for use in other components
export { api };