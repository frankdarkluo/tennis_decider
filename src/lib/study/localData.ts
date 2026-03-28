"use client";

import {
  STUDY_ARTIFACTS_KEY,
  STUDY_BOOKMARKS_KEY,
  STUDY_LAST_PATH_KEY,
  STUDY_PROGRESS_KEY
} from "@/lib/study/config";
import { StudyArtifactRecord, StudyBookmarkState, StudyProgressState } from "@/types/study";

function isBrowser() {
  return typeof window !== "undefined";
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

export function readLocalStudyArtifacts() {
  return readJson<StudyArtifactRecord[]>(STUDY_ARTIFACTS_KEY, []);
}

export function appendLocalStudyArtifact(artifact: StudyArtifactRecord) {
  const items = readLocalStudyArtifacts();
  items.push(artifact);
  writeJson(STUDY_ARTIFACTS_KEY, items);
}

export function readLocalStudyBookmarks() {
  return readJson<StudyBookmarkState>(STUDY_BOOKMARKS_KEY, {
    contentIds: [],
    updatedAt: new Date(0).toISOString()
  });
}

export function writeLocalStudyBookmarks(contentIds: string[]) {
  writeJson(STUDY_BOOKMARKS_KEY, {
    contentIds,
    updatedAt: new Date().toISOString()
  } satisfies StudyBookmarkState);
}

export function toggleLocalStudyBookmark(contentId: string) {
  const current = readLocalStudyBookmarks();
  const next = current.contentIds.includes(contentId)
    ? current.contentIds.filter((item) => item !== contentId)
    : [...current.contentIds, contentId];

  writeLocalStudyBookmarks(next);
  return next;
}

export function readLocalStudyProgress() {
  return readJson<StudyProgressState | null>(STUDY_PROGRESS_KEY, null);
}

export function writeLocalStudyProgress(value: StudyProgressState) {
  writeJson(STUDY_PROGRESS_KEY, value);
}

export function updateLocalStudyProgress(patch: Omit<StudyProgressState, "updatedAt">) {
  const current = readLocalStudyProgress() ?? { updatedAt: new Date(0).toISOString() };
  const next: StudyProgressState = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString()
  };
  writeLocalStudyProgress(next);
  return next;
}

export function readLastStudyPath() {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage.getItem(STUDY_LAST_PATH_KEY);
}

export function writeLastStudyPath(path: string) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(STUDY_LAST_PATH_KEY, path);
  updateLocalStudyProgress({ lastVisitedPath: path });
}

export function clearLocalStudyData() {
  if (!isBrowser()) {
    return;
  }

  [
    STUDY_ARTIFACTS_KEY,
    STUDY_BOOKMARKS_KEY,
    STUDY_PROGRESS_KEY,
    STUDY_LAST_PATH_KEY
  ].forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });
}
