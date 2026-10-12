"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Rev 7 entry choreography for a surface: the box draws open top to bottom (clip), then its
 * contents rise in. Plays once when scrolled into view; reduced motion shows the final state.
 * Wrap a <Surface> (the clip applies to the wrapper, so the surface's hover lift still works).
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
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: "inset(0% 0% 100% 0%)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(-8% -4% -12% -4%)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Content inside an Assemble'd surface: fades up after the frame has drawn. */
export function AssembleItem({ children, className = "", delay = 0.25 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
