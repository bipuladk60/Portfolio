"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { GLOBE_CODES, GLOBE_LAND_OTHER, GLOBE_ROWS, GLOBE_STEP } from "@/data/globeDots";
import { GREEN, toonHeat } from "@/components/toon/toon";

export type HudGuess = { code: string; lat: number; lon: number; t: number };
type LatLon = { lat: number; lon: number };

/** Decoded lattice: unit vectors plus the country index (0 ocean, 1..n country, 255 other land). */
type Lattice = { n: number; x: Float32Array; y: Float32Array; z: Float32Array; c: Uint8Array; ocean: Uint8Array };
let LATTICE: Lattice | null = null;

function lattice(): Lattice {
  if (LATTICE) return LATTICE;
  let n = 0;
  for (const row of GLOBE_ROWS) for (let k = 1; k < row.length; k += 2) n += row[k];
  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const z = new Float32Array(n);
  const c = new Uint8Array(n);
  const ocean = new Uint8Array(n); // a sparse subset of ocean dots is drawn, so the sea reads as texture
  let i = 0;
  GLOBE_ROWS.forEach((row, r) => {
    const lat = 90 - GLOBE_STEP / 2 - r * GLOBE_STEP;
    let len = 0;
    for (let k = 1; k < row.length; k += 2) len += row[k];
    const la = (lat * Math.PI) / 180;
    let j = 0;
    for (let k = 0; k < row.length; k += 2) {
      for (let m = 0; m < row[k + 1]; m++, j++, i++) {
        const lo = ((-180 + ((j + 0.5) * 360) / len) * Math.PI) / 180;
        x[i] = Math.cos(la) * Math.sin(lo);
        y[i] = Math.sin(la);
        z[i] = Math.cos(la) * Math.cos(lo);
        c[i] = row[k];
        ocean[i] = row[k] === 0 && r % 2 === 0 && j % 2 === 0 ? 1 : 0;
      }
    }
  });
  LATTICE = { n, x, y, z, c, ocean };
  return LATTICE;
}

const CODE_INDEX = new Map(GLOBE_CODES.map((code, i) => [code, i + 1]));
/** The answer's own dots turn green when the round is solved. */
const NEPAL_INDEX = CODE_INDEX.get("NPL") ?? -1;
/** Countries too small for the lattice get a marker dot instead of a fill. */
const DOT_COUNT = (() => {
  const counts = new Map<number, number>();
  for (const row of GLOBE_ROWS) for (let k = 0; k < row.length; k += 2) counts.set(row[k], (counts.get(row[k]) ?? 0) + row[k + 1]);
  return counts;
})();

function toVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

const TILT = -0.4;
const FILL_MS = 650;

type Props = {
  guesses: HudGuess[];
  focus: LatLon | null;
  /** once set, heat radiates outward from this point across the whole globe */
  bloom: LatLon | null;
};

/**
 * HUD-styled orthographic dot globe (Canvas 2D) for the checkpoint round.
 * Every land dot belongs to a country, so a guess fills its whole country in Warmer's heat colour,
 * the way the real game paints the map. Solving sends a heat wave out from the answer.
 * DPR <= 1.5, paused offscreen, static under reduced motion.
 */
