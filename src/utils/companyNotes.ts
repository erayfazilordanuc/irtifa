import React from 'react';

import { createPersistentStore } from './store';

// Şirket araştırma notları — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// "Bu kurumun hangi projesini takip ettiniz?" mülakatın klasik sorusu; cevabı
// mülakat anında değil, haftalar önce okurken birikiyor. Burası o birikimin
// yeri: kurum başına tek bir serbest metin.
//
// Kayıt biriktiren bir koleksiyon değil, kurum kimliğine bağlı küçük bir
// sözlük — bu yüzden SQLite tablosu değil, `createPersistentStore` (kv/dosya)
// yeterli. Katalogdaki kurum kaydına (`companies.ts`) kimlikle bağlanıyor;
// katalogdan kalkan bir kurumun notu silinmez, yalnızca görünmez olur.

export type CompanyNotes = Record<string, string>;

const store = createPersistentStore<CompanyNotes>('company-notes', {}, (stored) => {
  if (!stored || typeof stored !== 'object') return {};
  const out: CompanyNotes = {};
  for (const [key, value] of Object.entries(stored as Record<string, unknown>)) {
    if (typeof value === 'string') out[key] = value;
  }
  return out;
});

export function useCompanyNotes(): CompanyNotes {
  return store.use();
}

/** Tek kurumun notu; yoksa boş dizi döner. */
export function useCompanyNote(companyId: string | undefined): string {
  const notes = store.use();
  return companyId ? (notes[companyId] ?? '') : '';
}

export function getCompanyNote(companyId: string): string {
  return store.get()[companyId] ?? '';
}

/** Notu yazar; boşaltılırsa kayıt tamamen silinir (boş dizgi biriktirmesin). */
export function saveCompanyNote(companyId: string, note: string): void {
  store.set((prev) => {
    const next = { ...prev };
    if (note.trim()) next[companyId] = note;
    else delete next[companyId];
    return next;
  });
}

/** Notu olan kurum kimlikleri — kariyer sekmesindeki liste bunu okur. */
export function useCompaniesWithNotes(): string[] {
  const notes = store.use();
  return React.useMemo(() => Object.keys(notes).filter((id) => notes[id].trim()), [notes]);
}
