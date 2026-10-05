import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Plus, Trash2, ChevronRight, Building2 } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  Badge,
  ActionButton,
  TextField,
  EmptyState,
  toneColor,
  toneSoft,
  toneText,
} from '../components/AppUI';
import { BottomSheet, useThemeTokens } from '../components/practice/PracticeUI';
import {
  addApplication,
  removeApplication,
  setStage,
  updateApplication,
  useApplications,
  STAGE_META,
  STAGE_ORDER,
  type Application,
  type ApplicationStage,
} from '../utils/applications';
import { companiesForSector, findCompany } from '../data/companies';
import { useProfile } from '../utils/profile';
import { formatShortDate } from '../utils/dateUtils';

// Başvuru takibi — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// Liste + aşama; kanban yerine aşamaya göre gruplanmış tek bir liste seçildi:
// telefonda yatay kaydırmalı kanban dar ekranda okunmuyor, aynı bilgiyi dikey
// gruplar da veriyor.
//
// Şirket adı serbest metin — katalogda olmayan şirketler de takip edilebilsin
// (katalog mülakat simülasyonu için, başvuru takibi için değil). Katalogdaki
// bir kurum seçilirse şirket notu ve simülasyon o kayda bağlanır.

export default function ApplicationsScreen({ navigation }: any) {
  const t = useThemeTokens();
  const applications = useApplications();
  const [editing, setEditing] = React.useState<Application | 'new' | null>(null);

  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    items: applications.filter((item) => item.stage === stage),
  })).filter((group) => group.items.length > 0);

  return (
    <AppScreen
      header={
        <AppHeader
          title="Başvuru Takibi"
          subtitle="Nereye başvurdun, hangi aşamadasın."
          onBack={() => navigation.goBack()}
        />
      }
      footer={
        <ActionButton
          label="Başvuru ekle"
          onPress={() => setEditing('new')}
          icon={<Plus size={16} color="#ffffff" />}
        />
      }
    >
      {applications.length === 0 ? (
        <View className="mt-6">
          <EmptyState message="Henüz başvuru eklemedin. Başvurduğun her ilanı buraya yazarsan hangi aşamada ne beklediğini tek yerden görürsün." />
        </View>
      ) : null}

      {grouped.map((group) => (
        <View key={group.stage} className="mt-3">
          <SectionLabel>
            {STAGE_META[group.stage].label.toLocaleUpperCase('tr-TR')} · {group.items.length}
          </SectionLabel>
          <View className="gap-2">
            {group.items.map((item) => (
              <ApplicationRow key={item.id} application={item} onPress={() => setEditing(item)} />
            ))}
          </View>
        </View>
      ))}

      <ApplicationSheet
        target={editing}
        onClose={() => setEditing(null)}
      />
    </AppScreen>
  );
}

function ApplicationRow({
  application,
  onPress,
}: {
  application: Application;
  onPress: () => void;
}) {
  const t = useThemeTokens();
  const meta = STAGE_META[application.stage];
  const last = application.history[application.history.length - 1];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${application.companyName}, ${application.position || 'pozisyon yok'}, ${meta.label}. Düzenlemek için dokun.`}
      className={`flex-row items-center rounded-2xl p-3.5 border ${t.cardBg} ${t.cardBorder}`}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${toneSoft(meta.tone, t.isLight)}`}
      >
        <Building2 size={18} color={toneColor(meta.tone, t.isLight)} />
      </View>
      <View className="flex-1 pr-2">
        <Text className={`text-[13px] font-bold ${t.title}`} numberOfLines={1}>
          {application.companyName}
        </Text>
        <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
          {application.position || 'Pozisyon yazılmadı'}
          {last ? ` · ${formatShortDate(new Date(last.at))}` : ''}
        </Text>
      </View>
      <Badge label={meta.label} tone={meta.tone} />
      <View className="ml-2">
        <ChevronRight size={17} color={t.iconColor} />
      </View>
    </Pressable>
  );
}

