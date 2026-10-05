import React from 'react';
import { View, Text, Pressable, Alert, TextInput } from 'react-native';
import { Send, Plus, Trash2, AlarmClock } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  ActionButton,
  Toggle,
  toneColor,
  toneSoft,
  useThemeTokens,
} from '../components/AppUI';
import { BottomSheet, Chip, TimeStepper } from '../components/practice/PracticeUI';
import {
  MODULE_META,
  ModuleReminderControls,
  NotificationsMainToggle,
  useNotificationPermissionState,
  type ModuleKey,
} from '../components/practice/ModuleSettingsSheet';
import { useDailyPracticeSettings } from '../utils/dailyPracticeSettings';
import { sendTestReminder } from '../utils/dailyNotifications';
import { formatTime } from '../utils/dateUtils';
import { HABIT_TEMPLATES } from '../data/habitTemplates';
import type { HabitTemplate } from '../data/habitTemplates';
import {
  useHabits,
  setHabitEnabled,
  updateHabit,
  resetHabitCount,
  habitCount,
  HABIT_INTERVALS,
} from '../utils/habitReminders';
import type { HabitReminder } from '../utils/habitReminders';
import {
  useAlarms,
  addAlarm,
  updateAlarm,
  removeAlarm,
  setAlarmEnabled,
  ALARM_LABEL_PRESETS,
  type CustomAlarm,
} from '../utils/customAlarms';
import { MAX_ALARMS } from '../utils/alarmPlan';

// Tüm hatırlatıcıları tek yerde toplayan ekran. Atölye sekmesindeki
// "Alışkanlık & Rutin" kartı buraya açılır. Modül açık/kapalı ve modüle özel
// tercihler burada değil — ilgili modül ekranının çark panelinde.

const MODULE_ORDER: ModuleKey[] = ['diaphragm', 'speech'];

/** Gün çipleri Pzt'den başlar; depodaki sayısal kodlama (0=Pazar…6=Cumartesi) korunur. */
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_SHORT: Record<number, string> = {
  0: 'Paz',
  1: 'Pzt',
  2: 'Sal',
  3: 'Çar',
  4: 'Per',
  5: 'Cum',
  6: 'Cmt',
};

function daysSummary(activeDays: number[]): string {
  if (activeDays.length === 0) return 'Her gün';
  const sorted = [...activeDays].sort((a, b) => a - b);
  const weekdays = [1, 2, 3, 4, 5];
  const isWeekdays = sorted.length === weekdays.length && weekdays.every((d, i) => sorted[i] === d);
  if (isWeekdays) return 'Hafta içi';
  return sorted.map((d) => DAY_SHORT[d]).join(', ');
}

function habitSummary(reminder: HabitReminder): string {
  if (!reminder.enabled) return 'Kapalı';
  const hours = `${formatTime(reminder.activeHours.start, 0)}-${formatTime(reminder.activeHours.end, 0)}`;
  return `Her ${reminder.intervalMinutes} dk · ${hours} · ${daysSummary(reminder.activeDays)}`;
}

