"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { useAppShell } from "@/components/app/AppShellProvider";
import en from "@/lib/i18n/dictionaries/en";
import zh from "@/lib/i18n/dictionaries/zh";
import { LocaleValue } from "@/lib/i18n/config";

const dictionaries = { zh, en } as const;

type I18nContextValue = {
  language: LocaleValue;
  canChangeLanguage: boolean;
  setLanguage: (language: LocaleValue) => void;
  t: (key: keyof typeof zh | keyof typeof en, replacements?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyReplacements(value: string, replacements?: Record<string, string | number>) {
  if (!replacements) {
    return value;
  }

  return Object.entries(replacements).reduce((current, [key, replacement]) => {
    return current.replace(new RegExp(`\\{${key}\\}`, "g"), String(replacement));
  }, value);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language, canChangeLanguage, setLanguage } = useAppShell();

  const value = useMemo<I18nContextValue>(() => ({
    language,
    canChangeLanguage,
    setLanguage,
    t: (key, replacements) => {
      const dictionary = dictionaries[language] ?? dictionaries.zh;
      const fallback = dictionaries.zh[key as keyof typeof zh] ?? String(key);
      const translated = dictionary[key as keyof typeof dictionary] ?? fallback;
      return applyReplacements(String(translated), replacements);
    }
  }), [canChangeLanguage, language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
