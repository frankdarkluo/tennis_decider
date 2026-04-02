import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { StudySession } from "@/types/study";
import zhDictionary from "@/lib/i18n/dictionaries/zh";

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
        return (zhDictionary as Record<string, string>)[key] ?? key;
      }
    });
    persistStudyArtifact.mockResolvedValue({ artifact: { id: "artifact_1" } });
    saveSurveyResponse.mockResolvedValue({});
    logEvent.mockReset();
  });

  it("renders the updated survey structure and English question set during an English study session", async () => {
    const SurveyPage = (await import("@/app/survey/page")).default;

    render(<SurveyPage />);

    expect(screen.getByText("TennisLevel experience survey")).toBeInTheDocument();
    expect(screen.queryByText("Part 1: Background")).not.toBeInTheDocument();
    expect(screen.queryByText("How long have you been playing tennis?")).not.toBeInTheDocument();
    expect(screen.getByText(/Part 1: SUS(?: usability scale)?/)).toBeInTheDocument();
    expect(screen.getByText("The coach's reasoning made me more confident these recommendations were suitable for me")).toBeInTheDocument();
    expect(screen.getByText("What information or feature most influences your confidence in the recommendations?")).toBeInTheDocument();
    expect(screen.queryByText("I would recommend this tool to my tennis friends")).not.toBeInTheDocument();
  });
});
