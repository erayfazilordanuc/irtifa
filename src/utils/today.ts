import React from 'react';
import { AppState } from 'react-native';

import { dayKey, msUntilNextMidnight } from './dateUtils';

// "Şu an hangi gündeyiz" sorusunu paylaşan küçük depo — "Gün dönümünde yenileme".
//
// NEDEN: Günün içerikleri (nefes programı, tekerleme, günün sorusu) ekranlarda
// `React.useMemo(..., [])` ile **bir kez** hesaplanıyordu. Uygulama gece yarısını açık geçirirse ekran önceki günün içeriğinde takılı
// kalıyor, ancak bir sonraki tam yeniden yüklemede düzeliyordu.
//
// Bu değer diske YAZILMAZ: kalıcı bir durum değil, yalnızca takvimin kendisi.
// Bu yüzden `createPersistentStore` yerine bellekte duran bir depo.
//
// İki tetikleyici var ve ikisi de gerekli:
//   1. Bir sonraki yerel gece yarısına kurulan zamanlayıcı.
//   2. Uygulama öne geldiğinde (AppState 'active') yeniden kontrol — cihaz
//      uyurken/arka planda zamanlayıcılar kısılıp geç ateşlenebiliyor, tek
//      başına zamanlayıcıya güvenilmez.

let current = dayKey();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

function emitIfChanged(): void {
  const next = dayKey();
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

function schedule(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    emitIfChanged();
    schedule();
  }, msUntilNextMidnight());
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) schedule();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    // Kimse dinlemiyorsa zamanlayıcı boşuna dönmesin.
    if (listeners.size === 0 && timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
}

// Uygulama öne geldiğinde gün değişmiş olabilir; `storage.ts` de aynı deseni
// kullanıyor (modül seviyesinde tek dinleyici).
AppState.addEventListener('change', (state) => {
  if (state === 'active') emitIfChanged();
});

export function getDayKey(): string {
  return current;
}

/**
 * Bugünün tarih anahtarı ("2026-09-19"). Gün değişince abone bileşenler
 * yeniden render olur.
 *
 * Kullanımı: günün içeriğini hesaplayan `useMemo`'nun bağımlılık listesine
 * konur — `React.useMemo(() => pickDailyInterview(sectorId), [sectorId, day])`.
 */
export function useDayKey(): string {
  return React.useSyncExternalStore(subscribe, getDayKey, getDayKey);
}
