import React from 'react';
import { View, Text, Pressable, Alert, Linking, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  ShieldCheck,
  KeyRound,
  ClipboardPaste,
  ExternalLink,
  Lock,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plug,
} from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  SectionLabel,
  TextField,
  ActionButton,
  toneColor,
  toneSoft,
  toneText,
  useThemeTokens,
} from '../components/AppUI';
import {
  useApiKey,
  saveApiKey,
  clearApiKey,
  maskApiKey,
  looksLikeApiKey,
  API_KEY_CONSOLE_URL,
} from '../utils/aiCredentials';
import { testConnection } from '../utils/geminiClient';
import {
  API_BASE_URL_PLACEHOLDER,
  normalizeBaseUrl,
  updateAppSettings,
  useAppSettings,
} from '../utils/appSettings';

// Yapay zekâ kurulum ekranı — BYOK (kendi anahtarını getir) akışı.
//
// Kullanıcı kararı 2026-09-20: BYOK varsayılan yol. Uygulamayı kuran herkes
// kendi Google hesabından ücretsiz bir Gemini anahtarı alıp buraya yapıştırır;
// hiçbir ortak sunucu ya da paylaşılan kota gerekmez. Sunucu (proxy) yolu
// "Gelişmiş" bölümünde, kendi `server/server.ts`'ini çalıştıranlar için duruyor.

