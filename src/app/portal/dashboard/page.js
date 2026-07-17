"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogOut, FolderOpen, Calendar, Gavel } from "lucide-react";

export default function PortalDashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, casesRes] = await Promise.all([
          fetch("/api/client-portal/me", { credentials: "include" }),
          fetch("/api/client-portal/cases", { credentials: "include" }),
        ]);
        const me = await meRes.json();
        const list = await casesRes.json();

        if (!meRes.ok) {
          router.replace("/portal/login");
          return;
        }

        setClient(me.data.client);
        setCases(list.data?.cases || []);
      } catch {
        toast.error("Failed to load your dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/client-portal/auth/logout", { method: "POST", credentials: "include" });
    router.push("/portal/login");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#1c3d3b]/60 text-sm">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#1c3d3b]">
            Welcome, {client?.name}
          </h1>
          <p className="text-sm text-[#1c3d3b]/60">Here's what's shared with you</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-[#1c3d3b]/70 hover:text-[#026665]"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-[#ccebdb] p-10 text-center text-[#1c3d3b]/60 text-sm">
          No cases have been shared with you yet.
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link
              key={c._id}
              href={`/portal/cases/${c._id}`}
              className="block bg-white rounded-xl ring-1 ring-[#ccebdb] p-5 hover:ring-[#0d8e83] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#026665] font-medium">
                    <FolderOpen className="w-4 h-4" />
                    {c.caseTitle}
                  </div>
                  <p className="text-xs text-[#1c3d3b]/60 mt-1">
                    {c.courtName || c.courtType} · {c.caseType}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-[#ccebdb] text-[#026665] font-medium shrink-0">
                  {c.status}
                </span>
              </div>
              {c.nextHearingDate && (
                <div className="flex items-center gap-1.5 text-xs text-[#1c3d3b]/70 mt-3">
                  <Calendar className="w-3.5 h-3.5" />
                  Next hearing: {new Date(c.nextHearingDate).toLocaleDateString()}
                </div>
              )}
              {c.judgeName && (
                <div className="flex items-center gap-1.5 text-xs text-[#1c3d3b]/70 mt-1">
                  <Gavel className="w-3.5 h-3.5" />
                  {c.judgeName}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
