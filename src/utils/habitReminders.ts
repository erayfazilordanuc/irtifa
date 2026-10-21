import React from 'react';

import { createPersistentStore } from './store';
import { dayKey } from './dateUtils';
import { HABIT_TEMPLATES, findHabitTemplate } from '../data/habitTemplates';
import type { HabitReminderPlanInput } from './habitPlan';

// Aralıklı hatırlatıcıların ayarları ve günlük sayaçları — YAPILACAKLAR Bölüm 4a.
//
// Her şablondan bir hatırlatıcı var (mülakat nefesi, duruş…); kullanıcı sıfırdan
// hatırlatıcı OLUŞTURMUYOR, listeden açıp aralığını/saatlerini ayarlıyor
// (KARARLAR "Kullanıcıdan içerik yazması istenmez"). Hepsi varsayılan olarak
// KAPALI: uygulama kendiliğinden bildirim yağdırmaz.
//
// Planlama bu depoda değil: `habitPlan.ts` hangi bildirimin ne zaman kurulacağını
// hesaplıyor, bildirimleri kuran taraf ayrı. Burası yalnızca durum tutuyor.

export type HabitReminder = {
  /** Şablon kimliği aynı zamanda hatırlatıcının kimliği. */
  id: string;
  enabled: boolean;
  intervalMinutes: number;
  /** Gece uyandırmasın diye aktif saat aralığı (yerel saat, bitiş dahil). */
  activeHours: { start: number; end: number };
  /** 0 = Pazar … 6 = Cumartesi. Boş dizi = her gün. */
  activeDays: number[];
  message: string;
};

/** Günlük sayaç: gün değişince sıfırdan başlar (dayKey ile). */
export type HabitCounter = { day: string; count: number };

export type HabitState = {
  reminders: Record<string, HabitReminder>;
  counters: Record<string, HabitCounter>;
};

export const DEFAULT_ACTIVE_HOURS = { start: 9, end: 22 };

/** Seçilebilir aralıklar (dakika) — Bölüm 4a'daki liste. */
export const HABIT_INTERVALS = [30, 45, 60, 90, 120] as const;

function defaultReminder(id: string): HabitReminder {
  const template = findHabitTemplate(id);
  return {
    id,
    enabled: false,
    intervalMinutes: template?.intervalMinutes ?? 60,
    activeHours: { ...DEFAULT_ACTIVE_HOURS },
    activeDays: [],
    message: template?.message ?? '',
  };
}

function defaultState(): HabitState {
  const reminders: Record<string, HabitReminder> = {};
  for (const template of HABIT_TEMPLATES) reminders[template.id] = defaultReminder(template.id);
  return { reminders, counters: {} };
}

function normalizeHours(value: unknown): { start: number; end: number } {
  const v = (value ?? {}) as Partial<{ start: number; end: number }>;
  const clamp = (n: unknown, fallback: number) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(23, Math.floor(n))) : fallback;
  const start = clamp(v.start, DEFAULT_ACTIVE_HOURS.start);
  const end = clamp(v.end, DEFAULT_ACTIVE_HOURS.end);
  // Bitiş başlangıçtan önce olamaz; bozuk kayıt varsayılana döner.
  return end < start ? { ...DEFAULT_ACTIVE_HOURS } : { start, end };
}

function normalizeReminder(id: string, value: unknown): HabitReminder {
  const base = defaultReminder(id);
  const v = (value ?? {}) as Partial<HabitReminder>;
  const days = Array.isArray(v.activeDays)
    ? [...new Set(v.activeDays.filter((d) => typeof d === 'number' && d >= 0 && d <= 6))]
    : base.activeDays;
  return {
    id,
    enabled: v.enabled === true,
    intervalMinutes:
      typeof v.intervalMinutes === 'number' && v.intervalMinutes >= 15
        ? Math.floor(v.intervalMinutes)
        : base.intervalMinutes,
    activeHours: normalizeHours(v.activeHours),
    activeDays: days,
    message: typeof v.message === 'string' && v.message.trim() ? v.message : base.message,
  };
}

/** Diskteki kayıt eksik/bozuk olsa da çökmeyen birleştirme; yeni şablonlar kendiliğinden gelir. */
function hydrate(stored: unknown): HabitState {
  const v = (stored ?? {}) as Partial<HabitState>;
  const storedReminders = (v.reminders ?? {}) as Record<string, unknown>;
  const reminders: Record<string, HabitReminder> = {};
  for (const template of HABIT_TEMPLATES) {
    reminders[template.id] = normalizeReminder(template.id, storedReminders[template.id]);
  }

  const storedCounters = (v.counters ?? {}) as Record<string, unknown>;
  const counters: Record<string, HabitCounter> = {};
  for (const [id, entry] of Object.entries(storedCounters)) {
    const e = (entry ?? {}) as Partial<HabitCounter>;
    if (typeof e.day !== 'string') continue;
    counters[id] = {
      day: e.day,
      count: typeof e.count === 'number' && e.count > 0 ? Math.floor(e.count) : 0,
    };
  }

  return { reminders, counters };
}

export const habitStore = createPersistentStore<HabitState>('habit-reminders', defaultState(), hydrate);

/** Bugünün sayacı — gün değiştiyse 0 döner (kayıt dünden kalmış olabilir). */
export function habitCount(state: HabitState, id: string, date: Date = new Date()): number {
  const entry = state.counters[id];
  return entry && entry.day === dayKey(date) ? entry.count : 0;
}

/** Açık hatırlatıcıların planlayıcıya (`habitPlan.ts`) verilecek hâli. */
export function planInputs(state: HabitState): HabitReminderPlanInput[] {
  return HABIT_TEMPLATES.filter((template) => state.reminders[template.id]?.enabled).map(
    (template) => {
      const reminder = state.reminders[template.id];
      return {
        id: reminder.id,
        enabled: reminder.enabled,
        title: template.label,
        message: reminder.message,
        intervalMinutes: reminder.intervalMinutes,
        activeHours: reminder.activeHours,
        activeDays: reminder.activeDays,
      };
    },
  );
}

export function setHabitEnabled(id: string, enabled: boolean): void {
  habitStore.set((prev) => ({
    ...prev,
    reminders: { ...prev.reminders, [id]: { ...prev.reminders[id], enabled } },
  }));
}

export function updateHabit(id: string, patch: Partial<Omit<HabitReminder, 'id'>>): void {
  habitStore.set((prev) => ({
    ...prev,
    reminders: { ...prev.reminders, [id]: { ...prev.reminders[id], ...patch } },
  }));
}

/** Atölye sekmesindeki karttan ve bildirime dokunuşta artar. */
export function incrementHabit(id: string, date: Date = new Date()): void {
  habitStore.set((prev) => {
    const today = dayKey(date);
    const entry = prev.counters[id];
    const count = entry && entry.day === today ? entry.count + 1 : 1;
    return { ...prev, counters: { ...prev.counters, [id]: { day: today, count } } };
  });
}

export function resetHabitCount(id: string, date: Date = new Date()): void {
  habitStore.set((prev) => ({
    ...prev,
    counters: { ...prev.counters, [id]: { day: dayKey(date), count: 0 } },
  }));
}

export function useHabits(): HabitState {
  return habitStore.use();
}

/** Açık hatırlatıcı sayısı — ekranlarda özet satırı için. */
export function enabledHabitCount(state: HabitState): number {
  return Object.values(state.reminders).filter((reminder) => reminder.enabled).length;
}
