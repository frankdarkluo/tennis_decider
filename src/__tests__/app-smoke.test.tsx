import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { getDefaultAssessmentResult } from "@/lib/assessment";
import { getLocalLogs } from "@/lib/eventLogger";
import { STUDY_PROGRESS_KEY, STUDY_TASK_RATINGS_KEY } from "@/lib/study/config";
import { calculateSUS } from "@/lib/survey";
import { ASSESSMENT_DRAFT_STORAGE_KEY, ASSESSMENT_STORAGE_KEY } from "@/lib/utils";
import type { StudySession } from "@/types/study";
import type { AssessmentResultRow, DiagnosisHistoryRow, SavedPlanRow, VideoDiagnosisHistoryRow } from "@/types/userData";

const { mockPush, mockRedirect, mockReplace, mockPrefetch, translationMap } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRedirect: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn(),
  translationMap: {
    "home.hero.title": "一句话，帮你找到下一步该练什么",
    "home.hero.subtitle": "💡动作、错误、场景描述越具体，诊断越准",
    "home.hero.helper": "💡 描述越具体，诊断越准",
    "home.hero.examples": "示例",
    "assessment.title": "1 分钟测一下你的水平",
    "assessment.resumeDraft": "已恢复你刚才做到一半的评估进度。",
    "assessment.result.ctaPlan": "生成训练计划 →",
    "study.actionability.prompt": "完成这个任务后，我知道我下一步该练什么了。",
    "study.actionability.submit": "提交评分",
    "study.actionability.submitting": "提交中...",
    "study.actionability.saved": "评分已记录。",
    "diagnose.title": "说一句你的问题",
    "diagnose.subtitle": "具体说出动作、错误和场景，我来帮你判断先改什么。",
    "diagnose.placeholder": "例如：我反手总下网，一快就更容易失误",
    "diagnose.quickTags": "示例",
    "diagnose.helper": "💡 描述越具体，诊断越准",
    "diagnose.examples": "示例",
    "content.whyRecommended": "为什么推荐这个",
    "content.whyPrefix": "推荐依据:",
    "diagnose.result.plan": "根据这个问题生成 7 天训练计划",
    "diagnose.result.library": "去内容库找更多练习",
    "diagnose.result.rankings": "去博主榜找适合的人",
    "diagnose.result.moreOptions": "查看更多选项 ↓",
    "library.title": "找内容",
    "library.more": "查看更多",
    "content.openAria": "打开视频：{value}",
    "video.title": "传一段视频，帮你看看问题出在哪",
    "video.subtitle": "传一段几十秒的小视频就好，我们帮你诊断。",
    "video.badge": "AI视频诊断",
    "video.tip.shootTitle": "拍摄视角",
    "video.tip.shootBody": "横屏、侧后方、连续 3-5 拍。",
    "video.tip.sceneTitle": "拍什么都行",
    "video.tip.sceneBody": "喂球、对拉、发球、比赛都行。",
    "video.tip.resultTitle": "这次能看什么",
    "video.tip.resultBody": "重点看动作问题和下一步。",
    "video.upload.title": "上传视频",
    "video.upload.subtitle": "建议 {duration} 秒内、{size}MB 内。",
    "video.stroke": "想看哪一拍？",
    "video.scene": "这是什么场景？",
    "video.description": "可选：补一句感觉",
    "video.descriptionPlaceholder": "例如：正手总晚点，越发力越容易飞",
    "video.option.unknown": "不确定",
    "video.option.forehand": "正手",
    "video.option.backhand": "反手",
    "video.option.serve": "发球",
    "video.option.volley": "网前 / 截击",
    "video.option.scene_unknown": "不确定",
    "video.option.drill": "喂球训练",
    "video.option.rally": "对拉 / 相持",
    "video.option.serve_practice": "发球练习",
    "video.option.match": "比赛片段",
    "video.upload.dropTitle": "拖进来或点击上传 1 分钟以内的视频",
    "video.upload.dropBody": "推荐拍法：横屏、侧后方机位、让击球点和全身步伐尽量都进画面。",
    "video.upload.dropFormats": "支持 mp4 / mov / webm，建议 50MB 以内",
    "video.button.start": "开始视频诊断",
    "video.backHome": "← 回到首页",
    "video.usage.title": "视频诊断额度",
    "video.usage.remainingHeadline": "你还剩 {remaining} 次免费视频诊断",
    "video.usage.used": "已成功使用 {used}/{max}",
    "video.usage.note": "只有当系统成功完成分析并给出有效结果时，才会算作一次使用。分析失败或建议重拍时不会扣次数。",
    "rankings.title": "博主榜",
    "rankings.searchAria": "搜索博主",
    "rankings.detail": "查看详情",
    "creator.whyRecommended": "为什么推荐这位博主",
    "creator.whyPrefix": "推荐依据:",
    "plan.title": "你的 7 天提升计划",
    "plan.supporting": "这 7 天先练这一件事",
    "plan.day.what": "What to practice",
    "plan.day.duration": "How long",
    "plan.day.watch": "Watch this",
    "plan.nextDiagnose": "继续诊断一个具体问题",
    "plan.openProfile": "去 study hub 继续",
    "plan.day.today": "今天",
    "plan.day.label": "Day {day}",
    "plan.day.expand": "展开",
    "plan.day.collapse": "收起",
    "profile.loginTitle": "登录后查看你的记录",
    "profile.studySession": "当前研究会话",
    "profile.studyContinuePlan": "继续这次训练计划",
    "profile.studyContinueAssessment": "回到评估结果",
    "profile.studyContinueAssessmentDraft": "继续未完成评估",
    "profile.studyResumeDiagnosis": "继续这个诊断",
    "profile.studyResumePlan": "回到这份训练计划",
    "profile.studyResume": "继续这次研究",
    "profile.studyQuickContinue": "继续上次练习",
    "profile.studyQuickPlan": "回看训练计划",
    "profile.studyQuickDiagnosis": "回看上次诊断",
    "profile.studyQuickContinueHint": "从你上次停下来的地方继续。",
    "profile.studyQuickPlanHint": "直接回到最近一次保存的计划。",
    "profile.studyQuickDiagnosisHint": "带着原问题回到诊断页。",
    "profile.studyQuickEmpty": "还没有可继续的记录。",
    "profile.assessment.openLibrary": "去看推荐内容",
    "profile.plans.toggleExpand": "查看计划",
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
const mockAuthContext = {
  user: null as { id: string; email: string } | null,
  loading: false,
  configured: false,
  sendMagicLink: vi.fn(),
  signOut: vi.fn()
};
const mockUserDataState = {
  latestAssessmentResult: null as AssessmentResultRow | null,
  diagnosisHistory: [] as DiagnosisHistoryRow[],
  videoDiagnosisHistory: [] as VideoDiagnosisHistoryRow[],
  bookmarkedContentIds: [] as string[],
  savedPlans: [] as SavedPlanRow[]
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
  useAuth: () => mockAuthContext,
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

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: vi.fn(async () => ({ data: mockUserDataState.latestAssessmentResult, error: null })),
  getDiagnosisHistory: vi.fn(async () => ({ data: mockUserDataState.diagnosisHistory, error: null })),
  getSavedPlans: vi.fn(async () => ({ data: mockUserDataState.savedPlans, error: null })),
  getVideoDiagnosisHistory: vi.fn(async () => ({ data: mockUserDataState.videoDiagnosisHistory, error: null })),
  getBookmarkedContentIds: vi.fn(async () => ({ data: mockUserDataState.bookmarkedContentIds, error: null })),
  removeBookmark: vi.fn(async () => ({ error: null })),
  saveDiagnosisHistory: vi.fn()
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
    mockAuthContext.user = null;
    mockAuthContext.configured = false;
    mockUserDataState.latestAssessmentResult = null;
    mockUserDataState.diagnosisHistory = [];
    mockUserDataState.videoDiagnosisHistory = [];
    mockUserDataState.bookmarkedContentIds = [];
    mockUserDataState.savedPlans = [];
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
      expect(screen.getByText("💡动作、错误、场景描述越具体，诊断越准")).toBeInTheDocument();
      expect(screen.queryByText("💡 描述越具体，诊断越准")).not.toBeInTheDocument();
      expect(screen.getByText("示例")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "反手总是下网" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "一发总发不进" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "二发总双误" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "正手一发力就出界" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "脚步总慢半拍" })).not.toBeInTheDocument();
      expect(screen.queryByText("也可以直接点一个接近的问题：")).not.toBeInTheDocument();
      expect(screen.queryByText("查看更多示例 ↓")).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /AI 诊断|video diagnosis/i })).not.toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it("renders the current video diagnose upload flow", async () => {
    const VideoDiagnosePage = await loadPage(() => import("@/app/video-diagnose/page"));

    render(React.createElement(VideoDiagnosePage));

    expect(await screen.findByText("传一段视频，帮你看看问题出在哪")).toBeInTheDocument();
    expect(screen.getByText("上传视频")).toBeInTheDocument();
    expect(screen.getByText("拖进来或点击上传 1 分钟以内的视频")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← 回到首页" })).toHaveAttribute("href", "/");
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
      expect(screen.getByText("日常练习中，你通常能连续对打多少拍？")).toBeInTheDocument();
    });

    const branchAFlow = [
      "日常练习中，你通常能连续对打多少拍？",
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
    expect(planLink.getAttribute("href")).toContain("problemTag=second-serve-reliability");
    expect(planLink.getAttribute("href")).toContain("contentIds=");
  });

  it("shows 4.5 instead of the legacy 4.0+ label on assessment results", async () => {
    const AssessmentResultPage = await loadPage(() => import("@/app/assessment/result/page"));

    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({
      ...getDefaultAssessmentResult("zh"),
      answeredCount: 8,
      totalQuestions: 8,
      level: "4.0+"
    }));

    render(React.createElement(AssessmentResultPage));

    expect(await screen.findByRole("heading", { name: /4\.5/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /4\.0\+/ })).not.toBeInTheDocument();
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

    expect(await screen.findByText("说一句你的问题")).toBeInTheDocument();
    expect(screen.getByText("具体说出动作、错误和场景，我来帮你判断先改什么。")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/我反手总下网/)).toBeInTheDocument();
    expect(screen.getByText("示例")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "反手总是下网" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "一发总发不进" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "二发总双误" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "正手一发力就出界" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "脚步总慢半拍" })).toBeInTheDocument();
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

  it("stores the exact diagnose query path in study progress after a study diagnosis", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "我反手总下网，一快就更容易失误" }
    });
    fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));

    await screen.findByText("完成这个任务后，我知道我下一步该练什么了。");

    const studyProgress = JSON.parse(window.localStorage.getItem(STUDY_PROGRESS_KEY) ?? "null");
    expect(studyProgress?.lastVisitedPath).toBe("/diagnose?q=%E6%88%91%E5%8F%8D%E6%89%8B%E6%80%BB%E4%B8%8B%E7%BD%91%EF%BC%8C%E4%B8%80%E5%BF%AB%E5%B0%B1%E6%9B%B4%E5%AE%B9%E6%98%93%E5%A4%B1%E8%AF%AF");
  });

  it("keeps the plan CTA primary in study mode while library and rankings stay available after expand", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "我反手总下网，一快就更容易失误" }
    });
    fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));

    fireEvent.click(await screen.findByRole("button", { name: "diagnose.result.expand1" }));

    expect(await screen.findByRole("link", { name: "根据这个问题生成 7 天训练计划" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "去内容库找更多练习" })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("link", { name: "去博主榜找适合的人" })).toHaveAttribute("href", "/rankings");
  });

  it("reveals why a diagnosis recommendation was chosen and logs the explanation view", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "我反手总下网，一快就更容易失误" }
    });
    fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));
    fireEvent.click(await screen.findByRole("button", { name: "diagnose.result.expand1" }));
    fireEvent.click(await screen.findByRole("button", { name: "为什么推荐这个" }));

    expect(await screen.findByText(/推荐依据:/)).toBeInTheDocument();
    expect(getLocalLogs().some((entry) => entry.eventName === "diagnose.why_this_viewed" && entry.payload.targetType === "content")).toBe(true);
  });

  it("renders library page and shows non-empty content list", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /打开视频：|Open video:/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("查看更多")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("reveals a lightweight why-recommended explanation on library content cards", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "为什么推荐这个" })[0]);

    expect(await screen.findAllByText(/推荐依据:/)).not.toHaveLength(0);
    expect(getLocalLogs().some((entry) => entry.eventName === "content.why_this_viewed")).toBe(true);
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

  it("reveals a lightweight why-recommended explanation in creator detail modal", async () => {
    const RankingsPage = await loadPage(() => import("@/app/rankings/page"));

    render(React.createElement(RankingsPage));

    expect(await screen.findByText("博主榜")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /查看详情/ })[0]);
    fireEvent.click(await screen.findByRole("button", { name: "为什么推荐这位博主" }));

    expect(await screen.findByText(/推荐依据:/)).toBeInTheDocument();
    expect(getLocalLogs().some((entry) => entry.eventName === "creator.why_this_viewed")).toBe(true);
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

  it("renders a visible today card and watch block on the plan page for the upgraded diagnosis flow", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockSearchParams = new URLSearchParams(
      "problemTag=overhead-timing&level=3.0&source=diagnosis"
    );
    window.history.pushState({}, "", `/plan?${mockSearchParams.toString()}`);

    render(React.createElement(PlanPage));

    expect(await screen.findByText(/今天/)).toBeInTheDocument();
    expect(screen.getByText("Watch this")).toBeInTheDocument();
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

  it("offers diagnose and profile follow-up CTAs for an assessment-based study plan", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    mockSearchParams = new URLSearchParams(
      "problemTag=second-serve-confidence&level=3.0&source=assessment&contentIds=content_cn_a_01"
    );
    window.history.pushState({}, "", `/plan?${mockSearchParams.toString()}`);

    render(React.createElement(PlanPage));

    expect(await screen.findByText("你的 7 天提升计划")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "继续诊断一个具体问题" }).getAttribute("href")).toBe("/diagnose");
    expect(screen.getByRole("link", { name: "去 study hub 继续" }).getAttribute("href")).toBe("/profile");
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

  it("prioritizes the unfinished assessment as the primary study resume action", async () => {
    const ProfilePage = await loadPage(() => import("@/app/profile/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    window.localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify({
      updatedAt: "2026-03-29T00:00:00.000Z",
      lastVisitedPath: "/diagnose?q=test",
      lastAssessmentPath: "/assessment/result",
      assessmentDraftInProgress: true,
      assessmentDraftStepIndex: 4,
      lastPlanHref: "/plan?problemTag=backhand-into-net&level=3.0&source=diagnosis"
    }));

    render(React.createElement(ProfilePage));

    expect(await screen.findByText("当前研究会话")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "继续未完成评估" }).getAttribute("href")).toBe("/assessment");
  });

  it("avoids duplicating the resume CTA when the last visited path is already the saved plan", async () => {
    const ProfilePage = await loadPage(() => import("@/app/profile/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    window.localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify({
      updatedAt: "2026-03-29T00:00:00.000Z",
      lastVisitedPath: "/plan?problemTag=backhand-into-net&level=3.0&source=diagnosis",
      lastPlanHref: "/plan?problemTag=backhand-into-net&level=3.0&source=diagnosis",
      lastPlanTitle: "反手稳定性计划"
    }));

    render(React.createElement(ProfilePage));

    expect(await screen.findByText("当前研究会话")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "回到这份训练计划" })).toHaveLength(1);
  });

  it("labels diagnose resume more specifically and logs the correct item type", async () => {
    const ProfilePage = await loadPage(() => import("@/app/profile/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    window.localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify({
      updatedAt: "2026-03-29T00:00:00.000Z",
      lastVisitedPath: "/diagnose?q=backhand"
    }));

    render(React.createElement(ProfilePage));

    const resumeLinks = await screen.findAllByRole("link", { name: "继续这个诊断" });
    fireEvent.click(resumeLinks[0]!);

    const resumeEvent = getLocalLogs().find((entry) => entry.eventName === "profile.history_item_opened");
    expect(resumeEvent?.payload.itemType).toBe("diagnosis");
    expect(resumeEvent?.payload.itemId).toBe("/diagnose?q=backhand");
  });

  it("shows explicit continue-practice cards for last practice, saved plan, and last diagnosis", async () => {
    const ProfilePage = await loadPage(() => import("@/app/profile/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    window.localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify({
      updatedAt: "2026-03-29T00:00:00.000Z",
      lastVisitedPath: "/library?level=3.0",
      lastPlanHref: "/plan?problemTag=backhand-into-net&level=3.0&source=diagnosis",
      lastPlanTitle: "反手稳定性计划",
      lastDiagnosisPath: "/diagnose?q=backhand",
      lastDiagnosisTitle: "反手总下网"
    }));

    render(React.createElement(ProfilePage));

    expect(await screen.findByText("继续上次练习")).toBeInTheDocument();
    expect(screen.getByText("回看训练计划")).toBeInTheDocument();
    expect(screen.getByText("回看上次诊断")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "继续这次研究" }).getAttribute("href")).toBe("/library?level=3.0");
    expect(screen.getByRole("link", { name: "继续这次训练计划" }).getAttribute("href")).toBe("/plan?problemTag=backhand-into-net&level=3.0&source=diagnosis");
    expect(screen.getByRole("link", { name: "继续这个诊断" }).getAttribute("href")).toBe("/diagnose?q=backhand");
  });

  it("shows the same continue-practice entry points for a signed-in non-study profile", async () => {
    const ProfilePage = await loadPage(() => import("@/app/profile/page"));

    mockAuthContext.user = { id: "user_1", email: "player@example.com" };
    mockAuthContext.configured = true;
    mockUserDataState.latestAssessmentResult = {
      ...getDefaultAssessmentResult(),
      level: "3.0",
      strengths: ["正手"],
      weaknesses: ["反手"],
      summary: "先把反手稳定下来。"
    } as unknown as AssessmentResultRow;
    mockUserDataState.savedPlans = [{
      id: "plan_1",
      user_id: "user_1",
      source_type: "diagnosis",
      source_label: "反手问题",
      created_at: "2026-03-29T00:00:00.000Z",
      plan_data: {
        source: "template",
        level: "3.0",
        problemTag: "backhand-into-net",
        title: "反手稳定性计划",
        target: "先把反手过网稳定住",
        days: []
      }
    }];
    mockUserDataState.diagnosisHistory = [{
      id: "diag_1",
      user_id: "user_1",
      input_text: "我反手总下网",
      matched_rule_id: "backhand-into-net",
      problem_label: "反手总下网",
      created_at: "2026-03-29T00:00:00.000Z"
    }];

    render(React.createElement(ProfilePage));

    expect(await screen.findByText("继续上次练习")).toBeInTheDocument();
    expect(screen.getByText("回看训练计划")).toBeInTheDocument();
    expect(screen.getByText("回看上次诊断")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "去看推荐内容" })
        .some((link) => link.getAttribute("href") === "/library?level=3.0")
    ).toBe(true);
    expect(screen.getAllByRole("button", { name: "查看计划" }).length).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole("link", { name: "我反手总下网" })
        .some((link) => link.getAttribute("href") === "/diagnose?q=%E6%88%91%E5%8F%8D%E6%89%8B%E6%80%BB%E4%B8%8B%E7%BD%91")
    ).toBe(true);
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
