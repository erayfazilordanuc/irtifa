import "./global.css";
import React from 'react';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
import { useColorScheme, View, Text, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Mic, Flame, Dumbbell, Briefcase, TrendingUp } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from './src/utils/ThemeContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import {
  BackgroundVariantProvider,
  ScreenBackground,
  backgroundBase,
  type BackgroundVariant,
} from './src/components/ScreenBackground';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN } from './src/components/tabBar';
import { DailyPracticeSettingsProvider } from './src/utils/dailyPracticeSettings';
import { useReminderSync, useReminderNavigation } from './src/utils/useReminderSync';
import { onboardingStore } from './src/utils/onboarding';
import { loadApiKey } from './src/utils/aiCredentials';

import InterviewHubScreen from './src/screens/InterviewHubScreen';
import CrisisScreen from './src/screens/CrisisScreen';
import WorkshopScreen from './src/screens/WorkshopScreen';
import CareerScreen from './src/screens/CareerScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import DailyInterviewScreen from './src/screens/DailyInterviewScreen';
import FieldTestScreen from './src/screens/FieldTestScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import StarStoriesScreen from './src/screens/StarStoriesScreen';
import CompanyNotesScreen from './src/screens/CompanyNotesScreen';
import FollowUpScreen from './src/screens/FollowUpScreen';
import CustomInterviewScreen from './src/screens/CustomInterviewScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import BrainExercisesScreen from './src/screens/BrainExercisesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AiSetupScreen from './src/screens/AiSetupScreen';
import ExerciseEngineScreen from './src/screens/ExerciseEngineScreen';
import InterviewHistoryScreen from './src/screens/InterviewHistoryScreen';
import ExerciseHistoryScreen from './src/screens/ExerciseHistoryScreen';
import ResponseJournalScreen from './src/screens/ResponseJournalScreen';
import ExerciseDetailScreen from './src/screens/ExerciseDetailScreen';
import NewsScreen from './src/screens/NewsScreen';
import DiaphragmExerciseScreen from './src/screens/DiaphragmExerciseScreen';
import SpeechExerciseScreen from './src/screens/SpeechExerciseScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import MeasurementsScreen from './src/screens/MeasurementsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bildirime dokunulduğunda ilgili günlük pratik ekranını açmak için kullanılır.
const navigationRef = createNavigationContainerRef();

// Sabit NavigationContainer teması — tüm theming isLight ile ekranlarda yapılıyor.
// Bu tema hiçbir zaman değişmez, böylece NavigationContainer ekranları yeniden mount etmez.
const STATIC_NAV_THEME = {
  dark: false,
  colors: {
    primary: '#2563eb',
    background: 'transparent',
    card: 'transparent',
    text: '#000000',
    border: 'transparent',
    notification: '#ef4444',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

// SimulationStack is removed. We use a RootStack around TabNavigator.

interface AnimatedTabButtonProps {
  children: React.ReactNode;
  onPress?: (e: any) => void;
  accessibilityState?: { selected?: boolean };
}

const smoothEasing = Easing.out(Easing.cubic);

function AnimatedTabButton(props: any) {
  const { children, onPress, accessibilityState, style, ...rest } = props;
  const focused = accessibilityState?.selected;
  const scale = useSharedValue(focused ? 1.3 : 1);

  React.useEffect(() => {
    scale.value = withTiming(focused ? 1.3 : 1, {
      duration: 180,
      easing: smoothEasing,
    });
  }, [focused]);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 120, easing: smoothEasing });
  };

  const handlePressOut = () => {
    scale.value = withTiming(focused ? 1.3 : 1, {
      duration: 180,
      easing: smoothEasing,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Pressable 
      {...rest}
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}
      android_ripple={{ color: 'transparent' }}
    >
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}


import * as SplashScreen from 'expo-splash-screen';
import { SplashOverlay } from './src/components/SplashOverlay';

// Native splash'i SplashOverlay kendi ilk karesi hazır olunca kapatır.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

// Kullanıcının Gemini anahtarını cihazın kasasından belleğe okur. Eşzamansız
// olduğu için burada başlatılıyor; okunana kadar yapay zekâ kapalı görünür,
// okununca `useAiAvailable()` aboneleri kendiliğinden tazeleniyor. Açılışı
// geciktirmiyor — beklenmiyor.
void loadApiKey();

export default function App() {
  return (
    <React.Fragment>
      {/* Hata sınırı en dışta: sağlayıcıların kendisi hata verse bile yakalanır. */}
      <ErrorBoundary>
        <ThemeProvider>
          <DailyPracticeSettingsProvider>
            <SafeAreaProvider>
              <NavigationContainer ref={navigationRef} theme={STATIC_NAV_THEME}>
                <AppContent />
              </NavigationContainer>
            </SafeAreaProvider>
          </DailyPracticeSettingsProvider>
        </ThemeProvider>
      </ErrorBoundary>
      {/* Sınırın dışında: uygulama hata verse de native splash kapanır, hata ekranı görünür. */}
      <SplashOverlay />
    </React.Fragment>
  );
}

/**
 * Her yığın ekranını kendi opak zeminiyle sarar.
 * Saydam ekranlarda geçiş sırasında alttaki sayfa görünüp titremeye yol açıyordu.
 */
function screenLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      {children}
    </View>
  );
}

