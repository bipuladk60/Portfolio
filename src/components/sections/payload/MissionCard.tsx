"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "@/data/content";
import { GREEN, INK, ORANGE, RED, YELLOW } from "@/components/toon/toon";
import { EASE } from "../shared/prng";

type MissionCardProps = {
  project: Project;
  index: number;
  visual: ReactNode;
  large?: boolean;
  className?: string;
};

const TINTS = [YELLOW, "#a8d8ff", GREEN];
const TILTS = [-1.2, 0.9, -0.6];
const DOTS = [ORANGE, RED, GREEN];

/** A project as a Warmer sticker: live toon visual on top, copy below, extra bullets behind a pill expander. */
export function MissionCard({ project, index, visual, large = false, className = "" }: MissionCardProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const extraId = useId();

  const shown = project.bullets.slice(0, 2);
  const extra = project.bullets.slice(2);
  const tint = TINTS[index % TINTS.length];

  const bullet = (b: string, i: number) => (
    <li key={b} className="flex gap-2.5 text-[14px] font-semibold leading-snug">
      <span
        aria-hidden
        className="mt-[5px] inline-block h-2.5 w-2.5 shrink-0 rounded-full border-2"
        style={{ background: DOTS[i % DOTS.length], borderColor: INK }}
      />
      <span>{b}</span>
    </li>
  );

  return (
    <motion.li
      className={`list-none ${className}`}
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: TILTS[index % TILTS.length] }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 18, delay: index * 0.08 }}
    >
      <article data-cursor-box="" className="wr-sticker wr-wobble flex h-full flex-col overflow-hidden">
        <div
          aria-hidden
          className={`relative shrink-0 overflow-hidden border-b-[3px] ${large ? "h-64" : "h-44"}`}
          style={{ borderColor: INK, background: `color-mix(in oklab, ${tint} 22%, #ffffff)` }}
        >
          {visual}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="wr-pill inline-flex items-center px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider"
              style={{ background: tint, boxShadow: `2px 2px 0 ${INK}`, borderWidth: 2 }}
            >
              {project.kind}
            </span>
          </div>
          <h3 className={`wr-display mt-3 font-bold leading-none ${large ? "text-4xl" : "text-3xl"}`} style={{ color: INK }}>
            {project.title}
          </h3>
          <p className="mt-2 text-base font-bold leading-snug">{project.tagline}</p>

          <ul className="mt-3 space-y-1.5">{shown.map(bullet)}</ul>

          {extra.length > 0 && (
            <>
              <motion.div
                id={extraId}
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
                className="overflow-hidden"
                aria-hidden={!open}
                inert={!open}
              >
                <ul className="space-y-1.5 pt-1.5">{extra.map((b, i) => bullet(b, i + shown.length))}</ul>
              </motion.div>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={extraId}
                onClick={() => setOpen((o) => !o)}
                className="wr-pill wr-press mt-3 inline-flex min-h-9 w-fit cursor-pointer items-center gap-2 bg-white px-3 py-1 text-[13px] font-extrabold"
                style={{ boxShadow: `3px 3px 0 ${INK}` }}
              >
                <span aria-hidden className="wr-display inline-block w-3 text-center text-base leading-none">
                  {open ? "−" : "+"}
                </span>
                {open ? "Less" : `${extra.length} more ${extra.length === 1 ? "detail" : "details"}`}
              </button>
            </>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
            {project.stack.map((s) => (
              <span key={s} className="rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold" style={{ borderColor: INK }}>
                {s}
              </span>
            ))}
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="wr-pill wr-press wr-display ml-auto inline-flex min-h-9 items-center gap-2 px-3.5 py-1 text-sm font-bold"
                style={{ background: YELLOW }}
              >
                Source <span aria-hidden>↗</span>
                <span className="sr-only">for {project.title} on GitHub</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </motion.li>
  );
}
