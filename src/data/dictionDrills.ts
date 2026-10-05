import { pickForDay } from '../utils/dateUtils';
import type { DailyPracticeSettings } from '../utils/dailyPracticeSettings';

// Konuşma (diksiyon) egzersizleri.
// Beş tür: artikülasyon, tekerleme, vurgu-tonlama, sesli okuma ve dolgu kelime avı.
// Dolgu kelime avı uygulamanın mevcut yapay zeka analizindeki "fillerRating" ölçütüyle eşleşir.

export type DrillKind = 'artikulasyon' | 'tekerleme' | 'vurgu' | 'tempo' | 'dolguAvi';

export type DrillItem = {
  text: string;
  /** Öğeye özel uyarı: hangi sesi kaçırma, nerede duraklama ver vb. */
  note?: string;
};

export type DictionDrill = {
  id: string;
  kind: DrillKind;
  title: string;
  /** Hangi kas / ses / beceri çalışılıyor. */
  focus: string;
  instruction: string;
  items: DrillItem[];
  /** Öğe başına ayrılan saniye — ekran sayacı bunu kullanır. */
  secondsPerItem: number;
  /** Kullanıcının kendini nasıl değerlendireceği. */
  selfCheck: string;
};

export const DRILL_KIND_LABELS: Record<DrillKind, string> = {
  artikulasyon: 'Artikülasyon',
  tekerleme: 'Tekerleme',
  vurgu: 'Vurgu & Tonlama',
  tempo: 'Tempo & Ses Hacmi',
  dolguAvi: 'Dolgu Kelime Avı',
};

const ARTICULATION: DictionDrill[] = [
  {
    id: 'art-plosive',
    kind: 'artikulasyon',
    title: 'Patlamalı Ünsüzler (p/b, t/d, k/g)',
    focus: 'Dudak ve dil ucu netliği',
    instruction:
      'Her hecede sesi abartılı biçimde patlatın. Önce yavaş, sonra ritmi bozmadan hızlandırın.',
    items: [
      { text: 'pa-ba, pe-be, pı-bı, pi-bi, po-bo, pö-bö, pu-bu, pü-bü', note: 'Dudaklar tam kapansın.' },
      { text: 'ta-da, te-de, tı-dı, ti-di, to-do, tö-dö, tu-du, tü-dü', note: 'Dil ucu üst dişlerin arkasına vursun.' },
      { text: 'ka-ga, ke-ge, kı-gı, ki-gi, ko-go, kö-gö, ku-gu, kü-gü', note: 'Ses damaktan gelsin, boğazı sıkmayın.' },
      { text: 'pat-bat, tek-dek, kap-gap, tıp-dıp, kök-gök' },
    ],
    secondsPerItem: 30,
    selfCheck: 'p ile b arasındaki fark dinleyende belirsizse dudak basıncı yetersiz.',
  },
  {
    id: 'art-r',
    kind: 'artikulasyon',
    title: '"R" Titreşimi',
    focus: 'Dil ucu titreşimi — Türkçede en sık savsaklanan ses',
    instruction: 'Dil ucunu üst damağa hafifçe yaklaştırıp titretin. Boğazdan değil dilden gelsin.',
    items: [
      { text: 'tra-tre-trı-tri-tro-trö-tru-trü' },
      { text: 'dra-dre-drı-dri-dro-drö-dru-drü' },
      { text: 'ara-ere-ırı-iri-oro-örö-uru-ürü', note: 'Her r tek tek duyulsun.' },
      { text: 'raporun rutin revizyonu roketin range hesabını revize etti', note: 'Hızlanmadan, her r net.' },
    ],
    secondsPerItem: 30,
    selfCheck: 'r sesi "y"ye kayıyorsa dil ucu yeterince yaklaşmıyor.',
  },
  {
    id: 'art-sibilant',
    kind: 'artikulasyon',
    title: 'Sızmalı Ünsüzler (s/ş, z/j, f/v)',
    focus: 'Islık ve hışırtı seslerinin ayrımı',
    instruction: 'Çifti yan yana söyleyip iki ses arasındaki dil pozisyonu farkını hissedin.',
    items: [
      { text: 'sas-şaş, ses-şeş, sıs-şış, sis-şiş, sos-şoş, sus-şuş' },
      { text: 'zaz-jaj, zez-jej, ziz-jij, zoz-joj' },
      { text: 'faf-vav, fef-vev, fif-viv, fof-vov' },
      { text: 'sistemin şasi sensörü şaşırtıcı şekilde sessiz', note: 's ve ş birbirine karışmasın.' },
    ],
    secondsPerItem: 25,
    selfCheck: 's sesi peltekleşiyorsa dil ucu dişlerin arasına giriyor.',
  },
  {
    id: 'art-vowel',
    kind: 'artikulasyon',
    title: 'Ünlü Açma & Çene Gevşetme',
    focus: 'Ağız açıklığı — sesin kısılmasını engeller',
    instruction:
      'Aynaya bakarak yapın. Her ünlüde çenenizi gerçekten açın; stres altında ilk kapanan yer burasıdır.',
    items: [
      { text: 'A — E — I — İ — O — Ö — U — Ü', note: 'Her biri 2 saniye, ağız sonuna kadar açık.' },
      { text: 'ma-me-mı-mi-mo-mö-mu-mü', note: 'Dudak kapanışı yumuşak.' },
      { text: 'la-le-lı-li-lo-lö-lu-lü' },
      { text: 'na-ne-nı-ni-no-nö-nu-nü', note: 'Ses buruna kaçmasın.' },
    ],
    secondsPerItem: 25,
    selfCheck: 'Çeneniz iki parmak açıklığına gelmiyorsa ses karnından değil boğazdan çıkıyor.',
  },
];

