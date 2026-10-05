import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Check, X, ChevronRight, Trash2 } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  EmptyState,
  Badge,
  toneColor,
  toneFill,
  toneText,
  type Tone,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import {
  useResponses,
  removeResponse,
  responsesOf,
  responseStats,
  RESPONSE_MODULE_LABELS,
  type PracticeResponse,
  type ResponseModule,
} from '../utils/responseHistory';
import { useInterviewSessions, type RecordedSession } from '../utils/interviewHistory';
import { findCompany, companyColor } from '../data/companies';
import { formatShortDate } from '../utils/dateUtils';

// Kullanıcının uygulamada verdiği bütün yanıtları modül modül gösteren defter
// (kullanıcı kararı 2026-09-20 — "her yerdeki yanıtlarım kaydedilsin").
//
// Egzersiz sekmesi `responseHistory`'den, Mülakat sekmesi
// doğrudan `interviewHistory`'den okur — bkz. `responseHistory.ts` başlığı:
// mülakat oturumunun kendi deposu daha zengin (kurum, süre, ses, analiz),
// bu yüzden iki ayrı doğruluk kaynağı oluşmasın diye oraya kopyalanmıyor.

type ModuleFilter = ResponseModule | 'all' | 'interview';

/**
 * Sekme sırası ve rengi; egzersiz tonu satır etiketinde de kullanılır. Tonlar
 * uygulamanın başka yerlerdeki eşleşmesini izliyor, bu ekrana özgü seçilmiyor:
 * mülakat mavi (Mülakat sekmesi ve Karne'deki "Mülakat geçmişi"),
 * egzersiz mor ("Zihin & Odak", "Egzersiz geçmişi").
 */
const MODULE_TABS: { value: ModuleFilter; label: string; tone: Tone }[] = [
  { value: 'all', label: 'Tümü', tone: 'slate' },
  { value: 'exercise', label: 'Egzersiz', tone: 'violet' },
  { value: 'interview', label: 'Mülakat', tone: 'blue' },
];

const RESPONSE_MODULE_TONE: Record<ResponseModule, Tone> = {
  exercise: 'violet',
};

const EMPTY_MESSAGES: Record<ModuleFilter, string> = {
  all: 'Uygulamada verdiğin yanıtlar burada birikecek.',
  exercise: 'Egzersiz yanıtların burada birikir.',
  interview: 'Tamamladığın mülakat simülasyonları burada birikir.',
};

/** Bir kerede gösterilen kayıt sayısı — uzun listede "Daha fazla göster" ile açılır. */
const PAGE_SIZE = 50;

type JournalEntry =
  | { kind: 'response'; id: string; timestamp: string; response: PracticeResponse }
  | { kind: 'interview'; id: string; timestamp: string; session: RecordedSession };

