"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { mulberry32 } from "../chautari/prng";

/**
 * A query clip's perceptual hash is compared frame by frame along a film strip.
 * Hamming distance is computed for real on these demo hashes; the scanner locks when it drops low.
 */

const FRAMES = 7;
const BITS = 16;
const MATCH_AT = 2;

const STRIP: number[][] = (() => {
  const rng = mulberry32(77);
  return Array.from({ length: FRAMES }, () => Array.from({ length: BITS }, () => (rng() > 0.5 ? 1 : 0)));
})();

function noisyCopy(bits: number[], a: number, b: number) {
  return bits.map((v, i) => (i === a || i === b ? 1 - v : v));
}

const hamming = (a: number[], b: number[]) => a.reduce((n, v, i) => n + (v === b[i] ? 0 : 1), 0);

type State = { cursor: number; target: number; query: number[]; locked: boolean };

const INITIAL: State = { cursor: 0, target: 4, query: noisyCopy(STRIP[4], 1, 9), locked: false };

function HashGrid({ bits, tone }: { bits: number[]; tone: string }) {
  return (
    <span className="grid h-full w-full grid-cols-4 grid-rows-4 gap-[1px] p-[3px]">
      {bits.map((b, i) => (
        <span key={i} style={{ background: b ? tone : "color-mix(in oklab, var(--line) 80%, transparent)" }} />
      ))}
    </span>
  );
}

export function FilmStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();
  const [s, setS] = useState<State>(INITIAL);

  const live = useRef<State>(INITIAL);

  useEffect(() => {
    if (!inView || reduce) return;
    let timer = 0;
    const next = (prev: State): State => {
      if (prev.locked) {
        const target = (prev.target + 3) % FRAMES;
        const a = Math.floor(Math.random() * BITS);
        const b = (a + 1 + Math.floor(Math.random() * (BITS - 1))) % BITS;
        return { cursor: 0, target, query: noisyCopy(STRIP[target], a, b), locked: false };
      }
      const cursor = (prev.cursor + 1) % FRAMES;
      return { ...prev, cursor, locked: hamming(prev.query, STRIP[cursor]) <= MATCH_AT };
    };
    const loop = () => {
      live.current = next(live.current);
      setS(live.current);
      // hold on a lock so it reads
      timer = window.setTimeout(loop, live.current.locked ? 1900 : 480);
    };
    timer = window.setTimeout(loop, 480);
    return () => window.clearTimeout(timer);
  }, [inView, reduce]);

  // reduced motion: show the solved state
  const view: State = reduce ? { ...INITIAL, cursor: INITIAL.target, locked: true } : s;
  const dist = hamming(view.query, STRIP[view.cursor]);

  return (
    <div ref={ref} className="flex h-full flex-col justify-center gap-3 px-3 py-3 sm:px-4">
      <div className="flex items-stretch gap-3">
        {/* query clip */}
        <div className="flex w-[18%] shrink-0 flex-col gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-signal">Clip</span>
          <span className="block aspect-[4/3] border border-signal/70 bg-bg">
            <HashGrid bits={view.query} tone="var(--signal)" />
          </span>
        </div>
        {/* strip */}
        <div className="relative min-w-0 flex-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-dim/80">Index</span>
          <div className="mt-1 border-y border-line bg-[#07090c] py-[6px]">
            <div className="pb-sprockets h-[4px]" />
            <div className="my-[5px] grid grid-cols-7 gap-[3px] px-[3px]">
              {STRIP.map((bits, i) => {
                const active = i === view.cursor;
                const match = active && view.locked;
                return (
                  <span
                    key={i}
                    className="relative block aspect-[4/3] overflow-hidden border bg-bg transition-colors duration-200"
                    style={{
                      borderColor: match ? "var(--fire)" : active ? "var(--signal)" : "var(--line)",
                      boxShadow: match ? "0 0 0 1px var(--fire), 0 0 14px color-mix(in oklab, var(--fire) 45%, transparent)" : undefined,
                    }}
                  >
                    <HashGrid bits={bits} tone={match ? "var(--fire)" : "color-mix(in oklab, var(--text) 70%, transparent)"} />
                    {active && !match && <span className="pb-scan absolute inset-x-0 top-0 h-px bg-signal" />}
                  </span>
                );
              })}
            </div>
            <div className="pb-sprockets h-[4px]" />
          </div>
        </div>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
        {view.locked ? (
          <span className="text-fire">Match locked · frame {String(view.cursor + 1).padStart(2, "0")}</span>
        ) : (
          <span>Scanning · frame {String(view.cursor + 1).padStart(2, "0")}</span>
        )}
        <span className="text-dim/70"> · Δ {dist} bits</span>
      </p>
    </div>
  );
}
