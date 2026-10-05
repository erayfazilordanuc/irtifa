import {
  TEST_BREATHING_RATE,
  TEST_EXHALE_CONTROL,
  TEST_READING_WPM,
  TEST_BREATH_HOLD,
  TEST_CONTROL_PAUSE,
  TEST_SINGLE_BREATH_COUNT,
  TEST_DIAPHRAGM_ISOLATION,
  TEST_FILLER_RATE,
  TEST_POSTURE_SELF_CHECK,
} from './testIds';

// Kasıtlı ölçümlerin (testlerin) tek kaydı — YAPILACAKLAR Bölüm 5.
//
// Hem ölçümün yapıldığı ekran hem Karne sekmesi buradan okur:
// etiket, birim, basamak, "iyileşme hangi yön", hangi ekranda ölçülür ve
// ölçümden önce hatırlatılacak koşul notu.
//
// ⚠️ Ölçüm dürüstlüğü (KARARLAR "Modüller abartılı vaat vermez" + Bölüm 5):
// bunların hiçbiri klinik ölçüm değil, hiçbiri akciğer hacmi ölçmüyor. Bu
// yüzden `improvement` çoğu testte 'none': hedefi bir ARALIK olan ya da
// kanıtı zayıf olan ölçümlerde artışı yeşile boyamak yanlış bilgi verir ve
// nefes tutma gibi testlerde zorlamayı teşvik eder.

// Kimlikler artık tek kaynakta (`testIds.ts`) — bu dosya saf kalsın diye
// (React Native'e bağlı bir modülden sabit almıyor). Buradan yeniden dışa
// aktarılıyorlar ki mevcut `from '../data/measureTests'` alışları bozulmasın.
export {
  TEST_BREATH_HOLD,
  TEST_CONTROL_PAUSE,
  TEST_SINGLE_BREATH_COUNT,
  TEST_DIAPHRAGM_ISOLATION,
  TEST_FILLER_RATE,
  TEST_POSTURE_SELF_CHECK,
};

export type MeasureArea = 'nefes' | 'veris' | 'diksiyon' | 'durus';

export const AREA_LABELS: Record<MeasureArea, string> = {
  nefes: 'Nefes',
  veris: 'Veriş',
  diksiyon: 'Diksiyon',
  durus: 'Duruş',
};

/** Skaladaki bir dilim. `upTo` dilimin üst sınırı (dahil). */
export type MeasureScaleBand = {
  upTo: number;
  label: string;
  /** Bu dilim "beklenen/tipik" olan mı — yalnızca bu dilim vurgulanır. */
  typical?: boolean;
};

/**
 * Ölçümden sonra "ben neredeyim" sorusunu cevaplayan skala.
 *
 * İki tür var ve ayrım kasıtlı:
 * - `reference`: savunulabilir bir tipik aralığı olan ölçümler (dinlenik
 *   solunum hızı, sesli okuma hızı) ya da doğal bir skalası olanlar (0-5
 *   öz-kontrol, yüzde).
 * - `personal`: genel bir normu OLMAYAN ölçümler (nefes tutma, kontrol
 *   duraklaması, tek nefeste sayma, nefes/metin). Bunlarda nüfus normu
 *   uydurmak yerine kişinin KENDİ ölçüm aralığı skala olur. Norm icat etmek
 *   Bölüm 5'teki ölçüm dürüstlüğü kuralına aykırı olurdu.
 */
export type MeasureScale =
  | {
      kind: 'reference';
      /** Çubuğun uçları — ölçüm bunun dışına taşarsa uca sabitlenir. */
      min: number;
      max: number;
      bands: MeasureScaleBand[];
      caption: string;
    }
  | { kind: 'personal'; caption: string };

