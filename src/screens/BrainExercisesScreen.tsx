import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { BrainCircuit, Zap, Shield, Clock, Wind, Eye, HeartPulse } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

import {
  AppScreen,
  TabHeader,
  Segmented,
  Surface,
  Badge,
  BenefitRow,
  EmptyState,
  toneColor,
  toneSoft,
  type Tone,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import {
  categoriesForTrack,
  DIFFICULTY_LABELS,
  type Difficulty,
  type Exercise,
  type ExerciseCategory,
  type ExerciseTrack,
} from '../data/exercises';
import { MeasureCard, SelfCheckList } from '../components/practice/MeasureTests';
import { findMeasureTest, TEST_POSTURE_SELF_CHECK } from '../data/measureTests';
import { testHistory, useDailyProgress } from '../utils/dailyPracticeProgress';

// Egzersizler sekmesi.
// İki hat: bilişsel (beyin bölgelerine göre) ve fizyolojik (nefes/ses).
// Kartlara dokunulduğunda egzersiz motoru tam ekran açılır.

const DIFFICULTY_TONES: Record<Difficulty, Tone> = {
  kolay: 'emerald',
  orta: 'amber',
  zor: 'rose',
};

const VIOLET = ['#7c3aed', '#c084fc'] as const;

// Beyin görselleri 1024x1024; bölge yolları ve düğme konumları bu ızgaraya göre.
// Koyu tema görseli JPEG — uzantısı gerçek biçimiyle eşleşmeli, yoksa AAPT2
// onu PNG kaynağı sanıp derlemeye çalışıyor ve Android release derlemesi kırılıyor.
const BRAIN_LIGHT = require('../../assets/brain_silhouette_light.png');
const BRAIN_DARK = require('../../assets/brain_background.jpg');

// Harita panelinin oranı ve içindeki kare görselin yerleşimi.
// Görsel panelden biraz taşırılıp ortalanıyor; böylece karedeki boş pay kırpılıyor
// ve beyin paneli dolduruyor. Ölçüler görselden alındı: beyin, 1024'lük karenin
// yatayda ~%73'ünü (137-890), dikeyde ~%63'ünü (197-845) kaplıyor ve ortada duruyor.
// Bu değerlerle beyin panelin yatayda %77'sini, dikeyde %85'ini dolduruyor.
const MAP_RATIO = 0.78; // panel yüksekliği = panel genişliği * MAP_RATIO
const IMAGE_SCALE = 1.05; // kare görselin kenarı = panel genişliği * IMAGE_SCALE
const BUTTON_HEIGHT = 28;

type LobMeta = {
  id: string;
  /** Rehber listesindeki başlık. */
  legend: string;
  description: string;
  /** Harita düğmesinin üstündeki kısa ad. */
  short: string;
  color: string;
  /** Görsel üzerindeki bölge (1024x1024 viewBox). */
  area: string;
  /** Düğmenin merkezi — kare görselin 0-1 aralığında oranı. */
  center: [number, number];
};

const LOBES: LobMeta[] = [
  {
    id: 'frontal',
    legend: 'Ön (Frontal)',
    description: 'Mantık, Karar Verme, Kriz Yönetimi',
    short: 'Ön Lob',
    color: '#3b82f6',
    area:
      'M 552,214 C 488,202 418,216 358,244 C 292,272 230,320 190,376 C 160,420 146,464 152,504 C 160,544 182,574 214,592 C 246,608 278,602 304,586 C 340,556 386,516 430,486 C 456,402 502,302 552,214 Z',
    center: [0.273, 0.41],
  },
  {
    id: 'parietal',
    legend: 'Yan (Parietal)',
    description: 'Mekansal Algı, Sistem Algısı',
    short: 'Yan Lob',
    color: '#10b981',
    area:
      'M 552,214 C 630,212 712,240 780,282 C 758,338 730,398 706,456 C 660,470 610,480 556,488 C 510,494 470,494 430,486 C 456,402 502,302 552,214 Z',
    center: [0.625, 0.293],
  },
  {
    id: 'temporal',
    legend: 'Şakak (Temporal)',
    description: 'Hafıza, Duyma, Anlama ve Dil',
    short: 'Şakak Lobu',
    color: '#f59e0b',
    area:
      'M 304,586 C 340,556 386,516 430,486 C 470,494 510,494 556,488 C 610,480 660,470 706,456 C 724,516 744,586 762,648 C 716,678 646,696 570,700 C 490,704 416,692 360,668 C 322,650 300,614 304,586 Z',
    center: [0.493, 0.586],
  },
  {
    id: 'oksipital',
    legend: 'Arka (Occipital)',
    description: 'Görsel İşleme, Hata Tespiti',
    short: 'Arka Lob',
    color: '#f43f5e',
    area: 'M 780,282 C 818,314 846,364 864,424 C 874,478 866,532 844,580 C 836,624 806,656 762,648 C 744,586 724,516 706,456 C 730,398 758,338 780,282 Z',
    center: [0.776, 0.508],
  },
];

export default function BrainExercisesScreen({ navigation, route }: any) {
  const t = useThemeTokens();
  const paramTrack: ExerciseTrack | undefined = route?.params?.track;
  const hideTrackToggle: boolean = route?.params?.hideTrackToggle ?? false;
  const customTitle: string | undefined = route?.params?.title;
  const customSubtitle: string | undefined = route?.params?.subtitle;

  const [track, setTrack] = React.useState<ExerciseTrack>(paramTrack ?? 'cognitive');
  const [selectedLob, setSelectedLob] = React.useState<string | null>(
    (paramTrack ?? 'cognitive') === 'cognitive' ? 'frontal' : null,
  );

  React.useEffect(() => {
    if (paramTrack) {
      setTrack(paramTrack);
      if (paramTrack === 'physiological') setSelectedLob(null);
      else setSelectedLob('frontal');
    }
  }, [paramTrack]);

  const groups = React.useMemo(() => {
    const all = categoriesForTrack(track);
    if (track === 'cognitive' && selectedLob) {
      return all.filter((g) => g.category.id === selectedLob);
    }
    return all;
  }, [track, selectedLob]);

  const activeLob = LOBES.find((lob) => lob.id === selectedLob);

  const headerTitle =
    customTitle ?? (track === 'physiological' ? 'Mülakat Öncesi Hazırlık' : 'Mülakat Zekâsı');
  const headerSubtitle =
    customSubtitle ??
    (track === 'physiological'
      ? 'Heyecan yatıştırma, nefes ve kamera önü duruş pratikleri.'
      : 'Kriz çözme, teknik terim hatırlama ve baskı altında muhakeme.');

  return (
    <AppScreen
      tabBar
      header={
        <TabHeader
          icon={
            track === 'physiological' ? (
              <HeartPulse size={24} color={toneColor('emerald', t.isLight)} />
            ) : (
              <BrainCircuit size={24} color={t.isLight ? VIOLET[0] : VIOLET[1]} />
            )
          }
          title={headerTitle}
          subtitle={headerSubtitle}
        />
      }
    >
      {!hideTrackToggle && (
        <View className="mt-3">
          <Segmented<ExerciseTrack>
            value={track}
            labelSize={14}
            onChange={(newTrack) => {
              setTrack(newTrack);
              if (newTrack === 'physiological') setSelectedLob(null);
              else setSelectedLob('frontal');
            }}
            tone={track === 'cognitive' ? 'violet' : 'emerald'}
            options={[
              {
                value: 'cognitive',
                label: 'Bilişsel',
                icon: <BrainCircuit size={15} color={t.iconColor} />,
              },
              {
                value: 'physiological',
                label: 'Fizyolojik',
                icon: <HeartPulse size={15} color={t.iconColor} />,
              },
            ]}
          />
        </View>
      )}

      {track === 'cognitive' && (
        <>
          <LobGuideCard />
          <BrainMapCard selectedLob={selectedLob} onSelectLob={setSelectedLob} />
        </>
      )}

      {groups.map(({ category, exercises }) => (
        <View key={category.id} className="mt-6">
          <CategoryHeader category={category} />
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              accent={category.accent}
              onPress={() => navigation.navigate('ExerciseEngine', { exerciseId: exercise.id })}
            />
          ))}
          {/* Duruş öz-kontrolü: egzersizlerin hemen yanında, Karne'deki "Duruş"
              alanının "Ölç" düğmesi de buraya açılır (measureTests.ts). */}
          {category.id === 'durus' ? <PostureSelfCheckCard /> : null}
        </View>
      ))}

      {track === 'cognitive' && groups.length === 0 && activeLob ? (
        <EmptyState
          message={`${activeLob.short} için henüz egzersiz eklenmedi. Haritadan başka bir lob seçebilir veya tüm beyni görüntüleyebilirsiniz.`}
        />
      ) : null}
    </AppScreen>
  );
}

