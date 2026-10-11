"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/content";
import { togglePalette, useActiveCamp } from "@/lib/chrome-ui";
import { toggleSound, useSoundEnabled } from "@/lib/sound";

/** Top-left status strip and the top-right control cluster (palette trigger + sound toggle). */
export function CornerHud() {
  const camp = useActiveCamp();
  const dim = camp === "chautari";
  return (
    <>
      <div
        className="pointer-events-none fixed left-4 top-4 z-[70] hidden items-center gap-2 border border-line bg-bg/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-dim transition-opacity duration-700 md:flex"
        style={{ opacity: dim ? 0.45 : 1 }}
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
        className="fixed right-2 top-[5px] z-[75] flex items-center gap-1.5 transition-opacity duration-700 md:right-[84px] md:top-4 md:gap-2"
        style={{ opacity: dim ? 0.55 : 1 }}
      >
        <PaletteButton />
        <SoundButton />
      </div>
    </>
  );
}

const btn =
  "group relative flex h-[26px] items-center gap-1.5 border border-line bg-bg/85 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-dim transition-colors duration-300 hover:border-signal hover:text-signal md:h-[28px] md:px-2.5";

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
