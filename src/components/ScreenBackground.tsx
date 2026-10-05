import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '../utils/ThemeContext';

// Ekran zeminleri.
//
// Degrade tek bir kök katman yerine her ekranın kendi içinde çiziliyor.
// Sebebi: yığın (stack) ekranları saydam olduğunda yeni sayfa açılırken altta
// kalan sayfa görünüyor ve geçişte titreme oluşuyordu. Her ekran kendi opak
// zeminini taşıdığında bu kayboluyor.

/**
 * Sekme adlarıyla birebir aynı olmalı — `App.tsx` aktif rota adını doğrudan bu
 * tipe cast ediyor. Biri değişip diğeri değişmezse degrade sessizce
 * varsayılana düşer, hata vermez.
 */
export type BackgroundVariant = 'Mülakat' | 'Kriz' | 'Atölye' | 'Kariyer' | 'Karne';

type Palette = [string, string, ...string[]];

/**
 * Sekmeye göre degrade renkleri.
 *
 * Yön: yukarıdan aşağı doğru koyulaşıyor — beyazdan başlayıp sekmenin rengine
 * iniyor. Renkler kasıtlı olarak soluk tutuldu: eskiden alt uç (blue-200,
 * purple-200, green-200) içeriğin en yoğun olduğu yerde fazla baskındı ve
 * kartlar renkli zeminde yüzüyordu. Aynı yön, daha az doygunluk.
 */
export function backgroundColors(variant: BackgroundVariant, isLight: boolean): Palette {
  switch (variant) {
    case 'Kriz':
      return isLight ? ['#ffffff', '#fff7f8', '#fbe3e7'] : ['#121214', '#151517', '#231619'];
    case 'Atölye':
      return isLight ? ['#ffffff', '#f6fdf9', '#d9f2e3'] : ['#121214', '#151517', '#141d1a'];
    case 'Kariyer':
      return isLight ? ['#ffffff', '#fffbf4', '#fcefd8'] : ['#121214', '#151517', '#211c14'];
    case 'Karne':
      return isLight ? ['#ffffff', '#fbf8ff', '#ece2fa'] : ['#121214', '#151517', '#1c1826'];
    // Mülakat markanın rengini taşıyor: lacivert-mavi, açıkta beyazdan iniyor.
    case 'Mülakat':
    default:
      return isLight ? ['#ffffff', '#f6faff', '#dfeafc'] : ['#121214', '#151517', '#171b28'];
  }
}

/** Degradenin en üst rengi — ilk kare boyanana kadar kullanılan taban. */
export function backgroundBase(isLight: boolean): string {
  return isLight ? '#ffffff' : '#121214';
}

const VariantContext = React.createContext<BackgroundVariant>('Mülakat');

/** Aktif sekmenin zemin rengini, üstüne açılan tüm ekranlara taşır. */
export function BackgroundVariantProvider({
  variant,
  children,
}: {
  variant: BackgroundVariant;
  children: React.ReactNode;
}) {
  return <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>;
}

export function useBackgroundVariant(): BackgroundVariant {
  return React.useContext(VariantContext);
}

/** Ekranın opak degrade zemini; ekran kabuğunun en altında durur. */
export function ScreenBackground({ variant }: { variant?: BackgroundVariant }) {
  const { isLight } = useAppTheme();
  const active = useBackgroundVariant();

  return (
    <LinearGradient
      colors={backgroundColors(variant ?? active, isLight)}
      locations={[0, 0.4, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}
