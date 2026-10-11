// Guarded Web Storage access. Storage can throw (private mode, blocked site data, SSR),
// so every read and write is wrapped and degrades to "nothing stored".

type Area = "local" | "session";

function area(kind: Area): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStore(kind: Area, key: string): string | null {
  try {
    return area(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStore(kind: Area, key: string, value: string): void {
  try {
    area(kind)?.setItem(key, value);
  } catch {
    /* storage unavailable: keep in-memory state only */
  }
}

export const readLocal = (key: string) => readStore("local", key);
export const writeLocal = (key: string, value: string) => writeStore("local", key, value);
export const readSession = (key: string) => readStore("session", key);
export const writeSession = (key: string, value: string) => writeStore("session", key, value);
