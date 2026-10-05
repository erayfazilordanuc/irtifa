// Serbest alarmların planlayıcısı — YAPILACAKLAR Bölüm 4b.
//
// SAF MODÜL: React Native / Expo importu yok. "Hangi alarm hangi tetikleyiciyle
// kurulacak" sorusunu cevaplıyor; gerçek kurulum `alarmNotifications.ts`'te.
//
// NEDEN 4a'DAN FARKLI: Aralıklı hatırlatıcılar tek tek tarihli (`DATE`)
// bildirimler kuruyor, çünkü "09:00-22:00 arası her saat başı" kuralını
// tekrarlayan bir tetikleyici tutamıyor. Serbest alarmda böyle bir aralık yok:
// alarm sabit bir saatte çalıyor ve metni kullanıcının yazdığı sabit etiket.
// İçerik bayatlama sorunu da yok (KARARLAR → "Bildirim planlaması tek yönlü"
// içindeki DAILY sınırı yalnızca günün içeriğinden üretilen metinler için).
// Bu yüzden tekrarlayan tetikleyici kullanılıyor:
//
//   her gün          → 1 adet DAILY  (süresiz tekrar)
//   seçili günler    → gün başına 1 adet WEEKLY
//
// Sonuç: alarm başına en fazla 7, genelde 1 bekleyen bildirim — 4a'daki kayan
// pencereye hiç gerek kalmıyor ve bütçeden çok az yer kaplıyor.

export type AlarmTime = { hour: number; minute: number };

/** Depodaki bir alarm. Şekli `customAlarms` deposuyla ortak. */
export type AlarmPlanInput = {
  id: string;
  label: string;
  enabled: boolean;
  time: AlarmTime;
  /** 0 = Pazar … 6 = Cumartesi. Boş dizi = her gün. */
  days: number[];
};

export type AlarmTrigger =
  | { kind: 'daily'; hour: number; minute: number }
  | { kind: 'weekly'; weekday: number; hour: number; minute: number };

export type PlannedAlarm = {
  /** `irtifa.alarm.<alarm>` ya da gün seçiliyse `irtifa.alarm.<alarm>.<gün>`. */
  identifier: string;
  alarmId: string;
  title: string;
  body: string;
  trigger: AlarmTrigger;
};

export type AlarmPlanResult = {
  planned: PlannedAlarm[];
  /**
   * Bütçeye sığmadığı için **hiç** kurulmayan alarmların kimlikleri.
   * Kısmi kurulum kasıtlı olarak yapılmıyor: haftanın üç günü çalıp iki günü
   * sessiz kalan bir alarm, çalmayan alarmdan daha kötü — kullanıcı ona güvenir.
   */
  skippedForBudget: string[];
};

/** Liste bu sayıyla sınırlı: bütçe öngörülebilir kalsın (7 gün × 10 alarm bile bütçeyi aşmaz). */
export const MAX_ALARMS = 10;

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** Geçerli, yinelenmeyen, sıralı gün listesi. Boş ya da yedi günün hepsi = her gün. */
export function normalizeDays(days: readonly number[]): number[] {
  const valid = [...new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort(
    (a, b) => a - b,
  );
  return valid.length === ALL_DAYS.length ? [] : valid;
}

/** Bir alarmın bütçeden yiyeceği bekleyen bildirim sayısı. */
export function alarmCost(days: readonly number[]): number {
  const normalized = normalizeDays(days);
  return normalized.length === 0 ? 1 : normalized.length;
}

/**
 * Deponun gün kodunu (0 = Pazar) expo-notifications'ın beklediği koda çevirir
 * (1 = Pazar … 7 = Cumartesi).
 */
export function toExpoWeekday(day: number): number {
  return day + 1;
}

/**
 * Açık alarmları tetikleyicilere çevirir; bütçe dolunca kalanları atlar.
 *
 * Alarmlar liste sırasıyla işleniyor: sığan kurulur, sığmayan **tamamen**
 * atlanır ve kimliği `skippedForBudget`'a yazılır — ekranda dürüstçe söylensin.
 */
export function planAlarms(
  alarms: readonly AlarmPlanInput[],
  { budget = 14 }: { budget?: number } = {},
): AlarmPlanResult {
  const planned: PlannedAlarm[] = [];
  const skippedForBudget: string[] = [];
  let remaining = Math.max(0, budget);

  for (const alarm of alarms) {
    if (!alarm.enabled) continue;

    const days = normalizeDays(alarm.days);
    const cost = days.length === 0 ? 1 : days.length;
    if (cost > remaining) {
      skippedForBudget.push(alarm.id);
      continue;
    }

    const hour = clamp(alarm.time?.hour, 0, 23);
    const minute = clamp(alarm.time?.minute, 0, 59);
    const title = alarm.label.trim() || 'Alarm';
    const body = 'Kendine kurduğun hatırlatma.';

    if (days.length === 0) {
      planned.push({
        identifier: `irtifa.alarm.${alarm.id}`,
        alarmId: alarm.id,
        title,
        body,
        trigger: { kind: 'daily', hour, minute },
      });
    } else {
      for (const day of days) {
        planned.push({
          identifier: `irtifa.alarm.${alarm.id}.${day}`,
          alarmId: alarm.id,
          title,
          body,
          trigger: { kind: 'weekly', weekday: toExpoWeekday(day), hour, minute },
        });
      }
    }

    remaining -= cost;
  }

  return { planned, skippedForBudget };
}

function clamp(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}
