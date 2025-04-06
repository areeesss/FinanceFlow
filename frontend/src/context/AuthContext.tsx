import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { userService } from "@/services/api";
import axios from "axios";

// Define the User interface
interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  register: (fullName: string, email: string, username: string, password: string, confirmPassword: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the custom hook for using the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Create the provider component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function for token expiration check and refresh
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (e) {
      console.error("Error checking token expiration:", e);
      return true; // Assume expired if we can't check
    }
  };

  // Function to refresh the token when needed
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      
      if (!refresh) {
        return false;
      }
      
      const response = await api.post('/token/refresh/', {
        refresh: refresh
      });
      
      if (response.data && response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  // Modified fetchUser function with token validation
  const fetchUser = async (): Promise<boolean> => {
    setLoading(true);
    try {
      // Check if token exists and is not expired
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return false;
      }
      
      // If token is expired, try to refresh it
      if (isTokenExpired(token)) {
        console.log("Token expired, attempting to refresh");
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          console.log("Token refresh failed, logging out");
          setUser(null);
          setLoading(false);
          return false;
        }
      }
      
      // Proceed with fetching user data
      const userResponse = await userService.getProfile();
      
      if (userResponse && userResponse.data) {
        console.log("User data fetched successfully:", userResponse.data);
        setUser(userResponse.data);
        setLoading(false);
        return true;
      } else {
        console.log("No user data received");
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    // Check auth status on initial load
    const checkAuth = async () => {
      setLoading(true);
      
      // Skip auth check on login, signup, and forgot password pages
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/signup', '/forgot-password', '/'];
      
      if (publicPaths.some(path => currentPath.startsWith(path))) {
        console.log("Skipping auth check on public path:", currentPath);
        setLoading(false);
        return;
      }

      const success = await fetchUser();
      if (!success) {
        // Only navigate if we're not already on a public path
        if (!publicPaths.some(path => currentPath.startsWith(path))) {
          navigate('/login');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      console.log("Attempting login with:", { email });
      const response = await api.post('/token/', {
        email,
        password
      });
      
      const { access, refresh } = response.data;
      
      if (access && refresh) {
        console.log("Login successful, storing tokens");
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Get user info with the new token
        try {
          const success = await fetchUser();
          if (success) {
            navigate('/dashboard');
          } else {
            throw new Error('Failed to get user profile');
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError('Login successful but failed to load user profile');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Response data:', error.response?.data);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Improved error message handling
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Failed to login. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    navigate("/login");
  };

  // Token refresh function to be used in the app
  const refreshAuth = async (): Promise<boolean> => {
    return await refreshToken();
  };

  // Create a new user account and default data
  const register = async (full_name: string, email: string, username: string, password: string, password2: string) => {
    try {
      setLoading(true);
      const response = await api.post('/signup/', {
        full_name,
        email,
        username,
        password,
        password2
      });
      
      console.log("Registration successful:", response.data);
      
      // Set initial colors for default income and expenses for a better UI experience
      // These will be randomly colored but they'll be consistent with our theme
      const incomeColors: Record<string, string> = {};
      const expenseColors: Record<string, string> = {};
      
      // Predefined blue shades for income
      const blueShades = ["#3B82F6", "#2563EB", "#1D4ED8"];
      
      // Predefined red shades for expenses
      const redShades = ["#EF4444", "#DC2626", "#B91C1C"];
      
      // Set colors for 3 default income sources
      for (let i = 1; i <= 3; i++) {
        incomeColors[i.toString()] = blueShades[i-1];
      }
      
      // Set colors for 3 default expense sources
      for (let i = 1; i <= 3; i++) {
        expenseColors[i.toString()] = redShades[i-1];
      }
      
      // Store in localStorage
      localStorage.setItem('incomeColors', JSON.stringify(incomeColors));
      localStorage.setItem('expenseColors', JSON.stringify(expenseColors));
      
      console.log("Set default colors:", { incomeColors, expenseColors });
      
      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        
        // Extract error messages from backend response
        if (error.response.data) {
          const serverErrors = error.response.data;
          let errorMessage = "";
          
          // Check for various error formats
          if (typeof serverErrors === 'string') {
            errorMessage = serverErrors;
          } else if (serverErrors.detail) {
            errorMessage = serverErrors.detail;
          } else if (serverErrors.non_field_errors) {
            errorMessage = serverErrors.non_field_errors.join(", ");
          } else {
            // Build error message from all fields
            Object.keys(serverErrors).forEach(key => {
              const fieldErrors = serverErrors[key];
              if (Array.isArray(fieldErrors)) {
                errorMessage += `${key}: ${fieldErrors.join(", ")}. `;
              } else {
                errorMessage += `${key}: ${fieldErrors}. `;
              }
            });
          }
          
          setError(errorMessage || "Registration failed. Please try again.");
          throw new Error(errorMessage || "Registration failed");
        }
      }
      setError("Registration failed. Please check your connection and try again.");
      throw new Error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      refreshAuth,
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export all components and hooks
export { AuthContext, AuthProvider, useAuth };