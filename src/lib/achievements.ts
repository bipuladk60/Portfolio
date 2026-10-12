import { createStore, useStore } from "./store";
import { readLocal, writeLocal } from "./storage";
import { toast } from "./toast";
import { playBlip } from "./sound";

export type AchievementId = "namaste" | "konami" | "palette" | "nepal";

export const ACHIEVEMENTS: { id: AchievementId; title: string; hint: string; detail: string }[] = [
  {
    id: "nepal",
    title: "Found Nepal",
    hint: "The checkpoint has exactly one right answer.",
    detail: "Found Nepal at the checkpoint.",
  },
  {
    id: "palette",
    title: "Mission console",
    hint: "Every control room has a keyboard shortcut.",
    detail: "Opened the command palette.",
  },
  {
    id: "namaste",
    title: "Namaste",
    hint: "Greet the mountain the way Nepal does.",
    detail: "Himalaya theme unlocked.",
  },
  {
    id: "konami",
    title: "Old school",
    hint: "Up, up, down, down...",
    detail: "Entered the Konami code. Dev Log opened.",
  },
];

const KEY = "xc:achievements";
// Unknown ids from older versions (e.g. a removed "summit" entry) are dropped on load.
const VALID = new Set<string>(ACHIEVEMENTS.map((a) => a.id));

export const achievementStore = createStore<AchievementId[]>([], () => {
  const raw = readLocal(KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed)
    ? (parsed.filter((v) => typeof v === "string" && VALID.has(v)) as AchievementId[])
    : [];
});

export const useAchievements = () => useStore(achievementStore);
export const isUnlocked = (id: AchievementId) => achievementStore.get().includes(id);

/** Unlock a secret. Returns true only the first time; announces it with a toast and a chime. */
export function unlock(
  id: AchievementId,
  {
    silent = false,
    toastDelay = 0,
    toastDuration = 3200,
    toastTitle,
    toastMessage,
  }: { silent?: boolean; toastDelay?: number; toastDuration?: number; toastTitle?: string; toastMessage?: string } = {},
): boolean {
  if (isUnlocked(id)) return false;
  achievementStore.set((prev) => [...prev, id]);
  writeLocal(KEY, JSON.stringify(achievementStore.get()));
  if (!silent) {
    const a = ACHIEVEMENTS.find((x) => x.id === id)!;
    const count = achievementStore.get().length;
    const announce = () => {
      toast(toastMessage ?? `${a.title} · ${count}/${ACHIEVEMENTS.length} secrets`, {
        title: toastTitle ?? "Achievement unlocked",
        tone: "water",
        duration: toastDuration,
      });
      playBlip("unlock");
    };
    if (toastDelay > 0 && typeof window !== "undefined") window.setTimeout(announce, toastDelay);
    else announce();
  }
  return true;
}
