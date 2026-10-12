"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEAD,
  INFECTED,
  P,
  RECOVERED,
  RUN_DAYS,
  SUSCEPTIBLE,
  counts,
  createSim,
  isDone,
  step,
  viralLoad,
  type Counts,
  type Sim,
} from "./diseaseModel";
import { useReducedMotionSafe } from "./motion";

const STEP_MS = 170; // ~6 simulated days per second (the notebook animates at 5 fps)
const DPR_MAX = 1.5;
const FIRST_SEED = 20240401;
/** Reduced motion: show a frame well into the outbreak instead of animating to it. */
const STILL_DAY = 40;

const COLORS = {
  sky: "#4c8dff",
  fire: "#ff5c5c",
  water: "#34c98a",
  dead: "#5d6a78",
  line: "#1f2b38",
};

type Stats = { day: number; c: Counts; newInfections: number; reinfections: number; done: boolean };

function readStats(sim: Sim): Stats {
  return {
    day: sim.day,
    c: counts(sim),
    newInfections: sim.newInfections,
    reinfections: sim.reinfections,
    done: isDone(sim),
  };
}

function fitCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function drawField(canvas: HTMLCanvasElement, sim: Sim, t: number) {
  const { ctx, w } = fitCanvas(canvas);
  if (!ctx || w === 0) return;
  ctx.clearRect(0, 0, w, w);
  const r = Math.max(2, (1.8 * w) / P.size);
  // Draw-only inset: the model's 0..size box maps into [pad, w - pad] so dots at the walls stay whole
  // (largest dot is an infected one at 1.1 r). The model itself is untouched.
  const pad = r * 1.1 + 2;
  const k = (w - 2 * pad) / P.size;
  const pos = (i: number) => [
    pad + (sim.px[i] + (sim.x[i] - sim.px[i]) * t) * k,
    w - pad - (sim.py[i] + (sim.y[i] - sim.py[i]) * t) * k, // y up, like the matplotlib axes
  ];

  // halos first: radius ~ 2 x viral load (world units), where exp(-d/VL) has fallen to ~14%
  for (let i = 0; i < sim.n; i++) {
    if (sim.status[i] !== INFECTED) continue;
    const [cx, cy] = pos(i);
    const hr = 2 * viralLoad(sim.days[i]) * k + r;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, hr);
    g.addColorStop(0, "rgba(255,92,92,0.30)");
    g.addColorStop(1, "rgba(255,92,92,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, hr, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < sim.n; i++) {
    const st = sim.status[i];
    const [cx, cy] = pos(i);
    if (st === DEAD) {
      const s = r * 0.9;
      ctx.strokeStyle = COLORS.dead;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - s, cy - s);
      ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx + s, cy - s);
      ctx.lineTo(cx - s, cy + s);
      ctx.stroke();
      continue;
    }
    ctx.globalAlpha = st === SUSCEPTIBLE ? 0.6 : 1;
    ctx.fillStyle = st === INFECTED ? COLORS.fire : st === RECOVERED ? COLORS.water : COLORS.sky;
    ctx.beginPath();
    ctx.arc(cx, cy, st === INFECTED ? r * 1.1 : r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/** Stacked S/I/R/D share over the 100-day run. Bottom-up: infected, recovered, susceptible, dead. */
function drawChart(canvas: HTMLCanvasElement, sim: Sim) {
  const { ctx, w, h } = fitCanvas(canvas);
  if (!ctx || w === 0) return;
  ctx.clearRect(0, 0, w, h);
  const hist = sim.history;
  const n = sim.n;
  const layers: [keyof Counts, string, number][] = [
    ["i", COLORS.fire, 0.85],
    ["r", COLORS.water, 0.7],
    ["s", COLORS.sky, 0.28],
    ["d", COLORS.dead, 0.7],
  ];
  const xAt = (d: number) => (d / RUN_DAYS) * w;
  const base = new Float32Array(hist.length);
  for (const [key, color, alpha] of layers) {
    ctx.beginPath();
    for (let d = 0; d < hist.length; d++) ctx.lineTo(xAt(d), h - ((base[d] + hist[d][key]) / n) * h);
    for (let d = hist.length - 1; d >= 0; d--) ctx.lineTo(xAt(d), h - (base[d] / n) * h);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    for (let d = 0; d < hist.length; d++) base[d] += hist[d][key];
  }
  ctx.globalAlpha = 1;
  // the current-day cursor
  const cx = Math.min(xAt(hist.length - 1), w - 1);
  ctx.fillStyle = "rgba(233,229,218,0.6)";
  ctx.fillRect(cx, 0, 1, h);
}

function newSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}