export type MeasureTest = {
  /** `dailyPracticeProgress` içindeki test kimliği. */
  id: string;
  label: string;
  /** Karnede etiketin altına yazılan tek satır. */
  short: string;
  unit: string;
  decimals: number;
  /** Hangi yön "iyileşme" sayılır — yalnızca fark yazısının rengini belirler. */
  improvement: 'higher' | 'lower' | 'none';
  area: MeasureArea;
  /** Ölçümün yapıldığı ekran — karnedeki "Ölç" düğmesi buraya gider. */
  screen: string;
  params?: Record<string, unknown>;
  /** Ölçümden önce gösterilen koşul / güvenlik notu. */
  note?: string;
  /** Ölçümden sonra gösterilen konum skalası. */
  scale?: MeasureScale;
};

/** Nefes ölçümlerinin ortak koşul hatırlatması. */
const SEATED_NOTE =
  'Oturarak, dinlenmiş hâlde ve tok karnına değilken ölç. Karşılaştırma ancak benzer koşullarda anlamlı.';

/** Normu olmayan ölçümlerin ortak skala açıklaması. */
const PERSONAL_SCALE_CAPTION =
  'Bu ölçümün genel bir normu yok. Çubuk, kendi ölçümlerinin arasında nerede olduğunu gösterir.';

