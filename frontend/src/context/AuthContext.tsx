import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/api/apiClient';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8000/api';

// Define the User interface
interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, username: string, password: string, password2: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<User>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tokens from localStorage
  const getStoredToken = (): string | null => localStorage.getItem('access_token');
  const getStoredRefreshToken = (): string | null => localStorage.getItem('refresh_token');

  // Store tokens in localStorage
  const storeTokens = (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    console.log("Login successful, storing tokens");
  };

  // Remove tokens from localStorage
  const removeTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // Clear all localStorage data when logging out
  const clearAllUserData = () => {
    // Clear auth tokens
    removeTokens();
    
    // Clear all color data
    localStorage.removeItem('incomeColors');
    localStorage.removeItem('expenseColors');
    
    // Clear goal transactions
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('goal_transactions_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear budget data
    localStorage.removeItem('budget_periods');
    keys.forEach(key => {
      if (key.startsWith('budget_items_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear any other user-specific data
    localStorage.removeItem('signupToastShown');
    
    console.log("Cleared all user data from localStorage during logout");
  };

  // Token operations
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (e) {
      return true;
    }
  };

  // Get a valid token, refreshing if necessary
  const getValidToken = async (): Promise<string | null> => {
    const token = getStoredToken();
    const refreshToken = getStoredRefreshToken();
    
    if (!token) return null;
    
    // If token is valid, return it
    if (!isTokenExpired(token)) {
      return token;
    }
    
    // If refresh token exists, try to refresh
    if (refreshToken) {
      try {
        const response = await apiClient.post('/token/refresh/', {
          refresh: refreshToken
        });
        
        if (response.data && response.data.access) {
          localStorage.setItem('access_token', response.data.access);
          return response.data.access;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear both tokens if refresh fails
        removeTokens();
      }
    }
    
    return null;
  };

  // Fetch user data from API
  const fetchUser = async (): Promise<User> => {
    try {
      // Get a valid token
      const token = await getValidToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Make API request with valid token
      const response = await apiClient.get('/user/');
      console.log("User data fetched successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      removeTokens();
      throw new Error(error.response?.data?.detail || 'Failed to fetch user data');
    }
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        console.log("Attempting login with:", credentials);
        const response = await apiClient.post('/token/', {
          email: credentials.email,
          password: credentials.password
        });
        
        if (response.data.access && response.data.refresh) {
          storeTokens(response.data.access, response.data.refresh);
          return response.data;
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error: any) {
        console.error("Login error:", error);
        const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Refetch user data and invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { 
      full_name: string; 
      email: string; 
      username: string; 
      password: string; 
      password2: string 
    }) => {
      try {
        const response = await apiClient.post('/register/', userData);
        return response.data;
      } catch (error: any) {
        console.error("Registration error:", error);
        const errorMessage = 
          error.response?.data?.email?.[0] ||
          error.response?.data?.username?.[0] ||
          error.response?.data?.password?.[0] ||
          error.response?.data?.detail ||
          'Registration failed. Please try again.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      // Navigate to login with success state
      navigate('/login', { 
        state: { 
          signupSuccess: true, 
          email: variables.email
        } 
      });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      clearAllUserData();
      // Optional: Call logout endpoint if you have one
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.removeQueries({ queryKey: ['user'] });
      navigate('/login');
    }
  });

  // Login function
  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  // Register function
  const register = async (fullName: string, email: string, username: string, password: string, password2: string) => {
    return registerMutation.mutateAsync({ 
      full_name: fullName, 
      email, 
      username, 
      password, 
      password2 
    });
  };

  // Logout function
  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Use TanStack Query to manage user state
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: !!getStoredToken(), // Only run if there's a token
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
    refetchOnWindowFocus: false
  });

  // Skip auth check on public routes
  useEffect(() => {
    const publicPaths = ['/login', '/signup', '/forgot-password'];
    if (publicPaths.some(path => location.pathname.includes(path))) {
      console.log(`Skipping auth check on public path: ${location.pathname}`);
      return;
    }
  }, [location.pathname]);

  const value: AuthContextType = {
    user: userData as User | null,
    loading: userLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,
    token: getStoredToken(),
    refreshToken: getStoredRefreshToken(),
    login, 
    register, 
    logout, 
    fetchUser,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the custom hook for using the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export all components and hooks
export { AuthContext, AuthProvider, useAuth };