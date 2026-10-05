import { createCollectionStore } from './collectionStore';

// Yanıt defteri: kullanıcının uygulamada verdiği yanıtların tek kaydı
// (kullanıcı kararı 2026-09-20 — "her yerdeki yanıtlarım kaydedilsin").
//
// Eskiden yanıtlar ya hiç saklanmıyordu ya da yalnızca doğru/yanlış SAYACI
// tutuluyordu. "Geçen sefer ne yazmıştım", "hangi soruyu yanlış bilmiştim"
// sorularının cevabı yoktu; bu depo onu veriyor.
//
// KAPSAM: serbest metin yanıtları + çoktan seçmeli cevaplar.
//
// ⚠️ MÜLAKAT BURAYA YAZILMAZ. Mülakat oturumunun kendi deposu var
// (`interviewHistory.ts`) ve orada yanıtın yanında kurum, süre, ses dosyası ve
// yapay zekâ analizi de duruyor. Aynı yanıtı iki yere yazmak iki ayrı doğruluk
// kaynağı demek olurdu. Yanıt Defteri ekranı mülakat sekmesinde doğrudan
// `interviewHistory`'yi okur.
//
// Kalıcılık `collectionStore` üzerinden: native'de `practice_responses`
// tablosu, değilse `response-history` anahtarı altında JSON blok.

export type ResponseModule = 'exercise';

export const RESPONSE_MODULE_LABELS: Record<ResponseModule, string> = {
  exercise: 'Egzersiz',
};

/** `text`: kullanıcı kendi cümlesini yazdı. `choice`: hazır şıklardan seçti. */
export type ResponseKind = 'text' | 'choice';

export type PracticeResponse = {
  id: string;
  /** ISO zaman damgası. */
  timestamp: string;
  module: ResponseModule;
  /** Modül içi kimlik — egzersiz kimliği. Tekrar çalışmayı bağlar. */
  refId: string;
  /** Liste satırının başlığı: "Teşbih", "Hızlı Örüntü Tanıma" gibi. */
  title: string;
  /** Sorulan şey — soru metni ya da üretim yönergesi. */
  prompt: string;
  /** Kullanıcının verdiği yanıt; seçmelide seçilen şıkkın metni. */
  answer: string;
  kind: ResponseKind;
  /**
   * Yanıt otomatik kontrol edilebildiyse sonucu. Serbest metin
   * alıştırmalarında "doğrusu tek değil" olduğundan tanımsız kalır — orada yanlış bir
   * doğru/yanlış damgası vurmaktansa hiç vurmamak yeğleniyor.
   */
  correct?: boolean;
  /** Beklenen ya da örnek cevap; defterde yanıtın altında gösterilir. */
  expected?: string;
};

function isPracticeResponse(v: unknown): v is PracticeResponse {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.timestamp === 'string' && typeof o.module === 'string';
}

const store = createCollectionStore<PracticeResponse>({
  legacyKey: 'response-history',
  legacyField: 'responses',
  table: 'practice_responses',
  isValid: isPracticeResponse,
  idOf: (response) => response.id,
  createdAt: (response) => response.timestamp,
  columns: (response) => ({
    module: response.module,
    ref_id: response.refId,
    correct: response.correct === undefined ? null : response.correct ? 1 : 0,
  }),
});

export function useResponses(): PracticeResponse[] {
  return store.use();
}

export function getResponses(): PracticeResponse[] {
  return store.get();
}

/**
 * Yanıtı deftere yazar. Kimlik ve zaman damgası burada üretilir; çağıran
 * ekranların her seferinde aynı üç satırı tekrarlamaması için.
 *
 * Boş yanıt yazılmaz: kullanıcı bir şey yazmadan "tamamladım" derse defterde
 * boş satır birikmesin.
 */
export function addResponse(
  response: Omit<PracticeResponse, 'id' | 'timestamp'> & { id?: string; timestamp?: string },
): void {
  if (response.answer.trim().length === 0) return;
  store.add({
    ...response,
    id: response.id ?? `response-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: response.timestamp ?? new Date().toISOString(),
  });
}

export function removeResponse(id: string): void {
  store.remove(id);
}

export function clearResponses(): void {
  store.clear();
}

/** Tek bir modülün yanıtları, en yeni başta. */
export function responsesOf(
  responses: PracticeResponse[],
  module: ResponseModule,
): PracticeResponse[] {
  return responses.filter((response) => response.module === module);
}

/** Defter başlığındaki özet: toplam yanıt ve kontrol edilebilenlerin isabeti. */
export function responseStats(responses: PracticeResponse[]) {
  const checked = responses.filter((response) => typeof response.correct === 'boolean');
  const correct = checked.filter((response) => response.correct).length;
  return {
    total: responses.length,
    checked: checked.length,
    correct,
    accuracy: checked.length === 0 ? 0 : Math.round((correct / checked.length) * 100),
  };
}
