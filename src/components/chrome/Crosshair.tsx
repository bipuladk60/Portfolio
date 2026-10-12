"use client";

import { useEffect, useRef, useState } from "react";
import { playBlip } from "@/lib/sound";

const INTERACTIVE = 'a[href], button, [role="button"], [data-cursor], summary, select, label[for], input[type="checkbox"], input[type="radio"]';
const BOX = "[data-cursor-box]";
const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
const ENABLE_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

const pad4 = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");

/**
 * A thin reticle that tracks the pointer and locks its brackets onto interactive elements
 * and onto [data-cursor-box] panels/visuals (hugging the box in its --accent colour).
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
    let kind: "interactive" | "box" | null = null;
    let accent = "var(--signal)";
    let overText = false;
    let lastReadout = "";
    let lastColor = "";
    let raf = 0;

    /** Innermost interactive element wins; otherwise the innermost [data-cursor-box]. */
    const resolve = (el: Element | null) => {
      overText = !!el?.closest(TEXT_INPUT);
      let next: Element | null = null;
      let nextKind: typeof kind = null;
      if (el && !overText) {
        const inter = el.closest(INTERACTIVE);
        if (inter) {
          next = inter;
          nextKind = "interactive";
        } else {
          const b = el.closest(BOX);
          if (b) {
            next = b;
            nextKind = "box";
          }
        }
      }
      if (next === locked) return;
      locked = next;
      kind = nextKind;
      if (next && nextKind === "box") {
        const a = getComputedStyle(next).getPropertyValue("--accent").trim();
        accent = a || "var(--signal)";
      } else {
        accent = "var(--signal)";
      }
      if (nextKind === "interactive") playBlip("hover");
    };

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
      resolve(e.target instanceof Element ? e.target : null);
    };
    // Scrolling/resizing moves content under a still pointer: re-resolve once per frame.
    let recheckQueued = false;
    const recheck = () => {
      if (!visible || recheckQueued) return;
      recheckQueued = true;
      requestAnimationFrame(() => {
        recheckQueued = false;
        resolve(document.elementFromPoint(mouse.x, mouse.y));
      });
    };
    const onDown = () => {
      press = 1;
    };
    const onLeave = () => {
      visible = false;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let tx: number, ty: number, tw: number, th: number;
      let rw = 0;
      let rh = 0;
      if (locked && locked.isConnected) {
        const r = locked.getBoundingClientRect();
        rw = r.width;
        rh = r.height;
        const p = 6;
        // Clamp to the viewport so a box taller than the screen still shows its brackets.
        const x0 = Math.max(4, r.left - p);
        const y0 = Math.max(4, r.top - p);
        const x1 = Math.min(vw - 4, r.right + p);
        const y1 = Math.min(vh - 4, r.bottom + p);
        tx = x0;
        ty = y0;
        tw = Math.max(12, x1 - x0);
        th = Math.max(12, y1 - y0);
      } else {
        locked = null;
        kind = null;
        const s = 24 - press * 8;
        tx = mouse.x - s / 2;
        ty = mouse.y - s / 2;
        tw = s;
        th = s;
      }
      const k = kind === "box" ? 0.2 : kind ? 0.28 : 0.42;
      box.x += (tx - box.x) * k;
      box.y += (ty - box.y) * k;
      box.w += (tw - box.w) * k;
      box.h += (th - box.h) * k;
      press *= 0.82;

      const target = visible && !overText ? 1 : 0;
      shownOpacity += (target - shownOpacity) * 0.25;
      if (root.current) root.current.style.opacity = shownOpacity.toFixed(3);

      if (dot.current) {
        dot.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
        // Over links/buttons the native pointer shows, so the centre cross steps aside.
        dot.current.style.opacity = kind === "interactive" ? "0" : "1";
      }
      const color = kind ? accent : "var(--text-dim)";
      const colorChanged = color !== lastColor;
      lastColor = color;
      const c = corners.current;
      const s = kind === "box" ? 12 : kind ? 9 : 6;
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
        if (colorChanged) el.style.borderColor = color;
      }
      if (readout.current) {
        const label =
          kind === "box"
            ? `LOCK · ${Math.round(rw)}×${Math.round(rh)}`
            : kind
              ? `LOCK  X ${pad4(mouse.x)}  Y ${pad4(mouse.y)}`
              : `X ${pad4(mouse.x)}  Y ${pad4(mouse.y)}`;
        if (label !== lastReadout) {
          lastReadout = label;
          readout.current.textContent = label;
        }
        const rx = kind === "box" ? box.x + 2 : box.x + box.w + 8;
        // Box readout sits just outside the bottom-left corner, clear of Panel labels on the top edge.
        const ry = kind === "box" ? Math.min(window.innerHeight - 14, box.y + box.h + 4) : box.y + box.h + 4;
        readout.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
        if (colorChanged) readout.current.style.color = color;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", recheck, { passive: true });
    window.addEventListener("resize", recheck);
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("xc-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", recheck);
      window.removeEventListener("resize", recheck);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const corner = "absolute left-0 top-0 will-change-transform";
  const sides = ["border-l border-t", "border-r border-t", "border-b border-l", "border-b border-r"];

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" style={{ opacity: 0 }}>
      <style>{`html.xc-cursor, html.xc-cursor * { cursor: none !important; }
html.xc-cursor :is(${INTERACTIVE}), html.xc-cursor :is(${INTERACTIVE}) * { cursor: pointer !important; }
html.xc-cursor :is(${TEXT_INPUT}) { cursor: text !important; }`}</style>
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
