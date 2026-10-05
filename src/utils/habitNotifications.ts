import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { hasNotificationPermission } from './dailyNotifications';
import { findHabitTemplate } from '../data/habitTemplates';
import { planInputs, type HabitState } from './habitReminders';
import { planHabitNotifications } from './habitPlan';

// Aralıklı hatırlatıcıların bildirim tarafı — YAPILACAKLAR Bölüm 4a.
//
// Planlama (`habitPlan.ts`) saf bir modül; burası gerçek
// `Notifications.scheduleNotificationAsync` çağrılarını yapıyor. Günlük
// pratik bildirimlerinden (`dailyNotifications.ts`) kasıtlı olarak ayrı bir
// Android kanalı kullanıyor ki kullanıcı yalnızca aralıklı hatırlatıcıları
// sessize alabilsin (4b'deki serbest alarm kanalı da ileride ayrı gelecek).

export const HABIT_CHANNEL_ID = 'habit-reminders';

/** Bildirime dokunulduğunda hangi ekrana gidileceğini `useReminderNavigation` bu veriden okur. */
export type HabitReminderPayload = {
  kind: 'habit-reminder';
  habitId: string;
  screen?: string;
  params?: Record<string, unknown>;
};

export async function ensureHabitChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(HABIT_CHANNEL_ID, {
    name: 'Aralıklı Hatırlatıcılar',
    importance: Notifications.AndroidImportance.DEFAULT,
    description: 'Su içme, göz molası gibi gün içi tekrarlanan hatırlatmalar',
    lightColor: '#3DB1FF',
    enableVibrate: true,
    vibrationPattern: [0, 180, 120, 180],
    showBadge: false,
  });
}

/**
 * Planlanmış aralıklı hatırlatıcıların hepsini kaldırır. `cancelAllReminders`
 * (`dailyNotifications.ts`) yalnızca `kind === 'daily-practice'` olanlara
 * dokunuyor; bu ikisi birbirinin bildirimini silmiyor.
 */
export async function cancelHabitReminders(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((request) => {
        const data = request.content.data as Partial<HabitReminderPayload> | undefined;
        return data?.kind === 'habit-reminder';
      })
      .map((request) =>
        Notifications.cancelScheduledNotificationAsync(request.identifier).catch(() => {
          /* aradaki tetiklenmelerde kayıt düşmüş olabilir */
        }),
      ),
  );
}

export type SyncHabitRemindersResult = {
  scheduled: number;
  skippedForBudget: number;
};

/**
 * Aralıklı hatırlatıcı ayarlarını planlanmış bildirimlere uygular.
 * @param enabled Ana bildirim şalteri (`dailyPracticeSettings.notificationsEnabled`).
 *   Kapalıysa yalnızca eskiler iptal edilir, yeni bildirim kurulmaz.
 * @param budget Bu çağrıda kurulabilecek en fazla bildirim (günlük pratikten arta kalan pay).
 */
export async function syncHabitReminders(
  state: HabitState,
  { enabled, budget }: { enabled: boolean; budget: number },
): Promise<SyncHabitRemindersResult> {
  await cancelHabitReminders();

  if (!enabled) return { scheduled: 0, skippedForBudget: 0 };
  if (!(await hasNotificationPermission())) return { scheduled: 0, skippedForBudget: 0 };

  const inputs = planInputs(state);
  if (inputs.length === 0) return { scheduled: 0, skippedForBudget: 0 };

  await ensureHabitChannel();

  const { planned, skippedForBudget } = planHabitNotifications(inputs, {
    budget: Math.max(0, budget),
    days: 2,
  });

  const channel = Platform.OS === 'android' ? { channelId: HABIT_CHANNEL_ID } : {};
  let scheduled = 0;

  for (const item of planned) {
    const template = findHabitTemplate(item.habitId);
    const data: HabitReminderPayload = {
      kind: 'habit-reminder',
      habitId: item.habitId,
      screen: template?.screen,
      params: template?.params,
    };

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: {
          title: item.title,
          body: item.body,
          sound: 'default',
          data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.at,
          ...channel,
        },
      });
      scheduled += 1;
    } catch (e) {
      // Tek bir bildirim kurulamasa da geri kalanlar denenmeye devam etsin.
      console.warn(`[bildirim] aralıklı hatırlatıcı "${item.identifier}" planlanamadı.`, e);
    }
  }

  return { scheduled, skippedForBudget };
}
