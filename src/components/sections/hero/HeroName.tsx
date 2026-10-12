"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>[]=+";
const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Scrambles to the final word once, left to right. Starts from the final string so SSR and first paint match. */
function useDecode(word: string, delay: number, duration: number, enabled: boolean) {
  const [shown, setShown] = useState(word);
  useEffect(() => {
    if (!enabled) {
      setShown(word);
      return;
    }
    let raf = 0;
    let start = 0;
    const scramble = (settled: number) =>
      word
        .split("")
        .map((ch, i) => (i < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join("");
    setShown(scramble(0));
    const timer = window.setTimeout(() => {
      const tick = (t: number) => {
        if (!start) start = t;
        const p = Math.min(1, (t - start) / duration);
        setShown(p < 1 ? scramble(Math.floor(p * word.length)) : word);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [word, delay, duration, enabled]);
  return shown;
}

function NameLine({ word, delay, reduce }: { word: string; delay: number; reduce: boolean }) {
  const shown = useDecode(word, delay, 700, !reduce);
  const base = "absolute left-0 top-0 whitespace-nowrap";
  return (
    <motion.span
      className="relative block w-fit"
      initial={{ clipPath: "inset(-12% 100% -12% -3%)" }}
      animate={{ clipPath: "inset(-12% -3% -12% -3%)" }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay / 1000 - 0.15, ease: EASE }}
    >
      {/* Sizing layer: the final word reserves the box so the scramble never shifts layout */}
      <span className="invisible whitespace-nowrap">{word}</span>
      {/* Chromatic fringe: two offset colour copies behind the main glyphs */}
      <motion.span
        className={`${base} text-fire/20 mix-blend-screen`}
        animate={{ x: -1 }}
        transition={{ duration: 0 }}
      >
        {shown}
      </motion.span>
      <motion.span
        className={`${base} text-sky/20 mix-blend-screen`}
        animate={{ x: 1 }}
        transition={{ duration: 0 }}
      >
        {shown}
      </motion.span>
      {/* Main layer with a slow light sheen travelling across */}
      <motion.span
        className={`${base} bg-clip-text text-transparent`}
        style={{
          backgroundImage:
            "linear-gradient(100deg, var(--text) 0%, var(--text) 42%, #fffaf0 48%, var(--signal) 50%, var(--text) 56%, var(--text) 100%)",
          backgroundSize: "250% 100%",
          WebkitBackgroundClip: "text",
        }}
        initial={{ backgroundPosition: "100% 0" }}
        animate={reduce ? { backgroundPosition: "100% 0" } : { backgroundPosition: ["100% 0", "-50% 0"] }}
        transition={{ duration: 2.4, delay: delay / 1000 + 1, repeat: Infinity, repeatDelay: 10, ease: "easeInOut" }}
      >
        {shown}
      </motion.span>
      {/* Scanlines clipped to the glyph shapes */}
      <span
        className={`${base} bg-clip-text text-transparent`}
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 3px, rgba(10,13,18,0.18) 3px 4px)",
          WebkitBackgroundClip: "text",
        }}
      >
        {shown}
      </span>
    </motion.span>
  );
}

/** BIPUL / ADHIKARI as the page's h1. Real name is in the DOM; the decode layers are aria-hidden. */
export function HeroName({ first, last, className = "" }: { first: string; last: string; className?: string }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <h1 className={`font-display font-bold uppercase leading-[0.84] tracking-[-0.02em] ${className}`}>
      <span className="sr-only">
        {first} {last}
      </span>
      <span aria-hidden className="flex flex-col">
        <NameLine word={first.toUpperCase()} delay={300} reduce={reduce} />
        <NameLine word={last.toUpperCase()} delay={450} reduce={reduce} />
      </span>
    </h1>
  );
}
