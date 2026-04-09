import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const {
  readLocalStudyArtifactsMock,
  readLocalStudyBookmarksMock,
  readLocalStudyProgressMock
} = vi.hoisted(() => ({
  readLocalStudyArtifactsMock: vi.fn(() => []),
  readLocalStudyBookmarksMock: vi.fn(() => ({ contentIds: [], updatedAt: new Date(0).toISOString() })),
  readLocalStudyProgressMock: vi.fn(() => null)
}));

const mockStudyContext = {
  session: null as null | {
    sessionId: string;
    snapshotId: string;
    participantId: string;
    language: "zh" | "en";
    buildVersion?: string;
  },
  studyMode: false
};

const mockAuthState = {
  user: null as null | { id: string; email: string },
  configured: false,
  loading: false
};

const translations: Record<string, string> = {
  "profile.backHome": "回到首页",
  "profile.title": "我的记录",
  "profile.loginTitle": "登录后查看你的记录",
  "profile.loginSubtitle": "评估、诊断、收藏和训练计划都会保存在这里。",
  "profile.loginButton": "登录",
  "plan.backHome": "回到首页",
  "profile.headerSubtitle": "把你的评估结果、诊断记录、收藏和训练计划都集中放在这里。",
  "profile.notAssessed": "还没测评",
  "profile.studyQuickContinue": "继续上次练习",
  "profile.studyQuickContinueHint": "从你上次停下来的地方继续。",
  "profile.studyQuickPlan": "回看训练计划",
  "profile.studyQuickPlanHint": "直接回到最近一次保存的计划。",
  "profile.studyQuickDiagnosis": "回看上次诊断",
  "profile.studyQuickDiagnosisHint": "带着原问题回到诊断页。",
  "profile.studyQuickEmpty": "还没有可继续的记录。",
  "profile.assessment.title": "最近一次水平评估",
  "profile.assessment.emptyDescription": "先做一次评估，我们会把结果和推荐内容留在这里。",
  "profile.diagnosis.title": "诊断记录",
  "profile.diagnosis.emptyDescription": "还没有保存的诊断记录。",
  "profile.bookmarks.title": "收藏",
  "profile.bookmarks.emptyDescription": "还没有收藏内容。",
  "profile.plans.title": "保存的训练计划",
  "profile.plans.emptyDescription": "还没有保存的训练计划。",
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

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: vi.fn()
  })
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => mockStudyContext
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
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

vi.mock("@/lib/study/localData", () => ({
  readLocalStudyArtifacts: readLocalStudyArtifactsMock,
  readLocalStudyBookmarks: readLocalStudyBookmarksMock,
  readLocalStudyProgress: readLocalStudyProgressMock
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: vi.fn(async () => ({ data: null })),
  getDiagnosisHistory: vi.fn(async () => ({ data: [] })),
  getSavedPlans: vi.fn(async () => ({ data: [] })),
  getVideoDiagnosisHistory: vi.fn(async () => ({ data: [] })),
  getBookmarkedContentIds: vi.fn(async () => ({ data: [] })),
  removeBookmark: vi.fn(async () => ({ error: null }))
}));

async function loadProfilePage() {
  const module = await import("@/app/profile/page");
  return module.default;
}

describe("profile boundary cleanup", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockStudyContext.studyMode = false;
    mockStudyContext.session = null;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the profile route in login state even when a legacy study session exists", async () => {
    mockStudyContext.studyMode = true;
    mockStudyContext.session = {
      sessionId: "study_1",
      snapshotId: "snapshot_1",
      participantId: "P001",
      language: "zh",
      buildVersion: "build-1"
    };
    const ProfilePage = await loadProfilePage();

    render(React.createElement(ProfilePage));

    expect(screen.getByText("登录后查看你的记录")).toBeInTheDocument();
    expect(screen.queryByText("当前研究会话")).not.toBeInTheDocument();
    expect(readLocalStudyArtifactsMock).not.toHaveBeenCalled();
    expect(readLocalStudyBookmarksMock).not.toHaveBeenCalled();
    expect(readLocalStudyProgressMock).not.toHaveBeenCalled();
  });

  it("keeps the authenticated profile route on consumer records even when legacy study state exists", async () => {
    mockStudyContext.studyMode = true;
    mockStudyContext.session = {
      sessionId: "study_1",
      snapshotId: "snapshot_1",
      participantId: "P001",
      language: "zh",
      buildVersion: "build-1"
    };
    mockAuthState.user = { id: "user_1", email: "player@example.com" };
    mockAuthState.configured = true;
    const ProfilePage = await loadProfilePage();

    render(React.createElement(ProfilePage));

    await waitFor(() => {
      expect(screen.getByText("最近一次水平评估")).toBeInTheDocument();
    });

    expect(screen.queryByText("当前研究会话")).not.toBeInTheDocument();
    expect(screen.getByText("继续上次练习")).toBeInTheDocument();
    expect(screen.getByText("保存的训练计划")).toBeInTheDocument();
    expect(readLocalStudyArtifactsMock).not.toHaveBeenCalled();
    expect(readLocalStudyBookmarksMock).not.toHaveBeenCalled();
    expect(readLocalStudyProgressMock).not.toHaveBeenCalled();
  });
});
