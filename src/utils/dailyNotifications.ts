import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import type { DailyPracticeSettings } from './dailyPracticeSettings';
import { reminderActive } from './dailyPracticeSettings';
import { pickDailyDrill } from '../data/dictionDrills';
import { getBreathingProgram } from '../data/breathingPrograms';

// Bildirim planlaması tek yönlü: ayarlar kaynak, planlanmış bildirimler türev.
// syncReminders() her ayar değişikliğinde çağrılır; kendi bildirimlerimizi silip yeniden kurar.

export const ANDROID_CHANNEL_ID = 'daily-practice';

/**
 * iOS'ta bekleyen bildirim sınırı 64 (Bölüm 4 → Teknik kısıt 2). Sınır aşılırsa
 * iOS **en eski bildirimleri sessizce düşürür** — bazı hatırlatmalar hiç gelmez.
 * 64 değil 56 seçildi: "Test bildirimi gönder" düğmesi ve ileride eklenecek
 * modüller/alarmlar için kenar payı bırakıyoruz. Bu bütçe günlük pratik ve
 * aralıklı hatırlatıcılar (`habitNotifications.ts`) arasında paylaşılıyor.
 */
export const NOTIFICATION_BUDGET = 56;

/** Kendi bildirimlerimizi ayırt etmek için sabit kimlikler. */
const IDENTIFIERS = {
  diaphragm: 'irtifa.daily.diaphragm',
  speech: 'irtifa.daily.speech',
} as const;

export type ReminderModule = keyof typeof IDENTIFIERS;

/** Bildirime dokunulduğunda hangi ekrana gidileceğini App.tsx tarafı bu veriden okur. */
export type ReminderPayload = {
  kind: 'daily-practice';
  module: ReminderModule;
  screen: 'DiaphragmExercise' | 'SpeechExercise';
};

const SCREEN_FOR_MODULE: Record<ReminderModule, ReminderPayload['screen']> = {
  diaphragm: 'DiaphragmExercise',
  speech: 'SpeechExercise',
};

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Günlük Pratik',
    importance: Notifications.AndroidImportance.DEFAULT,
    description: 'Diyafram ve konuşma egzersizi hatırlatmaları',
    lightColor: '#3DB1FF',
    enableVibrate: true,
    vibrationPattern: [0, 180, 120, 180],
    showBadge: false,
  });
}

export type PermissionResult = 'granted' | 'denied' | 'unsupported';

/**
 * Bildirim izni ister. Simülatör/emülatörde push desteklenmediği için "unsupported" döner —
 * çağıran taraf kullanıcıya bunu ayrı bir mesajla göstermeli.
 */
export async function requestNotificationPermission(): Promise<PermissionResult> {
  if (!Device.isDevice) return 'unsupported';

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    await ensureAndroidChannel();
    return 'granted';
  }
  if (!current.canAskAgain) return 'denied';

  const next = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  if (!next.granted) return 'denied';

  await ensureAndroidChannel();
  return 'granted';
}

export async function hasNotificationPermission(): Promise<boolean> {
  const status = await Notifications.getPermissionsAsync();
  return status.granted;
}

/** O gün için içeriğe özel, tekrar etmeyen bildirim metni üretir. */
function buildContent(
  module: ReminderModule,
  settings: DailyPracticeSettings,
): Notifications.NotificationContentInput {
  // Android kanalı içerikte değil trigger'da belirtilir; buradaki alanlar tüm modüller için ortak.
  const shared = {
    sound: 'default' as const,
    data: {
      kind: 'daily-practice',
      module,
      screen: SCREEN_FOR_MODULE[module],
    } satisfies ReminderPayload,
  };

  switch (module) {
    case 'diaphragm': {
      const program = getBreathingProgram(settings.diaphragm.mode, settings.diaphragm.level);
      return {
        ...shared,
        title: 'Diyafram nefesi zamanı',
        body: `${program.title} · ${program.durationLabel}. Omuzlar sabit, karın çalışıyor.`,
      };
    }
    case 'speech': {
      const drill = pickDailyDrill(settings.speech);
      return {
        ...shared,
        title: 'Konuşma egzersizi',
        body: `Bugünün odağı: ${drill.title}. 5 dakikada sesini aç.`,
      };
    }
  }
}

/**
 * Planlanmış bildirimlerimizin hepsini kaldırır (kullanıcının başka bildirimlerine dokunmaz).
 * Sabit kimlikler yerine içerikteki `kind` alanına bakıyoruz: gün aşırı modda tek bir modül
 * için birden çok kayıt planlandığından kimlik listesi tek başına yetmez.
 */
export async function cancelAllReminders(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((request) => {
        const data = request.content.data as Partial<ReminderPayload> | undefined;
        return data?.kind === 'daily-practice';
      })
      .map((request) =>
        Notifications.cancelScheduledNotificationAsync(request.identifier).catch(() => {
          /* aradaki tetiklenmelerde kayıt düşmüş olabilir */
        }),
      ),
  );
}

