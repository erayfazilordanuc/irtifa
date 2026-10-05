import { Directory, File, Paths } from 'expo-file-system';
import type { SQLiteDatabase } from 'expo-sqlite';

import { planKvImport } from './kvImportPlan';
import { planHistoryRows } from './historyRowsPlan';

// SQLite arka ucu — yalnızca native (iOS/Android) derlemede seçilir (Metro
// `.native.ts` uzantısını `db.ts`'e tercih eder). YAPILACAKLAR Bölüm 0.4,
// aşama 1: kalıcılık katmanının arka ucunu dosyalardan SQLite'a taşımak.
//
// GEÇ VE KORUMALI YÜKLEME: `expo-sqlite` burada dosyanın tepesinde DEĞER
// olarak import EDİLMİYOR (yalnızca tip için `import type`, derlemede iz
// bırakmıyor). Sebep: `expo-sqlite/build/ExpoSQLite.js:2`
// (`requireNativeModule('ExpoSQLite')`) modül yüklenirken, yani başka bir
// dosya `import ... from 'expo-sqlite'` yazdığı an, senkron olarak çalışıyor.
// Native modül derlemeye linklenmemişse (ör. `expo-sqlite` paket.json'a
// eklendi ama cihazdaki geliştirme derlemesi henüz yeniden derlenmedi) bu üst
// düzey import senkron olarak fırlar; `storage.ts` (dolayısıyla bu dosya) ilk
// kez import edildiği anda — yani App.tsx yüklenirken — uygulama açılışta
// çöker. Bunun yerine `expo-sqlite` yalnızca ilk gerçek kullanımda
// `require('expo-sqlite')` ile, `try/catch` içinde yüklenir; başarısız olursa
// bir kez uyarıp dosya depolamasına sessizce düşülür.

const STORE_DIR = 'irtifa-store';
const DB_NAME = 'irtifa.db';
const SCHEMA_VERSION = 4;
const JSON_IMPORT_META_KEY = 'json_import_v1';
const HISTORY_MIGRATION_META_KEY = 'history_tables_v1';

type SQLiteModule = typeof import('expo-sqlite');
type Migration = (database: SQLiteDatabase) => void;

