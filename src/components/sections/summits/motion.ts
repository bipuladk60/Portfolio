"use client";

import { useSyncExternalStore } from "react";

/** House easing from DESIGN.md. */
export const EASE = [0.2, 0.8, 0.2, 1] as const;

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Hydration-safe reduced-motion flag: always `false` on the server and during hydration,
 * then the real preference. Use it for anything that changes markup.
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
