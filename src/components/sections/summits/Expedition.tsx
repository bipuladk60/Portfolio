"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { hackathons } from "@/data/content";
import { Panel } from "@/components/hud/Panel";
import { Ridge } from "./Ridge";
import { Report } from "./Report";
import { Patch } from "./Patch";
import { EASE, useReducedMotionSafe } from "./motion";

export type Filter = "all" | "win" | "participant";

const wins = hackathons.filter((h) => h.result === "win");
const SUMMITS = wins.length;
const ATTEMPTS = hackathons.length;
const COMPETED = ATTEMPTS - SUMMITS;
const DEFAULT_ID = (wins[wins.length - 1] ?? hackathons[hackathons.length - 1]).id;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "win", label: "Summits" },
  { id: "participant", label: "Competed" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export function Expedition() {
  const reduce = useReducedMotionSafe();
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const [filter, setFilter] = useState<Filter>("all");

  const matches = (r: Filter) => filter === "all" || filter === r;
  const index = Math.max(0, hackathons.findIndex((h) => h.id === selectedId));
  const selected = hackathons[index];

  const changeFilter = (f: Filter) => {
    setFilter(f);
    // keep the report in sync: jump to the latest matching expedition if the current one is filtered out
    if (f !== "all" && selected.result !== f) {
      const latest = [...hackathons].reverse().find((h) => h.result === f);
      if (latest) setSelectedId(latest.id);
    }
  };

  return (
    <div>
      {/* scoreboard + filter */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <Panel label="Scoreboard" accent="var(--signal)" className="lg:col-span-7">
          <div className="grid grid-cols-2 divide-x divide-line">
            <Score label="Summits" value={SUMMITS} color="var(--signal)" note="Awards won" reduce={reduce} delay={0} />
            <Score label="Attempts" value={ATTEMPTS} color="var(--text)" note={`${pad(SUMMITS)} summits · ${pad(COMPETED)} competed`} reduce={reduce} delay={0.12} />
          </div>
        </Panel>

        <div className="lg:col-span-5">
          <p id="summit-filter-label" className="hud-label mb-3">
            Filter the ridge
          </p>
          <div role="group" aria-labelledby="summit-filter-label" className="grid grid-cols-3 border border-line bg-panel/60 p-1">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              const tone = f.id === "participant" ? "var(--sky)" : "var(--signal)";
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => changeFilter(f.id)}
                  className="relative cursor-pointer px-2 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors sm:text-xs"
                  style={{ color: on ? "var(--bg)" : "var(--text-dim)" }}
                >
                  {on && (
                    <motion.span
                      layoutId="summit-filter-pill"
                      aria-hidden
                      className="absolute inset-0"
                      style={{ background: tone }}
                      transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                    />
                  )}
                  <span className="relative">
                    {f.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Ridge items={hackathons} selectedId={selectedId} filter={filter} onSelect={setSelectedId} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <Report h={selected} index={index} total={ATTEMPTS} reduce={reduce} />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <p className="hud-label mb-3">Expedition patches</p>
          <ul
            className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-2"
            aria-label="Expedition patches"
          >
            {hackathons.map((h, i) => (
              <Patch
                key={h.id}
                h={h}
                index={i}
                active={h.id === selectedId}
                dim={!matches(h.result)}
                reduce={reduce}
                onSelect={() => setSelectedId(h.id)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Score({
  label,
  value,
  color,
  note,
  reduce,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  note: string;
  reduce: boolean;
  delay: number;
}) {
  return (
    <div className="px-5 py-5 sm:px-7 sm:py-6">
      <p className="hud-label">{label}</p>
      <p className="mt-2 flex items-baseline font-display text-6xl font-bold leading-none tracking-tight sm:text-7xl" style={{ color }}>
        <span className="sr-only">{value}</span>
        {pad(value)
          .split("")
          .map((d, i) => (
            <span key={i} aria-hidden className="inline-block overflow-hidden">
              <motion.span
                className="inline-block"
                initial={{ y: "100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={reduce ? { duration: 0 } : { delay: delay + i * 0.08, duration: 0.6, ease: EASE }}
              >
                {d}
              </motion.span>
            </span>
          ))}
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-dim">{note}</p>
    </div>
  );
}