/** Haritanın üstündeki renk/bölge açıklaması. */
function LobGuideCard() {
  const t = useThemeTokens();

  return (
    <Surface className="mt-4">
      <View className="flex-row items-center mb-2">
        <Text className="text-[14px] mr-2">🧠</Text>
        <Text
          className="text-[12px] font-bold uppercase tracking-widest"
          style={{ color: t.isLight ? VIOLET[0] : VIOLET[1] }}
        >
          LOB REHBERİ
        </Text>
      </View>
      <Text className={`text-[12px] leading-5 mb-4 ${t.muted}`}>
        Aşağıdaki haritadan bir loba tıklayarak o bölgeyi geliştirecek egzersizleri görebilirsiniz:
      </Text>

      <View className="gap-3">
        <View className="flex-row">
          <LobLegend lob={LOBES[0]} />
          <LobLegend lob={LOBES[1]} />
        </View>
        <View className="flex-row">
          <LobLegend lob={LOBES[2]} />
          <LobLegend lob={LOBES[3]} />
        </View>
      </View>
    </Surface>
  );
}

function LobLegend({ lob }: { lob: LobMeta }) {
  const t = useThemeTokens();
  return (
    <View className="flex-1 flex-row items-start pr-2">
      <View
        className="w-2.5 h-2.5 rounded-full mt-[5px] mr-2"
        style={{ backgroundColor: lob.color }}
      />
      <View className="flex-1">
        <Text className={`text-[12px] font-bold ${t.title}`}>{lob.legend}</Text>
        <Text className={`text-[11px] leading-4 mt-0.5 ${t.muted}`}>{lob.description}</Text>
      </View>
    </View>
  );
}

