"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Scale, Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/login", form);
      toast.success("Welcome back!");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: "demo@lexisportal.com", password: "Demo@12345" });
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#103168]/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full bg-[#027f7e]/10 blur-[100px] pointer-events-none"></div>

      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2YpIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-repeat"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#027f7e] to-[#025f5e] mb-4 shadow-[0_8px_20px_-6px_rgba(2,127,126,0.3)]">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-display">
          LawPortal
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Legal Practice Management System
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-1">
            Sign in to your account
          </h2>
          <p className="text-white/40 text-sm mb-6">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-black/40 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#027f7e]/50 focus:border-[#027f7e] transition-colors text-sm"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-white/10 bg-black/40 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#027f7e]/50 focus:border-[#027f7e] transition-colors text-sm"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#027f7e] text-white font-semibold text-sm hover:bg-[#026a69] active:bg-[#015857] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={fillDemo}
              className="w-full text-center text-sm text-[#027f7e] hover:text-[#33adad] transition-colors"
            >
              Use demo credentials
            </button>
          </div>
        </div>

        <p className="text-center text-white/30 text-sm mt-5">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#027f7e] hover:text-[#33adad] font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
