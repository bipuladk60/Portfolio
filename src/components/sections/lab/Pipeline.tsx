"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { research } from "@/data/content";
import { Panel } from "@/components/hud/Panel";
import { EASE, useReducedMotionSafe } from "../summits/motion";

const steps = research.pipeline;
const DOT = "radial-gradient(circle, var(--water) 1.4px, transparent 1.9px)";

/** One connector between two nodes, with particles flowing toward the next step. */
function Flow({ vertical, lit, run }: { vertical: boolean; lit: boolean; run: boolean }) {
  const size = vertical ? "100% 12px" : "12px 100%";
  const from = vertical ? "50% 0px" : "0px 50%";
  const to = vertical ? "50% 12px" : "12px 50%";
  return (
    <span
      aria-hidden
      className={vertical ? "relative ml-[18px] block h-8 w-2 md:hidden" : "relative mt-[18px] hidden h-2 flex-1 md:block"}
    >
      <span className={`absolute ${vertical ? "inset-y-0 left-1/2 w-px -translate-x-1/2" : "inset-x-0 top-1/2 h-px -translate-y-1/2"} bg-line-hi`} />
      <motion.span
        className="absolute inset-0"
        style={{ backgroundImage: DOT, backgroundSize: size, backgroundRepeat: vertical ? "repeat-y" : "repeat-x", opacity: lit ? 1 : 0.35 }}
        initial={false}
        animate={run ? { backgroundPosition: [from, to] } : { backgroundPosition: from }}
        transition={run ? { duration: 0.7, ease: "linear", repeat: Infinity } : { duration: 0 }}
      />
    </span>
  );
}

export function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  const seen = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotionSafe();
  const [active, setActive] = useState(0);
  const run = inView && !reduce;
  const step = steps[active];

  return (
    <Panel label="Sample pipeline" accent="var(--water)">
      <div ref={ref} className="p-5 sm:p-6">
        <ol className="flex flex-col md:flex-row md:items-start" aria-label="Research pipeline, five steps">
          {steps.map((s, i) => {
            const on = i === active;
            const last = i === steps.length - 1;
            return (
              <li key={s.step} className={`flex flex-col md:flex-row ${last ? "md:flex-none" : "md:flex-1"}`}>
                <motion.button
                  type="button"
                  aria-pressed={on}
                  aria-controls="lab-pipeline-detail"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="group flex cursor-pointer items-center gap-4 text-left md:w-[92px] md:flex-col md:gap-3 md:text-center"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={seen || reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                  transition={reduce ? { duration: 0 } : { delay: 0.1 + i * 0.12, duration: 0.45, ease: EASE }}
                >
                  <span
                    className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border font-mono text-xs transition-colors duration-300"
                    style={{
                      borderColor: on ? "var(--water)" : "var(--line-hi)",
                      background: on ? "var(--water)" : "var(--panel-2)",
                      color: on ? "var(--bg)" : "var(--water)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                    {on && !reduce && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-full border border-water"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.7, opacity: 0 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}
                  </span>
                  <span className="font-display text-sm font-semibold uppercase tracking-wide transition-colors" style={{ color: on ? "var(--text)" : "var(--text-dim)" }}>
                    {s.step}
                  </span>
                </motion.button>
                {!last && (
                  <>
                    <Flow vertical lit={i < active} run={run} />
                    <Flow vertical={false} lit={i < active} run={run} />
                  </>
                )}
              </li>
            );
          })}
        </ol>

        <div id="lab-pipeline-detail" aria-live="polite" className="mt-5 border-t border-line pt-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reduce ? { duration: 0 } : { duration: 0.28, ease: EASE }}
              className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <p className="hud-label shrink-0 text-water">
                Step {String(active + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")} · {step.step}
              </p>
              <p className="text-base leading-relaxed text-text">{step.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Panel>
  );
}
