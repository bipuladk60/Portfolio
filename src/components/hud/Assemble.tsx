"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/lib/reveal";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Whether the nearest Assemble has been revealed; items inside follow it instead of observing themselves. */
const AssembledContext = createContext<boolean | null>(null);

/**
 * Rev 7 entry choreography for a surface: the box draws open top to bottom (clip), then its
 * contents rise in. Plays once when scrolled into view; reduced motion shows the final state.
 * Wrap a <Surface> (the clip applies to the inner layer, so the surface's hover lift still works).
 *
 * The in-view trigger sits on an unclipped outer wrapper: a fully closed clip has zero area, so
 * observing the clipped element itself never fires if the visitor lands with its top edge above
 * the viewport (reload mid-page, deep jump, tall cluster on mobile).
 */
export function Assemble({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const shown = useReveal(wrap, "0px 0px -10% 0px");
  const hidden = { clipPath: "inset(0% 0% 100% 0%)", opacity: 0.4 };
  const open = { clipPath: "inset(-8% -4% -12% -4%)", opacity: 1 };
  return (
    <div ref={wrap} className={className}>
      <motion.div
        initial={reduce ? false : hidden}
        animate={shown || reduce ? open : hidden}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: EASE }}
      >
        <AssembledContext.Provider value={shown || !!reduce}>{children}</AssembledContext.Provider>
      </motion.div>
    </div>
  );
}

/** Content inside an Assemble'd surface: fades up after the frame has drawn. */
export function AssembleItem({ children, className = "", delay = 0.25 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const parent = useContext(AssembledContext);
  const ref = useRef<HTMLDivElement>(null);
  // Outside an Assemble, observe itself (it has no clip of its own, so that is safe).
  const own = useReveal(ref, "0px 0px -10% 0px");
  const shown = parent ?? own;
  const hidden = { opacity: 0, y: 10 };
  const open = { opacity: 1, y: 0 };
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : hidden}
      animate={shown || reduce ? open : hidden}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
