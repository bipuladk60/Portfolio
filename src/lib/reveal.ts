"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInView, type UseInViewOptions } from "motion/react";

/**
 * Once-only scroll reveal that cannot get stuck.
 *
 * `whileInView` alone has two failure modes:
 * 1. A fully closed clip-path / scale 0 / overflow-clipped start state has zero visible area, so the
 *    IntersectionObserver only sees it while its collapsed edge sits inside the viewport. Land with
 *    that edge above the viewport (reload or back mid-page, deep jump, tall card on mobile) and it
 *    never reports intersecting. Fix: pass the ref of an UNCLIPPED wrapper and animate the inner element.
 * 2. Anything the visitor jumped past entirely stays hidden above them. Fix: reveal as soon as the
 *    element's top is above the viewport (checked on mount and on scroll until revealed).
 */
export function useReveal(ref: RefObject<Element | null>, margin: UseInViewOptions["margin"] = "0px 0px -10% 0px") {
  const inView = useInView(ref, { once: true, margin });
  const [passed, setPassed] = useState(false);
  const shown = inView || passed;

  useEffect(() => {
    if (shown) return;
    const check = () => {
      const el = ref.current;
      if (el && el.getBoundingClientRect().top < 0) setPassed(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [shown, ref]);

  return shown;
}
