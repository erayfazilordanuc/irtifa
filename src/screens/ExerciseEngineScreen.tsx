import React from 'react';
import { View, Text, Dimensions, TextInput, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { RotateCcw, Check } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  ActionButton,
  toneColor,
  toneSoft,
  toneText,
  type Tone,
} from '../components/AppUI';
import { ProgressBar, useThemeTokens } from '../components/practice/PracticeUI';
import {
  BREATH_PHASE_LABELS,
  getCategory,
  getExercise,
  totalSteps,
  type BreathPhaseKind,
  type Exercise,
} from '../data/exercises';
import { addExerciseLog } from '../utils/exerciseHistory';
import { formatDuration } from '../utils/dateUtils';
import { answersMatch } from '../utils/text';
import { addResponse } from '../utils/responseHistory';
import { findMeasureTest, TEST_BREATH_HOLD } from '../data/measureTests';

// Egzersiz motoru: katalogdaki her egzersiz "prompt" (zamanlı komut kartları) ya da
// "breath" (nefes düzenleyici) motorunu bildirir. Bu ekran ikisini de çalıştırır.
//
// Efor puanı tamamlanan adım oranından hesaplanır; yarıda bırakılan egzersiz de kaydedilir.

const CIRCLE_SIZE = Math.min(Dimensions.get('window').width * 0.58, 260);
const MIN_SCALE = 0.55;

/** ProgressBar yalnızca üç ton biliyor; kategori vurgusunu en yakınına eşliyoruz. */
const PROGRESS_TONE: Record<Tone, 'blue' | 'violet' | 'emerald'> = {
  blue: 'blue',
  violet: 'violet',
  emerald: 'emerald',
  amber: 'blue',
  rose: 'violet',
  slate: 'blue',
};

// "Rahat Tutma" egzersizleri bitince nefes tutma ölçümüne isteğe bağlı
// yönlendirme gösterilir (YAPILACAKLAR Bölüm 1 → "Nefesi daha uzun tutma" →
// açık kalanlar). Sadece bu iki egzersizde: diğerlerinin bitişi değişmiyor.
const BREATH_HOLD_SUGGESTION_IDS = new Set(['rahat-tutma-hazirlik', 'rahat-tutma-gelistirme']);

/** Nefes fazlarını tek bir adım listesine açar. */
type BreathStep = { kind: BreathPhaseKind; seconds: number; cycle: number };

function flattenBreath(exercise: Exercise): BreathStep[] {
  if (exercise.engine.kind !== 'breath') return [];
  const steps: BreathStep[] = [];
  for (let cycle = 1; cycle <= exercise.engine.cycles; cycle += 1) {
    for (const phase of exercise.engine.phases) {
      steps.push({ kind: phase.kind, seconds: phase.seconds, cycle });
    }
  }
  return steps;
}

export default function ExerciseEngineScreen({ navigation, route }: any) {
  const t = useThemeTokens();
  const exercise = getExercise(route?.params?.exerciseId);

  if (!exercise) {
    return (
      <AppScreen header={<AppHeader title="Egzersiz" onBack={() => navigation.goBack()} backIcon="close" />}>
        <Surface className="mt-4">
          <Text className={`text-[12px] ${t.body}`}>Egzersiz bulunamadı.</Text>
        </Surface>
      </AppScreen>
    );
  }

  return <Engine exercise={exercise} navigation={navigation} />;
}

