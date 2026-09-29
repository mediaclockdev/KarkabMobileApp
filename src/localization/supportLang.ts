/**
 * SINGLE SOURCE OF TRUTH for supported languages.
 * Both i18n.ts and changeLanguage.ts import from here — do not redeclare
 * the language list anywhere else.
 */

export const LANGUAGES = {
  ar: { code: 'ar', label: 'العربية', rtl: true },
  en: { code: 'en', label: 'English', rtl: false },
} as const;

export type AppLanguage = keyof typeof LANGUAGES;

/** Karkab is Arabic-first: Arabic is the default and the fallback. */
export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export const LANGUAGE_STORAGE_KEY = 'app_language';

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export const isSupportedLanguage = (code?: string | null): code is AppLanguage =>
  !!code && code in LANGUAGES;

export const isRTLLanguage = (code: AppLanguage): boolean => LANGUAGES[code].rtl;