import { companiesForSector, findCompany, type CompanyId } from './companies';
import { findDepartment, type DepartmentId, type SectorId } from './sectors';
import { dayIndex, pickForDay } from '../utils/dateUtils';
import { GENERAL_QUESTIONS } from './questionBank/genel';
import { SAVUNMA_TECHNICAL } from './questionBank/savunma';
import { YAZILIM_TECHNICAL } from './questionBank/yazilim';
import { KRIZ_QUESTIONS } from './questionBank/kriz';
import { MAAS_QUESTIONS } from './questionBank/maas';

// Mülakat soru motoru.
//
// Havuzlar `questionBank/` altında sektör başına ayrı dosyada; bu dosya yalnızca
// tipleri ve seçim kurallarını tutar. Üç özellik **aynı** teknik havuzu kullanır
// (YAPILACAKLAR_İRTİFA Bölüm 2.5 / 3): mülakat simülasyonu, günün alan testi ve
// teknik soru bankası. İkinci bir soru deposu kurulmaz.
//
// Günlük seçimler gün numarasına göre deterministik: aynı gün uygulamayı kaç
// kez açarsanız açın aynı kurum ve aynı soru gelir.

export type { DepartmentId } from './sectors';

/**
 * Simülasyon türü. Dördü de aynı motoru kullanıyor; ayrıldıkları yer havuz ve
 * ekrandaki çerçeve:
 * - `genel`   — davranışsal mülakat soruları.
 * - `teknik`  — hedef alanın soru havuzu (departmana bağlı).
 * - `kriz`    — Kriz Masası: süre baskılı, karar gerektiren senaryolar.
 * - `maas`    — maaş görüşmesi: baskı değil pazarlık (YAPILACAKLAR_İRTİFA 2.5).
 */
export type InterviewType = 'genel' | 'teknik' | 'kriz' | 'maas';

/**
 * Alan testindeki ağırlık. Günlük set 1 ağır + 2 kısa sorudan oluşur
 * (YAPILACAKLAR_İRTİFA Bölüm 3, karar 1).
 * - `agir`: açık uçlu, muhakeme ve gerekçe isteyen, alanın özüne dokunan.
 * - `kisa`: terim/tanım, hızlı hesap, küçük senaryo.
 */
export type QuestionWeight = 'agir' | 'kisa';

export type Question = {
  id: string;
  text: string;
  type: InterviewType;
  /**
   * Genel sorularda: yoksa her sektörde geçerli, varsa yalnızca o sektörün
   * kurumlarıyla gelir. Teknik sorularda departmandan türetilir, yazılmaz.
   */
  sectorId?: SectorId;
  /** Teknik sorularda zorunlu — `sectors.ts` → `DEPARTMENTS`. */
  department?: DepartmentId;
  /** Boşsa her kurum için geçerli. */
  companyIds?: CompanyId[];
  /** Teknik sorularda zorunlu — alan testinin set kuralı buna bakar. */
  weight?: QuestionWeight;
  /**
   * Teknik sorularda: iyi bir cevapta bulunması beklenen 2–4 nokta. Çevrimdışı
   * öz-değerlendirmede gösterilir, yapay zekâya değerlendirme ölçütü olarak gider.
   */
  keyPoints?: string[];
  /** Bu sorunun adayı neden zorladığı — mülakat sonrası ipucu olarak gösterilir. */
  stressFactor: string;
  /** Sessizliğe dayanma / cevap kurma tavsiyesi. */
  tip: string;
};

export const TECHNICAL_QUESTIONS: Question[] = [...SAVUNMA_TECHNICAL, ...YAZILIM_TECHNICAL];

export const ALL_QUESTIONS: Question[] = [
  ...GENERAL_QUESTIONS,
  ...TECHNICAL_QUESTIONS,
  ...KRIZ_QUESTIONS,
  ...MAAS_QUESTIONS,
];

export type InterviewConfig = {
  companyId: CompanyId;
  type: InterviewType;
  /** Yalnızca teknik mülakatta anlamlı. */
  department?: DepartmentId;
};

/** Genel sorunun bu sektörde sorulabilir olup olmadığı. */
function fitsSector(question: Question, sectorId: SectorId | undefined): boolean {
  return !question.sectorId || question.sectorId === sectorId;
}

/** Bir departmanın teknik havuzu — alan testi ve soru bankası bunu kullanır. */
export function technicalPool(department: DepartmentId): Question[] {
  return TECHNICAL_QUESTIONS.filter((q) => q.department === department);
}