function BrainMapCard({
  selectedLob,
  onSelectLob,
}: {
  selectedLob: string | null;
  onSelectLob: (lob: string | null) => void;
}) {
  const t = useThemeTokens();
  const { isLight } = t;
  const allBrain = selectedLob === null;

  // Kare görseli piksel olarak yerleştirebilmek için panel genişliği ölçülüyor.
  const [mapWidth, setMapWidth] = React.useState(0);
  const panelHeight = mapWidth * MAP_RATIO;
  const imageSize = mapWidth * IMAGE_SCALE;
  const imageLeft = (mapWidth - imageSize) / 2;
  const imageTop = (panelHeight - imageSize) / 2;
  // Dört düğme aynı genişlikte olsun; en uzun etiket "Şakak Lobu".
  const buttonWidth = Math.max(86, Math.round(mapWidth * 0.27));

  return (
    <Surface className="mt-4">
      {/* Beyin görseli + üstüne çizilen lob düğmeleri.
          Görsel, SVG ve düğmeler açık piksel ölçüsüyle konumlandırılıyor;
          yüzde/absoluteFill ile Image kendi 1024px boyutunda çizilip taşıyor. */}
      <View
        className="mb-3 overflow-hidden rounded-2xl"
        style={{
          width: '100%',
          aspectRatio: 1 / MAP_RATIO,
          backgroundColor: isLight ? '#f8fafc' : '#0b1424',
        }}
        onLayout={(e) => setMapWidth(e.nativeEvent.layout.width)}
      >
        {mapWidth > 0 ? (
          <>
            {/* Beyin arkada soluk dursun; lob renkleri ve düğmeler öne çıksın. */}
            <Image
              source={isLight ? BRAIN_LIGHT : BRAIN_DARK}
              style={{
                position: 'absolute',
                left: imageLeft,
                top: imageTop,
                width: imageSize,
                height: imageSize,
                opacity: isLight ? 0.45 : 0.6,
              }}
              resizeMode="contain"
            />

            {/* Lob bölgeleri — görselle birebir aynı çerçevede.
                Seçili olmayanlar da soluk dolgu ve kesikli çerçeveyle görünür kalır:
                hem lobun nerede olduğu belli olur hem de bölgenin kendisi tıklanabilir. */}
            <Svg
              width={imageSize}
              height={imageSize}
              viewBox="0 0 1024 1024"
              style={{ position: 'absolute', left: imageLeft, top: imageTop }}
            >
              {LOBES.map((lob) => {
                const active = selectedLob === lob.id;
                return (
                  <Path
                    key={lob.id}
                    d={lob.area}
                    fill={lob.color}
                    fillOpacity={
                      active ? (isLight ? 0.3 : 0.26) : isLight ? 0.1 : 0.14
                    }
                    stroke={lob.color}
                    strokeOpacity={active ? 0.85 : 0.45}
                    strokeWidth={active ? 5 : 3}
                    strokeDasharray={active ? undefined : '14 10'}
                    strokeLinejoin="round"
                    onPress={() => onSelectLob(lob.id)}
                  />
                );
              })}
            </Svg>

            {LOBES.map((lob) => (
              <LobButton
                key={lob.id}
                lob={lob}
                selected={selectedLob === lob.id}
                onPress={() => onSelectLob(lob.id)}
                width={buttonWidth}
                left={imageLeft + lob.center[0] * imageSize - buttonWidth / 2}
                top={imageTop + lob.center[1] * imageSize - BUTTON_HEIGHT / 2}
              />
            ))}
          </>
        ) : null}
      </View>

      {/* Tüm beyni göster */}
      <Pressable
        onPress={() => onSelectLob(null)}
        accessibilityRole="button"
        accessibilityState={{ selected: allBrain }}
        className={`self-center flex-row items-center justify-center px-6 py-3 rounded-full border ${
          allBrain
            ? isLight
              ? 'bg-violet-600 border-violet-600'
              : 'bg-violet-500 border-violet-500'
            : isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#1c1c1f] border-[#2e2e33]'
        }`}
      >
        <BrainCircuit size={17} color={allBrain ? '#ffffff' : isLight ? VIOLET[0] : VIOLET[1]} />
        <Text
          className={`text-[12px] font-bold ml-2 ${allBrain ? 'text-white' : t.body}`}
          style={{ letterSpacing: 1 }}
        >
          TÜM BEYİN
        </Text>
      </Pressable>
    </Surface>
  );
}

