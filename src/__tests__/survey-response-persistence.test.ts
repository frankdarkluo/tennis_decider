import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));

vi.mock("@/lib/supabase", () => ({
  getSupabaseBrowserClient: () => ({ from })
}));

describe("survey response persistence", () => {
  beforeEach(() => {
    from.mockClear();
    insert.mockClear();
    insert.mockResolvedValue({ error: null });
  });

  it("writes study survey metadata to survey_responses", async () => {
    const { saveSurveyResponse } = await import("@/lib/researchData");

    await saveSurveyResponse({
      sessionId: "session_42",
      userId: null,
      responses: { q6: 5, q7: 2 },
      susScore: 77.5,
      studyId: "sportshci_2026_no_video_v1",
      participantId: "P042",
      studyMode: true,
      language: "zh",
      condition: "lang_zh",
      snapshotId: "snapshot_1",
      snapshotSeed: "seed_1",
      buildVersion: "build_1"
    });

    expect(from).toHaveBeenCalledWith("survey_responses");
    expect(insert).toHaveBeenCalledWith({
      session_id: "session_42",
      user_id: null,
      responses: { q6: 5, q7: 2 },
      sus_score: 77.5,
      study_id: "sportshci_2026_no_video_v1",
      participant_id: "P042",
      study_mode: true,
      language: "zh",
      condition: "lang_zh",
      snapshot_id: "snapshot_1",
      snapshot_seed: "seed_1",
      build_version: "build_1"
    });
  });
});
