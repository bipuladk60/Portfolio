"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/lib/reveal";
import { games } from "@/data/content";
import { GREEN, INK, ORANGE, RED, YELLOW } from "@/components/toon/toon";
import type { SearchDay, WarmerSearchLive } from "@/lib/server/searchConsole";

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
const H = 180;
const PAD = { l: 14, r: 14, t: 30, b: 8 };
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

// "1.1K" / "15.5K" / "980", the way Search Console shows totals
const compact = (n: number) =>
  n >= 1000 ? `${(Math.round(n / 100) / 10).toLocaleString("en-US")}K` : Math.round(n).toLocaleString("en-US");
const isoDay = (iso: string, withYear = false) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ""}`;
};

// live daily-clicks line: same soft curve, smaller frame
const SW = 600;
const SH = 84;
const SPAD = { l: 6, r: 6, t: 10, b: 6 };
function clicksLine(daily: SearchDay[]) {
  const max = Math.max(1, ...daily.map((d) => d.clicks));
  const n = Math.max(1, daily.length - 1);
  const px = daily.map((_, i) => SPAD.l + (i * (SW - SPAD.l - SPAD.r)) / n);
  const py = daily.map((d) => SH - SPAD.b - (d.clicks / max) * (SH - SPAD.t - SPAD.b));
  let line = `M${rd(px[0])} ${rd(py[0])}`;
  for (let i = 0; i < px.length - 1; i++) {
    const x0 = px[i - 1] ?? px[i];
    const y0 = py[i - 1] ?? py[i];
    const x3 = px[i + 2] ?? px[i + 1];
    const y3 = py[i + 2] ?? py[i + 1];
    // clamp control points to the plot so the soft curve never dips below zero clicks
    const cy = (v: number) => Math.min(SH - SPAD.b, Math.max(SPAD.t, v));
    line += ` C${rd(px[i] + (px[i + 1] - x0) / 6)} ${rd(cy(py[i] + (py[i + 1] - y0) / 6))} ${rd(px[i + 1] - (x3 - px[i]) / 6)} ${rd(cy(py[i + 1] - (y3 - py[i]) / 6))} ${rd(px[i + 1])} ${rd(py[i + 1])}`;
  }
  const area = `${line} L${rd(px[px.length - 1])} ${SH - SPAD.b} L${rd(px[0])} ${SH - SPAD.b} Z`;
  let peak = 0;
  daily.forEach((d, i) => {
    if (d.clicks > daily[peak].clicks) peak = i;
  });
  return { line, area, peak, peakX: px[peak], peakY: py[peak] };
}

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
export function WarmerStats({ footnote, live = null }: { footnote?: string; live?: WarmerSearchLive | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useReveal(ref, "-10% 0px");
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rangeId = useId();
  const tabBase = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [tab, setTab] = useState<"traffic" | "search">("traffic");
  const [searchSeen, setSearchSeen] = useState(false);
  useEffect(() => {
    if (tab === "search") setSearchSeen(true);
  }, [tab]);
  const liveLine = useMemo(() => (live && live.daily.length > 1 ? clicksLine(live.daily) : null), [live]);
  const recent = live?.daily.slice(-7) ?? [];
  const recentAvg = recent.length ? Math.round(recent.reduce((a, d) => a + d.clicks, 0) / recent.length) : 0;
  const metrics = live
    ? [
        { label: "Clicks", value: compact(live.clicks) },
        { label: "Impressions", value: compact(live.impressions) },
        { label: "Avg. position", value: live.position.toFixed(1) },
        { label: "CTR", value: `${(live.ctr * 100).toFixed(1)}%` },
      ]
    : [
        { label: "Clicks", value: S.clicks },
        { label: "Impressions", value: S.impressions },
        { label: "Avg. position", value: S.avgPosition },
        { label: "CTR", value: S.ctr },
      ];

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
    <div ref={ref} data-cursor-box="lock" className="wr-sticker p-5 md:p-6">
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

      {/* both panels share one grid cell so switching tabs never changes the card height */}
      <div className="grid">
      <div
        role="tabpanel"
        id={`${tabBase}-search`}
        aria-labelledby={`${tabBase}-search-tab`}
        className={`[grid-area:1/1] flex flex-col ${tab === "search" ? "" : "invisible"}`}
        inert={tab !== "search"}
      >
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {live ? (
            <p className="wr-pill inline-flex items-center gap-2 px-2.5 py-0.5 text-[11px] font-extrabold" style={{ background: GREEN }}>
              <span className="relative inline-flex h-2 w-2" aria-hidden>
                <span className="led absolute inset-0 rounded-full bg-white" />
                <span className="relative inline-block h-2 w-2 rounded-full border-2" style={{ borderColor: INK }} />
              </span>
              <span>
                Updated <time dateTime={live.fetchedAt}>{isoDay(live.fetchedAt.slice(0, 10), true)}</time> · {S.source}
              </span>
            </p>
          ) : (
            <p className="wr-pill inline-flex items-center px-2.5 py-0.5 text-[11px] font-extrabold" style={{ background: "#ffffff" }}>
              Snapshot · {S.source} · {S.period.replace(/^Since launch · /, "")}
            </p>
          )}
          <p className="text-[11px] font-extrabold uppercase tracking-wide opacity-70">
            {S.scope} · since launch
            {live && (
              <>
                {" "}
                · data through <time dateTime={live.dataThrough}>{isoDay(live.dataThrough)}</time>
              </>
            )}
          </p>
        </div>
        {/* The panel shares its height with Traffic: live mode gives the spare height to the clicks chart,
            snapshot mode (no chart) to the metric tiles as a 2x2 block, so neither leaves an empty band. */}
        <dl className={`mt-3 grid grid-cols-2 gap-3 ${liveLine ? "sm:grid-cols-4" : "flex-1 auto-rows-fr"}`}>
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="wr-pill flex flex-col justify-between gap-2 !rounded-2xl px-3 py-2.5"
              style={{ background: [YELLOW, "#a8d8ff", GREEN, "#ffffff"][i] }}
            >
              <dt className="text-[11px] font-extrabold uppercase tracking-wide opacity-75">{m.label}</dt>
              <dd className={`wr-display mt-0.5 font-bold leading-none ${liveLine ? "text-3xl" : "text-3xl md:text-[2.6rem]"}`}>{m.value}</dd>
            </div>
          ))}
        </dl>
        {live && liveLine ? (
          <div className="mt-4 flex flex-1 flex-col">
            <div className="relative min-h-16 flex-1 md:min-h-20">
              <svg
                viewBox={`0 0 ${SW} ${SH}`}
                preserveAspectRatio="none"
                className="absolute inset-0 block h-full w-full overflow-visible"
                role="img"
                aria-label={`Daily Google clicks from ${isoDay(live.startDate)} to ${isoDay(live.dataThrough)}, best day ${isoDay(live.daily[liveLine.peak].date)} with ${live.daily[liveLine.peak].clicks} clicks.`}
              >
                <line x1={SPAD.l} x2={SW - SPAD.r} y1={SH - SPAD.b} y2={SH - SPAD.b} stroke={INK} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <motion.path
                  d={liveLine.area}
                  fill={`url(#${gradId})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: searchSeen ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.6 }}
                />
                <motion.path
                  d={liveLine.line}
                  fill="none"
                  stroke={INK}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: searchSeen ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 1.1, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </svg>
              {/* peak dot as HTML so it stays round when the line stretches */}
              <span
                aria-hidden
                className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{ left: `${(liveLine.peakX / SW) * 100}%`, top: `${(liveLine.peakY / SH) * 100}%`, background: RED, borderColor: INK }}
              />
            </div>
            <div aria-hidden className="mt-1 flex justify-between gap-2 text-[11px] font-bold opacity-70">
              <span>{isoDay(live.startDate)}</span>
              <span>
                Best day {isoDay(live.daily[liveLine.peak].date)} · {live.daily[liveLine.peak].clicks} clicks
              </span>
              <span>{isoDay(live.dataThrough)}</span>
            </div>
            <p className="mt-2 text-sm font-bold leading-snug">
              Daily clicks since launch. Last 7 days of data: about {recentAvg.toLocaleString("en-US")} a day.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-4">
            <svg viewBox="0 0 160 56" aria-hidden className="hidden h-14 w-36 shrink-0 sm:block">
              <path d="M4 50 C 30 50, 44 48, 62 42 S 96 30, 112 22 S 140 10, 156 8" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
              <path d="M146 4 l 11 4 l -8 8" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug">{S.trend}</p>
              <p className="mt-1 hidden text-[11px] font-bold opacity-70 sm:block">Curve is illustrative, not plotted data.</p>
            </div>
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        id={`${tabBase}-traffic`}
        aria-labelledby={`${tabBase}-traffic-tab`}
        className={`[grid-area:1/1] ${tab === "traffic" ? "" : "invisible"}`}
        inert={tab !== "traffic"}
      >
      <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wide opacity-70">
        {A.source} · {A.period}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <Stat label="Visitors" value={A.visitors} growth={A.visitorsGrowth} start={inView} />
        <Stat label="Page views" value={A.pageViews} growth={A.pageViewsGrowth} start={inView} />
      </div>

      <div className="relative mt-3">
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

          </motion.g>

          {/* active day */}
          {active !== null && (
            <line x1={tipX} x2={tipX} y1={PAD.t - 6} y2={H - PAD.b} stroke={INK} strokeWidth="1.5" strokeDasharray="3 4" />
          )}
          <circle cx={rd(tipX)} cy={rd(ys[shown])} r="7" fill={active === null ? RED : YELLOW} stroke={INK} strokeWidth="3" />


        </svg>
        {/* labels as HTML so they stay readable when the chart scales down */}
        <motion.span
          aria-hidden
          data-noscript-fade=""
          className="wr-display pointer-events-none absolute whitespace-nowrap text-[13px] font-bold leading-none md:text-[15px]"
          style={{
            left: `${((xs[PEAK_I] - 76) / W) * 100}%`,
            top: `${(ys[PEAK_I] / H) * 100}%`,
            x: "-100%",
            y: "-60%",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ delay: reduce ? 0 : 1.3 }}
        >
          Peak {A.peak.day} · {A.peak.visitors}
        </motion.span>

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

      <div aria-hidden className="mt-1 flex justify-between text-xs font-bold opacity-70">
          <span>{A.dailyStart}</span>
          <span>{A.dailyEnd}</span>
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
      {footnote && <p className="mt-4 border-t-2 border-dashed pt-3 text-[13px] font-bold leading-snug" style={{ borderColor: INK }}>{footnote}</p>}
    </div>
  );
}
