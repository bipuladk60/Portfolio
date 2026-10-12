"use client";

import { motion } from "motion/react";
import { research } from "@/data/content";
import { Panel } from "@/components/hud/Panel";
import { EASE, useReducedMotionSafe } from "../summits/motion";

const models = research.models;
const best = Math.max(...models.map((m) => m.accuracy));
const TICKS = [0, 25, 50, 75, 100];

/** Horizontal accuracy bars on a true 0-100% axis; the best model is lit. */
export function ModelChart() {
  const reduce = useReducedMotionSafe();
  return (
    <Panel label="Model comparison · accuracy" accent="var(--water)" className="h-full">
      <figure className="flex h-full flex-col p-5 sm:p-7">
        <figcaption className="sr-only">
          Prediction accuracy by model: {models.map((m) => `${m.name} ${m.accuracy.toFixed(1)}%`).join(", ")}.
        </figcaption>
        <ul className="flex flex-1 flex-col justify-evenly gap-5 py-2" aria-hidden>
          {models.map((m, i) => {
            const isBest = m.accuracy === best;
            return (
              <li key={m.name}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <span className={`text-sm ${isBest ? "text-text" : "text-dim"}`}>
                    {m.name}
                    {isBest && (
                      <span className="ml-2 border border-water px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.14em] text-water">
                        Best
                      </span>
                    )}
                  </span>
                  <span className={`font-mono text-sm tabular-nums ${isBest ? "text-water" : "text-dim"}`}>{m.accuracy.toFixed(1)}%</span>
                </div>
                <div className="relative h-3 bg-panel-2 lg:h-4">
                  {TICKS.slice(1, -1).map((t) => (
                    <span key={t} className="absolute inset-y-0 w-px bg-line" style={{ left: `${t}%` }} />
                  ))}
                  <motion.div
                    className="absolute inset-y-0 left-0 origin-left"
                    style={{
                      width: `${m.accuracy}%`,
                      background: isBest
                        ? "var(--water)"
                        : "repeating-linear-gradient(90deg, var(--line-hi) 0 6px, color-mix(in oklab, var(--line-hi) 60%, transparent) 6px 8px)",
                      boxShadow: isBest ? "0 0 18px -4px var(--water)" : undefined,
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={reduce ? { duration: 0 } : { delay: 0.15 + i * 0.12, duration: 0.9, ease: EASE }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <div className="relative mt-3 h-4 font-mono text-[10px] text-dim" aria-hidden>
          {TICKS.map((t) => (
            <span
              key={t}
              className="absolute top-0"
              style={{ left: `${t}%`, transform: t === 0 ? "none" : t === 100 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {t}
            </span>
          ))}
        </div>
        <p className="hud-label mt-4">Predicting COPD status · accuracy, %</p>
      </figure>
    </Panel>
  );
}
