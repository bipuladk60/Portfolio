"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { mulberry32, r1 } from "../shared/prng";
import { INK, SKY_BOTTOM, SKY_TOP } from "@/components/toon/toon";

type Puff = { cx: number; cy: number; r: number };

/** A bank of overlapping puffs along a line: the union gets an ink outline, both edges bumpy. */
const BANK: Puff[] = (() => {
  const rng = mulberry32(2224);
  const out: Puff[] = [];
  for (let x = -30; x < 2650; x += 46 + rng() * 26) {
    out.push({ cx: r1(x), cy: r1(60 + (rng() - 0.5) * 22), r: r1(30 + rng() * 26) });
  }
  return out;
})();

function CloudBank({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 2600 120"
      preserveAspectRatio="xMidYMid slice"
      className="block h-[52px] w-full md:h-[70px]"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      {/* soft offset shade */}
      <g fill="#a9d4f5">
        {BANK.map((p, i) => (
          <circle key={i} cx={p.cx + 5} cy={p.cy + 6} r={p.r} />
        ))}
      </g>
      {/* ink outline: strokes first, then white fills on top so only the outer edge remains */}
      <g fill="none" stroke={INK} strokeWidth="6">
        {BANK.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
      <g fill="#ffffff">
        {BANK.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
    </svg>
  );
}

const CLOUD_PUFFS: Puff[] = [
  { cx: 30, cy: 40, r: 17 },
  { cx: 55, cy: 30, r: 23 },
  { cx: 82, cy: 36, r: 19 },
  { cx: 100, cy: 44, r: 12 },
];

function Cloud({ className, style, dur }: { className: string; style?: React.CSSProperties; dur: number }) {
  return (
    <svg viewBox="0 0 124 64" className={className} style={style}>
      <g className="wr-drift" style={{ animationDuration: `${dur}s` }}>
        <g fill="#a9d4f5" transform="translate(4 5)">
          {CLOUD_PUFFS.map((p, i) => (
            <circle key={i} {...p} />
          ))}
          <rect x="14" y="40" width="96" height="16" rx="8" />
        </g>
        <g fill="none" stroke={INK} strokeWidth="4.5">
          {CLOUD_PUFFS.map((p, i) => (
            <circle key={i} {...p} />
          ))}
          <rect x="14" y="40" width="96" height="16" rx="8" />
        </g>
        <g fill="#ffffff">
          {CLOUD_PUFFS.map((p, i) => (
            <circle key={i} {...p} />
          ))}
          <rect x="14" y="40" width="96" height="16" rx="8" />
        </g>
      </g>
    </svg>
  );
}

/**
 * The portal: the dark HUD gives way to Warmer's day sky between two cloud banks.
 * Clouds drift and parallax with scroll (paused offscreen, still under reduced motion).
 */
export function SkyWorld({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const near = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -70]);
  const far = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [30, -30]);

  return (
    <div ref={ref} className={`wr-world relative ${!inView || reduce ? "wr-paused" : ""}`}>
      {/* full-bleed backdrop (the section clips the overhang) */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-[100vw] -translate-x-1/2">
        <div
          className="absolute inset-x-0 top-[26px] bottom-[26px] md:top-[35px] md:bottom-[35px]"
          style={{ background: `linear-gradient(to bottom, ${SKY_TOP}, ${SKY_BOTTOM})` }}
        />
        {/* sun */}
        <div
          className="absolute right-[8%] top-[60px] h-[180px] w-[180px] rounded-full md:h-[260px] md:w-[260px]"
          style={{ background: "radial-gradient(circle, #fff6c9 0%, #ffe58a 32%, rgba(255,229,138,0.35) 52%, transparent 70%)" }}
        />
        {/* drifting clouds, two depths */}
        <motion.div className="absolute inset-0" style={{ y: far }}>
          <Cloud className="absolute left-[4%] top-[22%] w-[90px] opacity-90" dur={14} />
          <Cloud className="absolute right-[30%] top-[14%] w-[70px] opacity-80" dur={18} />
          <Cloud className="absolute left-[46%] top-[62%] w-[80px] opacity-80" dur={16} />
        </motion.div>
        <motion.div className="absolute inset-0" style={{ y: near }}>
          <Cloud className="absolute left-[-2%] top-[52%] w-[140px]" dur={11} />
          <Cloud className="absolute right-[2%] top-[38%] w-[150px]" dur={13} />
          <Cloud className="absolute right-[22%] top-[80%] w-[110px]" dur={12} />
        </motion.div>
        <div className="absolute inset-x-0 top-0">
          <CloudBank flip />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <CloudBank />
        </div>
      </div>
      <div className="relative pb-[60px] pt-[56px] md:pb-[72px] md:pt-[64px]">{children}</div>
    </div>
  );
}
