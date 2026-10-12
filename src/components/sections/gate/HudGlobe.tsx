"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { LAND_DOTS } from "../hero/geo";
import { GREEN, toonHeat } from "@/components/toon/toon";

const N = 3200;

// Coarse 3-degree land cells from the hero map's shared land mask (equirectangular, 2 units per degree).
const LAND = (() => {
  const cells = new Set<number>();
  for (const m of LAND_DOTS.matchAll(/M([\d.]+) ([\d.]+)/g)) {
    cells.add(Math.floor(Number(m[2]) / 6) * 1000 + Math.floor(Number(m[1]) / 6));
  }
  return cells;
})();
const isLand = (lat: number, lon: number) => LAND.has(Math.floor((90 - lat) / 3) * 1000 + Math.floor((lon + 180) / 3));

export type HudGuess = { lat: number; lon: number; t: number };
type LatLon = { lat: number; lon: number };

function toVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

const TILT = -0.4;

type Props = {
  guesses: HudGuess[];
  focus: LatLon | null;
  /** once set, heat radiates outward from this point across the whole globe */
  bloom: LatLon | null;
};

/**
 * HUD-styled orthographic dot globe (Canvas 2D) for the checkpoint round.
 * Guesses are marked in Warmer's heat colours; solving sends a heat wave out from the answer.
 * DPR <= 1.5, paused offscreen, static under reduced motion.
 */
export function HudGlobe({ guesses, focus, bloom }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrap, { margin: "120px" });
  const reduce = useReducedMotion();
  const props = useRef({ guesses, focus, bloom });
  const state = useRef({ rot: 0.6, focusUntil: 0, wave: 0 });
  const redraw = useRef<(() => void) | null>(null);

  useEffect(() => {
    props.current = { guesses, focus, bloom };
    if (focus) state.current.focusUntil = performance.now() + 2400;
    if (!bloom) state.current.wave = 0;
    if (reduce) {
      if (focus) state.current.rot = (-focus.lon * Math.PI) / 180;
      if (bloom) state.current.wave = 1;
    }
    redraw.current?.();
  }, [guesses, focus, bloom, reduce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = wrap.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pts = new Float32Array(N * 3);
    const land = new Uint8Array(N);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - ((i + 0.5) / N) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * golden;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      pts[i * 3] = x;
      pts[i * 3 + 1] = y;
      pts[i * 3 + 2] = z;
      land[i] = isLand((Math.asin(y) * 180) / Math.PI, (Math.atan2(x, z) * 180) / Math.PI) ? 1 : 0;
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
      const { guesses: gs, bloom: bl } = props.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const R = size * 0.44;
      const cx = size / 2;
      const cy = size / 2;
      const unit = size / 320;

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

      for (let i = 0; i < N; i++) {
        const x = pts[i * 3];
        const y = pts[i * 3 + 1];
        const z = pts[i * 3 + 2];
        const x1 = x * cr + z * sr;
        const z1 = -x * sr + z * cr;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        if (z2 < 0) continue;
        let col = "#8A97A6";
        let alpha = land[i] ? 0.45 + 0.45 * z2 : 0.05 + 0.07 * z2;
        let rad = land[i] ? 0.9 + 0.8 * z2 : 0.5 + 0.5 * z2;
        if (bv && s.wave > 0) {
          const d = Math.acos(Math.max(-1, Math.min(1, x * bv[0] + y * bv[1] + z * bv[2]))) / Math.PI;
          if (d < s.wave) {
            col = d < 0.04 ? GREEN : toonHeat(d);
            alpha = Math.max(alpha, (land[i] ? 0.85 : 0.45) * (0.5 + 0.5 * z2));
            rad *= 1.15;
          }
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cx + x1 * R, cy - y2 * R, rad * unit, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = "rgba(255,154,60,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // guess markers
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
        ctx.fillStyle = col;
        ctx.strokeStyle = "#0A0D12";
        ctx.lineWidth = 2 * unit;
        ctx.beginPath();
        ctx.arc(px, py, 6 * unit * (0.6 + 0.4 * qz2), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (idx === gs.length - 1) {
          const p = reduce ? 0.4 : (t % 1500) / 1500;
          ctx.globalAlpha = 1 - p;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.5 * unit;
          ctx.beginPath();
          ctx.arc(px, py, (8 + p * 18) * unit, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
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
        s.rot += dt * 0.00016;
      }
      if (props.current.bloom) s.wave = Math.min(1, s.wave + dt / 1400);
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
    <div ref={wrap} aria-hidden data-cursor-box="lock" className="relative mx-auto aspect-square w-full max-w-[380px]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
