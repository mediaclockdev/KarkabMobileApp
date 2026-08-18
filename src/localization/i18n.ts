import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, NativeModules, Platform } from 'react-native';

import { storage } from '../share/storage/mmkv';
import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  isRTLLanguage,
  isSupportedLanguage,
} from './supportLang';

import entext from './English/language.json';
import artext from './Arabic/language.json';

/** Reads the device language. Used only on first launch. */
const getDeviceLanguage = (): AppLanguage => {
  try {
    const locale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ??
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;

    return locale?.toLowerCase().startsWith('en') ? 'en' : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

/** Single source of truth for the active language. */
export const getStoredLanguage = (): AppLanguage => {
  const saved = storage.getString(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(saved)) return saved;

  const deviceLang = getDeviceLanguage();
  storage.set(LANGUAGE_STORAGE_KEY, deviceLang);
  return deviceLang;
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: Object.keys(LANGUAGES),
  resources: {
    en: { translation: entext },
    ar: { translation: artext },
  },
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

/**
 * Must run in index.js BEFORE the app renders.
 * Aligns native layout direction with the stored language.
 * Returns true if a restart is required.
 */
export const bootstrapLayoutDirection = (): boolean => {
  const shouldBeRTL = isRTLLanguage(getStoredLanguage());

  I18nManager.allowRTL(true);

  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    return true;
  }
  return false;
};

export default i18n;