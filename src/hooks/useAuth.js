"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { triggerLogoutOverlay } from "@/lib/logoutOverlayStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data?.data?.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = () => {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(
      () => {},
    );

    triggerLogoutOverlay(() => {
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, logout, refetch: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RoleGate({ children, required, fallback = null }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const isAdmin = user?.role === "admin";
  const hasSeniority = user?.seniority === required;

  if (!isAdmin && !hasSeniority) return fallback;

  return children;
}

export function AuthGate({ children, redirectTo = "/" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [loading, user, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return children;
}