export default function ResponseJournalScreen({ navigation, route }: any) {
  const t = useThemeTokens();
  const responses = useResponses();
  const sessions = useInterviewSessions();

  const [selectedModule, setSelectedModule] = React.useState<ModuleFilter>(
    route?.params?.module ?? 'all',
  );
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  // Ekran açık kalmışken farklı bir parametreyle tekrar açılırsa (aynı modal
  // örneği yeniden kullanılmaz normalde, ama savunma amaçlı) seçim güncellensin.
  React.useEffect(() => {
    if (route?.params?.module) setSelectedModule(route.params.module);
  }, [route?.params?.module]);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);
  }, [selectedModule]);

  const entries = React.useMemo<JournalEntry[]>(() => {
    if (selectedModule === 'interview') {
      return sessions.map((session) => ({
        kind: 'interview' as const,
        id: session.id,
        timestamp: session.timestamp,
        session,
      }));
    }
    if (selectedModule === 'all') {
      const responseEntries: JournalEntry[] = responses.map((response) => ({
        kind: 'response' as const,
        id: response.id,
        timestamp: response.timestamp,
        response,
      }));
      const sessionEntries: JournalEntry[] = sessions.map((session) => ({
        kind: 'interview' as const,
        id: session.id,
        timestamp: session.timestamp,
        session,
      }));
      // ISO zaman damgaları sözlük sırasıyla da doğru sıralanır.
      return [...responseEntries, ...sessionEntries].sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp),
      );
    }
    return responsesOf(responses, selectedModule).map((response) => ({
      kind: 'response' as const,
      id: response.id,
      timestamp: response.timestamp,
      response,
    }));
  }, [selectedModule, responses, sessions]);

  const visibleEntries = entries.slice(0, visibleCount);
  const remaining = entries.length - visibleEntries.length;

  const stats = responseStats(responses);
  const subtitle =
    stats.total === 0
      ? 'Henüz kaydedilmiş yanıt yok.'
      : stats.checked > 0
        ? `${stats.total} yanıt · %${stats.accuracy} isabet (${stats.checked} kontrol edilebilir)`
        : `${stats.total} yanıt kaydedildi`;

  const confirmDelete = (response: PracticeResponse) => {
    Alert.alert('Yanıtı sil', `"${response.title}" için verdiğin yanıt defterden silinecek.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          if (expandedId === response.id) setExpandedId(null);
          removeResponse(response.id);
        },
      },
    ]);
  };

  return (
    <AppScreen
      header={
        <AppHeader
          title="Yanıt Defteri"
          subtitle={subtitle}
          onBack={() => navigation.goBack()}
          align="center"
        />
      }
    >
      <View className="mt-1">
        <ModuleTabs value={selectedModule} onChange={setSelectedModule} />
      </View>

      <View className="mt-4">
        {entries.length === 0 ? (
          <EmptyState message={EMPTY_MESSAGES[selectedModule]} />
        ) : (
          <Surface>
            {visibleEntries.map((entry, index) =>
              entry.kind === 'response' ? (
                <ResponseRow
                  key={entry.id}
                  response={entry.response}
                  divider={index > 0}
                  expanded={expandedId === entry.id}
                  onToggle={() =>
                    setExpandedId((current) => (current === entry.id ? null : entry.id))
                  }
                  onDelete={() => confirmDelete(entry.response)}
                />
              ) : (
                <InterviewRow
                  key={entry.id}
                  session={entry.session}
                  divider={index > 0}
                  onPress={() =>
                    navigation.navigate('Analysis', { sessionId: entry.session.id })
                  }
                />
              ),
            )}
          </Surface>
        )}

        {remaining > 0 ? (
          <Pressable
            onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
            accessibilityRole="button"
            accessibilityLabel="Daha fazla yanıt göster"
            className="items-center py-3.5 mt-2"
          >
            <Text className={`text-[12px] font-bold ${toneText('blue', t.isLight)}`}>
              Daha fazla göster ({remaining} kaldı)
            </Text>
          </Pressable>
        ) : null}
      </View>
    </AppScreen>
  );
}

function ModuleTabs({
  value,
  onChange,
}: {
  value: ModuleFilter;
  onChange: (next: ModuleFilter) => void;
}) {
  const t = useThemeTokens();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 4 }}
    >
      {MODULE_TABS.map((tab) => {
        const selected = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${tab.label} yanıtlarını göster`}
            className={`px-3.5 py-2 rounded-full mr-2 ${
              selected
                ? toneFill(tab.tone, t.isLight)
                : t.isLight
                  ? 'bg-slate-100'
                  : 'bg-[#2a2a2e]'
            }`}
          >
            <Text
              className={`text-[12px] font-bold ${selected ? 'text-white' : t.muted}`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ResponseRow({
  response,
  divider,
  expanded,
  onToggle,
  onDelete,
}: {
  response: PracticeResponse;
  divider: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const t = useThemeTokens();
  const tone = RESPONSE_MODULE_TONE[response.module];

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onDelete}
      accessibilityRole="button"
      accessibilityLabel={`${response.title} yanıtını ${expanded ? 'daralt' : 'genişlet'}`}
      className={`py-3.5 ${divider ? `border-t ${t.dividerColor}` : ''}`}
    >
      <View className="flex-row items-center mb-1">
        <Text className={`text-[10px] font-bold uppercase tracking-widest ${toneText(tone, t.isLight)}`}>
          {RESPONSE_MODULE_LABELS[response.module]}
        </Text>
        <Text className={`text-[10px] ml-2 ${t.muted}`}>
          {formatShortDate(new Date(response.timestamp))}
        </Text>
        <View className="flex-1" />
        {response.correct === true ? (
          <Check size={14} color={toneColor('emerald', t.isLight)} />
        ) : response.correct === false ? (
          <X size={14} color={toneColor('rose', t.isLight)} />
        ) : null}
      </View>

      <Text className={`text-[13px] font-bold leading-5 ${t.title}`} numberOfLines={1}>
        {response.title}
      </Text>
      <Text
        className={`text-[12px] mt-1 leading-5 ${t.body}`}
        numberOfLines={expanded ? undefined : 3}
      >
        {response.answer}
      </Text>

      {expanded ? (
        <View className={`mt-3 pt-3 border-t ${t.dividerColor}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${t.muted}`}>
            Soru
          </Text>
          <Text className={`text-[12px] leading-5 ${t.body}`}>{response.prompt}</Text>

          {response.expected ? (
            <>
              <Text className={`text-[10px] font-bold uppercase tracking-widest mt-2.5 mb-1 ${t.muted}`}>
                Beklenen cevap
              </Text>
              <Text className={`text-[12px] leading-5 ${t.body}`}>{response.expected}</Text>
            </>
          ) : null}

          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Bu yanıtı defterden sil"
            className="self-end flex-row items-center mt-3"
            hitSlop={8}
          >
            <Trash2 size={13} color={toneColor('rose', t.isLight)} />
            <Text className={`text-[11px] font-bold ml-1.5 ${toneText('rose', t.isLight)}`}>
              Sil
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

function InterviewRow({
  session,
  divider,
  onPress,
}: {
  session: RecordedSession;
  divider: boolean;
  onPress: () => void;
}) {
  const t = useThemeTokens();
  // Kayıt diskten geliyor; kurum listeden kalkmış olabilir. Fırlatmak yerine
  // satırı nötr bir etiketle çiziyoruz — geçmiş kaybolmasın (bkz. InterviewHistoryScreen).
  const company = findCompany(session.companyId);
  const rating = session.analysis?.rating;
  const tone: Tone =
    rating === undefined ? 'slate' : rating >= 75 ? 'emerald' : rating >= 50 ? 'amber' : 'rose';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${session.companyName} mülakatının analizini gör`}
      className={`flex-row items-center py-3.5 ${divider ? `border-t ${t.dividerColor}` : ''}`}
    >
      <View className="flex-1 pr-3">
        <View className="flex-row items-center mb-1">
          <Text
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: company ? companyColor(company, t.isLight) : t.iconColor }}
          >
            {company?.name ?? session.companyName ?? 'BİLİNMEYEN KURUM'}
          </Text>
          <Text className={`text-[10px] ml-2 ${t.muted}`}>
            {formatShortDate(new Date(session.timestamp))}
          </Text>
        </View>
        <Text className={`text-[13px] font-bold leading-5 ${t.title}`} numberOfLines={2}>
          {session.questionText}
        </Text>
        <Text className={`text-[11px] mt-1 ${t.muted}`} numberOfLines={2}>
          {session.mode === 'typing' ? session.transcript || 'Yazılı yanıt' : 'Sesli yanıt'}
        </Text>
      </View>

      <Badge label={rating === undefined ? 'Analiz yok' : `${rating}`} tone={tone} />
      <View className="ml-1">
        <ChevronRight size={16} color={t.iconColor} />
      </View>
    </Pressable>
  );
}
