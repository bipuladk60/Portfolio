"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReveal } from "@/lib/reveal";
import type { Hackathon } from "@/data/content";
import { backRidge, buildRidge, H, pct, W } from "./geometry";
import { BaseBeacon, PlantedFlag } from "./Markers";
import { EASE, useReducedMotionSafe } from "./motion";
import type { Filter } from "./Expedition";

const HAZE = backRidge(150, 38, 2.6);
const FAR = backRidge(178, 32, 1.3);
const MID = backRidge(220, 26, 4.1);

/** Deterministic star field (same on server and client): x, y in % of the sky, size px, base opacity, twinkle. */
const STARS = (() => {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 54 }, (_, i) => ({
    x: rnd() * 100,
    // denser near the top, thinning toward the ridge
    y: rnd() ** 1.6 * 58,
    size: rnd() > 0.86 ? 2 : 1,
    o: 0.25 + rnd() * 0.5,
    twinkle: i % 3 === 0 ? 3 + rnd() * 5 : 0,
    delay: rnd() * 6,
  }));
})();

const SKY_CSS = `
@keyframes hk-twinkle { 0%, 100% { opacity: var(--o); } 50% { opacity: calc(var(--o) * 0.25); } }
.hk-star { position: absolute; border-radius: 9999px; background: var(--text); opacity: var(--o); }
.hk-star[data-tw] { animation: hk-twinkle var(--d) ease-in-out var(--dl) infinite; }
@media (prefers-reduced-motion: reduce) { .hk-star[data-tw] { animation: none; } }
`;

