"use client";

import { useEffect, useRef, useState } from "react";
import { playBlip } from "@/lib/sound";

const INTERACTIVE = 'a[href], button, [role="button"], [data-cursor], summary, select, label[for], input[type="checkbox"], input[type="radio"]';
const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
const ENABLE_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

const pad4 = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");

/**
 * A thin reticle that tracks the pointer and locks its brackets onto interactive elements.
 * Desktop with a fine pointer only; off for touch and reduced motion. Positions are written
 * as transforms inside one rAF loop, so mouse movement never re-renders React.
 */
export function Crosshair() {
  const [enabled, setEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const corners = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia(ENABLE_QUERY);
    const rm = window.matchMedia(REDUCE_QUERY);
    const update = () => setEnabled(mq.matches && !rm.matches);
    update();
    mq.addEventListener("change", update);
    rm.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      rm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add("xc-cursor");

    const mouse = { x: -100, y: -100 };
    const box = { x: -120, y: -120, w: 24, h: 24 };
    let visible = false;
    let shownOpacity = 0;
    let press = 0;
    let locked: Element | null = null;
    let overText = false;
    let lastReadout = "";
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        box.x = mouse.x - 12;
        box.y = mouse.y - 12;
      }
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || !(t instanceof Element)) return;
      overText = !!t.closest(TEXT_INPUT);
      const hit = overText ? null : t.closest(INTERACTIVE);
      if (hit !== locked) {
        locked = hit;
        if (hit) playBlip("hover");
      }
    };
    const recheck = () => {
      if (!visible) return;
      const el = document.elementFromPoint(mouse.x, mouse.y);
      overText = !!el?.closest(TEXT_INPUT);
      locked = el && !overText ? el.closest(INTERACTIVE) : null;
    };
    const onDown = () => {
      press = 1;
    };
    const onLeave = () => {
      visible = false;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      let tx: number, ty: number, tw: number, th: number;
      if (locked && locked.isConnected) {
        const r = locked.getBoundingClientRect();
        const p = 6;
        tx = r.left - p;
        ty = r.top - p;
        tw = r.width + p * 2;
        th = r.height + p * 2;
      } else {
        locked = null;
        const s = 24 - press * 8;
        tx = mouse.x - s / 2;
        ty = mouse.y - s / 2;
        tw = s;
        th = s;
      }
      const k = locked ? 0.28 : 0.42;
      box.x += (tx - box.x) * k;
      box.y += (ty - box.y) * k;
      box.w += (tw - box.w) * k;
      box.h += (th - box.h) * k;
      press *= 0.82;

      const target = visible && !overText ? 1 : 0;
      shownOpacity += (target - shownOpacity) * 0.25;
      if (root.current) root.current.style.opacity = shownOpacity.toFixed(3);

      if (dot.current) dot.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      const c = corners.current;
      const s = locked ? 9 : 6;
      const pos: [number, number][] = [
        [box.x, box.y],
        [box.x + box.w - s, box.y],
        [box.x, box.y + box.h - s],
        [box.x + box.w - s, box.y + box.h - s],
      ];
      for (let i = 0; i < 4; i++) {
        const el = c[i];
        if (!el) continue;
        el.style.transform = `translate3d(${pos[i][0]}px, ${pos[i][1]}px, 0)`;
        el.style.width = el.style.height = `${s}px`;
        el.style.borderColor = locked ? "var(--signal)" : "var(--text-dim)";
      }
      if (readout.current) {
        const label = locked ? `LOCK  X ${pad4(mouse.x)}  Y ${pad4(mouse.y)}` : `X ${pad4(mouse.x)}  Y ${pad4(mouse.y)}`;
        if (label !== lastReadout) {
          lastReadout = label;
          readout.current.textContent = label;
        }
        readout.current.style.transform = `translate3d(${box.x + box.w + 8}px, ${box.y + box.h + 4}px, 0)`;
        readout.current.style.color = locked ? "var(--signal)" : "var(--text-dim)";
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", recheck, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("xc-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", recheck);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const corner = "absolute left-0 top-0 will-change-transform";
  const sides = ["border-l border-t", "border-r border-t", "border-b border-l", "border-b border-r"];

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" style={{ opacity: 0 }}>
      <style>{`html.xc-cursor, html.xc-cursor * { cursor: none !important; }
html.xc-cursor input:not([type="checkbox"]):not([type="radio"]), html.xc-cursor textarea, html.xc-cursor [contenteditable="true"] { cursor: text !important; }`}</style>
      {sides.map((cls, i) => (
        <span
          key={cls}
          ref={(el) => {
            corners.current[i] = el;
          }}
          className={`${corner} ${cls}`}
          style={{ width: 6, height: 6, borderColor: "var(--text-dim)" }}
        />
      ))}
      <div ref={dot} className="absolute left-0 top-0 will-change-transform">
        <span className="absolute -left-[7px] top-0 h-px w-[5px] bg-signal" />
        <span className="absolute left-[2px] top-0 h-px w-[5px] bg-signal" />
        <span className="absolute -top-[7px] left-0 h-[5px] w-px bg-signal" />
        <span className="absolute left-0 top-[2px] h-[5px] w-px bg-signal" />
      </div>
      <div
        ref={readout}
        className="absolute left-0 top-0 whitespace-nowrap font-mono text-[9px] tracking-[0.12em] will-change-transform"
      />
    </div>
  );
}