/** Sıralı göç listesi — dizideki index, kaynak `user_version`'a karşılık gelir. */
const MIGRATIONS: Migration[] = [
  // v0 -> v1: kv (storage.ts'in dışarı bakan API'si) ve meta (göç/aktarım durumu).
  (database) => {
    database.execSync(`
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  },
  // v1 -> v2: mülakat oturumları ve egzersiz kayıtları için kendi tabloları
  // (YAPILACAKLAR Bölüm 0.4, aşama 2). `data` sütunu kaydın tamamını JSON
  // olarak taşır; diğer sütunlar yalnızca (şu an var olmayan) filtre/istatistik
  // sorguları için — bugün yalnızca `SELECT data ... ORDER BY created_at, rowid`
  // ile okunuyorlar.
  (database) => {
    database.execSync(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        rating REAL,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_interview_sessions_created ON interview_sessions(created_at);
      CREATE TABLE IF NOT EXISTS exercise_logs (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        category TEXT,
        effort REAL,
        duration_seconds REAL,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_exercise_logs_created ON exercise_logs(created_at);
    `);
  },
  // v2 -> v3: yanıt defteri (`responseHistory.ts`). Aynı karma şema: sorgulanacak
  // birkaç sütun + kaydın tamamı `data`'da JSON. Buranın göçü yok — depo yeni,
  // taşınacak eski `kv` bloğu bulunmuyor; tablo boş başlar.
  (database) => {
    database.execSync(`
      CREATE TABLE IF NOT EXISTS practice_responses (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        module TEXT,
        ref_id TEXT,
        correct INTEGER,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_practice_responses_created ON practice_responses(created_at);
      CREATE INDEX IF NOT EXISTS idx_practice_responses_module ON practice_responses(module);
    `);
  },
  // v3 -> v4: iş hayatı & kariyer yönetimi (YAPILACAKLAR_İRTİFA Bölüm 2.5).
  // Başvuru takibi ve STAR hikâyeleri kayıt biriktiren depolar; aynı karma
  // şema (sorgulanacak birkaç sütun + `data`'da kaydın tamamı). Şirket notları
  // tabloya alınmadı: kurum başına tek kısa metin, `kv` yolu yeterli.
  (database) => {
    database.execSync(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        stage TEXT,
        company TEXT,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at);
      CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
      CREATE TABLE IF NOT EXISTS star_stories (
        id TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL,
        title TEXT,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_star_stories_created ON star_stories(created_at);
    `);
  },
  // İleride aşama 3 tabloları (test_results, catalog_questions,
  // catalog_drills, ...) buraya sırayla eklenecek.
];

let db: SQLiteDatabase | null = null;
/** ensureDb() bu oturumda bir kez denenir; başarısızsa tekrar denenmez (senkron API'de yeniden deneme davranışı belirsizleşir). */
let initTried = false;
let warned = false;

function warnOnce(message: string, err?: unknown): void {
  if (warned) return;
  warned = true;
  console.warn(message, err);
}

function loadSqlite(): SQLiteModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-sqlite') as SQLiteModule;
  } catch (e) {
    warnOnce('[db] expo-sqlite native modülü yüklenemedi, dosya depolamasına düşülüyor.', e);
    return null;
  }
}

function runMigrations(database: SQLiteDatabase): void {
  const row = database.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version >= SCHEMA_VERSION) return;
  database.withTransactionSync(() => {
    for (let v = version; v < SCHEMA_VERSION; v++) {
      MIGRATIONS[v](database);
    }
    // PRAGMA user_version parametre kabul etmiyor; SCHEMA_VERSION sabit bir
    // tamsayı sabiti olduğu için doğrudan gömülmesi güvenli.
    database.execSync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  });
}

/** `irtifa-store/` altındaki tüm `*.json` dosyalarını okur. Sabit anahtar listesi yok — bilinmeyen dosyalar da dahil. */
function readStoreFiles(): { fileName: string; raw: string }[] {
  const dir = new Directory(Paths.document, STORE_DIR);
  if (!dir.exists) return [];

  const files: { fileName: string; raw: string }[] = [];
  for (const entry of dir.list()) {
    if (!(entry instanceof File)) continue; // alt klasör beklenmiyor, korunaklı davran
    try {
      files.push({ fileName: entry.name, raw: entry.textSync() });
    } catch (e) {
      console.warn(`[db] "${entry.name}" okunamadı, aktarım dışı bırakıldı.`, e);
    }
  }
  return files;
}

/**
 * Tek seferlik JSON → SQLite aktarımı. `meta.json_import_v1` zaten varsa hiçbir
 * şey yapmaz. Aksi hâlde tüm ekleme + meta yazımı TEK transaction'da olur;
 * transaction hata verirse geri alınır ve fırlatılan hata `ensureDb()`
 * tarafından yakalanır (bu oturumda SQLite kullanılmaz sayılır, dosya arka
 * ucuna düşülür) — yarım aktarım hiçbir zaman diskte kalmaz.
 */
function runOneTimeImport(database: SQLiteDatabase): void {
  const already = database.getFirstSync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    [JSON_IMPORT_META_KEY],
  );
  if (already) return;

  const files = readStoreFiles();
  const existingRows = database.getAllSync<{ key: string }>('SELECT key FROM kv');
  const existingKeys = new Set(existingRows.map((r) => r.key));

  const { toImport, skippedInvalid, skippedExisting } = planKvImport(files, existingKeys);

  const summary = {
    importedAt: new Date().toISOString(),
    imported: toImport.length,
    skippedInvalid: skippedInvalid.length,
    skippedExisting: skippedExisting.length,
  };

  database.withTransactionSync(() => {
    const now = Date.now();
    for (const { key, raw } of toImport) {
      database.runSync('INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?)', [key, raw, now]);
    }
    database.runSync('INSERT INTO meta (key, value) VALUES (?, ?)', [
      JSON_IMPORT_META_KEY,
      JSON.stringify(summary),
    ]);
  });

  if (skippedInvalid.length > 0) {
    console.warn(`[db] JSON aktarımı: ${skippedInvalid.length} bozuk dosya atlandı.`, skippedInvalid);
  }
  // NOT: kaynak .json dosyaları SİLİNMİYOR — aktarımdan sonra da yedek olarak kalırlar.
}

type LegacyInterviewSession = { id: string; timestamp: string; analysis?: { rating?: unknown } };
type LegacyExerciseLog = {
  id: string;
  timestamp: string;
  categoryLabel?: unknown;
  effort?: unknown;
  durationSeconds?: unknown;
};

function isLegacyInterviewSession(v: unknown): v is LegacyInterviewSession {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.timestamp === 'string';
}

function isLegacyExerciseLog(v: unknown): v is LegacyExerciseLog {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.timestamp === 'string';
}

/**
 * Bu oturumda geçmiş tabloları (`interview_sessions`, `exercise_logs`,
 * `practice_responses`) okuma için hazır mı. Üçü aynı bayrağı paylaşıyor:
 * hepsi aynı göç zincirinde yaratılıyor, biri yoksa diğerleri de yok.
 */
let historyReady = false;

export function historyTablesReady(): boolean {
  ensureDb();
  return historyReady;
}

/**
 * `kv` içindeki `interview-history` / `exercise-history` bloklarını
 * `interview_sessions` / `exercise_logs` tablolarına taşır — YAPILACAKLAR
 * Bölüm 0.4, aşama 2. Aşama 1'in JSON→kv aktarımından AYRI ve bölünmez bir
 * göç: kendi meta anahtarı (`HISTORY_MIGRATION_META_KEY`) var, kendi
 * transaction'ında çalışır, `ensureDb()`'de aşama 1'den SONRA çağrılır ve
 * çağıranı (ensureDb) ayrı bir try/catch ile sarar — bu göç başarısız olsa
 * bile `kv` (aşama 1) tablosu ve `db` bağlantısı geçerliliğini korur; yalnızca
 * `historyReady` false kalır ve depolar (interviewHistory/exerciseHistory)
 * `kv` yoluna düşer. Meta satırı zaten varsa (göç daha önce tamamlanmış)
 * yeniden çalışmaz.
 */
function runHistoryMigration(database: SQLiteDatabase): void {
  const already = database.getFirstSync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [
    HISTORY_MIGRATION_META_KEY,
  ]);
  if (already) {
    historyReady = true;
    return;
  }

  const interviewRow = database.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [
    'interview-history',
  ]);
  const exerciseRow = database.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [
    'exercise-history',
  ]);

  let legacyInterviews: unknown = null;
  try {
    legacyInterviews = interviewRow ? JSON.parse(interviewRow.value) : null;
  } catch (e) {
    console.warn('[db] "interview-history" JSON ayrıştırılamadı, göç bu alan için boş sayılıyor.', e);
  }
  let legacyExercises: unknown = null;
  try {
    legacyExercises = exerciseRow ? JSON.parse(exerciseRow.value) : null;
  } catch (e) {
    console.warn('[db] "exercise-history" JSON ayrıştırılamadı, göç bu alan için boş sayılıyor.', e);
  }

  const interviewPlan = planHistoryRows(
    legacyInterviews,
    'sessions',
    isLegacyInterviewSession,
    (s) => s.id,
  );
  const exercisePlan = planHistoryRows(legacyExercises, 'logs', isLegacyExerciseLog, (l) => l.id);

  const summary = {
    migratedAt: new Date().toISOString(),
    interviewSessions: interviewPlan.rows.length,
    interviewSkippedInvalid: interviewPlan.skippedInvalid,
    interviewSkippedDuplicate: interviewPlan.skippedDuplicate,
    exerciseLogs: exercisePlan.rows.length,
    exerciseSkippedInvalid: exercisePlan.skippedInvalid,
    exerciseSkippedDuplicate: exercisePlan.skippedDuplicate,
  };

  database.withTransactionSync(() => {
    for (const session of interviewPlan.rows) {
      const rating = typeof session.analysis?.rating === 'number' ? session.analysis.rating : null;
      database.runSync(
        'INSERT OR REPLACE INTO interview_sessions (id, created_at, rating, data) VALUES (?, ?, ?, ?)',
        [session.id, session.timestamp, rating, JSON.stringify(session)],
      );
    }
    for (const log of exercisePlan.rows) {
      const category = typeof log.categoryLabel === 'string' ? log.categoryLabel : null;
      const effort = typeof log.effort === 'number' ? log.effort : null;
      const durationSeconds = typeof log.durationSeconds === 'number' ? log.durationSeconds : null;
      database.runSync(
        'INSERT OR REPLACE INTO exercise_logs (id, created_at, category, effort, duration_seconds, data) VALUES (?, ?, ?, ?, ?, ?)',
        [log.id, log.timestamp, category, effort, durationSeconds, JSON.stringify(log)],
      );
    }
    database.runSync('INSERT INTO meta (key, value) VALUES (?, ?)', [
      HISTORY_MIGRATION_META_KEY,
      JSON.stringify(summary),
    ]);
  });

  historyReady = true;
  // NOT: kaynak kv kayıtları (interview-history, exercise-history) SİLİNMİYOR — yedek olarak kalırlar.
}

/** Veritabanını açar, göçleri ve tek seferlik aktarımları uygular. Bu oturumda bir kez çalışır. */
function ensureDb(): SQLiteDatabase | null {
  if (initTried) return db;
  initTried = true;

  const SQLite = loadSqlite();
  if (!SQLite) return null;

  try {
    const database = SQLite.openDatabaseSync(DB_NAME);
    database.execSync('PRAGMA journal_mode = WAL;');
    runMigrations(database);
    runOneTimeImport(database);
    db = database;
  } catch (e) {
    warnOnce('[db] SQLite başlatılamadı, dosya depolamasına düşülüyor.', e);
    db = null;
    return null;
  }

  // Aşama 2 göçü kasıtlı olarak AYRI try/catch'te: başarısız olursa `db` null
  // yapılmaz, yalnızca `historyReady` false kalır — kv (aşama 1) çalışmaya
  // devam eder, bir sonraki açılışta göç yeniden denenir.
  try {
    runHistoryMigration(db);
  } catch (e) {
    console.warn(
      '[db] Geçmiş tabloları göçü başarısız, interview/exercise geçmişi kv üzerinden çalışmaya devam ediyor.',
      e,
    );
    historyReady = false;
  }

  return db;
}

export function kvAvailable(): boolean {
  return ensureDb() !== null;
}

export function kvGet(key: string): string | null {
  const database = ensureDb();
  if (!database) return null;
  try {
    const row = database.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [key]);
    return row?.value ?? null;
  } catch (e) {
    console.warn(`[db] "${key}" okunamadı.`, e);
    return null;
  }
}

/**
 * Bekleyen tüm yazımları tek transaction'da uygular (upsert). Başarılı olursa
 * `true` döner — çağıran taraf (storage.ts) yalnızca o an yazılan değerlerle
 * eşleşen `pending` girdilerini siler. Transaction hata verirse `false` döner;
 * `pending` çağıran tarafta korunur, bir sonraki flush yeniden dener.
 */
export function kvSetMany(entries: { key: string; raw: string }[]): boolean {
  if (entries.length === 0) return true;
  const database = ensureDb();
  if (!database) return false;
  try {
    const now = Date.now();
    database.withTransactionSync(() => {
      for (const { key, raw } of entries) {
        database.runSync(
          `INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
          [key, raw, now],
        );
      }
    });
    return true;
  } catch (e) {
    console.warn('[db] toplu yazım başarısız, bekleyen değişiklikler korunuyor.', e);
    return false;
  }
}

