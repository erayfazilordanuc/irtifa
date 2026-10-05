import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Wind, Timer, Award, AlertTriangle, ChartColumn, BookOpen } from 'lucide-react-native';

import {
  ScreenShell,
  Card,
  SectionTitle,
  PrimaryButton,
  GhostButton,
  Chip,
  ProgressBar,
  SettingsButton,
  SettingRow,
  useThemeTokens,
} from '../components/practice/PracticeUI';
import { ModuleSettingsSheet } from '../components/practice/ModuleSettingsSheet';
import { Segmented, toneSoft, toneText } from '../components/AppUI';
import {
  BREATHING_LEVELS,
  BREATHING_MODES,
  PHASE_LABELS,
  flattenProgram,
  getBreathingProgram,
  getSimple46Program,
  programCycleCount,
  type BreathStep,
} from '../data/breathingPrograms';
import {
  useDailyPracticeSettings,
  type BreathingLevel,
  type BreathingMode,
} from '../utils/dailyPracticeSettings';
import {
  TEST_BREATHING_RATE,
  TEST_EXHALE_CONTROL,
  testHistory,
  useDailyProgress,
  type TestResult,
} from '../utils/dailyPracticeProgress';
import { TestTrend } from '../components/practice/TestTrend';
import { MeasureCard, HoldTimer, CountStepper, SelfCheckList } from '../components/practice/MeasureTests';
import {
  findMeasureTest,
  TEST_BREATH_HOLD,
  TEST_CONTROL_PAUSE,
  TEST_SINGLE_BREATH_COUNT,
  TEST_DIAPHRAGM_ISOLATION,
} from '../data/measureTests';
import { formatDuration } from '../utils/dateUtils';

// Günlük diyafram egzersizi.
// Program src/data/breathingPrograms.ts'den gelir; seviye ayarlardan okunur ve buradan da değiştirilebilir.
// Daire nefesle birlikte büyüyüp küçülür: alma fazında genişler, verme fazında daralır, tutma fazlarında sabit kalır.

const CIRCLE_SIZE = Math.min(Dimensions.get('window').width * 0.62, 280);
const MIN_SCALE = 0.55;

