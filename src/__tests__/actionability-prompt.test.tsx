import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { StudySession } from "@/types/study";

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
        const table: Record<string, string> = {
          "study.actionability.title": "任务完成后的单题",
          "study.actionability.prompt": "完成这个任务后，我知道我下一步该练什么了。",
          "study.actionability.scale.min": "非常不同意",
          "study.actionability.scale.max": "非常同意",
          "study.actionability.submit": "提交评分"
        };
        return table[key] ?? key;
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

    expect(await screen.findByText("完成这个任务后，我知道我下一步该练什么了。")).toBeInTheDocument();
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
        const table: Record<string, string> = {
          "study.actionability.title": "One quick question after the task",
          "study.actionability.prompt": "After this task, I know what to practise next.",
          "study.actionability.scale.min": "Strongly disagree",
          "study.actionability.scale.max": "Strongly agree",
          "study.actionability.submit": "Submit rating"
        };
        return table[key] ?? key;
      }
    });

    const { ActionabilityPrompt } = await import("@/components/study/ActionabilityPrompt");

    render(React.createElement(ActionabilityPrompt, { taskId: "task_2_assessment_entry" }));

    expect(await screen.findByText("After this task, I know what to practise next.")).toBeInTheDocument();
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
