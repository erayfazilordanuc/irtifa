import React from 'react';
import { View, Text } from 'react-native';

import { useThemeTokens } from '../themeTokens';
import { TrendChart } from '../TrendChart';
import type { TestResult } from '../../utils/dailyPracticeProgress';

// Bir testin ölçüm geçmişi: "ilk → son" karşılaştırması ve eğri.
//
// Her test ekranı bunu kendi içinde yeniden yazmasın diye ayrıldı; yeni bir test
// eklendiğinde geçmiş gösterimi hazır geliyor. Grafik için yeni bir bileşen
// yazılmadı — projedeki `TrendChart` seri alıyor, ölçüm geçmişi de bir seri.

type Props = {
  history: TestResult[];
  /** Değerin birimi — "s", "nefes/dk" gibi. */
  unit: string;
  /** Ondalık basamak sayısı. Süreler 1, sayımlar 0. */
  decimals?: number;
  /**
   * Hangi yön "iyileşme" sayılır — yalnızca fark yazısının rengini belirler.
   *
   * 'none' bir kaçamak değil, dürüstlük: konuşma hızı ve dinlenik solunum hızı
   * gibi ölçümlerde hedef bir ARALIK, tek yön değil. Bunlarda artışı yeşile
   * boyamak yanlış bilgi verir.
   */
  improvement?: 'higher' | 'lower' | 'none';
};

export function TestTrend({ history, unit, decimals = 1, improvement = 'higher' }: Props) {
  const t = useThemeTokens();

  // Tek ölçümle eğri çizilmez; karşılaştırma iki ölçümden sonra anlamlı.
  if (history.length < 2) return null;

  const first = history[0].value;
  const last = history[history.length - 1].value;
  const delta = last - first;
  const improved =
    improvement === 'none' ? false : improvement === 'higher' ? delta > 0 : delta < 0;

  const fmt = (n: number) => n.toFixed(decimals);
  const deltaColor = improved ? 'text-emerald-500' : t.muted;

  return (
    <View className="mt-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`text-[11px] ${t.muted}`}>Son {history.length} ölçüm</Text>
        <View className="flex-row items-center">
          <Text className={`text-[11px] ${t.muted}`}>
            {fmt(first)} → <Text className={`font-bold ${t.title}`}>{fmt(last)}</Text> {unit}
          </Text>
          {delta !== 0 ? (
            <Text className={`text-[11px] font-bold ml-1.5 ${deltaColor}`}>
              {delta > 0 ? '+' : ''}
              {fmt(delta)}
            </Text>
          ) : null}
        </View>
      </View>

      <TrendChart
        height={110}
        series={[
          {
            color: t.isLight ? '#2563eb' : '#60a5fa',
            values: history.map((r) => r.value),
            fill: true,
          },
        ]}
      />
    </View>
  );
}