/** Ekleme ve düzenleme aynı sayfa: alanlar aynı, tek fark kaydın var olup olmaması. */
function ApplicationSheet({
  target,
  onClose,
}: {
  target: Application | 'new' | null;
  onClose: () => void;
}) {
  const t = useThemeTokens();
  const profile = useProfile();
  const existing = target && target !== 'new' ? target : null;

  const [companyName, setCompanyName] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [note, setNote] = React.useState('');
  const [stage, setStageValue] = React.useState<ApplicationStage>('basvuruldu');
  const [companyId, setCompanyId] = React.useState<string | undefined>(undefined);

  // Sayfa her açılışta hedefin değerleriyle dolar.
  React.useEffect(() => {
    if (!target) return;
    setCompanyName(existing?.companyName ?? '');
    setPosition(existing?.position ?? '');
    setNote(existing?.note ?? '');
    setStageValue(existing?.stage ?? 'basvuruldu');
    setCompanyId(existing?.companyId);
  }, [target, existing]);

  const catalog = companiesForSector(profile.sectorId);

  const save = () => {
    const name = companyName.trim();
    if (!name) {
      Alert.alert('Şirket adı gerekli', 'En azından şirketin adını yaz.');
      return;
    }
    if (existing) {
      updateApplication(existing.id, { companyName: name, position, note, companyId });
      if (existing.stage !== stage) setStage(existing.id, stage);
    } else {
      addApplication({ companyName: name, position, note, stage, companyId });
    }
    onClose();
  };

  const confirmRemove = () => {
    if (!existing) return;
    Alert.alert('Başvuruyu sil', `${existing.companyName} kaydı silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          removeApplication(existing.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <BottomSheet
      visible={target !== null}
      onClose={onClose}
      title={existing ? 'Başvuruyu düzenle' : 'Yeni başvuru'}
    >
      <TextField
        label="Şirket"
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Şirketin adı"
      />

      {catalog.length > 0 ? (
        <View className="mb-3">
          <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${t.muted}`}>
            Katalogdan seç (isteğe bağlı)
          </Text>
          <View className="flex-row flex-wrap">
            {catalog.map((company) => {
              const selected = companyId === company.id;
              return (
                <Pressable
                  key={company.id}
                  onPress={() => {
                    // Seçili kuruma tekrar dokunmak bağı kaldırır.
                    setCompanyId(selected ? undefined : company.id);
                    if (!selected) setCompanyName(company.shortName);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${company.shortName} kurumuna bağla`}
                  accessibilityState={{ selected }}
                  className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                    selected
                      ? `${toneSoft('blue', t.isLight)} border-transparent`
                      : t.cardBorder
                  }`}
                >
                  <Text
                    className={`text-[12px] font-bold ${
                      selected ? toneText('blue', t.isLight) : t.muted
                    }`}
                  >
                    {company.shortName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <TextField
        label="Pozisyon"
        value={position}
        onChangeText={setPosition}
        placeholder="Gömülü yazılım mühendisi"
      />

      <View className="mb-3">
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${t.muted}`}>
          Aşama
        </Text>
        <View className="flex-row flex-wrap">
          {STAGE_ORDER.map((item) => {
            const selected = stage === item;
            const meta = STAGE_META[item];
            return (
              <Pressable
                key={item}
                onPress={() => setStageValue(item)}
                accessibilityRole="button"
                accessibilityLabel={`${meta.label} aşaması`}
                accessibilityState={{ selected }}
                className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                  selected
                    ? `${toneSoft(meta.tone, t.isLight)} border-transparent`
                    : t.cardBorder
                }`}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    selected ? toneText(meta.tone, t.isLight) : t.muted
                  }`}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <TextField
        label="Not"
        value={note}
        onChangeText={setNote}
        placeholder="İlan linki, iletişim kişisi, hatırlatma"
      />

      {existing ? (
        <Surface className="mb-3">
          <Text className={`text-[11px] font-bold ${t.muted}`}>GEÇMİŞ</Text>
          {existing.history.map((change, index) => (
            <Text key={`${change.stage}-${index}`} className={`text-[12px] mt-1.5 ${t.body}`}>
              • {STAGE_META[change.stage].label} — {formatShortDate(new Date(change.at))}
            </Text>
          ))}
          {existing.companyId && findCompany(existing.companyId) ? (
            <Text className={`text-[11px] mt-2 ${t.muted}`}>
              {findCompany(existing.companyId)?.shortName} kurumuna bağlı — şirket notun ve
              simülasyon bu kaydı kullanır.
            </Text>
          ) : null}
        </Surface>
      ) : null}

      <ActionButton label={existing ? 'Kaydet' : 'Ekle'} onPress={save} />

      {existing ? (
        <View className="mt-2">
          <ActionButton
            label="Başvuruyu sil"
            tone="rose"
            variant="soft"
            onPress={confirmRemove}
            icon={<Trash2 size={16} color={toneColor('rose', t.isLight)} />}
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}
