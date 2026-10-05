import React from 'react';
import { View, Text, Pressable, TextInput, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { File } from 'expo-file-system';
import { Camera, Keyboard as KeyboardIcon, Square, X, AlertTriangle } from 'lucide-react-native';

import {
  ActionButton,
  RoundButton,
  SCREEN_TOP_GAP,
  Surface,
  toneColor,
  toneText,
} from '../components/AppUI';
import { useThemeTokens } from '../components/practice/PracticeUI';
import { findCompany, companyColor, type CompanyId } from '../data/companies';
import {
  pickDailyInterview,
  pickDailyTechnical,
  pickRandomQuestion,
  type DepartmentId,
  type InterviewType,
  type Question,
} from '../data/questions';
import { addSession, type InterviewMode } from '../utils/interviewHistory';
import { profileStore } from '../utils/profile';
import { keepAudio } from '../utils/audioStore';
import { putCapture } from '../utils/captureBuffer';
import { formatDuration } from '../utils/dateUtils';

// Mülakat simülasyonu.
// Parametresiz açılırsa "günün mülakatı" gelir (kurum ve soru gün numarasına göre sabit);
// Özelleştirilmiş Mülakat ekranından gelen parametreler varsa onlar kullanılır.
//
// Akış: düşünme payı → kayıt → analiz ekranı.
// Kamera modunda ses expo-av ile kaydedilir, arada kareler yakalanır; ham veri
// captureBuffer üzerinden analiz ekranına aktarılır (navigasyon parametresine sığmaz).

/** Soruyu okuyup cevabı kurgulamak için verilen varsayılan süre. */
const PREP_SECONDS = 30;
/** Varsayılan cevap süresi. */
const ANSWER_SECONDS = 120;
/** Duruş analizi için kaç saniyede bir kare yakalanacağı. */
const PHOTO_INTERVAL_SECONDS = 20;
const MAX_PHOTOS = 5;
/** Bu eşiğin altındaki ses seviyesi "sessizlik" sayılır. */
const SILENCE_DB = -40;

type Phase = 'prep' | 'recording' | 'finishing';

type RouteParams = {
  companyId?: CompanyId;
  type?: InterviewType;
  department?: DepartmentId;
  mode?: InterviewMode;
  /**
   * Mülakat sekmesinden gelen "günün teknik sorusu" için.
   * `type: 'teknik'` + `department` ile birlikte gelir ve soruyu rastgele değil
   * gün numarasına göre seçtirir — aynı gün tekrar açılınca aynı soru gelir.
   */
  daily?: boolean;
  /** Kriz Masası gibi daha dar süre isteyen modlar için. */
  prepSeconds?: number;
  answerSeconds?: number;
  /** Başlıkta görünen çerçeve — "Kriz Masası", "Maaş Görüşmesi". */
  title?: string;
};

export default function DailyInterviewScreen({ navigation, route }: any) {
  const t = useThemeTokens();
  const insets = useSafeAreaInsets();
  const params: RouteParams = route?.params ?? {};

  // Mülakat kurgusu bir kez hesaplanır; yeniden render sorunun değişmesine yol açmamalı.
  const setup = React.useMemo(() => {
    // Günün teknik sorusu: kurum ve soru gün numarasına bağlı, kurum parametresi
    // gerekmiyor. Bu dal, aşağıdaki rastgele seçimden önce gelmeli.
    if (params.daily && params.type === 'teknik' && params.department) {
      const technical = pickDailyTechnical(params.department);
      return { companyId: technical.companyId, question: technical.question, isDaily: true };
    }
    // Kriz ve maaş türleri kurumdan bağımsız: kimlik boş gelebilir, havuz
    // yine de doğru süzülür (bu türlerin soruları sektörsüz).
    if (params.type) {
      const question = pickRandomQuestion({
        companyId: params.companyId ?? '',
        type: params.type,
        department: params.department,
      });
      return { companyId: params.companyId ?? '', question, isDaily: false };
    }
    const daily = pickDailyInterview(profileStore.get().sectorId);
    return { companyId: daily.companyId, question: daily.question, isDaily: true };
  }, [params.companyId, params.type, params.department, params.daily]);

  // Kurumsuz modlarda (kriz, maaş) `company` boş kalır; başlık `params.title`
  // ya da türün adıyla kurulur.
  const company = findCompany(setup.companyId);
  const frameTitle =
    params.title ?? (setup.isDaily ? 'Günün Sorusu' : company ? 'Mülakat Sorusu' : 'Simülasyon');
  const PREP = params.prepSeconds ?? PREP_SECONDS;
  const ANSWER = params.answerSeconds ?? ANSWER_SECONDS;
  const mode: InterviewMode = params.mode ?? 'camera';

  const [phase, setPhase] = React.useState<Phase>('prep');
  const [prepLeft, setPrepLeft] = React.useState(PREP);
  const [answerLeft, setAnswerLeft] = React.useState(ANSWER);
  const [transcript, setTranscript] = React.useState('');
  const [stopRequested, setStopRequested] = React.useState(false);

  // Geçmişe ve ses dosyasına yazılacak oturum kimliği — CameraPhase de aynı
  // kimliği kullanmalı (kayıt kapanışında keepAudio çağırmak için), bu yüzden
  // bir kez üretilip ref'te tutuluyor.
  const sessionIdRef = React.useRef(`session-${Date.now()}`);
  // Aşağıdaki `beforeRemove` dinleyicisi çıkışı yakalıyor; kayıt yazıldıktan
  // sonra yapılan gezinmelerin ona takılmaması için açılan izin bayrağı.
  const allowLeaveRef = React.useRef(false);

  // Düşünme payı sayacı — biterse kayıt kendiliğinden başlar.
  React.useEffect(() => {
    if (phase !== 'prep') return;
    const id = setInterval(() => {
      setPrepLeft((left) => {
        if (left <= 1) {
          clearInterval(id);
          return 0;
        }
        return left - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  React.useEffect(() => {
    if (phase === 'prep' && prepLeft === 0) setPhase('recording');
  }, [phase, prepLeft]);

  // Cevap süresi sayacı — iki mod da aynı sayacı paylaşır, kayıt kapanınca durur.
  React.useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => setAnswerLeft((left) => Math.max(left - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const finish = React.useCallback(
    (
      capture: {
        audioBase64?: string;
        audioFile?: string;
        photos?: string[];
        dbLogs?: number[];
        silentSeconds?: number;
      },
      options?: { aborted?: boolean },
    ) => {
      const id = sessionIdRef.current;
      const spent = ANSWER - answerLeft;
      const aborted = options?.aborted ?? false;

      addSession({
        id,
        timestamp: new Date().toISOString(),
        companyId: company?.id ?? '',
        companyName: company?.name ?? frameTitle,
        departmentId: params.department,
        questionText: setup.question.text,
        mode,
        durationSeconds: Math.max(spent, 1),
        transcript: mode === 'typing' ? transcript : undefined,
        silentSeconds: capture.silentSeconds,
        audioFile: capture.audioFile,
        aborted: aborted || undefined,
      });

      putCapture(id, {
        audioBase64: capture.audioBase64,
        photos: capture.photos,
        dbLogs: capture.dbLogs,
      });

      // Kayıt yazıldı; aşağıdaki gezinme `beforeRemove` tarafından durdurulmasın.
      allowLeaveRef.current = true;

      // Yarıda bitirilen oturumda analiz ekranına geçilmez — kayıt Mülakat
      // Geçmişi'nde durur, analiz oradan sonra istenirse yapılır.
      if (aborted) {
        navigation.goBack();
      } else {
        navigation.replace('Analysis', { sessionId: id });
      }
    },
    [ANSWER, answerLeft, company, frameTitle, mode, navigation, params.department, setup.question.text, transcript],
  );

  const leaveWithoutSaving = React.useCallback(() => {
    allowLeaveRef.current = true;
    navigation.goBack();
  }, [navigation]);

  /** Çıkış uyarısı. Hem başlıktaki X hem de geri tuşu/jesti buraya düşer. */
  const promptExit = React.useCallback(() => {
    Alert.alert(
      'Mülakattan çık',
      'Kayıt yarıda kalsa da tutulur; analizi Mülakat Geçmişi\'nden daha sonra yapabilirsiniz.',
      [
        {
          text: 'Kaydet ve çık',
          onPress: () => {
            if (mode === 'camera') {
              setStopRequested(true);
            } else {
              finish({}, { aborted: true });
            }
          },
        },
        { text: 'Kaydetmeden çık', style: 'destructive', onPress: leaveWithoutSaving },
        { text: 'Vazgeç', style: 'cancel' },
      ],
    );
  }, [finish, leaveWithoutSaving, mode]);

  const close = () => {
    if (phase === 'prep') {
      leaveWithoutSaving();
      return;
    }
    promptExit();
  };

  /**
   * Ekrandan X'e basmadan çıkılırsa da kayıt sorulsun — Android'in donanım geri
   * tuşu ve iOS'un kenardan kaydırma jesti `close()`'a hiç uğramıyor. Bu
   * olmadan "yarıda bitse de kaydı tutulsun" garantisi yalnızca X düğmesinde
   * geçerliydi: geri tuşuyla çıkanın yazdığı metin de, kaydedilen sesi de
   * (CameraPhase sökülürken kaydı kapatıp geçici dosyayı sildiği için)
   * kayboluyordu.
   *
   * `allowLeaveRef`: kaydı yazdıktan sonra `finish()` ve "Kaydetmeden çık"
   * kendileri gezindiği için, o gezinmeler tekrar yakalanıp sonsuz döngüye
   * girmesin diye açılan izin bayrağı.
   */
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (allowLeaveRef.current || phase === 'prep') return;
      event.preventDefault();
      promptExit();
    });
    return unsubscribe;
  }, [navigation, phase, promptExit]);

  return (
    <View className="flex-1" style={{ paddingTop: insets.top + SCREEN_TOP_GAP }}>
      <View className="px-5 pt-2 pb-3 flex-row items-center">
        <RoundButton icon={<X size={20} color={t.iconColor} />} onPress={close} label="Kapat" />
        {phase !== 'prep' ? (
          <View className="flex-1 items-end">
            <Text className={`text-[12px] font-bold ${answerLeft <= 15 ? toneText('rose', t.isLight) : t.muted}`}>
              {formatDuration(answerLeft)}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-1 px-5">
        {/* Soru kartı — her aşamada görünür kalır */}
        <Surface>
          <Text
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{
              color: company ? companyColor(company, t.isLight) : toneColor('violet', t.isLight),
            }}
          >
            {company ? `${frameTitle} (${company.name})` : frameTitle}
          </Text>
          <Text className={`text-[18px] font-bold leading-7 ${t.title}`}>
            “{setup.question.text}”
          </Text>
        </Surface>

        {phase === 'prep' ? (
          <PrepPhase
            secondsLeft={prepLeft}
            mode={mode}
            onStart={() => setPhase('recording')}
          />
        ) : mode === 'camera' ? (
          <CameraPhase
            sessionId={sessionIdRef.current}
            timeUp={answerLeft <= 0}
            stopRequested={stopRequested}
            onFinish={finish}
            finishing={phase === 'finishing'}
            onFinishing={() => setPhase('finishing')}
          />
        ) : (
          <TypingPhase
            timeUp={answerLeft <= 0}
            value={transcript}
            onChange={setTranscript}
            onFinish={() => finish({})}
          />
        )}
      </View>
    </View>
  );
}

/** Düşünme payı: geri sayan halka ve kaydı erken başlatma düğmesi. */
function PrepPhase({
  secondsLeft,
  mode,
  onStart,
}: {
  secondsLeft: number;
  mode: InterviewMode;
  onStart: () => void;
}) {
  const t = useThemeTokens();
  const size = Math.min(Dimensions.get('window').width * 0.55, 220);

  return (
    <View className="flex-1 items-center justify-center">
      <View
        className={`items-center justify-center border-8 ${
          t.isLight ? 'border-amber-200' : 'border-amber-900'
        }`}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      >
        <Text className={`text-5xl font-bold ${t.isLight ? 'text-amber-600' : 'text-amber-400'}`}>
          {secondsLeft}
        </Text>
        <Text className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${t.muted}`}>
          Düşünme Payı
        </Text>
      </View>

      <View className="w-full mt-10">
        <ActionButton
          label={mode === 'camera' ? 'Hazırım, Kaydı Başlat' : 'Hazırım, Yazmaya Başla'}
          icon={
            mode === 'camera' ? (
              <Camera size={18} color="#ffffff" />
            ) : (
              <KeyboardIcon size={18} color="#ffffff" />
            )
          }
          onPress={onStart}
        />
        <Text className={`text-[11px] text-center mt-3 ${t.muted}`}>
          Süre dolduğunda kayıt kendiliğinden başlar.
        </Text>
      </View>
    </View>
  );
}

/** Kamera + mikrofon modu. Ses kaydedilir, arada duruş için kare yakalanır. */
function CameraPhase({
  sessionId,
  timeUp,
  stopRequested,
  onFinish,
  finishing,
  onFinishing,
}: {
  sessionId: string;
  timeUp: boolean;
  /** close() içinden "Kaydet ve çık" seçilince true olur — kayıt dışarıdan kapatılır. */
  stopRequested: boolean;
  onFinish: (
    capture: {
      audioBase64?: string;
      audioFile?: string;
      photos?: string[];
      dbLogs?: number[];
      silentSeconds?: number;
    },
    options?: { aborted?: boolean },
  ) => void;
  finishing: boolean;
  onFinishing: () => void;
}) {
  const t = useThemeTokens();
  const [cameraPermission, requestCamera] = useCameraPermissions();
  const [micPermission, requestMic] = useMicrophonePermissions();

  const cameraRef = React.useRef<CameraView | null>(null);
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const photosRef = React.useRef<string[]>([]);
  const dbLogsRef = React.useRef<number[]>([]);
  const silentTicksRef = React.useRef(0);
  const stoppedRef = React.useRef(false);

  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // İzinleri iste — reddedilirse kullanıcıya yazılı moda geçme seçeneği sunulur.
  React.useEffect(() => {
    (async () => {
      const camera = cameraPermission?.granted ? cameraPermission : await requestCamera();
      const mic = micPermission?.granted ? micPermission : await requestMic();
      if (!camera?.granted) {
        setError('Kamera izni verilmedi. Duruş analizi yapılamayacak.');
      } else if (!mic?.granted) {
        setError('Mikrofon izni verilmedi. Ses analizi yapılamayacak.');
      }
      setReady(true);
    })();
    // İzin akışı yalnızca bir kez çalışmalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ses kaydını başlat.
  React.useEffect(() => {
    if (!ready || !micPermission?.granted) return;
    let cancelled = false;

    (async () => {
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(
          { ...Audio.RecordingOptionsPresets.HIGH_QUALITY, isMeteringEnabled: true },
          (status) => {
            if (typeof status.metering === 'number') {
              dbLogsRef.current.push(Math.round(status.metering));
              if (status.metering < SILENCE_DB) silentTicksRef.current += 1;
            }
          },
          500,
        );
        if (cancelled) {
          await recording.stopAndUnloadAsync().catch(() => {});
          return;
        }
        recordingRef.current = recording;
      } catch (e) {
        console.warn('[mülakat] ses kaydı başlatılamadı', e);
        setError('Ses kaydı başlatılamadı. Mülakat yine de sürüyor.');
      }
    })();

    return () => {
      cancelled = true;
      // "Kaydetmeden çık" ya da başka bir sebeple ekran sökülürse kayıt hâlâ
      // açıksa burada kapanır. Yoksa native kayıt oturumu ve mikrofon serbest
      // bırakılmıyor, sonraki mülakatta kayıt başlatılamıyordu. (Normal
      // bitişte `stop()` zaten kapatıp `recordingRef`'i boşaltıyor, bu dal
      // yalnızca yarıda sökülmede çalışır.)
      const pending = recordingRef.current;
      recordingRef.current = null;
      if (!pending) return;
      void (async () => {
        try {
          await pending.stopAndUnloadAsync();
          // Kaydedilmeyen ses önbellekte çöp olarak kalmasın.
          const uri = pending.getURI();
          if (uri) new File(uri).delete();
        } catch (e) {
          console.warn('[mülakat] kayıt kapatılamadı', e);
        }
      })();
    };
  }, [ready, micPermission?.granted]);

  const stop = React.useCallback(
    async (options?: { aborted?: boolean }) => {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      onFinishing();

      let audioBase64: string | undefined;
      let audioFile: string | undefined;
      const recording = recordingRef.current;
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          if (uri) {
            // Sıra önemli: keepAudio dosyayı kalıcı klasöre TAŞIYOR, bu yüzden
            // önce analiz için base64 okunuyor, taşıma sonra yapılıyor.
            audioBase64 = await new File(uri).base64();
            audioFile = keepAudio(sessionId, uri);
          }
        } catch (e) {
          console.warn('[mülakat] ses kaydı okunamadı', e);
        }
        recordingRef.current = null;
      }

      onFinish(
        {
          audioBase64,
          audioFile,
          photos: photosRef.current.length > 0 ? photosRef.current : undefined,
          dbLogs: dbLogsRef.current.length > 0 ? dbLogsRef.current : undefined,
          // Ölçüm aralığı 500 ms olduğu için tik sayısının yarısı saniyeye karşılık gelir.
          silentSeconds: Math.round(silentTicksRef.current / 2),
        },
        options,
      );
    },
    [onFinish, onFinishing, sessionId],
  );

  // Süre dolduğunda kayıt kendiliğinden kapanır.
  React.useEffect(() => {
    if (ready && timeUp) stop();
  }, [ready, timeUp, stop]);

  // close() içinden "Kaydet ve çık" seçilince dışarıdan kapatma isteği gelir.
  React.useEffect(() => {
    if (ready && stopRequested) stop({ aborted: true });
  }, [ready, stopRequested, stop]);

  // Duruş analizi için periyodik kare yakalama.
  React.useEffect(() => {
    if (!ready || !cameraPermission?.granted) return;
    const id = setInterval(async () => {
      if (photosRef.current.length >= MAX_PHOTOS || stoppedRef.current) return;
      try {
        const photo = await cameraRef.current?.takePictureAsync({
          base64: true,
          quality: 0.2,
          skipProcessing: true,
          shutterSound: false,
        });
        if (photo?.base64) photosRef.current.push(photo.base64);
      } catch (e) {
        console.warn('[mülakat] kare yakalanamadı', e);
      }
    }, PHOTO_INTERVAL_SECONDS * 1000);
    return () => clearInterval(id);
  }, [ready, cameraPermission?.granted]);

  return (
    <View className="flex-1 mt-4">
      <View className={`flex-1 rounded-2xl overflow-hidden ${t.isLight ? 'bg-slate-200' : 'bg-slate-900'}`}>
        {cameraPermission?.granted ? (
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" mode="picture" />
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <AlertTriangle size={28} color={toneColor('amber', t.isLight)} />
            <Text className={`text-[12px] text-center mt-3 ${t.body}`}>
              {error ?? 'Kamera hazırlanıyor…'}
            </Text>
          </View>
        )}

        {/* Kayıt göstergesi */}
        <View className="absolute top-3 left-3 flex-row items-center px-3 py-1.5 rounded-full bg-black/50">
          <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
          <Text className="text-[11px] font-bold text-white">KAYIT</Text>
        </View>
      </View>

      {error && cameraPermission?.granted ? (
        <Text className={`text-[11px] mt-2 ${toneText('amber', t.isLight)}`}>{error}</Text>
      ) : null}

      {micPermission?.granted ? (
        <Text className={`text-[11px] mt-2 ${t.muted}`}>
          Ses kaydı cihazınızda saklanır, Mülakat Geçmişi'nden dinleyebilirsiniz.
        </Text>
      ) : null}

      <View className="py-4">
        <ActionButton
          label={finishing ? 'Kayıt kapatılıyor…' : 'Kaydı Bitir ve Analiz Et'}
          tone="rose"
          disabled={finishing}
          icon={<Square size={16} color="#ffffff" fill="#ffffff" />}
          onPress={() => stop()}
        />
      </View>
    </View>
  );
}

/** Yazılı mod: silme tuşu devre dışı, akıcılık kesintisiz yazı akışından ölçülür. */
function TypingPhase({
  timeUp,
  value,
  onChange,
  onFinish,
}: {
  timeUp: boolean;
  value: string;
  onChange: (next: string) => void;
  onFinish: () => void;
}) {
  const t = useThemeTokens();
  const finishedRef = React.useRef(false);

  React.useEffect(() => {
    if (!timeUp || finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [timeUp, onFinish]);

  /** Metin kısalıyorsa silme yapılmıştır — değişikliği yok sayıyoruz. */
  const handleChange = (next: string) => {
    if (next.length < value.length) return;
    onChange(next);
  };

  return (
    <View className="flex-1 mt-4">
      <View className={`flex-1 rounded-2xl p-4 ${t.cardBg}`}>
        <TextInput
          value={value}
          onChangeText={handleChange}
          multiline
          autoFocus
          textAlignVertical="top"
          placeholder="Cevabınızı yazın. Silme tuşu bu modda çalışmaz — düşünerek ilerleyin."
          placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
          className={`flex-1 text-[14px] leading-6 ${t.isLight ? 'text-slate-900' : 'text-slate-100'}`}
        />
        <View className={`flex-row justify-between pt-3 border-t ${t.dividerColor}`}>
          <Text className={`text-[11px] ${t.muted}`}>{value.trim().split(/\s+/).filter(Boolean).length} kelime</Text>
          <Text className={`text-[11px] ${t.muted}`}>Silme tuşu kapalı</Text>
        </View>
      </View>

      <View className="py-4">
        <ActionButton label="Bitir ve Analiz Et" tone="rose" onPress={onFinish} />
      </View>
    </View>
  );
}
