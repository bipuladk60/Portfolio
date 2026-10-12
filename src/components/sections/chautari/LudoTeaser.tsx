"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { playBlip } from "@/lib/sound";
import { EASE } from "./prng";

const RED = "#FF5C5C";
const GREEN = "#34C98A";
const YELLOW = "#F2B418";
const BLUE = "#4C8DFF";

/** The 52-square outer loop of a 15x15 Ludo board, starting on red's start square. */
function buildTrack(): [number, number][] {
  const t: [number, number][] = [];
  for (let x = 1; x <= 5; x++) t.push([x, 6]);
  for (let y = 5; y >= 0; y--) t.push([6, y]);
  t.push([7, 0]);
  for (let y = 0; y <= 5; y++) t.push([8, y]);
  for (let x = 9; x <= 14; x++) t.push([x, 6]);
  t.push([14, 7]);
  for (let x = 14; x >= 9; x--) t.push([x, 8]);
  for (let y = 9; y <= 14; y++) t.push([8, y]);
  t.push([7, 14]);
  for (let y = 14; y >= 9; y--) t.push([6, y]);
  for (let x = 5; x >= 0; x--) t.push([x, 8]);
  t.push([0, 7], [0, 6]);
  return t;
}

const TRACK = buildTrack();
const C = 10; // cell size in viewBox units

const ARM_CELLS: [number, number][] = [];
for (let y = 0; y < 15; y++) {
  for (let x = 0; x < 15; x++) {
    const inArm = (x >= 6 && x <= 8) || (y >= 6 && y <= 8);
    const inCenter = x >= 6 && x <= 8 && y >= 6 && y <= 8;
    if (inArm && !inCenter) ARM_CELLS.push([x, y]);
  }
}

function cellFill(x: number, y: number): string | null {
  if (y === 7 && x >= 1 && x <= 5) return RED;
  if (x === 7 && y >= 1 && y <= 5) return GREEN;
  if (y === 7 && x >= 9 && x <= 13) return YELLOW;
  if (x === 7 && y >= 9 && y <= 13) return BLUE;
  if (x === 1 && y === 6) return RED;
  if (x === 8 && y === 1) return GREEN;
  if (x === 13 && y === 8) return YELLOW;
  if (x === 6 && y === 13) return BLUE;
  return null;
}

const HOMES = [
  { x: 0, y: 0, color: RED, filled: false },
  { x: 90, y: 0, color: GREEN, filled: true },
  { x: 90, y: 90, color: YELLOW, filled: true },
  { x: 0, y: 90, color: BLUE, filled: true },
];

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DieFace({ value }: { value: number }) {
  return (
    <span className="ch-die-face relative grid h-full w-full grid-cols-3 grid-rows-3 gap-[3px] rounded-[10px] border border-[#d9ccb4] bg-[#f3eadb] p-[9px] shadow-[inset_0_-4px_0_rgba(0,0,0,0.12),0_6px_18px_rgba(0,0,0,0.45)]">
      {value === 0 && (
        <span className="absolute inset-[10px] rounded-[5px] border border-dashed border-[#b9a98c]" />
      )}
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="m-auto h-[9px] w-[9px] rounded-full"
          style={{
            background: (PIPS[value] ?? []).includes(i) ? (value === 1 ? "#c8322b" : "#1c130e") : "transparent",
          }}
        />
      ))}
    </span>
  );
}

const HOP_MS = 240;