const TONGUE_TWISTERS: DictionDrill[] = [
  {
    id: 'tek-berber',
    kind: 'tekerleme',
    title: 'Berber',
    focus: 'b/r geçişleri ve tempo kontrolü',
    instruction: 'Üç kez söyleyin: yavaş, normal, hızlı. Hızlıda tek hece yutmayın.',
    items: [
      { text: 'Bir berber bir berbere gel beraber bir berber dükkânı açalım demiş.' },
      { text: 'Bir berber bir berbere bre berber beri gel diye bar bar bağırmış.' },
    ],
    secondsPerItem: 45,
    selfCheck: 'Hızlı turda "berber" yerine "berbe" diyorsanız hız fazla.',
  },
  {
    id: 'tek-kose',
    kind: 'tekerleme',
    title: 'Yaz Köşesi',
    focus: 'ş/s ayrımı ve ünlü netliği',
    instruction: 'Her "şu" ve "su" arasındaki farkı belirgin tutun.',
    items: [
      { text: 'Şu köşe yaz köşesi, şu köşe kış köşesi, ortada su şişesi.' },
      { text: 'Şu şişe su şişesi mi, su şişesi şu şişe mi?' },
    ],
    secondsPerItem: 40,
    selfCheck: '"su" ve "şu" aynı duyuluyorsa dil ucu doğru yerde değil.',
  },
  {
    id: 'tek-kartal',
    kind: 'tekerleme',
    title: 'Kartal Kalkar',
    focus: 'k/l/r zinciri ve ritim',
    instruction: 'Sabit bir ritim tutun; hızlanmak değil eşit tempoda kalmak hedef.',
    items: [
      { text: 'Kartal kalkar dal sarkar, dal sarkar kartal kalkar.' },
      { text: 'Dal kalkar kartal sarkar, kartal sarkar dal kalkar.' },
    ],
    secondsPerItem: 40,
    selfCheck: 'Ritim bozulmadan 4 tur yapabiliyor musunuz?',
  },
  {
    id: 'tek-yogurt',
    kind: 'tekerleme',
    title: 'Sarımsaklasak',
    focus: 'Uzun kelimede hece koruma',
    instruction: 'Tek nefeste bitirmeye çalışın — diyafram desteği burada devreye girer.',
    items: [
      {
        text: 'Bu yoğurdu sarımsaklasak da mı saklasak, sarımsaklamasak da mı saklasak?',
      },
    ],
    secondsPerItem: 45,
    selfCheck: 'Cümle ortasında nefes almak zorunda kalıyorsanız diyafram programına dönün.',
  },
  {
    id: 'tek-kup',
    kind: 'tekerleme',
    title: 'Kırk Küp',
    focus: 'k/p patlamalı tekrarı',
    instruction: 'Her "k" ve "p" duyulsun; yorulunca ilk düşen bu sesler olur.',
    items: [
      { text: 'Kırk küp, kırkının da kulpu kırık kara küp.' },
      { text: 'Kırk kırık küpün kırk kırık kulpu.' },
    ],
    secondsPerItem: 40,
    selfCheck: 'Sonlardaki "p" yumuşuyorsa dudak basıncı düşüyor.',
  },
  {
    id: 'tek-degirmen',
    kind: 'tekerleme',
    title: 'Değirmen',
    focus: 'Uzun cümlede nefes yönetimi',
    instruction: 'Cümleyi iki nefeste bitirin ve nefes yerini her turda aynı tutun.',
    items: [
      {
        text: 'Değirmene girdi köpek, değirmenci çaldı kötek; hem kepek yedi köpek, hem kötek yedi köpek.',
        note: 'Nefes: "kötek;" sonrasında.',
      },
    ],
    secondsPerItem: 45,
    selfCheck: 'Nefes yeri her turda kayıyorsa cümle planını önceden kurmuyorsunuz.',
  },
  {
    id: 'tek-ordek',
    kind: 'tekerleme',
    title: 'Beş Boz Ördek',
    focus: 'b/z tekrarı ve tempo dayanıklılığı',
    instruction: 'Tek nefeste iki cümleyi de söylemeye çalışın.',
    items: [
      {
        text: 'Sizin damda var beş boz başlı beş boz ördek, bizim damda var beş boz başlı beş boz ördek.',
      },
      {
        text: 'Sizin damdaki beş boz başlı beş boz ördek, bizim damdaki beş boz başlı beş boz ördeğe "siz de bizim gibi beş boz başlı beş boz ördek misiniz?" demiş.',
        note: 'İleri seviye. İki nefes hakkınız var.',
      },
    ],
    secondsPerItem: 50,
    selfCheck: 'Uzun versiyonu iki nefeste bitirmek 3. seviye diyafram göstergesidir.',
  },
  {
    id: 'tek-kivilcim',
    kind: 'tekerleme',
    title: 'Kıvılcımlandırıcı',
    focus: 'Çok heceli kelimede hece atlamama',
    instruction: 'Yavaş başlayın. Hece atlamadan söyleyebildiğiniz en yüksek hızı bulun.',
    items: [
      { text: 'Ocak kıvılcımlandırıcılarımızdan mısınız?' },
      { text: 'Çekoslovakyalılaştırabilecekseniz çekoslovakyalılaştırıverin.' },
      { text: 'Getirebiliyorsam getirebiliyorum, getiremiyorsam getiremiyorum.' },
    ],
    secondsPerItem: 40,
    selfCheck: 'Teknik terimleri (ör. "elektromanyetik uyumluluk") aynı netlikte söyleyebiliyor musunuz?',
  },
];

