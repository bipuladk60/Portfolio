import { useSyncExternalStore } from "react";

// Tiny external store. `init` runs lazily on the client the first time the value is read,
// which is where persisted values (localStorage) get loaded. Server and hydration renders
// always see `initial`, so persisted state never causes a hydration mismatch.

export type Store<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (fn: () => void) => () => void;
  readonly initial: T;
};

export function createStore<T>(initial: T, init?: () => T): Store<T> {
  let state = initial;
  let ready = !init;
  const subs = new Set<() => void>();

  const ensure = () => {
    if (ready || typeof window === "undefined") return;
    ready = true;
    try {
      state = init!();
    } catch {
      state = initial;
    }
  };

  return {
    initial,
    get() {
      ensure();
      return state;
    },
    set(next) {
      ensure();
      const value = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      if (Object.is(value, state)) return;
      state = value;
      subs.forEach((fn) => fn());
    },
    subscribe(fn) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.initial);
}
