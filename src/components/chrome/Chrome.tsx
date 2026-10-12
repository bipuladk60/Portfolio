"use client";

import { useEffect } from "react";
import { playBlip } from "@/lib/sound";
import { startHudModeSync } from "@/lib/hud-mode";
import { restoreTheme } from "@/lib/theme";
import { Altimeter } from "./Altimeter";
import { CommandPalette } from "./CommandPalette";
import { CornerHud } from "./CornerHud";
import { Crosshair } from "./Crosshair";
import { EasterEggs } from "./EasterEggs";
import { Terrain } from "./Terrain";
import { Toaster } from "./Toaster";

const LOST_TITLE = "SIGNAL LOST · return to base";

/**
 * Global chrome: terrain background, HUD, altimeter, command palette, easter eggs,
 * toasts and the crosshair cursor. Mounted once above <main>.
 */
export function Chrome() {
  useTabTitle();
  useGlobalEffects();

  return (
    <>
      <Terrain />
      <CornerHud />
      <Altimeter />
      <CommandPalette />
      <EasterEggs />
      <Toaster />
      <Crosshair />
    </>
  );
}

function useTabTitle() {
  useEffect(() => {
    let saved: string | null = null;
    const lose = () => {
      if (saved !== null) return;
      saved = document.title;
      document.title = LOST_TITLE;
    };
    const restore = () => {
      if (saved === null) return;
      document.title = saved;
      saved = null;
    };
    const onVisibility = () => (document.hidden ? lose() : restore());
    window.addEventListener("blur", lose);
    window.addEventListener("focus", restore);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      restore();
      window.removeEventListener("blur", lose);
      window.removeEventListener("focus", restore);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}

function useGlobalEffects() {
  useEffect(() => {
    restoreTheme();
    const stopHudSync = startHudModeSync();
    // Click blip on any interactive element (no-op while sound is off).
    const onDown = (e: PointerEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest('a[href], button, [role="button"], [data-cursor]')) {
        playBlip("click");
      }
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      stopHudSync();
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);
}
