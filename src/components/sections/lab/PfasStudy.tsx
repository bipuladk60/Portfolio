"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { research } from "@/data/content";
import { ModelChart } from "./ModelChart";
import { EASE, useReducedMotionSafe } from "./motion";

/** The PFAS -> COPD study: question, two findings, model accuracy, and one folded "Method & data". */
export function PfasStudy() {
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-water">{research.award}</p>
          <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-text sm:text-[1.7rem]">{research.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-dim">
            Done at {research.where}. Presented at the {research.venue}, {research.when}.
          </p>
          <blockquote className="mt-7 border-l-2 border-water pl-4 text-lg leading-snug text-text">{research.question}</blockquote>
        </div>

        <div className="lg:col-span-7">
          <dl className="grid grid-cols-2 gap-6">
            {research.findings.map((f) => (
              <div key={f.label} className="flex flex-col-reverse justify-end">
                <dt className="mt-2 text-sm leading-snug text-dim">{f.label}</dt>
                <dd className="font-display text-4xl font-bold leading-none tracking-tight text-water tabular-nums sm:text-5xl">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-10">
            <ModelChart />
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-line">
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
              <div className="grid gap-8 pb-6 pt-2 lg:grid-cols-12">
                <ol className="space-y-2.5 lg:col-span-7">
                  {research.pipeline.map((p, i) => (
                    <li key={p.step} className="grid grid-cols-[1.5rem_5.5rem_1fr] gap-2 text-sm leading-relaxed">
                      <span className="font-mono text-xs leading-6 text-dim">{i + 1}</span>
                      <span className="text-text">{p.step}</span>
                      <span className="text-dim">{p.detail}</span>
                    </li>
                  ))}
                </ol>
                <div className="space-y-3 text-sm leading-relaxed text-dim lg:col-span-5">
                  <p>{research.data}</p>
                  <p>{research.context}</p>
                  <p className="text-xs">{research.thanks}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
