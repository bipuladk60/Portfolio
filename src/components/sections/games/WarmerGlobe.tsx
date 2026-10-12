"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { LAND_DOTS } from "../hero/geo";
import { GREEN, INK, toonHeat } from "@/components/toon/toon";

const N = 3600;

// Coarse 3-degree land cells, recovered from the hero map's shared land mask (equirectangular, 2 units per degree).
const LAND = (() => {
  const cells = new Set<number>();
  for (const m of LAND_DOTS.matchAll(/M([\d.]+) ([\d.]+)/g)) {
    const i = Math.floor(Number(m[2]) / 2 / 3);
    const j = Math.floor(Number(m[1]) / 2 / 3);
    cells.add(i * 1000 + j);
  }
  return cells;
})();
const isLand = (lat: number, lon: number) => LAND.has(Math.floor((90 - lat) / 3) * 1000 + Math.floor((lon + 180) / 3));

export type LatLon = { lat: number; lon: number };
/** t = distance / half circumference; t === 0 is the answer */
export type GlobeGuess = LatLon & { t: number };

function toVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

const TILT = -0.35;
const SPOT = 0.17; // angular radius (rad) of a guessed country's paint

type GlobeProps = {
  guesses: GlobeGuess[];
  /** once solved, heat bleeds across the whole globe around the answer */
  reveal: LatLon | null;
  /** the globe turns to face this point */
  focus: LatLon | null;
};

/**
 * Cartoon orthographic dot globe on Canvas 2D: pale-blue ball, thick ink outline, offset shadow.
 * Each guess paints its dots in the game's heat colour. DPR <= 1.5, paused offscreen.
 */
export function WarmerGlobe({ guesses, reveal, focus }: GlobeProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrap, { margin: "120px" });
  const reduce = useReducedMotion();
  const props = useRef({ guesses, reveal, focus });
  const state = useRef({ rot: -1.4, focusUntil: 0, revealAmt: 0 });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    props.current = { guesses, reveal, focus };
    if (focus) state.current.focusUntil = performance.now() + 2600;
    if (!reveal) state.current.revealAmt = 0;
    if (reduce) {
      if (focus) state.current.rot = (-focus.lon * Math.PI) / 180;
      if (reveal) state.current.revealAmt = 1;
    }
    redraw.current?.();
  }, [guesses, reveal, focus, reduce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = wrap.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pts = new Float32Array(N * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * golden;
      pts[i * 3] = Math.cos(phi) * r;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = Math.sin(phi) * r;
    }
    const land = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const lat = (Math.asin(pts[i * 3 + 1]) * 180) / Math.PI;
      const lon = (Math.atan2(pts[i * 3], pts[i * 3 + 2]) * 180) / Math.PI;
      land[i] = isLand(lat, lon) ? 1 : 0;
    }
    const s = state.current;
    let size = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      size = el.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    };

    const draw = (t = 0) => {
      if (!size) return;
      const { guesses: gs, reveal: rv } = props.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const R = size * 0.42;
      const cx = size / 2 - 3;
      const cy = size / 2 - 3;
      const unit = size / 320;

      // offset sticker shadow
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(cx + 7 * unit, cy + 8 * unit, R, 0, Math.PI * 2);
      ctx.fill();
      // ball
      const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      g.addColorStop(0, "#e6f3ff");
      g.addColorStop(0.6, "#b9d9f7");
      g.addColorStop(1, "#93bfee");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const gv = gs.map((q) => ({ v: toVec(q.lat, q.lon), col: toonHeat(q.t, q.t === 0) }));
      const rvv = rv ? toVec(rv.lat, rv.lon) : null;
      const cr = Math.cos(s.rot);
      const sr = Math.sin(s.rot);
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      const cosSpot = Math.cos(SPOT);

      for (let i = 0; i < N; i++) {
        const x = pts[i * 3];
        const y = pts[i * 3 + 1];
        const z = pts[i * 3 + 2];
        const x1 = x * cr + z * sr;
        const z1 = -x * sr + z * cr;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        if (z2 < 0) continue;

        let col = INK;
        let alpha = land[i] ? 0.75 + 0.25 * z2 : 0.04 + 0.06 * z2;
        let boost = 1;
        if (rvv && s.revealAmt > 0) {
          const d = Math.acos(Math.max(-1, Math.min(1, x * rvv[0] + y * rvv[1] + z * rvv[2]))) / Math.PI;
          col = d < 0.05 ? GREEN : toonHeat(d);
          alpha = alpha * (1 - s.revealAmt) + (0.45 + 0.55 * z2) * s.revealAmt;
          boost = 1 + 0.35 * s.revealAmt;
        }
        for (const q of gv) {
          if (x * q.v[0] + y * q.v[1] + z * q.v[2] > cosSpot) {
            col = q.col;
            alpha = 0.6 + 0.4 * z2;
            boost = 1.7;
          }
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cx + x1 * R, cy - y2 * R, (land[i] ? 1.0 + 0.8 * z2 : 0.45 + 0.5 * z2) * unit * boost, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // shine + ink outline
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.ellipse(cx - R * 0.42, cy - R * 0.5, R * 0.2, R * 0.1, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5 * unit;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // sticker markers on every guessed country that faces us
      for (const q of gs) {
        const [qx, qy, qz] = toVec(q.lat, q.lon);
        const qx1 = qx * cr + qz * sr;
        const qz1 = -qx * sr + qz * cr;
        const qy2 = qy * ct - qz1 * st;
        const qz2 = qy * st + qz1 * ct;
        if (qz2 <= 0.05) continue;
        ctx.fillStyle = toonHeat(q.t, q.t === 0);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.2 * unit;
        ctx.beginPath();
        ctx.arc(cx + qx1 * R, cy - qy2 * R, 7 * unit * (0.6 + 0.4 * qz2), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // ping on the latest guess
      const last = gs[gs.length - 1];
      if (last) {
        const [tx, ty, tz] = toVec(last.lat, last.lon);
        const tx1 = tx * cr + tz * sr;
        const tz1 = -tx * sr + tz * cr;
        const ty2 = ty * ct - tz1 * st;
        const tz2 = ty * st + tz1 * ct;
        if (tz2 > 0.1) {
          const p = reduce ? 0.35 : (t % 1500) / 1500;
          ctx.globalAlpha = 1 - p;
          ctx.strokeStyle = INK;
          ctx.lineWidth = 2 * unit;
          ctx.beginPath();
          ctx.arc(cx + tx1 * R, cy - ty2 * R, (8 + p * 16) * unit, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    };

    resize();
    redraw.current = () => draw(0);
    let running = false;
    let raf = 0;
    let last = 0;

    const loop = (t: number) => {
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
        s.rot += dt * 0.00018;
      }
      if (props.current.reveal) s.revealAmt = Math.min(1, s.revealAmt + dt / 900);
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(0);
    });
    ro.observe(el);

    if (inView && !reduce) {
      running = true;
      raf = requestAnimationFrame(loop);
    } else {
      draw(0);
    }

    return () => {
      running = false;
      redraw.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduce]);

  return (
    <div ref={wrap} aria-hidden className="relative mx-auto aspect-square w-full max-w-[220px] sm:max-w-[300px] lg:max-w-[340px]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