export default function AiSetupScreen({ navigation }: any) {
  const t = useThemeTokens();
  const apiKey = useApiKey();
  const appSettings = useAppSettings();

  const hasKey = !!apiKey;
  const [editing, setEditing] = React.useState(!hasKey);
  const [draft, setDraft] = React.useState('');
  const [testing, setTesting] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const [urlDraft, setUrlDraft] = React.useState(appSettings.apiBaseUrl);
  const [tokenDraft, setTokenDraft] = React.useState(appSettings.appToken);
  const [savingUrl, setSavingUrl] = React.useState(false);

  const showFormatWarning = draft.trim().length > 0 && !looksLikeApiKey(draft);

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) setDraft(text.trim());
    } catch {
      Alert.alert('Pano okunamadı', 'Anahtarı elle yapıştırmayı deneyebilirsin.');
    }
  };

  const verifyAndSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      Alert.alert('Anahtar boş', 'Önce bir Gemini anahtarı yapıştır.');
      return;
    }

    setTesting(true);
    const result = await testConnection(trimmed);
    setTesting(false);

    if (!result.ok) {
      Alert.alert('Doğrulanamadı', result.message);
      return;
    }

    try {
      await saveApiKey(trimmed);
    } catch (e: any) {
      Alert.alert('Kaydedilemedi', e?.message || 'Anahtar cihaza kaydedilemedi.');
      return;
    }

    setDraft('');
    setEditing(false);
    Alert.alert('Açıldı', result.message);
  };

  const testExistingKey = async () => {
    setTesting(true);
    const result = await testConnection();
    setTesting(false);
    Alert.alert(result.ok ? 'Bağlantı başarılı' : 'Bağlantı sorunu', result.message);
  };

  const removeKey = () => {
    Alert.alert('Anahtarı kaldır', 'Yapay zekâ değerlendirmesi kapanır. Kayıtların etkilenmez.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Kaldır',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setEditing(true);
        },
      },
    ]);
  };

  const saveAdvanced = () => {
    const normalized = normalizeBaseUrl(urlDraft);
    if (!normalized) {
      updateAppSettings({ apiBaseUrl: '', appToken: '' });
      setUrlDraft('');
      Alert.alert('Kaldırıldı', 'Sunucu adresi temizlendi.');
      return;
    }
    updateAppSettings({ apiBaseUrl: normalized, appToken: tokenDraft.trim() });
    setUrlDraft(normalized);
    Alert.alert('Kaydedildi', `Sunucu adresi güncellendi:\n${normalized}`);
  };

  const testAdvanced = async () => {
    const normalized = normalizeBaseUrl(urlDraft);
    if (normalized && normalized !== appSettings.apiBaseUrl) {
      updateAppSettings({ apiBaseUrl: normalized });
      setUrlDraft(normalized);
    }
    setSavingUrl(true);
    // 'proxy': anahtar kayıtlı olsa bile burada sunucu yolu sınanmalı.
    const result = await testConnection(undefined, 'proxy');
    setSavingUrl(false);
    Alert.alert(result.ok ? 'Bağlantı başarılı' : 'Bağlantı sorunu', result.message);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <AppScreen header={<AppHeader title="Yapay Zekâ Değerlendirmesi" onBack={() => navigation.goBack()} />}>
        {hasKey && !editing ? (
          <Surface className={toneSoft('emerald', t.isLight)}>
            <View className="flex-row items-center mb-1">
              <ShieldCheck size={18} color={toneColor('emerald', t.isLight)} />
              <Text className={`text-[14px] font-bold ml-2 ${t.title}`}>
                Yapay zekâ değerlendirmesi açık
              </Text>
            </View>
            <Text className={`text-[12px] ml-[26px] ${t.muted}`}>{maskApiKey(apiKey!)}</Text>

            <View className="flex-row gap-3 mt-4">
              <View className="flex-1">
                <ActionButton
                  label={testing ? 'Deneniyor…' : 'Bağlantıyı test et'}
                  variant="outline"
                  disabled={testing}
                  labelSize={12}
                  icon={<Plug size={15} color={t.iconColor} />}
                  onPress={testExistingKey}
                />
              </View>
              <View className="flex-1">
                <ActionButton
                  label="Anahtarı değiştir"
                  variant="soft"
                  tone="blue"
                  labelSize={12}
                  icon={<RefreshCw size={15} color={toneColor('blue', t.isLight)} />}
                  onPress={() => setEditing(true)}
                />
              </View>
            </View>
            <View className="mt-3">
              <ActionButton
                label="Anahtarı kaldır"
                variant="outline"
                tone="rose"
                labelSize={12}
                icon={<Trash2 size={15} color={toneColor('rose', t.isLight)} />}
                onPress={removeKey}
              />
            </View>
          </Surface>
        ) : (
          <>
            <Text className={`text-[12px] leading-5 mb-4 ${t.muted}`}>
              Yapay zekâ değerlendirmesi mülakat kayıtlarını okuyup geri bildirim çıkarır; bunun
              için Google'ın Gemini modeline erişen bir anahtar gerekir.
            </Text>

            <SectionLabel>1. Ücretsiz anahtar al</SectionLabel>
            <Surface>
              <ActionButton
                label="Ücretsiz anahtar al"
                icon={<ExternalLink size={15} color="#ffffff" />}
                onPress={() => Linking.openURL(API_KEY_CONSOLE_URL)}
              />
              <Text className={`text-[11px] leading-5 mt-3 ${t.muted}`}>
                Google hesabınla giriş yapman yeterli; kredi kartı istenmiyor.
              </Text>
            </Surface>

            <SectionLabel>2. Anahtarı yapıştır</SectionLabel>
            <Surface>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="AIza… ile başlayan anahtarı buraya yapıştır"
                placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                numberOfLines={3}
                className={`rounded-2xl px-4 py-3 text-[12px] border ${
                  t.isLight
                    ? 'bg-slate-100 text-slate-900 border-transparent'
                    : 'bg-[#141417] text-white border-[#2e2e33]'
                }`}
                style={{ minHeight: 72, textAlignVertical: 'top' }}
              />
              {showFormatWarning ? (
                <Text className={`text-[11px] mt-2 ${toneText('amber', t.isLight)}`}>
                  Bu bir Google AI anahtarına benzemiyor; yine de deneyebilirsin.
                </Text>
              ) : null}
              <View className="mt-3">
                <ActionButton
                  label="Panodan yapıştır"
                  variant="soft"
                  tone="slate"
                  labelSize={12}
                  icon={<ClipboardPaste size={15} color={t.iconColor} />}
                  onPress={pasteFromClipboard}
                />
              </View>
            </Surface>

            <SectionLabel>3. Doğrula ve kaydet</SectionLabel>
            <Surface>
              <ActionButton
                label={testing ? 'Deneniyor…' : 'Doğrula ve kaydet'}
                icon={<KeyRound size={15} color="#ffffff" />}
                disabled={testing}
                onPress={verifyAndSave}
              />
              {hasKey ? (
                <View className="mt-3">
                  <ActionButton
                    label="Vazgeç"
                    variant="outline"
                    tone="slate"
                    labelSize={12}
                    onPress={() => {
                      setDraft('');
                      setEditing(false);
                    }}
                  />
                </View>
              ) : null}
            </Surface>
          </>
        )}

        <SectionLabel>Gizlilik</SectionLabel>
        <Surface>
          <PrivacyLine text="Anahtar yalnızca bu cihazda, işletim sisteminin kasasında saklanır; hiçbir sunucuya gönderilmez." />
          <PrivacyLine text="Değerlendirme istendiğinde mülakat metni/sesi doğrudan Google'a gider." />
          <PrivacyLine text="Kullanım, kendi Google hesabının ücretsiz kotasından düşer." />
          <PrivacyLine text="Yapay zekâ olmadan uygulamanın geri kalanı tam çalışır." last />
        </Surface>

        {/* ——— Gelişmiş: kendi sunucun ——— */}
        <Pressable
          onPress={() => setAdvancedOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={advancedOpen ? 'Gelişmiş bölümünü kapat' : 'Gelişmiş bölümünü aç'}
          className="flex-row items-center mt-7 mb-2.5"
        >
          {advancedOpen ? (
            <ChevronDown size={14} color={t.iconColor} />
          ) : (
            <ChevronRight size={14} color={t.iconColor} />
          )}
          <Text
            className={`text-[10px] font-semibold uppercase ml-1 ${t.muted}`}
            style={{ letterSpacing: 1.4 }}
          >
            Gelişmiş: kendi sunucunu kullan
          </Text>
        </Pressable>

        {advancedOpen ? (
          <Surface>
            <Text className={`text-[11px] leading-5 mb-3 ${t.muted}`}>
              Çoğu kullanıcının buna ihtiyacı yok. Kendi bilgisayarında İrtifa sunucusunu
              (server/server.ts) çalıştıranlar, anahtar yerine sunucunun adresini girebilir.
            </Text>
            <TextField
              value={urlDraft}
              onChangeText={setUrlDraft}
              placeholder={API_BASE_URL_PLACEHOLDER}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TextField
              value={tokenDraft}
              onChangeText={setTokenDraft}
              placeholder="Erişim jetonu (isteğe bağlı)"
              autoCapitalize="none"
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <ActionButton label="Kaydet" tone="slate" labelSize={12} onPress={saveAdvanced} />
              </View>
              <View className="flex-1">
                <ActionButton
                  label={savingUrl ? 'Deneniyor…' : 'Bağlantıyı test et'}
                  variant="outline"
                  disabled={savingUrl}
                  labelSize={12}
                  icon={<Plug size={15} color={t.iconColor} />}
                  onPress={testAdvanced}
                />
              </View>
            </View>
          </Surface>
        ) : null}
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

function PrivacyLine({ text, last }: { text: string; last?: boolean }) {
  const t = useThemeTokens();
  return (
    <View className={`flex-row items-start ${last ? '' : 'mb-2.5'}`}>
      <Lock size={12} color={t.iconColor} style={{ marginTop: 2 }} />
      <Text className={`text-[11px] leading-5 ml-2 flex-1 ${t.muted}`}>{text}</Text>
    </View>
  );
}
