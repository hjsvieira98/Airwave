import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCALE_KEY = '@airwave/locale';

export const supportedLocales = ['en', 'pt'] as const;
export type Locale = (typeof supportedLocales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
};

const en = require('./locales/en.json');
const pt = require('./locales/pt.json');

const resources = {
  en: { translation: en },
  pt: { translation: pt },
};

const deviceLocale = Localization.getLocales()[0]?.languageCode?.slice(0, 2) ?? 'en';
const defaultLocale: Locale = supportedLocales.includes(deviceLocale as Locale) ? (deviceLocale as Locale) : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLocale,
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

export async function getStoredLocale(): Promise<Locale | null> {
  try {
    const stored = await AsyncStorage.getItem(LOCALE_KEY);
    if (stored && supportedLocales.includes(stored as Locale)) return stored as Locale;
  } catch {
    // ignore
  }
  return null;
}

export async function setStoredLocale(locale: Locale): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // ignore
  }
}

export default i18n;
