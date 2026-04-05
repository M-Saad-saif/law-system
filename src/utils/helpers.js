import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';

export function formatDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return '—';
  return format(new Date(date), fmt);
}

export function formatDateTime(date) {
  if (!date) return '—';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
}

export function relativeDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isPast(d)) return formatDistanceToNow(d, { addSuffix: true });
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getStatusClass(status) {
  const map = {
    Active: 'badge-active',
    Closed: 'badge-closed',
    Pending: 'badge-pending',
    Adjourned: 'badge-adjourned',
    Disposed: 'badge-closed',
  };
  return map[status] || 'badge-pending';
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function generateCaseNumber(prefix = 'CASE') {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${rand}`;
}

export function truncate(str, n = 40) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '...' : str;
}

export function fileSizeLabel(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
