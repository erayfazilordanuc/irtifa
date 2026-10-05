// SQLite arka ucu — web ve tip karşılığı (YAPILACAKLAR Bölüm 0.4, aşama 1).
//
// Web hedefinde (`expo start --web`) `expo-sqlite` derlemeye HİÇ girmez: bu
// dosya onu import etmiyor. Metro, iOS/Android derlemesinde bunun yerine
// `db.native.ts`'i seçer (platform uzantısı önceliği); orada gerçek SQLite
// açılır, göç edilir ve tek seferlik JSON aktarımı yapılır.
//
// `storage.ts` web'de zaten bu dosyaya hiç danışmadan doğrudan localStorage'a
// gidiyor (bkz. storage.ts'teki `isWeb` dalı) — aşağıdaki gövdeler bu yüzden
// pratikte hiç çağrılmıyor; yalnızca `db.native.ts` ile aynı dışa aktarım
// yüzeyini taşıyıp tip/derleme simetrisini korumak için burada duruyorlar.

export function kvAvailable(): boolean {
  return false;
}

export function kvGet(_key: string): string | null {
  return null;
}

export function kvSetMany(_entries: { key: string; raw: string }[]): boolean {
  return false;
}

export function kvDelete(_key: string): void {
  // no-op — web zaten localStorage kullanıyor, bu yola hiç girilmiyor.
}

export function storageBackend(): 'sqlite' | 'file' | 'web' {
  return 'web';
}

// Aşama 2 (interview_sessions / exercise_logs) — web'de tablo yok, hep kv/
// localStorage yoluna düşülür; `collectionStore.ts` bunu `historyTablesReady()
// === false` üzerinden anlar.

export function historyTablesReady(): boolean {
  return false;
}

export function dbAll<T>(_sql: string, _params: (string | number | null)[]): T[] {
  return [];
}

export function dbRun(_sql: string, _params: (string | number | null)[]): boolean {
  return false;
}

export function dbTransaction(_task: () => void): boolean {
  return false;
}