export default function DiaphragmExerciseScreen({ navigation, route }: any) {
  const t = useThemeTokens();
  const { settings, updateModule } = useDailyPracticeSettings();
  const { progress, complete, recordExhale, logTest } = useDailyProgress();

  // Karnedeki "Ölç" düğmesi `{ tab: 'olcum' }` ile açar; parametre yoksa eskisi gibi Pratik açılır.
  const [activeTab, setActiveTab] = React.useState<'pratik' | 'olcum' | 'rehber'>(
    route?.params?.tab === 'olcum' ? 'olcum' : 'pratik',
  );
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const mode = settings.diaphragm.mode;
  const level = settings.diaphragm.level;
  // Sade 5 dk · 4-6: ayarlardaki mod/seviyeden bağımsız, tek düğmeyle başlayan
  // ayrı bir preset. Aktifken mod/seviye seçimi devre dışı kalır.
  const [simpleActive, setSimpleActive] = React.useState(false);
  const simple46Program = React.useMemo(() => getSimple46Program(), []);
  const program = React.useMemo(
    () => (simpleActive ? simple46Program : getBreathingProgram(mode, level)),
    [simpleActive, simple46Program, mode, level],
  );
  const steps = React.useMemo<BreathStep[]>(() => flattenProgram(program), [program]);
  // Preset başlatıldığında, program/step sıfırlama efekti çalıştıktan hemen
  // sonra otomatik "Başla" tetiklenir — kullanıcı ikinci kez dokunmasın.
  const pendingAutoStartRef = React.useRef(false);

  const [running, setRunning] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [remaining, setRemaining] = React.useState(steps[0]?.seconds ?? 0);
  const [finished, setFinished] = React.useState(false);

  const deadlineRef = React.useRef<number | null>(null);
  // Sayaç efektinin her tıkta yeniden kurulmaması için kalan süre ayrıca ref'te tutulur.
  const remainingRef = React.useRef(remaining);
  const scale = useSharedValue(MIN_SCALE);

  React.useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const step = steps[stepIndex];
  const totalSeconds = program.totalSeconds;
  const elapsedSeconds = React.useMemo(
    () =>
      steps.slice(0, stepIndex).reduce((sum, s) => sum + s.seconds, 0) +
      ((step?.seconds ?? 0) - remaining),
    [steps, stepIndex, step, remaining],
  );

  /** Fazın hedef ölçeğini, faz süresi boyunca animasyona bağlar. */
  const animatePhase = React.useCallback(
    (kind: BreathStep['kind'], seconds: number) => {
      const target = kind === 'inhale' ? 1 : kind === 'exhale' ? MIN_SCALE : null;
      if (target === null) return; // tutma fazlarında daire sabit kalır
      scale.value = withTiming(target, {
        duration: Math.max(seconds, 0.2) * 1000,
        easing: Easing.inOut(Easing.quad),
      });
    },
    [scale],
  );

  // Seviye/preset değişince programı baştan kur.
  React.useEffect(() => {
    setFinished(false);
    setStepIndex(0);
    setRemaining(steps[0]?.seconds ?? 0);
    deadlineRef.current = null;
    cancelAnimation(scale);
    scale.value = MIN_SCALE;
    if (pendingAutoStartRef.current) {
      // Sade 5 dk kartından "Başlat" ile geldiysek tek dokunuşla seans başlasın.
      pendingAutoStartRef.current = false;
      setRunning(true);
    } else {
      setRunning(false);
    }
  }, [steps, scale]);

  // Sayaç. Sapmayı önlemek için kalan süre bitiş anına göre hesaplanıyor.
  React.useEffect(() => {
    if (!running || finished) return;

    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + remainingRef.current * 1000;
      animatePhase(step.kind, remainingRef.current);
    }

    const id = setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const left = (deadline - Date.now()) / 1000;

      if (left > 0) {
        setRemaining(left);
        return;
      }

      const nextIndex = stepIndex + 1;
      if (nextIndex >= steps.length) {
        clearInterval(id);
        deadlineRef.current = null;
        setRunning(false);
        setFinished(true);
        setRemaining(0);
        complete('diaphragm');
        return;
      }

      const nextStep = steps[nextIndex];
      deadlineRef.current = Date.now() + nextStep.seconds * 1000;
      setStepIndex(nextIndex);
      setRemaining(nextStep.seconds);
      animatePhase(nextStep.kind, nextStep.seconds);
    }, 200);

    return () => clearInterval(id);
  }, [running, finished, stepIndex, steps, step, animatePhase, complete]);

  const start = () => {
    if (finished) {
      setFinished(false);
      setStepIndex(0);
      setRemaining(steps[0].seconds);
      scale.value = MIN_SCALE;
    }
    deadlineRef.current = null;
    setRunning(true);
  };

  const pause = () => {
    cancelAnimation(scale);
    deadlineRef.current = null;
    setRunning(false);
  };

  const reset = () => {
    cancelAnimation(scale);
    deadlineRef.current = null;
    setRunning(false);
    setFinished(false);
    setStepIndex(0);
    setRemaining(steps[0]?.seconds ?? 0);
    scale.value = MIN_SCALE;
  };

  /** Sade 5 dk · 4-6 kartındaki "Başlat" — tek dokunuşla preset'e geçer ve seansı başlatır. */
  const startSimple46 = () => {
    pendingAutoStartRef.current = true;
    setSimpleActive(true);
  };

  /** Sade 5 dk · 4-6'dan çıkıp ayarlardaki mod/seviyeye döner. */
  const exitSimple46 = () => {
    pendingAutoStartRef.current = false;
    setSimpleActive(false);
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const moduleProgress = progress.modules.diaphragm;
  // Bu preset'te bitiş metni "Program tamamlandı." yerine döngü sayısı bildirir.
  const finishedText = program.announceCycleCount
    ? `${programCycleCount(program)} döngü tamamlandı.`
    : 'Program tamamlandı. Nefesini normale bırak.';
  const showReminder =
    !finished && !!step?.reminderEvery && !!step.tip && step.cycleIndex % step.reminderEvery === 0;

  return (
    <ScreenShell
      title="Diyafram Egzersizi"
      subtitle={`${program.title} · ${program.durationLabel}`}
      onClose={() => navigation?.goBack?.()}
      right={<SettingsButton onPress={() => setSettingsOpen(true)} />}
      footer={
        activeTab === 'pratik' ? (
          <View className="gap-2">
            {running ? (
              <PrimaryButton label="Duraklat" onPress={pause} tone="slate" />
            ) : (
              <PrimaryButton label={finished ? 'Tekrar Başla' : 'Başla'} onPress={start} />
            )}
            {stepIndex > 0 || finished ? <GhostButton label="Sıfırla" onPress={reset} /> : null}
          </View>
        ) : null
      }
    >
      {/* 3 Sekmeli Odak Mimarisi */}
      <View className="mt-1 mb-3">
        <Segmented<'pratik' | 'olcum' | 'rehber'>
          value={activeTab}
          onChange={setActiveTab}
          // İkonlar nötr tonda: seçili sekmeyi zaten beyaz kapsül ve yazı rengi
          // gösteriyor, ikonu da renklendirmek sekmeyi gürültülü yapıyordu.
          options={[
            { value: 'pratik', label: 'Pratik', icon: <Wind size={14} color={t.iconColor} /> },
            { value: 'olcum', label: 'Ölçüm', icon: <ChartColumn size={14} color={t.iconColor} /> },
            { value: 'rehber', label: 'Rehber', icon: <BookOpen size={14} color={t.iconColor} /> },
          ]}
        />
      </View>

      {/* 🏋️ PRATİK SEKMESİ (Varsayılan) */}
      {activeTab === 'pratik' ? (
        <>
          {/* Sade 5 dk · 4-6: tek düğmeyle başlayan, süslemesiz seans */}
          {!simpleActive ? (
            <Card className="mt-1 mb-3 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className={`text-[13px] font-bold ${t.title}`}>Sade 5 dk · 4-6</Text>
                <Text className={`text-[11px] mt-0.5 ${t.muted}`}>
                  Tek dokunuşla başlar · 30 döngü, sabit ritim
                </Text>
              </View>
              <Pressable
                onPress={startSimple46}
                className={`px-3 py-1.5 rounded-xl ${toneSoft('emerald', t.isLight)}`}
                accessibilityRole="button"
                accessibilityLabel="Sade 5 dakikalık 4-6 nefes seansını başlat"
              >
                <Text className={`text-[12px] font-bold ${toneText('emerald', t.isLight)}`}>
                  Başlat
                </Text>
              </Pressable>
            </Card>
          ) : (
            <Card className="mt-1 mb-3 flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text className={`text-[13px] font-bold ${t.title}`}>Sade 5 dk · 4-6 aktif</Text>
                <Text className={`text-[11px] mt-0.5 ${t.muted}`}>30 döngü · 4 sn al · 6 sn ver</Text>
              </View>
              <Pressable
                onPress={exitSimple46}
                className={`px-3 py-1.5 rounded-xl border ${t.cardBorder}`}
                accessibilityRole="button"
                accessibilityLabel="Sade seanstan çık, ayarlı programa dön"
              >
                <Text className={`text-[12px] font-bold ${t.muted}`}>Çık</Text>
              </Pressable>
            </Card>
          )}

          {/* Mod ve seviye seçimi — Sade 5 dk aktifken gizli */}
          {!simpleActive ? (
            <>
              <View className="mt-1">
                <Segmented<BreathingMode>
                  value={mode}
                  onChange={(next) => updateModule('diaphragm', { mode: next })}
                  options={BREATHING_MODES.map((m) => ({ value: m.value, label: m.label }))}
                />
                <Text className={`text-[11px] leading-4 mt-2 ${t.muted}`}>
                  {BREATHING_MODES.find((m) => m.value === mode)?.description}
                </Text>
              </View>

              {mode === 'progressive' ? (
                <View className="flex-row flex-wrap mt-3">
                  {BREATHING_LEVELS.map((lvl) => (
                    <Chip
                      key={lvl}
                      label={`Seviye ${lvl}`}
                      selected={lvl === level}
                      onPress={() => updateModule('diaphragm', { level: lvl })}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : null}

          {/* Nefes dairesi */}
          <View className="items-center justify-center my-4" style={{ height: CIRCLE_SIZE + 24 }}>
            <View
              className={`absolute rounded-full border-2 ${t.isLight ? 'border-blue-200' : 'border-blue-900'}`}
              style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }}
            />
            <Animated.View
              style={[
                {
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  borderRadius: CIRCLE_SIZE / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: t.isLight ? 'rgba(37,99,235,0.10)' : 'rgba(59,130,246,0.18)',
                  borderWidth: 2,
                  borderColor: t.isLight ? 'rgba(37,99,235,0.35)' : 'rgba(96,165,250,0.45)',
                },
                circleStyle,
              ]}
            >
              <Text className={`text-5xl font-bold ${t.accent}`}>{Math.ceil(remaining)}</Text>
              <Text className={`text-[14px] font-bold mt-1 ${t.title}`}>
                {finished ? 'Bitti' : PHASE_LABELS[step.kind]}
              </Text>
            </Animated.View>
          </View>

          {/* O anki komut */}
          <Card className="mb-2">
            <View className="flex-row items-center mb-2">
              <Wind size={16} color={t.isLight ? '#2563eb' : '#60a5fa'} />
              <Text className={`text-[11px] font-bold uppercase tracking-widest ml-2 ${t.muted}`}>
                {step.segmentTitle} · {step.cycleIndex}/{step.cycleCount}
              </Text>
            </View>
            <Text className={`text-[15px] font-bold leading-6 ${t.title}`}>
              {finished ? finishedText : step.cue}
            </Text>
            {showReminder ? (
              <Text className={`text-[12px] mt-2 italic ${t.accent}`}>{step.tip}</Text>
            ) : null}
            <View className="mt-4">
              <ProgressBar value={totalSeconds === 0 ? 0 : elapsedSeconds / totalSeconds} />
              <Text className={`text-[11px] mt-2 ${t.muted}`}>
                {formatDuration(Math.max(elapsedSeconds, 0))} / {formatDuration(totalSeconds)}
              </Text>
            </View>
          </Card>
        </>
      ) : null}

      {/* 📊 ÖLÇÜM SEKMESİ */}
      {activeTab === 'olcum' ? (
        <>
          <SectionTitle hint="Düğmeye basılı tutarken tek nefeste sabit bir 'sss' sesi çıkarın; nefesiniz bitince bırakın.">
            Kontrollü Veriş Süresi
          </SectionTitle>
          <ExhaleCapacityTest
            best={progress.longestExhaleSeconds}
            history={testHistory(progress, TEST_EXHALE_CONTROL)}
            onResult={(seconds) => recordExhale(seconds)}
          />

          <SectionTitle hint="Bir dakika boyunca normal nefes alın ve her nefes ALIŞINDA düğmeye dokunun. Nefesinizi bilerek yavaşlatmayın — ölçüm ancak doğal olduğunda anlamlı.">
            Dinlenik Solunum Hızı
          </SectionTitle>
          <BreathingRateTest
            history={testHistory(progress, TEST_BREATHING_RATE)}
            onResult={(breaths) => logTest(TEST_BREATHING_RATE, breaths)}
          />

          <BreathHoldMeasure
            history={testHistory(progress, TEST_BREATH_HOLD)}
            onSave={(seconds) => logTest(TEST_BREATH_HOLD, seconds)}
          />

          <ControlPauseMeasure
            history={testHistory(progress, TEST_CONTROL_PAUSE)}
            onSave={(seconds) => logTest(TEST_CONTROL_PAUSE, seconds)}
          />

          <SingleBreathCountMeasure
            history={testHistory(progress, TEST_SINGLE_BREATH_COUNT)}
            onSave={(count) => logTest(TEST_SINGLE_BREATH_COUNT, count)}
          />

          <DiaphragmIsolationMeasure
            history={testHistory(progress, TEST_DIAPHRAGM_ISOLATION)}
            onSave={(count) => logTest(TEST_DIAPHRAGM_ISOLATION, count)}
          />
        </>
      ) : null}

      {/* 📘 REHBER SEKMESİ */}
      {activeTab === 'rehber' ? (
        <>
          {/* Program içeriği */}
          <SectionTitle>Program</SectionTitle>
          {program.segments.map((segment) => (
            <Card key={segment.id} className="mb-3">
              <Text className={`text-[13px] font-bold ${t.title}`}>{segment.title}</Text>
              <Text className={`text-[11px] mt-1 leading-5 ${t.body}`}>{segment.description}</Text>
              <Text className={`text-[11px] mt-2 ${t.muted}`}>
                {segment.cycles} tur ·{' '}
                {segment.phases.map((p) => `${PHASE_LABELS[p.kind]} ${p.seconds}s`).join(' → ')}
              </Text>
              {segment.tip ? (
                <Text className={`text-[11px] mt-2 italic ${t.accent}`}>{segment.tip}</Text>
              ) : null}
            </Card>
          ))}

          {/* Neden yapıyoruz — sade preset'te motivasyon cümlesi yok, benefits boş */}
          {program.benefits.length > 0 ? (
            <>
              <SectionTitle>Ne Kazandırır</SectionTitle>
              <Card>
                {program.benefits.map((benefit) => (
                  <View key={benefit} className="flex-row mb-2">
                    <Text className={`text-[12px] mr-2 ${t.accent}`}>•</Text>
                    <Text className={`text-[12px] flex-1 leading-5 ${t.body}`}>{benefit}</Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          {/* Güvenlik uyarısı */}
          <Card className="mt-3">
            <View className="flex-row">
              <AlertTriangle size={16} color={t.isLight ? '#d97706' : '#fbbf24'} />
              <Text className={`text-[11px] ml-2 flex-1 leading-5 ${t.body}`}>
                {program.safetyNote}
              </Text>
            </View>
          </Card>

          {/* Seri */}
          <Card className="mt-3 mb-2">
            <View className="flex-row items-center">
              <Award size={16} color={t.isLight ? '#059669' : '#34d399'} />
              <Text className={`text-[12px] font-bold ml-2 ${t.title}`}>
                {moduleProgress.streak} günlük seri
              </Text>
              <Text className={`text-[11px] ml-auto ${t.muted}`}>
                En iyi: {moduleProgress.bestStreak} · Toplam: {moduleProgress.totalSessions}
              </Text>
            </View>
          </Card>
        </>
      ) : null}

      <ModuleSettingsSheet module="diaphragm" visible={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <SettingRow
          title="Çalışma Biçimi"
          description="Günlük: kısa bakım programı · Gelişim: seviyeli uzun program"
          right={<View />}
        />
        <View className="flex-row flex-wrap">
          {BREATHING_MODES.map((m) => (
            <Chip
              key={m.value}
              label={m.label}
              selected={mode === m.value}
              onPress={() => updateModule('diaphragm', { mode: m.value })}
            />
          ))}
        </View>

        {mode === 'progressive' ? (
          <>
            <SettingRow
              title="Seviye"
              description="1: farkındalık · 2: kontrollü nefes · 3: mülakat baskısı"
              right={<View />}
            />
            <View className="flex-row flex-wrap">
              {BREATHING_LEVELS.map((lvl: BreathingLevel) => (
                <Chip
                  key={lvl}
                  label={`Seviye ${lvl}`}
                  selected={lvl === level}
                  onPress={() => updateModule('diaphragm', { level: lvl })}
                />
              ))}
            </View>
          </>
        ) : null}
      </ModuleSettingsSheet>
    </ScreenShell>
  );
}

/**
 * Bas-bırak ile nefes verme süresini ölçer. Ses analizi yapmadan, kullanıcının
 * kendi dokunuşuyla ölçüm sağlar; sonuç kişisel rekor olarak saklanır.
 */
function ExhaleCapacityTest({
  best,
  history,
  onResult,
}: {
  best: number;
  history: TestResult[];
  onResult: (seconds: number) => void;
}) {
  const t = useThemeTokens();
  const [elapsed, setElapsed] = React.useState(0);
  const [holding, setHolding] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<number | null>(null);
  const startedAt = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!holding) return;
    const id = setInterval(() => {
      if (startedAt.current !== null) {
        setElapsed((Date.now() - startedAt.current) / 1000);
      }
    }, 100);
    return () => clearInterval(id);
  }, [holding]);

  const onPressIn = () => {
    startedAt.current = Date.now();
    setElapsed(0);
    setHolding(true);
  };

  const onPressOut = () => {
    if (startedAt.current === null) return;
    const seconds = (Date.now() - startedAt.current) / 1000;
    startedAt.current = null;
    setHolding(false);
    setElapsed(seconds);
    // 2 saniyenin altındaki dokunuşlar kazara sayılır.
    if (seconds >= 2) {
      setLastResult(seconds);
      onResult(seconds);
    }
  };

  const display = holding ? elapsed : (lastResult ?? 0);

  return (
    <Card>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel="Kontrollü veriş süresi ölçümü için basılı tutun"
        className={`rounded-2xl py-6 items-center justify-center border-2 ${
          holding
            ? t.isLight
              ? 'bg-blue-50 border-blue-400'
              : 'bg-blue-950 border-blue-500'
            : t.cardBorder
        }`}
      >
        <Timer size={20} color={t.isLight ? '#2563eb' : '#60a5fa'} />
        <Text className={`text-[26px] font-black mt-2 ${t.title}`}>{display.toFixed(1)}s</Text>
        <Text className={`text-[11px] mt-1 ${t.muted}`}>
          {holding ? 'Nefesin bitince bırak' : 'Basılı tut ve "sss" de'}
        </Text>
      </Pressable>
      <View className={`flex-row justify-between mt-3 pt-3 border-t ${t.dividerColor}`}>
        <Text className={`text-[11px] ${t.muted}`}>Kişisel rekor</Text>
        <Text className={`text-[11px] font-bold ${t.title}`}>{best}s</Text>
      </View>

      <TestTrend history={history} unit="s" decimals={1} improvement="higher" />

      <Text className={`text-[11px] mt-3 leading-4 ${t.muted}`}>
        Karşılaştırma ancak benzer koşullarda anlamlı: aynı saat, oturur pozisyon, tok karnına
        değil. Bu bir öz-ölçüm; klinik bir değer değildir.
      </Text>
    </Card>
  );
}

const BREATHING_RATE_WINDOW = 60;

/**
 * Dinlenik solunum hızı: 60 saniye boyunca her nefes ALIŞINDA dokunma.
 *
 * Pencere tam 60 saniye olduğu için dokunma sayısı doğrudan nefes/dakika demek;
 * ayrıca bir hesap yapılmıyor. Sayaç mikrofonla değil dokunuşla çalışıyor —
 * nefes sesini eşiklemek gürültülü ortamda güvenilmez sonuç veriyor.
 */
function BreathingRateTest({
  history,
  onResult,
}: {
  history: TestResult[];
  onResult: (breaths: number) => void;
}) {
  const t = useThemeTokens();
  const [running, setRunning] = React.useState(false);
  const [remaining, setRemaining] = React.useState(BREATHING_RATE_WINDOW);
  const [count, setCount] = React.useState(0);
  const [lastResult, setLastResult] = React.useState<number | null>(null);

  const deadlineRef = React.useRef<number | null>(null);
  // Sayaç efekti her tıkta yeniden kurulmasın diye sayım ayrıca ref'te tutuluyor.
  const countRef = React.useRef(0);

  React.useEffect(() => {
    countRef.current = count;
  }, [count]);

  React.useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const left = (deadline - Date.now()) / 1000;
      if (left > 0) {
        setRemaining(left);
        return;
      }

      clearInterval(id);
      deadlineRef.current = null;
      setRunning(false);
      setRemaining(0);

      const total = countRef.current;
      setLastResult(total);
      // Hiç dokunulmamışsa ölçüm sayılmaz — kazara başlatma kaydı kirletmesin.
      if (total > 0) onResult(total);
    }, 200);

    return () => clearInterval(id);
  }, [running, onResult]);

  const start = () => {
    setCount(0);
    countRef.current = 0;
    setLastResult(null);
    setRemaining(BREATHING_RATE_WINDOW);
    deadlineRef.current = Date.now() + BREATHING_RATE_WINDOW * 1000;
    setRunning(true);
  };

  const cancel = () => {
    deadlineRef.current = null;
    setRunning(false);
    setRemaining(BREATHING_RATE_WINDOW);
    setCount(0);
  };

  const display = running ? count : (lastResult ?? 0);

  return (
    <Card>
      <Pressable
        onPress={() => running && setCount((c) => c + 1)}
        disabled={!running}
        accessibilityRole="button"
        accessibilityLabel="Her nefes alışında dokunun"
        className={`rounded-2xl py-6 items-center justify-center border-2 ${
          running
            ? t.isLight
              ? 'bg-blue-50 border-blue-400'
              : 'bg-blue-950 border-blue-500'
            : t.cardBorder
        }`}
      >
        <Wind size={20} color={t.isLight ? '#2563eb' : '#60a5fa'} />
        <Text className={`text-[26px] font-black mt-2 ${t.title}`}>{display}</Text>
        <Text className={`text-[11px] mt-1 ${t.muted}`}>
          {running
            ? `Her alışta dokun · ${Math.ceil(remaining)} sn`
            : lastResult !== null
              ? 'nefes/dakika'
              : 'Başlat ve her nefes alışında dokun'}
        </Text>
      </Pressable>

      <View className="mt-3">
        {running ? (
          <GhostButton label="Vazgeç" onPress={cancel} />
        ) : (
          <PrimaryButton label={lastResult !== null ? 'Tekrar Ölç' : 'Başlat'} onPress={start} />
        )}
      </View>

      <TestTrend history={history} unit="nefes/dk" decimals={0} improvement="none" />

      <Text className={`text-[11px] mt-3 leading-4 ${t.muted}`}>
        Yetişkinde dinlenik aralık kabaca 12-20 nefes/dakikadır, ama bu bir tanı ölçütü
        değil. Anlamlı olan tek şey kendi ölçümlerinin zaman içindeki seyri.
      </Text>
    </Card>
  );
}

/** Tam nefes al, rahatça tutabildiğin kadar tut. `HoldTimer` süreyi ölçer, kayıt `MeasureCard`'a bırakılır. */
function BreathHoldMeasure({
  history,
  onSave,
}: {
  history: TestResult[];
  onSave: (seconds: number) => void;
}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <MeasureCard
      test={findMeasureTest(TEST_BREATH_HOLD)!}
      history={history}
      value={value}
      onSave={onSave}
    >
      <HoldTimer
        onResult={setValue}
        startLabel="Tam al ve tut"
        stopLabel="Bıraktım"
        running="Rahatsızlık başlayınca bırak."
      />
    </MeasureCard>
  );
}

/** Normal verişten sonra ilk nefes ihtiyacına kadar geçen süre. */
function ControlPauseMeasure({
  history,
  onSave,
}: {
  history: TestResult[];
  onSave: (seconds: number) => void;
}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <MeasureCard
      test={findMeasureTest(TEST_CONTROL_PAUSE)!}
      history={history}
      value={value}
      onSave={onSave}
    >
      <HoldTimer
        onResult={setValue}
        startLabel="Normal verişten sonra başlat"
        stopLabel="İlk nefes ihtiyacı"
        running="Dayanma; ilk gerçek nefes ihtiyacında bitir."
      />
    </MeasureCard>
  );
}

/** Tek nefeste sabit tempoda kaça kadar sayıldığı. Sayaç 0'dayken kayıt kirlenmesin diye değer null kalır. */
function SingleBreathCountMeasure({
  history,
  onSave,
}: {
  history: TestResult[];
  onSave: (count: number) => void;
}) {
  const [count, setCount] = React.useState(0);

  return (
    <MeasureCard
      test={findMeasureTest(TEST_SINGLE_BREATH_COUNT)!}
      history={history}
      value={count > 0 ? count : null}
      onSave={onSave}
      startLabel="Ölçüme başla"
      startHint="Tam bir nefes al, sabit tempoda saymaya başla; nefesin bitince kaçta kaldığını gir."
    >
      <CountStepper value={count} onChange={setCount} unit="sayı" min={0} max={200} />
    </MeasureCard>
  );
}

/** Diyafram izolasyonu öz-kontrolü — işaretlenen madde sayısı ölçümün kendisi. */
const DIAPHRAGM_ISOLATION_ITEMS = [
  'Nefes alırken karnım göğsümden önce ve daha çok hareket ediyor.',
  'Omuzlarım nefes alırken yukarı kalkmıyor.',
  'Verirken karnım yavaşça içeri giriyor, göğsüm çökmüyor.',
  'Sırtüstü uzanırken karnımdaki el göğsümdekinden fazla hareket ediyor.',
  'Konuşurken cümle sonuna doğru nefesim yetiyor, son kelimeler cılızlaşmıyor.',
];

function DiaphragmIsolationMeasure({
  history,
  onSave,
}: {
  history: TestResult[];
  onSave: (count: number) => void;
}) {
  const [checked, setChecked] = React.useState<boolean[]>(() =>
    DIAPHRAGM_ISOLATION_ITEMS.map(() => false),
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
    <MeasureCard
      test={findMeasureTest(TEST_DIAPHRAGM_ISOLATION)!}
      history={history}
      value={touched ? checkedCount : null}
      onSave={onSave}
      startLabel="Öz-kontrole başla"
      startHint="Bir elini göğsüne, birini karnına koy; sonra maddeleri dürüstçe işaretle."
    >
      <SelfCheckList items={DIAPHRAGM_ISOLATION_ITEMS} checked={checked} onToggle={toggle} />
    </MeasureCard>
  );
}
