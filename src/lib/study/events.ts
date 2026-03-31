"use client";

import { StudyArtifactType, StudySession } from "@/types/study";
import { EventLog, StudyFlushFailureReason } from "@/types/research";

const DEFAULT_RETRY_COUNT = 2;
const DEFAULT_RETRY_DELAY_MS = 250;

export type StudyEventPostResult =
  | { ok: true; attempts: number; transport: "beacon" | "fetch" }
  | {
    ok: false;
    attempts: number;
    transport: "fetch";
    failureReason: StudyFlushFailureReason;
    httpStatus: number | null;
  };

async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json().catch(() => ({}));
}

export async function startStudySessionRemote(session: StudySession) {
  return postJson("/api/study/session/start", { session });
}

export async function endStudySessionRemote(session: StudySession) {
  return postJson("/api/study/session/end", { session });
}

export async function postStudyEvent(event: EventLog) {
  return postStudyEvents([event]);
}

export async function postStudyEvents(events: EventLog[]) {
  return postJson("/api/study/events", { events });
}

export async function postStudyEventsWithRetry(
  events: EventLog[],
  options: {
    sync?: boolean;
    retryCount?: number;
    retryDelayMs?: number;
  } = {}
): Promise<StudyEventPostResult> {
  if (events.length === 0) {
    return { ok: true, attempts: 0, transport: "fetch" };
  }

  const payload = { events };
  const body = JSON.stringify(payload);
  const retryCount = options.retryCount ?? DEFAULT_RETRY_COUNT;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  let beaconRejected = false;
  let lastFailureReason: StudyFlushFailureReason | null = null;
  let lastHttpStatus: number | null = null;

  if (options.sync && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const accepted = navigator.sendBeacon(
      "/api/study/events",
      new Blob([body], { type: "application/json" })
    );

    if (accepted) {
      return { ok: true, attempts: 1, transport: "beacon" };
    }

    beaconRejected = true;
  }

  for (let attempt = 1; attempt <= retryCount + 1; attempt += 1) {
    try {
      const response = await fetch("/api/study/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body,
        keepalive: true
      });

      if (response.ok) {
        return { ok: true, attempts: attempt, transport: "fetch" };
      }

      lastFailureReason = "http_non_2xx";
      lastHttpStatus = response.status;
    } catch {
      lastFailureReason = "network_error";
    }

    if (attempt <= retryCount) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return {
    ok: false,
    attempts: retryCount + 1,
    transport: "fetch",
    failureReason: beaconRejected ? "beacon_rejected" : (lastFailureReason ?? "network_error"),
    httpStatus: lastHttpStatus
  };
}

export async function saveStudyArtifact(input: {
  session: StudySession;
  artifactType: StudyArtifactType;
  page: string;
  payload: Record<string, unknown>;
}) {
  return postJson("/api/study/artifact", input);
}
