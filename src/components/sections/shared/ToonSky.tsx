"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { INK } from "@/components/toon/toon";
import { mulberry32, r1 } from "./prng";

const PUFFS = [
  { cx: 30, cy: 40, r: 17 },
  { cx: 55, cy: 30, r: 23 },
  { cx: 82, cy: 36, r: 19 },
  { cx: 100, cy: 44, r: 12 },
];

/** Outlined cartoon cloud: shade, then ink strokes, then white fills so only the outer edge keeps its line. */
export function ToonCloud({ className = "", style, dur = 14 }: { className?: string; style?: React.CSSProperties; dur?: number }) {
  const shape = (
    <>
      {PUFFS.map((p, i) => (
        <circle key={i} {...p} />
      ))}
      <rect x="14" y="40" width="96" height="16" rx="8" />
    </>
  );
  return (
    <svg viewBox="0 0 124 64" className={className} style={style} aria-hidden>
      <g className="wr-drift" style={{ animationDuration: `${dur}s` }}>
        <g fill="#a9d4f5" transform="translate(4 5)">
          {shape}
        </g>
        <g fill="none" stroke={INK} strokeWidth="4.5">
          {shape}
        </g>
        <g fill="#ffffff">{shape}</g>
      </g>
    </svg>
  );
}

type Props = {
  /** gradient stops, top to bottom; chain sections so the sky reads as one continuous day */
  from: string;
  to: string;
  seed?: number;
  clouds?: number;
  children?: React.ReactNode;
};

/**
 * Full-bleed day-sky backdrop for a chapter-2 section. Put it first inside a CampSection that has
 * `overflow-hidden`; it fills the whole section (padding included). Clouds drift via CSS and pause offscreen.
 */
export function ToonSky({ from, to, seed = 7, clouds = 4, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const rng = mulberry32(seed);
  const placed = Array.from({ length: clouds }, (_, i) => ({
    left: r1(((i + rng() * 0.6) / clouds) * 92),
    top: r1(6 + rng() * 78),
    w: Math.round(70 + rng() * 80),
    dur: Math.round(11 + rng() * 9),
    o: r1(0.55 + rng() * 0.35),
  }));
  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 left-1/2 -z-0 w-[100vw] -translate-x-1/2 ${inView ? "" : "wr-paused"}`}
      style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }}
    >
      {placed.map((c, i) => (
        <ToonCloud
          key={i}
          className="absolute"
          style={{ left: `${c.left}%`, top: `${c.top}%`, width: c.w, opacity: c.o }}
          dur={c.dur}
        />
      ))}
      {children}
    </div>
  );
}
