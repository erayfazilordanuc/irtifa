import React from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useThemeTokens } from './practice/PracticeUI';

// Profil ve egzersiz geçmişi ekranlarındaki gelişim grafiği.
// Yeni bir grafik kütüphanesi eklemeden, mevcut react-native-svg ile çiziliyor.

export type ChartSeries = {
  color: string;
  values: number[];
  /** Çizginin altını dolduran degrade. */
  fill?: boolean;
};

type Props = {
  series: ChartSeries[];
  /** X ekseni etiketleri — değer sayısıyla aynı uzunlukta olmalı. */
  labels?: string[];
  height?: number;
  /** Noktaların üstüne değerleri yazar. */
  showValues?: boolean;
  /** Nokta ve değer yazısı gösterilsin mi. */
  showDots?: boolean;
  maxValue?: number;
  valueColor?: (value: number) => string;
};

const PADDING = { top: 22, right: 10, bottom: 6, left: 10 };

export function TrendChart({
  series,
  labels,
  height = 150,
  showValues = false,
  showDots = false,
  maxValue,
  valueColor,
}: Props) {
  const t = useThemeTokens();
  const [width, setWidth] = React.useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const pointCount = Math.max(...series.map((s) => s.values.length), 0);
  const ceiling = React.useMemo(() => {
    if (maxValue) return maxValue;
    const highest = Math.max(...series.flatMap((s) => s.values), 1);
    // Üst sınırı biraz yukarı yuvarlayıp çizginin tavana yapışmasını önlüyoruz.
    return Math.ceil((highest * 1.15) / 10) * 10;
  }, [series, maxValue]);

  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const plotHeight = Math.max(height - PADDING.top - PADDING.bottom, 1);

  const xAt = (index: number) =>
    PADDING.left + (pointCount <= 1 ? plotWidth / 2 : (plotWidth * index) / (pointCount - 1));
  const yAt = (value: number) =>
    PADDING.top + plotHeight - (Math.max(value, 0) / ceiling) * plotHeight;

  const gridLines = [0.25, 0.5, 0.75].map((ratio) => PADDING.top + plotHeight * ratio);

  return (
    <View onLayout={onLayout}>
      {width > 0 && pointCount > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            {series.map((s, index) => (
              <LinearGradient key={index} id={`fill-${index}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={s.color} stopOpacity={t.isLight ? 0.22 : 0.3} />
                <Stop offset="1" stopColor={s.color} stopOpacity={0} />
              </LinearGradient>
            ))}
          </Defs>

          {/* Yatay kılavuz çizgileri */}
          {gridLines.map((y) => (
            <Line
              key={y}
              x1={PADDING.left}
              y1={y}
              x2={width - PADDING.right}
              y2={y}
              stroke={t.isLight ? '#e2e8f0' : '#1e293b'}
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          ))}

          {series.map((s, seriesIndex) => {
            if (s.values.length === 0) return null;

            const points = s.values.map((value, index) => `${xAt(index)},${yAt(value)}`);
            const linePath = `M ${points.join(' L ')}`;
            const areaPath = `${linePath} L ${xAt(s.values.length - 1)},${PADDING.top + plotHeight} L ${xAt(0)},${PADDING.top + plotHeight} Z`;

            return (
              <React.Fragment key={seriesIndex}>
                {s.fill ? <Path d={areaPath} fill={`url(#fill-${seriesIndex})`} /> : null}
                <Path
                  d={linePath}
                  stroke={s.color}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {showDots
                  ? s.values.map((value, index) => (
                      <Circle
                        key={index}
                        cx={xAt(index)}
                        cy={yAt(value)}
                        r={4.5}
                        fill={t.isLight ? '#ffffff' : '#0f172a'}
                        stroke={s.color}
                        strokeWidth={2.5}
                      />
                    ))
                  : null}
              </React.Fragment>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}

      {/* Değer yazıları SVG yerine metin katmanında — yazı tipi ekranın geri kalanıyla aynı kalsın. */}
      {showValues && width > 0 && series[0] ? (
        <View className="absolute left-0 right-0" style={{ top: 0 }}>
          {series[0].values.map((value, index) => (
            <Text
              key={index}
              className="absolute text-[10px] font-bold"
              style={{
                left: xAt(index) - 16,
                top: Math.max(yAt(value) - 20, 0),
                width: 32,
                textAlign: 'center',
                color: valueColor ? valueColor(value) : series[0].color,
              }}
            >
              {Math.round(value)}
            </Text>
          ))}
        </View>
      ) : null}

      {labels && labels.length > 0 && width > 0 ? (
        <View className="flex-row mt-1">
          {labels.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className={`text-[10px] ${t.muted}`}
              numberOfLines={1}
              style={{
                position: 'absolute',
                left: xAt(index) - 22,
                width: 44,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
          ))}
          {/* Mutlak konumlu etiketlere yer açmak için yükseklik rezervi. */}
          <View className="h-4" />
        </View>
      ) : null}
    </View>
  );
}
