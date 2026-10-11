"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { EASE } from "../chautari/prng";

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
    <div ref={ref} className="relative flex h-full items-center px-3 py-2">
      <p className="absolute left-3 top-2 font-mono text-[11px] text-text">
        <span className="text-dim">&gt; </span>
        {current}
        <span className="led ml-px inline-block h-[11px] w-[6px] translate-y-[2px] bg-fire" />
      </p>
      <svg viewBox="0 0 220 120" className="mx-auto h-full max-h-[130px] w-full max-w-[280px]">
        {NODES.filter((n) => n.parent !== null && visible.has(n.prefix)).map((n) => {
          const p = BY_PREFIX.get(n.parent!)!;
          return (
            <motion.line
              key={`e-${n.prefix}`}
              x1={p.x}
              y1={p.y}
              x2={n.x}
              y2={n.y}
              stroke="#2E4052"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            />
          );
        })}
        {NODES.filter((n) => visible.has(n.prefix)).map((n) => {
          const active = n.prefix !== "" && current.startsWith(n.prefix);
          return (
            <motion.g
              key={`n-${n.prefix}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              {terminal.has(n.prefix) && <circle cx={n.x} cy={n.y} r="9.5" fill="none" stroke="#FF5C5C" strokeWidth="0.8" />}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.prefix === "" ? 3 : 7}
                fill={active ? "#FF5C5C" : "#10151C"}
                stroke={active ? "#FF5C5C" : "#2E4052"}
              />
              {n.ch && (
                <text
                  x={n.x}
                  y={n.y + 3}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontFamily="var(--font-jetbrains), monospace"
                  fill={active ? "#0A0D12" : "#E9E5DA"}
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
