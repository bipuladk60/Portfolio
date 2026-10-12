"use client";

import { motion } from "motion/react";
import type { Hackathon } from "@/data/content";
import { ResultGlyph } from "./Markers";
import { EASE } from "./motion";

/**
 * One compact card under the ridge: glyph, event and date. Selection and hover are shared with the
 * ridge markers, so hovering a card lifts its flag and a sliding accent marks the selected one.
 */
export function Patch({
  h,
  index,
  active,
  peek,
  dim,
  reduce,
  onSelect,
  onHover,
}: {
  h: Hackathon;
  index: number;
  active: boolean;
  peek: boolean;
  dim: boolean;
  reduce: boolean;
  onSelect: () => void;
  onHover: (on: boolean) => void;
}) {
  const isWin = h.result === "win";
  const color = isWin ? "var(--signal)" : "var(--sky)";
  const year = h.when.split(" ").pop();

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={reduce ? { duration: 0 } : { delay: 0.5 + index * 0.06, duration: 0.45, ease: EASE }}
    >
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-pressed={active}
        aria-label={`${h.event}: ${isWin ? `win, ${h.award}` : "competed"}. Show details.`}
        className={`group relative flex h-full w-full cursor-pointer items-start gap-2.5 overflow-hidden border px-3 py-2.5 text-left transition-[transform,opacity,border-color,background-color] duration-300 [transition-timing-function:var(--ease-hud)] sm:px-3.5 ${
          active
            ? "border-[color-mix(in_oklab,var(--c)_55%,transparent)] bg-[color-mix(in_oklab,var(--c)_10%,var(--panel))]"
            : peek
              ? "-translate-y-0.5 border-[color-mix(in_oklab,var(--c)_40%,transparent)] bg-[color-mix(in_oklab,var(--c)_5%,var(--panel))]"
              : "border-line bg-panel/50 hover:-translate-y-0.5"
        }`}
        style={{ ["--c" as string]: color, opacity: dim ? 0.35 : 1 }}
      >
        {active && (
          <motion.span
            layoutId="hackathon-card-accent"
            aria-hidden
            className="absolute inset-x-0 top-0 h-[2px]"
            style={{ background: color }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE }}
          />
        )}
        <ResultGlyph
          win={isWin}
          className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${active || peek ? "-rotate-6 scale-110" : ""}`}
        />
        <span className="min-w-0" style={{ color }}>
          <span className={`block text-sm leading-snug transition-colors ${active ? "text-text" : "text-text/75 group-hover:text-text"}`}>
            {h.event}
          </span>
          <span className="mt-0.5 block font-mono text-[11px] tracking-[0.06em]">
            {isWin ? "Win" : "Competed"}
            <span className="hidden text-dim min-[420px]:inline"> · {year}</span>
          </span>
        </span>
      </button>
    </motion.li>
  );
}
