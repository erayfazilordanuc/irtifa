import React from 'react';
import { View, Text } from 'react-native';
import { Briefcase, ClipboardList, Layers, NotebookPen, Send } from 'lucide-react-native';

import {
  AppScreen,
  TabHeader,
  SectionLabel,
  Surface,
  StatTile,
  ActionRow,
  toneColor,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { applicationStats, useApplications, STAGE_META } from '../utils/applications';
import { useStarStories } from '../utils/starStories';
import { useCompaniesWithNotes } from '../utils/companyNotes';

// Kariyer sekmesi — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// İrtifa'nın ikinci yarısı: mülakat tek seferlik bir olay, iş arama süreci
// haftalar sürüyor. Bu sekme o süreci taşıyor — nereye başvurdum, hangi
// hikâyeyi anlatacağım, şirket hakkında ne biliyorum, mülakattan sonra ne
// yaptım.
//
// Hepsi çevrimdışı çalışır; yapay zekâ yalnızca metin önerisinde devreye girer.

export default function CareerScreen({ navigation }: any) {
  const t = useThemeTokens();
  const applications = useApplications();
  const stories = useStarStories();
  const noted = useCompaniesWithNotes();

  const stats = applicationStats(applications);
  const upcoming = applications.filter((item) => item.stage === 'mulakat');

  return (
    <AppScreen
      tabBar
      header={
        <TabHeader
          icon={<Briefcase size={24} color={toneColor('amber', t.isLight)} />}
          title="Kariyer"
          subtitle="Başvurular, hikâyelerin ve şirket notların."
        />
      }
    >
      <View className="flex-row gap-2 mt-1">
        <StatTile label="Süren" value={String(stats.active)} tone="blue" />
        <StatTile label="Mülakat" value={String(stats.interviews)} tone="violet" />
        <StatTile label="Teklif" value={String(stats.offers)} tone="emerald" />
      </View>

      {upcoming.length > 0 ? (
        <Surface className="mt-3">
          <Text className={`text-[13px] font-bold ${t.title}`}>Mülakat aşamasındakiler</Text>
          {upcoming.slice(0, 3).map((item) => (
            <Text key={item.id} className={`text-[12px] mt-1.5 ${t.body}`}>
              • {item.companyName} — {item.position || 'pozisyon yazılmadı'}
            </Text>
          ))}
          <Text className={`text-[11px] mt-2 ${t.muted}`}>
            Mülakat öncesi şirket notunu ve STAR hikâyelerini bir kez geç.
          </Text>
        </Surface>
      ) : null}

      <View className="mt-4">
        <SectionLabel>ARAÇLAR</SectionLabel>
      </View>

      <View className="gap-2">
        <ActionRow
          icon={<ClipboardList size={18} color={toneColor('blue', t.isLight)} />}
          tone="blue"
          title="Başvuru Takibi"
          subtitle={
            applications.length === 0
              ? 'Henüz başvuru yok — ilkini ekle'
              : `${applications.length} başvuru · ${STAGE_META[applications[0].stage].label} en son`
          }
          onPress={() => navigation.navigate('Applications')}
        />
        <ActionRow
          icon={<Layers size={18} color={toneColor('violet', t.isLight)} />}
          tone="violet"
          title="STAR Cevapların"
          subtitle={
            stories.length === 0
              ? 'Davranışsal sorular için hikâye kur'
              : `${stories.length} hikâye hazır`
          }
          onPress={() => navigation.navigate('StarStories')}
        />
        <ActionRow
          icon={<NotebookPen size={18} color={toneColor('emerald', t.isLight)} />}
          tone="emerald"
          title="Şirket Notları"
          subtitle={
            noted.length === 0
              ? 'Başvurduğun şirket hakkında ne biliyorsun?'
              : `${noted.length} şirket için not var`
          }
          onPress={() => navigation.navigate('CompanyNotes')}
        />
        <ActionRow
          icon={<Send size={18} color={toneColor('amber', t.isLight)} />}
          tone="amber"
          title="Mülakat Sonrası Takip"
          subtitle="Teşekkür mesajı ve öz-değerlendirme"
          onPress={() => navigation.navigate('FollowUp')}
        />
      </View>
    </AppScreen>
  );
}
