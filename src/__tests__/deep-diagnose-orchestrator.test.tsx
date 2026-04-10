import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

const {
  mockPush,
  mockReplace,
  mockSearchParams
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockSearchParams: new URLSearchParams()
}));

const mockFetch = vi.fn();
const prepareDiagnoseSubmissionMock = vi.hoisted(() => vi.fn());
const diagnoseProblemMock = vi.hoisted(() => vi.fn());
const mockAppShellContext = {
  environment: "testing" as "testing" | "production",
  language: "zh" as "zh" | "en",
  loading: false,
  canChangeLanguage: true,
  setLanguage: vi.fn()
};

const translationMap: Record<string, string> = {
  "assessment.loading": "加载中",
  "diagnose.title": "说一句你的问题",
  "diagnose.subtitle": "具体说出动作、错误和场景，我来帮你判断先改什么。",
  "diagnose.placeholder": "例如：我反手总下网，一快就更容易失误",
  "diagnose.quickTags": "示例",
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

function createScenario(overrides: Partial<ScenarioState> = {}): ScenarioState {
  return {
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
    serve: {
      control_pattern: "net",
      mechanism_family: "rhythm"
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
      "serve.control_pattern": "answered",
      "serve.mechanism_family": "answered",
      "incoming_ball.depth": "unasked",
      "subjective_feeling.rushed": "answered"
    },
    deep_progress: {
      deepReady: false,
      stoppedByCap: false,
      requiredRemaining: ["incoming_ball.depth"],
      optionalRemaining: [],
      unresolvedRequiredBecauseOfSkip: [],
      unresolvedRequiredBecauseUnavailable: []
    },
    missing_slots: ["incoming_ball.depth"],
    next_question_candidates: ["q_incoming_ball_depth"],
    selected_next_question_id: "q_incoming_ball_depth",
    asked_followup_ids: [],
    ...overrides
  };
}

function createQuestion(overrides: Partial<ScenarioQuestion> = {}): ScenarioQuestion {
  return {
    id: "q_incoming_ball_depth",
    family: "incoming_ball_depth",
    category: "scenario_localization",
    target_slots: ["incoming_ball.depth"],
    fillsSlots: ["incoming_ball.depth"],
    priority: 70,
    zh: "这个问题更常出现在对手球比较深的时候吗？",
    en: "Does this happen more when the incoming ball is deeper?",
    ask_when: [],
    do_not_ask_when: [],
    information_gain_weight: 0.8,
    presupposition_risk: 0.28,
    easy_to_answer_score: 0.82,
    options: [
      { key: "deep", zh: "深球更明显", en: "More on deep balls" }
    ],
    ...overrides
  };
}

function createDiagnosisResult(input: string) {
  return {
    input,
    normalizedInput: input.toLowerCase(),
    matchedRuleId: "rule_second_serve_net",
    matchedKeywords: ["二发"],
    matchedSynonyms: [],
    matchScore: 8,
    confidence: "中等" as const,
    effortMode: "standard" as const,
    evidenceLevel: "medium" as const,
    needsNarrowing: false,
    narrowingPrompts: [],
    narrowingSuggestions: [],
    refusalReasonCodes: [],
    missingEvidenceSlots: [],
    primaryNextStep: "先把二发节奏稳定住",
    problemTag: "second-serve-net",
    category: ["serve"],
    title: "先修正二发稳定性",
    summary: "关键分里先保住二发弧线和节奏。",
    detailedSummary: "场景已经收敛到关键分二发下网，先做稳定弧线和节奏，不要再追求压线。",
    causes: ["关键分时节奏变紧。"],
    fixes: ["先把二发节奏稳定住"],
    drills: [],
    recommendedContents: [],
    searchQueries: null,
    fallbackUsed: false,
    fallbackMode: null,
    level: "3.0",
    enrichedContext: null,
    categoryConsistency: "ungated" as const,
    categoryConflict: null
  };
}

function seedCompletedAssessmentInStorage() {
  window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({
    answeredCount: 6,
    totalQuestions: 6,
    level: "3.0"
  }));
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

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => mockAppShellContext
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: mockAppShellContext.language,
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

vi.mock("@/lib/intake/prepareDiagnoseSubmission", () => ({
  prepareDiagnoseSubmission: prepareDiagnoseSubmissionMock
}));

vi.mock("@/lib/diagnosis", () => ({
  diagnoseProblem: diagnoseProblemMock,
  getContentsByIds: () => [],
  getDefaultDiagnosisResult: () => ({
    input: "",
    normalizedInput: "",
    matchedRuleId: null,
    matchedKeywords: [],
    matchedSynonyms: [],
    matchScore: 0,
    confidence: "较低" as const,
    effortMode: "standard" as const,
    evidenceLevel: "low" as const,
    needsNarrowing: false,
    narrowingPrompts: [],
    narrowingSuggestions: [],
    refusalReasonCodes: [],
    missingEvidenceSlots: [],
    primaryNextStep: "",
    problemTag: "",
    category: [],
    title: "",
    summary: "",
    detailedSummary: null,
    causes: [],
    fixes: [],
    drills: [],
    recommendedContents: [],
    searchQueries: null,
    fallbackUsed: false,
    fallbackMode: null,
    level: "3.0",
    enrichedContext: null,
    categoryConsistency: "ungated" as const,
    categoryConflict: null
  }),
  getProblemPreviewOptions: () => [
    { label: "反手总下网", label_en: "Backhand into net" }
  ],
  getDiagnosisConfidenceLabel: () => "中等"
}));

async function loadDiagnosePage() {
  const module = await import("@/app/diagnose/page");
  return module.default;
}

describe("deep diagnose orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    window.localStorage.clear();
    window.sessionStorage.clear();
    seedCompletedAssessmentInStorage();
    global.fetch = mockFetch as typeof fetch;
    diagnoseProblemMock.mockImplementation((input: string) => createDiagnosisResult(input));
    mockSearchParams.delete("mode");
    mockSearchParams.delete("q");
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the consumer diagnose route free of legacy deep mode controls", async () => {
    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("说一句你的问题")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "快速" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "标准" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "深入" })).not.toBeInTheDocument();
    expect(screen.queryByText("场景还原")).not.toBeInTheDocument();
  });

  it("hydrates the complaint text from q and starts inline follow-up when intake needs one more clue", async () => {
    mockSearchParams.set("q", "关键分时我的二发容易下网");
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "needs_followup",
      diagnosisInput: "关键分时我的二发容易下网。",
      extraction: null,
      scenario: createScenario(),
      selectedQuestion: createQuestion(),
      eligibleQuestions: [createQuestion()],
      missingSlots: ["incoming_ball.depth"],
      done: false
    });

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    expect(await screen.findByDisplayValue("关键分时我的二发容易下网")).toBeInTheDocument();
    expect(await screen.findByText("再补一条关键线索后再锁定诊断")).toBeInTheDocument();
    expect(screen.getByText("这个问题更常出现在对手球比较深的时候吗？")).toBeInTheDocument();
    expect(screen.queryByText("先修正二发稳定性")).not.toBeInTheDocument();
  });

  it("keeps follow-up inside /diagnose and applies the result without navigating away", async () => {
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "needs_followup",
      diagnosisInput: "关键分时我的二发容易下网。",
      extraction: null,
      scenario: createScenario(),
      selectedQuestion: createQuestion(),
      eligibleQuestions: [createQuestion()],
      missingSlots: ["incoming_ball.depth"],
      done: false
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scenario: createScenario({
          incoming_ball: {
            depth: "deep",
            height: "unknown",
            pace: "unknown",
            spin: "unknown",
            direction: "unknown"
          },
          deep_progress: {
            deepReady: true,
            stoppedByCap: false,
            requiredRemaining: [],
            optionalRemaining: [],
            unresolvedRequiredBecauseOfSkip: [],
            unresolvedRequiredBecauseUnavailable: []
          },
          missing_slots: [],
          next_question_candidates: [],
          selected_next_question_id: null,
          asked_followup_ids: ["q_incoming_ball_depth"]
        }),
        selected_question: null
      })
    } satisfies Partial<Response>);

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "关键分时我的二发容易下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));

    expect(await screen.findByText("这个问题更常出现在对手球比较深的时候吗？")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "深球更明显" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/scenario-reconstruction/answer-followup", expect.any(Object));
      expect(diagnoseProblemMock).toHaveBeenCalledTimes(1);
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(await screen.findByText("先修正二发稳定性")).toBeInTheDocument();
  });

  it("clears stale inline follow-up state when the complaint text changes before answer submission", async () => {
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "needs_followup",
      diagnosisInput: "关键分时我的二发容易下网。",
      extraction: null,
      scenario: createScenario(),
      selectedQuestion: createQuestion(),
      eligibleQuestions: [createQuestion()],
      missingSlots: ["incoming_ball.depth"],
      done: false
    });

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "关键分时我的二发容易下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));

    expect(await screen.findByText("这个问题更常出现在对手球比较深的时候吗？")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/我反手总下网/), {
      target: { value: "比赛里我正手老出界" }
    });

    await waitFor(() => {
      expect(screen.queryByText("这个问题更常出现在对手球比较深的时候吗？")).not.toBeInTheDocument();
    });
    expect(diagnoseProblemMock).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("比赛里我正手老出界")).toBeInTheDocument();
  });
});
