import React from 'react';
import { AppState } from 'react-native';

import { readJson, writeJson } from './storage';
import { dbAll, dbRun, dbTransaction, historyTablesReady } from './db';

// Genel "koleksiyon" deposu — YAPILACAKLAR Bölüm 0.4, aşama 2.
//
// `interviewHistory.ts` / `exerciseHistory.ts` bu fabrikayla kuruluyor.
// Kalıcılık iki yoldan biri: `historyTablesReady()` true ise kendi SQLite
// tablosu (`db.native.ts`'teki `interview_sessions` / `exercise_logs`),
// değilse bugünkü gibi tek bir `kv`/dosya anahtarı altında JSON blok
// (`storage.ts` → `readJson`/`writeJson`, aşama 1'in dosya/kv yedek yolu).
// Hangi yol kullanıldığı depo kurulurken (modül import edilirken) bir kez
// belirlenir ve depo ömrü boyunca sabit kalır.

export type CollectionStoreConfig<T> = {
  /** kv/dosya yedek yolundaki anahtar, ör. 'interview-history'. */
  legacyKey: string;
  /** O anahtarın altındaki dizi alanı, ör. 'sessions'. */
  legacyField: string;
  /** SQLite tablo adı, ör. 'interview_sessions' — sabit, kullanıcı girdisi değil. */
  table: string;
  isValid: (v: unknown) => v is T;
  idOf: (item: T) => string;
  /** Tablodaki `created_at` sütunu için — kaydın ISO zaman damgası. */
  createdAt: (item: T) => string;
  /** Tablodaki ek sütunlar (id/created_at/data dışında), ör. `{ rating }`. */
  columns: (item: T) => Record<string, string | number | null>;
};

export type CollectionStore<T> = {
  get: () => T[];
  use: () => T[];
  add: (item: T) => void;
  update: (id: string, fn: (item: T) => T) => void;
  remove: (id: string) => void;
  clear: () => void;
};

function loadFromTable<T>(config: CollectionStoreConfig<T>): T[] {
  const rows = dbAll<{ data: string }>(
    `SELECT data FROM ${config.table} ORDER BY created_at DESC, rowid DESC`,
    [],
  );
  const items: T[] = [];
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.data) as unknown;
      if (config.isValid(parsed)) items.push(parsed);
    } catch (e) {
      console.warn(`[collectionStore] "${config.table}" satırı ayrıştırılamadı, atlanıyor.`, e);
    }
  }
  return items;
}

function loadFromLegacy<T>(config: CollectionStoreConfig<T>): T[] {
  const legacy = readJson<Record<string, unknown> | null>(config.legacyKey, null);
  const arr = legacy?.[config.legacyField];
  if (!Array.isArray(arr)) return [];
  return arr.filter(config.isValid);
}

/**
 * Upsert. `INSERT OR REPLACE` kullanılmıyor: REPLACE satırı silip yeniden
 * eklediği için `rowid` değişir; aynı zaman damgalı kayıtlar `rowid` ile
 * sıralandığından `attachAnalysis` bir oturumun listedeki yerini kaydırırdı.
 * `ON CONFLICT ... DO UPDATE` satırı yerinde günceller, `rowid` korunur.
 */
function buildUpsertSql(table: string, columnNames: string[]): string {
  const cols = ['id', 'created_at', ...columnNames, 'data'];
  const placeholders = cols.map(() => '?').join(', ');
  const updates = cols
    .filter((col) => col !== 'id')
    .map((col) => `${col} = excluded.${col}`)
    .join(', ');
  return `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}`;
}

export function createCollectionStore<T>(config: CollectionStoreConfig<T>): CollectionStore<T> {
  // Yol, depo kurulurken bir kez seçilir (bkz. dosya başı yorumu).
  const usingTable = historyTablesReady();
  let state: T[] = usingTable ? loadFromTable(config) : loadFromLegacy(config);
  // Tek satırlık bir tablo yazımı başarısız olursa true olur; bellek her
  // zaman doğru kabul edilir, tablo bir sonraki fırsatta tam yeniden yazılır.
  let dirty = false;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());

  function insertRow(item: T): boolean {
    const cols = config.columns(item);
    const names = Object.keys(cols);
    const values = names.map((name) => cols[name]);
    const sql = buildUpsertSql(config.table, names);
    return dbRun(sql, [config.idOf(item), config.createdAt(item), ...values, JSON.stringify(item)]);
  }

  function deleteRow(id: string): boolean {
    return dbRun(`DELETE FROM ${config.table} WHERE id = ?`, [id]);
  }

  /** Tabloyu bellekteki `state` ile tam eşitler (DELETE + hepsini INSERT), tek transaction'da. */
  function resync(): void {
    if (!usingTable || !dirty) return;
    const ok = dbTransaction(() => {
      if (!dbRun(`DELETE FROM ${config.table}`, [])) {
        throw new Error(`[collectionStore] "${config.table}" temizlenemedi.`);
      }
      // Bellek en yeni başta; eskiden yeniye eklenir ki `rowid` tazelikle artsın
      // (okuma `ORDER BY created_at DESC, rowid DESC`). Tersi aynı zaman
      // damgalı kayıtların sırasını her yeniden eşitlemede ters çevirirdi.
      for (const item of [...state].reverse()) {
        if (!insertRow(item)) {
          throw new Error(`[collectionStore] "${config.table}" satırı yeniden yazılamadı.`);
        }
      }
    });
    if (ok) {
      dirty = false;
    } else {
      console.warn(`[collectionStore] "${config.table}" yeniden eşitleme başarısız, bellek korunuyor.`);
    }
  }

  function persistLegacy(): void {
    writeJson(config.legacyKey, { [config.legacyField]: state });
  }

  /** Bellek zaten güncellendikten SONRA çağrılır. Tablo yoluysa kirliyse önce tam yeniden eşitler. */
  function persistAfterMutation(mutate: () => boolean): void {
    if (!usingTable) {
      persistLegacy();
      return;
    }
    if (dirty) {
      resync();
      if (!dirty) return; // resync bu mutasyonu da içeren güncel `state`'i zaten yazdı
    }
    if (!mutate()) dirty = true;
  }

  if (usingTable) {
    // storage.ts'teki desenin aynısı: arka plana geçişte bekleyen (kirli) yazım hemen denenir.
    AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') resync();
    });
  }

  const get = () => state;

  const use = () =>
    React.useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      get,
      get,
    );

  const add: CollectionStore<T>['add'] = (item) => {
    state = [item, ...state];
    notify();
    persistAfterMutation(() => insertRow(item));
  };

  const update: CollectionStore<T>['update'] = (id, fn) => {
    state = state.map((item) => (config.idOf(item) === id ? fn(item) : item));
    notify();
    const updated = state.find((item) => config.idOf(item) === id);
    persistAfterMutation(() => (updated ? insertRow(updated) : true));
  };

  const remove: CollectionStore<T>['remove'] = (id) => {
    state = state.filter((item) => config.idOf(item) !== id);
    notify();
    persistAfterMutation(() => deleteRow(id));
  };

  const clear: CollectionStore<T>['clear'] = () => {
    state = [];
    notify();
    persistAfterMutation(() => dbRun(`DELETE FROM ${config.table}`, []));
  };

  return { get, use, add, update, remove, clear };
}
