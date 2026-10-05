import { appSettingsStore, normalizeBaseUrl } from './appSettings';
import { getApiKey } from './aiCredentials';

// Gemini'ye giden tek kapı. İKİ YOL var, sırayla denenmiyor — hangisi kuruluysa o:
//
// 1. **Kullanıcının kendi anahtarı (BYOK, varsayılan).** Anahtar cihazın
//    kasasında (`aiCredentials.ts`), çağrı doğrudan Google'a gidiyor. Sunucu
//    gerekmiyor; kota ve fatura kullanıcının kendi hesabında.
// 2. **Sunucu proxy'si (`server/server.ts`).** Ayarlar'da sunucu adresi
//    doluysa kullanılıyor. Anahtar sunucuda kalır, uygulama görmez.
//
// Anahtar varsa 1, yoksa ve adres varsa 2 kullanılıyor. İkisi de yoksa yapay
// zekâ kapalı sayılıyor (`aiAvailability.ts`) ve buraya hiç gelinmiyor.
//
// Kullanıcı kararı 2026-09-20: BYOK varsayılan yol. Proxy, ileride ortak bir
// sunucu açılırsa diye duruyor (YAPILACAKLAR Bölüm 00).

const GOOGLE_API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';

export type GeminiCall = {
  prompt: string;
  /** Gemini'nin JSON şeması — verilirse yanıt application/json olarak istenir. */
  responseSchema?: Record<string, unknown>;
  /** Mülakat kaydının sesi (base64, m4a). */
  audioBase64?: string;
  /** Mülakat sırasında yakalanan kareler (base64, jpeg). */
  capturedPhotos?: string[];
  /** Ses yüksekliği ölçümleri — prompt'a ekleniyor. */
  dbLogs?: number[];
  model?: string;
  /** Google arama ile temellendirme (haber/güncel bilgi soruları için). */
  useSearch?: boolean;
  signal?: AbortSignal;
};

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * Ses/kare varsa çok-ortamlı (multimodal) parça listesi kurar.
 *
 * `server/server.ts` bugüne kadar aynı işi yapıyordu; mantık birebir buraya
 * taşındı ki iki yol da aynı istemi üretsin.
 *
 * ⚠️ Ses MIME türü: sunucu `audio/m4a` gönderiyordu. Bu IANA'da kayıtlı bir tür
 * değil ve Gemini'nin desteklenen türler listesinde geçmiyor; m4a dosyaları
 * MPEG-4 kabı olduğu için doğrusu `audio/mp4`. Taşırken düzeltildi.
 */
function buildParts(call: GeminiCall): Record<string, unknown>[] {
  let text = call.prompt;

  if (call.dbLogs && call.dbLogs.length > 0) {
    text += `\n\nSES YÜKSEKLİĞİ LOGLARI (dB):\n${JSON.stringify(call.dbLogs)}`;
    text +=
      '\nYukarıdaki desibel loglarını inceleyerek adayın mülakatta sesini nasıl kullandığını (bağırma, fısıldama, ani tepkiler) değerlendir.';
  }

  const parts: Record<string, unknown>[] = [{ text }];

  if (call.audioBase64) {
    parts.push({ inlineData: { mimeType: 'audio/mp4', data: call.audioBase64 } });
  }
  for (const photo of call.capturedPhotos ?? []) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: photo } });
  }

  return parts;
}

/** Google'ın REST gövdesi. SDK'daki `config` burada ikiye ayrılıyor. */
function buildRequestBody(call: GeminiCall): Record<string, unknown> {
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: buildParts(call) }],
  };

  if (call.responseSchema) {
    body.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: call.responseSchema,
    };
  }
  if (call.useSearch) {
    body.tools = [{ google_search: {} }];
  }

  return body;
}

/** Google'ın hata gövdesinden kullanıcıya gösterilebilir bir cümle çıkarır. */
function describeGoogleError(status: number, payload: any): GeminiError {
  const reason: string = payload?.error?.status ?? '';
  const detail: string = payload?.error?.message ?? '';

  if (status === 400 && /API key not valid/i.test(detail)) {
    return new GeminiError(
      'Anahtar geçersiz görünüyor. Ayarlar → Yapay Zekâ bölümünden yeniden yapıştırabilirsin.',
      'BAD_KEY',
    );
  }
  if (status === 401 || status === 403) {
    return new GeminiError(
      'Anahtar kabul edilmedi. Google AI Studio\'da hâlâ geçerli mi kontrol et.',
      'BAD_KEY',
    );
  }
  if (status === 429 || reason === 'RESOURCE_EXHAUSTED') {
    return new GeminiError(
      'Günlük ücretsiz kotan dolmuş görünüyor. Bir süre sonra tekrar dene.',
      'QUOTA',
    );
  }
  if (status >= 500) {
    return new GeminiError('Google tarafında geçici bir sorun var. Birazdan tekrar dene.', 'UPSTREAM');
  }
  return new GeminiError(detail || 'Yapay zekâ yanıt veremedi.', reason || 'UNKNOWN');
}

/** 1. yol — kullanıcının kendi anahtarıyla doğrudan Google'a. */
async function callDirect(call: GeminiCall, apiKey: string): Promise<string> {
  const model = call.model ?? DEFAULT_MODEL;
  const url = `${GOOGLE_API_ROOT}/${model}:generateContent`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Anahtar başlıkta gidiyor, sorgu dizesinde değil: URL'ler günlüklere
        // ve çökme raporlarına düşebiliyor, başlıklar düşmüyor.
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(buildRequestBody(call)),
      signal: call.signal,
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw e;
    throw new GeminiError('İnternet bağlantısı kurulamadı. Bağlantını kontrol et.', 'NETWORK');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw describeGoogleError(response.status, payload);

  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
    .join('')
    .trim();
}

