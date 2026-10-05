// Aralıklı hatırlatıcıların hazır şablonları — YAPILACAKLAR Bölüm 4a.
//
// İrtifa'da yalnızca mülakat hazırlığı ve pratik hatırlatıcıları var; genel
// yaşam hatırlatıcıları (su, göz molası vb.) kapsam dışı. Kullanıcı sıfırdan
// hatırlatıcı kurmuyor, listeden seçip açıyor (KARARLAR "Kullanıcıdan içerik
// yazması istenmez"). Metin isteğe bağlı olarak değiştirilebilir; şablon
// yalnızca makul bir başlangıç veriyor.
//
// Diskteki kayıtta artık var olmayan bir şablon kimliği olabilir: hydrate
// (`habitReminders.ts`) yalnızca bu listedeki şablonları okur, gerisini atlar.
//
// ⚠️ Abartılı vaat yok (KARARLAR "Modüller abartılı vaat vermez"): metinler
// hatırlatma cümlesidir, sağlık iddiası değildir.

export type HabitTemplateId =
  | 'nefes-molasi'
  | 'durus'
  | 'dolgu-kelime'
  | 'star-tekrar'
  | 'terim-tekrar'
  | 'sirket-arastirma';

export type HabitTemplate = {
  id: HabitTemplateId;
  label: string;
  /** Bildirim gövdesi — kullanıcı değiştirebilir. */
  message: string;
  /** Varsayılan aralık (dakika). */
  intervalMinutes: number;
  /** Günlük sayaç tutulacak mı ve hedefi ne (ör. 10 bardak). Yoksa sayaç yok. */
  dailyTarget?: number;
  /** Sayacın birimi ("bardak", "mola"). */
  unit?: string;
  /**
   * Bildirime dokununca açılacak ekran. Yoksa uygulama Bugün'de kalır —
   * sayaç zaten Bugün'deki kartta artıyor.
   */
  screen?: string;
  params?: Record<string, unknown>;
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'nefes-molasi',
    label: 'Mülakat nefesi',
    message: 'Üç tur 4-6 nefesi: 4 saniye al, 6 saniye ver.',
    intervalMinutes: 120,
    dailyTarget: 4,
    unit: 'mola',
    // Nefes modülüne bağlanıyor: bildirimden doğrudan pratiğe geçilebilsin.
    screen: 'DiaphragmExercise',
    params: { tab: 'pratik' },
  },
  {
    id: 'durus',
    label: 'Kamera önü duruş',
    message: 'Mülakatta ya da kamerada dik otur: sırtını dikleştir, omuzlarını geri al.',
    intervalMinutes: 90,
    dailyTarget: 6,
    unit: 'kontrol',
    // Kısa hatırlatma yetmediğinde fizyolojik egzersiz kategorisi açılır.
    screen: 'BrainExercises',
    params: {
      track: 'physiological',
      hideTrackToggle: true,
      title: 'Mülakat Öncesi Hazırlık',
      subtitle: 'Duruş ve nefes egzersizleri',
    },
  },
  {
    id: 'dolgu-kelime',
    label: 'Dolgu kelime kontrolü',
    message: '"Şey, yani, eee" yerine kısa bir duraklama yap. Bugün bir cevabını bu şekilde söyle.',
    intervalMinutes: 120,
    dailyTarget: 3,
    unit: 'kontrol',
    screen: 'SpeechExercise',
  },
  {
    id: 'star-tekrar',
    label: 'STAR cevabı tekrarı',
    message:
      'Hazırladığın bir STAR hikâyesini (Durum → Görev → Eylem → Sonuç) 90 saniyede yüksek sesle anlat.',
    intervalMinutes: 120,
    dailyTarget: 2,
    unit: 'tekrar',
  },
  {
    id: 'terim-tekrar',
    label: 'Teknik terim tekrarı',
    message: 'Alanından üç terimi tanımıyla birlikte yüksek sesle söyle.',
    intervalMinutes: 120,
    dailyTarget: 3,
    unit: 'tekrar',
  },
  {
    id: 'sirket-arastirma',
    label: 'Şirket araştırması',
    message: 'Başvurduğun şirketin son bir gelişmesine 5 dakika ayır.',
    intervalMinutes: 120,
    dailyTarget: 1,
    unit: 'araştırma',
    screen: 'NewsScreen',
  },
];

export function findHabitTemplate(id: string): HabitTemplate | undefined {
  return HABIT_TEMPLATES.find((template) => template.id === id);
}
