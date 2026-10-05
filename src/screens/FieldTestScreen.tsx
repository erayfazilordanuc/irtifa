import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Target, Check, Sparkles } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  ActionButton,
  Badge,
  toneColor,
  toneSoft,
  toneText,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { pickDailyFieldTest, type Question } from '../data/questions';
import { findDepartment, interviewerRole } from '../data/sectors';
import { careerContext, useProfile, profileStore } from '../utils/profile';
import { useDayKey } from '../utils/today';
import { dayKey } from '../utils/dateUtils';
import { callGeminiJson, GeminiError } from '../utils/geminiClient';
import { AI_UNAVAILABLE_HINT, aiAvailable, useAiAvailable } from '../utils/aiAvailability';
import {
  addSession,
  getInterviewSessions,
  sessionKind,
  fieldTestScore,
  type FieldTestItem,
} from '../utils/interviewHistory';

// Günün Alan Testi — YAPILACAKLAR_İRTİFA Bölüm 3.
//
// Günün mülakatından farkı (kararlar 2026-10-04):
//   1. Set **1 ağır + 2 kısa** sorudan oluşur; gün boyunca aynı set gelir.
//   2. Format **yalnızca yazılı**: kamera ve mikrofon yok, izin istenmiyor.
//      Bu yüzden `audioStore` / `captureBuffer` yolu burada hiç kullanılmaz ve
//      akıcılık / dolgu kelime metrikleri uygulanmaz — ölçülen şey doğruluk,
//      derinlik ve kapsam.
//   3. Havuz kurumdan bağımsız, yalnızca hedef alana bağlı.
//
// Yapay zekâ **isteğe bağlı**: anahtar varken üç cevap birlikte değerlendirilir,
// yokken sorunun `keyPoints` alanı açılıp kullanıcı kendisi işaretler (KARARLAR
// "Egzersizde otomatik kontrol ile öz-değerlendirmenin ayrımı" — serbest metne
// otomatik doğru/yanlış damgası vurulmaz).

const EVALUATION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      description: 'Sorularla aynı sırada, her cevap için bir değerlendirme.',
      items: {
        type: 'OBJECT',
        properties: {
          score: {
            type: 'INTEGER',
            description: '0-100. Doğruluk, derinlik ve kapsam birlikte değerlendirilir.',
          },
          feedback: {
            type: 'STRING',
            description:
              'Tek cümlelik gerekçe: eksik kalan nokta ya da doğru yakalanan çekirdek. Türkçe.',
          },
        },
        required: ['score', 'feedback'],
      },
    },
    summary: {
      type: 'STRING',
      description: 'Setin tamamı için iki cümlelik toplu değerlendirme. Türkçe.',
    },
  },
  required: ['items', 'summary'],
};

type Evaluation = { items: { score: number; feedback: string }[]; summary: string };

const WEIGHT_LABEL: Record<string, string> = { agir: 'Ağır soru', kisa: 'Kısa soru' };

const SELF_RATINGS: { id: FieldTestItem['selfRating']; label: string; tone: 'emerald' | 'amber' | 'rose' }[] = [
  { id: 'bildim', label: 'Bildim', tone: 'emerald' },
  { id: 'kismen', label: 'Kısmen', tone: 'amber' },
  { id: 'bilemedim', label: 'Bilemedim', tone: 'rose' },
];

/** Bugünün alan testi zaten tamamlandı mı — gün anahtarına bakar. */
function completedToday(date: Date = new Date()): boolean {
  const today = dayKey(date);
  return getInterviewSessions().some(
    (session) =>
      sessionKind(session) === 'fieldTest' && dayKey(new Date(session.timestamp)) === today,
  );
}

