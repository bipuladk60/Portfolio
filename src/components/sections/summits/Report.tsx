"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Hackathon } from "@/data/content";
import { EASE } from "./motion";

/** The selected hackathon: result, project, the pitch, what I did, and links. One hairline, no box. */
export function Report({ h, reduce }: { h: Hackathon; reduce: boolean }) {
  const isWin = h.result === "win";
  const color = isWin ? "var(--signal)" : "var(--sky)";
  const t = (d = 0) => (reduce ? { duration: 0 } : { delay: d, duration: 0.4, ease: EASE });

  return (
    <article className="border-l pl-6 sm:pl-8 lg:min-h-[480px]" style={{ borderColor: `color-mix(in oklab, ${color} 55%, var(--line))` }}>
      <div id="hackathon-detail" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={h.id}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={t()}
          >
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-[0.06em]">
              <span className="font-semibold uppercase tracking-[0.14em]" style={{ color }}>
                {isWin ? "Win" : "Competed"}
              </span>
              <span className="text-dim">{h.when}</span>
            </p>

            <h3 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-text sm:text-3xl">
              {h.event}
            </h3>
            <p className="mt-1 text-sm text-dim">{h.host}</p>

            <dl className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <dt className="hud-label">Result</dt>
                <dd className="mt-1.5 font-display text-base font-semibold leading-snug" style={{ color: isWin ? color : "var(--text)" }}>
                  {h.award}
                </dd>
              </div>
              <div>
                <dt className="hud-label">Project</dt>
                <dd className="mt-1.5 font-display text-base font-semibold leading-snug text-text">{h.project}</dd>
              </div>
            </dl>

            <p className="mt-6 text-lg leading-snug text-text">{h.pitch}</p>

            <ul className="mt-4 space-y-2.5">
              {h.bullets.map((b, i) => (
                <motion.li
                  key={b}
                  className="flex gap-3 text-[15px] leading-relaxed text-text/75"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={t(0.1 + i * 0.05)}
                >
                  <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0" style={{ background: color }} />
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>

            <p className="mt-5 font-mono text-xs leading-relaxed text-dim">
              <span className="sr-only">Stack: </span>
              {h.stack.join(" · ")}
            </p>

            {h.links && h.links.length > 0 && (
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {h.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-sky underline-offset-4 hover:underline"
                  >
                    {l.label}
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                      -&gt;
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </article>
  );
}
