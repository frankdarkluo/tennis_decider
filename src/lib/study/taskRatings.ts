"use client";

import { appendLocalStudyTaskRating, readLocalStudyTaskRatings } from "@/lib/study/localData";
import {
  StudyLanguage,
  StudyMetricName,
  StudySession,
  StudyTaskId,
  StudyTaskRatingRecord
} from "@/types/study";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `task_rating_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

type PersistInput = {
  taskId: StudyTaskId;
  score: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  language: StudyLanguage;
  metricName?: StudyMetricName;
};

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

export async function persistStudyTaskRating(session: StudySession, input: PersistInput) {
  const rating: StudyTaskRatingRecord = {
    id: createId(),
    studyId: session.studyId,
    participantId: session.participantId,
    sessionId: session.sessionId,
    taskId: input.taskId,
    metricName: input.metricName ?? "actionability",
    score: input.score,
    language: input.language,
    submittedAt: new Date().toISOString()
  };

  appendLocalStudyTaskRating(rating);

  return {
    rating,
    ...(await postJson("/api/study/task-ratings", { rating }))
  };
}

export { readLocalStudyTaskRatings };

export function hasStudyTaskRating(sessionId: string, taskId: StudyTaskId) {
  return readLocalStudyTaskRatings().some((rating) => (
    rating.sessionId === sessionId && rating.taskId === taskId
  ));
}
