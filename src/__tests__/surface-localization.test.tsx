import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nProvider } from "@/lib/i18n/config";
import { LoginModal } from "@/components/auth/LoginModal";
import { AuthCallbackCard } from "@/components/auth/AuthCallbackCard";
import { ContentCard } from "@/components/library/ContentCard";
import { CreatorDetailModal } from "@/components/rankings/CreatorDetailModal";
import ProfilePage from "@/app/profile/page";
import { VideoUploader } from "@/components/video/VideoUploader";
import { UsageMeter } from "@/components/video/UsageMeter";
import { PlatformVideoSearch } from "@/components/PlatformVideoSearch";
import { StudyBanner } from "@/components/study/StudyBanner";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import { Header } from "@/components/layout/Header";
import { getPlanTemplate } from "@/lib/plans";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import StudyEndPage from "@/app/study/end/page";
import StudyActionabilityPreviewPage from "@/app/study/actionability-preview/page";

const {
  mockPush,
  mockSearchParamsAdapter,
  mockStudyState,
  mockAuthState,
  mockAuthModalState,
  mockUserData,
  mockSupabase
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParamsAdapter: {
    get: vi.fn(() => null)
  },
  mockStudyState: {
    language: "en" as "zh" | "en",
    studyMode: false,
    session: null as null | {
      participantId: string;
      sessionId: string;
      snapshotId: string;
      buildVersion: string;
      language: "zh" | "en";
    },
    loading: false,
    canChangeLanguage: true,
    setLanguage: vi.fn(),
    startStudySession: vi.fn(),
    endStudySession: vi.fn(),
    clearStudyData: vi.fn()
  },
  mockAuthState: {
    user: null as null | { id: string; email?: string | null },
    loading: false,
    configured: false,
    sendMagicLink: vi.fn(async () => ({ error: null })),
    signOut: vi.fn(async () => undefined)
  },
  mockAuthModalState: {
    openLoginModal: vi.fn(),
    closeLoginModal: vi.fn()
  },
  mockUserData: {
    getLatestAssessmentResult: vi.fn(async () => ({ data: null, error: null })),
    getDiagnosisHistory: vi.fn(async () => ({ data: [], error: null })),
    getBookmarkedContentIds: vi.fn(async () => ({ data: [], error: null })),
    getSavedPlans: vi.fn(async () => ({ data: [], error: null })),
    getVideoDiagnosisHistory: vi.fn(async () => ({ data: [], error: null })),
    removeBookmark: vi.fn(async () => ({ error: null }))
  },
  mockSupabase: {
    current: null as null | {
      auth: {
        exchangeCodeForSession: (code: string) => Promise<{ error: { message: string } | null }>;
        verifyOtp: () => Promise<{ error: { message: string } | null }>;
      };
    }
  }
}));

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
    replace: mockPush,
    prefetch: vi.fn()
  }),
  useSearchParams: () => mockSearchParamsAdapter,
  usePathname: () => "/study/actionability-preview"
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => mockStudyState
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => mockAuthModalState
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: (...args: unknown[]) => mockUserData.getLatestAssessmentResult(...args),
  getDiagnosisHistory: (...args: unknown[]) => mockUserData.getDiagnosisHistory(...args),
  getBookmarkedContentIds: (...args: unknown[]) => mockUserData.getBookmarkedContentIds(...args),
  getSavedPlans: (...args: unknown[]) => mockUserData.getSavedPlans(...args),
  getVideoDiagnosisHistory: (...args: unknown[]) => mockUserData.getVideoDiagnosisHistory(...args),
  removeBookmark: (...args: unknown[]) => mockUserData.removeBookmark(...args)
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseBrowserClient: () => mockSupabase.current
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn(),
  markEventLoggerSessionCompleted: vi.fn()
}));

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe("surface localization", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSearchParamsAdapter.get.mockReset();
    mockSearchParamsAdapter.get.mockImplementation(() => null);
    mockStudyState.language = "en";
    mockStudyState.studyMode = false;
    mockStudyState.session = null;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.sendMagicLink.mockClear();
    mockAuthState.signOut.mockClear();
    mockAuthModalState.openLoginModal.mockClear();
    mockUserData.getLatestAssessmentResult.mockImplementation(async () => ({ data: null, error: null }));
    mockUserData.getDiagnosisHistory.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.getBookmarkedContentIds.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.getSavedPlans.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.getVideoDiagnosisHistory.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.removeBookmark.mockImplementation(async () => ({ error: null }));
    mockSupabase.current = null;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders LoginModal in English and Chinese", () => {
    const { rerender } = renderWithI18n(<LoginModal open onClose={() => {}} />);

    expect(screen.getByText("Email sign-in")).toBeInTheDocument();
    expect(screen.getByText("Enter your email and we will send you a sign-in link.")).toBeInTheDocument();

    mockStudyState.language = "zh";
    rerender(
      <I18nProvider>
        <LoginModal open onClose={() => {}} />
      </I18nProvider>
    );

    expect(screen.getByText("邮箱登录")).toBeInTheDocument();
    expect(screen.getByText("输入邮箱后，我们会给你发登录链接。")).toBeInTheDocument();
  });

  it("renders AuthCallbackCard in English with localized error copy", async () => {
    renderWithI18n(<AuthCallbackCard />);

    await waitFor(() => {
      expect(screen.getByText("Sign-in failed")).toBeInTheDocument();
    });
    expect(screen.getByText("Supabase environment variables are not configured yet, so sign-in cannot be completed right now.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back home" })).toBeInTheDocument();
  });

  it("renders the profile page login state in English", () => {
    renderWithI18n(<ProfilePage />);

    expect(screen.getByText("Sign in to view your records")).toBeInTheDocument();
    expect(screen.getByText("Your assessments, diagnoses, bookmarks, and plans will be saved here.")).toBeInTheDocument();
  });

  it("renders the profile page authenticated empty states in English", async () => {
    mockAuthState.user = { id: "user_1", email: "player@example.com" };
    mockAuthState.configured = true;

    renderWithI18n(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Latest assessment result")).toBeInTheDocument();
    });

    expect(screen.getByText("Diagnosis history")).toBeInTheDocument();
    expect(screen.queryByText("Video diagnosis history")).not.toBeInTheDocument();
    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Saved practice plans")).toBeInTheDocument();
  });

  it("renders VideoUploader and UsageMeter in English", () => {
    renderWithI18n(
      <div>
        <VideoUploader file={null} onFileChange={() => {}} />
        <UsageMeter successCount={1} maxFree={3} isPro={false} />
      </div>
    );

    expect(screen.getByText("Drop a clip here or click to upload a video under 1 minute")).toBeInTheDocument();
    expect(screen.getByText("Video diagnosis quota")).toBeInTheDocument();
    expect(screen.getByText("You have 2 free video diagnoses left")).toBeInTheDocument();
  });

  it("renders PlatformVideoSearch in English with localized metadata", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        cached: true,
        results: [
          {
            platform: "bilibili",
            videoId: "demo-video",
            title: "Serve rhythm drill",
            author: "",
            url: "https://example.com/demo-video",
            duration: "4:52",
            thumbnail: null,
            viewCount: 150977,
            publishedAt: "2025-03-01T12:00:00.000Z"
          }
        ]
      })
    })) as unknown as typeof fetch);

    renderWithI18n(
      <PlatformVideoSearch
        queries={{
          bilibili: ["serve rhythm drill"],
          youtube: ["serve rhythm drill"]
        }}
      />
    );

    expect(await screen.findByText("More related videos")).toBeInTheDocument();
    expect(await screen.findByText("Cached within 24h")).toBeInTheDocument();
    expect(await screen.findByText("Unknown creator")).toBeInTheDocument();
    expect(await screen.findByText(/151K views/i)).toBeInTheDocument();
    expect(await screen.findByText("Open on Bilibili")).toBeInTheDocument();
  });

  it("renders StudyBanner in both locales", () => {
    mockStudyState.studyMode = true;
    mockStudyState.session = {
      participantId: "P001",
      sessionId: "session-12345678",
      snapshotId: "snapshot-a",
      buildVersion: "build-1",
      language: "en"
    };

    const { rerender } = renderWithI18n(<StudyBanner />);

    expect(screen.getByText("Study mode")).toBeInTheDocument();
    expect(screen.getByText(/Participant: P001/)).toBeInTheDocument();
    expect(screen.getByText("End session")).toBeInTheDocument();

    mockStudyState.language = "zh";
    mockStudyState.session = {
      ...mockStudyState.session,
      language: "zh"
    };

    rerender(
      <I18nProvider>
        <StudyBanner />
      </I18nProvider>
    );

    expect(screen.getByText("研究模式")).toBeInTheDocument();
    expect(screen.getByText(/参与者: P001/)).toBeInTheDocument();
    expect(screen.getByText("结束会话")).toBeInTheDocument();
  });

  it("renders localized plan prescription blocks in both locales", () => {
    const zhPlan = getPlanTemplate("backhand-into-net", "3.0", "zh");
    const enPlan = getPlanTemplate("backhand-into-net", "3.0", "en");

    mockStudyState.language = "zh";
    renderWithI18n(<DayPlanCard day={zhPlan.days[0]} isToday />);
    expect(screen.getByText("第 1 天 · 今天")).toBeInTheDocument();
    expect(screen.getByText("今日目标")).toBeInTheDocument();
    expect(screen.queryByText("热身")).not.toBeInTheDocument();
    expect(screen.getAllByText("练习").length).toBeGreaterThan(0);
    expect(screen.queryByText("带压力重复")).not.toBeInTheDocument();
    expect(screen.getByText("完成标准")).toBeInTheDocument();
    expect(screen.getByText("强度 · 低")).toBeInTheDocument();
    expect(screen.getByText("节奏 · 慢节奏")).toBeInTheDocument();

    cleanup();
    mockStudyState.language = "en";
    renderWithI18n(<DayPlanCard day={enPlan.days[1]} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));

    expect(screen.getByText("Day 2")).toBeInTheDocument();
    expect(screen.getByText("Goal")).toBeInTheDocument();
    expect(screen.queryByText("Warm-up")).not.toBeInTheDocument();
    expect(screen.getAllByText("Practice").length).toBeGreaterThan(0);
    expect(screen.queryByText("Pressure reps")).not.toBeInTheDocument();
    expect(screen.getByText("Success criteria")).toBeInTheDocument();
    expect(screen.getByText("Intensity · Low")).toBeInTheDocument();
    expect(screen.getByText("Tempo · Slow")).toBeInTheDocument();
  });

  it("renders English content cards in zh mode with English titles and polished Chinese subtitles", () => {
    const item = contents.find((entry) => entry.id === "content_ttt_01");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_ttt_01");
    }

    mockStudyState.language = "zh";
    renderWithI18n(<ContentCard item={item} />);

    expect(screen.getByText("Simple Tennis Serve Technique Masterclass for Beginners")).toBeInTheDocument();
    expect(screen.getByText("网球发球入门精讲")).toBeInTheDocument();
    expect(screen.getByText(/针对[:：]\s*发球抛球总偏左偏右/)).toBeInTheDocument();
  });

  it("renders creator featured videos in zh mode with a generated Chinese subtitle", () => {
    const creator = creators.find((entry) => entry.id === "creator_venus_williams");

    expect(creator).toBeTruthy();
    if (!creator) {
      throw new Error("Missing creator_venus_williams");
    }

    mockStudyState.language = "zh";
    renderWithI18n(<CreatorDetailModal creator={creator} open onClose={() => {}} />);

    expect(screen.getByText("How To Hit A Basic Tennis Serve with Venus Williams")).toBeInTheDocument();
    expect(screen.getByText("跟维纳斯·威廉姆斯学网球基础发球")).toBeInTheDocument();
  });

  it("renders study end in zh without leftover English study labels", () => {
    mockStudyState.language = "zh";
    mockStudyState.studyMode = true;
    mockStudyState.session = {
      participantId: "P001",
      sessionId: "session-12345678",
      snapshotId: "snapshot-a",
      buildVersion: "build-1",
      language: "zh"
    };

    renderWithI18n(<StudyEndPage />);

    expect(screen.getAllByText("研究模式").length).toBeGreaterThan(0);
    expect(screen.getByText("本轮研究已结束")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "去填写问卷" })).toBeInTheDocument();
    expect(screen.queryByText("Study mode")).not.toBeInTheDocument();
  });

  it("renders the actionability preview badge in zh without English leftovers", () => {
    mockStudyState.language = "zh";
    mockStudyState.studyMode = true;
    mockStudyState.session = {
      participantId: "P001",
      sessionId: "session-12345678",
      snapshotId: "snapshot-a",
      buildVersion: "build-1",
      language: "zh"
    };

    renderWithI18n(<StudyActionabilityPreviewPage />);

    expect(screen.getByText("研究预览")).toBeInTheDocument();
    expect(screen.queryByText("Study preview")).not.toBeInTheDocument();
  });

  it("renders the study nav label in zh without beta wording", () => {
    mockStudyState.language = "zh";
    mockStudyState.studyMode = true;
    mockStudyState.session = {
      participantId: "P001",
      sessionId: "session-12345678",
      snapshotId: "snapshot-a",
      buildVersion: "build-1",
      language: "zh"
    };

    renderWithI18n(<Header />);

    expect(screen.getAllByText("研究模式").length).toBeGreaterThan(0);
    expect(screen.queryByText("视频诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("测试 (Beta)")).not.toBeInTheDocument();
  });

  it("renders the profile study panel in zh without English field labels", async () => {
    mockStudyState.language = "zh";
    mockStudyState.studyMode = true;
    mockStudyState.session = {
      participantId: "P001",
      sessionId: "session-12345678",
      snapshotId: "snapshot-a",
      buildVersion: "build-1",
      language: "zh"
    };

    renderWithI18n(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("当前研究会话")).toBeInTheDocument();
    });

    expect(screen.getByText("会话编号")).toBeInTheDocument();
    expect(screen.getByText("快照")).toBeInTheDocument();
    expect(screen.getByText("构建版本")).toBeInTheDocument();
    expect(screen.queryByText("Snapshot")).not.toBeInTheDocument();
    expect(screen.queryByText("Build")).not.toBeInTheDocument();
    expect(screen.queryByText("Session ID")).not.toBeInTheDocument();
  });
});
