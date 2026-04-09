"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { useAppShell } from "@/components/app/AppShellProvider";
import { clearLocalStudyData } from "@/lib/study/localData";
import { writeActiveStudySession } from "@/lib/study/session";
import { StudyLanguage, StudySession } from "@/types/study";
import { AppEnvironment } from "@/types/environment";

type StudyContextValue = {
  session: StudySession | null;
  studyMode: boolean;
  environment: AppEnvironment;
  language: StudyLanguage;
  canChangeLanguage: boolean;
  loading: boolean;
  setLanguage: (language: StudyLanguage) => void;
  clearStudyData: () => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const {
    language,
    studyMode,
    canChangeLanguage,
    setLanguage,
    environment,
    activeSession,
    loading,
    syncStudySession
  } = useAppShell();

  const value = useMemo<StudyContextValue>(() => ({
    session: activeSession,
    studyMode,
    environment,
    language,
    canChangeLanguage,
    loading,
    setLanguage,
    clearStudyData: () => {
      clearLocalStudyData();
      writeActiveStudySession(null);
      syncStudySession(null);
    }
  }), [activeSession, canChangeLanguage, environment, language, loading, setLanguage, studyMode]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within StudyProvider");
  }

  return context;
}
