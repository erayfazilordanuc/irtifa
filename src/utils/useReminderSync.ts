import React from 'react';
import * as Notifications from 'expo-notifications';

import { useDailyPracticeSettings } from './dailyPracticeSettings';
import { syncReminders, NOTIFICATION_BUDGET, type ReminderPayload } from './dailyNotifications';
import { syncHabitReminders, type HabitReminderPayload } from './habitNotifications';
import { habitStore, incrementHabit } from './habitReminders';
import { syncAlarms } from './alarmNotifications';
import { alarmStore } from './customAlarms';
import { useAppSettings } from './appSettings';

/**
 * Ayarları planlanmış bildirimlerle eşitler.
 * Uygulama açılışında bir kez ve her ayar değişikliğinde çalışır.
 * Saat ayarlarken her dokunuşta yeniden planlamamak için kısa bir gecikme uygulanır.
 *
 * Günlük pratik önce eşitleniyor, aralıklı hatırlatıcılar (`habitNotifications.ts`)
 * ondan **arta kalan** bütçeyle sonra kuruluyor — Bölüm 4'teki bütçe aşımı hatası
 * bu yüzden ortak bir sıra ile çözüldü (`YAPILACAKLAR.md` → "Bulunan hata").
 */
export function useReminderSync(delayMs = 500): void {
  const { settings } = useDailyPracticeSettings();
  const { reminderFrequency } = useAppSettings();
  // Yalnızca hatırlatıcı AYARLARI izleniyor, günlük sayaçlar değil: `incrementHabit`
  // (bildirime dokunma ya da Bugün kartındaki "+1") depoyu değiştiriyor ama
  // bildirim planını etkilemiyor. Sayaçlara da bağlansaydı her dokunuşta bütün
  // bildirimler iptal edilip yeniden kurulurdu. `habitReminders.ts` sayaçları ayrı
  // alanda tuttuğu için `reminders` referansı yalnızca gerçek ayar değişiminde değişir.
  const habitReminders = habitStore.use().reminders;
  const alarms = alarmStore.use().alarms;

  React.useEffect(() => {
    const id = setTimeout(() => {
      const enabled = settings.notificationsEnabled;

      (async () => {
        // 1) Günlük pratik: ayrılmış payı kullanır.
        const { scheduledCount } = await syncReminders(settings, {
          everyOtherDay: reminderFrequency === 'everyOtherDay',
        });

        // 2) Serbest alarmlar: kullanıcının bilerek kurduğu hatırlatmalar,
        //    bu yüzden aralıklı hatırlatıcılardan ÖNCE yer alıyorlar. Maliyetleri
        //    de küçük (tekrarlayan tetikleyici; alarm başına 1-7 bildirim).
        const alarmResult = await syncAlarms(alarmStore.get(), {
          enabled,
          budget: NOTIFICATION_BUDGET - scheduledCount,
        });

        // 3) Aralıklı hatırlatıcılar: kalan bütçeyi paylaşır, sığmayanı kırpar.
        //    Depodan güncel durum okunuyor: efekt sayaçları izlemediği için
        //    kapanışta yakalanan state bayat olabilir.
        await syncHabitReminders(habitStore.get(), {
          enabled,
          budget: NOTIFICATION_BUDGET - scheduledCount - alarmResult.scheduled,
        });
      })().catch((e) => console.warn('[bildirim] eşitleme başarısız.', e));
    }, delayMs);
    return () => clearTimeout(id);
  }, [settings, reminderFrequency, habitReminders, alarms, delayMs]);
}

/**
 * Bildirime dokunulduğunda ilgili ekrana yönlendirir; aralıklı hatırlatıcı
 * bildirimlerinde ayrıca günlük sayacı artırır (Bölüm 4a — "bildirime
 * dokununca artan sayaç").
 * Çağıran taraf, navigation nesnesini saran bir navigate fonksiyonu geçirir.
 */
export function useReminderNavigation(
  navigate?: (screen: string, params?: Record<string, unknown>) => void,
): void {
  React.useEffect(() => {
    if (!navigate) return;

    const handle = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as
        | Partial<ReminderPayload>
        | Partial<HabitReminderPayload>
        | undefined;

      if (data?.kind === 'habit-reminder') {
        if (data.habitId) incrementHabit(data.habitId);
        // Parametre de taşınıyor: nefes molası bildirimi Diyafram ekranını
        // doğrudan "Pratik" sekmesinde açsın.
        if (data.screen) navigate(data.screen, data.params);
        return;
      }

      if (data?.kind !== 'daily-practice' || !data.screen) return;
      navigate(data.screen);
    };

    // Uygulama bildirime dokunularak açıldıysa son yanıtı da işle.
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) handle(response);
      })
      .catch(() => {
        /* yok sayılabilir */
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(handle);
    return () => subscription.remove();
  }, [navigate]);
}
