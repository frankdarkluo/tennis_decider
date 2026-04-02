import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { StudySession } from "@/types/study";
import enDictionary from "@/lib/i18n/dictionaries/en";
import zhDictionary from "@/lib/i18n/dictionaries/zh";

const logEvent = vi.fn();
const persistStudyTaskRating = vi.fn();
const useStudy = vi.fn();
const useI18n = vi.fn();
const usePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname()
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: (...args: unknown[]) => logEvent(...args)
}));

vi.mock("@/lib/study/taskRatings", () => ({
  persistStudyTaskRating: (...args: unknown[]) => persistStudyTaskRating(...args)
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => useStudy()
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => useI18n()
}));

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

describe("ActionabilityPrompt", () => {
  beforeEach(() => {
    logEvent.mockReset();
    persistStudyTaskRating.mockReset();
    usePathname.mockReturnValue("/study/actionability-preview");
    useStudy.mockReturnValue({ session: baseSession, studyMode: true, language: "zh" });
    useI18n.mockReturnValue({
      language: "zh",
      t: (key: string) => {
        return (zhDictionary as Record<string, string>)[key] ?? key;
      }
    });
    persistStudyTaskRating.mockResolvedValue({ rating: { score: 6 } });
  });

  it("logs the prompt view and submits the selected score", async () => {
    const { ActionabilityPrompt } = await import("@/components/study/ActionabilityPrompt");

    render(React.createElement(ActionabilityPrompt, {
      taskId: "task_1_problem_entry",
      onSubmitted: vi.fn()
    }));

    expect(await screen.findByText("完成这一步后，我比之前更清楚下一步该练什么了。")).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith(
      "task.actionability_prompt_viewed",
      expect.objectContaining({
        route: "/study/actionability-preview",
        taskId: "task_1_problem_entry",
        language: "zh"
      }),
      { page: "/study/actionability-preview" }
    );

    fireEvent.click(screen.getByRole("radio", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "提交评分" }));

    await waitFor(() => {
      expect(persistStudyTaskRating).toHaveBeenCalledWith(
        baseSession,
        expect.objectContaining({
          taskId: "task_1_problem_entry",
          score: 6,
          language: "zh"
        })
      );
    });

    expect(logEvent).toHaveBeenCalledWith(
      "task.actionability_submitted",
      expect.objectContaining({
        route: "/study/actionability-preview",
        taskId: "task_1_problem_entry",
        score: 6,
        language: "zh"
      }),
      { page: "/study/actionability-preview" }
    );
  });

  it("renders the English study prompt when the session language is English", async () => {
    useStudy.mockReturnValue({
      session: { ...baseSession, language: "en", condition: "lang_en" },
      studyMode: true,
      language: "en"
    });
    useI18n.mockReturnValue({
      language: "en",
      t: (key: string) => {
        return (enDictionary as Record<string, string>)[key] ?? key;
      }
    });

    const { ActionabilityPrompt } = await import("@/components/study/ActionabilityPrompt");

    render(React.createElement(ActionabilityPrompt, { taskId: "task_2_assessment_entry" }));

    expect(await screen.findByText("After this step, I am clearer than before about what I should practice next.")).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith(
      "task.actionability_prompt_viewed",
      expect.objectContaining({
        taskId: "task_2_assessment_entry",
        language: "en"
      }),
      { page: "/study/actionability-preview" }
    );
  });
});
