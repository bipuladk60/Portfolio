"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Panel } from "@/components/hud/Panel";
import { skills } from "@/data/content";
import { EASE } from "../shared/prng";

const WATER = "var(--water)";
const STEP_MS = 60;

// global sequence index of the first item in each group
const OFFSETS = skills.reduce<number[]>((acc, g, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + skills[i - 1].items.length);
  return acc;
}, []);
const TOTAL = skills.reduce((n, g) => n + g.items.length, 0);

function Item({ name, go }: { name: string; go: boolean }) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 border px-2 py-[3px] text-[13px] transition-colors duration-300 ${
        go ? "border-water/45 text-text" : "border-line text-dim/70"
      }`}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300"
        style={{ background: go ? WATER : "var(--line-hi)" }}
      />
      {name}
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={go ? "go" : "sb"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: EASE }}
          className={`font-mono text-[9px] tracking-[0.12em] ${go ? "text-water" : "text-dim/50"}`}
        >
          {go ? "GO" : "STBY"}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{go ? ", go" : ", standby"}</span>
    </li>
  );
}

/** Each skills group is a console column; items flip STANDBY to GO in sequence when the camp scrolls into view. */
export function LaunchChecklist() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const [go, setGo] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setGo(TOTAL);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setGo(n);
      if (n >= TOTAL) window.clearInterval(id);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const done = go >= TOTAL;

  return (
    <div ref={ref}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y border-line py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
        <span className="text-dim">Go / no-go poll</span>
        <span aria-hidden className={done ? "text-water" : "text-dim"}>
          Checks {String(go).padStart(2, "0")}/{TOTAL}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {skills.map((g, gi) => {
          const start = OFFSETS[gi];
          const groupGo = Math.max(0, Math.min(g.items.length, go - start));
          const state = groupGo === g.items.length ? "GO" : groupGo > 0 ? "POLLING" : "STANDBY";
          return (
            <motion.div
              key={g.group}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: gi * 0.06 }}
            >
              <Panel
                label={`Console ${String(gi + 1).padStart(2, "0")}`}
                accent={state === "GO" ? WATER : "var(--line-hi)"}
                className="h-full px-4 pb-4 pt-5 transition-colors duration-500"
              >
                <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-text">{g.group}</h3>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em]">
                    <span className="text-dim">
                      {groupGo}/{g.items.length}
                    </span>{" "}
                    <span className={state === "GO" ? "text-water" : state === "POLLING" ? "text-signal" : "text-dim/60"}>
                      {state}
                    </span>
                  </span>
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {g.items.map((item, ii) => (
                    <Item key={item} name={item} go={start + ii < go} />
                  ))}
                </ul>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      {/* final banner */}
      <div className="mt-5 min-h-[58px]">
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border border-water/60 bg-water/5 px-5 py-3 text-center"
            >
              <p className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-water md:text-4xl">All systems go</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
                {TOTAL} of {TOTAL} checks · {skills.length} consoles green
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p role="status" className="sr-only">
        {done ? `All systems go. ${TOTAL} of ${TOTAL} checks passed.` : ""}
      </p>
    </div>
  );
}
