"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { INK, PAPER, YELLOW } from "@/components/toon/toon";
import { profile } from "@/data/content";
import { useHudMode } from "@/lib/hud-mode";
import { togglePalette } from "@/lib/chrome-ui";
import { toggleSound, useSoundEnabled } from "@/lib/sound";

/** Top-left status strip and the top-right control cluster (palette trigger + sound toggle). */
export function CornerHud() {
  const overGames = useSectionUnderTop("#games", 64);
  const overChapterTwo = useSectionUnderTop("[data-chapter2-root]", 64);
  const toon = useHudMode() === "toon";
  const scrimOff = overGames || overChapterTwo || toon;
  return (
    <>
      {/* Scrim so the fixed HUD never sits directly on body text; fades out over the light Game Room */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[69] hidden h-16 transition-opacity duration-500 [transition-timing-function:var(--ease-hud)] md:block"
        style={{
          opacity: scrimOff ? 0 : 1,
          background: "linear-gradient(to bottom, var(--bg) 0%, color-mix(in oklab, var(--bg) 70%, transparent) 55%, transparent 100%)",
        }}
      />
      <div
        className={`pointer-events-none fixed left-4 top-4 z-[70] hidden items-center gap-1.5 border border-line bg-bg/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-dim md:flex ${SKIN_TRANSITION}`}
        style={skin(toon, true)}
      >
        <span style={{ color: toon ? INK : "var(--text)" }}>{toon ? "WARMER" : "EXP-CTRL"}</span>
        <span style={{ color: toon ? INK : "var(--line-hi)", opacity: toon ? 0.4 : 1 }}>{"//"}</span>
        <span>{profile.name}</span>
        <span style={{ color: toon ? INK : "var(--line-hi)", opacity: toon ? 0.4 : 1 }}>{"//"}</span>
        <span>LINK</span>
        <span aria-hidden className="led inline-block h-1.5 w-1.5 rounded-full bg-water" />
        <span className="sr-only">active</span>
      </div>

      <div
        className="fixed right-2 top-[5px] z-[75] flex items-center gap-1.5 md:right-[84px] md:top-4 md:gap-2"
      >
        <PaletteButton toon={toon} />
        <SoundButton toon={toon} />
      </div>
    </>
  );
}

const SKIN_TRANSITION =
  "transition-[background-color,border-color,border-radius,box-shadow,color] duration-500 [transition-timing-function:var(--ease-hud)]";

const btn = `group relative flex h-[26px] items-center gap-1.5 border border-line bg-bg/85 px-2 text-[10px] uppercase tracking-[0.14em] text-dim hover:border-signal hover:text-signal md:h-[26px] md:px-2.5 ${SKIN_TRANSITION}`;

/** Dark HUD box vs. Warmer's white ink pill. Inline so it overrides the HUD classes while active. */
function skin(toon: boolean, wide = false): CSSProperties {
  return toon
    ? {
        background: PAPER,
        borderColor: INK,
        borderWidth: 2,
        borderRadius: 999,
        boxShadow: `2px 2px 0 ${INK}`,
        color: INK,
        fontFamily: "var(--font-fredoka), var(--font-nunito), system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: wide ? "0.08em" : "0.06em",
      }
    : { fontFamily: "var(--font-mono-face), ui-monospace, monospace" };
}

function PaletteButton({ toon }: { toon: boolean }) {
  const [mac, setMac] = useState(true);
  useEffect(() => {
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
      navigator.platform ??
      "";
    setMac(/mac|iphone|ipad/i.test(platform));
  }, []);
  return (
    <button
      type="button"
      onClick={togglePalette}
      className={btn}
      style={skin(toon)}
      aria-label="Open command palette"
      aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
    >
      <span className={toon ? "" : "text-text group-hover:text-signal"}>{mac ? "⌘" : "CTRL"}</span>
      <span>K</span>
    </button>
  );
}

function SoundButton({ toon }: { toon: boolean }) {
  const on = useSoundEnabled();
  return (
    <button
      type="button"
      onClick={toggleSound}
      className={btn}
      style={skin(toon)}
      aria-pressed={on}
      aria-label="Interface sound"
    >
      <span aria-hidden className="flex h-2.5 items-end gap-[2px]">
        {[0.5, 1, 0.7, 0.85].map((hgt, i) => (
          <span
            key={i}
            className={`w-[2px] origin-bottom ${on ? "bg-signal" : "bg-line-hi"}`}
            style={{
              ...(toon ? { background: on ? YELLOW : INK, outline: on ? `1px solid ${INK}` : undefined } : null),
              height: `${(on ? hgt : 0.3) * 100}%`,
              animation: on ? `xc-eq 0.9s ${i * 0.12}s ease-in-out infinite alternate` : undefined,
            }}
          />
        ))}
      </span>
      <span className="hidden sm:inline">{on ? "SND ON" : "SND OFF"}</span>
      <style>{`@keyframes xc-eq { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }`}</style>
    </button>
  );
}

/** True while the element matching `selector` covers the top `band` px of the viewport. Re-renders only on change. */
function useSectionUnderTop(selector: string, band: number): boolean {
  const [over, setOver] = useState(false);
  useEffect(() => {
    let raf = 0;
    let last = false;
    const check = () => {
      raf = 0;
      const el = document.querySelector(selector);
      const r = el?.getBoundingClientRect();
      const next = !!r && r.top < band && r.bottom > 0;
      if (next !== last) {
        last = next;
        setOver(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [selector, band]);
  return over;
}
