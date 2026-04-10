import React, { createContext, useContext, useState, ReactNode } from "react";
import { apiLogin, apiSignup } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  branch?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: "customer" | "admin") => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("librahub_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiLogin(email, password);
      setUser(data.user);
      localStorage.setItem("librahub_user", JSON.stringify(data.user));
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: "customer" | "admin"): Promise<boolean> => {
    try {
      const data = await apiSignup(name, email, password, role);
      setUser(data.user);
      localStorage.setItem("librahub_user", JSON.stringify(data.user));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("librahub_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
