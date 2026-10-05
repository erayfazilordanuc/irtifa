import { createCollectionStore } from './collectionStore';
import type { ExerciseTrack } from '../data/exercises';

// Tamamlanan zihinsel / fizyolojik egzersiz kayıtları.
//
// Kalıcılık (YAPILACAKLAR Bölüm 0.4, aşama 2): native'de SQLite açılıp geçmiş
// tabloları hazırsa `exercise_logs` tablosunda (her satır `data` sütununda
// kaydın tamamı JSON, `category`/`effort`/`duration_seconds` ayrı sütun);
// değilse (web ya da SQLite/göç kullanılamıyorsa) bugünkü gibi tek `kv`/dosya
// anahtarı (`exercise-history`) altında `{ logs: [...] }` JSON bloğu — o zaman
// bu anahtar aynı zamanda göç sonrası da SİLİNMEYEN bir yedek olarak kalır.

export type ExerciseLog = {
  id: string;
  exerciseId: string;
  title: string;
  /** "Problem Çözme", "Görsel Algı", "Nefes" gibi kısa etiket. */
  categoryLabel: string;
  track: ExerciseTrack;
  durationSeconds: number;
  /** 0-100 arası tamamlama/efor puanı — geçmiş ekranındaki trend grafiğini besler. */
  effort: number;
  timestamp: string;
  /** Egzersiz motorunun ürettiği kısa özet (kaç adım tamamlandı vb.). */
  summary?: string;
  /** Otomatik ya da öz-değerlendirmeyle doğru bulunan yanıt sayısı. */
  correctCount?: number;
  /** Kontrol edilen (otomatik ya da öz-değerlendirmeyle sonuçlanan) yanıt sayısı. */
  checkedCount?: number;
};

function isExerciseLog(v: unknown): v is ExerciseLog {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.timestamp === 'string';
}

const store = createCollectionStore<ExerciseLog>({
  legacyKey: 'exercise-history',
  legacyField: 'logs',
  table: 'exercise_logs',
  isValid: isExerciseLog,
  idOf: (log) => log.id,
  createdAt: (log) => log.timestamp,
  columns: (log) => ({
    category: log.categoryLabel,
    effort: log.effort,
    duration_seconds: log.durationSeconds,
  }),
});

export function useExerciseLogs(): ExerciseLog[] {
  return store.use();
}

export function getExerciseLogs(): ExerciseLog[] {
  return store.get();
}

export function getExerciseLog(id: string): ExerciseLog | undefined {
  return store.get().find((log) => log.id === id);
}

export function addExerciseLog(log: ExerciseLog): void {
  store.add(log);
}

export function removeExerciseLog(id: string): void {
  store.remove(id);
}

export function clearExerciseLogs(): void {
  store.clear();
}

/** Profil ve egzersiz geçmişi ekranlarının paylaştığı özet. */
export function exerciseStats(logs: ExerciseLog[]) {
  const totalMinutes = Math.round(logs.reduce((sum, log) => sum + log.durationSeconds, 0) / 60);

  // En çok tekrar edilen kategori "favori" sayılır.
  const counts = new Map<string, number>();
  for (const log of logs) {
    counts.set(log.categoryLabel, (counts.get(log.categoryLabel) ?? 0) + 1);
  }
  let favorite = '—';
  let best = 0;
  for (const [label, count] of counts) {
    if (count > best) {
      best = count;
      favorite = label;
    }
  }

  return { total: logs.length, totalMinutes, favorite };
}
