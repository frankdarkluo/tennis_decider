import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import AssessmentPage from "@/app/assessment/page";
import DiagnosePage from "@/app/diagnose/page";
import VideoDiagnosePage from "@/app/video-diagnose/page";
import LibraryPage from "@/app/library/page";
import RankingsPage from "@/app/rankings/page";
import PlanPage from "@/app/plan/page";
import ProfilePage from "@/app/profile/page";
import StudyPage from "@/app/study/page";
import SurveyPage from "@/app/survey/page";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { calculateSUS } from "@/lib/survey";

const { mockPush, mockRedirect, translationMap } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRedirect: vi.fn(),
  translationMap: {
    "home.hero.title": "一句话，帮你找到下一步该练什么",
    "assessment.title": "1 分钟测一下你的水平",
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
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => mockSearchParamsAdapter,
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
  useStudy: () => ({
    session: null,
    studyMode: false,
    language: "zh",
    loading: false,
    startStudySession: vi.fn(),
    endStudySession: vi.fn(),
    clearStudyData: vi.fn()
  }),
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
    mockSearchParams = new URLSearchParams();
    window.localStorage.clear();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });

  it("renders home page without crashing", () => {
    render(React.createElement(HomePage));

    expect(screen.getByText("一句话，帮你找到下一步该练什么")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders assessment page and allows stepping through the simplified flow", async () => {
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

  it("renders diagnose page with input box", async () => {
    render(React.createElement(DiagnosePage));

    expect(await screen.findByPlaceholderText(/我反手总下网/)).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders library page and shows non-empty content list", async () => {
    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /打开视频：|Open video:/i }).length).toBeGreaterThan(0);
    expect(screen.getByText("查看更多")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders video diagnose page without crashing", async () => {
    render(React.createElement(VideoDiagnosePage));

    expect(await screen.findByText("上传视频，我来帮你看问题")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders rankings page without crashing", () => {
    render(React.createElement(RankingsPage));

    expect(screen.getByText("博主榜")).toBeInTheDocument();
    expect(screen.getByText("盖奥网球")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders plan page without crashing", async () => {
    mockSearchParams = new URLSearchParams("problemTag=backhand-into-net&level=3.0");

    render(React.createElement(PlanPage));

    expect(await screen.findByText("你的 7 天提升计划")).toBeInTheDocument();
    expect(screen.getByText("这 7 天先练这一件事")).toBeInTheDocument();
    expect(screen.getByText("Day 1 · 今天")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders profile page login prompt when user is not signed in", () => {
    render(React.createElement(ProfilePage));

    expect(screen.getByText("登录后查看你的记录")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders survey page without crashing", () => {
    render(React.createElement(SurveyPage));

    expect(screen.getByText("TennisLevel 使用体验问卷")).toBeInTheDocument();
    expect(screen.getByText("Part 2：SUS 系统可用性量表")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("redirects /study to /study/start", async () => {
    render(React.createElement(StudyPage));

    expect(mockRedirect).toHaveBeenCalledWith("/study/start");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("calculates SUS score using the standard formula", () => {
    expect(calculateSUS([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });
});
