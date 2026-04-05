import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { calculateAssessmentResult } from "@/lib/assessment";
import { normalizeDraftStepIndex } from "@/lib/assessmentDraft";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { ASSESSMENT_DRAFT_STORAGE_KEY } from "@/lib/utils";

const { mockPush, mockReplace, mockPrefetch, mockRouter } = vi.hoisted(() => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();
  const mockPrefetch = vi.fn();

  return {
    mockPush,
    mockReplace,
    mockPrefetch,
    mockRouter: {
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch
    }
  };
});

let mockLanguage: "zh" | "en" = "zh";

const translationMap = {
  "assessment.title": "1 分钟测一下你的水平",
  "assessment.subtitle": "答几个小问题，先给你一个区间。",
  "assessment.loading": "正在同步你的评估记录...",
  "assessment.resumeDraft": "",
  "assessment.question.profile": "",
  "assessment.question.coarse": "核心评估",
  "assessment.question.fine": "继续了解一下",
  "assessment.question.slider": "再补一个背景信息",
  "assessment.progress.almostDone": "快完成了",
  "assessment.tapToContinue": "点一下就继续",
  "assessment.previous": "上一步",
  "assessment.empty.title": "先完成一次水平评估",
  "assessment.empty.subtitle": "做完后，我们会直接告诉你大概处在哪个能力区间，以及接下来更值得优先补哪一块。",
  "assessment.result.headline": "你的能力区间接近",
  "assessment.result.summary": "这次结果怎么读",
  "assessment.result.weaknesses": "优先补强",
  "assessment.result.observationNeeded": "继续观察",
  "assessment.result.noObservationNeeded": "目前没有额外待观察项。",
  "assessment.result.skillBreakdown": "分项能力",
  "assessment.result.skillBreakdownHint": "每个维度会落在薄弱、待提升、正常或强项四档。"
} satisfies Record<string, string>;

const translationMapEn = {
  "assessment.title": "A 1-minute read on your level",
  "assessment.subtitle": "Answer a short ladder and we will show your current range plus the next area worth improving.",
  "assessment.loading": "Syncing your assessment record...",
  "assessment.resumeDraft": "",
  "assessment.question.profile": "",
  "assessment.question.coarse": "Quick level read",
  "assessment.question.fine": "Narrow the next step",
  "assessment.question.slider": "One more background detail",
  "assessment.progress.almostDone": "Almost there",
  "assessment.tapToContinue": "Tap once to continue",
  "assessment.previous": "Back",
  "assessment.empty.title": "Complete one level assessment first",
  "assessment.empty.subtitle": "After that, we will tell you roughly where you are and what is worth improving first.",
  "assessment.result.headline": "Your current range is close to",
  "assessment.result.summary": "How to read this result",
  "assessment.result.weaknesses": "Priority gaps",
  "assessment.result.noWeaknesses": "No clear weak tier surfaced in this pass. Use the watch list as your next checkpoint.",
  "assessment.result.observationNeeded": "Watch next",
  "assessment.result.noObservationNeeded": "No extra watch areas surfaced right now.",
  "assessment.result.skillBreakdown": "Skill breakdown",
  "assessment.result.skillBreakdownHint": "Each area is tagged as weak, needs work, normal, or strength."
} satisfies Record<string, string>;

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    configured: false,
    loading: false
  })
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => ({
    environment: null,
    session: null,
    studyMode: false,
    pendingStudySetup: false
  })
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: mockLanguage,
    studyMode: false,
    canChangeLanguage: true,
    setLanguage: vi.fn(),
    t: (key: string, replacements?: Record<string, string | number>) => {
      const template = (mockLanguage === "en" ? translationMapEn : translationMap)[key] ?? key;
      if (!replacements) {
        return template;
      }

      return Object.entries(replacements).reduce((current, [token, value]) => {
        return current.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
      }, template);
    }
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/userData", () => ({
  saveAssessmentResult: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/study/client", () => ({
  persistStudyArtifact: vi.fn(async () => undefined)
}));

vi.mock("@/lib/study/localData", () => ({
  updateLocalStudyProgress: vi.fn()
}));

