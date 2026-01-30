import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorScheme } from '../theme';
import type { Locale } from '../i18n';
import { getStoredLocale, setStoredLocale } from '../i18n';
import i18n from '../i18n';

export type { Locale } from '../i18n';

const THEME_KEY = '@airwave/theme';

export interface SettingsState {
  colorScheme: ColorScheme;
  locale: Locale;
  setColorScheme: (scheme: ColorScheme) => void;
  setLocale: (locale: Locale) => void;
  loadTheme: () => Promise<void>;
  loadLocale: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  colorScheme: 'dark',
  locale: 'en',
  setColorScheme: (colorScheme) => {
    set({ colorScheme });
    AsyncStorage.setItem(THEME_KEY, colorScheme);
  },
  setLocale: (locale) => {
    set({ locale });
    setStoredLocale(locale);
    i18n.changeLanguage(locale);
  },
  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        set({ colorScheme: stored });
      }
    } catch {
      // keep default
    }
  },
  loadLocale: async () => {
    try {
      const stored = await getStoredLocale();
      if (stored) {
        set({ locale: stored });
        i18n.changeLanguage(stored);
      }
    } catch {
      // keep default
    }
  },
}));