const PROSODY: DictionDrill[] = [
  {
    id: 'vurgu-shift',
    kind: 'vurgu',
    title: 'Vurgu Kaydırma',
    focus: 'Aynı cümleyi farklı anlamlarla söyleme',
    instruction:
      'Her satırda BÜYÜK yazılan kelimeyi vurgulayın. Vurgu değişince cümlenin cevapladığı soru da değişir.',
    items: [
      { text: 'BEN bu projede yapısal analizi yaptım.', note: 'Cevap: Kim yaptı?' },
      { text: 'Ben BU PROJEDE yapısal analizi yaptım.', note: 'Cevap: Hangi projede?' },
      { text: 'Ben bu projede YAPISAL ANALİZİ yaptım.', note: 'Cevap: Neyi yaptın?' },
      { text: 'Ben bu projede yapısal analizi YAPTIM.', note: 'Cevap: Gerçekten yaptın mı?' },
    ],
    secondsPerItem: 20,
    selfCheck:
      'Dört okuyuşu kaydedip dinleyin. Farkı duyamıyorsanız mülakatta da tek düze konuşuyorsunuz.',
  },
  {
    id: 'vurgu-pause',
    kind: 'vurgu',
    title: 'Duraklama (Pause) Yerleştirme',
    focus: 'Sessizliği araç olarak kullanmak',
    instruction:
      '| işaretinde bir tam saniye durun. Duraklamayı doldurma dürtüsüne direnin — bu mülakatın en kritik becerisi.',
    items: [
      {
        text: 'Sorunuzu doğru anladıysam | sistemin ısıl bütçesini nasıl kapattığımızı soruyorsunuz.',
        note: 'Duraklama düşündüğünü değil, dinlediğini gösterir.',
      },
      {
        text: 'Üç seçeneği değerlendirdik. | Biri maliyeti düşürüyordu | ama doğrulama süresini iki katına çıkarıyordu.',
      },
      {
        text: 'Bunu bilmiyorum. | Ama nasıl bulacağımı biliyorum.',
        note: 'Duraklama olmadan bu cümle özür gibi, duraklamayla özgüven gibi duyulur.',
      },
    ],
    secondsPerItem: 25,
    selfCheck: 'Duraklamaları "eee" ile doldurduysanız tur geçersiz, baştan başlayın.',
  },
  {
    id: 'vurgu-intonation',
    kind: 'vurgu',
    title: 'Tonlama Yönü',
    focus: 'Cümle sonunda sesin düşmesi / yükselmesi',
    instruction:
      'Aynı cümleyi üç kez okuyun: sonu düşen (kararlı), sonu yükselen (soru), düz (tereddüt).',
    items: [
      { text: 'Bu çözümün doğrulanabilir olduğunu düşünüyorum.', note: 'Kararlı: son hece aşağı.' },
      { text: 'Test kapsamını genişletmemiz gerekir mi?', note: 'Soru: son hece yukarı.' },
      { text: 'Sanırım öyle olabilir.', note: 'Düz tonlama = tereddüt. Bu tonu fark edin ve kullanmayın.' },
    ],
    secondsPerItem: 20,
    selfCheck: 'Kararlı cümleleriniz soru gibi bitiyorsa dinleyici size güvenmez.',
  },
];

