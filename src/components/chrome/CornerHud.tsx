"use client";

import { useEffect, useState } from "react";

import { profile } from "@/data/content";
import { togglePalette } from "@/lib/chrome-ui";
import { toggleSound, useSoundEnabled } from "@/lib/sound";

/** Top-left status strip and the top-right control cluster (palette trigger + sound toggle). */
export function CornerHud() {
  const overGames = useSectionUnderTop("games", 64);
  return (
    <>
      {/* Scrim so the fixed HUD never sits directly on body text; fades out over the light Game Room */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[69] hidden h-16 transition-opacity duration-500 [transition-timing-function:var(--ease-hud)] md:block"
        style={{
          opacity: overGames ? 0 : 1,
          background: "linear-gradient(to bottom, var(--bg) 0%, color-mix(in oklab, var(--bg) 70%, transparent) 55%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed left-4 top-4 z-[70] hidden items-center gap-1.5 border border-line bg-bg/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-dim md:flex"
      >
        <span className="text-text">EXP-CTRL</span>
        <span className="text-line-hi">{"//"}</span>
        <span>{profile.name}</span>
        <span className="text-line-hi">{"//"}</span>
        <span>LINK</span>
        <span aria-hidden className="led inline-block h-1.5 w-1.5 rounded-full bg-water" />
        <span className="sr-only">active</span>
      </div>

      <div
        className="fixed right-2 top-[5px] z-[75] flex items-center gap-1.5 md:right-[84px] md:top-4 md:gap-2"
      >
        <PaletteButton />
        <SoundButton />
      </div>
    </>
  );
}

const btn =
  "group relative flex h-[26px] items-center gap-1.5 border border-line bg-bg/85 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-dim transition-colors duration-300 hover:border-signal hover:text-signal md:h-[26px] md:px-2";

function PaletteButton() {
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
      aria-label="Open command palette"
      aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
    >
      <span className="text-text group-hover:text-signal">{mac ? "⌘" : "CTRL"}</span>
      <span>K</span>
    </button>
  );
}

function SoundButton() {
  const on = useSoundEnabled();
  return (
    <button type="button" onClick={toggleSound} className={btn} aria-pressed={on} aria-label="Interface sound">
      <span aria-hidden className="flex h-2.5 items-end gap-[2px]">
        {[0.5, 1, 0.7, 0.85].map((hgt, i) => (
          <span
            key={i}
            className={`w-[2px] origin-bottom ${on ? "bg-signal" : "bg-line-hi"}`}
            style={{
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

/** True while the section with `id` covers the top `band` px of the viewport. Re-renders only on change. */
function useSectionUnderTop(id: string, band: number): boolean {
  const [over, setOver] = useState(false);
  useEffect(() => {
    let raf = 0;
    let last = false;
    const check = () => {
      raf = 0;
      const el = document.getElementById(id);
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
  }, [id, band]);
  return over;
}
