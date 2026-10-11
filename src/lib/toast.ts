import { createEmitter } from "./emitter";

// Global toast bus. Any client component can call `toast("COPIED")`; the Toaster in
// the chrome layer renders it. Calls made before the Toaster mounts are queued.

export type ToastTone = "signal" | "sky" | "fire" | "water" | "air";

export type ToastOptions = {
  /** Small mono heading above the message. Defaults to "TRANSMISSION". */
  title?: string;
  /** Accent colour token. Defaults to "signal". */
  tone?: ToastTone;
  /** Milliseconds on screen. Defaults to 3200. */
  duration?: number;
};

export type ToastItem = Required<ToastOptions> & { id: number; message: string };

const bus = createEmitter<ToastItem>({ queue: true });
let seq = 0;

export function toast(message: string, options: ToastOptions = {}): number {
  const id = ++seq;
  bus.emit({
    id,
    message,
    title: options.title ?? "Transmission",
    tone: options.tone ?? "signal",
    duration: options.duration ?? 3200,
  });
  return id;
}

export const onToast = bus.on;