/** 2. yol — Ayarlar'da sunucu adresi tanımlıysa `server/server.ts` proxy'si. */
async function callProxy(call: GeminiCall, base: string): Promise<string> {
  const config: Record<string, unknown> = {};
  if (call.responseSchema) {
    config.responseMimeType = 'application/json';
    config.responseSchema = call.responseSchema;
  }
  if (call.useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const url = `${base}/api/gemini`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Sunucuda APP_TOKEN tanımlıysa gerekli; boşsa başlık hiç eklenmiyor.
        ...(appSettingsStore.get().appToken
          ? { 'x-app-token': appSettingsStore.get().appToken }
          : {}),
      },
      body: JSON.stringify({
        model: call.model ?? DEFAULT_MODEL,
        contents: call.prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
        audioBase64: call.audioBase64,
        capturedPhotos: call.capturedPhotos,
        dbLogs: call.dbLogs,
      }),
      signal: call.signal,
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw e;
    throw new GeminiError(
      `Sunucuya ulaşılamadı (${url}). Sunucu çalışıyor mu ve telefon aynı ağda mı?`,
      'NETWORK',
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const code = payload?.error;
    if (code === 'API_KEY_MISSING') {
      throw new GeminiError('Sunucuda GEMINI_API_KEY tanımlı değil.', code);
    }
    throw new GeminiError(
      payload?.message || payload?.error || 'Yapay zekâ yanıt veremedi.',
      code,
    );
  }

  return typeof payload.text === 'string' ? payload.text : '';
}

export async function callGemini(call: GeminiCall): Promise<string> {
  const apiKey = getApiKey();
  if (apiKey) return callDirect(call, apiKey);

  const base = normalizeBaseUrl(appSettingsStore.get().apiBaseUrl);
  if (base) return callProxy(call, base);

  // Buraya normalde hiç gelinmiyor: çağıran her yer önce `aiAvailable()`
  // soruyor. Yine de sessiz kalmaktansa açık bir kod dönülüyor.
  throw new GeminiError('Yapay zekâ henüz kurulmadı.', 'NOT_CONFIGURED');
}

/** Şemalı çağrı — yanıtı doğrudan nesne olarak döndürür. */
export async function callGeminiJson<T>(
  call: GeminiCall & { responseSchema: Record<string, unknown> },
): Promise<T> {
  const text = await callGemini(call);
  try {
    // Model bazen JSON'u ``` bloğunun içine koyuyor; ilk süslü paranteze kadar kırpıyoruz.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const raw = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    return JSON.parse(raw) as T;
  } catch {
    throw new GeminiError('Yapay zekâ yanıtı çözümlenemedi. Lütfen tekrar dene.', 'PARSE');
  }
}

export type ConnectionResult = { ok: boolean; message: string };

/**
 * Kurulum ekranındaki "Doğrula" ve "Bağlantıyı test et" düğmeleri.
 *
 * `overrideKey`: anahtarı kaydetmeden önce denemek için.
 * `via`: hangi yolun sınanacağı. Varsayılan `'auto'` gerçek çağrıyla aynı
 * önceliği izler (anahtar varsa o). `'proxy'` anahtarı yok sayıp sunucuyu
 * dener — "Gelişmiş" bölümündeki test düğmesi bunu ister, yoksa anahtarı olan
 * kullanıcıda sunucu adresi hiç sınanmadan "başarılı" derdi.
 */
export async function testConnection(
  overrideKey?: string,
  via: 'auto' | 'proxy' = 'auto',
): Promise<ConnectionResult> {
  const base = normalizeBaseUrl(appSettingsStore.get().apiBaseUrl);

  if (via === 'proxy') {
    if (!base) return { ok: false, message: 'Önce bir sunucu adresi gir.' };
    try {
      const text = await callProxy({ prompt: 'ping' }, base);
      return text.length === 0
        ? { ok: false, message: 'Sunucuya ulaşıldı ama yanıt boş geldi. Tekrar dene.' }
        : { ok: true, message: 'Sunucuya ulaşıldı ve yapay zekâ yanıt verdi.' };
    } catch (e) {
      return { ok: false, message: (e as GeminiError).message || 'Bağlantı kurulamadı.' };
    }
  }

  const key = overrideKey?.trim() || getApiKey();

  if (!key && !base) {
    return { ok: false, message: 'Önce bir anahtar gir ya da sunucu adresi tanımla.' };
  }

  try {
    const text = key
      ? await callDirect({ prompt: 'ping' }, key)
      : await callProxy({ prompt: 'ping' }, base);
    if (text.length === 0) {
      return { ok: false, message: 'Bağlantı kuruldu ama yanıt boş geldi. Tekrar dene.' };
    }
    return {
      ok: true,
      message: key
        ? 'Anahtar çalışıyor. Yapay zekâ değerlendirmesi artık açık.'
        : 'Sunucuya ulaşıldı ve yapay zekâ yanıt verdi.',
    };
  } catch (e) {
    const error = e as GeminiError;
    return { ok: false, message: error.message || 'Bağlantı kurulamadı.' };
  }
}
