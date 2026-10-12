"use client";

import { useState } from "react";
import { motion } from "motion/react";
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

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "win", label: "Wins" },
  { id: "participant", label: "Competed" },
];

/** Scoreboard + filter, the ridge with a plain list of events under it, and the selected event beside it. */
export function Expedition() {
  const reduce = useReducedMotionSafe();
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const [filter, setFilter] = useState<Filter>("all");

  const matches = (r: Filter) => filter === "all" || filter === r;
  const index = Math.max(0, hackathons.findIndex((h) => h.id === selectedId));
  const selected = hackathons[index];

  const changeFilter = (f: Filter) => {
    setFilter(f);
    // keep the detail in sync: jump to the latest matching hackathon if the current one is filtered out
    if (f !== "all" && selected.result !== f) {
      const latest = [...hackathons].reverse().find((h) => h.result === f);
      if (latest) setSelectedId(latest.id);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="flex items-baseline gap-3 font-display text-2xl font-semibold text-text sm:text-3xl">
          <Count value={WINS} color="var(--signal)" reduce={reduce} delay={0} />
          <span className="text-dim">{WINS === 1 ? "win" : "wins"}</span>
          <span aria-hidden className="text-line-hi">·</span>
          <Count value={TOTAL} color="var(--text)" reduce={reduce} delay={0.12} />
          <span className="text-dim">hackathons</span>
        </p>
        <div role="group" aria-label="Filter hackathons" className="flex gap-1 self-start sm:self-auto">
          {FILTERS.map((f) => {
            const on = filter === f.id;
            const tone = f.id === "participant" ? "var(--sky)" : "var(--signal)";
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => changeFilter(f.id)}
                className="relative cursor-pointer px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors hover:text-text"
                style={{ color: on ? "var(--bg)" : "var(--text-dim)" }}
              >
                {on && (
                  <motion.span
                    layoutId="hackathon-filter-pill"
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: tone }}
                    transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-14">
        <div className="min-w-0 lg:col-span-7">
          <Ridge items={hackathons} selectedId={selectedId} filter={filter} onSelect={setSelectedId} />
          <ul className="mt-8 grid grid-cols-2 gap-x-6 sm:grid-cols-3" aria-label="All hackathons">
            {hackathons.map((h) => (
              <Patch
                key={h.id}
                h={h}
                active={h.id === selectedId}
                dim={!matches(h.result)}
                onSelect={() => setSelectedId(h.id)}
              />
            ))}
          </ul>
        </div>
        <div className="min-w-0 lg:col-span-5">
          <Report h={selected} reduce={reduce} />
        </div>
      </div>
    </div>
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
