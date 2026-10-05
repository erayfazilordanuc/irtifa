import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { hasNotificationPermission } from './dailyNotifications';
import { alarmPlanInputs, type AlarmState } from './customAlarms';
import { planAlarms } from './alarmPlan';

// Serbest alarmların bildirim tarafı — YAPILACAKLAR Bölüm 4b.
//
// Ayrı Android kanalı: kullanıcı yalnızca kendi alarmlarını sessize alabilsin
// (ya da tersine, günlük pratiği susturup alarmları açık bıraksın). Üç kanal
// artık birbirinden bağımsız: daily-practice, habit-reminders, personal-reminders.
//
// Önem derecesi bilerek HIGH: bunlar kullanıcının kendi kurduğu, kaçırılmaması
// gereken hatırlatmalar (ilaç, uyanış). Günlük pratik ve aralıklı hatırlatıcılar
// DEFAULT'ta kalıyor — onlar ambiyans, bu değil.

export const ALARM_CHANNEL_ID = 'personal-reminders';

export type AlarmPayload = {
  kind: 'personal-reminder';
  alarmId: string;
};

export async function ensureAlarmChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Alarmlar',
    importance: Notifications.AndroidImportance.HIGH,
    description: 'Kendi kurduğun alarmlar ve kişisel hatırlatmalar',
    lightColor: '#3DB1FF',
    enableVibrate: true,
    vibrationPattern: [0, 250, 150, 250],
    showBadge: false,
  });
}

/**
 * Yalnızca alarm bildirimlerini kaldırır. Günlük pratik (`daily-practice`) ve
 * aralıklı hatırlatıcılar (`habit-reminder`) kendi `kind` değerlerine bakıyor;
 * üçü birbirinin bildirimini silmiyor.
 */
export async function cancelAlarms(): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((request) => {
        const data = request.content.data as Partial<AlarmPayload> | undefined;
        return data?.kind === 'personal-reminder';
      })
      .map((request) =>
        Notifications.cancelScheduledNotificationAsync(request.identifier).catch(() => {
          /* aradaki tetiklenmelerde kayıt düşmüş olabilir */
        }),
      ),
  );
}

export type SyncAlarmsResult = {
  scheduled: number;
  /** Bütçeye sığmadığı için hiç kurulmayan alarmların kimlikleri. */
  skippedForBudget: string[];
};

/**
 * Alarm ayarlarını planlanmış bildirimlere uygular.
 * @param enabled Ana bildirim şalteri. Kapalıysa yalnızca eskiler iptal edilir.
 * @param budget Bu çağrıda kurulabilecek en fazla bildirim (günlük pratikten arta kalan pay).
 */
export async function syncAlarms(
  state: AlarmState,
  { enabled, budget }: { enabled: boolean; budget: number },
): Promise<SyncAlarmsResult> {
  await cancelAlarms();

  if (!enabled) return { scheduled: 0, skippedForBudget: [] };
  if (!(await hasNotificationPermission())) return { scheduled: 0, skippedForBudget: [] };

  const inputs = alarmPlanInputs(state);
  if (inputs.length === 0) return { scheduled: 0, skippedForBudget: [] };

  await ensureAlarmChannel();

  const { planned, skippedForBudget } = planAlarms(inputs, { budget: Math.max(0, budget) });

  const channel = Platform.OS === 'android' ? { channelId: ALARM_CHANNEL_ID } : {};
  let scheduled = 0;

  for (const item of planned) {
    const data: AlarmPayload = { kind: 'personal-reminder', alarmId: item.alarmId };
    const trigger: Notifications.NotificationTriggerInput =
      item.trigger.kind === 'daily'
        ? {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: item.trigger.hour,
            minute: item.trigger.minute,
            ...channel,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: item.trigger.weekday,
            hour: item.trigger.hour,
            minute: item.trigger.minute,
            ...channel,
          };

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: { title: item.title, body: item.body, sound: 'default', data },
        trigger,
      });
      scheduled += 1;
    } catch (e) {
      // Tek bir alarm kurulamasa da kalanlar denenmeye devam etsin.
      console.warn(`[bildirim] alarm "${item.identifier}" planlanamadı.`, e);
    }
  }

  return { scheduled, skippedForBudget };
}
