import React from 'react';
import { View, Text, Pressable } from 'react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  toneSoft,
  toneText,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { TestTrend } from '../components/practice/TestTrend';
import { MeasureScale } from '../components/practice/MeasureTests';
import { trUpper } from '../utils/text';
import { testHistory, useDailyProgress, type ProgressState } from '../utils/dailyPracticeProgress';
import { AREA_LABELS, AREA_ORDER, MEASURE_TESTS, type MeasureArea } from '../data/measureTests';

// Karne — bütün kasıtlı ölçümler tek ekranda (YAPILACAKLAR Bölüm 5).
//
// Karne sekmesinden düğmeyle açılır: Karne bir özet ekranı (seriler,
// kariyer/zihin kutuları, geçmiş kısayolları, gelişim eğrisi); on testin
// tamamını oraya sığdırmak sayfayı özet olmaktan çıkarıyordu (KARARLAR
// "Karne ayrı ekranda").
//
// Ölçümün kendisi burada YAPILMAZ: her testin "Ölç" düğmesi ölçümün yapıldığı
// modül ekranını (gerekiyorsa doğru sekmesiyle) açar — kayıt `measureTests.ts`.

export default function MeasurementsScreen({ navigation }: any) {
  const t = useThemeTokens();
  const { progress } = useDailyProgress();

  const measured = MEASURE_TESTS.filter((test) => testHistory(progress, test.id).length > 0).length;

  return (
    <AppScreen
      header={
        <AppHeader
          title="Karne"
          subtitle={`${measured}/${MEASURE_TESTS.length} testte ölçümün var`}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <Text className={`text-[11px] leading-4 mb-1 ${t.muted}`}>
        Bunlar öz-ölçüm, klinik ölçüm değil — hiçbiri akciğer hacmi ölçmez. Karşılaştırma ancak
        benzer koşullarda (aynı saat, oturur pozisyon, tok karnına değil) anlamlı.
      </Text>

      {AREA_ORDER.map((area) => (
        <MeasureAreaSection key={area} area={area} progress={progress} navigation={navigation} />
      ))}
    </AppScreen>
  );
}

/**
 * Karnenin bir alanı (Nefes / Veriş / Diksiyon / Dil & İfade): `MEASURE_TESTS`
 * içindeki tüm testleri listeler. Ölçümü olmayan test de görünür — sayfa boş
 * durumda çökük görünmesin diye (Bölüm 0.2 kararı) — yalnızca "Henüz ölçüm yok" der.
 */
function MeasureAreaSection({
  area,
  progress,
  navigation,
}: {
  area: MeasureArea;
  progress: ProgressState;
  navigation: any;
}) {
  const t = useThemeTokens();
  const tests = MEASURE_TESTS.filter((test) => test.area === area);

  return (
    <View className="mb-1">
      {/* Türkçe büyük harf: düz `toUpperCase()` 'Dil & İfade'yi "DIL & İFADE"
          yapıyordu (bkz. `trUpper`). */}
      <SectionLabel>{trUpper(AREA_LABELS[area])}</SectionLabel>
      <View className="gap-2">
        {tests.map((test) => {
          const history = testHistory(progress, test.id);
          const last = history[history.length - 1];
          return (
            <Surface key={test.id}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className={`text-[13px] font-bold ${t.title}`}>{test.label}</Text>
                  <Text className={`text-[11px] mt-0.5 leading-4 ${t.muted}`}>{test.short}</Text>
                </View>
                <Text className={`text-[13px] font-bold ${t.title}`}>
                  {last ? `${last.value.toFixed(test.decimals)} ${test.unit}` : '—'}
                </Text>
              </View>

              {history.length > 0 && last ? (
                <>
                  {/* "Nerdeyim" çubuğu: son ölçümün skaladaki yeri. */}
                  <MeasureScale test={test} value={last.value} history={history} />
                  <TestTrend
                    history={history}
                    unit={test.unit}
                    decimals={test.decimals}
                    improvement={test.improvement}
                  />
                </>
              ) : (
                <Text className={`text-[11px] mt-3 ${t.muted}`}>Henüz ölçüm yok.</Text>
              )}

              <Pressable
                onPress={() => navigation.navigate(test.screen, test.params)}
                accessibilityRole="button"
                accessibilityLabel={`${test.label} ölçümünü aç`}
                className={`mt-3 rounded-xl py-2.5 items-center justify-center ${toneSoft('emerald', t.isLight)}`}
              >
                <Text className={`text-[12px] font-bold ${toneText('emerald', t.isLight)}`}>Ölç</Text>
              </Pressable>
            </Surface>
          );
        })}
      </View>
    </View>
  );
}
