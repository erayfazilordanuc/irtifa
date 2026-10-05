import { createPersistentStore } from './store';
import { MAX_ALARMS, normalizeDays, type AlarmPlanInput, type AlarmTime } from './alarmPlan';

// Kullanıcının kendi kurduğu alarmlar — YAPILACAKLAR Bölüm 4b.
//
// 4a'daki aralıklı hatırlatıcılardan farkı: orada hazır şablonlar var ve
// kullanıcı yalnızca açıp ayarlıyor. Burada liste kullanıcıya ait — ekliyor,
// düzenliyor, siliyor. KARARLAR'daki "Kullanıcıdan içerik yazması istenmez"
// kuralı modül içeriği için; kişinin kendi alarmının etiketi zaten kişiye ait
// bir veri. Yine de etiket **zorunlu değil**: hazır etiket çipleri var ve boş
// bırakılırsa "Alarm" yazıyor.

export type CustomAlarm = {
  id: string;
  label: string;
  enabled: boolean;
  time: AlarmTime;
  /** 0 = Pazar … 6 = Cumartesi. Boş dizi = her gün. */
  days: number[];
};

export type AlarmState = { alarms: CustomAlarm[] };

/** Etiket yazmak zorunda kalınmasın diye hazır seçenekler. */
export const ALARM_LABEL_PRESETS = [
  'Uyanış',
  'Sabah rutini',
  'İlaç',
  'Spor',
  'Ders / çalışma',
  'Kitap',
  'Uyku vakti',
];

export const DEFAULT_ALARM_TIME: AlarmTime = { hour: 8, minute: 0 };

function normalizeTime(value: unknown): AlarmTime {
  const v = (value ?? {}) as Partial<AlarmTime>;
  const clamp = (n: unknown, max: number, fallback: number) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : fallback;
  return {
    hour: clamp(v.hour, 23, DEFAULT_ALARM_TIME.hour),
    minute: clamp(v.minute, 59, DEFAULT_ALARM_TIME.minute),
  };
}

function normalizeAlarm(value: unknown): CustomAlarm | null {
  const v = (value ?? {}) as Partial<CustomAlarm>;
  if (typeof v.id !== 'string' || !v.id) return null;
  return {
    id: v.id,
    label: typeof v.label === 'string' ? v.label.slice(0, 60) : '',
    enabled: v.enabled === true,
    time: normalizeTime(v.time),
    days: Array.isArray(v.days) ? normalizeDays(v.days) : [],
  };
}

/** Bozuk kayıtlar sessizce atılıyor; tek bir kötü satır listeyi düşürmesin. */
function hydrate(stored: unknown): AlarmState {
  const v = (stored ?? {}) as Partial<AlarmState>;
  const list = Array.isArray(v.alarms) ? v.alarms : [];
  const alarms: CustomAlarm[] = [];
  for (const entry of list) {
    const alarm = normalizeAlarm(entry);
    if (alarm && alarms.length < MAX_ALARMS) alarms.push(alarm);
  }
  return { alarms };
}

export const alarmStore = createPersistentStore<AlarmState>('custom-alarms', { alarms: [] }, hydrate);

/** Çakışmayan kimlik: zaman damgası + rastgele son ek (aynı milisaniyede iki ekleme olsa da ayrışır). */
function newAlarmId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function addAlarm(
  input: { label?: string; time?: AlarmTime; days?: number[] } = {},
): CustomAlarm | null {
  const state = alarmStore.get();
  if (state.alarms.length >= MAX_ALARMS) return null;

  const alarm: CustomAlarm = {
    id: newAlarmId(),
    label: (input.label ?? '').slice(0, 60),
    enabled: true,
    time: normalizeTime(input.time ?? DEFAULT_ALARM_TIME),
    days: normalizeDays(input.days ?? []),
  };
  alarmStore.set((prev) => ({ alarms: [...prev.alarms, alarm] }));
  return alarm;
}

export function updateAlarm(id: string, patch: Partial<Omit<CustomAlarm, 'id'>>): void {
  alarmStore.set((prev) => ({
    alarms: prev.alarms.map((alarm) => {
      if (alarm.id !== id) return alarm;
      const next = { ...alarm, ...patch };
      return {
        ...next,
        label: next.label.slice(0, 60),
        time: normalizeTime(next.time),
        days: normalizeDays(next.days),
      };
    }),
  }));
}

export function removeAlarm(id: string): void {
  alarmStore.set((prev) => ({ alarms: prev.alarms.filter((alarm) => alarm.id !== id) }));
}

export function setAlarmEnabled(id: string, enabled: boolean): void {
  alarmStore.set((prev) => ({
    alarms: prev.alarms.map((alarm) => (alarm.id === id ? { ...alarm, enabled } : alarm)),
  }));
}

export function useAlarms(): AlarmState {
  return alarmStore.use();
}

/** Planlayıcıya (`alarmPlan.ts`) verilecek hâl — depo şekliyle zaten uyumlu. */
export function alarmPlanInputs(state: AlarmState): AlarmPlanInput[] {
  return state.alarms;
}

export function enabledAlarmCount(state: AlarmState): number {
  return state.alarms.filter((alarm) => alarm.enabled).length;
}
