"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import type { Experience } from "@/data/content";
import { RouteCard } from "./RouteCard";

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};
const MON_LABEL = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "Aug 2024" -> months since year 0. */
function toMonth(s: string) {
  const m = s.trim().match(/^([A-Za-z]+)\.?\s+(\d{4})$/);
  if (!m) return null;
  const mon = MONTHS[m[1].toLowerCase()];
  return mon === undefined ? null : Number(m[2]) * 12 + mon;
}

function span(when: string) {
  const [a, b] = when.split(/[–-]/).map((p) => p.trim());
  const start = toMonth(a ?? "");
  const end = b ? toMonth(b) : null;
  return { start, end: end ?? start };
}

// Rail geometry (px). Mobile keeps only the rope, route and tenure bars, hugging the left edge.
const RAIL = {
  desktop: { w: 184, axis: 40, rope: 84, route: 132, tenure: 156 },
  mobile: { w: 64, axis: -1, rope: 10, route: 34, tenure: 52 },
};

type Anchor = { m: number; y: number };
type Geometry = {
  w: number;
  h: number;
  desktop: boolean;
  camps: { y: number; endY: number; concurrent: boolean }[];
  routeD: string;
  ticks: { y: number; label?: string; major: boolean }[];
  ropeTop: number;
  ropeBottom: number;
};

/** Piecewise-linear month -> y through the measured card anchors, so the time axis bends to fit the cards. */
function makeScale(anchors: Anchor[]) {
  const a = [...anchors].sort((p, q) => p.m - q.m);
  return (m: number) => {
    if (m <= a[0].m) return a[0].y;
    for (let i = 1; i < a.length; i++) {
      if (m <= a[i].m) {
        const t = (m - a[i - 1].m) / Math.max(1, a[i].m - a[i - 1].m);
        return a[i - 1].y + (a[i].y - a[i - 1].y) * t;
      }
    }
    return a[a.length - 1].y;
  };
}

/**
 * Chronological ascent. Reading down is climbing up: the oldest role is first.
 * The concurrent role (Gulf South) is a continuous rope running the full height beside the main
 * route, with a shared time axis so the overlap with the later roles is visible at a glance.
 */
