import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { StudySession } from "@/types/study";
import zhDictionary from "@/lib/i18n/dictionaries/zh";

const useStudy = vi.fn();
const useI18n = vi.fn();
const useAuth = vi.fn();
const persistStudyArtifact = vi.fn();
const saveSurveyResponse = vi.fn();
const logEvent = vi.fn();
const PENDING_SURVEY_SESSION_KEY = "tennislevel_pending_survey_session";

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
    window.localStorage.clear();
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

  it("submits study survey responses with the participant ID collected at study end", async () => {
    useStudy.mockReturnValue({
      studyMode: false,
      session: null
    });
    window.localStorage.setItem(PENDING_SURVEY_SESSION_KEY, JSON.stringify({
      ...baseSession,
      participantId: "P042",
      sessionId: "survey_session_42",
      language: "zh",
      condition: "lang_zh"
    }));
    const SurveyPage = (await import("@/app/survey/page")).default;

    render(<SurveyPage />);

    for (let index = 6; index <= 19; index += 1) {
      fireEvent.click(screen.getAllByRole("button", { name: "5" })[index - 6]!);
    }
    const textareas = screen.getAllByPlaceholderText("请尽量具体描述你的想法");
    fireEvent.change(textareas[0]!, { target: { value: "诊断很清楚" } });
    fireEvent.change(textareas[1]!, { target: { value: "没有明显问题" } });
    fireEvent.change(textareas[2]!, { target: { value: "推荐理由" } });
    fireEvent.click(screen.getByRole("button", { name: "提交问卷" }));

    await waitFor(() => {
      expect(saveSurveyResponse).toHaveBeenCalled();
    });
    expect(saveSurveyResponse.mock.calls[0]?.[0]).toMatchObject({
      studyId: "sportshci_2026_no_video_v1",
      participantId: "P042",
      sessionId: "survey_session_42",
      studyMode: true,
      language: "zh",
      condition: "lang_zh",
      snapshotId: "2026-03-29-v1",
      snapshotSeed: "20260329",
      buildVersion: "2026-03-29-v1"
    });
    expect(persistStudyArtifact).not.toHaveBeenCalled();
  });
});
