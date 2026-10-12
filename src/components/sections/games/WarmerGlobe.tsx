"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

const N = 760;
// distance (0 = on target, 1 = antipode) -> colour, hot to cold
const STOPS: [number, [number, number, number]][] = [
  [0, [255, 92, 92]],
  [0.09, [255, 154, 60]],
  [0.22, [242, 180, 24]],
  [0.45, [138, 151, 166]],
  [1, [76, 141, 255]],
];

export function heatRGB(t: number): string {
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    if (t <= t1) {
      const [t0, c0] = STOPS[i - 1];
      const k = (t - t0) / (t1 - t0);
      return `${Math.round(c0[0] + (c1[0] - c0[0]) * k)},${Math.round(c0[1] + (c1[1] - c0[1]) * k)},${Math.round(c0[2] + (c1[2] - c0[2]) * k)}`;
    }
  }
  return "76,141,255";
}

export type LatLon = { lat: number; lon: number };
export type GlobeGuess = LatLon & { t: number };

function toVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

const TILT = -0.35;
const SPOT = 0.16; // angular radius (rad) of a guessed country's glow

type GlobeProps = {
  guesses: GlobeGuess[];
  /** when set, the full warm/cold field around the answer is revealed */
  reveal: LatLon | null;
  /** the globe turns to face this point */
  focus: LatLon | null;
};

/**
 * Canvas 2D orthographic dot globe. Neutral until guessed: each guess lights its country's dots
 * warm or cold; solving reveals the full heat field around the answer. DPR capped, paused offscreen.
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
      const R = size * 0.44;
      const cx = size / 2;
      const cy = size / 2;

      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      g.addColorStop(0, "rgba(255,154,60,0.10)");
      g.addColorStop(1, "rgba(16,21,28,0.6)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,154,60,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const gv = gs.map((q) => ({ v: toVec(q.lat, q.lon), rgb: heatRGB(q.t) }));
      const rvv = rv ? toVec(rv.lat, rv.lon) : null;
      const cr = Math.cos(s.rot);
      const sr = Math.sin(s.rot);
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      const unit = size / 320;
      const cosSpot = Math.cos(SPOT);

      for (let i = 0; i < N; i++) {
        const x = pts[i * 3];
        const y = pts[i * 3 + 1];
        const z = pts[i * 3 + 2];
        const x1 = x * cr + z * sr;
        const z1 = -x * sr + z * cr;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        if (z2 < -0.05) continue;
        const depth = Math.max(0, z2);

        let rgb = "138,151,166";
        let alpha = 0.12 + 0.5 * depth;
        let boost = 1;
        if (rvv && s.revealAmt > 0) {
          const d = Math.acos(Math.max(-1, Math.min(1, x * rvv[0] + y * rvv[1] + z * rvv[2]))) / Math.PI;
          rgb = heatRGB(d);
          alpha = (0.12 + 0.5 * depth) * (1 - s.revealAmt) + (0.18 + 0.82 * depth) * s.revealAmt;
          if (d < 0.08) boost = 1 + 0.5 * s.revealAmt;
        }
        for (const q of gv) {
          if (x * q.v[0] + y * q.v[1] + z * q.v[2] > cosSpot) {
            rgb = q.rgb;
            alpha = 0.35 + 0.65 * depth;
            boost = 1.6;
          }
        }
        ctx.fillStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(cx + x1 * R, cy - y2 * R, (0.7 + 1.2 * depth) * unit * boost, 0, Math.PI * 2);
        ctx.fill();
      }

      // ping on the most recent guess
      const last = gs[gs.length - 1];
      if (last) {
        const [tx, ty, tz] = toVec(last.lat, last.lon);
        const tx1 = tx * cr + tz * sr;
        const tz1 = -tx * sr + tz * cr;
        const ty2 = ty * ct - tz1 * st;
        const tz2 = ty * st + tz1 * ct;
        if (tz2 > 0.1) {
          const p = reduce ? 0.4 : (t % 1600) / 1600;
          ctx.strokeStyle = `rgba(${heatRGB(last.t)},${(0.8 * (1 - p)).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx + tx1 * R, cy - ty2 * R, (6 + p * 16) * unit, 0, Math.PI * 2);
          ctx.stroke();
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
    <div ref={wrap} aria-hidden data-cursor-box="" className="relative mx-auto aspect-square w-full max-w-[360px]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
