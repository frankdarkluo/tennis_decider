"use client";

import { appendLocalStudyArtifact } from "@/lib/study/localData";
import { upsertStudySessionHistory } from "@/lib/study/session";
import { StudyArtifactRecord, StudyArtifactType, StudySession } from "@/types/study";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `artifact_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function postJson(url: string, body: Record<string, unknown>) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return { error: `Request failed: ${response.status}` };
    }

    return { data: await response.json().catch(() => ({ ok: true })) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown study request error"
    };
  }
}

export async function persistStudySessionStart(session: StudySession) {
  upsertStudySessionHistory(session);
  return postJson("/api/study/session/start", { session });
}

export async function persistStudySessionEnd(session: StudySession) {
  upsertStudySessionHistory(session);
  return postJson("/api/study/session/end", { session });
}

export async function persistStudyArtifact(
  session: StudySession,
  artifactType: StudyArtifactType,
  payload: Record<string, unknown>
) {
  const artifact: StudyArtifactRecord = {
    id: createId(),
    participantId: session.participantId,
    sessionId: session.sessionId,
    studyMode: true,
    language: session.language,
    condition: session.condition ?? `lang_${session.language}`,
    snapshotId: session.snapshotId,
    snapshotSeed: session.snapshotSeed,
    buildVersion: session.buildVersion,
    artifactType,
    payload,
    createdAt: new Date().toISOString()
  };

  appendLocalStudyArtifact(artifact);
  return {
    artifact,
    ...(await postJson("/api/study/artifact", { artifact }))
  };
}

