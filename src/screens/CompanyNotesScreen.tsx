import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Building2, ChevronRight, Check } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  Badge,
  ActionButton,
  toneColor,
  toneSoft,
} from '../components/AppUI';
import { BottomSheet, useThemeTokens } from '../components/practice/PracticeUI';
import { companiesForSector, findCompany, type Company } from '../data/companies';
import { useProfile } from '../utils/profile';
import { getCompanyNote, saveCompanyNote, useCompanyNotes } from '../utils/companyNotes';

// Şirket araştırma notları — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// "Bu kurumun hangi projesini takip ettiniz?" mülakatın klasik sorusu; cevabı
// mülakat anında değil, haftalar önce okurken birikiyor. Not kurum kaydına
// bağlı (`companies.ts`), böylece o kurumla simülasyon başlatılırken
// hatırlatılabiliyor.
//
// Hazır sorular veriliyor, boş bir metin kutusu değil (KARARLAR "Kullanıcıdan
// içerik yazması istenmez"): kullanıcı neyi araştıracağını bilmek zorunda
// kalmasın.

const RESEARCH_PROMPTS = [
  'Son bir yılda öne çıkan projesi ne?',
  'Hangi ürün ya da teknolojiyle tanınıyor?',
  'Benim alanımda ne iş yapıyorlar?',
  'Neden orada çalışmak istiyorum — tek cümle.',
  'Mülakatta soracağım soru ne?',
];

export default function CompanyNotesScreen({ navigation }: any) {
  const t = useThemeTokens();
  const profile = useProfile();
  const notes = useCompanyNotes();
  const [editing, setEditing] = React.useState<Company | null>(null);

  const companies = companiesForSector(profile.sectorId);
  const withNotes = companies.filter((company) => (notes[company.id] ?? '').trim());
  const without = companies.filter((company) => !(notes[company.id] ?? '').trim());

  return (
    <AppScreen
      header={
        <AppHeader
          title="Şirket Notları"
          subtitle="Mülakat öncesi hatırlaman gerekenler."
          onBack={() => navigation.goBack()}
        />
      }
    >
      <Surface className="mt-1">
        <Text className={`text-[13px] font-bold ${t.title}`}>Ne yazmalı</Text>
        {RESEARCH_PROMPTS.map((prompt) => (
          <Text key={prompt} className={`text-[12px] mt-1.5 leading-5 ${t.body}`}>
            • {prompt}
          </Text>
        ))}
      </Surface>

      {withNotes.length > 0 ? (
        <View className="mt-4">
          <SectionLabel>NOTU OLANLAR · {withNotes.length}</SectionLabel>
          <View className="gap-2">
            {withNotes.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                note={notes[company.id]}
                onPress={() => setEditing(company)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {without.length > 0 ? (
        <View className="mt-4">
          <SectionLabel>DİĞER KURUMLAR</SectionLabel>
          <View className="gap-2">
            {without.map((company) => (
              <CompanyRow key={company.id} company={company} onPress={() => setEditing(company)} />
            ))}
          </View>
        </View>
      ) : null}

      {editing ? <NoteEditor company={editing} onClose={() => setEditing(null)} /> : null}
    </AppScreen>
  );
}

function CompanyRow({
  company,
  note,
  onPress,
}: {
  company: Company;
  note?: string;
  onPress: () => void;
}) {
  const t = useThemeTokens();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${company.shortName} notu${note ? ', not var' : ', boş'}. Açmak için dokun.`}
      className={`flex-row items-center rounded-2xl p-3.5 border ${t.cardBg} ${t.cardBorder}`}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${toneSoft('emerald', t.isLight)}`}
      >
        <Building2 size={18} color={toneColor('emerald', t.isLight)} />
      </View>
      <View className="flex-1 pr-2">
        <Text className={`text-[13px] font-bold ${t.title}`}>{company.shortName}</Text>
        <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
          {note?.trim() ? note.trim() : company.tagline}
        </Text>
      </View>
      {note?.trim() ? (
        <View className="mr-2">
          <Badge label="Not var" tone="emerald" />
        </View>
      ) : null}
      <ChevronRight size={17} color={t.iconColor} />
    </Pressable>
  );
}

function NoteEditor({ company, onClose }: { company: Company; onClose: () => void }) {
  const t = useThemeTokens();
  const [text, setText] = React.useState(() => getCompanyNote(company.id));

  const save = () => {
    saveCompanyNote(company.id, text);
    onClose();
  };

  return (
    <BottomSheet visible onClose={onClose} title={company.shortName} subtitle={company.focus}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={RESEARCH_PROMPTS.join('\n')}
        placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
        multiline
        textAlignVertical="top"
        className={`rounded-2xl px-4 py-3 mb-3 text-[13px] border ${
          t.isLight
            ? 'bg-slate-100 text-slate-900 border-transparent'
            : 'bg-[#141417] text-white border-[#2e2e33]'
        }`}
        style={{ minHeight: 220 }}
      />
      <ActionButton label="Kaydet" onPress={save} icon={<Check size={16} color="#ffffff" />} />
    </BottomSheet>
  );
}
