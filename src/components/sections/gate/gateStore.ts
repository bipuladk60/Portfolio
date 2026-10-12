import { createStore } from "@/lib/store";
import { readStore, writeStore } from "@/lib/storage";

// How many guesses the visitor needed at the checkpoint (null if unknown, e.g. skipped or a fresh device).
const KEY = "xc:gate-guesses";

export const gateGuesses = createStore<number | null>(null, () => {
  const v = Number(readStore("local", KEY));
  return Number.isFinite(v) && v > 0 ? v : null;
});

export function rememberGuesses(n: number | null) {
  writeStore("local", KEY, n ? String(n) : "");
  gateGuesses.set(n);
}

// --- geometry -------------------------------------------------------------

export type LatLon = { lat: number; lon: number };
export const HALF_EARTH_KM = 20015;

export function km(a: LatLon, b: LatLon) {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Initial great-circle bearing from a to b, degrees clockwise from north. */
export function bearing(a: LatLon, b: LatLon) {
  const r = Math.PI / 180;
  const p1 = a.lat * r;
  const p2 = b.lat * r;
  const dl = (b.lon - a.lon) * r;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
export const compassWord = (deg: number) => COMPASS[Math.round(deg / 45) % 8];

export const roundKm = (d: number) => (Math.round(d / 10) * 10).toLocaleString("en-US");
