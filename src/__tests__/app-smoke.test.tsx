import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { getDefaultAssessmentResult } from "@/lib/assessment";
import { getLocalLogs } from "@/lib/eventLogger";
import {
  STUDY_PLAN_DRAFT_KEY,
  STUDY_PROGRESS_KEY,
  STUDY_TASK_RATINGS_KEY,
  STUDY_DIAGNOSIS_SNAPSHOT_KEY,
  PENDING_STUDY_SETUP_KEY
} from "@/lib/study/config";
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
    "study.start.title": "开始研究会话",
    "study.start.subtitle": "确认参与者编号和语言后，开始一轮可导出的研究会话。",
    "study.start.button": "开始研究",
    "assessment.title": "1 分钟测一下你的水平",
    "assessment.empty.title": "先完成一次水平评估",
    "assessment.empty.subtitle": "做完后，我们会直接告诉你大概处在哪个能力区间，以及接下来更值得优先补哪一块。",
    "assessment.resumeDraft": "已恢复你刚才做到一半的评估进度。",
    "assessment.result.ctaStart": "去完成水平评估 →",
    "assessment.result.ctaPlan": "生成训练计划 →",
    "study.actionability.prompt": "完成这一步后，我比之前更清楚下一步该练什么了。",
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
    "survey.part.sus.title": "Part 1: SUS usability scale",
    "modal.close": "关闭"
  } satisfies Record<string, string>
}));

const translationMapEn = {
  "diagnose.title": "Describe your issue in one sentence",
  "diagnose.subtitle": "Describe stroke, error, and situation, then we can route your next practice step.",
  "diagnose.placeholder": "e.g. My forehand goes long on key points when they poach",
  "diagnose.result.badge": "Diagnosis",
  "diagnose.result.today": "Try this first",
  "diagnose.result.expand1": "See why and what to watch",
  "diagnose.button.start": "Start diagnosis",
  "study.actionability.prompt": "After this step, I am clearer than before about what I should practice next."
} satisfies Record<string, string>;

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
  pendingStudySetup: false,
  loading: false,
  startStudySession: vi.fn(),
  setPendingStudySetup: vi.fn(),
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

