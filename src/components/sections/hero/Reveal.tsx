"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/lib/reveal";

const EASE = [0.2, 0.8, 0.2, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number; // seconds
  y?: number;
  x?: number;
  /** "mount" plays on load (hero); "view" plays when scrolled into view. */
  trigger?: "mount" | "view";
};

/** Small client island: slides content up from a hairline mask. Server markup stays inside. */
export function Reveal({ children, className = "", delay = 0, y = 14, x = 0, trigger = "mount" }: RevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useReveal(ref, "0px 0px -12% 0px");
  const shown = trigger === "mount" || inView;
  const target = { opacity: 1, y: 0, x: 0 };
  const transition = { duration: reduce ? 0 : 0.55, delay: reduce ? 0 : delay, ease: EASE };
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={shown ? target : { opacity: 0, y, x }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
