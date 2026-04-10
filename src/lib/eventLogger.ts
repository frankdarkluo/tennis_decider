"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  createFocusedDwellState,
  finishFocusedDwell,
  FocusedDwellState,
  markFocusedDwellInteraction,
  updateFocusedDwellState
} from "@/lib/telemetry/focusedDwell";
import { EventLog, EventType, LegacyEventType } from "@/types/telemetry";

const LOCAL_EVENT_LOGS_KEY = "tennislevel_events";
const SESSION_ID_KEY = "tennislevel_session_id";
const MAX_LOCAL_EVENTS = 1000;

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
let lastMeaningfulRoute = "/";
let lastMeaningfulAt = Date.now();
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

function getCurrentPath() {
  if (!isBrowser()) {
    return currentPage;
  }

  return sanitizeRoute(window.location.pathname || currentPage);
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

  if (!supabase || !event.userId) {
    return;
  }

  void (async () => {
    try {
      await supabase.from("event_logs").insert({
        session_id: event.sessionId,
        user_id: event.userId,
        timestamp: event.timestamp,
        page: event.route,
        event_type: event.eventName,
        event_data: { tsClient: event.tsClient, ...event.payload },
        duration_ms: event.durationMs
      });
    } catch {
      return;
    }
  })();
}

function createEvent(
  eventType: EventType,
  eventData: Record<string, unknown>,
  options: { page?: string; durationMs?: number | null } = {}
): EventLog {
  const route = sanitizeRoute(options.page ?? currentPage ?? getCurrentPath());
  const tsClient = Date.now();
  const normalizedEventName = normalizeEventName(eventType);
  const payload = Object.entries(eventData).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value === undefined || PRIVACY_SENSITIVE_KEYS.has(key)) {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});

  return {
    eventId: createId(),
    sessionId: getEventSessionId(),
    userId: currentUserId,
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

export function setEventLoggerPage(page: string) {
  currentPage = sanitizeRoute(page);
}

export function flushEventQueue(sync = false) {
  void sync;
  return Promise.resolve();
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

  queueMicrotask(() => {
    persistRemoteLog(event);
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

export function exportLocalLogs(): string {
  return JSON.stringify(readLocalLogs(), null, 2);
}

export function getLocalLogs(): EventLog[] {
  return readLocalLogs();
}
