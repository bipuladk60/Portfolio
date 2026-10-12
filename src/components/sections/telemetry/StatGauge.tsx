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
 * A stat that counts up when scrolled into view. Only a percentage gets the arc dial, because only a
 * percentage has a scale to fill; plain counts are shown as clean numbers in the same-sized cell so
 * the row stays aligned.
 */
export function StatGauge({ value, suffix, label, index, accent = "var(--signal)" }: StatGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const shown = useTransform(count, (v) => Math.round(v).toLocaleString("en-US"));
  const isPct = suffix.trim() === "%";
  const fill = isPct ? value / 100 : 1;
  const delay = index * 0.08;
  // "Users · MHD Connect + Warmer": the part after the dot is a quieter second line.
  const [main, ...rest] = label.split(" · ");
  const detail = rest.join(" · ");
  // Longer readouts ("2,600+") step down a size so they sit inside the dial instead of touching it.
  const chars = value.toLocaleString("en-US").length + suffix.trim().length;
  const numberSize = !isPct
    ? chars >= 5
      ? "text-4xl sm:text-5xl"
      : "text-5xl sm:text-6xl"
    : chars >= 5
      ? "text-2xl"
      : chars >= 3
        ? "text-3xl sm:text-4xl"
        : "text-4xl sm:text-5xl";

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
      <div className="relative aspect-square w-full max-w-[128px]">
        {isPct && (
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
        </svg>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="sr-only">
            {value.toLocaleString("en-US")}
            {suffix} {label}
          </span>
          <span aria-hidden className={`font-display font-bold leading-none tabular-nums text-text ${numberSize}`}>
            <motion.span>{shown}</motion.span>
            {suffix.trim() && (
              <span className="ml-0.5 text-[0.6em] font-semibold" style={{ color: accent }}>
                {suffix.trim()}
              </span>
            )}
          </span>
        </div>
      </div>
      <p aria-hidden className="mt-3 max-w-[20ch] text-center text-[13px] leading-snug text-dim sm:text-sm">
        {main}
        {detail && <span className="block text-xs text-dim/75">{detail}</span>}
      </p>
    </div>
  );
}
