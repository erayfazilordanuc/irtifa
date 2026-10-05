import { appSettingsStore, useAppSettings } from './appSettings';
import { hasApiKey, useApiKey } from './aiCredentials';

/**
 * Yapay zekânın o an kullanılabilir olup olmadığı — tek kaynak.
 *
 * Kural (KARARLAR → "Yapay zekâ uygulamayla gelir, ama şart değildir"):
 * uygulama yapay zekâ olmadan da **tam** çalışır. Bu yüzden yapay zekâ isteyen
 * her yer, çağrıyı yapıp hatayı yakalamak yerine önce buraya sorar.
 *
 * Eskiden böyle değildi: ekranlar çağrıyı yapıyor, `GeminiError` yakalayıp
 * mesajını olduğu gibi basıyordu. Sunucu tanımsızken kullanıcı şunu görüyordu:
 * "Sunucu adresi tanımlı değil. Ayarlar → Backend API Adresi alanını doldurun."
 * Bu bir son kullanıcı cümlesi değil, geliştirici talimatı.
 *
 * İKİ YOL (bkz. `geminiClient.ts`): kullanıcının kendi anahtarı (varsayılan)
 * ya da sunucu adresi. Biri yeterli.
 */
export function aiAvailable(): boolean {
  return hasApiKey() || appSettingsStore.get().apiBaseUrl.trim().length > 0;
}

/** Bileşen içinde canlı okuma; anahtar girilince ya da adres değişince yeniden render eder. */
export function useAiAvailable(): boolean {
  const { apiBaseUrl } = useAppSettings();
  const apiKey = useApiKey();
  return Boolean(apiKey) || apiBaseUrl.trim().length > 0;
}

/**
 * Yapay zekâ kapalıyken gösterilecek ortak, teknik olmayan açıklama.
 *
 * Yanında her zaman kuruluma götüren bir düğme bulunur (`AiInsightCard`,
 * `AnalysisScreen`) — eskiden yalnızca bu cümle vardı ve kullanıcı nereden
 * açacağını bulamıyordu.
 */
export const AI_UNAVAILABLE_HINT =
  'Yapay zekâ değerlendirmesi henüz açık değil. Kayıtların yerinde duruyor; ' +
  'ücretsiz bir Google anahtarı ekleyerek birkaç adımda açabilirsin.';