export default function FieldTestScreen({ navigation }: any) {
  const t = useThemeTokens();
  const profile = useProfile();
  const day = useDayKey();
  const aiReady = useAiAvailable();

  const department = findDepartment(profile.targetDepartment);
  const set = React.useMemo(
    () => (profile.targetDepartment ? pickDailyFieldTest(profile.targetDepartment) : null),
    [profile.targetDepartment, day],
  );

  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [selfRatings, setSelfRatings] = React.useState<Record<string, FieldTestItem['selfRating']>>({});
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
  const [evaluation, setEvaluation] = React.useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [alreadyDone] = React.useState(() => completedToday());

  const questions = set?.questions ?? [];
  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const buildItems = React.useCallback(
    (evaluated: Evaluation | null): FieldTestItem[] =>
      questions.map((question, index) => ({
        questionId: question.id,
        questionText: question.text,
        weight: question.weight ?? 'kisa',
        keyPoints: question.keyPoints,
        answer: (answers[question.id] ?? '').trim(),
        score: evaluated?.items[index]?.score,
        feedback: evaluated?.items[index]?.feedback,
        selfRating: selfRatings[question.id],
      })),
    [questions, answers, selfRatings],
  );

  const save = React.useCallback(
    (evaluated: Evaluation | null) => {
      if (!department || questions.length === 0) return;
      const items = buildItems(evaluated);
      addSession({
        id: `ft-${Date.now()}`,
        timestamp: new Date().toISOString(),
        kind: 'fieldTest',
        departmentId: department.id,
        // Alan testi kurumdan bağımsız; kimlik boş, görünen ad alanın adı.
        companyId: '',
        companyName: department.label,
        questionText: `Günün alan testi · ${department.label}`,
        mode: 'typing',
        durationSeconds: 0,
        items,
        analysis: undefined,
      });
      setSaved(true);
    },
    [department, questions.length, buildItems],
  );

  const evaluate = React.useCallback(async () => {
    if (!department || !aiAvailable()) return;
    setEvaluating(true);
    setAiError(null);

    const prompt = [
      interviewerRole(profile.sectorId),
      `Aşağıda "${department.label}" alanında bir adaya sorulan ${questions.length} teknik soru ve adayın yazılı cevapları var.`,
      'Her cevabı doğruluk, derinlik ve kapsam açısından değerlendir. Cevabın yazım ve üslubunu değil, teknik içeriğini puanla.',
      'Boş ya da konu dışı cevaba düşük puan ver. Puanı şişirme; eksik olanı açıkça söyle.',
      careerContext(profileStore.get()),
      '',
      ...questions.map((question, index) => {
        const answer = (answers[question.id] ?? '').trim();
        return [
          `${index + 1}. Soru (${question.weight === 'agir' ? 'ağır' : 'kısa'}): ${question.text}`,
          question.keyPoints?.length
            ? `   Beklenen noktalar: ${question.keyPoints.join('; ')}`
            : '',
          `   Adayın cevabı: """${answer || '(boş bırakıldı)'}"""`,
        ]
          .filter(Boolean)
          .join('\n');
      }),
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const result = await callGeminiJson<Evaluation>({
        prompt,
        responseSchema: EVALUATION_SCHEMA as unknown as Record<string, unknown>,
      });
      setEvaluation(result);
      save(result);
    } catch (e) {
      // Yapay zekâ kapalıyken teknik hata metni gösterilmez (CLAUDE.md kuralı);
      // burada anahtar var ama çağrı başarısız — kullanıcıya sade bir cümle.
      setAiError(
        e instanceof GeminiError
          ? 'Değerlendirme alınamadı. Cevapların kaydedildi, sonra tekrar deneyebilirsin.'
          : 'Değerlendirme alınamadı. Cevapların kaydedildi.',
      );
      save(null);
    } finally {
      setEvaluating(false);
    }
  }, [department, profile.sectorId, questions, answers, save]);

  const finish = React.useCallback(() => {
    if (aiReady) {
      void evaluate();
      return;
    }
    // Yapay zekâ kapalı: beklenen noktalar açılır, kullanıcı kendisi işaretler.
    setRevealed(Object.fromEntries(questions.map((q) => [q.id, true])));
    save(null);
  }, [aiReady, evaluate, questions, save]);

  // ——— Alan seçilmemiş ———
  if (!department || !set) {
    return (
      <AppScreen
        header={
          <AppHeader
            title="Günün Alan Testi"
            subtitle="Hedef alanına göre her gün üç soru."
            onBack={() => navigation.goBack()}
          />
        }
      >
        <Surface className="mt-3">
          <Text className={`text-[13px] font-bold ${t.title}`}>Önce hedef alanını seç</Text>
          <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>
            Alan testi, hedeflediğin alanın soru havuzundan geliyor. Alanını seçtiğinde her gün
            bir ağır ve iki kısa soru burada olacak.
          </Text>
          <View className="mt-4">
            <ActionButton
              label="Hedef alanı seç"
              onPress={() => navigation.navigate('Profile')}
              icon={<Target size={16} color="#ffffff" />}
            />
          </View>
        </Surface>
      </AppScreen>
    );
  }

  // ——— Havuz henüz hazır değil ———
  if (questions.length === 0) {
    return (
      <AppScreen
        header={
          <AppHeader
            title="Günün Alan Testi"
            subtitle={department.label}
            onBack={() => navigation.goBack()}
          />
        }
      >
        <Surface className="mt-3">
          <Text className={`text-[13px] font-bold ${t.title}`}>Bu alanın havuzu hazırlanıyor</Text>
          <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>
            {department.label} için soru havuzu henüz doldurulmadı. Başka bir alan seçebilir ya da
            günün mülakatıyla devam edebilirsin.
          </Text>
        </Surface>
      </AppScreen>
    );
  }

  const score = saved ? fieldTestScore(buildItems(evaluation)) : undefined;

  return (
    <AppScreen
      header={
        <AppHeader
          title="Günün Alan Testi"
          subtitle={`${department.label} · ${questions.length} soru`}
          onBack={() => navigation.goBack()}
        />
      }
      footer={
        saved ? (
          <ActionButton
            label="Bitti"
            tone="emerald"
            onPress={() => navigation.goBack()}
            icon={<Check size={16} color="#ffffff" />}
          />
        ) : (
          <ActionButton
            label={
              evaluating
                ? 'Değerlendiriliyor…'
                : aiReady
                  ? 'Cevapları değerlendir'
                  : 'Cevapları kaydet'
            }
            onPress={finish}
            disabled={!allAnswered || evaluating}
            icon={
              evaluating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : aiReady ? (
                <Sparkles size={16} color="#ffffff" />
              ) : (
                <Check size={16} color="#ffffff" />
              )
            }
          />
        )
      }
    >
      {alreadyDone && !saved ? (
        <Surface className="mt-1">
          <Text className={`text-[12px] leading-5 ${t.body}`}>
            Bugünün setini zaten tamamladın. Tekrar çözebilirsin; yeni kayıt geçmişe ayrıca
            eklenir.
          </Text>
        </Surface>
      ) : null}

      <View className="mt-1">
        <SectionLabel>
          {answeredCount}/{questions.length} CEVAPLANDI
        </SectionLabel>
      </View>

      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          index={index}
          question={question}
          value={answers[question.id] ?? ''}
          onChange={(next) => setAnswers((prev) => ({ ...prev, [question.id]: next }))}
          locked={saved}
          revealed={revealed[question.id] ?? false}
          evaluation={evaluation?.items[index]}
          selfRating={selfRatings[question.id]}
          onSelfRate={(rating) =>
            setSelfRatings((prev) => ({ ...prev, [question.id]: rating }))
          }
        />
      ))}

      {aiError ? (
        <Surface className="mt-1">
          <Text className={`text-[12px] leading-5 ${t.body}`}>{aiError}</Text>
        </Surface>
      ) : null}

      {evaluation ? (
        <Surface className="mt-1">
          <View className="flex-row items-center justify-between">
            <Text className={`text-[13px] font-bold ${t.title}`}>Setin değerlendirmesi</Text>
            {typeof score === 'number' ? <Badge label={`${score}/100`} tone="blue" /> : null}
          </View>
          <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>{evaluation.summary}</Text>
        </Surface>
      ) : null}

      {saved && !evaluation ? (
        <Surface className="mt-1">
          <Text className={`text-[13px] font-bold ${t.title}`}>Cevapların kaydedildi</Text>
          <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>
            {aiReady
              ? 'Geçmişten tekrar bakabilirsin.'
              : `Beklenen noktalarla kendi cevabını karşılaştır ve işaretle. ${AI_UNAVAILABLE_HINT}`}
          </Text>
        </Surface>
      ) : null}
    </AppScreen>
  );
}

