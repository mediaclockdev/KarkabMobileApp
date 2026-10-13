import { Alert, I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';

import i18n from './i18n';
import { storage } from '../share/storage/mmkv';
import {
  AppLanguage,
  LANGUAGE_STORAGE_KEY,
  isRTLLanguage,
} from './supportLang';   // match the actual filename casing

/** i18next may report 'en-US'; we only care about the base code. */
const currentLanguage = (): string => i18n.language?.split('-')[0] ?? '';

const needsDirectionChange = (lang: AppLanguage): boolean =>
  I18nManager.isRTL !== isRTLLanguage(lang);

export const changeLanguage = async (lang: AppLanguage): Promise<void> => {
  if (lang === currentLanguage()) return;

  storage.set(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);

  // if (!needsDirectionChange(lang)) return;

  try {
    I18nManager.allowRTL(true);              // always true — forceRTL is the switch
    I18nManager.forceRTL(isRTLLanguage(lang));
    RNRestart.restart();
  } catch (error) {
    if (__DEV__) console.warn('[changeLanguage] restart failed', error);
    Alert.alert(
      i18n.t('language.switchTitle'),
      i18n.t('language.restartManually'),
    );
  }
};

export const changeLanguageWithPrompt = (lang: AppLanguage): void => {
  if (lang === currentLanguage()) return;

  if (!needsDirectionChange(lang)) {
    void changeLanguage(lang);
    return;
  }

  Alert.alert(
    i18n.t('language.switchTitle'),
    i18n.t('language.switchMessage'),
    [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      { text: i18n.t('language.switchConfirm'), onPress: () => void changeLanguage(lang) },
    ],
  );
};