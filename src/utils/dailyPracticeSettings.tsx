import React from 'react';
import { readJson, writeJson } from './storage';

// Günlük pratik modüllerinin (diyafram, konuşma) ayarları.
// Tüm özellikler bu ayarlara bağlıdır: kapalıysa ne kart görünür ne bildirim kurulur.

export type TimeOfDay = { hour: number; minute: number };

export type BreathingLevel = 1 | 2 | 3;

/**
 * Nefes egzersizinin çalışma biçimi.
 * 'daily'       → her gün tekrarlanan kısa bakım programı (seviyeden bağımsız)
 * 'progressive' → seviye seviye uzayan, dayanıklılık çalıştıran uzun program
 */
export type BreathingMode = 'daily' | 'progressive';

export type ModuleSettings = {
  /** Modül tamamen açık mı — kapalıysa ana ekranda kartı da çıkmaz. */
  enabled: boolean;
  /** Bu modül için günlük hatırlatma bildirimi kurulsun mu. */
  reminder: boolean;
  time: TimeOfDay;
};

/** Modül ayarları / hatırlatma kontrollerinin ortak anahtar kümesi. */
export type DailyModuleKey = 'diaphragm' | 'speech';

export type DailyPracticeSettings = {
  /** Ana bildirim şalteri. Kapalıysa hiçbir modül bildirim kurmaz. */
  notificationsEnabled: boolean;

  diaphragm: ModuleSettings & { mode: BreathingMode; level: BreathingLevel };
  speech: ModuleSettings & { includeTongueTwisters: boolean; includeFillerHunt: boolean };
};

export const DEFAULT_SETTINGS: DailyPracticeSettings = {
  notificationsEnabled: false,
  diaphragm: {
    enabled: true,
    reminder: true,
    time: { hour: 8, minute: 0 },
    mode: 'daily',
    level: 1,
  },
  speech: {
    enabled: true,
    reminder: true,
    time: { hour: 19, minute: 0 },
    includeTongueTwisters: true,
    includeFillerHunt: true,
  },
};

const STORAGE_KEY = 'daily-practice-settings';

/** Kayıtlı ayarı varsayılanla birleştirir; yeni alan eklendiğinde eski kayıtlar bozulmaz. */
function mergeSettings(stored: Partial<DailyPracticeSettings> | null): DailyPracticeSettings {
  if (!stored) return DEFAULT_SETTINGS;
  const mergeModule = <T extends ModuleSettings>(base: T, patch: Partial<T> | undefined): T => ({
    ...base,
    ...(patch ?? {}),
    time: { ...base.time, ...(patch?.time ?? {}) },
  });
  return {
    ...DEFAULT_SETTINGS,
    notificationsEnabled: stored.notificationsEnabled ?? DEFAULT_SETTINGS.notificationsEnabled,
    diaphragm: mergeModule(DEFAULT_SETTINGS.diaphragm, stored.diaphragm),
    speech: mergeModule(DEFAULT_SETTINGS.speech, stored.speech),
  };
}

export function loadSettings(): DailyPracticeSettings {
  return mergeSettings(readJson<Partial<DailyPracticeSettings> | null>(STORAGE_KEY, null));
}

export function saveSettings(settings: DailyPracticeSettings): void {
  writeJson(STORAGE_KEY, settings);
}

/** Bir modülün bildirimi gerçekten kurulacak mı — ana şalter + modül + hatırlatma. */
export function reminderActive(settings: DailyPracticeSettings, module: DailyModuleKey): boolean {
  const m = settings[module];
  return settings.notificationsEnabled && m.enabled && m.reminder;
}

type SettingsContextValue = {
  settings: DailyPracticeSettings;
  /** Üst seviye alanları günceller (notificationsEnabled). */
  setSetting: <K extends keyof DailyPracticeSettings>(
    key: K,
    value: DailyPracticeSettings[K],
  ) => void;
  /** Bir modülün alanlarını kısmi olarak günceller. */
  updateModule: <K extends DailyModuleKey>(key: K, patch: Partial<DailyPracticeSettings[K]>) => void;
  resetSettings: () => void;
};

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function DailyPracticeSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<DailyPracticeSettings>(() => loadSettings());

  // Her değişiklikte diske yaz. Ayar ekranı kapanmadan da kalıcı olur.
  const commit = React.useCallback((next: DailyPracticeSettings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const setSetting = React.useCallback<SettingsContextValue['setSetting']>(
    (key, value) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveSettings(next);
        return next;
      });
    },
    [],
  );

  const updateModule = React.useCallback<SettingsContextValue['updateModule']>((key, patch) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: { ...prev[key], ...patch } };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = React.useCallback(() => commit(DEFAULT_SETTINGS), [commit]);

  const value = React.useMemo(
    () => ({ settings, setSetting, updateModule, resetSettings }),
    [settings, setSetting, updateModule, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useDailyPracticeSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error(
      'useDailyPracticeSettings, <DailyPracticeSettingsProvider> içinde kullanılmalı.',
    );
  }
  return ctx;
}
