import React from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Kullanıcının kendi Gemini API anahtarı (BYOK — "kendi anahtarını getir").
//
// Kullanıcı kararı 2026-09-20: yapay zekâ, uygulamayı kuran herkesin **kendi**
// anahtarıyla çalışır. Böylece ne ortak bir kota paylaşılıyor ne de bir sunucu
// ayakta tutulması gerekiyor. Sunucu (proxy) yolu kodda duruyor ve ileride
// açılabilir — bkz. `geminiClient.ts` ve YAPILACAKLAR Bölüm 00.
//
// NEDEN AYRI DOSYA / NEDEN `storage.ts` DEĞİL: anahtar hassas veri.
// `storage.ts` her şeyi düz JSON olarak uygulamanın belge klasörüne yazıyor ve
// o klasör cihaz yedeklemesine giriyor. Anahtar bunun yerine işletim
// sisteminin kasasında duruyor: iOS'ta Keychain, Android'de Keystore
// (`expo-secure-store`). `WHEN_UNLOCKED_THIS_DEVICE_ONLY` ile hem cihaz kilitli
// değilken okunabiliyor hem de yedeğe/başka cihaza kopyalanmıyor.
//
// SENKRONLUK: SecureStore yalnızca eşzamansız okunuyor, oysa uygulamanın geri
// kalanı (`aiAvailable()`) senkron cevap bekliyor. Bu yüzden anahtar açılışta
// bir kez okunup bellekte tutuluyor; ekranlar `useApiKey()` ile abone oluyor.

const KEY_NAME = 'gemini-api-key';
const isWeb = Platform.OS === 'web';

/** Anahtarın bellekteki kopyası. `null` = yok, okuma bitmiş olabilir de olmayabilir de. */
let cachedKey: string | null = null;
/** İlk okuma tamamlandı mı — "anahtar yok" ile "henüz bakmadık"ı ayırmak için. */
let loaded = false;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Web'de SecureStore yok; orada `localStorage`'a düşülüyor. Web hedefi
 * geliştirme/önizleme için, gerçek kullanım mobilde.
 */
function webGet(): string | null {
  try {
    return globalThis.localStorage?.getItem(KEY_NAME) ?? null;
  } catch {
    return null;
  }
}

function webSet(value: string | null): void {
  try {
    if (value === null) globalThis.localStorage?.removeItem(KEY_NAME);
    else globalThis.localStorage?.setItem(KEY_NAME, value);
  } catch {
    // Gizli sekmede ya da depolama kapalıyken sessizce geç.
  }
}

/**
 * Anahtarı kasadan belleğe okur. Uygulama açılışında bir kez çağrılır
 * (`App.tsx`). Başarısız olursa anahtar yok sayılır — yapay zekâ kapalı
 * görünür, uygulamanın geri kalanı etkilenmez.
 */
export async function loadApiKey(): Promise<void> {
  try {
    cachedKey = isWeb ? webGet() : await SecureStore.getItemAsync(KEY_NAME);
  } catch (e) {
    console.warn('[aiCredentials] anahtar okunamadı.', e);
    cachedKey = null;
  } finally {
    loaded = true;
    notify();
  }
}

/** Bellekteki anahtar — senkron. Okuma bitmediyse `null`. */
export function getApiKey(): string | null {
  return cachedKey && cachedKey.trim().length > 0 ? cachedKey : null;
}

export function hasApiKey(): boolean {
  return getApiKey() !== null;
}

/** İlk okuma tamamlandı mı. Kurulum ekranı "yükleniyor" ayrımı için kullanır. */
export function isKeyLoaded(): boolean {
  return loaded;
}

export async function saveApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (trimmed.length === 0) {
    await clearApiKey();
    return;
  }
  try {
    if (isWeb) {
      webSet(trimmed);
    } else {
      await SecureStore.setItemAsync(KEY_NAME, trimmed, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }
    cachedKey = trimmed;
    notify();
  } catch (e) {
    console.warn('[aiCredentials] anahtar kaydedilemedi.', e);
    throw new Error('Anahtar cihaza kaydedilemedi.');
  }
}

export async function clearApiKey(): Promise<void> {
  try {
    if (isWeb) webSet(null);
    else await SecureStore.deleteItemAsync(KEY_NAME);
  } catch (e) {
    console.warn('[aiCredentials] anahtar silinemedi.', e);
  } finally {
    cachedKey = null;
    notify();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Bileşen içinde canlı okuma; anahtar girilince/silinince yeniden render eder. */
export function useApiKey(): string | null {
  return React.useSyncExternalStore(subscribe, getApiKey, getApiKey);
}

/**
 * Ekranda gösterilecek maskelenmiş biçim: "AIza…7f3K".
 * Anahtarın tamamı hiçbir yerde gösterilmiyor — omuz üstünden okunmasın ve
 * ekran görüntüsüyle paylaşılmasın diye.
 */
export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••';
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

/**
 * Google AI Studio anahtarları bugün "AIza" ile başlıyor ve 35+ karakter.
 * Bu, yanlış yapıştırmayı (ör. bir URL ya da eksik kopyalama) erken yakalamak
 * için **uyarı** amaçlı; kesin doğrulama değil, çünkü biçim Google'ın elinde.
 * Gerçek doğrulama `testConnection()` ile canlı çağrıdan geliyor.
 */
export function looksLikeApiKey(key: string): boolean {
  const trimmed = key.trim();
  return /^AIza[0-9A-Za-z_-]{30,}$/.test(trimmed);
}

/** Anahtarın alındığı sayfa — kurulum ekranındaki "Ücretsiz anahtar al" düğmesi buraya gider. */
export const API_KEY_CONSOLE_URL = 'https://aistudio.google.com/apikey';
