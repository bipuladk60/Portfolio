"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import {
  ARC_PATH,
  ARC_POINTS,
  HBG,
  NEPAL,
  LAND_DOTS,
  MAP_H,
  MAP_W,
  OCEAN_GRID,
  project,
  toPct,
} from "./geo";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const NP_XY = project(NEPAL.lon, NEPAL.lat);
const HBG_XY = project(HBG.lon, HBG.lat);
const LAST = ARC_POINTS.length - 1;

function sample(p: number, axis: 0 | 1) {
  const f = Math.max(0, Math.min(1, p)) * LAST;
  const i = Math.floor(f);
  const j = Math.min(LAST, i + 1);
  return ARC_POINTS[i][axis] + (ARC_POINTS[j][axis] - ARC_POINTS[i][axis]) * (f - i);
}

function Endpoint({ xy, color, delay, reduce }: { xy: [number, number]; color: string; delay: number; reduce: boolean }) {
  return (
    <g>
      {!reduce && (
        <motion.circle
          cx={xy[0]}
          cy={xy[1]}
          fill="none"
          stroke={color}
          strokeWidth={1}
          initial={{ r: 3, opacity: 0 }}
          animate={{ r: [3, 14], opacity: [0.9, 0] }}
          transition={{ duration: 2.2, delay, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.circle
        cx={xy[0]}
        cy={xy[1]}
        r={3.2}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : delay, ease: EASE }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    </g>
  );
}

/**
 * Dotted world map (equirectangular) with the great-circle route from Nepal to Hattiesburg.
 * The arc draws in, then a probe dot loops along it; a radar sweep turns over the ground station.
 * Looping motion pauses when the map is offscreen.
 */
export function RouteMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion() ?? false;
  const progress = useMotionValue(0);
  const cx = useTransform(progress, (p) => sample(p, 0));
  const cy = useTransform(progress, (p) => sample(p, 1));
  const trailOpacity = useTransform(progress, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(progress, [0, 1], {
      duration: 5.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1.2,
      delay: 2.4,
    });
    return () => controls.stop();
  }, [reduce, inView, progress]);

  const np = toPct(NP_XY);
  const hbg = toPct(HBG_XY);
  const radarSize = `${(120 / MAP_W) * 100}%`;

  return (
    <div ref={ref} data-cursor-box="" className="relative w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
      <svg
        aria-hidden
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="hero-arc" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--sky)" />
            <stop offset="0.5" stopColor="var(--text)" />
            <stop offset="1" stopColor="var(--signal)" />
          </linearGradient>
        </defs>

        {/* Equator and tropics */}
        {[0, 23.44, -23.44].map((lat) => {
          const y = project(0, lat)[1];
          return (
            <line
              key={lat}
              x1={0}
              x2={MAP_W}
              y1={y}
              y2={y}
              stroke="var(--line-hi)"
              strokeWidth={0.6}
              strokeDasharray={lat === 0 ? "none" : "2 4"}
              opacity={lat === 0 ? 0.7 : 0.45}
            />
          );
        })}

        <motion.path
          d={OCEAN_GRID}
          stroke="var(--line)"
          strokeWidth={1.1}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.5 }}
        />
        <motion.path
          d={LAND_DOTS}
          stroke="color-mix(in oklab, var(--text-dim) 75%, transparent)"
          strokeWidth={2.4}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 0.6, ease: EASE }}
        />

        {/* Route: faint full guide, then the bright drawn arc */}
        <path d={ARC_PATH} stroke="var(--line-hi)" strokeWidth={1} strokeDasharray="3 5" />
        <motion.path
          d={ARC_PATH}
          stroke="url(#hero-arc)"
          strokeWidth={1.8}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 1.6, delay: reduce ? 0 : 1.1, ease: EASE }}
          style={{ filter: "drop-shadow(0 0 3px color-mix(in oklab, var(--signal) 50%, transparent))" }}
        />

        <Endpoint xy={NP_XY} color="var(--signal)" delay={1.0} reduce={reduce} />
        <Endpoint xy={HBG_XY} color="var(--sky)" delay={2.6} reduce={reduce} />

        {!reduce && (
          <motion.g style={{ opacity: trailOpacity }}>
            <motion.circle cx={cx} cy={cy} r={7} fill="var(--signal)" opacity={0.18} />
            <motion.circle cx={cx} cy={cy} r={2.6} fill="#fffaf0" />
          </motion.g>
        )}
      </svg>

      {/* Radar sweep over the ground station (HTML so it can use a conic gradient) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{ ...np, width: radarSize, aspectRatio: "1" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-signal/30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.9, ease: EASE }}
        >
          <div className="absolute inset-[22%] rounded-full border border-signal/20" />
          <div className="absolute inset-[44%] rounded-full border border-signal/20" />
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-signal/10" />
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-signal/10" />
          <div
            className={`absolute inset-0 rounded-full ${reduce ? "" : "animate-spin"}`}
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, color-mix(in oklab, var(--signal) 10%, transparent) 330deg, color-mix(in oklab, var(--signal) 45%, transparent) 360deg)",
              animationDuration: "5s",
              animationTimingFunction: "linear",
              animationPlayState: inView ? "running" : "paused",
            }}
          />
        </motion.div>
      </div>

      {/* Endpoint labels in HTML so they stay readable at any map size */}
      <motion.div
        className="absolute -translate-x-1/2 translate-y-3 font-mono text-[10px] leading-none tracking-widest text-signal sm:text-[11px]"
        style={np}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 1.2 }}
      >
        <span className="bg-bg/80 px-1">{NEPAL.code}</span>
      </motion.div>
      <motion.div
        className="absolute -translate-x-1/2 translate-y-3 font-mono text-[10px] leading-none tracking-widest text-sky sm:text-[11px]"
        style={hbg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 2.6 }}
      >
        <span className="bg-bg/80 px-1">{HBG.code}</span>
      </motion.div>
    </div>
  );
}
