import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Dumbbell,
  HeartPulse,
  Mic,
  BrainCircuit,
  CalendarCheck,
  ChevronRight,
} from 'lucide-react-native';

import {
  AppScreen,
  TabHeader,
  SectionLabel,
  toneColor,
  toneSoft,
  type Tone,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { DailyPracticeCard } from '../components/practice/DailyPracticeCard';
import { HabitCard } from '../components/practice/HabitCard';
import { useDailyPracticeSettings } from '../utils/dailyPracticeSettings';

// Mülakat Hazırlık Atölyesi — YAPILACAKLAR_İRTİFA Bölüm 2, sekme 3.
//
// Buradaki egzersizler genel yaşam rutini değil: hepsi mülakat anına hizmet
// ediyor (dosya başı kararı — "Mülakat Odaklı Egzersiz Yaklaşımı").
//   • Nefes    → komite karşısına çıkmadan önceki heyecanı yatıştırmak, ses titremesi
//   • Diksiyon → dolgu kelime ("şey, yani, eee") temizliği, teknik terim telaffuzu
//   • Zekâ     → kriz sorusuna seçenek üretme, STAR ile hızlı cevap kurma
//
// Terakki'de bu ekranın karşılığı "Gelişim" sekmesiydi ve yedi sütunu
// listeliyordu; İrtifa'da yalnızca mülakata hizmet eden üç atölye kaldı.

type Station = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: Tone;
  screen: string;
  params?: Record<string, unknown>;
  /** Modül ayarlarından kapatılmışsa listede görünmez (ortak ilke 1). */
  enabled: boolean;
};

export default function WorkshopScreen({ navigation }: any) {
  const t = useThemeTokens();
  const { settings } = useDailyPracticeSettings();

  const stations: Station[] = [
    {
      id: 'nefes',
      title: 'Mülakat Nefesi',
      subtitle: 'Heyecan yatıştırma, ses titremesini önleme, diyafram desteği',
      icon: <HeartPulse size={20} color={toneColor('emerald', t.isLight)} />,
      tone: 'emerald',
      screen: 'DiaphragmExercise',
      enabled: settings.diaphragm.enabled,
    },
    {
      id: 'diksiyon',
      title: 'Mülakat Diksiyonu',
      subtitle: 'Dolgu kelime avı, konuşma temposu, teknik terim telaffuzu',
      icon: <Mic size={20} color={toneColor('rose', t.isLight)} />,
      tone: 'rose',
      screen: 'SpeechExercise',
      enabled: settings.speech.enabled,
    },
    {
      id: 'zeka',
      title: 'Mülakat Zekâsı',
      subtitle: 'Kriz sorusuna seçenek üretme, terim hatırlama, baskı altında muhakeme',
      icon: <BrainCircuit size={20} color={toneColor('violet', t.isLight)} />,
      tone: 'violet',
      screen: 'BrainExercises',
      params: { track: 'cognitive', hideTrackToggle: true },
      enabled: true,
    },
    {
      id: 'hazirlik',
      title: 'Mülakat Öncesi Hazırlık',
      subtitle: 'Kamera önü duruş ve son dakika nefes pratikleri',
      icon: <Dumbbell size={20} color={toneColor('blue', t.isLight)} />,
      tone: 'blue',
      screen: 'BrainExercises',
      params: { track: 'physiological', hideTrackToggle: true },
      enabled: true,
    },
    {
      id: 'rutin',
      title: 'Hatırlatıcılar',
      subtitle: 'Günlük pratik ve aralıklı hatırlatma ayarları',
      icon: <CalendarCheck size={20} color={toneColor('amber', t.isLight)} />,
      tone: 'amber',
      screen: 'Reminders',
      enabled: true,
    },
  ];

  const visible = stations.filter((station) => station.enabled);

  return (
    <AppScreen
      tabBar
      header={
        <TabHeader
          icon={<Dumbbell size={24} color={toneColor('emerald', t.isLight)} />}
          title="Atölye"
          subtitle="Mülakat anına hazırlayan pratikler. Kapattığın modül burada görünmez."
        />
      }
    >
      {/* Aralıklı hatırlatıcı sayaçları — hiçbiri açık değilse çıkmaz. */}
      <HabitCard />

      {/* Günlük pratik modülleri — hepsi kapalıysa hiç render edilmez. */}
      <DailyPracticeCard navigation={navigation} />

      <View className="mt-3">
        <SectionLabel>ATÖLYELER · {visible.length}</SectionLabel>
      </View>

      <View className="gap-2">
        {visible.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            onPress={() => navigation.navigate(station.screen, station.params)}
          />
        ))}
      </View>
    </AppScreen>
  );
}

function StationCard({ station, onPress }: { station: Station; onPress: () => void }) {
  const t = useThemeTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${station.title}. ${station.subtitle}`}
      className={`flex-row items-center rounded-2xl p-3.5 border ${t.cardBg} ${t.cardBorder}`}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${toneSoft(station.tone, t.isLight)}`}
      >
        {station.icon}
      </View>
      <View className="flex-1 pr-2">
        <Text className={`text-[13px] font-bold ${t.title}`}>{station.title}</Text>
        <Text className={`text-[11px] mt-0.5 leading-4 ${t.muted}`}>{station.subtitle}</Text>
      </View>
      <ChevronRight size={17} color={t.iconColor} />
    </Pressable>
  );
}
