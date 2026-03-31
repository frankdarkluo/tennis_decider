"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { CURRENT_STUDY_ID } from "@/lib/study/config";
import {
  createFocusedDwellState,
  finishFocusedDwell,
  FocusedDwellState,
  markFocusedDwellInteraction,
  updateFocusedDwellState
} from "@/lib/study/focusedDwell";
import { postStudyEventsWithRetry } from "@/lib/study/events";
import { EventLog, EventType, LegacyEventType, StudyFlushFailureReason } from "@/types/research";
import { StudySession } from "@/types/study";

const LOCAL_EVENT_LOGS_KEY = "tennislevel_events";
const STUDY_FLUSH_FALLBACK_LOGS_KEY = "tennislevel_study_flush_fallback_logs";
const SESSION_ID_KEY = "tennislevel_session_id";
const MAX_LOCAL_EVENTS = 1000;
const STUDY_FLUSH_DELAY_MS = 1200;
const MAX_FLUSH_FALLBACK_LOGS = 50;

const PRIVACY_SENSITIVE_KEYS = new Set([
  "inputText",
  "rawText",
  "query",
  "url",
  "targetUrl",
  "email",
  "phone",
  "name",
  "fileName",
  "filePath",
  "videoPath",
  "videoUrl",
  "videoFileName",
  "userAgent"
]);

const LEGACY_EVENT_NAME_MAP: Partial<Record<LegacyEventType, EventType>> = {
  study_session_start: "session.started",
  study_session_end: "session.completed",
  study_data_clear: "profile.local_data_cleared",
  page_enter: "page.view",
  page_leave: "page.leave",
  assessment_start: "assessment.started",
  assessment_answer: "assessment.step_answered",
  assessment_complete: "assessment.completed",
  assessment_abandon: "assessment.exited",
  diagnosis_submit: "diagnose.submitted",
  diagnosis_result: "diagnose.result_viewed",
  diagnosis_no_match: "diagnose.fallback_used",
  content_click: "content.card_opened",
  content_external: "content.outbound_clicked",
  content_bookmark: "content.bookmark_toggled",
  content_filter: "library.filter_changed",
  creator_filter: "rankings.region_changed",
  plan_generate: "plan.generated",
  plan_save: "plan.saved",
  plan_view_day: "plan.day_expanded"
};

