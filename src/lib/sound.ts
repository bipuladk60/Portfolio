import { createStore, useStore } from "./store";
import { readLocal, writeLocal } from "./storage";

// WebAudio-synthesised UI sounds. No audio files. OFF by default; the toggle persists
// in localStorage. Every public call is a silent no-op while sound is off or unsupported.

export type BlipKind = "hover" | "click" | "transmit" | "boot" | "unlock" | "open" | "close" | "error";

const KEY = "xc:sound";

export const soundStore = createStore<boolean>(false, () => readLocal(KEY) === "on");

export const useSoundEnabled = () => useStore(soundStore);
export const isSoundEnabled = () => soundStore.get();

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let lastHover = 0;
let gestureHooked = false;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
    master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}

/** Browsers only start audio after a gesture; resume on the first one if sound was left on. */
function hookGesture() {
  if (gestureHooked || typeof window === "undefined") return;
  gestureHooked = true;
  const resume = () => {
    if (soundStore.get()) ensureContext();
    window.removeEventListener("pointerdown", resume);
    window.removeEventListener("keydown", resume);
  };
  window.addEventListener("pointerdown", resume, { passive: true });
  window.addEventListener("keydown", resume);
}

export function setSoundEnabled(on: boolean): void {
  soundStore.set(on);
  writeLocal(KEY, on ? "on" : "off");
  if (on) {
    ensureContext();
    playBlip("click");
  }
}

export const toggleSound = () => setSoundEnabled(!soundStore.get());

type ToneOpts = {
  type?: OscillatorType;
  from: number;
  to?: number;
  at?: number;
  dur: number;
  gain?: number;
};

function tone(c: AudioContext, out: AudioNode, { type = "sine", from, to = from, at = 0, dur, gain = 0.2 }: ToneOpts) {
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.012, dur * 0.25));
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env);
  env.connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function hum(c: AudioContext, out: AudioNode) {
  const t0 = c.currentTime;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(180, t0);
  filter.frequency.exponentialRampToValueAtTime(900, t0 + 0.9);
  filter.frequency.exponentialRampToValueAtTime(240, t0 + 1.6);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(0.16, t0 + 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.7);
  filter.connect(env);
  env.connect(out);
  [55, 110.6, 164.4].forEach((f) => {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.connect(filter);
    o.start(t0);
    o.stop(t0 + 1.8);
  });
}

/** Play a UI sound. Safe to call from anywhere; does nothing while sound is off. */
export function playBlip(kind: BlipKind): void {
  if (typeof window === "undefined") return;
  hookGesture();
  if (!soundStore.get()) return;
  const c = ensureContext();
  if (!c || !master || c.state !== "running") return;

  switch (kind) {
    case "hover": {
      const now = performance.now();
      if (now - lastHover < 45) return;
      lastHover = now;
      tone(c, master, { type: "sine", from: 2400, dur: 0.028, gain: 0.05 });
      break;
    }
    case "click":
      tone(c, master, { type: "square", from: 920, to: 540, dur: 0.06, gain: 0.07 });
      break;
    case "open":
      tone(c, master, { type: "triangle", from: 440, to: 880, dur: 0.12, gain: 0.12 });
      break;
    case "close":
      tone(c, master, { type: "triangle", from: 880, to: 420, dur: 0.1, gain: 0.1 });
      break;
    case "error":
      tone(c, master, { type: "square", from: 180, dur: 0.09, gain: 0.08 });
      tone(c, master, { type: "square", from: 140, at: 0.1, dur: 0.12, gain: 0.08 });
      break;
    case "transmit":
      tone(c, master, { type: "sine", from: 600, to: 2400, dur: 0.16, gain: 0.14 });
      tone(c, master, { type: "sine", from: 2400, at: 0.18, dur: 0.05, gain: 0.1 });
      tone(c, master, { type: "sine", from: 3200, at: 0.25, dur: 0.05, gain: 0.08 });
      break;
    case "unlock":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(c, master!, { type: "triangle", from: f, at: i * 0.07, dur: 0.18, gain: 0.12 }),
      );
      break;
    case "boot":
      hum(c, master);
      break;
  }
}
