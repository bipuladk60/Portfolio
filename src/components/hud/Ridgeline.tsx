"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { mulberry32 } from "@/components/sections/shared/prng";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const W = 1440;
const H = 240;
const N = 181;

type Peak = { c: number; h: number; w: number };
type Layer = { seed: number; base: number; peaks: Peak[]; rough: number };

const round = (v: number) => Math.round(v * 10) / 10;

/** Sharp Himalayan profile: the highest of several triangular-ish peaks, plus a smoothed random walk for the jagged edge. */
function profile({ seed, base, peaks, rough }: Layer) {
  const rnd = mulberry32(seed);
  const pts: [number, number][] = [];
  let walk = 0;
  for (let i = 0; i < N; i++) {
    const x = (W * i) / (N - 1);
    walk = walk * 0.62 + (rnd() - 0.5) * rough;
    let lift = 0;
    for (const p of peaks) {
      const t = 1 - Math.abs(x - p.c) / p.w;
      if (t > 0) lift = Math.max(lift, p.h * Math.pow(t, 1.35));
    }
    pts.push([round(x), round(Math.min(H - 4, base - lift + walk))]);
  }
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  return { line, fill: `${line}V${H}H0Z` };
}

const LAYERS = [
  profile({
    seed: 8849,
    base: 150,
    rough: 9,
    peaks: [
      { c: 180, h: 70, w: 260 },
      { c: 560, h: 96, w: 300 },
      { c: 905, h: 128, w: 330 },
      { c: 1260, h: 88, w: 280 },
    ],
  }),
  profile({
    seed: 6190,
    base: 186,
    rough: 7,
    peaks: [
      { c: 60, h: 52, w: 220 },
      { c: 400, h: 70, w: 260 },
      { c: 760, h: 58, w: 240 },
      { c: 1120, h: 82, w: 300 },
      { c: 1420, h: 50, w: 200 },
    ],
  }),
  profile({
    seed: 1400,
    base: 214,
    rough: 5,
    peaks: [
      { c: 250, h: 34, w: 300 },
      { c: 690, h: 26, w: 260 },
      { c: 1010, h: 40, w: 320 },
      { c: 1360, h: 22, w: 220 },
    ],
  }),
];

const FILLS = [
  "color-mix(in oklab, var(--line) 62%, var(--bg))",
  "color-mix(in oklab, var(--line) 38%, var(--bg))",
  "color-mix(in oklab, var(--bg) 94%, var(--line))",
];
const DEPTH = [70, 36, 12]; // scroll parallax (px over the first ~900 px of scroll), back moves most
const SWAY = [6, 12, 20]; // pointer parallax (px), front moves most

/**
 * Layered Himalayan ridge silhouette for the bottom edge of a section. Three ranges, back to front,
 * each with a hairline crest; the far range carries a faint snowline. Scroll moves the ranges at
 * different speeds and the pointer sways them slightly. Decorative (aria-hidden); reduced motion is static.
 * Place inside a `relative overflow-hidden` parent; size with className (e.g. "inset-x-0 bottom-0 h-[26vh]").
 */
export function Ridgeline({ className = "", accent = "var(--signal)" }: { className?: string; accent?: string }) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const px = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18, mass: 0.8 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => px.set(e.clientX / window.innerWidth - 0.5);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px]);

  const y0 = useTransform(scrollY, [0, 900], reduce ? [0, 0] : [0, DEPTH[0]]);
  const y1 = useTransform(scrollY, [0, 900], reduce ? [0, 0] : [0, DEPTH[1]]);
  const y2 = useTransform(scrollY, [0, 900], reduce ? [0, 0] : [0, DEPTH[2]]);
  const x0 = useTransform(sx, (v) => -v * SWAY[0]);
  const x1 = useTransform(sx, (v) => -v * SWAY[1]);
  const x2 = useTransform(sx, (v) => -v * SWAY[2]);
  const ys = [y0, y1, y2];
  const xs = [x0, x1, x2];

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        maskImage: "linear-gradient(to bottom, #000 62%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 62%, transparent)",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <defs>
          <clipPath id={`snow-${id}`}>
            <rect x="0" y="0" width={W} height="58" />
          </clipPath>
          <linearGradient id={`crest-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={accent} stopOpacity="0" />
            <stop offset="0.5" stopColor={accent} stopOpacity="0.6" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {LAYERS.map((l, i) => (
          <motion.g key={i} style={{ y: ys[i], x: xs[i] }}>
            <motion.path
              d={l.fill}
              fill={FILLS[i]}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 + i * 0.15, ease: EASE }}
            />
            {i === 0 && <path d={l.fill} fill="var(--text)" opacity={0.07} clipPath={`url(#snow-${id})`} />}
            <motion.path
              d={l.line}
              stroke={i === 2 ? `url(#crest-${id})` : "var(--line-hi)"}
              strokeWidth={i === 2 ? 1.4 : 1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              opacity={i === 1 ? 0.7 : 1}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, delay: 0.2 + i * 0.2, ease: EASE }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
