import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  Mic,
  Target,
  SlidersHorizontal,
  History,
  Newspaper,
  ChevronRight,
  Check,
} from 'lucide-react-native';

import {
  AppScreen,
  TabHeader,
  SectionLabel,
  ActionRow,
  Badge,
  toneColor,
  toneSoft,
  toneText,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { firstName, targetDepartmentLabel, useProfile } from '../utils/profile';
import { getCompany, findCompany } from '../data/companies';
import { pickDailyInterview, pickDailyFieldTest } from '../data/questions';
import { useDayKey } from '../utils/today';
import { dayKey } from '../utils/dateUtils';
import { useInterviewSessions, sessionKind } from '../utils/interviewHistory';

// Mülakat sekmesi — uygulamanın giriş ekranı.
//
// Tek soruyu cevaplar: "bugün hangi mülakat işini yapacağım?" Bu yüzden en
// üstte günün iki işi duruyor (günün mülakatı + günün alan testi), altında
// kurgu ve arşiv.
//
// Terakki'de bu ekranın karşılığı "Bugün" sekmesiydi ve yedi sütunun günlük
// kartlarını taşıyordu. İrtifa'nın kapsamı mülakat ve iş olduğu için günün işi
// de mülakat: egzersizler Atölye sekmesine, ölçüm Karne'ye taşındı.

export default function InterviewHubScreen({ navigation }: any) {
  const t = useThemeTokens();
  const profile = useProfile();
  const day = useDayKey();
  const sessions = useInterviewSessions();

  const daily = React.useMemo(() => pickDailyInterview(profile.sectorId), [profile.sectorId, day]);
  const dailyCompany = getCompany(daily.companyId);
  const department = targetDepartmentLabel(profile);

  const fieldTest = React.useMemo(
    () => (profile.targetDepartment ? pickDailyFieldTest(profile.targetDepartment) : null),
    [profile.targetDepartment, day],
  );

  // Bugün hangi işler bitti — kartların üstündeki ✓ bundan geliyor.
  const today = dayKey();
  const doneToday = React.useMemo(() => {
    const todays = sessions.filter((s) => dayKey(new Date(s.timestamp)) === today);
    return {
      interview: todays.some((s) => sessionKind(s) === 'interview'),
      fieldTest: todays.some((s) => sessionKind(s) === 'fieldTest'),
    };
  }, [sessions, today]);

  return (
    <AppScreen
      tabBar
      header={
        <TabHeader
          icon={<Mic size={24} color={toneColor('blue', t.isLight)} />}
          title={firstName(profile) ? `Merhaba, ${firstName(profile)}` : 'Mülakat'}
          subtitle="Günün işi burada. Her gün bir mülakat, bir alan testi."
        />
      }
    >
      <View className="mt-1">
        <SectionLabel>BUGÜN</SectionLabel>
      </View>

      <DailyCard
        tone="blue"
        icon={<Mic size={20} color={toneColor('blue', t.isLight)} />}
        title="Günün mülakatı"
        subtitle={`${dailyCompany.shortName} · genel soru`}
        done={doneToday.interview}
        onPress={() => navigation.navigate('DailyInterview')}
      />

      <DailyCard
        tone="violet"
        icon={<Target size={20} color={toneColor(department ? 'violet' : 'slate', t.isLight)} />}
        title="Günün alan testi"
        subtitle={
          department
            ? `${department} · ${fieldTest?.questions.length ?? 0} soru`
            : 'Hedef alanını seç'
        }
        done={doneToday.fieldTest}
        onPress={() =>
          department ? navigation.navigate('FieldTest') : navigation.navigate('Profile')
        }
      />

      <View className="mt-4">
        <SectionLabel>SİMÜLASYON</SectionLabel>
      </View>

      <View className="gap-2">
        <ActionRow
          icon={<SlidersHorizontal size={18} color={toneColor('blue', t.isLight)} />}
          tone="blue"
          title="Özelleştirilmiş Mülakat"
          subtitle="Kurum, tür ve giriş cihazı seçimi"
          onPress={() => navigation.navigate('CustomInterview')}
        />
        <ActionRow
          icon={<History size={18} color={toneColor('violet', t.isLight)} />}
          tone="violet"
          title="Mülakat Geçmişi"
          subtitle="Kayıtlar, puanlar ve değerlendirmeler"
          onPress={() => navigation.navigate('InterviewHistory')}
        />
        <ActionRow
          icon={<Newspaper size={18} color={toneColor('amber', t.isLight)} />}
          tone="amber"
          title="Sektörel Gelişmeler"
          subtitle={
            findCompany(daily.companyId)
              ? 'Haber akışı ve arşiv — mülakatta sorulur'
              : 'Haber akışı ve arşiv'
          }
          onPress={() => navigation.navigate('NewsScreen')}
        />
      </View>
    </AppScreen>
  );
}

/** Günün iki işi — büyük dokunma hedefi, bitince ✓ rozetli. */
function DailyCard({
  tone,
  icon,
  title,
  subtitle,
  done,
  onPress,
}: {
  tone: 'blue' | 'violet';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  done: boolean;
  onPress: () => void;
}) {
  const t = useThemeTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}.${done ? ' Bugün tamamlandı.' : ''}`}
      className={`flex-row items-center rounded-2xl p-4 mt-2 border ${t.cardBg} ${t.cardBorder}`}
    >
      <View
        className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${toneSoft(tone, t.isLight)}`}
      >
        {icon}
      </View>
      <View className="flex-1 pr-2">
        <View className="flex-row items-center">
          <Text className={`text-[14px] font-bold ${t.title}`}>{title}</Text>
          {done ? (
            <View className="ml-2">
              <Badge label="Bitti" tone="emerald" />
            </View>
          ) : null}
        </View>
        <Text className={`text-[11px] mt-0.5 ${t.muted}`}>{subtitle}</Text>
      </View>
      {done ? (
        <Check size={18} color={toneColor('emerald', t.isLight)} />
      ) : (
        <ChevronRight size={18} color={t.iconColor} />
      )}
    </Pressable>
  );
}