export function DiseaseSim() {
  const reduce = useReducedMotionSafe();
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const rafRef = useRef(0);
  const accRef = useRef(0);
  const lastRef = useRef(0);
  const visibleRef = useRef(false);
  const playingRef = useRef(false);
  const reduceRef = useRef(false);
  const touchedRef = useRef(false); // the visitor has pressed play/pause, so no autoplay
  const [playing, setPlaying] = useState(false);
  const [population, setPopulation] = useState<number>(P.population);
  const [initial, setInitial] = useState<number>(P.initialInfected);
  const [stats, setStats] = useState<Stats>(() => ({
    day: 0,
    c: { s: P.population - P.initialInfected, i: P.initialInfected, r: 0, d: 0 },
    newInfections: 0,
    reinfections: 0,
    done: false,
  }));

  const getSim = useCallback(() => {
    if (!simRef.current) simRef.current = createSim(FIRST_SEED);
    return simRef.current;
  }, []);

  const paint = useCallback(
    (t = 1) => {
      const sim = getSim();
      if (fieldRef.current) drawField(fieldRef.current, sim, t);
      if (chartRef.current) drawChart(chartRef.current, sim);
    },
    [getSim],
  );

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const frame = useCallback(
    (ts: number) => {
      const sim = getSim();
      const dt = lastRef.current ? Math.min(ts - lastRef.current, 250) : 0;
      lastRef.current = ts;
      accRef.current += dt;
      let stepped = false;
      while (accRef.current >= STEP_MS && !isDone(sim)) {
        step(sim);
        accRef.current -= STEP_MS;
        stepped = true;
      }
      if (fieldRef.current) drawField(fieldRef.current, sim, Math.min(accRef.current / STEP_MS, 1));
      if (stepped) {
        if (chartRef.current) drawChart(chartRef.current, sim);
        setStats(readStats(sim));
      }
      if (isDone(sim)) {
        accRef.current = STEP_MS; // settle the interpolation on the final positions
        if (fieldRef.current) drawField(fieldRef.current, sim, 1);
        playingRef.current = false;
        setPlaying(false);
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    },
    [getSim],
  );

  /** Run the loop only while playing, on screen and the tab is visible. */
  const sync = useCallback(() => {
    const run = playingRef.current && visibleRef.current && !document.hidden;
    if (run && !rafRef.current) {
      lastRef.current = 0;
      rafRef.current = requestAnimationFrame(frame);
    } else if (!run && rafRef.current) {
      stop();
    }
  }, [frame, stop]);

  const setPlay = useCallback(
    (p: boolean) => {
      playingRef.current = p;
      setPlaying(p);
      sync();
    },
    [sync],
  );

  const restart = useCallback(
    (pop: number, init: number, play: boolean) => {
      stop();
      simRef.current = createSim(newSeed(), pop, init);
      accRef.current = 0;
      setStats(readStats(simRef.current));
      paint(1);
      setPlay(play);
    },
    [paint, setPlay, stop],
  );

  // visibility: offscreen and hidden tabs pause the loop; first view autoplays (not with reduced motion)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.isIntersecting;
        if (e.isIntersecting && !touchedRef.current && !reduceRef.current && getSim().day === 0) {
          touchedRef.current = true;
          playingRef.current = true;
          setPlaying(true);
        }
        sync();
      },
      { threshold: 0.25 },
    );
    io.observe(root);
    const onVis = () => sync();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stop();
    };
  }, [getSim, stop, sync]);

  // reduced motion: start paused on a precomputed frame well into the outbreak
  useEffect(() => {
    reduceRef.current = reduce;
    const sim = getSim();
    if (reduce && sim.day === 0 && !touchedRef.current) {
      touchedRef.current = true;
      playingRef.current = false;
      setPlaying(false);
      stop();
      while (sim.day < STILL_DAY && !isDone(sim)) step(sim);
      sim.px.set(sim.x);
      sim.py.set(sim.y);
      setStats(readStats(sim));
    }
    paint(1);
  }, [reduce, getSim, paint, stop]);

  // keep both canvases crisp on resize
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!rafRef.current) paint(1);
    });
    if (fieldRef.current) ro.observe(fieldRef.current);
    if (chartRef.current) ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, [paint]);

  const onPlay = () => {
    touchedRef.current = true;
    if (stats.done) restart(population, initial, true);
    else setPlay(!playing);
  };

  const legend: { key: keyof Counts; label: string; swatch: React.ReactNode }[] = [
    { key: "s", label: "Susceptible", swatch: <span className="h-2 w-2 rounded-full bg-sky/70" /> },
    { key: "i", label: "Infected", swatch: <span className="h-2 w-2 rounded-full bg-fire shadow-[0_0_8px_var(--fire)]" /> },
    { key: "r", label: "Recovered", swatch: <span className="h-2 w-2 rounded-full bg-water" /> },
    { key: "d", label: "Dead", swatch: <span className="font-mono text-[11px] leading-none text-[#5d6a78]">×</span> },
  ];

  return (
    <div
      ref={rootRef}
      data-cursor-box="lock"
      className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_240px]"
    >
      <div className="relative aspect-square w-full border border-line bg-bg">
        <canvas
          ref={fieldRef}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Simulation, day ${stats.day}: ${stats.c.s} susceptible, ${stats.c.i} infected, ${stats.c.r} recovered, ${stats.c.d} dead.`}
        />
        <p className="pointer-events-none absolute left-3 top-2.5 font-mono text-xs tabular-nums text-dim">
          Day <span className="text-text">{String(stats.day).padStart(3, "0")}</span> / {RUN_DAYS}
          {stats.done && stats.day < RUN_DAYS && <span className="ml-2 text-water">no one infected</span>}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          {legend.map((l) => (
            <div key={l.key}>
              <dt className="flex items-center gap-2 text-xs text-dim">
                <span aria-hidden className="inline-flex w-2 justify-center">
                  {l.swatch}
                </span>
                {l.label}
              </dt>
              <dd className="mt-0.5 pl-4 font-display text-2xl font-semibold leading-none tabular-nums text-text">{stats.c[l.key]}</dd>
            </div>
          ))}
        </dl>

        <div>
          <canvas ref={chartRef} aria-hidden className="block h-16 w-full border-b border-line bg-panel/60" />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-dim" aria-hidden>
            <span>day 0</span>
            <span>{RUN_DAYS}</span>
          </div>
          <p className="mt-2 font-mono text-[11px] text-dim">
            infections {stats.newInfections} · reinfections {stats.reinfections}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="flex-1 cursor-pointer border border-water/60 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-water transition-colors hover:bg-water hover:text-bg"
          >
            {stats.done ? "Run again" : playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => {
              touchedRef.current = true;
              restart(population, initial, true);
            }}
            className="flex-1 cursor-pointer border border-line-hi px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-dim transition-colors hover:border-text hover:text-text"
          >
            Restart
          </button>
        </div>

        <fieldset className="space-y-3">
          <legend className="hud-label mb-2">Try it</legend>
          <Slider
            label="Population"
            def={P.population}
            value={population}
            min={50}
            max={200}
            step={10}
            onChange={(v) => {
              setPopulation(v);
              touchedRef.current = true;
              restart(v, initial, playingRef.current || stats.done);
            }}
          />
          <Slider
            label="Initially infected"
            def={P.initialInfected}
            value={initial}
            min={1}
            max={20}
            step={1}
            onChange={(v) => {
              setInitial(v);
              touchedRef.current = true;
              restart(population, v, playingRef.current || stats.done);
            }}
          />
        </fieldset>
      </div>
    </div>
  );
}

function Slider({
  label,
  def,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  def: number;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 text-xs text-dim">
        <span>
          {label} <span className="text-[11px] opacity-70">· notebook {def}</span>
        </span>
        <span className="font-mono tabular-nums text-text">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full cursor-pointer accent-[var(--water)]"
      />
    </label>
  );
}
