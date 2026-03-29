import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { getDefaultAssessmentResult } from "@/lib/assessment";
import { getLocalLogs } from "@/lib/eventLogger";
import { STUDY_TASK_RATINGS_KEY } from "@/lib/study/config";
import { calculateSUS } from "@/lib/survey";
import { ASSESSMENT_DRAFT_STORAGE_KEY, ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import type { StudySession } from "@/types/study";

const { mockPush, mockRedirect, mockReplace, mockPrefetch, translationMap } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRedirect: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn(),
  translationMap: {
    "home.hero.title": "一句话，帮你找到下一步该练什么",
    "assessment.title": "1 分钟测一下你的水平",
    "assessment.resumeDraft": "已恢复你刚才做到一半的评估进度。",
    "assessment.result.ctaPlan": "生成训练计划 →",
    "study.actionability.prompt": "完成这个任务后，我知道我下一步该练什么了。",
    "study.actionability.submit": "提交评分",
    "study.actionability.submitting": "提交中...",
    "study.actionability.saved": "评分已记录。",
    "diagnose.placeholder": "例如：我反手总下网，一快就更容易失误",
    "library.title": "找内容",
    "library.more": "查看更多",
    "content.openAria": "打开视频：{value}",
    "video.title": "上传视频，我来帮你看问题",
    "rankings.title": "博主榜",
    "rankings.searchAria": "搜索博主",
    "rankings.detail": "查看详情",
    "plan.title": "你的 7 天提升计划",
    "plan.supporting": "这 7 天先练这一件事",
    "plan.day.today": "今天",
    "plan.day.label": "Day {day}",
    "plan.day.expand": "展开",
    "plan.day.collapse": "收起",
    "profile.loginTitle": "登录后查看你的记录",
    "survey.title": "TennisLevel 使用体验问卷",
    "survey.part.sus.title": "Part 2：SUS 系统可用性量表",
    "modal.close": "关闭"
  } satisfies Record<string, string>
}));

let mockSearchParams = new URLSearchParams();
const mockSearchParamsAdapter = {
  get: (key: string) => mockSearchParams.get(key)
};
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  prefetch: mockPrefetch
};
const baseStudySession: StudySession = {
  studyId: "sportshci_2026_no_video_v1",
  participantId: "P001",
  sessionId: "session_1",
  studyMode: true,
  language: "zh",
  condition: "lang_zh",
  snapshotId: "2026-03-29-v1",
  snapshotSeed: "20260329",
  buildVersion: "2026-03-29-v1",
  startedAt: "2026-03-29T00:00:00.000Z",
  endedAt: null
};
const mockStudyContext = {
  session: null as StudySession | null,
  studyMode: false,
  language: "zh" as const,
  loading: false,
  startStudySession: vi.fn(),
  endStudySession: vi.fn(),
  clearStudyData: vi.fn()
};

async function loadPage<T>(importer: () => Promise<{ default: T }>) {
  const module = await importer();
  return module.default;
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
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParamsAdapter,
  usePathname: () => window.location.pathname,
  redirect: mockRedirect
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    configured: false,
    sendMagicLink: vi.fn(),
    signOut: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: vi.fn(),
    closeLoginModal: vi.fn()
  }),
  AuthModalProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => mockStudyContext,
  StudyProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
    studyMode: false,
    t: (key: string, replacements?: Record<string, string | number>) => {
      const template = translationMap[key] ?? key;
      if (!replacements) {
        return template;
      }

      return Object.entries(replacements).reduce((current, [token, value]) => {
        return current.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
      }, template);
    }
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

