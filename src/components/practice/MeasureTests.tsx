import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Check, Minus, Plus, TriangleAlert } from 'lucide-react-native';

import { Card, GhostButton, PrimaryButton, SectionTitle, useThemeTokens } from './PracticeUI';
import { TestTrend } from './TestTrend';
import type { TestResult } from '../../utils/dailyPracticeProgress';
import {
  personalScalePosition,
  referenceScalePosition,
  type MeasureTest,
} from '../../data/measureTests';

// Kasıtlı ölçümlerin (testlerin) ortak arayüz parçaları — YAPILACAKLAR Bölüm 5.
//
// Her test ekranı kendi kabuğunu, kaydet düğmesini ve geçmiş eğrisini yeniden
// yazmasın diye ayrıldı: `MeasureCard` başlığı, koşul notunu, sonucu, kaydı ve
// `TestTrend`'i verir; ölçümün kendisi `children` olarak geçilir.
//
// Ölçüm dürüstlüğü kuralları kayıtta (`src/data/measureTests.ts`): koşul notu
// ölçümden ÖNCE görünür, "iyileşme" yönü testin kendi tanımından gelir.

export function MeasureCard({
  test,
  history,
  value,
  onSave,
  children,
  hint,
  startLabel,
  startHint,
}: {
  test: MeasureTest;
  history: TestResult[];
  /** Ölçüm sonucu; henüz ölçülmediyse null. */
  value: number | null;
  onSave: (value: number) => void;
  children: React.ReactNode;
  /** Sonucun altına yazılan açıklama (tipik aralık vb.). */
  hint?: string;
  /**
   * Verilirse ölçüm arayüzü bir "başla" düğmesinin arkasında durur.
   *
   * Kronometreyle ölçülen testlerin kendi başlat düğmesi var; sayaç ve
   * öz-kontrol listesiyle ölçülenlerde ise ölçümün ne zaman başladığı belli
   * değildi — kullanıcı karta bakıp ne yapacağını anlamıyordu. Bu kapı o
   * testlere ortak bir başlangıç anı veriyor.
   */
  startLabel?: string;
  /** Başla düğmesinin üstündeki tek satırlık yönerge. */
  startHint?: string;
}) {
  const t = useThemeTokens();
  const [saved, setSaved] = React.useState<number | null>(null);
  const [started, setStarted] = React.useState(false);
  // Ölçüm zaten yapıldıysa kapı kapanmaz: sonucu görüp tekrar ölçmek isteyen
  // kişi düğmeye ikinci kez basmak zorunda kalmasın.
  const gated = Boolean(startLabel) && !started && value === null;

  return (
    <View>
      <SectionTitle hint={test.short}>{test.label}</SectionTitle>
      <Card>
        {test.note ? (
          <View
            className={`flex-row rounded-xl p-3 mb-3 ${t.isLight ? 'bg-amber-50' : 'bg-[#2e1d0d]'}`}
          >
            <TriangleAlert size={14} color={t.isLight ? '#d97706' : '#fbbf24'} />
            <Text
              className={`text-[11px] leading-4 ml-2 flex-1 ${
                t.isLight ? 'text-amber-700' : 'text-amber-300'
              }`}
            >
              {test.note}
            </Text>
          </View>
        ) : null}

        {gated ? (
          <View className="py-1">
            {startHint ? (
              <Text className={`text-[12px] leading-5 mb-3 text-center ${t.muted}`}>{startHint}</Text>
            ) : null}
            <GhostButton label={startLabel!} onPress={() => setStarted(true)} />
          </View>
        ) : (
          children
        )}

        {value !== null ? (
          <View className={`mt-3 pt-3 border-t ${t.dividerColor}`}>
            <View className="flex-row items-end">
              <Text className={`text-[28px] font-black ${t.title}`}>
                {value.toFixed(test.decimals)}
              </Text>
              <Text className={`text-[12px] mb-1.5 ml-1.5 ${t.muted}`}>{test.unit}</Text>
            </View>
            {hint ? <Text className={`text-[11px] mt-1 leading-4 ${t.muted}`}>{hint}</Text> : null}

            <MeasureScale test={test} value={value} history={history} />

            {/* Kaydet düğmesi ölçüm kaydedildikten sonra da duruyor: aynı değeri
                ikinci kez ölçmek geçerli bir veri noktasıdır (özellikle sayma ve
                0-5 öz-kontrol gibi tam sayılı ölçümlerde aynı sonuç sık çıkar).
                Düğme gizlenseydi ikinci ölçüm kaydedilemezdi. */}
            <View className="mt-3">
              <PrimaryButton
                label="Bu ölçümü kaydet"
                tone="emerald"
                onPress={() => {
                  onSave(value);
                  setSaved(value);
                }}
              />
              {saved === value ? (
                <Text className={`text-[12px] font-bold mt-2 text-center ${t.accent}`}>
                  Kaydedildi.
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <TestTrend
          history={history}
          unit={test.unit}
          decimals={test.decimals}
          improvement={test.improvement}
        />
      </Card>
    </View>
  );
}

/**
 * "Ben neredeyim" çubuğu — ölçümden sonra değerin nereye düştüğünü gösterir.
 *
 * İki tür skala var (`src/data/measureTests.ts` → `MeasureScale`):
 * - `reference`: savunulabilir tipik aralığı ya da doğal sınırları olan
 *   ölçümler (dinlenik solunum hızı, okuma hızı, yüzde, 0-5 öz-kontrol).
 * - `personal`: genel normu OLMAYAN ölçümler. Bunlarda nüfus normu uydurmak
 *   yerine kişinin kendi ölçüm aralığı skala oluyor; nefes tutma gibi
 *   testlerde "hedef" göstermek zorlamayı teşvik ederdi.
 */
export function MeasureScale({
  test,
  value,
  history,
}: {
  test: MeasureTest;
  value: number;
  history: TestResult[];
}) {
  const t = useThemeTokens();
  const scale = test.scale;
  if (!scale) return null;

  const caption = (
    <Text className={`text-[11px] mt-2 leading-4 ${t.muted}`}>{scale.caption}</Text>
  );

  const track = (segments: { label: string; flex: number; typical?: boolean }[], ratio: number) => (
    <View style={{ position: 'relative' }} className="mt-2">
      <View className="flex-row h-2.5 rounded-full overflow-hidden">
        {segments.map((segment) => (
          <View
            key={segment.label}
            style={{ flex: Math.max(segment.flex, 0.0001) }}
            className={
              segment.typical
                ? t.isLight
                  ? 'bg-emerald-300'
                  : 'bg-emerald-700'
                : t.isLight
                  ? 'bg-slate-200'
                  : 'bg-slate-700'
            }
          />
        ))}
      </View>
      <View
        style={{ position: 'absolute', left: `${Math.max(0, Math.min(1, ratio)) * 100}%`, top: -3.5 }}
        pointerEvents="none"
      >
        <View
          style={{ marginLeft: -8 }}
          className={`w-4 h-4 rounded-full border-2 ${
            t.isLight ? 'bg-white border-slate-900' : 'bg-[#1a1a1d] border-white'
          }`}
        />
      </View>
    </View>
  );

  if (scale.kind === 'personal') {
    const values = history.map((result) => result.value);
    // Kendi aralığı ancak iki ölçümden sonra oluşur; tek ölçümde çubuk
    // gösterilse değer her zaman uçta durur ve yanıltırdı.
    if (values.length < 2) {
      return (
        <Text className={`text-[11px] mt-3 leading-4 ${t.muted}`}>
          İkinci ölçümünden sonra kendi aralığında nerede olduğunu burada göreceksin.
        </Text>
      );
    }

    const fmt = (n: number) => `${n.toFixed(test.decimals)} ${test.unit}`;
    // Aralık hesabı saf modülde (`measureTests.ts`); sınır durumları Node
    // altında sınanıyor.
    const position = personalScalePosition(values, value);

    if (!position) {
      return (
        <Text className={`text-[11px] mt-3 leading-4 ${t.muted}`}>
          Bütün ölçümlerin aynı: {fmt(values[0])}. Aralık oluşunca çubuk burada çıkacak.
        </Text>
      );
    }

    const { min, max, ratio } = position;

    return (
      <View className="mt-3">
        <View className="flex-row items-center justify-between">
          <Text className={`text-[11px] font-bold ${t.muted}`}>En düşük {fmt(min)}</Text>
          <Text className={`text-[11px] font-bold ${t.muted}`}>En yüksek {fmt(max)}</Text>
        </View>
        {track([{ label: 'personal', flex: 1 }], ratio)}
        {caption}
      </View>
    );
  }

  // Dilim genişlikleri, işaretçinin yeri ve hangi dilimde olunduğu saf modülde
  // hesaplanıyor (`measureTests.ts` → `referenceScalePosition`).
  const { segments, ratio, current } = referenceScalePosition(scale, value);

  return (
    <View className="mt-3">
      <Text className={`text-[11px] font-bold ${t.title}`}>
        Şu an: <Text className={t.accent}>{current}</Text>
      </Text>
      {track(segments, ratio)}
      <View className="flex-row mt-1.5">
        {segments.map((segment) => (
          <Text
            key={segment.label}
            style={{ flex: Math.max(segment.flex, 0.0001) }}
            className={`text-[10px] ${segment.typical ? t.body : t.muted}`}
            numberOfLines={1}
          >
            {segment.label}
          </Text>
        ))}
      </View>
      {caption}
    </View>
  );
}

/**
 * Bas-başlat / bas-durdur kronometre. Mikrofonla otomatik ölçüm bilerek yok
 * (Bölüm 5: gürültüde eşik güvenilmez, manuel ölçüm daha dürüst).
 */
export function HoldTimer({
  onResult,
  startLabel = 'Başlat',
  stopLabel = 'Durdur',
  running: runningLabelHint,
}: {
  onResult: (seconds: number) => void;
  startLabel?: string;
  stopLabel?: string;
  /** Sayaç işlerken gösterilen tek satır. */
  running?: string;
}) {
  const t = useThemeTokens();
  const [running, setRunning] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const startedAt = React.useRef<number | null>(null);
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = React.useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  React.useEffect(() => stopTimer, [stopTimer]);

  const start = () => {
    startedAt.current = Date.now();
    setElapsed(0);
    setRunning(true);
    stopTimer();
    timer.current = setInterval(() => {
      if (startedAt.current !== null) setElapsed((Date.now() - startedAt.current) / 1000);
    }, 100);
  };

  const stop = () => {
    stopTimer();
    setRunning(false);
    const seconds = startedAt.current === null ? 0 : (Date.now() - startedAt.current) / 1000;
    startedAt.current = null;
    setElapsed(seconds);
    onResult(Math.round(seconds * 10) / 10);
  };

  return (
    <View>
      <View className="items-center py-2">
        <Text className={`text-[36px] font-black ${running ? t.title : t.muted}`}>
          {elapsed.toFixed(1)}
        </Text>
        <Text className={`text-[11px] ${t.muted}`}>saniye</Text>
      </View>
      {running && runningLabelHint ? (
        <Text className={`text-[11px] text-center mb-2 ${t.muted}`}>{runningLabelHint}</Text>
      ) : null}
      {running ? (
        <PrimaryButton label={stopLabel} tone="emerald" onPress={stop} />
      ) : (
        <GhostButton label={startLabel} onPress={start} />
      )}
    </View>
  );
}

/** Artır/azalt sayacı — "tek nefeste sayma", "kaç nefes" gibi elle girilen ölçümler. */
export function CountStepper({
  value,
  onChange,
  unit,
  min = 0,
  max = 999,
  step = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const t = useThemeTokens();
  const clamp = (next: number) => Math.max(min, Math.min(max, next));

  const Btn = ({ icon, delta, label }: { icon: React.ReactNode; delta: number; label: string }) => (
    <Pressable
      onPress={() => onChange(clamp(value + delta))}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      className={`w-12 h-12 rounded-2xl items-center justify-center border ${t.cardBorder}`}
    >
      {icon}
    </Pressable>
  );

  return (
    <View className="flex-row items-center justify-center py-2">
      <Btn icon={<Minus size={18} color={t.iconColor} />} delta={-step} label="Azalt" />
      <View className="items-center mx-6">
        <Text className={`text-[32px] font-black ${t.title}`}>{value}</Text>
        <Text className={`text-[11px] ${t.muted}`}>{unit}</Text>
      </View>
      <Btn icon={<Plus size={18} color={t.iconColor} />} delta={step} label="Artır" />
    </View>
  );
}

/** Öz-kontrol listesi — işaretlenen madde sayısı ölçümün kendisi olur (ör. 0-5). */
export function SelfCheckList({
  items,
  checked,
  onToggle,
}: {
  items: string[];
  checked: boolean[];
  onToggle: (index: number) => void;
}) {
  const t = useThemeTokens();
  return (
    <View>
      {items.map((item, index) => {
        const isChecked = checked[index] ?? false;
        return (
          <Pressable
            key={item}
            onPress={() => onToggle(index)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
            accessibilityLabel={item}
            className={`flex-row items-center rounded-2xl border p-3 mb-2 ${
              isChecked
                ? t.isLight
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-[#0d2822] border-emerald-800'
                : `${t.cardBg} ${t.cardBorder}`
            }`}
          >
            <View
              className={`w-6 h-6 rounded-lg items-center justify-center mr-3 ${
                isChecked ? 'bg-emerald-600' : t.isLight ? 'bg-slate-100' : 'bg-[#2a2a2e]'
              }`}
            >
              {isChecked ? <Check size={14} color="#ffffff" /> : null}
            </View>
            <Text className={`text-[12px] leading-5 flex-1 ${t.body}`}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
