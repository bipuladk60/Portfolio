"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useReveal } from "@/lib/reveal";
import { degree, games, hackathons, stats } from "@/data/content";
import { Surface } from "@/components/hud/Surface";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const noop = () => () => {};
const r2 = (v: number) => Math.round(v * 100) / 100;

const WINS = hackathons.filter((h) => h.result === "win");
const year = (when: string) => when.match(/\d{4}/)?.[0] ?? "";
const analytics = games[0].analytics;

/** Share of the degree behind me, from the first semester to graduation, on the visitor's clock. */
function degreeProgress() {
  const start = Date.parse(degree.start);
  const end = Date.parse(degree.graduation);
  const f = Math.max(0, Math.min(1, (Date.now() - start) / (end - start)));
  // Quantised (one step is a few hours) so useSyncExternalStore sees a stable snapshot between calls;
  // a raw Date.now() fraction changes every call and makes React re-render forever.
  return Math.round(f * 1e4) / 1e4;
}

/** Fractions of the degree span where each new academic year starts (the Aug anniversaries of `degree.start`). */
function yearMarks() {
  const start = new Date(degree.start);
  const end = Date.parse(degree.graduation);
  const marks: number[] = [];
  for (let y = 1; ; y++) {
    const t = Date.UTC(start.getUTCFullYear() + y, start.getUTCMonth(), start.getUTCDate());
    if (t >= end) break;
    marks.push((t - start.getTime()) / (end - start.getTime()));
  }
  return marks;
}

function CountUp({ value, run, delay, reduce }: { value: number; run: boolean; delay: number; reduce: boolean }) {
  // The server renders the real number (no-JS readers see it); on mount it drops to 0 behind the
  // still-closed Assemble clip and counts up once the cluster is revealed.
  const count = useMotionValue(value);
  const shown = useTransform(count, (v) => Math.round(v).toLocaleString("en-US"));
  useEffect(() => {
    if (reduce) {
      count.set(value);
      return;
    }
    if (!run) {
      count.set(0);
      return;
    }
    const c = animate(count, value, { duration: 1.3, delay, ease: EASE });
    return () => c.stop();
  }, [run, reduce, value, delay, count]);
  return <motion.span>{shown}</motion.span>;
}

type CellProps = {
  index: number;
  value: number;
  suffix?: string;
  label: string;
  detail?: ReactNode;
  accent: string;
  srText: string;
  visual: (run: boolean, delay: number) => ReactNode;
  run: boolean;
  reduce: boolean;
};

// Hairlines between cells: 2x2 on small screens, one row of four from lg.
const CELL_BORDERS = [
  "",
  "border-l",
  "border-t lg:border-t-0 lg:border-l",
  "border-l border-t lg:border-t-0",
];

function Cell({ index, value, suffix = "", label, detail, accent, srText, visual, run, reduce }: CellProps) {
  const delay = 0.15 + index * 0.09;
  return (
    <li
      className={`group relative flex min-w-0 flex-col border-line/70 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6 ${CELL_BORDERS[index]}`}
      style={{ ["--cell" as string]: accent }}
    >
      {/* Accent bar along the top edge; it widens on hover */}
      <span
        aria-hidden
        className="absolute left-4 top-0 h-px w-6 transition-[width] duration-500 ease-[var(--ease-hud)] group-hover:w-16 sm:left-6"
        style={{ background: accent }}
      />
      <span className="sr-only">{srText}</span>
      <div aria-hidden className="flex h-16 items-end sm:h-20 transition-[filter] duration-300 group-hover:brightness-125">
        {visual(run, delay)}
      </div>
      <p aria-hidden className="mt-4 font-display text-4xl font-bold leading-none tabular-nums text-text sm:text-5xl">
        <CountUp value={value} run={run} delay={delay + 0.15} reduce={reduce} />
        {suffix && (
          <span className="ml-0.5 text-[0.6em] font-semibold" style={{ color: accent }}>
            {suffix}
          </span>
        )}
      </p>
      <p aria-hidden className="mt-2 text-sm leading-snug text-text/85">
        {label}
      </p>
      {detail && (
        <p aria-hidden className="mt-1 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-dim">
          {detail}
        </p>
      )}
    </li>
  );
}

