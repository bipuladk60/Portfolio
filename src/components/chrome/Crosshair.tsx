"use client";

import { useEffect, useRef, useState } from "react";
import { INK } from "@/components/toon/toon";
import { hudMode } from "@/lib/hud-mode";
import { playBlip } from "@/lib/sound";

const INTERACTIVE = 'a[href], button, [role="button"], [data-cursor], summary, select, label[for], input[type="checkbox"], input[type="radio"]';
/** Only explicit, top-level visuals opt in to the box lock. Bare `data-cursor-box=""` is ignored. */
const LOCK = '[data-cursor-box="lock"]';
const TEXT_INPUT = 'input:not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
const ENABLE_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

type Kind = "interactive" | "box" | null;

/** Per-state look: corner tick length, padding around the target, tick opacity, centre-dot opacity. */
const LOOK = {
  free: { tick: 5, pad: 0, size: 20, ticks: 0.4, dot: 0.85 },
  interactive: { tick: 6, pad: 4, size: 0, ticks: 0.55, dot: 0 },
  box: { tick: 10, pad: 8, size: 0, ticks: 0.5, dot: 0.85 },
} as const;

/** Time constants (ms) for the exponential ease: ~3τ to settle, so the lock glides in over ~250 ms. */
const TAU_FREE = 30;
const TAU_LOCK = 80;

/** Outermost opted-in ancestor, so nested visuals never steal the lock from their container. */
function outermostLock(el: Element): Element | null {
  let found: Element | null = null;
  let cur: Element | null = el.closest(LOCK);
  while (cur) {
    found = cur;
    cur = cur.parentElement?.closest(LOCK) ?? null;
  }
  return found;
}

/**
 * A quiet reticle: a small dot with faint corner ticks that follow the pointer. Over links and
 * buttons the ticks lightly hug the element; over an explicit top-level visual
 * (`data-cursor-box="lock"`) they glide out to thin L marks on its corners. No readouts, no glow.
 * Desktop with a fine pointer only; off for touch and reduced motion. Positions are written as
 * transforms inside one rAF loop, so mouse movement never re-renders React.
 */
