"use client";

import { motion } from "motion/react";
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

  return (
    <div className="relative">
      <AirField className="absolute inset-x-0 top-0 h-[min(100%,960px)] w-full opacity-60" />

      <div className="relative space-y-8">
        {/* study header + research question */}
        <motion.div {...rise()}>
          <Panel label="Station log · primary study" accent="var(--water)">
            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 bg-water px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bg">
                    <span aria-hidden className="led inline-block h-1.5 w-1.5 rounded-full bg-bg" />
                    {research.award}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-text sm:text-3xl">
                  {research.title}
                </h3>
                <p className="mt-3 text-sm text-dim">{research.venue}</p>
                <p className="hud-label mt-2 text-water">{research.when}</p>
              </div>
              <figure className="relative lg:col-span-7 lg:border-l lg:border-line lg:pl-8">
                <span aria-hidden className="pointer-events-none absolute -top-2 right-0 font-display text-7xl leading-none text-water/25">
                  &ldquo;
                </span>
                <p className="hud-label">Research question</p>
                <blockquote className="mt-3 font-display text-2xl font-medium leading-snug text-text sm:text-[1.9rem]">
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

        {/* readings + models */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {research.findings.map((f, i) => (
              <motion.div key={f.label} {...rise(0.08 * i)}>
                <Panel label={`Reading ${String(i + 1).padStart(2, "0")}`} accent="var(--water)" className="h-full">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="hud-label">Finding</span>
                      <span aria-hidden className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((k) => (
                          <span key={k} className="h-2 w-1 bg-water" style={{ opacity: 0.25 + k * 0.17 }} />
                        ))}
                      </span>
                    </div>
                    <p className="mt-3 border border-line bg-bg/70 px-4 py-2.5 font-display text-5xl font-bold leading-none tracking-tight text-water tabular-nums sm:text-6xl">
                      {f.value}
                    </p>
                    <p className="mt-3 text-sm leading-snug text-text">{f.label}</p>
                  </div>
                </Panel>
              </motion.div>
            ))}
          </div>
          <motion.div className="lg:col-span-7" {...rise(0.1)}>
            <ModelChart />
          </motion.div>
        </div>

        {/* sensor spec sheet */}
        <motion.div {...rise()}>
          <Panel label="Sensor spec · dataset" accent="var(--water)">
            <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-12">
              <dl className="divide-y divide-line border-y border-line lg:col-span-7">
                {specRows.map((r) => (
                  <div key={r.key} className="grid gap-2 py-3 sm:grid-cols-[120px_1fr] sm:gap-4">
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
              <div className="lg:col-span-5">
                <p className="hud-label">Why it matters</p>
                <p className="mt-3 text-base leading-relaxed text-dim">{research.context}</p>
              </div>
            </div>
          </Panel>
        </motion.div>

        <p className="max-w-3xl font-mono text-[11px] leading-relaxed text-dim">{research.thanks}</p>

        {/* lab notes */}
        <div className="pt-8">
          <div className="mb-6 flex items-center gap-4">
            <h3 className="font-display text-xl font-bold uppercase tracking-tight text-text sm:text-2xl">Lab notes</h3>
            <span aria-hidden className="h-px flex-1 bg-line" />
            <span className="hud-label">Other ML work</span>
          </div>
          <ul className="grid gap-6 md:grid-cols-3">
            {mlWork.map((w, i) => (
              <motion.li key={w.title} className="flex" {...rise(0.07 * i)}>
                <Panel
                  as="article"
                  accent="var(--water)"
                  className="flex w-full flex-col p-5 transition-colors duration-300 hover:border-water/60"
                >
                  <p className="hud-label">
                    Note {String(i + 1).padStart(2, "0")} · {w.when}
                  </p>
                  <h4 className="mt-3 font-display text-lg font-semibold uppercase leading-tight text-text">{w.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-dim">{w.detail}</p>
                  {w.metrics.length > 0 && (
                    <dl className="mt-5 grid grid-cols-3 gap-px border border-line bg-line">
                      {w.metrics.map((m) => (
                        <div key={m.label} className="flex flex-col-reverse justify-end bg-bg px-2 py-3">
                          <dt className="mt-2 min-h-[2.4em] font-mono text-[9.5px] uppercase leading-tight tracking-[0.1em] text-dim">{m.label}</dt>
                          <dd className="font-display text-xl font-bold leading-none text-water tabular-nums">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {w.stack.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </Panel>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