const TEMPO: DictionDrill[] = [
  {
    id: 'tempo-rate',
    kind: 'tempo',
    title: 'Konuşma Hızı Ayarı',
    focus: 'Dakikada 130-150 kelime bandını bulmak',
    instruction:
      'Aşağıdaki metni okurken süreyi tutun. Hedef: her satırı yaklaşık 12 saniyede bitirmek (≈140 kelime/dk).',
    items: [
      {
        text: 'Sistem tasarımında ilk aldığımız karar, alt bileşenler arasındaki arayüzleri dondurmaktı; böylece paralel çalışan ekipler birbirini beklemek zorunda kalmadı.',
        note: '≈28 kelime → 12 saniye.',
      },
      {
        text: 'Doğrulama kampanyasını üç aşamaya böldük: bileşen seviyesinde fonksiyonel testler, alt sistem entegrasyon testleri ve saha koşullarını taklit eden çevresel testler.',
        note: 'Aynı tempoda kalın, hızlanmayın.',
      },
    ],
    secondsPerItem: 30,
    selfCheck: 'Stres altında hız artar. 8 saniyede bitiriyorsanız yavaşlayın.',
  },
  {
    id: 'tempo-volume',
    kind: 'tempo',
    title: 'Ses Hacmi Basamakları',
    focus: 'Bağırmadan hacmi artırmak',
    instruction:
      'Aynı cümleyi 1\'den 5\'e artan hacimde söyleyin. Hacim diyaframdan gelsin, boğazı zorlamayın.',
    items: [
      { text: 'Seviye 1 — karşımdaki kişi zar zor duyacak kadar.' },
      { text: 'Seviye 3 — normal toplantı sesi.' },
      { text: 'Seviye 5 — on kişilik odanın arkasına ulaşacak kadar.', note: 'Ses çatlıyorsa boğazı kullanıyorsunuz.' },
    ],
    secondsPerItem: 20,
    selfCheck: 'Seviye 5\'te boğazınız acıyorsa destek diyaframdan gelmiyor.',
  },
];

