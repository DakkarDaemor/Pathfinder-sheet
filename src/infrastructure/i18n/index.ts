import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonIt from "./locales/it/common.json";
import commonEn from "./locales/en/common.json";
import srdIt from "./locales/it/srd.json";
import srdEn from "./locales/en/srd.json";

export const SUPPORTED_LANGUAGES = ["it", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = "pathfinder-sheet.language";

function detectInitialLanguage(): SupportedLanguage {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "it" || stored === "en") return stored;
  } catch {
    // ignore
  }
  const browserLang = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en";
  return browserLang === "it" ? "it" : "en";
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { common: commonIt, srd: srdIt },
      en: { common: commonEn, srd: srdEn },
    },
    lng: detectInitialLanguage(),
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "srd"],
    interpolation: { escapeValue: false },
  });

export function persistLanguage(language: SupportedLanguage): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // ignore
  }
}

export default i18n;
