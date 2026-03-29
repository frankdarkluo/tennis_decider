import { describe, expect, it } from "vitest";
import { buildStudyExportBundle, deriveStudyMetrics } from "@/lib/researchData";

describe("research export helpers", () => {
  const events = [
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "page.view",
      page: "/",
      timestamp: "2026-03-29T10:00:00.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 1_000 }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "home.entry_selected",
      page: "/",
      timestamp: "2026-03-29T10:00:05.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 6_000, entryMode: "assessment" }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "assessment.completed",
      page: "/assessment",
      timestamp: "2026-03-29T10:01:00.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 61_000 }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "diagnose.layer_opened",
      page: "/diagnose",
      timestamp: "2026-03-29T10:02:00.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 121_000, layer: 3 }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "content.outbound_clicked",
      page: "/library",
      timestamp: "2026-03-29T10:02:10.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 131_000 }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "page.leave",
      page: "/diagnose",
      timestamp: "2026-03-29T10:02:30.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 151_000, dwellMs: 42_000 }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "plan.generated",
      page: "/plan",
      timestamp: "2026-03-29T10:03:00.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 181_000 }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "plan.saved",
      page: "/plan",
      timestamp: "2026-03-29T10:03:20.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 201_000 }
    },
    {
      session_id: "session_1",
      participant_id: "P001",
      event_type: "session.completed",
      page: "/study/end",
      timestamp: "2026-03-29T10:04:00.000Z",
      event_data: { studyId: "sportshci_2026_no_video_v1", tsClient: 241_000, totalDurationMs: 240_000 }
    }
  ];

  it("derives per-session research metrics from tracked events", () => {
    const metrics = deriveStudyMetrics(events);

    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toMatchObject({
      sessionId: "session_1",
      participantId: "P001",
      firstEntryMode: "assessment",
      assessmentCompleted: true,
      planGenerated: true,
      planSaved: true,
      diagnoseMaxLayerOpened: 3,
      outboundClickCount: 1,
      totalSessionMs: 240_000
    });
    expect(metrics[0].dwellMsByRoute["/diagnose"]).toBe(42_000);
  });

  it("includes derived metrics in the study export bundle", () => {
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
      sessions: [{ participant_id: "P001", session_id: "session_1", snapshot_id: "snapshot_1" }],
      artifacts: [],
      taskRatings: [
        {
          participant_id: "P001",
          session_id: "session_1",
          snapshot_id: "snapshot_1",
          task_id: "task_1_problem_entry",
          metric_name: "actionability",
          score: 6,
          language: "zh"
        },
        {
          participant_id: "P001",
          session_id: "session_1",
          snapshot_id: "snapshot_1",
          task_id: "task_2_assessment_entry",
          metric_name: "actionability",
          score: 4,
          language: "en"
        }
      ],
      events,
      participantId: "P001"
    });

    expect(bundle.derivedMetrics).toHaveLength(1);
    expect(bundle.derivedMetrics?.[0].sessionId).toBe("session_1");
    expect(bundle.taskRatings).toHaveLength(2);
    expect(bundle.actionabilitySummary?.overall.count).toBe(2);
    expect(bundle.actionabilitySummary?.overall.mean).toBe(5);
    expect(bundle.actionabilitySummary?.byTask.task_1_problem_entry.mean).toBe(6);
    expect(bundle.actionabilitySummary?.byLanguage.zh.mean).toBe(6);
  });
});
