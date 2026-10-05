// Saf legacy-kv → satır listesi planı (YAPILACAKLAR Bölüm 0.4, aşama 2).
//
// React Native / Expo bağımlılığı yok — `interview-history` / `exercise-history`
// kv değerlerinin (JSON.parse edilmiş hâli) hangi satırların yeni SQLite
// tablolarına ekleneceğine karar verir. Gerçek okuma / transaction
// `db.native.ts`'te; bu dosya yalnızca kararı verir, böylece Node altında
// (`npx tsx`) doğrudan sınanabilir.

export type HistoryRowsPlan<T> = {
  /** Eklenecek öğeler, ESKİDEN YENİYE sıralı (kaynak dizi en yeni başta olduğu
   *  için ters çevrilir) — böylece INSERT sırası arttıkça `rowid` de tazelikle
   *  birlikte artar. */
  rows: T[];
  /** `isValid` geçmediği için atlanan öğe sayısı. */
  skippedInvalid: number;
  /** Aynı id ile daha önce görülmüş (dizideki daha yeni bir kopyası tutulan) öğe sayısı. */
  skippedDuplicate: number;
};

/**
 * `legacy` (örn. `{ sessions: [...] }` ya da `{ logs: [...] }`) içindeki
 * `field` dizisini satır planına çevirir.
 *
 * - `legacy` null / nesne değil / `field` dizi değilse → boş plan.
 * - `isValid` geçmeyen öğe atlanır ve sayılır.
 * - Aynı `id` birden çok kez varsa dizideki İLK GÖRÜLEN (yani en yeni) tutulur,
 *   sonrakiler atlanır ve sayılır.
 */
export function planHistoryRows<T>(
  legacy: unknown,
  field: string,
  isValid: (v: unknown) => v is T,
  idOf: (item: T) => string,
): HistoryRowsPlan<T> {
  const empty: HistoryRowsPlan<T> = { rows: [], skippedInvalid: 0, skippedDuplicate: 0 };
  if (!legacy || typeof legacy !== 'object') return empty;

  const arr = (legacy as Record<string, unknown>)[field];
  if (!Array.isArray(arr)) return empty;

  const seen = new Set<string>();
  const keptNewestFirst: T[] = [];
  let skippedInvalid = 0;
  let skippedDuplicate = 0;

  for (const item of arr) {
    if (!isValid(item)) {
      skippedInvalid++;
      continue;
    }
    const id = idOf(item);
    if (seen.has(id)) {
      skippedDuplicate++;
      continue;
    }
    seen.add(id);
    keptNewestFirst.push(item);
  }

  // Kaynak dizi en yeni başta; çıktı eskiden yeniye olmalı (bkz. tip yorumu).
  const rows = keptNewestFirst.slice().reverse();

  return { rows, skippedInvalid, skippedDuplicate };
}