/** Gün aşırı modda modül başına kurulabilecek **en fazla** tekrar — uygulama her açılışta yeniden planladığı için pencere kayar. */
const ALTERNATING_OCCURRENCES = 14;

/**
 * Günlük pratiğe ayrılan pay: bütçenin yarısı. Kalanı aralıklı hatırlatıcılara
 * kalır (`useReminderSync`), ama aralıklı hatırlatıcı yoksa bu pay boşa gider —
 * kabul edilebilir, çünkü günlük pratik zaten bu payı aşmıyor (bkz. altta).
 */
const DAILY_PRACTICE_RESERVE = Math.floor(NOTIFICATION_BUDGET / 2);

/** Verilen saatteki bir sonraki oluşumu döndürür (bugün geçtiyse yarın). */
function nextOccurrence(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date;
}

export type SyncRemindersResult = {
  /** Bildirimi kurulan modüllerin listesi. */
  modules: ReminderModule[];
  /** Toplam kurulan bildirim sayısı (gün aşırı modda modül başına birden çok). */
  scheduledCount: number;
};

/**
 * Ayarları planlanmış bildirimlere uygular.
 * @param everyOtherDay Hatırlatmalar her gün yerine gün aşırı gönderilir.
 * @returns Kurulan modüller ve toplam bildirim sayısı. İzin yoksa boş/0 döner.
 */
export async function syncReminders(
  settings: DailyPracticeSettings,
  { everyOtherDay = false }: { everyOtherDay?: boolean } = {},
): Promise<SyncRemindersResult> {
  await cancelAllReminders();

  if (!settings.notificationsEnabled) return { modules: [], scheduledCount: 0 };
  if (!(await hasNotificationPermission())) return { modules: [], scheduledCount: 0 };

  await ensureAndroidChannel();

  const modules: ReminderModule[] = ['diaphragm', 'speech'];
  const activeModules = modules.filter((module) => reminderActive(settings, module));
  const scheduled: ReminderModule[] = [];
  let scheduledCount = 0;
  const channel = Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {};

  // ⚠️ Düzeltilen hata: eskiden gün aşırı modda modül başına sabit
  // ALTERNATING_OCCURRENCES (14) bildirim kuruluyordu — 5 modül varken 70 bekleyen
  // bildirim demekti ve iOS'un 64 sınırını (Teknik kısıt 2) şimdiden aşıyordu. Artık
  // modül başına düşen oluşum sayısı açık modül sayısına bölünerek hesaplanıyor,
  // böylece toplam gün aşırı planı `DAILY_PRACTICE_RESERVE`'i aşmıyor.
  const perModuleOccurrences = everyOtherDay
    ? Math.max(
        2,
        Math.min(ALTERNATING_OCCURRENCES, Math.floor(DAILY_PRACTICE_RESERVE / Math.max(1, activeModules.length))),
      )
    : 1;

  for (const module of activeModules) {
    const { time } = settings[module];
    const content = buildContent(module, settings);

    try {
      if (everyOtherDay) {
        // Tekrarlayan tetikleyici yalnızca günlük çalıştığı için gün aşırı planı
        // tek seferlik tarihlerle kuruyoruz.
        const first = nextOccurrence(time.hour, time.minute);
        for (let i = 0; i < perModuleOccurrences; i += 1) {
          const date = new Date(first);
          date.setDate(date.getDate() + i * 2);
          await Notifications.scheduleNotificationAsync({
            identifier: `${IDENTIFIERS[module]}.${i}`,
            content,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date,
              ...channel,
            },
          });
          scheduledCount += 1;
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          identifier: IDENTIFIERS[module],
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
            ...channel,
          },
        });
        scheduledCount += 1;
      }
      scheduled.push(module);
    } catch (e) {
      console.warn(`[bildirim] "${module}" planlanamadı.`, e);
    }
  }

  return { modules: scheduled, scheduledCount };
}

/** Ayar ekranındaki "Test bildirimi gönder" düğmesi için. */
export async function sendTestReminder(
  settings: DailyPracticeSettings,
  module: ReminderModule = 'diaphragm',
): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: buildContent(module, settings),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
  });
}

/** Hata ayıklama / ayar ekranında "kurulu hatırlatmalar" göstermek için. */
export async function listOurReminders(): Promise<
  { module: ReminderModule; hour: number; minute: number }[]
> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const ours: { module: ReminderModule; hour: number; minute: number }[] = [];
  for (const req of all) {
    const data = req.content.data as Partial<ReminderPayload> | undefined;
    if (data?.kind !== 'daily-practice' || !data.module) continue;
    const trigger = req.trigger as { hour?: number; minute?: number } | null;
    ours.push({
      module: data.module,
      hour: trigger?.hour ?? 0,
      minute: trigger?.minute ?? 0,
    });
  }
  return ours;
}
