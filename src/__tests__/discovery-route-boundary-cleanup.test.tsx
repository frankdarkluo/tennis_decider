import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const {
  mockPush,
  mockReplace,
  mockPrefetch,
  mockOpenLoginModal
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn(),
  mockOpenLoginModal: vi.fn()
}));

const mockStudyContext = {
  session: null as null | { sessionId: string; snapshotId: string; snapshotSeed?: string; buildVersion?: string },
  studyMode: false,
  pendingStudySetup: false
};

const mockAuthState = {
  user: null as null | { id: string; email?: string | null },
  configured: false,
  loading: false
};

const mockAssessmentStorage = {
  result: null as null | { answeredCount: number; level: string }
};

const mockRemoteAssessment = vi.hoisted(() => vi.fn(async () => ({ data: null, error: null })));

const translations: Record<string, string> = {
  "assessment.loading": "正在同步你的评估记录...",
  "assessment.empty.title": "先完成一次水平评估",
  "assessment.empty.subtitle": "做完后，我们会直接告诉你大概处在哪个能力区间，以及接下来更值得优先补哪一块。",
  "assessment.result.ctaStart": "去完成水平评估 →",
  "library.title": "找内容",
  "library.subtitle": "按动作、博主或场景筛选。",
  "library.bookmarkLogin": "登录后可收藏内容",
  "rankings.title": "博主榜",
  "rankings.searchPlaceholder": "搜索博主",
  "rankings.searchAria": "搜索博主",
  "rankings.domestic": "国内",
  "rankings.overseas": "海外",
  "rankings.empty": "还没有匹配的博主。"
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

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: mockOpenLoginModal
  })
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => mockStudyContext
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh" as const,
    t: (key: string) => translations[key] ?? key
  })
}));

vi.mock("@/lib/assessmentStorage", () => ({
  readAssessmentResultFromStorage: () => mockAssessmentStorage.result,
  hasCompletedAssessmentResult: (result: { answeredCount?: number } | null) => Boolean(result && result.answeredCount && result.answeredCount > 0),
  hasStoredCompletedAssessmentResult: () => Boolean(mockAssessmentStorage.result && mockAssessmentStorage.result.answeredCount > 0),
  writeAssessmentResultToStorage: vi.fn()
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: (...args: unknown[]) => mockRemoteAssessment(...args),
  getBookmarkedContentIds: vi.fn(async () => ({ data: [], error: null })),
  addBookmark: vi.fn(async () => ({ error: null })),
  removeBookmark: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/library/studyOrder", () => ({
  buildLibraryItemsForMode: vi.fn(() => [
    {
      id: "content_1",
      title: "反手稳定练习",
      creatorId: "creator_1",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["backhand"],
      problemTags: ["backhand-stability"],
      language: "zh",
      summary: "summary",
      reason: "reason",
      useCases: ["training"],
      url: "https://example.com/content_1"
    }
  ]),
  sortLibraryItemsForMode: vi.fn((items: unknown[]) => items)
}));

vi.mock("@/lib/rankings/studyOrder", () => ({
  buildRankingsCreatorsForMode: vi.fn(() => [
    {
      id: "creator_1",
      name: "Coach One",
      shortDescription: "desc",
      tags: ["consistency"],
      region: "domestic",
      platforms: ["Bilibili"],
      levels: ["3.0"],
      specialties: ["backhand"],
      styleTags: ["clear"],
      bio: "bio",
      suitableFor: ["beginner"],
      featuredContentIds: ["content_1"]
    }
  ]),
  sortRankingsCreatorsForMode: vi.fn((items: unknown[]) => items)
}));

vi.mock("@/components/library/ContentCard", () => ({
  ContentCard: ({ item }: { item: { title: string } }) => React.createElement("div", null, item.title)
}));

vi.mock("@/components/library/LibraryFilters", () => ({
  LibraryFilters: () => React.createElement("div", null, "library-filters")
}));

vi.mock("@/components/rankings/CreatorCard", () => ({
  CreatorCard: ({ creator }: { creator: { name: string } }) => React.createElement("div", null, creator.name)
}));

vi.mock("@/components/rankings/CreatorDetailModal", () => ({
  CreatorDetailModal: () => null
}));

async function loadLibraryPage() {
  const module = await import("@/app/library/page");
  return module.default;
}

async function loadRankingsPage() {
  const module = await import("@/app/rankings/page");
  return module.default;
}

describe("discovery route boundary cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    mockStudyContext.session = null;
    mockStudyContext.studyMode = false;
    mockStudyContext.pendingStudySetup = false;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
    mockAssessmentStorage.result = null;
    mockRemoteAssessment.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps library on the consumer assessment gate instead of redirecting to study start", async () => {
    mockStudyContext.pendingStudySetup = true;
    const LibraryPage = await loadLibraryPage();

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("先完成一次水平评估")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });

  it("does not let an active study session bypass the consumer library assessment gate", async () => {
    mockStudyContext.studyMode = true;
    mockStudyContext.session = { sessionId: "study_1", snapshotId: "snapshot_1" };
    const LibraryPage = await loadLibraryPage();

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("先完成一次水平评估")).toBeInTheDocument();
    expect(screen.queryByText("反手稳定练习")).not.toBeInTheDocument();
  });

  it("keeps rankings on the consumer assessment gate instead of redirecting to study start", async () => {
    mockStudyContext.pendingStudySetup = true;
    const RankingsPage = await loadRankingsPage();

    render(React.createElement(RankingsPage));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/assessment");
    });
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });

  it("does not let an active study session bypass the consumer rankings assessment gate", async () => {
    mockStudyContext.studyMode = true;
    mockStudyContext.session = { sessionId: "study_1", snapshotId: "snapshot_1" };
    const RankingsPage = await loadRankingsPage();

    render(React.createElement(RankingsPage));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/assessment");
    });
    expect(screen.queryByText("Coach One")).not.toBeInTheDocument();
  });
});
