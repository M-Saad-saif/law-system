"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user || user.role === "admin") {
      setSubscription(null);
      setSubLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/billing", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.data?.subscription || null);
      }
    } catch {
      setSubscription(null);
    } finally {
      setSubLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) fetchSubscription();
  }, [authLoading, fetchSubscription]);

  const isAllowed = () => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (!subscription) return false;
    return ["trialing", "active", "temporary_active"].includes(
      subscription.status,
    );
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        subLoading,
        isAllowed,
        refetch: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx)
    throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}

// Wraps any page that requires an active subscription.
// If the subscription is expired/blocked/cancelled, redirects to /billing.
export function SubscriptionGate({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { subscription, subLoading, isAllowed } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading || subLoading) return;
    if (!user) return;
    if (user.role === "admin") return;
    if (pathname.startsWith("/billing")) return;
    if (!isAllowed()) {
      router.replace("/billing");
    }
  }, [
    authLoading,
    subLoading,
    user,
    subscription,
    pathname,
    router,
    isAllowed,
  ]);

  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;
  if (
    user.role !== "admin" &&
    !pathname.startsWith("/billing") &&
    !isAllowed()
  ) {
    return null;
  }

  return children;
}