export function RouteTrack({ entries }: { entries: Experience[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [reached, setReached] = useState(0);
  const reduce = useReducedMotion();

  const spans = entries.map((e) => span(e.when));
  const rope = entries.find((e) => e.concurrent);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 75%", "end 60%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const drawn = useTransform(smooth, (v) => Math.max(0.001, v));

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const box = wrap.getBoundingClientRect();
    const desktop = box.width >= 768;
    const R = desktop ? RAIL.desktop : RAIL.mobile;
    const h = box.height;
    const ys = itemRefs.current.map((li) => (li ? li.getBoundingClientRect().top - box.top + 34 : 0));
    const lastEnd = Math.max(...spans.map((s) => s.end ?? 0));

    const anchors: Anchor[] = [];
    spans.forEach((s, i) => {
      if (s.start !== null && !anchors.some((a) => a.m === s.start)) anchors.push({ m: s.start, y: ys[i] });
    });
    anchors.push({ m: lastEnd, y: h - 16 });
    if (anchors.length < 2) return;
    const scale = makeScale(anchors);

    const camps = spans.map((s, i) => ({
      y: ys[i],
      endY: s.end !== null ? scale(s.end) : ys[i],
      concurrent: Boolean(entries[i].concurrent),
    }));

    // Main route: zig-zag through every camp, ending where the last role ends.
    const pts = camps.map((c) => ({ x: R.route, y: c.y }));
    const last = camps[camps.length - 1];
    if (last && last.endY > last.y + 20) pts.push({ x: R.route, y: last.endY });
    const amp = desktop ? 9 : 6;
    let d = pts.length ? `M${pts[0].x} ${pts[0].y.toFixed(1)}` : "";
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const dy = p1.y - p0.y;
      const sign = i % 2 ? 1 : -1;
      if (dy > 48) {
        d += `L${p0.x + amp * sign} ${(p0.y + dy * 0.3).toFixed(1)}`;
        d += `L${p0.x - amp * 0.6 * sign} ${(p0.y + dy * 0.6).toFixed(1)}`;
        d += `L${p0.x + amp * 0.3 * sign} ${(p0.y + dy * 0.85).toFixed(1)}`;
      }
      d += `L${p1.x} ${p1.y.toFixed(1)}`;
    }

    // Shared time axis: a tick per quarter, labelled at each new year.
    const firstStart = Math.min(...spans.map((s) => s.start ?? Infinity));
    const ticks: Geometry["ticks"] = [];
    if (Number.isFinite(firstStart)) {
      for (let m = firstStart; m <= lastEnd; m++) {
        const mon = m % 12;
        const isYear = mon === 0;
        if (m === firstStart || m === lastEnd || isYear || mon % 3 === 0) {
          ticks.push({
            y: scale(m),
            major: isYear || m === firstStart || m === lastEnd,
            label: isYear ? String(m / 12) : m === firstStart || m === lastEnd ? `${MON_LABEL[mon]} ${Math.floor(m / 12)}` : undefined,
          });
        }
      }
    }

    const ropeIdx = entries.findIndex((e) => e.concurrent);
    const ropeTop = ropeIdx >= 0 ? camps[ropeIdx].y : 0;
    const ropeBottom = ropeIdx >= 0 ? camps[ropeIdx].endY : 0;

    setGeo({ w: box.width, h, desktop, camps, routeD: d, ticks, ropeTop, ropeBottom });
    // spans/entries are derived from props that do not change at runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [measure]);

  const updateReached = useCallback(
    (v: number) => {
      if (!geo) return;
      const n = reduce ? geo.camps.length : geo.camps.filter((c) => v >= c.y / geo.h - 0.01).length;
      setReached((prev) => (prev === n ? prev : n));
    },
    [geo, reduce],
  );
  useMotionValueEvent(drawn, "change", updateReached);
  useEffect(() => updateReached(drawn.get()), [updateReached, drawn]);

  const R = geo?.desktop === false ? RAIL.mobile : RAIL.desktop;
  const pathLen = reduce ? 1 : drawn;

  return (
    <div ref={wrapRef} className="relative">
      {/* SSR / pre-measure guide so the rope is never missing */}
      {!geo && (
        <span aria-hidden className="absolute bottom-0 left-[10px] top-0 w-px border-l border-dashed border-signal/50 md:left-[84px]" />
      )}

      {geo && (
        <div aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ width: R.w, height: geo.h }}>
          <svg className="absolute inset-0 overflow-visible" width={R.w} height={geo.h} fill="none">
            {/* Time axis */}
            {geo.desktop && (
              <g>
                <line x1={R.axis} x2={R.axis} y1={geo.ticks[0]?.y ?? 0} y2={geo.ticks.at(-1)?.y ?? geo.h} stroke="var(--line-hi)" />
                {geo.ticks.map((t, i) => (
                  <line
                    key={i}
                    x1={R.axis - (t.major ? 7 : 4)}
                    x2={R.axis}
                    y1={t.y}
                    y2={t.y}
                    stroke={t.major ? "var(--text-dim)" : "var(--line-hi)"}
                  />
                ))}
              </g>
            )}

            {/* Gulf South rope: a faint full-length guide plus the drawn double strand */}
            {rope && (
              <g>
                <line x1={R.rope} x2={R.rope} y1={geo.ropeTop} y2={geo.ropeBottom} stroke="var(--line-hi)" strokeDasharray="2 5" />
                <motion.line
                  x1={R.rope - 2}
                  x2={R.rope - 2}
                  y1={geo.ropeTop}
                  y2={geo.ropeBottom}
                  stroke="var(--signal)"
                  strokeWidth={1.5}
                  style={{ pathLength: pathLen }}
                />
                <motion.line
                  x1={R.rope + 2}
                  x2={R.rope + 2}
                  y1={geo.ropeTop}
                  y2={geo.ropeBottom}
                  stroke="var(--signal)"
                  strokeWidth={1}
                  strokeDasharray="5 4"
                  opacity={0.6}
                  style={{ pathLength: pathLen }}
                />
                {/* Branch where the main route leaves the rope */}
                <line x1={R.rope} x2={R.route} y1={geo.ropeTop} y2={geo.ropeTop} stroke="var(--line-hi)" />
                <circle cx={R.rope} cy={geo.ropeBottom} r={3} fill="var(--signal)" />
              </g>
            )}

            {/* Main route */}
            <path d={geo.routeD} stroke="var(--line-hi)" strokeDasharray="2 5" />
            <motion.path
              d={geo.routeD}
              stroke="var(--sky)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ pathLength: pathLen, filter: "drop-shadow(0 0 4px color-mix(in oklab, var(--sky) 55%, transparent))" }}
            />

            {/* Tenure bars for the non-concurrent roles: start to end on the shared axis */}
            {geo.camps.map((c, i) =>
              c.concurrent ? null : (
                <line
                  key={`t${i}`}
                  x1={R.tenure}
                  x2={R.tenure}
                  y1={c.y}
                  y2={Math.max(c.endY, c.y + 6)}
                  stroke="var(--sky)"
                  strokeWidth={3}
                  opacity={i < reached ? 0.9 : 0.25}
                  style={{ transition: "opacity 500ms" }}
                />
              ),
            )}

            {/* Camp markers */}
            {geo.camps.map((c, i) => {
              const on = i < reached;
              const color = c.concurrent ? "var(--signal)" : "var(--sky)";
              return (
                <g key={`m${i}`} transform={`translate(${R.route} ${c.y})`}>
                  {on && i === reached - 1 && !reduce && (
                    <g transform="rotate(45)">
                    <motion.rect
                      x={-6}
                      y={-6}
                      width={12}
                      height={12}
                      stroke={color}
                      fill="none"
                      initial={{ scale: 1, opacity: 0.9 }}
                      animate={{ scale: 2.4, opacity: 0 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    />
                    </g>
                  )}
                  <rect
                    x={-6}
                    y={-6}
                    width={12}
                    height={12}
                    transform="rotate(45)"
                    stroke={on ? color : "var(--line-hi)"}
                    strokeWidth={2}
                    fill={on ? color : "var(--bg)"}
                    style={{ transition: "fill 500ms, stroke 500ms" }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Axis labels */}
          {geo.desktop &&
            geo.ticks
              .filter((t) => t.label)
              .map((t, i) => (
                <span
                  key={i}
                  className="absolute -translate-y-1/2 text-right font-mono text-[10px] leading-none tracking-[0.08em] text-dim"
                  style={{ top: t.y, right: R.w - R.axis + 10, width: 64 }}
                >
                  {t.label}
                </span>
              ))}

          {/* Rope label, set vertically beside the rope */}
          {geo.desktop && rope && (
            <span
              className="absolute font-mono text-[10px] uppercase tracking-[0.18em] text-signal"
              style={{
                left: R.rope + 9,
                top: geo.ropeTop + 40,
                writingMode: "vertical-rl",
                maxHeight: Math.max(0, geo.ropeBottom - geo.ropeTop - 60),
                overflow: "hidden",
              }}
            >
              {rope.company.split(" ").slice(0, 2).join(" ")} · {rope.when} · continuous
            </span>
          )}
        </div>
      )}

      <ol className="relative space-y-8 pl-[4.5rem] md:space-y-10 md:pl-[12.5rem]">
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            <RouteCard entry={entry} index={i} />
          </li>
        ))}
      </ol>
    </div>
  );
}
