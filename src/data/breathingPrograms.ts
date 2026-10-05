import type { BreathingLevel, BreathingMode } from '../utils/dailyPracticeSettings';

// Diyafram nefesi programları.
// Kaynak alınan teknikler: 4-4-6 farkındalık nefesi, 4-7-8, kutu nefesi (box breathing)
// ve diksiyon eğitiminde kullanılan "7-11" ile "s sesiyle kontrollü verme" alıştırmaları.

export type BreathPhaseKind = 'inhale' | 'holdFull' | 'exhale' | 'holdEmpty';

export type BreathPhase = {
  kind: BreathPhaseKind;
  seconds: number;
  /** Ekranda ve seste kullanıcıya verilen komut. */
  cue: string;
};

export type BreathingSegment = {
  id: string;
  title: string;
  description: string;
  cycles: number;
  phases: BreathPhase[];
  /** Segment başında gösterilen kısa hatırlatma. */
  tip?: string;
  /** Verilmişse `tip`, çalışan ekranda her N döngüde bir tekrar gösterilir. */
  reminderEvery?: number;
};

export type BreathingProgram = {
  mode: BreathingMode;
  /** Yalnızca gelişim modunda anlamlı. */
  level?: BreathingLevel;
  title: string;
  subtitle: string;
  /** Neden yapıyoruz — mülakat performansına bağlanmış faydalar. Boşsa "Ne Kazandırır" kartı hiç gösterilmez. */
  benefits: string[];
  segments: BreathingSegment[];
  safetyNote: string;
  /** Bitişte "Program tamamlandı." yerine toplam döngü sayısını bildir. */
  announceCycleCount?: boolean;
};

export const PHASE_LABELS: Record<BreathPhaseKind, string> = {
  inhale: 'Al',
  holdFull: 'Tut',
  exhale: 'Ver',
  holdEmpty: 'Bekle',
};

const LEVEL_1: BreathingProgram = {
  mode: 'progressive',
  level: 1,
  title: 'Temel Diyafram Farkındalığı',
  subtitle: 'Nefesin göğsünden karnına insin',
  benefits: [
    'Nefesin omuz yerine diyaframdan alındığını hissettirir',
    'Mülakat öncesi kalp atışını yavaşlatır',
    'Cümle sonunda sesin düşmesini engeller',
  ],
  safetyNote:
    'Diyaframı zorlamayın. Baş dönmesi, karıncalanma veya göğüste sıkışma olursa durup normal nefesinize dönün.',
  segments: [
    {
      id: 'l1-awareness',
      title: 'Farkındalık',
      description: 'Bir elin göbeğinin üstünde, diğeri göğsünde. Sadece alttaki el hareket etsin.',
      tip: 'Omuzlarını yukarı çekiyorsan nefes göğse gidiyor — sıfırla ve tekrar dene.',
      cycles: 6,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Burnundan al — karnın şişsin' },
        { kind: 'holdFull', seconds: 2, cue: 'Kısa tut — havayı yerleştir' },
        { kind: 'exhale', seconds: 6, cue: 'Ağzından ver — karın içeri' },
      ],
    },
    {
      id: 'l1-446',
      title: '4-4-6 Dengeleme',
      description: 'Tutma fazı eklenir; diyafram kasının kontrolü artar.',
      cycles: 8,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Burnundan al' },
        { kind: 'holdFull', seconds: 4, cue: 'Tut — omuzlar gevşek' },
        { kind: 'exhale', seconds: 6, cue: 'Yavaşça ver' },
      ],
    },
    {
      id: 'l1-sss',
      title: '"S" ile Kontrollü Verme',
      description: 'Nefesi tek bir "sss" sesiyle, sabit basınçla boşaltın.',
      tip: 'Ses titriyorsa hava kaçırıyorsun. Amaç düz ve kesintisiz bir "sss".',
      cycles: 5,
      phases: [
        { kind: 'inhale', seconds: 3, cue: 'Hızlı ve derin al' },
        { kind: 'holdFull', seconds: 1, cue: 'Bir an tut' },
        { kind: 'exhale', seconds: 10, cue: 'Sabit "sssss" — sonuna kadar' },
        { kind: 'holdEmpty', seconds: 2, cue: 'Bekle, acele etme' },
      ],
    },
  ],
};

