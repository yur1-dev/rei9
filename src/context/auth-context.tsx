"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  isLoading: true,
});

const CORRECT_PASSWORD = "000";
const AUTH_STORAGE_KEY = "rei9_authenticated";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        console.log("Checking auth status:", stored); // Debug log
        if (stored === "true") {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure proper initialization
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  const login = (password: string): boolean => {
    console.log("Login attempt with password:", password); // Debug log
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        console.log("Login successful, auth stored"); // Debug log
      } catch (error) {
        console.error("Failed to store auth status:", error);
      }
      return true;
    }
    console.log("Login failed - incorrect password"); // Debug log
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      console.log("Logged out successfully"); // Debug log
    } catch (error) {
      console.error("Failed to clear auth status:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
