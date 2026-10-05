import React from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  Bell,
  Send,
  Monitor,
  Sun,
  Moon,
  Sparkles,
  AlarmClock,
  ChevronRight,
  Compass,
  Clock,
} from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  Segmented,
  ActionButton,
  Toggle,
  Badge,
  toneColor,
  toneSoft,
  useThemeTokens,
} from '../components/AppUI';
import { Chip } from '../components/practice/PracticeUI';
import { useDailyPracticeSettings } from '../utils/dailyPracticeSettings';
import { useAppTheme, type ThemeMode } from '../utils/ThemeContext';
import { updateAppSettings, useAppSettings, type ReminderFrequency } from '../utils/appSettings';
import { useApiKey, maskApiKey } from '../utils/aiCredentials';
import { useAiAvailable } from '../utils/aiAvailability';
import { requestNotificationPermission, sendTestReminder } from '../utils/dailyNotifications';
import { resetOnboarding, updateOnboarding, useOnboarding, type DailyMinutes } from '../utils/onboarding';
import { storageBackend } from '../utils/db';

const STORAGE_BACKEND_LABEL: Record<ReturnType<typeof storageBackend>, string> = {
  sqlite: 'SQLite',
  file: 'Dosya (yedek yol)',
  web: 'Tarayıcı',
};

// Ayarlar ekranı: yapay zekâ durumu, hatırlatıcılar, dinî içerik, tema ve günlük pratik modülleri.
// Yapay zekâ kurulumunun kendisi `AiSetupScreen`'de.

