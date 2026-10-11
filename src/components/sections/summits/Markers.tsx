"use client";

import { motion } from "motion/react";
import { EASE } from "./motion";

const FLAG_A = "M7 5 C14 1.5 21 8.5 31 5 L31 18 C21 21.5 14 14.5 7 18 Z";
const FLAG_B = "M7 5 C14 8.5 21 1.5 31 5 L31 18 C21 14.5 14 21.5 7 18 Z";
const FLAG_C = "M7 5 C14 3 21 6 31 4 L31 17 C21 19 14 16 7 18 Z";

/**
 * A gold summit flag. The pole rises, then the flag unfurls from the pole and flutters
 * with an SMIL path morph (the flutter is skipped under reduced motion).
 */
export function PlantedFlag({
  planted,
  delay = 0,
  reduce,
  className = "",
}: {
  planted: boolean;
  delay?: number;
  reduce: boolean;
  className?: string;
}) {
  const show = planted || reduce;
  const t = (d: number, dur: number) => (reduce ? { duration: 0 } : { delay: delay + d, duration: dur, ease: EASE });
  return (
    <svg viewBox="-13 0 40 60" className={className} aria-hidden overflow="visible">
      {/* cairn at the base */}
      <motion.path
        d="M1 59 L7 52 L13 59 Z"
        fill="var(--panel-2)"
        stroke="var(--signal)"
        strokeWidth="1.2"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={t(0, 0.2)}
      />
      {/* pole */}
      <motion.line
        x1="7"
        y1="58"
        x2="7"
        y2="3"
        stroke="var(--text)"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: show ? 1 : 0 }}
        transition={t(0.1, 0.45)}
      />
      {/* flag */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: show ? 1 : 0, opacity: show ? 1 : 0 }}
        transition={t(0.5, 0.5)}
      >
        <path d={FLAG_A} fill="var(--signal)">
          {!reduce && (
            <animate
              attributeName="d"
              dur="1.8s"
              repeatCount="indefinite"
              values={`${FLAG_A};${FLAG_C};${FLAG_B};${FLAG_A}`}
              calcMode="spline"
              keyTimes="0;0.33;0.66;1"
              keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
            />
          )}
        </path>
        {/* embroidered stitch along the flag */}
        <path d="M11 11.5 L26 11.5" stroke="var(--bg)" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      </motion.g>
      <circle cx="7" cy="3" r="1.6" fill="var(--signal)" />
    </svg>
  );
}

/** Blue base marker: turned back below the summit, data gathered. */
export function BaseBeacon({
  shown,
  delay = 0,
  reduce,
  className = "",
}: {
  shown: boolean;
  delay?: number;
  reduce: boolean;
  className?: string;
}) {
  const show = shown || reduce;
  return (
    <svg viewBox="0 0 40 60" className={className} aria-hidden overflow="visible">
      <motion.g
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
        transition={reduce ? { duration: 0 } : { delay, duration: 0.45, ease: EASE }}
      >
        {/* pulse ring: a slow sonar ping, the "data gathered" signal */}
        {!reduce && (
          <circle cx="20" cy="50" r="6" fill="none" stroke="var(--sky)" strokeWidth="1">
            <animate attributeName="r" values="5;15" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
        {/* tent / base marker */}
        <path d="M11 58 L20 41 L29 58 Z" fill="color-mix(in oklab, var(--sky) 22%, var(--bg))" stroke="var(--sky)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M20 41 L20 58" stroke="var(--sky)" strokeWidth="1" opacity="0.7" />
        {/* turn-back chevron */}
        <path d="M14 30 L20 36 L26 30" fill="none" stroke="var(--sky)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 23 L20 29 L26 23" fill="none" stroke="var(--sky)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
      </motion.g>
    </svg>
  );
}
