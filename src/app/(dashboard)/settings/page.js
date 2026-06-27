"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { api, uploadFile } from "@/utils/api";
import { Spinner } from "@/components/ui";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  User,
  Shield,
  UserPlus,
  Lock,
  Users,
  Settings,
  CheckCircle2,
  Mail,
  Phone,
  Award,
  Key,
  UserCheck,
  Activity,
  ArrowRight,
  Building2,
  Scale,
  Briefcase,
  Camera,
} from "lucide-react";

function ProfileSection({ user, refetch }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    barCouncilNo: user?.barCouncilNo || "",
  });
  const [saving, setSaving] = useState(false);

  const [uploadingPic, setUploadingPic] = useState(false);
  const [previewPic, setPreviewPic] = useState(user?.profilePicture || null);

  useEffect(() => {
    setPreviewPic(user?.profilePicture || null);
  }, [user?.profilePicture]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/api/auth/me", profile);
      await refetch();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreviewPic(localPreview);

    setUploadingPic(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await uploadFile("/api/upload", fd);
      const cloudinaryUrl = uploadRes.url;

      await api.patch("/api/auth/me/profile-picture", {
        profilePicture: cloudinaryUrl,
      });

      await refetch();
      toast.success("Profile picture updated!");
    } catch (err) {
      setPreviewPic(user?.profilePicture || null);
      toast.error(err.message || "Failed to upload picture.");
    } finally {
      setUploadingPic(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-[0_2px_20px_rgba(2,103,117,0.08)] border border-[#027675]/10 hover:shadow-[0_8px_30px_rgba(2,103,117,0.12)] transition-all duration-300">
      {/* Header accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#027675] via-[#028a7a] to-[#019d8e]" />

      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027675] to-[#019d8e] flex items-center justify-center shadow-lg shadow-[#027675]/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="font-bold text-2xl text-gray-900 font-display tracking-tight">
              Profile Information
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">
              Manage your personal details, credentials, and profile picture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8 p-5 bg-[#027675]/5 rounded-2xl border border-[#027675]/10">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            {previewPic ? (
              <img
                src={previewPic}
                alt="Your profile picture"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            {/* Camera icon overlay */}
            <label
              htmlFor="dp-upload"
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#027675] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#015f5d] transition-colors"
              title="Change profile picture"
            >
              {uploadingPic ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </label>
            <input
              id="dp-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePictureChange}
              disabled={uploadingPic}
            />
          </div>

          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Profile Picture
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click the camera icon to upload a new photo.
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              JPG, PNG, WEBP — max 5MB
            </p>
            {uploadingPic && (
              <p className="text-xs text-[#027675] font-medium mt-1 animate-pulse">
                Uploading...
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-[#027675]" />
                Full Name
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-200 font-medium"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 text-[#027675]" />
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
                value={user?.email || ""}
                readOnly
              />
              <p className="text-xs text-gray-400 mt-1">
                Contact support to change email
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Phone className="w-4 h-4 text-[#027675]" />
                Phone Number
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-200 font-medium"
                placeholder="+92-300-0000000"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Scale className="w-4 h-4 text-[#027675]" />
                Bar Council No.
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-200 font-medium tracking-wide"
                placeholder="e.g., PBC-2023-0456"
                value={profile.barCouncilNo}
                onChange={(e) =>
                  setProfile({ ...profile, barCouncilNo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#027675] text-white font-semibold rounded-xl shadow-lg shadow-[#027675]/20 hover:shadow-xl hover:shadow-[#027675]/30 hover:bg-[#015f5d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Saving Changes...
                </>
              ) : (
                <>
                  Save Changes
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    if (form.newPassword.length < 8) {
      return toast.error(
        "Password must be at least 8 characters for security.",
      );
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
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-[0_2px_20px_rgba(2,103,117,0.08)] border border-[#027675]/10 hover:shadow-[0_8px_30px_rgba(2,103,117,0.12)] transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#027675] via-[#028a7a] to-[#019d8e]" />

      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027675] to-[#019d8e] flex items-center justify-center shadow-lg shadow-[#027675]/20">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-gray-900 font-display tracking-tight">
              Security Settings
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        <form onSubmit={handleChange} className="space-y-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Key className="w-4 h-4 text-[#027675]" />
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-200 font-medium"
              placeholder="Enter your current password"
              value={form.currentPassword}
              onChange={set("currentPassword")}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Lock className="w-4 h-4 text-[#027675]" />
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-200 font-medium"
                placeholder="Minimum 8 characters"
                value={form.newPassword}
                onChange={set("newPassword")}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#027675]" />
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-200 font-medium"
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>
                Use a strong password with letters, numbers, and symbols
              </span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#027675] text-white font-semibold rounded-xl shadow-lg shadow-[#027675]/20 hover:shadow-xl hover:shadow-[#027675]/30 hover:bg-[#015f5d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Updating Password...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters.");
    setCreating(true);
    try {
      await api.post("/api/senior/junior-lawyers", form);
      toast.success(`Account created successfully for ${form.name}.`);
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
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-[0_2px_20px_rgba(2,103,117,0.08)] border border-[#027675]/10 hover:shadow-[0_8px_30px_rgba(2,103,117,0.12)] transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#027675] via-[#028a7a] to-[#019d8e]" />

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027675] to-[#019d8e] flex items-center justify-center shadow-lg shadow-[#027675]/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-2xl text-gray-900 font-display tracking-tight">
                Junior Lawyers
              </h2>
              <p className="text-sm text-gray-500 mt-0.5 font-medium">
                Manage your team of junior associates
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#027675] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#027675]/20 hover:shadow-xl hover:shadow-[#027675]/30 hover:bg-[#015f5d] transition-all duration-200 transform hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? "Cancel" : "Add Junior"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-gradient-to-br from-[#027675]/5 to-white border-2 border-[#027675]/20 rounded-xl p-6 mb-8 space-y-5"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-[#027675]/10">
              <div className="w-10 h-10 rounded-lg bg-[#027675]/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[#027675]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Create New Account
                </p>
                <p className="text-xs text-gray-500">
                  Set up credentials for a new junior lawyer
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all text-sm font-medium"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all text-sm font-medium"
                  placeholder="junior@lawfirm.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Temporary Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all text-sm font-medium"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={set("password")}
                required
                minLength={8}
              />
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ name: "", email: "", password: "" });
                }}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#027675] text-white text-sm font-semibold rounded-lg hover:bg-[#015f5d] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#027675]/20"
              >
                {creating ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {loadingList ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : juniors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#027675]/5 flex items-center justify-center">
              <Users className="w-10 h-10 text-[#027675]/40" />
            </div>
            <p className="text-gray-500 font-medium mb-2">
              No junior lawyers added yet
            </p>
            <p className="text-sm text-gray-400">
              Click the &quot;Add Junior&quot; button to invite team members
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {juniors.map((j) => (
              <div
                key={j._id}
                className="flex items-center justify-between p-4 hover:bg-[#027675]/5 rounded-xl transition-all group border border-transparent hover:border-[#027675]/10"
              >
                <div className="flex items-center gap-4">
                  <UserAvatar user={j} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900">{j.name}</p>
                    <p className="text-sm text-gray-500">{j.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-semibold ${
                    j.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${j.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                  ></span>
                  {j.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountInfoSection({ user, juniorCount }) {
  const [seniorName, setSeniorName] = useState("");
  const isSenior = user?.seniority === "senior" || user?.role === "admin";

  const seniorityLabel =
    user?.seniority === "senior"
      ? "Senior Counsel"
      : user?.seniority === "junior"
        ? "Junior Associate"
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
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-[0_2px_20px_rgba(2,103,117,0.08)] border border-[#027675]/10 hover:shadow-[0_8px_30px_rgba(2,103,117,0.12)] transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#027675] via-[#028a7a] to-[#019d8e]" />

      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#027675] to-[#019d8e] flex items-center justify-center shadow-lg shadow-[#027675]/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-gray-900 font-display tracking-tight">
              Account Overview
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">
              Your account type, status, and professional details
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 hover:bg-[#027675]/5 rounded-xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#027675]/5 flex items-center justify-center group-hover:bg-[#027675]/10 transition-colors">
                <Briefcase className="w-5 h-5 text-[#027675]" />
              </div>
              <span className="font-semibold text-gray-700">
                Professional Role
              </span>
            </div>
            <span className="inline-flex items-center px-4 py-2 font-semibold text-white bg-gradient-to-r from-[#027675] to-[#019d8e] rounded-full capitalize text-sm shadow-md">
              {seniorityLabel || user?.role}
            </span>
          </div>

          {isSenior ? (
            <div className="flex items-center justify-between p-4 hover:bg-[#027675]/5 rounded-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#027675]/5 flex items-center justify-center group-hover:bg-[#027675]/10 transition-colors">
                  <Users className="w-5 h-5 text-[#027675]" />
                </div>
                <span className="font-semibold text-gray-700">
                  Junior Associates
                </span>
              </div>
              <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                <span className="w-10 h-10 rounded-full bg-[#027675]/10 flex items-center justify-center text-[#027675] font-bold text-lg">
                  {juniorCount || 0}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 hover:bg-[#027675]/5 rounded-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#027675]/5 flex items-center justify-center group-hover:bg-[#027675]/10 transition-colors">
                  <Building2 className="w-5 h-5 text-[#027675]" />
                </div>
                <span className="font-semibold text-gray-700">
                  Senior Lawyer
                </span>
              </div>
              <div className="flex items-center gap-3">
                {user?.createdBy && (
                  <UserAvatar user={user.createdBy} size="sm" />
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 text-sm text-center">
                    {user?.createdBy?.name || "Error in displaying"}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    {user?.createdBy?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user?.createdBy?.email || "Error in displaying"}
                      </span>
                    )}
                    {user?.createdBy?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user?.createdBy?.phone || "Error in displaying"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 hover:bg-[#027675]/5 rounded-xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#027675]/5 flex items-center justify-center group-hover:bg-[#027675]/10 transition-colors">
                <Settings className="w-5 h-5 text-[#027675]" />
              </div>
              <span className="font-semibold text-gray-700">Access Level</span>
            </div>
            <span className="inline-flex items-center px-4 py-1.5 font-semibold text-[#027675] bg-[#027675]/5 border-2 border-[#027675]/20 rounded-full capitalize text-sm">
              {user?.role}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-[#027675]/5 rounded-xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#027675]/5 flex items-center justify-center group-hover:bg-[#027675]/10 transition-colors">
                <Activity className="w-5 h-5 text-[#027675]" />
              </div>
              <span className="font-semibold text-gray-700">
                Account Status
              </span>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 font-semibold text-emerald-700 bg-emerald-50 border-2 border-emerald-200 rounded-full text-sm">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, refetch } = useAuth();
  const [juniorCount, setJuniorCount] = useState(0);

  const isSenior = user?.seniority === "senior" || user?.role === "admin";

  const handleJuniorsChange = (count) => {
    setJuniorCount(count);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center shadow-xl shadow-[#027675]/20">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-display tracking-tight">
                Settings
              </h1>
              <p className="text-gray-500 mt-1 font-medium">
                Manage your account, security, and team members
              </p>
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-8">
          <ProfileSection user={user} refetch={refetch} />
          <ChangePasswordSection />
          {isSenior && (
            <JuniorLawyersSection onJuniorsChange={handleJuniorsChange} />
          )}
          <AccountInfoSection user={user} juniorCount={juniorCount} />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Need help? Contact your system administrator or support team 
          </p>
        </div>
      </div>
    </div>
  );
}