export default function SettingsScreen({ navigation }: any) {
  const t = useThemeTokens();
  const appSettings = useAppSettings();
  const { settings, setSetting } = useDailyPracticeSettings();
  const { mode, setMode } = useAppTheme();
  const onboarding = useOnboarding();

  const apiKey = useApiKey();
  const aiOn = useAiAvailable();

  /** Sıklık değişimi hem uygulama ayarını hem ana bildirim şalterini günceller. */
  const changeFrequency = async (next: ReminderFrequency) => {
    if (next === 'off') {
      updateAppSettings({ reminderFrequency: next });
      setSetting('notificationsEnabled', false);
      return;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      Alert.alert(
        permission === 'unsupported' ? 'Bu cihazda desteklenmiyor' : 'Bildirim izni verilmedi',
        permission === 'unsupported'
          ? 'Bildirimler simülatör/emülatörde çalışmaz. Gerçek bir cihazda deneyin.'
          : Platform.OS === 'ios'
            ? 'Ayarlar → Bildirimler üzerinden İrtifa için bildirimlere izin verin.'
            : 'Uygulama bilgileri → Bildirimler üzerinden izin verin.',
      );
      return;
    }

    updateAppSettings({ reminderFrequency: next });
    setSetting('notificationsEnabled', true);
  };

  const frequency: ReminderFrequency = settings.notificationsEnabled
    ? appSettings.reminderFrequency === 'off'
      ? 'daily'
      : appSettings.reminderFrequency
    : 'off';

  return (
    <AppScreen header={<AppHeader title="Ayarlar" onBack={() => navigation.goBack()} />}>
      {/* ——— Yapay zekâ ———
          Eskiden burada doğrudan "Backend API Adresi" alanları duruyordu ve
          yapay zekâ yalnızca kendi sunucusunu çalıştıranlarda açılıyordu.
          Kurulum artık kendi ekranında (KARARLAR → BYOK); burası yalnızca
          durumu gösterip oraya götürüyor. */}
      <SectionLabel>Yapay Zekâ</SectionLabel>
      <Surface>
        <Pressable
          onPress={() => navigation.navigate('AiSetup')}
          accessibilityRole="button"
          accessibilityLabel={`Yapay zekâ değerlendirmesi, ${aiOn ? 'açık' : 'kapalı'}. Kurulumu açmak için dokun.`}
          className="flex-row items-center"
        >
          <View
            className={`w-9 h-9 rounded-2xl items-center justify-center ${toneSoft(aiOn ? 'emerald' : 'slate', t.isLight)}`}
          >
            <Sparkles size={16} color={toneColor(aiOn ? 'emerald' : 'slate', t.isLight)} />
          </View>
          <View className="flex-1 ml-3 pr-2">
            <Text className={`text-[13px] font-bold ${t.title}`}>Yapay Zekâ Değerlendirmesi</Text>
            <Text className={`text-[11px] mt-0.5 leading-4 ${t.muted}`}>
              {aiOn
                ? 'Kendi anahtarınla çalışıyor. Değiştirmek için dokun.'
                : 'Ücretsiz bir Google anahtarıyla birkaç adımda aç.'}
            </Text>
          </View>
          <Badge label={aiOn ? 'Açık' : 'Kapalı'} tone={aiOn ? 'emerald' : 'slate'} />
          <View className="ml-1">
            <ChevronRight size={16} color={t.iconColor} />
          </View>
        </Pressable>
      </Surface>

      {/* ——— Uygulama tercihleri ——— */}
      <SectionLabel>Uygulama Tercihleri</SectionLabel>
      <Surface>
        <View className="flex-row items-center mb-3">
          <Bell size={16} color={toneColor('blue', t.isLight)} />
          <Text className={`text-[13px] font-bold ml-2 ${t.title}`}>Hatırlatıcı Bildirimleri</Text>
        </View>

        <Segmented<ReminderFrequency>
          value={frequency}
          onChange={changeFrequency}
          options={[
            { value: 'off', label: 'Kapalı' },
            { value: 'daily', label: 'Her Gün' },
            { value: 'everyOtherDay', label: '2 Günde 1' },
          ]}
        />

        <View className="mt-3">
          <ActionButton
            label="Bildirimi Test Et (3 Saniye)"
            variant="soft"
            disabled={frequency === 'off'}
            labelSize={12}
            icon={<Send size={15} color={toneColor('blue', t.isLight)} />}
            onPress={() => {
              sendTestReminder(settings).catch(() =>
                Alert.alert(
                  'Bildirim gönderilemedi',
                  'İzinleri ve cihaz ayarlarını kontrol edin.',
                ),
              );
            }}
          />
        </View>


        {/* Günlük hedef süresi — Atölye sekmesindeki pratik listesinin uzunluğunu
            belirler. Aynı ayar Profil → "Hedef ve tercihler"nde de değiştirilebiliyor;
            ikisi de aynı depoyu (onboarding) kullanıyor. */}
        <View className={`pt-3 mt-3 border-t ${t.dividerColor}`}>
          <View className="flex-row items-center mb-2">
            <Clock size={16} color={t.iconColor} />
            <Text className={`text-[13px] font-bold ml-2 ${t.title}`}>Günlük Hedef Süresi</Text>
          </View>
          <View className="flex-row flex-wrap">
            {([3, 5, 10] as DailyMinutes[]).map((minutes) => (
              <Chip
                key={minutes}
                label={`${minutes} dk`}
                selected={onboarding.dailyMinutes === minutes}
                tone="emerald"
                onPress={() => updateOnboarding({ dailyMinutes: minutes })}
              />
            ))}
          </View>
          <Text className={`text-[11px] leading-5 mt-1 ${t.muted}`}>
            Atölye sekmesindeki günlük pratik listesinin uzunluğunu belirler; egzersizlerin
            kendisi kısalmaz.
          </Text>
        </View>

        {/* Tema */}
        <View className={`pt-3 border-t ${t.dividerColor}`}>
          <View className="flex-row items-center mb-3">
            <Monitor size={16} color={t.iconColor} />
            <Text className={`text-[13px] font-bold ml-2 ${t.title}`}>Tema Tercihi</Text>
          </View>
          <Segmented<ThemeMode>
            value={mode}
            onChange={setMode}
            options={[
              {
                value: 'system',
                label: 'Sistem',
                icon: <Monitor size={14} color={mode === 'system' ? toneColor('blue', t.isLight) : t.iconColor} />,
              },
              {
                value: 'light',
                label: 'Açık',
                icon: <Sun size={14} color={mode === 'light' ? toneColor('blue', t.isLight) : t.iconColor} />,
              },
              {
                value: 'dark',
                label: 'Koyu',
                icon: <Moon size={14} color={mode === 'dark' ? toneColor('blue', t.isLight) : t.iconColor} />,
              },
            ]}
          />
        </View>

        {/* Hatırlatıcılar ve alarmlar */}
        <Pressable
          onPress={() => navigation.navigate('Reminders')}
          accessibilityRole="button"
          accessibilityLabel="Hatırlatıcılar ve alarmlar"
          className={`flex-row items-center py-3 mt-3 border-t ${t.dividerColor}`}
        >
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${toneSoft('blue', t.isLight)}`}
          >
            <AlarmClock size={17} color={toneColor('blue', t.isLight)} />
          </View>
          <View className="flex-1 pr-3">
            <Text className={`text-[13px] font-bold ${t.title}`}>Hatırlatıcılar ve alarmlar</Text>
            <Text className={`text-[11px] mt-0.5 ${t.muted}`}>
              Günlük pratik hatırlatmalarını tek yerden yönet.
            </Text>
          </View>
          <ChevronRight size={18} color={t.iconColor} />
        </Pressable>

        {/* Oryantasyonu yeniden göster */}
        <Pressable
          onPress={() => {
            resetOnboarding();
            navigation.navigate('Onboarding');
          }}
          accessibilityRole="button"
          accessibilityLabel="Oryantasyonu yeniden göster"
          className={`flex-row items-center py-3 mt-3 border-t ${t.dividerColor}`}
        >
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${toneSoft('violet', t.isLight)}`}
          >
            <Compass size={17} color={toneColor('violet', t.isLight)} />
          </View>
          <View className="flex-1 pr-3">
            <Text className={`text-[13px] font-bold ${t.title}`}>Oryantasyonu yeniden göster</Text>
            <Text className={`text-[11px] mt-0.5 ${t.muted}`}>
              Hedef, süre ve hatırlatma seçimlerini baştan yap.
            </Text>
          </View>
          <ChevronRight size={18} color={t.iconColor} />
        </Pressable>
      </Surface>

      {/* ——— Sistem bilgileri ——— */}
      <SectionLabel>Sistem Bilgileri</SectionLabel>
      <Surface>
        <InfoRow label="Uygulama" value={Constants.expoConfig?.name ?? 'İrtifa'} />
        <InfoRow label="Sürüm" value={Constants.expoConfig?.version ?? '1.0.0'} divider />
        <InfoRow label="Platform" value={`${Platform.OS} ${Platform.Version}`} divider />
        <InfoRow
          label="Yapay zekâ"
          value={
            apiKey
              ? `Kendi anahtarın (${maskApiKey(apiKey)})`
              : appSettings.apiBaseUrl || 'Kurulmadı'
          }
          divider
        />
        <InfoRow label="Depolama" value={STORAGE_BACKEND_LABEL[storageBackend()]} divider />
      </Surface>
    </AppScreen>
  );
}

function InfoRow({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  const t = useThemeTokens();
  return (
    <View className={`flex-row items-center py-3 ${divider ? `border-t ${t.dividerColor}` : ''}`}>
      <Text className={`text-[12px] ${t.muted}`}>{label}</Text>
      <Text className={`text-[12px] font-bold ml-auto ${t.title}`} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
