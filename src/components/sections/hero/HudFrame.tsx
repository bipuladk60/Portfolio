"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Viewport-sized instrument frame: four corner brackets and two corner coordinate stamps. Decorative. */
export function HudFrame() {
  const reduce = useReducedMotion();
  const t = (delay: number, duration = 0.5) => ({ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease: EASE });

  const corner = "absolute h-6 w-6 border-signal/80 md:h-10 md:w-10";
  const corners = [
    { cls: "left-0 top-0 border-l-2 border-t-2", o: "top left" },
    { cls: "right-0 top-0 border-r-2 border-t-2", o: "top right" },
    { cls: "bottom-0 left-0 border-b-2 border-l-2", o: "bottom left" },
    { cls: "bottom-0 right-0 border-b-2 border-r-2", o: "bottom right" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-3 z-0 select-none md:inset-6">
      {corners.map((c, i) => (
        <motion.span
          key={c.o}
          className={`${corner} ${c.cls}`}
          style={{ transformOrigin: c.o }}
          initial={{ opacity: 0, scale: 1.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={t(0.05 + i * 0.06, 0.45)}
        />
      ))}

      <motion.div
        className="absolute bottom-3 left-4 font-mono text-[10px] tracking-widest text-dim/80 md:bottom-4 md:left-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(0.9)}
      >
        28.39° N · 84.12° E
      </motion.div>
      <motion.div
        className="absolute bottom-3 right-4 hidden font-mono text-[10px] tracking-widest text-dim/80 sm:block md:bottom-4 md:right-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(0.95)}
      >
        31.33° N · 89.29° W
      </motion.div>
    </div>
  );
}
