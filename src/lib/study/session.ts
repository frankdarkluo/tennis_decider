"use client";

import {
  ACTIVE_STUDY_SESSION_KEY,
  CURRENT_STUDY_ID,
  STUDY_SESSION_HISTORY_KEY
} from "@/lib/study/config";
import { getStudySnapshot } from "@/lib/study/snapshot";
import {
  StudyBackgroundProfile,
  StudyCondition,
  StudyLanguage,
  StudySession
} from "@/types/study";

function isBrowser() {
  return typeof window !== "undefined";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `study_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createStudySession(input: {
  participantId: string;
  language: StudyLanguage;
  condition?: StudyCondition;
  background?: StudyBackgroundProfile;
  consentedAt?: string;
}): StudySession {
  const snapshot = getStudySnapshot();
  return {
    studyId: CURRENT_STUDY_ID,
    participantId: input.participantId.trim(),
    sessionId: createId(),
    studyMode: true,
    language: input.language,
    condition: input.condition ?? `lang_${input.language}`,
    snapshotId: snapshot.id,
    snapshotSeed: snapshot.seed,
    buildVersion: snapshot.buildVersion,
    consentedAt: input.consentedAt ?? new Date().toISOString(),
    background: input.background ?? null,
    startedAt: new Date().toISOString(),
    endedAt: null
  };
}

export function readActiveStudySession(): StudySession | null {
  return readJson<StudySession | null>(ACTIVE_STUDY_SESSION_KEY, null);
}

export function writeActiveStudySession(session: StudySession | null) {
  if (!isBrowser()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(ACTIVE_STUDY_SESSION_KEY);
    return;
  }

  writeJson(ACTIVE_STUDY_SESSION_KEY, session);
}

export function readStudySessionHistory() {
  return readJson<StudySession[]>(STUDY_SESSION_HISTORY_KEY, []);
}

export function upsertStudySessionHistory(session: StudySession) {
  const sessions = readStudySessionHistory();
  const nextSessions = [
    ...sessions.filter((item) => item.sessionId !== session.sessionId),
    session
  ];
  writeJson(STUDY_SESSION_HISTORY_KEY, nextSessions);
}

export function markStudySessionEnded(session: StudySession) {
  const endedSession: StudySession = {
    ...session,
    endedAt: new Date().toISOString()
  };
  writeActiveStudySession(endedSession);
  upsertStudySessionHistory(endedSession);
  return endedSession;
}
