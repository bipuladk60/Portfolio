"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { EASE } from "../shared/prng";
import { GREEN, INK, ORANGE } from "@/components/toon/toon";

const WORDS = ["try", "trie", "tree", "type", "typo"];

type Node = { prefix: string; ch: string; parent: string | null; depth: number; x: number; y: number };

// Build the trie and lay it out: leaves evenly spaced, parents centred over children.
const NODES: Node[] = (() => {
  const children = new Map<string, string[]>([["", []]]);
  for (const w of WORDS) {
    for (let k = 1; k <= w.length; k++) {
      const p = w.slice(0, k);
      const parent = w.slice(0, k - 1);
      if (!children.has(p)) {
        children.set(p, []);
        children.get(parent)!.push(p);
      }
    }
  }
  const xs = new Map<string, number>();
  let leaf = 0;
  const leaves = [...children.values()].filter((c) => c.length === 0).length;
  const place = (p: string): number => {
    const kids = children.get(p)!;
    const x = kids.length === 0 ? 24 + (leaf++ * 172) / (leaves - 1) : kids.map(place).reduce((a, b) => a + b, 0) / kids.length;
    xs.set(p, Math.round(x * 10) / 10);
    return x;
  };
  place("");
  return [...children.keys()].map((p) => ({
    prefix: p,
    ch: p.slice(-1),
    parent: p === "" ? null : p.slice(0, -1),
    depth: p.length,
    x: xs.get(p)!,
    y: 12 + p.length * 24,
  }));
})();
const BY_PREFIX = new Map(NODES.map((n) => [n.prefix, n]));

// timeline: one frame per typed letter, a beat after each word, then a hold
type Frame = { w: number; k: number };
const TIMELINE: Frame[] = [];
WORDS.forEach((w, wi) => {
  for (let k = 1; k <= w.length; k++) TIMELINE.push({ w: wi, k });
  TIMELINE.push({ w: wi, k: w.length });
});
for (let i = 0; i < 6; i++) TIMELINE.push({ w: WORDS.length - 1, k: WORDS[WORDS.length - 1].length });
const FINAL = TIMELINE.length - 1;

/** A trie growing as words type out. Words are inserted one letter at a time; terminals get a ring. */
export function TrieGrow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % TIMELINE.length), 300);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  const frame = TIMELINE[reduce ? FINAL : tick];
  const visible = new Set<string>([""]);
  const terminal = new Set<string>();
  WORDS.forEach((w, wi) => {
    const upto = wi < frame.w ? w.length : wi === frame.w ? frame.k : 0;
    for (let k = 1; k <= upto; k++) visible.add(w.slice(0, k));
    if (upto === w.length) terminal.add(w);
  });
  const current = WORDS[frame.w].slice(0, frame.k);

  return (
    <div ref={ref} className="relative flex h-full items-center px-3 pb-2 pt-9">
      <p
        className="wr-pill wr-display absolute left-3 top-2.5 inline-flex min-w-[64px] items-center bg-white px-2.5 py-0.5 text-[13px] font-bold"
        style={{ color: INK, borderWidth: 2, boxShadow: `2px 2px 0 ${INK}` }}
      >
        {current}
        <span className="led ml-0.5 inline-block h-[13px] w-[3px] rounded-full" style={{ background: ORANGE }} />
      </p>
      <svg viewBox="0 0 220 132" className="mx-auto h-full max-h-[140px] w-full max-w-[300px]" overflow="visible">
        {NODES.filter((n) => n.parent !== null && visible.has(n.prefix)).map((n) => {
          const p = BY_PREFIX.get(n.parent!)!;
          return (
            <motion.line
              key={`e-${n.prefix}`}
              x1={p.x}
              y1={p.y}
              x2={n.x}
              y2={n.y}
              stroke={INK}
              strokeWidth="2.2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            />
          );
        })}
        {NODES.filter((n) => visible.has(n.prefix)).map((n) => {
          const active = n.prefix !== "" && current.startsWith(n.prefix);
          const done = terminal.has(n.prefix);
          return (
            <motion.g
              key={`n-${n.prefix}`}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 16 }}
            >
              {n.prefix !== "" && <circle cx={n.x + 1.5} cy={n.y + 1.5} r="8" fill={INK} />}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.prefix === "" ? 4 : 8}
                fill={n.prefix === "" ? INK : active ? ORANGE : done ? GREEN : "#ffffff"}
                stroke={INK}
                strokeWidth="2"
              />
              {n.ch && (
                <text
                  x={n.x}
                  y={n.y + 3.3}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="var(--font-fredoka), sans-serif"
                  fill={INK}
                >
                  {n.ch}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
