// utils/crossExamApi.js
// Typed client-side fetch helpers for all cross-exam API endpoints.
// All functions throw with the server's { error } message on failure.
// Import apiFetch from your existing utils/api.js — these wrappers use it.

import { apiFetch } from "@/utils/api";

// ─── Cross-Examination CRUD ───────────────────────────────────────────────

export const listCrossExams = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/cross-exams?${qs}`);
};

export const getCrossExam = (id) => apiFetch(`/api/cross-exams/${id}`);

export const createCrossExam = (body) =>
  apiFetch("/api/cross-exams", { method: "POST", body: JSON.stringify(body) });

export const updateCrossExam = (id, body) =>
  apiFetch(`/api/cross-exams/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteCrossExam = (id) =>
  apiFetch(`/api/cross-exams/${id}`, { method: "DELETE" });

// ─── Workflow actions ─────────────────────────────────────────────────────

export const submitCrossExam = (id, message = "") =>
  apiFetch(`/api/cross-exams/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

export const assignCrossExam = (id, assignedTo) =>
  apiFetch(`/api/cross-exams/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ assignedTo }),
  });

export const startReview = (id) =>
  apiFetch(`/api/cross-exams/${id}/start-review`, {
    method: "POST",
    body: "{}",
  });

export const requestChanges = (id, notes = "") =>
  apiFetch(`/api/cross-exams/${id}/request-changes`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });

export const resubmitCrossExam = (id, message = "") =>
  apiFetch(`/api/cross-exams/${id}/resubmit`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

export const approveCrossExam = (id, message = "") =>
  apiFetch(`/api/cross-exams/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });

// ─── Witnesses ────────────────────────────────────────────────────────────

export const listWitnesses = (examId) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses`);

export const addWitness = (examId, body) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateWitness = (examId, wId, body) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses/${wId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteWitness = (examId, wId) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses/${wId}`, { method: "DELETE" });

// ─── QA Pairs ─────────────────────────────────────────────────────────────

export const addQAPair = (examId, wId, body) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses/${wId}/qa`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const editQAPair = (examId, wId, qaId, body) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses/${wId}/qa/${qaId}/edit`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const flagQAPair = (examId, wId, qaId, body) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses/${wId}/qa/${qaId}/flag`, {
    method: "POST",
    body: JSON.stringify(body),
  });

// ─── Comments ─────────────────────────────────────────────────────────────

export const addComment = (examId, wId, qaId, body) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses/${wId}/qa/${qaId}/comment`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const resolveComment = (examId, wId, qaId, commentId, resolved) =>
  apiFetch(`/api/cross-exams/${examId}/witnesses/${wId}/qa/${qaId}/comment`, {
    method: "PUT",
    body: JSON.stringify({ commentId, resolved }),
  });

// ─── Versions ─────────────────────────────────────────────────────────────

export const getVersionHistory = (examId) =>
  apiFetch(`/api/cross-exams/${examId}/versions`);

export const compareVersions = (examId, versionA, versionB) =>
  apiFetch(
    `/api/cross-exams/${examId}/compare?versionA=${versionA}&versionB=${versionB}`,
  );

// ─── PDF ──────────────────────────────────────────────────────────────────

/** Opens the PDF in a new tab — the page auto-triggers window.print() */
export const openPDF = (examId) => {
  window.open(`/api/cross-exams/${examId}/pdf`, "_blank");
};