const LEVEL_2: BreathingProgram = {
  mode: 'progressive',
  level: 2,
  title: 'Kontrollü Nefes',
  subtitle: '4-7-8 ve kutu nefesi ile dayanıklılık',
  benefits: [
    'Uzun cümleleri tek nefeste bitirme kapasitesi kazandırır',
    'Parasempatik sistemi devreye alarak stresi düşürür',
    'Sesin tonunu ve hacmini dengede tutar',
  ],
  safetyNote:
    'Tutma süreleri zorlayıcı geliyorsa saniyeleri değil tur sayısını azaltın. Nefes açlığı hissi normal, panik hissi değil.',
  segments: [
    {
      id: 'l2-warmup',
      title: 'Isınma',
      description: 'Diyaframı uyandırmak için kısa turlar.',
      cycles: 4,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Burnundan al' },
        { kind: 'holdFull', seconds: 2, cue: 'Kısa tut' },
        { kind: 'exhale', seconds: 6, cue: 'Ağzından ver' },
      ],
    },
    {
      id: 'l2-478',
      title: '4-7-8',
      description: 'Klasik sakinleştirme nefesi. Verme fazı alma fazının iki katı.',
      tip: 'Verirken dişlerinin arasından hafif bir "fuuu" sesi çıkar; bu basıncı sabit tutmana yardım eder.',
      cycles: 8,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Burnundan al' },
        { kind: 'holdFull', seconds: 7, cue: 'Tut — çene gevşek' },
        { kind: 'exhale', seconds: 8, cue: 'Ağzından uzun ver' },
      ],
    },
    {
      id: 'l2-box',
      title: 'Kutu Nefesi',
      description: 'Dört faz eşit. Zihni tek bir ritme kilitler.',
      cycles: 6,
      phases: [
        { kind: 'inhale', seconds: 5, cue: 'Al' },
        { kind: 'holdFull', seconds: 5, cue: 'Tut' },
        { kind: 'exhale', seconds: 5, cue: 'Ver' },
        { kind: 'holdEmpty', seconds: 5, cue: 'Boş bekle' },
      ],
    },
    {
      id: 'l2-counting',
      title: 'Sayarak Verme',
      description: 'Tek nefeste yüksek sesle sayın. Her turda bir adım ileri gitmeye çalışın.',
      tip: 'Hedef: tek nefeste 20+. Ses düşmeye başladığında durmayın, basıncı diyaframdan destekleyin.',
      cycles: 4,
      phases: [
        { kind: 'inhale', seconds: 3, cue: 'Derin al' },
        { kind: 'holdFull', seconds: 1, cue: 'Bir an tut' },
        { kind: 'exhale', seconds: 12, cue: 'Yüksek sesle say: 1, 2, 3...' },
        { kind: 'holdEmpty', seconds: 3, cue: 'Toparlan' },
      ],
    },
  ],
};

