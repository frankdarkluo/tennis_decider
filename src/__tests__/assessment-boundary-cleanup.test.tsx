import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AssessmentResult } from "@/types/assessment";

const {
  mockPush,
  mockReplace,
  mockPrefetch,
  getLatestAssessmentResultMock,
  saveAssessmentResultMock
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn(),
  getLatestAssessmentResultMock: vi.fn(async () => ({ data: null, error: null })),
  saveAssessmentResultMock: vi.fn(async () => ({ error: null }))
}));

const mockAppShellContext = {
  environment: "production" as const,
  loading: false,
  language: "zh" as const,
  canChangeLanguage: true,
  setLanguage: vi.fn()
};

const mockAuthState = {
  user: null as null | { id: string },
  configured: false,
  loading: false
};

const translations: Record<string, string> = {
  "assessment.title": "1 分钟测一下你的水平",
  "assessment.subtitle": "答几个小问题，先给你一个区间。",
  "assessment.loading": "正在同步你的评估记录...",
  "assessment.question.profile": "背景信息",
  "assessment.question.coarse": "核心评估",
  "assessment.question.fine": "继续了解一下",
  "assessment.question.slider": "再补一个背景信息",
  "assessment.result.retry": "重新测评",
  "assessment.result.home": "回到首页"
};

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children)
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch
  })
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => mockAppShellContext
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
    t: (key: string) => translations[key] ?? key
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: getLatestAssessmentResultMock,
  saveAssessmentResult: saveAssessmentResultMock
}));

vi.mock("@/components/assessment/ResultSummary", () => ({
  ResultSummary: ({ result }: { result: AssessmentResult }) =>
    React.createElement("div", { "data-testid": "assessment-result-summary" }, `${result.level}:${result.answeredCount}`)
}));

async function loadAssessmentPage() {
  const module = await import("@/app/assessment/page");
  return module.default;
}

async function loadAssessmentResultPage() {
  const module = await import("@/app/assessment/result/page");
  return module.default;
}

describe("assessment boundary cleanup", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.localStorage.clear();
    window.history.pushState({}, "", "/assessment");
    mockAppShellContext.environment = "production";
    mockAppShellContext.loading = false;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
    getLatestAssessmentResultMock.mockResolvedValue({ data: null, error: null });
    saveAssessmentResultMock.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps /assessment accessible without legacy redirects", async () => {
    const AssessmentPage = await loadAssessmentPage();

    render(React.createElement(AssessmentPage));

    await waitFor(() => {
      expect(screen.queryByText("正在同步你的评估记录...")).not.toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });

  it("renders a locally saved assessment result on the consumer result page", async () => {
    window.history.pushState({}, "", "/assessment/result");
    window.localStorage.setItem("tennislevel-assessment-result", JSON.stringify({
      totalScore: 30,
      maxScore: 40,
      normalizedScore: 75,
      answeredCount: 6,
      uncertainCount: 0,
      totalQuestions: 6,
      level: "3.5",
      confidence: "中等",
      dimensions: [],
      strengths: [],
      weaknesses: [],
      observationNeeded: [],
      summary: "local result"
    }));
    const AssessmentResultPage = await loadAssessmentResultPage();

    render(React.createElement(AssessmentResultPage));

    expect(await screen.findByTestId("assessment-result-summary")).toHaveTextContent("3.5:6");
  });

  it("syncs assessment result through the consumer account path", async () => {
    mockAuthState.user = { id: "user_1" };
    mockAuthState.configured = true;
    getLatestAssessmentResultMock.mockResolvedValue({
      data: {
        totalScore: 30,
        maxScore: 40,
        normalizedScore: 75,
        answeredCount: 6,
        uncertainCount: 0,
        totalQuestions: 6,
        level: "3.5",
        confidence: "中等",
        dimensions: [],
        strengths: [],
        weaknesses: [],
        observationNeeded: [],
        summary: "remote result"
      },
      error: null
    });
    window.history.pushState({}, "", "/assessment/result");
    const AssessmentResultPage = await loadAssessmentResultPage();

    render(React.createElement(AssessmentResultPage));

    expect(await screen.findByTestId("assessment-result-summary")).toHaveTextContent("3.5:6");
    expect(getLatestAssessmentResultMock).toHaveBeenCalledWith("user_1");
  });
});
