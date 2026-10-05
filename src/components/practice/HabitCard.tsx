import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Plus, Check } from 'lucide-react-native';

import { toneColor } from '../AppUI';
import { Card, ProgressBar, useThemeTokens } from './PracticeUI';
import { HABIT_TEMPLATES } from '../../data/habitTemplates';
import { useHabits, habitCount, incrementHabit } from '../../utils/habitReminders';

// Atölye sekmesindeki aralıklı hatırlatıcı sayaç kartı — YAPILACAKLAR Bölüm 4a.
//
// Yalnızca AÇIK ve günlük hedefi olan (dailyTarget) şablonlar satır olur;
// hiçbiri yoksa kart hiç render edilmez — Hatırlatıcılar ekranından kapatılan
// ya da hedefsiz bir şablon burada da görünmez, tek kural aynı yerde kalıyor.

export function HabitCard() {
  const t = useThemeTokens();
  const habits = useHabits();

  const rows = HABIT_TEMPLATES.filter(
    (template) => habits.reminders[template.id]?.enabled && template.dailyTarget,
  );

  if (rows.length === 0) return null;

  const doneCount = rows.filter(
    (template) => habitCount(habits, template.id) >= (template.dailyTarget ?? 0),
  ).length;

  return (
    <Card className="mt-4">
      <View className="flex-row items-center justify-between mb-1">
        <Text className={`text-[11px] font-bold uppercase tracking-widest ${t.muted}`}>
          GÜNÜN RİTMİ
        </Text>
        <Text
          className={`text-[11px] font-bold ${
            doneCount === rows.length ? (t.isLight ? 'text-emerald-600' : 'text-emerald-400') : t.muted
          }`}
        >
          {doneCount}/{rows.length}
        </Text>
      </View>
      <Text className={`text-[11px] mb-2 ${t.muted}`}>
        {rows.length} açık aralıklı hatırlatıcı
      </Text>

      {rows.map((template, index) => {
        const target = template.dailyTarget ?? 0;
        const count = habitCount(habits, template.id);
        const done = count >= target;

        return (
          <View
            key={template.id}
            className={`py-3 ${index > 0 ? `border-t ${t.dividerColor}` : ''}`}
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className={`text-[13px] font-bold flex-1 pr-2 ${t.title}`} numberOfLines={1}>
                {template.label}
              </Text>
              <Text
                className={`text-[12px] font-bold ${
                  done ? (t.isLight ? 'text-emerald-600' : 'text-emerald-400') : t.muted
                }`}
              >
                {count}/{target} {template.unit}
              </Text>
            </View>
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <View className="flex-1">
                <ProgressBar value={target === 0 ? 0 : count / target} tone="emerald" />
              </View>
              <Pressable
                onPress={() => incrementHabit(template.id)}
                accessibilityRole="button"
                accessibilityLabel={`${template.label} sayacını bir artır`}
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  t.isLight ? 'bg-emerald-50' : 'bg-emerald-950'
                }`}
              >
                {done ? (
                  <Check size={16} color={toneColor('emerald', t.isLight)} />
                ) : (
                  <Plus size={16} color={toneColor('emerald', t.isLight)} />
                )}
              </Pressable>
            </View>
          </View>
        );
      })}
    </Card>
  );
}
