"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { games } from "@/data/content";
import { GREEN, INK, ORANGE, RED, YELLOW } from "./toon";

const A = games[0].analytics;
const S = games[0].search;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR = 2026; // analytics window Sep 12 - Oct 11, 2026 (see content.ts)

const [m0, d0] = A.dailyStart.split(" ");
const START = Date.UTC(YEAR, MONTHS.indexOf(m0), Number(d0));
const dayLabel = (i: number) => {
  const d = new Date(START + i * 86400000);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};
const PEAK_I = Math.max(0, A.daily.findIndex((_, i) => dayLabel(i) === A.peak.day));

// chart geometry
const W = 600;
const H = 210;
const PAD = { l: 14, r: 14, t: 30, b: 28 };
const MAX = Math.ceil(Math.max(...A.daily) / 25) * 25 + 10;
const xs = A.daily.map((_, i) => PAD.l + (i * (W - PAD.l - PAD.r)) / (A.daily.length - 1));
const ys = A.daily.map((v) => H - PAD.b - (v / MAX) * (H - PAD.t - PAD.b));
const rd = (v: number) => Math.round(v * 10) / 10;

// Catmull-Rom -> cubic Bezier for a soft, hand-drawn line
const LINE = (() => {
  let d = `M${rd(xs[0])} ${rd(ys[0])}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i - 1] ?? xs[i];
    const y0 = ys[i - 1] ?? ys[i];
    const x3 = xs[i + 2] ?? xs[i + 1];
    const y3 = ys[i + 2] ?? ys[i + 1];
    const c1x = xs[i] + (xs[i + 1] - x0) / 6;
    const c1y = ys[i] + (ys[i + 1] - y0) / 6;
    const c2x = xs[i + 1] - (x3 - xs[i]) / 6;
    const c2y = ys[i + 1] - (y3 - ys[i]) / 6;
    d += ` C${rd(c1x)} ${rd(c1y)} ${rd(c2x)} ${rd(c2y)} ${rd(xs[i + 1])} ${rd(ys[i + 1])}`;
  }
  return d;
})();
const AREA = `${LINE} L${rd(xs[xs.length - 1])} ${H - PAD.b} L${rd(xs[0])} ${H - PAD.b} Z`;

function CountUp({ value, start }: { value: number; start: boolean }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!start || reduce) return;
    const controls = animate(0, value, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [start, reduce, value]);
  return <>{n.toLocaleString("en-US")}</>;
}

function Stat({ label, value, growth, start }: { label: string; value: number; growth: string; start: boolean }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 flex flex-wrap items-center gap-2">
        <span className="wr-display text-4xl font-bold tabular-nums leading-none md:text-5xl">
          <CountUp value={value} start={start} />
        </span>
        <span className="wr-pill px-2 py-0.5 text-xs font-extrabold" style={{ background: GREEN }}>
          {growth}
        </span>
      </p>
    </div>
  );
}

/** Analytics sticker: real Vercel Analytics totals + an approximate daily visitors chart that draws on scroll. */
export function WarmerStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rangeId = useId();
  const tabBase = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [tab, setTab] = useState<"traffic" | "search">("traffic");

  const onPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
    setActive(best);
  };

  const shown = active ?? PEAK_I;
  const tipX = xs[shown];
  const tipLeft = tipX > W * 0.75;

  return (
    <div ref={ref} data-cursor-box="" className="wr-sticker p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="wr-display text-lg font-semibold">How it&apos;s doing</p>
        <div role="tablist" aria-label="Warmer analytics" className="wr-pill inline-flex bg-white p-1">
          {(["traffic", "search"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`${tabBase}-${t}-tab`}
              aria-selected={tab === t}
              aria-controls={`${tabBase}-${t}`}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  const next = tab === "traffic" ? "search" : "traffic";
                  setTab(next);
                  document.getElementById(`${tabBase}-${next}-tab`)?.focus();
                }
              }}
              className="min-h-8 cursor-pointer rounded-full px-3 text-xs font-extrabold transition-colors"
              style={{ background: tab === t ? YELLOW : "transparent" }}
            >
              {t === "traffic" ? "Traffic" : "Found on Google"}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" id={`${tabBase}-search`} aria-labelledby={`${tabBase}-search-tab`} hidden={tab !== "search"}>
        <p className="mt-4 text-[11px] font-extrabold uppercase tracking-wide opacity-70">
          {S.source} · {S.period} · {S.scope}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Clicks", value: S.clicks },
            { label: "Impressions", value: S.impressions },
            { label: "Avg. position", value: S.avgPosition },
            { label: "CTR", value: S.ctr },
          ].map((m, i) => (
            <div
              key={m.label}
              className="wr-pill !rounded-2xl px-3 py-2.5"
              style={{ background: [YELLOW, "#a8d8ff", GREEN, "#ffffff"][i] }}
            >
              <dt className="text-[11px] font-extrabold uppercase tracking-wide opacity-75">{m.label}</dt>
              <dd className="wr-display mt-0.5 text-3xl font-bold leading-none">{m.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-center gap-4">
          <svg viewBox="0 0 160 56" aria-hidden className="h-14 w-36 shrink-0">
            <path d="M4 50 C 30 50, 44 48, 62 42 S 96 30, 112 22 S 140 10, 156 8" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M146 4 l 11 4 l -8 8" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-snug">{S.trend}</p>
            <p className="mt-1 text-[11px] font-bold opacity-70">Curve is illustrative, not plotted data.</p>
          </div>
        </div>
      </div>

      <div role="tabpanel" id={`${tabBase}-traffic`} aria-labelledby={`${tabBase}-traffic-tab`} hidden={tab !== "traffic"}>
      <p className="mt-4 text-[11px] font-extrabold uppercase tracking-wide opacity-70">
        {A.source} · {A.period}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <Stat label="Visitors" value={A.visitors} growth={A.visitorsGrowth} start={inView} />
        <Stat label="Page views" value={A.pageViews} growth={A.pageViewsGrowth} start={inView} />
      </div>

      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-pan-y overflow-visible"
          role="img"
          aria-label={`Daily visitors from ${A.dailyStart} to ${A.dailyEnd}, peaking at ${A.peak.visitors} on ${A.peak.day}. Daily values are approximate.`}
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onPointerLeave={() => setActive(null)}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={RED} stopOpacity="0.55" />
              <stop offset="0.5" stopColor={ORANGE} stopOpacity="0.4" />
              <stop offset="1" stopColor={YELLOW} stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {/* baseline + light grid */}
          {[0.5, 1].map((f) => (
            <line
              key={f}
              x1={PAD.l}
              x2={W - PAD.r}
              y1={rd(H - PAD.b - f * (H - PAD.t - PAD.b))}
              y2={rd(H - PAD.b - f * (H - PAD.t - PAD.b))}
              stroke={INK}
              strokeOpacity="0.12"
              strokeDasharray="4 6"
            />
          ))}
          <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />

          <motion.path
            d={AREA}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.9 }}
          />
          <motion.path
            d={LINE}
            fill="none"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: inView ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          />

          {/* peak annotation */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: reduce ? 0 : 1.3 }}>
            <path
              d={`M${rd(xs[PEAK_I] - 70)} ${rd(ys[PEAK_I] - 4)} q 30 -18 58 -2`}
              fill="none"
              stroke={INK}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d={`M${rd(xs[PEAK_I] - 18)} ${rd(ys[PEAK_I] - 10)} l 6 4 l -7 3`} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <text x={rd(xs[PEAK_I] - 76)} y={rd(ys[PEAK_I] - 2)} textAnchor="end" fontSize="15" fontWeight="800" fill={INK} className="wr-display">
              Peak {A.peak.day} · {A.peak.visitors}
            </text>
          </motion.g>

          {/* active day */}
          {active !== null && (
            <line x1={tipX} x2={tipX} y1={PAD.t - 6} y2={H - PAD.b} stroke={INK} strokeWidth="1.5" strokeDasharray="3 4" />
          )}
          <circle cx={rd(tipX)} cy={rd(ys[shown])} r="7" fill={active === null ? RED : YELLOW} stroke={INK} strokeWidth="3" />

          <text x={PAD.l} y={H - 6} fontSize="13" fontWeight="700" fill={INK} opacity="0.7">
            {A.dailyStart}
          </text>
          <text x={W - PAD.r} y={H - 6} fontSize="13" fontWeight="700" fill={INK} opacity="0.7" textAnchor="end">
            {A.dailyEnd}
          </text>
        </svg>

        {active !== null && (
          <div
            className="wr-pill pointer-events-none absolute top-0 whitespace-nowrap bg-white px-2.5 py-1 text-xs font-extrabold"
            style={{
              left: `${(tipX / W) * 100}%`,
              transform: tipLeft ? "translateX(calc(-100% - 10px))" : "translateX(10px)",
            }}
          >
            {dayLabel(active)} · ~{A.daily[active]} visitors
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label htmlFor={rangeId} className="flex min-w-0 flex-1 items-center gap-3 text-xs font-bold">
          <span className="shrink-0">Scrub days</span>
          <input
            id={rangeId}
            type="range"
            min={0}
            max={A.daily.length - 1}
            value={shown}
            onChange={(e) => setActive(Number(e.target.value))}
            onBlur={() => setActive(null)}
            aria-valuetext={`${dayLabel(shown)}: about ${A.daily[shown]} visitors`}
            className="h-6 min-w-0 flex-1 cursor-pointer accent-[#ef3b2c]"
          />
        </label>
        <p className="text-[11px] font-bold opacity-70">Daily values approximate</p>
      </div>
      </div>
    </div>
  );
}