let currentUserId: string | null = null;
let currentPage = "/";
let currentStudySession: StudySession | null = null;
let lastMeaningfulRoute = "/";
let lastMeaningfulAt = Date.now();
let sessionCompleted = false;
let flushTimer: number | null = null;
let flushing = false;
const queuedStudyEvents: EventLog[] = [];
const pageDwellStates = new Map<string, FocusedDwellState>();

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `event_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function sanitizeRoute(route: string) {
  const fallback = route || currentPage || "/";
  const [withoutHash] = fallback.split("#");
  const [pathname] = withoutHash.split("?");
  return pathname || "/";
}

function readLocalLogs(): EventLog[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_EVENT_LOGS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EventLog[]) : [];
  } catch {
    return [];
  }
}

function writeLocalLogs(logs: EventLog[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(LOCAL_EVENT_LOGS_KEY, JSON.stringify(logs));
}

function appendLocalLog(event: EventLog) {
  const logs = readLocalLogs();
  logs.push(event);

  if (logs.length > MAX_LOCAL_EVENTS) {
    logs.splice(0, logs.length - MAX_LOCAL_EVENTS);
  }

  writeLocalLogs(logs);
}

function appendFlushFallbackLog(input: {
  reason: StudyFlushFailureReason;
  attempts: number;
  eventCount: number;
  mode: "sync" | "async";
  httpStatus?: number | null;
}) {
  if (!isBrowser()) {
    return;
  }

  let current: Array<Record<string, unknown>> = [];
  try {
    const raw = window.localStorage.getItem(STUDY_FLUSH_FALLBACK_LOGS_KEY);
    current = raw ? JSON.parse(raw) as Array<Record<string, unknown>> : [];
  } catch {
    current = [];
  }

  current.push({
    timestamp: new Date().toISOString(),
    ...input
  });

  if (current.length > MAX_FLUSH_FALLBACK_LOGS) {
    current.splice(0, current.length - MAX_FLUSH_FALLBACK_LOGS);
  }

  window.localStorage.setItem(STUDY_FLUSH_FALLBACK_LOGS_KEY, JSON.stringify(current));
}

function getCurrentPath() {
  if (!isBrowser()) {
    return currentPage;
  }

  return sanitizeRoute(window.location.pathname || currentPage);
}

export type StudyFlushFallbackLogRecord = {
  timestamp: string;
  reason: StudyFlushFailureReason;
  attempts: number;
  eventCount: number;
  mode: "sync" | "async";
  httpStatus?: number | null;
};

export function getStudyFlushFallbackLogs(): StudyFlushFallbackLogRecord[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STUDY_FLUSH_FALLBACK_LOGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StudyFlushFallbackLogRecord[]) : [];
  } catch {
    return [];
  }
}

export function exportStudyFlushFallbackLogs(): string {
  return JSON.stringify(getStudyFlushFallbackLogs(), null, 2);
}

function getVisibilitySnapshot() {
  if (!isBrowser()) {
    return { isVisible: true, isWindowFocused: true };
  }

  return {
    isVisible: document.visibilityState !== "hidden",
    isWindowFocused: typeof document.hasFocus === "function" ? document.hasFocus() : true
  };
}

function normalizeEventName(eventName: EventType): EventType {
  return LEGACY_EVENT_NAME_MAP[eventName as LegacyEventType] ?? eventName;
}

function getStudyId() {
  return currentStudySession?.studyId ?? CURRENT_STUDY_ID;
}

function sanitizePayloadForStudy(payload: Record<string, unknown>) {
  return Object.entries(payload).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value === undefined || PRIVACY_SENSITIVE_KEYS.has(key)) {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

function getBrowserLabel() {
  if (!isBrowser()) {
    return "unknown";
  }

  const userAgent = window.navigator.userAgent;
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  return "Other";
}

function getDeviceType() {
  if (!isBrowser()) {
    return "unknown";
  }

  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

function persistRemoteLog(event: EventLog) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !event.userId || event.studyMode) {
    return;
  }

  void (async () => {
    try {
      await supabase.from("event_logs").insert({
        session_id: event.sessionId,
        user_id: event.userId,
        participant_id: event.participantId,
        study_mode: event.studyMode,
        language: event.language,
        condition: event.condition,
        snapshot_id: event.snapshotId,
        snapshot_seed: event.snapshotSeed,
        build_version: event.buildVersion,
        timestamp: event.timestamp,
        page: event.route,
        event_type: event.eventName,
        event_data: {
          studyId: event.studyId,
          appMode: event.appMode,
          tsClient: event.tsClient,
          tsServer: event.tsServer ?? null,
          snapshotVersion: event.snapshotVersion ?? null,
          buildSha: event.buildSha ?? null,
          ...event.payload
        },
        duration_ms: event.durationMs
      });
    } catch {
      return;
    }
  })();
}

function scheduleStudyFlush() {
  if (!isBrowser() || flushTimer || flushing || queuedStudyEvents.length === 0) {
    return;
  }

  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushStudyEvents();
  }, STUDY_FLUSH_DELAY_MS);
}

async function flushStudyEvents(options: { sync?: boolean } = {}) {
  if (!isBrowser() || flushing || queuedStudyEvents.length === 0) {
    return;
  }

  const events = queuedStudyEvents.splice(0, queuedStudyEvents.length);

  flushing = true;

  try {
    const result = await postStudyEventsWithRetry(events, {
      sync: options.sync,
      retryCount: options.sync ? 1 : 2,
      retryDelayMs: 200
    });

    if (!result.ok) {
      queuedStudyEvents.unshift(...events);
      appendFlushFallbackLog({
        reason: result.failureReason,
        attempts: result.attempts,
        eventCount: events.length,
        mode: options.sync ? "sync" : "async",
        httpStatus: result.httpStatus
      });
    }
  } catch {
    queuedStudyEvents.unshift(...events);
    appendFlushFallbackLog({
      reason: "network_error",
      attempts: 1,
      eventCount: events.length,
      mode: options.sync ? "sync" : "async",
      httpStatus: null
    });
  } finally {
    flushing = false;
    if (queuedStudyEvents.length > 0) {
      scheduleStudyFlush();
    }
  }
}

function createEvent(
  eventType: EventType,
  eventData: Record<string, unknown>,
  options: { page?: string; durationMs?: number | null } = {}
): EventLog {
  const route = sanitizeRoute(options.page ?? currentPage ?? getCurrentPath());
  const tsClient = Date.now();
  const normalizedEventName = normalizeEventName(eventType);
  const payload = currentStudySession ? sanitizePayloadForStudy(eventData) : eventData;
  const sessionId = currentStudySession?.sessionId ?? getEventSessionId();

  return {
    eventId: createId(),
    studyId: getStudyId(),
    sessionId,
    userId: currentUserId,
    participantId: currentStudySession?.participantId ?? null,
    appMode: currentStudySession ? "study" : "product",
    studyMode: Boolean(currentStudySession),
    language: currentStudySession?.language ?? null,
    condition: currentStudySession?.condition ?? null,
    snapshotVersion: currentStudySession?.snapshotId ?? null,
    buildSha: currentStudySession?.buildVersion ?? null,
    snapshotId: currentStudySession?.snapshotId ?? null,
    snapshotSeed: currentStudySession?.snapshotSeed ?? null,
    buildVersion: currentStudySession?.buildVersion ?? null,
    timestamp: new Date(tsClient).toISOString(),
    tsClient,
    route,
    page: route,
    eventName: normalizedEventName,
    eventType: normalizedEventName,
    payload,
    eventData: payload,
    durationMs: options.durationMs ?? null
  };
}

function updateMeaningfulState(event: EventLog) {
  if (event.eventName === "session.completed") {
    sessionCompleted = true;
    return;
  }

  if (
    event.eventName === "page.view"
    || event.eventName === "page.leave"
    || event.eventName === "page.visibility_changed"
  ) {
    return;
  }

  lastMeaningfulRoute = event.route;
  lastMeaningfulAt = event.tsClient;
}

export function initEventLogger() {
  if (!isBrowser()) {
    return;
  }

  if (!window.sessionStorage.getItem(SESSION_ID_KEY)) {
    window.sessionStorage.setItem(SESSION_ID_KEY, createId());
  }
}

export function getEventSessionId() {
  if (currentStudySession?.sessionId) {
    return currentStudySession.sessionId;
  }

  if (!isBrowser()) {
    return "server-session";
  }

  initEventLogger();
  return window.sessionStorage.getItem(SESSION_ID_KEY) ?? createId();
}

export function getSessionStartClientPayload(entryRoute: string) {
  return {
    entryRoute: sanitizeRoute(entryRoute),
    deviceType: getDeviceType(),
    browser: getBrowserLabel(),
    viewport: isBrowser() ? { w: window.innerWidth, h: window.innerHeight } : null
  };
}

export function setEventLoggerUser(userId: string | null) {
  currentUserId = userId;
}

export function setEventLoggerStudySession(session: StudySession | null) {
  currentStudySession = session;
  sessionCompleted = Boolean(session?.endedAt);
}

export function setEventLoggerPage(page: string) {
  currentPage = sanitizeRoute(page);
}

export function markEventLoggerSessionCompleted() {
  sessionCompleted = true;
}

export function flushEventQueue(sync = false) {
  return flushStudyEvents(sync ? { sync: true } : {});
}

export function logEvent(
  eventType: EventType,
  eventData: Record<string, unknown> = {},
  options: { page?: string; durationMs?: number | null } = {}
): void {
  if (!isBrowser()) {
    return;
  }

  initEventLogger();

  const event = createEvent(eventType, eventData, options);
  appendLocalLog(event);
  updateMeaningfulState(event);

  if (event.studyMode) {
    queuedStudyEvents.push(event);
  }

  queueMicrotask(() => {
    persistRemoteLog(event);

    if (event.studyMode) {
      scheduleStudyFlush();
    }
  });
}

export function logPageEnter(page: string, payload: Record<string, unknown> = {}): void {
  if (!isBrowser()) {
    return;
  }

  const route = sanitizeRoute(page);
  setEventLoggerPage(route);
  pageDwellStates.set(route, createFocusedDwellState(Date.now(), getVisibilitySnapshot()));
  logEvent("page.view", payload, { page: route });
}

export function logPageLeave(
  page: string,
  payload: Record<string, unknown> = {}
): void {
  if (!isBrowser()) {
    return;
  }

  const route = sanitizeRoute(page);
  const now = Date.now();
  const state = pageDwellStates.get(route);
  const snapshot = getVisibilitySnapshot();
  const settled = state ? finishFocusedDwell(state, now, snapshot) : null;

  pageDwellStates.delete(route);
  logEvent("page.leave", {
    ...payload,
    dwellMs: settled?.dwellMs ?? null,
    focusedDwellMs: settled?.focusedDwellMs ?? null,
    activeDwellMs: settled?.activeDwellMs ?? null
  }, { page: route, durationMs: settled?.dwellMs ?? null });
}

export function syncPageFocusState(page: string) {
  if (!isBrowser()) {
    return;
  }

  const route = sanitizeRoute(page);
  const state = pageDwellStates.get(route);
  if (!state) {
    return;
  }

  pageDwellStates.set(route, updateFocusedDwellState(state, Date.now(), getVisibilitySnapshot()));
}

export function markPageInteraction(page: string) {
  if (!isBrowser()) {
    return;
  }

  const route = sanitizeRoute(page);
  const state = pageDwellStates.get(route);
  if (!state) {
    return;
  }

  pageDwellStates.set(route, markFocusedDwellInteraction(state, Date.now()));
}

export function logPageVisibilityChange(page: string) {
  if (!isBrowser()) {
    return;
  }

  syncPageFocusState(page);
  logEvent("page.visibility_changed", {
    visibilityState: document.visibilityState,
    isWindowFocused: typeof document.hasFocus === "function" ? document.hasFocus() : true
  }, { page });
}

export function logSessionAbandoned(route: string) {
  if (!currentStudySession || sessionCompleted) {
    return;
  }

  logEvent("session.abandoned", {
    lastMeaningfulRoute,
    inactiveMs: Math.max(0, Date.now() - lastMeaningfulAt)
  }, { page: sanitizeRoute(route) });
  flushEventQueue(true);
}

export function exportLocalLogs(): string {
  return JSON.stringify(readLocalLogs(), null, 2);
}

export function getLocalLogs(): EventLog[] {
  return readLocalLogs();
}
