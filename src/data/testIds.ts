// Ölçüm (test) kimliklerinin tek kaynağı — YAPILACAKLAR Bölüm 5.
//
// NEDEN AYRI DOSYA: Kimlikler eskiden ikiye bölünmüştü; üçü
// `utils/dailyPracticeProgress.ts`'te (kayıt tarafı), yedisi
// `data/measureTests.ts`'te (kayıt defteri) duruyordu. Bu yüzden saf bir veri
// dosyası olan `measureTests.ts`, sırf üç dizgi sabiti için React Native'e
// bağlı bir modülü alıyordu; skala hesabı Node altında sınanamıyordu.
//
// Burası hiçbir şey import etmiyor: hem uygulama hem test tarafı güvenle alır.
// Değerler **diske yazılan kimliklerdir** — değiştirilirse eski ölçüm geçmişi
// bulunamaz. Yeni test eklerken buraya yeni bir satır eklenir, mevcutlar
// asla yeniden adlandırılmaz.

/** Kontrollü veriş süresi (saniye) — tek nefeste sabit "sss". */
export const TEST_EXHALE_CONTROL = 'exhaleControl';

/**
 * Dinlenik solunum hızı (nefes/dakika) — 60 saniye boyunca her nefes alışta dokunma.
 * Yetişkinde dinlenik aralık kabaca 12-20; burada amaç normale sokmak değil,
 * kişinin kendi eğilimini zaman içinde görmesi.
 */
export const TEST_BREATHING_RATE = 'breathingRate';

/**
 * Sesli okuma hızı (kelime/dakika) — kelime sayısı bilinen bir metni okuma süresi.
 * Mülakat ve sunum için tipik hedef aralık 120-150; hızlı konuşmak akıcılık değil,
 * çoğu zaman gerginlik göstergesi.
 */
export const TEST_READING_WPM = 'readingWpm';

export const TEST_BREATH_HOLD = 'breathHold';
export const TEST_CONTROL_PAUSE = 'controlPause';
export const TEST_SINGLE_BREATH_COUNT = 'singleBreathCount';
export const TEST_DIAPHRAGM_ISOLATION = 'diaphragmIsolation';
export const TEST_FILLER_RATE = 'fillerRate';

/** Duruş öz-kontrolü (5 maddelik) — diyafram izolasyonuyla aynı desen: cihaz ölçümü değil. */
export const TEST_POSTURE_SELF_CHECK = 'postureSelfCheck';