/** Verilen yapılandırmaya uyan soruları döndürür; hiç yoksa adım adım geri çekilir. */
export function filterQuestions(config: InterviewConfig): Question[] {
  const sectorId = findCompany(config.companyId)?.sectorId;
  const matchesCompany = (q: Question) => !q.companyIds || q.companyIds.includes(config.companyId);
  // Departman kısıtı yalnızca teknik türde anlamlı; genel, kriz ve maaş
  // havuzları kurumdan/alandan bağımsız, yalnızca sektöre duyarlı.
  const matchesType = (q: Question) =>
    q.type === config.type &&
    (config.type === 'teknik' ? q.department === config.department : fitsSector(q, sectorId));

  const exact = ALL_QUESTIONS.filter((q) => matchesType(q) && matchesCompany(q));
  if (exact.length > 0) return exact;

  // 1. geri çekilme: kuruma özel soru yoksa kurum kısıtını bırak.
  const byDepartment = ALL_QUESTIONS.filter(matchesType);
  if (byDepartment.length > 0) return byDepartment;

  // 2. geri çekilme: departmana da soru yoksa yalnızca türe bak. Katalogda
  // havuzu henüz dolmamış bir departman seçilirse havuz boş dönüp ekran
  // `undefined` sorunun alanlarını okumasın.
  const byType = ALL_QUESTIONS.filter((q) => q.type === config.type && fitsSector(q, sectorId));
  return byType.length > 0 ? byType : GENERAL_QUESTIONS;
}

/** Özelleştirilmiş mülakat için rastgele soru. */
export function pickRandomQuestion(config: InterviewConfig): Question {
  const pool = filterQuestions(config);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Günün mülakatı: seçili sektörün kurumlarından biri ve genel bir soru, gün
 * numarasına göre sabit. Sektör seçilmemişse (`''`) bütün kurumlar.
 */
export function pickDailyInterview(
  sectorId: SectorId | '' = '',
  date: Date = new Date(),
): { companyId: CompanyId; question: Question } {
  const company = pickForDay(companiesForSector(sectorId), date);
  const pool = filterQuestions({ companyId: company.id, type: 'genel' });
  // salt=3 ile kurum seçiminden bağımsız bir dağılım elde ediyoruz.
  return { companyId: company.id, question: pickForDay(pool, date, 3) };
}

/**
 * Günün teknik sorusu: hedef alana göre, gün numarasına göre sabit. Kurum,
 * departmanın sektöründen seçilir.
 *
 * ⚠️ Kurum salt'ı: `pickForDay` salt'ı `salt * 7` olarak uyguluyor; kurum
 * sayısı 7'nin katı olursa her salt aynı kuruma düşer. Bugün sektör başına 5–6
 * kurum var; `salt = 2` günün mülakatından (salt 0) farklı kurum veriyor.
 */
export function pickDailyTechnical(
  department: DepartmentId,
  date: Date = new Date(),
): { companyId: CompanyId; question: Question } {
  const sectorId = findDepartment(department)?.sectorId ?? '';
  const company = pickForDay(companiesForSector(sectorId), date, 2);
  const pool = filterQuestions({ companyId: company.id, type: 'teknik', department });
  return { companyId: company.id, question: pickForDay(pool, date, 11) };
}

/** Günün alan testi: 1 ağır + 2 kısa soru. */
export type FieldTestSet = {
  department: DepartmentId;
  questions: Question[];
};

/**
 * Günün alan testi seti (YAPILACAKLAR_İRTİFA Bölüm 3).
 *
 * Kurallar: aynı gün aynı set; ağır soru sette **her zaman bir tane**; üç soru
 * birbirinden farklı; günün teknik sorusuyla (salt 11) çakışmasın diye ayrı
 * kaydırma. Havuz kurumdan bağımsız, yalnızca departman.
 *
 * Havuz yetersizse (ör. ağır sorusu olmayan yeni bir departman) eksik kalan
 * yer diğer ağırlıktan doldurulur; hiç soru yoksa boş set döner — ekran bunu
 * "bu alanın havuzu hazırlanıyor" diye gösterir, çökmez.
 */
export function pickDailyFieldTest(department: DepartmentId, date: Date = new Date()): FieldTestSet {
  const pool = technicalPool(department);
  const heavy = pool.filter((q) => q.weight === 'agir');
  const short = pool.filter((q) => q.weight !== 'agir');
  const day = dayIndex(date);
  const at = <T,>(list: T[], offset: number) => list[(((day + offset) % list.length) + list.length) % list.length];

  const picked: Question[] = [];
  const take = (q: Question | undefined) => {
    if (q && !picked.some((p) => p.id === q.id)) picked.push(q);
  };

  if (heavy.length > 0) take(at(heavy, 5));
  // İki kısa soru ardışık indekslerden: havuzda en az iki soru varsa farklı
  // oldukları garanti. Gün başına iki adım kayıyor ki dünkü ikinci soru bugün
  // birinci olarak tekrar gelmesin.
  if (short.length > 0) {
    take(at(short, day + 13));
    take(at(short, day + 14));
  }
  // Geri doldurma: set üçe tamamlanana kadar havuzun geri kalanından.
  for (let i = 0; picked.length < 3 && i < pool.length; i += 1) take(at(pool, 17 + i));

  return { department, questions: picked };
}
