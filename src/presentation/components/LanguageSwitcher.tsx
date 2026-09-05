import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/application/stores/settingsStore";
import { SUPPORTED_LANGUAGES } from "@/infrastructure/i18n";
import { Select } from "./fields";

const LANGUAGE_LABELS: Record<string, string> = {
  it: "Italiano",
  en: "English",
};

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <Select
      aria-label={t("nav.language")}
      value={language}
      onChange={(e) => setLanguage(e.target.value as (typeof SUPPORTED_LANGUAGES)[number])}
      className="w-auto"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {LANGUAGE_LABELS[lang]}
        </option>
      ))}
    </Select>
  );
}
