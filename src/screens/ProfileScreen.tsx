import React from 'react';
import { View, Text, Pressable, FlatList, InteractionManager, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Settings as SettingsIcon,
  Pencil,
  Activity,
  User,
  ChevronRight,
  X,
  Award,
  Flame,
  Wind,
  Cpu,
  Bell,
  Sparkles,
  Camera,
  Check,
  Target,
  Building2,
} from 'lucide-react-native';

import {
  AppScreen,
  TabHeader,
  Surface,
  ActionButton,
  TextField,
  RoundButton,
  SectionLabel,
  ActionRow,
  Badge,
  toneColor,
  toneSoft,
  toneText,
  toneFill,
  type Tone,
} from '../components/AppUI';
import { BottomSheet, Chip, SectionTitle, SheetOverlay, useThemeTokens } from '../components/practice/PracticeUI';
import {
  PROFILE_ICON_GROUPS,
  profileIconComponent,
  saveProfile,
  targetDepartmentLabel,
  sectorLabel,
  selectSector,
  selectDepartment,
  useProfile,
  type Profile,
  type ProfileIconId,
} from '../utils/profile';
import { SECTORS, departmentsForSector } from '../data/sectors';
import { useDailyProgress } from '../utils/dailyPracticeProgress';
import { useDailyPracticeSettings } from '../utils/dailyPracticeSettings';
import { useAiAvailable } from '../utils/aiAvailability';
import { trUpper } from '../utils/text';
import { useOnboarding, updateOnboarding, GOAL_ORDER, GOAL_META, type DailyMinutes, type OnboardingGoal } from '../utils/onboarding';

// Profil sekmesi — kimlik, hedefler, kazanım rozetleri ve ayarlar.

const TONES: { id: Tone; label: string }[] = [
  { id: 'blue', label: 'Mavi' },
  { id: 'emerald', label: 'Zümrüt' },
  { id: 'violet', label: 'Mor' },
  { id: 'amber', label: 'Kehribar' },
  { id: 'rose', label: 'Gül' },
  { id: 'slate', label: 'Gri' },
];

/**
 * "Hedef ve tercihler" kartının bir satırı.
 *
 * Dokunma geri bildirimi: basılıyken **yazı rengi** başlık tonundan soluk tona
 * düşüyor, rozet ve ok da hafifliyor. Basılı durum `onPressIn`/`onPressOut` ile
 * tutuluyor — `Pressable`'ın çocuk fonksiyonu yerine bu yol seçildi, çünkü
 * NativeWind sarmalayıcısıyla her koşulda çalışıyor.
 */
