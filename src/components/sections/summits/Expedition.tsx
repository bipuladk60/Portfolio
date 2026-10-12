"use client";

import { useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { hackathons } from "@/data/content";
import { Ridge } from "./Ridge";
import { Report } from "./Report";
import { Patch } from "./Patch";
import { EASE, useReducedMotionSafe } from "./motion";

export type Filter = "all" | "win" | "participant";

const wins = hackathons.filter((h) => h.result === "win");
const WINS = wins.length;
const TOTAL = hackathons.length;
const DEFAULT_ID = (wins[wins.length - 1] ?? hackathons[hackathons.length - 1]).id;

const FILTERS: { id: Filter; label: string; n: number }[] = [
  { id: "all", label: "All", n: TOTAL },
  { id: "win", label: "Wins", n: WINS },
  { id: "participant", label: "Competed", n: TOTAL - WINS },
];

/** Scoreboard + filter, the night ridge with a card per event under it, and the selected event's card beside it. */
export function Expedition() {
  const reduce = useReducedMotionSafe();
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const [filter, setFilter] = useState<Filter>("all");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const matches = (r: Filter) => filter === "all" || filter === r;
  const index = Math.max(0, hackathons.findIndex((h) => h.id === selectedId));
  const selected = hackathons[index];

  // previous / next through the events the filter shows, wrapping around
  const visible = hackathons.filter((h) => matches(h.result));
  const vIndex = Math.max(0, visible.findIndex((h) => h.id === selectedId));
  const step = (dir: -1 | 1) => setSelectedId(visible[(vIndex + dir + visible.length) % visible.length].id);

  const changeFilter = (f: Filter) => {
    setFilter(f);
    // keep the detail in sync: jump to the latest matching hackathon if the current one is filtered out
    if (f !== "all" && selected.result !== f) {
      const latest = [...hackathons].reverse().find((h) => h.result === f);
      if (latest) setSelectedId(latest.id);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="flex items-baseline gap-3 font-display text-2xl font-semibold text-text sm:text-3xl">
          <Count value={WINS} color="var(--signal)" reduce={reduce} delay={0} />
          <span className="text-dim">{WINS === 1 ? "win" : "wins"}</span>
          <span aria-hidden className="text-line-hi">·</span>
          <Count value={TOTAL} color="var(--text)" reduce={reduce} delay={0.12} />
          <span className="text-dim">hackathons</span>
        </p>
        <div
          role="group"
          aria-label="Filter hackathons"
          className="relative inline-flex self-start border border-line bg-panel/60 p-1 sm:self-auto"
        >
          {FILTERS.map((f) => {
            const on = filter === f.id;
            const tone = f.id === "participant" ? "var(--sky)" : "var(--signal)";
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => changeFilter(f.id)}
                className="relative flex min-h-9 cursor-pointer items-center gap-2 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-300 hover:text-text"
                style={{ color: on ? "var(--bg)" : "var(--text-dim)" }}
              >
                {on && (
                  <motion.span
                    layoutId="hackathon-filter-pill"
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: tone, boxShadow: `0 0 18px color-mix(in oklab, ${tone} 35%, transparent)` }}
                    transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                  />
                )}
                <span className="relative">{f.label}</span>
                <span className="relative tabular-nums" style={{ opacity: on ? 0.7 : 0.55 }}>
                  {f.n}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <Ridge
            items={hackathons}
            selectedId={selectedId}
            hoverId={hoverId}
            filter={filter}
            onSelect={setSelectedId}
            onHover={setHoverId}
          />
          <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3" aria-label="All hackathons">
            {hackathons.map((h, i) => (
              <Patch
                key={h.id}
                h={h}
                index={i}
                active={h.id === selectedId}
                peek={h.id === hoverId}
                dim={!matches(h.result)}
                reduce={reduce}
                onSelect={() => setSelectedId(h.id)}
                onHover={(on) => setHoverId((cur) => (on ? h.id : cur === h.id ? null : cur))}
              />
            ))}
          </ul>
        </div>
        <div className="min-w-0 lg:col-span-5">
          <Report h={selected} position={index + 1} total={TOTAL} reduce={reduce} onStep={step} />
        </div>
      </div>
    </MotionConfig>
  );
}

function Count({ value, color, reduce, delay }: { value: number; color: string; reduce: boolean; delay: number }) {
  return (
    <span className="inline-flex overflow-hidden text-4xl font-bold leading-none sm:text-5xl" style={{ color }}>
      <span className="sr-only">{value}</span>
      <motion.span
        aria-hidden
        className="inline-block"
        initial={{ y: "100%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true }}
        transition={reduce ? { duration: 0 } : { delay, duration: 0.6, ease: EASE }}
      >
        {value}
      </motion.span>
    </span>
  );
}
