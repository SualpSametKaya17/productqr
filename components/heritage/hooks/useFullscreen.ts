"use client";

import { useCallback, useEffect, useState, RefObject } from "react";

/**
 * Drives the Fullscreen API for a given element and tracks its state.
 */
export function useFullscreen<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [ref]);

  return { isFullscreen, toggle };
}
