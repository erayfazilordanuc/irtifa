import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ViewStyle,
  Modal,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings as SettingsIcon, X } from 'lucide-react-native';

import { useAppTheme } from '../../utils/ThemeContext';
import { useThemeTokens } from '../themeTokens';
import { AppHeader, RoundButton, SCREEN_TOP_GAP } from '../AppUI';

// Günlük pratik ekranlarının paylaştığı görsel parçalar.
// Uygulamanın mevcut düzeni gibi tema ayrımı NativeWind sınıflarıyla isLight üzerinden yapılıyor.

// Kanca artık ortak modülde; buradan da erişilebilsin diye yeniden dışa aktarılıyor.
export { useThemeTokens };

type ScreenShellProps = {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  closeIcon?: 'x' | 'back';
  children: React.ReactNode;
  /** Alt kısımda sabit kalan aksiyon alanı. */
  footer?: React.ReactNode;
  scroll?: boolean;
  /** Başlığın sağındaki düğme — modül ekranlarında `SettingsButton`. */
  right?: React.ReactNode;
};

export function ScreenShell({
  title,
  subtitle,
  onClose,
  closeIcon = 'x',
  children,
  footer,
  scroll = true,
  right,
}: ScreenShellProps) {
  const t = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingTop: insets.top + SCREEN_TOP_GAP }}>
      {/* Başlık, uygulamanın diğer alt ekranlarıyla aynı bileşen. */}
      <AppHeader
        title={title}
        subtitle={subtitle}
        onBack={onClose}
        backIcon={closeIcon === 'x' ? 'close' : 'back'}
        right={right}
      />

      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          // Bkz. AppScreen: kaydırma çubuğu, sayfanın devam ettiğini gösteren
          // standart işaret; modül ekranları da aynı davranışı paylaşsın.
          showsVerticalScrollIndicator
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-5">{children}</View>
      )}

      {footer ? (
        <View
          className={`px-5 pt-3 border-t ${t.dividerColor}`}
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Alttan açılan panellerin ortak örtüsü ve açılış animasyonu.
 *
 * **Neden elle animasyon:** `Modal`'ın `animationType="slide"`'ı modalın
 * *tamamını* kaydırıyor — yarı saydam siyah örtü de dahil. Sonuç, kararan
 * zeminin aşağıdan yukarı süpürülmesi gibi görünüyordu (kullanıcı bildirdi,
 * 2026-10-04). Doğru davranış: **örtü yerinde solar, yalnızca panel kayar.**
 * O yüzden `animationType="none"` + iki ayrı animasyon: örtüde `opacity`,
 * panelde `translateY`.
 *
 * Kapanış animasyonu görünebilsin diye modal, `visible` false olduktan sonra
 * animasyon bitene kadar monte kalıyor (`mounted`).
 *
 * NativeWind sınıfları bilerek içteki düz `View`'de: animasyonu taşıyan
 * `Animated.View` yalnızca stil alıyor, çünkü projede `react-native-css-interop`
 * yamalı ve sarmalanmış bileşenlere `className` vermek gereksiz risk.
 */
export function SheetOverlay({
  visible,
  onClose,
  children,
  /** Panelin yükseklik kısıtı — `maxHeight` ya da sabit `height`. */
  sheetStyle,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sheetStyle?: ViewStyle;
}) {
  const t = useThemeTokens();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = React.useState(visible);
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, progress]);

  if (!mounted) return null;

  // Panel yüksekliği içeriğe göre değişiyor; ölçüp beklemek ilk karede sıçrama
  // yaratacağı için ekran yüksekliği kadar ötelemek yeterli — her hâlükârda
  // ekranın altında başlıyor.
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)', opacity: progress }]}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Paneli kapat"
        />
        {/* `sheetStyle` yüzde yükseklik taşıyabiliyor (`maxHeight: '88%'`), o
            yüzden doğrudan bu düğümde duruyor: yüzde, üstteki tam ekran
            kapsayıcıya göre çözülmek zorunda. Araya otomatik yükseklikli bir
            sarmalayıcı girerse yüzde 0'a düşüyor ve panel görünmüyor. */}
        <Animated.View
          style={[
            {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: 'hidden',
              backgroundColor: t.surfaceColor,
            },
            sheetStyle,
            { transform: [{ translateY }] },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Modül ekranlarının sağ üstündeki ayar düğmesi. */
export function SettingsButton({ onPress, label = 'Modül ayarları' }: { onPress: () => void; label?: string }) {
  const t = useThemeTokens();
  return <RoundButton icon={<SettingsIcon size={19} color={t.iconColor} />} onPress={onPress} label={label} />;
}

/**
 * Alttan açılan panel — ekrandan çıkmadan açılan ayarlar gibi içerikler için.
 * Profil ekranındaki ikon seçiciyle aynı kalıp: yarı saydam örtü, yuvarlak üst
 * köşeler. Örtüye dokunmak ya da geri tuşu paneli kapatır.
 */
export function BottomSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const t = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <SheetOverlay visible={visible} onClose={onClose} sheetStyle={{ maxHeight: '88%' }}>
      <View
        className={`flex-row items-center px-5 pt-5 pb-3 border-b ${
          t.isLight ? 'border-slate-200' : 'border-[#2e2e33]'
        }`}
      >
        <View className="flex-1 pr-3">
          <Text className={`text-[17px] font-bold ${t.title}`} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
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
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
        showsVerticalScrollIndicator
      >
        {children}
      </ScrollView>
    </SheetOverlay>
  );
}