export function LudoTeaser({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  const [face, setFace] = useState(0); // 0 = blank until the first throw
  const [pos, setPos] = useState(0);
  const [hop, setHop] = useState(0);
  const [spin, setSpin] = useState(0);
  const [rolls, setRolls] = useState(0);
  const [busy, setBusy] = useState(false);
  const [announce, setAnnounce] = useState("");
  const timers = useRef<number[]>([]);
  const posRef = useRef(0);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const finish = (v: number, to: number) => {
    setBusy(false);
    setRolls((r) => r + 1);
    setAnnounce(
      `Rolled a ${v}. The red goti moves ${v} square${v === 1 ? "" : "s"} to square ${to + 1} of 52.${v === 6 ? " A six earns another throw." : ""}`,
    );
  };

  const roll = () => {
    if (busy) return;
    playBlip("click");
    const v = 1 + Math.floor(Math.random() * 6);
    const from = posRef.current;
    const to = (from + v) % TRACK.length;
    posRef.current = to;
    setBusy(true);
    setAnnounce("");

    if (reduce) {
      setFace(v);
      setPos(to);
      finish(v, to);
      return;
    }

    setSpin((s) => s + 1);
    // tumble: flick through faces, then settle
    const flicks = 7;
    for (let i = 0; i < flicks; i++) {
      later(() => setFace(1 + Math.floor(Math.random() * 6)), i * 75);
    }
    const settle = flicks * 75;
    later(() => setFace(v), settle);
    // goti hops one square at a time
    for (let s = 1; s <= v; s++) {
      later(() => {
        setPos((from + s) % TRACK.length);
        setHop((h) => h + 1);
      }, settle + 120 + (s - 1) * HOP_MS);
    }
    later(() => finish(v, to), settle + 120 + v * HOP_MS);
  };

  const [gx, gy] = TRACK[pos];
  const cx = gx * C + C / 2;
  const cy = gy * C + C / 2;

  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:gap-6">
      {/* board vignette */}
      <svg
        viewBox="-4 -4 158 158"
        className={`block h-auto w-full justify-self-center ${compact ? "max-w-[190px]" : "max-w-[380px]"}`}
        aria-hidden
        data-cursor-box=""
      >
        <rect x="-4" y="-4" width="158" height="158" rx="6" fill="#2a1912" stroke="#5a3a26" />
        <rect x="0" y="0" width="150" height="150" fill="#efe4cf" />
        {HOMES.map((h) => (
          <g key={h.color}>
            <rect x={h.x} y={h.y} width="60" height="60" fill={h.color} opacity="0.85" />
            <rect x={h.x + 10} y={h.y + 10} width="40" height="40" fill="#f7efe0" />
            {[
              [20, 20],
              [40, 20],
              [20, 40],
              [40, 40],
            ].map(([ox, oy], k) => (
              <g key={k}>
                <circle cx={h.x + ox} cy={h.y + oy} r="5.2" fill="none" stroke={h.color} strokeWidth="1.4" />
                {(h.filled || k > 0) && (
                  <circle cx={h.x + ox} cy={h.y + oy} r="3.6" fill={h.color} stroke="#1c130e" strokeWidth="0.8" />
                )}
              </g>
            ))}
          </g>
        ))}
        {ARM_CELLS.map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x * C}
            y={y * C}
            width={C}
            height={C}
            fill={cellFill(x, y) ?? "#f7efe0"}
            fillOpacity={cellFill(x, y) ? 0.85 : 1}
            stroke="#8a6a4e"
            strokeWidth="0.5"
          />
        ))}
        <polygon points="60,60 60,90 75,75" fill={RED} />
        <polygon points="60,60 90,60 75,75" fill={GREEN} />
        <polygon points="90,60 90,90 75,75" fill={YELLOW} />
        <polygon points="60,90 90,90 75,75" fill={BLUE} />

        {/* the travelling goti */}
        <motion.g
          initial={false}
          animate={{ x: cx, y: cy }}
          transition={reduce ? { duration: 0 } : { duration: HOP_MS / 1000, ease: EASE }}
        >
          <ellipse cx="0" cy="3.4" rx="3.6" ry="1.3" fill="#000" opacity="0.3" />
          <motion.g
            key={hop}
            initial={{ y: 0 }}
            animate={reduce ? { y: 0 } : { y: [0, -7, 0] }}
            transition={{ duration: HOP_MS / 1000, ease: "easeOut" }}
          >
            <circle r="4.4" fill={RED} stroke="#1c130e" strokeWidth="1" />
            <circle r="1.6" cy="-0.8" fill="#fff" opacity="0.7" />
          </motion.g>
        </motion.g>
      </svg>

      {/* die + readout */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={roll}
          aria-label="Roll the die"
          aria-describedby="ludo-roll-hint"
          className="group relative h-16 w-16 cursor-pointer rounded-[10px] [perspective:400px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--dusk-glow)]"
        >
          <motion.span
            className="block h-full w-full [transform-style:preserve-3d]"
            animate={{ rotateX: spin * 360, rotateY: spin * 360, scale: busy && !reduce ? [1, 1.12, 1] : 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE }}
          >
            <DieFace value={face} />
          </motion.span>
        </button>
        <p id="ludo-roll-hint" className="hud-label text-center !text-[10px]" style={{ color: "var(--dusk-glow)" }}>
          {busy ? "Rolling" : "Tap to roll"}
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] text-dim">
          <dt>ROLL</dt>
          <dd className="text-right text-text">{rolls === 0 ? "--" : face}</dd>
          <dt>SQ</dt>
          <dd className="text-right text-text">{String(pos + 1).padStart(2, "0")}/52</dd>
        </dl>
      </div>

      <p aria-live="polite" role="status" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
