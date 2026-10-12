"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, type Easing } from "motion/react";
import { INK, ORANGE, SKY_TOP, YELLOW } from "@/components/toon/toon";

type Props = {
  /** viewport point the warm light rises from (the globe, over Nepal) */
  origin: { x: number; y: number };
  /** fired once the screen is fully covered: unlock + jump the scroll underneath */
  onCovered: () => void;
  onDone: () => void;
};

// One continuous timeline (seconds). Everything below is keyframed against D with `times`,
// so all layers move as one eased gesture instead of stacked stages.
const D = 2.45;
const COVER_AT = 1.6; // fully opaque from ~0.95 s to ~1.95 s; the scroll jump happens in the middle
const SKIP_DELAY = 0.6;
const EASE_IO = [0.65, 0, 0.35, 1] as const;
const EASE_OUT = [0.2, 0.8, 0.2, 1] as const;

// Keyframe helpers. Every track must end at offset 1: a WAAPI track whose last offset is < 1 eases
// back to the element's base style for the rest of the duration. `ts` takes seconds and appends 1,
// `hold` repeats the last value to match.
const ts = (...secs: number[]) => [...secs.map((s) => s / D), 1];
const hold = <T,>(vals: T[]): T[] => [...vals, vals[vals.length - 1]];
/** A track on the shared timeline. The easing is set per segment: a single `ease` with `times` is
 * applied to the whole WAAPI effect, which bends every offset (an opacity hold would start fading early). */
const kf = (ease: Easing, ...secs: number[]) => ({ duration: D, times: ts(...secs), ease: secs.map(() => ease) });

// The sky strip is three viewports tall: night on top, dawn in the middle, Warmer's day sky at the
// bottom. Sliding it up by two viewports lifts the night away like a sunrise. The last third ends on
// the same colours as the top of the Game Room's sky, so the final fade has nothing to reveal.
const SKY_STRIP = `linear-gradient(to bottom,
  #0A0D12 0%, #0A0D12 26%, #161527 36%, #3a2340 44%, #7e3f4f 50%, #d9705a 56%,
  #ffb070 60.5%, #ffdcae 64%, ${SKY_TOP} 66.67%, #d0ecff 100%)`;
const DAY = `linear-gradient(to bottom, ${SKY_TOP}, #d0ecff)`;

const SUN_DAY = "radial-gradient(circle, #fff6c9 0%, #ffe58a 32%, rgba(255,229,138,0.35) 52%, transparent 70%)";
const SUN_WARM = `radial-gradient(circle, #fff1c2 0%, ${YELLOW} 24%, ${ORANGE} 42%, rgba(239,59,44,0.35) 56%, transparent 70%)`;
const HALO = `radial-gradient(circle, rgba(255,159,28,0.55) 0%, rgba(239,59,44,0.22) 30%, transparent 62%)`;

const PUFFS = [
  { cx: 30, cy: 40, r: 17 },
  { cx: 55, cy: 30, r: 23 },
  { cx: 82, cy: 36, r: 19 },
  { cx: 100, cy: 44, r: 12 },
];

function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 124 64" className={className} aria-hidden>
      <g fill="#a9d4f5" transform="translate(4 5)">
        {PUFFS.map((p, i) => (
          <circle key={i} {...p} />
        ))}
        <rect x="14" y="40" width="96" height="16" rx="8" />
      </g>
      <g fill="none" stroke={INK} strokeWidth="4.5">
        {PUFFS.map((p, i) => (
          <circle key={i} {...p} />
        ))}
        <rect x="14" y="40" width="96" height="16" rx="8" />
      </g>
      <g fill="#ffffff">
        {PUFFS.map((p, i) => (
          <circle key={i} {...p} />
        ))}
        <rect x="14" y="40" width="96" height="16" rx="8" />
      </g>
    </svg>
  );
}

// Roughly where the Game Room's own clouds sit, so the hand-off is a soft cross-fade.
const CLOUDS = [
  { left: "-2%", top: "52%", w: 140, from: -1 },
  { left: "4%", top: "22%", w: 90, from: -1 },
  { right: "2%", top: "38%", w: 150, from: 1 },
  { right: "22%", top: "80%", w: 110, from: 1 },
];

