"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { EventLog, EventType } from "@/types/research";

const LOCAL_EVENT_LOGS_KEY = "tennislevel_events";
const SESSION_ID_KEY = "tennislevel_session_id";
const MAX_LOCAL_EVENTS = 500;

let currentUserId: string | null = null;
let currentPage = "/";
const pageEnterTimestamps = new Map<string, number>();

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `event_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isBrowser() {
  return typeof window !== "undefined";
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

  return window.location.pathname || currentPage;
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
        page: event.page,
        event_type: event.eventType,
        event_data: event.eventData,
        duration_ms: event.durationMs
      });
    } catch {
      return;
    }
  })();
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

export function setEventLoggerUser(userId: string | null) {
  currentUserId = userId;
}

export function setEventLoggerPage(page: string) {
  currentPage = page;
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

  const event: EventLog = {
    eventId: createId(),
    sessionId: getEventSessionId(),
    userId: currentUserId,
    timestamp: new Date().toISOString(),
    page: options.page ?? currentPage ?? getCurrentPath(),
    eventType,
    eventData,
    durationMs: options.durationMs ?? null
  };

  appendLocalLog(event);
  queueMicrotask(() => persistRemoteLog(event));
}

export function logPageEnter(page: string): void {
  if (!isBrowser()) {
    return;
  }

  setEventLoggerPage(page);
  pageEnterTimestamps.set(page, Date.now());
  logEvent("page_enter", {}, { page });
}

export function logPageLeave(page: string): void {
  if (!isBrowser()) {
    return;
  }

  const enteredAt = pageEnterTimestamps.get(page);
  const durationMs = typeof enteredAt === "number" ? Date.now() - enteredAt : null;

  pageEnterTimestamps.delete(page);
  logEvent("page_leave", {}, { page, durationMs });
}

export function exportLocalLogs(): string {
  return JSON.stringify(readLocalLogs(), null, 2);
}

export function getLocalLogs(): EventLog[] {
  return readLocalLogs();
}
