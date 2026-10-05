import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Clock, Zap, Calendar, RotateCcw, Trash2 } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  StatTile,
  ActionButton,
  BenefitRow,
  Badge,
  toneColor,
  type Tone,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { getExerciseLog, removeExerciseLog } from '../utils/exerciseHistory';
import { DIFFICULTY_LABELS, getCategory, getExercise } from '../data/exercises';
import { formatDuration, formatShortDate } from '../utils/dateUtils';

// Egzersiz geçmişindeki tek bir kaydın detayı.
// Kayıt kişisel ölçümü, katalog bilgisi ise egzersizin tanımını gösterir.

export default function ExerciseDetailScreen({ navigation, route }: any) {
  const t = useThemeTokens();
  const log = getExerciseLog(route?.params?.logId);
  const exercise = log ? getExercise(log.exerciseId) : undefined;
  const category = exercise ? getCategory(exercise.categoryId) : undefined;
  const accent: Tone = category?.accent ?? 'violet';

  if (!log) {
    return (
      <AppScreen header={<AppHeader title="Egzersiz Kaydı" onBack={() => navigation.goBack()} />}>
        <Surface className="mt-4">
          <Text className={`text-[12px] ${t.body}`}>Bu kayıt bulunamadı.</Text>
        </Surface>
      </AppScreen>
    );
  }

  const date = new Date(log.timestamp);

  const confirmDelete = () => {
    Alert.alert('Kaydı sil', 'Bu egzersiz kaydı kalıcı olarak silinecek.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          removeExerciseLog(log.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <AppScreen
      header={
        <AppHeader
          title={log.title}
          subtitle={log.categoryLabel}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {/* Ölçümler */}
      <View className="flex-row gap-3 mt-1">
        <StatTile
          label="Efor"
          value={log.effort}
          unit="/100"
          icon={<Zap size={14} color={toneColor(accent, t.isLight)} />}
          tone={accent}
        />
        <StatTile
          label="Süre"
          value={formatDuration(log.durationSeconds)}
          icon={<Clock size={14} color={toneColor('blue', t.isLight)} />}
          tone="blue"
        />
      </View>

      <Surface className="mt-3">
        <View className="flex-row items-center">
          <Calendar size={15} color={t.iconColor} />
          <Text className={`text-[12px] ml-2 ${t.body}`}>{formatShortDate(date)}</Text>
          <Text className={`text-[12px] ml-auto ${t.muted}`}>
            {String(date.getHours()).padStart(2, '0')}:{String(date.getMinutes()).padStart(2, '0')}
          </Text>
        </View>
        {log.summary ? (
          <Text className={`text-[12px] mt-3 pt-3 border-t leading-5 ${t.dividerColor} ${t.body}`}>
            {log.summary}
          </Text>
        ) : null}
      </Surface>

      {/* Katalog bilgisi */}
      {exercise ? (
        <Surface className="mt-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className={`text-[11px] font-bold uppercase tracking-widest ${t.muted}`}>
              EGZERSİZ HAKKINDA
            </Text>
            <Badge
              label={DIFFICULTY_LABELS[exercise.difficulty]}
              tone={
                exercise.difficulty === 'kolay'
                  ? 'emerald'
                  : exercise.difficulty === 'orta'
                    ? 'amber'
                    : 'rose'
              }
            />
          </View>
          <Text className={`text-[12px] leading-6 ${t.body}`}>{exercise.description}</Text>
          <View className={`mt-3 pt-1 border-t ${t.dividerColor}`}>
            {exercise.benefits.map((benefit) => (
              <BenefitRow key={benefit} text={benefit} />
            ))}
          </View>
        </Surface>
      ) : null}

      {exercise ? (
        <View className="mt-4">
          <ActionButton
            label="Tekrar Yap"
            tone={accent}
            icon={<RotateCcw size={16} color="#ffffff" />}
            onPress={() => {
              navigation.goBack();
              navigation.navigate('ExerciseEngine', { exerciseId: exercise.id });
            }}
          />
        </View>
      ) : null}

      <View className="mt-2">
        <ActionButton
          label="Kaydı Sil"
          variant="outline"
          icon={<Trash2 size={16} color={toneColor('rose', t.isLight)} />}
          onPress={confirmDelete}
        />
      </View>
    </AppScreen>
  );
}
