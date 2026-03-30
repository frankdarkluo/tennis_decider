import { describe, expect, it } from "vitest";
import { buildStudyExportBundle } from "@/lib/researchData";

describe("study participant export", () => {
  it("includes participant registry rows in the study export bundle", () => {
    const bundle = buildStudyExportBundle({
      snapshot: {
        id: "snapshot_1",
        seed: "seed_1",
        buildVersion: "build_1",
        snapshotVersion: "snapshot_1",
        fixedSeed: "seed_1",
        sortingMode: "deterministic_study",
        contentSetVersion: "content_1",
        creatorSetVersion: "creator_1",
        assessmentVersion: "assessment_1",
        diagnosisRulesVersion: "diagnosis_1",
        planTemplateVersion: "plan_1",
        localeBundleVersion: "locale_1",
        rankingStrategyVersion: "ranking_1",
        buildSha: null,
        randomSurfacingDisabled: true,
        viewCountBoostDisabled: true
      },
      participants: [
        {
          study_id: "sportshci_2026_no_video_v1",
          participant_id: "P001",
          latest_session_id: "session_1",
          latest_snapshot_id: "snapshot_1",
          latest_build_version: "build_1",
          language: "zh",
          condition: "lang_zh",
          created_at: "2026-03-29T00:00:00.000Z",
          updated_at: "2026-03-29T00:10:00.000Z"
        }
      ],
      sessions: [
        {
          study_id: "sportshci_2026_no_video_v1",
          participant_id: "P001",
          session_id: "session_1",
          snapshot_id: "snapshot_1"
        }
      ],
      artifacts: [],
      taskRatings: [],
      events: [],
      participantId: "P001"
    });

    expect(bundle.participants).toEqual([
      expect.objectContaining({
        participantId: "P001",
        latestSessionId: "session_1"
      })
    ]);
  });
});