function Engine({ exercise, navigation }: { exercise: Exercise; navigation: any }) {
  const t = useThemeTokens();
  const category = getCategory(exercise.categoryId);
  const accent: Tone = category?.accent ?? 'violet';

  const steps = React.useMemo(
    () => (exercise.engine.kind === 'breath' ? flattenBreath(exercise) : []),
    [exercise],
  );
  const stepCount =
    exercise.engine.kind === 'prompt' ? exercise.engine.prompts.length : steps.length;
  const stepSeconds = (index: number) =>
    exercise.engine.kind === 'prompt' ? exercise.engine.secondsPerPrompt : (steps[index]?.seconds ?? 0);

  const [running, setRunning] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [remaining, setRemaining] = React.useState(() => stepSeconds(0));
  const [finished, setFinished] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [saved, setSaved] = React.useState(false);

  // Cevaplı adımlarda mevcut adımın yazı girişi ve kontrol sonucu. `revealed`
  // burada da kullanılıyor: kontrol edilmeden (ya da süre dolmadan) cevap
  // görünmesin diye aynı durum hem "cevap gösterildi mi" hem "kontrol edildi
  // mi" anlamına geliyor. Adım değişince hepsi sıfırlanır (bkz. resetStepState).
  const [answerText, setAnswerText] = React.useState('');
  const [correctFlag, setCorrectFlag] = React.useState<boolean | undefined>(undefined);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [checkedCount, setCheckedCount] = React.useState(0);

  const deadlineRef = React.useRef<number | null>(null);
  const remainingRef = React.useRef(remaining);
  // Geçerli adımın yanıtı deftere zaten yazıldı mı? Zamanlayıcı ile elle
  // "Kontrol Et"/öz-değerlendirme çakışıp aynı yanıtı iki kez kaydetmesin diye.
  const committedRef = React.useRef(false);
  const answerTextRef = React.useRef(answerText);
  React.useEffect(() => {
    answerTextRef.current = answerText;
  }, [answerText]);
  const scale = useSharedValue(MIN_SCALE);

  React.useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  /** Nefes fazının hedef ölçeğini faz süresi boyunca animasyona bağlar. */
  const animatePhase = React.useCallback(
    (kind: BreathPhaseKind, seconds: number) => {
      const target = kind === 'inhale' ? 1 : kind === 'exhale' ? MIN_SCALE : null;
      if (target === null) return; // tutma / bekleme fazlarında daire sabit kalır
      scale.value = withTiming(target, {
        duration: Math.max(seconds, 0.2) * 1000,
        easing: Easing.inOut(Easing.quad),
      });
    },
    [scale],
  );

  /** Geçerli adımın yanıtını yanıt defterine yazar ve doğru/kontrol sayaçlarını günceller. */
  const commitAnswer = React.useCallback(
    (promptItem: { text: string; answer?: string }, rawAnswer: string, correct: boolean | undefined) => {
      if (committedRef.current) return;
      const trimmed = rawAnswer.trim();
      if (trimmed.length === 0) return;
      committedRef.current = true;
      addResponse({
        module: 'exercise',
        refId: exercise.id,
        title: exercise.title,
        prompt: promptItem.text,
        answer: trimmed,
        kind: 'text',
        correct,
        expected: promptItem.answer,
      });
      if (typeof correct === 'boolean') {
        setCheckedCount((count) => count + 1);
        if (correct) setCorrectCount((count) => count + 1);
      }
    },
    [exercise],
  );

  /** "Kontrol Et": accept varsa otomatik karar verir, yoksa cevabı açıp öz-değerlendirmeye bırakır. */
  const handleCheck = React.useCallback(() => {
    if (exercise.engine.kind !== 'prompt') return;
    const promptItem = exercise.engine.prompts[index];
    if (!promptItem?.answer) return;
    const trimmed = answerText.trim();
    if (trimmed.length === 0) return;
    setRevealed(true);
    if (promptItem.accept && promptItem.accept.length > 0) {
      const isCorrect = answersMatch(trimmed, promptItem.accept);
      setCorrectFlag(isCorrect);
      commitAnswer(promptItem, trimmed, isCorrect);
    }
  }, [exercise, index, answerText, commitAnswer]);

  /** Öz-değerlendirme düğmeleri ("Doğru bildim" / "Bilemedim"). */
  const handleSelfAssess = React.useCallback(
    (correct: boolean) => {
      if (exercise.engine.kind !== 'prompt') return;
      const promptItem = exercise.engine.prompts[index];
      if (!promptItem?.answer) return;
      setCorrectFlag(correct);
      commitAnswer(promptItem, answerText, correct);
    },
    [exercise, index, answerText, commitAnswer],
  );

  /**
   * Adım kapanırken (süre dolunca ya da erken bitirilince) çalışır: kontrol
   * edilmemiş ama yazılmış bir yanıt varsa kaydeder — "Kontrol Et"e hiç
   * basılmadan süre dolarsa yazılan emek kaybolmasın diye. `accept` varsa
   * otomatik karar verilir; yoksa doğru/yanlış damgası vurulmadan (öz-
   * değerlendirme yapılmadığı için) yalnızca deftere yazılır.
   */
  const commitPendingOnLeave = React.useCallback((): { correct?: boolean } => {
    if (exercise.engine.kind !== 'prompt') return {};
    const promptItem = exercise.engine.prompts[index];
    if (!promptItem?.answer) return {};
    if (committedRef.current) return {};
    const trimmed = answerTextRef.current.trim();
    if (trimmed.length === 0) return {};
    const correct =
      promptItem.accept && promptItem.accept.length > 0
        ? answersMatch(trimmed, promptItem.accept)
        : undefined;
    commitAnswer(promptItem, trimmed, correct);
    return { correct };
  }, [exercise, index, commitAnswer]);

  /** Bir sonraki adıma geçmeden önce mevcut adımın yazı/kontrol durumunu sıfırlar. */
  const resetStepState = React.useCallback(() => {
    setAnswerText('');
    setRevealed(false);
    setCorrectFlag(undefined);
    committedRef.current = false;
  }, []);

  // Sayaç. Sapmayı önlemek için kalan süre bitiş anına göre hesaplanıyor.
  React.useEffect(() => {
    if (!running || finished) return;

    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + remainingRef.current * 1000;
      if (exercise.engine.kind === 'breath' && steps[index]) {
        animatePhase(steps[index].kind, remainingRef.current);
      }
    }

    const id = setInterval(() => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const left = (deadline - Date.now()) / 1000;

      if (left > 0) {
        setRemaining(left);
        return;
      }

      // Süre dolarken kontrol edilmemiş ama yazılmış bir yanıt varsa adım
      // kapanmadan kaydedilir — yazılan emek kaybolmasın diye.
      commitPendingOnLeave();
      setRevealed(true);

      const next = index + 1;
      setElapsed((value) => value + stepSeconds(index));

      if (next >= stepCount) {
        clearInterval(id);
        deadlineRef.current = null;
        setRunning(false);
        setFinished(true);
        setRemaining(0);
        return;
      }

      deadlineRef.current = Date.now() + stepSeconds(next) * 1000;
      setIndex(next);
      setRemaining(stepSeconds(next));
      resetStepState();
      if (exercise.engine.kind === 'breath' && steps[next]) {
        animatePhase(steps[next].kind, steps[next].seconds);
      }
    }, 200);

    return () => clearInterval(id);
    // stepSeconds, stepCount, commitPendingOnLeave ve resetStepState, exercise/index'e
    // bağlı olduğu için bağımlılıklara ayrıca eklenmiyor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, finished, index, steps, exercise, animatePhase, stepCount]);

  const completedSteps = finished ? stepCount : index;
  const effort = stepCount === 0 ? 0 : Math.round((completedSteps / stepCount) * 100);

  /**
   * Kaydı yazar; hem tamamlanınca hem erken bitirince çağrılır.
   *
   * `overrideCorrect`/`overrideChecked`: erken bitirmede (`finishEarly`) aynı
   * anda hem bekleyen yanıt kaydedilip hem kayıt yazıldığından, state henüz
   * güncellenmemiş olabilir (React state güncellemeleri eşzamansız) — bu
   * yüzden güncel sayı doğrudan çağıran tarafından veriliyor.
   */
  const save = React.useCallback(
    (overrideCorrect?: number, overrideChecked?: number) => {
      if (saved) return;
      setSaved(true);
      const finalCorrect = overrideCorrect ?? correctCount;
      const finalChecked = overrideChecked ?? checkedCount;
      addExerciseLog({
        id: `exercise-${Date.now()}`,
        exerciseId: exercise.id,
        title: exercise.title,
        categoryLabel: exercise.categoryLabel,
        track: category?.track ?? 'cognitive',
        durationSeconds: Math.max(Math.round(elapsed), 1),
        effort,
        timestamp: new Date().toISOString(),
        correctCount: finalCorrect,
        checkedCount: finalChecked,
        summary:
          finalChecked > 0
            ? `${completedSteps}/${stepCount} adım tamamlandı · ${finalCorrect}/${finalChecked} doğru`
            : `${completedSteps}/${stepCount} adım tamamlandı.`,
      });
    },
    [saved, exercise, category, elapsed, effort, completedSteps, stepCount, correctCount, checkedCount],
  );

  // Egzersiz kendiliğinden bittiğinde kaydı hemen yaz.
  React.useEffect(() => {
    if (finished) save();
  }, [finished, save]);

  const start = () => {
    deadlineRef.current = null;
    setRunning(true);
  };

  const pause = () => {
    cancelAnimation(scale);
    deadlineRef.current = null;
    setRunning(false);
  };

  const restart = () => {
    cancelAnimation(scale);
    deadlineRef.current = null;
    setRunning(false);
    setFinished(false);
    setSaved(false);
    setIndex(0);
    setRemaining(stepSeconds(0));
    setElapsed(0);
    resetStepState();
    setCorrectCount(0);
    setCheckedCount(0);
    scale.value = MIN_SCALE;
  };

  const finishEarly = () => {
    pause();
    // Yazılmış ama kontrol edilmemiş bir yanıt varsa kaydı yazmadan önce
    // kontrol edilir; `save` state güncellenmeden önce çağrıldığından güncel
    // sayı doğrudan buradan veriliyor (bkz. save'in üstündeki not).
    const pending = commitPendingOnLeave();
    const finalChecked = checkedCount + (typeof pending.correct === 'boolean' ? 1 : 0);
    const finalCorrect = correctCount + (pending.correct ? 1 : 0);
    save(finalCorrect, finalChecked);
    navigation.goBack();
  };

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const prompt =
    exercise.engine.kind === 'prompt' ? exercise.engine.prompts[index] : undefined;
  const breathStep = exercise.engine.kind === 'breath' ? steps[index] : undefined;
  const totalStepCount = totalSteps(exercise);

  return (
    <AppScreen
      header={
        <AppHeader
          title={exercise.title}
          subtitle={`${exercise.categoryLabel} · ${exercise.minutes} dk`}
          onBack={() => navigation.goBack()}
          backIcon="close"
        />
      }
      footer={
        finished ? (
          <View className="gap-2">
            <ActionButton label="Kapat" tone={accent} onPress={() => navigation.goBack()} />
            <ActionButton
              label="Tekrar Yap"
              variant="outline"
              icon={<RotateCcw size={16} color={t.iconColor} />}
              onPress={restart}
            />
          </View>
        ) : (
          <View className="gap-2">
            {running ? (
              <ActionButton label="Duraklat" tone="slate" onPress={pause} />
            ) : (
              <ActionButton
                label={index === 0 && elapsed === 0 ? 'Başla' : 'Devam Et'}
                tone={accent}
                onPress={start}
              />
            )}
            {index > 0 || elapsed > 0 ? (
              <ActionButton label="Bitir ve Kaydet" variant="outline" onPress={finishEarly} />
            ) : null}
          </View>
        )
      }
    >
      {finished ? (
        <>
          <CompletionCard
            effort={effort}
            elapsed={elapsed}
            steps={`${completedSteps}/${stepCount}`}
            correct={checkedCount > 0 ? `${correctCount}/${checkedCount}` : undefined}
            tone={accent}
            onOpenHistory={() => {
              navigation.goBack();
              navigation.navigate('ExerciseHistory');
            }}
          />
          {BREATH_HOLD_SUGGESTION_IDS.has(exercise.id) ? (
            <BreathHoldSuggestion
              onMeasure={() => {
                const test = findMeasureTest(TEST_BREATH_HOLD);
                if (!test) return;
                navigation.goBack();
                navigation.navigate(test.screen, test.params);
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          {/* İlerleme */}
          <View className="mt-2 mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className={`text-[11px] font-bold uppercase tracking-widest ${t.muted}`}>
                {exercise.engine.kind === 'breath' ? 'Tur' : 'Adım'} {index + 1} / {totalStepCount}
              </Text>
              <Text className={`text-[11px] ${t.muted}`}>{formatDuration(elapsed)}</Text>
            </View>
            <ProgressBar
              value={stepCount === 0 ? 0 : index / stepCount}
              tone={PROGRESS_TONE[accent]}
            />
          </View>

          {exercise.engine.kind === 'breath' ? (
            <View className="items-center justify-center my-2" style={{ height: CIRCLE_SIZE + 24 }}>
              <View
                className={`absolute rounded-full border-2 ${
                  t.isLight ? 'border-emerald-200' : 'border-emerald-900'
                }`}
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
                    backgroundColor: t.isLight ? 'rgba(5,150,105,0.10)' : 'rgba(52,211,153,0.16)',
                    borderWidth: 2,
                    borderColor: t.isLight ? 'rgba(5,150,105,0.35)' : 'rgba(52,211,153,0.45)',
                  },
                  circleStyle,
                ]}
              >
                <Text className={`text-5xl font-bold ${toneText('emerald', t.isLight)}`}>
                  {Math.ceil(remaining)}
                </Text>
                <Text className={`text-[14px] font-bold mt-1 ${t.title}`}>
                  {breathStep ? BREATH_PHASE_LABELS[breathStep.kind] : ''}
                </Text>
              </Animated.View>
            </View>
          ) : (
            <Surface className="items-center py-8">
              <Text className={`text-[32px] font-black ${toneText(accent, t.isLight)}`}>
                {Math.ceil(remaining)}
              </Text>
              <Text className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${t.muted}`}>
                SANİYE
              </Text>
              <Text className={`text-[17px] font-bold text-center leading-7 mt-5 ${t.title}`}>
                {prompt?.text}
              </Text>

              {/* Cevabı olan alıştırmalarda yazı girişiyle kontrol: kontrol
                  edilmeden (ya da süre dolmadan) cevap açılmaz, önce açmak
                  alıştırmayı boşa çıkarır. */}
              {prompt?.answer ? (
                <View className="w-full mt-4">
                  {!revealed ? (
                    // Küçük, kaydırmasız bir ScrollView: klavye açıkken dıştaki
                    // AppScreen ScrollView'ının varsayılan `keyboardShouldPersistTaps`
                    // davranışı "Kontrol Et"e ilk dokunuşu klavyeyi kapatmaya
                    // harcıyordu. AppScreen'e dokunmadan yerel bir düzeltme.
                    <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled">
                      <TextInput
                        value={answerText}
                        onChangeText={setAnswerText}
                        placeholder="Cevabınızı yazın…"
                        placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        className={`w-full rounded-2xl px-4 py-3 text-[13px] border ${
                          t.isLight
                            ? 'bg-slate-100 text-slate-900 border-transparent'
                            : 'bg-[#141417] text-white border-[#2e2e33]'
                        }`}
                      />
                      <View className="mt-3">
                        <ActionButton
                          label="Kontrol Et"
                          tone={accent}
                          disabled={answerText.trim().length === 0}
                          onPress={handleCheck}
                        />
                      </View>
                    </ScrollView>
                  ) : prompt.accept && prompt.accept.length > 0 ? (
                    <View
                      className={`px-4 py-3 rounded-2xl ${toneSoft(correctFlag ? 'emerald' : 'rose', t.isLight)}`}
                    >
                      <Text
                        className={`text-[13px] font-black ${toneText(correctFlag ? 'emerald' : 'rose', t.isLight)}`}
                      >
                        {correctFlag ? 'Doğru' : 'Yanlış'}
                      </Text>
                      <Text
                        className={`text-[12px] mt-1 ${toneText(correctFlag ? 'emerald' : 'rose', t.isLight)}`}
                      >
                        {prompt.answer}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View className={`px-4 py-3 rounded-2xl ${toneSoft('emerald', t.isLight)}`}>
                        <Text className={`text-[12px] font-bold ${toneText('emerald', t.isLight)}`}>
                          {prompt.answer}
                        </Text>
                      </View>
                      {correctFlag === undefined ? (
                        <View className="flex-row mt-3" style={{ gap: 8 }}>
                          <View className="flex-1">
                            <ActionButton
                              label="Doğru bildim"
                              tone="emerald"
                              variant="soft"
                              onPress={() => handleSelfAssess(true)}
                            />
                          </View>
                          <View className="flex-1">
                            <ActionButton
                              label="Bilemedim"
                              tone="rose"
                              variant="soft"
                              onPress={() => handleSelfAssess(false)}
                            />
                          </View>
                        </View>
                      ) : null}
                    </>
                  )}
                </View>
              ) : null}
            </Surface>
          )}

          {/* Yönerge */}
          <Surface className="mt-3">
            <Text className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${t.muted}`}>
              Nasıl Yapılır
            </Text>
            <Text className={`text-[12px] leading-6 ${t.body}`}>
              {exercise.engine.kind === 'prompt'
                ? exercise.engine.instruction
                : 'Daire büyürken burnunuzdan nefes alın, sabitken tutun, küçülürken ağzınızdan verin. Omuzlarınız sabit kalsın, karnınız çalışsın.'}
            </Text>
          </Surface>
        </>
      )}
    </AppScreen>
  );
}

function CompletionCard({
  effort,
  elapsed,
  steps,
  correct,
  tone,
  onOpenHistory,
}: {
  effort: number;
  elapsed: number;
  steps: string;
  /** "5/7" gibi doğru/kontrol edilen özeti — kontrol edilen soru yoksa gösterilmez. */
  correct?: string;
  tone: Tone;
  onOpenHistory: () => void;
}) {
  const t = useThemeTokens();
  return (
    <View className="mt-6">
      <Surface className="items-center py-8">
        <View
          className={`w-20 h-20 rounded-full items-center justify-center ${toneSoft('emerald', t.isLight)}`}
        >
          <Check size={34} color={toneColor('emerald', t.isLight)} />
        </View>
        <Text className={`text-[18px] font-black mt-4 ${t.title}`}>Egzersiz tamamlandı</Text>
        <Text className={`text-[12px] mt-1 ${t.muted}`}>Kayıt egzersiz geçmişinize eklendi.</Text>

        <View className="flex-row mt-6 w-full">
          <View className="flex-1 items-center">
            <Text className={`text-[21px] font-black ${toneText(tone, t.isLight)}`}>{effort}</Text>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${t.muted}`}>
              Efor
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className={`text-[21px] font-black ${t.title}`}>{formatDuration(elapsed)}</Text>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${t.muted}`}>
              Süre
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className={`text-[21px] font-black ${t.title}`}>{steps}</Text>
            <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${t.muted}`}>
              Adım
            </Text>
          </View>
          {correct ? (
            <View className="flex-1 items-center">
              <Text className={`text-[21px] font-black ${toneText('emerald', t.isLight)}`}>
                {correct}
              </Text>
              <Text className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${t.muted}`}>
                Doğru
              </Text>
            </View>
          ) : null}
        </View>
      </Surface>

      <View className="mt-3">
        <ActionButton label="Egzersiz Geçmişini Aç" variant="outline" onPress={onOpenHistory} />
      </View>
    </View>
  );
}

/**
 * Rahat Tutma egzersizlerinin bitişinde isteğe bağlı ölçüm yönlendirmesi.
 * Bilerek zorlayıcı değil: hemen ölçmeye değil, dinlendikten sonra ölçmeye
 * çağırıyor (egzersizin hemen ardından ölçüm koşulları bozar).
 */
function BreathHoldSuggestion({ onMeasure }: { onMeasure: () => void }) {
  const t = useThemeTokens();
  return (
    <Surface className="mt-3">
      <Text className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${t.muted}`}>
        İstersen
      </Text>
      <Text className={`text-[12px] leading-6 ${t.body}`}>
        Birkaç dakika normal nefesle dinlendikten sonra nefes tutma süreni ölçebilirsin. Ölçüm
        dinlenmiş hâlde ve oturarak yapılır; şimdi yapman gerekmez.
      </Text>
      <View className="mt-3">
        <ActionButton label="Nefes Tutma Ölçümünü Aç" variant="soft" tone="emerald" onPress={onMeasure} />
      </View>
    </Surface>
  );
}
