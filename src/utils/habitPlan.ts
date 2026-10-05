// Aralıklı hatırlatıcıların planlayıcısı — YAPILACAKLAR Bölüm 4a.
//
// SAF MODÜL: React Native / Expo importu yok, yalnızca tarih hesabı. Gerçek
// planlama (`Notifications.scheduleNotificationAsync`) çağıran tarafta; burası
// "hangi bildirim ne zaman kurulacak" sorusunu cevaplıyor. Böylece kenar
// durumlar (aktif saat aralığı, gün süzgeci, bütçe) Node altında sınanabiliyor.
//
// NEDEN TEK TEK TARİHLER: `TIME_INTERVAL` + `repeats` 7/24 çalıyor, yani
// "09:00-22:00 arası" kuralı kurulamıyor (Bölüm 4 → Teknik kısıt 1). `DAILY`
// tetikleyici de gün süzgecini (yalnız hafta içi) tutamıyor. Bu yüzden aralık,
// önümüzdeki birkaç günün ayrık `DATE` bildirimlerine açılıyor ve uygulama her
// açılışta pencereyi ileri kaydırıyor — gün aşırı modun mevcut deseninin aynısı
// (Teknik kısıt 5).
//
// ⚠️ BÜTÇE: iOS'ta bekleyen bildirim sınırı 64 (Teknik kısıt 2). Sınır aşılırsa
// iOS en eskileri sessizce düşürür; bu yüzden plan bütçeye göre kırpılıyor.

export type HabitSlot = { hour: number; minute: number };

/** Depodaki bir aralıklı hatırlatıcı. Şekli `habitReminders` deposuyla ortak. */
export type HabitReminderPlanInput = {
  id: string;
  enabled: boolean;
  /** Bildirim başlığı (şablon etiketi). */
  title: string;
  /** Bildirim gövdesi. */
  message: string;
  intervalMinutes: number;
  activeHours: { start: number; end: number };
  /** 0 = Pazar … 6 = Cumartesi. Boş dizi = her gün. */
  activeDays: number[];
};

export type PlannedHabitNotification = {
  /** `irtifa.habit.<hatırlatıcı>.<gg>.<sıra>` — kimlik çakışmasın diye tarihli. */
  identifier: string;
  habitId: string;
  title: string;
  body: string;
  /** Tetikleneceği an (yerel saat). */
  at: Date;
};

export type HabitPlanResult = {
  planned: PlannedHabitNotification[];
  /** Bütçe dolduğu için kurulamayan bildirim sayısı — ekranda dürüstçe söylenir. */
  skippedForBudget: number;
};

/** Bir hatırlatıcının bir gün içinde kaç bildirimi olabilir (bütçeyi tek başına yemesin). */
export const MAX_SLOTS_PER_DAY = 12;

/**
 * Aktif saat aralığını slotlara böler. Bitiş saati dahildir; 09:00-22:00 / 60 dk
 * → 09:00, 10:00 … 22:00 (14 slot), `MAX_SLOTS_PER_DAY` ile kırpılır.
 */
export function expandSlots(
  activeHours: { start: number; end: number },
  intervalMinutes: number,
): HabitSlot[] {
  const start = clampHour(activeHours.start);
  const end = clampHour(activeHours.end);
  const step = Math.max(15, Math.floor(intervalMinutes));
  if (end < start) return [];

  const slots: HabitSlot[] = [];
  for (let minutes = start * 60; minutes <= end * 60; minutes += step) {
    if (slots.length >= MAX_SLOTS_PER_DAY) break;
    slots.push({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
  }
  return slots;
}

function clampHour(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(23, Math.floor(value)));
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** "2026-09-13" — kimlikte gün ayırt edici olarak kullanılıyor. */
function dayStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/**
 * Önümüzdeki `days` gün için bildirim planı üretir.
 *
 * - Geçmiş slotlar atlanır (en az `leadSeconds` sonrası planlanır).
 * - `activeDays` boşsa her gün; doluysa yalnızca o günler.
 * - Bütçe, hatırlatıcılar arasında **sırayla** (round-robin) paylaştırılır:
 *   tek bir hatırlatıcı bütün bütçeyi yemesin, hepsinden biraz kurulsun.
 */
export function planHabitNotifications(
  reminders: readonly HabitReminderPlanInput[],
  {
    now = new Date(),
    days = 2,
    budget = 40,
    leadSeconds = 60,
  }: { now?: Date; days?: number; budget?: number; leadSeconds?: number } = {},
): HabitPlanResult {
  const earliest = new Date(now.getTime() + leadSeconds * 1000);

  // Her hatırlatıcı için kendi zaman sırası: önce bugünün kalan slotları.
  const queues: PlannedHabitNotification[][] = [];

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;
    const slots = expandSlots(reminder.activeHours, reminder.intervalMinutes);
    if (slots.length === 0) continue;

    const queue: PlannedHabitNotification[] = [];
    for (let dayOffset = 0; dayOffset < Math.max(1, days); dayOffset += 1) {
      const day = startOfDay(now);
      day.setDate(day.getDate() + dayOffset);
      if (reminder.activeDays.length > 0 && !reminder.activeDays.includes(day.getDay())) continue;

      slots.forEach((slot, index) => {
        const at = new Date(day);
        at.setHours(slot.hour, slot.minute, 0, 0);
        if (at.getTime() < earliest.getTime()) return;
        queue.push({
          identifier: `irtifa.habit.${reminder.id}.${dayStamp(day)}.${index}`,
          habitId: reminder.id,
          title: reminder.title,
          body: reminder.message,
          at,
        });
      });
    }
    if (queue.length > 0) queues.push(queue);
  }

  // Round-robin: sırayla her kuyruktan bir tane al, bütçe dolunca dur.
  const planned: PlannedHabitNotification[] = [];
  const cursors = queues.map(() => 0);
  let remaining = Math.max(0, budget);
  let added = true;

  while (remaining > 0 && added) {
    added = false;
    for (let q = 0; q < queues.length && remaining > 0; q += 1) {
      const cursor = cursors[q];
      if (cursor >= queues[q].length) continue;
      planned.push(queues[q][cursor]);
      cursors[q] = cursor + 1;
      remaining -= 1;
      added = true;
    }
  }

  const total = queues.reduce((sum, queue) => sum + queue.length, 0);
  planned.sort((a, b) => a.at.getTime() - b.at.getTime());

  return { planned, skippedForBudget: Math.max(0, total - planned.length) };
}