const LEVEL_3: BreathingProgram = {
  mode: 'progressive',
  level: 3,
  title: 'Mülakat Baskısı',
  subtitle: '7-11 ve baskı altında toparlanma',
  benefits: [
    'Zor sorudan sonra sesi titremeden toparlamayı öğretir',
    'Sessizliğe dayanma süresini uzatır',
    'Uzun teknik açıklamalarda nefesin yetmesini sağlar',
  ],
  safetyNote:
    'Bu seviye ileri düzeydir. Baş dönmesi olursa 1. seviyeye dönün. Araç kullanırken veya ayakta yapmayın.',
  segments: [
    {
      id: 'l3-711',
      title: '7-11',
      description: 'Verme fazı almanın 1.5 katı. Diksiyon eğitimlerinin temel dayanıklılık nefesi.',
      cycles: 8,
      phases: [
        { kind: 'inhale', seconds: 7, cue: 'Diyaframa doğru yavaş al' },
        { kind: 'holdFull', seconds: 2, cue: 'Tut — göğsü kilitleme' },
        { kind: 'exhale', seconds: 11, cue: 'Kontrollü, kesintisiz ver' },
      ],
    },
    {
      id: 'l3-recovery',
      title: 'Baskı Altında Toparlanma',
      description:
        'Kısa ve hızlı bir nefes, ardından uzun bir verme. Zor bir sorudan sonra kullanacağınız kalıp.',
      tip: 'Mülakatta soruyu duydun, cevabın yok. Bu nefesi bir kez al, sonra konuşmaya başla.',
      cycles: 6,
      phases: [
        { kind: 'inhale', seconds: 2, cue: 'Sessiz ve hızlı al' },
        { kind: 'holdFull', seconds: 2, cue: 'Tut — düşün' },
        { kind: 'exhale', seconds: 8, cue: 'Ver ve cevabı kur' },
      ],
    },
    {
      id: 'l3-sustain',
      title: 'Uzatılmış "S"',
      description: 'Tek nefeste maksimum süre sabit ses. Kapasite testi.',
      tip: '20 saniyeyi geçebiliyorsan uzun teknik cevaplarda nefesin yetiyor.',
      cycles: 4,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Tam kapasite al' },
        { kind: 'holdFull', seconds: 2, cue: 'Tut ve basıncı hazırla' },
        { kind: 'exhale', seconds: 20, cue: 'Sabit "sssss" — bırakma' },
        { kind: 'holdEmpty', seconds: 4, cue: 'Dinlen' },
      ],
    },
  ],
};

/**
 * Günlük mod — her gün aynı, kısa bakım programı.
 * Seviyeden bağımsızdır: amaç kapasite artırmak değil, diyafram alışkanlığını
 * korumak ve mülakat/sunum öncesi hızlıca sakinleşmek.
 */
const DAILY: BreathingProgram = {
  mode: 'daily',
  title: 'Günlük Nefes Bakımı',
  subtitle: 'Her gün tekrarlanan kısa denge nefesi',
  benefits: [
    'Kısa olduğu için her gün aksatmadan yapılabilir',
    'Diyaframdan nefes alma alışkanlığını canlı tutar',
    'Mülakat ya da sunum öncesi birkaç dakikada sakinleştirir',
  ],
  safetyNote:
    'Tutma fazlarını zorlamadan uygulayın. Baş dönmesi veya karıncalanma olursa durup normal nefesinize dönün.',
  segments: [
    {
      id: 'daily-settle',
      title: 'Yerleşme',
      description: 'Nefesi göğüsten karna indirin. Bir elinizi göbeğinizin üstüne koyun.',
      tip: 'Omuzların yukarı kalkıyorsa nefes göğse gidiyor — sıfırla ve tekrar dene.',
      cycles: 4,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Burnundan al — karnın şişsin' },
        { kind: 'holdFull', seconds: 2, cue: 'Kısa tut — havayı yerleştir' },
        { kind: 'exhale', seconds: 6, cue: 'Ağzından ver — karın içeri' },
      ],
    },
    {
      id: 'daily-balance',
      title: 'Denge',
      description: 'Dört fazlı denge nefesi. Kalp atışını ve zihni aynı ritme oturtur.',
      cycles: 6,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Burnundan al' },
        { kind: 'holdFull', seconds: 4, cue: 'Tut — omuzlar gevşek' },
        { kind: 'exhale', seconds: 6, cue: 'Yavaşça ver' },
        { kind: 'holdEmpty', seconds: 2, cue: 'Bekle' },
      ],
    },
    {
      id: 'daily-close',
      title: 'Kapanış',
      description: 'Sabit basınçla verme. Sesin gün boyu dengeli çıkmasına hazırlar.',
      cycles: 3,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Derin al' },
        { kind: 'holdFull', seconds: 2, cue: 'Tut' },
        { kind: 'exhale', seconds: 8, cue: 'Sabit "sssss" ile ver' },
      ],
    },
  ],
};

/**
 * Sade 5 dakikalık 4-6 seansı — tek düğmeyle başlayan, baştan sona sabit
 * ritimli, süslemesiz rehberli seans. Mod/seviye sisteminin dışında: ayarlarda
 * seçilmez, ekranda ayrı bir "tek dokunuşla başlat" girişinden çalıştırılır.
 * Motivasyon cümlesi yok (benefits boş) ve bitişte döngü sayısı bildirilir.
 */
