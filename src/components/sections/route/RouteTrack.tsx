"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { Experience } from "@/data/content";
import { RouteCard } from "./RouteCard";

type Geometry = {
  w: number;
  h: number;
  d: string;
  /** Fraction of total path length at which each camp marker sits. */
  stops: number[];
};

/** Decorative altitudes for the camps: 2,400 / 2,900 / 3,300 M for three, interpolated otherwise. */
function altitudes(n: number) {
  if (n === 3) return [2400, 2900, 3300];
  return Array.from({ length: n }, (_, i) => Math.round((2400 + (900 * i) / Math.max(1, n - 1)) / 100) * 100);
}

/** Builds a zig-zag climbing line through every marker, like a route drawn on a topo sheet. */
function buildRoute(points: { x: number; y: number }[], h: number, amp: number): Omit<Geometry, "w" | "h"> {
  if (!points.length) return { d: "", stops: [] };
  const verts: { x: number; y: number; stop?: number }[] = [{ x: points[0].x, y: 0 }];
  const all = [...points.map((p, i) => ({ ...p, stop: i })), { x: points[points.length - 1].x, y: h }];
  let prev = verts[0];
  all.forEach((p, seg) => {
    const dy = p.y - prev.y;
    const sign = seg % 2 === 0 ? 1 : -1;
    if (dy > 40) {
      verts.push({ x: prev.x + amp * sign, y: prev.y + dy * 0.28 });
      verts.push({ x: prev.x - amp * 0.6 * sign, y: prev.y + dy * 0.55 });
      verts.push({ x: prev.x + amp * 0.35 * sign, y: prev.y + dy * 0.8 });
    }
    verts.push(p);
    prev = p;
  });
  let total = 0;
  const cum: number[] = [0];
  for (let i = 1; i < verts.length; i++) {
    total += Math.hypot(verts[i].x - verts[i - 1].x, verts[i].y - verts[i - 1].y);
    cum.push(total);
  }
  const stops: number[] = [];
  verts.forEach((v, i) => {
    if (v.stop !== undefined) stops[v.stop] = total ? cum[i] / total : 0;
  });
  const d = verts.map((v, i) => `${i ? "L" : "M"}${v.x.toFixed(1)} ${v.y.toFixed(1)}`).join("");
  return { d, stops };
}

/**
 * The experience route: a line that draws itself with scroll, camp markers that light up as the
 * line reaches them, and alternating cards on desktop.
 */
export function RouteTrack({ entries }: { entries: Experience[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [reached, setReached] = useState(0);
  const reduce = useReducedMotion();
  const alts = altitudes(entries.length);

  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 55%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const drawn = useTransform(smooth, (v) => Math.max(0.001, v));

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const box = list.getBoundingClientRect();
    const points = markerRefs.current
      .filter((m): m is HTMLSpanElement => Boolean(m))
      .map((m) => {
        const r = m.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
    const amp = box.width >= 768 ? 22 : 8;
    setGeo({ w: box.width, h: box.height, ...buildRoute(points, box.height, amp) });
  }, []);

  useEffect(() => {
    measure();
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure]);

  const updateReached = useCallback(
    (v: number) => {
      if (!geo) return;
      const n = reduce ? geo.stops.length : geo.stops.filter((s) => v >= s - 0.005).length;
      setReached((prev) => (prev === n ? prev : n));
    },
    [geo, reduce],
  );
  useMotionValueEvent(drawn, "change", updateReached);
  useEffect(() => updateReached(drawn.get()), [updateReached, drawn]);

  return (
    <div ref={listRef} className="relative">
      {/* SSR / pre-measure guide so the route is never missing */}
      <span
        aria-hidden
        className="absolute bottom-0 left-[18px] top-0 w-px border-l border-dashed border-line-hi md:left-1/2"
        style={{ opacity: geo ? 0 : 1 }}
      />
      {geo && (
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={geo.w}
          height={geo.h}
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          fill="none"
        >
          <path d={geo.d} stroke="var(--line-hi)" strokeWidth={1} strokeDasharray="2 5" />
          <motion.path
            d={geo.d}
            stroke="var(--sky)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ pathLength: reduce ? 1 : drawn, filter: "drop-shadow(0 0 4px color-mix(in oklab, var(--sky) 55%, transparent))" }}
          />
        </svg>
      )}

      <ol className="relative space-y-14 pb-6 md:space-y-20">
        {entries.map((entry, i) => {
          const left = i % 2 === 0;
          const isReached = i < reached;
          const isActive = i === reached - 1;
          const alt = `${alts[i].toLocaleString("en-US")} M`;
          return (
            <li key={entry.id} className="relative md:grid md:grid-cols-[1fr_9rem_1fr]">
              {/* Camp marker on the route */}
              <span
                ref={(el) => {
                  markerRefs.current[i] = el;
                }}
                aria-hidden
                className="absolute left-[18px] top-9 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 md:left-1/2"
              >
                {isActive && !reduce && (
                  <motion.span
                    className="absolute inset-0 rotate-45 border border-sky"
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: 2.6, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span
                  className="absolute inset-0 rotate-45 border-2 transition-colors duration-500"
                  style={{
                    borderColor: isReached ? "var(--sky)" : "var(--line-hi)",
                    background: isReached ? "var(--sky)" : "var(--bg)",
                    boxShadow: isActive ? "0 0 14px color-mix(in oklab, var(--sky) 70%, transparent)" : "none",
                  }}
                />
                {/* Connector toward the card (desktop) */}
                <span
                  className={`absolute top-1/2 hidden h-px w-14 transition-colors duration-500 md:block ${
                    left ? "right-full mr-2" : "left-full ml-2"
                  }`}
                  style={{ background: isReached ? "var(--sky)" : "var(--line-hi)" }}
                />
                {/* Altitude readout on the open side (desktop) */}
                <span
                  className={`absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap font-mono text-[11px] tracking-[0.16em] transition-colors duration-500 md:block ${
                    left ? "left-full ml-5" : "right-full mr-5"
                  }`}
                  style={{ color: isReached ? "var(--sky)" : "var(--text-dim)" }}
                >
                  ALT {alt}
                </span>
              </span>

              <div className={`min-w-0 pl-12 md:pl-0 ${left ? "md:col-start-1" : "md:col-start-3"}`}>
                <RouteCard entry={entry} altitude={alt} index={i} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
