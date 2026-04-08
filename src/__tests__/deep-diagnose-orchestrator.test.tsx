import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ASSESSMENT_STORAGE_KEY } from "@/lib/utils";

const { mockPush, mockReplace, mockSearchParams } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockSearchParams: new URLSearchParams()
}));

const mockFetch = vi.fn();
const mockStudyContext = {
  session: null,
  studyMode: false,
  environment: "testing" as "testing" | "production",
  language: "zh" as "zh" | "en",
  pendingStudySetup: false,
  loading: false,
  startStudySession: vi.fn(),
  setPendingStudySetup: vi.fn(),
  endStudySession: vi.fn(),
  clearStudyData: vi.fn()
};

const translationMap: Record<string, string> = {
  "assessment.loading": "加载中",
  "assessment.empty.title": "先完成一次水平评估",
  "assessment.empty.subtitle": "先评估再诊断",
  "assessment.result.ctaStart": "去完成水平评估 →",
  "diagnose.title": "说一句你的问题",
  "diagnose.subtitle": "具体说出动作、错误和场景，我来帮你判断先改什么。",
  "diagnose.placeholder": "例如：我反手总下网，一快就更容易失误",
  "diagnose.quickTags": "示例",
  "diagnose.mode.label": "诊断深度",
  "diagnose.mode.quick": "快速",
  "diagnose.mode.standard": "标准",
  "diagnose.mode.deep": "深入",
  "diagnose.button.start": "开始诊断",
  "diagnose.button.clear": "清空",
  "diagnose.result.badge": "你的问题是：",
  "diagnose.result.today": "今天先记住一件事：",
  "diagnose.result.expand1": "展开看更多 ↓",
  "diagnose.result.why": "为什么会这样",
  "diagnose.result.featured": "先看这个",
  "diagnose.result.plan": "根据这个问题生成 7 步训练计划",
  "diagnose.result.library": "去内容库找更多练习",
  "diagnose.result.rankings": "去博主榜找适合的人"
};

function t(key: string, replacements?: Record<string, string | number>) {
  const template = translationMap[key] ?? key;
  if (!replacements) {
    return template;
  }

  return Object.entries(replacements).reduce((current, [token, value]) => {
    return current.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
  }, template);
}

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
    prefetch: vi.fn()
  }),
  useSearchParams: () => mockSearchParams
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    configured: false,
    loading: false
  })
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => mockStudyContext
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: mockStudyContext.language,
    t
  })
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: vi.fn(async () => ({ data: null, error: null })),
  saveDiagnosisHistory: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

function seedCompletedAssessmentInStorage() {
  window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({
    answeredCount: 6,
    totalQuestions: 6,
    level: "3.0"
  }));
}

async function loadDiagnosePage() {
  const module = await import("@/app/diagnose/page");
  return module.default;
}

describe("deep diagnose orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    seedCompletedAssessmentInStorage();
    global.fetch = mockFetch as typeof fetch;
    mockSearchParams.delete("mode");
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the inline deep module only in deep mode", async () => {
    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("说一句你的问题")).toBeInTheDocument();
    expect(screen.queryByText("场景还原")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "深入" }));

    expect(screen.getByText("场景还原")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始场景还原" })).toBeInTheDocument();
  });

  it("hydrates deep mode from the route query", async () => {
    mockSearchParams.set("mode", "deep");

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("说一句你的问题")).toBeInTheDocument();
    expect(screen.getByText("场景还原")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始场景还原" })).toBeInTheDocument();
  });

  it("keeps deep reconstruction inside /diagnose and resets cleanly when leaving deep mode", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scenario: {
          raw_user_input: "关键分时我的二发容易下网",
          language: "zh",
          stroke: "serve",
          context: {
            session_type: "match",
            serve_variant: "second_serve",
            pressure: "high",
            movement: "stationary",
            format: "unknown"
          },
          incoming_ball: {
            depth: "unknown",
            height: "unknown",
            pace: "unknown",
            spin: "unknown",
            direction: "unknown"
          },
          outcome: {
            primary_error: "net",
            frequency: "often"
          },
          subjective_feeling: {
            tight: true,
            rushed: false,
            awkward: false,
            hesitant: false,
            nervous: false,
            late_contact: false,
            no_timing: false,
            other: []
          },
          user_confidence: "medium",
          slot_resolution: {
            stroke: "answered",
            "context.session_type": "answered",
            "context.serve_variant": "answered",
            "context.movement": "answered",
            "outcome.primary_error": "answered",
            "incoming_ball.depth": "unasked",
            "subjective_feeling.rushed": "answered"
          },
          deep_progress: {
            deepReady: true,
            stoppedByCap: false,
            requiredRemaining: [],
            optionalRemaining: ["incoming_ball.depth"],
            unresolvedRequiredBecauseOfSkip: [],
            unresolvedRequiredBecauseUnavailable: []
          },
          missing_slots: ["incoming_ball.depth"],
          next_question_candidates: [],
          selected_next_question_id: null,
          asked_followup_ids: []
        },
        missing_slots: ["incoming_ball.depth"],
        eligible_questions: [],
        selected_question: null,
        done: true
      })
    } satisfies Partial<Response>);

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "关键分时我的二发容易下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "深入" }));
    fireEvent.click(screen.getByRole("button", { name: "开始场景还原" }));

    expect(await screen.findByText("当前场景已经补全到可进入深入分析。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "进入后续分析" }));

    await waitFor(() => {
      expect(screen.getAllByText("深入模式").length).toBeGreaterThan(0);
      expect(screen.getAllByText("场景还原").length).toBeGreaterThan(0);
      expect(screen.getByText("场景证据诊断")).toBeInTheDocument();
      expect(screen.getByText("二发稳定性不足")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByText("正手控制不足")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "标准" }));
    fireEvent.click(screen.getByRole("button", { name: "深入" }));

    expect(screen.queryByText("当前场景已经补全到可进入深入分析。")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始场景还原" })).toBeInTheDocument();
  });
});
