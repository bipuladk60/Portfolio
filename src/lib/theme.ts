import { createStore, useStore } from "./store";
import { readLocal, writeLocal } from "./storage";
import { isUnlocked } from "./achievements";

// Themes swap a handful of CSS custom properties inline on <html> and set data-theme,
// so every Tailwind token (bg-bg, text-signal, border-line...) follows automatically.

export type ThemeName = "amber" | "kathmandu";

const OVERRIDES: Record<ThemeName, Record<string, string>> = {
  amber: {},
  // Temple brick, marigold and dusk: Kathmandu valley at lamp-lighting time.
  kathmandu: {
    "--bg": "#0d0a09",
    "--panel": "#15100d",
    "--panel-2": "#1c1511",
    "--line": "#2c221d",
    "--line-hi": "#46362c",
    "--signal": "#ff8a2a",
    "--sky": "#5b8cf0",
    "--fire": "#e8483f",
  },
};

const ALL_KEYS = Array.from(new Set(Object.values(OVERRIDES).flatMap((o) => Object.keys(o))));
const KEY = "xc:theme";

export const themeStore = createStore<ThemeName>("amber", () =>
  readLocal(KEY) === "kathmandu" ? "kathmandu" : "amber",
);

export const useTheme = () => useStore(themeStore);

export function applyTheme(name: ThemeName): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = name;
  ALL_KEYS.forEach((k) => root.style.removeProperty(k));
  Object.entries(OVERRIDES[name]).forEach(([k, v]) => root.style.setProperty(k, v));
}

/** Switch theme. Kathmandu stays locked until the namaste easter egg is found; returns false if refused. */
export function setTheme(name: ThemeName): boolean {
  if (name === "kathmandu" && !isUnlocked("namaste")) return false;
  themeStore.set(name);
  writeLocal(KEY, name);
  applyTheme(name);
  return true;
}

/** Re-apply the persisted theme after hydration. */
export function restoreTheme(): void {
  const t = themeStore.get();
  if (t === "kathmandu" && !isUnlocked("namaste")) return;
  if (t !== "amber") applyTheme(t);
}
