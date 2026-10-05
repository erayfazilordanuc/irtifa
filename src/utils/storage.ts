import { AppState, Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

import { kvAvailable, kvDelete, kvGet, kvSetMany } from './db';

// Basit JSON kalıcılık katmanı. Arka uç: web'de localStorage; native'de SQLite
// (`expo-sqlite`, bkz. `db.native.ts`) kullanılabilirse SQLite, değilse
// expo-file-system ile dosya (YAPILACAKLAR Bölüm 0.4, aşama 1 — bu geçiş
// yalnızca arka ucu değiştirir, aşağıdaki dışa aktarımlar ve davranışları
// birebir aynı kalır). Dosya arka ucu hâlâ SQLite açılamayan (native modül
// yok, göç/aktarım başarısız) durumlar için yedek yol olarak duruyor.
//
// Yazma davranışı: `writeJson` diske ANINDA yazmaz. Değeri bellekteki önbelleğe
// koyar ve kısa bir gecikmeyle tek seferde diske aktarır. Sebebi, her ayar
// değişikliğinin (anahtar çevirme, saat ayarlama, sayaç artırma) senkron bir
// dosya yazımı tetiklemesi ve bunun JS thread'ini bloklamasıydı; art arda gelen
// değişikliklerde bu fark ediliyordu.
//
// Okuma senkron kalıyor: store'lar modül yüklenirken ilk değerlerini buradan
// alıyor. Önbellek okumada da devrede olduğu için yazdıktan hemen sonra okumak
// güncel değeri döndürür (diske/SQLite'a henüz inmemiş olsa bile).
//
// Bilinen sınır: aktarım (JSON → SQLite) yapıldıktan sonraki bir oturumda
// SQLite açılamaz ve dosya arka ucuna düşülürse, o oturumun yazımları bir
// sonraki açılışta SQLite'taki (daha güncel) değerin gerisinde kalır — SQLite
// tekrar açıldığında dosyadaki ara yazım okunmaz.
const STORE_DIR = 'irtifa-store';

/** Yazma gecikmesi. Kullanıcı bir ayarla oynarken yazımları tek dosya işlemine indirir. */
const FLUSH_DELAY_MS = 250;

// Web hedefinde (expo start --web) dosya sistemi yok, localStorage'a düşüyoruz.
const isWeb = Platform.OS === 'web';

/** Diske inmeyi bekleyen değerler. Anahtar → serileştirilmiş JSON. */
const pending = new Map<string, string>();
/** Bu oturumda okunmuş/yazılmış değerler; diskten tekrar okumayı gereksiz kılar. */
const cache = new Map<string, string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function storeFile(key: string): File {
  const dir = new Directory(Paths.document, STORE_DIR);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return new File(dir, `${key}.json`);
}

function writeNow(key: string, raw: string): void {
  try {
    if (isWeb) {
      globalThis.localStorage?.setItem(`${STORE_DIR}:${key}`, raw);
      return;
    }
    const file = storeFile(key);
    if (!file.exists) file.create({ intermediates: true, overwrite: true });
    file.write(raw);
  } catch (e) {
    console.warn(`[storage] "${key}" yazılamadı.`, e);
  }
}

/** Bekleyen tüm yazımları diske/SQLite'a aktarır. */
export function flushPendingWrites(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (pending.size === 0) return;

  if (!isWeb && kvAvailable()) {
    // Anlık görüntü al: transaction başarılı olursa yalnızca o an yazılan
    // değerle eşleşen girdileri sileceğiz. JS tek thread olduğu için
    // withTransactionSync sırasında pending'e yeni bir yazım pratikte
    // düşemez, ama savunmacı olarak (aynı anahtara yeni değer geldiyse onu
    // silmeme) karşılaştırmayı yine de yapıyoruz.
    const snapshot = Array.from(pending.entries()).map(([key, raw]) => ({ key, raw }));
    const ok = kvSetMany(snapshot);
    if (ok) {
      for (const { key, raw } of snapshot) {
        if (pending.get(key) === raw) pending.delete(key);
      }
      return;
    }
    console.warn('[storage] SQLite toplu yazım başarısız, bekleyen değişiklikler korunuyor.');
    return;
  }

  for (const [key, raw] of pending) writeNow(key, raw);
  pending.clear();
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushPendingWrites();
  }, FLUSH_DELAY_MS);
}

// Uygulama arka plana alınırken bekleyen ne varsa hemen yazılır — aksi hâlde
// kullanıcı uygulamayı kapattığında son değişiklik kaybolabilirdi.
AppState.addEventListener('change', (state) => {
  if (state !== 'active') flushPendingWrites();
});

export function readJson<T>(key: string, fallback: T): T {
  try {
    const cached = cache.get(key);
    if (cached !== undefined) return JSON.parse(cached) as T;

    let raw: string | null | undefined;
    if (isWeb) {
      raw = globalThis.localStorage?.getItem(`${STORE_DIR}:${key}`);
    } else if (kvAvailable()) {
      raw = kvGet(key);
    } else {
      const file = storeFile(key);
      raw = file.exists ? file.textSync() : null;
    }

    if (raw == null) return fallback;
    cache.set(key, raw);
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] "${key}" okunamadı, varsayılana dönülüyor.`, e);
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  try {
    const raw = JSON.stringify(value);
    cache.set(key, raw);
    pending.set(key, raw);
    scheduleFlush();
  } catch (e) {
    console.warn(`[storage] "${key}" serileştirilemedi.`, e);
  }
}

export function removeJson(key: string): void {
  cache.delete(key);
  pending.delete(key);
  try {
    if (isWeb) {
      globalThis.localStorage?.removeItem(`${STORE_DIR}:${key}`);
      return;
    }
    if (kvAvailable()) {
      kvDelete(key);
      return;
    }
    const file = storeFile(key);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn(`[storage] "${key}" silinemedi.`, e);
  }
}
