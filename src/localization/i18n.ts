import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { storage } from "../share/storage/mmkv";

// EN
import entext from "./English/language.json";


// AR

import artext from "./Arabic/language.json";


const resources = {
  en: {
    en: entext,
    
  },
  ar: {
    ar: artext,
    
  },
 
};

const language =
  storage.getString("app_language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: language,
    fallbackLng: "en",
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });


  

export default i18n;