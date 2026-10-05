import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  Sparkles,
  ShieldCheck,
  Eye,
  AudioWaveform,
  Cpu,
  Check,
  ArrowUpRight,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react-native';

import {
  AppScreen,
  AppHeader,
  Surface,
  ActionButton,
  Badge,
  toneColor,
  toneSoft,
  toneText,
  type Tone,
} from '../components/AppUI';
import { File } from 'expo-file-system';

import { useThemeTokens } from '../components/practice/PracticeUI';
import { callGeminiJson, GeminiError } from '../utils/geminiClient';
import { AI_UNAVAILABLE_HINT, useAiAvailable } from '../utils/aiAvailability';
import { attachAnalysis, getSession, type InterviewAnalysis } from '../utils/interviewHistory';
import { clearCapture, takeCapture } from '../utils/captureBuffer';
import { audioUri } from '../utils/audioStore';
import { careerContext, profileStore } from '../utils/profile';
import { findCompany } from '../data/companies';
import { interviewerRole } from '../data/sectors';
import { formatDuration } from '../utils/dateUtils';

// Mülakat sonrası yapay zeka değerlendirmesi.
// Şema server/server.ts üzerinden Gemini'ye iletilir; alan adları test-schema.js ile birebir aynı.

const ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    rating: { type: 'INTEGER', description: '100 üzerinden teknik ve stres puanı.' },
    defenseResilience: {
      type: 'STRING',
      description:
        "Baskı altında soğukkanlılık değerlendirmesi (örn. 'Çok Yüksek', 'Yüksek / Sabırlı', 'Geliştirilmeli').",
    },
    postureFeedback: {
      type: 'STRING',
      description: 'Adayın göz teması, baş hareketi ve kameraya karşı duruşunun analizi.',
    },
    fluencyFeedback: {
      type: 'STRING',
      description:
        'Türkçe akıcılık, konuşma hızı, dolgu kelime sayısı veya silme tuşu kısıtı altındaki yazım akışı.',
    },
    depthFeedback: {
      type: 'STRING',
      description:
        'Mühendislik derinliği. Aday fiziksel parametreleri netleştirdi mi yoksa genel geçer mi konuştu?',
    },
    fillerRating: {
      type: 'STRING',
      description:
        "Konuşma netliği etiketi (örn. 'Çok Net', 'Kabul Edilebilir', 'Geliştirilmeli').",
    },
    successPoints: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Adayın gösterdiği iki önemli teknik veya davranışsal güçlü yön.',
    },
    improvementPoints: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Teknik özgüveni artıracak iki net ve uygulanabilir öneri.',
    },
    finalVerdict: { type: 'STRING', description: 'Tek cümlelik nihai değerlendirme.' },
    idealAnswer: {
      type: 'STRING',
      description: 'Sorulan soruya örnek, teknik olarak doğru ve kurgulu bir ideal cevap.',
    },
  },
  required: [
    'rating',
    'defenseResilience',
    'postureFeedback',
    'fluencyFeedback',
    'depthFeedback',
    'fillerRating',
    'successPoints',
    'improvementPoints',
    'finalVerdict',
    'idealAnswer',
  ],
} as const;