export default function RemindersScreen({ navigation }: any) {
  const t = useThemeTokens();
  const { settings } = useDailyPracticeSettings();
  const permission = useNotificationPermissionState();
  const notificationsOff = !settings.notificationsEnabled;
  const habits = useHabits();
  const [openHabitId, setOpenHabitId] = React.useState<string | null>(null);
  const { alarms } = useAlarms();
  const [openAlarmId, setOpenAlarmId] = React.useState<string | null>(null);
  // Silinen alarmın paneli kendiliğinden kapanıyor: kimlik listede yoksa
  // `openAlarm` undefined olur ve panel render edilmez.
  const openAlarm = alarms.find((alarm) => alarm.id === openAlarmId);

  return (
    <AppScreen header={<AppHeader title="Hatırlatıcılar" onBack={() => navigation.goBack()} />}>
      <SectionLabel>Bildirimler</SectionLabel>
      <Surface>
        <NotificationsMainToggle />
        <View className={`mt-3 pt-3 border-t ${t.dividerColor}`}>
          <ActionButton
            label="Test bildirimi gönder (3 sn)"
            variant="soft"
            disabled={notificationsOff || permission === false}
            labelSize={12}
            icon={<Send size={15} color={toneColor('blue', t.isLight)} />}
            onPress={() => {
              sendTestReminder(settings).catch(() =>
                Alert.alert('Bildirim gönderilemedi', 'İzinleri ve cihaz ayarlarını kontrol edin.'),
              );
            }}
          />
        </View>
      </Surface>

      <SectionLabel>Günlük Pratik Hatırlatmaları</SectionLabel>
      {MODULE_ORDER.map((module) => (
        <ModuleReminderCard key={module} module={module} notificationsOff={notificationsOff} />
      ))}

      <SectionLabel>Aralıklı Hatırlatıcılar</SectionLabel>
      <Text className={`text-[11px] leading-4 -mt-1 mb-1 ${t.muted}`}>
        Bildirimler yalnızca seçtiğin aktif saat aralığında ve cihazın izin verdiği kadar kurulur.
      </Text>
      {HABIT_TEMPLATES.map((template) => (
        <HabitReminderRow
          key={template.id}
          template={template}
          reminder={habits.reminders[template.id]}
          notificationsOff={notificationsOff}
          onOpen={() => setOpenHabitId(template.id)}
        />
      ))}
      {HABIT_TEMPLATES.map((template) => (
        <HabitSettingsSheet
          key={template.id}
          template={template}
          visible={openHabitId === template.id}
          notificationsOff={notificationsOff}
          onClose={() => setOpenHabitId(null)}
        />
      ))}

      <SectionLabel>Alarmlar</SectionLabel>
      <Text className={`text-[11px] leading-4 -mt-1 mb-1 ${t.muted}`}>
        Kendi saatini ve gününü belirlediğin alarmlar. Uygulama açılmasa da çalarlar.
      </Text>

      {alarms.length === 0 ? (
        <Surface>
          <View className="flex-row items-center mb-2">
            <View
              className={`w-8 h-8 rounded-xl items-center justify-center mr-2 ${toneSoft('amber', t.isLight)}`}
            >
              <AlarmClock size={15} color={toneColor('amber', t.isLight)} />
            </View>
            <Text className={`text-[13px] font-bold flex-1 ${t.title}`}>Henüz alarm yok</Text>
          </View>
          <Text className={`text-[12px] leading-5 ${t.muted}`}>
            Uyanış, ilaç, spor ya da uyku vakti gibi kendi hatırlatmalarını ekleyebilirsin.
          </Text>
        </Surface>
      ) : (
        alarms.map((alarm) => (
          <AlarmRow
            key={alarm.id}
            alarm={alarm}
            notificationsOff={notificationsOff}
            onOpen={() => setOpenAlarmId(alarm.id)}
          />
        ))
      )}

      <View className="mt-3">
        <ActionButton
          label={alarms.length >= MAX_ALARMS ? `En fazla ${MAX_ALARMS} alarm` : 'Alarm ekle'}
          variant="soft"
          labelSize={12}
          disabled={alarms.length >= MAX_ALARMS}
          icon={<Plus size={15} color={toneColor('blue', t.isLight)} />}
          onPress={() => {
            const created = addAlarm();
            // Yeni alarm hemen düzenleme panelinde açılıyor: kullanıcı saatini
            // kurmadan listede "08:00" diye bir satır bırakmayalım.
            if (created) setOpenAlarmId(created.id);
          }}
        />
      </View>

      {openAlarm ? (
        <AlarmSheet
          alarm={openAlarm}
          notificationsOff={notificationsOff}
          onClose={() => setOpenAlarmId(null)}
        />
      ) : null}
    </AppScreen>
  );
}

