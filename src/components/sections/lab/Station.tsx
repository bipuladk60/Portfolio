"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { mlWork, research } from "@/data/content";
import { Chip, Panel } from "@/components/hud/Panel";
import { EASE, useReducedMotionSafe } from "../summits/motion";
import { AirField } from "./AirField";
import { ModelChart } from "./ModelChart";
import { Pipeline } from "./Pipeline";

// Turn the data sentence into spec-sheet rows: "Key: value" stays keyed, the lead sentence is the source.
const specRows = research.data
  .split(/\.\s+/)
  .map((s) => s.replace(/\.$/, "").trim())
  .filter(Boolean)
  .map((s, i) => {
    const at = s.indexOf(":");
    if (at > 0) return { key: s.slice(0, at), value: s.slice(at + 1).trim() };
    return { key: i === 0 ? "Source" : "Note", value: s };
  });

function riseProps(reduce: boolean, delay = 0) {
  return {
    // panels assemble top-down (a wipe), rather than simply fading in
    initial: { opacity: 0, y: 14, clipPath: "inset(-16px -16px 100% -16px)" },
    whileInView: { opacity: 1, y: 0, clipPath: "inset(-16px -16px -16px -16px)" },
    viewport: { once: true, margin: "-8% 0px" },
    transition: reduce ? { duration: 0 } : { delay, duration: 0.6, ease: EASE },
  } as const;
}

export function Station() {
  const reduce = useReducedMotionSafe();
  const rise = (d = 0) => riseProps(reduce, d);
  const [methodOpen, setMethodOpen] = useState(false);

  return (
    <div className="relative">
      <AirField className="absolute inset-x-0 top-0 h-[min(100%,820px)] w-full opacity-60" />

      <div className="relative space-y-6">
        {/* study header + research question */}
        <motion.div {...rise()}>
          <Panel label="Station log · primary study" accent="var(--water)">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <span className="inline-flex items-center gap-2 bg-water px-2 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-bg">
                  <span aria-hidden className="led inline-block h-1.5 w-1.5 rounded-full bg-bg" />
                  {research.award}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold uppercase leading-tight tracking-tight text-text sm:text-2xl">
                  {research.title}
                </h3>
                <p className="mt-2 text-sm text-dim">
                  {research.venue} · <span className="font-mono text-xs uppercase tracking-[0.12em] text-water">{research.when}</span>
                </p>
              </div>
              <figure className="relative lg:col-span-7 lg:border-l lg:border-line lg:pl-8">
                <p className="hud-label">Research question</p>
                <blockquote className="mt-2 border-l-2 border-water pl-4 font-display text-lg font-medium leading-snug text-text sm:text-xl">
                  {research.question}
                </blockquote>
              </figure>
            </div>
          </Panel>
        </motion.div>

        {/* pipeline */}
        <motion.div {...rise(0.05)}>
          <Pipeline />
        </motion.div>

        {/* one results panel: readings beside the model bars, method folded underneath */}
        <motion.div {...rise(0.08)}>
          <Panel label="Results" accent="var(--water)">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-5">
                {research.findings.map((f, i) => (
                  <div key={f.label} className="border border-line bg-bg/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="hud-label">Reading {String(i + 1).padStart(2, "0")}</span>
                      <span aria-hidden className="flex gap-0.5">
                        {[0, 1, 2, 3].map((k) => (
                          <span key={k} className="h-2 w-1 bg-water" style={{ opacity: 0.3 + k * 0.2 }} />
                        ))}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-nowrap font-display text-4xl font-bold leading-none tracking-tight text-water tabular-nums">
                      {f.value}
                    </p>
                    <p className="mt-2 text-sm leading-snug text-text">{f.label}</p>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-7">
                <ModelChart />
              </div>
            </div>

            {/* Method & data disclosure */}
            <div className="border-t border-line">
              <button
                type="button"
                aria-expanded={methodOpen}
                aria-controls="lab-method"
                onClick={() => setMethodOpen((o) => !o)}
                className="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3 text-left sm:px-6"
              >
                <span className="hud-label transition-colors group-hover:text-water">Method &amp; data</span>
                <span aria-hidden className="font-mono text-sm text-water transition-transform duration-300" style={{ transform: methodOpen ? "rotate(45deg)" : "none" }}>
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {methodOpen && (
                  <motion.div
                    id="lab-method"
                    key="method"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-6 px-5 pb-5 sm:px-6 lg:grid-cols-12">
                      <dl className="divide-y divide-line border-y border-line lg:col-span-7">
                        {specRows.map((r) => (
                          <div key={r.key} className="grid gap-1.5 py-2.5 sm:grid-cols-[110px_1fr] sm:gap-4">
                            <dt className="hud-label pt-0.5">{r.key}</dt>
                            <dd className="text-sm leading-relaxed text-text">
                              {r.key === "Compounds" ? (
                                <span className="flex flex-wrap gap-1.5">
                                  {r.value.split(/,\s*/).map((c) => (
                                    <Chip key={c} color="var(--water)">
                                      {c}
                                    </Chip>
                                  ))}
                                </span>
                              ) : (
                                r.value
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <div className="space-y-3 lg:col-span-5">
                        <p className="text-sm leading-relaxed text-dim">{research.context}</p>
                        <p className="font-mono text-[11px] leading-relaxed text-dim">{research.thanks}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>
        </motion.div>

        {/* lab notes */}
        <div className="pt-4">
          <div className="mb-5 flex items-center gap-4">
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-text">Lab notes</h3>
            <span aria-hidden className="h-px flex-1 bg-line" />
            <span className="hud-label">Other ML work</span>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {mlWork.map((w, i) => (
              <motion.li key={w.title} className="flex" {...rise(0.07 * i)}>
                <Panel
                  as="article"
                  accent="var(--water)"
                  className="flex w-full flex-col gap-4 p-4 transition-colors duration-300 hover:border-water/60 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="hud-label">{w.when}</p>
                    <h4 className="mt-1.5 font-display text-base font-semibold uppercase leading-tight text-text">{w.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-dim">{w.detail}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {w.stack.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                  {w.metrics.length > 0 && (
                    <dl className="grid shrink-0 grid-cols-2 gap-px border border-line bg-line sm:w-[150px] sm:grid-cols-1">
                      {w.metrics.map((m) => (
                        <div key={m.label} className="flex flex-col-reverse justify-end bg-bg px-3 py-2">
                          <dt className="mt-1 font-mono text-[9.5px] uppercase leading-tight tracking-[0.1em] text-dim">{m.label}</dt>
                          <dd className="font-display text-xl font-bold leading-none text-water tabular-nums">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </Panel>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
