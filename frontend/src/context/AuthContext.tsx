import { createContext, useContext, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); 

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Load authentication state from local storage
  const storedAuthState = localStorage.getItem('isAuthenticated');
  const [isAuthenticated, setIsAuthenticated] = useState(storedAuthState === 'true');

  const login = async (email: string, password: string) => { 
    // Save authentication state to local storage
    localStorage.setItem('isAuthenticated', 'true');

    console.log("Attempting login with:", email, password); // Debugging

    const response = await fetch('http://localhost:8000/login/', { 
        credentials: 'include', // Include credentials in the request
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        console.log("Login successful!"); // Debugging
        setIsAuthenticated(true);
        return true;
    }

    console.log("Login failed: Invalid credentials"); // Debugging
    return false;
  };

  const logout = () => { 
    // Clear authentication state from local storage
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
