import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { StudySession } from "@/types/study";

const useStudy = vi.fn();
const useI18n = vi.fn();
const useAuth = vi.fn();
const persistStudyArtifact = vi.fn();
const saveSurveyResponse = vi.fn();
const logEvent = vi.fn();

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => useStudy()
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => useI18n()
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => useAuth()
}));

vi.mock("@/lib/study/client", () => ({
  persistStudyArtifact: (...args: unknown[]) => persistStudyArtifact(...args)
}));

vi.mock("@/lib/researchData", () => ({
  saveSurveyResponse: (...args: unknown[]) => saveSurveyResponse(...args)
}));

vi.mock("@/lib/eventLogger", () => ({
  getEventSessionId: () => "session_1",
  logEvent: (...args: unknown[]) => logEvent(...args)
}));

const baseSession: StudySession = {
  studyId: "sportshci_2026_no_video_v1",
  participantId: "P001",
  sessionId: "session_1",
  studyMode: true,
  language: "en",
  condition: "lang_en",
  snapshotId: "2026-03-29-v1",
  snapshotSeed: "20260329",
  buildVersion: "2026-03-29-v1",
  startedAt: "2026-03-29T00:00:00.000Z",
  endedAt: null
};

describe("survey localization", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: null });
    useStudy.mockReturnValue({
      studyMode: true,
      session: baseSession
    });
    useI18n.mockReturnValue({
      language: "zh",
      t: (key: string) => {
        const table: Record<string, string> = {
          "survey.badge": "研究问卷",
          "survey.title": "TennisLevel 使用体验问卷",
          "survey.subtitle": "请根据刚刚的体验完成问卷。",
          "survey.part.basic.title": "Part 1: Background",
          "survey.part.basic.body": "Tell us a little about your tennis background.",
          "survey.part.sus.title": "Part 2: SUS",
          "survey.part.sus.body": "Rate the usability of the system.",
          "survey.part.product.title": "Part 3: Product",
          "survey.part.product.body": "Rate the core product flow.",
          "survey.part.open.title": "Part 4: Open feedback",
          "survey.part.open.body": "Share anything else you noticed.",
          "survey.placeholder": "Type your answer",
          "survey.submit": "Submit",
          "survey.submitting": "Submitting...",
          "survey.answerAll": "Please answer every question."
        };
        return table[key] ?? key;
      }
    });
    persistStudyArtifact.mockResolvedValue({ artifact: { id: "artifact_1" } });
    saveSurveyResponse.mockResolvedValue({});
    logEvent.mockReset();
  });

  it("uses the study session language for question copy during an English study session", async () => {
    const SurveyPage = (await import("@/app/survey/page")).default;

    render(<SurveyPage />);

    expect(screen.getByText("TennisLevel experience survey")).toBeInTheDocument();
    expect(screen.getByText("Q1. How long have you been playing tennis?")).toBeInTheDocument();
    expect(screen.getByText("Q6. I think that I would like to use this system frequently")).toBeInTheDocument();
  });
});
