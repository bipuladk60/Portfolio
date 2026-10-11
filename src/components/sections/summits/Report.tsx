"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Hackathon } from "@/data/content";
import { Chip, Panel } from "@/components/hud/Panel";
import { EASE } from "./motion";

export function Report({ h, index, total, reduce }: { h: Hackathon; index: number; total: number; reduce: boolean }) {
  const isWin = h.result === "win";
  const color = isWin ? "var(--signal)" : "var(--sky)";
  const t = (d = 0) => (reduce ? { duration: 0 } : { delay: d, duration: 0.4, ease: EASE });

  return (
    <Panel
      as="article"
      label={`Expedition report · ${String(index + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}`}
      accent={color}
      className="min-h-[420px]"
    >
      <div id="summit-report" aria-live="polite" className="relative p-5 sm:p-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={h.id}
            initial={{ opacity: 0, x: 18, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -18, filter: "blur(4px)" }}
            transition={t()}
          >
            {/* status strip */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  background: isWin ? color : "transparent",
                  color: isWin ? "var(--bg)" : color,
                  border: `1px solid ${color}`,
                }}
              >
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: isWin ? "var(--bg)" : color }} />
                {isWin ? "Summit · flag planted" : "Turned back · data gathered"}
              </span>
              <span className="hud-label">{h.when}</span>
            </div>

            <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-text sm:text-3xl">
              {h.event}
            </h3>
            <p className="mt-1 text-sm text-dim">{h.host}</p>

            <dl className="mt-6 grid gap-4 border-y border-line py-4 sm:grid-cols-2">
              <div>
                <dt className="hud-label">Result</dt>
                <dd className="mt-1 font-display text-base font-semibold leading-snug" style={{ color }}>
                  {h.award}
                </dd>
              </div>
              <div>
                <dt className="hud-label">Project</dt>
                <dd className="mt-1 font-display text-base font-semibold leading-snug text-text">{h.project}</dd>
              </div>
            </dl>

            <p className="mt-5 border-l-2 pl-4 text-lg leading-snug text-text" style={{ borderColor: color }}>
              {h.pitch}
            </p>

            <ul className="mt-5 space-y-2.5">
              {h.bullets.map((b, i) => (
                <motion.li
                  key={b}
                  className="flex gap-3 text-sm leading-relaxed text-dim"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={t(0.1 + i * 0.05)}
                >
                  <span aria-hidden className="mt-[9px] h-px w-3 shrink-0" style={{ background: color }} />
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {h.stack.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>

            {h.links && h.links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {h.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 border border-line px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-sky transition-colors hover:border-sky"
                  >
                    {l.label}
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                      -&gt;
                    </span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Panel>
  );
}