/** One pennant per win, planted in order, with its year under the pole. */
function Flags({ run, delay, reduce }: { run: boolean; delay: number; reduce: boolean }) {
  const gap = 32;
  return (
    <svg viewBox={`0 0 ${WINS.length * gap} 64`} className="h-full w-auto max-w-full overflow-visible" fill="none" preserveAspectRatio="xMinYMax meet">
      <line x1={0} x2={WINS.length * gap - 8} y1={52.5} y2={52.5} stroke="var(--line-hi)" />
      {WINS.map((w, i) => {
        const x = 4 + i * gap;
        const d = reduce ? 0 : delay + i * 0.12;
        return (
          <g key={w.id}>
            <motion.line
              x1={x}
              x2={x}
              y1={52}
              y2={10}
              stroke="var(--text-dim)"
              strokeWidth={1.2}
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: run || reduce ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.35, delay: d, ease: EASE }}
            />
            <motion.path
              d={`M${x + 0.6} 10.5L${x + 17} 15.5L${x + 0.6} 21Z`}
              fill="var(--signal)"
              style={{ transformBox: "fill-box", transformOrigin: "left center" }}
              initial={{ scaleX: reduce ? 1 : 0 }}
              animate={{ scaleX: run || reduce ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.4, delay: d + 0.3, ease: EASE }}
            />
            <text x={x} y={63} textAnchor="middle" fill="var(--text-dim)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
              {"'" + year(w.when).slice(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Six pips on a line, oldest first: gold = win, hollow blue = competed. */
function Pips({ run, delay, reduce }: { run: boolean; delay: number; reduce: boolean }) {
  const gap = 24;
  const w = (hackathons.length - 1) * gap + 16;
  return (
    <svg viewBox={`0 0 ${w} 64`} className="h-full w-auto max-w-full overflow-visible" fill="none" preserveAspectRatio="xMinYMax meet">
      <motion.line
        x1={8}
        x2={w - 8}
        y1={36}
        y2={36}
        stroke="var(--line-hi)"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: run || reduce ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: EASE }}
      />
      {hackathons.map((h, i) => {
        const win = h.result === "win";
        const cx = 8 + i * gap;
        return (
          <motion.g
            key={h.id}
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }}
            animate={run || reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
            transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : delay + 0.25 + i * 0.07, ease: EASE }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {win && <circle cx={cx} cy={36} r={9} fill="var(--signal)" opacity={0.14} />}
            <circle
              cx={cx}
              cy={36}
              r={5}
              fill={win ? "var(--signal)" : "var(--bg)"}
              stroke={win ? "var(--signal)" : "var(--sky)"}
              strokeWidth={1.4}
            />
          </motion.g>
        );
      })}
      <text x={8} y={58} fill="var(--text-dim)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
        {year(hackathons[0].when)}
      </text>
      <text x={w - 8} y={58} textAnchor="end" fill="var(--text-dim)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
        {year(hackathons[hackathons.length - 1].when)}
      </text>
    </svg>
  );
}

/** Warmer's daily visitors over the last 30 days (traced by eye, so approximate), with the peak marked. */
function Spark({ run, delay, reduce }: { run: boolean; delay: number; reduce: boolean }) {
  const data = analytics.daily;
  const W = 176;
  const H = 52;
  const max = Math.max(...data);
  const pts = data.map((v, i) => [r2((i / (data.length - 1)) * W), r2(H - 4 - (v / max) * (H - 12))] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  const area = `${line}L${W} ${H}L0 ${H}Z`;
  const peakI = data.indexOf(max);
  const [px, py] = pts[peakI];
  return (
    <svg viewBox={`0 0 ${W} 64`} className="h-full w-full max-w-[220px] overflow-visible" fill="none" preserveAspectRatio="xMinYMax meet">
      <defs>
        <linearGradient id="spark-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--signal)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={0} x2={W} y1={H + 0.5} y2={H + 0.5} stroke="var(--line-hi)" />
      <motion.path
        d={area}
        fill="url(#spark-area)"
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: run || reduce ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay + 0.9 }}
      />
      <motion.path
        d={line}
        stroke="var(--signal)"
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: run || reduce ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 1.2, delay: reduce ? 0 : delay, ease: EASE }}
      />
      <motion.g
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: run || reduce ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : delay + 1.2 }}
      >
        <circle cx={px} cy={py} r={2.6} fill="var(--bg)" stroke="var(--signal)" strokeWidth={1.4} />
        <text x={px} y={py - 6} textAnchor="middle" fill="var(--text)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
          {analytics.peak.visitors}
        </text>
      </motion.g>
      <text x={0} y={63} fill="var(--text-dim)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
        {analytics.dailyStart}
      </text>
      <text x={W} y={63} textAnchor="end" fill="var(--text-dim)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
        {analytics.dailyEnd}
      </text>
    </svg>
  );
}

