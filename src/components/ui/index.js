"use client";

import { useEffect } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/utils/helpers";

// ----------------- Spinner -----------------
export function Spinner({ size = "md", className }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <Loader2
      className={cn("animate-spin text-primary-500", sizes[size], className)}
    />
  );
}

// ----------------- Loading Page -----------------
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );
}

// ----------------- Skeleton -----------------
export function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} />;
}

// ----------------- Modal ----------------------------------
export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={cn("modal w-full", sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="text-lg font-bold text-slate-800 font-display">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ----------------- Confirm Dialog -----------------
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading,
}) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (
              <Spinner size="sm" className="text-white" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------- Empty State -----------------─
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 mb-4 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  );
}

// ----------------- Badge ----------------------------------
export function StatusBadge({ status }) {
  const classes = {
    Active: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Closed: "bg-slate-100 text-slate-600 border border-slate-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-100",
    Adjourned: "bg-orange-50 text-orange-700 border border-orange-100",
    Disposed: "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span className={cn("badge", classes[status] || "badge-pending")}>
      {status}
    </span>
  );
}

// ----------------- Priority Badge -----------------
export function PriorityBadge({ priority }) {
  const classes = {
    high: "bg-red-50 text-red-700 border border-red-100",
    medium: "bg-amber-50 text-amber-700 border border-amber-100",
    low: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span
      className={cn("badge capitalize", classes[priority] || classes.medium)}
    >
      {priority}
    </span>
  );
}

// ----------------- Stats Card -----------------──
export function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="stat-card">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          colors[color] || colors.blue,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5 font-display">
          {value ?? "—"}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ----------------- Tab Bar -----------------─
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            active === tab.id
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
          {tab.label}
          {tab.count != null && (
            <span
              className={cn(
                "ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold",
                active === tab.id
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-200 text-slate-500",
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ----------------- Search Input -----------------─
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) {
  return (
    <div className={cn("relative", className)}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        className="input pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
