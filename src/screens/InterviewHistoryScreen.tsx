import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { ChevronRight, Clock, Play, Square, HardDrive } from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  EmptyState,
  Badge,
  toneColor,
  toneSoft,
  type Tone,
} from '../components/AppUI';
import { AiInsightCard } from '../components/AiInsightCard';
import { useThemeTokens } from '../components/practice/PracticeUI';
import {
  useInterviewSessions,
  dropSessionAudio,
  type RecordedSession,
} from '../utils/interviewHistory';
import { audioUri, audioTotalBytes, clearAllAudio, formatBytes } from '../utils/audioStore';
import { findCompany, companyColor } from '../data/companies';
import { interviewerRole } from '../data/sectors';
import { careerContext, profileStore } from '../utils/profile';
import { formatDuration, formatShortDate } from '../utils/dateUtils';

// Tamamlanan mülakatların listesi ve tüm kayıtlar üzerinden toplu yapay zeka değerlendirmesi.

/**
 * Geçmiş satırlarındaki tek seferde bir kayıt çalan ses oynatıcı.
 * Yeni bir kayda basılınca önceki otomatik durur; ekran sökülürken de boşaltılır.
 */
function useSessionAudioPlayer() {
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const soundRef = React.useRef<Audio.Sound | null>(null);

  const stop = React.useCallback(async () => {
    const sound = soundRef.current;
    soundRef.current = null;
    setPlayingId(null);
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch {
        // Boşaltma hatası sessizce yutulur — kullanıcıya gösterecek bir şey yok.
      }
    }
  }, []);

  const toggle = React.useCallback(
    async (session: RecordedSession) => {
      const uri = audioUri(session.audioFile);
      if (!uri) return;

      if (playingId === session.id) {
        await stop();
        return;
      }

      await stop();
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
        soundRef.current = sound;
        setPlayingId(session.id);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) stop();
        });
      } catch (e) {
        console.warn('[mülakat geçmişi] ses çalınamadı', e);
        setPlayingId(null);
      }
    },
    [playingId, stop],
  );

  // Ekrandan çıkarken çalan varsa boşalt — sızıntı olmasın.
  React.useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  return { playingId, toggle };
}