/** Görselin üstünde, ilgili lobun merkezine oturan düğme. */
function LobButton({
  lob,
  selected,
  onPress,
  left,
  top,
  width,
}: {
  lob: LobMeta;
  selected: boolean;
  onPress: () => void;
  left: number;
  top: number;
  width: number;
}) {
  const { isLight } = useThemeTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={8}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height: BUTTON_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BUTTON_HEIGHT / 2,
        borderWidth: 1,
        backgroundColor: selected
          ? lob.color
          : isLight
            ? 'rgba(255,255,255,0.92)'
            : 'rgba(10,18,32,0.88)',
        borderColor: selected ? lob.color : isLight ? '#e2e8f0' : '#27344e',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isLight ? 0.14 : 0.45,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          marginRight: 6,
          backgroundColor: selected ? '#ffffff' : lob.color,
        }}
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: selected ? '#ffffff' : isLight ? '#334155' : '#e2e8f0',
        }}
      >
        {lob.short}
      </Text>
    </Pressable>
  );
}

function CategoryHeader({ category }: { category: ExerciseCategory }) {
  const t = useThemeTokens();
  return (
    <View className="flex-row mb-3">
      {/* Sol renk şeridi */}
      <View
        className="w-1 rounded-full mr-3"
        style={{ backgroundColor: toneColor(category.accent, t.isLight) }}
      />
      <View className="flex-1">
        <Text className={`text-[16px] font-bold ${t.title}`}>{category.title}</Text>
        <Text className={`text-[11px] mt-1 leading-5 ${t.muted}`}>{category.description}</Text>
      </View>
    </View>
  );
}

