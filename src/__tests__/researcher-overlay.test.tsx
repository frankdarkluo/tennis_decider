import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { StudySession } from "@/types/study";

const { mockRouterState, mockStudyContext, mockTaskRatings, mockArtifacts, mockI18n } = vi.hoisted(() => ({
  mockRouterState: { pathname: "/plan" },
  mockStudyContext: {
    session: {
      studyId: "sportshci_2026_no_video_v1",
      participantId: "P001",
      sessionId: "session_1",
      studyMode: true as const,
      language: "en" as const,
      condition: "lang_en",
      snapshotId: "2026-03-29-v1",
      snapshotSeed: "20260329",
      buildVersion: "2026-03-29-v1",
      startedAt: "2026-03-29T10:00:00.000Z"
    } satisfies StudySession,
    studyMode: true,
    language: "en" as const,
    canChangeLanguage: false,
    loading: false,
    setLanguage: vi.fn(),
    startStudySession: vi.fn(),
    endStudySession: vi.fn(),
    clearStudyData: vi.fn()
  },
  mockTaskRatings: [
    {
      id: "rating_1",
      studyId: "sportshci_2026_no_video_v1",
      participantId: "P001",
      sessionId: "session_1",
      taskId: "task_3_action_or_revisit" as const,
      metricName: "actionability" as const,
      score: 6 as const,
      language: "en" as const,
      submittedAt: "2026-03-29T10:10:00.000Z"
    }
  ],
  mockArtifacts: [
    {
      id: "artifact_1",
      studyId: "sportshci_2026_no_video_v1",
      participantId: "P001",
      sessionId: "session_1",
      studyMode: true as const,
      language: "en" as const,
      condition: "lang_en",
      snapshotId: "2026-03-29-v1",
      snapshotSeed: "20260329",
      buildVersion: "2026-03-29-v1",
      artifactType: "survey" as const,
      payload: {},
      createdAt: "2026-03-29T10:20:00.000Z"
    }
  ],
  mockI18n: {
    t: (key: string) => ({
      "researcherOverlay.badge": "Researcher overlay",
      "researcherOverlay.participantId": "Participant",
      "researcherOverlay.taskId": "Task",
      "researcherOverlay.language": "Language",
      "researcherOverlay.snapshotVersion": "Snapshot",
      "researcherOverlay.actionability": "Actionability",
      "researcherOverlay.sus": "SUS",
      "researcherOverlay.done": "Done",
      "researcherOverlay.pending": "Pending"
    }[key] ?? key)
  }
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockRouterState.pathname
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => mockStudyContext
}));

vi.mock("@/lib/study/localData", () => ({
  readLocalStudyTaskRatings: () => mockTaskRatings,
  readLocalStudyArtifacts: () => mockArtifacts
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => mockI18n
}));

describe("researcher overlay", () => {
  beforeEach(() => {
    cleanup();
    process.env.NEXT_PUBLIC_ENABLE_RESEARCHER_OVERLAY = "true";
    mockRouterState.pathname = "/plan";
  });

  it("shows study status for researchers when the overlay flag is enabled", async () => {
    const { ResearcherOverlay } = await import("@/components/study/ResearcherOverlay");

    render(<ResearcherOverlay />);

    expect(screen.getByText("Researcher overlay")).toBeInTheDocument();
    expect(screen.getByText("P001")).toBeInTheDocument();
    expect(screen.getByText("task_3_action_or_revisit")).toBeInTheDocument();
    expect(screen.getAllByText("Done").length).toBeGreaterThanOrEqual(2);
  });

  it("stays hidden when the overlay flag is disabled", async () => {
    process.env.NEXT_PUBLIC_ENABLE_RESEARCHER_OVERLAY = "false";
    const { ResearcherOverlay } = await import("@/components/study/ResearcherOverlay");

    render(<ResearcherOverlay />);

    expect(screen.queryByText("Researcher overlay")).not.toBeInTheDocument();
  });
});