export function kvDelete(key: string): void {
  const database = ensureDb();
  if (!database) return;
  try {
    database.runSync('DELETE FROM kv WHERE key = ?', [key]);
  } catch (e) {
    console.warn(`[db] "${key}" silinemedi.`, e);
  }
}

export function storageBackend(): 'sqlite' | 'file' | 'web' {
  return ensureDb() !== null ? 'sqlite' : 'file';
}

// --- Genel tablo erişimi (aşama 2: interview_sessions / exercise_logs) -----
//
// `collectionStore.ts` bu üç genel işlevle konuşur; tablo/sütun adları hep
// çağıran taraftaki sabitlerden gelir (bkz. collectionStore.ts), burada yalnız
// parametre olarak taşınır — bu dosya belirli bir tabloyu bilmez.

export function dbAll<T>(sql: string, params: (string | number | null)[]): T[] {
  const database = ensureDb();
  if (!database) return [];
  try {
    return database.getAllSync<T>(sql, params);
  } catch (e) {
    console.warn('[db] sorgu başarısız.', e);
    return [];
  }
}

export function dbRun(sql: string, params: (string | number | null)[]): boolean {
  const database = ensureDb();
  if (!database) return false;
  try {
    database.runSync(sql, params);
    return true;
  } catch (e) {
    console.warn('[db] yazım başarısız.', e);
    return false;
  }
}

export function dbTransaction(task: () => void): boolean {
  const database = ensureDb();
  if (!database) return false;
  try {
    database.withTransactionSync(task);
    return true;
  } catch (e) {
    console.warn('[db] transaction başarısız.', e);
    return false;
  }
}
