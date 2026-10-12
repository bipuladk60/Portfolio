"use client";

import { motion } from "motion/react";
import type { Hackathon } from "@/data/content";
import { EASE } from "./motion";

/** Embroidered expedition patch: hexagon for summits, shield for attempts. */
export function Patch({
  h,
  index,
  active,
  dim,
  reduce,
  onSelect,
}: {
  h: Hackathon;
  index: number;
  active: boolean;
  dim: boolean;
  reduce: boolean;
  onSelect: () => void;
}) {
  const isWin = h.result === "win";
  const color = isWin ? "var(--signal)" : "var(--sky)";
  const outline = isWin
    ? "M40 3 L73 22 L73 60 L40 79 L7 60 L7 22 Z"
    : "M40 4 L72 14 L72 44 C72 62 58 73 40 80 C22 73 8 62 8 44 L8 14 Z";
  const inner = isWin
    ? "M40 10 L67 25.5 L67 56.5 L40 72 L13 56.5 L13 25.5 Z"
    : "M40 10 L66 18.5 L66 44 C66 58 55 67 40 73 C25 67 14 58 14 44 L14 18.5 Z";

  return (
    <motion.li
      className="w-[148px] shrink-0 snap-start sm:w-auto"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={reduce ? { duration: 0 } : { delay: index * 0.06, duration: 0.45, ease: EASE }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`${h.event}: ${isWin ? h.award : "competed, data gathered"}. Show expedition report.`}
        className="group relative flex h-full w-full cursor-pointer flex-col items-center gap-2 border px-3 pb-3 pt-4 text-center transition-[opacity,border-color,background-color] duration-300"
        style={{
          opacity: dim ? 0.3 : 1,
          borderColor: active ? color : "var(--line)",
          background: active ? `color-mix(in oklab, ${color} 7%, var(--panel))` : "var(--panel)",
        }}
      >
        <svg
          viewBox="0 0 80 84"
          className="h-16 w-16 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
          aria-hidden
        >
          <path d={outline} fill={`color-mix(in oklab, ${color} 16%, var(--bg))`} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          {/* stitching */}
          <path d={inner} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2.2 2.2" opacity="0.75" />
          {isWin ? (
            <g>
              <path d="M22 58 L36 34 L44 46 L50 38 L60 58 Z" fill="var(--panel-2)" stroke="var(--text)" strokeWidth="1.2" strokeLinejoin="round" />
              <line x1="36" y1="34" x2="36" y2="18" stroke="var(--text)" strokeWidth="1.4" />
              <path d="M36 18 L48 21.5 L36 25 Z" fill={color} />
            </g>
          ) : (
            <g>
              <path d="M22 58 L36 34 L44 46 L50 38 L60 58 Z" fill="var(--panel-2)" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M28 47 L36 34" stroke={color} strokeWidth="1.4" strokeDasharray="2 2" />
              <path d="M24 26 L30 31 L36 26" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
          <text x="40" y="70" textAnchor="middle" fontSize="7" fontFamily="var(--font-jetbrains), monospace" fill={color} letterSpacing="1">
            {String(index + 1).padStart(2, "0")}
          </text>
        </svg>
        <span className="font-display text-sm font-semibold uppercase leading-tight tracking-wide text-text">{h.event}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color }}>
          {isWin ? "Summit" : "Competed"} · {h.when}
        </span>
      </button>
    </motion.li>
  );
}