/**
 * The chapter break, as one continuous ~2.4 s move: the night HUD deepens, a warm light rises out of
 * Nepal on the globe and climbs to where the Game Room's sun sits, the night lifts through dawn into
 * Warmer's day sky while clouds drift in from the edges, and then the overlay dissolves onto #games.
 * The page switches to chapter 2 and jumps to #games while the screen is fully covered.
 * Transform/opacity only. Escape, click or Skip jump straight to the end; reduced motion = short fade.
 */
export function ChapterTransition({ origin, onCovered, onDone }: Props) {
  const reduce = useReducedMotion();
  /** play: the full move; skip: settling straight into the day sky; out: dissolving onto the page */
  const [phase, setPhase] = useState<"play" | "skip" | "out">("play");
  const covered = useRef(false);
  const timers = useRef<number[]>([]);
  const cover = useRef(onCovered);
  const done = useRef(onDone);
  const born = useRef(0);
  cover.current = onCovered;
  done.current = onDone;

  const doCover = () => {
    if (covered.current) return;
    covered.current = true;
    cover.current();
  };
  const doCoverRef = useRef(doCover);
  doCoverRef.current = doCover;

  useEffect(() => {
    born.current = performance.now();
    const at = (s: number, fn: () => void) => timers.current.push(window.setTimeout(fn, s * 1000));
    if (reduce) {
      at(0.22, () => doCoverRef.current());
      at(0.5, () => done.current());
    } else {
      at(COVER_AT, () => doCoverRef.current());
      at(D + 0.03, () => done.current());
    }
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  const viaSkip = useRef(false);
  const finishSoon = () => {
    setPhase("out");
    timers.current.push(window.setTimeout(() => done.current(), 470));
  };

  const skip = () => {
    if (phase !== "play" || reduce) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    // Already at #games under the sky: just let the overlay go. Otherwise cover with day first.
    if (covered.current) finishSoon();
    else {
      viaSkip.current = true;
      setPhase("skip");
    }
  };
  const skipRef = useRef(skip);
  skipRef.current = skip;

  useEffect(() => {
    // Only Escape skips (Enter is how the answer gets submitted), and ignore keys right after mount.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && performance.now() - born.current > SKIP_DELAY * 1000) skipRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const md = vw >= 768;

  // The sun ends where SkyWorld paints its sun (right 8%, 60 px down, 180/260 px wide).
  const SUN = md ? 260 : 180;
  const sunEnd = { x: vw * 0.92 - SUN, y: 60 };
  const sunStart = { x: origin.x - SUN / 2, y: origin.y - SUN / 2 };
  const halo = 2 * Math.hypot(Math.max(origin.x, vw - origin.x), Math.max(origin.y, vh - origin.y));


  // Root: transparent wrapper during the move, then the final dissolve onto the page.
  const rootAnimate = reduce ? { opacity: [0, 1, 1, 0] } : phase === "out" ? { opacity: 0 } : { opacity: [1, 1, 0] };
  const rootTransition = reduce
    ? { duration: 0.5, times: [0, 0.4, 0.56, 1], ease: "easeInOut" as const }
    : phase === "out"
      ? { duration: 0.42, ease: "easeInOut" as const }
      : kf(EASE_IO, 0, 1.95);

  const node = (
    <motion.div
      className="fixed inset-0 z-[90] cursor-pointer overflow-hidden"
      onClick={() => {
        // the click that submitted the answer can land here; ignore clicks in the first moments
        if (performance.now() - born.current > SKIP_DELAY * 1000) skip();
      }}
      initial={{ opacity: reduce ? 0 : 1 }}
      animate={rootAnimate}
      transition={rootTransition}
    >
      {/* night → dawn → day: one tall gradient, lifted upward */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 will-change-transform"
        style={{ height: "300%", background: SKY_STRIP }}
        initial={reduce ? { opacity: 1, y: "-66.667%" } : { opacity: 0, y: "0%" }}
        animate={reduce ? undefined : { opacity: hold([0, 0, 1]), y: hold(["0%", "0%", "-66.667%"]) }}
        transition={{
          opacity: kf("easeOut", 0, 0.25, 0.95),
          y: kf(EASE_IO, 0, 0.55, 2.0),
        }}
      />

      {!reduce && (
        <>
          {/* a broad warm wash that swells out of Nepal and thins as the day arrives */}
          <motion.div
            aria-hidden
            className="absolute left-0 top-0 rounded-full will-change-transform"
            style={{ width: halo, height: halo, x: origin.x - halo / 2, y: origin.y - halo / 2, background: HALO }}
            initial={{ opacity: 0, scale: 0.08 }}
            animate={{ opacity: hold([0, 0.9, 0.9, 0]), scale: hold([0.08, 0.6, 1, 1]) }}
            transition={kf("easeInOut", 0, 0.6, 1.15, 1.75)}
          />

          {/* the warm light rises from the globe and becomes the Game Room's sun */}
          <motion.div
            aria-hidden
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: SUN, height: SUN }}
            initial={{ x: sunStart.x, y: sunStart.y, scale: 0.25, opacity: 0 }}
            animate={{
              x: hold([sunStart.x, sunStart.x, sunEnd.x]),
              y: hold([sunStart.y, sunStart.y, sunEnd.y]),
              scale: hold([0.25, 0.7, 1]),
              opacity: hold([0, 1, 1]),
            }}
            transition={kf(EASE_IO, 0, 0.45, 1.95)}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: SUN_WARM }}
              initial={{ opacity: 1 }}
              animate={{ opacity: hold([1, 1, 0]) }}
              transition={kf("easeInOut", 0, 1.0, 1.8)}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: SUN_DAY }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hold([0, 0, 1]) }}
              transition={kf("easeInOut", 0, 1.0, 1.8)}
            />
          </motion.div>

          {/* soft clouds drift in from the edges as the sky turns to day */}
          {CLOUDS.map((c, i) => {
            // start fully past the nearest edge, wherever the cloud is anchored
            const w = md ? c.w : c.w * 0.75;
            const edge = (parseFloat(c.left ?? c.right ?? "0") / 100) * vw;
            const off = c.from * (edge + w + 24);
            return (
              <motion.div
                key={i}
                aria-hidden
                className="absolute will-change-transform"
                style={{ left: c.left, right: c.right, top: c.top, width: w }}
                initial={{ x: off, opacity: 0 }}
                animate={{ x: hold([off, off, 0]), opacity: hold([0, 0, 1]) }}
                transition={kf(EASE_OUT, 0, 1.05 + i * 0.05, 2.2)}
              >
                <Cloud className="block h-auto w-full" />
              </motion.div>
            );
          })}

          {/* one plain line that rides the motion */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
            <motion.p
              className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold md:text-5xl"
              style={{ color: INK }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: hold([0, 0, 1, 1, 0]), y: hold([10, 10, 0, 0, -8]) }}
              transition={kf("easeInOut", 0, 1.0, 1.35, 1.75, 2.1)}
            >
              Nepal. Welcome to chapter two.
            </motion.p>
          </div>
        </>
      )}

      {/* skip: settle straight into the day sky, then dissolve */}
      {viaSkip.current && !reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ background: DAY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (phase !== "skip") return;
            doCover();
            finishSoon();
          }}
        />
      )}

      {!reduce && phase === "play" && (
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hold([0, 0, 1, 1, 0]) }}
          transition={kf("easeInOut", 0, 0.35, 0.7, 1.7, 1.95)}
          className="absolute bottom-6 right-6 cursor-pointer rounded-full border-2 bg-white px-4 py-1.5 font-[family-name:var(--font-nunito)] text-sm font-extrabold"
          style={{ borderColor: INK, color: INK, boxShadow: `3px 3px 0 ${INK}` }}
        >
          Skip
        </motion.button>
      )}
    </motion.div>
  );

  return typeof document === "undefined" ? null : createPortal(node, document.body);
}

