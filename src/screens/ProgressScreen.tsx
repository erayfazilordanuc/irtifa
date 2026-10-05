import React from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  TrendingUp,
  Award,
  Cpu,
  Flame,
  ChartColumn,
  NotebookPen,
  Target,
  User,
} from 'lucide-react-native';

import {
  AppScreen,
  TabHeader,
  RoundButton,
  Surface,
  SectionLabel,
  StatTile,
  toneColor,
  toneSoft,
  toneText,
  type Tone,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { TrendChart } from '../components/TrendChart';
import { testHistory, useDailyProgress, type PracticeModule } from '../utils/dailyPracticeProgress';
import {
  interviewStats,
  useInterviewSessions,
  sessionKind,
  fieldTestScore,
} from '../utils/interviewHistory';
import { findDepartment } from '../data/sectors';
import { targetDepartmentLabel, useProfile } from '../utils/profile';
import { exerciseStats, useExerciseLogs } from '../utils/exerciseHistory';
import { MEASURE_TESTS } from '../data/measureTests';

// Karne sekmesi — uygulamanın ölçtüğü **her şey**.
//
// Mülakat puanı, alan testi doğruluğu, egzersiz serileri ve kasıtlı ölçümler
// burada. Profil ve Ayarlar da buradan açılıyor (beş sekmenin beşincisi;
// profilin kendi sekmesi yok).
//
// ⚠️ Alan testi ile mülakat ayrı ölçülür (YAPILACAKLAR_İRTİFA Bölüm 3, karar 2):
// alan testi yazılı olduğu için akıcılık/dolgu kelime metrikleri ona
// uygulanmaz; onun ölçüsü doğruluk.
//
// DÜZEN (2026-09-18'de sadeleştirildi): ekran üç bölüme indi — Özet, Seriler,
// Kayıtlar — ve gelişim eğrisi yalnızca verisi varken çiziliyor.
// Önceki hâlin iki sorunu vardı:
//   1. Beş seri kartı iki sütunlu ızgaraya diziliyordu; tek sayı olduğu için
//      sonuncusu yarım satırda yalnız kalıyor, sayfa "yamuk" duruyordu.
//      Artık tek bir kartın içinde eşit satırlar hâlinde.
//   2. Aynı ekranda üç ayrı kart biçimi vardı (ızgara kutusu, geçmiş kartı,
//      karne kartı). Hepsi tek bir satır biçimine indi.
//
// 2026-09-20: "Kayıtlar" dördüncü girişini (Yanıt defteri) alınca alt alta
// dört satır ekranın yarısını kaplar oldu; ikişerli ızgaraya geçildi
// (`RecordGrid`). Yukarıdaki 1. maddedeki "yamuk" sorunu burada yok: giriş
// sayısı çift ve tek kalırsa boş dolgu ekleniyor.

const MODULE_LABELS: Record<PracticeModule, string> = {
  diaphragm: 'Diyafram nefesi',
  speech: 'Konuşma egzersizi',
};

/** Grafiğe beslenecek son N kaydı eskiden yeniye sıralar. */
function lastValues<T>(items: T[], take: number, pick: (item: T) => number): number[] {
  return items.slice(0, take).reverse().map(pick);
}

export default function ProgressScreen({ navigation }: any) {
  const t = useThemeTokens();
  const { progress } = useDailyProgress();
  const allSessions = useInterviewSessions();
  const logs = useExerciseLogs();
  const profile = useProfile();

  // Mülakat ve alan testi aynı depoda; karne ikisini ayrı okuyor.
  const sessions = React.useMemo(
    () => allSessions.filter((session) => sessionKind(session) === 'interview'),
    [allSessions],
  );
  const fieldTests = React.useMemo(
    () => allSessions.filter((session) => sessionKind(session) === 'fieldTest'),
    [allSessions],
  );

  const interviews = interviewStats(sessions);
  const fieldScores = fieldTests
    .map((session) => fieldTestScore(session.items ?? []))
    .filter((score): score is number => typeof score === 'number');
  const fieldAverage =
    fieldScores.length === 0
      ? 0
      : Math.round(fieldScores.reduce((sum, score) => sum + score, 0) / fieldScores.length);
  const exercises = exerciseStats(logs);

  const modules = Object.entries(progress.modules) as [
    PracticeModule,
    { streak: number; bestStreak: number; totalSessions: number },
  ][];

  // Başlanmamış modüller satır olarak yer kaplamıyor; adları tek satırda
  // özetleniyor (2026-09-19). Eskiden beşi de listeleniyordu ve çoğu "0 gün"
  // yazan, bilgi vermeyen satırlardı.
  const started = modules.filter(([, m]) => m.totalSessions > 0);
  const notStarted = modules.filter(([, m]) => m.totalSessions === 0);

  const interviewSeries = lastValues(
    sessions.filter((session) => session.analysis),
    7,
    (session) => session.analysis?.rating ?? 0,
  );
  const exerciseSeries = lastValues(logs, 7, (log) => log.effort);
  const fieldSeries = lastValues(
    fieldTests.filter((session) => typeof fieldTestScore(session.items ?? []) === 'number'),
    7,
    (session) => fieldTestScore(session.items ?? []) ?? 0,
  );
  const hasChartData =
    interviewSeries.length > 1 || exerciseSeries.length > 1 || fieldSeries.length > 1;

  // Karne satırının alt yazısı: kaç testte en az bir ölçüm var.
  const measuredCount = MEASURE_TESTS.filter(
    (test) => testHistory(progress, test.id).length > 0,
  ).length;

  return (
    <AppScreen
      tabBar
      header={
        <TabHeader
          icon={<TrendingUp size={24} color={toneColor('blue', t.isLight)} />}
          title="Karne"
          subtitle="Ne kadar yol aldın. Puanlar, seriler ve ölçümler bir arada."
          right={
            <RoundButton
              icon={<User size={18} color={t.iconColor} />}
              onPress={() => navigation.navigate('Profile')}
              label="Profil ve ayarlar"
            />
          }
        />
      }
    >
      <View className="-mt-5">
        <SectionLabel>ÖZET</SectionLabel>
      </View>
      <View className="flex-row gap-2.5">
        {/* `compact`: tasarım aynı, kutular alçaldı — ekran kalabalık geliyordu. */}
        <StatTile
          compact
          label="Mülakat"
          icon={<Award size={14} color={toneColor('blue', t.isLight)} />}
          tone="blue"
          value={interviews.averageRating}
          unit="/100 ort."
          hint={`${interviews.total} oturum`}
        />
        <StatTile
          compact
          label="Alan testi"
          icon={<Target size={14} color={toneColor('violet', t.isLight)} />}
          tone="violet"
          value={fieldAverage}
          unit="/100 ort."
          hint={
            fieldTests.length === 0
              ? (targetDepartmentLabel(profile) || 'Alan seçilmedi')
              : `${fieldTests.length} set`
          }
        />
      </View>

      <View className="flex-row gap-2.5 mt-2.5">
        <StatTile
          compact
          label="Egzersiz"
          icon={<Cpu size={14} color={toneColor('emerald', t.isLight)} />}
          tone="emerald"
          value={exercises.totalMinutes}
          unit="dk"
          hint={`${exercises.total} antrenman`}
        />
        <StatTile
          compact
          label="Alanlar"
          icon={<Award size={14} color={toneColor('amber', t.isLight)} />}
          tone="amber"
          value={new Set(fieldTests.map((s) => s.departmentId).filter(Boolean)).size}
          unit="alan"
          hint={
            fieldTests.length > 0
              ? (findDepartment(fieldTests[0].departmentId)?.label ?? 'En son')
              : 'Henüz yok'
          }
        />
      </View>

      <SectionLabel>SERİLER</SectionLabel>
      <Surface>
        {started.map(([id, m], index) => (
          <StreakRow
            key={id}
            label={MODULE_LABELS[id]}
            streak={m.streak}
            bestStreak={m.bestStreak}
            first={index === 0}
          />
        ))}
        {notStarted.length > 0 ? (
          <Text
            className={`text-[11px] leading-4 ${t.muted} ${
              started.length > 0 ? `mt-3 pt-3 border-t ${t.dividerColor}` : ''
            }`}
          >
            Henüz başlanmadı: {notStarted.map(([id]) => MODULE_LABELS[id]).join(' · ')}
          </Text>
        ) : null}
      </Surface>

      <SectionLabel>KAYITLAR</SectionLabel>
      <RecordGrid
        items={[
          {
            key: 'karne',
            icon: <ChartColumn size={16} color={toneColor('emerald', t.isLight)} />,
            tone: 'emerald',
            title: 'Karne',
            subtitle: `${measuredCount}/${MEASURE_TESTS.length} ölçüm`,
            label: `Karne. Bütün ölçümler; ${MEASURE_TESTS.length} testin ${measuredCount} tanesinde ölçümün var.`,
            onPress: () => navigation.navigate('Measurements'),
          },
          {
            key: 'mulakat',
            icon: <Award size={16} color={toneColor('blue', t.isLight)} />,
            tone: 'blue',
            title: 'Mülakat',
            subtitle: 'Kayıt, puan',
            label: 'Mülakat geçmişi. Kayıtlar ve puanlar.',
            onPress: () => navigation.navigate('InterviewHistory'),
          },
          {
            key: 'egzersiz',
            icon: <Cpu size={16} color={toneColor('violet', t.isLight)} />,
            tone: 'violet',
            title: 'Egzersiz',
            subtitle: 'Zihin ve nefes',
            label: 'Egzersiz geçmişi. Zihin ve nefes kayıtları.',
            onPress: () => navigation.navigate('ExerciseHistory'),
          },
          {
            key: 'yanit',
            icon: <NotebookPen size={16} color={toneColor('amber', t.isLight)} />,
            tone: 'amber',
            title: 'Yanıt defteri',
            subtitle: 'Yazdıkların',
            label: 'Yanıt defteri. Yazdıkların ve verdiğin cevaplar.',
            onPress: () => navigation.navigate('ResponseJournal'),
          },
        ]}
      />

      {/* Eğri yalnızca çizilebiliyorsa görünüyor: veri yokken "veri yok" kartı
          koymak ekranı bir şey söylemeyen bir kutuyla uzatıyordu. */}
      {hasChartData ? (
        <>
          <SectionLabel>GELİŞİM EĞRİSİ</SectionLabel>
          <Surface>
            <View className="flex-row items-center justify-end mb-2">
              <LegendDot color={toneColor('blue', t.isLight)} label="Mülakat" />
              <View className="w-3" />
              <LegendDot color={toneColor('violet', t.isLight)} label="Alan testi" />
              <View className="w-3" />
              <LegendDot color={toneColor('emerald', t.isLight)} label="Egzersiz" />
            </View>
            <TrendChart
              height={115}
              maxValue={100}
              series={[
                ...(interviewSeries.length > 1
                  ? [{ color: toneColor('blue', t.isLight), values: interviewSeries, fill: true }]
                  : []),
                ...(fieldSeries.length > 1
                  ? [{ color: toneColor('violet', t.isLight), values: fieldSeries, fill: true }]
                  : []),
                ...(exerciseSeries.length > 1
                  ? [{ color: toneColor('emerald', t.isLight), values: exerciseSeries, fill: true }]
                  : []),
              ]}
            />
          </Surface>
        </>
      ) : null}
    </AppScreen>
  );
}

/** Seriler kartındaki tek satır: modül adı, güncel seri ve en iyi seri. */
function StreakRow({
  label,
  streak,
  bestStreak,
  first,
}: {
  label: string;
  streak: number;
  bestStreak: number;
  first: boolean;
}) {
  const t = useThemeTokens();

  // `active` ayrımı kalktı: artık yalnızca başlanmış modüller satır oluyor,
  // başlanmamışlar kartın altında adlarıyla özetleniyor.
  return (
    <View
      className={`flex-row items-center ${first ? '' : `mt-3 pt-3 border-t ${t.dividerColor}`}`}
    >
      <View
        className={`w-8 h-8 rounded-xl items-center justify-center mr-3 ${toneSoft('emerald', t.isLight)}`}
      >
        <Flame size={15} color={toneColor('emerald', t.isLight)} />
      </View>
      <Text className={`flex-1 text-[13px] font-semibold ${t.title}`} numberOfLines={1}>
        {label}
      </Text>
      {bestStreak > 0 ? (
        <Text className={`text-[11px] mr-3 ${t.muted}`}>en iyi {bestStreak}</Text>
      ) : null}
      <Text className={`text-[13px] font-bold ${toneText('emerald', t.isLight)}`}>
        {streak} gün
      </Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const t = useThemeTokens();
  return (
    <View className="flex-row items-center">
      <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
      <Text className={`text-[10px] font-bold ${t.muted}`}>{label}</Text>
    </View>
  );
}

/**
 * "Kayıtlar" girişlerinin ikişerli ızgarası.
 *
 * Bu dört giriş eskiden alt alta birer `ActionRow`'du ve ekranın yarısını
 * kaplıyordu; ikişerli dizilince dördü de tek bakışta görünüyor. Hücreler
 * `flex-1` ile eşit bölünüyor, satırlar ayrı ayrı sarılıyor — `flex-wrap` +
 * yüzde genişlik yerine bu, yazı tipi ölçeği büyüdüğünde de hizayı koruyor.
 *
 * Tek sayıda giriş kalırsa son hücre tüm satırı kaplamasın diye boş bir
 * dolgu ekleniyor.
 */
type RecordItem = {
  key: string;
  icon: React.ReactNode;
  tone: Tone;
  title: string;
  subtitle: string;
  /** Ekran okuyucu için uzun hâli — kart üstünde başlık ve alt satır kısaltılmış. */
  label: string;
  onPress: () => void;
};

function RecordGrid({ items }: { items: RecordItem[] }) {
  const rows: RecordItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View className="gap-2">
      {rows.map((row) => (
        <View key={row[0].key} className="flex-row gap-2">
          {row.map((item) => (
            <View key={item.key} className="flex-1">
              <RecordTile item={item} />
            </View>
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

/**
 * Hücre içi YATAY: ikon solda, iki satır yazı sağında.
 *
 * Önce ikon üstte / yazı altında dikey bir kart denendi ve iki satır ızgara
 * ~220 px tutuyordu — listeden az, ama hâlâ ekranın önemli bir kısmı. Yatay
 * düzende aynı bilgi hücre başına ~56 px'e iniyor, çünkü ikonun yüksekliği
 * yazıyla üst üste biniyor, arka arkaya eklenmiyor.
 */
function RecordTile({ item }: { item: RecordItem }) {
  const t = useThemeTokens();
  return (
    <Pressable
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      className={`flex-row items-center rounded-2xl p-3 ${t.cardBg}`}
    >
      <View
        className={`w-8 h-8 rounded-xl items-center justify-center ${toneSoft(item.tone, t.isLight)}`}
      >
        {item.icon}
      </View>
      <View className="flex-1 ml-2.5">
        <Text className={`text-[12px] font-bold ${t.title}`} numberOfLines={1}>
          {item.title}
        </Text>
        <Text className={`text-[10px] mt-0.5 ${t.muted}`} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
