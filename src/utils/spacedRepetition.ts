import { dayIndex } from './dateUtils';

// Aralıklı tekrar (spaced repetition) — YAPILACAKLAR Bölüm 7.
//
// SAF MODÜL: React / React Native importu yok, yalnızca aritmetik ve gün
// hesabı. Böylece kenar durumlar (ilk tekrar, yanlış cevapta sıfırlama, kolaylık
// katsayısının tabanı) Node altında sınanabiliyor.
//
// SM-2'nin sadeleştirilmiş hâli. Orijinali cevabı 0-5 arası "kalite" ile
// puanlıyor; bizde yalnızca doğru/yanlış var (testler çoktan seçmeli). Bu yüzden
// kalite yerine ikili sonuç kullanılıyor:
//
//   doğru  → tekrar sayısı artar, aralık uzar, kolaylık +0.1 (tavan 2.5)
//   yanlış → tekrar sayısı sıfırlanır, aralık 1 güne döner, kolaylık -0.2 (taban 1.3)
//
// Aralık günleri: 1 → 3 → önceki × kolaylık. Kolaylık katsayısının tabanı 1.3;
// SM-2'de de aynı taban var, altına inince aralıklar pratikte hiç uzamıyor.

export type ReviewState = {
  /** Üst üste doğru bilinme sayısı. Yanlışta sıfırlanır. */
  reps: number;
  /** Bir sonraki tekrara kaç gün var (son hesaplanan aralık). */
  intervalDays: number;
  /** Kolaylık katsayısı — kelime kolaylaştıkça aralık daha hızlı uzar. */
  ease: number;
  /** Tekrarın düştüğü gün (dayIndex). */
  dueDayIndex: number;
};

export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.5;
/** Aralık sonsuza gitmesin: bir yıl sonrasını hatırlatmanın pratik faydası yok. */
export const MAX_INTERVAL_DAYS = 180;

const clampEase = (value: number) => Math.min(MAX_EASE, Math.max(MIN_EASE, value));

/** Hiç çalışılmamış bir kelimenin ilk tekrar durumu — bugün görülmeli. */
export function initialReview(todayIndex: number = dayIndex()): ReviewState {
  return { reps: 0, intervalDays: 0, ease: INITIAL_EASE, dueDayIndex: todayIndex };
}

/**
 * Bir cevaptan sonraki tekrar durumu.
 *
 * `prev` yoksa (kelime ilk kez cevaplanıyor) varsayılandan başlar.
 * Saf: aynı girdiye her zaman aynı çıktıyı verir, tarih okumaz.
 */
export function reviewAfterAnswer(
  prev: ReviewState | undefined,
  correct: boolean,
  todayIndex: number,
): ReviewState {
  const base = prev ?? initialReview(todayIndex);

  if (!correct) {
    // Yanlışta aralık sıfırlanıyor: yarın tekrar sorulsun.
    return {
      reps: 0,
      intervalDays: 1,
      ease: clampEase(base.ease - 0.2),
      dueDayIndex: todayIndex + 1,
    };
  }

  const reps = base.reps + 1;
  const ease = clampEase(base.ease + 0.1);
  let intervalDays: number;
  if (reps === 1) intervalDays = 1;
  else if (reps === 2) intervalDays = 3;
  else intervalDays = Math.round(Math.max(1, base.intervalDays) * ease);
  intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.max(1, intervalDays));

  return { reps, intervalDays, ease, dueDayIndex: todayIndex + intervalDays };
}

/** Bugün (ya da daha önce) tekrarı gelmiş mi. */
export function isDue(state: ReviewState | undefined, todayIndex: number): boolean {
  if (!state) return true; // hiç çalışılmamış kelime her zaman sıradadır
  return state.dueDayIndex <= todayIndex;
}

/** Kaç gün gecikmiş — sıralamada öne almak için. Gelmemişse negatif. */
export function overdueBy(state: ReviewState | undefined, todayIndex: number): number {
  if (!state) return Number.MAX_SAFE_INTEGER;
  return todayIndex - state.dueDayIndex;
}

export type ReviewCandidate = {
  id: string;
  review?: ReviewState;
  correct: number;
  wrong: number;
};

/**
 * Tekrar sırası: en çok gecikmiş kelime önce, eşitlikte daha çok yanlış bilinen
 * önce, yine eşitlikse kimliğe göre (sonuç deterministik olsun — aynı durumda
 * her çağrıda aynı sıra gelir, ekran "zıplamaz").
 *
 * Tekrarı gelmemiş kelimeler hiç döndürülmez: erken sormak aralıklı tekrarın
 * bütün faydasını götürür.
 */
export function pickReviewIds(
  candidates: readonly ReviewCandidate[],
  count: number,
  todayIndex: number = dayIndex(),
): string[] {
  if (count <= 0) return [];

  return candidates
    .filter((c) => isDue(c.review, todayIndex))
    .slice()
    .sort((a, b) => {
      const overdue = overdueBy(b.review, todayIndex) - overdueBy(a.review, todayIndex);
      if (overdue !== 0) return overdue;
      const weakness = b.wrong - b.correct - (a.wrong - a.correct);
      if (weakness !== 0) return weakness;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    })
    .slice(0, count)
    .map((c) => c.id);
}

/** Bugün tekrarı gelen kelime sayısı — ekranda rozet/sayaç için. */
export function dueCount(
  candidates: readonly ReviewCandidate[],
  todayIndex: number = dayIndex(),
): number {
  return candidates.reduce((sum, c) => sum + (isDue(c.review, todayIndex) ? 1 : 0), 0);
}
