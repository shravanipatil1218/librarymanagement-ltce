import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, currentUser, adminUser } from "@/lib/mock-data";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: "customer" | "admin") => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string): boolean => {
    if (email === "admin@library.com") {
      setUser(adminUser);
      return true;
    }
    setUser(currentUser);
    return true;
  };

  const signup = (name: string, email: string, _password: string, role: "customer" | "admin"): boolean => {
    setUser({
      id: "new-" + Date.now(),
      name,
      email,
      phone: "",
      role,
    });
    return true;
  };

  const logout = () => setUser(null);

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
