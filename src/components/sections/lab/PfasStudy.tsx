"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { research } from "@/data/content";
import { ModelChart } from "./ModelChart";
import { EASE, useReducedMotionSafe } from "./motion";

/** The study's figure: the two findings as big readouts, then the model comparison. */
export function PfasFigure() {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-6 border-b border-line pb-6">
        {research.findings.map((f) => (
          <div key={f.label} className="flex flex-col-reverse justify-end">
            <dt className="mt-2 text-sm leading-snug text-dim">{f.label}</dt>
            <dd className="font-display text-5xl font-bold leading-none tracking-tight text-water tabular-nums sm:text-6xl">
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6">
        <ModelChart />
      </div>
    </div>
  );
}

/** "Method & data", folded by default so the entry stays the same height as the others. */
export function PfasMethod() {
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="lab-method"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left"
      >
        <span className="hud-label transition-colors group-hover:text-water">Method &amp; data</span>
        <span
          aria-hidden
          className="font-mono text-sm text-water transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="lab-method"
            key="method"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <ol className="space-y-2 pb-4 pt-1">
              {research.pipeline.map((p, i) => (
                <li key={p.step} className="grid grid-cols-[1.25rem_5rem_1fr] gap-2 text-sm leading-relaxed">
                  <span className="font-mono text-[11px] leading-6 text-water">{i + 1}</span>
                  <span className="text-text">{p.step}</span>
                  <span className="text-dim">{p.detail}</span>
                </li>
              ))}
            </ol>
            <div className="space-y-2 pb-5 text-sm leading-relaxed text-dim">
              <p>{research.data}</p>
              <p>{research.context}</p>
              <p className="text-xs">{research.thanks}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
