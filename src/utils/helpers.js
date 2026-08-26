import {
  format,
  isToday,
  isTomorrow,
  isPast,
  formatDistanceToNow,
} from "date-fns";

const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);

export function parseDate(value) {
  if (value === null || value === undefined || value === "") return null;

  const trimmed = String(value).trim();

  if (trimmed === "") return null;

  // Purely numeric values in a date column are almost always Excel serial
  // dates (e.g. 45896 => 25 Aug 2025), NOT years. `new Date("45896")` would
  // otherwise be parsed as the year 45896 -> "1 Jan 45896".
  if (/^[+-]?\d+(\.\d+)?$/.test(trimmed)) {
    const serial = Number(trimmed);
    if (Number.isFinite(serial) && serial > 0) {
      return new Date(EXCEL_EPOCH_MS + serial * 86400000);
    }
  }

  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(date, fmt = "dd MMM yyyy") {
  if (!date) return "—";
  return format(new Date(date), fmt);
}

export function formatDateTime(date) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function relativeDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isPast(d)) return formatDistanceToNow(d, { addSuffix: true });
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getStatusClass(status) {
  const map = {
    Active: "badge-active",
    Closed: "badge-closed",
    Pending: "badge-pending",
    Adjourned: "badge-adjourned",
    Disposed: "badge-closed",
  };
  return map[status] || "badge-pending";
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function generateCaseNumber(prefix = "CASE") {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${rand}`;
}

export function truncate(str, n = 40) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "..." : str;
}

export function fileSizeLabel(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
