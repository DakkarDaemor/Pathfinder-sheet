import { create } from "zustand";
import i18n, { persistLanguage, type SupportedLanguage } from "@/infrastructure/i18n";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "pathfinder-sheet.theme";

function detectInitialTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyThemeToDocument(theme: ThemeMode): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface SettingsState {
  theme: ThemeMode;
  language: SupportedLanguage;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: SupportedLanguage) => void;
}

const initialTheme = detectInitialTheme();
if (typeof document !== "undefined") applyThemeToDocument(initialTheme);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: initialTheme,
  language: i18n.language === "it" ? "it" : "en",

  setTheme(theme) {
    applyThemeToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    set({ theme });
  },

  toggleTheme() {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },

  setLanguage(language) {
    void i18n.changeLanguage(language);
    persistLanguage(language);
    set({ language });
  },
}));
