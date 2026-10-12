"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Experience } from "@/data/content";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * One role. No box: a header column (dates, company, role) beside a one-line summary, the bullets
 * and the stack as plain text. Everything is visible; nothing waits behind hover.
 */
export function RouteCard({ entry }: { entry: Experience }) {
  const reduce = useReducedMotion();
  const accent = entry.concurrent ? "var(--signal)" : "var(--sky)";

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
      className="grid gap-5 lg:grid-cols-[16rem_1fr] lg:gap-12"
    >
      <header className="min-w-0">
        <p className="font-mono text-xs tracking-[0.06em]" style={{ color: accent }}>
          {entry.when}
        </p>
        <h3 className="mt-2 font-display text-xl font-bold leading-tight text-text sm:text-2xl">{entry.company}</h3>
        <p className="mt-1.5 text-[15px] text-text/85">{entry.role}</p>
        <p className="mt-1 text-sm text-dim">
          {entry.where}
          {entry.concurrent && <span className="text-signal/90"> · alongside the roles below</span>}
        </p>
      </header>

      <div className="min-w-0 max-w-[68ch]">
        <p className="text-base leading-relaxed text-text md:text-[17px]">{entry.summary}</p>
        <ul className="mt-4 space-y-2.5">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-text/75">
              <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0" style={{ background: accent }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 font-mono text-xs leading-relaxed text-dim">
          <span className="sr-only">Stack: </span>
          {entry.stack.join(" · ")}
        </p>
      </div>
    </motion.article>
  );
}
