"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Scale, ArrowRight } from "lucide-react";
import { api } from "@/utils/api";

function Field({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
}) {
  return (
    <div className="form-group">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        className="w-full px-3.5 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-colors text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    barCouncilNo: "",
    seniority: "junior",
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      toast.success("Account created! Welcome to LawPortal.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4 shadow-glow">
          <Scale className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white font-display">
          LawPortal
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Create your practice account
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-white mb-1">
          Create Account
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Start managing your cases professionally
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Full Name"
            placeholder="Adv. Your Name"
            required
            value={form.name}
            onChange={set("name")}
          />
          <Field
            label="Email Address"
            type="email"
            placeholder="you@lawfirm.com"
            required
            value={form.email}
            onChange={set("email")}
          />
          <Field
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            required
            value={form.password}
            onChange={set("password")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Phone"
              placeholder="+92-300-0000000"
              value={form.phone}
              onChange={set("phone")}
            />
            <Field
              label="Bar Council No."
              placeholder="LHC-XXXX-XXXX"
              value={form.barCouncilNo}
              onChange={set("barCouncilNo")}
            />
          </div>

          {/* Seniority selector */}
          <div className="form-group">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Role <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  value: "senior",
                  label: "Senior Lawyer",
                  desc: "Reviews & approves drafts",
                },
                {
                  value: "junior",
                  label: "Junior / Associate",
                  desc: "Creates & submits drafts",
                },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, seniority: value }))}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                    form.seniority === value
                      ? "border-primary-400 bg-primary-600/20 text-white"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-xs opacity-70 mt-0.5">
                    {desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-slate-500 text-sm mt-5">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary-400 hover:text-primary-300 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
