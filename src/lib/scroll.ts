import { prefersReducedMotion } from "./motion";

type LenisLike = { scrollTo: (target: HTMLElement, opts?: { offset?: number }) => void };

/** Scroll to a camp section by id. Uses a global Lenis instance if one is exposed as `window.lenis`. */
export function scrollToCamp(id: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(el);
    return;
  }
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}