function AppContent() {
  const { isLight } = useAppTheme();
  const [activeTab, setActiveTab] = React.useState<BackgroundVariant>('Mülakat');

  // İlk rota bir kez hesaplanır: oryantasyon tamamlanmışsa doğrudan MainTabs,
  // değilse Onboarding. Sonraki `completed` değişiklikleri (Ayarlar →
  // "Oryantasyonu yeniden göster") bu değeri değiştirmez — o zaten
  // `navigation.navigate('Onboarding')` ile açılır.
  const initialRoute = React.useRef(onboardingStore.get().completed ? 'MainTabs' : 'Onboarding').current;

  // Navigator'a giden nesneler sabitleniyor.
  //
  // Eskiden `screenOptions` ve `screenListeners` her render'da yeniden
  // oluşturuluyordu; tema değiştiğinde AppContent yeniden render olduğu için
  // navigator da baştan yapılandırılıyor ve bu sırada React Navigation'ın
  // NavigationStateContext'i bir render boyunca varsayılana düşüp
  // "Couldn't find a navigation context" hatası fırlatabiliyordu.
  // screenListeners ayrıca setActiveTab çağırdığı için kendi kendini
  // yeniden abone eden bir döngü de kuruyordu.
  const stackScreenOptions = React.useMemo(
    () => ({
      headerShown: false as const,
      // Ekran daha ilk karede opak olsun; degrade üstüne biniyor.
      contentStyle: { backgroundColor: backgroundBase(isLight) },
    }),
    [isLight],
  );

  const stackScreenListeners = React.useMemo(
    () => ({
      state: (e: any) => {
        const currentRoute = e.data.state.routes[e.data.state.index];
        if (currentRoute.name === 'MainTabs' && currentRoute.state) {
          const tabState = currentRoute.state as any;
          const activeTabRoute = tabState.routes[tabState.index];
          setActiveTab(activeTabRoute.name as BackgroundVariant);
        }
      },
    }),
    [],
  );

  // Günlük pratik hatırlatmalarını ayarlarla eşitle ve bildirime dokunulduğunda ilgili ekranı aç.
  useReminderSync();
  useReminderNavigation(
    React.useCallback((screen: string, params?: Record<string, unknown>) => {
      if (!navigationRef.isReady()) return;
      // Ekran adı bildirim verisinden geliyor, yani derleme anında bilinmiyor;
      // navigate'in aşırı yüklü imzası bu yüzden gevşetiliyor. Hedefin geçerli
      // olduğunu `habitTemplates.ts`/`dailyNotifications.ts` garanti ediyor.
      const navigate = navigationRef.navigate as unknown as (
        screen: string,
        params?: Record<string, unknown>,
      ) => void;
      navigate(screen, params);
    }, []),
  );

  return (
    <React.Fragment>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      {/* Zemin artık her ekranın içinde (screenLayout); buradaki düz renk yalnızca tabandır. */}
      <View style={{ flex: 1, backgroundColor: backgroundBase(isLight) }}>
        <BackgroundVariantProvider variant={activeTab}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={stackScreenOptions}
            screenLayout={screenLayout}
            screenListeners={stackScreenListeners}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ gestureEnabled: false, animation: 'fade' }}
            />
            <Stack.Screen name="DailyInterview" component={DailyInterviewScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="FieldTest" component={FieldTestScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="Applications" component={ApplicationsScreen} />
            <Stack.Screen name="StarStories" component={StarStoriesScreen} />
            <Stack.Screen name="CompanyNotes" component={CompanyNotesScreen} />
            <Stack.Screen name="FollowUp" component={FollowUpScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CustomInterview" component={CustomInterviewScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Analysis" component={AnalysisScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="AiSetup" component={AiSetupScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Reminders" component={RemindersScreen} />
            <Stack.Screen name="Measurements" component={MeasurementsScreen} />
            <Stack.Screen name="BrainExercises" component={BrainExercisesScreen} />
            <Stack.Screen name="ExerciseEngine" component={ExerciseEngineScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="InterviewHistory" component={InterviewHistoryScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="ResponseJournal" component={ResponseJournalScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="NewsScreen" component={NewsScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="DiaphragmExercise" component={DiaphragmExerciseScreen} options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="SpeechExercise" component={SpeechExerciseScreen} options={{ presentation: 'fullScreenModal' }} />
          </Stack.Navigator>
        </BackgroundVariantProvider>
      </View>
    </React.Fragment>
  );
}

// Yüzen sekme çubuğunun yanlardan ve alttan bıraktığı eşit boşluk.
// Çubuğun yanlardaki ve alttaki boşluğu — tek sabit, üçü de eşit olsun diye.
// Ölçüler `src/components/tabBar.ts`'te: ekranların alt boşluğu (`AppScreen`)
// da aynı sabitlerden hesaplanıyor, ikisi ayrışmasın diye.

/**
 * Bir sekmenin `options` nesnesi. Dört sekme aynı kalıbı paylaşıyor: ikon,
 * etiket, animasyonlu düğme.
 *
 * ⚠️ Bunu bir **bileşene** sarmayın. React Navigation, Navigator'ın doğrudan
 * çocuklarını inceliyor ve yalnızca `Screen` / `Group` / `Fragment` kabul
 * ediyor; araya kendi bileşenini koyan şu hatayı alır:
 *   "A navigator can only contain 'Screen', 'Group' or 'React.Fragment'
 *    as its direct children (found 'TabItem' …)"
 * Bu yüzden tekrar, seçenek üreten bir fonksiyonla kırılıyor — `Tab.Screen`
 * elemanları JSX'te doğrudan duruyor.
 */
function tabOptions({
  name,
  icon: Icon,
  active,
  activeText,
  isLight,
}: {
  name: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  /** Seçiliyken ikon rengi. */
  active: string;
  /** Seçiliyken etiketin NativeWind sınıfı. */
  activeText: string;
  isLight: boolean;
}) {
  const idle = isLight ? '#64748b' : '#a1a1aa';
  const idleText = isLight ? 'text-slate-500' : 'text-zinc-400';
  return {
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <Icon color={focused ? active : idle} size={24} />
    ),
    tabBarLabel: ({ focused }: { focused: boolean }) => (
      <Text className={`text-[10px] font-bold mt-1 ${focused ? activeText : idleText}`}>
        {name}
      </Text>
    ),
    tabBarButton: AnimatedTabButton,
  };
}

function MainTabs() {
  const { isLight } = useAppTheme();

  // Genişlik elle hesaplanıyor (left/right ikilisi tabBarStyle içinde güvenilir çalışmıyor):
  // yanlardaki boşluk alttakiyle birebir aynı olsun.
  const screenWidth = useWindowDimensions().width;
  const barWidth = screenWidth - TAB_BAR_MARGIN * 2;

  return (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              bottom: TAB_BAR_MARGIN,
              left: 0,
              marginLeft: TAB_BAR_MARGIN,
              width: barWidth,
              height: TAB_BAR_HEIGHT,
              borderRadius: TAB_BAR_HEIGHT / 2,
              paddingBottom: 0,
              paddingTop: 0,
              borderTopWidth: 0,
              elevation: 6, // Sade, yumuşak bir gölge
              shadowColor: isLight ? '#7d899aff' : '#000000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isLight ? 0.08 : 0.3,
              shadowRadius: 14,
            },
            tabBarBackground: () => (
              <LinearGradient
                // Koyu tema nötr: eskiden slate-800 → slate-900 (lacivert) kullanılıyordu
                // ve çubuk koyu temada maviye kaçıyordu. Artık kart yüzeyiyle (#161618)
                // aynı aileden gri tonları.
                colors={
                  isLight
                    ? ['rgba(255,255,255,1)', 'rgba(248,250,252,1)']
                    : ['rgba(38,38,43,0.97)', 'rgba(32,32,37,1)']
                }
                style={{ 
                  flex: 1, 
                  borderRadius: TAB_BAR_HEIGHT / 2,
                  borderWidth: 1,
                  // Açıkta cam efekti için beyaz; koyuda ince bir ayrım yeter —
                  // 0.15 opaklık çubuğu zeminden fazla koparıyordu.
                  borderColor: isLight ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.06)',
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            ),
          }}
        >
          {/* Sekme sırası iş akışını anlatır:
              Mülakat (günün işi) → Kriz Masası (baskı provası)
              → Atölye (hazırlık egzersizleri) → Kariyer (başvuru süreci)
              → Karne (ne kadar yol aldım).
              Profil ve Ayarlar, Karne başlığındaki düğmeden açılıyor: beş sekme
              zaten dolu ve profil günlük bir iş değil. */}
          <Tab.Screen
            name="Mülakat"
            component={InterviewHubScreen}
            options={tabOptions({
              name: 'Mülakat',
              icon: Mic,
              active: isLight ? '#2563eb' : '#60a5fa',
              activeText: isLight ? 'text-blue-600' : 'text-blue-400',
              isLight,
            })}
          />
          <Tab.Screen
            name="Kriz"
            component={CrisisScreen}
            options={tabOptions({
              name: 'Kriz',
              icon: Flame,
              active: isLight ? '#e11d48' : '#fb7185',
              activeText: isLight ? 'text-rose-600' : 'text-rose-400',
              isLight,
            })}
          />
          <Tab.Screen
            name="Atölye"
            component={WorkshopScreen}
            options={tabOptions({
              name: 'Atölye',
              icon: Dumbbell,
              active: isLight ? '#059669' : '#34d399',
              activeText: isLight ? 'text-emerald-600' : 'text-emerald-400',
              isLight,
            })}
          />
          <Tab.Screen
            name="Kariyer"
            component={CareerScreen}
            options={tabOptions({
              name: 'Kariyer',
              icon: Briefcase,
              active: isLight ? '#d97706' : '#fbbf24',
              activeText: isLight ? 'text-amber-600' : 'text-amber-400',
              isLight,
            })}
          />
          <Tab.Screen
            name="Karne"
            component={ProgressScreen}
            options={tabOptions({
              name: 'Karne',
              icon: TrendingUp,
              active: isLight ? '#7c3aed' : '#a78bfa',
              activeText: isLight ? 'text-violet-600' : 'text-violet-400',
              isLight,
            })}
          />
        </Tab.Navigator>
  );
}
