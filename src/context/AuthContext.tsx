"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { User, AuthState } from "@/types";

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>("amabaya-user", null);

  /**
   * Mock login — replace with Supabase: await supabase.auth.signInWithPassword({ email, password })
   */
  const login = useCallback(
    async (email: string, password: string) => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      // Check localStorage for registered users
      const usersRaw = localStorage.getItem("amabaya-users");
      const users: (User & { password: string })[] = usersRaw
        ? JSON.parse(usersRaw)
        : [];
      const found = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!found) {
        throw new Error("Invalid email or password.");
      }

      const { password: _pw, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
    },
    [setUser]
  );

  /**
   * Mock signup — replace with Supabase: await supabase.auth.signUp({ email, password })
   */
  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      await new Promise((r) => setTimeout(r, 800));

      const usersRaw = localStorage.getItem("amabaya-users");
      const users: (User & { password: string })[] = usersRaw
        ? JSON.parse(usersRaw)
        : [];

      if (users.some((u) => u.email === email)) {
        throw new Error("An account with this email already exists.");
      }

      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
        password,
      };

      users.push(newUser);
      localStorage.setItem("amabaya-users", JSON.stringify(users));

      const { password: _pw, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
    },
    [setUser]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [setUser]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading: false,
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, login, signup, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
