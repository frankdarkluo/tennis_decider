"use client";

import { StudyArtifactType, StudySession } from "@/types/study";
import { EventLog } from "@/types/research";

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
  return postJson("/api/study/events", { events: [event] });
}

export async function saveStudyArtifact(input: {
  session: StudySession;
  artifactType: StudyArtifactType;
  page: string;
  payload: Record<string, unknown>;
}) {
  return postJson("/api/study/artifact", input);
}
