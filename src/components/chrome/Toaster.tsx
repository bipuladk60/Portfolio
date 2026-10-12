"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_HUD } from "@/lib/motion";
import { onToast, type ToastItem } from "@/lib/toast";

const MAX = 4;

/** Renders toasts fired from anywhere via `toast()` from `@/lib/toast`. */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();

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
      className="pointer-events-none fixed inset-x-0 top-11 z-[95] flex flex-col items-center gap-2 px-3 md:inset-x-auto md:bottom-5 md:left-5 md:top-auto md:items-start md:px-0"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => {
          const color = `var(--${t.tone})`;
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
