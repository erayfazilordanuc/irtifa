import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, TrendingUp, Check, Target, ListChecks } from 'lucide-react-native';

import { Surface, ActionButton, toneColor, toneSoft, toneText } from './AppUI';
import { useThemeTokens } from './practice/PracticeUI';
import { callGeminiJson, GeminiError } from '../utils/geminiClient';
import { AI_UNAVAILABLE_HINT, useAiAvailable } from '../utils/aiAvailability';

// Mülakat ve egzersiz geçmişi ekranlarının paylaştığı "toplu analiz" kartı.
// Tek tek oturumları değil, birikmiş kaydın tamamını değerlendirir.

export type Insight = {
  summary: string;
  trend: string;
  strengths: string[];
  focusAreas: string[];
  roadmap: string[];
};

const INSIGHT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING', description: 'Genel durumu özetleyen iki cümlelik değerlendirme.' },
    trend: {
      type: 'STRING',
      description: "Gidişat etiketi (örn. 'Yükselen', 'Dalgalı', 'Sabit', 'Veri yetersiz').",
    },
    strengths: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Kayıtlardan çıkan iki ila üç güçlü yön.',
    },
    focusAreas: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Öncelikle çalışılması gereken iki ila üç alan.',
    },
    roadmap: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Önümüzdeki iki hafta için üç ila beş somut adım.',
    },
  },
  required: ['summary', 'trend', 'strengths', 'focusAreas', 'roadmap'],
} as const;

export function AiInsightCard({
  title,
  description,
  buttonLabel,
  buildPrompt,
  disabled,
  disabledHint,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  /** Analiz istemi — kayıtlar değiştiğinde yeniden okunur. */
  buildPrompt: () => string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const t = useThemeTokens();
  const navigation = useNavigation<any>();
  // Yapay zekâ kapalıyken düğme çalışır görünüp hata basmıyor; baştan kapalı
  // ve nedeni sade bir dille yazılı. Kart tamamen gizlenmiyor ki özelliğin
  // varlığı bilinsin. Hemen altında kuruluma giden bir düğme var — eskiden
  // yalnızca bu ipucu vardı ve kullanıcı nereden açacağını bulamıyordu.
  const aiOn = useAiAvailable();
  const blocked = disabled || !aiOn;
  const blockedHint = !aiOn ? AI_UNAVAILABLE_HINT : disabledHint;
  const [loading, setLoading] = React.useState(false);
  const [insight, setInsight] = React.useState<Insight | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callGeminiJson<Insight>({
        prompt: buildPrompt(),
        responseSchema: INSIGHT_SCHEMA as unknown as Record<string, unknown>,
      });
      setInsight(result);
    } catch (e) {
      setError(e instanceof GeminiError ? e.message : 'Analiz tamamlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Surface
        className={t.isLight ? 'bg-emerald-50' : 'bg-emerald-950'}
      >
        <View className="flex-row items-center mb-2">
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
              t.isLight ? 'bg-emerald-100' : 'bg-emerald-900'
            }`}
          >
            <Sparkles size={18} color={toneColor('emerald', t.isLight)} />
          </View>
          <View className="flex-1">
            <Text className={`text-[14px] font-bold ${t.title}`}>{title}</Text>
            <Text
              className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${toneText('emerald', t.isLight)}`}
            >
              GEMİNİ MOTORU DESTEKLİ
            </Text>
          </View>
        </View>

        <Text className={`text-[11px] leading-5 mb-4 ${t.body}`}>{description}</Text>

        <ActionButton
          label={loading ? 'Analiz ediliyor…' : buttonLabel}
          tone="emerald"
          disabled={blocked || loading}
          icon={<Sparkles size={16} color="#ffffff" />}
          onPress={run}
        />

        {blocked && blockedHint ? (
          <Text className={`text-[11px] mt-2 text-center ${t.muted}`}>{blockedHint}</Text>
        ) : null}

        {!aiOn ? (
          <View className="mt-3">
            <ActionButton
              label="Yapay Zekâyı Aç"
              tone="emerald"
              variant="outline"
              icon={<Sparkles size={16} color={toneColor('emerald', t.isLight)} />}
              onPress={() => navigation.navigate('AiSetup')}
            />
          </View>
        ) : null}

        {loading ? (
          <View className="items-center mt-4">
            <ActivityIndicator color={toneColor('emerald', t.isLight)} />
          </View>
        ) : null}

        {error ? (
          <Text className={`text-[11px] mt-3 leading-5 ${toneText('rose', t.isLight)}`}>
            {error}
          </Text>
        ) : null}
      </Surface>

      {insight ? <InsightResult insight={insight} /> : null}
    </View>
  );
}

function InsightResult({ insight }: { insight: Insight }) {
  const t = useThemeTokens();
  return (
    <Surface className="mt-3">
      <View className="flex-row items-center mb-2">
        <TrendingUp size={16} color={toneColor('emerald', t.isLight)} />
        <Text className={`text-[12px] font-bold ml-2 ${t.title}`}>Gidişat: {insight.trend}</Text>
      </View>
      <Text className={`text-[12px] leading-6 ${t.body}`}>{insight.summary}</Text>

      <InsightList
        icon={<Check size={15} color={toneColor('emerald', t.isLight)} />}
        title="Güçlü Yönler"
        items={insight.strengths}
      />
      <InsightList
        icon={<Target size={15} color={toneColor('amber', t.isLight)} />}
        title="Öncelikli Alanlar"
        items={insight.focusAreas}
      />
      <InsightList
        icon={<ListChecks size={15} color={toneColor('blue', t.isLight)} />}
        title="İki Haftalık Yol Haritası"
        items={insight.roadmap}
        numbered
      />
    </Surface>
  );
}

function InsightList({
  icon,
  title,
  items,
  numbered,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  numbered?: boolean;
}) {
  const t = useThemeTokens();
  if (items.length === 0) return null;

  return (
    <View className={`mt-4 pt-3 border-t ${t.dividerColor}`}>
      <View className="flex-row items-center mb-1">
        {icon}
        <Text className={`text-[11px] font-bold uppercase tracking-widest ml-2 ${t.muted}`}>
          {title}
        </Text>
      </View>
      {items.map((item, index) => (
        <View key={index} className="flex-row mt-2">
          <Text className={`text-[12px] mr-2 font-bold ${t.muted}`}>
            {numbered ? `${index + 1}.` : '•'}
          </Text>
          <Text className={`text-[12px] flex-1 leading-5 ${t.body}`}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