/** Duruş öz-kontrolü — işaretlenen madde sayısı ölçümün kendisi (bkz. `DiaphragmIsolationMeasure`). */
const POSTURE_SELF_CHECK_ITEMS = [
  'Kulaklarım omuz hizasında, öne doğru sarkmıyor.',
  'Omuzlarım öne kapanmış değil, geride ve gevşek duruyor.',
  'Sırtım sandalyenin arkasına yaslı, kambur oturmuyorum.',
  'Ekranın üst kenarı göz hizamda ya da altında.',
  'Ayaklarım yere tam basıyor, kalçam dizlerimden yukarıda değil.',
];

function PostureSelfCheckCard() {
  const { progress, logTest } = useDailyProgress();
  const history = testHistory(progress, TEST_POSTURE_SELF_CHECK);
  const [checked, setChecked] = React.useState<boolean[]>(() =>
    POSTURE_SELF_CHECK_ITEMS.map(() => false),
  );
  // Hiçbir maddeye dokunulmadıysa ölçüm henüz yapılmamış demektir; 0 işaretli
  // olsa bile kullanıcı bir kez dokunduysa bu geçerli bir sonuçtur.
  const [touched, setTouched] = React.useState(false);
  const checkedCount = checked.filter(Boolean).length;

  const toggle = (index: number) => {
    setTouched(true);
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <View className="mt-1">
      <MeasureCard
        test={findMeasureTest(TEST_POSTURE_SELF_CHECK)!}
        history={history}
        value={touched ? checkedCount : null}
        onSave={(value) => logTest(TEST_POSTURE_SELF_CHECK, value)}
        startLabel="Öz-kontrole başla"
        startHint="Aynada ya da telefon kamerasında otururken kendini gör, sonra maddeleri dürüstçe işaretle."
      >
        <SelfCheckList items={POSTURE_SELF_CHECK_ITEMS} checked={checked} onToggle={toggle} />
      </MeasureCard>
    </View>
  );
}

function ExerciseCard({
  exercise,
  accent,
  onPress,
}: {
  exercise: Exercise;
  accent: Tone;
  onPress: () => void;
}) {
  const t = useThemeTokens();
  const isBreath = exercise.engine.kind === 'breath';

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="mb-3">
      <Surface>
        <View className="flex-row items-start">
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${toneSoft(accent, t.isLight)}`}
          >
            {isBreath ? (
              <Shield size={18} color={toneColor(accent, t.isLight)} />
            ) : (
              <Zap size={18} color={toneColor(accent, t.isLight)} />
            )}
          </View>
          <Text className={`text-[15px] font-bold flex-1 pr-2 ${t.title}`}>{exercise.title}</Text>
          <Badge
            label={DIFFICULTY_LABELS[exercise.difficulty]}
            tone={DIFFICULTY_TONES[exercise.difficulty]}
          />
        </View>

        <Text className={`text-[12px] mt-2.5 leading-5 ${t.body}`}>{exercise.description}</Text>

        <View className="flex-row items-center mt-3">
          <Clock size={13} color={t.iconColor} />
          <Text className={`text-[11px] ml-1.5 ${t.muted}`}>{exercise.minutes} dk</Text>
          <View className="w-4" />
          {isBreath ? (
            <Shield size={13} color={t.iconColor} />
          ) : (
            <Zap size={13} color={t.iconColor} />
          )}
          <Text className={`text-[11px] ml-1.5 ${t.muted}`}>{exercise.categoryLabel}</Text>
        </View>

        <View className={`mt-3 pt-1 border-t ${t.dividerColor}`}>
          {exercise.benefits.map((benefit) => (
            <BenefitRow key={benefit} text={benefit} />
          ))}
        </View>
      </Surface>
    </Pressable>
  );
}
