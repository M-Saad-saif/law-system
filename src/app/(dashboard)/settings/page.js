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
  Copy,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";

function LeftProfileSidebar({ user, previewPic, juniorCount, onOpenModal }) {
  const isSenior = user?.seniority === "senior";
  const seniorityLabel =
    user?.seniority === "senior"
      ? "Senior Counsel"
      : user?.seniority === "junior"
        ? "Junior Associate"
        : user?.seniority || "Member";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 flex flex-col items-center text-center h-fit transform transition-all duration-500 hover:shadow-xl hover:shadow-[#027675]/5 hover:-translate-y-1">
      {/* Avatar Container */}
      <div className="relative mb-4 group">
        <div className="relative">
          {previewPic ? (
            <img
              src={previewPic}
              alt="Your profile picture"
              className="w-28 h-28 rounded-full object-cover border-2 border-gray-100 shadow-md transition-all duration-300 group-hover:border-[#027675]/30"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center text-white text-4xl font-bold shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          {/* Status indicator */}
          <span className="absolute bottom-2 right-2 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
        </div>
      </div>

      {/* User Info */}
      <h3 className="font-bold text-gray-900 text-lg animate-fade-in">
        {user?.name || "User Name"}
      </h3>
      <p className="text-sm text-gray-400 mt-0.5 mb-6">
        {seniorityLabel} - LawPortal
      </p>
      <p className="text-sm text-gray-400 ">{user?.email}</p>
      <p className="text-sm text-gray-400 ">{user?.phone}</p>

      {/* Stats / Indicators Grid */}
      <div className="w-full border-t border-b border-gray-100 py-3 my-2 space-y-3 text-left">
        <div className="flex items-center justify-between text-sm px-1 group hover:bg-gray-50 rounded-lg p-2 transition-all duration-300">
          <span className="text-gray-500">Account Role</span>
          <span className="font-semibold text-[#027675] capitalize flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            {user?.role || "user"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm px-1 group hover:bg-gray-50 rounded-lg p-2 transition-all duration-300">
          <span className="text-gray-500">Status</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Active
          </span>
        </div>
        {isSenior && (
          <div className="flex items-center justify-between text-sm px-1 group hover:bg-gray-50 rounded-lg p-2 transition-all duration-300">
            <span className="text-gray-500">Junior Associates</span>
            <span className="font-bold text-gray-800 bg-[#027675]/5 px-2.5 py-0.5 rounded-full">
              {juniorCount || 0}
            </span>
          </div>
        )}
      </div>

      <div className="w-full mt-4 space-y-2">
        <button
          onClick={onOpenModal}
          className="w-full py-2.5 px-4 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:border-[#027675]/30 hover:text-[#027675] hover:bg-[#027675]/5 transition-all duration-300 transform hover:scale-[1.02]"
        >
          View Public Profile
        </button>
        <div className="flex items-center mt-2 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50 group hover:border-[#027675]/30 transition-all duration-300"></div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, refetch } = useAuth();
  const [juniorCount, setJuniorCount] = useState(0);
  const [activeTab, setActiveTab] = useState("account");
  const [isTabChanging, setIsTabChanging] = useState(false);

  // 3. Added Modal State Variable
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isSenior = user?.seniority === "senior" || user?.role === "admin";
  const seniorityLabel =
    user?.seniority === "senior"
      ? "Senior Counsel"
      : user?.seniority === "junior"
        ? "Junior Associate"
        : user?.seniority || "Member";

  const handleJuniorsChange = (count) => {
    setJuniorCount(count);
  };

  const handleTabChange = (tab) => {
    setIsTabChanging(true);
    setActiveTab(tab);
    setTimeout(() => setIsTabChanging(false), 300);
  };

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
    if (user) {
      setProfile({
        name: user.name || "",
        phone: user.phone || "",
        barCouncilNo: user.barCouncilNo || "",
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
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

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (pwdForm.newPassword.length < 8) {
      return toast.error(
        "Password must be at least 8 characters for security.",
      );
    }
    setSavingPwd(true);
    try {
      await api.put("/api/auth/change-password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success("Password changed successfully.");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  const [juniors, setJuniors] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [juniorForm, setJuniorForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [creatingJunior, setCreatingJunior] = useState(false);
  const [showJuniorForm, setShowJuniorForm] = useState(false);

  const fetchJuniors = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get("/api/senior/junior-lawyers");
      const juniorsList = res.data?.juniors || [];
      setJuniors(juniorsList);
      handleJuniorsChange(juniorsList.length);
    } catch {
      handleJuniorsChange(0);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (isSenior) {
      fetchJuniors();
    }
  }, [fetchJuniors, isSenior]);

  const handleCreateJunior = async (e) => {
    e.preventDefault();
    if (juniorForm.password.length < 8)
      return toast.error("Password must be at least 8 characters.");
    setCreatingJunior(true);
    try {
      await api.post("/api/senior/junior-lawyers", juniorForm);
      toast.success(`Account created successfully for ${juniorForm.name}.`);
      setJuniorForm({ name: "", email: "", password: "" });
      setShowJuniorForm(false);
      await fetchJuniors();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingJunior(false);
    }
  };

  const [seniorName, setSeniorName] = useState("");
  useEffect(() => {
    if (isSenior) return;
    if (user?.createdBy?.name) {
      setSeniorName(user.createdBy.name);
    } else if (user?.seniorLawyer?.name) {
      setSeniorName(user.seniorLawyer.name);
    } else if (user?.seniorName) {
      setSeniorName(user.seniorName);
    } else {
      setSeniorName("Not assigned");
    }
  }, [user, isSenior]);

  const tabContent = {
    account: (
      <form
        onSubmit={handleProfileSave}
        className="space-y-6 animate-fade-in-up"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-gray-100">
          <div className="relative group">
            {previewPic ? (
              <img
                src={previewPic}
                alt="Profile picture preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow-md transition-all duration-300 group-hover:border-[#027675]/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <label
              htmlFor="settings-dp-upload"
              className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-r from-[#027675] to-[#015f5d] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-all duration-300"
              title="Change profile picture"
            >
              {uploadingPic ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </label>
            <input
              id="settings-dp-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePictureChange}
              disabled={uploadingPic}
            />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-gray-900">
              Profile Picture
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG or JPEG. Max size of 2MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 group">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors duration-300 group-focus-within:text-[#027675]">
              Full Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300 text-sm hover:border-gray-300"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="First and last name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed text-sm"
              value={user?.email || ""}
              readOnly
            />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors duration-300 group-focus-within:text-[#027675]">
              Phone Number
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300 text-sm hover:border-gray-300"
              placeholder="+92-300-0000000"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors duration-300 group-focus-within:text-[#027675]">
              Bar Council No.
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300 text-sm hover:border-gray-300"
              placeholder="e.g., PBC-2023-0456"
              value={profile.barCouncilNo}
              onChange={(e) =>
                setProfile({ ...profile, barCouncilNo: e.target.value })
              }
            />
          </div>
        </div>

        <div className="pt-6 border-t-2 border-gray-100 flex justify-start">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-[#027675] to-[#015f5d] text-white text-sm font-semibold rounded-xl hover:from-[#015f5d] hover:to-[#014a49] transition-all duration-300 disabled:opacity-50 transform hover:scale-105 hover:shadow-lg hover:shadow-[#027675]/20 active:scale-95"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Update Profile
              </span>
            )}
          </button>
        </div>
      </form>
    ),
    security: (
      <form
        onSubmit={handlePasswordChange}
        className="space-y-6 animate-fade-in-up"
      >
        <div className="space-y-1.5 max-w-md group">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors duration-300 group-focus-within:text-[#027675]">
            Current Password
          </label>
          <input
            type="password"
            className="w-[143%] px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300 text-sm hover:border-gray-300"
            placeholder="Verify past credentials"
            value={pwdForm.currentPassword}
            onChange={(e) =>
              setPwdForm({ ...pwdForm, currentPassword: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 group">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors duration-300 group-focus-within:text-[#027675]">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300 text-sm hover:border-gray-300"
              placeholder="Minimum 8 characters"
              value={pwdForm.newPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, newPassword: e.target.value })
              }
              required
              minLength={8}
            />
          </div>

          <div className="space-y-1.5 group">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider transition-colors duration-300 group-focus-within:text-[#027675]">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300 text-sm hover:border-gray-300"
              placeholder="Match character block"
              value={pwdForm.confirmPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, confirmPassword: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="pt-6 border-t-2 border-gray-100 flex justify-start">
          <button
            type="submit"
            disabled={savingPwd}
            className="px-8 py-3 bg-gradient-to-r from-[#027675] to-[#015f5d] text-white text-sm font-semibold rounded-xl hover:from-[#015f5d] hover:to-[#014a49] transition-all duration-300 disabled:opacity-50 transform hover:scale-105 hover:shadow-lg hover:shadow-[#027675]/20 active:scale-95"
          >
            {savingPwd ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </span>
            )}
          </button>
        </div>
      </form>
    ),
    team: isSenior && (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-[#027675]" />
              Associates Directory
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Invite and monitor active team legal members
            </p>
          </div>
          <button
            onClick={() => setShowJuniorForm((v) => !v)}
            className={`px-5 py-2.5 font-semibold text-xs rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              showJuniorForm
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-gradient-to-r from-[#027675] to-[#015f5d] text-white hover:shadow-lg hover:shadow-[#027675]/20"
            }`}
          >
            {showJuniorForm ? "Hide Form" : "Add New Junior"}
          </button>
        </div>

        {showJuniorForm && (
          <form
            onSubmit={handleCreateJunior}
            className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 space-y-4 animate-slide-down"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 group">
                <label className="text-xs font-medium text-gray-600 transition-colors duration-300 group-focus-within:text-[#027675]">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300"
                  placeholder="Associate name"
                  value={juniorForm.name}
                  onChange={(e) =>
                    setJuniorForm({ ...juniorForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1 group">
                <label className="text-xs font-medium text-gray-600 transition-colors duration-300 group-focus-within:text-[#027675]">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300"
                  placeholder="User Email"
                  value={juniorForm.email}
                  onChange={(e) =>
                    setJuniorForm({ ...juniorForm, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-1 group">
              <label className="text-xs font-medium text-gray-600 transition-colors duration-300 group-focus-within:text-[#027675]">
                Temporary Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm focus:border-[#027675] focus:ring-4 focus:ring-[#027675]/10 transition-all duration-300"
                placeholder="Min 8 characters"
                value={juniorForm.password}
                onChange={(e) =>
                  setJuniorForm({ ...juniorForm, password: e.target.value })
                }
                required
                minLength={8}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowJuniorForm(false)}
                className="px-5 py-2.5 text-sm text-gray-600 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingJunior}
                className="px-5 py-2.5 text-sm bg-gradient-to-r from-[#027675] to-[#015f5d] text-white font-semibold rounded-xl hover:from-[#015f5d] hover:to-[#014a49] transition-all duration-300 disabled:opacity-50 transform hover:scale-105 hover:shadow-lg hover:shadow-[#027675]/20 active:scale-95"
              >
                {creatingJunior ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Save Account
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {loadingList ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : juniors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              No junior associates assigned to your profile yet.
            </p>
            <button
              onClick={() => setShowJuniorForm(true)}
              className="mt-3 text-sm text-[#027675] hover:text-[#015f5d] font-medium transition-colors duration-300"
            >
              Invite your first team member →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {juniors.map((j) => (
              <div
                key={j._id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group hover:bg-gray-50 rounded-lg px-3 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={j} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {j.name}
                    </p>
                    <p className="text-xs text-gray-400">{j.email}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                    j.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {j.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    info: (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#027675]" />
            Account Overview
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Your account type, status, and professional indicators
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Professional Role */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 flex items-center justify-between group hover:border-[#027675]/20 hover:shadow-md transition-all duration-500 transform hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#027675]/10 rounded-xl group-hover:bg-[#027675]/20 transition-colors duration-300">
                <Briefcase className="w-5 h-5 text-[#027675]" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Professional Role
              </span>
            </div>
            <span className="inline-flex items-center px-4 py-1.5 font-semibold text-white bg-gradient-to-r from-[#027675] to-[#015f5d] rounded-full text-xs capitalize shadow-md">
              {seniorityLabel || user?.role}
            </span>
          </div>

          {isSenior ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 flex items-center justify-between group hover:border-[#027675]/20 hover:shadow-md transition-all duration-500 transform hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#027675]/10 rounded-xl group-hover:bg-[#027675]/20 transition-colors duration-300">
                  <Users className="w-5 h-5 text-[#027675]" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Junior Lawyers
                </span>
              </div>
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#027675]/10 to-[#027675]/20 flex items-center justify-center text-[#027675] font-bold text-sm border-2 border-[#027675]/20">
                {juniorCount || 0}
              </span>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 flex items-center justify-between group hover:border-[#027675]/20 hover:shadow-md transition-all duration-500 transform hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#027675]/10 rounded-xl group-hover:bg-[#027675]/20 transition-colors duration-300">
                  <Building2 className="w-5 h-5 text-[#027675]" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Senior Lawyer
                </span>
              </div>
              <div className="flex items-center gap-2">
                {user?.createdBy && (
                  <UserAvatar user={user.createdBy} size="sm" />
                )}

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {seniorName}
                  </span>
                  <span className="text-[12px] font-medium text-[#a5a8b8]">
                    {user?.createdBy?.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border-2 border-gray-100 flex items-center justify-between group hover:border-[#027675]/20 hover:shadow-md transition-all duration-500 transform hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors duration-300">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Account Status
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 font-semibold text-emerald-700 bg-emerald-50 border-2 border-emerald-200 rounded-full text-xs shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Active
            </span>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br py-10 bg-[#eef5f3]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#027675]" />
            Settings
          </h1>
          <p className="text-gray-500 mt-2 ml-11">
            Manage your account, security, and team settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-1 animate-fade-in-left">
            <LeftProfileSidebar
              user={user}
              previewPic={previewPic}
              juniorCount={juniorCount}
              onOpenModal={() => setIsProfileModalOpen(true)}
            />
          </div>

          <div className="md:col-span-3 bg-white rounded-2xl border-2 border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden flex flex-col min-h-[600px] transition-all duration-500 hover:shadow-2xl hover:shadow-gray-100/80 animate-fade-in-right">
            <div className="border-b-2 border-gray-100 px-6 bg-gradient-to-r from-white to-gray-50/50 flex flex-wrap gap-6">
              <button
                onClick={() => handleTabChange("account")}
                className={`py-4 text-sm font-semibold border-b-2 transition-all duration-300 relative ${
                  activeTab === "account"
                    ? "border-[#027675] text-[#027675]"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Account Settings
                </span>
                {activeTab === "account" && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#027675] rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => handleTabChange("security")}
                className={`py-4 text-sm font-semibold border-b-2 transition-all duration-300 relative ${
                  activeTab === "security"
                    ? "border-[#027675] text-[#027675]"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Security Settings
                </span>
                {activeTab === "security" && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#027675] rounded-full"></span>
                )}
              </button>
              {isSenior && (
                <button
                  onClick={() => handleTabChange("team")}
                  className={`py-4 text-sm font-semibold border-b-2 transition-all duration-300 relative ${
                    activeTab === "team"
                      ? "border-[#027675] text-[#027675]"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Junior Lawyers ({juniorCount})
                  </span>
                  {activeTab === "team" && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#027675] rounded-full"></span>
                  )}
                </button>
              )}
              <button
                onClick={() => handleTabChange("info")}
                className={`py-4 text-sm font-semibold border-b-2 transition-all duration-300 relative ${
                  activeTab === "info"
                    ? "border-[#027675] text-[#027675]"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  System Overview
                </span>
                {activeTab === "info" && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#027675] rounded-full"></span>
                )}
              </button>
            </div>

            <div className="p-8 flex-1">
              <div
                className={`transition-all duration-300 ${isTabChanging ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"}`}
              >
                {tabContent[activeTab]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-fade-in"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="relative group max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute -top-4 -right-4 z-10 p-2 bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 rounded-full shadow-lg hover:scale-110 hover:rotate-90 border border-white/20"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-lg border border-white/20 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)]">
              {previewPic ? (
                <img
                  src={previewPic}
                  alt={user?.name || "User"}
                  className="w-full h-auto max-h-[80vh] object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full aspect-square max-h-[80vh] bg-gradient-to-br from-[#027675] to-[#015f5d] flex items-center justify-center">
                  <span className="text-8xl font-bold text-white/30">
                    {user?.name || "?"}
                  </span>
                </div>
              )}

              {/* Subtle gradient overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

              {/* Minimal user info overlay */}
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <p className="text-white text-xl font-semibold drop-shadow-lg">
                  {user?.name || "User"}
                </p>
                <p className="text-white/60 text-sm drop-shadow-lg">
                  {user?.email || "---"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
