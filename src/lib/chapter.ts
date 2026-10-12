import { createStore, useStore } from "./store";
import { readStore, writeStore } from "./storage";

// Two chapters. Chapter 1 is the dark expedition HUD; the Warmer gate sits between them.
// Solving the gate (the answer is always Nepal) switches the whole page into chapter 2,
// Warmer's cartoon world. Solving is remembered so returning visitors are not gated again.
//
// The DOM contract, so CSS can react before React hydrates:
//   <html data-chapter="1">  gate locked, chapter-2 content hidden (set pre-paint by CHAPTER_BOOT_SCRIPT)
//   <html data-chapter="2">  gate solved, chapter-2 content shown and themed
// With no JS the attribute is never set and everything renders, so crawlers and no-JS users see all content.

export type Chapter = 1 | 2;

export const CHAPTER_KEY = "xc:chapter";

const store = createStore<Chapter>(1, () => (readStore("local", CHAPTER_KEY) === "2" ? 2 : 1));

function apply(ch: Chapter) {
  if (typeof document !== "undefined") document.documentElement.dataset.chapter = String(ch);
}

/** Current chapter. Renders 1 on the server and during hydration. */
export function useChapter(): Chapter {
  return useStore(store);
}

export function getChapter(): Chapter {
  return store.get();
}

/** Called by the gate once the visitor finds Nepal. */
export function unlockChapterTwo() {
  writeStore("local", CHAPTER_KEY, "2");
  store.set(2);
  apply(2);
  window.dispatchEvent(new CustomEvent("xc:chapter", { detail: 2 }));
}

/** Debug / palette helper: lock the gate again. */
export function relockGate() {
  writeStore("local", CHAPTER_KEY, "1");
  store.set(1);
  apply(1);
  window.dispatchEvent(new CustomEvent("xc:chapter", { detail: 1 }));
}

export function subscribeChapter(fn: () => void) {
  return store.subscribe(fn);
}

/** Inline, pre-paint: sets data-chapter from storage so there is no flash of the wrong chapter. */
export const CHAPTER_BOOT_SCRIPT = `try{document.documentElement.dataset.chapter=localStorage.getItem("${CHAPTER_KEY}")==="2"?"2":"1"}catch(e){document.documentElement.dataset.chapter="1"}`;
