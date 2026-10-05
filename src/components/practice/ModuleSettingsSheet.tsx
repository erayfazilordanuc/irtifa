import React from 'react';
import { View, Alert, Platform } from 'react-native';
import { Bell, BellOff, Wind, Mic } from 'lucide-react-native';

import { Toggle, type Tone } from '../AppUI';
import { BottomSheet, Card, SettingRow, TimeStepper, useThemeTokens } from './PracticeUI';
import { useDailyPracticeSettings, type DailyModuleKey } from '../../utils/dailyPracticeSettings';
import { useAppSettings, updateAppSettings } from '../../utils/appSettings';
import {
  hasNotificationPermission,
  requestNotificationPermission,
} from '../../utils/dailyNotifications';

// Modül ayar paneli ve Hatırlatıcılar ekranının paylaştığı parçalar.
// Tek kural eskisiyle aynı: bir modül kapalıysa ne kartı görünür ne bildirimi kurulur;
// ana bildirim şalteri kapalıysa hiçbir modül bildirim kurmaz.

export type ModuleKey = DailyModuleKey;

export const MODULE_META: Record<
  ModuleKey,
  { title: string; icon: React.ComponentType<{ size?: number; color?: string }>; tone: Tone; offDescription: string }
> = {
  // Kapalı modülün nerede gizlendiği modüle göre değişiyor: ikisi de günlük
  // listeden kalkıyor, Atölye'de ise yalnızca kendi istasyonu olanlar
  // (DailyPracticeCard ve WorkshopScreen filtreleri).
  diaphragm: {
    title: 'Diyafram Egzersizi',
    icon: Wind,
    tone: 'blue',
    offDescription:
      "Kapalıyken günlük listede ve Atölye'deki Mülakat Nefesi istasyonunda görünmez, hatırlatması kurulmaz.",
  },
  speech: {
    title: 'Konuşma Egzersizi',
    icon: Mic,
    tone: 'violet',
    offDescription: "Kapalıyken günlük listede ve Atölye'de görünmez, hatırlatması kurulmaz.",
  },
};

/** İzin durumunu okur; yalnızca bilgi amaçlı, izni değiştirmez. */
export function useNotificationPermissionState(): boolean | null {
  const [permission, setPermission] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    hasNotificationPermission()
      .then(setPermission)
      .catch(() => setPermission(false));
  }, []);
  return permission;
}

/**
 * İzin iste → reddedilirse (mevcut) Alert göster → verilirse ana bildirim
 * şalterini açar ve sıklık 'off' ise 'daily' yapar. `NotificationsMainToggle`
 * ve oryantasyon akışının hatırlatma adımı bu tek kancayı paylaşır — metinler
 * ve davranış tek yerde.
 */
export function useEnableNotifications(): () => Promise<boolean> {
  const { setSetting } = useDailyPracticeSettings();
  const appSettings = useAppSettings();

  return React.useCallback(async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      setSetting('notificationsEnabled', true);
      if (appSettings.reminderFrequency === 'off') {
        updateAppSettings({ reminderFrequency: 'daily' });
      }
      return true;
    }

    Alert.alert(
      result === 'unsupported' ? 'Bu cihazda desteklenmiyor' : 'Bildirim izni verilmedi',
      result === 'unsupported'
        ? 'Bildirimler simülatör/emülatörde çalışmaz. Gerçek bir cihazda deneyin.'
        : Platform.OS === 'ios'
          ? 'Ayarlar → Bildirimler üzerinden İrtifa için bildirimlere izin verin.'
          : 'Uygulama bilgileri → Bildirimler üzerinden izin verin.',
    );
    return false;
  }, [setSetting, appSettings.reminderFrequency]);
}

/**
 * Ana bildirim şalteri. Panel ve Hatırlatıcılar ekranı arasında paylaşılır.
 * Açılırken izin ister (reddedilirse mevcut Alert metinleri gösterilir); ayrıca
 * `reminderFrequency` (Ayarlar → Uygulama Tercihleri) ile tutarlı kalır: şalter
 * açılınca sıklık 'off' ise 'daily' yapılır, kapatılınca sıklık da 'off' olur.
 */
