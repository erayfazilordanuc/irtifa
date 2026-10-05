import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Award, Cpu, Mic, Keyboard, Play } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  ActionButton,
  toneColor,
  toneSoft,
  toneText,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { companiesForSector, companyColor, type CompanyId } from '../data/companies';
import { type InterviewType } from '../data/questions';
import { departmentsForSector, type DepartmentId } from '../data/sectors';
import { useProfile } from '../utils/profile';
import type { InterviewMode } from '../utils/interviewHistory';

// Özelleştirilmiş mülakat kurulumu.
// Seçimler doğrudan mülakat ekranına parametre olarak geçer; hiçbir şey kalıcı
// saklanmaz — kalıcı tercih Profil'deki sektör ve hedef alan.
//
// Kurum ve departman listeleri seçili sektörden süzülür (YAPILACAKLAR_İRTİFA
// Bölüm 00); sektör seçilmemişse bütün katalog gelir.

export default function CustomInterviewScreen({ navigation }: any) {
  const t = useThemeTokens();
  const profile = useProfile();

  const companies = React.useMemo(
    () => companiesForSector(profile.sectorId),
    [profile.sectorId],
  );
  const departments = React.useMemo(
    () => departmentsForSector(profile.sectorId),
    [profile.sectorId],
  );

  const [companyId, setCompanyId] = React.useState<CompanyId>(
    () => companies[0]?.id ?? '',
  );
  const [type, setType] = React.useState<InterviewType>('genel');
  // Varsayılan hedef alan profilden geliyor; seçilmemişse sektörün ilk alanı.
  const [department, setDepartment] = React.useState<DepartmentId>(
    () => profile.targetDepartment || (departments[0]?.id ?? ''),
  );
  const [mode, setMode] = React.useState<InterviewMode>('camera');

  const start = () => {
    navigation.replace('DailyInterview', {
      companyId,
      type,
      // Departman yalnızca teknik mülakatta anlamlı.
      department: type === 'teknik' ? department : undefined,
      mode,
    });
  };

  return (
    <AppScreen
      header={
        <AppHeader
          title="Özelleştirilmiş Mülakat"
          onBack={() => navigation.goBack()}
        />
      }
      footer={
        <ActionButton
          label="Mülakatı Başlat"
          variant="soft"
          icon={<Play size={18} color={toneColor('blue', t.isLight)} />}
          onPress={start}
        />
      }
    >
      {/* 1 — Kurum */}
      <Surface className="mt-1">
        <StepLabel>1. Hedef Süreçler (Kurum)</StepLabel>
        <View className="flex-row flex-wrap justify-between">
          {companies.map((company) => {
            const selected = company.id === companyId;
            const color = companyColor(company, t.isLight);
            return (
              <Pressable
                key={company.id}
                onPress={() => setCompanyId(company.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="w-[48%] rounded-2xl py-4 items-center justify-center mb-2.5"
                style={{
                  backgroundColor: selected ? color : t.isLight ? '#f1f5f9' : '#1e293b',
                }}
              >
                <Text
                  className={`text-[14px] font-bold ${selected ? 'text-white' : t.body}`}
                  numberOfLines={1}
                >
                  {company.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Surface>

      {/* 2 — Mülakat türü */}
      <Surface className="mt-3">
        <StepLabel>2. Mülakat Türü</StepLabel>
        <View className="flex-row">
          <TypeOption
            label="Genel"
            icon={<Award size={18} color={toneColor(type === 'genel' ? 'amber' : 'slate', t.isLight)} />}
            tone="amber"
            selected={type === 'genel'}
            onPress={() => setType('genel')}
          />
          <View className="w-3" />
          <TypeOption
            label="Teknik"
            icon={<Cpu size={18} color={toneColor(type === 'teknik' ? 'blue' : 'slate', t.isLight)} />}
            tone="blue"
            selected={type === 'teknik'}
            onPress={() => setType('teknik')}
          />
        </View>
      </Surface>

      {/* 3 — Departman: yalnızca teknik mülakatta sorulur */}
      {type === 'teknik' ? (
        <Surface className="mt-3">
          <StepLabel>3. Pozisyon / Departman</StepLabel>
          <View className="flex-row flex-wrap justify-between">
            {departments.map((item) => {
              const selected = item.id === department;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setDepartment(item.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`w-[48%] rounded-2xl px-3 py-4 items-center justify-center mb-2.5 ${
                    selected
                      ? t.isLight
                        ? 'bg-violet-600'
                        : 'bg-violet-500'
                      : t.isLight
                        ? 'bg-slate-100'
                        : 'bg-slate-800'
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold text-center ${selected ? 'text-white' : t.body}`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Surface>
      ) : null}

      {/* 4 — Giriş donanımı */}
      <Surface className="mt-3">
        <StepLabel>4. Giriş Donanımı</StepLabel>
        <ModeRow
          label="Mikrofon & Kamera"
          hint="Ses ve duruş analizi yapılır."
          icon={<Mic size={18} color={toneColor(mode === 'camera' ? 'blue' : 'slate', t.isLight)} />}
          selected={mode === 'camera'}
          onPress={() => setMode('camera')}
        />
        <ModeRow
          label="Yazılı (Silme Tuşu Yasak)"
          hint="Geri silme kapalıdır; akıcılık yazı üzerinden ölçülür."
          icon={
            <Keyboard size={18} color={toneColor(mode === 'typing' ? 'blue' : 'slate', t.isLight)} />
          }
          selected={mode === 'typing'}
          onPress={() => setMode('typing')}
          divider
        />
      </Surface>
    </AppScreen>
  );
}

function StepLabel({ children }: { children: React.ReactNode }) {
  const t = useThemeTokens();
  return (
    <Text className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${t.muted}`}>
      {children}
    </Text>
  );
}

function TypeOption({
  label,
  icon,
  tone,
  selected,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  tone: 'amber' | 'blue';
  selected: boolean;
  onPress: () => void;
}) {
  const t = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-1 flex-row items-center justify-center rounded-2xl py-4 border ${
        selected
          ? `${toneSoft(tone, t.isLight)} ${
              tone === 'amber'
                ? t.isLight
                  ? 'border-amber-300'
                  : 'border-amber-700'
                : t.isLight
                  ? 'border-blue-300'
                  : 'border-blue-700'
            }`
          : `${t.isLight ? 'bg-slate-100' : 'bg-slate-800'} border-transparent`
      }`}
    >
      {icon}
      <Text
        className={`text-[13px] font-bold ml-2 ${selected ? toneText(tone, t.isLight) : t.body}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ModeRow({
  label,
  hint,
  icon,
  selected,
  onPress,
  divider,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  divider?: boolean;
}) {
  const t = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`flex-row items-center py-3.5 ${divider ? `border-t ${t.dividerColor}` : ''}`}
    >
      {icon}
      <View className="flex-1 ml-3 pr-2">
        <Text className={`text-[13px] font-bold ${selected ? toneText('blue', t.isLight) : t.body}`}>
          {label}
        </Text>
        <Text className={`text-[11px] mt-0.5 ${t.muted}`}>{hint}</Text>
      </View>
      <View
        className={`w-3 h-3 rounded-full ${
          selected ? (t.isLight ? 'bg-blue-600' : 'bg-blue-400') : t.isLight ? 'bg-slate-200' : 'bg-slate-700'
        }`}
      />
    </Pressable>
  );
}
