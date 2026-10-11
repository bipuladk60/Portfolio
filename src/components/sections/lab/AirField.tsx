"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient "air sample" particles drifting slowly upward. Canvas 2D, DPR capped at 1.5,
 * paused when offscreen or the tab is hidden, and not started at all under reduced motion.
 */
export function AirField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; ph: number };
    let parts: P[] = [];

    const seed = () => {
      const count = Math.round(Math.min(70, (w * h) / 16000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.06 + Math.random() * 0.18),
        a: 0.12 + Math.random() * 0.3,
        ph: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const color = getComputedStyle(document.documentElement).getPropertyValue("--water").trim() || "#34c98a";

    let raf = 0;
    let visible = false;
    let last = 0;
    const frame = (t: number) => {
      const dt = last ? Math.min(48, t - last) / 16.67 : 1;
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const p of parts) {
        p.ph += 0.01 * dt;
        p.x += (p.vx + Math.sin(p.ph) * 0.06) * dt;
        p.y += p.vy * dt;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.ph * 1.7));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} />;
}
