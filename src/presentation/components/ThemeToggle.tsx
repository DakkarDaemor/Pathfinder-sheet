import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/application/stores/settingsStore";
import { Button } from "./Button";

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  return (
    <Button variant="ghost" onClick={toggleTheme} aria-label={t("nav.toggleTheme")} title={t("nav.toggleTheme")}>
      {theme === "dark" ? "🌙" : "☀️"}
    </Button>
  );
}
