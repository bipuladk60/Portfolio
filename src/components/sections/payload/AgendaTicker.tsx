"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { EASE } from "../chautari/prng";

// Generic placeholder sessions: this illustrates the live agenda UI, not the real programme.
const SESSIONS = ["Registration", "Opening session", "Keynote", "Breakout sessions", "Speaker panel", "Poster hall", "Closing remarks"];
const STEP_MS = 2400;
const WINDOW = 4;

/** Agenda rows ticking forward live: the current session gets a progress bar, the list rolls up. */
export function AgendaTicker() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();
  const [now, setNow] = useState(1);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setNow((n) => n + 1), STEP_MS);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const rows = Array.from({ length: WINDOW }, (_, i) => {
    const abs = now - 1 + i;
    return { abs, title: SESSIONS[((abs % SESSIONS.length) + SESSIONS.length) % SESSIONS.length], status: i === 0 ? "Done" : i === 1 ? "Now" : "Next" };
  });

  return (
    <div ref={ref} className="flex h-full flex-col px-3 py-3 font-mono text-[10px]">
      <div className="mb-2 flex items-center gap-2 uppercase tracking-[0.14em] text-dim">
        <span className="led inline-block h-1.5 w-1.5 rounded-full bg-fire" />
        <span className="text-text">Live agenda</span>
        <span className="text-dim/60">· preview</span>
      </div>
      <ul className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((r) => (
            <motion.li
              key={r.abs}
              layout={!reduce}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE }}
              className={`relative mb-1 flex items-center gap-2 border px-2 py-[3px] ${r.status === "Now" ? "border-fire/50 bg-fire/5" : "border-line"}`}
            >
              <span
                className={`w-9 shrink-0 uppercase tracking-[0.1em] ${r.status === "Now" ? "text-fire" : r.status === "Done" ? "text-dim/50" : "text-dim"}`}
              >
                {r.status}
              </span>
              <span className={`truncate ${r.status === "Done" ? "text-dim/60 line-through decoration-line-hi" : "text-text/90"}`}>
                {r.title}
              </span>
              {r.status === "Now" && (
                <span
                  key={`bar-${now}`}
                  className={`absolute bottom-0 left-0 h-px bg-fire ${reduce ? "w-1/2" : "pb-progress"}`}
                  style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: inView ? "running" : "paused" }}
                />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
