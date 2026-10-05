import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Activity, Clock, Zap, ChevronRight } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  StatTile,
  EmptyState,
  toneColor,
} from '../components/AppUI';
import { AiInsightCard } from '../components/AiInsightCard';
import { TrendChart } from '../components/TrendChart';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { exerciseStats, useExerciseLogs, type ExerciseLog } from '../utils/exerciseHistory';
import { formatAxisDate, formatDuration, formatShortDate } from '../utils/dateUtils';

// Bilişsel ve fizyolojik egzersiz kayıtları: özet, efor trendi ve günlük.

/** Grafikte gösterilecek en fazla kayıt sayısı. */
const TREND_POINTS = 7;

export default function ExerciseHistoryScreen({ navigation }: any) {
  const t = useThemeTokens();
  const logs = useExerciseLogs();
  const stats = exerciseStats(logs);

  // Grafik eskiden yeniye ilerlesin.
  const trend = React.useMemo(() => logs.slice(0, TREND_POINTS).reverse(), [logs]);

  const buildPrompt = () => {
    const lines = logs.slice(0, 25).map((log, index) =>
      [
        `${index + 1}. ${formatShortDate(new Date(log.timestamp))} · ${log.title}`,
        `   Kategori: ${log.categoryLabel} · Süre: ${formatDuration(log.durationSeconds)} · Efor: ${log.effort}/100`,
        log.summary ? `   Not: ${log.summary}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );

    return [
      'Sen bilişsel performans ve stres yönetimi üzerine çalışan bir uzmansın.',
      'Aşağıda kullanıcının tamamladığı zihinsel ve fizyolojik egzersiz kayıtları var.',
      'Egzersiz türlerini, sıklığını ve sürelerini analiz ederek zihinsel performansını ve',
      'stres yönetimi kapasitesini değerlendir. Eksik kalan egzersiz türlerini de belirt. Türkçe yaz.',
      '',
      ...lines,
    ].join('\n');
  };

  return (
    <AppScreen
      header={
        <AppHeader
          title="Bilişsel Egzersiz Geçmişi"
          onBack={() => navigation.goBack()}
          align="center"
        />
      }
    >
      <View className="mt-1">
        <AiInsightCard
          title="Yapay Zeka Bilişsel Analiz"
          description="Geçmişte yaptığınız egzersiz türlerini, sıklığını ve sürelerini analiz ederek zihinsel performansınızı ve stres yönetimi kapasitenizi değerlendirin."
          buttonLabel="Egzersiz Gelişimimi Analiz Et"
          buildPrompt={buildPrompt}
          disabled={logs.length === 0}
          disabledHint="Analiz için en az bir tamamlanmış egzersiz gerekiyor."
        />
      </View>

      {/* Özet */}
      <View className="flex-row gap-3 mt-4">
        <StatTile
          label="Toplam"
          value={stats.total}
          icon={<Activity size={13} color={toneColor('blue', t.isLight)} />}
          tone="blue"
        />
        <StatTile
          label="Süre (dk)"
          value={stats.totalMinutes}
          icon={<Clock size={13} color={toneColor('violet', t.isLight)} />}
          tone="violet"
        />
        <StatTile
          label="Favori"
          value={stats.favorite}
          icon={<Zap size={13} color={toneColor('amber', t.isLight)} />}
          tone="amber"
        />
      </View>

      {/* Efor trendi */}
      {trend.length > 1 ? (
        <>
          <Text className={`text-[16px] font-bold mt-6 mb-3 ${t.title}`}>Bilişsel Efor Trendi</Text>
          <TrendChart
            height={160}
            maxValue={100}
            showDots
            showValues
            series={[{ color: toneColor('blue', t.isLight), values: trend.map((log) => log.effort) }]}
            labels={trend.map((log) => formatAxisDate(new Date(log.timestamp)))}
            valueColor={(value) =>
              value >= 90
                ? toneColor('emerald', t.isLight)
                : value >= 70
                  ? toneColor('blue', t.isLight)
                  : toneColor('amber', t.isLight)
            }
          />
        </>
      ) : null}

      {/* Günlük */}
      <Text className={`text-[16px] font-bold mt-6 mb-3 ${t.title}`}>Egzersiz Günlüğü</Text>

      {logs.length === 0 ? (
        <EmptyState message="Henüz tamamlanmış egzersiziniz bulunmuyor." />
      ) : (
        <Surface>
          {logs.map((log, index) => (
            <LogRow
              key={log.id}
              log={log}
              divider={index > 0}
              onPress={() => navigation.navigate('ExerciseDetail', { logId: log.id })}
            />
          ))}
        </Surface>
      )}
    </AppScreen>
  );
}

function LogRow({
  log,
  divider,
  onPress,
}: {
  log: ExerciseLog;
  divider: boolean;
  onPress: () => void;
}) {
  const t = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center py-3.5 ${divider ? `border-t ${t.dividerColor}` : ''}`}
    >
      <View className="flex-1 pr-3">
        <Text className={`text-[13px] font-bold ${t.title}`} numberOfLines={1}>
          {log.title}
        </Text>
        <Text className={`text-[11px] mt-0.5 ${t.muted}`}>
          {log.categoryLabel} · {formatShortDate(new Date(log.timestamp))}
        </Text>
      </View>

      <View className="flex-row items-center mr-1">
        <Clock size={12} color={t.iconColor} />
        <Text className={`text-[11px] font-bold ml-1 ${t.body}`}>
          {formatDuration(log.durationSeconds)}
        </Text>
      </View>
      <ChevronRight size={16} color={t.iconColor} />
    </Pressable>
  );
}
