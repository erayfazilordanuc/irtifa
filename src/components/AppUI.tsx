import React from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react-native';

import { useThemeTokens } from './themeTokens';
import { tabBarContentPadding } from './tabBar';
import { trUpper } from '../utils/text';
export { useThemeTokens };

// Mülakat / egzersiz / profil ekranlarının paylaştığı arayüz parçaları.
// Tema ayrımı, projenin geri kalanı gibi NativeWind sınıflarıyla isLight üzerinden yapılıyor.
//
// Ortak ölçüler: tüm ekranlar SCREEN_PADDING yan boşluğunu kullanır ve
// kenarlıklar her iki temada da vardır (açıkta şeffaf) — tema değişince
// eleman yükseklikleri sabit kalsın, sayfa kaymasın.

/** Tüm ekranların yan boşluğu. */
export const SCREEN_PADDING = 20;

/** Başlıkların cihazın en üstüne yapışmaması için güvenli alana eklenen pay. */
export const SCREEN_TOP_GAP = 8;

export type Tone = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';

/** Bir tonun ikon/vurgu rengi. */
export function toneColor(tone: Tone, isLight: boolean): string {
  const map: Record<Tone, [string, string]> = {
    blue: ['#2563eb', '#60a5fa'],
    violet: ['#7c3aed', '#a78bfa'],
    emerald: ['#059669', '#34d399'],
    amber: ['#d97706', '#fbbf24'],
    rose: ['#e11d48', '#fb7185'],
    slate: ['#475569', '#94a3b8'],
  };
  return isLight ? map[tone][0] : map[tone][1];
}

/** Bir tonun dolu arka planı (düğmeler, seçili çipler). */
export function toneFill(tone: Tone, isLight: boolean): string {
  const map: Record<Tone, [string, string]> = {
    blue: ['bg-blue-600', 'bg-blue-500'],
    violet: ['bg-violet-600', 'bg-violet-500'],
    emerald: ['bg-emerald-600', 'bg-emerald-500'],
    amber: ['bg-amber-500', 'bg-amber-500'],
    rose: ['bg-rose-600', 'bg-rose-500'],
    slate: ['bg-slate-800', 'bg-slate-700'],
  };
  return isLight ? map[tone][0] : map[tone][1];
}

/** Bir tonun soft (açık) arka planı — ikon kutuları ve rozetler için. */
export function toneSoft(tone: Tone, isLight: boolean): string {
  const map: Record<Tone, [string, string]> = {
    blue: ['bg-blue-50', 'bg-[#182642]'],
    violet: ['bg-violet-50', 'bg-[#271b40]'],
    emerald: ['bg-emerald-50', 'bg-[#0d2822]'],
    amber: ['bg-amber-50', 'bg-[#2e1d0d]'],
    rose: ['bg-rose-50', 'bg-[#33111e]'],
    slate: ['bg-slate-100', 'bg-[#2a2a2e]'],
  };
  return isLight ? map[tone][0] : map[tone][1];
}

/** Bir tonun metin rengi. */
export function toneText(tone: Tone, isLight: boolean): string {
  const map: Record<Tone, [string, string]> = {
    blue: ['text-blue-600', 'text-blue-400'],
    violet: ['text-violet-600', 'text-purple-400'],
    emerald: ['text-emerald-600', 'text-emerald-400'],
    amber: ['text-amber-600', 'text-amber-400'],
    rose: ['text-rose-600', 'text-rose-400'],
    slate: ['text-slate-600', 'text-slate-300'],
  };
  return isLight ? map[tone][0] : map[tone][1];
}

/** Yuvarlak ikon düğmesi — geri, kapat, ayarlar, yenile. */
export function RoundButton({
  icon,
  onPress,
  label,
}: {
  icon: React.ReactNode;
  onPress?: () => void;
  label: string;
}) {
  const t = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`w-10 h-10 rounded-full items-center justify-center border ${
        t.isLight ? 'bg-slate-100 border-transparent' : 'bg-[#2a2a2e] border-[#37373d]'
      }`}
    >
      {icon}
    </Pressable>
  );
}

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: 'back' | 'close';
  right?: React.ReactNode;
  /** Geçmiş ekranlarındaki gibi başlığı ortalar. */
  align?: 'left' | 'center';
};