export default function AnalysisScreen({ navigation, route }: any) {
  const t = useThemeTokens();
  const sessionId: string = route?.params?.sessionId;
  const session = React.useMemo(() => getSession(sessionId), [sessionId]);

  const [analysis, setAnalysis] = React.useState<InterviewAnalysis | null>(
    session?.analysis ?? null,
  );
  const aiOn = useAiAvailable();
  const [loading, setLoading] = React.useState(!session?.analysis && aiOn);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);

    const capture = takeCapture(session.id);
    const profile = profileStore.get();

    // Bellek arabelleği yalnızca uygulama açıkken dolu: oturum yarıda kalmışsa
    // ya da geçmişten sonradan açıldıysa boştur, ama ses kalıcı olarak diskte
    // duruyor olabilir (kullanıcı kararı 2026-09-20) — o zaman oradan okunur.
    let audioBase64 = capture?.audioBase64;
    if (!audioBase64 && session.audioFile) {
      const uri = audioUri(session.audioFile);
      if (uri) {
        try {
          audioBase64 = await new File(uri).base64();
        } catch (e) {
          console.warn('[mülakat analizi] ses dosyası okunamadı, sessiz devam ediliyor.', e);
        }
      }
    }
    // Kareler kalıcı saklanmıyor; yalnızca bellekten gelirse (aynı oturumda) kullanılır.
    const photos = capture?.photos;

    // Mülakatçı rolü sektör kataloğundan geliyor (YAPILACAKLAR_İRTİFA Bölüm 00):
    // önce oturumun kurumunun sektörü, o bulunamazsa kullanıcının seçtiği sektör.
    // İkisi de yoksa nötr rol kullanılır — hiçbir sektör koda gömülü değil.
    const sectorId = findCompany(session.companyId)?.sectorId ?? profile.sectorId;

    const prompt = [
      interviewerRole(sectorId),
      'Adayın aşağıdaki mülakat performansını değerlendir. Değerlendirmeyi Türkçe, ölçülü ve profesyonel bir dille yaz.',
      '',
      `Kurum: ${session.companyName}`,
      careerContext(profile),
      `Soru: "${session.questionText}"`,
      `Cevap süresi: ${formatDuration(session.durationSeconds)}`,
      `Giriş yöntemi: ${session.mode === 'camera' ? 'Mikrofon ve kamera' : 'Yazılı (silme tuşu kapalı)'}`,
      typeof session.silentSeconds === 'number'
        ? `Sessiz kalınan toplam süre: yaklaşık ${session.silentSeconds} saniye.`
        : '',
      session.transcript ? `\nAdayın yazdığı cevap:\n"""${session.transcript}"""` : '',
      audioBase64
        ? '\nAdayın sesli cevabı ek olarak gönderildi; akıcılık ve dolgu kelime analizini ses üzerinden yap.'
        : '',
      photos?.length
        ? `\nMülakat sırasında ${photos.length} kare yakalandı; duruş ve göz teması analizini bu kareler üzerinden yap.`
        : '',
      session.mode === 'camera' && !photos?.length
        ? '\nBu oturumda kamera karesi yok (kareler kalıcı saklanmaz). Duruş ve göz teması hakkında yorum uydurma; postureFeedback alanında bu verinin bulunmadığını kısaca belirt.'
        : '',
      !audioBase64 && !session.transcript
        ? '\nSes veya metin verisi yok. Bu durumda akıcılık ve derinlik yorumlarını "veri alınamadı" olarak açıkla ve puanı buna göre temkinli ver.'
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const result = await callGeminiJson<InterviewAnalysis>({
        prompt,
        responseSchema: ANALYSIS_SCHEMA as unknown as Record<string, unknown>,
        audioBase64,
        capturedPhotos: photos,
        dbLogs: capture?.dbLogs,
      });

      attachAnalysis(session.id, result);
      setAnalysis(result);
      // Ham ses verisi bellekte tutulmaz; dosya kalıcı kalmaya devam eder
      // (kullanıcı kararı 2026-09-20) — clearCapture yalnızca belleği boşaltır.
      clearCapture(session.id);
    } catch (e) {
      const message =
        e instanceof GeminiError ? e.message : 'Analiz tamamlanamadı. Lütfen tekrar deneyin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  React.useEffect(() => {
    if (session && !session.analysis && aiOn) run();
  }, [session, run, aiOn]);

  if (!session) {
    return (
      <AppScreen header={<AppHeader title="Mülakat Analizi" onBack={() => navigation.goBack()} />}>
        <Surface className="mt-4">
          <Text className={`text-[12px] ${t.body}`}>Bu mülakat kaydı bulunamadı.</Text>
        </Surface>
      </AppScreen>
    );
  }

  return (
    <AppScreen
      header={
        <AppHeader
          title="Mülakat Analizi"
          subtitle={session.companyName}
          onBack={() => navigation.goBack()}
          backIcon="close"
        />
      }
    >
      {/* Soru */}
      <Surface className="mt-1">
        <Text className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${t.muted}`}>
          DEĞERLENDİRİLEN SORU
        </Text>
        <Text className={`text-[14px] font-bold leading-6 ${t.title}`}>
          “{session.questionText}”
        </Text>
        <Text className={`text-[11px] mt-2 ${t.muted}`}>
          {session.mode === 'camera' ? 'Mikrofon & kamera' : 'Yazılı mod'} ·{' '}
          {formatDuration(session.durationSeconds)}
        </Text>
      </Surface>

      {!aiOn && !analysis ? (
        /* Yapay zekâ kapalıyken hata gösterilmiyor: ortada bir hata yok.
           Kayıt zaten kaydedildi, yalnızca değerlendirme katmanı yok. */
        <Surface className="mt-3">
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={18} color={toneColor('slate', t.isLight)} />
            <Text className={`text-[13px] font-bold ml-2 ${t.title}`}>Değerlendirme kapalı</Text>
          </View>
          <Text className={`text-[12px] leading-5 ${t.body}`}>{AI_UNAVAILABLE_HINT}</Text>
          <View className="mt-4">
            <ActionButton
              label="Yapay Zekâyı Aç"
              tone="emerald"
              variant="outline"
              icon={<Sparkles size={16} color={toneColor('emerald', t.isLight)} />}
              onPress={() => navigation.navigate('AiSetup')}
            />
          </View>
        </Surface>
      ) : loading ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color={toneColor('emerald', t.isLight)} />
          <Text className={`text-[12px] font-bold mt-4 ${t.title}`}>
            Yapay zeka mülakatınızı değerlendiriyor…
          </Text>
          <Text className={`text-[11px] mt-1 text-center ${t.muted}`}>
            Ses ve kareler analiz ediliyor, bu işlem yarım dakika sürebilir.
          </Text>
        </View>
      ) : error ? (
        <Surface className="mt-3">
          <View className="flex-row items-center mb-2">
            <AlertTriangle size={18} color={toneColor('amber', t.isLight)} />
            <Text className={`text-[13px] font-bold ml-2 ${t.title}`}>Analiz yapılamadı</Text>
          </View>
          <Text className={`text-[12px] leading-5 ${t.body}`}>{error}</Text>
          <View className="mt-4">
            <ActionButton label="Tekrar Dene" onPress={run} tone="emerald" />
          </View>
          <View className="mt-2">
            <ActionButton
              label="Ayarları Aç"
              variant="outline"
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </Surface>
      ) : analysis ? (
        <AnalysisResult analysis={analysis} onRerun={run} />
      ) : null}
    </AppScreen>
  );
}

function AnalysisResult({
  analysis,
  onRerun,
}: {
  analysis: InterviewAnalysis;
  onRerun: () => void;
}) {
  const t = useThemeTokens();
  const score = Math.max(0, Math.min(100, Math.round(analysis.rating)));
  const tone: Tone = score >= 75 ? 'emerald' : score >= 50 ? 'amber' : 'rose';

  return (
    <View>
      {/* Puan */}
      <Surface className="mt-3 items-center py-6">
        <View
          className={`w-28 h-28 rounded-full items-center justify-center ${toneSoft(tone, t.isLight)}`}
        >
          <Text className={`text-[32px] font-black ${toneText(tone, t.isLight)}`}>{score}</Text>
          <Text className={`text-[10px] font-bold uppercase tracking-widest ${t.muted}`}>
            / 100
          </Text>
        </View>
        <View className="flex-row items-center mt-4">
          <ShieldCheck size={16} color={toneColor(tone, t.isLight)} />
          <Text className={`text-[12px] font-bold ml-2 ${t.title}`}>
            {analysis.defenseResilience}
          </Text>
        </View>
        <Text className={`text-[11px] text-center leading-5 mt-3 px-2 ${t.body}`}>
          {analysis.finalVerdict}
        </Text>
      </Surface>

      {/* Kırılım */}
      <FeedbackCard
        icon={<Eye size={16} color={toneColor('blue', t.isLight)} />}
        title="Duruş ve Göz Teması"
        body={analysis.postureFeedback}
        tone="blue"
      />
      <FeedbackCard
        icon={<AudioWaveform size={16} color={toneColor('violet', t.isLight)} />}
        title="Akıcılık"
        body={analysis.fluencyFeedback}
        tone="violet"
        badge={analysis.fillerRating}
      />
      <FeedbackCard
        icon={<Cpu size={16} color={toneColor('emerald', t.isLight)} />}
        title="Teknik Derinlik"
        body={analysis.depthFeedback}
        tone="emerald"
      />

      {/* Güçlü yönler */}
      <Surface className="mt-3">
        <Text className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${t.muted}`}>
          Güçlü Yönler
        </Text>
        {analysis.successPoints.map((point, index) => (
          <View key={index} className="flex-row mt-2.5">
            <Check size={16} color={toneColor('emerald', t.isLight)} />
            <Text className={`text-[12px] ml-2 flex-1 leading-5 ${t.body}`}>{point}</Text>
          </View>
        ))}
      </Surface>

      {/* Geliştirilecekler */}
      <Surface className="mt-3">
        <Text className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${t.muted}`}>
          GELİŞTİRİLECEK ALANLAR
        </Text>
        {analysis.improvementPoints.map((point, index) => (
          <View key={index} className="flex-row mt-2.5">
            <ArrowUpRight size={16} color={toneColor('amber', t.isLight)} />
            <Text className={`text-[12px] ml-2 flex-1 leading-5 ${t.body}`}>{point}</Text>
          </View>
        ))}
      </Surface>

      {/* İdeal cevap */}
      <Surface className="mt-3">
        <View className="flex-row items-center mb-2">
          <Lightbulb size={16} color={toneColor('amber', t.isLight)} />
          <Text className={`text-[11px] font-bold uppercase tracking-widest ml-2 ${t.muted}`}>
            Örnek İdeal Cevap
          </Text>
        </View>
        <Text className={`text-[12px] leading-6 ${t.body}`}>{analysis.idealAnswer}</Text>
      </Surface>

      <View className="mt-4">
        <ActionButton
          label="Yeniden Analiz Et"
          variant="outline"
          icon={<Sparkles size={16} color={t.iconColor} />}
          onPress={onRerun}
        />
      </View>
    </View>
  );
}

function FeedbackCard({
  icon,
  title,
  body,
  tone,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone: Tone;
  badge?: string;
}) {
  const t = useThemeTokens();
  return (
    <Surface className="mt-3">
      <View className="flex-row items-center mb-2">
        <View
          className={`w-8 h-8 rounded-xl items-center justify-center mr-2 ${toneSoft(tone, t.isLight)}`}
        >
          {icon}
        </View>
        <Text className={`text-[13px] font-bold flex-1 ${t.title}`}>{title}</Text>
        {badge ? <Badge label={badge} tone={tone} /> : null}
      </View>
      <Text className={`text-[12px] leading-6 ${t.body}`}>{body}</Text>
    </Surface>
  );
}
