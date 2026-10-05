import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

// Mülakat ses kayıtlarının kalıcı deposu (kullanıcı kararı 2026-09-20).
//
// Eskiden ses yalnızca `captureBuffer`'da, analiz süresince bellekte duruyordu
// ve analiz biter bitmez siliniyordu. Artık kayıt cihazda kalıyor: Mülakat
// Geçmişi'nden dinlenebiliyor.
//
// NEDEN DOSYA ADI SAKLANIYOR, TAM YOL DEĞİL: iOS'ta uygulamanın veri klasörü
// yolu her güncellemede değişebiliyor. Kayda tam URI yazılsaydı güncellemeden
// sonra bütün sesler "kayıp" olurdu. Bu yüzden geçmiş kaydında yalnızca dosya
// adı tutuluyor; okunacağı anda `audioUri()` ile o günkü klasöre göre yol
// kuruluyor.
//
// Ses, `storage.ts`'in JSON deposuna GİRMEZ: megabaytlarca base64 her yazımda
// tüm bloğu yeniden serileştirirdi. Dosyalar kendi klasöründe ham m4a olarak
// duruyor.

const AUDIO_DIR = 'irtifa-audio';

// Web hedefinde dosya sistemi yok; bütün fonksiyonlar sessizce boş dönüyor.
const isWeb = Platform.OS === 'web';

function audioDirectory(): Directory {
  const dir = new Directory(Paths.document, AUDIO_DIR);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

/**
 * Kayıt dosyasını (expo-av'ın geçici önbellek yoluna yazdığı m4a) kalıcı
 * klasöre taşır. Dönen değer geçmiş kaydına yazılacak **dosya adı**.
 *
 * Taşıma başarısız olursa `undefined` döner ve mülakat kaydı sessiz kalır —
 * ses yüzünden oturumun tamamı kaybolmaz.
 */
export function keepAudio(sessionId: string, sourceUri: string): string | undefined {
  if (isWeb) return undefined;
  try {
    const source = new File(sourceUri);
    if (!source.exists) return undefined;

    // Uzantı kaynaktan korunur; expo-av ayarına göre m4a ya da caf olabiliyor.
    const extension = sourceUri.split('.').pop()?.split('?')[0] ?? 'm4a';
    const fileName = `${sessionId}.${extension}`;
    const target = new File(audioDirectory(), fileName);
    if (target.exists) target.delete();

    // move: kopyalamaya göre diskte ikinci bir kopya oluşturmuyor.
    source.move(target);
    return fileName;
  } catch (e) {
    console.warn('[audioStore] ses kaydı kalıcı klasöre taşınamadı.', e);
    return undefined;
  }
}

/** Saklanan dosyanın o anki tam yolu. Dosya silinmişse `undefined`. */
export function audioUri(fileName: string | undefined): string | undefined {
  if (isWeb || !fileName) return undefined;
  try {
    const file = new File(audioDirectory(), fileName);
    return file.exists ? file.uri : undefined;
  } catch (e) {
    console.warn('[audioStore] ses dosyası okunamadı.', e);
    return undefined;
  }
}

/** Tek bir kaydın sesini siler. Dosya yoksa sessizce geçer. */
export function removeAudio(fileName: string | undefined): void {
  if (isWeb || !fileName) return;
  try {
    const file = new File(audioDirectory(), fileName);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('[audioStore] ses dosyası silinemedi.', e);
  }
}

/** Saklanan seslerin toplam boyutu (bayt). Ayarlarda yer göstergesi için. */
export function audioTotalBytes(): number {
  if (isWeb) return 0;
  try {
    let total = 0;
    for (const entry of audioDirectory().list()) {
      if (entry instanceof File) total += entry.size ?? 0;
    }
    return total;
  } catch (e) {
    console.warn('[audioStore] ses klasörü ölçülemedi.', e);
    return 0;
  }
}

/** Saklanan bütün sesleri siler — kayıtların kendisi (metin, puan) kalır. */
export function clearAllAudio(): void {
  if (isWeb) return;
  try {
    for (const entry of audioDirectory().list()) {
      if (entry instanceof File) entry.delete();
    }
  } catch (e) {
    console.warn('[audioStore] ses klasörü temizlenemedi.', e);
  }
}

/** "12,4 MB" gibi kısa boyut etiketi. */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) return '<0,1 MB';
  return `${mb.toFixed(1).replace('.', ',')} MB`;
}
