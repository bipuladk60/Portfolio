"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useReveal } from "@/lib/reveal";
import type { Experience } from "@/data/content";
import { Surface } from "@/components/hud/Surface";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Company accent: the long-running parallel role is gold (the rope), the main-route roles are blue. */
export const roleAccent = (e: Experience) => (e.concurrent ? "var(--signal)" : "var(--sky)");

/**
 * One role as a single card (one level of containment): dates, company and role on the left; the
 * summary, every bullet and the stack line on the right. Lights up when the route reaches it.
 * Nothing waits behind hover; hover only lifts the card.
 */
export function RouteCard({ entry, lit }: { entry: Experience; lit: boolean }) {
  const reduce = useReducedMotion();
  const accent = roleAccent(entry);
  // Observe the unclipped wrapper: the closed clip below has zero area and would never report in view
  // if the visitor lands with the card's top edge already above the viewport.
  const wrap = useRef<HTMLDivElement>(null);
  const shown = useReveal(wrap, "0px 0px -12% 0px");
  const hidden = { opacity: 0, y: 22, clipPath: "inset(0% 0% 100% 0%)" };
  const open = { opacity: 1, y: 0, clipPath: "inset(-10% -6% -16% -6%)" };

  return (
    <div ref={wrap}>
      <motion.div
        initial={reduce ? false : hidden}
        animate={shown || reduce ? open : hidden}
        transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
      >
        <Surface as="article" accent={accent} corners lift>
          {/* Accent wash along the top edge that brightens when the route reaches this role */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-700"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent 70%)`, opacity: lit ? 1 : 0.25 }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(70% 90% at 0% 0%, color-mix(in oklab, ${accent} 11%, transparent), transparent 70%)`,
              opacity: lit ? 1 : 0,
            }}
          />

          <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[15rem_1fr] lg:gap-10">
            <header className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.06em]" style={{ color: accent }}>
                {entry.when}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold leading-tight text-text sm:text-2xl">{entry.company}</h3>
              <p className="mt-1.5 text-[15px] text-text/85">{entry.role}</p>
              <p className="mt-1 text-sm text-dim">{entry.where}</p>
              {entry.concurrent && (
                <p className="mt-3 flex items-start gap-2 text-sm leading-snug text-signal/90">
                  <span aria-hidden className="mt-[0.45em] inline-block h-2 w-3 shrink-0 border-y border-signal/80" />
                  Continued alongside the roles below
                </p>
              )}
            </header>

            <div className="min-w-0">
              <p className="text-base leading-relaxed text-text md:text-[17px]">{entry.summary}</p>
              <ul className="mt-4 space-y-2.5">
                {entry.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-text/75">
                    <span aria-hidden className="mt-[0.72em] h-px w-3 shrink-0" style={{ background: accent }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-mono text-[11px] leading-relaxed text-dim">
                <span className="sr-only">Stack: </span>
                {entry.stack.join(" · ")}
              </p>
            </div>
          </div>
        </Surface>
      </motion.div>
    </div>
  );
}