function seedCompletedAssessmentInStorage() {
  window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({
    answeredCount: 6,
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
    language: mockStudyContext.language,
    studyMode: false,
    t: (key: string, replacements?: Record<string, string | number>) => {
      const activeMap = mockStudyContext.language === "en" ? translationMapEn : translationMap;
      const template = activeMap[key] ?? key;
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
    mockStudyContext.language = "zh";
    mockStudyContext.pendingStudySetup = false;
    mockStudyContext.startStudySession.mockReset();
    mockStudyContext.setPendingStudySetup.mockReset();
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

  it("prioritizes assessment on home when no saved assessment exists", async () => {
    const HomePage = vi.importActual<typeof import("@/app/page")>("@/app/page");
    return HomePage.then(async ({ default: Page }) => {
      render(React.createElement(Page));

      expect(await screen.findByText("先完成一次水平评估")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "去完成水平评估 →" })).toHaveAttribute("href", "/assessment");
      expect(screen.queryByText("一句话，帮你找到下一步该练什么")).not.toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it("requires study start before home flow in study mode when session is missing", async () => {
    const HomePage = vi.importActual<typeof import("@/app/page")>("@/app/page");
    return HomePage.then(async ({ default: Page }) => {
      mockStudyContext.studyMode = true;
      mockStudyContext.session = null;

      render(React.createElement(Page));

      expect(await screen.findByText("开始研究会话")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "开始研究" })).toHaveAttribute("href", "/study/start");
      expect(screen.queryByText("先完成一次水平评估")).not.toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it("renders full home page after assessment is completed", async () => {
    const HomePage = vi.importActual<typeof import("@/app/page")>("@/app/page");
    return HomePage.then(async ({ default: Page }) => {
      seedCompletedAssessmentInStorage();

      render(React.createElement(Page));

      expect(await screen.findByText("一句话，帮你找到下一步该练什么")).toBeInTheDocument();
      expect(screen.getByText("💡动作、错误、场景描述越具体，诊断越准")).toBeInTheDocument();
      expect(screen.queryByText("💡 描述越具体，诊断越准")).not.toBeInTheDocument();
      expect(screen.getByText("示例")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "反手总是下网" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "一发总发不进" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "二发总双误" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "多拍对拉总不稳" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "正手一发力就出界" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "脚步总慢半拍" })).not.toBeInTheDocument();
      expect(screen.queryByText("也可以直接点一个接近的问题：")).not.toBeInTheDocument();
      expect(screen.queryByText("查看更多示例 ↓")).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /AI 诊断|video diagnosis/i })).not.toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it("keeps video diagnose hidden from the main navigation and profile surfaces", async () => {
    const { Header } = await vi.importActual<typeof import("@/components/layout/Header")>("@/components/layout/Header");
    const ProfilePage = await loadPage(() => import("@/app/profile/page"));

    mockAuthContext.user = { id: "user_1", email: "player@example.com" };
    mockAuthContext.configured = true;

    const { unmount } = render(React.createElement(Header));

    expect(screen.queryByRole("link", { name: "视频诊断" })).not.toBeInTheDocument();

    unmount();
    render(React.createElement(ProfilePage));

    await waitFor(() => {
      expect(screen.getByText("profile.diagnosis.title")).toBeInTheDocument();
    });

    expect(screen.queryByText("视频诊断记录")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "去试试视频诊断" })).not.toBeInTheDocument();
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

  it("shows the previous assessment result by default when a saved result exists", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answeredCount: 6 }));

    render(React.createElement(AssessmentPage));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/assessment/result");
    });
  });

  it("redirects home to assessment when a study session exists but assessment is incomplete", async () => {
    const HomePage = await loadPage(() => import("@/app/page"));

    mockStudyContext.studyMode = true;
    mockStudyContext.session = baseStudySession;

    render(React.createElement(HomePage));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/assessment");
    });
  });

  it("redirects assessment back to study start when study setup is pending", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    window.localStorage.setItem(PENDING_STUDY_SETUP_KEY, "true");
    mockStudyContext.pendingStudySetup = true;

    render(React.createElement(AssessmentPage));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/study/start");
    });
  });

  it("redirects library to assessment when a study session exists but assessment is incomplete", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));

    mockStudyContext.studyMode = true;
    mockStudyContext.session = baseStudySession;
    window.history.pushState({}, "", "/library");

    render(React.createElement(LibraryPage));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/assessment");
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

  it("keeps showing the previous assessment result when a retake draft exists but retake was not explicitly requested", async () => {
    const AssessmentPage = await loadPage(() => import("@/app/assessment/page"));

    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({ answeredCount: 6 }));
    window.localStorage.setItem(ASSESSMENT_DRAFT_STORAGE_KEY, JSON.stringify({
      stepIndex: 3,
      answers: { coarse_rally: 2 },
      profile: { gender: "female", yearsPlaying: 4, yearsLabel: "4 年" },
      updatedAt: "2026-03-29T00:00:00.000Z"
    }));

    render(React.createElement(AssessmentPage));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/assessment/result");
    });
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

  it("does not show the actionability prompt on assessment result in study mode", async () => {
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

    expect(await screen.findByRole("heading", { name: /3\.0/ })).toBeInTheDocument();
    expect(screen.queryByText("完成这一步后，我比之前更清楚下一步该练什么了。")).not.toBeInTheDocument();
  });

  it("renders diagnose page with input box", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));
    seedCompletedAssessmentInStorage();

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

  it("blocks diagnose and points to assessment when no saved assessment exists", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("先完成一次水平评估")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "去完成水平评估 →" })).toHaveAttribute("href", "/assessment");
    expect(screen.queryByText("说一句你的问题")).not.toBeInTheDocument();
  });

  it("requires study start before diagnose when study mode has no active session", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.studyMode = true;
    mockStudyContext.session = null;

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("开始研究会话")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "开始研究" })).toHaveAttribute("href", "/study/start");
    expect(screen.queryByText("先完成一次水平评估")).not.toBeInTheDocument();
  });

  it("shows the actionability prompt after a study diagnosis result is shown", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    seedCompletedAssessmentInStorage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "我反手总下网，一快就更容易失误" }
    });
    fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));

    expect(await screen.findByText("完成这一步后，我比之前更清楚下一步该练什么了。")).toBeInTheDocument();
  });

  it("walks through zh study diagnose flow with low-density summary by default and expanded detailed summary on demand", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    mockStudyContext.language = "zh";
    seedCompletedAssessmentInStorage();
    window.localStorage.setItem(STUDY_DIAGNOSIS_SNAPSHOT_KEY, JSON.stringify({
      inputSummary: "诊断快照：关键分正手控制不足",
      capturedAt: "2026-03-31T00:00:00.000Z",
      matchedRuleId: "rule_forehand_out",
      matchScore: 22,
      confidence: "中等",
      effortMode: "standard",
      evidenceLevel: "medium",
      needsNarrowing: false,
      narrowingPrompts: [],
      narrowingSuggestions: [],
      refusalReasonCodes: [],
      missingEvidenceSlots: [],
      primaryNextStep: "关键分先把球打高深中路，不要先追求一拍穿越。",
      problemTag: "forehand-out",
      category: ["forehand"],
      title: "关键分下的正手出界更明显",
      summary: "先做主动作：关键分先把球打高深中路，不要先追求一拍穿越。",
      detailedSummary: "你的主问题仍是正手出界，在关键分和对手上网时更明显，先保住高深中路再考虑变线。",
      causes: ["关键分时过早发力"],
      fixes: ["关键分先保高深中路"],
      drills: ["关键分场景正手 12 组"],
      recommendedContentIds: ["content_cn_d_01"],
      fallbackUsed: false,
      fallbackMode: null,
      level: "3.0"
    }));

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("最近一次诊断快照")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重演本次判断" }));

    expect(await screen.findByText(/先做主动作：/)).toBeInTheDocument();
    expect(screen.queryByText("展开说明")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "diagnose.result.expand1" }));

    expect(await screen.findByText("展开说明")).toBeInTheDocument();
    expect(screen.getByText("你的主问题仍是正手出界，在关键分和对手上网时更明显，先保住高深中路再考虑变线。")).toBeInTheDocument();
  });

  it("walks through en study diagnose flow with low-density summary by default and expanded detailed summary on demand", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = {
      ...baseStudySession,
      language: "en",
      condition: "lang_en"
    };
    mockStudyContext.studyMode = true;
    mockStudyContext.language = "en";
    seedCompletedAssessmentInStorage();
    window.localStorage.setItem(STUDY_DIAGNOSIS_SNAPSHOT_KEY, JSON.stringify({
      inputSummary: "Diagnosis snapshot: Forehand control under pressure",
      capturedAt: "2026-03-31T00:00:00.000Z",
      matchedRuleId: "rule_forehand_out",
      matchScore: 23,
      confidence: "中等",
      effortMode: "standard",
      evidenceLevel: "medium",
      needsNarrowing: false,
      narrowingPrompts: [],
      narrowingSuggestions: [],
      refusalReasonCodes: [],
      missingEvidenceSlots: [],
      primaryNextStep: "Play higher and deeper through the middle first on key points.",
      problemTag: "forehand-out",
      category: ["forehand"],
      title: "Forehand errors show up more on key points",
      summary: "Primary next step: Play higher and deeper through the middle first on key points.",
      detailedSummary: "The core issue is still forehand control, and it gets worse on key points when the opponent is at net because pressure increases overhitting.",
      causes: ["Rushed swing under pressure"],
      fixes: ["Raise margin before changing direction"],
      drills: ["12 key-point forehand sequences"],
      recommendedContentIds: ["content_cn_d_01"],
      fallbackUsed: false,
      fallbackMode: null,
      level: "3.0"
    }));

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("Latest diagnosis snapshot")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Replay this diagnosis" }));

    expect(await screen.findByText(/Primary next step:/)).toBeInTheDocument();
    expect(screen.queryByText("Expanded reasoning")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "See why and what to watch" }));

    expect(await screen.findByText("Expanded reasoning")).toBeInTheDocument();
    expect(screen.getByText("The core issue is still forehand control, and it gets worse on key points when the opponent is at net because pressure increases overhitting.")).toBeInTheDocument();
  });

  it("stores the exact diagnose query path in study progress after a study diagnosis", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    seedCompletedAssessmentInStorage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "我反手总下网，一快就更容易失误" }
    });
    fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));

    await screen.findByText("完成这一步后，我比之前更清楚下一步该练什么了。");

    const studyProgress = JSON.parse(window.localStorage.getItem(STUDY_PROGRESS_KEY) ?? "null");
    expect(studyProgress?.lastVisitedPath).toBe("/diagnose?q=%E6%88%91%E5%8F%8D%E6%89%8B%E6%80%BB%E4%B8%8B%E7%BD%91%EF%BC%8C%E4%B8%80%E5%BF%AB%E5%B0%B1%E6%9B%B4%E5%AE%B9%E6%98%93%E5%A4%B1%E8%AF%AF");
  });

  it("replays the latest diagnosis snapshot without restoring raw input text", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    seedCompletedAssessmentInStorage();
    window.localStorage.setItem(STUDY_DIAGNOSIS_SNAPSHOT_KEY, JSON.stringify({
      inputSummary: "诊断快照：反手稳定性不足",
      capturedAt: "2026-03-31T00:00:00.000Z",
      matchedRuleId: "rule_backhand_into_net",
      matchScore: 16,
      confidence: "中等",
      effortMode: "standard",
      evidenceLevel: "medium",
      needsNarrowing: false,
      narrowingPrompts: [],
      narrowingSuggestions: [],
      refusalReasonCodes: [],
      missingEvidenceSlots: [],
      primaryNextStep: "更早转肩，提前准备",
      problemTag: "backhand-into-net",
      category: ["backhand"],
      title: "反手稳定性不足",
      summary: "你现在最值得先改的是反手准备节奏。",
      causes: ["准备偏晚"],
      fixes: ["更早转肩，提前准备"],
      drills: ["转肩准备 20 次"],
      recommendedContentIds: ["content_cn_a_01"],
      fallbackUsed: false,
      fallbackMode: null,
      level: "3.0"
    }));

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("最近一次诊断快照")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重演本次判断" }));

    expect(await screen.findByText("反手稳定性不足")).toBeInTheDocument();
    expect(screen.getByText("更早转肩，提前准备")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("反手总下网")).not.toBeInTheDocument();
  });

  it("keeps the plan CTA primary in study mode while library and rankings stay available after expand", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    seedCompletedAssessmentInStorage();

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

  it("does not render why-recommended content details on diagnosis recommendation cards", async () => {
    const DiagnosePage = await loadPage(() => import("@/app/diagnose/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    seedCompletedAssessmentInStorage();

    render(React.createElement(DiagnosePage));

    fireEvent.change(await screen.findByPlaceholderText(/我反手总下网/), {
      target: { value: "我反手总下网，一快就更容易失误" }
    });
    fireEvent.click(screen.getByRole("button", { name: "diagnose.button.start" }));
    fireEvent.click(await screen.findByRole("button", { name: "diagnose.result.expand1" }));

    expect(screen.queryByRole("button", { name: "为什么推荐这个" })).not.toBeInTheDocument();
    expect(screen.queryByText(/推荐依据:/)).not.toBeInTheDocument();
    expect(getLocalLogs().some((entry) => entry.eventName === "diagnose.why_this_viewed" && entry.payload.targetType === "content")).toBe(false);
  });

  it("renders library page and shows non-empty content list", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));
    seedCompletedAssessmentInStorage();

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /打开视频：|Open video:/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("查看更多")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("blocks library and points to assessment when no saved assessment exists", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("先完成一次水平评估")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "去完成水平评估 →" })).toHaveAttribute("href", "/assessment");
    expect(screen.queryByText("找内容")).not.toBeInTheDocument();
  });

  it("reveals a lightweight why-recommended explanation on library content cards", async () => {
    const LibraryPage = await loadPage(() => import("@/app/library/page"));
    seedCompletedAssessmentInStorage();

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
    seedCompletedAssessmentInStorage();

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
    seedCompletedAssessmentInStorage();

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

  it("restores the latest plan draft when opening plan without query params", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockSearchParams = new URLSearchParams("");
    window.localStorage.setItem(STUDY_PLAN_DRAFT_KEY, JSON.stringify({
      problemTag: "backhand-into-net",
      level: "3.0",
      preferredContentIds: ["content_cn_a_01"],
      sourceType: "diagnosis",
      primaryNextStep: "先把引拍提前半拍再出手",
      updatedAt: "2026-03-31T00:00:00.000Z"
    }));
    window.history.pushState({}, "", "/plan");

    render(React.createElement(PlanPage));

    expect(await screen.findByText("你的 7 天提升计划")).toBeInTheDocument();
    expect(screen.getAllByText("先把引拍提前半拍再出手").length).toBeGreaterThan(0);
  });

  it("shows the exact diagnosis primary next step as the plan summary headline", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));
    const primaryNextStep = "关键分先把球打高深中路，不要先追求一拍穿越。";

    mockSearchParams = new URLSearchParams(
      `problemTag=forehand-out&level=3.0&source=diagnosis&primaryNextStep=${encodeURIComponent(primaryNextStep)}`
    );
    window.history.pushState({}, "", `/plan?${mockSearchParams.toString()}`);

    render(React.createElement(PlanPage));

    expect(await screen.findByText("你的 7 天提升计划")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: primaryNextStep })).toBeInTheDocument();
  });

  it("shows the actionability prompt on plan page in study mode", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    seedCompletedAssessmentInStorage();
    mockSearchParams = new URLSearchParams(
      "problemTag=backhand-into-net&level=3.0&source=diagnosis&contentIds=content_cn_a_01"
    );
    window.history.pushState({}, "", `/plan?${mockSearchParams.toString()}`);

    render(React.createElement(PlanPage));

    expect(await screen.findByText("完成这一步后，我比之前更清楚下一步该练什么了。")).toBeInTheDocument();
  });

  it("offers diagnose and profile follow-up CTAs for an assessment-based study plan", async () => {
    const PlanPage = await loadPage(() => import("@/app/plan/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    seedCompletedAssessmentInStorage();
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
    seedCompletedAssessmentInStorage();
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
    expect(screen.queryByText("完成这一步后，我比之前更清楚下一步该练什么了。")).not.toBeInTheDocument();
  });

  it("renders profile page login prompt when user is not signed in", () => {
    return loadPage(() => import("@/app/profile/page")).then((ProfilePage) => {
      render(React.createElement(ProfilePage));

      expect(screen.getByText("登录后查看你的记录")).toBeInTheDocument();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it("prioritizes the completed assessment result over an unfinished retake draft in study mode", async () => {
    const ProfilePage = await loadPage(() => import("@/app/profile/page"));

    mockStudyContext.session = baseStudySession;
    mockStudyContext.studyMode = true;
    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify({
      ...getDefaultAssessmentResult("zh"),
      answeredCount: 8,
      totalQuestions: 8,
      level: "3.0"
    }));
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
    expect(screen.getAllByRole("link", { name: "回到评估结果" }).every((link) => link.getAttribute("href") === "/assessment/result")).toBe(true);
    expect(screen.queryByRole("link", { name: "继续未完成评估" })).not.toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: /SUS/ })).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders study start with the coach-history and preferred-learning-style background questions", async () => {
    const StudyStartPage = await loadPage(() => import("@/app/study/start/page"));

    render(React.createElement(StudyStartPage));

    expect(screen.getByText("你有没有请过教练？")).toBeInTheDocument();
    expect(screen.getByText("你更倾向于通过以下哪种方式学习网球？")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("starts the study session and routes directly to assessment", async () => {
    const StudyStartPage = await loadPage(() => import("@/app/study/start/page"));

    mockStudyContext.startStudySession.mockResolvedValue({ session: baseStudySession });

    render(React.createElement(StudyStartPage));

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ptest" } });
    fireEvent.change(screen.getByLabelText("年龄区间"), { target: { value: "25_34" } });
    fireEvent.change(screen.getByLabelText("打球年限"), { target: { value: "5_10" } });
    fireEvent.change(screen.getByLabelText("每周打球频率"), { target: { value: "3_4" } });
    fireEvent.change(screen.getByLabelText("自我判断水平"), { target: { value: "4.0_or_above" } });
    fireEvent.change(screen.getByLabelText("你有没有请过教练？"), { target: { value: "occasional" } });
    fireEvent.change(screen.getByLabelText("你更倾向于通过以下哪种方式学习网球？"), { target: { value: "self_study" } });
    fireEvent.click(screen.getAllByRole("button", { name: "是" })[0]!);
    fireEvent.click(screen.getAllByRole("button", { name: "是" })[1]!);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "开始研究" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/assessment");
    });
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