export function HudGlobe({ guesses, focus, bloom }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrap, { margin: "120px" });
  const reduce = useReducedMotion();
  const props = useRef({ guesses, focus, bloom });
  const state = useRef({ rot: 0.6, focusUntil: 0, wave: 0, filledAt: new Map<string, number>() });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    props.current = { guesses, focus, bloom };
    const s = state.current;
    const now = performance.now();
    for (const g of guesses) if (!s.filledAt.has(g.code)) s.filledAt.set(g.code, reduce ? 0 : now);
    for (const code of [...s.filledAt.keys()]) if (!guesses.some((g) => g.code === code)) s.filledAt.delete(code);
    if (focus) s.focusUntil = now + 2400;
    if (!bloom) s.wave = 0;
    if (reduce) {
      if (focus) s.rot = (-focus.lon * Math.PI) / 180;
      if (bloom) s.wave = 1;
    }
    redraw.current?.();
  }, [guesses, focus, bloom, reduce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = wrap.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const L = lattice();
    const s = state.current;
    let size = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      size = el.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    };

    const draw = (now = performance.now()) => {
      if (!size) return;
      const { guesses: gs, bloom: bl } = props.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const R = size * 0.44;
      const cx = size / 2;
      const cy = size / 2;
      const unit = size / 320;
      // dot size follows the lattice spacing so neighbouring dots never merge
      const pitch = R * ((GLOBE_STEP * Math.PI) / 180);

      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      g.addColorStop(0, "rgba(46,64,82,0.55)");
      g.addColorStop(1, "rgba(10,13,18,0.9)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const cr = Math.cos(s.rot);
      const sr = Math.sin(s.rot);
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      const bv = bl ? toVec(bl.lat, bl.lon) : null;

      // guessed countries: index -> [colour, fill progress 0..1]
      const fills = new Map<number, [string, number]>();
      for (const q of gs) {
        const idx = CODE_INDEX.get(q.code);
        if (!idx) continue;
        const at = s.filledAt.get(q.code) ?? 0;
        const p = at === 0 ? 1 : Math.min(1, (now - at) / FILL_MS);
        fills.set(idx, [toonHeat(q.t, q.t === 0), 1 - (1 - p) ** 3]);
      }

      // batch dots into one path per colour + alpha. At 1-2 px a square reads as a dot and is far
      // cheaper to fill than an arc, which keeps ~10k front-facing dots inside the frame budget.
      const paths = new Map<string, Path2D>();
      const dot = (col: string, alpha: number, px: number, py: number, r: number) => {
        const key = `${col}|${Math.round(alpha * 10) / 10}`;
        let p = paths.get(key);
        if (!p) paths.set(key, (p = new Path2D()));
        p.rect(px - r, py - r, r * 2, r * 2);
      };

      for (let i = 0; i < L.n; i++) {
        const c = L.c[i];
        if (c === 0 && !L.ocean[i] && !(bv && s.wave > 0)) continue;
        const x = L.x[i];
        const y = L.y[i];
        const z = L.z[i];
        const x1 = x * cr + z * sr;
        const z1 = -x * sr + z * cr;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        if (z2 < 0) continue;
        const px = cx + x1 * R;
        const py = cy - y2 * R;
        const shade = 0.55 + 0.45 * z2;

        if (bv && s.wave > 0) {
          const d = Math.acos(Math.max(-1, Math.min(1, x * bv[0] + y * bv[1] + z * bv[2]))) / Math.PI;
          if (d < s.wave) {
            if (c === 0 && !L.ocean[i]) continue;
            const col = c === NEPAL_INDEX ? GREEN : toonHeat(Math.round(d * 40) / 40);
            dot(col, (c ? 0.9 : 0.4) * shade, px, py, pitch * (c ? 0.42 : 0.3));
            continue;
          }
          if (c === 0 && !L.ocean[i]) continue;
        }

        if (c === 0) {
          dot("#8A97A6", 0.05 + 0.08 * z2, px, py, pitch * 0.22);
          continue;
        }
        const f = c === GLOBE_LAND_OTHER ? undefined : fills.get(c);
        if (f) {
          dot(f[0], 0.95 * shade, px, py, pitch * (0.3 + 0.14 * f[1]));
          continue;
        }
        dot("#8A97A6", 0.25 + 0.5 * z2, px, py, pitch * 0.3);
      }
      for (const [key, p] of paths) {
        const [col, a] = key.split("|");
        ctx.globalAlpha = Number(a);
        ctx.fillStyle = col;
        ctx.fill(p);
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(255,154,60,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // marker dots only for countries too small to own lattice dots; a ring pulses on the newest guess
      gs.forEach((q, idx) => {
        const [qx, qy, qz] = toVec(q.lat, q.lon);
        const qx1 = qx * cr + qz * sr;
        const qz1 = -qx * sr + qz * cr;
        const qy2 = qy * ct - qz1 * st;
        const qz2 = qy * st + qz1 * ct;
        if (qz2 <= 0.05) return;
        const px = cx + qx1 * R;
        const py = cy - qy2 * R;
        const col = toonHeat(q.t, q.t === 0);
        const ci = CODE_INDEX.get(q.code);
        if (!ci || !DOT_COUNT.get(ci)) {
          ctx.fillStyle = col;
          ctx.strokeStyle = "#0A0D12";
          ctx.lineWidth = 1.5 * unit;
          ctx.beginPath();
          ctx.arc(px, py, 4 * unit * (0.6 + 0.4 * qz2), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        if (idx === gs.length - 1) {
          const p = reduce ? 0.4 : (now % 1600) / 1600;
          ctx.globalAlpha = (1 - p) * 0.9;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.25 * unit;
          ctx.beginPath();
          ctx.arc(px, py, (6 + p * 18) * unit, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    };

    resize();
    redraw.current = () => draw();
    let running = false;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      // idle spin only needs ~30 fps; guesses, focus moves and the solve wave run at full rate
      const busy = props.current.bloom || t < s.focusUntil || [...s.filledAt.values()].some((at) => at && t - at < FILL_MS);
      if (!busy && last && t - last < 30) return;
      const dt = last ? Math.min(50, t - last) : 16;
      last = t;
      const f = props.current.focus;
      if (f && t < s.focusUntil) {
        const goal = (-f.lon * Math.PI) / 180;
        let diff = (goal - s.rot) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        s.rot += diff * Math.min(1, dt * 0.005);
      } else {
        s.rot += dt * 0.00016;
      }
      if (props.current.bloom) s.wave = Math.min(1, s.wave + dt / 1400);
      draw(t);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw();
    });
    ro.observe(el);
    if (inView && !reduce) {
      running = true;
      raf = requestAnimationFrame(loop);
    } else {
      draw();
    }
    return () => {
      running = false;
      redraw.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduce]);

  return (
    <div ref={wrap} aria-hidden data-cursor-box="lock" className="relative mx-auto aspect-square w-full max-w-[380px]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
