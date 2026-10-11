"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

const N = 720;
// distance (0 = on target, 1 = antipode) -> colour, hot to cold
const STOPS: [number, [number, number, number]][] = [
  [0, [255, 92, 92]],
  [0.09, [255, 154, 60]],
  [0.22, [242, 180, 24]],
  [0.45, [138, 151, 166]],
  [1, [76, 141, 255]],
];

function heatRGB(t: number): string {
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

// Illustrative hidden targets (lat, lon). The game picks a country; here the globe just hunts a point.
const TARGETS: [number, number][] = [
  [28, 84],
  [-12, -55],
  [47, 8],
  [-25, 134],
  [39, -98],
  [6, 22],
];

function toVec(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

const TILT = -0.4;

export function WarmerGlobe() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrap, { margin: "120px" });
  const reduce = useReducedMotion();
  const state = useRef({ rot: -1.2, ti: 0, blend: 1, since: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = wrap.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fibonacci dot sphere
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
    const heatFor = (out: Float32Array, lat: number, lon: number) => {
      const [tx, ty, tz] = toVec(lat, lon);
      for (let i = 0; i < N; i++) {
        const d = pts[i * 3] * tx + pts[i * 3 + 1] * ty + pts[i * 3 + 2] * tz;
        out[i] = Math.acos(Math.max(-1, Math.min(1, d))) / Math.PI;
      }
    };
    const s = state.current;
    const heatA = new Float32Array(N);
    const heatB = new Float32Array(N);
    heatFor(heatA, ...TARGETS[s.ti]);
    heatFor(heatB, ...TARGETS[s.ti]);

    let size = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      size = el.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    };

    const draw = (t: number) => {
      if (!size) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const R = size * 0.43;
      const cx = size / 2;
      const cy = size / 2;

      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      g.addColorStop(0, "rgba(255,154,60,0.10)");
      g.addColorStop(1, "rgba(16,21,28,0.55)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,154,60,0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const cr = Math.cos(s.rot);
      const sr = Math.sin(s.rot);
      const ct = Math.cos(TILT);
      const st = Math.sin(TILT);
      const unit = size / 320;
      for (let i = 0; i < N; i++) {
        const x = pts[i * 3];
        const y = pts[i * 3 + 1];
        const z = pts[i * 3 + 2];
        const x1 = x * cr + z * sr;
        const z1 = -x * sr + z * cr;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        if (z2 < -0.05) continue;
        const h = heatA[i] * (1 - s.blend) + heatB[i] * s.blend;
        const depth = Math.max(0, z2);
        const alpha = 0.16 + 0.84 * depth;
        const rad = (0.7 + 1.3 * depth) * unit * (h < 0.1 ? 1.45 : 1);
        ctx.fillStyle = `rgba(${heatRGB(h)},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(cx + x1 * R, cy - y2 * R, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // pulse ring on the hidden target when it faces us
      const [tx, ty, tz] = toVec(...TARGETS[s.ti]);
      const tx1 = tx * cr + tz * sr;
      const tz1 = -tx * sr + tz * cr;
      const ty2 = ty * ct - tz1 * st;
      const tz2 = ty * st + tz1 * ct;
      if (tz2 > 0.1) {
        const p = (t % 1600) / 1600;
        ctx.strokeStyle = `rgba(255,92,92,${(0.7 * (1 - p) * s.blend).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx + tx1 * R, cy - ty2 * R, (4 + p * 16) * unit, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    resize();
    let running = false;
    let raf = 0;
    let last = 0;

    const loop = (t: number) => {
      const dt = last ? Math.min(50, t - last) : 16;
      last = t;
      s.rot += dt * 0.00024;
      s.blend = Math.min(1, s.blend + dt / 1100);
      s.since += dt;
      if (s.since > 5600) {
        s.since = 0;
        for (let i = 0; i < N; i++) heatA[i] = heatA[i] * (1 - s.blend) + heatB[i] * s.blend;
        s.ti = (s.ti + 1) % TARGETS.length;
        heatFor(heatB, ...TARGETS[s.ti]);
        s.blend = 0;
      }
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
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduce]);

  return (
    <div ref={wrap} aria-hidden className="relative mx-auto aspect-square w-full max-w-[340px]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
