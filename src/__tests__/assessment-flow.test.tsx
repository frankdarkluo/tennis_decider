import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { calculateAssessmentResult } from "@/lib/assessment";
import { ResultSummary } from "@/components/assessment/ResultSummary";

const { mockPush, mockReplace, mockPrefetch } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn()
}));

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch
  })
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
    language: "zh",
    studyMode: false,
    canChangeLanguage: true,
    setLanguage: vi.fn(),
    t: (key: string, replacements?: Record<string, string | number>) => {
      const template = translationMap[key] ?? key;
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
    window.localStorage.clear();
    window.history.pushState({}, "", "/assessment");
    mockPush.mockReset();
    mockReplace.mockReset();
    mockPrefetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("starts the active assessment flow without the gender step", async () => {
    const AssessmentPage = (await import("@/app/assessment/page")).default;

    render(React.createElement(AssessmentPage));

    expect(await screen.findByText("日常练习中，你通常能连续对打多少拍？")).toBeInTheDocument();
    expect(screen.queryByText("你的性别？")).not.toBeInTheDocument();
    expect(screen.queryByText("打了多久网球？")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/assessment/result");
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
});
