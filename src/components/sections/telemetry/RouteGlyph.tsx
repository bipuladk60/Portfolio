"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/lib/reveal";

type BBox = [number, number, number, number];
type Slot = { x: number; y: number; w: number; h: number };

const EASE = [0.2, 0.8, 0.2, 1] as const;
const r1 = (v: number) => Math.round(v * 10) / 10;

/** Fits a bbox into a slot (contain, centred) and returns the transform plus a point mapper. */
function fitTo([x0, y0, x1, y1]: BBox, s: Slot) {
  const k = Math.min(s.w / (x1 - x0), s.h / (y1 - y0));
  const ox = s.x + (s.w - (x1 - x0) * k) / 2 - x0 * k;
  const oy = s.y + (s.h - (y1 - y0) * k) / 2 - y0 * k;
  return {
    transform: `translate(${r1(ox)} ${r1(oy)}) scale(${Math.round(k * 1000) / 1000})`,
    k,
    at: ([x, y]: [number, number]) => [r1(ox + x * k), r1(oy + y * k)] as const,
  };
}

const NP_SLOT: Slot = { x: 8, y: 34, w: 84, h: 34 };
const US_SLOT: Slot = { x: 232, y: 16, w: 112, h: 58 };

/**
 * A small Nepal -> Mississippi glyph: the two real outlines (Natural Earth, same paths as the hero
 * map) joined by an arc that draws itself in. Decorative; the text next to it carries the facts.
 */
export function RouteGlyph({
  nepalPath,
  usaPath,
  nepalBox,
  usaBox,
  nepalXY,
  msXY,
  km,
  from,
  to,
}: {
  nepalPath: string;
  usaPath: string;
  nepalBox: BBox;
  usaBox: BBox;
  nepalXY: [number, number];
  msXY: [number, number];
  km: number;
  from: { place: string; note: string };
  to: { place: string; note: string };
}) {
  const reduce = useReducedMotion() ?? false;
  const np = fitTo(nepalBox, NP_SLOT);
  const us = fitTo(usaBox, US_SLOT);
  const [ax, ay] = np.at(nepalXY);
  const [bx, by] = us.at(msXY);
  const arc = `M${ax} ${ay}C${r1(ax + 50)} ${r1(ay - 70)} ${r1(bx - 60)} ${r1(by - 70)} ${bx} ${by}`;
  const wrap = useRef<HTMLDivElement>(null);
  const shown = useReveal(wrap, "0px 0px -10% 0px") || !!reduce;

  return (
    <div ref={wrap}>
      <svg aria-hidden viewBox="0 0 352 86" className="w-full max-w-[460px] overflow-visible" fill="none">
        <defs>
          <linearGradient id="glyph-arc" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--signal)" />
            <stop offset="1" stopColor="var(--sky)" />
          </linearGradient>
          <clipPath id="glyph-us">
            <rect x={US_SLOT.x - 4} y={US_SLOT.y - 4} width={US_SLOT.w + 8} height={US_SLOT.h + 8} />
          </clipPath>
        </defs>
        <g transform={np.transform}>
          <path
            d={nepalPath}
            fill="color-mix(in oklab, var(--signal) 22%, transparent)"
            stroke="var(--signal)"
            strokeWidth={1 / np.k}
            strokeLinejoin="round"
          />
        </g>
        <g clipPath="url(#glyph-us)">
          <g transform={us.transform}>
            <path
              d={usaPath}
              fill="color-mix(in oklab, var(--sky) 14%, transparent)"
              stroke="var(--sky)"
              strokeWidth={1 / us.k}
              strokeLinejoin="round"
            />
          </g>
        </g>
        <path d={arc} stroke="var(--line-hi)" strokeDasharray="2 4" />
        <motion.path
          d={arc}
          stroke="url(#glyph-arc)"
          strokeWidth={1.6}
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: shown ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 1.4, delay: reduce ? 0 : 0.4, ease: EASE }}
        />
        <circle cx={ax} cy={ay} r={3} fill="var(--signal)" stroke="var(--bg)" strokeWidth={1.5} />
        <motion.circle
          cx={bx}
          cy={by}
          r={3}
          fill="var(--sky)"
          stroke="var(--bg)"
          strokeWidth={1.5}
          initial={{ opacity: reduce ? 1 : 0 }}
          animate={{ opacity: shown ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 1.7 }}
        />
        <text x={168} y={72} textAnchor="middle" fill="var(--text-dim)" fontSize={8.5} letterSpacing="0.08em" fontFamily="var(--font-mono-face), monospace">
          {km.toLocaleString("en-US")} KM
        </text>
      </svg>
      <div className="mt-2 flex max-w-[460px] justify-between gap-4 font-mono text-[11px] leading-relaxed">
        <p>
          <span className="block whitespace-nowrap uppercase tracking-[0.08em] text-signal sm:tracking-[0.12em]">{from.place}</span>
          <span className="text-dim">{from.note}</span>
        </p>
        <p className="text-right">
          <span className="block whitespace-nowrap uppercase tracking-[0.08em] text-sky sm:tracking-[0.12em]">{to.place}</span>
          <span className="text-dim">{to.note}</span>
        </p>
      </div>
    </div>
  );
}
