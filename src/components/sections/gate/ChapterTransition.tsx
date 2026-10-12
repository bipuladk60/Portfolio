"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GREEN, INK, ORANGE, RED, SKY_BOTTOM, SKY_TOP, YELLOW } from "@/components/toon/toon";

type Phase = "bloom" | "flash" | "sky" | "out";

type Props = {
  /** viewport point the heat bloom starts from (the globe) */
  origin: { x: number; y: number };
  /** fired once the screen is fully covered: unlock + jump the scroll underneath */
  onCovered: () => void;
  onDone: () => void;
};

const PUFFS = [
  { cx: 30, cy: 40, r: 17 },
  { cx: 55, cy: 30, r: 23 },
  { cx: 82, cy: 36, r: 19 },
  { cx: 100, cy: 44, r: 12 },
];

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 124 64" className={className} aria-hidden>
      <g fill="none" stroke={INK} strokeWidth="4.5">
        {PUFFS.map((p, i) => (
          <circle key={i} {...p} />
        ))}
        <rect x="14" y="40" width="96" height="16" rx="8" />
      </g>
      <g fill="#ffffff">
        {PUFFS.map((p, i) => (
          <circle key={i} {...p} />
        ))}
        <rect x="14" y="40" width="96" height="16" rx="8" />
      </g>
    </svg>
  );
}

const CLOUDS = [
  { top: "12%", w: 220, from: -1 },
  { top: "30%", w: 300, from: 1 },
  { top: "52%", w: 260, from: -1 },
  { top: "70%", w: 340, from: 1 },
  { top: "86%", w: 240, from: -1 },
];

/**
 * The chapter break. Heat blooms out of the globe, the screen flashes "found it" green,
 * then Warmer's day sky and clouds roll over everything. While covered, the page switches
 * to chapter 2 and jumps to #games; then the clouds part. ~2.3 s, skippable, reduced motion = crossfade.
 */
export function ChapterTransition({ origin, onCovered, onDone }: Props) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce ? "sky" : "bloom");
  const covered = useRef(false);
  const timers = useRef<number[]>([]);
  const cover = useRef(onCovered);
  const done = useRef(onDone);
  cover.current = onCovered;
  done.current = onDone;

  useEffect(() => {
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const doCover = () => {
      if (covered.current) return;
      covered.current = true;
      cover.current();
    };
    if (reduce) {
      at(220, doCover);
      at(260, () => setPhase("out"));
      at(600, () => done.current());
    } else {
      at(620, () => setPhase("flash"));
      at(1150, () => setPhase("sky"));
      at(1600, doCover);
      at(1750, () => setPhase("out"));
      at(2450, () => done.current());
    }
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  const born = useRef(0);
  useEffect(() => {
    born.current = performance.now();
  }, []);

  const skip = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    if (!covered.current) {
      covered.current = true;
      cover.current();
    }
    setPhase("out");
    timers.current.push(window.setTimeout(() => done.current(), 320));
  };

  useEffect(() => {
    // Only Escape skips (Enter is how the answer gets submitted), and ignore keys right after mount.
    const mountedAt = performance.now();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && performance.now() - mountedAt > 600) skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const reach =
    2 *
    Math.max(
      Math.hypot(origin.x, origin.y),
      Math.hypot(vw - origin.x, origin.y),
      Math.hypot(origin.x, vh - origin.y),
      Math.hypot(vw - origin.x, vh - origin.y),
    );
  const out = phase === "out";
  const showSky = phase === "sky" || out;

  const node = (
    <motion.div
      className="fixed inset-0 z-[90] cursor-pointer overflow-hidden"
      onClick={() => {
        // the click that submitted the answer can land here; ignore clicks in the first moments
        if (performance.now() - born.current > 600) skip();
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: out ? 0 : 1 }}
      transition={{ duration: reduce ? 0.3 : 0.6, ease: [0.2, 0.8, 0.2, 1], delay: out && !reduce ? 0.25 : 0 }}
    >
      {/* heat bloom from the globe */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: origin.x - reach / 2,
            top: origin.y - reach / 2,
            width: reach,
            height: reach,
            background: `radial-gradient(circle, ${RED} 0%, ${ORANGE} 30%, ${YELLOW} 58%, #fff3c4 72%)`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.65, ease: [0.3, 0, 0.2, 1] }}
        />
      )}

      {/* found-it flash */}
      <AnimatePresence>
        {(phase === "flash" || phase === "sky") && !reduce && (
          <motion.div
            key="flash"
            aria-hidden
            className="absolute inset-0"
            style={{ background: GREEN }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "flash" ? 0.9 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* the day sky rolls in */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, ${SKY_TOP}, ${SKY_BOTTOM})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showSky ? 1 : 0 }}
        transition={{ duration: reduce ? 0.2 : 0.45 }}
      />
      {!reduce &&
        CLOUDS.map((c, i) => (
          <motion.div
            key={i}
            aria-hidden
            className="absolute"
            style={{ top: c.top, left: "50%", width: c.w, marginLeft: -c.w / 2 }}
            initial={{ x: c.from * (vw / 2 + c.w) }}
            animate={{ x: out ? -c.from * (vw / 2 + c.w) : showSky ? c.from * (i * 40 - 80) : c.from * (vw / 2 + c.w) }}
            transition={{ duration: out ? 0.7 : 0.6, ease: [0.2, 0.8, 0.2, 1], delay: out ? i * 0.03 : i * 0.05 }}
          >
            <Cloud className="block h-auto w-full" />
          </motion.div>
        ))}

      {/* words */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {phase !== "bloom" && !out && (
            <motion.div
              key={phase === "flash" ? "found" : "chapter"}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.85, y: reduce ? 0 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ color: INK }}
            >
              {phase === "flash" ? (
                <p className="font-[family-name:var(--font-fredoka)] text-5xl font-bold md:text-7xl">Found it: Nepal</p>
              ) : (
                <>
                  <p className="font-[family-name:var(--font-nunito)] text-sm font-extrabold uppercase tracking-[0.2em]">Chapter 2</p>
                  <p className="mt-2 font-[family-name:var(--font-fredoka)] text-4xl font-bold md:text-6xl">Welcome to Warmer</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!out && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
          className="absolute bottom-6 right-6 cursor-pointer rounded-full border-2 bg-white px-4 py-1.5 font-[family-name:var(--font-nunito)] text-sm font-extrabold"
          style={{ borderColor: INK, color: INK, boxShadow: `3px 3px 0 ${INK}` }}
        >
          Skip
        </button>
      )}
    </motion.div>
  );

  return typeof document === "undefined" ? null : createPortal(node, document.body);
}
