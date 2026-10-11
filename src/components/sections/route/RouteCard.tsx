"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Chip, Panel } from "@/components/hud/Panel";
import type { Experience } from "@/data/content";

const EASE = [0.2, 0.8, 0.2, 1] as const;

type RouteCardProps = {
  entry: Experience;
  altitude: string;
  index: number;
};

/** One camp on the route: role summary up front, full log behind an accessible disclosure. */
export function RouteCard({ entry, altitude, index }: RouteCardProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const logId = useId();

  return (
    <motion.div
      // Negative insets keep the Panel's outside brackets and label tab visible once assembled.
      initial={{ opacity: 0, y: 24, clipPath: "inset(-6% -6% 100% -6%)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(-6% -6% -6% -6%)" }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
    >
      <Panel
        as="article"
        label={`Waypoint ${String(index + 1).padStart(2, "0")}`}
        accent="var(--sky)"
        className="group p-5 pt-7 transition-colors duration-300 hover:border-sky/50 sm:p-7 sm:pt-8"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="text-sky">{entry.when}</span>
          <span aria-hidden className="h-px w-4 bg-line-hi" />
          <span className="text-dim">{entry.where}</span>
          <span className="text-dim/70 md:hidden">· ALT {altitude}</span>
        </div>

        <h3 className="mt-3 font-display text-xl font-bold leading-tight text-text sm:text-2xl">{entry.company}</h3>
        <p className="mt-1 font-medium text-text/85">{entry.role}</p>
        <p className="mt-4 leading-relaxed text-dim">{entry.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Stack">
          {entry.stack.map((s) => (
            <li key={s}>
              <Chip>{s}</Chip>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-line pt-4">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={logId}
            onClick={() => setOpen((v) => !v)}
            className="group/btn inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text transition-colors hover:text-sky"
          >
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center border border-line-hi transition-colors group-hover/btn:border-sky"
            >
              <motion.svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                animate={{ rotate: open ? 45 : 0 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              >
                <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1.5" />
              </motion.svg>
            </span>
            {open ? "Close log" : "Open log"}
            <span className="text-dim">· {entry.bullets.length} entries</span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={logId}
                key="log"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                className="overflow-hidden"
              >
                <motion.ul
                  className="space-y-3 pt-5"
                  initial="hidden"
                  animate="shown"
                  variants={{ shown: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: reduce ? 0 : 0.1 } } }}
                >
                  {entry.bullets.map((b, i) => (
                    <motion.li
                      key={i}
                      className="grid grid-cols-[2rem_1fr] gap-2 text-[15px] leading-relaxed text-text/90"
                      variants={{
                        hidden: { opacity: 0, x: reduce ? 0 : -10 },
                        shown: { opacity: 1, x: 0, transition: { duration: reduce ? 0 : 0.35, ease: EASE } },
                      }}
                    >
                      <span aria-hidden className="pt-[3px] font-mono text-[11px] text-sky/80">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{b}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Panel>
    </motion.div>
  );
}
