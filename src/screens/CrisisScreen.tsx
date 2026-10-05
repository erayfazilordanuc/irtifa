import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Flame, Timer, Keyboard as KeyboardIcon, Camera, Coins } from 'lucide-react-native';

import {
  AppScreen,
  TabHeader,
  SectionLabel,
  Surface,
  Badge,
  ActionRow,
  toneColor,
  toneSoft,
  toneText,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import type { InterviewMode } from '../utils/interviewHistory';

// Kriz Masası — YAPILACAKLAR_İRTİFA Bölüm 2.
//
// Mülakat sekmesinden farkı **baskı**: burada soru bilgi ölçmüyor, sıkıştırılmış
// sürede karar sıralaması istiyor. Bu yüzden düşünme payı 30 değil 10 saniye.
//
// Maaş görüşmesi de bu sekmede duruyor ama ayrı bir blok olarak: o da hazırlıksız
// yakalanılan bir an, ama baskı değil **pazarlık** (Bölüm 2.5). İkisini aynı
// ekranda tutmak, "zor anlar" için tek bir yer veriyor.

/** Kriz senaryosu süreleri — mülakatınkinden kasıtlı olarak dar. */
const CRISIS_PREP_SECONDS = 10;
const CRISIS_ANSWER_SECONDS = 90;

/** Maaş görüşmesinde süre baskısı yok: düşünmek pazarlığın parçası. */
const SALARY_PREP_SECONDS = 20;
const SALARY_ANSWER_SECONDS = 120;

export default function CrisisScreen({ navigation }: any) {
  const t = useThemeTokens();
  const [mode, setMode] = React.useState<InterviewMode>('camera');

  const start = (kind: 'kriz' | 'maas') =>
    navigation.navigate('DailyInterview', {
      type: kind,
      mode,
      title: kind === 'kriz' ? 'Kriz Masası' : 'Maaş Görüşmesi',
      prepSeconds: kind === 'kriz' ? CRISIS_PREP_SECONDS : SALARY_PREP_SECONDS,
      answerSeconds: kind === 'kriz' ? CRISIS_ANSWER_SECONDS : SALARY_ANSWER_SECONDS,
    });

  return (
    <AppScreen
      tabBar
      header={
        <TabHeader
          icon={<Flame size={24} color={toneColor('rose', t.isLight)} />}
          title="Kriz Masası"
          subtitle="Hazırlıksız yakalandığın anların provası."
        />
      }
    >
      <View className="mt-1">
        <SectionLabel>GİRİŞ YÖNTEMİ</SectionLabel>
      </View>

      <View className="flex-row gap-2">
        <ModeChip
          label="Kamera & ses"
          icon={<Camera size={15} color={toneColor(mode === 'camera' ? 'rose' : 'slate', t.isLight)} />}
          selected={mode === 'camera'}
          onPress={() => setMode('camera')}
        />
        <ModeChip
          label="Yazılı"
          icon={
            <KeyboardIcon
              size={15}
              color={toneColor(mode === 'typing' ? 'rose' : 'slate', t.isLight)}
            />
          }
          selected={mode === 'typing'}
          onPress={() => setMode('typing')}
        />
      </View>

      <View className="mt-4">
        <SectionLabel>SENARYOLAR</SectionLabel>
      </View>

      <Pressable
        onPress={() => start('kriz')}
        accessibilityRole="button"
        accessibilityLabel={`Kriz senaryosu başlat. ${CRISIS_PREP_SECONDS} saniye düşünme, ${CRISIS_ANSWER_SECONDS} saniye cevap.`}
        className="rounded-2xl p-4 flex-row items-center bg-rose-600"
      >
        <View className="w-14 h-14 rounded-2xl items-center justify-center bg-white/20">
          <Flame size={24} color="#ffffff" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-[18px] font-black text-white">Kriz Senaryosu</Text>
          <Text className="text-[11px] mt-0.5 text-rose-100">
            {CRISIS_PREP_SECONDS} sn düşün · {CRISIS_ANSWER_SECONDS} sn cevapla
          </Text>
        </View>
        <Timer size={18} color="#ffffff" />
      </Pressable>

      <Surface className="mt-2">
        <Text className={`text-[13px] font-bold ${t.title}`}>Burada ölçülen ne</Text>
        <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>
          Kriz sorusunun tek doğru cevabı yok. Değerlendirilen şey sıralaman: önce neyi
          durdurduğun, kime haber verdiğin ve neyi feda ettiğin. Süre kasıtlı olarak dar —
          mülakatta da düşünme payı bu kadardır.
        </Text>
      </Surface>

      <View className="mt-4">
        <SectionLabel>PAZARLIK</SectionLabel>
      </View>

      <ActionRow
        icon={<Coins size={18} color={toneColor('amber', t.isLight)} />}
        tone="amber"
        title="Maaş Görüşmesi"
        subtitle="Aralık belirleme, karşı teklif, sessizlik"
        onPress={() => start('maas')}
      />

      <Surface className="mt-2">
        <View className="flex-row items-center">
          <Text className={`text-[13px] font-bold ${t.title}`}>Baskı değil pazarlık</Text>
          <View className="ml-2">
            <Badge label="Farklı mod" tone="amber" />
          </View>
        </View>
        <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>
          Kriz senaryosunda amaç hasarı durdurmak; maaş görüşmesinde amaç pazarlığı
          sürdürmek. İkisi aynı refleksi istemez: burada acele etmek, sessizliği doldurmak ve
          ilk sayıyı söylemek pahalıya mal olur.
        </Text>
      </Surface>
    </AppScreen>
  );
}

function ModeChip({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      className={`flex-1 flex-row items-center justify-center rounded-2xl py-3 border ${
        selected ? `${toneSoft('rose', t.isLight)} border-transparent` : t.cardBorder
      }`}
    >
      {icon}
      <Text
        className={`text-[12px] font-bold ml-2 ${
          selected ? toneText('rose', t.isLight) : t.muted
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
