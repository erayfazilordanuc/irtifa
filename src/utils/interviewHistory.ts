import React from 'react';

import { createCollectionStore } from './collectionStore';
import { clearAllAudio, removeAudio } from './audioStore';
import type { CompanyId } from '../data/companies';
import type { DepartmentId } from '../data/sectors';
import type { QuestionWeight } from '../data/questions';

// Tamamlanan mülakat oturumları ve yapay zeka analizleri.
// Alan adları server/server.ts'in Gemini şemasıyla birebir aynı (test-schema.js).
//
// Kalıcılık (YAPILACAKLAR Bölüm 0.4, aşama 2): native'de SQLite açılıp geçmiş
// tabloları hazırsa `interview_sessions` tablosunda (her satır `data`
// sütununda kaydın tamamı JSON, `rating` ayrı sütun); değilse (web ya da
// SQLite/göç kullanılamıyorsa) bugünkü gibi tek `kv`/dosya anahtarı
// (`interview-history`) altında `{ sessions: [...] }` JSON bloğu — o zaman bu
// anahtar aynı zamanda göç sonrası da SİLİNMEYEN bir yedek olarak kalır.

export type InterviewMode = 'camera' | 'typing';

/**
 * Oturumun türü. Mülakat simülasyonu ile günün alan testi aynı depoda duruyor
 * (YAPILACAKLAR_İRTİFA Bölüm 3): ikisi de "bugün ne yaptım"ın parçası ve karne
 * ikisini birlikte okuyor. Ayrım **moddan** yapılamaz — alan testi her zaman
 * yazılı, yani `mode: 'typing'`.
 *
 * Alanı olmayan eski kayıtlar mülakat sayılır (`sessionKind`).
 */
export type SessionKind = 'interview' | 'fieldTest';

/** Alan testindeki tek bir soru: metni, cevabı ve değerlendirmesi. */
export type FieldTestItem = {
  questionId: string;
  questionText: string;
  weight: QuestionWeight;
  /** İyi cevapta beklenen noktalar — çevrimdışı öz-değerlendirmede gösterilir. */
  keyPoints?: string[];
  /** Adayın yazdığı cevap. */
  answer: string;
  /** Yapay zekâ puanı (0-100). Anahtar yokken tanımsız kalır. */
  score?: number;
  /** Yapay zekânın tek cümlelik gerekçesi. */
  feedback?: string;
  /**
   * Yapay zekâ kapalıyken kullanıcının kendi işareti. Serbest metin cevabına
   * otomatik doğru/yanlış damgası vurulmuyor (KARARLAR "Egzersizde otomatik
   * kontrol ile öz-değerlendirmenin ayrımı").
   */
  selfRating?: 'bildim' | 'kismen' | 'bilemedim';
};

export type InterviewAnalysis = {
  /** 100 üzerinden teknik + stres puanı. */
  rating: number;
  defenseResilience: string;
  postureFeedback: string;
  fluencyFeedback: string;
  depthFeedback: string;
  fillerRating: string;
  successPoints: string[];
  improvementPoints: string[];
  finalVerdict: string;
  idealAnswer: string;
};