const SIMPLE_46: BreathingProgram = {
  mode: 'daily',
  title: 'Sade 5 Dakika · 4-6',
  subtitle: 'Sabit ritim, süslemesiz nefes',
  benefits: [],
  announceCycleCount: true,
  safetyNote:
    'Baş dönmesi, karıncalanma veya göğüste sıkışma olursa durup normal nefesinize dönün. Ayakta, araç kullanırken veya suda yapmayın.',
  segments: [
    {
      id: 'simple46-session',
      title: 'Sade 4-6',
      description: 'Tutma yok: 4 saniye burundan al, 6 saniye ağızdan ver. 30 döngü boyunca aynı ritim.',
      tip: 'Karnın şişsin, göğsün sabit kalsın.',
      reminderEvery: 5,
      cycles: 30,
      phases: [
        { kind: 'inhale', seconds: 4, cue: 'Burnundan al' },
        { kind: 'exhale', seconds: 6, cue: 'Ağzından ver' },
      ],
    },
  ],
};

function decorateProgram(program: BreathingProgram): BreathingProgram & {
  durationLabel: string;
  totalSeconds: number;
} {
  const totalSeconds = programSeconds(program);
  return {
    ...program,
    totalSeconds,
    durationLabel: `${Math.round(totalSeconds / 60)} dk`,
  };
}

/** Sade 5 dk · 4-6 seansını süresiyle birlikte döner. */
export function getSimple46Program(): BreathingProgram & {
  durationLabel: string;
  totalSeconds: number;
} {
  return decorateProgram(SIMPLE_46);
}

const PROGRAMS: Record<BreathingLevel, BreathingProgram> = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
};

export const BREATHING_MODES: { value: BreathingMode; label: string; description: string }[] = [
  {
    value: 'daily',
    label: 'Günlük',
    description: 'Her gün aynı, kısa bakım programı. Seviye gerektirmez.',
  },
  {
    value: 'progressive',
    label: 'Gelişim',
    description: 'Seviye seviye ilerleyen, kapasite artıran uzun program.',
  },
];

export function segmentSeconds(segment: BreathingSegment): number {
  const cycle = segment.phases.reduce((sum, p) => sum + p.seconds, 0);
  return cycle * segment.cycles;
}

export function programSeconds(program: BreathingProgram): number {
  return program.segments.reduce((sum, s) => sum + segmentSeconds(s), 0);
}

/**
 * Ayarlardaki mod ve seviyeye göre programı ve okunabilir süresini döner.
 * Günlük modda seviye yok sayılır.
 */
export function getBreathingProgram(
  mode: BreathingMode,
  level: BreathingLevel,
): BreathingProgram & {
  durationLabel: string;
  totalSeconds: number;
} {
  const program = mode === 'daily' ? DAILY : (PROGRAMS[level] ?? LEVEL_1);
  return decorateProgram(program);
}

export const BREATHING_LEVELS: BreathingLevel[] = [1, 2, 3];

/**
 * Bir programı düz bir faz listesine açar; ekran bu listeyi baştan sona oynatır.
 * Her adım hangi segmentin kaçıncı turunda olduğunu da taşır.
 */
export type BreathStep = BreathPhase & {
  segmentId: string;
  segmentTitle: string;
  cycleIndex: number;
  cycleCount: number;
  /** Segmentin hatırlatması — `reminderEvery` doluysa her N döngüde bir gösterilir. */
  tip?: string;
  reminderEvery?: number;
};

export function flattenProgram(program: BreathingProgram): BreathStep[] {
  const steps: BreathStep[] = [];
  for (const segment of program.segments) {
    for (let cycle = 0; cycle < segment.cycles; cycle += 1) {
      for (const phase of segment.phases) {
        steps.push({
          ...phase,
          segmentId: segment.id,
          segmentTitle: segment.title,
          cycleIndex: cycle + 1,
          cycleCount: segment.cycles,
          tip: segment.tip,
          reminderEvery: segment.reminderEvery,
        });
      }
    }
  }
  return steps;
}

/** Programın toplam döngü sayısı — bitişte `announceCycleCount` ile bildirilir. */
export function programCycleCount(program: BreathingProgram): number {
  return program.segments.reduce((sum, s) => sum + s.cycles, 0);
}
