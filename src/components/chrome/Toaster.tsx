"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_HUD } from "@/lib/motion";
import { onToast, type ToastItem, type ToastTone } from "@/lib/toast";
import { GREEN, INK, PAPER, RED, SKY_TOP, YELLOW } from "@/components/toon/toon";
import { useHudMode } from "@/lib/hud-mode";

const TOON_TONE: Record<ToastTone, string> = {
  signal: YELLOW,
  water: GREEN,
  fire: RED,
  sky: SKY_TOP,
  air: PAPER,
};
const FREDOKA = "var(--font-fredoka), var(--font-nunito), system-ui, sans-serif";

const MAX = 4;

/** Renders toasts fired from anywhere via `toast()` from `@/lib/toast`. */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();
  const toon = useHudMode() === "toon";

  useEffect(() => {
    const timers = new Map<number, number>();
    const off = onToast((t) => {
      setItems((prev) => [...prev, t].slice(-MAX));
      timers.set(
        t.id,
        window.setTimeout(() => {
          setItems((prev) => prev.filter((x) => x.id !== t.id));
          timers.delete(t.id);
        }, t.duration),
      );
    });
    return () => {
      off();
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-11 z-[95] flex flex-col items-center gap-2 px-3 md:inset-x-auto md:right-[84px] md:top-14 md:items-end md:px-0"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => {
          const color = `var(--${t.tone})`;
          if (toon) {
            // Warmer sticker: white card, ink outline, offset ink shadow, Fredoka title pill.
            return (
              <motion.div
                key={t.id}
                layout={!reduce}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.92, rotate: -1.5 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 520, damping: 30 }}
                className="relative max-w-[min(420px,100%)] overflow-hidden px-4 py-2.5"
                style={{
                  background: PAPER,
                  color: INK,
                  border: `2.5px solid ${INK}`,
                  borderRadius: 18,
                  boxShadow: `4px 4px 0 ${INK}`,
                  fontFamily: "var(--font-nunito), system-ui, sans-serif",
                }}
              >
                <span
                  className="inline-flex items-center rounded-full px-2 py-[1px] text-[11px] font-semibold"
                  style={{ fontFamily: FREDOKA, background: TOON_TONE[t.tone], border: `2px solid ${INK}` }}
                >
                  {t.title}
                </span>
                <div className="mt-1 text-[14px] font-bold leading-snug">{t.message}</div>
                <motion.span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[3px] w-full origin-left"
                  style={{ background: TOON_TONE[t.tone] }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: t.duration / 1000, ease: "linear" }}
                />
              </motion.div>
            );
          }
          return (
            <motion.div
              key={t.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, clipPath: "inset(0 50% 0 50%)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0%)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, clipPath: "inset(0 0% 100% 0%)" }}
              transition={{ duration: 0.36, ease: EASE_HUD }}
              className="relative flex max-w-[min(440px,100%)] items-stretch border border-line bg-panel"
            >
              <span aria-hidden className="w-[3px] shrink-0" style={{ background: color }} />
              <div className="px-4 py-2.5">
                <div className="hud-label flex items-center gap-2 !text-[10px]" style={{ color }}>
                  <span className="inline-block h-1 w-1 rounded-full" style={{ background: color }} />
                  {t.title}
                </div>
                <div className="mt-0.5 font-mono text-[12px] uppercase tracking-[0.08em] text-text">{t.message}</div>
              </div>
              <motion.span
                aria-hidden
                className="absolute bottom-0 left-0 h-px w-full origin-left"
                style={{ background: color, opacity: 0.6 }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: t.duration / 1000, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
