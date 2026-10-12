"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTER_TWO, camps } from "@/data/camps";
import { INK, ORANGE, PAPER, RED, YELLOW } from "@/components/toon/toon";
import { useChapter } from "@/lib/chapter";
import { activeCamp } from "@/lib/chrome-ui";
import { useHudMode } from "@/lib/hud-mode";
import { prefersReducedMotion } from "@/lib/motion";
import { scrollToCamp } from "@/lib/scroll";
import { playBlip } from "@/lib/sound";
import { toast } from "@/lib/toast";

const LAST = camps.length - 1;
const fmt = (m: number) => Math.round(m).toLocaleString("en-US");
const FREDOKA = "var(--font-fredoka), var(--font-nunito), system-ui, sans-serif";
const FADE = "opacity 600ms cubic-bezier(0.2,0.8,0.2,1)";

type Anchor = { idx: number; at: number; top: number };

/** A camp becomes active once its section's top has crossed this fraction of the viewport. */
const ACTIVE_LINE = 0.4;

const isRendered = (el: HTMLElement) => el.getClientRects().length > 0;

/**
 * Scroll position is altitude. Each visible camp section is an anchor at the scroll offset where it
 * reaches the upper third of the viewport; between anchors the camp index (and so the altitude)
 * is interpolated linearly. Hidden sections (display:none, e.g. locked chapter 2) are skipped.
 * The active camp (label, colour) is NOT taken from that interpolation: it is the last section whose
 * real top has crossed ~40% of the viewport, so the label never runs ahead of what is on screen.
 * Numbers and markers are written straight to the DOM in rAF; only a camp change re-renders.
 *
 * Two skins crossfade: the dark HUD rail (chapter 1) and a cartoon thermometer (chapter 2).
 */