export const MEASURE_TESTS: MeasureTest[] = [
  {
    id: TEST_EXHALE_CONTROL,
    label: 'Kontrollü veriş süresi',
    short: 'Tek nefeste sabit "sss" sesi',
    unit: 's',
    decimals: 1,
    improvement: 'higher',
    area: 'nefes',
    screen: 'DiaphragmExercise',
    params: { tab: 'olcum' },
    note: SEATED_NOTE,
    // Klinik "maksimum fonasyon süresi" normları yaşa ve cinsiyete göre geniş
    // bir aralıkta değişiyor; tek bir bant vermek yanıltıcı olurdu.
    scale: { kind: 'personal', caption: PERSONAL_SCALE_CAPTION },
  },
  {
    id: TEST_BREATHING_RATE,
    label: 'Dinlenik solunum hızı',
    short: '60 saniye boyunca her alışta dokun',
    unit: 'nefes/dk',
    decimals: 0,
    // Hedef bir aralık (kabaca 12-20); artışı da azalışı da "iyi" diye sunulmaz.
    improvement: 'none',
    area: 'nefes',
    screen: 'DiaphragmExercise',
    params: { tab: 'olcum' },
    note: SEATED_NOTE,
    scale: {
      kind: 'reference',
      min: 6,
      max: 30,
      bands: [
        { upTo: 11, label: 'Düşük' },
        { upTo: 20, label: 'Tipik', typical: true },
        { upTo: 30, label: 'Yüksek' },
      ],
      caption:
        'Yetişkinde dinlenik aralık kabaca 12-20 nefes/dakika. Bu bir tanı ölçütü değil; anlamlı olan kendi seyrin.',
    },
  },
  {
    id: TEST_BREATH_HOLD,
    label: 'Nefes tutma',
    short: 'Tam al, rahatça tutabildiğin kadar tut',
    unit: 's',
    decimals: 0,
    // Bilerek 'none': süreyi uzatmak bir sağlık göstergesi değil; yeşile
    // boyamak zorlamayı teşvik eder.
    improvement: 'none',
    area: 'nefes',
    screen: 'DiaphragmExercise',
    params: { tab: 'olcum' },
    note: 'Oturarak yap; suda veya araç kullanırken asla. Zorlama — rahatsızlık başlayınca bırak. Baş dönmesi olursa dur ve normal nefese dön.',
    // Nüfus normu vermek burada doğrudan zararlı olurdu: "hedef" gören kişi
    // zorlar. Yalnızca kendi aralığı gösteriliyor.
    scale: { kind: 'personal', caption: PERSONAL_SCALE_CAPTION },
  },
  {
    id: TEST_CONTROL_PAUSE,
    label: 'Kontrol duraklaması',
    short: 'Normal verişten sonra ilk nefes ihtiyacına kadar',
    unit: 's',
    decimals: 0,
    // Popüler ölçütlerin (BOLT vb.) sağlık göstergesi olduğu kanıtı zayıf —
    // yalnızca kendi eğilimini görmek için.
    improvement: 'none',
    area: 'nefes',
    screen: 'DiaphragmExercise',
    params: { tab: 'olcum' },
    note: 'Derin nefes alma; normal bir verişin sonunda dur ve İLK nefes ihtiyacında bitir. Dayanma yarışı değil.',
    // Dolaşımdaki "20 sn altı kötü" türü eşiklerin kanıtı zayıf; tekrar
    // edilmiyor.
    scale: { kind: 'personal', caption: PERSONAL_SCALE_CAPTION },
  },
  {
    id: TEST_DIAPHRAGM_ISOLATION,
    label: 'Diyafram izolasyonu',
    short: '5 maddelik öz-kontrol',
    unit: '/5',
    decimals: 0,
    improvement: 'higher',
    area: 'nefes',
    screen: 'DiaphragmExercise',
    params: { tab: 'olcum' },
    note: 'Bir elini göğsüne, birini karnına koy ve maddeleri dürüstçe işaretle. Bu bir öz-değerlendirme, cihaz ölçümü değil.',
    scale: {
      kind: 'reference',
      min: 0,
      max: 5,
      bands: [
        { upTo: 2, label: 'Başlangıç' },
        { upTo: 4, label: 'Gelişiyor' },
        { upTo: 5, label: 'Oturmuş', typical: true },
      ],
      caption: 'İşaretlenen madde sayısı. Öz-değerlendirme; cihaz ölçümü değil.',
    },
  },
  {
    id: TEST_SINGLE_BREATH_COUNT,
    label: 'Tek nefeste sayma',
    short: 'Tek nefeste sabit tempoda kaça kadar',
    unit: 'sayı',
    decimals: 0,
    improvement: 'higher',
    area: 'veris',
    screen: 'DiaphragmExercise',
    params: { tab: 'olcum' },
    note: 'Sabit tempoda ve duyulur sesle say; hızlanmak sayıyı büyütür ama ölçümü bozar.',
    // Sayı tamamen tempoya bağlı: başkasının sayısıyla kıyaslanamaz.
    scale: { kind: 'personal', caption: PERSONAL_SCALE_CAPTION },
  },
  {
    id: TEST_READING_WPM,
    label: 'Okuma hızı',
    short: 'Hazır bir metni sesli okuma hızı',
    unit: 'kelime/dk',
    decimals: 0,
    // Tipik aralık 120-150; hızlı okumak "iyi" değil.
    improvement: 'none',
    area: 'diksiyon',
    screen: 'SpeechExercise',
    scale: {
      kind: 'reference',
      min: 60,
      max: 220,
      bands: [
        { upTo: 119, label: 'Yavaş' },
        { upTo: 150, label: 'Tipik', typical: true },
        { upTo: 220, label: 'Hızlı' },
      ],
      caption:
        'Mülakat ve sunum için tipik aralık 120-150 kelime/dakika. Hızlı olmak "iyi" değil; amaç kendi aralığını bilmek.',
    },
  },
  {
    id: TEST_FILLER_RATE,
    label: 'Dolgu kelime oranı',
    short: '60 saniye serbest konuşmada dakikada kaç dolgu',
    unit: 'dolgu/dk',
    decimals: 0,
    improvement: 'lower',
    area: 'diksiyon',
    screen: 'SpeechExercise',
    note: 'Bir konu seç ve 60 saniye serbest konuş; "şey, yani, eee" duydukça dokun.',
    scale: {
      kind: 'reference',
      min: 0,
      max: 20,
      bands: [
        { upTo: 2, label: 'Az', typical: true },
        { upTo: 6, label: 'Orta' },
        { upTo: 20, label: 'Sık' },
      ],
      // Dürüstlük: bu bantların arkasında bir nüfus çalışması yok, kaba bir
      // yol göstericidir. Caption bunu açıkça söylüyor.
      caption: 'Kaba bir ölçek — nüfus normu değil. Anlamlı olan kendi eğilimin.',
    },
  },
  {
    id: TEST_POSTURE_SELF_CHECK,
    label: 'Duruş öz-kontrolü',
    short: '5 maddelik öz-kontrol',
    unit: '/5',
    decimals: 0,
    // Diyafram izolasyonuyla aynı gerekçe: işaretlenen madde arttıkça duruş
    // farkındalığı oturmuş sayılır.
    improvement: 'higher',
    area: 'durus',
    screen: 'BrainExercises',
    params: { track: 'physiological' },
    note: 'Aynı sandalyede, günün aynı saatinde, ayna ya da telefon kamerası karşısında yap. Bu bir öz-değerlendirme; duruş bozukluğunu teşhis etmez. Ağrın varsa önce hekime görün.',
    scale: {
      kind: 'reference',
      min: 0,
      max: 5,
      bands: [
        { upTo: 2, label: 'Başlangıç' },
        { upTo: 4, label: 'Gelişiyor' },
        { upTo: 5, label: 'Oturmuş', typical: true },
      ],
      caption: 'İşaretlenen madde sayısı. Öz-değerlendirme; cihaz ölçümü değil.',
    },
  },
];

