import { createCollectionStore } from './collectionStore';

// STAR cevap kurucu — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// Mülakat Hazırlık Atölyesi'ndeki "Mülakat Zekâsı" egzersizi STAR ile *hızlı
// cevap kurmayı* çalıştırıyor; burası aynı dilin **kalıcı kaydı**: bir kez
// yazılır, mülakat öncesi tekrar edilir. İkisi aynı dört adımı kullanır —
// Durum → Görev → Eylem → Sonuç.
//
// Kullanıcıdan sıfırdan içerik yazması istenmiyor (KARARLAR "Kullanıcıdan
// içerik yazması istenmez"): her adımın kendi sorusu ve örneği var, hazır
// başlık önerileri `STORY_PROMPTS`'tan geliyor.

export type StarStory = {
  id: string;
  /** ISO zaman damgası. */
  createdAt: string;
  /** Hikâyenin kısa adı — "Teslim tarihini kurtardığım hata". */
  title: string;
  /** Hangi soru tipine cevap veriyor — listede etiket olarak görünür. */
  tag?: string;
  situation: string;
  task: string;
  action: string;
  result: string;
};

/** STAR'ın dört adımı; ekran bu listeden kuruluyor, sıra anlamlı. */
export const STAR_STEPS: {
  key: 'situation' | 'task' | 'action' | 'result';
  label: string;
  question: string;
  hint: string;
}[] = [
  {
    key: 'situation',
    label: 'Durum',
    question: 'Olay nerede ve ne zaman geçti?',
    hint: 'İki cümle yeter: proje, ekip, ne zaman. Dinleyen sahneyi görebilsin.',
  },
  {
    key: 'task',
    label: 'Görev',
    question: 'Senden ne bekleniyordu?',
    hint: 'Ekibin değil, senin sorumluluğun. "Benden ... isteniyordu" diye kur.',
  },
  {
    key: 'action',
    label: 'Eylem',
    question: 'Ne yaptın?',
    hint: 'Hikâyenin en uzun kısmı burası. Adım adım ve birinci tekil şahısla anlat.',
  },
  {
    key: 'result',
    label: 'Sonuç',
    question: 'Ne oldu?',
    hint: 'Mümkünse sayı ver. Sonuç kötüyse çıkardığın dersi ekle.',
  },
];

/** Hazır hikâye başlıkları — mülakatta en çok sorulan davranışsal kalıplar. */
export const STORY_PROMPTS: { title: string; tag: string }[] = [
  { title: 'Zor bir ekip arkadaşıyla çalıştığım zaman', tag: 'Çatışma' },
  { title: 'Teslim tarihini kurtardığım an', tag: 'Baskı' },
  { title: 'Yaptığım bir hata ve sonrası', tag: 'Başarısızlık' },
  { title: 'İnisiyatif alıp başlattığım iş', tag: 'Liderlik' },
  { title: 'Fikrimi savunup kabul ettirdiğim tartışma', tag: 'İkna' },
  { title: 'Hiç bilmediğim bir konuyu öğrenmem gereken proje', tag: 'Öğrenme' },
];

function isStarStory(v: unknown): v is StarStory {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.title === 'string';
}

const store = createCollectionStore<StarStory>({
  legacyKey: 'star-stories',
  legacyField: 'items',
  table: 'star_stories',
  isValid: isStarStory,
  idOf: (item) => item.id,
  createdAt: (item) => item.createdAt,
  columns: (item) => ({ title: item.title }),
});

export function useStarStories(): StarStory[] {
  return store.use();
}

export function getStarStory(id: string): StarStory | undefined {
  return store.get().find((item) => item.id === id);
}

export function saveStarStory(story: Omit<StarStory, 'createdAt'> & { createdAt?: string }): void {
  const existing = getStarStory(story.id);
  if (existing) {
    store.update(story.id, (item) => ({ ...item, ...story }));
    return;
  }
  store.add({ ...story, createdAt: story.createdAt ?? new Date().toISOString() });
}

export function removeStarStory(id: string): void {
  store.remove(id);
}

/** Dört adımın kaçı dolu — listede tamamlanma göstergesi. */
export function completedSteps(story: StarStory): number {
  return STAR_STEPS.filter((step) => (story[step.key] ?? '').trim().length > 0).length;
}

/** Hikâyeyi mülakatta okunacak tek parça metne çevirir. */
export function storyToText(story: StarStory): string {
  return STAR_STEPS.map((step) => `${step.label}: ${story[step.key].trim()}`)
    .filter((line) => line.split(': ')[1])
    .join('\n\n');
}