/** Alarm listesindeki tek satır: saat, etiket, gün özeti ve şalter. */
function AlarmRow({
  alarm,
  notificationsOff,
  onOpen,
}: {
  alarm: CustomAlarm;
  notificationsOff: boolean;
  onOpen: () => void;
}) {
  const t = useThemeTokens();
  const label = alarm.label.trim() || 'Alarm';

  return (
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${label} alarmını düzenle`}>
      <Surface className="mt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className={`text-[20px] font-bold ${t.title}`}>
              {formatTime(alarm.time.hour, alarm.time.minute)}
            </Text>
            <Text className={`text-[12px] mt-0.5 ${t.body}`} numberOfLines={1}>
              {label}
            </Text>
            <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
              {daysSummary(alarm.days)}
            </Text>
          </View>
          <Toggle
            value={alarm.enabled}
            disabled={notificationsOff}
            onValueChange={(v) => setAlarmEnabled(alarm.id, v)}
          />
        </View>
      </Surface>
    </Pressable>
  );
}

/** Bir alarmın etiket, saat ve gün paneli; silme de burada. */
function AlarmSheet({
  alarm,
  notificationsOff,
  onClose,
}: {
  alarm: CustomAlarm;
  notificationsOff: boolean;
  onClose: () => void;
}) {
  const t = useThemeTokens();

  const confirmRemove = () => {
    Alert.alert('Alarm silinsin mi?', 'Bu alarm ve bildirimleri kaldırılacak.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          // Önce panel kapanıyor: açık panelin dayandığı alarm silinince
          // altından veri çekilmiş olurdu.
          onClose();
          removeAlarm(alarm.id);
        },
      },
    ]);
  };

  return (
    <BottomSheet visible title="Alarm" subtitle="Saat, gün ve etiket" onClose={onClose}>
      {notificationsOff ? (
        <Surface className="mb-3">
          <Text className={`text-[12px] leading-5 mb-2 ${t.muted}`}>
            Ana bildirim şalteri kapalı — açılmadan bu alarm çalmaz.
          </Text>
          <NotificationsMainToggle />
        </Surface>
      ) : null}

      <Surface className="mb-3">
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${t.muted}`}>Saat</Text>
        <View className="items-center">
          <TimeStepper
            hour={alarm.time.hour}
            minute={alarm.time.minute}
            onChange={(time) => updateAlarm(alarm.id, { time })}
          />
        </View>
      </Surface>

      <Surface className="mb-3">
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${t.muted}`}>
          Günler
        </Text>
        <View className="flex-row flex-wrap">
          {DAY_ORDER.map((day) => (
            <Chip
              key={day}
              label={DAY_SHORT[day]}
              selected={alarm.days.includes(day)}
              onPress={() => {
                const next = alarm.days.includes(day)
                  ? alarm.days.filter((d) => d !== day)
                  : [...alarm.days, day].sort((a, b) => a - b);
                updateAlarm(alarm.id, { days: next });
              }}
              tone="emerald"
            />
          ))}
        </View>
        <Text className={`text-[11px] mt-1 ${t.muted}`}>Şimdi: {daysSummary(alarm.days)}</Text>
      </Surface>

      <Surface className="mb-3">
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${t.muted}`}>
          ETİKET
        </Text>
        <TextInput
          value={alarm.label}
          onChangeText={(text) => updateAlarm(alarm.id, { label: text })}
          placeholder="Alarm"
          placeholderTextColor={t.iconColor}
          maxLength={60}
          accessibilityLabel="Alarm etiketi"
          className={`text-[14px] px-3 py-2.5 rounded-xl border ${t.cardBorder} ${t.title}`}
        />
        {/* Etiket zorunlu değil: hazır seçenekler yazma yükünü kaldırıyor. */}
        <View className="flex-row flex-wrap mt-2">
          {ALARM_LABEL_PRESETS.map((preset) => (
            <Chip
              key={preset}
              label={preset}
              selected={alarm.label.trim() === preset}
              onPress={() => updateAlarm(alarm.id, { label: preset })}
              tone="blue"
            />
          ))}
        </View>
      </Surface>

      <Pressable
        onPress={confirmRemove}
        accessibilityRole="button"
        accessibilityLabel="Alarmı sil"
        className={`flex-row items-center justify-center py-3 rounded-xl border ${t.cardBorder}`}
      >
        <Trash2 size={15} color={toneColor('rose', t.isLight)} />
        <Text className={`text-[12px] font-bold ml-2 ${t.isLight ? 'text-rose-600' : 'text-rose-400'}`}>
          Alarmı sil
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

/** Bir modülün ikon + başlık + hatırlatma/saat satırları. */
function ModuleReminderCard({
  module,
  notificationsOff,
}: {
  module: ModuleKey;
  notificationsOff: boolean;
}) {
  const t = useThemeTokens();
  const meta = MODULE_META[module];
  const Icon = meta.icon;

  return (
    <Surface className="mt-3">
      <View className="flex-row items-center mb-1">
        <View
          className={`w-8 h-8 rounded-xl items-center justify-center mr-2 ${toneSoft(meta.tone, t.isLight)}`}
        >
          <Icon size={15} color={toneColor(meta.tone, t.isLight)} />
        </View>
        <Text className={`text-[13px] font-bold ${t.title}`}>{meta.title}</Text>
      </View>

      <ModuleReminderControls
        module={module}
        notificationsOff={notificationsOff}
        moduleOffHint="Modül kapalı — modül ekranındaki ayarlardan açabilirsin."
      />
    </Surface>
  );
}

/** Aralıklı hatırlatıcı listesindeki tek satır: başlık, özet, açma/kapama. */
function HabitReminderRow({
  template,
  reminder,
  notificationsOff,
  onOpen,
}: {
  template: HabitTemplate;
  reminder: HabitReminder;
  notificationsOff: boolean;
  onOpen: () => void;
}) {
  const t = useThemeTokens();

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${template.label} hatırlatıcı ayarlarını aç`}
    >
      <Surface className="mt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className={`text-[13px] font-bold ${t.title}`} numberOfLines={1}>
              {template.label}
            </Text>
            <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
              {habitSummary(reminder)}
            </Text>
          </View>
          <Toggle
            value={reminder.enabled}
            disabled={notificationsOff}
            onValueChange={(v) => setHabitEnabled(template.id, v)}
          />
        </View>
      </Surface>
    </Pressable>
  );
}

/** Bir hatırlatıcının aralık, aktif saat, gün ve (varsa) günlük sayaç paneli. */
function HabitSettingsSheet({
  template,
  visible,
  notificationsOff,
  onClose,
}: {
  template: HabitTemplate;
  visible: boolean;
  notificationsOff: boolean;
  onClose: () => void;
}) {
  const t = useThemeTokens();
  const habits = useHabits();
  const reminder = habits.reminders[template.id];

  return (
    <BottomSheet
      visible={visible}
      title={template.label}
      subtitle="Aralıklı hatırlatıcı ayarları"
      onClose={onClose}
    >
      {notificationsOff ? (
        <Surface className="mb-3">
          <Text className={`text-[12px] leading-5 mb-2 ${t.muted}`}>
            Ana bildirim şalteri kapalı — açılmadan bu hatırlatıcı kurulmaz.
          </Text>
          <NotificationsMainToggle />
        </Surface>
      ) : null}

      <Surface className="mb-3">
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${t.muted}`}>
          Aralık
        </Text>
        <View className="flex-row flex-wrap">
          {HABIT_INTERVALS.map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes} dk`}
              selected={reminder.intervalMinutes === minutes}
              onPress={() => updateHabit(template.id, { intervalMinutes: minutes })}
              tone="emerald"
            />
          ))}
        </View>
      </Surface>

      <Surface className="mb-3">
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${t.muted}`}>
          AKTİF SAATLER
        </Text>
        <View className="flex-row items-center justify-around">
          <View className="items-center">
            <Text className={`text-[10px] mb-1 ${t.muted}`}>Başlangıç</Text>
            <HourStepper
              value={reminder.activeHours.start}
              min={0}
              max={reminder.activeHours.end}
              onChange={(h) =>
                updateHabit(template.id, { activeHours: { ...reminder.activeHours, start: h } })
              }
            />
          </View>
          <View className="items-center">
            <Text className={`text-[10px] mb-1 ${t.muted}`}>Bitiş</Text>
            <HourStepper
              value={reminder.activeHours.end}
              min={reminder.activeHours.start}
              max={23}
              onChange={(h) =>
                updateHabit(template.id, { activeHours: { ...reminder.activeHours, end: h } })
              }
            />
          </View>
        </View>
        <Text className={`text-[11px] mt-3 ${t.muted}`}>
          Gece uyandırmasın diye yalnızca bu saatler arasında kurulur.
        </Text>
      </Surface>

      <Surface className="mb-3">
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${t.muted}`}>
          Günler
        </Text>
        <View className="flex-row flex-wrap">
          {DAY_ORDER.map((day) => (
            <Chip
              key={day}
              label={DAY_SHORT[day]}
              selected={reminder.activeDays.includes(day)}
              onPress={() => {
                const next = reminder.activeDays.includes(day)
                  ? reminder.activeDays.filter((d) => d !== day)
                  : [...reminder.activeDays, day].sort((a, b) => a - b);
                updateHabit(template.id, { activeDays: next });
              }}
              tone="emerald"
            />
          ))}
        </View>
        <Text className={`text-[11px] mt-1 ${t.muted}`}>Şimdi: {daysSummary(reminder.activeDays)}</Text>
      </Surface>

      {template.dailyTarget ? (
        <Surface className="mb-3">
          <View className="flex-row items-center justify-between">
            <Text className={`text-[13px] font-bold flex-1 pr-2 ${t.title}`}>
              Bugünkü sayaç: {habitCount(habits, template.id)}/{template.dailyTarget} {template.unit}
            </Text>
            <Pressable
              onPress={() => resetHabitCount(template.id)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${template.label} sayacını sıfırla`}
              className={`px-3 py-2 rounded-xl border ${t.cardBorder}`}
            >
              <Text className={`text-[11px] font-bold ${t.body}`}>Sıfırla</Text>
            </Pressable>
          </View>
        </Surface>
      ) : null}
    </BottomSheet>
  );
}

/**
 * Saat bazlı (dakikasız) artır/azalt kontrolü — aralıklı hatırlatıcıların
 * aktif saat aralığı için. `min`/`max` sınırları geçilemez: bitiş
 * başlangıçtan küçük seçilemesin diye başlangıcın üst sınırı bitiş saati,
 * bitişin alt sınırı başlangıç saatidir (çağıran taraf ayarlıyor).
 */
function HourStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const t = useThemeTokens();
  const pad = (n: number) => String(n).padStart(2, '0');
  const step = (delta: number) => {
    const next = value + delta;
    if (next < min || next > max) return;
    onChange(next);
  };

  return (
    <View className="items-center">
      <Pressable
        onPress={() => step(1)}
        disabled={value >= max}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Saati artır"
        className={`w-7 h-7 rounded-lg items-center justify-center border ${t.cardBorder} ${
          value >= max ? 'opacity-40' : ''
        }`}
      >
        <Text className={`text-[12px] font-bold ${t.body}`}>+</Text>
      </Pressable>
      <Text className={`text-[15px] font-bold my-1 ${t.title}`}>{pad(value)}:00</Text>
      <Pressable
        onPress={() => step(-1)}
        disabled={value <= min}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Saati azalt"
        className={`w-7 h-7 rounded-lg items-center justify-center border ${t.cardBorder} ${
          value <= min ? 'opacity-40' : ''
        }`}
      >
        <Text className={`text-[12px] font-bold ${t.body}`}>−</Text>
      </Pressable>
    </View>
  );
}