describe("app smoke tests", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockPush.mockReset();
    mockRedirect.mockReset();
    mockReplace.mockReset();
    mockPrefetch.mockReset();
    mockStudyContext.session = null;
    mockStudyContext.studyMode = false;
    mockSearchParams = new URLSearchParams();
    window.localStorage.clear();
    window.history.pushState({}, "", "/");
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });

  it("renders home page without crashing", () => {
    const HomePage = vi.importActual<typeof import("@/app/page")>("@/app/page");
    return HomePage.then(({ default: Page }) => {
      render(React.createElement(Page));

      expect(screen.getByText("一句话，帮你找到下一步该练什么")).toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it("renders assessment page and allows stepping through the simplified flow", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    render(React.createElement(AssessmentPage));

    expect(assessmentQuestions).toHaveLength(14);
    expect(screen.getByText("1 分钟测一下你的水平")).toBeInTheDocument();
    expect(screen.getByText("你的性别？")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "男" }));
    await waitFor(() => {
      expect(screen.getByText("打了多久网球？")).toBeInTheDocument();
    });

    const experienceSlider = screen.getByLabelText("打了多久网球？");
    fireEvent.change(experienceSlider, { target: { value: "3" } });
    fireEvent.mouseUp(experienceSlider);
    await waitFor(() => {
      expect(screen.getByText("你和朋友对打，通常能连续打多少拍？")).toBeInTheDocument();
    });

    const branchAFlow = [
      "你和朋友对打，通常能连续打多少拍？",
      "你的发球大概什么状态？",
      "你对打或比赛时脑子里在想什么？",
      "打球时你的握拍和准备动作？",
      "对方来球速度稍快时？",
      "你目前打球最大的困扰是？"
    ];

    for (const [index, title] of branchAFlow.entries()) {
      const question = assessmentQuestions.find((item) => item.question === title);

      expect(question).toBeTruthy();
      expect(screen.getByText(title)).toBeInTheDocument();
      if (!question || question.type === "slider") {
        throw new Error(`Expected choice question for ${title}`);
      }

      fireEvent.click(screen.getByText(question.options[0].label));
      if (index < branchAFlow.length - 1) {
        const nextTitle = branchAFlow[index + 1];
        await waitFor(() => {
          expect(screen.getByText(nextTitle)).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/assessment/result");
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("redirects back to the saved assessment result on revisit", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answeredCount: 6 }));

    render(React.createElement(AssessmentPage));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/assessment/result");
    });
  });

  it("still allows an explicit retake even if a saved assessment result exists", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    mockSearchParams = new URLSearchParams("retake=1");
    window.history.pushState({}, "", "/assessment?retake=1");
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answeredCount: 6 }));

    render(React.createElement(AssessmentPage));

    expect(await screen.findByText("你的性别？")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("resumes an in-progress assessment draft instead of redirecting to the saved result", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answeredCount: 6 }));
    window.localStorage.setItem(ASSESSMENT_DRAFT_STORAGE_KEY, JSON.stringify({
      stepIndex: 3,
      answers: { coarse_rally: 2 },
      profile: { gender: "female", yearsPlaying: 4, yearsLabel: "4 年" },
      updatedAt: "2026-03-29T00:00:00.000Z"
    }));

    render(React.createElement(AssessmentPage));

    expect(await screen.findByText("已恢复你刚才做到一半的评估进度。")).toBeInTheDocument();
    expect(screen.getByText("你的发球大概什么状态？")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("returns to the same question after leaving and coming back mid-assessment", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    window.localStorage.setItem(ASSESSMENT_DRAFT_STORAGE_KEY, JSON.stringify({
      stepIndex: 5,
      answers: {
        coarse_rally: 2,
        coarse_serve: 2,
        coarse_awareness: 1
      },
      profile: { gender: "male", yearsPlaying: 3, yearsLabel: "3 年" },
      updatedAt: "2026-03-29T00:00:00.000Z"
    }));

    render(React.createElement(AssessmentPage));

    expect(await screen.findByText("已恢复你刚才做到一半的评估进度。")).toBeInTheDocument();
    expect(screen.getByText("打球时你的握拍和准备动作？")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders assessment result page with a direct training-plan CTA", async () => {
    const AssessmentResultPage = await loadPage(() => import("@/app/assessment/result/page"));

    const storedResult = {
      ...getDefaultAssessmentResult("zh"),
      answeredCount: 8,
      totalQuestions: 8,
      level: "3.0" as const,
      confidence: "中等" as const,
      dimensions: [
        {
          key: "serve" as const,
          label: "发球",
          score: 1,
          maxScore: 4,
          average: 1,
          levelHint: "3.0" as const,
          answeredCount: 2,
          uncertainCount: 0,
          status: "正常" as const
        },
        {
          key: "matchplay" as const,
          label: "比赛意识",
          score: 2,
          maxScore: 4,
          average: 2,
          levelHint: "3.0" as const,
          answeredCount: 2,
          uncertainCount: 0,
          status: "正常" as const
        },
        {
          key: "forehand" as const,
          label: "正手",
          score: 3,
          maxScore: 4,
          average: 3,
          levelHint: "3.0" as const,
          answeredCount: 2,
          uncertainCount: 0,
          status: "正常" as const
        }
      ],
      strengths: ["正手"],
      weaknesses: ["发球"],
      observationNeeded: ["比赛意识"]
    };
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(storedResult));

    render(React.createElement(AssessmentResultPage));

    const planLink = await screen.findByRole("link", { name: "生成训练计划 →" });
    expect(planLink.getAttribute("href")).toContain("/plan?");
    expect(planLink.getAttribute("href")).toContain("source=assessment");
    expect(planLink.getAttribute("href")).toContain("problemTag=second-serve-confidence");
    expect(planLink.getAttribute("href")).toContain("contentIds=");
  });

  it("shows the actionability prompt on assessment result in study mode", async () => {
    const AssessmentResultPage = await loadPage(() => import("@/app/assessment/result/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({
      ...getDefaultAssessmentResult("zh"),
      answeredCount: 8,
      totalQuestions: 8,
      level: "3.0"
    }));

    render(React.createElement(AssessmentResultPage));

    expect(await screen.findByText("完成这个任务后，我知道我下一步该练什么了。")).toBeInTheDocument();
  });

  it("renders diagnose page with input box", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    render(React.createElement(DiagnosePage));

    expect(await screen.findByPlaceholderText(/我反手总下网/)).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("shows the actionability prompt after a study diagnosis result is shown", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "我反手总下网，一快就更容易失误" }
    });
    fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));

    expect(await screen.findByText("完成这个任务后，我知道我下一步该练什么了。")).toBeInTheDocument();
  });

  it("renders library page and shows non-empty content list", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /打开视频：|Open video:/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("查看更多")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("logs snapshot and sort context when library opens in study mode", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();

    const eventNames = getLocalLogs().map((entry) => entry.eventName);
    expect(eventNames).toContain("library.snapshot_loaded");
    expect(eventNames).toContain("library.sort_context_logged");

    const snapshotEvent = getLocalLogs().find((entry) => entry.eventName === "library.snapshot_loaded");
    expect(snapshotEvent?.payload.snapshotVersion).toBe(baseStudySession.snapshotId);
    expect(snapshotEvent?.payload.snapshotSeed).toBe(baseStudySession.snapshotSeed);
  });

  it("renders rankings page without crashing", async () => {
    const RankingsPage = await loadPage(() => import("@/app/rankings/page"));

    render(React.createElement(RankingsPage));

    expect(screen.getByText("博主榜")).toBeInTheDocument();
    expect(screen.getByText("盖奥网球")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("logs snapshot and sort context when rankings opens in study mode", async () => {
    const RankingsPage = await loadPage(() => import("@/app/rankings/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;

    render(React.createElement(RankingsPage));

    expect(await screen.findByText("博主榜")).toBeInTheDocument();

    const eventNames = getLocalLogs().map((entry) => entry.eventName);
    expect(eventNames).toContain("rankings.snapshot_loaded");
    expect(eventNames).toContain("rankings.sort_context_logged");

    const snapshotEvent = getLocalLogs().find((entry) => entry.eventName === "rankings.snapshot_loaded");
    expect(snapshotEvent?.payload.snapshotVersion).toBe(baseStudySession.snapshotId);
    expect(snapshotEvent?.payload.snapshotSeed).toBe(baseStudySession.snapshotSeed);
  });

  it("renders plan page without crashing", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockSearchParams = new URLSearchParams(
      "problemTag=backhand-into-net&level=3.0&source=diagnosis&contentIds=content_cn_a_01,content_zlx_03,expanded_junior_tennis_co_video_112"
    );

    render(React.createElement(PlanPage));

    expect(await screen.findByText("你的 7 天提升计划")).toBeInTheDocument();
    expect(screen.getByText("这 7 天先练这一件事")).toBeInTheDocument();
    expect(screen.getByText("Day 1 · 今天")).toBeInTheDocument();
    expect(screen.getByText("反手总下网：先别急着加力")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "展开" })[0]);
    expect(screen.getAllByRole("link").filter((node) => node.getAttribute("href")?.startsWith("http")).length).toBe(2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("shows the actionability prompt on plan page in study mode", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    mockSearchParams = new URLSearchParams(
      "problemTag=backhand-into-net&level=3.0&source=diagnosis&contentIds=content_cn_a_01"
    );
    window.history.pushState({}, "", `/plan?${mockSearchParams.toString()}`);

    render(React.createElement(PlanPage));

    expect(await screen.findByText("完成这个任务后，我知道我下一步该练什么了。")).toBeInTheDocument();
  });

  it("does not show the task 3 prompt twice after a rating exists", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    mockSearchParams = new URLSearchParams(
      "problemTag=backhand-into-net&level=3.0&source=diagnosis&contentIds=content_cn_a_01"
    );
    window.history.pushState({}, "", `/plan?${mockSearchParams.toString()}`);
    window.localStorage.setItem(STUDY_TASK_RATINGS_KEY, JSON.stringify([{
      id: "rating_1",
      studyId: baseStudySession.studyId,
      participantId: baseStudySession.participantId,
      sessionId: baseStudySession.sessionId,
      taskId: "task_3_action_or_revisit",
      metricName: "actionability",
      score: 6,
      language: "zh",
      submittedAt: "2026-03-29T00:00:00.000Z"
    }]));

    render(React.createElement(PlanPage));

    await screen.findByText("你的 7 天提升计划");
    expect(screen.queryByText("完成这个任务后，我知道我下一步该练什么了。")).not.toBeInTheDocument();
  });

  it("renders profile page login prompt when user is not signed in", () => {
    return loadPage(() => import("@/app/profile/page")).then((ProfilePage) => {
      render(React.createElement(ProfilePage));

      expect(screen.getByText("登录后查看你的记录")).toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it("renders survey page without crashing", async () => {
    const SurveyPage = await loadPage(() => import("@/app/survey/page"));

    render(React.createElement(SurveyPage));

    expect(screen.getByText("TennisLevel 使用体验问卷")).toBeInTheDocument();
    expect(screen.getByText("Part 2：SUS 系统可用性量表")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("redirects /study to /study/start", async () => {
    const StudyPage = await loadPage(() => import("@/app/study/page"));

    render(React.createElement(StudyPage));

    expect(mockRedirect).toHaveBeenCalledWith("/study/start");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("calculates SUS score using the standard formula", () => {
    expect(calculateSUS([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });
});
