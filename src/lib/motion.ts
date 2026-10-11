// Shared motion constants so every chrome element moves with the same hand.
export const EASE_HUD = [0.2, 0.8, 0.2, 1] as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
