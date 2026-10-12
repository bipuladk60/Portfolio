import { CHAPTER_TWO } from "@/data/camps";
import { getChapter, subscribeChapter } from "./chapter";
import { activeCamp } from "./chrome-ui";
import { createStore, useStore } from "./store";

// Which skin the global chrome wears. "toon" = Warmer's cartoon world: only when the gate is
// solved (chapter 2) AND the viewport is inside a chapter-2 camp. Chapter-1 regions stay "hud".

export type HudMode = "hud" | "toon";

export const hudMode = createStore<HudMode>("hud");
export const useHudMode = () => useStore(hudMode);

/** Recompute the mode from chapter + active camp; mirrors it to html[data-hud]. Returns an unsubscribe. */
export function startHudModeSync(): () => void {
  const sync = () => {
    const mode: HudMode = getChapter() === 2 && CHAPTER_TWO.includes(activeCamp.get()) ? "toon" : "hud";
    hudMode.set(mode);
    document.documentElement.dataset.hud = mode;
  };
  sync();
  const a = subscribeChapter(sync);
  const b = activeCamp.subscribe(sync);
  return () => {
    a();
    b();
  };
}

/** Palette "skip checkpoint" marks the next chapter unlock as a skip, so it doesn't award "nepal". */
let skipFlag = false;
export const flagChapterSkip = () => {
  skipFlag = true;
};
export const consumeChapterSkip = () => {
  const v = skipFlag;
  skipFlag = false;
  return v;
};
