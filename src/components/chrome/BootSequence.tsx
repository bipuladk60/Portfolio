"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { EASE_HUD } from "@/lib/motion";
import { readSession, writeSession } from "@/lib/storage";
import { playBlip } from "@/lib/sound";
import styles from "./BootSequence.module.css";

const SESSION_KEY = "xc:boot";

// Runs before hydration: if the handshake already played this session, hide the overlay
// immediately so a reload never flashes it. Injects CSS only; touches no React-owned node.
const PRE_PAINT = `try{if(sessionStorage.getItem("${SESSION_KEY}")==="1"){var s=document.createElement("style");s.textContent="[data-boot-overlay]{display:none!important}";document.head.appendChild(s)}}catch(e){}`;

type Line = { text: string; delay: number; dur: number; tone?: string };

const LINES: Line[] = [
  { text: "> EXP-CTRL // GROUND STATION KTM", delay: 60, dur: 260 },
  { text: "> ACQUIRING SIGNAL..........", delay: 380, dur: 340 },
  { text: "> UPLINK KTM 27.7172N 85.3240E", delay: 740, dur: 240 },
  { text: ">     -> MS  31.33N  89.29W", delay: 960, dur: 200 },
  { text: "> HANDSHAKE  SYN / ACK  OK", delay: 1180, dur: 200 },
];

type Phase = "run" | "exit" | "gone";

export function BootSequence() {
  const [phase, setPhase] = useState<Phase>("run");
  const [fast, setFast] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (readSession(SESSION_KEY) === "1" || reduce) {
      setPhase("gone");
      return;
    }
    writeSession(SESSION_KEY, "1");
    playBlip("boot");

    // CSS started at first paint; align the lift-off with it rather than with hydration.
    const remaining = Math.max(280, 1900 - performance.now());
    const timer = window.setTimeout(() => setPhase((p) => (p === "run" ? "exit" : p)), remaining);

    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.metaKey || e.ctrlKey || e.altKey) && e.key !== "Escape") return;
      setFast(true);
      setPhase((p) => (p === "run" ? "exit" : p));
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
  }, []);

  if (phase === "gone") return null;

  const exiting = phase === "exit";
  const t = fast ? 0.42 : 0.72;
  const done = () => setPhase("gone");

  return (
    <div data-boot-overlay className={styles.root} aria-hidden="true">
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />

      {/* Two shutters that split along the horizon */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 border-b border-line bg-bg"
        initial={false}
        animate={{ y: exiting ? "-100%" : "0%" }}
        transition={{ duration: t, ease: EASE_HUD, delay: exiting ? t * 0.35 : 0 }}
        onAnimationComplete={() => exiting && done()}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 border-t border-line bg-bg"
        initial={false}
        animate={{ y: exiting ? "100%" : "0%" }}
        transition={{ duration: t, ease: EASE_HUD, delay: exiting ? t * 0.35 : 0 }}
      />
      {/* Seam flash at the split */}
      <motion.div
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-signal"
        initial={false}
        animate={exiting ? { opacity: [0, 1, 0], scaleX: [0.2, 1, 1] } : { opacity: 0, scaleX: 0.2 }}
        transition={{ duration: t * 0.9, ease: EASE_HUD }}
        style={{ boxShadow: "0 0 18px var(--signal)" }}
      />

      <motion.div
        className="hud-grid absolute inset-0 flex items-center justify-center px-5"
        initial={false}
        animate={exiting ? { opacity: 0, scaleY: 0.94, filter: "blur(2px)" } : { opacity: 1, scaleY: 1, filter: "blur(0px)" }}
        transition={{ duration: t * 0.45, ease: EASE_HUD }}
      >
        <div className="relative w-full max-w-2xl border border-line bg-bg/90 p-5 md:p-7" style={{ ["--accent" as string]: "var(--signal)" }}>
          <Corners />
          <div className="hud-label mb-5 flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-signal">
              <span className="led inline-block h-1.5 w-1.5 rounded-full bg-signal" />
              Ground station handshake
            </span>
            <span className="hidden sm:inline">CH 01 · KTM</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px] leading-relaxed text-dim sm:text-[13px]">
            {LINES.map((l) => (
              <span
                key={l.text}
                className={styles.line}
                style={{ "--n": l.text.length, "--delay": `${l.delay}ms`, "--dur": `${l.dur}ms` } as CSSProperties}
              >
                {l.text}
              </span>
            ))}
            <span className={`${styles.established} block text-water`}>
              {"> LINK ESTABLISHED"}
              <span className={`${styles.caret} ml-1 inline-block h-[1em] w-[0.6ch] translate-y-[2px] bg-water`} />
            </span>
          </div>

          <div className="mt-6">
            <div className="hud-label mb-2 flex justify-between">
              <span>Signal lock</span>
              <span>KTM → MS</span>
            </div>
            <div className="relative h-1.5 overflow-hidden border border-line">
              <div className={`${styles.bar} absolute inset-0 bg-signal`} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        initial={false}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <p className={`${styles.hint} hud-label whitespace-nowrap`}>press any key to skip</p>
      </motion.div>
    </div>
  );
}

function Corners() {
  const c = "pointer-events-none absolute h-3 w-3 border-signal";
  return (
    <>
      <span className={`${c} -left-px -top-px border-l-2 border-t-2`} />
      <span className={`${c} -right-px -top-px border-r-2 border-t-2`} />
      <span className={`${c} -bottom-px -left-px border-b-2 border-l-2`} />
      <span className={`${c} -bottom-px -right-px border-b-2 border-r-2`} />
    </>
  );
}
