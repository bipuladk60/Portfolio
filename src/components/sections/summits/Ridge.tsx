"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import type { Hackathon } from "@/data/content";
import { backRidge, buildRidge, H, pct, W } from "./geometry";
import { BaseBeacon, PlantedFlag } from "./Markers";
import { EASE, useReducedMotionSafe } from "./motion";
import type { Filter } from "./Expedition";

const FAR = backRidge(170, 34, 1.3);
const MID = backRidge(215, 28, 4.1);

export function Ridge({
  items,
  selectedId,
  filter,
  onSelect,
}: {
  items: Hackathon[];
  selectedId: string;
  filter: Filter;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const { line, fill, markers } = buildRidge(items);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const farY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-26, 26]);
  const midY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-12, 12]);

  const selected = markers.find((m) => m.id === selectedId);
  const matches = (r: Hackathon["result"]) => filter === "all" || filter === r;

  return (
    <div ref={ref} className="relative pt-10" data-cursor-box="lock">
      <div className="relative aspect-[3/2] w-full sm:aspect-[2/1]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <pattern id="summit-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <line x1="0" y1="0" x2="0" y2="7" stroke="var(--line-hi)" strokeWidth="1" />
            </pattern>
            <linearGradient id="summit-fade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--panel-2)" />
              <stop offset="1" stopColor="var(--bg)" />
            </linearGradient>
            <clipPath id="summit-clip">
              <path d={fill} />
            </clipPath>
          </defs>

          <motion.g style={{ y: farY }}>
            <path d={FAR.fill} fill="var(--bg)" opacity="0.9" />
            <path d={FAR.line} fill="none" stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </motion.g>
          <motion.g style={{ y: midY }}>
            <path d={MID.fill} fill="var(--panel)" />
            <path d={MID.fill} fill="url(#summit-hatch)" opacity="0.25" />
            <path d={MID.line} fill="none" stroke="var(--line-hi)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </motion.g>

          {/* main ridge with contour strata */}
          <path d={fill} fill="url(#summit-fade)" />
          <g clipPath="url(#summit-clip)">
            <rect width={W} height={H} fill="url(#summit-hatch)" opacity="0.35" />
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
          </g>
          <motion.path
            d={line}
            fill="none"
            stroke="var(--text)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: inView || reduce ? 1 : 0 }}
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
                  animate={{ opacity: inView || reduce ? 0.8 : 0 }}
                  transition={reduce ? { duration: 0 } : { delay: 1 + m.index * 0.22, duration: 0.5 }}
                />
                <circle cx={m.peakX} cy={m.peakY} r="4" fill="var(--bg)" stroke="var(--sky)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              </g>
            ))}

          {/* survey line under the selected marker */}
          {selected && (
            <motion.g
              initial={false}
              animate={{ x: selected.x, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
            >
              <line
                x1="0"
                x2="0"
                y1={selected.y + 8}
                y2={H}
                stroke={selected.result === "win" ? "var(--signal)" : "var(--sky)"}
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
                  aria-pressed={active}
                  aria-label={`${h.event}, ${h.when}: ${isWin ? `win, ${h.award}` : "competed"}. Show details.`}
                  className="group relative flex h-14 w-10 cursor-pointer items-end justify-center transition-opacity duration-300 sm:h-[72px] sm:w-12"
                  style={{ opacity: dim ? 0.22 : 1, filter: dim ? "grayscale(0.8)" : undefined }}
                >
                  {/* selection reticle */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-1.5 -bottom-2 -top-1.5 border transition-all duration-300"
                    style={{
                      borderColor: active ? color : "transparent",
                      boxShadow: active ? `0 0 24px -6px ${color}` : "none",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-1.5 -bottom-2 -top-1.5 border border-transparent transition-colors duration-200 group-hover:border-line-hi"
                  />
                  {isWin ? (
                    <PlantedFlag
                      planted={inView}
                      delay={0.7 + i * 0.22}
                      reduce={reduce}
                      className="h-full w-full transition-transform duration-300 group-hover:-translate-y-0.5"
                    />
                  ) : (
                    <BaseBeacon
                      shown={inView}
                      delay={0.9 + i * 0.22}
                      reduce={reduce}
                      className="h-full w-full transition-transform duration-300 group-hover:-translate-y-0.5"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
