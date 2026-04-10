import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const mockAppShellContext = {
  loading: false
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

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => ({
    environment: "production" as const,
    loading: mockAppShellContext.loading,
    language: "zh" as const,
    canChangeLanguage: true,
    setLanguage: vi.fn(),
  })
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
    mockAppShellContext.loading = false;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the profile route in login state without any study-only side panels", async () => {
    const ProfilePage = await loadProfilePage();

    render(React.createElement(ProfilePage));

    expect(screen.getByText("登录后查看你的记录")).toBeInTheDocument();
    expect(screen.queryByText("当前研究会话")).not.toBeInTheDocument();
    expect(screen.queryByText("继续上次练习")).not.toBeInTheDocument();
    expect(screen.queryByText("回看训练计划")).not.toBeInTheDocument();
    expect(screen.queryByText("回看上次诊断")).not.toBeInTheDocument();
  });

  it("keeps the authenticated profile route focused on core records only", async () => {
    mockAuthState.user = { id: "user_1", email: "player@example.com" };
    mockAuthState.configured = true;
    const ProfilePage = await loadProfilePage();

    render(React.createElement(ProfilePage));

    await waitFor(() => {
      expect(screen.getByText("最近一次水平评估")).toBeInTheDocument();
    });

    expect(screen.queryByText("当前研究会话")).not.toBeInTheDocument();
    expect(screen.queryByText("继续上次练习")).not.toBeInTheDocument();
    expect(screen.queryByText("回看训练计划")).not.toBeInTheDocument();
    expect(screen.queryByText("回看上次诊断")).not.toBeInTheDocument();
    expect(screen.getByText("保存的训练计划")).toBeInTheDocument();
  });
});