describe("assessment flow and result summary", () => {
  beforeEach(() => {
    cleanup();
    mockLanguage = "zh";
    window.localStorage.clear();
    window.history.pushState({}, "", "/assessment");
    mockPush.mockReset();
    mockReplace.mockReset();
    mockPrefetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("restores the last coarse step and advances into the first fine question with updated progress after gender removal", async () => {
    const { default: AssessmentPage } = await import("@/app/assessment/page");

    window.localStorage.setItem(ASSESSMENT_DRAFT_STORAGE_KEY, JSON.stringify({
      stepIndex: 4,
      answers: {
        coarse_rally: 1,
        coarse_serve: 1,
        coarse_movement: 1,
        coarse_awareness: 1
      },
      profile: {
        yearsPlaying: 2,
        yearsLabel: "2年"
      },
      updatedAt: "2026-04-05T00:00:00.000Z"
    }));

    const { container } = render(<AssessmentPage />);

    expect(await screen.findByText("比分紧张或练习加压时，你通常会怎样？")).toBeInTheDocument();
    expect(screen.queryByText("你的性别？")).not.toBeInTheDocument();
    expect(screen.queryByText("打了多久网球？")).not.toBeInTheDocument();
    expect((container.querySelector(".h-2.rounded-full.bg-brand-500.transition-all") as HTMLElement | null)?.style.width).toBe("56%");

    fireEvent.click(screen.getByRole("button", { name: "明显发紧，失误一下变多" }));

    expect(await screen.findByText("打球时你的握拍和准备动作？")).toBeInTheDocument();
    await waitFor(() => {
      expect((container.querySelector(".h-2.rounded-full.bg-brand-500.transition-all") as HTMLElement | null)?.style.width).toBe("67%");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("keeps current-flow draft steps unchanged when only default years fields are present", () => {
    const profileQuestions = assessmentQuestions.filter((question) => question.phase === "profile" && question.type !== "gender");

    expect(normalizeDraftStepIndex(
      4,
      {
        coarse_rally: 2,
        coarse_serve: 2,
        coarse_movement: 2,
        coarse_awareness: 2
      },
      profileQuestions
    )).toBe(4);
  });

  it("subtracts only the retired legacy profile steps from older drafts", () => {
    const profileQuestions = assessmentQuestions.filter((question) => question.phase === "profile" && question.type !== "gender");

    expect(normalizeDraftStepIndex(
      4,
      {
        coarse_rally: 2,
        coarse_serve: 2
      },
      profileQuestions
    )).toBe(2);
  });

  it("renders summary, weak areas, and watch areas from the calculated result model", () => {
    const result = calculateAssessmentResult({
      coarse_rally: 1,
      coarse_serve: 2,
      coarse_awareness: 4,
      coarse_movement: 4,
      coarse_pressure: 4
    }, assessmentQuestions);

    render(<ResultSummary result={result} />);

    expect(screen.getByText(result.summary)).toBeInTheDocument();
    const weaknessesCard = screen.getByText("优先补强").closest("div");
    const observationCard = screen.getByText("继续观察").closest("div");

    expect(weaknessesCard).not.toBeNull();
    expect(observationCard).not.toBeNull();
    expect(within(weaknessesCard as HTMLElement).getByText("对拉稳定性")).toBeInTheDocument();
    expect(within(observationCard as HTMLElement).getByText("发球")).toBeInTheDocument();
  });

  it("localizes the summary and breakdown labels into the active language", () => {
    mockLanguage = "en";

    const result = calculateAssessmentResult({
      coarse_rally: 1,
      coarse_serve: 2,
      coarse_awareness: 4,
      coarse_movement: 4,
      coarse_pressure: 4
    }, assessmentQuestions, undefined, "zh");

    render(<ResultSummary result={result} />);

    expect(screen.getByText("How to read this result")).toBeInTheDocument();
    expect(screen.getByText(/Your current level looks around 3\.5\./)).toBeInTheDocument();
    expect(screen.getAllByText("rally stability").length).toBeGreaterThan(0);
    expect(screen.getAllByText("serve").length).toBeGreaterThan(0);
    expect(screen.queryByText(result.summary)).not.toBeInTheDocument();
    expect(screen.queryByText("对拉稳定性")).not.toBeInTheDocument();
  });
});
