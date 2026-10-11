"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ACHIEVEMENTS, useAchievements } from "@/lib/achievements";
import { closeDevLog, useChromeUI } from "@/lib/chrome-ui";
import { EASE_HUD } from "@/lib/motion";
import { playBlip } from "@/lib/sound";

/** "Dev Log": lists discovered secrets. Opened by the Konami code or the palette. */
export function DevLog() {
  const { devlog: open } = useChromeUI();
  const unlocked = useAchievements();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    playBlip("open");
    const id = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(id);
      prev?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => {
    playBlip("close");
    closeDevLog();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="devlog"
          className="fixed inset-0 z-[80] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              close();
            } else if (e.key === "Tab") {
              e.preventDefault();
              closeRef.current?.focus();
            }
          }}
        >
          <div aria-hidden className="absolute inset-0 bg-bg/80" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="xc-devlog-title"
            className="relative w-full max-w-[520px] border border-line bg-panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 50% 0% 50%)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 50% 0% 50%)" }}
            transition={{ duration: 0.4, ease: EASE_HUD }}
          >
            <span aria-hidden className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-water" />
            <span aria-hidden className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-water" />
            <span aria-hidden className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-water" />
            <span aria-hidden className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-water" />

            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h2 id="xc-devlog-title" className="hud-label !text-[11px] text-water">
                Dev Log // Secrets {unlocked.length}/{ACHIEVEMENTS.length}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="hud-label border border-line px-2 py-0.5 !text-[10px] transition-colors hover:border-water hover:text-water"
              >
                Close · Esc
              </button>
            </div>

            <ol className="divide-y divide-line">
              {ACHIEVEMENTS.map((a, i) => {
                const got = unlocked.includes(a.id);
                return (
                  <motion.li
                    key={a.id}
                    className="flex items-start gap-4 px-5 py-4"
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: EASE_HUD, delay: 0.15 + i * 0.06 }}
                  >
                    <span className="mt-0.5 font-mono text-[11px] text-dim">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`font-display text-base uppercase tracking-wide ${got ? "text-text" : "text-dim"}`}>
                          {got ? a.title : "Classified"}
                        </span>
                        <span
                          className={`shrink-0 border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.14em] ${
                            got ? "border-water/50 text-water" : "border-line text-dim"
                          }`}
                        >
                          {got ? "FOUND" : "LOCKED"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-dim">{got ? a.detail : `Hint: ${a.hint}`}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
            <p className="hud-label border-t border-line px-5 py-2.5 !text-[9px]">
              Stored on this device only
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