export default function InterviewHistoryScreen({ navigation }: any) {
  const t = useThemeTokens();
  const sessions = useInterviewSessions();
  const { playingId, toggle } = useSessionAudioPlayer();

  const analyzed = sessions.filter((session) => session.analysis);
  const totalAudioBytes = React.useMemo(() => audioTotalBytes(), [sessions]);

  /** Toplu analiz istemi — tek tek geri bildirimler yerine gidişatı değerlendirir. */
  const buildPrompt = () => {
    const profile = profileStore.get();
    const lines = analyzed.slice(0, 20).map((session, index) => {
      const analysis = session.analysis!;
      return [
        `${index + 1}. ${formatShortDate(new Date(session.timestamp))} · ${session.companyName}`,
        `   Soru: ${session.questionText}`,
        `   Puan: ${analysis.rating}/100 · Dayanıklılık: ${analysis.defenseResilience} · Akıcılık etiketi: ${analysis.fillerRating}`,
        `   Geliştirilecekler: ${analysis.improvementPoints.join('; ')}`,
      ].join('\n');
    });

    return [
      // Rol sektör kataloğundan (YAPILACAKLAR_İRTİFA Bölüm 00); seçilmemişse nötr.
      interviewerRole(profile.sectorId),
      careerContext(profile),
      'Aşağıda adayın geçmiş mülakat simülasyonları ve puanları var. Tek tek oturumları değil,',
      'genel gidişatı, tekrar eden zayıflıkları ve gelişim eğrisini değerlendir. Türkçe yaz.',
      '',
      ...lines,
    ].join('\n');
  };

  const confirmClearAudio = () => {
    Alert.alert(
      'Ses kayıtlarını sil',
      'Yalnızca ses dosyaları silinecek. Sorular, puanlar ve yazılı cevaplar geçmişte kalmaya devam edecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            sessions.forEach((session) => {
              if (session.audioFile) dropSessionAudio(session.id);
            });
            // Kayıtlara bağlı olanları yukarıdaki döngü sildi; bu çağrı, kaydı
            // silinmiş ama dosyası kalmış olabilecek öksüzleri de temizler —
            // "sil" dendiğinde klasörde hiç ses kalmadığından emin olunur.
            clearAllAudio();
          },
        },
      ],
    );
  };

  return (
    <AppScreen
      header={
        <AppHeader title="Mülakat Geçmişi" onBack={() => navigation.goBack()} align="center" />
      }
    >
      <View className="mt-1">
        <AiInsightCard
          title="Yapay Zeka Mülakat Analizi"
          description="Gerçekleştirdiğiniz tüm mülakatların puanlarını, hitabetinizi ve teknik derinliğinizi analiz ederek kariyer hedefinize özel gelişim yol haritası çıkartın."
          buttonLabel="Mülakatlarımı Analiz Et"
          buildPrompt={buildPrompt}
          disabled={analyzed.length === 0}
          disabledHint="Toplu analiz için en az bir değerlendirilmiş mülakat gerekiyor."
        />
      </View>

      <Text className={`text-[16px] font-bold mt-6 mb-3 ${t.title}`}>Geçmiş Simülasyonlar</Text>

      {sessions.length === 0 ? (
        <EmptyState message="Henüz tamamlanmış mülakatınız bulunmuyor." />
      ) : (
        <Surface>
          {sessions.map((session, index) => (
            <SessionRow
              key={session.id}
              session={session}
              divider={index > 0}
              playing={playingId === session.id}
              onTogglePlay={() => toggle(session)}
              onPress={() => navigation.navigate('Analysis', { sessionId: session.id })}
            />
          ))}
        </Surface>
      )}

      {totalAudioBytes > 0 ? (
        <Surface className="mt-3">
          <View className="flex-row items-center">
            <View
              className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${toneSoft('slate', t.isLight)}`}
            >
              <HardDrive size={16} color={toneColor('slate', t.isLight)} />
            </View>
            <View className="flex-1 pr-3">
              <Text className={`text-[12px] font-bold ${t.title}`}>Ses Kayıtları</Text>
              <Text className={`text-[11px] mt-0.5 ${t.muted}`}>
                {formatBytes(totalAudioBytes)} kaplıyor
              </Text>
            </View>
            <Pressable
              onPress={confirmClearAudio}
              accessibilityRole="button"
              accessibilityLabel="Ses kayıtlarını sil"
              className="py-2 px-3"
            >
              <Text
                className={`text-[12px] font-bold ${t.isLight ? 'text-rose-600' : 'text-rose-400'}`}
              >
                Sil
              </Text>
            </Pressable>
          </View>
        </Surface>
      ) : null}
    </AppScreen>
  );
}

function SessionRow({
  session,
  divider,
  playing,
  onTogglePlay,
  onPress,
}: {
  session: RecordedSession;
  divider: boolean;
  playing: boolean;
  onTogglePlay: () => void;
  onPress: () => void;
}) {
  const t = useThemeTokens();
  // Kayıt diskten geliyor; kurum listeden kalkmış olabilir. Fırlatmak yerine
  // satırı nötr bir etiketle çiziyoruz — geçmiş kaybolmasın.
  const company = findCompany(session.companyId);
  const rating = session.analysis?.rating;
  const tone: Tone =
    rating === undefined ? 'slate' : rating >= 75 ? 'emerald' : rating >= 50 ? 'amber' : 'rose';
  // Dosya elle ya da güncelleme sırasında silinmiş olabilir; o zaman oynat
  // düğmesi hiç görünmez. `audioUri` diske bakan SENKRON bir çağrı, bu yüzden
  // her render'da değil yalnızca kaydın ses dosyası değiştiğinde çalışıyor —
  // uzun geçmiş listelerinde her kaydırmada dosya sistemine gidilmesin.
  const canPlay = React.useMemo(() => Boolean(audioUri(session.audioFile)), [session.audioFile]);

  return (
    <View
      className={`flex-row items-center py-3.5 ${divider ? `border-t ${t.dividerColor}` : ''}`}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${session.companyName} mülakatını görüntüle`}
        className="flex-1 flex-row items-center pr-3"
      >
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: company ? companyColor(company, t.isLight) : t.iconColor }}
            >
              {company?.name ?? 'BİLİNMEYEN KURUM'}
            </Text>
            <Text className={`text-[10px] ml-2 ${t.muted}`}>
              {formatShortDate(new Date(session.timestamp))}
            </Text>
            {session.aborted ? (
              <View className="ml-2">
                <Badge label="Yarıda kaldı" tone="amber" />
              </View>
            ) : null}
          </View>
          <Text className={`text-[13px] font-bold leading-5 ${t.title}`} numberOfLines={2}>
            {session.questionText}
          </Text>
          <View className="flex-row items-center mt-1.5">
            <Clock size={11} color={t.iconColor} />
            <Text className={`text-[11px] ml-1 ${t.muted}`}>
              {formatDuration(session.durationSeconds)} ·{' '}
              {session.mode === 'camera' ? 'Kamera' : 'Yazılı'}
            </Text>
          </View>
        </View>
      </Pressable>

      {canPlay ? (
        <Pressable
          onPress={onTogglePlay}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Durdur' : 'Kaydı dinle'}
          hitSlop={8}
          className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${toneSoft('blue', t.isLight)}`}
        >
          {playing ? (
            <Square
              size={13}
              color={toneColor('blue', t.isLight)}
              fill={toneColor('blue', t.isLight)}
            />
          ) : (
            <Play
              size={13}
              color={toneColor('blue', t.isLight)}
              fill={toneColor('blue', t.isLight)}
            />
          )}
        </Pressable>
      ) : null}

      <Badge label={rating === undefined ? 'Analiz yok' : `${rating}`} tone={tone} />
      <View className="ml-1">
        <ChevronRight size={16} color={t.iconColor} />
      </View>
    </View>
  );
}
