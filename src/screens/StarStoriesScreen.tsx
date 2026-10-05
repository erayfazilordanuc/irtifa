import React from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { Plus, Trash2, ChevronRight, Layers, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

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
} from '../components/AppUI';
import { BottomSheet, useThemeTokens } from '../components/practice/PracticeUI';
import {
  completedSteps,
  removeStarStory,
  saveStarStory,
  storyToText,
  useStarStories,
  STAR_STEPS,
  STORY_PROMPTS,
  type StarStory,
} from '../utils/starStories';

// STAR cevap kurucu — YAPILACAKLAR_İRTİFA Bölüm 2.5.
//
// Atölye'deki "Mülakat Zekâsı" egzersizi STAR ile *hızlı cevap kurmayı*
// çalıştırıyor; burası aynı dilin **kalıcı kaydı**. Dört adım ayrı alanlarda
// duruyor çünkü mülakatta en sık yapılan hata Durum'u uzatıp Sonuç'u hiç
// söylememek — alanlar ayrıyken eksik olan göze çarpıyor.

const EMPTY: StarStory = {
  id: '',
  createdAt: '',
  title: '',
  situation: '',
  task: '',
  action: '',
  result: '',
};

export default function StarStoriesScreen({ navigation }: any) {
  const t = useThemeTokens();
  const stories = useStarStories();
  const [editing, setEditing] = React.useState<StarStory | null>(null);

  const startNew = (title = '', tag?: string) =>
    setEditing({ ...EMPTY, id: `star-${Date.now()}`, title, tag });

  return (
    <AppScreen
      header={
        <AppHeader
          title="STAR Cevapların"
          subtitle="Durum → Görev → Eylem → Sonuç."
          onBack={() => navigation.goBack()}
        />
      }
      footer={
        <ActionButton
          label="Hikâye ekle"
          onPress={() => startNew()}
          icon={<Plus size={16} color="#ffffff" />}
        />
      }
    >
      {stories.length === 0 ? (
        <>
          <Surface className="mt-2">
            <Text className={`text-[13px] font-bold ${t.title}`}>STAR nedir</Text>
            <Text className={`text-[12px] mt-2 leading-5 ${t.body}`}>
              Davranışsal sorulara ("bir çatışmayı anlat") hazırlıksız cevap vermek zordur. STAR
              dört adımda kurgulamayı sağlar: durumu kur, görevini söyle, ne yaptığını anlat,
              sonucu ver. Aynı hikâye birçok soruya cevap olur.
            </Text>
          </Surface>

          <View className="mt-4">
            <SectionLabel>HAZIR BAŞLANGIÇLAR</SectionLabel>
          </View>
          <View className="gap-2">
            {STORY_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt.title}
                onPress={() => startNew(prompt.title, prompt.tag)}
                accessibilityRole="button"
                accessibilityLabel={`${prompt.title} hikâyesini yazmaya başla`}
                className={`flex-row items-center rounded-2xl p-3.5 border ${t.cardBg} ${t.cardBorder}`}
              >
                <View className="flex-1 pr-2">
                  <Text className={`text-[13px] font-bold ${t.title}`}>{prompt.title}</Text>
                </View>
                <Badge label={prompt.tag} tone="violet" />
                <View className="ml-2">
                  <ChevronRight size={17} color={t.iconColor} />
                </View>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <View className="gap-2 mt-2">
        {stories.map((story) => {
          const done = completedSteps(story);
          return (
            <Pressable
              key={story.id}
              onPress={() => setEditing(story)}
              accessibilityRole="button"
              accessibilityLabel={`${story.title}. Dört adımın ${done} tanesi dolu. Düzenlemek için dokun.`}
              className={`flex-row items-center rounded-2xl p-3.5 border ${t.cardBg} ${t.cardBorder}`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${toneSoft('violet', t.isLight)}`}
              >
                <Layers size={18} color={toneColor('violet', t.isLight)} />
              </View>
              <View className="flex-1 pr-2">
                <Text className={`text-[13px] font-bold ${t.title}`} numberOfLines={1}>
                  {story.title || 'Adsız hikâye'}
                </Text>
                <Text className={`text-[11px] mt-0.5 ${t.muted}`}>
                  {done}/4 adım dolu{story.tag ? ` · ${story.tag}` : ''}
                </Text>
              </View>
              <ChevronRight size={17} color={t.iconColor} />
            </Pressable>
          );
        })}
      </View>

      {editing ? <StoryEditor story={editing} onClose={() => setEditing(null)} /> : null}
    </AppScreen>
  );
}

function StoryEditor({ story, onClose }: { story: StarStory; onClose: () => void }) {
  const t = useThemeTokens();
  const [draft, setDraft] = React.useState<StarStory>(story);
  const [copied, setCopied] = React.useState(false);

  const save = () => {
    if (!draft.title.trim()) {
      Alert.alert('Başlık gerekli', 'Hikâyeyi sonra bulabilmen için kısa bir ad ver.');
      return;
    }
    saveStarStory(draft);
    onClose();
  };

  const copy = async () => {
    await Clipboard.setStringAsync(`${draft.title}\n\n${storyToText(draft)}`);
    setCopied(true);
  };

  const confirmRemove = () => {
    Alert.alert('Hikâyeyi sil', `"${draft.title || 'Adsız hikâye'}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          removeStarStory(draft.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <BottomSheet visible onClose={onClose} title="STAR hikâyesi">
      <TextField
        label="Başlık"
        value={draft.title}
        onChangeText={(title) => setDraft((prev) => ({ ...prev, title }))}
        placeholder="Teslim tarihini kurtardığım an"
      />

      {STAR_STEPS.map((step) => (
        <View key={step.key} className="mb-3">
          <View className="flex-row items-center mb-1.5">
            <Text className={`text-[10px] font-bold uppercase tracking-widest ${t.muted}`}>
              {step.label}
            </Text>
            <Text className={`text-[10px] ml-2 ${t.muted}`}>{step.question}</Text>
          </View>
          <TextInput
            value={draft[step.key]}
            onChangeText={(value) => setDraft((prev) => ({ ...prev, [step.key]: value }))}
            placeholder={step.hint}
            placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
            multiline
            textAlignVertical="top"
            className={`rounded-2xl px-4 py-3 text-[13px] border ${
              t.isLight
                ? 'bg-slate-100 text-slate-900 border-transparent'
                : 'bg-[#141417] text-white border-[#2e2e33]'
            }`}
            style={{ minHeight: step.key === 'action' ? 110 : 70 }}
          />
        </View>
      ))}

      <ActionButton label="Kaydet" onPress={save} />

      <View className="mt-2">
        <ActionButton
          label={copied ? 'Kopyalandı' : 'Metni kopyala'}
          tone="blue"
          variant="soft"
          onPress={copy}
          icon={<Copy size={16} color={toneColor('blue', t.isLight)} />}
        />
      </View>

      <View className="mt-2">
        <ActionButton
          label="Hikâyeyi sil"
          tone="rose"
          variant="soft"
          onPress={confirmRemove}
          icon={<Trash2 size={16} color={toneColor('rose', t.isLight)} />}
        />
      </View>
    </BottomSheet>
  );
}