function QuestionCard({
  index,
  question,
  value,
  onChange,
  locked,
  revealed,
  evaluation,
  selfRating,
  onSelfRate,
}: {
  index: number;
  question: Question;
  value: string;
  onChange: (next: string) => void;
  locked: boolean;
  revealed: boolean;
  evaluation?: { score: number; feedback: string };
  selfRating?: FieldTestItem['selfRating'];
  onSelfRate: (rating: FieldTestItem['selfRating']) => void;
}) {
  const t = useThemeTokens();
  const heavy = question.weight === 'agir';
  const tone = heavy ? 'violet' : 'blue';

  return (
    <Surface className="mt-2">
      <View className="flex-row items-center">
        <View
          className={`w-7 h-7 rounded-lg items-center justify-center mr-2.5 ${toneSoft(tone, t.isLight)}`}
        >
          <Text className={`text-[12px] font-bold ${toneText(tone, t.isLight)}`}>{index + 1}</Text>
        </View>
        <Badge label={WEIGHT_LABEL[question.weight ?? 'kisa']} tone={tone} />
        {evaluation ? (
          <View className="ml-auto">
            <Badge label={`${evaluation.score}/100`} tone="emerald" />
          </View>
        ) : null}
      </View>

      <Text className={`text-[13px] mt-3 leading-5 ${t.title}`}>{question.text}</Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        editable={!locked}
        placeholder="Cevabını yaz…"
        placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
        multiline
        textAlignVertical="top"
        className={`rounded-2xl px-4 py-3 mt-3 text-[13px] border ${
          t.isLight
            ? 'bg-slate-100 text-slate-900 border-transparent'
            : 'bg-[#141417] text-white border-[#2e2e33]'
        }`}
        style={{ minHeight: heavy ? 120 : 80 }}
      />

      {evaluation ? (
        <Text className={`text-[12px] mt-3 leading-5 ${t.body}`}>{evaluation.feedback}</Text>
      ) : null}

      {revealed && question.keyPoints?.length ? (
        <View className={`mt-3 pt-3 border-t ${t.dividerColor}`}>
          <Text className={`text-[11px] font-bold ${t.muted}`}>BEKLENEN NOKTALAR</Text>
          {question.keyPoints.map((point) => (
            <Text key={point} className={`text-[12px] mt-1.5 leading-5 ${t.body}`}>
              • {point}
            </Text>
          ))}

          <View className="flex-row mt-3">
            {SELF_RATINGS.map((rating) => {
              const selected = selfRating === rating.id;
              return (
                <Pressable
                  key={rating.id}
                  onPress={() => onSelfRate(rating.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${rating.label} olarak işaretle`}
                  accessibilityState={{ selected }}
                  className={`flex-1 rounded-xl py-2.5 items-center mr-2 last:mr-0 border ${
                    selected
                      ? `${toneSoft(rating.tone, t.isLight)} border-transparent`
                      : `${t.cardBorder}`
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold ${
                      selected ? toneText(rating.tone, t.isLight) : t.muted
                    }`}
                  >
                    {rating.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {revealed || evaluation ? null : (
        <Text className={`text-[11px] mt-2 ${t.muted}`}>{question.tip}</Text>
      )}
    </Surface>
  );
}
