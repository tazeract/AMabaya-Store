"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User, AuthState, SavedAddress } from "@/types";

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { full_name?: string; phone?: string; addresses?: SavedAddress[] }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Map a Supabase user + profile row → our app User shape */
function mapUser(
  supabaseUser: { id: string; email?: string; created_at: string },
  profile?: {
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    addresses?: SavedAddress[] | null;
  } | null
): User {
  return {
    id: supabaseUser.id,
    name: profile?.full_name ?? supabaseUser.email?.split("@")[0] ?? "User",
    email: supabaseUser.email ?? "",
    phone: profile?.phone ?? undefined,
    avatarUrl: profile?.avatar_url ?? undefined,
    addresses: profile?.addresses ?? [],
    createdAt: supabaseUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch profile from DB and update local state */
  const loadProfile = useCallback(
    async (supabaseUser: { id: string; email?: string; created_at: string }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, addresses")
        .eq("id", supabaseUser.id)
        .single();
      setUser(mapUser(supabaseUser, profile));
    },
    [supabase]
  );

  /** Subscribe to auth state changes (handles refresh, signout across tabs, etc.) */
  useEffect(() => {
    // Skip during build / when Supabase is not configured
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  /** Login with email + password */
  const login = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured()) throw new Error("Supabase is not configured.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
    },
    [supabase]
  );

  /** Sign up and store name/phone in profiles */
  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone: phone ?? null },
        },
      });

      if (error) throw new Error(error.message);

      // If email confirmation is disabled the user is immediately available
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: name,
          phone: phone ?? null,
        });
      }
    },
    [supabase]
  );

  /** Sign out */
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  /** Optimistically update local user state (e.g., after profile edit) */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  /** Send password reset email */
  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw new Error(error.message);
    },
    [supabase]
  );

  /** Persist profile changes to Supabase */
  const updateProfile = useCallback(
    async (updates: { full_name?: string; phone?: string; addresses?: SavedAddress[] }) => {
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw new Error(error.message);

      // Sync local state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: updates.full_name ?? prev.name,
              phone: updates.phone ?? prev.phone,
              addresses: updates.addresses ?? prev.addresses,
            }
          : prev
      );
    },
    [supabase, user]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      logout,
      updateUser,
      resetPassword,
      updateProfile,
    }),
    [user, isLoading, login, signup, logout, updateUser, resetPassword, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
