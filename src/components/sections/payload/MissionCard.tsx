"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { Chip, Panel } from "@/components/hud/Panel";
import type { Project } from "@/data/content";
import { EASE } from "../shared/prng";

type MissionCardProps = {
  project: Project;
  index: number;
  visual: ReactNode;
  large?: boolean;
  className?: string;
};

const MAX_TILT = 4;
const FIRE = "var(--fire)";

export function MissionCard({ project, index, visual, large = false, className = "" }: MissionCardProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const extraId = useId();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 170, damping: 18 });
  const sry = useSpring(ry, { stiffness: 170, damping: 18 });
  const canTilt = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      canTilt.current = mq.matches && !reduce;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  const onMove = (e: React.PointerEvent<HTMLLIElement>) => {
    if (!canTilt.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * MAX_TILT * 2);
    rx.set(-py * MAX_TILT * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const shown = project.bullets.slice(0, 2);
  const extra = project.bullets.slice(2);

  return (
    <motion.li
      className={`group relative list-none ${className}`}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1100 }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: (index % 3) * 0.07 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Panel
        as="article"
        accent={FIRE}
        className={`flex h-full flex-col ${large ? "lg:flex-row" : ""} transition-colors duration-300 group-focus-within:border-fire/60 group-hover:border-fire/60`}
      >
        {/* scanline sweep on hover / focus */}
        <span aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <span className="absolute inset-x-0 top-[-30%] h-24 border-b border-fire/70 bg-linear-to-b from-transparent to-fire/10 opacity-0 transition-[top,opacity] duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-focus-within:top-[105%] group-focus-within:opacity-100 group-hover:top-[105%] group-hover:opacity-100" />
        </span>

        <div
          aria-hidden
          className={`relative overflow-hidden border-b border-line bg-bg/70 ${
            large ? "h-72 md:h-80 lg:h-auto lg:min-h-[26rem] lg:w-[56%] lg:shrink-0 lg:border-b-0 lg:border-r" : "h-36 lg:h-auto lg:min-h-36 lg:flex-1"
          }`}
        >
          {visual}
        </div>

        <div className={`flex min-w-0 flex-1 flex-col p-5 md:p-6 ${large ? "" : "lg:flex-none"}`}>
          <p className="hud-label flex flex-wrap items-center gap-2" style={{ color: FIRE }}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span className="h-px w-5 bg-line-hi" />
            <span className="text-dim">{project.kind}</span>
            <span aria-hidden className="ml-auto inline-flex items-center gap-1.5 text-dim/70">
              <span className="led inline-block h-1 w-1 rounded-full bg-fire" />
              Live
            </span>
          </p>
          <h3
            className={`mt-3 font-display font-bold uppercase leading-none tracking-tight text-text ${large ? "text-3xl md:text-4xl" : "text-2xl"}`}
          >
            {project.title}
          </h3>
          <p className="mt-3 text-text/90">{project.tagline}</p>

          <ul className="mt-4 space-y-2">
            {shown.map((b) => (
              <li key={b} className="flex gap-3 text-sm leading-relaxed text-dim">
                <span aria-hidden className="mt-[8px] h-px w-3 shrink-0 bg-fire" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {extra.length > 0 && (
            <>
              <motion.div
                id={extraId}
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                className="overflow-hidden"
                aria-hidden={!open}
                inert={!open}
              >
                <ul className="space-y-2 pt-2">
                  {extra.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-dim">
                      <span aria-hidden className="mt-[8px] h-px w-3 shrink-0 bg-fire" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={extraId}
                onClick={() => setOpen((o) => !o)}
                className="mt-1 inline-flex min-h-8 w-fit cursor-pointer items-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-fire focus-visible:text-fire"
              >
                <span aria-hidden className="inline-block w-3 text-center">{open ? "−" : "+"}</span>
                {open ? "Less detail" : `${extra.length} more ${extra.length === 1 ? "detail" : "details"}`}
              </button>
            </>
          )}

          <div className="mt-auto pt-5">
            <div className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-8 items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.14em] text-text transition-colors hover:text-fire"
              >
                Source on GitHub <span aria-hidden>↗</span>
                <span className="sr-only">({project.title})</span>
              </a>
            )}
          </div>
        </div>
      </Panel>
    </motion.li>
  );
}
