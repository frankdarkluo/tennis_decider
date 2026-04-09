"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { resolveAppEnvironment } from "@/lib/environment";
import { readActiveStudySession } from "@/lib/study/session";
import { StudyLanguage, StudySession } from "@/types/study";
import { AppEnvironment } from "@/types/environment";

const APP_LANGUAGE_KEY = "tennislevel.app_language";

type AppShellContextValue = {
  language: StudyLanguage;
  studyMode: boolean;
  environment: AppEnvironment;
  activeSession: StudySession | null;
  loading: boolean;
  canChangeLanguage: boolean;
  setLanguage: (language: StudyLanguage) => void;
  syncStudySession: (session: StudySession | null) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredLanguage(): StudyLanguage {
  if (!isBrowser()) {
    return "zh";
  }

  const stored = window.localStorage.getItem(APP_LANGUAGE_KEY);
  return stored === "en" ? "en" : "zh";
}

function writeStoredLanguage(language: StudyLanguage) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(APP_LANGUAGE_KEY, language);
}

function normalizeStudySession(session: StudySession | null): StudySession | null {
  if (!session || session.endedAt) {
    return null;
  }

  return session;
}

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [appLanguage, setAppLanguage] = useState<StudyLanguage>("zh");
  const [activeStudySession, setActiveStudySession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAppLanguage(readStoredLanguage());
    const nextSession = normalizeStudySession(readActiveStudySession());
    setActiveStudySession(nextSession);
    if (nextSession) {
      writeStoredLanguage(nextSession.language);
    }
    setLoading(false);
  }, []);

  const language = activeStudySession?.language ?? appLanguage;
  const studyMode = Boolean(activeStudySession);
  const canChangeLanguage = !activeStudySession;
  const environment = resolveAppEnvironment({
    studyMode,
    hasSession: studyMode
  });

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  const value = useMemo<AppShellContextValue>(() => ({
    language,
    studyMode,
    environment,
    activeSession: activeStudySession,
    loading,
    canChangeLanguage,
    setLanguage: (nextLanguage) => {
      if (activeStudySession) {
        return;
      }

      setAppLanguage(nextLanguage);
      writeStoredLanguage(nextLanguage);
    },
    syncStudySession: (session) => {
      const normalizedSession = session && !session.endedAt ? session : null;
      setActiveStudySession(normalizedSession);

      if (normalizedSession) {
        writeStoredLanguage(normalizedSession.language);
      }
    }
  }), [activeStudySession, canChangeLanguage, environment, language, loading, studyMode]);

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }

  return context;
}
