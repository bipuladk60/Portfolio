// Minimal typed event emitter. Events emitted before anyone listens are queued
// and flushed to the first listener, so early calls (e.g. a toast fired on mount) are not lost.

export type Emitter<T> = {
  on: (fn: (value: T) => void) => () => void;
  emit: (value: T) => void;
};

export function createEmitter<T>({ queue = false }: { queue?: boolean } = {}): Emitter<T> {
  const listeners = new Set<(value: T) => void>();
  const pending: T[] = [];
  return {
    on(fn) {
      listeners.add(fn);
      if (queue && pending.length) pending.splice(0).forEach((v) => fn(v));
      return () => {
        listeners.delete(fn);
      };
    },
    emit(value) {
      if (!listeners.size) {
        if (queue) pending.push(value);
        return;
      }
      listeners.forEach((fn) => fn(value));
    },
  };
}
