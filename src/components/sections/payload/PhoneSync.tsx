"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

const PHONES = 4;
const BARS = 5;
const START_OFFSETS = [0, 1.25, -0.9, 1.9];
// static, deterministic bar heights for SSR / reduced motion
const STILL = [0.45, 0.8, 1, 0.7, 0.4];

/**
 * Phones start out of phase and get nudged toward a shared clock twice a second
 * (the drift correction in PartySync), until every waveform pulses together.
 */
export function PhoneSync() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const frames = useRef<(HTMLSpanElement | null)[]>([]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!inView || reduce) return;
    const off = [...START_OFFSETS];
    let raf = 0;
    let lastNudge = 0;
    let syncedAt = 0;
    let isSynced = false;
    const loop = (t: number) => {
      if (t - lastNudge > 500) {
        lastNudge = t;
        for (let p = 0; p < PHONES; p++) off[p] *= 0.5;
        const drift = Math.max(...off.map(Math.abs));
        if (!isSynced && drift < 0.03) {
          isSynced = true;
          syncedAt = t;
          setSynced(true);
        }
        if (isSynced && t - syncedAt > 2600) {
          START_OFFSETS.forEach((v, i) => (off[i] = v * (0.6 + Math.random() * 0.8)));
          isSynced = false;
          setSynced(false);
        }
      }
      const phase = t / 1000;
      for (let p = 0; p < PHONES; p++) {
        let peak = 0;
        for (let b = 0; b < BARS; b++) {
          const v = 0.5 + 0.5 * Math.sin(phase * 5.2 + off[p] + b * 0.85) * Math.sin(phase * 1.7 + off[p] * 0.4 + 1);
          const h = 0.18 + 0.82 * Math.abs(v);
          if (b === 2) peak = h;
          const el = bars.current[p * BARS + b];
          if (el) el.style.transform = `scaleY(${h.toFixed(3)})`;
        }
        const f = frames.current[p];
        if (f) f.style.borderColor = `color-mix(in oklab, var(--fire) ${Math.round(20 + peak * 60)}%, var(--line-hi))`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  return (
    <div ref={ref} className="flex h-full flex-col items-center justify-center gap-3 px-4 py-3">
      <div className="flex items-end gap-3 sm:gap-4">
        {Array.from({ length: PHONES }, (_, p) => (
          <span
            key={p}
            ref={(el) => {
              frames.current[p] = el;
            }}
            className="relative flex h-[68px] w-[36px] flex-col items-center rounded-[7px] border border-line-hi bg-bg px-[4px] pb-[6px] pt-[5px]"
          >
            <span className="h-[2px] w-[10px] rounded-full bg-line-hi" />
            <span className="mt-auto flex h-[34px] w-full items-end justify-between">
              {Array.from({ length: BARS }, (_, b) => (
                <span
                  key={b}
                  ref={(el) => {
                    bars.current[p * BARS + b] = el;
                  }}
                  className="block h-full w-[3px] origin-bottom bg-fire/80"
                  style={{ transform: `scaleY(${STILL[b]})` }}
                />
              ))}
            </span>
          </span>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
        {synced || reduce ? <span className="text-water">In sync · one speaker</span> : <span className="text-dim">Syncing clocks</span>}
      </p>
    </div>
  );
}