/** Half-dial of the degree, start to graduation, with a tick where each academic year begins. */
function Dial({ run, delay, reduce, progress }: { run: boolean; delay: number; reduce: boolean; progress: number }) {
  const R = 44;
  const CX = 50;
  const CY = 54;
  const at = (f: number, r = R) => {
    const a = Math.PI * (1 - f);
    return [r2(CX + r * Math.cos(a)), r2(CY - r * Math.sin(a))] as const;
  };
  const [x0, y0] = at(0);
  const [x1, y1] = at(1);
  const arc = `M${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}`;
  const [nx, ny] = at(progress);
  return (
    <svg viewBox="0 0 100 64" className="h-full w-auto max-w-full overflow-visible" fill="none" preserveAspectRatio="xMinYMax meet">
      <path d={arc} stroke="var(--line)" strokeWidth={6} />
      <motion.path
        d={arc}
        stroke="var(--water)"
        strokeWidth={6}
        data-noscript-keep=""
        initial={{ pathLength: reduce ? progress : 0 }}
        animate={{ pathLength: run || reduce ? progress : 0 }}
        transition={{ duration: reduce ? 0 : 1.3, delay: reduce ? 0 : delay + 0.15, ease: EASE }}
      />
      {yearMarks().map((f) => {
        const [ax, ay] = at(f, R - 5);
        const [bx, by] = at(f, R + 6);
        return <line key={f} x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--bg)" strokeWidth={1.6} />;
      })}
      <motion.circle
        cx={nx}
        cy={ny}
        r={3.6}
        fill="var(--bg)"
        stroke="var(--water)"
        strokeWidth={1.6}
        initial={{ opacity: reduce ? 1 : 0 }}
        animate={{ opacity: run || reduce ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : delay + 1.4 }}
      />
      <text x={x0} y={63} textAnchor="middle" fill="var(--text-dim)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
        {year(degree.start)}
      </text>
      <text x={x1} y={63} textAnchor="middle" fill="var(--text-dim)" fontSize={8} fontFamily="var(--font-mono-face), monospace">
        {year(degree.graduation)}
      </text>
    </svg>
  );
}

/**
 * About at a glance: four readings on one tinted surface. Each number carries a small visual that
 * encodes the same fact (a flag per win, a pip per hackathon, Warmer's daily visitors, the degree dial).
 */
export function InstrumentCluster() {
  const ref = useRef<HTMLUListElement>(null);
  const run = useReveal(ref, "0px 0px -15% 0px");
  const reduce = useReducedMotion() ?? false;
  // 0 on the server and during hydration, the live value right after
  const progress = useSyncExternalStore(noop, degreeProgress, () => 0);
  const pct = Math.round(progress * 100);
  const [wins, competed, users] = stats;
  const split = (label: string) => {
    const [main, ...rest] = label.split(" · ");
    return { main, detail: rest.join(" · ") };
  };
  const u = split(users.label);
  const nCompeted = hackathons.length - WINS.length;

  return (
    <Surface accent="var(--signal)" corners>
      <ul ref={ref} className="grid grid-cols-2 lg:grid-cols-4" aria-label="At a glance">
        <Cell
          index={0}
          value={wins.value}
          suffix={wins.suffix}
          label={wins.label}
          accent="var(--signal)"
          srText={`${wins.value} ${wins.label}: ${WINS.map((w) => year(w.when)).join(", ")}`}
          visual={(r, d) => <Flags run={r} delay={d} reduce={reduce} />}
          run={run}
          reduce={reduce}
        />
        <Cell
          index={1}
          value={competed.value}
          suffix={competed.suffix}
          label={competed.label}
          detail={
            <>
              <span className="text-signal">●</span> {WINS.length} won · <span className="text-sky">○</span> {nCompeted} competed
            </>
          }
          accent="var(--sky)"
          srText={`${competed.value} ${competed.label}: ${WINS.length} won, ${nCompeted} competed`}
          visual={(r, d) => <Pips run={r} delay={d} reduce={reduce} />}
          run={run}
          reduce={reduce}
        />
        <Cell
          index={2}
          value={users.value}
          suffix={users.suffix}
          label={u.main}
          detail={
            <>
              {u.detail}
              <span className="block text-dim/80">Warmer daily visitors · approx.</span>
            </>
          }
          accent="var(--signal)"
          srText={`${users.value.toLocaleString("en-US")}${users.suffix} ${users.label}`}
          visual={(r, d) => <Spark run={r} delay={d} reduce={reduce} />}
          run={run}
          reduce={reduce}
        />
        <Cell
          index={3}
          value={pct}
          suffix="%"
          label="Degree complete"
          detail={`Graduating ${degree.graduationLabel}`}
          accent="var(--water)"
          srText={`${pct}% of the degree complete, graduating ${degree.graduationLabel}`}
          visual={(r, d) => <Dial run={r} delay={d} reduce={reduce} progress={progress} />}
          run={run}
          reduce={reduce}
        />
      </ul>
    </Surface>
  );
}
