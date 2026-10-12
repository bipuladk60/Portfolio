"use client";

import { useEffect, useRef, useState } from "react";
import { camps } from "@/data/camps";
import { activeCamp } from "@/lib/chrome-ui";
import { prefersReducedMotion } from "@/lib/motion";
import { scrollToCamp } from "@/lib/scroll";

const LAST = camps.length - 1;
const fmt = (m: number) => Math.round(m).toLocaleString("en-US");

type Anchor = { idx: number; at: number };

/**
 * Scroll position is altitude. Each camp section is an anchor at the scroll offset where it
 * reaches the upper third of the viewport; between anchors the camp index (and so the altitude)
 * is interpolated linearly. Numbers and the marker are written straight to the DOM in rAF,
 * so scrolling never re-renders React; only a camp change does.
 */
export function Altimeter() {
  const [active, setActive] = useState(0);
  const deskAlt = useRef<HTMLSpanElement>(null);
  const mobAlt = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anchors: Anchor[] = [];
    let maxScroll = 1;
    let target = 0;
    let shown = 0;
    let raf = 0;
    let lastIdx = -1;
    const reduce = prefersReducedMotion();

    const measure = () => {
      const vh = window.innerHeight;
      maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const list: Anchor[] = [];
      camps.forEach((c, idx) => {
        const el = document.querySelector<HTMLElement>(`[data-camp="${c.id}"]`);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        list.push({ idx, at: Math.min(maxScroll, Math.max(0, top - vh * 0.35)) });
      });
      if (list.length) list[0].at = 0;
      for (let k = 1; k < list.length; k++) {
        if (list[k].at <= list[k - 1].at) list[k].at = list[k - 1].at + 1;
      }
      anchors = list;
    };

    const fractional = (y: number): number => {
      if (anchors.length < 2) return (y / maxScroll) * LAST;
      if (y <= anchors[0].at) return anchors[0].idx;
      for (let k = 0; k < anchors.length - 1; k++) {
        const a = anchors[k];
        const b = anchors[k + 1];
        if (y < b.at) return a.idx + ((y - a.at) / (b.at - a.at)) * (b.idx - a.idx);
      }
      return anchors[anchors.length - 1].idx;
    };

    const paint = (f: number) => {
      const lo = Math.max(0, Math.min(LAST, Math.floor(f)));
      const hi = Math.min(LAST, lo + 1);
      const alt = camps[lo].altitude + (camps[hi].altitude - camps[lo].altitude) * (f - lo);
      const text = fmt(alt);
      if (deskAlt.current && deskAlt.current.textContent !== text) deskAlt.current.textContent = text;
      if (mobAlt.current && mobAlt.current.textContent !== text) mobAlt.current.textContent = text;
      const p = f / LAST;
      if (marker.current) marker.current.style.transform = `translate3d(0, ${(1 - p) * 100}%, 0)`;
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      if (progress.current) {
        progress.current.style.transform = `scaleX(${Math.min(1, window.scrollY / maxScroll)})`;
      }
      const idx = Math.round(f);
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActive(idx);
        activeCamp.set(camps[idx].id);
        document.documentElement.dataset.activeCamp = camps[idx].id;
      }
    };

    const loop = () => {
      const d = target - shown;
      shown = Math.abs(d) < 0.0008 ? target : shown + d * 0.2;
      paint(shown);
      raf = shown === target ? 0 : requestAnimationFrame(loop);
    };

    const onScroll = () => {
      target = fractional(window.scrollY);
      if (reduce) {
        shown = target;
        paint(shown);
        return;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const remeasure = () => {
      measure();
      onScroll();
    };

    measure();
    target = shown = fractional(window.scrollY);
    paint(shown);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    // Sections grow as their content and fonts settle; keep anchors honest.
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
    };
  }, []);

  const camp = camps[active];
  const dim = camp.id === "chautari";

  return (
    <nav aria-label="Altitude">
      {/* Desktop: vertical altimeter rail on the right edge */}
      <div
        className="fixed right-3 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-end transition-opacity duration-700 md:flex"
        style={{ opacity: dim ? 0.45 : 1 }}
      >
        <div className="mb-5 w-14 text-right font-mono">
          <div className="hud-label !text-[10px]">ALT</div>
          <div className="text-[13px] leading-tight text-text tabular-nums">
            <span ref={deskAlt}>{fmt(camps[0].altitude)}</span>
          </div>
          <div className="hud-label !text-[10px]">M</div>
        </div>

        <div className="relative h-[46vh] max-h-[460px] min-h-[300px] w-14">
          {/* spine */}
          <div aria-hidden className="absolute bottom-0 right-[7px] top-0 w-px bg-line" />
          <div
            aria-hidden
            ref={fill}
            className="absolute bottom-0 right-[7px] top-0 w-px origin-bottom"
            style={{ background: camp.color, transform: "scaleY(0)", transition: "background 600ms" }}
          />
          {/* minor scale ticks */}
          <div aria-hidden className="absolute inset-0">
            {Array.from({ length: LAST * 4 + 1 }, (_, i) => (
              <span
                key={i}
                className="absolute right-[7px] h-px w-1 bg-line-hi"
                style={{ top: `${(i / (LAST * 4)) * 100}%` }}
              />
            ))}
          </div>

          <ol className="absolute inset-0">
            {camps.map((c, i) => {
              const isActive = i === active;
              const top = (1 - i / LAST) * 100;
              return (
                <li key={c.id} className="absolute right-0 -translate-y-1/2" style={{ top: `${top}%` }}>
                  <button
                    type="button"
                    data-cursor
                    onClick={() => scrollToCamp(c.id)}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={`${c.name}, ${fmt(c.altitude)} metres`}
                    className="group flex h-6 min-w-6 items-center justify-end gap-2 pl-2 outline-offset-2"
                  >
                    <span
                      className={`hud-label pointer-events-none whitespace-nowrap border border-line bg-bg px-1.5 py-0.5 !text-[10px] opacity-0 transition-all duration-300 [transition-timing-function:var(--ease-hud)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
                        isActive ? "" : "translate-x-1"
                      }`}
                      style={{ color: isActive ? c.color : undefined }}
                    >
                      {c.short} · {fmt(c.altitude)}
                    </span>
                    <span
                      className="block h-px transition-all duration-500 [transition-timing-function:var(--ease-hud)]"
                      style={{
                        width: isActive ? 18 : 10,
                        background: isActive ? c.color : "var(--text-dim)",
                        opacity: isActive ? 1 : 0.6,
                      }}
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          {/* moving marker: a full-height wrapper translated by its own height fraction */}
          <div
            aria-hidden
            ref={marker}
            className="pointer-events-none absolute inset-0 will-change-transform"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <div className="absolute right-[2px] top-0 -translate-y-1/2">
              <svg width="11" height="11" viewBox="0 0 11 11" className="block">
                <path d="M0 0 L11 5.5 L0 11 Z" transform="translate(11 0) scale(-1 1)" fill={camp.color} />
              </svg>
            </div>
            <div
              className="absolute right-[18px] top-0 h-px w-6 -translate-y-1/2"
              style={{ background: `linear-gradient(to left, ${camp.color}, transparent)` }}
            />
          </div>
        </div>

        <div className="mt-5 w-28 text-right">
          <div className="hud-label !text-[10px]" style={{ color: camp.color }}>
            {camp.name}
          </div>
        </div>
      </div>

      {/* Mobile: thin top bar */}
      <div
        className="fixed inset-x-0 top-0 z-[70] h-9 border-b border-line bg-bg/90 transition-opacity duration-700 md:hidden"
        style={{ opacity: dim ? 0.7 : 1 }}
      >
        <div className="flex h-full items-center gap-2 pl-4 pr-28 font-mono text-[11px] uppercase tracking-[0.12em]">
          <span className="text-dim">ALT</span>
          <span className="tabular-nums text-text">
            <span ref={mobAlt}>{fmt(camps[0].altitude)}</span> M
          </span>
          <span className="h-3 w-px bg-line-hi" aria-hidden />
          <span className="truncate" style={{ color: camp.color }}>
            {camp.name}
          </span>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-px">
          <div
            ref={progress}
            className="h-full origin-left"
            style={{ background: camp.color, transform: "scaleX(0)", transition: "background 600ms" }}
          />
        </div>
      </div>
    </nav>
  );
}