const FILLER_HUNT: DictionDrill[] = [
  {
    id: 'dolgu-hunt',
    kind: 'dolguAvi',
    title: 'Dolgu Kelime Avı',
    focus: '"yani, şey, hani, aslında, eee" temizliği',
    instruction:
      'Aşağıdaki sorulardan birini seçin ve 60 saniye konuşun. Tek bir dolgu kelimesi çıkarsa baştan başlayın. Boşluğu doldurmak yerine sessiz kalın.',
    items: [
      { text: 'Son yaptığınız teknik işi, teknik olmayan birine anlatın.', note: 'Yasak: yani, şey, hani, aslında, işte, eee, ııı.' },
      { text: 'Bir mühendislik kararınızın yanlış olduğunu ne zaman anladınız?' },
      { text: 'Neden savunma sanayii? 60 saniye, dolgusuz.' },
      { text: 'Bilmediğiniz bir soruyla karşılaştığınızda ne yaparsınız?' },
    ],
    secondsPerItem: 60,
    selfCheck:
      'Kaydı dinleyip dolgu sayısını not edin. Uygulamanın mülakat analizindeki "dolgu kelime" puanı bu sayıyla birebir ilerler.',
  },
];

const ALL_DRILLS: DictionDrill[] = [
  ...ARTICULATION,
  ...TONGUE_TWISTERS,
  ...PROSODY,
  ...TEMPO,
  ...FILLER_HUNT,
];

export function allDrills(): DictionDrill[] {
  return ALL_DRILLS;
}

/** Ayarların kapattığı türleri havuzdan çıkarır. */
export function availableDrills(speech: DailyPracticeSettings['speech']): DictionDrill[] {
  return ALL_DRILLS.filter((drill) => {
    if (drill.kind === 'tekerleme' && !speech.includeTongueTwisters) return false;
    if (drill.kind === 'dolguAvi' && !speech.includeFillerHunt) return false;
    return true;
  });
}

/** Günün egzersizi. Aynı gün içinde her açılışta aynı sonucu verir. */
export function pickDailyDrill(
  speech: DailyPracticeSettings['speech'],
  date: Date = new Date(),
): DictionDrill {
  const pool = availableDrills(speech);
  // Her tür kapatılmış olsa bile artikülasyon her zaman havuzda kalır.
  return pickForDay(pool.length > 0 ? pool : ARTICULATION, date, 1);
}

/**
 * Günün seansı: artikülasyon ısınması + günün ana egzersizi.
 * Isınma her gün sabit bir rotasyonla değişir, ana egzersiz havuzdan seçilir.
 */
export function buildDailySession(
  speech: DailyPracticeSettings['speech'],
  date: Date = new Date(),
): DictionDrill[] {
  const warmup = pickForDay(ARTICULATION, date, 0);
  const main = pickDailyDrill(speech, date);
  return main.id === warmup.id ? [warmup] : [warmup, main];
}

export function drillSeconds(drill: DictionDrill): number {
  return drill.items.length * drill.secondsPerItem;
}
