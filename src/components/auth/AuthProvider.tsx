"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  sendMagicLink: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function sendMagicLink(email: string) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { error: "还没配置登录服务，请先补上 Supabase 环境变量。" };
    }

    const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, configured, sendMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
