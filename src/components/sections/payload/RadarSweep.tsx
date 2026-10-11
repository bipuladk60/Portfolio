"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { mulberry32, r1 } from "../chautari/prng";

const PERIOD = 4.2; // seconds per revolution
const WEDGE = 50; // degrees; the sweep's leading edge sits at WEDGE degrees clockwise from north at t=0

const BLIPS = (() => {
  const rng = mulberry32(636);
  return Array.from({ length: 9 }, (_, i) => {
    const ang = rng() * 360;
    const rad = 12 + rng() * 38;
    const a = (ang * Math.PI) / 180;
    const hitAt = (((ang - WEDGE + 360) % 360) / 360) * PERIOD;
    return {
      x: r1(60 + Math.sin(a) * rad),
      y: r1(60 - Math.cos(a) * rad),
      delay: r1(hitAt * 100) / 100,
      hot: i === 2 || i === 6,
    };
  });
})();

const lx = r1(60 + Math.sin((WEDGE * Math.PI) / 180) * 54);
const ly = r1(60 - Math.cos((WEDGE * Math.PI) / 180) * 54);

/** Radar sweep with blips that light as the beam passes: job boards being polled. */
export function RadarSweep() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });

  return (
    <div
      ref={ref}
      className="flex h-full items-center gap-4 px-4 py-3"
      style={{ ["--play" as string]: inView ? "running" : "paused" }}
    >
      <svg viewBox="0 0 120 120" className="h-full max-h-[120px] w-auto shrink-0">
        <defs>
          <linearGradient id="pb-radar-wedge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#34C98A" stopOpacity="0" />
            <stop offset="1" stopColor="#34C98A" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="#07100c" stroke="#1F2B38" />
        {[18, 36].map((r) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#1F2B38" />
        ))}
        <path d="M60 6V114M6 60H114" stroke="#1F2B38" strokeWidth="0.6" />
        <g className="pb-sweep">
          <path d={`M60 60 L60 6 A54 54 0 0 1 ${lx} ${ly} Z`} fill="url(#pb-radar-wedge)" />
          <path d={`M60 60 L${lx} ${ly}`} stroke="#34C98A" strokeWidth="1" />
        </g>
        {BLIPS.map((b, i) => (
          <circle
            key={i}
            cx={b.x}
            cy={b.y}
            r={b.hot ? 2.6 : 1.8}
            fill={b.hot ? "#F2B418" : "#34C98A"}
            className="pb-blip"
            style={{ animationDelay: `${b.delay}s` }}
          />
        ))}
      </svg>
      <dl className="min-w-0 space-y-2 font-mono text-[10px] uppercase tracking-[0.12em]">
        <div>
          <dt className="text-dim/70">Polling</dt>
          <dd className="text-text">~636 boards</dd>
        </div>
        <div>
          <dt className="text-dim/70">Threshold</dt>
          <dd className="text-signal">Score 80</dd>
        </div>
      </dl>
    </div>
  );
}
