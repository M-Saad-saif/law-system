"use client";

import { AuthProvider, AuthGate } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <AuthGate>
        <div className="flex h-screen overflow-hidden bg-surface-50">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </AuthGate>
    </AuthProvider>
  );
}
