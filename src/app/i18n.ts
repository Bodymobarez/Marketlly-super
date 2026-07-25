import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const saved =
  typeof localStorage !== "undefined" ? localStorage.getItem("i18nextLng") : null;
const initialLng = saved?.startsWith("ar") ? "ar" : saved?.startsWith("en") ? "en" : "ar";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initialLng,
    fallbackLng: "en",
    supportedLngs: ["ar", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

function applyHtmlDir(lng: string) {
  const isAr = lng.startsWith("ar");
  document.documentElement.lang = isAr ? "ar" : "en";
  document.documentElement.dir = isAr ? "rtl" : "ltr";
}

applyHtmlDir(i18n.language || initialLng);
i18n.on("languageChanged", applyHtmlDir);

export default i18n;
