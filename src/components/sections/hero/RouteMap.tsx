"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ARC_PATH, ARC_POINTS, HBG, LAND_DOTS, MAP_H, MAP_W, NEPAL, OCEAN_GRID, project } from "./geo";

type BBox = [number, number, number, number];
type VB = { x: number; y: number; w: number; h: number };

const EASE = [0.2, 0.8, 0.2, 1] as const;
const NP_XY = project(NEPAL.lon, NEPAL.lat);
const MS_XY = project(HBG.lon, HBG.lat);
const LAST = ARC_POINTS.length - 1;
const FULL: VB = { x: 0, y: 0, w: MAP_W, h: MAP_H };
const MAX_ZOOM = 12;
const ASPECT = MAP_H / MAP_W;

function sample(p: number, axis: 0 | 1) {
  const f = Math.max(0, Math.min(1, p)) * LAST;
  const i = Math.floor(f);
  const j = Math.min(LAST, i + 1);
  return ARC_POINTS[i][axis] + (ARC_POINTS[j][axis] - ARC_POINTS[i][axis]) * (f - i);
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Keeps the view inside the map; if the width has to be clamped, re-centres on the requested centre. */
function clampVB(v: VB): VB {
  const w = clamp(v.w, MAP_W / MAX_ZOOM, MAP_W);
  const h = w * ASPECT;
  let { x, y } = v;
  if (w !== v.w) {
    x = v.x + v.w / 2 - w / 2;
    y = v.y + (v.w * ASPECT) / 2 - h / 2;
  }
  return { w, h, x: clamp(x, 0, MAP_W - w), y: clamp(y, 0, MAP_H - h) };
}

/** Fractions of the map box covered by controls: left column, top row, bottom row. */
type Insets = { l: number; t: number; b: number };

/** Frames a bbox centred in the part of the map not covered by controls. */
function fit([x0, y0, x1, y1]: BBox, pad: number, ins: Insets): VB {
  const usableW = Math.max(0.3, 1 - ins.l);
  const usableH = Math.max(0.3, 1 - ins.t - ins.b);
  const want = Math.max(((x1 - x0) * pad) / usableW, ((y1 - y0) * pad) / (usableH * ASPECT));
  const w = clamp(want, MAP_W / MAX_ZOOM, MAP_W);
  const h = w * ASPECT;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  // Usable area spans [x + l*w, x + w] and [y + t*h, y + (1 - b)*h]; put the bbox centre in its middle.
  const x = cx - (w * (1 + ins.l)) / 2;
  const y = cy - (h * (1 + ins.t - ins.b)) / 2;
  return { w, h, x: clamp(x, 0, MAP_W - w), y: clamp(y, 0, MAP_H - h) };
}

type RouteMapProps = {
  usaPath: string;
  nepalPath: string;
  usaBox: BBox;
  nepalBox: BBox;
};

const ctrl =
  "grid h-8 min-w-8 place-items-center md:h-6 md:min-w-6 border border-line-hi bg-bg/85 px-1.5 font-mono text-[10px] leading-none tracking-[0.12em] text-text transition-colors hover:border-signal hover:text-signal focus-visible:border-signal";

/**
 * Dotted world map with real USA and Nepal outlines and the great-circle route between them.
 * Zoom and pan are live only while the map is active (pointer over it, or keyboard focus inside):
 * wheel / ctrl+wheel zoom around the pointer, drag pans, double-click zooms in, pinch on touch.
 * The viewBox is animated imperatively through refs, so interaction never re-renders React.
 */
export function RouteMap({ usaPath, nepalPath, usaBox, nepalBox }: RouteMapProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const npRef = useRef<HTMLDivElement>(null);
  const msRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const zoomCtrlRef = useRef<HTMLDivElement>(null);
  const flyCtrlRef = useRef<HTMLDivElement>(null);

  /** Measures how much of the map the control clusters cover, so quick-fly targets centre in the clear area. */
  const insets = (): Insets => {
    const box = boxRef.current?.getBoundingClientRect();
    const z = zoomCtrlRef.current?.getBoundingClientRect();
    const f = flyCtrlRef.current?.getBoundingClientRect();
    if (!box || !box.width || !box.height) return { l: 0, t: 0, b: 0 };
    const column = z ? z.height > z.width : false;
    return {
      l: z && column ? (z.right - box.left + 4) / box.width : 0,
      t: z && !column ? (z.bottom - box.top + 4) / box.height : 0,
      b: f ? (box.bottom - f.top + 4) / box.height : 0,
    };
  };

  const cur = useRef<VB>({ ...FULL });
  const tgt = useRef<VB>({ ...FULL });
  const raf = useRef(0);
  const hover = useRef(false);
  const focused = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; mid: { x: number; y: number } } | null>(null);

  const [active, setActive] = useState(false);
  const inView = useInView(boxRef, { margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion() ?? false;
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  // Probe dot travelling along the route
  const progress = useMotionValue(0);
  const cx = useTransform(progress, (p) => sample(p, 0));
  const cy = useTransform(progress, (p) => sample(p, 1));
  const trailOpacity = useTransform(progress, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(progress, [0, 1], { duration: 5.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2, delay: 2.4 });
    return () => controls.stop();
  }, [reduce, inView, progress]);

  /** Writes a viewBox to the DOM and keeps strokes, dots and HTML overlays at a constant screen size. */
  const apply = useCallback((vb: VB) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute("viewBox", `${vb.x.toFixed(3)} ${vb.y.toFixed(3)} ${vb.w.toFixed(3)} ${vb.h.toFixed(3)}`);
    const k = vb.w / MAP_W;
    svg.querySelectorAll<SVGElement>("[data-sw]").forEach((el) => {
      const base = Number(el.dataset.sw);
      el.setAttribute("stroke-width", String(el.dataset.mode === "dot" ? base * Math.sqrt(k) : base * k));
      if (el.dataset.dash) el.setAttribute("stroke-dasharray", el.dataset.dash.split(" ").map((d) => Number(d) * k).join(" "));
    });
    svg.querySelectorAll<SVGElement>("[data-r]").forEach((el) => el.setAttribute("r", String(Number(el.dataset.r) * k)));
    const place = (el: HTMLElement | null, [x, y]: [number, number]) => {
      if (!el) return;
      el.style.left = `${((x - vb.x) / vb.w) * 100}%`;
      el.style.top = `${((y - vb.y) / vb.h) * 100}%`;
    };
    place(npRef.current, NP_XY);
    place(msRef.current, MS_XY);
    const zoom = MAP_W / vb.w;
    if (radarRef.current) radarRef.current.style.opacity = zoom > 2.5 ? "0.25" : "1";
    if (readoutRef.current) readoutRef.current.textContent = `ZOOM ${zoom.toFixed(1)}×`;
    // At 1x let vertical swipes scroll the page; once zoomed, touch drags pan the map.
    if (boxRef.current) boxRef.current.style.touchAction = zoom > 1.01 ? "none" : "pan-y";
  }, []);

  const step = useCallback(() => {
    const c = cur.current;
    const t = tgt.current;
    const f = 0.2;
    const next = { x: c.x + (t.x - c.x) * f, y: c.y + (t.y - c.y) * f, w: c.w + (t.w - c.w) * f, h: c.h + (t.h - c.h) * f };
    const done = Math.abs(next.w - t.w) < 0.01 && Math.abs(next.x - t.x) < 0.01 && Math.abs(next.y - t.y) < 0.01;
    cur.current = done ? { ...t } : next;
    apply(cur.current);
    raf.current = done ? 0 : requestAnimationFrame(step);
  }, [apply]);

  const setTarget = useCallback(
    (v: VB, instant = false) => {
      tgt.current = clampVB(v);
      if (instant || reduceRef.current) {
        cancelAnimationFrame(raf.current);
        raf.current = 0;
        cur.current = { ...tgt.current };
        apply(cur.current);
        return;
      }
      if (!raf.current) raf.current = requestAnimationFrame(step);
    },
    [apply, step],
  );

  /** Zoom by `factor` keeping the map point (ux, uy) fixed on screen. */
  const zoomAt = useCallback(
    (factor: number, ux?: number, uy?: number, instant = false) => {
      const t = tgt.current;
      const px = ux ?? t.x + t.w / 2;
      const py = uy ?? t.y + t.h / 2;
      const w = clamp(t.w / factor, MAP_W / MAX_ZOOM, MAP_W);
      const s = w / t.w;
      setTarget({ x: px - (px - t.x) * s, y: py - (py - t.y) * s, w, h: w * ASPECT }, instant);
    },
    [setTarget],
  );

  const toUser = useCallback((clientX: number, clientY: number) => {
    const rect = boxRef.current!.getBoundingClientRect();
    const c = cur.current;
    return { x: c.x + ((clientX - rect.left) / rect.width) * c.w, y: c.y + ((clientY - rect.top) / rect.height) * c.h };
  }, []);

  const panBy = useCallback(
    (dxPx: number, dyPx: number) => {
      const rect = boxRef.current!.getBoundingClientRect();
      const c = cur.current;
      const next = { ...c, x: c.x - (dxPx / rect.width) * c.w, y: c.y - (dyPx / rect.height) * c.h };
      tgt.current = clampVB(next);
      setTarget(tgt.current, true);
    },
    [setTarget],
  );

  const refreshActive = () => setActive(hover.current || focused.current);

  // Wheel needs a non-passive native listener so preventDefault works, and only while active.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(hover.current || focused.current)) return;
      e.preventDefault();
      const speed = e.ctrlKey ? 0.012 : 0.0018;
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const p = toUser(e.clientX, e.clientY);
      zoomAt(Math.exp(-delta * speed), p.x, p.y, e.ctrlKey);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [toUser, zoomAt]);

  useEffect(() => {
    apply(cur.current);
    return () => cancelAnimationFrame(raf.current);
  }, [apply]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pinch.current = null;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const pts = pointers.current;
    if (pts.size === 1) {
      // A one-finger drag at 1x is left to the page (touch-action: pan-y).
      if (e.pointerType === "touch" && MAP_W / cur.current.w <= 1.01) {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        return;
      }
      panBy(e.clientX - prev.x, e.clientY - prev.y);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      return;
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const [a, b] = [...pts.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    if (pinch.current) {
      panBy(mid.x - pinch.current.mid.x, mid.y - pinch.current.mid.y);
      const p = toUser(mid.x, mid.y);
      zoomAt(dist / Math.max(1, pinch.current.dist), p.x, p.y, true);
    }
    pinch.current = { dist, mid };
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const panStep = 0.12;
    const c = tgt.current;
    switch (e.key) {
      case "+":
      case "=":
        zoomAt(1.6);
        break;
      case "-":
      case "_":
        zoomAt(1 / 1.6);
        break;
      case "0":
        setTarget(FULL);
        break;
      case "ArrowLeft":
        setTarget({ ...c, x: c.x - c.w * panStep });
        break;
      case "ArrowRight":
        setTarget({ ...c, x: c.x + c.w * panStep });
        break;
      case "ArrowUp":
        setTarget({ ...c, y: c.y - c.h * panStep });
        break;
      case "ArrowDown":
        setTarget({ ...c, y: c.y + c.h * panStep });
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <div
      ref={boxRef}
      data-cursor-box="lock"
      tabIndex={0}
      role="application"
      aria-roledescription="zoomable map"
      aria-label="Route map, zoomable. Plus and minus keys zoom, arrow keys pan, 0 resets."
      className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden outline-none active:cursor-grabbing"
      style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          hover.current = true;
          refreshActive();
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          hover.current = false;
          refreshActive();
        }
      }}
      onFocus={() => {
        focused.current = true;
        refreshActive();
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          focused.current = false;
          refreshActive();
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        const p = toUser(e.clientX, e.clientY);
        zoomAt(2, p.x, p.y);
      }}
      onKeyDown={onKeyDown}
    >
      <svg ref={svgRef} aria-hidden viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <linearGradient id="hero-arc" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--sky)" />
            <stop offset="0.5" stopColor="var(--text)" />
            <stop offset="1" stopColor="var(--signal)" />
          </linearGradient>
        </defs>

        {[0, 23.44, -23.44].map((lat) => {
          const y = project(0, lat)[1];
          return (
            <line
              key={lat}
              x1={0}
              x2={MAP_W}
              y1={y}
              y2={y}
              stroke="var(--line-hi)"
              strokeWidth={0.6}
              data-sw={0.6}
              strokeDasharray={lat === 0 ? undefined : "2 4"}
              data-dash={lat === 0 ? undefined : "2 4"}
              opacity={lat === 0 ? 0.7 : 0.45}
            />
          );
        })}

        <motion.path
          d={OCEAN_GRID}
          stroke="var(--line)"
          strokeWidth={1.1}
          data-sw={1.1}
          data-mode="dot"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.5 }}
        />
        <motion.path
          d={LAND_DOTS}
          stroke="color-mix(in oklab, var(--text-dim) 55%, transparent)"
          strokeWidth={2.4}
          data-sw={2.4}
          data-mode="dot"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 0.6, ease: EASE }}
        />

        {/* Real country outlines, Natural Earth 1:50m */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.8 }}
          strokeLinejoin="round"
        >
          <path
            d={usaPath}
            fill="color-mix(in oklab, var(--sky) 16%, transparent)"
            stroke="var(--sky)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={nepalPath}
            fill="color-mix(in oklab, var(--signal) 24%, transparent)"
            stroke="var(--signal)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </motion.g>

        <path d={ARC_PATH} stroke="var(--line-hi)" strokeWidth={1} data-sw={1} strokeDasharray="3 5" data-dash="3 5" />
        <motion.path
          d={ARC_PATH}
          stroke="url(#hero-arc)"
          strokeWidth={1.8}
          data-sw={1.8}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 1.6, delay: reduce ? 0 : 1.1, ease: EASE }}
        />

        {!reduce && (
          <motion.g style={{ opacity: trailOpacity }}>
            <motion.circle cx={cx} cy={cy} data-r={7} fill="var(--signal)" opacity={0.18} />
            <motion.circle cx={cx} cy={cy} data-r={2.6} fill="#fffaf0" />
          </motion.g>
        )}
      </svg>

      {/* Endpoint anchors: HTML so markers and labels keep their size at every zoom level */}
      <div ref={npRef} aria-hidden className="pointer-events-none absolute h-0 w-0" style={{ left: `${(NP_XY[0] / MAP_W) * 100}%`, top: `${(NP_XY[1] / MAP_H) * 100}%` }}>
        <div
          ref={radarRef}
          className="absolute h-[clamp(48px,12vw,84px)] w-[clamp(48px,12vw,84px)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
        >
          <motion.div
            className="absolute inset-0 rounded-full border border-signal/30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.9, ease: EASE }}
          >
            <div className="absolute inset-[25%] rounded-full border border-signal/20" />
            <div
              className={`absolute inset-0 rounded-full ${reduce ? "" : "animate-spin"}`}
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, transparent 290deg, color-mix(in oklab, var(--signal) 10%, transparent) 330deg, color-mix(in oklab, var(--signal) 40%, transparent) 360deg)",
                animationDuration: "5s",
                animationTimingFunction: "linear",
                animationPlayState: inView ? "running" : "paused",
              }}
            />
          </motion.div>
        </div>
        <Marker color="bg-signal" ping={!reduce} />
        <span className="absolute left-0 top-2.5 -translate-x-1/2 whitespace-nowrap bg-bg/80 px-1 font-mono text-[10px] leading-none tracking-widest text-signal sm:text-[11px]">
          NEPAL
        </span>
      </div>
      <div ref={msRef} aria-hidden className="pointer-events-none absolute h-0 w-0" style={{ left: `${(MS_XY[0] / MAP_W) * 100}%`, top: `${(MS_XY[1] / MAP_H) * 100}%` }}>
        <Marker color="bg-sky" ping={!reduce} />
        <span className="absolute left-0 top-2.5 -translate-x-1/2 whitespace-nowrap bg-bg/80 px-1 font-mono text-[10px] leading-none tracking-widest text-sky sm:text-[11px]">
          MS
        </span>
      </div>

      {/* Live border: lights up while the map is accepting zoom and pan */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 border transition-[border-color,box-shadow] duration-300"
        style={{
          borderColor: active ? "var(--signal)" : "var(--line)",
          boxShadow: active ? "inset 0 0 0 1px color-mix(in oklab, var(--signal) 35%, transparent), 0 0 18px -6px var(--signal)" : "none",
        }}
      />

      {/* Controls */}
      <div ref={zoomCtrlRef} className="absolute left-1.5 top-1.5 flex gap-1 md:flex-col" onPointerDown={stop} onDoubleClick={stop}>
        <button type="button" className={ctrl} aria-label="Zoom in" onClick={() => zoomAt(1.6)}>
          +
        </button>
        <button type="button" className={ctrl} aria-label="Zoom out" onClick={() => zoomAt(1 / 1.6)}>
          −
        </button>
        <button type="button" className={ctrl} aria-label="Reset zoom" onClick={() => setTarget(FULL)}>
          <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 4V1h3M9 6v3H6M1 1l3 3M9 9L6 6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
      <div ref={flyCtrlRef} className="absolute bottom-1.5 left-1.5 flex gap-1" onPointerDown={stop} onDoubleClick={stop}>
        <button type="button" className={ctrl} aria-label="Fly to Nepal" onClick={() => setTarget(fit(nepalBox, 1.5, insets()))}>
          NEPAL
        </button>
        <button type="button" className={ctrl} aria-label="Fly to the USA" onClick={() => setTarget(fit(usaBox, 1.15, insets()))}>
          USA
        </button>
      </div>
      <span
        ref={readoutRef}
        aria-hidden
        className={`pointer-events-none absolute bottom-2 right-2 font-mono text-[10px] tracking-[0.14em] text-signal transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
      >
        ZOOM 1.0×
      </span>
    </div>
  );
}

function Marker({ color, ping }: { color: string; ping: boolean }) {
  return (
    <span className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2">
      {ping && <span className={`absolute inset-0 animate-ping rounded-full ${color} opacity-60`} />}
      <span className={`absolute inset-0 rounded-full ${color} ring-2 ring-bg`} />
    </span>
  );
}
