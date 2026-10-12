"use client";

import { MotionConfig, motion, type Variants } from "motion/react";
import { skills } from "@/data/content";
import { GREEN, INK, ORANGE, YELLOW } from "@/components/toon/toon";

// Each group is a sticker sheet with its own colour; the skills peel on as pills.
const SHEET_COLORS = [YELLOW, "#a8d8ff", GREEN, ORANGE, "#ffb3c1", "#c9b8ff"];
const TILTS = [-1.4, 1, -0.6, 1.2, -1, 0.7];
const PILL_TILTS = [-3, 2, -1, 3, -2, 1, 0];

const sheet: Variants = {
  hidden: { opacity: 0, y: 26, rotate: 0 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotate: TILTS[i % TILTS.length],
    transition: { type: "spring", stiffness: 220, damping: 18, delay: i * 0.07, delayChildren: 0.18 + i * 0.07, staggerChildren: 0.035 },
  }),
};
const pill: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 520, damping: 15 } },
};

export function SkillSheets() {
  // reducedMotion="user": under reduced motion the pop/tilt transforms snap, only opacity fades
  return (
    <MotionConfig reducedMotion="user">
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((g, gi) => {
        const color = SHEET_COLORS[gi % SHEET_COLORS.length];
        return (
          <motion.li
            key={g.group}
            custom={gi}
            variants={sheet}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-8% 0px" }}
          >
            <article data-cursor-box="" className="wr-sticker wr-wobble h-full overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b-[3px] px-4 py-2.5" style={{ background: color, borderColor: INK }}>
                <h3 className="wr-display text-xl font-bold leading-none" style={{ color: INK }}>
                  {g.group}
                </h3>
                <span className="wr-display rounded-full border-2 bg-white px-2 text-sm font-bold leading-5" style={{ borderColor: INK }}>
                  {g.items.length}
                </span>
              </div>
              <ul className="flex flex-wrap gap-2 p-4" aria-label={`${g.group} skills`}>
                {g.items.map((item, ii) => (
                  <motion.li
                    key={item}
                    variants={pill}
                    className="rounded-full border-2 bg-white px-2.5 py-0.5 text-[13px] font-extrabold"
                    style={{
                      borderColor: INK,
                      boxShadow: `2px 2px 0 ${INK}`,
                      rotate: `${PILL_TILTS[(ii + gi) % PILL_TILTS.length] * 0.5}deg`,
                    }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </article>
          </motion.li>
        );
      })}
    </ul>
    </MotionConfig>
  );
}


/** Rosette badge: scalloped disc on two ribbon tails. */
export function Rosette({ color, className = "" }: { color: string; className?: string }) {
  const scallops = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return { cx: Math.round((24 + Math.cos(a) * 15) * 10) / 10, cy: Math.round((22 + Math.sin(a) * 15) * 10) / 10 };
  });
  return (
    <svg viewBox="0 0 48 60" className={className} aria-hidden>
      <path d="M15 30 L9 56 L16 51 L21 57 L24 34 Z" fill={color} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M33 30 L39 56 L32 51 L27 57 L24 34 Z" fill={color} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <g stroke={INK} strokeWidth="2.5">
        {scallops.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r="5" fill={color} />
        ))}
      </g>
      <g fill={color}>
        {scallops.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r="3.8" />
        ))}
      </g>
      <circle cx="24" cy="22" r="13" fill={color} />
      <circle cx="24" cy="22" r="9" fill="#ffffff" stroke={INK} strokeWidth="2.5" />
      <path d="M24 16.5 L25.7 20 L29.4 20.4 L26.6 22.9 L27.4 26.6 L24 24.7 L20.6 26.6 L21.4 22.9 L18.6 20.4 L22.3 20 Z" fill={INK} />
    </svg>
  );
}