export function Crosshair() {
  const [enabled, setEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const ticks = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
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
    const box = { x: -120, y: -120, w: 20, h: 20, t: 5 };
    let visible = false;
    let shown = 0;
    let tickAlpha = 0;
    let dotAlpha = 0;
    let press = 0;
    let locked: Element | null = null;
    let kind: Kind = null;
    let accent = "";
    let overText = false;
    let lastColor = "";
    let lastTick = -1;
    let toon = hudMode.get() === "toon";

    /** HUD hairlines vs. Warmer ink (slightly thicker strokes, rounded outer corners). */
    const RADII = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius"] as const;
    const applySkin = () => {
      const w = toon ? "1.5px" : "1px";
      corners.current.forEach((el, i) => {
        if (!el) return;
        el.style.borderWidth = "0";
        if (i === 0 || i === 2) el.style.borderLeftWidth = w;
        else el.style.borderRightWidth = w;
        if (i < 2) el.style.borderTopWidth = w;
        else el.style.borderBottomWidth = w;
        el.style.borderStyle = "solid";
        RADII.forEach((r) => (el.style[r] = "0"));
        el.style[RADII[i]] = toon ? "3px" : "0";
      });
      dot.current?.style.setProperty("--xc-dot", toon ? INK : "var(--signal)");
      lastColor = "";
    };
    const readAccent = (el: Element) => getComputedStyle(el).getPropertyValue("--accent").trim();
    const unsubMode = hudMode.subscribe(() => {
      toon = hudMode.get() === "toon";
      if (locked && kind === "box") accent = readAccent(locked);
      applySkin();
    });
    applySkin();

    /** Innermost interactive element wins; otherwise the outermost opted-in visual. */
    const resolve = (el: Element | null) => {
      overText = !!el?.closest(TEXT_INPUT);
      let next: Element | null = null;
      let nextKind: Kind = null;
      if (el && !overText) {
        const inter = el.closest(INTERACTIVE);
        if (inter) {
          next = inter;
          nextKind = "interactive";
        } else {
          const b = outermostLock(el);
          if (b) {
            next = b;
            nextKind = "box";
          }
        }
      }
      if (next === locked) return;
      locked = next;
      kind = nextKind;
      accent = next && nextKind === "box" ? readAccent(next) : "";
      if (nextKind === "interactive") playBlip("hover");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        box.x = mouse.x - 10;
        box.y = mouse.y - 10;
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

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let tx: number, ty: number, tw: number, th: number;
      if (locked && !locked.isConnected) {
        locked = null;
        kind = null;
      }
      const look = kind ? LOOK[kind] : LOOK.free;
      if (locked) {
        const r = locked.getBoundingClientRect();
        const p = look.pad;
        // Clamp to the viewport so a box taller than the screen still shows its corners.
        const x0 = Math.max(6, r.left - p);
        const y0 = Math.max(6, r.top - p);
        const x1 = Math.min(vw - 6, r.right + p);
        const y1 = Math.min(vh - 6, r.bottom + p);
        tx = x0;
        ty = y0;
        tw = Math.max(12, x1 - x0);
        th = Math.max(12, y1 - y0);
      } else {
        const s = look.size - press * 6;
        tx = mouse.x - s / 2;
        ty = mouse.y - s / 2;
        tw = s;
        th = s;
      }
      const k = 1 - Math.exp(-dt / (kind ? TAU_LOCK : TAU_FREE));
      const kFade = 1 - Math.exp(-dt / 90);
      box.x += (tx - box.x) * k;
      box.y += (ty - box.y) * k;
      box.w += (tw - box.w) * k;
      box.h += (th - box.h) * k;
      box.t += (look.tick - box.t) * k;
      press *= Math.exp(-dt / 90);

      const target = visible && !overText ? 1 : 0;
      shown += (target - shown) * kFade;
      tickAlpha += (look.ticks - tickAlpha) * kFade;
      dotAlpha += (look.dot - dotAlpha) * kFade;
      if (root.current) root.current.style.opacity = shown.toFixed(3);
      if (ticks.current) ticks.current.style.opacity = tickAlpha.toFixed(3);

      if (dot.current) {
        dot.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
        // Over links/buttons the native pointer shows, so the dot steps aside.
        dot.current.style.opacity = dotAlpha.toFixed(3);
      }
      const color = toon ? INK : kind === "box" ? accent || "var(--text)" : kind ? "var(--text)" : "var(--text-dim)";
      const colorChanged = color !== lastColor;
      lastColor = color;
      const s = Math.round(box.t * 2) / 2;
      const sizeChanged = s !== lastTick;
      lastTick = s;
      const pos: [number, number][] = [
        [box.x, box.y],
        [box.x + box.w - s, box.y],
        [box.x, box.y + box.h - s],
        [box.x + box.w - s, box.y + box.h - s],
      ];
      const c = corners.current;
      for (let i = 0; i < 4; i++) {
        const el = c[i];
        if (!el) continue;
        el.style.transform = `translate3d(${pos[i][0]}px, ${pos[i][1]}px, 0)`;
        if (sizeChanged) el.style.width = el.style.height = `${s}px`;
        if (colorChanged) el.style.borderColor = color;
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
      unsubMode();
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

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" style={{ opacity: 0 }}>
      <style>{`html.xc-cursor, html.xc-cursor * { cursor: none !important; }
html.xc-cursor :is(${INTERACTIVE}), html.xc-cursor :is(${INTERACTIVE}) * { cursor: pointer !important; }
html.xc-cursor :is(${TEXT_INPUT}) { cursor: text !important; }`}</style>
      <div ref={ticks} className="absolute inset-0" style={{ opacity: 0 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            ref={(el) => {
              corners.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            data-corner={i}
            style={{ width: 5, height: 5, borderColor: "var(--text-dim)" }}
          />
        ))}
      </div>
      <div ref={dot} className="absolute left-0 top-0 will-change-transform" style={{ opacity: 0 }}>
        <span className="absolute -left-[2px] -top-[2px] h-1 w-1 rounded-full bg-[var(--xc-dot,var(--signal))]" />
      </div>
    </div>
  );
}