export function Ridge({
  items,
  selectedId,
  hoverId,
  filter,
  onSelect,
  onHover,
}: {
  items: Hackathon[];
  selectedId: string;
  hoverId: string | null;
  filter: Filter;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useReveal(ref, "-15% 0px");
  const { line, fill, markers } = buildRidge(items);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const skyY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-18, 18]);
  const hazeY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-34, 34]);
  const farY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-24, 24]);
  const midY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-11, 11]);

  const selected = markers.find((m) => m.id === selectedId);
  const selColor = selected?.result === "win" ? "var(--signal)" : "var(--sky)";
  const matches = (r: Hackathon["result"]) => filter === "all" || filter === r;
  const show = inView || reduce;

  return (
    <div ref={ref} className="relative pt-12" data-cursor-box="lock">
      <style>{SKY_CSS}</style>
      <div className="relative aspect-[3/2] w-full sm:aspect-[2/1]">
        {/* night sky: stars, a low warm horizon glow, and a halo that follows the selected summit */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <div
            className="absolute inset-x-0 bottom-[20%] h-[55%]"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 62% 100%, color-mix(in oklab, var(--signal) 11%, transparent), transparent 70%)",
            }}
          />
          <motion.div
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ y: skyY, opacity: show ? 1 : 0 }}
          >
            {STARS.map((s, i) => (
              <span
                key={i}
                className="hk-star"
                data-tw={s.twinkle ? "" : undefined}
                style={
                  {
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: s.size,
                    height: s.size,
                    "--o": s.o,
                    "--d": `${s.twinkle}s`,
                    "--dl": `${s.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </motion.div>
          {selected && (
            <div className="absolute inset-x-0 bottom-0 top-12">
              <motion.div
                className="absolute h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
                initial={false}
                animate={{ left: pct(selected.peakX, W), top: pct(selected.peakY, H), opacity: show ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE }}
                style={{
                  color: selColor,
                  background: "radial-gradient(closest-side, color-mix(in oklab, currentColor 24%, transparent), transparent)",
                  transition: "color 600ms",
                }}
              />
            </div>
          )}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
          style={{
            maskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
          }}
        >
          <defs>
            <pattern id="summit-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <line x1="0" y1="0" x2="0" y2="7" stroke="var(--line-hi)" strokeWidth="1" />
            </pattern>
            <linearGradient id="summit-fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--panel-2)" />
              <stop offset="1" stopColor="var(--bg)" />
            </linearGradient>
            <linearGradient id="summit-far" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="color-mix(in oklab, var(--line-hi) 55%, var(--bg))" />
              <stop offset="0.6" stopColor="var(--bg)" />
            </linearGradient>
            <linearGradient id="summit-mist" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--bg)" stopOpacity="0" />
              <stop offset="1" stopColor="var(--bg)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="summit-snow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--text)" stopOpacity="1" />
              <stop offset="0.55" stopColor="var(--text)" stopOpacity="0.7" />
              <stop offset="1" stopColor="var(--text)" stopOpacity="0.15" />
            </linearGradient>
            <clipPath id="summit-clip">
              <path d={fill} />
            </clipPath>
          </defs>

          {/* three back ranges, each further one paler and slower, with mist settling between them */}
          <motion.g style={{ y: hazeY }}>
            <path d={HAZE.fill} fill="var(--panel-2)" opacity="0.35" />
          </motion.g>
          <motion.g style={{ y: farY }}>
            <path d={FAR.fill} fill="url(#summit-far)" opacity="0.9" />
            <path d={FAR.line} fill="none" stroke="var(--line-hi)" strokeOpacity="0.6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </motion.g>
          <rect x="0" y="170" width={W} height="110" fill="url(#summit-mist)" />
          <motion.g style={{ y: midY }}>
            <path d={MID.fill} fill="var(--panel)" />
            <path d={MID.fill} fill="url(#summit-hatch)" opacity="0.22" />
            <path d={MID.line} fill="none" stroke="var(--line-hi)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </motion.g>
          <rect x="0" y="240" width={W} height="90" fill="url(#summit-mist)" opacity="0.7" />

          {/* main ridge with contour strata */}
          <path d={fill} fill="url(#summit-fade)" />
          <g clipPath="url(#summit-clip)">
            <rect width={W} height={H} fill="url(#summit-hatch)" opacity="0.3" />
            {[16, 34, 56, 82, 112].map((dy, i) => (
              <path
                key={dy}
                d={line}
                transform={`translate(0 ${dy})`}
                fill="none"
                stroke="var(--line-hi)"
                strokeWidth="1"
                opacity={0.7 - i * 0.12}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* snow on the summits that were won; settles once the ridge line has drawn */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: show ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : { delay: 1.3, duration: 0.8 }}
            >
            {markers
              .filter((m) => m.cap)
              .map((m) => (
                <motion.path
                  key={m.id}
                  d={m.cap}
                  fill="url(#summit-snow)"
                  initial={false}
                  animate={{ opacity: matches(m.result) ? (m.id === selectedId ? 1 : 0.85) : 0.25 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.5 }}
                />
              ))}
            </motion.g>
          </g>
          <motion.path
            d={line}
            fill="none"
            stroke="var(--text)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: show ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 1.6, ease: EASE }}
          />

          {/* dotted line from each competed marker up to its peak */}
          {markers
            .filter((m) => m.route)
            .map((m) => (
              <g key={m.id} opacity={matches(m.result) ? 1 : 0.2}>
                <motion.path
                  d={m.route}
                  fill="none"
                  stroke="var(--sky)"
                  strokeWidth="1.4"
                  strokeDasharray="3 5"
                  vectorEffect="non-scaling-stroke"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: show ? 0.8 : 0 }}
                  transition={reduce ? { duration: 0 } : { delay: 1 + m.index * 0.22, duration: 0.5 }}
                />
                <circle cx={m.peakX} cy={m.peakY} r="4" fill="var(--bg)" stroke="var(--sky)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              </g>
            ))}

          {/* survey line under the selected marker */}
          {selected && (
            <motion.g initial={false} animate={{ x: selected.x }} transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}>
              <line
                x1="0"
                x2="0"
                y1={selected.y + 8}
                y2={H}
                stroke={selColor}
                strokeWidth="1"
                strokeDasharray="2 4"
                vectorEffect="non-scaling-stroke"
              />
            </motion.g>
          )}
        </svg>

        {/* markers: real buttons laid over the drawing */}
        <ul className="absolute inset-0" aria-label="Hackathons in chronological order">
          {items.map((h, i) => {
            const m = markers[i];
            const isWin = h.result === "win";
            const active = h.id === selectedId;
            const peek = h.id === hoverId;
            const dim = !matches(h.result);
            const color = isWin ? "var(--signal)" : "var(--sky)";
            return (
              <li
                key={h.id}
                className="absolute"
                style={{ left: pct(m.x, W), top: pct(m.y, H), transform: "translate(-50%, -100%)" }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(h.id)}
                  onMouseEnter={() => onHover(h.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(h.id)}
                  onBlur={() => onHover(null)}
                  aria-pressed={active}
                  aria-label={`${h.event}, ${h.when}: ${isWin ? `win, ${h.award}` : "competed"}. Show details.`}
                  className="group relative flex h-14 w-10 cursor-pointer items-end justify-center transition-opacity duration-300 sm:h-[72px] sm:w-12"
                  style={{ opacity: dim ? 0.22 : 1, filter: dim ? "grayscale(0.8)" : undefined }}
                >
                  {/* name tag on hover / focus / when the matching card is hovered (desktop; the cards carry the names on phones) */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-300 sm:block ${
                      peek ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                    }`}
                    style={{ color }}
                  >
                    {h.event}
                  </span>
                  {/* selection: a soft pool of light under the marker and a short underline, no box */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-3 left-1/2 h-5 w-16 -translate-x-1/2 rounded-full transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(closest-side, color-mix(in oklab, ${color} 50%, transparent), transparent)`,
                      opacity: active ? 1 : peek ? 0.45 : 0,
                    }}
                  />
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute -bottom-2 left-1/2 h-[2px] -translate-x-1/2 rounded-full transition-all duration-300 [transition-timing-function:var(--ease-hud)] ${
                      active ? "w-6 opacity-100" : peek ? "w-4 opacity-60" : "w-3 opacity-0"
                    }`}
                    style={{ background: active ? color : "var(--line-hi)" }}
                  />
                  <span
                    className={`block h-full w-full transition-transform duration-300 [transition-timing-function:var(--ease-hud)] ${
                      peek || active ? "-translate-y-1" : ""
                    }`}
                    style={{ filter: active ? `drop-shadow(0 0 6px color-mix(in oklab, ${color} 55%, transparent))` : undefined }}
                  >
                    {isWin ? (
                      <PlantedFlag planted={inView} delay={0.7 + i * 0.22} reduce={reduce} className="h-full w-full" />
                    ) : (
                      <BaseBeacon shown={inView} delay={0.9 + i * 0.22} reduce={reduce} className="h-full w-full" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