export function AppHeader({
  title,
  subtitle,
  onBack,
  backIcon = 'back',
  right,
  align = 'left',
}: AppHeaderProps) {
  const t = useThemeTokens();
  const Icon = backIcon === 'close' ? X : ChevronLeft;

  return (
    <View className="flex-row items-center px-5 pt-2 pb-3">
      {onBack ? (
        <RoundButton
          icon={<Icon size={20} color={t.iconColor} />}
          onPress={onBack}
          label={backIcon === 'close' ? 'Kapat' : 'Geri'}
        />
      ) : null}

      <View className={`flex-1 ${align === 'center' ? 'items-center' : onBack ? 'ml-3' : ''}`}>
        {title ? (
          <Text className={`text-[16px] font-bold ${t.title}`} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className={`text-[11px] mt-0.5 ${t.muted}`} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Başlık ortalıyken sağ tarafı geri düğmesi kadar dengeliyoruz. */}
      {right ?? (align === 'center' && onBack ? <View className="w-10" /> : null)}
    </View>
  );
}

/**
 * Sekme köklerinin (Mülakat / Egzersizler / Profil) ortak başlığı:
 * arka planı olmayan ikon + büyük başlık, altında açıklama satırı.
 */
export function TabHeader({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const t = useThemeTokens();
  return (
    <View className="px-5 pt-2 pb-3">
      <View className="flex-row items-center">
        {icon}
        <Text
          className={`text-[22px] font-semibold ml-2.5 flex-1 ${t.title}`}
          style={{ letterSpacing: -0.4 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {right}
      </View>
      {subtitle ? (
        <Text className={`text-[13px] leading-5 mt-3 ${t.muted}`}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

/** Kaydırılabilir ekran gövdesi; alt sekme çubuğunun altında kalmaması için ek boşluk bırakır. */
export function AppScreen({
  children,
  header,
  footer,
  /** Alt sekme çubuğu olan ekranlarda true. */
  tabBar = false,
  /** Gövdenin yan boşluğu; başlıkla hizalamak için ekran bazında değiştirilebilir. */
  padding = SCREEN_PADDING,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  tabBar?: boolean;
  padding?: number;
}) {
  const t = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1" style={{ paddingTop: insets.top + SCREEN_TOP_GAP }}>
      {header}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: padding,
          // Sekme çubuğu olan ekranlarda boşluk çubuğun gerçek ölçülerinden
          // hesaplanıyor (yükseklik + alt boşluk + güvenli alan + nefes payı);
          // eskiden sabit 124'tü ve jest çubuğu olan cihazlarda son kart
          // çubuğun altında kalıyordu. Ölçüler: `src/components/tabBar.ts`.
          paddingBottom: tabBar
            ? tabBarContentPadding(insets.bottom)
            : Math.max(insets.bottom, 16) + 16,
        }}
        // Kaydırma çubuğu açık: "aşağıda devamı var"ı anlatan platform standardı
        // işaret bu. Kapalıyken uzun sekmelerde (ör. İlerleme) kullanıcı sayfanın
        // devam ettiğini hiçbir şeyden anlamıyordu.
        showsVerticalScrollIndicator
      >
        {children}
      </ScrollView>
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

/** "GELİŞTİRİCİ SEÇENEKLERİ" gibi küçük, büyük harfli bölüm başlığı. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  const t = useThemeTokens();
  return (
    <Text
      className={`text-[10px] font-semibold uppercase mt-7 mb-2.5 ${t.muted}`}
      style={{ letterSpacing: 1.4 }}
    >
      {children}
    </Text>
  );
}

export function Surface({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}) {
  const t = useThemeTokens();
  // Kenarlık ve gölge birlikte kullanılmıyor: ayırıcı olarak tek bir 1px kenarlık
  // yeterli, gölge eklemek kartları zeminden koparıp ekranı ağırlaştırıyor.
  return (
    <View
      className={`rounded-2xl border p-4 ${t.cardBg} ${t.cardBorder} ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}

// ——— Açma/kapama anahtarı ———
// Platformun yerel Switch'i yerine kendi anahtarımız: uygulamanın renk paleti,
// köşe yarıçapı ve geçiş süreleriyle uyumlu, iki temada da aynı görünüyor.
//
// Ölçüler kenarlığı da hesaba katıyor. Eskiden katmıyordu: tutamak 2px büyük
// çıkıyor, solda 4px sağda 2px boşluk kalıyor ve dikeyde izden taşıyordu.
const TOGGLE_WIDTH = 46;
const TOGGLE_HEIGHT = 28;
const TOGGLE_BORDER = 1;
/** Tutamak ile izin iç kenarı arası — dört yönde de aynı. */
const TOGGLE_GAP = 3;
const TOGGLE_THUMB = TOGGLE_HEIGHT - 2 * (TOGGLE_BORDER + TOGGLE_GAP);
const TOGGLE_TRAVEL = TOGGLE_WIDTH - TOGGLE_THUMB - 2 * (TOGGLE_BORDER + TOGGLE_GAP);
/** Basılıyken tutamağın yatayda uzama oranı. */
const TOGGLE_STRETCH = 0.2;
const TOGGLE_EASING = Easing.out(Easing.cubic);

export function Toggle({
  value,
  onValueChange,
  disabled,
  /** Varsayılan yeşil, uygulamadaki "aktif" rengiyle aynı (emerald). */
  tone = 'emerald',
  style,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  tone?: Tone;
  style?: ViewStyle;
}) {
  const t = useThemeTokens();

  const progress = useSharedValue(value ? 1 : 0);
  const pressed = useSharedValue(0);

  // Animasyonun React turunu beklememesi için son hedef ayrıca tutuluyor.
  //
  // Toggle tamamen kontrollü: `value` ancak üstteki store yazılıp ağaç yeniden
  // render edildikten sonra değişiyor. Bildirim anahtarında araya bir de
  // `await requestNotificationPermission()` giriyor. Animasyon yalnızca
  // `value`'ya bağlı kalsaydı tutamak bu sürenin tamamında donar, sonra
  // zıplardı — kullanıcının gördüğü takılma buydu.
  //
  // Çözüm: basışta hedefi hemen sür (worklet UI thread'de, JS meşgul olsa bile
  // akar), sonra gelen `value` ile hizala. Üst bileşen değişikliği reddederse
  // (izin verilmedi gibi) aşağıdaki etki tutamağı geri alıyor.
  const target = React.useRef(value);

  const animateTo = React.useCallback(
    (next: boolean) => {
      target.current = next;
      progress.value = withTiming(next ? 1 : 0, { duration: 190, easing: TOGGLE_EASING });
    },
    [progress],
  );

  // Bilerek bağımlılık dizisi yok: yalnızca `value` değiştiğinde çalışsaydı,
  // iyimser hareketin reddedildiği durumu (value hiç değişmez) yakalayamazdı.
  // Yaptığı iş bir ref karşılaştırması, maliyeti yok.
  React.useEffect(() => {
    if (target.current !== value) animateTo(value);
  });

  const onColor = toneColor(tone, t.isLight);
  const offColor = t.isLight ? '#e2e8f0' : '#2a2a2e';
  const offBorder = t.isLight ? '#cbd5e1' : '#33415580';

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [offColor, onColor]),
    borderColor: interpolateColor(progress.value, [0, 1], [offBorder, onColor]),
  }));

  // Basılıyken tutamak hafifçe uzar — dokunma geri bildirimi.
  //
  // Uzama `width` ile değil `scaleX` ile yapılıyor: width bir yerleşim özelliği,
  // her karede yeniden yerleşim hesaplatıyordu ve anahtar takılıyordu. Transform
  // yalnızca çizimi etkiler. Ölçek merkezden büyüdüğü için kaydırma, tutamağın
  // solda sol kenarı, sağda sağ kenarı sabit kalacak şekilde düzeltiliyor.
  const thumbStyle = useAnimatedStyle(() => {
    const scaleX = 1 + pressed.value * TOGGLE_STRETCH;
    const extra = TOGGLE_THUMB * (scaleX - 1);
    return {
      transform: [
        { translateX: progress.value * (TOGGLE_TRAVEL - extra) + extra / 2 },
        { scaleX },
      ],
    };
  });

  return (
    <Pressable
      onPress={() => {
        animateTo(!value);
        onValueChange(!value);
      }}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120, easing: TOGGLE_EASING });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 160, easing: TOGGLE_EASING });
      }}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={[{ opacity: disabled ? 0.4 : 1 }, style]}
    >
      <Animated.View
        style={[
          {
            width: TOGGLE_WIDTH,
            height: TOGGLE_HEIGHT,
            borderRadius: TOGGLE_HEIGHT / 2,
            borderWidth: TOGGLE_BORDER,
            justifyContent: 'center',
            alignItems: 'flex-start',
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              marginLeft: TOGGLE_GAP,
              width: TOGGLE_THUMB,
              height: TOGGLE_THUMB,
              borderRadius: TOGGLE_THUMB / 2,
              backgroundColor: '#ffffff',
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.28,
              shadowRadius: 2.5,
              elevation: 2,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export function Badge({ label, tone }: { label: string; tone: Tone }) {
  const t = useThemeTokens();
  return (
    <View className={`px-2.5 py-1 rounded-full ${toneSoft(tone, t.isLight)}`}>
      <Text className={`text-[11px] font-bold ${toneText(tone, t.isLight)}`}>{label}</Text>
    </View>
  );
}

/** İki durumlu / üç durumlu segment seçici. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = 'blue',
  labelSize = 12,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (next: T) => void;
  tone?: Tone;
  /** Etiket punto boyutu — daha ferah sekmeler için büyütülebilir. */
  labelSize?: number;
}) {
  const t = useThemeTokens();
  return (
    <View
      className={`flex-row rounded-2xl p-1 border ${
        t.isLight ? 'bg-slate-100 border-transparent' : 'bg-[#141417] border-[#2e2e33]'
      }`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`flex-1 flex-row items-center justify-center py-2.5 px-1.5 rounded-xl border ${
              selected
                ? t.isLight
                  ? 'bg-white border-white shadow-sm'
                  : 'bg-[#2a2a2e] border-[#3a3a41]'
                : 'border-transparent'
            }`}
          >
            {option.icon ? <View className="mr-1.5">{option.icon}</View> : null}
            {/* Seçili etiket iki temada da aynı tonu kullanır; renk yalnızca
                temanın açık/koyu tonuna göre değişir. */}
            {/* flexShrink olmadan satır içindeki metin kendi genişliğini alıp
                seçili zeminin dışına taşıyordu ("Günün Sanatı"). Sığmayan etiket
                önce küçülür, yine sığmazsa kısaltılır. */}
            <Text
              style={{ fontSize: labelSize, flexShrink: 1 }}
              className={`font-bold ${selected ? toneText(tone, t.isLight) : t.muted}`}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Profil ekranındaki sayı kutuları. */
export function StatTile({
  label,
  icon,
  value,
  unit,
  hint,
  tone = 'blue',
  compact = false,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: Tone;
  /**
   * Alçaltılmış kutu — tasarım aynı, ölçüler küçük. Karne sekmesi için
   * eklendi; varsayılan boyut değişmedi ki Egzersiz Geçmişi ve Egzersiz Detayı
   * ekranları etkilenmesin.
   */
  compact?: boolean;
}) {
  const t = useThemeTokens();
  return (
    <Surface className={`flex-1 ${compact ? 'p-3' : ''}`}>
      <View className={`flex-row items-center ${compact ? 'mb-1.5' : 'mb-2'}`}>
        {icon ? (
          <View
            className={`${compact ? 'w-6 h-6' : 'w-7 h-7'} rounded-lg items-center justify-center mr-2 ${toneSoft(tone, t.isLight)}`}
          >
            {icon}
          </View>
        ) : null}
        {/* Etiket `uppercase` sınıfıyla değil `trUpper` ile büyütülüyor: CSS
            büyütmesi Türkçede 'i'yi 'I' yapıyordu ("EGZERSIZ"). */}
        <Text className={`text-[10px] font-bold tracking-widest ${t.muted}`} numberOfLines={1}>
          {trUpper(label)}
        </Text>
      </View>
      <View className="flex-row items-baseline">
        <Text className={`${compact ? 'text-[18px]' : 'text-[21px]'} font-black ${t.title}`}>
          {value}
        </Text>
        {unit ? <Text className={`text-[11px] font-bold ml-1 ${t.muted}`}>{unit}</Text> : null}
      </View>
      {hint ? (
        <Text className={`text-[11px] ${compact ? 'mt-0.5' : 'mt-1'} ${t.muted}`}>{hint}</Text>
      ) : null}
    </Surface>
  );
}

/** Sağ tarafında ok bulunan tıklanabilir satır. */
export function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  tone = 'blue',
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  tone?: Tone;
}) {
  const t = useThemeTokens();
  // Kendi kartını taşır: dış Surface ile iç dolgu üst üste binmesin,
  // satırlar da aralarında gerçek bir boşlukla ayrılabilsin.
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center rounded-2xl p-4 ${t.cardBg}`}
    >
      {icon ? (
        <View
          className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${toneSoft(tone, t.isLight)}`}
        >
          {icon}
        </View>
      ) : null}
      <View className="flex-1 pr-2">
        <Text className={`text-[14px] font-bold ${t.title}`}>{title}</Text>
        {subtitle ? <Text className={`text-[11px] mt-0.5 ${t.muted}`}>{subtitle}</Text> : null}
      </View>
      <ChevronRight size={18} color={t.iconColor} />
    </Pressable>
  );
}

