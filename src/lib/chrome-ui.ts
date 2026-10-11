import { createStore, useStore } from "./store";

// Open/closed state for chrome overlays that several components can trigger
// (the corner HUD button, the keyboard shortcut, the Konami code, palette commands).

type ChromeUI = { palette: boolean; devlog: boolean };

export const chromeUI = createStore<ChromeUI>({ palette: false, devlog: false });

export const openPalette = () => chromeUI.set((s) => ({ ...s, palette: true, devlog: false }));
export const closePalette = () => chromeUI.set((s) => (s.palette ? { ...s, palette: false } : s));
export const togglePalette = () =>
  chromeUI.set((s) => ({ ...s, palette: !s.palette, devlog: false }));
export const openDevLog = () => chromeUI.set((s) => ({ ...s, devlog: true, palette: false }));
export const closeDevLog = () => chromeUI.set((s) => (s.devlog ? { ...s, devlog: false } : s));

export const useChromeUI = () => useStore(chromeUI);

/** Id of the camp currently under the altimeter, published for anyone who wants to react to it. */
export const activeCamp = createStore<string>("base");
export const useActiveCamp = () => useStore(activeCamp);