export function NotificationsMainToggle() {
  const t = useThemeTokens();
  const { settings, setSetting } = useDailyPracticeSettings();
  // İlk değer cihazdan okunur; izin isteğinin sonucu onu ezer.
  const initialPermission = useNotificationPermissionState();
  const [requested, setPermission] = React.useState<boolean | null>(null);
  const permission = requested ?? initialPermission;
  const enableNotifications = useEnableNotifications();

  const toggle = async (next: boolean) => {
    if (!next) {
      setSetting('notificationsEnabled', false);
      updateAppSettings({ reminderFrequency: 'off' });
      return;
    }

    const granted = await enableNotifications();
    setPermission(granted);
  };

  return (
    <SettingRow
      title="Bildirimler"
      description={
        permission === false && settings.notificationsEnabled
          ? 'İzin verilmedi — hatırlatmalar kurulmayacak.'
          : 'Kapalıyken hiçbir modül hatırlatma göndermez.'
      }
      right={
        <View className="flex-row items-center">
          {settings.notificationsEnabled ? (
            <Bell size={16} color={t.isLight ? '#2563eb' : '#60a5fa'} />
          ) : (
            <BellOff size={16} color={t.iconColor} />
          )}
          <Toggle value={settings.notificationsEnabled} onValueChange={toggle} style={{ marginLeft: 8 }} />
        </View>
      }
    />
  );
}

/**
 * Bir modülün "günlük hatırlatma" + "saat" satırları. Modül ayar panelinde ve
 * Hatırlatıcılar ekranındaki modül listesinde aynı şekilde kullanılır.
 */
export function ModuleReminderControls({
  module,
  notificationsOff,
  moduleOffHint,
}: {
  module: ModuleKey;
  notificationsOff: boolean;
  /** Modül kapalıyken gösterilecek yönlendirme metni; verilmezse sade "Modül kapalı." yazar. */
  moduleOffHint?: string;
}) {
  const t = useThemeTokens();
  const { settings, updateModule } = useDailyPracticeSettings();
  const config = settings[module];
  const moduleOff = !config.enabled;
  const disabled = notificationsOff || moduleOff;

  return (
    <>
      <View className={`border-t ${t.dividerColor}`}>
        <SettingRow
          title="Günlük hatırlatma"
          description={
            notificationsOff
              ? 'Ana bildirim şalteri kapalı.'
              : moduleOff
                ? (moduleOffHint ?? 'Modül kapalı.')
                : 'Seçilen saatte bir bildirim gönderilir.'
          }
          disabled={disabled}
          right={
            <Toggle
              value={config.reminder && config.enabled && !notificationsOff}
              disabled={disabled}
              onValueChange={(v) => updateModule(module, { reminder: v } as any)}
            />
          }
        />
      </View>
      <View className={`border-t ${t.dividerColor}`}>
        <SettingRow
          title="Saat"
          description="Bildirimin gönderileceği saat."
          disabled={disabled || !config.reminder}
          right={
            <TimeStepper
              hour={config.time.hour}
              minute={config.time.minute}
              disabled={disabled || !config.reminder}
              onChange={(time) => updateModule(module, { time } as any)}
            />
          }
        />
      </View>
    </>
  );
}

/**
 * Modül ekranının sağ üst çark düğmesiyle açılan panel: açık/kapalı, günlük
 * hatırlatma, saat ve (varsa) modüle özel tercihler. Ana bildirim şalteri
 * kapalıyken hatırlatma kontrolleri pasif görünür ve aynı panelden açılabilir.
 */
export function ModuleSettingsSheet({
  module,
  visible,
  onClose,
  children,
}: {
  module: ModuleKey;
  visible: boolean;
  onClose: () => void;
  /** Modüle özel tercihler (ör. çalışma biçimi, kaynak çipleri). */
  children?: React.ReactNode;
}) {
  const { settings, updateModule } = useDailyPracticeSettings();
  const config = settings[module];
  const meta = MODULE_META[module];
  const notificationsOff = !settings.notificationsEnabled;

  // Modül adı panel başlığında; içeride tekrar edilmiyor.
  return (
    <BottomSheet visible={visible} title={meta.title} subtitle="Modül ayarları" onClose={onClose}>
      <Card className="mt-3">
        <SettingRow
          title="Açık"
          description={meta.offDescription}
          right={
            <Toggle
              value={config.enabled}
              onValueChange={(v) => updateModule(module, { enabled: v } as any)}
            />
          }
        />
        <ModuleReminderControls module={module} notificationsOff={notificationsOff} />
      </Card>

      {notificationsOff ? (
        <Card className="mt-3">
          <NotificationsMainToggle />
        </Card>
      ) : null}

      {children ? <View className="mt-3">{children}</View> : null}
    </BottomSheet>
  );
}
