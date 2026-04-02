"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { flushEventQueue, setEventLoggerStudySession } from "@/lib/eventLogger";
import { resolveAppEnvironment } from "@/lib/environment";
import { clearLocalStudyData, readPendingStudySetup, writePendingStudySetup } from "@/lib/study/localData";
import { persistStudySessionEnd, persistStudySessionStart } from "@/lib/study/client";
import {
  createStudySession,
  markStudySessionEnded,
  readActiveStudySession,
  writeActiveStudySession
} from "@/lib/study/session";
import {
  StudyBackgroundProfile,
  StudyCondition,
  StudyLanguage,
  StudySession
} from "@/types/study";
import { AppEnvironment } from "@/types/environment";

const APP_LANGUAGE_KEY = "tennislevel.app_language";

type StudyContextValue = {
  session: StudySession | null;
  studyMode: boolean;
  environment: AppEnvironment;
  language: StudyLanguage;
  canChangeLanguage: boolean;
  pendingStudySetup: boolean;
  loading: boolean;
  setLanguage: (language: StudyLanguage) => void;
  setPendingStudySetup: (value: boolean) => void;
  startStudySession: (input: {
    participantId: string;
    language: StudyLanguage;
    condition?: StudyCondition;
    background?: StudyBackgroundProfile;
    consentedAt?: string;
  }) => Promise<{ session?: StudySession; error?: string }>;
  endStudySession: () => Promise<void>;
  clearStudyData: () => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

function isBrowser() {
  return typeof window !== "undefined";
}

function readAppLanguage(): StudyLanguage {
  if (!isBrowser()) {
    return "zh";
  }

  const stored = window.localStorage.getItem(APP_LANGUAGE_KEY);
  return stored === "en" ? "en" : "zh";
}

function writeAppLanguage(language: StudyLanguage) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(APP_LANGUAGE_KEY, language);
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [appLanguage, setAppLanguage] = useState<StudyLanguage>("zh");
  const [pendingStudySetup, setPendingStudySetupState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nextSession = readActiveStudySession();
    setSession(nextSession);
    setAppLanguage(nextSession?.language ?? readAppLanguage());
    setPendingStudySetupState(nextSession ? false : readPendingStudySetup());
    setLoading(false);
  }, []);

  const activeSession = session && !session.endedAt ? session : null;
  const environment = resolveAppEnvironment({
    studyMode: Boolean(activeSession),
    hasSession: Boolean(activeSession)
  });
  const language = activeSession?.language ?? appLanguage;
  const canChangeLanguage = !activeSession;

  useEffect(() => {
    if (activeSession) {
      writeAppLanguage(activeSession.language);
    }
  }, [activeSession]);

  useEffect(() => {
    setEventLoggerStudySession(activeSession);
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [activeSession, language]);

  const value = useMemo<StudyContextValue>(() => ({
    session: activeSession,
    studyMode: Boolean(activeSession),
    environment,
    language,
    canChangeLanguage,
    pendingStudySetup,
    loading,
    setLanguage: (nextLanguage) => {
      if (activeSession) {
        return;
      }

      setAppLanguage(nextLanguage);
      writeAppLanguage(nextLanguage);
    },
    setPendingStudySetup: (value) => {
      if (activeSession && value) {
        return;
      }

      writePendingStudySetup(value);
      setPendingStudySetupState(value);
    },
    startStudySession: async ({ participantId, language: nextLanguage, condition, background, consentedAt }) => {
      const normalizedParticipantId = participantId.trim();
      if (!normalizedParticipantId) {
        return { error: "participantId is required" };
      }

      const nextSession = createStudySession({
        participantId: normalizedParticipantId,
        language: nextLanguage,
        condition,
        background,
        consentedAt
      });

      writeActiveStudySession(nextSession);
      writePendingStudySetup(false);
      writeAppLanguage(nextLanguage);
      setAppLanguage(nextLanguage);
      setPendingStudySetupState(false);
      setEventLoggerStudySession(nextSession);
      setSession(nextSession);
      await persistStudySessionStart(nextSession);
      return { session: nextSession };
    },
    endStudySession: async () => {
      if (!activeSession) {
        return;
      }

      const endedSession = markStudySessionEnded(activeSession);
      await flushEventQueue(true);
      setEventLoggerStudySession(null);
      setSession(endedSession);
      await persistStudySessionEnd(endedSession);
    },
    clearStudyData: () => {
      clearLocalStudyData();
      writeActiveStudySession(null);
      writePendingStudySetup(false);
      setPendingStudySetupState(false);
      setEventLoggerStudySession(null);
      setSession(null);
    }
  }), [activeSession, canChangeLanguage, environment, language, loading, pendingStudySetup]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within StudyProvider");
  }

  return context;
}
