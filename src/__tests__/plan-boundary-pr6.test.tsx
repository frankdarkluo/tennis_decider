import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const {
  mockPush,
  mockReplace,
  mockPrefetch,
  persistStudyArtifactMock,
  updateLocalStudyProgressMock,
  writeLocalStudyPlanDraftMock
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn(),
  persistStudyArtifactMock: vi.fn(async () => undefined),
  updateLocalStudyProgressMock: vi.fn(),
  writeLocalStudyPlanDraftMock: vi.fn()
}));

let mockSearchParams = new URLSearchParams("problemTag=backhand-stability&level=3.0&source=diagnosis");

const mockAppShellContext = {
  activeSession: null as null | { sessionId: string; snapshotId: string; participantId: string; language: "zh" | "en"; background?: { selfReportedLevel?: string | null } | null },
  studyMode: false,
  environment: "production" as const,
  language: "zh" as const,
  canChangeLanguage: true,
  loading: false,
  setLanguage: vi.fn(),
  syncStudySession: vi.fn()
};

const translations: Record<string, string> = {
  "plan.loading": "正在生成计划...",
  "plan.title": "你的 7 步提升计划",
  "plan.subtitle": "围绕同一个重点，按顺序一步一步练。",
  "plan.backDiagnosis": "回到诊断",
  "plan.backHome": "回到首页",
  "plan.supporting": "适合 {value} 水平",
  "plan.save": "保存计划",
  "plan.saving": "保存中",
  "plan.saved": "已保存",
  "plan.regenerate": "换一个版本",
  "plan.later": "后续步骤",
  "plan.saveRecorded": "研究记录已保存",
  "plan.saveAlreadyRecorded": "该计划已记录到研究会话",
  "plan.nextDiagnose": "继续诊断",
  "plan.openProfile": "打开我的记录",
  "plan.empty": "还没有训练计划",
  "plan.assessment": "去做水平评估",
  "plan.diagnose": "先去诊断"
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
  }),
  useSearchParams: () => mockSearchParams
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    configured: false
  })
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: vi.fn()
  })
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => mockAppShellContext
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => {
    throw new Error("consumer plan route should not depend on useStudy");
  }
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: mockAppShellContext.language,
    t: (key: string, replacements?: Record<string, string | number>) => {
      const template = translations[key] ?? key;
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
  saveGeneratedPlan: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/study/client", () => ({
  persistStudyArtifact: persistStudyArtifactMock
}));

vi.mock("@/lib/study/localData", () => ({
  readLocalStudyPlanDraft: vi.fn(() => null),
  updateLocalStudyProgress: updateLocalStudyProgressMock,
  writeLocalStudyPlanDraft: writeLocalStudyPlanDraftMock
}));

vi.mock("@/lib/study/snapshot", () => ({
  getStudySnapshot: () => ({
    planTemplateVersion: "study-snapshot-v1"
  })
}));

vi.mock("@/lib/study/privacy", () => ({
  sanitizePlanArtifact: vi.fn((plan: unknown) => plan)
}));

vi.mock("@/lib/diagnose/enrichedContext", () => ({
  parseEnrichedDiagnosisContext: vi.fn(() => null)
}));

vi.mock("@/lib/plans", () => ({
  buildPlanHref: vi.fn(() => "/plan?problemTag=backhand-stability&level=3.0&source=diagnosis"),
  getAssessmentPlanFocusLine: vi.fn(() => null),
  getPlanTemplate: vi.fn(() => ({
    title: "你的 7 步提升计划",
    problemTag: "backhand-stability",
    level: "3.0",
    target: "先修正反手稳定性",
    summary: "围绕反手稳定性按顺序练 7 步。",
    days: [
      { day: 1, title: "Step 1" },
      { day: 2, title: "Step 2" }
    ]
  })),
  normalizePlanDraftSnapshot: vi.fn(() => null),
  parsePlanContentIds: vi.fn(() => []),
  parsePlanContext: vi.fn(() => null)
}));

vi.mock("@/components/plan/PlanSummary", () => ({
  PlanSummary: ({ headline }: { headline: string }) => React.createElement("div", null, headline)
}));

vi.mock("@/components/plan/DayPlanCard", () => ({
  DayPlanCard: ({ day }: { day: { day: number; title: string } }) =>
    React.createElement("div", { "data-testid": `day-${day.day}` }, day.title)
}));

async function loadPlanPage() {
  const module = await import("@/app/plan/page");
  return module.default;
}

describe("plan boundary PR6", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    mockSearchParams = new URLSearchParams("problemTag=backhand-stability&level=3.0&source=diagnosis");
    mockAppShellContext.activeSession = null;
    mockAppShellContext.studyMode = false;
    mockAppShellContext.loading = false;
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the consumer plan route accessible even when study setup is still pending", async () => {
    const PlanPage = await loadPlanPage();

    render(React.createElement(PlanPage));

    expect(await screen.findByText("你的 7 步提升计划")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });

  it("does not run study-only persistence on the consumer plan path by accident", async () => {
    const PlanPage = await loadPlanPage();

    render(React.createElement(PlanPage));

    await screen.findByText("你的 7 步提升计划");

    await waitFor(() => {
      expect(persistStudyArtifactMock).not.toHaveBeenCalled();
      expect(updateLocalStudyProgressMock).not.toHaveBeenCalled();
      expect(writeLocalStudyPlanDraftMock).not.toHaveBeenCalled();
    });
  });

  it("does not run study persistence even when a legacy study session still exists on the plan route", async () => {
    mockAppShellContext.studyMode = true;
    mockAppShellContext.activeSession = {
      sessionId: "study_1",
      snapshotId: "snapshot_1",
      participantId: "P001",
      language: "zh"
    };
    const PlanPage = await loadPlanPage();

    render(React.createElement(PlanPage));

    await screen.findByText("你的 7 步提升计划");

    await waitFor(() => {
      expect(updateLocalStudyProgressMock).not.toHaveBeenCalled();
      expect(persistStudyArtifactMock).not.toHaveBeenCalled();
      expect(writeLocalStudyPlanDraftMock).not.toHaveBeenCalled();
    });
  });

  it("still derives the legacy background level through the neutral app-shell session boundary", async () => {
    mockAppShellContext.studyMode = true;
    mockAppShellContext.activeSession = {
      sessionId: "study_1",
      snapshotId: "snapshot_1",
      participantId: "P001",
      language: "zh",
      background: { selfReportedLevel: "4.0" }
    };
    mockSearchParams = new URLSearchParams("problemTag=backhand-stability&source=diagnosis");
    const PlanPage = await loadPlanPage();

    render(React.createElement(PlanPage));

    await screen.findByText("你的 7 步提升计划");

    const plans = await import("@/lib/plans");
    expect(vi.mocked(plans.getPlanTemplate)).toHaveBeenCalledWith(
      "backhand-stability",
      "4.0",
      "zh",
      [],
      expect.objectContaining({ environment: "production" })
    );
  });
});
