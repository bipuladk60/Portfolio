"use client";

import { useEffect, useRef } from "react";
import { createNoise3D } from "@/lib/noise";
import { prefersReducedMotion } from "@/lib/motion";

// Marching-squares segment table. Edges: 0 top, 1 right, 2 bottom, 3 left.
// Corner bits: tl=8, tr=4, br=2, bl=1. Saddles (5, 10) emit two segments.
const SEGMENTS: number[][] = [
  [], [3, 2], [2, 1], [3, 1], [0, 1], [0, 1, 3, 2], [0, 2], [0, 3],
  [0, 3], [0, 2], [0, 3, 1, 2], [0, 1], [3, 1], [1, 2], [3, 2], [],
];

const CELL = 24; // CSS px per marching-squares cell
const SCALE = 520; // CSS px per noise unit
const STEP = 0.13; // contour interval
const FRAME_MS = 1000 / 30;

/**
 * Slow procedural topographic contours behind everything. Very low contrast by design:
 * drawn in the --line / --line-hi tokens, drifting, with a soft rise that follows the cursor
 * so the contours bend around it. 30 fps cap, DPR capped at 1.5, paused while the tab is hidden,
 * a single static frame under reduced motion.
 */
export function Terrain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const noise = createNoise3D(8849);
    const reduce = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let field = new Float32Array(0);
    let raf = 0;
    let last = 0;
    let colors = { line: "#1f2b38", hi: "#2e4052" };

    const mouse = { x: -9999, y: -9999, has: false };
    const bump = { x: 0, y: 0, s: 0 };

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = {
        line: cs.getPropertyValue("--line").trim() || colors.line,
        hi: cs.getPropertyValue("--line-hi").trim() || colors.hi,
      };
    };

    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL) + 2;
      rows = Math.ceil(h / CELL) + 2;
      field = new Float32Array(cols * rows);
    };

    const sample = (t: number) => {
      const z = t * 0.000035;
      const driftX = t * 0.006;
      const driftY = (reduce ? 0 : window.scrollY * 0.12) + t * 0.0025;
      const sigma2 = 2 * 150 * 150;
      for (let j = 0; j < rows; j++) {
        const py = j * CELL;
        const ny = (py + driftY) / SCALE;
        for (let i = 0; i < cols; i++) {
          const px = i * CELL;
          const nx = (px + driftX) / SCALE;
          let v = 0.68 * noise(nx, ny, z) + 0.32 * noise(nx * 2.3 + 11.7, ny * 2.3 - 4.1, z * 1.6);
          if (bump.s > 0.001) {
            const dx = px - bump.x;
            const dy = py - bump.y;
            v += bump.s * 0.5 * Math.exp(-(dx * dx + dy * dy) / sigma2);
          }
          field[j * cols + i] = v;
        }
      }
    };

    const contour = (level: number) => {
      for (let j = 0; j < rows - 1; j++) {
        const y0 = j * CELL;
        for (let i = 0; i < cols - 1; i++) {
          const a = field[j * cols + i];
          const b = field[j * cols + i + 1];
          const c = field[(j + 1) * cols + i + 1];
          const d = field[(j + 1) * cols + i];
          const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          const seg = SEGMENTS[idx];
          const x0 = i * CELL;
          for (let s = 0; s < seg.length; s += 2) {
            for (let e = 0; e < 2; e++) {
              const edge = seg[s + e];
              let x = x0;
              let y = y0;
              if (edge === 0) x = x0 + ((level - a) / (b - a)) * CELL;
              else if (edge === 1) {
                x = x0 + CELL;
                y = y0 + ((level - b) / (c - b)) * CELL;
              } else if (edge === 2) {
                x = x0 + ((level - d) / (c - d)) * CELL;
                y = y0 + CELL;
              } else y = y0 + ((level - a) / (d - a)) * CELL;
              if (e === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          }
        }
      }
    };

    const draw = (t: number) => {
      if (mouse.has) {
        bump.x += (mouse.x - bump.x) * 0.08;
        bump.y += (mouse.y - bump.y) * 0.08;
        bump.s += (1 - bump.s) * 0.04;
      } else {
        bump.s *= 0.95;
      }
      sample(t);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      let n = 0;
      for (let level = -1.1; level <= 1.3; level += STEP, n++) {
        const index = n % 5 === 0;
        ctx.beginPath();
        contour(level);
        ctx.strokeStyle = index ? colors.hi : colors.line;
        ctx.globalAlpha = index ? 0.75 : 0.9;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (t - last < FRAME_MS) return;
      last = t;
      draw(t);
    };

    const start = () => {
      if (!raf && !reduce && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onResize = () => {
      resize();
      draw(reduce ? 0 : performance.now());
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!mouse.has) {
        bump.x = e.clientX;
        bump.y = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.has = true;
    };
    const onLeave = () => {
      mouse.has = false;
    };

    readColors();
    resize();
    draw(reduce ? 0 : performance.now());
    start();

    const themeObserver = new MutationObserver(() => {
      readColors();
      if (reduce) draw(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style"] });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{
        opacity: 0.85,
        maskImage: "radial-gradient(ellipse 120% 90% at 50% 45%, #000 40%, rgba(0,0,0,0.55) 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 120% 90% at 50% 45%, #000 40%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  );
}