function PrefRow({
  icon,
  label,
  right,
  onPress,
  accessibilityLabel,
  divider,
}: {
  icon: React.ReactNode;
  label: string;
  right: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  /** İlk satır hariç hepsinde üstte ayırıcı çizgi var. */
  divider?: boolean;
}) {
  const t = useThemeTokens();
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row items-center justify-between ${
        divider ? `pt-3 mt-3 border-t ${t.dividerColor}` : 'py-1'
      }`}
    >
      <View className="flex-row items-center" style={{ opacity: pressed ? 0.6 : 1 }}>
        {icon}
        <Text className={`text-[13px] font-bold ml-2 ${pressed ? t.muted : t.title}`}>{label}</Text>
      </View>
      <View
        className="flex-row items-center"
        style={{ flexShrink: 1, marginLeft: 8, opacity: pressed ? 0.6 : 1 }}
      >
        {right}
        <ChevronRight size={16} color={t.iconColor} style={{ marginLeft: 4 }} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const t = useThemeTokens();
  const profile = useProfile();
  const { progress } = useDailyProgress();
  const { settings } = useDailyPracticeSettings();
  const onboarding = useOnboarding();

  const [editing, setEditing] = React.useState(false);
  const [prefsOpen, setPrefsOpen] = React.useState(false);

  const focusAreasLabel =
    onboarding.goals.length > 0
      ? onboarding.goals.map((g) => GOAL_META[g].title).join(' · ')
      : 'Seçilmedi';

  const targetDepartment = targetDepartmentLabel(profile);
  const sector = sectorLabel(profile);

  const toggleGoal = (goal: OnboardingGoal) => {
    const { goals } = onboarding;
    if (goals.includes(goal)) {
      updateOnboarding({ goals: goals.filter((g) => g !== goal) });
    } else if (goals.length < 3) {
      updateOnboarding({ goals: [...goals, goal] });
    }
  };

  // Günlük pratik modüllerindeki en uzun güncel seri — kimlik kartındaki rozet.
  const bestStreak = Math.max(0, ...Object.values(progress.modules).map((m) => m.streak));
  // Anahtar kasadan eşzamansız okunuyor; ilk karede henüz gelmemiş olabilir.
  // Hook aboneliği sayesinde anahtar okununca ekran kendiliğinden tazelenir.
  const isAiReady = useAiAvailable();

  const badges = [
    {
      id: 'streak-7',
      label: '7 Günlük Seri',
      icon: <Flame size={16} color={bestStreak >= 7 ? toneColor('emerald', t.isLight) : '#94a3b8'} />,
      unlocked: bestStreak >= 7,
      hint: `${bestStreak}/7 gün`,
    },
    {
      id: 'breath-master',
      label: 'Nefes Kontrolü',
      icon: <Wind size={16} color={progress.longestExhaleSeconds >= 15 ? toneColor('blue', t.isLight) : '#94a3b8'} />,
      unlocked: progress.longestExhaleSeconds >= 15,
      hint: `${progress.longestExhaleSeconds.toFixed(0)}/15 sn`,
    },
    {
      id: 'practice-hero',
      label: 'Hazırlık Çırağı',
      icon: <Award size={16} color={bestStreak >= 1 ? toneColor('amber', t.isLight) : '#94a3b8'} />,
      unlocked: bestStreak >= 1,
      hint: bestStreak >= 1 ? 'Kazanıldı' : '1 pratik yap',
    },
  ];

  return (
    <AppScreen
      tabBar
      header={
        <TabHeader
          icon={<User size={24} color={toneColor('slate', t.isLight)} />}
          title="Profil"
          subtitle="Kimlik bilgilerin, kazanımların ve uygulama tercihlerin."
          right={
            <RoundButton
              icon={<SettingsIcon size={20} color={t.iconColor} />}
              onPress={() => navigation.navigate('Settings')}
              label="Ayarlar"
            />
          }
        />
      }
    >
      {editing ? (
        <ProfileEditor
          profile={profile}
          onCancel={() => setEditing(false)}
          onSave={(next) => {
            saveProfile(next);
            setEditing(false);
          }}
        />
      ) : (
        <ProfileCard profile={profile} bestStreak={bestStreak} onEdit={() => setEditing(true)} />
      )}

      {/* Hedef ve Tercihler */}
      <View className="mt-2">
        <SectionLabel>HEDEF VE TERCİHLER</SectionLabel>
      </View>
      <Surface>
        <PrefRow
          icon={<Sparkles size={16} color={toneColor('emerald', t.isLight)} />}
          label="Günlük Hedef"
          right={<Badge label={`${onboarding.dailyMinutes} dk / gün`} tone="emerald" />}
          onPress={() => setPrefsOpen(true)}
          accessibilityLabel={`Günlük hedef, ${onboarding.dailyMinutes} dakika. Değiştirmek için aç.`}
        />

        <PrefRow
          icon={<Target size={16} color={toneColor('violet', t.isLight)} />}
          label="Odak Alanları"
          right={
            <Text
              className={`text-[11px] text-right ${t.muted}`}
              style={{ flexShrink: 1 }}
              numberOfLines={1}
            >
              {focusAreasLabel}
            </Text>
          }
          onPress={() => setPrefsOpen(true)}
          accessibilityLabel={`Odak alanları, ${focusAreasLabel}. Değiştirmek için aç.`}
          divider
        />

        {/* Sektör — kurumlar, genel sorular, haberler ve yapay zekâ rolü
            buradan geliyor (YAPILACAKLAR_İRTİFA Bölüm 00). */}
        <PrefRow
          icon={<Building2 size={16} color={toneColor('emerald', t.isLight)} />}
          label="Sektör"
          right={
            sector ? (
              <Text
                className={`text-[11px] text-right ${t.muted}`}
                style={{ flexShrink: 1 }}
                numberOfLines={1}
              >
                {sector}
              </Text>
            ) : (
              <Badge label="Tümü" tone="slate" />
            )
          }
          onPress={() => setPrefsOpen(true)}
          accessibilityLabel={`Sektör, ${sector || 'seçilmedi'}. Değiştirmek için aç.`}
          divider
        />

        {/* Hedef alan — günün alan testini ve teknik soruları
            besliyor; seçilmezse orada "Alan seç" çıkıp buraya getiriyor. */}
        <PrefRow
          icon={<Cpu size={16} color={toneColor('blue', t.isLight)} />}
          label="Hedef Alan"
          right={
            targetDepartment ? (
              <Text
                className={`text-[11px] text-right ${t.muted}`}
                style={{ flexShrink: 1 }}
                numberOfLines={1}
              >
                {targetDepartment}
              </Text>
            ) : (
              <Badge label="Seçilmedi" tone="slate" />
            )
          }
          onPress={() => setPrefsOpen(true)}
          accessibilityLabel={`Hedef alan, ${targetDepartment || 'seçilmedi'}. Değiştirmek için aç.`}
          divider
        />

        <PrefRow
          icon={<Bell size={16} color={toneColor('blue', t.isLight)} />}
          label="Hatırlatıcılar"
          right={
            <Badge
              label={settings.notificationsEnabled ? 'Aktif' : 'Kapalı'}
              tone={settings.notificationsEnabled ? 'blue' : 'slate'}
            />
          }
          onPress={() => navigation.navigate('Reminders')}
          accessibilityLabel={`Hatırlatıcılar, ${settings.notificationsEnabled ? 'aktif' : 'kapalı'}. Yönetmek için aç.`}
        />
      </Surface>

      <BottomSheet
        visible={prefsOpen}
        title="Hedef ve tercihler"
        onClose={() => setPrefsOpen(false)}
      >
        <SectionTitle>GÜNLÜK HEDEF</SectionTitle>
        <View className="flex-row flex-wrap">
          {([3, 5, 10] as DailyMinutes[]).map((minutes) => (
            <Chip
              key={minutes}
              label={`${minutes} dk`}
              selected={onboarding.dailyMinutes === minutes}
              tone="emerald"
              onPress={() => updateOnboarding({ dailyMinutes: minutes })}
            />
          ))}
        </View>
        <Text className={`text-[11px] leading-4 mt-1 ${t.muted}`}>
          Atölye sekmesindeki günlük pratik listesinin uzunluğunu belirler; egzersizlerin
          kendisi kısalmaz.
        </Text>

        <SectionTitle>ODAK ALANLARI</SectionTitle>
        <View className="flex-row flex-wrap">
          {GOAL_ORDER.map((goal) => {
            const selected = onboarding.goals.includes(goal);
            const atLimit = !selected && onboarding.goals.length >= 3;
            return (
              <View key={goal} style={atLimit ? { opacity: 0.4 } : undefined}>
                <Chip
                  label={GOAL_META[goal].title}
                  selected={selected}
                  tone="violet"
                  onPress={atLimit ? undefined : () => toggleGoal(goal)}
                />
              </View>
            );
          })}
        </View>
        {onboarding.goals.length >= 3 ? (
          <Text className={`text-[11px] leading-4 mt-1 ${t.muted}`}>
            En fazla 3 hedef seçebilirsin.
          </Text>
        ) : null}

        <SectionTitle>SEKTÖR</SectionTitle>
        <View className="flex-row flex-wrap">
          {SECTORS.map((item) => {
            const selected = profile.sectorId === item.id;
            return (
              <Chip
                key={item.id}
                label={item.label}
                selected={selected}
                tone="emerald"
                // Sektör değişince o sektöre ait olmayan hedef alan temizlenir
                // (`selectSector`); seçili sektöre tekrar dokunmak seçimi kaldırır.
                onPress={() => selectSector(selected ? '' : item.id)}
              />
            );
          })}
        </View>
        <Text className={`text-[11px] leading-4 mt-1 ${t.muted}`}>
          {profile.sectorId
            ? 'Kurumlar, sorular, haberler ve yapay zekânın mülakatçı rolü bu sektöre göre gelir.'
            : 'Seçmezsen bütün sektörlerin kurumları gelir.'}
        </Text>

        <SectionTitle>HEDEF ALAN</SectionTitle>
        <View className="flex-row flex-wrap">
          {departmentsForSector(profile.sectorId).map((department) => {
            const selected = profile.targetDepartment === department.id;
            return (
              <Chip
                key={department.id}
                label={department.label}
                selected={selected}
                tone="blue"
                // Seçili çipe tekrar dokunmak seçimi kaldırıyor: ayrı bir
                // "seçimi temizle" düğmesi koymaya değmeyecek kadar küçük bir iş.
                onPress={() => selectDepartment(selected ? '' : department.id)}
              />
            );
          })}
        </View>
        <Text className={`text-[11px] leading-4 mt-1 ${t.muted}`}>
          {profile.targetDepartment
            ? 'Günün alan testi ve teknik sorular bu alandan seçilir; mülakatta da varsayılan alan olur.'
            : 'Seçersen Mülakat sekmesinde günün alan testi de çıkar. Seçili alana tekrar dokunarak kaldırabilirsin.'}
        </Text>
      </BottomSheet>

      {/* Kazanımlar ve Rozetler */}
      <View className="mt-4">
        <SectionLabel>KAZANIMLAR VE ROZETLER</SectionLabel>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {badges.map((b) => (
          <Surface key={b.id} className="flex-1 min-w-[45%]">
            <View className="flex-row items-center mb-1.5">
              <View
                className={`w-7 h-7 rounded-lg items-center justify-center mr-2 ${
                  b.unlocked ? toneSoft('emerald', t.isLight) : t.isLight ? 'bg-slate-100' : 'bg-slate-800'
                }`}
              >
                {b.icon}
              </View>
              <Text className={`text-[11px] font-bold ${b.unlocked ? t.title : t.muted}`} numberOfLines={1}>
                {b.label}
              </Text>
            </View>
            <Text className={`text-[10px] font-semibold ${b.unlocked ? toneText('emerald', t.isLight) : t.muted}`}>
              {b.unlocked ? 'Kazanıldı' : b.hint}
            </Text>
          </Surface>
        ))}
      </View>

      <Text className={`text-[11px] leading-5 mt-5 text-center ${t.muted}`}>
        İrtifa v1.0.0 · Serilerini ve ölçümlerini{' '}
        <Text className={toneText('blue', t.isLight)}>Karne</Text> sekmesinde görebilirsin.
      </Text>
    </AppScreen>
  );
}

function ProfileCard({
  profile,
  bestStreak,
  onEdit,
}: {
  profile: Profile;
  /** Günlük pratik modülleri arasındaki en uzun güncel seri. */
  bestStreak: number;
  onEdit: () => void;
}) {
  const t = useThemeTokens();
  const Icon = profileIconComponent(profile.icon);
  const tone = profile.avatarTone ?? 'blue';

  return (
    <Surface className="mt-1">
      <View className="flex-row items-center">
        {profile.avatarUri ? (
          // Fotoğraf varken profil rengi çerçevede görünür.
          <Image
            source={{ uri: profile.avatarUri }}
            className="w-16 h-16 rounded-full"
            style={{ borderWidth: 2, borderColor: toneColor(tone, t.isLight) }}
          />
        ) : (
          <View
            className={`w-16 h-16 rounded-full items-center justify-center ${toneSoft(tone, t.isLight)}`}
          >
            <Icon size={28} color={toneColor(tone, t.isLight)} />
          </View>
        )}

        <View className="flex-1 ml-3">
          <Text className={`text-[17px] font-bold ${t.title}`} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
            {profile.role}
          </Text>
          {/* Rozet gerçek bir şey söylesin: eskiden hep "Aktif Aday" yazıyordu,
              yani hiçbir bilgi taşımıyordu. Şimdi günlük pratikteki en uzun
              seriyi gösteriyor; seri yoksa rozet hiç çıkmıyor. */}
          {bestStreak > 0 ? (
            <View
              className={`flex-row items-center self-start mt-2 px-2.5 py-1 rounded-full ${toneSoft('emerald', t.isLight)}`}
            >
              <Activity size={12} color={toneColor('emerald', t.isLight)} />
              <Text className={`text-[10px] font-bold tracking-widest ml-1 ${toneText('emerald', t.isLight)}`}>
                {trUpper(`${bestStreak} günlük seri`)}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={onEdit}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Profili düzenle"
          className={`w-9 h-9 rounded-full items-center justify-center ${
            t.isLight ? 'bg-slate-100' : 'bg-slate-800'
          }`}
        >
          <Pencil size={16} color={t.iconColor} />
        </Pressable>
      </View>
    </Surface>
  );
}

function ProfileEditor({
  profile,
  onSave,
  onCancel,
}: {
  profile: Profile;
  onSave: (next: Partial<Profile>) => void;
  onCancel: () => void;
}) {
  const t = useThemeTokens();
  const [draft, setDraft] = React.useState<Profile>(profile);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const DraftIcon = profileIconComponent(draft.icon);
  const draftTone = draft.avatarTone ?? 'blue';

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // Sabit kimlikler: IconGroupRow React.memo ile sarılı, her render'da yeni
  // closure geçilseydi memo hiçbir işe yaramaz ve seçim yapılınca dokuz grubun
  // tamamı yeniden çizilirdi.
  const handleSelectIcon = React.useCallback((id: ProfileIconId) => {
    setDraft((prev) => ({ ...prev, icon: id }));
    setPickerOpen(false);
  }, []);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setDraft((prev) => ({ ...prev, avatarUri: result.assets[0].uri }));
    }
  };

  const closePicker = React.useCallback(() => setPickerOpen(false), []);

  return (
    <Surface className="mt-1">
      <Text className={`text-[11px] font-bold tracking-widest mb-3 ${t.muted}`}>
        PROFİLİ DÜZENLE
      </Text>

      <TextField
        label="İsim Soyisim"
        value={draft.name}
        onChangeText={(value) => set('name', value)}
        placeholder="Adınız ve soyadınız"
        autoCapitalize="words"
      />
      <TextField
        label="Kariyer Hedefi"
        value={draft.role}
        onChangeText={(value) => set('role', value)}
        placeholder="Örn. Ürün Yöneticisi"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label="LinkedIn URL"
            value={draft.linkedin}
            onChangeText={(value) => set('linkedin', value)}
            placeholder="https://linkedin.com/..."
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
        <View className="flex-1">
          <TextField
            label="Site / Portfolyo"
            value={draft.website}
            onChangeText={(value) => set('website', value)}
            placeholder="https://..."
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </View>

      {/* Profil fotoğrafı */}
      <Text className={`text-[10px] font-bold tracking-widest mt-2 mb-2 ${t.muted}`}>
        FOTOĞRAF
      </Text>
      <View className="flex-row items-center gap-3 mb-3">
        {draft.avatarUri ? (
          <View className="flex-row items-center gap-3">
            <Image
              source={{ uri: draft.avatarUri }}
              className="w-12 h-12 rounded-full"
              style={{ borderWidth: 2, borderColor: toneColor(draftTone, t.isLight) }}
            />
            <Pressable
              onPress={() => setDraft((prev) => ({ ...prev, avatarUri: '' }))}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <Text className="text-[12px] font-bold text-red-600 dark:text-red-400">
                Fotoğrafı Kaldır
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handlePickPhoto}
            className={`px-3.5 py-2 rounded-xl border flex-row items-center ${
              t.isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}
          >
            <Camera size={16} color={t.iconColor} />
            <Text className={`text-[12px] font-bold ml-2 ${t.title}`}>Fotoğraf Yükle</Text>
          </Pressable>
        )}
      </View>

      {/* Profil rengi. Eskiden yalnızca fotoğraf yokken görünüyordu ve seçili
          renk belli olmuyordu. Artık her zaman seçilebilir: fotoğraf yoksa ikon
          zeminini, varsa fotoğrafın çerçevesini boyar. */}
      <Text className={`text-[10px] font-bold tracking-widest mb-2 ${t.muted}`}>
        PROFİL RENGİ
      </Text>
      <View className="flex-row flex-wrap gap-3 mb-4">
        {TONES.map((toneItem) => {
          const active = draftTone === toneItem.id;
          return (
            <Pressable
              key={toneItem.id}
              onPress={() => set('avatarTone', toneItem.id)}
              hitSlop={4}
              accessibilityRole="radio"
              accessibilityLabel={`${toneItem.label} profil rengi`}
              accessibilityState={{ checked: active }}
              className="items-center"
            >
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{
                  borderWidth: 2,
                  borderColor: active ? toneColor(toneItem.id, t.isLight) : 'transparent',
                }}
              >
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center ${toneFill(toneItem.id, t.isLight)}`}
                >
                  {active ? <Check size={17} color="#ffffff" /> : null}
                </View>
              </View>
              <Text
                className={`text-[10px] mt-1 font-semibold ${active ? toneText(toneItem.id, t.isLight) : t.muted}`}
              >
                {toneItem.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className={`text-[10px] font-bold tracking-widest mb-2 ${t.muted}`}>
        İKON
      </Text>
      <Pressable
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="İkon seç"
        className={`flex-row items-center rounded-2xl px-3 py-2.5 border ${
          t.isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2e2e33] bg-[#141417]'
        }`}
      >
        <View
          className={`w-11 h-11 rounded-full items-center justify-center ${toneSoft(draftTone, t.isLight)}`}
        >
          <DraftIcon size={22} color={toneColor(draftTone, t.isLight)} />
        </View>
        <View className="flex-1 ml-3">
          <Text className={`text-[13px] font-semibold ${t.title}`}>İkon Seç</Text>
        </View>
        <ChevronRight size={18} color={t.iconColor} />
      </Pressable>

      <IconPickerModal
        visible={pickerOpen}
        selected={draft.icon}
        onSelect={handleSelectIcon}
        onClose={closePicker}
      />

      <View className="flex-row gap-3 mt-5">
        <View className="flex-1">
          <ActionButton label="İptal" variant="outline" onPress={onCancel} />
        </View>
        <View className="flex-1">
          <ActionButton label="Kaydet" onPress={() => onSave(draft)} />
        </View>
      </View>
    </Surface>
  );
}

/**
 * İkon seçici. Kütüphane bölüm bölüm geziliyor; seçilen ikon anında
 * uygulanıp sayfa kapanıyor — ayrıca "tamam" düğmesi yok, çünkü seçim
 * zaten taslağa yazılıyor ve asıl kayıt formun "Kaydet"inde oluyor.
 */
function IconPickerModal({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: ProfileIconId;
  onSelect: (id: ProfileIconId) => void;
  onClose: () => void;
}) {
  const t = useThemeTokens();

  // Modal kapanınca sıfırlanıyor ki bir sonraki açılış da hafif başlasın.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (!visible) {
      setReady(false);
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, [visible]);

  return (
    <SheetOverlay visible={visible} onClose={onClose} sheetStyle={{ height: '82%' }}>
      <View
        className={`flex-row items-center px-5 pt-5 pb-3 border-b ${
          t.isLight ? 'border-slate-200' : 'border-[#2e2e33]'
        }`}
      >
        <Text className={`flex-1 text-[17px] font-bold ${t.title}`}>İkon Seç</Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          className={`w-9 h-9 rounded-full items-center justify-center ${
            t.isLight ? 'bg-slate-100' : 'bg-slate-800'
          }`}
        >
          <X size={18} color={t.iconColor} />
        </Pressable>
      </View>

      {/* Ağır kısım panel kayarken monte edilmiyor.
          82 ikonun her biri birkaç <Path> içeren gerçek bir native view;
          hepsi tek commit'te kurulunca açılış animasyonu takılıyordu.
          Önce iskelet çiziliyor, geçiş bitince liste geliyor. */}
      {ready ? (
        <FlatList
          data={PROFILE_ICON_GROUPS}
          keyExtractor={(group) => group.id}
          renderItem={({ item }) => (
            <IconGroupRow group={item} selected={selected} onSelect={onSelect} />
          )}
          // Grup başına sanallaştırma: ilk açılışta 82 değil ~20 ikon monte oluyor.
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={{ flex: 1 }} />
      )}
    </SheetOverlay>
  );
}

/** Seçicideki tek bir grup: başlık + sarmalanan ikon ızgarası. */
const IconGroupRow = React.memo(function IconGroupRow({
  group,
  selected,
  onSelect,
}: {
  group: (typeof PROFILE_ICON_GROUPS)[number];
  selected: ProfileIconId;
  onSelect: (id: ProfileIconId) => void;
}) {
  const t = useThemeTokens();

  return (
    <View className="mb-5">
      <Text className={`text-[10px] font-bold tracking-widest mb-2.5 ${t.muted}`}>
        {trUpper(group.title)}
      </Text>
      <View className="flex-row flex-wrap">
        {group.icons.map((id) => {
          const Icon = profileIconComponent(id);
          const active = id === selected;
          return (
            <Pressable
              key={id}
              onPress={() => onSelect(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className={`w-[52px] h-[52px] rounded-2xl items-center justify-center mr-2.5 mb-2.5 border ${
                active
                  ? t.isLight
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-blue-400 bg-blue-950'
                  : `border-transparent ${t.isLight ? 'bg-slate-100' : 'bg-slate-800'}`
              }`}
            >
              <Icon size={22} color={active ? toneColor('blue', t.isLight) : t.iconColor} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
