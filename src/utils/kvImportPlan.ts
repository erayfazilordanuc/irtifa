// Saf JSON → SQLite aktarım planı (YAPILACAKLAR Bölüm 0.4, aşama 1).
//
// React Native / Expo bağımlılığı yok — girdi olarak dosya adı + ham metin
// çiftleri alır, hangi dosyaların `kv` tablosuna aktarılacağına karar verir.
// Gerçek dosya okuma / veritabanı yazma `db.native.ts`'te; bu dosya yalnızca
// kararı verir, böylece Node altında (`npx tsx`) doğrudan sınanabilir.

export type ImportCandidate = { fileName: string; raw: string };

export type ImportPlanResult = {
  toImport: { key: string; raw: string }[];
  /** JSON.parse başarısız olan dosya adları. */
  skippedInvalid: string[];
  /** `kv` tablosunda zaten bir değeri olduğu için dokunulmayan dosya adları. */
  skippedExisting: string[];
};

const JSON_EXT = '.json';

export function planKvImport(
  files: readonly ImportCandidate[],
  existingKeys: ReadonlySet<string>,
): ImportPlanResult {
  const toImport: { key: string; raw: string }[] = [];
  const skippedInvalid: string[] = [];
  const skippedExisting: string[] = [];

  for (const { fileName, raw } of files) {
    if (!fileName.endsWith(JSON_EXT)) continue; // .json olmayanlar yok sayılır

    const key = fileName.slice(0, -JSON_EXT.length);
    if (!key) continue; // anahtar boşsa (ör. yalnızca ".json") atla

    try {
      JSON.parse(raw); // yalnızca geçerliliği doğrulanır; kv'ye ham metin yazılır
    } catch {
      skippedInvalid.push(fileName);
      continue;
    }

    if (existingKeys.has(key)) {
      skippedExisting.push(fileName);
      continue;
    }

    toImport.push({ key, raw });
  }

  return { toImport, skippedInvalid, skippedExisting };
}
