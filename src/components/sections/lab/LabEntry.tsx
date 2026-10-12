"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion, type Variants } from "motion/react";
import { EASE, useReducedMotionSafe } from "./motion";

type LabEntryProps = {
  /** Figure number, shared by the entry and its instrument ("01"). */
  n: string;
  /** Small mono line above the title: a date. */
  meta: ReactNode;
  title: string;
  /** Optional award, shown as a badge under the title. */
  award?: string;
  /** A short row of real numbers from content.ts (no boxes, hairline separators). */
  facts?: { label: string; value: string }[];
  /** Text column body: pitch, bullets, question... */
  children: ReactNode;
  stack?: string[];
  link?: { label: string; href: string };
  figure: { label: string; status: string; node: ReactNode };
};

const col: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * One Research & ML entry. All three entries share this exact layout, so the section reads as one
 * lab bench: text on the left, a framed instrument on the right with the same caption strip and corners.
 * Entry: the text column staggers in while the frame draws its corners, then the figure fades up.
 */
export function LabEntry({ n, meta, title, award, facts, children, stack, link, figure }: LabEntryProps) {
  const reduce = useReducedMotionSafe();
  const vp = { once: true, margin: "-12% 0px" } as const;
  return (
    <MotionConfig reducedMotion="user">
    <article className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <motion.div
        className="min-w-0 lg:col-span-5"
        variants={col}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={vp}
      >
        <motion.p variants={item} className="hud-label flex items-center gap-3">
          <span className="text-water">{n}</span>
          <span aria-hidden className="h-px w-6 bg-water/60" />
          <span>{meta}</span>
        </motion.p>
        <motion.h3
          variants={item}
          className="mt-3 font-display text-3xl font-semibold uppercase leading-[0.95] tracking-tight text-text sm:text-[2.1rem]"
        >
          {title}
        </motion.h3>
        {award && (
          <motion.p variants={item} className="mt-4">
            <AwardBadge text={award} />
          </motion.p>
        )}
        <motion.div variants={item} className="mt-4 text-base leading-relaxed text-text/90">
          {children}
        </motion.div>
        {facts && facts.length > 0 && (
          <motion.dl variants={item} className="mt-6 grid grid-cols-3 border-y border-line">
            {facts.map((f, i) => (
              <div key={f.label} className={`min-w-0 py-3 ${i ? "border-l border-line pl-3 sm:pl-4" : "pr-3"}`}>
                <dt className="font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-dim">{f.label}</dt>
                <dd className="mt-1.5 font-display text-xl font-semibold leading-none tabular-nums text-text sm:text-2xl">{f.value}</dd>
              </div>
            ))}
          </motion.dl>
        )}
        {(stack || link) && (
          <motion.div variants={item} className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            {stack && <p className="font-mono text-[11px] text-dim">{stack.join(" · ")}</p>}
            {link && (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 font-mono text-[11px] text-sky underline-offset-4 hover:underline"
              >
                {link.label}
                <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
            )}
          </motion.div>
        )}
      </motion.div>

      <div className="min-w-0 lg:col-span-7 lg:self-center">
        <Instrument n={n} label={figure.label} status={figure.status} reduce={reduce}>
          {figure.node}
        </Instrument>
      </div>
    </article>
    </MotionConfig>
  );
}

const CORNERS = [
  "left-0 top-0 border-l-2 border-t-2 origin-top-left",
  "right-0 top-0 border-r-2 border-t-2 origin-top-right",
  "left-0 bottom-0 border-l-2 border-b-2 origin-bottom-left",
  "right-0 bottom-0 border-r-2 border-b-2 origin-bottom-right",
];

/**
 * The framed figure: one hairline frame with a soft water-coloured glow behind it, corner accents that
 * draw in on entry and widen on hover, and a caption strip with the figure number and a live status.
 * The figure's own contents stay unboxed (hairlines and pills only), so this is the single container.
 */
export function Instrument({
  n,
  label,
  status,
  reduce,
  children,
}: {
  n: string;
  label: string;
  status: string;
  reduce: boolean;
  children: ReactNode;
}) {
  return (
    <motion.figure
      data-cursor-box="lock"
      className="group/fig relative border border-line transition-[border-color] duration-500 hover:border-[color-mix(in_oklab,var(--water)_32%,var(--line))]"
      style={{ background: "linear-gradient(180deg, color-mix(in oklab, var(--water) 5%, var(--panel)) 0%, color-mix(in oklab, var(--panel) 45%, transparent) 70%)" }}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* glow behind the frame; stays inside the column so it never widens the page */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[6%] -top-10 -z-10 h-3/4 opacity-70 transition-opacity duration-700 group-hover/fig:opacity-100"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 40%, color-mix(in oklab, var(--water) 13%, transparent), transparent 75%)" }}
      />
      {CORNERS.map((c, i) => (
        <motion.span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute -m-px h-2.5 w-2.5 border-water transition-[width,height] duration-300 [transition-timing-function:var(--ease-hud)] group-hover/fig:h-4 group-hover/fig:w-4 ${c}`}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: EASE }}
        />
      ))}
      <figcaption className="hud-label flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5">
        <span className="min-w-0">
          <span className="text-water">Fig. {n}</span> · {label}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span aria-hidden className="led h-1.5 w-1.5 rounded-full bg-water shadow-[0_0_6px_var(--water)]" />
          {status}
        </span>
      </figcaption>
      <motion.div
        className="p-4 md:p-5"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.figure>
  );
}

/** Award as a small badge: a medal glyph in signal amber and the award text. */
function AwardBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-signal/40 bg-signal/[0.08] py-1 pl-1.5 pr-3.5 text-[13px] leading-snug text-text">
      <span aria-hidden className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal/15 text-signal">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
          <path d="M5 1.5 L8 6 L11 1.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="8" cy="10" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8" cy="10" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span>
        <span className="sr-only">Award: </span>
        {text}
      </span>
    </span>
  );
}

/** Bullet list in the lab style: a short water-coloured dash per line. */
export function LabBullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-dim">
      {items.map((b) => (
        <li key={b} className="grid grid-cols-[0.9rem_1fr] gap-2">
          <span aria-hidden className="mt-[0.7rem] h-px w-2.5 bg-water" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}
