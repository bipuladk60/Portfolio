"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { EASE_HUD } from "@/lib/motion";

// Lungta order, left to right: blue (sky), white (air), red (fire), green (water), yellow (earth).
export const FLAG_ORDER = ["var(--sky)", "var(--air)", "var(--fire)", "var(--water)", "var(--signal)"];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A strung line of flags plus a cascade of loose flags falling and fluttering for ~3s. */
export function PrayerFlagCascade({ seed, reduce }: { seed: number; reduce: boolean }) {
  const flags = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 40 }, (_, i) => ({
      color: FLAG_ORDER[i % 5],
      x: (i / 40) * 100 + (r() - 0.5) * 6,
      delay: r() * 0.9,
      dur: 1.7 + r() * 0.8,
      sway: 20 + r() * 50,
      spin: (r() - 0.5) * 220,
      size: 0.8 + r() * 0.5,
    }));
  }, [seed]);

  const strung = 15;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      {/* the string across the top */}
      <motion.div
        className="absolute inset-x-0 top-0"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: [-60, 0, 0, -60], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 3, times: [0, 0.15, 0.82, 1], ease: EASE_HUD }}
      >
        <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-10 w-full">
          <path d="M0 6 Q500 34 1000 6" stroke="var(--line-hi)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute inset-x-0 top-0 flex justify-between px-[2%]">
          {Array.from({ length: strung }, (_, i) => {
            const t = (i + 0.5) / strung;
            const sag = 4 * t * (1 - t) * 28; // follows the quadratic string
            return (
              <motion.span
                key={i}
                className="block h-6 w-[4.2vw] max-w-9 origin-top"
                style={{ background: FLAG_ORDER[i % 5], marginTop: 6 + sag, opacity: 0.9 }}
                animate={reduce ? undefined : { skewY: [0, 6, -4, 5, 0], scaleY: [1, 0.92, 1.04, 0.95, 1] }}
                transition={{ duration: 1.1, repeat: 2, ease: "easeInOut", delay: i * 0.05 }}
              />
            );
          })}
        </div>
      </motion.div>

      {!reduce &&
        flags.map((f, i) => (
          <motion.span
            key={i}
            className="absolute top-0 block"
            style={{
              left: `${f.x}%`,
              width: 18 * f.size,
              height: 24 * f.size,
              background: f.color,
              opacity: 0.88,
              boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.12)",
            }}
            initial={{ y: "-8vh", x: 0, rotate: 0 }}
            animate={{
              y: ["-8vh", "112vh"],
              x: [0, f.sway, -f.sway * 0.6, f.sway * 0.4],
              rotate: [0, f.spin * 0.4, -f.spin * 0.3, f.spin],
              rotateY: [0, 60, -40, 70],
            }}
            transition={{ duration: f.dur, delay: f.delay, ease: [0.35, 0, 0.6, 1] }}
          />
        ))}
    </div>
  );
}
