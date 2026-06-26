"use client";

import { AuthProvider, AuthGate } from "@/hooks/useAuth";
import {
  SubscriptionProvider,
  SubscriptionGate,
} from "@/hooks/useSubscription";
import { RouteTransitionProvider } from "@/hooks/useRouteTransition";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import RouteLoaderOverlay from "@/components/layout/RouteLoaderOverlay";
import WelcomeGate from "@/components/layout/Welcomegate";

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <AuthGate>
        <WelcomeGate />
        <SubscriptionProvider>
          <SubscriptionGate>
            <RouteTransitionProvider>
              <div className="flex h-screen overflow-hidden bg-surface-50">
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  <Topbar />
                  <div className="relative flex-1 overflow-hidden">
                    <main className="h-full overflow-y-auto p-6">
                      {children}
                    </main>
                    <RouteLoaderOverlay />
                  </div>
                </div>
              </div>
            </RouteTransitionProvider>
          </SubscriptionGate>
        </SubscriptionProvider>
      </AuthGate>
    </AuthProvider>
  );
}