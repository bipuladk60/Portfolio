"use client";

import { motion, useReducedMotion } from "motion/react";
import { Chip, Panel } from "@/components/hud/Panel";
import type { Experience } from "@/data/content";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** One camp on the route. Compact: header column beside the full (short) log. */
export function RouteCard({ entry, index }: { entry: Experience; index: number }) {
  const reduce = useReducedMotion();
  const accent = entry.concurrent ? "var(--signal)" : "var(--sky)";

  return (
    <motion.div
      // Negative insets keep the Panel's outside brackets and label tab visible once assembled.
      initial={{ opacity: 0, y: 20, clipPath: "inset(-8% -4% 100% -4%)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(-8% -4% -8% -4%)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
    >
      <Panel
        as="article"
        label={`Waypoint ${String(index + 1).padStart(2, "0")}${entry.concurrent ? " · continuous" : ""}`}
        accent={accent}
        className="p-5 pt-6 transition-colors duration-300 hover:border-line-hi sm:p-6 sm:pt-7"
      >
        <div className="grid gap-4 lg:grid-cols-[15rem_1fr] lg:gap-8">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: accent }}>
              {entry.when}
            </p>
            <h3 className="mt-2 font-display text-lg font-bold leading-tight text-text sm:text-xl">{entry.company}</h3>
            <p className="mt-1 text-sm font-medium text-text/85">{entry.role}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">{entry.where}</p>
          </div>
          <div className="min-w-0">
            <ul className="space-y-2">
              {entry.bullets.map((b, i) => (
                <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-1 text-[15px] leading-relaxed text-text/90">
                  <span aria-hidden className="pt-[3px] font-mono text-[11px]" style={{ color: accent }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
              {entry.stack.map((s) => (
                <li key={s}>
                  <Chip>{s}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
}