export function Altimeter() {
  const [active, setActive] = useState(0);
  const chapter = useChapter();
  const mode = useHudMode();
  const toon = mode === "toon";

  const alts = useRef<(HTMLSpanElement | null)[]>([]);
  const markers = useRef<(HTMLDivElement | null)[]>([]);
  const fills = useRef<(HTMLDivElement | null)[]>([]);
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
        if (!el || !isRendered(el)) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        list.push({ idx, top, at: Math.min(maxScroll, Math.max(0, top - vh * 0.35)) });
      });
      if (list.length) list[0].at = 0;
      for (let k = 1; k < list.length; k++) {
        if (list[k].at <= list[k - 1].at) list[k].at = list[k - 1].at + 1;
      }
      anchors = list;
    };

    const fractional = (y: number): number => {
      if (anchors.length === 0) return (y / maxScroll) * LAST;
      if (anchors.length === 1 || y <= anchors[0].at) return anchors[0].idx;
      for (let k = 0; k < anchors.length - 1; k++) {
        const a = anchors[k];
        const b = anchors[k + 1];
        if (y < b.at) return a.idx + ((y - a.at) / (b.at - a.at)) * (b.idx - a.idx);
      }
      return anchors[anchors.length - 1].idx;
    };

    /** Index of the last rendered camp whose section top is above the activation line. */
    const activeAt = (y: number): number => {
      if (anchors.length === 0) return 0;
      // At the very bottom a short final section may never reach the line; it is still the one in view.
      if (y >= maxScroll - 2) return anchors[anchors.length - 1].idx;
      const line = y + window.innerHeight * ACTIVE_LINE;
      let idx = anchors[0].idx;
      for (const a of anchors) {
        if (a.top <= line) idx = a.idx;
        else break;
      }
      return idx;
    };

    const setActiveIdx = (idx: number) => {
      if (idx === lastIdx) return;
      lastIdx = idx;
      setActive(idx);
      activeCamp.set(camps[idx].id);
      document.documentElement.dataset.activeCamp = camps[idx].id;
    };

    const paint = (f: number) => {
      const lo = Math.max(0, Math.min(LAST, Math.floor(f)));
      const hi = Math.min(LAST, lo + 1);
      const alt = camps[lo].altitude + (camps[hi].altitude - camps[lo].altitude) * (f - lo);
      const text = fmt(alt);
      alts.current.forEach((el) => {
        if (el && el.textContent !== text) el.textContent = text;
      });
      const p = f / LAST;
      markers.current.forEach((el) => {
        if (el) el.style.transform = `translate3d(0, ${(1 - p) * 100}%, 0)`;
      });
      fills.current.forEach((el) => {
        if (el) el.style.transform = `scaleY(${p})`;
      });
      if (progress.current) {
        progress.current.style.transform = `scaleX(${Math.min(1, window.scrollY / maxScroll)})`;
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
      setActiveIdx(activeAt(window.scrollY));
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
    setActiveIdx(activeAt(window.scrollY));

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    // Sections grow (and chapter 2 appears) as content settles; keep anchors honest.
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(document.body);
    window.addEventListener("xc:chapter", remeasure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("xc:chapter", remeasure);
      ro.disconnect();
    };
  }, []);

  const camp = camps[active];
  const isLocked = (id: string) => chapter === 1 && CHAPTER_TWO.includes(id);

  const go = (id: string) => {
    if (isLocked(id)) {
      playBlip("error");
      scrollToCamp("gate");
      toast("Solve the checkpoint to continue", { title: "Locked", tone: "signal", duration: 2600 });
      return;
    }
    scrollToCamp(id);
  };

  const layer = (on: boolean) => ({ opacity: on ? 1 : 0, transition: FADE });
  const refAt =
    <T extends HTMLElement>(arr: React.RefObject<(T | null)[]>, i: number) =>
    (el: T | null) => {
      arr.current[i] = el;
    };

  return (
    <nav aria-label="Altitude">
      {/* ---------- Desktop rail ---------- */}
      <div className="fixed right-3 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-end md:flex">
        {/* readout: HUD + toon stacked in one grid cell, crossfading */}
        <div className="mb-5 grid w-16 justify-items-end [&>*]:col-start-1 [&>*]:row-start-1">
          <div className="text-right font-mono" style={layer(!toon)} aria-hidden={toon}>
            <div className="hud-label !text-[10px]">ALT</div>
            <div className="text-[13px] leading-tight text-text tabular-nums">
              <span ref={refAt(alts, 0)}>{fmt(camps[0].altitude)}</span>
            </div>
            <div className="hud-label !text-[10px]">M</div>
          </div>
          <div
            aria-hidden
            className="self-center rounded-full px-2 py-1 text-center text-[13px] font-semibold leading-none tabular-nums"
            style={{
              ...layer(toon),
              fontFamily: FREDOKA,
              color: INK,
              background: PAPER,
              border: `2.5px solid ${INK}`,
              boxShadow: `2px 2px 0 ${INK}`,
            }}
          >
            <span ref={refAt(alts, 1)}>{fmt(camps[0].altitude)}</span>
            <span className="ml-0.5 text-[10px]">m</span>
          </div>
        </div>

        <div className="relative h-[46vh] max-h-[460px] min-h-[300px] w-16">
          {/* HUD skin */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={layer(!toon)}>
            <div className="absolute bottom-0 right-[7px] top-0 w-px bg-line" />
            <div
              ref={refAt(fills, 0)}
              className="absolute bottom-0 right-[7px] top-0 w-px origin-bottom"
              style={{ background: camp.color, transform: "scaleY(0)", transition: "background 600ms" }}
            />
            {Array.from({ length: LAST * 4 + 1 }, (_, i) => (
              <span
                key={i}
                className="absolute right-[7px] h-px w-1 bg-line-hi"
                style={{ top: `${(i / (LAST * 4)) * 100}%` }}
              />
            ))}
            <div
              ref={refAt(markers, 0)}
              className="absolute inset-0 will-change-transform"
              style={{ transform: "translate3d(0, 100%, 0)" }}
            >
              <div className="absolute right-[2px] top-0 -translate-y-1/2">
                <svg width="11" height="11" viewBox="0 0 11 11" className="block">
                  <path d="M11 0 L0 5.5 L11 11 Z" fill={camp.color} />
                </svg>
              </div>
              <div
                className="absolute right-[18px] top-0 h-px w-6 -translate-y-1/2"
                style={{ background: `linear-gradient(to left, ${camp.color}, transparent)` }}
              />
            </div>
          </div>

          {/* Toon skin: an ink-outlined thermometer that heats up as you climb */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={layer(toon)}>
            <div
              className="absolute -bottom-2 right-0 top-0 w-[14px] overflow-hidden rounded-full"
              style={{ background: PAPER, border: `2.5px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
            >
              <div
                ref={refAt(fills, 1)}
                className="absolute inset-0 origin-bottom"
                style={{
                  background: `linear-gradient(to top, ${YELLOW}, ${ORANGE} 55%, ${RED})`,
                  transform: "scaleY(0)",
                }}
              />
            </div>
            <div
              className="absolute -bottom-4 right-[-5px] h-6 w-6 rounded-full"
              style={{ background: YELLOW, border: `2.5px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}
            />
            <div
              ref={refAt(markers, 1)}
              className="absolute inset-0 will-change-transform"
              style={{ transform: "translate3d(0, 100%, 0)" }}
            >
              <div
                className="absolute right-[18px] top-0 h-3 w-3 -translate-y-1/2 rotate-45"
                style={{ background: RED, border: `2.5px solid ${INK}` }}
              />
            </div>
          </div>

          {/* Ticks: shared buttons, two label skins */}
          <ol className="absolute inset-0">
            {camps.map((c, i) => {
              const isActive = i === active;
              const locked = isLocked(c.id);
              const top = (1 - i / LAST) * 100;
              return (
                <li key={c.id} className="absolute right-0 -translate-y-1/2" style={{ top: `${top}%` }}>
                  <button
                    type="button"
                    data-cursor
                    onClick={() => go(c.id)}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={
                      locked
                        ? `${c.name}, locked. Solve the checkpoint to continue`
                        : `${c.name}, ${fmt(c.altitude)} metres`
                    }
                    className="group relative flex h-6 min-w-6 items-center justify-end gap-2 pl-2 pr-[1px] outline-offset-2"
                  >
                    <span className="pointer-events-none grid justify-items-end [&>*]:col-start-1 [&>*]:row-start-1">
                      {/* HUD label */}
                      <span style={layer(!toon)}>
                        <span
                          className={`hud-label flex items-center gap-1 whitespace-nowrap border border-line bg-bg px-1.5 py-0.5 !text-[10px] opacity-0 transition-all duration-300 [transition-timing-function:var(--ease-hud)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
                            isActive ? "" : "translate-x-1"
                          }`}
                          style={{ color: isActive ? c.color : undefined }}
                        >
                          {locked && <LockGlyph />}
                          {c.short} · {locked ? "locked" : fmt(c.altitude)}
                        </span>
                      </span>
                      {/* Toon label */}
                      <span style={layer(toon)}>
                        <span
                          className={`block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all duration-300 [transition-timing-function:var(--ease-hud)] ${
                            // The current camp is already named in the pill under the rail; don't repeat it here.
                            isActive
                              ? "invisible opacity-0"
                              : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                          }`}
                          style={{
                            fontFamily: FREDOKA,
                            color: INK,
                            background: isActive ? YELLOW : PAPER,
                            border: `2px solid ${INK}`,
                            boxShadow: `2px 2px 0 ${INK}`,
                          }}
                        >
                          {c.short}
                        </span>
                      </span>
                    </span>
                    {/* tick marks */}
                    <span className="relative block h-2 w-[18px]">
                      <span
                        className="absolute right-0 top-1/2 block h-px -translate-y-1/2 transition-all duration-500 [transition-timing-function:var(--ease-hud)]"
                        style={{
                          ...layer(!toon),
                          width: isActive ? 18 : 10,
                          background: locked
                            ? "repeating-linear-gradient(to left, var(--text-dim) 0 2px, transparent 2px 4px)"
                            : isActive
                              ? c.color
                              : "var(--text-dim)",
                          opacity: toon ? 0 : locked ? 0.35 : isActive ? 1 : 0.6,
                        }}
                      />
                      {locked && (
                        <span
                          className="absolute right-[13px] top-1/2 -translate-y-1/2 text-dim"
                          style={{ ...layer(!toon), opacity: toon ? 0 : 0.75 }}
                        >
                          <LockGlyph />
                        </span>
                      )}
                      <span
                        className="absolute right-[16px] top-1/2 block h-[3px] -translate-y-1/2 rounded-full"
                        style={{ ...layer(toon), width: isActive ? 10 : 6, background: INK }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-5 grid w-28 justify-items-end text-right [&>*]:col-start-1 [&>*]:row-start-1">
          <div className="hud-label !text-[10px]" style={{ ...layer(!toon), color: camp.color }}>
            {camp.name}
          </div>
          <div
            aria-hidden
            className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
            style={{
              ...layer(toon),
              fontFamily: FREDOKA,
              color: INK,
              background: PAPER,
              border: `2px solid ${INK}`,
              boxShadow: `2px 2px 0 ${INK}`,
            }}
          >
            {camp.name}
          </div>
        </div>
      </div>

      {/* ---------- Mobile top bar ---------- */}
      <div className="fixed inset-x-0 top-0 z-[70] h-9 md:hidden">
        <div aria-hidden className="absolute inset-0 border-b border-line bg-bg/90" style={layer(!toon)} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ ...layer(toon), background: PAPER, borderBottom: `2.5px solid ${INK}` }}
        />
        <div
          className="relative flex h-full items-center gap-2 pl-4 pr-28 text-[11px] uppercase tracking-[0.12em] transition-colors duration-500"
          style={{
            fontFamily: toon ? FREDOKA : "var(--font-mono-face), ui-monospace, monospace",
            color: toon ? INK : undefined,
          }}
        >
          <span className={toon ? "" : "text-dim"}>ALT</span>
          <span className={`tabular-nums ${toon ? "font-semibold" : "text-text"}`}>
            <span ref={refAt(alts, 2)}>{fmt(camps[0].altitude)}</span> M
          </span>
          <span className="h-3 w-px" style={{ background: toon ? INK : "var(--line-hi)" }} aria-hidden />
          <span className="truncate" style={{ color: toon ? INK : camp.color }}>
            {camp.name}
          </span>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-[-1px] h-[2px]">
          <div
            ref={progress}
            className="h-full origin-left"
            style={{
              background: toon ? `linear-gradient(to right, ${YELLOW}, ${RED})` : camp.color,
              transform: "scaleX(0)",
            }}
          />
        </div>
      </div>
    </nav>
  );
}

function LockGlyph() {
  return (
    <svg aria-hidden width="8" height="9" viewBox="0 0 8 9" className="inline-block shrink-0">
      <path d="M2 4V2.6a2 2 0 0 1 4 0V4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="0.6" y="4" width="6.8" height="4.4" fill="currentColor" />
    </svg>
  );
}
