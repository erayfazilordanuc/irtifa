import React from 'react';

import { useAppTheme } from '../utils/ThemeContext';

// Tüm ekranların paylaştığı tema sınıfları.
// Açık/koyu ayrımı uygulamanın her yerinde bu kanca üzerinden yapılır.
//
// Koyu tema NÖTR: açık tema beyaz + gri tonlarıyla kuruluyorsa koyu tema da
// siyah + gri tonlarıyla kurulur. Eskiden yüzeyler lacivert tonlarındaydı
// (#11182e, #1d2946) ve uygulama koyu temada mavi görünüyordu. Renk yalnızca
// vurgu (mavi/mor/yeşil) ve sekme zemininde var; yüzeylerde yok.
//
// Not: bir sınıf koyu temada kenarlık ekliyorsa açık temada da (şeffaf olarak)
// eklemeli — yoksa tema değişince eleman 2px büyüyüp sayfa kayıyor.

/**
 * Marka renkleri — İrtifa'nın kimliği (YAPILACAKLAR_İRTİFA Bölüm 0 ve 5).
 *
 * Lacivert zemin + zümrüt vurgu: kurumsal ve ciddi, ama **sektörsüz**. Terakki'den
 * devralınan yeşil degrade yerine geldi; "taktiksel" çerçeve ve askerî
 * göndermeler arayüzden çıkarıldı — yazılım sektörüne hazırlanan kullanıcı da
 * aynı ekranı kendine ait görmeli.
 *
 * Tek kaynak burası. Uygulama ikonu ve açılış ekranı da aynı değerleri taşıyor:
 * `assets/brand/ikon/irtifa-icon-master.svg` (degrade) ve `SplashOverlay.tsx`.
 * Biri değişirse ötekiler de değişmeli.
 */
export const BRAND = {
  /** İkon ve açılış zemini — gece laciverdi. */
  navy: '#0F172A',
  navyLight: '#1E2B45',
  navyDark: '#0A101F',
  /** Vurgu — yükselişi anlatan zümrüt (ikondaki ok ucu). */
  emerald: '#10B981',
} as const;

export function useThemeTokens() {
  const { isLight } = useAppTheme();
  return React.useMemo(
    () => ({
      isLight,
      //                açık                koyu (nötr karşılığı)
      screenBg: isLight ? 'bg-slate-50' : 'bg-[#121214]',
      cardBg: isLight ? 'bg-white' : 'bg-[#1c1c1f]',
      cardBorder: isLight ? 'border-slate-200' : 'border-[#2e2e33]',
      title: isLight ? 'text-slate-900' : 'text-white',
      body: isLight ? 'text-slate-700' : 'text-zinc-300',
      muted: isLight ? 'text-slate-500' : 'text-zinc-400',
      accent: isLight ? 'text-blue-600' : 'text-blue-400',
      accentBg: isLight ? 'bg-blue-600' : 'bg-blue-500',
      dividerColor: isLight ? 'border-slate-200' : 'border-[#2e2e33]',
      iconColor: isLight ? '#334155' : '#a1a1aa',
      // `cardBg`'nin ham karşılığı. Sınıf veremediğimiz yerler için:
      // animasyonlu bileşenlerde (`Animated.View`) className kullanılmıyor,
      // çünkü projede `react-native-css-interop` yamalı.
      surfaceColor: isLight ? '#ffffff' : '#1c1c1f',
    }),
    [isLight],
  );
}
