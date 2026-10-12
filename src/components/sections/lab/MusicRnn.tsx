"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { musicRnn } from "@/data/content";
import { useReducedMotionSafe } from "./motion";

const CHAR_MS = 110; // ~9 characters a second
const HOLD_MS = 2200; // pause on the finished tune before it is written again
const LETTERS = "CDEFGAB";
const SEMI = [0, 2, 4, 5, 7, 9, 11];

type Note = { at: number; step: number; start: number; dur: number; midi: number };

/**
 * Parse the ABC body into notes: letter (upper = octave 4, lower = octave 5), commas drop an octave,
 * a trailing digit multiplies the default length (L:1/8). Key A Dorian sharpens F.
 */
function parse(body: string) {
  const notes: Note[] = [];
  let t = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    const li = LETTERS.indexOf(ch.toUpperCase());
    if (li < 0) continue;
    let oct = ch === ch.toUpperCase() ? 4 : 5;
    let j = i + 1;
    while (body[j] === ",") {
      oct -= 1;
      j++;
    }
    let dur = 1;
    if (/\d/.test(body[j] ?? "")) {
      dur = Number(body[j]);
      j++;
    }
    const semi = SEMI[li] + (LETTERS[li] === "F" ? 1 : 0);
    notes.push({ at: j - 1, step: oct * 7 + li, start: t, dur, midi: 12 * (oct + 1) + semi });
    t += dur;
  }
  return { notes, length: t };
}

/**
 * Replays the model's real generated tune (quoted in the project README) the way it was written:
 * one sampled character at a time. Notes land on a piano roll as their characters appear.
 * Sound is opt-in. Loops forever while on screen; reduced motion shows the finished tune.
 */
export function MusicRnn() {
  const reduce = useReducedMotionSafe();
  const { header, body } = musicRnn.sample;
  const { notes, length } = useMemo(() => parse(body), [body]);
  const lo = Math.min(...notes.map((n) => n.step)) - 1;
  const hi = Math.max(...notes.map((n) => n.step)) + 1;
  const [pos, setPos] = useState(0);
  const [sound, setSound] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundRef = useRef(false);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    if (reduce) {
      setPos(body.length);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    let visible = false;
    let timer = 0;
    let p = 0;
    const tick = () => {
      if (!visible || document.hidden) return;
      if (p >= body.length) {
        p = 0;
        setPos(0);
        timer = window.setTimeout(tick, CHAR_MS * 3);
        return;
      }
      p += 1;
      setPos(p);
      const n = notes.find((x) => x.at === p - 1);
      if (n && soundRef.current) play(n);
      timer = window.setTimeout(tick, p >= body.length ? HOLD_MS : CHAR_MS);
    };
    const play = (n: Note) => {
      const ctx = audioRef.current;
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = 440 * 2 ** ((n.midi - 69) / 12);
      const t0 = ctx.currentTime;
      const len = Math.min(0.5, n.dur * 0.18);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.08, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + len + 0.02);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        const was = visible;
        visible = e.isIntersecting;
        if (visible && !was) {
          window.clearTimeout(timer);
          timer = window.setTimeout(tick, CHAR_MS);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(root);
    const onVis = () => {
      if (!document.hidden && visible) {
        window.clearTimeout(timer);
        timer = window.setTimeout(tick, CHAR_MS);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.clearTimeout(timer);
    };
  }, [reduce, body, notes]);

  useEffect(() => () => void audioRef.current?.close(), []);

  const toggleSound = () => {
    if (!audioRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) audioRef.current = new AC();
    }
    void audioRef.current?.resume();
    setSound((s) => !s);
  };

  const shown = notes.filter((n) => n.at < pos);
  const latest = shown[shown.length - 1];
  const W = 600;
  const H = 120;
  const rowH = H / (hi - lo + 1);
  const x = (t: number) => (t / length) * W;
  const y = (step: number) => (hi - step) * rowH;

  return (
    <div ref={rootRef}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-28 w-full sm:h-32"
        role="img"
        aria-label={`Piano roll of the generated tune: ${notes.length} notes.`}
      >
        {Array.from({ length: hi - lo + 1 }, (_, i) => (
          <line
            key={i}
            x1={0}
            x2={W}
            y1={i * rowH + rowH / 2}
            y2={i * rowH + rowH / 2}
            stroke="var(--line)"
            strokeWidth={(hi - i) % 7 === 0 ? 1 : 0.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {shown.map((n) => {
          const isLatest = n === latest && pos < body.length;
          return (
            <rect
              key={n.at}
              x={x(n.start) + 1}
              y={y(n.step) + rowH * 0.15}
              width={Math.max(2, x(n.dur) - 2)}
              height={rowH * 0.7}
              rx={1.5}
              fill={isLatest ? "var(--signal)" : "var(--water)"}
              opacity={isLatest ? 1 : 0.75}
            />
          );
        })}
        {latest && pos < body.length && (
          <line
            x1={x(latest.start + latest.dur)}
            x2={x(latest.start + latest.dur)}
            y1={0}
            y2={H}
            stroke="var(--signal)"
            strokeOpacity={0.5}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <pre className="min-w-0 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-dim" aria-label="Generated ABC notation">
          <span className="text-dim/70">{header.replace(/\n/g, "  ")}</span>
          {"\n"}
          <span className="break-all text-text">{body.slice(0, pos)}</span>
          {pos < body.length && <span className="led inline-block h-3 w-1.5 translate-y-0.5 bg-signal" aria-hidden />}
          {/* the unwritten rest keeps its space, so the block does not grow line by line */}
          <span className="invisible break-all" aria-hidden>
            {body.slice(pos)}
          </span>
        </pre>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-dim">
          <span className="tabular-nums">
            char <span className="text-text">{String(pos).padStart(3, "0")}</span>/{body.length}
          </span>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className="cursor-pointer border border-line-hi px-2.5 py-1.5 transition-colors hover:border-text hover:text-text aria-pressed:border-water aria-pressed:text-water"
          >
            {sound ? "Sound on" : "Sound off"}
          </button>
        </div>
      </div>
    </div>
  );
}
