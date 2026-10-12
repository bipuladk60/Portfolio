"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { EASE } from "../shared/prng";
import { INK, ORANGE } from "@/components/toon/toon";

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
    <div ref={ref} className="flex h-full flex-col px-3 py-3 text-[12px] font-extrabold" style={{ color: INK }}>
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-wider">
        <span className="led inline-block h-2 w-2 rounded-full border-2" style={{ background: ORANGE, borderColor: INK }} />
        <span>Live agenda</span>
        <span className="opacity-60">· preview</span>
      </div>
      <ul className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((r) => {
            const now_ = r.status === "Now";
            const done = r.status === "Done";
            return (
              <motion.li
                key={r.abs}
                layout={!reduce}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14 }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE }}
                className="relative mb-1.5 flex items-center gap-2 overflow-hidden rounded-xl border-2 bg-white px-2 py-[3px]"
                style={{ borderColor: INK, boxShadow: now_ ? `3px 3px 0 ${INK}` : "none", opacity: done ? 0.55 : 1 }}
              >
                <span
                  className="w-11 shrink-0 rounded-full border-2 text-center text-[9px] uppercase tracking-wider"
                  style={{ borderColor: INK, background: now_ ? ORANGE : done ? "#e6ebf2" : "#a8d8ff" }}
                >
                  {r.status}
                </span>
                <span className={`truncate ${done ? "line-through" : ""}`}>{r.title}</span>
                {now_ && (
                  <span
                    key={`bar-${now}`}
                    className={`absolute bottom-0 left-0 h-[3px] ${reduce ? "w-1/2" : "pb-progress"}`}
                    style={{ background: ORANGE, animationDuration: `${STEP_MS}ms`, animationPlayState: inView ? "running" : "paused" }}
                  />
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