/** Egzersiz kartlarındaki "✓ kazanım" satırı. */
export function BenefitRow({ text, tone = 'emerald' }: { text: string; tone?: Tone }) {
  const t = useThemeTokens();
  return (
    <View className="flex-row items-center mt-2">
      <Check size={14} color={toneColor(tone, t.isLight)} />
      <Text className={`text-[11px] ml-2 flex-1 ${t.body}`}>{text}</Text>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  const t = useThemeTokens();
  return (
    <View className="items-center justify-center py-12 px-6">
      <Text className={`text-[12px] text-center ${t.muted}`}>{message}</Text>
    </View>
  );
}

/** Etiketli metin girişi (Ayarlar ve profil düzenleme). */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  keyboardType,
}: {
  label?: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'url' | 'email-address';
}) {
  const t = useThemeTokens();
  return (
    <View className="mb-3">
      {label ? (
        <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${t.muted}`}>
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.isLight ? '#94a3b8' : '#64748b'}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        className={`rounded-2xl px-4 py-3 text-[13px] border ${
          t.isLight ? 'bg-slate-100 text-slate-900 border-transparent' : 'bg-[#141417] text-white border-[#2e2e33]'
        }`}
      />
    </View>
  );
}

/** Ana eylem düğmesi — ikon alabilir. */
export function ActionButton({
  label,
  onPress,
  icon,
  tone = 'blue',
  disabled,
  variant = 'solid',
  labelSize = 14,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  tone?: Tone;
  disabled?: boolean;
  variant?: 'solid' | 'soft' | 'outline';
  /** Uzun etiketler (ör. "Bağlantıyı Test Et") için küçültülebilir. */
  labelSize?: number;
}) {
  const t = useThemeTokens();

  // Kenarlık her varyantta ve her temada var; yalnızca rengi değişiyor.
  const base = 'rounded-2xl py-4 px-4 flex-row items-center justify-center border';
  const classes =
    variant === 'solid'
      ? `${base} border-transparent ${toneFill(tone, t.isLight)}`
      : variant === 'soft'
        ? // Soft varyant tonun kendi zeminini kullanır; koyu tema da artık sabit
          // bir indigo yerine toneSoft'tan geliyor, yani ton ne ise o.
          `${base} ${toneSoft(tone, t.isLight)} border-transparent`
        : `${base} ${t.isLight ? t.cardBorder : 'bg-[#1c1c1f] border-[#3a3a41]'}`;

  const textClass =
    variant === 'solid'
      ? 'text-white'
      : variant === 'soft'
        ? t.isLight
          ? toneText(tone, true)
          : 'text-indigo-300'
        : t.isLight
          ? t.body
          : 'text-slate-200';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className={`${classes} ${disabled ? 'opacity-40' : ''}`}
    >
      {icon ? <View className="mr-2">{icon}</View> : null}
      <Text
        style={{ fontSize: labelSize }}
        className={`font-bold ${textClass}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