/**
 * Referans skalada bir değerin yeri — "ben neredeyim" çubuğunun hesabı.
 *
 * SAF: çizimden ayrı tutuldu ki sınır durumları (dilim sınırları, çubuğun
 * dışına taşan ölçümler) Node altında sınanabilsin. Dilim sınırları **dahil**:
 * `upTo: 20` olan dilime 20 de girer.
 */
export function referenceScalePosition(
  scale: Extract<MeasureScale, { kind: 'reference' }>,
  value: number,
): {
  segments: { label: string; typical: boolean; flex: number }[];
  /** Çubuktaki konum, 0-1 arası; taşan ölçümler uca sabitlenir. */
  ratio: number;
  /** Değerin düştüğü dilimin etiketi. */
  current: string;
} {
  const span = scale.max - scale.min;
  let cursor = scale.min;
  const segments = scale.bands.map((band) => {
    const from = cursor;
    const to = Math.max(band.upTo, from);
    cursor = to;
    return {
      label: band.label,
      typical: band.typical === true,
      flex: span <= 0 ? 1 / scale.bands.length : (to - from) / span,
    };
  });

  const ratio = span <= 0 ? 0 : Math.max(0, Math.min(1, (value - scale.min) / span));
  // Çubuğun üstüne taşan ölçüm de son dilimde sayılır.
  const current = scale.bands.find((band) => value <= band.upTo) ?? scale.bands[scale.bands.length - 1];

  return { segments, ratio, current: current.label };
}

/**
 * Kişisel skalada yer: kişinin kendi en düşük ve en yüksek ölçümü arasında.
 *
 * `null` döner (çubuk çizilmez) iki durumda: iki ölçümden az varsa ya da
 * bütün ölçümler aynıysa. İkisinde de bir "aralık" yok; çubuk çizilse değer
 * hep uçta durur ve yanıltırdı.
 */
export function personalScalePosition(
  values: readonly number[],
  value: number,
): { min: number; max: number; ratio: number } | null {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return null;
  return { min, max, ratio: Math.max(0, Math.min(1, (value - min) / (max - min))) };
}

export function findMeasureTest(id: string): MeasureTest | undefined {
  return MEASURE_TESTS.find((test) => test.id === id);
}

export function testsForArea(area: MeasureArea): MeasureTest[] {
  return MEASURE_TESTS.filter((test) => test.area === area);
}

/** Karnede bölüm sırası. */
export const AREA_ORDER: MeasureArea[] = ['nefes', 'veris', 'diksiyon', 'durus'];
