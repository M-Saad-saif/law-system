"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

const RouteTransitionContext = createContext({ isLoading: false });

const SHOW_DELAY_MS = 100;
const MIN_VISIBLE_MS = 380;
const SAFETY_TIMEOUT_MS = 8000;

const historyListeners = new Set();
let historyPatched = false;

function patchHistoryOnce() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;

  const originalPush = window.history.pushState.bind(window.history);
  const originalReplace = window.history.replaceState.bind(window.history);

  window.history.pushState = function (...args) {
    historyListeners.forEach((fn) => fn());
    return originalPush(...args);
  };
  window.history.replaceState = function (...args) {
    historyListeners.forEach((fn) => fn());
    return originalReplace(...args);
  };
}

function isRoutableAnchor(anchor) {
  if (!anchor || !(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.dataset.noRouteLoader !== undefined) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    const current = window.location.pathname + window.location.search;
    const target = url.pathname + url.search;
    if (target === current) return false;

    return true;
  } catch {
    return false;
  }
}

export function RouteTransitionProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const safetyTimer = useRef(null);
  const shownAt = useRef(0);
  const pending = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  const startLoading = useCallback(() => {
    pending.current = true;
    clearTimeout(hideTimer.current);

    if (!visibleRef.current && !showTimer.current) {
      showTimer.current = setTimeout(() => {
        showTimer.current = null;
        if (pending.current) {
          shownAt.current = Date.now();
          setVisible(true);
        }
      }, SHOW_DELAY_MS);
    }

    clearTimeout(safetyTimer.current);
    safetyTimer.current = setTimeout(() => {
      pending.current = false;
      setVisible(false);
    }, SAFETY_TIMEOUT_MS);
  }, []);

  const stopLoading = useCallback(() => {
    pending.current = false;
    clearTimeout(showTimer.current);
    showTimer.current = null;
    clearTimeout(safetyTimer.current);

    if (!visibleRef.current) return;

    const elapsed = Date.now() - shownAt.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), remaining);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target?.closest?.("a");
      if (isRoutableAnchor(anchor)) startLoading();
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [startLoading]);

  useEffect(() => {
    window.addEventListener("popstate", startLoading);
    return () => window.removeEventListener("popstate", startLoading);
  }, [startLoading]);

  useEffect(() => {
    patchHistoryOnce();
    historyListeners.add(startLoading);
    return () => historyListeners.delete(startLoading);
  }, [startLoading]);

  const searchKey = searchParams?.toString() ?? "";
  useEffect(() => {
    stopLoading();
  }, [pathname, searchKey, stopLoading]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
      clearTimeout(safetyTimer.current);
    };
  }, []);

  return (
    <RouteTransitionContext.Provider value={{ isLoading: visible }}>
      {children}
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  return useContext(RouteTransitionContext);
}