export function Card({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}) {
  const t = useThemeTokens();
  return (
    <View
      className={`rounded-2xl border p-4 ${t.cardBg} ${t.cardBorder} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  const t = useThemeTokens();
  return (
    <View className="mt-7 mb-2.5">
      <Text
        className={`text-[10px] font-semibold uppercase ${t.muted}`}
        style={{ letterSpacing: 1.4 }}
      >
        {children}
      </Text>
      {hint ? <Text className={`text-[11px] leading-4 mt-1.5 ${t.muted}`}>{hint}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = 'blue',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'blue' | 'violet' | 'emerald' | 'slate';
}) {
  const { isLight } = useAppTheme();
  const bg = {
    blue: isLight ? 'bg-blue-600' : 'bg-blue-500',
    violet: isLight ? 'bg-violet-600' : 'bg-violet-500',
    emerald: isLight ? 'bg-emerald-600' : 'bg-emerald-500',
    slate: isLight ? 'bg-slate-800' : 'bg-slate-700',
  }[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`rounded-2xl py-4 items-center justify-center ${bg} ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className="text-white font-bold text-[14px]">{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`rounded-2xl py-4 items-center justify-center border ${t.cardBorder} ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={`font-bold text-[14px] ${t.body}`}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  tone = 'blue',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'blue' | 'violet' | 'emerald';
}) {
  const { isLight } = useAppTheme();
  const selectedClasses = {
    blue: isLight ? 'bg-blue-600 border-blue-600' : 'bg-blue-500 border-blue-500',
    violet: isLight ? 'bg-violet-600 border-violet-600' : 'bg-violet-500 border-violet-500',
    emerald: isLight ? 'bg-emerald-600 border-emerald-600' : 'bg-emerald-500 border-emerald-500',
  }[tone];
  const idleClasses = isLight
    ? 'bg-white border-slate-200'
    : 'bg-slate-900 border-slate-800';

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      // Seçilebilir çipler ekran okuyucuda düğme + seçili durumu olarak okunur.
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? label : undefined}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      className={`px-3 py-2 rounded-full border mr-2 mb-2 ${selected ? selectedClasses : idleClasses}`}
    >
      <Text
        className={`text-[11px] font-bold ${
          selected ? 'text-white' : isLight ? 'text-slate-600' : 'text-slate-300'
        }`}
      >
        {label}
      </Text>
    </Wrapper>
  );
}

export function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'violet' | 'emerald' }) {
  const { isLight } = useAppTheme();
  const fill = {
    blue: isLight ? 'bg-blue-600' : 'bg-blue-500',
    violet: isLight ? 'bg-violet-600' : 'bg-violet-500',
    emerald: isLight ? 'bg-emerald-600' : 'bg-emerald-500',
  }[tone];
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
      <View className={`h-full rounded-full ${fill}`} style={{ width: `${clamped * 100}%` }} />
    </View>
  );
}

/** Ayar satırı: sol tarafta başlık/açıklama, sağ tarafta kontrol. */
export function SettingRow({
  title,
  description,
  right,
  disabled,
  style,
}: {
  title: string;
  description?: string;
  right: React.ReactNode;
  disabled?: boolean;
  /** Satırın çevresindeki boşluğu çağrı yerinden ayarlamak için. */
  style?: ViewStyle;
}) {
  const t = useThemeTokens();
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${disabled ? 'opacity-40' : ''}`}
      style={style}
    >
      <View className="flex-1 pr-4">
        <Text className={`text-[13px] font-bold ${t.title}`}>{title}</Text>
        {description ? (
          <Text className={`text-[11px] mt-0.5 leading-4 ${t.muted}`}>{description}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/**
 * Saat seçici. Yeni bir native bağımlılık (datetimepicker) eklememek için
 * artır/azalt düğmeleriyle çalışan basit bir kontrol.
 */
export function TimeStepper({
  hour,
  minute,
  onChange,
  disabled,
}: {
  hour: number;
  minute: number;
  onChange: (next: { hour: number; minute: number }) => void;
  disabled?: boolean;
}) {
  const t = useThemeTokens();
  const step = (deltaHour: number, deltaMinute: number) => {
    if (disabled) return;
    const total = (hour * 60 + minute + deltaHour * 60 + deltaMinute + 1440) % 1440;
    onChange({ hour: Math.floor(total / 60), minute: total % 60 });
  };

  const Btn = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      className={`w-7 h-7 rounded-lg items-center justify-center border ${t.cardBorder}`}
    >
      <Text className={`text-[12px] font-bold ${t.body}`}>{label}</Text>
    </Pressable>
  );

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View className={`flex-row items-center ${disabled ? 'opacity-40' : ''}`}>
      <View className="items-center mr-1.5">
        <Btn label="+" onPress={() => step(1, 0)} />
        <Text className={`text-[15px] font-bold my-1 ${t.title}`}>{pad(hour)}</Text>
        <Btn label="−" onPress={() => step(-1, 0)} />
      </View>
      <Text className={`text-[15px] font-bold ${t.muted}`}>:</Text>
      <View className="items-center ml-1.5">
        <Btn label="+" onPress={() => step(0, 5)} />
        <Text className={`text-[15px] font-bold my-1 ${t.title}`}>{pad(minute)}</Text>
        <Btn label="−" onPress={() => step(0, -5)} />
      </View>
    </View>
  );
}
