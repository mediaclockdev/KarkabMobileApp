export const LANGUAGES = {
  en: { label: "English", rtl: false },
  ar: { label: "Arabic", rtl: true },
 
} as const;

export type AppLanguage = keyof typeof LANGUAGES;