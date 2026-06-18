"use client";

let state = { visible: false, requestId: 0 };
let pendingOnComplete = null;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeLogoutOverlay(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLogoutOverlaySnapshot() {
  return state;
}

export function triggerLogoutOverlay(onComplete) {
  if (state.visible) return;
  pendingOnComplete = typeof onComplete === "function" ? onComplete : null;
  state = { visible: true, requestId: state.requestId + 1 };
  emit();
}

export function resolveLogoutOverlay() {
  const cb = pendingOnComplete;
  pendingOnComplete = null;
  state = { visible: false, requestId: state.requestId };
  emit();
  if (cb) cb();
}
