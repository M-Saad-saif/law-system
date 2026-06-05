"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/utils/api";
import { Spinner } from "@/components/ui";
import {
  User,
  Shield,
  Database,
  RefreshCw,
  UserPlus,
  Lock,
  Users,
} from "lucide-react";

function ProfileSection({ user, refetch }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    barCouncilNo: user?.barCouncilNo || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/auth/me", profile);
      await refetch();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <h2 className="font-bold text-slate-800 font-display">
          Profile Information
        </h2>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              className="input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input bg-slate-50 cursor-not-allowed"
              value={user?.email || ""}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input
              className="input"
              placeholder="+92-300-0000000"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="label">Bar Council No.</label>
            <input
              className="input"
              placeholder="LHC-XXXX-XXXX"
              value={profile.barCouncilNo}
              onChange={(e) =>
                setProfile({ ...profile, barCouncilNo: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

//Change Password (all users)
function ChangePasswordSection() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (form.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }
    setSaving(true);
    try {
      await api.put("/api/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
          <Lock className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 font-display">
            Change Password
          </h2>
          <p className="text-xs text-slate-400">Update your login password</p>
        </div>
      </div>
      <form onSubmit={handleChange} className="space-y-4">
        <div className="form-group">
          <label className="label">Current Password</label>
          <input
            type="password"
            className="input"
            placeholder="Enter current password"
            value={form.currentPassword}
            onChange={set("currentPassword")}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">New Password</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 6 characters"
              value={form.newPassword}
              onChange={set("newPassword")}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Add Junior Lawyer (senior only)
function JuniorLawyersSection({ onJuniorsChange }) {
  const [juniors, setJuniors] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchJuniors = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get("/api/senior/junior-lawyers");
      const juniorsList = res.data?.juniors || [];
      setJuniors(juniorsList);
      if (onJuniorsChange) {
        onJuniorsChange(juniorsList.length);
      }
    } catch {
      if (onJuniorsChange) {
        onJuniorsChange(0);
      }
    } finally {
      setLoadingList(false);
    }
  }, [onJuniorsChange]);

  useEffect(() => {
    fetchJuniors();
  }, [fetchJuniors]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters.");
    setCreating(true);
    try {
      await api.post("/api/senior/junior-lawyers", form);
      toast.success(`Junior lawyer account created for ${form.name}.`);
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
      await fetchJuniors();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 font-display">
              Junior Lawyers
            </h2>
            <p className="text-xs text-slate-400">
              Manage your junior team members
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Junior
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 space-y-3"
        >
          <p className="text-sm font-semibold text-slate-700 mb-1">
            New Junior Lawyer
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                className="input"
                placeholder="Adv. Junior Name"
                value={form.name}
                onChange={set("name")}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="junior@lawfirm.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Temporary Password</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 6 characters — share with the junior"
              value={form.password}
              onChange={set("password")}
              required
            />
          </div>
          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({ name: "", email: "", password: "" });
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary text-sm"
            >
              {creating ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      )}

      {loadingList ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : juniors.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          No junior lawyers added yet. Click <strong>Add Junior</strong> to get
          started.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {juniors.map((j) => (
            <div key={j._id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{j.name}</p>
                <p className="text-xs text-slate-400">{j.email}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  j.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}
              >
                {j.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Account Info
function AccountInfoSection({ user, juniorCount }) {
  const [seniorName, setSeniorName] = useState("");
  const isSenior = user?.seniority === "senior" || user?.role === "admin";

  const seniorityLabel =
    user?.seniority === "senior"
      ? "Senior Lawyer"
      : user?.seniority === "junior"
        ? "Junior Lawyer"
        : user?.seniority;

  useEffect(() => {
    if (isSenior) return;
    if (user?.createdBy?.name) {
      setSeniorName(user.createdBy.name);
      return;
    }
    if (user?.seniorLawyer?.name) {
      setSeniorName(user.seniorLawyer.name);
    } else if (user?.seniorName) {
      setSeniorName(user.seniorName);
    } else {
      setSeniorName("Not assigned");
    }
  }, [user, isSenior]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Shield className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="font-bold text-slate-800 font-display">Account</h2>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-slate-50">
          <span className="text-sm text-slate-600">Role</span>
          <span className="text-sm font-semibold text-slate-800 capitalize">
            {seniorityLabel || user?.role}
          </span>
        </div>
        {isSenior ? (
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">
              No. of junior lawyers
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {juniorCount || 0}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-600">Your Senior Lawyer</span>
            <span className="text-sm font-semibold text-slate-800">
              {user?.createdBy?.name ||
                user?.seniorLawyer?.name ||
                seniorName ||
                user?.seniorName ||
                "Not assigned"}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-2 border-b border-slate-50">
          <span className="text-sm text-slate-600">Access Level</span>
          <span className="text-sm font-semibold text-slate-800 capitalize">
            {user?.role}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-600">Account Status</span>
          <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Settings Page
export default function SettingsPage() {
  const { user, refetch } = useAuth();
  const [juniorCount, setJuniorCount] = useState(0);

  const isSenior = user?.seniority === "senior" || user?.role === "admin";

  const handleJuniorsChange = (count) => {
    setJuniorCount(count);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <ProfileSection user={user} refetch={refetch} />
      <ChangePasswordSection />
      {isSenior && (
        <JuniorLawyersSection onJuniorsChange={handleJuniorsChange} />
      )}
      <AccountInfoSection user={user} juniorCount={juniorCount} />
    </div>
  );
}
