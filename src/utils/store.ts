import React from 'react';
import { readJson, writeJson } from './storage';

// Ekranlar arasında paylaşılan, diske yazan küçük durum deposu.
// Provider gerektirmez: React'in useSyncExternalStore'u ile abone olan her ekran
// aynı anda güncellenir. Böylece App.tsx'e yeni bir sarmalayıcı eklemeye gerek kalmıyor.

export type PersistentStore<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  /** Bileşen içinde canlı okuma. */
  use: () => T;
  subscribe: (listener: () => void) => () => void;
};

export function createPersistentStore<T>(
  key: string,
  defaults: T,
  /** Diskteki kayıt eskiyse varsayılanla birleştirir; yeni alan eklendiğinde eski kayıtlar bozulmaz. */
  hydrate: (stored: unknown) => T = (stored) =>
    stored && typeof stored === 'object' ? { ...defaults, ...(stored as object) } as T : defaults,
): PersistentStore<T> {
  let state = hydrate(readJson<unknown>(key, null));
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const get = () => state;

  const set = (next: T | ((prev: T) => T)) => {
    const value = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
    if (Object.is(value, state)) return;
    state = value;
    writeJson(key, state);
    listeners.forEach((listener) => listener());
  };

  const use = () => React.useSyncExternalStore(subscribe, get, get);

  return { get, set, use, subscribe };
}
