"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const R = 46;
const CX = 60;
const CY = 60;
const SWEEP = 270; // degrees of the dial
const START = 135; // dial starts bottom-left

const polar = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
};

function arcPath(fromDeg: number, toDeg: number, r = R) {
  const [x1, y1] = polar(fromDeg, r);
  const [x2, y2] = polar(toDeg, r);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

const DIAL = arcPath(START, START + SWEEP);
const TICKS = Array.from({ length: 28 }, (_, i) => {
  const deg = START + (SWEEP * i) / 27;
  const major = i % 9 === 0;
  const [x1, y1] = polar(deg, R + 6);
  const [x2, y2] = polar(deg, R + (major ? 11 : 9));
  return { x1, y1, x2, y2, major };
});

type StatGaugeProps = {
  value: number;
  suffix: string;
  label: string;
  index: number;
  accent?: string;
};

/**
 * Arc gauge that sweeps and counts up when scrolled into view.
 * Percentages fill to their value; counts have no natural maximum, so the dial sweeps to a full lock
 * instead of implying a scale that does not exist.
 */
export function StatGauge({ value, suffix, label, index, accent = "var(--signal)" }: StatGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const shown = useTransform(count, (v) => Math.round(v).toLocaleString("en-US"));
  const fill = suffix.trim() === "%" ? value / 100 : 1;
  const delay = index * 0.08;

  useEffect(() => {
    if (reduce) {
      count.set(value);
      return;
    }
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.4, delay: delay + 0.2, ease: EASE });
    return () => controls.stop();
  }, [inView, reduce, value, count, delay]);

  const [nx, ny] = polar(START + SWEEP * fill, R);

  return (
    <div ref={ref} className="group relative flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-[150px]">
        <svg aria-hidden viewBox="0 0 120 120" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
          {TICKS.map((t, i) => (
            <motion.line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.major ? "var(--text-dim)" : "var(--line-hi)"}
              strokeWidth={t.major ? 1.2 : 0.8}
              initial={{ opacity: 0 }}
              animate={inView || reduce ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : delay + i * 0.012 }}
            />
          ))}
          <path d={DIAL} stroke="var(--line)" strokeWidth={5} strokeLinecap="butt" />
          <motion.path
            d={DIAL}
            stroke={accent}
            strokeWidth={5}
            strokeLinecap="butt"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView || reduce ? fill : 0 }}
            transition={{ duration: reduce ? 0 : 1.4, delay: reduce ? 0 : delay + 0.2, ease: EASE }}
          />
          <motion.circle
            cx={nx}
            cy={ny}
            r={3.5}
            fill="var(--bg)"
            stroke={accent}
            strokeWidth={1.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: inView || reduce ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : delay + 1.5 }}
          />
          <circle cx={CX} cy={CY} r={R - 12} stroke="var(--line)" strokeWidth={0.6} strokeDasharray="1 3" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="sr-only">
            {value}
            {suffix} {label}
          </span>
          <span aria-hidden className="font-display text-3xl font-bold leading-none tabular-nums text-text sm:text-4xl">
            <motion.span>{shown}</motion.span>
            <span className="ml-0.5 text-base font-semibold" style={{ color: accent }}>
              {suffix.trim()}
            </span>
          </span>
          <span aria-hidden className="mt-1.5 font-mono text-[9px] tracking-[0.2em] text-dim/80">
            CH-{String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
      <p aria-hidden className="hud-label mt-2 max-w-[22ch] text-center leading-snug tracking-[0.06em]!">
        {label}
      </p>
    </div>
  );
}
