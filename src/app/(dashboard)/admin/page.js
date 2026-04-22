"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import {
  PageLoader,
  EmptyState,
  Modal,
  SearchInput,
  ConfirmDialog,
} from "@/components/ui";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Database,
} from "lucide-react";

const ROLES = ["admin", "lawyer", "associate"];
const SENIORITIES = ["senior", "junior"];

const roleBadge = {
  admin: "bg-purple-50 text-purple-700 border border-purple-200",
  lawyer: "bg-blue-50 text-blue-700 border border-blue-200",
  associate: "bg-slate-100 text-slate-600 border border-slate-200",
};
const seniorityBadge = {
  senior: "bg-amber-50 text-amber-700",
  junior: "bg-slate-100 text-slate-500",
};

function UserRow({ u, currentUserId, onEdit, onToggle, onDelete }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-primary-700 text-xs font-bold uppercase">
              {u.name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{u.name}</p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${roleBadge[u.role] || roleBadge.lawyer}`}
        >
          {u.role}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${seniorityBadge[u.seniority] || seniorityBadge.junior}`}
        >
          {u.seniority}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {u.isActive ? (
            <UserCheck className="w-3 h-3" />
          ) : (
            <UserX className="w-3 h-3" />
          )}
          {u.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-slate-400">{u.phone || "—"}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(u)}
            className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(u)}
            className={`p-1.5 rounded-md transition-colors ${
              u.isActive
                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                : "text-slate-400 hover:text-green-600 hover:bg-green-50"
            }`}
            title={u.isActive ? "Deactivate" : "Activate"}
            disabled={u._id === currentUserId}
          >
            {u.isActive ? (
              <UserX className="w-3.5 h-3.5" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
          </button>
          {u._id !== currentUserId && (
            <button
              onClick={() => onDelete(u)}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function UserFormModal({ open, onClose, onSaved, editUser }) {
  const isEdit = !!editUser;
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "lawyer",
    seniority: "junior",
    phone: "",
    barCouncilNo: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name || "",
        email: editUser.email || "",
        password: "",
        role: editUser.role || "lawyer",
        seniority: editUser.seniority || "junior",
        phone: editUser.phone || "",
        barCouncilNo: editUser.barCouncilNo || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "lawyer",
        seniority: "junior",
        phone: "",
        barCouncilNo: "",
      });
    }
  }, [editUser]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (!isEdit && !form.password.trim()) {
      toast.error("Password is required for new users.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const { password, email, ...rest } = form;
        await api.patch(`/api/admin/users/${editUser._id}`, rest);
        toast.success("User updated.");
      } else {
        await api.post("/api/admin/users", form);
        toast.success("User created.");
      }
      onSaved();
    } catch (err) {
      toast.error(err?.message || "Failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit User" : "Add New User"}
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              className="input"
              type="email"
              value={form.email}
              disabled={isEdit}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`input ${isEdit ? "bg-slate-50 cursor-not-allowed" : ""}`}
            />
          </div>
          {!isEdit && (
            <div className="sm:col-span-2">
              <label className="label">Password *</label>
              <input
                className="input"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="label">Role</label>
            <select
              className="select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Seniority</label>
            <select
              className="select"
              value={form.seniority}
              onChange={(e) => setForm({ ...form, seniority: e.target.value })}
            >
              {SENIORITIES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              placeholder="+92-300-..."
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Bar Council No.</label>
            <input
              className="input"
              placeholder="LHC-XXXX-XXXX"
              value={form.barCouncilNo}
              onChange={(e) =>
                setForm({ ...form, barCouncilNo: e.target.value })
              }
            />
          </div>
        </div>

        {/* Permission summary */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-600 mb-1.5">Role permissions:</p>
          <p>
            <span className="font-semibold text-purple-700">Admin</span> — full
            access, can manage users, seed data
          </p>
          <p>
            <span className="font-semibold text-blue-700">Lawyer</span> — all
            modules; seniority controls cross-exam review role
          </p>
          <p>
            <span className="font-semibold text-slate-600">Associate</span> —
            cases, applications, cross-exams (junior only)
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await api.get(`/api/admin/users?${params}`);
      setUsers(res?.data?.users || []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers, search]);

  const handleToggle = async (u) => {
    try {
      await api.patch(`/api/admin/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? "User deactivated." : "User activated.");
      fetchUsers();
    } catch {
      toast.error("Failed to update.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/admin/users/${deleteTarget._id}`);
      toast.success("User deactivated.");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Failed.");
    } finally {
      setDeleting(false);
    }
  };

  // Stats
  const active = users.filter((u) => u.isActive).length;
  const admins = users.filter((u) => u.role === "admin").length;
  const seniors = users.filter((u) => u.seniority === "senior").length;

  if (me?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shield className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-600 font-semibold">Admin access required</p>
        <p className="text-sm text-slate-400 mt-1">
          This page is only accessible to administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage team access, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => {
            setEditUser(null);
            setFormOpen(true);
          }}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: Users,
            color: "text-primary-600 bg-primary-50",
          },
          {
            label: "Active",
            value: active,
            icon: UserCheck,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Admins",
            value: admins,
            icon: ShieldCheck,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Senior Lawyers",
            value: seniors,
            icon: Shield,
            color: "text-amber-600 bg-amber-50",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name or email..."
        className="max-w-sm"
      />

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <PageLoader />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Add your first team member."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Seniority</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRow
                    key={u._id}
                    u={u}
                    currentUserId={me?.id}
                    onEdit={(u) => {
                      setEditUser(u);
                      setFormOpen(true);
                    }}
                    onToggle={handleToggle}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditUser(null);
        }}
        onSaved={() => {
          setFormOpen(false);
          setEditUser(null);
          fetchUsers();
        }}
        editUser={editUser}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate User"
        message={`Deactivate ${deleteTarget?.name}? They will lose access but their data will be preserved.`}
        confirmLabel="Deactivate"
        loading={deleting}
      />

      <SeedJudgementsPanel />
    </div>
  );
}

function SeedJudgementsPanel() {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (
      !confirm(
        "Re-seed all Judgement Alert records? Existing alerts will be replaced.",
      )
    )
      return;
    setSeeding(true);
    try {
      await api.post("/api/admin/seed-judgements", {});
      toast.success(
        "18 judgement alerts seeded successfully. Judgement Search is now populated.",
      );
    } catch {
      toast.error("Seeding failed.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="card p-5 border-teal-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
          <Database className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Seed Judgement Database
          </h3>
          <p className="text-xs text-slate-400">
            Populates Judgement Search & Intelligence Feed with 18 sample
            Pakistani court judgements
          </p>
        </div>
      </div>
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="btn-secondary text-sm gap-2"
      >
        {seeding ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Database className="w-4 h-4" />
        )}
        {seeding ? "Seeding..." : "Seed Judgement Alerts"}
      </button>
    </div>
  );
}