export type RecordedSession = {
  id: string;
  /** ISO zaman damgası. */
  timestamp: string;
  /** Alan testinde boş: set kurumdan bağımsızdır. */
  companyId: CompanyId;
  companyName: string;
  questionText: string;
  mode: InterviewMode;
  /** Yoksa mülakat — alanı olmayan eski kayıtlar için. */
  kind?: SessionKind;
  /** Alan testinde hedef alan; mülakatta teknik tür seçildiyse yine dolu olabilir. */
  departmentId?: DepartmentId;
  /** Yalnızca alan testinde: setin üç sorusu, cevapları ve değerlendirmeleri. */
  items?: FieldTestItem[];
  durationSeconds: number;
  /** Yazılı modda adayın yazdığı metin. */
  transcript?: string;
  /** Sessiz kalınan toplam süre (saniye) — kamera modunda ses seviyesinden hesaplanır. */
  silentSeconds?: number;
  /**
   * Kamera modunda saklanan ses kaydının dosya adı (`audioStore.ts`).
   * Tam yol değil: iOS'ta uygulama klasörü güncellemede değişiyor, bkz. audioStore.
   */
  audioFile?: string;
  /**
   * Oturum süre dolmadan, kullanıcı çıkarak bitti mi. Kayıt yine tutuluyor
   * (kullanıcı kararı 2026-09-20: "yarıda bile bitse kaydı tutulsun"); bu alan
   * yalnızca geçmişte "yarıda kaldı" etiketini göstermek için.
   */
  aborted?: boolean;
  analysis?: InterviewAnalysis;
};

function isRecordedSession(v: unknown): v is RecordedSession {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.timestamp === 'string';
}

const store = createCollectionStore<RecordedSession>({
  legacyKey: 'interview-history',
  legacyField: 'sessions',
  table: 'interview_sessions',
  isValid: isRecordedSession,
  idOf: (session) => session.id,
  createdAt: (session) => session.timestamp,
  columns: (session) => ({ rating: session.analysis?.rating ?? null }),
});

export function useInterviewSessions(): RecordedSession[] {
  return store.use();
}

export function getInterviewSessions(): RecordedSession[] {
  return store.get();
}

export function getSession(id: string): RecordedSession | undefined {
  return store.get().find((session) => session.id === id);
}

/** Yeni oturumu listenin başına ekler (en yeni en üstte). */
export function addSession(session: RecordedSession): void {
  store.add(session);
}

export function attachAnalysis(id: string, analysis: InterviewAnalysis): void {
  store.update(id, (session) => ({ ...session, analysis }));
}

export function removeSession(id: string): void {
  // Ses dosyası kayıtla birlikte gider; aksi hâlde sahipsiz dosyalar birikirdi.
  removeAudio(store.get().find((session) => session.id === id)?.audioFile);
  store.remove(id);
}

export function clearSessions(): void {
  clearAllAudio();
  store.clear();
}

/** Kaydın sesini siler, oturumun kendisini bırakır — yer açmak için. */
export function dropSessionAudio(id: string): void {
  const session = store.get().find((item) => item.id === id);
  if (!session?.audioFile) return;
  removeAudio(session.audioFile);
  store.update(id, ({ audioFile: _dropped, ...rest }) => rest);
}

/** Kaydın türü — alanı olmayan eski kayıtlar mülakat sayılır. */
export function sessionKind(session: RecordedSession): SessionKind {
  return session.kind ?? 'interview';
}

export function useSessionsOfKind(kind: SessionKind): RecordedSession[] {
  const sessions = store.use();
  return React.useMemo(() => sessions.filter((s) => sessionKind(s) === kind), [sessions, kind]);
}

/**
 * Alan testi setinin puanı: değerlendirilmiş soruların ortalaması.
 * Hiçbiri değerlendirilmemişse (yapay zekâ kapalı) `undefined` — karne
 * puansız kayıt üretmez, yoksa 0 puan gibi görünürdü.
 */
export function fieldTestScore(items: readonly FieldTestItem[]): number | undefined {
  const scored = items.filter((item) => typeof item.score === 'number');
  if (scored.length === 0) return undefined;
  return Math.round(scored.reduce((sum, item) => sum + (item.score ?? 0), 0) / scored.length);
}

/** Profil ekranındaki özet kutuları. */
export function interviewStats(sessions: RecordedSession[]) {
  const scored = sessions.filter((s) => typeof s.analysis?.rating === 'number');
  const average =
    scored.length === 0
      ? 0
      : Math.round(scored.reduce((sum, s) => sum + (s.analysis?.rating ?? 0), 0) / scored.length);
  return { total: sessions.length, analyzed: scored.length, averageRating: average };
}
