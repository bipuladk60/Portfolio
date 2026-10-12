"use client";

import { motion, useReducedMotion } from "motion/react";

/** "BEGIN ASCENT" link to the first camp, with chevrons that climb in sequence. */
export function ScrollCue({ href = "#telemetry" }: { href?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href={href}
      className="group inline-flex flex-col items-center gap-1.5 px-3 py-2 text-dim transition-colors hover:text-signal focus-visible:text-signal"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.75, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <span className="hud-label text-current!">Begin ascent</span>
      <span aria-hidden className="flex flex-col items-center -space-y-1.5">
        {[0, 1, 2].map((i) => (
          <motion.svg
            key={i}
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            animate={reduce ? { opacity: 0.8 } : { opacity: [0.15, 1, 0.15] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
          >
            <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>
        ))}
      </span>
    </motion.a>
  );
}
