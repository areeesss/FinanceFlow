import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../api/authService";
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getCurrentUser,
  refreshToken as apiRefreshToken,
} from "../api/authService";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string, 
    email: string, 
    username: string, 
    password: string,
    password2: string // Added this
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const register = async (
    name: string, 
    email: string, 
    username: string, 
    password: string,
    password2: string // Added this
  ) => {
    try {
      setLoading(true);
      const { access, refresh, user } = await apiRegister({
        full_name: name,
        email,
        username,
        password,
        password2 // Added this
      });
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setUser(user);
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { access, refresh, user } = await apiLogin({ email, password });
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      setUser(user);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid email or password");
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("No refresh token found");

      const { access } = await apiRefreshToken({ refresh: refreshToken });
      localStorage.setItem("access_token", access);
      return access;
    } catch (error) {
      console.error("Token refresh failed, logging out:", error);
      await logout();
    }
  };

  const value = { 
    user, 
    login, 
    register, 
    logout, 
    refreshAccessToken, 
    loading 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };