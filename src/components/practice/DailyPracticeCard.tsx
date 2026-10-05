import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Wind,
  Mic,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

import { Card, ProgressBar, useThemeTokens } from './PracticeUI';
import { useDailyPracticeSettings } from '../../utils/dailyPracticeSettings';
import {
  isCompletedToday,
  useDailyProgress,
  type PracticeModule,
} from '../../utils/dailyPracticeProgress';
import { getBreathingProgram } from '../../data/breathingPrograms';
import { drillSeconds, pickDailyDrill } from '../../data/dictionDrills';
import { useDayKey } from '../../utils/today';
import { formatTime } from '../../utils/dateUtils';
import { useOnboarding, moduleOrderForGoals } from '../../utils/onboarding';

// Ana ekran (Mülakat sekmesi) kartları.
// Yalnızca ayarlarda açık olan modüller görünür; hepsi kapalıysa kart hiç render edilmez.

type Row = {
  module: PracticeModule;
  screen: string;
  title: string;
  detail: string;
  time: string;
  icon: React.ReactNode;
  /** Kaba süre tahmini (dk) — bkz. `minutesFromSeconds` altındaki not. */
  minutes: number;
};

/**
 * Modül başına kaba süre tahmini (dakika) — Atölye listesini
 * `onboarding.dailyMinutes` bütçesine sığdırmak için kullanılıyor
 * (YAPILACAKLAR Bölüm 0.1 → "Günlük süre günlük listeyi ayarlasın").
 *
 * Diyafram ve konuşma günün gerçekten seçilen içeriğinden (nefes programının
 * toplam saniyesi, tekerlemenin öğe × saniye'si) hesaplanıyor.
 */
function minutesFromSeconds(seconds: number): number {
  return Math.max(1, Math.round(seconds / 60));
}

export function DailyPracticeCard({ navigation }: { navigation?: any }) {
  const t = useThemeTokens();
  const { settings } = useDailyPracticeSettings();
  const { progress } = useDailyProgress();
  const { goals, dailyMinutes, dailyMinutesChosen } = useOnboarding();
  const day = useDayKey();
  const [expanded, setExpanded] = React.useState(false);

  const rows = React.useMemo<Row[]>(() => {
    const iconColor = t.isLight ? '#475569' : '#cbd5e1';
    const list: Row[] = [];

    if (settings.diaphragm.enabled) {
      const program = getBreathingProgram(settings.diaphragm.mode, settings.diaphragm.level);
      list.push({
        module: 'diaphragm',
        screen: 'DiaphragmExercise',
        title: 'Diyafram egzersizi',
        detail: `${program.title} · ${program.durationLabel}`,
        time: formatTime(settings.diaphragm.time.hour, settings.diaphragm.time.minute),
        icon: <Wind size={18} color={iconColor} />,
        minutes: minutesFromSeconds(program.totalSeconds),
      });
    }

    if (settings.speech.enabled) {
      const drill = pickDailyDrill(settings.speech);
      list.push({
        module: 'speech',
        screen: 'SpeechExercise',
        title: 'Konuşma egzersizi',
        detail: drill.title,
        time: formatTime(settings.speech.time.hour, settings.speech.time.minute),
        icon: <Mic size={18} color={iconColor} />,
        minutes: minutesFromSeconds(drillSeconds(drill)),
      });
    }

    // Hedeflenen modüller seçim sırasıyla öne alınır; hedef seçilmemişken
    // `moduleOrderForGoals([])` mevcut sırayı (yukarıdaki push sırasını) verir.
    const order = moduleOrderForGoals(goals);
    return [...list].sort((a, b) => order.indexOf(a.module) - order.indexOf(b.module));
    // `day`: gün dönümünde satırların içeriği (nefes programı, tekerleme)
    // tazelensin ("Gün dönümünde yenileme").
  }, [settings, t.isLight, goals, day]);

  // Bütçeleme: hedef sırasına göre modülleri günlük dakika hedefine sığdırır.
  // En az bir modül her zaman görünür; bütçeye sığmayanlar "Daha fazlası"
  // altına düşer, kapanmaz (KARARLAR.md → "Kullanıcı karar turu (2026-09-19)").
  // 10 dk en üst kademe: kaba süre tahminleri toplamı 10'u aşabilse de bu
  // kademe "hepsini göster" anlamına geliyor, bütçe uygulanmıyor.
  const { visibleRows, hiddenCount } = React.useMemo(() => {
    // Süre seçilmediyse (eski kullanıcı, oryantasyonu atlayan) liste kısalmaz.
    if (!dailyMinutesChosen || dailyMinutes >= 10) return { visibleRows: rows, hiddenCount: 0 };
    // Sıra bozulmuyor: bütçeye sığmayan ilk modülde kesiliyor. Sığmayanı atlayıp
    // arkasındaki küçük modülü öne almak, kullanıcının hedef sırasını sessizce
    // değiştirirdi.
    let used = 0;
    const visible: Row[] = [];
    for (const row of rows) {
      if (visible.length > 0 && used + row.minutes > dailyMinutes) break;
      visible.push(row);
      used += row.minutes;
    }
    return { visibleRows: visible, hiddenCount: rows.length - visible.length };
  }, [rows, dailyMinutes, dailyMinutesChosen]);

  if (rows.length === 0) return null;

  const displayRows = expanded ? rows : visibleRows;
  // Gün hedefi görünür (bütçelenmiş) listeye göre; genişletilince açılan
  // ekstra modüller bonus sayılır, oranı değiştirmez.
  const doneCount = visibleRows.filter((row) => isCompletedToday(progress, row.module)).length;

  return (
    <Card className="mt-4" style={{paddingBottom: 6}}>
      <View className="flex-row items-center justify-between mb-1">
        <Text className={`text-[11px] font-bold tracking-widest ${t.muted}`}>
          GÜNLÜK PRATİK
        </Text>
        <Text className={`text-[11px] font-bold ${doneCount === visibleRows.length ? (t.isLight ? 'text-emerald-600' : 'text-emerald-400') : t.muted}`}>
          {doneCount}/{visibleRows.length}
        </Text>
      </View>

      <View className="mt-2 mb-2">
        <ProgressBar value={visibleRows.length === 0 ? 0 : doneCount / visibleRows.length} tone="emerald" />
      </View>

      {displayRows.map((row, index) => {
        const done = isCompletedToday(progress, row.module);
        return (
          <Pressable
            key={row.module}
            onPress={() => navigation?.navigate?.(row.screen)}
            accessibilityRole="button"
            // Satırları çizgi değil boşluk ayırıyor: dört modülün arasına çizgi
            // çekmek listeyi tablo gibi gösteriyor ve kartı kalabalıklaştırıyordu.
            className={`flex-row items-center py-3.5 ${index > 0 ? 'mt-0.5' : ''}`}
          >
            <View
              className={`w-9 h-9 rounded-xl items-center justify-center ${
                done
                  ? t.isLight
                    ? 'bg-emerald-100'
                    : 'bg-emerald-900'
                  : t.isLight
                    ? 'bg-slate-100'
                    : 'bg-slate-800'
              }`}
            >
              {done ? <Check size={18} color={t.isLight ? '#059669' : '#34d399'} /> : row.icon}
            </View>
            <View className="flex-1 ml-3 pr-2">
              <Text
                className={`text-[13px] font-bold ${done ? t.muted : t.title}`}
                numberOfLines={1}
              >
                {row.title}
              </Text>
              <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
                {row.detail}
              </Text>
            </View>
            <Text className={`text-[11px] mr-1 ${t.muted}`}>{row.time}</Text>
            <ChevronRight size={16} color={t.iconColor} />
          </Pressable>
        );
      })}

      {/* Bütçe dışında kalan modüller — kapanmaz, "Daha fazlası" ile açılır. */}
      {hiddenCount > 0 ? (
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={
            expanded ? 'Günlük pratik listesini daralt' : `Kalan ${hiddenCount} modülü göster`
          }
          className="flex-row items-center py-3.5 mt-0.5"
        >
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center ${
              t.isLight ? 'bg-slate-100' : 'bg-slate-800'
            }`}
          >
            {expanded ? (
              <ChevronUp size={18} color={t.iconColor} />
            ) : (
              <ChevronDown size={18} color={t.iconColor} />
            )}
          </View>
          <View className="flex-1 ml-3 pr-2">
            <Text className={`text-[13px] font-bold ${t.title}`}>
              {expanded ? 'Daha az göster' : `Daha fazlası (${hiddenCount})`}
            </Text>
            {!expanded ? (
              <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
                Günlük hedefin {dailyMinutes} dk — daha fazlası için aç
              </Text>
            ) : null}
          </View>
        </Pressable>
      ) : null}
    </Card>
  );
}
