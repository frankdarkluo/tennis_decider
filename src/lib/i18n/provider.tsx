"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { useStudy } from "@/components/study/StudyProvider";
import en from "@/lib/i18n/dictionaries/en";
import zh from "@/lib/i18n/dictionaries/zh";
import { I18nKey } from "@/lib/i18n/config";
import { StudyLanguage } from "@/types/study";

const dictionaries = { zh, en } as const;

type I18nContextValue = {
  language: StudyLanguage;
  studyMode: boolean;
  canChangeLanguage: boolean;
  setLanguage: (language: StudyLanguage) => void;
  t: (key: I18nKey, replacements?: Record<string, string | number>) => string;
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
  const { language, studyMode, canChangeLanguage, setLanguage } = useStudy();

  const value = useMemo<I18nContextValue>(() => ({
    language,
    studyMode,
    canChangeLanguage,
    setLanguage,
    t: (key, replacements) => {
      const dictionary = dictionaries[language] ?? dictionaries.zh;
      const fallback = dictionaries.zh[key as keyof typeof zh] ?? String(key);
      const translated = dictionary[key as keyof typeof dictionary] ?? fallback;
      return applyReplacements(String(translated), replacements);
    }
  }), [canChangeLanguage, language, setLanguage, studyMode]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
