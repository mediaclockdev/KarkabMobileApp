import i18n from "./i18n";
import { storage } from "../share/storage/mmkv";
import { I18nManager } from "react-native";
import RNRestart from "react-native-restart";
import { LANGUAGES, AppLanguage } from "../share/utils/supportLang";

export const changeLanguage = (lang: AppLanguage) => {
  console.log("language", lang);

  // save selected language
  storage.set("app_language", lang);

  const isRTL = LANGUAGES[lang].rtl;

  // restart app if layout direction changes
//   if (I18nManager.isRTL !== isRTL) {
//     I18nManager.allowRTL(isRTL);
//     I18nManager.forceRTL(isRTL);

//     RNRestart.restart();
//     return;
//   }

  // otherwise update language instantly
  i18n.changeLanguage(lang);
};