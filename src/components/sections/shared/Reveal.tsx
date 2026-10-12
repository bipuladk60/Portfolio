"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/lib/reveal";
import { EASE } from "./prng";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Scroll-in assembly used by the later camps. Same initial state on server and client; reduced motion snaps. */
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useReveal(ref, "-8% 0px");
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
