import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudySession } from "@/types/study";

const baseSession: StudySession = {
  studyId: "sportshci_2026_no_video_v1",
  participantId: "P001",
  sessionId: "session_1",
  studyMode: true,
  language: "zh",
  condition: "lang_zh",
  snapshotId: "2026-03-29-v1",
  snapshotSeed: "20260329",
  buildVersion: "2026-03-29-v1",
  startedAt: "2026-03-29T00:00:00.000Z",
  endedAt: null
};

describe("persistStudyTaskRating", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("stores the rating locally and posts it to the study API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));

    const { persistStudyTaskRating, readLocalStudyTaskRatings } = await import("@/lib/study/taskRatings");

    const result = await persistStudyTaskRating(baseSession, {
      taskId: "task_2_assessment_entry",
      score: 7,
      language: "zh"
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/study/task-ratings", expect.objectContaining({
      method: "POST"
    }));
    expect(result.rating.taskId).toBe("task_2_assessment_entry");
    expect(readLocalStudyTaskRatings()).toEqual([
      expect.objectContaining({
        sessionId: "session_1",
        taskId: "task_2_assessment_entry",
        score: 7
      })
    ]);
  });
});
