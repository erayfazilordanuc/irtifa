import React from 'react';

import { createCollectionStore } from './collectionStore';
import type { CompanyId } from '../data/companies';

// Başvuru takibi — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// İrtifa'nın ikinci ayağı: mülakat tek seferlik bir olay, iş arama süreci
// haftalar sürüyor. Bu depo "nereye başvurdum, hangi aşamadayım, ne zaman ne
// oldu" sorusunu cevaplıyor.
//
// Kalıcılık `interviewHistory` ile aynı desen (`createCollectionStore`): SQLite
// `applications` tablosu hazırsa orası, değilse `kv`/dosya altında JSON blok.
// İkinci bir durum kütüphanesi eklenmiyor (KARARLAR, ortak ilke 5).
//
// Tamamen çevrimdışı: yapay zekâ yalnızca metin önerisinde devreye giriyor,
// şart değil.

/**
 * Başvurunun bulunduğu aşama. Sıra anlamlı: liste ve kanban bu sırayla dizilir,
 * `STAGE_ORDER` tek kaynak.
 */
export type ApplicationStage =
  | 'hazirlik'
  | 'basvuruldu'
  | 'mulakat'
  | 'teklif'
  | 'kabul'
  | 'red';

export const STAGE_ORDER: ApplicationStage[] = [
  'hazirlik',
  'basvuruldu',
  'mulakat',
  'teklif',
  'kabul',
  'red',
];

export const STAGE_META: Record<
  ApplicationStage,
  { label: string; tone: 'slate' | 'blue' | 'violet' | 'amber' | 'emerald' | 'rose' }
> = {
  hazirlik: { label: 'Hazırlık', tone: 'slate' },
  basvuruldu: { label: 'Başvuruldu', tone: 'blue' },
  mulakat: { label: 'Mülakat', tone: 'violet' },
  teklif: { label: 'Teklif', tone: 'amber' },
  kabul: { label: 'Kabul', tone: 'emerald' },
  red: { label: 'Olumsuz', tone: 'rose' },
};

/** Aşama değişiklikleri — "ne zaman ne oldu" sorusunun cevabı. */
export type StageChange = {
  stage: ApplicationStage;
  /** ISO zaman damgası. */
  at: string;
};

export type Application = {
  id: string;
  /** ISO zaman damgası — kaydın oluşturulduğu an. */
  createdAt: string;
  /** Serbest metin: katalogda olmayan şirketler de takip edilebilsin. */
  companyName: string;
  /** Katalogdaki kurum (varsa) — şirket notu ve simülasyon buna bağlanır. */
  companyId?: CompanyId;
  position: string;
  /** Başvurunun ilanı ya da notu. */
  note?: string;
  stage: ApplicationStage;
  history: StageChange[];
  /**
   * Mülakat sonrası öz-değerlendirme (Bölüm 2.5 → "mülakat sonrası takip").
   * Teşekkür mesajı gönderildi mi ve kullanıcının kendi notu.
   */
  followUpSent?: boolean;
  selfReview?: string;
};

function isApplication(v: unknown): v is Application {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.companyName === 'string';
}

const store = createCollectionStore<Application>({
  legacyKey: 'applications',
  legacyField: 'items',
  table: 'applications',
  isValid: isApplication,
  idOf: (item) => item.id,
  createdAt: (item) => item.createdAt,
  columns: (item) => ({ stage: item.stage, company: item.companyName }),
});

export function useApplications(): Application[] {
  return store.use();
}

export function getApplications(): Application[] {
  return store.get();
}

export function getApplication(id: string): Application | undefined {
  return store.get().find((item) => item.id === id);
}

export function addApplication(
  input: Omit<Application, 'id' | 'createdAt' | 'history'> & { id?: string },
): Application {
  const now = new Date().toISOString();
  const application: Application = {
    ...input,
    id: input.id ?? `app-${Date.now()}`,
    createdAt: now,
    history: [{ stage: input.stage, at: now }],
  };
  store.add(application);
  return application;
}

export function updateApplication(id: string, patch: Partial<Application>): void {
  store.update(id, (item) => ({ ...item, ...patch }));
}

/** Aşamayı değiştirir ve geçmişe bir satır ekler. Aynı aşamaya geçiş yok sayılır. */
export function setStage(id: string, stage: ApplicationStage): void {
  store.update(id, (item) =>
    item.stage === stage
      ? item
      : { ...item, stage, history: [...item.history, { stage, at: new Date().toISOString() }] },
  );
}

export function removeApplication(id: string): void {
  store.remove(id);
}

/** Aşamaya göre gruplar — liste ekranı ve kanban aynı kaynağı kullanır. */
export function groupByStage(applications: readonly Application[]) {
  return STAGE_ORDER.map((stage) => ({
    stage,
    items: applications.filter((item) => item.stage === stage),
  }));
}

/** Kariyer sekmesindeki özet: süren başvuru sayısı ve sonuçlananlar. */
export function applicationStats(applications: readonly Application[]) {
  const active = applications.filter(
    (item) => item.stage !== 'kabul' && item.stage !== 'red',
  ).length;
  return {
    total: applications.length,
    active,
    interviews: applications.filter((item) => item.stage === 'mulakat').length,
    offers: applications.filter((item) => item.stage === 'teklif' || item.stage === 'kabul').length,
  };
}

/** Bir kuruma ait başvurular — simülasyon başlatılırken hatırlatma için. */
export function useApplicationsForCompany(companyId: string | undefined): Application[] {
  const applications = store.use();
  return React.useMemo(
    () => (companyId ? applications.filter((item) => item.companyId === companyId) : []),
    [applications, companyId],
  );
}
