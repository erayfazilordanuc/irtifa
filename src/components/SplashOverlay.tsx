import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { BRAND } from './themeTokens';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

// Açılış ekranı.
//
// Native splash (app.json → expo-splash-screen) yalnızca düz renk + ortada görsel
// gösterebiliyor; Android 12+ degrade desteklemiyor. Bu katman native splash'in
// birebir aynısıyla başlıyor — aynı zemin rengi, aynı görsel aynı genişlikte
// ortada — native splash kapanınca degradeyi ve yazıyı açıyor, sonra uygulamaya
// soluyor. Böylece geçişte figür kıpırdamıyor.
//
// Aşağıdaki ilk iki değer app.json ile eşleşmeli; biri değişirse diğeri de.

/** app.json → expo-splash-screen `backgroundColor` (`BRAND.navy`) */
const NATIVE_BACKGROUND = BRAND.navy;
/** app.json → expo-splash-screen `imageWidth` */
const IMAGE_WIDTH = 170;
/** assets/brand/ikon/irtifa-icon-master.svg degradesi (`BRAND`) */
const GRADIENT = [BRAND.navyLight, BRAND.navy, BRAND.navyDark] as const;
/** splash-icon.png içinde figürün alt kenarı (860 / 1024) */
const MARK_BOTTOM = 0.84;

/**
 * "İrtifa" yazısı canlı metin, sistem fontuyla.
 *
 * Terakki burada Italianno fontundan üretilmiş bir görsel kullanıyordu: o
 * fontta 'i'nin noktası ilerleme genişliğinin dışında kaldığı için Android
 * son harfin noktasını kırpıyordu. İrtifa sistem fontunu kullanıyor (kurumsal,
 * sade ton — YAPILACAKLAR_İRTİFA Bölüm 5); sistem fontlarında bu sorun yok ve
 * splash font yüklenmesini beklemiyor.
 */
const WORDMARK = 'İrtifa';

/** Figürün altı ile yazı kutusunun üstü arası (kutunun üstünde font boşluğu var). */
const TITLE_GAP = 12;
const TITLE_RISE = 6;

const TIMING = { gradient: 450, titleDelay: 150, title: 650, exitDelay: 1300, exit: 350 };
const REDUCED_TIMING = { gradient: 0, titleDelay: 0, title: 200, exitDelay: 900, exit: 200 };

const easing = Easing.out(Easing.cubic);

export function SplashOverlay() {
  const [laidOut, setLaidOut] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const reduceMotion = useReducedMotion();

  const gradient = useSharedValue(0);
  const title = useSharedValue(0);
  const veil = useSharedValue(1);

  // İlk kare çizilmeden native splash kapanırsa arada boş ekran görünür.
  // Font beklentisi kalmadığı için tek koşul bu.
  const ready = laidOut;

  React.useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {
      /* zaten kapalı */
    });
    const t = reduceMotion ? REDUCED_TIMING : TIMING;
    gradient.value = withTiming(1, { duration: t.gradient, easing });
    title.value = withDelay(t.titleDelay, withTiming(1, { duration: t.title, easing }));
    veil.value = withDelay(t.exitDelay, withTiming(0, { duration: t.exit, easing }));
    const timeout = setTimeout(() => setDone(true), t.exitDelay + t.exit);
    return () => clearTimeout(timeout);
  }, [ready]);

  const gradientStyle = useAnimatedStyle(() => ({ opacity: gradient.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: title.value,
    transform: [{ translateY: (1 - title.value) * TITLE_RISE }],
  }));
  const veilStyle = useAnimatedStyle(() => ({ opacity: veil.value }));

  if (done) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, veilStyle]}
      onLayout={() => setLaidOut(true)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <StatusBar style="light" />
      <Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
        <LinearGradient colors={GRADIENT} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <View style={styles.center}>
        <Image source={require('../../assets/splash-icon.png')} style={styles.mark} />
      </View>
      <View style={styles.titleRow}>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>{WORDMARK}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: NATIVE_BACKGROUND,
    zIndex: 1000,
    elevation: 1000,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
  },
  titleRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: IMAGE_WIDTH * (MARK_BOTTOM - 0.5) + TITLE_GAP,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1.5,
    opacity: 0.95,
  },
});
