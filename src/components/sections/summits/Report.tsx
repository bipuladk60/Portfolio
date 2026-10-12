"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Hackathon } from "@/data/content";
import { ResultGlyph } from "./Markers";
import { EASE } from "./motion";

/**
 * The selected hackathon as one tinted card in its result colour (amber win, blue competed).
 * The tint, glow and corner accents cross-fade when the selection changes; the content slides.
 */
export function Report({
  h,
  position,
  total,
  reduce,
  onStep,
}: {
  h: Hackathon;
  position: number;
  total: number;
  reduce: boolean;
  onStep: (dir: -1 | 1) => void;
}) {
  const isWin = h.result === "win";
  const color = isWin ? "var(--signal)" : "var(--sky)";
  const t = (d = 0) => (reduce ? { duration: 0 } : { delay: d, duration: 0.4, ease: EASE });

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={reduce ? { duration: 0 } : { delay: 0.35, duration: 0.6, ease: EASE }}
      className="relative overflow-hidden border p-6 transition-[border-color,background-color,color] duration-500 sm:p-8 lg:min-h-[540px]"
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 30%, var(--line))`,
        backgroundColor: `color-mix(in oklab, ${color} 6%, var(--panel))`,
      }}
    >
      {/* glow from the top corner and a faint wash down the card, both in the result colour */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, currentColor 20%, transparent), transparent)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(170deg, transparent 40%, color-mix(in oklab, var(--bg) 55%, transparent))" }}
      />
      {/* corner accents */}
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-current" />
      <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-current" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-[0.06em]">
            <ResultGlyph win={isWin} className="h-4 w-4" />
            <span className="font-semibold uppercase tracking-[0.14em]">{isWin ? "Win" : "Competed"}</span>
            <span className="text-dim">{h.when}</span>
          </p>
          <div className="flex items-center gap-1 font-mono text-[11px] text-dim">
            <StepButton label="Previous hackathon" onClick={() => onStep(-1)} dir={-1} />
            <span className="w-11 text-center tabular-nums" aria-hidden>
              {position}/{total}
            </span>
            <StepButton label="Next hackathon" onClick={() => onStep(1)} dir={1} />
          </div>
        </div>

        <div id="hackathon-detail" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={t()}
            >
              <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-text sm:text-3xl">
                {h.event}
              </h3>
              <p className="mt-1 text-sm text-dim">{h.host}</p>

              <dl className="mt-6 grid grid-cols-2 gap-6 border-t pt-5" style={{ borderColor: `color-mix(in oklab, ${color} 22%, var(--line))` }}>
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
      </div>
    </motion.article>
  );
}

function StepButton({ label, onClick, dir }: { label: string; onClick: () => void; dir: -1 | 1 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-controls="hackathon-detail"
      className="group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-dim transition-colors hover:bg-[color-mix(in_oklab,currentColor_14%,transparent)] hover:text-text"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" aria-hidden>
        <path
          d={dir < 0 ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
