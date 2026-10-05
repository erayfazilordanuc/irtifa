import { createPersistentStore } from './store';

// Uygulama düzeyi ayarlar (Ayarlar ekranı).
// Günlük pratik modüllerinin ayarları ayrı bir dosyada: dailyPracticeSettings.tsx

/** Hatırlatıcı sıklığı — "kapalı" seçilirse hiçbir hatırlatma kurulmaz. */
export type ReminderFrequency = 'off' | 'daily' | 'everyOtherDay';

export type AppSettings = {
  /** Gemini proxy'sini çalıştıran Express sunucusunun adresi. */
  apiBaseUrl: string;
  /**
   * Sunucu `APP_TOKEN` ile korunuyorsa buradaki değer her istekte
   * `x-app-token` başlığıyla gönderilir. Sunucuda tanımlı değilse boş bırakılır.
   */
  appToken: string;
  reminderFrequency: ReminderFrequency;
};

/**
 * Varsayılan boş: sunucu adresi geliştiricinin yerel ağına göre değiştiği için
 * buraya bir IP gömülemez (gömülü olan `192.168.1.53` yalnızca tek bir makinede
 * çalışıyordu, diğer herkeste sessizce bozuktu). Adres Ayarlar → Sunucu'dan
 * giriliyor; boşken `geminiClient` "NO_BASE_URL" ile açık bir uyarı veriyor.
 */
export const DEFAULT_API_BASE_URL = '';

/** Ayarlar ekranındaki giriş alanına ipucu olarak gösterilecek biçim. */
export const API_BASE_URL_PLACEHOLDER = 'http://192.168.1.20:3000';

const DEFAULTS: AppSettings = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  appToken: '',
  reminderFrequency: 'daily',
};

export const appSettingsStore = createPersistentStore<AppSettings>('app-settings', DEFAULTS);

export function useAppSettings() {
  return appSettingsStore.use();
}

export function updateAppSettings(patch: Partial<AppSettings>): void {
  appSettingsStore.set((prev) => ({ ...prev, ...patch }));
}

/** Sonundaki eğik çizgiyi temizler; "http://" yoksa ekler. */
export function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

export const REMINDER_FREQUENCY_LABELS: Record<ReminderFrequency, string> = {
  off: 'Kapalı',
  daily: 'Her Gün',
  everyOtherDay: '2 Günde 1',
};
