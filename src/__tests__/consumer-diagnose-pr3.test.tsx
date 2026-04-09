import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ScenarioQuestion, ScenarioState } from "@/types/scenario";

const {
  mockPush,
  mockReplace,
  mockPrefetch
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn()
}));

const mockSearchParams = new URLSearchParams();
const mockFetch = vi.fn();
const diagnoseProblemMock = vi.hoisted(() => vi.fn());
const prepareDiagnoseSubmissionMock = vi.hoisted(() => vi.fn());
const persistStudyArtifactMock = vi.hoisted(() => vi.fn(async () => undefined));
const updateLocalStudyProgressMock = vi.hoisted(() => vi.fn());

const mockAppShellContext = {
  activeSession: null,
  studyMode: false,
  environment: "testing" as "testing" | "production",
  language: "zh" as "zh" | "en",
  loading: false,
  canChangeLanguage: true,
  setLanguage: vi.fn(),
  syncStudySession: vi.fn()
};

const translationMap: Record<string, string> = {
  "assessment.loading": "加载中",
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

function createDiagnosisResult(input: string) {
  return {
    input,
    normalizedInput: input.toLowerCase(),
    matchedRuleId: "mock-rule",
    matchedKeywords: ["反手"],
    matchedSynonyms: [],
    matchScore: 6,
    confidence: "中等" as const,
    effortMode: "standard" as const,
    evidenceLevel: "medium" as const,
    needsNarrowing: false,
    narrowingPrompts: [],
    narrowingSuggestions: [],
    refusalReasonCodes: [],
    missingEvidenceSlots: [],
    primaryNextStep: "先把拍面稳定住",
    problemTag: "backhand-stability",
    category: ["groundstroke"],
    title: "先修正反手稳定性",
    summary: "这是一个需要先稳定击球结果的反手问题。",
    detailedSummary: "先用更稳定的触球和拍面控制把回球留在场内。",
    causes: ["击球结果不稳定。"],
    fixes: ["先把拍面稳定住"],
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

function createScenario(overrides: Partial<ScenarioState> = {}): ScenarioState {
  return {
    raw_user_input: "比赛里我反手老下网",
    language: "zh",
    stroke: "backhand",
    context: {
      session_type: "match",
      serve_variant: "unknown",
      pressure: "unknown",
      movement: "unknown",
      format: "unknown"
    },
    serve: {
      control_pattern: "unknown",
      mechanism_family: "unknown"
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
      frequency: "unknown"
    },
    subjective_feeling: {
      tight: false,
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
      "context.serve_variant": "unasked",
      "context.movement": "unasked",
      "outcome.primary_error": "answered",
      "serve.control_pattern": "unasked",
      "serve.mechanism_family": "unasked",
      "incoming_ball.depth": "unasked",
      "subjective_feeling.rushed": "unasked"
    },
    deep_progress: {
      deepReady: false,
      stoppedByCap: false,
      requiredRemaining: ["context.movement", "incoming_ball.depth", "subjective_feeling.rushed"],
      optionalRemaining: [],
      unresolvedRequiredBecauseOfSkip: [],
      unresolvedRequiredBecauseUnavailable: []
    },
    missing_slots: ["context.movement", "incoming_ball.depth", "subjective_feeling.rushed"],
    next_question_candidates: [],
    selected_next_question_id: null,
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

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => {
    throw new Error("consumer diagnose route should not depend on useStudy");
  }
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

vi.mock("@/lib/study/client", () => ({
  persistStudyArtifact: persistStudyArtifactMock
}));

vi.mock("@/lib/study/localData", async () => {
  const actual = await vi.importActual<typeof import("@/lib/study/localData")>("@/lib/study/localData");

  return {
    ...actual,
    readLocalDiagnosisSnapshot: vi.fn(() => null),
    writeLocalDiagnosisSnapshot: vi.fn(),
    updateLocalStudyProgress: updateLocalStudyProgressMock
  };
});

vi.mock("@/lib/intake/prepareDiagnoseSubmission", () => ({
  prepareDiagnoseSubmission: prepareDiagnoseSubmissionMock
}));

vi.mock("@/lib/diagnosis", () => ({
  diagnoseProblem: diagnoseProblemMock,
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
  getContentsByIds: () => [],
  getDiagnosisConfidenceLabel: () => "中等"
}));

async function loadDiagnosePage() {
  const module = await import("@/app/diagnose/page");
  return module.default;
}

describe("consumer diagnose PR3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockAppShellContext.activeSession = null;
    mockAppShellContext.studyMode = false;
    mockAppShellContext.loading = false;
    mockAppShellContext.environment = "testing";
    mockAppShellContext.language = "zh";
    global.fetch = mockFetch as typeof fetch;
    diagnoseProblemMock.mockImplementation((input: string) => createDiagnosisResult(input));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows no visible quick, standard, or deep mode controls in consumer diagnose", async () => {
    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("说一句你的问题")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "快速" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "标准" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "深入" })).not.toBeInTheDocument();
  });

  it("keeps the consumer diagnose route available even when study setup is pending", async () => {
    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("说一句你的问题")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });

  it("takes the direct diagnosis path when intake output is already sufficient", async () => {
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "direct_result",
      diagnosisInput: "比赛里我反手老下网。",
      extraction: null,
      scenario: createScenario({
        context: {
          session_type: "match",
          serve_variant: "unknown",
          pressure: "unknown",
          movement: "moving",
          format: "unknown"
        },
        incoming_ball: {
          depth: "deep",
          height: "unknown",
          pace: "unknown",
          spin: "unknown",
          direction: "unknown"
        },
        subjective_feeling: {
          tight: false,
          rushed: true,
          awkward: false,
          hesitant: false,
          nervous: false,
          late_contact: false,
          no_timing: false,
          other: []
        },
        deep_progress: {
          deepReady: true,
          stoppedByCap: false,
          requiredRemaining: [],
          optionalRemaining: [],
          unresolvedRequiredBecauseOfSkip: [],
          unresolvedRequiredBecauseUnavailable: []
        },
        missing_slots: []
      }),
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: true
    });

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "比赛里我反手老下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));

    await waitFor(() => {
      expect(diagnoseProblemMock).toHaveBeenCalledWith("比赛里我反手老下网。", expect.any(Object));
    });
    expect(screen.queryByText("这个问题更常出现在对手球比较深的时候吗？")).not.toBeInTheDocument();
    expect(await screen.findByText("先修正反手稳定性")).toBeInTheDocument();
  });

  it("takes the inline follow-up path when intake output is incomplete", async () => {
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "needs_followup",
      diagnosisInput: "比赛里我反手老下网。",
      extraction: null,
      scenario: createScenario(),
      selectedQuestion: createQuestion(),
      eligibleQuestions: [createQuestion()],
      missingSlots: ["context.movement", "incoming_ball.depth", "subjective_feeling.rushed"],
      done: false
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scenario: createScenario({
          context: {
            session_type: "match",
            serve_variant: "unknown",
            pressure: "unknown",
            movement: "moving",
            format: "unknown"
          },
          incoming_ball: {
            depth: "deep",
            height: "unknown",
            pace: "unknown",
            spin: "unknown",
            direction: "unknown"
          },
          subjective_feeling: {
            tight: false,
            rushed: true,
            awkward: false,
            hesitant: false,
            nervous: false,
            late_contact: false,
            no_timing: false,
            other: []
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
          asked_followup_ids: ["q_incoming_ball_depth"]
        }),
        missing_slots: [],
        eligible_questions: [],
        selected_question: null,
        done: true
      })
    } satisfies Partial<Response>);

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "比赛里我反手老下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));

    expect(await screen.findByText("这个问题更常出现在对手球比较深的时候吗？")).toBeInTheDocument();
    expect(screen.queryByText("先修正反手稳定性")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "深球更明显" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/scenario-reconstruction/answer-followup", expect.any(Object));
      expect(diagnoseProblemMock).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps the diagnosis result handing off to the existing plan flow", async () => {
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "direct_result",
      diagnosisInput: "比赛里我反手老下网。",
      extraction: null,
      scenario: createScenario(),
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: true
    });

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "比赛里我反手老下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));
    fireEvent.click(await screen.findByRole("button", { name: "展开看更多 ↓" }));

    const planLink = screen.getByText("根据这个问题生成 7 步训练计划").closest("a");

    expect(planLink?.getAttribute("href")).toContain("/plan?");
    expect(planLink?.getAttribute("href")).toContain("source=diagnosis");
    expect(planLink?.getAttribute("href")).toContain("problemTag=backhand-stability");
  });

  it("does not run study-only persistence on the consumer diagnose path by accident", async () => {
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "direct_result",
      diagnosisInput: "比赛里我反手老下网。",
      extraction: null,
      scenario: createScenario(),
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: true
    });

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "比赛里我反手老下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));

    await screen.findByText("先修正反手稳定性");

    await waitFor(() => {
      expect(persistStudyArtifactMock).not.toHaveBeenCalled();
      expect(updateLocalStudyProgressMock).not.toHaveBeenCalled();
    });
  });

  it("does not run study persistence even when a legacy study session still exists", async () => {
    mockAppShellContext.studyMode = true;
    mockAppShellContext.activeSession = {
      sessionId: "study_1",
      snapshotId: "snapshot_1",
      participantId: "P001",
      language: "zh"
    };
    prepareDiagnoseSubmissionMock.mockResolvedValueOnce({
      source: "structured_intake",
      decision: "direct_result",
      diagnosisInput: "比赛里我反手老下网。",
      extraction: null,
      scenario: createScenario(),
      selectedQuestion: null,
      eligibleQuestions: [],
      missingSlots: [],
      done: true
    });

    const DiagnosePage = await loadDiagnosePage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "比赛里我反手老下网" }
    });
    fireEvent.click(screen.getByRole("button", { name: "开始诊断" }));

    await screen.findByText("先修正反手稳定性");

    await waitFor(() => {
      expect(updateLocalStudyProgressMock).not.toHaveBeenCalled();
      expect(persistStudyArtifactMock).not.toHaveBeenCalled();
    });
  });
});
