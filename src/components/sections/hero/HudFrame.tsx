"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

const LONS = ["180°W", "120°W", "60°W", "0°", "60°E", "120°E", "180°E"];
const LATS = ["90°N", "60°N", "30°N", "0°", "30°S", "60°S"];

const TICKS_X =
  "repeating-linear-gradient(to right, var(--line-hi) 0 1px, transparent 1px 12px)";
const TICKS_X_MAJOR =
  "repeating-linear-gradient(to right, color-mix(in oklab, var(--text-dim) 70%, transparent) 0 1px, transparent 1px 96px)";
const TICKS_Y =
  "repeating-linear-gradient(to bottom, var(--line-hi) 0 1px, transparent 1px 12px)";
const TICKS_Y_MAJOR =
  "repeating-linear-gradient(to bottom, color-mix(in oklab, var(--text-dim) 70%, transparent) 0 1px, transparent 1px 96px)";

/**
 * Viewport-sized instrument frame: corner brackets draw first, then tick rulers
 * extend along the edges with coordinate labels. Purely decorative.
 */
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

      {/* Top ruler with longitudes */}
      <motion.div
        className="absolute left-12 right-12 top-0 h-2 origin-left md:left-16 md:right-16"
        style={{ backgroundImage: `${TICKS_X_MAJOR}, ${TICKS_X}`, backgroundSize: "100% 100%, 100% 50%", backgroundRepeat: "no-repeat" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={t(0.3, 0.7)}
      />
      <motion.div
        className="absolute left-12 right-12 top-6 hidden justify-between font-mono text-[10px] tracking-widest text-dim/70 md:left-16 md:right-16 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(0.8)}
      >
        {LONS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </motion.div>

      {/* Left ruler with latitudes */}
      <motion.div
        className="absolute bottom-12 left-0 top-12 w-2 origin-top md:bottom-16 md:top-16"
        style={{ backgroundImage: `${TICKS_Y_MAJOR}, ${TICKS_Y}`, backgroundSize: "100% 100%, 50% 100%", backgroundRepeat: "no-repeat" }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={t(0.35, 0.7)}
      />
      <motion.div
        className="absolute bottom-16 left-3 top-16 hidden flex-col justify-between font-mono text-[10px] tracking-widest text-dim/70 lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(0.85)}
      >
        {LATS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </motion.div>

      {/* Bottom ruler (minor ticks only) and right hairline */}
      <motion.div
        className="absolute bottom-0 left-12 right-12 h-1.5 origin-right md:left-16 md:right-16"
        style={{ backgroundImage: TICKS_X, opacity: 0.6 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={t(0.4, 0.7)}
      />
      <motion.div
        className="absolute bottom-12 right-0 top-12 w-px origin-bottom bg-line-hi md:bottom-16 md:top-16"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={t(0.45, 0.7)}
      />

      {/* Corner coordinate stamps */}
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
