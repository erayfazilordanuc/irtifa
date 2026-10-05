import React from 'react';
import { useColorScheme } from 'react-native';
import { readJson, writeJson } from './storage';

/**
 * Uygulama teması. `mode` kullanıcının tercihi ('system' | 'light' | 'dark'),
 * `isLight` ise ekranların kullandığı türetilmiş değerdir — tüm tema ayrımı
 * NativeWind sınıflarında bu bayrak üzerinden yapılır.
 *
 * Tercih diske yazılır; Ayarlar → Tema Tercihi bölümünden değiştirilir.
 */

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isLight: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'theme-mode';

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = React.useState<ThemeMode>(() =>
    readJson<ThemeMode>(STORAGE_KEY, 'system'),
  );

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
    writeJson(STORAGE_KEY, next);
  }, []);

  const isLight = mode === 'system' ? systemScheme !== 'dark' : mode === 'light';

  const toggleTheme = React.useCallback(() => {
    setMode(isLight ? 'dark' : 'light');
  }, [isLight, setMode]);

  const value = React.useMemo(
    () => ({ mode, isLight, setMode, toggleTheme }),
    [mode, isLight, setMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme, <ThemeProvider> içinde kullanılmalı.');
  }
  return ctx;
}
